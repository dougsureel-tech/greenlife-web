"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

// Sticky-under-header recovery prompt for customers who left a cart on /order
// without checking out. Cannabis customers add-and-decide-later constantly;
// the previous design buried the cart in localStorage with no way back unless
// they manually re-navigated to /order.
//
// Cart state lives in localStorage (gl_cart). We read via useSyncExternalStore
// so React owns the subscription correctly and we don't trip the
// set-state-in-effect cascading-renders rule (that pattern was a real
// React #185 risk per `feedback_use_sync_external_store_caching.md` —
// snapshot caches by raw string so identical reads return the SAME array
// reference, which is the contract useSyncExternalStore requires).

const HIDE_ON = ["/order", "/sign-in", "/sign-up"];
const CART_KEY = "gl_cart";

type CartItem = { quantity: number; unitPrice: number | null };

const SERVER_SNAPSHOT: CartItem[] = [];
let cachedRaw: string | null = "__init__";
let cachedItems: CartItem[] = SERVER_SNAPSHOT;

function getSnapshot(): CartItem[] {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  const raw = window.localStorage.getItem(CART_KEY);
  if (raw === cachedRaw) return cachedItems;
  cachedRaw = raw;
  if (!raw) {
    cachedItems = SERVER_SNAPSHOT;
    return cachedItems;
  }
  try {
    const parsed = JSON.parse(raw);
    cachedItems = Array.isArray(parsed) ? (parsed as CartItem[]) : SERVER_SNAPSHOT;
  } catch {
    cachedItems = SERVER_SNAPSHOT;
  }
  return cachedItems;
}

function subscribe(callback: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === CART_KEY) callback();
  };
  const onVis = () => {
    if (document.visibilityState === "visible") callback();
  };
  window.addEventListener("storage", onStorage);
  document.addEventListener("visibilitychange", onVis);
  return () => {
    window.removeEventListener("storage", onStorage);
    document.removeEventListener("visibilitychange", onVis);
  };
}

export function CartResumeBanner() {
  const pathname = usePathname();
  const cart = useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SNAPSHOT);
  const [mounted, setMounted] = useState(false);

  // Mount flag avoids hydration-mismatch flash — server renders nothing,
  // client re-renders once and shows the banner if a cart exists.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Pathname change: invalidate the snapshot cache so the next render reads
  // fresh from localStorage. Bumping cachedRaw to a sentinel forces re-parse
  // without calling setState (which is what the set-state-in-effect rule
  // was complaining about in the prior version).
  useEffect(() => {
    cachedRaw = "__pathname_changed__";
  }, [pathname]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
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
