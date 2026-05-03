"use client";

import { useState } from "react";
import Image from "next/image";
import type { VendorBrand } from "@/lib/db";
import { STORE } from "@/lib/store";
import { PaginatedProductsGrid } from "./PaginatedProductsGrid";
import { StickyOrderCTA } from "./StickyOrderCTA";
import { BrandHero } from "./_shell/BrandHero";
import { BrandStory } from "./_shell/BrandStory";
import { BrandAboutQA } from "./_shell/BrandAboutQA";
import { BrandConnectBlock } from "./_shell/BrandConnectBlock";
import type { BrandPalette } from "./_shell/types";

// About-Fairwinds Q&A — facts verified across fairwindscannabis.com +
// Marijuana Venture + The Sesh Seattle. FAQPage JSON-LD emitted from
// BrandAboutQA. WAC 314-55-155 critical: copy stays product-info; never
// "treats" / "cures" / "relieves".
const ABOUT_QA = [
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

// Per-brand custom layout — Fairwinds Manufacturing.
// Palette: deep ocean teal + warm copper/sand. Maritime-name brand
// ("fair winds" = sailing term), wellness-forward identity.
const PALETTE: BrandPalette = {
  dark: "#0f3d3e", // deep teal
  dark2: "#0f3d3e", // same
  dark3: "#1c5e60", // gradient end-stop (lighter teal)
  accent: "#d4b896", // copper/sand
  accentMuted: "#e3cda8", // hover state
};

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

const APPROACH_CARDS = [
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
  const [activeSubBrand, setActiveSubBrand] = useState<string | null>(null);

  const subBrandCounts = SUB_BRANDS.reduce<Record<string, number>>((acc, sb) => {
    const needle = sb.name.toLowerCase();
    acc[sb.name] = products.filter((p) => (p.name ?? "").toLowerCase().includes(needle)).length;
    return acc;
  }, {});

  return (
    <div className="bg-stone-50">
      <BrandHero
        palette={PALETTE}
        crumb="Fairwinds Manufacturing"
        logoUrl={FAIRWINDS_LOGO}
        logoAlt="Fairwinds Manufacturing logo"
        title="Fairwinds"
        tagline="Manufacturing"
        subtitle="Vancouver, WA — since 2014. Tinctures, capsules, topicals, inhalers, and suppositories. Engineered cannabis wellness, not flower."
        pills={[
          { kind: "muted", label: "Vancouver, WA", dot: true },
          { kind: "muted", label: "Producer / Processor" },
          { kind: "filled", label: `${brand.activeSkus} on our shelf` },
        ]}
        ctas={[
          { href: "/menu", label: "Order Fairwinds for Pickup →", variant: "primary" },
          {
            href: "https://fairwindscannabis.com/",
            label: "Visit fairwindscannabis.com ↗",
            variant: "secondary",
            external: true,
          },
        ]}
      >
        <Image
          src={FAIRWINDS_HERO}
          alt=""
          fill
          priority
          unoptimized
          aria-hidden
          className="object-cover opacity-25"
        />
      </BrandHero>

      <BrandStory
        palette={PALETTE}
        eyebrow="Our Story"
        headline="Engineered in Vancouver. Wellness-forward across the catalog."
      >
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
          inhaler.
        </p>
        <p>
          We carry Fairwinds at {STORE.name} because the formulations are precise and the
          ratios are honest. When a customer asks for a 1:1 THC:CBD or a sleep-formulated
          capsule, we can hand them a Fairwinds and know the dose on the package is the
          dose in the product. Their FLOW Cream is also one of the best-selling topicals in
          the state — there&apos;s a reason regulars stock up on it.
        </p>
      </BrandStory>

      <section className="bg-stone-50 border-y border-stone-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: PALETTE.dark }}
              >
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
                    <h3 className={`font-extrabold text-lg leading-tight ${active ? "text-white" : "text-stone-900"}`}>
                      {sb.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${
                        active ? "bg-[#d4b896] text-[#0f3d3e]" : "bg-[#d4b896]/40 text-[#0f3d3e]"
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
                      active ? "text-[#d4b896]" : count > 0 ? "text-emerald-700" : "text-stone-400"
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

      <section className="bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: PALETTE.dark }}
          >
            How They Make It
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-10 leading-tight max-w-3xl">
            Engineered cultivation. Formulated finishes. No flower for sale.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {APPROACH_CARDS.map((c) => (
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

      <section id="products" className="bg-stone-50 border-y border-stone-200 scroll-mt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: PALETTE.dark }}
          >
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
            accentBg="bg-[#0f3d3e]"
            accentBorder="border-[#d4b896]"
            accentHoverBorder="hover:border-[#d4b896]"
            accentText="text-[#0f3d3e]"
            accentHoverText="hover:text-[#1c5e60]"
            accentGlow="hover:shadow-[#d4b896]/30"
          />
        </div>
      </section>

      <BrandAboutQA palette={PALETTE} brandName="Fairwinds" items={ABOUT_QA} />

      <BrandConnectBlock
        palette={PALETTE}
        brandName="Fairwinds"
        links={[
          { label: "Web", href: "https://fairwindscannabis.com/", text: "fairwindscannabis.com" },
          { label: "CBD Shop", href: "https://www.fairwinds.store/", text: "fairwinds.store" },
          {
            label: "Instagram",
            href: "https://www.instagram.com/fairwinds_cannabis_/",
            text: "@fairwinds_cannabis_",
          },
          { label: "HQ", text: "Vancouver, WA" },
        ]}
        pickup={{
          eyebrow: `Pickup at ${STORE.name}`,
          headline: `${brand.activeSkus} Fairwinds product${brand.activeSkus !== 1 ? "s" : ""} ready in ${STORE.address.city}`,
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

      <StickyOrderCTA label="Order Fairwinds →" />
    </div>
  );
}
