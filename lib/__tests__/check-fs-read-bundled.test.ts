// Pin tests for scripts/check-fs-read-bundled.mjs.
//
// 22nd gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: Next 16 only traces files reachable via static `import`
// statements. Raw `fs.readFileSync(<runtime path>)` is opaque to static
// analysis — target file isn't bundled into the Vercel function. Read
// silently fails at runtime; try/catch fallback runs forever, defeating
// the feature. Pre-push tsc passes CLEAN — catch is at static-trace
// layer, not type layer.
//
// Sister of inv check-fs-read-bundled. Memory pin
// `feedback_outputFileTracingIncludes_for_fs_reads`. glw + scc have
// 0 hits today — guard is purely defensive, locks contract before any
// future agent adds the pattern.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-fs-read-bundled.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-fs-read-bundled.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-fs-read-bundled — memory pin reference preserved", () => {
  // Cross-doctrine link to the recovery recipe.
  assert.match(
    GATE_SRC,
    /feedback_outputFileTracingIncludes_for_fs_reads/,
    "memory pin reference preserved",
  );
});

test("check-fs-read-bundled — Next 16 static-trace mechanism documented", () => {
  // THE load-bearing insight: Next bundles via static-import trace ONLY.
  // Without this anchor the gate becomes "easy to demote" because the
  // next dev would wrongly assume runtime reads work.
  assert.match(GATE_SRC, /Next\s+16/, "Next 16 anchor");
  assert.match(
    GATE_SRC,
    /static\s+(?:import|analysis)/i,
    "static-trace mechanism documented",
  );
  assert.match(
    GATE_SRC,
    /silently\s+(?:catches?|fails?)/i,
    "silent-fail failure-mode prose",
  );
});

test("check-fs-read-bundled — typecheck-CLEAN trap doctrine preserved", () => {
  // Critical context: tsc doesn't catch this. Pin so it's not removed
  // during a "comments cleanup" pass.
  assert.match(
    GATE_SRC,
    /tsc\s+passes\s+CLEAN/i,
    "typecheck-CLEAN trap documented",
  );
});

test("check-fs-read-bundled — FS_READ_RE catches 4 fs methods (sync + async × read + readdir)", () => {
  // All 4 must be pinned — drift drops one = false-negative.
  for (const fn of ["readFileSync", "readFile", "readdir", "readdirSync"]) {
    assert.ok(
      GATE_SRC.includes(fn),
      `fs method ${fn} must be in detection regex`,
    );
  }
});

test("check-fs-read-bundled — BARE_READ_RE catches destructured imports (no fs. prefix)", () => {
  // `import { readFileSync } from "fs"` then bare `readFileSync(...)`
  // calls would slip past fs.* prefix-only detection. Pin the
  // bare-call detection with negative-lookbehind.
  assert.match(
    GATE_SRC,
    /BARE_READ_RE/,
    "BARE_READ_RE separate regex pinned",
  );
  assert.ok(
    GATE_SRC.includes("(?<!\\.|\\w)"),
    "negative-lookbehind prevents fs.fn double-match",
  );
});

test("check-fs-read-bundled — 5 DYNAMIC_INDICATORS pinned", () => {
  // Only DYNAMIC paths warrant the warning — literal string paths
  // get bundled fine. Pin all 5 indicators.
  for (const indicator of [
    "process\\.cwd",
    "path\\.join",
    "path\\.resolve",
    "\\$\\{",
    "import\\.meta\\.url",
  ]) {
    assert.ok(
      GATE_SRC.includes(indicator),
      `DYNAMIC_INDICATOR ${indicator} must be pinned`,
    );
  }
});

test("check-fs-read-bundled — SCAN_DIRS = app + components + lib", () => {
  // 3-dir canonical surface for any agent-added fs read.
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\["app",\s*"components",\s*"lib"\]/,
    "SCAN_DIRS canonical",
  );
});

test("check-fs-read-bundled — ALLOWLIST opt-out mechanism + lib/version.ts entry", () => {
  // The escape hatch — files that legitimately reference `fs.read…` in
  // text (changelog mentions) are allowlisted. Pin so the mechanism
  // stays available.
  assert.match(GATE_SRC, /ALLOWLIST\s*=\s*new Set/, "ALLOWLIST Set defined");
  assert.match(
    GATE_SRC,
    /"lib\/version\.ts"/,
    "lib/version.ts (changelog) allowlist entry",
  );
});

test("check-fs-read-bundled — blankComments helper preserves byte offsets (newlines kept)", () => {
  // Critical UX: comments must not false-positive (docstrings show
  // `fs.readFileSync(process.cwd() + …)` examples), AND line numbers
  // in error output must stay accurate. blankComments preserves \n.
  assert.match(GATE_SRC, /blankComments/, "blankComments helper named");
  assert.match(
    GATE_SRC,
    /m\.replace\(\/\[\^\\n\]\/g,\s*"\s"\)/,
    "blankComments preserves newlines (byte-offset alignment)",
  );
});

test("check-fs-read-bundled — fix-guidance lists 3 triage paths", () => {
  // Self-documenting fix. Pin all 3 paths.
  assert.match(GATE_SRC, /auto-bundled/i, "path 1: auto-bundled at project root");
  assert.match(
    GATE_SRC,
    /outputFileTracingIncludes/,
    "path 2: outputFileTracingIncludes in next.config.ts",
  );
  assert.match(
    GATE_SRC,
    /module\s+top\s+level/i,
    "path 3: build-time top-level read",
  );
});
