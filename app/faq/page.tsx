import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { withAttr } from "@/lib/attribution";

// ISR — FAQs change occasionally; 24h is fine.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "FAQ — Hours, ID, Payment, Heroes, Loyalty",
  description: `Common questions about ${STORE.name} in Wenatchee, WA — hours, ID requirements, payment, parking, first-time visitors, Heroes service discount, loyalty rewards, and more.`,
  alternates: { canonical: "/faq" },
  keywords: [
    "Wenatchee dispensary FAQ",
    "cannabis dispensary questions",
    "Wenatchee dispensary ID requirements",
    "Wenatchee dispensary cash only",
    "Green Life Cannabis hours",
    "Wenatchee dispensary parking",
    "Heroes discount cannabis",
  ],
  openGraph: {
    title: `FAQ · ${STORE.name}`,
    description: `Hours, ID, payment, Heroes 30% off, loyalty — answers to the questions we get most.`,
    url: `${STORE.website}/faq`,
    type: "website",
    images: ["/opengraph-image"],
  },
};

const FAQS: { q: string; a: string; tag?: string }[] = [
  {
    tag: "First Visit",
    q: "Do I need an ID to purchase cannabis?",
    a: "Yes. A valid, unexpired government-issued photo ID is required for every purchase. We accept driver's licenses, state IDs, passports, and military IDs. You must be 21 or older.",
  },
  {
    tag: "First Visit",
    q: "Do I need to make an appointment?",
    a: "No. We're open every day and walk-ins are always welcome. Online orders save 15% on your first visit and skip the line at the counter — but appointments aren't a thing for cannabis retail.",
  },
  {
    tag: "Payment",
    q: "What forms of payment do you accept?",
    a: "We are a cash-only dispensary. We have an ATM on-site for your convenience. We do not accept credit cards, debit cards, or digital payments.",
  },
  {
    tag: "Hours",
    q: "What are your hours?",
    a: `We're open ${STORE.hours.find((h) => h.day === "Monday")?.open ?? "8:00 AM"}–${STORE.hours.find((h) => h.day === "Monday")?.close ?? "9:00 PM"} Monday–Thursday & Sunday, and ${STORE.hours.find((h) => h.day === "Friday")?.open ?? "8:00 AM"}–${STORE.hours.find((h) => h.day === "Friday")?.close ?? "11:00 PM"} Friday–Saturday. Hours are subject to change on holidays.`,
  },
  {
    tag: "Location",
    q: "Where are you located?",
    a: `We're at ${STORE.address.full}. There is free parking in the lot directly in front of the store.`,
  },
  {
    tag: "First Visit",
    q: "I've never bought cannabis before — is that okay?",
    a: "Absolutely. Our budtenders love helping first-time customers. We'll walk you through product types, dosing, how to consume safely, and what to expect. Just ask — there are no dumb questions.",
  },
  {
    tag: "Education",
    q: "What's the difference between indica, sativa, and hybrid?",
    a: "Indica strains are traditionally associated with relaxing, body-heavy effects. Sativas tend toward more energizing, uplifting effects. Hybrids fall somewhere in between. That said, terpene profiles and individual chemistry matter more than these categories — our staff can explain further.",
  },
  {
    tag: "Legal",
    q: "How much cannabis can I purchase at one time?",
    a: "Washington State law allows recreational customers to purchase up to 1 ounce of usable cannabis, 7 grams of concentrates, and 16 ounces of cannabis-infused products in solid form (or 72 ounces in liquid form) per transaction.",
  },
  {
    tag: "Legal",
    q: "Can I consume cannabis in your store or parking lot?",
    a: "No. Washington law prohibits consumption in retail stores, parking lots, and most public spaces. Please consume only in private residences where the property owner permits it.",
  },
  {
    tag: "Rewards",
    q: "Do you offer deals or loyalty rewards?",
    a: `Yes. Live deals are at ${STORE.website}/deals — usually a rotating mix of % off categories, brand spotlights, vendor day pricing, and weekly recurring specials. Loyalty is built in: every purchase earns points, and 100 points = $1 off, redeemable at the counter any time. Tiers (Visitor → Regular → Local → Family) unlock automatically as you visit; the higher you go, the bigger the perks. Sign up at ${STORE.website}/sign-up — the 15% off your first online order applies on top of any active deal.`,
  },
  {
    tag: "Rewards",
    q: "Do you offer a Heroes / service discount?",
    a: `Yes — 30% off for active military, veterans, first responders (police · fire · EMS), healthcare workers, and K-12 teachers. Show a valid 21+ ID alongside your service or work credential at the register. Full eligibility + how it works is at ${STORE.website}/heroes.`,
  },
  {
    tag: "Ordering",
    q: "Can I order online for pickup?",
    a: "Yes — create an account, browse our menu, and place an order for in-store pickup. Your order is held at the counter and ready when you arrive.",
  },
  {
    tag: "Medical",
    q: "Do you carry medical cannabis?",
    a: "We are a recreational cannabis retailer. Washington State patients with a valid medical authorization card may be eligible for tax exemptions. Ask our staff for details.",
  },
  {
    tag: "Education",
    q: "How should I store cannabis products?",
    a: "Store in a cool, dark place away from heat and humidity. Keep in original packaging or an airtight container. Keep all cannabis products locked away and out of reach of children and pets.",
  },
  {
    tag: "Location",
    q: "Is your store ADA accessible?",
    a: "Yes — flat-grade entrance, no curb step, ample maneuvering room inside, and our team is happy to assist with any product retrieval. The dedicated lot directly out front is the closest accessible parking.",
  },
  {
    tag: "Ordering",
    q: "How long is my online order held for pickup?",
    a: `We hold orders until close of business the day you place them. After that, items return to the floor for other customers. ${STORE.name} is open ${STORE.hours.find((h) => h.day === "Monday")?.open ?? "8:00 AM"}–${STORE.hours.find((h) => h.day === "Monday")?.close ?? "9:00 PM"} weekdays + Sundays, later on Fri/Sat — plenty of room to swing by the same day.`,
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
    { "@type": "ListItem", position: 2, name: "FAQ", item: `${STORE.website}/faq` },
  ],
};

