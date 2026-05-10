#!/usr/bin/env node
//
// check-pii-console-leak — pre-push gate.
//
// Catches `console.error("...", err)` where `err` is the raw Error object.
// Vercel function logs are NOT BAA-covered. SDK errors echo customer-supplied
// bound parameters (email, phone, order data) into err.message — passing raw
// err to console.* leaks PII into Vercel logs.
//
// Fix: console.error(`[label] message`, err instanceof Error ? err.name : String(err));
//
// Class history (ported from CannAgent):
//   v3.350 — root error.tsx + admin error pages
//   v4.235-v4.835 — API routes (SMS, email, auth, webhooks)
//
// glw port: walks app/, components/, lib/ (no src/ wrapper).

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const REPO_ROOT = process.cwd();

const RAW_ERR_RE = /console\.(error|log|warn)\s*\([^)]*,\s+(?:err|error|e|caught|rowErr|sendErr|fetchErr|dbErr|parseErr)\s*\)\s*;/;

const ALLOWLIST = new Set();

function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry === "__tests__" || entry === "node_modules" || entry === ".next") continue;
    const full = join(dir, entry);
    let s;
    try {
      s = statSync(full);
    } catch {
      continue;
    }
    if (s.isDirectory()) {
      out.push(...walk(full));
    } else if (
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

const SCAN_DIRS = ["app", "components", "lib"].map((d) => join(REPO_ROOT, d));
const files = SCAN_DIRS.flatMap(walk);
const offenders = [];

for (const f of files) {
  const rel = relative(REPO_ROOT, f);
  if (ALLOWLIST.has(rel)) continue;
  let content;
  try {
    content = readFileSync(f, "utf8");
  } catch {
    continue;
  }
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (RAW_ERR_RE.test(line)) {
      offenders.push({ file: rel, line: i + 1, content: line.trim() });
    }
  }
}

if (offenders.length > 0) {
  console.error("[check-pii-console-leak] VIOLATIONS — raw err passed to console.*:");
  console.error("");
  for (const o of offenders) {
    console.error(`  ${o.file}:${o.line}`);
    console.error(`    ${o.content}`);
  }
  console.error("");
  console.error("  Vercel function logs are NOT BAA-covered — SDK errors echo customer PII.");
  console.error('  Fix: err instanceof Error ? err.name : String(err)');
  console.error("");
  process.exit(1);
}

console.log(
  `[check-pii-console-leak] OK — ${files.length} TS/TSX files scanned, no raw \`err\` passed to console.*.`,
);
