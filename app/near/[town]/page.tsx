import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STORE } from "@/lib/store";
import { NEAR_TOWNS, getTown } from "@/lib/near-towns";
import { safeJsonLd } from "@/lib/json-ld-safe";

// /near/<town> — geo landing pages. One page per town in NEAR_TOWNS,
// keyed off slug. Static (force-static) — content is data-driven from
// near-towns.ts, no per-request DB calls. Sitemap pulls these in via
// generateStaticParams + the static-page list in sitemap.ts.

export const dynamic = "force-static";
export const revalidate = false;
// dynamicParams=false: unknown :town slugs return proper HTTP 404 instead
// of rendering a 200-status "Not found" page (soft-404). Pre-fix, requests
// for /near/wenatchee or /near/seattle (cross-store + home-city slugs not in
// NEAR_TOWNS) returned HTTP 200 with `<title>Not found | …</title>` — Google
// penalizes soft-404s + customer in our home city saw "Not found" when they
// typed a near-page URL. With dynamicParams=false, Next returns its built-in
// 404 (proper 404 status) for any slug not in generateStaticParams.
export const dynamicParams = false;

export function generateStaticParams() {
  return NEAR_TOWNS.map((t) => ({ town: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ town: string }>;
}): Promise<Metadata> {
  const { town: slug } = await params;
  const town = getTown(slug);
  if (!town) return { title: "Not found" };

  // title.absolute drops template suffix `· Green Life Cannabis` so
  // /near/* pages stay under Google ~60-char SERP cap. Pre-fix
  // `${town.name} Dispensary — ${STORE.name}` + template suffix totaled
  // 61-73 chars across the NEAR_TOWNS set. The brand is in the body
  // already; the suffix was duplication. Sister glw v12.705 + v12.805
  // title.absolute pattern arc.
  const title = { absolute: `${town.name} Dispensary — ${STORE.name}` } as const;
  // Pre-fix template combined `town.name → STORE: N min via highway. pitch.
  // Open daily 8 AM, cash only, 21+.` which ran 200-229 chars across the
  // whole NEAR_TOWNS set — every page truncating mid-sentence in Google
  // SERPs (160-char cap). The leading "X to STORE: N min via highway"
  // was redundant with `town.pitch` (every pitch already names the
  // route + drive time). Drop it; just use pitch + a shortened CTA
  // trailer ("Open daily" — implicit 8 AM / 21+ / cash-only on every page
  // already, no need to repeat in 14 places). New range: 105-145 chars
  // across the full NEAR_TOWNS set, well under the SERP cap. Caught
  // 2026-05-10 by /loop tick 6 cross-stack description-length re-audit.
  // Sister scc same-push.
  const desc = `${town.pitch} Open daily, cash only, 21+.`;

  return {
    title,
    description: desc,
    alternates: { canonical: `/near/${town.slug}` },
    keywords: [
      `${town.name} dispensary`,
      `weed near ${town.name}`,
      `cannabis near ${town.name}`,
      `${town.name} cannabis store`,
      `${town.name} pre-rolls`,
      `${town.name} edibles`,
      `dispensary near ${town.name}`,
    ],
    openGraph: {
      type: "website",
      locale: "en_US",
      title,
      description: desc,
      url: `${STORE.website}/near/${town.slug}`,
      siteName: STORE.name,
      // Explicit per-route OG URL (glw v35.505). Co-located
      // `opengraph-image.tsx` is the per-town card; this entry points at
      // the per-route file. Per `scripts/check-per-route-og-image.mjs`
      // fix shape B + `scripts/check-og-completeness.mjs` requirement
      // that openGraph blocks re-emit the `images` field after the Next
      // metadata cascade SHALLOWLY overwrites parent openGraph.
      images: [
        {
          url: `/near/${town.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${town.name}, WA → ${STORE.name} · ${town.driveMins} min via ${town.highway}`,
        },
      ],
    },
  };
}

export default async function NearTownPage({
  params,
}: {
  params: Promise<{ town: string }>;
}) {
  const { town: slug } = await params;
  const town = getTown(slug);
  if (!town) notFound();

  // JSON-LD: Place (the town) → LocalBusiness (us) reference, so
  // Google understands this page is about a service-area, not a
  // store branch. `safeJsonLd` escapes `<` so a vendor name
  // containing `</script>` can't XSS the page (per v7.275).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    // @id references the canonical `#dispensary` from app/layout.tsx so
    // Google merges the area-served declaration with the home-page
    // LocalBusiness instead of treating /near/<town> as a separate
    // store. mainEntityOfPage keeps the per-page binding intact.
    // v7.625 SEO graph-consolidation fix.
    "@id": `${STORE.website}/#dispensary`,
    mainEntityOfPage: { "@id": `${STORE.website}/near/${town.slug}` },
    name: STORE.name,
    description: `Cannabis dispensary serving ${town.name}, ${town.county}.`,
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
    areaServed: {
      "@type": "Place",
      name: `${town.name}, ${STORE.address.state}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: town.name,
        addressRegion: STORE.address.state,
        addressCountry: "US",
      },
    },
    // SpeakableSpecification — explicit anchor for voice assistants
    // (Google Assistant / Siri / Alexa) so a "near me" voice query
    // surfaces a compact readback of the load-bearing facts (H1 +
    // anything tagged `data-speakable`: cityCopy lede + address chip).
    // Generic CSS selectors so future copy doesn't need to know about
    // this contract. Sister GW v2.97.M1 SpeakableSpecification port.
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "[data-speakable]"],
    },
  };

  // BreadcrumbList — Google renders the path under the SERP result
  // (Home › Visit › <town>) instead of just the URL string, which
  // earns 1-2% CTR per Search Console A/Bs. Mirrors the visible
  // breadcrumb nav rendered below.
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    // T92 sister of T91 entity-graph @id linking — pre-fix this inline
    // schema was a dangling node. Now addressable via @id from sibling
    // LocalBusiness mainEntityOfPage etc.
    "@id": `${STORE.website}/near/${town.slug}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Visit", item: `${STORE.website}/visit` },
      { "@type": "ListItem", position: 3, name: town.name, item: `${STORE.website}/near/${town.slug}` },
    ],
  };

  // Page is force-static + revalidate=false, so "today's hours" baked at
  // build time would drift by day-of-week on every subsequent day. Use a
  // static summary instead — STORE.hours SSoT, summarized at render time.
  // 5/7 days are 8 AM-9 PM; Fri+Sat extend to 10 PM. Customers needing
  // live status click "Hours + directions" → /visit which is ISR'd.
  // Declared above the FAQ JSON-LD so the hours answer can reference it.
  const hoursSummaryStatic = "8 AM – 9 PM · later Fri & Sat";

  // FAQPage — per-town Q&A block so Google + LLMs (ChatGPT, Perplexity,
  // Claude.ai, Gemini) have explicit structured Q&A to cite. Five
  // questions per page; 2 are town-specific (drive-time / route) and
  // pull from `town.driveMins` + `town.highway`; the other 3 are
  // structural facts (address / cash-only / hours / 21+) and pull from
  // STORE constants. Hardcoded answers but routed through safeJsonLd()
  // per existing convention. Voice: operator-grit, no exclamation
  // marks, U+2019 apostrophes, WAC 314-55-155 lane (no effect/medical
  // /promo claims).
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${STORE.website}/near/${town.slug}#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: `How long is the drive from ${town.name} to ${STORE.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `About ${town.driveMins} minutes from ${town.name}, ${town.highway}.`,
        },
      },
      {
        "@type": "Question",
        name: `What${"’"}s the address?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${STORE.address.full}. Free parking out front, right off the Sunnyslope exit.`,
        },
      },
      {
        "@type": "Question",
        name: "Do you take cards?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Cash only at the counter. There${"’"}s an ATM in the lobby.`,
        },
      },
      {
        "@type": "Question",
        name: "What are your hours?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `${hoursSummaryStatic}. Open every day of the year.`,
        },
      },
      {
        "@type": "Question",
        name: "Do I need to be 21?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. ID checked at the door per WAC. 21 and up only.",
        },
      },
    ],
  };

  const otherTowns = NEAR_TOWNS.filter((t) => t.slug !== town.slug);

  // "Also nearby" mini-cluster — resolves the town's hand-picked
  // `notableNeighbors` names against NEAR_TOWNS to produce a 2-3-card
  // related cluster that renders ABOVE the full town grid. Anchors
  // PageRank between geo-neighbors (the most-likely next-page for a
  // visitor who arrived via a town-search) without disturbing the full
  // crawl-discovery grid below. Notable-neighbor names use display
  // case ("Lake Wenatchee"); slug match is loose (lowercase + hyphen-
  // for-space) so the SSoT doesn't need a second name→slug map.
  const slugify = (s: string): string =>
    s.toLowerCase().replace(/\s+/g, "-");
  const notableNearby = town.notableNeighbors
    .map((name) => {
      const target = slugify(name);
      return NEAR_TOWNS.find((t) => t.slug === target);
    })
    .filter((t): t is NonNullable<typeof t> => t !== undefined)
    .slice(0, 3);

  return (
    <main className="bg-stone-50 text-stone-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqLd) }}
      />

      {/* ── HERO ────────────────────────────────────────────────────────
          Green-950 hero band matching /visit + / sister pages. Eyebrow +
          big h1 + pitch + two CTAs sit above the fold on mobile (360px)
          and desktop. CTA prominence was a Doug-feedback driver: pre-
          redesign the only /menu CTA was a mid-page emerald box that
          required a scroll on phones to see.
      */}
      <section className="relative bg-green-950 text-white overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(74,222,128,0.18),transparent_55%)]"
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-10 sm:pb-14">
          <nav className="text-xs text-green-300/70 mb-6 flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span aria-hidden="true" className="text-green-700">·</span>
            <Link href="/visit" className="hover:text-white transition-colors">Visit</Link>
            <span aria-hidden="true" className="text-green-700">·</span>
            <span className="text-green-200">{town.name}</span>
          </nav>

          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-green-400 mb-3">
            Near you · {town.county}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] mb-4 max-w-3xl">
            {town.name} dispensary
            <span className="block text-green-300/90 font-semibold text-xl sm:text-2xl md:text-3xl mt-2">
              {STORE.name} · {town.driveMins} min from {town.name}
            </span>
          </h1>
          <p className="text-base sm:text-lg text-green-100/90 leading-relaxed max-w-2xl mb-7">
            {town.pitch}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl bg-green-400 hover:bg-green-300 text-green-950 font-bold text-sm transition-all shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2 focus-visible:ring-offset-green-950"
            >
              Browse menu
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/visit"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
            >
              Hours + directions
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

      {/* ── STAT TILES ──────────────────────────────────────────────────
          Three tiles below the hero — drive time / route / today's
          hours. Bigger numbers, white cards on stone bg (visible weight),
          grid-cols-2 stacks "Today's hours" tile below on phones so the
          eye lands on Drive time + Route first (the load-bearing facts
          for a customer scanning a near-town landing page).
      */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 mb-10 sm:mb-14 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-2xl bg-white border border-stone-200 shadow-sm px-4 sm:px-5 py-4">
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-green-700 mb-1.5">
              Drive time
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-stone-900 tabular-nums leading-none">
              {town.driveMins}
              <span className="text-base sm:text-lg font-semibold text-stone-500 ml-1">min</span>
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-stone-200 shadow-sm px-4 sm:px-5 py-4">
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-green-700 mb-1.5">
              Route
            </div>
            <div className="text-sm sm:text-base font-semibold text-stone-900 leading-snug">
              {town.highway}
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white border border-stone-200 shadow-sm px-4 sm:px-5 py-4">
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-green-700 mb-1.5">
              Open daily
            </div>
            <div className="text-sm sm:text-base font-semibold text-stone-900 tabular-nums leading-snug">
              {hoursSummaryStatic}
            </div>
          </div>
        </div>
      </section>

      {/* ── LONG-FORM LOCAL CONTEXT ─────────────────────────────────────
          Long-form section ABOVE the standard whyStop so Google sees the
          heavier body copy first. Prose width capped at max-w-2xl
          (~65ch) for comfortable reading on desktop — the previous
          max-w-3xl was a wall of text. Each paragraph break gets
          natural rhythm via prose-zinc + mb-5. Section h2 carries the
          SEO phrase ("Cannabis dispensary near {town}, WA") + an
          eyebrow above for visual hierarchy.
      */}
      {town.cityCopy && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-700 mb-2">
              About the drive
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mb-6 leading-tight">
              Cannabis dispensary near {town.name}, WA
            </h2>
            <div className="prose prose-stone prose-base sm:prose-lg max-w-none prose-p:text-stone-700 prose-p:leading-relaxed prose-p:mb-5 prose-strong:text-stone-900">
              {town.cityCopy.split("\n\n").map((para, i) => (
                <p key={i} {...(i === 0 ? { "data-speakable": "" } : {})}>{para}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── WHY STOP + STORE FACTS ──────────────────────────────────────
          Compact 2-section block: short whyStop paragraph + 4 fact
          chips (address / cash only / 21+ / ADA + parking) replacing
          the previous wall-of-text "We're at … on the Sunnyslope side
          …" prose. Chips render as a tight grid on desktop and stack
          on mobile.
      */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
        <div className="max-w-2xl mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-700 mb-2">
            Why stop in
          </p>
          <p className="text-base sm:text-lg text-stone-700 leading-relaxed">
            {town.whyStop}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-3xl">
          <div className="rounded-xl bg-white border border-stone-200 px-3 sm:px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Address</div>
            <div className="text-xs sm:text-sm font-semibold text-stone-900 leading-snug" data-speakable>
              {STORE.address.street}
            </div>
            <div className="text-xs text-stone-500 mt-0.5">Sunnyslope, Wenatchee</div>
          </div>
          <div className="rounded-xl bg-white border border-stone-200 px-3 sm:px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Payment</div>
            <div className="text-xs sm:text-sm font-semibold text-stone-900">Cash only</div>
            <div className="text-xs text-stone-500 mt-0.5">ATM in-store</div>
          </div>
          <div className="rounded-xl bg-white border border-stone-200 px-3 sm:px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">ID</div>
            <div className="text-xs sm:text-sm font-semibold text-stone-900">21+, gov ID</div>
            <div className="text-xs text-stone-500 mt-0.5">Out-of-state OK</div>
          </div>
          <div className="rounded-xl bg-white border border-stone-200 px-3 sm:px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Parking</div>
            <div className="text-xs sm:text-sm font-semibold text-stone-900">Free, out front</div>
            <div className="text-xs text-stone-500 mt-0.5">ADA accessible</div>
          </div>
        </div>
      </section>

      {/* ── CTA BAND ────────────────────────────────────────────────────
          Full-width green-950 CTA band matching the /visit + / "Ready
          to order?" pattern. Sticky-feeling, hard-to-miss prompt that
          gives the page a clear conversion endpoint. The previous
          emerald box was the only CTA and was visually equivalent to a
          callout — this band reads as the page's primary action.
      */}
      <section className="bg-green-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="max-w-md">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-400 mb-2">
                Driving over from {town.name}?
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 leading-tight">
                Order on the way, pick up when you arrive.
              </h2>
              <p className="text-green-200/80 text-sm sm:text-base leading-relaxed">
                Browse the live menu, place a pickup order, and we&apos;ll have it pulled and bagged. Cash only at the counter.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/menu"
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

      {/* ── ALSO NEARBY + OTHER TOWNS ───────────────────────────────────
          Two sister clusters sharing one section wrapper so the spacing
          stays coherent. Top cluster: hand-picked 2-3 neighbor towns
          from `town.notableNeighbors` (SSoT in lib/near-towns.ts)
          rendered with chevron + driveTime chip — anchors PageRank
          between geo-neighbors (the most-likely next-page for a visitor
          who arrived via a town-specific search). Bottom grid: full
          crawl-discovery surface for the rest of the NEAR_TOWNS network.
          Operator-direct headers, no marketing-speak. Sister scc v27.305.
      */}
      {(notableNearby.length > 0 || otherTowns.length > 0) && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          {notableNearby.length > 0 && (
            <div className="mb-8 sm:mb-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-700 mb-3">
                Also nearby
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {notableNearby.map((t) => (
                  <li key={t.slug}>
                    <Link
                      href={`/near/${t.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-xl bg-white border border-green-200 hover:border-green-500 hover:shadow-sm transition-all px-3 sm:px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span aria-hidden="true" className="text-green-700 shrink-0">›</span>
                        <span className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-green-800 transition-colors truncate">
                          {t.name}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 group-hover:bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-800 tabular-nums shrink-0 transition-colors">
                        {t.driveMins} min
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {otherTowns.length > 0 && (
            <div>
              <div className="mb-6 sm:mb-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-700 mb-2">
                  Other towns we serve
                </p>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
                  From everywhere in the valley
                </h2>
              </div>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {otherTowns.map((t) => (
                  <li key={t.slug}>
                    <Link
                      href={`/near/${t.slug}`}
                      className="group block rounded-xl bg-white border border-stone-200 hover:border-green-400 hover:shadow-sm transition-all px-3 sm:px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-green-800 transition-colors truncate">
                          {t.name}
                        </span>
                        <span className="text-xs font-semibold text-green-700 tabular-nums shrink-0">
                          {t.driveMins} min
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5 truncate">
                        {t.county}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
