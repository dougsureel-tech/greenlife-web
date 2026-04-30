"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import type { MenuProduct } from "@/lib/db";
import { STORE } from "@/lib/store";

type CartItem = MenuProduct & { quantity: number };

const CATEGORIES = ["Flower", "Pre-Rolls", "Vapes", "Concentrates", "Edibles", "Tinctures", "Topicals", "Accessories"];

const STRAIN_COLORS: Record<string, { badge: string; dot: string }> = {
  Sativa:  { badge: "bg-amber-100 text-amber-700 border-amber-200",   dot: "bg-amber-400" },
  Indica:  { badge: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-400" },
  Hybrid:  { badge: "bg-green-100 text-green-700 border-green-200",   dot: "bg-green-400" },
};

const CAT_ICONS: Record<string, string> = {
  Flower: "🌿", "Pre-Rolls": "🫙", Vapes: "💨", Concentrates: "🧴",
  Edibles: "🍬", Tinctures: "💊", Topicals: "🧼", Accessories: "🔧",
};

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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [notes, setNotes] = useState("");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const categories = useMemo(() => {
    const seen = new Set<string>();
    for (const p of products) if (p.category) seen.add(p.category);
    return CATEGORIES.filter((c) => seen.has(c));
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return (p.name + (p.brand ?? "") + (p.category ?? "") + (p.strainType ?? "")).toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, search, activeCategory]);

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
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, quantity: i.quantity + delta } : i).filter((i) => i.quantity > 0));
  }

  function scrollTo(cat: string) {
    setActiveCategory(null);
    setTimeout(() => {
      sectionRefs.current[cat]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  async function placeOrder() {
    setPlacing(true);
    try {
      const items = cart.map((i) => ({
        productId: i.id, productName: i.name, brand: i.brand, category: i.category,
        strainType: i.strainType, unitPrice: i.unitPrice ?? 0, quantity: i.quantity,
      }));
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, notes: notes || undefined }),
      });
      if (res.status === 401) { router.push("/sign-in?redirect_url=/order"); return; }
      if (res.ok) { router.push("/account?ordered=1"); }
      else { alert("Something went wrong. Please try again."); setPlacing(false); }
    } catch {
      alert("Network error. Check your connection and try again.");
      setPlacing(false);
    }
  }

  if (products.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center space-y-4">
        <div className="text-5xl mb-4">🌿</div>
        <p className="text-stone-700 text-xl font-semibold">Menu coming soon</p>
        <p className="text-stone-400 text-sm">Call us to place an order: <a href={`tel:${STORE.phoneTel}`} className="text-green-700 font-semibold">{STORE.phone}</a></p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-32">
      {/* Search bar */}
      <div className="relative mb-4">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </svg>
        <input
          type="search"
          placeholder="Search products, brands, strains…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setActiveCategory(null); }}
          className="w-full rounded-2xl border border-stone-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-300 text-xs">
            ×
          </button>
        )}
      </div>

      <div className="flex gap-6 items-start">
        {/* Sticky category sidebar (desktop) */}
        <aside className="hidden lg:block w-44 shrink-0 sticky top-20 space-y-1">
          <button
            onClick={() => setActiveCategory(null)}
            className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${activeCategory === null && !search ? "bg-green-100 text-green-800" : "text-stone-500 hover:bg-stone-100"}`}
          >
            <span className="text-base">🛒</span> All Items
          </button>
          {categories.map((c) => (
            <button key={c}
              onClick={() => scrollTo(c)}
              className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${activeCategory === c ? "bg-green-100 text-green-800" : "text-stone-500 hover:bg-stone-100"}`}
            >
              <span className="text-base">{CAT_ICONS[c] ?? "•"}</span> {c}
            </button>
          ))}
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Mobile category pills */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
            <button
              onClick={() => setActiveCategory(null)}
              className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors ${activeCategory === null ? "bg-green-800 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
            >
              All
            </button>
            {categories.map((c) => (
              <button key={c}
                onClick={() => setActiveCategory(activeCategory === c ? null : c)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors ${activeCategory === c ? "bg-green-800 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
              >
                <span>{CAT_ICONS[c] ?? "•"}</span>{c}
              </button>
            ))}
          </div>

          {/* Product grid by category */}
          <div className="space-y-12">
            {[...grouped.entries()].map(([category, items]) => (
              <section key={category} ref={(el) => { sectionRefs.current[category] = el; }}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl">{CAT_ICONS[category] ?? "🌱"}</span>
                  <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">{category}</h2>
                  <span className="text-xs font-medium text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{items.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {items.map((product) => {
                    const cartItem = cart.find((i) => i.id === product.id);
                    const strain = product.strainType ? STRAIN_COLORS[product.strainType] : null;
                    return (
                      <div key={product.id}
                        className="group rounded-2xl border border-stone-100 bg-white overflow-hidden hover:border-green-300 hover:shadow-lg transition-all duration-200">
                        {/* Image */}
                        <div className="relative w-full h-44 overflow-hidden bg-stone-100">
                          <ProductImage src={product.imageUrl} alt={product.name} category={product.category} />
                          {strain && (
                            <span className={`absolute top-2.5 left-2.5 text-xs px-2.5 py-1 rounded-full font-semibold border ${strain.badge}`}>
                              <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${strain.dot}`} />
                              {product.strainType}
                            </span>
                          )}
                          {cartItem && (
                            <span className="absolute top-2.5 right-2.5 bg-green-700 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                              {cartItem.quantity}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-4 space-y-3">
                          <div>
                            {product.brand && (
                              <div className="text-xs text-stone-400 font-semibold uppercase tracking-widest mb-0.5">{product.brand}</div>
                            )}
                            <div className="font-bold text-stone-900 text-sm leading-snug">{product.name}</div>
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
                                <button onClick={() => updateQty(product.id, -1)}
                                  className="w-8 h-8 rounded-full border-2 border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 hover:border-stone-300 text-sm font-bold transition-colors">
                                  −
                                </button>
                                <span className="w-6 text-center text-sm font-extrabold text-stone-900">{cartItem.quantity}</span>
                                <button onClick={() => updateQty(product.id, 1)}
                                  className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white hover:bg-green-600 text-sm font-bold transition-colors shadow-md shadow-green-900/20">
                                  +
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => addToCart(product)}
                                disabled={product.unitPrice == null}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-600 active:bg-green-800 text-white text-xs font-bold transition-all shadow-md shadow-green-900/20 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5">
                                + Add
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-20 text-center space-y-3">
              <div className="text-4xl">🔍</div>
              <p className="text-stone-500 font-medium">No products match &ldquo;{search}&rdquo;</p>
              <button onClick={() => setSearch("")} className="text-sm text-green-700 font-semibold hover:underline">Clear search</button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Floating cart bar ─────────────────────────────────────────────── */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-0 right-0 px-4 z-40 animate-slide-up">
          <div className="max-w-lg mx-auto">
            {cartOpen ? (
              <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden animate-pop">
                {/* Cart header */}
                <div className="px-5 py-4 bg-gradient-to-r from-green-900 to-green-800 text-white flex items-center justify-between">
                  <span className="font-bold text-base">Your Order · {cartCount} {cartCount === 1 ? "item" : "items"}</span>
                  <button onClick={() => setCartOpen(false)}
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg leading-none transition-colors">
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
                        <button onClick={() => updateQty(item.id, -1)}
                          className="w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-200 text-xs font-bold">−</button>
                        <span className="w-5 text-center font-extrabold text-stone-900 text-xs">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, 1)}
                          className="w-6 h-6 rounded-full bg-green-700 flex items-center justify-center text-white hover:bg-green-600 text-xs font-bold">+</button>
                      </div>
                      <span className="text-xs font-bold text-stone-700 w-14 text-right shrink-0">
                        ${((item.unitPrice ?? 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 pb-4 space-y-3">
                  <textarea
                    placeholder="Special requests or notes…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 bg-stone-50"
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-stone-400">Est. total · cash in store</div>
                      <div className="text-2xl font-extrabold text-stone-900">${cartTotal.toFixed(2)}</div>
                    </div>
                    <button onClick={placeOrder} disabled={placing}
                      className="px-6 py-3 rounded-2xl bg-green-700 hover:bg-green-600 active:bg-green-800 text-white font-bold text-sm transition-all shadow-lg shadow-green-900/30 disabled:opacity-60 hover:-translate-y-0.5">
                      {placing ? "Placing…" : "Place Order →"}
                    </button>
                  </div>
                  <p className="text-xs text-stone-400 text-center">Sign-in required to confirm your pickup order</p>
                </div>
              </div>
            ) : (
              <button onClick={() => setCartOpen(true)}
                className="w-full bg-gradient-to-r from-green-900 to-green-800 hover:from-green-800 hover:to-green-700 text-white rounded-3xl py-4 px-5 flex items-center justify-between shadow-2xl transition-all hover:-translate-y-0.5">
                <div className="flex items-center gap-3">
                  <span className="bg-green-500 text-white text-xs font-extrabold w-7 h-7 rounded-full flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                  <span className="font-bold">View Order</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg">${cartTotal.toFixed(2)}</span>
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
