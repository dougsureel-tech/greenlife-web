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

// About-Agro-Couture Q&A — facts verified across agrocouture.com,
// slabmechanix.com, Marijuana Venture's "Growing the Right Way" feature,
// Cultivera + Leafly brand profiles, plus Headset/TopShelfData market
// references. FAQPage JSON-LD emitted from BrandAboutQA. No medical claims.
const ABOUT_QA = [
  {
    q: "Where is Agro Couture made?",
    a: "Tacoma, Washington — small-batch, hand-watered indoor flower grown at their state-of-the-art facility. Family-owned since 2015, Tier-2 producer/processor under the same roof as Slab Mechanix.",
  },
  {
    q: "What's the deal with Slab Mechanix? Same company?",
    a: "Yes — same producer, two brand voices. Slab Mechanix launched first in 2015 (concentrates, joints, flower at everyday $20/g pricing); Agro Couture is the premium artisan line that grew out of it. The team also runs Agro Mechanix, Green Envy, Tacoma Cannabis Company, and distributes Dab Star in Washington. One Tacoma facility, six brands.",
  },
  {
    q: "Who founded the company?",
    a: "Original partners Jeremy, Less, and Ty — all hands-on in the lab from day one, building what became the Slab Mechanix live resin and sugar wax that put them on the Tacoma map. The team has grown but the cultivation and extraction still run out of the same Tacoma site.",
  },
  {
    q: "What products does Agro Couture make?",
    a: "Indoor flower (small-batch, hand-watered top-shelf), Diamond Stix infused pre-rolls (joints + blunt cones rolled with THC-A diamonds), live resin oil cartridges and disposables, nug-run shatter, gummies, THC-infused beverages, body balm, and topical drops. The Diamond Stix line spans rotating strains like Duct Tape, Pink Lemonade, Jokerz, Waffle Cone, and Super Lemon Haze.",
  },
];

// Per-brand custom layout — Agro Couture (formerly stored as
// "Agro Couture / Slab Mechanix"). Slab Mechanix is wired in as a
// sister-brand card and a slug alias.
// Palette: deep aubergine/wine + champagne gold. Wine-and-gold leans
// into the "couture" name + matches the gold wordmark on agrocouture.com.
const PALETTE: BrandPalette = {
  dark: "#3d1f3a", // deep aubergine/wine
  dark2: "#3d1f3a", // gradient mid-stop (same dark)
  dark3: "#1f0f1d", // gradient end-stop — darker wine
  accent: "#d4af37", // champagne gold
  accentMuted: "#e9c870", // hover state
};

const AC_LOGO = "https://agrocouture.com/wp-content/uploads/2024/01/Agro-Couture_Logo-gold.png";
const AC_HERO = "https://agrocouture.com/wp-content/uploads/2024/03/tacoma-grown.jpg";

