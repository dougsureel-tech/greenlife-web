import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { STORE } from "@/lib/store";

// In-app admin trigger for the `null-broken-image-urls` cleanup script.
//
// Sister-port of `scripts/null-broken-image-urls.mjs` (the standalone
// CLI tool) into a callable HTTP endpoint. The CLI tool depends on
// DATABASE_URL_WEN / DATABASE_URL_SEA being set locally, which is
// awkward because the Neon connection string is Marketplace-bound to
// the Vercel project and not easily exported to a dev laptop. This
// endpoint runs INSIDE the Vercel deployment where DATABASE_URL is
// already bound to the right Neon database, so Doug can curl it
// without needing the credentials on his machine.
//
// BACKGROUND
// ----------
// `lib/seo-templates.tsx` historically wrote
//   `${STORE.website}/api/product-image?id=${id}`
// into Product JSON-LD `image` fields as a fallback. That URL pattern
// then leaked into the `products.image_url` column on some rows. When
// the strain-page card renders <Image src={p.imageUrl}> against this
// broken URL, the request either 404s, redirects, or returns a blank
// renderer — never a useful product photo.
//
// Doug 2026-05-28 greenlight on Option B (DB cleanup pass): null out
// the affected rows so the render-side fallback chain takes over.
//
// AUTH
// ----
// Bearer token only — same `CRON_SECRET` env as the existing
// `/api/cron/retry-memory-prompts` route. Bearer is sufficient because
// (a) this is a maintenance endpoint not a customer surface and
// (b) the write path is gated behind an explicit `?execute=true` flag
// that has to be deliberately set. Public sites don't have a manager-
// session shape — bearer is the standard auth for `/api/admin/*` here.
//
// SAFETY
// ------
// - Default (no `?execute=true`): READ-ONLY — runs SELECT COUNT(*) +
//   sample 5 product names. No SQL write statements present in the
//   dry-run code path (pin-tested).
// - `?execute=true`: runs a single UPDATE inside a regex-bound WHERE.
//   No DELETE statements anywhere — image_url is only ever set to NULL.
// - The WHERE clause uses POSIX regex `^https?://[^/]+/api/product-image\b`
//   anchored at start to ensure we only catch the buggy pattern (not a
//   vendor's CDN URL that happens to contain "/api/product-image").
// - No user input is interpolated into the SQL — the regex is a string
//   literal in this file. No SQL-injection vector.
// - PII: product names are surfaced in the dry-run sample. Product
//   names are PUBLIC info (visible on `/strains/*` pages) so this is
//   safe to return. No customer data is touched.
//
// USAGE
// -----
//   # Dry-run (default):
//   curl -fsS -H "Authorization: Bearer $CRON_SECRET" \
//     -X POST "https://www.greenlifecannabis.com/api/admin/maintenance/null-broken-image-urls"
//
//   # REAL execute:
//   curl -fsS -H "Authorization: Bearer $CRON_SECRET" \
//     -X POST "https://www.greenlifecannabis.com/api/admin/maintenance/null-broken-image-urls?execute=true"

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The image-url pattern to scrub. Anchored at start to avoid catching
// vendor CDN URLs that happen to contain the substring. Single source
// of truth used in BOTH the dry-run COUNT/sample queries AND the
// execute-mode UPDATE WHERE clause.
const BROKEN_PATTERN = "^https?://[^/]+/api/product-image\\b";

function secretMatches(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(provided, "utf-8"),
      Buffer.from(expected, "utf-8"),
    );
  } catch {
    return false;
  }
}

function verifyBearer(
  authHeader: string | null,
  expected: string | undefined,
): boolean {
  if (!expected || expected.length === 0) return false;
  if (!authHeader) return false;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  return secretMatches(match[1]!, expected);
}

type SampleRow = { name: string };
type CountRow = { n: number };

async function handle(req: Request): Promise<NextResponse> {
  // Auth gate — refuse without a valid bearer.
  const ok = verifyBearer(req.headers.get("authorization"), process.env.CRON_SECRET);
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  // Explicit opt-in to write mode. Default = dry-run.
  // Belt-and-suspenders: also accept ?execute=1 for shell-quoting safety.
  const executeParam = url.searchParams.get("execute");
  const execute = executeParam === "true" || executeParam === "1";
  const dryRun = !execute;

  // DATABASE_URL is provisioned on every Vercel project via the Neon
  // Marketplace integration. If it's missing we refuse rather than
  // throw — operator gets a clear signal.
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json(
      { error: "DATABASE_URL not configured" },
      { status: 500 },
    );
  }

  // Lazy import — only pay the neon-client cost when the route is hit
  // (which is rare for a maintenance endpoint).
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(dbUrl);

  const queriedAt = new Date().toISOString();

  try {
    // SELECT counts first — always safe. Same query the CLI tool runs.
    const countRows = (await sql`
      SELECT COUNT(*)::int AS n
      FROM products
      WHERE image_url ~ ${BROKEN_PATTERN}
    `) as unknown as CountRow[];
    const matched = Number(countRows?.[0]?.n ?? 0);

    // Sample up to 5 product names for the operator to sanity-check.
    // Product names are public (visible on /strains/* pages) so safe
    // to surface. No customer/PII data touched.
    let sampleProductNames: string[] = [];
    if (matched > 0) {
      const sampleRows = (await sql`
        SELECT name
        FROM products
        WHERE image_url ~ ${BROKEN_PATTERN}
        LIMIT 5
      `) as unknown as SampleRow[];
      sampleProductNames = sampleRows
        .map((r) => (typeof r.name === "string" ? r.name : ""))
        .filter((n) => n.length > 0);
    }

    if (dryRun) {
      return NextResponse.json({
        store_hint: STORE.name,
        dry_run: true,
        executed: false,
        counts: {
          matched_rows: matched,
          sample_product_names: sampleProductNames,
        },
        queried_at: queriedAt,
        message:
          "DRY-RUN — no changes written. Re-run with ?execute=true to apply.",
      });
    }

    // ── Execute path ──
    // Single UPDATE statement. NULL out image_url for every row matching
    // the broken pattern. Atomic + finite — no row-per-call cap needed.
    await sql`
      UPDATE products
      SET image_url = NULL
      WHERE image_url ~ ${BROKEN_PATTERN}
    `;

    return NextResponse.json({
      store_hint: STORE.name,
      dry_run: false,
      executed: true,
      counts: {
        matched_rows: matched,
        sample_product_names: sampleProductNames,
      },
      affected: matched,
      queried_at: queriedAt,
      message: `Updated ${matched} row(s) — image_url set to NULL where pattern matched.`,
    });
  } catch (err) {
    // Don't echo err.message — DB errors can leak schema details.
    const errName = err instanceof Error ? err.name : "unknown";
    return NextResponse.json(
      { ok: false, error: `db-failed: ${errName}` },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  return handle(req);
}
