// Shared helper for /visit/from-<source> driver-side landing pages.
//
// The existing /visit/from-leavenworth (this stack) + /visit/from-seatac
// (SCC sister stack) share an identical structural shape:
//   - LocalBusiness + BreadcrumbList + Article JSON-LD trio
//   - markdown-lite renderer (in sister `visit-from-source-render.tsx`)
//   - hero / article / CTA layout (per-page; uses brand color tokens)
//
// This module is the **pure-data** half: type + URL builders + JSON-LD
// builders + WSLCB phrase scan. No JSX. Node's `--experimental-strip-types`
// can `--test` this file directly; the JSX renderer lives in the sister
// `visit-from-source-render.tsx`.
//
// WSLCB compliance: data builders are content-agnostic. Banned-phrase
// filtering happens at the data-author layer per WAC 314-55-155. Each
// new page author MUST keep efficacy / medical / promissory phrases out
// of headline + description + body. The existing /visit/from-leavenworth
// body is the reference voice — factual drive time, hours, what-to-bring,
// no claims.
//
// Sister of seattle-cannabis-web/lib/visit-from-source.ts.

import { STORE } from "./store.ts";

export type VisitFromSourceConfig = {
  /** URL slug (e.g. "cashmere"). Becomes `/visit/from-<slug>`. */
  slug: string;
  /** Display name for the source town/neighborhood (e.g. "Cashmere"). */
  sourceName: string;
  /** Page <h1> + opengraph + metadata title. */
  title: string;
  /** Page meta description + opengraph description. */
  description: string;
  /** Markdown-lite body. `## h2`, `- ul item`, `**bold**`, paragraph
   *  blocks. The same renderer ships across all /visit/from-<source>
   *  pages, so the body input shape is consistent. */
  body: string;
};

/** Returns canonical absolute URL for a /visit/from-<slug> page. */
export function visitFromSourceUrl(slug: string): string {
  return `${STORE.website}/visit/from-${slug}`;
}

/** BreadcrumbList JSON-LD for the 3-level path Home → Visit → From <Source>. */
export function visitFromSourceBreadcrumbLd(
  config: Pick<VisitFromSourceConfig, "slug" | "sourceName">,
): Record<string, unknown> {
  const url = visitFromSourceUrl(config.slug);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Visit", item: `${STORE.website}/visit` },
      {
        "@type": "ListItem",
        position: 3,
        name: `From ${config.sourceName}`,
        item: url,
      },
    ],
  };
}

/** Article JSON-LD reinforcing the entity-graph LocalBusiness @id. */
export function visitFromSourceArticleLd(
  config: Pick<VisitFromSourceConfig, "slug" | "title" | "description">,
): Record<string, unknown> {
  const url = visitFromSourceUrl(config.slug);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: config.title,
    description: config.description,
    inLanguage: "en-US",
    url,
    isPartOf: { "@id": `${STORE.website}/visit` },
    publisher: { "@id": `${STORE.website}/#dispensary` },
    about: { "@id": `${STORE.website}/#dispensary` },
  };
}

/** LocalBusiness JSON-LD with mainEntityOfPage pointing at this /visit/from-<slug>
 *  page. Reinforces the layout-level dispensary @id rather than declaring a new
 *  entity. Includes openingHoursSpecification (factual hours per WSLCB-license
 *  scope) so Google can surface "open now" + day-row hours in SERP rich result. */
export function visitFromSourceLocalBusinessLd(
  config: Pick<VisitFromSourceConfig, "slug">,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${STORE.website}/#dispensary`,
    mainEntityOfPage: { "@id": visitFromSourceUrl(config.slug) },
    name: STORE.name,
    url: STORE.website,
    address: {
      "@type": "PostalAddress",
      streetAddress: STORE.address.street,
      addressLocality: STORE.address.city,
      addressRegion: STORE.address.state,
      postalCode: STORE.address.zip,
      addressCountry: "US",
    },
    telephone: STORE.phoneTel,
    openingHoursSpecification: STORE.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.day,
      opens: h.open,
      closes: h.close,
    })),
  };
}

/** Returns the slug list for any consolidation-time `generateStaticParams`. */
export function visitFromSourceStaticParams(
  configs: readonly Pick<VisitFromSourceConfig, "slug">[],
): readonly { source: string }[] {
  return configs.map((c) => ({ source: c.slug }));
}

// ---- WSLCB compliance scan (for test-time regression pinning) ----

/** Banned-phrase corpus from WAC 314-55-155 — mirrors the set in
 *  `lib/hub-itemlist-json-ld.ts`. Test surfaces import this to confirm
 *  that no /visit/from-<source> page body trips a banned phrase. */
const WSLCB_BANNED_PHRASES: readonly RegExp[] = [
  /\btreats?\b/i,
  /\bcures?\b/i,
  /\bcured\b/i,
  /\brelieves?\b/i,
  /\brelieved\b/i,
  /\bheals?\b/i,
  /\bhealed\b/i,
  /\bhealing\b/i,
  /\bremed(?:y|ies)\b/i,
  /\bmedicine\b/i,
  /\bmedicinal\b/i,
  /\bprescription\b/i,
  /\bdiagnos(?:e|es|is)\b/i,
  /\bhelps?\s+with\s+(?:anxiety|depression|pain|insomnia|cancer|ptsd|sleep)\b/i,
];

/** Returns the list of banned phrases that appear in the input string.
 *  Empty array = WSLCB-compliant. Test surfaces assert empty. */
export function visitFromSourceWslcbScan(input: string): readonly string[] {
  const hits: string[] = [];
  for (const re of WSLCB_BANNED_PHRASES) {
    const match = input.match(re);
    if (match) hits.push(match[0]);
  }
  return hits;
}
