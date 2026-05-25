import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { withAttr } from "@/lib/attribution";
import { sanitizeRef, refToAttrSlug, withRef, DEFAULT_MAILER_REF } from "@/lib/welcome-ref";
import { safeJsonLd } from "@/lib/json-ld-safe";

// /welcome — direct-mailer QR code landing page.
//
// Context: Kat's Wenatchee direct-mail drop (~20K households, USPS EDDM,
// competitor-displacement targeting per `reference_wen_direct_mailer_kat_2025_2026`).
// The mailer's QR code points at `greenlifecannabis.com/welcome?ref=mailer-wen-202605`.
//
// Mission spec: `feedback_loyalty_marketing_cadence_slow_drip_customer_led_2026_05_24`
// "Direct-mailer integration" section. Copy SSoT:
// `/CODE/Green Life/COPY_LOYALTY_MARKETING_2026_05_25.md` §7.
//
// Page contract:
//   1. Server component. Reads `?ref=` from the URL, sanitizes via
//      `lib/welcome-ref#sanitizeRef`, falls back to DEFAULT_MAILER_REF
//      if absent (so users typing the URL by hand still attribute
//      correctly — the postcard prints the canonical URL).
//   2. Forwards both `?ref=` AND `?from=mailer:<slug>` on every outbound
//      CTA so the existing attribution cookie pipeline (proxy.ts) writes
//      the cookie AND any downstream surface that wants the raw campaign
//      id can read it from the URL.
//   3. `robots: noindex` — this URL is referrer-specific (mailer
//      scanners) and shouldn't compete with organic SEO for "Green Life
//      Cannabis Wenatchee" queries. Belt-and-suspenders: also a
//      cosmetic disallow in robots.ts (we keep it OUT of the sitemap
//      too — it's not in app/sitemap.ts intentionally).
//   4. WSLCB / WAC 314-55-155 clean: no efficacy claims, no medical
//      advice, no ownership claims that aren't legally accurate (the
//      shop is locally owned per the standing brand-voice rule). The
//      30% first-visit copy is acquisition / loyalty-signup, not a
//      daily discount promo (the brand-voice rule allows this framing
//      for acquisition only).
//   5. 21+ messaging surfaced in the trust strip AND footer micro-note
//      (we rely on the global proxy-level controls for the live menu;
//      this page is informational only — no purchase flow gated here).
//   6. Mobile-first: single-column above-fold, ≥48px tap targets on
//      both CTAs (px-5 py-3.5 = 22px+22px+content ≈ 56px), no
//      horizontal overflow (max-w-* + responsive grid).

// Static page — no DB reads, no live data. Server component still works
// because `searchParams` is supported on RSC pages; declaring revalidate
// is unnecessary (page is fully static aside from the ref param which
// renders nowhere user-visible — it's only used to build attribution
// links). Force-dynamic would defeat CDN caching for the ~20K mailer
// scanners hitting in a few days; we want this CDN-cached but with
// per-request CTA URLs built from the ref. Default RSC caching honors
// searchParams + still serves the bulk of the page from cache.

const PAGE_TITLE = "Welcome — Green Life Cannabis · Wenatchee";
const PAGE_DESCRIPTION = `Center Road since 2014. Best cannabis staff in the Wenatchee Valley. 21+ with valid ID. Cash only, ATM on site.`;

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/welcome" },
  // noindex — mailer-specific URL. Don't compete with / for organic
  // search. Brand-anchor queries should land on / (homepage), product
  // queries on /menu, location queries on /visit.
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${STORE.website}/welcome`,
    siteName: STORE.name,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${STORE.name} — Welcome`,
      },
    ],
  },
};

// LocalBusiness JSON-LD — minimal version. Brand-anchor SEO lives on /
// (per the sitemap priority work). This page emits LocalBusiness so the
// rare-but-real "scan the QR + share the URL" case still surfaces the
// shop's hours / address / phone in any structured-data-aware client.
const localBusinessLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  "@id": `${STORE.website}/welcome#store`,
  name: STORE.name,
  description: PAGE_DESCRIPTION,
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
  url: `${STORE.website}/welcome`,
};

