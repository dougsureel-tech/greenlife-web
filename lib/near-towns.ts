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
    driveMins: 45,
    highway: "US-97 Alt north along the Columbia",
    pitch: "Chelan to Wenatchee is one shot down US-97 along the Columbia — about 45 minutes door-to-door.",
    whyStop:
      "Chelan locals + summer-house owners drive past Green Life on the way out of town. Stocking up before a long weekend at the lake is the most common reason — pre-rolls for the docks, edibles for the houseboat, flower for the cabin. Cash-only and 21+, but the ATM in-store covers either.",
    notableNeighbors: ["Manson", "Entiat", "Leavenworth"],
    // Long-form template (v33.205) — Doug-approved tone check before
    // scaling to the rest of the high-traffic NEAR_TOWNS set.
    cityCopy: [
      "Chelan to Wenatchee runs about 45 minutes straight down US-97 Alt along the Columbia — one of the prettier drives in the state. Our shop sits right where US-97 meets the Sunnyslope exit, so you're off the highway, parked, and back on the road in about ten minutes.",
      "Who shows up from Chelan: locals year-round, and lake-house owners + visitors all summer. The pattern's the same every June through September — Friday-afternoon arrivals stopping in on the way up to Manson or Wapato Point, Sunday-evening crews swinging through after a weekend at Slidewaters or Tsillan Cellars. Winter slows down but doesn't stop. Ski season pulls a different crowd through — Mission Ridge regulars who'd rather come down through Wenatchee than fight the Stevens Pass traffic out of Leavenworth.",
      "The Leavenworth-pass-through angle matters here. Plenty of Chelan-bound traffic comes east over Stevens, drops down US-2 through Leavenworth, then takes US-97 north to the lake. We're 35 minutes from Leavenworth on US-2 and 45 minutes from Chelan on US-97 — a natural stop in the middle of that route either direction. Cash only at the counter, ATM in the lobby, ID checked at the door per WAC. 21 and up.",
      "We've been on Center Road since 2014 — same building, same valley, the best cannabis staff in the Wenatchee Valley. Order online before you leave Chelan and we'll have it pulled and ready at the counter; the live menu has whatever's on the shelf today. If you'd rather walk in and ask, walk in and ask — that's what the staff is here for.",
    ].join("\n\n"),
  },
  {
    slug: "leavenworth",
    name: "Leavenworth",
    county: "Chelan County",
    driveMins: 35,
    highway: "US-2 east through Tumwater Canyon",
    pitch: "Leavenworth → Wenatchee is 35 min on US-2 — village limits don't allow recreational cannabis, so most folks come down the canyon to us.",
    whyStop:
      "Leavenworth doesn't have a recreational dispensary inside city limits, so locals + tourists driving in from Stevens Pass swing through Wenatchee. Stop on the way home from a Front Street wander, or pair with Pybus Public Market and a stretch along the Columbia.",
    notableNeighbors: ["Cashmere", "Plain", "Lake Wenatchee"],
    // Long-form (v33.305) — second of the 19-page city-SEO arc. Mirrors
    // the Chelan template's voice + structure (drive/parking → who shows
    // up + seasonal → cross-traffic + compliance → tenure + CTA).
    cityCopy: [
      "Leavenworth to Wenatchee runs about 35 minutes east on US-2 through Tumwater Canyon — one of the most-driven stretches of highway in the state during Oktoberfest and Christmas-Lights season, plus the natural exit out of the village for anyone heading anywhere east. Our shop is right off the Sunnyslope exit, so you're off US-2, parked, and back on the road inside ten minutes.",
      "Who shows up from Leavenworth: locals year-round (Leavenworth city ordinance keeps recreational cannabis out of village limits, so the run down the canyon is the routine), plus the visitor flow that shifts shape every season. Front Street wanderers in summer. Oktoberfest crews in September and early October. Christmas-Lights crowds Thanksgiving through New Year's. Stevens Pass skiers all winter, dropping out of the pass and looping through us before heading back east or south.",
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
      "Cashmere is small enough that most regulars at Green Life come from down-valley. The drive is short, the highway is direct, and we’re right off the Sunnyslope exit before town traffic picks up. Wisdom discount lands on Sundays.",
    notableNeighbors: ["Leavenworth", "Wenatchee"],
    // Long-form (v34.005) — 4th of the 19-page city-SEO arc. Cashmere has
    // retail of its own per v33.505 audit, so the framing is drive-by-the-
    // door + Apple Annie pairing, not a "closest" claim. Same Chelan
    // template structure.
    cityCopy: [
      "Cashmere to Wenatchee is about 18 minutes east on US-2 — short hop, direct highway, twelve miles down-valley. Our shop sits right off the Sunnyslope exit, so by the time you’d hit Cashmere-town traffic on the way back, you’re already parked at our door. Free lot out front, no merging back into US-2 traffic to leave.",
      "Who shows up from Cashmere: regulars on the way home from work, weekend errand-chainers pairing the trip with Costco or Pybus, and the Apple Annie + Aplets & Cotlets crowd that already drives down-valley for the orchard-supply runs and tourist-stop pickups. Steady year-round; no big seasonal swing. Friday evenings + Sunday afternoons are the busiest windows.",
      "We see plenty of Cashmere folks running the US-2 corridor for the bigger-store trips — Pybus Public Market, Costco, the Confluence-Park stretch, downtown errands. Adding a stop with us at Sunnyslope usually means one more pull-off on the way back to town, not a detour. Cash only at the counter, ATM in the lobby, ID checked at the door per WAC. 21 and up.",
      "We’ve been on Center Road since 2014 — same building, same valley, the best cannabis staff in the Wenatchee Valley. Order online before you leave Cashmere and we’ll have it pulled and ready at the counter; the live menu has whatever’s on the shelf today. If you’d rather walk in and ask, walk in and ask — that’s what the staff is here for.",
    ].join("\n\n"),
  },
  {
    slug: "east-wenatchee",
    name: "East Wenatchee",
    county: "Douglas County",
    driveMins: 10,
    highway: "Across the Columbia via the bridge",
    pitch: "East Wenatchee to Sunnyslope is 10 min over the bridge — same valley, different county.",
    whyStop:
      "East Wenatchee is a different county (Douglas) but the same valley — staff and customers are 50/50 from each side of the bridge. About ten minutes door-to-door from most of East Wenatchee over the George Sellar Bridge, with an easy Sunnyslope exit on our side.",
    notableNeighbors: ["Wenatchee", "Rock Island", "Waterville"],
    // Long-form (v33.X) — 3rd of the 19-page city-SEO arc. Highest local-
    // pull town in the set (10 min drive, biggest 50/50 customer share).
    // Same Chelan-template structure: drive/parking → who shows up +
    // seasonal → cross-traffic + compliance → tenure + CTA.
    cityCopy: [
      "East Wenatchee to our shop is about 10 minutes — over the George Sellar Bridge, take the first Sunnyslope exit on the Chelan-County side, and you're at the door. Same valley, different county; staff and customers are roughly 50/50 from each side of the river. East Wenatchee residents make up our biggest single in-town customer base.",
      "Who shows up from East Wenatchee: locals year-round, in steady weekday-evening + weekend-afternoon waves. Pangborn-airport folks heading home from a flight, Eastmont parents after school pickup, Costco-and-us combos in the same trip. Summer brings the Apple Capital Loop Trail crowd — bikers and joggers who finish the loop on the Wenatchee side and swing in before crossing back over.",
      "Why the bridge crowd ends up here: most of the things East Wenatchee folks already cross over for — Pybus Public Market, Costco, Confluence Park, the Apple Capital Loop on the Wenatchee-side leg, downtown errands — sit on our side of the river. Adding a stop with us at the Sunnyslope exit usually means no extra route, just one more pull-off on the way back to the bridge. Cash only at the counter, ATM in the lobby, ID checked at the door per WAC. 21 and up.",
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
      "Entiat is small and quiet; Entiat residents driving in for groceries, hardware, or the orchard supply usually pair the trip — we’re right at the Sunnyslope exit before town traffic. Drive is one of the prettier ones in the state if you take it slow along the Columbia.",
    notableNeighbors: ["Chelan", "Wenatchee", "Manson"],
    // Long-form (v34.005) — 5th of the 19-page city-SEO arc. Quiet ag town
    // up the Columbia; pair-the-trip framing is the real driver.
    cityCopy: [
      "Entiat to Wenatchee is about 25 minutes straight down US-97 Alt along the Columbia — seventeen miles, river on your left the whole way. Our shop sits right at the Sunnyslope exit before town traffic picks up, so you’re off the highway, parked, and back on the road inside ten minutes. Free lot out front.",
      "Who shows up from Entiat: ag-side regulars on the way to or from down-valley errands, summer-weekend boaters out to the Columbia and the orchards, and the steady year-round flow of folks running the US-97 corridor for groceries, hardware, or feed. The drive shape is the same in both seasons — Entiat doesn’t have a tourist pulse the way Chelan does, but the river-side highway pulls regulars through Sunnyslope on every up-and-back.",
      "Most Entiat folks pair the trip — Costco, Pybus Public Market, the Wenatchee Valley Mall, orchard-supply runs. Adding a stop with us at the Sunnyslope exit usually means no detour at all; we’re the first thing you hit coming down US-97 into the valley. Cash only at the counter, ATM in the lobby, ID checked at the door per WAC. 21 and up.",
      "We’ve been on Center Road since 2014 — same building, same valley, the best cannabis staff in the Wenatchee Valley. Order online before you leave Entiat and we’ll have it pulled and ready at the counter; the live menu has whatever’s on the shelf today. If you’d rather walk in and ask, walk in and ask — that’s what the staff is here for.",
    ].join("\n\n"),
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
    // Long-form (v34.005) — 6th of the 19-page city-SEO arc. Lake-side
    // cabin community across from Chelan; pairs naturally with the Chelan
    // page. Per v33.905 Doug correction, NO "closest" claim — 3+ shops sit
    // between the lake and Sunnyslope on US-97.
    cityCopy: [
      "Manson to Wenatchee runs about 65 minutes — WA-150 around the north shore of Lake Chelan, then US-97 Alt south along the Columbia. Long drive but a pretty one; lake on one side, river on the other. Our shop sits right where US-97 meets the Sunnyslope exit, so you’re off the highway, parked, and back on the road in about ten minutes.",
      "Who shows up from Manson: lake-house owners stocking before a weekend at Wapato Point or Mill Bay, year-round residents pairing the run with a Pybus or Costco trip, and the summer crowd that loops down for the bigger-store inventory. Friday afternoons up, Sunday evenings back — that’s the rhythm June through September. Quieter in winter but Mission Ridge season pulls a steady Manson cohort through.",
      "Manson and Chelan share the lake and they share the drive. Most of the trip-pairings folks come down for — Pybus Public Market, Costco, the Wenatchee Valley Mall, hardware runs — sit on the south end of the valley, so we’re a natural stop on the way through. Cash only at the counter, ATM in the lobby, ID checked at the door per WAC. 21 and up.",
      "We’ve been on Center Road since 2014 — same building, same valley, the best cannabis staff in the Wenatchee Valley. Order online before you leave Manson and we’ll have it pulled and ready at the counter; the live menu has whatever’s on the shelf today. If you’d rather walk in and ask, walk in and ask — that’s what the staff is here for.",
    ].join("\n\n"),
  },
  {
    slug: "plain",
    name: "Plain",
    county: "Chelan County",
    driveMins: 45,
    highway: "US-2 east + Chumstick Hwy north",
    pitch: "Plain → Leavenworth → Wenatchee, 45 min total — a Chumstick Hwy shot down US-2.",
    whyStop:
      "Plain is small + tucked north of Leavenworth. Most Plain regulars pair the run with a Leavenworth detour or a Lake Wenatchee swim stop. We open at 8 AM so an early-morning errand chain works.",
    notableNeighbors: ["Leavenworth", "Lake Wenatchee", "Cashmere"],
    // Long-form (v34.005) — 7th of the 19-page city-SEO arc. Small town
    // north of Leavenworth via Chumstick Hwy; route-pairing framing.
    cityCopy: [
      "Plain to Wenatchee is about 45 minutes — Chumstick Highway south to Leavenworth, then US-2 east through Tumwater Canyon. Two-stage drive but a pretty one; orchards and pine through Chumstick, river-canyon through Tumwater. Our shop sits right off the Sunnyslope exit, so once you’re past Leavenworth you’re fifteen minutes from being parked at our door.",
      "Who shows up from Plain: cabin owners, year-round residents pairing the run with errands down-valley, and the summer crowd looping through Lake Wenatchee + Leavenworth on the way in or out. Plain’s small enough that we see most regulars once a month for a stock-up rather than weekly — the long drive shapes the trip into a real haul rather than a swing-by.",
      "The Plain → Leavenworth → Wenatchee chain is the same route the Stevens Pass cabin crowd runs, so a lot of Plain trips end up paired with a Front Street wander, a Lake Wenatchee swim stop in summer, or a Pybus + Costco loop down-valley. We’re a natural stop in the middle. Cash only at the counter, ATM in the lobby, ID checked at the door per WAC. 21 and up.",
      "We’ve been on Center Road since 2014 — same building, same valley, the best cannabis staff in the Wenatchee Valley. Order online before you leave Plain and we’ll have it pulled and ready at the counter; the live menu has whatever’s on the shelf today. If you’d rather walk in and ask, walk in and ask — that’s what the staff is here for.",
    ].join("\n\n"),
  },
  {
    slug: "lake-wenatchee",
    name: "Lake Wenatchee",
    county: "Chelan County",
    driveMins: 50,
    highway: "US-2 east + WA-207 north",
    pitch: "Lake Wenatchee to Sunnyslope is 50 min via US-2 — straight shot from the cabins down the canyon.",
    whyStop:
      "Lake Wenatchee is a cabin-and-ski destination — cabin owners + weekend visitors stock before the drive in. We’re right off US-2 on the way home from Stevens Pass. Cash only, but the in-store ATM covers it.",
    notableNeighbors: ["Plain", "Leavenworth", "Cashmere"],
    // Long-form (v34.005) — 8th of the 19-page city-SEO arc. Recreation
    // lake; cabin-and-ski cohort. WA-207 south + US-2 east into Sunnyslope.
    cityCopy: [
      "Lake Wenatchee to our shop is about 50 minutes — WA-207 south to the US-2 junction, then east through Tumwater Canyon and down into Sunnyslope. Straight shot down the canyon once you’re on US-2. Our shop sits right at the Sunnyslope exit, so you’re off the highway, parked, and back on the road in about ten minutes.",
      "Who shows up from Lake Wenatchee: cabin owners stocking for a weekend or a week, summer visitors arriving on Friday afternoon, ski-season crews coming off Stevens Pass who route through Leavenworth and down the canyon. The pattern shifts seasonally but the drive doesn’t — same canyon, same exit, year-round. Most trips end up paired with a Leavenworth Front Street walk on the way through.",
      "Most of the lake-house and cabin restocks pair us with the bigger-store stops down-valley — Pybus Public Market, Costco, the Wenatchee Valley Mall, hardware runs. We’re a natural stop on the way back up, last thing before you climb back into the canyon. Cash only at the counter, ATM in the lobby, ID checked at the door per WAC. 21 and up.",
      "We’ve been on Center Road since 2014 — same building, same valley, the best cannabis staff in the Wenatchee Valley. Order online before you leave the lake and we’ll have it pulled and ready at the counter; the live menu has whatever’s on the shelf today. If you’d rather walk in and ask, walk in and ask — that’s what the staff is here for.",
    ].join("\n\n"),
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
    slug: "rock-island",
    name: "Rock Island",
    county: "Douglas County",
    driveMins: 18,
    highway: "Across the Columbia via the bridge + south",
    pitch: "Rock Island to Sunnyslope is 18 min — over the bridge and back up through Wenatchee.",
    whyStop:
      "Rock Island is small + Douglas-County-side, just south of East Wenatchee along the river. Most regulars pair the run with the routine East Wenatchee trips — Costco, Pybus, hardware. Same valley, different county.",
    notableNeighbors: ["East Wenatchee", "Waterville", "Wenatchee"],
    // Long-form (v34.005) — 9th of the 19-page city-SEO arc. Small Douglas-
    // County town south of East Wenatchee along the river. Trip-pairing
    // framing; no superlatives.
    cityCopy: [
      "Rock Island to our shop is about 18 minutes — north along the Columbia, over the George Sellar Bridge, then the first Sunnyslope exit on the Chelan-County side. Short hop along the river either direction. Free lot out front, no merging back into US-2 traffic to leave.",
      "Who shows up from Rock Island: year-round regulars pairing the run with the East Wenatchee errands they already do — Costco, Pybus Public Market, the Wenatchee Valley Mall, hardware on Sunset. Summer pulls the Apple Capital Loop Trail crowd through; we see a steady stream of bikers and joggers who finish the loop on the Wenatchee side and swing in before crossing back.",
      "Rock Island, Malaga, East Wenatchee — same valley, different county. The trip-pairing logic is the same one East Wenatchee folks run: most of what you already cross over for sits on our side of the river, so adding a stop with us at Sunnyslope is one more pull-off, not a detour. Cash only at the counter, ATM in the lobby, ID checked at the door per WAC. 21 and up.",
      "We’ve been on Center Road since 2014 — same building, same valley, the best cannabis staff in the Wenatchee Valley. Order online from Rock Island and we’ll have it pulled and ready at the counter; the live menu has whatever’s on the shelf today. If you’d rather walk in and ask, walk in and ask — that’s what the staff is here for.",
    ].join("\n\n"),
  },
  {
    slug: "orondo",
    name: "Orondo",
    county: "Douglas County",
    driveMins: 30,
    highway: "US-97 north up the east side of the Columbia",
    pitch: "Orondo to Sunnyslope is 30 min — US-97 down the east bank, across the bridge, into the shop.",
    whyStop:
      "Orondo is orchard country up the east bank of the Columbia. Most Orondo regulars pair the run with Pybus or Costco. Bavarian Lavender + the orchard-supply runs are the usual pairing.",
    notableNeighbors: ["East Wenatchee", "Waterville", "Entiat"],
    // Long-form (v34.005) — 10th of the 19-page city-SEO arc. Orchard +
    // Bavarian Lavender pairing. Douglas County east side of the Columbia.
    cityCopy: [
      "Orondo to our shop is about 30 minutes — US-97 south along the east bank of the Columbia, over the George Sellar Bridge into East Wenatchee, then the first Sunnyslope exit on the Chelan-County side. Pretty drive, orchards on your left the whole way down. Our shop sits right off the exit, so you’re parked and back on the road in about ten minutes.",
      "Who shows up from Orondo: orchard-side regulars on the way to or from down-valley errands, the Bavarian Lavender + farm-stand crowd pairing trips through summer, and the steady year-round flow of folks running US-97 for groceries, hardware, or feed. Orondo doesn’t have a big tourist pulse, but the east-bank highway is the natural route into Wenatchee for everything north of East Wenatchee.",
      "Most Orondo trips pair us with the bigger-store stops on the Chelan-County side — Pybus Public Market, Costco, the Wenatchee Valley Mall. Adding a stop with us at the Sunnyslope exit is one more pull-off on the way back to the bridge. Cash only at the counter, ATM in the lobby, ID checked at the door per WAC. 21 and up.",
      "We’ve been on Center Road since 2014 — same building, same valley, the best cannabis staff in the Wenatchee Valley. Order online before you leave Orondo and we’ll have it pulled and ready at the counter; the live menu has whatever’s on the shelf today. If you’d rather walk in and ask, walk in and ask — that’s what the staff is here for.",
    ].join("\n\n"),
  },
  {
    slug: "stevens-pass",
    name: "Stevens Pass",
    county: "Chelan County",
    driveMins: 65,
    highway: "US-2 east down the canyon",
    pitch: "Stevens Pass to Sunnyslope is 65 min on US-2 — down through Leavenworth and into the valley.",
    whyStop:
      "Stevens Pass pulls a steady ski-season crowd coming down off the pass through Leavenworth and into Wenatchee. We’re right off US-2 at the Sunnyslope exit. Cash only, ATM in-store. Summer hiking traffic does the same loop.",
    notableNeighbors: ["Leavenworth", "Lake Wenatchee", "Plain"],
    // Long-form (v34.005) — 11th of the 19-page city-SEO arc. Seasonal
    // ski-area pull-through; pass-area Chelan-County designation.
    cityCopy: [
      "Stevens Pass to our shop is about 65 minutes east on US-2 — down through Tumwater Canyon, past Leavenworth, and into Sunnyslope. The drive opens up once you’re past the pass; canyon, then orchards, then the valley. Our shop sits right at the Sunnyslope exit, so you’re off the highway, parked, and back on the road in about ten minutes.",
      "Who shows up from Stevens Pass: ski-season skiers and snowboarders all winter long, dropping out of the pass and looping through Wenatchee on the way back east or south. Summer flips the cohort — hikers and PCT through-hikers, the Lake Wenatchee + Leavenworth weekend crowd, climbers headed to Icicle Creek. Pattern is the same either season: come down the canyon, swing through us on the way through.",
      "The Stevens Pass crowd is the one that makes US-2 the seasonal artery — west-side traffic coming over the pass, Leavenworth as the first stop, then us in the middle of the route before continuing on to Chelan or back south. We’re a natural pull-off. Cash only at the counter, ATM in the lobby, ID checked at the door per WAC. 21 and up.",
      "We’ve been on Center Road since 2014 — same building, same valley, the best cannabis staff in the Wenatchee Valley. Order online before you head down the pass and we’ll have it pulled and ready at the counter; the live menu has whatever’s on the shelf today. If you’d rather walk in and ask, walk in and ask — that’s what the staff is here for.",
    ].join("\n\n"),
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
