import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STORE } from "@/lib/store";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { Breadcrumb } from "@/components/Breadcrumb";
import { BRIEF_LIBRARY, getBrief } from "@/lib/ambassador-briefs";

// /community/ambassador/briefs/[slug] — Phase 2.5 per-brief shareable
// deep page for the Ambassador Program v0.1. Per
// PLAN_AMBASSADOR_PROGRAM.md §3: "Each brief gets a shareable 1-page
// graphic customers can pull up on their phone in-store: prompt + tips
// + compliance reminders + submission link." Phase 2 shipped the briefs
// INLINE on /community/ambassador; this surface gives each brief its
// own permalink for QR-coded counter cards + Featured-of-the-week
// social hand-offs.
//
// Surface goals:
//   1. Phone-first portrait layout — customer in-store opens this page
//      from a printed counter card QR; primary read distance is arm's
//      length on a 5–6.5" device.
//   2. Per-brief COMPLIANCE tips lifted verbatim from
//      AMBASSADOR_INSTORE_COLLATERAL_2026_05_23.md §2 (comms-expert
//      drafted "what we're looking for" + "what we WON'T accept"). Each
//      card has BRIEF-SPECIFIC compliance reminders, not the boilerplate
//      list — Strain Cheers calls out "helps me sleep", Budtender
//      Shoutout calls out "best budtender in town" (competitor-compare
//      ban), etc.
//   3. Big QR-code section pointing back to /community/ambassador
//      pre-filtered to this brief — customer in-store can show the
//      printed card to a friend who scans + lands ready to submit.
//   4. Tenure-as-credential framing only ("Center Road since 2014") —
//      NO "locally owned" / "Wenatchee's favorite" / efficacy vocabulary
//      anywhere; verified by check-brand-voice-locally-owned.mjs +
//      check-efficacy-claims.mjs gates.
//
// CRITICAL: this file is **byte-identical** between greenlife-web and
// seattle-cannabis-web. Maintain in lockstep — sister-port any change
// to both stacks in the same push window. STORE.* differences substitute
// per-stack ("Center Road since 2014" vs "Rainier Valley since 2010";
// greenlifecannabis.com vs seattlecannabis.co URLs).

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return BRIEF_LIBRARY.map((b) => ({ slug: b.id }));
}

// Per-brief content tier from the §2 collateral doc. Keyed by brief id
// (matching BRIEF_LIBRARY). "lookingFor" + "wontAccept" are
// BRIEF-SPECIFIC — not boilerplate — so each deep page reads with the
// compliance edge cases the comms-expert drafted for that brief
// (Strain Cheers's "Helps me sleep", Budtender Shoutout's "Best
// budtender in town", etc.).
//
// Each tip array stays at 3 entries to match the §2 card layout
// (front-of-card "what we're looking for" + back-of-card "what we
// won't post"). Drift up = layout breaks on small phones; drift down
// = loses the brief-specific edge case.
//
// If a brief id is missing here at build time, the page falls back to
// the brief's prompt/complianceTips from BRIEF_LIBRARY (so renderer
// can never crash on a known-good slug); but the build-time test pin
// asserts every BRIEF_LIBRARY id has an entry in DEEP_CARD_CONTENT so
// the per-brief edge cases stay load-bearing.
const DEEP_CARD_CONTENT: Record<
  string,
  {
    headline: string;
    lookingFor: readonly string[];
    wontAccept: readonly string[];
  }
