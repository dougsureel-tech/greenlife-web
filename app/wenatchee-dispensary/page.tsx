import type { Metadata } from "next";
import Link from "next/link";
import { STORE, DEFAULT_OG_IMAGE } from "@/lib/store";
import { safeJsonLd } from "@/lib/json-ld-safe";

// /wenatchee-dispensary — head-term landing page targeting
// "wenatchee dispensary" / "dispensary wenatchee" / "cannabis wenatchee".
// Gated, publish-ready copy from WENATCHEE_DISPENSARY_FINAL_2026_06_13.md
// (WSLCB no-claims gate PASS 2026-06-13). Mirrors the /near/<town>
// conventions: force-static + revalidate=false, LocalBusiness JSON-LD
// referencing the homepage #dispensary @id (graph consolidation),
// BreadcrumbList, FAQPage — all emitted via safeJsonLd. Every CTA → /menu
// (customer-cta-order-href rule). Voice: operator-direct, U+2019
// apostrophes, no effect/medical/promo claims.
//
// NOTE: the "20% off online orders" promo is RESTORED here (Doug confirmed
// 2026-06-13 it is currently live for Wenatchee / Green Life). It was
// genericized OUT at v43.196 during the WSLCB gate pending Doug's confirm;
// now re-added in GL voice, matching the site-wide online-order wording
// (deals/menu OG cards: "20% off online orders"; our-story "online orders
// save 20%"). WSLCB-fine: a dispensary's OWN online-order discount is not a
// prohibited third-party inducement (WAC 314-55-077(7) — same shape as the
// always-on online floor in lib/online-pricing.ts, ONLINE_DISCOUNT_PCT=20).
// Age-gated 21+ context retained. NOT a different %/terms — the 20% SSoT.

export const dynamic = "force-static";
export const revalidate = false;

