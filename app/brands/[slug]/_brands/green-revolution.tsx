"use client";

import { useState } from "react";
import Image from "next/image";
import type { VendorBrand } from "@/lib/db";
import { STORE } from "@/lib/store";
import { PaginatedProductsGrid } from "./PaginatedProductsGrid";
import { StickyOrderCTA } from "./StickyOrderCTA";
import { BrandHero } from "./_shell/BrandHero";
import { BrandStory } from "./_shell/BrandStory";
import { BrandAboutQA } from "./_shell/BrandAboutQA";
import { BrandConnectBlock } from "./_shell/BrandConnectBlock";
import type { BrandPalette } from "./_shell/types";

// About-Green-Revolution Q&A — facts verified across greenrevolution.com
// + Top Shelf Data + Headset + CB Insights. FAQPage JSON-LD emitted from
// BrandAboutQA. WAC 314-55-155 critical: copy stays product-info; never
// "treats" / "cures" / "relieves pain". Brand's own marketing voice OK.
const ABOUT_QA = [
  {
    q: "Where is Green Revolution made?",
    a: "Poulsbo, Washington — at 22277 Stottlemeyer Rd NE, just across Puget Sound from Seattle on the Kitsap Peninsula. They've been operating there as a tier-3 producer-processor and are one of the larger Washington cannabis manufacturers by SKU count.",
  },
  {
    q: "What is UNET and why does it matter?",
    a: "UNET is Green Revolution's proprietary nanotechnology — ultrasonic nano emulsification — that breaks cannabis oil into water-soluble molecules. Practical impact for the customer: the WildSide drinks, Doozies gummies, and water-based tinctures kick in around 10-15 minutes instead of the 60-90 minutes typical of oil-based edibles. Onset is faster and more predictable.",
  },
  {
    q: "What are all the Green Revolution product lines?",
    a: "WildSide drinks (12oz/17oz bottles, Fizz cans, and 2oz Max shots) for beverages. Dopio is the cannabis coffee shot line. Doozies is the gummy family — standard, Plus (with functional ingredients like Lion's Mane and Ashwagandha), Mini (smaller serving), Elevate (1:1 hybrid), and CBD-dominant. Tinctures cover Anytime, Nighttime, Beauty Sleep, Dream Drops, Happiest Self, Journey, Paradise, and Bella & Max Plus (pet, salmon-oil base). Solace and Muscle Melt are the topicals.",
  },
  {
    q: "Are Green Revolution products made with organic cannabis?",
    a: "Their cultivation is Clean Green Certified — the cannabis-industry equivalent of USDA Organic, since cannabis can't legally carry the USDA label federally. Clean Green requires third-party audited organic-equivalent practices: no synthetic pesticides, sustainable nutrient inputs, soil-quality testing.",
  },
];

// Per-brand custom layout — Green Revolution.
// Palette: emerald green + warm cream/butter. Matches Green Revolution's
// own brand identity (their name + logo are forest-green).
const PALETTE: BrandPalette = {
  dark: "#0e5c3a", // emerald green
  dark2: "#0e5c3a", // same
  dark3: "#1c8a55", // gradient end-stop (lighter emerald)
  accent: "#f4e8c1", // warm cream
  accentMuted: "#faf3d8", // hover state
};

const GR_LOGO = "https://greenrevolution.com/wp-content/uploads/2024/07/green-revolution.svg";
const GR_HERO =
  "https://greenrevolution.com/wp-content/uploads/2023/12/doozies-newsletter.jpg";

