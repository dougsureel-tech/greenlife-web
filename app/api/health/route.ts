import { NextResponse } from "next/server";
import { getClient } from "@/lib/db";
import { BUILD_VERSION, BUILD_SHA } from "@/lib/version";

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

export async function GET() {
  const startedAt = Date.now();
  const db = await checkDb();
  const elapsedMs = Date.now() - startedAt;

  const allOk = db.ok;
  const body = {
    ok: allOk,
    version: BUILD_VERSION,
    sha: BUILD_SHA,
    ts: new Date().toISOString(),
    elapsedMs,
    checks: { db },
  };

  return NextResponse.json(body, {
    status: allOk ? 200 : 503,
    headers: {
      "cache-control": "no-store, must-revalidate",
      "x-health-status": allOk ? "ok" : "degraded",
    },
  });
}
