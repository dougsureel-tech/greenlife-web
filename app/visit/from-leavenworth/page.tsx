import type { Metadata } from "next";
import Link from "next/link";
import { STORE, DEFAULT_OG_IMAGE } from "@/lib/store";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { Breadcrumb } from "@/components/Breadcrumb";

// /visit/from-leavenworth — high-intent driver-side landing page for
// Leavenworth visitors ("dispensary near Leavenworth WA", "closest
// cannabis to Leavenworth"). Per SEO_CONTENT_DRAFTS_2026_05_09 Tier-1
// Draft 7. Static (force-static); no per-request DB calls.
//
// Distinct from /near/leavenworth (service-area landing); this page
// targets "I'm IN Leavenworth, where do I drive" intent with directions,
// the drive itself, and visitor-side context.

export const dynamic = "force-static";
export const revalidate = false;

const TITLE = "From Leavenworth: 35 minutes east to Green Life Cannabis";
const DESCRIPTION =
  "Leavenworth has no recreational dispensary inside city limits. Green Life Cannabis is 35 minutes east on US-2 — directions, hours, and what to bring.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} — ${STORE.name}` },
  description: DESCRIPTION,
  alternates: { canonical: "/visit/from-leavenworth" },
  openGraph: {
    type: "article",
    locale: "en_US",
    title: TITLE,
    description: DESCRIPTION,
    url: `${STORE.website}/visit/from-leavenworth`,
    siteName: STORE.name,
    images: [DEFAULT_OG_IMAGE],
  },
};

const BODY = `Leavenworth doesn't have a recreational cannabis dispensary inside city limits. Green Life Cannabis is the closest legal cannabis to Leavenworth — 35 minutes east on US-2, in the Sunnyslope neighborhood of Wenatchee.

## The drive

US-2 east out of Leavenworth, through Tumwater Canyon, past Cashmere, into the Wenatchee Valley. The road follows the Wenatchee River most of the way — one of the prettier 35-minute drives in the state, especially in fall (the canyon turns gold in late October).

The route is signed and direct. No turns required until you hit the US-2/US-97 split at the top of Sunnyslope — we're right off the split on Center Road. Free parking out front.

- **From the Leavenworth ranger station:** 30.4 miles, about 35 min, no toll.
- **From Sleeping Lady Mountain Resort:** 33.5 miles, about 38 min.
- **From Stevens Pass Ski Area** (coming back through Leavenworth): roughly 2 hours total, 80 miles via US-2.

## Hours that matter for the drive

- **Fri / Sat** — open until 11 PM. The latest legal cannabis pickup east of Stevens Pass.
- **Sun-Thu** — open until 9 PM.
- **Pickup orders** — last online order is 15 minutes before close, so staff can stage the bag.

If you're coming back from a Leavenworth dinner on a Saturday and don't get rolling til 9, you have time. Drive cautiously.

## What to bring

- A valid 21+ photo ID — Washington driver's license, out-of-state license, US passport, military ID. (No expired IDs, no photos of IDs.)
- Cash for the order. We're cash-only — every Washington dispensary is, because the major card networks won't process for cannabis. ATM in the lobby ($3 surcharge typical).
- Your phone, if you want to browse the menu on the way over. Live menu's at /menu.

## What customers from Leavenworth typically ask about

We see a lot of Leavenworth-side customers, both residents and Bavarian-village visitors. The common patterns:

- **Locals** — pre-rolls and flower for the cabin. Eighths and quarter-ounces are the most common purchase size.
- **Wedding-weekend visitors** — pre-rolls, low-dose edibles, tinctures. Travelers often ask about "discreet" formats — vapes and small-dose gummies are the typical answer.
- **Stevens Pass / Mission Ridge skiers** — usually a quick stop on the way back home, sometimes en-route to a cabin in Plain or Lake Wenatchee. Pre-rolls + a 5 mg gummy pack covers most of it.

If you're new to cannabis or new to a Washington dispensary, take 10 minutes at the counter — we'll walk you through the menu. Our first-time customer guide covers the door-to-bag walkthrough if you want to read ahead.

## What you can't do

Washington law prohibits consuming cannabis in any public space, including the dispensary parking lot, sidewalks, parks, and most outdoor areas. The product is sealed in an exit bag for transport, not for use on-site.

A few specifics that come up most:

- **Don't open the bag in the parking lot.** Consume at home or wherever you're staying privately.
- **Driving impaired is a DUI under Washington law.** Same as alcohol. If you've consumed, get a ride.
- **You can't legally cross into Idaho with cannabis.** Cannabis is illegal in Idaho. The drive home from Wenatchee through Spokane to Idaho is a federal trafficking risk if you do it. Take it home in WA.

## Pair it with

Worth knowing for the drive back:

- **Pybus Public Market** — local food, cider, river view. 5 min south of us, easy detour before or after.
- **Apple Capital Recreation Loop** — the Columbia River loop for a walk after the drive.
- **Cashmere — Apple Annie's, Aplets & Cotlets** — 18 min back toward Leavenworth on the way home.

The drive's worth it. We'll see you in 35.`;

