// Strain Family Album — SSoT for genetic-line families.
//
// Concept: cannabis strains descend from a small set of foundational
// lineages ("founder strains"). The 9 founder lines + a 10th landrace
// bucket organize the 250-strain library by genetic ancestry, giving
// customers a lens orthogonal to indica/sativa/hybrid (the existing
// /strains/[type] lens). Reads as "Family Album" — strain pages live
// in genealogy clusters the way photos live in family albums.
//
// Voice: "The Kush Line" (drier, lineage-anchored), NOT "The Kush
// Family" (warmer but conflicts with our compliance lane — no implied
// people-to-people relationships, just plant ancestry). Per spec §9
// decision 4. Sister-of-strain pattern: type-color coded per anchor's
// strain.type so visual identity ties back to the existing /strains
// system.
//
// Pure-data module. Zero schema changes to `Strain` type. Zero env
// vars introduced. Family membership derives entirely from the
// existing `parents` array on each strain (lineage walk + landrace
// fallback heuristic). Spec §3a + §7 rule 4.
//
// SSoT note: this lives in lib/, NOT inside strains.ts, because
// strains.ts is already 14,700+ lines and Doug's standing rule is
// "split before files become unreviewable." Importing the strains
// SSoT from here is one-direction (families → strains, never back).

import { STRAINS, STRAIN_SLUGS, type Strain } from "@/lib/strains";

export type FamilyKey =
  | "kush"
  | "cookies"
  | "haze"
  | "diesel"
  | "cheese"
  | "skunk"
  | "blueberry"
  | "afghani"
  | "northern-lights"
  | "landrace";

export type StrainFamily = {
  /** URL slug — `/strains/families/<slug>`. */
  slug: FamilyKey;
  /** Display label — "The Kush Line", "Landrace + Heirloom Lines", etc. */
  name: string;
  /** Anchor strain slug — the founder this family rallies around. For
   *  landrace this is null since the bucket is "everything pre-modern". */
  anchorSlug: string | null;
  /** Short tagline (≤80 chars) shown on tile + hero. */
  tagline: string;
  /** 80-110 word descriptive blurb. WAC 314-55-155 strict — no efficacy
   *  claims. Lineage + breeding heritage + supply-chain framing only. */
  description: string;
  /** Extra strain slugs to include in this family by direct inclusion
   *  (covers strains whose parent-walk doesn't reach the anchor but
   *  whose name/lineage signals family membership — e.g. "Hindu Kush"
   *  belongs to the Kush line even though its parents may be landrace
   *  Afghani in our dataset). */
  includeSlugs?: readonly string[];
  /** Name substrings (lowercase, word-boundary) to fallback-match
   *  strains into the family. Used when a strain entry didn't get a
   *  full parents-array entry but is obviously in the family. e.g.
   *  ["kush"] catches "Bubba Kush", "Master Kush" automatically. */
  nameMatches?: readonly string[];
};

/* ─────────────────────────────────────────────────────────────────────
 * The 10 families.
 *
 * Order: 9 founder lines in rough historical importance (Kush + Cookies
 * dominate modern shelves; Haze + Diesel + Cheese + Skunk are legacy
 * sativa/hybrid lines; Blueberry + Afghani + Northern Lights are
 * canonical indica lines), then Landrace bucket last as the
 * pre-modern / unclassified shelf.
 * ───────────────────────────────────────────────────────────────────── */

