import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { upsertPushSubscription } from "@/lib/push-db";
import { MINUTE_MS } from "@/lib/time-constants";

export const runtime = "nodejs";

// Per-IP rate limit on the anon-or-Clerk-OK POST. `auth()` is optional
// here — anonymous browsers can subscribe pre-sign-in. Without a limit,
// a scripted attacker can spam INSERTs of fake endpoint+keys triples,
// ballooning push_subscriptions table size + index pressure. The
// upsert dedupe on endpoint blocks identical-payload spam, but rotating
// random fake endpoints slips past. 10/min/IP matches /api/push/unsubscribe
// + /api/track-install in this repo. Sister scc same wave.
const subRateMap = new Map<string, { count: number; resetAt: number }>();
function checkSubRate(ip: string): boolean {
  const now = Date.now();
  const entry = subRateMap.get(ip);
  if (!entry || entry.resetAt < now) {
    subRateMap.set(ip, { count: 1, resetAt: now + MINUTE_MS });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

type SubscribeBody = {
  endpoint?: unknown;
  keys?: { p256dh?: unknown; auth?: unknown };
};

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!checkSubRate(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const { userId } = await auth();

  let body: SubscribeBody;
  try {
    body = (await req.json()) as SubscribeBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const endpoint = typeof body.endpoint === "string" ? body.endpoint : null;
  const p256dh = typeof body.keys?.p256dh === "string" ? body.keys.p256dh : null;
  const authKey = typeof body.keys?.auth === "string" ? body.keys.auth : null;
  if (!endpoint || !p256dh || !authKey) {
    return NextResponse.json({ error: "Missing endpoint or keys" }, { status: 400 });
  }
  if (endpoint.length > 1024 || p256dh.length > 256 || authKey.length > 64) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const userAgent = req.headers.get("user-agent")?.slice(0, 500) ?? null;

  try {
    await upsertPushSubscription({
      endpoint,
      p256dh,
      auth: authKey,
      userAgent,
      clerkUserId: userId ?? null,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    // Format-only — DB errors can echo the inbound payload, which carries
    // the per-device push subscription endpoint URL (Apple/Google/Mozilla
    // push-service URL + token = stable device identifier) and the Clerk
    // user ID. PII-leak class, sister of inv/GW err.name pattern.
    const reason = err instanceof Error ? err.name : "unknown";
    console.error(`[push/subscribe] DB error: ${reason}`);
    return NextResponse.json({ error: "Could not save subscription" }, { status: 500 });
  }
}