// Single muted pill for every tag — categorical signal stays, rainbow goes.
// All FAQ tags now read with the same visual weight; the question is the
// thing the user is scanning for, not the tag.
const TAG_PILL_CLASS = "bg-stone-100 text-stone-600 border border-stone-200";

// Distinct tags in source-order — used for the tag-jump strip at the top
// of the FAQ list. Anchor scrolls to the first FAQ in that group via the
// stable id derived from the tag.
const TAG_ORDER = Array.from(new Set(FAQS.map((f) => f.tag).filter((t): t is string => Boolean(t))));
const slugTag = (tag: string) => `tag-${tag.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

export default function FaqPage() {
  // Track which tag we've already anchored — so only the FIRST FAQ in a
  // group gets the scroll-target id. Keeps anchor links predictable.
  const seenTags = new Set<string>();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Page header */}
      <div className="relative overflow-hidden bg-green-950 text-white py-10 sm:py-14">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(ellipse 60% 50% at 80% 50%, #4ade80, transparent)" }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2">Help Center</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Frequently Asked Questions</h1>
          <p className="text-green-300/70 mt-2 text-sm sm:text-base">
            Everything you need to know before your visit
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12 space-y-6">
        {/* Tag-jump strip — quick filter to the section the customer is
            here for. Plain anchor links so it works without JS. Tap a
            pill, hop to the first Q in that group; scroll-margin-top
            keeps the answer visible under the sticky header. */}
        <nav aria-label="Jump to FAQ category" className="flex flex-wrap gap-2 -mt-2 sm:-mt-3">
          {TAG_ORDER.map((tag) => (
            <a
              key={tag}
              href={`#${slugTag(tag)}`}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-stone-200 text-stone-700 hover:border-green-400 hover:text-green-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              {tag}
            </a>
          ))}
        </nav>

        <div className="space-y-3">
          {FAQS.map(({ q, a, tag }, idx) => {
            const isFirstOfTag = tag && !seenTags.has(tag);
            if (tag) seenTags.add(tag);
            return (
              <details
                key={q}
                id={isFirstOfTag && tag ? slugTag(tag) : undefined}
                // Default open on the first FAQ only — long all-open lists
                // are visually overwhelming and bury the question scan.
                open={idx === 0}
                style={isFirstOfTag ? { scrollMarginTop: "100px" } : undefined}
                className="group rounded-2xl border border-stone-200 bg-white overflow-hidden open:border-green-300 open:shadow-sm transition-all"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none group-open:bg-green-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500">
                  <div className="flex items-center gap-3 min-w-0">
                    {tag && (
                      <span
                        className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full hidden sm:inline-block ${TAG_PILL_CLASS}`}
                      >
                        {tag}
                      </span>
                    )}
                    <span className="font-semibold text-stone-800 group-open:text-green-900 text-sm leading-snug transition-colors">
                      {q}
                    </span>
                  </div>
                  <svg
                    className="w-5 h-5 shrink-0 text-stone-300 group-open:text-green-500 group-open:rotate-180 transition-all duration-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 pt-3 text-stone-600 text-sm leading-relaxed border-t border-green-100">
                  {a}
                </div>
              </details>
            );
          })}
        </div>

        {/* Quick-pivot mesh — three highest-converting next moves for
            anyone who landed here looking up an answer. */}
        <nav aria-label="Related pages" className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <Link
            href={withAttr("/menu", "menu", "faq-mesh")}
            className="rounded-2xl border border-stone-200 bg-white hover:border-green-300 hover:shadow-md transition-all p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <div className="text-xl mb-1.5" aria-hidden="true">🛒</div>
            <div className="font-bold text-stone-900 text-sm">Browse the menu</div>
            <div className="text-xs text-stone-500 mt-0.5">Live inventory, price + THC</div>
          </Link>
          <Link
            href={withAttr("/heroes", "header", "faq-mesh")}
            className="rounded-2xl border border-stone-200 bg-white hover:border-green-300 hover:shadow-md transition-all p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <div className="text-xl mb-1.5" aria-hidden="true">🎖️</div>
            <div className="font-bold text-stone-900 text-sm">Heroes 30% off</div>
            <div className="text-xs text-stone-500 mt-0.5">Eligibility + how it works</div>
          </Link>
          <Link
            href={withAttr("/visit", "header", "faq-mesh")}
            className="rounded-2xl border border-stone-200 bg-white hover:border-green-300 hover:shadow-md transition-all p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <div className="text-xl mb-1.5" aria-hidden="true">📍</div>
            <div className="font-bold text-stone-900 text-sm">Hours + directions</div>
            <div className="text-xs text-stone-500 mt-0.5">Map, parking, what to bring</div>
          </Link>
        </nav>

        {/* Bottom CTA */}
        <div className="pt-4 rounded-2xl bg-green-950 text-white p-7 text-center space-y-4">
          <p className="font-bold text-lg">Still have questions?</p>
          <p className="text-green-300/80 text-sm max-w-sm mx-auto">
            Our budtenders are happy to help — call us or stop by and ask anything.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <a
              href={`tel:${STORE.phoneTel}`}
              aria-label={`Call ${STORE.name} at ${STORE.phone}`}
              className="px-5 py-2.5 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-sm font-semibold text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
            >
              Call {STORE.phone}
            </a>
            <Link
              href={withAttr("/contact", "header", "faq-bottom")}
              className="px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2 focus-visible:ring-offset-green-950"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