const SUB_BRANDS: Array<{ name: string; tag: string; line: string; matchToken: string }> = [
  {
    name: "WildSide Max",
    tag: "Drink Shots",
    line: "2oz fast-acting shots — 100mg THC plus minor cannabinoids (CBN, CBG, CBC) per bottle. Onset in 10-15 minutes via UNET water-soluble emulsion.",
    matchToken: "Wildside Max",
  },
  {
    name: "WildSide Fizz",
    tag: "Carbonated Drinks",
    line: "Carbonated cannabis sodas — Blackberry Lemonade, Summer Peach, Sweet Watermelon, Tropical Mango. THC + minor cannabinoid ratios for different vibes.",
    matchToken: "Fizz",
  },
  {
    name: "WildSide",
    tag: "Beverages",
    line: "Full-size 12oz and 17oz beverages with antioxidants and electrolytes. The flagship UNET drink line — true cannabis hydration.",
    matchToken: "Wildside",
  },
  {
    name: "Dopio",
    tag: "Cannabis Coffee",
    line: "Cannabis-infused coffee shots — 1:1 THC:CBG plus 100mg caffeine. Caramel, French Vanilla, and Mocha.",
    matchToken: "Dopio",
  },
  {
    name: "Doozies Plus",
    tag: "Functional Gummies",
    line: "Gummies with functional add-ins — Lion's Mane, Ashwagandha, Maca, Chamomile, Passion Flower. THC paired with intentional botanical ingredients.",
    matchToken: "Doozies Plus",
  },
  {
    name: "Mini Doozies",
    tag: "Low-Dose Gummies",
    line: "Smaller-serving gummies for customers who want a lower starting dose or to take a single piece without going halfsies.",
    matchToken: "Mini Doozies",
  },
  {
    name: "Doozies",
    tag: "Gummies",
    line: "The flagship gummy line — UNET fast-acting, all natural, vegan. THC, CBN, CBD, CBG, CBC across different ratios. Watermelon, Marionberry, Blue Raspberry, Pineapple, more.",
    matchToken: "Doozies",
  },
  {
    name: "Tinctures",
    tag: "Tinctures",
    line: "Water-based UNET tinctures — Anytime, Nighttime, Beauty Sleep, Dream Drops, Happiest Self, Journey, Paradise. Plus the Bella & Max Plus pet line in salmon oil.",
    matchToken: "Tincture",
  },
  {
    name: "Solace + Muscle Melt",
    tag: "Topicals",
    line: "Solace Relief Cream (100:1 CBD:THC and 5:1 CBD:CBN) and Muscle Melt Gel — non-intoxicating topicals for daily use.",
    matchToken: "Solace",
  },
];

