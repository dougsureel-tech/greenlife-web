// Pin tests for scripts/check-button-type.mjs.
//
// 12th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: `<button>` without explicit `type=` defaults to `type="submit"`
// per HTML5 spec. Inside a `<form>`, pressing Enter fires the first
// untyped button. If that button has an `onClick` doing something
// unrelated (delete/remove/navigate/back), the customer accidentally
// triggers it. Real accidental-submit risk for HIPAA-aware patient
// surfaces (GW change-password, my-appointments, admin patient-edit).
//
// T69 sweep: 313 buttons across 101 files (glw v18.305 + scc v13.6005 +
// GW v2.97.A0). Gate added T70 2026-05-10 to prevent regression.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-button-type.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-button-type.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-button-type — T69 sweep + T70 gate-add anchors preserved", () => {
  // The WHY. T69 = sweep, T70 = gate. Without both, future cleanup
  // could lose the historical context.
  assert.match(GATE_SRC, /T69/, "T69 sweep anchor");
  assert.match(GATE_SRC, /T70/, "T70 gate-add anchor");
  assert.match(GATE_SRC, /2026-05-10/, "T70 gate-add date pinned");
});

test("check-button-type — 313 buttons / 101 files sweep scope preserved", () => {
  // Concrete sweep magnitude — load-bearing for the next dev judging
  // how widespread this bug class was.
  assert.match(GATE_SRC, /313\s+buttons/, "313-button sweep scope");
  assert.match(GATE_SRC, /101\s+files/, "101-file sweep scope");
});

test("check-button-type — HTML5 spec rationale preserved (type=submit default)", () => {
  // The mechanism — must be in the gate's own header so the next
  // reader doesn't need to look up the HTML5 spec.
  assert.match(GATE_SRC, /HTML5\s+spec/, "HTML5 spec reference");
  assert.match(GATE_SRC, /type="submit"/, "default-to-submit mechanism");
  assert.match(GATE_SRC, /[Ee]nter/, "Enter-key fires first-untyped-button mechanism");
});

test("check-button-type — HIPAA-surface risk class preserved", () => {
  // Cross-doctrine link: this gate's MOST load-bearing case is HIPAA-aware
  // patient surfaces (GW). Pin so a future "voice nit" demotion doesn't
  // happen.
  assert.match(GATE_SRC, /HIPAA/, "HIPAA risk-class anchor");
  assert.match(
    GATE_SRC,
    /change-password|patient-edit|my-appointments/,
    "patient-surface examples preserved",
  );
});

test("check-button-type — detection: onClick AND no-explicit-type combination", () => {
  // The two-condition detection. Either alone false-positives:
  // - <button>Submit</button> (no onClick, no type) = legit form submit
  // - <button type="button" onClick={...}>  (explicit type) = fixed already
  assert.ok(
    GATE_SRC.includes("\\btype\\s*="),
    "explicit type= regex pinned",
  );
  assert.ok(
    GATE_SRC.includes("\\bonClick\\s*="),
    "onClick= regex pinned",
  );
  assert.ok(
    GATE_SRC.includes("if (/\\btype\\s*=/.test(attrs)) continue"),
    "skip-when-has-type early-continue pinned",
  );
  assert.ok(
    GATE_SRC.includes("if (!/\\bonClick\\s*=/.test(attrs)) continue"),
    "skip-when-no-onClick early-continue pinned",
  );
});

test("check-button-type — SCAN_DIRS includes both flat + src/ shapes", () => {
  // Stack-agnostic: scans `app + components` (GLW/SCC shape) AND
  // `src/app + src/components` (cannagent/inv shape). Drift to one
  // shape breaks the cross-stack portability.
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\["app",\s*"src\/app",\s*"components",\s*"src\/components"\]/,
    "SCAN_DIRS = 4-shape canonical set",
  );
});

test("check-button-type — .tsx-only filter (JSX = button concern)", () => {
  // No-JSX files (.ts) can't contain `<button>` elements. .tsx filter
  // is load-bearing for the scan's signal:noise ratio.
  assert.match(
    GATE_SRC,
    /p\.endsWith\(["']\.tsx["']\)/,
    ".tsx-only file filter pinned",
  );
});

test("check-button-type — stripComments before scan (avoids commented-out false-pos)", () => {
  // Block + line comments stripped — important because comment-blocks
  // may contain example `<button onClick={…}>` code without type.
  assert.match(GATE_SRC, /stripComments/, "stripComments helper invoked");
  assert.ok(
    GATE_SRC.includes("/\\/\\*[\\s\\S]*?\\*\\//g"),
    "block-comment regex pinned",
  );
  assert.ok(
    GATE_SRC.includes('"//') || GATE_SRC.includes("/\\/\\/[^\\n]*/g"),
    "line-comment regex pinned",
  );
});

test("check-button-type — fix-guidance points to type=\"button\"", () => {
  // Self-documenting fix. Pin the recipe.
  assert.ok(
    GATE_SRC.includes('type=\\"button\\"'),
    'type="button" fix recipe pinned',
  );
});
