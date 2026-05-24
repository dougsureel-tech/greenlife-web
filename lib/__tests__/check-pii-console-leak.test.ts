// Pin tests for scripts/check-pii-console-leak.mjs.
//
// 35th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine (HIGH-STAKES — Vercel logs are NOT BAA-covered):
// `console.error("...", err)` where err is the raw Error object leaks
// PII. SDK errors echo customer-bound parameters (email/phone/order
// data) into err.message. Vercel function logs are NOT BAA-covered →
// PII landed in cleartext infra logs.
//
// 3 detection patterns: raw `, err)` trailing arg · `${err.message}`
// template interp · `String(err)` fallback ternary (all bypass
// err.name defense).
//
// "use client" files skipped — console there runs in operator browser,
// not Vercel logs.
//
// Class history (ported from cannagent v3.350 → v4.835).
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-pii-console-leak.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-pii-console-leak.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-pii-console-leak — Vercel-NOT-BAA-covered doctrine preserved", () => {
  // THE load-bearing anchor — Vercel logs ≠ BAA → PII leak risk.
  // Drift to "stylistic" loses the entire WHY.
  assert.match(
    GATE_SRC,
    /NOT\s+BAA-covered/i,
    "Vercel-NOT-BAA-covered anchor",
  );
  assert.match(GATE_SRC, /PII/, "PII leak class named");
  assert.match(
    GATE_SRC,
    /SDK\s+errors?\s+echo/i,
    "SDK-errors-echo mechanism documented",
  );
});

test("check-pii-console-leak — class history anchors (v3.350 + v4.235-v4.835 cannagent port)", () => {
  // 2 cannagent ship windows = the cross-stack class history.
  assert.match(GATE_SRC, /v3\.350/, "v3.350 (root error pages) anchor");
  assert.match(GATE_SRC, /v4\.235/, "v4.235 (API routes start) anchor");
  assert.match(GATE_SRC, /v4\.835/, "v4.835 (API routes end) anchor");
});

test("check-pii-console-leak — 3 detection regexes pinned (raw arg + template + String fallback)", () => {
  // The 3 forms — drift drops one = bypass.
  assert.match(GATE_SRC, /RAW_ERR_RE/, "raw-err trailing-arg regex named");
  assert.match(
    GATE_SRC,
    /MSG_INTERP_RE/,
    "template `${err.message}` regex named",
  );
  assert.match(
    GATE_SRC,
    /STRING_FALLBACK_RE/,
    "String(err) ternary fallback regex named",
  );
});

test("check-pii-console-leak — String(err) bypass rationale documented (err.name defense)", () => {
  // The WHY of catching `: String(err)` — bypasses the err.name defense
  // (String(new Error("PII")) → "Error: PII" echoes message).
  assert.match(
    GATE_SRC,
    /err\.name\s+defense/i,
    "err.name defense reference",
  );
  assert.match(
    GATE_SRC,
    /String\(new Error/i,
    "String(new Error()) bypass example documented",
  );
});

test("check-pii-console-leak — 8 error-var names pinned (err/error/e/caught/rowErr/...)", () => {
  // The 8 conventional error-binding names. Drift drops one = miss.
  for (const name of [
    "err",
    "error",
    "caught",
    "rowErr",
    "sendErr",
    "fetchErr",
    "dbErr",
    "parseErr",
  ]) {
    assert.ok(
      GATE_SRC.includes(name),
      `error-var name ${name} must be in detection`,
    );
  }
});

test("check-pii-console-leak — `use client` files skipped (operator DevTools ≠ Vercel logs)", () => {
  // CRITICAL — client console.* runs in operator browser DevTools, not
  // server. Pin the skip rule + rationale.
  assert.match(
    GATE_SRC,
    /["']use client["']/,
    "use-client directive detection pinned",
  );
  assert.match(
    GATE_SRC,
    /[Bb]rowser\s+DevTools/,
    "operator-DevTools rationale documented",
  );
});

test("check-pii-console-leak — cross-stack port anchors (cannagent + inv-App + GW v2.97.Z425)", () => {
  // 3 sister-stack ports — pin so cross-stack provenance stays.
  assert.match(GATE_SRC, /cannagent\s+v6\.3765/i, "cannagent v6.3765 anchor");
  assert.match(GATE_SRC, /inv-App/, "inv-App sister anchor");
  assert.match(GATE_SRC, /GW\s+v2\.97\.Z425/, "GW v2.97.Z425 sister anchor");
});

test("check-pii-console-leak — fix-recipe: err.name OR String(err) — last resort", () => {
  // Self-documenting fix recipe.
  assert.match(
    GATE_SRC,
    /err\s+instanceof\s+Error\s*\?\s*err\.name/,
    "fix recipe: err instanceof Error ? err.name pinned",
  );
});

test("check-pii-console-leak — ALLOWLIST = lib/version.ts (changelog prose)", () => {
  // The release notes legitimately quote the literal forbidden patterns.
  assert.match(
    GATE_SRC,
    /"lib\/version\.ts"/,
    "ALLOWLIST lib/version.ts (changelog) pinned",
  );
});

test("check-pii-console-leak — walker excludes __tests__ + .test/.spec (self-trip defense)", () => {
  // Pin file contains forbidden patterns in regex assertions. Walker
  // must skip OR gate self-trips.
  assert.match(GATE_SRC, /entry === "__tests__"/, "__tests__ dir skip");
  assert.match(GATE_SRC, /\.endsWith\(["']\.test\.ts["']\)/, ".test.ts skip");
  assert.match(GATE_SRC, /\.endsWith\(["']\.spec\.ts["']\)/, ".spec.ts skip");
});

test("check-pii-console-leak — fail-loud exit 1 (HIGH-STAKES — no --warn opt-out)", () => {
  assert.match(GATE_SRC, /process\.exit\(1\)/, "fail-loud exit 1");
  assert.ok(
    !GATE_SRC.includes("--warn"),
    "no --warn opt-out (HIGH-STAKES PII gate)",
  );
});
