"use client";

import { useState } from "react";
import Link from "next/link";
import type { VendorBrand } from "@/lib/db";
import { STORE } from "@/lib/store";
import { PaginatedProductsGrid } from "./PaginatedProductsGrid";
import { StickyOrderCTA } from "./StickyOrderCTA";

// About-Spark Q&A — verified facts pulled from Spark Industries' own
// channels (sparkindustrieswa.com, plaidjacket.com, smokeflipside.com)
// plus second-source confirmation from Grow Magazine's farm-visit
// profile and Cinder's brand write-up. Rendered as default-open
// <details> + emits FAQPage JSON-LD so LLM-driven discovery can answer
// "where is Plaid Jacket made" / "who founded Spark Industries"
// queries with citable structured data.
//
// No medical or therapeutic claims (WAC 314-55-155). Copy is
// point-of-sale product info in budtender voice, not advertising.
const ABOUT_QA: { q: string; a: string }[] = [
  {
    q: "Wait — is Spark Industries the same as Plaid Jacket?",
    a: "Same house, two consumer-facing names. Spark Industries LLC is the licensed Washington producer-processor (Tier 2, Tumwater). Plaid Jacket is the flower and concentrate label you see on the jar. Flip Side is the vape line. Same team, same facility — just different shelves at the shop.",
  },
  {
    q: "Where is Plaid Jacket grown?",
    a: "Lacey, Washington — out of Spark Industries' purpose-built indoor facility. The team came up through real-estate and construction before getting into cannabis, so the building itself was designed around the plants from the floor up.",
  },
  {
    q: "Who founded Spark Industries?",
    a: "Matt Abbey and his brother-in-law Chad Roraback, plus John Cox — an electrical engineer who handles the technical side. Abbey and Roraback were business partners in real estate and construction for sixteen years before they went after a Washington cannabis license. Plaid Jacket hit retail shelves in January 2022.",
  },
  {
    q: "What's the Pacific Northwest connection?",
    a: "Built into the brand on purpose. The plaid jacket is a PNW uniform — flannel-shirt, work-boots, drizzle-tolerant. The team wanted something that reads as Pacific Northwest at first glance, so if the brand ever travels outside Washington it still tells you where it came from.",
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

// Per-brand custom layout — Spark Industries (Plaid Jacket / Flip Side).
//
// Visual identity is typographic + a CSS-rendered plaid pattern rather
// than a remote logo file, by intent: (1) the plaid IS the brand and
// renders crisp at any density, (2) avoids any 404 risk on a CDN path
// we couldn't independently verify, (3) keeps Doug's standing rule
// honored — vendor visuals from the brand's own surface, never from
// Weedmaps / Leafly aggregators.
//
// Color palette — PNW slate (#1e3a4d) + plaid red (#c43f3f). Chosen
// to feel distinct from the four prior custom brand pages (NWCS forest
// green/gold, Phat Panda black/hot-pink) while reading as the kind of
// flannel a logger reaches for in November.
const BRAND_DARK = "#1e3a4d"; // PNW slate blue
const BRAND_DARK_2 = "#162a38"; // a deeper slate for hero gradient
const BRAND_RED = "#c43f3f"; // plaid red accent
const BRAND_RED_LIGHT = "#e06363"; // hover state

const SUB_BRANDS: Array<{ name: string; tag: string; line: string }> = [
  {
    name: "Plaid Jacket",
    tag: "Flower",
    line: "The flagship — indoor flower grown under Spark's S.C.A.D.A.-controlled environment. The strain library is where the phenohunting work shows up.",
  },
  {
    name: "Live Resin",
    tag: "BHO Concentrate",
    line: "Plaid Jacket live resin disposables and 510 carts. Flash-frozen at harvest, hydrocarbon-extracted in Spark's in-house C1D1 lab.",
  },
  {
    name: "Cured Resin",
    tag: "BHO Concentrate",
    line: "Same in-house extraction, full-cure starting material. Slightly different flavor profile than live — heavier on cured-flower notes.",
  },
  {
    name: "Melted Diamonds",
    tag: "HTE Concentrate",
    line: "Diamonds dropped into a high-terpene extract. Plaid Jacket's premium tier — runs hotter on potency, terps still up front.",
  },
  {
    name: "Flip Side",
    tag: "Vapes",
    line: "The flavored side of the house. 510 carts and disposables built around botanical terps + high-potency distillate. No additives, no fillers.",
  },
  {
    name: "Pre-Roll",
    tag: "Pre-Rolls",
    line: "Plaid Jacket flower rolled tight. Singles, multi-packs, and infused options when stock allows.",
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

export default function SparkIndustriesBrandPage({
  brand,
  products,
}: {
  brand: VendorBrand;
  products: Product[];
}) {
  // Sub-brand filter — clicking a sub-brand card filters the products
  // grid below to items whose name contains that label (case-insensitive).
  // Click again or hit the chip's clear button to reset. Same pattern as
  // NWCS / Phat Panda so the muscle memory stays consistent across all
  // boutique brand pages.
  const [activeSubBrand, setActiveSubBrand] = useState<string | null>(null);

  // Cheap O(N×M) sub-brand counts — M=6 sub-brands, N rarely > 200 SKUs
  // for this vendor. Lets each card show "12 on shelf" or dim itself
  // when nothing in the live menu matches.
  const subBrandCounts = SUB_BRANDS.reduce<Record<string, number>>((acc, sb) => {
    const needle = sb.name.toLowerCase();
    acc[sb.name] = products.filter((p) => (p.name ?? "").toLowerCase().includes(needle)).length;
    return acc;
  }, {});

  // CSS-rendered plaid pattern — drawn with overlapping linear-gradient
  // stripes at 0deg and 90deg so it tartans without an image asset. The
  // hero uses this at low opacity behind the wordmark; the sub-brand
  // section repeats it as a divider strip.
  const plaidStyle: React.CSSProperties = {
    backgroundImage: `
      repeating-linear-gradient(0deg, rgba(196,63,63,0.35) 0 6px, transparent 6px 32px),
      repeating-linear-gradient(90deg, rgba(196,63,63,0.35) 0 6px, transparent 6px 32px),
      repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 16px),
      repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 16px)
    `,
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
          className="absolute inset-0 opacity-30"
          style={{
            background: `linear-gradient(135deg, ${BRAND_DARK_2} 0%, ${BRAND_DARK} 60%, #2a4f66 100%)`,
          }}
        />
        {/* Plaid pattern overlay — the brand IS this pattern. */}
        <div aria-hidden className="absolute inset-0 opacity-40" style={plaidStyle} />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at top right, rgba(196,63,63,0.18), transparent 60%)`,
          }}
        />

        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-5"
            style={{ color: BRAND_RED_LIGHT }}
          >
            <Link href="/brands" className="hover:text-white transition-colors">
              All Brands
            </Link>
            <span className="mx-2 opacity-50">/</span>
            Spark Industries / Plaid Jacket
          </p>

          <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-10">
            {/* Plaid-square logo block — typographic mark on the brand's
                own pattern, no remote image dependency. */}
            <div
              className="shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden border-4 border-white/90"
              style={{ backgroundColor: BRAND_DARK }}
            >
              <div aria-hidden className="absolute inset-0 opacity-90" style={plaidStyle} />
              <div className="relative text-center">
                <p className="text-white font-extrabold text-xl sm:text-2xl tracking-tight leading-none drop-shadow">
                  PLAID
                </p>
                <p
                  className="font-extrabold text-xl sm:text-2xl tracking-tight leading-none mt-1 drop-shadow"
                  style={{ color: BRAND_RED_LIGHT }}
                >
                  JACKET
                </p>
              </div>
            </div>
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Plaid Jacket
                <br />
                <span style={{ color: BRAND_RED_LIGHT }}>+ Flip Side</span>
              </h1>
              <p className="text-lg sm:text-xl text-stone-200/90 leading-relaxed">
                Spark Industries out of Tumwater — Pacific Northwest indoor flower, in-house BHO
                concentrates, and a separate vape brand (Flip Side) all under one roof.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  <span style={{ color: BRAND_RED_LIGHT }}>●</span> Tumwater, WA
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  Tier 2 Producer / Processor
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold"
                  style={{ backgroundColor: BRAND_RED }}
                >
                  {brand.activeSkus} on our shelf
                </span>
              </div>
              <div className="flex flex-wrap gap-3 pt-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-bold transition-all shadow-lg hover:-translate-y-0.5"
                  style={{ backgroundColor: BRAND_RED }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = BRAND_RED_LIGHT;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = BRAND_RED;
                  }}
                >
                  Order Plaid Jacket for Pickup →
                </Link>
                <a
                  href="https://www.plaidjacket.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all border border-white/20"
                >
                  Visit plaidjacket.com ↗
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
            style={{ color: BRAND_RED }}
          >
            Our Story
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            Real-estate guys, an electrical engineer, and a building they wired for plants.
          </h2>
          <div className="space-y-5 text-stone-700 text-lg leading-relaxed">
            <p>
              Matt Abbey and Chad Roraback are brothers-in-law. They&apos;d run a real-estate and
              construction company together for sixteen years before someone looking to hold one of
              Washington&apos;s first cannabis licenses asked if they could find a building. They
              found one — and ended up buying it. John Cox, an electrical engineer, came in as the
              technical brain. The result is Spark Industries.
            </p>
            <p>
              The Tumwater facility is a <strong>Tier 2 producer-processor</strong> wired top to
              bottom for indoor cultivation, including a C1D1 hydrocarbon-extraction suite and an
              in-house tissue-culture and phenohunt area. <strong>Plaid Jacket</strong> is the
              flower and concentrate label that came out of that work — it hit retail shelves in
              January 2022. The plaid is the point: a Pacific-Northwest tell that travels with the
              jar.
            </p>
            <p>
              We carry Plaid Jacket and Flip Side at {STORE.name} because the in-house extraction
              shows up in the carts and disposables — clean hits, real terps, no filler taste. Ask
              a budtender if you want to compare a cured-resin disposable against a live-resin one
              side by side; the difference is the kind of thing that&apos;s easier to feel than
              describe.
            </p>
          </div>
        </div>
      </section>

      {/* SUB-BRANDS ----------------------------------------------------- */}
      <section className="bg-stone-50 border-y border-stone-200 relative">
        {/* Plaid divider strip across the top edge so the section reads
            as part of the same brand world without dominating it. */}
        <div
          aria-hidden
          className="absolute top-0 inset-x-0 h-1.5 opacity-90"
          style={plaidStyle}
        />
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: BRAND_RED }}
              >
                The Lines
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
                Six lines you&apos;ll see in our case
              </h2>
            </div>
            <p className="text-sm text-stone-500 max-w-md">
              All of them grown or extracted under the same Tumwater roof. Tap a card to filter the
              live menu below to just that line.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                          borderColor: BRAND_RED,
                          boxShadow: `0 0 0 2px rgba(196,63,63,0.4)`,
                        }
                      : undefined
                  }
                  onMouseEnter={(e) => {
                    if (!active && !disabled) {
                      e.currentTarget.style.borderColor = BRAND_RED;
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
                        active ? "text-white" : ""
                      }`}
                      style={
                        active
                          ? { backgroundColor: BRAND_RED }
                          : { backgroundColor: `${BRAND_RED}26`, color: BRAND_DARK }
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
                    style={active ? { color: BRAND_RED_LIGHT } : undefined}
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
            style={{ color: BRAND_RED }}
          >
            How They Make It
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-10 leading-tight max-w-3xl">
            Indoor cultivation, in-house extraction, separate brand for vapes.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                emoji: "🌿",
                title: "Indoor Flower",
                body: "Tier 2 indoor cultivation in Tumwater. Phenohunt and tissue-culture lab in-house — the strain library reflects the work.",
              },
              {
                emoji: "🧴",
                title: "BHO Concentrates",
                body: "C1D1 hydrocarbon extraction on premise. Cured resin, live resin, and melted-diamond-plus-HTE — all from Plaid Jacket flower.",
              },
              {
                emoji: "💨",
                title: "Vapes (Flip Side)",
                body: "Separate brand, same roof. 510 carts and disposables built on natural botanical terps + high-potency distillate, no fillers.",
              },
              {
                emoji: "🫙",
                title: "Pre-Rolls",
                body: "Plaid Jacket flower rolled tight. Singles and multi-packs — the everyday option when you want it ready to go.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-2xl bg-stone-50 border border-stone-200 overflow-hidden hover:shadow-md transition-all"
              >
                <div
                  className="aspect-[4/3] flex items-center justify-center text-6xl relative"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND_DARK} 0%, ${BRAND_DARK_2} 100%)`,
                  }}
                >
                  <div aria-hidden className="absolute inset-0 opacity-50" style={plaidStyle} />
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
            style={{ color: BRAND_RED }}
          >
            On Our Shelf
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-2 leading-tight">
            Plaid Jacket + Flip Side at {STORE.name}
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
            accentBg={"bg-[#1e3a4d]"}
            accentBorder={"border-[#c43f3f]"}
            accentHoverBorder={"hover:border-[#c43f3f]"}
            accentText={"text-[#c43f3f]"}
            accentHoverText={"hover:text-[#e06363]"}
            accentGlow={"hover:shadow-[#c43f3f]/30"}
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
            style={{ color: BRAND_RED }}
          >
            About Spark Industries
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
                  style={{ borderTopColor: `${BRAND_RED}4D` }}
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
        <div aria-hidden className="absolute inset-0 opacity-25" style={plaidStyle} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: BRAND_RED_LIGHT }}
            >
              Connect with Spark Industries
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 leading-tight">
              Find them online
            </h2>
            <ul className="space-y-3 text-stone-200">
              <li className="flex items-center gap-3">
                <span
                  className="w-20 text-xs font-bold uppercase tracking-wider"
                  style={{ color: BRAND_RED_LIGHT }}
                >
                  Flower
                </span>
                <a
                  href="https://www.plaidjacket.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4"
                  style={{ textDecorationColor: `${BRAND_RED}66` }}
                >
                  plaidjacket.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span
                  className="w-20 text-xs font-bold uppercase tracking-wider"
                  style={{ color: BRAND_RED_LIGHT }}
                >
                  Vapes
                </span>
                <a
                  href="https://www.smokeflipside.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4"
                  style={{ textDecorationColor: `${BRAND_RED}66` }}
                >
                  smokeflipside.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span
                  className="w-20 text-xs font-bold uppercase tracking-wider"
                  style={{ color: BRAND_RED_LIGHT }}
                >
                  Parent
                </span>
                <a
                  href="https://www.sparkindustrieswa.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4"
                  style={{ textDecorationColor: `${BRAND_RED}66` }}
                >
                  sparkindustrieswa.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span
                  className="w-20 text-xs font-bold uppercase tracking-wider"
                  style={{ color: BRAND_RED_LIGHT }}
                >
                  HQ
                </span>
                <span>Tumwater, WA</span>
              </li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: BRAND_RED_LIGHT }}
              >
                Pickup at {STORE.name}
              </p>
              <p className="text-xl font-extrabold mb-1">
                {brand.activeSkus} Spark Industries product{brand.activeSkus !== 1 ? "s" : ""} ready
                in {STORE.address.city}
              </p>
              <p className="text-sm text-stone-300/90 leading-relaxed">
                Order ahead and your kit&apos;s waiting at the counter. {STORE.address.full}. 21+
                with valid ID. Cash only.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-bold transition-all"
                style={{ backgroundColor: BRAND_RED }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = BRAND_RED_LIGHT;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = BRAND_RED;
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

      <StickyOrderCTA label="Order Plaid Jacket →" />
    </div>
  );
}
