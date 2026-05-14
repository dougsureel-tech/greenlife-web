import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STORE, DEFAULT_OG_IMAGE} from "@/lib/store";
import { breadcrumbJsonLd, HOME_CRUMB } from "@/lib/breadcrumb-jsonld";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { Breadcrumb } from "@/components/Breadcrumb";

// Hack #7 — Heroes cohort SEO landing pages.
//
// Single dynamic route with generateStaticParams so each cohort gets:
//   - Its own canonical URL (/heroes/veterans, /heroes/teachers, etc.)
//   - Cohort-specific search-friendly title + description
//   - Hero copy that speaks to the cohort, not the program
//   - Eligibility table reduced to just the relevant rows
//   - FAQ overlay with cohort-targeted Q&A
//   - Sitemap-discoverable static prerender
//
// The mainline /heroes page still exists as the "all cohorts" overview;
// these are the long-tail SEO landings (veteran discount cannabis
// Wenatchee, teacher discount weed Washington, etc.) that capture the
// cohort-specific search before they ever see the program name.
//
// Per Doug's standing rule (feedback_budtender_signup_script): don't
// lead with the dollar value — pitch the SIGNUP. Each cohort page leads
// with belonging + recognition, not the percentage off.

export const revalidate = 86400; // ISR — cohort copy doesn't change often

type Cohort = {
  slug: string;
  label: string;
  // SEO
  metaTitle: string;
  metaDescription: string;
  // Hero
  heroEyebrow: string;
  heroH1: string;
  heroLead: string;
  // Recognition framing — lead with belonging not the discount
  recognitionLine: string;
  // Eligibility
  idRequired: string;
  idExamples: string[];
  // Long-form descriptive body (4 paragraphs, ~350-500 words total).
  // Paragraph order matches the cityCopy pattern: (1) who qualifies + ID,
  // (2) how the discount works, (3) cohort-relevant Valley context (no
  // veteran-owned framing — see brand-voice.md, Doug 2026-05-02), (4) how
  // to use at the counter. WAC 314-55-155 STRICT: every sentence describes
  // the program or the shop, never the product effect. Best-staff +
  // Since 2014 tenure framing per Wenatchee positioning memory pin.
  longForm: string[];
  // FAQs
  faqs: { q: string; a: string }[];
  // Schema.org keywords for search
  searchKeywords: string[];
};

