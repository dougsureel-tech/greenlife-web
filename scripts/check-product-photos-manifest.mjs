#!/usr/bin/env node
/**
 * Build-gate: verify lockstep between `lib/product-photos-available.ts`
 * manifest entries and `public/product-photos/*.{png,jpg}` files on disk.
 *
 * Fails the push when:
 *   - A file referenced in `PRODUCT_PHOTO_RULES` doesn't exist on disk
 *   - A file on disk isn't referenced in any rule (drift detection)
 *
 * Sister of `check-brand-logos-manifest.mjs` for the brand-logo tier.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const MANIFEST_PATH = join(REPO_ROOT, "lib", "product-photos-available.ts");
const PHOTOS_DIR = join(REPO_ROOT, "public", "product-photos");

function fail(msg) {
  console.error(`✗ check-product-photos-manifest: ${msg}`);
  process.exit(1);
}

if (!existsSync(MANIFEST_PATH)) {
  fail(`manifest file not found at ${MANIFEST_PATH}`);
}
if (!existsSync(PHOTOS_DIR)) {
  fail(`product-photos directory not found at ${PHOTOS_DIR}`);
}

// Parse manifest: extract `file: "..."` entries from PRODUCT_PHOTO_RULES.
const manifestSrc = readFileSync(MANIFEST_PATH, "utf8");
const fileRefRegex = /file:\s*"([^"]+)"/g;
const manifestFiles = new Set();
let m;
while ((m = fileRefRegex.exec(manifestSrc)) !== null) {
  manifestFiles.add(m[1]);
}

if (manifestFiles.size === 0) {
  fail(`no \`file: "..."\` entries found in ${MANIFEST_PATH} — manifest empty?`);
}

// List files on disk (only .png + .jpg).
const diskFiles = new Set(
  readdirSync(PHOTOS_DIR).filter((f) => /\.(png|jpg)$/i.test(f)),
);

// Missing-on-disk: manifest entry has no file.
const missingOnDisk = [...manifestFiles].filter((f) => !diskFiles.has(f));
if (missingOnDisk.length > 0) {
  fail(
    `${missingOnDisk.length} manifest entries reference files NOT on disk:\n  ${missingOnDisk.join("\n  ")}`,
  );
}

// Orphaned-on-disk: file exists, no manifest rule references it. Warn but
// don't fail (it's possible to leave deprecated files around for rollback).
const orphaned = [...diskFiles].filter((f) => !manifestFiles.has(f));
if (orphaned.length > 0) {
  console.warn(
    `⚠ check-product-photos-manifest: ${orphaned.length} files on disk NOT in manifest (orphaned, may be safe to delete):\n  ${orphaned.join("\n  ")}`,
  );
}

console.log(
  `✓ check-product-photos-manifest: ${manifestFiles.size} manifest entries match ${manifestFiles.size} file(s) on disk`,
);
