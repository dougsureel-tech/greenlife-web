// File-based brand-bio SSoT — fallback for vendors whose self-service
// /vmi/profile bio is unfilled. Audit finding (2026-05-15
// BRANDS_PAGES_COMPLETION_AUDIT_2026_05_15.md):
//
//   "109 brand-page surfaces (44 glw + 65 scc) render only the hero band
//    + product grid — no brand story at all."
//
// Recommendation: ship a `lib/brand-copy.ts: Record<slug, BrandCopy>` for
// the top-20-SKU brands per stack so we don't wait on vendor-portal
// adoption to land hand-curated copy where it matters most.
//
// Schema is intentionally smaller than `vendors.brand_bio` so the SSoT
// stays grep-able + diff-friendly per entry. When a vendor adopts
// /vmi/profile + fills their bio in the DB, DB wins (see
// app/brands/[slug]/page.tsx fallback order).
//
// Voice rules (WAC 314-55-155 STRICT):
// - No efficacy/medical claims. "Strict quality bar" not "medical-grade".
// - Describe the brand's story, lineup, format mix — never therapeutic outcome.
// - "Customers reach for" framing if effects are mentioned at all.
// - U+2019 apostrophes. No exclamation marks.
//
// Slug matches the DB-computed slug for the vendor row (LOWER(REGEXP_REPLACE(
// name, '[^a-zA-Z0-9]+', '-', 'g')) — same regex as lib/db.ts uses).

export type BrandCopy = {
  /** Slug — must exactly match the DB vendor slug. */
  slug: string;
  /** Long-form bio. 2-4 paragraphs, separated by `\n\n`. Rendered as <p> blocks. */
  bio: string;
  /** Optional one-line tagline shown above the bio. */
  tagline?: string;
  /** Optional ISO date of last review — surfaces "Updated YYYY-MM-DD" on the page when set. */
  updatedAt?: string;
};

export const BRAND_COPY: Record<string, BrandCopy> = {
  // Populate top-SKU brands here. Convention: keep alphabetized by slug
  // so PRs that add a brand drop into a deterministic insertion point.
  // (Empty for now — Doug + agents extend this dict per
  // BRANDS_PAGES_COMPLETION_AUDIT_2026_05_15.md plan.)
};

/**
 * Resolve a vendor slug to its file-based bio + tagline. Returns
 * undefined when no copy is on file — callers should fall through to
 * `brand.brandBio` (the DB vendor-portal-authored bio).
 *
 * Fallback chain for the rendered bio:
 *   1. `brand.brandBio` (vendor-authored via /vmi/profile, DB column)
 *   2. `getBrandCopy(slug).bio` (file-based, this module)
 *   3. (nothing rendered — bio section hides itself)
 */
export function getBrandCopy(slug: string): BrandCopy | undefined {
  return BRAND_COPY[slug];
}
