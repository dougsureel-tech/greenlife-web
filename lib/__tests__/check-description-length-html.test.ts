// Pin tests for scripts/check-description-length-html.mjs.
//
// 17th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: page-level metadata.description body that uses HTML-special
// chars (& ' " < >) gets serialized as entities (&amp; +4, &#x27; +5,
// &quot; +5, &lt; +3, &gt; +3) in the rendered <meta> tag. JS source
// length looks fine (e.g. 158c), but HTML-rendered exceeds Google's
// ~160c SERP cap. Result: SERP shows mid-sentence "…".
//
// Sites where this bit: GW v2.94.95 (telehealth + /learn 158→167c)
// · scc v13.5605 T62 (/blog 170c). Memory pin
// `feedback_html_escape_inflates_meta_description_length`. Gate added
// 2026-05-10 (T64) sister of check-title-length-html (T63).
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-description-length-html.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(
  process.cwd(),
  "scripts/check-description-length-html.mjs",
);
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-description-length-html — T6 + T62 + T63 + T64 ship-arc anchors preserved", () => {
  // T6 = first fix, T62 = scc sweep, T63 = sister title gate, T64 = this gate.
  // All 4 anchor the fix-then-arc-guard chain.
  assert.match(GATE_SRC, /T6\b/, "T6 anchor (first fix)");
  assert.match(GATE_SRC, /T62/, "T62 (scc sweep) anchor");
  assert.match(GATE_SRC, /T63/, "T63 (sister title gate) anchor");
  assert.match(GATE_SRC, /T64/, "T64 (this gate-add) anchor");
});

test("check-description-length-html — memory pin reference preserved", () => {
  // Cross-doctrine link to the deeper recipe.
  assert.match(
    GATE_SRC,
    /feedback_html_escape_inflates_meta_description_length/,
    "memory pin reference preserved",
  );
});

test("check-description-length-html — SERP_CAP=160 (Google) pinned", () => {
  // The cap is the load-bearing number. Drift = changed enforcement.
  assert.match(
    GATE_SRC,
    /SERP_CAP\s*=\s*160/,
    "Google's 160c SERP cap pinned",
  );
});

test("check-description-length-html — 5 entity expansions pinned (& ' \" < >)", () => {
  // The htmlEscapedLength fn mirrors React's serialization. All 5 must
  // be pinned — missing any = under-measure → false-negative.
  for (const [char, entity] of [
    ["&", "&amp;"],
    ["'", "&#x27;"],
    ['"', "&quot;"],
    ["<", "&lt;"],
    [">", "&gt;"],
  ]) {
    assert.ok(
      GATE_SRC.includes(entity),
      `entity expansion ${char} → ${entity} pinned`,
    );
  }
});

test("check-description-length-html — entity-expansion delta-counts documented in error msg", () => {
  // The error message tells next dev WHY rendered ≠ source. Pin the
  // delta-counts so they don't drift from the actual escape math.
  assert.match(GATE_SRC, /&amp;.*\+4/, "&amp; +4 delta documented");
  assert.match(GATE_SRC, /&#x27;.*\+5/, "&#x27; +5 delta documented");
  assert.match(GATE_SRC, /&quot;.*\+5/, "&quot; +5 delta documented");
  assert.match(GATE_SRC, /&lt;.*\+3/, "&lt; +3 delta documented");
  assert.match(GATE_SRC, /&gt;.*\+3/, "&gt; +3 delta documented");
});

test("check-description-length-html — metadata-export scope detection (brace + bracket depth reverse-walk)", () => {
  // CRITICAL: gate only flags `description:` inside the top-level
  // metadata export — NOT random `description:` keys deep in arrays/
  // nested objects (e.g. JSON-LD schema, FAQs, etc.). Brace+bracket
  // depth aware reverse-walk is the load-bearing scope filter.
  assert.match(GATE_SRC, /backDepth/, "brace-depth reverse-walk pinned");
  assert.match(GATE_SRC, /bracketDepth/, "bracket-depth reverse-walk pinned");
  assert.match(
    GATE_SRC,
    /confirmedMetadata/,
    "metadata-scope confirmation pinned",
  );
});

test("check-description-length-html — template-literal-with-interp skipped (can't measure statically)", () => {
  // Dynamic descriptions can't be measured at static-analysis time.
  // Pin the skip so future tightening doesn't false-positive on
  // legit dynamic copy.
  assert.match(
    GATE_SRC,
    /hasInterp/,
    "interpolation-detect flag pinned",
  );
  assert.match(
    GATE_SRC,
    /dynamic,\s*skip/i,
    "dynamic-skip comment pinned",
  );
});

test("check-description-length-html — EXEMPT includes app/layout.tsx (root descriptions intentional)", () => {
  // Root layout.tsx descriptions are template-level, not page-level —
  // they get overridden. Exempt to avoid false-positives.
  assert.match(
    GATE_SRC,
    /"app\/layout\.tsx"/,
    "app/layout.tsx exempt pinned",
  );
  assert.match(
    GATE_SRC,
    /"src\/app\/layout\.tsx"/,
    "src/app/layout.tsx exempt pinned (cross-stack shape)",
  );
});

test("check-description-length-html — SCAN_DIRS = app + src/app cross-stack", () => {
  // Both flat + src/ shapes. Drift to one = miss in the other.
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\["app",\s*"src\/app"\]/,
    "SCAN_DIRS cross-stack 2-shape canonical",
  );
});

test("check-description-length-html — fix-guidance lists buildPageMetadata helper", () => {
  // The recommended fix recipe — use the buildPageMetadata helper which
  // auto-truncates. Pin so the recipe stays linked.
  assert.match(
    GATE_SRC,
    /buildPageMetadata/,
    "buildPageMetadata helper recipe pinned",
  );
  assert.match(
    GATE_SRC,
    /iterative\s+shorten/,
    "iterative-shorten behavior documented",
  );
});
