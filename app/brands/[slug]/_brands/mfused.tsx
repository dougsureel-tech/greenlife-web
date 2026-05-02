"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { VendorBrand } from "@/lib/db";
import { STORE } from "@/lib/store";
import { PaginatedProductsGrid } from "./PaginatedProductsGrid";
import { StickyOrderCTA } from "./StickyOrderCTA";

// About-MFUSED Q&A — verified facts pulled from mfused.com plus
// independent confirmation from Marijuana Venture (Jeffery Freeman Jr.
// profile) and the Washington BBB business profile. Rendered as
// <details open> elements that emit FAQPage JSON-LD so LLM-driven
// discovery surfaces clean answers for "where is MFUSED made" /
// "who founded MFUSED" / "what is Super Fog" queries.
//
// No medical or therapeutic claims — copy describes product types and
// THC ratios only. WAC 314-55-155 governs external advertising; this
// page is point-of-sale product info in budtender voice.
const ABOUT_QA: { q: string; a: string }[] = [
  {
    q: "Where is MFUSED made?",
    a: "Seattle, Washington — at their facility on 4th Ave S in the Georgetown industrial district. They've been processing cannabis there since 2012.",
  },
  {
    q: "Who founded MFUSED?",
    a: "Co-founders Adam Melero, Yung Tan, and Jeffery Freeman Jr. The company started in 2012 and Freeman is still on the leadership team as Chief Sales Officer. Marijuana Venture has called MFUSED the largest minority-owned cannabis company in Washington.",
  },
  {
    q: "What is Super Fog?",
    a: "MFUSED's flagship vape platform — a smart all-in-one device with a digital screen, three heat settings, and the Jefé atomizer. The line splits four ways: VIBES (mild and approachable), TWISTED (THCa diamonds + natural terpenes), FIRE (THCa + live resin terpenes), and LOUD (full-spectrum, high-terpene extract).",
  },
  {
    q: "What's the difference between MFUSED and other Washington vape brands?",
    a: "Scale and the hardware. MFUSED is consistently among Washington's top-selling cartridge brands — they process oil at volume from a network of partner farms and they engineer their own hardware (ION cartridge, Jefé AIO, Super Fog Plus screen). The result on the shelf is a cart that hits the way it should every time and a disposable that doesn't die mid-session.",
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

// Per-brand custom layout — MFUSED.
//
// All visual assets pulled directly from mfused.com per Doug's standing
// rule: vendor logos from the brand's own site/CDN only, never Weedmaps
// or Leafly aggregators. If any of these specific asset paths 404 in
// production, the surrounding gradient + wordmark hero degrades
// gracefully — the page still renders cleanly without them.
//
// Color palette — electric cyan + midnight navy. Reads as vape-tech /
// fog / electric, distinct from NWCS deep-forest+tobacco-gold and Phat
// Panda hot-pink+panda-black so the four custom brand pages don't feel
// templated when a customer flips between them.
const MFUSED_LOGO = "https://images.squarespace-cdn.com/content/v1/615e1a4988dec77d8d5e6a3a/mfused-logo.png";
const MFUSED_HERO = "https://www.mfused.com/s/Mfused-Super-Fog-Hero.jpg";

const SUB_BRANDS: Array<{ name: string; tag: string; line: string }> = [
  {
    name: "Super Fog",
    tag: "Smart Vape AIO",
    line: "The flagship — Jefé all-in-one disposable with a digital screen, three heat settings, and the Spark Button. Comes in VIBES, TWISTED, FIRE, and LOUD.",
  },
  {
    name: "ION",
    tag: "510 Cartridges",
    line: "Reengineered cartridge — proprietary mouthpiece, stainless steel internals, glass tank, leak-resistant. Universal 510 thread.",
  },
  {
    name: "Jefé",
    tag: "Disposables",
    line: "All-in-one disposable vape. Cold Start primer, adjustable heat, no charging. The grab-and-go format.",
  },
  {
    name: "Fattys",
    tag: "Pre-Rolls",
    line: "Infused pre-rolls — Super Fog oil rolled into flower. Sold in 1g and multi-packs.",
  },
  {
    name: "Twisted",
    tag: "High-Strength",
    line: "Melted THCa diamonds plus all-natural terpenes. Flavor-forward and potent.",
  },
  {
    name: "Fire",
    tag: "Live Resin",
    line: "THCa diamonds plus live resin terpenes. The full-spectrum-style hit without the price of solventless.",
  },
  {
    name: "Loud",
    tag: "High-Terpene",
    line: "Full-spectrum extract that leans terpene-heavy. The flavor pick.",
  },
  {
    name: "Vibes",
    tag: "Approachable",
    line: "The lower-strength tier — easier on the lungs, milder onset. Good entry point if you're new to high-THC vapes.",
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

export default function MfusedBrandPage({
  brand,
  products,
}: {
  brand: VendorBrand;
  products: Product[];
}) {
  // Sub-brand filter — same pattern as NWCS / Phat Panda. Click a
  // sub-brand card and the products grid below filters to items whose
  // name contains that sub-brand label (case-insensitive). Click again
  // or hit the chip's clear button to reset.
  const [activeSubBrand, setActiveSubBrand] = useState<string | null>(null);

  // Cheap O(N×M) sub-brand counts so each card can show "12 on shelf"
  // or dim itself when nothing matches. M=8 sub-brands, N≈600 SKUs at
  // peak — well under perceptual budget on render.
  const subBrandCounts = SUB_BRANDS.reduce<Record<string, number>>((acc, sb) => {
    const needle = sb.name.toLowerCase();
    acc[sb.name] = products.filter((p) => (p.name ?? "").toLowerCase().includes(needle)).length;
    return acc;
  }, {});

  return (
    <div className="bg-stone-50">
      {/* HERO ----------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-[#0a1628] text-white">
        {/* Background facility/product photo from mfused.com — washed
            down so the wordmark + headline stay legible on small
            screens. */}
        <Image
          src={MFUSED_HERO}
          alt=""
          fill
          priority
          unoptimized
          aria-hidden
          className="object-cover opacity-20"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0a1628]/85 to-[#06b6d4]/30"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(circle, #06b6d4 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#06b6d4] text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
            <Link href="/brands" className="hover:text-[#22d3ee] transition-colors">
              All Brands
            </Link>
            <span className="mx-2 opacity-50">/</span>
            MFUSED
          </p>

          <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-10">
            <div className="shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-white shadow-2xl flex items-center justify-center p-5 relative">
              <Image
                src={MFUSED_LOGO}
                alt="MFUSED logo"
                fill
                unoptimized
                className="object-contain p-5"
              />
            </div>
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                MFUSED
                <br />
                <span className="text-[#06b6d4]">Super Fog</span>
              </h1>
              <p className="text-lg sm:text-xl text-stone-200/90 leading-relaxed">
                Seattle-built since 2012. One of Washington&apos;s top-selling cartridge brands —
                Super Fog AIO, ION carts, Jefé disposables, Fattys pre-rolls.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  <span className="text-[#06b6d4]">●</span> Seattle, WA
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  Producer / Processor
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#06b6d4] text-[#0a1628] text-xs font-bold">
                  {brand.activeSkus} on our shelf
                </span>
              </div>
              <div className="flex flex-wrap gap-3 pt-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#06b6d4] hover:bg-[#22d3ee] text-[#0a1628] text-sm font-bold transition-all shadow-lg hover:-translate-y-0.5"
                >
                  Order MFUSED for Pickup →
                </Link>
                <a
                  href="https://www.mfused.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all border border-white/20"
                >
                  Visit mfused.com ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY ---------------------------------------------------------- */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#0a1628] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            Our Story
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            Built in Seattle. Stocked across Washington.
          </h2>
          <div className="space-y-5 text-stone-700 text-lg leading-relaxed">
            <p>
              MFUSED started in 2012 — co-founded by Adam Melero, Yung Tan, and Jeffery Freeman Jr.
              Freeman had been operating in Washington&apos;s medical space since 2010, and the
              MFUSED launch was his bet that purpose-engineered hardware plus high-purity oil would
              beat the convenience-store cart that defined the early I-502 vape market. The bet
              paid out. Marijuana Venture has called MFUSED the largest minority-owned cannabis
              company in Washington.
            </p>
            <p>
              Today they run the operation out of <strong>Seattle&apos;s Georgetown industrial
              district</strong>, processing oil at volume from a network of partner farms and
              shipping into Washington, Arizona, and New York. The Super Fog Jefé all-in-one is
              the flagship — a vape with a digital screen, three heat settings, and a Spark Button
              that walks the line between &quot;disposable&quot; and &quot;serious device.&quot;
              The ION cartridge is their answer to the standard 510: glass tank, stainless internals,
              proprietary mouthpiece.
            </p>
            <p>
              We carry MFUSED at {STORE.name} because the consistency holds up. The carts hit the
              way they should, the disposables don&apos;t die mid-session, and the Super Fog flavor
              tiers (VIBES / TWISTED / FIRE / LOUD) make it easy to point a customer at exactly
              the experience they&apos;re asking for. Ask a budtender if you want a sample of what
              each tier does.
            </p>
          </div>
        </div>
      </section>

      {/* SUB-BRANDS ----------------------------------------------------- */}
      <section className="bg-stone-50 border-y border-stone-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p className="text-[#0a1628] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
                The Lineup
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
                Eight ways to find what you&apos;re after
              </h2>
            </div>
            <p className="text-sm text-stone-500 max-w-md">
              Hardware tier, cartridge format, or Super Fog flavor — tap a card to filter the live
              menu below to just that line.
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
                      ? "bg-[#0a1628] border-[#06b6d4] shadow-lg ring-2 ring-[#06b6d4]/40"
                      : disabled
                        ? "bg-stone-50 border-stone-100 opacity-50 cursor-not-allowed"
                        : "bg-white border-stone-200 hover:border-[#06b6d4] hover:shadow-md hover:-translate-y-0.5"
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
                          ? "bg-[#06b6d4] text-[#0a1628]"
                          : "bg-[#06b6d4]/15 text-[#0a1628]"
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
                        ? "text-[#06b6d4]"
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
          <p className="text-[#0a1628] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            How They Make It
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-10 leading-tight max-w-3xl">
            Hardware plus high-purity oil. Both engineered in-house.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                emoji: "💨",
                title: "Smart AIO",
                body: "Super Fog Jefé Plus — digital screen, three heat settings, dosing timer, battery monitor. The most-stocked MFUSED format on our wall.",
              },
              {
                emoji: "🛢️",
                title: "ION Cartridges",
                body: "Glass tank, stainless steel internals, proprietary mouthpiece, leak-resistant. Universal 510 thread fits any battery you already own.",
              },
              {
                emoji: "💎",
                title: "THCa Concentrates",
                body: "Twisted and Fire tiers use melted THCa diamonds — Twisted with all-natural terpenes, Fire with live resin terpenes for a fuller flavor profile.",
              },
              {
                emoji: "🫙",
                title: "Infused Pre-Rolls",
                body: "Fattys are flower rolled with Super Fog oil through it. Single 1g and multi-pack formats — the 'no-vape' way to get the same line.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-2xl bg-stone-50 border border-stone-200 overflow-hidden hover:shadow-md transition-all"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-[#cffafe] to-[#a5f3fc] flex items-center justify-center text-6xl">
                  <span aria-hidden>{c.emoji}</span>
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
          <p className="text-[#0a1628] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            On Our Shelf
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-2 leading-tight">
            MFUSED at {STORE.name}
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
            accentBg={"bg-[#0a1628]"}
            accentBorder={"border-[#06b6d4]"}
            accentHoverBorder={"hover:border-[#06b6d4]"}
            accentText={"text-[#0a1628]"}
            accentHoverText={"hover:text-[#0e7490]"}
            accentGlow={"hover:shadow-[#06b6d4]/30"}
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
          <p className="text-[#0a1628] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            About MFUSED
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            Quick facts
          </h2>
          <div className="space-y-3">
            {ABOUT_QA.map(({ q, a }) => (
              <details
                key={q}
                open
                className="group rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden open:border-[#06b6d4] open:bg-white open:shadow-sm transition-all"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none transition-colors">
                  <span className="font-semibold text-stone-800 group-open:text-[#0a1628] text-sm leading-snug transition-colors">
                    {q}
                  </span>
                  <svg
                    className="w-5 h-5 shrink-0 text-stone-300 group-open:text-[#06b6d4] group-open:rotate-180 transition-all duration-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 pt-1 text-stone-600 text-sm leading-relaxed border-t border-[#06b6d4]/30">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONNECT -------------------------------------------------------- */}
      <section className="bg-[#0a1628] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <p className="text-[#06b6d4] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
              Connect with MFUSED
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 leading-tight">
              Find them online
            </h2>
            <ul className="space-y-3 text-stone-200">
              <li className="flex items-center gap-3">
                <span className="text-[#06b6d4] w-20 text-xs font-bold uppercase tracking-wider">
                  Web
                </span>
                <a
                  href="https://www.mfused.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#06b6d4]/40"
                >
                  mfused.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#06b6d4] w-20 text-xs font-bold uppercase tracking-wider">
                  Super Fog
                </span>
                <a
                  href="https://www.mfused.com/super-fog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#06b6d4]/40"
                >
                  mfused.com/super-fog
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#06b6d4] w-20 text-xs font-bold uppercase tracking-wider">
                  Instagram
                </span>
                <a
                  href="https://www.instagram.com/mfusedculture/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#06b6d4]/40"
                >
                  @mfusedculture
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#06b6d4] w-20 text-xs font-bold uppercase tracking-wider">
                  HQ
                </span>
                <span>6527 4th Ave S, Seattle, WA 98108</span>
              </li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-[#06b6d4] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
                Pickup at {STORE.name}
              </p>
              <p className="text-xl font-extrabold mb-1">
                {brand.activeSkus} MFUSED product{brand.activeSkus !== 1 ? "s" : ""} ready in{" "}
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
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#06b6d4] hover:bg-[#22d3ee] text-[#0a1628] text-sm font-bold transition-all"
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
        label="Order MFUSED →"
        bgClass="bg-[#0a1628]"
        textClass="text-[#06b6d4]"
        hoverClass="hover:bg-[#0e1f33]"
      />
    </div>
  );
}
