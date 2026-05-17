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

// About-Botanica Q&A — facts grounded in the parent botanicaGLOBAL site
// (botanicaglobal.com / botanicaseattle.com) + WSLCB licensee records +
// each sub-brand's product packaging on the WA shelf. FAQPage JSON-LD
// emitted from BrandAboutQA. No medical claims (WAC 314-55-155 compliant).
const ABOUT_QA = [
  {
    q: "Where is Botanica based?",
    a: "Seattle, Washington. botanicaSEATTLE is the WA-licensed producer/processor; botanicaGLOBAL is the parent brand house that licenses the same labels into other state markets. The Seattle facility is what stocks our shelf.",
  },
  {
    q: "What brands does Botanica make?",
    a: "Three labels you'll see on our shelf: Mr. Moxey's (mints + lozenges), Journeyman (chocolate bars + jellies), and Spot (gummies — re-launched format). Each label has its own product identity but they all roll up to Botanica's Seattle production.",
  },
  {
    q: "What kind of edibles are we talking about?",
    a: "All three are precise-dose ingestibles. Mr. Moxey's mints are 5mg per mint and come in named blends like Energize or Calm; Journeyman bars are typically 10mg-per-square chocolate; Spot gummies hit the 10mg-per-piece mainstream-edibles slot. Predictable doses are the whole point — Botanica leans into the 'know exactly what you took' end of the edibles market rather than the 'one bite was too much' end.",
  },
  {
    q: "Why do we carry them?",
    a: "Botanica's lineup is the everyday low-stress edibles workhorse. Mr. Moxey's is the recommendation we make for new customers asking about microdosing — 5mg, fast-onset for a mint, easy to tuck into a daypack. Journeyman + Spot give us mid-range options for customers who want a familiar chocolate or gummy format from a brand that's been on the WA shelf since the early years of I-502.",
  },
];

// Per-brand custom layout — Botanica (Seattle, WA — edibles producer).
// Palette: deep aubergine + sage green + warm cream. Botanica's visual
// identity across Mr. Moxey's / Journeyman / Spot leans on natural,
// herbal, plant-forward color stories — earth-toned packaging across
// the lineup. Aubergine reads premium without being sterile; sage
// keeps the palette feeling botanical (not pharmacy).
const PALETTE: BrandPalette = {
  dark: "#3a2a4a", // deep aubergine (hero bg)
  dark2: "#4d3a5e", // mid aubergine (gradient mid + section heads)
  dark3: "#6a567a", // dusty plum (gradient end-stop)
  accent: "#7a9b6e", // sage green
  accentMuted: "#a3bf99", // pale sage
};

const BRAND_DARK = PALETTE.dark2!;
const BRAND_SAGE = PALETTE.accent;

// Botanical-leaf decoration — repeating organic-curve pattern in faint
// sage. Pure CSS, no asset. Evokes the herbal/plant-forward identity
// without leaning on a leaf icon.
const BOTANICAL_PATTERN: React.CSSProperties = {
  backgroundImage: `
    repeating-radial-gradient(ellipse 30px 8px at 25% 35%, transparent 0 18px, rgba(163,191,153,0.10) 18px 19px, transparent 19px 30px),
    repeating-radial-gradient(ellipse 24px 7px at 75% 65%, transparent 0 22px, rgba(163,191,153,0.08) 22px 23px, transparent 23px 36px)
  `,
};

// Sub-brand logo URLs — all three verified live (200 after 301 follow)
// on Botanica's own Squarespace CDN per `feedback_vendor_logo_sources`
// (NEVER Weedmaps/Leafly aggregators). Sourced from the public
// botanicaglobal.com sitemap.xml image references.
const MOXEY_LOGO = "https://images.squarespace-cdn.com/content/5b7e2aa8ec4eb7238e6cb609/1551903067913-YO14C4K4DM38P90UERBO/Moxey-circle-logo-white.png?content-type=image%2Fpng";
const JOURNEYMAN_LOGO = "https://images.squarespace-cdn.com/content/5b7e2aa8ec4eb7238e6cb609/1551903173381-UOB4TH5K3VBW029YO42S/Journeyman_Logo.png?content-type=image%2Fpng";
const SPOT_LOGO = "https://images.squarespace-cdn.com/content/5b7e2aa8ec4eb7238e6cb609/1551903118724-7ONSQVQUICZ9A2NAME7B/spot-relaunch-logo_4color-white.png?format=1000w&content-type=image%2Fpng";

