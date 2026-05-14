// /strains/[type] landing pages — SSoT for strain-category content.
//
// WAC 314-55-155 compliance lane:
//   - We describe strain CATEGORIES (indica / sativa / hybrid / cbd) in
//     descriptive, botanical, supply-chain framing only.
//   - NO efficacy/medical/promissory claims ("relaxing", "energizing",
//     "pain relief", "helps you sleep" etc.). The find-your-strain quiz
//     uses vibe labels under a different surface; these landing pages
//     are net-new SEO copy and stay strictly descriptive.
//   - "Customer feedback often describes X" is acceptable as a sourced
//     observation; "this strain will make you feel X" is not.
//
// Voice anchors (Wenatchee Valley lane):
//   - "Since 2014, same building on GS Center Road" tenure framing.
//   - "The best cannabis staff in the Wenatchee Valley" positioning
//     (per memory pin project_wenatchee_positioning_best_staff).
//   - Geography: Wenatchee Valley + nearby towns; Chelan-area visitors
//     and lake-house owner cohorts where relevant.
//   - /menu CTA ONLY (no iHJ direct, no other paths).
//   - Operator-grit tone, U+2019 apostrophes, no exclamation marks.
//
// All copy is per-type and self-contained here so the route file stays
// thin. Adding a 5th type (e.g. "high-thc" or "low-thc") = add one entry.

export type StrainType = {
  /** URL slug — also the `?strain=` value passed to /menu. */
  slug: string;
  /** Display name (title-case). */
  name: string;
  /** SERP-cap-aware meta description (~155 chars). Keep tight. */
  metaDescription: string;
  /** H1 sub-header — single descriptive phrase shown below the H1. */
  subhead: string;
  /** SEO-targeted page H2 (e.g. "Indica strains in Wenatchee Valley"). */
  h2: string;
  /** 4-6 keywords for the metadata.keywords array. */
  keywords: string[];
  /** Long-form descriptive body, split on `\n\n` for paragraph rendering.
   *  Strictly category-descriptive: lineage, terpene profile classes,
   *  shelf context, harvest timing, processing format hints. NO effect
   *  claims. */
  bodyCopy: string;
  /** 4-tile fact strip beside the body — quick scan-readable category
   *  attributes. Each tile = label + value pair, stays factual. */
  factTiles: { label: string; value: string }[];
  /** Two short paragraphs framing "what to look for" — texture / appearance
   *  / harvest-form hints. Helps the page rank for product-discovery
   *  queries without entering effect-claim territory. */
  whatToLookFor: string;
  /** Eyebrow / hero kicker — short uppercase phrase above the H1. */
  eyebrow: string;
};