export const STRAIN_FAMILIES: readonly StrainFamily[] = [
  {
    slug: "kush",
    name: "The Kush Line",
    anchorSlug: "og-kush",
    tagline: "OG Kush, Hindu Kush, and the heavy-indica branch that defines modern shelf weight.",
    description:
      "The Kush line traces to the Hindu Kush mountains of Afghanistan and Pakistan — short, broad-leaf indica plants brought into Western breeding programs in the late 1970s. OG Kush became the West Coast anchor in the 1990s and spawned a generation of crosses (Bubba Kush, Master Kush, Skywalker OG, GMO Cookies). On a Washington shelf, Kush-line strains read as dense, trichome-heavy buds with earth + diesel + pine terpene profiles. Growers select Kush genetics when they want resin yield and a recognizable, customer-asked-for name on the menu. Sweep is wide — most modern indica-dominant hybrids carry Kush somewhere in the breeding tree.",
    includeSlugs: ["og-kush", "hindu-kush", "bubba-kush", "master-kush"],
    nameMatches: ["kush"],
  },
  {
    slug: "cookies",
    name: "The Cookies Line",
    anchorSlug: "girl-scout-cookies",
    tagline: "GSC, Wedding Cake, Gelato — the dessert-terpene branch that took over the 2010s.",
    description:
      "The Cookies line begins with Girl Scout Cookies (GSC), a Bay Area cross of OG Kush × Durban Poison that hit dispensaries around 2012 and rewrote the modern hybrid playbook. Its descendants — Wedding Cake, Gelato, Sunset Sherbet, Animal Cookies — dominate craft shelves with sweet, dough-and-frosting terpene profiles built on caryophyllene + limonene. On a Washington shelf, Cookies-line strains tend toward purple-tinged flower and dense bud structure. Breeders gravitate to the Cookies pool because the offspring inherit reliable potency, recognizable terpene character, and customer name recognition that doesn't need a sales pitch.",
    includeSlugs: ["girl-scout-cookies", "wedding-cake", "gelato", "sunset-sherbet"],
    nameMatches: ["cookies", "cake", "gelato", "sherbet", "sherbert"],
  },
  {
    slug: "haze",
    name: "The Haze Line",
    anchorSlug: "haze",
    tagline: "Haze, Jack Herer, Super Silver Haze — the long-flowering sativa branch of the modern era.",
    description:
      "Haze emerged in 1970s Santa Cruz from breeders crossing Colombian, Mexican, Thai, and South Indian sativa landraces. The line gave the cannabis world its signature long-flowering, tall-growing, citrus-and-spice sativa archetype. Descendants — Jack Herer, Super Silver Haze, Amnesia Haze, Lemon Haze, Neville's Haze — define the modern sativa shelf. Haze flower is airy, light-colored, and slow to finish (12-16 weeks indoor), which is why pure Haze lines are rare and most shelves carry Haze-dominant hybrids. Growers who run Haze accept the extended flowering window for the terpene reward — bright myrcene + terpinolene + pinene profiles you don't get anywhere else.",
    includeSlugs: ["haze", "jack-herer", "super-silver-haze", "amnesia-haze"],
    nameMatches: ["haze"],
  },
  {
    slug: "diesel",
    name: "The Diesel Line",
    anchorSlug: "sour-diesel",
    tagline: "Sour Diesel, Chemdawg, and the East Coast fuel-terpene branch.",
    description:
      "The Diesel line is the East Coast counterweight to West Coast Kush. Chemdawg dropped onto the underground market in the early 1990s — a mystery cross from a Grateful Dead show bag — and its offspring Sour Diesel became the New York City sativa-leaning standard. The terpene signature is unmistakable: gasoline + skunk + citrus from a caryophyllene-heavy profile. Modern descendants include Headband, NYC Diesel, Strawberry Diesel, and East Coast Sour Diesel cuts. On a Washington shelf, Diesel-line strains run sativa-leaning hybrid with energetic flower density and the characteristic fuel-funk smell that older customers recognize from the pre-legalization era.",
    includeSlugs: ["sour-diesel", "chemdawg"],
    nameMatches: ["diesel", "chemdawg", "chem ", "chem-"],
  },
  {
    slug: "cheese",
    name: "The Cheese Line",
    anchorSlug: "cheese",
    tagline: "UK Cheese and the funky, fermented branch of the Skunk family.",
    description:
      "Cheese emerged in the late 1980s from a UK grow collective that found a particularly funky Skunk #1 phenotype — pungent, sharp, with the unmistakable fermented-dairy aroma that gave the strain its name. UK Cheese became a British staple and crossed back into the US market through Big Buddha Cheese and Exodus Cheese cuts. The terpene signature is myrcene-heavy with a unique sulfur compound profile that reads as cheese rind to most noses. On a Washington shelf, Cheese-line strains are indica-leaning hybrids prized by customers who specifically chase the funk — there's no other strain family that smells quite like it, and growers select Cheese cuts for that exact reason.",
    includeSlugs: ["cheese"],
    nameMatches: ["cheese"],
  },
  {
    slug: "skunk",
    name: "The Skunk Line",
    anchorSlug: "skunk-1",
    tagline: "Skunk #1 — the 1970s Sacred Seeds cross that fathered the modern hybrid era.",
    description:
      "Skunk #1 was bred by Sacred Seeds in the late 1970s from Afghani × Acapulco Gold × Colombian Gold parents — a deliberate three-way cross that became the foundational hybrid of the modern cannabis era. Its descendants run everywhere: Cheese, Super Silver Haze, Sour Diesel, and dozens of named crosses all carry Skunk in their breeding tree. The terpene signature that gave the line its name is myrcene + thiols — the same sulfur compounds that give actual skunk spray its character, in vastly lower concentrations. On a Washington shelf, pure Skunk #1 is rare (the genetics have been folded into so many hybrids), but Skunk-descended lineages are everywhere a customer looks.",
    includeSlugs: ["skunk-1"],
    nameMatches: ["skunk"],
  },
  {
    slug: "blueberry",
    name: "The Blueberry Line",
    anchorSlug: "blueberry",
    tagline: "DJ Short's Blueberry — the indica-leaning berry-terpene branch.",
    description:
      "Blueberry was bred by DJ Short in the late 1970s from a cross of Purple Thai × Afghani × Highland Thai landraces, stabilized over more than a decade of phenotype selection. The strain became the canonical example of berry-terpene cannabis — myrcene + limonene + linalool combining into a sweet, fruit-forward profile that reads as actual blueberry on the nose. The line spawned Blue Dream (one of the most-sold strains in modern legal cannabis), Blueberry Headband, Blue Cheese, and dozens of named Blue* crosses. On a Washington shelf, Blueberry-line strains run indica-leaning with purple-tinged flower and the signature berry-and-vanilla aromatic character.",
    includeSlugs: ["blueberry", "blue-dream"],
    nameMatches: ["blueberry", "blue "],
  },
  {
    slug: "afghani",
    name: "The Afghani Line",
    anchorSlug: "afghani",
    tagline: "The landrace indica that seeded every modern Kush, Northern Lights, and Blueberry cross.",
    description:
      "Afghani is the broad-leaf indica landrace from the Hindu Kush mountain range — the genetic root system that almost every modern indica draws from. Brought into Western breeding in the 1970s, Afghani parents gave the world Northern Lights, Hindu Kush, Bubba Kush, and the entire Kush dynasty. The plant runs short, fast-finishing (7-8 weeks), and produces dense resinous flower with earth + hash + sandalwood terpene profiles. On a Washington shelf, pure Afghani is uncommon (the genetics are usually expressed through Kush + Northern Lights descendants), but when it shows up it's the closest a customer can get to the original mountain-grown plant cannabis breeders learned everything from.",
    includeSlugs: ["afghani"],
    nameMatches: ["afghan"],
  },
  {
    slug: "northern-lights",
    name: "The Northern Lights Line",
    anchorSlug: "northern-lights",
    tagline: "The 1980s Pacific Northwest indica that defined indoor cannabis breeding.",
    description:
      "Northern Lights came out of the Pacific Northwest in the early 1980s — an Afghani-based indica that breeders selected specifically for indoor cultivation. The line ran short, fast (6-8 weeks flowering), resinous, and forgiving, which made it the foundational genetic for the entire indoor commercial cannabis era. Northern Lights #5 became the most-replicated cut, and its offspring include Super Silver Haze, Shiva Skunk, and dozens of named indica hybrids. On a Washington shelf, Northern Lights and NL-descended strains run indica-leaning with pine + earth + sweet terpene profiles and dense, trichome-coated flower that reflects 40 years of indoor-selected breeding pressure.",
    includeSlugs: ["northern-lights", "northern-lights-5"],
    nameMatches: ["northern lights", "northern-lights"],
  },
  {
    slug: "landrace",
    name: "Landrace + Heirloom Lines",
    anchorSlug: null,
    tagline: "Durban Poison, Acapulco Gold, Thai, Colombian — the pre-modern, pre-hybrid shelf.",
    description:
      "Landrace strains are the regional cannabis varieties that grew unhybridized for generations in their original geographies — Durban Poison from South Africa, Acapulco Gold from Mexico's Pacific coast, Thai from Southeast Asia, Colombian Gold from the Andes, Hindu Kush from Afghanistan, Hawaiian from the islands. These are the genetic ancestors of every modern strain. Most landrace cuts on a Washington shelf today are second- or third-generation seed-bank preservations rather than direct-import material (which became impossible after prohibition), but they retain the recognizable pre-hybrid plant form, longer flowering window, and unique regional terpene profiles. Customers seek out landrace strains for their historical interest and for the simpler, less-engineered cannabis experience.",
    includeSlugs: ["durban-poison", "acapulco-gold", "thai", "colombian", "hawaiian", "panama-red"],
  },
] as const;

