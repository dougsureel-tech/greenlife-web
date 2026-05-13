// Store-local time helpers. Single source of truth for "today" / "now"
// in the dispensary's wall-clock timezone (America/Los_Angeles per
// STORE_TZ in lib/store.ts).
//
// Why: a bare `new Date().toISOString().slice(0, 10)` returns the UTC
// date, which drifts to "tomorrow" for the 7-8 hours every evening
// Pacific (5pm PT until midnight UTC). Customer-facing pages rendering
// "today" / "last updated <date>" in that window would show tomorrow.
//
// `storeToday()` returns "YYYY-MM-DD" in store-local time. Built on
// `Intl.DateTimeFormat("en-CA", { timeZone })` which returns the locale
// ISO format ("2026-05-13") without pulling in date-fns-tz.
//
// Sister of inv `apps/staff/src/lib/store-time.ts:storeToday()`.

import { STORE_TZ } from "./store.ts";

/** "YYYY-MM-DD" in store-local time. */
export function storeToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STORE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
