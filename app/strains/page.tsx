import type { Metadata } from "next";
import Link from "next/link";
import { STORE, DEFAULT_OG_IMAGE } from "@/lib/store";
import { STRAIN_TYPES } from "@/lib/strain-types";
import { STRAINS, getStrainsInCurrentWave } from "@/lib/strains";
import { STRAIN_FAMILIES } from "@/lib/strain-families";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { withAttr } from "@/lib/attribution";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FamilyAlbumGrid } from "@/components/FamilyAlbumGrid";

// Map strain.type slug → label + accent so the hub strain-card grid
// can chip the type without re-importing STRAIN_TYPES table mid-render.
const TYPE_LABELS: Record<string, { label: string; chip: string }> = {
  indica: { label: "Indica", chip: "bg-purple-50 text-purple-800" },
  sativa: { label: "Sativa", chip: "bg-red-50 text-red-800" },
  hybrid: { label: "Hybrid", chip: "bg-green-50 text-green-800" },
  cbd: { label: "CBD", chip: "bg-amber-50 text-amber-800" },
};

// /strains — strain-category hub page. Captures long-tail intent like
// "indica strains Wenatchee", "sativa Wenatchee Valley", "cbd strains
// East Wenatchee". Sister surface to /find-your-strain (which is the
// 3-question quiz) — this page is a SERP-targeted directory of the
// four shelf categories with descriptive, non-promissory copy per
// WAC 314-55-155.
//
// Voice: tenure framing ("Since 2014, GS Center Road") + Wenatchee
// Valley signal + "best cannabis staff in the Wenatchee Valley"
// positioning. /menu CTA only. No effect/medical claims.

export const dynamic = "force-static";
export const revalidate = false;

