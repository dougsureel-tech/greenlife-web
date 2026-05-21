import "server-only";

import type { WrappedRecap } from "./wrapped";

// Mock fixture for /account/wrapped. Served when:
//   - WRAPPED_ENABLED !== "true" AND ?preview=1 query is present
//   - OR real-data path hits a customer with no recap row yet
//
// Once Phase 1 (receipt-verified purchase corpus + strain reviews) lands,
// the real-data fetcher in lib/wrapped.ts swaps from `getMockRecap()` to a
// SELECT against the `customer_year_recaps` table populated by the
// mid-December cron. This file stays as the preview/demo fixture so Doug,
// Kat, and Austin can smoke-test the page render before any real customer
// data exists.
//
// WAC 314-55-155 compliance: every dynamic stat string here is reviewed
// and approved as celebratory + descriptive (variety, exploration,
// loyalty) — NO efficacy, NO volume bragging, NO medical framing. Re-read
// the brand-voice doc + the WAC guide before editing copy.

export const MOCK_WRAPPED_RECAP: WrappedRecap = {
  customerId: "demo-customer-2026",
  customerName: "Friend of the Shop",
  year: 2026,
  topStrains: [
    {
      slug: "wedding-cake",
      name: "Wedding Cake",
      visits: 8,
      familySlug: "cookies",
      familyName: "Cookies",
    },
    {
      slug: "blue-dream",
      name: "Blue Dream",
      visits: 6,
      familySlug: "haze",
      familyName: "Haze",
    },
    {
      slug: "gelato",
      name: "Gelato",
      visits: 5,
      familySlug: "cookies",
      familyName: "Cookies",
    },
  ],
  topFamilySlug: "cookies",
  topFamilyName: "Cookies",
  topFamilyCoverage: { explored: 12, total: 16 },
  dominantTerpene: {
    slug: "limonene",
    label: "Limonene",
    note: "Citrus-bright aroma palette",
  },
  totalPurchases: 31,
  totalStrainsTried: 23,
  varietyRank: {
    moreThanPercent: 73,
    description: "More variety than 73% of customers",
  },
  loyaltyPick: {
    strainSlug: "wedding-cake",
    strainName: "Wedding Cake",
    visits: 8,
    headline: "The strain you came back to",
  },
  heroBlurb:
    "A year of bright citrus afternoons and dessert-family evenings — your Cookies stack ran deep, and your shelf widened across 23 strains.",
  generatedAt: "2026-12-15T12:00:00.000Z",
  optInPublic: false,
};

export function getMockRecap(): WrappedRecap {
  return MOCK_WRAPPED_RECAP;
}

export function getMockRecapForName(displayName: string | null | undefined): WrappedRecap {
  if (!displayName) return MOCK_WRAPPED_RECAP;
  return { ...MOCK_WRAPPED_RECAP, customerName: displayName };
}
