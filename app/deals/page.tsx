import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { getActiveDeals } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: `Cannabis Deals & Specials | ${STORE.name}`,
  description: `Live cannabis deals at ${STORE.name} in ${STORE.address.city}, WA. Daily specials on flower, edibles, vapes, and concentrates — all WA-WSLCB-compliant percent-off and dollar-off promotions.`,
  alternates: { canonical: "/deals" },
  openGraph: {
    title: `Cannabis Deals | ${STORE.name}`,
    description: `Live deals at ${STORE.name}. ${STORE.address.full}.`,
    url: `${STORE.website}/deals`,
    type: "website",
  },
};

function fmtEndDate(iso: string | null): string {
  if (!iso) return "Ongoing";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default async function DealsPage() {
  const deals = await getActiveDeals().catch(() => []);

  // SEO: Each deal becomes a SpecialAnnouncement so AI engines and Google's
  // local-pack carry the promo text verbatim. Limited-time deals win here.
  const dealsSchema = deals.length > 0 ? deals.map((d) => ({
    "@context": "https://schema.org",
    "@type": "SpecialAnnouncement",
    "@id": `${STORE.website}/deals#${d.id}`,
    name: d.name,
    text: d.description ?? d.short,
    category: "https://www.wikidata.org/wiki/Q1622659", // discount/sale
    spatialCoverage: { "@id": `${STORE.website}/#dispensary` },
    ...(d.endDate ? { datePosted: new Date().toISOString(), expires: `${d.endDate}T23:59:59-08:00` } : {}),
  })) : [];

  return (
    <div className="min-h-screen bg-stone-50">
      {dealsSchema.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dealsSchema) }} />
      )}

      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-green-800 to-teal-900 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #fff 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">🔥 Live Deals</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight">
            What&apos;s on sale right now.
          </h1>
          <p className="mt-3 text-emerald-100/80 max-w-md mx-auto">
            Updated continuously from our live menu. WSLCB-compliant — percent-off and dollar-off only, never below cost.
          </p>
        </div>
      </section>

      {deals.length === 0 ? (
        <section className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="text-5xl mb-4">🌿</div>
          <h2 className="text-xl font-bold text-stone-900">No active deals right now.</h2>
          <p className="text-stone-600 mt-2">
            Check back soon — or browse our everyday-low prices on the menu.
          </p>
          <Link
            href="/menu"
            className="mt-6 inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold transition-colors shadow-sm"
          >
            Browse the menu →
          </Link>
        </section>
      ) : (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-4">
          {deals.map((d, i) => {
            const linkHref = d.appliesTo && d.appliesTo !== "all"
              ? `/menu?category=${encodeURIComponent(d.appliesTo)}`
              : "/menu";
            const isFirst = i === 0;
            return (
              <Link
                key={d.id}
                href={linkHref}
                className={`block rounded-2xl border bg-white p-5 sm:p-6 hover:shadow-lg transition-all ${
                  isFirst ? "border-emerald-300 shadow-md ring-1 ring-emerald-100" : "border-stone-200 hover:border-emerald-300"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    isFirst ? "bg-emerald-100" : "bg-stone-100"
                  }`}>
                    🔥
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-bold text-stone-900">{d.name}</h2>
                      {isFirst && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-600 text-white uppercase tracking-wide">
                          Ending Soonest
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-stone-600 text-sm">{d.description ?? d.short}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <span className="font-bold text-emerald-700">{d.short}</span>
                      <span className="text-stone-500">
                        Ends: <span className="font-semibold text-stone-700">{fmtEndDate(d.endDate)}</span>
                      </span>
                      {d.appliesTo && d.appliesTo !== "all" && (
                        <span className="text-stone-500 capitalize">
                          On: <span className="font-semibold text-stone-700">{d.appliesTo}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="hidden sm:inline shrink-0 text-emerald-700 font-bold text-sm">
                    Browse →
                  </span>
                </div>
              </Link>
            );
          })}

          <div className="pt-6 text-center">
            <Link
              href="/order"
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold transition-colors shadow-sm"
            >
              Order for pickup →
            </Link>
            <p className="text-xs text-stone-500 mt-3">
              Cash only · 21+ with valid ID · {STORE.name}, {STORE.address.full}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
