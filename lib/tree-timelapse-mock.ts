// Mock purchase timeline used by C2 "Time-lapse Tree Growth" until
// verified-purchase ships (Phase 1 of strain-pages-V2).
//
// Real wiring will replace `mockPurchaseTimeline()` with a query against
// `sale_line_items JOIN products` for the logged-in portal user, filtered
// to receipt-verified purchases mapped to a strain slug. The shape that
// `lib/tree-timelapse.ts` consumes is `PurchaseTimelineEntry[]` — keep
// the swap a one-liner.
//
// WAC posture: no efficacy, no medical, no consumption claims. The
// fixture is "customer tried these strains over this window in this
// order." Process + experience vocabulary only.
//
// Doug-greenlight: this file is the data-stub that lets us SHIP the
// surface today (env flag `TREE_TIMELAPSE_ENABLED` default OFF), then
// flip the read path to real data the moment verified-purchase lands.

import type { PurchaseTimelineEntry } from "./tree-timelapse";

// Two-year sample timeline spanning ~20 purchases across hybrid/sativa/
// indica families. Slugs match STRAINS keys in `lib/strains.ts` (NOT
// imported here — we don't want this file pulling the 460KB strains
// module into the build budget; the consumer cross-references at render
// time if needed).
//
// Dates are ISO-strict so any TZ math at the renderer's layer is
// deterministic.
const MOCK_TIMELINE: readonly PurchaseTimelineEntry[] = [
  { strainSlug: "blue-dream", purchasedAt: "2025-01-12T18:32:00Z" },
  { strainSlug: "wedding-cake", purchasedAt: "2025-01-28T20:14:00Z" },
  { strainSlug: "gelato", purchasedAt: "2025-02-09T19:55:00Z" },
  { strainSlug: "blue-dream", purchasedAt: "2025-02-22T17:40:00Z" }, // revisit
  { strainSlug: "northern-lights", purchasedAt: "2025-03-08T19:10:00Z" },
  { strainSlug: "gsc", purchasedAt: "2025-03-22T18:00:00Z" },
  { strainSlug: "jack-herer", purchasedAt: "2025-04-12T20:45:00Z" },
  { strainSlug: "wedding-cake", purchasedAt: "2025-04-26T19:20:00Z" }, // revisit
  { strainSlug: "sour-diesel", purchasedAt: "2025-05-11T18:05:00Z" },
  { strainSlug: "purple-punch", purchasedAt: "2025-06-04T20:00:00Z" },
  { strainSlug: "mac-1", purchasedAt: "2025-07-19T19:30:00Z" },
  { strainSlug: "runtz", purchasedAt: "2025-08-14T21:00:00Z" },
  { strainSlug: "zkittlez", purchasedAt: "2025-09-02T18:25:00Z" },
  { strainSlug: "gelato", purchasedAt: "2025-09-21T20:10:00Z" }, // revisit
  { strainSlug: "do-si-dos", purchasedAt: "2025-10-15T19:00:00Z" },
  { strainSlug: "skywalker-og", purchasedAt: "2025-11-08T20:30:00Z" },
  { strainSlug: "pineapple-express", purchasedAt: "2025-12-18T18:15:00Z" },
  { strainSlug: "blue-dream", purchasedAt: "2026-01-05T19:45:00Z" }, // revisit
  { strainSlug: "white-widow", purchasedAt: "2026-02-12T20:20:00Z" },
  { strainSlug: "gg4", purchasedAt: "2026-03-09T19:00:00Z" },
];

/**
 * Returns the mock chronological purchase timeline for the current
 * customer. Until verified-purchase ships, every customer's tree
 * renders from the same fixture so Doug can demo the surface live.
 *
 * Swap recipe (Phase 1A of strain-pages-V2):
 *   1. Add `getCustomerPurchaseTimeline(portalUserId: string)` to
 *      `lib/portal.ts` returning the SAME `PurchaseTimelineEntry[]`
 *      shape (sorted ASC by purchasedAt).
 *   2. Inside the page Server Component, swap
 *        `const timeline = mockPurchaseTimeline();`
 *      to
 *        `const timeline = await getCustomerPurchaseTimeline(portalUser.id);`
 *   3. Delete this file.
 */
export function mockPurchaseTimeline(): readonly PurchaseTimelineEntry[] {
  return MOCK_TIMELINE;
}
