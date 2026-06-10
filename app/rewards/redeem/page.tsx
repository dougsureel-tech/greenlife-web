// /rewards/redeem — redemption catalog for the GLW PWA.
//
// Sister-port of seattle-cannabis-web/app/rewards/redeem (emerald
// accent vs SCC indigo). Customer sees every redemption tier they
// could use at the register, flagged by whether their current points
// balance affords each one.
//
// IMPORTANT (compliance): redemption itself happens at the register,
// NOT here. Apple guideline 1.4.3 + Google Play marijuana policy ban
// cannabis purchase flows from app-store / web-store apps where a
// transaction completes. The PWA shows the catalog, the customer
// shows up at the counter, and the budtender applies the redemption
// during checkout. This is the same pattern SpringBig used.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { readRewardsSession, REWARDS_COOKIE_NAME } from "@/lib/rewards-session";
import { getClient } from "@/lib/db";
import { REDEMPTION_TIERS, type RedemptionTier } from "@/lib/redemption-tiers";
import { RewardsBottomNav } from "../RewardsBottomNav";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Redeem your points",
  robots: { index: false },
};

export default async function RewardsRedeemPage() {
  const cookieStore = await cookies();
  const session = readRewardsSession(cookieStore.get(REWARDS_COOKIE_NAME)?.value);
  if (!session) redirect("/rewards/login");

  const sql = getClient();
  const rows = (await sql`
    SELECT loyalty_points::int AS points
    FROM customers
    WHERE phone = ${session.phone}
      AND active = true
    ORDER BY last_visit_at DESC NULLS LAST
    LIMIT 1
  `) as unknown as Array<{ points: number }>;
  const balance = rows[0]?.points ?? 0;

  // Group tiers as: affordable / unaffordable. Affordable shows first.
  const affordable = REDEMPTION_TIERS.filter((t) => balance >= t.pointCost);
  const unaffordable = REDEMPTION_TIERS.filter((t) => balance < t.pointCost);

  return (
    <div className="min-h-[70vh] bg-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold tracking-wide uppercase">
            Redeem
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 leading-tight">
            What your points get you.
          </h1>
        </div>

        {/* Balance chip */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-white px-5 py-4 text-center shadow-md shadow-emerald-900/20">
          <p className="text-xs font-bold tracking-widest uppercase text-emerald-200">
            Your balance
          </p>
          <p className="text-3xl font-extrabold tabular-nums mt-1">
            {balance.toLocaleString()} pts
          </p>
        </div>

        {/* Affordable tiers */}
        {affordable.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-700 px-1">
              Available now
            </h2>
            <div className="space-y-2">
              {affordable.map((tier) => (
                <TierCard key={tier.pointCost} tier={tier} affordable />
              ))}
            </div>
          </section>
        )}

        {/* Unaffordable tiers — show what's next */}
        {unaffordable.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-stone-700 px-1">
              Keep earning
            </h2>
            <div className="space-y-2">
              {unaffordable.map((tier) => (
                <TierCard
                  key={tier.pointCost}
                  tier={tier}
                  affordable={false}
                  ptsToGo={tier.pointCost - balance}
                />
              ))}
            </div>
          </section>
        )}

        {/* The cliff explainer + redemption-at-register note */}
        <div className="rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4 text-xs text-stone-600 leading-relaxed space-y-2">
          <p>
            <strong className="text-stone-800 font-semibold">How redemption works:</strong>{" "}
            Tell your budtender at the counter when you check out. They&apos;ll
            apply the discount on the spot. Redemption is in-store only —
            we can&apos;t apply it from this page.
          </p>
          <p>
            <strong className="text-stone-800 font-semibold">One discount per order:</strong>{" "}
            Loyalty redemption doesn&apos;t combine with an active deal
            (Heroes 30%, daily deal, Online order, etc.) — your budtender
            picks whichever saves you more on the cart. Your points stay on
            the ledger if they go unused.
          </p>
          <p>
            <strong className="text-stone-800 font-semibold">About the $75 cliff:</strong>{" "}
            Two 30%-off tiers exist — 300pt for orders under $75, 400pt
            for orders $75 and up. Bigger orders cost a few more points;
            it keeps the math fair for everyone.
          </p>
        </div>

        {/* Footer actions */}
        <div className="space-y-3 text-center">
          <Link
            href="/menu"
            className="block w-full rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3.5 transition-all hover:-translate-y-0.5 shadow-md shadow-emerald-900/20"
          >
            Browse the menu →
          </Link>
          <Link
            href="/rewards/dashboard"
            className="block text-sm text-stone-400 hover:text-stone-600 font-medium min-h-[44px] py-2"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
      <RewardsBottomNav active="redeem" />
    </div>
  );
}

function TierCard({
  tier,
  affordable,
  ptsToGo,
}: {
  tier: RedemptionTier;
  affordable: boolean;
  ptsToGo?: number;
}) {
  const cliffNote =
    tier.maxOrderSubtotal != null
      ? `Order subtotal must be under $${tier.maxOrderSubtotal}.`
      : tier.minOrderSubtotal != null
        ? `Order subtotal must be $${tier.minOrderSubtotal} or more.`
        : null;

  return (
    <div
      className={`rounded-2xl border px-5 py-4 transition-all ${
        affordable
          ? "border-emerald-200 bg-emerald-50/40"
          : "border-stone-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <p
            className={`font-extrabold text-lg ${affordable ? "text-emerald-900" : "text-stone-900"}`}
          >
            {tier.label}
          </p>
          {cliffNote && (
            <p className="text-xs text-stone-500">{cliffNote}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-bold tracking-wide uppercase text-stone-500">
            Cost
          </p>
          <p
            className={`text-xl font-extrabold tabular-nums ${affordable ? "text-emerald-700" : "text-stone-700"}`}
          >
            {tier.pointCost} pts
          </p>
        </div>
      </div>
      {!affordable && ptsToGo !== undefined && (
        <p className="text-xs text-stone-400 mt-2">
          {ptsToGo.toLocaleString()} pts to go
        </p>
      )}
    </div>
  );
}
