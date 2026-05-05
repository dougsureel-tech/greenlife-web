"use client";

import { useEffect, useState } from "react";
import { computeDealCountdown, type DealCountdownState } from "@/lib/deal-countdown";

// Live "ends in" chip used on the /deals card list. Refreshes on a 60s
// interval so the urgency window stays honest as time ticks past. Hydration-
// safe: returns the same label the server rendered until the first client
// tick fires.
//
// Pure label logic lives in `lib/deal-countdown.ts` so the server-rendered
// /deals page can compute the SSR initial without importing this client
// module (Next 16 / React 19 errors when a server component imports
// anything from a "use client" file).

export function DealCountdown({
  endDate,
  initialLabel,
  initialUrgent,
}: {
  endDate: string | null;
  initialLabel: string;
  initialUrgent: boolean;
}) {
  const [state, setState] = useState<DealCountdownState>({
    label: initialLabel,
    urgent: initialUrgent,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration-safe ticker: SSR ships `initialLabel`/`initialUrgent`, then we reconcile to client-time on mount before the 60s interval takes over.
    setState(computeDealCountdown(endDate));
    const id = setInterval(() => setState(computeDealCountdown(endDate)), 60_000);
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
