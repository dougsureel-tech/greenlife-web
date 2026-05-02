// Pure pricing of "ends in N days" / "Ongoing" / "Ended" labels off a deal's
// end_date. Lives outside the client `<DealCountdown>` so a Server Component
// can call it for the SSR initial label without dragging a "use client"
// directive into its module graph (Next 16 / React 19 throws if a server
// component imports a value from a "use client" file — the previous shape
// of this code was the cause of the /deals Suspense error digest 2617570418
// blocking the deals hero from rendering).

export type DealCountdownState = {
  label: string;
  urgent: boolean;
};

// Output bands:
//   • null endDate            → "Ongoing"
//   • > 7 days remaining      → "Ends Tue, May 13"
//   • 2–7 days remaining      → "Ends in N days"
//   • 1 day remaining         → "Ends tomorrow"
//   • same day remaining      → "Ends today"
//   • already past            → "Ended"
//
// `urgent` returns true on tomorrow / today / past so the parent can flip
// to the rose accent.
export function computeDealCountdown(endDate: string | null): DealCountdownState {
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
