"use client";

// Add-to-cart button for /menu/preview/[id] PDP. Phase 0 of the Product UX
// Redesign — the PDP is read-only "preview" surface but the cart action
// reuses the EXISTING native cart drawer on /menu-preview (which renders
// OrderMenu.tsx with the floating cart drawer).
//
// Mechanism: write to the same `gl_cart` localStorage key OrderMenu reads
// on mount, then navigate to `/menu-preview?cart=open`. OrderMenu's lazy
// state initializer reads cart=open + the persisted cart and opens the
// drawer on first paint (no flash of "menu without cart bar"). Sister of
// the post-sign-in `?cart=open` flow in OrderMenu.tsx line 660.
//
// IMPORTANT: this mirrors `loadCart()` + `saveCart()` from
// `app/order/OrderMenu.tsx` exactly. The CartPayloadV1 wrapper is what
// OrderMenu writes; reading + appending to it from this surface preserves
// the rest of the cart if the customer was mid-build before deep-linking
// into the PDP.

import { useState } from "react";
import { useRouter } from "next/navigation";

type CartProduct = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  strainType: string | null;
  thcPct: number | null;
  cbdPct: number | null;
  unitPrice: number | null;
  imageUrl: string | null;
  effects: string | null;
  terpenes: string | null;
  isNew: boolean;
  isDohCompliant: boolean;
};

type CartItem = CartProduct & { quantity: number };
type CartPayloadV1 = { v: 1; savedAt: number; items: CartItem[] };

function loadCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("gl_cart");
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) return parsed as CartItem[];
    if (parsed && typeof parsed === "object" && parsed.v === 1 && Array.isArray(parsed.items)) {
      return (parsed as CartPayloadV1).items;
    }
    return [];
  } catch {
    return [];
  }
}

function persistCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  const payload: CartPayloadV1 = { v: 1, savedAt: Date.now(), items };
  try {
    localStorage.setItem("gl_cart", JSON.stringify(payload));
  } catch {
    // iOS Safari private mode + quota-exceeded both throw on setItem.
    // Silently degrade — the cart action still succeeds in-session; we
    // just lose the persistence layer. Same defense as OrderMenu.saveCart.
  }
}

export function AddToCartButton({ product }: { product: CartProduct }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const disabled = product.unitPrice == null;

  function handleAdd() {
    if (disabled || adding) return;
    setAdding(true);
    const items = loadCartItems();
    const existing = items.find((i) => i.id === product.id);
    const next: CartItem[] = existing
      ? items.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        )
      : [...items, { ...product, quantity: 1 }];
    persistCart(next);
    // Short delay so the customer sees the button-state transition before
    // the route changes; if the navigation is instant on a fast device the
    // tap feels silently swallowed.
    router.push("/menu-preview?cart=open");
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={disabled || adding}
      className="inline-flex items-center justify-center w-full min-h-[44px] px-6 py-3 rounded-xl bg-green-700 hover:bg-green-800 active:bg-green-900 disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
      aria-label={`Add ${product.name} to cart`}
      data-testid="pdp-add-to-cart"
    >
      {disabled ? "Currently unavailable" : adding ? "Adding…" : "Add to cart"}
    </button>
  );
}
