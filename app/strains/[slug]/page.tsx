// /strains/[slug] — per-strain SEO landing page.
//
// Mirrors the /strains/[type] pattern: same hero shape, same JSON-LD
// shape (BreadcrumbList + FAQPage + LocalBusiness anchor), same CTA
// band shape, dressed differently to honor the long-tail strain
// search intent.
//
// Built 2026-05-15 against the verified 50-strain dataset at lib/strains.ts.
// Multi-source verified per Doug's mandate ("we MUST make sure it stays
// accurate"). See STRAIN_VERIFICATION_REPORT_2026_05_15.md.
//
// SEO cadence-gate: pages physically exist for all 50 slugs in the build,
// but the sitemap + cross-link grids only surface strains within the
// current `SEO_STRAIN_WAVE` env value. Default wave 0 = none indexed.
// Doug bumps the env var per the 6/day/stack cadence in the plan.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STORE } from "@/lib/store";
import {
  STRAINS,
  STRAIN_SLUGS,
  getStrain,
  buildLineageGraph,
  isStrainInWave,
  type Strain,
} from "@/lib/strains";
import { STRAIN_TYPES } from "@/lib/strain-types";
import { isStrainTypeSlug, strainTypeMetadata, StrainTypePage } from "../_type-handler";

// strain-slug attribution channel for /menu deep-links from per-strain pages
const STRAIN_ATTR_KEY = "strains" as const;
import { safeJsonLd } from "@/lib/json-ld-safe";
import { withAttr } from "@/lib/attribution";
import { Breadcrumb } from "@/components/Breadcrumb";
import { StrainLineageTree } from "@/components/StrainLineageTree";

export const dynamic = "force-static";
export const revalidate = false;
export const dynamicParams = false;

// Combined static params: strain-type slugs (indica/sativa/hybrid/cbd) + per-strain
// slugs. Next.js 16 rejects sibling dynamic routes — `/strains/[type]` + `/strains/[slug]`
// at the same level can't be distinguished — so this one route dispatches both via
// the _type-handler helper module.
export function generateStaticParams() {
  return [
    ...STRAIN_TYPES.map((t) => ({ slug: t.slug })),
    ...STRAIN_SLUGS.map((slug) => ({ slug })),
  ];
}

const TYPE_LABELS: Record<string, string> = {
  indica: "Indica",
  sativa: "Sativa",
  hybrid: "Hybrid",
};

const TYPE_BADGE_CLASS: Record<string, string> = {
  indica: "bg-indigo-100 text-indigo-800 border-indigo-200",
  sativa: "bg-orange-100 text-orange-800 border-orange-200",
  hybrid: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Dispatch: type slugs (indica/sativa/hybrid/cbd) route to the type-handler.
  if (isStrainTypeSlug(slug)) {
    const meta = strainTypeMetadata(slug);
    return meta ?? { title: "Not found" };
  }
  const s = getStrain(slug);
  if (!s) return { title: "Not found" };

  const inWave = isStrainInWave(slug);
  const typeLabel = TYPE_LABELS[s.type] ?? s.type;
  const title = { absolute: `${s.name} strain (${typeLabel}) — ${STORE.name}` } as const;
  const desc =
    `${s.tagline}` +
    (s.lineage ? ` Parents: ${s.lineage}.` : "") +
    ` In stock at ${STORE.name}.`;

  return {
    title,
    description: desc.length > 155 ? desc.slice(0, 152) + "…" : desc,
    alternates: { canonical: `/strains/${s.slug}` },
    keywords: [
      `${s.name} strain`,
      `${s.name} ${STORE.address.city}`,
      `${s.name} Washington`,
      ...(s.lineage ? [`${s.lineage} cross`] : []),
      typeLabel,
      `${s.name} terpenes`,
      `${s.name} effects`,
    ],
    // SEO cadence-gate: noindex pages outside the current wave so they
    // can be pre-built but stay out of Google's index until the wave
    // includes them. When SEO_STRAIN_WAVE is bumped, on next deploy the
    // metadata flips to allow indexing.
    robots: inWave
      ? { index: true, follow: true }
      : { index: false, follow: true, nocache: true },
    openGraph: {
      type: "website",
      locale: "en_US",
      title,
      description: desc,
      url: `${STORE.website}/strains/${s.slug}`,
      siteName: STORE.name,
      images: [
        {
          url: `/strains/${s.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${s.name} strain at ${STORE.name} — ${s.tagline}`,
        },
      ],
    },
  };
}

