"use client";

import type { VendorBrand } from "@/lib/db";
import { STORE } from "@/lib/store";
import { withAttr } from "@/lib/attribution";
import { PaginatedProductsGrid } from "./PaginatedProductsGrid";
import { StickyOrderCTA } from "./StickyOrderCTA";
import { BrandHero } from "./_shell/BrandHero";
import { BrandStory } from "./_shell/BrandStory";
import { BrandAboutQA } from "./_shell/BrandAboutQA";
import { BrandConnectBlock } from "./_shell/BrandConnectBlock";
import type { BrandPalette } from "./_shell/types";

// About-Avitas Q&A — facts grounded in the brand's own site
// (avitasgrown.com) + Hashtag Cannabis's Know-Your-Grower interview +
// public WSLCB licensee records. FAQPage JSON-LD emitted from
// BrandAboutQA. No medical claims (WAC 314-55-155 compliant).
const ABOUT_QA = [
  {
    q: "Where is Avitas grown?",
    a: "Arlington, Washington — Snohomish County, about an hour north of Seattle. Tier 2 indoor producer/processor on the brand's own site (avitasgrown.com). The growers have over twenty years of cultivation experience and breed several of their house strains in-house.",
  },
  {
    q: "How long have they been around?",
    a: "Since 2014 — they came online in the first wave of WA's I-502 market and have been one of the more recognizable PNW vape and flower brands ever since. Tagline on their site reads 'Blazing Trails Since 2014.'",
  },
  {
    q: "What does Avitas make?",
    a: "Indoor flower, pre-roll 10-packs, distillate vape carts (Ultra line), and live-resin carts + disposables. Their flavored vape sub-line ships under the Hellavated label. Pesticide-free cultivation — they fight pests with beneficial fungi, predatory insects, and natural oils instead of sprays.",
  },
  {
    q: "Why does Green Life carry them?",
    a: "Avitas is one of the consistent volume vape brands on the WA market and the indoor flower lands clean — tight terps, controlled cure. The Live Resin disposables hit a price point that lets a customer try the brand without committing to a battery. The Hellavated flavored line gives us a non-cannabis-flavor-forward option for customers who want vape effect without the gas profile.",
  },
];

// Per-brand custom layout — Avitas (Arlington, WA).
// Palette: forest evergreen + sunburst amber. PNW mountain-landscape
// vibe matches the brand's own visual identity (Mt. Hood, Three Sisters,
// journey imagery on avitasgrown.com).
const PALETTE: BrandPalette = {
  dark: "#1a3a2e", // deep evergreen (hero bg)
  dark2: "#2d5240", // forest green (gradient mid + sections)
  dark3: "#4a6e5a", // highland green (gradient end-stop)
  accent: "#e89148", // sunburst amber
  accentMuted: "#f5b886", // pale dawn amber
};

const BRAND_DARK = PALETTE.dark2!;
const BRAND_AMBER = PALETTE.accent;

// Topographic-line decoration — evokes contour maps + the PNW mountain
// landscape Avitas leans on. Pure CSS, no asset.
const TOPO_PATTERN: React.CSSProperties = {
  backgroundImage: `
    repeating-radial-gradient(circle at 30% 70%, transparent 0 22px, rgba(245,184,134,0.12) 22px 23px, transparent 23px 44px),
    repeating-radial-gradient(circle at 70% 30%, transparent 0 28px, rgba(245,184,134,0.08) 28px 29px, transparent 29px 56px)
  `,
};

const SUB_BRANDS: Array<{ name: string; tag: string; line: string; matchToken: string }> = [
  {
    name: "Flower",
    tag: "Tier 2 Indoor",
    line: "Hand-trimmed indoor in jars and packaged eighths. Their growers have been at it since 2014 and breed several house strains — the cure is the giveaway: dense buds, controlled moisture, terps that haven't been baked off.",
    matchToken: "Flower",
  },
  {
    name: "Pre-Rolls",
    tag: "10-Pack",
    line: "House-rolled flower in 10-pack singles. Same Arlington indoor in joint form for the cheaper-than-flower out-the-door price. Mixed-strain packs rotate.",
    matchToken: "Pre-Roll",
  },
  {
    name: "Ultra Vapes",
    tag: "1G Cart",
    line: "Distillate carts under the Ultra line — strain-specific, clean hardware, the kind of cart that fits any 510 battery on the shelf. The everyday Avitas vape choice.",
    matchToken: "Cartridge",
  },
  {
    name: "Live Resin",
    tag: "Cart + Disposable",
    line: "Live-resin extraction in 1g carts and 1g all-in-one disposables. Higher terp expression than distillate, brighter strain character. The disposable lets a new customer try the line without buying a battery.",
    matchToken: "Live Resin",
  },
];

