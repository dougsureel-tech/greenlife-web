#!/usr/bin/env node
// fs-read-bundled gate. Sister of inv check-fs-read-bundled (memory pin
// `feedback_outputFileTracingIncludes_for_fs_reads`).
//
// Bug class: `fs.readFileSync(somePath)` calls where the path is computed
// at runtime (e.g. `process.cwd() + "../../docs/foo.md"`) and the target
// file is OUTSIDE the Next.js function bundle.
//
// Next 16 only traces files reachable via static `import` statements.
// Raw `fs.readFileSync` paths are opaque to static analysis, so the file
// isn't bundled into the Vercel function. The read silently catches at
// runtime; any try/catch fallback runs forever, defeating the feature.
//
// Pre-push tsc passes CLEAN — the catch is at the static-trace layer,
// not the type layer.
//
// Convention going forward: any fs.readFileSync / fs.readFile / fs.readdir
// / fs.readdirSync call targeting a file OUTSIDE the project root MUST
// have the target listed in `outputFileTracingIncludes` in `next.config.ts`.
//
// glw + scc don't use fs reads in app/ today (0 hits per audit 2026-05-10).
// This guard is purely defensive — locks in the contract before any future
// agent adds the pattern.
//
// Usage:
//   node scripts/check-fs-read-bundled.mjs           # warn-only (default)
//   node scripts/check-fs-read-bundled.mjs --strict  # exit 1 on any finding

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

const FS_READ_RE =
  /\bfs\s*\.\s*(readFileSync|readFile|readdir|readdirSync)\s*\(\s*([^)]+)\)/g;
const BARE_READ_RE =
  /(?<!\.|\w)(readFileSync|readFile|readdir|readdirSync)\s*\(\s*([^)]+)\)/g;

const DYNAMIC_INDICATORS = [
  /process\.cwd\s*\(/,
  /path\.join\s*\(/,
  /path\.resolve\s*\(/,
  /\$\{/,
  /import\.meta\.url/,
];

const SCAN_DIRS = ["app", "components", "lib"];
const SCAN_EXTS = new Set([".ts", ".tsx"]);

// Allowlist by relative path. Empty today.
const ALLOWLIST = new Set([
  "lib/version.ts", // changelog mentions
]);

function* walk(dir) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const name of entries) {
    if (name === "node_modules" || name === ".next" || name === "__tests__") continue;
    const full = join(dir, name);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function findCalls(text) {
  const hits = [];
  for (const re of [FS_READ_RE, BARE_READ_RE]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text))) {
      const fnName = m[1];
      const argText = m[2];
      if (DYNAMIC_INDICATORS.some((d) => d.test(argText))) {
        hits.push({ fnName, args: argText.trim().slice(0, 200), offset: m.index });
      }
    }
  }
  return hits;
}

function lineOf(text, offset) {
  return text.slice(0, offset).split("\n").length;
}

function main() {
  const strict = process.argv.includes("--strict") || !process.argv.includes("--warn");
  const violations = [];
  for (const dir of SCAN_DIRS) {
    const abs = join(ROOT, dir);
    for (const file of walk(abs)) {
      const dot = file.lastIndexOf(".");
      if (!SCAN_EXTS.has(file.slice(dot))) continue;
      const rel = relative(ROOT, file);
      if (ALLOWLIST.has(rel)) continue;
      let text;
      try { text = readFileSync(file, "utf8"); } catch { continue; }
      const calls = findCalls(text);
      for (const c of calls) {
        violations.push({ file: rel, line: lineOf(text, c.offset), fn: c.fnName, args: c.args });
      }
    }
  }
  if (violations.length === 0) {
    console.log(`✓ check-fs-read-bundled: 0 dynamic fs reads outside the allowlist`);
    process.exit(0);
  }
  console.error("");
  console.error(`${strict ? "✗" : "⚠️ "} check-fs-read-bundled: ${violations.length} dynamic fs read(s) need triage`);
  console.error("");
  for (const v of violations) {
    console.error(`   ${v.file}:${v.line}`);
    console.error(`     fs.${v.fn}(${v.args}…)`);
  }
  console.error("");
  console.error("   For EACH callsite, decide:");
  console.error("   1. Target file is at project root — auto-bundled, add to ALLOWLIST.");
  console.error("   2. Target file is OUTSIDE project root — add to `outputFileTracingIncludes`");
  console.error("      in next.config.ts, then ALLOWLIST.");
  console.error("   3. Read happens at module top level (build time) — safe, add to ALLOWLIST.");
  console.error("");
  console.error("   Reference: memory pin feedback_outputFileTracingIncludes_for_fs_reads.");
  console.error("");
  process.exit(strict ? 1 : 0);
}

main();
