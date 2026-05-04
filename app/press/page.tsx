import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";

// Press kit page — exists so journalists, podcasters, local bloggers, and
// micro-influencers can grab logo + facts + a quote-able story without
// having to email and wait. Every easy-to-cite link reduces the friction
// between "they considered writing about us" and "they wrote about us."

export const metadata: Metadata = {
  title: "Press · Media Kit",
  description: `Press kit for ${STORE.name} in ${STORE.address.city}, WA — logo, fact sheet, story, and press contact. Local journalists and cannabis-industry writers welcome.`,
  alternates: { canonical: "/press" },
  robots: { index: true, follow: true },
};

const FOUNDED_YEAR = "2018";
const PRESS_EMAIL = STORE.email;

const FACTS: { label: string; value: string }[] = [
  { label: "Legal name", value: "Verve Mgmt LLC dba Green Life Cannabis" },
  { label: "Trade name", value: STORE.name },
  { label: "Address", value: STORE.address.full },
  { label: "Phone", value: STORE.phone },
  { label: "Hours", value: "8 AM daily; later Fri & Sat — see /visit for current schedule" },
  { label: "WSLCB License", value: STORE.wslcbLicense },
  { label: "Founded", value: FOUNDED_YEAR },
  { label: "Owner", value: "Verve Mgmt LLC · privately held" },
  { label: "Region", value: "Wenatchee Valley + greater Chelan / Douglas County" },
];

