"use client";

import { useEffect, useRef, useState } from "react";

// Server renders every product card with a data-search attribute.
// This component filters them via display:none so crawlers still see
// the full DOM but humans get instant filtering. Also tracks empty
// section state so we can hide a section header when all its cards
// are filtered out.
export function MenuSearch({ categories }: { categories: { slug: string; name: string; count: number }[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(categories.map((c) => [c.slug, c.count]))
  );

  useEffect(() => {
    const q = query.trim().toLowerCase();
    const cards = document.querySelectorAll<HTMLElement>("[data-product-card]");
    const counts: Record<string, number> = Object.fromEntries(categories.map((c) => [c.slug, 0]));

    cards.forEach((card) => {
      const name = (card.dataset.search ?? "").toLowerCase();
      const cat = card.dataset.category ?? "";
      const matchesQuery = !q || name.includes(q);
      const matchesCat = active === "all" || active === cat;
      const show = matchesQuery && matchesCat;
      card.style.display = show ? "" : "none";
      if (show && counts[cat] !== undefined) counts[cat]++;
    });

    setVisibleCounts(counts);

    document.querySelectorAll<HTMLElement>("[data-category-section]").forEach((sec) => {
      const slug = sec.dataset.categorySection!;
      sec.style.display = counts[slug] > 0 ? "" : "none";
    });

    const empty = document.getElementById("menu-empty-state");
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (empty) empty.style.display = total === 0 ? "" : "none";
  }, [query, active, categories]);

  return (
    <div className="border-b border-stone-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 space-y-3">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, brands, or strains…"
            className="w-full pl-10 pr-10 py-3 rounded-2xl border border-stone-200 bg-white text-stone-800 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            aria-label="Search menu"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 text-lg leading-none flex items-center justify-center transition-colors"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setActive("all")}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
              active === "all"
                ? "bg-green-700 border-green-700 text-white"
                : "bg-white border-stone-200 text-stone-600 hover:border-green-300 hover:text-green-700"
            }`}
          >
            All
          </button>
          {categories.map((c) => {
            const isActive = active === c.slug;
            const count = visibleCounts[c.slug] ?? c.count;
            return (
              <button
                key={c.slug}
                onClick={() => setActive(c.slug)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                  isActive
                    ? "bg-green-700 border-green-700 text-white"
                    : count === 0
                      ? "bg-white border-stone-100 text-stone-300 cursor-not-allowed"
                      : "bg-white border-stone-200 text-stone-600 hover:border-green-300 hover:text-green-700"
                }`}
                disabled={count === 0 && active !== c.slug}
              >
                {c.name}
                <span className={`ml-1.5 tabular-nums ${isActive ? "text-green-200" : "text-stone-400"}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
