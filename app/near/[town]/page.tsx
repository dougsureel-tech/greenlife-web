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

  const title = `${town.name} Dispensary — ${STORE.name}`;
  const desc = `${town.name} to ${STORE.name}: ${town.driveMins} min via ${town.highway}. ${town.pitch} Open daily 8 AM, cash only, 21+.`;

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
      title,
      description: desc,
      url: `${STORE.website}/near/${town.slug}`,
      siteName: STORE.name,
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
    "@id": `${STORE.website}/near/${town.slug}#business`,
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
  };

  // BreadcrumbList — Google renders the path under the SERP result
  // (Home › Visit › <town>) instead of just the URL string, which
  // earns 1-2% CTR per Search Console A/Bs. Mirrors the visible
  // breadcrumb nav rendered below.
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Visit", item: `${STORE.website}/visit` },
      { "@type": "ListItem", position: 3, name: town.name, item: `${STORE.website}/near/${town.slug}` },
    ],
  };

  const otherTowns = NEAR_TOWNS.filter((t) => t.slug !== town.slug);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-16 text-zinc-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
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
        <span className="text-zinc-700">{town.name}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
        {town.name} dispensary — {STORE.name}
      </h1>
      <p className="text-lg text-zinc-700 mb-6">{town.pitch}</p>

      <section className="grid grid-cols-2 gap-3 mb-8 text-sm">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
          <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Drive time</div>
          <div className="font-semibold">{town.driveMins} min</div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
          <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Route</div>
          <div className="font-semibold">{town.highway}</div>
        </div>
      </section>

      <section className="prose prose-zinc max-w-none mb-10">
        <p>{town.whyStop}</p>
        <p>
          We're at <strong>{STORE.address.full}</strong>, on the Sunnyslope side of Wenatchee. ATM in-store, free parking,
          ADA accessible. Cash only at the counter, but you can browse the live menu and place a pickup order before
          you head over.
        </p>
      </section>

      <section className="rounded-lg border-2 border-emerald-700 bg-emerald-50 p-5 mb-10">
        <div className="text-emerald-900 font-semibold mb-2">Driving in from {town.name}?</div>
        <p className="text-sm text-emerald-900/80 mb-4">
          Place a pickup order on the way — we'll have it pulled and ready when you arrive. Cash only at pickup.
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

      {otherTowns.length > 0 && (
        <section className="border-t border-zinc-200 pt-8">
          <h2 className="text-sm uppercase tracking-wider text-zinc-500 font-semibold mb-3">
            Other towns we serve
          </h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {otherTowns.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/near/${t.slug}`}
                  className="text-emerald-700 hover:underline"
                >
                  {t.name} ({t.driveMins} min)
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
