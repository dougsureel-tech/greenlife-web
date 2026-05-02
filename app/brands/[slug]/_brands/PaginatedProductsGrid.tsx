"use client";

import { useState, useMemo } from "react";
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
  sativa: { badge: "bg-amber-100 text-amber-800 border-amber-200" },
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
  perPage = 25,
}: {
  products: Product[];
  accentBg?: string;
  accentBorder?: string;
  accentHoverBorder?: string;
  accentText?: string;
  accentHoverText?: string;
  perPage?: number;
}) {
  const [page, setPage] = useState(0);
  const [strainFilter, setStrainFilter] = useState<StrainFilter>("all");

  const strainCounts = useMemo(() => {
    const counts = { all: products.length, sativa: 0, indica: 0, hybrid: 0 };
    for (const p of products) {
      const k = (p.strain_type ?? "").toLowerCase();
      if (k === "sativa" || k === "indica" || k === "hybrid") counts[k]++;
    }
    return counts;
  }, [products]);

  const filtered = useMemo(() => {
    if (strainFilter === "all") return products;
    return products.filter((p) => (p.strain_type ?? "").toLowerCase() === strainFilter);
  }, [products, strainFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a.category ?? "Other");
      const bi = CATEGORY_ORDER.indexOf(b.category ?? "Other");
      const ax = ai < 0 ? CATEGORY_ORDER.length : ai;
      const bx = bi < 0 ? CATEGORY_ORDER.length : bi;
      if (ax !== bx) return ax - bx;
      return (a.name ?? "").localeCompare(b.name ?? "");
    });
  }, [filtered]);

  // Reset to page 0 whenever the filter changes — otherwise customers can
  // land on "page 4 of 1" if they were deep in the All list and switched
  // to a strain that only has 8 results.
  function pickStrain(s: StrainFilter) {
    setStrainFilter(s);
    setPage(0);
  }

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * perPage;
  const visible = sorted.slice(start, start + perPage);

  // Group the visible slice back into category buckets so headers + counts
  // match what the customer sees on this page (not the global totals).
  const buckets = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of visible) {
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
  }, [visible]);

  if (sorted.length === 0) {
    return (
      <div className="text-center py-16 space-y-3 bg-white rounded-2xl border border-stone-200">
        <div className="text-4xl">🌿</div>
        <p className="text-stone-500 font-medium">No products in stock right now</p>
        <Link href="/menu" className={`text-sm ${accentText} font-semibold hover:underline`}>
          Browse full menu →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-12">
        {buckets.map(([cat, items]) => (
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
                    className={`rounded-2xl border border-stone-200 bg-white overflow-hidden ${accentHoverBorder} hover:shadow-md transition-all group`}
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

      {totalPages > 1 && (
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
              onClick={() => setPage((p) => Math.max(0, p - 1))}
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
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
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
