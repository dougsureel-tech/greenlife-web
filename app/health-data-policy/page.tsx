import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Consumer Health Data Privacy Policy",
  description: `How ${STORE.name} collects, uses, and protects consumer health data under Washington's My Health My Data Act (RCW 19.373 / HB 1155).`,
  alternates: { canonical: "/health-data-policy" },
};

const EFFECTIVE_DATE = "May 2, 2026";

const COLLECTED_CATEGORIES = [
  {
    title: "Account information",
    body: "Name, date of birth, phone, email, and government-ID details we are required to verify under WAC 314-55-079 to confirm you are 21 or older.",
  },
  {
    title: "Purchase history",
    body: "Cannabis products you have purchased, the date and store, the amount, and the budtender on the transaction. Required for WSLCB recordkeeping (WAC 314-55-083) and for our loyalty program.",
  },
  {
    title: "Loyalty + preferences",
    body: "Points balance, tier, favorite categories or strains you have told us about, and notes a budtender wrote down at your request (e.g. 'prefers indica, sensitive to THC over 20%').",
  },
  {
    title: "Online order details",
    body: "Items, pickup time, and the device you placed the order from. We use this to prepare your order and to verify the person picking up matches the account.",
  },
  {
    title: "Site analytics (de-identified)",
    body: "Pages you visit on this website, time on page, which device and browser you use. Aggregated and not tied to your account or identity.",
  },
];

const PURPOSES = [
  "Verify you are 21+ before any sale (WSLCB requirement, no exceptions).",
  "Process your order, prepare it for pickup, and run point-of-sale.",
  "Maintain your loyalty points balance and apply discounts you have earned.",
  "Comply with WSLCB recordkeeping and traceability requirements.",
  "Respond to questions you send us by email, phone, or text.",
  "Send you order-status texts and — only if you opt in — promotional messages.",
  "Improve the website by understanding which pages help customers and which do not.",
];

const SHARED_WITH = [
  {
    party: "Washington State Liquor and Cannabis Board (WSLCB)",
    why: "Regulatory recordkeeping, traceability, and audit response. Required by RCW 69.50 and WAC 314-55. Not optional.",
  },
  {
    party: "Our point-of-sale system (Dutchie, then in-house POS)",
    why: "Stores transactions and inventory. Vendor is bound by a written data-processing agreement and may not use your information for its own purposes.",
  },
  {
    party: "Online-ordering provider (iHeartJane)",
    why: "Powers the /menu surface and accepts pickup orders. Receives only the data needed to fulfill the order. Bound by a written data-processing agreement.",
  },
  {
    party: "Payment processor (cash only — no card processor)",
    why: "Green Life Cannabis is cash-only at the register. We do not pass card data to any processor because we do not accept cards.",
  },
  {
    party: "Text-message provider",
    why: "Sends order-ready texts and promotional texts you opt in to. Phone number only — no purchase details in the message body.",
  },
  {
    party: "Law enforcement",
    why: "Only when we receive a valid subpoena, warrant, or court order, or when required by Washington or federal law.",
  },
];

const NEVER_SOLD = [
  "We do not sell your consumer health data to anyone, ever.",
  "We do not share your data with data brokers, advertisers, or analytics resellers.",
  "We do not use your data to train machine-learning models for sale.",
  "We do not transfer your data outside the United States.",
];

const YOUR_RIGHTS = [
  {
    title: "Right to know",
    body: "You can request a copy of the consumer health data we hold about you, what categories we collected, why we collected it, and who we shared it with. Free, once per year.",
  },
  {
    title: "Right to delete",
    body: "You can ask us to delete your consumer health data. We will delete it everywhere we control it, and ask our service providers to do the same. We may keep records WSLCB requires us to keep (transaction history, age-verification logs).",
  },
  {
    title: "Right to withdraw consent",
    body: "You can withdraw consent at any time for anything that depends on consent — for example, marketing texts or saved budtender preferences. We honor withdrawals as fast as we can; in practice, within five business days.",
  },
  {
    title: "Right to appeal",
    body: "If we deny a request, you can appeal in writing to the email below. We will respond within 45 days. If we still deny, you may complain to the Washington State Attorney General at " +
      "atg.wa.gov/file-complaint" +
      ".",
  },
];

const HOW_TO_REQUEST = [
  `Email ${STORE.email} with the subject line "Health Data Request"`,
  "Tell us your name, date of birth, and the email or phone on your account so we can verify you",
  'Tell us what you want — "send me my data," "delete my data," "stop using my data for X"',
  "We will respond within 45 days (extendable to 90 days for complex requests, with notice)",
];

