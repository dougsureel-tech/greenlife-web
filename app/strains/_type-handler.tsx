// Helper module for /strains/[slug]/page.tsx — renders the per-category
// landing pages (indica/sativa/hybrid/cbd) when slug matches a strain type.
//
// Why a helper not a sibling route: Next.js 16 doesn't allow two sibling
// dynamic routes at the same level (`[type]` + `[slug]` collide).
// The [slug] route now dispatches: type slugs render via this module,
// strain slugs render the strain detail JSX in page.tsx.
//
// Underscore-prefix filename keeps this OUT of the routing tree —
// importable as a module but not addressable as `/strains/_type-handler`.

import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { STRAIN_TYPES, getStrainType } from "@/lib/strain-types";
import { STRAINS, getStrainsInCurrentWave } from "@/lib/strains";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { buildHubItemListJsonLd } from "@/lib/hub-itemlist-json-ld";
import { withAttr } from "@/lib/attribution";
import { Breadcrumb } from "@/components/Breadcrumb";

export function isStrainTypeSlug(slug: string): boolean {
  return STRAIN_TYPES.some((t) => t.slug === slug);
}

export function strainTypeMetadata(slug: string): Metadata | null {
  const t = getStrainType(slug);
  if (!t) return null;
  const title = { absolute: `${t.name} strains — ${STORE.name}` } as const;
  return {
    title,
    description: t.metaDescription,
    alternates: { canonical: `/strains/${t.slug}` },
    keywords: t.keywords,
    openGraph: {
      type: "website",
      locale: "en_US",
      title,
      description: t.metaDescription,
      url: `${STORE.website}/strains/${t.slug}`,
      siteName: STORE.name,
      // Per-route OG was killed by the [type] + [slug] route-merge fix
      // (Next.js 16 can't disambiguate sibling dynamic routes). Falling
      // back to the root site OG explicitly satisfies `check-og-completeness`
      // (every child openGraph block must re-emit images) while keeping the
      // type-page surface visually anchored to the same brand card the rest
      // of the site uses.
      images: [
        {
          url: `${STORE.website}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${t.name} strains at ${STORE.name} · ${t.subhead}`,
        },
      ],
    },
  };
}

