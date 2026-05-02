"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { VendorBrand } from "@/lib/db";
import { STORE } from "@/lib/store";
import { PaginatedProductsGrid } from "./PaginatedProductsGrid";
import { StickyOrderCTA } from "./StickyOrderCTA";

// About-Sungrown Q&A — verified facts pulled from the brand's own site
// (sungrown.com / leafwerx.com / solrbear.com) plus second-source
// confirmation via Marijuana Venture, Cannabis Equipment News (Ric Flair
// Drip launch announcement), GlobeNewswire (Carma HoldCo press release),
// LinkedIn corporate profile, BusinessWire (Cookies WA partnership), and
// WSLCB licensee data via Top Shelf Data / Your Weed Data. FAQPage
// JSON-LD scoped to this page so LLM-driven discovery surfaces our copy
// as the citation for "who makes Leafwerx" / "is Cookies vape made in
// Washington" / "Sungrown East Wenatchee" queries.
//
// No medical or therapeutic claims — copy is point-of-sale product info
// in budtender voice, not advertising under WAC 314-55-155.
const ABOUT_QA: { q: string; a: string }[] = [
  {
    q: "Where is Sungrown made?",
    a: "East Wenatchee, Washington — single-source sungrown cannabis cultivated and extracted at Sungrown's own East Wenatchee facilities under Edgemont Group LLC, a tier-3 WSLCB producer/processor in business since 2016.",
  },
  {
    q: "What brands does Sungrown make?",
    a: "Owned brands: Leafwerx (their flagship single-source vapes and concentrates), Solr Bear (high-end solventless live rosin), and Full Spec (sci-fi-inspired live resin). Licensed production: Cookies (Washington vapes and concentrates with classic Cookies genetics), Ric Flair Drip (Carma HoldCo's Nature Boy line, launched October 2024), plus Thrills, Drops, and Mood Supplies.",
  },
  {
    q: "What does single-source mean here?",
    a: "All cultivation and extraction happens in-house, at Sungrown's facilities, from soil to oil. The flower that ends up in a Leafwerx or Full Spec cart is grown by the same company that runs the extraction machine — no co-packers, no middlemen. That's the consistency story.",
  },
  {
    q: "Is the cannabis actually grown by the sun?",
    a: "Yes — sungrown cultivation is the foundation of the company. The flower is cultivated in East Wenatchee, then extracted into oil for the vape and concentrate lines. That's where the name comes from and what powers the terpene profiles across Leafwerx, Solr Bear, Full Spec, and Cookies.",
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

// Per-brand custom layout — Sungrown (Edgemont Group LLC dba).
//
// Brand assets reference sungrown.com directly per the standing rule
// (vendor logos from the brand's own CDN only). Logo is the inverted-RGB
// PNG already seeded into our DB. If the hero asset 404s in production
// the surrounding gradient + wordmark hero degrades gracefully — the
// page still renders without it.
//
// Color palette — sun-gold (#c47a1f) + warm cream (#f5e9c8). Distinct
// from the 8 prior brand pages: NWCS forest+gold, Phat Panda pink+black,
// Fairwinds teal+sand, MFUSED navy+cyan, Spark slate+plaid-red, Bondi
// blue+coral, OOWEE violet+cream, 2727 terracotta+cream. The amber-orange
// is more saturated than 2727's earthy terracotta and pulls directly
// from the "sun" in the brand name + the inverted-on-black logo.
const SG_LOGO =
  "https://images.squarespace-cdn.com/content/v1/6324f08f683d85480842c6e5/2ca3c3ac-91ce-4b24-8519-52f8b6f87d59/Sungrown+Logo+Inverted+RGB+1687px%40300ppi.png";

// Sub-brand cards drawn from the documented Sungrown portfolio. Click a
// card → filters the products grid below by product-name substring. The
// matchToken is intentionally loose (single distinctive word) so it
// catches naming variants like "Leafwerx Cart" / "Leafwerx Live Resin
// Cart" / "Leafwerx Disposable" all under one filter.
const SUB_BRANDS: Array<{ name: string; tag: string; line: string; matchToken: string }> = [
  {
    name: "Leafwerx",
    tag: "Flagship Vapes & Concentrates",
    line: "Their flagship — single-source vapor and concentrates with a mood-based, terpene-forward approach. Cannabis only, nothing else in the cart.",
    matchToken: "Leafwerx",
  },
  {
    name: "Solr Bear",
    tag: "Solventless Live Rosin",
    line: "High-end solventless line. Ancient + modern hash-making applied to single-source sungrown flower, refined into golden live rosin oil.",
    matchToken: "Solr Bear",
  },
  {
    name: "Full Spec",
    tag: "Live Resin",
    line: "Live resin extracted at ultra-low temps from single-source fresh-frozen flower. Includes the Elite Duality and Cadet cartridge series.",
    matchToken: "Full Spec",
  },
  {
    name: "Cookies",
    tag: "Licensed Production",
    line: "Cookies WA — classic Cookies genetics produced in Washington under license. Vapes and concentrates with high-THC distillate and natural terps.",
    matchToken: "Cookies",
  },
  {
    name: "Ric Flair Drip",
    tag: "Licensed Production",
    line: "The Nature Boy's signature line — vapes and infused pre-rolls including the Flair Force One device. Launched in WA via Sungrown October 2024.",
    matchToken: "Ric Flair",
  },
  {
    name: "Thrills",
    tag: "House Brand",
    line: "Sungrown's everyday-value cannabis line — sungrown flower and accessible-price vapes for the daily-driver shelf.",
    matchToken: "Thrills",
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

export default function SungrownBrandPage({
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
      <section className="relative overflow-hidden bg-[#1a0f06] text-white">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-[#1a0f06] via-[#3a1f08] to-[#c47a1f]/40"
        />
        {/* Sun-burst radial gradient overlay — evokes sungrown without */}
        {/* requiring an external hero image. */}
        <div
          aria-hidden
          className="absolute -top-40 -right-40 w-[640px] h-[640px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle at center, #f5b94a 0%, #c47a1f 35%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, #f5e9c8 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#f5e9c8] text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
            <Link href="/brands" className="hover:text-[#fff4d4] transition-colors">
              All Brands
            </Link>
            <span className="mx-2 opacity-50">/</span>
            Sungrown
          </p>

          <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-10">
            <div className="shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-[#1a0f06] border border-[#c47a1f]/40 shadow-2xl flex items-center justify-center p-5 relative">
              <Image
                src={SG_LOGO}
                alt="Sungrown logo"
                fill
                unoptimized
                className="object-contain p-5"
              />
            </div>
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Sungrown
                <br />
                <span className="text-[#f5b94a]">Soil to oil, single-source.</span>
              </h1>
              <p className="text-lg sm:text-xl text-stone-200/90 leading-relaxed">
                The East Wenatchee producer/processor behind Leafwerx, Solr Bear, Full Spec,
                Cookies WA, and Ric Flair Drip — all built on cannabis they grow themselves.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  <span className="text-[#f5b94a]">●</span> East Wenatchee, WA
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  Tier-3 Producer/Processor
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  Since 2016
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5e9c8] text-[#3a1f08] text-xs font-bold">
                  {brand.activeSkus} on our shelf
                </span>
              </div>
              <div className="flex flex-wrap gap-3 pt-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#f5b94a] hover:bg-[#f5e9c8] text-[#3a1f08] text-sm font-bold transition-all shadow-lg hover:-translate-y-0.5"
                >
                  Order Sungrown for Pickup →
                </Link>
                <a
                  href="https://www.sungrown.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all border border-white/20"
                >
                  Visit sungrown.com ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY ---------------------------------------------------------- */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p className="text-[#c47a1f] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            Our Story
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            One operator, one cannabis, six brands.
          </h2>
          <div className="space-y-5 text-stone-700 text-lg leading-relaxed">
            <p>
              Sungrown — the company formerly known as Edgemont Group — has been cultivating and
              extracting cannabis in East Wenatchee since 2016. The whole operation is built on
              one idea: every cart, every dab, every flower jar starts with cannabis they grew
              themselves. No outside biomass, no co-packers, no oil bought on the spot market.
              Soil to oil, single-source.
            </p>
            <p>
              Leafwerx is the flagship — single-source vapor and concentrates, terpene-forward,
              cannabis-only carts. Solr Bear is the solventless line — live rosin pulled from
              the same flower, finished into golden oil and sealed into wide-body ceramic
              cartridges. Full Spec is the live resin program — fresh-frozen flower extracted at
              ultra-low temps for the Elite Duality and Cadet cart series.
            </p>
            <p>
              On top of the owned brands, Sungrown is the licensed Washington producer for two
              national names: Cookies (since 2021, vapes and concentrates with classic Cookies
              genetics) and Ric Flair Drip (since October 2024 — the Nature Boy's signature line
              including the Flair Force One device). Same flower runs underneath them.
            </p>
            <p>
              We carry Sungrown at {STORE.name} because the single-source story is real and the
              QA holds shift after shift. If you've ever picked up a Leafwerx cart and wondered
              who actually grew the plant inside it — same company, one zip code over.
            </p>
          </div>
        </div>
      </section>

      {/* SUB-BRANDS ----------------------------------------------------- */}
      <section className="bg-stone-50 border-y border-stone-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p className="text-[#c47a1f] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
                The House of Brands
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
                Six brands, one source
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
                      ? "bg-[#3a1f08] border-[#f5b94a] shadow-lg ring-2 ring-[#f5b94a]/40"
                      : disabled
                        ? "bg-stone-50 border-stone-100 opacity-50 cursor-not-allowed"
                        : "bg-white border-stone-200 hover:border-[#f5b94a] hover:shadow-md hover:-translate-y-0.5"
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
                        active ? "bg-[#f5b94a] text-[#3a1f08]" : "bg-[#f5e9c8] text-[#7a4a1a]"
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
                      active ? "text-[#f5b94a]" : count > 0 ? "text-emerald-700" : "text-stone-400"
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
          <p className="text-[#c47a1f] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            On Our Shelf
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-2 leading-tight">
            Sungrown at {STORE.name}
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
            accentBg="bg-[#3a1f08]"
            accentBorder="border-[#f5b94a]"
            accentHoverBorder="hover:border-[#f5b94a]"
            accentText="text-[#c47a1f]"
            accentHoverText="hover:text-[#7a4a1a]"
            accentGlow="hover:shadow-[#f5b94a]/30"
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
          <p className="text-[#c47a1f] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
            About Sungrown
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            Quick facts
          </h2>
          <div className="space-y-3">
            {ABOUT_QA.map(({ q, a }) => (
              <details
                key={q}
                open
                className="group rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden open:border-[#f5b94a] open:bg-white open:shadow-sm transition-all"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none transition-colors">
                  <span className="font-semibold text-stone-800 group-open:text-[#7a4a1a] text-sm leading-snug transition-colors">
                    {q}
                  </span>
                  <svg
                    className="w-5 h-5 shrink-0 text-stone-300 group-open:text-[#c47a1f] group-open:rotate-180 transition-all duration-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 pt-1 text-stone-600 text-sm leading-relaxed border-t border-[#f5b94a]/30">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONNECT -------------------------------------------------------- */}
      <section className="bg-[#3a1f08] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <p className="text-[#f5b94a] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
              Connect with Sungrown
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 leading-tight">
              Find them online
            </h2>
            <ul className="space-y-3 text-stone-200">
              <li className="flex items-center gap-3">
                <span className="text-[#f5b94a] w-24 text-xs font-bold uppercase tracking-wider">
                  Web
                </span>
                <a
                  href="https://www.sungrown.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#f5b94a]/40"
                >
                  sungrown.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#f5b94a] w-24 text-xs font-bold uppercase tracking-wider">
                  Leafwerx
                </span>
                <a
                  href="https://leafwerx.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#f5b94a]/40"
                >
                  leafwerx.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#f5b94a] w-24 text-xs font-bold uppercase tracking-wider">
                  Solr Bear
                </span>
                <a
                  href="https://www.solrbear.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#f5b94a]/40"
                >
                  solrbear.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#f5b94a] w-24 text-xs font-bold uppercase tracking-wider">
                  LinkedIn
                </span>
                <a
                  href="https://www.linkedin.com/company/sungrown"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 decoration-[#f5b94a]/40"
                >
                  linkedin.com/company/sungrown
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#f5b94a] w-24 text-xs font-bold uppercase tracking-wider">
                  Entity
                </span>
                <span>Edgemont Group LLC — East Wenatchee, WA</span>
              </li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-[#f5b94a] text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
                Pickup at {STORE.name}
              </p>
              <p className="text-xl font-extrabold mb-1">
                {brand.activeSkus} Sungrown product{brand.activeSkus !== 1 ? "s" : ""} ready in{" "}
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
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#f5b94a] hover:bg-[#f5e9c8] text-[#3a1f08] text-sm font-bold transition-all"
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
        label="Order Sungrown →"
        bgClass="bg-[#3a1f08]"
        textClass="text-[#f5b94a]"
        hoverClass="hover:bg-[#5a2f10]"
      />
    </div>
  );
}
