import { NextResponse } from "next/server";
import { getClient } from "@/lib/db";
import { BUILD_VERSION, BUILD_SHA } from "@/lib/version";
import { STORE } from "@/lib/store";

// Health check for external uptime monitors + the auto-rollback path
// (PLAN_RELIABILITY.md). Returns 200 + diagnostics when everything is up,
// 503 + the failure mode when not. Fast — under 500ms p95 — so a monitor
// pinging every 60 seconds doesn't cost us anything meaningful.
//
// Checks:
//   - DB connectivity (cheap read of vendors count; if Neon is unreachable
//     or the connection string is wrong, this is the first thing to fail)
//   - Build identity (so the monitor knows WHICH commit is responding)
//
// What this route deliberately does NOT do:
//   - Hit external services (iHeartJane Boost, Resend, Clerk). The health
//     of /api/health should reflect THIS app's health, not partner uptime.
//     If iHeartJane goes down, /menu degrades gracefully via MenuFallback;
//     /api/health stays green because our own surface is fine.
//   - Authenticate. The monitor is anonymous and so is this endpoint.
//     Returns no secrets — just status + version + sha + a count.
//
// Cache: no-store. Health checks must hit fresh state every call.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckResult = { ok: true; host: string | null } | { ok: false; error: string; host: string | null };

// Extract just the hostname from DATABASE_URL — no creds, no path. Used
// for cross-wiring diagnostics (see Inventory App's v6.327 store-identity
// guardrail). If two stores ever share a Neon host, this field exposes
// the collision without leaking credentials.
function dbHost(): string | null {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL ?? "";
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

async function checkDb(): Promise<CheckResult> {
  const host = dbHost();
  try {
    const sql = getClient();
    const rows = (await sql`SELECT COUNT(*)::int AS n FROM vendors`) as Array<{ n: number }>;
    if (!rows || rows.length === 0) {
      return { ok: false, error: "vendors query returned no rows", host };
    }
    return { ok: true, host };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message.slice(0, 200) : "unknown db error",
      host,
    };
  }
}

// Content-level signal — counts of customer-visible surfaces (active
// products + active deals). A deploy can pass DB connectivity but
// break a query that returns the customer-facing content; this surfaces
// that failure mode to external monitors without auth.
//
// Returns counts even on error so the response shape stays stable.
// The health `ok` field stays bound to db.ok only — content counts
// are informational, not 503-tripping (a temporarily empty deals
// table is not a system outage). Monitor consumers can grep on
// `productsActive=0` if they want a stricter degradation signal.
async function checkContent(): Promise<{
  productsActive: number;
  dealsActive: number;
  error: string | null;
}> {
  try {
    const sql = getClient();
    // Column names mirror lib/db.ts (getMenuProducts / getActiveDeals):
    //   products.carry_status  (NOT products.active)
    //   deals.status           (NOT deals.active)
    //   deals.start_date / deals.end_date  (NOT starts_at / ends_at)
    // Earlier versions of this probe assumed timestamp-style names and
    // tripped a "column does not exist" error on every monitor poll.
    const [productRows, dealRows] = await Promise.all([
      sql`SELECT COUNT(*)::int AS n FROM products WHERE carry_status = 'active'`,
      sql`SELECT COUNT(*)::int AS n FROM deals
          WHERE status = 'active'
            AND (start_date IS NULL OR start_date <= CURRENT_DATE)
            AND (end_date IS NULL OR end_date >= CURRENT_DATE)`,
    ]);
    const products = (productRows as Array<{ n: number }>)[0]?.n ?? 0;
    const deals = (dealRows as Array<{ n: number }>)[0]?.n ?? 0;
    return { productsActive: products, dealsActive: deals, error: null };
  } catch (err) {
    return {
      productsActive: 0,
      dealsActive: 0,
      error: err instanceof Error ? err.message.slice(0, 200) : "unknown content error",
    };
  }
}

export async function GET() {
  const startedAt = Date.now();
  // Parallelize the two read paths so the slower one bounds the latency
  // (the DB check is ~30ms warm, the content counts ~50-80ms; serial
  // would hit ~110ms p95, parallel stays ~80ms).
  const [db, content] = await Promise.all([checkDb(), checkContent()]);
  const elapsedMs = Date.now() - startedAt;

  const allOk = db.ok;
  const body = {
    ok: allOk,
    version: BUILD_VERSION,
    sha: BUILD_SHA,
    ts: new Date().toISOString(),
    elapsedMs,
    checks: { db, content },
  };

  return NextResponse.json(body, {
    status: allOk ? 200 : 503,
    headers: {
      "cache-control": "no-store, must-revalidate",
      "x-health-status": allOk ? "ok" : "degraded",
      // Mirror version + sha + store-name as response headers so
      // monitors detect deploy SHA + identify which store responded
      // via curl --head, without JSON parsing.
      "x-version": BUILD_VERSION,
      "x-sha": BUILD_SHA,
      "x-store-name": STORE.name,
    },
  });
}
