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
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
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
