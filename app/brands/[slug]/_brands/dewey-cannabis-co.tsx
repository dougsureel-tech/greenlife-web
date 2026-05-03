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

// About-Dewey Q&A — facts verified across deweycannabis.com, parent
// research company Dewey Scientific, GeekWire's 2019 WSU-spinout
// coverage, and WSLCB licensee records (Dewey Botanicals LLC, license
// 428617). FAQPage JSON-LD emitted from BrandAboutQA. No medical claims.
const ABOUT_QA = [
  {
    q: "Where is Dewey grown?",
    a: "Pullman, Washington — same college town as Washington State University. Indoor cultivation under WSLCB license 428617 (legal entity Dewey Botanicals LLC, UBI 604466274). The grow sits inside the same orbit as Dewey Scientific, the WSU-spinout research lab the founders also run.",
  },
  {
    q: "Why did Dewey Botanicals become Dewey Cannabis Co.?",
    a: "The legal entity Dewey Botanicals LLC still holds the WSLCB license, but the consumer-facing brand was renamed Dewey Cannabis Co. in 2024. The smile logo and yellow accent identity arrived with the rebrand. Older menus and dispensary directories still show the old name — same plants, same team, same Pullman grow.",
  },
  {
    q: "Who founded Dewey?",
    a: "Three Ph.D. plant biologists out of Washington State University: Dr. Jordan Zager (CEO, molecular plant science), Dr. Paul Mihalyov (genetics + breeding), and Dr. Mark Lange (Chief Scientific Officer, plant biochemistry). They founded the research arm Dewey Scientific first — the cultivation brand grew out of the breeding work.",
  },
  {
    q: "What does Dewey actually ship?",
    a: "Signature Flower (the headline jars), Dewbies and Hella Dewbie pre-rolls (the 28-count Hella jar holds 14g of pre-rolls), Tiny Trees popcorn-nug value flower, Matchsticks hash-infused solventless joints, Live Rosin solventless concentrate, Live Resin vape carts, and an All-In-One disposable dab pen.",
  },
];

// Per-brand custom layout — Dewey Cannabis Co. (Dewey Botanicals LLC DBA).
// Palette: sunny Dewey-smile yellow on deep grass green. Yellow + green
// tracks the brand's own visuals — smile logo ships in yellow, foliage
// shots are deep canopy green.
const PALETTE: BrandPalette = {
  dark: "#1f4d2e", // deep grass green
  dark2: "#1f4d2e", // gradient mid-stop (same dark)
  dark3: "#0f2e1a", // gradient end-stop — darker green
  accent: "#f5c842", // sunny smile yellow
  accentMuted: "#fde288", // hover state
};

const DC_LOGO =
  "https://images.squarespace-cdn.com/content/v1/66033d9365686e323e42be53/8d6e57c2-1622-4e72-8121-f53cfc4a7ae5/DeweySmile_White.png";
const DC_HERO =
  "https://images.squarespace-cdn.com/content/v1/66033d9365686e323e42be53/1711488404624-VJQCHSAIH33IURTG2OZ2/Screenshot+2024-03-26+at+2.41.23%E2%80%AFPM.jpg";

