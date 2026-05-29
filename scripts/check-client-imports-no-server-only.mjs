#!/usr/bin/env node
/**
 * "use client" → "server-only" import gate.
 *
 * Cross-stack port from cannagent v6.2505 + GW v2.97.D4. Bug class:
 * `"use client"` component imports a module that has
 * `import "server-only"`. Next.js refuses to bundle this — build errors
 * with `'server-only' cannot be imported from a Client Component module`.
 * pnpm typecheck CLEAN; only Vercel build catches it.
 *
 * Cannagent v6.2305 incident: 4 consecutive Vercel prod deploys errored
 * over 40+ minutes before discovery. Scc has 5+ server-only files
 * (rewards-session + welcome-email + order-confirmation-email + learn-db
 * + email) — preventive port locks the class.
 *
 * Scans .tsx/.ts files with "use client" at top, parses @/lib imports,
 * resolves to lib/, checks for `import "server-only"`. Flags violations.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const REPO_ROOT = process.cwd();

function walk(dir) {
  const out = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const entry of entries) {
    if (entry === "node_modules" || entry === ".next" || entry === "__tests__") continue;
    const full = join(dir, entry);
    let s;
    try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) out.push(...walk(full));
    else if (entry.endsWith(".tsx") || entry.endsWith(".ts")) out.push(full);
  }
  return out;
}

const USE_CLIENT_RE = /^(?:\/\/[^\n]*\n|\s*\n)*\s*["']use client["']\s*;?/;
// IMPORT_RE captures: group 1 = import clause (between `import` and `from`),
// group 2 = module path. The clause is then classified by
// isValueBearingImportClause() so type-only imports (which erase at runtime
// and do NOT drag the module into the client bundle) are correctly skipped.
const IMPORT_RE = /^\s*import\s+([^;]*?)\s*from\s+["'](@\/lib\/[^"']+)["']/gm;
const SERVER_ONLY_RE = /^\s*import\s+["']server-only["']\s*;?/m;

// Opt-out marker comment — for rare intentional cross-boundary imports
// where the value is known-safe (e.g. never executes client-side).
const OPT_OUT_RE = /\/\/\s*server-only-client-bundle:intentional/;

function isServerOnlyModule(absPath) {
  let src;
  try { src = readFileSync(absPath, "utf8"); } catch { return false; }
  const head = src.split("\n").slice(0, 30).join("\n");
  return SERVER_ONLY_RE.test(head);
}

/**
 * Classify an import clause as value-bearing or pure-type.
 *
 * Returns true if the clause drags the module into the client bundle
 * (i.e. has at least one value import). Returns false if the clause is
 * pure type-only (erases at runtime).
 *
 * Shapes:
 *   `import type { Foo } from ...`            → pure type (false)
 *   `import type Foo from ...`                → pure type (false)
 *   `import { type Foo } from ...`            → pure type (false) iff ALL members are `type X`
 *   `import { type Foo, type Bar } from ...`  → pure type (false)
 *   `import { Foo } from ...`                 → value (true)
 *   `import { Foo, type Bar } from ...`       → value (true) — Foo is a value
 *   `import Foo from ...`                     → value (true)
 *   `import * as Foo from ...`                → value (true) — namespace bind is a value
 *
 * VRG-port hardening (fleet-leading) — prevents the false-positive class
 * where `import { type Foo } from "@/lib/server-only-x"` gets flagged
 * despite being safe (types erase at runtime, no bundle drag).
 */
