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
const IMPORT_RE = /^\s*import\s+(?:\{[^}]*\}|[\w$]+|\*\s+as\s+[\w$]+)?\s*(?:,\s*\{[^}]*\})?\s*from\s+["'](@\/lib\/[^"']+)["']/gm;
const SERVER_ONLY_RE = /^\s*import\s+["']server-only["']\s*;?/m;

function isServerOnlyModule(absPath) {
  let src;
  try { src = readFileSync(absPath, "utf8"); } catch { return false; }
  const head = src.split("\n").slice(0, 30).join("\n");
  return SERVER_ONLY_RE.test(head);
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

for (const file of allFiles) {
  let src;
  try { src = readFileSync(file, "utf8"); } catch { continue; }
  if (!USE_CLIENT_RE.test(src)) continue;
  clientFileCount++;

  IMPORT_RE.lastIndex = 0;
  let match;
  while ((match = IMPORT_RE.exec(src)) !== null) {
    const importedPath = match[1];
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
  console.error("Fix: extract the shared data to a zero-deps file (no `import 'server-only'`).");
  process.exit(1);
}

console.log(
  `[check-client-imports-no-server-only] OK — ${clientFileCount} "use client" file(s) scanned, no @/lib/ imports cross the server-only boundary.`,
);