const SUB_BRANDS: Array<{ name: string; tag: string; line: string; matchToken: string }> = [
  {
    name: "Agro Couture",
    tag: "Premium Indoor Flower",
    line: "The flagship — small-batch, hand-watered top-shelf flower grown indoors in Tacoma. Single-strain jars and pre-rolls.",
    matchToken: "Agro Couture",
  },
  {
    name: "Slab Mechanix",
    tag: "Concentrates",
    line: "Sister brand. Live resin, sugar wax, shatter, slabs — Tacoma-grown extracts at everyday prices. Where the lab work started in 2015.",
    matchToken: "Slab",
  },
  {
    name: "Diamond Stix",
    tag: "Infused Pre-Rolls",
    line: "Top-shelf flower rolled with in-house THC-A diamonds. Available as 1g rice-paper joints and blunt cones — Duct Tape, Pink Lemonade, Jokerz, more.",
    matchToken: "Diamond Stix",
  },
  {
    name: "Live Resin",
    tag: "Cartridges & Dabs",
    line: "Live resin oil — natural fats and lipids preserved (not winterized) for the full-bodied terpene experience. Cartridges, disposables, and slabs.",
    matchToken: "Live Resin",
  },
  {
    name: "Nug Run Shatter",
    tag: "Concentrates",
    line: "Shatter run from whole nugs (not trim). Brighter terpene profile, fuller flavor — the classic dab format from the Slab Mechanix bench.",
    matchToken: "Shatter",
  },
  {
    name: "Ohana",
    tag: "Edibles & Topicals",
    line: "The wellness branch — gummies, THC-infused beverages, body balm, and topical drops. Same Tacoma roots, lower-key formats.",
    matchToken: "Ohana",
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

export default function AgroCoutureBrandPage({
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
        crumb="Agro Couture"
        logoUrl={AC_LOGO}
        logoAlt="Agro Couture logo"
        title="Agro Couture"
        tagline="Artisan cannabis. Tacoma grown."
        subtitle="Family-owned, hand-watered, small-batch indoor flower out of Tacoma, WA — plus the Slab Mechanix concentrate bench that's been running since 2015. Six brands under one roof."
        pills={[
          { kind: "muted", label: "Tacoma, WA", dot: true },
          { kind: "muted", label: "Indoor · Hand-Watered" },
          { kind: "muted", label: "Family-Owned Since 2015" },
          { kind: "filled", label: `${brand.activeSkus} on our shelf` },
        ]}
        ctas={[
          { href: "/menu", label: "Order Agro Couture for Pickup →", variant: "primary" },
          {
            href: "https://agrocouture.com/",
            label: "Visit agrocouture.com ↗",
            variant: "secondary",
            external: true,
          },
          {
            href: "https://slabmechanix.com/",
            label: "Visit slabmechanix.com ↗",
            variant: "secondary",
            external: true,
          },
        ]}
      >
        <Image
          src={AC_HERO}
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
            backgroundImage: "radial-gradient(circle, #d4af37 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </BrandHero>

      <BrandStory
        palette={PALETTE}
        eyebrow="Our Story"
        headline="Slab Mechanix in the lab. Agro Couture on the bench."
      >
        <p>
          Slab Mechanix launched in Tacoma in 2015 — Jeremy, Less, and Ty in the extraction
          lab, dialing in the live resin and sugar wax that put them on the map.
          Concentrates first, at everyday prices ($20/g when comparable oil was $30).
        </p>
        <p>
          Agro Couture grew out of that — the premium flower side of the same operation.
          State-of-the-art indoor facility, hand-watered small batches, the same Tacoma
          soil-and-air discipline applied to top-shelf bud. The Diamond Stix infused
          pre-rolls bridge the two: their flower rolled with their THC-A diamonds, all from
          the same building.
        </p>
        <p>
          Today the same team runs six brands — Slab Mechanix, Agro Couture, Agro Mechanix,
          Green Envy, Tacoma Cannabis Company, and Dab Star (Washington production +
          distribution). Over 200 dispensaries in 25+ counties. Top-50 processor and top-30
          producer per TopShelf Data. We carry their work at {STORE.name} because the QA
          actually holds shift after shift.
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
                Six brands, one Tacoma roof
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
                      ? "bg-[#3d1f3a] border-[#d4af37] shadow-lg ring-2 ring-[#d4af37]/40"
                      : disabled
                        ? "bg-stone-50 border-stone-100 opacity-50 cursor-not-allowed"
                        : "bg-white border-stone-200 hover:border-[#d4af37] hover:shadow-md hover:-translate-y-0.5"
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
                        active ? "bg-[#d4af37] text-[#3d1f3a]" : "bg-[#d4af37]/30 text-[#3d1f3a]"
                      }`}
                    >
                      {sb.tag}
                    </span>
                  </div>
                  <p
                    className={`text-sm leading-relaxed ${active ? "text-stone-200" : "text-stone-600"}`}
                  >
                    {sb.line}
                  </p>
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-wider mt-3 ${
                      active ? "text-[#d4af37]" : count > 0 ? "text-emerald-700" : "text-stone-400"
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
            Agro Couture + Slab Mechanix at {STORE.name}
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
            accentBg="bg-[#3d1f3a]"
            accentBorder="border-[#d4af37]"
            accentHoverBorder="hover:border-[#d4af37]"
            accentText="text-[#3d1f3a]"
            accentHoverText="hover:text-[#1f0f1d]"
            accentGlow="hover:shadow-[#d4af37]/30"
          />
        </div>
      </section>

      <BrandAboutQA palette={PALETTE} brandName="Agro Couture" items={ABOUT_QA} />

      <BrandConnectBlock
        palette={PALETTE}
        brandName="Agro Couture"
        links={[
          { label: "Web", href: "https://agrocouture.com/", text: "agrocouture.com" },
          { label: "Sister", href: "https://slabmechanix.com/", text: "slabmechanix.com" },
          { label: "Twitter / X", href: "https://x.com/coutureagro", text: "@coutureagro" },
          { label: "Origin", text: "Tacoma, WA — Tier-2 producer/processor" },
        ]}
        pickup={{
          eyebrow: `Pickup at ${STORE.name}`,
          headline: `${brand.activeSkus} Agro Couture / Slab Mechanix product${brand.activeSkus !== 1 ? "s" : ""} ready in ${STORE.address.city}`,
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
        label="Order Agro Couture →"
        bgClass="bg-[#3d1f3a]"
        textClass="text-[#d4af37]"
        hoverClass="hover:bg-[#1f0f1d]"
      />
    </div>
  );
}
