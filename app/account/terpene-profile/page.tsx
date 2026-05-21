// /account/terpene-profile — C7 customer-facing surface.
//
// Mounts the 7-axis terpene radar over the customer's personal fingerprint
// vector + a cousin-finder recommendation list. ENV-FLAG-GATED:
//
//   process.env.TERPENE_FINGERPRINT_ENABLED === "true"
//
// Default OFF — when the flag is unset (production today), this page
// returns notFound() so the route doesn't accidentally surface during
// the soft-launch period. Doug flips it on in Vercel env when the
// data foundation (reviews + purchase weighting) is ready.
//
// MOCK-DATA MODE: Until customer review/purchase tracking ships, the
// fingerprint vector is hydrated from buildMockFingerprint() and the
// anchor strain for cousin-finder defaults to "blue-dream" (the
// shelf-presence champion). This keeps the page renderable while we
// wait for the data foundation; the radar shape on this page will be
// the SAME for every customer until the real cron lands. Document
// states "based on average customer history" to set expectations.
//
// WAC 314-55-155: page copy stays in flavor + aroma vocabulary —
// "limonene-forward palette", "shares lineage with strains you love" —
// never effects ("makes you sleepy") and never medical ("treats
// insomnia"). Same posture as lib/strains.ts + the rest of /strains.
//
// PATENT-TRACK callout (see docs/terpene-fingerprint.md): this page is
// the visible artifact of the C7 claim, but all scoring logic stays
// server-side via lib/terpene-fingerprint.ts + lib/cousin-finder.ts —
// no algorithm constants reach the client bundle.

import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  buildAverageFingerprint,
  buildMockFingerprint,
  dominantTerpeneAxis,
  TERPENE_AXES,
} from "@/lib/terpene-fingerprint";
import { findCousins } from "@/lib/cousin-finder";
import { STRAINS } from "@/lib/strains";
import { TerpeneRadarChart } from "@/components/TerpeneRadarChart";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Terpene Profile",
  robots: { index: false },
};

