// Per-product photo manifest — Tier A (real per-product brand photography).
//
// This is the "real photo" tier shipped after the brand-logo arc closed at
// 101 brand-logos / ~78% SKU coverage (2026-05-21). Brand-logos make every
// tile visually distinct PER BRAND, but they don't tell the customer what
// the specific PRODUCT looks like. This manifest fills the gap for ~25 SKUs
// where we have actual brand-supplied product photography from the brand's
// own website.
//
// Render priority (top to bottom — highest priority first):
//   1. real `product.imageUrl` from DB (Dutchie sync — ~3% coverage today)
//   2. matched product-photo (THIS manifest — per-product or brand+category)
//   3. brand-logo PNG (101-entry `brand-logos-available.ts` manifest)
//   4. category-placeholder photo (8-category JPGs in /category-placeholders)
//   5. category-emoji + brand-name pill (final fallback)
//
// Doctrine: same `feedback_vendor_logo_sources` doctrine as brand-logos —
// SOURCE FROM THE BRAND'S OWN WEBSITE, not dispensary aggregators. The 16
// Tier-A photos shipped today (4:20 Bar × 6, Agro Couture × 8, Double
// Delicious × 2) are all from the brand's own .com / wholesale-portal /
// official Squarespace.
//
// **MAINTAIN IN LOCKSTEP** with `public/product-photos/*.{png,jpg}`.
// Build-gate `scripts/check-product-photos-manifest.mjs` blocks pushes
// when an entry in this manifest doesn't have a file on disk (or vice
// versa).
//
// Sister-mirrored at `greenlife-web/lib/product-photos-available.ts` —
// keep the two stacks IDENTICAL.

/**
 * Matching rule: when a product's `(brand, category, name)` triple satisfies
 * all the listed conditions, render `/product-photos/<slug>` as the product
 * tile image. Rules are evaluated in array order — most-specific FIRST.
 */
export type ProductPhotoRule = {
  /** Exact match against product.brand (case-sensitive). */
  brand: string;
  /** Substring match against product.category (case-sensitive). Optional. */
  category?: string;
  /**
   * ALL keywords must appear in product.name (case-insensitive). Use the
   * most distinguishing substring (e.g. "Dark Chocolate Sea Salt" not just
   * "Chocolate") so we don't false-match across the brand's product line.
   */
  nameContains?: string[];
  /**
   * Path under `/public/product-photos/`. Both `.png` and `.jpg` are
   * supported — Next/Image renders both via `unoptimized` flag.
   */
  file: string;
};

export const PRODUCT_PHOTO_RULES: readonly ProductPhotoRule[] = [
  // ---- 4:20 Bar ----
  // Order MATTERS — most-specific keyword sets first so we don't
  // accidentally match a more-generic rule.
  {
    brand: "4:20 Bar",
    nameContains: ["1:1:1:1"],
    file: "4-20-bar--milk-chocolate-1111.jpg",
  },
  {
    brand: "4:20 Bar",
    nameContains: ["CBN"],
    file: "4-20-bar--milk-chocolate-cbn.jpg",
  },
  {
    brand: "4:20 Bar",
    nameContains: ["Sea Salt", "1:1"],
    file: "4-20-bar--sea-salt-cbd-11.png",
  },
  {
    brand: "4:20 Bar",
    nameContains: ["Sea Salt"],
    file: "4-20-bar--dark-chocolate-sea-salt-100mg.png",
  },
  {
    brand: "4:20 Bar",
    nameContains: ["Toffee"],
    file: "4-20-bar--milk-chocolate-toffee-200mg-cbg.jpg",
  },
  {
    brand: "4:20 Bar",
    nameContains: ["Milk Chocolate"],
    file: "4-20-bar--milk-chocolate-100mg.png",
  },

  // ---- Agro Couture ----
  {
    brand: "Agro Couture",
    nameContains: ["Country Lemonade"],
    file: "agro-couture--country-lemonade-11.jpg",
  },
  {
    brand: "Agro Couture",
    nameContains: ["Pink Lemonade"],
    file: "agro-couture--pink-lemonade-11.jpg",
  },
  {
    brand: "Agro Couture",
    nameContains: ["POG Lemonade"],
    // Note: Agro Couture doesn't have a per-flavor POG photo. POG (passion-
    // orange-guava) IS the tropical-lemonade-family flavor, so we render
    // the Tropical Lemonade photo. Sanity-check with Doug if customers
    // complain.
    file: "agro-couture--pog-lemonade-11.jpg",
  },
  {
    brand: "Agro Couture",
    nameContains: ["Strawberry Lemonade"],
    file: "agro-couture--strawberry-lemonade-11.jpg",
  },
  {
    brand: "Agro Couture",
    nameContains: ["Tropical Lemonade"],
    file: "agro-couture--tropical-lemonade-11.jpg",
  },
  {
    brand: "Agro Couture",
    nameContains: ["Blue Raspberry"],
    file: "agro-couture--blue-raspberry-lemonade.jpg",
  },
  {
    brand: "Agro Couture",
    nameContains: ["Dropper"],
    file: "agro-couture--topical-infusions-dropper.jpg",
  },
  {
    brand: "Agro Couture",
    nameContains: ["Diamond Stix"],
    file: "agro-couture--diamond-stix-blunt-gelato.jpg",
  },

  // ---- Double Delicious ----
  {
    brand: "Double Delicious",
    nameContains: ["Soothing Gel"],
    file: "double-delicious--soothing-gel.png",
  },
  {
    brand: "Double Delicious",
    nameContains: ["Super Infusionz"],
    file: "double-delicious--hybrid-super-infusionz.png",
  },
];

/**
 * Build-time set of all file paths referenced by the rules above. Consumed
 * by the build-gate (`scripts/check-product-photos-manifest.mjs`) to
 * verify every rule has a matching file on disk.
 */
export const PRODUCT_PHOTO_FILES_REFERENCED: ReadonlySet<string> = new Set(
  PRODUCT_PHOTO_RULES.map((r) => r.file),
);

/**
 * Try to match a product to a Tier-A product photo. Returns the absolute
 * path to render in the menu tile, or null if no rule matches.
 *
 * Call this BEFORE the brand-logo check in `ProductImage`. When this
 * returns a path, render that photo; when it returns null, fall through to
 * the existing brand-logo → category-placeholder → emoji chain.
 *
 * Match semantics:
 *   - `brand` MUST equal product.brand exactly (case-sensitive — Dutchie
 *     emits brand strings as canonical PascalCase / "ALL CAPS" / etc; we
 *     match what Dutchie emits, no normalization).
 *   - `category` (if set on the rule) MUST be a substring of product.category.
 *   - `nameContains` (if set) ALL keywords MUST appear in product.name
 *     (case-INsensitive — product names have inconsistent capitalization).
 *   - First matching rule wins. Define more-specific rules earlier in the
 *     array so they win over more-general ones.
 */
export function matchProductPhoto(
  name: string | null | undefined,
  brand: string | null | undefined,
  category: string | null | undefined,
): string | null {
  if (!name || !brand) return null;
  const nameLower = name.toLowerCase();
  for (const rule of PRODUCT_PHOTO_RULES) {
    if (rule.brand !== brand) continue;
    if (rule.category && !(category ?? "").includes(rule.category)) continue;
    if (rule.nameContains) {
      const allKeywordsMatch = rule.nameContains.every((kw) =>
        nameLower.includes(kw.toLowerCase()),
      );
      if (!allKeywordsMatch) continue;
    }
    return `/product-photos/${rule.file}`;
  }
  return null;
}
