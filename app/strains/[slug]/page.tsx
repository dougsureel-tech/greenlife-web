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
import type React from "react";
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

import { safeJsonLd } from "@/lib/json-ld-safe";
import { buildStrainProductLd } from "@/lib/strain-product-json-ld";
import { Breadcrumb } from "@/components/Breadcrumb";
import { StrainLineageTree } from "@/components/StrainLineageTree";
import { StrainInStockSection } from "@/components/StrainInStockSection";
import { StrainStockWidget } from "@/components/StrainStockWidget";
import { StrainCoPurchaseRail } from "@/components/StrainCoPurchaseRail";
import { PickOfWeekStrip } from "@/components/PickOfWeekStrip";
import { RecentlyViewedAutoStrip } from "@/components/RecentlyViewedAutoStrip";
import { getStrainMatchedProducts, getActiveDeals } from "@/lib/db";
import { fetchCrossStoreStock } from "@/lib/strain-stock-cross-store";
import { fetchStrainCoPurchase } from "@/lib/strain-co-purchase-fetch";

// ISR with 5-min revalidate — flipped from force-static 2026-05-17 to
// support the "In stock today" live-inventory section without forcing a
// full rebuild on every product update. Cache invalidation is implicit
// via ISR window. STRAIN_MENU_INTEGRATION_SPEC §3.6.
export const revalidate = 300;
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
  indica: "bg-purple-100 text-purple-800 border-purple-200",
  sativa: "bg-red-100 text-red-800 border-red-200",
  hybrid: "bg-green-100 text-green-800 border-green-200",
};

// Type-color dot palette for the hero context strip (UI_EXPERT_DEEP_STRAIN_PAGE_2026_05_27.md
// "Type-color dot palette (formalize)"). Mirrors the RecentlyViewedStrip STRAIN_DOT pattern.
const TYPE_DOT_CLASS: Record<string, string> = {
  indica: "bg-purple-400",
  sativa: "bg-red-400",
  hybrid: "bg-green-400",
};

