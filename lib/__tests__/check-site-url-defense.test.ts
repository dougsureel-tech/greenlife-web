// Pin tests for scripts/check-site-url-defense.mjs.
//
// 42nd gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: inline `process.env.NEXT_PUBLIC_SITE_URL || "<canonical>"`
// lacks `.includes(".vercel.app")` rejection. If env drifts to a
// preview hostname, customer email deep-links land on WRONG host.
// Canonical defense: `env && !env.includes(".vercel.app") ? env : "<canonical>"`.
//
// 2-ship arc: v7.235 welcome-email + v7.275 quiz-nurture-email.
// Cross-repo arc: inv v303.605/v305.005/v305.805 + GW v2.82.80.
//
// EXEMPT: 2 email files that use defense + version.ts (no canonical
// pollution risk).
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-site-url-defense.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-site-url-defense.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-site-url-defense — v7.235 + v7.275 ship-arc anchors preserved", () => {
  assert.match(GATE_SRC, /v7\.235/, "v7.235 welcome-email anchor");
  assert.match(GATE_SRC, /v7\.275/, "v7.275 quiz-nurture-email anchor");
});

test("check-site-url-defense — cross-repo arc anchors (inv + GW v2.82.80)", () => {
  // Cross-stack provenance — pin all 4 (inv 3-ship + GW).
  for (const v of ["v303.605", "v305.005", "v305.805", "v2\\.82\\.80"]) {
    assert.match(GATE_SRC, new RegExp(v), `${v} cross-repo anchor`);
  }
});

test("check-site-url-defense — vercel.app-drift wrong-host mechanism documented", () => {
  // THE mechanism: env drift to preview = wrong host on customer emails.
  assert.match(
    GATE_SRC,
    /\.vercel\.app/,
    ".vercel.app preview hostname referenced",
  );
  assert.match(
    GATE_SRC,
    /wrong\s+host/i,
    "wrong-host failure mode prose",
  );
  assert.match(
    GATE_SRC,
    /customer\s+email/i,
    "customer-email surface explicitly anchored",
  );
});

test("check-site-url-defense — both env vars pinned (NEXT_PUBLIC_SITE_URL + NEXT_PUBLIC_SITE_ORIGIN)", () => {
  // 2 vars — both must be detected. Drift drops one = miss.
  assert.match(
    GATE_SRC,
    /PATTERN_SITE_URL\s*=\s*\/process\\\.env\\\.NEXT_PUBLIC_SITE_URL/,
    "PATTERN_SITE_URL pinned",
  );
  assert.match(
    GATE_SRC,
    /PATTERN_SITE_ORIGIN\s*=\s*\/process\\\.env\\\.NEXT_PUBLIC_SITE_ORIGIN/,
    "PATTERN_SITE_ORIGIN pinned",
  );
});

test("check-site-url-defense — detection regex requires `|| \"` (inline fallback shape)", () => {
  // The `||` fallback shape — pin so future tightening keeps it.
  assert.ok(
    GATE_SRC.includes("\\s*\\|\\|\\s*[\"'`]"),
    "|| inline-fallback shape pinned",
  );
});

test("check-site-url-defense — defense-pattern recipe documented in error msg", () => {
  // The canonical fix shape — pin so it stays copy-pasteable.
  assert.match(
    GATE_SRC,
    /env\s*&&\s*!env\.includes\(["']\.vercel\.app["']\)\s*\?\s*env\s*:/,
    "defense pattern recipe pinned",
  );
});

test("check-site-url-defense — EXEMPT 3-entry (welcome-email + quiz-nurture-email + version.ts)", () => {
  for (const f of [
    "lib/welcome-email.ts",
    "lib/quiz-nurture-email.ts",
    "lib/version.ts",
  ]) {
    assert.ok(
      GATE_SRC.includes(`"${f}"`),
      `EXEMPT must include "${f}"`,
    );
  }
});

test("check-site-url-defense — SCAN_DIRS = app + lib + components", () => {
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\["app",\s*"lib",\s*"components"\]/,
    "SCAN_DIRS canonical 3-dir set",
  );
});

test("check-site-url-defense — greenlifecannabis.com canonical fallback referenced", () => {
  // Pin canonical so future cleanup doesn't drop the example.
  assert.match(
    GATE_SRC,
    /greenlifecannabis\.com/,
    "greenlifecannabis.com canonical URL anchored",
  );
});

test("check-site-url-defense — strict by default, --warn opt-in", () => {
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
