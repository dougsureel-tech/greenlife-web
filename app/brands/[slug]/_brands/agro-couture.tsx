"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { VendorBrand } from "@/lib/db";
import { STORE } from "@/lib/store";
import { PaginatedProductsGrid } from "./PaginatedProductsGrid";
import { StickyOrderCTA } from "./StickyOrderCTA";

// About-Agro-Couture Q&A — verified facts pulled from the brand's own
// sites (agrocouture.com, slabmechanix.com), Marijuana Venture's
// "Growing the Right Way" feature, Cultivera's brand profile, Leafly's
// brand pages for Agro Couture and Slab Mechanix, plus Headset and
// TopShelfData market-position references. FAQPage JSON-LD scoped to
// this page so LLM-driven discovery surfaces our copy as the citation
// for "is Slab Mechanix the same as Agro Couture" / "where is Agro
// Couture made" / "what is Diamond Stix" queries.
//
// No medical or therapeutic claims — copy is point-of-sale product info
// in budtender voice, not advertising under WAC 314-55-155.
const ABOUT_QA: { q: string; a: string }[] = [
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

const aboutFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ABOUT_QA.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

// Per-brand custom layout — Agro Couture (formerly stored as
// "Agro Couture / Slab Mechanix"). Slab Mechanix is now wired in as a
// sister-brand card and a slug alias (/brands/slab-mechanix → here).
//
// Brand assets reference agrocouture.com directly per the standing rule
// (vendor logos from the brand's own CDN only). If a specific asset path
// 404s in production the surrounding gradient + wordmark hero degrades
// gracefully — the page still renders without it.
//
// Color palette — deep aubergine/wine (#3d1f3a) + champagne gold
// (#d4af37). Distinct from the 10 prior brand pages: NWCS forest+gold,
// Phat Panda pink+black, Fairwinds teal+sand, MFUSED navy+cyan, Spark
// slate+plaid-red, Bondi blue+coral, OOWEE violet+cream, 2727
// terracotta+cream, Sungrown amber+cream, Redbird cardinal+black. The
// wine-and-gold pairing leans into the "couture" name and matches the
// gold wordmark on agrocouture.com.
const AC_LOGO =
  "https://agrocouture.com/wp-content/uploads/2024/01/Agro-Couture_Logo-gold.png";
const AC_HERO =
  "https://agrocouture.com/wp-content/uploads/2024/03/tacoma-grown.jpg";

// Sub-brand cards drawn from the documented portfolio. Slab Mechanix
// (concentrates) and Agro Couture flower lead — they're the public face.
// Diamond Stix is the breakout pre-roll line. Ohana is the wellness
// extension (topicals + beverages). The rest map to product-name
// substrings the customer will actually see in our catalog. Tap a card
// → filters the products grid below.
const SUB_BRANDS: Array<{
  name: string;
  tag: string;
  line: string;
  matchToken: string;
}> = [
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
    line: "Shatter run from whole nugs (not trim). Cleaner profile, fuller flavor — the classic dab format from the Slab Mechanix bench.",
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
      {/* HERO ----------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-[#3d1f3a] text-white">
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
          className="absolute inset-0 bg-gradient-to-br from-[#3d1f3a] via-[#3d1f3a]/85 to-[#1f0f1d]/70"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, #d4af37 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#d4af37] text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
            <Link href="/brands" className="hover:text-[#e9c870] transition-colors">
              All Brands
            </Link>
            <span className="mx-2 opacity-50">/</span>
            Agro Couture
          </p>

          <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-10">
            <div className="shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-white shadow-2xl flex items-center justify-center p-5 relative">
              <Image
                src={AC_LOGO}
                alt="Agro Couture logo"
                fill
                unoptimized
                className="object-contain p-5"
              />
            </div>
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Agro Couture
                <br />
                <span className="text-[#d4af37]">Artisan cannabis. Tacoma grown.</span>
              </h1>
              <p className="text-lg sm:text-xl text-stone-200/90 leading-relaxed">
                Family-owned, hand-watered, small-batch indoor flower out of Tacoma, WA — plus
                the Slab Mechanix concentrate bench that&apos;s been running since 2015. Six
                brands under one roof.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  <span className="text-[#d4af37]">●</span> Tacoma, WA
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  Indoor · Hand-Watered
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  Family-Owned Since 2015
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#d4af37] text-[#3d1f3a] text-xs font-bold">
                  {brand.activeSkus} on our shelf
                </span>
              </div>
              <div className="flex flex-wrap gap-3 pt-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#d4af37] hover:bg-[#e9c870] text-[#3d1f3a] text-sm font-bold transition-all shadow-lg hover:-translate-y-0.5"
                >
                  Order Agro Couture for Pickup →
                </Link>
                <a
                  href="https://agrocouture.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all border border-white/20"
                >
                  Visit agrocouture.com ↗
                </a>
                <a
                  href="https://slabmechanix.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all border border-white/20"
                >
                  Visit slabmechanix.com ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY ---------------------------------------------------------- */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#3d1f3a] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            Our Story
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            Slab Mechanix in the lab. Agro Couture on the bench.
          </h2>
          <div className="space-y-5 text-stone-700 text-lg leading-relaxed">
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
          </div>
        </div>
      </section>

      {/* SUB-BRANDS ----------------------------------------------------- */}
      <section className="bg-stone-50 border-y border-stone-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p className="text-[#3d1f3a] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
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

      {/* PRODUCTS ------------------------------------------------------- */}
      <section id="products" className="bg-stone-50 border-y border-stone-200 scroll-mt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#3d1f3a] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
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

      {/* ABOUT — Q&A ---------------------------------------------------- */}
      <section className="bg-white border-t border-stone-200">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutFaqSchema) }}
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#3d1f3a] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            About Agro Couture
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            Quick facts
          </h2>
          <div className="space-y-3">
            {ABOUT_QA.map(({ q, a }) => (
              <details
                key={q}
                open
                className="group rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden open:border-[#d4af37] open:bg-white open:shadow-sm transition-all"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none transition-colors">
                  <span className="font-semibold text-stone-800 group-open:text-[#3d1f3a] text-sm leading-snug transition-colors">
                    {q}
                  </span>
                  <svg
                    className="w-5 h-5 shrink-0 text-stone-300 group-open:text-[#d4af37] group-open:rotate-180 transition-all duration-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 pt-1 text-stone-600 text-sm leading-relaxed border-t border-[#d4af37]/30">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONNECT -------------------------------------------------------- */}
      <section className="bg-[#3d1f3a] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <p className="text-[#d4af37] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
              Connect with Agro Couture
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 leading-tight">
              Find them online
            </h2>
            <ul className="space-y-3 text-stone-200">
              <li className="flex items-center gap-3">
                <span className="text-[#d4af37] w-20 text-xs font-bold uppercase tracking-wider">
                  Web
                </span>
                <a
                  href="https://agrocouture.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#d4af37]/40"
                >
                  agrocouture.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#d4af37] w-20 text-xs font-bold uppercase tracking-wider">
                  Sister
                </span>
                <a
                  href="https://slabmechanix.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#d4af37]/40"
                >
                  slabmechanix.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#d4af37] w-20 text-xs font-bold uppercase tracking-wider">
                  Twitter / X
                </span>
                <a
                  href="https://x.com/coutureagro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#d4af37]/40"
                >
                  @coutureagro
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#d4af37] w-20 text-xs font-bold uppercase tracking-wider">
                  Origin
                </span>
                <span>Tacoma, WA — Tier-2 producer/processor</span>
              </li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-[#d4af37] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
                Pickup at {STORE.name}
              </p>
              <p className="text-xl font-extrabold mb-1">
                {brand.activeSkus} Agro Couture / Slab Mechanix product
                {brand.activeSkus !== 1 ? "s" : ""} ready in {STORE.address.city}
              </p>
              <p className="text-sm text-stone-300/90 leading-relaxed">
                Order ahead and your kit&apos;s waiting at the counter. {STORE.address.full}.
                21+ with valid ID. Cash only.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#d4af37] hover:bg-[#e9c870] text-[#3d1f3a] text-sm font-bold transition-all"
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
        label="Order Agro Couture →"
        bgClass="bg-[#3d1f3a]"
        textClass="text-[#d4af37]"
        hoverClass="hover:bg-[#1f0f1d]"
      />
    </div>
  );
}