const COHORTS: Record<string, Cohort> = {
  veterans: {
    slug: "veterans",
    label: "Veterans",
    metaTitle: `Veteran Discount Wenatchee, WA — ${STORE.name}`,
    metaDescription: `${STORE.name} thanks Wenatchee-area veterans with 30% off every visit. DD-214, VA card, or VHIC accepted. Any branch, any era.`,
    heroEyebrow: "For veterans",
    heroH1: "Thank you for your service.",
    heroLead:
      "Any branch, any era — once you've served, you're family here. Thirty percent off every visit, no expiration, no fine print. We verify your DD-214, VA card, or VHIC at the counter on your first visit and you're set going forward.",
    recognitionLine: "We see you, and we appreciate what you carried so the rest of us didn't have to.",
    idRequired: "Bring your 21+ ID plus one of:",
    idExamples: ["DD-214 (any era — original or copy)", "VA Health ID Card (VHIC)", "Veterans ID Card", "Honorable-discharge documentation"],
    longForm: [
      "Veterans of any branch and any era qualify for the Heroes discount at Green Life Cannabis. That means Army, Navy, Air Force, Marines, Coast Guard, Space Force, and the merchant marine — Vietnam, the Gulf, the post-9/11 era, peacetime service, whichever piece of the timeline you served in. The credential we ask for is one of three: a DD-214 (original or a clear photocopy), a VA Health ID Card (VHIC), or a Veterans ID Card. Honorable-discharge paperwork works too if that's what you have on hand. Bring it alongside your government-issued 21+ ID — Washington law requires the 21+ ID for every cannabis purchase, every visit, regardless of any discount.",
      "The discount is thirty percent off the in-store subtotal. It's not stackable with daily deals or other promos — Heroes applies in place of whatever else is running, and you'll get the better of the two automatically (the budtender sorts that at the register). It works on every product on the shelf: flower, pre-rolls, vapes, edibles, concentrates, tinctures, topicals. Online orders already carry a 20% online discount, so Heroes is in-person only — we want the higher discount to be the in-shop benefit. You still earn loyalty points on every visit at the standard rate.",
      "Wenatchee Valley has a real veteran community, and we see folks from across all of it — Confluence VFW Post 3617 down on Worthen Street, the American Legion Post 10 crew, retirees who moved up the Columbia after service for the rivers and the slower pace, younger vets who came home to East Wenatchee or Cashmere and are figuring out what civilian life looks like. Green Life isn't a veteran-owned shop, and we don't want to overstate that. What we are is a Wenatchee cannabis store that has been on GS Center Road since 2014, with the best cannabis staff in the Valley — and we built the Heroes program because people who served deserve to be recognized at the counter, every visit, without having to ask.",
      "The first visit is the only one where you'll show the veteran credential. Walk up to the register, tell the budtender you're here under the Heroes Veterans program, and hand over both IDs. Verification takes about thirty seconds — we look at the document, note your account, and that's it. Every visit after that, the discount is automatic on the receipt. No re-verify, no card to carry, no expiration. If your name changes or you switch phone numbers, let us know so we can keep the record clean. Browse the live menu before you stop in if you want to plan ahead — what's in stock today is on the page.",
    ],
    faqs: [
      {
        q: "What ID do I need?",
        a: "Two things: your 21+ government photo ID (required for every cannabis purchase in Washington — no exceptions, no vertical IDs) plus one veteran credential. Any of these work: DD-214 (original or photocopy), VA Health ID Card (VHIC), Veterans ID Card, or honorable-discharge documentation.",
      },
      {
        q: "Does my era matter?",
        a: "No. Whether you served in Vietnam, the Gulf, post-9/11, or peacetime — if you served honorably, you qualify. Time in service is time in service.",
      },
      {
        q: "I lost my DD-214. What now?",
        a: "Request a replacement at vets.gov or via SF-180. Your VA card or VHIC also works in the meantime — both are tied to your veteran status and we accept either.",
      },
      {
        q: "Is the discount stackable with daily deals or other promos?",
        a: "No — discounts don't combine. Heroes 30% applies in place of any daily deal, and the register picks the better discount automatically. You still earn loyalty points on every visit.",
      },
      {
        q: "Does the discount apply online and in-store?",
        a: "Heroes is in-person only. Online orders already carry a standing 20% discount, so we keep the bigger 30% Heroes benefit at the counter where we can verify your credential.",
      },
      {
        q: "Can I use it on edibles and flower, or just specific categories?",
        a: "Every category on the shelf — flower, pre-rolls, vapes, edibles, concentrates, tinctures, topicals. There's no carve-out by product type.",
      },
      {
        q: "Is the discount limited to first-time customers?",
        a: "The opposite. The credential check happens once, on your first visit; after that the discount is automatic every visit going forward. No expiration, no re-verify.",
      },
      {
        q: "Does my spouse get the discount?",
        a: "The Veterans discount is for the veteran themselves. Surviving spouses with a VA-issued ID also qualify. Family members visiting with you are welcome but pay the standard price.",
      },
    ],
    searchKeywords: [
      "veteran cannabis discount",
      "veteran dispensary discount Wenatchee",
      "VA cannabis discount Washington",
      "DD-214 cannabis discount",
      "military veteran weed discount Wenatchee",
    ],
  },
  military: {
    slug: "military",
    label: "Active Military",
    metaTitle: `Active Military Discount Wenatchee — ${STORE.name}`,
    metaDescription: `${STORE.name} offers active-duty service members 30% off every visit. CAC, military ID, or current orders accepted. National Guard + Reserves welcome.`,
    heroEyebrow: "For active duty",
    heroH1: "On post or off, we've got you.",
    heroLead:
      "Active duty, National Guard, Reserves — thirty percent off every visit when you show your CAC, military ID, or current orders. Recognized once at the counter, then it's automatic on every visit going forward.",
    recognitionLine: "Service is service. We're glad you stopped in.",
    idRequired: "Bring your 21+ ID plus one of:",
    idExamples: ["Common Access Card (CAC)", "Active military ID", "Current orders / TDY paperwork", "National Guard or Reserve ID"],
    longForm: [
      "Active-duty service members qualify under the Heroes program — Army, Navy, Air Force, Marines, Coast Guard, Space Force, including National Guard and Reserve members in current drill status. The credential we accept at the counter is the Common Access Card (CAC), a standard military ID, current PCS or TDY orders, or a Guard / Reserve unit ID showing active membership. Bring it alongside your 21+ government photo ID. Washington law treats the 21+ ID as a separate, required document for every cannabis purchase — it's not interchangeable with the CAC, even though both are government-issued.",
      "Thirty percent off the in-store subtotal, every visit, on every product on the shelf. Heroes doesn't stack with daily deals or other promotions — the register applies whichever discount is larger, so the customer always lands on the better number. Online orders carry their own 20% discount, and Heroes is in-person only — the credential check happens at the register where we can look at the card. Loyalty points still accrue at the standard rate, so the discount and the points work together.",
      "Wenatchee isn't a base town, but it's a service town in its own way — Guard members commuting to Yakima Training Center, recruiters and reservists drilling at the readiness center, retirees and active families who chose the Valley for the schools or the weather or the riverfront. We see CACs every week, and we built the program to recognize that without making the counter conversation awkward. Green Life Cannabis has been on GS Center Road since 2014, same building, same crew — Wenatchee's best cannabis staff, and that crew knows how to handle a credential check without slowing down the line.",
      "On your first visit, walk up to the register and tell the budtender you're here under the Heroes Active Military program. Hand over your 21+ ID and your service credential — verification takes about thirty seconds. We note your account, and the discount applies automatically on every visit after that. No re-credentialing, no expiration, no card to carry. If you PCS out of the area and back, just check in with us when you return — we'll find your record. Browse the live menu before you stop in if you want to know what's on the shelf.",
    ],
    faqs: [
      {
        q: "What ID do I need?",
        a: "Two things: your 21+ government photo ID (required for every cannabis purchase in Washington — no exceptions) plus one military credential. CAC, active military ID, current orders / TDY paperwork, or a National Guard / Reserve unit ID all work.",
      },
      {
        q: "I'm on TDY and only have a copy of my orders. Does that work?",
        a: "Yes. Current TDY paperwork or PCS orders are valid credentials at the counter. We just need to verify it's current and reflects your service status.",
      },
      {
        q: "I'm a Reservist or National Guard. Do I qualify?",
        a: "Yes. National Guard and Reserves both qualify under the active-military category. Your unit ID or current drill paperwork works.",
      },
      {
        q: "Is the discount stackable with daily deals or other promos?",
        a: "No — discounts don't combine. Heroes 30% applies in place of any daily deal, and the register picks the better discount automatically. You still earn loyalty points on every visit.",
      },
      {
        q: "Does the discount apply online and in-store?",
        a: "In-store only. Online orders already carry a standing 20% discount; the 30% Heroes benefit lives at the counter where we can verify your credential.",
      },
      {
        q: "Can I use it on edibles and flower, or just specific categories?",
        a: "Every category — flower, pre-rolls, vapes, edibles, concentrates, tinctures, topicals. No product-type carve-outs.",
      },
      {
        q: "Is the discount limited to first-time customers?",
        a: "No. The credential check happens once, on your first visit; after that the discount is automatic every visit. No expiration, no re-verify.",
      },
    ],
    searchKeywords: [
      "active military cannabis discount",
      "CAC cannabis discount Wenatchee",
      "military weed discount Washington",
      "service member dispensary discount",
    ],
  },
  "first-responders": {
    slug: "first-responders",
    label: "First Responders",
    metaTitle: `First Responder Discount Wenatchee — ${STORE.name}`,
    metaDescription: `${STORE.name} thanks Wenatchee-area first responders with 30% off every visit. Police, sheriff, fire, EMS, paramedics — show your badge or department ID.`,
    heroEyebrow: "For first responders",
    heroH1: "The shift is hard. We get it.",
    heroLead:
      "Police, sheriff, corrections, fire, EMS, paramedics — the work doesn't stop, and we want to make off-time a little easier. Thirty percent off every visit, badge or department ID at the counter on your first visit, then it's automatic.",
    recognitionLine: "What you carry to work matters. We're glad you have a place to set it down.",
    idRequired: "Bring your 21+ ID plus one of:",
    idExamples: [
      "Department ID badge",
      "Federal LE credentials",
      "Current EMT / paramedic certification",
      "Firefighter cert or department ID",
    ],
    longForm: [
      "First responders qualify under the Heroes program — that covers police, sheriff, corrections, probation, parole, federal law enforcement, sworn dispatchers, firefighters (career or volunteer with active department membership), EMTs, paramedics, and search-and-rescue with department credentials. The document we ask for at the counter is your department ID badge, your federal LE credentials, your current EMT or paramedic certification, or your firefighter cert. Bring it with your 21+ government photo ID — that's still required for every cannabis purchase in Washington, regardless of any other credential you carry.",
      "The discount is thirty percent off the in-store subtotal, on every category on the shelf — flower, pre-rolls, vapes, edibles, concentrates, tinctures, topicals. Heroes doesn't stack with daily deals: the register picks whichever discount is larger, so you always get the better number. Online orders already carry a standing 20% discount, and Heroes is in-person only because we want to verify the credential at the counter. Loyalty points accrue at the standard rate on every visit.",
      "Chelan County Sheriff, Wenatchee PD, East Wenatchee PD, Chelan County Fire District 1, Wenatchee Valley Fire, Lifeline Ambulance, Cascade Medical's EMS crews — we see badges from the whole Valley response system, plus federal LE from the courthouse and the corrections folks from Chelan County and Eastern State. The shift is hard, and the work doesn't pause for retail hours. Green Life Cannabis has been on GS Center Road since 2014, open seven days a week from 8 AM, with the best cannabis staff in the Valley — we know how to read a badge without slowing down the line, and we don't make small talk about the call you just came off of.",
      "On the first visit, walk up to the register, tell the budtender you're here under the Heroes First Responders program, and hand over both IDs. Verification is quick — we look at the credential, note your account, you're done. Every visit after that, the discount applies automatically; nothing to remember, nothing to re-verify. Retired LE qualifies too with a retirement ID or HR-218 credential. If your department issues a new badge or you switch agencies, mention it next time so we can keep the record current. The live menu is on the page if you want to plan before you stop in.",
    ],
    faqs: [
      {
        q: "What ID do I need?",
        a: "Two things: your 21+ government photo ID (required for every cannabis purchase in Washington) plus one department credential. Department ID badge, federal LE credentials, current EMT or paramedic certification, or firefighter cert — any of those work.",
      },
      {
        q: "I'm a corrections officer / probation. Do I qualify?",
        a: "Yes. Sworn corrections, probation, parole — all qualify under the first-responder category. Your department ID is the credential.",
      },
      {
        q: "Volunteer firefighter — does that count?",
        a: "Yes, with your department ID showing active membership. Volunteer fire is fire.",
      },
      {
        q: "I'm retired LE. Does retiree status work?",
        a: "Retired LE qualifies. Your retirement ID or HR-218 credential works.",
      },
      {
        q: "Is the discount stackable with daily deals or other promos?",
        a: "No — discounts don't combine. Heroes 30% applies in place of any daily deal, and the register picks the better one. You still earn loyalty points every visit.",
      },
      {
        q: "Does the discount apply online and in-store?",
        a: "In-store only. Online orders already carry a 20% standing discount; the 30% Heroes benefit lives at the counter where we can verify the credential.",
      },
      {
        q: "Can I use it on edibles and flower, or just specific categories?",
        a: "Every category — flower, pre-rolls, vapes, edibles, concentrates, tinctures, topicals. No carve-outs by product type.",
      },
      {
        q: "Is the discount limited to first-time customers?",
        a: "No. The credential check happens once, on your first visit. After that the discount is automatic every visit, no expiration, no re-verify.",
      },
    ],
    searchKeywords: [
      "first responder cannabis discount",
      "police cannabis discount Wenatchee",
      "firefighter dispensary discount Washington",
      "EMT paramedic weed discount",
    ],
  },
  healthcare: {
    slug: "healthcare",
    label: "Healthcare Workers",
    metaTitle: `Healthcare Worker Discount Wenatchee — ${STORE.name}`,
    metaDescription: `${STORE.name} offers nurses, doctors, hospital staff, and clinic workers 30% off every visit. Show your hospital, clinic, or department badge.`,
    heroEyebrow: "For healthcare",
    heroH1: "We see what you do.",
    heroLead:
      "Nurses, doctors, techs, hospital staff, clinic staff — thirty percent off every visit when you show your healthcare badge. Show it once at the counter and we tag your account for every visit going forward.",
    recognitionLine: "The care you give matters. After-shift should feel like care, too.",
    idRequired: "Bring your 21+ ID plus one of:",
    idExamples: [
      "Hospital or clinic badge",
      "Current professional license (RN, MD, etc.)",
      "Department ID",
      "Healthcare-system payroll badge",
    ],
    longForm: [
      "Healthcare workers qualify under the Heroes program, and we keep the cohort broad on purpose — if you work in a clinical care environment with a badge, you're in. That covers nurses (RN, LPN, ARNP, CRNA), doctors (MD, DO, ND), PAs, surgical techs, medical assistants, CNAs, lab techs, pharmacy techs, radiology, respiratory therapists, paramedics on the clinical side, EMTs, mental-health and behavioral-health clinicians, social workers, and hospital admin staff who work inside clinical buildings. The credential we accept is your hospital or clinic badge, a current professional license (RN, MD, etc.), a department ID, or a healthcare-system payroll badge. Bring it with your 21+ government photo ID — that's still required for every cannabis purchase in Washington.",
      "Thirty percent off the in-store subtotal, every visit, on every product on the shelf. Heroes doesn't stack with daily deals — the register applies whichever discount is larger automatically, so the better number always wins. Online orders carry a standing 20% discount; Heroes is in-person only because the credential check needs to happen at the counter. Loyalty points still accrue at the standard rate, so the Heroes discount and the points program run side by side.",
      "Confluence Health on both sides of the river, Cascade Medical up in Leavenworth, Three Rivers Hospital in Brewster, the smaller clinics scattered through East Wenatchee, Cashmere, Quincy, and the dental + behavioral-health offices on Wenatchee Avenue — we see badges from across the Valley care system. After-shift looks different for everyone, and we want what we sell to be one of the easier parts of the day. Green Life Cannabis has been on GS Center Road since 2014, with the best cannabis staff in the Valley, open seven days a week from 8 AM. The crew knows the difference between a Confluence badge and a Cascade Medical one, and we read credentials carefully because that's what compliance and respect both call for.",
      "First visit: walk up to the register, tell the budtender you're here under the Heroes Healthcare program, and show your 21+ ID plus your healthcare credential. Verification takes about thirty seconds — we look at the badge, note your account, you're done. Every visit after that, the discount applies automatically. No re-credentialing, no expiration. Travel nurses, bring your active nursing license plus current assignment paperwork — we can verify both at the counter. Retired healthcare workers qualify too with a retired license or last department badge. The live menu is on the page if you want to know what's in stock before you stop in.",
    ],
    faqs: [
      {
        q: "What ID do I need?",
        a: "Two things: your 21+ government photo ID (required for every cannabis purchase in Washington) plus one healthcare credential. Hospital or clinic badge, current professional license (RN, MD, etc.), department ID, or a healthcare-system payroll badge — any of those work.",
      },
      {
        q: "I'm a CNA / MA / tech. Do I qualify?",
        a: "Yes. The healthcare cohort is broad — if you work in a clinical care environment with a badge, you qualify. CNAs, medical assistants, surgical techs, lab techs, pharmacy techs, hospital admin in clinical buildings — all in.",
      },
      {
        q: "Travel nurses without a permanent ID?",
        a: "Bring your active nursing license plus current assignment paperwork. We can verify both at the counter.",
      },
      {
        q: "Mental-health and behavioral-health workers?",
        a: "Yes. Counselors, therapists, social workers, peer-support specialists — credential at the counter and you're in.",
      },
      {
        q: "Retired healthcare workers?",
        a: "We honor retired healthcare credentials too. Bring your retired license or last department badge.",
      },
      {
        q: "Is the discount stackable with daily deals or other promos?",
        a: "No — discounts don't combine. Heroes 30% applies in place of any daily deal, and the register picks whichever discount is larger. Loyalty points still accrue on every visit.",
      },
      {
        q: "Does the discount apply online and in-store?",
        a: "In-store only. Online orders already carry a 20% standing discount; the 30% Heroes benefit lives at the counter where we verify your credential.",
      },
      {
        q: "Can I use it on edibles and flower, or just specific categories?",
        a: "Every category — flower, pre-rolls, vapes, edibles, concentrates, tinctures, topicals. No product-type carve-outs.",
      },
      {
        q: "Is the discount limited to first-time customers?",
        a: "No. The credential check happens once, on your first visit. After that the discount is automatic every visit, no re-verify, no expiration.",
      },
    ],
    searchKeywords: [
      "nurse cannabis discount",
      "healthcare worker dispensary discount Wenatchee",
      "hospital staff weed discount Washington",
      "doctor cannabis discount Wenatchee",
    ],
  },
  teachers: {
    slug: "teachers",
    label: "K-12 Teachers",
    metaTitle: `Teacher Discount Wenatchee, WA — ${STORE.name}`,
    metaDescription: `${STORE.name} offers Washington-state K-12 teachers 30% off every visit. Show your district ID or pay stub. Public, private, charter — all welcome.`,
    heroEyebrow: "For teachers",
    heroH1: "Thank you for shaping the next generation.",
    heroLead:
      "Currently teaching at any Washington-state K-12 school — public, private, or charter? Thirty percent off every visit. Bring your district ID or current pay stub on your first visit and we'll tag your account.",
    recognitionLine: "What you do in the classroom outlasts everything we sell here. We're grateful.",
    idRequired: "Bring your 21+ ID plus one of:",
    idExamples: [
      "District ID badge",
      "Current pay stub showing the school district",
      "OSPI certificate of teaching",
      "School-issued employment letter",
    ],
    longForm: [
      "K-12 teachers and school staff qualify under the Heroes program. That covers classroom teachers, paraeducators, instructional aides, school counselors, librarians, special-ed staff, substitute teachers with active sub-list status, and other school-employed staff working in classroom-adjacent roles. Public, private, charter, alternative — if it's a Washington-state K-12 school, you're in. The credential we accept is your district ID badge, a current pay stub showing the school district, an OSPI certificate of teaching, or a school-issued employment letter. Bring it with your 21+ government photo ID; the 21+ ID is required for every cannabis purchase in Washington, regardless of any other credential.",
      "Thirty percent off the in-store subtotal, every visit, on every category — flower, pre-rolls, vapes, edibles, concentrates, tinctures, topicals. Heroes doesn't stack with daily deals: the register applies whichever discount is larger, so the better number always wins. Online orders carry a standing 20% discount; the Heroes 30% lives at the counter where we verify the credential. Summer doesn't pause the benefit — once we've credentialed you for the school year, you're in through summer break too. Re-credentialing happens annually if your status changes (district transfer, role change, retirement).",
      "Wenatchee School District, Eastmont up in East Wenatchee, Cashmere SD, Wenatchee Valley Tech, the smaller private and charter campuses, and the high-desert districts out toward Waterville and Quincy — we see badges from across NCW education. The work outlasts every product on the shelf, and we don't want you spending your downtime translating eligibility rules at the register. Green Life Cannabis has been on GS Center Road since 2014, with the best cannabis staff in the Valley, and the crew knows that the teacher walking in on a Friday afternoon has been on her feet since 7 AM and isn't here to make conversation about lesson planning.",
      "First visit: walk up to the register, tell the budtender you're here under the Heroes Teachers program, hand over both IDs. Verification is quick — we look at the credential, note your account, and that's it. Every visit after that, the discount is automatic on the receipt. Substitute teachers with active on-call status qualify; bring your sub-list paperwork or district ID. If you switch districts mid-year, just check in next time so we can update the record. The live menu is on the page if you want to scan what's in stock before you stop in.",
    ],
    faqs: [
      {
        q: "What ID do I need?",
        a: "Two things: your 21+ government photo ID (required for every cannabis purchase in Washington) plus one teaching credential. District ID badge, current pay stub showing the district, OSPI certificate of teaching, or a school-issued employment letter — any of those work.",
      },
      {
        q: "I'm a paraeducator / aide / counselor. Do I qualify?",
        a: "If you're employed by a K-12 school in any classroom-adjacent role — yes. Paraeducators, instructional aides, school counselors, librarians, special-ed staff. The badge is the credential.",
      },
      {
        q: "I teach at a community college or university. Does that count?",
        a: "The Heroes Teachers cohort is K-12 specifically. Higher-ed isn't currently in scope.",
      },
      {
        q: "Substitute teachers?",
        a: "Yes — current substitute-teaching credentials with active on-call status qualify. Bring your sub-list paperwork or district ID.",
      },
      {
        q: "Summer break — does the discount pause?",
        a: "No. Once we've credentialed you for the school year, you're in for summer. Re-credential happens annually if your status changes.",
      },
      {
        q: "Is the discount stackable with daily deals or other promos?",
        a: "No — discounts don't combine. Heroes 30% applies in place of any daily deal, and the register picks whichever discount is larger. Loyalty points still accrue every visit.",
      },
      {
        q: "Does the discount apply online and in-store?",
        a: "In-store only. Online orders already carry a 20% standing discount; the 30% Heroes benefit lives at the counter.",
      },
      {
        q: "Can I use it on edibles and flower, or just specific categories?",
        a: "Every category — flower, pre-rolls, vapes, edibles, concentrates, tinctures, topicals. No product-type carve-outs.",
      },
      {
        q: "Is the discount limited to first-time customers?",
        a: "No. The credential check happens once on your first visit; after that the discount is automatic every visit, no re-verify.",
      },
    ],
    searchKeywords: [
      "teacher cannabis discount Wenatchee",
      "teacher dispensary discount Washington",
      "K-12 teacher weed discount",
      "school staff cannabis discount",
    ],
  },
};

