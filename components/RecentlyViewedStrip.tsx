"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRecentlyViewed } from "@/lib/recently-viewed";
import type { MenuProduct } from "@/lib/db";

const STRAIN_DOT: Record<string, string> = {
  Sativa: "bg-amber-400",
  Indica: "bg-purple-400",
  Hybrid: "bg-green-400",
};

// Horizontal-scroll strip of products the visitor recently engaged with
// (currently driven by stash toggles via lib/stash → recordView()).
// Server passes the full menu products[]; we filter locally to avoid an
// extra round trip.
//
// Hidden until mounted (no SSR — localStorage-only) and when there's
// nothing to show. Rendered above the menu filters so returning visitors
// see their picks before scrolling through 500 cards again.
export function RecentlyViewedStrip({
  products,
  accent = "green",
}: {
  products: MenuProduct[];
  accent?: "green" | "indigo";
}) {
  const { ids } = useRecentlyViewed();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (ids.length === 0) return null;

  const byId = new Map(products.map((p) => [p.id, p]));
  const items = ids
    .map((id) => byId.get(id))
    .filter((p): p is MenuProduct => Boolean(p))
    .slice(0, 8);
  if (items.length === 0) return null;

  const text = accent === "indigo" ? "text-indigo-700" : "text-green-700";

  return (
    <section aria-label="Recently looking at" className="border-b border-stone-200 bg-stone-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <p className={`text-[11px] font-bold uppercase tracking-wide ${text}`}>👀 Recently looking at</p>
          <span className="text-[11px] text-stone-400">stays in your browser only</span>
        </div>
        <div className="flex gap-2.5 overflow-x-auto -mx-4 sm:-mx-0 px-4 sm:px-0 pb-1 snap-x">
          {items.map((p) => (
            <Link
              key={p.id}
              href="/menu"
              className="shrink-0 snap-start w-32 sm:w-36 group rounded-xl border border-stone-200 bg-white overflow-hidden hover:border-stone-300 hover:shadow-md transition-all"
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
              <div className="px-2 py-1.5 space-y-0.5">
                {p.brand && (
                  <div className="text-[9px] text-stone-400 font-bold uppercase tracking-wide truncate">
                    {p.brand}
                  </div>
                )}
                <div className="text-[11px] text-stone-800 leading-snug line-clamp-2 min-h-[2.4em] font-medium">
                  {p.name}
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className={`text-[11px] font-bold tabular-nums ${text}`}>
                    {p.unitPrice != null && p.unitPrice > 0 ? `$${p.unitPrice.toFixed(2)}` : "—"}
                  </span>
                  {p.thcPct != null && (
                    <span className="text-[9px] text-stone-500 tabular-nums">THC {p.thcPct.toFixed(0)}%</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
