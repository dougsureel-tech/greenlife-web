// Pin tests for scripts/check-brand-logos-manifest.mjs.
//
// 5th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: lib/brand-logos-available.ts exports BRAND_LOGOS_AVAILABLE
// Set — the SSoT for which brand-logo PNGs exist on disk. OrderMenu.tsx
// reads this BEFORE issuing an Image src that would 404 + flash the
// broken-image icon for 50-200ms. Drift in either direction (PNG without
// manifest entry OR manifest entry without PNG) = bad UX.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-brand-logos-manifest.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-brand-logos-manifest.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-brand-logos-manifest — anchors via import.meta.url (NOT cwd-relative)", () => {
  // Per `feedback_arc_guard_cwd_relative_path_trap` memory pin: gates
  // using cwd-relative paths break when invoked from outside the repo
  // root (pre-push hooks fire with cwd = .git/hooks/ for example). Pin
  // the import.meta.url + fileURLToPath anchoring so a future refactor
  // doesn't regress.
  assert.ok(
    GATE_SRC.includes("import.meta.url") &&
      GATE_SRC.includes("fileURLToPath"),
    "gate must anchor REPO_ROOT via import.meta.url + fileURLToPath",
  );
});

test("check-brand-logos-manifest — scans the canonical 2 paths only", () => {
  // LOGOS_DIR = public/brand-logos · MANIFEST_FILE = lib/brand-logos-available.ts
  // Pin both — drift in either path = gate scans the wrong place +
  // silently passes while drift accumulates.
  assert.match(
    GATE_SRC,
    /["']public["']\s*,\s*["']brand-logos["']/,
    "LOGOS_DIR must point to public/brand-logos",
  );
  assert.match(
    GATE_SRC,
    /["']lib["']\s*,\s*["']brand-logos-available\.ts["']/,
    "MANIFEST_FILE must point to lib/brand-logos-available.ts",
  );
});

test("check-brand-logos-manifest — only .png files counted on disk", () => {
  // The brand-logo system is PNG-only (transparent backgrounds). A drift
  // to include .svg or .jpg would silently allow non-canonical formats
  // into the manifest sync check.
  assert.match(
    GATE_SRC,
    /\.endsWith\(["']\.png["']\)/,
    "disk scan must filter to .png only",
  );
  assert.match(
    GATE_SRC,
    /\.replace\(\/\\\.png\$\/,\s*""\)/,
    "slug derivation must strip .png suffix",
  );
});

test("check-brand-logos-manifest — manifest parser uses `new Set([...])` literal extraction", () => {
  // The manifest file is a TS file exporting BRAND_LOGOS_AVAILABLE =
  // new Set([...]). The gate parses this WITHOUT importing (no tsc
  // dependency in pre-push). Pin the parser shape so a refactor that
  // changes the manifest export shape (e.g. const arr = [...]) surfaces
  // the gate as out-of-sync.
  assert.ok(
    GATE_SRC.includes("new Set\\(\\[") ||
      GATE_SRC.includes('new Set([') ||
      GATE_SRC.includes("new\\s*Set"),
    "manifest parser must match `new Set([...])` literal",
  );
});

test("check-brand-logos-manifest — checks both drift directions (disk→manifest + manifest→disk)", () => {
  // Both directions matter: PNG-without-manifest = wasted file (and
  // future "where did this come from" confusion); manifest-without-PNG
  // = broken-image flash in prod. Pin both diff computations.
  assert.ok(
    GATE_SRC.includes("inDiskNotManifest"),
    "disk → manifest drift detection pinned",
  );
  assert.ok(
    GATE_SRC.includes("inManifestNotDisk"),
    "manifest → disk drift detection pinned",
  );
});

test("check-brand-logos-manifest — sorted output (deterministic for CI logs + diff stability)", () => {
  // Sorted drift output = stable diff in CI logs across runs. Drift
  // would mean every fail prints a different order, making 'is this a
  // new failure?' grep impossible.
  assert.ok(
    GATE_SRC.includes(".sort()"),
    "drift outputs must be .sort()ed for deterministic CI logs",
  );
});

test("check-brand-logos-manifest — fail-loud on parse failure (missing manifest = exit 1)", () => {
  // If lib/brand-logos-available.ts can't be read OR doesn't contain
  // the expected `new Set([...])` block, fail loud — don't silently
  // pass with 0 entries. Pin the two failure paths.
  assert.match(
    GATE_SRC,
    /could not locate.*new\s*Set/,
    "missing-Set-block error message pinned",
  );
  assert.match(
    GATE_SRC,
    /cannot read.*MANIFEST/i,
    "cannot-read-manifest error message pinned",
  );
});

test("check-brand-logos-manifest — exit codes: 0 on sync, 1 on drift OR parse fail", () => {
  // No --warn mode here — this is a strict gate (drift = broken-image
  // UX flash). Pin both exit paths.
  assert.match(
    GATE_SRC,
    /process\.exit\(0\)/,
    "exit 0 on clean-sync pinned",
  );
  assert.match(
    GATE_SRC,
    /process\.exit\(1\)/,
    "exit 1 on drift / parse-fail pinned",
  );
});
