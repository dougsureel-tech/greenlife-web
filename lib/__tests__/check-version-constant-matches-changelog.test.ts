// Pin tests for scripts/check-version-constant-matches-changelog.mjs.
//
// 49th (FINAL) gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: BUILD_VERSION constant + latest changelog entry MUST stay
// aligned. Drift = "silent ship" class — comment block bumped but
// constant forgotten → prod footer + /api/health.version stuck on the
// PREVIOUS version even though git sha is new.
//
// 2026-05-21 incident: v29.805 (brand-logo manifest gate) shipped NEW
// changelog comment but FORGOT to update `export const BUILD_VERSION`
// — prod footer stuck at v29.785 until v29.815 catch-up. Same class
// as Sureel v0.2.6/7/8 silent ships → v0.2.9 catch-up.
//
// Bypass: `git push --no-verify` for legitimate changelog catch-up
// commits where the constant intentionally lags.
//
// THIS IS GATE 49/49 — completes the GLW marathon-port to 100%.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-version-constant-matches-changelog.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(
  process.cwd(),
  "scripts/check-version-constant-matches-changelog.mjs",
);
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-version-constant-matches-changelog — v29.805 + v29.815 + 2026-05-21 incident anchors", () => {
  assert.match(GATE_SRC, /v29\.805/, "v29.805 (brand-logo manifest gate) incident anchor");
  assert.match(GATE_SRC, /v29\.815/, "v29.815 catch-up anchor");
  assert.match(GATE_SRC, /v29\.785/, "v29.785 (pre-incident stuck version) anchor");
  assert.match(GATE_SRC, /2026-05-21/, "2026-05-21 incident date");
});

test("check-version-constant-matches-changelog — sister Sureel v0.2.6-9 catch-up arc anchor", () => {
  // Cross-stack parallel: same class on Sureel.
  assert.match(GATE_SRC, /Sureel/, "Sureel sister-stack anchor");
  assert.match(GATE_SRC, /v0\.2\.(?:6|9)/, "Sureel v0.2.6 or v0.2.9 anchor");
});

test("check-version-constant-matches-changelog — silent-ship-class doctrine documented", () => {
  // THE class name. Pin so it's discoverable when devs hit it.
  assert.match(
    GATE_SRC,
    /silent\s+ship/i,
    "silent-ship class label preserved",
  );
});

test("check-version-constant-matches-changelog — prod-footer + /api/health.version drift consequence", () => {
  // The 2 prod surfaces that read BUILD_VERSION. Pin so future devs
  // understand the customer-visible impact.
  assert.match(GATE_SRC, /prod\s+footer/i, "prod footer surface anchor");
  assert.match(
    GATE_SRC,
    /\/api\/health\.version/,
    "/api/health.version surface anchor",
  );
});

test("check-version-constant-matches-changelog — VERSION_FILE = lib/version.ts (relative to cwd)", () => {
  assert.match(
    GATE_SRC,
    /VERSION_FILE\s*=\s*resolve\(process\.cwd\(\),\s*["']lib\/version\.ts["']\)/,
    "VERSION_FILE = lib/version.ts pinned",
  );
});

test("check-version-constant-matches-changelog — COMMENT_VERSION_REGEX (line-anchored, em-dash + hyphen)", () => {
  // Critical: the regex must be `^//` line-anchored — otherwise URL
  // fragments / in-prose mentions false-match. Both em-dash + ASCII
  // hyphen accepted (older entries use `-`).
  assert.match(
    GATE_SRC,
    /COMMENT_VERSION_REGEX\s*=\s*\/\^\\\/\\\/.+\/m/,
    "COMMENT_VERSION_REGEX line-anchored + /m flag pinned",
  );
  assert.ok(
    GATE_SRC.includes("[—-]"),
    "em-dash + ASCII-hyphen tolerance pinned",
  );
});

test("check-version-constant-matches-changelog — CONSTANT_REGEX is line-anchored (`^export const`)", () => {
  // CRITICAL: the regex must be `^export` line-anchored — otherwise the
  // literal `export const BUILD_VERSION = "29.785"` mentioned IN the
  // v29.815 catch-up changelog comment matches and gives wrong answer.
  // This is the self-trip defense.
  assert.match(
    GATE_SRC,
    /CONSTANT_REGEX\s*=\s*\/\^export\\s\+const\\s\+BUILD_VERSION/,
    "CONSTANT_REGEX line-anchored to ^export pinned",
  );
});

test("check-version-constant-matches-changelog — graceful missing-file silent-exit (per-repo)", () => {
  // Not a cannabis-stack repo: silently pass. Pin so future tightening
  // doesn't break shared scripts running elsewhere.
  assert.match(
    GATE_SRC,
    /Not\s+a\s+cannabis-stack\s+repo/i,
    "graceful per-repo exit prose",
  );
  assert.match(
    GATE_SRC,
    /existsSync\(VERSION_FILE\)/,
    "existsSync preflight pinned",
  );
});

test("check-version-constant-matches-changelog — no-changelog-entry = warn (don't block)", () => {
  // If the comment block was re-organized, surface a warning but don't
  // block the push. Drift loss tolerable; complete block more painful.
  assert.match(
    GATE_SRC,
    /Format\s+may\s+have\s+drifted/i,
    "format-drift warn prose pinned",
  );
});

test("check-version-constant-matches-changelog — fix-recipe surfaces both values", () => {
  // The error message MUST show both: latest comment version + current
  // constant. So dev knows EXACTLY which one to bump.
  assert.match(
    GATE_SRC,
    /Latest\s+changelog\s+entry\s+comment/i,
    "error msg shows latest changelog version",
  );
  assert.match(
    GATE_SRC,
    /Current\s+BUILD_VERSION\s+constant/i,
    "error msg shows current constant value",
  );
});

test("check-version-constant-matches-changelog — bypass documented (`--no-verify` for catch-up)", () => {
  // The legit-bypass path for changelog catch-up commits.
  assert.match(
    GATE_SRC,
    /--no-verify/,
    "--no-verify bypass documented",
  );
  assert.match(
    GATE_SRC,
    /catch-up\s+commits?/i,
    "catch-up-commit legitimate-bypass rationale",
  );
});

test("check-version-constant-matches-changelog — fail-loud exit 1", () => {
  assert.match(GATE_SRC, /process\.exit\(1\)/, "fail-loud exit 1 pinned");
});
