"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { MenuProduct } from "@/lib/db";

type CartItem = MenuProduct & { quantity: number };

const CATEGORIES = ["Flower", "Pre-Rolls", "Vapes", "Concentrates", "Edibles", "Tinctures", "Topicals", "Accessories"];
const STRAIN_COLORS: Record<string, string> = {
  Sativa: "bg-red-100 text-red-700",
  Indica: "bg-purple-100 text-purple-700",
  Hybrid: "bg-green-100 text-green-700",
};

export function OrderMenu({ products }: { products: MenuProduct[] }) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [notes, setNotes] = useState("");

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
        return (p.name + (p.brand ?? "") + (p.category ?? "")).toLowerCase().includes(q);
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

  async function placeOrder() {
    setPlacing(true);
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
      body: JSON.stringify({ items, notes: notes || undefined }),
    });

    if (res.status === 401) {
      router.push("/sign-in?redirect_url=/order");
      return;
    }
    if (res.ok) {
      router.push("/account?ordered=1");
    } else {
      alert("Something went wrong. Please try again.");
      setPlacing(false);
    }
  }

  if (products.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center space-y-4">
        <p className="text-stone-400 text-lg">Menu coming soon</p>
        <p className="text-stone-500 text-sm">Call us to place an order: <a href="tel:+15096639980" className="text-green-700 font-medium">(509) 663-9980</a></p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-32">
      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          placeholder="Search products, brands…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${activeCategory === null ? "bg-green-800 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button key={c}
              onClick={() => setActiveCategory(activeCategory === c ? null : c)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${activeCategory === c ? "bg-green-800 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid by category */}
      <div className="space-y-10">
        {[...grouped.entries()].map(([category, items]) => (
          <section key={category}>
            <h2 className="text-lg font-bold text-stone-800 mb-4">{category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((product) => {
                const cartItem = cart.find((i) => i.id === product.id);
                return (
                  <div key={product.id} className="rounded-2xl border border-stone-200 bg-white overflow-hidden hover:border-green-300 transition-colors">
                    {product.imageUrl && (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-36 object-cover" />
                    )}
                    <div className="p-4 space-y-2">
                      <div className="space-y-0.5">
                        {product.brand && <div className="text-xs text-stone-400 font-medium uppercase tracking-wide">{product.brand}</div>}
                        <div className="font-semibold text-stone-900 text-sm leading-tight">{product.name}</div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {product.strainType && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STRAIN_COLORS[product.strainType] ?? "bg-stone-100 text-stone-600"}`}>
                            {product.strainType}
                          </span>
                        )}
                        {product.thcPct != null && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                            THC {product.thcPct.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <div className="font-bold text-stone-900">
                          {product.unitPrice != null ? `$${product.unitPrice.toFixed(2)}` : "—"}
                        </div>
                        {cartItem ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQty(product.id, -1)}
                              className="w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 text-sm font-bold">
                              −
                            </button>
                            <span className="w-5 text-center text-sm font-semibold text-stone-800">{cartItem.quantity}</span>
                            <button onClick={() => updateQty(product.id, 1)}
                              className="w-7 h-7 rounded-full bg-green-700 flex items-center justify-center text-white hover:bg-green-600 text-sm font-bold">
                              +
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => addToCart(product)}
                            disabled={product.unitPrice == null}
                            className="px-3 py-1.5 rounded-lg bg-green-700 hover:bg-green-600 text-white text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                            Add
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

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-0 right-0 px-4 z-40">
          <div className="max-w-lg mx-auto">
            {cartOpen ? (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden">
                <div className="px-4 py-3 bg-green-800 text-white flex items-center justify-between">
                  <span className="font-semibold">Your Order ({cartCount} items)</span>
                  <button onClick={() => setCartOpen(false)} className="text-green-200 hover:text-white text-xl leading-none">×</button>
                </div>
                <div className="p-4 space-y-2 max-h-56 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex-1 text-stone-700 truncate">{item.name}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-100 text-xs font-bold">−</button>
                        <span className="w-4 text-center font-semibold text-stone-800">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-full bg-green-700 flex items-center justify-center text-white hover:bg-green-600 text-xs font-bold">+</button>
                      </div>
                      <span className="text-stone-600 w-14 text-right">${((item.unitPrice ?? 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-stone-100 space-y-3">
                  <textarea
                    placeholder="Special requests or notes…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-stone-400">Total (pay cash in store)</div>
                      <div className="text-lg font-bold text-stone-900">${cartTotal.toFixed(2)}</div>
                    </div>
                    <button onClick={placeOrder} disabled={placing}
                      className="px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white font-semibold text-sm transition-colors disabled:opacity-60">
                      {placing ? "Placing…" : "Place Order"}
                    </button>
                  </div>
                  <p className="text-xs text-stone-400 text-center">You&apos;ll need to sign in to confirm your order</p>
                </div>
              </div>
            ) : (
              <button onClick={() => setCartOpen(true)}
                className="w-full bg-green-800 hover:bg-green-700 text-white rounded-2xl py-3.5 px-5 flex items-center justify-between shadow-xl transition-colors">
                <div className="flex items-center gap-2">
                  <span className="bg-white text-green-800 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{cartCount}</span>
                  <span className="font-semibold">View Order</span>
                </div>
                <span className="font-bold">${cartTotal.toFixed(2)}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