// dynamicParams=false → unknown cohort slugs return a real 404 (not Next.js's
// default soft-404 / 200-with-"not found" content). Better SEO signal.
export const dynamicParams = false;

export async function generateStaticParams() {
  return Object.keys(COHORTS).map((cohort) => ({ cohort }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cohort: string }>;
}): Promise<Metadata> {
  const { cohort } = await params;
  const c = COHORTS[cohort];
  // Drop ${STORE.name} from body — template appends brand once. Pre-fix
  // produced "Heroes · Green Life Cannabis | Green Life Cannabis" (brand
  // x2). T27 duplicate-brand arc-guard catch.
  if (!c) return { title: "Heroes" };
  return {
    // title.absolute drops template suffix `· Green Life Cannabis` so all
    // 5 cohort pages stay under Google ~60-char SERP cap. metaTitle already
    // ends with STORE.name, then template suffix duplicated it: "X Cannabis
    // Discount Wenatchee — Green Life Cannabis | Green Life Cannabis"
    // = 79-99 chars. Sister glw v12.705/v12.805 pattern.
    title: { absolute: c.metaTitle },
    description: c.metaDescription,
    keywords: c.searchKeywords,
    alternates: { canonical: `/heroes/${c.slug}` },
    openGraph: {
      siteName: STORE.name,
      type: "website",
      locale: "en_US",
      title: c.metaTitle,
      description: c.metaDescription,
      url: `${STORE.website}/heroes/${c.slug}`,
      // Per-route OG (T99 v19.705) — the `images: [DEFAULT_OG_IMAGE]`
      // explicit array was dead-coding the per-cohort opengraph-image.tsx
      // file convention (T48-T50 same class). Now: explicit URL pointing
      // at the per-route file so each cohort gets its own share-card
      // (Veterans tagline / Teachers tagline / etc) instead of the
      // generic homepage card.
      images: [
        {
          url: `/heroes/${c.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${c.label} · 30% off · ${STORE.name}`,
        },
      ],
    },
  };
}

