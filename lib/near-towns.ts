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
  // OPTIONAL 200-400 word long-form section for higher-SEO-value towns.
  // When present, the /near/<town> page renders it BETWEEN the drive-time
  // tiles and the standard whyStop paragraph — gives Google enough body
  // copy to outrank "[town] dispensary" generic listings without padding.
  // Voice: same as whyStop, but with room to name landmarks + describe
  // who actually shows up. Chelan is the template (v33.205); other
  // high-traffic towns (Leavenworth, East Wenatchee, Lake Wenatchee)
  // queued for the same treatment.
  // Constraint: WAC 314-55-155 — no effect/medical/promotional claims.
  // Stay in "experience / who shows up / local vibe" lane.
  cityCopy?: string;
};

export const NEAR_TOWNS: readonly NearTown[] = [
  {
    slug: "chelan",
    name: "Chelan",
    county: "Chelan County",
    driveMins: 55,
    highway: "US-97 Alt north along the Columbia",
    pitch: "Chelan to Wenatchee is one shot down US-97 along the Columbia — we're the closest legal cannabis to the lake.",
    whyStop:
      "Chelan locals + summer-house owners drive past Green Life on the way out of town. Stocking up before a long weekend at the lake is the most common reason — pre-rolls for the docks, edibles for the houseboat, flower for the cabin. Cash-only and 21+, but the ATM in-store covers either.",
    notableNeighbors: ["Manson", "Entiat", "Leavenworth"],
    // Long-form template (v33.205) — Doug-approved tone check before
    // scaling to the rest of the high-traffic NEAR_TOWNS set.
    cityCopy: [
      "Chelan to Wenatchee runs about 55 minutes straight down US-97 Alt along the Columbia — one of the prettier hours of highway in the state, and the only stretch between Chelan Falls and Entiat where there's nowhere to pull over for cannabis. Our shop sits right where US-97 meets the Sunnyslope exit, so you're off the highway, parked, and back on the road in about ten minutes.",
      "Who shows up from Chelan: locals year-round, and lake-house owners + visitors all summer. The pattern's the same every June through September — Friday-afternoon arrivals stopping in on the way up to Manson or Wapato Point, Sunday-evening crews swinging through after a weekend at Slidewaters or Tsillan Cellars. Winter slows down but doesn't stop. Ski season pulls a different crowd through — Mission Ridge regulars who'd rather come down through Wenatchee than fight the Stevens Pass traffic out of Leavenworth.",
      "The Leavenworth-pass-through angle matters here. Plenty of Chelan-bound traffic comes east over Stevens, drops down US-2 through Leavenworth, then takes US-97 north to the lake. We're 35 minutes from Leavenworth on US-2 and 55 minutes from Chelan on US-97 — the natural stop in the middle of that route either direction. Cash only at the counter, ATM in the lobby, ID checked at the door per WAC. 21 and up.",
      "We've been on Center Road since 2014 — same building, same valley, the best cannabis staff in the Wenatchee Valley. Order online before you leave Chelan and we'll have it pulled and ready at the counter; the live menu has whatever's on the shelf today. If you'd rather walk in and ask, walk in and ask — that's what the staff is here for.",
    ].join("\n\n"),
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
    // Long-form (v33.305) — second of the 19-page city-SEO arc. Mirrors
    // the Chelan template's voice + structure (drive/parking → who shows
    // up + seasonal → cross-traffic + compliance → tenure + CTA).
    cityCopy: [
      "Leavenworth to Wenatchee runs about 35 minutes east on US-2 through Tumwater Canyon — one of the most-driven stretches of highway in the state during Oktoberfest and Christmas-Lights season, plus the natural exit out of the village for anyone heading anywhere east. Our shop is right off the Sunnyslope exit, so you're off US-2, parked, and back on the road inside ten minutes.",
      "Who shows up from Leavenworth: locals year-round (Leavenworth city ordinance keeps recreational cannabis out of village limits — Wenatchee is the legal closest), plus the visitor flow that shifts shape every season. Front Street wanderers in summer. Oktoberfest crews in September and early October. Christmas-Lights crowds Thanksgiving through New Year's. Stevens Pass skiers all winter, dropping out of the pass and looping through us before heading back east or south.",
      "The Stevens Pass angle matters here. Plenty of west-side traffic comes east over the pass, drops down US-2 through Leavenworth, and picks up groceries-plus-cannabis in Wenatchee before continuing on to Chelan or back toward the Tri-Cities. We're the natural stop in the middle of that route. Cash only at the counter, ATM in the lobby, ID checked at the door per WAC. 21 and up.",
      "We've been on Center Road since 2014 — same building, same valley, the best cannabis staff in the Wenatchee Valley. Order online before you leave Leavenworth and we'll have it pulled and ready at the counter; the live menu has whatever's on the shelf today. If you'd rather walk in and ask, walk in and ask — that's what the staff is here for.",
    ].join("\n\n"),
  },
  {
    slug: "cashmere",
    name: "Cashmere",
    county: "Chelan County",
    driveMins: 18,
    highway: "US-2 east, 12 miles",
    pitch: "Cashmere is 18 min east on US-2 — Apple Annie + Aplets & Cotlets, then us on the way home.",
    whyStop:
      "Cashmere is small enough that most regulars at Green Life come from down-valley. The drive is short, the highway is direct, and we're right off the Sunnyslope exit before town traffic picks up. Wisdom discount lands on Sundays.",
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
    // Long-form (v33.X) — 3rd of the 19-page city-SEO arc. Highest local-
    // pull town in the set (10 min drive, biggest 50/50 customer share).
    // Same Chelan-template structure: drive/parking → who shows up +
    // seasonal → cross-traffic + compliance → tenure + CTA.
    cityCopy: [
      "East Wenatchee to our shop is about 10 minutes — over the George Sellar Bridge, take the first Sunnyslope exit on the Chelan-County side, and you're at the door. Same valley, different county; staff and customers are roughly 50/50 from each side of the river. East Wenatchee residents make up our biggest single in-town customer base.",
      "Who shows up from East Wenatchee: locals year-round, in steady weekday-evening + weekend-afternoon waves. Pangborn-airport folks heading home from a flight, Eastmont parents after school pickup, Costco-and-us combos in the same trip. Summer brings the Apple Capital Loop Trail crowd — bikers and joggers who finish the loop on the Wenatchee side and swing in before crossing back over.",
      "The county-line angle is the one wrinkle worth knowing. East Wenatchee sits in Douglas County; we sit in Chelan. Both stores in town pay the WA 37% cannabis excise (state, not local), but the small local sales-tax variance is real — the till handles it automatically. Cash only at the counter, ATM in the lobby, ID checked at the door per WAC. 21 and up.",
      "We've been on Center Road since 2014 — same building, same valley, the best cannabis staff in the Wenatchee Valley. Order online from East Wenatchee and we'll have it pulled and ready at the counter; the live menu has whatever's on the shelf today. If you'd rather walk in and ask, walk in and ask — that's what the staff is here for.",
    ].join("\n\n"),
  },
  {
    slug: "entiat",
    name: "Entiat",
    county: "Chelan County",
    driveMins: 25,
    highway: "US-97 Alt north, 17 miles up the Columbia",
    pitch: "Entiat to Wenatchee is 25 min straight down US-97 along the river — easiest legal cannabis run from town.",
    whyStop:
      "Entiat is small and quiet; the closest dispensary inside Chelan County is us. Entiat residents driving in for groceries, hardware, or the orchard supply usually pair the trip — we're right at the Sunnyslope exit before town traffic. Drive is one of the prettier ones in the state if you take it slow along the Columbia.",
    notableNeighbors: ["Chelan", "Wenatchee", "Manson"],
  },
  {
    slug: "manson",
    name: "Manson",
    county: "Chelan County",
    driveMins: 65,
    highway: "US-97 Alt north + WA-150 around the lake",
    pitch: "Manson sits across Lake Chelan from town — about an hour to us via US-97 + the bridge.",
    whyStop:
      "Manson + Chelan share the lake; both come down to Wenatchee for the bigger-store trips. Wisdom discount runs Sunday, online discount runs all week. Pair with Pybus Public Market or a Costco run on the way back.",
    notableNeighbors: ["Chelan", "Entiat", "Lake Wenatchee"],
  },
  {
    slug: "plain",
    name: "Plain",
    county: "Chelan County",
    driveMins: 45,
    highway: "US-2 east + Chumstick Hwy north",
    pitch: "Plain → Leavenworth → Wenatchee, 45 min total — a Chumstick Hwy shot down US-2.",
    whyStop:
      "Plain is small + tucked north of Leavenworth — closest legal cannabis is the Wenatchee Valley. Most Plain regulars pair the run with a Leavenworth detour or a Lake Wenatchee swim stop. We open at 8 AM so an early-morning errand chain works.",
    notableNeighbors: ["Leavenworth", "Lake Wenatchee", "Cashmere"],
  },
  {
    slug: "lake-wenatchee",
    name: "Lake Wenatchee",
    county: "Chelan County",
    driveMins: 50,
    highway: "US-2 east + WA-207 north",
    pitch: "Lake Wenatchee to Sunnyslope is 50 min via US-2 — closest dispensary to the lake + the cabins.",
    whyStop:
      "Lake Wenatchee is a cabin-and-ski destination — no dispensary up there, so cabin owners + weekend visitors stock before the drive in. We're right off US-2 on the way home from Stevens Pass. Cash only, but the in-store ATM covers it.",
    notableNeighbors: ["Plain", "Leavenworth", "Cashmere"],
  },
  {
    slug: "sunnyslope",
    name: "Sunnyslope",
    county: "Chelan County",
    driveMins: 0,
    highway: "Walk or 5-min drive — we're IN Sunnyslope",
    pitch: "We are Sunnyslope's dispensary — Center Road right off the US-2/US-97 split.",
    whyStop:
      "Sunnyslope is the neighborhood the store sits in — the corner of Center Rd, the side of town with Ohme Gardens up the bluff and the Columbia turn into Wenatchee. Most Sunnyslope regulars walk or bike in. Free parking out front; ATM for the cash-only till.",
    notableNeighbors: ["Wenatchee", "East Wenatchee", "Cashmere"],
  },
  {
    slug: "wapato-point",
    name: "Wapato Point",
    county: "Chelan County",
    driveMins: 70,
    highway: "US-97 Alt + WA-150 around Lake Chelan to Manson",
    pitch: "Wapato Point cabin owners come down to Wenatchee — about 70 min via US-97 around the lake.",
    whyStop:
      "Wapato Point is the resort + cabin community on the north side of Lake Chelan. No legal cannabis up there. Most regulars stock for the week before the drive in. The route back down US-97 is one of the prettier ones in the state.",
    notableNeighbors: ["Manson", "Chelan", "Wenatchee"],
  },
  {
    slug: "pateros",
    name: "Pateros",
    county: "Okanogan County",
    driveMins: 90,
    highway: "US-97 Alt north along the Columbia",
    pitch: "Pateros is 90 min north of us — the closest Chelan-County dispensary if you're driving south.",
    whyStop:
      "Pateros sits at the Columbia/Methow confluence. Closest legal dispensary going south is the Wenatchee Valley — straight US-97 along the river. Most Pateros + Brewster regulars pair the trip with a Costco or Pybus run.",
    notableNeighbors: ["Brewster", "Chelan", "Manson"],
  },
  {
    slug: "waterville",
    name: "Waterville",
    county: "Douglas County",
    driveMins: 35,
    highway: "US-2 east + WA-2 climb up the plateau",
    pitch: "Waterville to Wenatchee is 35 min down the plateau — closest dispensary off the bench.",
    whyStop:
      "Waterville sits up on the Columbia Plateau — quiet, agricultural, the highest county seat in WA. Closest dispensary down off the bench is us. Pair the drive with errands at Costco or Pybus.",
    notableNeighbors: ["East Wenatchee", "Wenatchee", "Rock Island"],
  },
  {
    slug: "quincy",
    name: "Quincy",
    county: "Grant County",
    driveMins: 45,
    highway: "WA-28 east across the Columbia, then south",
    pitch: "Quincy to Wenatchee is 45 min west — closest in-Wenatchee-Valley dispensary.",
    whyStop:
      "Quincy + George + Crescent Bar share the cluster east of the Columbia. Quincy has its own retail but Wenatchee Valley brands + selection pulls regulars in for the bigger trip. Worth knowing: Grant + Chelan retail-cannabis tax differs slightly at the till.",
    notableNeighbors: ["Crescent Bar", "East Wenatchee", "Waterville"],
  },
  {
    slug: "crescent-bar",
    name: "Crescent Bar",
    county: "Grant County",
    driveMins: 50,
    highway: "WA-28 east across the Columbia, south to the bar",
    pitch: "Crescent Bar to Wenatchee is 50 min — the closest Chelan-County dispensary across the river.",
    whyStop:
      "Crescent Bar is the resort + condo enclave on the Columbia south of Quincy. Closest legal cannabis is Wenatchee Valley — pair the run with a Pybus or Costco stop. We open 8 AM daily so an early-morning errand chain works.",
    notableNeighbors: ["Quincy", "East Wenatchee", "Wenatchee"],
  },
  {
    slug: "brewster",
    name: "Brewster",
    county: "Okanogan County",
    driveMins: 75,
    highway: "US-97 Alt north along the Columbia",
    pitch: "Brewster to Wenatchee is 75 min straight south on US-97 — same river, same highway.",
    whyStop:
      "Brewster sits at the Methow + Columbia confluence north of Pateros. Closest legal dispensary going south is the Wenatchee Valley. Most Brewster + Bridgeport regulars pair the trip with a Costco or Pybus run; the Lake Chelan stretch makes it a scenic detour.",
    notableNeighbors: ["Pateros", "Bridgeport", "Chelan"],
  },
  {
    slug: "methow-valley",
    name: "Methow Valley",
    county: "Okanogan County",
    driveMins: 120,
    highway: "WA-153 + US-97 south along the Methow + Columbia",
    pitch: "Twisp / Winthrop to Wenatchee is ~2 hr — closest legal dispensary going south.",
    whyStop:
      "Methow Valley (Twisp, Winthrop, Mazama, Carlton) doesn't have a recreational dispensary inside the valley; the closest legal cannabis going south is the Wenatchee Valley. A summer-weekend or ski-trip stop on the way in or out — pair with Pybus, the river walk, or a Stevens Pass loop.",
    notableNeighbors: ["Brewster", "Pateros", "Lake Wenatchee"],
  },
];

export function getTown(slug: string): NearTown | null {
  const match = NEAR_TOWNS.find((t) => t.slug === slug);
  return match ?? null;
}
