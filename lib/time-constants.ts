// Millisecond time constants — single source of truth.
//
// Mirrors `Inventory App/src/lib/time-constants.ts` + `seattle-cannabis-web/lib/time-constants.ts`
// SSoT — same shape, same composability (change MINUTE_MS once + every
// higher unit follows). Pre-fix glw had 10+ inlined `60_000` literals
// scattered across setInterval refresh durations + rate-limit windows +
// ms-since helpers. Each was correct; the cost is reading the same magic
// number in 10 files and hoping nobody typos one (e.g. `600_000` vs
// `60_000` is an ATS-style 10x bug that would silently break a refresh
// ticker).
//
// Adopt at call sites with: `import { MINUTE_MS } from "@/lib/time-constants"`
// then write `setInterval(refresh, MINUTE_MS)` instead of `60_000`.

export const SECOND_MS = 1000;
export const MINUTE_MS = 60 * SECOND_MS;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;
export const WEEK_MS = 7 * DAY_MS;
