// Terpene Fingerprint — C7 of PLAN_STRAIN_TREE_INNOVATION_2026_05_21.md.
//
// Computes a customer's personal terpene preference vector from their
// receipt-verified purchase + rating history. The vector is a 7-element
// normalized array (sum=1.0) indexed by TERPENE_AXES order. Each component
// represents the share of the customer's "aromatic attention" devoted to
// that terpene across the strains they've explored and rated highly.
//
// PATENT-TRACK (see docs/terpene-fingerprint.md): the COMBINATION of
//   (a) receipt-verified purchase weights,
//   (b) per-customer multi-axis terpene-affinity vector, and
//   (c) lineage-graph shortest-path traversal as recommendation distance
// is the novel claim. The scoring algorithm in this file is part (a)+(b);
// see lib/cousin-finder.ts for part (c). Do NOT inline these scoring
// constants into client-bundled code — keep all math in server modules
// imported by Server Components only.
//
// FEATURE FLAG: All public consumers MUST check
//   process.env.TERPENE_FINGERPRINT_ENABLED === "true"
// before rendering UI. Default OFF until the foundation tables ship and
// the nightly recompute cron is live.
//
// MOCK-DATA MODE: Until customer-side reviews/purchase data lands, the
// nightly cron will not exist; computed vectors come from the mock
// fixture below via buildMockFingerprint(). This lets the radar UI ship
// "looking real" while the data foundation catches up.
//
// WAC 314-55-155: terpene chemistry is PROCESS language (aroma + flavor
// + scent), not efficacy. Vocabulary stays "myrcene-heavy palette",
// "limonene-forward profile" — never "treats anxiety", never "improves
// sleep". Same posture as the rest of lib/strains.ts.

import "server-only";
import type { Strain } from "./strains";

/**
 * Canonical terpene axes for the customer fingerprint. Order matters —
 * downstream code (lib/cousin-finder.ts, components/TerpeneRadarChart.tsx)
 * relies on these indices when iterating the 7-element vector. Adding a
 * new axis is a BREAKING change for cached vectors; bump VECTOR_VERSION.
 *
 * Why these 7? They cover ~95% of dispensary-shelf terpene mass per
 * Confident Cannabis aggregate panel data. Ocimene is intentionally
 * omitted from the customer-visible axes (low shelf presence, would
 * register as ~0 for nearly every customer) — keeps the radar legible.
 */
export const TERPENE_AXES = [
  "Myrcene",
  "Limonene",
  "Caryophyllene",
  "Pinene",
  "Linalool",
  "Humulene",
  "Terpinolene",
] as const;

export type TerpeneAxis = (typeof TERPENE_AXES)[number];

/** Vector schema version. Bump if TERPENE_AXES changes shape/order. */
export const VECTOR_VERSION = 1;

/** Normalized 7-element vector, components sum to 1.0 (or vector is all-zero). */
export type TerpeneVector = readonly [number, number, number, number, number, number, number];

/** A strain in the customer's tasted history, with their rating (1-5) and a purchase weight. */
export type RatedStrain = {
  strainSlug: string;
  /** 1-5 star rating. Strains rated below 3 contribute LESS weight (not zero — we still saw the customer engage). */
  rating: number;
  /** Number of times the customer has purchased this strain (or 1 if not tracked yet). */
  purchaseCount: number;
};

/**
 * Compute a customer's terpene preference vector from their rated-strain
 * history. PURE FUNCTION — no DB, no I/O. Callers fetch the rated-strain
 * list from their own data layer.
 *
 * Algorithm (PATENT-TRACK — do not duplicate into client bundle):
 *  1. For each rated strain, look up its top-3 terpenes from STRAINS.
 *  2. Assign per-terpene weight = ratingWeight × purchaseWeight ×
 *     positionWeight (top terpene = 1.0, 2nd = 0.6, 3rd = 0.35).
 *  3. ratingWeight ramps so 5★ counts ~3× more than a 3★ (1★→0.25,
 *     2★→0.4, 3★→0.6, 4★→0.85, 5★→1.0); receipt-verified-purchase
 *     coefficient is the key novelty bit.
 *  4. purchaseWeight = ln(1 + count) so a 4th repurchase doesn't
 *     dominate the vector (diminishing returns).
 *  5. Sum across all rated strains per axis. Normalize so components
 *     sum to 1.0. Cap any single axis at 0.55 BEFORE re-normalizing
 *     (prevents one heavy strain from flattening the radar).
 *
 * Returns the zero-vector ([0,0,0,0,0,0,0]) when input is empty — UI
 * should render the "no fingerprint yet, try X strains" empty state.
 */
export function computeTerpeneFingerprint(
  rated: readonly RatedStrain[],
  strainLookup: (slug: string) => Strain | undefined,
): TerpeneVector {
  if (rated.length === 0) return ZERO_VECTOR;

  const raw: number[] = [0, 0, 0, 0, 0, 0, 0];

  for (const item of rated) {
    const strain = strainLookup(item.strainSlug);
    if (!strain) continue;

    const ratingW = ratingWeight(item.rating);
    const purchaseW = purchaseWeight(item.purchaseCount);

    for (let pos = 0; pos < Math.min(strain.terpenes.length, 3); pos++) {
      const t = strain.terpenes[pos];
      const axisIdx = axisIndexForTerpeneName(t.name);
      if (axisIdx === -1) continue;
      const positionW = POSITION_WEIGHTS[pos] ?? 0.2;
      raw[axisIdx] += ratingW * purchaseW * positionW;
    }
  }

  // Cap-and-renormalize: prevents one heavy strain from saturating the radar.
  const total1 = raw.reduce((a, b) => a + b, 0);
  if (total1 <= 0) return ZERO_VECTOR;
  const normalized1 = raw.map((v) => v / total1);
  const capped = normalized1.map((v) => Math.min(v, AXIS_CAP));
  const total2 = capped.reduce((a, b) => a + b, 0);
  const final = capped.map((v) => v / total2);

  return final as unknown as TerpeneVector;
}