export default function VisitFromLeavenworthPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${STORE.website}/visit/from-leavenworth#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Visit", item: `${STORE.website}/visit` },
      {
        "@type": "ListItem",
        position: 3,
        name: "From Leavenworth",
        item: `${STORE.website}/visit/from-leavenworth`,
      },
    ],
  };

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${STORE.website}/visit/from-leavenworth#article`,
    headline: TITLE,
    description: DESCRIPTION,
    inLanguage: "en-US",
    url: `${STORE.website}/visit/from-leavenworth`,
    isPartOf: { "@id": `${STORE.website}/visit` },
    publisher: { "@id": `${STORE.website}/#dispensary` },
    about: { "@id": `${STORE.website}/#dispensary` },
  };

  const businessLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${STORE.website}/#dispensary`,
    mainEntityOfPage: { "@id": `${STORE.website}/visit/from-leavenworth` },
    name: STORE.name,
    url: STORE.website,
    address: {
      "@type": "PostalAddress",
      streetAddress: STORE.address.street,
      addressLocality: STORE.address.city,
      addressRegion: STORE.address.state,
      postalCode: STORE.address.zip,
      addressCountry: "US",
    },
    telephone: STORE.phoneTel,
  };

  const sections = renderBody(BODY);

  return (
    <main className="bg-zinc-950 text-zinc-100 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(businessLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleLd) }} />

      <Breadcrumb
        items={[
          { label: "Visit", href: "/visit" },
          { label: "From Leavenworth" },
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
            <span>From Leavenworth</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1] mb-4">
            {TITLE}
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl">
            {DESCRIPTION}
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

// Minimal markdown-like renderer — `## ` → h2, blank-line-separated
// paragraphs → p, `- ` consecutive lines → ul, `**bold**` inline.
// Sister of the renderer in app/learn/[slug]/page.tsx.
function renderBody(body: string): React.ReactNode {
  const blocks: React.ReactNode[] = [];
  const lines = body.split("\n");
  let para: string[] = [];
  let list: string[] = [];
  let key = 0;

  const flushPara = () => {
    if (para.length === 0) return;
    blocks.push(<p key={`p-${key++}`}>{renderInline(para.join(" "))}</p>);
    para = [];
  };
  const flushList = () => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={`ul-${key++}`} className="list-disc pl-6">
        {list.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("## ")) {
      flushPara();
      flushList();
      blocks.push(<h2 key={`h2-${key++}`}>{line.slice(3)}</h2>);
    } else if (line.startsWith("- ")) {
      flushPara();
      list.push(line.slice(2));
    } else if (line === "") {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return blocks;
}

function renderInline(text: string): React.ReactNode {
  if (!text.includes("**")) return text;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    }
    return <span key={i}>{p}</span>;
  });
}
