import { NextResponse } from "next/server";
import { BUILD_VERSION, BUILD_SHA } from "@/lib/version";
import { STORE } from "@/lib/store";

// Minimal liveness endpoint — no DB hit, no external calls. Returns
// 200 + version + sha + ts in <5ms warm. For uptime monitors that ping
// every 30-60 seconds and only need "is the app process responding"
// — `/api/health` (with DB + content checks) is the right surface for
// 5-minute periodicity, this is for second-bucket pings.
//
// Why a separate endpoint instead of `?fast=1` on /api/health: the
// monitor consumer should be able to commit to one URL pattern. Both
// surfaces here have distinct contracts (this one never 503s on DB
// outage; /api/health 503s on DB outage). Different signals, different
// URLs.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      version: BUILD_VERSION,
      sha: BUILD_SHA,
      ts: new Date().toISOString(),
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
