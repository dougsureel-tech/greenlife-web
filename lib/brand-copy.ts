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

  "artizen": {
    slug: "artizen",
    tagline: "Washington indoor flower since 2014. Consistency at a working-budget price.",
    bio: "Artizen is one of the original brands to come out of Washington’s I-502 rollout, founded in 2014 and built around a single premise: keep the flower consistent, keep the price approachable, and let the strain library do the talking. The team is a mix of in-house cultivators and independent growers operating across Washington, all running indoor rooms under the same quality bar.\n\nThe catalog is flower-first — pre-packaged eighths, ounces, and pre-rolls in a wide rotation of strains — with a handful of concentrate and vape formats around the edges. Artizen leans into approachable everyday selection rather than limited drops: the same strains show up week after week, so a customer who finds something they like can come back for it. Distribution reaches roughly 200 Washington retailers, which is why budtenders treat Artizen as a baseline name when a customer asks “what’s reliable?”\n\nThe brand has spent close to a decade in the top-ten by all-time WA flower sales. Customers who reach for it tend to be price-conscious shoppers who want indoor-grown flower without paying boutique pricing, and operators who want a brand they can keep stocked without constant menu rework.",
    updatedAt: "2026-05-16",
  },

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

  "hellavated": {
    slug: "hellavated",
    tagline: "Arlington-built distillate vapes at a working-budget price point.",
    bio: "Hellavated is a Washington vape brand built by the team behind Avitas — same Arlington, WA operation, separate label aimed at the value end of the cartridge shelf. The product is triple-refined cannabis distillate, blended with botanical-derived terpenes to hit specific strain profiles, and packaged across 1g 510-thread carts, 500mg PAX pods, and 500mg disposables.\n\nThe catalog runs in three tiers. Profilez is the flagship strain-profile series — distillate blended with botanical terps tuned to recognizable cultivars. Strainz adds cannabis-derived terpenes pulled from the matching strain on top of the distillate base. Terpz drops the strain-name framing entirely and runs non-strain-specific blends with cannabis-derived terpenes. All three formats sit at a meaningfully lower price than the premium-vape tier on most Washington shelves, which is the whole point of the brand.\n\nFlavor rotation runs deep — Blueberry Dream, Strawberry Haze, Watermelon Kush, Mango Dragon, Mango Kush, and dozens more in regular rotation. Customers who reach for Hellavated tend to be cart-format buyers who want recognizable strain profiles and accessible pricing without stepping down to gas-station-tier hardware. The Avitas lineage means the distillate side of the operation is the same one that produces the premium tier — just packaged for a different shopper.",
    updatedAt: "2026-05-16",
  },

  "heylo-cannabis": {
    slug: "heylo-cannabis",
    tagline: "SODO Seattle extraction lab. 100% woman- and Latina-owned, terpene-forward.",
    bio: "Heylo Cannabis is an I-502 extracts processor based in Seattle’s SODO neighborhood, founded in 2017 by Lo Friesen — an environmental chemist trained at Northwestern with prior bench experience in a gastroenterology research lab. The brand is 100% woman- and Latina-owned, and the working premise is that cannabis extracts should taste like the plant they came from, not like distillate with terpenes spiked back in.\n\nThe core lineup is RawX vape cartridges — single-strain oil pulled from fresh-frozen flower with the strain’s native terpene fraction preserved through the extraction. Around it sit Heylotion topicals (Body Budder, Body Balm), Louder Lube, Loud CBD products, and the Heylo AIO and Heylo Pico hardware lines. Sister brands Treehaus and Yolo round out the value-tier cart side. The throughline is education and transparency: COAs are published, the extraction approach is documented, and the marketing avoids the usual “best-in-class” puffery.\n\nThe brand has earned multiple Terpestival first-place finishes and Leafly’s Best Overall Company recognition. Customers who reach for Heylo tend to be terpene-curious shoppers and cartridge buyers who care about extraction method and farm-of-origin — and who appreciate the depth of operator detail Lo and the team publish about the work.",
    updatedAt: "2026-05-16",
  },

  "honu-inc": {
    slug: "honu-inc",
    tagline: "Family-owned Washington edibles. Chocolate-confection-first, dessert second.",
    bio: "Honu is a family-owned I-502 producer/processor founded in Washington in 2013, with operations in the southwest part of the state. The name comes from the Hawaiian word for sea turtle — a symbol of longevity, peace, and humility in Hawaiian culture — and the brand’s approach mirrors that: take the time, do it by hand, keep the dose honest.\n\nThe catalog is edible-first, with the chocolate side as the flagship. Peanut Butter Cups, Chocolate Turtles, Coconut Snowballs, seasonal bars, and rotating confections make up most of the lineup, with each piece dosed to Washington’s 10mg-per-serving rule. The handcrafted side is meaningful here — Honu’s confections are made in small batches with high-quality cannabis extracts blended into the chocolate at the recipe step, not sprayed on after, which is why they taste like dessert before they taste like edible.\n\nThe brand carries 2016 Best Edibles Company and Best Sweet Edibles awards from Washington’s industry circuit, and every product goes through third-party lab testing. Customers who reach for Honu tend to be edible buyers who want the chocolate to actually taste like chocolate, and who appreciate a Washington-rooted family brand with a long enough track record that budtenders mention it without prompting.",
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

  "raven-grass": {
    slug: "raven-grass",
    tagline: "Washington living-soil flower. Sorted by cannabinoid type, not indica/sativa.",
    bio: "Raven Grass is a Washington cannabis brand that’s been growing in the I-502 market since 2013. The team works in living soil — meaning the plants pull nutrients directly from a biologically active soil web rather than from synthetic liquid feeds — and the rooms run without the standard fertigation manifold most indoor operations rely on.\n\nThe most distinctive thing about Raven Grass is how they label the catalog. Instead of indica / hybrid / sativa, every product is sorted into one of three “types” based on cannabinoid content. Type 01 is THC-dominant. Type 02 carries meaningful amounts of both THC and CBD in varying ratios. Type 03 is CBD-dominant with very little THC. It’s a more honest sort than the indica/sativa shorthand, and it makes the menu legible to customers who care about the underlying chemistry of what they’re buying.\n\nProduct-wise, the lineup is flower, pre-rolls, vape cartridges, and concentrates — all sourced from the same in-house strain library. Customers who reach for Raven Grass tend to be flower-first buyers who want a documented growing approach and a clearer way to pick a product than the indica/sativa wall. The brand has been a consistent climber in WA pre-roll category rank through 2024-2025.",
    updatedAt: "2026-05-16",
  },

  "refine": {
    slug: "refine",
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
    tagline: "Washington-born cannabis beverages. The team that built Happy Apple and Pearl2O.",
    bio: "Tarukino is a Washington-based cannabis beverage company best known for two product lines that effectively created the WA infused-drink shelf: Happy Apple cider and Pearl2O sparkling water. The company started in the early-I-502 years and built a beverage portfolio around a piece of proprietary technology called SoRSE — a water-based emulsion that lets cannabis oil mix into a liquid without the separation, taste, or smell problems that have hobbled most cannabis-drink attempts.\n\nHappy Apple is the flagship. It’s made with Washington-grown apples and cannabis, sold in 12oz bottles, and offered in three potency tiers (10mg, 50mg, 100mg) so the same drink format works for a first-time customer and an experienced consumer. The cider has held the top-selling cannabis beverage slot in Washington for years. Pearl2O is the sparkling-water expression of the same emulsion approach: no sugar, no calories, no cannabis taste, and a 1:1 THC:CBD ratio in the original format.\n\nThe broader Tarukino portfolio rotates through six additional infused beverages using the same SoRSE emulsion. Customers who reach for Tarukino tend to be drink-format buyers — the segment that doesn’t want to smoke, vape, or eat their cannabis — and shoppers who specifically want Washington-grown ingredients in the bottle.",
    updatedAt: "2026-05-16",
  },

  "the-goodship": {
    slug: "the-goodship",
    tagline: "Seattle edibles by the Cupcake Royale founder. Pastry-first, balanced-dose, locally sourced.",
    bio: "The Goodship was founded in Seattle in 2014 by Jody Hall, the entrepreneur behind Cupcake Royale, who carried her bakery-industry experience into the I-502 edibles space when Washington opened the rec market. The premise from the start was straightforward: build cannabis-infused confections to the same standard as a working pastry kitchen — real ingredients, balanced doses, and recipes that taste good before they taste medicated.\n\nThe catalog runs across chocolate bars, cookies, brownies, fruit jellies, peppermint patties, and a microdosed pastille line. Each piece is portioned to a 10mg-per-serving WA dose, but the lineup includes lower-microdose options for customers who want a measured pace rather than a single full dose. Ingredients lean local and sustainable where the supply chain allows it — organic and fair-trade chocolate is the standard, and vegan and gluten-free options sit alongside the regular menu.\n\nThe Goodship joined the Privateer Holdings family of cannabis brands in late 2017, which expanded the brand’s reach without changing the Seattle production approach. Customers who reach for it tend to be edible buyers who care that the chocolate, the cookie, or the brownie reads as a proper baked good first — and who want a Washington-rooted brand with a documented kitchen behind it.",
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
  // ────────────────────────────────────────────────────────────────────
  // BRAND BIO EXPANSION — 2026-05-16 (+20 entries)
  // ────────────────────────────────────────────────────────────────────

  "agro-couture": {
    slug: "agro-couture",
    tagline: "Tacoma artisan cannabis since 2015. Flower, concentrates, beverages, topicals under one roof.",
    bio: "Agro Couture is a Tacoma-based I-502 producer/processor (WSLCB #417142) that has been operating in the Washington recreational market since 2015. The brand positions itself as an artisan-tier multi-category operation, building a single in-house catalog across flower, concentrates, edibles, and topicals rather than focusing on one product class.\n\nThe flower side rotates through dessert and gas cuts — Donkey Butter, Gelato Cake, PB Pie show up regularly — and the pre-roll line includes a Diamond Stix infused-blunt format that has built its own following on Washington shelves. Concentrates run across live resin, shatter, distillate cartridges, and disposable vapes, drawing on the same in-house strain library that feeds the flower menu. The beverage side leans into 100mg lemonade formats (Tropical, Strawberry, Pink, Sour Grape) for customers who specifically want a drink format.\n\nThe topicals lineup is one of the broader ones from a Washington brand at this scale — body balms, lotions, and infusion drops in a range of THC/CBD/CBN/CBG ratios. Customers who reach for Agro Couture tend to be shoppers who want the same operator behind multiple categories, with a Tacoma-rooted brand they recognize from previous trips to the shelf.",
    updatedAt: "2026-05-16",
  },
  "avitas": {
    slug: "avitas",
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
  "dewey-cannabis-co": {
    slug: "dewey-cannabis-co",
    tagline: "Washington flower-and-rosin brand. “Cultivation Meets Curiosity.”",
    bio: "Dewey Cannabis Co is a Washington I-502 brand with a flower-first catalog and a meaningful solventless-extract side. The brand frames its work as “Cultivation Meets Curiosity,” which shows up in a strain library that rotates through both modern dessert/gas cuts and less-common phenos that the cultivation team has been experimenting with.\n\nThe lineup includes Signature Flower (the everyday eighth and ounce line), Live Resin vape cartridges, an all-in-one disposable dab pen, Live Rosin (solventless hash), and the Hella Dewbie pre-roll jar — 28 pre-rolls in a single jar, a format that gives party-pack shoppers a clear use case. The Matchsticks line is hash-infused, solvent-free pre-rolls for customers who specifically want a solventless infusion rather than the more common distillate-coated approach.\n\nThe brand publishes an annual “Lookbook” detailing cultivar runs and a “Dewsletter” email for upcoming drops — both of which are unusual for a Washington producer at this scale and point to a brand that takes the educational side seriously. Customers who reach for Dewey tend to be flower-first shoppers who also want a solventless-rosin option from the same operator, and pre-roll buyers looking for a real volume format.",
    updatedAt: "2026-05-16",
  },
  "dogtown-pioneers": {
    slug: "dogtown-pioneers",
    tagline: "Tier 3 WA producer. Home of Ray’s Lemonade and RSO Gold capsules.",
    bio: "Dogtown Pioneers is a Tier 3 Washington cannabis producer/processor whose best-known consumer line is Ray’s Lemonade — the 100mg cannabis-infused lemonade format that has held a steady spot on Washington beverage shelves for years. Dogtown is the operating company behind the Ray’s brand, and the broader catalog includes capsules and concentrates produced from the same in-house material.\n\nThe edible side runs across Ray’s Lemonade in multiple flavor variants and dose tiers, Indica capsule formats, and RSO Gold capsules — a Rick Simpson Oil expression in measured-dose capsule format for customers who specifically want RSO in a portion-controlled package. The concentrate side includes live resin in strain-specific runs (Black Russian x Wedding Cake, Prenup Live Resin) drawn from the producer’s own cultivation.\n\nFor customers who already know the Ray’s Lemonade brand, Dogtown is the producer behind it — the cannabis side of the operation that supplies the THC for the beverage line. Customers who reach for Dogtown directly tend to be capsule and concentrate buyers who want material from the same operator that runs the Ray’s program, with a clear in-state production chain.",
    updatedAt: "2026-05-16",
  },
  "evergreen-herbal": {
    slug: "evergreen-herbal",
    tagline: "Washington multi-brand edibles, beverages, and concentrates house. Operator of Major, Blaze, 4.20 Mini.",
    bio: "Evergreen Herbal is a Washington-based I-502 manufacturer that operates as a multi-brand house — a single Seattle-area production facility producing several distinct consumer lines rather than a single-name catalog. The portfolio includes Major (chocolate and confection edibles), Blaze (concentrates and pre-rolls), 4.20 Mini (small-format edibles), Sinners & Saints, Happy Apple cider (the long-running Washington cannabis cider line — also produced under license by other manufacturers historically), Velvet Swing topicals, and Vertus Champagne-style infused sparkling.\n\nThe range spans beverages (sodas, sparkling, cider-style), edibles (gummies, chocolates, shots), concentrates (rosin formats), topicals, and pre-rolled joints. The multi-brand structure means each line carries its own packaging, voice, and product positioning — a customer who knows one Evergreen line by name often doesn’t know the others share a kitchen.\n\nThe brand has been in continuous operation since the early I-502 years and is one of the longer-running multi-format producers in the state. Customers who reach for any of the portfolio brands are reaching for Evergreen Herbal — worth knowing when comparing options on the edible or beverage wall, since the underlying production team and quality-control standards carry across the whole catalog.",
    updatedAt: "2026-05-16",
  },
  "fairwinds-manufacturing": {
    slug: "fairwinds-manufacturing",
    tagline: "Vancouver, WA wellness-focused processor. Tinctures, capsules, suppositories, inhalers — the deep ingestibles bench.",
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
    tagline: "Washington flower and concentrate brand. Solvent and solventless extracts.",
    bio: "Fireline Cannabis is a Washington I-502 producer with a flower-and-concentrate catalog organized around two main product lines. The flower lineup runs across strains like Skatalite, White Fire OG, Toxic Green, and Lit Cookie Blizzard, with pre-rolled formats in the same strain rotation.\n\nThe concentrate side is where Fireline carries more breadth — live resin, diamonds, crumble, and a mix of solvent and solventless extracts in various strain variations. The combination of both extraction approaches under one brand is meaningful for customers comparing options: a shopper who specifically wants solventless can find it from the same operator that produces the live-resin side, with the same source material feeding both pipelines.\n\nProduct information has been sourced directly from the brand by the retail-platform databases. Customers who reach for Fireline tend to be concentrate-first shoppers who want a mix of extraction styles from a Washington producer, and flower buyers who want to pair an eighth with a concentrate from the same source. Worth asking your budtender what extraction format is freshest in stock on a given visit — the rotation moves with what the lab is finishing.",
    updatedAt: "2026-05-16",
  },
  "green-revolution": {
    slug: "green-revolution",
    tagline: "Poulsbo-based fast-acting cannabis. Doozies gummies, WildSide drinks, water-soluble tinctures.",
    bio: "Green Revolution is a Washington I-502 processor headquartered in Poulsbo, on the Kitsap Peninsula. The brand’s technical signature is a proprietary water-soluble emulsion (called UNET) that allows cannabis oil to mix into water-based products without the separation problems that have hobbled most cannabis-drink and tincture attempts. The practical result is products designed to take effect within 10–15 minutes of consumption rather than the longer onset typical of traditional edibles.\n\nThe flagship consumer lines are Doozies gummies (built around the fast-acting nanoemulsion) and the WildSide cannabis beverage line, including Max shots dosed up to 100mg THC. The tincture lineup is water-soluble — designed to mix into a drink or beverage rather than only the oil-base sublingual format. The portfolio also includes products built around minor cannabinoids (CBG, CBN, CBC) for customers who specifically want non-THC-dominant or balanced ratios.\n\nGreen Revolution has expanded beyond Washington into California, Massachusetts, and New York. Customers who reach for the brand on Washington shelves tend to be drink-format and gummy buyers who specifically want the faster-onset profile the water-soluble emulsion enables, and shoppers who want a brand whose underlying technology is documented rather than asserted.",
    updatedAt: "2026-05-16",
  },
  "grow-op-farms": {
    slug: "grow-op-farms",
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
    tagline: "One of the largest producer/processors in Washington. 200+ employees, multiple in-house brand lines.",
    bio: "Northwest Cannabis Solutions is one of the largest recreational cannabis producer/processors operating in Washington, with more than 200 employees across cultivation, extraction, and edibles production. The company runs a state-of-the-art growing facility, a dedicated extraction lab, and an edibles kitchen — a vertically integrated footprint that allows them to produce flower, concentrates, cartridges, edibles, topicals, and tinctures under a single roof.\n\nThe brand portfolio is deep. Legends and Private Reserve sit on the flower side. Funky Monkey, Mini Budz, and Terp Stix carry the pre-roll and concentrate-pre-roll formats. The edibles bench includes Marmas (gummies), Mari’s Mints, Pebbles Lozenges, Hi-Burst Fruit Chews, and Chewee’s Caramels. The variety is the point — NWCS is one of the few Washington operators where a single producer can supply an entire shelf from flower through edibles without leaving the umbrella.\n\nFor budtenders, NWCS is a baseline name — the producer behind a noticeable share of what’s stocked on a typical Washington menu, often without the customer realizing they’re reaching for the same operator across multiple categories. Customers who reach for the portfolio brands tend to be shoppers who care about the underlying production standards and want a producer whose distribution footprint covers most of the state.",
    updatedAt: "2026-05-16",
  },
  "ray-s-lemonade-wa": {
    slug: "ray-s-lemonade-wa",
    tagline: "Washington cannabis lemonades. 100mg bottles, 10mg shots, a deep flavor bench.",
    bio: "Ray’s Lemonade is a Washington cannabis beverage line produced by Dogtown Pioneers (WSLCB #416538), with a parallel California operation under separate licensing. The brand has held a steady spot on the Washington beverage shelf for years and runs across several formats — full-size Original Ray’s bottles (typically 100mg THC), Lil’ Ray’s 10mg shots for single-serve dosing, and Ray’s Cans for the can-format expression.\n\nThe flavor bench is one of the deeper ones in the WA cannabis-beverage category. The rotation includes Original Lemonade, Raspberry, Huckleberry, Pineapple, Mango, Tiger’s Blood, Blackberry, Citrus Kush, Dragon Fruit, Elderberry, Peach, and Strawberry — with many flavors offered in multiple cannabinoid blends so a customer who likes the format can find a profile that matches what they reach for. The brand has also extended into Ray’s Vapes, Ray’s Gummies, live and hash rosin products, and minor-cannabinoid variants.\n\nProducts are produced to Washington State Department of Health compliance standards with third-party lab testing on every run. Customers who reach for Ray’s tend to be drink-format buyers who want a flavored lemonade that delivers the cannabis side cleanly — and the 10mg Lil’ Ray’s format is one of the few WA beverages explicitly portioned for a single-serve, low-dose customer.",
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
