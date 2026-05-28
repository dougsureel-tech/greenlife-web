// Terpene primer card content for /learn/terpenes — single-source-of-truth
// for the 5 cards on the public terpene-guide page. Sister-port lives at
// `seattle-cannabis-web/lib/terpene-content.ts` (byte-identical except this
// header comment — sibling stack uses identical card data so both stores
// teach the same terpene language).
//
// WSLCB 314-55-155 COMPLIANCE (load-bearing — every string below is
// scanned by `check-wac-314-55-155-banned-claims.mjs` +
// `check-efficacy-claims.mjs` on push):
//   - NEVER claim a terpene causes a feeling. "Myrcene is sedating" =
//     BANNED. "Customers who reach for myrcene-forward strains often
//     pick them for evenings" = OK (preference observation about
//     customer behavior, not pharmacological claim).
//   - NEVER use bare effect adjectives (sedating / calming / relaxing /
//     uplifting / energizing / focusing / euphoric) outside a preference
//     wrapper. The aroma + flavor language ("smells like X", "tastes
//     like Y") is the safe lane.
//   - The "where else you encounter it" line stays observational —
//     "myrcene is also in hops, lemongrass, mango" is fine. "...which is
//     why beer makes you sleepy" is NOT fine (transfers effect-claim by
//     implication).
//
// VOICE — anchored to STRAIN_COPY_VOICE_RUBRIC_2026_05_15.md:
//   - Real-shop budtender register. Not "elevate your journey".
//   - Show, don't tell: "myrcene smells like mango skin + a hot car in
//     August" beats "myrcene has an earthy aroma".
//   - "Customers who reach for X often pick Y" is the load-bearing
//     observation move. Past behavior, not future prediction.
//
// Order matches the cannabis-content-expert's dominance ranking in the
// corpus (Caryophyllene/Myrcene/Limonene are the 3 most-common dominant
// terpenes; Pinene + Linalool round out the 5 anchor axes).

export type TerpeneCard = {
  /** Terpene name (matches `Strain.terpenes[].name` in the corpus). */
  name: string;
  /** Slug for in-page anchor + future-route safety. */
  slug: string;
  /** 1-line aroma signature — "smells like X". Sensory ONLY. */
  aroma: string;
  /** 1-line flavor signature — "tastes like X" on the exhale. */
  flavor: string;
  /** Where else it shows up in nature/food/everyday life. Observational,
   * no effect-implication ("myrcene is in hops" OK; "...which is why beer
   * makes you sleepy" NOT OK). */
  alsoIn: string;
  /** "Customers who reach for this often pick it for…" framing. Pure
   * preference-observation; NEVER causation. Pattern, not claim. */
  whoReaches: string;
};

/**
 * The 5 anchor terpene cards. Order = corpus-dominance order (caryophyllene
 * leads the corpus at 103 dominant strains; linalool tails at 27 in-top-3).
 * Matches the cannabis-content-expert's reader-flow recommendation: lead
 * with the most-encountered terpene language so customers can map what they
 * already smell + taste back to a name.
 */
