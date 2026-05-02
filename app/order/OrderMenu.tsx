"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { MenuProduct } from "@/lib/db";
import { STORE, getOrderingStatus, getPickupSlots, type OrderingStatus, type PickupSlot } from "@/lib/store";

type CartItem = MenuProduct & { quantity: number };
type SortKey = "default" | "price-asc" | "price-desc" | "thc-desc" | "name";

// Preferred sidebar order. Categories not on this list are appended at the
// end in alphabetical order, so the sidebar always reflects what's actually
// in the data without needing a code change for new categories.
const CATEGORY_ORDER = [
  "Flower",
  "Pre-Rolls",
  "Pre-Roll",
  "Vapes",
  "Cartridge",
  "Cartridges",
  "Disposable",
  "Disposables",
  "Pod",
  "Pods",
  "Concentrates",
  "Concentrate",
  "Edibles",
  "Edible",
  "Beverages",
  "Beverage",
  "Capsules",
  "Capsule",
  "Tinctures",
  "Tincture",
  "Topicals",
  "Topical",
  "CBD",
  "Accessories",
  "Accessory",
];

// DB-name → label shown in UI. Falls back to the raw category name.
const CAT_DISPLAY: Record<string, string> = {
  Cartridge: "Cartridges",
  Disposable: "Disposables",
  Pod: "Pods",
  Concentrate: "Concentrates",
  Edible: "Edibles",
  Beverage: "Beverages",
  Capsule: "Capsules",
  Tincture: "Tinctures",
  Topical: "Topicals",
  Accessory: "Accessories",
  "Pre-Roll": "Pre-Rolls",
};

