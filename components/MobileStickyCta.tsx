"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { STORE } from "@/lib/store";

// Sticky bottom-of-screen CTA bar for mobile only. Slides up after the user
// has scrolled past the hero so it doesn't compete with the in-hero buttons,
// then stays visible for the rest of the page. Primary: order for pickup.
// Secondary: tap-to-call — phone ordering is a real path for cash-only
// dispensaries (customer asks "do you have X in stock?" and the budtender
// answers without them having to navigate the menu).
//
// Hidden on:
// - /menu — Boost has its own bottom-sticky cart drawer; ours would stack.
// - /sign-in, /sign-up — focus belongs on the form.
// - /account — already-authenticated flows have their own actions.
const HIDE_ON = ["/menu", "/sign-in", "/sign-up", "/account"];

export function MobileStickyCta() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => setShow(window.scrollY > 480);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;

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
          href="/menu"
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold text-sm transition-colors"
        >
          Order for Pickup
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
        <a
          href={`tel:${STORE.phoneTel}`}
          aria-label={`Call ${STORE.phone}`}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-800 font-semibold text-sm hover:bg-stone-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          Call
        </a>
      </div>
    </div>
  );
}
