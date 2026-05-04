import { NextRequest, NextResponse } from "next/server";
import { BUILD_VERSION, BUILD_SHA } from "@/lib/version";
import { STORE } from "@/lib/store";
import { getClient } from "@/lib/db";

// Minimal liveness endpoint — no DB hit by default. Returns 200 +
// version + sha + ts in <5ms warm. For uptime monitors that ping every
// 30-60 seconds and only need "is the app process responding".
//
// Optional `?verbose=1` adds a single content-count round-trip
// (productsActive / dealsActive) so a monitor consumer can choose
// between cheap pings + richer signal without 2 separate endpoints.
// Default behavior unchanged when query param absent.
//
// /api/health (with full DB + content checks) stays the right surface
// for 5-minute periodicity. This is for second-bucket pings.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function checkContentLite(): Promise<{
  productsActive: number;
  dealsActive: number;
} | null> {
  try {
    const sql = getClient();
    const [p, d] = await Promise.all([
      sql`SELECT COUNT(*)::int AS n FROM products WHERE carry_status = 'active'`,
      sql`SELECT COUNT(*)::int AS n FROM deals
          WHERE status = 'active'
            AND (start_date IS NULL OR start_date <= CURRENT_DATE)
            AND (end_date IS NULL OR end_date >= CURRENT_DATE)`,
    ]);
    return {
      productsActive: (p as Array<{ n: number }>)[0]?.n ?? 0,
      dealsActive: (d as Array<{ n: number }>)[0]?.n ?? 0,
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const verbose = req.nextUrl.searchParams.get("verbose") === "1";
  const content = verbose ? await checkContentLite() : null;

  return NextResponse.json(
    {
      ok: true,
      version: BUILD_VERSION,
      sha: BUILD_SHA,
      ts: new Date().toISOString(),
      ...(verbose ? { content } : {}),
    },
    {
      headers: {
        "cache-control": "no-store, must-revalidate",
        "x-health-status": "ok",
        // Mirror version + sha as response headers so monitors can
        // detect deploy SHA changes via `curl --head` without JSON
        // parsing.
        "x-version": BUILD_VERSION,
        "x-sha": BUILD_SHA,
        "x-store-name": STORE.name,
      },
    },
  );
}