> = {
  "strain-cheers": {
    headline: "Hold up the strain you grabbed today. Tell us in about 10 words why.",
    lookingFor: [
      "Your favorite line from a budtender about it",
      "Why this strain over the one next to it",
      "Real reaction — “this smells nuts” beats a scripted line every time",
    ],
    wontAccept: [
      "Effect or condition claims (sleep, anxiety, pain, etc.) — WSLCB rule, automatic reject",
      "“20 mg got me right” — no dosing claims",
      "Any consumption on camera — flower in hand is fine; lighting it is not",
    ],
  },
  "budtender-shoutout": {
    headline: `Name a ${STORE.name} budtender by first name. Tell us one thing they did that mattered.`,
    lookingFor: [
      "First name only — “Charity” not “Charity B.”",
      "A specific moment — “she remembered I’d been looking for a low-dose edible” beats “she was nice”",
      "Your real read, not a sales line",
    ],
    wontAccept: [
      "Last names — first names only, customer AND budtender",
      "“Best budtender in town” type lines — we don’t make that claim about ourselves and we don’t ask customers to either",
      "Anything that compares us by name to another shop",
    ],
  },
  "whats-in-bag": {
    headline: "Open your bag on camera. Walk us through what you bought today and why.",
    lookingFor: [
      "One item at a time — pull it out, name it, one line on why",
      "Show the packaging if you want (helps other customers find it on the menu)",
      "Honest reactions — “I never tried this brand before, here goes” is great",
    ],
    wontAccept: [
      "No on-camera consumption — packaging in hand is fine; opening + sampling is not",
      "No medical or effects claims, no specific dosing math",
      "Friends in frame must be 21+",
    ],
  },
  "outfit-vibe": {
    headline:
      "Show your fit. Tell us the energy you’re going for tonight, this weekend, today — whatever’s real.",
    lookingFor: [
      "The 5-second pitch on the vibe",
      "One specific plan — “porch + sunset” beats “chillin”",
      "A nod to what you grabbed if it fits naturally; don’t force it",
    ],
    wontAccept: [
      "No consumption in frame",
      "No anyone under 21 in frame, full stop",
      "No location pins that show your home address — outside-the-shop is fine; your porch with the house numbers visible is not",
    ],
  },
  "walking-out-happy": {
    headline: "30 seconds outside the shop, right after a great visit. Tell us what made it.",
    lookingFor: [
      "The thing that actually made the visit — a recommendation, an answered question, a strain you didn’t know to ask for",
      "Genuine, not staged — first take usually wins",
      "The budtender’s first name if you want to credit them (counts as a Shoutout too)",
    ],
    wontAccept: [
      "Other customers visible in frame",
      "Consumption — wait until you’re home",
      "The “I love this place” lap-of-honor video with no substance — we want the specific reason",
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brief = getBrief(slug);
  if (!brief) {
    return { title: { absolute: `Ambassador brief — ${STORE.name}` } };
  }
  const canonical = `/community/ambassador/briefs/${brief.id}`;
  const desc = `${brief.title} — Ambassador brief at ${STORE.name}. Record outside the shop, manager-reviewed within 48 hours, $25 store credit on approval.`;
  return {
    title: { absolute: `${brief.title} — Ambassador brief — ${STORE.name}` },
    description: desc.slice(0, 155),
    alternates: { canonical },
    openGraph: {
      siteName: STORE.name,
      type: "article",
      locale: "en_US",
      title: `${brief.title} — Ambassador brief`,
      description: desc.slice(0, 155),
      url: `${STORE.website}${canonical}`,
      images: [
        {
          url: `${canonical}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${brief.title} — Ambassador brief — ${STORE.name}`,
        },
      ],
    },
  };
}

export default async function AmbassadorBriefDeepPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brief = getBrief(slug);
  if (!brief) {
    // dynamicParams = false guarantees this never fires at request time
    // for known good slugs; defensive fallback for future-renamed slugs
    // that haven't re-built yet.
    notFound();
  }
  const content = DEEP_CARD_CONTENT[brief.id] ?? {
    headline: brief.prompt,
    lookingFor: brief.complianceTips.slice(0, 3),
    wontAccept: brief.complianceTips.slice(0, 3),
  };

  // The QR code points back to /community/ambassador with ?brief=<slug>
  // and a #submit anchor — when a customer in-store scans the card, the
  // landing page can read the query param, scroll to the form, and
  // pre-fill the brief dropdown. (Phase 2 form ignores unknown params
  // gracefully, so the QR is safe to ship before the pre-fill wiring
  // lands — worst case is customer lands on the form un-prefilled.)
  const submitUrl = `${STORE.website}/community/ambassador?brief=${brief.id}#submit`;
  // Public QR service (qrserver.com — same family of free CGI services
  // as qrickit; been live + stable since 2010). 240×240 PNG, ~3KB,
  // browser-cached via the URL itself. Margin=2 keeps the quiet zone
  // tight enough for printed-card embedding. We render via plain <img>
  // (not next/image) to bypass Next image optimization — the QR is
  // already an optimized binary; round-tripping through /next-image
  // would just add latency without saving bytes. If qrserver.com is
  // ever down, the fallback URL text below the QR keeps the page
  // functional (customer can read + type it).
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=2&data=${encodeURIComponent(
    submitUrl,
  )}`;

  const canonical = `/community/ambassador/briefs/${brief.id}`;
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${STORE.website}${canonical}#breadcrumb`,
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
        name: brief.title,
        item: `${STORE.website}${canonical}`,
      },
    ],
  };
  const webPageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${STORE.website}${canonical}#webpage`,
    url: `${STORE.website}${canonical}`,
    name: `${brief.title} — Ambassador brief — ${STORE.name}`,
    isPartOf: { "@id": `${STORE.website}/#website` },
    about: { "@type": "Organization", name: STORE.name },
  };

  return (
    <main className="min-h-[80vh] bg-stone-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(webPageLd) }}
      />

      <Breadcrumb
        items={[
          { label: "Community", href: "/community" },
          { label: "Ambassador", href: "/community/ambassador" },
          { label: brief.title },
        ]}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Link
          href="/community/ambassador"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-900 mb-5"
        >
          <span aria-hidden="true">←</span>
          <span>All briefs</span>
        </Link>

        {/* Hero — phone-first portrait */}
        <section className="rounded-3xl bg-gradient-to-br from-green-950 via-emerald-900 to-green-800 text-white p-7 sm:p-10 mb-8 shadow-xl">
          <p className="text-amber-300 text-xs font-bold uppercase tracking-[0.18em] mb-3">
            Ambassador brief
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            {brief.title}
          </h1>
          <p className="text-emerald-100/90 text-base sm:text-lg leading-relaxed mt-4">
            {content.headline}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-green-950 text-xs font-bold">
              ~{brief.targetSeconds} seconds · vertical
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white text-xs font-semibold">
              Record outside the shop
            </span>
          </div>
        </section>

        {/* What we're looking for */}
        <section className="rounded-2xl bg-white border border-stone-200 p-6 sm:p-7 mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700 mb-2.5">
            What we&rsquo;re looking for
          </p>
          <ul className="space-y-3">
            {content.lookingFor.map((tip) => (
              <li key={tip} className="flex gap-3 text-stone-800 text-sm sm:text-base leading-relaxed">
                <span aria-hidden="true" className="text-green-600 font-bold mt-0.5 flex-shrink-0">
                  &#10003;
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* What we won't accept */}
        <section className="rounded-2xl bg-amber-50 border border-amber-200 p-6 sm:p-7 mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800 mb-2.5">
            What we won&rsquo;t post
          </p>
          <ul className="space-y-3">
            {content.wontAccept.map((tip) => (
              <li key={tip} className="flex gap-3 text-stone-800 text-sm sm:text-base leading-relaxed">
                <span aria-hidden="true" className="text-amber-700 font-bold mt-0.5 flex-shrink-0">
                  &#10007;
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-amber-900/80 mt-4 leading-snug">
            State rule: WAC 314-55-155 sets these boundaries. Self-screen before you upload.
          </p>
        </section>

        {/* Reward + CTA */}
        <section className="rounded-2xl bg-white border border-stone-200 p-6 sm:p-7 mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700 mb-2.5">
            What you earn
          </p>
          <p className="text-stone-800 text-sm sm:text-base leading-relaxed">
            <span className="font-bold">$25 store credit</span> when a manager approves your video.
            <span className="font-bold"> $50</span> if we feature it on our channels.
            <span className="font-bold"> $100 + branded swag</span> if it crosses 1,000+ views.
            Manager reviews within 48 hours.
          </p>
          <div className="mt-5">
            <Link
              href={`/community/ambassador?brief=${brief.id}#submit`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-green-950 text-base font-bold transition-all shadow-md w-full sm:w-auto"
            >
              Submit your video →
            </Link>
          </div>
        </section>

        {/* QR code section */}
        <section className="rounded-2xl bg-stone-100 border border-stone-200 p-6 sm:p-7 mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-600 mb-3">
            Scan to upload (or share the card)
          </p>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="flex-shrink-0 bg-white p-3 rounded-xl border border-stone-300 shadow-sm">
              {/* Plain <img> intentional — QR is already an optimized PNG;
                  routing through next/image adds latency without bytes
                  savings. Width/height set explicit so layout doesn't
                  shift on slow connections. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrSrc}
                width={240}
                height={240}
                alt={`QR code linking to the ${brief.title} submission form on ${STORE.name}`}
                loading="lazy"
                decoding="async"
                style={{ display: "block" }}
              />
            </div>
            <div className="flex-1 text-sm text-stone-700 leading-relaxed">
              <p className="mb-2">
                Scan with your phone camera, or pull the page up at:
              </p>
              <p className="font-mono text-xs sm:text-sm bg-white border border-stone-300 rounded-md px-2.5 py-1.5 break-all">
                {submitUrl.replace(/^https?:\/\//, "")}
              </p>
              <p className="text-xs text-stone-500 mt-3 leading-snug">
                Show this card to a friend in line behind you — they scan, the
                page lands on the same brief, ready to record.
              </p>
            </div>
          </div>
        </section>

        {/* Compliance microcopy footer */}
        <section className="rounded-2xl bg-green-950 text-white p-6 sm:p-7 text-sm leading-relaxed space-y-2">
          <p className="text-emerald-300 text-xs font-bold uppercase tracking-[0.18em]">
            Before you press record
          </p>
          <p className="text-emerald-100/90">
            Record outside the store. 21+ on camera. No consumption shown. First names only.
            Customer received store credit for any video we re-share — disclosed on every post per FTC.
            Take-downs honored within 7 days, no questions.
          </p>
          <p className="text-emerald-200/70 text-xs pt-1">
            {STORE.name} ·{" "}
            {STORE.wslcbLicense ? `WSLCB ${STORE.wslcbLicense}` : "WSLCB-licensed"}
          </p>
        </section>
      </div>
    </main>
  );
}
