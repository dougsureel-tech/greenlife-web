import { NextRequest, NextResponse } from "next/server";
import { deletePushSubscription } from "@/lib/push-db";
import { MINUTE_MS } from "@/lib/time-constants";
import { createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Per-IP rate limit on the anon POST. Each call runs a DB DELETE against
// the push_subscriptions table on a 1024-char endpoint string. Without a
// limit, a scripted attacker who has captured legitimate endpoint URLs
// (e.g. via leaked browser DevTools) could mass-unsubscribe victims, OR
// just spam-call to bog down the index probe + bloat Vercel logs. 10/min
// is generous (real users unsubscribe once or zero times); blocks
// scripted abuse. Sister to /api/push/subscribe + /api/track-install +
// /api/quiz/capture defenses (this wave).
const unsubLimiter = createRateLimiter({ limit: 10, windowMs: MINUTE_MS });
function checkUnsubRate(ip: string): boolean {
  return unsubLimiter.check(ip);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!checkUnsubRate(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  let body: { endpoint?: unknown };
  try {
    body = (await req.json()) as { endpoint?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const endpoint = typeof body.endpoint === "string" ? body.endpoint : null;
  if (!endpoint) return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  // Bound payload size — symmetric with /api/push/subscribe's 1024-char cap.
  // Without this, a malicious caller could send a multi-MB string that
  // bogs down the DELETE query's index probe + bloats Vercel response logs.
  if (endpoint.length > 1024) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    await deletePushSubscription(endpoint);
    return NextResponse.json({ ok: true });
  } catch (err) {
    // Format-only — DB errors echo the WHERE clause (endpoint URL =
    // per-device stable identifier). Sister of subscribe-route.ts err.name
    // pattern.
    const reason = err instanceof Error ? err.name : "unknown";
    console.error(`[push/unsubscribe] DB error: ${reason}`);
    return NextResponse.json({ error: "Could not unsubscribe" }, { status: 500 });
  }
}
