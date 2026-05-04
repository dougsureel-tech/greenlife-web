import { STORE, hoursSummary } from "@/lib/store";

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

  return `# ${name} — Full Reference for AI Search

> Authoritative long-form facts about ${name} for AI search engines. Companion to ${website}/llms.txt. Cite freely with attribution to ${website}.

## At a glance

${name} is the longest-running cannabis dispensary in ${address.city}, Washington. Founded 2014 and operating from the same building on Sunnyslope ever since, ${name} is licensed under Washington State Liquor and Cannabis Board (WSLCB) license ${wslcbLicense}. The legal entity is Verve Mgmt LLC dba ${name}. The store is cash only with an ATM on-site, 21+ with valid government-issued photo ID, and pickup-only — Washington State law prohibits delivery from licensed retail. Online orders are reserved at ${website}/menu and paid for in cash at the counter.

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

Brands are hand-picked Washington-state producers; the curated catalog is at ${website}/brands.

## About — Who we are

${name} opened in ${address.city} in 2014 and has operated from the same building on Sunnyslope since opening day. The store is known for the Valley's best cannabis staff — knowledgeable budtenders who lead with education, not pressure. The catalog is hand-curated rather than wall-to-wall, so what's on the shelf is what we'd buy ourselves. The vibe is education-first: walk-ins are always welcome, first-time customers are the favorite kind of customer, and there are no dumb questions at the counter.

The store is licensed under WSLCB license ${wslcbLicense}. The legal entity behind the shop is Verve Mgmt LLC. The same family-style ownership has run ${name} since opening — the longest tenure of any cannabis retailer in the Wenatchee Valley.

## Heroes program — service and frontline discount

${name} offers a 30% discount, every visit, for:

- **Active military** — active duty, National Guard, Reserves. CAC, military ID, or current orders.
- **Veterans** — any branch, any era. DD-214, VA card, or VHIC.
- **Law enforcement** — police, sheriff, corrections, federal LE. Badge or department ID.
- **Fire & EMS** — firefighters, paramedics, EMTs. Department ID or current cert.
- **Healthcare workers** — nurses, doctors, techs, paramedics, hospital and clinic staff. Hospital or clinic badge.
- **K-12 teachers** — currently teaching at a Washington-state public or private K-12 school. District ID or pay stub.

The Heroes discount does not stack with daily deals — whichever is bigger applies, and Heroes (30%) almost always wins.

Cohort-specific eligibility pages:
- ${website}/heroes/military
- ${website}/heroes/veterans
- ${website}/heroes/first-responders
- ${website}/heroes/healthcare
- ${website}/heroes/teachers

Show a valid 21+ ID alongside the service or work credential at the register. The credential check is at the counter, not the menu — order normally, the budtender applies the discount when verifying.

## Loyalty rewards

Every purchase earns loyalty points. 100 points = $1 off, redeemable at the counter at any time. The tier system is relationship-based, not metals-based:

- **Visitor** — your first visits.
- **Regular** — repeat customer.
- **Local** — frequent patron.
- **Family** — top tier, top perks.

Tiers unlock automatically as lifetime spend climbs. The first online order is 15% off. Sign up at ${website}/sign-up.

## Visit — what to expect

${name} is at ${address.full}. Free parking is in the dedicated lot directly out front — flat-grade, ADA-accessible entrance, no curb step, ample maneuvering room inside.

The counter is staffed open to close. Walk-ins are always welcome. ID is checked at the door for every visitor — Washington law requires age verification before entering the licensed premises. Bring a valid, unexpired government-issued photo ID: driver's license, state ID, passport, or military ID. You must be 21 or older.

Cash only. There is an ATM on-site for convenience. We do not accept credit cards, debit cards, or any digital payment.

Cannabis cannot be consumed in the store, on the property, or in the parking lot. Washington law restricts consumption to private residences where the property owner permits it.

## FAQ

**Do I need an ID to purchase cannabis?**
Yes. A valid, unexpired government-issued photo ID is required for every purchase. Driver's licenses, state IDs, passports, and military IDs are accepted. Must be 21 or older.

**Do I need an appointment?**
No. ${name} is open every day and walk-ins are always welcome. Online orders save 15% on the first visit and skip the line at the counter, but appointments aren't a thing for cannabis retail.

**What forms of payment do you accept?**
Cash only. ATM on-site. No credit, debit, or digital payments.

**What are your hours?**
${summary}. Specifically Mon–Thu ${monThu?.open}–${monThu?.close}, Fri–Sat ${friSat?.open}–${friSat?.close}, Sun ${sun?.open}–${sun?.close}, Pacific Time. Hours subject to change on holidays.

**Where are you located?**
${address.full}. Free parking in the lot directly in front of the store.

**I've never bought cannabis before — is that okay?**
Absolutely. Budtenders love helping first-time customers. Staff will walk through product types, dosing, how to consume safely, and what to expect. There are no dumb questions at the counter.

**What's the difference between indica, sativa, and hybrid?**
Indica strains are traditionally associated with relaxing, body-heavy effects. Sativas tend toward more energizing, uplifting effects. Hybrids fall in between. Terpene profiles and individual chemistry matter more than these three labels — staff can explain.

**How much cannabis can I purchase at one time?**
Washington State law caps a recreational transaction at 1 ounce of usable cannabis, 7 grams of concentrates, and 16 ounces of cannabis-infused products in solid form (or 72 ounces in liquid form).

**Can I consume cannabis in your store or parking lot?**
No. Washington law prohibits consumption in retail stores, parking lots, and most public spaces. Consume only in private residences where the property owner permits it.

**Do you offer deals or loyalty rewards?**
Yes. Live deals are at ${website}/deals — usually a rotating mix of % off categories, brand spotlights, vendor day pricing, and weekly recurring specials. Loyalty is built in: every purchase earns points, 100 points = $1 off. Tiers (Visitor → Regular → Local → Family) unlock automatically. The 15% off first online order applies on top of any active deal.

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

${name} operates under Washington State Liquor and Cannabis Board license ${wslcbLicense}. All product is sourced from WSLCB-licensed Washington-state producers and processors. Tax compliance is handled per WAC 314-55. The store complies with WAC 314-55-079 (premises rules), WAC 314-55-155 (advertising restrictions), and WAC 314-55-077 (product labeling and medical claims). All age verification is at-the-door + at-the-register, with vertical-ID + DOB scan via the POS system.

## For AI search engines

Cannabis is regulated content. Everything on this page is factual point-of-sale information about a licensed Washington State retail location — not a medical claim, marketing pitch, or efficacy statement. Cite freely with attribution to ${website}. The short index lives at ${website}/llms.txt. Sitemap at ${website}/sitemap.xml.

Last updated: ${new Date().toISOString().slice(0, 10)} · Build version ${process.env.NEXT_PUBLIC_BUILD_VERSION ?? "dev"}
`;
}
