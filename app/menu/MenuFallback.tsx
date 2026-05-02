"use client";

import { useEffect, useState } from "react";
import { STORE } from "@/lib/store";

// Passed in from the parent /menu page (ISR 60s). Keeps the deal hook
// visible to the stuck-embed customer so they don't bounce off-site
// without seeing the savings.
type FeaturedDeal = {
  short: string; // precomputed display string ("20% off Flower" / "$5 off vapes")
  name: string;
  endDate: string | null; // YYYY-MM-DD or null = ongoing
} | null;

// Renders nothing while the Boost embed is hydrating. If after WAIT_MS the
// `<div id="app">` mount point still hasn't loaded any actual product
// content, the embed silently failed (Cloudflare bot-block on the API,
// ad-blocker, mobile-emulation fingerprint, hash rotation we missed, etc.)
// — show a graceful fallback so the customer can still order today.
//
// Per Doug's pin: don't AUTO-redirect off-domain (no `next.config.ts`
// redirects() block). But on a confirmed-broken embed, an explicit
// click-to-iHeartJane button is the only path that keeps revenue alive
// while we untangle the CORS issue. Default actions stay on-domain (call
// the store, get directions); iHeartJane is offered as the loud primary
// CTA because that's what the customer came here to do.
//
// "Stuck" detection: textContent length. Boost's loading squiggle is a few
// dozen characters of SVG/skeleton; a loaded menu has thousands of chars
// (product names, brands, prices, "Add to Cart" buttons, …). The original
// `children.length === 0` check missed the case where Boost mounts its
// spinner but never resolves to products — that's *exactly* the failure
// mode customers were seeing.
//
// Show the fallback after FALLBACK_AFTER_MS if the mount is still empty —
// 6s gives a fair chance for a normal connection on first cold load. After
// that a MutationObserver keeps watching the mount; the moment Boost
// finally hydrates (even if it takes 60+ seconds), the fallback hides.
// Doug 2026-05-02: "loads after a minute but not first try usually" — the
// previous 2s/6s/12s window stopped checking after 12s, so the fallback
// stayed pinned even after Boost did eventually finish.

const FALLBACK_AFTER_MS = 6_000;
const LOADED_MIN_CHARS = 500;
const IHEARTJANE_URL = "https://www.iheartjane.com/stores/5294/green-life-cannabis";

export function MenuFallback({ featuredDeal = null }: { featuredDeal?: FeaturedDeal }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const mount = document.getElementById("app");
    if (!mount) return;

    const isLoaded = () => (mount.textContent?.trim().length ?? 0) >= LOADED_MIN_CHARS;

    // Initial timer — only flip to "show fallback" if Boost hasn't filled
    // the mount within the grace window. Customers on fast connections
    // never see the panel because Boost beats this timer.
    const showTimer = setTimeout(() => {
      if (!isLoaded()) setShow(true);
    }, FALLBACK_AFTER_MS);

    // Watch for Boost hydrating at any point — short, medium, or "after a
    // minute." When it does, hide the fallback so the real menu isn't
    // covered. Subtree+characterData = picks up the deepest text changes
    // Boost makes when it finally renders product names/prices.
    const observer = new MutationObserver(() => {
      if (isLoaded()) setShow(false);
    });
    observer.observe(mount, { childList: true, subtree: true, characterData: true });

    return () => {
      clearTimeout(showTimer);
      observer.disconnect();
    };
  }, []);

  if (!show) return null;

  // Format the deal end-date as urgency copy. Today/tomorrow get strong
  // language; this-week gets the weekday; everything else is "ongoing".
  const dealEndsLabel = featuredDeal?.endDate
    ? (() => {
        const date = new Date(`${featuredDeal.endDate}T23:59:59`);
        const days = Math.ceil((date.getTime() - Date.now()) / 86400000);
        if (days <= 0) return "ends today — show this at the counter";
        if (days === 1) return "ends tomorrow";
        if (days <= 7)
          return `ends ${date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`;
        return null;
      })()
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 my-8 space-y-3">
      {/* Deal pill — only shown when there's an active deal AND the embed
          is stuck. Customer who'd otherwise just bounce now sees the
          savings hook + reason to either click through to iHeartJane
          (ordering still works) or call/walk in. */}
      {featuredDeal && (
        <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 px-4 py-3 sm:px-5 sm:py-3.5 flex items-center gap-3">
          <span className="text-xl shrink-0" aria-hidden="true">
            🎟️
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-950">
              <span className="uppercase tracking-wide text-[10px] text-amber-700 mr-1.5">Live now:</span>
              {featuredDeal.short}
            </p>
            <p className="text-xs text-amber-800/80 truncate">
              {featuredDeal.name}
              {dealEndsLabel && <span> · {dealEndsLabel}</span>}
            </p>
          </div>
        </div>
      )}
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 sm:p-6 text-amber-950">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <svg
              className="w-5 h-5 text-amber-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base sm:text-lg">Our live menu is taking a moment to load.</h2>
            <p className="text-sm mt-1 text-amber-900/90">
              You can browse and order on iHeartJane while we get the embedded menu back, or give us a call —
              we have everything ready and can take your order over the phone.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <a
                href={IHEARTJANE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-bold hover:bg-green-600 transition-colors shadow-sm"
              >
                Order on iHeartJane →
              </a>
              <a
                href={`tel:${STORE.phoneTel}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-900 text-white text-sm font-semibold hover:bg-amber-800 transition-colors"
              >
                Call {STORE.phone}
              </a>
              <a
                href={STORE.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-300 bg-white text-amber-900 text-sm font-semibold hover:bg-amber-100 transition-colors"
              >
                Directions →
              </a>
            </div>
            <p className="text-xs text-amber-800/70 mt-3">
              Cash only · 21+ with valid ID · Open daily {STORE.hours[0]?.open ?? "8 AM"}–
              {STORE.hours[0]?.close ?? "9 PM"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
