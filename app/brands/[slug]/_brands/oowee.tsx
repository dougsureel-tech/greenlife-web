"use client";

import { useState } from "react";
import Link from "next/link";
import type { VendorBrand } from "@/lib/db";
import { STORE } from "@/lib/store";
import { PaginatedProductsGrid } from "./PaginatedProductsGrid";
import { StickyOrderCTA } from "./StickyOrderCTA";

// About-Ooowee Q&A — verified facts pulled from independent sources:
//   • Karen Hsin's design portfolio (karenhsin.com/ooowee) — confirms the
//     speech-bubble-cloud logo concept and the "no leaf icon" intent.
//   • IG @oohweeoohwee bio — confirms the lifestyle-brand voice and the
//     "Incredibly Strong Marijuana" tagline (their words, no edit).
//   • Headset.io brand page — confirms Washington-state market, top
//     position in WA Pre-Roll category Nov 2025–Feb 2026.
//   • Top Shelf Data — confirms TTL Holdings LLC is a Seattle Tier 1
//     producer-processor.
//
// We DO NOT claim a founding year, location-of-grow, or specific owner
// names — none of those were independently verifiable from the sources
// above, and oowee.co was a "Launching Soon" placeholder at build time.
// Following Doug's standing rule: if you can't verify a claim, drop it.
//
// Rendered as default-open <details> + emits FAQPage JSON-LD so LLM
// discovery can answer "who makes Ooowee" / "what is Ooowee cannabis"
// queries with citable structured data. Zero medical or therapeutic
// claims — WAC 314-55-155 — copy is point-of-sale product info in
// budtender voice, not advertising.
const ABOUT_QA: { q: string; a: string }[] = [
  {
    q: "What is Ooowee?",
    a: "A Washington-state cannabis brand built around the expression itself — \"ooowee\" — rather than around a leaf or a logo trick. Their own bio puts it bluntly: incredibly strong marijuana, lifestyle brand. The visual identity (designed by Karen Hsin) leans on a speech-bubble cloud instead of the standard cannabis leaf, so the logo reads as the sound someone makes when something hits.",
  },
  {
    q: "Who actually makes it?",
    a: "TTL Holdings LLC — a Tier 1 producer-processor licensed in Seattle. Ooowee is the consumer-facing brand; TTL Holdings is the licensee on the WSLCB record. Both are Washington-state operations.",
  },
  {
    q: "What do they actually ship?",
    a: "Pre-rolls — singles, 5-pack 1g, and infused 5-packs are the volume drivers — plus disposable vapes, sugar wax and other concentrates, and flower. Their FaceLock Pre-Roll 5-Pack hit the #1 spot in the Washington pre-roll category in February 2026 (Headset data).",
  },
  {
    q: "Is the brand new or has it been around a while?",
    a: "Long enough to be a top-tier name in the WA pre-roll and concentrate categories — Ooowee held the #1 WA pre-roll spot from late 2025 through early 2026. Their consumer site (oowee.co) was still showing a launch placeholder at the time of writing, so the brand voice lives mostly on the packaging and on Instagram (@oohweeoohwee).",
  },
];

const aboutFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ABOUT_QA.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

// Per-brand custom layout — Ooowee (TTL Holdings).
//
// Visual identity is typographic + a stylized "OOOWEE" wordmark with a
// CSS-rendered speech-bubble cloud, by intent: (1) oowee.co was a
// "Launching Soon" placeholder at build time, so there was no logo file
// we could pull from the brand's own CDN; (2) the brand's IDENTITY (per
// Karen Hsin's portfolio) IS the wordmark + cloud, not a graphic mark;
// (3) Doug's standing rule — vendor visuals from the brand's own
// surface, never from Weedmaps / Leafly aggregators — would block any
// dispensary-CDN fallback anyway.
//
// Color palette — electric violet (#7c3aed) + cream yellow (#f4d35e).
// Chosen to (a) feel like the loud, exclamatory "ooowee!" expression
// the brand is named after, (b) read distinctly from the five prior
// boutique brand pages: NWCS deep-forest+gold, Phat Panda hot-pink+
// black, Fairwinds teal+sand, MFUSED midnight+cyan, Spark slate+plaid-
// red. This palette is an editorial choice — Ooowee's actual packaging
// hex codes weren't extractable from any verifiable source at build
// time. Documenting that here so a future pass can swap to the brand
// hex once oowee.co launches or a packaging photo from their own CDN
// surfaces.
const BRAND_DARK = "#1a0b2e"; // deep purple-black for hero gradient
const BRAND_DARK_2 = "#0f0620"; // darker for hero ramp
const BRAND_PURPLE = "#7c3aed"; // electric violet
const BRAND_YELLOW = "#f4d35e"; // cream yellow accent

