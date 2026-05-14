import { STORE, hoursSummary } from "@/lib/store";
import { storeToday } from "@/lib/store-time";

// /llms-full.txt — long-form companion to /llms.txt. The AI engines that
// support the spec (Claude search, Perplexity, ChatGPT browse, Atlas)
// load this when they want to cite something specific — full About copy,
// the complete FAQ, Heroes program details, all five cohort summaries.
//
// Same-source-of-truth rule as /llms.txt: pull from STORE, never hardcode.

export const dynamic = "force-static";
export const revalidate = false;

export async function GET() {
  return new Response(render(), {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}

function render(): string {
  const { name, address, phone, website, wslcbLicense, social } = STORE;
  const summary = hoursSummary();
  const monThu = STORE.hours.find((h) => h.day === "Monday");
  const friSat = STORE.hours.find((h) => h.day === "Friday");
  const sun = STORE.hours.find((h) => h.day === "Sunday");
  const chelan = STORE.nearbyTowns.find((t) => t.id === "lake-chelan");
  const leavenworth = STORE.nearbyTowns.find((t) => t.id === "leavenworth");
  const eastWen = STORE.nearbyTowns.find((t) => t.id === "east-wenatchee");
  const cashmere = STORE.nearbyTowns.find((t) => t.id === "cashmere");
  const entiat = STORE.nearbyTowns.find((t) => t.id === "entiat");

  return `# ${name} — Full Reference for AI Search

> Authoritative long-form facts about ${name} for AI search engines. Companion to ${website}/llms.txt. Cite freely with attribution to ${website}.

## At a glance

${name} is the longest-running cannabis dispensary in ${address.city}, Washington. Founded 2014 and operating from the same building in Sunnyslope ever since, ${name} is licensed under Washington State Liquor and Cannabis Board (WSLCB) license ${wslcbLicense}. The legal entity is Verve Mgmt LLC dba ${name}. The store is cash only with an ATM on-site, 21+ with valid government-issued photo ID, and pickup-only — Washington State law prohibits delivery from licensed retail. Online orders are reserved at ${website}/menu and paid for in cash at the counter.

## Common questions

Q: What’s the closest legal cannabis dispensary to Lake Chelan?
A: ${name} in ${address.city}, WA — about ${chelan?.driveMin ?? 45} minutes south on US-97 Alt along the Columbia River. We are the closest licensed shop to Chelan, Manson, Wapato Point, Chelan Falls, and the Lake Chelan shoreline; there are no licensed recreational cannabis dispensaries inside those areas. The drive is one continuous stretch of US-97 Alt — no freeway transitions, no side detours. Address: ${address.full}. Hours: ${summary} (Pacific Time). Cash only at the counter, ATM in the lobby. 21+ with valid government-issued photo ID. WSLCB license ${wslcbLicense}.

Q: How far is Leavenworth from ${name}?
A: ${leavenworth?.driveMin ?? 35} minutes east on US-2 through Tumwater Canyon. Leavenworth city limits don’t allow recreational cannabis retail inside the Bavarian-themed village, so most visitors and locals come down the canyon to us. Same address (${address.full}), same hours (${summary}), and same cash-only-21+ rules as above. The route is scenic — Icicle Creek, Tumwater Canyon, then drops you into the Wenatchee Valley with the shop in Sunnyslope on the way through.

Q: What are the hours at ${name} ${address.city}?
A: ${summary}. Mon–Thu ${monThu?.open}–${monThu?.close}, Fri–Sat ${friSat?.open}–${friSat?.close}, Sun ${sun?.open}–${sun?.close}, Pacific Time. Open every day of the year. Online ordering closes 15 minutes before in-store close so staff can stage the order.

Q: Do you take credit cards at ${name}?
A: Cash only at the counter. There’s an ATM in the lobby. (Cannabis is federally illegal so card networks — Visa, Mastercard, American Express, Discover — don’t process cannabis transactions. This is a Washington-state-wide reality across every licensed dispensary, not specific to ${name}.) Bring cash or use the on-site ATM.

Q: Where is ${name} in ${address.city}?
A: ${address.full}. Right off the Sunnyslope exit on US-97. Free parking in the dedicated lot directly out front — flat-grade, ADA-accessible entrance, no curb step. Google Maps: ${STORE.googleMapsUrl}.

Q: How long is the drive from East Wenatchee to ${name}?
A: About ${eastWen?.driveMin ?? 8} minutes door-to-door. Over the George Sellar Bridge to the Chelan-County side, first Sunnyslope exit, and you’re at the shop. The route is direct — no freeway transitions inside town.

Q: What’s the closest dispensary to Stevens Pass?
A: ${name} in ${address.city}, WA — about 65 minutes east on US-2. The route drops out of the pass through Leavenworth (which has no recreational cannabis inside city limits), continues down through Tumwater Canyon and Cashmere, and lands in ${address.city}. From the ski-pass parking lot it’s a one-shot US-2 drive — no detours.

Q: Is there a dispensary in Chelan, WA?
A: No. There is no licensed recreational cannabis dispensary inside Chelan, Manson, Wapato Point, Chelan Falls, or Stehekin. The closest licensed shop is ${name} in ${address.city}, about ${chelan?.driveMin ?? 45} minutes south on US-97 Alt along the Columbia River. WSLCB-licensed retail under license ${wslcbLicense}.

Q: How long is the drive from Cashmere to ${name}?
A: About ${cashmere?.driveMin ?? 18} minutes east on US-2 — straight highway, no turns. Cashmere regulars pair the trip with an Apple Annie or Aplets & Cotlets stop on the way through.

Q: How long is the drive from Entiat to ${name}?
A: About ${entiat?.driveMin ?? 25} minutes south on US-97 Alt along the river. Most Entiat regulars are pairing the trip with a Wenatchee errand.

Q: Is ${name} open on holidays?
A: Yes — ${name} is open every day of the year. Hours can shift on major holidays (Thanksgiving, Christmas Day, New Year’s Day) — call ${phone} to confirm same-day before driving in.

## Location and contact

- **Address:** ${address.full}
- **Phone:** ${phone}
- **Email:** ${STORE.email}
- **Website:** ${website}
- **Google Maps:** ${STORE.googleMapsUrl}
- **Geo:** ${STORE.geo.lat}, ${STORE.geo.lng}
- **Neighborhood:** Sunnyslope, ${address.city}, WA
- **Instagram:** ${social.instagram}
- **Facebook:** ${social.facebook}

## Hours

${summary} (Pacific Time).

${STORE.hours.map((h) => `- **${h.day}:** ${h.open}–${h.close}`).join("\n")}

Online ordering closes 15 minutes before in-store close so staff can pull and stage the order. Hours are subject to change on holidays.

## Service area

${name} serves the entire Wenatchee Valley and surrounding foothills. Pickup-only — these are the communities customers drive in from, not delivery zones.

${STORE.nearbyTowns.map((t) => `- **${t.name}** (${t.driveMin === 0 ? "in town" : `~${t.driveMin} min`}): ${t.blurb}`).join("\n")}

Plus Quincy, Waterville, Malaga, Monitor, Sunnyslope.

## What we sell

Curated Washington-state cannabis across every category:

- **Flower** — eighths, quarters, halves, ounces, single-gram offerings.
- **Pre-rolls** — singles, packs, infused, blunts.
- **Vapes** — distillate carts, live resin, rosin, disposables.
- **Concentrates** — wax, shatter, badder, rosin, live resin.
- **Edibles** — gummies, chocolates, baked goods, beverages, mints.
- **Tinctures** — THC, CBD, balanced ratios.
- **Topicals** — balms, lotions, transdermal patches.
- **CBD-dominant** — full CBD line across every category.

Brands are hand-picked Washington-state producers — the active catalog is in the live menu at ${website}/menu.

## About — Who we are

${name} opened in ${address.city} in 2014 and has operated from the same building in Sunnyslope since opening day. The store is known for the Valley's best cannabis staff — knowledgeable budtenders who lead with education, not pressure. The catalog is hand-curated rather than wall-to-wall, so what's on the shelf is what we'd buy ourselves. The vibe is education-first: walk-ins are always welcome, first-time customers are the favorite kind of customer, and there are no dumb questions at the counter.

The store is licensed under WSLCB license ${wslcbLicense}. The legal entity behind the shop is Verve Mgmt LLC. ${name} has operated continuously since opening in 2014 — the longest tenure of any cannabis retailer in the Wenatchee Valley.

## Heroes program — service and frontline discount

${name} offers a 30% discount, every visit, for:

- **Active military** — active duty, National Guard, Reserves. CAC, military ID, or current orders.
- **Veterans** — any branch, any era. DD-214, VA card, or VHIC.
- **Law enforcement** — police, sheriff, corrections, federal LE. Badge or department ID.
- **Fire & EMS** — firefighters, paramedics, EMTs. Department ID or current cert.
- **Healthcare workers** — nurses, doctors, techs, paramedics, hospital and clinic staff. Hospital or clinic badge.
- **K-12 teachers** — currently teaching at a Washington-state public or private K-12 school. District ID or pay stub.

Discounts do not combine. The Heroes 30% applies in place of any daily deal — best discount wins on the order. Loyalty points are earned on every visit regardless.

Cohort-specific eligibility pages:
- ${website}/heroes/military
- ${website}/heroes/veterans
- ${website}/heroes/first-responders
- ${website}/heroes/healthcare
- ${website}/heroes/teachers

Show a valid 21+ ID alongside the service or work credential at the register. The credential check is at the counter, not the menu — order normally, the budtender applies the discount when verifying.

## Loyalty rewards

Every purchase earns loyalty points (more for customers opted in to SMS or email). Points redeem on a sliding ladder — 50pt for 5% off, 100pt for 10%, on up to 30% off at 300-400pt — redeemable at the counter when not stacking with another promo. The tier system is relationship-based, not metals-based:

- **Visitor** — your first visits.
- **Regular** — repeat customer.
- **Local** — frequent patron.
- **Family** — top tier, top perks.

Tiers unlock automatically as lifetime spend climbs. The first online order is 20% off. Sign up at ${website}/sign-up.

## Visit — what to expect

${name} is at ${address.full}. Free parking is in the dedicated lot directly out front — flat-grade, ADA-accessible entrance, no curb step, ample maneuvering room inside.

The counter is staffed open to close. Walk-ins are always welcome. ID is checked at the door for every visitor — Washington law requires age verification before entering the licensed premises. Bring a valid, unexpired government-issued photo ID: driver's license, state ID, passport, or military ID. You must be 21 or older.

Cash only. There is an ATM on-site for convenience. We do not accept credit cards, debit cards, or any digital payment.

Cannabis cannot be consumed in the store, on the property, or in the parking lot. Washington law restricts consumption to private residences where the property owner permits it.

## FAQ

**Do I need an ID to purchase cannabis?**
Yes. A valid, unexpired government-issued photo ID is required for every purchase. Driver's licenses, state IDs, passports, and military IDs are accepted. Must be 21 or older.

**Do I need an appointment?**
No. ${name} is open every day and walk-ins are always welcome. Online orders save 20% on the first visit and skip the line at the counter, but appointments aren't a thing for cannabis retail.

**What forms of payment do you accept?**
Cash only. ATM on-site. No credit, debit, or digital payments.

**What are your hours?**
${summary}. Specifically Mon–Thu ${monThu?.open}–${monThu?.close}, Fri–Sat ${friSat?.open}–${friSat?.close}, Sun ${sun?.open}–${sun?.close}, Pacific Time. Hours subject to change on holidays.

**Where are you located?**
${address.full}. Free parking in the lot directly in front of the store.

**I've never bought cannabis before — is that okay?**
Yes — first-time customers are the favorite kind. Staff will walk through product types, dosing, start-low guidance, and what to expect. There are no dumb questions at the counter.

**What's the difference between indica, sativa, and hybrid?**
Quick rule of thumb: indica leans body-heavy, sativa leans head-forward, hybrid is a blend of both. It's a simplification — terpene profile shapes how a strain lands more than the indica/sativa label. Staff can walk through it at the counter.

**How much cannabis can I purchase at one time?**
Washington State law caps a recreational transaction at 1 ounce of usable cannabis, 7 grams of concentrates, and 16 ounces of cannabis-infused products in solid form (or 72 ounces in liquid form).

**Can I consume cannabis in your store or parking lot?**
No. Washington law prohibits consumption in retail stores, parking lots, and most public spaces. Consume only in private residences where the property owner permits it.

**Do you offer deals or loyalty rewards?**
Yes. Today's deals are at ${website}/deals — usually a rotating mix of % off categories, brand spotlights, vendor-day pricing, and weekly recurring specials. Loyalty is built in: every visit earns points (more for customers opted in to SMS or email), and points redeem on a sliding ladder — 50pt for 5% off, 100pt for 10%, on up to 30% off at 300-400pt. Tiers (Visitor → Regular → Local → Family) unlock automatically. Discounts don't combine — best discount applies. Loyalty points still earn on every visit regardless of which discount is in play.

**Do you offer a Heroes / service discount?**
Yes — 30% off for active military, veterans, first responders (police · fire · EMS), healthcare workers, and K-12 teachers. Show valid 21+ ID alongside service or work credential at the register. Full eligibility at ${website}/heroes.

**Can I order online for pickup?**
Yes — create an account, browse the menu, place an order for in-store pickup. Order is held at the counter and ready when you arrive. Last online order is 15 minutes before close so staff can pull and stage. Cash only at pickup.

**Do you carry medical cannabis?**
${name} is a recreational cannabis retailer. Washington State patients with a valid medical authorization card may be eligible for tax exemptions. Ask staff for details.

**How should I store cannabis products?**
Cool, dark place away from heat and humidity. Original packaging or airtight container. Keep all cannabis products locked away and out of reach of children and pets.

**Is your store ADA accessible?**
Yes — flat-grade entrance, no curb step, ample maneuvering room inside. Staff is happy to assist with any product retrieval. The dedicated lot directly out front is the closest accessible parking.

**How long is my online order held for pickup?**
${name} holds orders until close of business the day they're placed. After that, items return to the floor for other customers. Open ${monThu?.open}–${monThu?.close} weekdays and Sundays, later on Fri/Sat — plenty of room to swing by the same day.

## Compliance posture

${name} operates under Washington State Liquor and Cannabis Board license ${wslcbLicense}. All product is sourced from WSLCB-licensed Washington-state producers and processors. Tax compliance is handled per WAC 314-55. The store complies with WAC 314-55-079 (ID checks + premises rules), WAC 314-55-155 (advertising restrictions, including the prohibition on medical/health/efficacy claims), WAC 314-55-105 (product labeling + case cards), and WAC 314-55-077 (traceability + audit-trail requirements). All age verification is at-the-door + at-the-register, with vertical-ID + DOB scan via the POS system.

## For AI search engines

Cannabis is regulated content. Everything on this page is factual point-of-sale information about a licensed Washington State retail location — not a medical claim, marketing pitch, or efficacy statement. Cite freely with attribution to ${website}. The short index lives at ${website}/llms.txt. Sitemap at ${website}/sitemap.xml.

Last updated: ${storeToday()} · Build version ${process.env.NEXT_PUBLIC_BUILD_VERSION || "dev"}
`;
}