const ARLINGTON_CARDS = [
  {
    emoji: "🏔️",
    title: "Snohomish County",
    body: "Arlington sits an hour north of Seattle in the Stillaguamish River valley. Surrounded by Cascade foothills — same PNW landscape that shows up across the brand's visual identity.",
  },
  {
    emoji: "🌲",
    title: "Tier 2 Indoor",
    body: "WA's Tier 2 producer/processor license — a controlled indoor canopy size that keeps batches consistent batch-to-batch. No outdoor sun, no seasonal swings.",
  },
  {
    emoji: "🐞",
    title: "Pesticide-Free",
    body: "Pest control runs on beneficial fungi, predatory insects, and natural oils instead of synthetic sprays. Slower than chemical IPM — fewer residues on the finished flower.",
  },
  {
    emoji: "🛣️",
    title: "Statewide PNW Reach",
    body: "Distribution across Washington — you'll find Avitas at most well-stocked WA dispensaries. Recognizable PNW brand, twelve-plus years on the shelf.",
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

const LOGO_URL = "https://www.avitasgrown.com/wp-content/uploads/2025/01/Logo-Main.svg";

export default function AvitasBrandPage({
  brand,
  products,
}: {
  brand: VendorBrand;
  products: Product[];
}) {
  const subBrandCounts = SUB_BRANDS.reduce<Record<string, number>>((acc, sb) => {
    const needle = sb.matchToken.toLowerCase();
    acc[sb.name] = products.filter((p) => {
      const cat = (p.category ?? "").toLowerCase();
      const name = (p.name ?? "").toLowerCase();
      return cat.includes(needle) || name.includes(needle);
    }).length;
    return acc;
  }, {});

  const menuHref = withAttr("/menu", "brand", "avitas");

  return (
    <div className="bg-stone-50">
      <BrandHero
        palette={PALETTE}
        crumb="Avitas"
        logoUrl={LOGO_URL}
        title="Avitas"
        tagline="Blazing trails since 2014."
        subtitle="Arlington, Washington — pesticide-free Tier 2 indoor flower, distillate and live-resin vapes from a PNW brand that's been on the shelf since the first wave of I-502."
        pills={[
          { kind: "muted", label: "Arlington, WA", dot: true },
          { kind: "muted", label: "Tier 2 Indoor" },
          { kind: "muted", label: "Since 2014" },
          { kind: "filled", label: `${brand.activeSkus} on our shelf` },
        ]}
        ctas={[
          { href: menuHref, label: "Shop Avitas for Pickup →", variant: "primary" },
          { href: "/brands", label: "← All Brands", variant: "secondary" },
        ]}
      >
        <div aria-hidden className="absolute inset-0 opacity-40" style={TOPO_PATTERN} />
        {/* Sunburst radial in the upper-right — the amber sunrise from the
            brand's own landscape illustrations. */}
        <div
          aria-hidden
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-45"
          style={{
            background:
              "radial-gradient(circle at center, rgba(232,145,72,0.55) 0%, rgba(245,184,134,0.18) 38%, transparent 72%)",
          }}
        />
      </BrandHero>

      <BrandStory
        palette={PALETTE}
        eyebrow="Our Story"
        headline="A 2014-vintage PNW brand that's still on the shelf because the cure stayed honest."
      >
        <p>
          Avitas came online in 2014 out of an Arlington, WA grow facility — Snohomish County,
          an hour north of Seattle in the Stillaguamish River valley. They were one of
          Washington&apos;s early Tier 2 indoor producer/processors and they&apos;ve held
          the same posture since: hand-trimmed flower, controlled cure, no synthetic pesticides.
          The growers have over two decades of cultivation experience and they breed several
          of their house strains in-house rather than running off the same nationwide cut list.
        </p>
        <p>
          The product lineup branches into three lanes — <strong>flower + pre-rolls</strong>,{" "}
          <strong>Ultra distillate carts</strong>, and <strong>Live Resin carts + disposables</strong> —
          plus the Hellavated flavored vape sub-line for customers who want the effect without
          the gas profile. The Live Resin disposable is the one we&apos;d hand someone who&apos;s
          new to the brand: no battery investment, full-spec terps, fits in a pocket.
        </p>
        <p>
          We carry Avitas at {STORE.name} because they&apos;re a brand a regular can rely on.
          Twelve-plus years on the WA market, recognizable to anyone who&apos;s ever walked
          into a {STORE.address.state} dispensary, and the cure quality has held up across the
          years where a lot of 2014-vintage brands have drifted. The PNW landscape on their
          packaging — Mt. Hood, Three Sisters, the kind of view you actually get in
          Wenatchee&apos;s back yard — reads honest because the cultivation is local.
        </p>
      </BrandStory>

      <section className="bg-stone-50 border-y border-stone-200 relative">
        <div aria-hidden className="absolute top-0 inset-x-0 h-1.5 opacity-90" style={TOPO_PATTERN} />
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: BRAND_DARK }}
              >
                What We Carry
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
                Four lines, all Arlington-grown
              </h2>
            </div>
            <p className="text-sm text-stone-500 max-w-md">
              Counts reflect what&apos;s on the {STORE.name} shelf right now — refresh tomorrow,
              the mix often rotates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SUB_BRANDS.map((sb) => {
              const count = subBrandCounts[sb.name] ?? 0;
              const inStock = count > 0;
              return (
                <div
                  key={sb.name}
                  className="rounded-2xl border border-stone-200 bg-white p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                  style={{ borderTopWidth: 3, borderTopColor: inStock ? BRAND_AMBER : "#e7e5e4" }}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <h3 className="font-extrabold text-lg leading-tight text-stone-900">
                      {sb.name}
                    </h3>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{ backgroundColor: `${BRAND_AMBER}40`, color: BRAND_DARK }}
                    >
                      {sb.tag}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-stone-600">{sb.line}</p>
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-wider mt-3 ${
                      inStock ? "text-emerald-700" : "text-stone-400"
                    }`}
                  >
                    {inStock ? `${count} on shelf` : "Not in stock"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: BRAND_DARK }}
          >
            Why Arlington
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-10 leading-tight max-w-3xl">
            Tier 2 indoor in the Cascade foothills, pesticide-free since the start.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ARLINGTON_CARDS.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl bg-stone-50 border border-stone-200 overflow-hidden hover:shadow-md transition-all"
              >
                <div
                  className="aspect-[4/3] flex items-center justify-center text-6xl relative"
                  style={{
                    background: `linear-gradient(135deg, ${PALETTE.dark} 0%, ${PALETTE.dark2} 100%)`,
                  }}
                >
                  <div aria-hidden className="absolute inset-0 opacity-50" style={TOPO_PATTERN} />
                  <span aria-hidden className="relative drop-shadow-lg">
                    {c.emoji}
                  </span>
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
            style={{ color: BRAND_DARK }}
          >
            On Our Shelf
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-2 leading-tight">
            Avitas at {STORE.name}
          </h2>
          <p className="text-stone-500 mb-10">
            Live menu — prices, THC, and stock as of right now. {products.length} total products,
            paginated 25 per page.
          </p>

          <PaginatedProductsGrid
            products={products}
            perPage={25}
            accentBg="bg-[#2d5240]"
            accentBorder="border-[#e89148]"
            accentHoverBorder="hover:border-[#e89148]"
            accentText="text-[#2d5240]"
            accentHoverText="hover:text-[#1a3a2e]"
            accentGlow="hover:shadow-[#e89148]/30"
          />
        </div>
      </section>

      <BrandAboutQA palette={PALETTE} brandName="Avitas" items={ABOUT_QA} />

      <BrandConnectBlock
        palette={PALETTE}
        brandName="Avitas"
        heading="On the public record"
        links={[
          { label: "Site", text: "avitasgrown.com" },
          { label: "Tagline", text: "Blazing Trails Since 2014" },
          { label: "Location", text: "Arlington, WA · Snohomish County" },
          { label: "Tier", text: "Tier 2 Indoor Producer / Processor" },
          { label: "Active", text: "2014 → present" },
        ]}
        pickup={{
          eyebrow: `Pickup at ${STORE.name}`,
          headline: `${brand.activeSkus} Avitas product${brand.activeSkus !== 1 ? "s" : ""} ready in ${STORE.address.city}`,
          body: (
            <>
              Order ahead and your kit&apos;s waiting at the counter. {STORE.address.full}.
              21+ with valid ID. Cash only.
            </>
          ),
          primaryCta: { href: menuHref, label: "Order for Pickup →" },
          secondaryCta: { href: "/brands", label: "← All Brands" },
        }}
      />

      <StickyOrderCTA
        label="Shop Avitas →"
        href={menuHref}
        bgClass="bg-[#2d5240]"
        textClass="text-[#e89148]"
        hoverClass="hover:bg-[#1a3a2e]"
      />
    </div>
  );
}
