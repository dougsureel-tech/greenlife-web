import type { Metadata } from "next";
import Link from "next/link";
import { STORE, todayCloseLabel } from "@/lib/store";
import { getActiveDeals, getTreasureChestProducts } from "@/lib/db";
import { fetchClosureStatus } from "@/lib/closure-status";
import { JaneMenu } from "./JaneMenu";
import { MenuFallback } from "./MenuFallback";
import { AppOnlyDealsFilter } from "@/components/AppOnlyDealsFilter";
import { MenuLocalStrip } from "@/components/MenuLocalStrip";
import { MenuActiveDealsStrip } from "@/components/MenuActiveDealsStrip";
import { MenuTopDealsRail } from "@/components/MenuTopDealsRail";
import { ClosureBanner } from "@/components/ClosureBanner";
import { VendorAdSlot } from "@/components/VendorAdSlot";
import { Breadcrumb } from "@/components/Breadcrumb";
import { safeJsonLd } from "@/lib/json-ld-safe";

// /menu = iHeartJane Jane Boost (iframeless) embed. Customer stays on
// greenlifecannabis.com — the Boost JS module hydrates the menu inline.
// Naive iframe is blocked (iHeartJane sets X-Frame-Options: SAMEORIGIN).
//
// Config + script tags live in JaneMenu.tsx; values were recovered from
// the WordPress site archive on web.archive.org (2026-01-12 snapshot).
//
// ═══════════════════════════════════════════════════════════════════════
// 🚨 LOAD-BEARING DOUG-DIRECTIVE 2026-05-16 ~02:50 PT
//
// "we need to keep that [iHJ /menu] live until our devmenu is 100 ·
//  we would like to get it switched over asap"
//
// /menu MUST continue rendering <JaneMenu> (iHJ Boost) as the default
// surface until Doug greenlights the single-flip cutover to the dev tree
// menu (the `/order` route's OrderMenu.tsx visual register × MenuSearch.tsx
// polish, per Phase 1 of MENU_MODEL_A_ARCHITECTURE_2026_05_16.md).
//
// Future agents: do NOT remove JaneMenu rendering or flip the default to
// MenuFallback / a revived MenuSearch without explicit Doug-greenlight.
// The Phase 1 build is allowed to:
//   - polish OrderMenu / MenuSearch on the /order or /menu-preview route
//   - wire URL-param contracts (?q ?brand ?strain ?vibe etc.) into the
//     dev menu surface
//   - delete unused JaneMenu code ONLY AFTER cutover greenlight
//
// What it is NOT allowed to do:
//   - change /menu/page.tsx default render from <JaneMenu> to anything else
//   - 308-redirect /menu to a new path
//   - hide the JaneMenu behind a feature flag default-off
//
// The cutover flip is intentionally a SINGLE atomic Doug-greenlit edit:
// replace <JaneMenu products={products} … /> with the dev tree menu,
// delete the iHJ-Boost rendering, ship as a single commit, monitor.
// ═══════════════════════════════════════════════════════════════════════
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
    // Per-route OG at /menu/opengraph-image (file convention). Pre-fix
    // DEFAULT_OG_IMAGE override made the per-route file dead code; share-
    // cards rendered homepage OG instead of menu-specific. Sister T48
    // /blog/[slug] same fix class.
    images: [
      {
        url: "/menu/opengraph-image",
        width: 1200,
        height: 630,
        alt: `Cannabis Menu — ${STORE.name}`,
      },
    ],
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
    // CDN-cache fix (v20.605): was `cache: "no-store"` which opted the
    // entire /menu page out of ISR per `feedback_isr_killed_by_no_store_fetch`.
    // Switched to `next: { revalidate: 60 }` — we still warm Jane's CDN
    // on each ISR revalidate (every 60s), but our own page can prerender.
    await fetch(
      `https://api.iheartjane.com/api/v1/stores/${IHEARTJANE_STORE_ID}/menu_products?per_page=1`,
      { signal: AbortSignal.timeout(1500), next: { revalidate: 60 } },
    );
  } catch {
    // expected: timeout, Jane down, network blip — page render proceeds
  }
}

