import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STORE } from "@/lib/store";
import { STRAIN_TYPES, getStrainType } from "@/lib/strain-types";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { withAttr } from "@/lib/attribution";
import { Breadcrumb } from "@/components/Breadcrumb";

// /strains/[type] — per-category long-form landing pages. Sister
// surface to /near/[town]: same JSON-LD pattern (LocalBusiness +
// BreadcrumbList), same hero shape, same CTA band. Captures long-tail
// shelf-category queries with descriptive copy that stays inside
// WAC 314-55-155 (no effect/medical claims).

export const dynamic = "force-static";
export const revalidate = false;
export const dynamicParams = false;

export function generateStaticParams() {
  return STRAIN_TYPES.map((t) => ({ type: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type: slug } = await params;
  const t = getStrainType(slug);
  if (!t) return { title: "Not found" };

  // absolute drops the template suffix so the SERP title stays under
  // Google's ~60-char cap.
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
      // Explicit per-route OG URL (glw v35.505). Co-located
      // `opengraph-image.tsx` is the per-type card; this entry points
      // at the per-route file. See `check-per-route-og-image.mjs` fix
      // shape B + `check-og-completeness.mjs` images-required rule.
      images: [
        {
          url: `/strains/${t.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${t.name} strains at ${STORE.name} · ${t.subhead}`,
        },
      ],
    },
  };
}

export default async function StrainTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: slug } = await params;
  const t = getStrainType(slug);
  if (!t) notFound();

  // LocalBusiness anchor — references the canonical `#dispensary`
  // entity from app/layout.tsx so Google merges this page's
  // signals with the main store. Sister-shape with /near/[town].
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

  // /menu?strain=<type> — same query-param contract the strain-finder
  // quiz emits at find-your-strain/StrainFinderClient.tsx. Boost embed
  // ignores params today but the contract is preserved for the day
  // Boost adds passthrough.
  const menuHref = withAttr(`/menu?strain=${t.slug}`, "strains", t.slug);

  return (
    <main className="bg-stone-50 text-stone-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(localBusinessLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />

      <Breadcrumb
        items={[
          { label: "Strains", href: "/strains" },
          { label: t.name },
        ]}
      />

      {/* ── HERO ───────────────────────────────────────────────────────
          green-950 band matching /visit + /near identity.
          Eyebrow + H1 + subhead carries the SEO phrase.
      */}
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] mb-4 max-w-3xl">
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

      {/* ── FACT TILES ────────────────────────────────────────────────
          4 quick-scan tiles describing the category. Pulled from
          strain-types.ts SSoT.
      */}
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
              <div className="text-xs sm:text-sm font-semibold text-stone-900 leading-snug">
                {tile.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LONG-FORM BODY ─────────────────────────────────────────────
          Heavier body copy gets the prose treatment for crawlability +
          scan-readability. Strictly descriptive — no effect or
          outcome claims per WAC 314-55-155.
      */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-800 mb-2">
            About the category
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mb-6 leading-tight">
            {t.h2}
          </h2>
          <div className="prose prose-stone prose-base sm:prose-lg max-w-none prose-p:text-stone-700 prose-p:leading-relaxed prose-p:mb-5 prose-strong:text-stone-900">
            {t.bodyCopy.split("\n\n").map((para, i) => (
              <p key={i} {...(i === 0 ? { "data-speakable": "" } : {})}>
                {para}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT TO LOOK FOR ──────────────────────────────────────────
          Practical shelf-reading guidance — lineage, packaging, lab
          panel signals. Still no effect claims, but adds product-
          discovery utility that the body copy alone doesn't carry.
      */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-800 mb-2">
            On the shelf
          </p>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 mb-4 leading-tight">
            What to look for in the {t.name.toLowerCase()} section
          </h2>
          <div className="prose prose-stone prose-base max-w-none prose-p:text-stone-700 prose-p:leading-relaxed prose-p:mb-4">
            {t.whatToLookFor.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ── STORE FACTS CHIPS ─────────────────────────────────────────
          Mirrors /near "Why stop in" fact strip — address, payment,
          ID, parking. Re-asserts the LocalBusiness signals on every
          /strains/[type] page so each is independently load-bearing.
      */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-3xl">
          <div className="rounded-xl bg-white border border-stone-200 px-3 sm:px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
              Address
            </div>
            <div
              className="text-xs sm:text-sm font-semibold text-stone-900 leading-snug"
              data-speakable
            >
              {STORE.address.street}
            </div>
            <div className="text-xs text-stone-500 mt-0.5">
              {STORE.address.city}, WA
            </div>
          </div>
          <div className="rounded-xl bg-white border border-stone-200 px-3 sm:px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
              Parking
            </div>
            <div className="text-xs sm:text-sm font-semibold text-stone-900">
              Free, on-site
            </div>
            <div className="text-xs text-stone-500 mt-0.5">ATM on-site</div>
          </div>
          <div className="rounded-xl bg-white border border-stone-200 px-3 sm:px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
              ID
            </div>
            <div className="text-xs sm:text-sm font-semibold text-stone-900">
              21+, gov ID
            </div>
            <div className="text-xs text-stone-500 mt-0.5">Out-of-state OK</div>
          </div>
          <div className="rounded-xl bg-white border border-stone-200 px-3 sm:px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
              Open
            </div>
            <div className="text-xs sm:text-sm font-semibold text-stone-900">
              8 AM – 9 PM
            </div>
            <div className="text-xs text-stone-500 mt-0.5">Later Fri & Sat</div>
          </div>
        </div>
      </section>

      {/* ── CTA BAND ────────────────────────────────────────────────── */}
      <section className="bg-green-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="max-w-md">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-300 mb-2">
                Live menu
              </p>
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

      {/* ── OTHER STRAIN TYPES ──────────────────────────────────────── */}
      {otherTypes.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="mb-6 sm:mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-800 mb-2">
              Other strain categories
            </p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
              All four shelves
            </h2>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {otherTypes.map((x) => (
              <li key={x.slug}>
                <Link
                  href={`/strains/${x.slug}`}
                  className="group block rounded-xl bg-white border border-stone-200 hover:border-green-500 hover:shadow-sm transition-all px-3 sm:px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-green-900 transition-colors truncate">
                      {x.name}
                    </span>
                    <span className="text-xs font-semibold text-green-800 tabular-nums shrink-0">
                      →
                    </span>
                  </div>
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
