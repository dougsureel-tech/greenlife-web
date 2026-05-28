import type { Metadata } from "next";
import Link from "next/link";
import { STORE, DEFAULT_OG_IMAGE } from "@/lib/store";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { TERPENE_CARDS, TERPENE_FAQS } from "@/lib/terpene-content";
import { STRAINS, getStrainsInCurrentWave } from "@/lib/strains";
import { Breadcrumb } from "@/components/Breadcrumb";

// /learn/terpenes — Phase 2 Ship 2.5 evergreen terpene primer.
//
// Purpose:
//   - Teach customers the language of cannabis aroma + flavor (NEVER
//     effect language — WSLCB 314-55-155). Once a customer can name what
//     they smelled in the jar, the counter conversation gets exponentially
//     more useful.
//   - High-intent SEO surface for queries like "what strains are high in
//     limonene seattle" / "myrcene strains wenatchee" — no other WA-state
//     dispensary site has a dedicated terpene primer that's not just a
//     wellness-brand effect chart.
//
// Compliance posture (load-bearing — sister gates check-efficacy-claims +
// check-wac-314-55-155-banned-claims scan this file on push):
//   - Card copy lives in lib/terpene-content.ts SSoT (sister-port).
//   - Strain-link pills carry NO effect language — just the strain name +
//     terpene position chip.
//   - FAQ answers redirect "what will it do?" → "here's how to talk about
//     it at the counter."
//
// Static-render (no auth, no DB) — pure data-driven from STRAINS + the
// terpene-content SSoT. Force-static so the page ships with the build.

export const dynamic = "force-static";
export const revalidate = false;

// SERP title — kept under Google's ~60-char truncation cap. Layout's
// global title template suffix is dropped via `title.absolute`.
const SEO_TITLE = `Terpene guide — cannabis aroma + flavor`;
const SEO_DESCRIPTION = `What myrcene, limonene, caryophyllene, pinene, and linalool smell and taste like — and which strains at ${STORE.name} lean each direction.`;

export const metadata: Metadata = {
  title: { absolute: SEO_TITLE },
  description: SEO_DESCRIPTION,
  alternates: { canonical: "/learn/terpenes" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "article",
    locale: "en_US",
    siteName: STORE.name,
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    url: `${STORE.website}/learn/terpenes`,
    // Falls back to the site-default OG image — no per-route opengraph-image
    // co-located (the /learn/[slug] route has its own; this static-shell
    // primer uses the home/learn-shell card).
    images: [DEFAULT_OG_IMAGE],
  },
};

/**
 * Pick the strain pills for one terpene card.
 * Filter: any strain whose top-3 terpenes contain this name AND whose
 * slug is in the live SEO wave (so we never link to a noindex/404'd page).
 * Sort: dominant (position 0) first, then position 1, then 2; alphabetical
 * inside each tier for stability across builds.
 * Cap at 6 — enough to demonstrate the pattern, not so many it overwhelms.
 */
function strainsForTerpene(terpeneName: string): Array<{
  slug: string;
  name: string;
  position: number;
}> {
  const indexedSlugs = new Set(getStrainsInCurrentWave());
  const matches: Array<{ slug: string; name: string; position: number }> = [];
  for (const slug of Object.keys(STRAINS)) {
    if (!indexedSlugs.has(slug)) continue;
    const s = STRAINS[slug];
    if (!s.terpenes || s.terpenes.length === 0) continue;
    for (let i = 0; i < Math.min(s.terpenes.length, 3); i++) {
      if (s.terpenes[i].name === terpeneName) {
        matches.push({ slug, name: s.name, position: i });
        break;
      }
    }
  }
  matches.sort((a, b) => {
    if (a.position !== b.position) return a.position - b.position;
    return a.name.localeCompare(b.name);
  });
  return matches.slice(0, 6);
}

