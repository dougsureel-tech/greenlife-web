import Link from "next/link";
import type { ActiveDeal } from "@/lib/db";
import { matchDealVendor } from "@/lib/deal-vendor-match";
import { withAttr } from "@/lib/attribution";

// Sticky-feeling strip listing every running deal as a compact chip,
// rendered beneath the iHeartJane Boost embed on /menu. Boost is
// third-party and we can't ribbon individual product cards inside its
// grid (DOM hijack would be fragile). This strip is the pragmatic
// substitute: every active deal gets a brand-color chip + percent-off
// readout so a customer scrolling Boost still sees the discount surface.
//
// Each chip:
//   - Routes to /deals/[id] (the deep page) so the urgency + countdown
//     are visible before the customer commits to /menu.
//   - Carries `?from=menu:deal-strip-<id>` so attribution can attribute
//     the conversion back to the menu-strip surface.
//   - Inherits the dialed-in vendor brand color when the deal name
//     matches a known vendor — keeps the visual language consistent
//     with the /deals card hero strip.
//
// Falls back to category-bucket palette when the deal is brand-agnostic.
//
// Empty state: returns null. The page already shows the
// MenuFallback amber featured-deal box for the single most-urgent
// deal; this strip only adds value when there are deals to enumerate.

type Props = {
  deals: ActiveDeal[];
  /**
   * Count of products in the staff-curated /treasure-chest clearance lane.
   * When > 0, prepends an amber Treasure-chest chip to the deals row so
   * customers browsing /menu can find the clearance lane without leaving
   * the page. v178.x — Doug 2026-05-07 polish.
   */
  treasureChestCount?: number;
};

const CATEGORY_TINT: Record<string, { bg: string; text: string; border: string }> = {
  flower: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
  edibles: { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200" },
  vapes: { bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200" },
  concentrates: { bg: "bg-violet-50", text: "text-violet-800", border: "border-violet-200" },
  "pre-rolls": { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  prerolls: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  tinctures: { bg: "bg-teal-50", text: "text-teal-800", border: "border-teal-200" },
  topicals: { bg: "bg-lime-50", text: "text-lime-800", border: "border-lime-200" },
  beverages: { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200" },
  all: { bg: "bg-stone-50", text: "text-stone-800", border: "border-stone-200" },
};

function tintFor(appliesTo: string | null) {
  const key = (appliesTo ?? "all").toLowerCase().trim();
  return CATEGORY_TINT[key] ?? CATEGORY_TINT.all;
}

export function MenuActiveDealsStrip({ deals, treasureChestCount = 0 }: Props) {
  // Render when EITHER deals OR treasure-chest has content. Pre-fix the
  // strip returned null on empty deals — meaning a clearance-only state
  // (deals=0, treasure=N) hid the treasure chip too.
  if ((!deals || deals.length === 0) && treasureChestCount === 0) return null;

  return (
    <section
      aria-labelledby="menu-deals-strip-heading"
      className="bg-stone-50 border-y border-stone-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <h2
            id="menu-deals-strip-heading"
            className="text-sm font-extrabold uppercase tracking-[0.18em] text-emerald-800"
          >
            {deals.length > 0
              ? `Live deals · ${deals.length} running`
              : "Clearance lane"}
          </h2>
          <Link
            href={withAttr("/deals", "menu", "deals-strip-all")}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-600 transition-colors"
          >
            See all →
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {treasureChestCount > 0 && (
            <Link
              href={withAttr("/treasure-chest", "menu", "deals-strip-treasure")}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-amber-300 bg-amber-100 text-amber-900 font-semibold text-xs hover:-translate-y-0.5 hover:bg-amber-200 transition-all"
            >
              <span aria-hidden className="text-[10px] uppercase tracking-widest opacity-70">
                <span aria-hidden="true">🪙</span> Treasure
              </span>
              <span className="font-extrabold">{treasureChestCount} on clearance</span>
            </Link>
          )}
          {deals.map((d) => {
            const vendor = matchDealVendor(d.name, d.description);
            const tint = tintFor(d.appliesTo);
            const styleVendor = vendor
              ? {
                  background: `#${vendor.accentHex}10`,
                  borderColor: `#${vendor.accentHex}55`,
                  color: `#${vendor.accentHex}`,
                }
              : undefined;
            return (
              <Link
                key={d.id}
                data-app-only={d.appOnly ? "1" : "0"}
                href={withAttr(`/deals/${d.id}`, "menu", `deal-strip-${d.id}`)}
                className={
                  vendor
                    ? "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-semibold text-xs hover:-translate-y-0.5 transition-transform"
                    : `inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-semibold text-xs hover:-translate-y-0.5 transition-transform ${tint.bg} ${tint.text} ${tint.border}`
                }
                style={styleVendor}
              >
                <span aria-hidden className="text-[10px] uppercase tracking-widest opacity-60">
                  {vendor ? vendor.displayName : (d.appliesTo ?? "All")}
                </span>
                <span className="font-extrabold">{d.short}</span>
              </Link>
            );
          })}
        </div>

        <p className="text-[11px] text-stone-500 mt-3">
          Best deal applies at the counter · 21+ with valid ID · Cash only
        </p>
      </div>
    </section>
  );
}
