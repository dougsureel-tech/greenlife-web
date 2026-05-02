"use client";

import { useEffect, useRef, useState } from "react";

// Server renders every product card with a data-search attribute.
// This component filters them via display:none so crawlers still see
// the full DOM but humans get instant filtering. Also tracks empty
// section state so we can hide a section header when all its cards
// are filtered out.

const VIBES: { value: string; emoji: string; label: string; match: string[] }[] = [
  { value: "chill", emoji: "😌", label: "Chill", match: ["relax", "calm", "chill", "mellow"] },
  { value: "energize", emoji: "⚡", label: "Energize", match: ["energ", "uplift", "focus", "creative"] },
  { value: "sleep", emoji: "💤", label: "Sleep", match: ["sleep", "sedat", "drowsy", "bed"] },
  { value: "creative", emoji: "🎨", label: "Creative", match: ["creativ", "focus"] },
  { value: "social", emoji: "🥂", label: "Social", match: ["social", "happy", "talk", "giggl"] },
  { value: "relief", emoji: "🌱", label: "Relief", match: ["pain", "relief", "anti", "anxiety"] },
];

export function MenuSearch({ categories }: { categories: { slug: string; name: string; count: number }[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [strain, setStrain] = useState<string>(""); // sativa | indica | hybrid | ""
  const [vibe, setVibe] = useState<string>(""); // matches VIBES.value
  const [price, setPrice] = useState<string>(""); // u20 | 20-40 | 40p | ""
  const [thc, setThc] = useState<string>(""); // low | mid | high | ""
  const [newOnly, setNewOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState<"" | "price-asc" | "price-desc" | "thc-desc" | "newest">("");

  // Pre-fill from URL params after mount so /find-your-strain and the
  // homepage's mood chips deep-link straight into a filtered view.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qp = params.get("q");
    if (qp) setQuery(qp);
    const cat = params.get("category");
    if (cat)
      setActive(
        cat
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      );
    const s = params.get("strain");
    if (s) setStrain(s.toLowerCase());
    const v = params.get("vibe");
    if (v) setVibe(v.toLowerCase());
    if (params.get("new")) setNewOnly(true);
    // Open the filter panel if any non-search filter was deep-linked
    if (s || v || params.get("price") || params.get("thc") || params.get("new")) {
      setShowFilters(true);
    }
    if (params.get("price")) setPrice(params.get("price")!);
    if (params.get("thc")) setThc(params.get("thc")!);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(categories.map((c) => [c.slug, c.count])),
  );

  useEffect(() => {
    const q = query.trim().toLowerCase();
    const cards = document.querySelectorAll<HTMLElement>("[data-product-card]");
    const counts: Record<string, number> = Object.fromEntries(categories.map((c) => [c.slug, 0]));

    const vibeMatchTokens = vibe ? (VIBES.find((v) => v.value === vibe)?.match ?? []) : [];

    cards.forEach((card) => {
      const name = (card.dataset.search ?? "").toLowerCase();
      const cat = card.dataset.category ?? "";
      const cardStrain = (card.dataset.strain ?? "").toLowerCase();
      const cardPrice = card.dataset.priceBucket ?? "";
      const cardThc = card.dataset.thcBucket ?? "";
      const cardVibe = (card.dataset.vibe ?? "").toLowerCase();
      const cardIsNew = card.dataset.isnew === "1";

      const matchesQuery = !q || name.includes(q);
      const matchesCat = active === "all" || active === cat;
      const matchesStrain = !strain || cardStrain.includes(strain);
      const matchesPrice = !price || cardPrice === price;
      const matchesThc = !thc || cardThc === thc;
      const matchesVibe = !vibe || vibeMatchTokens.some((tok) => cardVibe.includes(tok));
      const matchesNew = !newOnly || cardIsNew;

      const show =
        matchesQuery &&
        matchesCat &&
        matchesStrain &&
        matchesPrice &&
        matchesThc &&
        matchesVibe &&
        matchesNew;
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
  }, [query, active, strain, vibe, price, thc, newOnly, categories]);

  // Sort effect — uses CSS `order` so we don't have to reorder DOM nodes.
  // Each section's grid container is display:grid with a default order of 0;
  // assigning order: i puts each card in rank order within its section.
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>("[data-product-card]");
    if (sort === "") {
      cards.forEach((c) => {
        c.style.order = "";
      });
      return;
    }

    // Group cards by section and sort each group independently so the
    // section dividers stay in place.
    const bySection = new Map<string, HTMLElement[]>();
    cards.forEach((c) => {
      const section = c.dataset.category ?? "";
      if (!bySection.has(section)) bySection.set(section, []);
      bySection.get(section)!.push(c);
    });

    bySection.forEach((items) => {
      items.sort((a, b) => {
        if (sort === "price-asc")
          return parseFloat(a.dataset.price || "Infinity") - parseFloat(b.dataset.price || "Infinity");
        if (sort === "price-desc")
          return parseFloat(b.dataset.price || "-1") - parseFloat(a.dataset.price || "-1");
        if (sort === "thc-desc") return parseFloat(b.dataset.thc || "-1") - parseFloat(a.dataset.thc || "-1");
        if (sort === "newest") return (b.dataset.isnew === "1" ? 1 : 0) - (a.dataset.isnew === "1" ? 1 : 0);
        return 0;
      });
      items.forEach((card, i) => {
        card.style.order = String(i);
      });
    });
  }, [sort, query, active, strain, vibe, price, thc, newOnly]);

  const activeFilterCount = [strain, vibe, price, thc, newOnly ? "new" : ""].filter(Boolean).length;

  function clearAll() {
    setStrain("");
    setVibe("");
    setPrice("");
    setThc("");
    setNewOnly(false);
  }

  return (
    <div className="sticky top-16 z-30 border-b border-stone-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 space-y-3">
        {/* Search box */}
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
            />
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
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 text-lg leading-none flex items-center justify-center transition-colors"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Category chips + filter toggle */}
        <div className="flex items-center gap-2">
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 flex-1">
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
                  <span className={`ml-1.5 tabular-nums ${isActive ? "text-green-200" : "text-stone-400"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="shrink-0 relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className={`appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                sort
                  ? "bg-green-50 border-green-300 text-green-800"
                  : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"
              }`}
              aria-label="Sort products"
            >
              <option value="">Sort</option>
              <option value="price-asc">Price · low → high</option>
              <option value="price-desc">Price · high → low</option>
              <option value="thc-desc">THC · highest first</option>
              <option value="newest">New this week first</option>
            </select>
            <svg
              className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              activeFilterCount > 0 || showFilters
                ? "bg-green-50 border-green-300 text-green-800"
                : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"
            }`}
            aria-expanded={showFilters}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.59a1 1 0 01-.29.7L15 13v6l-6 2v-8L3.29 7.29A1 1 0 013 6.59V4z"
              />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-green-700 text-white text-[10px] tabular-nums">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Expanded filter panel */}
        {showFilters && (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-4">
            {/* Mood / vibe */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500 mb-2">Mood</p>
              <div className="flex flex-wrap gap-1.5">
                {VIBES.map((v) => {
                  const on = vibe === v.value;
                  return (
                    <button
                      key={v.value}
                      onClick={() => setVibe(on ? "" : v.value)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        on
                          ? "bg-green-700 text-white border-green-700"
                          : "bg-white text-stone-700 border-stone-200 hover:border-green-300"
                      }`}
                    >
                      <span aria-hidden>{v.emoji}</span>
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Strain type */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500 mb-2">Strain</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: "sativa", label: "☀️ Sativa" },
                  { value: "indica", label: "🌙 Indica" },
                  { value: "hybrid", label: "🍃 Hybrid" },
                ].map((s) => {
                  const on = strain === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={() => setStrain(on ? "" : s.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        on
                          ? "bg-green-700 text-white border-green-700"
                          : "bg-white text-stone-700 border-stone-200 hover:border-green-300"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500 mb-2">Price</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: "u20", label: "Under $20" },
                  { value: "20-40", label: "$20–$40" },
                  { value: "40p", label: "$40+" },
                ].map((p) => {
                  const on = price === p.value;
                  return (
                    <button
                      key={p.value}
                      onClick={() => setPrice(on ? "" : p.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        on
                          ? "bg-green-700 text-white border-green-700"
                          : "bg-white text-stone-700 border-stone-200 hover:border-green-300"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* THC% */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500 mb-2">
                Potency (THC)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: "low", label: "Low · under 15%" },
                  { value: "mid", label: "Mid · 15–25%" },
                  { value: "high", label: "High · 25%+" },
                ].map((t) => {
                  const on = thc === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setThc(on ? "" : t.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        on
                          ? "bg-green-700 text-white border-green-700"
                          : "bg-white text-stone-700 border-stone-200 hover:border-green-300"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* New only + clear */}
            <div className="flex items-center justify-between pt-1">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newOnly}
                  onChange={(e) => setNewOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-green-700 focus:ring-green-500"
                />
                ✨ Just In (last 7 days)
              </label>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs font-bold text-stone-500 hover:text-rose-600 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
