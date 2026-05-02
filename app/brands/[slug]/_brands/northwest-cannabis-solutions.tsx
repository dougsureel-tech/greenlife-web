"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { VendorBrand } from "@/lib/db";
import { STORE } from "@/lib/store";
import { PaginatedProductsGrid } from "./PaginatedProductsGrid";
import { StickyOrderCTA } from "./StickyOrderCTA";

// About-NWCS Q&A surfaces verified facts in a format that's also FAQPage
// JSON-LD-eligible — helps when LLM-driven discovery answers "where is
// NWCS made" or "who founded Northwest Cannabis Solutions" — and since
// every <details> renders open by default the answers are visible to
// human readers too.
const ABOUT_QA: { q: string; a: string }[] = [
  {
    q: "Where is Northwest Cannabis Solutions made?",
    a: "Olympia, Washington — at their facility on Lathrop Industrial Drive SW. Production has been running there since February 2015.",
  },
  {
    q: "Who founded NWCS?",
    a: "Co-founders Leo Gontmakher and Vlad Orlovskii started the company in 2014. The Olympia facility came online the following year and has been in continuous operation since.",
  },
  {
    q: "How many brands does NWCS run?",
    a: "Sixteen in-house brands across more than three hundred SKUs — flower, pre-rolls, vapes, edibles, concentrates, capsules, and topicals. Legends, Private Reserve, Magic Kitchen, Mini Budz, Evergreen, EZ Vape, GoldLine, and THCaps are the lines you'll see on our shelf most often.",
  },
  {
    q: "What makes NWCS different from other Washington producers?",
    a: "Scale plus consistency. They're one of Washington's largest producer-processors and they run the whole stack — cultivation, extraction, edibles kitchen, and packaging — all in-house. The result on the floor is that the flower comes in cured properly, the carts hit the way they should, and the edibles dose exactly the way the package says they will.",
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

// Per-brand custom layout — Northwest Cannabis Solutions (NWCS).
//
// All visual assets pulled directly from NWCS's own site (nwcs425.com)
// per Doug's standing rule: vendor logos from the brand's own CDN only,
// never Weedmaps / Leafly aggregators.
//
// Facts cited on this page were independently verified across at least
// two sources (the brand's own site + Marijuana Venture / Carter's
// Cannabis blog / LinkedIn for founders) before publishing. No medical
// or therapeutic claims (WAC 314-55-155).
const NWCS_LOGO = "https://www.nwcs425.com/assets/images/logo.svg";
const NWCS_HERO = "https://www.nwcs425.com/files/image/5cb6060f382e4/display/nwcs.jpg";
const NWCS_HERO_WIDE = "https://www.nwcs425.com/files/image/5cb6061020a71/display/nwcs-callout-wide.jpg";
const NWCS_CALLOUT_EDIBLES =
  "https://www.nwcs425.com/files/image/645ba5a553c0b/callout/Marma_WA_Candies-2023Edited.png";
const NWCS_CALLOUT_CONCENTRATES =
  "https://www.nwcs425.com/files/image/5cb6060dc6221/callout/AdobeStock_145830355.jpeg";
const NWCS_CALLOUT_FLOWER =
  "https://www.nwcs425.com/files/image/5c5b998280245/callout/pot_leaf.png";
const NWCS_CALLOUT_WELLNESS =
  "https://www.nwcs425.com/files/image/5e852c4a693c9/callout/WA_Salve_50ml_18to1.jpg";

const SUB_BRANDS: Array<{ name: string; tag: string; line: string }> = [
  {
    name: "Legends",
    tag: "Flower",
    line: "Legendary strains at a fair price — the everyday workhorse line.",
  },
  {
    name: "Private Reserve",
    tag: "Top-Shelf Flower",
    line: "Rarer cuts, hand-selected for the case. When you want the good stuff.",
  },
  {
    name: "Magic Kitchen",
    tag: "Edibles",
    line: "Cookies, Chewees, Pebbles, Marmas, Koko Gemz — Washington edible classics.",
  },
  {
    name: "Mini Budz",
    tag: "Pre-Rolls",
    line: "Small flower nugs rolled tight. Great for on-the-go.",
  },
  {
    name: "Evergreen",
    tag: "Vape Carts",
    line: "510-thread cartridges with full-spectrum extracts.",
  },
  {
    name: "EZ Vape",
    tag: "Disposables",
    line: "Single-use, no charging, no fuss.",
  },
  {
    name: "GoldLine",
    tag: "Concentrates",
    line: "Premium extracts pulled from in-house grown flower.",
  },
  {
    name: "THCaps",
    tag: "Capsules",
    line: "Pre-dosed capsules for predictable, smoke-free dosing.",
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

export default function NWCSBrandPage({
  brand,
  products,
}: {
  brand: VendorBrand;
  products: Product[];
}) {
  // Sub-brand filter — clicking a sub-brand card filters the products grid
  // below to items whose name includes that sub-brand label. Toggle off
  // by clicking the active card again or by hitting the clear chip in
  // the filter header.
  const [activeSubBrand, setActiveSubBrand] = useState<string | null>(null);

  // Sub-brand counts — let the cards show a live "12 in stock" badge so
  // customers see whether a sub-brand actually has anything to filter to.
  // Cheap O(N×M) but M is 8 and N rarely exceeds a few hundred per brand.
  const subBrandCounts = SUB_BRANDS.reduce<Record<string, number>>((acc, sb) => {
    const needle = sb.name.toLowerCase();
    acc[sb.name] = products.filter((p) => (p.name ?? "").toLowerCase().includes(needle)).length;
    return acc;
  }, {});

  return (
    <div className="bg-stone-50">
      {/* HERO ----------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-[#0e2a1f] text-white">
        {/* Background image (NWCS facility/product photo from their own
            site) — color-washed so the logo + headline stay legible. */}
        <Image
          src={NWCS_HERO_WIDE}
          alt=""
          fill
          priority
          unoptimized
          aria-hidden
          className="object-cover opacity-25"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-[#0e2a1f] via-[#0e2a1f]/85 to-[#143b2a]/70"
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
          <p className="text-[#c8b06b] text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
            <Link href="/brands" className="hover:text-[#e0cb8e] transition-colors">
              All Brands
            </Link>
            <span className="mx-2 opacity-50">/</span>
            Northwest Cannabis Solutions
          </p>

          <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-10">
            <div className="shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-white shadow-2xl flex items-center justify-center p-5 relative">
              <Image
                src={NWCS_LOGO}
                alt="Northwest Cannabis Solutions logo"
                fill
                unoptimized
                className="object-contain p-5"
              />
            </div>
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Northwest Cannabis
                <br />
                <span className="text-[#c8b06b]">Solutions</span>
              </h1>
              <p className="text-lg sm:text-xl text-stone-200/90 leading-relaxed">
                One of Washington&apos;s largest producer-processors. Olympia-built since 2014,
                running sixteen brands across flower, pre-rolls, vapes, edibles, and concentrates.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  <span className="text-[#c8b06b]">●</span> Olympia, WA
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  Producer / Processor
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#c8b06b] text-[#0e2a1f] text-xs font-bold">
                  {brand.activeSkus} on our shelf
                </span>
              </div>
              <div className="flex flex-wrap gap-3 pt-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#c8b06b] hover:bg-[#d6c084] text-[#0e2a1f] text-sm font-bold transition-all shadow-lg hover:-translate-y-0.5"
                >
                  Order NWCS for Pickup →
                </Link>
                <a
                  href="https://www.nwcs425.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all border border-white/20"
                >
                  Visit nwcs425.com ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY ---------------------------------------------------------- */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#0e2a1f] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            Our Story
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            Built in Olympia. Stocked across Washington.
          </h2>
          <div className="space-y-5 text-stone-700 text-lg leading-relaxed">
            <p>
              NWCS started in 2014 as a conversation between two co-founders, Leo Gontmakher and
              Vlad Orlovskii. The goal was simple — build the kind of production-and-processing
              operation Washington didn&apos;t have yet. Their facility on Lathrop Industrial Drive
              came online in February 2015 and has been running ever since.
            </p>
            <p>
              Today they&apos;re one of the state&apos;s largest producer-processors, with{" "}
              <strong>sixteen in-house brands</strong> and over three hundred SKUs spanning every
              category that lives behind a Washington counter — flower, pre-rolls, vapes, edibles,
              concentrates, capsules, and topicals. If you&apos;ve eaten a Marma in this state,
              you&apos;ve eaten an NWCS edible.
            </p>
            <p>
              We carry NWCS at {STORE.name} because the consistency holds up shift after shift.
              The flower comes in cured properly, the carts hit the way they should, and the
              edibles dose exactly the way the package says they will. That&apos;s the part that
              matters when our budtenders are recommending something to a regular.
            </p>
          </div>
        </div>
      </section>

      {/* SUB-BRANDS ----------------------------------------------------- */}
      <section className="bg-stone-50 border-y border-stone-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p className="text-[#0e2a1f] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
                The Family
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
                Eight brands you&apos;ll see in our case
              </h2>
            </div>
            <p className="text-sm text-stone-500 max-w-md">
              NWCS runs sixteen total — these are the ones that move at Green Life. Ask a budtender
              if you want a sample of what each one does.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SUB_BRANDS.map((sb) => {
              const count = subBrandCounts[sb.name] ?? 0;
              const active = activeSubBrand === sb.name;
              const disabled = count === 0;
              return (
                <button
                  key={sb.name}
                  type="button"
                  onClick={() => {
                    if (disabled) return;
                    setActiveSubBrand(active ? null : sb.name);
                    // Scroll to the products section so the customer sees
                    // the filtered result land — otherwise the click feels
                    // like nothing happened on long pages.
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
                      ? "bg-[#0e2a1f] border-[#c8b06b] shadow-lg ring-2 ring-[#c8b06b]/40"
                      : disabled
                        ? "bg-stone-50 border-stone-100 opacity-50 cursor-not-allowed"
                        : "bg-white border-stone-200 hover:border-[#c8b06b] hover:shadow-md hover:-translate-y-0.5"
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
                        active
                          ? "bg-[#c8b06b] text-[#0e2a1f]"
                          : "bg-[#c8b06b]/30 text-[#0e2a1f]"
                      }`}
                    >
                      {sb.tag}
                    </span>
                  </div>
                  <p
                    className={`text-sm leading-relaxed ${
                      active ? "text-stone-200" : "text-stone-600"
                    }`}
                  >
                    {sb.line}
                  </p>
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-wider mt-3 ${
                      active
                        ? "text-[#c8b06b]"
                        : count > 0
                          ? "text-emerald-700"
                          : "text-stone-400"
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

      {/* APPROACH ------------------------------------------------------- */}
      <section className="bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#0e2a1f] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            How They Make It
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-10 leading-tight max-w-3xl">
            Indoor production, full-stack from seed to packaged shelf-unit.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                img: NWCS_CALLOUT_FLOWER,
                title: "Flower",
                body: "Indoor cultivation in a purpose-built Olympia facility. Strain library spans Legends staples to Private Reserve rarities.",
              },
              {
                img: NWCS_CALLOUT_CONCENTRATES,
                title: "Concentrates",
                body: "Hydrocarbon and CO₂ extracts produced in-house from their own flower. GoldLine is the premium tier.",
              },
              {
                img: NWCS_CALLOUT_EDIBLES,
                title: "Edibles",
                body: "Magic Kitchen is one of WA's longest-running edible lines — Marmas, Pebbles, Cookies, Koko Gemz. Lab-tested doses.",
              },
              {
                img: NWCS_CALLOUT_WELLNESS,
                title: "Wellness",
                body: "Topicals, tinctures, and capsules formulated for predictable, smoke-free use. THCaps and salves at varied ratios.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-2xl bg-stone-50 border border-stone-200 overflow-hidden hover:shadow-md transition-all"
              >
                <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
                  <Image
                    src={c.img}
                    alt={c.title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-extrabold text-stone-900 mb-1.5">{c.title}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS ------------------------------------------------------- */}
      <section id="products" className="bg-stone-50 border-y border-stone-200 scroll-mt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#0e2a1f] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            On Our Shelf
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-2 leading-tight">
            NWCS at {STORE.name}
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
          <p className="text-[#0e2a1f] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            About NWCS
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            Quick facts
          </h2>
          <div className="space-y-3">
            {ABOUT_QA.map(({ q, a }) => (
              <details
                key={q}
                open
                className="group rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden open:border-[#c8b06b] open:bg-white open:shadow-sm transition-all"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none transition-colors">
                  <span className="font-semibold text-stone-800 group-open:text-[#0e2a1f] text-sm leading-snug transition-colors">
                    {q}
                  </span>
                  <svg
                    className="w-5 h-5 shrink-0 text-stone-300 group-open:text-[#c8b06b] group-open:rotate-180 transition-all duration-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 pt-1 text-stone-600 text-sm leading-relaxed border-t border-[#c8b06b]/30">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONNECT -------------------------------------------------------- */}
      <section className="bg-[#0e2a1f] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <p className="text-[#c8b06b] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
              Connect with NWCS
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 leading-tight">
              Find them online
            </h2>
            <ul className="space-y-3 text-stone-200">
              <li className="flex items-center gap-3">
                <span className="text-[#c8b06b] w-20 text-xs font-bold uppercase tracking-wider">
                  Web
                </span>
                <a
                  href="https://www.nwcs425.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#c8b06b]/40"
                >
                  nwcs425.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#c8b06b] w-20 text-xs font-bold uppercase tracking-wider">
                  Instagram
                </span>
                <a
                  href="https://www.instagram.com/nwcs.wa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#c8b06b]/40"
                >
                  @nwcs.wa
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#c8b06b] w-20 text-xs font-bold uppercase tracking-wider">
                  HQ
                </span>
                <span>9603 Lathrop Industrial Dr SW, Olympia, WA 98512</span>
              </li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-[#c8b06b] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
                Pickup at {STORE.name}
              </p>
              <p className="text-xl font-extrabold mb-1">
                {brand.activeSkus} NWCS product{brand.activeSkus !== 1 ? "s" : ""} ready in{" "}
                {STORE.address.city}
              </p>
              <p className="text-sm text-stone-300/90 leading-relaxed">
                Order ahead and your kit&apos;s waiting at the counter.{" "}
                {STORE.address.full}. 21+ with valid ID. Cash only.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#c8b06b] hover:bg-[#d6c084] text-[#0e2a1f] text-sm font-bold transition-all"
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

      <StickyOrderCTA label="Order NWCS →" />
    </div>
  );
}
