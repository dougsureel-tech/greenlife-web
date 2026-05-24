// Pin tests for scripts/check-conflict-markers.mjs.
//
// 7th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: catches UNRESOLVED git merge-conflict markers
// (`<<<<<<<` / `=======` / `>>>>>>>` triples) committed to source.
// Vercel's build pipeline parses each source file BEFORE tsc runs, so
// unresolved markers fail the deploy at the parser layer with
// "Parsing ecmascript source code failed". Pre-push tsc runs CLEAN
// while the actual deploy fails — the inv 2026-05-08 01:00 UTC incident
// stalled the deploy queue for 3+ hours / 9+ commits before root-cause
// was diagnosed.
//
// IMPORTANT self-trip defense: the gate must skip itself (its own file
// references the marker patterns) AND skip __tests__/ (pin tests may
// reference the patterns for assertion). Pin both.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-conflict-markers.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-conflict-markers.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-conflict-markers — incident anchor preserved (inv 2026-05-08 01:00 UTC)", () => {
  // The 2026-05-08 incident is THE reason this gate exists. Drift in
  // the comment-cleanup that strips the anchor loses the doctrine.
  assert.match(
    GATE_SRC,
    /2026-05-08/,
    "incident anchor (inv 2026-05-08 01:00 UTC stall) must persist",
  );
});

test("check-conflict-markers — requires the FULL marker triple (no false-positive on single)", () => {
  // The `if ((hasRight || hasDiff3) && hasDivider)` decision requires
  // LEFT + (RIGHT or DIFF3) + DIVIDER simultaneously. Pin the AND
  // semantics so a refactor that flips to OR doesn't false-positive.
  assert.ok(
    GATE_SRC.includes("(hasRight || hasDiff3) && hasDivider"),
    "decision must AND right/diff3 with divider (full-triple requirement)",
  );
});

test("check-conflict-markers — 4 canonical regex patterns pinned", () => {
  // Pin the exact regex shapes — these match git's actual marker
  // outputs (7 chars + space + non-space for left/right; 7 = for divider;
  // 7 | + space + non-space for diff3 mode).
  assert.ok(
    GATE_SRC.includes("RE_LEFT") && GATE_SRC.includes("<{7}"),
    "RE_LEFT (left-marker) pinned",
  );
  assert.ok(
    GATE_SRC.includes("RE_DIVIDER") && GATE_SRC.includes("={7}"),
    "RE_DIVIDER (= divider) pinned",
  );
  assert.ok(
    GATE_SRC.includes("RE_RIGHT") && GATE_SRC.includes(">{7}"),
    "RE_RIGHT (right-marker) pinned",
  );
  assert.ok(
    GATE_SRC.includes("RE_DIFF3") && GATE_SRC.includes("|{7}"),
    "RE_DIFF3 (diff3-mode | marker) pinned",
  );
});

test("check-conflict-markers — multiline-anchored regexes (^ + /m flag)", () => {
  // The patterns use `^X{7}` with /m flag so markers ONLY match at the
  // start of a line. Without /m, the regex would false-positive on
  // inline strings like "see >>>>>>> warning" or "<<<<<<< title".
  assert.ok(
    GATE_SRC.includes("/^<{7} \\S/m") ||
      GATE_SRC.includes("/^<{7}\\s\\S/m"),
    "RE_LEFT must anchor at line-start with /m flag",
  );
});

test("check-conflict-markers — SCAN_DIRS cover the 4 src roots", () => {
  // app + components + lib + scripts. The gate scans scripts/ too
  // (unusual — most gates exempt scripts/) BUT skips itself via
  // SKIP_FILES. Pin the SCAN_DIRS list.
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\[["']app["']\s*,\s*["']components["']\s*,\s*["']lib["']\s*,\s*["']scripts["']\]/,
    "SCAN_DIRS must include app + components + lib + scripts",
  );
});

test("check-conflict-markers — SKIP_FILES contains the gate itself (self-skip)", () => {
  // CRITICAL: the gate's own file references the marker patterns
  // (RE_LEFT, RE_RIGHT, etc.) and would self-trip without the skip.
  // Pin the canonical self-skip entry.
  assert.match(
    GATE_SRC,
    /scripts\/check-conflict-markers\.mjs/,
    "SKIP_FILES must contain the gate itself",
  );
});

test("check-conflict-markers — SKIP_DIRS covers node_modules + .next + fixtures + __tests__", () => {
  // fixtures + __tests__ are skipped because pin tests + parser-test
  // fixtures may legitimately contain the marker patterns for assertion.
  // Pin all 4 entries explicitly.
  assert.ok(
    GATE_SRC.includes('"node_modules"') &&
      GATE_SRC.includes('".next"') &&
      GATE_SRC.includes('"fixtures"') &&
      GATE_SRC.includes('"__tests__"'),
    "SKIP_DIRS must cover node_modules + .next + fixtures + __tests__",
  );
});

test("check-conflict-markers — covers 9 file extensions (ts/tsx/js/jsx/mjs/cjs/css/html/json)", () => {
  // Conflict markers can land in ANY source — not just .ts. Pin the
  // full extension list so a future scope-narrowing doesn't silently
  // miss markers in .css / .json / .html files.
  for (const ext of [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".css",
    ".html",
    ".json",
  ]) {
    assert.ok(
      GATE_SRC.includes(`"${ext}"`),
      `SCAN_EXTS must include ${ext}`,
    );
  }
});
