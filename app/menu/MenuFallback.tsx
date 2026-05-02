"use client";

import { useEffect, useState } from "react";
import { STORE } from "@/lib/store";

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

const WAIT_MS = 10_000;
const LOADED_MIN_CHARS = 500;
const IHEARTJANE_URL = "https://www.iheartjane.com/stores/5294/green-life-cannabis";

export function MenuFallback() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function check() {
      const mount = document.getElementById("app");
      if (!mount) return;
      const text = mount.textContent?.trim() ?? "";
      if (text.length < LOADED_MIN_CHARS) setShow(true);
    }
    const t1 = setTimeout(check, WAIT_MS);
    const t2 = setTimeout(check, WAIT_MS * 1.5);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 my-8">
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
