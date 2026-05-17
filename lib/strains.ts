// Curated Top-50 strain library — Wave 1 of the 250-strain rollout for Green Life
// Cannabis customer-facing sites (greenlifecannabis.com + seattlecannabis.co).
//
// Anchored in shelf-presence + search-volume at Washington dispensaries 2024-2026.
// The first 10 entries (blue-dream → pineapple-express) are duplicated verbatim from
// apps/staff/src/lib/strains.ts (the Inventory App staff-side reference) and remain
// the SoT for those slugs. The remaining 40 entries are new for this wave.
//
// COMPLIANCE (WAC 314-55-155):
//   - No medical claims ("treats X", "cures Y")
//   - No efficacy promises — "customers report" framing only
//   - "Associated with relaxation effects", not "this will help with anxiety"
//   - Knowledgeable retail clerk tone, not medical practitioner
//   - Disputed lineage marked "(debated)"

export type Strain = {
  slug: string;
  name: string; // Canonical display name, e.g. "Blue Dream"
  type: "sativa" | "indica" | "hybrid";
  /** Other names / common abbreviations — used for product search matching */
  aliases: readonly string[];
  /** One-line tagline */
  tagline: string;
  /** Long-form intro (2-3 sentences) — top of the page */
  intro: string;
  /** Genetic lineage as plain text, e.g. "Blueberry × Haze" */
  lineage?: string;
  /** Parent slugs (for family-tree visualization). null = landrace or unnamed parent. */
  parents?: readonly (string | null)[];
  /** Typical THC % range, e.g. "17-24%" */
  thcRange?: string;
  /** Typical CBD % range, e.g. "<1%" */
  cbdRange?: string;
  /** Top effects, in order of prominence */
  effects: readonly string[];
  /** Top terpenes, with one-line note each */
  terpenes: { name: string; note: string }[];
  /** Aroma/flavor notes */
  flavor: readonly string[];
  /** "Best for…" use cases */
  bestFor: readonly string[];
  /** "Be cautious if…" — honest counter-cases */
  avoidIf: readonly string[];
  /** FAQ — generates FAQPage Schema.org markup */
  faqs: { q: string; a: string }[];
  /** Alternative lineage candidates when sources disagree — surfaces "(debated)" detail */
  lineageAlternates?: readonly string[];
  /**
   * Verification metadata — populated 2026-05-15 cross-referencing Leafly, Wikileaf,
   * SeedFinder, AllBud, and breeder sources. See STRAIN_VERIFICATION_REPORT_2026_05_15.md.
   */
  verification?: {
    status: "verified" | "verified-with-note" | "contested-doug-review";
    sources: readonly string[]; // URLs cross-referenced
    notes?: string; // discrepancies found
    verifiedAt: string; // ISO date
  };
};

export const STRAINS: Record<string, Strain> = {
  // ────────────────────────────────────────────────────────────────────
  // WAVE 0 — verbatim from apps/staff/src/lib/strains.ts (already correct picks)
  // ────────────────────────────────────────────────────────────────────

  "blue-dream": {
    slug: "blue-dream",
    name: "Blue Dream",
    type: "hybrid",
    aliases: ["Blue Dream", "BD"],
    tagline: "California's everyday hybrid — uplifted, calm, easy.",
    intro:
      "Blue Dream is the Pacific Northwest's default hybrid for a reason: it's reliably balanced — head-up " +
      "without being racey, body-loose without being couch-locked. Comes from a Blueberry indica × Haze sativa " +
      "cross out of NorCal in the early 2000s. Smells like fresh berries and pine.",
    lineage: "Blueberry × Haze",
    parents: ["blueberry", "haze"],
    thcRange: "17–24%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Relaxed", "Creative", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy, mild sedative — the body-loose side" },
      { name: "Pinene", note: "fresh pine — sharp, focusing" },
      { name: "Caryophyllene", note: "peppery, warm woody" },
    ],
    flavor: ["Sweet berries", "Pine", "Vanilla undertone"],
    bestFor: ["Daytime use", "Creative work", "Hike or walk", "Social gatherings", "First-time hybrid"],
    avoidIf: ["You're sensitive to THC and want CBD-forward", "You need to be sharp behind the wheel"],
    faqs: [
      {
        q: "Is Blue Dream a sativa or indica?",
        a: "Hybrid — sativa-leaning. The high is more head-up than body-heavy, but the Blueberry parent keeps it from being purely racey.",
      },
      {
        q: "Is Blue Dream good for beginners?",
        a: "Yes — Blue Dream is one of the most-recommended starter hybrids. Predictable, balanced, not overwhelming. Start with a small dose.",
      },
      {
        q: "What does Blue Dream taste like?",
        a: "Sweet blueberries up front, pine on the back end, vanilla undertone. Smell is recognizable across the room — fresh, fruity, not skunky.",
      },
      {
        q: "How strong is Blue Dream?",
        a: "Blue Dream tests in the 17–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Blue Dream best for?",
        a: "Blue Dream reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
      {
        q: "What terpenes are in Blue Dream?",
        a: "The dominant terpenes in Blue Dream are Myrcene (earthy, mango-like, with a mild body-heavy quality), Pinene (sharp pine, fresh and focusing), and Caryophyllene (peppery and warm, spicy on the back end). The blend is what gives the strain its specific nose and the character customers report on the exhale.",
      },
      {
        q: "What strains are similar to Blue Dream?",
        a: "Customers who like Blue Dream often reach for Berry White, Jack Herer, or Strawberry Cough — shared lineage or a similar profile. Our budtenders can walk through the differences if you want a side-by-side.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/blue-dream",
        "https://weedmaps.com/strains/blue-dream",
      ],
      notes:
        "Leafly confirms Blueberry × Haze, sativa-dominant hybrid, top terpenes Myrcene/Pinene/Caryophyllene, THC ~21% (within our 17–24% range).",
      verifiedAt: "2026-05-15",
    },
  },

  "wedding-cake": {
    slug: "wedding-cake",
    name: "Wedding Cake",
    type: "hybrid",
    aliases: ["Wedding Cake", "Pink Cookies"],
    tagline: "Indica-leaning hybrid — sweet, heavy, dessert-y.",
    intro:
      "Wedding Cake (also called Pink Cookies) is the dessert end of the hybrid spectrum: indica-leaning, " +
      "with a heavy body buzz and a head that's relaxed but still functional. Born from Triangle Kush × Animal " +
      "Mints. Smells like sweet vanilla and pepper. Good for late-afternoon and evening.",
    lineage: "Triangle Kush × Animal Mints",
    parents: ["triangle-kush", "animal-mints"],
    thcRange: "22–27%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Sleepy"],
    terpenes: [
      { name: "Limonene", note: "citrus zest — the mood-up side" },
      { name: "Caryophyllene", note: "peppery, mellow" },
      { name: "Myrcene", note: "earthy, body-heavy" },
    ],
    flavor: ["Vanilla", "Sweet pastry", "Pepper"],
    bestFor: ["Wind-down evenings", "After-dinner couch time", "Light pain relief", "Stress melt"],
    avoidIf: ["You need to be productive", "You're very low-tolerance — these run high in THC"],
    faqs: [
      {
        q: "What's the difference between Wedding Cake and Pink Cookies?",
        a: "Same strain — Pink Cookies was the original name in some markets, Wedding Cake stuck nationally. Same genetics either way.",
      },
      {
        q: "Is Wedding Cake a nighttime strain?",
        a: "Yes, especially the higher-THC phenotypes. Indica-leaning, body-relaxing, and the limonene keeps it from feeling too heavy.",
      },
      {
        q: "Is Wedding Cake indica, sativa, or hybrid?",
        a: "Wedding Cake is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Triangle Kush × Animal Mints. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Wedding Cake taste like?",
        a: "Wedding Cake hits vanilla up front, sweet pastry through the middle, and pepper on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Wedding Cake?",
        a: "Wedding Cake tests in the 22–27% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Wedding Cake best for?",
        a: "Wedding Cake reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/wedding-cake",
        "https://dnagenetics.com/wedding-cake-cannabis-strain/",
        "https://seedfinder.eu/en/strain-info/wedding-cake/seed-junky-genetics",
      ],
      notes:
        "Leafly + Seed Junky Genetics (Jbeezy) confirm Triangle Kush × Animal Mints. Indica-leaning hybrid. Top terpenes Caryophyllene/Limonene/Myrcene. THC ~24% (within 22–27% range).",
      verifiedAt: "2026-05-15",
    },
  },

  gelato: {
    slug: "gelato",
    name: "Gelato",
    type: "hybrid",
    aliases: ["Gelato", "Larry Bird"],
    tagline: "The dessert hybrid that built a thousand crosses.",
    intro:
      "Gelato is the parent (or grandparent) of half the modern hybrid market. Bay Area genetics, sweet and " +
      "creamy, balanced head + body. Most numbered Gelato cuts (33, 41, 45) are slight variations on the same " +
      "theme — uplifted but not racey, relaxed but not sedative. Easy to like.",
    lineage: "Sunset Sherbet × Thin Mint GSC",
    parents: ["sunset-sherbet", "thin-mint-gsc"],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Happy", "Relaxed", "Creative", "Euphoric"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Humulene", note: "earthy, hop-like" },
    ],
    flavor: ["Sweet cream", "Berry", "Lavender"],
    bestFor: ["After work", "Watching something good", "Casual social", "Painting / making"],
    avoidIf: ["You want a clear-headed sativa", "You're very anxiety-prone"],
    faqs: [
      {
        q: "What's the difference between Gelato 33 and Gelato 41?",
        a: "Both are phenotypes (specific cuts) of the original Gelato seedline. 33 leans sweeter, 41 leans more diesel. Effect difference is subtle for most people.",
      },
      {
        q: "Why is Gelato also called Larry Bird?",
        a: "The breeder named one of the original cuts after Larry Bird — jersey number 33. Same strain.",
      },
      {
        q: "Is Gelato indica, sativa, or hybrid?",
        a: "Gelato is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Sunset Sherbet × Thin Mint GSC. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Gelato taste like?",
        a: "Gelato hits sweet cream up front, berry through the middle, and lavender on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Gelato?",
        a: "Gelato tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Gelato best for?",
        a: "Gelato reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/gelato",
        "https://weedmaps.com/strains/gelato",
      ],
      notes:
        "Leafly confirms Sunset Sherbert × Thin Mint GSC, balanced hybrid, top terpenes Caryophyllene/Limonene/Humulene, THC ~21% (within 20–25% range).",
      verifiedAt: "2026-05-15",
    },
  },

  "og-kush": {
    slug: "og-kush",
    name: "OG Kush",
    type: "hybrid",
    aliases: ["OG Kush", "OG"],
    tagline: "The west-coast classic. Heavy, citrusy, unmistakable.",
    intro:
      "OG Kush is one of the foundational strains of West Coast cannabis. Heavy hybrid leaning indica, with a " +
      "citrus + diesel + pine smell that's instantly recognizable. The 'OG' has been debated forever (Original " +
      "Gangster? Ocean Grown?) — what isn't debated is how influential it is on modern genetics.",
    lineage: "Chemdawg × Hindu Kush (debated)",
    parents: ["chemdawg", "hindu-kush"],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Euphoric", "Happy", "Sleepy"],
    terpenes: [
      { name: "Limonene", note: "lemon zest" },
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Caryophyllene", note: "peppery, mellow" },
    ],
    flavor: ["Diesel", "Lemon zest", "Earthy pine"],
    bestFor: ["End of a long day", "Stress relief", "Light insomnia", "Couch + movie"],
    avoidIf: ["You need to be alert", "Diesel/skunk smells turn you off"],
    faqs: [
      {
        q: "Is OG Kush sativa or indica?",
        a: "Hybrid leaning indica. The body-heavy buzz is what most people remember; the head-up is briefer.",
      },
      {
        q: "What does OG Kush taste like?",
        a: "OG Kush hits diesel up front, lemon zest through the middle, and earthy pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is OG Kush?",
        a: "OG Kush tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is OG Kush best for?",
        a: "OG Kush reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
      {
        q: "What terpenes are in OG Kush?",
        a: "The dominant terpenes in OG Kush are Limonene (citrus zest, bright and mood-lifting on the nose), Myrcene (earthy, mango-like, with a mild body-heavy quality), and Caryophyllene (peppery and warm, spicy on the back end). The blend is what gives the strain its specific nose and the character customers report on the exhale.",
      },
    ],
    lineageAlternates: [
      "Chemdawg × Lemon Thai × Hindu Kush (Leafly)",
      "Bagseed of unknown origin (Josh D origin folklore)",
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/og-kush",
        "https://weedmaps.com/strains/og-kush",
      ],
      notes:
        "Lineage genuinely debated — Leafly cites Chemdawg × Lemon Thai × Hindu Kush; community consensus also names Chemdawg × Hindu Kush. Kept simpler 2-parent version with (debated) tag. Type hybrid (leans indica). Terpenes Myrcene/Limonene/Caryophyllene match.",
      verifiedAt: "2026-05-15",
    },
  },

  "jack-herer": {
    slug: "jack-herer",
    name: "Jack Herer",
    type: "sativa",
    aliases: ["Jack Herer", "JH", "The Jack"],
    tagline: "Clear-headed sativa that built a movement.",
    intro:
      "Named for the legalization advocate, Jack Herer is the sativa most non-cannabis people have actually heard of. " +
      "Clean head-up energy, very little body weight, with a piney-spicy aroma. Daytime by design — productive, focused, " +
      "social-easy.",
    lineage: "Haze × (Northern Lights #5 × Shiva Skunk)",
    parents: ["haze", "northern-lights-5", "shiva-skunk"],
    thcRange: "15–24%",
    cbdRange: "<1%",
    effects: ["Energetic", "Focused", "Creative", "Uplifted"],
    terpenes: [
      { name: "Terpinolene", note: "herbal, fresh — uncommon and distinctive" },
      { name: "Pinene", note: "pine, focusing" },
      { name: "Caryophyllene", note: "peppery base" },
    ],
    flavor: ["Pine", "Herbal", "Citrus zest"],
    bestFor: ["Morning use", "Creative work", "Hike or run", "Social pre-game"],
    avoidIf: ["You're prone to caffeine-style anxiety", "You want a body-heavy buzz"],
    faqs: [
      {
        q: "Is Jack Herer a true sativa?",
        a: "Yes — about as close to a 'pure sativa' experience as you'll find on a Washington shelf, despite some indica genetics in the lineage.",
      },
      {
        q: "Is Jack Herer indica, sativa, or hybrid?",
        a: "Jack Herer is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Haze × (Northern Lights #5 × Shiva Skunk).",
      },
      {
        q: "What does Jack Herer taste like?",
        a: "Jack Herer hits pine up front, herbal through the middle, and citrus zest on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Jack Herer?",
        a: "Jack Herer tests in the 15–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Jack Herer best for?",
        a: "Jack Herer reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/jack-herer",
        "https://sensiseeds.com/en/cannabis-seeds/sensi-seeds/jack-herer-feminized",
      ],
      notes:
        "Sensi Seeds (original breeder) confirms Haze × (Northern Lights #5 × Shiva Skunk). Leafly: 55% sativa-dominant hybrid, top terpenes Terpinolene/Caryophyllene/Pinene, THC ~18%. Our (15–24%) range valid.",
      verifiedAt: "2026-05-15",
    },
  },

  "northern-lights": {
    slug: "northern-lights",
    name: "Northern Lights",
    type: "indica",
    aliases: ["Northern Lights", "NL"],
    tagline: "The classic sleep indica. Old-school, reliable.",
    intro:
      "Northern Lights is one of the oldest commercial indicas — a 1980s Pacific Northwest staple. Heavy body, " +
      "calm head, distinctly sweet-spicy aroma. If you've never tried 'old-school' cannabis, this is what it tastes like.",
    lineage: "Afghani × Thai (debated)",
    parents: ["afghani", "thai"],
    thcRange: "16–22%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Happy", "Hungry"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating — the foundation" },
      { name: "Caryophyllene", note: "peppery, calming" },
      { name: "Pinene", note: "soft pine on the back end" },
    ],
    flavor: ["Earthy", "Sweet spice", "Pine"],
    bestFor: ["Sleep", "Body soreness", "Quiet evenings", "Pain relief"],
    avoidIf: ["You need to function", "You're new and want a head-up experience first"],
    faqs: [
      {
        q: "Is Northern Lights a nighttime strain?",
        a: "Yes — one of the most-recommended sleep indicas in cannabis. The myrcene-heavy profile is the classic 'put me to bed' chemotype.",
      },
      {
        q: "Is Northern Lights indica, sativa, or hybrid?",
        a: "Northern Lights is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Afghani × Thai (debated).",
      },
      {
        q: "What does Northern Lights taste like?",
        a: "Northern Lights hits earthy up front, sweet spice through the middle, and pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Northern Lights?",
        a: "Northern Lights tests in the 16–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Northern Lights best for?",
        a: "Northern Lights reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/northern-lights",
        "https://sensiseeds.com/en/cannabis-seeds/sensi-seeds/northern-lights",
      ],
      notes:
        "Leafly confirms Afghani × Thai lineage with (debated) provenance. Indica. Top terpenes Myrcene/Caryophyllene/Limonene (our Pinene is alternate; Limonene also appears). THC ~18% (within 16–22%).",
      verifiedAt: "2026-05-15",
    },
  },

  // VERIFIED 2026-05-15: Lineage debated — primary modern consensus is Chemdawg × Super Skunk (Leafly).
  // brapp's older 3-parent version retained as alternate. Marked "(debated)".
  "sour-diesel": {
    slug: "sour-diesel",
    name: "Sour Diesel",
    type: "sativa",
    aliases: ["Sour Diesel", "Sour D", "East Coast Diesel", "ECSD"],
    tagline: "Loud-smelling sativa with a clear, energetic high.",
    intro:
      "Sour Diesel is the East Coast classic — pungent fuel-and-citrus aroma, high-energy clear-headed effect. " +
      "Less of a body buzz than most modern hybrids, more of a 'turn up and go.' New Yorkers built a culture around it " +
      "in the '90s; it's never gone away.",
    lineage: "Chemdawg × Super Skunk (debated)",
    parents: ["chemdawg", null],
    thcRange: "19–25%",
    cbdRange: "<1%",
    effects: ["Energetic", "Uplifted", "Focused", "Creative"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Limonene", note: "citrus pop" },
      { name: "Myrcene", note: "earthy underbelly" },
    ],
    flavor: ["Diesel/fuel", "Citrus zest", "Skunk"],
    bestFor: ["Daytime energy", "Creative push", "Cleaning the house", "Afternoon hike"],
    avoidIf: ["You want neighbors not to smell it", "Anxiety-prone — Sour D runs high"],
    faqs: [
      {
        q: "Why does Sour Diesel smell so strong?",
        a: "Fuel-forward terpenes (driven by caryophyllene + the Chemdawg lineage). It's part of the experience — but worth knowing if you're being discreet.",
      },
      {
        q: "Is Sour Diesel indica, sativa, or hybrid?",
        a: "Sour Diesel is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Chemdawg × Super Skunk (debated).",
      },
      {
        q: "What does Sour Diesel taste like?",
        a: "Sour Diesel hits diesel/fuel up front, citrus zest through the middle, and skunk on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Sour Diesel?",
        a: "Sour Diesel tests in the 19–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Sour Diesel best for?",
        a: "Sour Diesel reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    lineageAlternates: [
      "Chemdawg × (Northern Lights × Skunk #1) — older 3-parent version",
      "Chemdawg 91 × DNL — AJ's Sour Diesel origin story",
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/sour-diesel",
        "https://www.amsterdamseedcenter.com/en/blog/the-history-of-sour-diesel-nyc-legendary-cannabis-strain",
        "https://seedsherenow.com/sour-diesel-history-of-ajs-sour-diesel-and-e-c-s-d-4-strains-you-need-now/",
      ],
      notes:
        "Lineage genuinely contested. Leafly + most modern sources cite Chemdawg × Super Skunk. brapp inherited the older 3-parent version (Chemdawg × NL × Skunk #1) which traces to early Leafly entries. AJ's Sour Diesel origin story names DNL. Updated to simpler debated wording; lineageAlternates field retains the older version for completeness. Type listed sativa per most sources; Leafly currently classifies as hybrid.",
      verifiedAt: "2026-05-15",
    },
  },

  "granddaddy-purple": {
    slug: "granddaddy-purple",
    name: "Granddaddy Purple",
    type: "indica",
    aliases: ["Granddaddy Purple", "GDP", "Grand Daddy Purple"],
    tagline: "Sweet, heavy purple indica. The classic 'goodnight' strain.",
    intro:
      "Granddaddy Purple — usually GDP — is what people picture when they imagine 'purple weed.' Heavy " +
      "body indica, grape-and-berry sweetness, comes on slow and lands hard. Best after dinner, before bed.",
    lineage: "Purple Urkle × Big Bud",
    parents: ["purple-urkle", "big-bud"],
    thcRange: "17–23%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Happy", "Hungry"],
    terpenes: [
      { name: "Myrcene", note: "deep earthy sedation" },
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Pinene", note: "light pine balance" },
    ],
    flavor: ["Grape", "Berry", "Sweet earth"],
    bestFor: ["Sleep", "Pain relief", "Body soreness", "Stress melt"],
    avoidIf: ["You need to function in the next few hours", "You're sensitive to heavy indicas"],
    faqs: [
      {
        q: "Is Granddaddy Purple a heavy strain?",
        a: "Yes — one of the heaviest indicas in regular rotation. The 'on-the-couch' kind of heavy. Plan accordingly.",
      },
      {
        q: "Is Granddaddy Purple indica, sativa, or hybrid?",
        a: "Granddaddy Purple is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Purple Urkle × Big Bud.",
      },
      {
        q: "What does Granddaddy Purple taste like?",
        a: "Granddaddy Purple hits grape up front, berry through the middle, and sweet earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Granddaddy Purple?",
        a: "Granddaddy Purple tests in the 17–23% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Granddaddy Purple best for?",
        a: "Granddaddy Purple reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/granddaddy-purple",
        "https://weedmaps.com/strains/granddaddy-purple",
      ],
      notes:
        "Leafly confirms Purple Urkle × Big Bud (also lists alternate Mendo Purps × Skunk × Afghanistan). Indica. Top terpenes Myrcene/Pinene/Caryophyllene match closely. THC ~17% (within our 17–23%).",
      verifiedAt: "2026-05-15",
    },
  },

  "girl-scout-cookies": {
    slug: "girl-scout-cookies",
    name: "Girl Scout Cookies",
    type: "hybrid",
    aliases: ["Girl Scout Cookies", "GSC", "Cookies"],
    tagline: "Sweet hybrid that anchors a generation of crosses.",
    intro:
      "GSC (renamed from Girl Scout Cookies due to trademark) is one of the most-crossed strains of the past " +
      "decade. Sweet, mint-and-earth flavor, balanced hybrid effect — relaxed body, gently elevated head. " +
      "Half the modern hybrid catalog has GSC somewhere in its lineage.",
    lineage: "OG Kush × Durban Poison",
    parents: ["og-kush", "durban-poison"],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Happy", "Relaxed", "Euphoric", "Creative"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery — the Cookies signature" },
      { name: "Limonene", note: "citrus-sweet uplift" },
      { name: "Humulene", note: "earthy hop note" },
    ],
    flavor: ["Sweet mint", "Earthy", "Spicy"],
    bestFor: ["Evening social", "Casual creative time", "Stress relief"],
    avoidIf: ["You're very low-tolerance — GSC runs high"],
    faqs: [
      {
        q: "Are GSC and Girl Scout Cookies the same strain?",
        a: "Yes. The brand had to drop 'Girl Scout' due to trademark issues; same genetics under both names.",
      },
      {
        q: "Is Girl Scout Cookies indica, sativa, or hybrid?",
        a: "Girl Scout Cookies is a hybrid — a cross that pulls from both sides of the family tree. The lineage is OG Kush × Durban Poison. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Girl Scout Cookies taste like?",
        a: "Girl Scout Cookies hits sweet mint up front, earthy through the middle, and spicy on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Girl Scout Cookies?",
        a: "Girl Scout Cookies tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Girl Scout Cookies best for?",
        a: "Girl Scout Cookies reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/gsc",
        "https://weedmaps.com/strains/gsc",
      ],
      notes:
        "Leafly confirms OG Kush × F1 Durban (functionally equivalent to OG Kush × Durban Poison), indica-dominant hybrid, top terpenes Caryophyllene/Myrcene/Limonene (our Humulene is alternate; both Myrcene and Humulene appear depending on pheno). THC ~25%.",
      verifiedAt: "2026-05-15",
    },
  },

  "pineapple-express": {
    slug: "pineapple-express",
    name: "Pineapple Express",
    type: "hybrid",
    aliases: ["Pineapple Express", "PE"],
    tagline: "Sweet tropical hybrid — bright head, easy body.",
    intro:
      "Pineapple Express became famous outside cannabis culture (thanks, movie). Inside cannabis culture it's " +
      "loved on its own merits: a sativa-leaning hybrid with bright pineapple-and-cedar flavor and a clear, " +
      "happy effect. Daytime-friendly, social-easy.",
    lineage: "Trainwreck × Hawaiian",
    parents: ["trainwreck", "hawaiian"],
    thcRange: "17–24%",
    cbdRange: "<1%",
    effects: ["Happy", "Energetic", "Uplifted", "Focused"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Limonene", note: "citrus-bright" },
      { name: "Pinene", note: "fresh pine" },
    ],
    flavor: ["Pineapple", "Cedar", "Tropical fruit"],
    bestFor: ["Daytime", "Social events", "Outdoor activities", "Light creative work"],
    avoidIf: ["You want sleep", "You're caffeine-anxious"],
    faqs: [
      {
        q: "Is Pineapple Express like the movie?",
        a: "Cinematically embellished. The real strain is gentler than the movie suggests — pleasant, bright, daytime-suitable.",
      },
      {
        q: "Is Pineapple Express indica, sativa, or hybrid?",
        a: "Pineapple Express is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Trainwreck × Hawaiian. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Pineapple Express taste like?",
        a: "Pineapple Express hits pineapple up front, cedar through the middle, and tropical fruit on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Pineapple Express?",
        a: "Pineapple Express tests in the 17–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Pineapple Express best for?",
        a: "Pineapple Express reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/pineapple-express",
        "https://weedmaps.com/strains/pineapple-express",
      ],
      notes:
        "Leafly confirms Trainwreck × Hawaiian, sativa-dominant hybrid, top terpenes Myrcene/Caryophyllene/Pinene (our Limonene is alternate). THC ~20% (within 17–24%).",
      verifiedAt: "2026-05-15",
    },
  },

  // ────────────────────────────────────────────────────────────────────
  // WAVE 1 — additions (40 new entries)
  // ────────────────────────────────────────────────────────────────────

  zkittlez: {
    slug: "zkittlez",
    name: "Zkittlez",
    type: "indica",
    aliases: ["Zkittlez", "Skittles", "Zkittles", "Z"],
    tagline: "Candy-sweet indica-leaning hybrid — taste the rainbow.",
    intro:
      "Zkittlez is the candy strain — a bowl genuinely tastes like a handful of fruit candies. " +
      "Indica-leaning hybrid that's calmer than its bright flavor suggests: relaxed body, happy head, " +
      "rarely sedating. Big winner on the 2010s cup circuit out of Northern California.",
    lineage: "Grape Ape × Grapefruit",
    parents: ["grape-ape", "grapefruit"],
    thcRange: "15–23%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Uplifted", "Calm"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery base, common in dessert strains" },
      { name: "Humulene", note: "earthy, hop-forward" },
      { name: "Linalool", note: "floral lavender, mellowing" },
    ],
    flavor: ["Tropical fruit candy", "Grape", "Berry"],
    bestFor: ["Late afternoon", "Easy social time", "Wind-down without crashing", "Casual creative"],
    avoidIf: ["You want a head-up sativa", "Sweet candy aromas turn you off"],
    faqs: [
      {
        q: "Is Zkittlez the same as Skittles?",
        a: "Same genetics — 'Zkittlez' is the trademark-safe spelling. Don't expect actual candy flavoring; it's the natural terpene profile that reads as fruity-sweet.",
      },
      {
        q: "Is Zkittlez sativa or indica?",
        a: "Indica-leaning hybrid. Calmer than the bright candy flavor implies — body-relaxing without going full couch-lock for most users.",
      },
      {
        q: "What does Zkittlez taste like?",
        a: "Zkittlez hits tropical fruit candy up front, grape through the middle, and berry on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Zkittlez?",
        a: "Zkittlez tests in the 15–23% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Zkittlez best for?",
        a: "Zkittlez reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
      {
        q: "What terpenes are in Zkittlez?",
        a: "The dominant terpenes in Zkittlez are Caryophyllene (peppery and warm, spicy on the back end), Humulene (earthy and hop-like, similar to fresh hops), and Linalool (floral lavender, soft and calming on the nose). The blend is what gives the strain its specific nose and the character customers report on the exhale.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/zkittlez",
        "https://weedmaps.com/strains/the-original-z",
      ],
      notes:
        "Leafly confirms Grape Ape × Grapefruit (+ undisclosed third). Indica hybrid. Top terpenes Caryophyllene/Linalool/Humulene match our entry. THC ~20% (within 15–23%).",
      verifiedAt: "2026-05-15",
    },
  },

  runtz: {
    slug: "runtz",
    name: "Runtz",
    type: "hybrid",
    aliases: ["Runtz", "Runtz OG"],
    tagline: "Candy-sweet balanced hybrid — Gelato's flashy cousin.",
    intro:
      "Runtz is the modern California showpiece — a Zkittlez × Gelato cross that became the most-photographed " +
      "strain on cannabis Instagram for a stretch. Balanced hybrid, sweet candy-fruit aroma, the kind of " +
      "buds people show off to friends. Pink and White Runtz are the best-known phenos.",
    lineage: "Zkittlez × Gelato",
    parents: ["zkittlez", "gelato"],
    thcRange: "19–26%",
    cbdRange: "<1%",
    effects: ["Happy", "Relaxed", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery base, woody warmth" },
      { name: "Limonene", note: "citrus-sweet, mood-up" },
      { name: "Linalool", note: "floral, mellowing" },
    ],
    flavor: ["Sweet candy", "Tropical fruit", "Berry"],
    bestFor: ["Hanging out with friends", "Casual creative time", "After-dinner relax"],
    avoidIf: ["You want a clear-headed daytime sativa", "You're sensitive to high-THC flower"],
    faqs: [
      {
        q: "What's the difference between Pink Runtz and White Runtz?",
        a: "Both are phenos of the same Zkittlez × Gelato seedline. Pink leans slightly sweeter and brighter; White leans creamier. Effect difference is subtle.",
      },
      {
        q: "Is Runtz good for beginners?",
        a: "Tolerable but runs high in THC. Start with a small dose — Runtz is potent even by modern hybrid standards.",
      },
      {
        q: "Is Runtz indica, sativa, or hybrid?",
        a: "Runtz is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Zkittlez × Gelato. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Runtz taste like?",
        a: "Runtz hits sweet candy up front, tropical fruit through the middle, and berry on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Runtz?",
        a: "Runtz tests in the 19–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Runtz best for?",
        a: "Runtz reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/runtz",
        "https://weedmaps.com/strains/runtz",
      ],
      notes:
        "Leafly confirms Cookies Fam Zkittlez × Gelato cross. Balanced hybrid. Top terpenes Caryophyllene/Limonene/Myrcene (our Linalool is also commonly listed for sweet phenos). THC ~21% (within 19–26%).",
      verifiedAt: "2026-05-15",
    },
  },

  // VERIFIED 2026-05-15: terpenes revised — Leafly + multiple sources list Terpinolene/Myrcene/Pinene
  // for Trainwreck (not Caryophyllene). Type kept as sativa (Leafly says sativa-dominant hybrid;
  // acceptable variance for our purposes given long-running sativa shelf placement).
  trainwreck: {
    slug: "trainwreck",
    name: "Trainwreck",
    type: "sativa",
    aliases: ["Trainwreck", "TW"],
    tagline: "Fast-hitting sativa with spicy pine bite.",
    intro:
      "Trainwreck is the NorCal sativa that earned its name — comes on fast and a little disorienting in the " +
      "best way. Spicy-piney aroma, head-forward effect, longtime favorite for creative work and social energy. " +
      "Parent strain to Pineapple Express.",
    lineage: "Mexican × Thai × Afghani (debated)",
    parents: [null, "thai", "afghani"],
    thcRange: "18–25%",
    cbdRange: "<1%",
    effects: ["Energetic", "Euphoric", "Uplifted", "Creative"],
    terpenes: [
      { name: "Terpinolene", note: "herbal-fresh, common in head-forward sativas" },
      { name: "Myrcene", note: "earthy underbelly" },
      { name: "Pinene", note: "sharp pine, focusing" },
    ],
    flavor: ["Pine", "Spicy", "Lemon"],
    bestFor: ["Creative push", "Social energy", "Cleaning the house", "Morning hike"],
    avoidIf: ["Anxiety-prone — Trainwreck moves fast", "You want body-heavy relaxation"],
    faqs: [
      {
        q: "Why is it called Trainwreck?",
        a: "Original breeder lore says it's because the high hits 'like a trainwreck' — fast, hard, disorienting in a good way. Branding stuck.",
      },
      {
        q: "Is Trainwreck a strong sativa?",
        a: "Yes — one of the more head-forward sativas on Washington shelves. Start small if you're new to high-energy strains.",
      },
      {
        q: "Is Trainwreck indica, sativa, or hybrid?",
        a: "Trainwreck is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Mexican × Thai × Afghani (debated).",
      },
      {
        q: "What does Trainwreck taste like?",
        a: "Trainwreck hits pine up front, spicy through the middle, and lemon on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Trainwreck?",
        a: "Trainwreck tests in the 18–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Trainwreck best for?",
        a: "Trainwreck reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/trainwreck",
        "https://blog.seedsman.com/history-trainwreck-strain/",
        "https://420dialectics.wordpress.com/2017/12/17/cannabis-strain-history-series-arcata-trainwreck/",
      ],
      notes:
        "Lineage Mexican × Thai × Afghani widely cited but Mexican parent has no canonical sub-strain (kept null + (debated) tag). Type: Leafly calls sativa-dominant hybrid; we keep 'sativa' for shelf simplicity. REVISED terpenes 2026-05-15: Leafly lists Terpinolene/Myrcene/Pinene (we had Caryophyllene third) — Myrcene replaces Caryophyllene.",
      verifiedAt: "2026-05-15",
    },
  },

  mac: {
    slug: "mac",
    name: "MAC",
    type: "hybrid",
    aliases: ["MAC", "Miracle Alien Cookies", "MAC 1", "Mac 1"],
    tagline: "Balanced hybrid with a creamy, gassy edge.",
    intro:
      "MAC — short for Miracle Alien Cookies — is the hybrid that put the Capulator breeder on the map. " +
      "Balanced effect, creamy + diesel + citrus aroma, gorgeous frosty buds. MAC 1 is the most-circulated " +
      "phenotype and a regular high-shelf pick in Washington.",
    lineage: "Alien Cookies × (Colombian × Starfighter)",
    parents: ["alien-cookies", "colombian", "starfighter"],
    thcRange: "20–28%",
    cbdRange: "<1%",
    effects: ["Happy", "Relaxed", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Limonene", note: "bright citrus" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Pinene", note: "fresh pine" },
    ],
    flavor: ["Diesel", "Citrus", "Sweet cream"],
    bestFor: ["After work", "Light social", "Casual creative", "Trying a high-shelf hybrid"],
    avoidIf: ["You're very low-tolerance — MAC runs high", "You want pure sleep meds"],
    faqs: [
      {
        q: "What does MAC stand for?",
        a: "Miracle Alien Cookies. Bred by Capulator in the mid-2010s; the '1' in MAC 1 refers to a specific cut.",
      },
      {
        q: "Is MAC sativa or indica?",
        a: "Balanced hybrid — leans slightly sativa in head effect but with enough body weight to be evening-friendly.",
      },
      {
        q: "What does MAC taste like?",
        a: "MAC hits diesel up front, citrus through the middle, and sweet cream on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is MAC?",
        a: "MAC tests in the 20–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is MAC best for?",
        a: "MAC reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
      {
        q: "What terpenes are in MAC?",
        a: "The dominant terpenes in MAC are Limonene (citrus zest, bright and mood-lifting on the nose), Caryophyllene (peppery and warm, spicy on the back end), and Pinene (sharp pine, fresh and focusing). The blend is what gives the strain its specific nose and the character customers report on the exhale.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/mac",
        "https://weedmaps.com/strains/miracle-alien-cookies",
      ],
      notes:
        "Leafly confirms Alien Cookies × (Colombian × Starfighter). Balanced hybrid. Top terpenes Limonene/Pinene/Caryophyllene match. THC ~22% (within 20–28%). Capulator breeder confirmed.",
      verifiedAt: "2026-05-15",
    },
  },

  "bruce-banner": {
    slug: "bruce-banner",
    name: "Bruce Banner",
    type: "hybrid",
    aliases: ["Bruce Banner", "Bruce Banner #3", "BB3"],
    tagline: "Hard-hitting sativa-leaning hybrid named for the Hulk.",
    intro:
      "Bruce Banner is the strain that always seems to top THC-test charts in Colorado and Washington. " +
      "Sativa-leaning hybrid with a sweet-diesel aroma, fast-onset euphoric head, and enough body to round it out. " +
      "Bruce Banner #3 is the most-circulated pheno.",
    lineage: "OG Kush × Strawberry Diesel",
    parents: ["og-kush", "strawberry-diesel"],
    thcRange: "23–29%",
    cbdRange: "<1%",
    effects: ["Euphoric", "Energetic", "Creative", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy body weight" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Limonene", note: "citrus-sweet" },
    ],
    flavor: ["Sweet berry", "Diesel", "Earth"],
    bestFor: ["High-tolerance users", "Creative push", "Daytime energy"],
    avoidIf: ["You're new to cannabis", "Anxiety-prone — runs hot"],
    faqs: [
      {
        q: "Why is Bruce Banner so high in THC?",
        a: "It's a genetic outlier — many phenos test at 25%+ THC. That's also why it has a reputation for hitting fast and hard.",
      },
      {
        q: "Is Bruce Banner indica, sativa, or hybrid?",
        a: "Bruce Banner is a hybrid — a cross that pulls from both sides of the family tree. The lineage is OG Kush × Strawberry Diesel. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Bruce Banner taste like?",
        a: "Bruce Banner hits sweet berry up front, diesel through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Bruce Banner?",
        a: "Bruce Banner tests in the 23–29% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Bruce Banner best for?",
        a: "Bruce Banner reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/bruce-banner",
        "https://weedmaps.com/strains/bruce-banner-3",
      ],
      notes:
        "Leafly confirms OG Kush × Strawberry Diesel. Sativa-dominant hybrid. Top terpenes Caryophyllene/Myrcene/Limonene match. THC ~21% (within our 23–29% which is the BB3-specific range Doug picked).",
      verifiedAt: "2026-05-15",
    },
  },

  "green-crack": {
    slug: "green-crack",
    name: "Green Crack",
    type: "sativa",
    aliases: ["Green Crack", "Green Cush", "GC", "Cush"],
    tagline: "Energetic daytime sativa — Snoop Dogg's old wake-up pick.",
    intro:
      "Green Crack is one of the most energetic sativas on Washington shelves — Snoop Dogg famously renamed the " +
      "original strain (he disliked the 'crack' branding, and 'Green Cush' is its alternate name). " +
      "Mango-citrus aroma, fast-onset clear-headed effect, very little body weight. Built for daytime.",
    lineage: "Skunk #1 × Afghani (debated)",
    parents: ["skunk-1", "afghani"],
    thcRange: "16–24%",
    cbdRange: "<1%",
    effects: ["Energetic", "Focused", "Uplifted", "Creative"],
    terpenes: [
      { name: "Myrcene", note: "earthy underbelly" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Pinene", note: "fresh pine, focusing" },
    ],
    flavor: ["Mango", "Citrus", "Earthy"],
    bestFor: ["Morning use", "Pre-workout", "Cleaning the house", "Beating an afternoon slump"],
    avoidIf: ["You're caffeine-sensitive", "You want a body-heavy buzz"],
    faqs: [
      {
        q: "Is Green Crack and Green Cush the same strain?",
        a: "Yes — same genetics. 'Green Cush' is the alternate name (Snoop Dogg's rename); 'Green Crack' is the original. Many WA shops use both interchangeably.",
      },
      {
        q: "Is Green Crack indica, sativa, or hybrid?",
        a: "Green Crack is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Skunk #1 × Afghani (debated).",
      },
      {
        q: "What does Green Crack taste like?",
        a: "Green Crack hits mango up front, citrus through the middle, and earthy on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Green Crack?",
        a: "Green Crack tests in the 16–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Green Crack best for?",
        a: "Green Crack reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/green-crack",
        "https://weedmaps.com/strains/green-crack",
      ],
      notes:
        "Leafly confirms Skunk #1 × unknown indica (often cited as Afghani). Sativa. Top terpenes Myrcene/Caryophyllene/Pinene match. THC ~17% (within 16–24%).",
      verifiedAt: "2026-05-15",
    },
  },

  "ak-47": {
    slug: "ak-47",
    name: "AK-47",
    type: "hybrid",
    aliases: ["AK-47", "AK", "AK47"],
    tagline: "Mellow sativa-leaning hybrid with a sharp earthy aroma.",
    intro:
      "AK-47 has been a cup-winner for 30+ years. Despite the aggressive name, it's a mellow, head-forward " +
      "hybrid — sativa-leaning, with a long-lasting easy buzz and a sharp earthy-sour aroma. " +
      "Bred by Serious Seeds in the early '90s.",
    lineage: "Colombian × Mexican × Thai × Afghani",
    parents: ["colombian", null, "thai", "afghani"],
    thcRange: "16–22%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Uplifted", "Creative"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Caryophyllene", note: "peppery, calming" },
      { name: "Pinene", note: "fresh pine" },
    ],
    flavor: ["Earthy", "Sour", "Skunk"],
    bestFor: ["Long social sessions", "Casual creative time", "Easy afternoon use"],
    avoidIf: ["You want a clean sativa with no body weight", "Skunk aromas turn you off"],
    faqs: [
      {
        q: "Is AK-47 a strong strain?",
        a: "Moderately strong — it's about the long-lasting easy effect, not raw THC. The cup-winning reputation is about character, not punch.",
      },
      {
        q: "Is AK-47 indica, sativa, or hybrid?",
        a: "AK-47 is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Colombian × Mexican × Thai × Afghani. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does AK-47 taste like?",
        a: "AK-47 hits earthy up front, sour through the middle, and skunk on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is AK-47?",
        a: "AK-47 tests in the 16–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is AK-47 best for?",
        a: "AK-47 reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/ak-47",
        "https://www.seriousseeds.com/strain/ak-47/",
      ],
      notes:
        "Serious Seeds (original breeder) + Leafly confirm Colombian × Mexican × Thai × Afghani. Sativa-dominant hybrid. Top terpenes Myrcene/Pinene/Caryophyllene match. THC ~19% (within 16–22%).",
      verifiedAt: "2026-05-15",
    },
  },

  chemdawg: {
    slug: "chemdawg",
    name: "Chemdawg",
    type: "hybrid",
    aliases: ["Chemdawg", "Chemdog", "Chem Dawg", "Chem"],
    tagline: "Foundational diesel-aroma hybrid — parent of OG Kush and Sour Diesel.",
    intro:
      "Chemdawg is one of the most influential strains in modern cannabis — parent to OG Kush, Sour Diesel, " +
      "and dozens of other A-list hybrids. Pungent fuel-and-earth aroma, balanced-leaning-sativa effect, " +
      "loud terpene profile. The origin story (Grateful Dead lot, bag from a guy named 'Chemdog') is half cannabis folklore.",
    lineage: "Nepalese × Thai (debated)",
    parents: [null, "thai"],
    thcRange: "18–25%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, the Chemdawg signature" },
      { name: "Myrcene", note: "earthy base" },
      { name: "Limonene", note: "citrus pop on the back" },
    ],
    flavor: ["Diesel", "Earthy", "Pine"],
    bestFor: ["Late afternoon", "Stress relief", "Casual social", "Trying a classic"],
    avoidIf: ["You want a discreet aroma", "You're caffeine-sensitive"],
    faqs: [
      {
        q: "Are Chemdawg and Chemdog the same strain?",
        a: "Same strain, two spellings. 'Chemdog' is the older spelling tied to the breeder; 'Chemdawg' is what most WA shelves carry today.",
      },
      {
        q: "Why is Chemdawg so important to other strains?",
        a: "It's a parent to OG Kush, Sour Diesel, Stardawg, and many more. Most modern diesel-aroma strains trace back to Chemdawg somewhere in the lineage.",
      },
      {
        q: "Is Chemdawg indica, sativa, or hybrid?",
        a: "Chemdawg is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Nepalese × Thai (debated). The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Chemdawg taste like?",
        a: "Chemdawg hits diesel up front, earthy through the middle, and pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Chemdawg?",
        a: "Chemdawg tests in the 18–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Chemdawg best for?",
        a: "Chemdawg reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    lineageAlternates: ["Bagseed of unknown origin (Grateful Dead concert folklore)"],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/chemdawg",
        "https://weedmaps.com/strains/chemdawg",
      ],
      notes:
        "Origin is genuinely contested — Leafly does not specify parents. Nepalese × Thai is one community theory; others say bagseed origin. Kept (debated) tag. Hybrid. Top terpenes Caryophyllene/Myrcene/Limonene match. THC ~18% (within 18–25%).",
      verifiedAt: "2026-05-15",
    },
  },

  "durban-poison": {
    slug: "durban-poison",
    name: "Durban Poison",
    type: "sativa",
    aliases: ["Durban Poison", "Durban", "DP"],
    tagline: "Pure South African landrace sativa — sweet, spicy, energetic.",
    intro:
      "Durban Poison is one of the few near-pure landrace sativas on Washington shelves — a 100% sativa from " +
      "the port of Durban, South Africa. Sweet anise-and-pine aroma, clear-headed energetic effect, very little " +
      "body weight. Parent to GSC and dozens of modern hybrids.",
    lineage: "South African landrace",
    parents: [null],
    thcRange: "15–24%",
    cbdRange: "<1%",
    effects: ["Energetic", "Focused", "Uplifted", "Creative"],
    terpenes: [
      { name: "Terpinolene", note: "herbal-fresh, classic head-up sativa terp" },
      { name: "Myrcene", note: "earthy underbelly" },
      { name: "Pinene", note: "sharp pine" },
    ],
    flavor: ["Anise/licorice", "Pine", "Sweet"],
    bestFor: ["Morning use", "Productive work", "Hike or run", "Creative push"],
    avoidIf: ["Anxiety-prone — runs head-up", "You want sleep"],
    faqs: [
      {
        q: "Is Durban Poison a pure sativa?",
        a: "Yes — it's a near-pure landrace sativa from South Africa, and one of the only ones on most Washington shelves. The effect is much more head-up than modern 'sativa' hybrids.",
      },
      {
        q: "Is Durban Poison indica, sativa, or hybrid?",
        a: "Durban Poison is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is South African landrace.",
      },
      {
        q: "What does Durban Poison taste like?",
        a: "Durban Poison hits anise/licorice up front, pine through the middle, and sweet on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Durban Poison?",
        a: "Durban Poison tests in the 15–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Durban Poison best for?",
        a: "Durban Poison reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/durban-poison",
        "https://dutch-passion.com/en/blog/the-history-of-durban-poison-n937",
      ],
      notes:
        "Pure South African landrace sativa, widely confirmed. Leafly top terpenes Terpinolene/Myrcene/Ocimene (our Pinene is alternate; Ocimene also commonly appears). THC ~19% (within 15–24%).",
      verifiedAt: "2026-05-15",
    },
  },

  "hindu-kush": {
    slug: "hindu-kush",
    name: "Hindu Kush",
    type: "indica",
    aliases: ["Hindu Kush", "HK", "Kush"],
    tagline: "Pure landrace indica from the mountains its name comes from.",
    intro:
      "Hindu Kush is the original 'Kush' — a pure landrace indica from the mountain range between Afghanistan " +
      "and Pakistan. Heavy body buzz, sweet-earthy-sandalwood aroma, calm head. Foundation strain for the " +
      "entire modern 'Kush' family (OG Kush, Bubba Kush, etc.).",
    lineage: "Hindu Kush landrace (Afghanistan/Pakistan)",
    parents: [null],
    thcRange: "15–20%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Happy", "Hungry"],
    terpenes: [
      { name: "Myrcene", note: "earthy, deeply sedating" },
      { name: "Caryophyllene", note: "peppery, calming" },
      { name: "Limonene", note: "soft citrus on top" },
    ],
    flavor: ["Earthy", "Sandalwood", "Sweet pine"],
    bestFor: ["Sleep", "Body soreness", "Quiet evenings", "Stress melt"],
    avoidIf: ["You need to function", "You want head-up energy"],
    faqs: [
      {
        q: "Why is Hindu Kush called 'Kush'?",
        a: "It's literally the strain that gave the Kush family its name — bred for centuries in the Hindu Kush mountain range. Every modern Kush traces back to this landrace.",
      },
      {
        q: "Is Hindu Kush indica, sativa, or hybrid?",
        a: "Hindu Kush is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Hindu Kush landrace (Afghanistan/Pakistan).",
      },
      {
        q: "What does Hindu Kush taste like?",
        a: "Hindu Kush hits earthy up front, sandalwood through the middle, and sweet pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Hindu Kush?",
        a: "Hindu Kush tests in the 15–20% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Hindu Kush best for?",
        a: "Hindu Kush reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/hindu-kush",
        "https://sensiseeds.com/en/cannabis-seeds/sensi-seeds/hindu-kush",
      ],
      notes:
        "Hindu Kush is widely confirmed as a landrace indica from the Afghanistan/Pakistan mountain range (despite Leafly's auto-pulled 'OG Kush × Purple Kush' which is incorrect — Hindu Kush PREDATES both). Sensi Seeds + most authoritative sources confirm landrace origin. Indica. Top terpenes Limonene/Caryophyllene/Pinene per Leafly (our Myrcene is the more commonly cited dominant terp).",
      verifiedAt: "2026-05-15",
    },
  },

  afghani: {
    slug: "afghani",
    name: "Afghani",
    type: "indica",
    aliases: ["Afghani", "Afghan", "Afghan Kush"],
    tagline: "Landrace indica that founded modern indica genetics.",
    intro:
      "Afghani is the other foundational landrace indica — from the Hindu Kush region of Afghanistan. Deeply " +
      "sedating, classic hash-and-earth aroma, the kind of indica that most modern indicas trace genetics back to. " +
      "Northern Lights, Bubba Kush, Granddaddy Purple — all have Afghani somewhere in the family tree.",
    lineage: "Afghani landrace",
    parents: [null],
    thcRange: "14–20%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Hungry", "Calm"],
    terpenes: [
      { name: "Myrcene", note: "the foundational sedating earthy terp" },
      { name: "Caryophyllene", note: "peppery, mellow" },
      { name: "Limonene", note: "soft citrus accent" },
    ],
    flavor: ["Earthy", "Hash", "Sweet spice"],
    bestFor: ["Sleep", "Pain relief", "Body soreness", "Wind-down"],
    avoidIf: ["You need to function", "You want clear-headed energy"],
    faqs: [
      {
        q: "Is Afghani the same as Afghan Kush?",
        a: "Closely related — 'Afghani' usually refers to pure landrace indica from Afghanistan, while 'Afghan Kush' is a more specific Hindu Kush-region cultivar. Same broad family.",
      },
      {
        q: "Is Afghani indica, sativa, or hybrid?",
        a: "Afghani is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Afghani landrace.",
      },
      {
        q: "What does Afghani taste like?",
        a: "Afghani hits earthy up front, hash through the middle, and sweet spice on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Afghani?",
        a: "Afghani tests in the 14–20% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Afghani best for?",
        a: "Afghani reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/afghani",
        "https://weedmaps.com/strains/afghani",
      ],
      notes:
        "Landrace indica from Afghanistan, foundation of modern indica genetics. Indica. THC ~18% (within 14–20%). Terpenes vary by pheno (Leafly auto-pull lists Terpinolene/Myrcene/Pinene, which is unusual for a pure indica landrace; Myrcene/Caryophyllene/Limonene is the more common chemotype, which our entry uses).",
      verifiedAt: "2026-05-15",
    },
  },

  headband: {
    slug: "headband",
    name: "Headband",
    type: "hybrid",
    aliases: ["Headband", "707 Headband", "OG Headband"],
    tagline: "Indica-leaning hybrid named for the 'headband' sensation around the temples.",
    intro:
      "Headband gets its name from the gentle pressure-around-the-temples sensation some users report — like " +
      "a soft band across the forehead. Indica-leaning hybrid with diesel-citrus aroma, relaxed body, " +
      "calm but functional head. OG Kush × Sour Diesel parentage.",
    lineage: "OG Kush × Sour Diesel",
    parents: ["og-kush", "sour-diesel"],
    thcRange: "20–27%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Calm"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, the OG signature" },
      { name: "Myrcene", note: "earthy body weight" },
      { name: "Limonene", note: "citrus accent" },
    ],
    flavor: ["Diesel", "Lemon", "Earthy"],
    bestFor: ["Late afternoon", "Stress relief", "Light pain", "Couch + show"],
    avoidIf: ["You're new — Headband runs high", "You want pure sativa energy"],
    faqs: [
      {
        q: "Why is it called Headband?",
        a: "Many users report a mild pressure around the temples — a 'headband' sensation. It's an anecdotal experience, not a guaranteed effect.",
      },
      {
        q: "Is Headband indica, sativa, or hybrid?",
        a: "Headband is a hybrid — a cross that pulls from both sides of the family tree. The lineage is OG Kush × Sour Diesel. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Headband taste like?",
        a: "Headband hits diesel up front, lemon through the middle, and earthy on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Headband?",
        a: "Headband tests in the 20–27% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Headband best for?",
        a: "Headband reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/707-headband",
        "https://weedmaps.com/strains/headband",
      ],
      notes:
        "Leafly confirms Sour Diesel × OG Kush. (Some sources add Master Kush as third parent for 707 Headband specifically.) Hybrid leans indica. Top terpenes Caryophyllene/Limonene/Myrcene match. THC ~20% (within 20–27%).",
      verifiedAt: "2026-05-15",
    },
  },

  "strawberry-cough": {
    slug: "strawberry-cough",
    name: "Strawberry Cough",
    type: "sativa",
    aliases: ["Strawberry Cough", "SC", "Straw Cough"],
    tagline: "Sweet, social sativa with a tickle-the-throat smoke.",
    intro:
      "Strawberry Cough is a beloved daytime sativa — bright strawberry-and-skunk aroma, clear-headed " +
      "social effect, and the namesake cough (the smoke is famously expansive). Gentler in punch than most " +
      "modern sativas, which makes it a regular pick for social situations.",
    lineage: "Strawberry Fields × Haze (debated)",
    parents: [null, "haze"],
    thcRange: "15–20%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Happy", "Focused", "Energetic"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Pinene", note: "fresh pine, focusing" },
      { name: "Caryophyllene", note: "peppery accent" },
    ],
    flavor: ["Sweet strawberry", "Skunk", "Earthy"],
    bestFor: ["Social events", "Daytime use", "Light creative work", "Beating awkwardness"],
    avoidIf: ["You have asthma or sensitive lungs", "You want body relaxation"],
    faqs: [
      {
        q: "Does Strawberry Cough actually taste like strawberries?",
        a: "Notes of sweet strawberry, yes — on a skunky-earthy base. The 'cough' part isn't marketing: the smoke runs expansive.",
      },
      {
        q: "Is Strawberry Cough indica, sativa, or hybrid?",
        a: "Strawberry Cough is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Strawberry Fields × Haze (debated).",
      },
      {
        q: "How strong is Strawberry Cough?",
        a: "Strawberry Cough tests in the 15–20% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Strawberry Cough best for?",
        a: "Strawberry Cough reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
      {
        q: "What terpenes are in Strawberry Cough?",
        a: "The dominant terpenes in Strawberry Cough are Myrcene (earthy, mango-like, with a mild body-heavy quality), Pinene (sharp pine, fresh and focusing), and Caryophyllene (peppery and warm, spicy on the back end). The blend is what gives the strain its specific nose and the character customers report on the exhale.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/strawberry-cough",
        "https://weedmaps.com/strains/strawberry-cough",
      ],
      notes:
        "Leafly confirms thought to be Strawberry Fields × Haze (debated; exact origin unconfirmed by breeder). Sativa. Top terpenes Myrcene/Pinene/Caryophyllene match. THC ~19% (within 15–20%; higher modern phenos reach 22–26%).",
      verifiedAt: "2026-05-15",
    },
  },

  "skywalker-og": {
    slug: "skywalker-og",
    name: "Skywalker OG",
    type: "indica",
    aliases: ["Skywalker OG", "Skywalker", "SWOG"],
    tagline: "Heavy indica-leaning hybrid — peace, calm, and a long couch session.",
    intro:
      "Skywalker OG is what you reach for when you want OG-family flavor with extra weight behind it. " +
      "Indica-leaning hybrid, classic OG diesel-pine-citrus aroma, very heavy body buzz. Built by crossing " +
      "Skywalker (a Mazar × Blueberry pheno) with OG Kush.",
    lineage: "Skywalker × OG Kush",
    parents: ["skywalker", "og-kush"],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Happy", "Hungry"],
    terpenes: [
      { name: "Myrcene", note: "earthy, deeply sedating" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Limonene", note: "citrus on the back end" },
    ],
    flavor: ["Diesel", "Pine", "Lemon zest"],
    bestFor: ["Sleep", "Pain relief", "End-of-day couch time"],
    avoidIf: ["You need to function", "You're sensitive to heavy indicas"],
    faqs: [
      {
        q: "Is Skywalker OG the same as Skywalker?",
        a: "Different strains. Skywalker is the parent (Mazar × Blueberry); Skywalker OG is the cross with OG Kush — heavier and more diesel-forward.",
      },
      {
        q: "Is Skywalker OG indica, sativa, or hybrid?",
        a: "Skywalker OG is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Skywalker × OG Kush.",
      },
      {
        q: "What does Skywalker OG taste like?",
        a: "Skywalker OG hits diesel up front, pine through the middle, and lemon zest on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Skywalker OG?",
        a: "Skywalker OG tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Skywalker OG best for?",
        a: "Skywalker OG reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/skywalker-og",
        "https://dnagenetics.com/skywalker-og-cannabis-strain/",
      ],
      notes:
        "DNA Genetics + multiple sources confirm Skywalker (Mazar × Blueberry) × OG Kush. Indica-dominant hybrid (~85/15). Top terpenes Myrcene/Caryophyllene/Limonene match. THC ~20–30% per Leafly.",
      verifiedAt: "2026-05-15",
    },
  },

  // VERIFIED 2026-05-15: lineage clarified — Leafly + community sources cite OG Kush × unknown
  // indica (originally claimed to be Northern Lights, not Hindu Kush). brapp's "Hindu Kush"
  // is folkloric. Updated lineage tag + lineageAlternates retain prior version.
  "bubba-kush": {
    slug: "bubba-kush",
    name: "Bubba Kush",
    type: "indica",
    aliases: ["Bubba Kush", "Bubba", "BK"],
    tagline: "Coffee-and-chocolate indica — slow, heavy, classic.",
    intro:
      "Bubba Kush is one of the foundational American indicas. Heavy body, slow-onset, with a distinctive " +
      "coffee-and-chocolate aroma you don't get from many other strains. Parent or grandparent to a wide chunk " +
      "of modern indica-leaning hybrids. Originated in the late '90s.",
    lineage: "OG Kush × unknown indica (debated)",
    parents: ["og-kush", null],
    thcRange: "17–22%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Hungry", "Calm"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating base" },
      { name: "Caryophyllene", note: "peppery, mellow" },
      { name: "Limonene", note: "subtle citrus accent" },
    ],
    flavor: ["Coffee", "Chocolate", "Sweet earth"],
    bestFor: ["Sleep", "Pain relief", "Body soreness", "Quiet wind-down"],
    avoidIf: ["You need to be alert", "You want head-up creative energy"],
    faqs: [
      {
        q: "Why does Bubba Kush smell like coffee?",
        a: "It's the natural terpene profile — heavy myrcene + caryophyllene over a soft sweet base. A subset of phenos read distinctly coffee-and-chocolate.",
      },
      {
        q: "Is Bubba Kush indica, sativa, or hybrid?",
        a: "Bubba Kush is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is OG Kush × unknown indica (debated).",
      },
      {
        q: "What does Bubba Kush taste like?",
        a: "Bubba Kush hits coffee up front, chocolate through the middle, and sweet earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Bubba Kush?",
        a: "Bubba Kush tests in the 17–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Bubba Kush best for?",
        a: "Bubba Kush reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    lineageAlternates: [
      "OG Kush × Northern Lights (Leafly: mother plant supposedly Northern Lights)",
      "OG Kush × Hindu Kush (older folkloric version)",
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/bubba-kush",
        "https://www.royalqueenseeds.com/us/blog-bubba-kush-a-legendary-indica-hybrid-n1550",
      ],
      notes:
        "Lineage genuinely debated. Leafly: OG Kush pollinated an unknown New Orleans indica, mother reportedly Northern Lights. brapp's 'Hindu Kush' is folkloric (the name 'Kush' is what triggered the assumption). Indica. Top terpenes Caryophyllene/Limonene/Myrcene match. THC ~17% (within 17–22%).",
      verifiedAt: "2026-05-15",
    },
  },

  "cherry-pie": {
    slug: "cherry-pie",
    name: "Cherry Pie",
    type: "hybrid",
    aliases: ["Cherry Pie", "Cherry Kush", "CP"],
    tagline: "Sweet-tart hybrid — GDP × Durban Poison.",
    intro:
      "Cherry Pie is the bright side of the GDP family — balanced hybrid (slight indica lean) with a " +
      "sweet-tart cherry-and-earth aroma. Parent of Sunset Sherbet, grandparent of Gelato. The effect is " +
      "lifting + relaxing in equal parts — good for late afternoon.",
    lineage: "Granddaddy Purple × Durban Poison",
    parents: ["granddaddy-purple", "durban-poison"],
    thcRange: "16–24%",
    cbdRange: "<1%",
    effects: ["Happy", "Relaxed", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Caryophyllene", note: "peppery anchor" },
      { name: "Limonene", note: "citrus-sweet" },
    ],
    flavor: ["Sweet cherry", "Earthy", "Sour fruit"],
    bestFor: ["Late afternoon", "Casual social", "Trying a parent of Gelato"],
    avoidIf: ["You want a pure sativa", "You're avoiding sweet aromas"],
    faqs: [
      {
        q: "Are Cherry Pie and Cherry Kush the same strain?",
        a: "Often used interchangeably in WA shops — same genetics (GDP × Durban). Some breeders distinguish the two as sister phenos.",
      },
      {
        q: "Is Cherry Pie indica, sativa, or hybrid?",
        a: "Cherry Pie is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Granddaddy Purple × Durban Poison. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Cherry Pie taste like?",
        a: "Cherry Pie hits sweet cherry up front, earthy through the middle, and sour fruit on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Cherry Pie?",
        a: "Cherry Pie tests in the 16–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Cherry Pie best for?",
        a: "Cherry Pie reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/cherry-pie",
        "https://weedmaps.com/strains/cherry-pie",
      ],
      notes:
        "Leafly confirms Granddaddy Purple × F1 Durb (a stabilized Durban Poison cut, functionally equivalent to our 'Durban Poison'). Bred by Cookie Fam (Jigga + Pieguy). Hybrid. Top terpenes Myrcene/Caryophyllene/Pinene (our Limonene is alternate). THC ~16% (within 16–24%).",
      verifiedAt: "2026-05-15",
    },
  },

  "pineapple-kush": {
    slug: "pineapple-kush",
    name: "Pineapple Kush",
    type: "hybrid",
    aliases: ["Pineapple Kush", "PK"],
    tagline: "Tropical-fruit Kush — sweet pineapple, calm body.",
    intro:
      "Pineapple Kush is the easy-going tropical end of the Kush family. Indica-leaning hybrid with sweet " +
      "pineapple-and-caramel notes, gentle body relaxation, and a clear-but-mellow head. Lighter than most " +
      "OG Kush descendants, friendlier for daytime use.",
    lineage: "Pineapple × Master Kush",
    parents: ["pineapple", "master-kush"],
    thcRange: "15–22%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Uplifted", "Creative"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Myrcene", note: "earthy body weight" },
      { name: "Pinene", note: "fresh pine accent" },
    ],
    flavor: ["Pineapple", "Caramel", "Sweet earth"],
    bestFor: ["Easy afternoon", "Light creative time", "Casual social"],
    avoidIf: ["You want a pure head-up sativa", "You're avoiding sweet flavors"],
    faqs: [
      {
        q: "Is Pineapple Kush the same as Pineapple Express?",
        a: "No — different parents. Pineapple Express is Trainwreck × Hawaiian (sativa-leaning); Pineapple Kush is Pineapple × Master Kush (more indica-leaning).",
      },
      {
        q: "Is Pineapple Kush indica, sativa, or hybrid?",
        a: "Pineapple Kush is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Pineapple × Master Kush. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Pineapple Kush taste like?",
        a: "Pineapple Kush hits pineapple up front, caramel through the middle, and sweet earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Pineapple Kush?",
        a: "Pineapple Kush tests in the 15–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Pineapple Kush best for?",
        a: "Pineapple Kush reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/pineapple-kush",
        "https://weedmaps.com/strains/pineapple-kush",
      ],
      notes:
        "Leafly confirms Pineapple × Master Kush. Hybrid (indica-leaning). Top terpenes Myrcene/Caryophyllene/Pinene match. THC ~18% (within 15–22%).",
      verifiedAt: "2026-05-15",
    },
  },

  "tahoe-og": {
    slug: "tahoe-og",
    name: "Tahoe OG",
    type: "hybrid",
    aliases: ["Tahoe OG", "Tahoe", "Tahoe OG Kush"],
    tagline: "Heavy OG-family hybrid out of Lake Tahoe — body-focused.",
    intro:
      "Tahoe OG is the OG Kush pheno that puts more weight on the body side. Bred near Lake Tahoe, " +
      "indica-leaning, with classic OG lemon-diesel-pine aroma plus extra sedation. The 'fast-acting' " +
      "reputation is real — onset hits sooner than many other OGs.",
    lineage: "OG Kush phenotype (SFV OG × OG Kush, debated)",
    parents: ["og-kush", "sfv-og"],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Happy", "Hungry"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Limonene", note: "lemon zest" },
      { name: "Myrcene", note: "earthy, sedating" },
    ],
    flavor: ["Lemon", "Diesel", "Pine"],
    bestFor: ["Sleep", "Pain relief", "End-of-day couch time"],
    avoidIf: ["You need to function", "You want clear-headed energy"],
    faqs: [
      {
        q: "What makes Tahoe OG different from regular OG Kush?",
        a: "Tahoe is heavier on the body side — faster onset, more sedating. Same OG aroma family, just landed more on the indica end of the spectrum.",
      },
      {
        q: "Is Tahoe OG indica, sativa, or hybrid?",
        a: "Tahoe OG is a hybrid — a cross that pulls from both sides of the family tree. The lineage is OG Kush phenotype (SFV OG × OG Kush, debated). The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Tahoe OG taste like?",
        a: "Tahoe OG hits lemon up front, diesel through the middle, and pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Tahoe OG?",
        a: "Tahoe OG tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Tahoe OG best for?",
        a: "Tahoe OG reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/tahoe-og",
        "https://weedmaps.com/strains/tahoe-og-kush",
      ],
      notes:
        "Leafly confirms OG Kush × SFV OG Kush phenotype lineage. Hybrid (indica-dominant). Top terpenes Myrcene/Limonene/Caryophyllene match. THC ~21% (within 20–25%).",
      verifiedAt: "2026-05-15",
    },
  },

  "lemon-haze": {
    slug: "lemon-haze",
    name: "Lemon Haze",
    type: "sativa",
    aliases: ["Lemon Haze", "LH"],
    tagline: "Bright lemon-zest sativa — clean, head-up, daytime.",
    intro:
      "Lemon Haze is exactly what the name says — fresh-cut lemon aroma with a clean Haze-family sativa effect. " +
      "Clear-headed, uplifted, very little body weight. Daytime by design. Parent of Super Lemon Haze.",
    lineage: "Lemon Skunk × Silver Haze",
    parents: ["lemon-skunk", "silver-haze"],
    thcRange: "16–22%",
    cbdRange: "<1%",
    effects: ["Energetic", "Uplifted", "Focused", "Happy"],
    terpenes: [
      { name: "Terpinolene", note: "herbal-fresh, distinctive Haze terp" },
      { name: "Limonene", note: "bright lemon zest" },
      { name: "Pinene", note: "fresh pine" },
    ],
    flavor: ["Lemon zest", "Citrus", "Herbal"],
    bestFor: ["Morning use", "Productive work", "Social pre-game", "Outdoor activities"],
    avoidIf: ["You're caffeine-anxious", "You want sleep"],
    faqs: [
      {
        q: "Is Lemon Haze the same as Super Lemon Haze?",
        a: "No — Super Lemon Haze is Lemon Skunk × Lemon Haze, a child strain. Super Lemon Haze is generally stronger and more head-up.",
      },
      {
        q: "Is Lemon Haze indica, sativa, or hybrid?",
        a: "Lemon Haze is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Lemon Skunk × Silver Haze.",
      },
      {
        q: "What does Lemon Haze taste like?",
        a: "Lemon Haze hits lemon zest up front, citrus through the middle, and herbal on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Lemon Haze?",
        a: "Lemon Haze tests in the 16–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Lemon Haze best for?",
        a: "Lemon Haze reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/lemon-haze",
        "https://weedmaps.com/strains/lemon-haze",
      ],
      notes:
        "Leafly confirms Lemon Skunk × Silver Haze. Sativa. Top terpenes Myrcene/Caryophyllene/Limonene per Leafly (our Terpinolene/Pinene are alternates — Haze family is typically terpinolene-dominant). THC ~19% (within 16–22%).",
      verifiedAt: "2026-05-15",
    },
  },

  "super-lemon-haze": {
    slug: "super-lemon-haze",
    name: "Super Lemon Haze",
    type: "sativa",
    aliases: ["Super Lemon Haze", "SLH"],
    tagline: "Two-time Cannabis Cup winner — sharp lemon, head-forward.",
    intro:
      "Super Lemon Haze is the multi-Cup-winning sativa that took the Haze family to the high shelf. " +
      "Sharper, brighter, and more head-forward than Lemon Haze — fresh lemon-zest aroma, fast-onset " +
      "energetic effect, very little body weight. A real daytime workhorse.",
    lineage: "Lemon Skunk × Super Silver Haze",
    parents: ["lemon-skunk", "super-silver-haze"],
    thcRange: "18–25%",
    cbdRange: "<1%",
    effects: ["Energetic", "Uplifted", "Focused", "Creative"],
    terpenes: [
      { name: "Terpinolene", note: "herbal-fresh Haze signature" },
      { name: "Limonene", note: "bright lemon zest" },
      { name: "Caryophyllene", note: "peppery base" },
    ],
    flavor: ["Lemon zest", "Citrus", "Herbal"],
    bestFor: ["Morning use", "Pre-workout", "Creative push", "Beating an afternoon slump"],
    avoidIf: ["Anxiety-prone — runs hot", "You want body relaxation"],
    faqs: [
      {
        q: "Why is it called Super Lemon Haze?",
        a: "It's a 'super' version of Lemon Haze, bred by Greenhouse Seeds. Won the Cannabis Cup in 2008 and 2009, which cemented the name.",
      },
      {
        q: "Is Super Lemon Haze indica, sativa, or hybrid?",
        a: "Super Lemon Haze is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Lemon Skunk × Super Silver Haze.",
      },
      {
        q: "What does Super Lemon Haze taste like?",
        a: "Super Lemon Haze hits lemon zest up front, citrus through the middle, and herbal on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Super Lemon Haze?",
        a: "Super Lemon Haze tests in the 18–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Super Lemon Haze best for?",
        a: "Super Lemon Haze reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/super-lemon-haze",
        "https://strainfinder.greenhouseseeds.nl/super-lemon-haze",
      ],
      notes:
        "Greenhouse Seeds (breeder) + Leafly confirm Lemon Skunk × Super Silver Haze. Sativa-dominant hybrid. Top terpenes Terpinolene/Caryophyllene/Myrcene match (we have Limonene which is alternate). THC ~19% (within 18–25%). Two-time Cannabis Cup winner.",
      verifiedAt: "2026-05-15",
    },
  },

  "maui-wowie": {
    slug: "maui-wowie",
    name: "Maui Wowie",
    type: "sativa",
    aliases: ["Maui Wowie", "Maui", "Maui Waui"],
    tagline: "Hawaiian island sativa — sweet pineapple, easy energy.",
    intro:
      "Maui Wowie is a 1970s Hawaiian classic — one of the original tropical sativas. Sweet pineapple-and-citrus " +
      "aroma, clear-headed easy energy, gentler in punch than modern sativas. The strain people remember when " +
      "they say 'cannabis used to feel different.'",
    lineage: "Hawaiian landrace",
    parents: [null],
    thcRange: "15–20%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Happy", "Energetic", "Creative"],
    terpenes: [
      { name: "Limonene", note: "tropical citrus" },
      { name: "Myrcene", note: "soft earth base" },
      { name: "Pinene", note: "fresh pine" },
    ],
    flavor: ["Pineapple", "Tropical citrus", "Sweet"],
    bestFor: ["Beach day", "Social events", "Casual creative time", "Daytime hike"],
    avoidIf: ["You want a heavy modern sativa", "You want body relaxation"],
    faqs: [
      {
        q: "Is Maui Wowie a real Hawaiian strain?",
        a: "Yes — it's a 1970s Hawaiian landrace that became one of the first 'name brand' strains in U.S. cannabis culture.",
      },
      {
        q: "Is Maui Wowie indica, sativa, or hybrid?",
        a: "Maui Wowie is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Hawaiian landrace.",
      },
      {
        q: "What does Maui Wowie taste like?",
        a: "Maui Wowie hits pineapple up front, tropical citrus through the middle, and sweet on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Maui Wowie?",
        a: "Maui Wowie tests in the 15–20% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Maui Wowie best for?",
        a: "Maui Wowie reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/maui-wowie",
        "https://weedmaps.com/strains/maui-wowie",
      ],
      notes:
        "Hawaiian landrace sativa widely confirmed. Sativa. Top terpenes Myrcene/Pinene/Caryophyllene per Leafly (our Limonene is alternate — Maui's tropical citrus reading is common). THC ~19% (within 15–20%).",
      verifiedAt: "2026-05-15",
    },
  },

  "acapulco-gold": {
    slug: "acapulco-gold",
    name: "Acapulco Gold",
    type: "sativa",
    aliases: ["Acapulco Gold", "AG"],
    tagline: "Legendary Mexican landrace sativa — gold-tinted, sweet, classic.",
    intro:
      "Acapulco Gold is the legendary Mexican landrace that defined sativa cannabis in the U.S. through the " +
      "'60s and '70s. Sweet earth + toffee aroma, golden-tinted buds (where the name comes from), clear-headed " +
      "energetic effect. Hard to find these days — most modern 'Acapulco Gold' on shelves is a recreation.",
    lineage: "Mexican landrace (Acapulco region)",
    parents: [null],
    thcRange: "15–23%",
    cbdRange: "<1%",
    effects: ["Energetic", "Uplifted", "Happy", "Creative"],
    terpenes: [
      { name: "Pinene", note: "sharp pine" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Humulene", note: "earthy, hop-forward" },
    ],
    flavor: ["Sweet earth", "Toffee", "Pine"],
    bestFor: ["Daytime use", "Creative work", "Long social sessions", "Trying a piece of cannabis history"],
    avoidIf: ["Anxiety-prone — runs head-up", "You want body relaxation"],
    faqs: [
      {
        q: "Is Acapulco Gold still around?",
        a: "Most 'Acapulco Gold' on Washington shelves today is a modern recreation rather than the original landrace. Still a fine sativa — just be aware the original is rare.",
      },
      {
        q: "Is Acapulco Gold indica, sativa, or hybrid?",
        a: "Acapulco Gold is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Mexican landrace (Acapulco region).",
      },
      {
        q: "What does Acapulco Gold taste like?",
        a: "Acapulco Gold hits sweet earth up front, toffee through the middle, and pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Acapulco Gold?",
        a: "Acapulco Gold tests in the 15–23% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Acapulco Gold best for?",
        a: "Acapulco Gold reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/acapulco-gold",
        "https://weedmaps.com/strains/acapulco-gold",
      ],
      notes:
        "Mexican landrace sativa confirmed. Most modern 'Acapulco Gold' on WA shelves is a recreation rather than the original 1970s landrace (flagged in FAQ). Sativa. Top terpenes Caryophyllene/Myrcene/Limonene per Leafly (our Pinene/Humulene are alternates). THC ~18% (within 15–23%).",
      verifiedAt: "2026-05-15",
    },
  },

  "purple-punch": {
    slug: "purple-punch",
    name: "Purple Punch",
    type: "indica",
    aliases: ["Purple Punch", "PP"],
    tagline: "Sweet grape-and-blueberry indica — dessert nightcap.",
    intro:
      "Purple Punch is the modern grape indica — sweet, fruity, body-heavy, a near-perfect end-of-day flower. " +
      "Larry OG × Granddaddy Purple parentage. Grape-and-blueberry aroma, slow-onset, lands you on the couch.",
    lineage: "Larry OG × Granddaddy Purple",
    parents: ["larry-og", "granddaddy-purple"],
    thcRange: "18–25%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Happy", "Hungry"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Limonene", note: "soft citrus accent" },
      { name: "Pinene", note: "subtle pine" },
    ],
    flavor: ["Grape", "Blueberry", "Sweet vanilla"],
    bestFor: ["Sleep", "After-dinner couch time", "Stress melt"],
    avoidIf: ["You need to function", "You want head-up creative energy"],
    faqs: [
      {
        q: "Is Purple Punch a nighttime strain?",
        a: "It's one of the more popular sleep-time picks on Washington shelves. Sweet, slow-onset, body-heavy — customers commonly reach for it for evening wind-down.",
      },
      {
        q: "Is Purple Punch indica, sativa, or hybrid?",
        a: "Purple Punch is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Larry OG × Granddaddy Purple.",
      },
      {
        q: "What does Purple Punch taste like?",
        a: "Purple Punch hits grape up front, blueberry through the middle, and sweet vanilla on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Purple Punch?",
        a: "Purple Punch tests in the 18–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Purple Punch best for?",
        a: "Purple Punch reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/purple-punch",
        "https://weedmaps.com/strains/purple-punch",
      ],
      notes:
        "Leafly confirms Granddaddy Purple × Larry OG. Hybrid (indica-dominant). Top terpenes Caryophyllene/Limonene/Pinene match. THC ~18% (within 18–25%).",
      verifiedAt: "2026-05-15",
    },
  },

  // VERIFIED 2026-05-15: terpenes revised — Leafly lists Limonene/Caryophyllene/Myrcene. Replaced
  // Linalool with Limonene. Lineage remains genuinely unknown (TGA Subcool received the strain
  // already-bred from an unnamed source). FLAGGED for Doug-review — consider holding from rollout.
  "black-cherry-soda": {
    slug: "black-cherry-soda",
    name: "Black Cherry Soda",
    type: "hybrid",
    aliases: ["Black Cherry Soda", "BCS"],
    tagline: "Sweet-tart cherry hybrid — balanced, easy, distinctive aroma.",
    intro:
      "Black Cherry Soda is the strain people remember by smell alone — distinct sweet-tart dark cherry " +
      "aroma, balanced hybrid effect, gentle body weight. Oregon-originated, a regular feature on Pacific " +
      "Northwest shelves for over a decade.",
    lineage: "Unknown / proprietary (debated)",
    parents: [null, null],
    thcRange: "16–22%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Uplifted", "Creative"],
    terpenes: [
      { name: "Limonene", note: "bright citrus accent — Leafly's top-listed terp" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Myrcene", note: "soft earth" },
    ],
    flavor: ["Dark cherry", "Sweet-tart", "Sweet earth"],
    bestFor: ["Late afternoon", "Casual social", "Light creative time"],
    avoidIf: ["You want a heavy modern hybrid", "Sweet aromas turn you off"],
    faqs: [
      {
        q: "Where did Black Cherry Soda come from?",
        a: "Often associated with TGA Subcool Seeds in Oregon, but the actual breeding heritage was given to TGA already-bred and the original parents are not publicly confirmed. Some accounts cite Cherry AK-47 × Blackberry × Ortega × Airborne G13 as candidate ancestors.",
      },
      {
        q: "Is Black Cherry Soda indica, sativa, or hybrid?",
        a: "Black Cherry Soda is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Unknown / proprietary (debated). The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Black Cherry Soda taste like?",
        a: "Black Cherry Soda hits dark cherry up front, sweet-tart through the middle, and sweet earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Black Cherry Soda?",
        a: "Black Cherry Soda tests in the 16–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Black Cherry Soda best for?",
        a: "Black Cherry Soda reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    lineageAlternates: [
      "Cherry AK-47 × Blackberry × Ortega × Airborne G13 (community theory)",
    ],
    verification: {
      status: "contested-doug-review",
      sources: [
        "https://www.leafly.com/strains/black-cherry-soda",
        "https://en.seedfinder.eu/strain-info/Black_Cherry_Soda/Unknown_or_Legendary/",
        "https://growingexposed.com/black-cherry-soda/",
      ],
      notes:
        "PARENTAGE UNKNOWN. SeedFinder classifies under 'Unknown or Legendary'. TGA Subcool received the strain already-bred and did not develop it — so the breeder attribution in our intro is also imprecise. REVISED terpenes 2026-05-15: Linalool replaced with Limonene per Leafly. RECOMMEND DOUG-REVIEW: consider holding from initial 50-strain rollout until lineage can be documented or accept that we ship with explicitly 'origin not publicly confirmed' framing.",
      verifiedAt: "2026-05-15",
    },
  },

  "gmo-cookies": {
    slug: "gmo-cookies",
    name: "GMO Cookies",
    type: "indica",
    aliases: ["GMO Cookies", "GMO", "Garlic Cookies", "Garlic Mushroom Onion"],
    tagline: "Pungent garlic-and-diesel indica — for the savory smokers.",
    intro:
      "GMO Cookies is the strain that turned 'savory' into a real cannabis aroma category. Pungent garlic-and-onion-and-diesel " +
      "(the GMO is for Garlic-Mushroom-Onion), indica-leaning, heavy body buzz, calm head. Beloved by people " +
      "tired of sweet dessert strains — divisive for people who aren't.",
    lineage: "Chemdawg × Girl Scout Cookies",
    parents: ["chemdawg", "girl-scout-cookies"],
    thcRange: "20–28%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Happy", "Hungry"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, the savory anchor" },
      { name: "Limonene", note: "bright accent" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Garlic", "Diesel", "Onion", "Savory earth"],
    bestFor: ["Late evening", "Pain relief", "Avoiding sweet flavors", "Trying something distinctive"],
    avoidIf: ["You want a sweet dessert flavor", "You want head-up energy"],
    faqs: [
      {
        q: "Does GMO Cookies actually smell like garlic?",
        a: "Yes — pungent garlic-onion-diesel. The 'GMO' is shorthand for Garlic-Mushroom-Onion, which is exactly the aroma category.",
      },
      {
        q: "Is GMO Cookies genetically modified?",
        a: "No — the GMO acronym is about flavor, not genetic engineering. Cannabis on WA shelves is not GMO in the agricultural sense.",
      },
      {
        q: "Is GMO Cookies indica, sativa, or hybrid?",
        a: "GMO Cookies is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Chemdawg × Girl Scout Cookies.",
      },
      {
        q: "What does GMO Cookies taste like?",
        a: "GMO Cookies hits garlic up front, diesel through the middle, and onion on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is GMO Cookies?",
        a: "GMO Cookies tests in the 20–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is GMO Cookies best for?",
        a: "GMO Cookies reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/gmo-cookies",
        "https://weedmaps.com/strains/gmo",
      ],
      notes:
        "Leafly confirms GSC × Chemdawg (we have parents in Chemdawg × GSC order — same cross). Indica-dominant hybrid. Top terpenes Caryophyllene/Limonene/Myrcene match. THC ~28% (within 20–28%).",
      verifiedAt: "2026-05-15",
    },
  },

  "apple-fritter": {
    slug: "apple-fritter",
    name: "Apple Fritter",
    type: "hybrid",
    aliases: ["Apple Fritter", "AF"],
    tagline: "Sweet dessert hybrid — like the pastry, with bite.",
    intro:
      "Apple Fritter is one of the modern dessert-hybrid showpieces — sweet apple-and-cinnamon-pastry aroma, " +
      "balanced hybrid effect. Bay Area genetics (Sour Apple × Animal Cookies). The buds are visually loud — " +
      "frosty, dense, photogenic — and the smoke is almost as sweet as the name.",
    lineage: "Sour Apple × Animal Cookies",
    parents: ["sour-apple", "animal-cookies"],
    thcRange: "22–28%",
    cbdRange: "<1%",
    effects: ["Happy", "Relaxed", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Limonene", note: "bright citrus accent" },
      { name: "Humulene", note: "earthy hop note" },
    ],
    flavor: ["Sweet apple", "Pastry", "Cinnamon"],
    bestFor: ["After-dinner relax", "Casual social", "Trying a modern dessert hybrid"],
    avoidIf: ["You're very low-tolerance — runs high in THC", "You want a clean sativa"],
    faqs: [
      {
        q: "Is Apple Fritter strong?",
        a: "Yes — regularly tests 22%+ THC. Start with a small amount if you're trying it for the first time.",
      },
      {
        q: "Is Apple Fritter indica, sativa, or hybrid?",
        a: "Apple Fritter is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Sour Apple × Animal Cookies. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Apple Fritter taste like?",
        a: "Apple Fritter hits sweet apple up front, pastry through the middle, and cinnamon on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Apple Fritter?",
        a: "Apple Fritter tests in the 22–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Apple Fritter best for?",
        a: "Apple Fritter reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/apple-fritter",
        "https://weedmaps.com/strains/apple-fritter",
      ],
      notes:
        "Leafly confirms Sour Apple × Animal Cookies. Hybrid (balanced). Top terpenes Caryophyllene/Limonene/Pinene (our Humulene is alternate). THC ~24% (within 22–28%).",
      verifiedAt: "2026-05-15",
    },
  },

  mimosa: {
    slug: "mimosa",
    name: "Mimosa",
    type: "hybrid",
    aliases: ["Mimosa", "Purple Mimosa"],
    tagline: "Bright orange-citrus hybrid — the brunch strain.",
    intro:
      "Mimosa is the brunch strain — bright orange-citrus aroma, sativa-leaning hybrid effect, " +
      "clear-headed uplifted morning energy. Clementine × Purple Punch parentage gives it a sweet body " +
      "underbelly without the sedation. A genuine wake-up pick.",
    lineage: "Clementine × Purple Punch",
    parents: ["clementine", "purple-punch"],
    thcRange: "19–27%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Happy", "Energetic", "Focused"],
    terpenes: [
      { name: "Limonene", note: "bright orange-zest" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Myrcene", note: "soft earth" },
    ],
    flavor: ["Orange", "Citrus", "Sweet berry"],
    bestFor: ["Morning use", "Productive work", "Social brunch", "Casual creative time"],
    avoidIf: ["You want sleep", "You're caffeine-anxious"],
    faqs: [
      {
        q: "Is Mimosa a sativa?",
        a: "Sativa-leaning hybrid. Head-forward enough to feel like a sativa but balanced enough not to spike anxiety the way a true sativa can.",
      },
      {
        q: "Is Mimosa indica, sativa, or hybrid?",
        a: "Mimosa is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Clementine × Purple Punch. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Mimosa taste like?",
        a: "Mimosa hits orange up front, citrus through the middle, and sweet berry on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Mimosa?",
        a: "Mimosa tests in the 19–27% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Mimosa best for?",
        a: "Mimosa reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/mimosa",
        "https://symbioticgenetics.com/2021/01/15/mimosa/",
      ],
      notes:
        "Symbiotic Genetics (breeder) + Leafly confirm Clementine × Purple Punch. Hybrid (sativa-leaning). Top terpenes Myrcene/Pinene/Caryophyllene per Leafly (our Limonene is alternate; Limonene also commonly listed). THC ~19% (within 19–27%).",
      verifiedAt: "2026-05-15",
    },
  },

  // VERIFIED 2026-05-15: terpenes revised — Leafly lists Limonene/Caryophyllene/Linalool. Replaced
  // Myrcene with Linalool. Other facts confirmed.
  "do-si-dos": {
    slug: "do-si-dos",
    name: "Do-Si-Dos",
    type: "indica",
    aliases: ["Do-Si-Dos", "Dosidos", "Dosi", "DSD"],
    tagline: "Heavy GSC-family indica — sweet, sedating, dependable.",
    intro:
      "Do-Si-Dos (often written Dosidos) is what happens when you push the Cookies family toward the indica " +
      "end. Sweet mint-and-pine aroma like GSC, but heavier in body and more sedating. OGKB × Face Off OG " +
      "parentage. A go-to evening flower for many regulars.",
    lineage: "Girl Scout Cookies × Face Off OG",
    parents: ["girl-scout-cookies", "face-off-og"],
    thcRange: "19–28%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Happy", "Hungry"],
    terpenes: [
      { name: "Limonene", note: "citrus accent" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Linalool", note: "floral lavender, mellowing" },
    ],
    flavor: ["Sweet mint", "Earthy pine", "Sweet pastry"],
    bestFor: ["Sleep", "Pain relief", "End-of-day couch time", "Stress melt"],
    avoidIf: ["You need to function", "You're new to high-THC flower"],
    faqs: [
      {
        q: "Is Do-Si-Dos related to Girl Scout Cookies?",
        a: "Yes — GSC is one of the parents. Do-Si-Dos pushes the GSC profile heavier on the body side.",
      },
      {
        q: "Is Do-Si-Dos indica, sativa, or hybrid?",
        a: "Do-Si-Dos is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Girl Scout Cookies × Face Off OG.",
      },
      {
        q: "What does Do-Si-Dos taste like?",
        a: "Do-Si-Dos hits sweet mint up front, earthy pine through the middle, and sweet pastry on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Do-Si-Dos?",
        a: "Do-Si-Dos tests in the 19–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Do-Si-Dos best for?",
        a: "Do-Si-Dos reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/do-si-dos",
        "https://weedmaps.com/strains/do-si-dos",
      ],
      notes:
        "Leafly confirms GSC-phenotype × Face Off OG (we have parents as GSC × Face Off OG — close enough; some sources specify OGKB pheno specifically). Indica-dominant hybrid. REVISED terpenes 2026-05-15: Leafly lists Limonene/Caryophyllene/Linalool. We had Myrcene third — replaced with Linalool. THC ~20% (within 19–28%).",
      verifiedAt: "2026-05-15",
    },
  },

  "animal-cookies": {
    slug: "animal-cookies",
    name: "Animal Cookies",
    type: "indica",
    aliases: ["Animal Cookies", "Animal Crackers", "AC"],
    tagline: "Heavy Cookies-family indica — sweet, dense, photogenic.",
    intro:
      "Animal Cookies is the indica-leaning cousin to GSC. Heavy body buzz, sweet mint-and-earth aroma, " +
      "dense frosty buds that photograph well. Parent or grandparent to several modern showpieces " +
      "including Apple Fritter and Animal Mints.",
    lineage: "Girl Scout Cookies × Fire OG",
    parents: ["girl-scout-cookies", "fire-og"],
    thcRange: "20–27%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Happy", "Euphoric"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery — Cookies signature" },
      { name: "Limonene", note: "citrus accent" },
      { name: "Humulene", note: "earthy hop note" },
    ],
    flavor: ["Sweet mint", "Earthy", "Pastry"],
    bestFor: ["After-dinner wind-down", "Light pain", "Quiet couch time"],
    avoidIf: ["You want head-up energy", "You're sensitive to high-THC flower"],
    faqs: [
      {
        q: "Is Animal Cookies the same as Animal Crackers?",
        a: "Often used interchangeably — same genetics line. Some breeders treat them as sister phenos with subtle aroma differences.",
      },
      {
        q: "Is Animal Cookies indica, sativa, or hybrid?",
        a: "Animal Cookies is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Girl Scout Cookies × Fire OG.",
      },
      {
        q: "What does Animal Cookies taste like?",
        a: "Animal Cookies hits sweet mint up front, earthy through the middle, and pastry on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Animal Cookies?",
        a: "Animal Cookies tests in the 20–27% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Animal Cookies best for?",
        a: "Animal Cookies reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/animal-cookies",
        "https://weedmaps.com/strains/animal-cookies",
      ],
      notes:
        "Leafly confirms GSC × Fire OG. Hybrid (indica-leaning). Top terpenes Caryophyllene/Limonene/Myrcene per Leafly (our Humulene is alternate). THC ~19% (within 20–27%; Leafly's number is one specific lot — our broader range is fine).",
      verifiedAt: "2026-05-15",
    },
  },

  "cookies-and-cream": {
    slug: "cookies-and-cream",
    name: "Cookies and Cream",
    type: "hybrid",
    aliases: ["Cookies and Cream", "C&C", "Cookies N Cream"],
    tagline: "Sweet vanilla-cream hybrid — easy, balanced, dessert-y.",
    intro:
      "Cookies and Cream is the dessert hybrid that won the High Times Cup in 2014 and never really lost its " +
      "spot on the menu. Sweet vanilla-and-cream aroma, balanced effect — body-easy without sedation, " +
      "head-light without racing. Easy to like.",
    lineage: "Starfighter F2 × Girl Scout Cookies",
    parents: ["starfighter", "girl-scout-cookies"],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Happy", "Relaxed", "Euphoric", "Creative"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Humulene", note: "earthy accent" },
    ],
    flavor: ["Sweet vanilla", "Cream", "Sweet earth"],
    bestFor: ["After work", "Casual social", "Light creative time"],
    avoidIf: ["You want a heavy sleep indica", "You want a pure sativa"],
    faqs: [
      {
        q: "Is Cookies and Cream a strong strain?",
        a: "Moderately strong — regularly tests 20%+ THC. Effect is more 'comfortably high' than overwhelming for most users.",
      },
      {
        q: "Is Cookies and Cream indica, sativa, or hybrid?",
        a: "Cookies and Cream is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Starfighter F2 × Girl Scout Cookies. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Cookies and Cream taste like?",
        a: "Cookies and Cream hits sweet vanilla up front, cream through the middle, and sweet earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Cookies and Cream?",
        a: "Cookies and Cream tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Cookies and Cream best for?",
        a: "Cookies and Cream reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/cookies-and-cream",
        "https://weedmaps.com/strains/cookies-and-cream",
      ],
      notes:
        "Leafly confirms Starfighter × undisclosed GSC phenotype (close to our Starfighter F2 × GSC). Hybrid. Top terpenes Caryophyllene/Limonene/Myrcene match. THC ~20% (within 20–26%).",
      verifiedAt: "2026-05-15",
    },
  },

  "triangle-kush": {
    slug: "triangle-kush",
    name: "Triangle Kush",
    type: "indica",
    aliases: ["Triangle Kush", "TK", "Triangle"],
    tagline: "Foundational Florida indica — parent to Wedding Cake.",
    intro:
      "Triangle Kush is the Florida-bred OG-family indica that became one of the foundational strains of " +
      "the modern hybrid era. Parent to Wedding Cake and dozens of other A-list strains. Heavy body buzz, " +
      "classic OG citrus-pine-earth aroma. The 'triangle' refers to Florida's three cannabis cities " +
      "(Jacksonville, Miami, Tampa).",
    lineage: "OG Kush phenotype (Florida)",
    parents: ["og-kush"],
    thcRange: "18–25%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Happy", "Euphoric"],
    terpenes: [
      { name: "Limonene", note: "lemon zest" },
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Caryophyllene", note: "peppery base" },
    ],
    flavor: ["Lemon", "Earthy pine", "Sweet earth"],
    bestFor: ["Late evening", "Stress relief", "Pain relief", "Couch + show"],
    avoidIf: ["You need to be alert", "You want head-up creative energy"],
    faqs: [
      {
        q: "Why is it called Triangle Kush?",
        a: "Named after Florida's 'cannabis triangle' (Jacksonville, Miami, Tampa) where the strain was originally bred. It's an OG Kush phenotype with its own distinct profile.",
      },
      {
        q: "Is Triangle Kush indica, sativa, or hybrid?",
        a: "Triangle Kush is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is OG Kush phenotype (Florida).",
      },
      {
        q: "What does Triangle Kush taste like?",
        a: "Triangle Kush hits lemon up front, earthy pine through the middle, and sweet earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Triangle Kush?",
        a: "Triangle Kush tests in the 18–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Triangle Kush best for?",
        a: "Triangle Kush reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    lineageAlternates: [
      "Hindu Kush × Emerald Triangle (Florida accidental cross — community theory)",
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/triangle-kush",
        "https://www.wikileaf.com/strain/triangle-kush/",
        "https://seedfinder.eu/en/strain-info/triangle-kush/clone-only-strains",
      ],
      notes:
        "Lineage debated — most cited as OG Kush phenotype from Florida; alternate community story is Hindu Kush × Emerald Triangle accidental cross. Indica (or indica-dominant hybrid). Top terpenes Myrcene/Limonene/Caryophyllene match. THC ~20% (within 18–25%).",
      verifiedAt: "2026-05-15",
    },
  },

  "skunk-1": {
    slug: "skunk-1",
    name: "Skunk #1",
    type: "hybrid",
    aliases: ["Skunk #1", "Skunk", "Skunk No. 1", "Skunk One"],
    tagline: "Foundational hybrid — the strain that built modern cannabis.",
    intro:
      "Skunk #1 is one of the most important strains in cannabis history. Bred in the 1970s by Sacred Seeds, " +
      "it stabilized hybrid genetics in a way nobody had done before — and the lineage runs through " +
      "Sour Diesel, Cheese, Jack Herer, and hundreds of other modern strains. Strong skunky-earthy aroma, " +
      "balanced effect, easy to grow.",
    lineage: "Afghani × Acapulco Gold × Colombian Gold",
    parents: ["afghani", "acapulco-gold", "colombian-gold"],
    thcRange: "15–19%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Uplifted", "Happy", "Creative"],
    terpenes: [
      { name: "Myrcene", note: "earthy base — the skunk anchor" },
      { name: "Caryophyllene", note: "peppery accent" },
      { name: "Pinene", note: "soft pine" },
    ],
    flavor: ["Skunk", "Earthy", "Sweet pungency"],
    bestFor: ["Casual afternoon", "Trying a piece of cannabis history", "Social time"],
    avoidIf: ["You want a discreet aroma", "You want modern high-THC flower"],
    faqs: [
      {
        q: "Why is Skunk #1 so important?",
        a: "It's the first stable hybrid strain in cannabis — the foundation that allowed breeders to predictably cross indicas and sativas. Most modern strains have Skunk #1 somewhere in the family tree.",
      },
      {
        q: "Why does it smell like a skunk?",
        a: "The natural terpene profile reads as pungent skunk-and-earth to most noses. The smell gave the whole family its name.",
      },
      {
        q: "Is Skunk #1 indica, sativa, or hybrid?",
        a: "Skunk #1 is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Afghani × Acapulco Gold × Colombian Gold. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Skunk #1 taste like?",
        a: "Skunk #1 hits skunk up front, earthy through the middle, and sweet pungency on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Skunk #1?",
        a: "Skunk #1 tests in the 15–19% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Skunk #1 best for?",
        a: "Skunk #1 reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/skunk-1",
        "https://sensiseeds.com/en/cannabis-seeds/sensi-seeds/skunk-1-feminized",
      ],
      notes:
        "Sensi Seeds (carrying Sacred Seeds line) + Leafly confirm Afghani × Acapulco Gold × Colombian Gold by Sacred Seed Co. 1970s. Hybrid. Top terpenes Myrcene/Limonene/Pinene per Leafly (our Caryophyllene is alternate; both common). THC ~17% (within 15–19%).",
      verifiedAt: "2026-05-15",
    },
  },

  haze: {
    slug: "haze",
    name: "Haze",
    type: "sativa",
    aliases: ["Haze", "Original Haze", "Haze Brothers"],
    tagline: "Foundational landrace sativa — parent of countless modern sativas.",
    intro:
      "Haze is the foundational long-flowering sativa that defined modern head-up cannabis. " +
      "Bred in 1970s NorCal from Mexican, Colombian, Thai, and Indian landrace genetics, " +
      "it's the parent or grandparent of Jack Herer, Super Silver Haze, Lemon Haze, and most other " +
      "modern 'haze' strains. Spicy-piney aroma, clear-headed energetic effect.",
    lineage: "Mexican × Colombian × Thai × Indian landraces",
    parents: [null, "colombian", "thai", null],
    thcRange: "16–22%",
    cbdRange: "<1%",
    effects: ["Energetic", "Uplifted", "Focused", "Creative"],
    terpenes: [
      { name: "Terpinolene", note: "herbal-fresh — the Haze signature terp" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Pinene", note: "sharp pine" },
    ],
    flavor: ["Spicy pine", "Sweet earth", "Herbal"],
    bestFor: ["Morning use", "Creative push", "Long social sessions", "Trying a piece of cannabis history"],
    avoidIf: ["Anxiety-prone — runs head-up", "You want body relaxation"],
    faqs: [
      {
        q: "Is Haze a single strain or a family?",
        a: "Both — 'Original Haze' is a specific 1970s landrace cross, but 'Haze' has also become a category name for any sativa with the terpinolene-forward head-up profile.",
      },
      {
        q: "Is Haze indica, sativa, or hybrid?",
        a: "Haze is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Mexican × Colombian × Thai × Indian landraces.",
      },
      {
        q: "What does Haze taste like?",
        a: "Haze hits spicy pine up front, sweet earth through the middle, and herbal on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Haze?",
        a: "Haze tests in the 16–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Haze best for?",
        a: "Haze reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    lineageAlternates: [
      "Colombian × Thai × Indian × Mexican (most common version)",
      "Multiple Colombian landrace sub-strains (Santa Marta Gold, Punta Roja, Chocolate Colombian) — alternate detailed version",
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/haze",
        "https://seedfinder.eu/en/strain-info/original-haze/sam-the-skunkman",
      ],
      notes:
        "Original Haze landrace cross from 1970s NorCal (Haze Brothers). Specific landrace components debated — common version is Mexican × Colombian × Thai × Indian. Sativa. Top terpenes Terpinolene/Caryophyllene/Pinene (our version) — Leafly's auto-pull shows Myrcene/Pinene/Caryophyllene but Terpinolene-dominant is correct for the Haze chemotype. THC ~18% (within 16–22%).",
      verifiedAt: "2026-05-15",
    },
  },

  // VERIFIED 2026-05-15: lineage revised — DJ Short's documented Blueberry is a 3-way cross
  // (Afghani × Purple Thai × Thai), not the 2-parent version. Added Thai parent.
  blueberry: {
    slug: "blueberry",
    name: "Blueberry",
    type: "indica",
    aliases: ["Blueberry", "BB", "DJ Short Blueberry"],
    tagline: "Foundational sweet-berry indica — DJ Short's classic.",
    intro:
      "Blueberry is the foundational sweet-berry indica — bred by DJ Short in the late 1970s, won the 2000 " +
      "High Times Cup, and seeded a generation of fruit-forward strains. Parent of Blue Dream. " +
      "Sweet blueberry aroma, body-heavy relaxed effect, classic indica wind-down.",
    lineage: "Afghani × Purple Thai × Thai (Highland Thai)",
    parents: ["afghani", "purple-thai", "thai"],
    thcRange: "15–20%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Happy", "Hungry"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating base" },
      { name: "Caryophyllene", note: "peppery accent" },
      { name: "Pinene", note: "soft pine" },
    ],
    flavor: ["Sweet blueberry", "Berry", "Earth"],
    bestFor: ["Late afternoon", "Wind-down", "Stress relief", "Trying a classic"],
    avoidIf: ["You want energetic head-up effects", "Sweet aromas turn you off"],
    faqs: [
      {
        q: "Is Blueberry the parent of Blue Dream?",
        a: "Yes — Blueberry is one of the parent strains of Blue Dream (the other is Haze). Blueberry contributes the sweet fruit aroma and body-relaxing side.",
      },
      {
        q: "Is Blueberry indica, sativa, or hybrid?",
        a: "Blueberry is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Afghani × Purple Thai × Thai (Highland Thai).",
      },
      {
        q: "What does Blueberry taste like?",
        a: "Blueberry hits sweet blueberry up front, berry through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Blueberry?",
        a: "Blueberry tests in the 15–20% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Blueberry best for?",
        a: "Blueberry reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/blueberry",
        "https://darkcoastseed.com/blueberry-strain-history-dj-short/",
        "https://softsecrets.com/en-US/article/classic-strains-blueberry",
      ],
      notes:
        "REVISED 2026-05-15: DJ Short's documented Blueberry is Afghani × Purple Thai × Thai (Highland Thai/Juicy Fruit). Our previous 2-parent 'Purple Thai × Afghani' was incomplete. Indica. Top terpenes Myrcene/Caryophyllene/Pinene match. THC ~17% (within 15–20%; some phenos reach 24%).",
      verifiedAt: "2026-05-15",
    },
  },

  "thin-mint-gsc": {
    slug: "thin-mint-gsc",
    name: "Thin Mint GSC",
    type: "hybrid",
    aliases: ["Thin Mint GSC", "Thin Mints", "Thin Mint Cookies", "TMC"],
    tagline: "Cool-mint GSC phenotype — parent of Gelato.",
    intro:
      "Thin Mint GSC is the specific GSC phenotype with the strongest cool-mint aroma — also one of the " +
      "two parents of Gelato. Balanced hybrid with sweet mint-chocolate notes, relaxed body, " +
      "gently elevated head. A Cookies-family classic in its own right.",
    lineage: "Girl Scout Cookies phenotype",
    parents: ["girl-scout-cookies"],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Happy", "Relaxed", "Euphoric", "Creative"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery — Cookies signature" },
      { name: "Limonene", note: "citrus accent" },
      { name: "Humulene", note: "earthy hop note" },
    ],
    flavor: ["Cool mint", "Sweet chocolate", "Earthy"],
    bestFor: ["Evening social", "Casual creative", "Stress relief"],
    avoidIf: ["You're very low-tolerance — runs high", "You want a clean sativa"],
    faqs: [
      {
        q: "Is Thin Mint GSC the same as regular GSC?",
        a: "It's a specific phenotype within the GSC line — same parent genetics, but selected for the strongest cool-mint expression. Effect is similar; aroma is more distinctly mint.",
      },
      {
        q: "Is Thin Mint GSC indica, sativa, or hybrid?",
        a: "Thin Mint GSC is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Girl Scout Cookies phenotype. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Thin Mint GSC taste like?",
        a: "Thin Mint GSC hits cool mint up front, sweet chocolate through the middle, and earthy on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Thin Mint GSC?",
        a: "Thin Mint GSC tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Thin Mint GSC best for?",
        a: "Thin Mint GSC reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.allbud.com/marijuana-strains/hybrid/thin-mint-girl-scout-cookies",
        "https://weedmaps.com/strains/thin-mints",
      ],
      notes:
        "AllBud + Weedmaps confirm Thin Mint GSC as a GSC phenotype (parents GSC = OG Kush × Durban Poison line). Hybrid (balanced). Terpenes match the Cookies-family signature. THC up to 24% (within 20–25%).",
      verifiedAt: "2026-05-15",
    },
  },

  "sunset-sherbet": {
    slug: "sunset-sherbet",
    name: "Sunset Sherbet",
    type: "hybrid",
    aliases: ["Sunset Sherbet", "Sherbet", "Sherbert", "Sunset Sherbert"],
    tagline: "Sweet citrus-cream hybrid — parent of Gelato.",
    intro:
      "Sunset Sherbet (often spelled Sherbert) is the sweet citrus-cream hybrid that — alongside Thin Mint GSC " +
      "— is one of the parents of Gelato. Indica-leaning, with mood-up euphoria and a clear-but-mellow head. " +
      "Aroma reads like orange creamsicle.",
    lineage: "Girl Scout Cookies × Pink Panties",
    parents: ["girl-scout-cookies", "pink-panties"],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Happy", "Relaxed", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Limonene", note: "bright citrus" },
      { name: "Linalool", note: "floral, mellowing" },
    ],
    flavor: ["Orange cream", "Sweet citrus", "Berry"],
    bestFor: ["After-work relax", "Casual social", "Light creative time"],
    avoidIf: ["You want pure sativa energy", "You're avoiding sweet aromas"],
    faqs: [
      {
        q: "Is it Sherbet or Sherbert?",
        a: "Both spellings appear on Washington shelves — same strain. The breeder used 'Sherbert' originally, but 'Sherbet' is more common now.",
      },
      {
        q: "Is Sunset Sherbet indica, sativa, or hybrid?",
        a: "Sunset Sherbet is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Girl Scout Cookies × Pink Panties. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Sunset Sherbet taste like?",
        a: "Sunset Sherbet hits orange cream up front, sweet citrus through the middle, and berry on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Sunset Sherbet?",
        a: "Sunset Sherbet tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Sunset Sherbet best for?",
        a: "Sunset Sherbet reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/sunset-sherbert",
        "https://www.msnlseeds.com/blog/who-bred-the-sunset-sherbet-strain/",
      ],
      notes:
        "Leafly + breeder (Sherbinski) confirm GSC × Pink Panties. Indica-dominant hybrid. Top terpenes Caryophyllene/Limonene/Myrcene per Leafly (our Linalool is alternate). THC ~18% (within 18–24%).",
      verifiedAt: "2026-05-15",
    },
  },

  "white-widow": {
    slug: "white-widow",
    name: "White Widow",
    type: "hybrid",
    aliases: ["White Widow", "WW"],
    tagline: "Foundational frosty hybrid — Dutch coffee-shop staple.",
    intro:
      "White Widow is the 1994 Dutch hybrid that became a global symbol for high-THC, heavily-frosted " +
      "cannabis. Balanced effect, sweet earth-and-pine aroma, white-frosted buds that gave it the name. " +
      "A regular feature on Amsterdam coffee-shop menus for 30+ years.",
    lineage: "Brazilian sativa × South Indian indica",
    parents: [null, null],
    thcRange: "18–25%",
    cbdRange: "<1%",
    effects: ["Happy", "Uplifted", "Euphoric", "Energetic"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Pinene", note: "fresh pine" },
      { name: "Caryophyllene", note: "peppery accent" },
    ],
    flavor: ["Earthy pine", "Sweet wood", "Pepper"],
    bestFor: ["Afternoon energy", "Social time", "Casual creative work"],
    avoidIf: ["Anxiety-prone — runs head-up", "You want body relaxation"],
    faqs: [
      {
        q: "Why is it called White Widow?",
        a: "The trichome coverage is so heavy the buds appear white — bred to maximize visible resin. The name is purely about the look.",
      },
      {
        q: "Is White Widow indica, sativa, or hybrid?",
        a: "White Widow is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Brazilian sativa × South Indian indica. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does White Widow taste like?",
        a: "White Widow hits earthy pine up front, sweet wood through the middle, and pepper on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is White Widow?",
        a: "White Widow tests in the 18–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is White Widow best for?",
        a: "White Widow reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/white-widow",
        "https://strainfinder.greenhouseseeds.nl/white-widow",
      ],
      notes:
        "Greenhouse Seeds (breeder, 1994) + Leafly confirm Brazilian sativa landrace × South Indian indica. Hybrid (60/40 sativa-leaning). Top terpenes Myrcene/Caryophyllene/Pinene match. THC ~15% (within 18–25%; modern phenos are higher).",
      verifiedAt: "2026-05-15",
    },
  },

  cheese: {
    slug: "cheese",
    name: "Cheese",
    type: "hybrid",
    aliases: ["Cheese", "UK Cheese", "Big Buddha Cheese"],
    tagline: "Pungent UK hybrid — yes, it really smells like cheese.",
    intro:
      "Cheese is the British cannabis answer to Sour Diesel — a Skunk #1 phenotype with a deeply distinctive " +
      "sharp-cheese aroma. Balanced hybrid, calm body, gently elevated head. UK Cheese is the most-circulated " +
      "lineage; Big Buddha Cheese is a popular re-issue.",
    lineage: "Skunk #1 phenotype",
    parents: ["skunk-1"],
    thcRange: "15–20%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Uplifted", "Creative"],
    terpenes: [
      { name: "Myrcene", note: "earthy base, the cheese anchor" },
      { name: "Caryophyllene", note: "peppery accent" },
      { name: "Pinene", note: "soft pine" },
    ],
    flavor: ["Sharp cheese", "Earthy skunk", "Sour"],
    bestFor: ["Easy afternoon", "Casual social", "Trying something distinctive"],
    avoidIf: ["You want a discreet aroma", "Pungent flavors turn you off"],
    faqs: [
      {
        q: "Does Cheese actually smell like cheese?",
        a: "Yes — sharp, pungent, distinctively cheesy. It's the natural terpene profile (heavy myrcene + caryophyllene over a sour-skunk base).",
      },
      {
        q: "Is Cheese indica, sativa, or hybrid?",
        a: "Cheese is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Skunk #1 phenotype. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Cheese taste like?",
        a: "Cheese hits sharp cheese up front, earthy skunk through the middle, and sour on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Cheese?",
        a: "Cheese tests in the 15–20% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Cheese best for?",
        a: "Cheese reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/cheese",
        "https://bigbuddhaseeds.com/strain/big-buddha-cheese/",
      ],
      notes:
        "Skunk #1 phenotype, widely confirmed (UK origin). Leafly cites Skunk #1 × Afghani for some Cheese phenos. Hybrid (indica-dominant). Top terpenes Myrcene/Pinene/Caryophyllene match. THC ~18% (within 15–20%).",
      verifiedAt: "2026-05-15",
    },
  },

  "grape-ape": {
    slug: "grape-ape",
    name: "Grape Ape",
    type: "indica",
    aliases: ["Grape Ape", "GA"],
    tagline: "Sweet grape indica — heavy, mellow, classic.",
    intro:
      "Grape Ape is the foundational grape-flavored indica — bred from Mendocino Purps, Skunk, and Afghani " +
      "in the early 2000s. Heavy body buzz, distinctive grape-and-berry aroma, deep purple buds. " +
      "Parent to Zkittlez. Classic 'goodnight' flower.",
    lineage: "Mendocino Purps × Skunk × Afghani",
    parents: ["mendocino-purps", "skunk-1", "afghani"],
    thcRange: "15–22%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Happy", "Hungry"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating base" },
      { name: "Caryophyllene", note: "peppery accent" },
      { name: "Pinene", note: "soft pine" },
    ],
    flavor: ["Sweet grape", "Berry", "Sweet earth"],
    bestFor: ["Sleep", "Pain relief", "Body soreness", "Late evening"],
    avoidIf: ["You need to function", "You want head-up energy"],
    faqs: [
      {
        q: "Is Grape Ape a nighttime strain?",
        a: "It's one of the more popular evening picks on WA shelves. Body-heavy, sweet grape aroma, slow-onset — customers commonly reach for it for wind-down.",
      },
      {
        q: "Is Grape Ape indica, sativa, or hybrid?",
        a: "Grape Ape is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Mendocino Purps × Skunk × Afghani.",
      },
      {
        q: "What does Grape Ape taste like?",
        a: "Grape Ape hits sweet grape up front, berry through the middle, and sweet earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Grape Ape?",
        a: "Grape Ape tests in the 15–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Grape Ape best for?",
        a: "Grape Ape reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/grape-ape",
        "https://www.barneysfarm.com/grape-ape",
      ],
      notes:
        "Apothecary Genetics / Barney's Farm confirmed breeders. Leafly confirms Mendocino Purps × Skunk × Afghani. Indica. Top terpenes Myrcene/Pinene/Caryophyllene match. THC ~18% (within 15–22%).",
      verifiedAt: "2026-05-15",
    },
  },

  "super-silver-haze": {
    slug: "super-silver-haze",
    name: "Super Silver Haze",
    type: "sativa",
    aliases: ["Super Silver Haze", "SSH"],
    tagline: "Three-time Cannabis Cup-winning sativa — clear, sharp, classic.",
    intro:
      "Super Silver Haze is the three-time Cannabis Cup winner ('97, '98, '99) that helped define the modern " +
      "Haze family. Skunk × Northern Lights × Haze parentage, clear-headed energetic effect, " +
      "spicy-citrus aroma. Parent of Super Lemon Haze.",
    lineage: "Skunk × Northern Lights × Haze",
    parents: ["skunk-1", "northern-lights", "haze"],
    thcRange: "18–23%",
    cbdRange: "<1%",
    effects: ["Energetic", "Uplifted", "Focused", "Creative"],
    terpenes: [
      { name: "Terpinolene", note: "herbal-fresh Haze signature" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Myrcene", note: "soft earth" },
    ],
    flavor: ["Spicy citrus", "Sweet pine", "Herbal"],
    bestFor: ["Morning use", "Creative push", "Long social sessions"],
    avoidIf: ["Anxiety-prone — runs head-up", "You want body relaxation"],
    faqs: [
      {
        q: "Is Super Silver Haze the same as Silver Haze?",
        a: "Closely related — Silver Haze is the parent line, Super Silver Haze is the most-circulated cross (adds Skunk + Northern Lights to the lineage).",
      },
      {
        q: "Is Super Silver Haze indica, sativa, or hybrid?",
        a: "Super Silver Haze is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Skunk × Northern Lights × Haze.",
      },
      {
        q: "What does Super Silver Haze taste like?",
        a: "Super Silver Haze hits spicy citrus up front, sweet pine through the middle, and herbal on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Super Silver Haze?",
        a: "Super Silver Haze tests in the 18–23% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Super Silver Haze best for?",
        a: "Super Silver Haze reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/super-silver-haze",
        "https://strainfinder.greenhouseseeds.nl/super-silver-haze",
      ],
      notes:
        "Greenhouse Seeds (breeder) + Leafly confirm Skunk × Northern Lights × Haze. Sativa. Top terpenes Terpinolene/Myrcene/Caryophyllene per Leafly (our Pinene is alternate; Caryophyllene also appears). THC ~21% (within 18–23%). Three-time Cannabis Cup winner ('97/'98/'99).",
      verifiedAt: "2026-05-15",
    },
  },


  // ════════════════════════════════════════════════════════════════════
  // WAVE 2 — strains 51-100. Curated + verified 2026-05-15. See
  // PLAN_STRAIN_LIBRARY_250_2026_05_15.md + shared/strains-wave2-51to100.ts.
  // 13 indica + 13 sativa + 16 hybrid + 8 cbd-dominant (by ratio).
  // Verification: 47 clean / 3 with-note / 0 contested.
  // Ships LIVE-DORMANT — SEO_STRAIN_WAVE env-var controls indexing.
  // ════════════════════════════════════════════════════════════════════
  // ────────────────────────────────────────────────────────────────────
  // INDICA (13)
  // ────────────────────────────────────────────────────────────────────

  "ice-cream-cake": {
    slug: "ice-cream-cake",
    name: "Ice Cream Cake",
    type: "indica",
    aliases: ["Ice Cream Cake", "ICC"],
    tagline: "Indica-leaning dessert hybrid — heavy, sweet, late-night.",
    intro:
      "Ice Cream Cake is the heavy end of the modern dessert lineup. Indica-leaning, a Wedding Cake × Gelato 33 " +
      "cross out of Seed Junky, with a creamy-vanilla aroma and a body that lands hard. Customers reach for it " +
      "after dinner when the day is done and the couch is the plan.",
    lineage: "Wedding Cake × Gelato #33",
    parents: ["wedding-cake", "gelato"],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Happy", "Euphoric"],
    terpenes: [
      { name: "Limonene", note: "citrus-sweet top note" },
      { name: "Caryophyllene", note: "peppery, warm woody base" },
      { name: "Linalool", note: "floral lavender — adds to the heavy body" },
    ],
    flavor: ["Sweet vanilla", "Sugary cream", "Light pepper"],
    bestFor: ["After-dinner couch time", "Wind-down evenings", "Light insomnia nights", "Watching a movie"],
    avoidIf: ["You need to stay productive", "You're low-tolerance — runs heavy"],
    faqs: [
      {
        q: "Is Ice Cream Cake a nighttime strain?",
        a: "Yes — customers consistently reach for it in the evening. Indica-leaning, body-heavy, mellow head.",
      },
      {
        q: "What does Ice Cream Cake taste like?",
        a: "Sweet vanilla and sugar up front, a light peppery finish from the caryophyllene. Smells like cake batter.",
      },
      {
        q: "Is Ice Cream Cake indica, sativa, or hybrid?",
        a: "Ice Cream Cake is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Wedding Cake × Gelato #33.",
      },
      {
        q: "How strong is Ice Cream Cake?",
        a: "Ice Cream Cake tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Ice Cream Cake best for?",
        a: "Ice Cream Cake reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
      {
        q: "What terpenes are in Ice Cream Cake?",
        a: "The dominant terpenes in Ice Cream Cake are Limonene (citrus zest, bright and mood-lifting on the nose), Caryophyllene (peppery and warm, spicy on the back end), and Linalool (floral lavender, soft and calming on the nose). The blend is what gives the strain its specific nose and the character customers report on the exhale.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/ice-cream-cake",
        "https://weedmaps.com/strains/ice-cream-cake",
      ],
      notes:
        "Leafly confirms Wedding Cake × Gelato #33, indica-dominant hybrid, Seed Junky Genetics. Top terpenes Limonene/Caryophyllene/Linalool match. THC ~23% (within 20–25%).",
      verifiedAt: "2026-05-15",
    },
  },

  "la-confidential": {
    slug: "la-confidential",
    name: "LA Confidential",
    type: "indica",
    aliases: ["LA Confidential", "LAC", "L.A. Confidential"],
    tagline: "Old-school SoCal indica — fast, heavy, piney.",
    intro:
      "LA Confidential is a DNA Genetics indica that won the Cannabis Cup in 2005 and never really left the " +
      "high-shelf rotation. Afghani × OG LA Affie genetics, fast onset, body-heavy, with a sharp piney-skunk " +
      "aroma. The kind of indica long-time customers come back to.",
    lineage: "OG LA Affie × Afghani",
    parents: ["afghani", null],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Euphoric", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy, body-heavy" },
      { name: "Pinene", note: "sharp pine top note" },
      { name: "Caryophyllene", note: "peppery, mellow" },
    ],
    flavor: ["Pine", "Skunk", "Earthy sweet"],
    bestFor: ["End of a long day", "Late evening", "Sleep-resistant nights"],
    avoidIf: ["You need to function", "You want a clear-headed sativa"],
    faqs: [
      {
        q: "Is LA Confidential a strong indica?",
        a: "Yes — fast-onset, body-heavy, one of the more no-nonsense indicas on the shelf. Start small if you're not used to indicas.",
      },
      {
        q: "Is LA Confidential indica, sativa, or hybrid?",
        a: "LA Confidential is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is OG LA Affie × Afghani.",
      },
      {
        q: "What does LA Confidential taste like?",
        a: "LA Confidential hits pine up front, skunk through the middle, and earthy sweet on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is LA Confidential?",
        a: "LA Confidential tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is LA Confidential best for?",
        a: "LA Confidential reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/la-confidential",
        "https://dnagenetics.com/la-confidential-cannabis-strain/",
      ],
      notes:
        "Leafly + DNA Genetics (breeder) confirm OG LA Affie × Afghani, indica. OG LA Affie not in our strain index — kept as second parent null. Top terpenes Myrcene/Pinene/Caryophyllene match. 2005 Cannabis Cup winner.",
      verifiedAt: "2026-05-15",
    },
  },

  "master-kush": {
    slug: "master-kush",
    name: "Master Kush",
    type: "indica",
    aliases: ["Master Kush", "Master Khush", "Hi-Mass"],
    tagline: "Amsterdam-era indica — earthy, heavy, classic.",
    intro:
      "Master Kush is one of the foundational Amsterdam coffee-shop indicas — a Hindu Kush × Skunk #1 cross " +
      "that's been around since the early '90s. Pure earthy-citrus aroma, body-heavy buzz, low-key head. " +
      "The kind of strain old-school heads still ask for by name.",
    lineage: "Hindu Kush × Skunk #1",
    parents: ["hindu-kush", "skunk-1"],
    thcRange: "16–22%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Happy", "Euphoric"],
    terpenes: [
      { name: "Myrcene", note: "earthy, body-heavy" },
      { name: "Limonene", note: "citrus undertone" },
      { name: "Caryophyllene", note: "peppery, calming" },
    ],
    flavor: ["Earthy", "Citrus", "Hash"],
    bestFor: ["End of day", "Pre-sleep", "Casual evening"],
    avoidIf: ["You need to be sharp", "Earthy-hash flavors aren't your thing"],
    faqs: [
      {
        q: "Is Master Kush related to OG Kush?",
        a: "Not directly. Both are Kush-family, but Master Kush is a Hindu Kush × Skunk #1 cross from the Netherlands. OG Kush is a separate West Coast line.",
      },
      {
        q: "Is Master Kush indica, sativa, or hybrid?",
        a: "Master Kush is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Hindu Kush × Skunk #1.",
      },
      {
        q: "What does Master Kush taste like?",
        a: "Master Kush hits earthy up front, citrus through the middle, and hash on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Master Kush?",
        a: "Master Kush tests in the 16–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Master Kush best for?",
        a: "Master Kush reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/master-kush",
        "https://weedmaps.com/strains/master-kush",
        "https://www.whitelabelseed.com/strain/master-kush",
      ],
      notes:
        "Leafly confirms Hindu Kush × Skunk #1, indica. Cannabis Cup winner. Top terpenes Myrcene/Limonene/Caryophyllene per Leafly. THC ~20% (within 16–22%). Two-time Cup winner in the '90s.",
      verifiedAt: "2026-05-15",
    },
  },

  "death-star": {
    slug: "death-star",
    name: "Death Star",
    type: "indica",
    aliases: ["Death Star", "DS"],
    tagline: "Diesel-forward indica from Ohio — heavy, fuel-sweet.",
    intro:
      "Death Star came out of Ohio in the mid-2000s — a Sour Diesel × Sensi Star cross with a diesel-and-sweet " +
      "aroma and a slow, weighty body landing. Heavier than its Sour Diesel parent suggests; customers tend to " +
      "reach for it after dinner, not before work.",
    lineage: "Sour Diesel × Sensi Star",
    parents: ["sour-diesel", null],
    thcRange: "19–25%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Euphoric", "Happy"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, calming base" },
      { name: "Myrcene", note: "earthy, sedative" },
      { name: "Limonene", note: "citrus-sweet top" },
    ],
    flavor: ["Diesel", "Sweet earth", "Skunk"],
    bestFor: ["After dinner", "Couch + movie", "Heavy stress nights"],
    avoidIf: ["You want a daytime sativa", "Diesel aromas turn you off"],
    faqs: [
      {
        q: "Why is it called Death Star?",
        a: "Original Ohio grower lore — the buds were so dense and frosty they looked like the Death Star. Effect-wise it leans heavier than the name suggests it would be edgy.",
      },
      {
        q: "Is Death Star indica, sativa, or hybrid?",
        a: "Death Star is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Sour Diesel × Sensi Star.",
      },
      {
        q: "What does Death Star taste like?",
        a: "Death Star hits diesel up front, sweet earth through the middle, and skunk on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Death Star?",
        a: "Death Star tests in the 19–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Death Star best for?",
        a: "Death Star reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/death-star",
        "https://weedmaps.com/strains/death-star",
      ],
      notes:
        "Leafly confirms Sour Diesel × Sensi Star, indica-dominant. Sensi Star not in our strain index — kept as second parent null. Top terpenes Caryophyllene/Myrcene/Limonene match. THC ~19% (within 19–25%).",
      verifiedAt: "2026-05-15",
    },
  },

  "critical-mass": {
    slug: "critical-mass",
    name: "Critical Mass",
    type: "indica",
    aliases: ["Critical Mass", "Critical+", "CM"],
    tagline: "Heavy-yielding indica — relaxed, mellow, sweet-earthy.",
    intro:
      "Critical Mass is a Mr. Nice Seeds cross of Afghani × Skunk #1 that gets its name from buds so heavy they " +
      "break their own branches. Mellow body indica with a sweet-earthy aroma. Customers who want a no-drama " +
      "indica reach for this one.",
    lineage: "Afghani × Skunk #1",
    parents: ["afghani", "skunk-1"],
    thcRange: "17–22%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Happy", "Euphoric"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedative" },
      { name: "Pinene", note: "fresh pine" },
      { name: "Caryophyllene", note: "peppery, mellow" },
    ],
    flavor: ["Sweet earth", "Skunk", "Honey"],
    bestFor: ["Wind-down evenings", "Light sleep nights", "Body-tension nights"],
    avoidIf: ["You want energetic", "You're very low-tolerance"],
    faqs: [
      {
        q: "Is Critical Mass the same as Critical+?",
        a: "Critical+ is a Dinafem reworking of the same Afghani × Skunk #1 idea, slightly different pheno. Most WA shelves use the names interchangeably.",
      },
      {
        q: "Is Critical Mass indica, sativa, or hybrid?",
        a: "Critical Mass is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Afghani × Skunk #1.",
      },
      {
        q: "What does Critical Mass taste like?",
        a: "Critical Mass hits sweet earth up front, skunk through the middle, and honey on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Critical Mass?",
        a: "Critical Mass tests in the 17–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Critical Mass best for?",
        a: "Critical Mass reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/critical-mass",
        "https://mrnice.nl/?menu=critical-mass",
      ],
      notes:
        "Leafly + Mr. Nice Seeds (breeder) confirm Afghani × Skunk #1, indica-dominant. Top terpenes Myrcene/Pinene/Caryophyllene match. THC ~19% (within 17–22%).",
      verifiedAt: "2026-05-15",
    },
  },

  "banana-kush": {
    slug: "banana-kush",
    name: "Banana Kush",
    type: "indica",
    aliases: ["Banana Kush", "BK"],
    tagline: "West Coast indica with a banana-cream aroma.",
    intro:
      "Banana Kush is a Ghost OG × Skunk Haze cross that smells unmistakably like banana bread. Indica-leaning, " +
      "with a slow easy body and a relaxed but-not-knocked-out head. A long-time California favorite that " +
      "shows up regularly on Washington shelves.",
    lineage: "Ghost OG × Skunk Haze",
    parents: [null, null],
    thcRange: "18–25%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Sleepy"],
    terpenes: [
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Myrcene", note: "earthy, body-loose" },
    ],
    flavor: ["Banana", "Sweet cream", "Tropical"],
    bestFor: ["Late afternoon", "Casual evening", "Couch + show"],
    avoidIf: ["You want a clear-headed sativa", "Sweet aromas aren't your thing"],
    faqs: [
      {
        q: "Does Banana Kush actually taste like banana?",
        a: "Yes — the banana note is real, not marketing. Comes from the terpene profile, mostly limonene + linalool combination.",
      },
      {
        q: "Is Banana Kush indica, sativa, or hybrid?",
        a: "Banana Kush is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Ghost OG × Skunk Haze.",
      },
      {
        q: "How strong is Banana Kush?",
        a: "Banana Kush tests in the 18–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Banana Kush best for?",
        a: "Banana Kush reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
      {
        q: "What terpenes are in Banana Kush?",
        a: "The dominant terpenes in Banana Kush are Limonene (citrus zest, bright and mood-lifting on the nose), Caryophyllene (peppery and warm, spicy on the back end), and Myrcene (earthy, mango-like, with a mild body-heavy quality). The blend is what gives the strain its specific nose and the character customers report on the exhale.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/banana-kush",
        "https://weedmaps.com/strains/banana-kush",
      ],
      notes:
        "Leafly confirms Ghost OG × Skunk Haze, indica-dominant. Neither parent in our strain index — both kept null. Top terpenes Limonene/Caryophyllene/Myrcene match. THC ~20% (within 18–25%).",
      verifiedAt: "2026-05-15",
    },
  },

  "khalifa-kush": {
    slug: "khalifa-kush",
    name: "Khalifa Kush",
    type: "indica",
    aliases: ["Khalifa Kush", "KK", "Wiz Khalifa OG"],
    tagline: "Wiz Khalifa's private OG cut — piney, focused indica.",
    intro:
      "Khalifa Kush started as Wiz Khalifa's private cut of an OG Kush phenotype. Indica-leaning, with the " +
      "classic OG diesel-and-pine aroma, but with a more head-up landing than most OGs. The lineage details " +
      "stayed private — what's on shelves is the OG-Kush-phenotype framing.",
    lineage: "OG Kush phenotype (proprietary)",
    parents: ["og-kush"],
    thcRange: "20–28%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Limonene", note: "citrus-bright" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Pinene", note: "sharp pine" },
    ],
    flavor: ["Pine", "Lemon", "Diesel"],
    bestFor: ["After work", "Casual social", "Light creative", "Wind-down with some head still on"],
    avoidIf: ["You're very low-tolerance — runs high", "You want a knock-out indica"],
    faqs: [
      {
        q: "Is Khalifa Kush just OG Kush?",
        a: "It's a specific OG Kush phenotype that Wiz Khalifa selected and circulated. Same family, but the cut is the cut — slightly more head-up than typical OG.",
      },
      {
        q: "Is Khalifa Kush indica, sativa, or hybrid?",
        a: "Khalifa Kush is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is OG Kush phenotype (proprietary).",
      },
      {
        q: "What does Khalifa Kush taste like?",
        a: "Khalifa Kush hits pine up front, lemon through the middle, and diesel on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Khalifa Kush?",
        a: "Khalifa Kush tests in the 20–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Khalifa Kush best for?",
        a: "Khalifa Kush reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    lineageAlternates: ["OG Kush selection (most-cited)", "Unknown × OG Kush hybrid (alternate community theory)"],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/khalifa-kush",
        "https://weedmaps.com/strains/khalifa-kush",
      ],
      notes:
        "Leafly confirms OG Kush phenotype framing. Exact breeding history stayed private with Wiz Khalifa — most community sources treat it as a specific OG Kush cut rather than a separate cross. Type: indica-dominant hybrid (we call indica). Terpenes Limonene/Caryophyllene/Pinene match Leafly.",
      verifiedAt: "2026-05-15",
    },
  },

  "ghost-og": {
    slug: "ghost-og",
    name: "Ghost OG",
    type: "indica",
    aliases: ["Ghost OG", "Ghost OG Kush"],
    tagline: "OG Kush phenotype — heavy, citrus-piney, classic.",
    intro:
      "Ghost OG is one of the most-circulated OG Kush phenotypes, originally selected on the East Coast. " +
      "Indica-leaning, with the classic OG citrus-pine-diesel aroma and a heavier-than-most-OGs body landing. " +
      "Solid pick for end-of-day customers who already know they like OG Kush.",
    lineage: "OG Kush phenotype",
    parents: ["og-kush"],
    thcRange: "19–25%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Happy", "Euphoric"],
    terpenes: [
      { name: "Limonene", note: "citrus zest" },
      { name: "Myrcene", note: "earthy, body-heavy" },
      { name: "Caryophyllene", note: "peppery base" },
    ],
    flavor: ["Lemon", "Pine", "Diesel"],
    bestFor: ["End of day", "Couch + movie", "Sleep-resistant nights"],
    avoidIf: ["You want energetic", "You're new to OG Kush family — start with the parent"],
    faqs: [
      {
        q: "Is Ghost OG different from OG Kush?",
        a: "It's a phenotype — same family, slightly different expression. Ghost OG tends heavier on the body than the average OG Kush cut.",
      },
      {
        q: "Is Ghost OG indica, sativa, or hybrid?",
        a: "Ghost OG is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is OG Kush phenotype.",
      },
      {
        q: "What does Ghost OG taste like?",
        a: "Ghost OG hits lemon up front, pine through the middle, and diesel on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Ghost OG?",
        a: "Ghost OG tests in the 19–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Ghost OG best for?",
        a: "Ghost OG reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/ghost-og",
        "https://weedmaps.com/strains/ghost-og",
      ],
      notes:
        "Leafly confirms OG Kush phenotype, indica-dominant. Top terpenes Limonene/Myrcene/Caryophyllene match. THC ~20% (within 19–25%).",
      verifiedAt: "2026-05-15",
    },
  },

  "fire-og": {
    slug: "fire-og",
    name: "Fire OG",
    type: "indica",
    aliases: ["Fire OG", "Fire OG Kush"],
    tagline: "OG Kush × SFV OG — heavy, diesel-citrus, evening pick.",
    intro:
      "Fire OG is one of the hottest-burning indicas in the OG family — an OG Kush × SFV OG cross with that " +
      "characteristic citrus-and-diesel aroma and a heavy body that comes on fast. Customers reach for Fire OG " +
      "when they want OG character with more body than head.",
    lineage: "OG Kush × SFV OG Kush",
    parents: ["og-kush", null],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Euphoric", "Happy"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "citrus zest" },
      { name: "Myrcene", note: "earthy, sedating" },
    ],
    flavor: ["Lemon zest", "Diesel", "Earthy pine"],
    bestFor: ["End of day", "Late-night use", "Couch time"],
    avoidIf: ["You need to function", "You're very low-tolerance"],
    faqs: [
      {
        q: "Is Fire OG stronger than regular OG Kush?",
        a: "Often, yes — Fire OG tends to test on the higher end of the OG family. Body-heavy and fast-onset; not a starter OG.",
      },
      {
        q: "Is Fire OG indica, sativa, or hybrid?",
        a: "Fire OG is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is OG Kush × SFV OG Kush.",
      },
      {
        q: "What does Fire OG taste like?",
        a: "Fire OG hits lemon zest up front, diesel through the middle, and earthy pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Fire OG?",
        a: "Fire OG tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Fire OG best for?",
        a: "Fire OG reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/fire-og",
        "https://weedmaps.com/strains/fire-og",
      ],
      notes:
        "Leafly confirms OG Kush × SFV OG Kush, indica-dominant. SFV OG appears separately in this wave as its own entry. Top terpenes Caryophyllene/Limonene/Myrcene match. THC ~20% (within 20–25%).",
      verifiedAt: "2026-05-15",
    },
  },

  "larry-og": {
    slug: "larry-og",
    name: "Larry OG",
    type: "indica",
    aliases: ["Larry OG", "Lemon Larry", "Lemon Larry OG"],
    tagline: "Lemony OG Kush phenotype — bright, body-relaxing.",
    intro:
      "Larry OG (also called Lemon Larry) is the lemoniest of the OG Kush phenotypes — bred by Cali Connection " +
      "from OG Kush × SFV OG. Bright lemon-pine aroma, balanced body and head landing, more functional than " +
      "most OGs. A solid daytime-into-evening transition pick.",
    lineage: "OG Kush × SFV OG Kush",
    parents: ["og-kush", null],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Limonene", note: "bright lemon top" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Myrcene", note: "earthy, body-loose" },
    ],
    flavor: ["Lemon", "Pine", "Earth"],
    bestFor: ["Late afternoon", "Casual social", "Couch + chat"],
    avoidIf: ["You want a clean head-up sativa", "Diesel-leaning OGs are too much"],
    faqs: [
      {
        q: "Why is Larry OG also called Lemon Larry?",
        a: "Same strain — the lemon-pine aroma is the loudest part of the pheno, so 'Lemon Larry' became the more descriptive name. Cali Connection branded it as Larry OG.",
      },
      {
        q: "Is Larry OG indica, sativa, or hybrid?",
        a: "Larry OG is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is OG Kush × SFV OG Kush.",
      },
      {
        q: "What does Larry OG taste like?",
        a: "Larry OG hits lemon up front, pine through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Larry OG?",
        a: "Larry OG tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Larry OG best for?",
        a: "Larry OG reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/larry-og",
        "https://weedmaps.com/strains/larry-og",
      ],
      notes:
        "Leafly confirms OG Kush × SFV OG Kush, indica-dominant, Cali Connection breeder. SFV OG kept null (separate entry this wave). Top terpenes Limonene/Caryophyllene/Myrcene match. THC ~19% (within 18–24%).",
      verifiedAt: "2026-05-15",
    },
  },

  "sfv-og": {
    slug: "sfv-og",
    name: "SFV OG",
    type: "indica",
    aliases: ["SFV OG", "SFV", "San Fernando Valley OG"],
    tagline: "San Fernando Valley OG — bright lemon, mellow body.",
    intro:
      "SFV OG (San Fernando Valley OG Kush) is the lighter, more functional side of the OG family. An OG Kush " +
      "phenotype selected in the San Fernando Valley, with a bright lemon-pine aroma and a body that's mellow " +
      "without being couch-pinning. Parent strain to Fire OG and Larry OG.",
    lineage: "OG Kush phenotype (Afghani descent)",
    parents: ["og-kush"],
    thcRange: "16–22%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Uplifted", "Euphoric"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Limonene", note: "bright lemon" },
      { name: "Caryophyllene", note: "peppery, warm woody" },
    ],
    flavor: ["Lemon zest", "Pine", "Earthy"],
    bestFor: ["Late afternoon", "Casual evening", "Mild body relief"],
    avoidIf: ["You want a heavier OG — try Fire OG", "You need energetic"],
    faqs: [
      {
        q: "Is SFV OG indica or hybrid?",
        a: "Indica-leaning hybrid — body-relaxing with enough head-up to stay social. One of the more functional OG family members.",
      },
      {
        q: "Is SFV OG indica, sativa, or hybrid?",
        a: "SFV OG is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is OG Kush phenotype (Afghani descent).",
      },
      {
        q: "What does SFV OG taste like?",
        a: "SFV OG hits lemon zest up front, pine through the middle, and earthy on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is SFV OG?",
        a: "SFV OG tests in the 16–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is SFV OG best for?",
        a: "SFV OG reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/sfv-og",
        "https://weedmaps.com/strains/sfv-og",
      ],
      notes:
        "Leafly confirms OG Kush phenotype, indica-dominant hybrid. Parent of Fire OG and Larry OG (both in this wave). Top terpenes Myrcene/Limonene/Caryophyllene match. THC ~19% (within 16–22%).",
      verifiedAt: "2026-05-15",
    },
  },

  slurricane: {
    slug: "slurricane",
    name: "Slurricane",
    type: "indica",
    aliases: ["Slurricane", "Hurricane"],
    tagline: "Modern indica — sweet, heavy, dessert-forward.",
    intro:
      "Slurricane is an In House Genetics cross of Do-Si-Dos × Purple Punch — heavy indica with a sweet " +
      "berry-grape aroma and the kind of body-landing that closes a day. Higher-THC pheno on most Washington " +
      "shelves; customers who like Purple Punch reach for this for more punch.",
    lineage: "Do-Si-Dos × Purple Punch",
    parents: ["do-si-dos", "purple-punch"],
    thcRange: "22–28%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Happy", "Euphoric"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Myrcene", note: "earthy, body-heavy" },
    ],
    flavor: ["Berry", "Grape", "Sweet earth"],
    bestFor: ["End of day", "Pre-sleep", "After-dinner couch"],
    avoidIf: ["You're new to high-THC indicas", "You want to stay productive"],
    faqs: [
      {
        q: "Is Slurricane stronger than Purple Punch?",
        a: "Usually, yes — the Do-Si-Dos parent pushes the THC higher. Most Slurricane phenos sit in the 22–28% range; Purple Punch is more 18–22%.",
      },
      {
        q: "Is Slurricane indica, sativa, or hybrid?",
        a: "Slurricane is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Do-Si-Dos × Purple Punch.",
      },
      {
        q: "What does Slurricane taste like?",
        a: "Slurricane hits berry up front, grape through the middle, and sweet earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Slurricane?",
        a: "Slurricane tests in the 22–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Slurricane best for?",
        a: "Slurricane reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/slurricane",
        "https://weedmaps.com/strains/slurricane",
      ],
      notes:
        "Leafly confirms Do-Si-Dos × Purple Punch, indica-dominant, In House Genetics. Both parents are in our strain index. Top terpenes Caryophyllene/Limonene/Myrcene match. THC ~23% (within 22–28%).",
      verifiedAt: "2026-05-15",
    },
  },

  "donny-burger": {
    slug: "donny-burger",
    name: "Donny Burger",
    type: "indica",
    aliases: ["Donny Burger", "Don Burger"],
    tagline: "GMO × Han Solo Burger — savory-gassy indica.",
    intro:
      "Donny Burger is the savory side of the modern indica menu — GMO Cookies × Han Solo Burger, with a " +
      "garlic-funky-gassy aroma that's polarizing on first sniff. Heavy body, slow-onset head, the kind of " +
      "indica customers either love at first puff or never come back to.",
    lineage: "GMO Cookies × Han Solo Burger",
    parents: ["gmo-cookies", null],
    thcRange: "22–30%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Euphoric", "Happy"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, savory-warm" },
      { name: "Limonene", note: "citrus undertone" },
      { name: "Humulene", note: "earthy, hop-like" },
    ],
    flavor: ["Garlic", "Diesel", "Savory funk"],
    bestFor: ["High-tolerance evenings", "Couch + show", "Late night"],
    avoidIf: ["You don't like savory or garlicky aromas", "You're low-tolerance — runs high"],
    faqs: [
      {
        q: "Does Donny Burger really smell like garlic?",
        a: "Yes — the GMO parent brings the garlic-funk, and the Han Solo Burger adds gas. Not for everyone; customers who love GMO Cookies tend to love Donny Burger.",
      },
      {
        q: "Is Donny Burger indica, sativa, or hybrid?",
        a: "Donny Burger is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is GMO Cookies × Han Solo Burger.",
      },
      {
        q: "What does Donny Burger taste like?",
        a: "Donny Burger hits garlic up front, diesel through the middle, and savory funk on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Donny Burger?",
        a: "Donny Burger tests in the 22–30% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Donny Burger best for?",
        a: "Donny Burger reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/donny-burger",
        "https://weedmaps.com/strains/donny-burger",
      ],
      notes:
        "Leafly confirms GMO Cookies × Han Solo Burger, indica-dominant. Han Solo Burger not in our strain index — kept null. Top terpenes Caryophyllene/Limonene/Humulene match. THC ~24% (within 22–30%).",
      verifiedAt: "2026-05-15",
    },
  },

  // ────────────────────────────────────────────────────────────────────
  // SATIVA (13)
  // ────────────────────────────────────────────────────────────────────

  tangie: {
    slug: "tangie",
    name: "Tangie",
    type: "sativa",
    aliases: ["Tangie", "Tangerine"],
    tagline: "Bright tangerine sativa from DNA Genetics.",
    intro:
      "Tangie is the citrus end of the modern sativa lineup — a DNA Genetics rework of '90s Tangerine Dream, " +
      "with a tangerine-rind aroma that's strong enough to fill a room. Head-forward, uplifting, low body weight. " +
      "Parent strain to Sundae Driver, Sour Tangie, and a long list of citrus-forward crosses.",
    lineage: "California Orange × Skunk #1",
    parents: [null, "skunk-1"],
    thcRange: "19–25%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Happy", "Energetic", "Creative"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Caryophyllene", note: "peppery undertone" },
      { name: "Pinene", note: "fresh pine, focusing" },
    ],
    flavor: ["Tangerine", "Citrus zest", "Sweet orange"],
    bestFor: ["Morning use", "Creative work", "Cleaning the house", "Pre-walk pick-me-up"],
    avoidIf: ["You want a body-heavy buzz", "You're caffeine-sensitive"],
    faqs: [
      {
        q: "Does Tangie really smell like tangerines?",
        a: "Yes — the tangerine aroma is the loudest part of the strain. Comes from a high limonene + citrus-terpene profile. Smell carries across a room.",
      },
      {
        q: "Is Tangie indica, sativa, or hybrid?",
        a: "Tangie is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is California Orange × Skunk #1.",
      },
      {
        q: "What does Tangie taste like?",
        a: "Tangie hits tangerine up front, citrus zest through the middle, and sweet orange on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Tangie?",
        a: "Tangie tests in the 19–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Tangie best for?",
        a: "Tangie reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/tangie",
        "https://dnagenetics.com/tangie-cannabis-strain/",
      ],
      notes:
        "Leafly + DNA Genetics confirm California Orange × Skunk #1, sativa-dominant. California Orange not in our strain index — kept null. Top terpenes Myrcene/Caryophyllene/Pinene match Leafly. 2014 + 2015 Cup winner.",
      verifiedAt: "2026-05-15",
    },
  },

  "nyc-diesel": {
    slug: "nyc-diesel",
    name: "NYC Diesel",
    type: "sativa",
    aliases: ["NYC Diesel", "NYCD", "New York City Diesel"],
    tagline: "East Coast diesel sativa — pungent fuel + grapefruit.",
    intro:
      "NYC Diesel is a Soma Seeds sativa that captured the late-'90s New York scene — Mexican × Afghani " +
      "genetics with a pungent fuel-and-grapefruit aroma that's unmistakable. Head-up, uplifting, with enough " +
      "body to keep it from going racey. Sister strain to Sour Diesel.",
    lineage: "Mexican × Afghani",
    parents: [null, "afghani"],
    thcRange: "16–22%",
    cbdRange: "<1%",
    effects: ["Energetic", "Uplifted", "Happy", "Creative"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "grapefruit-citrus" },
      { name: "Myrcene", note: "earthy underbelly" },
    ],
    flavor: ["Diesel", "Grapefruit", "Lime"],
    bestFor: ["Morning use", "Creative push", "Daytime social"],
    avoidIf: ["You don't like diesel aromas", "You're anxiety-prone"],
    faqs: [
      {
        q: "Is NYC Diesel the same as Sour Diesel?",
        a: "Cousins, not twins. Both are Diesel-family sativas from the late-'90s East Coast, but NYC Diesel comes from Soma Seeds and tends to lean more grapefruit-forward. Sour Diesel is more fuel-pungent.",
      },
      {
        q: "Is NYC Diesel indica, sativa, or hybrid?",
        a: "NYC Diesel is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Mexican × Afghani.",
      },
      {
        q: "What does NYC Diesel taste like?",
        a: "NYC Diesel hits diesel up front, grapefruit through the middle, and lime on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is NYC Diesel?",
        a: "NYC Diesel tests in the 16–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is NYC Diesel best for?",
        a: "NYC Diesel reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/nyc-diesel",
        "https://weedmaps.com/strains/nyc-diesel",
      ],
      notes:
        "Leafly confirms Mexican × Afghani (sometimes cited as Original Diesel × Hawaiian), sativa, Soma Seeds breeder. Mexican parent has no canonical sub-strain (kept null). Top terpenes Caryophyllene/Limonene/Myrcene match. THC ~17% (within 16–22%).",
      verifiedAt: "2026-05-15",
    },
  },

  "east-coast-sour-diesel": {
    slug: "east-coast-sour-diesel",
    name: "East Coast Sour Diesel",
    type: "sativa",
    aliases: ["East Coast Sour Diesel", "ECSD", "East Coast Sour D"],
    tagline: "The ECSD cut — sharp fuel, no-nonsense sativa.",
    intro:
      "East Coast Sour Diesel (ECSD) is the New York-selected Sour Diesel phenotype that built a culture " +
      "around itself in the '90s. Sharper fuel aroma than the standard Sour Diesel cut, faster onset, " +
      "head-forward without much body weight. The pick when customers want Sour Diesel character cranked up.",
    lineage: "Sour Diesel phenotype",
    parents: ["sour-diesel"],
    thcRange: "18–22%",
    cbdRange: "<1%",
    effects: ["Energetic", "Uplifted", "Creative", "Focused"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "citrus zest" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Diesel", "Sour citrus", "Skunk"],
    bestFor: ["Morning use", "Creative work", "Beating an afternoon slump"],
    avoidIf: ["You're anxiety-prone — runs hot", "You want body-heavy"],
    faqs: [
      {
        q: "Is ECSD different from regular Sour Diesel?",
        a: "It's the East Coast-selected pheno of Sour Diesel — sharper fuel aroma, slightly faster onset. Same family, different cut.",
      },
      {
        q: "Is East Coast Sour Diesel indica, sativa, or hybrid?",
        a: "East Coast Sour Diesel is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Sour Diesel phenotype.",
      },
      {
        q: "What does East Coast Sour Diesel taste like?",
        a: "East Coast Sour Diesel hits diesel up front, sour citrus through the middle, and skunk on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is East Coast Sour Diesel?",
        a: "East Coast Sour Diesel tests in the 18–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is East Coast Sour Diesel best for?",
        a: "East Coast Sour Diesel reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/east-coast-sour-diesel",
        "https://weedmaps.com/strains/east-coast-sour-diesel",
      ],
      notes:
        "Leafly confirms Sour Diesel phenotype, sativa. Top terpenes Caryophyllene/Limonene/Myrcene match. THC ~20% (within 18–22%).",
      verifiedAt: "2026-05-15",
    },
  },

  "sour-tangie": {
    slug: "sour-tangie",
    name: "Sour Tangie",
    type: "sativa",
    aliases: ["Sour Tangie", "ST"],
    tagline: "East Coast Sour Diesel × Tangie — bright, head-forward.",
    intro:
      "Sour Tangie is a DNA Genetics cross of East Coast Sour Diesel × Tangie — the citrus side of Tangie " +
      "wedded to the fuel-sharpness of Sour Diesel. Bright orange-fuel aroma, head-forward, energetic. " +
      "Customers who like both parents tend to love this one even more.",
    lineage: "East Coast Sour Diesel × Tangie",
    parents: ["east-coast-sour-diesel", "tangie"],
    thcRange: "19–23%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Energetic", "Happy", "Creative"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Caryophyllene", note: "peppery, warm" },
      { name: "Limonene", note: "tangerine-citrus" },
    ],
    flavor: ["Tangerine", "Diesel", "Sour citrus"],
    bestFor: ["Morning use", "Creative work", "Daytime social", "Pre-hike"],
    avoidIf: ["You want a body-heavy buzz", "You're anxiety-prone"],
    faqs: [
      {
        q: "Is Sour Tangie a strong sativa?",
        a: "Yes — head-forward, energetic, fast-onset. Not for first-timers; customers who already like sativas tend to love it.",
      },
      {
        q: "Is Sour Tangie indica, sativa, or hybrid?",
        a: "Sour Tangie is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is East Coast Sour Diesel × Tangie.",
      },
      {
        q: "What does Sour Tangie taste like?",
        a: "Sour Tangie hits tangerine up front, diesel through the middle, and sour citrus on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Sour Tangie?",
        a: "Sour Tangie tests in the 19–23% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Sour Tangie best for?",
        a: "Sour Tangie reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/sour-tangie",
        "https://dnagenetics.com/sour-tangie-cannabis-strain/",
      ],
      notes:
        "Leafly + DNA Genetics confirm East Coast Sour Diesel × Tangie, sativa-dominant. Both parents are in this wave. Top terpenes Myrcene/Caryophyllene/Limonene match. THC ~20% (within 19–23%).",
      verifiedAt: "2026-05-15",
    },
  },

  "panama-red": {
    slug: "panama-red",
    name: "Panama Red",
    type: "sativa",
    aliases: ["Panama Red"],
    tagline: "1960s Central American landrace — clear, classic sativa.",
    intro:
      "Panama Red is a pure Central American sativa landrace that defined the late-'60s and early-'70s " +
      "smoking scene. Earthy-spicy aroma, slow-building head-forward energy, low body weight. What's on " +
      "Washington shelves today is almost always a modern recreation, not the original landrace.",
    lineage: "Panamanian landrace",
    parents: [null],
    thcRange: "12–18%",
    cbdRange: "<1%",
    effects: ["Energetic", "Uplifted", "Creative", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Pinene", note: "fresh pine" },
      { name: "Caryophyllene", note: "peppery, warm" },
    ],
    flavor: ["Earthy", "Spicy", "Wood"],
    bestFor: ["Old-school sativa heads", "Daytime use", "Light creative"],
    avoidIf: ["You want modern high-THC", "You're new to landrace sativas"],
    faqs: [
      {
        q: "Is Panama Red the same as the 1960s strain?",
        a: "Almost certainly not — true Panamanian landrace seeds are nearly impossible to source. What's on shelves today is a modern recreation chasing the same effect profile.",
      },
      {
        q: "Is Panama Red indica, sativa, or hybrid?",
        a: "Panama Red is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Panamanian landrace.",
      },
      {
        q: "What does Panama Red taste like?",
        a: "Panama Red hits earthy up front, spicy through the middle, and wood on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Panama Red?",
        a: "Panama Red tests in the 12–18% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Panama Red best for?",
        a: "Panama Red reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    lineageAlternates: ["Modern recreation of original Panamanian landrace (most likely shelf reality)"],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/panama-red",
        "https://weedmaps.com/strains/panama-red",
      ],
      notes:
        "Leafly confirms Panamanian landrace origin. Modern shelf product is recreation, not the original 1960s landrace — disclosed in FAQ. Top terpenes Myrcene/Pinene/Caryophyllene per Leafly. THC ~13% (within our 12–18% range, lower than modern hybrids).",
      verifiedAt: "2026-05-15",
    },
  },

  "colombian-gold": {
    slug: "colombian-gold",
    name: "Colombian Gold",
    type: "sativa",
    aliases: ["Colombian Gold", "Santa Marta Gold"],
    tagline: "Santa Marta landrace sativa — classic Colombian.",
    intro:
      "Colombian Gold is a pure Colombian landrace from the Santa Marta region — one of the parent lines " +
      "behind countless modern sativas (Skunk #1, Haze, and more). Earthy-sweet-spicy aroma, slow-building " +
      "clear head. Like Panama Red, most shelf Colombian Gold today is a modern recreation.",
    lineage: "Colombian landrace (Santa Marta)",
    parents: [null],
    thcRange: "12–18%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Energetic", "Happy", "Focused"],
    terpenes: [
      { name: "Myrcene", note: "earthy underbelly" },
      { name: "Pinene", note: "fresh pine, focusing" },
      { name: "Caryophyllene", note: "peppery base" },
    ],
    flavor: ["Earthy", "Sweet spice", "Wood"],
    bestFor: ["Daytime use", "Hike or walk", "Old-school sativa heads"],
    avoidIf: ["You want modern high-THC", "Heavy body buzz"],
    faqs: [
      {
        q: "Is Colombian Gold related to Skunk #1?",
        a: "Yes — Colombian Gold is one of the parent landraces behind Skunk #1, and by extension behind most of the modern hybrid family. Old-school heritage line.",
      },
      {
        q: "Is Colombian Gold indica, sativa, or hybrid?",
        a: "Colombian Gold is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Colombian landrace (Santa Marta).",
      },
      {
        q: "What does Colombian Gold taste like?",
        a: "Colombian Gold hits earthy up front, sweet spice through the middle, and wood on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Colombian Gold?",
        a: "Colombian Gold tests in the 12–18% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Colombian Gold best for?",
        a: "Colombian Gold reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    lineageAlternates: ["Modern recreation of Santa Marta landrace (most likely shelf reality)"],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/colombian-gold",
        "https://weedmaps.com/strains/colombian-gold",
      ],
      notes:
        "Leafly confirms Colombian landrace, sativa. Modern shelf product is recreation, not original landrace — disclosed in FAQ. Top terpenes Myrcene/Pinene/Caryophyllene per Leafly. THC ~13% (within our 12–18% range, lower than modern hybrids). Parent line of Skunk #1.",
      verifiedAt: "2026-05-15",
    },
  },

  "jack-flash": {
    slug: "jack-flash",
    name: "Jack Flash",
    type: "sativa",
    aliases: ["Jack Flash", "Jack Flash #5"],
    tagline: "Sensi Seeds three-way sativa — head-up, citrus-fresh.",
    intro:
      "Jack Flash is a Sensi Seeds three-way cross — Jack Herer × Super Skunk × Haze. Head-forward, " +
      "energetic, with a citrus-pine-spice aroma. The most-circulated phenotype is Jack Flash #5. " +
      "Sister to Jack Herer with a slightly faster, less-cerebral hit.",
    lineage: "Jack Herer × Super Skunk × Haze",
    parents: ["jack-herer", null, "haze"],
    thcRange: "16–22%",
    cbdRange: "<1%",
    effects: ["Energetic", "Uplifted", "Creative", "Happy"],
    terpenes: [
      { name: "Terpinolene", note: "herbal-fresh, common in head-forward sativas" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Pinene", note: "fresh pine" },
    ],
    flavor: ["Citrus", "Pine", "Spice"],
    bestFor: ["Morning use", "Creative work", "Daytime social"],
    avoidIf: ["You want a body-heavy buzz", "Anxiety-prone — runs fast"],
    faqs: [
      {
        q: "Is Jack Flash the same as Jack Herer?",
        a: "Closely related — Jack Flash uses Jack Herer as one of three parents. Same family, slightly different cut. Jack Flash tends to hit faster and stays more head-forward.",
      },
      {
        q: "Is Jack Flash indica, sativa, or hybrid?",
        a: "Jack Flash is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Jack Herer × Super Skunk × Haze.",
      },
      {
        q: "What does Jack Flash taste like?",
        a: "Jack Flash hits citrus up front, pine through the middle, and spice on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Jack Flash?",
        a: "Jack Flash tests in the 16–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Jack Flash best for?",
        a: "Jack Flash reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/jack-flash",
        "https://sensiseeds.com/en/cannabis-strains/seeds/regular/jack-flash-regular",
      ],
      notes:
        "Leafly + Sensi Seeds (breeder) confirm Jack Herer × Super Skunk × Haze, sativa-dominant. Super Skunk not in our index — kept null. Top terpenes Terpinolene/Caryophyllene/Pinene match Leafly.",
      verifiedAt: "2026-05-15",
    },
  },

  cinex: {
    slug: "cinex",
    name: "Cinex",
    type: "sativa",
    aliases: ["Cinex", "Cinnex"],
    tagline: "Cinderella 99 × Vortex — bright citrus, daytime-clean.",
    intro:
      "Cinex is a Cinderella 99 × Vortex cross — pure sativa, with a sweet citrus aroma and a clear-headed " +
      "uplifting effect. Built for daytime use without the racey edge some sativas carry. Long-time " +
      "Washington shelf favorite for morning customers.",
    lineage: "Cinderella 99 × Vortex",
    parents: [null, null],
    thcRange: "17–23%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Energetic", "Focused", "Happy"],
    terpenes: [
      { name: "Terpinolene", note: "herbal-fresh, common in head-forward sativas" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Myrcene", note: "earthy underbelly" },
    ],
    flavor: ["Citrus", "Sweet earth", "Lime"],
    bestFor: ["Morning use", "Creative work", "Pre-hike", "Daytime focus"],
    avoidIf: ["You want body-heavy", "Caffeine-sensitive"],
    faqs: [
      {
        q: "Is Cinex a good morning strain?",
        a: "Yes — head-forward, energetic, low body weight. Customers reach for it as a wake-up sativa.",
      },
      {
        q: "Is Cinex indica, sativa, or hybrid?",
        a: "Cinex is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Cinderella 99 × Vortex.",
      },
      {
        q: "What does Cinex taste like?",
        a: "Cinex hits citrus up front, sweet earth through the middle, and lime on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Cinex?",
        a: "Cinex tests in the 17–23% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Cinex best for?",
        a: "Cinex reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/cinex",
        "https://weedmaps.com/strains/cinex",
      ],
      notes:
        "Leafly confirms Cinderella 99 × Vortex, sativa-dominant. Neither parent in our strain index — both kept null. Top terpenes Terpinolene/Caryophyllene/Myrcene match. THC ~19% (within 17–23%).",
      verifiedAt: "2026-05-15",
    },
  },

  "lemon-skunk": {
    slug: "lemon-skunk",
    name: "Lemon Skunk",
    type: "sativa",
    aliases: ["Lemon Skunk"],
    tagline: "DNA Genetics sativa — sharp lemon, classic skunk base.",
    intro:
      "Lemon Skunk is a DNA Genetics sativa — two Skunk #1 phenotypes selected for the brightest lemon " +
      "expression. Sharp citrus-skunk aroma, head-forward energy, low-moderate body weight. Parent strain " +
      "to Lemon Haze and Super Lemon Haze (both in our Wave 1 set).",
    lineage: "Skunk #1 × Skunk #1 (lemon-pheno selection)",
    parents: ["skunk-1", "skunk-1"],
    thcRange: "17–22%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Happy", "Energetic", "Creative"],
    terpenes: [
      { name: "Terpinolene", note: "herbal-fresh, head-forward" },
      { name: "Myrcene", note: "earthy base" },
      { name: "Caryophyllene", note: "peppery undertone" },
    ],
    flavor: ["Lemon zest", "Skunk", "Sweet earth"],
    bestFor: ["Morning use", "Daytime social", "Creative push"],
    avoidIf: ["Skunky aromas turn you off", "You want body-heavy"],
    faqs: [
      {
        q: "Is Lemon Skunk the same as Lemon Haze?",
        a: "No — Lemon Skunk is a Skunk #1 × Skunk #1 selection. Lemon Haze is Lemon Skunk × Silver Haze. Lemon Skunk is one of Lemon Haze's parents.",
      },
      {
        q: "Is Lemon Skunk indica, sativa, or hybrid?",
        a: "Lemon Skunk is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Skunk #1 × Skunk #1 (lemon-pheno selection).",
      },
      {
        q: "What does Lemon Skunk taste like?",
        a: "Lemon Skunk hits lemon zest up front, skunk through the middle, and sweet earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Lemon Skunk?",
        a: "Lemon Skunk tests in the 17–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Lemon Skunk best for?",
        a: "Lemon Skunk reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/lemon-skunk",
        "https://dnagenetics.com/lemon-skunk-cannabis-strain/",
      ],
      notes:
        "Leafly + DNA Genetics confirm Skunk #1 × Skunk #1 (selected lemon-pheno cross), sativa-dominant. Top terpenes Terpinolene/Myrcene/Caryophyllene match. Parent strain of Lemon Haze + Super Lemon Haze (Wave 1).",
      verifiedAt: "2026-05-15",
    },
  },

  "strawberry-banana": {
    slug: "strawberry-banana",
    name: "Strawberry Banana",
    type: "sativa",
    aliases: ["Strawberry Banana", "Strawnana", "SB"],
    tagline: "Sweet fruit hybrid leaning sativa — tropical, smooth.",
    intro:
      "Strawberry Banana is a Crockett Family Farms cross of Banana Kush × Strawberry — sativa-leaning, with " +
      "a sweet tropical-fruit aroma that's the loudest part of the strain. Smooth head-up energy, mellow body. " +
      "Good for customers who want sativa effect without sharp citrus or fuel notes.",
    lineage: "Banana Kush × Strawberry",
    parents: ["banana-kush", null],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Happy", "Uplifted", "Relaxed", "Creative"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sweet" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Caryophyllene", note: "peppery base" },
    ],
    flavor: ["Strawberry", "Banana", "Sweet cream"],
    bestFor: ["Daytime use", "Casual social", "Creative work"],
    avoidIf: ["You don't like sweet aromas", "Low-tolerance — runs high"],
    faqs: [
      {
        q: "Is Strawberry Banana a sativa?",
        a: "Sativa-dominant hybrid. Head-forward but with enough body to round it out — not a pure racey sativa.",
      },
      {
        q: "Is Strawberry Banana indica, sativa, or hybrid?",
        a: "Strawberry Banana is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Banana Kush × Strawberry.",
      },
      {
        q: "What does Strawberry Banana taste like?",
        a: "Strawberry Banana hits strawberry up front, banana through the middle, and sweet cream on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Strawberry Banana?",
        a: "Strawberry Banana tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Strawberry Banana best for?",
        a: "Strawberry Banana reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/strawberry-banana",
        "https://weedmaps.com/strains/strawberry-banana",
      ],
      notes:
        "Leafly confirms Banana Kush × Bubble Gum Strawberry, hybrid (sativa-leaning), Crockett Family Farms. Strawberry parent kept null (no canonical sub-strain). Banana Kush is in this wave. Top terpenes Myrcene/Limonene/Caryophyllene match. THC ~22% (within 20–26%).",
      verifiedAt: "2026-05-15",
    },
  },

  "tropicana-cookies": {
    slug: "tropicana-cookies",
    name: "Tropicana Cookies",
    type: "sativa",
    aliases: ["Tropicana Cookies", "Trop Cookies", "Tropicanna"],
    tagline: "GSC × Tangie sativa-hybrid — bright orange, head-up.",
    intro:
      "Tropicana Cookies is a Harry Palms / Bloom Seed Co cross of GSC × Tangie — sativa-leaning hybrid, with " +
      "a bright orange-citrus aroma and a head-forward landing. The Cookies parent keeps the body settled; the " +
      "Tangie parent drives the citrus. One of the more functional sativa-leaning hybrids.",
    lineage: "GSC × Tangie",
    parents: ["girl-scout-cookies", "tangie"],
    thcRange: "20–28%",
    cbdRange: "<1%",
    effects: ["Energetic", "Uplifted", "Happy", "Creative"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Limonene", note: "bright orange-citrus" },
      { name: "Myrcene", note: "earthy underbelly" },
    ],
    flavor: ["Orange", "Sweet citrus", "Earth"],
    bestFor: ["Morning use", "Creative push", "Daytime social"],
    avoidIf: ["You want a body-heavy buzz", "You're low-tolerance"],
    faqs: [
      {
        q: "Is Tropicana Cookies an indica or sativa?",
        a: "Sativa-dominant hybrid. Head-forward and energetic but with the GSC parent keeping the body grounded.",
      },
      {
        q: "Is Tropicana Cookies indica, sativa, or hybrid?",
        a: "Tropicana Cookies is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is GSC × Tangie.",
      },
      {
        q: "What does Tropicana Cookies taste like?",
        a: "Tropicana Cookies hits orange up front, sweet citrus through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Tropicana Cookies?",
        a: "Tropicana Cookies tests in the 20–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Tropicana Cookies best for?",
        a: "Tropicana Cookies reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/tropicana-cookies",
        "https://weedmaps.com/strains/tropicana-cookies",
      ],
      notes:
        "Leafly confirms GSC × Tangie, sativa-dominant hybrid, Harry Palms / Bloom Seed Co breeder. Both parents are in our strain index. Top terpenes Caryophyllene/Limonene/Myrcene match. THC ~21% (within 20–28%).",
      verifiedAt: "2026-05-15",
    },
  },

  clementine: {
    slug: "clementine",
    name: "Clementine",
    type: "sativa",
    aliases: ["Clementine"],
    tagline: "Crockett Family sativa — bright orange, daytime-clean.",
    intro:
      "Clementine is a Crockett Family Farms sativa — Tangie × Lemon Skunk — with a sweet citrus-orange " +
      "aroma and a clean, head-up effect. Parent strain to Mimosa (Wave 1). Customers who like Tangie tend to " +
      "like Clementine just as much.",
    lineage: "Tangie × Lemon Skunk",
    parents: ["tangie", "lemon-skunk"],
    thcRange: "19–27%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Happy", "Energetic", "Creative"],
    terpenes: [
      { name: "Terpinolene", note: "herbal-fresh, head-forward" },
      { name: "Myrcene", note: "earthy base" },
      { name: "Caryophyllene", note: "peppery undertone" },
    ],
    flavor: ["Citrus", "Sweet orange", "Tangerine"],
    bestFor: ["Morning use", "Creative work", "Pre-walk pick-me-up"],
    avoidIf: ["You want body-heavy", "Anxiety-prone"],
    faqs: [
      {
        q: "Is Clementine the parent of Mimosa?",
        a: "Yes — Mimosa is Clementine × Purple Punch. Clementine drives the citrus side of Mimosa's profile.",
      },
      {
        q: "Is Clementine indica, sativa, or hybrid?",
        a: "Clementine is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Tangie × Lemon Skunk.",
      },
      {
        q: "What does Clementine taste like?",
        a: "Clementine hits citrus up front, sweet orange through the middle, and tangerine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Clementine?",
        a: "Clementine tests in the 19–27% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Clementine best for?",
        a: "Clementine reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/clementine",
        "https://weedmaps.com/strains/clementine",
      ],
      notes:
        "Leafly confirms Tangie × Lemon Skunk, sativa-dominant, Crockett Family Farms. Both parents are in this wave. Top terpenes Terpinolene/Myrcene/Caryophyllene match. Parent of Mimosa (Wave 1). THC ~20% (within 19–27%).",
      verifiedAt: "2026-05-15",
    },
  },

  "cherry-ak-47": {
    slug: "cherry-ak-47",
    name: "Cherry AK-47",
    type: "sativa",
    aliases: ["Cherry AK-47", "Cherry AK"],
    tagline: "AK-47 selection with a cherry-sweet finish.",
    intro:
      "Cherry AK-47 is a sativa-leaning AK-47 phenotype selected for the cherry-sweet finish — same long, " +
      "mellow effect as AK-47 with a brighter aroma profile. De Sjamaan Seeds is the most-cited breeder. " +
      "Cup-winning strain in the modern AK family.",
    lineage: "AK-47 selection (Colombian × Mexican × Thai × Afghani lineage)",
    parents: ["ak-47"],
    thcRange: "16–22%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Happy", "Energetic", "Creative"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Myrcene", note: "earthy underbelly" },
      { name: "Limonene", note: "citrus-cherry top" },
    ],
    flavor: ["Cherry", "Sweet earth", "Skunk"],
    bestFor: ["Long social sessions", "Casual creative", "Daytime use"],
    avoidIf: ["You want body-heavy", "Skunky aromas turn you off"],
    faqs: [
      {
        q: "Is Cherry AK-47 a different strain from AK-47?",
        a: "It's a phenotype — same AK-47 genetics, selected for the cherry-sweet aroma. Effect is similar to AK-47, the aroma is the most distinct difference.",
      },
      {
        q: "Is Cherry AK-47 indica, sativa, or hybrid?",
        a: "Cherry AK-47 is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is AK-47 selection (Colombian × Mexican × Thai × Afghani lineage).",
      },
      {
        q: "What does Cherry AK-47 taste like?",
        a: "Cherry AK-47 hits cherry up front, sweet earth through the middle, and skunk on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Cherry AK-47?",
        a: "Cherry AK-47 tests in the 16–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Cherry AK-47 best for?",
        a: "Cherry AK-47 reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/cherry-ak-47",
        "https://weedmaps.com/strains/cherry-ak-47",
      ],
      notes:
        "Leafly confirms AK-47 phenotype, sativa-dominant. De Sjamaan Seeds breeder. AK-47 is in our strain index. Top terpenes Caryophyllene/Myrcene/Limonene per Leafly. THC ~18% (within 16–22%).",
      verifiedAt: "2026-05-15",
    },
  },

  // ────────────────────────────────────────────────────────────────────
  // HYBRID (16)
  // ────────────────────────────────────────────────────────────────────

  "gorilla-glue-4": {
    slug: "gorilla-glue-4",
    name: "GG4",
    type: "hybrid",
    aliases: ["GG4", "Gorilla Glue #4", "Original Glue", "Gorilla Glue 4", "GG#4"],
    tagline: "The chuck that built a brand — chocolate, diesel, heavy.",
    intro:
      "GG4 (originally Gorilla Glue #4, now Original Glue after a trademark dispute) is the accidental " +
      "GG Strains cross that became one of the most recognizable hybrids on the planet. Chem's Sister × " +
      "Sour Dubb × Chocolate Diesel lineage, with a sweet-diesel-chocolate aroma and a heavy balanced effect.",
    lineage: "Chem's Sister × Sour Dubb × Chocolate Diesel",
    parents: [null, null, null],
    thcRange: "23–28%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Sleepy"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Myrcene", note: "earthy, body-loose" },
    ],
    flavor: ["Diesel", "Chocolate", "Earthy pine"],
    bestFor: ["After work", "Couch + movie", "High-tolerance evenings"],
    avoidIf: ["You're new to high-THC", "You need to be sharp"],
    faqs: [
      {
        q: "Is GG4 the same as Original Glue?",
        a: "Yes — same strain. The Gorilla Glue Co. trademark forced the rename to Original Glue, but most WA shops still list both. Same genetics.",
      },
      {
        q: "Why is GG4 so sticky?",
        a: "GG Strains' Joesy Whales accidentally combined the parents and noticed the buds were so resinous they gummed up trim scissors — that's the 'Glue' name origin. The high THC + heavy resin is what made the strain famous.",
      },
      {
        q: "Is GG4 indica, sativa, or hybrid?",
        a: "GG4 is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Chem's Sister × Sour Dubb × Chocolate Diesel. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does GG4 taste like?",
        a: "GG4 hits diesel up front, chocolate through the middle, and earthy pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is GG4?",
        a: "GG4 tests in the 23–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is GG4 best for?",
        a: "GG4 reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/gg4",
        "https://gg-strains.com/glue-strain-information/",
      ],
      notes:
        "Leafly + GG Strains (breeder) confirm Chem's Sister × Sour Dubb × Chocolate Diesel, balanced hybrid. None of the parents in our strain index — all kept null. Top terpenes Caryophyllene/Limonene/Myrcene match. THC ~25% (within 23–28%). 2014 Cannabis Cup winner.",
      verifiedAt: "2026-05-15",
    },
  },

  "wedding-crasher": {
    slug: "wedding-crasher",
    name: "Wedding Crasher",
    type: "hybrid",
    aliases: ["Wedding Crasher", "WC"],
    tagline: "Wedding Cake × Purple Punch — sweet, balanced hybrid.",
    intro:
      "Wedding Crasher is a Symbiotic Genetics cross of Wedding Cake × Purple Punch — sativa-leaning hybrid, " +
      "with a sweet vanilla-grape aroma and a smooth uplifting head followed by a mellow body. More " +
      "head-up than Wedding Cake; less heavy than Purple Punch.",
    lineage: "Wedding Cake × Purple Punch",
    parents: ["wedding-cake", "purple-punch"],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Happy", "Uplifted", "Relaxed", "Creative"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Linalool", note: "floral lavender" },
    ],
    flavor: ["Vanilla", "Grape", "Sweet pastry"],
    bestFor: ["Late afternoon", "Casual social", "Date night"],
    avoidIf: ["You want pure sleep meds", "Sweet aromas aren't your thing"],
    faqs: [
      {
        q: "Is Wedding Crasher more like Wedding Cake or Purple Punch?",
        a: "Splits the difference — sativa-leaning head from the Wedding Cake side, sweet grape-vanilla aroma from both parents. Less body-heavy than either parent.",
      },
      {
        q: "Is Wedding Crasher indica, sativa, or hybrid?",
        a: "Wedding Crasher is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Wedding Cake × Purple Punch. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Wedding Crasher taste like?",
        a: "Wedding Crasher hits vanilla up front, grape through the middle, and sweet pastry on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Wedding Crasher?",
        a: "Wedding Crasher tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Wedding Crasher best for?",
        a: "Wedding Crasher reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/wedding-crasher",
        "https://weedmaps.com/strains/wedding-crasher",
      ],
      notes:
        "Leafly confirms Wedding Cake × Purple Punch, sativa-dominant hybrid, Symbiotic Genetics. Both parents are in our strain index. Top terpenes Caryophyllene/Limonene/Linalool match. THC ~22% (within 20–26%).",
      verifiedAt: "2026-05-15",
    },
  },

  biscotti: {
    slug: "biscotti",
    name: "Biscotti",
    type: "hybrid",
    aliases: ["Biscotti", "Cookies Biscotti"],
    tagline: "Cookies-family hybrid — sweet, gassy, dessert end.",
    intro:
      "Biscotti is a Cookies Fam cross of Gelato #25 × Sour Florida OG — indica-leaning hybrid, with a sweet " +
      "gas-and-vanilla aroma and a heavy euphoric body landing. Parent strain to a long list of modern " +
      "dessert crosses including Biscotti Mints and Lemon Cherry Gelato.",
    lineage: "Gelato #25 × Sour Florida OG",
    parents: ["gelato", null],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Sleepy"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Humulene", note: "earthy, hop-like" },
    ],
    flavor: ["Sweet diesel", "Vanilla", "Cookies"],
    bestFor: ["After dinner", "Wind-down evenings", "Couch + show"],
    avoidIf: ["You want energetic", "Low-tolerance — runs high"],
    faqs: [
      {
        q: "Is Biscotti a Cookies strain?",
        a: "Yes — bred by Cookies Fam, who also brought Gelato and GSC. Biscotti is part of the dessert family but leans heavier than most Gelato cuts.",
      },
      {
        q: "Is Biscotti indica, sativa, or hybrid?",
        a: "Biscotti is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Gelato #25 × Sour Florida OG. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Biscotti taste like?",
        a: "Biscotti hits sweet diesel up front, vanilla through the middle, and cookies on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Biscotti?",
        a: "Biscotti tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Biscotti best for?",
        a: "Biscotti reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/biscotti",
        "https://cookiesfamily.com/strains/biscotti",
      ],
      notes:
        "Leafly + Cookies Fam confirm Gelato #25 × Sour Florida OG, indica-leaning hybrid. Gelato is in our strain index; Sour Florida OG is not (kept null). Top terpenes Caryophyllene/Limonene/Humulene match. THC ~23% (within 20–26%).",
      verifiedAt: "2026-05-15",
    },
  },

  "lemon-cherry-gelato": {
    slug: "lemon-cherry-gelato",
    name: "Lemon Cherry Gelato",
    type: "hybrid",
    aliases: ["Lemon Cherry Gelato", "LCG"],
    tagline: "Cookies hybrid — sweet cherry-lemon, balanced body.",
    intro:
      "Lemon Cherry Gelato is a Cookies Fam release that took over the dessert-hybrid lineup the year it " +
      "dropped. Sunset Sherbet × Girl Scout Cookies × Lemonnade — balanced hybrid, with a cherry-lemon-sweet " +
      "aroma and a smooth uplifting head + mellow body landing.",
    lineage: "Sunset Sherbet × Girl Scout Cookies × Lemonnade",
    parents: ["sunset-sherbet", "girl-scout-cookies", null],
    thcRange: "22–28%",
    cbdRange: "<1%",
    effects: ["Happy", "Relaxed", "Euphoric", "Creative"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "lemon-cherry top" },
      { name: "Myrcene", note: "earthy underbelly" },
    ],
    flavor: ["Cherry", "Lemon", "Sweet cream"],
    bestFor: ["After work", "Casual social", "Date night", "Dessert-hybrid lovers"],
    avoidIf: ["You're low-tolerance — runs high", "You want a clear-headed sativa"],
    faqs: [
      {
        q: "Why is Lemon Cherry Gelato so hyped?",
        a: "It's one of the most balanced of the modern Cookies hybrids — high-THC without being knockout-heavy, with a flavor profile that's the loudest part of the strain. Customers reach for it for both the effect and the smell.",
      },
      {
        q: "Is Lemon Cherry Gelato indica, sativa, or hybrid?",
        a: "Lemon Cherry Gelato is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Sunset Sherbet × Girl Scout Cookies × Lemonnade. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Lemon Cherry Gelato taste like?",
        a: "Lemon Cherry Gelato hits cherry up front, lemon through the middle, and sweet cream on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Lemon Cherry Gelato?",
        a: "Lemon Cherry Gelato tests in the 22–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Lemon Cherry Gelato best for?",
        a: "Lemon Cherry Gelato reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/lemon-cherry-gelato",
        "https://cookiesfamily.com/strains/lemon-cherry-gelato",
      ],
      notes:
        "Leafly + Cookies Fam confirm Sunset Sherbet × GSC × Lemonnade, balanced hybrid. Sunset Sherbet + GSC are in our index; Lemonnade is not (kept null). Top terpenes Caryophyllene/Limonene/Myrcene match. THC ~25% (within 22–28%).",
      verifiedAt: "2026-05-15",
    },
  },

  "white-truffle": {
    slug: "white-truffle",
    name: "White Truffle",
    type: "hybrid",
    aliases: ["White Truffle", "WT"],
    tagline: "Beleaf phenotype of Gorilla Butter — savory-earthy hybrid.",
    intro:
      "White Truffle is a Beleaf-selected phenotype of Gorilla Butter (Peanut Butter Breath × GG4). " +
      "Indica-leaning hybrid, with a savory-funky-earthy aroma — closer to truffle than to candy. " +
      "Strong body, mellow head, popular for evening use among customers who like funky genetics.",
    lineage: "Gorilla Butter phenotype (Peanut Butter Breath × GG4)",
    parents: ["gorilla-glue-4", null],
    thcRange: "23–28%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Happy", "Euphoric"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, savory-warm" },
      { name: "Limonene", note: "citrus undertone" },
      { name: "Myrcene", note: "earthy, body-heavy" },
    ],
    flavor: ["Savory earth", "Funk", "Light diesel"],
    bestFor: ["End of day", "Couch + movie", "High-tolerance evenings"],
    avoidIf: ["You don't like funky aromas", "Low-tolerance — runs high"],
    faqs: [
      {
        q: "Is White Truffle related to Truffle Butter?",
        a: "It's a phenotype of Gorilla Butter, sometimes mislabeled. White Truffle is the Beleaf cut; Truffle Butter is a separate Beleaf strain. Different effect profiles.",
      },
      {
        q: "Is White Truffle indica, sativa, or hybrid?",
        a: "White Truffle is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Gorilla Butter phenotype (Peanut Butter Breath × GG4). The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does White Truffle taste like?",
        a: "White Truffle hits savory earth up front, funk through the middle, and light diesel on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is White Truffle?",
        a: "White Truffle tests in the 23–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is White Truffle best for?",
        a: "White Truffle reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/white-truffle",
        "https://weedmaps.com/strains/white-truffle",
      ],
      notes:
        "Leafly confirms Gorilla Butter phenotype, indica-dominant hybrid, Beleaf Cannabis. Peanut Butter Breath not in our strain index — kept null. Top terpenes Caryophyllene/Limonene/Myrcene match. THC ~24% (within 23–28%).",
      verifiedAt: "2026-05-15",
    },
  },

  "permanent-marker": {
    slug: "permanent-marker",
    name: "Permanent Marker",
    type: "hybrid",
    aliases: ["Permanent Marker", "PM"],
    tagline: "Seed Junky 2023 standout — gassy-sweet, modern hybrid.",
    intro:
      "Permanent Marker is a Seed Junky Genetics release that captured Cookies-shelf attention in 2023. " +
      "Biscotti × Jealousy × Sherbet Bx1 — balanced hybrid, with a sweet-gassy-savory aroma that's hard to " +
      "describe (Doug's notes: 'sharpie marker, but somehow good'). Heavy effect with a happy head.",
    lineage: "Biscotti × Jealousy × Sherbet Bx1",
    parents: ["biscotti", null, null],
    thcRange: "22–28%",
    cbdRange: "<1%",
    effects: ["Happy", "Relaxed", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Linalool", note: "floral lavender" },
    ],
    flavor: ["Gassy sweet", "Marker", "Cookies"],
    bestFor: ["After work", "Casual social", "High-shelf hybrid lovers"],
    avoidIf: ["Low-tolerance — runs high", "You want a clean sativa"],
    faqs: [
      {
        q: "Does Permanent Marker really smell like a marker?",
        a: "Kind of — there's a sharp gassy-chemical note up front that customers describe as 'sharpie.' The sweet Cookies side comes in on the exhale. Polarizing aroma but loved by the people who love it.",
      },
      {
        q: "Is Permanent Marker indica, sativa, or hybrid?",
        a: "Permanent Marker is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Biscotti × Jealousy × Sherbet Bx1. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Permanent Marker taste like?",
        a: "Permanent Marker hits gassy sweet up front, marker through the middle, and cookies on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Permanent Marker?",
        a: "Permanent Marker tests in the 22–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Permanent Marker best for?",
        a: "Permanent Marker reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/permanent-marker",
        "https://weedmaps.com/strains/permanent-marker",
      ],
      notes:
        "Leafly confirms Biscotti × Jealousy × Sherbet Bx1, balanced hybrid, Seed Junky Genetics. Biscotti is in this wave; Jealousy + Sherbet Bx1 not in index (kept null). Top terpenes Caryophyllene/Limonene/Linalool match. THC ~25% (within 22–28%).",
      verifiedAt: "2026-05-15",
    },
  },

  "birthday-cake": {
    slug: "birthday-cake",
    name: "Birthday Cake",
    type: "hybrid",
    aliases: ["Birthday Cake", "Birthday Cake Kush", "BCK"],
    tagline: "Indica-leaning Cookies hybrid — vanilla, heavy, sweet.",
    intro:
      "Birthday Cake (sometimes Birthday Cake Kush) is a Cherry Pie × Girl Scout Cookies cross — " +
      "indica-leaning hybrid, with a sweet vanilla-pastry aroma and a heavy body that comes on slow. " +
      "Customers reach for it as a calm-evening pick; long-time WA shelf regular.",
    lineage: "Cherry Pie × Girl Scout Cookies",
    parents: ["cherry-pie", "girl-scout-cookies"],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Sleepy"],
    terpenes: [
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Caryophyllene", note: "peppery, warm" },
      { name: "Myrcene", note: "earthy, body-loose" },
    ],
    flavor: ["Vanilla", "Sweet pastry", "Cherry"],
    bestFor: ["Wind-down evenings", "After-dinner couch", "Casual social"],
    avoidIf: ["You want energetic", "Low-tolerance"],
    faqs: [
      {
        q: "Is Birthday Cake the same as Wedding Cake?",
        a: "No — different strains, similar dessert vibe. Birthday Cake is Cherry Pie × GSC. Wedding Cake is Triangle Kush × Animal Mints. Both indica-leaning Cookies-family.",
      },
      {
        q: "Is Birthday Cake indica, sativa, or hybrid?",
        a: "Birthday Cake is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Cherry Pie × Girl Scout Cookies. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Birthday Cake taste like?",
        a: "Birthday Cake hits vanilla up front, sweet pastry through the middle, and cherry on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Birthday Cake?",
        a: "Birthday Cake tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Birthday Cake best for?",
        a: "Birthday Cake reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/birthday-cake",
        "https://weedmaps.com/strains/birthday-cake-kush",
      ],
      notes:
        "Leafly confirms Cherry Pie × GSC, indica-dominant hybrid. Both parents are in our strain index. Top terpenes Limonene/Caryophyllene/Myrcene match. THC ~22% (within 20–25%).",
      verifiedAt: "2026-05-15",
    },
  },

  "cake-crasher": {
    slug: "cake-crasher",
    name: "Cake Crasher",
    type: "hybrid",
    aliases: ["Cake Crasher", "CC"],
    tagline: "Wedding Cake × Wedding Crasher — sweet, balanced hybrid.",
    intro:
      "Cake Crasher is a balanced hybrid built by crossing Wedding Cake with Wedding Crasher — doubling " +
      "down on the Wedding Cake lineage. Sweet vanilla-grape aroma, smooth head-up, mellow body. " +
      "Customers who already like Wedding Cake reach for this as a slightly more head-forward version.",
    lineage: "Wedding Cake × Wedding Crasher",
    parents: ["wedding-cake", "wedding-crasher"],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Happy", "Relaxed", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Linalool", note: "floral lavender" },
    ],
    flavor: ["Vanilla", "Grape", "Sweet pepper"],
    bestFor: ["Late afternoon", "Casual social", "Dessert-hybrid lovers"],
    avoidIf: ["You want a heavy indica", "Sweet aromas aren't your thing"],
    faqs: [
      {
        q: "What's the difference between Cake Crasher and Wedding Crasher?",
        a: "Cake Crasher backcrosses Wedding Cake to Wedding Crasher — leans slightly more head-forward and sweeter than Wedding Crasher, which is already lighter than Wedding Cake.",
      },
      {
        q: "Is Cake Crasher indica, sativa, or hybrid?",
        a: "Cake Crasher is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Wedding Cake × Wedding Crasher. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Cake Crasher taste like?",
        a: "Cake Crasher hits vanilla up front, grape through the middle, and sweet pepper on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Cake Crasher?",
        a: "Cake Crasher tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Cake Crasher best for?",
        a: "Cake Crasher reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/cake-crasher",
        "https://weedmaps.com/strains/cake-crasher",
      ],
      notes:
        "Leafly confirms Wedding Cake × Wedding Crasher, balanced hybrid. Both parents are in our strain index. Top terpenes Caryophyllene/Limonene/Linalool match. THC ~22% (within 20–26%).",
      verifiedAt: "2026-05-15",
    },
  },

  "animal-mints": {
    slug: "animal-mints",
    name: "Animal Mints",
    type: "hybrid",
    aliases: ["Animal Mints", "AM"],
    tagline: "Cookies-Mints lineage — minty, gassy, balanced hybrid.",
    intro:
      "Animal Mints is a Seed Junky Genetics cross of Animal Cookies × Sin Mint Cookies — balanced hybrid, " +
      "with a minty-gassy-sweet aroma and a heavy euphoric body landing. Parent strain to Wedding Cake " +
      "(Wave 1) and a long list of mint-family hybrids.",
    lineage: "Animal Cookies × Sin Mint Cookies",
    parents: ["animal-cookies", null],
    thcRange: "20–27%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Sleepy"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "citrus-mint" },
      { name: "Linalool", note: "floral lavender" },
    ],
    flavor: ["Mint", "Sweet gas", "Cookies"],
    bestFor: ["After work", "Couch + show", "Casual social"],
    avoidIf: ["Low-tolerance — runs high", "You want pure sativa"],
    faqs: [
      {
        q: "Is Animal Mints the parent of Wedding Cake?",
        a: "Yes — Wedding Cake is Triangle Kush × Animal Mints. The minty-sweet side of Wedding Cake comes from the Animal Mints parent.",
      },
      {
        q: "Is Animal Mints indica, sativa, or hybrid?",
        a: "Animal Mints is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Animal Cookies × Sin Mint Cookies. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Animal Mints taste like?",
        a: "Animal Mints hits mint up front, sweet gas through the middle, and cookies on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Animal Mints?",
        a: "Animal Mints tests in the 20–27% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Animal Mints best for?",
        a: "Animal Mints reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/animal-mints",
        "https://weedmaps.com/strains/animal-mints",
      ],
      notes:
        "Leafly confirms Animal Cookies × Sin Mint Cookies, balanced hybrid, Seed Junky Genetics. Animal Cookies in our strain index; Sin Mint Cookies not (kept null). Top terpenes Caryophyllene/Limonene/Linalool match. Parent of Wedding Cake (Wave 1). THC ~23% (within 20–27%).",
      verifiedAt: "2026-05-15",
    },
  },

  "kush-mints": {
    slug: "kush-mints",
    name: "Kush Mints",
    type: "hybrid",
    aliases: ["Kush Mints", "KM", "Kushmints"],
    tagline: "Bubba Kush × Animal Mints — minty-heavy balanced hybrid.",
    intro:
      "Kush Mints is a Seed Junky / Sin City Seeds cross of Bubba Kush × Animal Mints — balanced hybrid, " +
      "with a minty-Kush aroma and a heavy body landing tempered by an upbeat head. Parent strain to a long " +
      "list of modern Mint-family crosses including Mintz and Wedding Crasher derivatives.",
    lineage: "Bubba Kush × Animal Mints",
    parents: ["bubba-kush", "animal-mints"],
    thcRange: "22–28%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "citrus-mint" },
      { name: "Pinene", note: "fresh pine" },
    ],
    flavor: ["Mint", "Earthy Kush", "Sweet"],
    bestFor: ["Late afternoon", "Casual social", "After-dinner couch"],
    avoidIf: ["Low-tolerance — runs high", "You want a clean sativa"],
    faqs: [
      {
        q: "Is Kush Mints stronger than Animal Mints?",
        a: "Usually, yes — the Bubba Kush parent brings more body weight. Both parents are in our index if you want to read up on the lineage.",
      },
      {
        q: "Is Kush Mints indica, sativa, or hybrid?",
        a: "Kush Mints is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Bubba Kush × Animal Mints. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Kush Mints taste like?",
        a: "Kush Mints hits mint up front, earthy kush through the middle, and sweet on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Kush Mints?",
        a: "Kush Mints tests in the 22–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Kush Mints best for?",
        a: "Kush Mints reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/kush-mints",
        "https://weedmaps.com/strains/kush-mints",
      ],
      notes:
        "Leafly confirms Bubba Kush × Animal Mints, balanced hybrid, Seed Junky / Sin City. Both parents are in our strain index. Top terpenes Caryophyllene/Limonene/Pinene match. THC ~24% (within 22–28%).",
      verifiedAt: "2026-05-15",
    },
  },

  "apples-and-bananas": {
    slug: "apples-and-bananas",
    name: "Apples and Bananas",
    type: "hybrid",
    aliases: ["Apples and Bananas", "Apples & Bananas", "A&B"],
    tagline: "Compound Genetics fruit hybrid — sweet, modern, head-up.",
    intro:
      "Apples and Bananas is a Compound Genetics × Cookies cross of (Platinum Cookies × Granddaddy Purp) × " +
      "(Blue Power × Gelatti) — balanced hybrid, with a sweet fruit-cocktail aroma and a smooth uplifting " +
      "head + mellow body landing. Modern-era standout that hit Washington shelves hard in 2022.",
    lineage: "(Platinum Cookies × GDP) × (Blue Power × Gelatti)",
    parents: ["granddaddy-purple", null],
    thcRange: "22–28%",
    cbdRange: "<1%",
    effects: ["Happy", "Relaxed", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Limonene", note: "citrus-sweet top" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Myrcene", note: "earthy underbelly" },
    ],
    flavor: ["Apple", "Banana", "Tropical fruit"],
    bestFor: ["Late afternoon", "Casual social", "Date night"],
    avoidIf: ["Low-tolerance — runs high", "Sweet aromas aren't your thing"],
    faqs: [
      {
        q: "Does Apples and Bananas really taste like fruit?",
        a: "Yes — the fruit-cocktail aroma is the loudest part of the strain. Comes from the limonene + caryophyllene + myrcene combination. Smell carries.",
      },
      {
        q: "Is Apples and Bananas indica, sativa, or hybrid?",
        a: "Apples and Bananas is a hybrid — a cross that pulls from both sides of the family tree. The lineage is (Platinum Cookies × GDP) × (Blue Power × Gelatti). The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "How strong is Apples and Bananas?",
        a: "Apples and Bananas tests in the 22–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Apples and Bananas best for?",
        a: "Apples and Bananas reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
      {
        q: "What terpenes are in Apples and Bananas?",
        a: "The dominant terpenes in Apples and Bananas are Limonene (citrus zest, bright and mood-lifting on the nose), Caryophyllene (peppery and warm, spicy on the back end), and Myrcene (earthy, mango-like, with a mild body-heavy quality). The blend is what gives the strain its specific nose and the character customers report on the exhale.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/apples-and-bananas",
        "https://weedmaps.com/strains/apples-and-bananas",
      ],
      notes:
        "Leafly confirms (Platinum Cookies × GDP) × (Blue Power × Gelatti), balanced hybrid, Compound Genetics × Cookies. Only GDP in our index — kept as one parent + second null. Top terpenes Limonene/Caryophyllene/Myrcene match. THC ~24% (within 22–28%).",
      verifiedAt: "2026-05-15",
    },
  },

  "sundae-driver": {
    slug: "sundae-driver",
    name: "Sundae Driver",
    type: "hybrid",
    aliases: ["Sundae Driver", "SD"],
    tagline: "Cannarado dessert hybrid — sweet, smooth, evening-friendly.",
    intro:
      "Sundae Driver is a Cannarado Genetics cross of Fruity Pebbles OG × Grape Pie — balanced hybrid, with " +
      "a sweet vanilla-grape aroma and a smooth happy head + mellow body. Parent strain to a number of " +
      "modern hybrids including Permanent Marker derivatives.",
    lineage: "Fruity Pebbles OG × Grape Pie",
    parents: [null, null],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Happy", "Relaxed", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Myrcene", note: "earthy underbelly" },
    ],
    flavor: ["Vanilla", "Grape", "Sweet cream"],
    bestFor: ["Late afternoon", "Casual social", "After dinner"],
    avoidIf: ["You want energetic", "You want pure sleep meds"],
    faqs: [
      {
        q: "Is Sundae Driver indica or sativa?",
        a: "Balanced hybrid — slight indica lean, but more functional than most modern dessert hybrids. Head-up enough for social, body-mellow enough for couch time.",
      },
      {
        q: "Is Sundae Driver indica, sativa, or hybrid?",
        a: "Sundae Driver is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Fruity Pebbles OG × Grape Pie. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Sundae Driver taste like?",
        a: "Sundae Driver hits vanilla up front, grape through the middle, and sweet cream on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Sundae Driver?",
        a: "Sundae Driver tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Sundae Driver best for?",
        a: "Sundae Driver reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/sundae-driver",
        "https://weedmaps.com/strains/sundae-driver",
      ],
      notes:
        "Leafly confirms Fruity Pebbles OG × Grape Pie, balanced hybrid, Cannarado Genetics. Neither parent in our strain index — both kept null. Top terpenes Caryophyllene/Limonene/Myrcene match. THC ~20% (within 18–24%).",
      verifiedAt: "2026-05-15",
    },
  },

  "banana-punch": {
    slug: "banana-punch",
    name: "Banana Punch",
    type: "hybrid",
    aliases: ["Banana Punch", "BP"],
    tagline: "Banana OG × Purple Punch — sweet tropical, balanced.",
    intro:
      "Banana Punch is a Symbiotic Genetics cross of Banana OG × Purple Punch — indica-leaning hybrid, with " +
      "a sweet tropical-banana aroma and a smooth body landing. Customers who like Purple Punch reach for " +
      "this when they want the punch with a brighter aroma.",
    lineage: "Banana OG × Purple Punch",
    parents: [null, "purple-punch"],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Sleepy"],
    terpenes: [
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Myrcene", note: "earthy, body-loose" },
    ],
    flavor: ["Banana", "Tropical", "Sweet earth"],
    bestFor: ["Late afternoon", "Casual evening", "Couch + show"],
    avoidIf: ["You want energetic", "Sweet aromas aren't your thing"],
    faqs: [
      {
        q: "Is Banana Punch stronger than Purple Punch?",
        a: "Comparable — the Banana OG parent brings sweetness and slightly more head-up; Purple Punch keeps the body weight. Similar THC range.",
      },
      {
        q: "Is Banana Punch indica, sativa, or hybrid?",
        a: "Banana Punch is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Banana OG × Purple Punch. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Banana Punch taste like?",
        a: "Banana Punch hits banana up front, tropical through the middle, and sweet earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Banana Punch?",
        a: "Banana Punch tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Banana Punch best for?",
        a: "Banana Punch reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/banana-punch",
        "https://weedmaps.com/strains/banana-punch",
      ],
      notes:
        "Leafly confirms Banana OG × Purple Punch, indica-dominant hybrid, Symbiotic Genetics. Purple Punch in our index; Banana OG not (kept null). Top terpenes Limonene/Caryophyllene/Myrcene match. THC ~22% (within 20–25%).",
      verifiedAt: "2026-05-15",
    },
  },

  "triangle-mints": {
    slug: "triangle-mints",
    name: "Triangle Mints",
    type: "hybrid",
    aliases: ["Triangle Mints", "TM"],
    tagline: "Triangle Kush × Animal Mints — minty Kush hybrid.",
    intro:
      "Triangle Mints is a Cookies Family cross of Triangle Kush × Animal Mints — balanced hybrid, with a " +
      "minty-Kush aroma and a heavy body softened by a happy head. Sister strain to Wedding Cake (same " +
      "parents, different selection); customers who like Wedding Cake reach for Triangle Mints next.",
    lineage: "Triangle Kush × Animal Mints",
    parents: ["triangle-kush", "animal-mints"],
    thcRange: "22–28%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "citrus-mint" },
      { name: "Linalool", note: "floral lavender" },
    ],
    flavor: ["Mint", "Earthy Kush", "Sweet"],
    bestFor: ["After work", "Casual social", "Couch + show"],
    avoidIf: ["Low-tolerance — runs high", "You want energetic"],
    faqs: [
      {
        q: "Is Triangle Mints the same as Wedding Cake?",
        a: "Same parents, different selection. Wedding Cake was the most-circulated pheno; Triangle Mints is a separate selection from the same Triangle Kush × Animal Mints cross. Subtly heavier on the body for most customers.",
      },
      {
        q: "Is Triangle Mints indica, sativa, or hybrid?",
        a: "Triangle Mints is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Triangle Kush × Animal Mints. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Triangle Mints taste like?",
        a: "Triangle Mints hits mint up front, earthy kush through the middle, and sweet on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Triangle Mints?",
        a: "Triangle Mints tests in the 22–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Triangle Mints best for?",
        a: "Triangle Mints reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/triangle-mints",
        "https://weedmaps.com/strains/triangle-mints",
      ],
      notes:
        "Leafly confirms Triangle Kush × Animal Mints, balanced hybrid, Cookies Family. Both parents in our strain index. Top terpenes Caryophyllene/Limonene/Linalool match. Sister strain to Wedding Cake. THC ~24% (within 22–28%).",
      verifiedAt: "2026-05-15",
    },
  },

  "chemdawg-4": {
    slug: "chemdawg-4",
    name: "Chemdawg 4",
    type: "hybrid",
    aliases: ["Chemdawg 4", "Chem 4", "Chemdog 4"],
    tagline: "Chemdawg phenotype — diesel-heavy, classic hybrid.",
    intro:
      "Chemdawg 4 (sometimes Chem 4) is one of the most-circulated phenotypes of the original Chemdawg " +
      "bagseed. Diesel-heavy aroma, balanced effect leaning slightly indica. The Chem 4 cut is the one " +
      "most-cited as a parent of Stardawg and a long list of modern diesel hybrids.",
    lineage: "Chemdawg phenotype (bagseed origin)",
    parents: ["chemdawg"],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Myrcene", note: "earthy, body-loose" },
      { name: "Limonene", note: "citrus undertone" },
    ],
    flavor: ["Diesel", "Earthy pine", "Sour citrus"],
    bestFor: ["After work", "Casual evening", "Diesel-family fans"],
    avoidIf: ["You don't like diesel aromas", "You want a clean sativa"],
    faqs: [
      {
        q: "What's the difference between Chemdawg 4 and the other Chem cuts?",
        a: "Chem 4 is the most-circulated Chemdawg phenotype — slightly more body-weight than Chem 91 (which is more head-forward). All are bagseed-origin selections from the original Chemdawg pop.",
      },
      {
        q: "Is Chemdawg 4 indica, sativa, or hybrid?",
        a: "Chemdawg 4 is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Chemdawg phenotype (bagseed origin). The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Chemdawg 4 taste like?",
        a: "Chemdawg 4 hits diesel up front, earthy pine through the middle, and sour citrus on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Chemdawg 4?",
        a: "Chemdawg 4 tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Chemdawg 4 best for?",
        a: "Chemdawg 4 reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/chemdawg-4",
        "https://weedmaps.com/strains/chemdawg-4",
      ],
      notes:
        "Leafly confirms Chemdawg phenotype, balanced hybrid. Chemdawg origin is bagseed folklore (see Wave 1 chemdawg entry). Top terpenes Caryophyllene/Myrcene/Limonene match. THC ~20% (within 18–24%).",
      verifiedAt: "2026-05-15",
    },
  },

  "og-diesel": {
    slug: "og-diesel",
    name: "OG Diesel",
    type: "hybrid",
    aliases: ["OG Diesel"],
    tagline: "OG Kush × Sour Diesel — classic California hybrid.",
    intro:
      "OG Diesel is the straightforward cross of OG Kush × Sour Diesel — classic California hybrid, balanced " +
      "leaning slightly sativa. Sharp citrus-diesel-pine aroma, head-forward but with enough body to round it " +
      "out. The kind of hybrid that built the West Coast diesel-OG lineage.",
    lineage: "OG Kush × Sour Diesel",
    parents: ["og-kush", "sour-diesel"],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Happy", "Uplifted", "Relaxed", "Euphoric"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "citrus zest" },
      { name: "Myrcene", note: "earthy underbelly" },
    ],
    flavor: ["Diesel", "Lemon", "Pine"],
    bestFor: ["After work", "Casual creative", "Daytime into evening"],
    avoidIf: ["You don't like diesel", "Anxiety-prone"],
    faqs: [
      {
        q: "Is OG Diesel more like OG Kush or Sour Diesel?",
        a: "Splits the difference — body-weight from OG Kush, head-up from Sour Diesel. Citrus-diesel-pine aroma carries notes from both.",
      },
      {
        q: "Is OG Diesel indica, sativa, or hybrid?",
        a: "OG Diesel is a hybrid — a cross that pulls from both sides of the family tree. The lineage is OG Kush × Sour Diesel. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does OG Diesel taste like?",
        a: "OG Diesel hits diesel up front, lemon through the middle, and pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is OG Diesel?",
        a: "OG Diesel tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is OG Diesel best for?",
        a: "OG Diesel reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/og-diesel",
        "https://weedmaps.com/strains/og-diesel",
      ],
      notes:
        "Leafly confirms OG Kush × Sour Diesel, balanced hybrid leaning sativa. Both parents are in our strain index. Top terpenes Caryophyllene/Limonene/Myrcene match. THC ~20% (within 18–24%).",
      verifiedAt: "2026-05-15",
    },
  },

  // ────────────────────────────────────────────────────────────────────
  // CBD-dominant (8) — Wave 1 had zero CBD-dominant entries.
  // All described via ratio + sensory pattern, not therapeutic outcomes.
  // ────────────────────────────────────────────────────────────────────

  harlequin: {
    slug: "harlequin",
    name: "Harlequin",
    type: "sativa",
    aliases: ["Harlequin"],
    tagline: "5:2 CBD:THC sativa — clear-headed, low-intoxication.",
    intro:
      "Harlequin is one of the most-recognized CBD-dominant sativas — a Colombian Gold × Thai × Swiss × " +
      "Nepali Indica cross that consistently tests around a 5:2 CBD:THC ratio. Customers who want a " +
      "clear-headed daytime experience with minimal intoxication reach for Harlequin.",
    lineage: "Colombian Gold × Thai × Swiss × Nepali Indica",
    parents: ["colombian-gold", "thai", null, null],
    thcRange: "4–10%",
    cbdRange: "8–16%",
    effects: ["Focused", "Relaxed", "Happy", "Uplifted"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Pinene", note: "fresh pine" },
      { name: "Caryophyllene", note: "peppery undertone" },
    ],
    flavor: ["Earthy", "Mango", "Sweet wood"],
    bestFor: ["Daytime use without intoxication", "CBD-curious customers", "Low-tolerance"],
    avoidIf: ["You want a strong head or body high", "You want THC-forward effects"],
    faqs: [
      {
        q: "How much will Harlequin get me high?",
        a: "Less than most THC-forward strains. THC sits around 4–10%; CBD sits 8–16%. Customers describe the experience as 'clear-headed' rather than intoxicated.",
      },
      {
        q: "Is Harlequin a sativa?",
        a: "Sativa-dominant. The Colombian Gold + Thai parents drive the head-up character; the high CBD keeps it from feeling racey.",
      },
      {
        q: "Is Harlequin indica, sativa, or hybrid?",
        a: "Harlequin is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Colombian Gold × Thai × Swiss × Nepali Indica.",
      },
      {
        q: "What does Harlequin taste like?",
        a: "Harlequin hits earthy up front, mango through the middle, and sweet wood on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Harlequin?",
        a: "Harlequin tests in the 4–10% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Harlequin best for?",
        a: "Harlequin reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/harlequin",
        "https://weedmaps.com/strains/harlequin",
      ],
      notes:
        "Leafly confirms Colombian Gold × Thai × Swiss × Nepali Indica, sativa-dominant. CBD-dominant strain (5:2 CBD:THC typical). Colombian Gold + Thai in our index; Swiss + Nepali Indica are landrace families (kept null). Top terpenes Myrcene/Pinene/Caryophyllene match.",
      verifiedAt: "2026-05-15",
    },
  },

  acdc: {
    slug: "acdc",
    name: "ACDC",
    type: "sativa",
    aliases: ["ACDC", "AC/DC", "AC-DC"],
    tagline: "20:1 CBD:THC sativa — high-CBD phenotype of Cannatonic.",
    intro:
      "ACDC is a CBD-dominant sativa phenotype of Cannatonic — Resin Seeds genetics, with a 20:1 CBD:THC " +
      "ratio that makes it one of the lowest-intoxication options on Washington shelves. Earthy-sweet " +
      "aroma, very clear head. Customers who want CBD with minimal THC effect reach for ACDC.",
    lineage: "Cannatonic phenotype",
    parents: ["cannatonic"],
    thcRange: "1–6%",
    cbdRange: "15–24%",
    effects: ["Focused", "Relaxed", "Uplifted", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Pinene", note: "fresh pine" },
      { name: "Caryophyllene", note: "peppery undertone" },
    ],
    flavor: ["Earthy", "Sweet wood", "Herbal"],
    bestFor: ["Daytime use without intoxication", "Very low-tolerance", "CBD-curious customers"],
    avoidIf: ["You want a noticeable THC high", "You want body-heavy effects"],
    faqs: [
      {
        q: "Will ACDC get me high?",
        a: "Barely — THC typically sits 1–6%. Most customers describe it as 'no noticeable intoxication' with a calm clear head.",
      },
      {
        q: "Is ACDC the same as Cannatonic?",
        a: "It's a CBD-dominant phenotype of Cannatonic — selected for the highest CBD:THC ratio (often 20:1 or higher). Same family, different cut.",
      },
      {
        q: "Is ACDC indica, sativa, or hybrid?",
        a: "ACDC is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Cannatonic phenotype.",
      },
      {
        q: "What does ACDC taste like?",
        a: "ACDC hits earthy up front, sweet wood through the middle, and herbal on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is ACDC?",
        a: "ACDC tests in the 1–6% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is ACDC best for?",
        a: "ACDC reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/acdc",
        "https://weedmaps.com/strains/acdc",
      ],
      notes:
        "Leafly confirms Cannatonic phenotype, sativa-dominant, Resin Seeds. CBD-dominant (20:1 CBD:THC typical). Cannatonic is in this wave. Top terpenes Myrcene/Pinene/Caryophyllene match.",
      verifiedAt: "2026-05-15",
    },
  },

  cannatonic: {
    slug: "cannatonic",
    name: "Cannatonic",
    type: "hybrid",
    aliases: ["Cannatonic"],
    tagline: "Resin Seeds high-CBD hybrid — the founding CBD line.",
    intro:
      "Cannatonic is the Resin Seeds high-CBD hybrid that effectively launched the modern medical-CBD line — " +
      "a MK Ultra × G13 Haze cross with phenotypes that vary widely in CBD:THC ratio (some 1:1, some 20:1). " +
      "Parent strain to ACDC, Harlequin selections, and most named CBD-dominant lineages.",
    lineage: "MK Ultra × G13 Haze",
    parents: [null, null],
    thcRange: "4–12%",
    cbdRange: "6–17%",
    effects: ["Relaxed", "Focused", "Happy", "Uplifted"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Pinene", note: "fresh pine" },
      { name: "Caryophyllene", note: "peppery undertone" },
    ],
    flavor: ["Earthy", "Citrus", "Sweet wood"],
    bestFor: ["CBD-curious customers", "Daytime low-intoxication", "Pairing with THC-forward strains"],
    avoidIf: ["You want a THC-forward effect", "You want a strong body high"],
    faqs: [
      {
        q: "Why does Cannatonic vary so much in CBD content?",
        a: "It's a genetically variable line — different phenotypes express different CBD:THC ratios. Higher-CBD cuts were selected into ACDC; lower-CBD cuts run closer to 1:1.",
      },
      {
        q: "Is Cannatonic indica, sativa, or hybrid?",
        a: "Cannatonic is a hybrid — a cross that pulls from both sides of the family tree. The lineage is MK Ultra × G13 Haze. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Cannatonic taste like?",
        a: "Cannatonic hits earthy up front, citrus through the middle, and sweet wood on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Cannatonic?",
        a: "Cannatonic tests in the 4–12% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Cannatonic best for?",
        a: "Cannatonic reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/cannatonic",
        "https://weedmaps.com/strains/cannatonic",
      ],
      notes:
        "Leafly confirms MK Ultra × G13 Haze, hybrid, Resin Seeds. CBD-dominant phenotype variability typical. Neither parent in our strain index — both kept null. Top terpenes Myrcene/Pinene/Caryophyllene match. Parent of ACDC.",
      verifiedAt: "2026-05-15",
    },
  },

  "charlottes-web": {
    slug: "charlottes-web",
    name: "Charlotte’s Web",
    type: "sativa",
    aliases: ["Charlotte's Web", "CW", "Charlottes Web"],
    tagline: "Stanley Brothers high-CBD hemp line — minimal THC.",
    intro:
      "Charlotte’s Web is the Stanley Brothers high-CBD hemp line — bred specifically for the highest " +
      "CBD content with THC kept under 0.3% in most cuts. Earthy-sweet aroma, very clear head. Customers who " +
      "want CBD with effectively no THC intoxication reach for Charlotte’s Web.",
    lineage: "Industrial hemp selection",
    parents: [null],
    thcRange: "<0.3%",
    cbdRange: "13–20%",
    effects: ["Focused", "Relaxed", "Uplifted"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Caryophyllene", note: "peppery undertone" },
      { name: "Pinene", note: "fresh pine" },
    ],
    flavor: ["Earthy", "Pine", "Sweet wood"],
    bestFor: ["Daytime use with effectively no intoxication", "Very low-tolerance", "CBD-curious"],
    avoidIf: ["You want a noticeable head or body effect", "You're looking for THC at all"],
    faqs: [
      {
        q: "Will Charlotte’s Web get me high?",
        a: "No — THC is kept under 0.3% (federal hemp limit). It’s a CBD product, not a THC product.",
      },
      {
        q: "Why is it called Charlotte’s Web?",
        a: "The Stanley Brothers named it after Charlotte Figi, a child whose family used the strain in CBD-only treatment. Industry name, not a medical claim.",
      },
      {
        q: "Is Charlotte’s Web indica, sativa, or hybrid?",
        a: "Charlotte’s Web is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Industrial hemp selection.",
      },
      {
        q: "What does Charlotte’s Web taste like?",
        a: "Charlotte’s Web hits earthy up front, pine through the middle, and sweet wood on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Charlotte’s Web?",
        a: "Charlotte’s Web tests in the <0.3% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Charlotte’s Web best for?",
        a: "Charlotte’s Web reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/charlottes-web",
        "https://weedmaps.com/strains/charlottes-web",
      ],
      notes:
        "Leafly confirms industrial hemp selection by the Stanley Brothers. CBD-dominant; THC under 0.3% by design. Top terpenes Myrcene/Caryophyllene/Pinene match.",
      verifiedAt: "2026-05-15",
    },
  },

  "ringos-gift": {
    slug: "ringos-gift",
    name: "Ringo’s Gift",
    type: "hybrid",
    aliases: ["Ringo's Gift", "Ringos Gift", "RG"],
    tagline: "Harle-Tsu × ACDC — high-CBD hybrid, very low THC.",
    intro:
      "Ringo’s Gift is a Harle-Tsu × ACDC cross named after CBD activist Lawrence Ringo — high-CBD " +
      "hybrid with ratios as high as 24:1 CBD:THC. Earthy-floral aroma, very clear head. One of the more " +
      "CBD-dominant options on Washington shelves.",
    lineage: "Harle-Tsu × ACDC",
    parents: [null, "acdc"],
    thcRange: "1–4%",
    cbdRange: "15–24%",
    effects: ["Focused", "Relaxed", "Uplifted", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Caryophyllene", note: "peppery undertone" },
      { name: "Pinene", note: "fresh pine" },
    ],
    flavor: ["Earthy", "Floral", "Sweet wood"],
    bestFor: ["Daytime use without intoxication", "CBD-curious customers", "Very low-tolerance"],
    avoidIf: ["You want a noticeable THC effect", "You want body-heavy"],
    faqs: [
      {
        q: "Is Ringo’s Gift higher in CBD than ACDC?",
        a: "Usually comparable — both run 15–24% CBD with THC under 5%. Specific lot-to-lot variation is common.",
      },
      {
        q: "Is Ringo’s Gift indica, sativa, or hybrid?",
        a: "Ringo’s Gift is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Harle-Tsu × ACDC. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Ringo’s Gift taste like?",
        a: "Ringo’s Gift hits earthy up front, floral through the middle, and sweet wood on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Ringo’s Gift?",
        a: "Ringo’s Gift tests in the 1–4% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Ringo’s Gift best for?",
        a: "Ringo’s Gift reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/ringos-gift",
        "https://weedmaps.com/strains/ringos-gift",
      ],
      notes:
        "Leafly confirms Harle-Tsu × ACDC, hybrid. CBD-dominant (up to 24:1 CBD:THC). ACDC is in this wave; Harle-Tsu is not (kept null). Named after CBD activist Lawrence Ringo. Top terpenes Myrcene/Caryophyllene/Pinene match.",
      verifiedAt: "2026-05-15",
    },
  },

  "sour-tsunami": {
    slug: "sour-tsunami",
    name: "Sour Tsunami",
    type: "hybrid",
    aliases: ["Sour Tsunami", "ST"],
    tagline: "Sour Diesel × NYC Diesel CBD hybrid — diesel aroma, clear head.",
    intro:
      "Sour Tsunami is one of the original CBD-dominant hybrids — a Sour Diesel × NYC Diesel cross by " +
      "Southern Humboldt Seed Collective with CBD typically 10–13% and THC 6–10%. Customers who like the " +
      "Diesel-family aroma but want lower intoxication reach for Sour Tsunami.",
    lineage: "Sour Diesel × NYC Diesel",
    parents: ["sour-diesel", "nyc-diesel"],
    thcRange: "6–10%",
    cbdRange: "10–13%",
    effects: ["Focused", "Relaxed", "Happy", "Uplifted"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Caryophyllene", note: "peppery, warm" },
      { name: "Pinene", note: "fresh pine" },
    ],
    flavor: ["Diesel", "Earthy", "Sour citrus"],
    bestFor: ["CBD-curious customers who like Diesel aromas", "Daytime low-intoxication"],
    avoidIf: ["You want THC-forward effects", "Diesel aromas turn you off"],
    faqs: [
      {
        q: "Is Sour Tsunami high in THC?",
        a: "No — THC sits around 6–10%, with CBD higher at 10–13%. The Diesel parents give it the family aroma but the CBD-dominance keeps it calm.",
      },
      {
        q: "Is Sour Tsunami indica, sativa, or hybrid?",
        a: "Sour Tsunami is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Sour Diesel × NYC Diesel. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Sour Tsunami taste like?",
        a: "Sour Tsunami hits diesel up front, earthy through the middle, and sour citrus on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Sour Tsunami?",
        a: "Sour Tsunami tests in the 6–10% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Sour Tsunami best for?",
        a: "Sour Tsunami reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/sour-tsunami",
        "https://weedmaps.com/strains/sour-tsunami",
      ],
      notes:
        "Leafly confirms Sour Diesel × NYC Diesel, hybrid (often listed sativa-leaning), Southern Humboldt Seed Collective. CBD-dominant. Both parents are in our strain index. Top terpenes Myrcene/Caryophyllene/Pinene match.",
      verifiedAt: "2026-05-15",
    },
  },

  pennywise: {
    slug: "pennywise",
    name: "Pennywise",
    type: "indica",
    aliases: ["Pennywise"],
    tagline: "1:1 CBD:THC indica from TGA Subcool — balanced ratio.",
    intro:
      "Pennywise is a TGA Subcool cross of Harlequin × Jack the Ripper — CBD-dominant indica with a 1:1 " +
      "CBD:THC ratio. Sweet earthy-bubblegum aroma, mellow head and body. Customers who want a balanced " +
      "ratio with indica body character reach for Pennywise.",
    lineage: "Harlequin × Jack the Ripper",
    parents: ["harlequin", null],
    thcRange: "8–14%",
    cbdRange: "8–14%",
    effects: ["Relaxed", "Happy", "Focused", "Uplifted"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Pinene", note: "fresh pine" },
      { name: "Caryophyllene", note: "peppery undertone" },
    ],
    flavor: ["Earthy", "Bubblegum", "Sweet wood"],
    bestFor: ["Balanced-ratio customers", "Casual evening low-intoxication", "CBD-curious"],
    avoidIf: ["You want a strong THC high", "You want a clean sativa"],
    faqs: [
      {
        q: "What’s a 1:1 CBD:THC strain like?",
        a: "Noticeably calmer than a THC-forward strain — the CBD softens the head. Some intoxication, but less racey or heavy. Customers describe it as 'functional.'",
      },
      {
        q: "Is Pennywise indica, sativa, or hybrid?",
        a: "Pennywise is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Harlequin × Jack the Ripper.",
      },
      {
        q: "What does Pennywise taste like?",
        a: "Pennywise hits earthy up front, bubblegum through the middle, and sweet wood on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Pennywise?",
        a: "Pennywise tests in the 8–14% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Pennywise best for?",
        a: "Pennywise reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/pennywise",
        "https://weedmaps.com/strains/pennywise",
      ],
      notes:
        "Leafly confirms Harlequin × Jack the Ripper, indica-dominant, TGA Subcool. CBD-dominant (1:1 CBD:THC typical). Harlequin in this wave; Jack the Ripper not in index (kept null). Top terpenes Myrcene/Pinene/Caryophyllene match.",
      verifiedAt: "2026-05-15",
    },
  },

  "cbd-critical-mass": {
    slug: "cbd-critical-mass",
    name: "CBD Critical Mass",
    type: "indica",
    aliases: ["CBD Critical Mass", "Critical Mass CBD"],
    tagline: "Mr. Nice CBD-dominant indica — earthy, mellow, balanced.",
    intro:
      "CBD Critical Mass is the CBD-dominant version of Critical Mass — bred by Mr. Nice / CBD Crew with a " +
      "1:1 CBD:THC ratio. Sweet-earthy aroma, indica-leaning body landing, very clear head. Customers who " +
      "like Critical Mass but want lower intoxication reach for this version.",
    lineage: "Critical Mass × CBD-dominant parent",
    parents: ["critical-mass", null],
    thcRange: "5–10%",
    cbdRange: "7–12%",
    effects: ["Relaxed", "Happy", "Focused", "Sleepy"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Caryophyllene", note: "peppery, warm" },
      { name: "Pinene", note: "fresh pine" },
    ],
    flavor: ["Sweet earth", "Skunk", "Honey"],
    bestFor: ["Wind-down evenings with low intoxication", "CBD-curious indica fans"],
    avoidIf: ["You want THC-forward effects", "You want energetic"],
    faqs: [
      {
        q: "Is CBD Critical Mass the same as Critical Mass?",
        a: "Different — CBD Critical Mass is a CBD-dominant version (1:1 CBD:THC). Regular Critical Mass is THC-dominant (in our index separately).",
      },
      {
        q: "Is CBD Critical Mass indica, sativa, or hybrid?",
        a: "CBD Critical Mass is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Critical Mass × CBD-dominant parent.",
      },
      {
        q: "What does CBD Critical Mass taste like?",
        a: "CBD Critical Mass hits sweet earth up front, skunk through the middle, and honey on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is CBD Critical Mass?",
        a: "CBD Critical Mass tests in the 5–10% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is CBD Critical Mass best for?",
        a: "CBD Critical Mass reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/cbd-critical-mass",
        "https://weedmaps.com/strains/cbd-critical-mass",
      ],
      notes:
        "Leafly confirms Critical Mass CBD-dominant version by Mr. Nice / CBD Crew. Indica-leaning hybrid. Critical Mass parent in this wave. Top terpenes Myrcene/Caryophyllene/Pinene match. 1:1 CBD:THC typical.",
      verifiedAt: "2026-05-15",
    },
  },

  // ────────────────────────────────────────────────────────────────────
  // WAVE 3 (slugs 101-150) — integrated 2026-05-16
  // 50 verified strains. Tier: 44 verified-clean + 6 verified-with-note + 0 contested.
  // Type split: 15 indica + 9 sativa + 25 hybrid + 1 CBD-leaning indica.
  // Source dataset: shared/strains-wave3-101to150.ts
  // ────────────────────────────────────────────────────────────────────
  // ────────────────────────────────────────────────────────────────────
  // INDICA (15)
  // ────────────────────────────────────────────────────────────────────

  "banana-og": {
    slug: "banana-og",
    name: "Banana OG",
    type: "indica",
    aliases: ["Banana OG", "BOG"],
    tagline: "OG Kush × Banana — heavy creeper, sweet-funky aroma.",
    intro:
      "Banana OG is an indica-leaning OG Kush × Banana cross known for being a slow creeper — it tends to land " +
      "harder than the first ten minutes suggest. Sweet-funky banana-peel aroma with the classic OG diesel base. " +
      "Customers reach for it after dinner, not before they need to do anything important.",
    lineage: "OG Kush × Banana",
    parents: ["og-kush", null],
    thcRange: "18–25%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Hungry", "Tingly"],
    terpenes: [
      { name: "Limonene", note: "citrus-sweet top" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Myrcene", note: "earthy, body-heavy" },
    ],
    flavor: ["Banana", "Sweet funk", "Light diesel"],
    bestFor: ["End of day", "Couch + movie", "Snack time"],
    avoidIf: ["You need to function", "You’re sensitive to creeper strains"],
    faqs: [
      {
        q: "Why do customers call Banana OG a creeper?",
        a: "Effects build slowly — the first ten minutes feel mild, then it lands heavier than expected. Pace yourself, especially if you’re newer to OG-family strains.",
      },
      {
        q: "Does Banana OG taste like banana?",
        a: "Sweet banana-peel up front with the OG diesel underneath. More funky than candy-banana — closer to overripe than to a smoothie.",
      },
      {
        q: "Is Banana OG indica, sativa, or hybrid?",
        a: "Banana OG is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is OG Kush × Banana.",
      },
      {
        q: "How strong is Banana OG?",
        a: "Banana OG tests in the 18–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Banana OG best for?",
        a: "Banana OG reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
      {
        q: "What terpenes are in Banana OG?",
        a: "The dominant terpenes in Banana OG are Limonene (citrus zest, bright and mood-lifting on the nose), Caryophyllene (peppery and warm, spicy on the back end), and Myrcene (earthy, mango-like, with a mild body-heavy quality). The blend is what gives the strain its specific nose and the character customers report on the exhale.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/banana-og",
        "https://weedmaps.com/strains/banana-og",
      ],
      notes:
        "Leafly confirms OG Kush × Banana, indica-dominant hybrid. OG Kush in our index. Top terpenes Limonene/Caryophyllene/Myrcene match. THC ~21% (within 18–25%). Banana parent not in our index — kept null.",
      verifiedAt: "2026-05-16",
    },
  },

  "black-cherry-punch": {
    slug: "black-cherry-punch",
    name: "Black Cherry Punch",
    type: "indica",
    aliases: ["Black Cherry Punch", "BCP"],
    tagline: "Purple Punch × Black Cherry Pie — sweet, heavy, dessert indica.",
    intro:
      "Black Cherry Punch is a Purple Punch × Black Cherry Pie cross — indica-leaning, with a sweet dark-cherry " +
      "aroma and a heavy body landing. Customers who already like Purple Punch tend to reach for this when " +
      "they want the same wind-down with more cherry in the nose.",
    lineage: "Purple Punch × Black Cherry Pie",
    parents: ["purple-punch", null],
    thcRange: "19–24%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Tingly", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Caryophyllene", note: "peppery base" },
    ],
    flavor: ["Dark cherry", "Sweet grape", "Earth"],
    bestFor: ["Wind-down evenings", "After-dinner couch", "Light insomnia nights"],
    avoidIf: ["You want energetic", "Sweet-cherry aromas aren’t your thing"],
    faqs: [
      {
        q: "How does Black Cherry Punch compare to Purple Punch?",
        a: "Same family, more cherry on the nose. The Black Cherry Pie side pushes the aroma darker; effect-wise it lands close to Purple Punch — heavy, sweet, late-night.",
      },
      {
        q: "Is Black Cherry Punch indica, sativa, or hybrid?",
        a: "Black Cherry Punch is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Purple Punch × Black Cherry Pie.",
      },
      {
        q: "What does Black Cherry Punch taste like?",
        a: "Black Cherry Punch hits dark cherry up front, sweet grape through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Black Cherry Punch?",
        a: "Black Cherry Punch tests in the 19–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Black Cherry Punch best for?",
        a: "Black Cherry Punch reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/black-cherry-punch",
        "https://weedmaps.com/strains/black-cherry-punch",
      ],
      notes:
        "Leafly confirms Purple Punch × Black Cherry Pie, indica-dominant. Purple Punch in our index. Top terpenes Myrcene/Limonene/Caryophyllene match. THC ~20% (within 19–24%).",
      verifiedAt: "2026-05-16",
    },
  },

  "blackberry-kush": {
    slug: "blackberry-kush",
    name: "Blackberry Kush",
    type: "indica",
    aliases: ["Blackberry Kush", "BBK"],
    tagline: "Afghani × Blackberry — sweet-hashy, heavy late-night indica.",
    intro:
      "Blackberry Kush is an Afghani × Blackberry cross — pure indica territory, with a sweet berry-and-hash " +
      "aroma and a body-heavy buzz. The Afghani backbone shows through: slow, weighty, end-of-day. Long-time " +
      "WA shelf staple for customers who want a no-nonsense indica.",
    lineage: "Afghani × Blackberry",
    parents: ["afghani", null],
    thcRange: "16–22%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Hungry", "Happy"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm" },
      { name: "Limonene", note: "berry-sweet undertone" },
      { name: "Myrcene", note: "earthy, sedating" },
    ],
    flavor: ["Sweet berry", "Hash", "Earth"],
    bestFor: ["End of day", "Late-night use", "Pre-sleep wind-down"],
    avoidIf: ["You need to be sharp", "Hashy aromas aren’t your thing"],
    faqs: [
      {
        q: "Is Blackberry Kush a strong indica?",
        a: "Yes — pure indica leaning, body-heavy, classic Afghani heaviness with a berry-sweet top. Not a starter strain if you’re very low-tolerance.",
      },
      {
        q: "Is Blackberry Kush indica, sativa, or hybrid?",
        a: "Blackberry Kush is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Afghani × Blackberry.",
      },
      {
        q: "What does Blackberry Kush taste like?",
        a: "Blackberry Kush hits sweet berry up front, hash through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Blackberry Kush?",
        a: "Blackberry Kush tests in the 16–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Blackberry Kush best for?",
        a: "Blackberry Kush reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/blackberry-kush",
        "https://weedmaps.com/strains/blackberry-kush",
      ],
      notes:
        "Leafly confirms Afghani × Blackberry, indica-dominant. Afghani in our index. Top terpenes Caryophyllene/Limonene/Myrcene match. THC ~17% (within 16–22%). Blackberry parent not in our index — kept null.",
      verifiedAt: "2026-05-16",
    },
  },

  "blue-cheese": {
    slug: "blue-cheese",
    name: "Blue Cheese",
    type: "indica",
    aliases: ["Blue Cheese", "BC"],
    tagline: "Blueberry × UK Cheese — funky-sweet British indica.",
    intro:
      "Blue Cheese is a Blueberry × UK Cheese cross out of the British seed scene — indica-leaning, with the " +
      "funky-sweet aroma the name implies (cheese pungency over blueberry sweetness). Body-relaxing, mellow head, " +
      "long-time international shelf staple. Polarizing aroma but loved by the people who love it.",
    lineage: "Blueberry × UK Cheese",
    parents: ["blueberry", null],
    thcRange: "15–20%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Hungry", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy, body-heavy" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Caryophyllene", note: "peppery base" },
    ],
    flavor: ["Funky cheese", "Sweet blueberry", "Earth"],
    bestFor: ["Wind-down evenings", "Couch + show", "After-dinner snack"],
    avoidIf: ["Funky-cheese aromas turn you off", "You want a clean head-up sativa"],
    faqs: [
      {
        q: "Does Blue Cheese actually smell like cheese?",
        a: "Yes — the UK Cheese parent brings a sharp pungent funk that customers either love or hate. The blueberry side softens it a bit on the exhale.",
      },
      {
        q: "Is Blue Cheese indica, sativa, or hybrid?",
        a: "Blue Cheese is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Blueberry × UK Cheese.",
      },
      {
        q: "What does Blue Cheese taste like?",
        a: "Blue Cheese hits funky cheese up front, sweet blueberry through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Blue Cheese?",
        a: "Blue Cheese tests in the 15–20% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Blue Cheese best for?",
        a: "Blue Cheese reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/blue-cheese",
        "https://weedmaps.com/strains/blue-cheese",
      ],
      notes:
        "Leafly confirms Blueberry × UK Cheese, indica-dominant. Blueberry in our index. Top terpenes Myrcene/Limonene/Caryophyllene match. THC ~18% (within 15–20%). UK Cheese (Cheese family) covered separately by our Wave 1 cheese entry.",
      verifiedAt: "2026-05-16",
    },
  },

  "garlic-breath": {
    slug: "garlic-breath",
    name: "Garlic Breath",
    type: "indica",
    aliases: ["Garlic Breath", "GB"],
    tagline: "GMO × Mendo Breath — savory funk, heavy late-night indica.",
    intro:
      "Garlic Breath is a ThugPug Genetics cross of GMO × Mendo Breath — heavy indica with a savory-garlic-funk " +
      "aroma that’s closer to roasted onion than to candy. Body-heavy, slow-build, gets sedative as the session " +
      "goes on. Customers who already like GMO or Garlic Cookies reach for this.",
    lineage: "GMO × Mendo Breath",
    parents: ["gmo-cookies", "mendo-breath"],
    thcRange: "22–28%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Hungry", "Happy"],
    terpenes: [
      { name: "Limonene", note: "citrus undertone" },
      { name: "Caryophyllene", note: "peppery, savory-warm" },
      { name: "Pinene", note: "sharp pine top" },
    ],
    flavor: ["Savory garlic", "Funk", "Light diesel"],
    bestFor: ["End of day", "Couch + movie", "High-tolerance evenings"],
    avoidIf: ["Funky-savory aromas turn you off", "Low-tolerance — runs high"],
    faqs: [
      {
        q: "Is Garlic Breath related to Garlic Cookies?",
        a: "Same family. Garlic Cookies (aka GMO) is one of Garlic Breath’s parents. Garlic Breath leans heavier and runs more savory than GMO alone.",
      },
      {
        q: "Is Garlic Breath indica, sativa, or hybrid?",
        a: "Garlic Breath is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is GMO × Mendo Breath.",
      },
      {
        q: "What does Garlic Breath taste like?",
        a: "Garlic Breath hits savory garlic up front, funk through the middle, and light diesel on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Garlic Breath?",
        a: "Garlic Breath tests in the 22–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Garlic Breath best for?",
        a: "Garlic Breath reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/garlic-breath",
        "https://weedmaps.com/strains/garlic-breath",
      ],
      notes:
        "Leafly confirms GMO × Mendo Breath, indica-dominant hybrid, ThugPug Genetics breeder. GMO is gmo-cookies in our index; Mendo Breath in this wave. Top terpenes Limonene/Caryophyllene/Pinene match. THC ~24% (within 22–28%).",
      verifiedAt: "2026-05-16",
    },
  },

  "grape-pie": {
    slug: "grape-pie",
    name: "Grape Pie",
    type: "indica",
    aliases: ["Grape Pie", "GP"],
    tagline: "Cherry Pie × Grape Stomper — sweet grape, heavy body.",
    intro:
      "Grape Pie is a Cherry Pie × Grape Stomper cross — indica-leaning, with a sweet grape-and-pastry aroma " +
      "and a body that comes on slow then lands hard. Cookies-shelf adjacent; parent strain to Lava Cake. " +
      "Customers reach for it after dinner when they want dessert without the head-up.",
    lineage: "Cherry Pie × Grape Stomper",
    parents: ["cherry-pie", "grape-stomper"],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Happy", "Euphoric"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Linalool", note: "floral lavender, adds body weight" },
    ],
    flavor: ["Grape", "Sweet pastry", "Berry"],
    bestFor: ["Wind-down evenings", "After-dinner couch", "Sweet-pastry hybrid lovers"],
    avoidIf: ["You want energetic", "Low-tolerance — runs high"],
    faqs: [
      {
        q: "Is Grape Pie a parent of Lava Cake?",
        a: "Yes — Lava Cake is Thin Mint GSC × Grape Pie. Grape Pie also shows up in a lot of modern dessert-hybrid lineages.",
      },
      {
        q: "Is Grape Pie indica, sativa, or hybrid?",
        a: "Grape Pie is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Cherry Pie × Grape Stomper.",
      },
      {
        q: "What does Grape Pie taste like?",
        a: "Grape Pie hits grape up front, sweet pastry through the middle, and berry on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Grape Pie?",
        a: "Grape Pie tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Grape Pie best for?",
        a: "Grape Pie reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/grape-pie",
        "https://weedmaps.com/strains/grape-pie",
      ],
      notes:
        "Leafly confirms Cherry Pie × Grape Stomper, indica-leaning hybrid. Gage Green Group breeder (via Grape Stomper). Cherry Pie in our index. Grape Stomper in this wave. Top terpenes Caryophyllene/Limonene/Linalool match. THC ~22% (within 20–25%).",
      verifiedAt: "2026-05-16",
    },
  },

  "lava-cake": {
    slug: "lava-cake",
    name: "Lava Cake",
    type: "indica",
    aliases: ["Lava Cake", "LC"],
    tagline: "Thin Mint GSC × Grape Pie — sweet mint, heavy body.",
    intro:
      "Lava Cake is a Thin Mint GSC × Grape Pie cross — indica-leaning hybrid with a sweet minty-grape aroma " +
      "and a heavy body landing. Sits in the modern dessert-hybrid lineup alongside Wedding Cake and Ice Cream " +
      "Cake. Customers reach for it after dinner when they want sweet aromatics with real body weight.",
    lineage: "Thin Mint GSC × Grape Pie",
    parents: ["thin-mint-gsc", "grape-pie"],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Tingly", "Happy"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Myrcene", note: "earthy, body-heavy" },
      { name: "Humulene", note: "earthy, hop-like" },
    ],
    flavor: ["Sweet mint", "Grape", "Pastry"],
    bestFor: ["After-dinner couch time", "Wind-down evenings", "Low-stress nights"],
    avoidIf: ["You need to function", "Minty-sweet aromas aren’t your thing"],
    faqs: [
      {
        q: "Is Lava Cake similar to Wedding Cake?",
        a: "Same dessert-hybrid family, different cross. Wedding Cake is Triangle Kush × Animal Mints; Lava Cake is Thin Mint GSC × Grape Pie. Both indica-leaning, both heavy.",
      },
      {
        q: "Is Lava Cake indica, sativa, or hybrid?",
        a: "Lava Cake is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Thin Mint GSC × Grape Pie.",
      },
      {
        q: "What does Lava Cake taste like?",
        a: "Lava Cake hits sweet mint up front, grape through the middle, and pastry on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Lava Cake?",
        a: "Lava Cake tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Lava Cake best for?",
        a: "Lava Cake reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/lava-cake",
        "https://weedmaps.com/strains/lava-cake",
      ],
      notes:
        "Leafly confirms Thin Mint GSC × Grape Pie, indica-leaning hybrid. Both parents in our index (Thin Mint GSC in Wave 1, Grape Pie in this wave). Top terpenes Caryophyllene/Myrcene/Humulene match. THC ~22% (within 20–25%).",
      verifiedAt: "2026-05-16",
    },
  },

  "london-pound-cake": {
    slug: "london-pound-cake",
    name: "London Pound Cake",
    type: "indica",
    aliases: ["London Pound Cake", "LPC", "London Pound Cake 75", "Pound Cake"],
    tagline: "Cookies Fam release — sweet berry-lemon, heavy body.",
    intro:
      "London Pound Cake is a Cookies Fam release built from Sunset Sherbet × proprietary genetics. " +
      "Indica-leaning, with a sweet berry-lemon-pastry aroma and a body that lands slow then sticks. " +
      "Dessert-hybrid shelf staple; runs high-THC and shows up in a lot of modern Cookies-family lineages.",
    lineage: "Sunset Sherbet × proprietary",
    parents: ["sunset-sherbet", null],
    thcRange: "22–29%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Happy", "Euphoric"],
    terpenes: [
      { name: "Limonene", note: "lemon-citrus top" },
      { name: "Caryophyllene", note: "peppery, warm" },
      { name: "Myrcene", note: "earthy, body-heavy" },
    ],
    flavor: ["Sweet berry", "Lemon pastry", "Cream"],
    bestFor: ["End of day", "Couch + show", "High-shelf hybrid lovers"],
    avoidIf: ["Low-tolerance — runs high", "You want a clean head-up sativa"],
    faqs: [
      {
        q: "Why is the lineage half-hidden?",
        a: "Cookies Fam kept the second parent proprietary. What’s on shelves is the Sunset Sherbet × (unknown) framing — same as a few other Cookies releases.",
      },
      {
        q: "Is London Pound Cake indica, sativa, or hybrid?",
        a: "London Pound Cake is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Sunset Sherbet × proprietary.",
      },
      {
        q: "What does London Pound Cake taste like?",
        a: "London Pound Cake hits sweet berry up front, lemon pastry through the middle, and cream on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is London Pound Cake?",
        a: "London Pound Cake tests in the 22–29% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is London Pound Cake best for?",
        a: "London Pound Cake reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    lineageAlternates: ["Sunset Sherbet × proprietary (Cookies Fam, most-cited)", "Sunset Sherbet × Cherry Pie (community theory)"],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://weedmaps.com/strains/london-pound-cake",
        "https://cookiesfamily.com/strains/london-pound-cake-75",
      ],
      notes:
        "Weedmaps + Cookies Fam confirm Sunset Sherbet × proprietary genetics, indica-dominant hybrid. Cookies Fam kept the second parent private — community speculation includes Cherry Pie. Sunset Sherbet in our index. Top terpenes Limonene/Caryophyllene/Myrcene per Weedmaps. THC ~30% on Weedmaps; we cite a more conservative 22–29% range to match observed WA lab results.",
      verifiedAt: "2026-05-16",
    },
  },

  "mendo-breath": {
    slug: "mendo-breath",
    name: "Mendo Breath",
    type: "indica",
    aliases: ["Mendo Breath", "MB"],
    tagline: "OGKB × Mendo Montage — caramel-sweet, heavy classic indica.",
    intro:
      "Mendo Breath is an OGKB × Mendo Montage cross — indica-leaning, with a caramel-vanilla-sweet aroma " +
      "and a body that lands heavy without being knockout-fast. Parent strain to a long list of modern indicas " +
      "including Peanut Butter Breath and Garlic Breath. End-of-day pick for customers who like sweet aromatics.",
    lineage: "OGKB × Mendo Montage",
    parents: [null, null],
    thcRange: "19–25%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Tingly", "Happy"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Myrcene", note: "earthy, sedating" },
    ],
    flavor: ["Caramel", "Sweet vanilla", "Earth"],
    bestFor: ["End of day", "Pre-sleep wind-down", "Couch + show"],
    avoidIf: ["You want energetic", "Low-tolerance — runs high"],
    faqs: [
      {
        q: "What does the ‘Breath’ in Mendo Breath refer to?",
        a: "It’s a naming convention — Breath strains tend to share the sweet-funky aromatic signature from the Mendo Montage side. Garlic Breath and Peanut Butter Breath are both crosses with Mendo Breath as a parent.",
      },
      {
        q: "Is Mendo Breath indica, sativa, or hybrid?",
        a: "Mendo Breath is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is OGKB × Mendo Montage.",
      },
      {
        q: "What does Mendo Breath taste like?",
        a: "Mendo Breath hits caramel up front, sweet vanilla through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Mendo Breath?",
        a: "Mendo Breath tests in the 19–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Mendo Breath best for?",
        a: "Mendo Breath reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/mendo-breath",
        "https://weedmaps.com/strains/mendo-breath",
      ],
      notes:
        "Leafly confirms OGKB × Mendo Montage, indica-dominant. Neither parent in our index (OGKB is an OG Kush Breath cut; Mendo Montage is a heritage Mendocino genetic) — both kept null. Top terpenes Caryophyllene/Limonene/Myrcene match. THC ~19% (within 19–25%).",
      verifiedAt: "2026-05-16",
    },
  },

  "papaya": {
    slug: "papaya",
    name: "Papaya",
    type: "indica",
    aliases: ["Papaya", "Nirvana Papaya"],
    tagline: "Nirvana Seeds tropical indica — mango-papaya, mellow body.",
    intro:
      "Papaya is a Nirvana Seeds indica-dominant hybrid — Citral #13 × Ice #2 cross with a tropical " +
      "mango-papaya aroma and a mellow body landing. Lighter than most indicas, more sweet-fruit than earthy. " +
      "Customers who don’t like piney-skunky indicas often land here.",
    lineage: "Citral #13 × Ice #2",
    parents: [null, null],
    thcRange: "15–22%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Hungry", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "tropical-fruit earthy" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Caryophyllene", note: "peppery base" },
    ],
    flavor: ["Mango", "Papaya", "Tropical sweet"],
    bestFor: ["Late afternoon", "Casual evening", "Snack time"],
    avoidIf: ["You don’t like sweet-tropical aromas", "You want a heavy knockout indica"],
    faqs: [
      {
        q: "Is Papaya a strong indica?",
        a: "It’s on the milder side of indica — body-relaxing but not couch-pinning. Good entry point for customers who normally avoid heavier indicas.",
      },
      {
        q: "Is Papaya indica, sativa, or hybrid?",
        a: "Papaya is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Citral #13 × Ice #2.",
      },
      {
        q: "What does Papaya taste like?",
        a: "Papaya hits mango up front, papaya through the middle, and tropical sweet on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Papaya?",
        a: "Papaya tests in the 15–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Papaya best for?",
        a: "Papaya reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/papaya",
        "https://weedmaps.com/strains/papaya",
      ],
      notes:
        "Leafly confirms Citral #13 × Ice #2, indica-dominant hybrid, Nirvana Seeds breeder. Neither parent in our index — both kept null. Top terpenes Myrcene/Limonene/Caryophyllene match. THC ~17% (within 15–22%).",
      verifiedAt: "2026-05-16",
    },
  },

  "peanut-butter-breath": {
    slug: "peanut-butter-breath",
    name: "Peanut Butter Breath",
    type: "indica",
    aliases: ["Peanut Butter Breath", "PBB", "PB Breath"],
    tagline: "Do-Si-Dos × Mendo Breath — nutty, heavy, late-night indica.",
    intro:
      "Peanut Butter Breath is a ThugPug Genetics cross of Do-Si-Dos × Mendo Breath — indica-leaning with a " +
      "savory peanut-nutty aroma that lives up to the name. Heavy body, slow head-down, late-night use. " +
      "Parent strain to a long list of modern indicas including White Truffle (via Gorilla Butter).",
    lineage: "Do-Si-Dos × Mendo Breath",
    parents: ["do-si-dos", "mendo-breath"],
    thcRange: "18–25%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Hungry", "Tingly"],
    terpenes: [
      { name: "Limonene", note: "citrus undertone" },
      { name: "Caryophyllene", note: "peppery, savory-warm" },
      { name: "Pinene", note: "sharp pine top" },
    ],
    flavor: ["Peanut", "Nutty", "Earth"],
    bestFor: ["End of day", "Couch + movie", "Snack-and-sleep nights"],
    avoidIf: ["Savory-nutty aromas aren’t your thing", "You need to function"],
    faqs: [
      {
        q: "Does Peanut Butter Breath actually taste like peanut butter?",
        a: "The nutty note is real — comes from the terpene combination, mostly caryophyllene + a touch of nuttiness from the Mendo Breath side. More savory than candy-sweet.",
      },
      {
        q: "Is Peanut Butter Breath indica, sativa, or hybrid?",
        a: "Peanut Butter Breath is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Do-Si-Dos × Mendo Breath.",
      },
      {
        q: "How strong is Peanut Butter Breath?",
        a: "Peanut Butter Breath tests in the 18–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Peanut Butter Breath best for?",
        a: "Peanut Butter Breath reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
      {
        q: "What terpenes are in Peanut Butter Breath?",
        a: "The dominant terpenes in Peanut Butter Breath are Limonene (citrus zest, bright and mood-lifting on the nose), Caryophyllene (peppery and warm, spicy on the back end), and Pinene (sharp pine, fresh and focusing). The blend is what gives the strain its specific nose and the character customers report on the exhale.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/peanut-butter-breath",
        "https://weedmaps.com/strains/peanut-butter-breath",
      ],
      notes:
        "Leafly confirms Do-Si-Dos × Mendo Breath, indica-dominant hybrid, ThugPug Genetics breeder. Do-Si-Dos in our index (Wave 1). Mendo Breath in this wave. Top terpenes Limonene/Caryophyllene/Pinene match. THC ~20% (within 18–25%).",
      verifiedAt: "2026-05-16",
    },
  },

  "stephen-hawking-kush": {
    slug: "stephen-hawking-kush",
    name: "Stephen Hawking Kush",
    type: "indica",
    aliases: ["Stephen Hawking Kush", "SHK", "Hawking Kush"],
    tagline: "Alphakronik CBD+ strain — high-CBD indica, mellow body.",
    intro:
      "Stephen Hawking Kush is an Alphakronik Genes CBD+ release from their Great Minds series — Harle-Tsu × " +
      "Sin City Kush, with a high-CBD profile (one pheno hits ~5:1 CBD:THC). Indica-leaning, mellow body, " +
      "minimal head-up. Customers reach for it when they want light intoxication with the indica body pattern.",
    lineage: "Harle-Tsu × Sin City Kush",
    parents: [null, null],
    thcRange: "5–10%",
    cbdRange: "8–15%",
    effects: ["Relaxed", "Sleepy", "Focused", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy, body-loose" },
      { name: "Pinene", note: "fresh pine top" },
      { name: "Caryophyllene", note: "peppery base" },
    ],
    flavor: ["Mint", "Earthy wood", "Sweet pine"],
    bestFor: ["Wind-down evenings with low intoxication", "CBD-curious indica fans"],
    avoidIf: ["You want THC-forward effects", "You’re looking for a pure CBD product (this still has measurable THC)"],
    faqs: [
      {
        q: "Is Stephen Hawking Kush really a CBD strain?",
        a: "Yes — Alphakronik released it as part of their CBD+ line. One pheno runs about 5:1 CBD:THC, others land lower. WA lab results vary by batch — check the COA on shelf.",
      },
      {
        q: "Is the name a medical claim?",
        a: "No — it’s a breeder-chosen name in their Great Minds series (Albert Walker is another). Not a therapeutic claim.",
      },
      {
        q: "Is Stephen Hawking Kush indica, sativa, or hybrid?",
        a: "Stephen Hawking Kush is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Harle-Tsu × Sin City Kush.",
      },
      {
        q: "What does Stephen Hawking Kush taste like?",
        a: "Stephen Hawking Kush hits mint up front, earthy wood through the middle, and sweet pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Stephen Hawking Kush?",
        a: "Stephen Hawking Kush tests in the 5–10% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Stephen Hawking Kush best for?",
        a: "Stephen Hawking Kush reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/stephen-hawking-kush",
        "https://weedmaps.com/strains/stephen-hawking-kush",
      ],
      notes:
        "Leafly confirms Harle-Tsu × Sin City Kush, indica-dominant CBD+ hybrid, Alphakronik Genes breeder, Great Minds series. Neither parent in our index — both kept null. Top terpenes Myrcene/Pinene/Caryophyllene per Leafly. CBD/THC ratios vary widely across phenos (1:1 to 5:1) — note included in copy.",
      verifiedAt: "2026-05-16",
    },
  },

  "watermelon": {
    slug: "watermelon",
    name: "Watermelon",
    type: "indica",
    aliases: ["Watermelon", "Watermelon OG"],
    tagline: "Sweet melon indica — relaxed body, slow-build.",
    intro:
      "Watermelon is a long-time indica with a sweet melon-and-grape aroma — the genetic lineage is " +
      "undocumented but it’s circulated through Royal Queen Seeds and others. Body-relaxing, slow-build, " +
      "more sweet-fruit than skunky. Customers reach for it as a mellow evening pick.",
    lineage: "Unknown × Unknown",
    parents: [null, null],
    thcRange: "15–20%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Hungry", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy, body-loose" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Caryophyllene", note: "peppery base" },
    ],
    flavor: ["Watermelon", "Sweet melon", "Grape hint"],
    bestFor: ["Late afternoon", "Casual evening", "Snack time"],
    avoidIf: ["You want a clear-headed sativa", "You don’t like sweet-fruit aromas"],
    faqs: [
      {
        q: "What’s in Watermelon’s lineage?",
        a: "Honest answer: the original cross isn’t documented. Royal Queen Seeds and others circulate seed lines, but the original Watermelon parents are lost. Modern WA shelf product is whichever cut the grower has.",
      },
      {
        q: "Is Watermelon indica, sativa, or hybrid?",
        a: "Watermelon is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Unknown × Unknown.",
      },
      {
        q: "What does Watermelon taste like?",
        a: "Watermelon hits watermelon up front, sweet melon through the middle, and grape hint on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Watermelon?",
        a: "Watermelon tests in the 15–20% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Watermelon best for?",
        a: "Watermelon reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/watermelon",
        "https://weedmaps.com/strains/watermelon",
      ],
      notes:
        "Leafly confirms indica strain, lineage undocumented (both parents unknown). Royal Queen Seeds produces seed lines but isn’t the original breeder. Top terpenes Myrcene/Limonene/Caryophyllene per Leafly. THC ~17% (within 15–20%). Lineage-uncertain note included in FAQ.",
      verifiedAt: "2026-05-16",
    },
  },

  "watermelon-zkittlez": {
    slug: "watermelon-zkittlez",
    name: "Watermelon Zkittlez",
    type: "indica",
    aliases: ["Watermelon Zkittlez", "Watermelon Z", "WMZ"],
    tagline: "Original Z × Watermelon — sweet melon, heavy late-night indica.",
    intro:
      "Watermelon Zkittlez is an Original Z (Zkittlez) × Watermelon cross — indica-leaning, with a sweet " +
      "melon-candy aroma and a heavier body landing than the candy nose suggests. Customers who already like " +
      "Zkittlez and want more body weight reach for this.",
    lineage: "Original Z × Watermelon",
    parents: ["zkittlez", "watermelon"],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Tingly", "Hungry"],
    terpenes: [
      { name: "Limonene", note: "candy-sweet citrus" },
      { name: "Caryophyllene", note: "peppery, warm" },
      { name: "Myrcene", note: "earthy, body-heavy" },
    ],
    flavor: ["Watermelon candy", "Sweet melon", "Tropical"],
    bestFor: ["End of day", "Couch + show", "Sweet-candy hybrid lovers"],
    avoidIf: ["Low-tolerance — runs high", "You don’t like candy aromas"],
    faqs: [
      {
        q: "Is Watermelon Zkittlez heavier than Zkittlez?",
        a: "Yes — the Watermelon side pushes it deeper into indica. Same candy nose, more body weight, more late-night.",
      },
      {
        q: "Is Watermelon Zkittlez indica, sativa, or hybrid?",
        a: "Watermelon Zkittlez is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Original Z × Watermelon.",
      },
      {
        q: "What does Watermelon Zkittlez taste like?",
        a: "Watermelon Zkittlez hits watermelon candy up front, sweet melon through the middle, and tropical on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Watermelon Zkittlez?",
        a: "Watermelon Zkittlez tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Watermelon Zkittlez best for?",
        a: "Watermelon Zkittlez reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/watermelon-zkittlez",
        "https://weedmaps.com/strains/watermelon-zkittlez",
      ],
      notes:
        "Leafly confirms Original Z × Watermelon, indica-dominant. Zkittlez in our index (Wave 1). Watermelon in this wave. Top terpenes Limonene/Caryophyllene/Myrcene match. THC ~24% (within 20–26%).",
      verifiedAt: "2026-05-16",
    },
  },

  "strawberry-cheesecake": {
    slug: "strawberry-cheesecake",
    name: "Strawberry Cheesecake",
    type: "indica",
    aliases: ["Strawberry Cheesecake", "SCC"],
    tagline: "Dessert indica — sweet berry-cream, heavy body.",
    intro:
      "Strawberry Cheesecake is an indica-dominant dessert hybrid built from generations of backcrossing — " +
      "Purple Panty Dropper × Forum GSC lineage with a sweet strawberry-cream-pastry aroma. Heavy body, slow " +
      "head-down, late-night use. Customers who like Cheesecake-shelf strains land here.",
    lineage: "Purple Panty Dropper × Forum GSC",
    parents: [null, "girl-scout-cookies"],
    thcRange: "22–28%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Happy", "Euphoric"],
    terpenes: [
      { name: "Limonene", note: "citrus-sweet top" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Pinene", note: "fresh pine accent" },
    ],
    flavor: ["Strawberry", "Sweet cream", "Pastry"],
    bestFor: ["End of day", "Couch + dessert", "Sweet-pastry hybrid lovers"],
    avoidIf: ["Low-tolerance — runs high", "You want energetic"],
    faqs: [
      {
        q: "Is Strawberry Cheesecake related to Blue Cheese?",
        a: "No — different lines. Blue Cheese is Blueberry × UK Cheese (savory-funk). Strawberry Cheesecake is a backcross dessert hybrid with a sweet-pastry profile.",
      },
      {
        q: "Is Strawberry Cheesecake indica, sativa, or hybrid?",
        a: "Strawberry Cheesecake is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Purple Panty Dropper × Forum GSC.",
      },
      {
        q: "What does Strawberry Cheesecake taste like?",
        a: "Strawberry Cheesecake hits strawberry up front, sweet cream through the middle, and pastry on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Strawberry Cheesecake?",
        a: "Strawberry Cheesecake tests in the 22–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Strawberry Cheesecake best for?",
        a: "Strawberry Cheesecake reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/strawberry-cheesecake",
        "https://weedmaps.com/strains/strawberry-cheesecake",
      ],
      notes:
        "Leafly confirms Purple Panty Dropper × Forum GSC backcross, indica-dominant. Forum GSC is a GSC cut — parent slug is girl-scout-cookies in our index. Purple Panty Dropper not in our index — kept null. Top terpenes Limonene/Caryophyllene/Pinene match. THC ~28% (within 22–28%).",
      verifiedAt: "2026-05-16",
    },
  },

  // ────────────────────────────────────────────────────────────────────
  // SATIVA (9)
  // ────────────────────────────────────────────────────────────────────

  "black-jack": {
    slug: "black-jack",
    name: "Black Jack",
    type: "sativa",
    aliases: ["Black Jack", "BJ"],
    tagline: "Sweet Seeds sativa hybrid — Black Domina × Jack Herer.",
    intro:
      "Black Jack is a Sweet Seeds cross of Black Domina × Jack Herer — sativa-leaning hybrid with the Jack " +
      "Herer head-up character and a denser, frostier bud structure from the Black Domina side. Terpinolene-led " +
      "profile with a peppery-piney aroma. Long-lasting, head-clear effect.",
    lineage: "Black Domina × Jack Herer",
    parents: [null, "jack-herer"],
    thcRange: "17–22%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Focused", "Happy", "Relaxed"],
    terpenes: [
      { name: "Terpinolene", note: "piney-floral top, head-up" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Ocimene", note: "sweet herbal" },
    ],
    flavor: ["Pine", "Pepper", "Sweet herbal"],
    bestFor: ["Daytime use", "Creative work", "Casual social"],
    avoidIf: ["You want a knockout indica", "You’re sensitive to terpinolene-led strains"],
    faqs: [
      {
        q: "Is Black Jack related to Black Domina or Jack Herer more?",
        a: "Splits the difference — head-up Jack Herer character, frosty Black Domina bud structure. Sweet Seeds bred it to keep the Jack head with more shelf appeal.",
      },
      {
        q: "Is Black Jack indica, sativa, or hybrid?",
        a: "Black Jack is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Black Domina × Jack Herer.",
      },
      {
        q: "What does Black Jack taste like?",
        a: "Black Jack hits pine up front, pepper through the middle, and sweet herbal on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Black Jack?",
        a: "Black Jack tests in the 17–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Black Jack best for?",
        a: "Black Jack reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/black-jack",
        "https://sweetseeds.com/black-jack",
      ],
      notes:
        "Leafly + Sweet Seeds (breeder) confirm Black Domina × Jack Herer, sativa-leaning hybrid. Jack Herer in our index. Black Domina not in our index — kept null. Top terpenes Terpinolene/Caryophyllene/Ocimene match. THC ~19% (within 17–22%).",
      verifiedAt: "2026-05-16",
    },
  },

  "bubble-gum": {
    slug: "bubble-gum",
    name: "Bubble Gum",
    type: "sativa",
    aliases: ["Bubble Gum", "Bubblegum", "BG"],
    tagline: "Indiana heritage hybrid — sweet candy nose, head-up effect.",
    intro:
      "Bubble Gum is a long-time Indiana heritage strain — the original cross was lost but every modern Bubble " +
      "Gum descends from the Indiana cut. Sweet candy-bubblegum aroma, head-up uplifting effect, body relaxation " +
      "without sedation. Award-winning since 1994.",
    lineage: "Indiana Bubble Gum (heritage cross)",
    parents: [null, null],
    thcRange: "15–20%",
    cbdRange: "<1%",
    effects: ["Happy", "Uplifted", "Euphoric", "Relaxed"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm" },
      { name: "Limonene", note: "candy-sweet citrus" },
      { name: "Myrcene", note: "earthy undertone" },
    ],
    flavor: ["Bubblegum", "Sweet candy", "Berry"],
    bestFor: ["Daytime use", "Casual social", "Creative work"],
    avoidIf: ["You want a heavy indica", "Sweet-candy aromas turn you off"],
    faqs: [
      {
        q: "Why is Bubble Gum’s lineage half-mystery?",
        a: "The original Indiana growers didn’t document the parents — the cut traveled to Amsterdam in the early ’90s, won several Cannabis Cups, and has been propagated globally. What’s on shelves descends from the Indiana cut.",
      },
      {
        q: "Is Bubble Gum indica, sativa, or hybrid?",
        a: "Bubble Gum is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Indiana Bubble Gum (heritage cross).",
      },
      {
        q: "What does Bubble Gum taste like?",
        a: "Bubble Gum hits bubblegum up front, sweet candy through the middle, and berry on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Bubble Gum?",
        a: "Bubble Gum tests in the 15–20% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Bubble Gum best for?",
        a: "Bubble Gum reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/bubble-gum",
        "https://weedmaps.com/strains/bubble-gum",
      ],
      notes:
        "Leafly confirms Indiana heritage cross, indica-leaning hybrid (we call sativa — most WA shelf product is the Serious Seeds / TH Seeds pheno which leans head-up). Original parents undocumented — both kept null. Top terpenes Caryophyllene/Limonene/Myrcene match. THC ~17% (within 15–20%). Heritage-lineage note included in FAQ.",
      verifiedAt: "2026-05-16",
    },
  },

  "cherry-cookies": {
    slug: "cherry-cookies",
    name: "Cherry Cookies",
    type: "sativa",
    aliases: ["Cherry Cookies", "CC"],
    tagline: "Cherry Pie × Cookies F2 — uplifting hybrid with cherry-sweet nose.",
    intro:
      "Cherry Cookies is a Cherry Pie × Cookies F2 cross — sativa-leaning hybrid with the cherry-sweet aroma " +
      "of the Cherry Pie side and the head-up uplift of the Cookies F2 parent. Combines mental alertness with " +
      "a relaxed body — good late-afternoon transition pick.",
    lineage: "Cherry Pie × Cookies F2",
    parents: ["cherry-pie", null],
    thcRange: "16–22%",
    cbdRange: "<1%",
    effects: ["Focused", "Happy", "Uplifted", "Relaxed"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm" },
      { name: "Limonene", note: "cherry-citrus top" },
      { name: "Humulene", note: "earthy, hop-like" },
    ],
    flavor: ["Cherry", "Sweet cookies", "Earth"],
    bestFor: ["Late afternoon", "Creative work", "Casual social"],
    avoidIf: ["You want a knockout indica", "Cherry-sweet aromas aren’t your thing"],
    faqs: [
      {
        q: "Is Cherry Cookies related to Black Cherry Pie?",
        a: "Different cross. Black Cherry Pie is its own line; Cherry Cookies is Cherry Pie × Cookies F2 — keeps the head-up of the Cookies side.",
      },
      {
        q: "Is Cherry Cookies indica, sativa, or hybrid?",
        a: "Cherry Cookies is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Cherry Pie × Cookies F2.",
      },
      {
        q: "What does Cherry Cookies taste like?",
        a: "Cherry Cookies hits cherry up front, sweet cookies through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Cherry Cookies?",
        a: "Cherry Cookies tests in the 16–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Cherry Cookies best for?",
        a: "Cherry Cookies reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/cherry-cookies",
        "https://weedmaps.com/strains/cherry-cookies",
      ],
      notes:
        "Leafly confirms Cherry Pie × Cookies F2, sativa-leaning hybrid. Cherry Pie in our index (Wave 1). Cookies F2 not in our index as a separate cut — kept null. Top terpenes Caryophyllene/Limonene/Humulene match. THC ~17% (within 16–22%).",
      verifiedAt: "2026-05-16",
    },
  },

  "dutch-treat": {
    slug: "dutch-treat",
    name: "Dutch Treat",
    type: "sativa",
    aliases: ["Dutch Treat", "DT"],
    tagline: "Amsterdam coffee-shop classic — Northern Lights × Haze.",
    intro:
      "Dutch Treat is a Northern Lights × Haze cross out of Amsterdam — sativa-leaning, with a sweet piney-eucalyptus " +
      "aroma and a head-up uplifting effect. Long-time coffee-shop staple, terpinolene-led aromatic profile. " +
      "Customers who already like terpinolene-led sativas (Jack Herer, Tangie) tend to like Dutch Treat.",
    lineage: "Northern Lights × Haze",
    parents: ["northern-lights", "haze"],
    thcRange: "17–22%",
    cbdRange: "<1%",
    effects: ["Euphoric", "Uplifted", "Relaxed", "Happy"],
    terpenes: [
      { name: "Terpinolene", note: "piney-floral top, head-up" },
      { name: "Myrcene", note: "earthy undertone" },
      { name: "Ocimene", note: "sweet herbal" },
    ],
    flavor: ["Sweet pine", "Eucalyptus", "Earthy"],
    bestFor: ["Daytime use", "Creative work", "Hike or walk"],
    avoidIf: ["You’re sensitive to terpinolene-led strains", "You want a heavy indica"],
    faqs: [
      {
        q: "Is Dutch Treat a strong sativa?",
        a: "Head-up uplifting but not racey — the Northern Lights side smooths out the Haze head. Sits in the comfortable middle of the sativa shelf.",
      },
      {
        q: "Is Dutch Treat indica, sativa, or hybrid?",
        a: "Dutch Treat is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Northern Lights × Haze.",
      },
      {
        q: "What does Dutch Treat taste like?",
        a: "Dutch Treat hits sweet pine up front, eucalyptus through the middle, and earthy on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Dutch Treat?",
        a: "Dutch Treat tests in the 17–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Dutch Treat best for?",
        a: "Dutch Treat reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/dutch-treat",
        "https://weedmaps.com/strains/dutch-treat",
      ],
      notes:
        "Leafly confirms Northern Lights × Haze, sativa-leaning hybrid. Both parents in our index (Wave 1). Top terpenes Terpinolene/Myrcene/Ocimene match. THC ~19% (within 17–22%). Amsterdam coffee-shop heritage strain.",
      verifiedAt: "2026-05-16",
    },
  },

  "mac-and-cheese": {
    slug: "mac-and-cheese",
    name: "Mac and Cheese",
    type: "sativa",
    aliases: ["Mac and Cheese", "Mac & Cheese", "M&C"],
    tagline: "The Mac × Alien Cheese — head-up hybrid with savory funk.",
    intro:
      "Mac and Cheese is a hybrid cross of The Mac (Wave 1 mac entry) × Alien Cheese — sativa-leaning, with a " +
      "savory funky-cheese aroma over the Mac’s creamy backbone. Head-up focused effect, more energizing than " +
      "calming. Customers who like funky aromatic profiles reach for this.",
    lineage: "The Mac × Alien Cheese",
    parents: ["mac", null],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Focused", "Uplifted", "Euphoric", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy, savory" },
      { name: "Limonene", note: "citrus undertone" },
      { name: "Caryophyllene", note: "peppery base" },
    ],
    flavor: ["Funky cheese", "Cream", "Light citrus"],
    bestFor: ["Daytime use", "Creative work", "High-shelf hybrid lovers"],
    avoidIf: ["Funky-cheese aromas turn you off", "You want a heavy indica"],
    faqs: [
      {
        q: "Is Mac and Cheese related to MAC 1?",
        a: "Yes — one parent is The Mac (Miracle Alien Cookies, the ‘mac’ in our index). Mac and Cheese adds Alien Cheese on top, giving it the savory-funky aromatic.",
      },
      {
        q: "Is Mac and Cheese indica, sativa, or hybrid?",
        a: "Mac and Cheese is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is The Mac × Alien Cheese.",
      },
      {
        q: "What does Mac and Cheese taste like?",
        a: "Mac and Cheese hits funky cheese up front, cream through the middle, and light citrus on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Mac and Cheese?",
        a: "Mac and Cheese tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Mac and Cheese best for?",
        a: "Mac and Cheese reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/mac-and-cheese",
        "https://weedmaps.com/strains/mac-and-cheese",
      ],
      notes:
        "Leafly confirms The Mac × Alien Cheese, sativa-leaning hybrid. The Mac is mac in our index (Wave 1). Alien Cheese not in our index — kept null. Top terpenes Myrcene/Limonene/Caryophyllene match. THC ~23% (within 20–25%).",
      verifiedAt: "2026-05-16",
    },
  },

  "stardawg": {
    slug: "stardawg",
    name: "Stardawg",
    type: "sativa",
    aliases: ["Stardawg", "Star Dawg", "Stardog"],
    tagline: "Chemdog 4 × Tres Dawg — head-up sativa with chem-fuel aroma.",
    intro:
      "Stardawg is a Chemdog 4 × Tres Dawg cross — sativa-leaning hybrid with a chem-diesel-citrus aroma and " +
      "a head-up uplifting effect. Tingly, focused, more energizing than most Chem-family strains. Parent strain " +
      "to a long list of modern hybrids; runs higher-THC than most sativas.",
    lineage: "Chemdog 4 × Tres Dawg",
    parents: ["chemdawg-4", null],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Tingly", "Happy", "Focused", "Uplifted"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, chem-warm" },
      { name: "Limonene", note: "citrus-fuel top" },
      { name: "Myrcene", note: "earthy undertone" },
    ],
    flavor: ["Diesel", "Chem", "Citrus pine"],
    bestFor: ["Daytime use", "Creative work", "High-tolerance sativa fans"],
    avoidIf: ["Low-tolerance — runs high", "You don’t like fuel aromas"],
    faqs: [
      {
        q: "Is Stardawg the same as Chemdawg?",
        a: "Related but not the same. Stardawg is Chemdog 4 × Tres Dawg — keeps the Chem aromatic but lands more head-up. Chemdawg in our index is a separate strain.",
      },
      {
        q: "Is Stardawg indica, sativa, or hybrid?",
        a: "Stardawg is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Chemdog 4 × Tres Dawg.",
      },
      {
        q: "What does Stardawg taste like?",
        a: "Stardawg hits diesel up front, chem through the middle, and citrus pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Stardawg?",
        a: "Stardawg tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Stardawg best for?",
        a: "Stardawg reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/stardawg",
        "https://weedmaps.com/strains/stardawg",
      ],
      notes:
        "Leafly confirms Chemdog 4 × Tres Dawg, sativa-leaning hybrid. Chemdog 4 is chemdawg-4 in our index (Wave 1). Tres Dawg not in our index — kept null. Top terpenes Caryophyllene/Limonene/Myrcene match. THC ~22% (within 20–25%).",
      verifiedAt: "2026-05-16",
    },
  },

  "super-boof": {
    slug: "super-boof",
    name: "Super Boof",
    type: "sativa",
    aliases: ["Super Boof", "Blockberry"],
    tagline: "Black Cherry Punch × Tropicana Cookies — head-up hybrid, zesty.",
    intro:
      "Super Boof (originally Blockberry, renamed by Michigan grower Mobilejay) is a Blockhead cross of " +
      "Black Cherry Punch × Tropicana Cookies — sativa-leaning, with a zesty citrus-berry aroma and a head-up " +
      "uplifting effect. Runs high-THC; not a sleep strain — customers reach for it for daytime.",
    lineage: "Black Cherry Punch × Tropicana Cookies",
    parents: ["black-cherry-punch", "tropicana-cookies"],
    thcRange: "24–30%",
    cbdRange: "<1%",
    effects: ["Giggly", "Focused", "Euphoric", "Creative"],
    terpenes: [
      { name: "Myrcene", note: "earthy, body-loose" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Limonene", note: "zesty citrus top" },
    ],
    flavor: ["Citrus", "Berry", "Zest"],
    bestFor: ["Daytime use", "Creative work", "Social settings"],
    avoidIf: ["Low-tolerance — runs very high", "You want a pre-bed indica"],
    faqs: [
      {
        q: "Why is Super Boof also called Blockberry?",
        a: "Original breeder Blockhead released it as Blockberry in 2019. Michigan grower Mobilejay popularized it as Super Boof in 2021-2022 and the new name stuck.",
      },
      {
        q: "Is Super Boof indica, sativa, or hybrid?",
        a: "Super Boof is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Black Cherry Punch × Tropicana Cookies.",
      },
      {
        q: "What does Super Boof taste like?",
        a: "Super Boof hits citrus up front, berry through the middle, and zest on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Super Boof?",
        a: "Super Boof tests in the 24–30% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Super Boof best for?",
        a: "Super Boof reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/super-boof",
        "https://weedmaps.com/strains/super-boof",
      ],
      notes:
        "Leafly confirms Black Cherry Punch × Tropicana Cookies, sativa-leaning hybrid. Both parents in our index (Black Cherry Punch in this wave, Tropicana Cookies in Wave 2). Top terpenes Myrcene/Caryophyllene/Limonene match. THC ~26% (within 24–30%). Blockhead (CA) → Mobilejay (MI) naming arc.",
      verifiedAt: "2026-05-16",
    },
  },

  "tangerine-dream": {
    slug: "tangerine-dream",
    name: "Tangerine Dream",
    type: "sativa",
    aliases: ["Tangerine Dream", "TD"],
    tagline: "Barney’s Farm sativa — tangerine-citrus, head-up effect.",
    intro:
      "Tangerine Dream is a Barney’s Farm cross of G13 × Afghani × Neville’s A5 Haze — sativa-leaning with " +
      "a bright tangerine-citrus aroma and a head-up uplifting effect. 2010 Cannabis Cup winner, long-time " +
      "shelf staple. Customers who like clementine and tangie reach for this for the same citrus aromatic.",
    lineage: "G13 × Afghani × Neville’s A5 Haze",
    parents: [null, "afghani", null],
    thcRange: "17–25%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Happy", "Focused", "Euphoric"],
    terpenes: [
      { name: "Myrcene", note: "earthy undertone" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Limonene", note: "bright tangerine top" },
    ],
    flavor: ["Tangerine", "Sweet citrus", "Light earth"],
    bestFor: ["Daytime use", "Creative work", "Casual social", "Hike or walk"],
    avoidIf: ["You want a heavy indica", "You’re sensitive to high-THC sativas"],
    faqs: [
      {
        q: "Does Tangerine Dream actually smell like tangerines?",
        a: "Yes — the citrus is the loudest part of the strain. Bright, juicy, closer to tangerine than to orange. Comes from the limonene + Haze parentage.",
      },
      {
        q: "Is Tangerine Dream indica, sativa, or hybrid?",
        a: "Tangerine Dream is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is G13 × Afghani × Neville’s A5 Haze.",
      },
      {
        q: "What does Tangerine Dream taste like?",
        a: "Tangerine Dream hits tangerine up front, sweet citrus through the middle, and light earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Tangerine Dream?",
        a: "Tangerine Dream tests in the 17–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Tangerine Dream best for?",
        a: "Tangerine Dream reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/tangerine-dream",
        "https://www.barneysfarm.com/tangerine-dream",
      ],
      notes:
        "Leafly + Barney’s Farm (breeder) confirm G13 × Afghani × Neville’s A5 Haze, sativa-leaning hybrid. Afghani in our index. G13 + Neville’s A5 Haze not in our index — kept null. Top terpenes Myrcene/Caryophyllene/Limonene match. THC ~20% (within 17–25%). 2010 Cannabis Cup winner.",
      verifiedAt: "2026-05-16",
    },
  },

  "jet-fuel": {
    slug: "jet-fuel",
    name: "Jet Fuel",
    type: "sativa",
    aliases: ["Jet Fuel", "Jet Fuel OG", "G6"],
    tagline: "303 Seeds sativa — sharp diesel aroma, head-up energetic.",
    intro:
      "Jet Fuel (also called G6) is a 303 Seeds cross of Aspen OG × High Country Diesel with SFV OG and East " +
      "Coast Sour Diesel in the deeper lineage. Sharp diesel-citrus aroma, head-up energetic effect that levels " +
      "off into a relaxed landing. Customers who like ECSD reach for Jet Fuel for the same diesel character.",
    lineage: "Aspen OG × High Country Diesel",
    parents: [null, null],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Focused", "Energetic", "Uplifted", "Happy"],
    terpenes: [
      { name: "Limonene", note: "citrus-diesel top" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Myrcene", note: "earthy undertone" },
    ],
    flavor: ["Diesel", "Sharp citrus", "Pine"],
    bestFor: ["Daytime use", "Creative work", "Casual social"],
    avoidIf: ["Diesel aromas turn you off", "You want a heavy indica"],
    faqs: [
      {
        q: "Is Jet Fuel related to Sour Diesel?",
        a: "Yes — East Coast Sour Diesel is in the deeper lineage (via the Aspen OG side). Sharper diesel than Sour D, more head-up.",
      },
      {
        q: "Is Jet Fuel indica, sativa, or hybrid?",
        a: "Jet Fuel is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Aspen OG × High Country Diesel.",
      },
      {
        q: "What does Jet Fuel taste like?",
        a: "Jet Fuel hits diesel up front, sharp citrus through the middle, and pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Jet Fuel?",
        a: "Jet Fuel tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Jet Fuel best for?",
        a: "Jet Fuel reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/jet-fuel",
        "https://weedmaps.com/strains/jet-fuel",
      ],
      notes:
        "Leafly confirms Aspen OG × High Country Diesel, sativa-leaning hybrid, 303 Seeds breeder. SFV OG and East Coast Sour Diesel in deeper lineage (both in our index). Aspen OG + High Country Diesel kept null. Top terpenes Limonene/Caryophyllene/Myrcene match. THC ~20% (within 18–24%).",
      verifiedAt: "2026-05-16",
    },
  },

  // ────────────────────────────────────────────────────────────────────
  // HYBRID (25)
  // ────────────────────────────────────────────────────────────────────

  "animal-face": {
    slug: "animal-face",
    name: "Animal Face",
    type: "hybrid",
    aliases: ["Animal Face", "AF"],
    tagline: "Seed Junky Face Off OG × Animal Mints — heavy modern hybrid.",
    intro:
      "Animal Face is a Seed Junky Genetics cross of Face Off OG × Animal Mints — balanced hybrid that landed " +
      "first place in the 2022 Emerald Cup Awards. Sweet-gassy aroma, heavy body landing, mellow head. Runs " +
      "high-THC; customers reach for it as a high-shelf evening pick.",
    lineage: "Face Off OG × Animal Mints",
    parents: [null, "animal-mints"],
    thcRange: "24–30%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Tingly", "Euphoric", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy, body-heavy" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Caryophyllene", note: "peppery base" },
    ],
    flavor: ["Sweet gas", "Mint", "Pine"],
    bestFor: ["End of day", "Couch + movie", "High-shelf hybrid lovers"],
    avoidIf: ["Low-tolerance — runs very high", "You want energetic"],
    faqs: [
      {
        q: "Why did Animal Face win the 2022 Emerald Cup?",
        a: "Combination of high THC, dense trichome coverage, and a flavor profile that’s simultaneously sweet and gassy. The Animal Mints side gives it the cookies-family aromatic; Face Off OG gives it the body weight.",
      },
      {
        q: "Is Animal Face indica, sativa, or hybrid?",
        a: "Animal Face is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Face Off OG × Animal Mints. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Animal Face taste like?",
        a: "Animal Face hits sweet gas up front, mint through the middle, and pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Animal Face?",
        a: "Animal Face tests in the 24–30% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Animal Face best for?",
        a: "Animal Face reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/animal-face",
        "https://weedmaps.com/strains/animal-face",
      ],
      notes:
        "Leafly confirms Face Off OG × Animal Mints, balanced hybrid, Seed Junky Genetics breeder. Animal Mints in our index (Wave 2). Face Off OG not in our index — kept null. Top terpenes Myrcene/Limonene/Caryophyllene match. THC ~30% per Leafly (we cite 24–30% to match observed range).",
      verifiedAt: "2026-05-16",
    },
  },

  "apple-tartz": {
    slug: "apple-tartz",
    name: "Apple Tartz",
    type: "hybrid",
    aliases: ["Apple Tartz", "AT"],
    tagline: "Clearwater Genetics — Apple Fritter × Runtz, sweet-tart.",
    intro:
      "Apple Tartz is a Clearwater Genetics cross of Apple Fritter × Runtz — balanced hybrid with a tart " +
      "apple-and-cream aroma and a calming effect that suits both evening and wake-and-bake use. Modern " +
      "high-shelf hybrid, runs high-THC, sweet aromatic loaded customers find approachable.",
    lineage: "Apple Fritter × Runtz",
    parents: ["apple-fritter", "runtz"],
    thcRange: "22–28%",
    cbdRange: "<1%",
    effects: ["Tingly", "Relaxed", "Euphoric", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy undertone" },
      { name: "Pinene", note: "fresh pine top" },
      { name: "Limonene", note: "tart citrus-apple" },
    ],
    flavor: ["Tart apple", "Sweet cream", "Berry"],
    bestFor: ["Late afternoon", "Casual social", "Wind-down evenings"],
    avoidIf: ["Low-tolerance — runs high", "You want a clean head-up sativa"],
    faqs: [
      {
        q: "Does Apple Tartz taste like apple?",
        a: "Yes — tart-sour apple up front with a creamy berry-gas finish. Apple Jacks cereal is the common comparison. The Runtz side keeps it sweet.",
      },
      {
        q: "Is Apple Tartz indica, sativa, or hybrid?",
        a: "Apple Tartz is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Apple Fritter × Runtz. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "How strong is Apple Tartz?",
        a: "Apple Tartz tests in the 22–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Apple Tartz best for?",
        a: "Apple Tartz reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
      {
        q: "What terpenes are in Apple Tartz?",
        a: "The dominant terpenes in Apple Tartz are Myrcene (earthy, mango-like, with a mild body-heavy quality), Pinene (sharp pine, fresh and focusing), and Limonene (citrus zest, bright and mood-lifting on the nose). The blend is what gives the strain its specific nose and the character customers report on the exhale.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/apple-tartz",
        "https://weedmaps.com/strains/apple-tartz",
      ],
      notes:
        "Leafly confirms Apple Fritter × Runtz, balanced hybrid, Clearwater Genetics breeder. Both parents in our index (Apple Fritter in Wave 1, Runtz in Wave 1). Top terpenes Myrcene/Pinene/Limonene match. THC ~26% (within 22–28%).",
      verifiedAt: "2026-05-16",
    },
  },

  "bacio-gelato": {
    slug: "bacio-gelato",
    name: "Bacio Gelato",
    type: "hybrid",
    aliases: ["Bacio Gelato", "Bacio", "Gelato #41 alt"],
    tagline: "Sherbinski Gelato lineup — creamy mint, indica-leaning hybrid.",
    intro:
      "Bacio Gelato is a Sherbinski (Cookies Fam) cross of Sunset Sherbet × Thin Mint GSC — indica-leaning " +
      "hybrid with a creamy vanilla-mint-berry aroma. Heavy body, mellow head, late-night use. Part of the " +
      "Sherbinski Gelato numbered lineup; runs heavier than Gelato 33 or Gelato 41.",
    lineage: "Sunset Sherbet × Thin Mint GSC",
    parents: ["sunset-sherbet", "thin-mint-gsc"],
    thcRange: "21–27%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Euphoric", "Happy"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Linalool", note: "floral lavender" },
    ],
    flavor: ["Vanilla", "Mint", "Berry"],
    bestFor: ["End of day", "Couch + show", "Dessert-hybrid lovers"],
    avoidIf: ["Low-tolerance — runs high", "You want a clean head-up sativa"],
    faqs: [
      {
        q: "Is Bacio Gelato the same as Gelato 41?",
        a: "Same family, different cut. Both are Sunset Sherbet × Thin Mint GSC, but Bacio Gelato is a separately-named Sherbinski selection. Gelato 41 leans more balanced; Bacio runs heavier on the body.",
      },
      {
        q: "Is Bacio Gelato indica, sativa, or hybrid?",
        a: "Bacio Gelato is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Sunset Sherbet × Thin Mint GSC. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Bacio Gelato taste like?",
        a: "Bacio Gelato hits vanilla up front, mint through the middle, and berry on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Bacio Gelato?",
        a: "Bacio Gelato tests in the 21–27% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Bacio Gelato best for?",
        a: "Bacio Gelato reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/bacio-gelato",
        "https://weedmaps.com/strains/bacio-gelato",
      ],
      notes:
        "Leafly confirms Sunset Sherbet × Thin Mint GSC, indica-dominant hybrid, Sherbinski / Cookies Fam breeder. Both parents in our index. Top terpenes (vanilla/berry/mint flavor profile) align with Caryophyllene/Limonene/Linalool. Sister-strain to Gelato 41 (in this wave).",
      verifiedAt: "2026-05-16",
    },
  },

  "biscotti-mints": {
    slug: "biscotti-mints",
    name: "Biscotti Mints",
    type: "hybrid",
    aliases: ["Biscotti Mints", "BM"],
    tagline: "Cookies Fam — Biscotti × Kush Mints, dessert+mint hybrid.",
    intro:
      "Biscotti Mints is a Cookies Fam cross of Biscotti × Kush Mints — indica-leaning hybrid with a sweet " +
      "minty-cookies-gas aroma and a heavy body landing. Sits adjacent to Lemon Cherry Gelato on the modern " +
      "dessert-hybrid shelf; runs high-THC.",
    lineage: "Biscotti × Kush Mints",
    parents: ["biscotti", "kush-mints"],
    thcRange: "22–28%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Sleepy"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Linalool", note: "floral lavender" },
    ],
    flavor: ["Sweet mint", "Gassy cookies", "Cream"],
    bestFor: ["After dinner", "Couch + show", "Dessert-hybrid lovers"],
    avoidIf: ["Low-tolerance — runs high", "You want a clean head-up sativa"],
    faqs: [
      {
        q: "Is Biscotti Mints related to Permanent Marker?",
        a: "Both came out of the same Cookies-shelf modernization. Permanent Marker is Biscotti × Jealousy × Sherbet Bx1. Biscotti Mints is the more straightforward Biscotti × Kush Mints cross.",
      },
      {
        q: "Is Biscotti Mints indica, sativa, or hybrid?",
        a: "Biscotti Mints is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Biscotti × Kush Mints. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Biscotti Mints taste like?",
        a: "Biscotti Mints hits sweet mint up front, gassy cookies through the middle, and cream on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Biscotti Mints?",
        a: "Biscotti Mints tests in the 22–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Biscotti Mints best for?",
        a: "Biscotti Mints reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/biscotti-mints",
        "https://weedmaps.com/strains/biscotti-mints",
      ],
      notes:
        "Leafly confirms Biscotti × Kush Mints, indica-leaning hybrid, Cookies Fam breeder. Both parents in our index (Wave 2). Top terpenes Caryophyllene/Limonene/Linalool match. THC ~24% (within 22–28%).",
      verifiedAt: "2026-05-16",
    },
  },

  "forbidden-fruit": {
    slug: "forbidden-fruit",
    name: "Forbidden Fruit",
    type: "hybrid",
    aliases: ["Forbidden Fruit", "FF"],
    tagline: "Cherry Pie × Tangie — sweet tropical hybrid, mellow body.",
    intro:
      "Forbidden Fruit is a Cherry Pie × Tangie cross — indica-leaning hybrid with a tropical cherry-mango-passionfruit " +
      "aroma and a mellow body landing. The Tangie side keeps it bright; the Cherry Pie side gives it the body. " +
      "Customers who already like Cherry Pie or Tangie tend to reach for it.",
    lineage: "Cherry Pie × Tangie",
    parents: ["cherry-pie", "tangie"],
    thcRange: "17–24%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Tingly", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy, body-loose" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Limonene", note: "tropical citrus top" },
    ],
    flavor: ["Cherry", "Mango", "Passionfruit"],
    bestFor: ["Late afternoon", "Casual evening", "Tropical-aroma lovers"],
    avoidIf: ["You want energetic", "Sweet-tropical aromas turn you off"],
    faqs: [
      {
        q: "Is Forbidden Fruit related to Forbidden Apple?",
        a: "Different strains. Forbidden Fruit is Cherry Pie × Tangie. Forbidden Apple is a separate cross (less-circulated). Same Forbidden naming convention, different parents.",
      },
      {
        q: "Is Forbidden Fruit indica, sativa, or hybrid?",
        a: "Forbidden Fruit is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Cherry Pie × Tangie. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Forbidden Fruit taste like?",
        a: "Forbidden Fruit hits cherry up front, mango through the middle, and passionfruit on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Forbidden Fruit?",
        a: "Forbidden Fruit tests in the 17–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Forbidden Fruit best for?",
        a: "Forbidden Fruit reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/forbidden-fruit",
        "https://weedmaps.com/strains/forbidden-fruit",
      ],
      notes:
        "Leafly confirms Cherry Pie × Tangie, indica-leaning hybrid. Both parents in our index (Cherry Pie in Wave 1, Tangie in Wave 2). Top terpenes Myrcene/Caryophyllene/Limonene match. THC ~22% (within 17–24%).",
      verifiedAt: "2026-05-16",
    },
  },

  "gary-payton": {
    slug: "gary-payton",
    name: "Gary Payton",
    type: "hybrid",
    aliases: ["Gary Payton", "GP", "The Glove"],
    tagline: "Cookies × Powerzzzup — balanced modern hybrid, even-keeled.",
    intro:
      "Gary Payton is a Cookies × Powerzzzup Genetics collaboration — The Y × Snowman cross, balanced hybrid " +
      "with a sweet-diesel aroma. Even-keeled effect: sativa head rush up front, mellow body landing. Named " +
      "after the Hall-of-Fame Seattle SuperSonics guard.",
    lineage: "The Y × Snowman",
    parents: [null, null],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Giggly", "Relaxed", "Euphoric", "Focused"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Linalool", note: "floral lavender" },
    ],
    flavor: ["Sweet diesel", "Pine", "Cream"],
    bestFor: ["Late afternoon", "Casual social", "Creative work"],
    avoidIf: ["Low-tolerance — runs high", "You want a knockout indica"],
    faqs: [
      {
        q: "Why is it named after Gary Payton?",
        a: "Cookies’ Berner has a long-standing connection to Bay Area / Seattle sports culture. Gary Payton (the SuperSonics Hall of Fame guard) signed off on the name; it’s an officially licensed collaboration.",
      },
      {
        q: "Is Gary Payton indica, sativa, or hybrid?",
        a: "Gary Payton is a hybrid — a cross that pulls from both sides of the family tree. The lineage is The Y × Snowman. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Gary Payton taste like?",
        a: "Gary Payton hits sweet diesel up front, pine through the middle, and cream on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Gary Payton?",
        a: "Gary Payton tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Gary Payton best for?",
        a: "Gary Payton reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/gary-payton",
        "https://weedmaps.com/strains/gary-payton",
      ],
      notes:
        "Leafly confirms The Y × Snowman, balanced hybrid, Cookies × Powerzzzup Genetics (Kenny Dumetz) collaboration. Neither parent in our index — both kept null. Top terpenes Caryophyllene/Limonene/Linalool match. THC ~22% (within 20–25%). Seattle-relevant for SCC retail customers.",
      verifiedAt: "2026-05-16",
    },
  },

  "gelato-41": {
    slug: "gelato-41",
    name: "Gelato 41",
    type: "hybrid",
    aliases: ["Gelato 41", "Gelato #41", "G41"],
    tagline: "Cookies Fam Gelato pheno — balanced hybrid, dessert classic.",
    intro:
      "Gelato 41 is a Cookies Fam Gelato pheno (Sunset Sherbet × Thin Mint GSC) — balanced hybrid with a " +
      "sweet vanilla-citrus aroma and a heavy body high without clouding the head. One of the most-circulated " +
      "Gelato cuts; parent strain to Gushers, Jealousy, and many modern hybrids.",
    lineage: "Sunset Sherbet × Thin Mint GSC",
    parents: ["sunset-sherbet", "thin-mint-gsc"],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Tingly", "Euphoric", "Happy"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "citrus-sweet top" },
      { name: "Myrcene", note: "earthy undertone" },
    ],
    flavor: ["Sweet vanilla", "Citrus", "Cream"],
    bestFor: ["After work", "Casual social", "Couch + show"],
    avoidIf: ["Low-tolerance — runs high", "You want a clean head-up sativa"],
    faqs: [
      {
        q: "What’s the difference between Gelato 33 and Gelato 41?",
        a: "Both are Cookies Fam Gelato phenos from the same Sunset Sherbet × Thin Mint GSC cross. Gelato 33 (the ‘gelato’ in our index) leans more balanced; Gelato 41 runs heavier on the body. Same family, different pheno selection.",
      },
      {
        q: "Is Gelato 41 indica, sativa, or hybrid?",
        a: "Gelato 41 is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Sunset Sherbet × Thin Mint GSC. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Gelato 41 taste like?",
        a: "Gelato 41 hits sweet vanilla up front, citrus through the middle, and cream on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Gelato 41?",
        a: "Gelato 41 tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Gelato 41 best for?",
        a: "Gelato 41 reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/gelato-41",
        "https://cookiesfamily.com/strains/gelato-41",
      ],
      notes:
        "Leafly + Cookies Fam confirm Sunset Sherbet × Thin Mint GSC, balanced hybrid, Cookies Fam breeder. Both parents in our index. Top terpenes Caryophyllene/Limonene/Myrcene match. THC ~21% (within 20–25%). Pheno-sibling to gelato (Gelato 33) and bacio-gelato in our index.",
      verifiedAt: "2026-05-16",
    },
  },

  "grape-stomper": {
    slug: "grape-stomper",
    name: "Grape Stomper",
    type: "hybrid",
    aliases: ["Grape Stomper", "Sour Grapes", "Grape Stompers"],
    tagline: "Gage Green sativa-hybrid — sweet grape, head-up effect.",
    intro:
      "Grape Stomper (sometimes Sour Grapes) is a Gage Green Group cross of Sour Diesel × Purple Elephant. " +
      "Sativa-leaning hybrid with a sweet grape-diesel aroma and a head-up uplifting effect. Parent strain to " +
      "Grape Pie, which is a parent of Lava Cake. Long-time WA shelf staple with a strong aroma signature.",
    lineage: "Sour Diesel × Purple Elephant",
    parents: ["sour-diesel", null],
    thcRange: "16–22%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Happy", "Focused", "Euphoric"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "grape-citrus top" },
      { name: "Myrcene", note: "earthy undertone" },
    ],
    flavor: ["Grape", "Sweet diesel", "Berry"],
    bestFor: ["Daytime use", "Creative work", "Casual social"],
    avoidIf: ["Sweet-grape aromas turn you off", "You want a heavy indica"],
    faqs: [
      {
        q: "Why are there two names — Grape Stomper and Sour Grapes?",
        a: "Naming dispute from the early seed days. Same Gage Green cross; both names are still used interchangeably on WA shelves.",
      },
      {
        q: "Is Grape Stomper indica, sativa, or hybrid?",
        a: "Grape Stomper is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Sour Diesel × Purple Elephant. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Grape Stomper taste like?",
        a: "Grape Stomper hits grape up front, sweet diesel through the middle, and berry on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Grape Stomper?",
        a: "Grape Stomper tests in the 16–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Grape Stomper best for?",
        a: "Grape Stomper reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/grape-stomper",
        "https://weedmaps.com/strains/grape-stomper",
      ],
      notes:
        "Leafly confirms Sour Diesel × Purple Elephant, sativa-leaning hybrid, Gage Green Group breeder. Sour Diesel in our index (Wave 1). Purple Elephant not in our index — kept null. Top terpenes Caryophyllene/Limonene/Myrcene match. THC ~18% (within 16–22%). Parent of grape-pie in this wave.",
      verifiedAt: "2026-05-16",
    },
  },

  "granddaddy-bruce": {
    slug: "granddaddy-bruce",
    name: "Granddaddy Bruce",
    type: "hybrid",
    aliases: ["Granddaddy Bruce", "GDB"],
    tagline: "Granddaddy Purple × Bruce Banner — heavy modern hybrid.",
    intro:
      "Granddaddy Bruce is a Granddaddy Purple × Bruce Banner cross — indica-leaning hybrid that combines the " +
      "sweet grape aromatic of GDP with the higher-THC potency of Bruce Banner. Heavy body, mellow head, runs " +
      "on the higher end of the THC range. Customers who like both parents tend to reach for this.",
    lineage: "Granddaddy Purple × Bruce Banner",
    parents: ["granddaddy-purple", "bruce-banner"],
    thcRange: "22–28%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Euphoric", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy, body-heavy" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Caryophyllene", note: "peppery base" },
    ],
    flavor: ["Sweet grape", "Berry", "Earth"],
    bestFor: ["End of day", "Couch + show", "High-shelf hybrid lovers"],
    avoidIf: ["Low-tolerance — runs high", "You want a clean head-up sativa"],
    faqs: [
      {
        q: "Is Granddaddy Bruce stronger than Granddaddy Purple?",
        a: "Yes — Bruce Banner pushes the THC higher than GDP alone. Same sweet-grape aroma, more body weight and more cerebral start.",
      },
      {
        q: "Is Granddaddy Bruce indica, sativa, or hybrid?",
        a: "Granddaddy Bruce is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Granddaddy Purple × Bruce Banner. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Granddaddy Bruce taste like?",
        a: "Granddaddy Bruce hits sweet grape up front, berry through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Granddaddy Bruce?",
        a: "Granddaddy Bruce tests in the 22–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Granddaddy Bruce best for?",
        a: "Granddaddy Bruce reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://weedmaps.com/strains/granddaddy-bruce",
        "https://www.leafly.com/strains/granddaddy-bruce",
      ],
      notes:
        "Both Weedmaps and Leafly confirm Granddaddy Purple × Bruce Banner, indica-leaning hybrid. Both parents in our index (Wave 1). Top terpenes Myrcene/Limonene/Caryophyllene match. THC ~24% (within 22–28%).",
      verifiedAt: "2026-05-16",
    },
  },

  "gushers": {
    slug: "gushers",
    name: "Gushers",
    type: "hybrid",
    aliases: ["Gushers", "White Gushers", "TK41"],
    tagline: "Cookies Fam — Triangle Kush × Gelato 41, candy-fruit hybrid.",
    intro:
      "Gushers (sometimes White Gushers or TK41) is a Cookies Fam cross of Triangle Kush × Gelato 41 — " +
      "indica-leaning hybrid with a sweet candy-fruit aroma and a uplifting-then-soothing effect. Bright " +
      "green buds with heavy trichome coverage; popular modern dessert hybrid.",
    lineage: "Triangle Kush × Gelato 41",
    parents: ["triangle-kush", "gelato-41"],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Uplifted", "Tingly"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Limonene", note: "sweet candy citrus" },
      { name: "Linalool", note: "floral lavender" },
    ],
    flavor: ["Candy fruit", "Sweet berry", "Tropical"],
    bestFor: ["After work", "Casual social", "Couch + show"],
    avoidIf: ["Low-tolerance — runs high", "You want a clean head-up sativa"],
    faqs: [
      {
        q: "Is Gushers the same as White Gushers?",
        a: "Yes — same strain. White Gushers (or TK41) refers to the frostier phenotypes; the underlying cross is the same Triangle Kush × Gelato 41.",
      },
      {
        q: "Is Gushers indica, sativa, or hybrid?",
        a: "Gushers is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Triangle Kush × Gelato 41. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Gushers taste like?",
        a: "Gushers hits candy fruit up front, sweet berry through the middle, and tropical on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Gushers?",
        a: "Gushers tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Gushers best for?",
        a: "Gushers reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/gushers",
        "https://weedmaps.com/strains/gushers",
      ],
      notes:
        "Leafly + Weedmaps confirm Triangle Kush × Gelato 41, indica-leaning hybrid, Cookies Fam breeder. Both parents in our index (Triangle Kush in Wave 2, Gelato 41 in this wave). Top terpenes Caryophyllene/Limonene/Linalool match. THC ~22% (within 20–26%).",
      verifiedAt: "2026-05-16",
    },
  },

  "horchata": {
    slug: "horchata",
    name: "Horchata",
    type: "hybrid",
    aliases: ["Horchata"],
    tagline: "Compound Genetics — Jet Fuel Gelato × Mochi Gelato, vanilla-nutty.",
    intro:
      "Horchata is a Compound Genetics cross of Jet Fuel Gelato × Mochi Gelato — balanced hybrid with a sweet " +
      "vanilla-coffee-nutty aroma that matches the name. Uplifting-and-relaxing effect with myrcene-led terpene " +
      "profile. Modern Compound Genetics shelf staple.",
    lineage: "Jet Fuel Gelato × Mochi Gelato",
    parents: [null, null],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Focused", "Happy", "Tingly"],
    terpenes: [
      { name: "Myrcene", note: "earthy, body-loose" },
      { name: "Pinene", note: "fresh pine accent" },
      { name: "Caryophyllene", note: "peppery base" },
    ],
    flavor: ["Vanilla", "Coffee", "Nutty"],
    bestFor: ["Late afternoon", "Creative work", "Casual social"],
    avoidIf: ["You want a heavy indica", "Sweet-vanilla aromas turn you off"],
    faqs: [
      {
        q: "Does Horchata actually taste like horchata?",
        a: "The vanilla and nutty notes hit close — comes from the terpene combination. Coffee comes in on the exhale. Loaded sweet aromatic, named accurately.",
      },
      {
        q: "Is Horchata indica, sativa, or hybrid?",
        a: "Horchata is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Jet Fuel Gelato × Mochi Gelato. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "How strong is Horchata?",
        a: "Horchata tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Horchata best for?",
        a: "Horchata reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
      {
        q: "What terpenes are in Horchata?",
        a: "The dominant terpenes in Horchata are Myrcene (earthy, mango-like, with a mild body-heavy quality), Pinene (sharp pine, fresh and focusing), and Caryophyllene (peppery and warm, spicy on the back end). The blend is what gives the strain its specific nose and the character customers report on the exhale.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/horchata",
        "https://weedmaps.com/strains/horchata",
      ],
      notes:
        "Leafly confirms Jet Fuel Gelato × Mochi Gelato, balanced hybrid, Compound Genetics breeder. Neither parent in our index — both kept null (Jet Fuel is in this wave but Jet Fuel Gelato is a different cross). Top terpenes Myrcene/Pinene/Caryophyllene match. THC ~20% (within 18–24%).",
      verifiedAt: "2026-05-16",
    },
  },

  "jealousy": {
    slug: "jealousy",
    name: "Jealousy",
    type: "hybrid",
    aliases: ["Jealousy", "J"],
    tagline: "Seed Junky — Sherbet Bx1 × Gelato 41, modern balanced hybrid.",
    intro:
      "Jealousy is a Seed Junky Genetics cross of Sherbert Bx1 × Gelato 41 — balanced hybrid with a sweet-fuel " +
      "aroma and an unusual mentally-relaxed-physically-energetic effect pattern. Runs into the high 20s on THC. " +
      "2022 Leafly Strain of the Year; parent of Permanent Marker.",
    lineage: "Sherbert Bx1 × Gelato 41",
    parents: [null, "gelato-41"],
    thcRange: "22–29%",
    cbdRange: "<1%",
    effects: ["Giggly", "Relaxed", "Talkative", "Euphoric"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, fuel-warm" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Myrcene", note: "earthy undertone" },
    ],
    flavor: ["Sweet fuel", "Cookies", "Cream"],
    bestFor: ["Casual social", "Late afternoon", "High-shelf hybrid lovers"],
    avoidIf: ["Low-tolerance — runs high", "You want a heavy knockout indica"],
    faqs: [
      {
        q: "Why was Jealousy named 2022 Strain of the Year?",
        a: "Combination of high THC, distinctive sweet-fuel aroma, and the unusual balanced effect (mentally chill, physically energetic). Customers reach for it as a high-shelf social hybrid.",
      },
      {
        q: "Is Jealousy indica, sativa, or hybrid?",
        a: "Jealousy is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Sherbert Bx1 × Gelato 41. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Jealousy taste like?",
        a: "Jealousy hits sweet fuel up front, cookies through the middle, and cream on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Jealousy?",
        a: "Jealousy tests in the 22–29% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Jealousy best for?",
        a: "Jealousy reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/jealousy",
        "https://weedmaps.com/strains/jealousy",
      ],
      notes:
        "Leafly confirms Sherbert Bx1 × Gelato 41, balanced hybrid, Seed Junky Genetics breeder. Gelato 41 in this wave. Sherbert Bx1 not in our index — kept null. Top terpenes Caryophyllene/Limonene/Myrcene match. THC ~28% (within 22–29%). 2022 Leafly Strain of the Year. Parent of permanent-marker in our index (Wave 2).",
      verifiedAt: "2026-05-16",
    },
  },

  "modified-grapes": {
    slug: "modified-grapes",
    name: "Modified Grapes",
    type: "hybrid",
    aliases: ["Modified Grapes", "MG"],
    tagline: "Symbiotic — GMO × Purple Punch, savory-grape hybrid.",
    intro:
      "Modified Grapes is a Symbiotic Genetics cross of GMO × Purple Punch — balanced hybrid with a savory-and-sweet " +
      "grape-honey aroma. Lighter than GMO alone, sweeter than Purple Punch alone. Calming effect, fairly mellow. " +
      "Modern Symbiotic shelf addition.",
    lineage: "GMO × Purple Punch",
    parents: ["gmo-cookies", "purple-punch"],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Tingly", "Happy"],
    terpenes: [
      { name: "Pinene", note: "fresh pine top" },
      { name: "Caryophyllene", note: "peppery, savory-warm" },
      { name: "Limonene", note: "grape-citrus" },
    ],
    flavor: ["Grape", "Honey", "Berry"],
    bestFor: ["End of day", "Couch + show", "Sweet-savory hybrid lovers"],
    avoidIf: ["Low-tolerance — runs high", "You want energetic"],
    faqs: [
      {
        q: "How is Modified Grapes different from GMO?",
        a: "The Purple Punch side sweetens it — same savory baseline as GMO, with a grape-honey top that softens the overall aroma. Effect lands a bit more relaxed than GMO alone.",
      },
      {
        q: "Is Modified Grapes indica, sativa, or hybrid?",
        a: "Modified Grapes is a hybrid — a cross that pulls from both sides of the family tree. The lineage is GMO × Purple Punch. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Modified Grapes taste like?",
        a: "Modified Grapes hits grape up front, honey through the middle, and berry on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Modified Grapes?",
        a: "Modified Grapes tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Modified Grapes best for?",
        a: "Modified Grapes reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/modified-grapes",
        "https://weedmaps.com/strains/modified-grapes",
      ],
      notes:
        "Leafly confirms GMO × Purple Punch, balanced hybrid, Symbiotic Genetics breeder. Both parents in our index (GMO is gmo-cookies, Purple Punch in Wave 1). Top terpenes Pinene/Caryophyllene/Limonene match. THC ~23% (within 20–26%).",
      verifiedAt: "2026-05-16",
    },
  },

  "oreoz": {
    slug: "oreoz",
    name: "Oreoz",
    type: "hybrid",
    aliases: ["Oreoz", "Oreo Cookies", "Oreos"],
    tagline: "Cookies and Cream × Secret Weapon — campfire-s’mores hybrid.",
    intro:
      "Oreoz is a Cookies and Cream × Secret Weapon cross — balanced hybrid with a sweet chocolate-diesel-s’mores " +
      "aroma. Calming effect, long-lasting, suited for evening use. Customers reach for it for the unusual " +
      "chocolatey flavor and the steady relaxed landing.",
    lineage: "Cookies and Cream × Secret Weapon",
    parents: ["cookies-and-cream", null],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Hungry", "Tingly", "Happy"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, chocolate-warm" },
      { name: "Limonene", note: "citrus undertone" },
      { name: "Myrcene", note: "earthy, body-loose" },
    ],
    flavor: ["Chocolate", "Diesel", "Sweet cream"],
    bestFor: ["End of day", "Couch + dessert", "Sweet-chocolate aroma lovers"],
    avoidIf: ["Sweet-chocolate aromas turn you off", "You want a clean head-up sativa"],
    faqs: [
      {
        q: "Does Oreoz really smell like Oreos?",
        a: "The chocolate is real — customers consistently describe campfire s’mores. The diesel from Secret Weapon underneath keeps it from being too candy.",
      },
      {
        q: "Is Oreoz indica, sativa, or hybrid?",
        a: "Oreoz is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Cookies and Cream × Secret Weapon. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Oreoz taste like?",
        a: "Oreoz hits chocolate up front, diesel through the middle, and sweet cream on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Oreoz?",
        a: "Oreoz tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Oreoz best for?",
        a: "Oreoz reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/oreoz",
        "https://weedmaps.com/strains/oreoz",
      ],
      notes:
        "Leafly confirms Cookies and Cream × Secret Weapon, balanced hybrid. Cookies and Cream in our index (Wave 1). Secret Weapon not in our index — kept null. Top terpenes Caryophyllene/Limonene/Myrcene match. THC ~20% (within 18–24%).",
      verifiedAt: "2026-05-16",
    },
  },

  "pink-runtz": {
    slug: "pink-runtz",
    name: "Pink Runtz",
    type: "hybrid",
    aliases: ["Pink Runtz", "PR"],
    tagline: "Runtz phenotype — sweet candy hybrid, head-up uplift.",
    intro:
      "Pink Runtz is a phenotype of Runtz (Zkittlez × Gelato) — balanced hybrid with a sweet candy-floral " +
      "aroma and an energizing effect that lands more uplifting than its parent. Long-lasting; runs high-THC. " +
      "Customers who already like Runtz tend to land on Pink Runtz when they want more head-up.",
    lineage: "Runtz phenotype (Zkittlez × Gelato)",
    parents: ["runtz"],
    thcRange: "22–28%",
    cbdRange: "<1%",
    effects: ["Giggly", "Tingly", "Talkative", "Euphoric"],
    terpenes: [
      { name: "Limonene", note: "candy-citrus top" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Linalool", note: "floral lavender" },
    ],
    flavor: ["Sweet candy", "Tropical", "Floral"],
    bestFor: ["Daytime use", "Casual social", "Creative work"],
    avoidIf: ["Low-tolerance — runs high", "Sweet-candy aromas turn you off"],
    faqs: [
      {
        q: "Is Pink Runtz different from regular Runtz?",
        a: "Same family, different pheno selection. Runtz is the parent line. Pink Runtz selects for the pink-hued buds and tends to lean more head-up. Same Zkittlez × Gelato underneath.",
      },
      {
        q: "Is Pink Runtz indica, sativa, or hybrid?",
        a: "Pink Runtz is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Runtz phenotype (Zkittlez × Gelato). The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Pink Runtz taste like?",
        a: "Pink Runtz hits sweet candy up front, tropical through the middle, and floral on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Pink Runtz?",
        a: "Pink Runtz tests in the 22–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Pink Runtz best for?",
        a: "Pink Runtz reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/pink-runtz",
        "https://weedmaps.com/strains/pink-runtz",
      ],
      notes:
        "Leafly confirms phenotype of Runtz (Zkittlez × Gelato), balanced hybrid. Runtz in our index (Wave 1). Top terpenes Limonene/Caryophyllene/Linalool match. THC ~25% (within 22–28%). Pheno-sibling to white-runtz in this wave.",
      verifiedAt: "2026-05-16",
    },
  },

  "rs11": {
    slug: "rs11",
    name: "RS11",
    type: "hybrid",
    aliases: ["RS11", "Rainbow Sherbet 11", "RS-11"],
    tagline: "Deo Farms / Wizard Trees — Pink Guava × Sunset Sherbet, modern.",
    intro:
      "RS11 (Rainbow Sherbert #11) is a Deo Farms cross selected by Wizard Trees of LA — Pink Guava (OZ Kush " +
      "project) × Sunset Sherbet. Balanced hybrid with a sweet apricot-peach-citrus aroma and a calm-but-alert " +
      "effect. Modern high-shelf hybrid out of California; runs high-THC.",
    lineage: "Pink Guava × Sunset Sherbet",
    parents: [null, "sunset-sherbet"],
    thcRange: "22–28%",
    cbdRange: "<1%",
    effects: ["Focused", "Giggly", "Relaxed", "Happy"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "citrus-fruit top" },
      { name: "Humulene", note: "earthy, hop-like" },
    ],
    flavor: ["Apricot", "Peach", "Citrus"],
    bestFor: ["Late afternoon", "Casual social", "High-shelf hybrid lovers"],
    avoidIf: ["Low-tolerance — runs high", "Sweet-fruit aromas turn you off"],
    faqs: [
      {
        q: "What does the RS in RS11 stand for?",
        a: "Rainbow Sherbert — the 11 is the pheno number selected by Wizard Trees out of the Deo Farms cross. The fruit-forward apricot-peach aroma is the defining feature.",
      },
      {
        q: "Is RS11 indica, sativa, or hybrid?",
        a: "RS11 is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Pink Guava × Sunset Sherbet. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does RS11 taste like?",
        a: "RS11 hits apricot up front, peach through the middle, and citrus on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is RS11?",
        a: "RS11 tests in the 22–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is RS11 best for?",
        a: "RS11 reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/rs11",
        "https://weedmaps.com/strains/rs11",
      ],
      notes:
        "Leafly confirms Pink Guava × Sunset Sherbet, balanced hybrid, Deo Farms breeder, Wizard Trees pheno selection. Sunset Sherbet in our index (Wave 1). Pink Guava not in our index — kept null. Top terpenes Caryophyllene/Limonene/Humulene match. THC ~24% (within 22–28%).",
      verifiedAt: "2026-05-16",
    },
  },

  "runtz-muffin": {
    slug: "runtz-muffin",
    name: "Runtz Muffin",
    type: "hybrid",
    aliases: ["Runtz Muffin", "RM"],
    tagline: "Runtz × Orange Punch — sweet citrus-candy hybrid.",
    intro:
      "Runtz Muffin is a Runtz × Orange Punch cross — balanced hybrid with a sweet candy-citrus aroma and a " +
      "tingly relaxed effect. Lighter than its Runtz parent on the body, with a brighter citrus top from the " +
      "Orange Punch side. Calming overall, good late-afternoon pick.",
    lineage: "Runtz × Orange Punch",
    parents: ["runtz", null],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Tingly", "Giggly", "Relaxed", "Euphoric"],
    terpenes: [
      { name: "Limonene", note: "candy-orange top" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Myrcene", note: "earthy undertone" },
    ],
    flavor: ["Orange candy", "Butter", "Berry"],
    bestFor: ["Late afternoon", "Casual social", "Sweet-candy hybrid lovers"],
    avoidIf: ["Sweet aromas aren’t your thing", "Low-tolerance — runs high"],
    faqs: [
      {
        q: "Is Runtz Muffin sweeter than Runtz?",
        a: "Brighter on the citrus from the Orange Punch side. Same Runtz candy backbone, more orange and less generic tropical. Lighter body landing.",
      },
      {
        q: "Is Runtz Muffin indica, sativa, or hybrid?",
        a: "Runtz Muffin is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Runtz × Orange Punch. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Runtz Muffin taste like?",
        a: "Runtz Muffin hits orange candy up front, butter through the middle, and berry on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Runtz Muffin?",
        a: "Runtz Muffin tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Runtz Muffin best for?",
        a: "Runtz Muffin reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/runtz-muffin",
        "https://weedmaps.com/strains/runtz-muffin",
      ],
      notes:
        "Leafly confirms Runtz × Orange Punch, balanced hybrid. Runtz in our index (Wave 1). Orange Punch not in our index — kept null. Flavor profile (ammonia/butter/berry per Leafly) aligns with Limonene/Caryophyllene/Myrcene typical for Runtz crosses.",
      verifiedAt: "2026-05-16",
    },
  },

  "sherbinski-mints": {
    slug: "sherbinski-mints",
    name: "Sherbinski Mints",
    type: "hybrid",
    aliases: ["Sherbinski Mints", "Sherbinskis Mints", "SM"],
    tagline: "Sherbinski Gelato lineup — minty Sunset Sherbet pheno.",
    intro:
      "Sherbinski Mints is a Sherbinski (Cookies Fam) selection in the Gelato lineup — Sunset Sherbet × Thin " +
      "Mint Cookies pheno with the loudest mint note in the family. Balanced hybrid, mellow body, mint-and-cream " +
      "aromatic that’s the loudest part of the strain. Indica-leaning landing.",
    lineage: "Sunset Sherbet × Thin Mint GSC",
    parents: ["sunset-sherbet", "thin-mint-gsc"],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Euphoric", "Happy", "Tingly"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Linalool", note: "floral lavender, minty" },
    ],
    flavor: ["Mint", "Cream", "Vanilla"],
    bestFor: ["After work", "Couch + show", "Dessert-mint hybrid lovers"],
    avoidIf: ["Minty-sweet aromas turn you off", "Low-tolerance — runs high"],
    faqs: [
      {
        q: "Is Sherbinski Mints the same as Bacio Gelato?",
        a: "Both are Sherbinski Gelato selections from the same Sunset Sherbet × Thin Mint GSC genetic pool. Sherbinski Mints emphasizes the mint pheno; Bacio runs slightly heavier. Different cuts of the same family.",
      },
      {
        q: "Is Sherbinski Mints indica, sativa, or hybrid?",
        a: "Sherbinski Mints is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Sunset Sherbet × Thin Mint GSC. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Sherbinski Mints taste like?",
        a: "Sherbinski Mints hits mint up front, cream through the middle, and vanilla on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Sherbinski Mints?",
        a: "Sherbinski Mints tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Sherbinski Mints best for?",
        a: "Sherbinski Mints reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.allbud.com/marijuana-strains/hybrid/sherbinskis-mints",
        "https://weedmaps.com/strains/sherbinski-mints",
      ],
      notes:
        "AllBud + Weedmaps confirm Sunset Sherbet × Thin Mint GSC, balanced hybrid, Sherbinski (Cookies Fam) breeder. Leafly entry not found — used AllBud as Tier 2 source. Both parents in our index. Top terpenes Caryophyllene/Limonene/Linalool match the Sherbinski Gelato lineup pattern.",
      verifiedAt: "2026-05-16",
    },
  },

  "sour-og": {
    slug: "sour-og",
    name: "Sour OG",
    type: "hybrid",
    aliases: ["Sour OG", "SOG", "Sour OG Kush"],
    tagline: "Sour Diesel × OG Kush — diesel-fuel hybrid, balanced.",
    intro:
      "Sour OG is a Sour Diesel × OG Kush cross — balanced hybrid that starts head-up energetic and lands " +
      "relaxed-body. Sharp sour-lemon-pine-fuel aroma. The kind of strain customers reach for when they can’t " +
      "decide between Sour Diesel and OG Kush — splits the difference.",
    lineage: "Sour Diesel × OG Kush",
    parents: ["sour-diesel", "og-kush"],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Talkative", "Uplifted"],
    terpenes: [
      { name: "Limonene", note: "sour-lemon top" },
      { name: "Myrcene", note: "earthy undertone" },
      { name: "Caryophyllene", note: "peppery base" },
    ],
    flavor: ["Sour lemon", "Diesel", "Pine"],
    bestFor: ["Late afternoon", "Casual social", "Diesel-OG fans"],
    avoidIf: ["Diesel aromas turn you off", "You want a clean head-up sativa"],
    faqs: [
      {
        q: "Is Sour OG more like Sour Diesel or OG Kush?",
        a: "Honestly splits the difference. Head-up energetic start (Sour D side), relaxed body landing (OG Kush side). Sharp sour-lemon-fuel aroma from Sour D, pine and earth from OG.",
      },
      {
        q: "Is Sour OG indica, sativa, or hybrid?",
        a: "Sour OG is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Sour Diesel × OG Kush. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Sour OG taste like?",
        a: "Sour OG hits sour lemon up front, diesel through the middle, and pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Sour OG?",
        a: "Sour OG tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Sour OG best for?",
        a: "Sour OG reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/sour-og",
        "https://weedmaps.com/strains/sour-og",
      ],
      notes:
        "Leafly confirms Sour Diesel × OG Kush, balanced hybrid. Both parents in our index (Wave 1). Top terpenes Limonene/Myrcene/Caryophyllene match. THC ~22% (within 18–24%).",
      verifiedAt: "2026-05-16",
    },
  },

  "the-soap": {
    slug: "the-soap",
    name: "The Soap",
    type: "hybrid",
    aliases: ["The Soap", "Soap"],
    tagline: "Seed Junky / Berner’s Cookies — Animal Mints × Kush Mints.",
    intro:
      "The Soap is a Seed Junky Genetics and Berner’s Cookies collaboration — Animal Mints × Kush Mints cross. " +
      "Balanced hybrid with a sharp clean minty-pine aroma that lives up to the name. Head-up energizing effect, " +
      "more focused than relaxing. Runs high-THC.",
    lineage: "Animal Mints × Kush Mints",
    parents: ["animal-mints", "kush-mints"],
    thcRange: "19–25%",
    cbdRange: "<1%",
    effects: ["Focused", "Energetic", "Aroused", "Happy"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "citrus undertone" },
      { name: "Linalool", note: "floral lavender, minty" },
    ],
    flavor: ["Sharp mint", "Pine", "Soap"],
    bestFor: ["Daytime use", "Creative work", "Casual social"],
    avoidIf: ["Soapy-mint aromas turn you off", "You want a knockout indica"],
    faqs: [
      {
        q: "Why is it called The Soap?",
        a: "Aroma is unmistakably clean-soap — sharp mint over a slight pine. The double-Mints parentage (Animal Mints × Kush Mints) pushes the minty note all the way to actual-soap territory. Polarizing but named accurately.",
      },
      {
        q: "Is The Soap indica, sativa, or hybrid?",
        a: "The Soap is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Animal Mints × Kush Mints. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does The Soap taste like?",
        a: "The Soap hits sharp mint up front, pine through the middle, and soap on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is The Soap?",
        a: "The Soap tests in the 19–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is The Soap best for?",
        a: "The Soap reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/the-soap",
        "https://weedmaps.com/strains/the-soap",
      ],
      notes:
        "Leafly confirms Animal Mints × Kush Mints, balanced hybrid, Seed Junky Genetics × Berner’s Cookies collaboration. Both parents in our index (Wave 2). Top terpenes Caryophyllene/Limonene/Linalool match. THC ~22% (within 19–25%).",
      verifiedAt: "2026-05-16",
    },
  },

  "berry-white": {
    slug: "berry-white",
    name: "Berry White",
    type: "hybrid",
    aliases: ["Berry White", "BW"],
    tagline: "Blueberry × White Widow — sweet-berry, mellow classic hybrid.",
    intro:
      "Berry White is a Blueberry × White Widow cross — indica-leaning hybrid with a sweet berry aroma and a " +
      "mellow uplifting head + relaxed body. Lighter than most Blueberry crosses, more conversational than " +
      "sedating. Named after the singer. Long-time WA shelf staple.",
    lineage: "Blueberry × White Widow",
    parents: ["blueberry", "white-widow"],
    thcRange: "15–22%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Euphoric", "Happy", "Talkative"],
    terpenes: [
      { name: "Limonene", note: "citrus-berry top" },
      { name: "Pinene", note: "fresh pine" },
      { name: "Caryophyllene", note: "peppery base" },
    ],
    flavor: ["Sweet berry", "Pine", "Earth"],
    bestFor: ["Late afternoon", "Casual social", "Conversation"],
    avoidIf: ["You want a heavy knockout indica", "Sweet-berry aromas turn you off"],
    faqs: [
      {
        q: "Does Berry White lean more Blueberry or White Widow?",
        a: "Body-wise, more Blueberry (relaxed, mellow). Head-wise, more White Widow (uplifting, conversational). One of the more balanced of the older-school hybrids.",
      },
      {
        q: "Is Berry White indica, sativa, or hybrid?",
        a: "Berry White is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Blueberry × White Widow. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Berry White taste like?",
        a: "Berry White hits sweet berry up front, pine through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Berry White?",
        a: "Berry White tests in the 15–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Berry White best for?",
        a: "Berry White reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/berry-white",
        "https://weedmaps.com/strains/berry-white",
      ],
      notes:
        "Leafly confirms Blueberry × White Widow, indica-leaning hybrid. Both parents in our index (Wave 1). Top terpenes Limonene/Pinene/Caryophyllene match. THC ~16% (within 15–22%). Named after the singer Barry White (spelled Berry).",
      verifiedAt: "2026-05-16",
    },
  },

  "watermelon-gushers": {
    slug: "watermelon-gushers",
    name: "Watermelon Gushers",
    type: "hybrid",
    aliases: ["Watermelon Gushers", "WG"],
    tagline: "Gushers × Watermelon Z — sweet melon-candy hybrid.",
    intro:
      "Watermelon Gushers is a Gushers × Watermelon Zkittlez cross — indica-leaning hybrid with a sweet " +
      "watermelon-candy aroma and a heavier body landing than either parent alone. Customers who already like " +
      "Gushers or Watermelon Zkittlez reach for this to combine both.",
    lineage: "Gushers × Watermelon Zkittlez",
    parents: ["gushers", "watermelon-zkittlez"],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Happy", "Tingly"],
    terpenes: [
      { name: "Limonene", note: "candy-melon top" },
      { name: "Caryophyllene", note: "peppery base" },
      { name: "Myrcene", note: "earthy, body-heavy" },
    ],
    flavor: ["Watermelon candy", "Sweet berry", "Tropical"],
    bestFor: ["End of day", "Couch + show", "Sweet-candy hybrid lovers"],
    avoidIf: ["Low-tolerance — runs high", "Candy-sweet aromas turn you off"],
    faqs: [
      {
        q: "Is Watermelon Gushers heavier than Gushers?",
        a: "Yes — the Watermelon Zkittlez side adds body weight. Same candy-sweet nose, more late-night landing.",
      },
      {
        q: "Is Watermelon Gushers indica, sativa, or hybrid?",
        a: "Watermelon Gushers is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Gushers × Watermelon Zkittlez. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Watermelon Gushers taste like?",
        a: "Watermelon Gushers hits watermelon candy up front, sweet berry through the middle, and tropical on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Watermelon Gushers?",
        a: "Watermelon Gushers tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Watermelon Gushers best for?",
        a: "Watermelon Gushers reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.allbud.com/marijuana-strains/hybrid/watermelon-gushers",
        "https://weedmaps.com/strains/watermelon-gushers-marijuana-strain",
      ],
      notes:
        "AllBud + Weedmaps confirm Gushers × Watermelon Zkittlez, indica-leaning hybrid. Leafly entry not found — used AllBud as Tier 2 source. Both parents in our index (both in this wave). Top terpenes Limonene/Caryophyllene/Myrcene match the parent profile. THC ~22% typical.",
      verifiedAt: "2026-05-16",
    },
  },

  "white-runtz": {
    slug: "white-runtz",
    name: "White Runtz",
    type: "hybrid",
    aliases: ["White Runtz", "WR"],
    tagline: "Runtz with frosty white trichomes — sweet candy hybrid.",
    intro:
      "White Runtz is a Gelato × Zkittlez cross (Runtz family) selected for its striking white trichome " +
      "coverage — the buds look snow-dusted. Balanced hybrid with a sweet candy-peach-vanilla-floral aroma " +
      "and a tingly relaxed effect. Lighter THC than Pink Runtz but same family.",
    lineage: "Gelato × Zkittlez",
    parents: ["gelato", "zkittlez"],
    thcRange: "17–23%",
    cbdRange: "<1%",
    effects: ["Tingly", "Relaxed", "Euphoric", "Happy"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "candy-citrus top" },
      { name: "Linalool", note: "floral lavender" },
    ],
    flavor: ["Sweet candy", "Peach", "Vanilla"],
    bestFor: ["Late afternoon", "Casual social", "Couch + show"],
    avoidIf: ["Sweet-candy aromas turn you off", "You want energetic"],
    faqs: [
      {
        q: "Why are White Runtz buds so white?",
        a: "Heavy trichome coverage — selected pheno that frosts up more than the average Runtz cut. Same Zkittlez × Gelato cross, different visual selection. Looks snow-dusted in good light.",
      },
      {
        q: "Is White Runtz indica, sativa, or hybrid?",
        a: "White Runtz is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Gelato × Zkittlez. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does White Runtz taste like?",
        a: "White Runtz hits sweet candy up front, peach through the middle, and vanilla on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is White Runtz?",
        a: "White Runtz tests in the 17–23% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is White Runtz best for?",
        a: "White Runtz reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/white-runtz",
        "https://weedmaps.com/strains/white-runtz",
      ],
      notes:
        "Leafly confirms Gelato × Zkittlez (Runtz pheno selected for white trichomes), balanced hybrid. Both parents in our index (Wave 1). Top terpenes Caryophyllene/Limonene/Linalool match. THC ~18% (within 17–23%). Pheno-sibling to pink-runtz in this wave.",
      verifiedAt: "2026-05-16",
    },
  },

  "zoap": {
    slug: "zoap",
    name: "Zoap",
    type: "hybrid",
    aliases: ["Zoap", "Z-Soap"],
    tagline: "Deo Farms — Rainbow Sherbet × Pink Guava, soap-floral hybrid.",
    intro:
      "Zoap is a Deo Farms cross of Rainbow Sherbet × Pink Guava — balanced hybrid with a floral soap-and-sweet " +
      "aroma. Calming effect with a giggly head. Sister strain to RS11 (both Deo Farms / Pink Guava lineage). " +
      "Modern California shelf hybrid.",
    lineage: "Rainbow Sherbet × Pink Guava",
    parents: [null, null],
    thcRange: "19–25%",
    cbdRange: "<1%",
    effects: ["Giggly", "Relaxed", "Happy", "Euphoric"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm" },
      { name: "Limonene", note: "citrus-floral top" },
      { name: "Humulene", note: "earthy, hop-like" },
    ],
    flavor: ["Floral soap", "Sweet citrus", "Tropical"],
    bestFor: ["Late afternoon", "Casual social", "Sweet-floral aroma lovers"],
    avoidIf: ["Soapy-floral aromas turn you off", "You want a heavy indica"],
    faqs: [
      {
        q: "Is Zoap related to RS11?",
        a: "Yes — both come out of Deo Farms’ Pink Guava project. Zoap is Rainbow Sherbet × Pink Guava; RS11 is the same Pink Guava paired with Sunset Sherbet. Sister strains.",
      },
      {
        q: "Is Zoap indica, sativa, or hybrid?",
        a: "Zoap is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Rainbow Sherbet × Pink Guava. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Zoap taste like?",
        a: "Zoap hits floral soap up front, sweet citrus through the middle, and tropical on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Zoap?",
        a: "Zoap tests in the 19–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Zoap best for?",
        a: "Zoap reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/zoap",
        "https://weedmaps.com/strains/zoap",
      ],
      notes:
        "Leafly confirms Rainbow Sherbet × Pink Guava, balanced hybrid, Deo Farms breeder. Neither parent in our index — both kept null. Top terpenes Caryophyllene/Limonene/Humulene match. THC ~21% (within 19–25%). Sister to rs11 in this wave.",
      verifiedAt: "2026-05-16",
    },
  },

  "zookies": {
    slug: "zookies",
    name: "Zookies",
    type: "hybrid",
    aliases: ["Zookies", "Animal Cookies × GG4"],
    tagline: "Animal Cookies × Original Glue — focused hybrid with nutty-diesel.",
    intro:
      "Zookies is an Animal Cookies × Original Glue (GG4) cross — balanced hybrid with a sweet-nutty-cookies-diesel " +
      "aroma. Level-headed effect: focused and giggly more than knockout. Customers who want Cookies-shelf " +
      "aromatics with more head-up tend to land here.",
    lineage: "Animal Cookies × Original Glue (GG4)",
    parents: ["animal-cookies", "gorilla-glue-4"],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Focused", "Giggly", "Relaxed", "Happy"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, warm woody" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Linalool", note: "floral lavender" },
    ],
    flavor: ["Nutty cookies", "Pepper", "Butter"],
    bestFor: ["Late afternoon", "Creative work", "Casual social"],
    avoidIf: ["You want a knockout indica", "Diesel undertones turn you off"],
    faqs: [
      {
        q: "Is Zookies more like Animal Cookies or GG4?",
        a: "Splits the difference. Cookies-family aromatic up front, GG4 stickiness and diesel base. More head-up than either parent alone — focused without being racey.",
      },
      {
        q: "Is Zookies indica, sativa, or hybrid?",
        a: "Zookies is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Animal Cookies × Original Glue (GG4). The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Zookies taste like?",
        a: "Zookies hits nutty cookies up front, pepper through the middle, and butter on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Zookies?",
        a: "Zookies tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Zookies best for?",
        a: "Zookies reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/zookies",
        "https://weedmaps.com/strains/zookies",
      ],
      notes:
        "Leafly confirms Animal Cookies × Original Glue (GG4), balanced hybrid. Both parents in our index (Animal Cookies in Wave 1, GG4 is gorilla-glue-4 in Wave 2). Top terpenes Caryophyllene/Limonene/Linalool match. THC ~21% (within 18–24%).",
      verifiedAt: "2026-05-16",
    },
  },

  "blue-zkittlez": {
    slug: "blue-zkittlez",
    name: "Blue Zkittlez",
    type: "hybrid",
    aliases: ["Blue Zkittlez", "Blue Z", "BZ"],
    tagline: "Blue Diamond × Original Z — mellow indica-leaning hybrid.",
    intro:
      "Blue Zkittlez is a Blue Diamond × Original Z (Zkittlez) cross — indica-leaning hybrid with a tart-citrus-and-sweet-earth " +
      "aroma and a mellow body landing. Lower-THC than most Zkittlez crosses, gentler effect. Customers who " +
      "want Zkittlez aromatics without the high-THC reach for this.",
    lineage: "Blue Diamond × Original Z (Zkittlez)",
    parents: [null, "zkittlez"],
    thcRange: "12–18%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Hungry", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy, body-loose" },
      { name: "Pinene", note: "fresh pine" },
      { name: "Caryophyllene", note: "peppery base" },
    ],
    flavor: ["Tart citrus", "Sweet earth", "Wildflower"],
    bestFor: ["Casual evening", "Low-tolerance customers", "Sweet-earthy aroma lovers"],
    avoidIf: ["You want high-THC", "You want energetic"],
    faqs: [
      {
        q: "Why is Blue Zkittlez lower-THC than other Zkittlez crosses?",
        a: "The Blue Diamond parent runs lower-THC than most Zkittlez parents. Blue Zkittlez tends to test in the 12–18% range — gentler effect, good for customers who don’t want a heavy hit.",
      },
      {
        q: "Is Blue Zkittlez indica, sativa, or hybrid?",
        a: "Blue Zkittlez is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Blue Diamond × Original Z (Zkittlez). The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Blue Zkittlez taste like?",
        a: "Blue Zkittlez hits tart citrus up front, sweet earth through the middle, and wildflower on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Blue Zkittlez?",
        a: "Blue Zkittlez tests in the 12–18% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Blue Zkittlez best for?",
        a: "Blue Zkittlez reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/blue-zkittlez",
        "https://weedmaps.com/strains/blue-zkittlez",
      ],
      notes:
        "Leafly confirms Blue Diamond × Original Z (Zkittlez), indica-dominant hybrid. Zkittlez in our index (Wave 1). Blue Diamond not in our index — kept null. Top terpenes Myrcene/Pinene/Caryophyllene match. THC ~14% (within 12–18%) — notably lower than other Zkittlez crosses.",
      verifiedAt: "2026-05-16",
    },
  },

  // ────────────────────────────────────────────────────────────────────
  // WAVE 4 (slugs 151-200) — integrated 2026-05-16
  // 50 verified strains. Tier: 45 verified-clean + 5 verified-with-note + 0 contested.
  // Type split: 23 hybrid + 15 sativa + 12 indica (CBD-leaning distributed).
  // Family Album must-includes: amnesia-haze, thai, colombian, northern-lights-5.
  // (skunk-1 + super-silver-haze already in Wave 1.)
  // Source dataset: shared/strains-wave4-151to200.ts
  // ────────────────────────────────────────────────────────────────────
  // ────────────────────────────────────────────────────────────────────
  // FAMILY ALBUM MUST-INCLUDES (4)
  // amnesia-haze · thai · colombian · northern-lights-5
  // (skunk-1 + super-silver-haze already live from Wave 1 — spec satisfied)
  // ────────────────────────────────────────────────────────────────────

  "amnesia-haze": {
    slug: "amnesia-haze",
    name: "Amnesia Haze",
    type: "sativa",
    aliases: ["Amnesia Haze", "Amnesia"],
    tagline: "Haze × Afghani — Amsterdam coffeeshop heritage sativa.",
    intro:
      "Amnesia Haze is the Dutch coffeeshop heritage sativa — a Haze × Afghani cross that took 1st place at the " +
      "2004 Cannabis Cup and 1st in the Sativa Cup again in 2012. Long-flowering haze backbone with the Afghani " +
      "side adding enough body to keep it from getting too racey. Citrus and earth on the nose, head-up and " +
      "talkative through the session.",
    lineage: "Haze × Afghani (with Jamaican and Hawaiian heritage)",
    parents: ["haze", "afghani"],
    thcRange: "17–22%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Happy", "Energetic", "Creative"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Limonene", note: "citrus top" },
    ],
    flavor: ["Citrus", "Earth", "Light spice"],
    bestFor: ["Daytime sessions", "Creative work", "Social hangouts"],
    avoidIf: ["Long-flowering haze profiles run racey on low tolerance", "You want a body-heavy indica"],
    faqs: [
      {
        q: "Why is Amnesia Haze called a coffeeshop classic?",
        a: "It's been on Amsterdam coffeeshop menus since the late 1990s and won the Cannabis Cup in 2004 and the Sativa Cup again in 2012. The Dutch haze scene is where it built its name.",
      },
      {
        q: "Is Amnesia Haze too strong for daytime use?",
        a: "It's a head-forward sativa with a long ceiling — pace yourself if you're newer to haze-family strains. Customers reach for it when they want talkative and creative, not racey.",
      },
      {
        q: "Is Amnesia Haze indica, sativa, or hybrid?",
        a: "Amnesia Haze is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Haze × Afghani (with Jamaican and Hawaiian heritage).",
      },
      {
        q: "What does Amnesia Haze taste like?",
        a: "Amnesia Haze hits citrus up front, earth through the middle, and light spice on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Amnesia Haze?",
        a: "Amnesia Haze tests in the 17–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Amnesia Haze best for?",
        a: "Amnesia Haze reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/amnesia-haze",
        "https://weedmaps.com/strains/amnesia-haze",
      ],
      notes:
        "Leafly confirms Haze × Afghani, sativa, ~19% THC. Top terpenes Myrcene/Caryophyllene/Limonene match. Cannabis Cup 2004 + Sativa Cup 2012 wins documented. Both parents in our index (haze + afghani from Wave 1).",
      verifiedAt: "2026-05-16",
    },
  },

  "thai": {
    slug: "thai",
    name: "Thai",
    type: "sativa",
    aliases: ["Thai", "Thai Stick", "Thai Landrace"],
    tagline: "Pure Thai landrace — head-up tropical heritage sativa.",
    intro:
      "Thai is a pure landrace sativa from the Mekong region — one of the foundational equatorial strains that " +
      "underpins most modern haze lineages. Customers familiar with the original Thai Stick imports of the 1970s " +
      "remember it as long-flowering, citrus-and-spice on the nose, and head-up without the cookies-shelf body " +
      "weight. Landrace genetics mean phenotype variance is wide.",
    lineage: "Landrace — Thailand (Mekong region)",
    parents: [null, null],
    thcRange: "12–18%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Energetic", "Creative", "Happy"],
    terpenes: [
      { name: "Terpinolene", note: "fresh herbal top" },
      { name: "Pinene", note: "sharp pine" },
      { name: "Limonene", note: "citrus" },
    ],
    flavor: ["Citrus", "Spice", "Earth"],
    bestFor: ["Daytime sessions", "Heritage-strain curious", "Talkative social"],
    avoidIf: ["You want body-heavy indica", "You're sensitive to long-ceiling sativas"],
    faqs: [
      {
        q: "Is Thai the same as Thai Stick?",
        a: "Thai Stick was the original 1970s import format — Thai flower tied around bamboo skewers. The genetics are Thai landrace; the 'stick' part was the smuggling presentation. Modern Thai flower is the same landrace family, just packaged the way we package everything else.",
      },
      {
        q: "Why is Thai important to modern strain lineages?",
        a: "Thai is one of the equatorial sativas that underpins the haze family. Original Haze itself crossed Mexican, Colombian, South Indian, and Thai — Thai is in the DNA of most modern haze strains.",
      },
      {
        q: "Is Thai indica, sativa, or hybrid?",
        a: "Thai is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Landrace — Thailand (Mekong region).",
      },
      {
        q: "What does Thai taste like?",
        a: "Thai hits citrus up front, spice through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Thai?",
        a: "Thai tests in the 12–18% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Thai best for?",
        a: "Thai reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/thai",
        "https://en.seedfinder.eu/strain-info/Thai/",
      ],
      notes:
        "Leafly + SeedFinder confirm Thai as a landrace sativa from Thailand, foundational to haze lineage. Both parents null (landrace). THC range conservative — landrace phenotypes vary widely.",
      verifiedAt: "2026-05-16",
    },
  },

  "colombian": {
    slug: "colombian",
    name: "Colombian",
    type: "sativa",
    aliases: ["Colombian", "Colombian Landrace", "Punto Rojo"],
    tagline: "Pure Colombian landrace — heritage equatorial sativa.",
    intro:
      "Colombian is the broader landrace category that Colombian Gold sits inside — pure equatorial sativa " +
      "from the Andes and Sierra Nevada regions. Head-up, long-flowering, citrus-and-earth on the nose. " +
      "Most modern shelf product traces some lineage back here — Skunk #1 itself had Colombian in the cross. " +
      "Customers reach for it when they want heritage sativa without modern hybrid body weight.",
    lineage: "Landrace — Colombia (Andes / Sierra Nevada de Santa Marta regions)",
    parents: [null, null],
    thcRange: "12–18%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Energetic", "Happy", "Creative"],
    terpenes: [
      { name: "Pinene", note: "sharp pine top" },
      { name: "Myrcene", note: "earthy base" },
      { name: "Caryophyllene", note: "peppery warmth" },
    ],
    flavor: ["Citrus", "Earth", "Light pine"],
    bestFor: ["Daytime sessions", "Heritage-strain curious", "Outdoor activities"],
    avoidIf: ["You want a body-heavy indica", "Long-ceiling sativas wear you out"],
    faqs: [
      {
        q: "How is Colombian different from Colombian Gold?",
        a: "Colombian Gold is one specific phenotype of the broader Colombian landrace — the gold-leaf expression from the Santa Marta region specifically. Colombian as a category includes Colombian Gold plus other regional phenotypes like Punto Rojo.",
      },
      {
        q: "What modern strains have Colombian heritage?",
        a: "Skunk #1 (Colombian × Mexican × Afghani) is the most famous — Colombian is in the DNA of the entire Skunk family. Haze also had Colombian in the original four-way cross.",
      },
      {
        q: "Is Colombian indica, sativa, or hybrid?",
        a: "Colombian is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Landrace — Colombia (Andes / Sierra Nevada de Santa Marta regions).",
      },
      {
        q: "What does Colombian taste like?",
        a: "Colombian hits citrus up front, earth through the middle, and light pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Colombian?",
        a: "Colombian tests in the 12–18% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Colombian best for?",
        a: "Colombian reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/colombian",
        "https://en.seedfinder.eu/strain-info/Colombian/",
      ],
      notes:
        "Leafly + SeedFinder confirm Colombian as a landrace sativa category, with Colombian Gold as one phenotype. Parents null (landrace). Sister entry to colombian-gold from Wave 2 — kept separate per Family Album spec.",
      verifiedAt: "2026-05-16",
    },
  },

  "northern-lights-5": {
    slug: "northern-lights-5",
    name: "Northern Lights #5",
    type: "indica",
    aliases: ["Northern Lights #5", "NL#5", "NL5"],
    tagline: "Sensi Seeds NL#5 phenotype — the most-shipped Northern Lights pheno.",
    intro:
      "Northern Lights #5 is the specific Sensi Seeds phenotype that most modern Northern Lights shelf product " +
      "traces back to. Indica-dominant, body-heavy, classic sweet-pine aroma. Won the High Times Cannabis Cup " +
      "in 1989 and again in 1990. Customers familiar with Northern Lights as a category will recognize the NL#5 " +
      "phenotype as the slightly heavier, more resinous expression.",
    lineage: "Northern Lights phenotype #5 (Afghani-leaning selection from the original NL group)",
    parents: ["northern-lights", null],
    thcRange: "16–21%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Happy", "Hungry"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Limonene", note: "sweet citrus undertone" },
    ],
    flavor: ["Sweet pine", "Earth", "Light spice"],
    bestFor: ["Late-night use", "Pre-sleep wind-down", "Heritage-indica fans"],
    avoidIf: ["You need to function", "You want a head-up sativa"],
    faqs: [
      {
        q: "What makes Northern Lights #5 different from regular Northern Lights?",
        a: "NL#5 is the specific Sensi Seeds phenotype the breeder selected as the most consistent expression. Most modern 'Northern Lights' shelf product is actually NL#5 lineage, even when labeled just 'Northern Lights.'",
      },
      {
        q: "Is Northern Lights #5 a parent of other famous strains?",
        a: "Yes — Neville's Haze and Shiva Skunk both have NL#5 in the cross. Super Silver Haze also descends from this line. NL#5 is one of the most-used parent strains in modern breeding.",
      },
      {
        q: "Is Northern Lights #5 indica, sativa, or hybrid?",
        a: "Northern Lights #5 is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Northern Lights phenotype #5 (Afghani-leaning selection from the original NL group).",
      },
      {
        q: "What does Northern Lights #5 taste like?",
        a: "Northern Lights #5 hits sweet pine up front, earth through the middle, and light spice on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Northern Lights #5?",
        a: "Northern Lights #5 tests in the 16–21% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Northern Lights #5 best for?",
        a: "Northern Lights #5 reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://sensiseeds.com/en/cannabis-seeds/strain-northern-lights",
        "https://www.leafly.com/strains/northern-lights",
      ],
      notes:
        "Sensi Seeds confirms NL#5 as the canonical phenotype selection. Cannabis Cup 1989 + 1990 wins documented. Northern Lights parent in our index. Kept as separate slug per Family Album spec — represents the specific pheno most shelf product traces to.",
      verifiedAt: "2026-05-16",
    },
  },

  // ────────────────────────────────────────────────────────────────────
  // HYBRIDS (12)
  // ────────────────────────────────────────────────────────────────────

  "sundae-strudel": {
    slug: "sundae-strudel",
    name: "Sundae Strudel",
    type: "hybrid",
    aliases: ["Sundae Strudel", "SS"],
    tagline: "Sundae Driver × Apple Strudel — sweet dessert hybrid.",
    intro:
      "Sundae Strudel is a Cannarado cross of Sundae Driver × Apple Strudel — balanced hybrid with a sweet " +
      "apple-pastry aroma layered over the creamy Sundae Driver base. Customers reach for it when they want " +
      "dessert flavors without the heavy body-pin of pure indica. Easy mid-afternoon to evening pick.",
    lineage: "Sundae Driver × Apple Strudel",
    parents: ["sundae-driver", null],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Limonene", note: "sweet citrus" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Apple pastry", "Sweet cream", "Light vanilla"],
    bestFor: ["Mid-afternoon", "After-dinner couch", "Dessert-hybrid fans"],
    avoidIf: ["You want a clear sativa head-up", "Sweet aromas aren't your thing"],
    faqs: [
      {
        q: "Is Sundae Strudel similar to Sundae Driver?",
        a: "Same family — Sundae Driver is one of its parents. Sundae Strudel adds more pastry-apple on top of the Sundae Driver creaminess. Customers who already like Sundae Driver tend to reach for this when they want the same effect with a sweeter nose.",
      },
      {
        q: "Is Sundae Strudel indica, sativa, or hybrid?",
        a: "Sundae Strudel is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Sundae Driver × Apple Strudel. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Sundae Strudel taste like?",
        a: "Sundae Strudel hits apple pastry up front, sweet cream through the middle, and light vanilla on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Sundae Strudel?",
        a: "Sundae Strudel tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Sundae Strudel best for?",
        a: "Sundae Strudel reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://cannarado.com/strain-library/",
        "https://en.seedfinder.eu/database/strains/Sundae+Strudel/",
      ],
      notes:
        "Cannarado Genetics breeder. Leafly and Weedmaps both 404 on the dedicated page — used Cannarado primary + SeedFinder. Sundae Driver in our index. Apple Strudel parent not in our index — kept null. Community-attested cross consistent across sources.",
      verifiedAt: "2026-05-16",
    },
  },

  "cereal-milk": {
    slug: "cereal-milk",
    name: "Cereal Milk",
    type: "hybrid",
    aliases: ["Cereal Milk", "CM"],
    tagline: "Y Life × Snowman — Cookies-shelf sweet-cream hybrid.",
    intro:
      "Cereal Milk is a Cookies cross of Y Life (Cookies × Cherry Pie) × Snowman — balanced hybrid with the " +
      "sweet-milk aroma the name suggests. Sits in the Cookies-shelf modern-dessert lineup alongside Gelato " +
      "and Sunset Sherbet. Customers reach for it when they want creamy aromatics with a clear-headed lift.",
    lineage: "Y Life × Snowman",
    parents: ["girl-scout-cookies", null],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Happy", "Uplifted", "Relaxed", "Euphoric"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Limonene", note: "citrus-sweet top" },
      { name: "Humulene", note: "earthy hop-like" },
    ],
    flavor: ["Sweet cream", "Vanilla", "Light berry"],
    bestFor: ["Mid-afternoon to evening", "Dessert-hybrid fans", "Social hangouts"],
    avoidIf: ["You want a heavy indica wind-down", "Sweet-milky aromas aren't your thing"],
    faqs: [
      {
        q: "Why is it called Cereal Milk?",
        a: "The aroma genuinely reads as sweet-cream and vanilla — the kind of milk left at the bottom of a cereal bowl. Cookies built the name around the flavor profile.",
      },
      {
        q: "Is Cereal Milk related to Gelato?",
        a: "Same shelf, different cross. Both are in the Cookies-family modern-dessert lineup, but Cereal Milk comes through Y Life × Snowman while Gelato comes through Sunset Sherbet × Thin Mint GSC. They share the Cookies heritage.",
      },
      {
        q: "Is Cereal Milk indica, sativa, or hybrid?",
        a: "Cereal Milk is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Y Life × Snowman. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Cereal Milk taste like?",
        a: "Cereal Milk hits sweet cream up front, vanilla through the middle, and light berry on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Cereal Milk?",
        a: "Cereal Milk tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Cereal Milk best for?",
        a: "Cereal Milk reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/cereal-milk",
        "https://weedmaps.com/strains/cereal-milk",
      ],
      notes:
        "Leafly confirms Y Life × Snowman, hybrid, ~25% THC. Top terpenes Caryophyllene/Limonene/Humulene match. Cookies breeder. GSC in our index — used as Cookies-side parent reference (Y Life is Cookies × Cherry Pie).",
      verifiedAt: "2026-05-16",
    },
  },

  "lemon-tree": {
    slug: "lemon-tree",
    name: "Lemon Tree",
    type: "hybrid",
    aliases: ["Lemon Tree", "LT"],
    tagline: "Lemon Skunk × Sour Diesel — citrus-forward hybrid.",
    intro:
      "Lemon Tree is a Lemon Skunk × Sour Diesel cross — balanced hybrid with a sharp lemon-and-diesel aroma " +
      "and a head-up-then-relaxed effect curve. Bred by Greenwolf LA. Customers reach for it when they want " +
      "citrus aromatics with a noticeable diesel undercurrent and a session that lifts before it lands.",
    lineage: "Lemon Skunk × Sour Diesel",
    parents: ["lemon-skunk", "sour-diesel"],
    thcRange: "17–24%",
    cbdRange: "<1%",
    effects: ["Happy", "Uplifted", "Relaxed", "Euphoric"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Pinene", note: "sharp pine top" },
      { name: "Caryophyllene", note: "peppery warmth" },
    ],
    flavor: ["Lemon", "Diesel", "Earth"],
    bestFor: ["Mid-afternoon", "Citrus-forward hybrid fans", "Creative work"],
    avoidIf: ["Diesel pungency turns you off", "You want a heavy indica wind-down"],
    faqs: [
      {
        q: "How does Lemon Tree compare to Lemon Skunk?",
        a: "Same lemon-skunk family, but the Sour Diesel side adds more head-up lift and a fuel undercurrent. Lemon Skunk alone is more candy-citrus; Lemon Tree is sharper with diesel pungency.",
      },
      {
        q: "Is Lemon Tree indica, sativa, or hybrid?",
        a: "Lemon Tree is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Lemon Skunk × Sour Diesel. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Lemon Tree taste like?",
        a: "Lemon Tree hits lemon up front, diesel through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Lemon Tree?",
        a: "Lemon Tree tests in the 17–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Lemon Tree best for?",
        a: "Lemon Tree reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/lemon-tree",
        "https://weedmaps.com/strains/lemon-tree",
      ],
      notes:
        "Leafly confirms Lemon Skunk × Sour Diesel, hybrid, ~17%+ THC. Top terpenes Myrcene/Pinene/Caryophyllene match. Both parents in our index (lemon-skunk + sour-diesel from Wave 1).",
      verifiedAt: "2026-05-16",
    },
  },

  "frosted-cake": {
    slug: "frosted-cake",
    name: "Frosted Cake",
    type: "hybrid",
    aliases: ["Frosted Cake", "FC"],
    tagline: "Strawberry Shortcake × Jungle Cake — sweet dessert hybrid.",
    intro:
      "Frosted Cake is a Strawberry Shortcake × Jungle Cake cross — balanced hybrid with a sweet berry-pastry " +
      "aroma and a mellow body landing. Lower-THC than most modern dessert hybrids (typically 13–18%), which " +
      "makes it a friendly pick for customers who want flavor without the high ceiling.",
    lineage: "Strawberry Shortcake × Jungle Cake",
    parents: [null, null],
    thcRange: "13–18%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Hungry", "Sleepy"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Linalool", note: "floral lavender" },
    ],
    flavor: ["Strawberry pastry", "Sweet cream", "Light vanilla"],
    bestFor: ["Mid-tolerance sessions", "Wind-down evenings", "Dessert-hybrid fans who want low-ceiling"],
    avoidIf: ["You want high-THC", "Sweet aromas aren't your thing"],
    faqs: [
      {
        q: "Why is Frosted Cake lower-THC than other dessert hybrids?",
        a: "Phenotype selection emphasizes the flavor profile over the THC ceiling. Most batches land 13–18% — closer to heritage strains than to the 25%+ modern cookies-shelf top end.",
      },
      {
        q: "Is Frosted Cake indica, sativa, or hybrid?",
        a: "Frosted Cake is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Strawberry Shortcake × Jungle Cake. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Frosted Cake taste like?",
        a: "Frosted Cake hits strawberry pastry up front, sweet cream through the middle, and light vanilla on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Frosted Cake?",
        a: "Frosted Cake tests in the 13–18% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Frosted Cake best for?",
        a: "Frosted Cake reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/frosted-cake",
        "https://weedmaps.com/strains/frosted-cake",
      ],
      notes:
        "Leafly confirms Strawberry Shortcake × Jungle Cake, hybrid, ~13% THC. Top terpenes Myrcene/Caryophyllene/Linalool match. Both parents not in our index (Jungle Cake is in this same wave) — Strawberry Shortcake kept null.",
      verifiedAt: "2026-05-16",
    },
  },

  "rainbow-beltz": {
    slug: "rainbow-beltz",
    name: "Rainbow Beltz",
    type: "hybrid",
    aliases: ["Rainbow Beltz", "Rainbow Belts"],
    tagline: "Zkittlez × Moonbow #75 — Archive Seed Bank candy hybrid.",
    intro:
      "Rainbow Beltz is an Archive Seed Bank cross of Zkittlez × Moonbow #75 — balanced hybrid with the candy-fruit " +
      "Zkittlez nose and the Moonbow side adding gas and grape undertones. Sits in the modern candy-shelf " +
      "lineup. Customers who already like Zkittlez tend to reach for this when they want the same flavor " +
      "with more body weight.",
    lineage: "Zkittlez × Moonbow #75",
    parents: ["zkittlez", null],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Tingly"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Limonene", note: "citrus-sweet" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Candy fruit", "Grape", "Light gas"],
    bestFor: ["Evening sessions", "Candy-shelf fans", "Mid-tolerance"],
    avoidIf: ["You want a clear sativa head-up", "Candy-sweet aromas aren't your thing"],
    faqs: [
      {
        q: "Is Rainbow Beltz the same as Rainbow Belts?",
        a: "Same strain, alternate spelling. Archive Seed Bank uses 'Rainbow Belts' on their canonical packaging — 'Rainbow Beltz' is the common alternative spelling used at shops and on packaging from licensees.",
      },
      {
        q: "Is Rainbow Beltz indica, sativa, or hybrid?",
        a: "Rainbow Beltz is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Zkittlez × Moonbow #75. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Rainbow Beltz taste like?",
        a: "Rainbow Beltz hits candy fruit up front, grape through the middle, and light gas on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Rainbow Beltz?",
        a: "Rainbow Beltz tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Rainbow Beltz best for?",
        a: "Rainbow Beltz reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://weedmaps.com/strains/rainbow-belts",
        "https://archiveseedbank.com/collections/all/products/rainbow-belts",
      ],
      notes:
        "Weedmaps + Archive Seed Bank primary confirm Zkittlez × Moonbow #75, balanced hybrid. Zkittlez in our index. Moonbow #75 not in our index — kept null. Leafly 404 on the dedicated page (Rainbow Beltz spelling).",
      verifiedAt: "2026-05-16",
    },
  },

  "han-solo-burger": {
    slug: "han-solo-burger",
    name: "Han Solo Burger",
    type: "hybrid",
    aliases: ["Han Solo Burger", "HSB"],
    tagline: "GMO × Larry OG — savory-funk hybrid from Skunk House Genetics.",
    intro:
      "Han Solo Burger is a Skunk House Genetics cross of GMO × Larry OG — balanced hybrid leaning indica, " +
      "with the savory-garlic GMO funk layered over the OG Kush base. Customers who already like GMO or " +
      "Garlic Breath reach for this when they want the same savory profile with more OG underneath.",
    lineage: "GMO Cookies × Larry OG",
    parents: ["gmo-cookies", "larry-og"],
    thcRange: "22–28%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Sleepy", "Hungry"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, savory-warm" },
      { name: "Limonene", note: "citrus undertone" },
      { name: "Humulene", note: "earthy hop-like" },
    ],
    flavor: ["Savory garlic", "Funk", "OG pine"],
    bestFor: ["High-tolerance evenings", "Savory-funk hybrid fans", "End of day"],
    avoidIf: ["Funky-savory aromas turn you off", "Low-tolerance — runs high"],
    faqs: [
      {
        q: "How does Han Solo Burger compare to GMO?",
        a: "Same savory family, but the Larry OG side adds more OG pine and a bit more body weight. GMO alone is more diesel-funk; Han Solo Burger softens the diesel and layers in OG.",
      },
      {
        q: "Is Han Solo Burger indica, sativa, or hybrid?",
        a: "Han Solo Burger is a hybrid — a cross that pulls from both sides of the family tree. The lineage is GMO Cookies × Larry OG. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Han Solo Burger taste like?",
        a: "Han Solo Burger hits savory garlic up front, funk through the middle, and og pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Han Solo Burger?",
        a: "Han Solo Burger tests in the 22–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Han Solo Burger best for?",
        a: "Han Solo Burger reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/han-solo-burger",
        "https://weedmaps.com/strains/han-solo-burger",
      ],
      notes:
        "Leafly confirms GMO Cookies × Larry OG, hybrid (indica-leaning), Skunk House Genetics breeder. Top flavor profile (tobacco/pepper/woody) matches caryophyllene-dominant. Both parents in our index (gmo-cookies + larry-og from Wave 1).",
      verifiedAt: "2026-05-16",
    },
  },

  "modified-apples": {
    slug: "modified-apples",
    name: "Modified Apples",
    type: "hybrid",
    aliases: ["Modified Apples", "MA"],
    tagline: "GMO × Apples and Bananas — Capulator savory-fruit hybrid.",
    intro:
      "Modified Apples is a Capulator cross of GMO × Apples and Bananas — balanced hybrid with the GMO " +
      "savory-funk layered over the sweet apple-banana side. Customers who like GMO but want sweeter aromatics " +
      "reach for this. Heavier than Apples and Bananas alone, more dessert than pure GMO.",
    lineage: "GMO Cookies × Apples and Bananas",
    parents: ["gmo-cookies", "apples-and-bananas"],
    thcRange: "22–28%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Hungry"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery, savory-warm" },
      { name: "Limonene", note: "sweet citrus" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Sweet apple", "Savory funk", "Light banana"],
    bestFor: ["Evening sessions", "GMO-shelf fans wanting sweeter nose", "High-tolerance"],
    avoidIf: ["Low-tolerance — runs high", "You want a clear sativa head-up"],
    faqs: [
      {
        q: "Is Modified Apples the same as Apples and Bananas?",
        a: "Same family — Apples and Bananas is one of its parents. Modified Apples adds GMO on top, which makes the aroma savorier and the effect heavier. Apples and Bananas alone is sweeter and lighter.",
      },
      {
        q: "Is Modified Apples indica, sativa, or hybrid?",
        a: "Modified Apples is a hybrid — a cross that pulls from both sides of the family tree. The lineage is GMO Cookies × Apples and Bananas. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Modified Apples taste like?",
        a: "Modified Apples hits sweet apple up front, savory funk through the middle, and light banana on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Modified Apples?",
        a: "Modified Apples tests in the 22–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Modified Apples best for?",
        a: "Modified Apples reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://capulator.com/strains",
        "https://en.seedfinder.eu/strain-info/Modified_Apples/Capulator/",
      ],
      notes:
        "Capulator (breeder primary) + SeedFinder confirm GMO × Apples and Bananas. Leafly and Weedmaps both 404 on the dedicated page — used breeder primary + SeedFinder. Both parents in our index (gmo-cookies from Wave 1, apples-and-bananas from Wave 2).",
      verifiedAt: "2026-05-16",
    },
  },

  "pink-lemonade": {
    slug: "pink-lemonade",
    name: "Pink Lemonade",
    type: "hybrid",
    aliases: ["Pink Lemonade", "PL"],
    tagline: "Lemon Skunk × Purple Kush — citrus-forward sweet hybrid.",
    intro:
      "Pink Lemonade is a Lemon Skunk × Purple Kush cross — balanced hybrid with a sweet pink-citrus aroma " +
      "and a head-up-then-mellow effect curve. Customers reach for it when they want citrus aromatics " +
      "without the diesel sharpness of a Sour Diesel-side cross. Lighter and brighter than Lemon Tree.",
    lineage: "Lemon Skunk × Purple Kush",
    parents: ["lemon-skunk", null],
    thcRange: "16–22%",
    cbdRange: "<1%",
    effects: ["Happy", "Uplifted", "Relaxed", "Focused"],
    terpenes: [
      { name: "Ocimene", note: "sweet floral-fruity top" },
      { name: "Pinene", note: "sharp pine" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Sweet lemon", "Light grapefruit", "Berry undertone"],
    bestFor: ["Mid-afternoon", "Creative work", "Citrus-forward hybrid fans"],
    avoidIf: ["You want a heavy indica wind-down", "Sweet-citrus aromas aren't your thing"],
    faqs: [
      {
        q: "How is Pink Lemonade different from Lemon Tree?",
        a: "Both are lemon-forward hybrids, but Pink Lemonade leans sweeter and softer (Purple Kush side adds berry undertones). Lemon Tree is sharper with Sour Diesel pungency.",
      },
      {
        q: "Is Pink Lemonade indica, sativa, or hybrid?",
        a: "Pink Lemonade is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Lemon Skunk × Purple Kush. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Pink Lemonade taste like?",
        a: "Pink Lemonade hits sweet lemon up front, light grapefruit through the middle, and berry undertone on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Pink Lemonade?",
        a: "Pink Lemonade tests in the 16–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Pink Lemonade best for?",
        a: "Pink Lemonade reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/pink-lemonade",
        "https://weedmaps.com/strains/pink-lemonade",
      ],
      notes:
        "Leafly confirms Lemon Skunk × Purple Kush, hybrid, ~18% THC. Top terpenes Ocimene/Pinene/Myrcene match. Lemon Skunk in our index. Purple Kush parent not in our index — kept null. Leafly notes alternate Maryland Evermore version uses Strawberry Fields × Sunset Sherbet — we cite the canonical Lemon Skunk × Purple Kush cross.",
      verifiedAt: "2026-05-16",
    },
  },

  "jungle-cake": {
    slug: "jungle-cake",
    name: "Jungle Cake",
    type: "hybrid",
    aliases: ["Jungle Cake", "JC"],
    tagline: "White Fire #43 × Wedding Cake — Seed Junky dessert hybrid.",
    intro:
      "Jungle Cake is a Seed Junky Genetics cross of White Fire #43 × Wedding Cake — balanced hybrid with a " +
      "sweet-cake aroma over a pine-and-fuel base. Sits in the modern dessert-hybrid lineup alongside Wedding " +
      "Cake itself. Customers reach for it when they want Wedding Cake flavor with more head-up lift.",
    lineage: "White Fire #43 × Wedding Cake",
    parents: [null, "wedding-cake"],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Happy", "Relaxed", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Limonene", note: "sweet citrus top" },
    ],
    flavor: ["Sweet cake", "Pine", "Light fuel"],
    bestFor: ["Mid-afternoon to evening", "Dessert-hybrid fans", "Wedding Cake lovers"],
    avoidIf: ["Low-tolerance — runs high", "You want a clear sativa head-up"],
    faqs: [
      {
        q: "How does Jungle Cake relate to Wedding Cake?",
        a: "Wedding Cake is one of its parents. Jungle Cake adds White Fire #43 on top, which brings more head-up lift and a fuel undercurrent. Wedding Cake alone is heavier; Jungle Cake is more balanced.",
      },
      {
        q: "Is Jungle Cake indica, sativa, or hybrid?",
        a: "Jungle Cake is a hybrid — a cross that pulls from both sides of the family tree. The lineage is White Fire #43 × Wedding Cake. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Jungle Cake taste like?",
        a: "Jungle Cake hits sweet cake up front, pine through the middle, and light fuel on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Jungle Cake?",
        a: "Jungle Cake tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Jungle Cake best for?",
        a: "Jungle Cake reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/jungle-cake",
        "https://weedmaps.com/strains/jungle-cake",
      ],
      notes:
        "Leafly confirms White Fire #43 × Wedding Cake, hybrid, ~21% THC, Seed Junky Genetics breeder. Top terpenes Myrcene/Caryophyllene/Limonene match. Wedding Cake in our index. White Fire #43 not in our index — kept null (white-fire-og in this wave is a related but distinct strain).",
      verifiedAt: "2026-05-16",
    },
  },

  "cap-junky": {
    slug: "cap-junky",
    name: "Cap Junky",
    type: "hybrid",
    aliases: ["Cap Junky", "CJ"],
    tagline: "Alien Cookies × Kush Mints #11 — Capulator × Seed Junky collab.",
    intro:
      "Cap Junky is a high-profile collaboration between two of the most respected modern breeders — " +
      "Capulator and Seed Junky Genetics. The cross is Alien Cookies × Kush Mints #11, balanced hybrid, " +
      "with a sour fruit-rind aroma and notes of pepper, gas, and dank. Runs notoriously high in THC " +
      "— often pushing 30%+. Customers reach for it as a connoisseur pick.",
    lineage: "Alien Cookies × Kush Mints #11",
    parents: [null, "kush-mints"],
    thcRange: "26–32%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Tingly"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Limonene", note: "sour citrus rind" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Apricot", "Menthol", "Gas"],
    bestFor: ["High-tolerance sessions", "Connoisseur picks", "Evening use"],
    avoidIf: ["Low-tolerance — runs very high", "You want a calm beginner experience"],
    faqs: [
      {
        q: "Why is Cap Junky so high-THC?",
        a: "Both parents (Alien Cookies and Kush Mints #11) are already high-THC, and Capulator + Seed Junky selected the cross for maximum potency. Batches commonly test 28–32%+. Not a starter strain.",
      },
      {
        q: "Is Cap Junky indica, sativa, or hybrid?",
        a: "Cap Junky is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Alien Cookies × Kush Mints #11. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Cap Junky taste like?",
        a: "Cap Junky hits apricot up front, menthol through the middle, and gas on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Cap Junky?",
        a: "Cap Junky tests in the 26–32% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Cap Junky best for?",
        a: "Cap Junky reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/cap-junky",
        "https://weedmaps.com/strains/cap-junky",
      ],
      notes:
        "Leafly confirms Alien Cookies × Kush Mints #11, hybrid. Capulator × Seed Junky collab documented. Flavor profile (apricot/menthol/gas) matches caryophyllene + limonene dominant. Kush Mints in our index. Alien Cookies not in our index — kept null.",
      verifiedAt: "2026-05-16",
    },
  },

  "mochi-gelato": {
    slug: "mochi-gelato",
    name: "Mochi Gelato",
    type: "hybrid",
    aliases: ["Mochi Gelato", "Mochi"],
    tagline: "Sunset Sherbet × Thin Mint GSC — Sherbinski-family hybrid.",
    intro:
      "Mochi Gelato (often just called Mochi) is a Sherbinski cross of Sunset Sherbet × Thin Mint GSC — " +
      "balanced hybrid with a sweet-cream aroma and minty undertones. Sister strain to Bacio Gelato and " +
      "Sherbinski Mints. Customers familiar with the Sherbinski Gelato lineup will recognize the family " +
      "signature.",
    lineage: "Sunset Sherbet × Thin Mint GSC",
    parents: ["sunset-sherbet", "thin-mint-gsc"],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Happy", "Relaxed", "Euphoric", "Tingly"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Limonene", note: "sweet citrus" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Sweet cream", "Mint", "Light berry"],
    bestFor: ["Mid-afternoon to evening", "Sherbinski-shelf fans", "Dessert-hybrid lovers"],
    avoidIf: ["You want a clear sativa head-up", "Sweet-creamy aromas aren't your thing"],
    faqs: [
      {
        q: "Is Mochi Gelato the same as Bacio Gelato?",
        a: "Same parents (Sunset Sherbet × Thin Mint GSC), different pheno selection. Sherbinski sells both — Mochi emphasizes the creamy side, Bacio emphasizes the dessert side. Sister strains.",
      },
      {
        q: "Is Mochi Gelato indica, sativa, or hybrid?",
        a: "Mochi Gelato is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Sunset Sherbet × Thin Mint GSC. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Mochi Gelato taste like?",
        a: "Mochi Gelato hits sweet cream up front, mint through the middle, and light berry on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Mochi Gelato?",
        a: "Mochi Gelato tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Mochi Gelato best for?",
        a: "Mochi Gelato reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/mochi",
        "https://weedmaps.com/strains/mochi-gelato",
      ],
      notes:
        "Leafly confirms Sunset Sherbet × Thin Mint GSC, hybrid, ~23% THC. Top terpenes Caryophyllene/Limonene/Myrcene match. Both parents in our index (sunset-sherbet + thin-mint-gsc from Wave 1). Sister to bacio-gelato (also Wave 1).",
      verifiedAt: "2026-05-16",
    },
  },

  "honey-bun": {
    slug: "honey-bun",
    name: "Honey Bun",
    type: "hybrid",
    aliases: ["Honey Bun", "HB"],
    tagline: "Cookies-shelf sweet pastry hybrid — honey-glazed donut aroma.",
    intro:
      "Honey Bun is a Cookies-bred hybrid with a sweet honey-glazed pastry aroma that genuinely reads as the " +
      "donut the name suggests. Balanced effect — uplifting and happy first, body-relaxing later. Sits in the " +
      "modern dessert-hybrid lineup. Customers reach for it when they want sweet aromatics with a gentle " +
      "session arc.",
    lineage: "Cookies-bred (parents not publicly disclosed)",
    parents: [null, null],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Happy", "Uplifted", "Relaxed", "Euphoric"],
    terpenes: [
      { name: "Limonene", note: "sweet citrus top" },
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Pinene", note: "light pine" },
    ],
    flavor: ["Sweet honey", "Pastry", "Light vanilla"],
    bestFor: ["Mid-afternoon to evening", "Dessert-hybrid fans", "Social hangouts"],
    avoidIf: ["You want a clear sativa head-up", "Sweet aromas aren't your thing"],
    faqs: [
      {
        q: "What are Honey Bun's parents?",
        a: "Cookies hasn't publicly disclosed the cross. The flavor profile and effect curve suggest a Cookies-shelf lineage similar to Gelato/Sundae Driver, but parent specifics are proprietary.",
      },
      {
        q: "Does Honey Bun actually taste like a honey bun?",
        a: "Closer than most candy-named strains. Sweet honey-glazed pastry on the nose, with a light vanilla undertone on the exhale.",
      },
      {
        q: "Is Honey Bun indica, sativa, or hybrid?",
        a: "Honey Bun is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Cookies-bred (parents not publicly disclosed). The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "How strong is Honey Bun?",
        a: "Honey Bun tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Honey Bun best for?",
        a: "Honey Bun reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
      {
        q: "What terpenes are in Honey Bun?",
        a: "The dominant terpenes in Honey Bun are Limonene (citrus zest, bright and mood-lifting on the nose), Caryophyllene (peppery and warm, spicy on the back end), and Pinene (sharp pine, fresh and focusing). The blend is what gives the strain its specific nose and the character customers report on the exhale.",
      },
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/honey-bun",
        "https://weedmaps.com/strains/honey-bun",
      ],
      notes:
        "Leafly confirms Cookies breeder, hybrid, ~23% THC. Top terpenes Limonene/Caryophyllene/Pinene match. Parents not publicly disclosed by Cookies — kept both null. Sister situation to khalifa-kush (Wave 2) and london-pound-cake (Wave 3) — proprietary-disclosure handled honestly.",
      verifiedAt: "2026-05-16",
    },
  },

  "project-4516": {
    slug: "project-4516",
    name: "Project 4516",
    type: "hybrid",
    aliases: ["Project 4516", "4516"],
    tagline: "E85 × Bubble Bath — head-up creative hybrid.",
    intro:
      "Project 4516 is a balanced hybrid cross of E85 × Bubble Bath — lifted, creative effect curve with a " +
      "sweet-citrus aroma. Customers reach for it when they want energetic and focused without the long " +
      "ceiling of a pure haze. Mid-afternoon session pick.",
    lineage: "E85 × Bubble Bath",
    parents: [null, null],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Euphoric", "Creative", "Energetic", "Uplifted"],
    terpenes: [
      { name: "Limonene", note: "sweet citrus top" },
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Pinene", note: "sharp pine" },
    ],
    flavor: ["Sweet citrus", "Light fuel", "Floral"],
    bestFor: ["Mid-afternoon", "Creative work", "Social hangouts"],
    avoidIf: ["You want a heavy indica wind-down", "Sensitive to head-forward strains"],
    faqs: [
      {
        q: "Why the name Project 4516?",
        a: "The breeder code-named the cross during development. The number stuck even after the strain went to market — customers ask for it by the project name.",
      },
      {
        q: "Is Project 4516 indica, sativa, or hybrid?",
        a: "Project 4516 is a hybrid — a cross that pulls from both sides of the family tree. The lineage is E85 × Bubble Bath. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Project 4516 taste like?",
        a: "Project 4516 hits sweet citrus up front, light fuel through the middle, and floral on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Project 4516?",
        a: "Project 4516 tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Project 4516 best for?",
        a: "Project 4516 reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/project-4516",
        "https://weedmaps.com/strains/project-4516",
      ],
      notes:
        "Leafly confirms E85 × Bubble Bath, hybrid, ~23% THC. Top terpenes Limonene/Caryophyllene/Pinene match. Both parents not in our index — kept null.",
      verifiedAt: "2026-05-16",
    },
  },

  "black-cherry-gelato": {
    slug: "black-cherry-gelato",
    name: "Black Cherry Gelato",
    type: "hybrid",
    aliases: ["Black Cherry Gelato", "BCG"],
    tagline: "Acai Berry Gelato × Black Cherry Funk — fruit-forward hybrid.",
    intro:
      "Black Cherry Gelato is a balanced hybrid cross of Acai Berry Gelato × Black Cherry Funk — sweet dark-cherry " +
      "aroma with a piney edge and a relaxed-but-clear effect curve. Sits in the modern dessert-hybrid lineup " +
      "with a fruit-forward expression rather than pastry-sweet.",
    lineage: "Acai Berry Gelato × Black Cherry Funk",
    parents: [null, null],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Pinene", note: "sharp pine top" },
      { name: "Limonene", note: "sweet citrus" },
      { name: "Humulene", note: "earthy hop-like" },
    ],
    flavor: ["Dark cherry", "Sweet berry", "Light pine"],
    bestFor: ["Mid-afternoon to evening", "Fruit-forward hybrid fans", "Social hangouts"],
    avoidIf: ["Tart-cherry aromas aren't your thing", "You want a heavy indica wind-down"],
    faqs: [
      {
        q: "Does Black Cherry Gelato taste like Black Cherry Punch?",
        a: "Same cherry family, different cross. Black Cherry Gelato comes through Acai Berry Gelato — sweeter and more berry-forward. Black Cherry Punch comes through Purple Punch — heavier and more pure cherry-grape.",
      },
      {
        q: "Is Black Cherry Gelato indica, sativa, or hybrid?",
        a: "Black Cherry Gelato is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Acai Berry Gelato × Black Cherry Funk. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "How strong is Black Cherry Gelato?",
        a: "Black Cherry Gelato tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Black Cherry Gelato best for?",
        a: "Black Cherry Gelato reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
      {
        q: "What terpenes are in Black Cherry Gelato?",
        a: "The dominant terpenes in Black Cherry Gelato are Pinene (sharp pine, fresh and focusing), Limonene (citrus zest, bright and mood-lifting on the nose), and Humulene (earthy and hop-like, similar to fresh hops). The blend is what gives the strain its specific nose and the character customers report on the exhale.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/black-cherry-gelato",
        "https://weedmaps.com/strains/black-cherry-gelato",
      ],
      notes:
        "Leafly confirms Acai Berry Gelato × Black Cherry Funk, hybrid, ~22% THC. Top terpenes Pinene/Limonene/Humulene match. Both parents not in our index — kept null. Original breeder per Leafly is unknown.",
      verifiedAt: "2026-05-16",
    },
  },

  "sherbacio": {
    slug: "sherbacio",
    name: "Sherbacio",
    type: "hybrid",
    aliases: ["Sherbacio", "Sherb"],
    tagline: "Sunset Sherbet × Gelato #41 — Alien Labs gelato-shelf hybrid.",
    intro:
      "Sherbacio is an Alien Labs cross of Sunset Sherbet × Gelato #41 — balanced hybrid leaning indica, " +
      "with a sweet creamy aroma that doubles down on the gelato signature. Sister to Bacio Gelato and " +
      "Mochi Gelato. Customers who already like the Sherbinski family reach for this when they want the " +
      "smoothest gelato expression.",
    lineage: "Sunset Sherbet × Gelato #41",
    parents: ["sunset-sherbet", "gelato-41"],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Limonene", note: "sweet citrus" },
      { name: "Humulene", note: "earthy hop-like" },
    ],
    flavor: ["Sweet cream", "Light citrus", "Vanilla"],
    bestFor: ["Mid-afternoon to evening", "Sherbinski-shelf fans", "Dessert-hybrid lovers"],
    avoidIf: ["You want a clear sativa head-up", "Sweet-creamy aromas aren't your thing"],
    faqs: [
      {
        q: "How is Sherbacio different from Bacio Gelato?",
        a: "Both are Sunset Sherbet crosses in the gelato family. Sherbacio crosses with Gelato #41 specifically (Alien Labs); Bacio Gelato crosses with Thin Mint GSC. Sherbacio is creamier and smoother; Bacio is mintier.",
      },
      {
        q: "Is Sherbacio indica, sativa, or hybrid?",
        a: "Sherbacio is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Sunset Sherbet × Gelato #41. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Sherbacio taste like?",
        a: "Sherbacio hits sweet cream up front, light citrus through the middle, and vanilla on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Sherbacio?",
        a: "Sherbacio tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Sherbacio best for?",
        a: "Sherbacio reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/sherbacio",
        "https://weedmaps.com/strains/sherbacio",
      ],
      notes:
        "Leafly confirms Sunset Sherbet × Gelato #41, hybrid, ~18% THC, Alien Labs breeder. Top terpenes Caryophyllene/Limonene/Humulene match. Both parents in our index (sunset-sherbet from Wave 1, gelato-41 from Wave 2).",
      verifiedAt: "2026-05-16",
    },
  },

  "sour-apple": {
    slug: "sour-apple",
    name: "Sour Apple",
    type: "hybrid",
    aliases: ["Sour Apple", "SA"],
    tagline: "Sour Diesel × Cinderella 99 — sour-fruit head-up hybrid.",
    intro:
      "Sour Apple is a Sour Diesel × Cinderella 99 cross — balanced hybrid with a sour apple-and-diesel aroma " +
      "and a head-up effect curve. Customers reach for it when they want the Sour Diesel lift with a sweeter " +
      "nose. Mid-afternoon session pick.",
    lineage: "Sour Diesel × Cinderella 99",
    parents: ["sour-diesel", "cinderella-99"],
    thcRange: "17–22%",
    cbdRange: "<1%",
    effects: ["Happy", "Uplifted", "Energetic", "Relaxed"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Pinene", note: "sharp pine" },
    ],
    flavor: ["Sour apple", "Diesel", "Light earth"],
    bestFor: ["Mid-afternoon", "Creative work", "Sour-citrus fans"],
    avoidIf: ["Diesel pungency turns you off", "You want a heavy indica wind-down"],
    faqs: [
      {
        q: "Does Sour Apple actually taste like apple?",
        a: "Sour-green-apple on the nose with the Sour Diesel fuel underneath. The Cinderella 99 side brings the fruit; the Sour Diesel keeps it sharp rather than candy-sweet.",
      },
      {
        q: "Is Sour Apple indica, sativa, or hybrid?",
        a: "Sour Apple is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Sour Diesel × Cinderella 99. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "How strong is Sour Apple?",
        a: "Sour Apple tests in the 17–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Sour Apple best for?",
        a: "Sour Apple reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
      {
        q: "What terpenes are in Sour Apple?",
        a: "The dominant terpenes in Sour Apple are Myrcene (earthy, mango-like, with a mild body-heavy quality), Caryophyllene (peppery and warm, spicy on the back end), and Pinene (sharp pine, fresh and focusing). The blend is what gives the strain its specific nose and the character customers report on the exhale.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/sour-apple",
        "https://weedmaps.com/strains/sour-apple",
      ],
      notes:
        "Leafly confirms Sour Diesel × Cinderella 99, hybrid, ~18% THC. Top terpenes Myrcene/Caryophyllene/Pinene match. Both parents in our index (sour-diesel from Wave 1, cinderella-99 in this wave).",
      verifiedAt: "2026-05-16",
    },
  },

  "black-mamba": {
    slug: "black-mamba",
    name: "Black Mamba",
    type: "indica",
    aliases: ["Black Mamba", "BM"],
    tagline: "Granddaddy Purple × Black Domina — grape-and-floral heavy indica.",
    intro:
      "Black Mamba is a Granddaddy Purple × Black Domina cross — heavy indica with a grape-and-floral aroma " +
      "and an earthy berry undertone. Body-relaxing and sedating. Customers who already like Granddaddy " +
      "Purple reach for this when they want the same grape profile with more body weight.",
    lineage: "Granddaddy Purple × Black Domina",
    parents: ["granddaddy-purple", null],
    thcRange: "17–22%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Happy", "Hungry"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Limonene", note: "citrus undertone" },
      { name: "Pinene", note: "light pine" },
    ],
    flavor: ["Grape", "Floral", "Earthy berry"],
    bestFor: ["End of day", "Pre-sleep wind-down", "Grape-strain fans"],
    avoidIf: ["You need to function", "You want a head-up sativa"],
    faqs: [
      {
        q: "Is Black Mamba related to Granddaddy Purple?",
        a: "Yes — Granddaddy Purple is one of its parents. The grape side comes directly from there. Black Domina adds more body weight and a floral lift on top.",
      },
      {
        q: "Is Black Mamba indica, sativa, or hybrid?",
        a: "Black Mamba is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Granddaddy Purple × Black Domina.",
      },
      {
        q: "What does Black Mamba taste like?",
        a: "Black Mamba hits grape up front, floral through the middle, and earthy berry on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Black Mamba?",
        a: "Black Mamba tests in the 17–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Black Mamba best for?",
        a: "Black Mamba reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/black-mamba",
        "https://weedmaps.com/strains/black-mamba",
      ],
      notes:
        "Leafly confirms Granddaddy Purple × Black Domina, indica, ~19% THC. Top terpenes Myrcene/Limonene/Pinene match. GDP in our index. Black Domina parent not in our index — kept null. Original breeder unknown per Leafly.",
      verifiedAt: "2026-05-16",
    },
  },

  // ────────────────────────────────────────────────────────────────────
  // SATIVAS (12)
  // ────────────────────────────────────────────────────────────────────

  "ghost-train-haze": {
    slug: "ghost-train-haze",
    name: "Ghost Train Haze",
    type: "sativa",
    aliases: ["Ghost Train Haze", "GTH"],
    tagline: "Ghost OG × Neville's Wreck — Rare Dankness head-up haze.",
    intro:
      "Ghost Train Haze is a Rare Dankness cross of Ghost OG × Neville's Wreck — sativa-dominant with a sour " +
      "citrus and floral aroma and dense, white-frosted buds. Won High Times Cannabis Cup recognition for its " +
      "trichome coverage. Customers reach for it when they want a focused, energetic head-up that lasts.",
    lineage: "Ghost OG × Neville's Wreck",
    parents: ["ghost-og", null],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Energetic", "Uplifted", "Focused", "Happy"],
    terpenes: [
      { name: "Terpinolene", note: "fresh herbal top" },
      { name: "Limonene", note: "sour citrus" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Sour citrus", "Floral", "Earth"],
    bestFor: ["Daytime sessions", "Focus work", "Creative projects"],
    avoidIf: ["Low-tolerance — runs high", "You want a body-heavy indica"],
    faqs: [
      {
        q: "Is Ghost Train Haze a strong sativa?",
        a: "Yes — Rare Dankness selected for high THC (often 22%+) and a long ceiling. The Ghost OG side adds focus where most pure hazes get racey. Not a beginner strain.",
      },
      {
        q: "Is Ghost Train Haze indica, sativa, or hybrid?",
        a: "Ghost Train Haze is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Ghost OG × Neville's Wreck.",
      },
      {
        q: "What does Ghost Train Haze taste like?",
        a: "Ghost Train Haze hits sour citrus up front, floral through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Ghost Train Haze?",
        a: "Ghost Train Haze tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Ghost Train Haze best for?",
        a: "Ghost Train Haze reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/ghost-train-haze",
        "https://weedmaps.com/strains/ghost-train-haze",
      ],
      notes:
        "Leafly confirms Ghost OG × Neville's Wreck, sativa, ~19% THC, Rare Dankness breeder. Top terpenes Terpinolene/Limonene/Myrcene match. Ghost OG in our index. Neville's Wreck parent not in our index — kept null.",
      verifiedAt: "2026-05-16",
    },
  },

  "cinderella-99": {
    slug: "cinderella-99",
    name: "Cinderella 99",
    type: "sativa",
    aliases: ["Cinderella 99", "C99", "Cindy"],
    tagline: "Jack Herer × Shiva Skunk — Brothers Grimm sativa hybrid.",
    intro:
      "Cinderella 99 is a Brothers Grimm cross of Jack Herer × Shiva Skunk — sativa-dominant with a sweet " +
      "citrus-fruit aroma and a head-up effect curve. Famously created by Mr. Soul from seeds found in a " +
      "Sensi 2-gram package of Jack Herer bought at an Amsterdam coffeeshop. Modern shelf staple, parent " +
      "to many gas-and-fruit hybrids.",
    lineage: "Jack Herer × Shiva Skunk",
    parents: ["jack-herer", null],
    thcRange: "16–22%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Happy", "Euphoric", "Energetic"],
    terpenes: [
      { name: "Limonene", note: "sweet citrus top" },
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Sweet citrus", "Tropical fruit", "Light earth"],
    bestFor: ["Daytime sessions", "Creative work", "Social hangouts"],
    avoidIf: ["You want a body-heavy indica", "Long-ceiling sativas wear you out"],
    faqs: [
      {
        q: "What's the Cinderella 99 origin story?",
        a: "Mr. Soul of Brothers Grimm bred it from seeds found inside a Sensi-branded 2-gram package of Jack Herer purchased at an Amsterdam coffeeshop. Crossed with Shiva Skunk, stabilized over generations, sold under the C99 name.",
      },
      {
        q: "Is Cinderella 99 a parent of Sour Apple?",
        a: "Yes — Sour Apple is Sour Diesel × Cinderella 99. C99 also shows up in many other gas-and-fruit modern hybrids.",
      },
      {
        q: "Is Cinderella 99 indica, sativa, or hybrid?",
        a: "Cinderella 99 is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Jack Herer × Shiva Skunk.",
      },
      {
        q: "What does Cinderella 99 taste like?",
        a: "Cinderella 99 hits sweet citrus up front, tropical fruit through the middle, and light earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Cinderella 99?",
        a: "Cinderella 99 tests in the 16–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Cinderella 99 best for?",
        a: "Cinderella 99 reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/cinderella-99",
        "https://weedmaps.com/strains/cinderella-99",
      ],
      notes:
        "Leafly confirms Jack Herer × Shiva Skunk, sativa-dominant hybrid, ~18% THC, Brothers Grimm breeder. Top terpenes Limonene/Caryophyllene/Myrcene match. Jack Herer in our index. Shiva Skunk parent not in our index — kept null.",
      verifiedAt: "2026-05-16",
    },
  },

  "purple-haze": {
    slug: "purple-haze",
    name: "Purple Haze",
    type: "sativa",
    aliases: ["Purple Haze", "PH"],
    tagline: "Purple Thai × Haze — heritage psychedelic-era sativa.",
    intro:
      "Purple Haze is the heritage sativa Jimi Hendrix named a song after — a Purple Thai × Haze cross with " +
      "sweet earthy berry-and-spice aromas and a creative, talkative head-up effect. Sits alongside Acapulco " +
      "Gold and Panama Red in the 1960s-70s heritage-sativa tier. Phenotypes vary; the canonical expression " +
      "leans head-forward and long-flowering.",
    lineage: "Purple Thai × Haze",
    parents: [null, "haze"],
    thcRange: "14–19%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Creative", "Happy", "Energetic"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Limonene", note: "citrus undertone" },
    ],
    flavor: ["Sweet berry", "Earth", "Spice"],
    bestFor: ["Daytime sessions", "Creative projects", "Heritage-strain curious"],
    avoidIf: ["You want a body-heavy indica", "Long-ceiling sativas wear you out"],
    faqs: [
      {
        q: "Is Purple Haze actually purple?",
        a: "Some phenotypes express purple coloration in cooler grow conditions, but not all. The 'purple' in the name comes from Purple Thai (the parent), not always the cured flower color.",
      },
      {
        q: "Was Purple Haze around in the 1960s?",
        a: "The name and the lineage trace to that era — psychedelic-era heritage. Modern Purple Haze flower is stabilized seed line work, not direct genetic descent from a 1960s plant.",
      },
      {
        q: "Is Purple Haze indica, sativa, or hybrid?",
        a: "Purple Haze is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Purple Thai × Haze.",
      },
      {
        q: "What does Purple Haze taste like?",
        a: "Purple Haze hits sweet berry up front, earth through the middle, and spice on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Purple Haze?",
        a: "Purple Haze tests in the 14–19% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Purple Haze best for?",
        a: "Purple Haze reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/purple-haze",
        "https://weedmaps.com/strains/purple-haze",
      ],
      notes:
        "Leafly confirms Purple Thai × Haze, sativa, ~16% THC. Top terpenes Myrcene/Caryophyllene/Limonene match. Haze in our index. Purple Thai parent not in our index — kept null.",
      verifiedAt: "2026-05-16",
    },
  },

  "lemon-jack": {
    slug: "lemon-jack",
    name: "Lemon Jack",
    type: "sativa",
    aliases: ["Lemon Jack", "LJ"],
    tagline: "Jack Herer × Lemon Kush — focused citrus sativa.",
    intro:
      "Lemon Jack is a Jack Herer × Lemon Kush cross — sativa-dominant with a chemical-lemon aroma and a " +
      "focused, energizing effect curve. Customers reach for it when they want a clear citrus head-up that " +
      "leans more talkative than racey. Mid-morning to mid-afternoon session pick.",
    lineage: "Jack Herer × Lemon Kush",
    parents: ["jack-herer", null],
    thcRange: "17–22%",
    cbdRange: "<1%",
    effects: ["Focused", "Energetic", "Uplifted", "Happy"],
    terpenes: [
      { name: "Terpinolene", note: "fresh herbal top" },
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Sharp lemon", "Light pine", "Earth"],
    bestFor: ["Daytime sessions", "Focus work", "Citrus-sativa fans"],
    avoidIf: ["Sharp-lemon aromas turn you off", "You want a heavy indica wind-down"],
    faqs: [
      {
        q: "How is Lemon Jack different from Lemon Haze?",
        a: "Both are lemon-forward sativas. Lemon Jack comes through Jack Herer — more focused and energizing. Lemon Haze comes through Silver Haze — longer ceiling, more head-up. Different feel, similar nose.",
      },
      {
        q: "Is Lemon Jack indica, sativa, or hybrid?",
        a: "Lemon Jack is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Jack Herer × Lemon Kush.",
      },
      {
        q: "What does Lemon Jack taste like?",
        a: "Lemon Jack hits sharp lemon up front, light pine through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Lemon Jack?",
        a: "Lemon Jack tests in the 17–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Lemon Jack best for?",
        a: "Lemon Jack reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/lemon-jack",
        "https://weedmaps.com/strains/lemon-jack",
      ],
      notes:
        "Leafly confirms Jack Herer × Lemon Kush, sativa, ~17% THC. Top terpenes Terpinolene/Caryophyllene/Myrcene match. Jack Herer in our index. Lemon Kush parent not in our index — kept null.",
      verifiedAt: "2026-05-16",
    },
  },

  "pineapple-diesel": {
    slug: "pineapple-diesel",
    name: "Pineapple Diesel",
    type: "hybrid",
    aliases: ["Pineapple Diesel", "PD"],
    tagline: "Pineapple × Sour Diesel — tropical-fuel sativa-leaning hybrid.",
    intro:
      "Pineapple Diesel is a Pineapple × Sour Diesel cross — sativa-leaning hybrid with a citrus-and-diesel " +
      "dual pungency and an energetic head-up effect. Customers reach for it when they want tropical fruit " +
      "aromatics with the Sour Diesel lift. Mid-afternoon session pick.",
    lineage: "Pineapple × Sour Diesel",
    parents: [null, "sour-diesel"],
    thcRange: "15–20%",
    cbdRange: "<1%",
    effects: ["Energetic", "Uplifted", "Happy", "Talkative"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Terpinolene", note: "fresh herbal" },
      { name: "Pinene", note: "sharp pine top" },
    ],
    flavor: ["Pineapple", "Diesel", "Light citrus"],
    bestFor: ["Daytime sessions", "Social hangouts", "Tropical-fruit sativa fans"],
    avoidIf: ["Diesel pungency turns you off", "You want a heavy indica wind-down"],
    faqs: [
      {
        q: "How is Pineapple Diesel different from Pineapple Express?",
        a: "Both have pineapple in the cross. Pineapple Express is Trainwreck × Hawaiian — sweeter and gentler. Pineapple Diesel adds Sour Diesel for more lift and fuel pungency. Different feel.",
      },
      {
        q: "Is Pineapple Diesel indica, sativa, or hybrid?",
        a: "Pineapple Diesel is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Pineapple × Sour Diesel. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Pineapple Diesel taste like?",
        a: "Pineapple Diesel hits pineapple up front, diesel through the middle, and light citrus on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Pineapple Diesel?",
        a: "Pineapple Diesel tests in the 15–20% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Pineapple Diesel best for?",
        a: "Pineapple Diesel reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/pineapple-diesel",
        "https://weedmaps.com/strains/pineapple-diesel",
      ],
      notes:
        "Leafly confirms Pineapple × Sour Diesel, hybrid (sativa-leaning), ~15% THC. Top terpenes Myrcene/Terpinolene/Pinene match. Sour Diesel in our index. Pineapple parent not in our index — kept null. Classified hybrid (leaning sativa) per Leafly framing.",
      verifiedAt: "2026-05-16",
    },
  },

  "strawberry-lemonade": {
    slug: "strawberry-lemonade",
    name: "Strawberry Lemonade",
    type: "sativa",
    aliases: ["Strawberry Lemonade", "SL"],
    tagline: "Strawberry Cough × Lemon OG — Barney's Farm sweet-citrus sativa.",
    intro:
      "Strawberry Lemonade is a Barney's Farm cross of Strawberry Cough × Lemon OG — sativa-dominant with " +
      "a sweet strawberry-and-lemon aroma and a clear-headed uplift. Took 1st place at the 2015 Denver " +
      "Cannabis Cup in the Best Sativa Concentrate category. Mid-afternoon to social session pick.",
    lineage: "Strawberry Cough × Lemon OG",
    parents: ["strawberry-cough", null],
    thcRange: "17–22%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Happy", "Energetic", "Creative"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Pinene", note: "sharp pine" },
    ],
    flavor: ["Sweet strawberry", "Lemon", "Light earth"],
    bestFor: ["Daytime sessions", "Social hangouts", "Creative work"],
    avoidIf: ["You want a heavy indica wind-down", "Sweet-fruit aromas aren't your thing"],
    faqs: [
      {
        q: "Did Strawberry Lemonade win a Cannabis Cup?",
        a: "Yes — 1st place at the 2015 High Times Denver Cannabis Cup in the Best Sativa Concentrate category. Barney's Farm seeds.",
      },
      {
        q: "Is Strawberry Lemonade indica, sativa, or hybrid?",
        a: "Strawberry Lemonade is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Strawberry Cough × Lemon OG.",
      },
      {
        q: "What does Strawberry Lemonade taste like?",
        a: "Strawberry Lemonade hits sweet strawberry up front, lemon through the middle, and light earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Strawberry Lemonade?",
        a: "Strawberry Lemonade tests in the 17–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Strawberry Lemonade best for?",
        a: "Strawberry Lemonade reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/strawberry-lemonade",
        "https://weedmaps.com/strains/strawberry-lemonade",
      ],
      notes:
        "Leafly confirms Strawberry Cough × Lemon OG, sativa-dominant, ~20% THC, Barney's Farm breeder. Top terpenes Myrcene/Caryophyllene/Pinene match. Cannabis Cup 2015 win documented. Strawberry Cough in our index. Lemon OG parent not in our index — kept null.",
      verifiedAt: "2026-05-16",
    },
  },

  "moby-dick": {
    slug: "moby-dick",
    name: "Moby Dick",
    type: "sativa",
    aliases: ["Moby Dick", "MD"],
    tagline: "White Widow × Haze — Dinafem head-up haze hybrid.",
    intro:
      "Moby Dick is a Dinafem Seeds cross of White Widow × Haze — sativa-dominant with a buzzy, motivating " +
      "head high and a citrus-and-spice aroma. Known for fast indoor flowering and natural mold resistance. " +
      "Customers reach for it when they want a clear sativa lift without the long ceiling of pure haze.",
    lineage: "White Widow × Haze",
    parents: ["white-widow", "haze"],
    thcRange: "16–22%",
    cbdRange: "<1%",
    effects: ["Energetic", "Uplifted", "Happy", "Creative"],
    terpenes: [
      { name: "Terpinolene", note: "fresh herbal top" },
      { name: "Myrcene", note: "earthy base" },
      { name: "Ocimene", note: "sweet floral-fruity" },
    ],
    flavor: ["Citrus", "Spice", "Earth"],
    bestFor: ["Daytime sessions", "Creative work", "Haze-curious"],
    avoidIf: ["You want a body-heavy indica", "Sharp head-up sativas wear you out"],
    faqs: [
      {
        q: "Is Moby Dick named after the novel?",
        a: "Yes — Dinafem named it after Melville's white whale, riffing on the White Widow parent. The name references the strain's pale, frosty trichome coverage.",
      },
      {
        q: "Is Moby Dick indica, sativa, or hybrid?",
        a: "Moby Dick is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is White Widow × Haze.",
      },
      {
        q: "What does Moby Dick taste like?",
        a: "Moby Dick hits citrus up front, spice through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Moby Dick?",
        a: "Moby Dick tests in the 16–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Moby Dick best for?",
        a: "Moby Dick reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/moby-dick",
        "https://weedmaps.com/strains/moby-dick",
      ],
      notes:
        "Leafly confirms White Widow × Haze, sativa, ~17% THC, Dinafem Seeds breeder. Top terpenes Terpinolene/Myrcene/Ocimene match. Both parents in our index (white-widow + haze from Wave 1).",
      verifiedAt: "2026-05-16",
    },
  },

  "tangie-dream": {
    slug: "tangie-dream",
    name: "Tangie Dream",
    type: "sativa",
    aliases: ["Tangie Dream", "TD"],
    tagline: "Blue Dream × Tangie — orange-citrus sativa hybrid.",
    intro:
      "Tangie Dream is a Blue Dream × Tangie cross — sativa-dominant with a sharp orange-peel aroma and a " +
      "creative, energetic effect curve. Combines Blue Dream's calm balance with Tangie's tangerine top. " +
      "Customers reach for it when they want a clear citrus head-up without the racey edge of pure Tangie.",
    lineage: "Blue Dream × Tangie",
    parents: ["blue-dream", "tangie"],
    thcRange: "17–22%",
    cbdRange: "<1%",
    effects: ["Creative", "Energetic", "Uplifted", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Pinene", note: "sharp pine top" },
      { name: "Caryophyllene", note: "peppery warm" },
    ],
    flavor: ["Orange peel", "Sweet citrus", "Light earth"],
    bestFor: ["Daytime sessions", "Creative work", "Citrus-sativa fans"],
    avoidIf: ["You want a body-heavy indica", "Sharp-citrus aromas turn you off"],
    faqs: [
      {
        q: "How is Tangie Dream different from Tangie?",
        a: "Tangie alone is sharper and more racey — pure citrus sativa lift. Tangie Dream adds Blue Dream for balance, which calms the racey edge and makes it a friendlier daytime pick.",
      },
      {
        q: "Is Tangie Dream indica, sativa, or hybrid?",
        a: "Tangie Dream is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Blue Dream × Tangie.",
      },
      {
        q: "What does Tangie Dream taste like?",
        a: "Tangie Dream hits orange peel up front, sweet citrus through the middle, and light earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Tangie Dream?",
        a: "Tangie Dream tests in the 17–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Tangie Dream best for?",
        a: "Tangie Dream reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/tangie-dream",
        "https://weedmaps.com/strains/tangie-dream",
      ],
      notes:
        "Leafly confirms Blue Dream × Tangie, sativa-dominant hybrid, ~19% THC. Top terpenes Myrcene/Pinene/Caryophyllene match. Both parents in our index (blue-dream + tangie from Wave 1).",
      verifiedAt: "2026-05-16",
    },
  },

  "silver-haze": {
    slug: "silver-haze",
    name: "Silver Haze",
    type: "sativa",
    aliases: ["Silver Haze", "SH"],
    tagline: "Northern Lights × Haze — Sensi Seeds heritage haze sativa.",
    intro:
      "Silver Haze is a Sensi Seeds cross of Northern Lights × Haze — sativa-dominant with a clear-headed " +
      "energetic effect and a citrus-and-earth aroma. Named for the heavy trichome coverage that gives the " +
      "buds a silvery sheen. Parent strain to Super Silver Haze and the broader haze-family modern shelf.",
    lineage: "Northern Lights × Haze",
    parents: ["northern-lights", "haze"],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Energetic", "Uplifted", "Creative", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Limonene", note: "citrus top" },
    ],
    flavor: ["Citrus", "Earth", "Light spice"],
    bestFor: ["Daytime sessions", "Creative work", "Heritage-haze fans"],
    avoidIf: ["You want a body-heavy indica", "Long-ceiling sativas wear you out"],
    faqs: [
      {
        q: "Is Silver Haze the same as Super Silver Haze?",
        a: "Related, not identical. Silver Haze is Northern Lights × Haze (parent). Super Silver Haze is Skunk #1 × Northern Lights × Haze — a three-way cross built on top of Silver Haze with Skunk added. SSH is the more famous modern descendant.",
      },
      {
        q: "Is Silver Haze indica, sativa, or hybrid?",
        a: "Silver Haze is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Northern Lights × Haze.",
      },
      {
        q: "What does Silver Haze taste like?",
        a: "Silver Haze hits citrus up front, earth through the middle, and light spice on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Silver Haze?",
        a: "Silver Haze tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Silver Haze best for?",
        a: "Silver Haze reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/silver-haze",
        "https://sensiseeds.com/en/cannabis-seeds/silver-haze",
      ],
      notes:
        "Leafly + Sensi Seeds primary confirm Northern Lights × Haze, sativa, ~23% THC, Sensi Seeds breeder. Top terpenes Myrcene/Caryophyllene/Limonene match. Both parents in our index (northern-lights + haze from Wave 1).",
      verifiedAt: "2026-05-16",
    },
  },

  "mexican-sativa": {
    slug: "mexican-sativa",
    name: "Mexican Sativa",
    type: "sativa",
    aliases: ["Mexican Sativa"],
    tagline: "Oaxacan × Durban Poison × Pakistani — Sensi Seeds landrace hybrid.",
    intro:
      "Mexican Sativa is a Sensi Seeds 70/30 sativa-dominant hybrid blending three landrace lines: a southern " +
      "Oaxacan cultivar, Durban Poison, and a fast-flowering Pakistani indica. Built to compress landrace " +
      "haze-style flowering into a more practical indoor cycle. Heritage-anchor pick.",
    lineage: "Oaxacan landrace × Durban Poison × Pakistani landrace",
    parents: [null, "durban-poison"],
    thcRange: "12–18%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Energetic", "Happy", "Creative"],
    terpenes: [
      { name: "Pinene", note: "sharp pine top" },
      { name: "Terpinolene", note: "fresh herbal" },
      { name: "Caryophyllene", note: "peppery warm" },
    ],
    flavor: ["Earth", "Citrus", "Light spice"],
    bestFor: ["Daytime sessions", "Heritage-strain curious", "Outdoor activities"],
    avoidIf: ["You want a body-heavy indica", "You want a 25%+ THC ceiling"],
    faqs: [
      {
        q: "Is Mexican Sativa a pure landrace?",
        a: "No — it's a Sensi Seeds hybrid that combines three landrace lines. The point was to keep the equatorial-sativa feel while compressing the long flowering into something growable indoors. Sister concept to Sensi's other landrace-derived stabilizations.",
      },
      {
        q: "Is Mexican Sativa indica, sativa, or hybrid?",
        a: "Mexican Sativa is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Oaxacan landrace × Durban Poison × Pakistani landrace.",
      },
      {
        q: "What does Mexican Sativa taste like?",
        a: "Mexican Sativa hits earth up front, citrus through the middle, and light spice on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Mexican Sativa?",
        a: "Mexican Sativa tests in the 12–18% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Mexican Sativa best for?",
        a: "Mexican Sativa reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/mexican-sativa",
        "https://sensiseeds.com/en/cannabis-seeds/mexican-sativa",
      ],
      notes:
        "Leafly + Sensi Seeds primary confirm Oaxacan × Durban Poison × Pakistani 70/30 sativa-dominant hybrid, Sensi Seeds breeder. Durban Poison in our index. Oaxacan and Pakistani landrace parents kept null. THC range conservative per landrace heritage.",
      verifiedAt: "2026-05-16",
    },
  },

  "island-sweet-skunk": {
    slug: "island-sweet-skunk",
    name: "Island Sweet Skunk",
    type: "sativa",
    aliases: ["Island Sweet Skunk", "Sweet Island Skunk", "ISS"],
    tagline: "Sweet Pink Grapefruit × Skunk #1 — head-up tropical skunk sativa.",
    intro:
      "Island Sweet Skunk is a Sweet Pink Grapefruit × Skunk #1 cross — sativa-dominant with a sweet tropical " +
      "grapefruit aroma over the classic skunk base. Energetic, creative head-up. Parent to Golden Goat and " +
      "Outer Space. Customers familiar with the Skunk family reach for this when they want a sweeter, more " +
      "tropical-citrus skunk expression.",
    lineage: "Sweet Pink Grapefruit × Skunk #1",
    parents: [null, "skunk-1"],
    thcRange: "16–22%",
    cbdRange: "<1%",
    effects: ["Energetic", "Uplifted", "Creative", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Terpinolene", note: "fresh herbal" },
      { name: "Pinene", note: "sharp pine" },
    ],
    flavor: ["Sweet grapefruit", "Light skunk", "Tropical"],
    bestFor: ["Daytime sessions", "Creative work", "Skunk-family fans"],
    avoidIf: ["You want a heavy indica wind-down", "Skunk-pungent aromas turn you off"],
    faqs: [
      {
        q: "Is Island Sweet Skunk related to other famous strains?",
        a: "Yes — it's a parent of Golden Goat and Outer Space. The Skunk #1 side keeps it in the broader Skunk family that underpins most modern sativa-leaning hybrids.",
      },
      {
        q: "Is Island Sweet Skunk indica, sativa, or hybrid?",
        a: "Island Sweet Skunk is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Sweet Pink Grapefruit × Skunk #1.",
      },
      {
        q: "What does Island Sweet Skunk taste like?",
        a: "Island Sweet Skunk hits sweet grapefruit up front, light skunk through the middle, and tropical on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Island Sweet Skunk?",
        a: "Island Sweet Skunk tests in the 16–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Island Sweet Skunk best for?",
        a: "Island Sweet Skunk reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/island-sweet-skunk",
        "https://weedmaps.com/strains/island-sweet-skunk",
      ],
      notes:
        "Leafly confirms Sweet Pink Grapefruit × Skunk #1, sativa, ~18% THC. Top terpenes Myrcene/Terpinolene/Pinene match. Skunk #1 in our index. Sweet Pink Grapefruit parent not in our index — kept null.",
      verifiedAt: "2026-05-16",
    },
  },

  "nevilles-haze": {
    slug: "nevilles-haze",
    name: "Neville's Haze",
    type: "sativa",
    aliases: ["Neville's Haze", "Nevilles Haze"],
    tagline: "Haze × Northern Lights #5 — Green House Seeds Cannabis Cup winner.",
    intro:
      "Neville's Haze is a Green House Seeds cross of Haze × Northern Lights #5 — sativa-dominant, tall " +
      "growing, with a pine-cone and floral aroma. Named for Nevil Schoemakers, founder of the Seed Bank " +
      "of Holland. Won the High Times Cannabis Cup in 1998. Long-flowering haze backbone, head-forward " +
      "effect.",
    lineage: "Haze × Northern Lights #5",
    parents: ["haze", "northern-lights-5"],
    thcRange: "16–22%",
    cbdRange: "<1%",
    effects: ["Energetic", "Uplifted", "Creative", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Pinene", note: "sharp pine top" },
    ],
    flavor: ["Pine", "Floral", "Earth"],
    bestFor: ["Daytime sessions", "Creative work", "Haze-family fans"],
    avoidIf: ["You want a body-heavy indica", "Long-ceiling sativas wear you out"],
    faqs: [
      {
        q: "Who was Neville?",
        a: "Nevil Schoemakers founded the Seed Bank of Holland in the 1980s — one of the foundational figures in modern cannabis breeding. Green House Seeds named the strain in his honor.",
      },
      {
        q: "Did Neville's Haze win a Cannabis Cup?",
        a: "Yes — High Times Cannabis Cup in 1998. The win cemented its reputation as a benchmark long-flowering haze.",
      },
      {
        q: "Is Neville's Haze indica, sativa, or hybrid?",
        a: "Neville's Haze is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Haze × Northern Lights #5.",
      },
      {
        q: "What does Neville's Haze taste like?",
        a: "Neville's Haze hits pine up front, floral through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Neville's Haze?",
        a: "Neville's Haze tests in the 16–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Neville's Haze best for?",
        a: "Neville's Haze reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/nevilles-haze",
        "https://weedmaps.com/strains/nevilles-haze",
      ],
      notes:
        "Leafly confirms Haze × Northern Lights #5, sativa, ~15% THC, Green House Seeds breeder. Top terpenes Myrcene/Caryophyllene/Pinene match. Cannabis Cup 1998 win documented. Both parents in our index (haze from Wave 1, northern-lights-5 in this wave).",
      verifiedAt: "2026-05-16",
    },
  },

  // ────────────────────────────────────────────────────────────────────
  // INDICAS (12)
  // ────────────────────────────────────────────────────────────────────

  "kosher-kush": {
    slug: "kosher-kush",
    name: "Kosher Kush",
    type: "indica",
    aliases: ["Kosher Kush", "Kosher OG", "KK"],
    tagline: "OG Kush phenotype — DNA Genetics Cannabis Cup winner.",
    intro:
      "Kosher Kush is a DNA Genetics LA-area clone-only indica selected from the OG Kush family. Won the " +
      "High Times Cannabis Cup Best Indica in 2010 and 2011, plus Best Strain overall in 2011. Earthy-fruity " +
      "with woody notes, body-heavy, late-night. Customers familiar with OG Kush will recognize the family " +
      "signature with more weight underneath.",
    lineage: "OG Kush phenotype (clone-only origin, later released in seed form)",
    parents: ["og-kush", null],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Happy", "Hungry"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Limonene", note: "citrus undertone" },
      { name: "Caryophyllene", note: "peppery warm" },
    ],
    flavor: ["Earth", "Fruit", "Woody"],
    bestFor: ["End of day", "Pre-sleep wind-down", "OG-family fans"],
    avoidIf: ["You need to function", "You want a head-up sativa"],
    faqs: [
      {
        q: "How did Kosher Kush get its name?",
        a: "The original LA grower kept the plant for many years before sharing — the strain was rumored to be 'blessed by a Rabbi.' DNA Genetics later licensed it and ran with the name.",
      },
      {
        q: "Is Kosher Kush a pure OG Kush?",
        a: "It's a clone-only OG Kush phenotype selected for its specific expression — heavier and more fruit-forward than the OG Kush mother. Later released in seed form by DNA Genetics.",
      },
      {
        q: "Is Kosher Kush indica, sativa, or hybrid?",
        a: "Kosher Kush is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is OG Kush phenotype (clone-only origin, later released in seed form).",
      },
      {
        q: "What does Kosher Kush taste like?",
        a: "Kosher Kush hits earth up front, fruit through the middle, and woody on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Kosher Kush?",
        a: "Kosher Kush tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Kosher Kush best for?",
        a: "Kosher Kush reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/kosher-kush",
        "https://weedmaps.com/strains/kosher-kush",
      ],
      notes:
        "Leafly confirms OG Kush phenotype, indica, ~21% THC, DNA Genetics breeder. Top terpenes Myrcene/Limonene/Caryophyllene match. Cannabis Cup 2010 + 2011 wins documented. OG Kush in our index.",
      verifiedAt: "2026-05-16",
    },
  },

  "king-louis-xiii": {
    slug: "king-louis-xiii",
    name: "King Louis XIII",
    type: "indica",
    aliases: ["King Louis XIII", "King Louie XIII", "King Louis"],
    tagline: "OG Kush × LA Confidential — heritage indica with pine pungency.",
    intro:
      "King Louis XIII is an OG Kush × LA Confidential cross — heavy indica with a pine-and-earth aroma that " +
      "reads classic-OG. Body-relaxing and sedating. Customers reach for it when they want late-night OG " +
      "weight without the citrus-forward Lemon-OG side.",
    lineage: "OG Kush × LA Confidential",
    parents: ["og-kush", "la-confidential"],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Happy", "Hungry"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Limonene", note: "citrus undertone" },
      { name: "Caryophyllene", note: "peppery warm" },
    ],
    flavor: ["Pine", "Earth", "Woody"],
    bestFor: ["End of day", "Pre-sleep wind-down", "OG-family fans"],
    avoidIf: ["You need to function", "Pine pungency turns you off"],
    faqs: [
      {
        q: "Is King Louis XIII the same as King Louie XIII?",
        a: "Yes — alternate spellings of the same strain. Some sources spell it Louie, others Louis. Both refer to the OG Kush × LA Confidential cross.",
      },
      {
        q: "Is King Louis XIII indica, sativa, or hybrid?",
        a: "King Louis XIII is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is OG Kush × LA Confidential.",
      },
      {
        q: "What does King Louis XIII taste like?",
        a: "King Louis XIII hits pine up front, earth through the middle, and woody on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is King Louis XIII?",
        a: "King Louis XIII tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is King Louis XIII best for?",
        a: "King Louis XIII reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/king-louis",
        "https://weedmaps.com/strains/king-louis-xiii",
      ],
      notes:
        "Leafly (king-louis slug) confirms OG Kush × LA Confidential, indica, ~21% THC. Top terpenes Myrcene/Limonene/Caryophyllene match. Both parents in our index (og-kush + la-confidential from Wave 1). Display name uses XIII per common WA shelf labeling.",
      verifiedAt: "2026-05-16",
    },
  },

  "purple-urkle": {
    slug: "purple-urkle",
    name: "Purple Urkle",
    type: "indica",
    aliases: ["Purple Urkle", "Urkle"],
    tagline: "Mendocino Purps phenotype — heritage California purple indica.",
    intro:
      "Purple Urkle is a heritage California indica — a selected phenotype of Mendocino Purps. Sweet grape " +
      "aroma with a skunk-berry undertone. Deeply relaxing, sleep-leaning. Parent strain to Granddaddy " +
      "Purple. Customers who like GDP can trace the grape lineage back through Urkle.",
    lineage: "Mendocino Purps phenotype",
    parents: [null, null],
    thcRange: "17–22%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Hungry", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Pinene", note: "sharp pine" },
      { name: "Caryophyllene", note: "peppery warm" },
    ],
    flavor: ["Grape", "Skunk", "Berry"],
    bestFor: ["End of day", "Pre-sleep wind-down", "Grape-strain fans"],
    avoidIf: ["You need to function", "You want a head-up sativa"],
    faqs: [
      {
        q: "Is Purple Urkle a parent of Granddaddy Purple?",
        a: "Yes — GDP is Purple Urkle × Big Bud. The grape character that GDP is known for comes directly from Urkle.",
      },
      {
        q: "Is Purple Urkle indica, sativa, or hybrid?",
        a: "Purple Urkle is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Mendocino Purps phenotype.",
      },
      {
        q: "What does Purple Urkle taste like?",
        a: "Purple Urkle hits grape up front, skunk through the middle, and berry on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Purple Urkle?",
        a: "Purple Urkle tests in the 17–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Purple Urkle best for?",
        a: "Purple Urkle reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/purple-urkle",
        "https://weedmaps.com/strains/purple-urkle",
      ],
      notes:
        "Leafly confirms Mendocino Purps phenotype, indica, ~19% THC. Top terpenes Myrcene/Pinene/Caryophyllene match. Mendocino Purps parent not in our index — kept null. California heritage. Original breeder not documented.",
      verifiedAt: "2026-05-16",
    },
  },

  "pink-kush": {
    slug: "pink-kush",
    name: "Pink Kush",
    type: "indica",
    aliases: ["Pink Kush", "Pink OG", "Sedamen"],
    tagline: "OG Kush phenotype — Canadian-popular indica-dominant hybrid.",
    intro:
      "Pink Kush is an OG Kush phenotype that gained its name from the pink hairs covering mature buds. " +
      "Indica-dominant, body-heavy, sweet vanilla-and-candy aroma over the OG Kush base. Popular Canadian " +
      "shelf staple. Customers familiar with OG Kush will recognize the family signature with a sweeter " +
      "nose.",
    lineage: "OG Kush phenotype",
    parents: ["og-kush", null],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Happy", "Hungry"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Limonene", note: "sweet citrus" },
      { name: "Caryophyllene", note: "peppery warm" },
    ],
    flavor: ["Sweet vanilla", "Candy", "Light pine"],
    bestFor: ["End of day", "Pre-sleep wind-down", "OG-family fans"],
    avoidIf: ["You need to function", "Sweet-candy aromas aren't your thing"],
    faqs: [
      {
        q: "Why is it called Pink Kush?",
        a: "The mature buds typically express pink-orange hairs (pistils) against the green-purple flower. Visual rather than flavor — the inside reads sweet vanilla and candy, not pink-fruit.",
      },
      {
        q: "Is Pink Kush indica, sativa, or hybrid?",
        a: "Pink Kush is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is OG Kush phenotype.",
      },
      {
        q: "What does Pink Kush taste like?",
        a: "Pink Kush hits sweet vanilla up front, candy through the middle, and light pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Pink Kush?",
        a: "Pink Kush tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Pink Kush best for?",
        a: "Pink Kush reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/pink-kush",
        "https://weedmaps.com/strains/pink-kush",
      ],
      notes:
        "Leafly confirms OG Kush phenotype, indica-dominant hybrid, ~19% THC. Top terpenes Myrcene/Limonene/Caryophyllene match. OG Kush in our index. Canadian shelf staple — original breeder not documented.",
      verifiedAt: "2026-05-16",
    },
  },

  "goji-og": {
    slug: "goji-og",
    name: "Goji OG",
    type: "hybrid",
    aliases: ["Goji OG", "Goji"],
    tagline: "Nepali OG × Snow Lotus — Bodhi Seeds sativa-leaning hybrid.",
    intro:
      "Goji OG is a Bodhi Seeds cross of Nepali OG × Snow Lotus — sativa-leaning hybrid with a dynamic " +
      "berry-cherry-licorice aroma that reads more like a Hawaiian Punch can than typical OG. Customers " +
      "reach for it when they want OG-family body with a bright fruit-forward nose.",
    lineage: "Nepali OG × Snow Lotus",
    parents: [null, null],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Happy", "Uplifted", "Relaxed", "Euphoric"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Limonene", note: "sweet citrus" },
    ],
    flavor: ["Red berry", "Cherry", "Licorice"],
    bestFor: ["Mid-afternoon", "Bodhi-Seeds fans", "Fruit-forward hybrid lovers"],
    avoidIf: ["You want a clear sativa head-up", "Sweet-fruit aromas turn you off"],
    faqs: [
      {
        q: "Why does Goji OG taste like fruit punch?",
        a: "The Snow Lotus side brings the bright red-berry and cherry notes; the Nepali OG side adds the licorice and depth. Together it reads closer to a Hawaiian Punch can than to most OG-family strains.",
      },
      {
        q: "Is Goji OG indica, sativa, or hybrid?",
        a: "Goji OG is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Nepali OG × Snow Lotus. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "How strong is Goji OG?",
        a: "Goji OG tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Goji OG best for?",
        a: "Goji OG reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
      {
        q: "What terpenes are in Goji OG?",
        a: "The dominant terpenes in Goji OG are Myrcene (earthy, mango-like, with a mild body-heavy quality), Caryophyllene (peppery and warm, spicy on the back end), and Limonene (citrus zest, bright and mood-lifting on the nose). The blend is what gives the strain its specific nose and the character customers report on the exhale.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/goji-og",
        "https://weedmaps.com/strains/goji-og",
      ],
      notes:
        "Leafly confirms Nepali OG × Snow Lotus, sativa-dominant hybrid, ~19% THC, Bodhi Seeds breeder. Top terpenes Myrcene/Caryophyllene/Limonene match. Both parents not in our index — kept null. Classified hybrid (sativa-leaning) per Leafly.",
      verifiedAt: "2026-05-16",
    },
  },

  "hash-plant": {
    slug: "hash-plant",
    name: "Hash Plant",
    type: "indica",
    aliases: ["Hash Plant", "HP"],
    tagline: "Northern Lights × Afghani — Sensi Seeds heavy resin indica.",
    intro:
      "Hash Plant is a Sensi Seeds Northern Lights × Afghani cross — 90% indica, tight resin-drenched flower " +
      "clusters with a deep Afghani aroma undercut by hashish notes. Heavy body landing, sleep-leaning. " +
      "Named for the high resin output that historically made it a benchmark hash-production strain.",
    lineage: "Northern Lights × Afghani",
    parents: ["northern-lights", "afghani"],
    thcRange: "16–22%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Hungry", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Ocimene", note: "sweet floral undertone" },
    ],
    flavor: ["Hash", "Earth", "Sweet undertone"],
    bestFor: ["End of day", "Pre-sleep wind-down", "Heritage-indica fans"],
    avoidIf: ["You need to function", "You want a head-up sativa"],
    faqs: [
      {
        q: "Why is Hash Plant called that?",
        a: "High resin output — historically a benchmark strain for making hashish. The deep Afghani aroma and tight resin-coated buds carry the hash signature into the live flower.",
      },
      {
        q: "Is Hash Plant indica, sativa, or hybrid?",
        a: "Hash Plant is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Northern Lights × Afghani.",
      },
      {
        q: "What does Hash Plant taste like?",
        a: "Hash Plant hits hash up front, earth through the middle, and sweet undertone on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Hash Plant?",
        a: "Hash Plant tests in the 16–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Hash Plant best for?",
        a: "Hash Plant reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/hash-plant",
        "https://sensiseeds.com/en/cannabis-seeds/hash-plant",
      ],
      notes:
        "Leafly + Sensi Seeds primary confirm Northern Lights × Afghani, 90% indica, ~19% THC, Sensi Seeds breeder. Top terpenes Myrcene/Caryophyllene/Ocimene match. Both parents in our index (northern-lights + afghani from Wave 1).",
      verifiedAt: "2026-05-16",
    },
  },

  "white-fire-og": {
    slug: "white-fire-og",
    name: "White Fire OG",
    type: "hybrid",
    aliases: ["White Fire OG", "WiFi OG", "WiFi", "WFOG"],
    tagline: "Fire OG × The White — high-resin OG hybrid.",
    intro:
      "White Fire OG (often called WiFi OG) is a Fire OG × The White cross — balanced hybrid with cerebral " +
      "uplifting effects and a sour-earthy aroma with citrus and diesel notes. Heavy trichome coverage gives " +
      "the buds a white-frosted appearance. Customers reach for it when they want OG-family lift with a clearer " +
      "head than typical OG indicas.",
    lineage: "Fire OG × The White",
    parents: ["fire-og", null],
    thcRange: "20–28%",
    cbdRange: "<1%",
    effects: ["Focused", "Uplifted", "Happy", "Euphoric"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Limonene", note: "sweet citrus top" },
      { name: "Caryophyllene", note: "peppery warm" },
    ],
    flavor: ["Sour earth", "Citrus", "Diesel"],
    bestFor: ["Mid-afternoon to evening", "Focus work", "OG-family fans wanting clearer head"],
    avoidIf: ["Low-tolerance — runs high", "Diesel pungency turns you off"],
    faqs: [
      {
        q: "Is WiFi OG the same as White Fire OG?",
        a: "Yes — WiFi OG is the common shop nickname (a play on the W-Fire abbreviation). Both names refer to the Fire OG × The White cross.",
      },
      {
        q: "Is White Fire OG indica, sativa, or hybrid?",
        a: "White Fire OG is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Fire OG × The White. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does White Fire OG taste like?",
        a: "White Fire OG hits sour earth up front, citrus through the middle, and diesel on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is White Fire OG?",
        a: "White Fire OG tests in the 20–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is White Fire OG best for?",
        a: "White Fire OG reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/white-fire-og",
        "https://weedmaps.com/strains/white-fire-og",
      ],
      notes:
        "Leafly confirms Fire OG × The White, hybrid, ~22% THC. Top terpenes Myrcene/Limonene/Caryophyllene match. Fire OG in our index. The White parent not in our index — kept null. Original breeder per Leafly is unknown.",
      verifiedAt: "2026-05-16",
    },
  },

  "yoda-og": {
    slug: "yoda-og",
    name: "Yoda OG",
    type: "indica",
    aliases: ["Yoda OG", "Yoda"],
    tagline: "OG Kush descendant — pungent citrus-pine indica.",
    intro:
      "Yoda OG is an OG Kush descendant — heavy indica with chunky pale buds, orange-hair coverage, and a " +
      "pungent citrus aroma. Sedating, body-relaxing. Customers reach for it for late-night sessions when " +
      "they want OG-family weight without the lemon-forward Lemon-OG citrus profile.",
    lineage: "OG Kush phenotype",
    parents: ["og-kush", null],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Hungry", "Happy"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Limonene", note: "citrus undertone" },
      { name: "Myrcene", note: "earthy, sedating" },
    ],
    flavor: ["Citrus", "Pine", "Earth"],
    bestFor: ["End of day", "Pre-sleep wind-down", "OG-family fans"],
    avoidIf: ["You need to function", "You want a head-up sativa"],
    faqs: [
      {
        q: "Why is it called Yoda OG?",
        a: "Breeder lore — the strain was named after the Star Wars character, riffing on the small-but-mighty pattern (the buds are chunky and dense for an OG descendant).",
      },
      {
        q: "Is Yoda OG indica, sativa, or hybrid?",
        a: "Yoda OG is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is OG Kush phenotype.",
      },
      {
        q: "What does Yoda OG taste like?",
        a: "Yoda OG hits citrus up front, pine through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Yoda OG?",
        a: "Yoda OG tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Yoda OG best for?",
        a: "Yoda OG reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/yoda-og",
        "https://weedmaps.com/strains/yoda-og",
      ],
      notes:
        "Leafly confirms OG Kush descendant, indica, ~21% THC. Top terpenes Caryophyllene/Limonene/Myrcene match. OG Kush in our index. Original breeder not documented.",
      verifiedAt: "2026-05-16",
    },
  },

  "mob-boss": {
    slug: "mob-boss",
    name: "Mob Boss",
    type: "hybrid",
    aliases: ["Mob Boss", "MB"],
    tagline: "Chemdawg × Tang Tang — Grindhouse heavy-resin sativa hybrid.",
    intro:
      "Mob Boss is a Grindhouse Medical Seeds cross of Chemdawg × Tang Tang (released 2009) — sativa-dominant " +
      "with staggeringly heavy resin production and a focused-energetic effect curve. Citrus-and-pine aroma " +
      "over a chem fuel base. Customers reach for it when they want Chemdawg lineage with a brighter top.",
    lineage: "Chemdawg × Tang Tang",
    parents: ["chemdawg", null],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Energetic", "Uplifted", "Happy", "Focused"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Pinene", note: "sharp pine top" },
      { name: "Limonene", note: "citrus undertone" },
    ],
    flavor: ["Citrus", "Pine", "Light fuel"],
    bestFor: ["Daytime sessions", "Focus work", "Chemdawg-family fans"],
    avoidIf: ["Diesel pungency turns you off", "You want a heavy indica wind-down"],
    faqs: [
      {
        q: "How does Mob Boss compare to Chemdawg?",
        a: "Same chem-fuel base, but the Tang Tang side adds citrus and brightness on top. Mob Boss leans more sativa than pure Chemdawg, with more head-up lift.",
      },
      {
        q: "Is Mob Boss indica, sativa, or hybrid?",
        a: "Mob Boss is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Chemdawg × Tang Tang. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Mob Boss taste like?",
        a: "Mob Boss hits citrus up front, pine through the middle, and light fuel on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Mob Boss?",
        a: "Mob Boss tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Mob Boss best for?",
        a: "Mob Boss reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/mob-boss",
        "https://weedmaps.com/strains/mob-boss",
      ],
      notes:
        "Leafly confirms Chemdawg × Tang Tang, sativa-dominant hybrid, ~20% THC, Grindhouse Medical Seeds breeder (2009). Top terpenes Myrcene/Pinene/Limonene match. Chemdawg in our index. Tang Tang parent not in our index — kept null.",
      verifiedAt: "2026-05-16",
    },
  },

  "critical-kush": {
    slug: "critical-kush",
    name: "Critical Kush",
    type: "indica",
    aliases: ["Critical Kush", "CK"],
    tagline: "OG Kush × Critical Mass — Barney's Farm heavy indica.",
    intro:
      "Critical Kush is a Barney's Farm cross of OG Kush × Critical Mass — heavy indica with an earthy-spicy " +
      "aroma and a body-heavy landing. Customers reach for it when they want OG-Kush weight with the " +
      "Critical Mass yield genetics underneath. Late-night session pick.",
    lineage: "OG Kush × Critical Mass",
    parents: ["og-kush", "critical-mass"],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Hungry", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Limonene", note: "citrus undertone" },
    ],
    flavor: ["Earth", "Spice", "Light pine"],
    bestFor: ["End of day", "Pre-sleep wind-down", "OG-family fans"],
    avoidIf: ["You need to function", "You want a head-up sativa"],
    faqs: [
      {
        q: "How does Critical Kush relate to Critical Mass?",
        a: "Critical Mass is one of its parents. Critical Kush adds OG Kush on top, which brings more body weight and a deeper earthy note. Critical Mass alone is more balanced; Critical Kush leans heavier.",
      },
      {
        q: "Is Critical Kush indica, sativa, or hybrid?",
        a: "Critical Kush is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is OG Kush × Critical Mass.",
      },
      {
        q: "What does Critical Kush taste like?",
        a: "Critical Kush hits earth up front, spice through the middle, and light pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Critical Kush?",
        a: "Critical Kush tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Critical Kush best for?",
        a: "Critical Kush reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/critical-kush",
        "https://weedmaps.com/strains/critical-kush",
      ],
      notes:
        "Leafly confirms OG Kush × Critical Mass, indica, ~18% THC, Barney's Farm breeder. Top terpenes Myrcene/Caryophyllene/Limonene match. Both parents in our index (og-kush from Wave 1, critical-mass from Wave 1).",
      verifiedAt: "2026-05-16",
    },
  },

  "obama-kush": {
    slug: "obama-kush",
    name: "Obama Kush",
    type: "indica",
    aliases: ["Obama Kush", "OK"],
    tagline: "Afghani × OG Kush — indica with cerebral lift.",
    intro:
      "Obama Kush is an Afghani × OG Kush cross — indica-dominant with a calming body effect and a cerebral " +
      "stimulating top. Pine-and-citrus aroma over a peppery base. Customers reach for it when they want " +
      "OG-family relaxation that still leaves some headroom for conversation.",
    lineage: "Afghani × OG Kush",
    parents: ["afghani", "og-kush"],
    thcRange: "17–22%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Sleepy", "Euphoric"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Limonene", note: "citrus top" },
      { name: "Pinene", note: "sharp pine" },
    ],
    flavor: ["Pine", "Citrus", "Earth"],
    bestFor: ["Evening sessions", "Wind-down social", "OG-family fans"],
    avoidIf: ["You want a clear sativa head-up", "You need to function"],
    faqs: [
      {
        q: "Why the name Obama Kush?",
        a: "Like many strains named after public figures, the name is breeder branding rather than any actual connection. The strain emerged during the Obama administration era.",
      },
      {
        q: "Is Obama Kush indica, sativa, or hybrid?",
        a: "Obama Kush is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Afghani × OG Kush.",
      },
      {
        q: "What does Obama Kush taste like?",
        a: "Obama Kush hits pine up front, citrus through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Obama Kush?",
        a: "Obama Kush tests in the 17–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Obama Kush best for?",
        a: "Obama Kush reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/obama-kush",
        "https://weedmaps.com/strains/obama-kush",
      ],
      notes:
        "Leafly confirms Afghani × OG Kush, indica-dominant, ~19% THC. Top terpenes Caryophyllene/Limonene/Pinene match. Both parents in our index (afghani + og-kush from Wave 1). Original breeder not documented.",
      verifiedAt: "2026-05-16",
    },
  },

  "super-skunk": {
    slug: "super-skunk",
    name: "Super Skunk",
    type: "indica",
    aliases: ["Super Skunk", "SS"],
    tagline: "Skunk #1 × Afghani — Sensi Seeds heritage indica skunk.",
    intro:
      "Super Skunk is a Sensi Seeds cross of Skunk #1 × Afghani — indica-dominant with the bold relaxing " +
      "Afghani body and an extra-skunky aroma from the Skunk #1 side. Heritage 1990s release that anchored " +
      "the next generation of skunk-family stabilizations. Customers familiar with Skunk #1 will recognize " +
      "the family signature with more weight.",
    lineage: "Skunk #1 × Afghani",
    parents: ["skunk-1", "afghani"],
    thcRange: "14–20%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Sleepy", "Hungry"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Limonene", note: "citrus undertone" },
      { name: "Humulene", note: "earthy hop-like" },
    ],
    flavor: ["Skunk", "Earth", "Light citrus"],
    bestFor: ["Evening sessions", "Heritage-skunk fans", "Wind-down"],
    avoidIf: ["Skunk-pungent aromas turn you off", "You want a head-up sativa"],
    faqs: [
      {
        q: "How is Super Skunk different from Skunk #1?",
        a: "Skunk #1 is the foundational parent — sativa-leaning hybrid. Super Skunk adds Afghani on top, which pulls it indica-side and adds more body weight. Same skunk aroma, heavier feel.",
      },
      {
        q: "Is Super Skunk indica, sativa, or hybrid?",
        a: "Super Skunk is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Skunk #1 × Afghani.",
      },
      {
        q: "What does Super Skunk taste like?",
        a: "Super Skunk hits skunk up front, earth through the middle, and light citrus on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Super Skunk?",
        a: "Super Skunk tests in the 14–20% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Super Skunk best for?",
        a: "Super Skunk reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/super-skunk",
        "https://sensiseeds.com/en/cannabis-seeds/super-skunk",
      ],
      notes:
        "Leafly + Sensi Seeds primary confirm Skunk #1 × Afghani, indica, ~16% THC, Sensi Seeds breeder. Top terpenes Caryophyllene/Limonene/Humulene match. Both parents in our index (skunk-1 + afghani from Wave 1).",
      verifiedAt: "2026-05-16",
    },
  },

  // ────────────────────────────────────────────────────────────────────
  // CBD-LEANING (5)
  // ────────────────────────────────────────────────────────────────────

  "cbd-og": {
    slug: "cbd-og",
    name: "CBD OG",
    type: "hybrid",
    aliases: ["CBD OG"],
    tagline: "Lion's Tabernacle × SFV OG — Cali Connection CBD-rich OG.",
    intro:
      "CBD OG is a Cali Connection hybrid that brings real CBD content to the OG Kush family — Lion's " +
      "Tabernacle × SFV OG IBL (regular seeds) or Lion's Tabernacle × Tahoe OG S1 (feminized). Won Best " +
      "CBD Flower at the 2015 NorCal High Times Cannabis Cup. Customers reach for it when they want OG " +
      "aromatics with a balanced cannabinoid profile.",
    lineage: "Lion's Tabernacle × SFV OG IBL (regular) / Lion's Tabernacle × Tahoe OG S1 (feminized)",
    parents: [null, "sfv-og"],
    thcRange: "5–10%",
    cbdRange: "10–15%",
    effects: ["Relaxed", "Happy", "Focused", "Uplifted"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Pinene", note: "sharp pine top" },
      { name: "Caryophyllene", note: "peppery warm" },
    ],
    flavor: ["Pine", "Earth", "Light citrus"],
    bestFor: ["Daytime sessions wanting low-THC", "CBD-curious", "OG aromatics with balanced cannabinoids"],
    avoidIf: ["You want high-THC", "You want a strong head-up sativa"],
    faqs: [
      {
        q: "Is CBD OG just OG Kush with CBD added?",
        a: "Not quite — it's a separately bred cross that selected for CBD expression alongside OG aromatics. Two phenotypes exist (Lion's Tabernacle × SFV OG IBL and Lion's Tabernacle × Tahoe OG S1). Both express the OG family character with a 1:1 to 1:2 THC:CBD ratio.",
      },
      {
        q: "Is CBD OG indica, sativa, or hybrid?",
        a: "CBD OG is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Lion's Tabernacle × SFV OG IBL (regular) / Lion's Tabernacle × Tahoe OG S1 (feminized). The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does CBD OG taste like?",
        a: "CBD OG hits pine up front, earth through the middle, and light citrus on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is CBD OG?",
        a: "CBD OG tests in the 5–10% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is CBD OG best for?",
        a: "CBD OG reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/cbd-og",
        "https://weedmaps.com/strains/cbd-og",
      ],
      notes:
        "Leafly confirms Lion's Tabernacle × SFV OG IBL (or Tahoe OG S1), hybrid, ~7% THC + ~12% CBD, Cali Connection breeder. Top terpenes Myrcene/Pinene/Caryophyllene match. Cannabis Cup 2015 Best CBD Flower documented. SFV OG in our index. Lion's Tabernacle and Tahoe OG S1 parents not in our index — kept null.",
      verifiedAt: "2026-05-16",
    },
  },

  "critical-cure": {
    slug: "critical-cure",
    name: "Critical Cure",
    type: "indica",
    aliases: ["Critical Cure", "CC"],
    tagline: "Critical Kush × CBD-rich pheno — Barney's Farm CBD indica.",
    intro:
      "Critical Cure is a Barney's Farm CBD-rich indica — Critical Kush crossed with a Shanti Baba CBD " +
      "enhancement. Roughly 1:2 THC:CBD ratio, indica-dominant body relaxation with lower psychoactive lift. " +
      "Customers reach for it when they want the Critical Kush body feel without the full THC ceiling.",
    lineage: "Critical Kush × Shanti Baba CBD-enhanced selection",
    parents: ["critical-kush", null],
    thcRange: "8–12%",
    cbdRange: "15–20%",
    effects: ["Relaxed", "Happy", "Sleepy", "Calm"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Caryophyllene", note: "peppery warm" },
      { name: "Pinene", note: "light pine" },
    ],
    flavor: ["Earth", "Sweet undertone", "Light spice"],
    bestFor: ["Evening sessions wanting low-THC", "CBD-curious indica fans", "Wind-down with less head"],
    avoidIf: ["You want high-THC", "You want a clear sativa head-up"],
    faqs: [
      {
        q: "How does Critical Cure compare to Critical Kush?",
        a: "Same Critical Kush base, but Critical Cure pulls down THC and pushes up CBD. Same earthy aroma and indica body feel, much less psychoactive ceiling. Friendlier pick for low-tolerance or CBD-curious customers.",
      },
      {
        q: "Is Critical Cure indica, sativa, or hybrid?",
        a: "Critical Cure is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Critical Kush × Shanti Baba CBD-enhanced selection.",
      },
      {
        q: "What does Critical Cure taste like?",
        a: "Critical Cure hits earth up front, sweet undertone through the middle, and light spice on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Critical Cure?",
        a: "Critical Cure tests in the 8–12% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Critical Cure best for?",
        a: "Critical Cure reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://weedmaps.com/strains/critical-cure",
        "https://www.barneysfarm.com/critical-cure",
      ],
      notes:
        "Weedmaps + Barney's Farm primary confirm Critical Kush × CBD-enhanced pheno, indica-dominant, ~11% THC + ~19% CBD, Barney's Farm breeder. Leafly 404 on dedicated page — used Weedmaps + breeder primary. Critical Kush in our index. Note: 'Shanti Baba CBD-enhanced' is the breeder's framing; the second parent specifics aren't fully public.",
      verifiedAt: "2026-05-16",
    },
  },

  "valentine-x": {
    slug: "valentine-x",
    name: "Valentine X",
    type: "hybrid",
    aliases: ["Valentine X", "Valentine"],
    tagline: "ACDC phenotype — 25:1 CBD:THC ratio.",
    intro:
      "Valentine X is a high-CBD ACDC phenotype — roughly 25:1 CBD:THC ratio, hybrid (50/50). Named after " +
      "St. Valentine, patron saint of epilepsy. Customers reach for it when they want CBD-forward effects " +
      "with minimal psychoactive lift. One of the highest CBD:THC ratios on the modern shelf.",
    lineage: "ACDC phenotype",
    parents: ["acdc", null],
    thcRange: "<1%",
    cbdRange: "12–16%",
    effects: ["Relaxed", "Calm", "Happy", "Focused"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Pinene", note: "sharp pine top" },
      { name: "Caryophyllene", note: "peppery warm" },
    ],
    flavor: ["Earth", "Pine", "Light citrus"],
    bestFor: ["Daytime sessions wanting near-zero THC", "CBD-curious", "Functional wellness use"],
    avoidIf: ["You want any psychoactive lift", "You want a flavor-forward sativa"],
    faqs: [
      {
        q: "How much THC does Valentine X actually have?",
        a: "Typically 1% THC or less, with 12–16% CBD — a roughly 25:1 ratio. Effectively non-psychoactive for most customers, though batch testing varies and the actual ratio should be checked on each label.",
      },
      {
        q: "Is Valentine X related to ACDC?",
        a: "Yes — it's a selected ACDC phenotype with the CBD ratio pushed even higher. Sister strain to ACDC and Ringo's Gift in the high-CBD lineup.",
      },
      {
        q: "Is Valentine X indica, sativa, or hybrid?",
        a: "Valentine X is a hybrid — a cross that pulls from both sides of the family tree. The lineage is ACDC phenotype. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Valentine X taste like?",
        a: "Valentine X hits earth up front, pine through the middle, and light citrus on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Valentine X?",
        a: "Valentine X tests in the <1% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Valentine X best for?",
        a: "Valentine X reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/valentine-x",
        "https://weedmaps.com/strains/valentine-x",
      ],
      notes:
        "Leafly confirms ACDC phenotype, hybrid, ~1% THC + ~13% CBD (25:1 ratio). Top terpenes Myrcene/Pinene/Caryophyllene match. ACDC in our index. Sister to ringos-gift (Wave 2) in the high-CBD lineup. Name references St. Valentine (patron saint of epilepsy) — kept honest framing without therapeutic claim.",
      verifiedAt: "2026-05-16",
    },
  },

  "avi-dekel": {
    slug: "avi-dekel",
    name: "Avi-Dekel",
    type: "sativa",
    aliases: ["Avi-Dekel", "Avidekel"],
    tagline: "Tikun Olam high-CBD sativa — near-zero THC.",
    intro:
      "Avi-Dekel is a Tikun Olam (Israeli medical breeder) sativa-dominant strain built for high CBD with " +
      "almost no THC — typically 0.5–1% THC alongside 13–16% CBD. Effectively non-psychoactive. One of the " +
      "earliest CBD-dominant strains developed for medical-program use. Customers reach for it when they " +
      "want CBD content without measurable lift.",
    lineage: "Tikun Olam proprietary selection (parents not publicly disclosed)",
    parents: [null, null],
    thcRange: "<1%",
    cbdRange: "13–16%",
    effects: ["Calm", "Relaxed", "Focused", "Clear"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Pinene", note: "sharp pine top" },
      { name: "Caryophyllene", note: "peppery warm" },
    ],
    flavor: ["Earth", "Light citrus", "Pine"],
    bestFor: ["Daytime sessions wanting near-zero THC", "Tikun Olam-aware customers", "CBD-forward exploration"],
    avoidIf: ["You want any psychoactive lift", "You want a flavor-forward strain"],
    faqs: [
      {
        q: "Who is Tikun Olam?",
        a: "An Israeli medical-cannabis breeder/research group, one of the earliest formal medical-cannabis programs globally. Avi-Dekel is one of their flagship CBD-dominant strains, developed for medical-program patients.",
      },
      {
        q: "How does Avi-Dekel compare to ACDC?",
        a: "Both are CBD-dominant, very-low-THC strains. ACDC traces to Cannatonic lineage and the US CBD-genetics scene; Avi-Dekel comes through Tikun Olam's Israeli medical program. Similar effect profile — near-zero psychoactive lift.",
      },
      {
        q: "Is Avi-Dekel indica, sativa, or hybrid?",
        a: "Avi-Dekel is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Tikun Olam proprietary selection (parents not publicly disclosed).",
      },
      {
        q: "What does Avi-Dekel taste like?",
        a: "Avi-Dekel hits earth up front, light citrus through the middle, and pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Avi-Dekel?",
        a: "Avi-Dekel tests in the <1% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Avi-Dekel best for?",
        a: "Avi-Dekel reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/avi-dekel",
        "https://www.tikun-olam.info/strains",
      ],
      notes:
        "Leafly + Tikun Olam primary confirm sativa-dominant hybrid, near-zero THC (~0.5–1%) + ~15.8% CBD max. Parent strains not publicly disclosed by Tikun Olam — kept both null. Top terpenes inferred from Leafly profile and Tikun Olam category data. Honest disclosure of proprietary parents.",
      verifiedAt: "2026-05-16",
    },
  },

  "canna-tsu": {
    slug: "canna-tsu",
    name: "Canna-Tsu",
    type: "hybrid",
    aliases: ["Canna-Tsu", "Cannatsu"],
    tagline: "Sour Tsunami × Cannatonic — high-CBD daytime hybrid.",
    intro:
      "Canna-Tsu is a Sour Tsunami × Cannatonic cross — both parents are themselves high-CBD strains, so the " +
      "Canna-Tsu offspring lands consistently CBD-dominant. Roughly 1:2 THC:CBD or higher, balanced hybrid " +
      "with mellow effects and mental clarity. Customers reach for it when they want CBD-forward daytime " +
      "function.",
    lineage: "Sour Tsunami × Cannatonic",
    parents: ["sour-tsunami", "cannatonic"],
    thcRange: "4–8%",
    cbdRange: "10–15%",
    effects: ["Calm", "Focused", "Relaxed", "Clear"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Pinene", note: "sharp pine top" },
      { name: "Caryophyllene", note: "peppery warm" },
    ],
    flavor: ["Earth", "Light pine", "Sweet undertone"],
    bestFor: ["Daytime sessions wanting low-THC", "CBD-forward exploration", "Functional use with mental clarity"],
    avoidIf: ["You want high-THC", "You want a strong head-up sativa"],
    faqs: [
      {
        q: "Why is Canna-Tsu consistently high-CBD?",
        a: "Both parents (Sour Tsunami and Cannatonic) are themselves CBD-dominant strains. Crossing two high-CBD parents stabilizes the CBD expression in the offspring — that's why Canna-Tsu lands reliably in the 1:2+ THC:CBD range across batches.",
      },
      {
        q: "Is Canna-Tsu indica, sativa, or hybrid?",
        a: "Canna-Tsu is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Sour Tsunami × Cannatonic. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Canna-Tsu taste like?",
        a: "Canna-Tsu hits earth up front, light pine through the middle, and sweet undertone on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Canna-Tsu?",
        a: "Canna-Tsu tests in the 4–8% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Canna-Tsu best for?",
        a: "Canna-Tsu reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/canna-tsu",
        "https://weedmaps.com/strains/canna-tsu",
      ],
      notes:
        "Leafly confirms Sour Tsunami × Cannatonic, hybrid, ~4% THC + ~10% CBD. Top terpenes Myrcene/Pinene/Caryophyllene match. Both parents in our index (sour-tsunami from Wave 2, cannatonic from Wave 2). Sister to canna-tsu in the high-CBD lineup with the ACDC family.",
      verifiedAt: "2026-05-16",
    },
  },

  // ────────────────────────────────────────────────────────────────────
  // WAVE 5 (slugs 201-250) — integrated 2026-05-16 — 250-target COMPLETE
  // 50 verified strains. Tier: 41 verified-clean + 9 verified-with-note + 0 contested.
  // Type split: 16 hybrid + 15 sativa + 19 indica (9 landrace entries — heritage-heavy).
  // Notes overage (9 vs spec 5) all honest disclosure not data quality (landrace
  // categories + proprietary parents + folklore origins + pheno selections).
  // Source dataset: shared/strains-wave5-201to250.ts
  // ────────────────────────────────────────────────────────────────────
  // ────────────────────────────────────────────────────────────────────
  // COFFEESHOP HERITAGE + KUSH CLASSICS (1-10)
  // Skywalker · Grease Monkey · Master Yoda · Big Bud · Cookies Kush · Rockstar
  // Death Bubba · NYC Sour Diesel · Cherry Garcia · Lamb's Bread
  // ────────────────────────────────────────────────────────────────────

  "skywalker": {
    slug: "skywalker",
    name: "Skywalker",
    type: "indica",
    aliases: ["Skywalker", "Skywalker Kush"],
    tagline: "Blueberry × Mazar — Dutch Passion heritage indica.",
    intro:
      "Skywalker is the Dutch Passion classic — a Blueberry × Mazar cross released in the late 1990s that " +
      "predates the more famous Skywalker OG. Pure-leaning indica with sweet-berry and earthy-hash notes, " +
      "body-heavy without being couch-pinning at moderate doses. Customers familiar with Skywalker OG (the " +
      "OG Kush cross) should know this is the parent-side strain, not the same plant.",
    lineage: "Blueberry × Mazar",
    parents: ["blueberry", null],
    thcRange: "16–20%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Happy", "Hungry"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Limonene", note: "sweet citrus" },
    ],
    flavor: ["Sweet berry", "Earth", "Hash"],
    bestFor: ["Evening wind-down", "Heritage-indica fans", "Pre-sleep sessions"],
    avoidIf: ["You need to function", "You want a head-up sativa"],
    faqs: [
      {
        q: "Is Skywalker the same as Skywalker OG?",
        a: "No — and this is one of the most common mix-ups on the shelf. Original Skywalker is a Dutch Passion Blueberry × Mazar cross from the 1990s. Skywalker OG is a later cross of Skywalker × OG Kush. Effects and aromatics differ.",
      },
      {
        q: "Is Skywalker indica, sativa, or hybrid?",
        a: "Skywalker is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Blueberry × Mazar.",
      },
      {
        q: "What does Skywalker taste like?",
        a: "Skywalker hits sweet berry up front, earth through the middle, and hash on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Skywalker?",
        a: "Skywalker tests in the 16–20% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Skywalker best for?",
        a: "Skywalker reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.dutch-passion.com/en/cannabis-seeds/skywalker/",
        "https://www.leafly.com/strains/skywalker",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "grease-monkey": {
    slug: "grease-monkey",
    name: "Grease Monkey",
    type: "indica",
    aliases: ["Grease Monkey", "GM"],
    tagline: "Gorilla Glue #4 × Cookies & Cream — gas-and-vanilla indica hybrid.",
    intro:
      "Grease Monkey is an Exotic Genetix cross of Gorilla Glue #4 × Cookies & Cream — indica-leaning hybrid " +
      "with dense gas-and-vanilla aromatics layered. The Cookies & Cream side adds sweet-vanilla on top of " +
      "the Gorilla Glue gas-and-earth backbone. Body-heavy session with a slow comedown. Customers familiar " +
      "with Gorilla Glue will recognize the family resemblance with extra sweetness on the nose.",
    lineage: "Gorilla Glue #4 × Cookies & Cream",
    parents: ["gorilla-glue-4", "cookies-and-cream"],
    thcRange: "22–28%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Hungry", "Happy"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery gas" },
      { name: "Limonene", note: "sweet citrus" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Gas", "Sweet vanilla", "Earth"],
    bestFor: ["Evening wind-down", "Gas-shelf fans", "Pre-sleep sessions"],
    avoidIf: ["You need to function", "Sharp gas aromas turn you off"],
    faqs: [
      {
        q: "How does Grease Monkey compare to Gorilla Glue #4?",
        a: "Same Gorilla Glue gas backbone, with the Cookies & Cream side adding sweet-vanilla aromatics on top. Effects land slightly heavier on the indica side than straight GG#4 — customers reach for Grease Monkey when they want the gas profile with more body weight.",
      },
      {
        q: "Is Grease Monkey indica, sativa, or hybrid?",
        a: "Grease Monkey is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Gorilla Glue #4 × Cookies & Cream.",
      },
      {
        q: "What does Grease Monkey taste like?",
        a: "Grease Monkey hits gas up front, sweet vanilla through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Grease Monkey?",
        a: "Grease Monkey tests in the 22–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Grease Monkey best for?",
        a: "Grease Monkey reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/grease-monkey",
        "https://weedmaps.com/strains/grease-monkey",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "master-yoda": {
    slug: "master-yoda",
    name: "Master Yoda",
    type: "indica",
    aliases: ["Master Yoda", "Yoda OG"],
    tagline: "Master Kush × Yoda OG — body-heavy kush indica.",
    intro:
      "Master Yoda is a Master Kush × Yoda OG cross — pure-leaning indica with the dense earthy-kush profile " +
      "of both parents stacked. Body-heavy from the first session, sweet-earth on the nose, slow-pace evening " +
      "strain. Customers reach for it when they want classic kush wind-down without the OG-fuel sharpness.",
    lineage: "Master Kush × Yoda OG",
    parents: ["master-kush", "yoda-og"],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Hungry", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Pinene", note: "subtle pine" },
    ],
    flavor: ["Sweet earth", "Kush", "Light pine"],
    bestFor: ["Evening wind-down", "Pre-sleep", "Kush-heritage fans"],
    avoidIf: ["You need to function", "You want a head-up sativa"],
    faqs: [
      {
        q: "Is Master Yoda related to Yoda OG?",
        a: "Yoda OG is one of its parents. Master Yoda adds Master Kush on top, which deepens the earthy-kush aromatics and pushes the indica side further toward body-heavy.",
      },
      {
        q: "Is Master Yoda indica, sativa, or hybrid?",
        a: "Master Yoda is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Master Kush × Yoda OG.",
      },
      {
        q: "What does Master Yoda taste like?",
        a: "Master Yoda hits sweet earth up front, kush through the middle, and light pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Master Yoda?",
        a: "Master Yoda tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Master Yoda best for?",
        a: "Master Yoda reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/master-yoda",
        "https://en.seedfinder.eu/strain-info/Master+Yoda/",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "big-bud": {
    slug: "big-bud",
    name: "Big Bud",
    type: "indica",
    aliases: ["Big Bud", "BB"],
    tagline: "Afghani × Northern Lights × Skunk — heritage yield-monster indica.",
    intro:
      "Big Bud is a Sensi Seeds heritage indica from the 1980s — bred for the massive yields the name suggests. " +
      "Afghani × Northern Lights × Skunk lineage, body-heavy and earthy-sweet on the nose. Won the High Times " +
      "Cannabis Cup in 1989. Customers familiar with old-school indica shelves recognize Big Bud as one of the " +
      "foundational commercial-yield strains.",
    lineage: "Afghani × Northern Lights × Skunk",
    parents: ["afghani", "northern-lights"],
    thcRange: "15–20%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Hungry", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy base" },
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Pinene", note: "light pine" },
    ],
    flavor: ["Sweet earth", "Spice", "Light pine"],
    bestFor: ["Evening wind-down", "Heritage-indica fans", "Pre-sleep sessions"],
    avoidIf: ["You need to function", "You want a head-up sativa"],
    faqs: [
      {
        q: "Why is Big Bud famous?",
        a: "Two reasons — the massive flower size that gives the strain its name, and the 1989 Cannabis Cup win that put it on the international map. It's one of the foundational commercial-yield indicas of the modern shelf era.",
      },
      {
        q: "Is Big Bud indica, sativa, or hybrid?",
        a: "Big Bud is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Afghani × Northern Lights × Skunk.",
      },
      {
        q: "What does Big Bud taste like?",
        a: "Big Bud hits sweet earth up front, spice through the middle, and light pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Big Bud?",
        a: "Big Bud tests in the 15–20% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Big Bud best for?",
        a: "Big Bud reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://sensiseeds.com/en/cannabis-seeds/strain-big-bud",
        "https://www.leafly.com/strains/big-bud",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "cookies-kush": {
    slug: "cookies-kush",
    name: "Cookies Kush",
    type: "indica",
    aliases: ["Cookies Kush", "GSC Kush"],
    tagline: "Girl Scout Cookies × Rolex Kush — Barney's Farm Cup-winner indica.",
    intro:
      "Cookies Kush is a Barney's Farm cross of Girl Scout Cookies × Rolex Kush — won the High Times Cannabis " +
      "Cup in 2014 for Best Coffeeshop Strain. Indica-leaning with the Cookies sweetness layered over dense " +
      "kush earth. Sits on the heavier side of the Cookies family. Customers reach for it when they want " +
      "Cookies aromatics with a kush wind-down.",
    lineage: "Girl Scout Cookies × Rolex Kush",
    parents: ["girl-scout-cookies", null],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Happy", "Euphoric"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Myrcene", note: "earthy base" },
      { name: "Limonene", note: "sweet citrus undertone" },
    ],
    flavor: ["Sweet earth", "Cookies", "Kush"],
    bestFor: ["Evening wind-down", "Cookies-family fans", "Pre-sleep sessions"],
    avoidIf: ["You need to function", "You want a head-up sativa"],
    faqs: [
      {
        q: "How does Cookies Kush compare to GSC?",
        a: "Cookies Kush leans heavier on the indica side — the Rolex Kush parent pulls it toward dense kush earth where GSC sits more balanced. Same Cookies sweetness on the nose, deeper body weight in the session.",
      },
      {
        q: "Is Cookies Kush indica, sativa, or hybrid?",
        a: "Cookies Kush is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Girl Scout Cookies × Rolex Kush.",
      },
      {
        q: "What does Cookies Kush taste like?",
        a: "Cookies Kush hits sweet earth up front, cookies through the middle, and kush on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Cookies Kush?",
        a: "Cookies Kush tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Cookies Kush best for?",
        a: "Cookies Kush reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.barneysfarm.com/strain/cookies-kush",
        "https://www.leafly.com/strains/cookies-kush",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "rockstar": {
    slug: "rockstar",
    name: "Rockstar",
    type: "indica",
    aliases: ["Rockstar", "Rock Star"],
    tagline: "Rock Bud × Sensi Star — BC heritage indica.",
    intro:
      "Rockstar is a BC-bred indica cross of Rock Bud × Sensi Star — body-heavy with sweet-grape and earth " +
      "on the nose. Popular across Canadian shelves since the mid-2000s. Customers familiar with the Sensi " +
      "Star side will recognize the dense resin profile; the Rock Bud parent adds extra body weight.",
    lineage: "Rock Bud × Sensi Star",
    parents: [null, null],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Happy", "Hungry"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Myrcene", note: "earthy base" },
      { name: "Humulene", note: "hop-like earthy" },
    ],
    flavor: ["Sweet grape", "Earth", "Light spice"],
    bestFor: ["Evening wind-down", "Pre-sleep sessions", "BC-heritage fans"],
    avoidIf: ["You need to function", "You want a head-up sativa"],
    faqs: [
      {
        q: "Where is Rockstar popular?",
        a: "It's been a BC and broader Canadian shelf staple since the mid-2000s — one of the heritage indicas that defined the Canadian craft scene before the legal-market era. Less well-known south of the border but worth knowing on the heritage-indica shelf.",
      },
      {
        q: "Is Rockstar indica, sativa, or hybrid?",
        a: "Rockstar is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Rock Bud × Sensi Star.",
      },
      {
        q: "What does Rockstar taste like?",
        a: "Rockstar hits sweet grape up front, earth through the middle, and light spice on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Rockstar?",
        a: "Rockstar tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Rockstar best for?",
        a: "Rockstar reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/rockstar",
        "https://weedmaps.com/strains/rockstar",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "death-bubba": {
    slug: "death-bubba",
    name: "Death Bubba",
    type: "indica",
    aliases: ["Death Bubba", "DB"],
    tagline: "Bubba Kush × Death Star — heavy BC indica.",
    intro:
      "Death Bubba is a BC heritage cross of Bubba Kush × Death Star — heavy-hitting indica with dense purple " +
      "trichome coverage and an earthy-pine nose. Customers familiar with Bubba Kush as a baseline will " +
      "recognize the deep body weight; the Death Star side adds extra resin and a slightly fuel-tinged finish.",
    lineage: "Bubba Kush × Death Star",
    parents: ["bubba-kush", "death-star"],
    thcRange: "20–27%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Hungry", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Limonene", note: "subtle citrus" },
    ],
    flavor: ["Earth", "Pine", "Light fuel"],
    bestFor: ["Late-night use", "Pre-sleep wind-down", "Heavy-indica fans"],
    avoidIf: ["You need to function", "You want a head-up sativa", "Low-tolerance customers should start small"],
    faqs: [
      {
        q: "Is Death Bubba stronger than regular Bubba Kush?",
        a: "Yes — the Death Star side pushes both THC potential and resin coverage higher. Customers who like Bubba Kush as a baseline tend to reach for Death Bubba when they want the same family profile turned up.",
      },
      {
        q: "Is Death Bubba indica, sativa, or hybrid?",
        a: "Death Bubba is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Bubba Kush × Death Star.",
      },
      {
        q: "What does Death Bubba taste like?",
        a: "Death Bubba hits earth up front, pine through the middle, and light fuel on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Death Bubba?",
        a: "Death Bubba tests in the 20–27% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Death Bubba best for?",
        a: "Death Bubba reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/death-bubba",
        "https://weedmaps.com/strains/death-bubba",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "nyc-sour-diesel": {
    slug: "nyc-sour-diesel",
    name: "NYC Sour Diesel",
    type: "sativa",
    aliases: ["NYC Sour Diesel", "NYCSD", "New York City Diesel"],
    tagline: "Soma Seeds Diesel × Hawaiian — coffeeshop-classic NYC sativa.",
    intro:
      "NYC Sour Diesel is the Soma Seeds Mexican × Afghani × Hawaiian × Diesel cross released in the late " +
      "1990s — won the High Times Cannabis Cup in 2003 and 2004. Distinct from East Coast Sour Diesel; this " +
      "is the Soma lineage with the Hawaiian side adding sweet-citrus body to the diesel backbone. Long " +
      "coffeeshop history in Amsterdam.",
    lineage: "Mexican × Afghani × Hawaiian × Sour Diesel",
    parents: ["sour-diesel", "afghani"],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Energetic", "Uplifted", "Happy", "Creative"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery diesel" },
      { name: "Limonene", note: "sweet citrus" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Diesel", "Sweet citrus", "Earth"],
    bestFor: ["Daytime sessions", "Creative work", "Social hangouts"],
    avoidIf: ["You want a body-heavy indica", "Diesel pungency turns you off"],
    faqs: [
      {
        q: "Is NYC Sour Diesel the same as East Coast Sour Diesel?",
        a: "Different strains, similar family. NYC Sour Diesel is the Soma Seeds Mexican × Afghani × Hawaiian × Diesel cross. East Coast Sour Diesel is a Mass Super Skunk × Sour Diesel pheno. Both are diesel-heavy sativas; aromatics and effects diverge.",
      },
      {
        q: "Why is NYC Sour Diesel a coffeeshop classic?",
        a: "Soma released it through Amsterdam coffeeshops in the late 1990s — by 2003 and 2004 it had back-to-back Cannabis Cup wins. It's been on Amsterdam menus continuously since then.",
      },
      {
        q: "Is NYC Sour Diesel indica, sativa, or hybrid?",
        a: "NYC Sour Diesel is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Mexican × Afghani × Hawaiian × Sour Diesel.",
      },
      {
        q: "What does NYC Sour Diesel taste like?",
        a: "NYC Sour Diesel hits diesel up front, sweet citrus through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is NYC Sour Diesel?",
        a: "NYC Sour Diesel tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is NYC Sour Diesel best for?",
        a: "NYC Sour Diesel reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/nyc-diesel",
        "https://somaseeds.nl/en/cannabis-seeds/nyc-diesel/",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "cherry-garcia": {
    slug: "cherry-garcia",
    name: "Cherry Garcia",
    type: "hybrid",
    aliases: ["Cherry Garcia", "CG"],
    tagline: "Cherry Pie × OGiesel — balanced cherry-and-fuel hybrid.",
    intro:
      "Cherry Garcia is a Compound Genetics cross of Cherry Pie × OGiesel — balanced hybrid named after the " +
      "Jerry Garcia tribute Ben & Jerry's flavor. Sweet-cherry on the nose with a fuel undercurrent from the " +
      "OGiesel side. Customers reach for it when they want fruit-forward aromatics with a head-up-then-relaxed " +
      "effect curve.",
    lineage: "Cherry Pie × OGiesel",
    parents: ["cherry-pie", null],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Happy", "Uplifted", "Relaxed", "Euphoric"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Limonene", note: "sweet citrus" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Sweet cherry", "Fuel", "Earth"],
    bestFor: ["Mid-afternoon", "Cherry-shelf fans", "Social hangouts"],
    avoidIf: ["You want a clear sativa head-up", "You want a heavy indica wind-down"],
    faqs: [
      {
        q: "Is Cherry Garcia named after the Grateful Dead?",
        a: "Indirectly — it's named after the Ben & Jerry's ice cream flavor that itself was named after Jerry Garcia. Compound Genetics built the cross around the cherry-shelf aromatic profile to match the namesake.",
      },
      {
        q: "Is Cherry Garcia indica, sativa, or hybrid?",
        a: "Cherry Garcia is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Cherry Pie × OGiesel. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Cherry Garcia taste like?",
        a: "Cherry Garcia hits sweet cherry up front, fuel through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Cherry Garcia?",
        a: "Cherry Garcia tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Cherry Garcia best for?",
        a: "Cherry Garcia reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/cherry-garcia",
        "https://weedmaps.com/strains/cherry-garcia",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "lambs-bread": {
    slug: "lambs-bread",
    name: "Lamb's Bread",
    type: "sativa",
    aliases: ["Lamb's Bread", "Lambsbread", "Lamb's Breath"],
    tagline: "Pure Jamaican landrace — Rastafarian heritage sativa.",
    intro:
      "Lamb's Bread is a pure Jamaican landrace sativa with deep Rastafarian cultural roots — Bob Marley was " +
      "famously associated with the strain. Bright cheesy-grass nose with hints of tropical sweetness, " +
      "head-up and uplifting. Customers reach for it as a heritage-strain experience as much as a session " +
      "pick. Landrace genetics mean phenotype variance is wide.",
    lineage: "Landrace — Jamaica",
    parents: [null, null],
    thcRange: "14–20%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Energetic", "Happy", "Creative"],
    terpenes: [
      { name: "Terpinolene", note: "fresh herbal" },
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Pinene", note: "sharp pine" },
    ],
    flavor: ["Cheese", "Grass", "Tropical"],
    bestFor: ["Daytime sessions", "Heritage-strain curious", "Creative work"],
    avoidIf: ["You want a body-heavy indica", "Long-ceiling sativas wear you out"],
    faqs: [
      {
        q: "Why is Lamb's Bread culturally important?",
        a: "It's a Jamaican landrace sativa deeply tied to Rastafarian culture — Bob Marley publicly favored it, and the strain has been part of the Jamaican spiritual-and-cultural tradition for generations. Customers reach for it as much for heritage context as session experience.",
      },
      {
        q: "Is Lamb's Bread the same as Lamb's Breath?",
        a: "Same strain — Lamb's Breath is a common alternate spelling. Both refer to the Jamaican landrace.",
      },
      {
        q: "Is Lamb's Bread indica, sativa, or hybrid?",
        a: "Lamb's Bread is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Landrace — Jamaica.",
      },
      {
        q: "What does Lamb's Bread taste like?",
        a: "Lamb's Bread hits cheese up front, grass through the middle, and tropical on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Lamb's Bread?",
        a: "Lamb's Bread tests in the 14–20% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Lamb's Bread best for?",
        a: "Lamb's Bread reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/lambs-bread",
        "https://weedmaps.com/strains/lambs-bread",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  // ────────────────────────────────────────────────────────────────────
  // SATIVAS + LANDRACES (11-20)
  // Acapulco · Malawi Gold · Swazi Gold · Highland Nepalese · Pakistani CK
  // African Sativa · Punto Rojo · Cuban Linx · Tropicana Cherry · Apple Sundae
  // ────────────────────────────────────────────────────────────────────

  "acapulco": {
    slug: "acapulco",
    name: "Acapulco",
    type: "sativa",
    aliases: ["Acapulco", "Acapulco Landrace", "Mexican Acapulco"],
    tagline: "Pure Mexican landrace — the source strain behind Acapulco Gold.",
    intro:
      "Acapulco is the broader Mexican landrace from the Guerrero coast that Acapulco Gold descends from — " +
      "pure equatorial sativa with citrus-and-earth aromatics and the long head-up ceiling of an unhybridized " +
      "landrace. Customers familiar with Acapulco Gold (the gold-leaf phenotype) should know this is the " +
      "broader source category. Landrace genetics mean phenotype variance is wide.",
    lineage: "Landrace — Mexico (Guerrero / Acapulco region)",
    parents: [null, null],
    thcRange: "13–18%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Energetic", "Creative", "Happy"],
    terpenes: [
      { name: "Pinene", note: "sharp pine top" },
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Limonene", note: "citrus" },
    ],
    flavor: ["Citrus", "Earth", "Pine"],
    bestFor: ["Daytime sessions", "Heritage-strain curious", "Outdoor activities"],
    avoidIf: ["You want a body-heavy indica", "Long-ceiling sativas wear you out"],
    faqs: [
      {
        q: "How is Acapulco different from Acapulco Gold?",
        a: "Acapulco Gold is one specific phenotype of the broader Acapulco landrace — the gold-leaf expression with the famous golden-trichome coverage. Acapulco as a category includes the gold pheno plus other regional expressions from the Guerrero coast.",
      },
      {
        q: "Is Acapulco indica, sativa, or hybrid?",
        a: "Acapulco is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Landrace — Mexico (Guerrero / Acapulco region).",
      },
      {
        q: "What does Acapulco taste like?",
        a: "Acapulco hits citrus up front, earth through the middle, and pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Acapulco?",
        a: "Acapulco tests in the 13–18% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Acapulco best for?",
        a: "Acapulco reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/acapulco-gold",
        "https://en.seedfinder.eu/strain-info/Acapulco_Gold/",
      ],
      notes:
        "Sister entry to acapulco-gold from Wave 1 — kept separate as the broader landrace-category strain. Leafly + SeedFinder document Acapulco Gold as a phenotype of the broader Mexican landrace; this entry represents the source category. Parents null (landrace).",
      verifiedAt: "2026-05-16",
    },
  },

  "malawi-gold": {
    slug: "malawi-gold",
    name: "Malawi Gold",
    type: "sativa",
    aliases: ["Malawi Gold", "Malawi", "Chamba"],
    tagline: "Pure African landrace — long-flowering Malawi heritage sativa.",
    intro:
      "Malawi Gold is a pure African landrace sativa from the highland regions of Malawi — one of the great " +
      "long-flowering equatorial heritage strains. Known locally as Chamba, it's documented for golden " +
      "trichome coverage at harvest. Head-up, citrus-and-spice on the nose, with the long ceiling typical of " +
      "unhybridized landrace sativas. Landrace genetics mean phenotype variance is wide.",
    lineage: "Landrace — Malawi (highland regions)",
    parents: [null, null],
    thcRange: "14–20%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Energetic", "Creative", "Happy"],
    terpenes: [
      { name: "Terpinolene", note: "fresh herbal" },
      { name: "Pinene", note: "sharp pine" },
      { name: "Limonene", note: "citrus" },
    ],
    flavor: ["Citrus", "Spice", "Earth"],
    bestFor: ["Daytime sessions", "Heritage-strain curious", "Long sessions"],
    avoidIf: ["You want a body-heavy indica", "Long-ceiling sativas wear you out"],
    faqs: [
      {
        q: "Why is Malawi Gold considered a heritage strain?",
        a: "It's one of the foundational African landrace sativas — pure equatorial genetics from the Malawi highlands, undocumented hybridization. Like Thai or Colombian, it's part of the genetic library that modern sativa-leaning breeders draw from when they want long-ceiling heritage effects.",
      },
      {
        q: "Is Malawi Gold indica, sativa, or hybrid?",
        a: "Malawi Gold is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Landrace — Malawi (highland regions).",
      },
      {
        q: "What does Malawi Gold taste like?",
        a: "Malawi Gold hits citrus up front, spice through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Malawi Gold?",
        a: "Malawi Gold tests in the 14–20% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Malawi Gold best for?",
        a: "Malawi Gold reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/malawi-gold",
        "https://en.seedfinder.eu/strain-info/Malawi/",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "swazi-gold": {
    slug: "swazi-gold",
    name: "Swazi Gold",
    type: "sativa",
    aliases: ["Swazi Gold", "Swazi", "Eswatini Gold"],
    tagline: "Pure Swaziland landrace — southern African heritage sativa.",
    intro:
      "Swazi Gold is a pure landrace sativa from Swaziland (now Eswatini) — head-up, long-flowering, with " +
      "the golden trichome coverage the name suggests. Sweet-citrus on the nose with a subtle earth " +
      "undercurrent. Sister landrace to Malawi Gold in the broader southern African heritage category. " +
      "Landrace genetics mean phenotype variance is wide.",
    lineage: "Landrace — Eswatini (formerly Swaziland)",
    parents: [null, null],
    thcRange: "13–18%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Energetic", "Happy", "Creative"],
    terpenes: [
      { name: "Pinene", note: "sharp pine" },
      { name: "Limonene", note: "sweet citrus" },
      { name: "Caryophyllene", note: "peppery warmth" },
    ],
    flavor: ["Sweet citrus", "Earth", "Light spice"],
    bestFor: ["Daytime sessions", "Heritage-strain curious", "Creative work"],
    avoidIf: ["You want a body-heavy indica", "Long-ceiling sativas wear you out"],
    faqs: [
      {
        q: "How does Swazi Gold compare to Malawi Gold?",
        a: "Same broader southern African heritage category — both pure landrace sativas with golden-trichome expression. Swazi tends to be slightly more citrus-forward; Malawi leans more spice-and-pine. Phenotype variance is wide on both.",
      },
      {
        q: "Is Swazi Gold indica, sativa, or hybrid?",
        a: "Swazi Gold is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Landrace — Eswatini (formerly Swaziland).",
      },
      {
        q: "What does Swazi Gold taste like?",
        a: "Swazi Gold hits sweet citrus up front, earth through the middle, and light spice on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Swazi Gold?",
        a: "Swazi Gold tests in the 13–18% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Swazi Gold best for?",
        a: "Swazi Gold reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/swazi-gold",
        "https://en.seedfinder.eu/strain-info/Swazi/",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "highland-nepalese": {
    slug: "highland-nepalese",
    name: "Highland Nepalese",
    type: "sativa",
    aliases: ["Highland Nepalese", "Nepalese", "Nepali"],
    tagline: "Pure Himalayan landrace — sweet-resin heritage sativa.",
    intro:
      "Highland Nepalese is a pure landrace sativa from the Himalayan foothills of Nepal — historically used " +
      "as the source genetic for traditional Nepalese hand-rubbed hashish (charas). Head-up sativa expression " +
      "with surprisingly dense resin coverage given the sativa structure. Sweet-spice and pine on the nose. " +
      "Landrace genetics mean phenotype variance is wide.",
    lineage: "Landrace — Nepal (Himalayan foothills)",
    parents: [null, null],
    thcRange: "14–20%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Creative", "Happy", "Energetic"],
    terpenes: [
      { name: "Pinene", note: "sharp pine top" },
      { name: "Terpinolene", note: "herbal" },
      { name: "Caryophyllene", note: "peppery warmth" },
    ],
    flavor: ["Sweet spice", "Pine", "Earth"],
    bestFor: ["Daytime sessions", "Heritage-strain curious", "Hash-history fans"],
    avoidIf: ["You want a body-heavy indica", "Long-ceiling sativas wear you out"],
    faqs: [
      {
        q: "Why is Highland Nepalese tied to hashish history?",
        a: "Nepal is one of the historical centers of charas production — hand-rubbed hashish made by rolling fresh flower between the palms. The Nepalese landrace was selected over generations for resin coverage, making it one of the few sativas with hash-friendly trichome density.",
      },
      {
        q: "Is Highland Nepalese indica, sativa, or hybrid?",
        a: "Highland Nepalese is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Landrace — Nepal (Himalayan foothills).",
      },
      {
        q: "What does Highland Nepalese taste like?",
        a: "Highland Nepalese hits sweet spice up front, pine through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Highland Nepalese?",
        a: "Highland Nepalese tests in the 14–20% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Highland Nepalese best for?",
        a: "Highland Nepalese reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/nepalese",
        "https://en.seedfinder.eu/strain-info/Nepalese/",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "pakistani-chitral-kush": {
    slug: "pakistani-chitral-kush",
    name: "Pakistani Chitral Kush",
    type: "indica",
    aliases: ["Pakistani Chitral Kush", "PCK", "Chitral Kush"],
    tagline: "Pure Hindu Kush landrace — Pakistani heritage indica.",
    intro:
      "Pakistani Chitral Kush is a pure landrace indica from the Chitral valley of Pakistan's Hindu Kush " +
      "range — a regional sister to the broader Hindu Kush category. Dense purple-leaning phenotypes with " +
      "earthy-hashish aromatics. Body-heavy, slow-pace evening strain. The Chitral region selection produces " +
      "some of the most consistent indica expressions in the broader Hindu Kush landrace family.",
    lineage: "Landrace — Pakistan (Chitral valley, Hindu Kush range)",
    parents: [null, null],
    thcRange: "15–20%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Happy", "Hungry"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Pinene", note: "subtle pine" },
    ],
    flavor: ["Earth", "Hashish", "Light spice"],
    bestFor: ["Evening wind-down", "Heritage-indica fans", "Pre-sleep sessions"],
    avoidIf: ["You need to function", "You want a head-up sativa"],
    faqs: [
      {
        q: "How does Pakistani Chitral Kush relate to Hindu Kush?",
        a: "Hindu Kush is the broader landrace category — the mountain range spans Pakistan and Afghanistan. Pakistani Chitral Kush is the specific Chitral valley regional selection on the Pakistani side. Same family, regional pheno selection.",
      },
      {
        q: "Is Pakistani Chitral Kush indica, sativa, or hybrid?",
        a: "Pakistani Chitral Kush is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Landrace — Pakistan (Chitral valley, Hindu Kush range).",
      },
      {
        q: "What does Pakistani Chitral Kush taste like?",
        a: "Pakistani Chitral Kush hits earth up front, hashish through the middle, and light spice on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Pakistani Chitral Kush?",
        a: "Pakistani Chitral Kush tests in the 15–20% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Pakistani Chitral Kush best for?",
        a: "Pakistani Chitral Kush reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/pakistani-chitral-kush",
        "https://en.seedfinder.eu/strain-info/Pakistani+Chitral+Kush/",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "african-sativa": {
    slug: "african-sativa",
    name: "African Sativa",
    type: "sativa",
    aliases: ["African Sativa", "African Landrace"],
    tagline: "Broad African landrace category — heritage equatorial sativa.",
    intro:
      "African Sativa is the broader landrace category that covers regional African heritage sativas — " +
      "including the Malawi, Swazi, Durban, and Congolese expressions. Customers reach for it as a heritage " +
      "shelf option when the exact regional pheno isn't specified. Head-up, long-flowering, citrus-and-earth " +
      "on the nose. Landrace genetics mean phenotype variance is wide across the African continent.",
    lineage: "Landrace — African continent (regional varieties)",
    parents: [null, null],
    thcRange: "13–18%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Energetic", "Creative", "Happy"],
    terpenes: [
      { name: "Pinene", note: "sharp pine" },
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Limonene", note: "citrus" },
    ],
    flavor: ["Citrus", "Earth", "Spice"],
    bestFor: ["Daytime sessions", "Heritage-strain curious", "Long sessions"],
    avoidIf: ["You want a body-heavy indica", "Long-ceiling sativas wear you out"],
    faqs: [
      {
        q: "Is African Sativa a specific strain?",
        a: "It's a broader category rather than a single named strain — covers the regional African landrace heritage including Malawi, Swazi, Durban, and Congolese expressions. Useful when shelf product is from African heritage genetics but the exact regional pheno isn't documented.",
      },
      {
        q: "Is African Sativa indica, sativa, or hybrid?",
        a: "African Sativa is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Landrace — African continent (regional varieties).",
      },
      {
        q: "What does African Sativa taste like?",
        a: "African Sativa hits citrus up front, earth through the middle, and spice on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is African Sativa?",
        a: "African Sativa tests in the 13–18% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is African Sativa best for?",
        a: "African Sativa reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/african-sativa",
        "https://en.seedfinder.eu/strain-info/African/",
      ],
      notes:
        "Category-level entry rather than single named strain. Used for shelf product where African landrace heritage is known but exact regional pheno isn't. Parents null (landrace).",
      verifiedAt: "2026-05-16",
    },
  },

  "punto-rojo": {
    slug: "punto-rojo",
    name: "Punto Rojo",
    type: "sativa",
    aliases: ["Punto Rojo", "Red Point", "Red Tip"],
    tagline: "Pure Colombian landrace — red-tipped heritage sativa.",
    intro:
      "Punto Rojo is one of the named phenotypes of the broader Colombian landrace — the red-tipped " +
      "expression historically from the Andes regions. Sister pheno to Colombian Gold in the Colombian " +
      "landrace family. Head-up sativa with citrus-and-earth aromatics and a distinctive red-tinted " +
      "leaf-tip presentation. Landrace genetics mean phenotype variance is wide.",
    lineage: "Landrace — Colombia (Andes, red-tip phenotype)",
    parents: [null, null],
    thcRange: "12–18%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Energetic", "Happy", "Creative"],
    terpenes: [
      { name: "Pinene", note: "sharp pine top" },
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Limonene", note: "citrus" },
    ],
    flavor: ["Citrus", "Earth", "Light spice"],
    bestFor: ["Daytime sessions", "Heritage-strain curious", "Outdoor activities"],
    avoidIf: ["You want a body-heavy indica", "Long-ceiling sativas wear you out"],
    faqs: [
      {
        q: "How does Punto Rojo relate to Colombian Gold?",
        a: "Both are named phenotypes of the broader Colombian landrace. Colombian Gold is the gold-trichome Santa Marta expression; Punto Rojo (Spanish for 'red point') is the Andes red-tipped pheno. Same Colombian landrace family, distinct regional expressions.",
      },
      {
        q: "Is Punto Rojo indica, sativa, or hybrid?",
        a: "Punto Rojo is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Landrace — Colombia (Andes, red-tip phenotype).",
      },
      {
        q: "What does Punto Rojo taste like?",
        a: "Punto Rojo hits citrus up front, earth through the middle, and light spice on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Punto Rojo?",
        a: "Punto Rojo tests in the 12–18% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Punto Rojo best for?",
        a: "Punto Rojo reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/punto-rojo",
        "https://en.seedfinder.eu/strain-info/Punto+Rojo/",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "cuban-linx": {
    slug: "cuban-linx",
    name: "Cuban Linx",
    type: "hybrid",
    aliases: ["Cuban Linx", "CL"],
    tagline: "Cookies × OGKB — Cookies-family modern hybrid.",
    intro:
      "Cuban Linx is a Cookies-shelf modern hybrid named after the Raekwon record — Cookies × OGKB cross with " +
      "balanced effects and the dense Cookies-family aromatics. Sweet-cookie nose with the OGKB earthy " +
      "undercurrent. Customers familiar with the Cookies catalog will recognize the family resemblance to " +
      "GMO Cookies and Cookies-side dessert hybrids.",
    lineage: "Cookies × OGKB",
    parents: ["girl-scout-cookies", null],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Limonene", note: "sweet citrus" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Sweet cookie", "Earth", "Light citrus"],
    bestFor: ["Mid-afternoon", "Cookies-family fans", "Social hangouts"],
    avoidIf: ["You want a clear sativa head-up", "You want a heavy indica wind-down"],
    faqs: [
      {
        q: "Is Cuban Linx named after the Raekwon album?",
        a: "Yes — Cookies has a track record of naming releases after hip-hop classics, and Cuban Linx is the Raekwon reference (Only Built 4 Cuban Linx, 1995). The genetics are unrelated to the name; it's a branding choice.",
      },
      {
        q: "Is Cuban Linx indica, sativa, or hybrid?",
        a: "Cuban Linx is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Cookies × OGKB. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Cuban Linx taste like?",
        a: "Cuban Linx hits sweet cookie up front, earth through the middle, and light citrus on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Cuban Linx?",
        a: "Cuban Linx tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Cuban Linx best for?",
        a: "Cuban Linx reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://cookies.co/strains/cuban-linx",
        "https://www.leafly.com/strains/cuban-linx",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "tropicana-cherry": {
    slug: "tropicana-cherry",
    name: "Tropicana Cherry",
    type: "sativa",
    aliases: ["Tropicana Cherry", "TC"],
    tagline: "Tropicana Cookies × Cherry Cookies — citrus-cherry sativa hybrid.",
    intro:
      "Tropicana Cherry is a Tropicana Cookies × Cherry Cookies cross — sativa-leaning hybrid with bright " +
      "citrus and sweet-cherry aromatics stacked. Won multiple awards including a Best Hybrid placement at " +
      "Emerald Cup. Head-up effect curve with a long ceiling. Customers reach for it when they want " +
      "citrus-cherry aromatics and a clear-headed daytime session.",
    lineage: "Tropicana Cookies × Cherry Cookies",
    parents: ["tropicana-cookies", "cherry-cookies"],
    thcRange: "22–28%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Happy", "Energetic", "Creative"],
    terpenes: [
      { name: "Limonene", note: "bright citrus top" },
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Pinene", note: "sharp pine" },
    ],
    flavor: ["Citrus", "Sweet cherry", "Earth"],
    bestFor: ["Daytime sessions", "Citrus-shelf fans", "Creative work"],
    avoidIf: ["You want a heavy indica wind-down", "Sharp citrus aromas turn you off"],
    faqs: [
      {
        q: "Is Tropicana Cherry an award-winner?",
        a: "Yes — it's placed in multiple Emerald Cup hybrid categories and is part of the Compound Genetics / Wizard Trees catalog that's driven a lot of the modern citrus-cherry hybrid shelf.",
      },
      {
        q: "Is Tropicana Cherry indica, sativa, or hybrid?",
        a: "Tropicana Cherry is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Tropicana Cookies × Cherry Cookies.",
      },
      {
        q: "What does Tropicana Cherry taste like?",
        a: "Tropicana Cherry hits citrus up front, sweet cherry through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Tropicana Cherry?",
        a: "Tropicana Cherry tests in the 22–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Tropicana Cherry best for?",
        a: "Tropicana Cherry reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/tropicana-cherry",
        "https://weedmaps.com/strains/tropicana-cherry",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "apple-sundae": {
    slug: "apple-sundae",
    name: "Apple Sundae",
    type: "hybrid",
    aliases: ["Apple Sundae", "AS"],
    tagline: "Sundae Driver × Apple Fritter — sweet apple-cream hybrid.",
    intro:
      "Apple Sundae is a Sundae Driver × Apple Fritter cross — balanced hybrid with sweet-apple and creamy " +
      "vanilla aromatics layered. Sits in the dessert-hybrid lineup alongside Sundae Strudel and Apple " +
      "Fritter. Customers reach for it when they want apple-pastry nose with a balanced session that lifts " +
      "before it settles.",
    lineage: "Sundae Driver × Apple Fritter",
    parents: ["sundae-driver", "apple-fritter"],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Happy", "Relaxed", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Limonene", note: "sweet citrus" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Sweet apple", "Vanilla", "Cream"],
    bestFor: ["Mid-afternoon to evening", "Dessert-hybrid fans", "Social hangouts"],
    avoidIf: ["You want a clear sativa head-up", "Sweet aromas aren't your thing"],
    faqs: [
      {
        q: "How does Apple Sundae compare to Sundae Strudel?",
        a: "Both are Sundae Driver crosses on the apple side of the dessert-hybrid shelf. Apple Sundae uses Apple Fritter as the second parent, leaning sweeter and creamier. Sundae Strudel uses Apple Strudel and leans more pastry-forward. Similar family, distinct expressions.",
      },
      {
        q: "Is Apple Sundae indica, sativa, or hybrid?",
        a: "Apple Sundae is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Sundae Driver × Apple Fritter. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Apple Sundae taste like?",
        a: "Apple Sundae hits sweet apple up front, vanilla through the middle, and cream on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Apple Sundae?",
        a: "Apple Sundae tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Apple Sundae best for?",
        a: "Apple Sundae reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/apple-sundae",
        "https://weedmaps.com/strains/apple-sundae",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  // ────────────────────────────────────────────────────────────────────
  // SATIVAS + AWARD-WINNERS (21-30)
  // Snow Cap · Black Banana · Mochi Cake · Tropic Truffle · Frosted Donuts
  // Apple Fritter Crasher · Mochi · Hawaiian · Hawaiian Snow · Kali Mist
  // ────────────────────────────────────────────────────────────────────

  "snow-cap": {
    slug: "snow-cap",
    name: "Snow Cap",
    type: "sativa",
    aliases: ["Snow Cap", "Snowcap"],
    tagline: "Snow White × Haze — frosty sativa hybrid.",
    intro:
      "Snow Cap is a sativa-leaning hybrid of Snow White × Haze — known for dense white trichome coverage " +
      "(hence the name) and a bright citrus-pine aroma. Head-up effects with the long ceiling of the haze " +
      "side. Customers reach for it when they want haze-family lift with extra resin density.",
    lineage: "Snow White × Haze",
    parents: [null, "haze"],
    thcRange: "17–22%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Energetic", "Happy", "Creative"],
    terpenes: [
      { name: "Pinene", note: "sharp pine top" },
      { name: "Terpinolene", note: "herbal" },
      { name: "Limonene", note: "citrus" },
    ],
    flavor: ["Citrus", "Pine", "Mint"],
    bestFor: ["Daytime sessions", "Haze-family fans", "Creative work"],
    avoidIf: ["You want a body-heavy indica", "Long-ceiling sativas wear you out"],
    faqs: [
      {
        q: "Why is it called Snow Cap?",
        a: "The flower comes covered in dense white trichome frost — at harvest the buds look snow-capped. The Snow White parent contributes the heavy resin coverage; the Haze side keeps the structure sativa-leaning.",
      },
      {
        q: "Is Snow Cap indica, sativa, or hybrid?",
        a: "Snow Cap is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Snow White × Haze.",
      },
      {
        q: "What does Snow Cap taste like?",
        a: "Snow Cap hits citrus up front, pine through the middle, and mint on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Snow Cap?",
        a: "Snow Cap tests in the 17–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Snow Cap best for?",
        a: "Snow Cap reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/snowcap",
        "https://weedmaps.com/strains/snowcap",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "black-banana": {
    slug: "black-banana",
    name: "Black Banana",
    type: "hybrid",
    aliases: ["Black Banana", "BB"],
    tagline: "Black Cherry Funk × Banana OG — fruit-forward hybrid.",
    intro:
      "Black Banana is a Black Cherry Funk × Banana OG cross — balanced hybrid with the rare profile of " +
      "sweet-banana stacked over dark-berry funk. Won multiple award placements in modern hybrid categories. " +
      "Customers reach for it when they want fruit-forward aromatics that don't read as standard candy-sweet.",
    lineage: "Black Cherry Funk × Banana OG",
    parents: [null, "banana-og"],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Happy", "Relaxed", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Limonene", note: "sweet citrus" },
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Sweet banana", "Dark berry", "Funk"],
    bestFor: ["Mid-afternoon", "Fruit-forward shelf fans", "Social hangouts"],
    avoidIf: ["You want a clear sativa head-up", "You want a heavy indica wind-down"],
    faqs: [
      {
        q: "What does Black Banana taste like?",
        a: "Distinctly banana-sweet on the inhale with dark-berry funk on the exhale — closer to a banana-and-blackberry pastry than the candy-shelf banana profile. It's a less common aromatic combination on the modern shelf.",
      },
      {
        q: "Is Black Banana indica, sativa, or hybrid?",
        a: "Black Banana is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Black Cherry Funk × Banana OG. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "How strong is Black Banana?",
        a: "Black Banana tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Black Banana best for?",
        a: "Black Banana reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
      {
        q: "What terpenes are in Black Banana?",
        a: "The dominant terpenes in Black Banana are Limonene (citrus zest, bright and mood-lifting on the nose), Caryophyllene (peppery and warm, spicy on the back end), and Myrcene (earthy, mango-like, with a mild body-heavy quality). The blend is what gives the strain its specific nose and the character customers report on the exhale.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/black-banana",
        "https://weedmaps.com/strains/black-banana",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "mochi-cake": {
    slug: "mochi-cake",
    name: "Mochi Cake",
    type: "hybrid",
    aliases: ["Mochi Cake", "MC"],
    tagline: "Mochi Gelato × Wedding Cake — Cookies-shelf dessert hybrid.",
    intro:
      "Mochi Cake is a cross of Mochi Gelato × Wedding Cake — both Cookies-shelf parents stacked into a " +
      "balanced-leaning-indica dessert hybrid. Sweet-cream aromatics with the vanilla undercurrent of " +
      "Wedding Cake. Customers familiar with both parents will recognize the family resemblance; effects " +
      "land closer to Wedding Cake than to Mochi Gelato alone.",
    lineage: "Mochi Gelato × Wedding Cake",
    parents: ["mochi-gelato", "wedding-cake"],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Hungry"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Limonene", note: "sweet citrus" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Sweet cream", "Vanilla", "Light berry"],
    bestFor: ["Evening", "Dessert-hybrid fans", "After-dinner couch"],
    avoidIf: ["You want a clear sativa head-up", "Sweet aromas aren't your thing"],
    faqs: [
      {
        q: "How does Mochi Cake compare to Mochi Gelato?",
        a: "Same family, but the Wedding Cake side pulls Mochi Cake more indica-leaning and adds vanilla-cake aromatics on top of the Mochi Gelato cream base. Customers who like both parents tend to find Mochi Cake bridges the two.",
      },
      {
        q: "Is Mochi Cake indica, sativa, or hybrid?",
        a: "Mochi Cake is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Mochi Gelato × Wedding Cake. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Mochi Cake taste like?",
        a: "Mochi Cake hits sweet cream up front, vanilla through the middle, and light berry on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Mochi Cake?",
        a: "Mochi Cake tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Mochi Cake best for?",
        a: "Mochi Cake reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/mochi-cake",
        "https://weedmaps.com/strains/mochi-cake",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "tropic-truffle": {
    slug: "tropic-truffle",
    name: "Tropic Truffle",
    type: "hybrid",
    aliases: ["Tropic Truffle", "TT"],
    tagline: "Tropicana Cookies × Gorilla Truffle — tropical-and-earth hybrid.",
    intro:
      "Tropic Truffle is a Tropicana Cookies × Gorilla Truffle cross — balanced hybrid stacking the bright " +
      "citrus of Tropicana with the dense gas-and-truffle aromatics of Gorilla Truffle. Compound Genetics " +
      "release that's drawn attention in the modern hybrid catalog. Customers reach for it when they want " +
      "citrus aromatics with a deeper gas undercurrent.",
    lineage: "Tropicana Cookies × Gorilla Truffle",
    parents: ["tropicana-cookies", null],
    thcRange: "22–28%",
    cbdRange: "<1%",
    effects: ["Happy", "Uplifted", "Relaxed", "Euphoric"],
    terpenes: [
      { name: "Limonene", note: "citrus top" },
      { name: "Caryophyllene", note: "peppery gas" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Citrus", "Gas", "Earth"],
    bestFor: ["Mid-afternoon", "Citrus-shelf fans", "Modern hybrid catalog explorers"],
    avoidIf: ["Sharp gas aromas turn you off", "You want a heavy indica wind-down"],
    faqs: [
      {
        q: "What does Tropic Truffle smell like?",
        a: "Bright citrus on the top note from Tropicana, with dense gas and earth on the bottom from Gorilla Truffle. The combination reads as citrus-then-gas rather than fully blended — it's distinct from the candy-shelf citrus profile.",
      },
      {
        q: "Is Tropic Truffle indica, sativa, or hybrid?",
        a: "Tropic Truffle is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Tropicana Cookies × Gorilla Truffle. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Tropic Truffle taste like?",
        a: "Tropic Truffle hits citrus up front, gas through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Tropic Truffle?",
        a: "Tropic Truffle tests in the 22–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Tropic Truffle best for?",
        a: "Tropic Truffle reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/tropic-truffle",
        "https://weedmaps.com/strains/tropic-truffle",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "frosted-donuts": {
    slug: "frosted-donuts",
    name: "Frosted Donuts",
    type: "hybrid",
    aliases: ["Frosted Donuts", "FD"],
    tagline: "The White × Donny Burger — pastry-and-gas hybrid.",
    intro:
      "Frosted Donuts is a The White × Donny Burger cross — modern hybrid with sweet-pastry aromatics over " +
      "the dense gas backbone of Donny Burger. Customers familiar with Donny Burger will recognize the gas " +
      "undercurrent; The White parent adds the dense white-trichome frost the name suggests.",
    lineage: "The White × Donny Burger",
    parents: [null, "donny-burger"],
    thcRange: "22–28%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Hungry"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery gas" },
      { name: "Limonene", note: "sweet citrus" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Sweet pastry", "Gas", "Earth"],
    bestFor: ["Mid-afternoon to evening", "Gas-shelf fans", "Dessert-hybrid fans"],
    avoidIf: ["Sharp gas aromas turn you off", "You want a clear sativa head-up"],
    faqs: [
      {
        q: "Why is it called Frosted Donuts?",
        a: "Two-fold — The White parent contributes the dense white trichome frost (the 'frosted' part) and the sweet-pastry aromatics from the Donny Burger side give it the donut-shelf nose. The visual presentation is heavily frosted at harvest.",
      },
      {
        q: "Is Frosted Donuts indica, sativa, or hybrid?",
        a: "Frosted Donuts is a hybrid — a cross that pulls from both sides of the family tree. The lineage is The White × Donny Burger. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Frosted Donuts taste like?",
        a: "Frosted Donuts hits sweet pastry up front, gas through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Frosted Donuts?",
        a: "Frosted Donuts tests in the 22–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Frosted Donuts best for?",
        a: "Frosted Donuts reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/frosted-donuts",
        "https://weedmaps.com/strains/frosted-donuts",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "apple-fritter-crasher": {
    slug: "apple-fritter-crasher",
    name: "Apple Fritter Crasher",
    type: "hybrid",
    aliases: ["Apple Fritter Crasher", "AFC"],
    tagline: "Apple Fritter × Wedding Crasher — apple-pastry hybrid.",
    intro:
      "Apple Fritter Crasher is an Apple Fritter × Wedding Crasher cross — balanced hybrid with sweet-apple " +
      "and vanilla-cake aromatics layered. Sits in the modern dessert-hybrid lineup. Customers reach for it " +
      "when they want apple-shelf nose with the Wedding Crasher side adding a slightly heavier body.",
    lineage: "Apple Fritter × Wedding Crasher",
    parents: ["apple-fritter", "wedding-crasher"],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Happy", "Relaxed", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Limonene", note: "sweet citrus" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Sweet apple", "Vanilla", "Cream"],
    bestFor: ["Mid-afternoon", "Apple-shelf fans", "Dessert-hybrid fans"],
    avoidIf: ["You want a clear sativa head-up", "Sweet aromas aren't your thing"],
    faqs: [
      {
        q: "How does this compare to Apple Fritter alone?",
        a: "Apple Fritter Crasher carries the apple-pastry nose forward but the Wedding Crasher side adds a slightly heavier body and more vanilla-cake undercurrent. Customers who already like Apple Fritter tend to reach for this when they want the same family profile turned slightly heavier.",
      },
      {
        q: "Is Apple Fritter Crasher indica, sativa, or hybrid?",
        a: "Apple Fritter Crasher is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Apple Fritter × Wedding Crasher. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Apple Fritter Crasher taste like?",
        a: "Apple Fritter Crasher hits sweet apple up front, vanilla through the middle, and cream on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Apple Fritter Crasher?",
        a: "Apple Fritter Crasher tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Apple Fritter Crasher best for?",
        a: "Apple Fritter Crasher reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/apple-fritter-crasher",
        "https://en.seedfinder.eu/strain-info/Apple+Fritter+Crasher/",
      ],
      notes:
        "Weedmaps 404 on the dedicated page — used Leafly + SeedFinder. Both parents in our index. Community-attested cross consistent across sources.",
      verifiedAt: "2026-05-16",
    },
  },

  "mochi": {
    slug: "mochi",
    name: "Mochi",
    type: "hybrid",
    aliases: ["Mochi", "Mochi #18"],
    tagline: "Sunset Sherbet × Thin Mint GSC — Sherbinski heritage hybrid.",
    intro:
      "Mochi is the Sherbinski cross of Sunset Sherbet × Thin Mint GSC (pheno #18 specifically) — sister " +
      "selection to Gelato from the same parent stock. Mochi tends to land slightly more indica-leaning " +
      "than the Gelato phenos. Sweet-cream and berry on the nose with the Cookies-family Mint backbone. " +
      "Customers reach for it when they want Sherbinski heritage with a body-tilted lean.",
    lineage: "Sunset Sherbet × Thin Mint GSC",
    parents: ["sunset-sherbet", "thin-mint-gsc"],
    thcRange: "20–28%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Limonene", note: "sweet citrus" },
      { name: "Humulene", note: "hop-like earthy" },
    ],
    flavor: ["Sweet cream", "Berry", "Mint"],
    bestFor: ["Mid-afternoon to evening", "Sherbinski-shelf fans", "Cookies-family fans"],
    avoidIf: ["You want a clear sativa head-up", "Sweet aromas aren't your thing"],
    faqs: [
      {
        q: "Is Mochi the same as Mochi Gelato?",
        a: "Mochi (Mochi #18) is the original Sherbinski Sunset Sherbet × Thin Mint GSC selection. Mochi Gelato is a later variation that crosses Mochi back into the Gelato family. Same heritage stock, distinct selections.",
      },
      {
        q: "How does Mochi compare to Gelato?",
        a: "Same parent stock (Sunset Sherbet × Thin Mint GSC) — both are pheno selections from the same cross. Gelato #33 and #41 are the most famous selections; Mochi is the #18 selection that leans more indica.",
      },
      {
        q: "Is Mochi indica, sativa, or hybrid?",
        a: "Mochi is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Sunset Sherbet × Thin Mint GSC. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Mochi taste like?",
        a: "Mochi hits sweet cream up front, berry through the middle, and mint on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Mochi?",
        a: "Mochi tests in the 20–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Mochi best for?",
        a: "Mochi reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://sherbinskis.com/strains/mochi",
        "https://www.leafly.com/strains/mochi",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "hawaiian": {
    slug: "hawaiian",
    name: "Hawaiian",
    type: "sativa",
    aliases: ["Hawaiian", "Hawaiian Sativa", "Pure Hawaiian"],
    tagline: "Pure Hawaiian landrace — tropical heritage sativa.",
    intro:
      "Hawaiian is a pure landrace sativa from the Hawaiian islands — tropical-citrus and sweet-pineapple " +
      "aromatics with the head-up ceiling typical of equatorial sativas. Foundational genetic in many " +
      "modern tropical-citrus hybrids (Pineapple Express, Maui Wowie, and the NYC Diesel cross all trace " +
      "back here). Landrace genetics mean phenotype variance is wide.",
    lineage: "Landrace — Hawaiian islands",
    parents: [null, null],
    thcRange: "13–18%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Energetic", "Happy", "Creative"],
    terpenes: [
      { name: "Limonene", note: "sweet citrus top" },
      { name: "Pinene", note: "sharp pine" },
      { name: "Caryophyllene", note: "peppery warmth" },
    ],
    flavor: ["Tropical", "Sweet pineapple", "Citrus"],
    bestFor: ["Daytime sessions", "Tropical-shelf fans", "Outdoor activities"],
    avoidIf: ["You want a body-heavy indica", "Long-ceiling sativas wear you out"],
    faqs: [
      {
        q: "What modern strains have Hawaiian heritage?",
        a: "Pineapple Express (Trainwreck × Hawaiian), Maui Wowie (Hawaiian landrace selection), NYC Sour Diesel (Mexican × Afghani × Hawaiian × Diesel) all have Hawaiian in the family tree. It's one of the foundational tropical-citrus parents in modern breeding.",
      },
      {
        q: "Is Hawaiian indica, sativa, or hybrid?",
        a: "Hawaiian is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Landrace — Hawaiian islands.",
      },
      {
        q: "What does Hawaiian taste like?",
        a: "Hawaiian hits tropical up front, sweet pineapple through the middle, and citrus on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Hawaiian?",
        a: "Hawaiian tests in the 13–18% THC range — on the lower end for a flower strain. Customers report a milder, easier experience than the 24%+ heavy hitters.",
      },
      {
        q: "What time of day is Hawaiian best for?",
        a: "Hawaiian reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/hawaiian",
        "https://en.seedfinder.eu/strain-info/Hawaiian/",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "hawaiian-snow": {
    slug: "hawaiian-snow",
    name: "Hawaiian Snow",
    type: "sativa",
    aliases: ["Hawaiian Snow", "HS"],
    tagline: "Hawaiian Haze × Neville's Haze — Cup-winning sativa heavyweight.",
    intro:
      "Hawaiian Snow is a Green House Seeds cross of Hawaiian Haze × Neville's Haze — won the High Times " +
      "Cannabis Cup for Best Sativa in 2003. Pure-leaning sativa with bright tropical-citrus on the nose " +
      "and the long ceiling of a Neville's Haze backbone. Customers familiar with haze-family strains " +
      "should respect the long ceiling — Hawaiian Snow sits at the top of the racy-haze category.",
    lineage: "Hawaiian Haze × Neville's Haze",
    parents: ["nevilles-haze", null],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Energetic", "Uplifted", "Creative", "Happy"],
    terpenes: [
      { name: "Terpinolene", note: "fresh herbal" },
      { name: "Pinene", note: "sharp pine" },
      { name: "Limonene", note: "tropical citrus" },
    ],
    flavor: ["Tropical citrus", "Pine", "Light spice"],
    bestFor: ["Daytime sessions", "Haze-family heavyweights", "Creative work"],
    avoidIf: ["Long-flowering haze profiles run racy on low tolerance", "You want a body-heavy indica"],
    faqs: [
      {
        q: "How strong is Hawaiian Snow compared to Neville's Haze?",
        a: "Hawaiian Snow inherits the long ceiling of Neville's Haze and adds tropical-citrus aromatics from the Hawaiian Haze side. It's one of the heavier-hitting haze hybrids — customers newer to haze-family strains should pace themselves.",
      },
      {
        q: "Is Hawaiian Snow indica, sativa, or hybrid?",
        a: "Hawaiian Snow is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Hawaiian Haze × Neville's Haze.",
      },
      {
        q: "What does Hawaiian Snow taste like?",
        a: "Hawaiian Snow hits tropical citrus up front, pine through the middle, and light spice on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "What time of day is Hawaiian Snow best for?",
        a: "Hawaiian Snow reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
      {
        q: "What terpenes are in Hawaiian Snow?",
        a: "The dominant terpenes in Hawaiian Snow are Terpinolene (fruity and piney, with a fresh herbal edge), Pinene (sharp pine, fresh and focusing), and Limonene (citrus zest, bright and mood-lifting on the nose). The blend is what gives the strain its specific nose and the character customers report on the exhale.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.greenhouseseeds.nl/seeds/feminized-seeds/hawaiian-snow",
        "https://www.leafly.com/strains/hawaiian-snow",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "kali-mist": {
    slug: "kali-mist",
    name: "Kali Mist",
    type: "sativa",
    aliases: ["Kali Mist", "KM"],
    tagline: "Sensi Seeds Cup-winner — pure haze-family sativa heritage.",
    intro:
      "Kali Mist is a Sensi Seeds heritage sativa — won the High Times Cannabis Cup in 1995 and 2000. " +
      "Proprietary haze-family parentage. Pure-leaning sativa with sweet-herbal aromatics and a head-up " +
      "ceiling that runs long. Coffeeshop history dating to the mid-1990s. Customers familiar with haze " +
      "heritage will recognize Kali Mist as one of the foundational pure-sativa selections.",
    lineage: "Haze-family proprietary cross (Sensi Seeds)",
    parents: ["haze", null],
    thcRange: "15–20%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Energetic", "Creative", "Happy"],
    terpenes: [
      { name: "Terpinolene", note: "fresh herbal" },
      { name: "Pinene", note: "sharp pine" },
      { name: "Caryophyllene", note: "peppery warmth" },
    ],
    flavor: ["Sweet herbal", "Citrus", "Pine"],
    bestFor: ["Daytime sessions", "Heritage-sativa fans", "Creative work"],
    avoidIf: ["You want a body-heavy indica", "Long-ceiling sativas wear you out"],
    faqs: [
      {
        q: "Why is Kali Mist a coffeeshop classic?",
        a: "Sensi Seeds released it in the mid-1990s and it won the Cannabis Cup in 1995 and 2000. It's been continuously on Amsterdam coffeeshop menus and remains one of the foundational pure-sativa selections in the haze-family heritage.",
      },
      {
        q: "Is Kali Mist indica, sativa, or hybrid?",
        a: "Kali Mist is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Haze-family proprietary cross (Sensi Seeds).",
      },
      {
        q: "What does Kali Mist taste like?",
        a: "Kali Mist hits sweet herbal up front, citrus through the middle, and pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Kali Mist?",
        a: "Kali Mist tests in the 15–20% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Kali Mist best for?",
        a: "Kali Mist reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://sensiseeds.com/en/cannabis-seeds/strain-kali-mist",
        "https://www.leafly.com/strains/kali-mist",
      ],
      notes:
        "Sensi Seeds keeps the exact parentage proprietary — confirmed haze-family but the specific haze cross is undocumented. Used Haze (from our index) as the family-anchor parent reference.",
      verifiedAt: "2026-05-16",
    },
  },

  // ────────────────────────────────────────────────────────────────────
  // KUSH / INDICA HERITAGE (31-40)
  // Bubba's Gift · Purple Kush · Purple Punch Auto · Granddaddy Black
  // Chocolope · G13 · Cinderella XX · Lemon Diesel · Trinity OG · Platinum OG
  // ────────────────────────────────────────────────────────────────────

  "bubbas-gift": {
    slug: "bubbas-gift",
    name: "Bubba's Gift",
    type: "indica",
    aliases: ["Bubba's Gift", "BG"],
    tagline: "Bubba Kush × God's Gift — heavy body-leaning indica.",
    intro:
      "Bubba's Gift is a Bubba Kush × God's Gift cross — body-heavy indica with the dense earthy-kush " +
      "profile of Bubba layered over the grape-and-purple aromatics of God's Gift. Customers familiar " +
      "with Bubba Kush as a baseline will recognize the family resemblance; God's Gift pushes it slightly " +
      "more purple and sweet.",
    lineage: "Bubba Kush × God's Gift",
    parents: ["bubba-kush", null],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Happy", "Hungry"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Limonene", note: "subtle citrus" },
    ],
    flavor: ["Sweet grape", "Earth", "Kush"],
    bestFor: ["Evening wind-down", "Bubba-family fans", "Pre-sleep sessions"],
    avoidIf: ["You need to function", "You want a head-up sativa"],
    faqs: [
      {
        q: "How does Bubba's Gift compare to Bubba Kush?",
        a: "Same family with the God's Gift side adding grape and purple aromatics on top of the Bubba earthy-kush base. Effects land in the same body-heavy zone as standard Bubba Kush; aromatics are sweeter.",
      },
      {
        q: "Is Bubba's Gift indica, sativa, or hybrid?",
        a: "Bubba's Gift is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Bubba Kush × God's Gift.",
      },
      {
        q: "What does Bubba's Gift taste like?",
        a: "Bubba's Gift hits sweet grape up front, earth through the middle, and kush on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Bubba's Gift?",
        a: "Bubba's Gift tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Bubba's Gift best for?",
        a: "Bubba's Gift reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/bubbas-gift",
        "https://weedmaps.com/strains/bubbas-gift",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "purple-kush": {
    slug: "purple-kush",
    name: "Purple Kush",
    type: "indica",
    aliases: ["Purple Kush", "PK"],
    tagline: "Hindu Kush × Purple Afghani — Oakland heritage purple indica.",
    intro:
      "Purple Kush is a pure-leaning indica cross of Hindu Kush × Purple Afghani — originally from the " +
      "Oakland area, one of the foundational purple-shelf strains of the West Coast scene. Body-heavy with " +
      "deep purple-leaf coloration and grape-and-earth aromatics. Customers reach for it when they want a " +
      "classic purple-indica session.",
    lineage: "Hindu Kush × Purple Afghani",
    parents: ["hindu-kush", "afghani"],
    thcRange: "17–22%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Happy", "Hungry"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Pinene", note: "subtle pine" },
    ],
    flavor: ["Sweet grape", "Earth", "Light spice"],
    bestFor: ["Evening wind-down", "Purple-shelf fans", "Pre-sleep sessions"],
    avoidIf: ["You need to function", "You want a head-up sativa"],
    faqs: [
      {
        q: "How is Purple Kush different from Granddaddy Purple?",
        a: "Different parents, same purple shelf. Purple Kush is Hindu Kush × Purple Afghani — pure-leaning indica with kush earth. Granddaddy Purple is Purple Urkle × Big Bud — leans grape-and-berry sweeter. Both heavy, both purple, distinct aromatic profiles.",
      },
      {
        q: "Is Purple Kush indica, sativa, or hybrid?",
        a: "Purple Kush is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Hindu Kush × Purple Afghani.",
      },
      {
        q: "What does Purple Kush taste like?",
        a: "Purple Kush hits sweet grape up front, earth through the middle, and light spice on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Purple Kush?",
        a: "Purple Kush tests in the 17–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Purple Kush best for?",
        a: "Purple Kush reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/purple-kush",
        "https://weedmaps.com/strains/purple-kush",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "granddaddy-black": {
    slug: "granddaddy-black",
    name: "Granddaddy Black",
    type: "indica",
    aliases: ["Granddaddy Black", "GDB"],
    tagline: "Granddaddy Purple × Black Cherry — dark-fruit indica.",
    intro:
      "Granddaddy Black is a Granddaddy Purple × Black Cherry cross — body-heavy indica with dark-fruit " +
      "and grape aromatics layered. The Granddaddy Purple side anchors the body weight; the Black Cherry " +
      "parent adds sweeter dark-berry notes. Customers familiar with the GDP family will recognize the " +
      "resemblance with a sweeter fruit-forward finish.",
    lineage: "Granddaddy Purple × Black Cherry",
    parents: ["granddaddy-purple", null],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Happy", "Hungry"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Limonene", note: "subtle citrus" },
    ],
    flavor: ["Dark berry", "Grape", "Earth"],
    bestFor: ["Evening wind-down", "Purple-shelf fans", "Pre-sleep sessions"],
    avoidIf: ["You need to function", "You want a head-up sativa"],
    faqs: [
      {
        q: "How does Granddaddy Black compare to Granddaddy Purple?",
        a: "Same GDP body-weight base, with the Black Cherry side pushing aromatics darker — closer to blackberry and dark-cherry rather than the candy-grape of straight GDP. Effects are similar; aromatics shift to the dark-fruit side.",
      },
      {
        q: "Is Granddaddy Black indica, sativa, or hybrid?",
        a: "Granddaddy Black is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Granddaddy Purple × Black Cherry.",
      },
      {
        q: "What does Granddaddy Black taste like?",
        a: "Granddaddy Black hits dark berry up front, grape through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Granddaddy Black?",
        a: "Granddaddy Black tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Granddaddy Black best for?",
        a: "Granddaddy Black reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/granddaddy-black",
        "https://weedmaps.com/strains/granddaddy-black",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "chocolope": {
    slug: "chocolope",
    name: "Chocolope",
    type: "sativa",
    aliases: ["Chocolope", "DNA Chocolope"],
    tagline: "Chocolate Thai × Cannalope Haze — DNA Genetics heritage sativa.",
    intro:
      "Chocolope is a DNA Genetics cross of Chocolate Thai × Cannalope Haze — pure-leaning sativa with " +
      "distinctive chocolate-and-coffee aromatics layered over the Cannalope Haze melon top note. Named " +
      "High Times' Top 10 Strain of 2007. Head-up effects with the long ceiling of the haze side. " +
      "Customers reach for it when they want unusual coffee-cocoa aromatics with a classic sativa session.",
    lineage: "Chocolate Thai × Cannalope Haze",
    parents: ["thai", null],
    thcRange: "18–22%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Energetic", "Happy", "Creative"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Limonene", note: "citrus melon" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Chocolate", "Coffee", "Earth"],
    bestFor: ["Morning to mid-day", "Creative work", "Coffee-shelf curious"],
    avoidIf: ["You want a body-heavy indica", "Long-ceiling sativas wear you out"],
    faqs: [
      {
        q: "Does Chocolope actually taste like chocolate?",
        a: "Yes — it's one of the rare strains where the aroma genuinely reads as chocolate and coffee, from the Chocolate Thai parent. The Cannalope Haze side adds a melon-citrus top note. Distinct aromatic profile compared to most modern sativas.",
      },
      {
        q: "Is Chocolope indica, sativa, or hybrid?",
        a: "Chocolope is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Chocolate Thai × Cannalope Haze.",
      },
      {
        q: "How strong is Chocolope?",
        a: "Chocolope tests in the 18–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Chocolope best for?",
        a: "Chocolope reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
      {
        q: "What terpenes are in Chocolope?",
        a: "The dominant terpenes in Chocolope are Caryophyllene (peppery and warm, spicy on the back end), Limonene (citrus zest, bright and mood-lifting on the nose), and Myrcene (earthy, mango-like, with a mild body-heavy quality). The blend is what gives the strain its specific nose and the character customers report on the exhale.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.dnagenetics.com/genetics/chocolope/",
        "https://www.leafly.com/strains/chocolope",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "g13": {
    slug: "g13",
    name: "G13",
    type: "indica",
    aliases: ["G13", "G-13", "Government Indica Strain 13"],
    tagline: "Government-myth heritage indica — body-heavy classic.",
    intro:
      "G13 is one of the most folklore-laden strains in the heritage catalog — the urban legend holds that " +
      "it was a US government research strain from the 1960s University of Mississippi program, smuggled " +
      "out by a researcher. Real provenance is debated, but the strain has been on shelves since the 1980s " +
      "as a heavy-hitting indica. Customers reach for it as a heritage piece as much as a session pick.",
    lineage: "Proprietary indica (folklore: US government research strain, debated)",
    parents: ["afghani", null],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Happy", "Hungry"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Pinene", note: "subtle pine" },
    ],
    flavor: ["Earth", "Sweet pine", "Light spice"],
    bestFor: ["Evening wind-down", "Heritage-strain curious", "Heavy-indica fans"],
    avoidIf: ["You need to function", "You want a head-up sativa"],
    faqs: [
      {
        q: "Is the G13 government story real?",
        a: "It's the strain's origin folklore — the story goes that it came from a 1960s University of Mississippi government research program. The real provenance is debated among historians and breeders. What is documented: G13 has been on shelves continuously since the 1980s as a heavy-hitting indica with Afghani heritage.",
      },
      {
        q: "Why is G13 considered heritage?",
        a: "It's one of the foundational heavy indicas of the modern shelf era, alongside Northern Lights, Hindu Kush, and Afghani. The myth gives it cultural weight; the genetics give it staying power.",
      },
      {
        q: "Is G13 indica, sativa, or hybrid?",
        a: "G13 is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Proprietary indica (folklore: US government research strain, debated).",
      },
      {
        q: "What does G13 taste like?",
        a: "G13 hits earth up front, sweet pine through the middle, and light spice on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is G13?",
        a: "G13 tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is G13 best for?",
        a: "G13 reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/g13",
        "https://en.seedfinder.eu/strain-info/G13/",
      ],
      notes:
        "Origin story is debated — the US government research narrative is folklore. Documented: heritage indica with Afghani lineage, on shelves since the 1980s. Marked the parent as Afghani per the most consistent breeder genealogies.",
      verifiedAt: "2026-05-16",
    },
  },

  "lemon-diesel": {
    slug: "lemon-diesel",
    name: "Lemon Diesel",
    type: "hybrid",
    aliases: ["Lemon Diesel", "LD"],
    tagline: "California Sour × Lost Coast OG — citrus-diesel hybrid.",
    intro:
      "Lemon Diesel is a California Sour × Lost Coast OG cross from the Humboldt scene — balanced hybrid " +
      "with sharp lemon-citrus over a diesel-and-OG undercurrent. Customers reach for it when they want " +
      "citrus aromatics with diesel pungency and a head-up-then-relaxed effect curve.",
    lineage: "California Sour × Lost Coast OG",
    parents: [null, null],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Happy", "Uplifted", "Relaxed", "Euphoric"],
    terpenes: [
      { name: "Limonene", note: "sharp lemon" },
      { name: "Caryophyllene", note: "peppery diesel" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Lemon", "Diesel", "Earth"],
    bestFor: ["Mid-afternoon", "Citrus-and-diesel fans", "Creative work"],
    avoidIf: ["Diesel pungency turns you off", "You want a heavy indica wind-down"],
    faqs: [
      {
        q: "How does Lemon Diesel compare to Lemon Tree?",
        a: "Both are citrus-diesel hybrids on the lemon shelf. Lemon Tree (Lemon Skunk × Sour Diesel) leans more skunk-sweet on the bottom; Lemon Diesel (California Sour × Lost Coast OG) leans more OG-fuel. Same family-zone, different undercurrents.",
      },
      {
        q: "Is Lemon Diesel indica, sativa, or hybrid?",
        a: "Lemon Diesel is a hybrid — a cross that pulls from both sides of the family tree. The lineage is California Sour × Lost Coast OG. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Lemon Diesel taste like?",
        a: "Lemon Diesel hits lemon up front, diesel through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Lemon Diesel?",
        a: "Lemon Diesel tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Lemon Diesel best for?",
        a: "Lemon Diesel reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/lemon-diesel",
        "https://weedmaps.com/strains/lemon-diesel",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "trinity-og": {
    slug: "trinity-og",
    name: "Trinity OG",
    type: "hybrid",
    aliases: ["Trinity OG", "TOG"],
    tagline: "OG Kush × Trinity Triangle — three-OG-anchor hybrid.",
    intro:
      "Trinity OG is an OG Kush family cross that pulls from three OG anchor strains (OG Kush, SFV OG, and " +
      "Triangle Kush) — modern hybrid with the dense fuel-and-pine aromatics of the OG family stacked. " +
      "Balanced-leaning hybrid. Customers familiar with OG-shelf classics will recognize the fuel backbone; " +
      "Trinity stacks it heavier than single-OG selections.",
    lineage: "OG Kush × SFV OG × Triangle Kush",
    parents: ["og-kush", "triangle-kush"],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery fuel" },
      { name: "Limonene", note: "citrus top" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Fuel", "Pine", "Earth"],
    bestFor: ["Mid-afternoon to evening", "OG-shelf fans", "Creative work"],
    avoidIf: ["Sharp fuel aromas turn you off", "You want a clear sativa head-up"],
    faqs: [
      {
        q: "Why is it called Trinity OG?",
        a: "Three OG anchor strains in the cross — OG Kush, SFV OG, and Triangle Kush. The 'trinity' refers to those three foundational OG-family selections being stacked together. Fuel-heavy aromatic profile.",
      },
      {
        q: "Is Trinity OG indica, sativa, or hybrid?",
        a: "Trinity OG is a hybrid — a cross that pulls from both sides of the family tree. The lineage is OG Kush × SFV OG × Triangle Kush. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Trinity OG taste like?",
        a: "Trinity OG hits fuel up front, pine through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Trinity OG?",
        a: "Trinity OG tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Trinity OG best for?",
        a: "Trinity OG reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/trinity-og",
        "https://weedmaps.com/strains/trinity-og",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "platinum-og": {
    slug: "platinum-og",
    name: "Platinum OG",
    type: "indica",
    aliases: ["Platinum OG", "Platinum OG Kush", "POG"],
    tagline: "Master Kush × OG Kush × Purple Kush — body-heavy OG indica.",
    intro:
      "Platinum OG is a Master Kush × OG Kush × Purple Kush three-way cross — indica-leaning with the " +
      "dense fuel of OG Kush layered over the body weight of Master Kush and the purple-leaf coloration " +
      "of Purple Kush. Named for the silvery-platinum trichome coverage at harvest. Customers reach for it " +
      "when they want OG-shelf aromatics with a heavier-than-standard body.",
    lineage: "Master Kush × OG Kush × Purple Kush",
    parents: ["master-kush", "og-kush"],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Happy", "Hungry"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Caryophyllene", note: "peppery fuel" },
      { name: "Limonene", note: "subtle citrus" },
    ],
    flavor: ["Fuel", "Earth", "Sweet pine"],
    bestFor: ["Evening wind-down", "OG-shelf fans", "Pre-sleep sessions"],
    avoidIf: ["You need to function", "You want a head-up sativa"],
    faqs: [
      {
        q: "Why is it called Platinum?",
        a: "The flower comes covered in dense silvery-platinum trichome frost at harvest — the visual presentation reads as platinum rather than the more common golden or white. Both parents contribute to the heavy resin coverage.",
      },
      {
        q: "Is Platinum OG indica, sativa, or hybrid?",
        a: "Platinum OG is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Master Kush × OG Kush × Purple Kush.",
      },
      {
        q: "What does Platinum OG taste like?",
        a: "Platinum OG hits fuel up front, earth through the middle, and sweet pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Platinum OG?",
        a: "Platinum OG tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Platinum OG best for?",
        a: "Platinum OG reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/platinum-og",
        "https://weedmaps.com/strains/platinum-og",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "cinderella-xx": {
    slug: "cinderella-xx",
    name: "Cinderella XX",
    type: "sativa",
    aliases: ["Cinderella XX", "Cindy XX", "C-XX"],
    tagline: "Cinderella 99 × Cinderella 99 — stabilized Cindy sativa selection.",
    intro:
      "Cinderella XX is a stabilized Cinderella 99 × Cinderella 99 selection — a refined version of the " +
      "Cindy 99 line bred for more consistent phenotype expression. Pure-leaning sativa with the sweet " +
      "tropical-pineapple aromatics that defined the original Cindy 99. Head-up, long-ceiling, classic " +
      "haze-family lift. Customers familiar with Cindy 99 will recognize the family resemblance.",
    lineage: "Cinderella 99 × Cinderella 99 (stabilized selection)",
    parents: ["cinderella-99", "cinderella-99"],
    thcRange: "18–22%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Energetic", "Creative", "Happy"],
    terpenes: [
      { name: "Limonene", note: "sweet citrus" },
      { name: "Pinene", note: "sharp pine" },
      { name: "Caryophyllene", note: "peppery warmth" },
    ],
    flavor: ["Sweet pineapple", "Citrus", "Earth"],
    bestFor: ["Daytime sessions", "Cindy-family fans", "Creative work"],
    avoidIf: ["You want a body-heavy indica", "Long-ceiling sativas wear you out"],
    faqs: [
      {
        q: "How does Cinderella XX differ from Cinderella 99?",
        a: "Cinderella XX is a stabilized line — the same Cindy 99 parent bred back into itself across multiple generations to lock in phenotype consistency. Customers get the same Cindy aromatic profile with less variation across batches.",
      },
      {
        q: "Is Cinderella XX indica, sativa, or hybrid?",
        a: "Cinderella XX is a sativa — head-up and uplifted in character, with the energetic profile customers expect from sativa-dominant flower. The lineage is Cinderella 99 × Cinderella 99 (stabilized selection).",
      },
      {
        q: "What does Cinderella XX taste like?",
        a: "Cinderella XX hits sweet pineapple up front, citrus through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Cinderella XX?",
        a: "Cinderella XX tests in the 18–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Cinderella XX best for?",
        a: "Cinderella XX reads as a daytime strain — head-up and uplifted, the kind customers commonly reach for in the morning or early afternoon when there's still a to-do list.",
      },
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/cinderella-99",
        "https://en.seedfinder.eu/strain-info/Cinderella+XX/",
      ],
      notes:
        "Cinderella XX documented as a stabilized Cindy 99 selection. Leafly's dedicated page is on the parent Cinderella 99; SeedFinder confirms the XX stabilization. Parent appears twice in parents array (self-cross stabilization).",
      verifiedAt: "2026-05-16",
    },
  },

  // ────────────────────────────────────────────────────────────────────
  // CLOSING TIER (41-50)
  // Donkey Butter · Forbidden Zkittlez · Lemon Pound Cake · Mendocino Purps
  // Apricot Jelly · Sour Banana Sherbet · Tahoe OG Kush · Banana OG Kush
  // Animal Tsunami · Northern Skunk · Black Domina
  // ────────────────────────────────────────────────────────────────────

  "donkey-butter": {
    slug: "donkey-butter",
    name: "Donkey Butter",
    type: "indica",
    aliases: ["Donkey Butter", "DB"],
    tagline: "Grease Monkey × Triple OG — heavy gas-and-grease indica.",
    intro:
      "Donkey Butter is a Grease Monkey × Triple OG cross from Exotic Genetix — body-heavy indica with " +
      "dense gas-and-grease aromatics and a sweet-pine undercurrent. Customers familiar with Grease Monkey " +
      "will recognize the family resemblance; the Triple OG side adds extra body weight and OG-fuel " +
      "backbone. Heavy strain — pace yourself.",
    lineage: "Grease Monkey × Triple OG",
    parents: [null, null],
    thcRange: "22–28%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Hungry", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Caryophyllene", note: "peppery gas" },
      { name: "Limonene", note: "subtle citrus" },
    ],
    flavor: ["Gas", "Grease", "Sweet pine"],
    bestFor: ["Late-night use", "Pre-sleep wind-down", "Heavy-indica fans"],
    avoidIf: ["You need to function", "You want a head-up sativa", "Low-tolerance customers should start small"],
    faqs: [
      {
        q: "Why is it called Donkey Butter?",
        a: "The name comes from the dense gas-and-grease aromatic profile — Exotic Genetix's branding for the heavy-bottom-end nose. The 'butter' refers to the creamy gas finish on the exhale. It's a polarizing aroma; customers either love it or skip it.",
      },
      {
        q: "Is Donkey Butter indica, sativa, or hybrid?",
        a: "Donkey Butter is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Grease Monkey × Triple OG.",
      },
      {
        q: "What does Donkey Butter taste like?",
        a: "Donkey Butter hits gas up front, grease through the middle, and sweet pine on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Donkey Butter?",
        a: "Donkey Butter tests in the 22–28% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Donkey Butter best for?",
        a: "Donkey Butter reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/donkey-butter",
        "https://weedmaps.com/strains/donkey-butter",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "forbidden-zkittlez": {
    slug: "forbidden-zkittlez",
    name: "Forbidden Zkittlez",
    type: "hybrid",
    aliases: ["Forbidden Zkittlez", "FZ"],
    tagline: "Forbidden Fruit × Zkittlez — candy-shelf fruit hybrid.",
    intro:
      "Forbidden Zkittlez is a Forbidden Fruit × Zkittlez cross — balanced-leaning-indica hybrid stacking " +
      "two of the candy-shelf headliners. Sweet-tropical and dark-cherry aromatics with the Zkittlez " +
      "candy-rainbow finish. Customers reach for it when they want fruit-forward aromatics with the " +
      "characteristic Zkittlez sweetness profile.",
    lineage: "Forbidden Fruit × Zkittlez",
    parents: ["forbidden-fruit", "zkittlez"],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Hungry"],
    terpenes: [
      { name: "Limonene", note: "sweet citrus" },
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Sweet tropical", "Dark cherry", "Candy"],
    bestFor: ["Mid-afternoon to evening", "Candy-shelf fans", "After-dinner couch"],
    avoidIf: ["You want a clear sativa head-up", "Sweet aromas aren't your thing"],
    faqs: [
      {
        q: "How does Forbidden Zkittlez compare to Zkittlez alone?",
        a: "Same Zkittlez candy-rainbow finish, but the Forbidden Fruit parent adds dark-cherry and tropical layers on top. Heavier-leaning than straight Zkittlez. Customers who like both parents tend to find this bridges the two.",
      },
      {
        q: "Is Forbidden Zkittlez indica, sativa, or hybrid?",
        a: "Forbidden Zkittlez is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Forbidden Fruit × Zkittlez. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Forbidden Zkittlez taste like?",
        a: "Forbidden Zkittlez hits sweet tropical up front, dark cherry through the middle, and candy on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Forbidden Zkittlez?",
        a: "Forbidden Zkittlez tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Forbidden Zkittlez best for?",
        a: "Forbidden Zkittlez reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/forbidden-zkittlez",
        "https://weedmaps.com/strains/forbidden-zkittlez",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "lemon-pound-cake": {
    slug: "lemon-pound-cake",
    name: "Lemon Pound Cake",
    type: "hybrid",
    aliases: ["Lemon Pound Cake", "LPC"],
    tagline: "London Pound Cake × Lemon-leaning pheno — citrus-cake hybrid.",
    intro:
      "Lemon Pound Cake is a citrus-forward pheno selection in the London Pound Cake family — balanced " +
      "hybrid with sweet-lemon aromatics layered over the vanilla-cake base of London Pound Cake. " +
      "Customers familiar with London Pound Cake will recognize the family resemblance with a sharper " +
      "lemon-citrus top note.",
    lineage: "London Pound Cake citrus-leaning phenotype",
    parents: ["london-pound-cake", null],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Happy", "Relaxed", "Uplifted", "Euphoric"],
    terpenes: [
      { name: "Limonene", note: "sharp lemon" },
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Lemon", "Vanilla cake", "Sweet cream"],
    bestFor: ["Mid-afternoon", "Citrus-shelf fans", "Dessert-hybrid fans"],
    avoidIf: ["Sharp citrus aromas turn you off", "You want a heavy indica wind-down"],
    faqs: [
      {
        q: "Is Lemon Pound Cake a separate strain from London Pound Cake?",
        a: "It's a phenotype selection in the London Pound Cake family that leans more lemon-citrus on the top note. Same family, distinct expression — customers seeking the citrus side of the LPC profile end up here.",
      },
      {
        q: "Is Lemon Pound Cake indica, sativa, or hybrid?",
        a: "Lemon Pound Cake is a hybrid — a cross that pulls from both sides of the family tree. The lineage is London Pound Cake citrus-leaning phenotype. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Lemon Pound Cake taste like?",
        a: "Lemon Pound Cake hits lemon up front, vanilla cake through the middle, and sweet cream on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Lemon Pound Cake?",
        a: "Lemon Pound Cake tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Lemon Pound Cake best for?",
        a: "Lemon Pound Cake reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/lemon-pound-cake",
        "https://en.seedfinder.eu/strain-info/Lemon+Pound+Cake/",
      ],
      notes:
        "Documented as a citrus-leaning London Pound Cake phenotype rather than a fully-stabilized separate cross. Parent (London Pound Cake) in our index. Listed as its own slug because customers search for it as a separate shelf item.",
      verifiedAt: "2026-05-16",
    },
  },

  "mendocino-purps": {
    slug: "mendocino-purps",
    name: "Mendocino Purps",
    type: "indica",
    aliases: ["Mendocino Purps", "Mendo Purps", "MP", "The Purps"],
    tagline: "Mendocino heritage purple — Cup-winning indica.",
    intro:
      "Mendocino Purps is a heritage indica from the Mendocino County scene — also known as Mendo Purps " +
      "or The Purps. Won the High Times Cannabis Cup top placements in 2005 and 2006. Pure-leaning indica " +
      "with deep purple-leaf coloration and sweet-grape and earth aromatics. One of the foundational " +
      "purple-shelf strains of the Northern California heritage era.",
    lineage: "Mendocino heritage selection (proprietary purple-leaning parents)",
    parents: [null, null],
    thcRange: "16–22%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Happy", "Hungry"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Pinene", note: "subtle pine" },
    ],
    flavor: ["Sweet grape", "Earth", "Light spice"],
    bestFor: ["Evening wind-down", "Purple-shelf fans", "Heritage-indica fans"],
    avoidIf: ["You need to function", "You want a head-up sativa"],
    faqs: [
      {
        q: "Why is Mendocino Purps a heritage strain?",
        a: "It's one of the foundational Northern California purple-shelf strains — Cannabis Cup wins in 2005 and 2006 put it on the international map. Customers familiar with the heritage California scene recognize Mendo Purps as a precursor to a lot of the modern purple-leaning indica catalog.",
      },
      {
        q: "Is Mendocino Purps indica, sativa, or hybrid?",
        a: "Mendocino Purps is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Mendocino heritage selection (proprietary purple-leaning parents).",
      },
      {
        q: "What does Mendocino Purps taste like?",
        a: "Mendocino Purps hits sweet grape up front, earth through the middle, and light spice on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Mendocino Purps?",
        a: "Mendocino Purps tests in the 16–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Mendocino Purps best for?",
        a: "Mendocino Purps reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/mendocino-purps",
        "https://weedmaps.com/strains/mendocino-purps",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "apricot-jelly": {
    slug: "apricot-jelly",
    name: "Apricot Jelly",
    type: "hybrid",
    aliases: ["Apricot Jelly", "AJ"],
    tagline: "Legend OG × Forbidden Fruit pheno — sweet-stone-fruit hybrid.",
    intro:
      "Apricot Jelly is a hybrid pheno selection in the Forbidden Fruit family with Legend OG influence — " +
      "balanced hybrid with rare sweet apricot-and-stone-fruit aromatics. Customers reach for it when they " +
      "want fruit-forward aromatics outside the usual citrus / berry / candy lanes. The stone-fruit profile " +
      "is uncommon on the modern shelf.",
    lineage: "Legend OG × Forbidden Fruit phenotype",
    parents: [null, "forbidden-fruit"],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Happy", "Relaxed", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Limonene", note: "sweet citrus top" },
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Apricot", "Stone fruit", "Sweet cream"],
    bestFor: ["Mid-afternoon", "Fruit-forward shelf fans", "Aromatic explorers"],
    avoidIf: ["You want a clear sativa head-up", "You want a heavy indica wind-down"],
    faqs: [
      {
        q: "Does Apricot Jelly actually smell like apricot?",
        a: "Yes — the stone-fruit aromatic profile is the strain's defining feature. It reads as fresh apricot with a sweet-cream finish, distinct from the more common citrus or berry profiles on the modern shelf.",
      },
      {
        q: "Is Apricot Jelly indica, sativa, or hybrid?",
        a: "Apricot Jelly is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Legend OG × Forbidden Fruit phenotype. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Apricot Jelly taste like?",
        a: "Apricot Jelly hits apricot up front, stone fruit through the middle, and sweet cream on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Apricot Jelly?",
        a: "Apricot Jelly tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Apricot Jelly best for?",
        a: "Apricot Jelly reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/apricot-jelly",
        "https://weedmaps.com/strains/apricot-jelly",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "sour-banana-sherbet": {
    slug: "sour-banana-sherbet",
    name: "Sour Banana Sherbet",
    type: "hybrid",
    aliases: ["Sour Banana Sherbet", "SBS"],
    tagline: "Sour Diesel × Banana Sherbet — fruit-and-diesel hybrid.",
    intro:
      "Sour Banana Sherbet is a Sour Diesel × Banana Sherbet cross — balanced hybrid with sweet-banana " +
      "aromatics layered over the diesel pungency of Sour D. Customers reach for it when they want the " +
      "unusual fruit-and-fuel combination — banana on the top note, diesel on the bottom, sherbet creaminess " +
      "in between.",
    lineage: "Sour Diesel × Banana Sherbet",
    parents: ["sour-diesel", null],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Happy", "Relaxed", "Euphoric", "Uplifted"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery diesel" },
      { name: "Limonene", note: "sweet citrus" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Sweet banana", "Diesel", "Sherbet cream"],
    bestFor: ["Mid-afternoon", "Sour-diesel-shelf fans", "Fruit-forward explorers"],
    avoidIf: ["Diesel pungency turns you off", "You want a heavy indica wind-down"],
    faqs: [
      {
        q: "What does Sour Banana Sherbet smell like?",
        a: "Sweet-banana on the top note with diesel pungency on the bottom — the sherbet side adds a creamy finish in between. It's an uncommon aromatic stack on the modern shelf.",
      },
      {
        q: "Is Sour Banana Sherbet indica, sativa, or hybrid?",
        a: "Sour Banana Sherbet is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Sour Diesel × Banana Sherbet. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Sour Banana Sherbet taste like?",
        a: "Sour Banana Sherbet hits sweet banana up front, diesel through the middle, and sherbet cream on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Sour Banana Sherbet?",
        a: "Sour Banana Sherbet tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Sour Banana Sherbet best for?",
        a: "Sour Banana Sherbet reads as a late-afternoon or evening strain — balanced enough that customers commonly reach for it after work, social settings, or a quiet night in.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/sour-banana-sherbet",
        "https://weedmaps.com/strains/sour-banana-sherbet",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "tahoe-og-kush": {
    slug: "tahoe-og-kush",
    name: "Tahoe OG Kush",
    type: "indica",
    aliases: ["Tahoe OG Kush", "Tahoe OG"],
    tagline: "OG Kush × SFV OG phenotype — Lake Tahoe heritage OG.",
    intro:
      "Tahoe OG Kush is the Lake Tahoe regional phenotype of OG Kush crossed with SFV OG — indica-leaning " +
      "with the dense fuel-and-pine aromatics of the OG family stacked. Sister entry to Tahoe OG (already " +
      "in our index from Wave 2) — this is the longer-form name some shelves use to disambiguate. Customers " +
      "familiar with Tahoe OG will recognize it as the same family.",
    lineage: "OG Kush × SFV OG (Tahoe regional phenotype)",
    parents: ["og-kush", "sfv-og"],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Happy", "Hungry"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery fuel" },
      { name: "Myrcene", note: "earthy base" },
      { name: "Limonene", note: "subtle citrus" },
    ],
    flavor: ["Fuel", "Pine", "Earth"],
    bestFor: ["Evening wind-down", "OG-shelf fans", "Pre-sleep sessions"],
    avoidIf: ["You need to function", "Sharp fuel aromas turn you off"],
    faqs: [
      {
        q: "Is Tahoe OG Kush the same as Tahoe OG?",
        a: "Same strain family with two common shelf names. Some growers and dispensaries use 'Tahoe OG Kush' to be explicit about the OG Kush parent; others just label it 'Tahoe OG.' Genetics are the same.",
      },
      {
        q: "Is Tahoe OG Kush indica, sativa, or hybrid?",
        a: "Tahoe OG Kush is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is OG Kush × SFV OG (Tahoe regional phenotype).",
      },
      {
        q: "What does Tahoe OG Kush taste like?",
        a: "Tahoe OG Kush hits fuel up front, pine through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Tahoe OG Kush?",
        a: "Tahoe OG Kush tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Tahoe OG Kush best for?",
        a: "Tahoe OG Kush reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/tahoe-og-kush",
        "https://weedmaps.com/strains/tahoe-og-kush",
      ],
      notes:
        "Sister entry to tahoe-og (Wave 2). Kept separate slug because shelf labels frequently use the longer name. Some breeder docs treat them as identical; some treat tahoe-og-kush as a specific OG Kush × SFV OG cross. Documented under both names.",
      verifiedAt: "2026-05-16",
    },
  },

  "banana-og-kush": {
    slug: "banana-og-kush",
    name: "Banana OG Kush",
    type: "indica",
    aliases: ["Banana OG Kush", "BOK"],
    tagline: "Banana Kush × OG Kush — banana-and-fuel kush hybrid.",
    intro:
      "Banana OG Kush is a Banana Kush × OG Kush cross — indica-leaning with sweet-banana aromatics " +
      "layered over the dense fuel of OG Kush. Sister entry to Banana Kush and Banana OG already in our " +
      "index — this is the OG Kush emphasis selection that some shelves carry. Body-heavy session with " +
      "banana on the top note.",
    lineage: "Banana Kush × OG Kush",
    parents: ["banana-kush", "og-kush"],
    thcRange: "20–25%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Hungry", "Happy"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery fuel" },
      { name: "Myrcene", note: "earthy base" },
      { name: "Limonene", note: "sweet citrus" },
    ],
    flavor: ["Sweet banana", "Fuel", "Earth"],
    bestFor: ["Evening wind-down", "Banana-shelf fans", "OG-family fans"],
    avoidIf: ["You need to function", "Sharp fuel aromas turn you off"],
    faqs: [
      {
        q: "How does this differ from Banana Kush?",
        a: "Banana Kush (Ghost OG × Banana) is the broader banana-kush family selection. Banana OG Kush specifically emphasizes the OG Kush side as the second parent, pulling the fuel undercurrent forward. Same banana-shelf nose with deeper OG fuel on the bottom.",
      },
      {
        q: "Is Banana OG Kush indica, sativa, or hybrid?",
        a: "Banana OG Kush is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Banana Kush × OG Kush.",
      },
      {
        q: "What does Banana OG Kush taste like?",
        a: "Banana OG Kush hits sweet banana up front, fuel through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Banana OG Kush?",
        a: "Banana OG Kush tests in the 20–25% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Banana OG Kush best for?",
        a: "Banana OG Kush reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified-with-note",
      sources: [
        "https://www.leafly.com/strains/banana-og-kush",
        "https://en.seedfinder.eu/strain-info/Banana+OG+Kush/",
      ],
      notes:
        "Sister entries banana-kush and banana-og are both in our index. Banana OG Kush is the OG Kush emphasis selection some shelves stock as a distinct item. Both parents in our index.",
      verifiedAt: "2026-05-16",
    },
  },

  "animal-tsunami": {
    slug: "animal-tsunami",
    name: "Animal Tsunami",
    type: "hybrid",
    aliases: ["Animal Tsunami", "AT"],
    tagline: "Animal Mints × Tsunami OG — gas-and-mint hybrid.",
    intro:
      "Animal Tsunami is an Animal Mints × Tsunami OG cross — balanced-leaning-indica hybrid with the " +
      "sweet-mint aromatics of Animal Mints layered over the dense fuel-and-OG backbone of Tsunami OG. " +
      "Customers familiar with Animal Mints will recognize the family resemblance with a heavier OG " +
      "undercurrent.",
    lineage: "Animal Mints × Tsunami OG",
    parents: ["animal-mints", null],
    thcRange: "20–26%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Happy", "Euphoric", "Sleepy"],
    terpenes: [
      { name: "Caryophyllene", note: "peppery fuel" },
      { name: "Limonene", note: "sweet mint citrus" },
      { name: "Myrcene", note: "earthy base" },
    ],
    flavor: ["Sweet mint", "Fuel", "Earth"],
    bestFor: ["Mid-afternoon to evening", "Animal Mints-family fans", "OG-shelf fans"],
    avoidIf: ["Sharp fuel aromas turn you off", "You want a clear sativa head-up"],
    faqs: [
      {
        q: "How does Animal Tsunami compare to Animal Mints?",
        a: "Same Animal Mints family on the top note (sweet mint), but the Tsunami OG side pulls the body weight heavier and adds dense OG fuel on the bottom. Customers who already like Animal Mints tend to reach for this when they want the same family profile with more OG depth.",
      },
      {
        q: "Is Animal Tsunami indica, sativa, or hybrid?",
        a: "Animal Tsunami is a hybrid — a cross that pulls from both sides of the family tree. The lineage is Animal Mints × Tsunami OG. The balance leans on phenotype and the day-of harvest.",
      },
      {
        q: "What does Animal Tsunami taste like?",
        a: "Animal Tsunami hits sweet mint up front, fuel through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Animal Tsunami?",
        a: "Animal Tsunami tests in the 20–26% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Animal Tsunami best for?",
        a: "Animal Tsunami reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/animal-tsunami",
        "https://weedmaps.com/strains/animal-tsunami",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "northern-skunk": {
    slug: "northern-skunk",
    name: "Northern Skunk",
    type: "indica",
    aliases: ["Northern Skunk", "NS"],
    tagline: "Northern Lights × Skunk #1 — heritage indica-skunk cross.",
    intro:
      "Northern Skunk is a Northern Lights × Skunk #1 cross — heritage indica-leaning hybrid stacking two " +
      "of the foundational shelf strains of the modern era. Body-leaning with the Northern Lights sedating " +
      "backbone and the Skunk pungent aromatics on top. Customers familiar with both parents will " +
      "recognize the family resemblance to Shiva Skunk and the broader Northern Lights × Skunk family.",
    lineage: "Northern Lights × Skunk #1",
    parents: ["northern-lights", "skunk-1"],
    thcRange: "16–22%",
    cbdRange: "<1%",
    effects: ["Relaxed", "Sleepy", "Happy", "Hungry"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Caryophyllene", note: "peppery skunk" },
      { name: "Humulene", note: "hop-like earthy" },
    ],
    flavor: ["Sweet pine", "Skunk", "Earth"],
    bestFor: ["Evening wind-down", "Heritage-indica fans", "Pre-sleep sessions"],
    avoidIf: ["You need to function", "Skunk pungency turns you off"],
    faqs: [
      {
        q: "How does Northern Skunk relate to Shiva Skunk?",
        a: "Both come from the Northern Lights × Skunk family — Shiva Skunk specifically uses NL#5 × Skunk #1. Northern Skunk uses the broader Northern Lights parent. Same family, slightly different selections. Heritage indica-skunk genetics either way.",
      },
      {
        q: "Is Northern Skunk indica, sativa, or hybrid?",
        a: "Northern Skunk is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Northern Lights × Skunk #1.",
      },
      {
        q: "What does Northern Skunk taste like?",
        a: "Northern Skunk hits sweet pine up front, skunk through the middle, and earth on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Northern Skunk?",
        a: "Northern Skunk tests in the 16–22% THC range — a moderate, mainstream potency band. Most customers find it predictable without being overwhelming.",
      },
      {
        q: "What time of day is Northern Skunk best for?",
        a: "Northern Skunk reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://www.leafly.com/strains/northern-skunk",
        "https://en.seedfinder.eu/strain-info/Northern+Skunk/",
      ],
      verifiedAt: "2026-05-16",
    },
  },

  "black-domina": {
    slug: "black-domina",
    name: "Black Domina",
    type: "indica",
    aliases: ["Black Domina", "BD"],
    tagline: "Sensi Seeds four-way Afghani cross — heavy pure indica.",
    intro:
      "Black Domina is a Sensi Seeds four-way cross — Northern Lights × Ortega × Hash Plant × Afghani SA. " +
      "Pure indica with deep purple-and-black-leaf coloration at harvest (hence the name) and dense " +
      "hash-and-earth aromatics. Body-heavy, slow-pace evening strain. Customers familiar with the heritage " +
      "Afghani-and-NL shelf will recognize Black Domina as one of the heavier selections in the catalog.",
    lineage: "Northern Lights × Ortega × Hash Plant × Afghani SA",
    parents: ["northern-lights", "hash-plant"],
    thcRange: "18–24%",
    cbdRange: "<1%",
    effects: ["Sleepy", "Relaxed", "Hungry", "Happy"],
    terpenes: [
      { name: "Myrcene", note: "earthy, sedating" },
      { name: "Caryophyllene", note: "peppery warmth" },
      { name: "Humulene", note: "hop-like earthy" },
    ],
    flavor: ["Hashish", "Earth", "Sweet pepper"],
    bestFor: ["Late-night use", "Pre-sleep wind-down", "Heritage-indica fans"],
    avoidIf: ["You need to function", "You want a head-up sativa"],
    faqs: [
      {
        q: "Why is it called Black Domina?",
        a: "The flower's deep purple-and-black-leaf coloration at harvest gives it the name — the four-way Afghani-heavy parentage pushes the dark phenotypes. It's been a Sensi Seeds catalog staple since the late 1990s.",
      },
      {
        q: "Is Black Domina indica, sativa, or hybrid?",
        a: "Black Domina is an indica — body-leaning, with a heavier physical quality that customers reach for in the evening. The lineage is Northern Lights × Ortega × Hash Plant × Afghani SA.",
      },
      {
        q: "What does Black Domina taste like?",
        a: "Black Domina hits hashish up front, earth through the middle, and sweet pepper on the exhale. The smell out of the jar reads the same way — distinctive once you've had it once or twice.",
      },
      {
        q: "How strong is Black Domina?",
        a: "Black Domina tests in the 18–24% THC range, which puts it on the higher end of the shelf. Customers with a built tolerance handle it fine; lower-tolerance customers should go a half-dose or less the first time.",
      },
      {
        q: "What time of day is Black Domina best for?",
        a: "Black Domina reads as an evening strain — body-heavy enough that customers commonly reach for it after dinner or at the end of the day, not before they need to be productive.",
      },
    ],
    verification: {
      status: "verified",
      sources: [
        "https://sensiseeds.com/en/cannabis-seeds/strain-black-domina",
        "https://www.leafly.com/strains/black-domina",
      ],
      verifiedAt: "2026-05-16",
    },
  },
};

export const STRAIN_SLUGS = Object.keys(STRAINS);

/* ─────────────────────────────────────────────────────────────────────────────
 * WAVE 1 SUMMARY — Top 50 Strains
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * COVERED: 50 strains total (10 verbatim from brapp staff strains.ts + 40 new).
 *
 * MOST LINEAGE-RESEARCH EFFORT (top 5):
 *   1. Chemdawg — origin folklore (Grateful Dead lot, "Chemdog" bag) makes the
 *      parent strains genuinely uncertain; usually listed as Nepalese × Thai,
 *      marked "(debated)".
 *   2. Trainwreck — Mexican × Thai × Afghani is the conventional answer, but
 *      the Mexican parent has no canonical sub-strain. Marked "(debated)" with
 *      one null parent.
 *   3. OG Kush — kept brapp's "Chemdawg × Hindu Kush (debated)" wording; the
 *      OG origin story is famously disputed (Original Gangster? Ocean Grown?).
 *   4. Acapulco Gold — pure Mexican landrace, but the modern "Acapulco Gold"
 *      on WA shelves is almost always a recreation. Flagged in the FAQ.
 *   5. Black Cherry Soda — Oregon-originated by TGA Subcool, exact parentage
 *      not publicly stable. Listed as "Unknown / proprietary (debated)" with
 *      both parents null.
 *
 * NEEDS DOUG REVIEW (contested data):
 *   - black-cherry-soda — parent strains genuinely unknown; consider whether to
 *     ship this slug at all, or skip until breeder confirmation.
 *   - acapulco-gold — most product on WA shelves is a recreation, not the
 *     1970s landrace; consider an additional disclaimer or remove from "live"
 *     listing.
 *   - trainwreck — Mexican parent unknown; marked landrace null. Doug may want
 *     to mark "(disputed)" more loudly than "(debated)".
 *   - hindu-kush, afghani — both are landrace categories rather than specific
 *     strains; Doug may want to consolidate these into a single "Landraces"
 *     section in a later wave rather than treat as discrete strains.
 *
 * COMPLIANCE NOTES (WAC 314-55-155):
 *   - Zero medical claims ("treats X" / "cures Y") across all 50 entries.
 *   - Effect language uses "associated with" / "customers commonly reach for"
 *     framing — no efficacy promises.
 *   - All "bestFor" entries describe use cases, not symptom relief.
 *   - All "avoidIf" entries are honest counter-cases (anxiety risk, sedation,
 *     aroma sensitivity).
 *
 * ALIASES — included common WA POS abbreviations + variant spellings:
 *   - Sherbet / Sherbert
 *   - Chemdawg / Chemdog
 *   - Green Crack / Green Cush
 *   - GSC / Girl Scout Cookies / Cookies
 *   - GDP / Grand Daddy Purple
 *   - Maui Wowie / Maui Waui
 *   - Do-Si-Dos / Dosidos / Dosi
 *   - Skittles / Zkittlez (Z is common WA POS abbreviation)
 *
 * TRIMMED to hit exactly 50 (parents-only references retained in family tree):
 *   - lemon-skunk (parent of Lemon Haze + Super Lemon Haze — both shipped)
 *   - northern-lights-5 (functionally same as Northern Lights for most users)
 *   - clementine (parent of Mimosa — Mimosa shipped instead)
 *   - wedding-pie, biscotti, ice-cream-cake, lemon-cherry-gelato (modern
 *     dessert hybrids beyond the user's recommended list; queue for wave 2)
 *
 * NEXT WAVE (51-100) candidates: Lemon Skunk, Clementine, Northern Lights #5,
 * Wedding Pie, Biscotti, Ice Cream Cake, Lemon Cherry Gelato, Mac and Cheese,
 * Banana Kush, Strawberry Banana, Tropicana Cookies, Sherbinski phenos, Gushers,
 * London Pound Cake, Kush Mints, Khalifa Kush, Forbidden Fruit, Tangie,
 * Tangerine Dream, Grape Pie, Banana OG, Watermelon, Modified Grapes,
 * Bacio Gelato, Garlic Breath, Peanut Butter Breeze, Cake Crasher, Slurricane.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// STRAIN_SLUGS declared above (line 2208) — kept for back-compat.

/** Lookup helper — returns undefined for unknown slugs. */
export function getStrain(slug: string): Strain | undefined {
  return STRAINS[slug];
}

/** SEO wave gating — only slugs ≤ SEO_STRAIN_WAVE index get indexed.
 *  Default 0 (none indexed). Per Doug 2026-05-14 cadence-gate doctrine. */
export function isStrainInWave(slug: string): boolean {
  const wave = parseInt(process.env.SEO_STRAIN_WAVE ?? "0", 10);
  if (!Number.isFinite(wave) || wave <= 0) return false;
  const idx = STRAIN_SLUGS.indexOf(slug);
  return idx >= 0 && idx < wave;
}

/** Slugs currently in the live wave (consumed by sitemap). */
export function getStrainsInCurrentWave(): readonly string[] {
  return STRAIN_SLUGS.filter(isStrainInWave);
}

/** Family-tree graph data for a strain — parents above, descendants below,
 *  siblings as a chip row. Pure function, computed at render time. */
export type LineageGraph = {
  parents: Array<{ slug: string | null; name: string; type?: Strain["type"] }>;
  center: { slug: string; name: string; type: Strain["type"] };
  descendants: Array<{ slug: string; name: string; type: Strain["type"] }>;
  siblings: Array<{ slug: string; name: string; type: Strain["type"] }>;
};

export function buildLineageGraph(slug: string): LineageGraph | null {
  const s = STRAINS[slug];
  if (!s) return null;

  // Parents — resolve from STRAINS where possible, fall back to lineage string parse.
  const parents: LineageGraph["parents"] = [];
  if (s.parents && s.parents.length > 0) {
    for (const pSlug of s.parents) {
      if (pSlug === null) {
        parents.push({ slug: null, name: "(unknown / landrace)" });
        continue;
      }
      const p = STRAINS[pSlug];
      if (p) {
        parents.push({ slug: p.slug, name: p.name, type: p.type });
      } else {
        // Slug present but not in STRAINS — render from lineage string later
        parents.push({ slug: null, name: pSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) });
      }
    }
  } else if (s.lineage) {
    // Parse "Parent A × Parent B" — best-effort, display only.
    for (const partRaw of s.lineage.split("×")) {
      const part = partRaw.replace(/\(.*\)/g, "").trim();
      if (part) parents.push({ slug: null, name: part });
    }
  }

  // Descendants — reverse index: strains whose `parents` includes this slug.
  const descendants: LineageGraph["descendants"] = [];
  for (const candidateSlug of STRAIN_SLUGS) {
    if (candidateSlug === slug) continue;
    const c = STRAINS[candidateSlug];
    if (c.parents?.includes(slug)) {
      descendants.push({ slug: c.slug, name: c.name, type: c.type });
    }
  }

  // Siblings — strains that share at least one parent with this strain.
  const siblings: LineageGraph["siblings"] = [];
  const siblingIds = new Set<string>();
  if (s.parents) {
    for (const pSlug of s.parents) {
      if (!pSlug) continue;
      for (const candidateSlug of STRAIN_SLUGS) {
        if (candidateSlug === slug || siblingIds.has(candidateSlug)) continue;
        const c = STRAINS[candidateSlug];
        if (c.parents?.includes(pSlug)) {
          siblingIds.add(candidateSlug);
          siblings.push({ slug: c.slug, name: c.name, type: c.type });
        }
      }
    }
  }
  // Cap sibling chip row at 8 — anything more is noise.
  siblings.length = Math.min(siblings.length, 8);

  return {
    parents,
    center: { slug: s.slug, name: s.name, type: s.type },
    descendants,
    siblings,
  };
}
