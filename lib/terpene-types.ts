// Pure type + const file — safe to import from BOTH server + client modules.
// Extracted from lib/terpene-fingerprint.ts (which is "server-only" for the
// scoring algorithm + per-strain anchor vectors) so the Client Component
// `components/TerpeneRadarChart.tsx` can import the axis labels + vector
// type without pulling the whole server-only file into the client bundle.
//
// Lived 2026-05-21 build failure: TerpeneRadarChart.tsx imported
// { TERPENE_AXES, TerpeneVector } from "@/lib/terpene-fingerprint" →
// Next.js refused to bundle a "server-only" module into the client bundle.
// Fix: move just these two exports here (zero scoring logic, no imports).
//
// Bumping VECTOR_VERSION still happens here — the migration `customer_terpene_profiles`
// column tracks the version of the vector schema, not the scoring algorithm.

/**
 * Ordered list of the 7 terpene axes that make up a customer fingerprint.
 *
 * Order is LOAD-BEARING — the migration `customer_terpene_profiles.terpene_vector`
 * column stores a JSON array indexed against this order. Reordering would
 * silently shift every customer's saved vector.
 *
 * Axis pick rationale (per `docs/terpene-fingerprint.md`):
 *   - Myrcene + Limonene + Caryophyllene are the 3 most-common terpenes
 *     across the WA strain library, so they anchor the radar's "shape."
 *   - Pinene + Linalool + Humulene + Terpinolene give the remaining
 *     character variation across the catalog. Strains outside these 7
 *     contribute their weight to the nearest axis on the anchor map (see
 *     `strainTerpeneVector` in lib/terpene-fingerprint.ts).
 *   - We deliberately STOP at 7 axes — adding more (Ocimene, Bisabolol,
 *     etc.) increases radar noise more than signal (those terpenes
 *     register as ~0 for nearly every customer) — keeps the radar legible.
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
