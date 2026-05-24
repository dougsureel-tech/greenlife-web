// Pin tests for scripts/check-og-completeness.mjs.
//
// 32nd gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: Next 16 metadata cascade SHALLOWLY overwrites
// `openGraph: { ... }` — when a child page sets the block, its block
// REPLACES the parent's entirely. Any field not explicitly re-emitted
// silently disappears from rendered <meta property="og:*">.
//
// 4-sweep arc:
//   v11.305 og:locale silent-drop
//   v14.005 og:type silent-drop (T19, 13 pages)
//   v14.105 og:site_name silent-drop (T20, 17 pages)
//   v14.205 og:url silent-drop (T21, 4 pages)
//   v14.305 this gate (T22)
//
// 7 required fields: type · locale · siteName · title · description · url · images.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-og-completeness.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-og-completeness.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-og-completeness — 5-anchor arc preserved (v11.305 + T19-T22)", () => {
  assert.match(GATE_SRC, /v11\.305/, "v11.305 og:locale sweep anchor");
  assert.match(GATE_SRC, /T19/, "T19 (og:type) sweep anchor");
  assert.match(GATE_SRC, /T20/, "T20 (og:site_name) sweep anchor");
  assert.match(GATE_SRC, /T21/, "T21 (og:url) sweep anchor");
  assert.match(GATE_SRC, /T22/, "T22 (this gate-add) anchor");
});

test("check-og-completeness — version anchors preserved (v14.005/v14.105/v14.205/v14.305)", () => {
  for (const v of ["v14.005", "v14.105", "v14.205", "v14.305"]) {
    assert.ok(GATE_SRC.includes(v), `${v} ship version anchor`);
  }
});

test("check-og-completeness — sweep-magnitude anchors preserved (13 + 17 + 4 pages)", () => {
  // The concrete scope counts. Pin so cleanup keeps the WHY.
  assert.match(GATE_SRC, /13\s+pages/, "13-pages og:type scope");
  assert.match(GATE_SRC, /17\s+pages/, "17-pages og:site_name scope");
  assert.match(GATE_SRC, /4\s+pages/, "4-pages og:url scope");
});

test("check-og-completeness — Next 16 SHALLOW-overwrite mechanism documented", () => {
  // THE load-bearing insight: SHALLOW (not DEEP) merge — entire block
  // replaced, missing fields silently dropped.
  assert.match(GATE_SRC, /SHALLOWLY?\s+overwrite/i, "shallow-overwrite prose");
  assert.match(GATE_SRC, /REPLACES/, "REPLACES (not merges) anchor");
  assert.match(
    GATE_SRC,
    /silently\s+disappears?/i,
    "silent-disappearance failure-mode prose",
  );
});

test("check-og-completeness — REQUIRED_FIELDS = 7 canonical fields", () => {
  // Pin all 7 required fields. Drift = different enforcement contract.
  assert.match(
    GATE_SRC,
    /REQUIRED_FIELDS\s*=\s*\["type",\s*"locale",\s*"siteName",\s*"title",\s*"description",\s*"url",\s*"images"\]/,
    "REQUIRED_FIELDS canonical 7-field array pinned exact",
  );
});

test("check-og-completeness — EXEMPT = app/layout.tsx (cascade source)", () => {
  // Layout IS the source — has all defaults. We're checking CHILDREN
  // that shadow it re-emit the full set.
  assert.match(
    GATE_SRC,
    /"app\/layout\.tsx"/,
    "app/layout.tsx exempt pinned",
  );
  assert.match(
    GATE_SRC,
    /SOURCE\s+of\s+the\s+cascade/i,
    "exempt rationale preserved",
  );
});

test("check-og-completeness — findOpenGraphBlocks: brace-depth tracking + comment-strip", () => {
  // Heuristic block extractor. Pin brace-depth tracking + comment-strip
  // (so commented-out code doesn't false-match).
  assert.match(
    GATE_SRC,
    /openGraph\\s\*:\\s\*\\\{/,
    "openGraph: { regex anchor pinned",
  );
  assert.match(GATE_SRC, /depth\+\+/, "brace-depth increment pinned");
  assert.match(GATE_SRC, /depth--/, "brace-depth decrement pinned");
  assert.match(GATE_SRC, /stripComments|strip[\s\S]+?comments/i, "comment-strip pattern in body");
});

test("check-og-completeness — missingFields regex tolerates object-property shorthand", () => {
  // `{ title }` desugars to `{ title: title }`. Pin the shorthand
  // detection so explicit + shorthand both pass.
  assert.match(
    GATE_SRC,
    /shorthand/i,
    "object-property-shorthand tolerance documented",
  );
  assert.ok(
    GATE_SRC.includes("[:,}]"),
    "missingFields regex must accept :, comma, or close-brace after field",
  );
});

test("check-og-completeness — SCAN_DIRS = app (only)", () => {
  // Metadata only matters in app/.
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\["app"\]/,
    "SCAN_DIRS scoped to app/ only",
  );
});

test("check-og-completeness — fix-guidance lists all REQUIRED_FIELDS + sister-arc-guard reference", () => {
  // Error message lists fields + points at sister `check-site-url-defense`.
  assert.match(
    GATE_SRC,
    /check-site-url-defense\.mjs/,
    "sister arc-guard reference pinned",
  );
});

test("check-og-completeness — strict by default, --warn opt-in", () => {
  assert.match(
    GATE_SRC,
    /WARN_ONLY\s*=\s*process\.argv\.includes\("--warn"\)/,
    "--warn flag binding pinned",
  );
  assert.match(
    GATE_SRC,
    /process\.exit\(WARN_ONLY \? 0 : 1\)/,
    "default-strict exit policy pinned",
  );
});
