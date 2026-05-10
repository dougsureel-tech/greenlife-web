import { STORE } from "@/lib/store";

// BreadcrumbList JSON-LD helper. Gives Google + AI engines an explicit
// site graph for citation context — when an AI cites a deep page, the
// breadcrumb tells it the navigational path so the answer can frame
// "according to Green Life Cannabis > Brands > Avitas" instead of just
// "according to Green Life Cannabis."
//
// Returns the JSON object — wrap in `<script type="application/ld+json"
// dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(...)) }} />`
// at the page level. Crumbs are absolute-URL'd against STORE.website so
// the schema renders the same regardless of which canonical alias the
// page is served from.

export type Crumb = { name: string; url: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  // Stable @id derived from the LAST crumb's URL — this is the page the
  // breadcrumb is anchored to. Lets sibling JSON-LD nodes (Article,
  // SpecialAnnouncement, CollectionPage) reference the breadcrumb via
  // @id without duplicating the path. Pre-T91 every BreadcrumbList on
  // glw was a dangling node; same entity-graph @id linking pattern as
  // T85 (LocalBusiness) → T87 (Article) → T88 (WebSite) → T89 (HowTo +
  // FAQPage) → T90 (sureel) close-out.
  const last = crumbs[crumbs.length - 1];
  const lastAbs = last
    ? (last.url.startsWith("http") ? last.url : `${STORE.website}${last.url.startsWith("/") ? "" : "/"}${last.url}`)
    : STORE.website;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${lastAbs}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      // Always absolute — schema validators reject relative item URLs
      // when @id is missing. Build absolute against the canonical host
      // unless the caller already passed one.
      item: c.url.startsWith("http") ? c.url : `${STORE.website}${c.url.startsWith("/") ? "" : "/"}${c.url}`,
    })),
  };
}

// Convenience: the home crumb every page graph starts with.
export const HOME_CRUMB: Crumb = { name: STORE.name, url: "/" };
