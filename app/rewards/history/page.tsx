// /rewards/history — visit + earnings history.
//
// Sister-port of seattle-cannabis-web/app/rewards/history (emerald
// accent vs SCC indigo). Shows a customer's last ~25 completed
// transactions with: visit date, total spend, points earned (computed
// at render — points-per-dollar rate is mirrored from inventoryapp),
// and any redemption applied.
//
// Privacy: shows ONLY the customer's own transactions. Auth-gated by
// readRewardsSession so phone-OTP must succeed first.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { readRewardsSession, REWARDS_COOKIE_NAME } from "@/lib/rewards-session";
import { getClient } from "@/lib/db";
import { STORE_TZ } from "@/lib/store";
import { RewardsBottomNav } from "../RewardsBottomNav";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your visit history",
  robots: { index: false },
};

const TZ = STORE_TZ;

type VisitRow = {
  id: string;
  completed_at: Date | null;
  subtotal: number;
  total: number;
  loyalty_redemption: number;
  promo_discount: number;
  item_count: number;
};

function fmtDate(d: Date | null): string {
  if (!d) return "Unknown date";
  return d.toLocaleDateString("en-US", {
    timeZone: TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function RewardsHistoryPage() {
  const cookieStore = await cookies();
  const session = readRewardsSession(cookieStore.get(REWARDS_COOKIE_NAME)?.value);
  if (!session) redirect("/rewards/login");

  const sql = getClient();

  // Resolve customer first, then pull transactions. Two queries because
  // the JOIN to customers via phone in a single query confuses the
  // serverless driver's ANY-array path on this shape.
  const cRows = (await sql`
    SELECT id FROM customers
    WHERE phone = ${session.phone}
      AND active = true
    ORDER BY last_visit_at DESC NULLS LAST
    LIMIT 1
  `) as unknown as Array<{ id: string }>;

  if (cRows.length === 0) {
    return <NoCustomerCard phone={session.phone} />;
  }

  const customerId = cRows[0].id;

  const visits = (await sql`
    SELECT
      t.id,
      t.completed_at,
      COALESCE(t.subtotal::float, 0) AS subtotal,
      COALESCE(t.total::float, 0) AS total,
      COALESCE(t.loyalty_redemption::float, 0) AS loyalty_redemption,
      COALESCE(t.promo_discount::float, 0) AS promo_discount,
      (
        SELECT COUNT(*)::int
        FROM sale_line_items s
        WHERE s.transaction_id = t.id
      ) AS item_count
    FROM transactions t
    WHERE t.customer_id = ${customerId}
      AND t.status = 'completed'
    ORDER BY t.completed_at DESC NULLS LAST
    LIMIT 25
  `) as unknown as VisitRow[];

  return (
    <div className="min-h-[70vh] bg-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold tracking-wide uppercase">
            History
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 leading-tight">
            Your visits.
          </h1>
          <p className="text-stone-500 text-sm">
            Last 25 in-store visits.
          </p>
        </div>

        {visits.length === 0 ? (
          <EmptyHistoryCard />
        ) : (
          <ul className="space-y-2">
            {visits.map((v) => (
              <VisitRow key={v.id} visit={v} />
            ))}
          </ul>
        )}

        {/* Footer actions */}
        <div className="space-y-3 text-center">
          <Link
            href="/rewards/dashboard"
            className="block w-full rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3.5 min-h-[44px] transition-all hover:-translate-y-0.5 shadow-md shadow-emerald-900/20"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
      <RewardsBottomNav active="history" />
    </div>
  );
}

function VisitRow({ visit }: { visit: VisitRow }) {
  // Mirrors inventoryapp's POINTS_PER_DOLLAR (post-tier-flag rate).
  // Earn-rate is shipped per-customer at the POS, but the historical
  // row didn't store the earn-rate-at-time-of-sale, so this is a
  // best-effort reconstruction. Customers who care about exact-points
  // can ask at the counter; for the history-strip use-case this is
  // close enough.
  const POINTS_PER_DOLLAR = 2;
  const earnedPts = Math.floor((visit.subtotal ?? 0) * POINTS_PER_DOLLAR);
  const redeemedPts =
    visit.loyalty_redemption > 0
      ? Math.round(visit.loyalty_redemption * 100) // 1pt = $0.01
      : 0;

  return (
    <li className="rounded-2xl border border-stone-200 bg-white px-5 py-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-stone-800">
          {fmtDate(visit.completed_at)}
        </p>
        <p className="text-sm font-extrabold tabular-nums text-stone-900">
          ${visit.total.toFixed(2)}
        </p>
      </div>
      <p className="text-xs text-stone-500 mt-0.5">
        {visit.item_count} item{visit.item_count !== 1 ? "s" : ""}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {earnedPts > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5">
            +{earnedPts} pts earned
          </span>
        )}
        {redeemedPts > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold rounded-full bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5">
            −{redeemedPts} pts redeemed
          </span>
        )}
        {visit.promo_discount > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5">
            ${visit.promo_discount.toFixed(2)} promo
          </span>
        )}
      </div>
    </li>
  );
}

function EmptyHistoryCard() {
  return (
    <div className="rounded-3xl border border-stone-200 bg-stone-50 p-7 text-center space-y-3">
      <div className="text-3xl" aria-hidden="true">🌱</div>
      <p className="font-bold text-stone-900">No visits yet</p>
      <p className="text-stone-500 text-sm">
        Nothing here yet. Your first visit shows up the moment you check
        out — see you soon.
      </p>
      <Link
        href="/menu"
        className="inline-block px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-bold transition-all"
      >
        Browse the menu
      </Link>
    </div>
  );
}

function NoCustomerCard({ phone }: { phone: string }) {
  return (
    <div className="min-h-[60vh] bg-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="rounded-3xl border border-stone-200 bg-white p-7 text-center space-y-4">
          <div className="text-3xl" aria-hidden="true">🌱</div>
          <h1 className="text-2xl font-extrabold text-stone-900">
            We don&apos;t have you on file yet
          </h1>
          <p className="text-stone-500 text-sm">
            Your phone ({phone.slice(-4)}) isn&apos;t in our customer system
            yet, so there&apos;s no visit history to show.
          </p>
          <Link
            href="/rewards/dashboard"
            className="block w-full rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3.5 transition-all"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