export const TERPENE_CARDS: readonly TerpeneCard[] = [
  {
    name: "Myrcene",
    slug: "myrcene",
    aroma:
      "Mango skin, ripe fruit at the back of the fruit bowl, the smell of a hot car in August with the windows cracked. Earthy underneath — wet bark after a rain.",
    flavor:
      "On the inhale, soft fruit. On the exhale, that loamy mid-palate that lingers — the part regulars describe as 'weight.'",
    alsoIn:
      "Mango, lemongrass, hops, thyme, bay leaf. The brewing kettle and the soup pot both carry it. If you've ever pulled a fresh bay leaf out of a stew and rolled it between your fingers, that smell is myrcene leading.",
    whoReaches:
      "Customers who reach for myrcene-forward strains often pick them for the back porch on a Friday evening, weekend mornings with nothing on the calendar, after a long day on a job site. Pattern, not promise — what people actually walk out with, in our floor notes.",
  },
  {
    name: "Limonene",
    slug: "limonene",
    aroma:
      "Lemon zest rubbed on the rim of a glass. Sweet citrus — orange peel and grapefruit pith, not lemon juice. The bright top-note that hits first when you crack the jar.",
    flavor:
      "Citrus on the inhale, slight tang on the exhale. The note that makes customers say 'this one's bright' before they can put their finger on why.",
    alsoIn:
      "Citrus rind (lemon, orange, grapefruit, lime), juniper berries, peppermint. Pretty much any kitchen that's seen a zester knows the smell.",
    whoReaches:
      "Customers who reach for limonene-bright strains often pick them for morning coffee, the walk to the bus, the part of the day that's already moving. Daytime-leaning preference, in our floor notes — what regulars come back asking for by name.",
  },
  {
    name: "Caryophyllene",
    slug: "caryophyllene",
    aroma:
      "Cracked black pepper. Warm wood — the inside of a cedar chest. A faint clove note sitting underneath. Spicy without being sharp.",
    flavor:
      "Peppery on the exhale, that warm spiced-wood finish that lingers on the tongue after the smoke is gone. The note in OG-lineage and diesel-lineage strains that customers describe as 'depth.'",
    alsoIn:
      "Black pepper (literally the same molecule), cloves, cinnamon, rosemary, hops. The spice rack and the cannabis jar share more vocabulary than people realize.",
    whoReaches:
      "Customers who reach for caryophyllene-forward strains often pick them when they want something with weight to it — strains that 'sit in the chest' rather than 'sit in the head.' Floor-pattern observation; everyone's chemistry is different.",
  },
  {
    name: "Pinene",
    slug: "pinene",
    aroma:
      "A walk through an evergreen forest — Christmas tree, fresh pine sap, the smell of a wood-shop that just finished a cedar run. Clean, sharp, green.",
    flavor:
      "Pine on the inhale, slight rosemary-herb note on the exhale. The clarity behind the head-up that regulars call 'clear.'",
    alsoIn:
      "Pine needles, rosemary, basil, parsley, dill. Conifers, Mediterranean herbs, the gin shelf at any bar. The forest and the herb garden share this one.",
    whoReaches:
      "Customers who reach for pinene-leading strains often pick them before a hike, before a long drive, the morning of a project day. Sativa-leaning preference pattern, in our floor notes — though every chemistry is its own thing.",
  },
  {
    name: "Linalool",
    slug: "linalool",
    aroma:
      "Lavender first — the soft floral note that sits on top. Light spice underneath, like the smell of fresh-cut lavender bunched in a basket. Quiet, never loud.",
    flavor:
      "Floral on the inhale with a slight bitter-herb finish, like a sip of chamomile tea steeped a minute too long. The note that softens the sweetness in dessert-lineage strains.",
    alsoIn:
      "Lavender, coriander seed, bergamot rind, basil, mint family herbs. The tea shelf, the bath-product aisle, and the garden border share this one.",
    whoReaches:
      "Customers who reach for linalool-touched strains often pick them for the end of the day, slow dinners, the wind-down hour. Indica-leaning preference in our floor notes — but plenty of hybrid customers reach for it too.",
  },
];

/**
 * FAQ entries for the terpene primer page. Each Q+A is WAC-safe — answers
 * teach the language of aroma + flavor, redirect any "what will it DO?"
 * questions to the budtender-floor conversation. JSON-LD FAQPage schema
 * is built from this array.
 */
export type TerpeneFaq = { q: string; a: string };

export const TERPENE_FAQS: readonly TerpeneFaq[] = [
  {
    q: "What's the difference between indica and sativa?",
    a:
      "The shelf labels are real but loose. 'Indica' historically described shorter, broad-leaf plants from the Hindu Kush region; 'sativa' described taller, narrow-leaf plants from equatorial latitudes. In a modern dispensary, almost everything is a hybrid — the lineage trees on every strain page tell the actual story. The terpene profile is a better predictor of what a strain smells and tastes like than the indica/sativa label. We use indica/sativa/hybrid as a starting filter on the menu; the terpene profile is where the real conversation happens at the counter.",
  },
  {
    q: "Why doesn't this page tell me what each strain WILL do?",
    a:
      "Because we can't, and Washington's cannabis-advertising rules (WAC 314-55-155) say we shouldn't try. Every customer's chemistry is different — what reads as 'evening' for one person reads as 'mid-afternoon' for another. What we can tell you is what each terpene smells and tastes like, and what regulars who reach for those terps often pick them for. That's pattern, not prediction. The honest conversation happens at the counter — bring us your notes from past strains and we'll match the language to the next pick.",
  },
  {
    q: "Can a budtender recommend a strain by terpene?",
    a:
      "Yes — and this is the most useful conversation you can have at the counter. If you tell us 'the last thing I liked was something peppery and earthy,' we can walk you to the caryophyllene-forward shelf. If you tell us 'I want something that smells like a fresh-cut lemon,' the limonene shelf is right there. Naming the smell + flavor is way more useful than naming a feeling, because we can verify the chemistry on the lab panel before you leave with it.",
  },
  {
    q: "How do I read the terpene info on a product label?",
    a:
      "Washington lab panels list the top 3-5 terpenes by mass percentage. The first listed is the dominant terpene — that's the one driving the aroma you smell when you crack the jar. The 2nd and 3rd entries fill in the supporting notes. As a rule of thumb, anything above 0.5% by mass is a noticeable contributor; the dominant terpene on most flower will be in the 0.6-1.5% range. Higher than that and you'll smell it across the parking lot.",
  },
  {
    q: "If two strains share the same dominant terpene, will they smell the same?",
    a:
      "Close, but not identical. The dominant terpene drives the headline note (peppery vs citrus vs piney vs floral), but the supporting terpenes shape the personality. Two caryophyllene-dominant strains can read as 'pepper + fuel' on one and 'pepper + cedar + soft sweet' on another, depending on what's playing 2nd and 3rd. The lineage matters too — strains from the same family tree tend to share supporting-terpene patterns. Browse the family-album pages on our site to see those clusters.",
  },
];
