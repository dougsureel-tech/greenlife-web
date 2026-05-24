// Pin tests for scripts/check-product-photos-manifest.mjs.
//
// 37th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: lockstep between `lib/product-photos-available.ts`
// manifest entries (PRODUCT_PHOTO_RULES) and
// `public/product-photos/*.{png,jpg,webp}` files on disk. Drift =
// broken-image flash on menu (50-200ms per missing photo).
//
// Sister of `check-brand-logos-manifest.mjs` for the brand-logo tier.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-product-photos-manifest.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(
  process.cwd(),
  "scripts/check-product-photos-manifest.mjs",
);
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-product-photos-manifest — sister-gate reference preserved (check-brand-logos-manifest)", () => {
  // Doctrine link to the sister-tier gate.
  assert.match(
    GATE_SRC,
    /check-brand-logos-manifest/,
    "sister gate reference preserved",
  );
});

test("check-product-photos-manifest — anchored via import.meta.url (arc-guard memory pin)", () => {
  // Cross-stack-cwd-trap memory pin compliance.
  assert.ok(
    GATE_SRC.includes("import.meta.url") &&
      GATE_SRC.includes("fileURLToPath"),
    "REPO_ROOT must anchor via import.meta.url + fileURLToPath",
  );
});

test("check-product-photos-manifest — MANIFEST_PATH = lib/product-photos-available.ts", () => {
  // The SoT manifest file path. Drift breaks the lockstep target.
  assert.match(
    GATE_SRC,
    /MANIFEST_PATH\s*=\s*join\(REPO_ROOT,\s*["']lib["'],\s*["']product-photos-available\.ts["']\)/,
    "MANIFEST_PATH pinned to lib/product-photos-available.ts",
  );
});

test("check-product-photos-manifest — PHOTOS_DIR = public/product-photos", () => {
  // The on-disk target. Drift breaks the lockstep target.
  assert.match(
    GATE_SRC,
    /PHOTOS_DIR\s*=\s*join\(REPO_ROOT,\s*["']public["'],\s*["']product-photos["']\)/,
    "PHOTOS_DIR pinned to public/product-photos",
  );
});

test("check-product-photos-manifest — fileRefRegex: `file: '...'` entry extraction", () => {
  // The manifest-entry extractor. Drift = different parse contract.
  assert.ok(
    GATE_SRC.includes('file:\\s*"([^"]+)"'),
    "fileRefRegex shape pinned (file:\"...\")",
  );
});

test("check-product-photos-manifest — extension filter: .png + .jpg + .webp", () => {
  // 3 browser-renderable formats. Drift drops one = false-orphan.
  assert.match(
    GATE_SRC,
    /\\\.\(png\|jpg\|webp\)\$/i,
    "png + jpg + webp extension filter pinned",
  );
});

test("check-product-photos-manifest — both drift directions checked", () => {
  // Manifest→disk + disk→manifest. Drop one = silent bug class.
  assert.match(
    GATE_SRC,
    /missingOnDisk/,
    "manifest→disk drift direction pinned",
  );
  assert.match(
    GATE_SRC,
    /orphaned/,
    "disk→manifest drift direction pinned",
  );
});

test("check-product-photos-manifest — manifest→disk = HARD fail, disk→manifest = WARN", () => {
  // Asymmetric severity. Manifest pointing at missing file = real bug
  // (broken-image on customer); orphaned files = housekeeping warn
  // (might be deprecated/rollback assets). Pin both behaviors.
  assert.match(
    GATE_SRC,
    /missingOnDisk\.length\s*>\s*0[\s\S]{0,80}?fail\(/,
    "missingOnDisk → fail() pinned",
  );
  assert.match(
    GATE_SRC,
    /orphaned\.length\s*>\s*0[\s\S]{0,80}?console\.warn/,
    "orphaned → console.warn (not fail) pinned",
  );
});

test("check-product-photos-manifest — empty-manifest defensive fail", () => {
  // If the manifest yields 0 entries, that's drift — fail rather than
  // silently report 0/0 OK.
  assert.match(
    GATE_SRC,
    /manifestFiles\.size === 0/,
    "empty-manifest defensive check pinned",
  );
});

test("check-product-photos-manifest — file-existence preflight (MANIFEST + PHOTOS_DIR)", () => {
  // Both paths must exist for the scan to make sense. Pin the preflight.
  assert.match(
    GATE_SRC,
    /!existsSync\(MANIFEST_PATH\)/,
    "manifest preflight pinned",
  );
  assert.match(
    GATE_SRC,
    /!existsSync\(PHOTOS_DIR\)/,
    "photos-dir preflight pinned",
  );
});
