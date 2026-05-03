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

// About-Redbird Q&A — facts verified across redbird-cannabis.com, Top
// Shelf Data, and WSLCB licensee records (Trueaerogrow LLC, license
// 413029). FAQPage JSON-LD emitted from BrandAboutQA. No medical claims.
const ABOUT_QA = [
  {
    q: "Where is Redbird grown?",
    a: "Spokane, Washington — indoors under the WSLCB license held by Trueaerogrow LLC (license 413029). Tier 3 producer/processor, fully sealed controlled-environment cultivation room.",
  },
  {
    q: "How does the aeroponic grow actually work?",
    a: "Roots hang in air inside a sealed chamber while a fine mist of nutrient water sprays them on a tight schedule. No soil, no flood tables. The plant gets near-100% oxygen at the root zone and Redbird dials temperature, humidity, CO2, light, nutrient mix, and pH separately for every strain. Their own number: 98% less water than conventional hydroponics.",
  },
  {
    q: "What does Redbird actually make?",
    a: "Four product lines: full-size flower, pre-rolled joints (individually rolled), Micro-Bud (small popcorn nugs at a value price), and solvent-free dry sift rosin. Strains rotate; recent runs include Tropicana Garlic, Raspberry Dosidos, and Wedding Cake.",
  },
  {
    q: "Is Redbird indoor or outdoor?",
    a: "Indoor, specifically Controlled-Environment Agriculture (CEA). Year-round consistency is the whole pitch — same flavor, same potency, same quality batch after batch because every variable is locked down inside the room.",
  },
];

// Per-brand custom layout — Redbird Cannabis (Trueaerogrow LLC DBA).
// Palette: ink black + cardinal red. Matches Redbird's own visual identity.
const PALETTE: BrandPalette = {
  dark: "#0d0d0d", // ink black
  dark2: "#1a0606", // gradient mid-stop
  dark3: "#c1272d", // cardinal red — gradient end-stop + accents
  accent: "#c1272d", // cardinal red
  accentMuted: "#a01f25", // hover state (deeper red)
};

const RB_LOGO =
  "https://images.squarespace-cdn.com/content/v1/6511d95f3eb1ba362c729a4c/ff355e9a-9a11-4661-a7ef-669fb1b4830c/Redbird_Logo_Primary_KO_black.png";
const RB_HERO =
  "https://images.squarespace-cdn.com/content/v1/6511d95f3eb1ba362c729a4c/1695677008965-QQJ62AWX6BZVWMYG9VXX/Tropicana-Garlic-6.jpg";

