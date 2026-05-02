import Link from "next/link";
import { isOpenNow, nextOpenLabel, STORE, minutesUntilClose, getOrderingStatus } from "@/lib/store";
import { getActiveDeals } from "@/lib/db";

// Within this window before close, swap the static hours line for a live
// "Closes in X min" countdown. When the visitor arrives late this is the
// actual decision they're making — "do I have time?" — and surfacing the
// remaining minutes is more useful than restating the schedule.
const CLOSING_SOON_WINDOW_MIN = 90;

export async function AnnouncementBar() {
  const open = isOpenNow();
  const status = nextOpenLabel();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "America/Los_Angeles" });
  const todayHours = STORE.hours.find((h) => h.day === today);
  const minsLeft = minutesUntilClose();
  const orderingStatus = getOrderingStatus();
  const closingSoon = open && minsLeft !== null && minsLeft <= CLOSING_SOON_WINDOW_MIN;

  // Most-urgent deal — first row from getActiveDeals (already sorted by
  // end-date NULLS LAST) that ends today or tomorrow. Skipped when a more
  // urgent time-driven mode (closing-soon / last-call / closed) is already
  // owning the bar — "do I have time" beats "should I redeem".
  const deals = open && !closingSoon && orderingStatus.state !== "after_last_call" ? await getActiveDeals().catch(() => []) : [];
  const urgentDeal = (() => {
    if (deals.length === 0) return null;
    const todayMs = Date.now();
    for (const d of deals) {
      if (!d.endDate) continue;
      const endMs = new Date(`${d.endDate}T23:59:59`).getTime();
      const days = Math.ceil((endMs - todayMs) / 86400000);
      if (days <= 1) return { deal: d, endsToday: days <= 0 };
    }
    return null;
  })();

  // Four banner shapes, escalating urgency. Time-driven modes always win;
  // urgent-deal swaps in for `normal` only when the store is open and not
  // already in closing-soon / last-call.
  //   normal       — green, "Open · 8 AM-9 PM"
  //   normal+deal  — green, "Open · 🎟 20% off Flower ends today" (override)
  //   closing-soon — amber, "Closes in 22 min · order ahead for fast pickup"
  //   last-call    — rose,  "Online ordering closed for today · still open in-store til 9 PM"
  //   closed       — stone, "Closed · Opens at 8 AM"
  let bg: string;
  let dot: string;
  if (!open) {
    bg = "bg-stone-800 text-stone-300";
    dot = "bg-stone-500";
  } else if (orderingStatus.state === "after_last_call") {
    bg = "bg-rose-900 text-rose-100";
    dot = "bg-rose-300 shadow-[0_0_4px_#fda4af]";
  } else if (closingSoon) {
    bg = "bg-amber-800 text-amber-100";
    dot = "bg-amber-300 shadow-[0_0_4px_#fcd34d] animate-pulse";
  } else {
    bg = "bg-green-800 text-green-100";
    dot = "bg-green-400 shadow-[0_0_4px_#4ade80]";
  }

  let statusLine: React.ReactNode;
  if (!open) {
    statusLine = `Closed · ${status}`;
  } else if (orderingStatus.state === "after_last_call") {
    statusLine = `Online ordering done for today · in-store til ${orderingStatus.closesToday}`;
  } else if (closingSoon && minsLeft !== null) {
    statusLine = (
      <>
        <strong className="font-bold">Closes in {minsLeft} min</strong>
        <span className="opacity-80">· order ahead for fast pickup</span>
      </>
    );
  } else if (urgentDeal) {
    statusLine = (
      <>
        Open Now <span className="opacity-80">·</span>{" "}
        <span aria-hidden="true">🎟️</span>{" "}
        <strong className="font-bold">{urgentDeal.deal.short}</strong>{" "}
        <span className="opacity-80">
          {urgentDeal.endsToday ? "ends today" : "ends tomorrow"}
        </span>
      </>
    );
  } else {
    statusLine = `Open Now${todayHours ? ` · ${todayHours.open}–${todayHours.close}` : ""}`;
  }

  return (
    <div
      className={`text-xs font-medium py-1.5 px-4 text-center flex items-center justify-center gap-3 flex-wrap ${bg}`}
    >
      <span className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
        {statusLine}
      </span>
      <span className="hidden sm:block opacity-40">|</span>
      <Link
        href="/menu"
        className="opacity-75 hover:opacity-100 transition-opacity hidden sm:block font-semibold"
      >
        Order for Pickup →
      </Link>
      <span className="hidden sm:block opacity-40">|</span>
      <span className="opacity-75">Cash only · 21+ · Wenatchee</span>
    </div>
  );
}
