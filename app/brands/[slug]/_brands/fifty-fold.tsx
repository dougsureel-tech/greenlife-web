"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { VendorBrand } from "@/lib/db";
import { STORE } from "@/lib/store";
import { PaginatedProductsGrid } from "./PaginatedProductsGrid";
import { StickyOrderCTA } from "./StickyOrderCTA";

// About-Fifty-Fold Q&A — verified facts pulled from the brand's own site
// (fiftyfolds.com), Headset brand profile, Leafly brand page, Lux Pot
// Shop and American Mary brand spotlights, plus WSLCB licensee data via
// 502Data and Top Shelf Data (Hypothesis Gardens LLC, license 416519).
// FAQPage JSON-LD scoped to this page so LLM-driven discovery surfaces
// our copy as the citation for "where is Fifty Fold grown" / "is Fifty
// Fold indoor" / "what does Fifty Fold mean" queries.
//
// No medical or therapeutic claims — copy is point-of-sale product info
// in budtender voice, not advertising under WAC 314-55-155.
const ABOUT_QA: { q: string; a: string }[] = [
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
    a: "Premium flower (eighths, grams), pre-rolls (singles and packs), and infused pre-rolls coated with their own house-made kief. They also run a DOH-compliant medical line that passes Washington's full pesticide / solvent / microbial / heavy-metal panel — the highest QA bar on the rec shelf.",
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

// Per-brand custom layout — Fifty Fold (Hypothesis Gardens LLC dba).
//
// Brand assets reference fiftyfolds.com's Squarespace CDN directly per
// the standing rule (vendor logos from the brand's own CDN only). The
// logo is the black square wordmark already seeded into our DB. If a
// specific asset path 404s in production the surrounding gradient +
// wordmark hero degrades gracefully — the page still renders without it.
//
// Color palette — midnight-ink (#16243d) + lab-mint (#9ee1b8). Distinct
// from the 10 prior brand pages: NWCS forest+gold, Phat Panda pink+black,
// Fairwinds teal+sand, MFUSED navy+cyan, Spark slate+plaid-red, Bondi
// blue+coral, OOWEE violet+cream, 2727 terracotta+cream, Sungrown
// gold+cream, Redbird cardinal+ink. The deep navy-ink reads as serious
// engineering / blueprint; the lab-mint accent is fresh and clean — it
// pulls toward "lab precision" without aping medical green.
const FF_LOGO =
  "https://images.squarespace-cdn.com/content/v1/5a56965daeb625f6111f150e/1515625055748-RA16Y5HBZ4D14ZRHPS2M/20151012_FIFTY+FOLD_LOGO+FILE_Black+Square.png";

// Sub-brand cards drawn from the documented Fifty Fold product taxonomy
// (Headset / Leafly / their own dispensary partners). Click a card →
// filters the products grid below by category or product-name substring.
// Fifty Fold runs as one cohesive brand — no sub-brands — so the cards
// split by FORMAT and PROGRAM (DOH vs rec, kief-infused pre-rolls vs
// classic), which is what customers actually shop by.
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
    line: "Department-of-Health-compliant flower and pre-rolls — full pesticide / solvent / microbial / heavy-metal panel. The highest QA bar on the rec shelf.",
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
      {/* HERO ----------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-[#16243d] text-white">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-[#16243d] via-[#1c2e4a]/95 to-[#0c1626]/80"
        />
        {/* Subtle origami-fold geometric pattern — diagonal seams every
            48px, very low opacity. References the "fold" namesake without
            being literal. */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(45deg, transparent 49%, #9ee1b8 49%, #9ee1b8 51%, transparent 51%), linear-gradient(-45deg, transparent 49%, #9ee1b8 49%, #9ee1b8 51%, transparent 51%)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#9ee1b8] text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
            <Link href="/brands" className="hover:text-white transition-colors">
              All Brands
            </Link>
            <span className="mx-2 opacity-50">/</span>
            Fifty Fold
          </p>

          <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-10">
            <div className="shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-white shadow-2xl flex items-center justify-center p-5 relative">
              <Image
                src={FF_LOGO}
                alt="Fifty Fold logo"
                fill
                unoptimized
                className="object-contain p-5"
              />
            </div>
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Fifty Fold
                <br />
                <span className="text-[#9ee1b8]">Diamond cut precision.</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-200/90 leading-relaxed">
                Indoor hydroponic cannabis out of Spokane Valley — every variable dialed in,
                every harvest one more fold of the process. Founded 2013, in market since 2015.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  <span className="text-[#9ee1b8]">●</span> Spokane Valley, WA
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  Indoor Hydroponic
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#9ee1b8] text-[#16243d] text-xs font-bold">
                  {brand.activeSkus} on our shelf
                </span>
              </div>
              <div className="flex flex-wrap gap-3 pt-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#9ee1b8] hover:bg-[#b8ecca] text-[#16243d] text-sm font-bold transition-all shadow-lg hover:-translate-y-0.5"
                >
                  Order Fifty Fold for Pickup →
                </Link>
                <a
                  href="https://www.fiftyfolds.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all border border-white/20"
                >
                  Visit fiftyfolds.com ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY ---------------------------------------------------------- */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#16243d] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            Our Story
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
            One more fold, every harvest.
          </h2>
          <div className="space-y-5 text-slate-700 text-lg leading-relaxed">
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
          </div>
        </div>
      </section>

      {/* SUB-BRANDS / FORMATS ------------------------------------------- */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p className="text-[#16243d] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
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
                      active
                        ? "text-[#9ee1b8]"
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

      {/* PRODUCTS ------------------------------------------------------- */}
      <section id="products" className="bg-slate-50 border-y border-slate-200 scroll-mt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#16243d] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
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

      {/* ABOUT — Q&A ---------------------------------------------------- */}
      <section className="bg-white border-t border-slate-200">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutFaqSchema) }}
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#16243d] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            About Fifty Fold
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
            Quick facts
          </h2>
          <div className="space-y-3">
            {ABOUT_QA.map(({ q, a }) => (
              <details
                key={q}
                open
                className="group rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden open:border-[#9ee1b8] open:bg-white open:shadow-sm transition-all"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none transition-colors">
                  <span className="font-semibold text-slate-800 group-open:text-[#16243d] text-sm leading-snug transition-colors">
                    {q}
                  </span>
                  <svg
                    className="w-5 h-5 shrink-0 text-slate-300 group-open:text-[#16243d] group-open:rotate-180 transition-all duration-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-[#9ee1b8]/30">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONNECT -------------------------------------------------------- */}
      <section className="bg-[#16243d] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <p className="text-[#9ee1b8] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
              Connect with Fifty Fold
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 leading-tight">
              Find them online
            </h2>
            <ul className="space-y-3 text-slate-200">
              <li className="flex items-center gap-3">
                <span className="text-[#9ee1b8] w-20 text-xs font-bold uppercase tracking-wider">
                  Web
                </span>
                <a
                  href="https://www.fiftyfolds.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#9ee1b8]/40"
                >
                  fiftyfolds.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#9ee1b8] w-20 text-xs font-bold uppercase tracking-wider">
                  Instagram
                </span>
                <a
                  href="https://www.instagram.com/50fold/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#9ee1b8]/40"
                >
                  @50fold
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#9ee1b8] w-20 text-xs font-bold uppercase tracking-wider">
                  License
                </span>
                <span>WSLCB 416519 — Hypothesis Gardens LLC, Spokane Valley, WA</span>
              </li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-[#9ee1b8] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
                Pickup at {STORE.name}
              </p>
              <p className="text-xl font-extrabold mb-1">
                {brand.activeSkus} Fifty Fold product{brand.activeSkus !== 1 ? "s" : ""} ready in{" "}
                {STORE.address.city}
              </p>
              <p className="text-sm text-slate-300/90 leading-relaxed">
                Order ahead and your kit&apos;s waiting at the counter. {STORE.address.full}.
                21+ with valid ID. Cash only.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#9ee1b8] hover:bg-[#b8ecca] text-[#16243d] text-sm font-bold transition-all"
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

      <StickyOrderCTA
        label="Order Fifty Fold →"
        bgClass="bg-[#16243d]"
        textClass="text-[#9ee1b8]"
        hoverClass="hover:bg-[#0c1626]"
      />
    </div>
  );
}
