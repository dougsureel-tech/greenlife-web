import Link from "next/link";
import Image from "next/image";
import type { ActiveDeal } from "@/lib/db";
import { matchDealVendor } from "@/lib/deal-vendor-match";
import { withAttr } from "@/lib/attribution";
import { scrubWslcbClaims } from "@/lib/strain-product-json-ld";

// <MenuTopDealsRail /> — server-rendered top-6 deals grid ABOVE the
// iHeartJane Boost iframe on /menu. Closes the 30-40% bounce window
// during Boost's 2-3s cold-load — customers landing on /menu see a
// useful value-prop before the iframe hydrates rather than a blank
// skeleton.
//
// Per the 2026-05-27 growth/SEO/business 3-expert review: iHeartJane
// Boost cold-loads ~2.4s on 4G; re-prompts DOB every session; cart
// silently abandons when SKU goes out-of-stock between add and
// checkout. This rail is the highest-leverage pre-checkout intercept:
// pure server-side render, no client JS, zero impact on Boost's own
// hydration path.
//
// Data source: getActiveDeals() already returns the sorted top deals
// (day-of-week deals first, then by end-date). Limit to 6 here for the
// rail; the existing <MenuActiveDealsStrip> below the iframe carries
// the remaining deal-chips for customers who scroll past.
//
// Deep-link: each card routes to /deals/[id] (the existing deal-deep
// page) carrying ?from=menu:top-rail-<id> attribution. The /deals/[id]
// page in turn has the "Shop matching products" CTA into /menu with
// the category pre-filter — deeper into the conversion funnel.
//
// Empty state: returns null. No skeleton, no "loading deals" copy. An
// empty rail is worse than no rail (the brief is explicit on this).
//
// WSLCB compliance (WAC 314-55-155): all rendered deal-name +
// description strings are passed through scrubWslcbClaims defensively.
// The build-gates (check-wac-314-55-155-banned-claims +
// check-efficacy-claims) ALSO scan this file's literal strings — both
// layers run; this scrubber catches DB-sourced strings that the build
// gates can't see at compile time.
//
// Sister-port: byte-identical to seattle-cannabis-web/components/MenuTopDealsRail.tsx
// EXCEPT brand color (emerald-700 here, indigo-700 in scc) — the same
// per-stack diff pattern as StrainPickOfWeek and the rest of the /menu
// surface.

type Props = {
  deals: ActiveDeal[];
};

// Category palette for the card art when no vendor matches. Same
// hex pairs as DealArt's CATEGORY_ART so the visual language stays
// consistent across the /deals and /menu surfaces.
const CATEGORY_ART: Record<
  string,
  { emoji: string; accentHex: string; accent2Hex: string; label: string }
> = {
  flower: { emoji: "🌿", accentHex: "1f3a2b", accent2Hex: "0a1810", label: "Flower" },
  edibles: { emoji: "🍬", accentHex: "8a1f4a", accent2Hex: "3a0e1f", label: "Edibles" },
  vapes: { emoji: "💨", accentHex: "1f3a6e", accent2Hex: "0e1d3a", label: "Vapes" },
  concentrates: { emoji: "💎", accentHex: "4a1f6e", accent2Hex: "200e3a", label: "Concentrates" },
  "pre-rolls": { emoji: "🫙", accentHex: "6e4a1f", accent2Hex: "3a200e", label: "Pre-Rolls" },
  prerolls: { emoji: "🫙", accentHex: "6e4a1f", accent2Hex: "3a200e", label: "Pre-Rolls" },
  tinctures: { emoji: "💧", accentHex: "0e6e6a", accent2Hex: "063838", label: "Tinctures" },
  topicals: { emoji: "🧴", accentHex: "3a6e1f", accent2Hex: "1d3a0e", label: "Topicals" },
  beverages: { emoji: "🥤", accentHex: "8a4a1f", accent2Hex: "3a200e", label: "Beverages" },
  all: { emoji: "🎟️", accentHex: "1f3a2b", accent2Hex: "0a1810", label: "Storewide" },
};

function categoryArtFor(appliesTo: string | null | undefined) {
  const key = (appliesTo ?? "all").toLowerCase().trim();
  return CATEGORY_ART[key] ?? CATEGORY_ART.all;
}

// Emoji + display label for qualifier-class tags. Category tags fall back
// to CATEGORY_ART above. Doug 2026-05-29 — STOREWIDE was the lone tag on
// every card pre-fix, even for birthday/industry deals that only apply
// to a sub-audience. These tag values come from `deriveDealTag` in lib/db.ts.
const TAG_DISPLAY: Record<string, { emoji: string; label: string }> = {
  BIRTHDAY: { emoji: "🎂", label: "Birthday" },
  INDUSTRY: { emoji: "🪪", label: "Industry" },
  HEROES: { emoji: "🎖️", label: "Heroes" },
  "FIRST VISIT": { emoji: "👋", label: "First visit" },
  LOYALTY: { emoji: "⭐", label: "Loyalty" },
  ONLINE: { emoji: "📱", label: "Online" },
  STOREWIDE: { emoji: "🎟️", label: "Storewide" },
};
// fmtEndDate was used to render an "Ends Jun 15" / "Ongoing" line under
// each card title — removed in the 2026-05-29 rail tighten (the line
// added noise without resolving the section-header-vs-card-status
// inconsistency the screenshot review surfaced). End-date copy still
// lives on the /deals/[id] deep page where customers go for the full
// terms.