const SUB_BRANDS: Array<{
  name: string;
  tag: string;
  line: string;
  matchToken: string;
  matchKind?: "name" | "category";
}> = [
  {
    name: "Flower",
    tag: "Aeroponic",
    line: "Full-size jar flower from the sealed room. Hand-trimmed, slow-cured, the headline product.",
    matchToken: "Flower",
    matchKind: "category",
  },
  {
    name: "Pre-Rolled Joints",
    tag: "Pre-Rolls",
    line: "Individually rolled with the same aeroponic flower as the jar — not shake. Singles and packs.",
    matchToken: "Pre-Roll",
    matchKind: "category",
  },
  {
    name: "Micro-Bud",
    tag: "Value Flower",
    line: "Smaller popcorn-size nugs at a friendlier price. Same lot, same potency — just compact.",
    matchToken: "Micro",
  },
  {
    name: "Rosin",
    tag: "Solvent-Free",
    line: "Dry sift rosin — heat and pressure only, no solvents, strain-specific terpenes intact.",
    matchToken: "Rosin",
  },
  {
    name: "Concentrates",
    tag: "Extracts",
    line: "Anything Redbird ships in concentrate format — rosin, sift, dabbable extracts as available.",
    matchToken: "Concentrates",
    matchKind: "category",
  },
  {
    name: "Pre-Roll Packs",
    tag: "Multi-Packs",
    line: "Multi-pack pre-rolls — share with friends or stash a couple for the weekend.",
    matchToken: "Pack",
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

export default function RedbirdBrandPage({
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
    <div className="bg-neutral-50">
      <BrandHero
        palette={PALETTE}
        crumb="Redbird Cannabis"
        logoUrl={RB_LOGO}
        logoAlt="Redbird Cannabis logo"
        title="Redbird Cannabis"
        tagline="Consistency, dialed in."
        subtitle="Aeroponic cannabis out of Spokane — roots in mist, every variable locked down, year-round. Same flavor, same potency, same quality batch after batch."
        pills={[
          { kind: "muted", label: "Spokane, WA", dot: true },
          { kind: "muted", label: "Aeroponic / CEA" },
          { kind: "filled", label: `${brand.activeSkus} on our shelf` },
        ]}
        ctas={[
          { href: "/menu", label: "Order Redbird for Pickup →", variant: "primary" },
          {
            href: "https://redbird-cannabis.com/",
            label: "Visit redbird-cannabis.com ↗",
            variant: "secondary",
            external: true,
          },
        ]}
      >
        <Image
          src={RB_HERO}
          alt=""
          fill
          priority
          unoptimized
          aria-hidden
          className="object-cover opacity-30"
        />
        {/* Diagonal cardinal-red stripe pattern. */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, transparent 48%, #c1272d 48%, #c1272d 52%, transparent 52%)",
            backgroundSize: "32px 32px",
          }}
        />
      </BrandHero>

      <BrandStory palette={PALETTE} eyebrow="Our Story" headline="Roots in mist. Variables on lockdown.">
        <p>
          Redbird is a Tier 3 producer/processor in Spokane operating under Trueaerogrow LLC
          (WSLCB license 413029). The grow uses high-pressure aeroponics inside a
          controlled-environment room — roots hang in air, a fine nutrient mist saturates them
          on schedule, and the plant gets near-100% oxygen at the root zone. No soil, no flood
          tables, 98% less water than standard hydroponics.
        </p>
        <p>
          Every variable is dialed in per strain — temperature, humidity, CO2, light, nutrient
          mix, pH. The point isn&apos;t novelty for its own sake; it&apos;s consistency.
          Customers who liked the last jar of Tropicana Garlic should get the same jar two
          months later.
        </p>
        <p>
          We carry Redbird at {STORE.name} because the aeroponic process produces flower with
          very predictable terpene and potency profiles — and because the rosin and pre-rolls
          come from the same flower as the jars, not trim. Look for Flower, Pre-Rolled Joints,
          Micro-Bud (popcorn nugs at a value tier), and dry-sift Rosin.
        </p>
      </BrandStory>

      <section className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: PALETTE.accent }}
              >
                The Lineup
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 leading-tight">
                Four formats, one sealed room
              </h2>
            </div>
            <p className="text-sm text-neutral-500 max-w-md">
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
                      ? "bg-[#0d0d0d] border-[#c1272d] shadow-lg ring-2 ring-[#c1272d]/40"
                      : disabled
                        ? "bg-neutral-50 border-neutral-100 opacity-50 cursor-not-allowed"
                        : "bg-white border-neutral-200 hover:border-[#c1272d] hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <h3 className={`font-extrabold text-lg leading-tight ${active ? "text-white" : "text-neutral-900"}`}>
                      {sb.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${
                        active ? "bg-[#c1272d] text-white" : "bg-[#c1272d]/10 text-[#c1272d]"
                      }`}
                    >
                      {sb.tag}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${active ? "text-neutral-300" : "text-neutral-600"}`}>
                    {sb.line}
                  </p>
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-wider mt-3 ${
                      active ? "text-[#c1272d]" : count > 0 ? "text-emerald-700" : "text-neutral-400"
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

      <section id="products" className="bg-neutral-50 border-y border-neutral-200 scroll-mt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: PALETTE.accent }}
          >
            On Our Shelf
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 mb-2 leading-tight">
            Redbird at {STORE.name}
          </h2>
          <p className="text-neutral-500 mb-10">
            Live menu — prices, THC, and stock as of right now. {products.length} total products,
            paginated 25 per page.
          </p>

          <PaginatedProductsGrid
            products={products}
            perPage={25}
            nameContains={activeSubBrand}
            nameContainsLabel={activeSubBrand ?? undefined}
            onClearNameFilter={() => setActiveSubBrand(null)}
            accentBg="bg-[#c1272d]"
            accentBorder="border-[#c1272d]"
            accentHoverBorder="hover:border-[#c1272d]"
            accentText="text-[#c1272d]"
            accentHoverText="hover:text-[#a01f25]"
            accentGlow="hover:shadow-[#c1272d]/30"
          />
        </div>
      </section>

      <BrandAboutQA palette={PALETTE} brandName="Redbird" items={ABOUT_QA} />

      <BrandConnectBlock
        palette={PALETTE}
        brandName="Redbird"
        links={[
          { label: "Web", href: "https://redbird-cannabis.com/", text: "redbird-cannabis.com" },
          { label: "Instagram", href: "https://www.instagram.com/redbird_wa/", text: "@redbird_wa" },
          { label: "License", text: "WSLCB 413029 — Trueaerogrow LLC, Spokane, WA" },
        ]}
        pickup={{
          eyebrow: `Pickup at ${STORE.name}`,
          headline: `${brand.activeSkus} Redbird product${brand.activeSkus !== 1 ? "s" : ""} ready in ${STORE.address.city}`,
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

      <StickyOrderCTA label="Order Redbird →" />
    </div>
  );
}
