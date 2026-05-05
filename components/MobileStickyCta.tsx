"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { STORE } from "@/lib/store";
import { withAttr } from "@/lib/attribution";

// Sticky bottom-of-screen CTA bar for mobile only. Slides up after the user
// has scrolled past the hero so it doesn't compete with the in-hero buttons,
// then stays visible for the rest of the page.
//
// Five modes (each affects copy + colors + which CTA is primary):
//   open + normal      — green "Order for Pickup" + Call
//   open + with-deal   — emerald "20% off flower today →" + Call (when a
//                         deal is active and the store isn't urgent)
//   open + closing     — amber "Closes in X · order now" + Call
//   open + last-call   — rose "Online ordering done" + Call (now primary)
//   closed             — stone "Opens at 8 AM" + Call
//
// Hidden on:
// - /menu — Boost has its own bottom-sticky cart drawer; ours would stack.
// - /sign-in, /sign-up — focus belongs on the form.
// - /account — already-authenticated flows have their own actions.
// - /deals/* — deal landing pages already have a giant deal-CTA.
const HIDE_ON = ["/menu", "/sign-in", "/sign-up", "/account", "/deals"];

const CLOSING_SOON_WINDOW_MIN = 90;
const LAST_CALL_BEFORE_CLOSE = 15;

type TopDeal = { id: string; short: string; endDate: string | null };

type Mode =
  | { kind: "open-normal" }
  | { kind: "open-with-deal"; deal: TopDeal }
  | { kind: "open-closing"; minsLeft: number }
  | { kind: "open-last-call" }
  | { kind: "closed" };

// Compute the bar's mode purely client-side from the visitor's wall clock
// (in store-local TZ). No server roundtrip — flips correctly mid-session
// when the store ticks past last-call or close. The optional deal is only
// surfaced when the store is open AND not in any urgent (closing/last-call)
// state — urgency wins over promo, since "you have 12 minutes" beats "20%
// off" for a customer who's about to walk in.
function computeMode(deal: TopDeal | null): Mode {
  const day = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "America/Los_Angeles",
  });
  const today = STORE.hours.find((h) => h.day === day);
  if (!today) return { kind: "closed" };

  const parts = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Los_Angeles",
  });
  const [h, m] = parts.split(":").map(Number);
  const cur = h * 60 + m;
  const toMin = (t: string) => {
    const [time, ampm] = t.split(" ");
    const [hh, mm] = time.split(":").map(Number);
    return (ampm === "PM" && hh !== 12 ? hh + 12 : ampm === "AM" && hh === 12 ? 0 : hh) * 60 + mm;
  };
  const openMin = toMin(today.open);
  const closeMin = toMin(today.close);
  const lastCallMin = closeMin - LAST_CALL_BEFORE_CLOSE;
  if (cur < openMin || cur >= closeMin) return { kind: "closed" };
  if (cur >= lastCallMin) return { kind: "open-last-call" };
  if (closeMin - cur <= CLOSING_SOON_WINDOW_MIN) return { kind: "open-closing", minsLeft: closeMin - cur };
  if (deal) return { kind: "open-with-deal", deal };
  return { kind: "open-normal" };
}