export default function HealthDataPolicyPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero — calm, informational, non-festive. Same tone as /accessibility. */}
      <section className="relative bg-green-950 text-white overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <p className="text-green-300/80 text-[11px] font-bold uppercase tracking-[0.22em]">
            Customer Resources
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.05]">
            Consumer Health Data Privacy Policy
          </h1>
          <p className="mt-4 max-w-2xl text-green-100/80 leading-relaxed">
            How we collect, use, and protect consumer health data — written for Washington&apos;s My
            Health My Data Act (RCW 19.373 / HB 1155). Plain language, no dark patterns.
          </p>
          <p className="mt-3 text-xs text-green-300/60">Effective {EFFECTIVE_DATE}</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        {/* Scope — what HB 1155 covers, and why we wrote a separate page for it. */}
        <section className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            What this covers
          </h2>
          <p className="text-stone-700 leading-relaxed">
            Washington&apos;s My Health My Data Act (HB 1155, in force 2024) defines{" "}
            <strong>consumer health data</strong> broadly — it includes anything that could
            identify a person&apos;s past, present, or future physical or mental health. Cannabis
            purchases at a state-licensed retailer fall inside that definition. This policy is the
            HB 1155-specific notice. Our broader privacy practices for non-health data are
            essentially the same and live on this page too — there is no separate &ldquo;general
            privacy&rdquo; document to chase down.
          </p>
        </section>

        {/* What we collect */}
        <section className="space-y-5">
          <header>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              What we collect
            </h2>
            <p className="mt-1.5 text-stone-600 text-sm sm:text-base">
              The categories of consumer health data we hold, and why each one exists.
            </p>
          </header>
          <ul className="grid sm:grid-cols-2 gap-4">
            {COLLECTED_CATEGORIES.map((c) => (
              <li
                key={c.title}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-extrabold text-stone-900">{c.title}</p>
                <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">{c.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Why we collect it */}
        <section className="space-y-5">
          <header>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Why we collect it
            </h2>
            <p className="mt-1.5 text-stone-600 text-sm sm:text-base">
              Specific, named purposes — no &ldquo;business purposes&rdquo; catch-alls.
            </p>
          </header>
          <ul className="space-y-2.5">
            {PURPOSES.map((line) => (
              <li
                key={line}
                className="flex items-start gap-3 text-sm text-stone-700 leading-relaxed"
              >
                <span aria-hidden className="text-emerald-700 mt-0.5">
                  ✓
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Who we share with */}
        <section className="space-y-5">
          <header>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Who we share it with
            </h2>
            <p className="mt-1.5 text-stone-600 text-sm sm:text-base">
              Six recipients total. Each one is named, with the reason and the legal or
              contractual basis.
            </p>
          </header>
          <ul className="space-y-3">
            {SHARED_WITH.map((s) => (
              <li
                key={s.party}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-extrabold text-stone-900">{s.party}</p>
                <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">{s.why}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* What we never do */}
        <section className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
            What we never do
          </h2>
          <ul className="mt-3 space-y-2">
            {NEVER_SOLD.map((line) => (
              <li
                key={line}
                className="flex items-start gap-3 text-sm text-stone-800 leading-relaxed"
              >
                <span aria-hidden className="text-emerald-700 mt-0.5 font-bold">
                  ✗
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Your rights */}
        <section className="space-y-5">
          <header>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Your rights
            </h2>
            <p className="mt-1.5 text-stone-600 text-sm sm:text-base">
              Under HB 1155 you have specific rights. Here they are, plain.
            </p>
          </header>
          <ul className="space-y-3">
            {YOUR_RIGHTS.map((r) => (
              <li
                key={r.title}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-extrabold text-stone-900">{r.title}</p>
                <p className="mt-1.5 text-sm text-stone-700 leading-relaxed">{r.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* How to exercise */}
        <section className="space-y-5">
          <header>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              How to make a request
            </h2>
            <p className="mt-1.5 text-stone-600 text-sm sm:text-base">
              Four steps. We do not require an account, an app, or a portal — just an email.
            </p>
          </header>
          <ol className="space-y-2.5">
            {HOW_TO_REQUEST.map((step, i) => (
              <li
                key={step}
                className="flex items-start gap-3 text-sm text-stone-700 leading-relaxed"
              >
                <span
                  aria-hidden
                  className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold"
                >
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Security + retention */}
        <section className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            How long we keep it, how we secure it
          </h2>
          <p className="text-stone-700 leading-relaxed">
            We keep transaction and age-verification records for at least three years to satisfy
            WSLCB requirements (WAC 314-55-083). Loyalty and preference data we keep while your
            account is active and for one year after your last visit; after that we anonymize or
            delete it. Data is stored on encrypted infrastructure in the United States. Access is
            limited to staff who need it for their job — budtenders see what they need to ring up
            a sale, managers see audit trails, only admins can export bulk data, and every export
            is logged.
          </p>
        </section>

        {/* Changes */}
        <section className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Changes to this policy
          </h2>
          <p className="text-stone-700 leading-relaxed">
            If we make a material change, we will update the effective date at the top and — for
            account holders — send a notice email. Non-material changes (typo fixes, link updates)
            we make without notice. The current version is always the one on this page.
          </p>
        </section>

        {/* Contact strip */}
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-3">
          <h2 className="text-lg font-extrabold text-stone-900 tracking-tight">Contact</h2>
          <p className="text-sm text-stone-700 leading-relaxed">
            <strong>{STORE.name}</strong>
            <br />
            {STORE.address.full}
            <br />
            WSLCB License #{STORE.wslcbLicense}
          </p>
          <ul className="text-sm text-stone-700 space-y-1.5">
            <li>
              <span className="font-semibold">Email:</span>{" "}
              <a
                href={`mailto:${STORE.email}?subject=Health%20Data%20Request`}
                className="text-emerald-800 underline underline-offset-2 hover:text-emerald-600"
              >
                {STORE.email}
              </a>
            </li>
            <li>
              <span className="font-semibold">Phone:</span>{" "}
              <a
                href={`tel:${STORE.phoneTel}`}
                className="text-emerald-800 underline underline-offset-2 hover:text-emerald-600"
              >
                {STORE.phone}
              </a>
            </li>
          </ul>
          <p className="text-xs text-stone-500 leading-relaxed pt-2">
            Authority: Washington State Attorney General · atg.wa.gov/file-complaint · 1-800-551-4636
          </p>
        </section>

        <footer className="text-center pt-4 pb-2">
          <Link
            href="/"
            className="text-sm font-semibold text-emerald-800 hover:text-emerald-600 transition-colors"
          >
            ← Back to home
          </Link>
        </footer>
      </div>
    </div>
  );
}
