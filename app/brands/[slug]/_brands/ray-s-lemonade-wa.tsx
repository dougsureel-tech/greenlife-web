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

// About-Ray's Q&A — facts grounded in the brand's own site
// (rayslemonade.com) + product packaging visible on the WA shelf.
// FAQPage JSON-LD emitted from BrandAboutQA. No medical claims
// (WAC 314-55-155 compliant).
const ABOUT_QA = [
  {
    q: "What is Ray's Lemonade?",
    a: "A Washington-state cannabis-infused beverage brand. The flagship is bottled lemonade in a rotating fruit-flavor lineup — Original, Strawberry, Mango, Peach, Pink, Watermelon, Passion Fruit. Beyond the bottles, Ray's also runs a vape line and a hash rosin lineup; their tagline is 'Sunshine in a Bottle.'",
  },
  {
    q: "How are Ray's lemonades dosed?",
    a: "Single-serve bottle format with a fixed THC dose per bottle (typical WA cannabis-beverage spec is 10mg per serving). The format is the appeal — twist the cap, drink the bottle, you know exactly what you took. Faster onset than chocolate or gummies for most people because beverages absorb sublingually as you sip.",
  },
  {
    q: "What flavors are usually around?",
    a: "Ray's leans into a fruit-forward flavor wheel — the Strawberry and Mango sell strongest at our shelf, the Original Lemonade is the everyday pick, and the seasonal/limited flavors (Pink, Watermelon, Peach, Passion Fruit) rotate through the year. The brand site groups them under 'Sip the Spectrum.'",
  },
  {
    q: "Why do we carry them?",
    a: "Ray's is the most-asked-for cannabis lemonade at our counter. The single-bottle 10mg dose works for customers who don't want to commit to a multi-piece edibles pack or a full chocolate bar — one bottle, one session, predictable. The hash rosin line gives connoisseur customers another reason to come in once they've tried the beverages. Honest sourcing, clean cure on the rosin side.",
  },
];

// Per-brand custom layout — Ray's Lemonade (Washington beverages + vapes
// + hash rosin). Palette: warm sunset yellow + watermelon pink + sky
// blue. Lemonade-summer color story matches their own visual identity
// across rayslemonade.com — the "Sip the Spectrum" homepage block uses
// the full citrus + berry rainbow.
const PALETTE: BrandPalette = {
  dark: "#c75833", // sunset terracotta (hero bg)
  dark2: "#e07a3e", // warm orange (gradient mid + section heads)
  dark3: "#f0a060", // peach (gradient end-stop)
  accent: "#ffd864", // sun yellow
  accentMuted: "#fde68a", // pale lemon
};

const BRAND_DARK = PALETTE.dark2!;
const BRAND_SUN = PALETTE.accent;

// Citrus-burst decoration — repeating sun-ray pattern in faint yellow.
// Pure CSS, no asset. Evokes the lemonade-sunshine identity.
const SUNBURST_PATTERN: React.CSSProperties = {
  backgroundImage: `
    repeating-radial-gradient(circle at 25% 25%, transparent 0 14px, rgba(253,230,138,0.12) 14px 15px, transparent 15px 28px),
    repeating-radial-gradient(circle at 75% 75%, transparent 0 22px, rgba(253,230,138,0.08) 22px 23px, transparent 23px 44px)
  `,
};

// Verified live (200) on the brand's own CDN per `feedback_vendor_logo_sources`.
// Sourced from the public rayslemonade.com homepage HTML.
const RAYS_LOGO = "https://rayslemonade.com/wp-content/uploads/2021/11/Rays-Lemonade-Logo.png";
const RAYS_HERO = "https://rayslemonade.com/wp-content/uploads/2025/04/29552-Rays-Vape-Marketing-Assets-copy.jpg";

