"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { VendorBrand } from "@/lib/db";
import { STORE } from "@/lib/store";
import { PaginatedProductsGrid } from "./PaginatedProductsGrid";
import { StickyOrderCTA } from "./StickyOrderCTA";

// About-Redbird Q&A — verified facts pulled from the brand's own site
// (redbird-cannabis.com), Top Shelf Data, and WSLCB licensee records
// (Trueaerogrow LLC, license 413029). FAQPage JSON-LD scoped to this
// page so LLM-driven discovery surfaces our copy as the citation for
// "is Redbird aeroponic" / "where is Redbird grown" queries.
//
// No medical or therapeutic claims — copy is point-of-sale product info
// in budtender voice, not advertising under WAC 314-55-155.
const ABOUT_QA: { q: string; a: string }[] = [
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

const aboutFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ABOUT_QA.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

// Per-brand custom layout — Redbird Cannabis (Trueaerogrow LLC DBA).
//
// Brand assets reference redbird-cannabis.com's Squarespace CDN directly
// per the standing rule (vendor logos from the brand's own CDN only).
// "KO_black" is the knock-out (white-on-dark) logo variant — perfect for
// the cardinal-red hero. If a specific asset path 404s in production the
// surrounding gradient + wordmark hero degrades gracefully.
//
// Color palette — cardinal red + ink black, distinct from the 8 prior
// brand pages (NWCS forest+gold, Phat Panda pink+black, Fairwinds
// teal+sand, MFUSED navy+cyan, Spark slate+plaid-red, Bondi blue+coral,
// OOWEE violet+cream, 2727 terracotta+cream). Matches Redbird's own
// black + cardinal-red visual identity from their site.
const RB_LOGO =
  "https://images.squarespace-cdn.com/content/v1/6511d95f3eb1ba362c729a4c/ff355e9a-9a11-4661-a7ef-669fb1b4830c/Redbird_Logo_Primary_KO_black.png";
const RB_HERO =
  "https://images.squarespace-cdn.com/content/v1/6511d95f3eb1ba362c729a4c/1695677008965-QQJ62AWX6BZVWMYG9VXX/Tropicana-Garlic-6.jpg";

// Sub-brand cards drawn from Redbird's own product line taxonomy
// (redbird-cannabis.com/products). Click a card → filters the products
// grid below by category or product-name substring. We don't have a
// rich sub-brand structure here — Redbird is one cohesive brand — so
// the cards split by FORMAT, which is what customers actually shop by.
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
      {/* HERO ----------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-[#0d0d0d] text-white">
        <Image
          src={RB_HERO}
          alt=""
          fill
          priority
          unoptimized
          aria-hidden
          className="object-cover opacity-30"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-[#0d0d0d] via-[#1a0606]/90 to-[#c1272d]/55"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, transparent 48%, #c1272d 48%, #c1272d 52%, transparent 52%)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#f4b9bc] text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
            <Link href="/brands" className="hover:text-white transition-colors">
              All Brands
            </Link>
            <span className="mx-2 opacity-50">/</span>
            Redbird Cannabis
          </p>

          <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-10">
            <div className="shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-[#0d0d0d] border-2 border-[#c1272d]/40 shadow-2xl flex items-center justify-center p-5 relative">
              <Image
                src={RB_LOGO}
                alt="Redbird Cannabis logo"
                fill
                unoptimized
                className="object-contain p-5"
              />
            </div>
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Redbird Cannabis
                <br />
                <span className="text-[#c1272d]">Consistency, dialed in.</span>
              </h1>
              <p className="text-lg sm:text-xl text-neutral-200/90 leading-relaxed">
                Aeroponic cannabis out of Spokane — roots in mist, every variable locked down,
                year-round. Same flavor, same potency, same quality batch after batch.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  <span className="text-[#c1272d]">●</span> Spokane, WA
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  Aeroponic / CEA
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#c1272d] text-white text-xs font-bold">
                  {brand.activeSkus} on our shelf
                </span>
              </div>
              <div className="flex flex-wrap gap-3 pt-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#c1272d] hover:bg-[#a01f25] text-white text-sm font-bold transition-all shadow-lg hover:-translate-y-0.5"
                >
                  Order Redbird for Pickup →
                </Link>
                <a
                  href="https://redbird-cannabis.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all border border-white/20"
                >
                  Visit redbird-cannabis.com ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY ---------------------------------------------------------- */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#c1272d] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            Our Story
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 mb-8 leading-tight">
            Roots in mist. Variables on lockdown.
          </h2>
          <div className="space-y-5 text-neutral-700 text-lg leading-relaxed">
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
          </div>
        </div>
      </section>

      {/* SUB-BRANDS ----------------------------------------------------- */}
      <section className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p className="text-[#c1272d] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
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
                    <h3
                      className={`font-extrabold text-lg leading-tight ${
                        active ? "text-white" : "text-neutral-900"
                      }`}
                    >
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
                  <p
                    className={`text-sm leading-relaxed ${active ? "text-neutral-300" : "text-neutral-600"}`}
                  >
                    {sb.line}
                  </p>
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-wider mt-3 ${
                      active
                        ? "text-[#c1272d]"
                        : count > 0
                          ? "text-emerald-700"
                          : "text-neutral-400"
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

      {/* PRODUCTS ------------------------------------------------------- */}
      <section id="products" className="bg-neutral-50 border-y border-neutral-200 scroll-mt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#c1272d] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
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

      {/* ABOUT — Q&A ---------------------------------------------------- */}
      <section className="bg-white border-t border-neutral-200">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutFaqSchema) }}
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#c1272d] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            About Redbird
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 mb-8 leading-tight">
            Quick facts
          </h2>
          <div className="space-y-3">
            {ABOUT_QA.map(({ q, a }) => (
              <details
                key={q}
                open
                className="group rounded-2xl border border-neutral-200 bg-neutral-50 overflow-hidden open:border-[#c1272d] open:bg-white open:shadow-sm transition-all"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none transition-colors">
                  <span className="font-semibold text-neutral-800 group-open:text-[#c1272d] text-sm leading-snug transition-colors">
                    {q}
                  </span>
                  <svg
                    className="w-5 h-5 shrink-0 text-neutral-300 group-open:text-[#c1272d] group-open:rotate-180 transition-all duration-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 pt-1 text-neutral-600 text-sm leading-relaxed border-t border-[#c1272d]/20">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONNECT -------------------------------------------------------- */}
      <section className="bg-[#0d0d0d] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <p className="text-[#c1272d] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
              Connect with Redbird
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 leading-tight">
              Find them online
            </h2>
            <ul className="space-y-3 text-neutral-200">
              <li className="flex items-center gap-3">
                <span className="text-[#c1272d] w-20 text-xs font-bold uppercase tracking-wider">
                  Web
                </span>
                <a
                  href="https://redbird-cannabis.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#c1272d]/40"
                >
                  redbird-cannabis.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#c1272d] w-20 text-xs font-bold uppercase tracking-wider">
                  Instagram
                </span>
                <a
                  href="https://www.instagram.com/redbird_wa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#c1272d]/40"
                >
                  @redbird_wa
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#c1272d] w-20 text-xs font-bold uppercase tracking-wider">
                  License
                </span>
                <span>WSLCB 413029 — Trueaerogrow LLC, Spokane, WA</span>
              </li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-[#c1272d] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
                Pickup at {STORE.name}
              </p>
              <p className="text-xl font-extrabold mb-1">
                {brand.activeSkus} Redbird product{brand.activeSkus !== 1 ? "s" : ""} ready in{" "}
                {STORE.address.city}
              </p>
              <p className="text-sm text-neutral-300/90 leading-relaxed">
                Order ahead and your kit&apos;s waiting at the counter. {STORE.address.full}.
                21+ with valid ID. Cash only.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#c1272d] hover:bg-[#a01f25] text-white text-sm font-bold transition-all"
              >
                Order for Pickup →
              </Link>
              <Link
                href="/brands"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold border border-white/20 transition-all"
              >
                ← All Brands
              </Link>
            </div>
          </div>
        </div>
      </section>

      <StickyOrderCTA label="Order Redbird →" />
    </div>
  );
}
