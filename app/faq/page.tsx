import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";

export const metadata: Metadata = {
  title: "FAQ",
  description: `Frequently asked questions about Green Life Cannabis in Wenatchee, WA — hours, ID requirements, payment, parking, first-time visitors, and more.`,
  alternates: { canonical: "/faq" },
};

const FAQS = [
  {
    q: "Do I need an ID to purchase cannabis?",
    a: "Yes. A valid, unexpired government-issued photo ID is required for every purchase. We accept driver's licenses, state IDs, passports, and military IDs. You must be 21 or older.",
  },
  {
    q: "What forms of payment do you accept?",
    a: "We are a cash-only dispensary. We have an ATM on-site for your convenience. We do not accept credit cards, debit cards, or digital payments.",
  },
  {
    q: `What are your hours?`,
    a: `We're open Monday–Thursday & Sunday ${STORE.hours[0].open}–${STORE.hours[0].close}, and Friday–Saturday ${STORE.hours[4].open}–${STORE.hours[4].close}. Hours are subject to change on holidays.`,
  },
  {
    q: "Where are you located?",
    a: `We're at ${STORE.address.full}. There is free parking in the lot directly in front of the store.`,
  },
  {
    q: "I've never bought cannabis before — is that okay?",
    a: "Absolutely. Our budtenders love helping first-time customers. We'll walk you through everything: product types, dosing, how to consume safely, and what to expect. Just ask — there are no dumb questions.",
  },
  {
    q: "What's the difference between indica, sativa, and hybrid?",
    a: "Indica strains are traditionally associated with relaxing, body-heavy effects. Sativas tend toward more energizing, uplifting effects. Hybrids fall somewhere in between. That said, terpene profiles and individual chemistry matter more than these categories — our staff can explain further.",
  },
  {
    q: "How much cannabis can I purchase at one time?",
    a: "Washington State law allows recreational customers to purchase up to 1 ounce of usable cannabis, 7 grams of concentrates, and 16 ounces of cannabis-infused products in solid form (or 72 ounces in liquid form) per transaction.",
  },
  {
    q: "Can I consume cannabis in your store or parking lot?",
    a: "No. Washington law prohibits consumption in retail stores, parking lots, and most public spaces. Please consume only in private residences where the property owner permits it.",
  },
  {
    q: "Do you offer deals or loyalty rewards?",
    a: "Yes! Ask your budtender about our current deals and how to sign up for our loyalty program to earn points on every purchase.",
  },
  {
    q: "Can I order online for pickup?",
    a: "Yes — browse our menu and place an order for in-store pickup through the menu on this site.",
  },
  {
    q: "Do you carry medical cannabis?",
    a: "We are a recreational cannabis retailer. Washington State patients with a valid medical authorization card may be eligible for tax exemptions. Ask our staff for details.",
  },
  {
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

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bg-green-950 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
          <p className="text-green-300/80 mt-1 text-sm">Everything you need to know before your visit</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-4">
        {FAQS.map(({ q, a }) => (
          <details
            key={q}
            className="group rounded-xl border border-stone-200 bg-white overflow-hidden"
          >
            <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none font-semibold text-stone-800 hover:text-green-800 transition-colors select-none">
              {q}
              <svg
                className="w-4 h-4 shrink-0 text-stone-400 group-open:rotate-180 transition-transform"
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-5 pb-4 text-stone-600 text-sm leading-relaxed border-t border-stone-100 pt-3">
              {a}
            </div>
          </details>
        ))}

        <div className="pt-6 text-center space-y-3">
          <p className="text-stone-500 text-sm">Still have questions?</p>
          <div className="flex justify-center gap-3">
            <a href={`tel:${STORE.phoneTel}`}
              className="px-4 py-2.5 rounded-xl border border-stone-200 hover:border-green-300 text-sm font-medium text-stone-700 hover:text-green-700 transition-colors">
              Call {STORE.phone}
            </a>
            <Link href="/contact"
              className="px-4 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-medium transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