/* ─────────────────────────────────────────────────────────────────────
 * Helper functions — pure, build-time computable.
 * ───────────────────────────────────────────────────────────────────── */

/** Look up a family by slug. */
export function getFamily(slug: string): StrainFamily | null {
  return STRAIN_FAMILIES.find((f) => f.slug === slug) ?? null;
}

/** List of all family slugs (for generateStaticParams). */
export const FAMILY_SLUGS: readonly FamilyKey[] = STRAIN_FAMILIES.map(
  (f) => f.slug,
);

/** Strain → family lookup. Returns the FIRST family that claims this
 *  strain via includeSlugs, parent-walk, or nameMatch. Returns null
 *  when no family matches (rare — most strains land in landrace fallback
 *  if not in a founder line, depending on includeSlugs coverage). */
export function getFamilyForStrain(slug: string): StrainFamily | null {
  const s = STRAINS[slug];
  if (!s) return null;
  for (const fam of STRAIN_FAMILIES) {
    if (fam.includeSlugs?.includes(slug)) return fam;
    // Parent-walk: if any ancestor is the anchor or in includeSlugs, match.
    if (fam.anchorSlug && parentWalkReaches(s, fam.anchorSlug)) return fam;
    if (fam.includeSlugs) {
      for (const incSlug of fam.includeSlugs) {
        if (parentWalkReaches(s, incSlug)) return fam;
      }
    }
    // Name-substring fallback (word-bounded-ish).
    if (fam.nameMatches) {
      const nameLower = s.name.toLowerCase();
      for (const needle of fam.nameMatches) {
        if (nameLower.includes(needle)) return fam;
      }
    }
  }
  return null;
}

