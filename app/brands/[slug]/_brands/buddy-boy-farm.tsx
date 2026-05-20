"use client";

import type { VendorBrand } from "@/lib/db";
import { STORE } from "@/lib/store";
import { withAttr } from "@/lib/attribution";
import { PaginatedProductsGrid } from "./PaginatedProductsGrid";
import { StickyOrderCTA } from "./StickyOrderCTA";
import { BrandHero } from "./_shell/BrandHero";
import { BrandStory } from "./_shell/BrandStory";
import { BrandAboutQA } from "./_shell/BrandAboutQA";
import { BrandConnectBlock } from "./_shell/BrandConnectBlock";
import type { BrandPalette } from "./_shell/types";

// About-Buddy-Boy-Farm Q&A — facts grounded in the operator's own public
// statements + WSLCB licensee record + brand bio in lib/brand-copy.ts.
// Buddy Boy doesn't claim organic certification (federal law makes that
// complicated for cannabis); we use the operator's exact framing for the
// pesticide / soil-input claims so we stay inside WAC 314-55-155
// "factual statement of provenance" territory. FAQPage JSON-LD emitted
// from BrandAboutQA. No medical claims.
const ABOUT_QA = [
  {
    q: "Where is Buddy Boy Farm?",
    a: "Ford, Washington — Stevens County, out past Spokane on land the family has farmed for nearly forty years. The cannabis side moved onto the same property after I-502 passed in 2014. Same soil, same spring water, same approach the family used for the rest of their agricultural work.",
  },
  {
    q: "How do they grow?",
    a: "All greenhouse — 24 structures on the property. Spring water from an on-site source rather than municipal piped water. Beneficial insects in place of broad-spectrum sprays. Soil amendments built up over decades of farming the same dirt. They've gone on record that no harmful or non-organic pesticides touch the plants. They don't claim formal organic certification because federal law keeps cannabis out of the USDA program — what they do is what they do, and they describe it the same way every time.",
  },
  {
    q: "What strains is the farm known for?",
    a: "Signature varieties include God's Gift and Dutch Queen — both developed on the property over the years by DJ, one of the long-time owners. The general catalog runs deeper than that; the menu rotates with harvest cycles and what the greenhouses are finishing.",
  },
  {
    q: "Why does Green Life carry them?",
    a: "Greenhouse-grown WA flower with a long-form farming story behind it — and a price point that reflects greenhouse economics rather than indoor power costs. When customers ask for clean inputs and they don't want to step up to top-shelf indoor pricing, Buddy Boy is one of the names budtenders mention first.",
  },
];

// Per-brand custom layout — Buddy Boy Farm (Ford, WA).
// Palette: forest evergreen + warm farmhouse honey. Evokes Stevens County
// pine-and-clearing country plus the working-farm-not-marketing voice the
// brand actually has.
const PALETTE: BrandPalette = {
  dark: "#14241a", // deep evergreen (hero bg)
  dark2: "#1f3328", // forest moss (gradient mid + sections)
  dark3: "#3a5a3f", // brighter sage end-stop
  accent: "#d9b873", // farmhouse honey
  accentMuted: "#ebd1a0", // light honey hover
};

const BRAND_DARK = PALETTE.dark2!;
const BRAND_DARK_2 = PALETTE.dark;
const BRAND_HONEY = PALETTE.accent;
const BRAND_HONEY_LIGHT = PALETTE.accentMuted!;

// Soft greenhouse-pane pattern — alternating warm-light bands evoke
// translucent poly walls in late-afternoon sun. Pure CSS, no asset.
const GREENHOUSE_PATTERN: React.CSSProperties = {
  backgroundImage: `
    repeating-linear-gradient(78deg, rgba(217,184,115,0.16) 0 18px, transparent 18px 64px),
    repeating-linear-gradient(78deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 32px)
  `,
};

const SUB_BRANDS: Array<{ name: string; tag: string; line: string; matchToken: string }> = [
  {
    name: "Greenhouse Flower",
    tag: "Eighths + Quarters",
    line: "Greenhouse-grown flower in pre-packed weights. Stevens County sun and spring water in every bag, on a slower harvest cycle than indoor.",
    matchToken: "Flower",
  },
  {
    name: "Pre-Rolls",
    tag: "Singles + Multi-Packs",
    line: "Same greenhouse flower in joint form. The bridge between a top-shelf indoor pre-roll and a budget cone — Buddy Boy's land economics show up at the price.",
    matchToken: "Pre-Roll",
  },
  {
    name: "Signature Strains",
    tag: "God's Gift · Dutch Queen",
    line: "Cuts developed on the farm over the years by DJ, one of the long-time owners. The strains that put Buddy Boy on most Washington shoppers' radar.",
    matchToken: "God",
  },
];

