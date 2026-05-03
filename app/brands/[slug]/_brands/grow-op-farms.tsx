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

// About-Phat-Panda Q&A — facts verified across phatpanda.com,
// growopfarms.com, Marijuana Venture, and the Spokesman-Review.
// FAQPage JSON-LD emitted from BrandAboutQA. No medical claims.
const ABOUT_QA = [
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

// Per-brand custom layout — Grow Op Farms / Phat Panda.
// Palette: panda-black + hot-pink. Distinct from NWCS forest+gold so the
// two largest WA producer pages don't feel templated.
const PALETTE: BrandPalette = {
  dark: "#1a1a1a", // panda black
  dark2: "#1a1a1a", // same
  dark3: "#3d0a1f", // gradient end-stop (deep pink-black)
  accent: "#ec4899", // hot pink
  accentMuted: "#f472b6", // hover state
};

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

const APPROACH_CARDS = [
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
        crumb="Grow Op Farms / Phat Panda"
        logoUrl={PANDA_LOGO}
        logoAlt="Phat Panda logo"
        title="Grow Op Farms"
        tagline="/ Phat Panda"
        subtitle="One of Washington's biggest growers. Spokane Valley, since 2014 — flower, pre-rolls, concentrates, and edibles all out of one 80,000-sq-ft house."
        pills={[
          { kind: "muted", label: "Spokane Valley, WA", dot: true },
          { kind: "muted", label: "Tier 3 Producer / Processor" },
          { kind: "filled", label: `${brand.activeSkus} on our shelf` },
        ]}
        ctas={[
          { href: "/menu", label: "Order Phat Panda for Pickup →", variant: "primary" },
          {
            href: "https://phatpanda.com/",
            label: "Visit phatpanda.com ↗",
            variant: "secondary",
            external: true,
          },
        ]}
      >
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
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(circle, #ec4899 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
      </BrandHero>

      <BrandStory palette={PALETTE} eyebrow="Our Story" headline="Built in Spokane Valley. Stocked across Washington.">
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
      </BrandStory>

      <section className="bg-stone-50 border-y border-stone-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: "#be185d" }}
              >
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
                    <h3 className={`font-extrabold text-lg leading-tight ${active ? "text-white" : "text-stone-900"}`}>
                      {sb.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${
                        active ? "bg-[#ec4899] text-white" : "bg-[#ec4899]/15 text-[#be185d]"
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
                      active ? "text-[#ec4899]" : count > 0 ? "text-emerald-700" : "text-stone-400"
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
            style={{ color: "#be185d" }}
          >
            How They Make It
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-10 leading-tight max-w-3xl">
            Indoor cultivation. Full stack from clone to packaged jar.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {APPROACH_CARDS.map((c) => (
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

      <section id="products" className="bg-stone-50 border-y border-stone-200 scroll-mt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: "#be185d" }}
          >
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
            accentBg="bg-[#1a1a1a]"
            accentBorder="border-[#ec4899]"
            accentHoverBorder="hover:border-[#ec4899]"
            accentText="text-[#be185d]"
            accentHoverText="hover:text-[#ec4899]"
            accentGlow="hover:shadow-[#ec4899]/30"
          />
        </div>
      </section>

      <BrandAboutQA palette={PALETTE} brandName="Phat Panda" items={ABOUT_QA} />

      <BrandConnectBlock
        palette={PALETTE}
        brandName="Phat Panda"
        links={[
          { label: "Web", href: "https://phatpanda.com/", text: "phatpanda.com" },
          { label: "Parent", href: "https://growopfarms.com/", text: "growopfarms.com" },
          { label: "Instagram", href: "https://www.instagram.com/phatpanda/", text: "@phatpanda" },
          { label: "HQ", text: "2611 N Woodruff Rd Ste B, Spokane Valley, WA 99206" },
        ]}
        pickup={{
          eyebrow: `Pickup at ${STORE.name}`,
          headline: `${brand.activeSkus} Phat Panda product${brand.activeSkus !== 1 ? "s" : ""} ready in ${STORE.address.city}`,
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

      <StickyOrderCTA label="Order Phat Panda →" />
    </div>
  );
}