const APPROACH_CARDS = [
  {
    emoji: "🌱",
    title: "Cultivation",
    body: "Clean Green Certified — third-party audited organic-equivalent. No synthetic pesticides, sustainable nutrient inputs, soil-quality testing.",
  },
  {
    emoji: "🔬",
    title: "UNET Emulsion",
    body: "Ultrasonic nano emulsification breaks cannabis oil into water-soluble molecules. The reason a Doozies gummy or WildSide shot kicks in 10-15 min instead of 60-90.",
  },
  {
    emoji: "🥤",
    title: "Beverages",
    body: "WildSide, WildSide Fizz, WildSide Max shots, and Dopio coffee shots. Antioxidants, electrolytes, and minor cannabinoids built into every formulation.",
  },
  {
    emoji: "🧴",
    title: "Topicals + Pet",
    body: "Solace Relief Cream and Muscle Melt Gel for daily skin-on use. Bella & Max Plus is the salmon-oil pet tincture — a customer favorite for older dogs.",
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

export default function GreenRevolutionBrandPage({
  brand,
  products,
}: {
  brand: VendorBrand;
  products: Product[];
}) {
  const [activeSubBrand, setActiveSubBrand] = useState<string | null>(null);

  const subBrandCounts = SUB_BRANDS.reduce<Record<string, number>>((acc, sb) => {
    const needle = sb.matchToken.toLowerCase();
    acc[sb.name] = products.filter((p) => (p.name ?? "").toLowerCase().includes(needle)).length;
    return acc;
  }, {});

  return (
    <div className="bg-stone-50">
      <BrandHero
        palette={PALETTE}
        crumb="Green Revolution"
        logoUrl={GR_LOGO}
        logoAlt="Green Revolution logo"
        title="Green Revolution"
        tagline="Fast-acting, by design."
        subtitle="Poulsbo, WA — Clean Green Certified cannabis. WildSide drinks, Doozies gummies, water-based tinctures, and topicals. UNET nanotechnology means onset in 10-15 minutes, not an hour and a half."
        pills={[
          { kind: "muted", label: "Poulsbo, WA", dot: true },
          { kind: "muted", label: "Clean Green Certified" },
          { kind: "filled", label: `${brand.activeSkus} on our shelf` },
        ]}
        ctas={[
          { href: "/menu", label: "Order Green Revolution for Pickup →", variant: "primary" },
          {
            href: "https://greenrevolution.com/",
            label: "Visit greenrevolution.com ↗",
            variant: "secondary",
            external: true,
          },
        ]}
      >
        <Image
          src={GR_HERO}
          alt=""
          fill
          priority
          unoptimized
          aria-hidden
          className="object-cover opacity-25"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </BrandHero>

      <BrandStory palette={PALETTE} eyebrow="Our Story" headline="Made in Poulsbo. Engineered for fast onset.">
        <p>
          Green Revolution operates out of Poulsbo, Washington — a Kitsap Peninsula
          facility just across Puget Sound from Seattle. They&apos;re Clean Green
          Certified, which is the cannabis-industry equivalent of USDA Organic
          (cannabis can&apos;t legally carry the USDA label, but Clean Green covers the
          same third-party audited organic-equivalent practices: no synthetic
          pesticides, sustainable inputs, real soil testing).
        </p>
        <p>
          Their differentiator is <strong>UNET</strong> — ultrasonic nano emulsification
          technology. The technical version: cannabis oil and water don&apos;t mix, so
          traditional edibles route the THC through your stomach and liver, which is
          why a gummy takes an hour to kick in. UNET breaks the oil into water-soluble
          molecules small enough to absorb sublingually and through the stomach lining
          quickly. Practical version: the WildSide drinks, Doozies gummies, and
          water-based tinctures hit in <strong>10 to 15 minutes</strong> instead of 60
          to 90.
        </p>
        <p>
          We carry Green Revolution at {STORE.name} because the catalog spans almost
          every format a customer might walk in asking for — gummies, drinks,
          tinctures, topicals, even a pet tincture (Bella &amp; Max Plus, salmon oil
          base) — and the fast-onset story is real and verifiable. When someone wants
          a discreet, no-smell option with predictable timing, this is the brand we
          hand them.
        </p>
      </BrandStory>

      <section className="bg-stone-50 border-y border-stone-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: PALETTE.dark }}
              >
                The Catalog
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
                Nine lines, one Poulsbo facility
              </h2>
            </div>
            <p className="text-sm text-stone-500 max-w-md">
              Tap a card to filter the live menu below to just that line. Tap again to clear.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUB_BRANDS.map((sb) => {
              const count = subBrandCounts[sb.name] ?? 0;
              const active = activeSubBrand === sb.matchToken;
              const disabled = count === 0;
              return (
                <button
                  key={sb.name}
                  type="button"
                  onClick={() => {
                    if (disabled) return;
                    setActiveSubBrand(active ? null : sb.matchToken);
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
                      ? "bg-[#0e5c3a] border-[#f4e8c1] shadow-lg ring-2 ring-[#f4e8c1]/40"
                      : disabled
                        ? "bg-stone-50 border-stone-100 opacity-50 cursor-not-allowed"
                        : "bg-white border-stone-200 hover:border-[#f4e8c1] hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <h3 className={`font-extrabold text-lg leading-tight ${active ? "text-white" : "text-stone-900"}`}>
                      {sb.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${
                        active ? "bg-[#f4e8c1] text-[#0e5c3a]" : "bg-[#f4e8c1]/40 text-[#0e5c3a]"
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
                      active ? "text-[#f4e8c1]" : count > 0 ? "text-emerald-700" : "text-stone-400"
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

      {/* APPROACH — "How They Make It" 4-card grid (per-brand) */}
      <section className="bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: PALETTE.dark }}
          >
            How They Make It
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-10 leading-tight max-w-3xl">
            Clean cultivation, water-soluble formulation, predictable onset.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {APPROACH_CARDS.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl bg-stone-50 border border-stone-200 overflow-hidden hover:shadow-md transition-all"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-[#cce8d6] to-[#f4e8c1] flex items-center justify-center text-6xl">
                  <span aria-hidden>{c.emoji}</span>
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
            style={{ color: PALETTE.dark }}
          >
            On Our Shelf
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-2 leading-tight">
            Green Revolution at {STORE.name}
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
            accentBg="bg-[#0e5c3a]"
            accentBorder="border-[#f4e8c1]"
            accentHoverBorder="hover:border-[#f4e8c1]"
            accentText="text-[#0e5c3a]"
            accentHoverText="hover:text-[#1c8a55]"
            accentGlow="hover:shadow-[#f4e8c1]/30"
          />
        </div>
      </section>

      <BrandAboutQA palette={PALETTE} brandName="Green Revolution" items={ABOUT_QA} />

      <BrandConnectBlock
        palette={PALETTE}
        brandName="Green Revolution"
        links={[
          { label: "Web", href: "https://greenrevolution.com/", text: "greenrevolution.com" },
          {
            label: "Clean Green",
            href: "https://greenrevolution.cleangreencertified.com/",
            text: "Clean Green Certified profile",
          },
          { label: "HQ", text: "22277 Stottlemeyer Rd NE, Poulsbo, WA" },
        ]}
        pickup={{
          eyebrow: `Pickup at ${STORE.name}`,
          headline: `${brand.activeSkus} Green Revolution product${brand.activeSkus !== 1 ? "s" : ""} ready in ${STORE.address.city}`,
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

      <StickyOrderCTA label="Order Green Revolution →" />
    </div>
  );
}