const TITLE = `Strains — ${STORE.name}`;
const DESCRIPTION = `Indica, sativa, hybrid, and CBD-dominant strain categories at ${STORE.name} in the Wenatchee Valley. Live menu, GS Center Road since 2014.`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/strains" },
  keywords: [
    "cannabis strains Wenatchee",
    "indica strains Wenatchee",
    "sativa strains Wenatchee",
    "hybrid strains Wenatchee",
    "CBD strains Wenatchee",
    "dispensary strains Wenatchee Valley",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: TITLE,
    description: DESCRIPTION,
    url: `${STORE.website}/strains`,
    siteName: STORE.name,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function StrainsIndexPage() {
  // Wave-gated per-strain card list. Empty when SEO_STRAIN_WAVE=0
  // (build is live but dormant). Sorted by type then name so indica
  // anchors visually first per the cannabis-counter convention. Cap
  // at 24 cards so the hub stays scan-readable — overflow lives on
  // the per-type pages (`/strains/<type>`).
  const inWaveStrains = getStrainsInCurrentWave()
    .map((slug) => STRAINS[slug])
    .filter(Boolean)
    .sort((a, b) => {
      const typeOrder = ["indica", "hybrid", "sativa", "cbd"];
      const ai = typeOrder.indexOf(a.type);
      const bi = typeOrder.indexOf(b.type);
      if (ai !== bi) return ai - bi;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 24);

  // CollectionPage + ItemList — Google reads the four type pages as
  // children of this hub, mirroring how /near uses ItemList on its
  // index. Sister surface; same JSON-LD shape.
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${STORE.website}/strains#collection`,
    name: TITLE,
    description: DESCRIPTION,
    isPartOf: { "@id": `${STORE.website}/#dispensary` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: STRAIN_TYPES.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${t.name} strains`,
        url: `${STORE.website}/strains/${t.slug}`,
      })),
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${STORE.website}/strains#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Strains", item: `${STORE.website}/strains` },
    ],
  };

  return (
    <main className="bg-stone-50 text-stone-900 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />

      <Breadcrumb items={[{ label: "Strains" }]} />

      {/* Hero — green-950 matches /visit + /near identity. */}
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
            Strain categories · Wenatchee Valley
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] mb-4 max-w-3xl">
            Strains at {STORE.name}
            <span className="block text-green-300/90 font-semibold text-xl sm:text-2xl md:text-3xl mt-2">
              Indica, sativa, hybrid, CBD-dominant — GS Center Road since 2014
            </span>
          </h1>
          <p className="text-base sm:text-lg text-green-100/90 leading-relaxed max-w-2xl mb-7">
            We carry the four shelf categories you’d expect from a Washington dispensary, stocked from regional craft growers and rotated as harvests come in. Same building, same valley, since 2014 — and the best cannabis staff in the Wenatchee Valley behind the counter.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href={withAttr("/menu", "strains", "browse-all")}
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl bg-green-400 hover:bg-green-300 text-green-950 font-bold text-sm transition-all shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2 focus-visible:ring-offset-green-950"
            >
              Browse the live menu
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/find-your-strain"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
            >
              Take the 3-question quiz
            </Link>
          </div>

          {/* In-hero lens switcher — server-rendered anchor links between
              the two organizational lenses (By Type, the current default,
              and By Family, the new Family Album surface). Zero JS — the
              two panels live further down the page as anchor targets. */}
          <nav
            aria-label="Browse strains by"
            className="mt-7 flex flex-wrap gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em]"
          >
            <span className="text-green-300/70 self-center mr-1">Lens:</span>
            <a
              href="#by-type"
              className="rounded-full bg-green-400 text-green-950 px-3 py-1.5 hover:bg-green-300 transition-colors"
            >
              By Type
            </a>
            <a
              href="#by-family"
              className="rounded-full border border-white/30 text-white px-3 py-1.5 hover:bg-white/10 transition-colors"
            >
              By Family
            </a>
            <a
              href="#a-z"
              className="rounded-full border border-white/30 text-white px-3 py-1.5 hover:bg-white/10 transition-colors"
            >
              A–Z
            </a>
          </nav>
        </div>
      </section>

      {/* Type cards — four big cards, one per strain category. */}
      <section id="by-type" className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 scroll-mt-16">
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-800 mb-2">
            Pick a category
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Four shelf categories on the menu
          </h2>
          <p className="mt-3 text-stone-600 max-w-2xl text-sm sm:text-base leading-relaxed">
            These labels signal lineage and breeding heritage rather than guaranteed outcome — most modern strains are hybrids in some sense. Click through for a descriptive overview of each category and what to look for on the shelf.
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {STRAIN_TYPES.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/strains/${t.slug}`}
                className="group block rounded-2xl bg-white border border-stone-200 hover:border-green-500 hover:shadow-md transition-all p-5 sm:p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              >
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-green-800 mb-2">
                  {t.eyebrow}
                </p>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 group-hover:text-green-900 transition-colors mb-2">
                  {t.name} strains
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed mb-3">
                  {t.subhead}.
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-800 group-hover:text-green-950">
                  Read about {t.name.toLowerCase()}
                  <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── BY FAMILY ─ Family Album lens (genetic lineage view) ───────
          New ship 2026-05-17. Sister-organizational lens to "By Type"
          above. Routes to /strains/families/<family> for per-family
          deep-dives. Lives between Type and A-Z grids so it reads as
          a sibling lens rather than a competing CTA. Internal-link
          only — no wave-gate concern since the 10 family URLs are
          gated by SEO_FAMILY_WAVE for sitemap emission. */}
      <section id="by-family" className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-t border-stone-200 scroll-mt-16">
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-800 mb-2">
            Browse by genetic line
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            The Strain Family Album
          </h2>
          <p className="mt-3 text-stone-600 max-w-2xl text-sm sm:text-base leading-relaxed">
            {STRAIN_FAMILIES.length} founder lines anchor the modern cannabis shelf — Kush, Cookies, Haze, Diesel, Cheese, Skunk, Blueberry, Afghani, Northern Lights, plus the landrace pre-modern lineages. Click through to see every strain that descends from each line.
          </p>
        </div>
        <FamilyAlbumGrid compact />
        <div className="mt-6 text-center">
          <Link
            href="/strains/families"
            className="inline-flex items-center gap-1 text-sm font-semibold text-green-800 hover:text-green-950"
          >
            Open the full Family Album <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* ── PER-STRAIN CARD GRID ─ A-Z lens (library entries) ───────────
          Wave-gated card list of the actual library entries. Hidden
          when wave=0 (build is dormant). Each card links to the
          per-strain page (`/strains/<slug>`) — lineage family-tree,
          terpene profile, FAQ. Cap 24 cards; overflow lives at the
          per-type pages above. Type chip provides scan-color so
          indica/sativa/hybrid clusters are visually distinguishable
          at a glance. Internal links only — no new URLs.
      */}
      {inWaveStrains.length > 0 && (
        <section id="a-z" className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 border-t border-stone-200 scroll-mt-16">
          <div className="mb-6 sm:mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-800 mb-2">
              The library
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              Strains we’ve got pages for
            </h2>
            <p className="mt-3 text-stone-600 max-w-2xl text-sm sm:text-base leading-relaxed">
              Lineage, parents, family-tree, what customers tend to reach for it for — written by people who’ve worked the counter, not a marketing team. Live shelf availability stays on{" "}
              <Link href="/menu" className="text-green-800 underline underline-offset-2 hover:text-green-700">
                the menu
              </Link>
              .
            </p>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {inWaveStrains.map((s) => {
              const typeBadge = TYPE_LABELS[s.type] ?? { label: s.type, chip: "bg-stone-100 text-stone-700" };
              return (
                <li key={s.slug}>
                  <Link
                    href={`/strains/${s.slug}`}
                    className="group block h-full rounded-xl bg-white border border-stone-200 hover:border-green-500 hover:shadow-sm transition-all px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                  >
                    <div className="flex items-baseline justify-between gap-2 mb-1.5">
                      <span className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-green-900 transition-colors truncate">
                        {s.name}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 ${typeBadge.chip}`}
                      >
                        {typeBadge.label}
                      </span>
                    </div>
                    {s.lineage && (
                      <div className="text-[11px] sm:text-xs text-stone-500 leading-snug truncate">
                        {s.lineage}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Compliance + tenure footer band — matches /visit pattern. */}
      <section className="bg-green-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="max-w-md">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-300 mb-2">
                Live menu
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 leading-tight">
                The shelf updates as harvests come in.
              </h2>
              <p className="text-green-200/80 text-sm sm:text-base leading-relaxed">
                Browse the live menu to see what’s in the building right now across all four categories. 21+, gov ID at the door.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href={withAttr("/menu", "strains", "footer-menu")}
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

      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10 text-center">
        <p className="text-xs text-stone-400">
          Not medical advice. 21+. {STORE.name}, {STORE.address.city}, WA.
        </p>
      </section>
    </main>
  );
}
