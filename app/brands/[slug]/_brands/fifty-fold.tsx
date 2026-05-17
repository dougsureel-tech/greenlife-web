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

// About-Fifty-Fold Q&A — facts verified across fiftyfolds.com, Headset
// brand profile, Leafly brand page, Lux Pot Shop + American Mary brand
// spotlights, plus WSLCB licensee data via 502Data + Top Shelf Data
// (Hypothesis Gardens LLC, license 416519). FAQPage JSON-LD emitted from
// BrandAboutQA. No medical claims.
const ABOUT_QA = [
  {
    q: "Where is Fifty Fold made?",
    a: "Spokane Valley, Washington — indoor, hydroponic cultivation under the WSLCB license held by Hypothesis Gardens LLC (license 416519). Tier 2 producer/processor, in market since 2015.",
  },
  {
    q: "What does the name mean?",
    a: "It's a nod to the theoretical math problem: a piece of paper folded in half 50 times would, in principle, reach beyond the moon. The brand uses it as a discipline — every harvest is one more fold, one more iteration on the process. Founder Andrew Curley has called the goal 'Diamond cut precision,' the same lot quality batch after batch.",
  },
  {
    q: "How is it grown?",
    a: "Indoor, hydroponic, on stonewool substrate. Humidity, temperature, CO2, light intensity, light spectrum, nutrient mix — every variable is monitored and adjusted per strain. Founder Andrew Curley likens it to a chef perfecting a kitchen: small, sealed, controlled.",
  },
  {
    q: "What does Fifty Fold actually ship?",
    a: "Premium flower (eighths, grams), pre-rolls (singles and packs), and infused pre-rolls coated with their own house-made kief. They also run a DOH-compliant medical line that passes Washington's full pesticide / solvent / microbial / heavy-metal panel — one of the strictest QA bars on the rec shelf.",
  },
];

// Per-brand custom layout — Fifty Fold (Hypothesis Gardens LLC dba).
// Palette: midnight-ink + lab-mint. Reads as serious engineering /
// blueprint; the lab-mint accent is fresh and clean — pulls toward
// "lab precision" without aping medical green.
const PALETTE: BrandPalette = {
  dark: "#16243d", // midnight ink
  dark2: "#1c2e4a", // gradient mid-stop (lighter ink)
  dark3: "#0c1626", // gradient end-stop (deeper ink)
  accent: "#9ee1b8", // lab-mint
  accentMuted: "#b8ecca", // hover state
};

const FF_LOGO =
  "https://images.squarespace-cdn.com/content/v1/5a56965daeb625f6111f150e/1515625055748-RA16Y5HBZ4D14ZRHPS2M/20151012_FIFTY+FOLD_LOGO+FILE_Black+Square.png";

