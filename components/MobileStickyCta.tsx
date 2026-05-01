"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Sticky bottom-of-screen CTA bar for mobile only. Slides up after the user
// has scrolled past the hero so it doesn't compete with the in-hero buttons,
// then stays visible for the rest of the page. Two routes: pickup ordering
// (primary) and the menu (secondary). Hidden once a user scrolls back near
// the top so the hero CTAs reclaim attention.
export function MobileStickyCta() {
  const [show, setShow] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const handler = () => setShow(window.scrollY > 480);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div
      aria-hidden={!show}
      className={`sm:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-3 pt-2 transition-transform duration-300 ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="flex gap-2 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-2xl shadow-stone-900/15 p-2">
        <Link
          href="/order"
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold text-sm transition-colors"
        >
          Order for Pickup
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
        <Link
          href="/menu"
          className="inline-flex items-center justify-center px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-800 font-semibold text-sm hover:bg-stone-50 transition-colors"
        >
          Menu
        </Link>
      </div>
    </div>
  );
}
