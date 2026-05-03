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

// About-Minglewood Q&A — verified from minglewoodbrands.com (homepage
// title + meta description) plus product naming patterns in our own
// catalog. FAQPage JSON-LD emitted from BrandAboutQA. No medical claims.
const ABOUT_QA = [
  {
    q: "Where is Minglewood Brands based?",
    a: "Tacoma, Washington — a processing and distribution company licensed in WA state. They run multiple in-house brands rather than a single flagship.",
  },
  {
    q: "What brands does Minglewood run?",
    a: "Three you'll see on our shelf: High Tide (their flagship — flower, pre-rolls, rosin), K-Savage (DOH-compliant flower + pre-roll line), and a private-label series under MWB. Each line carries its own visual identity but ships from the same Tacoma facility.",
  },
  {
    q: "What's the difference between High Tide and K-Savage?",
    a: "High Tide is the everyday line — flower, pre-rolls, rosin concentrates across most strain categories. K-Savage leans into DOH-compliant patient-side packaging (medical authorization framework). Same producer, different SKU positioning.",
  },
  {
    q: "Are these DOH compliant?",
    a: "Most of the K-Savage lineup is — products labeled 'DOH' on the package meet the Washington medical compliance framework. Recreational customers can buy them too; the label just signals they hit the patient-side QA bar.",
  },
];

// Per-brand custom layout — Minglewood Brands.
// Palette: deep navy + warm peach accent.
const PALETTE: BrandPalette = {
  dark: "#16213e", // deep navy
  dark2: "#16213e", // same
  dark3: "#0f1729", // darker navy
  accent: "#e8a87c", // warm peach
  accentMuted: "#f4c89a", // hover state
};

const MW_LOGO = "https://static.wixstatic.com/media/faeb55_64037de49aca4d4394f7c7eece094e15~mv2.png";

const SUB_BRANDS: Array<{ name: string; tag: string; line: string; matchToken: string }> = [
  {
    name: "High Tide",
    tag: "Flagship Line",
    line: "Their everyday line — DOH flower, pre-rolls, rosin concentrates. Most of the SKUs you'll see on our shelf.",
    matchToken: "High Tide",
  },
  {
    name: "K-Savage",
    tag: "DOH Compliant",
    line: "Patient-side packaging that hits the WA medical compliance bar. Flower + pre-rolls; the same QA, recreational-buyable.",
    matchToken: "K-Savage",
  },
  {
    name: "MWB Private Label",
    tag: "House Brand",
    line: "Private-label pre-rolls and flower under the Minglewood parent identity — collaboration runs and limited releases.",
    matchToken: "MWB",
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

export default function MinglewoodBrandPage({
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
        crumb="Minglewood Brands"
        logoUrl={MW_LOGO}
        logoAlt="Minglewood Brands logo"
        title="Minglewood"
        tagline="Brands."
        subtitle="Tacoma-based cannabis processing and distribution. Three lines under one roof — High Tide, K-Savage, and a private-label series — built for shelf-side variety without losing QA discipline."
        pills={[
          { kind: "muted", label: "Tacoma, WA", dot: true },
          { kind: "muted", label: "Processor / Distributor" },
          { kind: "filled", label: `${brand.activeSkus} on our shelf` },
        ]}
        ctas={[
          { href: "/menu", label: "Order Minglewood for Pickup →", variant: "primary" },
          {
            href: "https://www.minglewoodbrands.com/",
            label: "Visit minglewoodbrands.com ↗",
            variant: "secondary",
            external: true,
          },
        ]}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </BrandHero>

      <BrandStory palette={PALETTE} eyebrow="Our Story" headline="One processor. Three brands. WA-only.">
        <p>
          Minglewood is a Tacoma-based cannabis processing and distribution company. They
          don&apos;t cultivate flower under their own name — they take in raw material,
          process and package it into finished SKUs, and ship it out under a few different
          brand identities. Sales are wholesale-only to established WA dispensaries.
        </p>
        <p>
          We carry three of their lines at {STORE.name}: <strong>High Tide</strong> is the
          flagship — most of what you&apos;ll see is High Tide flower, pre-rolls, or rosin.
          <strong> K-Savage</strong> covers the DOH-compliant patient-side packaging (med-bar
          QA, available recreationally too). The <strong>MWB private-label</strong> series
          picks up collaboration runs and limited releases.
        </p>
        <p>
          The reason we keep them on the shelf is that the QA bar holds across all three
          lines. Same Tacoma facility, same testing discipline — the brands differentiate
          positioning, not quality.
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
                Three brands you&apos;ll see on our shelf
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
                      ? "bg-[#16213e] border-[#e8a87c] shadow-lg ring-2 ring-[#e8a87c]/40"
                      : disabled
                        ? "bg-stone-50 border-stone-100 opacity-50 cursor-not-allowed"
                        : "bg-white border-stone-200 hover:border-[#e8a87c] hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <h3 className={`font-extrabold text-lg leading-tight ${active ? "text-white" : "text-stone-900"}`}>
                      {sb.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${
                        active ? "bg-[#e8a87c] text-[#16213e]" : "bg-[#e8a87c]/40 text-[#16213e]"
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
                      active ? "text-[#e8a87c]" : count > 0 ? "text-emerald-700" : "text-stone-400"
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
            Minglewood at {STORE.name}
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
            accentBg="bg-[#16213e]"
            accentBorder="border-[#e8a87c]"
            accentHoverBorder="hover:border-[#e8a87c]"
            accentText="text-[#16213e]"
            accentHoverText="hover:text-[#0f1729]"
            accentGlow="hover:shadow-[#e8a87c]/30"
          />
        </div>
      </section>

      <BrandAboutQA palette={PALETTE} brandName="Minglewood" items={ABOUT_QA} />

      <BrandConnectBlock
        palette={PALETTE}
        brandName="Minglewood"
        links={[
          { label: "Web", href: "https://www.minglewoodbrands.com/", text: "minglewoodbrands.com" },
          { label: "HQ", text: "Tacoma, WA" },
        ]}
        pickup={{
          eyebrow: `Pickup at ${STORE.name}`,
          headline: `${brand.activeSkus} Minglewood product${brand.activeSkus !== 1 ? "s" : ""} ready in ${STORE.address.city}`,
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

      <StickyOrderCTA label="Order Minglewood →" />
    </div>
  );
}