const SUB_BRANDS: Array<{ name: string; tag: string; line: string }> = [
  {
    name: "FaceLock",
    tag: "Pre-Roll",
    line: "The flagship strain. FaceLock 5-pack 1g pre-rolls held the #1 spot in the Washington pre-roll category in February 2026 — the SKU that put Ooowee on every shop's reorder list.",
  },
  {
    name: "Trophy Runtz",
    tag: "Multi-Format",
    line: "Their second-most-asked-for name. Shows up as 5-pack pre-rolls, infused pre-rolls, sugar wax, and disposables — same strain, four different ways to land it.",
  },
  {
    name: "Gusherlicious",
    tag: "Infused Pre-Roll",
    line: "Hybrid infused 5-pack — 1g pre-rolls dipped and dusted. The sweet-jammy flavor that's been the gateway product for a lot of customers who weren't sure about infused.",
  },
  {
    name: "Pink Zaza",
    tag: "Pre-Roll",
    line: "Pink Runtz crossed with Georgia Pie — pre-roll 5-packs. Loud-end-of-the-cooler kind of terps, on the sweeter side.",
  },
  {
    name: "Sour Gum",
    tag: "Multi-Format",
    line: "Singles and 5-pack infused pre-rolls. Sour Diesel-leaning lineage — for customers who came up on the gas-forward end of the menu.",
  },
  {
    name: "Sour Mango Diesel",
    tag: "Infused Pre-Roll",
    line: "Crossed with Trophy Runtz on their infused 5-packs. The fruit-forward flip side of the Sour Gum cooler.",
  },
  {
    name: "Saint Lauruntz",
    tag: "Pre-Roll",
    line: "5-pack 1g pre-rolls. Runtz-line cross — sits next to Trophy Runtz and Pink Zaza in the pre-roll cooler.",
  },
  {
    name: "Seattle Strawberry Cough",
    tag: "Pre-Roll",
    line: "Northern Lights #5 × Haze #2. Sativa-leaning 5-pack pre-rolls — the day-shift option in the Ooowee lineup.",
  },
];

type Product = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  strain_type: string | null;
  thc_pct: number | null;
  cbd_pct: number | null;
  unit_price: number | null;
  image_url: string | null;
  effects: string | null;
  terpenes: string | null;
};

