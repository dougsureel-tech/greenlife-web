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

// About-NWCS Q&A — facts independently verified across the brand's own
// site + Marijuana Venture / Carter's Cannabis blog / LinkedIn for
// founders. FAQPage JSON-LD emitted from BrandAboutQA so schema can't
// drift from visible content. No medical claims (WAC 314-55-155).
const ABOUT_QA = [
  {
    q: "Where is Northwest Cannabis Solutions made?",
    a: "Olympia, Washington — at their facility on Lathrop Industrial Drive SW. Production has been running there since February 2015.",
  },
  {
    q: "Who founded NWCS?",
    a: "Co-founders Leo Gontmakher and Vlad Orlovskii started the company in 2014. The Olympia facility came online the following year and has been in continuous operation since.",
  },
  {
    q: "How many brands does NWCS run?",
    a: "Sixteen in-house brands across more than three hundred SKUs — flower, pre-rolls, vapes, edibles, concentrates, capsules, and topicals. Legends, Private Reserve, Magic Kitchen, Mini Budz, Evergreen, EZ Vape, GoldLine, and THCaps are the lines you'll see on our shelf most often.",
  },
  {
    q: "What makes NWCS different from other Washington producers?",
    a: "Scale plus consistency. They're one of Washington's largest producer-processors and they run the whole stack — cultivation, extraction, edibles kitchen, and packaging — all in-house. The result on the floor is that the flower comes in cured properly, the carts hit the way they should, and the edibles dose exactly the way the package says they will.",
  },
];

// Per-brand custom layout — Northwest Cannabis Solutions (NWCS).
// Palette: deep forest + tobacco gold. The longest-running NWCS visual
// identity from nwcs425.com.
const PALETTE: BrandPalette = {
  dark: "#0e2a1f", // deep forest
  dark2: "#0e2a1f", // gradient mid-stop (same dark)
  dark3: "#143b2a", // gradient end-stop — slightly lighter forest
  accent: "#c8b06b", // tobacco gold
  accentMuted: "#d6c084", // hover state
};

const NWCS_LOGO = "https://www.nwcs425.com/assets/images/logo.svg";
const NWCS_HERO_WIDE =
  "https://www.nwcs425.com/files/image/5cb6061020a71/display/nwcs-callout-wide.jpg";
const NWCS_CALLOUT_EDIBLES =
  "https://www.nwcs425.com/files/image/645ba5a553c0b/callout/Marma_WA_Candies-2023Edited.png";
const NWCS_CALLOUT_CONCENTRATES =
  "https://www.nwcs425.com/files/image/5cb6060dc6221/callout/AdobeStock_145830355.jpeg";
const NWCS_CALLOUT_FLOWER =
  "https://www.nwcs425.com/files/image/5c5b998280245/callout/pot_leaf.png";
const NWCS_CALLOUT_TOPICALS =
  "https://www.nwcs425.com/files/image/5e852c4a693c9/callout/WA_Salve_50ml_18to1.jpg";

const SUB_BRANDS: Array<{ name: string; tag: string; line: string }> = [
  {
    name: "Legends",
    tag: "Flower",
    line: "Legendary strains at a fair price — the everyday workhorse line.",
  },
  {
    name: "Private Reserve",
    tag: "Top-Shelf Flower",
    line: "Rarer cuts, hand-selected for the case. When you want the good stuff.",
  },
  {
    name: "Magic Kitchen",
    tag: "Edibles",
    line: "Cookies, Chewees, Pebbles, Marmas, Koko Gemz — Washington edible classics.",
  },
  {
    name: "Mini Budz",
    tag: "Pre-Rolls",
    line: "Small flower nugs rolled tight. Great for on-the-go.",
  },
  {
    name: "Evergreen",
    tag: "Vape Carts",
    line: "510-thread cartridges with full-spectrum extracts.",
  },
  { name: "EZ Vape", tag: "Disposables", line: "Single-use, no charging, no fuss." },
  {
    name: "GoldLine",
    tag: "Concentrates",
    line: "Premium extracts pulled from in-house grown flower.",
  },
  {
    name: "THCaps",
    tag: "Capsules",
    line: "Pre-dosed capsules for predictable, smoke-free dosing.",
  },
];