const FARM_CARDS = [
  {
    emoji: "💧",
    title: "On-Site Spring Water",
    body: "Cannabis here gets the same spring source the family used for the rest of the farm — not municipal piped water with the residual treatment chemistry that comes with it.",
  },
  {
    emoji: "🐞",
    title: "Beneficial Insects",
    body: "Predator insects do the pest-management work that broad-spectrum sprays do at the commercial-indoor scale. The operator's stated rule: no harmful or non-organic pesticides on the plants.",
  },
  {
    emoji: "🌱",
    title: "Decades-Built Soil",
    body: "The dirt the cannabis grows in is the same dirt the family has been amending and rotating for close to forty years. That's a soil web you can't shortcut.",
  },
  {
    emoji: "🏡",
    title: "24 Greenhouse Structures",
    body: "All cannabis production is greenhouse — Stevens County sun and seasonal cycles rather than year-round indoor lights. Bigger plants, slower cures, lower power bill.",
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

export default function BuddyBoyFarmBrandPage({
  brand,
  products,
}: {
  brand: VendorBrand;
  products: Product[];
}) {
  const subBrandCounts = SUB_BRANDS.reduce<Record<string, number>>((acc, sb) => {
    const needle = sb.matchToken.toLowerCase();
    acc[sb.name] = products.filter((p) => {
      const cat = (p.category ?? "").toLowerCase();
      const name = (p.name ?? "").toLowerCase();
      return cat.includes(needle) || name.includes(needle);
    }).length;
    return acc;
  }, {});

  // Attribution-stamped /menu href — emits ?from=brand:buddy-boy-farm.
  const menuHref = withAttr("/menu", "brand", "buddy-boy-farm");

  return (
    <div className="bg-stone-50">
      {/* HERO — typographic BB logo + greenhouse-pane pattern + golden-hour radial */}
      <BrandHero
        palette={PALETTE}
        crumb="Buddy Boy Farm"
        logoNode={
          <div
            className="absolute inset-0 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden border-4 border-white/90"
            style={{ backgroundColor: BRAND_DARK }}
          >
            <div aria-hidden className="absolute inset-0 opacity-90" style={GREENHOUSE_PATTERN} />
            <div className="relative text-center">
              <p
                className="font-black text-4xl sm:text-5xl tracking-tight leading-none drop-shadow"
                style={{ color: BRAND_HONEY_LIGHT }}
              >
                BB
              </p>
              <p className="text-white font-extrabold text-[10px] sm:text-xs tracking-[0.25em] uppercase mt-2 drop-shadow">
                Farm
              </p>
            </div>
          </div>
        }
        title="Buddy Boy Farm"
        tagline="Forty years of farming, before cannabis was on the books."
        subtitle="Ford, Washington — Stevens County land the family has worked for close to four decades. The cannabis moved onto the property in 2014; the spring water, the soil, and the way they grow have been there a lot longer."
        pills={[
          { kind: "muted", label: "Ford, WA", dot: true },
          { kind: "muted", label: "Producer / Processor" },
          { kind: "muted", label: "Cannabis side since 2014" },
          { kind: "filled", label: `${brand.activeSkus} on our shelf` },
        ]}
        ctas={[
          { href: menuHref, label: "Shop Buddy Boy for Pickup →", variant: "primary" },
          { href: "/brands", label: "← All Brands", variant: "secondary" },
        ]}
      >
        <div aria-hidden className="absolute inset-0 opacity-50" style={GREENHOUSE_PATTERN} />
        {/* Golden-hour radial in the upper-right — Stevens County late afternoon. */}
        <div
          aria-hidden
          className="absolute -top-28 -right-28 w-[560px] h-[560px] rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle at center, rgba(235,209,160,0.6) 0%, rgba(217,184,115,0.25) 35%, transparent 70%)",
          }}
        />
      </BrandHero>

      <BrandStory
        palette={PALETTE}
        eyebrow="Our Story"
        headline="A working organic farm that happens to grow cannabis too."
      >
        <p>
          <strong>Buddy Boy Farm</strong> sits in Ford, Washington — Stevens County, out past
          Spokane in the corner of the state where pine-and-clearing land takes over from the
          Columbia Basin&apos;s irrigation rectangles. The family has been farming the
          property for close to forty years. The cannabis side came online in 2014, after
          I-502, and it grows on the same dirt the family has been amending and rotating since
          well before any of this was legal.
        </p>
        <p>
          The growing approach is simple and the team describes it the same way every time.
          Spring water from an on-site source rather than municipal piped water. Beneficial
          insects in place of broad-spectrum sprays. Soil amendments built up over decades.
          The team doesn&apos;t claim formal organic certification — federal law keeps
          cannabis out of the USDA program — but they&apos;ve gone on record that no harmful
          or non-organic pesticides touch the plants. DJ, one of the long-time owners, is the
          name behind signature strains like God&apos;s Gift and Dutch Queen, developed on
          the farm over the years.
        </p>
        <p>
          We carry Buddy Boy at {STORE.name} because greenhouse-grown WA flower with a
          long-form farming story is one of the easier categories to recommend with a
          straight face. The price reflects greenhouse economics — not indoor power costs —
          and customers who want clean inputs without stepping up to boutique indoor pricing
          tend to find their way to Buddy Boy on a budtender&apos;s second sentence.
        </p>
      </BrandStory>

      {/* PRODUCT LINES — visual cards (no filter state; per-brand variant) */}
      <section className="bg-stone-50 border-y border-stone-200 relative">
        <div aria-hidden className="absolute top-0 inset-x-0 h-1.5 opacity-90" style={GREENHOUSE_PATTERN} />
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: BRAND_DARK }}
              >
                What We Carry
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
                Flower, pre-rolls, and the farm&apos;s signature cuts
              </h2>
            </div>
            <p className="text-sm text-stone-500 max-w-md">
              Counts reflect what&apos;s on the {STORE.name} shelf right now — the menu
              rotates with the greenhouse harvest cycles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUB_BRANDS.map((sb) => {
              const count = subBrandCounts[sb.name] ?? 0;
              const inStock = count > 0;
              return (
                <div
                  key={sb.name}
                  className="rounded-2xl border border-stone-200 bg-white p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                  style={{ borderTopWidth: 3, borderTopColor: inStock ? BRAND_HONEY : "#e7e5e4" }}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <h3 className="font-extrabold text-lg leading-tight text-stone-900">
                      {sb.name}
                    </h3>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{ backgroundColor: `${BRAND_HONEY}40`, color: BRAND_DARK }}
                    >
                      {sb.tag}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-600">{sb.line}</p>
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-wider mt-3 ${
                      inStock ? "text-emerald-700" : "text-stone-400"
                    }`}
                  >
                    {inStock ? `${count} on shelf` : "Not in stock"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GROW STORY — "How the farm runs" 4-card grid */}
      <section className="bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: BRAND_DARK }}
          >
            How The Farm Runs
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-10 leading-tight max-w-3xl">
            Spring water, beneficial insects, and soil the family has been building for decades.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FARM_CARDS.map((c) => (
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
                  <div aria-hidden className="absolute inset-0 opacity-50" style={GREENHOUSE_PATTERN} />
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
            style={{ color: BRAND_DARK }}
          >
            On Our Shelf
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-2 leading-tight">
            Buddy Boy Farm at {STORE.name}
          </h2>
          <p className="text-stone-500 mb-10">
            Live menu — prices, THC, and stock as of right now. {products.length} total products,
            paginated 25 per page.
          </p>

          <PaginatedProductsGrid
            products={products}
            perPage={25}
            accentBg="bg-[#1f3328]"
            accentBorder="border-[#d9b873]"
            accentHoverBorder="hover:border-[#d9b873]"
            accentText="text-[#1f3328]"
            accentHoverText="hover:text-[#14241a]"
            accentGlow="hover:shadow-[#d9b873]/30"
          />
        </div>
      </section>

      <BrandAboutQA palette={PALETTE} brandName="Buddy Boy Farm" items={ABOUT_QA} />

      <BrandConnectBlock
        palette={PALETTE}
        brandName="Buddy Boy Farm"
        heading="Where to find them"
        links={[
          { label: "Where", text: "Ford, WA · Stevens County" },
          { label: "Founded", text: "Farm: ~1980s · Cannabis side: 2014 (post-I-502)" },
          { label: "Grow", text: "Greenhouse — 24 structures, spring-water irrigated" },
          { label: "Approach", text: "Beneficial insects, no harmful or non-organic pesticides" },
        ]}
        pickup={{
          eyebrow: `Pickup at ${STORE.name}`,
          headline: `${brand.activeSkus} Buddy Boy product${brand.activeSkus !== 1 ? "s" : ""} ready in ${STORE.address.city}`,
          body: (
            <>
              Order ahead and your kit&apos;s waiting at the counter. {STORE.address.full}.
              21+ with valid ID. Cash only.
            </>
          ),
          primaryCta: { href: menuHref, label: "Order for Pickup →" },
          secondaryCta: { href: "/brands", label: "← All Brands" },
        }}
      />

      <StickyOrderCTA
        label="Shop Buddy Boy →"
        href={menuHref}
        bgClass="bg-[#1f3328]"
        textClass="text-[#d9b873]"
        hoverClass="hover:bg-[#14241a]"
      />
    </div>
  );
}
