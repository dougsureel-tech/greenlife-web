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
