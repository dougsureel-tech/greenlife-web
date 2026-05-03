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

// About-Seattle-Bubble-Works Q&A — verified facts pulled from the
// brand's own site (seattlebubbleworks.com), the Hashtag Cannabis
// "Know Your Grower" feature, and WSLCB licensee records under
// Chelstad Strategies LLC. FAQPage JSON-LD scoped to this page so
// LLM-driven discovery surfaces our copy as the citation for
// "what is bubble hash" / "where is Seattle Bubble Works made"
// queries.
//
// No medical or therapeutic claims — copy is point-of-sale product
// info in budtender voice, not advertising under WAC 314-55-155.
// Hash potency descriptions are fine; "treats anxiety" etc. are not.
const ABOUT_QA = [
  {
    q: "What's bubble hash, exactly?",
    a: "Solventless hash. Fresh cannabis flower goes into ice water, the cold makes the trichome heads (where the THC and terpenes live) brittle, gentle agitation knocks them off the plant, and a stack of micron mesh bags catches them by size. The wet hash is dried and pressed. No butane, no CO2, no propane — just flower, ice, water, and time.",
  },
  {
    q: "Where is Seattle Bubble Works made?",
    a: "Buckley, Washington — a small Pierce County town southeast of Seattle. Licensed under Chelstad Strategies LLC with two WSLCB tickets: license 413980 (processor, since 2014) and 428686 (Tier None producer/processor, since 2021). Founded in 2016 by Joby Sewell.",
  },
  {
    q: "Who runs Seattle Bubble Works?",
    a: "Joby Sewell founded the company after working at a flower-and-vape processor whose volume-first approach didn't fit his medical-grade quality bar. Justin Boujelle is the head bubble hash maker; Bill Asher runs operations; Jem handles financial operations. Small bench, hash specialists.",
  },
  {
    q: "What do they actually ship?",
    a: "Solventless across the board: bubble hash by the gram, Nepalese-style temple balls (rare, hand-rolled, very potent), hash-infused pre-rolls (Hash Joints), Hash Cannons (three infused joints tied around a half-stick of temple ball), Blunt Bombs (Futurola blunt cones with a full-gram temple ball stick down the middle), party-pack joint jars, full-melt rosin, and Hashtillate (CBD isolate + bubble hash blend).",
  },
];

// Per-brand custom layout — Seattle Bubble Works (Chelstad Strategies LLC).
// Palette is arctic-indigo + ice-water cyan, distinct from the 16+ prior
// dialed-in pages — the brand identity is literally ice water + bubble hash,
// so the palette echoes that. Standardized hero/story/Q&A/connect chrome
// flows from `_shell/*`; sub-brand grid + hero decoration stay per-brand
// because their shape varies brand-to-brand.
const PALETTE: BrandPalette = {
  dark: "#0b1d3a", // primary brand dark — arctic indigo
  dark2: "#142d56", // hero gradient mid-stop
  dark3: "#3a8fb7", // hero gradient end-stop + chip-border accent
  accent: "#a8e0f5", // bright ice-water cyan — text-on-dark, active bg
  accentMuted: "#c5ecf9", // hover state for accent CTAs
};

const SBW_LOGO =
  "https://seattlebubbleworks.com/wp-content/uploads/2020/04/SBW-2020-logo-Concentrated-600.png";

