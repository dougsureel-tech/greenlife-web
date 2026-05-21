#!/usr/bin/env node
/**
 * Build-gate: brand-logo manifest stays in sync with public/brand-logos/.
 *
 * `lib/brand-logos-available.ts` exports `BRAND_LOGOS_AVAILABLE: Set<string>`
 * — the SSoT for which brand-logo PNGs exist on disk. `OrderMenu.tsx` reads
 * this to gate the brand-logo fallback BEFORE issuing an Image src that
 * would 404 + flash the browser's broken-image icon for ~50-200ms.
 *
 * If a developer drops a new PNG into `public/brand-logos/` but forgets to
 * add the slug to the manifest, OrderMenu still won't render it (because
 * the gate excludes unknown slugs). Conversely, if a PNG is deleted but
 * the slug stays in the manifest, OrderMenu tries to render → 404 →
 * broken-image flash returns.
 *
 * This gate diffs the two and fails the build on drift.
 *
 * Sister of `greenlife-web/scripts/check-brand-logos-manifest.mjs` —
 * identical script, identical doctrine.
 */
import { readdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(SCRIPT_DIR, "..");
const LOGOS_DIR = join(REPO_ROOT, "public", "brand-logos");
const MANIFEST_FILE = join(REPO_ROOT, "lib", "brand-logos-available.ts");

// Files on disk → slug set
let onDisk;
try {
  onDisk = new Set(
    readdirSync(LOGOS_DIR)
      .filter((f) => f.endsWith(".png"))
      .map((f) => f.replace(/\.png$/, "")),
  );
} catch (err) {
  console.error(`✗ check-brand-logos-manifest: cannot read ${LOGOS_DIR}`);
  console.error(`  ${err.message}`);
  process.exit(1);
}

// Manifest content → slug set (parse the `new Set([...])` literal)
let manifest;
try {
  const src = readFileSync(MANIFEST_FILE, "utf-8");
  const setBlock = src.match(/new Set\(\[([\s\S]*?)\]\)/);
  if (!setBlock) {
    console.error(
      `✗ check-brand-logos-manifest: could not locate \`new Set([...])\` in ${MANIFEST_FILE}`,
    );
    process.exit(1);
  }
  manifest = new Set(
    Array.from(setBlock[1].matchAll(/"([^"]+)"/g)).map((m) => m[1]),
  );
} catch (err) {
  console.error(`✗ check-brand-logos-manifest: cannot read ${MANIFEST_FILE}`);
  console.error(`  ${err.message}`);
  process.exit(1);
}

const inDiskNotManifest = [...onDisk].filter((s) => !manifest.has(s)).sort();
const inManifestNotDisk = [...manifest].filter((s) => !onDisk.has(s)).sort();

if (inDiskNotManifest.length === 0 && inManifestNotDisk.length === 0) {
  console.log(
    `✓ check-brand-logos-manifest: ${onDisk.size} brand-logo PNGs on disk match ${manifest.size} manifest entries`,
  );
  process.exit(0);
}

console.error(`✗ check-brand-logos-manifest: drift between filesystem + manifest`);
console.error("");

if (inDiskNotManifest.length > 0) {
  console.error(
    `  ${inDiskNotManifest.length} PNG(s) on disk MISSING from manifest:`,
  );
  for (const s of inDiskNotManifest) console.error(`    + ${s}`);
  console.error(
    `  Fix: add these slugs to BRAND_LOGOS_AVAILABLE in lib/brand-logos-available.ts`,
  );
  console.error("");
}

if (inManifestNotDisk.length > 0) {
  console.error(
    `  ${inManifestNotDisk.length} manifest entry(ies) MISSING the PNG file on disk:`,
  );
  for (const s of inManifestNotDisk) console.error(`    - ${s}`);
  console.error(
    `  Fix: either restore the PNG to public/brand-logos/ OR remove the slug from the manifest. ` +
      `An entry without a matching file lets OrderMenu render a broken-image fetch.`,
  );
  console.error("");
}

process.exit(1);
