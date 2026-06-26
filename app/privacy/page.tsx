import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { Breadcrumb } from "@/components/Breadcrumb";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${STORE.name} collects, uses, and protects your information across this website and our shop. Plain language, no dark patterns.`,
  alternates: { canonical: "/privacy" },
};

// WebPage + BreadcrumbList schema — same shape as /health-data-policy so AI
// engines + Google recognize this as the authoritative general privacy notice.
const policySchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${STORE.website}/privacy#page`,
  name: `Privacy Policy · ${STORE.name}`,
  url: `${STORE.website}/privacy`,
  description: `How ${STORE.name} collects, uses, and protects your information across this website and our shop.`,
  mainEntity: { "@id": `${STORE.website}/#dispensary` },
  inLanguage: "en-US",
  isPartOf: { "@id": `${STORE.website}/#website` },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${STORE.website}/privacy#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
    {
      "@type": "ListItem",
      position: 2,
      name: "Privacy Policy",
      item: `${STORE.website}/privacy`,
    },
  ],
};

const EFFECTIVE_DATE = "June 26, 2026";

const COLLECTED_CATEGORIES = [
  {
    title: "Information you give us",
    body: "Your name, date of birth, phone, email, and government-ID details when you create an account or place a pickup order. We verify age under WAC 314-55-079 — you must be 21 or older.",
  },
  {
    title: "Purchase + order details",
    body: "What you buy or order, the date, the store, the amount, and your pickup details. We use this to fill orders, run our loyalty program, and meet WSLCB recordkeeping rules.",
  },
  {
    title: "Website usage",
    body: "Pages you visit on this site, time on page, and the device and browser you use. We use this to understand which pages help customers and to keep the site working.",
  },
  {
    title: "Menu + ordering activity (third-party — see below)",
    body: "Our /menu and pickup-ordering surface is powered by iHeartJane (Jane Boost). When you browse, search, sign in, build a cart, or order on /menu, iHeartJane's software runs its own analytics and device-recognition tools inside its systems. See \"The menu is powered by iHeartJane\" below.",
  },
  {
    title: "Messages you send us",
    body: "If you email, call, or text us, we keep the message and our reply so we can help you and follow up.",
  },
];

