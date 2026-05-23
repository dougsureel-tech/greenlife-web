import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AMBASSADOR_CONTRACT_VERSION, AMBASSADOR_YTD_CAP_CENTS } from "@/lib/ambassador-apply";
import { ApplyForm } from "./ApplyForm";

// /community/ambassador/apply — Phase F apply form for the Ambassador
// Program v0.2 (per PLAN_AMBASSADOR_V0_2_INFLUENCER_REACH_2026_05_23.md §3
// Phase F). Public-facing onboarding form that captures everything the
// admin queue (inv-App parallel session) needs to approve / reject /
// request-edit a new ambassador in one pass.
//
// Surface goals:
//   1. Self-screen the applicant: compliance posture + age + payout mode
//      surfaced BEFORE submit so manual review queue stays signal-heavy.
//   2. Inline contract summary + checkbox = the §1-9 RCW 51.08.195
//      worker-classification posture is in the applicant's face at signup.
//   3. Phase G opt-in checkbox: applicant decides at apply-time whether
//      they want to appear on /community/ambassadors (default OFF).
//
// Doug-action remaining at ship time:
//   - inv-App admin queue (/admin/marketing/ambassador-applications) goes
//     live in parallel session; until both lands, this form returns 503
//     queued-deferred (graceful degrade per cannabis-web doctrine).
//   - AMBASSADOR_PROGRAM_ENABLED env (already true per allyes-bundle row).

export const metadata: Metadata = {
  title: { absolute: `Become an Ambassador · ${STORE.name}` },
  description: `Apply for the ${STORE.name} Ambassador Program. Earn store credit (or cash, with W-9) for sharing your story. 21+ only.`,
  alternates: { canonical: "/community/ambassador/apply" },
  openGraph: {
    siteName: STORE.name,
    type: "website",
    locale: "en_US",
    title: `Become an Ambassador · ${STORE.name}`,
    description: `Apply for the Ambassador Program — earn store credit or cash for sharing your story.`,
    url: `${STORE.website}/community/ambassador/apply`,
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
  "@id": `${STORE.website}/community/ambassador/apply#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
    { "@type": "ListItem", position: 2, name: "Community", item: `${STORE.website}/community` },
    {
      "@type": "ListItem",
      position: 3,
      name: "Ambassador Program",
      item: `${STORE.website}/community/ambassador`,
    },
    {
      "@type": "ListItem",
      position: 4,
      name: "Apply",
      item: `${STORE.website}/community/ambassador/apply`,
    },
  ],
};

// Contract summary — inlined as static content so the Vercel function
// bundle stays self-contained (fs.readFileSync of the legal/ markdown file
// would trip check-fs-read-bundled). The FULL contract lives at
// /CODE/Green Life/legal/ambassador-icr-2026.md; this is the customer-
// facing TL;DR + the four headline clauses (IC relationship + revocation
// right + $1,800 cap + image-release scope). Mirrors the in-store
// collateral microcopy. Contract version pinned via AMBASSADOR_CONTRACT_VERSION.
const CONTRACT_SUMMARY = [
  {
    heading: "You're an independent creator, not an employee.",
    body: `You choose what to film, when to post, and where to post. We don't direct your content. We review submissions only for cannabis advertising compliance (WAC 314-55-155) and basic content quality.`,
  },
  {
    heading: "Stop anytime, no penalty.",
    body: `You can stop participating, ask us to take any post down, or have your name removed from our public ambassador list at any time. We honor takedown requests within 7 days.`,
  },
  {
    heading: "$1,800 per calendar year soft cap.",
    body: `Total store credit (or cash, if you choose the W-9 path) earned per ambassador caps at $1,800 / year — the line under the IRS $2,000 1099-NEC threshold. Manager can override for exceptional cases with audit trail.`,
  },
  {
    heading: "Image-release scope.",
    body: `We may republish content you submit on our social channels, website, and in-store displays for up to 2 years from the date of approval. We always add #ad or "Paid partner" disclosure on republished content. You retain ownership of your originals.`,
  },
];

