// Pin tests for scripts/check-please-hedge.mjs.
//
// 36th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine (brand-voice "What we never do"): customer-facing error/
// validation strings DROP the "Please" hedge. Direct instruction reads
// firmer + matches shop voice.
//   ✓ "Enter a valid email address."
//   ✗ "Please enter a valid email address."
//
// 3 sweep ships: v4.565 (initial /apply form pattern) + v18.605 +
// v27.305 (form-validation sweeps).
//
// IMPORTANT self-trip defense: this pin file CONTAINS forbidden
// patterns (in PATTERN regex pin). Walker MUST skip __tests__/ or
// gate self-trips. Pinned explicitly.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-please-hedge.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-please-hedge.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-please-hedge — brand-voice 'What we never do' doctrine anchor preserved", () => {
  // The authoritative source — brand-voice doc.
  assert.match(
    GATE_SRC,
    /brand-voice/i,
    "brand-voice doc citation",
  );
  assert.match(
    GATE_SRC,
    /What\s+we\s+never\s+do/i,
    "What-we-never-do section anchor",
  );
});

test("check-please-hedge — 3 sweep ship anchors (v4.565 + v18.605 + v27.305)", () => {
  // 3 cross-ship history. Pin all 3.
  assert.match(GATE_SRC, /v4\.565/, "v4.565 (/apply form initial) anchor");
  assert.match(GATE_SRC, /v18\.605/, "v18.605 form-validation sweep");
  assert.match(GATE_SRC, /v27\.305/, "v27.305 form-validation sweep");
});

test("check-please-hedge — direct-vs-hedge example pair preserved (Enter vs Please enter)", () => {
  // Self-documenting examples — pin so the canonical pair stays.
  assert.match(
    GATE_SRC,
    /Enter\s+a\s+valid\s+email/,
    "direct example pinned",
  );
  assert.match(
    GATE_SRC,
    /Please\s+enter\s+a\s+valid\s+email/,
    "hedge example pinned",
  );
});

test("check-please-hedge — 8 high-confidence verbs pinned (enter/complete/fill/select/...)", () => {
  // All 8 verbs must be in the PATTERN regex. Drift drops one = miss.
  for (const verb of [
    "enter",
    "complete",
    "fill",
    "select",
    "choose",
    "provide",
    "check",
    "try",
  ]) {
    assert.ok(
      GATE_SRC.includes(verb),
      `verb "${verb}" must be in PATTERN regex`,
    );
  }
});

test("check-please-hedge — PATTERN regex shape pinned (quote-flex + Please \\s+ verb \\s+)", () => {
  // Drift to lowercase "please" or missing trailing \s+ = different
  // enforcement contract.
  assert.match(
    GATE_SRC,
    /\["'`\]Please\\s\+/,
    "PATTERN: opening quote + Please + \\s+ shape pinned",
  );
});

test("check-please-hedge — 3 EXEMPT_PREFIXES pinned (3rd-party brands + scripts + version.ts)", () => {
  for (const p of [
    "app/brands/\\[slug\\]/_brands/",
    "scripts/",
    "lib/version.ts",
  ]) {
    assert.match(
      GATE_SRC,
      new RegExp(p),
      `EXEMPT_PREFIXES must include ${p}`,
    );
  }
});

test("check-please-hedge — narrow-scope rationale documented (WAC legal copy NOT in 8 verbs)", () => {
  // Doctrine explicitly KEEPS general "please consume…" unflagged —
  // legal/WAC contexts may need the cadence. Pin the narrow-scope
  // rationale so future tightening doesn't drop it.
  assert.match(
    GATE_SRC,
    /WAC[\s-]?compliance/i,
    "WAC-compliance copy exemption rationale",
  );
  assert.match(
    GATE_SRC,
    /(?:narrow|high-confidence)/i,
    "narrow-scope intent documented",
  );
});

test("check-please-hedge — SCAN_DIRS = app + components + lib", () => {
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\["app",\s*"components",\s*"lib"\]/,
    "SCAN_DIRS canonical 3-dir set",
  );
});

test("check-please-hedge — walker skips __tests__/node_modules/.next (self-trip defense)", () => {
  // CRITICAL: pin file contains 'Please enter' in PATTERN regex string.
  // Walker MUST skip __tests__ or gate self-trips.
  assert.match(GATE_SRC, /name === "__tests__"/, "__tests__ skip pinned");
  assert.match(GATE_SRC, /name === "node_modules"/, "node_modules skip");
  assert.match(GATE_SRC, /name === "\.next"/, ".next skip");
});

test("check-please-hedge — strict by default, --warn opt-in", () => {
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
