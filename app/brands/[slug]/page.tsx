import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { VendorAdSlot } from "@/components/VendorAdSlot";
import { getBrandBySlug, getBrandProducts, getActiveBrands, getActiveDeals } from "@/lib/db";
import { effectivePriceFor, findDealForProduct, ONLINE_DISCOUNT_PCT } from "@/lib/online-pricing";
import { getBrandCopy } from "@/lib/brand-copy";
import { withAttr } from "@/lib/attribution";
import { isBannedLogoUrl } from "@/lib/banned-logo-url";
import { Breadcrumb } from "@/components/Breadcrumb";
import { getProductPlaceholderGradient } from "@/lib/product-placeholder";
import { getCategoryIcon } from "@/lib/product-placeholder-icons";
import { getCategoryPlaceholderPhoto } from "@/lib/category-placeholder-photos";
import { matchProductPhoto } from "@/lib/product-photos-available";
import { STORE } from "@/lib/store";
import NWCSBrandPage from "./_brands/northwest-cannabis-solutions";
import GrowOpFarmsBrandPage from "./_brands/grow-op-farms";
import FairwindsBrandPage from "./_brands/fairwinds-manufacturing";
import SparkIndustriesBrandPage from "./_brands/spark-industries";
import MfusedBrandPage from "./_brands/mfused";
import BondiFarmsBrandPage from "./_brands/bondi-farms";
import OoweeBrandPage from "./_brands/oowee";
import Brand2727Page from "./_brands/2727";
import SungrownBrandPage from "./_brands/sungrown";
import RedbirdBrandPage from "./_brands/redbird-cannabis";
import DeweyCannabisCoBrandPage from "./_brands/dewey-cannabis-co";
import FiftyFoldBrandPage from "./_brands/fifty-fold";
import AgroCoutureBrandPage from "./_brands/agro-couture";
import MinglewoodBrandPage from "./_brands/minglewood-brands";
import SeattleBubbleWorksBrandPage from "./_brands/seattle-bubble-works";
import GreenRevolutionBrandPage from "./_brands/green-revolution";
import TwoKGardensBrandPage from "./_brands/2k-gardens";
// AvitasBrandPage import dropped 2026-05-10 — glw doesn't carry the
// brand (see BRAND_OVERRIDES comment for full context). Component file
// `_brands/avitas.tsx` kept on disk in case the brand returns.
import BotanicaSeattleBrandPage from "./_brands/botanica-seattle";
import RaysLemonadeBrandPage from "./_brands/ray-s-lemonade-wa";
import BuddyBoyFarmBrandPage from "./_brands/buddy-boy-farm";
import { safeJsonLd } from "@/lib/json-ld-safe";

// ISR: brand detail pages are pre-rendered for known slugs (via
// `generateStaticParams` below) and refreshed every 5 min. Was force-dynamic
// — every visit ran getBrandBySlug + getBrandProducts against Neon, even for
// the same brand viewed twice in 30 seconds. Inventory rotates on the order
// of hours, not seconds, so 300s is well within freshness budget.
export const revalidate = 300;

// Per-brand custom page overrides. Add a new entry here when a brand
// graduates from the generic template to a boutique layout — the
// component receives `{ brand, products }` and renders below the
// JSON-LD scripts (which always come from this file so SEO stays
// consistent across templated and custom pages).
//
// Slug is computed from vendor name via the same regex used in db.ts:
// LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')).
type BrandComponentProps = {
  brand: NonNullable<Awaited<ReturnType<typeof getBrandBySlug>>>;
  products: Awaited<ReturnType<typeof getBrandProducts>>;
  /** Active deals so brand-override components can pass to
   *  PaginatedProductsGrid → pricing engine. Optional for backward
   *  compat. */
  deals?: Awaited<ReturnType<typeof getActiveDeals>>;
};
const BRAND_OVERRIDES: Record<string, React.ComponentType<BrandComponentProps>> = {
  "northwest-cannabis-solutions": NWCSBrandPage,
  "grow-op-farms": GrowOpFarmsBrandPage,
  "fairwinds-manufacturing": FairwindsBrandPage,
  "spark-industries": SparkIndustriesBrandPage,
  "mfused": MfusedBrandPage,
  "bondi-farms": BondiFarmsBrandPage,
  "oowee": OoweeBrandPage,
  "2727": Brand2727Page,
  "edgemont-group-dba-sungrown": SungrownBrandPage,
  "redbird-cannabis": RedbirdBrandPage,
  // Dewey vendor row in glw DB is "Dewey Cannabis Co." — the trailing
  // period slugifies to a trailing dash via the
  // `LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))` rule.
  // BRAND_OVERRIDES key MUST match the actual DB slug; pre-fix it was
  // "dewey-cannabis-co" (no trailing dash) and so the override never
  // ran — `/brands/dewey-cannabis-co-` (the URL Google indexed from
  // sitemap) fell through to the generic template instead of the rich
  // boutique component. Fixed 2026-05-10 in /loop tick 13.
  "dewey-cannabis-co-": DeweyCannabisCoBrandPage,
  "fifty-fold": FiftyFoldBrandPage,
  "agro-couture": AgroCoutureBrandPage,
  "minglewood-brands": MinglewoodBrandPage,
  "seattle-bubble-works": SeattleBubbleWorksBrandPage,
  "green-revolution": GreenRevolutionBrandPage,
  "2k-gardens": TwoKGardensBrandPage,
  // `avitas` removed 2026-05-10 — glw doesn't actually carry Avitas
  // (no row in the vendors table whose name slugifies to any avitas
  // variant). Pre-fix the override + alias map referenced "avitas" as
  // a canonical slug, but every getBrandBySlug call returned null;
  // `/brands/avitas` (and the `-cannabis` / `-grown` aliases) all
  // soft-404'd. AvitasBrandPage component file kept on disk in case
  // glw starts carrying Avitas — re-add the BRAND_OVERRIDES entry +
  // SLUG_ALIASES once the vendor row exists in DB. Caught by /loop
  // tick 13 dead-config audit. (scc carries Avitas + the override
  // works correctly there.)
  "botanica-seattle": BotanicaSeattleBrandPage,
  "ray-s-lemonade-wa": RaysLemonadeBrandPage,
  "buddy-boy-farm": BuddyBoyFarmBrandPage,
};

