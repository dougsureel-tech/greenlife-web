// Client-side PWA-install deal-card filter.
//
// Background: the homepage was `cookies()`-gated to filter app-only deals
// server-side (`getActiveDeals({ includeAppOnly: cookieRead })`). That call
// opted the entire page out of CDN caching despite `revalidate=60`,
// pushing TTFB to ~210ms (4× cannagent's 59ms). Per Doug-greenlit Option (A)
// we now fetch all deals server-side (cached) and hide app-only cards
// client-side post-hydrate based on the same `glw_pwa_installed` cookie.
//
// Tradeoff (accepted): non-installed customers see app-only cards for ~50ms
// between paint and hydrate before this script hides them. Flicker is the
// price of the cache hit.
//
// Cards are tagged with `data-app-only="1"` server-side. This component
// reads the cookie and toggles `display:none` on those cards.

"use client";

import { useEffect } from "react";

export function AppOnlyDealsFilter() {
  useEffect(() => {
    const installed =
      typeof document !== "undefined" &&
      document.cookie.split("; ").some((c) => c === "glw_pwa_installed=1");
    if (installed) return;
    const cards = document.querySelectorAll<HTMLElement>('[data-app-only="1"]');
    for (const el of cards) el.style.display = "none";
  }, []);
  return null;
}