const SUB_BRANDS: Array<{
  name: string;
  tag: string;
  line: string;
  matchToken: string;
  matchKind?: "name" | "category";
}> = [
  {
    name: "Signature Flower",
    tag: "Headline Jars",
    line: "The flagship flower line — hand-harvested, slow-cured, sealed up in jars. Cultivar drops rotate seasonally.",
    matchToken: "Flower",
    matchKind: "category",
  },
  {
    name: "Dewbies",
    tag: "Pre-Rolls",
    line: "Classic Dewey pre-rolls — same Signature flower, rolled tight. Singles and small packs.",
    matchToken: "Dewbie",
  },
  {
    name: "Hella Dewbie",
    tag: "28-Pack Jar",
    line: "The flagship pre-roll jar — 28 individual joints, 14 grams total, ready for a long weekend.",
    matchToken: "Hella",
  },
  {
    name: "Tiny Trees",
    tag: "Value Flower",
    line: "Smaller popcorn-size nugs at a friendlier price. Same lots, same potency profile — just compact.",
    matchToken: "Tiny",
  },
  {
    name: "Matchsticks",
    tag: "Solventless Infused",
    line: "Hash-infused solventless pre-rolls. Flower coated and rolled with Dewey's own live rosin.",
    matchToken: "Matchstick",
  },
  {
    name: "Live Rosin",
    tag: "Solventless Concentrate",
    line: "Heat and pressure only — no solvents, full strain-specific terpenes. Dab format.",
    matchToken: "Rosin",
  },
  {
    name: "Live Resin Vape",
    tag: "510 Cart",
    line: "Live resin vape carts — extracted from fresh-frozen flower so the terps stay loud.",
    matchToken: "Live Resin",
  },
  {
    name: "All-In-One Dab Pen",
    tag: "Disposable",
    line: "All-in-one rechargeable dab pen — Dewey's concentrate format pre-loaded, no cart swap.",
    matchToken: "Dab Pen",
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

export default function DeweyCannabisCoBrandPage({
  brand,
  products,
}: {
  brand: VendorBrand;
  products: Product[];
}) {
  const [activeSubBrand, setActiveSubBrand] = useState<string | null>(null);

  const subBrandCounts = SUB_BRANDS.reduce<Record<string, number>>((acc, sb) => {
    const needle = sb.matchToken.toLowerCase();
    if (sb.matchKind === "category") {
      acc[sb.name] = products.filter((p) => (p.category ?? "").toLowerCase() === needle).length;
    } else {
      acc[sb.name] = products.filter((p) => (p.name ?? "").toLowerCase().includes(needle)).length;
    }
    return acc;
  }, {});

  return (
    <div className="bg-stone-50">
      {/* HERO — facility photo + logo with CSS filter for yellow tinting */}
      <BrandHero
        palette={PALETTE}
        crumb="Dewey Cannabis Co."
        logoNode={
          <Image
            src={DC_LOGO}
            alt="Dewey Cannabis Co. logo"
            fill
            unoptimized
            className="object-contain p-5"
            // Tints the white SVG logo to brand yellow without an extra asset.
            style={{
              filter: "invert(0.85) sepia(1) saturate(8) hue-rotate(5deg) brightness(0.95)",
            }}
          />
        }
        title="Dewey Cannabis Co."
        tagline="Cultivation Meets Curiosity."
        subtitle="PhD-led indoor cannabis out of Pullman, Washington — flower, pre-rolls, infused Matchsticks, live rosin, and dab pens. Same plant scientists behind Dewey Scientific, just with their own jar on the shelf."
        pills={[
          { kind: "muted", label: "Pullman, WA", dot: true },
          { kind: "muted", label: "PhD-Led Cultivation" },
          { kind: "filled", label: `${brand.activeSkus} on our shelf` },
        ]}
        ctas={[
          { href: "/menu", label: "Order Dewey for Pickup →", variant: "primary" },
          {
            href: "https://www.deweycannabis.com/",
            label: "Visit deweycannabis.com ↗",
            variant: "secondary",
            external: true,
          },
        ]}
      >
        <Image
          src={DC_HERO}
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
        headline="Three plant scientists walk into a grow room."
      >
        <p>
          Dewey started as the cultivation arm of Dewey Scientific, a Washington State
          University spinout founded by three Ph.D. plant biologists — Dr. Jordan Zager, Dr.
          Paul Mihalyov, and Dr. Mark Lange. Dewey Scientific does the genomics and breeding
          work; Dewey Cannabis Co. takes those phenotypes and grows them out for the shelf.
        </p>
        <p>
          The grow room sits in Pullman, the same college town as WSU, under WSLCB license
          428617. The legal entity is still Dewey Botanicals LLC — that&apos;s the name on the
          license — but the consumer-facing brand was renamed Dewey Cannabis Co. in 2024 with
          the smile logo and yellow accent identity that fronts every jar today.
        </p>
        <p>
          We carry Dewey at {STORE.name} because the science actually shows up in the jar:
          consistent phenotype expression, terpenes that match the genetics on paper, and a
          cure that lights even. The Hella Dewbie is the easy weekend pickup; Matchsticks if
          you want infused and solventless in the same joint.
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
                The Lineup
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
                Eight formats from one Pullman grow
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
                      ? "bg-[#1f4d2e] border-[#f5c842] shadow-lg ring-2 ring-[#f5c842]/40"
                      : disabled
                        ? "bg-stone-50 border-stone-100 opacity-50 cursor-not-allowed"
                        : "bg-white border-stone-200 hover:border-[#f5c842] hover:shadow-md hover:-translate-y-0.5"
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
                        active ? "bg-[#f5c842] text-[#1f4d2e]" : "bg-[#f5c842]/40 text-[#1f4d2e]"
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
                      active ? "text-[#f5c842]" : count > 0 ? "text-emerald-700" : "text-stone-400"
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

      {/* PRODUCTS */}
      <section id="products" className="bg-stone-50 border-y border-stone-200 scroll-mt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: PALETTE.dark }}
          >
            On Our Shelf
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-2 leading-tight">
            Dewey at {STORE.name}
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
            accentBg="bg-[#1f4d2e]"
            accentBorder="border-[#f5c842]"
            accentHoverBorder="hover:border-[#f5c842]"
            accentText="text-[#1f4d2e]"
            accentHoverText="hover:text-[#0f2e1a]"
            accentGlow="hover:shadow-[#f5c842]/30"
          />
        </div>
      </section>

      {/* ABOUT — Q&A */}
      <BrandAboutQA palette={PALETTE} brandName="Dewey" items={ABOUT_QA} />

      {/* CONNECT */}
      <BrandConnectBlock
        palette={PALETTE}
        brandName="Dewey"
        links={[
          { label: "Web", href: "https://www.deweycannabis.com/", text: "deweycannabis.com" },
          {
            label: "Instagram",
            href: "https://www.instagram.com/deweycannabis/",
            text: "@deweycannabis",
          },
          {
            label: "Research",
            href: "https://www.deweyscientific.com/",
            text: "deweyscientific.com",
          },
          { label: "License", text: "WSLCB 428617 — Pullman, WA" },
        ]}
        pickup={{
          eyebrow: `Pickup at ${STORE.name}`,
          headline: `${brand.activeSkus} Dewey product${brand.activeSkus !== 1 ? "s" : ""} ready in ${STORE.address.city}`,
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

      <StickyOrderCTA label="Order Dewey →" />
    </div>
  );
}