export default async function MenuPage() {
  // CDN-cache fix (sister homepage v20.405): previously called `cookies()`
  // here, opting /menu out of ISR despite `revalidate=60`. Now fetch all
  // deals server-side (`includeAppOnly: true`); MenuFallback receives the
  // full array and picks the first non-PWA-only deal client-side based on
  // `glw_pwa_installed` cookie. PWA-install carrot preserved. Plus pass
  // `revalidate: 60` to fetchClosureStatus so the upstream fetch
  // participates in ISR (vs default `cache: "no-store"`).
  const [deals, closure, treasureChest] = await Promise.all([
    getActiveDeals({ includeAppOnly: true }).catch(() => []),
    fetchClosureStatus({ revalidate: 60 }),
    getTreasureChestProducts(60).catch(() => []),
    prewarmDutchieMenu(),
  ]);
  // featuredDeal is shown in the MenuFallback when iHJ Boost stalls > 6s.
  // It may be a PWA-only deal — the appOnly flag rides through so the
  // client-side <AppOnlyDealsFilter /> hides it for non-installed visitors
  // post-hydrate. Same pattern as MenuActiveDealsStrip's data-app-only attrs.
  const featuredDeal = deals[0]
    ? { short: deals[0].short, name: deals[0].name, endDate: deals[0].endDate, appOnly: deals[0].appOnly }
    : null;
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
    "@id": `${STORE.website}/menu#breadcrumb`,
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
      <Breadcrumb items={[{ label: "Menu" }]} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2">
        <VendorAdSlot slot="menu_top" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-4 sm:pt-4 sm:pb-5 space-y-2">
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
      {/* Top-6 deals rail — server-rendered ABOVE the iHJ Boost iframe so
          customers see a useful value-prop before Boost's 2-3s cold-load
          completes. Closes the 30-40% bounce window flagged by the
          2026-05-27 growth/SEO 3-expert review. Returns null when deals
          is empty (no skeleton, no placeholder — empty is worse than the
          iframe alone). Pure additive: <JaneMenu> below renders
          unchanged regardless. */}
      <MenuTopDealsRail deals={deals} />
      <JaneMenu storeId={IHEARTJANE_STORE_ID} embedConfigId={IHEARTJANE_EMBED_CONFIG_ID} />
      {/* Active-deals strip — every running deal as a brand-tinted chip.
          Boost is third-party and can't ribbon individual product cards;
          this is the pragmatic substitute that keeps the discount surface
          loud directly under the embed. See MENU_TREE_AUDIT.md priority #3. */}
      <MenuActiveDealsStrip deals={deals} treasureChestCount={treasureChestCount} />
      <AppOnlyDealsFilter />
      <MenuFallback featuredDeal={featuredDeal} />
      {/* Get involved — cross-links to /community + /community/ambassador.
          Sister to /community hub cross-link section (v40.105). /menu is
          the highest-traffic public surface; adding a small ambassador +
          feedback entry point below the product grid drives signups from
          customers who just finished browsing. Ambassador card respects
          AMBASSADOR_PROGRAM_ENABLED env (the destination page itself
          flips to "coming soon" panel when OFF, so the link is never
          broken — but we hide the card when OFF to keep /menu honest
          about what's live). Community-hub link unconditional. */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              Get involved
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              Loved what you found? Share + earn.
            </h2>
            <p className="text-stone-500 text-sm mt-2 max-w-xl">
              Quick story about a strain or budtender for store credit, or tell
              us what we&apos;re missing. Manager reads everything.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {process.env.AMBASSADOR_PROGRAM_ENABLED === "true" && (
              <Link
                href="/community/ambassador"
                className="group rounded-2xl bg-white border border-stone-200 p-6 hover:border-emerald-400 hover:shadow-sm transition-all block"
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                  Ambassador Program
                </p>
                <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight mt-1.5">
                  Share a video, earn store credit.
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed mt-2">
                  Quick phone videos or Google reviews. $25 approved, $50 if we
                  use it, $100 if it goes viral. Manager-reviewed, 48-hour
                  turnaround.
                </p>
                <span className="inline-block text-sm font-semibold text-emerald-700 group-hover:text-emerald-600 transition-colors mt-3">
                  See the briefs →
                </span>
              </Link>
            )}
            <Link
              href="/community"
              className="group rounded-2xl bg-white border border-stone-200 p-6 hover:border-emerald-400 hover:shadow-sm transition-all block"
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                Community
              </p>
              <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight mt-1.5">
                Meet the people behind the shop.
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mt-2">
                Alumni, featured creators, neighborhood partners — and the
                open-channel feedback form. Word of mouth is the channel
                that&apos;s left, and we do it right.
              </p>
              <span className="inline-block text-sm font-semibold text-emerald-700 group-hover:text-emerald-600 transition-colors mt-3">
                Visit the hub →
              </span>
            </Link>
          </div>
        </div>
      </section>
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
