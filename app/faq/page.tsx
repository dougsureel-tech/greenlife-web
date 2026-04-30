import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";

export const metadata: Metadata = {
  title: "FAQ",
  description: `Frequently asked questions about Green Life Cannabis in Wenatchee, WA — hours, ID requirements, payment, parking, first-time visitors, and more.`,
  alternates: { canonical: "/faq" },
};

const FAQS: { q: string; a: string; tag?: string }[] = [
  {
    tag: "First Visit",
    q: "Do I need an ID to purchase cannabis?",
    a: "Yes. A valid, unexpired government-issued photo ID is required for every purchase. We accept driver's licenses, state IDs, passports, and military IDs. You must be 21 or older.",
  },
  {
    tag: "Payment",
    q: "What forms of payment do you accept?",
    a: "We are a cash-only dispensary. We have an ATM on-site for your convenience. We do not accept credit cards, debit cards, or digital payments.",
  },
  {
    tag: "Hours",
    q: "What are your hours?",
    a: `We're open ${(STORE.hours.find(h => h.day === "Monday")?.open ?? "8:00 AM")}–${(STORE.hours.find(h => h.day === "Monday")?.close ?? "9:00 PM")} Monday–Thursday & Sunday, and ${(STORE.hours.find(h => h.day === "Friday")?.open ?? "8:00 AM")}–${(STORE.hours.find(h => h.day === "Friday")?.close ?? "10:00 PM")} Friday–Saturday. Hours are subject to change on holidays.`,
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
    a: "Yes! Ask your budtender about our current deals and how to sign up for our loyalty program to earn points on every purchase.",
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

const TAG_COLORS: Record<string, string> = {
  "First Visit": "bg-emerald-100 text-emerald-700",
  Payment:       "bg-amber-100 text-amber-700",
  Hours:         "bg-blue-100 text-blue-700",
  Location:      "bg-rose-100 text-rose-700",
  Education:     "bg-purple-100 text-purple-700",
  Legal:         "bg-stone-100 text-stone-600",
  Rewards:       "bg-orange-100 text-orange-700",
  Ordering:      "bg-teal-100 text-teal-700",
  Medical:       "bg-sky-100 text-sky-700",
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Page header */}
      <div className="relative overflow-hidden bg-green-950 text-white py-14">
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(ellipse 60% 50% at 80% 50%, #4ade80, transparent)" }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2">Help Center</p>
          <h1 className="text-4xl font-extrabold tracking-tight">Frequently Asked Questions</h1>
          <p className="text-green-300/70 mt-2">Everything you need to know before your visit</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-3">
        {FAQS.map(({ q, a, tag }) => (
          <details
            key={q}
            className="group rounded-2xl border border-stone-200 bg-white overflow-hidden open:border-green-300 open:shadow-sm transition-all"
          >
            <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none group-open:bg-green-50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                {tag && (
                  <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full hidden sm:inline-block ${TAG_COLORS[tag] ?? "bg-stone-100 text-stone-500"}`}>
                    {tag}
                  </span>
                )}
                <span className="font-semibold text-stone-800 group-open:text-green-900 text-sm leading-snug transition-colors">
                  {q}
                </span>
              </div>
              <svg
                className="w-5 h-5 shrink-0 text-stone-300 group-open:text-green-500 group-open:rotate-180 transition-all duration-200"
                fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-5 pb-5 pt-3 text-stone-600 text-sm leading-relaxed border-t border-green-100">
              {a}
            </div>
          </details>
        ))}

        {/* Bottom CTA */}
        <div className="pt-8 rounded-2xl bg-green-950 text-white p-7 text-center space-y-4">
          <p className="font-bold text-lg">Still have questions?</p>
          <p className="text-green-300/80 text-sm max-w-sm mx-auto">
            Our budtenders are happy to help — call us or stop by and ask anything.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <a href={`tel:${STORE.phoneTel}`}
              className="px-5 py-2.5 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-sm font-semibold text-white transition-all">
              Call {STORE.phone}
            </a>
            <Link href="/contact"
              className="px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
