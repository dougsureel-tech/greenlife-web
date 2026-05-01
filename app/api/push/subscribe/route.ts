import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { upsertPushSubscription } from "@/lib/push-db";

export const runtime = "nodejs";

type SubscribeBody = {
  endpoint?: unknown;
  keys?: { p256dh?: unknown; auth?: unknown };
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  let body: SubscribeBody;
  try {
    body = (await req.json()) as SubscribeBody;
  } catch {
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
    console.error("[push/subscribe] DB error", err);
    return NextResponse.json({ error: "Could not save subscription" }, { status: 500 });
  }
}