const PURPOSES = [
  "Verify you are 21+ before any sale (WSLCB requirement, no exceptions).",
  "Process your order, prepare it for pickup, and run point-of-sale.",
  "Maintain your loyalty points balance and apply discounts you have earned.",
  "Comply with WSLCB recordkeeping and traceability requirements.",
  "Respond to questions you send us by email, phone, or text.",
  "Send you order-status texts and — only if you opt in — promotional messages.",
  "Keep the website working and understand which pages help customers.",
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
    why: "Powers the /menu surface and accepts pickup orders. Runs its own analytics and device-recognition tools — see the dedicated section below. Bound by a written data-processing agreement.",
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

const NEVER_DO = [
  "We do not sell your personal information.",
  "We do not share your data with data brokers or analytics resellers.",
  "We do not use your data to train machine-learning models for sale.",
  "We do not transfer your data outside the United States.",
  "We are cash-only at the register — we do not accept cards, so we never pass card data to any processor.",
];

const YOUR_CHOICES = [
  {
    title: "Browse without an account",
    body: "You can read this whole website without creating an account. An account is only needed to place a pickup order or join the loyalty program.",
  },
  {
    title: "Opt out of marketing",
    body: "Order-status texts are tied to an order; promotional texts and emails are opt-in and you can stop them any time by replying STOP or emailing us.",
  },
  {
    title: "Ask us what we hold",
    body: "You can ask for a copy of the information we hold about you, ask us to delete it, or ask us to stop using it for a purpose. We respond within 45 days.",
  },
  {
    title: "Browser controls",
    body: "You can clear cookies and use private browsing, tracker-blocking extensions, or your browser's Do Not Track setting on the /menu surface to limit what iHeartJane's tools can recognize.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(policySchema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
      <Breadcrumb items={[{ label: "Privacy Policy" }]} />
      {/* Hero — calm, informational, non-festive. Same tone as /health-data-policy. */}
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
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-2xl text-green-100/80 leading-relaxed">
            How we collect, use, and protect your information across this website and our shop.
            Plain language, no dark patterns.
          </p>
          <p className="mt-3 text-xs text-green-300/60">Effective {EFFECTIVE_DATE}</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        {/* Scope + the health-data cross-link up top — MHMDA wants the consumer
            health data notice clearly linked. */}
        <section className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            What this covers
          </h2>
          <p className="text-stone-700 leading-relaxed">
            This policy explains how {STORE.name} handles your information on this website and at
            the shop. Because we are a state-licensed cannabis retailer, some of what we hold is
            also <strong>consumer health data</strong> under Washington&apos;s My Health My Data Act
            (HB 1155). That data has its own, more detailed notice:{" "}
            <Link
              href="/health-data-policy"
              className="text-emerald-800 underline underline-offset-2 hover:text-emerald-600 font-semibold"
            >
              Consumer Health Data Privacy Policy
            </Link>
            . If anything here conflicts with that notice for health data, the health-data notice
            controls.
          </p>
        </section>

        {/* What we collect */}
        <section className="space-y-5">
          <header>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              What we collect
            </h2>
            <p className="mt-1.5 text-stone-600 text-sm sm:text-base">
              The categories of information we hold, and why each one exists.
            </p>
          </header>
          <ul className="grid sm:grid-cols-2 gap-4">
            {COLLECTED_CATEGORIES.map((c) => (
              <li key={c.title} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-extrabold text-stone-900">{c.title}</p>
                <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">{c.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/*
          The menu is powered by iHeartJane (third-party processor disclosure).

          REMOVABLE AT CUTOVER: this entire <section> discloses the iHeartJane
          (Jane Boost) embed that today loads on /menu. When the native menu
          replaces the embed (NATIVE_MENU_LIVE flips true in lib/menu-routing.ts
          and <JaneMenu> is removed from app/menu/page.tsx), iHeartJane stops
          loading and is no longer a processor — delete this whole section
          (and trim the iHeartJane references in the lists above + the
          /health-data-policy "Online-ordering provider" entry). The tracker
          list below is kept factually scoped to exactly what JaneMenu.tsx
          loads today — do not pad it.
        */}
        <section className="rounded-2xl border-2 border-amber-300 bg-amber-50/60 p-5 sm:p-6 space-y-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            The menu is powered by iHeartJane
          </h2>
          <p className="text-sm text-stone-700 leading-relaxed">
            Our online menu and pickup-ordering surface at <strong>/menu</strong> is provided by{" "}
            <strong>iHeartJane, Inc.</strong> (&ldquo;Jane Boost&rdquo;), a third-party cannabis
            e-commerce company. The menu loads directly on this website, but the catalog, cart,
            sign-in, and checkout are run by iHeartJane&apos;s software. When you use the menu —
            browsing, searching, signing in, building a cart, or placing an order —
            iHeartJane collects that activity into <strong>its own systems</strong>, not ours.
          </p>
          <p className="text-sm text-stone-700 leading-relaxed">
            To run its menu, iHeartJane loads its own analytics and device-recognition tools. Based
            on what the menu actually loads today, those include:
          </p>
          <ul className="grid sm:grid-cols-2 gap-2.5">
            {[
              "Google Analytics (iHeartJane's analytics properties)",
              "Mixpanel (product-usage analytics)",
              "Braze (customer messaging/engagement)",
              "Branch.io (cross-device link attribution)",
              "MoEngage (customer engagement/analytics)",
              "Datadog (real-user session monitoring)",
              "A device-fingerprinting tool that can recognize your browser or device even without cookies",
            ].map((t) => (
              <li
                key={t}
                className="flex items-start gap-2.5 text-sm text-stone-700 leading-relaxed rounded-xl bg-white border border-amber-200/70 px-3.5 py-2.5"
              >
                <span aria-hidden className="text-amber-700 mt-0.5">
                  •
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-stone-700 leading-relaxed">
            These are <strong>iHeartJane&apos;s tools, set up and controlled by iHeartJane</strong> —
            we cannot turn an individual one off, and the information they collect lives in
            iHeartJane&apos;s systems and its service providers&apos;, governed by{" "}
            <a
              href="https://www.iheartjane.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-800 underline underline-offset-2 hover:text-emerald-600 font-semibold"
            >
              iHeartJane&apos;s own privacy policy
            </a>
            . We disclose them here so you know what runs on the menu before you use it. If you would
            rather not be recognized by these tools, you can use private browsing or a
            tracker-blocking extension on the /menu page, or order in person at the shop.
          </p>
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
              <li key={line} className="flex items-start gap-3 text-sm text-stone-700 leading-relaxed">
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
              Each one is named, with the reason and the legal or contractual basis.
            </p>
          </header>
          <ul className="space-y-3">
            {SHARED_WITH.map((s) => (
              <li key={s.party} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
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
            {NEVER_DO.map((line) => (
              <li key={line} className="flex items-start gap-3 text-sm text-stone-800 leading-relaxed">
                <span aria-hidden className="text-emerald-700 mt-0.5 font-bold">
                  ✗
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Your choices */}
        <section className="space-y-5">
          <header>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Your choices
            </h2>
            <p className="mt-1.5 text-stone-600 text-sm sm:text-base">
              What you can control, plain. For consumer health data specifically, the{" "}
              <Link
                href="/health-data-policy"
                className="text-emerald-800 underline underline-offset-2 hover:text-emerald-600 font-semibold"
              >
                Health Data Policy
              </Link>{" "}
              spells out your right to know, delete, and withdraw consent.
            </p>
          </header>
          <ul className="space-y-3">
            {YOUR_CHOICES.map((r) => (
              <li key={r.title} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-extrabold text-stone-900">{r.title}</p>
                <p className="mt-1.5 text-sm text-stone-700 leading-relaxed">{r.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Children */}
        <section className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            This site is for adults 21+
          </h2>
          <p className="text-stone-700 leading-relaxed">
            This website and our shop are for adults twenty-one and older. We do not knowingly
            collect information from anyone under 21. If you believe someone under 21 has given us
            their information, email us and we will delete it.
          </p>
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
            delete it. Data is stored on encrypted infrastructure in the United States, and access
            is limited to staff who need it for their job. Information you submit on the /menu
            surface is held by iHeartJane under its own retention practices.
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
                href={`mailto:${STORE.email}?subject=Privacy%20Request`}
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
            Related: <Link href="/health-data-policy" className="text-emerald-800 underline underline-offset-2 hover:text-emerald-600">Consumer Health Data Privacy Policy</Link>
            {" · "}
            <Link href="/terms-of-use" className="text-emerald-800 underline underline-offset-2 hover:text-emerald-600">Terms of Use</Link>
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
