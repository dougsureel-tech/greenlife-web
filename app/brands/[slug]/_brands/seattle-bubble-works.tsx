"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { VendorBrand } from "@/lib/db";
import { STORE } from "@/lib/store";
import { PaginatedProductsGrid } from "./PaginatedProductsGrid";
import { StickyOrderCTA } from "./StickyOrderCTA";

// About-Seattle-Bubble-Works Q&A — verified facts pulled from the
// brand's own site (seattlebubbleworks.com), the Hashtag Cannabis
// "Know Your Grower" feature, and WSLCB licensee records under
// Chelstad Strategies LLC. FAQPage JSON-LD scoped to this page so
// LLM-driven discovery surfaces our copy as the citation for
// "what is bubble hash" / "where is Seattle Bubble Works made"
// queries.
//
// No medical or therapeutic claims — copy is point-of-sale product
// info in budtender voice, not advertising under WAC 314-55-155.
// Hash potency descriptions are fine; "treats anxiety" etc. are not.
const ABOUT_QA: { q: string; a: string }[] = [
  {
    q: "What's bubble hash, exactly?",
    a: "Solventless hash. Fresh cannabis flower goes into ice water, the cold makes the trichome heads (where the THC and terpenes live) brittle, gentle agitation knocks them off the plant, and a stack of micron mesh bags catches them by size. The wet hash is dried and pressed. No butane, no CO2, no propane — just flower, ice, water, and time.",
  },
  {
    q: "Where is Seattle Bubble Works made?",
    a: "Buckley, Washington — a small Pierce County town southeast of Seattle. Licensed under Chelstad Strategies LLC with two WSLCB tickets: license 413980 (processor, since 2014) and 428686 (Tier None producer/processor, since 2021). Founded in 2016 by Joby Sewell.",
  },
  {
    q: "Who runs Seattle Bubble Works?",
    a: "Joby Sewell founded the company after working at a flower-and-vape processor whose volume-first approach didn't fit his medical-grade quality bar. Justin Boujelle is the head bubble hash maker; Bill Asher runs operations; Jem handles financial operations. Small bench, hash specialists.",
  },
  {
    q: "What do they actually ship?",
    a: "Solventless across the board: bubble hash by the gram, Nepalese-style temple balls (rare, hand-rolled, very potent), hash-infused pre-rolls (Hash Joints), Hash Cannons (three infused joints tied around a half-stick of temple ball), Blunt Bombs (Futurola blunt cones with a full-gram temple ball stick down the middle), party-pack joint jars, full-melt rosin, and Hashtillate (CBD isolate + bubble hash blend).",
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

// Per-brand custom layout — Seattle Bubble Works (Chelstad
// Strategies LLC DBA).
//
// Brand assets reference seattlebubbleworks.com directly per the
// standing rule (vendor logos from the brand's own CDN only). The
// public site lazy-loads images as base64 GIF placeholders, so the
// hero is gradient-driven; the logo is the one asset we have a
// stable direct URL for.
//
// Color palette — deep arctic indigo + ice-water cyan, distinct
// from the 9 prior brand pages (NWCS forest+gold, Phat Panda
// pink+black, Fairwinds teal+sand, MFUSED navy+cyan, Spark
// slate+plaid-red, Bondi blue+coral, OOWEE violet+cream, 2727
// terracotta+cream, Redbird cardinal+ink). The brand identity is
// literally ice water + bubble hash → arctic + frosted accent.
const SBW_LOGO =
  "https://seattlebubbleworks.com/wp-content/uploads/2020/04/SBW-2020-logo-Concentrated-600.png";

// Sub-brand cards drawn from Seattle Bubble Works' own product
// taxonomy (seattlebubbleworks.com/products). Click a card →
// filters the products grid below by product-name substring.
// Hash brands break out by FORMAT (bubble hash vs temple ball vs
// rosin vs hash-infused joint) rather than strain line, which is
// what customers actually shop by.
const SUB_BRANDS: Array<{
  name: string;
  tag: string;
  line: string;
  matchToken: string;
  matchKind?: "name" | "category";
}> = [
  {
    name: "Bubble Hash",
    tag: "Solventless",
    line: "The headline product — strain-specific ice-water hash, sifted through micron mesh, sold by the gram. The starting point of the whole catalog.",
    matchToken: "Bubble Hash",
  },
  {
    name: "Temple Balls",
    tag: "Hand-Rolled",
    line: "Nepalese-style hash balls. Bubble hash slow-cured and hand-rolled into a solid sphere — rare, time-intensive, exceptionally potent.",
    matchToken: "Temple Ball",
  },
  {
    name: "Hash Joints",
    tag: "Pre-Rolls",
    line: "Cannabis flower coated and rolled with their solventless bubble hash. Hash-infused pre-rolls, no kief filler — the real thing.",
    matchToken: "Hash",
  },
  {
    name: "Hash Cannons",
    tag: "Specialty",
    line: "Three hash-infused joints lashed together with hemp wick around a half-gram of temple ball. Built for sharing.",
    matchToken: "Cannon",
  },
  {
    name: "Blunt Bombs",
    tag: "Specialty",
    line: "Three Futurola blunt cones tied around a full-gram temple ball stick down the center. The maximalist option.",
    matchToken: "Blunt",
  },
  {
    name: "Rosin",
    tag: "Full-Melt",
    line: "Solventless rosin pressed from the bubble hash itself — heat and pressure only. Full-melt hash oil for the dab side of the menu.",
    matchToken: "Rosin",
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

export default function SeattleBubbleWorksBrandPage({
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
      <section className="relative overflow-hidden bg-[#0b1d3a] text-white">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-[#0b1d3a] via-[#142d56]/90 to-[#3a8fb7]/55"
        />
        {/* Frosted-water dot pattern — evokes ice crystals + bubble
            hash without leaning on a hero image we don't have a
            stable URL for. Cheap, scalable, on-brand. */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 30%, #a8e0f5 1.5px, transparent 1.5px), radial-gradient(circle at 75% 70%, #a8e0f5 1px, transparent 1px)",
            backgroundSize: "32px 32px, 24px 24px",
          }}
        />

        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#a8e0f5] text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
            <Link href="/brands" className="hover:text-white transition-colors">
              All Brands
            </Link>
            <span className="mx-2 opacity-50">/</span>
            Seattle Bubble Works
          </p>

          <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-10">
            <div className="shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-white shadow-2xl flex items-center justify-center p-5 relative ring-2 ring-[#a8e0f5]/30">
              <Image
                src={SBW_LOGO}
                alt="Seattle Bubble Works logo"
                fill
                unoptimized
                className="object-contain p-5"
              />
            </div>
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Seattle Bubble Works
                <br />
                <span className="text-[#a8e0f5]">Flower. Ice. Water. That&apos;s it.</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-200/90 leading-relaxed">
                Pacific Northwest hash specialists since 2016. Solventless ice-water hash, Nepalese
                temple balls, hash-infused joints, and full-melt rosin — pressed and rolled in
                Buckley, WA.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  <span className="text-[#a8e0f5]">●</span> Buckley, WA
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  Solventless / Ice-Water
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#a8e0f5] text-[#0b1d3a] text-xs font-bold">
                  {brand.activeSkus} on our shelf
                </span>
              </div>
              <div className="flex flex-wrap gap-3 pt-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#a8e0f5] hover:bg-[#c5ecf9] text-[#0b1d3a] text-sm font-bold transition-all shadow-lg hover:-translate-y-0.5"
                >
                  Order SBW Hash for Pickup →
                </Link>
                <a
                  href="https://seattlebubbleworks.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all border border-white/20"
                >
                  Visit seattlebubbleworks.com ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY ---------------------------------------------------------- */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#0b1d3a] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            Our Story
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
            The ancient art of hash-making, dialed in for Washington shelves.
          </h2>
          <div className="space-y-5 text-slate-700 text-lg leading-relaxed">
            <p>
              Joby Sewell started Seattle Bubble Works in 2016 after spending years marketing
              flower and vapes for a processor whose volume-first approach didn&apos;t match his
              quality bar. He went back to the oldest extraction method on the planet — fresh
              flower, ice, water, micron mesh — and built a small bench of specialists around it.
              Justin Boujelle pulls every batch as head hash maker. Bill Asher runs operations. The
              whole company is hash, all the way down.
            </p>
            <p>
              The process is mechanical, not chemical. Cold water locks up the trichome heads where
              the THC and terpenes live. Gentle agitation breaks them off the plant. A graduated
              stack of micron bags sorts them by size — the smaller the mesh, the cleaner the
              wash — and the wet hash is dried, pressed, and graded. No solvents touch the
              material. Ever.
            </p>
            <p>
              We carry Seattle Bubble Works at {STORE.name} because hash is a real craft category
              and they treat it like one. The temple balls are hand-rolled, the joints are coated
              with the actual bubble hash (not kief filler), and the rosin is pressed from their
              own wash — nothing outsourced. If you&apos;re shopping the dab case or the infused
              pre-roll case, this is the bench to start at.
            </p>
          </div>
        </div>
      </section>

      {/* SUB-BRANDS ----------------------------------------------------- */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p className="text-[#0b1d3a] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
                The Lineup
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Six formats, one solventless process
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
                      ? "bg-[#0b1d3a] border-[#a8e0f5] shadow-lg ring-2 ring-[#a8e0f5]/40"
                      : disabled
                        ? "bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed"
                        : "bg-white border-slate-200 hover:border-[#3a8fb7] hover:shadow-md hover:-translate-y-0.5"
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
                        active ? "bg-[#a8e0f5] text-[#0b1d3a]" : "bg-[#a8e0f5]/30 text-[#0b1d3a]"
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
                        ? "text-[#a8e0f5]"
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
          <p className="text-[#0b1d3a] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            On Our Shelf
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-2 leading-tight">
            Seattle Bubble Works at {STORE.name}
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
            accentBg="bg-[#0b1d3a]"
            accentBorder="border-[#3a8fb7]"
            accentHoverBorder="hover:border-[#3a8fb7]"
            accentText="text-[#0b1d3a]"
            accentHoverText="hover:text-[#3a8fb7]"
            accentGlow="hover:shadow-[#a8e0f5]/40"
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
          <p className="text-[#0b1d3a] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            About Seattle Bubble Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
            Quick facts
          </h2>
          <div className="space-y-3">
            {ABOUT_QA.map(({ q, a }) => (
              <details
                key={q}
                open
                className="group rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden open:border-[#3a8fb7] open:bg-white open:shadow-sm transition-all"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none transition-colors">
                  <span className="font-semibold text-slate-800 group-open:text-[#0b1d3a] text-sm leading-snug transition-colors">
                    {q}
                  </span>
                  <svg
                    className="w-5 h-5 shrink-0 text-slate-300 group-open:text-[#3a8fb7] group-open:rotate-180 transition-all duration-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-[#3a8fb7]/20">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONNECT -------------------------------------------------------- */}
      <section className="bg-[#0b1d3a] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <p className="text-[#a8e0f5] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
              Connect with Seattle Bubble Works
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 leading-tight">
              Find them online
            </h2>
            <ul className="space-y-3 text-slate-200">
              <li className="flex items-center gap-3">
                <span className="text-[#a8e0f5] w-20 text-xs font-bold uppercase tracking-wider">
                  Web
                </span>
                <a
                  href="https://seattlebubbleworks.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#a8e0f5]/40"
                >
                  seattlebubbleworks.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#a8e0f5] w-20 text-xs font-bold uppercase tracking-wider">
                  Instagram
                </span>
                <a
                  href="https://www.instagram.com/seattlebubbleworks/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#a8e0f5]/40"
                >
                  @seattlebubbleworks
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#a8e0f5] w-20 text-xs font-bold uppercase tracking-wider">
                  Licenses
                </span>
                <span>WSLCB 413980 + 428686 — Chelstad Strategies LLC, Buckley, WA</span>
              </li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-[#a8e0f5] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
                Pickup at {STORE.name}
              </p>
              <p className="text-xl font-extrabold mb-1">
                {brand.activeSkus} Seattle Bubble Works product{brand.activeSkus !== 1 ? "s" : ""}{" "}
                ready in {STORE.address.city}
              </p>
              <p className="text-sm text-slate-300/90 leading-relaxed">
                Order ahead and your kit&apos;s waiting at the counter. {STORE.address.full}.
                21+ with valid ID. Cash only.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#a8e0f5] hover:bg-[#c5ecf9] text-[#0b1d3a] text-sm font-bold transition-all"
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
        label="Order SBW Hash →"
        bgClass="bg-[#0b1d3a]"
        textClass="text-[#a8e0f5]"
        hoverClass="hover:bg-[#142d56]"
      />
    </div>
  );
}