export function StrainTypePage({ slug }: { slug: string }) {
  const t = getStrainType(slug);
  if (!t) return null;

  const localBusinessLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${STORE.website}/#dispensary`,
    mainEntityOfPage: { "@id": `${STORE.website}/strains/${t.slug}` },
    name: STORE.name,
    description: `${t.name} cannabis strains at ${STORE.name} in the Wenatchee Valley.`,
    address: {
      "@type": "PostalAddress",
      streetAddress: STORE.address.street,
      addressLocality: STORE.address.city,
      addressRegion: STORE.address.state,
      postalCode: STORE.address.zip,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: STORE.geo.lat,
      longitude: STORE.geo.lng,
    },
    telephone: STORE.phoneTel,
    url: STORE.website,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "[data-speakable]"],
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${STORE.website}/strains/${t.slug}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Strains", item: `${STORE.website}/strains` },
      { "@type": "ListItem", position: 3, name: t.name, item: `${STORE.website}/strains/${t.slug}` },
    ],
  };

  const otherTypes = STRAIN_TYPES.filter((x) => x.slug !== t.slug);

  // Show ALL strains of this type — NOT wave-gated. Per-strain pages
  // are robots:noindex outside the SEO_STRAIN_WAVE-current set, so
  // these links primarily build the internal link graph (Google crawls
  // noindex pages + follows their links, accumulating PageRank that
  // activates the moment a strain enters the wave). Doesn't violate
  // the cadence-gate doctrine (which is about controlled indexing,
  // not link-graph density).
  const inWaveSlugs = new Set(getStrainsInCurrentWave());
  const strainsForType = Object.values(STRAINS)
    .filter((s) => s.type === t.slug)
    .sort((a, b) => a.name.localeCompare(b.name));
  // Available for future "featured" sub-section if needed:
  void inWaveSlugs;

  // ItemList JSON-LD — completes the hub-itemlist-jsonld coverage arc
  // (Tech-SEO win #2 follow-on). The 4 strain-type hub pages (indica /
  // sativa / hybrid / cbd) ship the same Schema.org ItemList shape as
  // /heroes /learn /blog so SERP carousel rendering can pick them up.
  // Per the comment above, the link list itself is NOT wave-gated — all
  // type-matching strains render with internal links; the per-strain
  // detail pages outside the SEO_STRAIN_WAVE carry robots:noindex.
  // Including them in the ItemList still serves Google's link-graph
  // discovery (Google crawls + accumulates PageRank on noindex pages)
  // without affecting the cadence-gate indexation policy. The /strains/cbd
  // hub produces an empty itemListElement today (no strain has type='cbd'
  // — STRAIN.type is a 3-value enum); the helper handles empty gracefully.
  // WSLCB scrubber lives in buildHubItemListJsonLd — banned-phrase names
  // are omitted (e.g. nothing in the strain corpus today, but the safety
  // net is in place if a future strain lands with a non-compliant name).
  const itemListLd = buildHubItemListJsonLd({
    siteOrigin: STORE.website,
    hubPath: `/strains/${t.slug}`,
    hubName: `${t.name} strains · ${STORE.name}`,
    items: strainsForType.map((s) => ({
      url: `/strains/${s.slug}`,
      name: s.name,
    })),
  });

  const menuHref = withAttr(`/menu?strain=${t.slug}`, "strains", t.slug);

  return (
    <main className="bg-stone-50 text-stone-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(localBusinessLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListLd) }} />

      <Breadcrumb items={[{ label: "Strains", href: "/strains" }, { label: t.name }]} />

      <section className="relative bg-green-950 text-white overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 80% 50%, #4ade8033, transparent), radial-gradient(ellipse 50% 60% at 20% 100%, #16653422, transparent)",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-10 sm:pb-14">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-green-300 mb-3">
            {t.eyebrow} · Wenatchee Valley
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05] mb-4 max-w-3xl">
            {t.name} strains
            <span className="block text-green-300/90 font-semibold text-xl sm:text-2xl md:text-3xl mt-2">
              {t.subhead}
            </span>
          </h1>
          <p className="text-base sm:text-lg text-green-100/90 leading-relaxed max-w-2xl mb-7">
            On GS Center Road in Wenatchee since 2014 — same building, same valley. {t.name}-leaning genetics across flower, pre-rolls, vapes, and edibles, rotated weekly as Washington growers harvest.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={menuHref}
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl bg-green-400 hover:bg-green-300 text-green-950 font-bold text-sm transition-all shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2 focus-visible:ring-offset-green-950"
            >
              Browse {t.name.toLowerCase()} on the menu
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/find-your-strain"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
            >
              Or take the quiz
            </Link>
            <a
              href={`tel:${STORE.phoneTel}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white/85 hover:text-white text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
            >
              <span aria-hidden="true">📞</span>
              {STORE.phone}
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 mb-10 sm:mb-14 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {t.factTiles.map((tile) => (
            <div
              key={tile.label}
              className="rounded-2xl bg-white border border-stone-200 shadow-sm px-4 sm:px-5 py-4"
            >
              <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-green-800 mb-1.5">
                {tile.label}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-stone-900 leading-snug">{tile.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-800 mb-2">About the category</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 mb-6 leading-tight">{t.h2}</h2>
          <div className="prose prose-stone prose-base sm:prose-lg max-w-none prose-p:text-stone-700 prose-p:leading-relaxed prose-p:mb-5 prose-strong:text-stone-900">
            {t.bodyCopy.split("\n\n").map((para, i) => (
              <p key={i} {...(i === 0 ? { "data-speakable": "" } : {})}>
                {para}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-800 mb-2">On the shelf</p>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900 mb-4 leading-tight">
            What to look for in the {t.name.toLowerCase()} section
          </h2>
          <div className="prose prose-stone prose-base max-w-none prose-p:text-stone-700 prose-p:leading-relaxed prose-p:mb-4">
            {t.whatToLookFor.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </section>

      {strainsForType.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
          <div className="mb-6 sm:mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-800 mb-2">Strains we carry</p>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">
              {t.name} strains in the library
            </h2>
            <p className="text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
              Each page below covers lineage, terpene profile, what customers tend to reach for it for, and the family tree of parents + descendants. Live shelf availability lives on{" "}
              <Link href="/menu" className="text-green-800 underline underline-offset-2 hover:text-green-700">
                the menu
              </Link>
              .
            </p>
          </div>
          {/* Polish-audit move #4 (2026-05-17): density adjustment for the
              lit-up type pages. Drop lg:grid-cols-3 → lg:grid-cols-2 when
              the type has >40 strains (cognitive overload at 70-111 micro
              rectangles per page). Bumped card padding for breathing room.
              Added top terpene chip under the lineage line for scan-signal. */}
          <ul className={`grid grid-cols-1 sm:grid-cols-2 ${strainsForType.length > 40 ? "lg:grid-cols-2" : "lg:grid-cols-3"} gap-3 sm:gap-4`}>
            {strainsForType.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/strains/${s.slug}`}
                  className="group block h-full rounded-xl bg-white border border-stone-200 hover:border-green-500 hover:shadow-sm transition-all px-4 py-4 sm:px-5 sm:py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                >
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-green-900 transition-colors truncate">
                      {s.name}
                    </span>
                    <span aria-hidden="true" className="text-xs font-semibold text-green-800 shrink-0">
                      →
                    </span>
                  </div>
                  {s.lineage && (
                    <div className="text-[11px] sm:text-xs text-stone-500 leading-snug truncate">{s.lineage}</div>
                  )}
                  {s.terpenes && s.terpenes.length > 0 && s.terpenes[0]?.name && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 bg-emerald-50 rounded-full px-1.5 py-0.5">
                        {s.terpenes[0].name}
                      </span>
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-3xl">
          <div className="rounded-xl bg-white border border-stone-200 px-3 sm:px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Address</div>
            <div className="text-xs sm:text-sm font-semibold text-stone-900 leading-snug" data-speakable>
              {STORE.address.street}
            </div>
            <div className="text-xs text-stone-500 mt-0.5">{STORE.address.city}, WA</div>
          </div>
          <div className="rounded-xl bg-white border border-stone-200 px-3 sm:px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Parking</div>
            <div className="text-xs sm:text-sm font-semibold text-stone-900">Free, on-site</div>
            <div className="text-xs text-stone-500 mt-0.5">ATM on-site</div>
          </div>
          <div className="rounded-xl bg-white border border-stone-200 px-3 sm:px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">ID</div>
            <div className="text-xs sm:text-sm font-semibold text-stone-900">21+, gov ID</div>
            <div className="text-xs text-stone-500 mt-0.5">Out-of-state OK</div>
          </div>
          <div className="rounded-xl bg-white border border-stone-200 px-3 sm:px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Open</div>
            <div className="text-xs sm:text-sm font-semibold text-stone-900">8 AM – 9 PM</div>
            <div className="text-xs text-stone-500 mt-0.5">Later Fri & Sat</div>
          </div>
        </div>
      </section>

      <section className="bg-green-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="max-w-md">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-300 mb-2">Live menu</p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 leading-tight">
                See what {t.name.toLowerCase()} is on the shelf right now.
              </h2>
              <p className="text-green-200/80 text-sm sm:text-base leading-relaxed">
                Browse the live menu — place a pickup order and we’ll have it pulled and bagged when you arrive. 21+, gov ID at the door.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href={menuHref}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-green-400 hover:bg-green-300 text-green-950 font-bold text-sm transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2 focus-visible:ring-offset-green-950"
              >
                Browse menu
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/visit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
              >
                Hours + directions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {otherTypes.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="mb-6 sm:mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-800 mb-2">Other strain types</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">All four shelves</h2>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {otherTypes.map((x) => (
              <li key={x.slug}>
                <Link
                  href={`/strains/${x.slug}`}
                  className="group block h-full rounded-xl bg-white border border-stone-200 hover:border-green-500 hover:shadow-sm transition-all px-3 sm:px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-green-900 transition-colors truncate">
                      {x.name}
                    </span>
                    <span aria-hidden="true" className="text-xs font-semibold text-green-800 shrink-0">
                      →
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-xs text-stone-500 mt-1 leading-snug">{x.eyebrow}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10 text-center">
        <p className="text-xs text-stone-400">
          Not medical advice. 21+. {STORE.name}, {STORE.address.city}, WA.
        </p>
      </section>
    </main>
  );
}