// Render the lineage segment of the hero context strip. When parent slugs
// resolve to corpus entries, parents become Links — gives the customer a
// "Born of A × B" navigation path the chip row never had. When parents are
// null (landrace) or unresolved, falls back to the plain `lineage` text
// (already typeset as "A × B"). Preserves the verbatim lineage string for
// SEO continuity (no rewording — pure presentation layer).
function renderLineageSegment(s: Strain): React.ReactNode {
  const resolved = (s.parents ?? []).map((p) =>
    p && STRAINS[p] ? { slug: p, name: STRAINS[p].name } : null
  );
  const allResolved =
    resolved.length >= 2 && resolved.every((r): r is { slug: string; name: string } => r !== null);
  if (allResolved) {
    return (
      <>
        {resolved.map((r, i) => (
          <span key={r!.slug}>
            {i > 0 && <span aria-hidden="true"> × </span>}
            <Link
              href={`/strains/${r!.slug}`}
              className="text-stone-700 underline decoration-stone-300 decoration-1 underline-offset-2 hover:decoration-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-sm"
            >
              {r!.name}
            </Link>
          </span>
        ))}
      </>
    );
  }
  return <span>{s.lineage}</span>;
}

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

  // Live-inventory match — STRAIN_MENU_INTEGRATION_SPEC §3.2. Server-side
  // DB read, scored + ranked via lib/strain-match.ts, top 6 cards.
  // Parallel-fetched with active-deals for online-pricing math; both wrapped
  // in React.cache() so re-renders within the same request don't refetch.
  const [matchedProducts, activeDeals, crossStoreStock, coPurchase] = await Promise.all([
    getStrainMatchedProducts(s, { graph, strainsBySlug: STRAINS, limit: 6 }),
    getActiveDeals(),
    // Cross-store stock widget data — fetched server-side so the widget HTML
    // ships in the initial render (load-bearing for SEO since 224/250 corpus
    // strains are ghost pages on this store; the cross-store visibility cue
    // closes the bounce vector). Probes both inv-App URLs in parallel with
    // 5s timeout; nulls per store on failure → widget's "ask staff" fallback.
    fetchCrossStoreStock({ slug: s.slug }),
    // Strain co-purchase rail data — Phase 2 Ship 2.4. Single-store fetch
    // (Wen only here; SCC fetches from its own inv-App). Returns top 5
    // partner strains by lift > 1.0 from THIS store's basket-level Markov
    // data. Soft-fails to { partners: [] } on any error → rail renders
    // nothing (honest empty-state contract: never show < 2 partners).
    fetchStrainCoPurchase(s.slug),
  ]);

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

  // Product + AggregateOffer JSON-LD — Tech-SEO win #1
  // (SEO_AUDIT_AUTONOMOUS_WINS_2026_05_26.md). Mirrors brand-detail Product
  // pattern at strain-not-SKU granularity; offers OMITTED when no live
  // inventory matches (per WSLCB-safe defaults). Constructed via
  // lib/strain-product-json-ld.ts which scrubs banned medical/efficacy
  // language defensively (WAC 314-55-155).
  const matchedMenuProducts = matchedProducts.map((m) => m.product);
  const productLd = buildStrainProductLd({
    strain: s,
    matchedProducts: matchedMenuProducts,
    storeWebsite: STORE.website,
    storeName: STORE.name,
  });
  // Note: a SECOND BreadcrumbList (3-item "Store → Strains → Strain") used
  // to be emitted via buildStrainBreadcrumbLd() — removed v41.925 because
  // it duplicated the 4-item `breadcrumbLd` above (which includes the
  // per-type Hybrid/Indica/Sativa intermediate step) and Google was
  // arbitrarily picking one. The 4-item shape is the canonical one;
  // single-BreadcrumbList emission per page now.

  return (
    <main className="bg-stone-50 text-stone-900 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(definedTermJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(localBusinessJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(productLd) }} />

      {/* Hero — UX-quickwin-bundle v42.045 (UI_EXPERT_DEEP_STRAIN_PAGE_2026_05_27.md
          Move #1 lite): chip row converted to a single navigable context
          strip. Three of the four old pills (THC range, CBD range, lineage)
          were non-interactive — burned ~40px above-fold for zero clicks.
          New strip is one line: [type-color dot] [type label] · [lineage] ·
          ~[THC]% THC · [In stock anchor when products are live]. Each
          segment carries navigation: type links to /strains/[type], lineage
          links to parent slugs when resolvable (else plain text), THC stays
          factual (no link), in-stock segment is an anchor to the
          #in-stock-today section. Sister scc v33.325 byte-identical shape.
          Color-dot palette per voice rubric §"Type-color dot palette". */}
      <section className="max-w-3xl mx-auto px-4 pt-4 pb-10">
        <div className="-mt-2">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        {/* Pick-of-Week handoff strip — UX expert Move #6
            (UI_EXPERT_DEEP_STRAIN_PAGE_2026_05_27.md). Sits below the
            breadcrumb + above the H1 so the editorial context (Kat picked
            it, why) is the FIRST thing a customer reads after the trail —
            preserving the home-rail-to-detail handoff that otherwise dies
            on the click. Renders ONLY when this slug IS the current week's
            pick AND PICK_OF_THE_WEEK_ENABLED is ON. Otherwise returns null
            entirely. Forward-looking polish: wires up the handoff before
            Doug flips the flag + authors a pick. Sister scc byte-identical
            (no brand-color swap — amber accent is the editorial-context
            discipline shared across both stores). The component carries
            its own max-w-3xl + px-4 wrapper so it doesn't fight the hero
            section's padding. */}
        <PickOfWeekStrip slug={slug} />
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900 mb-3">
          {s.name}
        </h1>
        <p className="text-lg md:text-xl text-stone-700 max-w-2xl mb-4">{s.tagline}</p>
        <nav
          aria-label="Strain quick facts"
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-700 mb-6"
        >
          <Link
            href={`/strains/${s.type}`}
            className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 -mx-1.5 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <span
              aria-hidden="true"
              className={`inline-block h-2 w-2 rounded-full ${TYPE_DOT_CLASS[s.type] ?? "bg-stone-400"}`}
            />
            <span className="font-medium">{typeLabel}</span>
          </Link>
          {s.lineage && (
            <>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="text-stone-600">
                {renderLineageSegment(s)}
              </span>
            </>
          )}
          {s.thcRange && (
            <>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="text-stone-600">~{s.thcRange} THC</span>
            </>
          )}
          {matchedProducts.length > 0 && (
            <>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <a
                href="#in-stock-today"
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 -mx-1.5 font-medium text-emerald-800 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                <span aria-hidden="true">📍</span>
                In stock today ({matchedProducts.length})
              </a>
            </>
          )}
        </nav>
        {!inWave && (
          <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs text-amber-900 max-w-xl">
            Preview · this strain page is not yet in the public search index.
          </div>
        )}
      </section>

      {/* Cross-store stock widget — surfaces "in stock at the OTHER store"
          cue before the intro so a customer landing on a ghost page (page
          exists, no current stock at this store) sees the sibling-store
          availability + a link to that store's menu. Renders here vs after
          the intro so it sits above-the-fold on mobile. Trigger:
          repeat-carry analysis 2026-05-27 found 224/250 corpus strains
          are ghost pages on this store; the widget is the answer to "is
          this available at all?". WSLCB-safe shape (no $ figures, no
          medical-claim adjacency). Sister scc same shape with indigo accent. */}
      <StrainStockWidget strain={s} stock={crossStoreStock} thisStore="wen" />

      {/* Intro — v42.045 UX-quickwin reorder (Move #2): intro now leads the
          body so the customer gets the one-paragraph "what is this strain"
          read BEFORE the in-stock rail. */}
      <section className="max-w-3xl mx-auto px-4 pb-10">
        <p className="text-base md:text-lg leading-relaxed text-stone-700" data-speakable>
          {s.intro}
        </p>
      </section>

      {/* In stock today — v42.045 UX-quickwin reorder (Move #2): jumped from
          7th to 3rd position so retail-intent visitors see live products
          before the education sections. Wrapped in an anchor div so the
          hero context strip's "📍 In stock today" link can scroll here.
          Live-inventory section (server-rendered from local Postgres
          products SoT, 5-min ISR cache). HIDES entirely when 0 matches
          per Doug §7 decision. */}
      <div id="in-stock-today">
        <StrainInStockSection
          strain={s}
          matched={matchedProducts}
          deals={activeDeals}
          storeName={STORE.name}
        />
      </div>

      {/* Co-purchase rail — Phase 2 Ship 2.4 (sister of admin Markov
          dashboard at /admin/reports/strain-co-purchase, Phase 1B.3 / v428.5205).
          "People who pick {strain} also reach for these" — top 5 partner
          strains by basket-level lift > 1.0 from THIS store's sales data.
          Voice: PATTERN observation (preference-as-fact about past customer
          behavior), NOT effect claim. WSLCB 314-55-155 safe — verb-of-
          preference rubric per STRAIN_COPY_VOICE_RUBRIC_2026_05_15. Honest
          empty-state: renders nothing when < 2 partners survive (insufficient
          basket signal, all below lift floor, transient API failure). No
          customer counts, no purchase frequencies, no transaction IDs
          surfaced to customers. Positioned after StrainInStockSection (live
          inventory) and before the FAQ so a customer scanning the page has
          a "what else" path before hitting the FAQ wall. */}
      <StrainCoPurchaseRail
        anchorName={s.name}
        partners={coPurchase.partners}
      />

      {/* Lineage tree */}
      {graph && (graph.parents.length > 0 || graph.descendants.length > 0) && (
        <section className="max-w-5xl mx-auto px-4 pb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700 mb-2">Genetics</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 mb-2">Family tree</h2>
          <p className="text-sm text-stone-600 mb-4">
            {s.name}'s parents, descendants, and sister strains in the catalog.
            {s.lineageAlternates && s.lineageAlternates.length > 0 && (
              <span>
                {" "}Alternate lineage candidates: {s.lineageAlternates.join("; ")}.
              </span>
            )}
          </p>
          <StrainLineageTree graph={graph} />
        </section>
      )}

      {/* Terpene table */}
      {s.terpenes.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 pb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700 mb-2">Aromatic chemistry</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 mb-4">Terpene profile</h2>
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
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 mb-3">Customers often describe</h2>
          <div className="flex flex-wrap gap-1.5">
            {s.effects.map((e) => (
              <span key={e} className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 text-xs font-medium">
                {e}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 mb-3">Aroma + flavor</h2>
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
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 mb-4">Frequently asked about {s.name}</h2>
          <div className="space-y-2">
            {s.faqs.map((f, i) => (
              <details key={i} className="rounded-lg border border-stone-200 bg-white">
                <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-stone-900 hover:bg-stone-50 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 marker:text-stone-400">
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
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 mb-4">Other {typeLabel.toLowerCase()} strains worth a look</h2>
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

      {/* Recently viewed — v42.045 UX-quickwin (Move #8). Self-fetching
          client component reads localStorage IDs and fetches just those
          products. Handles its own empty state (returns null when nothing
          to show) and dedup-against-current-page. Mounts at page tail so
          a customer flowing through multiple strain pages keeps a tiny
          breadcrumb of their interest. */}
      <RecentlyViewedAutoStrip accent="green" />

      {/* Verification footer — v42.045 UX-quickwin (Move #5). Surfaces the
          `verification` metadata block as a one-line credibility signal
          above the compliance footer. Hidden when the field is absent so
          un-verified entries stay quiet. No source list, no expandable —
          single-line statement per UX expert spec. */}
      {s.verification && (
        <section className="max-w-3xl mx-auto px-4 pt-6 pb-2 text-center text-xs text-stone-500 leading-relaxed">
          <p>
            Verified{" "}
            {(() => {
              try {
                return new Date(s.verification.verifiedAt + "T12:00:00Z").toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
              } catch {
                return s.verification.verifiedAt;
              }
            })()}{" "}
            against {s.verification.sources.length}{" "}
            {s.verification.sources.length === 1 ? "source" : "sources"}
            {s.lineageAlternates && s.lineageAlternates.length > 0
              ? " — updated when sources disagree."
              : "."}
          </p>
        </section>
      )}

      {/* Compliance footer — v42.045: CTA band above removed (Move #4) since
          MobileStickyCta is already mounted in root layout and handles the
          same affordance with store-open-status awareness; the big bg
          -emerald-950 band burned ~280px for a redundant CTA. */}
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
