import type { Metadata } from "next";
import Link from "next/link";
import { STORE, isOpenNow, nextOpenLabel, minutesUntilClose } from "@/lib/store";
import { getActiveDeals, type ActiveDeal } from "@/lib/db";
import { DealCountdown } from "@/components/DealCountdown";
import { computeDealCountdown } from "@/lib/deal-countdown";
import { DealArt } from "@/components/DealArt";
import { matchDealVendor } from "@/lib/deal-vendor-match";
import { withAttr } from "@/lib/attribution";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  // Root layout's title.template wraps this with " | <STORE.name>", so don't
  // include the brand here — was rendering "... | Green Life Cannabis | Green Life Cannabis".
  title: "Cannabis Deals & Specials",
  description: `Live cannabis deals at ${STORE.name} in ${STORE.address.city}, WA. Daily specials on flower, edibles, vapes, and concentrates — all WA-WSLCB-compliant percent-off and dollar-off promotions.`,
  alternates: { canonical: "/deals" },
  openGraph: {
    title: `Cannabis Deals | ${STORE.name}`,
    description: `Live deals at ${STORE.name}. ${STORE.address.full}.`,
    url: `${STORE.website}/deals`,
    type: "website",
    // Explicit reference to the root opengraph-image.tsx route — without it,
    // page-level openGraph fully replaces the parent's auto-injected images
    // and Facebook/Slack/Messages share previews come up imageless.
    images: ["/opengraph-image"],
  },
};

// Schema.org Offer per running deal — feeds AI engines (ChatGPT/Perplexity)
// and Google rich-results so "are there deals at Green Life today" gets a
// real, current answer instead of the blog-scraped guess. Per-deal expires
// off the row's end_date so the offer sunsets on its own.
function dealsOfferSchema(deals: ActiveDeal[]) {
  if (deals.length === 0) return null;
  return deals.map((d) => ({
    "@context": "https://schema.org",
    "@type": "Offer",
    "@id": `${STORE.website}/deals#${d.id}`,
    url: `${STORE.website}/deals/${d.id}`,
    name: d.name,
    description: d.description ?? d.short,
    category: d.appliesTo && d.appliesTo !== "all" ? d.appliesTo : "Cannabis",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    eligibleRegion: { "@type": "Country", name: "United States" },
    seller: {
      "@type": "Store",
      name: STORE.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: STORE.address.street,
        addressLocality: STORE.address.city,
        addressRegion: STORE.address.state,
        postalCode: STORE.address.zip,
        addressCountry: "US",
      },
    },
    ...(d.discountType === "percent" && d.discountValue
      ? {
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            valueAddedTaxIncluded: true,
            priceComponentType: "https://schema.org/Discount",
            price: d.discountValue,
            priceCurrency: "USD",
          },
        }
      : {}),
    validFrom: new Date().toISOString(),
    ...(d.endDate ? { validThrough: `${d.endDate}T23:59:59-08:00` } : {}),
  }));
}

type Props = { searchParams: Promise<{ cat?: string }> };

// Order matters — these are the chip labels in render order. "All" first
// so the default state always reads as "showing everything." Categories
// derived from the deal.appliesTo bucket labels we set in /admin/deals.
const FILTER_CATS = ["flower", "pre-rolls", "vapes", "concentrates", "edibles"] as const;
type FilterCat = (typeof FILTER_CATS)[number];

function normalizeCat(cat: string | null): FilterCat | "all" {
  const v = (cat ?? "").toLowerCase();
  if (FILTER_CATS.includes(v as FilterCat)) return v as FilterCat;
  return "all";
}

