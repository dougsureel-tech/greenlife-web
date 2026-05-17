// /strains/families — Family Album hub page.
//
// Sister to /strains (the type-categorized hub) but organized by genetic
// lineage instead of indica/sativa/hybrid. Renders the 10 family tiles
// via FamilyAlbumGrid + CollectionPage JSON-LD pointing at the per-family
// pages.
//
// Per spec §3b. Additive — the /strains hub is untouched (it gets a tab
// control in a separate ship to switch between "By Type" and "By Family"
// views). This page exists as a standalone landing too for the
// /strains/families canonical URL.

import type { Metadata } from "next";
import Link from "next/link";
import { STORE, DEFAULT_OG_IMAGE } from "@/lib/store";
import { STRAIN_FAMILIES } from "@/lib/strain-families";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { withAttr } from "@/lib/attribution";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FamilyAlbumGrid } from "@/components/FamilyAlbumGrid";

export const dynamic = "force-static";
export const revalidate = false;

const TITLE = `Strain Family Album — ${STORE.name}`;
const DESCRIPTION = `Browse the strain library by genetic lineage. The 9 founder lines — Kush, Cookies, Haze, Diesel, Cheese, Skunk, Blueberry, Afghani, Northern Lights — plus the landrace shelf at ${STORE.name}.`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/strains/families" },
  keywords: [
    "strain family album",
    "cannabis genetics",
    "Kush family strains",
    "Cookies family strains",
    "Haze family strains",
    "landrace strains",
    "strain lineage Wenatchee",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: TITLE,
    description: DESCRIPTION,
    url: `${STORE.website}/strains/families`,
    siteName: STORE.name,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function StrainFamiliesHubPage() {
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${STORE.website}/strains/families#hub`,
    name: TITLE,
    description: DESCRIPTION,
    isPartOf: { "@id": `${STORE.website}/strains#collection` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: STRAIN_FAMILIES.map((f, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: f.name,
        url: `${STORE.website}/strains/families/${f.slug}`,
      })),
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${STORE.website}/strains/families#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Strains", item: `${STORE.website}/strains` },
      { "@type": "ListItem", position: 3, name: "Families", item: `${STORE.website}/strains/families` },
    ],
  };

  return (
    <main className="bg-stone-50 text-stone-900 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />

      <Breadcrumb items={[{ label: "Strains", href: "/strains" }, { label: "Families" }]} />

      {/* Hero — matches /strains identity (green-950) so the family album
          reads as a sibling lens to /strains. */}
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
            Strain Family Album · Wenatchee Valley
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05] mb-4 max-w-3xl">
            The strain library by genetic line
            <span className="block text-green-300/90 font-semibold text-xl sm:text-2xl md:text-3xl mt-2">
              9 founder lines + the landrace shelf — 250 strains organized by ancestry
            </span>
          </h1>
          <p className="text-base sm:text-lg text-green-100/90 leading-relaxed max-w-2xl mb-7">
            Cannabis breeding traces back to a small set of foundational strains — Kush, Cookies, Haze, Diesel, Cheese, Skunk, Blueberry, Afghani, Northern Lights, plus the pre-modern landrace lines that seeded everything else. Browse the library through that lens to find sister strains, parent strains, and the family tree your favorite cultivar comes from.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={withAttr("/menu", "strains", "families-browse-menu")}
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl bg-green-400 hover:bg-green-300 text-green-950 font-bold text-sm transition-all shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2 focus-visible:ring-offset-green-950"
            >
              Browse the live menu
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/strains"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
            >
              Browse by category instead
            </Link>
          </div>
        </div>
      </section>

      {/* The 10 family tiles. */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-800 mb-2">
            Pick a line
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
            The 10 strain families on the shelf
          </h2>
          <p className="mt-3 text-stone-600 max-w-2xl text-sm sm:text-base leading-relaxed">
            Each tile spotlights the founder strain that anchors the family. The mini-tree shows immediate parents and descendants — click through for the full descendant list, lineage diagram, and shelf context.
          </p>
        </div>
        <FamilyAlbumGrid />
      </section>

      {/* CTA band — same shape as /strains. */}
      <section className="bg-green-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="max-w-md">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-300 mb-2">
                Live menu
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3 leading-tight">
                See what&rsquo;s in stock today.
              </h2>
              <p className="text-green-200/80 text-sm sm:text-base leading-relaxed">
                Every strain page lists current in-stock products. 21+, gov ID at the door.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href={withAttr("/menu", "strains", "families-footer-menu")}
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