export function MobileStickyCta() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [deal, setDeal] = useState<TopDeal | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: "open-normal" });

  useEffect(() => {
    const handler = () => setShow(window.scrollY > 480);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // One-shot deal lookup — endpoint is edge-cached for 60s so traffic to
  // the bar maps to ~one DB hit per minute. Failure is silent (bar just
  // stays in the no-deal modes); this is decoration, not core.
  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/deals/top", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`status ${r.status}`))))
      .then((d: { deal: TopDeal | null }) => {
        setDeal(d.deal);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          console.error("[mobile-cta] deal fetch failed", e);
        }
      });
    return () => ctrl.abort();
  }, []);

  // Recompute mode every 60s so the bar flips automatically as the store
  // crosses closing-soon → last-call → closed boundaries during a long
  // session (someone scrolling the menu just before close, etc.). Re-keyed
  // on the deal so a late arrival hot-swaps the copy. The synchronous
  // setMode here re-runs only when `deal` changes (not on every render),
  // so the cascading-renders concern doesn't apply — disable scoped to
  // the line that needs it.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(computeMode(deal));
    const id = window.setInterval(() => setMode(computeMode(deal)), 60_000);
    return () => window.clearInterval(id);
  }, [deal]);

  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;

  // Per-mode visual + copy + button-order. Order goes Primary first; on
  // last-call mode "Call" becomes primary because online ordering is done
  // for the day but the budtender can still take a phone order.
  const conf = (() => {
    switch (mode.kind) {
      case "open-normal":
        return {
          primaryHref: withAttr("/menu", "sticky", "open-normal"),
          primaryLabel: "Order for Pickup",
          primaryClass: "bg-green-700 hover:bg-green-600 text-white",
          secondaryClass: "border border-stone-200 bg-white text-stone-800 hover:bg-stone-50",
          urgency: null as string | null,
          urgencyClass: "",
        };
      case "open-with-deal":
        // Primary points at the deal landing so the user reads the promo
        // before /menu — gives the deep-link page real traffic and surfaces
        // the loyalty-stack hint we put there.
        return {
          primaryHref: withAttr(`/deals/${mode.deal.id}`, "sticky", `deal-${mode.deal.id}`),
          primaryLabel: `${mode.deal.short} →`,
          primaryClass: "bg-emerald-700 hover:bg-emerald-600 text-white",
          secondaryClass: "border border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-50",
          urgency: "Live deal — tap to see what's on sale",
          urgencyClass: "text-emerald-800",
        };
      case "open-closing":
        return {
          primaryHref: withAttr("/menu", "sticky", "closing"),
          primaryLabel: `Order now · closes in ${mode.minsLeft}m`,
          primaryClass: "bg-amber-600 hover:bg-amber-500 text-white",
          secondaryClass: "border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100",
          urgency: "Closing soon — pickup is fastest",
          urgencyClass: "text-amber-800",
        };
      case "open-last-call":
        return {
          primaryHref: `tel:${STORE.phoneTel}` as const,
          primaryLabel: `Call ${STORE.phone}`,
          primaryClass: "bg-rose-700 hover:bg-rose-600 text-white",
          secondaryClass: "border border-rose-200 bg-white text-rose-900 hover:bg-rose-50",
          urgency: "Online ordering done · in-store still open",
          urgencyClass: "text-rose-800",
        };
      case "closed":
        return {
          primaryHref: `tel:${STORE.phoneTel}` as const,
          primaryLabel: `Call ${STORE.phone}`,
          primaryClass: "bg-stone-700 hover:bg-stone-600 text-white",
          secondaryClass: "border border-stone-200 bg-white text-stone-800 hover:bg-stone-50",
          urgency: "Closed right now — opens daily at 8 AM",
          urgencyClass: "text-stone-600",
        };
    }
  })();

  const isCallPrimary = conf.primaryHref.startsWith("tel:");

  return (
    <div
      aria-hidden={!show}
      className={`sm:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-3 pt-2 transition-transform duration-300 ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-2xl shadow-stone-900/15 p-2">
        {conf.urgency && (
          <p className={`text-[11px] font-semibold text-center mb-1.5 px-1 ${conf.urgencyClass}`}>
            {conf.urgency}
          </p>
        )}
        <div className="flex gap-2">
          {/* Primary action */}
          {isCallPrimary ? (
            <a
              href={conf.primaryHref}
              aria-label={conf.primaryLabel}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${conf.primaryClass}`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              {conf.primaryLabel}
            </a>
          ) : (
            <Link
              href={conf.primaryHref}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${conf.primaryClass}`}
            >
              {conf.primaryLabel}
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
          )}
          {/* Secondary action — opposite of primary so the user always has
              both paths reachable. */}
          {isCallPrimary ? (
            <Link
              href={withAttr("/menu", "sticky", "menu")}
              aria-label="Browse menu"
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${conf.secondaryClass}`}
            >
              Menu
            </Link>
          ) : (
            <a
              href={`tel:${STORE.phoneTel}`}
              aria-label={`Call ${STORE.phone}`}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${conf.secondaryClass}`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Call
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
