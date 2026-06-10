// GET /api/rewards/me
//
// Sister-port of seattle-cannabis-web/app/api/rewards/me.
// JSON snapshot of the authed customer's rewards state. Same data
// the /rewards/dashboard server-renders, but exposed as JSON so the
// client can pull-to-refresh or poll without a full page reload.
//
// Auth: glw_rewards_session cookie set by /api/rewards/verify-code.
// Validated via readRewardsSession (HMAC + purpose + expiry).
//
// Response shapes:
//   200 { customer: {...} }    — found
//   200 { customer: null }     — authed but no customer row matches
//   401 { error: "..." }       — no/invalid session

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readRewardsSession, REWARDS_COOKIE_NAME } from "@/lib/rewards-session";
import { getClient } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export type RewardsMeResponse = {
  customer: {
    firstName: string;
    lastInitial: string;
    points: number;
    tier: "bronze" | "silver" | "gold";
    nextTierAt: number | null;
    visitCount: number;
    lifetimeSpend: number;
    memberSinceMs: number | null;
  } | null;
};

function tier(points: number): { label: "bronze" | "silver" | "gold"; nextAt: number | null } {
  if (points >= 750) return { label: "gold", nextAt: null };
  if (points >= 250) return { label: "silver", nextAt: 750 };
  return { label: "bronze", nextAt: 250 };
}

export async function GET() {
  const cookieStore = await cookies();
  const session = readRewardsSession(cookieStore.get(REWARDS_COOKIE_NAME)?.value);
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const sql = getClient();
  const rows = (await sql`
    SELECT
      c.first_name,
      c.last_name,
      c.loyalty_points::int AS points,
      c.created_at,
      (
        SELECT COUNT(*)::int
        FROM transactions t
        WHERE t.customer_id = c.id AND t.status = 'completed'
      ) AS visit_count,
      (
        SELECT COALESCE(SUM(t.total::numeric), 0)::float
        FROM transactions t
        WHERE t.customer_id = c.id AND t.status = 'completed'
      ) AS lifetime_spend
    FROM customers c
    WHERE c.phone = ${session.phone}
      AND c.active = true
    ORDER BY c.last_visit_at DESC NULLS LAST
    LIMIT 1
  `) as unknown as Array<{
    first_name: string;
    last_name: string;
    points: number;
    created_at: Date | null;
    visit_count: number;
    lifetime_spend: number;
  }>;

  if (rows.length === 0) {
    return NextResponse.json<RewardsMeResponse>({ customer: null });
  }

  const r = rows[0];
  const points = r.points ?? 0;
  const t = tier(points);

  return NextResponse.json<RewardsMeResponse>({
    customer: {
      firstName: (r.first_name ?? "").trim(),
      lastInitial: (r.last_name ?? "").trim().charAt(0).toUpperCase(),
      points,
      tier: t.label,
      nextTierAt: t.nextAt,
      visitCount: r.visit_count ?? 0,
      lifetimeSpend: r.lifetime_spend ?? 0,
      memberSinceMs: r.created_at instanceof Date ? r.created_at.getTime() : null,
    },
  });
}
