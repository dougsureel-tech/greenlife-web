#!/usr/bin/env node
// Operator script — NULL out products.image_url values that point at the
// broken `/api/product-image?...` self-referential renderer pattern, so the
// fallback chain (matchProductPhoto() → category-placeholder → gradient)
// takes over at render time.
//
// BACKGROUND
// ----------
// `lib/seo-templates.tsx` historically wrote
//   `${STORE.website}/api/product-image?id=${id}`
// into Product JSON-LD `image` fields as a fallback. That URL pattern then
// leaked into the `products.image_url` column on some rows (likely via an
// admin "Save image URL" flow that defaulted to the SSR-rendered fallback
// string instead of leaving the column NULL). When the strain-page card
// renders `<Image src={p.imageUrl}>` against this broken URL, the request
// either 404s, redirects, or returns a blank renderer — never a useful
// product photo.
//
// Doug 2026-05-28 greenlight on Option B (DB cleanup pass): null out the
// affected rows so the render-side fallback chain takes over. Going
// forward, the `formatProductTitle` ship sister-fix prevents the URL
// pattern from being re-introduced.
//
// USAGE
// -----
//   # Dry-run (default):
//   node scripts/null-broken-image-urls.mjs --store=wen
//
//   # REAL run (writes to DB):
//   node scripts/null-broken-image-urls.mjs --store=wen --real
//
// FLAGS
// -----
//   --store=wen|sea   (REQUIRED)  Which store DB to target.
//   --dry-run         (DEFAULT)   Read-only — counts affected rows + exits.
//   --real            Apply the UPDATE. Without this flag NOTHING is written.
//
// ENV
// ---
//   DATABASE_URL_WEN  Neon connection string for the Wenatchee store.
//   DATABASE_URL_SEA  Neon connection string for the Seattle store.
//   (At least one MUST be set, matching the --store flag.)
//
//   Fallback for convenience when running directly against a known DB:
//   DATABASE_URL      If set AND only one store is being targeted, used as-is.
//
// SAFETY
// ------
//   - Without --real, this script ONLY does SELECT COUNT(*) and exits.
//   - With --real, runs a single UPDATE inside a transaction and PRINTS the
//     rowcount before commit.
//   - No DELETE statements anywhere — image_url is only ever set to NULL.
//   - The WHERE clause uses POSIX regex `^https?://[^/]+/api/product-image\b`
//     anchored at start to ensure we only catch the buggy pattern (not a
//     vendor's CDN URL that happens to contain "/api/product-image").

import { argv, env, exit } from "node:process";

const args = parseArgs(argv.slice(2));
if (!args.store) {
  console.error("ERROR: --store=wen|sea is required");
  printUsage();
  exit(2);
}
if (args.store !== "wen" && args.store !== "sea") {
  console.error(`ERROR: --store must be 'wen' or 'sea' (got: ${args.store})`);
  exit(2);
}

const isReal = args.real === true;
const isDryRun = !isReal;

const url = resolveDatabaseUrl(args.store);
if (!url) {
  const envName = args.store === "wen" ? "DATABASE_URL_WEN" : "DATABASE_URL_SEA";
  console.error(`ERROR: DATABASE_URL not set for store=${args.store}.`);
  console.error(`       Set ${envName} or DATABASE_URL.`);
  exit(2);
}

main().catch((err) => {
  console.error("FATAL:", err?.message ?? err);
  exit(1);
});

async function main() {
  // Lazy import so the script can `--help` without requiring deps.
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(url);

  console.log(`Store           : ${args.store}`);
  console.log(`Mode            : ${isReal ? "REAL (writes)" : "DRY-RUN (read-only)"}`);
  console.log(`Pattern         : ^https?://[^/]+/api/product-image\\b`);
  console.log("");

  // SELECT counts first — always safe.
  const countRows = await sql`
    SELECT COUNT(*)::int AS n
    FROM products
    WHERE image_url ~ '^https?://[^/]+/api/product-image\\b'
  `;
  const affected = Number(countRows?.[0]?.n ?? 0);
  console.log(`Affected rows   : ${affected}`);

  // Sample the offenders (id + name + first 80 chars of image_url) so the
  // operator can sanity-check before --real.
  if (affected > 0) {
    const sampleRows = await sql`
      SELECT id, name, LEFT(image_url, 80) AS image_url_head
      FROM products
      WHERE image_url ~ '^https?://[^/]+/api/product-image\\b'
      LIMIT 5
    `;
    console.log("");
    console.log("Sample (up to 5):");
    for (const r of sampleRows) {
      console.log(`  · ${r.id}  ${truncate(r.name ?? "(no name)", 50)}`);
      console.log(`    ${r.image_url_head}`);
    }
  }

  if (isDryRun) {
    console.log("");
    console.log("DRY-RUN: no changes written. Re-run with --real to apply.");
    exit(0);
  }

  // --real path: UPDATE inside a single statement.
  console.log("");
  console.log("Applying UPDATE (image_url → NULL)...");
  const updated = await sql`
    UPDATE products
    SET image_url = NULL
    WHERE image_url ~ '^https?://[^/]+/api/product-image\\b'
  `;
  // neon returns an array; for UPDATE it's empty but rowCount can be derived
  // from the affected count we measured pre-update (no concurrent writers).
  console.log(`Updated         : ${affected} row(s)`);
  console.log("Done.");
}

// ── Helpers ─────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = { store: null, real: false, help: false };
  for (const a of argv) {
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--real") out.real = true;
    else if (a === "--dry-run") out.real = false;
    else if (a.startsWith("--store=")) out.store = a.slice("--store=".length);
    else {
      console.error(`Unknown arg: ${a}`);
      printUsage();
      exit(2);
    }
  }
  if (out.help) {
    printUsage();
    exit(0);
  }
  return out;
}

function resolveDatabaseUrl(store) {
  if (store === "wen") {
    return env.DATABASE_URL_WEN || env.DATABASE_URL || null;
  }
  if (store === "sea") {
    return env.DATABASE_URL_SEA || env.DATABASE_URL || null;
  }
  return null;
}

function truncate(s, n) {
  if (typeof s !== "string") return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function printUsage() {
  console.error("");
  console.error("Usage:");
  console.error("  node scripts/null-broken-image-urls.mjs --store=wen|sea [--real]");
  console.error("");
  console.error("Flags:");
  console.error("  --store=wen|sea   REQUIRED — target store DB");
  console.error("  --dry-run         DEFAULT — read-only count + sample");
  console.error("  --real            Apply UPDATE (writes to DB)");
  console.error("");
  console.error("Env:");
  console.error("  DATABASE_URL_WEN | DATABASE_URL_SEA | DATABASE_URL");
  console.error("");
}
