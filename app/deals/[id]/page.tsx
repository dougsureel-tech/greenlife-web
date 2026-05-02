import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STORE } from "@/lib/store";
import { getDealById, getPickupEta } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Single-deal deep page. Built for SMS-shareable links — copy a /deals/<id>
// URL, drop it in Messages, the recipient sees a real OG preview and lands
// on a focused page with a single CTA into /menu (filtered to the deal's
// category if applicable). 404s when the deal is expired or revoked so a
// stale forward never shows a dead promo.

type Params = { params: Promise<{ id: string }> };

function fmtEndDate(iso: string | null): string {
  if (!iso) return "Ongoing";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const deal = await getDealById(id).catch(() => null);
  if (!deal) {
    return {
      title: "Deal not found",
      robots: { index: false, follow: false },
    };
  }
  const desc = deal.description ?? `${deal.short} at ${STORE.name} in ${STORE.address.city}, WA.`;
  return {
    title: `${deal.short} — ${deal.name}`,
    description: desc,
    alternates: { canonical: `/deals/${deal.id}` },
    openGraph: {
      title: `${deal.short} | ${STORE.name}`,
      description: desc,
      url: `${STORE.website}/deals/${deal.id}`,
      type: "website",
      images: ["/opengraph-image"],
    },
  };
}

export default async function DealDetailPage({ params }: Params) {
  const { id } = await params;
  const [deal, eta] = await Promise.all([
    getDealById(id).catch(() => null),
    getPickupEta().catch(() => null),
  ]);
  if (!deal) notFound();

  // CTA target depends on whether the deal is category-scoped:
  //  - appliesTo set: route to /order?category=X — /order reads URL params
  //    and pre-filters; Boost (/menu) ignores them, so a category deal-CTA
  //    pointing at /menu would land on the unfiltered embed.
  //  - appliesTo "all" / null: keep /menu (Boost) — full inventory browse.
  const linkHref =
    deal.appliesTo && deal.appliesTo !== "all"
      ? `/order?category=${encodeURIComponent(deal.appliesTo)}`
      : "/menu";

  // Per-deal SpecialAnnouncement schema — same shape as the index but
  // canonicalized to this deep URL so an SMS share gets richer Google/AI
  // surfacing than the generic /deals page.
  const dealSchema = {
    "@context": "https://schema.org",
    "@type": "SpecialAnnouncement",
    "@id": `${STORE.website}/deals/${deal.id}`,
    name: deal.name,
    text: deal.description ?? deal.short,
    category: "https://www.wikidata.org/wiki/Q1622659",
    spatialCoverage: { "@id": `${STORE.website}/#dispensary` },
    ...(deal.endDate
      ? { datePosted: new Date().toISOString(), expires: `${deal.endDate}T23:59:59-08:00` }
      : {}),
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dealSchema) }}
      />

      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-green-800 to-teal-900 text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1.5px, transparent 1.5px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
            🔥 Limited-time deal
          </p>
          <h1 className="mt-3 text-5xl sm:text-6xl font-extrabold tracking-tight leading-none">
            {deal.short}
          </h1>
          <p className="mt-4 text-2xl sm:text-3xl font-bold text-emerald-100">{deal.name}</p>
          {deal.description && (
            <p className="mt-4 text-emerald-100/85 max-w-md mx-auto text-base sm:text-lg">
              {deal.description}
            </p>
          )}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-semibold">
            <span className="text-emerald-200">Ends:</span>
            <span>{fmtEndDate(deal.endDate)}</span>
          </div>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="rounded-2xl bg-white border border-stone-200 shadow-sm p-6 sm:p-8 text-center">
          {eta && (
            // Live queue depth → bucketed wait label so the customer knows
            // walking-in-now expectations alongside the deal. Bucketed
            // because precise ETAs are fake confidence (we don't track
            // per-order processing time).
            <p className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold uppercase tracking-wide text-emerald-800">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                <circle cx="12" cy="12" r="9" />
              </svg>
              {eta.label}
            </p>
          )}
          <p className="text-sm text-stone-600 mb-5">
            Stackable with loyalty points at the counter — 100 pts = $1 off.
          </p>
          <Link
            href={linkHref}
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold text-base transition-colors shadow-sm w-full sm:w-auto"
          >
            Browse the menu →
          </Link>
          <p className="text-xs text-stone-500 mt-4">
            Cash only · 21+ with valid ID · {STORE.name}, {STORE.address.full}
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/deals"
            className="text-sm font-semibold text-stone-600 hover:text-stone-900"
          >
            ← All active deals
          </Link>
        </div>
      </section>
    </div>
  );
}
