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
  /**
   * Optional display-name override — when set, takes precedence over the
   * DB `vendors.name` value in customer-facing surfaces (brand-page h1,
   * homepage Top Brands carousel, breadcrumbs, OG cards, etc.). Use when
   * the DB value is shouty all-caps ("ARTIZEN" → "Artizen"), abbreviated
   * with a legal suffix the customer never types ("Dewey Botanicals LLC"
   * → "Dewey Cannabis Co."), or otherwise differs from the brand's own
   * customer-facing identity. LEAVE UNSET when the DB name is already
   * how the brand presents itself ("Phat Panda", "MFUSED" stylized) —
   * gratuitous overrides drift away from the brand's chosen rendering.
   * Polish-audit 2026-05-20 item.
   */
  displayName?: string;
  /** Long-form bio. 2-4 paragraphs, separated by `\n\n`. Rendered as <p> blocks. Optional — entries may carry only a logoUrl when a brand bio hasn't been written yet but a logo is available. */
  bio?: string;
  /** Optional one-line tagline shown above the bio. */
  tagline?: string;
  /** Optional ISO date of last review — surfaces "Updated YYYY-MM-DD" on the page when set. */
  updatedAt?: string;
  /**
   * File-based logo fallback for vendors whose `vendors.logo_url` DB
   * column is NULL. Path is relative to `public/` (Next.js convention),
   * e.g. "/brand-logos/<slug>.png". Sourced from the brand's own site or
   * a brand-claimed Leafly profile (vendor-uploaded asset), self-hosted
   * at 80px tall PNG, <50KB each. Cross-stack mirrored at
   * `public/brand-logos/` on both greenlife-web and seattle-cannabis-web.
   *
   * Render fallback chain (see app/brands/[slug]/page.tsx):
   *   1. brand.logoUrl (DB column vendors.logo_url, vendor-portal-authored)
   *   2. BRAND_COPY[slug].logoUrl (this field — file-based)
   *   3. 🌿 emoji fallback in dark-green square
   *
   * `isBannedLogoUrl()` filter applies to the DB tier ONLY — file paths
   * under `/brand-logos/` are trusted by definition (under version control).
   */
  logoUrl?: string;
};