const SUB_BRANDS: Array<{
  name: string;
  tag: string;
  line: string;
  matchToken: string;
  logoUrl: string;
  logoBg: string; // background color the logo PNG was designed against
}> = [
  {
    name: "Mr. Moxey's",
    tag: "Mints + Lozenges",
    line: "5mg-per-mint precise dosing in their three functional-blend formats — Energize (sativa-forward + ginseng), Relief (CBD + ginger), Calm (indica-leaning + lavender). The microdosing tin is the easy carry-everywhere format. Fast onset for a mint.",
    matchToken: "Moxey",
    logoUrl: MOXEY_LOGO,
    logoBg: "#3a2a4a", // aubergine — Moxey's logo is light/white-on-dark
  },
  {
    name: "Journeyman",
    tag: "Chocolate + Jellies",
    line: "10mg-per-square chocolate bars and fruit jellies. Single-origin chocolate sourcing, predictable dose, the everyday chocolate-bar slot in the edibles cabinet. Multiple flavor pairings rotate through the lineup — citrus, salted caramel, dark with sea salt.",
    matchToken: "Journeyman",
    logoUrl: JOURNEYMAN_LOGO,
    logoBg: "#f5f3eb", // warm cream — Journeyman logo reads dark-on-light
  },
  {
    name: "Spot",
    tag: "Gummies",
    line: "10mg-per-piece gummies in the mainstream-edibles dose slot. Re-launched format — Spot relaunched in 2019 with new packaging and dosing. Fruit-forward flavors, predictable hit time, the 'one gummy after dinner' workhorse.",
    matchToken: "Spot",
    logoUrl: SPOT_LOGO,
    logoBg: "#3a2a4a", // aubergine — Spot relaunch logo is white-on-dark
  },
];

