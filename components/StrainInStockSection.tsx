import Link from "next/link";
import Image from "next/image";
import { withAttr } from "@/lib/attribution";
import { effectivePriceFor, findDealForProduct } from "@/lib/online-pricing";
import { formatProductTitle } from "@/lib/format-product-title";
import { getProductPlaceholderGradient } from "@/lib/product-placeholder";
import { matchProductPhoto } from "@/lib/product-photos-available";
import { renderReason, type ScoredProduct } from "@/lib/strain-match";
import type { Strain } from "@/lib/strains";
import type { ActiveDeal } from "@/lib/db";

// "In stock today" section — renders live menu products matched against
// a strain via lib/strain-match.ts scoring (exact / lineage / terpene /
// type fallback). Server component; data fetched in app/strains/[slug]/page.tsx
// via getStrainMatchedProducts.
//
// Spec: STRAIN_MENU_INTEGRATION_SPEC_2026_05_17.md §5. Doug greenlight
// 2026-05-17 — all 5 defaults accepted (card cap 6, "In stock today" header,
// HIDE on zero-match, SKIP CBD strains, keep weight variants).
//
// Mirror in seattle-cannabis-web/components/StrainInStockSection.tsx —
// brand-accent swap (emerald → indigo). Keep in sync.

export type StrainInStockSectionProps = {
  strain: Strain;
  matched: ScoredProduct[];
  deals: ActiveDeal[];
  storeName: string;
};

export function StrainInStockSection({
  strain,
  matched,
  deals,
  storeName,
}: StrainInStockSectionProps) {
  // Doug §7 decision: HIDE entirely when zero matches (vs showing
  // "Not on the shelf right now" message that adds noise more than value).
  if (matched.length === 0) return null;

  return (
    <section className="max-w-3xl mx-auto px-4 pb-12">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700 mb-2">
        Live inventory
      </p>
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 mb-1">
        In stock today
      </h2>
      <p className="text-sm text-stone-600 mb-4">
        {matched.length === 1
          ? `1 ${strain.name}-related product available at ${storeName} right now.`
          : `${matched.length} ${strain.name}-related products available at ${storeName} right now.`}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {matched.map((m) => {
          const p = m.product;
          const deal = findDealForProduct(p, deals);
          const priced = effectivePriceFor(p, deal);
          const displayPrice = priced.displayPrice ?? p.unitPrice ?? 0;
          const placeholderBg = getProductPlaceholderGradient(p.category, p.strainType);
          const reasonLabel = renderReason(m.reason, strain);
          const isExact = m.reason.kind === "exact";
          return (
            <Link
              key={p.id}
              href={withAttr(`/menu?q=${encodeURIComponent(p.name)}`, "strains", strain.slug)}
              className="rounded-xl border border-stone-200 bg-white hover:border-stone-400 hover:shadow-sm transition-all overflow-hidden group flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              <div className="aspect-square relative bg-stone-50">
                {(() => {
                  const photoSrc = p.imageUrl ?? matchProductPhoto(p.name, p.brand, p.category);
                  if (photoSrc) {
                    return (
                      <Image
                        src={photoSrc}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    );
                  }
                  return <div className="absolute inset-0" style={{ background: placeholderBg }} />;
                })()}
              </div>
              <div className="p-3 flex flex-col flex-1">
                <div className="text-xs text-stone-500 truncate">{p.brand ?? p.category}</div>
                <div className="text-sm font-semibold text-stone-900 truncate group-hover:underline">
                  {formatProductTitle(
                    { name: p.name, brand: p.brand, category: p.category },
                    { strainName: strain.name },
                  )}
                </div>
                <div className="text-xs text-stone-600 mt-0.5 flex gap-1.5 items-baseline truncate">
                  {p.thcPct != null && <span className="shrink-0">THC {p.thcPct.toFixed(1)}%</span>}
                  {p.thcPct != null && p.category && <span className="text-stone-400 shrink-0">·</span>}
                  {p.category && <span className="truncate">{p.category}</span>}
                </div>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-stone-900">${displayPrice.toFixed(2)}</span>
                  {priced.originalPrice != null && priced.displayPrice != null && priced.displayPrice < priced.originalPrice && (
                    <span className="text-xs text-stone-400 line-through">
                      ${priced.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <span
                  className={
                    "mt-2 self-start inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium " +
                    (isExact
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : "bg-stone-100 text-stone-700 border-stone-200")
                  }
                >
                  {reasonLabel}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="mt-5">
        <Link
          href={withAttr(`/menu?q=${encodeURIComponent(strain.name)}`, "strains", strain.slug)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-emerald-700 text-emerald-800 hover:bg-emerald-50 font-semibold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          See all {strain.name} on the menu
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
