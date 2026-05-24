// Pin tests for scripts/check-fabricated-review-schema.mjs.
//
// 21st gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine (HIGH-STAKES — Google policy + FTC scrutiny): emitting
// schema.org @type:Review / AggregateRating / Rating JSON-LD from
// HARDCODED fake reviews violates Google's "self-serving reviews"
// policy (Search Central guidance) + risks FTC scrutiny on attributed
// quotes (names + cities + dates that aren't verifiably real).
// Sweep strip: v19.705 (glw) + v13.7405 (scc).
//
// Memory pin: `feedback_fabricated_review_schema_google_policy`.
// Reinstate plan: GBP-pull integration (Google approval pending
// Case 0-8857000041037). Until then this guard ENFORCES the rule.
//
// IMPORTANT self-trip defense: this pin file CONTAINS the forbidden
// patterns as substring assertions. __tests__/ must be skipped at the
// walk layer for this file to not self-trip. Pinned explicitly.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-fabricated-review-schema.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(
  process.cwd(),
  "scripts/check-fabricated-review-schema.mjs",
);
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-fabricated-review-schema — v19.705 (glw) + v13.7405 (scc) strip anchors preserved", () => {
  // 2 strip-ship anchors. Drift loses the historical sweep context.
  assert.match(GATE_SRC, /v19\.705/, "glw v19.705 strip anchor");
  assert.match(GATE_SRC, /v13\.7405/, "scc v13.7405 strip anchor");
});

test("check-fabricated-review-schema — Google policy + FTC scrutiny anchors preserved", () => {
  // The LOAD-BEARING doctrine — Google policy + FTC. Without these
  // anchors a future cleanup could demote to "voice nit".
  assert.match(
    GATE_SRC,
    /self-serving\s+reviews/i,
    "Google self-serving-reviews policy ref",
  );
  assert.match(GATE_SRC, /FTC\s+scrutiny/i, "FTC scrutiny anchor");
  assert.match(
    GATE_SRC,
    /Search[\s\S]+?Central/i,
    "Google Search Central source citation",
  );
});

test("check-fabricated-review-schema — memory pin reference preserved", () => {
  assert.match(
    GATE_SRC,
    /feedback_fabricated_review_schema_google_policy/,
    "memory pin reference preserved",
  );
});

test("check-fabricated-review-schema — GBP-pull Case 0-8857000041037 reinstate-plan anchor", () => {
  // The reinstate plan — when GBP integration ships, we can emit
  // schema from real reviews. Pin so future cleanup keeps the path forward.
  assert.match(
    GATE_SRC,
    /GBP-pull/i,
    "GBP-pull integration anchor",
  );
  assert.match(
    GATE_SRC,
    /Case\s+0-8857000041037/,
    "Google approval Case 0-8857000041037 anchor",
  );
});

test("check-fabricated-review-schema — 3 forbidden @type patterns pinned (Review + AggregateRating + Rating)", () => {
  // The detection contract. Drift drops one = miss.
  assert.ok(
    GATE_SRC.includes('"@type"\\s*:\\s*"Review"'),
    "@type:Review pattern pinned",
  );
  assert.ok(
    GATE_SRC.includes('"@type"\\s*:\\s*"AggregateRating"'),
    "@type:AggregateRating pattern pinned",
  );
  assert.ok(
    GATE_SRC.includes('"@type"\\s*:\\s*"Rating"'),
    "@type:Rating pattern pinned",
  );
});

test("check-fabricated-review-schema — OPT_OUT_MARKER for legitimate real-reviews source", () => {
  // The escape hatch — when the GBP-pull helper ships and emits REAL
  // reviews, opt-out marker keeps the gate from blocking it.
  assert.match(
    GATE_SRC,
    /@review-schema-real-reviews-source/,
    "OPT_OUT_MARKER literal pinned",
  );
});

test("check-fabricated-review-schema — SCAN_DIRS = app + components + lib", () => {
  // 3-dir canonical set — covers all surfaces where a Reviews
  // component could land.
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\["app",\s*"components",\s*"lib"\]/,
    "SCAN_DIRS canonical 3-dir set",
  );
});

test("check-fabricated-review-schema — walk skips __tests__ (LOAD-BEARING self-trip defense)", () => {
  // CRITICAL: this pin file contains the forbidden @type strings in
  // its assertions. Walker MUST skip __tests__/ or the gate self-trips.
  assert.match(
    GATE_SRC,
    /name === "__tests__"/,
    "__tests__ skip (self-trip defense) pinned",
  );
});

test("check-fabricated-review-schema — stripComments before scan (block + line)", () => {
  // Files may carry commented-out Reviews examples — strip so they
  // don't false-positive.
  assert.match(
    GATE_SRC,
    /stripComments/,
    "stripComments helper invoked",
  );
});

test("check-fabricated-review-schema — strict by default, --warn opt-in", () => {
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