const SUB_BRANDS: Array<{ name: string; tag: string; line: string; matchToken: string }> = [
  {
    name: "Lemonade",
    tag: "Bottled Beverage",
    line: "The flagship — single-serve bottles in a fruit-forward flavor wheel. Original Lemonade is the everyday pick; Strawberry, Mango, Peach, Pink, Watermelon, Passion Fruit rotate as seasonal flavors come and go. Twist the cap, sip the bottle, predictable dose.",
    matchToken: "Lemonade",
  },
  {
    name: "Hash Rosin",
    tag: "Solventless",
    line: "Single-source solventless rosin pressed from the same fruit-forward flavor sensibility that drives the lemonades. Bright, terp-forward, the connoisseur option in the Ray's lineup. Released in batches — line-up rotates by harvest.",
    matchToken: "Rosin",
  },
  {
    name: "Vapes",
    tag: "Live Resin Cart",
    line: "Live-resin vape carts in strain-specific lines. The newest sub-line on the brand site (2025 marketing refresh). Ties the lemonade-flavor universe to a vape format for customers who want the taste profile without the calories.",
    matchToken: "Vape",
  },
];

const SUMMER_CARDS = [
  {
    emoji: "🍋",
    title: "Sunshine in a Bottle",
    body: "The brand's own tagline. Ray's identity is summer-day, picnic-table, pool-deck cannabis — beverages that taste like the season and dose like a regular drink (one bottle, one session).",
  },
  {
    emoji: "🎯",
    title: "Predictable Dose",
    body: "Single-serve bottles at the WA-standard 10mg-per-serving cannabis-beverage dose. No multi-piece pack to half-eat, no half-bar to wrap up. One bottle, one number, one conversation about how it hit you.",
  },
  {
    emoji: "🍓",
    title: "Fruit-Forward",
    body: "Strawberry, Mango, Peach, Pink, Watermelon, Passion Fruit — Ray's leans into the bright end of the flavor spectrum across every product line. The hash rosin and vapes carry the same lemonade-summer color story through to concentrate format.",
  },
  {
    emoji: "💧",
    title: "Sublingual Onset",
    body: "Beverages absorb partially under the tongue as you sip — that's why a Ray's bottle often hits faster than a comparable-dose chocolate or gummy. Helpful to know if you're stacking against existing edibles.",
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

export default function RaysLemonadeBrandPage({
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

  const menuHref = withAttr("/menu", "brand", "rays-lemonade");

  return (
    <div className="bg-stone-50">
      <BrandHero
        palette={PALETTE}
        crumb="Ray's Lemonade"
        logoUrl={RAYS_LOGO}
        title="Ray's Lemonade"
        tagline="Sunshine in a bottle."
        subtitle="Washington-state cannabis-infused beverages — single-serve bottled lemonades in a fruit-forward flavor wheel, plus a hash rosin lineup and live-resin vapes for the connoisseur side of the same brand."
        pills={[
          { kind: "muted", label: "Washington State", dot: true },
          { kind: "muted", label: "Beverages + Rosin + Vapes" },
          { kind: "muted", label: "10mg per bottle" },
          { kind: "filled", label: `${brand.activeSkus} on our shelf` },
        ]}
        ctas={[
          { href: menuHref, label: "Shop Ray's for Pickup →", variant: "primary" },
          { href: "/brands", label: "← All Brands", variant: "secondary" },
        ]}
      >
        <div aria-hidden className="absolute inset-0 opacity-50" style={SUNBURST_PATTERN} />
        {/* Sun-yellow radial — anchors the lemonade-summer mood. */}
        <div
          aria-hidden
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-50"
          style={{
            background:
              "radial-gradient(circle at center, rgba(255,216,100,0.65) 0%, rgba(253,230,138,0.20) 38%, transparent 72%)",
          }}
        />
      </BrandHero>

      <BrandStory
        palette={PALETTE}
        eyebrow="Our Story"
        headline="The most-asked-for cannabis lemonade at our counter."
      >
        <p>
          Ray&apos;s Lemonade is a Washington-state cannabis-infused beverage brand built around
          a simple idea: a bottle of lemonade you twist the cap on, sip across one session,
          and know exactly what you took. The flagship lineup runs through a fruit-forward
          flavor wheel — Original Lemonade is the everyday pick, and Strawberry, Mango, Peach,
          Pink, Watermelon, and Passion Fruit rotate as seasonal options come and go. The
          brand&apos;s own tagline reads &quot;Sunshine in a Bottle.&quot;
        </p>
        <p>
          Beyond the bottles, Ray&apos;s also runs a <strong>hash rosin</strong> line (single-source
          solventless, released in harvest-driven batches) and a <strong>live-resin vape</strong> line
          (added in their 2025 marketing refresh). The whole brand carries a consistent color
          story — bright, fruit-forward, summer-day — across whichever format you&apos;re shopping.
        </p>
        <p>
          We carry Ray&apos;s at {STORE.name} because it solves a real customer ask: a
          cannabis-infused option that doesn&apos;t require committing to a half-bar of
          chocolate or a five-pack of gummies. One bottle, one 10mg dose, one session.
          The hash rosin gives a second reason to come in once a customer has the lemonade
          dialed in. Honest sourcing across all three lines.
        </p>
      </BrandStory>

      <section className="bg-stone-50 border-y border-stone-200 relative">
        <div aria-hidden className="absolute top-0 inset-x-0 h-1.5 opacity-90" style={SUNBURST_PATTERN} />
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: BRAND_DARK }}
              >
                Three Lines, One Brand
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
                Beverages, rosin, and vapes — same fruit-forward DNA
              </h2>
            </div>
            <p className="text-sm text-stone-500 max-w-md">
              Counts reflect what&apos;s on the {STORE.name} shelf right now. Bottles rotate as
              seasonal flavors come and go.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SUB_BRANDS.map((sb) => {
              const count = subBrandCounts[sb.name] ?? 0;
              const inStock = count > 0;
              return (
                <div
                  key={sb.name}
                  className="rounded-2xl border border-stone-200 bg-white p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                  style={{ borderTopWidth: 3, borderTopColor: inStock ? BRAND_SUN : "#e7e5e4" }}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <h3 className="font-extrabold text-lg leading-tight text-stone-900">
                      {sb.name}
                    </h3>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{ backgroundColor: `${BRAND_SUN}40`, color: BRAND_DARK }}
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
            Why Ray&apos;s
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-10 leading-tight max-w-3xl">
            Predictable doses in formats people actually crave.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SUMMER_CARDS.map((c) => (
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
                  <div aria-hidden className="absolute inset-0 opacity-50" style={SUNBURST_PATTERN} />
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
            Ray&apos;s at {STORE.name}
          </h2>
          <p className="text-stone-500 mb-10">
            Live menu — flavors, doses, and stock as of right now. {products.length} total
            products, paginated 25 per page.
          </p>

          <PaginatedProductsGrid
            products={products}
            perPage={25}
            accentBg="bg-[#e07a3e]"
            accentBorder="border-[#ffd864]"
            accentHoverBorder="hover:border-[#ffd864]"
            accentText="text-[#c75833]"
            accentHoverText="hover:text-[#c75833]"
            accentGlow="hover:shadow-[#ffd864]/30"
          />

          {/* Brand-marketing hero photo from Ray's own site — drops in
              underneath the product grid so the page closes on a strong
              brand-mood image. */}
          <div className="mt-10 rounded-2xl overflow-hidden border border-stone-200 bg-stone-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={RAYS_HERO}
              alt="Ray's Lemonade brand marketing photography — vape line"
              loading="lazy"
              width={1500}
              height={2100}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      <BrandAboutQA palette={PALETTE} brandName="Ray's Lemonade" items={ABOUT_QA} />

      <BrandConnectBlock
        palette={PALETTE}
        brandName="Ray's Lemonade"
        heading="On the public record"
        links={[
          { label: "Site", text: "rayslemonade.com" },
          { label: "Tagline", text: "Sunshine in a Bottle" },
          { label: "Lines", text: "Lemonades · Hash Rosin · Live Resin Vapes" },
          { label: "Dose", text: "10mg per bottle (WA cannabis-beverage standard)" },
          { label: "Origin", text: "Washington State" },
        ]}
        pickup={{
          eyebrow: `Pickup at ${STORE.name}`,
          headline: `${brand.activeSkus} Ray's product${brand.activeSkus !== 1 ? "s" : ""} ready in ${STORE.address.city}`,
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
        label="Shop Ray's →"
        href={menuHref}
        bgClass="bg-[#e07a3e]"
        textClass="text-[#fde68a]"
        hoverClass="hover:bg-[#c75833]"
      />
    </div>
  );
}