// Sub-brand cards drawn from Seattle Bubble Works' own product taxonomy
// (seattlebubbleworks.com/products). Click a card → filters the products
// grid below by product-name substring. Hash brands break out by FORMAT
// (bubble hash vs temple ball vs rosin vs hash-infused joint) rather
// than strain line, which is what customers actually shop by.
const SUB_BRANDS: Array<{
  name: string;
  tag: string;
  line: string;
  matchToken: string;
  matchKind?: "name" | "category";
}> = [
  {
    name: "Bubble Hash",
    tag: "Solventless",
    line: "The headline product — strain-specific ice-water hash, sifted through micron mesh, sold by the gram. The starting point of the whole catalog.",
    matchToken: "Bubble Hash",
  },
  {
    name: "Temple Balls",
    tag: "Hand-Rolled",
    line: "Nepalese-style hash balls. Bubble hash slow-cured and hand-rolled into a solid sphere — rare, time-intensive, exceptionally potent.",
    matchToken: "Temple Ball",
  },
  {
    name: "Hash Joints",
    tag: "Pre-Rolls",
    line: "Cannabis flower coated and rolled with their solventless bubble hash. Hash-infused pre-rolls, no kief filler — the real thing.",
    matchToken: "Hash",
  },
  {
    name: "Hash Cannons",
    tag: "Specialty",
    line: "Three hash-infused joints lashed together with hemp wick around a half-gram of temple ball. Built for sharing.",
    matchToken: "Cannon",
  },
  {
    name: "Blunt Bombs",
    tag: "Specialty",
    line: "Three Futurola blunt cones tied around a full-gram temple ball stick down the center. The maximalist option.",
    matchToken: "Blunt",
  },
  {
    name: "Rosin",
    tag: "Full-Melt",
    line: "Solventless rosin pressed from the bubble hash itself — heat and pressure only. Full-melt hash oil for the dab side of the menu.",
    matchToken: "Rosin",
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

export default function SeattleBubbleWorksBrandPage({
  brand,
  products,
}: {
  brand: VendorBrand;
  products: Product[];
}) {
  const [activeSubBrand, setActiveSubBrand] = useState<string | null>(null);

  const subBrandCounts = SUB_BRANDS.reduce<Record<string, number>>((acc, sb) => {
    const needle = sb.matchToken.toLowerCase();
    acc[sb.name] = products.filter((p) => {
      if (sb.matchKind === "category") {
        return (p.category ?? "").toLowerCase().includes(needle);
      }
      return (p.name ?? "").toLowerCase().includes(needle);
    }).length;
    return acc;
  }, {});

  return (
    <div className="bg-slate-50">
      {/* HERO — standardized chrome, per-brand decoration in children */}
      <BrandHero
        palette={PALETTE}
        crumb="Seattle Bubble Works"
        logoUrl={SBW_LOGO}
        logoAlt="Seattle Bubble Works logo"
        title="Seattle Bubble Works"
        tagline="Flower. Ice. Water. That's it."
        subtitle="Pacific Northwest hash specialists since 2016. Solventless ice-water hash, Nepalese temple balls, hash-infused joints, and full-melt rosin — pressed and rolled in Buckley, WA."
        pills={[
          { kind: "muted", label: "Buckley, WA", dot: true },
          { kind: "muted", label: "Solventless / Ice-Water" },
          { kind: "filled", label: `${brand.activeSkus} on our shelf` },
        ]}
        ctas={[
          { href: "/menu", label: "Order SBW Hash for Pickup →", variant: "primary" },
          {
            href: "https://seattlebubbleworks.com/",
            label: "Visit seattlebubbleworks.com ↗",
            variant: "secondary",
            external: true,
          },
        ]}
      >
        {/* Frosted-water dot pattern — evokes ice crystals + bubble hash
            without leaning on a hero image we don't have a stable URL for.
            Cheap, scalable, on-brand. */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 30%, #a8e0f5 1.5px, transparent 1.5px), radial-gradient(circle at 75% 70%, #a8e0f5 1px, transparent 1px)",
            backgroundSize: "32px 32px, 24px 24px",
          }}
        />
      </BrandHero>

      {/* STORY */}
      <BrandStory
        palette={PALETTE}
        eyebrow="Our Story"
        headline="The ancient art of hash-making, dialed in for Washington shelves."
      >
        <p>
          Joby Sewell started Seattle Bubble Works in 2016 after spending years marketing
          flower and vapes for a processor whose volume-first approach didn&apos;t match his
          quality bar. He went back to the oldest extraction method on the planet — fresh
          flower, ice, water, micron mesh — and built a small bench of specialists around it.
          Justin Boujelle pulls every batch as head hash maker. Bill Asher runs operations. The
          whole company is hash, all the way down.
        </p>
        <p>
          The process is mechanical, not chemical. Cold water locks up the trichome heads where
          the THC and terpenes live. Gentle agitation breaks them off the plant. A graduated
          stack of micron bags sorts them by size — the smaller the mesh, the cleaner the
          wash — and the wet hash is dried, pressed, and graded. No solvents touch the
          material. Ever.
        </p>
        <p>
          We carry Seattle Bubble Works at {STORE.name} because hash is a real craft category
          and they treat it like one. The temple balls are hand-rolled, the joints are coated
          with the actual bubble hash (not kief filler), and the rosin is pressed from their
          own wash — nothing outsourced. If you&apos;re shopping the dab case or the infused
          pre-roll case, this is the bench to start at.
        </p>
      </BrandStory>

      {/* SUB-BRANDS — per-brand because match shape varies brand-to-brand */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: PALETTE.dark }}
              >
                The Lineup
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Six formats, one solventless process
              </h2>
            </div>
            <p className="text-sm text-slate-500 max-w-md">
              Tap any to filter the products grid below. Tap again to clear.
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
                      ? "bg-[#0b1d3a] border-[#a8e0f5] shadow-lg ring-2 ring-[#a8e0f5]/40"
                      : disabled
                        ? "bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed"
                        : "bg-white border-slate-200 hover:border-[#3a8fb7] hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <h3
                      className={`font-extrabold text-lg leading-tight ${
                        active ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {sb.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${
                        active ? "bg-[#a8e0f5] text-[#0b1d3a]" : "bg-[#a8e0f5]/30 text-[#0b1d3a]"
                      }`}
                    >
                      {sb.tag}
                    </span>
                  </div>
                  <p
                    className={`text-sm leading-relaxed ${active ? "text-slate-300" : "text-slate-600"}`}
                  >
                    {sb.line}
                  </p>
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-wider mt-3 ${
                      active
                        ? "text-[#a8e0f5]"
                        : count > 0
                          ? "text-emerald-700"
                          : "text-slate-400"
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

      {/* PRODUCTS — accent classes stay literal at the call site so Tailwind v4 JIT picks them up */}
      <section id="products" className="bg-slate-50 border-y border-slate-200 scroll-mt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: PALETTE.dark }}
          >
            On Our Shelf
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-2 leading-tight">
            Seattle Bubble Works at {STORE.name}
          </h2>
          <p className="text-slate-500 mb-10">
            Live menu — prices, THC, and stock as of right now. {products.length} total products,
            paginated 25 per page.
          </p>

          <PaginatedProductsGrid
            products={products}
            perPage={25}
            nameContains={activeSubBrand}
            nameContainsLabel={activeSubBrand ?? undefined}
            onClearNameFilter={() => setActiveSubBrand(null)}
            accentBg="bg-[#0b1d3a]"
            accentBorder="border-[#3a8fb7]"
            accentHoverBorder="hover:border-[#3a8fb7]"
            accentText="text-[#0b1d3a]"
            accentHoverText="hover:text-[#3a8fb7]"
            accentGlow="hover:shadow-[#a8e0f5]/40"
          />
        </div>
      </section>

      {/* ABOUT — Q&A (FAQPage JSON-LD emitted inside the shell component) */}
      <BrandAboutQA palette={PALETTE} brandName="Seattle Bubble Works" items={ABOUT_QA} />

      {/* CONNECT — links + merged pickup card */}
      <BrandConnectBlock
        palette={PALETTE}
        brandName="Seattle Bubble Works"
        links={[
          {
            label: "Web",
            href: "https://seattlebubbleworks.com/",
            text: "seattlebubbleworks.com",
          },
          {
            label: "Instagram",
            href: "https://www.instagram.com/seattlebubbleworks/",
            text: "@seattlebubbleworks",
          },
          {
            label: "Licenses",
            text: "WSLCB 413980 + 428686 — Chelstad Strategies LLC, Buckley, WA",
          },
        ]}
        pickup={{
          eyebrow: `Pickup at ${STORE.name}`,
          headline: `${brand.activeSkus} Seattle Bubble Works product${brand.activeSkus !== 1 ? "s" : ""} ready in ${STORE.address.city}`,
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
        label="Order SBW Hash →"
        bgClass="bg-[#0b1d3a]"
        textClass="text-[#a8e0f5]"
        hoverClass="hover:bg-[#142d56]"
      />
    </div>
  );
}