export default function AmbassadorApplyPage() {
  // Runtime flag-gate: if program not enabled, render "coming soon" panel
  // so a flag-off rollback doesn't leave the form visible while the API
  // rejects with 403. Mirrors the existing /community/ambassador gate.
  if (process.env.AMBASSADOR_PROGRAM_ENABLED !== "true") {
    return (
      <main className="min-h-[80vh] bg-stone-50">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
        <Breadcrumb
          items={[
            { label: "Community", href: "/community" },
            { label: "Ambassador Program", href: "/community/ambassador" },
            { label: "Apply" },
          ]}
        />
        <section className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="text-3xl font-semibold text-stone-900">Ambassador applications — coming soon</h1>
          <p className="mt-4 text-stone-700">
            We&apos;re putting the finishing touches on the application flow. Check back shortly.
          </p>
          <p className="mt-6">
            <Link href="/community/ambassador" className="text-green-700 underline">
              Back to the Ambassador Program
            </Link>
          </p>
        </section>
      </main>
    );
  }

  const capDollars = (AMBASSADOR_YTD_CAP_CENTS / 100).toLocaleString("en-US");

  return (
    <main className="min-h-[80vh] bg-stone-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />

      <Breadcrumb
        items={[
          { label: "Community", href: "/community" },
          { label: "Ambassador Program", href: "/community/ambassador" },
          { label: "Apply" },
        ]}
      />

      {/* Compliance stripe — WSLCB 21+ + cannabis-advertising tag */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs font-semibold text-amber-900">
        21+ only. Cannabis advertising (WAC 314-55-155) — see compliance terms in the application below.
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-green-950 text-white">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <p className="text-amber-300 text-xs font-bold uppercase tracking-[0.18em] mb-3">
            Apply — Ambassador Program
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Tell us about yourself.
          </h1>
          <p className="text-emerald-100/85 mt-4 text-base leading-relaxed">
            Five-minute form. Once you submit, a manager reviews within 48 hours and replies via email
            with next steps. Up to ${capDollars} per calendar year in store credit (or cash, with a W-9).
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        {/* Contract summary */}
        <section className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
              The terms, plain English
            </p>
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              Four things you should know before you sign.
            </h2>
            <p className="text-stone-600 text-sm mt-2 leading-relaxed">
              The full Ambassador agreement (the &ldquo;ICR&rdquo; — Independent-Contractor
              Relationship) is signed at apply-time. Here&apos;s the short version, in plain English.
              Version pinned: <code className="text-xs bg-stone-100 px-1.5 py-0.5 rounded">{AMBASSADOR_CONTRACT_VERSION}</code>.
            </p>
          </div>
          <ul className="rounded-2xl bg-white border border-stone-200 p-6 space-y-4">
            {CONTRACT_SUMMARY.map((c) => (
              <li key={c.heading} className="space-y-1">
                <h3 className="font-bold text-stone-900 text-sm">{c.heading}</h3>
                <p className="text-stone-700 text-sm leading-relaxed">{c.body}</p>
              </li>
            ))}
          </ul>
          <p className="text-stone-500 text-xs leading-relaxed">
            Submitting the form below means you&apos;ve read these four clauses + accept the full
            Independent-Contractor Relationship Agreement as of version {AMBASSADOR_CONTRACT_VERSION}.
            We keep a copy of the version you accepted on file with your application.
          </p>
        </section>

        {/* The form */}
        <section className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
              Application
            </p>
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              Your info.
            </h2>
          </div>
          <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-7">
            <ApplyForm />
          </div>
        </section>

        {/* Footer microcopy */}
        <section className="rounded-2xl bg-green-950 text-white p-6 sm:p-8 space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
            What happens next
          </p>
          <ol className="text-sm text-emerald-100/85 space-y-2 list-decimal list-inside">
            <li>Your application lands in our manager queue.</li>
            <li>Within 48 hours, a manager replies via email — approve, ask for clarification, or politely decline.</li>
            <li>If approved, you&apos;ll get a welcome email with your first brief invitation.</li>
            <li>Submit a video or paste a review → manager approves → store credit hits your account.</li>
          </ol>
          <div className="pt-2">
            <Link
              href="/community/ambassador"
              className="text-sm font-semibold text-emerald-300 hover:text-emerald-200"
            >
              ← Back to the Program overview
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