export default async function TerpeneProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  // ?preview=1 escape — sister of wrapped page's preview pattern (v38.345).
  // Doug eyes the mock-fixture render before flipping the customer-facing
  // flag. Middleware (proxy.ts) already exempts ?preview=1 from Clerk
  // auth.protect(); the page-level branch below skips the in-page Clerk
  // session check too. Real-data render still requires both flag ON AND
  // Clerk login — preview can't be used to bypass auth on real paths.
  const { preview } = await searchParams;
  const previewMode = preview === "1" || preview === "true";

  // Hard env-flag gate — return 404 when disabled so the route is
  // invisible to crawlers + curious customers during soft-launch.
  // Preview-mode escape lets Doug see the page even when the flag is OFF.
  if (process.env.TERPENE_FINGERPRINT_ENABLED !== "true" && !previewMode) {
    notFound();
  }

  if (!previewMode) {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in?redirect_url=/account/terpene-profile");
  }

  // Phase 0 — mock-data mode. When the nightly recompute cron lands,
  // swap this for a server-side fetch of the customer_terpene_profiles row.
  const customerVector = buildMockFingerprint();
  const averageVector = buildAverageFingerprint();
  const dominant = dominantTerpeneAxis(customerVector);

  // Default anchor for cousin-finder until customer-rating data lands.
  // Blue Dream = highest shelf-presence + most-recognizable hybrid in
  // our corpus, so cousins surfaced from it are a reasonable starting
  // recommendation for a customer with no history yet.
  const anchorSlug = "blue-dream";
  const triedSlugs = new Set<string>();
  const cousins = findCousins(anchorSlug, STRAINS, triedSlugs, 6);
  const anchorStrain = STRAINS[anchorSlug];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/account"
            className="text-xs text-stone-400 hover:text-indigo-700 font-semibold inline-flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Account
          </Link>
          <h1 className="text-2xl font-extrabold text-stone-900 mt-2">Your Terpene Profile</h1>
          <p className="text-stone-500 text-sm mt-1">
            The aromatic shape of the strains you&rsquo;ve explored — a personal flavor signature.
          </p>
        </div>
      </div>

      {/* Soft-launch / preview disclosure — sets expectations that the
          radar shape doesn't yet reflect personal history. */}
      <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 text-sm text-amber-900">
        <p className="font-semibold mb-1">Preview mode</p>
        <p className="text-amber-800/90">
          We&rsquo;re showing a starter palette based on shelf-favorite strains. Once you rate a few
          on <Link href="/strains" className="underline font-semibold">/strains</Link>, your radar
          shifts to reflect your own picks.
        </p>
      </div>

      {/* Radar chart card */}
      <section className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col items-center gap-4">
          <TerpeneRadarChart
            customerVector={customerVector}
            averageVector={averageVector}
            size={340}
            ariaLabel="Your terpene fingerprint across 7 axes"
          />
          {dominant && (
            <p className="text-center text-sm text-stone-700">
              Your palette skews <span className="font-bold text-indigo-700">{dominant.toLowerCase()}-forward</span>.
            </p>
          )}
          <div className="flex flex-wrap gap-3 justify-center text-[11px] text-stone-500 mt-2">
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="inline-block w-3 h-3 rounded-sm border border-indigo-700 bg-indigo-100"
              />
              You
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="inline-block w-3 h-3 rounded-sm border border-stone-400 bg-stone-100"
                style={{ borderStyle: "dashed" }}
              />
              Shelf average
            </span>
          </div>
        </div>
      </section>

      {/* Per-axis breakdown — keeps it honest about what each axis means. */}
      <section className="space-y-3">
        <h2 className="font-bold text-stone-800">What each axis means</h2>
        <div className="rounded-2xl border border-stone-100 bg-white divide-y divide-stone-100">
          {TERPENE_AXES.map((axis, i) => {
            const pct = Math.round(customerVector[i] * 100);
            return (
              <div key={axis} className="px-4 py-3 flex items-center gap-3">
                <div className="w-24 sm:w-28 text-sm font-semibold text-stone-800 shrink-0">{axis}</div>
                <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600"
                    style={{ width: `${Math.min(pct * 2, 100)}%` }}
                    aria-hidden="true"
                  />
                </div>
                <div className="w-10 text-right text-xs font-semibold text-stone-500 tabular-nums">{pct}%</div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-stone-400">
          Percentages are normalized across the 7 axes — they reflect the share of aromatic
          attention in your collection, not absolute terpene mass.
        </p>
      </section>

      {/* Cousin-finder section */}
      {anchorStrain && cousins.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold text-stone-800">Lineage cousins worth trying</h2>
          <p className="text-sm text-stone-500">
            These share aroma and lineage with{" "}
            <Link
              href={`/strains/${anchorStrain.slug}`}
              className="font-semibold text-indigo-700 hover:text-indigo-600"
            >
              {anchorStrain.name}
            </Link>{" "}
            — same family of scents, different branches of the tree.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cousins.map((c) => (
              <Link
                key={c.slug}
                href={`/strains/${c.slug}`}
                className="rounded-2xl border border-stone-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="font-bold text-stone-900">{c.name}</div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                    {c.type}
                  </span>
                </div>
                <div className="text-xs text-stone-500">
                  {c.lineageDistance !== null && c.lineageDistance <= 2
                    ? "Close family branch"
                    : c.lineageDistance !== null
                      ? "Wider family branch"
                      : "Shared aroma family"}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Compliance + privacy note */}
      <section className="text-[11px] text-stone-400 leading-relaxed border-t border-stone-100 pt-6">
        <p>
          Terpene chemistry describes the aroma and flavor character of a strain — never its
          medical effect. Recommendations here are based on lineage and scent overlap with
          strains you&rsquo;ve already enjoyed.
        </p>
      </section>
    </div>
  );
}
