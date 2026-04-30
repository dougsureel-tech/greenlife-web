import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { getClient } from "@/lib/db";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Called internally (from inventory app or staff action) to notify a customer
// POST { orderId, message, title }
// Secured via CRON_SECRET header
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-notify-secret");
  if (secret !== process.env.NOTIFY_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { orderId, title, message } = await req.json();
  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

  const sql = getClient();
  const rows = await sql`
    SELECT ps.endpoint, ps.p256dh, ps.auth
    FROM push_subscriptions ps
    JOIN online_orders o ON o.portal_user_id = ps.portal_user_id
    WHERE o.id = ${orderId}
  `;

  const results = await Promise.allSettled(
    rows.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint as string, keys: { p256dh: sub.p256dh as string, auth: sub.auth as string } },
        JSON.stringify({ title: title ?? "Order Update", body: message ?? "Your order status has changed." })
      )
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  return NextResponse.json({ sent, total: rows.length });
}