/** All strains that belong to a given family. Cached via STRAIN_SLUGS
 *  iteration — not memoized because the dataset is static and this is
 *  build-time-only. */
export function getStrainsInFamily(familySlug: string): readonly Strain[] {
  const fam = getFamily(familySlug);
  if (!fam) return [];
  const matches: Strain[] = [];
  const seen = new Set<string>();
  for (const slug of STRAIN_SLUGS) {
    const s = STRAINS[slug];
    if (!s || seen.has(slug)) continue;
    let belongs = false;
    if (fam.includeSlugs?.includes(slug)) belongs = true;
    if (!belongs && fam.anchorSlug && parentWalkReaches(s, fam.anchorSlug)) {
      belongs = true;
    }
    if (!belongs && fam.includeSlugs) {
      for (const incSlug of fam.includeSlugs) {
        if (parentWalkReaches(s, incSlug)) {
          belongs = true;
          break;
        }
      }
    }
    if (!belongs && fam.nameMatches) {
      const nameLower = s.name.toLowerCase();
      for (const needle of fam.nameMatches) {
        if (nameLower.includes(needle)) {
          belongs = true;
          break;
        }
      }
    }
    if (belongs) {
      matches.push(s);
      seen.add(slug);
    }
  }
  // Sort: anchor first, then by name.
  matches.sort((a, b) => {
    if (fam.anchorSlug) {
      if (a.slug === fam.anchorSlug) return -1;
      if (b.slug === fam.anchorSlug) return 1;
    }
    return a.name.localeCompare(b.name);
  });
  return matches;
}

/** Anchor strains for each family (skips landrace which has no single
 *  anchor — returns founder strains only). Used by FamilyAlbumGrid for
 *  the per-tile founder spotlight. */
export function getFounderAnchors(): readonly Strain[] {
  const anchors: Strain[] = [];
  for (const fam of STRAIN_FAMILIES) {
    if (!fam.anchorSlug) continue;
    const s = STRAINS[fam.anchorSlug];
    if (s) anchors.push(s);
  }
  return anchors;
}

/** Cached count per family — used for grid tile subhead "12 strains". */
export function getFamilyCount(familySlug: string): number {
  return getStrainsInFamily(familySlug).length;
}

/** Parent-walk: returns true if `target` slug is anywhere in the strain's
 *  ancestry tree. Bounded by depth 6 to handle cyclical-dataset bugs
 *  defensively (a strain accidentally listing itself as an ancestor
 *  wouldn't loop forever). */
function parentWalkReaches(strain: Strain, target: string): boolean {
  if (!strain.parents || strain.parents.length === 0) return false;
  const visited = new Set<string>([strain.slug]);
  const queue: Array<{ slug: string; depth: number }> = [];
  for (const p of strain.parents) {
    if (p && !visited.has(p)) {
      queue.push({ slug: p, depth: 1 });
      visited.add(p);
    }
  }
  while (queue.length > 0) {
    const { slug, depth } = queue.shift()!;
    if (slug === target) return true;
    if (depth >= 6) continue;
    const parent = STRAINS[slug];
    if (!parent?.parents) continue;
    for (const p of parent.parents) {
      if (p && !visited.has(p)) {
        queue.push({ slug: p, depth: depth + 1 });
        visited.add(p);
      }
    }
  }
  return false;
}