// title.absolute drops the layout template suffix `· Green Life Cannabis`
// so the rendered <title> stays under Google's ~60-char SERP cap (this
// title is 42 chars). Brand is already in the title body. Mirrors the
// /near/* title.absolute pattern.
export const metadata: Metadata = {
  title: { absolute: "Wenatchee Dispensary — Green Life Cannabis" },
  // ~155 chars HTML-rendered — under the 160 SERP cap.
  description:
    "Green Life Cannabis is a Wenatchee dispensary on GS Center Rd — open 8 AM daily, deep flower/vape/edible selection, free parking, 20% off online orders. 21+.",
  alternates: { canonical: "/wenatchee-dispensary" },
  keywords: [
    "wenatchee dispensary",
    "dispensary wenatchee",
    "cannabis wenatchee",
    "weed wenatchee",
    "marijuana dispensary wenatchee",
    "dispensary near me wenatchee",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: { absolute: "Wenatchee Dispensary — Green Life Cannabis" },
    description:
      "Green Life Cannabis is a Wenatchee dispensary on GS Center Rd — open 8 AM daily, deep selection, free parking, 20% off online orders. 21+.",
    url: `${STORE.website}/wenatchee-dispensary`,
    siteName: STORE.name,
    // No co-located opengraph-image.tsx for this route — use the shared
    // homepage card (DEFAULT_OG_IMAGE) so the share/AI-preview card resolves
    // 200 instead of pointing at a non-existent per-route image (the v43.166
    // 404'd-card class). Re-emitting `images` here satisfies the
    // og-completeness gate after the Next metadata cascade shallow-overwrites
    // the parent openGraph block.
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function WenatcheeDispensaryPage() {
  // LocalBusiness — @id references the canonical homepage #dispensary node
  // (app/layout.tsx) so Google merges this head-term page into the single
  // store entity instead of treating it as a separate location.
  // mainEntityOfPage keeps the per-page binding intact. PostalAddress
  // streetAddress = STORE.address.street = "3012 GS Center Road Ste A"
  // (the GS-form SSoT — do not let a NAP normalizer drop "GS").
  const localBusinessLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${STORE.website}/#dispensary`,
    mainEntityOfPage: { "@id": `${STORE.website}/wenatchee-dispensary` },
    name: STORE.name,
    description: `Cannabis dispensary in ${STORE.address.city}, WA on GS Center Road. Flower, pre-rolls, vapes, edibles, concentrates and topicals from licensed Washington producers.`,
    address: {
      "@type": "PostalAddress",
      streetAddress: STORE.address.street,
      addressLocality: STORE.address.city,
      addressRegion: STORE.address.state,
      postalCode: STORE.address.zip,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: STORE.geo.lat,
      longitude: STORE.geo.lng,
    },
    telephone: STORE.phoneTel,
    url: `${STORE.website}/wenatchee-dispensary`,
    openingHoursSpecification: STORE.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.day,
      opens: to24h(h.open),
      closes: to24h(h.close),
    })),
    areaServed: {
      "@type": "City",
      name: `${STORE.address.city}, ${STORE.address.state}`,
    },
    // SpeakableSpecification — voice-assistant readback anchor. Generic
    // selectors so future copy stays decoupled from the contract.
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "[data-speakable]"],
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${STORE.website}/wenatchee-dispensary#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      {
        "@type": "ListItem",
        position: 2,
        name: "Wenatchee Dispensary",
        item: `${STORE.website}/wenatchee-dispensary`,
      },
    ],
  };

  // FAQPage — the 5 gated Q&As (logistics / location / preference only,
  // zero effect/medical/promo claims per the WSLCB gate). Operator-grit
  // voice, U+2019 apostrophes, routed through safeJsonLd.
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${STORE.website}/wenatchee-dispensary#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: "Where is the closest dispensary in Wenatchee?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `${STORE.name} is at ${STORE.address.full} (Sunnyslope), with free parking out front. We${"’"}re an easy stop from anywhere in the valley.`,
        },
      },
      {
        "@type": "Question",
        name: "Is the Wenatchee dispensary open now?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `We${"’"}re open 8 AM–9 PM Sunday through Thursday, and 8 AM–10 PM Friday and Saturday. Check the live status at the top of this page, or call ${STORE.phone}.`,
        },
      },
      {
        "@type": "Question",
        name: "What do I need to bring to the dispensary?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A valid government-issued ID showing you’re 21 or older. That’s it — Washington adult-use cannabis is 21+, no medical card required.",
        },
      },
      {
        "@type": "Question",
        name: "Can I order ahead for pickup?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes — and online orders are 20% off. Start an online order, pick a pickup time, then grab and go when you arrive.",
        },
      },
      {
        "@type": "Question",
        name: "Do you deliver?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No — Washington retail cannabis is in-store pickup only. You can order ahead online and pick up at the shop.",
        },
      },
    ],
  };

  return (
    <main className="bg-stone-50 text-stone-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(localBusinessLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqLd) }}
      />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative bg-green-950 text-white overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(74,222,128,0.18),transparent_55%)]"
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-10 sm:pb-14">
          <nav className="text-xs text-green-300/70 mb-6 flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span aria-hidden="true" className="text-green-700">
              ·
            </span>
            <span className="text-green-200">Wenatchee Dispensary</span>
          </nav>

          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-green-400 mb-3">
            Wenatchee · Sunnyslope
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] mb-4 max-w-3xl">
            The Wenatchee dispensary locals actually come back to
          </h1>
          <p
            className="text-base sm:text-lg text-green-100/90 leading-relaxed max-w-2xl mb-7"
            data-speakable
          >
            {STORE.name} has been Wenatchee&apos;s dispensary since 2014 — same
            building on GS Center Road, and the Valley&apos;s best cannabis
            staff behind the counter. We&apos;re open from 8 AM every day (until
            10 PM Friday and Saturday). Whether you&apos;re a Wenatchee regular
            or just passing through on US-2, you&apos;ll find a deep, rotating
            selection of Washington-grown flower, pre-rolls, vape carts,
            edibles, concentrates and topicals, plus budtenders who genuinely
            know the menu and take the time to help you find the right pick.
            Free parking out front, ATM on-site, walk-ins always welcome.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl bg-green-400 hover:bg-green-300 text-green-950 font-bold text-sm transition-all shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2 focus-visible:ring-offset-green-950"
            >
              Browse menu
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/visit"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
            >
              Hours + directions
            </Link>
            <a
              href={`tel:${STORE.phoneTel}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white/85 hover:text-white text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
            >
              <span aria-hidden="true">📞</span>
              {STORE.phone}
            </a>
          </div>
        </div>
      </section>

      {/* ── WHY WENATCHEE SHOPS HERE ─────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 mb-12 sm:mb-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-700 mb-2">
          Why Wenatchee shops here
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mb-6 leading-tight">
          A dispensary built around the regulars
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-2xl bg-white border border-stone-200 shadow-sm px-5 py-5">
            <div className="text-base font-bold text-stone-900 mb-1.5">
              Open early, open late
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">
              Doors at 8 AM every day, and we stay open till 10 PM on Friday and
              Saturday for the late-night runs.
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-stone-200 shadow-sm px-5 py-5">
            <div className="text-base font-bold text-stone-900 mb-1.5">
              A menu worth browsing
            </div>
            <p className="text-sm text-stone-700 leading-relaxed mb-3">
              Flower, pre-rolls, vapes, edibles, concentrates and topicals from
              Washington growers, restocked constantly.
            </p>
            <Link
              href="/menu"
              className="text-sm font-semibold text-green-700 hover:text-green-800"
            >
              Browse the full menu →
            </Link>
          </div>
          <div className="rounded-2xl bg-white border border-stone-200 shadow-sm px-5 py-5">
            <div className="text-base font-bold text-stone-900 mb-1.5">
              Easy in, easy out
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">
              Free parking right out front on GS Center Road, ATM inside, ADA-accessible,
              and walk-ins are always welcome. Order ahead online — online
              orders save 20%.
            </p>
          </div>
        </div>
      </section>

      {/* ── FIND US IN WENATCHEE ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-700 mb-2">
            Find us in Wenatchee
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mb-4 leading-tight">
            On GS Center Road in Sunnyslope
          </h2>
          <p className="text-base sm:text-lg text-stone-700 leading-relaxed mb-4">
            You&apos;ll find us at{" "}
            <strong className="text-stone-900" data-speakable>
              {STORE.address.full}
            </strong>{" "}
            — in Sunnyslope, easy to reach from anywhere in the valley.
            We&apos;re the natural stop for East Wenatchee, Cashmere,
            Leavenworth, Entiat, and the Lake Chelan run.{" "}
            <Link href="/near" className="text-green-700 hover:text-green-800 underline">
              See drive times from your town →
            </Link>
          </p>
          <ul className="text-sm text-stone-700 space-y-1">
            <li>
              <strong className="text-stone-900">Hours:</strong> 8 AM–9 PM
              Sunday–Thursday · 8 AM–10 PM Friday &amp; Saturday.
            </li>
            <li>
              <strong className="text-stone-900">Phone:</strong>{" "}
              <a href={`tel:${STORE.phoneTel}`} className="text-green-700 hover:text-green-800">
                {STORE.phone}
              </a>
              .
            </li>
          </ul>
        </div>
      </section>

      {/* ── WHAT WE CARRY ────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-700 mb-2">
            What we carry
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mb-4 leading-tight">
            A quick look at the floor
          </h2>
          <p className="text-base text-stone-700 leading-relaxed mb-5">
            All from licensed Washington producers, all lab-tested per state
            rules:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            <li className="rounded-xl bg-white border border-stone-200 px-4 py-3">
              <span className="font-semibold text-stone-900">Flower</span>
              <span className="text-stone-500 text-sm"> — indica, sativa, and hybrid jars + pre-packs</span>
            </li>
            <li className="rounded-xl bg-white border border-stone-200 px-4 py-3">
              <span className="font-semibold text-stone-900">Pre-rolls</span>
              <span className="text-stone-500 text-sm"> — singles, packs, and infused</span>
            </li>
            <li className="rounded-xl bg-white border border-stone-200 px-4 py-3">
              <span className="font-semibold text-stone-900">Vapes</span>
              <span className="text-stone-500 text-sm"> — carts, disposables, and pods</span>
            </li>
            <li className="rounded-xl bg-white border border-stone-200 px-4 py-3">
              <span className="font-semibold text-stone-900">Edibles</span>
              <span className="text-stone-500 text-sm"> — gummies, chocolates, drinks</span>
            </li>
            <li className="rounded-xl bg-white border border-stone-200 px-4 py-3">
              <span className="font-semibold text-stone-900">Concentrates</span>
              <span className="text-stone-500 text-sm"> — wax, rosin, live resin</span>
            </li>
            <li className="rounded-xl bg-white border border-stone-200 px-4 py-3">
              <span className="font-semibold text-stone-900">Topicals &amp; more</span>
            </li>
          </ul>
          <Link
            href="/menu"
            className="text-sm font-semibold text-green-700 hover:text-green-800"
          >
            Browse the full live menu →
          </Link>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-700 mb-2">
            FAQ
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mb-6 leading-tight">
            Common questions
          </h2>
          <dl className="space-y-5">
            {faqLd.mainEntity.map((q) => (
              <div key={q.name} className="rounded-2xl bg-white border border-stone-200 px-5 py-4">
                <dt className="font-semibold text-stone-900 mb-1.5">{q.name}</dt>
                <dd className="text-sm text-stone-700 leading-relaxed">
                  {q.acceptedAnswer.text}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── CLOSING CTA ──────────────────────────────────────────────── */}
      <section className="bg-green-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="max-w-md">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-400 mb-2">
                Stop by today
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 leading-tight">
                {STORE.address.street}, Wenatchee
              </h2>
              <p className="text-green-200/80 text-sm sm:text-base leading-relaxed">
                Open 8 AM daily. Must be 21+ with valid ID. Order ahead online —
                online orders save 20%.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/menu"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-green-400 hover:bg-green-300 text-green-950 font-bold text-sm transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2 focus-visible:ring-offset-green-950"
              >
                Browse menu
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/visit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
              >
                Hours + directions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// "8:00 AM" → "08:00", "10:00 PM" → "22:00" for the OpeningHoursSpecification
// schema fields (ISO 24h time). Local helper — STORE.hours is the SSoT for
// the display strings; schema needs the 24h form.
function to24h(t: string): string {
  const [time, ampm] = t.split(" ");
  const [hRaw, m] = time.split(":");
  let h = Number(hRaw);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${m}`;
}
