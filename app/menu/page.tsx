import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { STORE, todayCloseLabel, getOrderingStatus } from "@/lib/store";
import { getMenuProducts, getPickupEta, getActiveDeals } from "@/lib/db";
import { fetchClosureStatus } from "@/lib/closure-status";
import { getLoyaltyByClerkId, getMedicalStatusByClerkId } from "@/lib/portal";
import { OrderMenu } from "../order/OrderMenu";
import { ClosureBanner } from "@/components/ClosureBanner";
import { MenuActiveDealsStrip } from "@/components/MenuActiveDealsStrip";
import { MenuLocalStrip } from "@/components/MenuLocalStrip";
import { VendorAdSlot } from "@/components/VendorAdSlot";
import { Breadcrumb } from "@/components/Breadcrumb";
import { safeJsonLd } from "@/lib/json-ld-safe";

// /menu = on-domain DB-backed product grid (OrderMenu.tsx). Customers
// stay on greenlifecannabis.com, see the live inventory rendered by our
// own components with the ProductImage onError → gradient-placeholder
// fallback. Replaces the iHeartJane Jane Boost embed that served /menu
// prior to the 2026-05-19 cutover (commit message v36.* "/menu cutover —
// retire iHJ Boost"). Companion ship on scc (sister cutover same day).
//
// Why we left iHJ: (a) the WP→Vercel migration broke iHJ's CORS handshake
// (full diagnostic in MENU_LOG.md — diagnostic loop exhausted on our side)
// and (b) iHJ's renderer has no broken-image fallback, so when vendor
// image hosts (the420bar.com, etc.) returned 4xx the product cards
// rendered the browser's default broken-img glyph. Our OrderMenu at
// /Users/GreenLife/Documents/CODE/Green Life/greenlife-web/app/order/OrderMenu.tsx:262-389
// has the onError → gradient placeholder pattern (gradient + brand pill +
// category icon) so the same upstream image failures degrade gracefully.

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

  // CollectionPage + ItemList of menu categories. Pre-cutover the iHJ
  // Boost embed held the live product data inside its iframe-less mount
  // so we couldn't expose per-product LD. Post-cutover we ALSO get
  // per-product structured data via OrderMenu's own emit (separate JSON-LD
  // shipped by the product grid). Keeping the category collection here
  // preserves the SERP site-link / category-carousel signal we earned
  // pre-cutover.
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
      {/* Premium page header — replaces the iHJ-era light header. Hero band
          matches /order's visual register (consolidated at cutover from
          /menu-preview). */}
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
      <OrderMenu products={products} signedIn={signedIn} activeDeals={activeDeals} initialLoyalty={initialLoyalty} dohVerified={dohVerified} />
      {/* Active-deals strip — surfaces running deals as brand-tinted chips
          below the product grid. Pre-cutover this lived under the Boost
          embed; post-cutover it's redundant with OrderMenu's per-card deal
          chips for non-PWA-only deals, but the PWA-only deals path still
          needs the strip's data-app-only attrs for client-side filtering. */}
      <MenuActiveDealsStrip deals={activeDeals} treasureChestCount={0} />
      {/* Geo-cohort tie-back. Homepage hero already promises "we serve
          the whole valley" with full town cards; here we surface the
          same STORE.nearbyTowns set as a compact strip so deep-link
          customers landing on /menu without seeing the homepage still
          read the same local-cohort signal — and so search-engine
          crawls of /menu get the geographic reinforcement. */}
      <MenuLocalStrip />
    </div>
  );
}