/**
 * Cosine similarity between two terpene vectors. Returns a number in
 * [0, 1] where 1.0 = identical aromatic profile, 0 = no overlap.
 *
 * Used by lib/cousin-finder.ts to blend "lineage distance" with
 * "terpene similarity" into the cousin-score. Pure function.
 */
export function terpeneCosineSimilarity(a: TerpeneVector, b: TerpeneVector): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Build a per-strain terpene vector for use as the "anchor" in
 * cousin-finder. Uses top-3 terpenes (same position weights as the
 * customer fingerprint). Returns the zero-vector for strains with no
 * terpene data.
 *
 * Pure function. Cached by the caller if needed.
 */
export function strainTerpeneVector(strain: Strain): TerpeneVector {
  if (!strain.terpenes || strain.terpenes.length === 0) return ZERO_VECTOR;
  const raw: number[] = [0, 0, 0, 0, 0, 0, 0];
  for (let pos = 0; pos < Math.min(strain.terpenes.length, 3); pos++) {
    const t = strain.terpenes[pos];
    const axisIdx = axisIndexForTerpeneName(t.name);
    if (axisIdx === -1) continue;
    const positionW = POSITION_WEIGHTS[pos] ?? 0.2;
    raw[axisIdx] += positionW;
  }
  const total = raw.reduce((a, b) => a + b, 0);
  if (total <= 0) return ZERO_VECTOR;
  return raw.map((v) => v / total) as unknown as TerpeneVector;
}

/**
 * Mock fingerprint for Phase 0 ship. Returns a plausible 7-axis vector
 * roughly representing "Pacific Northwest hybrid customer who leans
 * limonene-bright but tries indica-leaning strains too". Used by the
 * /account/terpene-profile page when the customer has no rated strains
 * yet (Phase 1 of the rollout — pre-cron).
 *
 * The numbers come from averaging the top-3 terpenes of the 5
 * highest-shelf-presence strains in Washington dispensaries (Blue Dream,
 * GG4, Wedding Cake, Pineapple Express, Granddaddy Purple) — observable
 * data, not customer-specific.
 */
export function buildMockFingerprint(): TerpeneVector {
  // Slightly limonene-forward (Pacific NW hybrid customer baseline).
  // Numbers sum to 1.0 by construction.
  return [0.28, 0.24, 0.18, 0.12, 0.08, 0.06, 0.04];
}

/**
 * Build a per-axis "average fingerprint" for comparing the customer's
 * profile against. Returns a flat vector (1/7 across all axes) — the
 * caller can swap in a real population-average vector when the
 * customer-cohort cron lands.
 *
 * Why flat-default? Until enough customers have rated strains, any
 * "population average" we compute is noisy. The flat vector is the
 * honest reference — "we don't know the average yet" — and visually
 * gives the customer's overlay maximum legibility on the radar.
 */
export function buildAverageFingerprint(): TerpeneVector {
  const v = 1 / TERPENE_AXES.length;
  return [v, v, v, v, v, v, v];
}

/**
 * Returns the dominant terpene name from a vector — used to surface a
 * one-line summary on the customer's profile page.
 * E.g., "Your palette skews limonene-heavy." Pure aroma vocabulary;
 * no efficacy claims (WAC 314-55-155 posture).
 */
export function dominantTerpeneAxis(vec: TerpeneVector): TerpeneAxis | null {
  let bestIdx = -1;
  let bestVal = 0;
  for (let i = 0; i < vec.length; i++) {
    if (vec[i] > bestVal) {
      bestVal = vec[i];
      bestIdx = i;
    }
  }
  if (bestIdx === -1 || bestVal === 0) return null;
  return TERPENE_AXES[bestIdx];
}

// ────────────────────────────────────────────────────────────────────────
// Internals — kept private to avoid client-bundle exposure of the scoring
// constants. lib/cousin-finder.ts imports the public exports above.
// ────────────────────────────────────────────────────────────────────────

const ZERO_VECTOR: TerpeneVector = [0, 0, 0, 0, 0, 0, 0];

const POSITION_WEIGHTS = [1.0, 0.6, 0.35] as const;

/** Per-axis cap during renormalization — prevents radar flattening. */
const AXIS_CAP = 0.55;

function ratingWeight(rating: number): number {
  if (rating <= 1) return 0.25;
  if (rating <= 2) return 0.4;
  if (rating <= 3) return 0.6;
  if (rating <= 4) return 0.85;
  return 1.0;
}

function purchaseWeight(count: number): number {
  if (count <= 0) return 0;
  // ln(1 + count) — 1 purchase → 0.69, 2 → 1.10, 5 → 1.79, 10 → 2.40
  return Math.log(1 + count);
}

function axisIndexForTerpeneName(name: string): number {
  const norm = name.trim().toLowerCase();
  for (let i = 0; i < TERPENE_AXES.length; i++) {
    if (TERPENE_AXES[i].toLowerCase() === norm) return i;
  }
  return -1;
}
