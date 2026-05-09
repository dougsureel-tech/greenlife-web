import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { NEAR_TOWNS } from "@/lib/near-towns";
import { safeJsonLd } from "@/lib/json-ld-safe";

// /near — service-area index page. Hub for all /near/<town> subpages.
// Static, content driven from NEAR_TOWNS. Every town in the data file
// shows up here automatically.
//
// SEO play:
//   - ItemList JSON-LD listing all 14 towns → carousel-result eligible
//   - BreadcrumbList for SERP path rendering
//   - Strong internal-link hub feeding link equity to each /near/<town>

export const dynamic = "force-static";
export const revalidate = false;

export const metadata: Metadata = {
  title: "Service Area · Towns We Serve",
  description: `${STORE.name} serves ${NEAR_TOWNS.length} towns + neighborhoods across Chelan + Douglas + Okanogan + Grant counties — drive times, routes, and pickup-order info for each.`,
  alternates: { canonical: "/near" },
  keywords: [
    "Wenatchee Valley dispensary service area",
    "Chelan County cannabis store",
    "Douglas County dispensary",
    "Lake Chelan area dispensary",
    "Leavenworth area cannabis",
  ],
  openGraph: {
    title: `Service Area · ${STORE.name}`,
    description: `${STORE.name} serves ${NEAR_TOWNS.length} towns + neighborhoods across Chelan + Douglas + Okanogan + Grant counties.`,
    url: `${STORE.website}/near`,
    siteName: STORE.name,
    images: ["/opengraph-image"],
  },
};

export default function NearIndexPage() {
  // ItemList — Google may render this as a horizontal carousel under
  // a /near search result. Each item points to its /near/<town> page,
  // so the carousel deep-links into the matching geo-page directly.
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${STORE.name} service area`,
    description: `Towns + neighborhoods served by ${STORE.name} in the Wenatchee Valley + greater Chelan / Douglas counties.`,
    numberOfItems: NEAR_TOWNS.length,
    itemListElement: NEAR_TOWNS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${STORE.website}/near/${t.slug}`,
      name: t.name,
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Visit", item: `${STORE.website}/visit` },
      { "@type": "ListItem", position: 3, name: "Service area", item: `${STORE.website}/near` },
    ],
  };

  // Sort by drive time so the closest towns surface first.
  const sortedTowns = [...NEAR_TOWNS].sort((a, b) => a.driveMins - b.driveMins);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-16 text-zinc-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />

      <nav className="text-sm text-zinc-500 mb-4">
        <Link href="/" className="hover:underline">Home</Link>
        <span aria-hidden="true"> · </span>
        <Link href="/visit" className="hover:underline">Visit</Link>
        <span aria-hidden="true"> · </span>
        <span className="text-zinc-700">Service area</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
        Towns we serve
      </h1>
      <p className="text-lg text-zinc-700 mb-8">
        {STORE.name} sits in Sunnyslope, Wenatchee — the natural stop for {NEAR_TOWNS.length}{" "}
        towns + neighborhoods across Chelan, Douglas, Okanogan, and Grant counties. Each
        page below has the route, drive time, and what locals from that town typically come
        in for.
      </p>

      <ul className="grid sm:grid-cols-2 gap-3 mb-10">
        {sortedTowns.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/near/${t.slug}`}
              className="block rounded-lg border border-zinc-200 bg-zinc-50 hover:border-emerald-700 hover:bg-emerald-50 px-4 py-3 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-zinc-900">{t.name}</span>
                <span className="text-xs text-zinc-500 whitespace-nowrap">
                  {t.driveMins === 0 ? "On-site" : `${t.driveMins} min`}
                </span>
              </div>
              <div className="text-xs text-zinc-500 mt-1">{t.county}</div>
            </Link>
          </li>
        ))}
      </ul>

      <section className="rounded-lg border-2 border-emerald-700 bg-emerald-50 p-5">
        <div className="text-emerald-900 font-semibold mb-2">Don&apos;t see your town?</div>
        <p className="text-sm text-emerald-900/80 mb-4">
          We get visitors from across Eastern Washington. If you&apos;re driving in,{" "}
          <Link href="/visit" className="underline hover:no-underline">/visit</Link> has
          the address, parking, and ID requirements; <Link href="/menu" className="underline hover:no-underline">/menu</Link>{" "}
          has the live inventory.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/menu"
            className="inline-block rounded-md bg-emerald-700 hover:bg-emerald-600 px-5 py-2 text-white font-semibold text-sm transition-colors"
          >
            Browse menu →
          </Link>
          <Link
            href="/visit"
            className="inline-block rounded-md border border-emerald-700 hover:bg-emerald-100 px-5 py-2 text-emerald-700 font-semibold text-sm transition-colors"
          >
            Hours + directions
          </Link>
        </div>
      </section>
    </main>
  );
}
