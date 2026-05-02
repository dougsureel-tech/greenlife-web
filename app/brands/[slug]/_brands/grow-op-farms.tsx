"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { VendorBrand } from "@/lib/db";
import { STORE } from "@/lib/store";
import { PaginatedProductsGrid } from "./PaginatedProductsGrid";
import { StickyOrderCTA } from "./StickyOrderCTA";

// About-Phat-Panda Q&A — verified facts pulled from the brand's own
// channels (phatpanda.com, growopfarms.com) plus second-source confirmation
// from Marijuana Venture and the Spokesman-Review. Rendered as <details>
// elements that default-open + emit FAQPage JSON-LD so LLM-driven discovery
// surfaces clean answers for "where is Phat Panda made" / "who founded
// Grow Op Farms" queries.
//
// No medical or therapeutic claims — copy is point-of-sale product info
// in budtender voice, not advertising under WAC 314-55-155.
const ABOUT_QA: { q: string; a: string }[] = [
  {
    q: "Where is Phat Panda made?",
    a: "Spokane Valley, Washington — at Grow Op Farms' production facility on N Woodruff Rd. They've been growing in eastern WA since 2014.",
  },
  {
    q: "Who founded Grow Op Farms?",
    a: "Robert and Katrina McKinley started the operation in 2014. Robert's marketing-firm background gave the flagship brand its name; Katrina runs the company today as COO.",
  },
  {
    q: "How big is the operation?",
    a: "Big. The Spokane Valley facility is 80,000+ square feet, the team is over 550 people, and Phat Panda is one of Washington's most-distributed cannabis brands. Roughly 200 stores get a delivery from them every week.",
  },
  {
    q: "What's the difference between Phat Panda and Grow Op Farms?",
    a: "Same parent company, different lines. Grow Op Farms LLC is the licensed Washington producer-processor. Phat Panda is the consumer-facing flagship — flower, pre-rolls, the panda-on-the-jar look you know. Sticky Frog covers concentrates, Hot Sugar and Flav are the edibles.",
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

// Per-brand custom layout — Grow Op Farms / Phat Panda.
//
// Brand assets reference phatpanda.com directly (the brand's own domain)
// per Doug's standing rule: vendor logos from the brand's own site/CDN
// only, never Weedmaps / Leafly aggregators. If any of these specific
// asset paths 404 in production, the surrounding gradient + wordmark hero
// degrades gracefully — the page still renders cleanly without them.
//
// Color palette — Phat Panda hot-pink + panda-black, distinct from NWCS's
// deep-forest + tobacco-gold so the two brand pages don't feel templated.
const PANDA_LOGO = "https://phatpanda.com/wp-content/uploads/2022/03/PP_Logo_Pink.png";
const PANDA_HERO = "https://phatpanda.com/wp-content/uploads/2022/03/Phat-Panda-Hero.jpg";

const SUB_BRANDS: Array<{ name: string; tag: string; line: string }> = [
  {
    name: "Phat Panda",
    tag: "Flower",
    line: "The flagship — top-shelf indoor flower in the panda jar. Most-stocked label on our wall.",
  },
  {
    name: "Grow Op",
    tag: "Designer Strains",
    line: "The cultivar-forward line — limited drops, hand-picked for the case from the same Spokane Valley grow.",
  },
  {
    name: "Sticky Frog",
    tag: "Concentrates",
    line: "Distillate, wax, and dab syringes pulled from Phat Panda nug runs. Loadable into any cart or bowl.",
  },
  {
    name: "Hot Sugar",
    tag: "Edibles",
    line: "Panda Candies, fruit drops, fruit chews, chocolate bites — house-made with a proprietary infused sugar.",
  },
  {
    name: "Flav",
    tag: "Edibles",
    line: "Sugar-coated belts and gummies. The fun-snack edible if a Hot Sugar candy isn't your thing.",
  },
  {
    name: "Pre-Roll",
    tag: "Pre-Rolls",
    line: "Phat Panda flower rolled tight — singles, multi-packs, infused options when stock allows.",
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

export default function GrowOpFarmsBrandPage({
  brand,
  products,
}: {
  brand: VendorBrand;
  products: Product[];
}) {
  // Sub-brand filter — same pattern as NWCS. Click a sub-brand card and the
  // products grid below filters to items whose name contains that sub-brand
  // label (case-insensitive). Click again or hit the chip's clear button to
  // reset.
  const [activeSubBrand, setActiveSubBrand] = useState<string | null>(null);

  // Cheap O(N×M) sub-brand counts so each card can show "12 on shelf" or
  // dim itself when nothing matches. M=6 sub-brands, N≈600 SKUs at peak —
  // well under perceptual budget on render.
  const subBrandCounts = SUB_BRANDS.reduce<Record<string, number>>((acc, sb) => {
    const needle = sb.name.toLowerCase();
    acc[sb.name] = products.filter((p) => (p.name ?? "").toLowerCase().includes(needle)).length;
    return acc;
  }, {});

  return (
    <div className="bg-stone-50">
      {/* HERO ----------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-[#1a1a1a] text-white">
        {/* Background facility/product photo from phatpanda.com — washed
            down so the wordmark + headline stay legible on small screens. */}
        <Image
          src={PANDA_HERO}
          alt=""
          fill
          priority
          unoptimized
          aria-hidden
          className="object-cover opacity-20"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#1a1a1a]/85 to-[#3d0a1f]/70"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(circle, #ec4899 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#ec4899] text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
            <Link href="/brands" className="hover:text-[#f472b6] transition-colors">
              All Brands
            </Link>
            <span className="mx-2 opacity-50">/</span>
            Grow Op Farms / Phat Panda
          </p>

          <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-10">
            <div className="shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-white shadow-2xl flex items-center justify-center p-5 relative">
              <Image
                src={PANDA_LOGO}
                alt="Phat Panda logo"
                fill
                unoptimized
                className="object-contain p-5"
              />
            </div>
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Grow Op Farms
                <br />
                <span className="text-[#ec4899]">/ Phat Panda</span>
              </h1>
              <p className="text-lg sm:text-xl text-stone-200/90 leading-relaxed">
                One of Washington&apos;s biggest growers. Spokane Valley, since 2014 — flower,
                pre-rolls, concentrates, and edibles all out of one 80,000-sq-ft house.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  <span className="text-[#ec4899]">●</span> Spokane Valley, WA
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  Tier 3 Producer / Processor
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ec4899] text-white text-xs font-bold">
                  {brand.activeSkus} on our shelf
                </span>
              </div>
              <div className="flex flex-wrap gap-3 pt-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#ec4899] hover:bg-[#f472b6] text-white text-sm font-bold transition-all shadow-lg hover:-translate-y-0.5"
                >
                  Order Phat Panda for Pickup →
                </Link>
                <a
                  href="https://phatpanda.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all border border-white/20"
                >
                  Visit phatpanda.com ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY ---------------------------------------------------------- */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#be185d] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            Our Story
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            Built in Spokane Valley. Stocked across Washington.
          </h2>
          <div className="space-y-5 text-stone-700 text-lg leading-relaxed">
            <p>
              Robert and Katrina McKinley started Grow Op Farms in 2014. Robert came from a
              marketing background — that&apos;s where the Phat Panda name came from in the first
              place — and the conversation with friends about getting into Washington&apos;s new
              I-502 market turned into one of the state&apos;s biggest producer-processors
              practically overnight.
            </p>
            <p>
              Today they run an <strong>80,000-square-foot facility</strong> on N Woodruff Rd in
              Spokane Valley with a team of more than five hundred people. About two hundred stores
              get a Phat Panda delivery every single week. If you&apos;ve walked into a dispensary
              anywhere in Washington and seen a panda on the jar, you&apos;ve seen Grow Op&apos;s
              work.
            </p>
            <p>
              We carry Phat Panda at {STORE.name} because the consistency is the part that matters
              when a regular asks &quot;what&apos;s good today.&quot; The flower comes in cured the
              way it should be, the concentrates run clean from the same nugs, and the edibles do
              exactly what the package says. Ask a budtender if you want a sample of what each
              line does.
            </p>
          </div>
        </div>
      </section>

      {/* SUB-BRANDS ----------------------------------------------------- */}
      <section className="bg-stone-50 border-y border-stone-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p className="text-[#be185d] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
                The Family
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
                Six lines you&apos;ll see in our case
              </h2>
            </div>
            <p className="text-sm text-stone-500 max-w-md">
              All of them grown, extracted, or kitchen-made in the same Spokane Valley house. Tap a
              card to filter the live menu below to just that line.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      ? "bg-[#1a1a1a] border-[#ec4899] shadow-lg ring-2 ring-[#ec4899]/40"
                      : disabled
                        ? "bg-stone-50 border-stone-100 opacity-50 cursor-not-allowed"
                        : "bg-white border-stone-200 hover:border-[#ec4899] hover:shadow-md hover:-translate-y-0.5"
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
                          ? "bg-[#ec4899] text-white"
                          : "bg-[#ec4899]/15 text-[#be185d]"
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
                        ? "text-[#ec4899]"
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
          <p className="text-[#be185d] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            How They Make It
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-10 leading-tight max-w-3xl">
            Indoor cultivation. Full stack from clone to packaged jar.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                emoji: "🌿",
                title: "Flower",
                body: "Indoor cultivation across an 80k-sq-ft house. Tight environmental control means consistent terps and structure jar to jar.",
              },
              {
                emoji: "🫙",
                title: "Pre-Rolls",
                body: "Same flower, machine- and hand-rolled in singles and multi-packs. The everyday option when you want it ready to go.",
              },
              {
                emoji: "🧴",
                title: "Concentrates",
                body: "Sticky Frog wax, distillate, and dab syringes — extracted in-house from Phat Panda nug runs, not trim.",
              },
              {
                emoji: "🍬",
                title: "Edibles",
                body: "Hot Sugar candies and Flav belts come out of the same kitchen. Lab-tested doses every batch.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-2xl bg-stone-50 border border-stone-200 overflow-hidden hover:shadow-md transition-all"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-[#fce7f3] to-[#fbcfe8] flex items-center justify-center text-6xl">
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
          <p className="text-[#be185d] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            On Our Shelf
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-2 leading-tight">
            Phat Panda at {STORE.name}
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
            accentBg={"bg-[#1a1a1a]"}
            accentBorder={"border-[#ec4899]"}
            accentHoverBorder={"hover:border-[#ec4899]"}
            accentText={"text-[#be185d]"}
            accentHoverText={"hover:text-[#ec4899]"}
            accentGlow={"hover:shadow-[#ec4899]/30"}
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
          <p className="text-[#be185d] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            About Phat Panda
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            Quick facts
          </h2>
          <div className="space-y-3">
            {ABOUT_QA.map(({ q, a }) => (
              <details
                key={q}
                open
                className="group rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden open:border-[#ec4899] open:bg-white open:shadow-sm transition-all"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none transition-colors">
                  <span className="font-semibold text-stone-800 group-open:text-[#1a1a1a] text-sm leading-snug transition-colors">
                    {q}
                  </span>
                  <svg
                    className="w-5 h-5 shrink-0 text-stone-300 group-open:text-[#ec4899] group-open:rotate-180 transition-all duration-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 pt-1 text-stone-600 text-sm leading-relaxed border-t border-[#ec4899]/30">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONNECT -------------------------------------------------------- */}
      <section className="bg-[#1a1a1a] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <p className="text-[#ec4899] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
              Connect with Phat Panda
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 leading-tight">
              Find them online
            </h2>
            <ul className="space-y-3 text-stone-200">
              <li className="flex items-center gap-3">
                <span className="text-[#ec4899] w-20 text-xs font-bold uppercase tracking-wider">
                  Web
                </span>
                <a
                  href="https://phatpanda.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#ec4899]/40"
                >
                  phatpanda.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#ec4899] w-20 text-xs font-bold uppercase tracking-wider">
                  Parent
                </span>
                <a
                  href="https://growopfarms.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#ec4899]/40"
                >
                  growopfarms.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#ec4899] w-20 text-xs font-bold uppercase tracking-wider">
                  Instagram
                </span>
                <a
                  href="https://www.instagram.com/phatpanda/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#ec4899]/40"
                >
                  @phatpanda
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#ec4899] w-20 text-xs font-bold uppercase tracking-wider">
                  HQ
                </span>
                <span>2611 N Woodruff Rd Ste B, Spokane Valley, WA 99206</span>
              </li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-[#ec4899] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
                Pickup at {STORE.name}
              </p>
              <p className="text-xl font-extrabold mb-1">
                {brand.activeSkus} Phat Panda product{brand.activeSkus !== 1 ? "s" : ""} ready in{" "}
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
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#ec4899] hover:bg-[#f472b6] text-white text-sm font-bold transition-all"
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

      <StickyOrderCTA label="Order Phat Panda →" />
    </div>
  );
}