const SUB_BRANDS: Array<{
  name: string;
  tag: string;
  line: string;
  matchToken: string;
  matchKind?: "name" | "category";
}> = [
  {
    name: "Flower",
    tag: "Indoor Hydroponic",
    line: "Full-size jar flower from the sealed Spokane Valley room. Stonewool-grown, hand-trimmed, slow-cured to dial in the terps.",
    matchToken: "Flower",
    matchKind: "category",
  },
  {
    name: "Pre-Rolls",
    tag: "Joints & Packs",
    line: "Singles and multi-packs rolled with the same flower as the jar — not shake. Tight-rolled, even burn.",
    matchToken: "Pre-Roll",
    matchKind: "category",
  },
  {
    name: "Infused Pre-Rolls",
    tag: "Kief-Coated",
    line: "Their signature — joints rolled with flower and dusted in house-made kief from the same harvest. The extra punch.",
    matchToken: "Infused",
  },
  {
    name: "DOH Compliant",
    tag: "Medical Program",
    line: "Department-of-Health-compliant flower and pre-rolls — full pesticide / solvent / microbial / heavy-metal panel. One of the strictest QA bars on the rec shelf.",
    matchToken: "DOH",
  },
  {
    name: "Mamacita",
    tag: "Heirloom Sativa",
    line: "Their flagship sativa — an heirloom strain Andrew Curley brought back from La Perla, Puerto Rico. The line that put Fifty Fold on the WA map.",
    matchToken: "Mamacita",
  },
  {
    name: "Concentrates",
    tag: "Extracts",
    line: "Anything Fifty Fold ships in concentrate format when the lot supports it. Format and stock rotate.",
    matchToken: "Concentrates",
    matchKind: "category",
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

export default function FiftyFoldBrandPage({
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
      {/* HERO — origami-fold geometric pattern in decoration slot */}
      <BrandHero
        palette={PALETTE}
        crumb="Fifty Fold"
        logoUrl={FF_LOGO}
        logoAlt="Fifty Fold logo"
        title="Fifty Fold"
        tagline="Diamond cut precision."
        subtitle="Indoor hydroponic cannabis out of Spokane Valley — every variable dialed in, every harvest one more fold of the process. Founded 2013, in market since 2015."
        pills={[
          { kind: "muted", label: "Spokane Valley, WA", dot: true },
          { kind: "muted", label: "Indoor Hydroponic" },
          { kind: "filled", label: `${brand.activeSkus} on our shelf` },
        ]}
        ctas={[
          { href: "/menu", label: "Order Fifty Fold for Pickup →", variant: "primary" },
          {
            href: "https://www.fiftyfolds.com/",
            label: "Visit fiftyfolds.com ↗",
            variant: "secondary",
            external: true,
          },
        ]}
      >
        {/* Subtle origami-fold geometric pattern — diagonal seams every 48px,
            very low opacity. References the "fold" namesake without being
            literal. */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(45deg, transparent 49%, #9ee1b8 49%, #9ee1b8 51%, transparent 51%), linear-gradient(-45deg, transparent 49%, #9ee1b8 49%, #9ee1b8 51%, transparent 51%)",
            backgroundSize: "48px 48px",
          }}
        />
      </BrandHero>

      <BrandStory palette={PALETTE} eyebrow="Our Story" headline="One more fold, every harvest.">
        <p>
          Fifty Fold is a Tier 2 producer/processor in Spokane Valley operating under
          Hypothesis Gardens LLC (WSLCB license 416519). Founded in 2013 and brought to
          market in 2015 by owner and head grower Andrew Curley, the brand name comes from
          the math curiosity that a piece of paper folded fifty times would, in principle,
          reach beyond the moon — they use it as a discipline. Every run is one more fold
          of the process.
        </p>
        <p>
          The grow is fully indoor, fully hydroponic, on stonewool substrate. Temperature,
          humidity, CO2, light intensity, light spectrum, nutrient solution, and pH — every
          variable is monitored and dialed per strain. Curley likens it to a chef
          perfecting a kitchen: small, sealed, controlled, with no room for surprise.
          They call the standard &ldquo;Diamond cut precision&rdquo; and build the brand
          around hitting it batch after batch.
        </p>
        <p>
          We carry Fifty Fold at {STORE.name} because the consistency story is real and
          the lineup is wide — heirloom sativas like Mamacita (an heirloom Curley brought
          from La Perla, Puerto Rico), classic indicas like Presidential Kush, exotic runs
          like Slushious, Gummiez, and Molten Lava, plus the kief-infused pre-rolls and the
          DOH-compliant medical line that passes Washington&rsquo;s full QA panel.
        </p>
      </BrandStory>

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
                Six ways to shop the lab
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
                      ? "bg-[#16243d] border-[#9ee1b8] shadow-lg ring-2 ring-[#9ee1b8]/40"
                      : disabled
                        ? "bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed"
                        : "bg-white border-slate-200 hover:border-[#9ee1b8] hover:shadow-md hover:-translate-y-0.5"
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
                        active ? "bg-[#9ee1b8] text-[#16243d]" : "bg-[#9ee1b8]/30 text-[#16243d]"
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
                      active ? "text-[#9ee1b8]" : count > 0 ? "text-emerald-700" : "text-slate-400"
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

      <section id="products" className="bg-slate-50 border-y border-slate-200 scroll-mt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: PALETTE.dark }}
          >
            On Our Shelf
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-2 leading-tight">
            Fifty Fold at {STORE.name}
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
            accentBg="bg-[#16243d]"
            accentBorder="border-[#9ee1b8]"
            accentHoverBorder="hover:border-[#9ee1b8]"
            accentText="text-[#16243d]"
            accentHoverText="hover:text-[#0c1626]"
            accentGlow="hover:shadow-[#9ee1b8]/30"
          />
        </div>
      </section>

      <BrandAboutQA palette={PALETTE} brandName="Fifty Fold" items={ABOUT_QA} />

      <BrandConnectBlock
        palette={PALETTE}
        brandName="Fifty Fold"
        links={[
          { label: "Web", href: "https://www.fiftyfolds.com/", text: "fiftyfolds.com" },
          { label: "Instagram", href: "https://www.instagram.com/50fold/", text: "@50fold" },
          {
            label: "License",
            text: "WSLCB 416519 — Hypothesis Gardens LLC, Spokane Valley, WA",
          },
        ]}
        pickup={{
          eyebrow: `Pickup at ${STORE.name}`,
          headline: `${brand.activeSkus} Fifty Fold product${brand.activeSkus !== 1 ? "s" : ""} ready in ${STORE.address.city}`,
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
        label="Order Fifty Fold →"
        bgClass="bg-[#16243d]"
        textClass="text-[#9ee1b8]"
        hoverClass="hover:bg-[#0c1626]"
      />
    </div>
  );
}