export default function OoweeBrandPage({
  brand,
  products,
}: {
  brand: VendorBrand;
  products: Product[];
}) {
  // Sub-brand filter — clicking a sub-brand card filters the products grid
  // below to items whose name contains that label (case-insensitive).
  // Click again or hit the chip's clear button to reset. Same pattern as
  // NWCS / Spark / Phat Panda so the muscle memory stays consistent
  // across all boutique brand pages.
  const [activeSubBrand, setActiveSubBrand] = useState<string | null>(null);

  // Cheap O(N×M) sub-brand counts — M=8 sub-brands, N rarely > 400 SKUs
  // for this vendor. Lets each card show "12 on shelf" or dim itself
  // when nothing in the live menu matches.
  const subBrandCounts = SUB_BRANDS.reduce<Record<string, number>>((acc, sb) => {
    const needle = sb.name.toLowerCase();
    acc[sb.name] = products.filter((p) => (p.name ?? "").toLowerCase().includes(needle)).length;
    return acc;
  }, {});

  // CSS-rendered speech-bubble dot pattern — drawn with a radial-gradient
  // tile so the hero reads as the "ooowee!" exclamation cloud the brand
  // identity is built around, without an image asset. Used at low
  // opacity behind the wordmark and as a divider strip below the lines
  // section.
  const cloudDotsStyle: React.CSSProperties = {
    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(244,211,94,0.5) 1px, transparent 1.5px)`,
    backgroundSize: "16px 16px",
  };

  return (
    <div className="bg-stone-50">
      {/* HERO ----------------------------------------------------------- */}
      <section
        className="relative overflow-hidden text-white"
        style={{ backgroundColor: BRAND_DARK_2 }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-90"
          style={{
            background: `linear-gradient(135deg, ${BRAND_DARK_2} 0%, ${BRAND_DARK} 50%, ${BRAND_PURPLE} 140%)`,
          }}
        />
        {/* Cloud-dot pattern overlay — hints at the speech-bubble logo. */}
        <div aria-hidden className="absolute inset-0 opacity-30" style={cloudDotsStyle} />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at top right, rgba(244,211,94,0.18), transparent 60%)`,
          }}
        />

        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-5"
            style={{ color: BRAND_YELLOW }}
          >
            <Link href="/brands" className="hover:text-white transition-colors">
              All Brands
            </Link>
            <span className="mx-2 opacity-50">/</span>
            Ooowee
          </p>

          <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-10">
            {/* Speech-bubble wordmark logo — typographic mark that doubles
                as the brand's actual identity (Karen Hsin's design uses a
                cloud-as-speech-bubble in place of a leaf icon). No remote
                image dependency, since oowee.co was a placeholder at
                build time. */}
            <div
              className="shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-[2rem] shadow-2xl flex items-center justify-center relative overflow-hidden"
              style={{
                backgroundColor: BRAND_YELLOW,
                // Tail of the speech bubble — clipped corner on the
                // bottom-left so the rounded square reads as a chat
                // bubble pointing at the wordmark beside it.
                borderBottomLeftRadius: "0.5rem",
              }}
            >
              <div className="relative text-center">
                <p
                  className="font-extrabold text-3xl sm:text-4xl tracking-tight leading-none"
                  style={{ color: BRAND_DARK }}
                >
                  OOO
                </p>
                <p
                  className="font-extrabold text-3xl sm:text-4xl tracking-tight leading-none mt-0.5"
                  style={{ color: BRAND_PURPLE }}
                >
                  WEE!
                </p>
              </div>
            </div>
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Ooowee
                <br />
                <span style={{ color: BRAND_YELLOW }}>says it for you.</span>
              </h1>
              <p className="text-lg sm:text-xl text-stone-200/90 leading-relaxed">
                Washington-state pre-rolls, infused 5-packs, sugar wax and disposables — the brand
                whose name is the sound you make when something actually hits. TTL Holdings out of
                Seattle.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  <span style={{ color: BRAND_YELLOW }}>●</span> Seattle, WA
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  Tier 1 Producer / Processor
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ backgroundColor: BRAND_YELLOW, color: BRAND_DARK }}
                >
                  {brand.activeSkus} on our shelf
                </span>
              </div>
              <div className="flex flex-wrap gap-3 pt-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:-translate-y-0.5"
                  style={{ backgroundColor: BRAND_YELLOW, color: BRAND_DARK }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fbe892";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = BRAND_YELLOW;
                  }}
                >
                  Order Ooowee for Pickup →
                </Link>
                <a
                  href="https://www.instagram.com/oohweeoohwee/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all border border-white/20"
                >
                  Follow @oohweeoohwee ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY ---------------------------------------------------------- */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: BRAND_PURPLE }}
          >
            Our Story
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            The brand named after the sound you make.
          </h2>
          <div className="space-y-5 text-stone-700 text-lg leading-relaxed">
            <p>
              <strong>Ooowee</strong> is what comes out of you when something is genuinely strong —
              the involuntary noise, not the marketing word. The brand is built around that. No
              cannabis-leaf logo, no green-and-white packaging cliches; the visual identity (by
              designer Karen Hsin) reads as a speech-bubble cloud, the puff and the exclamation in
              one mark.
            </p>
            <p>
              Behind it is <strong>TTL Holdings LLC</strong> — a Tier 1 producer-processor licensed
              in Seattle. Tier 1 in Washington means a smaller-footprint canopy by design, which is
              the side of the I-502 license tree that tends to feed boutique-leaning brands instead
              of bulk-trim outfits. The work shows up in the pre-roll cooler: Ooowee held the{" "}
              <strong>#1 spot in the Washington pre-roll category</strong> from late 2025 through
              February 2026 (Headset).
            </p>
            <p>
              We carry Ooowee at {STORE.name} because the strain library is loud — Trophy Runtz,
              FaceLock, Pink Zaza, Saint Lauruntz, Sour Gum, Gusherlicious — and because the
              5-pack 1g format is the most asked-for SKU on our pre-roll shelf, full stop. Ask a
              budtender what just dropped; the rotation moves fast.
            </p>
          </div>
        </div>
      </section>

      {/* SUB-BRANDS ----------------------------------------------------- */}
      <section className="bg-stone-50 border-y border-stone-200 relative">
        {/* Cloud-dot divider strip across the top edge so the section
            reads as part of the same brand world without dominating it. */}
        <div
          aria-hidden
          className="absolute top-0 inset-x-0 h-2 opacity-90"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, ${BRAND_PURPLE}66 1px, transparent 1.5px)`,
            backgroundSize: "16px 100%",
          }}
        />
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: BRAND_PURPLE }}
              >
                The Strains
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
                Eight names that move the cooler
              </h2>
            </div>
            <p className="text-sm text-stone-500 max-w-md">
              Ooowee&apos;s most-asked-for strains across pre-rolls, infused 5-packs, sugar wax, and
              disposables. Tap a card to filter the live menu below.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SUB_BRANDS.map((sb) => {
              const count = subBrandCounts[sb.name] ?? 0;
              const active = activeSubBrand === sb.name;
              const disabled = count === 0;
              return (
                <button
                  key={sb.name}
                  type="button"
                  onClick={() => {
                    if (disabled) return;
                    setActiveSubBrand(active ? null : sb.name);
                    if (!active) {
                      requestAnimationFrame(() => {
                        document
                          .getElementById("products")
                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      });
                    }
                  }}
                  aria-pressed={active}
                  disabled={disabled}
                  className={`text-left rounded-2xl border p-5 transition-all duration-200 ${
                    active
                      ? "shadow-lg ring-2"
                      : disabled
                        ? "bg-stone-50 border-stone-100 opacity-50 cursor-not-allowed"
                        : "bg-white border-stone-200 hover:shadow-md hover:-translate-y-0.5"
                  }`}
                  style={
                    active
                      ? {
                          backgroundColor: BRAND_DARK,
                          borderColor: BRAND_YELLOW,
                          boxShadow: `0 0 0 2px rgba(244,211,94,0.4)`,
                        }
                      : undefined
                  }
                  onMouseEnter={(e) => {
                    if (!active && !disabled) {
                      e.currentTarget.style.borderColor = BRAND_PURPLE;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active && !disabled) {
                      e.currentTarget.style.borderColor = "";
                    }
                  }}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <h3
                      className={`font-extrabold text-lg leading-tight ${
                        active ? "text-white" : "text-stone-900"
                      }`}
                    >
                      {sb.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${
                        active ? "" : ""
                      }`}
                      style={
                        active
                          ? { backgroundColor: BRAND_YELLOW, color: BRAND_DARK }
                          : { backgroundColor: `${BRAND_PURPLE}1A`, color: BRAND_PURPLE }
                      }
                    >
                      {sb.tag}
                    </span>
                  </div>
                  <p
                    className={`text-sm leading-relaxed ${
                      active ? "text-stone-200" : "text-stone-600"
                    }`}
                  >
                    {sb.line}
                  </p>
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-wider mt-3 ${
                      active
                        ? ""
                        : count > 0
                          ? "text-emerald-700"
                          : "text-stone-400"
                    }`}
                    style={active ? { color: BRAND_YELLOW } : undefined}
                  >
                    {count > 0
                      ? active
                        ? `Filtering · ${count} on shelf`
                        : `${count} on shelf · tap to filter`
                      : "Not in stock"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* APPROACH ------------------------------------------------------- */}
      <section className="bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: BRAND_PURPLE }}
          >
            How They Make It
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-10 leading-tight max-w-3xl">
            Pre-rolls first, concentrates next, vapes alongside.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                emoji: "🫙",
                title: "Pre-Rolls",
                body: "5-pack 1g pre-rolls are Ooowee's signature SKU — FaceLock, Trophy Runtz, Pink Zaza, Saint Lauruntz. Singles available for the strain you want to try once.",
              },
              {
                emoji: "🔥",
                title: "Infused 5-Packs",
                body: "1g pre-rolls dipped and dusted — Gusherlicious, Sour Gum, Sour Mango Diesel × Trophy Runtz. The format that pulls the heaviest reorder rate from regulars.",
              },
              {
                emoji: "🧴",
                title: "Sugar Wax",
                body: "Trophy Runtz sugar wax is the concentrate side of the house. Heavier on the nose than the average BHO product — the strain library carries through.",
              },
              {
                emoji: "💨",
                title: "Disposables",
                body: "Hybrid disposables — high-THC oil in a closed-format pen. The grab-and-go option when you don't want to keep a battery charged.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-2xl bg-stone-50 border border-stone-200 overflow-hidden hover:shadow-md transition-all"
              >
                <div
                  className="aspect-[4/3] flex items-center justify-center text-6xl relative"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND_DARK} 0%, ${BRAND_PURPLE} 100%)`,
                  }}
                >
                  <div aria-hidden className="absolute inset-0 opacity-30" style={cloudDotsStyle} />
                  <span aria-hidden className="relative drop-shadow-lg">
                    {c.emoji}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-extrabold text-stone-900 mb-1.5">{c.title}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS ------------------------------------------------------- */}
      <section id="products" className="bg-stone-50 border-y border-stone-200 scroll-mt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: BRAND_PURPLE }}
          >
            On Our Shelf
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-2 leading-tight">
            Ooowee at {STORE.name}
          </h2>
          <p className="text-stone-500 mb-10">
            Live menu — prices, THC, and stock as of right now. {products.length} total products,
            paginated 25 per page.
          </p>

          <PaginatedProductsGrid
            products={products}
            perPage={25}
            nameContains={activeSubBrand}
            nameContainsLabel={activeSubBrand ?? undefined}
            onClearNameFilter={() => setActiveSubBrand(null)}
            accentBg={"bg-[#7c3aed]"}
            accentBorder={"border-[#f4d35e]"}
            accentHoverBorder={"hover:border-[#7c3aed]"}
            accentText={"text-[#7c3aed]"}
            accentHoverText={"hover:text-[#a78bfa]"}
            accentGlow={"hover:shadow-[#7c3aed]/30"}
          />
        </div>
      </section>

      {/* ABOUT — Q&A ---------------------------------------------------- */}
      <section className="bg-white border-t border-stone-200">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutFaqSchema) }}
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: BRAND_PURPLE }}
          >
            About Ooowee
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            Quick facts
          </h2>
          <div className="space-y-3">
            {ABOUT_QA.map(({ q, a }) => (
              <details
                key={q}
                open
                className="group rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden open:bg-white open:shadow-sm transition-all"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none transition-colors">
                  <span className="font-semibold text-stone-800 text-sm leading-snug">{q}</span>
                  <svg
                    className="w-5 h-5 shrink-0 text-stone-300 group-open:rotate-180 transition-all duration-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div
                  className="px-5 pb-5 pt-1 text-stone-600 text-sm leading-relaxed border-t"
                  style={{ borderTopColor: `${BRAND_PURPLE}33` }}
                >
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONNECT -------------------------------------------------------- */}
      <section className="text-white relative overflow-hidden" style={{ backgroundColor: BRAND_DARK }}>
        <div aria-hidden className="absolute inset-0 opacity-25" style={cloudDotsStyle} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: BRAND_YELLOW }}
            >
              Connect with Ooowee
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 leading-tight">
              Find them online
            </h2>
            <ul className="space-y-3 text-stone-200">
              <li className="flex items-center gap-3">
                <span
                  className="w-24 text-xs font-bold uppercase tracking-wider"
                  style={{ color: BRAND_YELLOW }}
                >
                  Instagram
                </span>
                <a
                  href="https://www.instagram.com/oohweeoohwee/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4"
                  style={{ textDecorationColor: `${BRAND_YELLOW}66` }}
                >
                  @oohweeoohwee
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span
                  className="w-24 text-xs font-bold uppercase tracking-wider"
                  style={{ color: BRAND_YELLOW }}
                >
                  X / Twitter
                </span>
                <a
                  href="https://x.com/theooowee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4"
                  style={{ textDecorationColor: `${BRAND_YELLOW}66` }}
                >
                  @theOoowee
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span
                  className="w-24 text-xs font-bold uppercase tracking-wider"
                  style={{ color: BRAND_YELLOW }}
                >
                  Site
                </span>
                <a
                  href="https://oowee.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4"
                  style={{ textDecorationColor: `${BRAND_YELLOW}66` }}
                >
                  oowee.co{" "}
                  <span className="text-stone-400 text-xs">(launching)</span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span
                  className="w-24 text-xs font-bold uppercase tracking-wider"
                  style={{ color: BRAND_YELLOW }}
                >
                  Licensee
                </span>
                <span>TTL Holdings LLC · Seattle, WA</span>
              </li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: BRAND_YELLOW }}
              >
                Pickup at {STORE.name}
              </p>
              <p className="text-xl font-extrabold mb-1">
                {brand.activeSkus} Ooowee product{brand.activeSkus !== 1 ? "s" : ""} ready in{" "}
                {STORE.address.city}
              </p>
              <p className="text-sm text-stone-300/90 leading-relaxed">
                Order ahead and your kit&apos;s waiting at the counter. {STORE.address.full}. 21+
                with valid ID. Cash only.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all"
                style={{ backgroundColor: BRAND_YELLOW, color: BRAND_DARK }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#fbe892";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = BRAND_YELLOW;
                }}
              >
                Order for Pickup →
              </Link>
              <Link
                href="/brands"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold border border-white/20 transition-all"
              >
                ← All Brands
              </Link>
            </div>
          </div>
        </div>
      </section>

      <StickyOrderCTA
        label="Order Ooowee →"
        bgClass="bg-[#7c3aed]"
        textClass="text-[#f4d35e]"
        hoverClass="hover:bg-[#6d28d9]"
      />
    </div>
  );
}
