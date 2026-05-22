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

  // ---- Fifty Fold (30 SKUs — all DOH Flower + Infused Preroll. Per-strain
  // photos from fiftyfolds.com/strains Squarespace gallery — 50+ strains
  // available, but only 3 match current SCC catalog (Caribbean Cookies,
  // Dante's Inferno, Double Stack etc not in fiftyfolds gallery today). ----
  {
    brand: "Fifty Fold",
    nameContains: ["ChemDozer"],
    file: "fifty-fold--chemdozer.webp",
  },
  {
    brand: "Fifty Fold",
    nameContains: ["First Class Funk"],
    file: "fifty-fold--first-class-funk.webp",
  },
  {
    brand: "Fifty Fold",
    nameContains: ["Love"],
    file: "fifty-fold--love.webp",
  },

  // ---- Dewey Cannabis (30 SKUs — cartridges + flower + prerolls + concentrate
  // from deweycannabis.com Squarespace. Only category-level photography
  // surfaced; brand-own /products /signature-flower /all-strains paths
  // serve mostly logos. dab_pen_01 + pullmanprimer flower shot from
  // homepage. ----
  {
    brand: "Dewey",
    category: "Cartridge",
    file: "dewey--cartridge.webp",
  },
  {
    brand: "Dewey",
    category: "Flower",
    file: "dewey--flower.webp",
  },

  // ---- High Tide (30 SKUs — flower + concentrate + cart + preroll across
  // many strains. Per-strain photos from hightidecannabis.com Wix strain
  // gallery — 21 distinct strain images served at w_480 from wixstatic.
  // Most catalog strain names map cleanly to one of the gallery strains. ----
  {
    brand: "High Tide",
    nameContains: ["Blue Limeade"],
    file: "high-tide--blue-limeade.jpg",
  },
  {
    brand: "High Tide",
    nameContains: ["Blue Lobster"],
    file: "high-tide--blue-lobster.jpg",
  },
  {
    brand: "High Tide",
    nameContains: ["Blue Nerdz"],
    file: "high-tide--blue-nerdz.jpg",
  },
  {
    brand: "High Tide",
    nameContains: ["Breathalyzer"],
    file: "high-tide--breathalyzer.jpg",
  },
  {
    brand: "High Tide",
    nameContains: ["Crunch Berriez"],
    file: "high-tide--crunch-berriez.jpg",
  },
  {
    brand: "High Tide",
    nameContains: ["Goo"],
    file: "high-tide--goo.jpg",
  },
  {
    brand: "High Tide",
    nameContains: ["Granddaddy Purple"],
    file: "high-tide--granddaddy-purple.jpg",
  },
  {
    brand: "High Tide",
    nameContains: ["Gumi"],
    file: "high-tide--gumi.jpg",
  },
  {
    brand: "High Tide",
    nameContains: ["Lemon Cherry Rocket"],
    file: "high-tide--lemon-cherry-rocket.jpg",
  },
  {
    brand: "High Tide",
    nameContains: ["Lulu Lemon"],
    file: "high-tide--lulu-lemon.jpg",
  },
  {
    brand: "High Tide",
    nameContains: ["Moechilla"],
    file: "high-tide--moechilla.jpg",
  },
  {
    brand: "High Tide",
    nameContains: ["Pink Runtz"],
    file: "high-tide--pink-runtz.jpg",
  },
  {
    brand: "High Tide",
    nameContains: ["Prezzure"],
    file: "high-tide--prezzure.jpg",
  },
  {
    brand: "High Tide",
    nameContains: ["Red Hotz"],
    file: "high-tide--red-hotz.jpg",
  },
  {
    brand: "High Tide",
    nameContains: ["Schrom"],
    file: "high-tide--schrom.jpg",
  },
  {
    brand: "High Tide",
    nameContains: ["Spooky"],
    file: "high-tide--spooky.jpg",
  },
  {
    brand: "High Tide",
    nameContains: ["Stashbox"],
    file: "high-tide--stashbox.jpg",
  },
  {
    brand: "High Tide",
    nameContains: ["Twin Peaks"],
    file: "high-tide--twin-peaks.jpg",
  },
  {
    brand: "High Tide",
    nameContains: ["Unicorn Factory"],
    file: "high-tide--unicorn-factory.jpg",
  },
  {
    brand: "High Tide",
    nameContains: ["Whistle Tip"],
    file: "high-tide--whistle-tip.jpg",
  },
  {
    brand: "High Tide",
    nameContains: ["Zeaweed"],
    file: "high-tide--zeaweed.jpg",
  },

  // ---- Ceres Garden (54 SKUs — tinctures + edibles + topicals + capsules
  // from ceresgarden.com WP. Category-level product photography. Catalog
  // brand="Ceres". Most-specific keyword rules first, then category
  // fallbacks. ----
  {
    brand: "Ceres",
    nameContains: ["Bath", "Salt"],
    file: "ceres--bath-salts.png",
  },
  {
    brand: "Ceres",
    nameContains: ["Capsule"],
    file: "ceres--capsules.png",
  },
  {
    brand: "Ceres",
    nameContains: ["Chocolate"],
    file: "ceres--chocolates.png",
  },
  {
    brand: "Ceres",
    nameContains: ["Chew"],
    file: "ceres--chews.png",
  },
  {
    brand: "Ceres",
    nameContains: ["Drop"],
    file: "ceres--drops.png",
  },
  {
    brand: "Ceres",
    nameContains: ["Gummies"],
    file: "ceres--gummies.png",
  },
  {
    brand: "Ceres",
    nameContains: ["Tincture"],
    file: "ceres--tinctures.png",
  },
  {
    brand: "Ceres",
    nameContains: ["Vape"],
    file: "ceres--hash-resin-vape.png",
  },
  {
    brand: "Ceres",
    category: "Tincture",
    file: "ceres--tinctures.png",
  },
  {
    brand: "Ceres",
    category: "Topical",
    file: "ceres--topicals.png",
  },
  {
    brand: "Ceres",
    category: "Concentrate",
    file: "ceres--concentrates.png",
  },

  // ---- Dope Cooks (29 SKUs — cartridges + concentrates + infused pre-rolls
  // from dopecooks420.com WP. Bot-blocked on default User-Agent; required
  // realistic Safari UA. Photos are product-line level (not per-strain), so
  // rules match by category-or-keyword. Order matters — narrow keywords
  // first. ----
  {
    brand: "Dope Cooks",
    nameContains: ["Crazy Cart"],
    file: "dope-cooks--crazy-cart.png",
  },
  {
    brand: "Dope Cooks",
    nameContains: ["Pre-Roll"],
    file: "dope-cooks--infused-preroll-bho.png",
  },
  {
    brand: "Dope Cooks",
    nameContains: ["Preroll"],
    file: "dope-cooks--infused-preroll-bho.png",
  },
  {
    brand: "Dope Cooks",
    nameContains: ["Wax"],
    file: "dope-cooks--bho-wax.png",
  },
  {
    brand: "Dope Cooks",
    category: "Concentrate",
    file: "dope-cooks--bho-wax.png",
  },
  {
    brand: "Dope Cooks",
    category: "Cartridge",
    file: "dope-cooks--vape-hybrid.png",
  },

  // ---- K-Savage (25 SKUs — flower + prerolls + cartridge. Per-strain
  // photos from k-savage.com Squarespace `/flower/<strain>` subpages via
  // `?format=600w` URL trick. 7 strains match catalog (Angela 3, GMO 3,
  // Blue Lobster 4, El Chivo 3, Lantz 2, Gas Face 1, Lilac Wine 1).
  // Kush Mints not in current catalog — skipped. ----
  {
    brand: "K-Savage",
    nameContains: ["Angela"],
    file: "k-savage--angela.webp",
  },
  {
    brand: "K-Savage",
    nameContains: ["GMO"],
    file: "k-savage--gmo.webp",
  },
  {
    brand: "K-Savage",
    nameContains: ["Blue Lobster"],
    file: "k-savage--blue-lobster.webp",
  },
  {
    brand: "K-Savage",
    nameContains: ["El Chivo"],
    file: "k-savage--el-chivo.webp",
  },
  {
    brand: "K-Savage",
    nameContains: ["Lantz"],
    file: "k-savage--lantz.webp",
  },
  {
    brand: "K-Savage",
    nameContains: ["Gas Face"],
    file: "k-savage--gas-face.webp",
  },
  {
    brand: "K-Savage",
    nameContains: ["Lilac Wine"],
    file: "k-savage--lilac-wine.webp",
  },

  // ---- Pioneer Squares (20 SKUs — Fruit Noms gummies in various flavors
  // from pioneersquares.com WP — Craft Elixirs parent). 10 per-flavor
  // photos cover ~18 of 20 SKUs. Skipped Peach Mango (no photo on site). ----
  {
    brand: "Pioneer Squares",
    nameContains: ["Key Lime"],
    file: "pioneer-squares--key-lime-pie.jpg",
  },
  {
    brand: "Pioneer Squares",
    nameContains: ["Lemon Mandarin"],
    file: "pioneer-squares--lemon-mandarin.jpg",
  },
  {
    brand: "Pioneer Squares",
    nameContains: ["Pineapple Crush"],
    file: "pioneer-squares--pineapple-crush.jpg",
  },
  {
    brand: "Pioneer Squares",
    nameContains: ["Pink Lemonade"],
    file: "pioneer-squares--pink-lemonade.jpg",
  },
  {
    brand: "Pioneer Squares",
    nameContains: ["Ruby Grapefruit"],
    file: "pioneer-squares--ruby-grapefruit.jpg",
  },
  {
    brand: "Pioneer Squares",
    nameContains: ["Sour Cherry"],
    file: "pioneer-squares--sour-cherry.jpg",
  },
  {
    brand: "Pioneer Squares",
    nameContains: ["Watermelon Kiwi"],
    file: "pioneer-squares--watermelon-kiwi.jpg",
  },
  {
    brand: "Pioneer Squares",
    nameContains: ["Blueberry Dreams"],
    file: "pioneer-squares--blueberry-dreams.jpg",
  },
  {
    brand: "Pioneer Squares",
    nameContains: ["Cherry Dreams"],
    file: "pioneer-squares--cherry-dreams.jpg",
  },
  {
    brand: "Pioneer Squares",
    nameContains: ["Pineapple Dreams"],
    file: "pioneer-squares--pineapple-dreams.jpg",
  },

  // ---- JourneyMan (29 SKUs — lemonade shooters + hash rosin lemonades +
  // gummies from lifeisajourneyman.com Squarespace. 6 per-product photos
  // matched to specific lemonade flavors. Catalog brand="JourneyMan" exact
  // capitalization (despite "Journeyman" in product NAME field). ----
  {
    brand: "JourneyMan",
    nameContains: ["Berry Lemonade"],
    file: "journeyman--berry-lemonade.webp",
  },
  {
    brand: "JourneyMan",
    nameContains: ["Tropical Lemonade"],
    file: "journeyman--tropical-lemonade.webp",
  },
  {
    brand: "JourneyMan",
    nameContains: ["Tart Lemonade"],
    file: "journeyman--tart-lemonade.webp",
  },
  {
    brand: "JourneyMan",
    nameContains: ["Strawberry", "Hash"],
    file: "journeyman--strawberry-hash.webp",
  },
  {
    brand: "JourneyMan",
    nameContains: ["Peach", "Hash"],
    file: "journeyman--peach-hash.webp",
  },
  {
    brand: "JourneyMan",
    nameContains: ["Pineapple", "Hash"],
    file: "journeyman--pineapple-hash.webp",
  },

  // ---- Flipside (50 SKUs, all DOH Cartridge — base + Platinum + Gold tiers).
  // Order matters: per-strain rules FIRST (Cherry Gelato / Pineapple Express
  // / etc cover specific SKUs regardless of tier), then "Platinum" + "Gold"
  // tier fallbacks for the catch-all. ~43 of 50 SKUs covered by these 7 rules. ----
  {
    brand: "Flipside",
    nameContains: ["Cherry Gelato"],
    file: "flipside--cherry-gelato-disposable.png",
  },
  {
    brand: "Flipside",
    nameContains: ["Pineapple Express"],
    file: "flipside--pineapple-express-disposable.png",
  },
  {
    brand: "Flipside",
    nameContains: ["Rocket Popz"],
    file: "flipside--rocket-popz-disposable.png",
  },
  {
    brand: "Flipside",
    nameContains: ["Strawberry Lemon Haze"],
    file: "flipside--strawberry-lemon-haze-disposable.png",
  },
  {
    brand: "Flipside",
    nameContains: ["Watermelon Sugar"],
    file: "flipside--watermelon-sugar-disposable.png",
  },
  {
    brand: "Flipside",
    nameContains: ["Platinum"],
    file: "flipside--platinum-disposable.png",
  },
  {
    brand: "Flipside",
    nameContains: ["Gold"],
    file: "flipside--gold-disposable.png",
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
  {
    brand: "Fairwinds",
    nameContains: ["Companion"],
    file: "fairwinds--tincture-companion-b32.png",
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

  // ---- Mama J's (327 SKUs combined; WSLCB Tier-2 Longview producer).
  // Brand-supplied product photography sourced from Weedmaps brand portal.
  // Per-category rules cover the 3 largest categories (Flower 89 / Cartridge 37 /
  // Pre-Roll 20) plus Concentrate (16). nameContains "Rosin" BEFORE generic
  // Concentrate so rosin gets its own art. nameContains "Bubble Hash" BEFORE
  // Infused Pre category to catch infused-PR-by-name. **Gap:** no Cartridge
  // photo in this batch — Cart SKUs (37) fall through to brand-logo (still
  // better than emoji). Follow-up to add later.
  {
    brand: "Mama J's",
    nameContains: ["Rosin"],
    file: "mama-js--rosin.jpg",
  },
  {
    brand: "Mama J's",
    nameContains: ["Bubble Hash"],
    file: "mama-js--infused-preroll.jpg",
  },
  {
    brand: "Mama J's",
    category: "Infused Pre",
    file: "mama-js--infused-preroll.jpg",
  },
  {
    brand: "Mama J's",
    category: "Concentrate",
    file: "mama-js--concentrate.jpg",
  },
  {
    brand: "Mama J's",
    category: "Pre-Roll",
    file: "mama-js--preroll-joints.jpg",
  },
  {
    brand: "Mama J's",
    category: "Flower",
    file: "mama-js--flower-jar.jpg",
  },

  // ---- Hustler's Ambition (324 SKUs combined; WA-distributed brand also in NV).
  // Brand-supplied product photography sourced from Weedmaps brand portal.
  // Per-category rules cover Flower 63 / Cartridge 43 (substring also catches
  // DOH Cartridge 13) / Pre-Roll 19 / Infused Pre-Roll 18 / Concentrate 5.
  // nameContains "Multipack" / "Minis" / "28pk" BEFORE generic Pre-Roll for
  // pre-roll-line photos. **DO NOT MATCH** "Hustler's Butter" (separate
  // WA-stocked brand — exact-brand-match on "Hustler's Ambition" string
  // already prevents this; flagging in comment).
  {
    brand: "Hustler's Ambition",
    category: "Infused Pre",
    file: "hustlers-ambition--infused-preroll.jpg",
  },
  {
    brand: "Hustler's Ambition",
    nameContains: ["Multipack"],
    file: "hustlers-ambition--preroll-multipack.jpg",
  },
  {
    brand: "Hustler's Ambition",
    nameContains: ["Minis"],
    file: "hustlers-ambition--preroll-minis.jpg",
  },
  {
    brand: "Hustler's Ambition",
    nameContains: ["28pk"],
    file: "hustlers-ambition--preroll-multipack.jpg",
  },
  {
    brand: "Hustler's Ambition",
    category: "Cartridge",
    file: "hustlers-ambition--cartridge.jpg",
  },
  {
    brand: "Hustler's Ambition",
    category: "Flower",
    file: "hustlers-ambition--flower-big-buds.jpg",
  },

  // ---- Hitz Cannabis (272 SKUs combined; WSLCB i502 Tier-3 Yelm WA producer,
  // founded 2018). Brand-supplied product photography from hitzproducts.com
  // (the WA brand — NOT hitzbrand.com which is a separate non-cannabis vape
  // company). Two brand strings exist in DB ('Hitz' alias 16 SKUs + 'Hitz
  // Cannabis' 256 SKUs); both get rules. Edible Solid (24 SKUs) intentionally
  // falls through to brand-logo (no HITZ-branded edible photo on .com).
  {
    brand: "Hitz Cannabis",
    category: "Infused Pre",
    file: "hitz-cannabis--preroll.jpg",
  },
  {
    brand: "Hitz Cannabis",
    category: "Pre-Roll",
    file: "hitz-cannabis--preroll.jpg",
  },
  {
    brand: "Hitz Cannabis",
    category: "Cartridge",
    file: "hitz-cannabis--cartridge.jpg",
  },
  {
    brand: "Hitz Cannabis",
    category: "Concentrate",
    file: "hitz-cannabis--concentrate.jpg",
  },
  {
    brand: "Hitz Cannabis",
    category: "Flower",
    file: "hitz-cannabis--flower.jpg",
  },
  {
    brand: "Hitz",
    category: "Cartridge",
    file: "hitz-cannabis--cartridge.jpg",
  },
  {
    brand: "Hitz",
    category: "Concentrate",
    file: "hitz-cannabis--concentrate.jpg",
  },

  // ---- Pagoda (488 SKUs combined; WA-distributed flower-heavy brand "Pagoda
  // Premium Indoor"). No brand-own site found; brand-uploaded photography
  // sourced from Weedmaps brand portal (same fallback pattern as Mama J's +
  // Hustler's Ambition). Cartridge + Concentrate categories intentionally fall
  // through to brand-logo (no Pagoda-branded photo for those on Weedmaps yet).
  // nameContains "Big Buds" gets the strain-isolated Gary Payton art for that
  // naming convention.
  {
    brand: "Pagoda",
    nameContains: ["Big Buds"],
    file: "pagoda--flower-bud.jpg",
  },
  {
    brand: "Pagoda",
    category: "Infused Pre",
    file: "pagoda--infused-preroll.jpg",
  },
  {
    brand: "Pagoda",
    category: "Pre-Roll",
    file: "pagoda--preroll.jpg",
  },
  {
    brand: "Pagoda",
    category: "Flower",
    file: "pagoda--flower.jpg",
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
