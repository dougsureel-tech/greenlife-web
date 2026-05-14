import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STORE } from "@/lib/store";
import { getDealById, getPickupEta, getCategoryPreviewProducts } from "@/lib/db";
import { withAttr } from "@/lib/attribution";
import { breadcrumbJsonLd, HOME_CRUMB } from "@/lib/breadcrumb-jsonld";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { Breadcrumb } from "@/components/Breadcrumb";

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
  // App-only deals — gate OG preview metadata so a shared link's unfurl
  // (Messages/Slack/Discord) doesn't leak the discount before install.
  // Same install-cookie gate as the page render below. Sister: scc v5.605.
  if (deal.appOnly) {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const isInstalled = cookieStore.get("glw_pwa_installed")?.value === "1";
    if (!isInstalled) {
      return {
        title: "Deal not found",
        robots: { index: false, follow: false },
      };
    }
  }
  // Auto-trunc deal.description to 157 + "…" when over Google ~160-char
  // mobile SERP cap. Some deal descriptions in the DB are 200-250 chars
  // (e.g. /deals/first-visit-30 = 250). The full description renders on
  // the deal page body — only the SERP meta gets trimmed.
  const rawDesc = deal.description ?? `${deal.short} at ${STORE.name} in ${STORE.address.city}, WA.`;
  // Entity-aware trim — Google measures the HTML-escaped length, not the JS
  // string length. Apostrophes (`'` → `&#x27;`, +5 chars) and ampersands
  // (`&` → `&amp;`, +4 chars) inflate the rendered <meta description> beyond
  // the JS-string trim. Pre-fix /deals/heroes-20 was 162 chars rendered (160
  // JS-trimmed but `&` inflated to 162 HTML). Sister of GW v2.94.95 same
  // bug class — memory pin: feedback_html_escape_inflates_meta_description_length.
  const escLen = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/'/g, "&#x27;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;").length;
  let desc = rawDesc;
  if (escLen(desc) > 160) {
    let trim = 157;
    for (let i = 0; i < 5; i++) {
      const candidate = rawDesc.slice(0, trim).trimEnd() + "…";
      if (escLen(candidate) <= 160) { desc = candidate; break; }
      trim -= 5;
    }
  }
  // Fixed 2026-05-10 — pre-fix `${deal.short} — ${deal.name}` rendered as
  // "X — X" because deal.short and deal.name are typically identical
  // strings in the DB ("Birthday Bud — 20% Off (Birthday Week) — Birthday
  // Bud — 20% Off (Birthday Week) | Green Life Cannabis" = 101 chars).
  // title.absolute bypasses the template suffix; brand kept once.
  // Caught by /loop cross-stack dynamic-title sweep.
  return {
    title: { absolute: `${deal.short} | ${STORE.name}` },
    description: desc,
    alternates: { canonical: `/deals/${deal.id}` },
    openGraph: {
      siteName: STORE.name,
      locale: "en_US",
      title: `${deal.short} | ${STORE.name}`,
      description: desc,
      url: `${STORE.website}/deals/${deal.id}`,
      type: "website",
      // Per-route OG at /deals/{id}/opengraph-image (file convention).
      // Sister T48 same fix class — DEFAULT_OG_IMAGE override made the
      // per-route file dead-code.
      images: [
        {
          url: `/deals/${deal.id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: deal.short,
        },
      ],
    },
  };
}

const STRAIN_DOT: Record<string, string> = {
  Sativa: "bg-red-400",
  Indica: "bg-purple-400",
  Hybrid: "bg-green-400",
};

export default async function DealDetailPage({ params }: Params) {
  const { id } = await params;
  const dealResult = await getDealById(id).catch(() => null);
  if (!dealResult) notFound();
  const deal = dealResult;

  // App-only deals — visible only to PWA-installed visitors. Pre-fix the
  // deep page hardcoded `appOnly: false` upstream, so a customer could
  // share /deals/<app-only-id> and a non-installed recipient could view
  // the full discount details, bypassing the install incentive that's
  // the whole point. Mirror of /deals page filter (which uses the same
  // glw_pwa_installed cookie via getActiveDeals({ includeAppOnly })).
  // Behavior: if deal.appOnly && no install cookie, 404 — same response
  // shape as a stale/expired share link. Sister: scc v5.605.
  if (deal.appOnly) {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const isInstalled = cookieStore.get("glw_pwa_installed")?.value === "1";
    if (!isInstalled) notFound();
  }

  // Now we know the deal exists, fetch the secondary data in parallel.
  // Skip preview when appliesTo isn't a single category — there's no
  // sensible filter to apply.
  const isScoped = !!deal.appliesTo && deal.appliesTo !== "all";
  const [eta, previewProducts] = await Promise.all([
    getPickupEta().catch(() => null),
    isScoped
      ? getCategoryPreviewProducts(deal.appliesTo as string, 6).catch(() => [])
      : Promise.resolve([]),
  ]);

  // CTA target depends on whether the deal is category-scoped:
  //  - appliesTo set: route to /order?category=X — /order reads URL params
  //    and pre-filters; Boost (/menu) ignores them, so a category deal-CTA
  //    pointing at /menu would land on the unfiltered embed.
  //  - appliesTo "all" / null: keep /menu (Boost) — full inventory browse.
  const linkHref = withAttr(
    isScoped
      ? `/order?category=${encodeURIComponent(deal.appliesTo as string)}`
      : "/menu",
    "deal",
    deal.id,
  );

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

  // BreadcrumbList — gives AI engines explicit nav graph: Home > Deals > <deal>
  const breadcrumbSchema = breadcrumbJsonLd([
    HOME_CRUMB,
    { name: "Deals", url: "/deals" },
    { name: deal.name, url: `/deals/${deal.id}` },
  ]);

  return (
    <div className="min-h-screen bg-stone-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(dealSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />

      <Breadcrumb items={[{ label: "Deals", href: "/deals" }, { label: deal.name }]} />

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
            <span aria-hidden="true">🔥 </span>Limited-time deal
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
            Best deal applies at the counter — you still earn loyalty points on the visit.
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

        {previewProducts.length > 0 && (
          // Live "what's actually in stock right now" preview. Customer
          // sees real product cards before committing to the click — fixes
          // the trust gap where /deals/[id] just promised "20% off flower"
          // with no proof anything was actually available. Sorted by
          // updated_at DESC in the query, so freshest SKUs surface first.
          <div className="mt-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-800">
                On sale right now
              </h2>
              <span className="text-[11px] text-stone-400">
                {previewProducts.length} of {deal.appliesTo}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {previewProducts.map((p) => (
                <Link
                  key={p.id}
                  href={linkHref}
                  className="group rounded-xl border border-stone-200 bg-white overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all"
                >
                  <div className="aspect-square bg-stone-100 overflow-hidden relative">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-stone-100 to-stone-200">
                        🌱
                      </div>
                    )}
                    {p.strainType && STRAIN_DOT[p.strainType] && (
                      <span
                        className={`absolute top-1.5 left-1.5 w-2 h-2 rounded-full ${STRAIN_DOT[p.strainType]} shadow-sm`}
                        aria-hidden
                      />
                    )}
                  </div>
                  <div className="px-2.5 py-2 space-y-0.5">
                    {p.brand && (
                      <div className="text-[9px] text-stone-400 font-bold uppercase tracking-wide truncate">
                        {p.brand}
                      </div>
                    )}
                    <div className="text-[12px] text-stone-800 leading-snug line-clamp-2 min-h-[2.4em] font-medium">
                      {p.name}
                    </div>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[12px] font-bold tabular-nums text-emerald-700">
                        {p.unitPrice != null ? `$${p.unitPrice.toFixed(2)}` : "—"}
                      </span>
                      {p.thcPct != null && (
                        <span className="text-[10px] text-stone-500 tabular-nums">
                          THC {p.thcPct.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <p className="text-[11px] text-stone-500 mt-3 text-center">
              Live in-stock. Tap any to filter the menu — discount applied at
              the counter.
            </p>
          </div>
        )}

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
