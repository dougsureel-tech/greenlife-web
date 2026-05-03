"use client";

import { useState } from "react";
import type { VendorBrand } from "@/lib/db";
import { STORE } from "@/lib/store";
import { PaginatedProductsGrid } from "./PaginatedProductsGrid";
import { StickyOrderCTA } from "./StickyOrderCTA";
import { BrandHero } from "./_shell/BrandHero";
import { BrandStory } from "./_shell/BrandStory";
import { BrandAboutQA } from "./_shell/BrandAboutQA";
import { BrandConnectBlock } from "./_shell/BrandConnectBlock";
import type { BrandPalette } from "./_shell/types";

// About-Sungrown Q&A — facts verified across sungrown.com / leafwerx.com /
// solrbear.com + Marijuana Venture, Cannabis Equipment News, GlobeNewswire,
// LinkedIn, BusinessWire (Cookies WA partnership), and WSLCB licensee data
// via Top Shelf Data. FAQPage JSON-LD emitted from BrandAboutQA. No
// medical claims.
const ABOUT_QA = [
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

// Per-brand custom layout — Sungrown (Edgemont Group LLC dba).
// Palette: deep brown + sun-amber. Pulled from the inverted-on-black logo
// + the "sun" in the brand name.
const PALETTE: BrandPalette = {
  dark: "#1a0f06", // deepest brown (hero bg)
  dark2: "#3a1f08", // rich brown (gradient mid + dark sections)
  dark3: "#c47a1f", // sun-orange gradient end-stop / story eyebrow
  accent: "#f5b94a", // sun amber
  accentMuted: "#f5e9c8", // warm cream hover
};

const SG_LOGO =
  "https://images.squarespace-cdn.com/content/v1/6324f08f683d85480842c6e5/2ca3c3ac-91ce-4b24-8519-52f8b6f87d59/Sungrown+Logo+Inverted+RGB+1687px%40300ppi.png";

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
      <BrandHero
        palette={PALETTE}
        crumb="Sungrown"
        logoUrl={SG_LOGO}
        logoAlt="Sungrown logo"
        title="Sungrown"
        tagline="Soil to oil, single-source."
        subtitle="The East Wenatchee producer/processor behind Leafwerx, Solr Bear, Full Spec, Cookies WA, and Ric Flair Drip — all built on cannabis they grow themselves."
        pills={[
          { kind: "muted", label: "East Wenatchee, WA", dot: true },
          { kind: "muted", label: "Tier-3 Producer/Processor" },
          { kind: "muted", label: "Since 2016" },
          { kind: "filled", label: `${brand.activeSkus} on our shelf` },
        ]}
        ctas={[
          { href: "/menu", label: "Order Sungrown for Pickup →", variant: "primary" },
          {
            href: "https://www.sungrown.com/",
            label: "Visit sungrown.com ↗",
            variant: "secondary",
            external: true,
          },
        ]}
      />

      <BrandStory palette={PALETTE} eyebrow="Our Story" headline="One operator, one cannabis, six brands.">
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
          genetics) and Ric Flair Drip (since October 2024 — the Nature Boy&apos;s signature line
          including the Flair Force One device). Same flower runs underneath them.
        </p>
        <p>
          We carry Sungrown at {STORE.name} because the single-source story is real and the
          QA holds shift after shift. If you&apos;ve ever picked up a Leafwerx cart and wondered
          who actually grew the plant inside it — same company, one zip code over.
        </p>
      </BrandStory>

      <section className="bg-stone-50 border-y border-stone-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: PALETTE.dark3 }}
              >
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
                    <h3 className={`font-extrabold text-lg leading-tight ${active ? "text-white" : "text-stone-900"}`}>
                      {sb.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${
                        active ? "bg-[#f5b94a] text-[#3a1f08]" : "bg-[#f5b94a]/30 text-[#3a1f08]"
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

      <section id="products" className="bg-stone-50 border-y border-stone-200 scroll-mt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: PALETTE.dark3 }}
          >
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
            accentText="text-[#3a1f08]"
            accentHoverText="hover:text-[#1a0f06]"
            accentGlow="hover:shadow-[#f5b94a]/30"
          />
        </div>
      </section>

      <BrandAboutQA palette={PALETTE} brandName="Sungrown" items={ABOUT_QA} />

      <BrandConnectBlock
        palette={PALETTE}
        brandName="Sungrown"
        links={[
          { label: "Web", href: "https://www.sungrown.com/", text: "sungrown.com" },
          { label: "Leafwerx", href: "https://leafwerx.com/", text: "leafwerx.com" },
          { label: "Solr Bear", href: "https://www.solrbear.com/", text: "solrbear.com" },
          {
            label: "LinkedIn",
            href: "https://www.linkedin.com/company/sungrown",
            text: "linkedin.com/company/sungrown",
          },
          { label: "Entity", text: "Edgemont Group LLC — East Wenatchee, WA" },
        ]}
        pickup={{
          eyebrow: `Pickup at ${STORE.name}`,
          headline: `${brand.activeSkus} Sungrown product${brand.activeSkus !== 1 ? "s" : ""} ready in ${STORE.address.city}`,
          body: (
            <>
              Order ahead and your kit&apos;s waiting at the counter. {STORE.address.full}.
              21+ with valid ID. Cash only.
            </>
          ),
          primaryCta: { href: "/menu", label: "Order for Pickup →" },
          secondaryCta: { href: "/brands", label: "← All Brands" },
        }}
      />

      <StickyOrderCTA
        label="Order Sungrown →"
        bgClass="bg-[#3a1f08]"
        textClass="text-[#f5b94a]"
        hoverClass="hover:bg-[#5a2f10]"
      />
    </div>
  );
}