// Slug aliases — friendly customer-facing URLs that map to the actual
// vendor row's auto-generated slug. Sub-brands of multi-brand producers
// get their own URL even though the products live under the parent
// vendor (e.g. Plaid Jacket is a Spark Industries sub-brand). The page
// renders the parent's custom layout; SMS shares using the recognizable
// brand name still land on a focused page.
const SLUG_ALIASES: Record<string, string> = {
  "plaid-jacket": "spark-industries",
  "phat-panda": "grow-op-farms",
  "sungrown": "edgemont-group-dba-sungrown",
  "leafwerx": "edgemont-group-dba-sungrown",
  // Dewey vendor row's actual DB slug ends in a trailing dash (DB name
  // = "Dewey Cannabis Co." — period slugifies to dash). Map the cleaner
  // customer-facing URLs to that canonical slug.
  "dewey-cannabis-co": "dewey-cannabis-co-",
  "dewey-botanicals": "dewey-cannabis-co-",
  "dewey-botanicals-llc": "dewey-cannabis-co-",
  "slab-mechanix": "agro-couture",
  // Avitas SLUG_ALIASES removed 2026-05-10 — glw doesn't carry Avitas
  // (no DB row), so aliasing -cannabis / -grown to "avitas" landed on
  // a non-existent slug and soft-404'd. Re-add when glw starts
  // carrying Avitas + a vendor row exists. (scc keeps these aliases
  // because scc DOES carry Avitas.)
  // Botanica Seattle has multiple sub-brands a customer might search for
  // by name even though all the products live under the parent vendor row.
  "mr-moxeys": "botanica-seattle",
  "mr-moxey-s": "botanica-seattle",
  "moxey": "botanica-seattle",
  "journeyman": "botanica-seattle",
  "spot": "botanica-seattle",
  "botanica": "botanica-seattle",
  // Ray's Lemonade — vendor row is "ray-s-lemonade-wa" (WSLCB filing
  // breaks the apostrophe with a hyphen). Add friendly URL aliases.
  "rays-lemonade": "ray-s-lemonade-wa",
  "ray-s-lemonade": "ray-s-lemonade-wa",
  "rays": "ray-s-lemonade-wa",
};

// Display-name override for aliased slugs — when a customer lands on
// /brands/phat-panda we want the page-title + meta + OG-card to say
// "Phat Panda" not "Grow Op Farms" (the DB vendor row's name). Polish-
// audit 2026-05-20 caught this: `<title>Grow Op Farms — Green Life...`
// on /brands/phat-panda defeats the brand-first SEO pivot Doug just
// shipped. When the rawSlug has an entry here, use the display name in
// metadata; otherwise fall back to brand.name from the DB.
const SLUG_DISPLAY_NAMES: Record<string, string> = {
  "phat-panda": "Phat Panda",
  "plaid-jacket": "Plaid Jacket",
  "sungrown": "Leafwerx · Cookies WA · Solr Bear",
  "leafwerx": "Leafwerx",
  "slab-mechanix": "Slab Mechanix",
  "mr-moxeys": "Mr. Moxey's",
  "mr-moxey-s": "Mr. Moxey's",
  "moxey": "Mr. Moxey's",
  "journeyman": "Journeyman",
  "spot": "Spot",
  "botanica": "Botanica Seattle",
  "rays-lemonade": "Ray's Lemonade",
  "ray-s-lemonade": "Ray's Lemonade",
  "rays": "Ray's Lemonade",
};