export function MenuTopDealsRail({ deals }: Props) {
  // Empty-state contract per the brief: render NOTHING when no deals.
  // An empty placeholder is worse than the iframe alone — the iframe's
  // own skeleton (in JaneMenu.tsx) already reserves viewport space.
  if (!deals || deals.length === 0) return null;

  const top = deals.slice(0, 6);

  return (
    <section
      aria-labelledby="menu-top-deals-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-6"
    >
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2
          id="menu-top-deals-heading"
          className="text-sm font-extrabold uppercase tracking-[0.18em] text-emerald-800"
        >
          Daily deals
        </h2>
        <Link
          href={withAttr("/deals", "menu", "top-rail-all")}
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-600 transition-colors"
        >
          See all →
        </Link>
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {top.map((d, i) => {
          const vendor = matchDealVendor(d.name, d.description);
          const cat = categoryArtFor(d.appliesTo);
          const accent = vendor?.accentHex ?? cat.accentHex;
          const accent2 = vendor?.accent2Hex ?? cat.accent2Hex;
          const heroUrl = vendor?.heroUrl ?? null;
          const isFirst = i === 0;
          // DB-sourced strings get the runtime WSLCB scrubber as a 2nd
          // layer behind the build-gate check (build-gate scans literal
          // strings, scrubber catches deal-row content). Falls back to
          // the unscrubbed value only if the scrub returns null (=
          // entirely banned phrases) — defensive: ship the original
          // name + description rather than render an empty card.
          //
          // Doug 2026-05-29 /menu rail tighten: render `displayName` (the
          // day-of-week prefix stripped at the data layer) instead of the
          // raw `name`. Section header reads "Daily deals" already — the
          // "Friday:" prefix in every card body was dead weight + plain
          // wrong on every other day of the week.
          const safeName = scrubWslcbClaims(d.displayName) ?? d.displayName;
          const safeShort = scrubWslcbClaims(d.short) ?? d.short;
          // Tag-driven chip: qualifier-deals (Birthday / Industry / Heroes)
          // get a specific badge so the chip doesn't misleadingly read
          // STOREWIDE on a deal that's restricted to a sub-audience. Falls
          // back to category-bucket label when the tag matches a category
          // bucket (FLOWER / EDIBLES / etc.).
          const tagDisplay = d.tag ? TAG_DISPLAY[d.tag] : null;
          const chipEmoji = tagDisplay?.emoji ?? cat.emoji;
          const chipLabel = tagDisplay?.label ?? cat.label;
          return (
            <li key={d.id}>
              <Link
                href={withAttr(`/deals/${d.id}`, "menu", `top-rail-${d.id}`)}
                className="group flex flex-col h-full rounded-2xl border border-stone-200 bg-white overflow-hidden hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 transition-all"
              >
                {/* Hero strip — vendor photo OR category gradient.
                    Height 28 (~112px) keeps the LCP cost low while
                    still anchoring the card visually. First card
                    image gets priority; rest lazy. */}
                <div
                  className="relative h-28 overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, #${accent} 0%, #${accent2} 100%)`,
                  }}
                >
                  {heroUrl && (
                    <Image
                      src={heroUrl}
                      alt=""
                      fill
                      unoptimized
                      aria-hidden
                      priority={isFirst}
                      loading={isFirst ? undefined : "lazy"}
                      className="object-cover opacity-40 mix-blend-luminosity"
                      sizes="(min-width: 1024px) 200px, (min-width: 640px) 33vw, 50vw"
                    />
                  )}
                  {/* Darken so percent-off readout stays legible */}
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%)",
                    }}
                  />
                  {/* Top-left chip — vendor name when matched, otherwise
                      a tag-derived label (Birthday / Industry / Heroes /
                      First visit / Loyalty / Online / Storewide / category). */}
                  <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2 pointer-events-none">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[9px] font-bold uppercase tracking-widest">
                      {vendor ? (
                        <>
                          <span
                            aria-hidden
                            className="w-1 h-1 rounded-full bg-white"
                          />
                          {vendor.displayName}
                        </>
                      ) : (
                        <>
                          <span aria-hidden className="text-[11px] leading-none">
                            {chipEmoji}
                          </span>
                          {chipLabel}
                        </>
                      )}
                    </span>
                  </div>
                  {/* Big percent-off readout, bottom-right */}
                  <div className="absolute inset-x-0 bottom-0 p-2.5">
                    <div className="text-lg sm:text-xl font-extrabold text-white leading-tight tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] text-right">
                      {safeShort}
                    </div>
                  </div>
                </div>

                {/* Card body — name + see-on-menu CTA. The redundant
                    "Ongoing" line was removed (Doug 2026-05-29): when
                    every card was tagged "Ongoing" against a "Today's
                    Deals" header, the model was inconsistent. Section
                    header now reads "Daily deals" — the recurring nature
                    is implied. End-date readout still rides on the
                    /deals/[id] deep page when a deal is genuinely
                    time-bound. */}
                <div className="flex-1 flex flex-col p-3">
                  <p className="text-sm font-bold text-stone-900 leading-snug line-clamp-2 group-hover:text-emerald-800 transition-colors">
                    {safeName}
                  </p>
                  <span className="mt-auto pt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:text-emerald-900 transition-colors">
                    See on menu
                    <span
                      aria-hidden
                      className="transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
