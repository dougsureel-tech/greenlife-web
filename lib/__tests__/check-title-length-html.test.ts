// Pin tests for scripts/check-title-length-html.mjs.
//
// 45th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: page-level metadata.title body that uses HTML-special chars
// (& ' " < >) gets serialized as entities. Layout's title.template
// (e.g. `%s | Green Life Cannabis`) appends ~22 chars brand suffix. JS
// length looks fine (e.g. 47c), HTML-rendered <title> exceeds Google's
// ~60c SERP cap → mid-word "…" truncation losing CTR-bearing headline.
//
// 5-step arc: T5 (GW v2.93.90 telehealth) + T24 (GW v2.94.60 /about) +
// T25 (glw v14.705 + scc v13.2305 /apply) + T61 (glw v17.905 + scc
// v13.5505 /treasure-chest + /our-story + /blog) + T63 (this gate 2026-05-10).
//
// Sister of check-duplicate-brand-title (same brace-depth reverse-walk
// metadata-scope detection) + check-description-length-html (same
// entity-inflation pattern but for descriptions).
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-title-length-html.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-title-length-html.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-title-length-html — 5-step arc anchors preserved (T5 + T24 + T25 + T61 + T63)", () => {
  for (const t of ["T5", "T24", "T25", "T61", "T63"]) {
    assert.match(GATE_SRC, new RegExp(`\\b${t}\\b`), `${t} ship arc anchor`);
  }
});

test("check-title-length-html — version anchors (v17.905 glw + v13.5505 scc + 74c examples)", () => {
  assert.match(GATE_SRC, /v17\.905/, "glw v17.905 (T61) anchor");
  assert.match(GATE_SRC, /v13\.5505/, "scc v13.5505 (T61) anchor");
  assert.match(GATE_SRC, /74c/, "74c rendered-length example pinned");
});

test("check-title-length-html — SERP_CAP=60 (Google) pinned", () => {
  assert.match(
    GATE_SRC,
    /SERP_CAP\s*=\s*60/,
    "Google's 60c SERP title cap pinned",
  );
});

test("check-title-length-html — 5 HTML-entity expansions pinned (& ' \" < >)", () => {
  for (const [, entity] of [
    ["&", "&amp;"],
    ["'", "&#x27;"],
    ['"', "&quot;"],
    ["<", "&lt;"],
    [">", "&gt;"],
  ]) {
    assert.ok(
      GATE_SRC.includes(entity),
      `entity expansion → ${entity} pinned`,
    );
  }
});

test("check-title-length-html — BRAND_NAME sourced from lib/store.ts (cross-stack portability)", () => {
  assert.match(GATE_SRC, /lib\/store\.ts/, "lib/store.ts BRAND_NAME source");
  assert.match(
    GATE_SRC,
    /SITE_NAME/,
    "GW fallback src/lib/seo.ts SITE_NAME path pinned",
  );
});

test("check-title-length-html — template suffix ` | ${BRAND_NAME}` shape pinned", () => {
  // The brand suffix appended by layout's title.template. Drift =
  // wrong rendered-length math.
  assert.match(
    GATE_SRC,
    /TEMPLATE_SUFFIX\s*=\s*`\s\|\s\$\{BRAND_NAME\}`/,
    "TEMPLATE_SUFFIX ` | ${BRAND_NAME}` shape pinned",
  );
});

test("check-title-length-html — title:{absolute} bypass extracts inner body", () => {
  // The absolute escape — body IS the rendered title (no template
  // suffix appended). Pin the absolute-extraction logic.
  assert.match(
    GATE_SRC,
    /absMatch/,
    "absolute body extraction variable pinned",
  );
  assert.match(
    GATE_SRC,
    /absolute\\s\*:\\s\*\["']/,
    "absolute regex shape pinned",
  );
});

test("check-title-length-html — metadata-scope detection (brace + bracket depth reverse-walk)", () => {
  // Critical scope filter: ONLY flag `title:` inside top-level
  // metadata export. Reject inside FAQs, breadcrumb chains, nav arrays.
  assert.match(GATE_SRC, /backDepth/, "brace-depth reverse-walk");
  assert.match(GATE_SRC, /bracketDepth/, "bracket-depth (array-skip)");
  assert.match(GATE_SRC, /confirmedMetadata/, "metadata-scope confirmation");
});

test("check-title-length-html — interpolation-tolerant template-literal skip", () => {
  // Dynamic `${expr}` templates can't be measured at static-analysis time.
  assert.match(
    GATE_SRC,
    /hasInterp/,
    "interp-detect flag pinned",
  );
  assert.match(
    GATE_SRC,
    /dynamic,\s*skip/i,
    "dynamic-skip comment pinned",
  );
});

test("check-title-length-html — EXEMPT layout + SCAN_DIRS cross-stack", () => {
  assert.match(GATE_SRC, /"app\/layout\.tsx"/, "app/layout.tsx exempt");
  assert.match(GATE_SRC, /"src\/app\/layout\.tsx"/, "src/app/layout.tsx exempt");
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\["app",\s*"src\/app"\]/,
    "SCAN_DIRS cross-stack 2-shape canonical",
  );
});

test("check-title-length-html — memory pin reference preserved", () => {
  assert.match(
    GATE_SRC,
    /feedback_html_escape_inflates_meta_description_length/,
    "memory pin reference preserved",
  );
});
