"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ActiveDeal } from "@/lib/db";

// Renders a slim top-of-page banner showing the soonest-ending active deal
// with a live ticking countdown. Hidden if there are no active deals or the
// soonest end-date is more than 14 days out (those don't feel urgent — they
// belong on the /deals page instead, not above-fold).

function endOfDay(dateStr: string): number {
  // Treat YYYY-MM-DD as Pacific time end-of-day for "ends in" countdown.
  // Browsers will parse 'YYYY-MM-DDT23:59:59' as local; we want PT, but for
  // the 'ends in' display the small TZ skew doesn't matter — close enough.
  const d = new Date(`${dateStr}T23:59:59-08:00`);
  return d.getTime();
}

function fmtCountdown(msLeft: number): string {
  if (msLeft <= 0) return "ending now";
  const totalSec = Math.floor(msLeft / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  if (days > 0) return `ends in ${days}d ${hours}h`;
  if (hours > 0) return `ends in ${hours}h ${mins}m`;
  if (mins > 0) return `ends in ${mins}m`;
  const secs = totalSec % 60;
  return `ends in ${secs}s`;
}

export function DealBanner({ deals, accent = "green" }: { deals: ActiveDeal[]; accent?: "green" | "indigo" }) {
  const [now, setNow] = useState<number | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (deals.length === 0) return null;
  const top = deals[0];

  // Only show countdown if it ends within 14 days; longer than that and a
  // ticking timer is more annoying than helpful.
  let countdownLabel: string | null = null;
  if (top.endDate && now !== null) {
    const msLeft = endOfDay(top.endDate) - now;
    if (msLeft > 0 && msLeft < 14 * 86400 * 1000) {
      countdownLabel = fmtCountdown(msLeft);
    }
  }

  const grad = accent === "indigo"
    ? "from-indigo-700 via-indigo-800 to-purple-900 text-indigo-50"
    : "from-emerald-700 via-green-800 to-teal-900 text-emerald-50";

  return (
    <Link
      href="/menu"
      className={`relative block bg-gradient-to-r ${grad} hover:brightness-110 transition-all border-b border-white/10`}
      aria-label={`View deal: ${top.name}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-center gap-3 text-center">
        <span className="text-base sm:text-lg" aria-hidden>🔥</span>
        <span className="text-xs sm:text-sm font-bold tracking-tight">
          <span className="opacity-90">Today:</span>{" "}
          <span>{top.name}</span>
          <span className="hidden sm:inline opacity-70 mx-2">·</span>
          <span className="hidden sm:inline opacity-90">{top.short}</span>
          {countdownLabel && (
            <>
              <span className="opacity-70 mx-2">·</span>
              <span className="font-mono tabular-nums opacity-95">{countdownLabel}</span>
            </>
          )}
        </span>
        <span className="text-xs opacity-80 hidden md:inline">View →</span>
      </div>
    </Link>
  );
}
