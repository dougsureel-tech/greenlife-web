#!/usr/bin/env node
// Arc-guard: prevent `60 * 60 * 1000` / `24 * 60 * 60 * 1000` / `N * 60 * 1000`
// inlines from regressing back into the codebase.
//
// Sister of inv check-time-constants-inline.mjs (closes v173.465-845 sweep
// arc). `lib/time-constants.ts` exports `SECOND_MS / MINUTE_MS / HOUR_MS /
// DAY_MS / WEEK_MS`. Every inlined `N * (60|60*24|60*60) * 1000` literal
// across app/, components/, lib/ should use the SSoT instead.
//
// Locked in for glw by v23.505 AgeGate cleanup (last surviving inline ms
// math outside dead `app/order/` code).
//
// Patterns matched:
//   - `24 * 60 * 60 * 1000`  → DAY_MS
//   - `60 * 60 * 1000`        → HOUR_MS
//   - `60 * 1000`              → MINUTE_MS
//
// EXEMPT:
//   - lib/time-constants.ts itself — the SSoT; composition is canonical
//   - lib/version.ts — historical references in changelog text
//   - app/order/ — dead code (redirects to /menu via proxy.ts)
//   - __tests__ — tests may construct timestamps inline for clarity
//
// Mode: --strict to exit 1 on any finding (default: training-mode warn-only
// for soft adoption). Pre-push wires this in strict mode.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const STRICT = process.argv.includes("--strict") || !process.argv.includes("--warn");
const SCAN_DIRS = ["app", "components", "lib"];

const EXEMPT_FILES = new Set([
  "lib/time-constants.ts",
  "lib/version.ts",
]);
const EXEMPT_PREFIXES = ["app/order/"];

const PATTERNS = [
  {
    name: "DAY_MS",
    regex: /\b24\s*\*\s*60\s*\*\s*60\s*\*\s*1000\b/g,
    hint: "use `DAY_MS` from @/lib/time-constants",
  },
  {
    name: "HOUR_MS",
    regex: /\b60\s*\*\s*60\s*\*\s*1000\b/g,
    hint: "use `HOUR_MS` from @/lib/time-constants",
  },
  {
    name: "MINUTE_MS",
    regex: /\b60\s*\*\s*1000\b/g,
    hint: "use `MINUTE_MS` from @/lib/time-constants",
  },
];

function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".next" || entry === "__tests__") continue;
      out.push(...walk(full));
    } else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
      out.push(full);
    }
  }
  return out;
}

const files = SCAN_DIRS.flatMap((d) => walk(d));
const findings = [];

for (const file of files) {
  const rel = relative(ROOT, file);
  if (EXEMPT_FILES.has(rel)) continue;
  if (EXEMPT_PREFIXES.some((p) => rel.startsWith(p))) continue;
  if (rel.endsWith(".test.ts") || rel.endsWith(".test.tsx")) continue;

  const content = readFileSync(file, "utf-8");
  const matchedRanges = [];
  for (const { name, regex, hint } of PATTERNS) {
    regex.lastIndex = 0;
    let m;
    while ((m = regex.exec(content)) !== null) {
      const start = m.index;
      const end = start + m[0].length;
      const overlaps = matchedRanges.some(([s, e]) => start < e && end > s);
      if (overlaps) continue;
      matchedRanges.push([start, end]);
      const linePrefix = content.slice(0, start);
      const lineNum = linePrefix.split("\n").length;
      const line = content.split("\n")[lineNum - 1].trim();
      findings.push({ file: rel, line: lineNum, name, hint, source: line });
    }
  }
}

if (findings.length === 0) {
  console.log(
    `✓ check-time-constants-inline: ${files.length} files scanned, 0 inlined time-constant literals`,
  );
  process.exit(0);
}

console.error(
  `\n${STRICT ? "✗" : "⚠️ "} check-time-constants-inline: ${findings.length} inlined time-constant literal(s)\n`,
);
for (const f of findings) {
  console.error(`  ${f.file}:${f.line}  ${f.name} candidate`);
  console.error(`    ${f.source}`);
  console.error(`    → ${f.hint}`);
}
console.error(
  `\nSister of inv v173.465-845 sweep arc (33 files / 43 inlines lifted).`,
);
console.error(
  `Going forward, \`import { MINUTE_MS, HOUR_MS, DAY_MS } from "@/lib/time-constants"\` is the default.\n`,
);

process.exit(STRICT ? 1 : 0);
