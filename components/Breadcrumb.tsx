// Visible breadcrumb nav — paired with the page's existing BreadcrumbList
// JSON-LD so Google reads both the visual + structured-data signal
// (per /CODE/SEO_AUDIT_PUNCH_LIST_2026_05_14.md Tier-2 #7).
//
// Spec: Home › Section › Page with chevron separators (>).
// - Each segment is a <Link> except the current page (plain text).
// - text-sm, text-zinc-500, hover:text-zinc-700, mt-2 mb-4
// - Mobile-first touch targets >=44px wrapped in py-2.
// - Server component — pure render, no client JS.
//
// Used on /blog, /blog/[slug], /menu, /visit, /about, /press, /faq,
// /our-story, /find-your-strain, /deals, /deals/[id], /heroes,
// /heroes/[cohort], /community, /careers, /contact, /near (index),
// /accessibility, /health-data-policy, /terms-of-use, /apply, /vendor-access,
// /treasure-chest.
//
// NOT used on:
// - /near/[town] (has its own dark-hero breadcrumb — leave alone)
// - /brands (separate agent owns that surface)
// - /learn (already has its own visible breadcrumb; not lifted to keep diff minimal)

import Link from "next/link";

export type BreadcrumbItem = {
  /** Visible label rendered for the segment. */
  label: string;
  /** Href for the segment. Omit (or null) on the current/final page; that
   * segment renders as plain text with aria-current="page". */
  href?: string;
};

export type BreadcrumbProps = {
  /** Ordered list of segments. The component automatically prepends Home
   * unless the first item is already labelled "Home". */
  items: BreadcrumbItem[];
};

export function Breadcrumb({ items }: BreadcrumbProps) {
  // Auto-prepend Home unless caller already provided it as the first row.
  const hasHome = items.length > 0 && items[0].label.toLowerCase() === "home";
  const rows: BreadcrumbItem[] = hasHome ? items : [{ label: "Home", href: "/" }, ...items];

  return (
    <nav
      aria-label="Breadcrumb"
      className="max-w-7xl mx-auto px-4 sm:px-6 mt-2 mb-4 text-sm text-zinc-500"
    >
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-0">
        {rows.map((row, i) => {
          const isLast = i === rows.length - 1;
          return (
            <li key={`${row.label}-${i}`} className="flex items-center">
              {row.href && !isLast ? (
                <Link
                  href={row.href}
                  className="inline-flex items-center py-2 hover:text-zinc-700 transition-colors"
                >
                  {row.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="inline-flex items-center py-2 text-zinc-700"
                >
                  {row.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden="true" className="mx-1.5 text-zinc-400">
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
