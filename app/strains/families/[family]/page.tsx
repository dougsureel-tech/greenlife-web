// /strains/families/[family] — per-family hub page.
//
// SSG over the 10 family slugs (generateStaticParams). Each page renders:
//   - Hero: family name + tagline + founder spotlight (if applicable)
//   - Mini-tree (spotlight size) — anchor + parents + descendants
//   - Tile grid: every strain in the family, type-color chipped
//   - FAQ — generated from the family description + common questions
//   - Cross-link: "Other lines on the shelf" — pointer to other 9 families
//   - CollectionPage + BreadcrumbList JSON-LD
//
// Per spec §3c. Canonical URL. Cadence-gated noindex via SEO_STRAIN_WAVE
// env (treats family pages as in-wave when SEO_STRAIN_WAVE >= 1 — they're
// all rolled out together since the cadence-gate doc allows 6/day/stack
// and the 11 family URLs ship over 2 days via the sitemap-gate
// SEO_FAMILY_WAVE env, but the page-level robots flips once any wave
// has started).

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STORE } from "@/lib/store";
import { STRAINS, buildLineageGraph, type Strain } from "@/lib/strains";
import {
  STRAIN_FAMILIES,
  FAMILY_SLUGS,
  getFamily,
  getStrainsInFamily,
} from "@/lib/strain-families";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { withAttr } from "@/lib/attribution";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FamilyMiniTree } from "@/components/FamilyMiniTree";

export const dynamic = "force-static";
export const revalidate = false;
export const dynamicParams = false;

export function generateStaticParams() {
  return FAMILY_SLUGS.map((family) => ({ family }));
}

const TYPE_LABELS: Record<string, string> = {
  indica: "Indica",
  sativa: "Sativa",
  hybrid: "Hybrid",
};

const TYPE_BADGE_CLASS: Record<string, string> = {
  indica: "bg-indigo-50 text-indigo-800 border-indigo-200",
  sativa: "bg-orange-50 text-orange-800 border-orange-200",
  hybrid: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

function isFamilyInWave(): boolean {
  // Families are gated by the existing SEO_STRAIN_WAVE env (same lever
  // as per-strain pages). Wave >= 1 → indexable. Wave 0 (default) →
  // noindex.
  const wave = parseInt(process.env.SEO_STRAIN_WAVE ?? "0", 10);
  return Number.isFinite(wave) && wave > 0;
}

function isFamilyInSitemapWave(familySlug: string): boolean {
  // Per spec §4c, family URLs are also gated by SEO_FAMILY_WAVE (separate
  // lever for sitemap emission to honor the 6/day/stack cadence). When
  // SEO_FAMILY_WAVE >= the family's 1-based position in STRAIN_FAMILIES,
  // it's in the sitemap. Default 0 → none in sitemap (but page-level
  // index toggles via SEO_STRAIN_WAVE).
  const wave = parseInt(process.env.SEO_FAMILY_WAVE ?? "0", 10);
  if (!Number.isFinite(wave) || wave <= 0) return false;
  const idx = STRAIN_FAMILIES.findIndex((f) => f.slug === familySlug);
  // +1 because we want at least N families to include the Nth one; hub
  // doesn't count toward the strain-family slugs but uses the same env.
  return idx >= 0 && idx < wave;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ family: string }>;
}): Promise<Metadata> {
  const { family } = await params;
  const fam = getFamily(family);
  if (!fam) return { title: "Not found" };
  const anchor = fam.anchorSlug ? STRAINS[fam.anchorSlug] : null;
  const count = getStrainsInFamily(family).length;
  const title = { absolute: `${fam.name} — ${count} strains at ${STORE.name}` } as const;
  const desc =
    `${fam.tagline} ${count} strains from this genetic line on the shelf at ${STORE.name}.`;
  const inWave = isFamilyInWave();
  return {
    title,
    description: desc.length > 160 ? desc.slice(0, 157) + "…" : desc,
    alternates: { canonical: `/strains/families/${family}` },
    keywords: [
      `${fam.name} strains`,
      `${fam.name} ${STORE.address.city}`,
      `${fam.name} genetics`,
      ...(anchor ? [`${anchor.name} lineage`, `${anchor.name} descendants`] : []),
      "strain family album",
      "cannabis genetics Wenatchee",
    ],
    robots: inWave
      ? { index: true, follow: true }
      : { index: false, follow: true, nocache: true },
    openGraph: {
      type: "website",
      locale: "en_US",
      title,
      description: desc,
      url: `${STORE.website}/strains/families/${family}`,
      siteName: STORE.name,
      images: [
        {
          url: `/strains/families/${family}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${fam.name} at ${STORE.name} — ${fam.tagline}`,
        },
      ],
    },
  };
}

