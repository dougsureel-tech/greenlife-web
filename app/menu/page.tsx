import type { Metadata } from "next";
import { STORE, todayCloseLabel, DEFAULT_OG_IMAGE} from "@/lib/store";
import { getActiveDeals, getTreasureChestProducts } from "@/lib/db";
import { fetchClosureStatus } from "@/lib/closure-status";
import { JaneMenu } from "./JaneMenu";
import { MenuFallback } from "./MenuFallback";
import { MenuLocalStrip } from "@/components/MenuLocalStrip";
import { MenuActiveDealsStrip } from "@/components/MenuActiveDealsStrip";
import { ClosureBanner } from "@/components/ClosureBanner";
import { VendorAdSlot } from "@/components/VendorAdSlot";
import { safeJsonLd } from "@/lib/json-ld-safe";

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
  // ~155 chars — v10.105 length sweep.
  description: `Live cannabis menu at ${STORE.name} — flower, pre-rolls, vapes, concentrates, edibles, tinctures, topicals. Order ahead for cash pickup. 21+.`,
  alternates: { canonical: "/menu" },
  openGraph: {
    siteName: STORE.name,
    locale: "en_US",
    title: `Cannabis Menu | ${STORE.name}`,
    description: `Live cannabis menu — prices, THC/CBD, lab data. ${STORE.address.full}.`,
    url: `${STORE.website}/menu`,
    type: "website",
    images: [DEFAULT_OG_IMAGE],
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

// Server-side prewarm — touches iHeartJane's edge cache for this store's
// Dutchie-backed `menu_products` query BEFORE the page response reaches
// the customer. Reason: Boost runs `afterInteractive`, which means the
// browser doesn't query the same URL until after Next hydration completes.
// If Dutchie's API hadn't been hit recently for this store, the cold-start
// can take 8-15s — long enough that `MenuFallback`'s 6s watchdog flips
// the amber "menu is taking a moment to load" panel even though Boost is
// just-about to succeed. Doug 2026-05-04 confirmed this matches the
// "menu error coming up first pass" customer report. See MENU_LOG.md +
// MenuFallback.tsx FALLBACK_AFTER_MS for the visible threshold this
// dodges.
//
// Best-effort + non-blocking: 1.5s AbortSignal timeout caps the impact on
// /menu TTFB if Jane/Dutchie is unreachable. Failure is silently swallowed
// — page render proceeds normally and the existing MenuFallback handles
// the customer-visible side. We run it inside Promise.all alongside the
// awaited DB fetches so the prewarm RTT overlaps with our own queries
// instead of stacking serially.
async function prewarmDutchieMenu(): Promise<void> {
  try {
    await fetch(
      `https://api.iheartjane.com/api/v1/stores/${IHEARTJANE_STORE_ID}/menu_products?per_page=1`,
      { signal: AbortSignal.timeout(1500), cache: "no-store" },
    );
  } catch {
    // expected: timeout, Jane down, network blip — page render proceeds
  }
}

export default async function MenuPage() {
  // PWA-install detection — cookie set by /api/track-install on first
  // standalone-mode launch. Same gate as /deals + homepage strip. Without
  // this, installed visitors saw the same `app_only=false` deal subset
  // as browser-only visitors — losing the install incentive on the most-
  // visited customer page. Doug 2026-05-07 closure of the menu-strip
  // app-only sister gap.
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const isInstalled = cookieStore.get("glw_pwa_installed")?.value === "1";
  // Pull the currently-running active deal nearest its end-date — passed
  // through to MenuFallback so a customer hitting a stuck embed still sees
  // the savings hook. Falls back to no-deal silently if the table is empty
  // or the query errors. Third element prewarms Jane's cache; result
  // unused (helper returns void).
  const [deals, closure, treasureChest] = await Promise.all([
    getActiveDeals({ includeAppOnly: isInstalled }).catch(() => []),
    fetchClosureStatus(),
    getTreasureChestProducts(60).catch(() => []),
    prewarmDutchieMenu(),
  ]);
  const featuredDeal = deals[0] ?? null;
  const treasureChestCount = treasureChest.length;

  // CollectionPage + ItemList of menu categories. Boost holds the live
  // product data inside its iframe-less embed so we can't expose per-
  // product LD; what we CAN expose is the canonical category set so
  // Google understands /menu is a structured collection. Earns site-
  // link / category-carousel eligibility on the SERP. Sister to /near
  // index ItemList pattern.
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${STORE.website}/menu#collection`,
    name: `${STORE.name} cannabis menu`,
    description: `Live cannabis menu at ${STORE.name} — flower, pre-rolls, vapes, concentrates, edibles, tinctures, topicals, accessories.`,
    url: `${STORE.website}/menu`,
    isPartOf: { "@id": `${STORE.website}/#website` },
    about: { "@id": `${STORE.website}/#dispensary` },
    mainEntity: {
      "@type": "ItemList",
      name: "Cannabis menu categories",
      numberOfItems: 8,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Flower", url: `${STORE.website}/menu#flower` },
        { "@type": "ListItem", position: 2, name: "Pre-rolls", url: `${STORE.website}/menu#pre-rolls` },
        { "@type": "ListItem", position: 3, name: "Vapes", url: `${STORE.website}/menu#vapes` },
        { "@type": "ListItem", position: 4, name: "Concentrates", url: `${STORE.website}/menu#concentrates` },
        { "@type": "ListItem", position: 5, name: "Edibles", url: `${STORE.website}/menu#edibles` },
        { "@type": "ListItem", position: 6, name: "Tinctures", url: `${STORE.website}/menu#tinctures` },
        { "@type": "ListItem", position: 7, name: "Topicals", url: `${STORE.website}/menu#topicals` },
        { "@type": "ListItem", position: 8, name: "Accessories", url: `${STORE.website}/menu#accessories` },
      ],
    },
  };

  // BreadcrumbList — earns SERP path rendering (Home › Menu).
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Menu", item: `${STORE.website}/menu` },
    ],
  };

  return (
    <div className="bg-stone-50">
      {/* Preconnect to iHeartJane Boost origins. /menu's LCP is the first
          rendered product card from inside the Boost embed — the embed
          loads JS from boost-assets.iheartjane.com (script bundle), then
          hits api.iheartjane.com (REST + WebSocket cable) and
          search.iheartjane.com (Algolia index) on first interaction.
          Pre-fix the customer paid full DNS+TLS+TCP RTT for each origin
          on first visit. Preconnect primes the connection pool. Pure
          additive — no behavior change, no compatibility risk. Caught
          2026-05-10 by /loop tick 40 cross-stack preconnect audit
          (glw + scc only preconnect to images.squarespace-cdn.com +
          static.wixstatic.com — the brand-logo CDNs — but NOT to iHJ).
          React 19 hoists these to <head> automatically. Sister scc
          v13.X same-fix. */}
      <link rel="preconnect" href="https://boost-assets.iheartjane.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://api.iheartjane.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://search.iheartjane.com" crossOrigin="anonymous" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
        <VendorAdSlot slot="menu_top" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-3">
        <ClosureBanner closure={closure} />
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">Live Menu</h1>
        <p className="text-sm text-stone-600">
          Real-time inventory from {STORE.name}. Pickup orders open daily 8 AM–
          {todayCloseLabel()}. Cash only at the counter, 21+ with valid ID.
        </p>
        {/* Vendor / house ad — sidebar-style banner above the Boost embed.
            Slot key matches admin curation surface (placement_slot='menu_sidebar'). */}
        <VendorAdSlot slot="menu_sidebar" />
      </div>
      <JaneMenu storeId={IHEARTJANE_STORE_ID} embedConfigId={IHEARTJANE_EMBED_CONFIG_ID} />
      {/* Active-deals strip — every running deal as a brand-tinted chip.
          Boost is third-party and can't ribbon individual product cards;
          this is the pragmatic substitute that keeps the discount surface
          loud directly under the embed. See MENU_TREE_AUDIT.md priority #3. */}
      <MenuActiveDealsStrip deals={deals} treasureChestCount={treasureChestCount} />
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
