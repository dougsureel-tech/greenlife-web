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

// About-Spark Q&A — verified across the brand's own channels
// (sparkindustrieswa.com, plaidjacket.com, smokeflipside.com) plus
// Grow Magazine farm-visit profile + Cinder write-up. FAQPage JSON-LD
// emitted from BrandAboutQA. No medical claims (WAC 314-55-155).
const ABOUT_QA = [
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

// Per-brand custom layout — Spark Industries (Plaid Jacket / Flip Side).
// Palette: PNW slate + plaid red. The plaid IS the brand — rendered via
// CSS pattern (no remote image dependency).
const PALETTE: BrandPalette = {
  dark: "#162a38", // deeper slate for hero bg
  dark2: "#1e3a4d", // PNW slate (used in story/connect)
  dark3: "#2a4f66", // gradient end-stop highlight
  accent: "#c43f3f", // plaid red
  accentMuted: "#e06363", // hover state (lighter red)
};

const BRAND_RED = PALETTE.accent;
const BRAND_RED_LIGHT = PALETTE.accentMuted!;
const BRAND_DARK = PALETTE.dark2!;

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

const APPROACH_CARDS = [
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
];

// CSS-rendered plaid pattern — drawn with overlapping linear-gradient
// stripes at 0deg and 90deg so it tartans without an image asset.
const plaidStyle: React.CSSProperties = {
  backgroundImage: `
    repeating-linear-gradient(0deg, rgba(196,63,63,0.35) 0 6px, transparent 6px 32px),
    repeating-linear-gradient(90deg, rgba(196,63,63,0.35) 0 6px, transparent 6px 32px),
    repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 16px),
    repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 16px)
  `,
};

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
  const [activeSubBrand, setActiveSubBrand] = useState<string | null>(null);

  const subBrandCounts = SUB_BRANDS.reduce<Record<string, number>>((acc, sb) => {
    const needle = sb.name.toLowerCase();
    acc[sb.name] = products.filter((p) => (p.name ?? "").toLowerCase().includes(needle)).length;
    return acc;
  }, {});

  return (
    <div className="bg-stone-50">
      {/* HERO — typographic plaid logo + plaid + radial overlays */}
      <BrandHero
        palette={PALETTE}
        crumb="Spark Industries / Plaid Jacket"
        logoNode={
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border-4 border-white/90"
            style={{ backgroundColor: BRAND_DARK }}
          >
            <div aria-hidden className="absolute inset-0 opacity-90" style={plaidStyle} />
            <div className="relative h-full flex items-center justify-center">
              <div className="text-center">
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
          </div>
        }
        title="Plaid Jacket"
        tagline="+ Flip Side"
        subtitle="Spark Industries out of Tumwater — Pacific Northwest indoor flower, in-house BHO concentrates, and a separate vape brand (Flip Side) all under one roof."
        pills={[
          { kind: "muted", label: "Tumwater, WA", dot: true },
          { kind: "muted", label: "Tier 2 Producer / Processor" },
          { kind: "filled", label: `${brand.activeSkus} on our shelf` },
        ]}
        ctas={[
          { href: "/menu", label: "Order Plaid Jacket for Pickup →", variant: "primary" },
          {
            href: "https://www.plaidjacket.com/",
            label: "Visit plaidjacket.com ↗",
            variant: "secondary",
            external: true,
          },
        ]}
      >
        {/* Plaid pattern overlay — the brand IS this pattern. */}
        <div aria-hidden className="absolute inset-0 opacity-40" style={plaidStyle} />
        {/* Subtle red radial highlight in the upper-right. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at top right, rgba(196,63,63,0.18), transparent 60%)`,
          }}
        />
      </BrandHero>

      {/* STORY */}
      <BrandStory
        palette={PALETTE}
        eyebrow="Our Story"
        headline="Real-estate guys, an electrical engineer, and a building they wired for plants."
      >
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
      </BrandStory>

      {/* SUB-BRANDS — per-brand (uses inline-style to swap active-state colors) */}
      <section className="bg-stone-50 border-y border-stone-200 relative">
        {/* Plaid divider strip across the top edge */}
        <div aria-hidden className="absolute top-0 inset-x-0 h-1.5 opacity-90" style={plaidStyle} />
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
                    if (!active && !disabled) e.currentTarget.style.borderColor = BRAND_RED;
                  }}
                  onMouseLeave={(e) => {
                    if (!active && !disabled) e.currentTarget.style.borderColor = "";
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
                      active ? "" : count > 0 ? "text-emerald-700" : "text-stone-400"
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

      {/* APPROACH — "How They Make It" 4-card grid (per-brand: plaid-overlay variant) */}
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

      {/* PRODUCTS — accent classes literal at the call site */}
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
            accentBg="bg-[#1e3a4d]"
            accentBorder="border-[#c43f3f]"
            accentHoverBorder="hover:border-[#c43f3f]"
            accentText="text-[#c43f3f]"
            accentHoverText="hover:text-[#e06363]"
            accentGlow="hover:shadow-[#c43f3f]/30"
          />
        </div>
      </section>

      {/* ABOUT — Q&A (FAQPage JSON-LD inside shell) */}
      <BrandAboutQA palette={PALETTE} brandName="Spark Industries" items={ABOUT_QA} />

      {/* CONNECT — links + merged pickup card */}
      <BrandConnectBlock
        palette={PALETTE}
        brandName="Spark Industries"
        links={[
          { label: "Flower", href: "https://www.plaidjacket.com/", text: "plaidjacket.com" },
          { label: "Vapes", href: "https://www.smokeflipside.com/", text: "smokeflipside.com" },
          {
            label: "Parent",
            href: "https://www.sparkindustrieswa.com/",
            text: "sparkindustrieswa.com",
          },
          { label: "HQ", text: "Tumwater, WA" },
        ]}
        pickup={{
          eyebrow: `Pickup at ${STORE.name}`,
          headline: `${brand.activeSkus} Spark Industries product${brand.activeSkus !== 1 ? "s" : ""} ready in ${STORE.address.city}`,
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

      <StickyOrderCTA label="Order Plaid Jacket →" />
    </div>
  );
}
