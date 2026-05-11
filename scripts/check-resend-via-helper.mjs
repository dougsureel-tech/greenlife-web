#!/usr/bin/env node
//
// check-resend-via-helper — pre-push gate.
//
// Cross-stack port from cannagent v6.0865 + VRG v9.6.93 + GW. Asserts
// that no NEW caller instantiates the Resend SDK directly via
// `new Resend(...)`. The canonical path is `lib/email.ts` which
// centralizes FROM-address SSoT, error mapping, and PII-safe logging.
//
// Allowlist: lib/email.ts (THE helper). Any new bypass must either
// extend the helper or be added here with a justification comment.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const REPO_ROOT = process.cwd();

const ALLOWLIST = new Set([
  "lib/email.ts",
]);

const SKIP_DIRS = new Set(["node_modules", ".next", "__tests__"]);
const SCAN_EXTS = new Set([".ts", ".tsx"]);
const SKIP_FILES = new Set([
  "lib/version.ts", // release-note prose may reference `new Resend(` in changelog text
]);

const SCAN_ROOTS = ["app", "lib", "components"];

function walk(dir) {
  const out = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) out.push(...walk(full));
    else {
      const dot = entry.lastIndexOf(".");
      if (dot < 0) continue;
      if (SCAN_EXTS.has(entry.slice(dot))) out.push(full);
    }
  }
  return out;
}

const files = SCAN_ROOTS.flatMap((d) => walk(join(REPO_ROOT, d)));
const violations = [];

for (const file of files) {
  const rel = relative(REPO_ROOT, file).split(sep).join("/");
  if (SKIP_FILES.has(rel)) continue;
  const content = readFileSync(file, "utf8");
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(\/\/|\*)/.test(line)) continue;
    if (/\bnew\s+Resend\s*\(/.test(line)) {
      if (!ALLOWLIST.has(rel)) {
        violations.push({ file: rel, line: i + 1, snippet: line.trim() });
      }
      break;
    }
  }
}

// Reverse defense: allowlist entry that no longer contains `new Resend(`
// is a stale entry.
const stale = [];
for (const allowed of ALLOWLIST) {
  const abs = join(REPO_ROOT, allowed);
  let content;
  try { content = readFileSync(abs, "utf8"); } catch {
    stale.push({ file: allowed, reason: "file does not exist" });
    continue;
  }
  if (!/\bnew\s+Resend\s*\(/.test(content)) {
    stale.push({
      file: allowed,
      reason: "no `new Resend(` in file — allowlist entry can be removed",
    });
  }
}

if (violations.length > 0 || stale.length > 0) {
  if (violations.length > 0) {
    console.error(
      `[check-resend-via-helper] VIOLATIONS — ${violations.length} non-allowlisted file(s) instantiate Resend directly:`,
    );
    for (const v of violations) {
      console.error(`  - ${v.file}:${v.line}`);
      console.error(`      ${v.snippet}`);
    }
    console.error("\nFix: route through the helper exports in `@/lib/email`.");
  }
  if (stale.length > 0) {
    console.error(
      `\n[check-resend-via-helper] STALE ALLOWLIST — ${stale.length} entry/entries:`,
    );
    for (const s of stale) {
      console.error(`  - ${s.file}: ${s.reason}`);
    }
  }
  process.exit(1);
}

console.log(
  `[check-resend-via-helper] OK — ${files.length} files scanned, ${ALLOWLIST.size} allowlisted sites verified, no new bypasses.`,
);
