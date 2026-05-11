#!/usr/bin/env node
//
// check-server-action-silent-fail — pre-deploy gate.
//
// Cross-stack port from cannagent v6.3805 + GW v2.97.D6. Bug class:
// Next 16 prod silently swallows server-action `throw` AND silent-`return;`
// bails leave the UI with no signal. User clicks Save / Mark Done →
// form does nothing visible.
//
// Canonical fix: redirect with `?surface_err=code` OR return ActionResult
// tuple `{ ok: false, error: "<reason>" }`.
//
// Per-line opt-out: `// silent-fail-ok: <reason>` trailing comment.
// Per-file opt-out: `// silent-fail-ok-file: <reason>` in first 50 lines.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const REPO_ROOT = process.cwd();
const SCAN_ROOTS = ["app", "lib"];

const BARE_RETURN_RE = /^\s*return\s*;\s*(?:\/\/.*)?$/;
const THROW_NEW_ERROR_RE = /^\s*throw\s+new\s+Error\s*\(/;
const NEXT_REDIRECT_RETHROW_RE = /err\.message\s*===?\s*["']NEXT_REDIRECT["']/;
const LINE_OPT_OUT_RE = /\/\/\s*silent-fail-ok:/;
const FILE_OPT_OUT_RE = /\/\/\s*silent-fail-ok-file:/;

function walk(dir) {
  const out = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const entry of entries) {
    if (entry === "__tests__" || entry === "node_modules" || entry === ".next") continue;
    const full = join(dir, entry);
    let s;
    try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) out.push(...walk(full));
    else if (
      s.isFile() &&
      (entry.endsWith(".ts") || entry.endsWith(".tsx")) &&
      !entry.endsWith(".test.ts") &&
      !entry.endsWith(".test.tsx") &&
      !entry.endsWith(".spec.ts")
    ) {
      out.push(full);
    }
  }
  return out;
}

function hasUseServerDirective(content) {
  const lines = content.split("\n");
  let inBlockComment = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (inBlockComment) {
      if (trimmed.includes("*/")) inBlockComment = false;
      continue;
    }
    if (!trimmed) continue;
    if (trimmed.startsWith("//")) continue;
    if (trimmed.startsWith("/*")) {
      if (!trimmed.includes("*/")) inBlockComment = true;
      continue;
    }
    return /^["']use server["'];?$/.test(trimmed);
  }
  return false;
}

const files = SCAN_ROOTS.flatMap((d) => walk(join(REPO_ROOT, d)));
const offenders = [];

for (const f of files) {
  let content;
  try { content = readFileSync(f, "utf8"); } catch { continue; }
  if (!hasUseServerDirective(content)) continue;

  const rel = relative(REPO_ROOT, f);
  const lines = content.split("\n");
  const headerSlice = lines.slice(0, 50).join("\n");
  if (FILE_OPT_OUT_RE.test(headerSlice)) continue;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const stripped = line.split("//")[0].trim();
    if (!stripped) continue;
    if (LINE_OPT_OUT_RE.test(line)) continue;

    if (BARE_RETURN_RE.test(line)) {
      offenders.push({ file: rel, line: i + 1, kind: "bare-return", content: line.trim() });
      continue;
    }
    if (THROW_NEW_ERROR_RE.test(line)) {
      const lookback = lines.slice(Math.max(0, i - 3), i).join("\n");
      if (NEXT_REDIRECT_RETHROW_RE.test(lookback)) continue;
      offenders.push({ file: rel, line: i + 1, kind: "throw-new-error", content: line.trim() });
    }
  }
}

const warnOnly = process.argv.includes("--warn");

if (offenders.length > 0) {
  const log = warnOnly ? console.warn : console.error;
  log(
    `[check-server-action-silent-fail] ${warnOnly ? "WARN" : "VIOLATIONS"} — ${offenders.length} silent-fail/throw pattern(s) in "use server" files:`,
  );
  for (const o of offenders) {
    log(`  ${o.file}:${o.line}  [${o.kind}]`);
    log(`    ${o.content}`);
  }
  log("");
  log("  Next 16 prod silently swallows server-action throws. Bare `return;` leaves UI with no signal.");
  log("  Fix: redirect with ?<surface>_err=<code>, OR return ActionResult tuple.");
  log("  Opt-out: `// silent-fail-ok: <reason>` trailing comment.");
  log("  Memory: feedback_server_action_throw_masked_in_prod");

  if (warnOnly) process.exit(0);
  process.exit(1);
}

const serverFileCount = files.filter((f) => {
  try { return hasUseServerDirective(readFileSync(f, "utf8")); } catch { return false; }
}).length;
console.log(
  `[check-server-action-silent-fail] OK — ${serverFileCount} "use server" file(s) scanned, no silent-fail/throw patterns.`,
);
