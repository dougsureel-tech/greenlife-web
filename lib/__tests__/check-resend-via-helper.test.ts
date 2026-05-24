// Pin tests for scripts/check-resend-via-helper.mjs.
//
// 39th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: NO NEW `new Resend(...)` callsites outside the canonical
// helper `lib/email.ts`. The helper centralizes FROM-address SSoT,
// error mapping, and PII-safe logging. Drift fragments these into
// per-caller defenses (which inevitably diverge).
//
// Cross-stack port from cannagent v6.0865 + VRG v9.6.93 + GW.
//
// REVERSE-defense: allowlist entries that no longer contain
// `new Resend(` are flagged STALE — the entry can be removed.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-resend-via-helper.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-resend-via-helper.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-resend-via-helper — 3 cross-stack origin anchors (cannagent + VRG + GW)", () => {
  assert.match(GATE_SRC, /cannagent\s+v6\.0865/, "cannagent v6.0865 anchor");
  assert.match(GATE_SRC, /VRG\s+v9\.6\.93/, "VRG v9.6.93 anchor");
  assert.match(GATE_SRC, /\bGW\b/, "GW sister anchor");
});

test("check-resend-via-helper — helper-centralization rationale preserved (SSoT + error + PII)", () => {
  // The 3 centralization concerns documented. Pin all 3 so future
  // cleanup doesn't lose the WHY.
  assert.match(GATE_SRC, /FROM-address\s+SSoT/i, "FROM-address SSoT rationale");
  assert.match(GATE_SRC, /error\s+mapping/i, "error mapping rationale");
  assert.match(GATE_SRC, /PII-safe\s+logging/i, "PII-safe logging rationale");
});

test("check-resend-via-helper — detection regex: `\\bnew\\s+Resend\\s*\\(` pinned", () => {
  // The detection pattern. Drift drops the SDK-pattern catch.
  assert.ok(
    GATE_SRC.includes("\\bnew\\s+Resend\\s*\\("),
    "new Resend( detection regex pinned",
  );
});

test("check-resend-via-helper — ALLOWLIST = lib/email.ts only (THE helper)", () => {
  // Pin the canonical allowlist entry + ONLY entry shape.
  assert.match(
    GATE_SRC,
    /ALLOWLIST\s*=\s*new Set\(\[[\s\S]*?"lib\/email\.ts"/,
    "lib/email.ts in ALLOWLIST",
  );
});

test("check-resend-via-helper — SKIP_FILES = lib/version.ts (changelog prose)", () => {
  // Changelog quotes the literal pattern in release notes — pin the
  // exempt mechanism.
  assert.match(
    GATE_SRC,
    /"lib\/version\.ts"/,
    "lib/version.ts in SKIP_FILES (changelog)",
  );
});

test("check-resend-via-helper — STALE-ALLOWLIST reverse-defense pinned", () => {
  // CRITICAL: when caller refactors AWAY from `new Resend(`, the
  // allowlist entry should be removed. Reverse-check pins this.
  assert.match(GATE_SRC, /stale/i, "STALE detection variable");
  assert.match(
    GATE_SRC,
    /allowlist\s+entry\s+can\s+be\s+removed/i,
    "stale-removal guidance pinned",
  );
});

test("check-resend-via-helper — SCAN_ROOTS = app + lib + components", () => {
  // 3-dir canonical scan scope.
  assert.match(
    GATE_SRC,
    /SCAN_ROOTS\s*=\s*\["app",\s*"lib",\s*"components"\]/,
    "SCAN_ROOTS canonical 3-dir set",
  );
});

test("check-resend-via-helper — SKIP_DIRS = node_modules + .next + __tests__ (self-trip)", () => {
  // Pin file contains `new Resend(` in regex string. Skip __tests__/.
  assert.match(
    GATE_SRC,
    /SKIP_DIRS\s*=\s*new Set\(\["node_modules",\s*"\.next",\s*"__tests__"\]\)/,
    "SKIP_DIRS canonical 3-entry pinned",
  );
});

test("check-resend-via-helper — comment-line skip (// + *)", () => {
  // Both single-line + JSDoc block-line comments skipped.
  assert.ok(
    GATE_SRC.includes("^\\s*(\\/\\/|\\*)"),
    "comment-line skip regex pinned",
  );
});

test("check-resend-via-helper — fix-guidance: route through @/lib/email", () => {
  // Self-documenting fix recipe.
  assert.match(
    GATE_SRC,
    /@\/lib\/email/,
    "@/lib/email import path in fix guidance",
  );
});

test("check-resend-via-helper — fail-loud exit 1 (no --warn opt-out — wrapper discipline)", () => {
  // Wrapper-discipline gate — failure ALWAYS halts.
  assert.match(GATE_SRC, /process\.exit\(1\)/, "fail-loud exit 1");
  assert.ok(
    !GATE_SRC.includes("--warn"),
    "no --warn opt-out (wrapper-discipline gate)",
  );
});
