// Service-area landing-page data for /near/<town>.
//
// Each town gets a static page that ranks for "weed near me + <town>"
// + "<town> dispensary" geo-search. Voice: hyperlocal — same warmth as
// home + visit + press, written like a real Wenatchee shopkeeper would
// brief a friend driving in from the next town over.
//
// **What goes in `pitch`:** the one-sentence why-stop-here for someone
// driving from THIS town. Mentions the actual route + a landmark a
// local would recognize. NOT generic SEO filler.
//
// Adding a town: append a row, redeploy, sitemap.ts auto-pulls it in.

export type NearTown = {
  slug: string;            // URL-safe lowercase
  name: string;            // Display name
  county: string;
  driveMins: number;       // From store, ballpark
  highway: string;         // Primary route
  pitch: string;           // 1-sentence local hook
  whyStop: string;         // 2-3 sentences explaining why a customer from this town stops at GL
  notableNeighbors: string[]; // Towns/neighborhoods nearby for internal SEO + landing-page graph
};

export const NEAR_TOWNS: readonly NearTown[] = [
  {
    slug: "chelan",
    name: "Chelan",
    county: "Chelan County",
    driveMins: 55,
    highway: "US-97 Alt north along the Columbia",
    pitch: "Chelan to Wenatchee is one shot up US-97 — we're the last cannabis stop before the lake.",
    whyStop:
      "Chelan locals + summer-house owners drive past Green Life on the way out of town. Stocking up before a long weekend at the lake is the most common reason — pre-rolls for the docks, edibles for the houseboat, flower for the cabin. Cash-only and 21+, but the ATM in-store covers either.",
    notableNeighbors: ["Manson", "Entiat", "Leavenworth"],
  },
  {
    slug: "leavenworth",
    name: "Leavenworth",
    county: "Chelan County",
    driveMins: 35,
    highway: "US-2 east through Tumwater Canyon",
    pitch: "Leavenworth → Wenatchee is 35 min on US-2 — we're the closest legal cannabis to the Bavarian village.",
    whyStop:
      "Leavenworth doesn't have a recreational dispensary inside city limits, so locals + tourists driving in from Stevens Pass swing through Wenatchee. Stop on the way home from a Front Street wander, or pair with Pybus Public Market and a stretch along the Columbia.",
    notableNeighbors: ["Cashmere", "Plain", "Lake Wenatchee"],
  },
  {
    slug: "cashmere",
    name: "Cashmere",
    county: "Chelan County",
    driveMins: 18,
    highway: "US-2 east, 12 miles",
    pitch: "Cashmere is 18 min east on US-2 — Apple Annie + Aplets & Cotlets, then us on the way home.",
    whyStop:
      "Cashmere is small enough that most regulars at Green Life come from down-valley. The drive is short, the highway is direct, and we're right off the Sunnyslope exit before town traffic picks up. Senior discount lands on Sundays.",
    notableNeighbors: ["Leavenworth", "Wenatchee"],
  },
  {
    slug: "east-wenatchee",
    name: "East Wenatchee",
    county: "Douglas County",
    driveMins: 10,
    highway: "Across the Columbia via the bridge",
    pitch: "East Wenatchee to Sunnyslope is 10 min over the bridge — same valley, different county.",
    whyStop:
      "East Wenatchee is a different county (Douglas) but the same valley — staff and customers are 50/50 from each side of the bridge. We're the closest Chelan-County dispensary to anyone in East Wenatchee, Pangborn, or up the Columbia in Rock Island. Worth knowing: Chelan-County retail-cannabis tax differs from Douglas — both pay the WA 37% excise; local rate at the till is the small variance.",
    notableNeighbors: ["Wenatchee", "Rock Island", "Waterville"],
  },
];

export function getTown(slug: string): NearTown | null {
  const match = NEAR_TOWNS.find((t) => t.slug === slug);
  return match ?? null;
}
