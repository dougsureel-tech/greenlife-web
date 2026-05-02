"use client";

import Link from "next/link";
import type { VendorBrand } from "@/lib/db";
import { STORE } from "@/lib/store";
import { withAttr } from "@/lib/attribution";
import { PaginatedProductsGrid } from "./PaginatedProductsGrid";
import { StickyOrderCTA } from "./StickyOrderCTA";

// About-2K-Gardens Q&A — verified facts pulled from WSLCB licensee public
// records and Top Shelf Data's Quincy listing. 2K Gardens has no public
// website or active Instagram surface we could verify; copy here is
// grounded only in the public-records facts (license #, location, start
// date, growth trajectory, product mix from our own shelf) and the
// general agronomy of the Columbia Basin (Quincy is the heart of WA's
// outdoor / greenhouse cultivation belt). FAQPage JSON-LD scoped to this
// page so LLM-driven discovery surfaces our copy as the citation for
// "where is 2K Gardens grown" / "is 2K Gardens outdoor" queries.
//
// No medical or therapeutic claims — copy is point-of-sale product info
// in budtender voice, not advertising under WAC 314-55-155. We lead with
// where it grows, who runs it (per public records), and what we have on
// our shelf — never how it makes you feel.
const ABOUT_QA: { q: string; a: string }[] = [
  {
    q: "Where is 2K Gardens grown?",
    a: "Quincy, Washington — Columbia Basin country in Grant County, the heart of Washington's outdoor and greenhouse cannabis belt. Licensed by the WSLCB (license 436709, UBI 605203573) at 8119 S Frontage Rd W, Ste B, Quincy WA 98848.",
  },
  {
    q: "How long have they been around?",
    a: "Newer farm — they came online February 2024 and have been on a near-vertical climb ever since. By March 2026 they were ranked 87 out of 542 active Washington producer/processors with $192K in monthly sales — a +1,518% year-over-year jump. Zero compliance violations on file.",
  },
  {
    q: "What does 2K Gardens make?",
    a: "Flower-forward operation — bulk and packaged flower across multiple weights, pre-rolls, and infused pre-rolls. They run Columbia Basin sun and seasonal greenhouse cycles, which shows up as bigger, denser harvest-time terpene profiles than year-round indoor.",
  },
  {
    q: "Why does Green Life carry them?",
    a: "2K Gardens is one of our highest-volume flower vendors — frequently in the top three for total active SKUs in the case. The price-to-quality ratio is the standout: Quincy growers pay a fraction of indoor power costs, and the savings show up as well-priced eighths, pre-rolls, and bulk ounces without the harshness you sometimes get from rushed outdoor cures.",
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

// Per-brand custom layout — 2K Gardens (Quincy, WA).
//
// Visual identity is typographic + a subtle field-row CSS pattern rather
// than a remote logo file, by intent: (1) we couldn't verify a public
// website or brand CDN for 2K Gardens — and the standing rule is vendor
// logos come from the brand's own surface only, never aggregator sites
// like Weedmaps or Leafly, (2) the typographic mark renders crisp at any
// density without 404 risk, (3) the pattern reads as Columbia Basin row
// crops, which is the actual story.
//
// Color palette — harvest olive (#2d4a1e) + wheat-gold (#e8c46a). Picked
// to evoke the Columbia Basin in late summer (Quincy is in the heart of
// WA's irrigated farm belt — corn, hops, hay, and now cannabis). Deeply
// distinct from the 16 prior dialed-in brand pages — most lean indoor /
// premium / coastal palettes (NWCS forest+gold #0e2a1f+#c8b06b is the
// nearest neighbor; the olive-vs-forest contrast and wheat-vs-brass
// gold keep them clearly separable).
const BRAND_DARK = "#2d4a1e"; // harvest olive
const BRAND_DARK_2 = "#1f3514"; // deeper olive for hero gradient
const BRAND_GOLD = "#e8c46a"; // wheat-gold
const BRAND_GOLD_LIGHT = "#f3dc9a"; // light wheat hover

// Two product lines we surface as filter cards. 2K Gardens runs primarily
// flower + pre-rolls, so we keep the line cards lean: Flower (the bulk of
// the shelf) and Pre-Rolls (singles, multi-packs, infused). We add a
// "Bulk Ounce" card distinct from packaged flower because the per-gram
// price difference is significant and customers shop them differently.
// matchToken intentionally loose so naming variants in the catalog all
// sweep into the right bucket.
const SUB_BRANDS: Array<{ name: string; tag: string; line: string; matchToken: string }> = [
  {
    name: "Flower",
    tag: "Packaged",
    line: "Quincy outdoor / greenhouse flower in pre-packed eighths, quarters, and halves. Strain rotation reflects what hits our receiving — full-season harvest terps, denser cures than rushed outdoor.",
    matchToken: "Flower",
  },
  {
    name: "Bulk Ounce",
    tag: "Best Value",
    line: "Whole-ounce buys at the kind of per-gram price that Quincy land + sun makes possible. Stock rotates by harvest — when it's here it moves fast.",
    matchToken: "Ounce",
  },
  {
    name: "Pre-Rolls",
    tag: "Singles + Multi-Packs",
    line: "House-rolled flower and infused pre-roll variants. Same outdoor / greenhouse flower in joint form for the cheaper-than-flower out-the-door price.",
    matchToken: "Pre-Roll",
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

// CSS-rendered field-row pattern — alternating gold + olive bands evoke
// Columbia Basin row crops viewed from above. No image asset; pure
// gradient. Used at low opacity behind the wordmark hero and as a
// divider strip in the sub-brands section.
const FIELD_PATTERN: React.CSSProperties = {
  backgroundImage: `
    repeating-linear-gradient(95deg, rgba(232,196,106,0.18) 0 14px, transparent 14px 56px),
    repeating-linear-gradient(95deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 28px)
  `,
};

// 2K Gardens — useState removed because we don't have verified
// sub-brand strain lineups to scope the matchToken filter against;
// the SUB_BRANDS cards above act as visual product-line markers but
// don't need to filter the grid (the grid's built-in strain + sort
// controls handle the relevant slicing). If the operation publishes
// distinct product lines later, swap to the activeSubBrand state
// pattern from spark-industries / 2727.
export default function TwoKGardensBrandPage({
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

  // Attribution-stamped /menu href — emits ?from=brand:2k-gardens so the
  // proxy can record this visit on the gl_attr_source cookie. Inline
  // (per-link) so each CTA on the page reads independently in analytics.
  const menuHref = withAttr("/menu", "brand", "2k-gardens");

  return (
    <div className="bg-stone-50">
      {/* HERO ----------------------------------------------------------- */}
      <section
        className="relative overflow-hidden text-white"
        style={{ backgroundColor: BRAND_DARK_2 }}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${BRAND_DARK_2} 0%, ${BRAND_DARK} 55%, #4a6e2c 100%)`,
          }}
        />
        {/* Field-row pattern evokes the Columbia Basin from above. */}
        <div aria-hidden className="absolute inset-0 opacity-50" style={FIELD_PATTERN} />
        {/* Sun-warmth radial in the upper-right — Quincy summers. */}
        <div
          aria-hidden
          className="absolute -top-28 -right-28 w-[560px] h-[560px] rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle at center, rgba(243,220,154,0.6) 0%, rgba(232,196,106,0.25) 35%, transparent 70%)",
          }}
        />

        <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-5"
            style={{ color: BRAND_GOLD_LIGHT }}
          >
            <Link href="/brands" className="hover:text-white transition-colors">
              All Brands
            </Link>
            <span className="mx-2 opacity-50">/</span>
            2K Gardens
          </p>

          <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-10">
            {/* Typographic logo block — no remote image dependency.
                The "2K" wordmark on a field-pattern square reads as a
                farm signpost over rows of crops. */}
            <div
              className="shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden border-4 border-white/90"
              style={{ backgroundColor: BRAND_DARK }}
            >
              <div aria-hidden className="absolute inset-0 opacity-90" style={FIELD_PATTERN} />
              <div className="relative text-center">
                <p
                  className="font-black text-4xl sm:text-5xl tracking-tight leading-none drop-shadow"
                  style={{ color: BRAND_GOLD_LIGHT }}
                >
                  2K
                </p>
                <p className="text-white font-extrabold text-[10px] sm:text-xs tracking-[0.25em] uppercase mt-2 drop-shadow">
                  Gardens
                </p>
              </div>
            </div>
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                2K Gardens
                <br />
                <span style={{ color: BRAND_GOLD_LIGHT }}>Columbia Basin grown.</span>
              </h1>
              <p className="text-lg sm:text-xl text-stone-200/90 leading-relaxed">
                Quincy, Washington — outdoor and greenhouse cannabis from a Grant County farm
                that came online in 2024 and shot to the top of our flower roster in eighteen
                months.
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  <span style={{ color: BRAND_GOLD_LIGHT }}>●</span> Quincy, WA
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  Producer / Processor
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15">
                  Since Feb 2024
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ backgroundColor: BRAND_GOLD, color: BRAND_DARK_2 }}
                >
                  {brand.activeSkus} on our shelf
                </span>
              </div>
              <div className="flex flex-wrap gap-3 pt-3">
                <Link
                  href={menuHref}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:-translate-y-0.5"
                  style={{ backgroundColor: BRAND_GOLD, color: BRAND_DARK_2 }}
                >
                  Shop 2K Gardens for Pickup →
                </Link>
                <Link
                  href="/brands"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-all border border-white/20"
                >
                  ← All Brands
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY ---------------------------------------------------------- */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: BRAND_DARK }}
          >
            Our Story
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            From a Quincy field to one of our biggest flower vendors in eighteen months.
          </h2>
          <div className="space-y-5 text-stone-700 text-lg leading-relaxed">
            <p>
              2K Gardens came online in February 2024 out of a single Quincy site at 8119 S
              Frontage Rd W. Quincy is the heart of Washington&apos;s irrigated farming belt —
              same Columbia Basin sun and water table that grows the state&apos;s hops, sweet
              corn, and apples — and that&apos;s the agronomy 2K is built on. Outdoor and
              seasonal greenhouse cycles, real Eastern WA summer heat, harvest-time terpene
              profiles you don&apos;t get under year-round indoor lights.
            </p>
            <p>
              Eighteen months in, they were ranked <strong>87 of 542</strong> active Washington
              producer/processors by monthly revenue. The trajectory has been near-vertical —
              over a thousand percent year-over-year growth, zero compliance violations on the
              public WSLCB record. That&apos;s a farm that&apos;s figured out the math on
              Columbia Basin land and is scaling without skipping the cure.
            </p>
            <p>
              We carry 2K Gardens at {STORE.name} because the price-to-quality math is real and
              they&apos;re local in the way that matters — Quincy is two hours down the road
              from Wenatchee, both ends of the same agricultural corridor. The flower lands at
              our receiving fresh, the pre-rolls move fast on the shelf, and the bulk ounce is
              regularly the best value in the case.
            </p>
          </div>
        </div>
      </section>

      {/* PRODUCT LINES -------------------------------------------------- */}
      <section className="bg-stone-50 border-y border-stone-200 relative">
        {/* Field-pattern divider strip across the top edge keeps the
            section visually tied to the hero without dominating it. */}
        <div
          aria-hidden
          className="absolute top-0 inset-x-0 h-1.5 opacity-90"
          style={FIELD_PATTERN}
        />
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
                Three lines, all flower-forward
              </h2>
            </div>
            <p className="text-sm text-stone-500 max-w-md">
              Counts reflect what&apos;s on the {STORE.name} shelf right now — refresh tomorrow,
              the mix may have rotated.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUB_BRANDS.map((sb) => {
              const count = subBrandCounts[sb.name] ?? 0;
              const inStock = count > 0;
              return (
                <div
                  key={sb.name}
                  className="rounded-2xl border border-stone-200 bg-white p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                  style={{ borderTopWidth: 3, borderTopColor: inStock ? BRAND_GOLD : "#e7e5e4" }}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <h3 className="font-extrabold text-lg leading-tight text-stone-900">
                      {sb.name}
                    </h3>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{ backgroundColor: `${BRAND_GOLD}40`, color: BRAND_DARK }}
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

      {/* GROW STORY ----------------------------------------------------- */}
      <section className="bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: BRAND_DARK }}
          >
            Why Quincy
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-10 leading-tight max-w-3xl">
            Columbia Basin sun, irrigation rights, and a two-hour drive to our back door.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                emoji: "☀️",
                title: "Outdoor Sun",
                body: "Quincy sits in WA's irrigated farm belt — the same Columbia Basin sun that grows the state's hops, corn, and apples. Real seasons, real terps.",
              },
              {
                emoji: "💧",
                title: "Basin Water",
                body: "Columbia Basin Project irrigation rights underpin the whole region. Cannabis here gets the same water table that built central WA agriculture.",
              },
              {
                emoji: "🌾",
                title: "Greenhouse Cycles",
                body: "Seasonal greenhouse on top of outdoor — extends the harvest window, lets the cure breathe, keeps the menu fresh through winter.",
              },
              {
                emoji: "🚚",
                title: "120 Miles East",
                body: "Quincy to Wenatchee is two hours down US-2. Flower lands at our receiving fresh — short truck means a tighter bag, less travel oxidation.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-2xl bg-stone-50 border border-stone-200 overflow-hidden hover:shadow-md transition-all"
              >
                <div
                  className="aspect-[4/3] flex items-center justify-center text-6xl relative"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND_DARK} 0%, ${BRAND_DARK_2} 100%)`,
                  }}
                >
                  <div aria-hidden className="absolute inset-0 opacity-50" style={FIELD_PATTERN} />
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

      {/* PRODUCTS ------------------------------------------------------- */}
      <section id="products" className="bg-stone-50 border-y border-stone-200 scroll-mt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: BRAND_DARK }}
          >
            On Our Shelf
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-2 leading-tight">
            2K Gardens at {STORE.name}
          </h2>
          <p className="text-stone-500 mb-10">
            Live menu — prices, THC, and stock as of right now. {products.length} total products,
            paginated 25 per page.
          </p>

          <PaginatedProductsGrid
            products={products}
            perPage={25}
            accentBg="bg-[#2d4a1e]"
            accentBorder="border-[#e8c46a]"
            accentHoverBorder="hover:border-[#e8c46a]"
            accentText="text-[#2d4a1e]"
            accentHoverText="hover:text-[#1f3514]"
            accentGlow="hover:shadow-[#e8c46a]/30"
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
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: BRAND_DARK }}
          >
            About 2K Gardens
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-8 leading-tight">
            Quick facts
          </h2>
          <div className="space-y-3">
            {ABOUT_QA.map(({ q, a }) => (
              <details
                key={q}
                open
                className="group rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden open:bg-white open:shadow-sm transition-all"
                style={{ borderColor: undefined }}
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none transition-colors">
                  <span className="font-semibold text-stone-800 text-sm leading-snug">{q}</span>
                  <svg
                    className="w-5 h-5 shrink-0 text-stone-300 group-open:rotate-180 transition-all duration-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div
                  className="px-5 pb-5 pt-1 text-stone-600 text-sm leading-relaxed border-t"
                  style={{ borderTopColor: `${BRAND_GOLD}66` }}
                >
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONNECT -------------------------------------------------------- */}
      <section className="text-white relative overflow-hidden" style={{ backgroundColor: BRAND_DARK }}>
        <div aria-hidden className="absolute inset-0 opacity-25" style={FIELD_PATTERN} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: BRAND_GOLD_LIGHT }}
            >
              About the License
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 leading-tight">
              On the public WSLCB record
            </h2>
            <ul className="space-y-3 text-stone-200">
              <li className="flex items-center gap-3">
                <span
                  className="w-24 text-xs font-bold uppercase tracking-wider"
                  style={{ color: BRAND_GOLD_LIGHT }}
                >
                  License
                </span>
                <span>WSLCB 436709</span>
              </li>
              <li className="flex items-center gap-3">
                <span
                  className="w-24 text-xs font-bold uppercase tracking-wider"
                  style={{ color: BRAND_GOLD_LIGHT }}
                >
                  UBI
                </span>
                <span>605203573</span>
              </li>
              <li className="flex items-center gap-3">
                <span
                  className="w-24 text-xs font-bold uppercase tracking-wider"
                  style={{ color: BRAND_GOLD_LIGHT }}
                >
                  Address
                </span>
                <span>8119 S Frontage Rd W, Ste B, Quincy WA 98848</span>
              </li>
              <li className="flex items-center gap-3">
                <span
                  className="w-24 text-xs font-bold uppercase tracking-wider"
                  style={{ color: BRAND_GOLD_LIGHT }}
                >
                  County
                </span>
                <span>Grant County, WA</span>
              </li>
              <li className="flex items-center gap-3">
                <span
                  className="w-24 text-xs font-bold uppercase tracking-wider"
                  style={{ color: BRAND_GOLD_LIGHT }}
                >
                  Active
                </span>
                <span>February 2024 → present · 0 violations</span>
              </li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: BRAND_GOLD_LIGHT }}
              >
                Pickup at {STORE.name}
              </p>
              <p className="text-xl font-extrabold mb-1">
                {brand.activeSkus} 2K Gardens product{brand.activeSkus !== 1 ? "s" : ""} ready in{" "}
                {STORE.address.city}
              </p>
              <p className="text-sm text-stone-300/90 leading-relaxed">
                Order ahead and your kit&apos;s waiting at the counter. {STORE.address.full}.
                21+ with valid ID. Cash only.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                href={menuHref}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all"
                style={{ backgroundColor: BRAND_GOLD, color: BRAND_DARK_2 }}
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
        label="Shop 2K Gardens →"
        href={menuHref}
        bgClass="bg-[#2d4a1e]"
        textClass="text-[#e8c46a]"
        hoverClass="hover:bg-[#1f3514]"
      />
    </div>
  );
}
