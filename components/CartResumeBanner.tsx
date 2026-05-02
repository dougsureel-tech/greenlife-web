"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Sticky-under-header recovery prompt for customers who left a cart on /order
// without checking out. Cannabis customers add-and-decide-later constantly;
// the previous design buried the cart in localStorage with no way back unless
// they manually re-navigated to /order.
//
// Reads the cart on mount, on pathname change, and when the tab becomes
// visible again — that covers the three common return paths (fresh visit,
// in-session navigation, switch-tab-and-come-back). Same-tab updates from
// /order itself (where the cart drawer lives) don't need to be reflected
// here because /order is in HIDE_ON.

const HIDE_ON = ["/order", "/sign-in", "/sign-up"];
const CART_KEY = "gl_cart";

type CartItem = { quantity: number; unitPrice: number | null };

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartResumeBanner() {
  const pathname = usePathname();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCart(readCart());
  }, []);

  useEffect(() => {
    setCart(readCart());
  }, [pathname]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") setCart(readCart());
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY) setCart(readCart());
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("storage", onStorage);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (!mounted) return null;
  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;

  const count = cart.reduce((s, i) => s + (i.quantity || 0), 0);
  if (count === 0) return null;
  const total = cart.reduce((s, i) => s + (i.unitPrice ?? 0) * (i.quantity || 0), 0);

  return (
    <Link
      href="/order"
      className="block bg-gradient-to-r from-green-800 to-green-700 hover:from-green-700 hover:to-green-600 text-white text-sm font-semibold transition-colors"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 min-w-0">
          <svg
            className="w-4 h-4 shrink-0 text-green-200"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className="truncate">
            You have {count} item{count === 1 ? "" : "s"} in your cart
            <span className="hidden sm:inline"> · ${total.toFixed(2)}</span>
          </span>
        </span>
        <span className="shrink-0 inline-flex items-center gap-1 font-bold whitespace-nowrap">
          <span className="hidden sm:inline">Resume order</span>
          <span className="sm:hidden tabular-nums">${total.toFixed(2)}</span>
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