type Props = { params: Promise<{ slug: string }> };

// dynamicParams=true (Doug 2026-05-17 — sister scc v28.705 same-pattern fix).
// Previously false (fast-404 at the edge for unknown slugs), but brands
// that sell through + drop off `getActiveBrands()` for a week then come
// back are a normal pattern (vendor restocks, customer hits a bookmark
// or Google-cached URL). Hard-404'ing those URLs is bad customer UX vs.
// a soft "not on the shelf right now" page.
//
// SEO defense: any unknown-slug render returns `robots: { index: false,
// follow: false }` via generateMetadata's null-brand branch so Google
// doesn't index the fallback as a dupe. generateStaticParams still emits
// all canonical brand slugs + SLUG_ALIASES, so KNOWN brands keep their
// ISR pre-render + proper meta. Only the dynamic catch-all path gets the
// noindex fallback render.
export const dynamicParams = true;

export async function generateStaticParams() {
  const brands = await getActiveBrands().catch(() => []);
  const canonical = brands.map((b) => ({ slug: b.slug }));
  const aliases = Object.keys(SLUG_ALIASES).map((slug) => ({ slug }));
  return [...canonical, ...aliases];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  // Alias-resolution sister of the page render. Pre-fix, generateMetadata
  // called getBrandBySlug with the RAW slug while the page component
  // resolved aliases first — so for every SLUG_ALIASES entry
  // (`/brands/plaid-jacket`, `/brands/phat-panda`, `/brands/sungrown`,
  // `/brands/leafwerx`, `/brands/dewey-botanicals`, `/brands/slab-mechanix`,
  // `/brands/avitas-cannabis`, `/brands/avitas-grown`,
  // `/brands/mr-moxeys`, `/brands/journeyman`, `/brands/spot`,
  // `/brands/botanica`, `/brands/rays-lemonade`, `/brands/rays`, etc.)
  // the page would render correctly but the metadata fell back to the
  // layout default title + noindex hint. Google indexed alias URLs as
  // duplicates of the homepage title — exact duplicate-content signal
  // we don't want. Caught 2026-05-10 by /loop tick 4 sister scc fix.
  // Case-normalize the rawSlug — externally-linked URLs with mixed case
  // ("/brands/ARTIZEN") would otherwise hit SLUG_ALIASES + DB lookups as
  // case-sensitive and miss, soft-404'ing valid brands. Smoke-test audit
  // 2026-05-20 found this against /brands/ARTIZEN. Lowercase once at the
  // top of generateMetadata + the page function below.
  const slug = SLUG_ALIASES[rawSlug.toLowerCase()] ?? rawSlug.toLowerCase();
  const brand = await getBrandBySlug(slug).catch(() => null);
  if (!brand) {
    // Soft-404 mitigation: Next 16 + ISR + page-level `notFound()` (line ~135)
    // produces an HTTP 200 response with the not-found.tsx body for unknown
    // slugs. Without this `robots: noindex` hint Google could index the
    // soft-404 page as a real /brands/<slug> entry.
    return { robots: { index: false, follow: false } };
  }
  return {
    // title.absolute drops template suffix `· Green Life Cannabis` so total
    // brand-name + body fits under Google ~60-char SERP cap. Pre-fix every
    // brand page rendered "BRAND — Cannabis at Green Life Wenatchee | Green
    // Life Cannabis" = 64-81 chars depending on brand length. Sister
    // glw v12.705 deals/blog title.absolute pattern.
    //
    // 2026-05-10 v12.905 sweep: long brand names ("Northwest Cannabis
    // Solutions" 27 chars, with " — Green Life Cannabis (Wenatchee)" suffix
    // = 62 chars) STILL over cap. Switch to compact pattern: drop
    // "(Wenatchee)" parenthetical when brand name is long. Threshold = 23
    // chars on brand.name (so "Northwest Cannabis Solutions" 27 chars uses
    // the short pattern).
    // Brand-first display name — when rawSlug is a known alias
    // (e.g. /brands/phat-panda), use the customer-facing display name
    // ("Phat Panda") rather than the DB vendor row's parent-distributor
    // name ("Grow Op Farms"). Polish-audit 2026-05-20.
    title: { absolute: (() => {
      const displayName = SLUG_DISPLAY_NAMES[rawSlug.toLowerCase()] ?? getBrandCopy(slug)?.displayName ?? brand.name;
      return displayName.length > 23
        ? `${displayName} — Green Life Cannabis`
        : `${displayName} — Green Life Cannabis (Wenatchee)`;
    })() },
    // ~155 chars — v10.105 length sweep.
    description: `${SLUG_DISPLAY_NAMES[rawSlug.toLowerCase()] ?? getBrandCopy(slug)?.displayName ?? brand.name} cannabis at ${STORE.name} — ${brand.activeSkus} product${brand.activeSkus !== 1 ? "s" : ""} in stock. Order ahead for cash pickup. 21+.`,
    // Canonical points at the resolved (canonical) slug, NOT the alias.
    alternates: { canonical: `/brands/${slug}` },
    openGraph: {
      siteName: STORE.name,
      locale: "en_US",
      title: `${SLUG_DISPLAY_NAMES[rawSlug.toLowerCase()] ?? getBrandCopy(slug)?.displayName ?? brand.name} | ${STORE.name}`,
      description: `Browse ${SLUG_DISPLAY_NAMES[rawSlug.toLowerCase()] ?? getBrandCopy(slug)?.displayName ?? brand.name} cannabis products available at ${STORE.name}, ${STORE.address.city} WA. Live menu, prices, lab data.`,
      url: `${STORE.website}/brands/${slug}`,
      type: "website",
      // Per-route OG at /brands/{slug}/opengraph-image (file convention) —
      // renders a custom 1200×630 card with brand name + product count +
      // brand-themed gradient, better-suited for Twitter/FB/iMessage
      // share-card aspect than the bare brand logo (typically 80×40 or
      // similar small icon size that crawlers render letterboxed).
      // Pre-fix conditional `{ images: [{ url: brand.logoUrl }] }` bypassed
      // the per-route convention when logoUrl was set, putting a tiny
      // brand-icon image in the share-card slot. Sister T48 /blog/[slug]
      // same fix class.
      images: [
        {
          url: `/brands/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${SLUG_DISPLAY_NAMES[rawSlug.toLowerCase()] ?? getBrandCopy(slug)?.displayName ?? brand.name} — at ${STORE.name}`,
        },
      ],
    },
  };
}