export default function TerpeneGuidePage() {
  const cards = TERPENE_CARDS.map((card) => ({
    ...card,
    strains: strainsForTerpene(card.name),
  }));

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${STORE.website}/learn/terpenes#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Cannabis 101", item: `${STORE.website}/learn` },
      { "@type": "ListItem", position: 3, name: "Terpene guide", item: `${STORE.website}/learn/terpenes` },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${STORE.website}/learn/terpenes#faq`,
    mainEntity: TERPENE_FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  // Article wrapper ties the primer to the LocalBusiness @id from
  // app/layout.tsx — AI engines + Google treat the educational content
  // as authored by our store entity (E-E-A-T).
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${STORE.website}/learn/terpenes#article`,
    headline: `Terpene guide — Cannabis aroma + flavor at ${STORE.name}`,
    description: `What myrcene, limonene, caryophyllene, pinene, and linalool smell and taste like — and which strains at ${STORE.name} lean each direction.`,
    inLanguage: "en-US",
    url: `${STORE.website}/learn/terpenes`,
    isPartOf: { "@id": `${STORE.website}/learn` },
    publisher: { "@id": `${STORE.website}/#dispensary` },
    about: { "@id": `${STORE.website}/#dispensary` },
  };

  return (
    <main className="bg-zinc-950 text-zinc-100 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqLd) }} />

      <Breadcrumb
        items={[
          { label: "Cannabis 101", href: "/learn" },
          { label: "Terpene guide" },
        ]}
      />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-emerald-900/40 bg-gradient-to-br from-emerald-950 via-zinc-950 to-zinc-950">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-10 sm:pt-12 sm:pb-14">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400 mb-3">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Cannabis 101 · the aroma map</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1] mb-4">
            Terpene guide — the smell-and-flavor language of cannabis.
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl">
            Terpenes are the aromatic molecules that make a Blue Dream smell like ripe mango and a Sour Diesel smell like
            a gas-station parking lot. Naming what you smell is the most useful thing you can do before talking to a
            budtender — every conversation at the counter gets sharper once you can say &quot;something peppery&quot; or
            &quot;something citrus-bright&quot; instead of &quot;something good.&quot;
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl mt-4">
            This page covers the five terpenes that dominate the Washington shelf. Each card tells you what it smells
            like, what it tastes like, where else you encounter it in everyday life, and which strains in our corpus
            lean that direction.
          </p>
        </div>
      </section>

      {/* ── TERPENE CARDS ────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        {cards.map((card) => (
          <article
            key={card.slug}
            id={card.slug}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 sm:px-7 py-6 sm:py-8 scroll-mt-20"
          >
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">{card.name}</h2>

            <dl className="space-y-3 mb-5">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/90 mb-1">Smells like</dt>
                <dd className="text-zinc-200 leading-relaxed">{card.aroma}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/90 mb-1">Tastes like</dt>
                <dd className="text-zinc-200 leading-relaxed">{card.flavor}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/90 mb-1">
                  Where else you encounter it
                </dt>
                <dd className="text-zinc-300 leading-relaxed text-sm sm:text-base">{card.alsoIn}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/90 mb-1">
                  Who reaches for this
                </dt>
                <dd className="text-zinc-300 leading-relaxed text-sm sm:text-base">{card.whoReaches}</dd>
              </div>
            </dl>

            {card.strains.length > 0 ? (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/90 mb-2">
                  Strains we carry that lean {card.name}
                </p>
                <ul className="flex flex-wrap gap-2" aria-label={`Strains in the ${card.name} direction`}>
                  {card.strains.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/strains/${s.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-800/60 hover:border-emerald-500 bg-emerald-950/30 hover:bg-emerald-900/40 px-3 py-1.5 text-sm font-medium text-emerald-100 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        {s.name}
                        {s.position === 0 && (
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/90"
                            aria-label="dominant terpene"
                          >
                            · top
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        ))}
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-10 sm:pb-14">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-6">Frequently asked</h2>
        <dl className="space-y-4">
          {TERPENE_FAQS.map((f, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 px-5 py-4 open:border-emerald-700/50 transition-colors"
            >
              <summary className="cursor-pointer list-none flex items-start justify-between gap-3 text-base sm:text-lg font-semibold text-zinc-100">
                <span>{f.q}</span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-emerald-400 transition-transform group-open:rotate-45 text-xl leading-none"
                >
                  +
                </span>
              </summary>
              <dd className="mt-3 text-zinc-300 text-sm sm:text-base leading-relaxed">{f.a}</dd>
            </details>
          ))}
        </dl>
      </section>

      {/* ── CROSS-LINKS / CTA ────────────────────────────────────────── */}
      <section className="border-y border-emerald-900/40 bg-gradient-to-br from-emerald-950 to-zinc-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400 mb-2">Keep going</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
            Put the aroma map to work.
          </h2>
          <p className="text-zinc-300 leading-relaxed mb-5 max-w-xl">
            The full strain library has terpene notes on every page. The 3-question strain quiz lets you tell us what
            you want to smell + how you want to consume it, and we&apos;ll match strains in the right aroma family.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/strains"
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              Browse the strain library →
            </Link>
            <Link
              href="/find-your-strain"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 hover:border-zinc-500 px-6 py-3 text-sm font-medium text-zinc-200 hover:bg-zinc-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Take the 3-question quiz
            </Link>
            <Link
              href="/learn"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 hover:border-zinc-600 px-5 py-3 text-sm text-zinc-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Back to Cannabis 101
            </Link>
          </div>
        </div>
      </section>

      {/* ── DISCLAIMER ───────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-xs text-zinc-600 text-center leading-relaxed">
          General education only — not medical advice. Cannabis chemistry varies between batches; the terpene profile
          on every product&apos;s lab panel is the authoritative source for that specific jar. 21+. Always consume
          responsibly.
        </p>
      </div>
    </main>
  );
}