export default async function FamilyHubPage({
  params,
}: {
  params: Promise<{ family: string }>;
}) {
  const { family } = await params;
  const fam = getFamily(family);
  if (!fam) notFound();

  const anchor: Strain | null = fam.anchorSlug ? (STRAINS[fam.anchorSlug] ?? null) : null;
  const members = getStrainsInFamily(family);
  const inWave = isFamilyInWave();
  const inSitemap = isFamilyInSitemapWave(family);

  const anchorGraph = anchor ? buildLineageGraph(anchor.slug) : null;
  const parents = anchorGraph?.parents.slice(0, 2) ?? [];
  const descendants = anchorGraph?.descendants.slice(0, 5) ?? [];

  const otherFamilies = STRAIN_FAMILIES.filter((f) => f.slug !== family);

  const breadcrumbItems = [
    { label: "Strains", href: "/strains" },
    { label: "Families", href: "/strains/families" },
    { label: fam.name },
  ];

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${STORE.website}/strains/families/${family}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Strains", item: `${STORE.website}/strains` },
      { "@type": "ListItem", position: 3, name: "Families", item: `${STORE.website}/strains/families` },
      { "@type": "ListItem", position: 4, name: fam.name, item: `${STORE.website}/strains/families/${family}` },
    ],
  };

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${STORE.website}/strains/families/${family}#collection`,
    name: fam.name,
    description: fam.description,
    isPartOf: { "@id": `${STORE.website}/strains/families#hub` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: members.map((m, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: m.name,
        url: `${STORE.website}/strains/${m.slug}`,
      })),
    },
  };

  // Common-question FAQ — derives from family data; safe descriptive
  // copy only, no efficacy claims.
  const faqs: { q: string; a: string }[] = [
    {
      q: `What is ${fam.name.replace(/^The /, "").replace(/ Line$/, "")} cannabis?`,
      a: fam.description,
    },
    ...(anchor
      ? [
          {
            q: `Which strain founded ${fam.name}?`,
            a: `${anchor.name} is the anchor strain of ${fam.name}. ${anchor.tagline}`,
          },
        ]
      : []),
    {
      q: `How many ${fam.name.replace(/^The /, "").replace(/ Line$/, "")} strains does ${STORE.name} carry pages for?`,
      a: `${members.length} strain${members.length === 1 ? "" : "s"} in this line. Pages live in the strain library; live in-stock availability is on the menu.`,
    },
  ];

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="bg-stone-50 text-stone-900 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqLd) }} />

      <div className="max-w-5xl mx-auto px-4 pt-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-6 pb-10">
        <div className="text-xs uppercase tracking-[0.18em] text-stone-500 mb-3">
          Strain Family Album · {STORE.address.city}, WA
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900 mb-3">
          {fam.name}
        </h1>
        <p className="text-lg md:text-xl text-stone-700 max-w-2xl mb-4">{fam.tagline}</p>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="rounded-full border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700">
            {members.length} strain{members.length === 1 ? "" : "s"} in the line
          </span>
          {anchor && (
            <span className="rounded-full border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700">
              Founder: {anchor.name}
            </span>
          )}
        </div>
        {(!inWave || !inSitemap) && (
          <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs text-amber-900 max-w-xl">
            Preview · this family page is not yet in the public search index.
          </div>
        )}
      </section>

      {/* Founder spotlight + mini-tree */}
      {anchor && (
        <section className="max-w-5xl mx-auto px-4 pb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700 mb-2">Founder</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 mb-4">
            The line starts with {anchor.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <Link
                href={`/strains/${anchor.slug}`}
                className="block rounded-xl border border-stone-200 bg-white hover:border-emerald-400 hover:shadow-sm transition-all p-4 group"
              >
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <span className="text-lg font-bold text-stone-900 group-hover:text-emerald-900">
                    {anchor.name}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 border ${
                      TYPE_BADGE_CLASS[anchor.type] ?? "bg-stone-100 text-stone-700 border-stone-300"
                    }`}
                  >
                    {TYPE_LABELS[anchor.type] ?? anchor.type}
                  </span>
                </div>
                <p className="text-sm text-stone-700 leading-relaxed mb-2">{anchor.tagline}</p>
                {anchor.lineage && (
                  <p className="text-[11px] text-stone-500 mt-2 font-mono">{anchor.lineage}</p>
                )}
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 group-hover:text-emerald-900 mt-3">
                  Open {anchor.name} page <span aria-hidden="true">→</span>
                </span>
              </Link>
            </div>
            {(parents.length > 0 || descendants.length > 0) && (
              <div className="rounded-xl bg-white border border-stone-200 p-3 sm:p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-500 mb-2 text-center">
                  Lineage at a glance
                </div>
                <FamilyMiniTree
                  center={{ name: anchor.name, type: anchor.type, slug: anchor.slug }}
                  parents={parents}
                  descendants={descendants}
                  size="spotlight"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Description */}
      <section className="max-w-3xl mx-auto px-4 pb-10">
        <p className="text-base md:text-lg leading-relaxed text-stone-700" data-speakable>
          {fam.description}
        </p>
      </section>

      {/* The line — full tile grid of every strain in the family. */}
      {members.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700 mb-2">The line</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 mb-4">
            Strains in {fam.name}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {members.map((m) => {
              const isAnchor = anchor && m.slug === anchor.slug;
              return (
                <li key={m.slug}>
                  <Link
                    href={`/strains/${m.slug}`}
                    className={`group block h-full rounded-xl bg-white border ${
                      isAnchor ? "border-emerald-400 ring-1 ring-emerald-200" : "border-stone-200"
                    } hover:border-emerald-500 hover:shadow-sm transition-all px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500`}
                  >
                    <div className="flex items-baseline justify-between gap-2 mb-1.5">
                      <span className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-emerald-900 transition-colors truncate">
                        {m.name}
                        {isAnchor && (
                          <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                            · founder
                          </span>
                        )}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 border ${
                          TYPE_BADGE_CLASS[m.type] ?? "bg-stone-100 text-stone-700 border-stone-300"
                        }`}
                      >
                        {TYPE_LABELS[m.type] ?? m.type}
                      </span>
                    </div>
                    {m.lineage && (
                      <div className="text-[11px] sm:text-xs text-stone-500 leading-snug truncate">
                        {m.lineage}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 pb-12">
          <h2 className="text-xl font-bold tracking-tight text-stone-900 mb-4">
            Frequently asked about {fam.name}
          </h2>
          <div className="space-y-2">
            {faqs.map((f, i) => (
              <details key={i} className="rounded-lg border border-stone-200 bg-white">
                <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-stone-900">
                  {f.q}
                </summary>
                <p className="px-4 pb-3 text-sm text-stone-700 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Other families cross-link strip. */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500 mb-3">
          Other lines on the shelf
        </p>
        <ul className="flex flex-wrap gap-2">
          {otherFamilies.map((f) => (
            <li key={f.slug}>
              <Link
                href={`/strains/families/${f.slug}`}
                className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:border-emerald-400 hover:text-emerald-900 hover:bg-emerald-50/40 transition-colors"
              >
                {f.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA band */}
      <section className="bg-emerald-950 text-emerald-50">
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">
            See what&rsquo;s in stock from {fam.name}
          </h2>
          <p className="text-emerald-200 mb-6 max-w-xl mx-auto">
            Live inventory at {STORE.name} — save 20% on every online order.
          </p>
          <Link
            href={withAttr(
              anchor ? `/menu?q=${encodeURIComponent(anchor.name)}` : "/menu",
              "strains",
              `family-${family}`,
            )}
            className="inline-flex items-center gap-2 rounded-full bg-white text-emerald-950 hover:bg-emerald-50 transition-colors font-semibold px-6 py-3 text-base"
          >
            Browse menu →
          </Link>
        </div>
      </section>

      {/* Compliance footer */}
      <section className="max-w-3xl mx-auto px-4 py-8 text-center text-xs text-stone-500 leading-relaxed">
        <p>
          21+. Cannabis affects people differently — your experience may vary. Not medical advice.
          Lineage descriptions reflect breeding heritage, not promised outcome. {STORE.name},{" "}
          {STORE.address.city}, WA.
        </p>
      </section>
    </main>
  );
}
