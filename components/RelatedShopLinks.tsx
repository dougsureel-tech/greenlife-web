import Link from "next/link";
import { BRAND_COPY } from "@/lib/brand-copy";

// Related-shop footer block — renders at the bottom of /learn/[slug] +
// /blog/[slug] pages to pipe PageRank from educational long-tail to
// commercial-intent brand + strain pages. SEO audit 2026-05-17 identified
// these templates as link-sparse (1-2 hrefs each to a 60-77 brand graph).
//
// Brand picks: top 5 alphabetical from BRAND_COPY with both tagline AND
// logoUrl set (filters out half-populated entries). Strain picks: 3
// canonical type pages (sativa / indica / hybrid).
//
// Copy by comms-expert 2026-05-17 (V1):
//   Eyebrow: WHAT'S ON OUR FLOOR
//   H2: Brands and strains we actually carry.
//   Intro (per-stack):
//     glw — "Twelve years on Center Road buys you a short list of growers we trust. Start with these."
//     scc — "We've been at this in Seattle since 2010. These are the growers and types we keep coming back to."
//
// WAC 314-55-155 safe: no medical claims, no "best for X", no inducement.

const BRAND_PICK_COUNT = 5;
const STRAIN_TYPES = [
  { slug: "sativa", label: "Sativa", blurb: "Energizing, daytime, often higher THC." },
  { slug: "indica", label: "Indica", blurb: "Body-relaxing, often nighttime." },
  { slug: "hybrid", label: "Hybrid", blurb: "Crosses — can lean either way." },
] as const;

function pickBrands() {
  return Object.values(BRAND_COPY)
    .filter((b) => b.tagline && b.logoUrl)
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .slice(0, BRAND_PICK_COUNT);
}

export function RelatedShopLinks() {
  const brands = pickBrands();
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-10 sm:pb-14">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400 mb-2">
        What's on our floor
      </p>
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-3">
        Brands and strains we actually carry.
      </h2>
      <p className="text-zinc-300 leading-relaxed mb-5 max-w-xl">
        Twelve years on Center Road buys you a short list of growers we trust. Start with these.
      </p>

      {brands.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {brands.map((b) => (
            <li key={b.slug}>
              <Link
                href={`/brands/${b.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-zinc-800 hover:border-emerald-700 bg-zinc-900/40 hover:bg-zinc-900 px-4 py-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                {b.logoUrl ? (
                  // Plain img — small inline logo, no Next/Image overhead
                  // worth it for a footer-block thumbnail. Decorative + the
                  // brand name carries the link semantic.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.logoUrl}
                    alt=""
                    aria-hidden="true"
                    className="h-8 w-8 shrink-0 rounded-md object-contain bg-white/90 p-1"
                  />
                ) : null}
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-zinc-100 group-hover:text-white truncate">
                    {b.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </div>
                  {b.tagline ? (
                    <div className="text-[11px] text-zinc-400 group-hover:text-zinc-300 truncate">
                      {b.tagline}
                    </div>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400 mb-2">
        Browse by type
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {STRAIN_TYPES.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/strains/${t.slug}`}
              className="group block h-full rounded-xl border border-zinc-800 hover:border-emerald-700 bg-zinc-900/40 hover:bg-zinc-900 px-4 py-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <div className="text-sm font-semibold text-zinc-100 group-hover:text-white">
                {t.label}
              </div>
              <div className="text-[11px] text-zinc-400 group-hover:text-zinc-300">
                {t.blurb}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
