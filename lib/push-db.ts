import "server-only";
import webpush from "web-push";
import { getClient } from "./db";

const SITE = "greenlife";

// Lazy webpush configuration. Triplet is required for an actual send; missing
// any of the three → sendPushToClerkUser becomes a no-op (returns 0 sent) so
// dev / preview without VAPID keys doesn't crash.
const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT;
let vapidConfigured = false;
function ensureVapid(): boolean {
  if (vapidConfigured) return true;
  if (!VAPID_PUBLIC || !VAPID_PRIVATE || !VAPID_SUBJECT) return false;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  vapidConfigured = true;
  return true;
}

export type PushSubInput = {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string | null;
  clerkUserId?: string | null;
};

export async function upsertPushSubscription(input: PushSubInput): Promise<void> {
  const sql = getClient();
  // ON CONFLICT on the endpoint UNIQUE keeps a single row per device — keys
  // and lastUsedAt get refreshed if the user re-subscribes (e.g. after
  // permission reset or browser reinstall).
  const id = `push_${SITE}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  await sql`
    INSERT INTO push_subscriptions (id, endpoint, p256dh, auth, user_agent, site, clerk_user_id, last_used_at)
    VALUES (
      ${id}, ${input.endpoint}, ${input.p256dh}, ${input.auth},
      ${input.userAgent ?? null}, ${SITE}, ${input.clerkUserId ?? null}, NOW()
    )
    ON CONFLICT (endpoint) DO UPDATE SET
      p256dh        = EXCLUDED.p256dh,
      auth          = EXCLUDED.auth,
      user_agent    = EXCLUDED.user_agent,
      clerk_user_id = COALESCE(EXCLUDED.clerk_user_id, push_subscriptions.clerk_user_id),
      last_used_at  = NOW()
  `;
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
  const sql = getClient();
  await sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint} AND site = ${SITE}`;
}

export type StoredPushSub = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function listPushSubscriptions(): Promise<StoredPushSub[]> {
  const sql = getClient();
  const rows = await sql`
    SELECT endpoint, p256dh, auth
    FROM push_subscriptions
    WHERE site = ${SITE}
  `;
  return rows as unknown as StoredPushSub[];
}

// Called from the send endpoint when the push provider rejects the subscription
// as no-longer-valid (HTTP 404/410). Cleans the row out so we don't keep
// hammering a dead endpoint.
export async function pruneEndpoints(endpoints: string[]): Promise<void> {
  if (endpoints.length === 0) return;
  const sql = getClient();
  for (const ep of endpoints) {
    await sql`DELETE FROM push_subscriptions WHERE endpoint = ${ep}`;
  }
}

// Per-customer push send — used for transactional notifications like
// "your order is ready". Looks up all of a clerkUserId's active push subs,
// sends in parallel, prunes any 404/410 endpoints (browser uninstalled/
// disabled). Returns { sent, dead } for caller logging.
//
// Use a stable `tag` like `order-ready-{orderId}` so duplicate fires within
// the same browser session collapse into one notification (the OS replaces
// the previous one with the same tag instead of stacking).
export async function sendPushToClerkUser(
  clerkUserId: string,
  payload: { title: string; body?: string; url?: string; tag?: string },
): Promise<{ sent: number; dead: number }> {
  if (!ensureVapid()) return { sent: 0, dead: 0 };
  const sql = getClient();
  const subs = (await sql`
    SELECT endpoint, p256dh, auth
    FROM push_subscriptions
    WHERE site = ${SITE} AND clerk_user_id = ${clerkUserId}
  `) as unknown as StoredPushSub[];
  if (subs.length === 0) return { sent: 0, dead: 0 };

  const json = JSON.stringify({
    title: payload.title.slice(0, 120),
    body: (payload.body ?? "").slice(0, 280),
    url: (payload.url ?? "/").slice(0, 500),
    tag: payload.tag?.slice(0, 80),
  });
  const dead: string[] = [];
  let sent = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          json,
        );
        sent++;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          dead.push(s.endpoint);
        } else {
          console.error("[push] send error", s.endpoint.slice(0, 60), status, err);
        }
      }
    }),
  );
  if (dead.length > 0) await pruneEndpoints(dead);
  return { sent, dead: dead.length };
}
