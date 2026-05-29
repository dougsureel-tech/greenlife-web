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
  indica: "bg-purple-50 text-purple-800 border-purple-200",
  sativa: "bg-red-50 text-red-800 border-red-200",
  hybrid: "bg-green-50 text-green-800 border-green-200",
};

/** Format a strain.verification.verifiedAt ISO date for the founder card
 *  credibility line. Falls back to the raw ISO if parsing fails — never
 *  crashes the page over a malformed date. UTC-anchored so the rendered
 *  string is stable across the SSG build environment regardless of
 *  whatever TZ the build machine is set to. */
function formatVerifiedDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

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
  //
  // Polish pass: dropped the "What is X cannabis?" FAQ that returned
  // fam.description verbatim — the same paragraph already renders in
  // the description block above the FAQ, so the disclosure-and-expand
  // re-served identical text. Kept founder + count, which add value
  // because they answer questions the prose doesn't directly address.
  const faqs: { q: string; a: string }[] = [
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

      {/* Hero — tightened: dropped Founder chip (duplicates the founder
          section directly below), shrunk vertical air, demoted preview-
          banner from bordered box to muted inline eyebrow. */}
      <section className="max-w-5xl mx-auto px-4 pt-4 pb-6">
        <div className="text-xs uppercase tracking-[0.18em] text-stone-500 mb-2">
          Strain Family Album · {STORE.address.city}, WA
          {(!inWave || !inSitemap) && (
            <span className="ml-2 normal-case tracking-normal text-amber-700 font-medium">
              · preview (not yet indexed)
            </span>
          )}
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900 mb-2">
          {fam.name}
        </h1>
        <p className="text-lg md:text-xl text-stone-700 max-w-2xl mb-3">{fam.tagline}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700">
            {members.length} strain{members.length === 1 ? "" : "s"} in the line
          </span>
        </div>
      </section>

      {/* Founder spotlight + lineage (v37.265 redesign per Doug 2026-05-17
          "split it down the middle, make the graph clickable, a little
          bigger, nice UI update"). Single rounded card wraps both columns
          as one double-page-spread; vertical hairline divider at md+ reads
          as the spine. Diagram nodes are now clickable `<a href>` links
          straight to each strain's canonical page (interactive prop on
          FamilyMiniTree). Hero size variant lifts the diagram from
          480×220 → 560×280. Design brief at
          /CODE/Green Life/STRAIN_FAMILY_SPOTLIGHT_REDESIGN_2026_05_17.md. */}
      {anchor && (
        <section className="max-w-5xl mx-auto px-4 pb-10">
          <div className="rounded-2xl border border-stone-200 bg-gradient-to-br from-white to-stone-50/60 shadow-sm overflow-hidden">
            {/* Eyebrow row spans full width */}
            <div className="flex items-baseline justify-between gap-3 px-6 sm:px-8 md:px-10 pt-6 md:pt-8 pb-4 border-b border-stone-100">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500">
                Founder strain
                <span className="mx-1.5 text-stone-300">·</span>
                <span className="text-stone-700">{fam.name}</span>
              </p>
              {(parents.length > 0 || descendants.length > 0) && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 tabular-nums">
                  ({parents.length + 1 + Math.min(descendants.length, 5)}) lineage tree
                </span>
              )}
            </div>

            {/* Two-column body — vertical hairline divider at md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0 items-stretch p-6 sm:p-8 md:p-10">
              {/* LEFT — founder card */}
              <Link
                href={`/strains/${anchor.slug}`}
                className="group flex flex-col justify-between rounded-xl bg-white border border-stone-200 hover:border-emerald-400 hover:shadow-md transition-all p-5 sm:p-6 md:mr-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <div>
                  <div className="flex items-baseline justify-between gap-2 mb-3">
                    <span className="text-xl sm:text-2xl font-bold text-stone-900 group-hover:text-emerald-900 leading-tight">
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
                  <p className="text-sm sm:text-base text-stone-700 leading-relaxed">{anchor.tagline}</p>
                  {anchor.lineage && (
                    <p className="text-[11px] text-stone-500 mt-3 font-mono">{anchor.lineage}</p>
                  )}
                  {/* Verification credibility line — UX expert Move #12.
                      Surfaces the verification metadata Doug populated
                      across 5+ sources per strain. Reads as a "real shop"
                      honesty cue (K&L Wines vintage-note pattern) rather
                      than a marketing claim. Renders only when the data is
                      populated — silent when absent. */}
                  {anchor.verification &&
                    anchor.verification.sources.length > 0 &&
                    anchor.verification.verifiedAt && (
                      <p className="text-[11px] text-stone-500 mt-3">
                        Verified {formatVerifiedDate(anchor.verification.verifiedAt)} across{" "}
                        {anchor.verification.sources.length}{" "}
                        source{anchor.verification.sources.length === 1 ? "" : "s"}
                        {anchor.verification.status === "verified-with-note" && (
                          <span className="text-stone-400"> · updated when sources disagree</span>
                        )}
                      </p>
                    )}
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 group-hover:text-emerald-900 mt-4">
                  Open {anchor.name} page <span aria-hidden="true">→</span>
                </span>
              </Link>

              {/* RIGHT — lineage diagram (clickable, hero size) */}
              {(parents.length > 0 || descendants.length > 0) ? (
                <div className="flex flex-col justify-center md:pl-8 md:border-l md:border-stone-200 pt-2 md:pt-0">
                  <FamilyMiniTree
                    center={{ name: anchor.name, type: anchor.type, slug: anchor.slug }}
                    parents={parents}
                    descendants={descendants}
                    size="hero"
                    interactive
                    accent="emerald"
                  />
                  <p className="mt-3 text-[10px] uppercase tracking-wider text-stone-400 text-center">
                    Tap any strain to open its page
                  </p>
                </div>
              ) : (
                <div className="md:pl-8 md:border-l md:border-stone-200" aria-hidden="true" />
              )}
            </div>
          </div>
        </section>
      )}

      {/* Description */}
      <section className="max-w-3xl mx-auto px-4 pb-8">
        <p className="text-base md:text-lg leading-relaxed text-stone-700" data-speakable>
          {fam.description}
        </p>
      </section>

      {/* The line — full tile grid of every strain in the family.
          Tightened: header is now a single h2 (eyebrow + h2 collapsed
          since the eyebrow said "The line" and the h2 said "The Kush
          Line" — double "Line"). For dense families (>12) the grid
          hides the tail behind a server-rendered <details> disclosure
          (zero JS). Tile name uses line-clamp-2 so long names don't
          lose info to truncate. */}
      {members.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 mb-4">
            All {members.length} strain{members.length === 1 ? "" : "s"} on the shelf
          </h2>
          <FamilyStrainGrid members={members} anchorSlug={anchor?.slug ?? null} />
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

/** Tile grid for strains in a family. For dense families (>12) the tail
 *  hides behind a server-rendered <details> disclosure so the page
 *  doesn't open with a 100+ tile wall on Kush. Zero JS — `<details>`
 *  carries the open/close behavior natively. */
function FamilyStrainGrid({
  members,
  anchorSlug,
}: {
  members: readonly Strain[];
  anchorSlug: string | null;
}) {
  const VISIBLE_CAP = 12;
  const isDense = members.length > VISIBLE_CAP;
  const head = isDense ? members.slice(0, VISIBLE_CAP) : members;
  const tail = isDense ? members.slice(VISIBLE_CAP) : [];

  return (
    <>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {head.map((m) => (
          <FamilyStrainTile key={m.slug} m={m} isAnchor={anchorSlug === m.slug} />
        ))}
      </ul>
      {isDense && (
        <details className="mt-4 group">
          <summary className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:border-emerald-400 hover:text-emerald-900 transition-colors list-none [&::-webkit-details-marker]:hidden">
            <span>Show all {members.length} strains</span>
            <span aria-hidden="true" className="text-stone-400 group-open:rotate-180 transition-transform">
              ▾
            </span>
          </summary>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4">
            {tail.map((m) => (
              <FamilyStrainTile key={m.slug} m={m} isAnchor={anchorSlug === m.slug} />
            ))}
          </ul>
        </details>
      )}
    </>
  );
}

function FamilyStrainTile({ m, isAnchor }: { m: Strain; isAnchor: boolean }) {
  return (
    <li>
      <Link
        href={`/strains/${m.slug}`}
        className={`group block h-full rounded-xl bg-white border ${
          isAnchor ? "border-emerald-400 ring-1 ring-emerald-200" : "border-stone-200"
        } hover:border-emerald-500 hover:shadow-sm transition-all px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500`}
      >
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-emerald-900 transition-colors leading-snug line-clamp-2 min-w-0">
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
}
