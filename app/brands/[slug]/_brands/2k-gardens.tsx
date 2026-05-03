"use client";

import Link from "next/link";
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

// About-2K-Gardens Q&A — facts grounded in WSLCB licensee public records
// + Top Shelf Data's Quincy listing. No public website / Instagram for
// 2K Gardens; all citable facts come from public records (license #,
// location, start date, growth trajectory) + our own shelf data + the
// general agronomy of the Columbia Basin. FAQPage JSON-LD emitted from
// BrandAboutQA. No medical claims.
const ABOUT_QA = [
  {
    q: "Where is 2K Gardens grown?",
    a: "Quincy, Washington — Columbia Basin country in Grant County, the heart of Washington's outdoor and greenhouse cannabis belt. Licensed by the WSLCB (license 436709, UBI 605203573) at 8119 S Frontage Rd W, Ste B, Quincy WA 98848.",
  },
  {
    q: "How long have they been around?",
    a: "Newer farm — they came online February 2024 and have been on a near-vertical climb ever since. By March 2026 they were ranked 87 out of 542 active Washington producer/processors with $192K in monthly sales — a +1,518% year-over-year jump. Zero compliance violations on file.",
  },
  {
    q: "What does 2K Gardens make?",
    a: "Flower-forward operation — bulk and packaged flower across multiple weights, pre-rolls, and infused pre-rolls. They run Columbia Basin sun and seasonal greenhouse cycles, which shows up as bigger, denser harvest-time terpene profiles than year-round indoor.",
  },
  {
    q: "Why does Green Life carry them?",
    a: "2K Gardens is one of our highest-volume flower vendors — frequently in the top three for total active SKUs in the case. The price-to-quality ratio is the standout: Quincy growers pay a fraction of indoor power costs, and the savings show up as well-priced eighths, pre-rolls, and bulk ounces without the harshness you sometimes get from rushed outdoor cures.",
  },
];

// Per-brand custom layout — 2K Gardens (Quincy, WA).
// Palette: harvest olive + wheat-gold. Evokes Columbia Basin in late
// summer (Quincy is in WA's irrigated farm belt).
const PALETTE: BrandPalette = {
  dark: "#1f3514", // deeper olive (hero bg)
  dark2: "#2d4a1e", // harvest olive (gradient mid + sections)
  dark3: "#4a6e2c", // gradient end-stop highlight
  accent: "#e8c46a", // wheat-gold
  accentMuted: "#f3dc9a", // light wheat hover
};

const BRAND_DARK = PALETTE.dark2!;
const BRAND_DARK_2 = PALETTE.dark;
const BRAND_GOLD = PALETTE.accent;
const BRAND_GOLD_LIGHT = PALETTE.accentMuted!;

// Field-row pattern — alternating gold + olive bands evoke Columbia Basin
// row crops viewed from above. Pure CSS, no asset.
const FIELD_PATTERN: React.CSSProperties = {
  backgroundImage: `
    repeating-linear-gradient(95deg, rgba(232,196,106,0.18) 0 14px, transparent 14px 56px),
    repeating-linear-gradient(95deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 28px)
  `,
};

const SUB_BRANDS: Array<{ name: string; tag: string; line: string; matchToken: string }> = [
  {
    name: "Flower",
    tag: "Packaged",
    line: "Quincy outdoor / greenhouse flower in pre-packed eighths, quarters, and halves. Strain rotation reflects what hits our receiving — full-season harvest terps, denser cures than rushed outdoor.",
    matchToken: "Flower",
  },
  {
    name: "Bulk Ounce",
    tag: "Best Value",
    line: "Whole-ounce buys at the kind of per-gram price that Quincy land + sun makes possible. Stock rotates by harvest — when it's here it moves fast.",
    matchToken: "Ounce",
  },
  {
    name: "Pre-Rolls",
    tag: "Singles + Multi-Packs",
    line: "House-rolled flower and infused pre-roll variants. Same outdoor / greenhouse flower in joint form for the cheaper-than-flower out-the-door price.",
    matchToken: "Pre-Roll",
  },
];

