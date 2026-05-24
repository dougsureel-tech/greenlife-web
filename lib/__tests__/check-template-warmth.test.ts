// Pin tests for scripts/check-template-warmth.mjs.
//
// 43rd gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: brand-voice direct rule. Phrases like "give us a call" /
// "drop us a line" / "reach out to us" = corporate-template warmth.
// Signals copy was written by marketing team trying to sound friendly.
// Real shop voice is direct: "Call us." / "Email us." NOT "Give us a
// call." / "Drop us a line."
//
// 2 sweep ships: v19.205 + v27.805 (warmth-stripping sweeps across
// customer copy).
//
// IMPORTANT self-trip defense: this pin file CONTAINS forbidden
// patterns (in PATTERN regex pin + doctrine prose). Walker MUST skip
// __tests__/ or gate self-trips. Pinned explicitly.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-template-warmth.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-template-warmth.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-template-warmth — brand-voice doctrine + communications-expert anchor preserved", () => {
  assert.match(GATE_SRC, /brand-voice/i, "brand-voice doc reference");
  assert.match(
    GATE_SRC,
    /communications-expert/i,
    "communications-expert recurring-finding anchor",
  );
});

test("check-template-warmth — 2 sweep ship anchors (v19.205 + v27.805)", () => {
  assert.match(GATE_SRC, /v19\.205/, "v19.205 warmth-strip sweep");
  assert.match(GATE_SRC, /v27\.805/, "v27.805 warmth-strip sweep");
});

test("check-template-warmth — direct-vs-soft example pair preserved (Call us vs Give us a call)", () => {
  // Self-documenting examples — pin so canonical pair stays.
  assert.match(GATE_SRC, /Call\s+us\./, "direct: Call us. example pinned");
  assert.match(
    GATE_SRC,
    /Give\s+us\s+a\s+call/i,
    "soft: Give us a call example pinned",
  );
  assert.match(GATE_SRC, /Drop\s+us\s+a\s+line/i, "soft: Drop us a line example");
});

test("check-template-warmth — 4 high-confidence patterns pinned in PATTERN regex", () => {
  // All 4 must be in PATTERN regex. Drift drops one = miss.
  for (const phrase of [
    "give us a (?:call|ring)",
    "drop us a line",
    "reach out to us",
  ]) {
    assert.ok(
      GATE_SRC.includes(phrase),
      `PATTERN must include "${phrase}"`,
    );
  }
});

test("check-template-warmth — PATTERN regex shape: word-boundary + case-insensitive", () => {
  // Drift to no-boundary catches mid-word; drift to no-/i misses "Give".
  assert.ok(
    GATE_SRC.includes("PATTERN = /\\b") && GATE_SRC.includes("/gi"),
    "PATTERN shape (word-boundary + /gi flag) pinned",
  );
});

test("check-template-warmth — 3 EXEMPT_PREFIXES (3rd-party brands + scripts + version.ts)", () => {
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

test("check-template-warmth — corporate-template-marketing-team rationale preserved", () => {
  // WHY: explains the recurring nature — marketing copywriter pattern.
  assert.match(
    GATE_SRC,
    /marketing\s+team/i,
    "marketing-team voice-signal rationale documented",
  );
  assert.match(
    GATE_SRC,
    /corporate-template/i,
    "corporate-template label preserved",
  );
});

test("check-template-warmth — SCAN_DIRS = app + components + lib", () => {
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\["app",\s*"components",\s*"lib"\]/,
    "SCAN_DIRS canonical 3-dir set",
  );
});

test("check-template-warmth — walker skips __tests__ (LOAD-BEARING self-trip defense)", () => {
  // CRITICAL: pin file contains 'give us a call' in PATTERN regex.
  assert.match(GATE_SRC, /name === "__tests__"/, "__tests__ skip pinned");
});

test("check-template-warmth — strict by default, --warn opt-in", () => {
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
