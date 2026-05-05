"use client";

import { useState } from "react";
import type { VendorBrand } from "@/lib/db";
import { STORE } from "@/lib/store";
import { PaginatedProductsGrid } from "./PaginatedProductsGrid";
import { StickyOrderCTA } from "./StickyOrderCTA";
import { BrandHero } from "./_shell/BrandHero";
import { BrandStory } from "./_shell/BrandStory";
import { BrandAboutQA } from "./_shell/BrandAboutQA";
import { BrandConnectBlock } from "./_shell/BrandConnectBlock";
import type { BrandPalette } from "./_shell/types";

// About-Bondi Q&A — facts verified across bondifarms.com + Leafly +
// AskGrowers. FAQPage JSON-LD emitted from BrandAboutQA. No medical
// claims (WAC 314-55-155).
const ABOUT_QA = [
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

// Per-brand custom layout — Bondi Farms.
// Palette: Bondi-blue deep ocean + sunset coral. Beach-at-sunset identity
// — name borrowed from Bondi Beach in Sydney.
const PALETTE: BrandPalette = {
  dark: "#082942", // deeper Bondi blue (hero bg)
  dark2: "#0e3a5f", // Bondi-blue ocean (sections + sub-brand active)
  dark3: "#1c5a85", // gradient end-stop
  accent: "#e8794a", // sunset coral
  accentMuted: "#f29870", // hover state
};

const BRAND_DARK = PALETTE.dark2!;
const BRAND_CORAL = PALETTE.accent;
const BRAND_CORAL_LIGHT = PALETTE.accentMuted!;

const BRAND_LOGO =
  "https://images.squarespace-cdn.com/content/v1/54db2d6ae4b077d41358d80d/1423650773898-FMVC6LDY0PXA7PHMK5P8/BondiFarms_Color-logo.png?format=1500w";

// Ocean-stripe pattern — drawn with a subtle linear-gradient stack so the
// hero gets a Bondi-Beach watermark feel without an image asset.
const oceanStripeStyle: React.CSSProperties = {
  backgroundImage: `
    repeating-linear-gradient(180deg, rgba(232,121,74,0.10) 0 1px, transparent 1px 80px),
    radial-gradient(ellipse at 30% 20%, rgba(232,121,74,0.18) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 80%, rgba(78,168,222,0.18) 0%, transparent 50%)
  `,
};

type SubBrand = { name: string; tag: string; line: string; tokens: string[] };

const SUB_BRANDS: SubBrand[] = [
  {
    name: "Indica Flower",
    tag: "Flower",
    line: "Heavy-leaning indoor flower — Granddaddy Purple, GMO, Yeti OG, Sunset Sherbert and friends. The end-of-day jar.",
    tokens: ["indica", "granddaddy", "gdp", "gmo", "yeti", "sunset sherbert", "white tahoe", "obama kush", "flo og", "blueberry", "afgooey", "cherry do-si-do", "do-si-do", "crazy goo", "god's gift", "gods gift", "optimus prime"],
  },
  {
    name: "Hybrid Flower",
    tag: "Flower",
    line: "Balanced indoor flower — Runtz, OG Kush, Cap Junky, Moonbow, LA Kush Cake. The everyday side of the case.",
    tokens: ["hybrid", "runtz", "og kush", "cap junky", "moonbow", "la kush", "kush cake", "tangerine dream", "blackberry", "black cherry", "blue hawaiian", "dancing gorilla", "emerald city", "gorilla dawg", "great white shark", "juicy fruit", "queen bee", "silver fox", "slap happy", "super boof", "strawberry gary"],
  },
  {
    name: "Sativa Flower",
    tag: "Flower",
    line: "Up-leaning indoor flower — Bay Dream, Candyland, Super Silver Lemon Haze, ATF. Daytime-friendly.",
    tokens: ["sativa", "bay dream", "candyland", "super silver", "lemon haze", "silver haze", "atf", "alaskan thunder"],
  },
  {
    name: "Pre-Rolls",
    tag: "Pre-Rolls",
    line: "Pack of two half-gram joints, rolled from the same Bondi flower. Available across most of the strain library.",
    tokens: ["pre-roll", "preroll", "joint", "vortex", "super sour diesel"],
  },
];

const APPROACH_CARDS = [
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
  const [activeSubBrand, setActiveSubBrand] = useState<string | null>(null);

  const subBrandCounts = SUB_BRANDS.reduce<Record<string, number>>((acc, sb) => {
    acc[sb.name] = products.filter((p) => matchesSubBrand(p, sb)).length;
    return acc;
  }, {});

  const visibleProducts = activeSubBrand
    ? products.filter((p) => {
        const sb = SUB_BRANDS.find((s) => s.name === activeSubBrand);
        return sb ? matchesSubBrand(p, sb) : true;
      })
    : products;

  return (
    <div className="bg-stone-50">
      <BrandHero
        palette={PALETTE}
        crumb="Bondi Farms"
        logoUrl={BRAND_LOGO}
        logoAlt="Bondi Farms logo"
        title="Bondi Farms"
        tagline="Keeping Washington Green"
        subtitle="Indoor flower out of Longview, WA — soil-grown under HPS, hand-trimmed, pesticide-free, slow-cured. Named for Bondi Beach in Sydney; built for the lower Columbia."
        pills={[
          { kind: "muted", label: "Longview, WA", dot: true },
          { kind: "muted", label: "Tier 3 Producer / Processor" },
          { kind: "filled", label: `${brand.activeSkus} on our shelf` },
        ]}
        ctas={[
          { href: "/menu", label: "Order Bondi Farms for Pickup →", variant: "primary" },
          {
            href: "http://www.bondifarms.com/",
            label: "Visit bondifarms.com ↗",
            variant: "secondary",
            external: true,
          },
        ]}
      >
        {/* Sunset wash on top-right corner — coral fading to ocean. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at top right, rgba(232,121,74,0.32), transparent 60%)`,
          }}
        />
        {/* Ocean stripe pattern. */}
        <div aria-hidden className="absolute inset-0 opacity-70" style={oceanStripeStyle} />
      </BrandHero>

      <BrandStory
        palette={PALETTE}
        eyebrow="Our Story"
        headline="A 21,000-square-foot warehouse on the lower Columbia, named after a beach in Sydney."
      >
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
      </BrandStory>

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
                          boxShadow: `0 0 0 2px ${BRAND_CORAL}66`,
                        }
                      : undefined
                  }
                  onMouseEnter={(e) => {
                    if (!active && !disabled) e.currentTarget.style.borderColor = BRAND_CORAL;
                  }}
                  onMouseLeave={(e) => {
                    if (!active && !disabled) e.currentTarget.style.borderColor = "";
                  }}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <h3 className={`font-extrabold text-lg leading-tight ${active ? "text-white" : "text-stone-900"}`}>
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
                  <p className={`text-sm leading-relaxed ${active ? "text-stone-200" : "text-stone-600"}`}>
                    {sb.line}
                  </p>
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-wider mt-3 ${
                      active ? "" : count > 0 ? "text-emerald-700" : "text-stone-400"
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
            {APPROACH_CARDS.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl bg-stone-50 border border-stone-200 overflow-hidden hover:shadow-md transition-all"
              >
                <div
                  className="aspect-[4/3] flex items-center justify-center text-6xl relative"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND_DARK} 0%, ${PALETTE.dark} 100%)`,
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
            Live menu — prices, THC, and stock as of right now. {visibleProducts.length} total
            products, paginated 25 per page.
          </p>

          <PaginatedProductsGrid
            products={visibleProducts}
            perPage={25}
            accentBg="bg-[#0e3a5f]"
            accentBorder="border-[#e8794a]"
            accentHoverBorder="hover:border-[#e8794a]"
            accentText="text-[#0e3a5f]"
            accentHoverText="hover:text-[#082942]"
            accentGlow="hover:shadow-[#e8794a]/30"
          />
        </div>
      </section>

      <BrandAboutQA palette={PALETTE} brandName="Bondi Farms" items={ABOUT_QA} />

      <BrandConnectBlock
        palette={PALETTE}
        brandName="Bondi Farms"
        links={[
          { label: "Web", href: "http://www.bondifarms.com/", text: "bondifarms.com" },
          { label: "Instagram", href: "https://www.instagram.com/bondifarms/", text: "@bondifarms" },
          { label: "HQ", text: "Longview, WA" },
          { label: "Tagline", text: "Keeping Washington Green" },
        ]}
        pickup={{
          eyebrow: `Pickup at ${STORE.name}`,
          headline: `${brand.activeSkus} Bondi Farms product${brand.activeSkus !== 1 ? "s" : ""} ready in ${STORE.address.city}`,
          body: (
            <>
              Order ahead and your kit&apos;s waiting at the counter. {STORE.address.full}.
              21+ with valid ID. Cash only.
            </>
          ),
          primaryCta: { href: "/menu", label: "Order for Pickup →" },
          secondaryCta: { href: "/brands", label: "← All Brands" },
        }}
      />

      <StickyOrderCTA label="Order Bondi Farms →" />
    </div>
  );
}