const QUINCY_CARDS = [
  {
    emoji: "☀️",
    title: "Outdoor Sun",
    body: "Quincy sits in WA's irrigated farm belt — the same Columbia Basin sun that grows the state's hops, corn, and apples. Real seasons, real terps.",
  },
  {
    emoji: "💧",
    title: "Basin Water",
    body: "Columbia Basin Project irrigation rights underpin the whole region. Cannabis here gets the same water table that built central WA agriculture.",
  },
  {
    emoji: "🌾",
    title: "Greenhouse Cycles",
    body: "Seasonal greenhouse on top of outdoor — extends the harvest window, lets the cure breathe, keeps the menu fresh through winter.",
  },
  {
    emoji: "🚚",
    title: "120 Miles East",
    body: "Quincy to Wenatchee is two hours down US-2. Flower lands at our receiving fresh — short truck means a tighter bag, less travel oxidation.",
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

export default function TwoKGardensBrandPage({
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

  // Attribution-stamped /menu href — emits ?from=brand:2k-gardens.
  const menuHref = withAttr("/menu", "brand", "2k-gardens");

  return (
    <div className="bg-stone-50">
      {/* HERO — typographic 2K logo + field pattern + sun radial in decoration */}
      <BrandHero
        palette={PALETTE}
        crumb="2K Gardens"
        logoNode={
          <div
            className="absolute inset-0 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden border-4 border-white/90"
            style={{ backgroundColor: BRAND_DARK }}
          >
            <div aria-hidden className="absolute inset-0 opacity-90" style={FIELD_PATTERN} />
            <div className="relative text-center">
              <p
                className="font-black text-4xl sm:text-5xl tracking-tight leading-none drop-shadow"
                style={{ color: BRAND_GOLD_LIGHT }}
              >
                2K
              </p>
              <p className="text-white font-extrabold text-[10px] sm:text-xs tracking-[0.25em] uppercase mt-2 drop-shadow">
                Gardens
              </p>
            </div>
          </div>
        }
        title="2K Gardens"
        tagline="Columbia Basin grown."
        subtitle="Quincy, Washington — outdoor and greenhouse cannabis from a Grant County farm that came online in 2024 and shot to the top of our flower roster in eighteen months."
        pills={[
          { kind: "muted", label: "Quincy, WA", dot: true },
          { kind: "muted", label: "Producer / Processor" },
          { kind: "muted", label: "Since Feb 2024" },
          { kind: "filled", label: `${brand.activeSkus} on our shelf` },
        ]}
        ctas={[
          { href: menuHref, label: "Shop 2K Gardens for Pickup →", variant: "primary" },
          { href: "/brands", label: "← All Brands", variant: "secondary" },
        ]}
      >
        <div aria-hidden className="absolute inset-0 opacity-50" style={FIELD_PATTERN} />
        {/* Sun-warmth radial in the upper-right — Quincy summers. */}
        <div
          aria-hidden
          className="absolute -top-28 -right-28 w-[560px] h-[560px] rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle at center, rgba(243,220,154,0.6) 0%, rgba(232,196,106,0.25) 35%, transparent 70%)",
          }}
        />
      </BrandHero>

      <BrandStory
        palette={PALETTE}
        eyebrow="Our Story"
        headline="From a Quincy field to one of our biggest flower vendors in eighteen months."
      >
        <p>
          2K Gardens came online in February 2024 out of a single Quincy site at 8119 S
          Frontage Rd W. Quincy is the heart of Washington&apos;s irrigated farming belt —
          same Columbia Basin sun and water table that grows the state&apos;s hops, sweet
          corn, and apples — and that&apos;s the agronomy 2K is built on. Outdoor and
          seasonal greenhouse cycles, real Eastern WA summer heat, harvest-time terpene
          profiles you don&apos;t get under year-round indoor lights.
        </p>
        <p>
          Eighteen months in, they were ranked <strong>87 of 542</strong> active Washington
          producer/processors by monthly revenue. The trajectory has been near-vertical —
          over a thousand percent year-over-year growth, zero compliance violations on the
          public WSLCB record. That&apos;s a farm that&apos;s figured out the math on
          Columbia Basin land and is scaling without skipping the cure.
        </p>
        <p>
          We carry 2K Gardens at {STORE.name} because the price-to-quality math is real and
          they&apos;re local in the way that matters — Quincy is two hours down the road
          from Wenatchee, both ends of the same agricultural corridor. The flower lands at
          our receiving fresh, the pre-rolls move fast on the shelf, and the bulk ounce is
          regularly the best value in the case.
        </p>
      </BrandStory>

      {/* PRODUCT LINES — visual cards (no filter state; per-brand variant) */}
      <section className="bg-stone-50 border-y border-stone-200 relative">
        <div aria-hidden className="absolute top-0 inset-x-0 h-1.5 opacity-90" style={FIELD_PATTERN} />
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
                Three lines, all flower-forward
              </h2>
            </div>
            <p className="text-sm text-stone-500 max-w-md">
              Counts reflect what&apos;s on the {STORE.name} shelf right now — refresh tomorrow,
              the mix may have rotated.
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
                  style={{ borderTopWidth: 3, borderTopColor: inStock ? BRAND_GOLD : "#e7e5e4" }}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <h3 className="font-extrabold text-lg leading-tight text-stone-900">
                      {sb.name}
                    </h3>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{ backgroundColor: `${BRAND_GOLD}40`, color: BRAND_DARK }}
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

      {/* GROW STORY — "Why Quincy" 4-card grid (per-brand: field-pattern variant) */}
      <section className="bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: BRAND_DARK }}
          >
            Why Quincy
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-10 leading-tight max-w-3xl">
            Columbia Basin sun, irrigation rights, and a two-hour drive to our back door.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {QUINCY_CARDS.map((c) => (
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
                  <div aria-hidden className="absolute inset-0 opacity-50" style={FIELD_PATTERN} />
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
            2K Gardens at {STORE.name}
          </h2>
          <p className="text-stone-500 mb-10">
            Live menu — prices, THC, and stock as of right now. {products.length} total products,
            paginated 25 per page.
          </p>

          <PaginatedProductsGrid
            products={products}
            perPage={25}
            accentBg="bg-[#2d4a1e]"
            accentBorder="border-[#e8c46a]"
            accentHoverBorder="hover:border-[#e8c46a]"
            accentText="text-[#2d4a1e]"
            accentHoverText="hover:text-[#1f3514]"
            accentGlow="hover:shadow-[#e8c46a]/30"
          />
        </div>
      </section>

      <BrandAboutQA palette={PALETTE} brandName="2K Gardens" items={ABOUT_QA} />

      <BrandConnectBlock
        palette={PALETTE}
        brandName="2K Gardens"
        heading="On the public WSLCB record"
        links={[
          { label: "License", text: "WSLCB 436709" },
          { label: "UBI", text: "605203573" },
          { label: "Address", text: "8119 S Frontage Rd W, Ste B, Quincy WA 98848" },
          { label: "County", text: "Grant County, WA" },
          { label: "Active", text: "February 2024 → present · 0 violations" },
        ]}
        pickup={{
          eyebrow: `Pickup at ${STORE.name}`,
          headline: `${brand.activeSkus} 2K Gardens product${brand.activeSkus !== 1 ? "s" : ""} ready in ${STORE.address.city}`,
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
        label="Shop 2K Gardens →"
        href={menuHref}
        bgClass="bg-[#2d4a1e]"
        textClass="text-[#e8c46a]"
        hoverClass="hover:bg-[#1f3514]"
      />
    </div>
  );
}