export const BRAND_COPY: Record<string, BrandCopy> = {
  // Populate top-SKU brands here. Convention: keep alphabetized by slug
  // so PRs that add a brand drop into a deterministic insertion point.

  "artizen": {
    slug: "artizen",
    displayName: "Artizen",
    logoUrl: "/brand-logos/artizen.png",
    tagline: "Washington indoor flower since 2014. Consistency at a working-budget price.",
    bio: "Artizen is one of the original brands to come out of Washington’s I-502 rollout, founded in 2014 and built around a single premise: keep the flower consistent, keep the price approachable, and let the strain library do the talking. The team is a mix of in-house cultivators and independent growers operating across Washington, all running indoor rooms under the same quality bar.\n\nThe catalog is flower-first — pre-packaged eighths, ounces, and pre-rolls in a wide rotation of strains — with a handful of concentrate and vape formats around the edges. Artizen leans into approachable everyday selection rather than limited drops: the same strains show up week after week, so a customer who finds something they like can come back for it. Distribution reaches roughly 200 Washington retailers, which is why budtenders treat Artizen as a baseline name when a customer asks “what’s reliable?”\n\nThe brand has spent close to a decade in the top-ten by all-time WA flower sales. Customers who reach for it tend to be price-conscious shoppers who want indoor-grown flower without paying boutique pricing, and operators who want a brand they can keep stocked without constant menu rework.",
    updatedAt: "2026-05-16",
  },

  "buddy-boy-farm": {
    slug: "buddy-boy-farm",
    logoUrl: "/brand-logos/buddy-boy-farm.png",
    tagline: "Eastern Washington greenhouse. Forty years of farming, before cannabis was even on the books.",
    bio: "Buddy Boy Farm sits on a working organic farm in Ford, Washington — out past Spokane on land the family has farmed for nearly forty years. They moved into licensed cannabis in 2014, after I-502 passed, and they grow it the same way they grew everything else: spring water from an on-site source, beneficial insects instead of broad-spectrum sprays, and soil amendments built up over decades.\n\nThe lineup is mostly flower and pre-rolls, all greenhouse-grown across 24 structures on the property. The team doesn't claim formal organic certification for cannabis — federal law makes that complicated — but they've gone on record that no harmful or non-organic pesticides touch the plants. DJ, one of the long-time owners, has developed signature varieties like God’s Gift and Dutch Queen on the farm over the years.\n\nIf you’re shopping for greenhouse-grown WA flower with a long-form farming story behind it — and a price point that reflects greenhouse economics rather than indoor — Buddy Boy is one of the names budtenders mention first.",
    updatedAt: "2026-05-16",
  },

  "constellation-cannabis": {
    slug: "constellation-cannabis",
    displayName: "Constellation",
    tagline: "Washington flower, hash rosin, and 1:1 edibles under one roof.",
    bio: "Constellation Cannabis is a licensed Washington producer/processor (WSLCB #427037) running a multi-format catalog — flower, pre-rolls (including infused), hash rosin and other concentrates, plus a gummy and capsule edible line with several CBD-balanced ratios.\n\nTheir flower side reaches for newer-school dessert and gas crosses (Cereal Milk, Blueberry, The Glove) alongside infused pre-roll novelties like Wedding Crasher and Purple Pineapple Express. The extract side leans into solventless: their Blush Velvet hash rosin line is the one that shows up most often on the shelf, with cured-resin carts and live products rounding out the vape side.\n\nThe edibles are where Constellation differentiates — gummies and capsules in 1:1 THC:CBD ratios at meaningful doses, for customers who specifically reach for balanced products rather than THC-dominant ones. It’s a useful brand to know when a customer wants flower, rosin, and edibles from a single Washington shop rather than three.",
    updatedAt: "2026-05-16",
  },

  "falcanna": {
    slug: "falcanna",
    logoUrl: "/brand-logos/falcanna.png",
    tagline: "Olympic Peninsula craft cannabis since 2015. Clean Green Certified, woman- and Native American-owned.",
    bio: "Falcanna is a Port Angeles-based cannabis brand founded in November 2015 by Bethany and Justin Rondeaux. The Rondeauxs had been growing cannabis well before I-502 — they ran one of the first medical dispensaries on Washington’s Olympic Peninsula — and rolled that lineage into a licensed recreational brand when the state allowed it.\n\nThe farm is 100% minority-owned (50% woman-owned, 50% Native American-owned) and Clean Green Certified — the cannabis industry’s closest analog to USDA Organic certification, since federal law keeps cannabis out of the actual USDA program. Flower is grown organically and pesticide-free. The brand name nods to the founders’ work outside the grow: they’re active in falcon and hawk rehabilitation and habitat preservation on the Peninsula.\n\nFalcanna’s catalog is flower-forward, with the kind of strain selection you’d expect from a small craft operation — limited drops, rotating phenos, and concentrate runs sourced from their own material. Customers who reach for it tend to be looking for clean inputs and a documented chain of custody back to the farm.",
    updatedAt: "2026-05-16",
  },

  "hellavated": {
    slug: "hellavated",
    logoUrl: "/brand-logos/hellavated.png",
    tagline: "Arlington-built distillate vapes at a working-budget price point.",
    bio: "Hellavated is a Washington vape brand built by the team behind Avitas — same Arlington, WA operation, separate label aimed at the value end of the cartridge shelf. The product is triple-refined cannabis distillate, blended with botanical-derived terpenes to hit specific strain profiles, and packaged across 1g 510-thread carts, 500mg PAX pods, and 500mg disposables.\n\nThe catalog runs in three tiers. Profilez is the flagship strain-profile series — distillate blended with botanical terps tuned to recognizable cultivars. Strainz adds cannabis-derived terpenes pulled from the matching strain on top of the distillate base. Terpz drops the strain-name framing entirely and runs non-strain-specific blends with cannabis-derived terpenes. All three formats sit at a meaningfully lower price than the premium-vape tier on most Washington shelves, which is the whole point of the brand.\n\nFlavor rotation runs deep — Blueberry Dream, Strawberry Haze, Watermelon Kush, Mango Dragon, Mango Kush, and dozens more in regular rotation. Customers who reach for Hellavated tend to be cart-format buyers who want recognizable strain profiles and accessible pricing without stepping down to gas-station-tier hardware. The Avitas lineage means the distillate side of the operation is the same one that produces the premium tier — just packaged for a different shopper.",
    updatedAt: "2026-05-16",
  },

  "heylo-cannabis": {
    slug: "heylo-cannabis",
    displayName: "Heylo",
    logoUrl: "/brand-logos/heylo-cannabis.png",
    tagline: "SODO Seattle extraction lab since 2017. 100% woman- and Latina-owned, terpene-forward.",
    bio: "Heylo Cannabis is an I-502 extracts processor based in Seattle’s SODO neighborhood, founded in 2017 by Lo Friesen — an environmental chemist trained at Northwestern with prior bench experience in a gastroenterology research lab. The brand is 100% woman- and Latina-owned, and the working premise is that cannabis extracts should taste like the plant they came from, not like distillate with terpenes spiked back in.\n\nThe core lineup is RawX vape cartridges — single-strain oil pulled from fresh-frozen flower with the strain’s native terpene fraction preserved through the extraction. Around it sit Heylotion topicals (Body Budder, Body Balm), Louder Lube, Loud CBD products, and the Heylo AIO and Heylo Pico hardware lines. Sister brands Treehaus and Yolo round out the value-tier cart side. The throughline is education and transparency: COAs are published, the extraction approach is documented, and the marketing avoids the usual “best-in-class” puffery.\n\nThe brand has earned multiple Terpestival first-place finishes and Leafly’s Best Overall Company recognition. Customers who reach for Heylo tend to be terpene-curious shoppers and cartridge buyers who care about extraction method and farm-of-origin — and who appreciate the depth of operator detail Lo and the team publish about the work.",
    updatedAt: "2026-05-16",
  },

  "honu-inc": {
    slug: "honu-inc",
    displayName: "Honu",
    logoUrl: "/brand-logos/honu-inc.png",
    tagline: "Family-owned Washington edibles since 2013. Chocolate-confection-first, dessert second.",
    bio: "Honu is a family-owned I-502 producer/processor founded in Washington in 2013, with operations in the southwest part of the state. The name comes from the Hawaiian word for sea turtle — a symbol of longevity, peace, and humility in Hawaiian culture — and the brand’s approach mirrors that: take the time, do it by hand, keep the dose honest.\n\nThe catalog is edible-first, with the chocolate side as the flagship. Peanut Butter Cups, Chocolate Turtles, Coconut Snowballs, seasonal bars, and rotating confections make up most of the lineup, with each piece dosed to Washington’s 10mg-per-serving rule. The handcrafted side is meaningful here — Honu’s confections are made in small batches with high-quality cannabis extracts blended into the chocolate at the recipe step, not sprayed on after, which is why they taste like dessert before they taste like edible.\n\nThe brand carries 2016 Best Edibles Company and Best Sweet Edibles awards from Washington’s industry circuit, and every product goes through third-party lab testing. Customers who reach for Honu tend to be edible buyers who want the chocolate to actually taste like chocolate, and who appreciate a Washington-rooted family brand with a long enough track record that budtenders mention it without prompting.",
    updatedAt: "2026-05-16",
  },

  "kiva-confections": {
    slug: "kiva-confections",
    logoUrl: "/brand-logos/kiva-confections.png",
    tagline: "Edibles built like chocolate since 2010, not like cannabis novelty.",
    bio: "Kiva Confections was founded in 2010 by Scott and Kristi Palmer, who started making the first Kiva chocolate bars in their home kitchen in California. The company now operates out of a 13,000-square-foot production facility in Oakland and licenses its lines into legal markets across the country, Washington included.\n\nKiva’s catalog runs deeper than most edible brands. Their flagship is the Kiva chocolate bar in single-origin and dessert profiles. Around it sit Terra (chocolate-covered nuts and espresso beans), Petra (sugar-free breath mints with low-dose THC), Camino (fruit gummies built around terpene blends — the most-stocked of the lineup in many WA shops), and Lost Farm (a single-strain live-resin fruit chew). Doses are precise, and the formats are designed around how people actually eat candy — a square at a time, not a whole bar.\n\nThe Washington production is licensed through a local manufacturing partner so the products meet WSLCB sourcing rules, but the recipes and brand standards are the same as California. Customers reach for Kiva when they want a name they recognize and dose-by-dose consistency across formats.",
    updatedAt: "2026-05-16",
  },

  "lifted-cannabis": {
    slug: "lifted-cannabis",
    displayName: "Lifted",
    logoUrl: "/brand-logos/lifted-cannabis.png",
    tagline: "Tacoma Tier 3 indoor. Pheno-hunted in-house, hand-watered, glass-jar cured.",
    bio: "Lifted Cannabis is a Tier 3 indoor producer/processor based in Tacoma, operating out of the former Nalley Fine Foods pickle factory — a piece of South Sound industrial history that’s now a working cannabis facility. The team got their start in Washington’s pre-I-502 medical market and carried that operator-grown experience into the licensed recreational system.\n\nThe approach is craft-style at indoor scale. Plants are hand-watered rather than fertigated through a manifold, pesticide-free with beneficial predator insects in place of chemical sprays, and the harvested flower is cured in glass jars instead of bulk totes — slower, more labor-intensive, better for terpene retention. Pheno-hunting is done in-house, and the genetics library is broad enough that the menu shifts noticeably between drops.\n\nThe lineup is flower-first — top-shelf eighths and pre-rolls — with cartridges, sugar sticks, and other oil concentrates rounding it out. Wedding Cake is the strain that put the brand on a lot of Washington shoppers’ radar, but the catalog goes well past it. Customers who reach for Lifted tend to be flower-first buyers who care about how the room was run.",
    updatedAt: "2026-05-16",
  },

  "raven-grass": {
    slug: "raven-grass",
    logoUrl: "/brand-logos/raven-grass.png",
    tagline: "Washington living-soil flower. Sorted by cannabinoid type, not indica/sativa.",
    bio: "Raven Grass is a Washington cannabis brand that’s been growing in the I-502 market since 2013. The team works in living soil — meaning the plants pull nutrients directly from a biologically active soil web rather than from synthetic liquid feeds — and the rooms run without the standard fertigation manifold most indoor operations rely on.\n\nThe most distinctive thing about Raven Grass is how they label the catalog. Instead of indica / hybrid / sativa, every product is sorted into one of three “types” based on cannabinoid content. Type 01 is THC-dominant. Type 02 carries meaningful amounts of both THC and CBD in varying ratios. Type 03 is CBD-dominant with very little THC. It’s a more honest sort than the indica/sativa shorthand, and it makes the menu legible to customers who care about the underlying chemistry of what they’re buying.\n\nProduct-wise, the lineup is flower, pre-rolls, vape cartridges, and concentrates — all sourced from the same in-house strain library. Customers who reach for Raven Grass tend to be flower-first buyers who want a documented growing approach and a clearer way to pick a product than the indica/sativa wall. The brand has been a consistent climber in WA pre-roll category rank through 2024-2025.",
    updatedAt: "2026-05-16",
  },

  "refine": {
    slug: "refine",
    logoUrl: "/brand-logos/refine.png",
    tagline: "Hash oils made for dabbers, by dabbers. Xtracted Labs’ flagship concentrate line.",
    bio: "Refine is the flagship concentrate brand from Xtracted Labs, one of the longest-running extraction operations on the West Coast. The team has shops in Washington, Alaska, California, and Maine, and the Washington side runs the same playbook as the others: source from established growers, run the material through hydrocarbon extraction, and break the catalog out by extraction-style rather than by strain alone.\n\nThe lineup is wide. Loud and Rad are the everyday hash oil tiers — Loud being the high-terp expression, Rad being the more refined. Double Dipper layers strain-specific terpenes back into distillate. Amplified, Rocks, and the THCA varieties round out the concentrate side, and Refine also runs infused joints and vapor cartridges using the same extract base. The methodology page reads like a process doc rather than a marketing pitch: hydrocarbon extraction → cannabis distillation → cannabinoid isolation → terpene profiling.\n\nThe brand is unambiguously dabber-focused — the tag line on the operator-facing material is literally “made for dabbers, by dabbers” — but the cart side is accessible to customers who never plan to touch a banger. Customers who reach for Refine tend to be concentrate-first buyers who want process transparency from the extraction team, not just a label.",
    updatedAt: "2026-05-16",
  },

  "subdued-excitement": {
    slug: "subdued-excitement",
    tagline: "Bellingham flower. Hand-trimmed, snowboard-and-mountain-rooted, Whatcom County through and through.",
    bio: "Subdued Excitement — better known on the shelf as SubX — is a Washington I-502 producer/processor based outside Bellingham, in the corner of the state that locals call “the City of Subdued Excitement.” The brand’s roots are in the outdoor culture up there: snowboarding, hiking, growing good cannabis on the side. The team carried that operator background into the licensed market and built a flower brand around it.\n\nThe catalog is flower-first. Genetics come from established global breeders, the buds are hand-trimmed by experienced cultivators rather than machine-trimmed, and the strain rotation skews toward what Whatcom County growers have spent decades dialing in — Pacific Northwest gas, dessert, and OG-family cuts. There’s a concentrate and pre-roll side too, but the eighths and ounces are the products that put the brand on most Washington shoppers’ radar.\n\nSubX is carried at roughly two dozen retailers across Washington — Bellingham, Arlington, Shoreline, Seattle, Tacoma, Spokane, Walla Walla, and a long list of smaller stops — which is the kind of distribution footprint that comes from operator-to-operator trust rather than a sales-team push. Customers who reach for SubX tend to be flower-first buyers who care about where the room is and how the plant was finished.",
    updatedAt: "2026-05-16",
  },

  "tarukino": {
    slug: "tarukino",
    logoUrl: "/brand-logos/tarukino.png",
    tagline: "Washington-born cannabis beverages. The team that built Happy Apple and Pearl2O.",
    bio: "Tarukino is a Washington-based cannabis beverage company best known for two product lines that effectively created the WA infused-drink shelf: Happy Apple cider and Pearl2O sparkling water. The company started in the early-I-502 years and built a beverage portfolio around a piece of proprietary technology called SoRSE — a water-based emulsion that lets cannabis oil mix into a liquid without the separation, taste, or smell problems that have hobbled most cannabis-drink attempts.\n\nHappy Apple is the flagship. It’s made with Washington-grown apples and cannabis, sold in 12oz bottles, and offered in three potency tiers (10mg, 50mg, 100mg) so the same drink format works for a first-time customer and an experienced consumer. The cider has held the top-selling cannabis beverage slot in Washington for years. Pearl2O is the sparkling-water expression of the same emulsion approach: no sugar, no calories, no cannabis taste, and a 1:1 THC:CBD ratio in the original format.\n\nThe broader Tarukino portfolio rotates through six additional infused beverages using the same SoRSE emulsion. Customers who reach for Tarukino tend to be drink-format buyers — the segment that doesn’t want to smoke, vape, or eat their cannabis — and shoppers who specifically want Washington-grown ingredients in the bottle.",
    updatedAt: "2026-05-16",
  },

  "the-goodship": {
    slug: "the-goodship",
    logoUrl: "/brand-logos/the-goodship.png",
    tagline: "Seattle edibles by the Cupcake Royale founder. Pastry-first, balanced-dose, locally sourced.",
    bio: "The Goodship was founded in Seattle in 2014 by Jody Hall, the entrepreneur behind Cupcake Royale, who carried her bakery-industry experience into the I-502 edibles space when Washington opened the rec market. The premise from the start was straightforward: build cannabis-infused confections to the same standard as a working pastry kitchen — real ingredients, balanced doses, and recipes that taste good before they taste medicated.\n\nThe catalog runs across chocolate bars, cookies, brownies, fruit jellies, peppermint patties, and a microdosed pastille line. Each piece is portioned to a 10mg-per-serving WA dose, but the lineup includes lower-microdose options for customers who want a measured pace rather than a single full dose. Ingredients lean local and sustainable where the supply chain allows it — organic and fair-trade chocolate is the standard, and vegan and gluten-free options sit alongside the regular menu.\n\nThe Goodship joined the Privateer Holdings family of cannabis brands in late 2017, which expanded the brand’s reach without changing the Seattle production approach. Customers who reach for it tend to be edible buyers who care that the chocolate, the cookie, or the brownie reads as a proper baked good first — and who want a Washington-rooted brand with a documented kitchen behind it.",
    updatedAt: "2026-05-16",
  },

  "trail-blazin-productions": {
    slug: "trail-blazin-productions",
    displayName: "Trail Blazin’",
    logoUrl: "/brand-logos/trail-blazin-productions.png",
    tagline: "Bellingham craft flower. Pesticide-free since 2014.",
    bio: "Trail Blazin’ Productions is a craft cannabis farm in Bellingham, founded in 2014 by a group of Whatcom County professionals. The company has been pesticide-free from its first harvest — using beneficial predator insects for pest control rather than chemical sprays — and operates on 100% LED lighting with roughly 95% water reclaim across the facility.\n\nThe catalog skews high-CBD and balanced-ratio more than most Washington brands. Harlequin and Pennywise — both well-documented CBD-forward strains — anchor the flower lineup alongside Dutch-47, 9 Pound Hammer, Amnesia, GG4, and Dutch Grapefruit. Concentrates are shatter-format from the same strain library, and the edible line includes capsules in a range of THC:CBD ratios. There’s also a small topicals line (balms and lotions) for customers specifically asking for non-inhaled formats.\n\nThe brand is hand-trimmed and U.S.-sourced where it can be — nutrients and packaging tubes purchased domestically. Trail Blazin’ is the name budtenders mention when a customer asks for clean inputs, a stable CBD-side menu, and a craft farm with documented practices on the Pacific Northwest end of the state.",
    updatedAt: "2026-05-16",
  },

  "walden-cannabis": {
    slug: "walden-cannabis",
    displayName: "Walden",
    logoUrl: "/brand-logos/walden-cannabis.png",
    tagline: "Sun-grown Washington flower since 2014. Tier-none farm, Clean Green Certified.",
    bio: "Walden Cannabis is a tier-none producer/processor based in Everett, with grow and processing operations also in Brewster and a presence in South Bend. The brand started with a group of climbers, backpackers, and yogis who wanted to grow cannabis the way they grew everything else they cared about — outdoors, in the sun, with as light a chemical footprint as the regulations would allow.\n\nThe flower is sun-grown and Clean Green Certified — the closest available analog to USDA Organic for cannabis. No harmful pesticides, no synthetic regimen. The crop is dried and cured in temperature- and humidity-controlled rooms, hand-trimmed, and packaged on-site at a 3,200-square-foot facility. Walden also offers white-label drying, trimming, packaging, and consulting to other Washington growers — they’re plumbed into the back end of the state’s supply chain as much as the front.\n\nThe catalog is flower-forward with concentrates (cured resin, distillate carts, and CBD-balanced cartridges) and a small ingestibles line. The cartridge lineup includes 1:1 and 3:1 CBD ratios alongside THC-dominant options. Customers who reach for Walden tend to be looking for sun-grown WA flower with documented inputs and an accessible price point.",
    updatedAt: "2026-05-16",
  },

  "western-cultured": {
    slug: "western-cultured",
    logoUrl: "/brand-logos/western-cultured.png",
    tagline: "Snohomish County terpene-forward cannabis. Color-coded by aroma, not indica/sativa.",
    bio: "Western Cultured is a Washington cannabis producer based in Arlington, in northern Snohomish County, operating out of a former Bayliner Boat Company building. The team runs at a deliberately small scale — about 100 pounds a month with a crew of six — and the entire operation is built around one premise: that terpene profile, not indica/sativa labeling, is the more honest way to describe what a strain actually does.\n\nEvery Western Cultured strain is sorted into a color-coded wheel: red for spicy, blue for sweet, yellow for sour, green for earthy. The categorization is based on terpene testing plus the team’s own consumption notes, and it’s rendered the same way on every package — so a customer learning the wheel on one strain can carry that knowledge across the whole lineup. The brand is explicit that this color system is independent of indica/sativa/hybrid classification.\n\nProduct-wise, Western Cultured runs flower, pre-rolls, and extracts. The cure is treated as a core part of the process — slower drying and proper hang time to retain the terpene composition that the color wheel is built on. Customers who reach for it tend to be terpene-curious shoppers who’ve outgrown the indica/sativa shorthand.",
    updatedAt: "2026-05-16",
  },

  "wyld": {
    slug: "wyld",
    logoUrl: "/brand-logos/wyld.png",
    tagline: "Oregon-born real-fruit gummies since 2015. Now the most-stocked edible in the West.",
    bio: "Wyld was founded in 2015 in Tumalo, Oregon, by Aaron Morris and Chris Joseph — two spirits-industry veterans who started cooking marionberry and raspberry gummies in a farmhouse on a property that already held an Oregon cannabis license. The first batches reportedly weren’t great. The recipes that came out of the iteration process — fruit-forward, real-juice, low-cost-per-piece — became the brand.\n\nThe core lineup is gummies built around regional fruit profiles: marionberry, huckleberry, raspberry, pear, watermelon, peach, sour apple, and seasonal rotations. Each format is sold in single-strain CBD, 1:1, or THC-dominant ratios depending on what the customer is reaching for, and the doses (typically 10mg per piece) are calibrated for repeatable shopping. Wyld also runs vape cartridges and a hemp-derived THC beverage line in markets that allow it.\n\nThe Washington Wyld products are produced through a state-licensed manufacturing partner so they meet WSLCB sourcing rules, but the recipe and packaging are the same as the Oregon original. Wyld is now one of the most-stocked edible brands in the western U.S. — the name a customer reaches for when they want fruit-forward gummies they’ve had before.",
    updatedAt: "2026-05-16",
  },
  // ────────────────────────────────────────────────────────────────────
  // BRAND BIO EXPANSION — 2026-05-16 (+20 entries)
  // ────────────────────────────────────────────────────────────────────

  "agro-couture": {
    slug: "agro-couture",
    logoUrl: "/brand-logos/agro-couture.png",
    tagline: "Tacoma artisan cannabis since 2015. Flower, concentrates, beverages, topicals under one roof.",
    bio: "Agro Couture is a Tacoma-based I-502 producer/processor (WSLCB #417142) that has been operating in the Washington recreational market since 2015. The brand positions itself as an artisan-tier multi-category operation, building a single in-house catalog across flower, concentrates, edibles, and topicals rather than focusing on one product class.\n\nThe flower side rotates through dessert and gas cuts — Donkey Butter, Gelato Cake, PB Pie show up regularly — and the pre-roll line includes a Diamond Stix infused-blunt format that has built its own following on Washington shelves. Concentrates run across live resin, shatter, distillate cartridges, and disposable vapes, drawing on the same in-house strain library that feeds the flower menu. The beverage side leans into 100mg lemonade formats (Tropical, Strawberry, Pink, Sour Grape) for customers who specifically want a drink format.\n\nThe topicals lineup is one of the broader ones from a Washington brand at this scale — body balms, lotions, and infusion drops in a range of THC/CBD/CBN/CBG ratios. Customers who reach for Agro Couture tend to be shoppers who want the same operator behind multiple categories, with a Tacoma-rooted brand they recognize from previous trips to the shelf.",
    updatedAt: "2026-05-16",
  },
  "avitas": {
    slug: "avitas",
    logoUrl: "/brand-logos/avitas.png",
    tagline: "Arlington-built premium vape cartridges and flower. The original behind the Hellavated value line.",
    bio: "Avitas is a Washington I-502 producer/processor (WSLCB #412064) based in Arlington — the same Snohomish County facility that produces the Hellavated value-tier vape line under a separate label. Avitas is the premium side of that operation, with the flower, cartridge, and edible catalog priced and built for shoppers who specifically want top-shelf.\n\nThe cartridge lineup is live resin pulled from in-house material — Hash Burger, Peanut Butter Breath, and a deep rotation of single-strain 1g 510-thread carts. Flower rotates through gas and dessert cuts (Limonada, Dragon OG) packaged at eighth and pre-roll formats. The edible side is narrower than the vape catalog but includes 100mg fruit-and-flower rosin gummy 10-packs in flavors like cherry-lime and blackberry, which gives the brand an edible option for customers already familiar with the vape and flower side.\n\nAvitas has spent close to a decade as a recognized name on Washington shelves, and operators tend to mention it when a customer asks for a live-resin cart with a documented in-state extraction pipeline. The shared facility with Hellavated means the distillate and extraction backbone is the same — Avitas just sits at the premium-tier expression of it.",
    updatedAt: "2026-05-16",
  },
  "bondi-farms": {
    slug: "bondi-farms",
    tagline: "Washington flower and pre-rolls. Dessert and OG-family cuts at a working-shelf price.",
    bio: "Bondi Farms is a Washington I-502 producer with a flower-first catalog built around dessert and OG-family cuts. The lineup rotates through Cherry Do-Si-Do, Do-Si-Do, Optimus Prime, Super Silver Sour Diesel Haze, and Blackberry — recognizable names that budtenders can hand off to a customer without much preamble.\n\nThe brand’s shelf presence is heavier on flower and pre-rolls than on the concentrate or edible side. Eighths and pre-roll packs are the formats customers reach for most often, and the THC range on the catalog (high-teens to low-twenties) reflects a flower line built for everyday smokers rather than chasing test-percentage records. Pricing sits in the accessible-tier band, which is the lane Bondi has occupied on most Washington menus.\n\nProduct information for Bondi has been sourced directly from the brand by the retail-platform databases, and customers who reach for Bondi Farms tend to be shoppers looking for recognizable cultivars at a working-budget price point, without stepping all the way down to the bottom-shelf bin. Worth asking your budtender what’s freshest on a given week — the rotation moves.",
    updatedAt: "2026-05-16",
  },
  "botanica-seattle": {
    slug: "botanica-seattle",
    tagline: "Seattle-built edibles and ingestibles. The team behind Spot, Journeyman, and Mr. Moxey’s Mints.",
    bio: "Botanica Seattle is a Washington-based cannabis manufacturer that has operated as one of the larger ingestibles houses in the state since the early I-502 years. The portfolio is multi-brand — Spot fruit chews, Journeyman bars, Mr. Moxey’s Mints, and other lines run through the same Seattle production facility — and the throughline across all of them is a manufacturing-first approach where dose accuracy and shelf consistency are the load-bearing requirements.\n\nMr. Moxey’s Mints are the line most Washington shoppers recognize first. They sit in small tins, dose at low single-digit milligrams per piece, and pair the cannabis with herbal ingredients (peppermint, ginger, cinnamon, lemongrass) for customers who specifically want a microdose format. Spot is the fruit-chew expression in 10mg-per-piece portions, and Journeyman runs as the chocolate-and-baked-bar side of the same lineup.\n\nProducts are distributed across most Washington dispensaries that stock a serious edibles wall. Customers who reach for Botanica Seattle tend to be ingestible-first shoppers who care about dose precision and brand familiarity — the kind of shopper who reaches for the same mint tin or fruit chew week after week, rather than chasing novelty.",
    updatedAt: "2026-05-16",
  },
  "cannasol-farms": {
    slug: "cannasol-farms",
    tagline: "Okanogan County sun-grown cannabis. Eastern Washington outdoor with a long farm story.",
    bio: "Cannasol Farms is an outdoor sun-grown cannabis brand operating out of Okanogan County in north-central Washington. The growing approach is full-sun field cultivation — meaning the plants finish under the same Eastern Washington summer that the region’s tree-fruit and wine industries run on — rather than the supplemental-light greenhouse or indoor rooms that produce most of the state’s shelf flower.\n\nThe catalog is flower-first, with eighths and pre-rolls as the main shelf formats. Strain rotation reflects what holds up well in the Okanogan sun: a mix of pacific-northwest-friendly hybrids and longer-season sativa-leaning cuts. The brand has been operating in the WA recreational market since the early years of the state program, and the sun-grown footprint means the price-per-gram lands meaningfully below comparable indoor — that’s the trade Cannasol asks customers to make.\n\nCustomers who reach for Cannasol tend to be sun-grown-curious shoppers who want flower that finished in actual sunlight rather than under LEDs, and budget-conscious buyers who care about the agronomic story behind the bag. Worth asking your budtender about harvest dates — sun-grown crops finish on a single annual cycle, so the same strain in the fall tastes different than the same strain ten months later.",
    updatedAt: "2026-05-16",
  },
  "ceres": {
    slug: "ceres",
    tagline: "Washington flower and concentrate brand. Named for the Roman goddess of the harvest.",
    bio: "Ceres is a Washington I-502 producer/processor whose catalog runs across flower, pre-rolls, and concentrates. The name draws on the Roman goddess of agriculture and grain — a nod the brand carries through into its labeling, which leans more agricultural and less neon than most of the shelf around it.\n\nThe flower lineup rotates through a working strain library — pre-packaged eighths, ounces, and pre-rolls — with the concentrate side running across hash, distillate cartridges, and a small live-format selection. Ceres tends to land in the mid-tier price band on most Washington menus, which is where a lot of the everyday-shopper traffic lives.\n\nThe brand has been on Washington shelves since the early years of the recreational market. Customers who reach for Ceres tend to be flower-first shoppers who want a Washington-rooted name and an accessible price point, without committing to either the boutique top-shelf tier or the bottom-shelf budget bin. Worth asking your budtender what’s fresh in stock on a given week — the strain rotation moves with what the rooms are dropping.",
    updatedAt: "2026-05-16",
  },
  "craft-elixirs": {
    slug: "craft-elixirs",
    tagline: "Seattle handcrafted infused edibles. Vegan, GMO-free, made by foodies.",
    bio: "Craft Elixirs is a Seattle-based I-502 edibles producer that builds its catalog around a foodie-first premise: handmade products, clean labels, locally sourced ingredients where the supply chain allows. The company runs on full-spectrum cannabis oil extracted using organic sugar-cane alcohol — a less common approach than the CO2 or hydrocarbon paths most WA edible brands take — and every product is vegan, GMO-free, gluten-free, and kosher.\n\nThe lineup includes Pioneer Squares (chocolate-format confections named after the historic Seattle neighborhood), Lori’s Cannabis Potato Chips (a savory snack that has been one of the brand’s signature pieces since launch), and Dank Chocolate Syrup. Each piece is dosed to Washington’s 10mg-per-serving rule, with portion guidance printed on-pack.\n\nCraft Elixirs sources cannabis from local Washington growers and has been covered in the Seattle Times for its kitchen-led approach. Customers who reach for the brand tend to be edible-first shoppers who care about ingredient quality, dietary fit (vegan and gluten-free), and a clear connection to a Seattle production team. A good pick when a customer wants something on the savory end of the edible spectrum — the potato chips are a category the brand essentially owns on Washington shelves.",
    updatedAt: "2026-05-16",
  },
  // Slug-alias for the trailing-dash variant in our sitemap
  // (`/brands/dewey-cannabis-co-`). Same brand, same bio — duplicated
  // under the dash-suffixed key so getBrandCopy() resolves both. Doug
  // flagged 2026-05-17 page-completion-agent report.
  "dewey-cannabis-co-": {
    slug: "dewey-cannabis-co-",
    displayName: "Dewey Cannabis Co.",
    tagline: "Washington flower-and-rosin brand. “Cultivation Meets Curiosity.”",
    bio: "Dewey Cannabis Co is a Washington I-502 brand with a flower-first catalog and a meaningful solventless-extract side. The brand frames its work as “Cultivation Meets Curiosity,” which shows up in a strain library that rotates through both modern dessert/gas cuts and less-common phenos that the cultivation team has been experimenting with.\n\nThe lineup includes Signature Flower (the everyday eighth and ounce line), Live Resin vape cartridges, an all-in-one disposable dab pen, Live Rosin (solventless hash), and the Hella Dewbie pre-roll jar — 28 pre-rolls in a single jar, a format that gives party-pack shoppers a clear use case. The Matchsticks line is hash-infused, solvent-free pre-rolls for customers who specifically want a solventless infusion rather than the more common distillate-coated approach.\n\nThe brand publishes an annual “Lookbook” detailing cultivar runs and a “Dewsletter” email for upcoming drops — both of which are unusual for a Washington producer at this scale and point to a brand that takes the educational side seriously. Customers who reach for Dewey tend to be flower-first shoppers who also want a solventless-rosin option from the same operator, and pre-roll buyers looking for a real volume format.",
    updatedAt: "2026-05-17",
  },

  "dewey-cannabis-co": {
    slug: "dewey-cannabis-co",
    tagline: "Washington flower-and-rosin brand. “Cultivation Meets Curiosity.”",
    bio: "Dewey Cannabis Co is a Washington I-502 brand with a flower-first catalog and a meaningful solventless-extract side. The brand frames its work as “Cultivation Meets Curiosity,” which shows up in a strain library that rotates through both modern dessert/gas cuts and less-common phenos that the cultivation team has been experimenting with.\n\nThe lineup includes Signature Flower (the everyday eighth and ounce line), Live Resin vape cartridges, an all-in-one disposable dab pen, Live Rosin (solventless hash), and the Hella Dewbie pre-roll jar — 28 pre-rolls in a single jar, a format that gives party-pack shoppers a clear use case. The Matchsticks line is hash-infused, solvent-free pre-rolls for customers who specifically want a solventless infusion rather than the more common distillate-coated approach.\n\nThe brand publishes an annual “Lookbook” detailing cultivar runs and a “Dewsletter” email for upcoming drops — both of which are unusual for a Washington producer at this scale and point to a brand that takes the educational side seriously. Customers who reach for Dewey tend to be flower-first shoppers who also want a solventless-rosin option from the same operator, and pre-roll buyers looking for a real volume format.",
    updatedAt: "2026-05-16",
  },
  "dogtown-pioneers": {
    slug: "dogtown-pioneers",
    logoUrl: "/brand-logos/dogtown-pioneers.png",
    tagline: "Tier 3 WA producer. Home of Ray’s Lemonade and RSO Gold capsules.",
    bio: "Dogtown Pioneers is a Tier 3 Washington cannabis producer/processor whose best-known consumer line is Ray’s Lemonade — the 100mg cannabis-infused lemonade format that has held a steady spot on Washington beverage shelves for years. Dogtown is the operating company behind the Ray’s brand, and the broader catalog includes capsules and concentrates produced from the same in-house material.\n\nThe edible side runs across Ray’s Lemonade in multiple flavor variants and dose tiers, Indica capsule formats, and RSO Gold capsules — a Rick Simpson Oil expression in measured-dose capsule format for customers who specifically want RSO in a portion-controlled package. The concentrate side includes live resin in strain-specific runs (Black Russian x Wedding Cake, Prenup Live Resin) drawn from the producer’s own cultivation.\n\nFor customers who already know the Ray’s Lemonade brand, Dogtown is the producer behind it — the cannabis side of the operation that supplies the THC for the beverage line. Customers who reach for Dogtown directly tend to be capsule and concentrate buyers who want material from the same operator that runs the Ray’s program, with a clear in-state production chain.",
    updatedAt: "2026-05-16",
  },
  "evergreen-herbal": {
    slug: "evergreen-herbal",
    displayName: "Evergreen Herbal",
    logoUrl: "/brand-logos/evergreen-herbal.png",
    tagline: "Washington multi-brand edibles, beverages, and concentrates house. Operator of Major, Blaze, 4.20 Mini.",
    bio: "Evergreen Herbal is a Washington-based I-502 manufacturer that operates as a multi-brand house — a single Seattle-area production facility producing several distinct consumer lines rather than a single-name catalog. The portfolio includes Major (chocolate and confection edibles), Blaze (concentrates and pre-rolls), 4.20 Mini (small-format edibles), Sinners & Saints, Happy Apple cider (the long-running Washington cannabis cider line — also produced under license by other manufacturers historically), Velvet Swing topicals, and Vertus Champagne-style infused sparkling.\n\nThe range spans beverages (sodas, sparkling, cider-style), edibles (gummies, chocolates, shots), concentrates (rosin formats), topicals, and pre-rolled joints. The multi-brand structure means each line carries its own packaging, voice, and product positioning — a customer who knows one Evergreen line by name often doesn’t know the others share a kitchen.\n\nThe brand has been in continuous operation since the early I-502 years and is one of the longer-running multi-format producers in the state. Customers who reach for any of the portfolio brands are reaching for Evergreen Herbal — worth knowing when comparing options on the edible or beverage wall, since the underlying production team and quality-control standards carry across the whole catalog.",
    updatedAt: "2026-05-16",
  },
  "fairwinds-manufacturing": {
    slug: "fairwinds-manufacturing",
    displayName: "Fairwinds",
    tagline: "Vancouver, WA wellness processor. Tinctures, capsules, inhalers, suppositories — the deep ingestibles bench.",
    bio: "Fairwinds Manufacturing is a Washington I-502 processor that has built one of the deepest specialty-format catalogs in the state. The brand’s positioning is wellness-oriented, and the lineup reflects it: tinctures, vape cartridges, topical creams, FECO (Full Extract Cannabis Oil), inhalers, suppositories, and capsules — formats that most Washington producers don’t touch.\n\nThe catalog is organized around use-case categories rather than indica/sativa labels, with named lines for sleep, day-to-day balance, mental focus, and digestive support. Doses are documented carefully, and the brand has invested in formats — capsules, sublingual tinctures, suppositories — that give customers portion control well below what a typical edible or pre-roll allows. The Companion line is one of the longer-running pet-CBD products in the state, formulated specifically for animal use.\n\nFairwinds has earned coverage in Forbes and Fast Company over the years and has been one of the brands Washington operators reach for when a customer specifically asks about format options outside the standard flower / vape / gummy triangle. WAC framing rules apply — Fairwinds describes its category positioning and doses but does not make medical claims, and customers reach for the brand most often when they want precise low-dose ingestibles from an established WA producer.",
    updatedAt: "2026-05-16",
  },
  "fifty-fold": {
    slug: "fifty-fold",
    tagline: "Washington flower brand. Working strain library, mid-tier price.",
    bio: "Fifty Fold is a Washington I-502 producer with a flower and concentrate catalog built around a working strain library. The flower lineup rotates through a mix of recognizable cuts — GMO Si-Do, Copper River, 9 Pound Cherry, Trainwreck, Super Lemon Haze, Presidential OG Kush, Mamacita, Bay Dream — that read as a curated rotation rather than a chase-the-trend menu.\n\nThe concentrate side runs across terp sugar formats in strain-specific drops, including Presidential OG and Oregon Huckleberry expressions. Pricing sits in the mid-tier band, which is the lane Fifty Fold has occupied on most Washington menus since the brand’s early years in the state program.\n\nProduct information for Fifty Fold has been sourced directly from the brand by the retail-platform databases. Customers who reach for Fifty Fold tend to be flower-first shoppers who want a recognizable rotation of classic and modern cuts at an accessible price, without paying for the boutique-tier expression of the same strains. Worth asking your budtender what the current rotation looks like — like most Washington flower brands, the menu shifts noticeably from drop to drop.",
    updatedAt: "2026-05-16",
  },
  "fireline-cannabis": {
    slug: "fireline-cannabis",
    displayName: "Fireline",
    tagline: "Washington flower and concentrate brand. Solvent and solventless extracts.",
    bio: "Fireline Cannabis is a Washington I-502 producer with a flower-and-concentrate catalog organized around two main product lines. The flower lineup runs across strains like Skatalite, White Fire OG, Toxic Green, and Lit Cookie Blizzard, with pre-rolled formats in the same strain rotation.\n\nThe concentrate side is where Fireline carries more breadth — live resin, diamonds, crumble, and a mix of solvent and solventless extracts in various strain variations. The combination of both extraction approaches under one brand is meaningful for customers comparing options: a shopper who specifically wants solventless can find it from the same operator that produces the live-resin side, with the same source material feeding both pipelines.\n\nProduct information has been sourced directly from the brand by the retail-platform databases. Customers who reach for Fireline tend to be concentrate-first shoppers who want a mix of extraction styles from a Washington producer, and flower buyers who want to pair an eighth with a concentrate from the same source. Worth asking your budtender what extraction format is freshest in stock on a given visit — the rotation moves with what the lab is finishing.",
    updatedAt: "2026-05-16",
  },
  "green-revolution": {
    slug: "green-revolution",
    displayName: "Green Revolution",
    tagline: "Poulsbo-based fast-acting cannabis. Doozies gummies, WildSide drinks, water-soluble tinctures.",
    bio: "Green Revolution is a Washington I-502 processor headquartered in Poulsbo, on the Kitsap Peninsula. The brand’s technical signature is a proprietary water-soluble emulsion (called UNET) that allows cannabis oil to mix into water-based products without the separation problems that have hobbled most cannabis-drink and tincture attempts. The practical result is products designed to take effect within 10–15 minutes of consumption rather than the longer onset typical of traditional edibles.\n\nThe flagship consumer lines are Doozies gummies (built around the fast-acting nanoemulsion) and the WildSide cannabis beverage line, including Max shots dosed up to 100mg THC. The tincture lineup is water-soluble — designed to mix into a drink or beverage rather than only the oil-base sublingual format. The portfolio also includes products built around minor cannabinoids (CBG, CBN, CBC) for customers who specifically want non-THC-dominant or balanced ratios.\n\nGreen Revolution has expanded beyond Washington into California, Massachusetts, and New York. Customers who reach for the brand on Washington shelves tend to be drink-format and gummy buyers who specifically want the faster-onset profile the water-soluble emulsion enables, and shoppers who want a brand whose underlying technology is documented rather than asserted.",
    updatedAt: "2026-05-16",
  },
  "grow-op-farms": {
    slug: "grow-op-farms",
    // displayName = "Phat Panda" because that's the consumer-facing brand
    // customers actually search for. /brands/grow-op-farms renders the
    // Phat Panda boutique (the BRAND_OVERRIDES + h1 already say "Phat
    // Panda"). Aligning the carousel + breadcrumb + meta + alt with the
    // brand customers recognize — Doug 2026-05-20 "more focused on the
    // brand." Grow Op Farms still surfaces as "by Grow Op Farms · since
    // 2014" in the boutique tagline so the umbrella attribution stays.
    displayName: "Phat Panda",
    tagline: "Spokane Valley I-502 producer. The operator behind Phat Panda and seven sister brands.",
    bio: "Grow Op Farms is a Washington I-502 producer/processor based in Spokane Valley, operating out of a 100,000+ square-foot facility that has been in production since 2014. The company runs eight distinct consumer brands out of the same operation — Phat Panda is the flagship, with Hot Sugar, Sticky Frog, Snickle Fritz, Hot Shotz, Flav, Six Fifths, and Dabstract filling out the portfolio.\n\nPhat Panda is the line most Washington shoppers know first. The catalog runs across flower, infused pre-rolls, vape cartridges, and concentrates in a deep strain rotation — the cultivation team works with more than 40 strains across the facility. The brand has taken Dope Cup awards in categories including Best Infused Pre-Roll and Most Potent Flower, and the infused-pre-roll line in particular is one of the most distributed products in its category across Washington retailers.\n\nThe sister brands carve out distinct shelf positions — Dabstract on the concentrate-purist end, Snickle Fritz and Sticky Frog at the more playful packaging tier, Flav and Hot Shotz on the cartridge and edible side. Customers who reach for any of these names are reaching for Grow Op Farms. The Spokane facility supplies them all, which is why operators treat the umbrella as one of the more reliable production engines in the state.",
    updatedAt: "2026-05-16",
  },
  "harmony-farms": {
    slug: "harmony-farms",
    tagline: "Washington cannabis cultivator since April 2015. Flower, concentrates, edibles, vape hardware.",
    bio: "Harmony Farms is a Washington cannabis cultivation company that has been operating in the state recreational market since April 2015. The brand frames itself around transparency and reputation-building inside the Washington cannabis community, and the catalog spans flower, concentrates, edibles, and vape hardware in a single producer footprint.\n\nThe flower side rotates through cuts like White Tara, Black Jack, Dream N Sour, and Purple Punch in pre-pack eighth and pre-roll formats. The concentrate lineup runs across THC cartridges, dabs, live resin, oils, and waxes, with the cartridge side paired against the Airo Pro hardware system that has its own following on Washington shelves. The edibles bench is narrower than the flower side but includes herbal shots, mints, and infused beverages for customers who want a non-inhaled option from the same operator.\n\nHarmony Farms distributes through dispensaries across the Seattle metro and has appeared on the menus of long-running Seattle retailers like Herbn Elements for years. Customers who reach for Harmony tend to be multi-format shoppers who appreciate being able to put an eighth, a cartridge, and an edible from the same producer into a single basket — a degree of catalog continuity that not every Washington brand at this scale offers.",
    updatedAt: "2026-05-16",
  },
  "edgemont-group-dba-leafwerx": {
    slug: "edgemont-group-dba-leafwerx",
    // displayName = "Leafwerx" because that's the brand customers
    // recognize; "Edgemont Group" is the legal umbrella entity (same
    // umbrella that operates Sungrown / Cookies WA / Solr Bear).
    // Pattern: umbrella → sub-brand for carousel + meta + breadcrumb.
    displayName: "Leafwerx",
    tagline: "Washington cannabis concentrate brand. Single-source extracts from in-house cultivation.",
    bio: "Leafwerx is a Washington cannabis brand operated by Edgemont Group, with a concentrate-first catalog built on a single-source extraction premise — every product is pulled from cannabis grown by the same operator, rather than sourced from third-party flower. The brand frames itself as family-and-friends-owned, with quality-and-value as the working positioning.\n\nThe catalog runs across two flagship extract lines. Terps Mood is a full-spectrum high-terpene extract — roughly 80% THC, around 10% cannabis-derived terpenes — designed to keep the strain-specific flavor profile of the source material intact. THC Mood is the distilled high-potency expression, sitting at roughly 90% THC and 5% cannabis terpenes for customers who specifically want a more concentrated potency profile in the same format. Both lines run on 100% cannabis and cannabis-derived terpenes — no botanical-terpene blends, no additives — and the brand labels the products as pesticide-free.\n\nLeafwerx organizes its strain library into mood-based categories (Go, Create, Vibe, Enjoy, Chill, Soothe) rather than indica/sativa labels, giving customers a different sort across the catalog. Customers who reach for Leafwerx tend to be cartridge and extract buyers who care that the source material and the extraction happen under the same roof.",
    updatedAt: "2026-05-16",
  },
  "mfused": {
    slug: "mfused",
    tagline: "Born in Seattle. Smart-vape hardware plus a deep infused-product catalog. Minority-owned.",
    bio: "Mfused is a cannabis brand born in Seattle and now operating in Washington, Arizona, Maryland, New York, and Missouri. The brand is minority-owned and has built its catalog around proprietary smart-vape hardware paired with a deep range of infused products — pre-rolls, tinctures, topicals, and beverages alongside the cartridge and disposable lineup.\n\nThe hardware side runs across several flagship lines. Super Fog is the smart-vape series in Vibes, Twisted, Fire, and Loud variants. Jefé Plus is an advanced vape with customizable temperature control and a Cold Start feature for first-draw consistency. FLO and ION fill out the smart-device lineup, with the proprietary Spark Button as a recurring hardware signature. The product side includes BALANCE (cartridges and oral sprays in various THC/CBD ratios), TWISTED infused pre-rolls in varieties like Purple Daze and Tropical Trip, ARSON branded topicals (lubricants and oils), Fattys pre-rolled formats, and Burzt.\n\nMfused is one of the multi-state Washington-origin brands — the kind of company that started in the Seattle market and used the operator knowledge built here to expand into other regulated states. Customers who reach for Mfused on Washington shelves tend to be vape-first shoppers who care about hardware quality and temperature control, and balance-curious buyers who want micro-dose and ratio options from the same producer.",
    updatedAt: "2026-05-16",
  },
  "northwest-cannabis-solutions": {
    slug: "northwest-cannabis-solutions",
    tagline: "Washington's biggest producer/processor — 200+ employees, multiple in-house brand lines.",
    bio: "Northwest Cannabis Solutions is one of the largest recreational cannabis producer/processors operating in Washington, with more than 200 employees across cultivation, extraction, and edibles production. The company runs a state-of-the-art growing facility, a dedicated extraction lab, and an edibles kitchen — a vertically integrated footprint that allows them to produce flower, concentrates, cartridges, edibles, topicals, and tinctures under a single roof.\n\nThe brand portfolio is deep. Legends and Private Reserve sit on the flower side. Funky Monkey, Mini Budz, and Terp Stix carry the pre-roll and concentrate-pre-roll formats. The edibles bench includes Marmas (gummies), Mari’s Mints, Pebbles Lozenges, Hi-Burst Fruit Chews, and Chewee’s Caramels. The variety is the point — NWCS is one of the few Washington operators where a single producer can supply an entire shelf from flower through edibles without leaving the umbrella.\n\nFor budtenders, NWCS is a baseline name — the producer behind a noticeable share of what’s stocked on a typical Washington menu, often without the customer realizing they’re reaching for the same operator across multiple categories. Customers who reach for the portfolio brands tend to be shoppers who care about the underlying production standards and want a producer whose distribution footprint covers most of the state.",
    updatedAt: "2026-05-16",
  },
  "ray-s-lemonade-wa": {
    slug: "ray-s-lemonade-wa",
    displayName: "Ray's Lemonade",
    logoUrl: "/brand-logos/ray-s-lemonade-wa.png",
    tagline: "Washington cannabis lemonades. 100mg bottles, 10mg shots, a deep flavor bench.",
    bio: "Ray’s Lemonade is a Washington cannabis beverage line produced by Dogtown Pioneers (WSLCB #416538), with a parallel California operation under separate licensing. The brand has held a steady spot on the Washington beverage shelf for years and runs across several formats — full-size Original Ray’s bottles (typically 100mg THC), Lil’ Ray’s 10mg shots for single-serve dosing, and Ray’s Cans for the can-format expression.\n\nThe flavor bench is one of the deeper ones in the WA cannabis-beverage category. The rotation includes Original Lemonade, Raspberry, Huckleberry, Pineapple, Mango, Tiger’s Blood, Blackberry, Citrus Kush, Dragon Fruit, Elderberry, Peach, and Strawberry — with many flavors offered in multiple cannabinoid blends so a customer who likes the format can find a profile that matches what they reach for. The brand has also extended into Ray’s Vapes, Ray’s Gummies, live and hash rosin products, and minor-cannabinoid variants.\n\nProducts are produced to Washington State Department of Health compliance standards with third-party lab testing on every run. Customers who reach for Ray’s tend to be drink-format buyers who want a flavored lemonade that delivers the cannabis side cleanly — and the 10mg Lil’ Ray’s format is one of the few WA beverages explicitly portioned for a single-serve, low-dose customer.",
    updatedAt: "2026-05-16",
  },

  // ────────────────────────────────────────────────────────────────────
  // BRAND BIO EXPANSION — 2026-05-17 (+20 entries, wave 3)
  // ────────────────────────────────────────────────────────────────────
  "2727": {
    slug: "2727",
    tagline: "Lake Stevens craft cannabis. Vapes, infused pre-rolls, dabs from a tier-none WA producer.",
    bio: "2727 is a tier-none I-502 producer/processor (WSLCB #428025) based in Lake Stevens, Washington. The brand’s premise is straightforward: cultivate top-quality cannabis in-house and run the catalog across the formats Washington shoppers actually reach for — flavored vape cartridges, infused pre-rolls, and dabs.\n\nThe vape side is the line most customers know first. The catalog rotates across single-strain cartridges and flavored disposables, with the infused pre-roll lineup running alongside as a second flagship format. The dab catalog rounds out the concentrate side from the same in-house material. Pricing sits in the everyday-working band, not the boutique tier — which is the lane 2727 has held on Snohomish-area menus since the brand’s early years.\n\nThe operation is small enough to keep the rotation visibly fresh and large enough to keep distribution steady. Customers who reach for 2727 tend to be vape-and-infused-pre-roll shoppers who want a Washington-rooted name with a documented in-state production chain, and budtenders mention the brand when a customer asks for an accessible-priced cart that doesn’t step down to the bottom-shelf bin. Worth asking what flavor and strain rotation is live on a given visit — the catalog moves with what the rooms are dropping.",
    updatedAt: "2026-05-17",
  },
  "alki-herbal": {
    slug: "alki-herbal",
    tagline: "Seattle SoDo indoor flower. Hand-trimmed by the Cannabis District team.",
    bio: "Alki Herbal is a Tier 2 I-502 producer/processor based in Seattle’s SoDo district — the Cannabis District corridor that has become the de facto industrial heart of the city’s cannabis production scene. The brand operates out of an indoor facility there, with cultivation, drying, and packaging all under one roof.\n\nThe flower lineup is the catalog’s anchor. Plants are grown indoors under controlled environmental conditions, hand-trimmed by the in-house team, and packaged at pre-pack eighth and pre-roll formats. The hand-trim step is a meaningful one — machine-trimmed flower moves faster but tends to lose more of the trichome layer in the process, which is the trade-off Alki has chosen to make in the other direction. The strain rotation reflects what a working Seattle indoor room can dial in consistently rather than chasing one-off limited drops.\n\nThe brand carries roughly a 4.2-star rating across the retail-platform databases and has held a steady spot in WA producer sales rankings since its early years in the recreational market. Customers who reach for Alki Herbal tend to be flower-first shoppers who want indoor-grown WA flower with a documented hand-trim step, from a brand whose production address you can drive past in person.",
    updatedAt: "2026-05-17",
  },
  "binx-buds": {
    slug: "binx-buds",
    displayName: "Binx Buds",
    logoUrl: "/brand-logos/binx-buds.png",
    tagline: "Mattawa sun-grown cannabis. Light-dep hoop houses, recyclable packaging, an Eastern WA brand.",
    bio: "Binx Buds is a Washington I-502 producer/processor based in Mattawa, in the Columbia Basin agricultural belt where most of the state’s sun-grown cannabis comes from. The brand’s defining choice is its cultivation method: light-deprivation hoop houses rather than full indoor rooms or open-field outdoor — a hybrid approach that uses the sun for the bulk of the crop’s light requirement while giving growers control over the flowering trigger via blackout tarps.\n\nThe result is a lower-carbon-footprint cultivation pipeline than pure indoor, with greenhouse-style control over harvest timing. Once buds are graded for size and quality, Binx packages them in recyclable bottles — a deliberate departure from the plastic mylar bags that dominate the WA shelf. The catalog runs flower-first across recognizable cuts (Grape Gasoline, OG Kush are on the menu), with pre-roll formats from the same in-house material.\n\nThe operation has two Washington locations with combined 12-month sales in the $2.4M range, and distribution stretches across the state. Customers who reach for Binx Buds tend to be shoppers who care about both growing method and packaging footprint, and budget-conscious flower buyers who want a sun-grown price point without giving up the quality controls that light-dep brings to the season.",
    updatedAt: "2026-05-17",
  },
  "double-delicious": {
    slug: "double-delicious",
    tagline: "Family-owned WA cannabis since 2014. Capsules, vapes, concentrates, edibles, topicals.",
    bio: "Double Delicious is a family-owned and operated Washington I-502 brand that has been on the recreational shelf since 2014. The catalog runs wide — vaporizers, concentrates, edibles, capsules, and topicals — and the brand’s positioning is consistent: high-quality cannabis products at accessible price points.\n\nThe capsule line is where Double Delicious has built its most durable shelf position. Their Sativa and Indica RSO Capsule 10-packs (100mg total per pack, 10mg per piece) have held a top spot in the Washington capsules category from April through July 2025, which is the kind of staying power that doesn’t come from packaging alone. The format is built for customers who specifically want portion-controlled ingestibles rather than the more common gummy or chocolate edible — a measured-dose alternative for the same shopper.\n\nThe rest of the catalog runs across pre-pack flower, vape cartridges, concentrates, and a smaller topicals bench, all produced by the same in-house team. Distribution covers WA dispensaries across Vancouver, Tacoma, Wenatchee, Leavenworth, and the Seattle metro. Customers who reach for Double Delicious tend to be capsule-first ingestible shoppers and value-tier multi-format buyers who appreciate a Washington family-owned brand that has been in continuous operation since the early I-502 years.",
    updatedAt: "2026-05-17",
  },
  "downtown-cannabis-company": {
    slug: "downtown-cannabis-company",
    displayName: "Downtown Cannabis Co.",
    tagline: "The 3rd-ever licensed WA producer/processor. SODO Seattle indoor, hand-trimmed, glass-cured.",
    bio: "Downtown Cannabis Company was established in 2014 as the third licensed producer/processor in Washington State — one of the operations that helped define what an indoor I-502 room would look like in the state’s opening years. The facility is a Tier 2 indoor grow in Seattle’s SODO district, and the team has been refining the same playbook since.\n\nThe flower side is the catalog’s focal point. The team hand-waters every plant rather than running a fertigation manifold, hand-trims every harvest, and cures the finished flower in sealed glass jars instead of bulk totes — the slower, more labor-intensive path that prioritizes terpene retention over throughput. Small-batch is the operating model, and the brand markets the consistency that comes from running the same in-house genetics through the same rooms drop after drop. Pre-rolls and strain-specific vape cartridges come off the same in-house material and meet Washington Department of Health compliance standards.\n\nDistribution reaches into Evergreen Market, Zips Cannabis, Bloom Cannabis, Herbs House, and a long list of other WA retailers. Customers who reach for Downtown Cannabis Company tend to be flower-first shoppers who care about cure method and trim style, and operators looking for a brand whose production process is documented end-to-end from clone to jar.",
    updatedAt: "2026-05-17",
  },
  "epicurean-extract": {
    slug: "epicurean-extract",
    tagline: "Tacoma plant processor. Everything but flower — concentrates, FECO, cartridges from a chemist-led team.",
    bio: "Epicurean Extracts is a tier-none I-502 processor based in Tacoma whose positioning is intentionally narrow: the brand’s tagline is “everything but flower.” No cultivation side. Just extraction, concentrates, and cartridges sourced from third-party Washington-grown material and refined through the in-house lab.\n\nThe team is chemist-led. Josh Haney runs the lab as an industrial chemist with a Bachelor’s of Science from Evergreen State College in chemistry and math. Haleigh Rzonca is an extractor and organic chemist with prior bench experience plus two years as a budtender — useful operational fluency for understanding what the customer side of the shelf actually asks for. The catalog runs across FECO (Full Extract Cannabis Oil), cartridges, dabs, and other concentrate formats, with strain-specific runs labeled by source.\n\nDistribution covers Washington dispensaries across Vancouver, Tacoma, Wenatchee, Leavenworth, and the Seattle metro. Customers who reach for Epicurean Extracts tend to be concentrate-first shoppers who specifically want a processor that focuses exclusively on extraction work rather than splitting attention across cultivation, and FECO-curious buyers who want a Washington-rooted source for the long-form full-spectrum format.",
    updatedAt: "2026-05-17",
  },
  "hitz-cannabis": {
    slug: "hitz-cannabis",
    tagline: "Tier 3 WA producer since 2018. “Natural plants, original music, ordinary people.”",
    bio: "Hitz Cannabis is a Tier 3 I-502 producer/processor founded in Washington in 2018 by Tom Hutchinson and Nater Youngchild. The brand frames itself as a complete cannabis lifestyle operation rather than a single-category producer — the working tagline “natural plants, original music, ordinary people” shows up across packaging and marketing, and the catalog spans pre-rolls, flower, dabs, distillates, oils, and vape cartridges out of the same in-house pipeline.\n\nThe vape side is the line most Washington shoppers recognize first. The cartridge catalog runs across live resin, cured resin, and distillate formats — three distinct extraction approaches under one brand — with strain-specific drops like GDP 1g Live Resin and Pineapple Express 1g Live Resin in the rotation. The disposable line gives shoppers a hardware-included option from the same brand. Pre-roll and flower formats round out the inhalation side, and the dab catalog is sourced from the same in-house extraction work.\n\nHitz’s positioning is accessible-tier without stepping down to the bottom-shelf bin — affordable pricing without giving up the extraction-method labeling and Washington production chain. Customers who reach for Hitz tend to be vape-first shoppers who want a clear extraction-method label on every cart, and everyday smokers who appreciate a lifestyle brand built around music and a budtender-friendly catalog rather than purely chasing potency numbers.",
    updatedAt: "2026-05-17",
  },
  "kokua-services": {
    slug: "kokua-services",
    tagline: "Lacey Tier 2 producer/processor. Hash-rosin joints and a strain-blended pre-roll bench.",
    bio: "Kokua Services is a Tier 2 I-502 producer/processor based in Lacey, in Thurston County. The brand name draws on the Hawaiian word for help, care, and cooperation — and the catalog leans into pre-roll formats that lean on craft extraction work for added flavor and potency rather than chasing the highest-test-percentage flower number.\n\nThe pre-roll bench is the line most Washington shoppers know first. The catalog runs across strain-blend pre-rolls and hash-rosin-infused formats, with the rosin pulled from material the team has worked through their own extraction pipeline. The premium tier centers on hash rosin joints — pre-rolled cones with cured hash rosin integrated into the smoke, a more labor-intensive infusion approach than the more common kief-coating or distillate-dab path. Concentrate formats run alongside on a smaller bench.\n\nKokua’s annual revenue tracked in the $3M range for 2025, which is mid-pack for a Tier 2 producer and reflects steady distribution rather than viral-shelf-presence. Customers who reach for Kokua tend to be pre-roll-first shoppers who want a hash-rosin or rosin-infused option from a single Washington producer, and budtenders mention the brand when a customer specifically asks for a solventless-infused joint format.",
    updatedAt: "2026-05-17",
  },
  "minglewood-brands": {
    slug: "minglewood-brands",
    displayName: "Minglewood Brands",
    tagline: "Tacoma Tier 1 producer/processor. Seven house brands including Clout King, High Tide, K-Savage.",
    bio: "Minglewood Brands is a Tier 1 I-502 producer/processor based in Tacoma, operating as both a cultivation house and a distribution arm. The company runs cultivation, processing, marketing, and statewide sales under one roof — and the catalog is multi-brand by design, with seven distinct consumer lines coming off the same Tacoma operation.\n\nThe portfolio includes Clout King, High Tide, K-Savage Supply Co, FlowerShop+, High Tide Cannabis Co, and several others. Each line carries its own packaging, voice, and product positioning, which lets the umbrella reach different shoppers across the same wholesale relationships. Distribution covers dozens of Washington dispensaries — Kush21, Lucid, Euphorium, 2020 Solutions, A Greener Today, and a long list of independents — and the brand handles its own large-scale distribution and sales rather than going through a third-party broker.\n\nMinglewood has tracked $8.8M in sales and ranks #44 among WA producers by total revenue. The team’s pitch to growers is exclusive, pesticide-free supply with on-time delivery; their pitch to retailers is a multi-brand catalog that fits different price tiers without going through multiple vendors. Customers who reach for any of the portfolio brands are reaching for Minglewood — worth knowing when comparing options across the flower wall, since the underlying production team and quality standards carry across the whole house.",
    updatedAt: "2026-05-17",
  },
  "oowee": {
    slug: "oowee",
    tagline: "Washington pre-rolls — top-ranked in the WA pre-roll category Jan-Apr 2026.",
    bio: "Ooowee (often spelled “Oowee” on shelf tags) is a Washington-produced cannabis brand whose pre-roll line has held the #1 spot in the WA pre-roll category for January through April 2026 — the kind of consistent month-over-month placement that doesn’t come from any single drop, but from a wide statewide distribution paired with a deep flavor rotation.\n\nThe catalog runs across hybrid disposables, waxes, and flower, with the pre-roll bench as the breakout shelf position. The disposable lineup includes the Trophy Runtz and Gusherlicious variants that built the brand’s early reputation, and the vape pen formats have earned a following for smooth draw, clean flavor, and mix-and-match duo-set options. Potency on the catalog skews high — the brand is marketed and stocked as a high-THC line, which is the lane most of its repeat customers reach for.\n\nDistribution covers Washington dispensaries across Spokane, Poulsbo, Silverdale, Clarkston, and the Seattle metro — most major operator chains in the state stock at least the flagship SKUs. Customers who reach for Oowee tend to be pre-roll-first and disposable-vape shoppers who want a recognizable brand at a working-shelf price, and the high category-rank means budtenders default to Oowee as a baseline name when a customer asks “what’s your top-selling pre-roll right now.”",
    updatedAt: "2026-05-17",
  },
  "painted-rooster": {
    slug: "painted-rooster",
    tagline: "Yakima Valley sky-lit cannabis since 2019. Flower, infused pre-rolls, and the Sungaze seltzer.",
    bio: "Painted Rooster Cannabis Company is a craft cannabis cultivator and processor based in Moxee, in the Yakima Valley, established in 2019. The brand’s growing method is sky-lit cultivation — greenhouse-style structures that let the plants finish under direct natural light while giving the operator environmental control over the room — and the team has been refining that approach in the Eastern Washington sun for several seasons.\n\nThe flower side is sustainably grown, pesticide-free, and hand-trimmed. CEO Douglas “DH” Henderson has gone on record about the philosophy: treat the sky-lit flower with the same finishing discipline normally reserved for indoor product, and focus on cure and preservation rather than chasing the highest-test-percentage number. The pre-roll catalog runs across single-strain formats and the Orion, G-Stik, and G-Nub infused-pre-roll lines, with the extraction work done in-house. The Sungaze seltzer rounds out the brand on the beverage side — an entry-level cannabis-infused drink format for shoppers who don’t want to smoke or vape.\n\nThe brand carries Leaf Bowl awards from the Washington industry circuit and has been profiled by Leaf Magazine for the cure-and-preservation approach. Customers who reach for Painted Rooster tend to be flower-first shoppers who want sun-grown Yakima Valley material with a documented finishing process, and seltzer-curious buyers reaching for Sungaze as a single-can drink format.",
    updatedAt: "2026-05-17",
  },
  "peak-supply": {
    slug: "peak-supply",
    displayName: "Peak Supply",
    logoUrl: "/brand-logos/peak-supply.png",
    tagline: "Cheney sun-grown cannabis since 2014. The producer behind Chong’s Choice WA and Mad Dog 420.",
    bio: "Peak Supply is a Tier 3 I-502 producer/processor based in Cheney, Washington — out past Spokane in the Inland Northwest — and has been growing and selling cannabis in the state recreational market since 2014. The cultivation approach is sun-grown across a tier-3 footprint, with every bud hand-trimmed and double-checked before packaging.\n\nThe in-house catalog runs flower-first, with strain rotations across indica, sativa, and hybrid cuts and a THC range in the high-teens to mid-20s. Pricing sits in the accessible band that sun-grown economics make possible. The operation has grown enough credibility on the production side that other brands have come to Peak as a grow partner: in 2017, the Chong’s Choice brand sought Peak out to grow and represent their line in Washington — the kind of relationship that doesn’t happen unless the host operator is doing the work consistently. Peak also operates Mad Dog 420 as a sister brand built specifically for customers reaching for the lowest possible shelf price.\n\nCustomers who reach for Peak Supply tend to be budget-conscious flower buyers who want a sun-grown WA brand with a long enough track record that budtenders recognize the name, and shoppers comparing the same producer’s output across different price tiers via the Chong’s Choice and Mad Dog 420 sister lines.",
    updatedAt: "2026-05-17",
  },
  "redbird-cannabis": {
    slug: "redbird-cannabis",
    tagline: "Spokane Tier 3 producer. High-pressure aeroponics with 98% less water than hydroponics.",
    bio: "Redbird is a Tier 3 I-502 producer/processor headquartered in Spokane, Washington — and the brand was previously known as The Virginia Company before the rebrand. The catalog runs across flower, pre-rolls, edibles, and dry sift rosin, all sourced from the same in-house cultivation pipeline.\n\nThe defining choice is the growing method: high-pressure aeroponics. Plant roots are suspended in air and saturated by a fine mist of water and nutrients rather than being planted in soil or submerged in a hydroponic reservoir. Because the roots are suspended, they receive 100% oxygen and carbon dioxide reception, and the system uses 98% less water than traditional hydroponics — the kind of inputs-discipline number that doesn’t come without significant facility-level engineering. The Tier 3 footprint gives the team the scale to run aeroponics across a meaningful canopy rather than as a small pilot.\n\nIn the WA flower category, Redbird has moved through 2026 with notable shifts — ranked 4th in January, 10th in February, 12th in March, recovering to 9th in April — which is the kind of week-over-week movement that reflects a brand with strong shelf presence rather than a niche player. Customers who reach for Redbird tend to be flower-first shoppers who care about cultivation method and water footprint, and operators looking for a Spokane-rooted brand with a documented engineering story behind every drop.",
    updatedAt: "2026-05-17",
  },
  "rochester-farms": {
    slug: "rochester-farms",
    tagline: "Rochester WA Tier 3 producer since 2017. Industrial automation borrowed from Dutch tulip growers.",
    bio: "Rochester Farms is a Tier 3 I-502 producer/processor located in Rochester, in the Olympia-area lowlands of southwestern Washington. The company has been distributing cannabis to Washington retailers since January 2017, and the operation was built specifically around a state-of-the-art automated cultivation facility — not a converted warehouse, but a ground-up engineering project.\n\nThe founders Marshall and Richard combined their backgrounds to design what is, by their account, one of the most efficient cannabis farms in the state. The automation pipeline draws on industrial irrigation systems borrowed from the Dutch tulip industry — applied here to cannabis at scale. The result is a facility producing about 500 pounds of cannabis flower per month, which is meaningful Tier 3 output, with the automation handling the bulk of the irrigation work and freeing the team to focus on cultivation discipline and finishing.\n\nThe catalog runs flower-first with concentrates and pre-rolls from the same in-house material. Distribution reaches across the WA retail network from Seattle metro through to smaller-market dispensaries. Customers who reach for Rochester Farms tend to be flower-first shoppers who appreciate that the operator took the time to engineer the facility properly before chasing scale, and budtenders mention the brand as a reliable mid-shelf option whose consistency comes from the automation pipeline as much as the cultivation team.",
    updatedAt: "2026-05-17",
  },
  "seattle-bubble-works": {
    slug: "seattle-bubble-works",
    displayName: "Seattle Bubble Works",
    logoUrl: "/brand-logos/seattle-bubble-works.png",
    tagline: "Buckley solventless hash since 2016. Ice-water extraction, bubble hash, Nepalese temple balls.",
    bio: "Seattle Bubble Works is a Washington I-502 processor based in Buckley, founded in 2016, with a catalog built around a single extraction philosophy: solventless hash made with nothing but ice and water. No hydrocarbons, no CO2, no alcohol — the brand’s entire production pipeline is the ice-water-and-agitation method that hash-makers have been refining for centuries.\n\nThe catalog runs across bubble hash, Nepalese-style temple balls, hash-infused joints (including CBD, CBN, and CBG variants alongside the THC-dominant baseline), and a specialty format called hash cannons — three joints tied together with a stick of hash down the center, an old-school party-format reinvention. The hash joints are the line most Washington shoppers know first: pre-rolled cones built around either CBD or bubble hash plus cannabis material, all under the same solventless quality bar.\n\nThe brand has held a consistent spot in the WA pre-roll category — fluctuating between 7th and 9th place from October 2024 through January 2025 — which is the kind of staying power that comes from operators trusting the format. Distribution covers Uncle Ike’s and Hashtag Cannabis locations across Seattle plus The Reef and Craft Cannabis chains. Customers who reach for Seattle Bubble Works tend to be solventless-first shoppers who specifically want ice-water hash from a single dedicated processor rather than a side-product of a larger flower brand.",
    updatedAt: "2026-05-17",
  },
  "sky-high-gardens": {
    slug: "sky-high-gardens",
    tagline: "Seattle Tier 3 indoor producer since 2015. Perpetual 16-day harvest cycle, 63% lower energy use.",
    bio: "Sky High Gardens is a Tier 3 I-502 producer/processor in Seattle that launched in 2015, transitioning from a medical-market grower into the licensed recreational system as soon as the state allowed. The company is led by CEO Phil Seda and co-owners Bryan Humphrey and Jeremy Knox, and the facility has built a reputation for both production discipline and operator transparency — Sky High was one of the first WA grows to open its doors for tours, partnering with Kush Tourism on visitor programs in January 2015, and was visited by ESPN film crews in early 2014 during Super Bowl coverage.\n\nThe cultivation pipeline is perpetual-harvest: every 16 days the team is actively harvesting plants from one section of the room while others move through earlier flowering stages, which keeps a steady supply of finished flower coming off the line without the boom-and-bust of single-cycle gardens. The team has invested in lighting and environmental technology that has cut power consumption per pound of finished cannabis by up to 63% since 2015 — the kind of inputs-discipline result that comes from continuous facility-side iteration rather than a single equipment upgrade.\n\nThe strain library mixes long-running classic cuts with pheno-hunted new selections, and the indica-dominant Pineapple Chunk has been one of the cultivars Sky High is most often associated with. Customers who reach for Sky High Gardens tend to be flower-first shoppers who want indoor-grown WA flower from one of the brands that helped define the segment in the state’s opening years.",
    updatedAt: "2026-05-17",
  },
  "skord": {
    slug: "skord",
    tagline: "Battle Ground Tier 2 craft cannabis. “Harvest” in Swedish — family-owned, pesticide-free.",
    bio: "SKöRD (often spelled “Skord” on shelf tags) is a Tier 2 WA cannabis producer/processor founded in 2015 and operating out of Battle Ground, Washington, in Clark County. The brand name is Swedish for “harvest” — a nod to the family-owned operation’s roots — and the working positioning is craft-quality cannabis flower and extracts at indoor scale.\n\nThe facility is a 7,200-square-foot indoor operation that the team built from the ground up, designed specifically for production discipline rather than retrofitted from another use. Strain selection is done in-house and most of the catalog is exclusive to SKöRD — the team’s pheno-hunting work doesn’t get distributed out to other producers. The brand operates a strict no-pesticides policy: no chemical sprays, no preventative chemical regimen, with beneficial predator insects handling any pest pressure the rooms see. PHö cartridges round out the catalog as a small-batch premium concentrate format — 100% propane oil with no fillers, no cutting agents, no distillate or added terpenes.\n\nSKöRD’s mission framing is to change the way people think about and experience top-shelf cannabis flower — which is the kind of statement many brands make but only a few back up with the small-facility, pesticide-free, in-house-genetics discipline that makes the claim credible. Customers who reach for SKöRD tend to be flower-first shoppers who want exclusive in-house genetics and a documented growing approach.",
    updatedAt: "2026-05-17",
  },
  "spark-industries": {
    slug: "spark-industries",
    tagline: "Tumwater Tier 2 producer. SCADA-controlled facility with an in-house pheno-hunting program.",
    bio: "Spark Industries is a WSLCB-licensed I-502 producer/processor with operations in Tumwater and Tacoma, Washington. The brand’s defining choice is its facility-level engineering: the Tumwater grow was designed from the ground up for cannabis production and runs on a state-of-the-art SCADA (Supervisory Control and Data Acquisition) system that monitors and manages the entire cultivation pipeline — the kind of industrial-controls layer that gives operators consistent control over every environmental variable across the room.\n\nThe team runs an in-house pheno-hunting and breeding program, and over the years that work has produced strains the team has engineered specifically for the facility’s growing environment. All flower is sorted, weighed, and packaged by hand to keep cannabinoid content and trichome structure intact — the slower-by-design finishing step that machine packaging tends to compromise. The result is a flower-first catalog with the consistency that comes from controlled environmental conditions plus the variety that comes from active breeding work.\n\nAs of March 2026, the Tumwater location tracked roughly $1.5M in monthly sales and ranked 4th of 542 WA producers/processors by revenue — top-1% production output in the state. Customers who reach for Spark Industries tend to be flower-first shoppers who care about facility-level discipline and pheno-hunted in-house genetics, and operators looking for a Tier 2 producer with documented breeding work behind the menu.",
    updatedAt: "2026-05-17",
  },
  "stone-age-joints": {
    slug: "stone-age-joints",
    tagline: "Bellingham extraction lab. WA’s most accessible full-flower and infused pre-rolls.",
    bio: "Stone Age Joints is a Washington I-502 brand whose extract operation runs 24/7 out of a facility in Bellingham. The brand’s positioning is unambiguous: build pre-rolls that taste like the flower they came from, source from the same farms that grow top-shelf cannabis, and keep the price accessible enough that customers can stock them at the everyday-shopper tier rather than the occasional-treat tier.\n\nThe full-flower pre-roll lineup uses 100% indoor flower from contracted partner farms — no shake, no trim. The infused line layers in CO2-derived extract made in the Bellingham lab — the CO2 extraction path keeps the flavor profile cleaner and more terpene-rich than the more common distillate-coating approach, which is the trade Stone Age has chosen. The strain names skew nostalgic, punny, or completely random — the brand’s stated philosophy is that life is too short not to light up and laugh about it, and the packaging reflects that.\n\nThe brand has built one of the more widely-distributed accessible-tier pre-roll lines in the state, with shelf presence at Vancouver, Tacoma, Wenatchee, and Seattle-metro dispensaries. Customers who reach for Stone Age Joints tend to be pre-roll-first shoppers who want CO2-extracted infused product at a working-budget price, and budtenders mention the brand when a customer asks for an infused joint that doesn’t step up to the boutique tier.",
    updatedAt: "2026-05-17",
  },
  "washington-bud-company": {
    slug: "washington-bud-company",
    displayName: "Washington Bud Co.",
    tagline: "Bothell craft cannabis since 2012. Founders are medical patients and growers. Pesticide-free.",
    bio: "Washington Bud Company is a boutique-batch, artisan cannabis producer based in Bothell, founded by Shawn DeNae and Bill Wagenseller — both medical cannabis patients and growers who began providing cannabis to safe-access patients in 2012, well before I-502’s recreational rollout. The pair carried that medical-market lineage into the licensed recreational system and built the brand around the same operating principles: pesticide-free cultivation, environmental controls instead of chemical sprays, and a focus on strains that have proven naturally resistant to pests and mold.\n\nThe brand’s motto is BE HAPPY, and the catalog is built to support that across both pleasure and purpose-driven shoppers. The flower lineup runs across classic and Pacific Northwest cuts — Sky Master, Ripped Bubba, Harlequin, Blackberry Kush — with pre-rolls, shake, and concentrates from the same in-house material. Every batch is tested for pesticides and heavy metals through third-party labs, which is how the brand backs its pesticide-free claim.\n\nThe Bothell address (19315 Bothell-Everett Highway, Unit 1) means the brand is grown and finished within Snohomish County, and distribution covers Lux Pot Shop, Canna West Seattle, and a long list of independent WA retailers. Customers who reach for Washington Bud Company tend to be flower-first shoppers who want a brand whose founders have been growing cannabis personally for more than a decade, and who appreciate the documented pesticide-free testing pipeline backing every drop.",
    updatedAt: "2026-05-17",
  },
  // ────────────────────────────────────────────────────────────────────
  // BRAND-VARIANT LOGO ENTRIES — 2026-05-17 (vendor-logo backfill lane)
  // Slug-variant logo entries for brands whose DB row uses a non-canonical
  // slug (e.g. "Artizen Cannabis Company" → artizen-cannabis-company on scc
  // vs. "Artizen" → artizen on glw). SLUG_ALIASES in page.tsx resolves
  // friendly URLs → canonical DB slug, but the canonical DB slug itself
  // can differ between stacks. These entries duplicate the canonical
  // brand's logo file (same bytes, different filename) so the page-tier
  // logo fallback resolves on either stack without a slug-rewrite step.
  // ────────────────────────────────────────────────────────────────────
  // DB-slug variants for Artizen (canonical at "artizen" above). When the
  // POS sync writes products under these variant slugs, the customer hits
  // /brands/artizen-cga which would otherwise render bare. Mirror the
  // canonical tagline so the hero stays brand-first across the variants.
  "artizen-cga": {
    slug: "artizen-cga",
    displayName: "Artizen",
    logoUrl: "/brand-logos/artizen-cga.png",
    tagline: "Washington indoor flower since 2014. Consistency at a working-budget price.",
    updatedAt: "2026-05-17",
  },
  "artizen-cannabis-company": {
    slug: "artizen-cannabis-company",
    displayName: "Artizen",
    logoUrl: "/brand-logos/artizen-cannabis-company.png",
    tagline: "Washington indoor flower since 2014. Consistency at a working-budget price.",
    updatedAt: "2026-05-17",
  },
  "ceres-435011": {
    slug: "ceres-435011",
    logoUrl: "/brand-logos/ceres-435011.png",
    tagline: "Washington flower and concentrate brand. Named for the Roman goddess of the harvest.",
    updatedAt: "2026-05-17",
  },
  "agro-couture-slab-mechanix": {
    slug: "agro-couture-slab-mechanix",
    logoUrl: "/brand-logos/agro-couture-slab-mechanix.png",
    tagline: "Tacoma artisan cannabis since 2015. Flower, concentrates, beverages, topicals under one roof.",
    updatedAt: "2026-05-17",
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
