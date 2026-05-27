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

// /visit/from-wenatchee-heights — high-intent landing page for the
// Wenatchee Heights / Squilchuck Canyon / Number One Canyon hill-side
// neighborhoods south of downtown Wenatchee. Different drive context
// from a town-to-town /visit/from-* — short hop, but a real route
// decision (Squilchuck Rd north vs Cherry St back through downtown).
// Per the SEO_AUDIT_AUTONOMOUS_WINS_2026_05_26 Tech-SEO #3 cross-stack
// parity scope. Static (force-static); no per-request DB calls.

export const dynamic = "force-static";
export const revalidate = false;

const CONFIG: VisitFromSourceConfig = {
  slug: "wenatchee-heights",
  sourceName: "Wenatchee Heights",
  title: "From Wenatchee Heights: 12 minutes down to Green Life Cannabis",
  description:
    "From the Wenatchee Heights / Squilchuck Canyon side, Green Life Cannabis is a 12-minute drive down through Sunnyslope. Directions, hours, and what to bring.",
  body: `Wenatchee Heights, Squilchuck Canyon, and the Number One Canyon foothills sit up the hill south of downtown Wenatchee. Green Life Cannabis is at the bottom — 12 minutes down through Sunnyslope on the corner of Center Road.

## The drive

Two routes work. The faster route most regulars take:

- **Squilchuck Rd north** to Wenatchee Heights Rd, down to South Methow St, across the Sunnyslope cutoff to Center Road. About 12 minutes from the top of the Heights, no downtown stoplights.
- **Cherry St back through downtown** then North up Wenatchee Ave to Sunnyslope. About 16 minutes — slower in summer when downtown traffic backs up, but a good option if you're already running an errand on Wenatchee Ave.

The Sunnyslope cutoff is the route on Apple Blossom weekend — downtown gets packed and Squilchuck-side residents save 15 minutes by skipping it entirely. Free parking out front.

## Hours that matter for the drive

- **Fri / Sat** — open until 10 PM.
- **Sun-Thu** — open until 9 PM.
- **Pickup orders** — last online order is 15 minutes before close, so staff can stage the bag.

A quick post-work or post-dinner run is the typical pattern for Heights regulars. The drive down is short enough that a 7:30 PM order-pickup is a non-event even on a weekday.

## What to bring

- A valid 21+ photo ID — Washington driver's license, out-of-state license, US passport, military ID. (No expired IDs, no photos of IDs.)
- Cash for the order. We're cash-only — every Washington dispensary is, because the major card networks won't process for cannabis. ATM in the lobby ($3 surcharge typical).
- Your phone, if you want to browse the menu on the way over. Live menu's at /menu.

## What customers from the Heights typically ask about

The Heights / Squilchuck corridor leans residential — orchard families up the canyon, retired professionals on the bluff, younger families in the newer developments. Common purchase patterns:

- **Weeknight regulars** — pre-rolls and small-format flower for the porch or the patio. Eighths are the most common size.
- **Hill-top families** — low-dose edibles and tinctures for sleep-friendly evening use. The 5 mg gummy packs are the most common starter.
- **Squilchuck Canyon cabin owners** — pre-rolls for the weekend, plus a vape cartridge if they're going on a multi-day trip.

If you're new to a Washington dispensary, take 10 minutes at the counter — we'll walk you through the menu. Our first-time customer guide covers the door-to-bag walkthrough if you want to read ahead.

## What you can't do

Washington law prohibits consuming cannabis in any public space, including the dispensary parking lot, sidewalks, parks, and most outdoor areas. The product is sealed in an exit bag for transport, not for use on-site.

A few specifics that come up most:

- **Don't open the bag in the parking lot.** Consume at home or wherever you're staying privately.
- **Driving impaired is a DUI under Washington law.** Same as alcohol. If you've consumed, get a ride.
- **You can't legally cross into Idaho with cannabis.** Cannabis is illegal in Idaho. Take it home in WA.

## Pair it with

Worth knowing for the drive:

- **Pybus Public Market** — local food, cider, river view. 5 min south of us once you're down the hill.
- **Apple Capital Recreation Loop** — Columbia River loop on the Sunnyslope side.
- **The Sunnyslope cutoff** — the side-street shortcut every Heights regular knows; you won't deal with downtown.

The drive's worth it. We'll see you in 12.`,
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

export default function VisitFromWenatcheeHeightsPage() {
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
