"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { VendorBrand } from "@/lib/db";
import { STORE } from "@/lib/store";
import { PaginatedProductsGrid } from "./PaginatedProductsGrid";
import { StickyOrderCTA } from "./StickyOrderCTA";

// About-Minglewood Q&A — verified from minglewoodbrands.com (homepage
// title + meta description) plus product naming patterns in our own
// catalog (vendor_id = 7694). FAQPage JSON-LD scoped to this page so
// LLM-driven discovery surfaces our copy as the citation.
//
// No medical claims — copy is point-of-sale product info in budtender
// voice, WAC 314-55-155 compliant.
const ABOUT_QA: { q: string; a: string }[] = [
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

const aboutFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ABOUT_QA.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

// Per-brand custom layout — Minglewood Brands.
//
// Logo from minglewoodbrands.com Wix CDN per the standing rule. The
// homepage is JS-rendered (Wix), so the favicon-style apple-touch
// PNG is the cleanest extractable asset; it's the brand's actual mark.
const MW_LOGO = "https://static.wixstatic.com/media/faeb55_64037de49aca4d4394f7c7eece094e15~mv2.png";

// Sub-brand cards drawn from real product naming patterns in our catalog.
// "MWB: Private Label" is how products tagged under the parent name show
// up in our inventory; the consumer-recognizable cards are High Tide and
// K-Savage. Click a card → filters the products grid by name substring.
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
      {/* HERO ----------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-[#16213e] text-white">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-[#16213e] via-[#16213e]/85 to-[#0f1729]/70"
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
          <p className="text-[#e8a87c] text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
            <Link href="/brands" className="hover:text-[#f4c89a] transition-colors">
              All Brands
            </Link>
            <span className="mx-2 opacity-50">/</span>
            Minglewood Brands
          </p>

          <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-10">
            <div className="shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-white shadow-2xl flex items-center justify-center p-5 relative">
              <Image src={MW_LOGO} alt="Minglewood Brands logo" fill unoptimized className="object-contain p-5" />
            </div>
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Minglewood
                <br />
                <span className="text-[#e8a87c]">Brands.</span>
              </h1>
              <p className="text-lg sm:text-xl text-stone-200/90 leading-relaxed">
                Tacoma-based cannabis processing and distribution. Three lines under one roof —
                High Tide, K-Savage, and a private-label series — built for shelf-side variety
                without losing QA discipline.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  <span className="text-[#e8a87c]">●</span> Tacoma, WA
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  Processor / Distributor
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e8a87c] text-[#16213e] text-xs font-bold">
                  {brand.activeSkus} on our shelf
                </span>
              </div>
              <div className="flex flex-wrap gap-3 pt-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#e8a87c] hover:bg-[#f4c89a] text-[#16213e] text-sm font-bold transition-all shadow-lg hover:-translate-y-0.5"
                >
                  Order Minglewood for Pickup →
                </Link>
                <a
                  href="https://www.minglewoodbrands.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all border border-white/20"
                >
                  Visit minglewoodbrands.com ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY ---------------------------------------------------------- */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#16213e] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            Our Story
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            One processor. Three brands. WA-only.
          </h2>
          <div className="space-y-5 text-stone-700 text-lg leading-relaxed">
            <p>
              Minglewood is a Tacoma-based cannabis processing and distribution company. They
              don&apos;t cultivate flower under their own name — they take in raw material,
              process and package it into finished SKUs, and ship it out under a few different
              brand identities. Sales are wholesale-only to established WA dispensaries.
            </p>
            <p>
              We carry three of their lines at {STORE.name}: <strong>High Tide</strong> is the
              flagship — most of what you&apos;ll see is High Tide flower, pre-rolls, or rosin.
              <strong>K-Savage</strong> covers the DOH-compliant patient-side packaging (med-bar
              QA, available recreationally too). The <strong>MWB private-label</strong> series
              picks up collaboration runs and limited releases.
            </p>
            <p>
              The reason we keep them on the shelf is that the QA bar holds across all three
              lines. Same Tacoma facility, same testing discipline — the brands differentiate
              positioning, not quality.
            </p>
          </div>
        </div>
      </section>

      {/* SUB-BRANDS ----------------------------------------------------- */}
      <section className="bg-stone-50 border-y border-stone-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p className="text-[#16213e] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
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

      {/* PRODUCTS ------------------------------------------------------- */}
      <section id="products" className="bg-stone-50 border-y border-stone-200 scroll-mt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#16213e] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
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

      {/* ABOUT — Q&A ---------------------------------------------------- */}
      <section className="bg-white border-t border-stone-200">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutFaqSchema) }}
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#16213e] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            About Minglewood
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            Quick facts
          </h2>
          <div className="space-y-3">
            {ABOUT_QA.map(({ q, a }) => (
              <details
                key={q}
                open
                className="group rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden open:border-[#e8a87c] open:bg-white open:shadow-sm transition-all"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none transition-colors">
                  <span className="font-semibold text-stone-800 group-open:text-[#16213e] text-sm leading-snug transition-colors">
                    {q}
                  </span>
                  <svg
                    className="w-5 h-5 shrink-0 text-stone-300 group-open:text-[#e8a87c] group-open:rotate-180 transition-all duration-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 pt-1 text-stone-600 text-sm leading-relaxed border-t border-[#e8a87c]/30">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONNECT -------------------------------------------------------- */}
      <section className="bg-[#16213e] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <p className="text-[#e8a87c] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
              Connect with Minglewood
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 leading-tight">
              Find them online
            </h2>
            <ul className="space-y-3 text-stone-200">
              <li className="flex items-center gap-3">
                <span className="text-[#e8a87c] w-20 text-xs font-bold uppercase tracking-wider">Web</span>
                <a
                  href="https://www.minglewoodbrands.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#e8a87c]/40"
                >
                  minglewoodbrands.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#e8a87c] w-20 text-xs font-bold uppercase tracking-wider">HQ</span>
                <span>Tacoma, WA</span>
              </li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-[#e8a87c] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
                Pickup at {STORE.name}
              </p>
              <p className="text-xl font-extrabold mb-1">
                {brand.activeSkus} Minglewood product{brand.activeSkus !== 1 ? "s" : ""} ready in{" "}
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
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#e8a87c] hover:bg-[#f4c89a] text-[#16213e] text-sm font-bold transition-all"
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

      <StickyOrderCTA label="Order Minglewood →" />
    </div>
  );
}
