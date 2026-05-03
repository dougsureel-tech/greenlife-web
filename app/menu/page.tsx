import type { Metadata } from "next";
import { STORE } from "@/lib/store";
import { getActiveDeals } from "@/lib/db";
import { JaneMenu } from "./JaneMenu";
import { MenuFallback } from "./MenuFallback";
import { MenuLocalStrip } from "@/components/MenuLocalStrip";
import { MenuActiveDealsStrip } from "@/components/MenuActiveDealsStrip";

// /menu = iHeartJane Jane Boost (iframeless) embed. Customer stays on
// greenlifecannabis.com — the Boost JS module hydrates the menu inline.
// Naive iframe is blocked (iHeartJane sets X-Frame-Options: SAMEORIGIN).
//
// Config + script tags live in JaneMenu.tsx; values were recovered from
// the WordPress site archive on web.archive.org (2026-01-12 snapshot).
// See also INCIDENTS.md (2026-05-01 entry) for the regression history.
//
// Was force-static (embed config is static), now ISR 60s so MenuFallback
// can show the most-urgent active deal without losing the cache benefit.
// One getActiveDeals() call per minute per region — negligible.

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Cannabis Menu — Live Inventory",
  description: `Live cannabis menu at ${STORE.name} in ${STORE.address.city}, WA. Flower, pre-rolls, vapes, concentrates, edibles, tinctures, and topicals from 100+ Washington-state producers. Order ahead for cash pickup. 21+, ID required.`,
  alternates: { canonical: "/menu" },
  openGraph: {
    title: `Cannabis Menu | ${STORE.name}`,
    description: `Live cannabis menu — prices, THC/CBD, lab data. ${STORE.address.full}.`,
    url: `${STORE.website}/menu`,
    type: "website",
  },
  // Partner-presence signal the WP plugin emits. The WP origin (208.109.64.51)
  // shipped <meta name="jane:version" content="1.4.7"/> on every /menu page;
  // our Vercel deploy doesn't, and that's the lone Jane-touching DOM diff
  // between WP (where Boost works) and Vercel (where the API CORS-rejects).
  // Untested hypothesis but a safe one-liner to flush from the diagnosis tree.
  // See ~/Documents/CODE/MENU_LOG.md hypothesis #5.
  other: { "jane:version": "1.4.7" },
};

// Wenatchee config recovered from the WP archive. embedConfigId is provisioned
// per-partner-store on iHeartJane's side; Seattle (5295) needs its own.
const IHEARTJANE_STORE_ID = 5294;
const IHEARTJANE_EMBED_CONFIG_ID = 234;

export default async function MenuPage() {
  // Pull the currently-running active deal nearest its end-date — passed
  // through to MenuFallback so a customer hitting a stuck embed still sees
  // the savings hook. Falls back to no-deal silently if the table is empty
  // or the query errors.
  const deals = await getActiveDeals().catch(() => []);
  const featuredDeal = deals[0] ?? null;

  return (
    <div className="bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">Live Menu</h1>
        <p className="text-sm text-stone-600">
          Real-time inventory from {STORE.name}. Pickup orders open daily 8 AM–
          {STORE.hours[0]?.close ?? "9 PM"}. Cash only at the counter, 21+ with valid ID.
        </p>
      </div>
      <JaneMenu storeId={IHEARTJANE_STORE_ID} embedConfigId={IHEARTJANE_EMBED_CONFIG_ID} />
      {/* Active-deals strip — every running deal as a brand-tinted chip.
          Boost is third-party and can't ribbon individual product cards;
          this is the pragmatic substitute that keeps the discount surface
          loud directly under the embed. See MENU_TREE_AUDIT.md priority #3. */}
      <MenuActiveDealsStrip deals={deals} />
      <MenuFallback featuredDeal={featuredDeal} />
      {/* Geo-cohort tie-back. Homepage hero already promises "we serve
          the whole valley" with full town cards; here we surface the
          same STORE.nearbyTowns set as a compact strip so deep-link
          customers landing on /menu without seeing the homepage still
          read the same local-cohort signal — and so search-engine
          crawls of /menu get the geographic reinforcement. Source of
          truth (STORE.nearbyTowns + LocalBusiness JSON-LD) is in the
          root layout; this is the surface render. */}
      <MenuLocalStrip />
    </div>
  );
}