function isValueBearingImportClause(clause) {
  const c = clause.trim();

  // `import type ...` form — pure type regardless of what follows.
  if (/^type\s+/.test(c)) return false;

  // Find the braced specifiers block, if any.
  const braceMatch = c.match(/\{([^}]*)\}/);

  // Identify a leading default binding (before the brace or comma).
  let defaultBinding = null;
  if (braceMatch) {
    const beforeBrace = c.slice(0, braceMatch.index).trim().replace(/,\s*$/, "").trim();
    if (beforeBrace.length > 0) defaultBinding = beforeBrace;
  } else {
    defaultBinding = c;
  }

  // A default binding (not type-prefixed) is a value.
  if (defaultBinding && !/^type\s+/.test(defaultBinding)) {
    if (/^\*\s+as\s+[\w$]+/.test(defaultBinding)) return true;
    if (/^[\w$]+$/.test(defaultBinding)) return true;
  }

  // Now check brace members, if any.
  if (braceMatch) {
    const members = braceMatch[1]
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    // If any member is NOT prefixed with `type `, it's a value import.
    for (const m of members) {
      if (!/^type\s+/.test(m)) return true;
    }
    // All members are `type Foo` → pure type.
    return false;
  }

  // No brace, no default binding — be safe.
  return true;
}

function resolveAtLib(modulePath) {
  const rel = modulePath.replace(/^@\//, "");
  const tries = [
    join(REPO_ROOT, rel + ".ts"),
    join(REPO_ROOT, rel + ".tsx"),
    join(REPO_ROOT, rel, "index.ts"),
    join(REPO_ROOT, rel, "index.tsx"),
  ];
  for (const p of tries) {
    try { statSync(p); return p; } catch { /* try next */ }
  }
  return null;
}

const SCAN_DIRS = ["app", "components", "lib"].map((d) => join(REPO_ROOT, d));
const allFiles = SCAN_DIRS.flatMap(walk);
const violations = [];
let clientFileCount = 0;
let optOutFileCount = 0;
let typeOnlyImportSkipCount = 0;

for (const file of allFiles) {
  let src;
  try { src = readFileSync(file, "utf8"); } catch { continue; }
  if (!USE_CLIENT_RE.test(src)) continue;
  clientFileCount++;

  if (OPT_OUT_RE.test(src)) {
    optOutFileCount++;
    continue;
  }

  IMPORT_RE.lastIndex = 0;
  let match;
  while ((match = IMPORT_RE.exec(src)) !== null) {
    const clause = match[1];
    const importedPath = match[2];

    // Type-only-import distinction — pure type imports erase at runtime,
    // do not drag the module into the client bundle, do not trigger the
    // server-only-from-client-component build error. Skip.
    if (!isValueBearingImportClause(clause)) {
      typeOnlyImportSkipCount++;
      continue;
    }

    const resolved = resolveAtLib(importedPath);
    if (!resolved) continue;
    if (isServerOnlyModule(resolved)) {
      const lineNumber = src.slice(0, match.index).split("\n").length;
      violations.push({
        clientFile: relative(REPO_ROOT, file).split(sep).join("/"),
        clientLine: lineNumber,
        importedPath,
        resolvedFile: relative(REPO_ROOT, resolved).split(sep).join("/"),
        snippet: match[0].trim(),
      });
    }
  }
}

if (violations.length > 0) {
  console.error(
    `\n✗ check-client-imports-no-server-only — ${violations.length} "use client" → "server-only" import(s) found:\n`,
  );
  for (const v of violations) {
    console.error(`  ${v.clientFile}:${v.clientLine}`);
    console.error(`    ${v.snippet}`);
    console.error(`    ↳ ${v.resolvedFile} has \`import "server-only"\``);
  }
  console.error("\nWhy: Next.js refuses to bundle this. pnpm typecheck CLEAN; only Vercel build catches it.");
  console.error("");
  console.error("Fix recipes:");
  console.error("  1. If you only need the TYPE, change to:");
  console.error('       import type { Foo } from "@/lib/x";');
  console.error('     (or `import { type Foo } from "@/lib/x";`)');
  console.error("     Type-only imports erase at runtime — safe to cross the boundary.");
  console.error("  2. If you need the VALUE, extract to a zero-deps file (no `import 'server-only'`).");
  console.error("  3. If intentional (rare), add `// server-only-client-bundle:intentional <reason>`");
  console.error("     anywhere in the client component file body.");
  process.exit(1);
}

console.log(
  `[check-client-imports-no-server-only] OK — ${clientFileCount} "use client" file(s) scanned (${optOutFileCount} opt-out, ${typeOnlyImportSkipCount} type-only imports skipped), no value-imports cross the server-only boundary.`,
);
