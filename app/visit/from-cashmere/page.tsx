import type { Metadata } from "next";
import Link from "next/link";
import { STORE, DEFAULT_OG_IMAGE } from "@/lib/store";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  renderVisitFromSourceBody,
  visitFromSourceArticleLd,
  visitFromSourceBreadcrumbLd,
  visitFromSourceLocalBusinessLd,
  visitFromSourceUrl,
  type VisitFromSourceConfig,
} from "@/lib/visit-from-source-render";

// /visit/from-cashmere — high-intent driver-side landing page for
// Cashmere visitors ("dispensary near Cashmere WA", "closest cannabis
// to Cashmere"). Per the SEO_AUDIT_AUTONOMOUS_WINS_2026_05_26 Tech-SEO
// #3 cross-stack parity scope: extend the /visit/from-leavenworth
// reference pattern to additional trade-area towns. Static (force-
// static); no per-request DB calls.
//
// Distinct from /near/cashmere (service-area landing); this page targets
// "I'm IN Cashmere, where do I drive" intent with directions, the drive
// itself, and visitor-side context.

export const dynamic = "force-static";
export const revalidate = false;

const CONFIG: VisitFromSourceConfig = {
  slug: "cashmere",
  sourceName: "Cashmere",
  title: "From Cashmere: 18 minutes east to Green Life Cannabis",
  description:
    "Cashmere has no recreational dispensary inside city limits. Green Life Cannabis is 18 minutes east on US-2 — directions, hours, and what to bring.",
  body: `Cashmere doesn't have a recreational cannabis dispensary inside city limits. Green Life Cannabis is the closest legal cannabis to Cashmere — 18 minutes east on US-2, in the Sunnyslope neighborhood of Wenatchee.

## The drive

US-2 east out of Cashmere, past Monitor, into the Wenatchee Valley. The road follows the Wenatchee River the whole way — a quick run with one easy lane change at the US-2/US-97 split. We're right off the split on Center Road. Free parking out front.

- **From Cashmere Riverside Park:** 12.8 miles, about 18 min, no toll.
- **From Aplets & Cotlets factory store:** 13.1 miles, about 19 min.
- **From the Sunnyslope exit:** 2 min once you're off US-2.

## Hours that matter for the drive

- **Fri / Sat** — open until 10 PM.
- **Sun-Thu** — open until 9 PM.
- **Pickup orders** — last online order is 15 minutes before close, so staff can stage the bag.

If you're driving back from a Cashmere dinner on a Saturday and don't get rolling til 8, you have time. Drive cautiously.

## What to bring

- A valid 21+ photo ID — Washington driver's license, out-of-state license, US passport, military ID. (No expired IDs, no photos of IDs.)
- Cash for the order. We're cash-only — every Washington dispensary is, because the major card networks won't process for cannabis. ATM in the lobby ($3 surcharge typical).
- Your phone, if you want to browse the menu on the way over. Live menu's at /menu.

## What customers from Cashmere typically ask about

We see a lot of Cashmere-side regulars, both town residents and orchard families up the canyon. The common patterns:

- **Locals** — pre-rolls and flower for the porch. Eighths and quarter-ounces are the most common purchase size.
- **Aplets & Cotlets weekend visitors** — small-format edibles, low-dose gummies. Travelers often ask about "discreet" formats — vapes and small-dose gummies are the typical answer.
- **Up-canyon residents** — usually a once-a-week stop on the way through town for groceries. Pre-rolls + an eighth covers most of it.

If you're new to a Washington dispensary, take 10 minutes at the counter — we'll walk you through the menu. Our first-time customer guide covers the door-to-bag walkthrough if you want to read ahead.

## What you can't do

Washington law prohibits consuming cannabis in any public space, including the dispensary parking lot, sidewalks, parks, and most outdoor areas. The product is sealed in an exit bag for transport, not for use on-site.

A few specifics that come up most:

- **Don't open the bag in the parking lot.** Consume at home or wherever you're staying privately.
- **Driving impaired is a DUI under Washington law.** Same as alcohol. If you've consumed, get a ride.
- **You can't legally cross into Idaho with cannabis.** Cannabis is illegal in Idaho. Take it home in WA.

## Pair it with

Worth knowing for the drive back:

- **Pybus Public Market** — local food, cider, river view. 5 min south of us, easy detour before or after.
- **Apple Capital Recreation Loop** — the Columbia River loop for a walk after the drive.
- **Leavenworth** — 17 min west on US-2 if you're chaining a Bavarian-village visit onto the run.

The drive's worth it. We'll see you in 18.`,
};

export const metadata: Metadata = {
  title: { absolute: `${CONFIG.title} — ${STORE.name}` },
  description: CONFIG.description,
  alternates: { canonical: `/visit/from-${CONFIG.slug}` },
  openGraph: {
    type: "article",
    locale: "en_US",
    title: CONFIG.title,
    description: CONFIG.description,
    url: visitFromSourceUrl(CONFIG.slug),
    siteName: STORE.name,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function VisitFromCashmerePage() {
  const breadcrumbLd = visitFromSourceBreadcrumbLd(CONFIG);
  const articleLd = visitFromSourceArticleLd(CONFIG);
  const businessLd = visitFromSourceLocalBusinessLd(CONFIG);
  const sections = renderVisitFromSourceBody(CONFIG.body);

  return (
    <main className="bg-zinc-950 text-zinc-100 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(businessLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleLd) }} />

      <Breadcrumb
        items={[
          { label: "Visit", href: "/visit" },
          { label: `From ${CONFIG.sourceName}` },
        ]}
      />

      <section className="relative overflow-hidden border-b border-emerald-900/40 bg-gradient-to-br from-emerald-950 via-zinc-950 to-zinc-950">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-10 sm:pt-12 sm:pb-14">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400 mb-3">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>From {CONFIG.sourceName}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1] mb-4">
            {CONFIG.title}
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl">
            {CONFIG.description}
          </p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="prose prose-invert prose-zinc prose-lg max-w-none
          prose-headings:text-white prose-headings:tracking-tight
          prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4
          prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:mb-5
          prose-strong:text-zinc-100
          prose-ul:my-5 prose-li:text-zinc-300 prose-li:my-1
          prose-a:text-emerald-400 hover:prose-a:text-emerald-300">
          {sections}
        </div>
      </article>

      <section className="border-y border-emerald-900/40 bg-gradient-to-br from-emerald-950 to-zinc-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400 mb-2">
            Plan ahead
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
            Browse the live menu before you drive.
          </h2>
          <p className="text-zinc-300 leading-relaxed mb-5 max-w-xl">
            Same products in our case. Build your order in the car, hand the budtender the list at the counter, in and out in five.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-colors"
            >
              Browse the menu →
            </Link>
            <Link
              href="/visit"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 hover:border-zinc-500 px-6 py-3 text-sm font-medium text-zinc-200 hover:bg-zinc-900 transition-colors"
            >
              Hours, address, parking
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-xs text-zinc-500 text-center leading-relaxed">
          {STORE.name} · {STORE.address.full} · {STORE.phone} · 21+ with valid ID · Cash only, ATM on-site
        </p>
      </div>
    </main>
  );
}