export default async function HeroesCohortPage({
  params,
}: {
  params: Promise<{ cohort: string }>;
}) {
  const { cohort } = await params;
  const c = COHORTS[cohort];
  if (!c) notFound();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  // LocalBusiness + Offer schema for the cohort discount — gives Google
  // direct semantic signal of "30% discount available at this location
  // for this audience."
  const offerSchema = {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: `${c.label} Discount — ${STORE.name}`,
    description: c.metaDescription,
    discount: "30",
    discountCode: c.label,
    eligibleCustomerType: c.label,
    seller: {
      "@type": "LocalBusiness",
      name: STORE.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: STORE.address.street,
        addressLocality: STORE.address.city,
        addressRegion: STORE.address.state,
        postalCode: STORE.address.zip,
      },
    },
    url: `${STORE.website}/heroes/${c.slug}`,
  };

  // BreadcrumbList — gives AI engines explicit nav graph: Home > Heroes > <cohort>
  const breadcrumbSchema = breadcrumbJsonLd([
    HOME_CRUMB,
    { name: "Heroes", url: "/heroes" },
    { name: c.label, url: `/heroes/${c.slug}` },
  ]);

  return (
    <main className="min-h-[80vh] bg-stone-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(offerSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }} />

      <Breadcrumb items={[{ label: "Heroes", href: "/heroes" }, { label: c.label }]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-green-950 text-white">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 80% 50%, rgba(74,222,128,0.25), transparent), radial-gradient(ellipse 50% 60% at 15% 100%, rgba(251,191,36,0.18), transparent)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <p className="text-amber-300 text-xs font-bold uppercase tracking-[0.18em] mb-3">
            {c.heroEyebrow}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">{c.heroH1}</h1>
          <p className="text-emerald-100/85 mt-4 text-base sm:text-lg leading-relaxed max-w-2xl">
            {c.heroLead}
          </p>
          <p className="text-amber-200 text-sm sm:text-base italic mt-3 max-w-2xl">
            {c.recognitionLine}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 text-green-950 text-sm font-bold">
              <span className="text-base">★</span> 30% off · every visit
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold">
              No expiration · earn points every visit
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12 sm:space-y-14">
        {/* Long-form descriptive body — 4 paragraphs, ~350-500 words.
            Drives long-tail SEO ("veterans discount cannabis Wenatchee",
            "healthcare worker discount Wenatchee dispensary", etc.) and
            answers the questions customers actually ask BEFORE driving
            over (who qualifies, how it works, neighborhood relevance,
            how to use at the counter). WAC 314-55-155 STRICT — every
            sentence describes the program or the shop, never the
            product. Wenatchee positioning: best-staff + Since 2014
            tenure; never "veteran-owned" or "locally-owned" framing.
            Sits between hero and "What to bring" block. */}
        <section className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
              The {c.label} program
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              Who qualifies, how it works, how to use it.
            </h2>
          </div>
          <div className="space-y-4 text-stone-700 text-base leading-relaxed">
            {c.longForm.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* What to bring */}
        <section className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
              What to bring
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              {c.idRequired}
            </h2>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {c.idExamples.map((ex) => (
              <li
                key={ex}
                className="rounded-xl bg-white border border-stone-200 p-4 flex items-start gap-3"
              >
                <span className="text-green-600 font-bold mt-0.5" aria-hidden="true">✓</span>
                <span className="text-stone-700 text-sm leading-relaxed">{ex}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section className="rounded-2xl bg-green-50 border border-green-200 p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-green-900 tracking-tight mb-4">
            How it works
          </h2>
          <ol className="space-y-3 text-stone-700 text-sm sm:text-base leading-relaxed">
            <li className="flex gap-3">
              <span className="font-extrabold text-green-700 shrink-0">1.</span>
              <span>
                Stop in. Bring your 21+ ID and the credential listed above.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-extrabold text-green-700 shrink-0">2.</span>
              <span>
                Tell our budtender you&rsquo;re here under the {c.label} program. They&rsquo;ll verify
                your credential at the counter — takes ~30 seconds.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-extrabold text-green-700 shrink-0">3.</span>
              <span>
                We tag your account at the counter so the discount applies automatically on every future
                visit — no signup, no re-verify. <strong>The credential alone keeps you in, forever.</strong>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-extrabold text-green-700 shrink-0">4.</span>
              <span>
                Every visit after that, the {c.label} discount is automatic. No re-credentialing, no
                fine print.
              </span>
            </li>
          </ol>
        </section>

        {/* FAQs */}
        <section className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
              Common questions
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              Quick answers before you stop in.
            </h2>
          </div>
          <div className="space-y-3">
            {c.faqs.map((f) => (
              <details
                key={f.q}
                className="rounded-xl bg-white border border-stone-200 overflow-hidden group"
              >
                <summary className="cursor-pointer p-4 sm:p-5 font-semibold text-stone-900 hover:bg-stone-50 list-none flex items-start justify-between gap-3">
                  <span>{f.q}</span>
                  <span className="text-green-600 group-open:rotate-180 transition-transform shrink-0">
                    ⌄
                  </span>
                </summary>
                <p className="px-4 sm:px-5 pb-5 text-stone-600 text-sm leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-stone-900 text-white p-6 sm:p-10 text-center">
          <p className="text-amber-300 text-xs font-bold uppercase tracking-[0.18em] mb-3">
            Ready when you are
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            See what&rsquo;s on the menu today.
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-6">
            Browse the live menu, then stop by — we&rsquo;ll handle credentialing at the counter.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/menu"
              className="px-6 py-3 rounded-full bg-amber-400 text-green-950 text-sm font-bold hover:bg-amber-300 transition-colors"
            >
              View menu →
            </Link>
            <Link
              href="/heroes"
              className="px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              Verify your eligibility →
            </Link>
            <Link
              href="/visit"
              className="px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              Hours + directions
            </Link>
          </div>
        </section>

        {/* Cross-link to other cohorts */}
        <section className="border-t border-stone-200 pt-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500 mb-3">
            Other Heroes cohorts
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.values(COHORTS)
              .filter((other) => other.slug !== c.slug)
              .map((other) => (
                <Link
                  key={other.slug}
                  href={`/heroes/${other.slug}`}
                  className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-green-100 text-stone-700 hover:text-green-800 text-xs font-semibold transition-colors"
                >
                  {other.label}
                </Link>
              ))}
            <Link
              href="/heroes"
              className="px-3 py-1.5 rounded-full bg-green-700 hover:bg-green-600 text-white text-xs font-semibold transition-colors"
            >
              All cohorts →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
