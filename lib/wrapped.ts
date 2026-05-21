import "server-only";

import { getMockRecap, getMockRecapForName } from "./wrapped-mock-data";

// Year-in-Strains Wrapped — annual recap data layer.
//
// Plan: /CODE/Green Life/PLAN_STRAIN_TREE_INNOVATION_2026_05_21.md §C1.
//
// SHAPE — `customer_year_recaps` table (one row per customer per year):
//   id TEXT PRIMARY KEY (uuid)
//   customer_id TEXT NOT NULL
//   year INT NOT NULL
//   top_strain_slugs JSONB        // ordered array of strain slugs
//   top_family_slug TEXT
//   dominant_terpene TEXT
//   total_purchases INT
//   total_strains_tried INT
//   hero_blurb TEXT               // 1-sentence WAC-safe celebratory copy
//   generated_at TIMESTAMPTZ
//   opt_in_public BOOLEAN DEFAULT FALSE
//
// The mid-December cron (Phase 4.2) writes one row per active customer.
// Read path is THIS module — `getWrappedRecap()` checks the env flag, then
// returns either the row from Postgres (real path) or a mock fixture
// (preview/demo path). Real path is a 1-line swap when Phase 1 lands.
//
// WAC 314-55-155: every dynamic stat string is celebratory + descriptive.
// NO efficacy. NO volume bragging. NO medical framing. NO competitor
// references. See `formatVarietyBrag()` for the canonical safe phrasing.

export type WrappedTopStrain = {
  slug: string;
  name: string;
  visits: number;
  familySlug: string | null;
  familyName: string | null;
};

export type WrappedRecap = {
  customerId: string;
  customerName: string;
  year: number;
  topStrains: WrappedTopStrain[];
  topFamilySlug: string | null;
  topFamilyName: string | null;
  topFamilyCoverage: { explored: number; total: number } | null;
  dominantTerpene: {
    slug: string;
    label: string;
    note: string;
  } | null;
  totalPurchases: number;
  totalStrainsTried: number;
  varietyRank: {
    moreThanPercent: number;
    description: string;
  } | null;
  loyaltyPick: {
    strainSlug: string;
    strainName: string;
    visits: number;
    headline: string;
  } | null;
  heroBlurb: string;
  generatedAt: string;
  optInPublic: boolean;
};

export type WrappedFetchOptions = {
  /** When true, return mock fixture regardless of real-data availability. */
  preview?: boolean;
  /** Optional display-name override (so the mock card reads with the
   * signed-in customer's actual name during preview). */
  displayName?: string | null;
};

/**
 * Returns the recap for the given customer + year, or null if no recap
 * exists and preview mode is OFF.
 *
 * Phase 1 mock-mode implementation: always returns the mock fixture in
 * preview mode; returns null otherwise. Once the receipt-verified
 * purchase corpus + strain reviews infra ships, this becomes the real
 * SELECT against `customer_year_recaps` — the page contract is stable.
 */
export async function getWrappedRecap(
  _customerId: string,
  _year: number,
  opts: WrappedFetchOptions = {},
): Promise<WrappedRecap | null> {
  if (opts.preview) {
    return getMockRecapForName(opts.displayName);
  }
  // Phase 4.2 real-data swap goes here:
  //   const sql = getClient();
  //   const rows = await sql`SELECT ... FROM customer_year_recaps WHERE customer_id = ${_customerId} AND year = ${_year}`;
  //   if (rows.length === 0) return null;
  //   return rowToRecap(rows[0]);
  return null;
}

/**
 * Mock recap convenience for unit tests + share-card preview.
 */
export function getPreviewRecap(displayName?: string | null): WrappedRecap {
  return getMockRecapForName(displayName);
}

// ────────────────────────────────────────────────────────────────────
// WAC-safe stat formatters.
//
// Every public-facing stat string in the Wrapped card flows through one
// of these helpers. Keeps copy variation centralized + diffable + easy to
// audit for compliance. New stat strings MUST go through here, not be
// inlined at the call site.
// ────────────────────────────────────────────────────────────────────

export function formatVarietyBrag(recap: WrappedRecap): string {
  if (recap.varietyRank) {
    return `${recap.totalStrainsTried} strains — ${recap.varietyRank.description.toLowerCase()}`;
  }
  return `${recap.totalStrainsTried} strains explored this year`;
}

export function formatFamilyBrag(recap: WrappedRecap): string {
  if (!recap.topFamilyName) return "A wide-ranging shelf year";
  const coverage = recap.topFamilyCoverage;
  if (coverage && coverage.total > 0) {
    return `Top family: ${recap.topFamilyName} — ${coverage.explored} of ${coverage.total} on our shelf`;
  }
  return `Top family: ${recap.topFamilyName}`;
}

export function formatTerpeneBrag(recap: WrappedRecap): string {
  if (!recap.dominantTerpene) return "An aroma year all your own";
  return `${recap.dominantTerpene.label} · ${recap.dominantTerpene.note}`;
}

export function formatLoyaltyBrag(recap: WrappedRecap): string {
  if (!recap.loyaltyPick) return "The shelf you kept widening";
  return `${recap.loyaltyPick.headline}: ${recap.loyaltyPick.strainName}`;
}

export function formatTopStrainsHeadline(recap: WrappedRecap): string {
  const names = recap.topStrains.slice(0, 3).map((s) => s.name);
  if (names.length === 0) return "Your year on the shelf";
  if (names.length === 1) return `Your top strain: ${names[0]}`;
  if (names.length === 2) return `Top strains: ${names[0]} · ${names[1]}`;
  return `Top strains: ${names[0]} · ${names[1]} · ${names[2]}`;
}

export function isWrappedEnabled(): boolean {
  return process.env.WRAPPED_ENABLED === "true";
}

// Current "Wrapped year" for landing-page defaults. Lock to 2026 for
// now — when 2027's recap ships, bump this constant or read from env.
export const CURRENT_WRAPPED_YEAR = 2026;
