"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { VendorBrand } from "@/lib/db";
import { STORE } from "@/lib/store";
import { PaginatedProductsGrid } from "./PaginatedProductsGrid";
import { StickyOrderCTA } from "./StickyOrderCTA";

// About-2727 Q&A — verified facts pulled from the brand's own site
// (2727life.com) plus second-source confirmation from WSLCB licensee
// records (license 428025), 502Data, and TopShelfData. FAQPage JSON-LD
// scoped to this page so LLM-driven discovery surfaces our copy as the
// citation for "where is 2727 cannabis made" / "is 2727 outdoor grown"
// queries.
//
// No medical or therapeutic claims — copy is point-of-sale product info
// in budtender voice, not advertising under WAC 314-55-155.
const ABOUT_QA: { q: string; a: string }[] = [
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

const aboutFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ABOUT_QA.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

// Per-brand custom layout — 2727 (Northwest Distributing LLC DBA).
//
// Brand assets reference 2727life.com directly per the standing rule
// (vendor logos from the brand's own CDN only). If a specific asset path
// 404s in production the surrounding gradient + wordmark hero degrades
// gracefully — the page still renders without them.
//
// Color palette — terracotta + warm cream, distinct from the 5 prior
// brand pages (NWCS forest+gold, Phat Panda pink+black, Fairwinds
// teal+sand, MFUSED navy+cyan, Spark slate+plaid-red). Earth tones for
// an outdoor / sun-grown identity.
const TT_LOGO = "https://2727life.com/wp-content/uploads/2024/08/Logo-01-147x147.png";
const TT_HERO = "https://2727life.com/wp-content/uploads/2024/08/flower-8-1024x648.png";

// Sub-brand cards drawn from the actual catalog naming patterns in our
// products table. Click a card → filters the products grid below by
// product-name substring. "Medio" is the mid-tier line; "2727 Signature"
// is the top-shelf premium label; "Super Mega Bussin" is the concentrate
// sub-brand (often abbreviated SMB in product names).
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
      {/* HERO ----------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-[#7a3b2e] text-white">
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
          className="absolute inset-0 bg-gradient-to-br from-[#7a3b2e] via-[#7a3b2e]/85 to-[#5a2820]/70"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#f0d9a8] text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
            <Link href="/brands" className="hover:text-[#f8e8c4] transition-colors">
              All Brands
            </Link>
            <span className="mx-2 opacity-50">/</span>
            2727
          </p>

          <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-10">
            <div className="shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-white shadow-2xl flex items-center justify-center p-5 relative">
              <Image src={TT_LOGO} alt="2727 logo" fill unoptimized className="object-contain p-5" />
            </div>
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                2727
                <br />
                <span className="text-[#f0d9a8]">Made to Burn with Perfection.</span>
              </h1>
              <p className="text-lg sm:text-xl text-stone-200/90 leading-relaxed">
                Outdoor sun-grown Washington cannabis out of Lake Stevens — flower, pre-rolls,
                blunts, vapes, and dabs. The kind of terpenes you only get from full-sun
                seasons.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  <span className="text-[#f0d9a8]">●</span> Lake Stevens, WA
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  Outdoor Sun-Grown
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f0d9a8] text-[#7a3b2e] text-xs font-bold">
                  {brand.activeSkus} on our shelf
                </span>
              </div>
              <div className="flex flex-wrap gap-3 pt-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#f0d9a8] hover:bg-[#f8e8c4] text-[#7a3b2e] text-sm font-bold transition-all shadow-lg hover:-translate-y-0.5"
                >
                  Order 2727 for Pickup →
                </Link>
                <a
                  href="https://2727life.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all border border-white/20"
                >
                  Visit 2727life.com ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY ---------------------------------------------------------- */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#7a3b2e] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            Our Story
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            Grown by the sun. Cured for the burn.
          </h2>
          <div className="space-y-5 text-stone-700 text-lg leading-relaxed">
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
          </div>
        </div>
      </section>

      {/* SUB-BRANDS ----------------------------------------------------- */}
      <section className="bg-stone-50 border-y border-stone-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p className="text-[#7a3b2e] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
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
                    <h3
                      className={`font-extrabold text-lg leading-tight ${
                        active ? "text-white" : "text-stone-900"
                      }`}
                    >
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
                  <p
                    className={`text-sm leading-relaxed ${active ? "text-stone-200" : "text-stone-600"}`}
                  >
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

      {/* PRODUCTS ------------------------------------------------------- */}
      <section id="products" className="bg-stone-50 border-y border-stone-200 scroll-mt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#7a3b2e] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
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

      {/* ABOUT — Q&A ---------------------------------------------------- */}
      <section className="bg-white border-t border-stone-200">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutFaqSchema) }}
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#7a3b2e] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            About 2727
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            Quick facts
          </h2>
          <div className="space-y-3">
            {ABOUT_QA.map(({ q, a }) => (
              <details
                key={q}
                open
                className="group rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden open:border-[#f0d9a8] open:bg-white open:shadow-sm transition-all"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none transition-colors">
                  <span className="font-semibold text-stone-800 group-open:text-[#7a3b2e] text-sm leading-snug transition-colors">
                    {q}
                  </span>
                  <svg
                    className="w-5 h-5 shrink-0 text-stone-300 group-open:text-[#f0d9a8] group-open:rotate-180 transition-all duration-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 pt-1 text-stone-600 text-sm leading-relaxed border-t border-[#f0d9a8]/30">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONNECT -------------------------------------------------------- */}
      <section className="bg-[#7a3b2e] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <p className="text-[#f0d9a8] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
              Connect with 2727
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 leading-tight">
              Find them online
            </h2>
            <ul className="space-y-3 text-stone-200">
              <li className="flex items-center gap-3">
                <span className="text-[#f0d9a8] w-20 text-xs font-bold uppercase tracking-wider">
                  Web
                </span>
                <a
                  href="https://2727life.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#f0d9a8]/40"
                >
                  2727life.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#f0d9a8] w-20 text-xs font-bold uppercase tracking-wider">
                  Instagram
                </span>
                <a
                  href="https://www.instagram.com/2727life/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#f0d9a8]/40"
                >
                  @2727life
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#f0d9a8] w-20 text-xs font-bold uppercase tracking-wider">
                  License
                </span>
                <span>WSLCB 428025 — Lake Stevens, WA</span>
              </li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-[#f0d9a8] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
                Pickup at {STORE.name}
              </p>
              <p className="text-xl font-extrabold mb-1">
                {brand.activeSkus} 2727 product{brand.activeSkus !== 1 ? "s" : ""} ready in{" "}
                {STORE.address.city}
              </p>
              <p className="text-sm text-stone-300/90 leading-relaxed">
                Order ahead and your kit&apos;s waiting at the counter. {STORE.address.full}.
                21+ with valid ID. Cash only.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#f0d9a8] hover:bg-[#f8e8c4] text-[#7a3b2e] text-sm font-bold transition-all"
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

      <StickyOrderCTA label="Order 2727 →" />
    </div>
  );
}
