import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { listPushSubscriptions, pruneEndpoints, sendPushToClerkUser } from "@/lib/push-db";

export const runtime = "nodejs";
export const maxDuration = 60;

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT;
const SEND_TOKEN = process.env.PUSH_SEND_TOKEN;

if (VAPID_PUBLIC && VAPID_PRIVATE && VAPID_SUBJECT) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

type SendBody = {
  title?: unknown;
  body?: unknown;
  url?: unknown;
  tag?: unknown;
  // Optional per-user filter — when present, push goes only to subscriptions
  // tied to this clerk_user_id (used for transactional notifications like
  // "your order is ready"). Omitted → fan-out to every active sub on this
  // site (used for drop alerts).
  toClerkUserId?: unknown;
};

export async function POST(req: NextRequest) {
  if (!SEND_TOKEN || !VAPID_PUBLIC || !VAPID_PRIVATE || !VAPID_SUBJECT) {
    return NextResponse.json({ error: "Push not configured" }, { status: 500 });
  }

  const authz = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${SEND_TOKEN}`;
  if (authz !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SendBody;
  try {
    body = (await req.json()) as SendBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.slice(0, 120) : null;
  const text = typeof body.body === "string" ? body.body.slice(0, 280) : "";
  const url = typeof body.url === "string" ? body.url.slice(0, 500) : "/";
  const tag = typeof body.tag === "string" ? body.tag.slice(0, 80) : undefined;
  const toClerkUserId = typeof body.toClerkUserId === "string" ? body.toClerkUserId : null;
  if (!title) return NextResponse.json({ error: "Missing title" }, { status: 400 });

  // Per-user transactional path — delegate to the lib helper which already
  // handles VAPID setup, parallel sends, and 404/410 pruning.
  if (toClerkUserId) {
    const result = await sendPushToClerkUser(toClerkUserId, { title, body: text, url, tag });
    return NextResponse.json({ ok: true, sent: result.sent, dead: result.dead, total: result.sent + result.dead });
  }

  const subs = await listPushSubscriptions();
  if (subs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, dead: 0, total: 0 });
  }

  const payload = JSON.stringify({ title, body: text, url, tag });
  const dead: string[] = [];
  let sent = 0;

  // Fire in parallel; web-push on each subscription is independent. Push providers
  // (FCM, Mozilla, Apple) all rate-limit individually so this scales fine for our
  // size of customer base (low thousands at most).
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        );
        sent++;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          dead.push(s.endpoint);
        } else {
          console.error("[push/send] error for endpoint", s.endpoint.slice(0, 60), status, err);
        }
      }
    }),
  );

  if (dead.length > 0) await pruneEndpoints(dead);

  return NextResponse.json({ ok: true, sent, dead: dead.length, total: subs.length });
}