const SEATTLE_CARDS = [
  {
    emoji: "🌿",
    title: "Seattle Production",
    body: "botanicaSEATTLE is the WA-licensed producer/processor — every Mr. Moxey's tin and Journeyman bar on our shelf is made here in WA, not imported from a parent-company facility in another state.",
  },
  {
    emoji: "🎯",
    title: "Precise Dosing",
    body: "5mg mints, 10mg chocolates, 10mg gummies. Botanica's whole identity is 'know exactly what you took' — every piece is consistent batch-to-batch so you can trust the dose.",
  },
  {
    emoji: "🧘",
    title: "Microdose-Friendly",
    body: "Mr. Moxey's at 5mg per mint is the easy entry point for customers who want a low-impact dose. Two mints = 10mg total, and you can stop after one if you're new to edibles — no commitment to a full bar.",
  },
  {
    emoji: "🏛️",
    title: "WA Veteran Brand",
    body: "Botanica's labels have been on the Washington shelf since the early years of I-502. Mr. Moxey's especially is one of the brands a longtime customer recognizes by tin on the counter.",
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

export default function BotanicaSeattleBrandPage({
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

  const menuHref = withAttr("/menu", "brand", "botanica-seattle");

  return (
    <div className="bg-stone-50">
      <BrandHero
        palette={PALETTE}
        crumb="Botanica"
        title="Botanica"
        tagline="The WA edibles workhorse — Mr. Moxey's, Journeyman, Spot."
        subtitle="Seattle-based producer/processor behind three of the most-trusted precise-dose edibles labels on the Washington shelf. Mints, chocolates, gummies — all made here in WA."
        pills={[
          { kind: "muted", label: "Seattle, WA", dot: true },
          { kind: "muted", label: "Edibles Producer/Processor" },
          { kind: "muted", label: "3 Labels" },
          { kind: "filled", label: `${brand.activeSkus} on our shelf` },
        ]}
        ctas={[
          { href: menuHref, label: "Shop Botanica for Pickup →", variant: "primary" },
          { href: "/brands", label: "← All Brands", variant: "secondary" },
        ]}
      >
        <div aria-hidden className="absolute inset-0 opacity-50" style={BOTANICAL_PATTERN} />
        {/* Sage-green radial in the upper-right — botanical/herbal mood
            anchor. Reads as plant-derived without using a leaf icon. */}
        <div
          aria-hidden
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-35"
          style={{
            background:
              "radial-gradient(circle at center, rgba(122,155,110,0.55) 0%, rgba(163,191,153,0.18) 38%, transparent 72%)",
          }}
        />
      </BrandHero>

      <BrandStory
        palette={PALETTE}
        eyebrow="Our Story"
        headline="One Seattle producer, three of the most-recognized edibles labels in WA."
      >
        <p>
          Botanica is the Seattle producer/processor behind <strong>Mr. Moxey&apos;s</strong>,{" "}
          <strong>Journeyman</strong>, and <strong>Spot</strong> — three labels that show up on
          almost every well-stocked dispensary shelf in Washington. The parent brand house is
          botanicaGLOBAL; the WA license is botanicaSEATTLE. Everything we carry under any of
          the three labels is produced here in Seattle.
        </p>
        <p>
          The shared thread across all three labels is <strong>precise dosing</strong>. Mr. Moxey&apos;s
          mints land at 5mg per piece in three named blends (Energize, Relief, Calm). Journeyman
          chocolate bars run 10mg per square so you can break off exactly the amount you want.
          Spot gummies hit the standard 10mg-per-piece edibles dose slot. The whole house leans
          into the &quot;know exactly what you took&quot; end of the edibles market rather than
          the &quot;one bite was too much&quot; end.
        </p>
        <p>
          We carry Botanica at {STORE.name} because the lineup is the everyday low-stress edibles
          workhorse. Mr. Moxey&apos;s is the recommendation we make for new customers asking
          about microdosing — small dose, fast onset for a mint, easy to tuck into a daypack.
          Journeyman + Spot give us mid-range options in chocolate and gummy formats from a
          brand that&apos;s been on the WA shelf since the early years of I-502 and held its
          quality across that whole arc.
        </p>
      </BrandStory>

      <section className="bg-stone-50 border-y border-stone-200 relative">
        <div aria-hidden className="absolute top-0 inset-x-0 h-1.5 opacity-90" style={BOTANICAL_PATTERN} />
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: BRAND_DARK }}
              >
                The Three Labels
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
                Mints, chocolates, gummies — all WA-made
              </h2>
            </div>
            <p className="text-sm text-stone-500 max-w-md">
              Counts reflect what&apos;s on the {STORE.name} shelf right now. Mix rotates as
              new flavors come in.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SUB_BRANDS.map((sb) => {
              const count = subBrandCounts[sb.name] ?? 0;
              const inStock = count > 0;
              return (
                <div
                  key={sb.name}
                  className="rounded-2xl border border-stone-200 bg-white overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                  style={{ borderTopWidth: 3, borderTopColor: inStock ? BRAND_SAGE : "#e7e5e4" }}
                >
                  {/* Logo strip — each sub-brand's actual mark, sized
                      consistently. Background is the color the logo PNG
                      was designed for (white-on-dark vs dark-on-light). */}
                  <div
                    className="aspect-[5/2] flex items-center justify-center p-6 relative overflow-hidden"
                    style={{ backgroundColor: sb.logoBg }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={sb.logoUrl}
                      alt={`${sb.name} logo`}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain relative"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-baseline justify-between gap-2 mb-2">
                      <h3 className="font-extrabold text-lg leading-tight text-stone-900">
                        {sb.name}
                      </h3>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ backgroundColor: `${BRAND_SAGE}40`, color: BRAND_DARK }}
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
            Why Botanica
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-10 leading-tight max-w-3xl">
            WA-made precise-dose edibles you can hand to anyone.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SEATTLE_CARDS.map((c) => (
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
                  <div aria-hidden className="absolute inset-0 opacity-50" style={BOTANICAL_PATTERN} />
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
            Botanica at {STORE.name}
          </h2>
          <p className="text-stone-500 mb-10">
            Live menu — prices, doses, and stock as of right now. {products.length} total products,
            paginated 25 per page.
          </p>

          <PaginatedProductsGrid
            products={products}
            perPage={25}
            accentBg="bg-[#4d3a5e]"
            accentBorder="border-[#7a9b6e]"
            accentHoverBorder="hover:border-[#7a9b6e]"
            accentText="text-[#4d3a5e]"
            accentHoverText="hover:text-[#3a2a4a]"
            accentGlow="hover:shadow-[#7a9b6e]/30"
          />
        </div>
      </section>

      <BrandAboutQA palette={PALETTE} brandName="Botanica" items={ABOUT_QA} />

      <BrandConnectBlock
        palette={PALETTE}
        brandName="Botanica"
        heading="On the public record"
        links={[
          { label: "Site", text: "botanicaseattle.com" },
          { label: "Parent", text: "botanicaGLOBAL" },
          { label: "Labels", text: "Mr. Moxey's · Journeyman · Spot" },
          { label: "Location", text: "Seattle, WA" },
          { label: "Active", text: "Early I-502 → present" },
        ]}
        pickup={{
          eyebrow: `Pickup at ${STORE.name}`,
          headline: `${brand.activeSkus} Botanica product${brand.activeSkus !== 1 ? "s" : ""} ready in ${STORE.address.city}`,
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
        label="Shop Botanica →"
        href={menuHref}
        bgClass="bg-[#4d3a5e]"
        textClass="text-[#a3bf99]"
        hoverClass="hover:bg-[#3a2a4a]"
      />
    </div>
  );
}
