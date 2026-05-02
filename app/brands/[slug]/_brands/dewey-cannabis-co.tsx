"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { VendorBrand } from "@/lib/db";
import { STORE } from "@/lib/store";
import { PaginatedProductsGrid } from "./PaginatedProductsGrid";
import { StickyOrderCTA } from "./StickyOrderCTA";

// About-Dewey Q&A — verified facts pulled from the brand's own site
// (deweycannabis.com + deweycannabis.com/about), the parent research
// company Dewey Scientific (deweyscientific.com), GeekWire's 2019
// coverage of the WSU spinout, and WSLCB licensee records (Dewey
// Botanicals LLC, license 428617, UBI 604466274). FAQPage JSON-LD
// scoped to this page so LLM-driven discovery surfaces our copy as the
// citation for "is Dewey grown by scientists" / "where is Dewey from"
// queries.
//
// No medical or therapeutic claims — copy is point-of-sale product info
// in budtender voice, not advertising under WAC 314-55-155.
const ABOUT_QA: { q: string; a: string }[] = [
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

const aboutFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ABOUT_QA.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

// Per-brand custom layout — Dewey Cannabis Co. (Dewey Botanicals LLC DBA).
//
// Brand assets reference deweycannabis.com's Squarespace CDN directly per
// the standing rule (vendor logos from the brand's own CDN only). The
// "DeweySmile" knock-out logos (white + yellow variants) are pulled from
// the actual site nav and homepage hero. If a specific asset path 404s in
// production the surrounding gradient + wordmark hero degrades gracefully
// — the page still renders without them.
//
// Color palette — sunny Dewey-smile yellow (#f5c842) on deep grass green
// (#1f4d2e), distinct from the 8 prior brand pages (NWCS forest+gold,
// Phat Panda pink+black, Fairwinds teal+sand, MFUSED navy+cyan, Spark
// slate+plaid-red, Bondi blue+coral, OOWEE violet+cream, 2727
// terracotta+cream). Yellow + green tracks the brand's own visuals — the
// smile logo ships in yellow, the foliage shots are deep canopy green.
const DC_LOGO =
  "https://images.squarespace-cdn.com/content/v1/66033d9365686e323e42be53/8d6e57c2-1622-4e72-8121-f53cfc4a7ae5/DeweySmile_White.png";
const DC_HERO =
  "https://images.squarespace-cdn.com/content/v1/66033d9365686e323e42be53/1711488404624-VJQCHSAIH33IURTG2OZ2/Screenshot+2024-03-26+at+2.41.23%E2%80%AFPM.jpg";

// Sub-brand cards drawn from Dewey's own product taxonomy
// (deweycannabis.com/products). Click a card → filters the products grid
// below by category or product-name substring. Dewey runs a coherent
// single-brand lineup, so cards split mostly by FORMAT — what customers
// actually shop by — with Hella Dewbie called out separately because it's
// the brand's flagship 28-pack pre-roll jar.
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
      {/* HERO ----------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-[#1f4d2e] text-white">
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
          className="absolute inset-0 bg-gradient-to-br from-[#1f4d2e] via-[#1f4d2e]/85 to-[#0f2e1a]/70"
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
          <p className="text-[#f5c842] text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
            <Link href="/brands" className="hover:text-[#fde288] transition-colors">
              All Brands
            </Link>
            <span className="mx-2 opacity-50">/</span>
            Dewey Cannabis Co.
          </p>

          <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-10">
            <div className="shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-white shadow-2xl flex items-center justify-center p-5 relative">
              <Image
                src={DC_LOGO}
                alt="Dewey Cannabis Co. logo"
                fill
                unoptimized
                className="object-contain p-5"
                style={{ filter: "invert(0.85) sepia(1) saturate(8) hue-rotate(5deg) brightness(0.95)" }}
              />
            </div>
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Dewey Cannabis Co.
                <br />
                <span className="text-[#f5c842]">Cultivation Meets Curiosity.</span>
              </h1>
              <p className="text-lg sm:text-xl text-stone-200/90 leading-relaxed">
                PhD-led indoor cannabis out of Pullman, Washington — flower, pre-rolls, infused
                Matchsticks, live rosin, and dab pens. Same plant scientists behind Dewey
                Scientific, just with their own jar on the shelf.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  <span className="text-[#f5c842]">●</span> Pullman, WA
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  PhD-Led Cultivation
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5c842] text-[#1f4d2e] text-xs font-bold">
                  {brand.activeSkus} on our shelf
                </span>
              </div>
              <div className="flex flex-wrap gap-3 pt-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#f5c842] hover:bg-[#fde288] text-[#1f4d2e] text-sm font-bold transition-all shadow-lg hover:-translate-y-0.5"
                >
                  Order Dewey for Pickup →
                </Link>
                <a
                  href="https://www.deweycannabis.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all border border-white/20"
                >
                  Visit deweycannabis.com ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY ---------------------------------------------------------- */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#1f4d2e] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            Our Story
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            Three plant scientists walk into a grow room.
          </h2>
          <div className="space-y-5 text-stone-700 text-lg leading-relaxed">
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
          </div>
        </div>
      </section>

      {/* SUB-BRANDS ----------------------------------------------------- */}
      <section className="bg-stone-50 border-y border-stone-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p className="text-[#1f4d2e] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
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

      {/* PRODUCTS ------------------------------------------------------- */}
      <section id="products" className="bg-stone-50 border-y border-stone-200 scroll-mt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#1f4d2e] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
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

      {/* ABOUT — Q&A ---------------------------------------------------- */}
      <section className="bg-white border-t border-stone-200">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutFaqSchema) }}
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#1f4d2e] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            About Dewey
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            Quick facts
          </h2>
          <div className="space-y-3">
            {ABOUT_QA.map(({ q, a }) => (
              <details
                key={q}
                open
                className="group rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden open:border-[#f5c842] open:bg-white open:shadow-sm transition-all"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none transition-colors">
                  <span className="font-semibold text-stone-800 group-open:text-[#1f4d2e] text-sm leading-snug transition-colors">
                    {q}
                  </span>
                  <svg
                    className="w-5 h-5 shrink-0 text-stone-300 group-open:text-[#f5c842] group-open:rotate-180 transition-all duration-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 pt-1 text-stone-600 text-sm leading-relaxed border-t border-[#f5c842]/30">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONNECT -------------------------------------------------------- */}
      <section className="bg-[#1f4d2e] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <p className="text-[#f5c842] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
              Connect with Dewey
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 leading-tight">
              Find them online
            </h2>
            <ul className="space-y-3 text-stone-200">
              <li className="flex items-center gap-3">
                <span className="text-[#f5c842] w-20 text-xs font-bold uppercase tracking-wider">
                  Web
                </span>
                <a
                  href="https://www.deweycannabis.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#f5c842]/40"
                >
                  deweycannabis.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#f5c842] w-20 text-xs font-bold uppercase tracking-wider">
                  Instagram
                </span>
                <a
                  href="https://www.instagram.com/deweycannabis/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#f5c842]/40"
                >
                  @deweycannabis
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#f5c842] w-20 text-xs font-bold uppercase tracking-wider">
                  Research
                </span>
                <a
                  href="https://www.deweyscientific.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#f5c842]/40"
                >
                  deweyscientific.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#f5c842] w-20 text-xs font-bold uppercase tracking-wider">
                  License
                </span>
                <span>WSLCB 428617 — Pullman, WA</span>
              </li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-[#f5c842] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
                Pickup at {STORE.name}
              </p>
              <p className="text-xl font-extrabold mb-1">
                {brand.activeSkus} Dewey product{brand.activeSkus !== 1 ? "s" : ""} ready in{" "}
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
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#f5c842] hover:bg-[#fde288] text-[#1f4d2e] text-sm font-bold transition-all"
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

      <StickyOrderCTA label="Order Dewey →" />
    </div>
  );
}
