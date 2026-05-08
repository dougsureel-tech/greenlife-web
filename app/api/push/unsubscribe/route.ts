import { NextRequest, NextResponse } from "next/server";
import { deletePushSubscription } from "@/lib/push-db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
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
    console.error("[push/unsubscribe] DB error", err);
    return NextResponse.json({ error: "Could not unsubscribe" }, { status: 500 });
  }
}
