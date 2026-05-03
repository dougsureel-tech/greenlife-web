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

// About-Ooowee Q&A — facts verified across Karen Hsin's design portfolio
// (karenhsin.com/ooowee), IG @oohweeoohwee bio, Headset.io brand page,
// Top Shelf Data. Following Doug's standing rule: if you can't verify a
// claim, drop it. FAQPage JSON-LD emitted from BrandAboutQA.
const ABOUT_QA = [
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

// Per-brand custom layout — Ooowee (TTL Holdings).
// Palette: electric violet + cream yellow. Loud, exclamatory — the
// "ooowee!" expression the brand is named after.
const PALETTE: BrandPalette = {
  dark: "#0f0620", // deepest purple-black (hero bg)
  dark2: "#1a0b2e", // gradient mid + section bg
  dark3: "#7c3aed", // electric violet — gradient end-stop
  accent: "#f4d35e", // cream yellow
  accentMuted: "#fbe892", // hover
};

const BRAND_DARK = PALETTE.dark2!;
const BRAND_PURPLE = PALETTE.dark3!;
const BRAND_YELLOW = PALETTE.accent;

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

const APPROACH_CARDS = [
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
];

// CSS-rendered cloud-dot pattern — speech-bubble feel without an asset.
const cloudDotsStyle: React.CSSProperties = {
  backgroundImage: `radial-gradient(circle at 1px 1px, rgba(244,211,94,0.5) 1px, transparent 1.5px)`,
  backgroundSize: "16px 16px",
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

export default function OoweeBrandPage({
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
      {/* HERO — speech-bubble OOOWEE wordmark logo + cloud-dots decoration */}
      <BrandHero
        palette={PALETTE}
        crumb="Ooowee"
        logoNode={
          <div
            className="absolute inset-0 rounded-[2rem] shadow-2xl flex items-center justify-center overflow-hidden"
            style={{
              backgroundColor: BRAND_YELLOW,
              borderBottomLeftRadius: "0.5rem", // speech-bubble tail
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
        }
        title="Ooowee"
        tagline="says it for you."
        subtitle="Washington-state pre-rolls, infused 5-packs, sugar wax and disposables — the brand whose name is the sound you make when something actually hits. TTL Holdings out of Seattle."
        pills={[
          { kind: "muted", label: "Seattle, WA", dot: true },
          { kind: "muted", label: "Tier 1 Producer / Processor" },
          { kind: "filled", label: `${brand.activeSkus} on our shelf` },
        ]}
        ctas={[
          { href: "/menu", label: "Order Ooowee for Pickup →", variant: "primary" },
          {
            href: "https://www.instagram.com/oohweeoohwee/",
            label: "Follow @oohweeoohwee ↗",
            variant: "secondary",
            external: true,
          },
        ]}
      >
        <div aria-hidden className="absolute inset-0 opacity-30" style={cloudDotsStyle} />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at top right, rgba(244,211,94,0.18), transparent 60%)`,
          }}
        />
      </BrandHero>

      <BrandStory palette={PALETTE} eyebrow="Our Story" headline="The brand named after the sound you make.">
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
      </BrandStory>

      <section className="bg-stone-50 border-y border-stone-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: BRAND_PURPLE }}
              >
                The Lineup
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
                Eight strains in our cooler
              </h2>
            </div>
            <p className="text-sm text-stone-500 max-w-md">
              Tap any to filter the products grid below. Tap again to clear.
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
                      ? "bg-[#1a0b2e] border-[#f4d35e] shadow-lg ring-2 ring-[#f4d35e]/40"
                      : disabled
                        ? "bg-stone-50 border-stone-100 opacity-50 cursor-not-allowed"
                        : "bg-white border-stone-200 hover:border-[#7c3aed] hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <h3 className={`font-extrabold text-lg leading-tight ${active ? "text-white" : "text-stone-900"}`}>
                      {sb.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${
                        active ? "bg-[#f4d35e] text-[#1a0b2e]" : "bg-[#f4d35e]/30 text-[#1a0b2e]"
                      }`}
                    >
                      {sb.tag}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${active ? "text-stone-200" : "text-stone-600"}`}>
                    {sb.line}
                  </p>
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-wider mt-3 ${
                      active ? "text-[#f4d35e]" : count > 0 ? "text-emerald-700" : "text-stone-400"
                    }`}
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
            style={{ color: BRAND_PURPLE }}
          >
            How They Make It
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-10 leading-tight max-w-3xl">
            Pre-rolls first, concentrates next, vapes alongside.
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
            accentBg="bg-[#7c3aed]"
            accentBorder="border-[#f4d35e]"
            accentHoverBorder="hover:border-[#7c3aed]"
            accentText="text-[#7c3aed]"
            accentHoverText="hover:text-[#a78bfa]"
            accentGlow="hover:shadow-[#7c3aed]/30"
          />
        </div>
      </section>

      <BrandAboutQA palette={PALETTE} brandName="Ooowee" items={ABOUT_QA} />

      <BrandConnectBlock
        palette={PALETTE}
        brandName="Ooowee"
        links={[
          {
            label: "Instagram",
            href: "https://www.instagram.com/oohweeoohwee/",
            text: "@oohweeoohwee",
          },
          { label: "X / Twitter", href: "https://x.com/theooowee", text: "@theOoowee" },
          { label: "Site", href: "https://oowee.co", text: "oowee.co (launching)" },
          { label: "Licensee", text: "TTL Holdings LLC · Seattle, WA" },
        ]}
        pickup={{
          eyebrow: `Pickup at ${STORE.name}`,
          headline: `${brand.activeSkus} Ooowee product${brand.activeSkus !== 1 ? "s" : ""} ready in ${STORE.address.city}`,
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

      <StickyOrderCTA
        label="Order Ooowee →"
        bgClass="bg-[#7c3aed]"
        textClass="text-[#f4d35e]"
        hoverClass="hover:bg-[#6d28d9]"
      />
    </div>
  );
}
