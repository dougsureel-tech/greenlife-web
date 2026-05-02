"use client";

import { useEffect, useState } from "react";

// Live "ends in" chip used on the /deals card list. Refreshes on a 60s
// interval so the urgency window stays honest as time ticks past — same
// pattern as SiteHeader's StatusPill. Hydration-safe: returns the same
// label the server rendered until the first client tick fires.
//
// Output bands:
//   • null endDate            → "Ongoing"
//   • >  7 days remaining     → "Ends Tue, May 13"
//   • 2–7 days remaining      → "Ends in N days"
//   • 1 day remaining         → "Ends tomorrow"
//   • same day remaining      → "Ends today"
//   • already past            → "Ended"
//
// `urgent` returns true on tomorrow / today / past so the parent can flip
// to the rose accent.
export type DealCountdownState = {
  label: string;
  urgent: boolean;
};

function compute(endDate: string | null): DealCountdownState {
  if (!endDate) return { label: "Ongoing", urgent: false };
  const end = new Date(`${endDate}T23:59:59-08:00`).getTime();
  const now = Date.now();
  const ms = end - now;
  if (ms <= 0) return { label: "Ended", urgent: true };
  const days = Math.ceil(ms / 86_400_000);
  if (days === 1) {
    // <24h left — fall back to hours for the closing-window urgency
    const hours = Math.ceil(ms / 3_600_000);
    if (hours <= 24 && hours > 0) {
      // If end-of-day today (PT), we want "Ends today". Otherwise "Ends tomorrow".
      const todayPt = new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }),
      );
      const endPt = new Date(
        new Date(end).toLocaleString("en-US", { timeZone: "America/Los_Angeles" }),
      );
      const sameDay =
        todayPt.getFullYear() === endPt.getFullYear() &&
        todayPt.getMonth() === endPt.getMonth() &&
        todayPt.getDate() === endPt.getDate();
      return { label: sameDay ? "Ends today" : "Ends tomorrow", urgent: true };
    }
    return { label: "Ends tomorrow", urgent: true };
  }
  if (days <= 7) return { label: `Ends in ${days} days`, urgent: false };
  return {
    label: `Ends ${new Date(`${endDate}T12:00:00`).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })}`,
    urgent: false,
  };
}

export function DealCountdown({
  endDate,
  initialLabel,
  initialUrgent,
}: {
  endDate: string | null;
  initialLabel: string;
  initialUrgent: boolean;
}) {
  // Server-rendered initial state; client takes over on mount and refreshes
  // every 60s. Avoids the SSR/CSR text mismatch that triggers React hydration
  // warnings on dev.
  const [state, setState] = useState<DealCountdownState>({
    label: initialLabel,
    urgent: initialUrgent,
  });

  useEffect(() => {
    setState(compute(endDate));
    const id = setInterval(() => setState(compute(endDate)), 60_000);
    return () => clearInterval(id);
  }, [endDate]);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold ${
        state.urgent
          ? "bg-rose-100 text-rose-800 ring-1 ring-rose-200"
          : "bg-stone-100 text-stone-700"
      }`}
    >
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
      </svg>
      {state.label}
    </span>
  );
}

// Server-side helper so the page can compute the same initial label/urgency
// pair before passing to the client component. Keeps the SSR text identical
// to the first client render (within the same minute).
export function computeServer(endDate: string | null): DealCountdownState {
  return compute(endDate);
}
