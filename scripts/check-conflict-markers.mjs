#!/usr/bin/env node
//
// check-conflict-markers — pre-build gate.
//
// Asserts that no source file contains an UNRESOLVED git merge-conflict
// marker triple. Sister of inv check-conflict-markers (incident
// 2026-05-08 01:00 UTC: a CustomerLookup.tsx with `<<<<<<<` / `=======`
// / `>>>>>>>` markers committed to inv main blocked all Vercel builds
// for 3+ hours / 9+ commits before root-cause was diagnosed).
//
// Why a separate gate (not just tsc): conflict markers are at the
// JS-parser level, BEFORE tsc runs. Vercel's build pipeline rejects
// the file with "Parsing ecmascript source code failed". Pre-push tsc
// looks clean while the actual deploy fails.
//
// False-positive avoidance: requires the FULL marker TRIPLE (all three
// of `<<<<<<<`, `=======`, `>>>>>>>`) in the same file. Legitimate
// fixtures rarely combine all three; when they do (parser tests), they
// go in __tests__/fixtures which we skip.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SCAN_DIRS = ["app", "components", "lib", "scripts"];
const SKIP_DIRS = new Set(["node_modules", ".next", "fixtures", "__tests__"]);
// Files where conflict-marker-LIKE strings legitimately appear (this
// script checking itself, etc.).
const SKIP_FILES = new Set([
  "scripts/check-conflict-markers.mjs",
]);
const SCAN_EXTS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".css",
  ".html",
  ".json",
]);

function findFiles(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      out.push(...findFiles(full));
    } else {
      const dot = entry.lastIndexOf(".");
      if (dot < 0) continue;
      const ext = entry.slice(dot);
      if (SCAN_EXTS.has(ext)) out.push(full);
    }
  }
  return out;
}

// Anchored at line-start. `<<<<<<<` and `>>>>>>>` are exactly 7 chars +
// at-least-one-trailing-char (label). `=======` is the bare divider on
// its own line.
const RE_LEFT = /^<{7} \S/m;
const RE_DIVIDER = /^={7}$/m;
const RE_RIGHT = /^>{7} \S/m;
const RE_DIFF3 = /^\|{7} \S/m;

function checkFile(file) {
  let source;
  try {
    source = readFileSync(file, "utf8");
  } catch {
    return null;
  }
  const hasLeft = RE_LEFT.test(source);
  if (!hasLeft) return null;
  const hasDivider = RE_DIVIDER.test(source);
  const hasRight = RE_RIGHT.test(source);
  const hasDiff3 = RE_DIFF3.test(source);
  if ((hasRight || hasDiff3) && hasDivider) {
    return { file, hasDiff3 };
  }
  return null;
}

function main() {
  const offenders = [];
  const allFiles = SCAN_DIRS.flatMap((d) => findFiles(d));

  for (const file of allFiles) {
    if (SKIP_FILES.has(file)) continue;
    const r = checkFile(file);
    if (r) offenders.push(r);
  }

  if (offenders.length > 0) {
    console.error(
      `[check-conflict-markers] ✗ ${offenders.length} file(s) contain unresolved git merge-conflict markers:`,
    );
    for (const o of offenders) {
      console.error(`  - ${o.file}${o.hasDiff3 ? " (diff3-mode)" : ""}`);
    }
    console.error(
      `\nFix recipe:\n` +
        `  1. Open the file in your editor.\n` +
        `  2. Find the \`<<<<<<<\` / \`=======\` / \`>>>>>>>\` block.\n` +
        `  3. Pick the right side (or merge by hand) and delete the markers.\n` +
        `  4. Re-stage + re-run the gate.\n` +
        `\nWhy this matters: Vercel's build pipeline parses each source\n` +
        `file BEFORE tsc runs, so unresolved markers fail the deploy at\n` +
        `the parser layer with "Parsing ecmascript source code failed."\n` +
        `Pre-push tsc runs CLEAN while the actual deploy fails — the\n` +
        `inv 2026-05-08 01:00 UTC incident stalled the deploy queue for\n` +
        `3+ hours / 9+ commits before the root cause was diagnosed.\n`,
    );
    process.exit(1);
  }

  console.log(
    `[check-conflict-markers] OK — ${allFiles.length} files scanned, no unresolved merge-conflict markers.`,
  );
}

main();