export default async function StrainSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Dispatch: type slugs (indica/sativa/hybrid/cbd) render the per-category page.
  if (isStrainTypeSlug(slug)) {
    return <StrainTypePage slug={slug} />;
  }
  const s = getStrain(slug);
  if (!s) notFound();

  const graph = buildLineageGraph(slug);
  const typeLabel = TYPE_LABELS[s.type] ?? s.type;
  const inWave = isStrainInWave(slug);

  // Related strains — same type + at least 1 shared terpene OR 1 shared
  // parent. Falls back to "more <type>" if nothing qualifies. Cap at 6.
  const myTerpenes = new Set(s.terpenes.map((t) => t.name.toLowerCase()));
  const myParents = new Set(s.parents ?? []);
  const related = STRAIN_SLUGS
    .filter((other) => other !== slug)
    .map((other) => STRAINS[other])
    .filter((c) => c.type === s.type)
    .map((c) => {
      const sharedTerps = c.terpenes.filter((t) => myTerpenes.has(t.name.toLowerCase())).length;
      const sharedParents = (c.parents ?? []).filter((p) => p && myParents.has(p)).length;
      return { strain: c, score: sharedTerps + sharedParents * 2 };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((r) => r.strain);

  const breadcrumbItems = [
    { label: "Strains", href: "/strains" },
    { label: typeLabel, href: `/strains/${s.type}` },
    { label: s.name },
  ];

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Strains", item: `${STORE.website}/strains` },
      { "@type": "ListItem", position: 3, name: typeLabel, item: `${STORE.website}/strains/${s.type}` },
      { "@type": "ListItem", position: 4, name: s.name, item: `${STORE.website}/strains/${s.slug}` },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: s.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const definedTermJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: `${s.name} strain`,
    description: s.tagline,
    inDefinedTermSet: `${STORE.website}/strains`,
    url: `${STORE.website}/strains/${s.slug}`,
  };

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${STORE.website}/#dispensary`,
    name: STORE.name,
    url: STORE.website,
  };

  return (
    <main className="bg-stone-50 text-stone-900 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(definedTermJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(localBusinessJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />

      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Hero — width-jitter fix 2026-05-17: standardize prose rail at
          max-w-3xl. The only legitimate width-break on this page is the
          lineage tree (max-w-5xl) which needs the room for its SVG. */}
      <section className="max-w-3xl mx-auto px-4 pt-6 pb-10">
        <div className="text-xs uppercase tracking-[0.18em] text-stone-500 mb-3">
          {typeLabel} · {STORE.address.city}, WA
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900 mb-3">
          {s.name}
        </h1>
        <p className="text-lg md:text-xl text-stone-700 max-w-2xl mb-4">{s.tagline}</p>
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
              TYPE_BADGE_CLASS[s.type] ?? "bg-stone-100 text-stone-700 border-stone-200"
            }`}
          >
            {typeLabel}
          </span>
          {s.thcRange && (
            <span className="rounded-full border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700">
              THC {s.thcRange}
            </span>
          )}
          {s.cbdRange && (
            <span className="rounded-full border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700">
              CBD {s.cbdRange}
            </span>
          )}
          {s.lineage && (
            <span className="rounded-full border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700">
              {s.lineage}
            </span>
          )}
        </div>
        {!inWave && (
          <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs text-amber-900 max-w-xl">
            Preview · this strain page is not yet in the public search index.
          </div>
        )}
      </section>

      {/* Lineage tree */}
      {graph && (graph.parents.length > 0 || graph.descendants.length > 0) && (
        <section className="max-w-5xl mx-auto px-4 pb-8">
          <h2 className="text-lg font-semibold text-stone-900 mb-1">Family tree</h2>
          <p className="text-sm text-stone-600 mb-4">
            {s.name}&apos;s parents, descendants, and sister strains in the catalog.
            {s.lineageAlternates && s.lineageAlternates.length > 0 && (
              <span>
                {" "}Alternate lineage candidates: {s.lineageAlternates.join("; ")}.
              </span>
            )}
          </p>
          <StrainLineageTree graph={graph} />
        </section>
      )}

      {/* Intro */}
      <section className="max-w-3xl mx-auto px-4 pb-10">
        <p className="text-base md:text-lg leading-relaxed text-stone-700" data-speakable>
          {s.intro}
        </p>
      </section>

      {/* Terpene table */}
      {s.terpenes.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 pb-10">
          <h2 className="text-xl font-semibold text-stone-900 mb-4">Terpene profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {s.terpenes.map((t) => (
              <div key={t.name} className="rounded-lg border border-stone-200 bg-white p-3">
                <div className="text-sm font-semibold text-stone-900">{t.name}</div>
                <div className="text-xs text-stone-600 mt-0.5 leading-relaxed">{t.note}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Effects + Flavor */}
      <section className="max-w-3xl mx-auto px-4 pb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-base font-semibold text-stone-900 mb-3">Customers often describe</h2>
          <div className="flex flex-wrap gap-1.5">
            {s.effects.map((e) => (
              <span key={e} className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 text-xs font-medium">
                {e}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-base font-semibold text-stone-900 mb-3">Aroma + flavor</h2>
          <div className="flex flex-wrap gap-1.5">
            {s.flavor.map((f) => (
              <span key={f} className="rounded-full bg-stone-100 text-stone-800 border border-stone-300 px-2.5 py-1 text-xs font-medium">
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Best for / avoid if */}
      <section className="max-w-3xl mx-auto px-4 pb-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <h2 className="text-sm font-semibold text-emerald-900 uppercase tracking-wide mb-2">Best for</h2>
          <ul className="space-y-1.5 text-sm text-stone-800">
            {s.bestFor.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5">✓</span> {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <h2 className="text-sm font-semibold text-amber-900 uppercase tracking-wide mb-2">Be cautious if</h2>
          <ul className="space-y-1.5 text-sm text-stone-800">
            {s.avoidIf.map((a) => (
              <li key={a} className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">!</span> {a}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      {s.faqs.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 pb-12">
          <h2 className="text-xl font-semibold text-stone-900 mb-4">Frequently asked about {s.name}</h2>
          <div className="space-y-2">
            {s.faqs.map((f, i) => (
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

      {/* Related strains — width-jitter fix: align with prose rail at
          max-w-3xl. Card grid stays grid-cols-2 md:grid-cols-3. */}
      {related.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 pb-12">
          <h2 className="text-xl font-semibold text-stone-900 mb-4">Other {typeLabel.toLowerCase()} strains worth a look</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/strains/${r.slug}`}
                className="rounded-xl border border-stone-200 bg-white hover:border-stone-400 hover:shadow-sm transition-all px-4 py-3 group"
              >
                <div className="text-sm font-semibold text-stone-900 group-hover:underline">{r.name}</div>
                <div className="text-xs text-stone-600 mt-0.5 truncate">{r.tagline}</div>
                {r.lineage && (
                  <div className="text-[10px] text-stone-500 mt-1.5 font-mono">{r.lineage}</div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA band */}
      <section className="bg-emerald-950 text-emerald-50">
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">See if we have {s.name} in stock</h2>
          <p className="text-emerald-200 mb-6 max-w-xl mx-auto">
            Live inventory at {STORE.name} — save 20% on every online order.
          </p>
          <Link
            href={withAttr(`/menu?q=${encodeURIComponent(s.name)}`, STRAIN_ATTR_KEY, s.slug)}
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
          Effects described are common customer reports, not promises. {STORE.name},{" "}
          {STORE.address.city}, WA.
        </p>
      </section>
    </main>
  );
}
