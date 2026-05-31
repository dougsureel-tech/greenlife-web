import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { STORE, DEFAULT_OG_IMAGE} from "@/lib/store";
import { withAttr } from "@/lib/attribution";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { Breadcrumb } from "@/components/Breadcrumb";
import { TIERS } from "@/lib/loyalty-tiers";

// ISR — FAQs change occasionally; 24h is fine.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "FAQ — Hours, ID, Payment, Loyalty",
  // ~150 chars — v10.105 length sweep.
  description: `Common questions about ${STORE.name} — hours, ID, payment, parking, first-time visitors, Heroes 30% discount, loyalty rewards.`,
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
    siteName: STORE.name,
    locale: "en_US",
    title: `FAQ · ${STORE.name}`,
    description: `Hours, ID, payment, Heroes 30% off, loyalty — answers to the questions we get most.`,
    url: `${STORE.website}/faq`,
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
};

// `a` (string) feeds the FAQPage JSON-LD that AI Overviews / ChatGPT /
// Google SERP lift verbatim — must stay text-only and self-contained.
// `rich` (JSX) renders in place of the plain answer when present, for
// humans browsing the page (Austin 2026-05-30 sister-port from SCC —
// purchase-limits chart + discount classes list + loyalty tier ladder).
const FAQS: { q: string; a: string; tag?: string; rich?: ReactNode }[] = [
  {
    tag: "First Visit",
    q: "Do I need an ID to purchase cannabis?",
    a: "Yes. A valid, unexpired government-issued photo ID is required for every purchase. We accept driver's licenses, state IDs, passports, and military IDs. You must be 21 or older.",
  },
  {
    tag: "First Visit",
    q: "Do I need to make an appointment?",
    a: "No. We're open every day and walk-ins are always welcome. Online orders save 20% on your first visit and skip the line at the counter — but appointments aren't a thing for cannabis retail.",
  },
  {
    tag: "Payment",
    q: "What forms of payment do you accept?",
    a: "We are a cash-only dispensary. We have an ATM on-site for your convenience. We do not accept credit cards, debit cards, or digital payments.",
  },
  {
    tag: "Hours",
    q: "What are your hours?",
    a: `We're open ${STORE.hours.find((h) => h.day === "Monday")?.open ?? "8:00 AM"}–${STORE.hours.find((h) => h.day === "Monday")?.close ?? "9:00 PM"} Monday–Thursday & Sunday, and ${STORE.hours.find((h) => h.day === "Friday")?.open ?? "8:00 AM"}–${STORE.hours.find((h) => h.day === "Friday")?.close ?? "10:00 PM"} Friday–Saturday. Hours are subject to change on holidays.`,
  },
  {
    tag: "Location",
    q: "Where are you located?",
    a: `We're at ${STORE.address.full}. There is free parking in the lot directly in front of the store.`,
  },
  {
    tag: "First Visit",
    q: "I've never bought cannabis before — is that okay?",
    a: "Yes — and we like first-timers. Our budtenders will walk you through product types, dosing, start-low guidance, and what to expect. Ask anything — there are no dumb questions.",
  },
  {
    tag: "Education",
    q: "What's the difference between indica, sativa, and hybrid?",
    a: "Quick rule of thumb: indica leans body-heavy, sativa leans head-forward, hybrid is a blend of both. It's a simplification — terpene profile shapes how a strain lands more than the indica/sativa label. Come ask and we'll point you at what fits the day.",
  },
  {
    tag: "Legal",
    q: "How much cannabis can I purchase at one time?",
    // Austin #15 (sister-port from SCC) — visual rec-vs-medical
    // comparison chart. Limits per WAC 314-55-095 (recreational) + RCW
    // 69.51A.040 (medical patients w/ valid recognition card; medical
    // limits are 3× the recreational amounts). Includes ounce-to-gram
    // reminders since many younger customers don't know 1oz = 28g.
    a: "Washington law sets per-transaction limits. Recreational customers (21+): 1 ounce (28g) of usable cannabis flower, 7g of concentrate, 16 ounces solid edibles, or 72 ounces liquid edibles. Medical patients with a valid recognition card: 3 ounces (85g) flower, 21g concentrate, 48 ounces solid, or 216 ounces liquid. You can mix categories in one transaction as long as no single category exceeds its limit.",
    rich: (
      <div className="space-y-4">
        <p>
          Washington law sets per-transaction limits. The chart below shows
          both. You can mix categories in one transaction as long as no
          single category exceeds its limit.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-stone-100 text-stone-700">
                <th scope="col" className="text-left font-bold px-3 py-2 border border-stone-200">Category</th>
                <th scope="col" className="text-left font-bold px-3 py-2 border border-stone-200">Recreational (21+)</th>
                <th scope="col" className="text-left font-bold px-3 py-2 border border-stone-200">Medical patient *</th>
              </tr>
            </thead>
            <tbody className="text-stone-700">
              <tr>
                <th scope="row" className="text-left font-semibold px-3 py-2 border border-stone-200 bg-white">🌿 Flower (usable cannabis)</th>
                <td className="px-3 py-2 border border-stone-200 bg-white"><span className="font-bold">1 oz</span> <span className="text-stone-500">(28 g)</span></td>
                <td className="px-3 py-2 border border-stone-200 bg-green-50/50"><span className="font-bold">3 oz</span> <span className="text-stone-500">(85 g)</span></td>
              </tr>
              <tr>
                <th scope="row" className="text-left font-semibold px-3 py-2 border border-stone-200 bg-white">💧 Concentrate</th>
                <td className="px-3 py-2 border border-stone-200 bg-white"><span className="font-bold">7 g</span></td>
                <td className="px-3 py-2 border border-stone-200 bg-green-50/50"><span className="font-bold">21 g</span></td>
              </tr>
              <tr>
                <th scope="row" className="text-left font-semibold px-3 py-2 border border-stone-200 bg-white">🍫 Edibles — solid</th>
                <td className="px-3 py-2 border border-stone-200 bg-white"><span className="font-bold">16 oz</span></td>
                <td className="px-3 py-2 border border-stone-200 bg-green-50/50"><span className="font-bold">48 oz</span></td>
              </tr>
              <tr>
                <th scope="row" className="text-left font-semibold px-3 py-2 border border-stone-200 bg-white">🥤 Edibles — liquid</th>
                <td className="px-3 py-2 border border-stone-200 bg-white"><span className="font-bold">72 oz</span></td>
                <td className="px-3 py-2 border border-stone-200 bg-green-50/50"><span className="font-bold">216 oz</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-stone-500">
          * Medical patients must hold a valid Washington Medical Cannabis Authorization recognition card to qualify for the elevated limits + the sales-tax exemption on DOH-compliant products.
          Recreational limits per WAC 314-55-095; medical patient limits per RCW 69.51A.040. Bring 21+ ID for any purchase.
        </p>
      </div>
    ),
  },
  {
    tag: "Legal",
    q: "Can I consume cannabis in your store or parking lot?",
    a: "No. Washington law prohibits consumption in retail stores, parking lots, and most public spaces. Consume only on private property where the owner permits it.",
  },
  {
    tag: "Rewards",
    q: "Do you offer deals or loyalty rewards?",
    a: `Yes. Today's deals are at ${STORE.website}/deals — usually a rotating mix of % off categories, brand spotlights, vendor-day pricing, and weekly recurring specials. Loyalty is built in: every purchase earns points, and points redeem on a sliding ladder — 50pt for 5% off, 100pt for 10%, on up to 30% off at 300-400pt (redeemable when you're not also using a promo; best discount applies — discounts don't combine). Tiers (Visitor → Regular → Local → Family) unlock automatically as you visit; the higher you go, the bigger the perks. Sign up at ${STORE.website}/sign-up — first-time online orders qualify for 20% off.`,
    // Austin #16 (sister-port from SCC) — visual loyalty tier ladder +
    // points-redeem ladder so customers can see at a glance what unlocks
    // at each step. Tiers sourced from lib/loyalty-tiers.ts (SSoT) so
    // the ladder can't drift from the actual tier math.
    rich: (
      <div className="space-y-5">
        <p>
          <Link href="/deals" className="font-semibold text-green-800 underline decoration-green-300 underline-offset-2 hover:decoration-green-600">Today&rsquo;s deals →</Link> are a rotating mix of category, brand, vendor-day, and storewide specials. Loyalty is built in: every purchase earns points, and tiers unlock automatically as you visit.
        </p>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Tier ladder — unlocks by lifetime spend</p>
          <ol className="space-y-2">
            {TIERS.map((t, i) => (
              <li
                key={t.name}
                className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3"
              >
                <span
                  aria-hidden="true"
                  className={`shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                    i === 0
                      ? "bg-stone-100 text-stone-700"
                      : i === 1
                        ? "bg-green-50 text-green-700"
                        : i === 2
                          ? "bg-green-100 text-green-800"
                          : "bg-green-200 text-green-900"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-stone-900">{t.label}</div>
                  <div className="text-xs text-stone-500">
                    {i === 0
                      ? "Welcome tier — open to anyone with an account."
                      : `Unlocks at $${t.minSpend.toLocaleString()} lifetime spend.`}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Points redeem ladder</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { pts: 50, off: "5%" },
              { pts: 100, off: "10%" },
              { pts: 200, off: "20%" },
              { pts: 300, off: "30%" },
            ].map(({ pts, off }) => (
              <div key={pts} className="rounded-xl border border-stone-200 bg-white p-3 text-center">
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">{pts} pts</div>
                <div className="text-xl font-extrabold text-green-700 mt-0.5">{off} off</div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-stone-500">
            Redeemable when you&rsquo;re not also using a promo — the best applicable discount wins (discounts don&rsquo;t combine). You always earn points on every visit.
          </p>
        </div>

        <Link
          href="/sign-up"
          className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 hover:bg-green-500 px-4 py-2 text-sm font-bold text-white transition-colors"
        >
          Sign up — first online order is 20% off
        </Link>
      </div>
    ),
  },
  {
    tag: "Rewards",
    q: "Can I redeem loyalty points on top of a deal?",
    a: "No — discounts don't combine. The best applicable discount applies on a given order (Heroes 30%, today's daily deal, online 20%, etc.), so you'd save your points for a regular-price visit when redemption gives you the most. You always earn points on every visit either way.",
  },
  {
    tag: "Discounts",
    // Austin #14 (sister-port from SCC) — rename + list every discount
    // class in one place. "Wisdom" not "Senior" per Doug 2026-05 dignity-
    // rename doctrine (build-gate enforced). AM + Wisdom %-off amounts
    // are NOT fabricated — they're not wired into code yet; the in-store
    // ask is the honest path.
    q: "Do you offer any special discounts?",
    a: `Yes — we run several. (1) Heroes service discount: 30% off for active military, veterans, first responders (police, fire, EMS), healthcare workers, and K-12 teachers. (2) First-visit online order: 20% off when you place your first pickup order through our menu. (3) Loyalty rewards: every purchase earns points that redeem on a sliding ladder up to 30% off. (4) Daily deals: a rotating mix of category, brand, and storewide specials at ${STORE.website}/deals. Ask in-store about additional Wisdom and morning specials. Discounts don't combine — you always get the biggest one that applies. Heroes details + how to verify: ${STORE.website}/heroes.`,
    rich: (
      <div className="space-y-4">
        <p>Yes — we run several. Discounts don&rsquo;t combine; you always get the biggest one that applies.</p>
        <ul className="space-y-3">
          <li className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <span className="font-bold text-stone-900">🎖️ Heroes service discount</span>
              <span className="text-sm font-bold text-green-700">30% off</span>
            </div>
            <p className="mt-1 text-stone-600">
              Active military, veterans, first responders (police, fire, EMS), healthcare workers, and K-12 teachers.
              Show a valid ID or service credential at the register.{" "}
              <Link href="/heroes" className="font-semibold text-green-800 underline decoration-green-300 underline-offset-2 hover:decoration-green-600">
                Eligibility + how it works →
              </Link>
            </p>
          </li>
          <li className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <span className="font-bold text-stone-900">👋 First-visit online order</span>
              <span className="text-sm font-bold text-green-700">20% off</span>
            </div>
            <p className="mt-1 text-stone-600">
              Place your first pickup order through{" "}
              <Link href="/menu" className="font-semibold text-green-800 underline decoration-green-300 underline-offset-2 hover:decoration-green-600">our menu</Link> — the 20% applies automatically at checkout.
            </p>
          </li>
          <li className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <span className="font-bold text-stone-900">⭐ Loyalty rewards</span>
              <span className="text-sm font-bold text-green-700">up to 30% off</span>
            </div>
            <p className="mt-1 text-stone-600">
              Every purchase earns points; points redeem on a sliding ladder — 50pt for 5%, 100pt for 10%, on up to 30% off at 300-400pt. Tiers unlock automatically as you visit.
            </p>
          </li>
          <li className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <span className="font-bold text-stone-900">🎟️ Daily deals</span>
              <span className="text-sm font-bold text-green-700">varies</span>
            </div>
            <p className="mt-1 text-stone-600">
              A rotating mix of category, brand, vendor-day, and storewide specials.{" "}
              <Link href="/deals" className="font-semibold text-green-800 underline decoration-green-300 underline-offset-2 hover:decoration-green-600">See today&rsquo;s deals →</Link>
            </p>
          </li>
          <li className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <span className="font-bold text-stone-900">☀️ Wisdom &amp; morning specials</span>
              <span className="text-xs font-semibold text-stone-500">ask in-store</span>
            </div>
            <p className="mt-1 text-stone-600">
              We run additional in-store specials for our Wisdom regulars and an early-morning crew. Ask a budtender — they&rsquo;ll let you know what&rsquo;s active today.
            </p>
          </li>
        </ul>
      </div>
    ),
  },
  {
    tag: "Ordering",
    q: "Can I order online for pickup?",
    a: "Yes — create an account, browse our menu, and place an order for in-store pickup. Your order is held at the counter and ready when you arrive.",
  },
  {
    tag: "Medical",
    q: "Do you carry medical cannabis?",
    a: "We're a recreational cannabis retailer. Washington patients with a valid medical authorization card qualify for medical-marijuana sales-tax exemption on DOH-compliant products at the till. Bring the card when you visit and we'll set you up — ask any budtender if you have questions.",
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
  "@id": `${STORE.website}/faq#breadcrumb`,
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />

      <Breadcrumb items={[{ label: "FAQ" }]} />

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
          {FAQS.map(({ q, a, tag, rich }, idx) => {
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
                  {rich ?? a}
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