type WelcomePageProps = {
  searchParams: Promise<{ ref?: string | string[] }>;
};

export default async function WelcomePage({ searchParams }: WelcomePageProps) {
  // Next 16 — searchParams is a Promise on Server Components per the
  // App Router conventions docs in node_modules/next/dist/docs/.
  const params = await searchParams;
  const rawRef = Array.isArray(params.ref) ? params.ref[0] : params.ref;
  // Sanitize → fall back to the canonical mailer ref so direct visits
  // (someone types the URL from the postcard without the QR) still
  // attribute correctly.
  const ref = sanitizeRef(rawRef) ?? DEFAULT_MAILER_REF;
  const attrSlug = refToAttrSlug(ref);

  // Build CTA URLs with BOTH:
  //   - ?from=mailer:<slug> for the existing cookie pipeline (proxy.ts
  //     reads this on the next request and writes gl_attr_source).
  //   - ?ref=<full-ref> so downstream surfaces can read the raw campaign id.
  const menuHref = withRef(withAttr("/menu", "mailer", attrSlug), ref);
  const visitHref = withRef(withAttr("/visit", "mailer", attrSlug), ref);

  return (
    <main className="min-h-[80vh] bg-stone-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(localBusinessLd) }}
      />

      {/* Hero — single-column above-fold */}
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
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <p className="text-amber-300 text-xs font-bold uppercase tracking-[0.18em] mb-3">
            Welcome
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            The best cannabis staff in the Wenatchee Valley.
          </h1>
          <p className="text-emerald-100/90 mt-5 text-base sm:text-lg leading-relaxed">
            Center Road since 2014. Cash only, ATM on site, 21+ with valid ID. Stop in or order
            ahead.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10 sm:space-y-12">
        {/* Body — paragraph 1 */}
        <section className="space-y-5">
          <p className="text-stone-700 text-base sm:text-lg leading-relaxed">
            If you got our card in the mail, here&apos;s the deal: we&apos;re Green Life, and
            we&apos;ve been on Center Road for over a decade. You&apos;ll find the deepest staff
            bench in the Valley — people who actually know the product, not just where it sits on
            the shelf.
          </p>
          {/* Body — paragraph 2 */}
          <p className="text-stone-700 text-base sm:text-lg leading-relaxed">
            First visit, sign up real quick at the counter and we&apos;ll get you 30% off plus
            you&apos;ll be in the system for next time. After that, the more you visit the more
            your tier grows — Regular, Local, Family. No card to carry, no app required.
          </p>
        </section>

        {/* CTAs — stacked on mobile, side-by-side on sm+. ≥48px tap targets. */}
        <section className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link
            href={menuHref}
            className="flex-1 inline-flex items-center justify-center px-5 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-green-950 text-base font-bold transition-all shadow-md min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          >
            See the menu →
          </Link>
          <Link
            href={visitHref}
            className="flex-1 inline-flex items-center justify-center px-5 py-3.5 rounded-xl bg-green-900 hover:bg-green-800 text-white text-base font-semibold transition-all min-h-[48px] border border-green-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
          >
            Stop in — {STORE.address.street}
          </Link>
        </section>

        {/* Google Maps deep-link — secondary, lower-visual-weight */}
        <section className="text-center">
          <a
            href={STORE.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-green-700 hover:text-green-900 underline underline-offset-2"
          >
            Get directions on Google Maps →
          </a>
        </section>

        {/* Trust strip — one line, small */}
        <section className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 text-center">
          <p className="text-stone-700 text-sm sm:text-base font-medium">
            21+ with valid ID · Cash only · ATM on site · Open 7 days
          </p>
        </section>

        {/* Footer micro-note */}
        <section className="text-center pt-2">
          <p className="text-stone-500 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            Got the postcard? Mention it at the counter — we like knowing what reaches you.
          </p>
        </section>
      </div>
    </main>
  );
}
