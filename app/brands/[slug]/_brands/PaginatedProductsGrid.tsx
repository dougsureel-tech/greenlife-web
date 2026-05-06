"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  strain_type: string | null;
  thc_pct: number | null;
  cbd_pct: number | null;
  unit_price: number | null;
  image_url: string | null;
  effects: string | null;
  terpenes: string | null;
};

const STRAIN_COLORS: Record<string, { badge: string }> = {
  sativa: { badge: "bg-red-100 text-red-800 border-red-200" },
  indica: { badge: "bg-purple-100 text-purple-800 border-purple-200" },
  hybrid: { badge: "bg-emerald-100 text-emerald-800 border-emerald-200" },
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

const CATEGORY_ORDER = [
  "Flower",
  "Pre-Rolls",
  "Vapes",
  "Concentrates",
  "Edibles",
  "Tinctures",
  "Topicals",
  "Accessories",
  "Other",
];

type StrainFilter = "all" | "sativa" | "indica" | "hybrid";
type SortBy = "default" | "price-asc" | "price-desc" | "thc-desc" | "name-asc";

// Per-vendor brand pages paginate at 25 products per page so even a
// 16-brand producer like NWCS doesn't dump 200 cards on a single scroll.
// Pagination is linear across the full product list; within each page the
// visible slice re-groups by category so customers still scan by type.
//
// Strain filter chip row sits above the grid — most customers walk in
// with an indica/sativa/hybrid preference already in mind, so this is the
// shortest path between landing and finding what fits the day.
export function PaginatedProductsGrid({
  products,
  accentBg = "bg-[#0e2a1f]",
  accentBorder = "border-[#c8b06b]",
  accentHoverBorder = "hover:border-[#c8b06b]",
  accentText = "text-[#0e2a1f]",
  accentHoverText = "hover:text-[#1c4a36]",
  accentGlow = "hover:shadow-[#c8b06b]/30",
  perPage = 25,
  nameContains,
  nameContainsLabel,
  onClearNameFilter,
}: {
  products: Product[];
  accentBg?: string;
  accentBorder?: string;
  accentHoverBorder?: string;
  accentText?: string;
  accentHoverText?: string;
  accentGlow?: string;
  perPage?: number;
  // Optional outer name-substring filter — used by NWCS to wire the
  // sub-brand cards (Magic Kitchen / Legends / etc.) as a product filter
  // by matching the sub-brand label inside the product name.
  nameContains?: string | null;
  nameContainsLabel?: string;
  onClearNameFilter?: () => void;
}) {
  const [page, setPage] = useState(0);
  const [strainFilter, setStrainFilter] = useState<StrainFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("default");

  // Reset to page 0 whenever the outer name filter changes — same reason
  // as strain/sort: avoids "page 4 of 1" if the new filter shrinks the list.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Canonical "reset child pagination on filter prop change" pattern. Derive-during-render rewrite is a larger refactor.
    setPage(0);
  }, [nameContains]);

  const strainCounts = useMemo(() => {
    const counts = { all: products.length, sativa: 0, indica: 0, hybrid: 0 };
    for (const p of products) {
      const k = (p.strain_type ?? "").toLowerCase();
      if (k === "sativa" || k === "indica" || k === "hybrid") counts[k]++;
    }
    return counts;
  }, [products]);

  const filtered = useMemo(() => {
    let arr = products;
    if (nameContains) {
      const needle = nameContains.toLowerCase();
      arr = arr.filter((p) => (p.name ?? "").toLowerCase().includes(needle));
    }
    if (strainFilter !== "all") {
      arr = arr.filter((p) => (p.strain_type ?? "").toLowerCase() === strainFilter);
    }
    return arr;
  }, [products, strainFilter, nameContains]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    // Default sort = category order, then alpha within category. Custom sorts
    // bypass category grouping entirely so the slice is a flat list — but
    // the per-page re-grouping below still buckets visible items by category
    // header so the layout stays scannable.
    if (sortBy === "default") {
      return arr.sort((a, b) => {
        const ai = CATEGORY_ORDER.indexOf(a.category ?? "Other");
        const bi = CATEGORY_ORDER.indexOf(b.category ?? "Other");
        const ax = ai < 0 ? CATEGORY_ORDER.length : ai;
        const bx = bi < 0 ? CATEGORY_ORDER.length : bi;
        if (ax !== bx) return ax - bx;
        return (a.name ?? "").localeCompare(b.name ?? "");
      });
    }
    if (sortBy === "price-asc") {
      return arr.sort((a, b) => (a.unit_price ?? Infinity) - (b.unit_price ?? Infinity));
    }
    if (sortBy === "price-desc") {
      return arr.sort((a, b) => (b.unit_price ?? -Infinity) - (a.unit_price ?? -Infinity));
    }
    if (sortBy === "thc-desc") {
      return arr.sort((a, b) => (b.thc_pct ?? -Infinity) - (a.thc_pct ?? -Infinity));
    }
    if (sortBy === "name-asc") {
      return arr.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    }
    return arr;
  }, [filtered, sortBy]);

  // Reset to page 0 whenever the filter changes — otherwise customers can
  // land on "page 4 of 1" if they were deep in the All list and switched
  // to a strain that only has 8 results.
  function pickStrain(s: StrainFilter) {
    setStrainFilter(s);
    setPage(0);
  }

  function pickSort(s: SortBy) {
    setSortBy(s);
    setPage(0);
  }

  function changePage(next: number) {
    setPage(next);
    // Smooth-scroll to the top of the products section so the new slice
    // lands at the top of the viewport instead of the middle of the
    // previous page. Only fires for explicit pagination clicks — filter
    // and sort changes already keep the user near the top because the
    // section above the grid stays anchored.
    requestAnimationFrame(() => {
      const target = document.getElementById("products");
      if (target) {
        const headerOffset = 80; // sticky site header height
        const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  }

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * perPage;
  const visible = sorted.slice(start, start + perPage);

  const filterChips: { id: StrainFilter; label: string; emoji: string }[] = [
    { id: "all", label: "All", emoji: "🌱" },
    { id: "sativa", label: "Sativa", emoji: "☀️" },
    { id: "indica", label: "Indica", emoji: "🌙" },
    { id: "hybrid", label: "Hybrid", emoji: "🌗" },
  ];

  // Featured = first product in the visible slice. Respects whatever the
  // user has filtered/sorted to so it always points at something
  // contextually relevant (highest THC if sorted by THC, cheapest if
  // sorted by price asc, etc.). Only renders if there are 4+ items in
  // the slice — otherwise the page is too small to need a hero card.
  const featured = visible.length >= 4 ? visible[0] : null;
  const restAfterFeatured = featured ? visible.slice(1) : visible;

  // Re-bucket the post-featured slice by category for visual grouping.
  const featuredAwareBuckets = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of restAfterFeatured) {
      const cat = p.category ?? "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(p);
    }
    return [...map.entries()].sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a[0]);
      const bi = CATEGORY_ORDER.indexOf(b[0]);
      const ax = ai < 0 ? CATEGORY_ORDER.length : ai;
      const bx = bi < 0 ? CATEGORY_ORDER.length : bi;
      return ax - bx;
    });
  }, [restAfterFeatured]);

  return (
    <>
      {/* Filter + sort row sticks under the site header while the customer
          scrolls through long product lists — keeps the controls in reach
          for the whole product section. White backdrop with a soft border
          so it sits cleanly on the stone-50 section background. */}
      <div className="sticky top-16 z-20 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 py-3 mb-6 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200/80">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {filterChips.map((chip) => {
          const count = strainCounts[chip.id];
          const active = strainFilter === chip.id;
          const disabled = count === 0;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => !disabled && pickStrain(chip.id)}
              disabled={disabled}
              aria-pressed={active}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                active
                  ? `${accentBg} ${accentBorder} text-white shadow-sm`
                  : disabled
                    ? "bg-stone-50 border-stone-100 text-stone-300 cursor-not-allowed"
                    : "bg-white border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-900"
              }`}
            >
              <span aria-hidden="true">{chip.emoji}</span>
              {chip.label}
              <span
                className={`text-[10px] tabular-nums ${
                  active ? "text-white/70" : "text-stone-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
        </div>

        <label className="inline-flex items-center gap-2 text-xs">
          <span className="font-semibold uppercase tracking-wider text-stone-500">Sort</span>
          <select
            value={sortBy}
            onChange={(e) => pickSort(e.target.value as SortBy)}
            className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 hover:border-stone-400 transition-colors"
          >
            <option value="default">Recommended</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="thc-desc">THC %: High → Low</option>
            <option value="name-asc">Name: A → Z</option>
          </select>
        </label>
      </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-white rounded-2xl border border-stone-200">
          <div className="text-4xl">🌿</div>
          <p className="text-stone-500 font-medium">
            {strainFilter === "all"
              ? "No products in stock right now"
              : `No ${strainFilter} products in stock right now`}
          </p>
          {strainFilter !== "all" && (
            <button
              type="button"
              onClick={() => pickStrain("all")}
              className={`text-sm ${accentText} font-semibold hover:underline`}
            >
              Show all strains →
            </button>
          )}
        </div>
      ) : (
        <>
          {nameContains && nameContainsLabel && (
            <div
              className={`mb-6 flex items-center justify-between gap-3 rounded-2xl border ${accentBorder} bg-stone-50 px-4 py-3`}
            >
              <p className="text-sm">
                <span className="text-stone-500">Showing only</span>{" "}
                <span className="font-bold text-stone-900">{nameContainsLabel}</span>{" "}
                <span className="text-stone-500">products ({sorted.length})</span>
              </p>
              {onClearNameFilter && (
                <button
                  type="button"
                  onClick={onClearNameFilter}
                  className={`text-xs font-bold ${accentText} ${accentHoverText} hover:underline`}
                >
                  Clear ✕
                </button>
              )}
            </div>
          )}

          {featured && (
            <FeaturedCard
              product={featured}
              accentText={accentText}
              accentHoverText={accentHoverText}
              accentHoverBorder={accentHoverBorder}
              accentGlow={accentGlow}
            />
          )}

          <div className="space-y-12">
        {featuredAwareBuckets.map(([cat, items]) => (
          <div key={cat}>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">{CAT_ICONS[cat] ?? "🌱"}</span>
              <h3 className="text-xl font-extrabold text-stone-900 tracking-tight">{cat}</h3>
              <span className="text-xs font-medium text-stone-500 bg-white border border-stone-200 px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((p) => {
                const strainKey = (p.strain_type ?? "").toLowerCase();
                const strain = STRAIN_COLORS[strainKey];
                return (
                  <div
                    key={p.id}
                    className={`rounded-2xl border border-stone-200 bg-white overflow-hidden ${accentHoverBorder} hover:shadow-xl ${accentGlow} hover:-translate-y-0.5 transition-all duration-200 group`}
                  >
                    {p.image_url ? (
                      <div className="h-44 bg-stone-100 overflow-hidden relative">
                        <Image
                          src={p.image_url}
                          alt={p.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="h-32 bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center text-4xl">
                        {CAT_ICONS[cat] ?? "🌱"}
                      </div>
                    )}
                    <div className="p-4 space-y-3">
                      <h4 className="font-bold text-stone-900 text-sm leading-snug">{p.name}</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {p.strain_type && strain && (
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold capitalize ${strain.badge}`}
                          >
                            {p.strain_type}
                          </span>
                        )}
                        {p.thc_pct != null && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                            THC {p.thc_pct.toFixed(1)}%
                          </span>
                        )}
                        {p.cbd_pct != null && p.cbd_pct > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                            CBD {p.cbd_pct.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                        {p.unit_price != null ? (
                          <span className="font-extrabold text-stone-900">
                            ${p.unit_price.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                        <Link
                          href="/menu"
                          className={`text-xs font-bold ${accentText} ${accentHoverText} transition-colors`}
                        >
                          Order →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
          </div>

          {restAfterFeatured.length === 0 && featured && (
            <p className="mt-6 text-center text-xs text-stone-400">
              Showing 1 product on this page — narrow your filters above to see more.
            </p>
          )}
        </>
      )}

      {sorted.length > 0 && totalPages > 1 && (
        <nav
          aria-label="Products pagination"
          className="mt-12 flex items-center justify-between gap-4 flex-wrap"
        >
          <p className="text-sm text-stone-500 tabular-nums">
            Showing {start + 1}–{Math.min(start + perPage, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => changePage(Math.max(0, safePage - 1))}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${accentBg} text-white disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90`}
            >
              ← Prev
            </button>
            <span className="text-sm text-stone-500 px-2">
              Page {safePage + 1} of {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage === totalPages - 1}
              onClick={() => changePage(Math.min(totalPages - 1, safePage + 1))}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${accentBg} text-white disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90`}
            >
              Next →
            </button>
          </div>
        </nav>
      )}
    </>
  );
}

// Bigger card slot at the top of each page slice — first product in the
// post-filter/sort visible list. Wider than a standard product card,
// asymmetric image+content layout, accent-colored CTA. Gives the page a
// visual anchor and rewards customers who already filtered/sorted to
// what they want.
function FeaturedCard({
  product: p,
  accentText,
  accentHoverText,
  accentHoverBorder,
  accentGlow,
}: {
  product: Product;
  accentText: string;
  accentHoverText: string;
  accentHoverBorder: string;
  accentGlow: string;
}) {
  const strainKey = (p.strain_type ?? "").toLowerCase();
  const strain = STRAIN_COLORS[strainKey];
  return (
    <Link
      href="/menu"
      className={`group block mb-10 rounded-3xl border border-stone-200 bg-white overflow-hidden ${accentHoverBorder} hover:shadow-2xl ${accentGlow} hover:-translate-y-0.5 transition-all duration-300`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-0">
        <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[260px] bg-stone-100 overflow-hidden">
          {p.image_url ? (
            <Image
              src={p.image_url}
              alt={p.name}
              fill
              sizes="(max-width: 640px) 100vw, 40vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-6xl bg-gradient-to-br from-stone-50 to-stone-100">
              {p.category === "Edibles"
                ? "🍬"
                : p.category === "Vapes"
                  ? "💨"
                  : p.category === "Concentrates"
                    ? "🧴"
                    : p.category === "Pre-Rolls"
                      ? "🫙"
                      : "🌿"}
            </div>
          )}
          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-stone-900 shadow-sm">
            ⭐ Featured
          </span>
        </div>
        <div className="flex flex-col justify-between p-6 sm:p-8 gap-5">
          <div className="space-y-3">
            {p.category && (
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">
                {p.category}
              </p>
            )}
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 leading-tight">
              {p.name}
            </h3>
            {p.effects && (
              <p className="text-sm text-stone-600 leading-relaxed line-clamp-3">{p.effects}</p>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              {p.strain_type && strain && (
                <span
                  className={`text-xs px-2.5 py-1 rounded-full border font-semibold capitalize ${strain.badge}`}
                >
                  {p.strain_type}
                </span>
              )}
              {p.thc_pct != null && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 font-medium">
                  THC {p.thc_pct.toFixed(1)}%
                </span>
              )}
              {p.cbd_pct != null && p.cbd_pct > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                  CBD {p.cbd_pct.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <div className="flex items-end justify-between pt-3 border-t border-stone-100">
            {p.unit_price != null ? (
              <span className="text-3xl font-extrabold text-stone-900 tabular-nums">
                ${p.unit_price.toFixed(2)}
              </span>
            ) : (
              <span className="text-stone-300">—</span>
            )}
            <span
              className={`text-sm font-bold ${accentText} ${accentHoverText} group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1`}
            >
              Order →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
