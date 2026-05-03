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

// About-2727 Q&A — facts verified across 2727life.com + WSLCB licensee
// records (license 428025), 502Data, and TopShelfData. FAQPage JSON-LD
// emitted from BrandAboutQA. No medical claims.
const ABOUT_QA = [
  {
    q: "Where is 2727 made?",
    a: "Lake Stevens, Washington — outdoor sun-grown cannabis under the WSLCB license held by Northwest Distributing LLC (license 428025). Processing since July 2019.",
  },
  {
    q: "Is 2727 outdoor or indoor grown?",
    a: "Outdoor. The whole brand is built around sun-grown identity — full-sun terpene development, lower carbon footprint than indoor, the seasonal flavor variation outdoor brings. Their tagline 'Made to Burn with Perfection' tracks back to the cure, not the lights.",
  },
  {
    q: "Who runs 2727?",
    a: "A team with 30 years combined cannabis experience. Producers Mason Harrington and Erik Vigil run cultivation; processors Gerard Corales and Cody Wood handle the back of house; Cassie Smith, Sydney Hohenstein, and Cherrity Tenderholt manage orders.",
  },
  {
    q: "What does 2727 ship?",
    a: "Premium flower, pre-roll packs (2-pack / 4-pack / 5-pack), kief-coated infused pre-rolls, glass-tip blunts, vape cartridges, and dabs (live resin / budder / shatter). The Signature line is their top-shelf flower; the Medio line is the everyday workhorse.",
  },
];

// Per-brand custom layout — 2727 (Northwest Distributing LLC DBA).
// Palette: terracotta + warm cream — earth tones for outdoor / sun-grown.
const PALETTE: BrandPalette = {
  dark: "#7a3b2e", // terracotta
  dark2: "#7a3b2e", // same
  dark3: "#5a2820", // darker terracotta
  accent: "#f0d9a8", // warm cream
  accentMuted: "#f8e8c4", // hover state
};

const TT_LOGO = "https://2727life.com/wp-content/uploads/2024/08/Logo-01-147x147.png";
const TT_HERO = "https://2727life.com/wp-content/uploads/2024/08/flower-8-1024x648.png";

const SUB_BRANDS: Array<{ name: string; tag: string; line: string; matchToken: string }> = [
  {
    name: "2727 Signature",
    tag: "Premium Flower",
    line: "Top-shelf flower with hand-trimmed care. Reserved for their best phenotypes.",
    matchToken: "Signature",
  },
  {
    name: "Medio",
    tag: "Everyday Flower",
    line: "Workhorse flower line — full-size jars (28g), the everyday outdoor sun-grown.",
    matchToken: "Medio",
  },
  {
    name: "27/27 DOH",
    tag: "Department of Health",
    line: "DOH-compliant flower + pre-rolls under the medical patient framework.",
    matchToken: "27/27",
  },
  {
    name: "Super Mega Bussin",
    tag: "Concentrates",
    line: "Their concentrate sub-brand — honey crumble, sugar sauce, live resin formats.",
    matchToken: "SMB",
  },
  {
    name: "Glass-Tip Blunts",
    tag: "Pre-Rolls",
    line: "Vanilla and strawberry flavored blunts with reusable glass tips. 1.5g singles.",
    matchToken: "Blunt",
  },
  {
    name: "Infused Pre-Rolls",
    tag: "Pre-Rolls",
    line: "Kief-coated joints — the strain plus a powdered hash dusting for extra punch.",
    matchToken: "Infused Preroll",
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

export default function Brand2727Page({
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
        crumb="2727"
        logoUrl={TT_LOGO}
        logoAlt="2727 logo"
        title="2727"
        tagline="Made to Burn with Perfection."
        subtitle="Outdoor sun-grown Washington cannabis out of Lake Stevens — flower, pre-rolls, blunts, vapes, and dabs. The kind of terpenes you only get from full-sun seasons."
        pills={[
          { kind: "muted", label: "Lake Stevens, WA", dot: true },
          { kind: "muted", label: "Outdoor Sun-Grown" },
          { kind: "filled", label: `${brand.activeSkus} on our shelf` },
        ]}
        ctas={[
          { href: "/menu", label: "Order 2727 for Pickup →", variant: "primary" },
          {
            href: "https://2727life.com/",
            label: "Visit 2727life.com ↗",
            variant: "secondary",
            external: true,
          },
        ]}
      >
        <Image
          src={TT_HERO}
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

      <BrandStory palette={PALETTE} eyebrow="Our Story" headline="Grown by the sun. Cured for the burn.">
        <p>
          2727 has been processing in Lake Stevens since 2019 under the WSLCB license held by
          Northwest Distributing LLC. The grow is outdoor — full sun, real seasons, terpene
          development you can&apos;t get under HPS or LED. The brand voice is built around
          the cure: smoke that lights even, ashes white, tastes like the strain it&apos;s
          named for.
        </p>
        <p>
          The team is a 30-year deep bench. Mason Harrington and Erik Vigil run cultivation;
          Gerard Corales and Cody Wood handle the processing back of house. Cassie Smith,
          Sydney Hohenstein, and Cherrity Tenderholt take care of the orders side.
        </p>
        <p>
          We carry 2727 at {STORE.name} because the outdoor flavor profile is real and the
          QA holds shift after shift. The Signature line is the top-shelf pick when you want
          the rare phenotypes; Medio is the everyday workhorse.
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
                The Lineup
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
                Six lines under one outdoor roof
              </h2>
            </div>
            <p className="text-sm text-stone-500 max-w-md">
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
                      ? "bg-[#7a3b2e] border-[#f0d9a8] shadow-lg ring-2 ring-[#f0d9a8]/40"
                      : disabled
                        ? "bg-stone-50 border-stone-100 opacity-50 cursor-not-allowed"
                        : "bg-white border-stone-200 hover:border-[#f0d9a8] hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <h3 className={`font-extrabold text-lg leading-tight ${active ? "text-white" : "text-stone-900"}`}>
                      {sb.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${
                        active ? "bg-[#f0d9a8] text-[#7a3b2e]" : "bg-[#f0d9a8]/40 text-[#7a3b2e]"
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
                      active ? "text-[#f0d9a8]" : count > 0 ? "text-emerald-700" : "text-stone-400"
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

      <section id="products" className="bg-stone-50 border-y border-stone-200 scroll-mt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: PALETTE.dark }}
          >
            On Our Shelf
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-2 leading-tight">
            2727 at {STORE.name}
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
            accentBg="bg-[#7a3b2e]"
            accentBorder="border-[#f0d9a8]"
            accentHoverBorder="hover:border-[#f0d9a8]"
            accentText="text-[#7a3b2e]"
            accentHoverText="hover:text-[#5a2820]"
            accentGlow="hover:shadow-[#f0d9a8]/30"
          />
        </div>
      </section>

      <BrandAboutQA palette={PALETTE} brandName="2727" items={ABOUT_QA} />

      <BrandConnectBlock
        palette={PALETTE}
        brandName="2727"
        links={[
          { label: "Web", href: "https://2727life.com/", text: "2727life.com" },
          { label: "Instagram", href: "https://www.instagram.com/2727life/", text: "@2727life" },
          { label: "License", text: "WSLCB 428025 — Lake Stevens, WA" },
        ]}
        pickup={{
          eyebrow: `Pickup at ${STORE.name}`,
          headline: `${brand.activeSkus} 2727 product${brand.activeSkus !== 1 ? "s" : ""} ready in ${STORE.address.city}`,
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

      <StickyOrderCTA label="Order 2727 →" />
    </div>
  );
}
