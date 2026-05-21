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

import { STRAINS, STRAIN_SLUGS, type Strain } from "./strains.ts";

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
    tagline: "Mountain-bred indica. The name half the modern shelf borrows.",
    description:
      "Kush starts in one place: the Hindu Kush mountain range between Afghanistan and Pakistan, where the original landrace was bred for centuries before anyone in the West had a word for it. The character carries through — heavy body, earthy-sandalwood nose, calm head. If a strain on our shelf has “Kush” in the name (OG Kush, Bubba Kush, Master Kush, Purple Kush), this is the lineage it leans on.",
    includeSlugs: ["og-kush", "hindu-kush", "bubba-kush", "master-kush"],
    nameMatches: ["kush"],
  },
  {
    slug: "cookies",
    name: "The Cookies Line",
    anchorSlug: "girl-scout-cookies",
    tagline: "Sweet, dessert-leaning hybrids. Half the modern catalog descends here.",
    description:
      "The Cookies family starts with GSC (originally Girl Scout Cookies, renamed for trademark reasons) — a Bay Area cross of OG Kush and Durban Poison that turned into the most-crossed strain of the past decade. The signature is sweet-mint-and-earth on the nose, a balanced hybrid read, and a lineage that runs through Wedding Cake, Gelato, Sunset Sherbet, Cookies & Cream, and most of the dessert shelf. If a strain sounds like a bakery, GSC is probably in the family tree.",
    includeSlugs: ["girl-scout-cookies", "wedding-cake", "gelato", "sunset-sherbet"],
    nameMatches: ["cookies", "cake", "gelato", "sherbet", "sherbert"],
  },
  {
    slug: "haze",
    name: "The Haze Line",
    anchorSlug: "haze",
    tagline: "Long-flowering sativa lineage. Head-up character, distinctive nose.",
    description:
      "Haze is the sativa side of the family tree — a long-flowering, tropical-equatorial lineage bred in California in the late ’60s and ’70s, then refined in Amsterdam through the ’80s. The character is head-up on the read, with a spicy-citrus-incense nose that’s hard to mistake once you’ve had it. Super Silver Haze, Amnesia Haze, Super Lemon Haze, and the Haze half of Blue Dream all trace back here.",
    includeSlugs: ["haze", "jack-herer", "super-silver-haze", "amnesia-haze"],
    nameMatches: ["haze"],
  },
  {
    slug: "diesel",
    name: "The Diesel Line",
    anchorSlug: "sour-diesel",
    tagline: "Pungent fuel character, sativa lean. Loud on every count.",
    description:
      "Diesel is built around Sour Diesel — the East Coast classic that came out of New York in the early ’90s and never went away. The signature is unmistakable: pungent fuel and citrus on the nose, head-up read, more turn-up-and-go than body-buzz. NYC Diesel, Strawberry Diesel, Chemdog crosses, and most of the fuel-forward shelf descend from this branch of the family.",
    includeSlugs: ["sour-diesel", "chemdawg"],
    nameMatches: ["diesel", "chemdawg", "chem ", "chem-"],
  },
  {
    slug: "cheese",
    name: "The Cheese Line",
    anchorSlug: "cheese",
    tagline: "UK Skunk pheno turned global. Funky, savory, unmistakable on the nose.",
    description:
      "Cheese started as a single Skunk #1 phenotype found by a UK grower in the late ’80s — funky, savory, and unmistakably cheese-rind on the nose. It got passed around the British grow scene for years before crossing the Atlantic, and now anything labeled Cheese (Blue Cheese, Exodus Cheese, UK Cheese, Cheesecake) traces back to that one pheno cut. Customers who reach for Cheese know the savory-funk read on first whiff — it’s a love-or-skip family.",
    includeSlugs: ["cheese"],
    nameMatches: ["cheese"],
  },
  {
    slug: "skunk",
    name: "The Skunk Line",
    anchorSlug: "skunk-1",
    tagline: "The foundational hybrid. Everything modern owes Skunk something.",
    description:
      "Skunk #1 came out of California in the late ’70s — a three-way cross of Afghani, Acapulco Gold, and Colombian Gold that stabilized into the first widely-distributed hybrid seedline. The original sharp, skunky, slightly-sweet nose is where the slang “skunk” for strong cannabis comes from. Most hybrid genetics today have Skunk somewhere in the tree, even when it’s two or three generations back — Cheese, Sour Diesel, NYC Diesel, and a long list of others all owe Skunk a chapter.",
    includeSlugs: ["skunk-1"],
    nameMatches: ["skunk"],
  },
  {
    slug: "blueberry",
    name: "The Blueberry Line",
    anchorSlug: "blueberry",
    tagline: "DJ Short’s berry-forward lineage. Indica-leaning, sweet-fruit nose.",
    description:
      "Blueberry traces back to breeder DJ Short’s work in the late ’70s and ’80s — a Thai-and-Afghani-based cross that he refined for years before it went public in the ’90s. The character is sweet, berry-forward on the nose, indica-leaning on the read, often with a purple cast to the flower. Blue Dream, Blueberry Kush, Blueberry Headband, Berry White, and the Blueberry half of dozens of crosses all descend from his original line.",
    includeSlugs: ["blueberry", "blue-dream"],
    nameMatches: ["blueberry", "blue "],
  },
  {
    slug: "afghani",
    name: "The Afghani Line",
    anchorSlug: "afghani",
    tagline: "Pure indica landrace. The foundation under almost every modern indica.",
    description:
      "Afghani is one of the two foundational landrace indicas (the other being Hindu Kush, which it borders) — bred for centuries in the mountains of Afghanistan before any commercial seedline existed. The character is hash-and-earth on the nose, heavy on the body, dense and slow on the read. Northern Lights, Bubba Kush, Granddaddy Purple, Master Kush, and most of the modern indica shelf trace back here at some depth.",
    includeSlugs: ["afghani"],
    nameMatches: ["afghan"],
  },
  {
    slug: "northern-lights",
    name: "The Northern Lights Line",
    anchorSlug: "northern-lights",
    tagline: "Afghani × Thai indica anchor. The ’80s indica template that defined indoor breeding.",
    description:
      "Northern Lights came out of the Pacific Northwest in the early ’80s — an Afghani × Thai cross that became the template most modern indicas borrow from. The character is sweet-spice and pine on the nose, heavy body, calm head, the kind of old-school read that people mean when they say “real indica.” Shiva Skunk, Northern Lights #5, and a long list of crosses (NL × Haze especially) descend from this branch.",
    includeSlugs: ["northern-lights", "northern-lights-5"],
    nameMatches: ["northern lights", "northern-lights"],
  },
  {
    slug: "landrace",
    name: "Landrace + Heirloom Lines",
    anchorSlug: null,
    tagline: "Pure geographic-origin strains. The source material everything descends from.",
    description:
      "Landraces are the originals — pure strains bred over centuries in a single geographic region, before anyone was crossing across hemispheres. Hindu Kush from the Afghan-Pakistan mountains, Acapulco Gold from Mexico, Durban Poison from South Africa, Thai sticks from Southeast Asia, Colombian Gold and Panama Red from Central and South America. Every modern hybrid on the shelf descends from one or more of these — they’re the genetic floor cannabis built itself up from.",
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
