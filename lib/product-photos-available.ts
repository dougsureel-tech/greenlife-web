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

  // ---- Slab Mechanix (29 SKUs — concentrate form distinguished by NAME
  // not category. "Shatter" vs "Sugar Wax" are both category="DOH
  // Concentrate" but the brand publishes distinct product photography for
  // each. Order matters — name-keyword rules first, then category-based
  // fallbacks for the rest. ----
  {
    brand: "Slab Mechanix",
    nameContains: ["Sugar Wax"],
    file: "slab-mechanix--sugar-wax.jpg",
  },
  {
    brand: "Slab Mechanix",
    nameContains: ["Shatter"],
    file: "slab-mechanix--shatter.jpg",
  },
  {
    brand: "Slab Mechanix",
    nameContains: ["Joint"],
    file: "slab-mechanix--infused-joint.jpg",
  },
  {
    brand: "Slab Mechanix",
    category: "Pre-Roll",
    file: "slab-mechanix--infused-preroll.jpg",
  },
  {
    brand: "Slab Mechanix",
    category: "Cartridge",
    file: "slab-mechanix--cartridge.jpg",
  },
  {
    brand: "Slab Mechanix",
    category: "Flower",
    file: "slab-mechanix--bbud-flower.jpg",
  },

  // ---- Constellation Cannabis (41 SKUs across 6 category buckets from
  // constellationcannabis.com/products/). Brand-own per-category renders
  // are clean — `Hash` for concentrate, `All-In-One-Vape` for cartridge,
  // `Moonshot Infused Drink` for liquid edible, `Gummies` for solid edible,
  // `Hash Infused Preroll` for pre-roll. ----
  {
    brand: "Constellation Cannabis",
    category: "Concentrate",
    file: "constellation--hash.jpg",
  },
  {
    brand: "Constellation Cannabis",
    category: "Cartridge",
    file: "constellation--vape.jpg",
  },
  {
    brand: "Constellation Cannabis",
    category: "Edible (Liquid)",
    file: "constellation--drink.jpg",
  },
  {
    brand: "Constellation Cannabis",
    category: "Flower",
    file: "constellation--flower.jpg",
  },
  {
    brand: "Constellation Cannabis",
    category: "Edible (Solid)",
    file: "constellation--gummies.jpg",
  },
  {
    brand: "Constellation Cannabis",
    category: "Pre-Roll",
    file: "constellation--preroll.jpg",
  },

  // ---- Plaid Jacket (38 SKUs, mix of cartridge + flower + preroll
  // from plaidjacket.com Squarespace. Originals were 3MB WebP — fetched at
  // `?format=500w` for ~150KB each. Catalog "GB" matches "GB *Elevated*" +
  // "GB *Black Label*" variants. Super Boof matches multiple cart + flower
  // SKUs. ----
  {
    brand: "Plaid Jacket",
    nameContains: ["Super Boof"],
    file: "plaid-jacket--strain-super-boof.webp",
  },
  {
    brand: "Plaid Jacket",
    nameContains: ["GB"],
    file: "plaid-jacket--strain-gb-glacee-blanche.webp",
  },
  {
    brand: "Plaid Jacket",
    category: "Flower",
    file: "plaid-jacket--premium-flower-3-5g.webp",
  },

  // ---- Bondi Farms (50 SKUs, all flower — per-strain photos from
  // bondifarms.com Squarespace label gallery). Per-strain matching by
  // name substring. ----
  {
    brand: "Bondi Farms",
    nameContains: ["Blackberry"],
    file: "bondi-farms--blackberry.webp",
  },
  {
    brand: "Bondi Farms",
    nameContains: ["Blueberry"],
    file: "bondi-farms--blueberry.webp",
  },
  {
    brand: "Bondi Farms",
    nameContains: ["Candyland"],
    file: "bondi-farms--candy-land.webp",
  },
  {
    brand: "Bondi Farms",
    nameContains: ["Cherry Dosidos"],
    file: "bondi-farms--cherry-do-si-do.webp",
  },
  {
    brand: "Bondi Farms",
    nameContains: ["Crazy Goo"],
    file: "bondi-farms--crazy-goo.webp",
  },
  {
    brand: "Bondi Farms",
    nameContains: ["GMO"],
    file: "bondi-farms--gmo.webp",
  },
  {
    brand: "Bondi Farms",
    nameContains: ["God's Gift"],
    file: "bondi-farms--gods-gift.webp",
  },
  {
    brand: "Bondi Farms",
    nameContains: ["LA Kush Cake"],
    file: "bondi-farms--la-kush-cake.webp",
  },
  {
    brand: "Bondi Farms",
    nameContains: ["Runtz"],
    file: "bondi-farms--runtz.webp",
  },
  {
    brand: "Bondi Farms",
    nameContains: ["Strawberry Gary"],
    file: "bondi-farms--strawberry-gary.webp",
  },
  {
    brand: "Bondi Farms",
    nameContains: ["Sunset Sherbert"],
    file: "bondi-farms--sunset-sherbert.webp",
  },
  {
    brand: "Bondi Farms",
    nameContains: ["Super Boof"],
    file: "bondi-farms--super-boof.webp",
  },

  // ---- Harmony Farms (52 SKUs, mostly flower from harmonyfarmsnw.com).
  // Only 3 strain photos secured at usable sizes (the rest of the gallery
  // serves 6-20MB originals that wouldn't compress cleanly without
  // re-encoding). Other Harmony Farms SKUs fall to brand-logo. ----
  {
    brand: "Harmony Farms",
    nameContains: ["Black Jack"],
    file: "harmony-farms--black-jack.jpg",
  },
  {
    brand: "Harmony Farms",
    nameContains: ["Dutch Treat"],
    file: "harmony-farms--dutch-treat.jpg",
  },
  {
    brand: "Harmony Farms",
    nameContains: ["Lemon Tart"],
    file: "harmony-farms--lemon-tart.jpg",
  },

  // ---- Aloha Botanics (21 SKUs, mix of flower + disposable carts from
  // alohabotanics.com). 4 strain photos secured. ----
  {
    brand: "Aloha Botanics",
    nameContains: ["Maui Wowie"],
    file: "aloha-botanics--maui-wowie.png",
  },
  {
    brand: "Aloha Botanics",
    nameContains: ["Jack Herer"],
    file: "aloha-botanics--jack-herer.png",
  },
  {
    brand: "Aloha Botanics",
    nameContains: ["Acapulco Gold"],
    file: "aloha-botanics--acapulco-gold.png",
  },
  {
    brand: "Aloha Botanics",
    nameContains: ["3 Kings"],
    file: "aloha-botanics--3-kings.png",
  },

  // ---- Passion Flower (23 SKUs, mostly flower from passionflowerwa.com).
  // Site is light on per-strain photos — using category-level renders. ----
  {
    brand: "Passion Flower",
    category: "Pre-Roll",
    file: "passion-flower--preroll-10pk-mockup.jpg",
  },
  {
    brand: "Passion Flower",
    category: "Cartridge",
    file: "passion-flower--vape-cart-cartridge.png",
  },
  {
    brand: "Passion Flower",
    category: "Concentrate",
    file: "passion-flower--concentrates-oil.jpg",
  },

  // ---- Washington Bud Company (21 SKUs, mostly flower from wabudco.com).
  // Brand also makes cannagars + kief + ice-hash. ----
  {
    brand: "Washington Bud Company",
    nameContains: ["Cannagar"],
    file: "washington-bud-company--cannagar.jpg",
  },
  {
    brand: "Washington Bud Company",
    nameContains: ["Kief"],
    file: "washington-bud-company--kief.jpg",
  },
  {
    brand: "Washington Bud Company",
    category: "Flower",
    file: "washington-bud-company--flower-prerolls.jpg",
  },

  // ---- Rochester Farms (43 SKUs, mostly flower — only 1 photo at usable
  // size after curation; the other 11 strain photos from rf.min.js Angular
  // bundle were too large to ship economically. Match what we have, fall
  // back to brand-logo for the rest. ----
  {
    brand: "Rochester Farms",
    nameContains: ["Huckleberry"],
    file: "rochester-farms--huckleberry-soda.jpg",
  },

  // ---- Fairwinds (19 SKUs across 3 category buckets from
  // fairwindscannabis.com/products/). "Deep Sleep" tincture render works
  // as a generic Edible (Liquid) fallback — most Fairwinds liquids are
  // tinctures. Vape (Live Resin Cartridge) for cartridge. Capsules for
  // solid. ----
  {
    brand: "Fairwinds",
    category: "Cartridge",
    file: "fairwinds--vape-1-1.jpg",
  },
  {
    brand: "Fairwinds",
    category: "Edible (Liquid)",
    file: "fairwinds--tincture-deep-sleep.jpg",
  },
  {
    brand: "Fairwinds",
    category: "Edible (Solid)",
    file: "fairwinds--capsule-1-1.jpg",
  },

  // ---- 2727 (brand+category fallback — no per-strain photography on
  // 2727life.com; instead they have 4 category-level art renders). Catalog
  // emits multiple pre-roll category strings ("DOH Pre-Roll" / "Infused Pre-
  // Roll" / "DOH Preroll" / "Pre-Roll") — handled via two rules (substring
  // matches "Pre-Roll" + "Preroll" cover all variants). "Flower" matches
  // both "Flower" and "DOH Flower". ----
  {
    brand: "2727",
    category: "Cartridge",
    file: "2727--cartridge-category.png",
  },
  {
    brand: "2727",
    category: "Concentrate",
    file: "2727--concentrate-category.png",
  },
  {
    brand: "2727",
    category: "Pre-Roll",
    file: "2727--preroll-pack-category.png",
  },
  {
    brand: "2727",
    category: "Preroll",
    file: "2727--preroll-pack-category.png",
  },
  {
    brand: "2727",
    category: "Flower",
    file: "2727--flower-category.png",
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
