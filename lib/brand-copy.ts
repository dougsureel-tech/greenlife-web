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

  "buddy-boy-farm": {
    slug: "buddy-boy-farm",
    tagline: "Eastern Washington greenhouse. Forty years of farming, before cannabis was even on the books.",
    bio: "Buddy Boy Farm sits on a working organic farm in Ford, Washington — out past Spokane on land the family has farmed for nearly forty years. They moved into licensed cannabis in 2014, after I-502 passed, and they grow it the same way they grew everything else: spring water from an on-site source, beneficial insects instead of broad-spectrum sprays, and soil amendments built up over decades.\n\nThe lineup is mostly flower and pre-rolls, all greenhouse-grown across 24 structures on the property. The team doesn't claim formal organic certification for cannabis — federal law makes that complicated — but they've gone on record that no harmful or non-organic pesticides touch the plants. DJ, one of the long-time owners, has developed signature varieties like God’s Gift and Dutch Queen on the farm over the years.\n\nIf you’re shopping for greenhouse-grown WA flower with a long-form farming story behind it — and a price point that reflects greenhouse economics rather than indoor — Buddy Boy is one of the names budtenders mention first.",
    updatedAt: "2026-05-16",
  },

  "constellation-cannabis": {
    slug: "constellation-cannabis",
    tagline: "Washington flower, hash rosin, and 1:1 edibles under one roof.",
    bio: "Constellation Cannabis is a licensed Washington producer/processor (WSLCB #427037) running a multi-format catalog — flower, pre-rolls (including infused), hash rosin and other concentrates, plus a gummy and capsule edible line with several CBD-balanced ratios.\n\nTheir flower side reaches for newer-school dessert and gas crosses (Cereal Milk, Blueberry, The Glove) alongside infused pre-roll novelties like Wedding Crasher and Purple Pineapple Express. The extract side leans into solventless: their Blush Velvet hash rosin line is the one that shows up most often on the shelf, with cured-resin carts and live products rounding out the vape side.\n\nThe edibles are where Constellation differentiates — gummies and capsules in 1:1 THC:CBD ratios at meaningful doses, for customers who specifically reach for balanced products rather than THC-dominant ones. It’s a useful brand to know when a customer wants flower, rosin, and edibles from a single Washington shop rather than three.",
    updatedAt: "2026-05-16",
  },

  "falcanna": {
    slug: "falcanna",
    tagline: "Olympic Peninsula craft cannabis. Clean Green Certified, woman- and Native American-owned.",
    bio: "Falcanna is a Port Angeles-based cannabis brand founded in November 2015 by Bethany and Justin Rondeaux. The Rondeauxs had been growing cannabis well before I-502 — they ran one of the first medical dispensaries on Washington’s Olympic Peninsula — and rolled that lineage into a licensed recreational brand when the state allowed it.\n\nThe farm is 100% minority-owned (50% woman-owned, 50% Native American-owned) and Clean Green Certified — the cannabis industry’s closest analog to USDA Organic certification, since federal law keeps cannabis out of the actual USDA program. Flower is grown organically and pesticide-free. The brand name nods to the founders’ work outside the grow: they’re active in falcon and hawk rehabilitation and habitat preservation on the Peninsula.\n\nFalcanna’s catalog is flower-forward, with the kind of strain selection you’d expect from a small craft operation — limited drops, rotating phenos, and concentrate runs sourced from their own material. Customers who reach for it tend to be looking for clean inputs and a documented chain of custody back to the farm.",
    updatedAt: "2026-05-16",
  },

  "kiva-confections": {
    slug: "kiva-confections",
    tagline: "Edibles built like chocolate, not like cannabis novelty.",
    bio: "Kiva Confections was founded in 2010 by Scott and Kristi Palmer, who started making the first Kiva chocolate bars in their home kitchen in California. The company now operates out of a 13,000-square-foot production facility in Oakland and licenses its lines into legal markets across the country, Washington included.\n\nKiva’s catalog runs deeper than most edible brands. Their flagship is the Kiva chocolate bar in single-origin and dessert profiles. Around it sit Terra (chocolate-covered nuts and espresso beans), Petra (sugar-free breath mints with low-dose THC), Camino (fruit gummies built around terpene blends — the most-stocked of the lineup in many WA shops), and Lost Farm (a single-strain live-resin fruit chew). Doses are precise, and the formats are designed around how people actually eat candy — a square at a time, not a whole bar.\n\nThe Washington production is licensed through a local manufacturing partner so the products meet WSLCB sourcing rules, but the recipes and brand standards are the same as California. Customers reach for Kiva when they want a name they recognize and dose-by-dose consistency across formats.",
    updatedAt: "2026-05-16",
  },

  "lifted-cannabis": {
    slug: "lifted-cannabis",
    tagline: "Tacoma Tier 3 indoor. Pheno-hunted in-house, hand-watered, glass-jar cured.",
    bio: "Lifted Cannabis is a Tier 3 indoor producer/processor based in Tacoma, operating out of the former Nalley Fine Foods pickle factory — a piece of South Sound industrial history that’s now a working cannabis facility. The team got their start in Washington’s pre-I-502 medical market and carried that operator-grown experience into the licensed recreational system.\n\nThe approach is craft-style at indoor scale. Plants are hand-watered rather than fertigated through a manifold, pesticide-free with beneficial predator insects in place of chemical sprays, and the harvested flower is cured in glass jars instead of bulk totes — slower, more labor-intensive, better for terpene retention. Pheno-hunting is done in-house, and the genetics library is broad enough that the menu shifts noticeably between drops.\n\nThe lineup is flower-first — top-shelf eighths and pre-rolls — with cartridges, sugar sticks, and other oil concentrates rounding it out. Wedding Cake is the strain that put the brand on a lot of Washington shoppers’ radar, but the catalog goes well past it. Customers who reach for Lifted tend to be flower-first buyers who care about how the room was run.",
    updatedAt: "2026-05-16",
  },

  "trail-blazin-productions": {
    slug: "trail-blazin-productions",
    tagline: "Bellingham craft flower. Pesticide-free since 2014.",
    bio: "Trail Blazin’ Productions is a craft cannabis farm in Bellingham, founded in 2014 by a group of Whatcom County professionals. The company has been pesticide-free from its first harvest — using beneficial predator insects for pest control rather than chemical sprays — and operates on 100% LED lighting with roughly 95% water reclaim across the facility.\n\nThe catalog skews high-CBD and balanced-ratio more than most Washington brands. Harlequin and Pennywise — both well-documented CBD-forward strains — anchor the flower lineup alongside Dutch-47, 9 Pound Hammer, Amnesia, GG4, and Dutch Grapefruit. Concentrates are shatter-format from the same strain library, and the edible line includes capsules in a range of THC:CBD ratios. There’s also a small topicals line (balms and lotions) for customers specifically asking for non-inhaled formats.\n\nThe brand is hand-trimmed and U.S.-sourced where it can be — nutrients and packaging tubes purchased domestically. Trail Blazin’ is the name budtenders mention when a customer asks for clean inputs, a stable CBD-side menu, and a craft farm with documented practices on the Pacific Northwest end of the state.",
    updatedAt: "2026-05-16",
  },

  "walden-cannabis": {
    slug: "walden-cannabis",
    tagline: "Sun-grown Washington flower from a tier-none farm. Clean Green Certified.",
    bio: "Walden Cannabis is a tier-none producer/processor based in Everett, with grow and processing operations also in Brewster and a presence in South Bend. The brand started with a group of climbers, backpackers, and yogis who wanted to grow cannabis the way they grew everything else they cared about — outdoors, in the sun, with as light a chemical footprint as the regulations would allow.\n\nThe flower is sun-grown and Clean Green Certified — the closest available analog to USDA Organic for cannabis. No harmful pesticides, no synthetic regimen. The crop is dried and cured in temperature- and humidity-controlled rooms, hand-trimmed, and packaged on-site at a 3,200-square-foot facility. Walden also offers white-label drying, trimming, packaging, and consulting to other Washington growers — they’re plumbed into the back end of the state’s supply chain as much as the front.\n\nThe catalog is flower-forward with concentrates (cured resin, distillate carts, and CBD-balanced cartridges) and a small ingestibles line. The cartridge lineup includes 1:1 and 3:1 CBD ratios alongside THC-dominant options. Customers who reach for Walden tend to be looking for sun-grown WA flower with documented inputs and an accessible price point.",
    updatedAt: "2026-05-16",
  },

  "western-cultured": {
    slug: "western-cultured",
    tagline: "Snohomish County terpene-forward cannabis. Color-coded by aroma, not indica/sativa.",
    bio: "Western Cultured is a Washington cannabis producer based in Arlington, in northern Snohomish County, operating out of a former Bayliner Boat Company building. The team runs at a deliberately small scale — about 100 pounds a month with a crew of six — and the entire operation is built around one premise: that terpene profile, not indica/sativa labeling, is the more honest way to describe what a strain actually does.\n\nEvery Western Cultured strain is sorted into a color-coded wheel: red for spicy, blue for sweet, yellow for sour, green for earthy. The categorization is based on terpene testing plus the team’s own consumption notes, and it’s rendered the same way on every package — so a customer learning the wheel on one strain can carry that knowledge across the whole lineup. The brand is explicit that this color system is independent of indica/sativa/hybrid classification.\n\nProduct-wise, Western Cultured runs flower, pre-rolls, and extracts. The cure is treated as a core part of the process — slower drying and proper hang time to retain the terpene composition that the color wheel is built on. Customers who reach for it tend to be terpene-curious shoppers who’ve outgrown the indica/sativa shorthand.",
    updatedAt: "2026-05-16",
  },

  "wyld": {
    slug: "wyld",
    tagline: "Oregon-born real-fruit gummies. Now the most-stocked edible in the West.",
    bio: "Wyld was founded in 2015 in Tumalo, Oregon, by Aaron Morris and Chris Joseph — two spirits-industry veterans who started cooking marionberry and raspberry gummies in a farmhouse on a property that already held an Oregon cannabis license. The first batches reportedly weren’t great. The recipes that came out of the iteration process — fruit-forward, real-juice, low-cost-per-piece — became the brand.\n\nThe core lineup is gummies built around regional fruit profiles: marionberry, huckleberry, raspberry, pear, watermelon, peach, sour apple, and seasonal rotations. Each format is sold in single-strain CBD, 1:1, or THC-dominant ratios depending on what the customer is reaching for, and the doses (typically 10mg per piece) are calibrated for repeatable shopping. Wyld also runs vape cartridges and a hemp-derived THC beverage line in markets that allow it.\n\nThe Washington Wyld products are produced through a state-licensed manufacturing partner so they meet WSLCB sourcing rules, but the recipe and packaging are the same as the Oregon original. Wyld is now one of the most-stocked edible brands in the western U.S. — the name a customer reaches for when they want fruit-forward gummies they’ve had before.",
    updatedAt: "2026-05-16",
  },
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