export default async function DealsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const activeFilter = normalizeCat(sp.cat ?? null);
  const allDeals = await getActiveDeals().catch(() => []);
  const deals =
    activeFilter === "all"
      ? allDeals
      : allDeals.filter((d) => normalizeCat(d.appliesTo) === activeFilter);
  const offerSchema = dealsOfferSchema(deals);

  // Per-category counts — drives the chip badges so customers know which
  // filters have content vs which would land them on an empty state.
  const catCounts: Record<FilterCat | "all", number> = {
    all: allDeals.length,
    flower: 0,
    "pre-rolls": 0,
    vapes: 0,
    concentrates: 0,
    edibles: 0,
  };
  for (const d of allDeals) {
    const c = normalizeCat(d.appliesTo);
    if (c !== "all") catCounts[c] += 1;
  }

  const open = isOpenNow();
  const statusLabel = nextOpenLabel();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "America/Los_Angeles",
  });
  const todayHours = STORE.hours.find((h) => h.day === today);
  const minsLeft = minutesUntilClose();
  const closingSoon = minsLeft != null && minsLeft <= 90 && minsLeft > 0;

  return (
    <div className="min-h-screen bg-stone-50">
      {offerSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(offerSchema) }}
        />
      )}

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      {/* Mirrors homepage hero (commit 6fcaf1e): green-950 base + radial
          green-400 glow + DEALS eyebrow + 7xl headline. Right-side card
          carries the live deals counter and store hours / closes-in
          urgency; collapses into a thin status bar on mobile. */}
      <section className="relative bg-green-950 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 80% at 15% 50%, #14532d44, transparent), radial-gradient(ellipse 50% 60% at 90% 20%, #16a34a22, transparent)",
          }}
        />
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] opacity-10 translate-x-1/4 -translate-y-1/4 pointer-events-none"
          style={{ background: "radial-gradient(circle, #4ade80, transparent 70%)" }}
        />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-14 sm:py-20 lg:py-24">
          <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16">
            {/* Left: hero copy */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-green-300/80">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_#fb7185] animate-pulse"
                    aria-hidden
                  />
                  Deals
                </span>
                <span className="text-green-400/60 text-xs font-medium uppercase tracking-widest">
                  {STORE.address.city}, WA
                </span>
              </div>

              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
                  Today&apos;s Deals at{" "}
                  <span className="text-green-300">{STORE.name}</span>
                </h1>
                <p className="text-green-100/70 text-base sm:text-lg leading-relaxed max-w-xl mt-5">
                  Stack with loyalty · cash only · 21+ ID required. Updated continuously from the
                  live menu — WSLCB-compliant percent-off and dollar-off only, never below cost.
                </p>
              </div>

              {/* Mobile-only status strip — collapses the right-side info card
                  onto a single bar above the deal list on small screens. Has
                  to live here (left column on desktop, full-width on mobile)
                  so it sits between the headline and the deal list when the
                  layout stacks. Hidden on lg+ where the right card takes over. */}
              <div className="lg:hidden flex flex-wrap items-center gap-2 text-xs">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold border ${
                    open
                      ? "bg-green-400/15 border-green-400/30 text-green-300"
                      : "bg-red-400/15 border-red-400/30 text-red-300"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${open ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
                    aria-hidden
                  />
                  {open ? "Open Now" : "Closed"}
                  {todayHours && (
                    <span className="opacity-70 font-normal">
                      {" "}
                      · {todayHours.open}–{todayHours.close}
                    </span>
                  )}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold bg-amber-300/10 border border-amber-300/30 text-amber-200">
                  <span aria-hidden>🎟️</span>
                  {deals.length} deal{deals.length === 1 ? "" : "s"} running right now
                </span>
                {closingSoon && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold bg-rose-300/10 border border-rose-300/30 text-rose-200">
                    Closes in {minsLeft} min
                  </span>
                )}
              </div>
            </div>

            {/* Right: live deals + hours card. Desktop-only so the mobile
                strip above doesn't double up. 360px wide, same visual weight
                as the homepage hero card so stores feel coherent across
                routes. */}
            <div className="hidden lg:block shrink-0">
              <div
                className="rounded-3xl border border-white/15 p-7 w-[360px] space-y-5"
                style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(14px)" }}
              >
                {/* Deals counter — the headline number for this page. */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-300/80">
                    Live now
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold text-white tabular-nums leading-none">
                      {deals.length}
                    </span>
                    <span className="text-white/70 text-sm font-semibold">
                      deal{deals.length === 1 ? "" : "s"} running right now
                    </span>
                  </div>
                </div>

                <div className="h-px bg-white/10" />

                {/* Live status — same pattern as homepage hero, kept minimal
                    here so the deal counter stays the headline. */}
                <div className="flex items-center gap-3">
                  <span
                    className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                      open
                        ? "bg-green-400 shadow-[0_0_10px_#4ade80] animate-pulse"
                        : "bg-red-400"
                    }`}
                    aria-hidden
                  />
                  <div>
                    <div className="text-white font-extrabold text-sm leading-tight">
                      {open ? "Open Now" : "Closed"}
                      {statusLabel && (
                        <span className="text-green-200/80 font-semibold">
                          {" · "}
                          {statusLabel}
                        </span>
                      )}
                    </div>
                    {todayHours && (
                      <div className="text-green-300/70 text-[11px] mt-0.5">
                        Today {todayHours.open} – {todayHours.close}
                      </div>
                    )}
                  </div>
                </div>

                {/* Closes-in-Xh urgency block — only appears when the store
                    is within 90 minutes of close. Keeps customers on the
                    deals page from missing the window. */}
                {closingSoon && (
                  <div className="rounded-xl bg-rose-500/15 border border-rose-400/30 px-3.5 py-3 text-rose-100">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-rose-200">
                      Closing soon
                    </div>
                    <div className="text-base font-extrabold mt-0.5">
                      {minsLeft} min until close
                    </div>
                    <div className="text-[11px] text-rose-200/80 mt-1 leading-snug">
                      Last online order is 15 min before close. Cash on you, ID ready, swing by.
                    </div>
                  </div>
                )}

                <div className="h-px bg-white/10" />

                {/* Loyalty + cash + ID quick-reference. Same chip style as
                    homepage hero card so the cross-page feel is unified. */}
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-3">
                  {[
                    { icon: "🎁", text: "Loyalty stacks" },
                    { icon: "💵", text: "Cash only" },
                    { icon: "🪪", text: "21+ Required" },
                    { icon: "🅿️", text: "Free Parking" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-white/65 text-xs">
                      <span className="text-base leading-none">{icon}</span>
                      {text}
                    </div>
                  ))}
                </div>

                <a
                  href={STORE.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-sm font-bold transition-all"
                >
                  Get Directions ↗
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade into the card list. Same gradient as the homepage hero
            so the section transition reads as one continuous surface. */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-stone-50 to-transparent" />
      </section>

      {/* ─── Category filter chips ────────────────────────────────────────── */}
      {/* Only render chips if we actually have multiple categories on tap.
          Otherwise the row is decoration without value. */}
      {allDeals.length > 1 && (
        <section className="border-b border-stone-200 bg-white sticky top-0 z-20 backdrop-blur-md bg-white/90">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
            {(["all", ...FILTER_CATS] as const).map((cat) => {
              const count = catCounts[cat];
              const isActive = activeFilter === cat;
              const isEmpty = count === 0;
              const href = cat === "all" ? "/deals" : `/deals?cat=${cat}`;
              return (
                <Link
                  key={cat}
                  href={href}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                    isActive
                      ? "bg-emerald-700 text-white shadow-sm"
                      : isEmpty
                        ? "bg-stone-100 text-stone-400 cursor-default pointer-events-none"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {cat === "all" ? "All deals" : cat}
                  <span
                    className={`text-[10px] tabular-nums px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-emerald-900/40 text-emerald-100"
                        : isEmpty
                          ? "bg-stone-200 text-stone-400"
                          : "bg-stone-200 text-stone-600"
                    }`}
                  >
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── Deal list / empty state ──────────────────────────────────────── */}
      {deals.length === 0 ? (
        <section className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
          {/* Empty state — calm, not apologetic. Filter-aware: when a
              category filter zeros out, point back to all deals before the
              loyalty-everyday-value fallback. */}
          <div className="rounded-3xl border border-stone-200 bg-white p-8 sm:p-10 text-center shadow-sm">
            <div className="text-4xl mb-4" aria-hidden>
              🌿
            </div>
            {activeFilter !== "all" && allDeals.length > 0 ? (
              <>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                  No <span className="capitalize">{activeFilter}</span> deals right now.
                </h2>
                <p className="text-stone-600 mt-3 max-w-md mx-auto leading-relaxed">
                  We have {allDeals.length} other deal{allDeals.length === 1 ? "" : "s"} running
                  — pop the filter off to see them.
                </p>
                <Link
                  href="/deals"
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition-colors shadow-sm"
                >
                  See all deals →
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                  No deals today — but loyalty stacks every day.
                </h2>
                <p className="text-stone-600 mt-3 max-w-md mx-auto leading-relaxed">
                  100 points = $1 off at the counter, on top of any everyday-low pricing. Browse
                  the live menu — we&apos;ll have what you&apos;re after.
                </p>
                <Link
                  href="/menu"
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-green-700 hover:bg-green-600 text-white font-bold transition-colors shadow-sm"
                >
                  Browse the menu →
                </Link>
              </>
            )}
            <p className="text-xs text-stone-500 mt-5">
              Cash only · 21+ with valid ID · {STORE.address.full}
            </p>
          </div>
        </section>
      ) : (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-5">
          {deals.map((d, i) => {
            const vendor = matchDealVendor(d.name, d.description);
            const initial = computeDealCountdown(d.endDate);
            const isFirst = i === 0;
            // CTA target: per `feedback_customer_ctas_point_to_menu_only.md`,
            // the View on menu primary always points at /menu (Boost embed).
            // The deal title remains a Link to the per-deal deep page so SMS
            // shares still hit a focused landing.
            return (
              <article
                key={d.id}
                className={`group rounded-2xl border bg-white overflow-hidden transition-all hover:shadow-xl hover:-translate-y-0.5 ${
                  isFirst
                    ? "border-emerald-300 shadow-md ring-1 ring-emerald-100"
                    : "border-stone-200 hover:border-emerald-300"
                }`}
              >
                {/* Wide bud-art hero strip — vendor photo + logo card when
                    we recognize the brand, category-themed gradient when we
                    don't. Mirrors the visual language of the dialed-in
                    /brands/[slug] pages so the surface feels coherent. */}
                <DealArt
                  vendor={vendor}
                  appliesTo={d.appliesTo}
                  short={d.short}
                  paletteAccent="green"
                />

                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isFirst && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-600 text-white uppercase tracking-wide">
                        Ending Soonest
                      </span>
                    )}
                    <DealCountdown
                      endDate={d.endDate}
                      initialLabel={initial.label}
                      initialUrgent={initial.urgent}
                    />
                  </div>

                  <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight leading-tight">
                    <Link
                      href={`/deals/${d.id}`}
                      className="hover:text-emerald-800 transition-colors"
                    >
                      {d.name}
                    </Link>
                  </h2>

                  {d.description && (
                    <p className="mt-2 text-stone-600 text-sm leading-relaxed">
                      {d.description}
                    </p>
                  )}

                  {/* Qualifier badges. "Stacks with loyalty" is universally
                      true at Green Life (loyalty applies at the counter
                      regardless of deal); the first-time-customer 15% off
                      chip surfaces only on the lead deal so it doesn't get
                      repeated noise. */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200">
                      Stacks with loyalty
                    </span>
                    {isFirst && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold bg-amber-50 text-amber-800 ring-1 ring-amber-200">
                        First-time customer · 15% off
                      </span>
                    )}
                    {d.appliesTo && d.appliesTo !== "all" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold bg-stone-50 text-stone-700 ring-1 ring-stone-200 capitalize">
                        {d.appliesTo}
                      </span>
                    )}
                    {vendor && (
                      <Link
                        href={withAttr(`/brands/${vendor.slug}`, "deals-card", `${d.id}-vendor`)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold bg-stone-900 text-white hover:bg-stone-700 transition-colors"
                      >
                        Shop {vendor.displayName} →
                      </Link>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Link
                      href={withAttr("/menu", "deals-card", d.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold text-sm transition-colors shadow-sm"
                    >
                      View on menu →
                    </Link>
                    <Link
                      href={`/deals/${d.id}`}
                      className="text-sm font-semibold text-emerald-800 hover:text-emerald-600 transition-colors"
                    >
                      Deal details
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}

          {/* Footer CTA — single source of "go shop" so the page funnels
              cleanly into the menu Boost embed. Cash + ID reminder kept here
              instead of repeated on every card. */}
          <div className="pt-6 text-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-green-800 hover:bg-green-700 text-white font-bold text-base transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Browse the full menu →
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