export default function PressPage() {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    name: `${STORE.name} press kit`,
    publisher: { "@type": "Organization", name: STORE.name, url: STORE.website },
    about: { "@id": `${STORE.website}/#dispensary` },
  };

  return (
    <div className="bg-stone-50 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />

      {/* Hero */}
      <section className="bg-green-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-300 mb-4">Press · Media Kit</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Press resources for <span className="text-green-300">{STORE.name}</span>.
          </h1>
          <p className="mt-5 text-green-100/70 text-lg max-w-2xl leading-relaxed">
            Logo, photos, fact sheet, founder quote, and a press contact — everything you need to write about
            us. No PR firm in the middle, no NDA, no waiting on a callback. Grab what you need and ship.
          </p>
          <div className="mt-7 flex flex-wrap gap-2 text-xs font-semibold">
            <a
              href="#facts"
              className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/15"
            >
              Fact sheet
            </a>
            <a
              href="#story"
              className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/15"
            >
              Story
            </a>
            <a
              href="#assets"
              className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/15"
            >
              Logo + photos
            </a>
            <a
              href="#contact"
              className="px-3.5 py-1.5 rounded-full bg-green-400 text-green-950 hover:bg-green-300"
            >
              Press contact →
            </a>
          </div>
        </div>
      </section>

      {/* Fact sheet */}
      <section id="facts" className="border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">Fact sheet</h2>
          <p className="text-stone-500 text-sm mt-1.5">
            Copy/paste-friendly. If anything is wrong, tell us at {PRESS_EMAIL} and we&apos;ll fix it within
            the hour.
          </p>
          <dl className="mt-6 grid sm:grid-cols-2 gap-x-8 gap-y-4">
            {FACTS.map((f) => (
              <div key={f.label} className="border-b border-stone-200 pb-3">
                <dt className="text-[11px] font-bold uppercase tracking-wider text-stone-500">{f.label}</dt>
                <dd className="text-sm text-stone-900 mt-0.5 font-medium">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">The story</h2>
          <div className="prose prose-stone max-w-none text-stone-700 text-base leading-relaxed">
            <p>
              {STORE.name} opened in {FOUNDED_YEAR} in Wenatchee — half-way between the Cascades and the
              Columbia. Family-staffed since 2014 and stocked almost entirely from Washington-state
              farms and processors. We&apos;re not the biggest dispensary in the valley; we&apos;re the one
              your friend recommends because the budtenders actually know the difference between a glass-rosin
              terp profile and a hash-rosin one.
            </p>
            <p>
              The store sits right off Sunnyslope, with free parking, ADA access, and an ATM on-site.
              Cash-only at the counter — federal banking law hasn&apos;t caught up to the state — but online
              orders are easy and pickup is five minutes from front door to drawer.
            </p>
          </div>
          <blockquote className="border-l-4 border-green-700 pl-5 py-1 text-stone-700 italic">
            &ldquo;We didn&apos;t open a dispensary to sell weed. We opened it to give Wenatchee a place where
            you can ask any question and get a real answer — same as you&apos;d get at a craft brewery or a
            good bookshop.&rdquo;
            <footer className="mt-2 not-italic text-xs text-stone-500">— the owner</footer>
          </blockquote>
          <p className="text-xs text-stone-500">
            Need a custom quote, owner interview, or background-only call? Email {PRESS_EMAIL} and we&apos;ll
            schedule.
          </p>
        </div>
      </section>

      {/* Assets */}
      <section id="assets" className="border-b border-stone-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">Logo & photos</h2>
          <p className="text-stone-500 text-sm">
            Right-click → Save image. For SVG / vector / hi-res original variants, email {PRESS_EMAIL} —
            we&apos;ll send within an hour during business hours.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 text-center space-y-3">
              <div className="aspect-square w-32 mx-auto rounded-2xl bg-green-700 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-16 h-16 text-white"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3c0 5-3 8-3 9s1.5 3 3 3 3-2 3-3-3-4-3-9z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12c3 0 5-1 6-3 1 2 3 3 6 3" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-stone-900">Primary logo (PNG, 512×512)</p>
              <a
                href="/icon-512.png"
                download="green-life-cannabis-logo-512.png"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-green-700 hover:text-green-600"
              >
                Download →
              </a>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6 text-center space-y-3">
              <div className="aspect-square w-32 mx-auto rounded-2xl bg-green-950 flex items-center justify-center">
                <span className="text-green-300 font-bold text-lg leading-tight text-center px-2">
                  Green Life
                  <br />
                  <span className="font-normal">Cannabis</span>
                </span>
              </div>
              <p className="text-sm font-semibold text-stone-900">Social-share image (1200×630)</p>
              <a
                href="/opengraph-image"
                download="green-life-cannabis-og.png"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-green-700 hover:text-green-600"
              >
                Download →
              </a>
            </div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-bold">Quick logo-usage notes</p>
            <ul className="mt-2 space-y-1 text-xs leading-relaxed list-disc pl-5">
              <li>Don&apos;t recolor the leaf. The green is part of the mark.</li>
              <li>Don&apos;t pair with imagery that appeals to minors (per WAC 314-55-155).</li>
              <li>You don&apos;t need to ask permission to write about us. We appreciate when you do.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Press contact */}
      <section id="contact" className="bg-green-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-green-300">Press contact</h2>
          <p className="text-green-100/80 max-w-2xl leading-relaxed">
            Direct to the owner. Story pitches, interview requests, fact-check questions, sample requests,
            background-only calls — all welcome. Same-day response during business hours.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:${PRESS_EMAIL}?subject=Press%20inquiry`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-green-400 text-green-950 font-bold text-sm hover:bg-green-300"
            >
              {PRESS_EMAIL} →
            </a>
            <a
              href={`tel:${STORE.phoneTel}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10"
            >
              {STORE.phone}
            </a>
          </div>
          <div className="pt-4 text-xs text-green-200/60 border-t border-white/10">
            Other useful pages: <Link href="/about" className="underline hover:text-green-300">About</Link>{" "}
            ·{" "}
            <Link href="/visit" className="underline hover:text-green-300">
              Visit us
            </Link>{" "}
            ·{" "}
            <Link href="/menu" className="underline hover:text-green-300">
              Live menu
            </Link>
            .
          </div>
        </div>
      </section>
    </div>
  );
}