const STRAIN_COLORS: Record<string, { badge: string; dot: string }> = {
  Sativa: { badge: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  Indica: { badge: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-400" },
  Hybrid: { badge: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-400" },
  CBD: { badge: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-400" },
};

const CAT_ICONS: Record<string, string> = {
  Flower: "🌿",
  "Pre-Rolls": "🫙",
  "Pre-Roll": "🫙",
  Vapes: "💨",
  Cartridge: "💨",
  Cartridges: "💨",
  Disposable: "💨",
  Disposables: "💨",
  Pod: "💨",
  Pods: "💨",
  Concentrates: "💎",
  Concentrate: "💎",
  Edibles: "🍬",
  Edible: "🍬",
  Beverages: "🥤",
  Beverage: "🥤",
  Capsules: "💊",
  Capsule: "💊",
  Tinctures: "💧",
  Tincture: "💧",
  Topicals: "🧴",
  Topical: "🧴",
  CBD: "🌱",
  Accessories: "🔧",
  Accessory: "🔧",
};

function displayCategory(c: string): string {
  return CAT_DISPLAY[c] ?? c;
}

// The DB has 30+ category strings — DOH-prefixed copies, plural/singular
// variants, "Edible (Liquid)" subforms, "Paraphernalia", etc. Customers
// should see one clean bucket per product type. Returning null filters
// the product out (e.g. internal "Sample" SKUs).
function normalizeCategory(raw: string | null): string | null {
  if (!raw) return null;
  // Strip the WSLCB "DOH " medical-endorsement prefix — these are sold to
  // all adults at retail, just tax-free for medical patients.
  const s = raw
    .trim()
    .replace(/^DOH\s+/i, "")
    .trim();
  const lower = s.toLowerCase().replace(/\s+/g, " ");
  if (lower === "sample") return null; // internal trade samples — never sold
  if (/^cartridges?$/.test(lower)) return "Cartridges";
  if (/^concentrates?$/.test(lower)) return "Concentrates";
  if (lower === "flower") return "Flower";
  if (/^(infused )?pre[-]?rolls?$/.test(lower)) return "Pre-Rolls";
  if (/^topicals?$/.test(lower)) return "Topicals";
  if (lower === "paraphernalia") return "Accessories";
  if (/^edibles? \(tincture\)$/.test(lower)) return "Tinctures";
  if (/^edibles? \(capsule\)$/.test(lower)) return "Capsules";
  if (/^(edibles? \(liquid\)|infused drinks?)$/.test(lower)) return "Beverages";
  if (/^edibles?( \(solid\))?$/.test(lower)) return "Edibles";
  return s;
}

// Strip duplicated brand / category / strain-type tokens from the SKU-shaped
// title and pull out a weight chip. e.g. "1g - Blueberry Pancakes - 2727 -
// Cartridge - H" with brand="2727", category="Cartridge", strainType="Hybrid"
// → { name: "Blueberry Pancakes", weight: "1g" }.
const STRAIN_TOKENS = new Set(["H", "I", "S", "C", "CBD", "Hybrid", "Indica", "Sativa"]);
const WEIGHT_RX = /^\d+(?:\.\d+)?\s*(?:g|mg|ml|oz)$/i;

function parseProductName(p: MenuProduct): { name: string; weight: string | null } {
  const parts = p.name
    .split(/\s+-\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  let weight: string | null = null;
  const kept: string[] = [];
  for (const part of parts) {
    if (WEIGHT_RX.test(part)) {
      if (!weight) weight = part.toLowerCase().replace(/\s+/g, "");
      continue;
    }
    if (p.brand && part.toLowerCase() === p.brand.toLowerCase()) continue;
    if (p.category && part.toLowerCase() === p.category.toLowerCase()) continue;
    if (STRAIN_TOKENS.has(part)) continue;
    kept.push(part);
  }
  return { name: kept.join(" — ") || p.name, weight };
}

function ProductImage({ src, alt, category }: { src: string | null; alt: string; category: string | null }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const icon = CAT_ICONS[category ?? ""] ?? "🌱";

  if (!src || errored) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-4xl">
        {icon}
      </div>
    );
  }

  return (
    <>
      {!loaded && <div className="absolute inset-0 img-placeholder" />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}

export function OrderMenu({ products }: { products: MenuProduct[] }) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("gl_cart");
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [strainFilter, setStrainFilter] = useState<string | null>(null);
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("default");
  const [cartOpen, setCartOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [pickupTime, setPickupTime] = useState<string>("");
  const [pickupSlots, setPickupSlots] = useState<PickupSlot[]>([]);
  const [orderingStatus, setOrderingStatus] = useState<OrderingStatus | null>(null);

  useEffect(() => {
    localStorage.setItem("gl_cart", JSON.stringify(cart));
  }, [cart]);

  // Refresh pickup window while the cart drawer is open so slots shrink as
  // close approaches and the closed-state message updates at the cutoff.
  useEffect(() => {
    if (!cartOpen) return;
    function refresh() {
      const status = getOrderingStatus();
      const slots = getPickupSlots();
      setOrderingStatus(status);
      setPickupSlots(slots);
      setPickupTime((prev) => (prev && slots.some((s) => s.value === prev) ? prev : (slots[0]?.value ?? "")));
    }
    refresh();
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, [cartOpen]);

  // Normalize raw DB categories to clean buckets ("DOH Cartridge" → "Cartridges",
  // "Edible (Liquid)" → "Beverages") and drop products with no displayable
  // category (e.g. internal "Sample" SKUs that aren't for sale).
  const visibleProducts = useMemo(() => {
    return products.flatMap((p) => {
      const cat = normalizeCategory(p.category);
      if (!cat) return [];
      return [{ ...p, category: cat }];
    });
  }, [products]);

  // Real categories from data, ordered by CATEGORY_ORDER first, then any
  // unknowns appended alphabetically. The sidebar always reflects what's
  // actually in stock — no whitelist drift.
  const categories = useMemo(() => {
    const seen = new Set<string>();
    for (const p of visibleProducts) if (p.category) seen.add(p.category);
    const orderIndex = new Map(CATEGORY_ORDER.map((c, i) => [c, i]));
    return [...seen].sort((a, b) => {
      const ai = orderIndex.get(a) ?? Number.MAX_SAFE_INTEGER;
      const bi = orderIndex.get(b) ?? Number.MAX_SAFE_INTEGER;
      if (ai !== bi) return ai - bi;
      return a.localeCompare(b);
    });
  }, [visibleProducts]);

  // Brands available within the currently-selected category, so the brand
  // dropdown narrows as you drill in.
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    for (const p of visibleProducts) {
      if (activeCategory && p.category !== activeCategory) continue;
      if (p.brand) set.add(p.brand);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [visibleProducts, activeCategory]);

  // Strain types present after category narrowing — hide pills that wouldn't
  // match anything (e.g. CBD when there's no CBD product in this category).
  const availableStrains = useMemo(() => {
    const set = new Set<string>();
    for (const p of visibleProducts) {
      if (activeCategory && p.category !== activeCategory) continue;
      if (p.strainType) set.add(p.strainType);
    }
    return [...set];
  }, [visibleProducts, activeCategory]);

  const filtered = useMemo(() => {
    const result = visibleProducts.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (strainFilter && p.strainType !== strainFilter) return false;
      if (brandFilter && p.brand !== brandFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (p.name + (p.brand ?? "") + (p.category ?? "") + (p.strainType ?? ""))
          .toLowerCase()
          .includes(q);
      }
      return true;
    });
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => (a.unitPrice ?? Infinity) - (b.unitPrice ?? Infinity));
        break;
      case "price-desc":
        result.sort((a, b) => (b.unitPrice ?? -Infinity) - (a.unitPrice ?? -Infinity));
        break;
      case "thc-desc":
        result.sort((a, b) => (b.thcPct ?? -Infinity) - (a.thcPct ?? -Infinity));
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return result;
  }, [products, search, activeCategory, strainFilter, brandFilter, sortBy]);

  const grouped = useMemo(() => {
    const map = new Map<string, MenuProduct[]>();
    for (const p of filtered) {
      const key = p.category ?? "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return map;
  }, [filtered]);

  const cartTotal = cart.reduce((s, i) => s + (i.unitPrice ?? 0) * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  function addToCart(product: MenuProduct) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0),
    );
  }

  function selectCategory(cat: string | null) {
    setActiveCategory(cat);
    setSearch("");
    // Clear stale brand/strain filters that won't match anything in the new
    // category. We do it here instead of in an effect to avoid the
    // setState-in-effect lint rule and a cascading re-render.
    setBrandFilter(null);
    setStrainFilter(null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function placeOrder() {
    if (!pickupTime) {
      setOrderError("Pick a pickup time before placing your order.");
      return;
    }
    setPlacing(true);
    try {
      const items = cart.map((i) => ({
        productId: i.id,
        productName: i.name,
        brand: i.brand,
        category: i.category,
        strainType: i.strainType,
        unitPrice: i.unitPrice ?? 0,
        quantity: i.quantity,
      }));
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, notes: notes || undefined, pickupTime }),
      });
      if (res.status === 401) {
        router.push("/sign-in?redirect_url=/order");
        return;
      }
      if (res.ok) {
        const body = await res.json().catch(() => null);
        localStorage.removeItem("gl_cart");
        if (body?.orderId) {
          router.push(`/order/confirmation/${body.orderId}`);
        } else {
          router.push("/account?ordered=1");
        }
      } else if (res.status === 409) {
        // Inventory mismatch — strip the unavailable items from the cart and
        // tell the customer what changed so they can try again.
        const body = (await res.json().catch(() => null)) as {
          issues?: Array<{ productId: string; productName: string; reason: string; onHand: number }>;
        } | null;
        const issues = body?.issues ?? [];
        if (issues.length > 0) {
          const offendingIds = new Set(issues.map((i) => i.productId));
          setCart((prev) => prev.filter((c) => !offendingIds.has(c.id)));
          const names = issues.map((i) => i.productName).join(", ");
          setOrderError(`No longer available — removed from cart: ${names}. Review and place again.`);
        } else {
          setOrderError("Some items aren't available — please update your cart.");
        }
        setPlacing(false);
      } else {
        const body = await res.json().catch(() => null);
        setOrderError(body?.error ?? "Something went wrong. Please try again.");
        setPlacing(false);
      }
    } catch {
      setOrderError("Network error. Check your connection and try again.");
      setPlacing(false);
    }
  }

  if (products.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center space-y-4">
        <div className="text-5xl mb-4">🌿</div>
        <p className="text-stone-700 text-xl font-semibold">Menu coming soon</p>
        <p className="text-stone-400 text-sm">
          Call us to place an order:{" "}
          <a href={`tel:${STORE.phoneTel}`} className="text-green-700 font-semibold">
            {STORE.phone}
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-32">
      {/* Search bar */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
          />
        </svg>
        <input
          type="search"
          placeholder="Search products, brands, strains…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setActiveCategory(null);
          }}
          className="w-full rounded-2xl border border-stone-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-300 text-xs"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex gap-6 items-start">
        {/* Sticky category sidebar (desktop) */}
        <aside className="hidden lg:block w-48 shrink-0 sticky top-20 space-y-1">
          <button
            onClick={() => selectCategory(null)}
            className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${activeCategory === null && !search ? "bg-green-100 text-green-800" : "text-stone-500 hover:bg-stone-100"}`}
          >
            <span className="text-base">🛒</span> All Items
            <span className="ml-auto text-[11px] text-stone-400">{visibleProducts.length}</span>
          </button>
          {categories.map((c) => {
            const count = visibleProducts.reduce((n, p) => n + (p.category === c ? 1 : 0), 0);
            return (
              <button
                key={c}
                onClick={() => selectCategory(c)}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${activeCategory === c ? "bg-green-100 text-green-800" : "text-stone-500 hover:bg-stone-100"}`}
              >
                <span className="text-base">{CAT_ICONS[c] ?? "•"}</span>
                <span className="truncate">{displayCategory(c)}</span>
                <span className="ml-auto text-[11px] text-stone-400">{count}</span>
              </button>
            );
          })}
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Mobile category pills */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
            <button
              onClick={() => selectCategory(null)}
              className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors ${activeCategory === null ? "bg-green-800 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => selectCategory(activeCategory === c ? null : c)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors ${activeCategory === c ? "bg-green-800 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
              >
                <span>{CAT_ICONS[c] ?? "•"}</span>
                {displayCategory(c)}
              </button>
            ))}
          </div>

          {/* Filter rail — strain pills, brand dropdown, sort dropdown.
              Hidden when no products would benefit (≤6 results). */}
          {filtered.length > 6 && (
            <div className="flex flex-wrap items-center gap-2 mb-5 pb-4 border-b border-stone-100">
              {availableStrains.length > 1 && (
                <div className="flex gap-1.5">
                  {availableStrains.map((s) => {
                    const colors = STRAIN_COLORS[s];
                    const active = strainFilter === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setStrainFilter(active ? null : s)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${active ? `${colors?.badge ?? "bg-green-100 text-green-800 border-green-200"} ring-2 ring-offset-1 ring-stone-300` : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"}`}
                      >
                        {colors && (
                          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${colors.dot}`} />
                        )}
                        {s}
                      </button>
                    );
                  })}
                </div>
              )}

              {availableBrands.length > 1 && (
                <select
                  value={brandFilter ?? ""}
                  onChange={(e) => setBrandFilter(e.target.value || null)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-stone-200 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All brands ({availableBrands.length})</option>
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-stone-200 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-green-500 ml-auto"
              >
                <option value="default">Sort: Featured</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="thc-desc">THC %: High → Low</option>
                <option value="name">A → Z</option>
              </select>

              {(strainFilter || brandFilter || sortBy !== "default") && (
                <button
                  onClick={() => {
                    setStrainFilter(null);
                    setBrandFilter(null);
                    setSortBy("default");
                  }}
                  className="text-xs font-semibold text-stone-500 hover:text-stone-700 px-2 py-1.5"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Product grid by category */}
          <div className="space-y-12">
            {[...grouped.entries()].map(([category, items]) => {
              // In the All-Items view, cap each category at 24 cards so the
              // initial render isn't 10K+ products / 17MB of HTML. The
              // "Show all" button switches to that category, which then
              // renders the full list. When a category is already selected
              // or the user has filtered/searched, render every match.
              const isCapped = activeCategory === null && !search && !strainFilter && !brandFilter;
              const visibleItems = isCapped ? items.slice(0, 24) : items;
              const hiddenCount = items.length - visibleItems.length;
              return (
                <section key={category}>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-2xl">{CAT_ICONS[category] ?? "🌱"}</span>
                    <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
                      {displayCategory(category)}
                    </h2>
                    <span className="text-xs font-medium text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                      {items.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {visibleItems.map((product) => {
                      const cartItem = cart.find((i) => i.id === product.id);
                      const strain = product.strainType ? STRAIN_COLORS[product.strainType] : null;
                      const parsed = parseProductName(product);
                      return (
                        <div
                          key={product.id}
                          className="group rounded-2xl border border-stone-100 bg-white overflow-hidden hover:border-green-300 hover:shadow-lg transition-all duration-200"
                        >
                          {/* Image */}
                          <div className="relative w-full h-44 overflow-hidden bg-stone-100">
                            <ProductImage
                              src={product.imageUrl}
                              alt={product.name}
                              category={product.category}
                            />
                            {strain && (
                              <span
                                className={`absolute top-2.5 left-2.5 text-xs px-2.5 py-1 rounded-full font-semibold border ${strain.badge}`}
                              >
                                <span
                                  className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${strain.dot}`}
                                />
                                {product.strainType}
                              </span>
                            )}
                            {parsed.weight && (
                              <span className="absolute bottom-2.5 left-2.5 text-[11px] px-2 py-0.5 rounded-full font-bold bg-white/90 text-stone-700 border border-stone-200 shadow-sm">
                                {parsed.weight}
                              </span>
                            )}
                            {product.isNew && (
                              <span className="absolute top-2.5 right-2.5 text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-700 text-white shadow-md uppercase tracking-wide">
                                New
                              </span>
                            )}
                            {cartItem && !product.isNew && (
                              <span className="absolute top-2.5 right-2.5 bg-green-700 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                                {cartItem.quantity}
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-4 space-y-3">
                            <div>
                              {product.brand && (
                                <div className="text-xs text-stone-400 font-semibold uppercase tracking-widest mb-0.5">
                                  {product.brand}
                                </div>
                              )}
                              <div className="font-bold text-stone-900 text-sm leading-snug">
                                {parsed.name}
                              </div>
                            </div>

                            {/* Potency badges */}
                            {(product.thcPct != null || product.cbdPct != null) && (
                              <div className="flex flex-wrap gap-1.5">
                                {product.thcPct != null && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                                    THC {product.thcPct.toFixed(1)}%
                                  </span>
                                )}
                                {product.cbdPct != null && product.cbdPct > 0 && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                                    CBD {product.cbdPct.toFixed(1)}%
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Effects / terpenes */}
                            {product.effects && (
                              <p className="text-xs text-stone-400 leading-relaxed line-clamp-1">
                                ✨ {product.effects}
                              </p>
                            )}

                            {/* Price + Add */}
                            <div className="flex items-center justify-between pt-1 border-t border-stone-50">
                              <div className="font-extrabold text-stone-900 text-base">
                                {product.unitPrice != null ? `$${product.unitPrice.toFixed(2)}` : "—"}
                              </div>
                              {cartItem ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updateQty(product.id, -1)}
                                    className="w-8 h-8 rounded-full border-2 border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 hover:border-stone-300 text-sm font-bold transition-colors"
                                  >
                                    −
                                  </button>
                                  <span className="w-6 text-center text-sm font-extrabold text-stone-900">
                                    {cartItem.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQty(product.id, 1)}
                                    className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white hover:bg-green-600 text-sm font-bold transition-colors shadow-md shadow-green-900/20"
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => addToCart(product)}
                                  disabled={product.unitPrice == null}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-600 active:bg-green-800 text-white text-xs font-bold transition-all shadow-md shadow-green-900/20 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
                                >
                                  + Add
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {hiddenCount > 0 && (
                    <button
                      onClick={() => selectCategory(category)}
                      className="mt-5 w-full text-center text-sm font-bold text-green-700 hover:text-green-600 py-3 rounded-xl border border-stone-100 hover:border-green-200 hover:bg-green-50/50 transition-colors"
                    >
                      Show all {items.length} {displayCategory(category).toLowerCase()} →
                    </button>
                  )}
                </section>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="py-20 text-center space-y-3">
              <div className="text-4xl">🔍</div>
              <p className="text-stone-500 font-medium">No products match &ldquo;{search}&rdquo;</p>
              <button
                onClick={() => setSearch("")}
                className="text-sm text-green-700 font-semibold hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Floating cart bar ─────────────────────────────────────────────── */}
      {cartCount > 0 && (
        <div
          className="fixed left-0 right-0 px-4 z-40 animate-slide-up"
          style={{ bottom: "max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))" }}
        >
          <div className="max-w-lg mx-auto">
            {cartOpen ? (
              <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden animate-pop">
                {/* Cart header */}
                <div className="px-5 py-4 bg-gradient-to-r from-green-900 to-green-800 text-white flex items-center justify-between">
                  <span className="font-bold text-base">
                    Your Order · {cartCount} {cartCount === 1 ? "item" : "items"}
                  </span>
                  <button
                    onClick={() => {
                      setCartOpen(false);
                      setOrderError(null);
                    }}
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg leading-none transition-colors"
                  >
                    ×
                  </button>
                </div>

                {/* Items */}
                <div className="p-4 space-y-2 max-h-52 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-stone-50 rounded-xl px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-stone-700 truncate">{item.name}</div>
                        {item.brand && <div className="text-xs text-stone-400 truncate">{item.brand}</div>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-200 text-xs font-bold"
                        >
                          −
                        </button>
                        <span className="w-5 text-center font-extrabold text-stone-900 text-xs">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-6 h-6 rounded-full bg-green-700 flex items-center justify-center text-white hover:bg-green-600 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs font-bold text-stone-700 w-14 text-right shrink-0">
                        ${((item.unitPrice ?? 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 pb-4 space-y-3">
                  {/* Pickup time picker */}
                  {orderingStatus?.state === "open" && pickupSlots.length > 0 && (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="pickup-time"
                        className="block text-xs font-bold text-stone-700 uppercase tracking-wide"
                      >
                        Pick up at
                      </label>
                      <select
                        id="pickup-time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        {pickupSlots.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-stone-400">
                        Earliest slot is 30 min from now. Last call is 15 min before close.
                      </p>
                    </div>
                  )}
                  {orderingStatus && orderingStatus.state !== "open" && (
                    <div className="px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium space-y-0.5">
                      <p className="font-bold">Online ordering is closed right now.</p>
                      {orderingStatus.state === "before_open" && (
                        <p>Opens at {orderingStatus.opensAt} today.</p>
                      )}
                      {orderingStatus.state === "after_last_call" && (
                        <p>
                          Last call is 15 min before close ({orderingStatus.closesToday}). Reopens at{" "}
                          {orderingStatus.reopensAt}.
                        </p>
                      )}
                      {orderingStatus.state === "closed_today" && <p>Reopens at {orderingStatus.opensAt}.</p>}
                    </div>
                  )}

                  <textarea
                    placeholder="Special requests or notes…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 bg-stone-50"
                  />
                  {orderError && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {orderError}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-stone-400">Est. total · cash in store</div>
                      <div className="text-2xl font-extrabold text-stone-900">${cartTotal.toFixed(2)}</div>
                    </div>
                    <button
                      onClick={placeOrder}
                      disabled={placing || orderingStatus?.state !== "open" || !pickupTime}
                      className="px-6 py-3 rounded-2xl bg-green-700 hover:bg-green-600 active:bg-green-800 text-white font-bold text-sm transition-all shadow-lg shadow-green-900/30 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
                    >
                      {placing ? "Placing…" : "Place Order →"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
                    <svg
                      className="w-3.5 h-3.5 text-amber-500 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-xs text-amber-700 font-medium">
                      Quick sign-in required — your cart will be saved
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setCartOpen(true);
                  setOrderError(null);
                }}
                className="w-full bg-gradient-to-r from-green-900 to-green-800 hover:from-green-800 hover:to-green-700 text-white rounded-3xl py-4 px-5 flex items-center justify-between shadow-2xl transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <span className="bg-green-500 text-white text-xs font-extrabold w-7 h-7 rounded-full flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                  <span className="font-bold">View Order</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg">${cartTotal.toFixed(2)}</span>
                  <svg
                    className="w-4 h-4 opacity-70"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
