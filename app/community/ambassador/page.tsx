import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { Breadcrumb } from "@/components/Breadcrumb";
import { BRIEF_LIBRARY } from "@/lib/ambassador-briefs";
import { AmbassadorSubmitClient } from "./AmbassadorSubmitClient";

// /community/ambassador — Phase 2 customer landing for the Ambassador
// Program v0.1 (per PLAN_AMBASSADOR_PROGRAM.md §1-§9). Builds on the
// existing /community hub.
//
// Surface goals:
//   1. Make the offer + rules visible BEFORE customer creates a video,
//      so self-screening catches the WAC compliance issues that would
//      otherwise burn moderator queue time.
//   2. Carry tenure-as-credential framing (no "locally owned" / no
//      possessive-superlatives) per Doug 2026-05-02 + cross-store
//      brand-voice doctrine.
//   3. Inline form island for v0.1 — no separate /submit page until we
//      see real submission cadence.
//
// Doug-action remaining at ship time:
//   - set AMBASSADOR_PROGRAM_ENABLED=true on Vercel project
//   - add @vercel/blob to deps (manual paste — see changelog entry)
//   - optionally set AMBASSADOR_FEEDBACK_NOTIFY=<manager@…> for feedback emails

export const metadata: Metadata = {
  title: { absolute: `Ambassador Program · ${STORE.name}` },
  description: `Share a video about ${STORE.name} or a Google review — earn store credit. Center Road since 2014. Recorded outside the shop, 21+ only, no claims.`,
  alternates: { canonical: "/community/ambassador" },
  openGraph: {
    siteName: STORE.name,
    type: "website",
    locale: "en_US",
    title: `Ambassador Program · ${STORE.name}`,
    description: `Quick videos, real reviews — earn store credit. Compliance-friendly briefs, manager-reviewed.`,
    url: `${STORE.website}/community/ambassador`,
    images: [
      {
        url: "/community/ambassador/opengraph-image",
        width: 1200,
        height: 630,
        alt: `Ambassador Program · ${STORE.name}`,
      },
    ],
  },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${STORE.website}/community/ambassador#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
    { "@type": "ListItem", position: 2, name: "Community", item: `${STORE.website}/community` },
    {
      "@type": "ListItem",
      position: 3,
      name: "Ambassador Program",
      item: `${STORE.website}/community/ambassador`,
    },
  ],
};

const webPageLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${STORE.website}/community/ambassador#webpage`,
  url: `${STORE.website}/community/ambassador`,
  name: `Ambassador Program · ${STORE.name}`,
  isPartOf: { "@id": `${STORE.website}/#website` },
  about: { "@type": "Organization", name: STORE.name },
};

const HOW_IT_WORKS = [
  {
    step: "Step 1",
    title: "Record outside the shop",
    detail:
      "Pick a brief below. Vertical (9:16) recording on your phone. Keep it short — 15 to 60 seconds.",
  },
  {
    step: "Step 2",
    title: "Upload here",
    detail: "Tap the upload button, drop the file, hit send. Or paste your Google review URL.",
  },
  {
    step: "Step 3",
    title: "Manager reviews within 48 hours",
    detail: "Reviews verified within 24 hours. We post the videos we use, with #ad disclosure.",
  },
  {
    step: "Step 4",
    title: "Store credit on file",
    detail:
      "Approved video: $25. Used in our marketing: $50. Goes viral on our channels: $100 plus swag.",
  },
];

const NOT_ACCEPTED = [
  "Consumption on camera — smoking, dabbing, vaping. Packaging and flower in hand are fine.",
  "Anyone under 21 visible in the frame.",
  "Medical, dosing, or effect claims — what a product did for a condition.",
  "Customer last names, addresses, or phone numbers.",
  "Filming inside the store — counter, register, ID-check area, other customers in frame.",
];