const APPROACH_CARDS = [
  {
    img: NWCS_CALLOUT_FLOWER,
    title: "Flower",
    body: "Indoor cultivation in a purpose-built Olympia facility. Strain library spans Legends staples to Private Reserve rarities.",
  },
  {
    img: NWCS_CALLOUT_CONCENTRATES,
    title: "Concentrates",
    body: "Hydrocarbon and CO₂ extracts produced in-house from their own flower. GoldLine is the premium tier.",
  },
  {
    img: NWCS_CALLOUT_EDIBLES,
    title: "Edibles",
    body: "Magic Kitchen is one of WA's longest-running edible lines — Marmas, Pebbles, Cookies, Koko Gemz. Lab-tested doses.",
  },
  {
    img: NWCS_CALLOUT_TOPICALS,
    title: "Topicals & Tinctures",
    body: "Topicals, tinctures, and capsules in the smoke-free formats. THCaps and salves at varied ratios.",
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

export default function NWCSBrandPage({
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
      {/* HERO — facility photo + dot pattern in the decoration slot */}
      <BrandHero
        palette={PALETTE}
        crumb="Northwest Cannabis Solutions"
        logoUrl={NWCS_LOGO}
        logoAlt="Northwest Cannabis Solutions logo"
        title="Northwest Cannabis"
        tagline="Solutions"
        subtitle="One of Washington's largest producer-processors. Olympia-built since 2014, running sixteen brands across flower, pre-rolls, vapes, edibles, and concentrates."
        pills={[
          { kind: "muted", label: "Olympia, WA", dot: true },
          { kind: "muted", label: "Producer / Processor" },
          { kind: "filled", label: `${brand.activeSkus} on our shelf` },
        ]}
        ctas={[
          { href: "/menu", label: "Order NWCS for Pickup →", variant: "primary" },
          {
            href: "https://www.nwcs425.com/",
            label: "Visit nwcs425.com ↗",
            variant: "secondary",
            external: true,
          },
        ]}
      >
        <Image
          src={NWCS_HERO_WIDE}
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

      {/* STORY */}
      <BrandStory
        palette={PALETTE}
        eyebrow="Our Story"
        headline="Built in Olympia. Stocked across Washington."
      >
        <p>
          NWCS started in 2014 as a conversation between two co-founders, Leo Gontmakher and
          Vlad Orlovskii. The goal was simple — build the kind of production-and-processing
          operation Washington didn&apos;t have yet. Their facility on Lathrop Industrial Drive
          came online in February 2015 and has been running ever since.
        </p>
        <p>
          Today they&apos;re one of the state&apos;s largest producer-processors, with{" "}
          <strong>sixteen in-house brands</strong> and over three hundred SKUs spanning every
          category that lives behind a Washington counter — flower, pre-rolls, vapes, edibles,
          concentrates, capsules, and topicals. If you&apos;ve eaten a Marma in this state,
          you&apos;ve eaten an NWCS edible.
        </p>
        <p>
          We carry NWCS at {STORE.name} because the consistency holds up shift after shift.
          The flower comes in cured properly, the carts hit the way they should, and the
          edibles dose exactly the way the package says they will. That&apos;s the part that
          matters when our budtenders are recommending something to a regular.
        </p>
      </BrandStory>

      {/* SUB-BRANDS — per-brand */}
      <section className="bg-stone-50 border-y border-stone-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: PALETTE.dark }}
              >
                The Family
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
                Eight brands you&apos;ll see in our case
              </h2>
            </div>
            <p className="text-sm text-stone-500 max-w-md">
              NWCS runs sixteen total — these are the ones that move at Green Life. Ask a budtender
              if you want a sample of what each one does.
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
                      ? "bg-[#0e2a1f] border-[#c8b06b] shadow-lg ring-2 ring-[#c8b06b]/40"
                      : disabled
                        ? "bg-stone-50 border-stone-100 opacity-50 cursor-not-allowed"
                        : "bg-white border-stone-200 hover:border-[#c8b06b] hover:shadow-md hover:-translate-y-0.5"
                  }`}
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
                        active
                          ? "bg-[#c8b06b] text-[#0e2a1f]"
                          : "bg-[#c8b06b]/30 text-[#0e2a1f]"
                      }`}
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
                        ? "text-[#c8b06b]"
                        : count > 0
                          ? "text-emerald-700"
                          : "text-stone-400"
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

      {/* APPROACH — "How They Make It" 4-card grid (per-brand: image-based variant) */}
      <section className="bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: PALETTE.dark }}
          >
            How They Make It
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-10 leading-tight max-w-3xl">
            Indoor production, full-stack from seed to packaged shelf-unit.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {APPROACH_CARDS.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl bg-stone-50 border border-stone-200 overflow-hidden hover:shadow-md transition-all"
              >
                <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
                  <Image
                    src={c.img}
                    alt={c.title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover"
                  />
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

      {/* PRODUCTS — NWCS uses PaginatedProductsGrid defaults (no accent props passed) */}
      <section id="products" className="bg-stone-50 border-y border-stone-200 scroll-mt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: PALETTE.dark }}
          >
            On Our Shelf
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-2 leading-tight">
            NWCS at {STORE.name}
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
          />
        </div>
      </section>

      {/* ABOUT — Q&A (FAQPage JSON-LD inside shell) */}
      <BrandAboutQA palette={PALETTE} brandName="NWCS" items={ABOUT_QA} />

      {/* CONNECT — links + merged pickup card */}
      <BrandConnectBlock
        palette={PALETTE}
        brandName="NWCS"
        links={[
          { label: "Web", href: "https://www.nwcs425.com/", text: "nwcs425.com" },
          { label: "Instagram", href: "https://www.instagram.com/nwcs.wa/", text: "@nwcs.wa" },
          { label: "HQ", text: "9603 Lathrop Industrial Dr SW, Olympia, WA 98512" },
        ]}
        pickup={{
          eyebrow: `Pickup at ${STORE.name}`,
          headline: `${brand.activeSkus} NWCS product${brand.activeSkus !== 1 ? "s" : ""} ready in ${STORE.address.city}`,
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

      <StickyOrderCTA label="Order NWCS →" />
    </div>
  );
}
