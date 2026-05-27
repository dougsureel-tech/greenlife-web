import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { STORE, todayCloseLabel, getOrderingStatus } from "@/lib/store";
import { getMenuProducts, getPickupEta, getActiveDeals } from "@/lib/db";
import { fetchClosureStatus } from "@/lib/closure-status";
import { getLoyaltyByClerkId, getMedicalStatusByClerkId } from "@/lib/portal";
import { OrderMenu } from "../order/OrderMenu";
import { MenuLocalStrip } from "@/components/MenuLocalStrip";
import { MenuActiveDealsStrip } from "@/components/MenuActiveDealsStrip";
import { MenuTopDealsRail } from "@/components/MenuTopDealsRail";
import { ClosureBanner } from "@/components/ClosureBanner";
import { VendorAdSlot } from "@/components/VendorAdSlot";
import { Breadcrumb } from "@/components/Breadcrumb";
import { safeJsonLd } from "@/lib/json-ld-safe";

// /menu = BRAPP-native product grid (post-cutover 2026-05-27).
//
// History: this surface used to host the iHeartJane Jane Boost (iframeless)
// embed via `<JaneMenu>` + `<MenuFallback>` + `prewarmDutchieMenu()`. Doug
// 2026-05-27 greenlit the atomic cutover from the embed to the native
// BRAPP-DB-backed product grid. See `MENU_CUTOVER_COMMIT_BRIEF_2026_05_16.md`
// for the cutover recipe + `MIGRATIONS/IHEARTJANE_MENU.md` round-2 deep-dive
// for the verified live-state diff that informed the cutover.
//
// The post-cutover surface body is byte-equivalent to the previously-live
// `/menu-preview` body (now deleted) plus the JSON-LD / Breadcrumb /
// VendorAdSlot / MenuActiveDealsStrip / "Get involved" / MenuLocalStrip
// blocks that were unique to the canonical `/menu` surface.
//
// Rollback recipe (if something breaks post-deploy):
//   `git revert HEAD --no-edit && git push` — restores `<JaneMenu>` on /menu
//   within 60-90s (glw) / 3-5min (scc). See cutover brief for full recipe.

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
    // Per-route OG at /menu/opengraph-image (file convention).
    images: [
      {
        url: "/menu/opengraph-image",
        width: 1200,
        height: 630,
        alt: `Cannabis Menu — ${STORE.name}`,
      },
    ],
  },
};

function minToLabel(min: number): string {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default async function MenuPage() {
  const [products, eta, { userId }, activeDeals, closure] = await Promise.all([
    getMenuProducts().catch(() => []),
    getPickupEta().catch(() => ({ depth: 0, label: "Usually ready in under 10 min" })),
    auth().catch(() => ({ userId: null as string | null })),
    getActiveDeals({ includeAppOnly: true }).catch(() => []),
    fetchClosureStatus({ revalidate: 60 }).catch(() => ({ isClosed: false, reason: null })),
  ]);
  const status = getOrderingStatus();
  const signedIn = !!userId;
  const initialLoyalty = userId
    ? await getLoyaltyByClerkId(userId)
        .then((s) => (s ? { points: s.points, tieredFlagOn: s.tieredFlagOn } : null))
        .catch(() => null)
    : null;
  const dohVerified = userId
    ? await getMedicalStatusByClerkId(userId)
        .then((m) => Boolean(m?.dohVerifiedAt))
        .catch(() => false)
    : false;

  // CollectionPage + ItemList of menu categories. Now that /menu serves the
  // native product grid, Google can crawl per-product link-graph via the
  // grid itself; this CollectionPage shape still earns sitelink/category-
  // carousel eligibility on the SERP at the hub level.
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
      <Breadcrumb items={[{ label: "Menu" }]} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
        <VendorAdSlot slot="menu_top" />
      </div>
      {/* Premium page header — visual register lifted from the prior
          `/menu-preview` body (now deleted post-cutover). */}
      <div className="relative overflow-hidden bg-green-950 text-white py-10">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="absolute inset-0 opacity-25"
          style={{ backgroundImage: "radial-gradient(ellipse 70% 80% at 20% 50%, #4ade80, transparent)" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1 space-y-2">
            <p className="text-green-400 text-xs font-bold uppercase tracking-widest">Live Menu</p>
            <h1 className="text-3xl font-extrabold tracking-tight">Cannabis Menu — {STORE.address.city}</h1>
            <p className="text-green-100 text-sm">
              Real-time inventory · Pickup orders open daily 8 AM–{todayCloseLabel()} · Cash at the counter · 21+ with valid ID
            </p>
            <p className="text-green-200/90 text-xs">
              Hand-picked by the best crew in {STORE.address.city} — walk in or call us if you want backup.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2 text-xs">
            {status.state === "open" && status.minutesUntilLastCall <= 60 && (
              <span className="inline-flex items-center gap-1.5 text-amber-300/90 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_#fbbf24] animate-pulse" />
                Last call in {status.minutesUntilLastCall} min · order by {minToLabel(status.lastCallMin)}
              </span>
            )}
            {status.state !== "open" && (
              <span className="inline-flex items-center gap-1.5 text-amber-300/90 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_#fbbf24]" />
                {status.state === "before_open"
                  ? `Online ordering opens at ${status.opensAt}`
                  : status.state === "after_last_call"
                    ? `Online ordering closed · reopens at ${status.reopensAt}`
                    : `Online ordering closed · reopens at ${status.opensAt}`}
              </span>
            )}
            {status.state === "open" && (
              <span className="inline-flex items-center gap-1.5 text-green-200/95 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_4px_#4ade80] animate-pulse" />
                <span aria-hidden="true">⚡ </span>{eta.label}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-green-300/60">
              <span className="w-1 h-1 rounded-full bg-green-400/60" />
              Cash only · 21+ ID required
            </span>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 space-y-3">
        <ClosureBanner closure={closure} />
        <VendorAdSlot slot="menu_sidebar" />
      </div>
      {/* Top-6 deals rail — server-rendered above the native product grid.
          Pre-cutover this sat above the iHJ Boost iframe; native grid keeps
          the same visual lead so customers see the value-prop before the
          grid scroll. Returns null when no active deals (empty is worse
          than no card). */}
      <MenuTopDealsRail deals={activeDeals} />
      <OrderMenu products={products} signedIn={signedIn} activeDeals={activeDeals} initialLoyalty={initialLoyalty} dohVerified={dohVerified} />
      {/* Active-deals strip — every running deal as a brand-tinted chip.
          Visual parity with what the prior iHJ-embed `/menu` rendered
          below the embed. See MENU_TREE_AUDIT.md priority #3. */}
      <MenuActiveDealsStrip deals={activeDeals} treasureChestCount={0} />
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