const STRAIN_COLORS: Record<string, { badge: string }> = {
  sativa: { badge: "bg-red-100 text-red-700 border-red-200" },
  indica: { badge: "bg-purple-100 text-purple-700 border-purple-200" },
  hybrid: { badge: "bg-green-100 text-green-700 border-green-200" },
};

const CAT_ICONS: Record<string, string> = {
  Flower: "🌿",
  "Pre-Rolls": "🫙",
  Vapes: "💨",
  Concentrates: "🧴",
  Edibles: "🍬",
  Tinctures: "💊",
  Topicals: "🧼",
  Accessories: "🔧",
};

export default async function BrandPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  // Lowercase the rawSlug — see generateMetadata above for full context.
  // Externally-linked URLs with mixed case would otherwise soft-404.
  const slug = SLUG_ALIASES[rawSlug.toLowerCase()] ?? rawSlug.toLowerCase();
  const brand = await getBrandBySlug(slug).catch(() => null);
  if (!brand) {
    // Soft-fallback render — brand isn't in our active vendor list right
    // now (sold through, name changed, or never set up). Show top brands +
    // CTAs so the customer doesn't bounce. Returns HTTP 200 with
    // robots:noindex (set in generateMetadata above) so Google doesn't
    // dupe-index this URL. Sister scc v28.705 same-pattern fix (Doug
    // 2026-05-17 /brands/ballin 404 screenshot).
    return <BrandNotCarriedFallback rawSlug={rawSlug} />;
  }

  // Defense-in-depth: drop aggregator/broken logoUrls before they hit
  // render, JSON-LD, or product-image fallback. Sitemap already filters
  // via the same module (v13.905). Sister scc same fix.
  //
  // 2026-05-17 vendor-logo backfill lane: DB column is sparse (~26%
  // coverage per BRANDS_PAGES_COMPLETION_AUDIT_2026_05_15.md). File-based
  // fallback in BRAND_COPY.logoUrl points to self-hosted PNGs at
  // /public/brand-logos/<slug>.png (cross-stack mirror). Fallback chain:
  //   1. DB vendors.logo_url (vendor-portal-authored)
  //   2. BRAND_COPY[slug].logoUrl (file-based, this code path)
  //   3. 🌿 emoji placeholder
  // File paths are trusted (under version control) so banned-logo filter
  // applies to the DB tier only.
  const dbLogoUrl = brand.logoUrl && !isBannedLogoUrl(brand.logoUrl) ? brand.logoUrl : null;
  const logoUrl = dbLogoUrl ?? getBrandCopy(slug)?.logoUrl ?? null;

  const [products, deals] = await Promise.all([
    getBrandProducts(brand.id).catch(() => []),
    // Brand pages were rendering raw p.unit_price.toFixed(2) — bypassed the
    // online-pricing engine (Doug 2026-05-17 screenshot caught BALLIN at
    // $18.00 instead of post-discount). Fetch active deals so the price
    // render below applies the BIGGER of (20% online floor, current daily
    // deal %) per `lib/online-pricing.ts` semantics.
    getActiveDeals({ includeAppOnly: true }).catch(() => []),
  ]);
  const categories = [...new Set(products.map((p) => p.category ?? "Other"))].sort((a, b) => {
    const order = [
      "Flower",
      "Pre-Rolls",
      "Vapes",
      "Concentrates",
      "Edibles",
      "Tinctures",
      "Topicals",
      "Accessories",
      "Other",
    ];
    return order.indexOf(a) - order.indexOf(b);
  });

  const brandUrl = `${STORE.website}/brands/${slug}`;
  // 3-layer display-name fallback chain for ALL customer-facing surfaces
  // (h1, breadcrumb, alt, JSON-LD schemas, OG cards, meta). Same chain
  // generateMetadata uses above. Pulled out as a single const so every
  // schema below references the consistent customer-facing name.
  const displayName = SLUG_DISPLAY_NAMES[rawSlug.toLowerCase()] ?? getBrandCopy(slug)?.displayName ?? brand.name;
  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "@id": `${brandUrl}#brand`,
    name: displayName,
    description: `${displayName} — Washington-state cannabis brand carried at ${STORE.name} in ${STORE.address.city}, WA. ${brand.activeSkus} active product${brand.activeSkus !== 1 ? "s" : ""} on the menu.`,
    ...(brand.website ? { url: brand.website, sameAs: [brand.website] } : {}),
    ...(logoUrl ? { logo: logoUrl, image: logoUrl } : {}),
  };

  // Product schemas — gives AI engines structured, citable answers for
  // "{brand} cannabis Wenatchee" and "{product name} price near me" queries.
  // Tightened to unit_price > 0 (matches what's actually shown on the page)
  // and references the LocalBusiness @id from layout.tsx instead of
  // duplicating the seller's address inline.
  const productSchemas = products
    .filter((p) => p.unit_price != null && p.unit_price > 0)
    .map((p) => ({
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${brandUrl}#product-${p.id}`,
      name: p.name,
      brand: { "@id": `${brandUrl}#brand` },
      ...(p.category ? { category: p.category } : {}),
      image: p.image_url || logoUrl || `${STORE.website}/brands/${slug}/opengraph-image`,
      ...(p.effects ? { description: p.effects } : {}),
      ...(p.thc_pct != null
        ? {
            additionalProperty: [
              { "@type": "PropertyValue", name: "THC", value: `${p.thc_pct.toFixed(1)}%` },
              ...(p.cbd_pct != null && p.cbd_pct > 0
                ? [{ "@type": "PropertyValue", name: "CBD", value: `${p.cbd_pct.toFixed(1)}%` }]
                : []),
              ...(p.strain_type
                ? [{ "@type": "PropertyValue", name: "Strain Type", value: p.strain_type }]
                : []),
            ],
          }
        : {}),
      offers: {
        "@type": "Offer",
        price: p.unit_price!.toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        availableAtOrFrom: { "@id": `${STORE.website}/#dispensary` },
        seller: { "@id": `${STORE.website}/#dispensary` },
        url: `${STORE.website}/menu`,
      },
    }));

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${brandUrl}#page`,
    name: `${displayName} at ${STORE.name}`,
    description: `${brand.activeSkus} ${displayName} cannabis product${brand.activeSkus !== 1 ? "s" : ""} in stock at ${STORE.name}, ${STORE.address.city}, WA.`,
    url: brandUrl,
    about: { "@id": `${brandUrl}#brand` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@id": `${brandUrl}#product-${p.id}`, name: p.name },
      })),
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      // Stable @id — T91 entity-graph linking. Pre-fix the inline
      // breadcrumb was a dangling node addressable only via inheritance.
      "@id": `${brandUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
        // Middle "Brands" level — pre-T91 the breadcrumb skipped from
        // Home directly to the brand page; Google rendered "Home › Avitas"
        // in the SERP path. Adding "Brands" matches the actual nav
        // structure (Home › Brands › Avitas) for richer SERP path display.
        { "@type": "ListItem", position: 2, name: "Brands", item: `${STORE.website}/brands` },
        { "@type": "ListItem", position: 3, name: displayName, item: brandUrl },
      ],
    },
  };

  const Override = BRAND_OVERRIDES[slug];
  if (Override) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(brandSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionSchema) }}
        />
        {productSchemas.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: safeJsonLd(productSchemas) }}
          />
        )}
        <Override brand={brand} products={products} deals={deals} />
      </>
    );
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(brandSchema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionSchema) }}
      />
      {productSchemas.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(productSchemas) }}
        />
      )}

      {/* Display name — alias-specific override (SLUG_DISPLAY_NAMES) wins
          first, then per-brand displayName from BRAND_COPY (fixes shouty
          all-caps DB names like "ARTIZEN"→"Artizen"), then fall back to
          the raw DB vendor name. Used in breadcrumb, h1, and logo alt. */}
      {(() => null)()}
      <Breadcrumb items={[{ label: "Brands", href: "/brands" }, { label: displayName }]} />

      {/* Header */}
      <div className="bg-green-950 text-white py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4 sm:gap-6">
          {logoUrl ? (
            <div className="shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white flex items-center justify-center shadow-xl relative overflow-hidden">
              <Image src={logoUrl} alt={displayName} fill sizes="(max-width: 640px) 112px, 128px" className="object-contain p-4" />
            </div>
          ) : (
            <div className="shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-green-800 border border-green-700 flex items-center justify-center text-4xl">
              🌿
            </div>
          )}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{displayName}</h1>
            {/* Heritage tagline — Doug 2026-05-20: "people want to know how
                long the product has been getting people high for, not who
                is behind it." Hero is the brand-first surface; tagline up
                front, distributor relationship + SKU count secondary. */}
            {(() => {
              const fileCopy = getBrandCopy(slug);
              return fileCopy?.tagline ? (
                <p className="text-green-100 text-base font-semibold mt-1.5 max-w-2xl">
                  {fileCopy.tagline}
                </p>
              ) : null;
            })()}
            <p className="text-green-300/70 text-sm mt-2 flex flex-wrap items-center gap-3">
              <span>
                {brand.activeSkus} product{brand.activeSkus !== 1 ? "s" : ""} in {STORE.address.city}, WA
              </span>
              {brand.website && (
                <a
                  href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors underline underline-offset-2 text-green-400"
                >
                  Visit website ↗
                </a>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10 sm:space-y-12">
        {/* Vendor / house ad — top of brand page (placement_slot='brand_page_top') */}
        <VendorAdSlot slot="brand_page_top" />

        {/* Brand bio + socials — vendor-authored via /vmi/profile. Both
            blocks render only when the vendor has filled them in (avoids a
            half-empty section on brands that haven't logged in yet). The
            handle is sanitized to [A-Za-z0-9._-] before being concatenated
            into a URL — without this, a vendor could put `realbrand?phish=1`
            in their handle to add unwanted query params, or worse use `..` to
            climb the path. The /vmi Server Action only strips a leading `@`. */}
        {(() => {
          const safe = (h: string | null) => (h ? (h.match(/^[A-Za-z0-9._-]+$/) ? h : null) : null);
          const ig = safe(brand.socialInstagram);
          const x = safe(brand.socialX);
          const fb = safe(brand.socialFacebook);
          // v36.245: fallback chain — DB vendor-portal bio wins (vendor-authored
          // via /vmi/profile); file-based BRAND_COPY is the curated fallback for
          // brands that haven't adopted the portal yet. Per BRANDS_PAGES_COMPLETION_AUDIT_2026_05_15.md.
          const fileCopy = getBrandCopy(slug);
          const displayBio = brand.brandBio || fileCopy?.bio || null;
          if (!displayBio && !ig && !x && !fb) return null;
          return (
            <section className="rounded-2xl border border-stone-100 bg-white p-6 sm:p-8 space-y-5">
              {displayBio && (
                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-green-700">
                    About {displayName}
                  </p>
                  {fileCopy?.tagline && !brand.brandBio && (
                    <p className="text-stone-900 font-semibold leading-snug text-base">
                      {fileCopy.tagline}
                    </p>
                  )}
                  {displayBio.split(/\n{2,}/).map((para, i) => (
                    <p key={i} className="text-stone-700 leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              )}
              {(ig || x || fb) && (
                <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-stone-100">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Follow them
                  </p>
                  {ig && (
                    <a
                      href={`https://instagram.com/${ig}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-700 hover:text-green-600 font-semibold underline underline-offset-2"
                    >
                      @{ig} on Instagram
                    </a>
                  )}
                  {x && (
                    <a
                      href={`https://x.com/${x}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-700 hover:text-green-600 font-semibold underline underline-offset-2"
                    >
                      @{x} on X
                    </a>
                  )}
                  {fb && (
                    <a
                      href={`https://facebook.com/${fb}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-700 hover:text-green-600 font-semibold underline underline-offset-2"
                    >
                      {fb} on Facebook
                    </a>
                  )}
                </div>
              )}
            </section>
          );
        })()}

        {/* Order CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-green-800 to-emerald-800 text-white px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-base">Want to order {displayName}?</p>
            <p className="text-green-200/80 text-sm">Place a pickup order — save 20% online.</p>
          </div>
          <Link
            href={withAttr(`/menu?brand=${slug}`, "brand", slug)}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-all shadow-md hover:-translate-y-0.5"
          >
            Order for Pickup →
          </Link>
        </div>

        {/* Products by category */}
        {products.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="text-4xl" aria-hidden="true">🌿</div>
            <p className="text-stone-500 font-medium">No products currently in stock</p>
            <Link
              href={withAttr(`/menu?brand=${slug}`, "brand", slug)}
              className="text-sm text-green-700 font-semibold hover:underline"
            >
              Browse full menu →
            </Link>
          </div>
        ) : (
          categories.map((cat) => {
            const catProducts = products.filter((p) => (p.category ?? "Other") === cat);
            return (
              <section key={cat}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl" aria-hidden="true">{CAT_ICONS[cat] ?? "🌱"}</span>
                  <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">{cat}</h2>
                  <span className="text-xs font-medium text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                    {catProducts.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catProducts.map((p) => {
                    const strainKey = (p.strain_type ?? "").toLowerCase();
                    const strain = STRAIN_COLORS[strainKey];
                    return (
                      <div
                        key={p.id}
                        className="rounded-2xl border border-stone-100 bg-white overflow-hidden hover:border-green-300 hover:shadow-md transition-all group"
                      >
                        {p.image_url ? (
                          <div className="h-44 bg-stone-100 overflow-hidden relative">
                            <Image
                              src={p.image_url}
                              alt={p.name}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                        ) : (() => {
                          const productPhotoPath = matchProductPhoto(p.name, p.brand, p.category);
                          if (productPhotoPath) {
                            return (
                              <div className="h-44 bg-stone-100 overflow-hidden relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={productPhotoPath}
                                  alt={p.name}
                                  loading="lazy"
                                  className="w-full h-full object-contain p-2"
                                />
                              </div>
                            );
                          }
                          const placeholderPath = getCategoryPlaceholderPhoto(p.category);
                          if (placeholderPath) {
                            return (
                              <div className="h-44 bg-stone-100 overflow-hidden relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={placeholderPath}
                                  alt={p.name}
                                  loading="lazy"
                                  className="w-full h-full object-cover"
                                />
                                <div
                                  className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none"
                                  aria-hidden="true"
                                />
                                {p.brand && (
                                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider text-stone-900 px-2.5 py-1 bg-white/85 backdrop-blur-sm rounded-full line-clamp-1 max-w-[80%] shadow-sm border border-white/50">
                                    {p.brand}
                                  </span>
                                )}
                              </div>
                            );
                          }
                          const Icon = getCategoryIcon(p.category);
                          return (
                            <div
                              role="img"
                              aria-label={p.name}
                              className={`h-44 flex flex-col items-center justify-center gap-2 ${getProductPlaceholderGradient(p.category, p.strain_type)}`}
                            >
                              <Icon className="w-14 h-14 text-stone-700/70 drop-shadow-sm" aria-hidden="true" />
                              {p.brand && (
                                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 px-3 py-1 bg-white/75 backdrop-blur-sm rounded-full line-clamp-1 max-w-[85%] shadow-sm">
                                  {p.brand}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="font-bold text-stone-900 text-sm leading-snug">{p.name}</h3>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {p.strain_type && strain && (
                              <span
                                className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold capitalize ${strain.badge}`}
                              >
                                {p.strain_type}
                              </span>
                            )}
                            {p.thc_pct != null && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                                THC {p.thc_pct.toFixed(1)}%
                              </span>
                            )}
                            {p.cbd_pct != null && p.cbd_pct > 0 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                                CBD {p.cbd_pct.toFixed(1)}%
                              </span>
                            )}
                          </div>
                          {p.effects && <p className="text-xs text-stone-400 line-clamp-1">✨ {p.effects}</p>}
                          <div className="flex items-center justify-between pt-1 border-t border-stone-50">
                            {(() => {
                              if (p.unit_price == null) {
                                return <span className="text-stone-300">—</span>;
                              }
                              const pricing = effectivePriceFor(
                                { unitPrice: p.unit_price, category: p.category },
                                findDealForProduct({ category: p.category }, deals),
                              );
                              if (pricing.displayPrice == null) {
                                return <span className="text-stone-300">—</span>;
                              }
                              return (
                                <div className="flex flex-col leading-tight">
                                  <span className="text-stone-400 line-through text-[10px] decoration-red-500 decoration-2">
                                    ${pricing.originalPrice?.toFixed(2)}
                                  </span>
                                  <span className="font-extrabold text-stone-900 text-base">
                                    ${pricing.displayPrice.toFixed(2)}
                                  </span>
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-green-700 leading-none">
                                    {pricing.dealName
                                      ? `${Math.round(pricing.discountPct)}% off · ${pricing.dealName}`
                                      : `${ONLINE_DISCOUNT_PCT}% off online`}
                                  </span>
                                </div>
                              );
                            })()}
                            <Link
                              href={withAttr(`/menu?brand=${slug}`, "brand", slug)}
                              className="text-xs font-bold text-green-700 hover:text-green-600 transition-colors"
                            >
                              Order →
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}

      </div>
    </>
  );
}

// Doug 2026-05-17 — /brands/<unknown> soft-fallback (sister scc v28.705).
// Customer hit a bookmark or Google-cached URL for a brand we don't
// currently carry. Render a friendly "not on the shelf right now —
// here's similar" page with noindex (set in generateMetadata above).
// Set dynamicParams=true (top of file) for the catch-all to reach this.
//
// 2026-05-20: when `MENU_PRE_ONBOARD_BRANDS_ENABLED=true` AND BRAND_COPY
// has a curated entry for this slug, the fallback rendering is enhanced
// to surface the curated bio + tagline + (optional) logo so customers
// who hit a brand we're talking about pre-onboarding (e.g. Buddy Boy
// Farm — slug present in BRAND_COPY since 2026-05-16 but not yet in
// the vendors table) get a real informational page instead of just
// "isn't on our shelf right now." Default OFF preserves the existing
// honest-disclaimer-first behavior; flag-ON adds context below the
// disclaimer (the disclaimer itself stays as the headline so we don't
// mislead). Sister-port at scc/app/brands/[slug]/page.tsx.
async function BrandNotCarriedFallback({ rawSlug }: { rawSlug: string }) {
  // Pretty the slug back into a brand-name-ish display ("ballin" → "Ballin").
  // Never trust the slug for HTML attributes — only display text inside
  // text children (no innerHTML).
  const slugPretty = rawSlug
    .split("-")
    .map((p) => (p.length === 0 ? p : p[0].toUpperCase() + p.slice(1)))
    .join(" ");
  // ALWAYS check BRAND_COPY for a displayName regardless of the pre-
  // onboarding flag — even when we're not surfacing the curated logo/
  // tagline yet, the displayName fallback gives customers the right
  // brand-facing name on the "isn't on our shelf" page (e.g.
  // /brands/heylo-cannabis → "Heylo" not "Heylo Cannabis"; /brands/honu-inc
  // → "Honu" not "Honu Inc"). Doug 2026-05-20 "more focused on the brand"
  // extends to the fallback page too. Polish ship.
  const brandCopyForFallback = getBrandCopy(rawSlug);
  const prettyName = brandCopyForFallback?.displayName ?? slugPretty;
  const allBrands = await getActiveBrands().catch(() => []);
  const featured = allBrands.slice(0, 8);

  // Pre-onboarding curated content surface — only fires when env-flag is
  // ON AND BRAND_COPY has a curated entry for this slug. Logo path falls
  // back to the file convention `/brand-logos/<slug>.png` when BRAND_COPY
  // doesn't specify an explicit logoUrl (same convention the menu's
  // ProductImage brand-logo fallback uses).
  const preOnboardingEnabled = process.env.MENU_PRE_ONBOARD_BRANDS_ENABLED === "true";
  const curated = preOnboardingEnabled ? brandCopyForFallback : null;
  const curatedLogoUrl = curated?.logoUrl ?? (curated ? `/brand-logos/${rawSlug}.png` : null);
  const curatedDisplayName = curated ? prettyName : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <Breadcrumb items={[{ label: "Brands", href: "/brands" }, { label: prettyName }]} />

        <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-6 sm:p-8 text-center">
          <p className="text-5xl mb-3" aria-hidden="true">🌿</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
            {prettyName + " isn’t on our shelf right now"}
          </h1>
          <p className="text-stone-600 text-sm sm:text-base max-w-lg mx-auto">
            Our menu rotates as vendors restock. This brand may be back soon, or
            you may have followed an older link. Try a brand we carry today or
            shop the live menu below.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 justify-center">
            <a
              href="/menu"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors"
            >
              Shop the live menu →
            </a>
            <a
              href="/brands"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-stone-300 text-stone-800 text-sm font-bold hover:border-stone-500 transition-colors"
            >
              See all brands
            </a>
          </div>
        </div>

        {curated && (
          <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 sm:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700 mb-3">
              About {curatedDisplayName}
            </p>
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {curatedLogoUrl && (
                <div className="shrink-0 w-20 h-20 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center overflow-hidden relative">
                  <Image
                    src={curatedLogoUrl}
                    alt={`${curatedDisplayName} logo`}
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                  />
                </div>
              )}
              <div className="space-y-3 min-w-0 flex-1">
                {curated.tagline && (
                  <p className="text-stone-900 font-semibold leading-snug">{curated.tagline}</p>
                )}
                {curated.bio &&
                  curated.bio.split(/\n{2,}/).map((para, i) => (
                    <p key={i} className="text-stone-700 text-sm leading-relaxed">
                      {para}
                    </p>
                  ))}
              </div>
            </div>
            <p className="text-[11px] text-stone-400 mt-4 leading-relaxed">
              We don&apos;t currently carry {curatedDisplayName} on our shelf — this is
              background on the brand. Check the live menu for what we&apos;re stocking
              today.
            </p>
          </section>
        )}

        {featured.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-3">
              Brands we&rsquo;re carrying today
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {featured.map((b) => (
                <li key={b.id}>
                  <a
                    href={`/brands/${b.slug}`}
                    className="block rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-900 hover:border-emerald-300 hover:text-emerald-700 transition-colors text-center"
                  >
                    {b.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