export default function AmbassadorPage() {
  const briefRows = BRIEF_LIBRARY.map((b) => ({
    id: b.id,
    title: b.title,
    targetSeconds: b.targetSeconds,
  }));

  return (
    <main className="min-h-[80vh] bg-stone-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(webPageLd) }} />

      <Breadcrumb
        items={[
          { label: "Community", href: "/community" },
          { label: "Ambassador Program" },
        ]}
      />

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
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <p className="text-amber-300 text-xs font-bold uppercase tracking-[0.18em] mb-3">
            Ambassador Program
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Share your story. Earn store credit.
          </h1>
          <p className="text-emerald-100/85 mt-4 text-base sm:text-lg leading-relaxed max-w-2xl">
            Center Road since 2014 — and most of our best new customers came from someone they already
            trusted telling them about us. Make us a quick video, or paste a Google review you already
            wrote, and earn credit on your next visit. We&apos;ll handle the rest.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-green-950 text-sm font-bold transition-all shadow-md"
            >
              Submit a video or review →
            </a>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold">
              $10 to $100 in store credit per submission
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-14 sm:space-y-16">
        {/* Briefs grid */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
              Pick a brief
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              Five quick-record prompts.
            </h2>
            <p className="text-stone-600 text-sm mt-2 max-w-xl leading-relaxed">
              Each brief is short on purpose. Pick the one that fits your visit. The compliance tips
              under each tell you what to keep out of the frame.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {BRIEF_LIBRARY.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 hover:border-green-300 transition-colors flex flex-col"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="font-bold text-stone-900 text-base">{b.title}</h3>
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    ~{b.targetSeconds}s
                  </span>
                </div>
                <p className="text-stone-700 text-sm leading-relaxed">{b.prompt}</p>
                <ul className="mt-3.5 space-y-1.5 flex-1">
                  {b.complianceTips.slice(0, 3).map((tip) => (
                    <li key={tip} className="text-stone-500 text-xs leading-snug flex gap-2">
                      <span aria-hidden="true" className="text-amber-600 mt-0.5">
                        •
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
                {/* Phase 2.5 — per-brief deep page link. Customer can
                    tap through to the shareable 1-page card (prompt +
                    compliance edge cases + QR for friend-in-line). */}
                <Link
                  href={`/community/ambassador/briefs/${b.id}`}
                  className="mt-4 text-xs font-semibold text-green-700 hover:text-green-900 inline-flex items-center gap-1 self-start"
                >
                  See brief <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              Four steps. No surprises.
            </h2>
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {HOW_IT_WORKS.map(({ step, title, detail }) => (
              <li
                key={step}
                className="relative rounded-2xl bg-white border border-stone-200 p-5 sm:p-6"
              >
                <span className="absolute -top-2.5 left-5 text-[10px] font-bold uppercase tracking-widest text-white bg-green-700 px-2 py-0.5 rounded-full">
                  {step}
                </span>
                <h3 className="font-bold text-stone-900 mt-2">{title}</h3>
                <p className="text-stone-600 text-sm mt-1.5 leading-relaxed">{detail}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* What we don't accept */}
        <section className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
              Before you record
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              What we can&apos;t accept.
            </h2>
            <p className="text-stone-600 text-sm mt-2 max-w-xl leading-relaxed">
              State law (WAC 314-55-155) sets the boundary on cannabis ads. If a video crosses one of
              these lines, we have to reject it — even if we love it. Self-screen against this list
              before you upload.
            </p>
          </div>
          <ul className="rounded-2xl bg-amber-50 border border-amber-200 p-6 space-y-3">
            {NOT_ACCEPTED.map((item) => (
              <li key={item} className="text-stone-800 text-sm leading-relaxed flex gap-3">
                <span aria-hidden="true" className="text-amber-700 font-bold">
                  ✕
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Submission form */}
        <section id="submit" className="space-y-6 scroll-mt-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
              Submit
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              Send it over.
            </h2>
            <p className="text-stone-600 text-sm mt-2 max-w-xl leading-relaxed">
              Sign in first so we can credit your account. Your video stays private until a manager
              approves it.
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-7">
            <AmbassadorSubmitClient briefs={briefRows} />
          </div>
        </section>

        {/* Footer microcopy — revocation right */}
        <section className="rounded-3xl bg-green-950 text-white p-7 sm:p-9 space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
            Your video, your call
          </p>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Ask us to take it down anytime — we remove it within 7 days, no questions.
          </h2>
          <p className="text-emerald-100/80 text-sm leading-relaxed max-w-2xl">
            We publish first names only, never last names. We add an &ldquo;#ad&rdquo; or &ldquo;Paid
            partner&rdquo; disclosure on every video we post. And the source file stays in our private
            archive — we don&apos;t share it with anyone outside the moderation team.
          </p>
          <div className="pt-2">
            <Link
              href="/community"
              className="text-sm font-semibold text-emerald-300 hover:text-emerald-200"
            >
              ← Back to Community
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
