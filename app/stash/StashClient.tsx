"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useStash } from "@/lib/stash";
import { StashButton } from "@/components/StashButton";
import { getProductPlaceholderGradient } from "@/lib/product-placeholder";
import { getCategoryIcon } from "@/lib/product-placeholder-icons";
import { getCategoryPlaceholderPhoto } from "@/lib/category-placeholder-photos";
import { matchProductPhoto } from "@/lib/product-photos-available";
import { effectivePriceFor, ONLINE_DISCOUNT_PCT } from "@/lib/online-pricing";
import type { MenuProduct } from "@/lib/db";

const STRAIN_BADGE: Record<string, string> = {
  Sativa: "bg-red-100 text-red-700 border-red-200",
  Indica: "bg-purple-100 text-purple-700 border-purple-200",
  Hybrid: "bg-green-100 text-green-700 border-green-200",
};

const CAT_ICONS: Record<string, string> = {
  Flower: "🌿",
  "Pre-Rolls": "🫙",
  Vapes: "💨",
  Concentrates: "🧴",
  Edibles: "🍬",
  Tinctures: "💊",
  Topicals: "🧼",
  Accessories: "🔧",
};

export function StashClient({ products }: { products: MenuProduct[] }) {
  const stash = useStash();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Build O(1) ID → product map once
  const byId = new Map(products.map((p) => [p.id, p]));
  const saved = stash.ids.map((id) => byId.get(id)).filter((p): p is MenuProduct => Boolean(p));

  if (!mounted) {
    // SSR + first paint placeholder — keep height stable.
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center text-stone-400 text-sm">Loading your stash…</div>
      </section>
    );
  }

  if (saved.length === 0) {
    return (
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-50 text-rose-400 mb-5">
          <svg
            viewBox="0 0 24 24"
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-stone-900">Nothing saved yet.</h2>
        <p className="text-stone-600 mt-2">
          Tap the heart on any product on the menu to save it here for next time.
        </p>
        <Link
          href="/menu"
          className="mt-6 inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold transition-colors shadow-sm"
        >
          Browse the menu →
        </Link>
      </section>
    );
  }

  // Group by category, mirroring the menu page's structure
  const grouped = new Map<string, MenuProduct[]>();
  for (const p of saved) {
    const key = p.category ?? "Other";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(p);
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-stone-600">
          <span className="font-bold text-stone-900">{saved.length}</span>{" "}
          {saved.length === 1 ? "product" : "products"} saved
        </p>
        <button type="button"
          onClick={() => {
            if (confirm("Clear your entire stash?")) stash.clear();
          }}
          className="text-xs font-bold text-stone-500 hover:text-rose-600 transition-colors"
        >
          Clear all
        </button>
      </div>

      {Array.from(grouped.entries()).map(([cat, items]) => {
        const icon = CAT_ICONS[cat] ?? "🌱";
        return (
          <div key={cat} className="space-y-4">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <span aria-hidden>{icon}</span>
              {cat}
              <span className="text-xs font-medium text-stone-400 tabular-nums">{items.length}</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {items.map((p) => (
                <article
                  key={p.id}
                  className="group rounded-2xl border border-stone-100 bg-white overflow-hidden hover:border-green-300 hover:shadow-lg transition-all"
                >
                  <div className="aspect-square bg-stone-100 overflow-hidden relative">
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      (() => {
                        // Tier 2 of the /stash card fallback chain: per-product
                        // brand photo via matchProductPhoto manifest (135 rules).
                        const productPhotoPath = matchProductPhoto(p.name, p.brand, p.category);
                        if (productPhotoPath) {
                          return (
                            <div role="img" aria-label={p.name} className="relative w-full h-full overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={productPhotoPath}
                                alt={p.name}
                                loading="lazy"
                                className="w-full h-full object-contain p-2"
                              />
                            </div>
                          );
                        }
                        // Tier 3 of the /stash card fallback chain: when the
                        // category maps to an installed placeholder JPG render
                        // that photo full-bleed with a brand-pill overlay.
                        // Otherwise fall through to the SVG-icon-on-gradient.
                        const placeholderPath = getCategoryPlaceholderPhoto(p.category);
                        if (placeholderPath) {
                          return (
                            <div role="img" aria-label={p.name} className="relative w-full h-full overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={placeholderPath}
                                alt={p.name}
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                              <div
                                className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none"
                                aria-hidden="true"
                              />
                              {p.brand && (
                                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider text-stone-900 px-2.5 py-1 bg-white/85 backdrop-blur-sm rounded-full line-clamp-1 max-w-[80%] shadow-sm border border-white/50">
                                  {p.brand}
                                </span>
                              )}
                            </div>
                          );
                        }
                        const Icon = getCategoryIcon(p.category);
                        return (
                          <div
                            role="img"
                            aria-label={p.name}
                            className={`w-full h-full flex flex-col items-center justify-center gap-2 ${getProductPlaceholderGradient(p.category, p.strainType)}`}
                          >
                            <Icon className="w-14 h-14 text-stone-700/70 drop-shadow-sm" aria-hidden="true" />
                            {p.brand && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700 px-2.5 py-1 bg-white/75 backdrop-blur-sm rounded-full line-clamp-1 max-w-[85%] shadow-sm">
                                {p.brand}
                              </span>
                            )}
                          </div>
                        );
                      })()
                    )}
                    <StashButton productId={p.id} />
                    {p.strainType && STRAIN_BADGE[p.strainType] && (
                      <span
                        className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full font-bold border ${STRAIN_BADGE[p.strainType]}`}
                      >
                        {p.strainType}
                      </span>
                    )}
                  </div>
                  <div className="p-3 space-y-1.5">
                    {p.brand && (
                      <div className="text-[11px] text-stone-400 font-bold uppercase tracking-wide truncate">
                        {p.brand}
                      </div>
                    )}
                    <h3 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2 min-h-[2.5em]">
                      {p.name}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {p.thcPct != null && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium tabular-nums">
                          THC {p.thcPct.toFixed(1)}%
                        </span>
                      )}
                      {p.cbdPct != null && p.cbdPct > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium tabular-nums">
                          CBD {p.cbdPct.toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      {(() => {
                        if (p.unitPrice == null || p.unitPrice <= 0) {
                          return <span className="text-stone-400 text-sm font-medium">In store</span>;
                        }
                        const pricing = effectivePriceFor(p, null);
                        if (pricing.displayPrice == null) return null;
                        return (
                          <div className="flex flex-col leading-tight">
                            <span className="text-stone-400 line-through text-[10px] decoration-red-500 decoration-2">${pricing.originalPrice?.toFixed(2)}</span>
                            <span className="font-extrabold text-green-800 tabular-nums">${pricing.displayPrice.toFixed(2)}</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-green-700 leading-none">{ONLINE_DISCOUNT_PCT}% off online</span>
                          </div>
                        );
                      })()}
                      <Link
                        href="/menu"
                        className="text-[11px] font-bold text-green-700 hover:text-green-600 transition-colors"
                      >
                        Order →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
