"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { VendorBrand } from "@/lib/db";
import { STORE } from "@/lib/store";
import { PaginatedProductsGrid } from "./PaginatedProductsGrid";
import { StickyOrderCTA } from "./StickyOrderCTA";

// About-Fairwinds Q&A — verified facts pulled from the brand's own site
// (fairwindscannabis.com) plus second-source confirmation from Marijuana
// Venture and The Sesh Seattle. Rendered as <details open> so the answers
// are visible to human readers AND emit FAQPage JSON-LD so LLM-driven
// discovery surfaces clean answers for "where is Fairwinds made" / "who
// founded Fairwinds" queries.
//
// WAC 314-55-155 critical here — Fairwinds positions wellness/CBD lines.
// Copy stays on product-info ("CBD-rich tincture", "1:1 THC:CBD ratio")
// with no therapeutic implication. No "treats", "cures", "relieves" — those
// are medical claims and not allowed on cannabis advertising in WA.
const ABOUT_QA: { q: string; a: string }[] = [
  {
    q: "Where is Fairwinds made?",
    a: "Vancouver, Washington — at their cultivation-and-manufacturing facility just across the river from Portland. They've been operating there since 2014.",
  },
  {
    q: "Who founded Fairwinds?",
    a: "James and Wendy Hull. Both left federal-government careers — James was an engineer building ships for federal contractors, Wendy was a senior executive at the Department of Transportation — and started Fairwinds in 2014 to focus on highly-engineered, nutraceutical-style cannabis wellness products.",
  },
  {
    q: "What product lines does Fairwinds run?",
    a: "Tinctures, capsules, vape cartridges, topicals, FECO, inhalers, and suppositories. Companion is the pet-formulated tincture line. FLOW is the topical line — Cream and Gel. Ratio tinctures and capsules are sold by THC:CBD ratio (1:1, 5:1, 10:1, etc.) so customers can match a ratio to what they're looking for.",
  },
  {
    q: "What makes Fairwinds different from other Washington producers?",
    a: "They don't sell flower. Everything they grow gets extracted in-house and goes into a finished product — capsule, tincture, topical, or vape. The cultivation facility is fully automated, runs zero pesticides with HEPA-filtered grow rooms, and the formulations lean on eastern-medicine herbal blends alongside the cannabis extract. By 2019 their FLOW Cream was the third-highest-revenue product in the state.",
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

// Per-brand custom layout — Fairwinds Manufacturing.
//
// Brand assets reference fairwindscannabis.com directly (the brand's own
// domain) per Doug's standing rule: vendor logos from the brand's own
// site/CDN only, never Weedmaps / Leafly aggregators. If any of these
// specific asset paths 404 in production, the surrounding gradient + headline
// hero degrades gracefully — the page still renders cleanly without them.
//
// Color palette — deep ocean teal + warm copper/sand. Pulled from
// Fairwinds' own visual language (clinical-wellness, maritime-name brand
// — "fair winds" being a sailing term) and visibly distinct from NWCS
// (deep forest + tobacco gold) and Phat Panda (hot pink + black).
const FAIRWINDS_LOGO =
  "https://fairwindscannabis.com/wp-content/uploads/2020/12/fairwinds-logo.png";
const FAIRWINDS_HERO =
  "https://fairwindscannabis.com/wp-content/uploads/2021/01/fairwinds-facility.jpg";

const SUB_BRANDS: Array<{ name: string; tag: string; line: string }> = [
  {
    name: "FLOW",
    tag: "Topicals",
    line: "Cream and gel topicals — multi-cannabinoid blends with essential oils, terpenes, ceramides, and hyaluronic acid.",
  },
  {
    name: "Companion",
    tag: "Pet Tinctures",
    line: "Pet-formulated tinctures in MCT and clarified butter. Sized by animal weight (320 mg under 50 lb, 640 mg over).",
  },
  {
    name: "Ratio",
    tag: "Tinctures",
    line: "THC:CBD ratio tinctures — 1:1, 5:1, 10:1 — in avocado or MCT-coconut base. Pick your ratio, pick your serving.",
  },
  {
    name: "Lifestyle",
    tag: "Tinctures",
    line: "Sativa and Indica lifestyle tinctures — cannabis-extract base with terpene and botanical add-ins.",
  },
  {
    name: "Capsules",
    tag: "Capsules",
    line: "Cryo-ground extract powder in a capsule. Ratio capsules and Deeper Sleep with CBN, for predictable smoke-free serving sizes.",
  },
  {
    name: "Inhaler",
    tag: "Inhalers",
    line: "Metered-dose cannabis inhalers — clinical-style delivery, fast onset, no combustion.",
  },
  {
    name: "Suppositories",
    tag: "Suppositories",
    line: "Cannabis-infused suppositories — localized delivery, designed to bypass the digestive system.",
  },
  {
    name: "Tincture",
    tag: "Tinctures",
    line: "Catch-all for the rest of the Fairwinds tincture wall — Deep Sleep, Defense, Digestify, Mental Balance, Sriracha.",
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

export default function FairwindsBrandPage({
  brand,
  products,
}: {
  brand: VendorBrand;
  products: Product[];
}) {
  // Sub-brand filter — same pattern as NWCS and Grow Op. Click a sub-brand
  // card and the products grid below filters to items whose name contains
  // that sub-brand label (case-insensitive). Click again or hit the chip's
  // clear button to reset.
  const [activeSubBrand, setActiveSubBrand] = useState<string | null>(null);

  // Cheap O(N×M) sub-brand counts so each card can show "12 on shelf" or
  // dim itself when nothing matches. M=8, N typically <200 SKUs per
  // producer — well under perceptual budget on render.
  const subBrandCounts = SUB_BRANDS.reduce<Record<string, number>>((acc, sb) => {
    const needle = sb.name.toLowerCase();
    acc[sb.name] = products.filter((p) => (p.name ?? "").toLowerCase().includes(needle)).length;
    return acc;
  }, {});

  return (
    <div className="bg-stone-50">
      {/* HERO ----------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-[#0f3d3e] text-white">
        {/* Background facility/product photo from fairwindscannabis.com —
            washed down so the wordmark + headline stay legible on small
            screens. Falls back to the gradient if the asset 404s. */}
        <Image
          src={FAIRWINDS_HERO}
          alt=""
          fill
          priority
          unoptimized
          aria-hidden
          className="object-cover opacity-25"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-[#0f3d3e] via-[#0f3d3e]/85 to-[#1c5e60]/70"
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
          <p className="text-[#d4b896] text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
            <Link href="/brands" className="hover:text-[#e3cda8] transition-colors">
              All Brands
            </Link>
            <span className="mx-2 opacity-50">/</span>
            Fairwinds Manufacturing
          </p>

          <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-10">
            <div className="shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-white shadow-2xl flex items-center justify-center p-5 relative">
              <Image
                src={FAIRWINDS_LOGO}
                alt="Fairwinds Manufacturing logo"
                fill
                unoptimized
                className="object-contain p-5"
              />
            </div>
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Fairwinds
                <br />
                <span className="text-[#d4b896]">Manufacturing</span>
              </h1>
              <p className="text-lg sm:text-xl text-stone-200/90 leading-relaxed">
                Vancouver, WA — since 2014. Tinctures, capsules, topicals, inhalers, and
                suppositories. Engineered cannabis wellness, not flower.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  <span className="text-[#d4b896]">●</span> Vancouver, WA
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  Producer / Processor
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#d4b896] text-[#0f3d3e] text-xs font-bold">
                  {brand.activeSkus} on our shelf
                </span>
              </div>
              <div className="flex flex-wrap gap-3 pt-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#d4b896] hover:bg-[#e3cda8] text-[#0f3d3e] text-sm font-bold transition-all shadow-lg hover:-translate-y-0.5"
                >
                  Order Fairwinds for Pickup →
                </Link>
                <a
                  href="https://fairwindscannabis.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all border border-white/20"
                >
                  Visit fairwindscannabis.com ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY ---------------------------------------------------------- */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#0f3d3e] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            Our Story
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            Engineered in Vancouver. Wellness-forward across the catalog.
          </h2>
          <div className="space-y-5 text-stone-700 text-lg leading-relaxed">
            <p>
              James and Wendy Hull started Fairwinds in 2014. Both left federal-government
              careers to do it — James had been an engineer for a contractor that built ships
              from superyachts to Israeli naval vessels, and Wendy had worked as a top-level
              executive at the Department of Transportation. The shift made sense to them
              because they wanted to bring an engineered, nutraceutical approach to cannabis
              wellness — not just &quot;put it in a jar.&quot;
            </p>
            <p>
              The Vancouver facility is fully automated and was designed by James himself, so
              every harvest reproduces the same way. Zero pesticides. Beneficial insects only.
              HEPA-filtered grow rooms. Unlike most Washington producer-processors,{" "}
              <strong>Fairwinds doesn&apos;t sell flower</strong> — every plant they grow gets
              extracted and goes into a finished product: capsule, tincture, topical, vape, or
              suppository.
            </p>
            <p>
              We carry Fairwinds at {STORE.name} because the formulations are precise and the
              ratios are honest. When a customer asks for a 1:1 THC:CBD or a sleep-formulated
              capsule, we can hand them a Fairwinds and know the dose on the package is the
              dose in the product. Their FLOW Cream is also one of the best-selling topicals in
              the state — there&apos;s a reason regulars stock up on it.
            </p>
          </div>
        </div>
      </section>

      {/* SUB-BRANDS ----------------------------------------------------- */}
      <section className="bg-stone-50 border-y border-stone-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p className="text-[#0f3d3e] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
                The Catalog
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
                Eight lines you&apos;ll see in our wellness case
              </h2>
            </div>
            <p className="text-sm text-stone-500 max-w-md">
              All of it formulated and made in the same Vancouver, WA facility. Tap a card to
              filter the live menu below to just that line.
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
                      ? "bg-[#0f3d3e] border-[#d4b896] shadow-lg ring-2 ring-[#d4b896]/40"
                      : disabled
                        ? "bg-stone-50 border-stone-100 opacity-50 cursor-not-allowed"
                        : "bg-white border-stone-200 hover:border-[#d4b896] hover:shadow-md hover:-translate-y-0.5"
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
                          ? "bg-[#d4b896] text-[#0f3d3e]"
                          : "bg-[#d4b896]/30 text-[#0f3d3e]"
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
                        ? "text-[#d4b896]"
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
          <p className="text-[#0f3d3e] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            How They Make It
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-10 leading-tight max-w-3xl">
            Engineered cultivation. Formulated finishes. No flower for sale.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                emoji: "🌿",
                title: "Cultivation",
                body: "Fully-automated indoor grow designed by James Hull himself. Zero pesticides, beneficial insects only, HEPA-filtered rooms. Reproducible harvest after harvest.",
              },
              {
                emoji: "🧪",
                title: "Extraction",
                body: "Every plant gets extracted in-house and the oil goes into a finished product — never sold as flower. That's the whole model.",
              },
              {
                emoji: "💊",
                title: "Formulation",
                body: "Cryogenic grinding lets the team blend extracted cannabis oil with herbal-extract powders for capsules. Tinctures use avocado or MCT-coconut base with terpene add-ins.",
              },
              {
                emoji: "🌊",
                title: "Topicals",
                body: "FLOW Cream and Gel — multi-cannabinoid plus essential-oil blends (lavender, eucalyptus, peppermint, bergamot, others) with ceramides and hyaluronic acid.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-2xl bg-stone-50 border border-stone-200 overflow-hidden hover:shadow-md transition-all"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-[#cfe3e3] to-[#e8d9bf] flex items-center justify-center text-6xl">
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
          <p className="text-[#0f3d3e] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            On Our Shelf
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-2 leading-tight">
            Fairwinds at {STORE.name}
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
            accentBg={"bg-[#0f3d3e]"}
            accentBorder={"border-[#d4b896]"}
            accentHoverBorder={"hover:border-[#d4b896]"}
            accentText={"text-[#0f3d3e]"}
            accentHoverText={"hover:text-[#1c5e60]"}
            accentGlow={"hover:shadow-[#d4b896]/30"}
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
          <p className="text-[#0f3d3e] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            About Fairwinds
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            Quick facts
          </h2>
          <div className="space-y-3">
            {ABOUT_QA.map(({ q, a }) => (
              <details
                key={q}
                open
                className="group rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden open:border-[#d4b896] open:bg-white open:shadow-sm transition-all"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none transition-colors">
                  <span className="font-semibold text-stone-800 group-open:text-[#0f3d3e] text-sm leading-snug transition-colors">
                    {q}
                  </span>
                  <svg
                    className="w-5 h-5 shrink-0 text-stone-300 group-open:text-[#d4b896] group-open:rotate-180 transition-all duration-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 pt-1 text-stone-600 text-sm leading-relaxed border-t border-[#d4b896]/30">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONNECT -------------------------------------------------------- */}
      <section className="bg-[#0f3d3e] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <p className="text-[#d4b896] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
              Connect with Fairwinds
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 leading-tight">
              Find them online
            </h2>
            <ul className="space-y-3 text-stone-200">
              <li className="flex items-center gap-3">
                <span className="text-[#d4b896] w-20 text-xs font-bold uppercase tracking-wider">
                  Web
                </span>
                <a
                  href="https://fairwindscannabis.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#d4b896]/40"
                >
                  fairwindscannabis.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#d4b896] w-20 text-xs font-bold uppercase tracking-wider">
                  CBD Shop
                </span>
                <a
                  href="https://www.fairwinds.store/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#d4b896]/40"
                >
                  fairwinds.store
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#d4b896] w-20 text-xs font-bold uppercase tracking-wider">
                  Instagram
                </span>
                <a
                  href="https://www.instagram.com/fairwinds_cannabis_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#d4b896]/40"
                >
                  @fairwinds_cannabis_
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#d4b896] w-20 text-xs font-bold uppercase tracking-wider">
                  HQ
                </span>
                <span>Vancouver, WA</span>
              </li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-[#d4b896] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
                Pickup at {STORE.name}
              </p>
              <p className="text-xl font-extrabold mb-1">
                {brand.activeSkus} Fairwinds product{brand.activeSkus !== 1 ? "s" : ""} ready in{" "}
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
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#d4b896] hover:bg-[#e3cda8] text-[#0f3d3e] text-sm font-bold transition-all"
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

      <StickyOrderCTA label="Order Fairwinds →" />
    </div>
  );
}