export const STRAIN_TYPES: StrainType[] = [
  {
    slug: "indica",
    name: "Indica",
    eyebrow: "Strain category · Indica",
    metaDescription:
      "Indica strains at Green Life Cannabis in Wenatchee. Categories, lineage, and harvest formats on the live menu — flower, pre-rolls, vapes, edibles.",
    subhead: "Cannabis indica · short-stature lineage · broad-leaf morphology",
    h2: "Indica strains in the Wenatchee Valley",
    keywords: [
      "indica strains Wenatchee",
      "indica dispensary Wenatchee Valley",
      "indica flower Wenatchee",
      "indica pre-rolls Wenatchee",
      "Wenatchee indica cannabis",
      "indica strain types",
    ],
    bodyCopy: `Cannabis indica is one of the two long-recognized botanical lines of the cannabis genus, characterized by shorter plant stature, broader leaflets, and a denser, faster-finishing bud structure compared to cannabis sativa. In modern Washington retail the term is used as a shelf category that signals lineage and grow form rather than a strict botanical certification — most commercial strains are hybridized to some degree, and the indica label on a jar indicates that the strain leans toward indica-dominant heritage in its breeding tree.

We’ve been on GS Center Road in Wenatchee since 2014 — same building, same valley. That tenure shapes how we stock the indica section: we carry both Washington-grown legacy genetics that customers have asked for by name for years (Northern Lights and Bubba Kush lineages, for instance) and newer crosses from regional growers working with terpene-forward parents. A lot of those growers are within a couple hours of us — Cascade-foothill craft outfits and bigger Columbia Basin farms — so the shelf reflects what’s coming off Washington harvests rather than out-of-state imports. The shelf isn’t static; indica-leaning hybrids cycle in and out as growers finish, so the live menu is the source of truth.

Indica is offered across every product format we carry: cured flower in 1g, 3.5g, 7g, and 14g portions; pre-rolls singles and packs; live-resin and distillate vapes; edibles including gummies, chocolates, and beverages where the producer specifies a lineage on the label; and concentrates where extract artists choose indica-dominant input material. Pricing follows the producer and format — craft small-batch flower runs higher than larger commercial harvests, and that ladder is consistent across categories.

Customer feedback at the counter often describes indica selections as the category they reach for in the evening, but we don’t make efficacy claims on this page or at the register — cannabis affects people differently and any individual response depends on the specific cultivar, dose, and consumption format. The budtender team — the best cannabis staff in the Wenatchee Valley — will walk you through what’s currently on the shelf and what each grower says about a given strain’s lineage and terpene profile.`,
    factTiles: [
      { label: "Botanical line", value: "Cannabis indica" },
      { label: "Plant form", value: "Short, broad-leaf" },
      { label: "On the menu", value: "Flower · pre-rolls · vapes · edibles" },
      { label: "Stock cycle", value: "Refreshed weekly" },
    ],
    whatToLookFor: `When you’re scanning the indica section of the menu, lineage is the first thing to look at — the strain name often hints at the parents (“Bubba Kush”, “Northern Lights”, “Granddaddy Purple” are all indica-leaning legacy genetics). The packaging will list the grower, the harvest date, and a cannabinoid + terpene breakdown that the lab certified at packaging.

Format matters too: indica-leaning flower from a craft grower will be denser and trichome-coated; vape carts and edibles labeled indica use input material that the extractor or infuser identified as indica-dominant. If you’re not sure what to pick, ask at the counter — the crew can pull product down and walk through the label with you.`,
  },
  {
    slug: "sativa",
    name: "Sativa",
    eyebrow: "Strain category · Sativa",
    metaDescription:
      "Sativa strains at Green Life Cannabis in Wenatchee. Lineage, formats, and live-menu inventory — flower, pre-rolls, vapes, edibles.",
    subhead: "Cannabis sativa · tall-stature lineage · narrow-leaf morphology",
    h2: "Sativa strains in the Wenatchee Valley",
    keywords: [
      "sativa strains Wenatchee",
      "sativa dispensary Wenatchee Valley",
      "sativa flower Wenatchee",
      "sativa pre-rolls Wenatchee",
      "Wenatchee sativa cannabis",
      "daytime cannabis Wenatchee",
    ],
    bodyCopy: `Cannabis sativa is the second long-recognized botanical line of the cannabis genus, characterized by taller plant stature, narrower leaflets, and a longer flowering window than cannabis indica. In Washington retail the sativa label functions as a shelf category that signals lineage rather than a strict botanical certification — nearly every commercial strain on the market today is a hybrid to some degree, and the sativa label on a jar means the strain leans toward sativa-dominant heritage in its breeding tree.

Our buying team has been on GS Center Road in Wenatchee since 2014 — same building, same valley. That history shapes how we stock the sativa section: we carry classic Washington-grown sativa lineages that long-time customers ask for by name (Durban Poison, Jack Herer, Sour Diesel families) alongside newer crosses from regional growers experimenting with terpene-forward parents. A lot of our shelf comes from Cascade-foothill craft outfits and Columbia Basin farms within driving distance — Washington harvests rather than out-of-state imports — so what’s in the jar reflects what just came off the line. The shelf rotates as harvests come in and go out.

Sativa is offered across every product format we carry: cured flower in 1g, 3.5g, 7g, and 14g portions; pre-roll singles and packs; live-resin and distillate vape cartridges; edibles where the producer specifies a sativa-leaning input on the label; and concentrates from extract artists who select sativa-dominant flower or trim. Pricing follows the producer and format ladder — craft small-batch sativa runs higher than larger-volume commercial harvests, consistent across the rest of the store.

Customer feedback often describes sativa selections as the category they reach for during daytime use, but we don’t make efficacy or outcome claims on this page or at the counter — individual experience depends on the specific cultivar, dose, format, and tolerance. The budtender crew is glad to read through grower notes and lab panels with you on any specific jar — the best cannabis staff in the Wenatchee Valley earned that line by knowing the shelf cold.`,
    factTiles: [
      { label: "Botanical line", value: "Cannabis sativa" },
      { label: "Plant form", value: "Tall, narrow-leaf" },
      { label: "On the menu", value: "Flower · pre-rolls · vapes · edibles" },
      { label: "Stock cycle", value: "Refreshed weekly" },
    ],
    whatToLookFor: `Scanning the sativa section, lineage is the most useful signal — strain names often hint at parents (“Durban Poison”, “Jack Herer”, “Sour Diesel” are all sativa-leaning legacy genetics that have been bred and crossed for decades). Packaging carries the grower, harvest date, and a cannabinoid + terpene breakdown that the WSLCB-certified lab signed off on.

For sativa-dominant vapes and edibles, the producer labels the input material with a strain name or a category tag; ask at the counter if a specific label is ambiguous. Craft sativa flower tends to be airier and brighter-colored than indica-leaning flower from the same grower, reflecting the longer flowering window and the cultivar’s natural plant form.`,
  },
  {
    slug: "hybrid",
    name: "Hybrid",
    eyebrow: "Strain category · Hybrid",
    metaDescription:
      "Hybrid strains at Green Life Cannabis in Wenatchee. Indica-sativa crosses, lineage, and live-menu formats — flower, pre-rolls, vapes, edibles.",
    subhead: "Crossed lineage · indica and sativa parents · balanced morphology",
    h2: "Hybrid strains in the Wenatchee Valley",
    keywords: [
      "hybrid strains Wenatchee",
      "hybrid dispensary Wenatchee Valley",
      "hybrid flower Wenatchee",
      "hybrid pre-rolls Wenatchee",
      "Wenatchee hybrid cannabis",
      "cannabis crosses Wenatchee",
    ],
    bodyCopy: `Hybrid strains are crosses of cannabis indica and cannabis sativa lineages, and they make up the majority of the modern cannabis market — most strains you’ll see on a Washington dispensary shelf today are hybrids in some sense, since breeders have been crossing indica and sativa parents for fifty-plus years. The hybrid label on a jar means the strain is intentionally bred from mixed lineage, often with a stated lean (“indica-dominant hybrid”, “sativa-dominant hybrid”, or “balanced hybrid”) reflecting the breeder’s phenotype selection.

We’ve been on GS Center Road in Wenatchee since 2014 — same building, same valley — and the hybrid section has grown the most over those years as Washington growers leaned into hybrid breeding programs. The shelf carries legacy hybrid genetics like Blue Dream, Girl Scout Cookies, OG Kush, and Wedding Cake families alongside newer phenotype hunts and limited-run releases from regional craft growers. Folks driving over from Chelan or East Wenatchee, lake-house owners stopping in on the way back from Manson, Stevens-Pass weekenders coming down the canyon — the hybrid shelf is the section most of those customers point to first because the lean labels make the choice easier.

Hybrid is offered across every format we carry: flower in 1g through 14g portions; pre-roll singles and packs; live-resin and distillate vape carts; edibles where the producer specifies a hybrid input on the label; and concentrates from extract artists who select balanced flower or trim. Pricing tracks the producer + format ladder consistent with the rest of the menu.

Customer feedback at the counter often points to hybrids as the category to explore when you’re unsure between indica and sativa, but we don’t make outcome claims on this page or at the register — every cultivar reads differently to different people and depends on dose and format. The budtender crew is happy to read through breeder notes and lab panels with you on any jar that catches your eye.`,
    factTiles: [
      { label: "Botanical line", value: "Indica × sativa crosses" },
      { label: "Plant form", value: "Mixed, breeder-selected" },
      { label: "On the menu", value: "Flower · pre-rolls · vapes · edibles" },
      { label: "Stock cycle", value: "Refreshed weekly" },
    ],
    whatToLookFor: `On a hybrid jar, look at two things: the lean (indica-dominant, sativa-dominant, or balanced) and the parent strains. Names like “GSC”, “OG Kush”, “Blue Dream”, and “Wedding Cake” are all hybrid lineages that have been bred forward into dozens of newer crosses, and the breeder will often list the parent cross on the packaging.

Hybrids are where Washington’s craft growers do most of their phenotype hunting — limited-run batches often appear in the hybrid section first. If you’re looking for something new, the hybrid shelf is usually where the budtender team will point you. Ask at the counter and we’ll pull packaging down so you can read the lineage and lab panel before you decide.`,
  },
  {
    slug: "cbd",
    name: "CBD",
    eyebrow: "Strain category · CBD-dominant",
    metaDescription:
      "CBD-dominant strains at Green Life Cannabis in Wenatchee. High-CBD flower, tinctures, and edibles on the live menu — GS Center Road since 2014.",
    subhead: "CBD-dominant cultivars · cannabinoid ratio category",
    h2: "CBD-dominant strains in the Wenatchee Valley",
    keywords: [
      "CBD strains Wenatchee",
      "CBD dispensary Wenatchee Valley",
      "high CBD flower Wenatchee",
      "CBD tincture Wenatchee",
      "CBD cannabis Wenatchee",
      "low THC high CBD strains",
    ],
    bodyCopy: `CBD-dominant strains are cultivars whose lab-certified cannabinoid profile shows cannabidiol (CBD) as the primary cannabinoid by percentage, with THC content lower than the strain-typical range. Washington categorizes these as standard cannabis products when they exceed the 0.3% THC threshold that separates state-licensed cannabis from federally-defined hemp, so they’re sold through licensed dispensaries like ours under the same WSLCB framework as any other adult-use product.

We’ve carried CBD-dominant strains since we opened on GS Center Road in 2014 — same building, same valley — and the CBD section was already a category Wenatchee-Valley customers asked for. The shelf carries CBD-dominant flower from Washington growers who select for high-CBD phenotypes (lineages like Harlequin, ACDC, and Cannatonic are recurring names in this category), alongside tinctures, edibles, and topicals from producers who isolate or co-extract CBD from cannabis input material.

CBD-dominant product formats on the menu include cured flower at varying THC:CBD ratios (1:1, 1:2, 1:5+ are common ladder rungs), pre-rolls where the grower has bagged high-CBD flower, tinctures with stated CBD-per-mL doses, edibles with stated CBD-per-serving doses, and topicals (balms, salves) infused with CBD-dominant extract. Pricing tracks the producer + format ladder consistent with the rest of the store.

Customers ask about CBD-dominant strains for a wide range of reasons, but we don’t make therapeutic or medical claims on this page or at the counter — any individual response depends on the specific product, ratio, dose, and route. The budtender team will read through grower and producer notes with you and explain ratio terminology, but we’re not a clinical setting and we don’t advise on conditions. For medical-cannabis use, the Washington Medical Marijuana Authorization program is a separate state pathway your provider can walk you through.`,
    factTiles: [
      { label: "Profile", value: "CBD-dominant cultivars" },
      { label: "Common ratios", value: "1:1 · 1:2 · 1:5+ (THC:CBD)" },
      { label: "On the menu", value: "Flower · tinctures · edibles · topicals" },
      { label: "Stock cycle", value: "Refreshed weekly" },
    ],
    whatToLookFor: `On a CBD-dominant jar, the cannabinoid ratio is the first thing to check — packaging lists THC% and CBD% from the WSLCB-certified lab panel, and the ratio is the load-bearing signal. A 1:1 ratio reads very differently from a 1:20 ratio on the same flower.

For tinctures and edibles, the CBD-per-mL or CBD-per-serving number is what to anchor on, because the total bottle or package size varies widely between producers. Topicals (balms, salves, lotions) list CBD content per container. If you’re new to this section, ask at the counter — we’ll read the label with you and explain what the ratio terminology means in plain language.`,
  },
];

export function getStrainType(slug: string): StrainType | undefined {
  return STRAIN_TYPES.find((t) => t.slug === slug);
}
