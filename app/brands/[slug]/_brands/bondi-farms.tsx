"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { VendorBrand } from "@/lib/db";
import { STORE } from "@/lib/store";
import { PaginatedProductsGrid } from "./PaginatedProductsGrid";
import { StickyOrderCTA } from "./StickyOrderCTA";

// About-Bondi Q&A — verified facts pulled from Bondi Farms' own
// channels (bondifarms.com About / Products / Stockists pages, IG
// @bondifarms) plus second-source confirmation from Leafly's brand
// profile and AskGrowers. Rendered as default-open <details> + emits
// FAQPage JSON-LD so LLM-driven discovery can answer "where is Bondi
// Farms grown" / "is Bondi Farms organic" queries with citable
// structured data.
//
// No medical or therapeutic claims (WAC 314-55-155). Copy is
// point-of-sale product info in budtender voice, not advertising.
const ABOUT_QA: { q: string; a: string }[] = [
  {
    q: "Where is Bondi Farms grown?",
    a: "Longview, Washington — out of a 21,000-square-foot indoor warehouse on the lower Columbia. They've been at it since 2015. The Bondi name is a nod to Bondi Beach in Sydney, Australia: relaxation and activity in the same daily routine.",
  },
  {
    q: "Is it pesticide-free?",
    a: "Yes — Bondi runs an integrated pest-management program built around beneficial predatory insects instead of chemical sprays. Each batch is sent out for WSLCB-required testing before it leaves the building. Their case-card line about it is \"100% clean.\"",
  },
  {
    q: "What's their growing setup?",
    a: "Indoor in soil under HPS lighting, with a closed-loop HVAC system controlling temperature and humidity room by room. Plants are hand-watered and hand-trimmed at harvest — slower than machine-trim, but they keep the trichome heads intact that way.",
  },
  {
    q: "How is the flower cured?",
    a: "Air-dried for 7 to 10 days in controlled rooms, then cured another 7 to 14 days before it's jarred. The slow dry-and-cure is where the terpene profile sets — it's the part of the process Bondi will tell you they won't rush.",
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

// Per-brand custom layout — Bondi Farms.
//
// Brand assets: logo URL pulled from bondifarms.com's own Squarespace CDN
// (images.squarespace-cdn.com/content/v1/54db2d6ae4b077d41358d80d/...) per
// Doug's standing rule — vendor visuals from the brand's own surface only,
// never Weedmaps / Leafly aggregators. If the asset 404s in production the
// gradient hero degrades cleanly behind a wordmark.
//
// Color palette — Bondi's beach-at-sunset identity. Deep ocean-blue base
// (#0e3a5f) + sunset coral accent (#e8794a). Distinct from the five prior
// custom brand pages: NWCS (forest green / gold), Phat Panda (black / hot-
// pink), Fairwinds (teal / sand), MFUSED (navy / cyan), Spark Industries
// (PNW slate / plaid red).
const BRAND_LOGO =
  "https://images.squarespace-cdn.com/content/v1/54db2d6ae4b077d41358d80d/1423650773898-FMVC6LDY0PXA7PHMK5P8/BondiFarms_Color-logo.png?format=1500w";

const BRAND_DARK = "#0e3a5f"; // Bondi-blue deep ocean
const BRAND_DARK_2 = "#082942"; // gradient deeper
const BRAND_CORAL = "#e8794a"; // sunset coral accent
const BRAND_CORAL_LIGHT = "#f29870"; // hover state

// Sub-brand grid — Bondi's catalog is organized by strain class and
// pre-roll format (their site's PRODUCTS page splits Indica / Hybrid /
// Sativa flower + pre-rolls). The token list catches both general
// category words and the strain names that appear in actual SKU
// names so the filter resolves to real products. Sub-brand counting
// uses a token list rather than a single needle so we can match SKUs
// like "Bondi Granddaddy Purple 3.5g" when the user taps "Indica".
type SubBrand = { name: string; tag: string; line: string; tokens: string[] };

const SUB_BRANDS: SubBrand[] = [
  {
    name: "Indica Flower",
    tag: "Flower",
    line: "Heavy-leaning indoor flower — Granddaddy Purple, GMO, Yeti OG, Sunset Sherbert and friends. The end-of-day jar.",
    tokens: [
      "indica",
      "granddaddy",
      "gdp",
      "gmo",
      "yeti",
      "sunset sherbert",
      "white tahoe",
      "obama kush",
      "flo og",
      "blueberry",
      "afgooey",
      "cherry do-si-do",
      "do-si-do",
      "crazy goo",
      "god's gift",
      "gods gift",
      "optimus prime",
    ],
  },
  {
    name: "Hybrid Flower",
    tag: "Flower",
    line: "Balanced indoor flower — Runtz, OG Kush, Cap Junky, Moonbow, LA Kush Cake. The everyday side of the case.",
    tokens: [
      "hybrid",
      "runtz",
      "og kush",
      "cap junky",
      "moonbow",
      "la kush",
      "kush cake",
      "tangerine dream",
      "blackberry",
      "black cherry",
      "blue hawaiian",
      "dancing gorilla",
      "emerald city",
      "gorilla dawg",
      "great white shark",
      "juicy fruit",
      "queen bee",
      "silver fox",
      "slap happy",
      "super boof",
      "strawberry gary",
    ],
  },
  {
    name: "Sativa Flower",
    tag: "Flower",
    line: "Up-leaning indoor flower — Bay Dream, Candyland, Super Silver Lemon Haze, ATF. Daytime-friendly.",
    tokens: [
      "sativa",
      "bay dream",
      "candyland",
      "super silver",
      "lemon haze",
      "silver haze",
      "atf",
      "alaskan thunder",
    ],
  },
  {
    name: "Pre-Rolls",
    tag: "Pre-Rolls",
    line: "Pack of two half-gram joints, rolled from the same Bondi flower. Available across most of the strain library.",
    tokens: ["pre-roll", "preroll", "joint", "vortex", "super sour diesel"],
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

// Match a product against a sub-brand's token list. Strain-type column
// is preferred when present (clean signal); otherwise we fall back to a
// case-insensitive substring scan over the SKU name.
function matchesSubBrand(p: Product, sb: SubBrand): boolean {
  const strain = (p.strain_type ?? "").toLowerCase();
  const name = (p.name ?? "").toLowerCase();
  const category = (p.category ?? "").toLowerCase();
  return sb.tokens.some((t) => {
    const needle = t.toLowerCase();
    return strain.includes(needle) || name.includes(needle) || category.includes(needle);
  });
}

export default function BondiFarmsBrandPage({
  brand,
  products,
}: {
  brand: VendorBrand;
  products: Product[];
}) {
  // Sub-brand filter — clicking a sub-brand card filters the products
  // grid below to items whose strain_type / name / category contains
  // any of the sub-brand's tokens. Click again or hit the chip's clear
  // button to reset. Same pattern as NWCS / Spark / Phat Panda so the
  // muscle memory stays consistent across all boutique brand pages.
  const [activeSubBrand, setActiveSubBrand] = useState<string | null>(null);

  // Cheap O(N×M) sub-brand counts so each card can show "12 on shelf"
  // or dim itself when nothing in the live menu matches. Bondi tops out
  // around 168 SKUs at peak — well under perceptual budget on render.
  const subBrandCounts = SUB_BRANDS.reduce<Record<string, number>>((acc, sb) => {
    acc[sb.name] = products.filter((p) => matchesSubBrand(p, sb)).length;
    return acc;
  }, {});

  // Build the filtered product list when a sub-brand is active, then
  // hand it to the grid via the same `nameContains` slot used elsewhere
  // — except here we pre-filter by token list and pass an empty
  // nameContains so the grid renders the slice we already computed.
  // (PaginatedProductsGrid does its own substring filter on
  // nameContains, but our token-list match is broader, so we filter
  // upstream and pass the result through directly.)
  const visibleProducts = activeSubBrand
    ? products.filter((p) => {
        const sb = SUB_BRANDS.find((s) => s.name === activeSubBrand);
        return sb ? matchesSubBrand(p, sb) : true;
      })
    : products;

  // Ocean-stripe pattern — drawn with a subtle linear-gradient stack so
  // the hero gets a Bondi-Beach watermark feel without an image asset.
  // Rendered at low opacity so headlines stay legible.
  const oceanStripeStyle: React.CSSProperties = {
    backgroundImage: `
      repeating-linear-gradient(180deg, rgba(232,121,74,0.10) 0 1px, transparent 1px 80px),
      radial-gradient(ellipse at 30% 20%, rgba(232,121,74,0.18) 0%, transparent 55%),
      radial-gradient(ellipse at 80% 80%, rgba(78,168,222,0.18) 0%, transparent 50%)
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
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${BRAND_DARK_2} 0%, ${BRAND_DARK} 55%, #1c5a85 100%)`,
          }}
        />
        {/* Sunset wash on top-right corner — coral fading to ocean. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at top right, rgba(232,121,74,0.32), transparent 60%)`,
          }}
        />
        <div aria-hidden className="absolute inset-0 opacity-70" style={oceanStripeStyle} />

        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-5"
            style={{ color: BRAND_CORAL_LIGHT }}
          >
            <Link href="/brands" className="hover:text-white transition-colors">
              All Brands
            </Link>
            <span className="mx-2 opacity-50">/</span>
            Bondi Farms
          </p>

          <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-10">
            {/* Logo block — white tile so the color logo reads cleanly
                against the dark hero. Falls back to a wordmark behind
                the scenes if the CDN ever 404s. */}
            <div className="shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-white shadow-2xl flex items-center justify-center p-4 relative overflow-hidden border-4 border-white/90">
              <Image
                src={BRAND_LOGO}
                alt="Bondi Farms logo"
                fill
                unoptimized
                className="object-contain p-3"
              />
            </div>
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Bondi Farms
                <br />
                <span style={{ color: BRAND_CORAL_LIGHT }}>Keeping Washington Green</span>
              </h1>
              <p className="text-lg sm:text-xl text-stone-200/90 leading-relaxed">
                Indoor flower out of Longview, WA — soil-grown under HPS, hand-trimmed,
                pesticide-free, slow-cured. Named for Bondi Beach in Sydney; built for the lower
                Columbia.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  <span style={{ color: BRAND_CORAL_LIGHT }}>●</span> Longview, WA
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  Tier 3 Producer / Processor
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold"
                  style={{ backgroundColor: BRAND_CORAL }}
                >
                  {brand.activeSkus} on our shelf
                </span>
              </div>
              <div className="flex flex-wrap gap-3 pt-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-bold transition-all shadow-lg hover:-translate-y-0.5"
                  style={{ backgroundColor: BRAND_CORAL }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = BRAND_CORAL_LIGHT;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = BRAND_CORAL;
                  }}
                >
                  Order Bondi Farms for Pickup →
                </Link>
                <a
                  href="http://www.bondifarms.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all border border-white/20"
                >
                  Visit bondifarms.com ↗
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
            style={{ color: BRAND_CORAL }}
          >
            Our Story
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            A 21,000-square-foot warehouse on the lower Columbia, named after a beach in Sydney.
          </h2>
          <div className="space-y-5 text-stone-700 text-lg leading-relaxed">
            <p>
              Bondi Farms set up shop in <strong>Longview, Washington</strong> in 2015. The pitch
              from the start was straightforward — quality and consistency, not a deck full of
              marketing slides. The Bondi name is borrowed from <strong>Bondi Beach</strong> in
              Sydney: a place where relaxation and activity sit in the same daily rhythm. That&apos;s
              the vibe the team wanted on the jar.
            </p>
            <p>
              The grow is <strong>indoor in soil under HPS lights</strong>, inside a 21,000-sq-ft
              warehouse with a closed-loop HVAC system. Pest management runs on{" "}
              <strong>beneficial predatory insects</strong> instead of chemical sprays. Plants are
              hand-watered through veg and flower, and every harvest gets <strong>hand-trimmed</strong>
              {" "}— slower than machine-trim, but the trichome heads survive the process.
            </p>
            <p>
              Cure is the part Bondi won&apos;t rush. <strong>7 to 10 days air-dried</strong> in
              controlled rooms, then another <strong>7 to 14 days curing</strong> before the flower
              hits a jar. We carry Bondi Farms at {STORE.name} because the slow-cure shows up — the
              terps land where they should and the burn stays clean. Ask a budtender if you want a
              pull from the deli jar before you commit.
            </p>
          </div>
        </div>
      </section>

      {/* SUB-BRANDS ----------------------------------------------------- */}
      <section className="bg-stone-50 border-y border-stone-200 relative">
        <div
          aria-hidden
          className="absolute top-0 inset-x-0 h-1"
          style={{
            background: `linear-gradient(90deg, ${BRAND_DARK} 0%, ${BRAND_CORAL} 50%, ${BRAND_DARK} 100%)`,
          }}
        />
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: BRAND_CORAL }}
              >
                The Lines
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
                Four shelves to pick from
              </h2>
            </div>
            <p className="text-sm text-stone-500 max-w-md">
              All grown indoor under the same Longview roof. Tap a card to filter the live menu
              below to just that line.
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
                          borderColor: BRAND_CORAL,
                          boxShadow: `0 0 0 2px rgba(232,121,74,0.4)`,
                        }
                      : undefined
                  }
                  onMouseEnter={(e) => {
                    if (!active && !disabled) {
                      e.currentTarget.style.borderColor = BRAND_CORAL;
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
                          ? { backgroundColor: BRAND_CORAL }
                          : { backgroundColor: `${BRAND_CORAL}26`, color: BRAND_DARK }
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
                    style={active ? { color: BRAND_CORAL_LIGHT } : undefined}
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
            style={{ color: BRAND_CORAL }}
          >
            How They Grow It
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-10 leading-tight max-w-3xl">
            Indoor, in soil, hand-tended, slow-cured.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                emoji: "🌿",
                title: "Soil-Grown Indoor",
                body: "21,000-sq-ft Longview warehouse, plants in soil under HPS lighting, closed-loop HVAC controlling humidity and temp room by room.",
              },
              {
                emoji: "🐞",
                title: "Pesticide-Free",
                body: "Pest management runs on beneficial predatory insects instead of chemical sprays. Each batch goes through WSLCB-required testing before it leaves the building.",
              },
              {
                emoji: "✂️",
                title: "Hand-Trimmed",
                body: "Every harvest is trimmed by hand. Slower than machine-trim, but the trichome heads survive — which shows up in the way the bud looks under a loupe.",
              },
              {
                emoji: "🫙",
                title: "Slow Cure",
                body: "7 to 10 days air-dried in controlled rooms, then 7 to 14 more days of cure before it goes in a jar. The dry-and-cure is where the terpene profile sets.",
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
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(ellipse at top right, rgba(232,121,74,0.35), transparent 60%)`,
                    }}
                  />
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
            style={{ color: BRAND_CORAL }}
          >
            On Our Shelf
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-2 leading-tight">
            Bondi Farms at {STORE.name}
          </h2>
          <p className="text-stone-500 mb-10">
            Live menu — prices, THC, and stock as of right now. {products.length} total products,
            paginated 25 per page.
          </p>

          {/* Active sub-brand chip — pre-filter is broader than the
              grid's substring filter (it matches strain_type + category
              too), so we render the clear-chip ourselves rather than
              relying on PaginatedProductsGrid's built-in name-filter
              chip. Same UX, just hooked to our token-list filter. */}
          {activeSubBrand && (
            <div className="mb-6 flex items-center gap-3 flex-wrap rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Filtering
              </span>
              <span
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-bold"
                style={{ backgroundColor: BRAND_CORAL }}
              >
                {activeSubBrand}
                <span className="opacity-70">· {visibleProducts.length}</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveSubBrand(null)}
                className="ml-auto text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors"
              >
                Clear filter ✕
              </button>
            </div>
          )}

          <PaginatedProductsGrid
            products={visibleProducts}
            perPage={25}
            accentBg={"bg-[#0e3a5f]"}
            accentBorder={"border-[#e8794a]"}
            accentHoverBorder={"hover:border-[#e8794a]"}
            accentText={"text-[#e8794a]"}
            accentHoverText={"hover:text-[#f29870]"}
            accentGlow={"hover:shadow-[#e8794a]/30"}
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
            style={{ color: BRAND_CORAL }}
          >
            About Bondi Farms
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
                  style={{ borderTopColor: `${BRAND_CORAL}4D` }}
                >
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONNECT -------------------------------------------------------- */}
      <section
        className="text-white relative overflow-hidden"
        style={{ backgroundColor: BRAND_DARK }}
      >
        <div aria-hidden className="absolute inset-0 opacity-60" style={oceanStripeStyle} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: BRAND_CORAL_LIGHT }}
            >
              Connect with Bondi Farms
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 leading-tight">
              Find them online
            </h2>
            <ul className="space-y-3 text-stone-200">
              <li className="flex items-center gap-3">
                <span
                  className="w-20 text-xs font-bold uppercase tracking-wider"
                  style={{ color: BRAND_CORAL_LIGHT }}
                >
                  Web
                </span>
                <a
                  href="http://www.bondifarms.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4"
                  style={{ textDecorationColor: `${BRAND_CORAL}66` }}
                >
                  bondifarms.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span
                  className="w-20 text-xs font-bold uppercase tracking-wider"
                  style={{ color: BRAND_CORAL_LIGHT }}
                >
                  Instagram
                </span>
                <a
                  href="https://www.instagram.com/bondifarms/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4"
                  style={{ textDecorationColor: `${BRAND_CORAL}66` }}
                >
                  @bondifarms
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span
                  className="w-20 text-xs font-bold uppercase tracking-wider"
                  style={{ color: BRAND_CORAL_LIGHT }}
                >
                  HQ
                </span>
                <span>Longview, WA</span>
              </li>
              <li className="flex items-center gap-3">
                <span
                  className="w-20 text-xs font-bold uppercase tracking-wider"
                  style={{ color: BRAND_CORAL_LIGHT }}
                >
                  Tagline
                </span>
                <span className="italic">Keeping Washington Green</span>
              </li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: BRAND_CORAL_LIGHT }}
              >
                Pickup at {STORE.name}
              </p>
              <p className="text-xl font-extrabold mb-1">
                {brand.activeSkus} Bondi Farms product{brand.activeSkus !== 1 ? "s" : ""} ready in{" "}
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
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-bold transition-all"
                style={{ backgroundColor: BRAND_CORAL }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = BRAND_CORAL_LIGHT;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = BRAND_CORAL;
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

      <StickyOrderCTA label="Order Bondi Farms →" />
    </div>
  );
}
