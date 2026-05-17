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

// About-MFUSED Q&A — verified facts pulled from mfused.com plus
// independent confirmation from Marijuana Venture (Jeffery Freeman Jr.
// profile) and the Washington BBB business profile. FAQPage JSON-LD
// emitted from BrandAboutQA so schema can't drift from visible items.
//
// No medical or therapeutic claims — copy describes product types and
// THC ratios only. WAC 314-55-155 governs external advertising; this
// page is point-of-sale product info in budtender voice.
const ABOUT_QA = [
  {
    q: "Where is MFUSED made?",
    a: "Seattle, Washington — at their facility on 4th Ave S in the Georgetown industrial district. They've been processing cannabis there since 2012.",
  },
  {
    q: "Who founded MFUSED?",
    a: "Co-founders Adam Melero, Yung Tan, and Jeffery Freeman Jr. The company started in 2012 and Freeman is still on the leadership team as Chief Sales Officer. Marijuana Venture has called MFUSED the largest minority-owned cannabis company in Washington.",
  },
  {
    q: "What is Super Fog?",
    a: "MFUSED's flagship vape platform — a smart all-in-one device with a digital screen, three heat settings, and the Jefé atomizer. The line splits four ways: VIBES (mild and approachable), TWISTED (THCa diamonds + natural terpenes), FIRE (THCa + live resin terpenes), and LOUD (full-spectrum, high-terpene extract).",
  },
  {
    q: "What's the difference between MFUSED and other Washington vape brands?",
    a: "Scale and the hardware. MFUSED is consistently among Washington's top-selling cartridge brands — they process oil at volume from a network of partner farms and they engineer their own hardware (ION cartridge, Jefé AIO, Super Fog Plus screen). The result on the shelf is a cart that hits the way it should every time and a disposable that doesn't die mid-session.",
  },
];

// Per-brand custom layout — MFUSED.
// Palette: electric cyan + midnight navy. Reads as vape-tech / fog /
// electric, distinct from NWCS deep-forest+gold and Phat Panda hot-pink.
const PALETTE: BrandPalette = {
  dark: "#0a1628", // primary brand dark — midnight navy
  dark2: "#0a1628", // gradient mid-stop (same dark — let to-stop carry the cyan glow)
  dark3: "#06b6d4", // gradient end-stop — electric cyan
  accent: "#06b6d4", // electric cyan
  accentMuted: "#22d3ee", // hover state
};

// Brand assets. If any 404 in production, the surrounding gradient + wordmark
// degrades gracefully — page still renders cleanly.
//
// Logo + hero re-sourced 2026-05-09 — MFUSED migrated their Squarespace
// CDN account at some point in 2025 and the prior /615e1a4988dec77d8d5e6a3a/
// asset id + the /s/ permalink path both 404'd. New URLs verified live
// (200) and on the brand's current Squarespace CDN per
// `feedback_vendor_logo_sources`. Hero swapped from Super Fog product
// glamour shot (no longer hosted) to the brand's current website hero
// background — same brand-mood signal. Sister of scc same-push.
const MFUSED_LOGO =
  "https://images.squarespace-cdn.com/content/v1/65982e5124b1b60fe9b2d332/024d7af8-d7c9-4063-9864-b4466977e9ee/mfused-web-logo.png";
const MFUSED_HERO =
  "https://images.squarespace-cdn.com/content/v1/65982e5124b1b60fe9b2d332/c5446a33-288e-4a56-a2d2-5cf2534b64cf/hero-bg.png";

const SUB_BRANDS: Array<{ name: string; tag: string; line: string }> = [
  {
    name: "Super Fog",
    tag: "Smart Vape AIO",
    line: "The flagship — Jefé all-in-one disposable with a digital screen, three heat settings, and the Spark Button. Comes in VIBES, TWISTED, FIRE, and LOUD.",
  },
  {
    name: "ION",
    tag: "510 Cartridges",
    line: "Reengineered cartridge — proprietary mouthpiece, stainless steel internals, glass tank, leak-resistant. Universal 510 thread.",
  },
  {
    name: "Jefé",
    tag: "Disposables",
    line: "All-in-one disposable vape. Cold Start primer, adjustable heat, no charging. The grab-and-go format.",
  },
  {
    name: "Fattys",
    tag: "Pre-Rolls",
    line: "Infused pre-rolls — Super Fog oil rolled into flower. Sold in 1g and multi-packs.",
  },
  {
    name: "Twisted",
    tag: "High-Strength",
    line: "Melted THCa diamonds plus all-natural terpenes. Flavor-forward and potent.",
  },
  {
    name: "Fire",
    tag: "Live Resin",
    line: "THCa diamonds plus live resin terpenes. The full-spectrum-style hit without the price of solventless.",
  },
  {
    name: "Loud",
    tag: "High-Terpene",
    line: "Full-spectrum extract that leans terpene-heavy. The flavor pick.",
  },
  {
    name: "Vibes",
    tag: "Approachable",
    line: "The lower-strength tier — gentler draw, milder onset. Good entry point if you're new to high-THC vapes.",
  },
];

const APPROACH_CARDS = [
  {
    emoji: "💨",
    title: "Smart AIO",
    body: "Super Fog Jefé Plus — digital screen, three heat settings, dosing timer, battery monitor. The most-stocked MFUSED format on our wall.",
  },
  {
    emoji: "🛢️",
    title: "ION Cartridges",
    body: "Glass tank, stainless steel internals, proprietary mouthpiece, leak-resistant. Universal 510 thread fits any battery you already own.",
  },
  {
    emoji: "💎",
    title: "THCa Concentrates",
    body: "Twisted and Fire tiers use melted THCa diamonds — Twisted with all-natural terpenes, Fire with live resin terpenes for a fuller flavor profile.",
  },
  {
    emoji: "🫙",
    title: "Infused Pre-Rolls",
    body: "Fattys are flower rolled with Super Fog oil through it. Single 1g and multi-pack formats — the 'no-vape' way to get the same line.",
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

export default function MfusedBrandPage({
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
      {/* HERO — facility photo + dot pattern in the decoration slot */}
      <BrandHero
        palette={PALETTE}
        crumb="MFUSED"
        logoUrl={MFUSED_LOGO}
        logoAlt="MFUSED logo"
        title="MFUSED"
        tagline="Super Fog"
        subtitle="Seattle-built since 2012. One of Washington's top-selling cartridge brands — Super Fog AIO, ION carts, Jefé disposables, Fattys pre-rolls."
        pills={[
          { kind: "muted", label: "Seattle, WA", dot: true },
          { kind: "muted", label: "Producer / Processor" },
          { kind: "filled", label: `${brand.activeSkus} on our shelf` },
        ]}
        ctas={[
          { href: "/menu", label: "Order MFUSED for Pickup →", variant: "primary" },
          {
            href: "https://www.mfused.com/",
            label: "Visit mfused.com ↗",
            variant: "secondary",
            external: true,
          },
        ]}
      >
        {/* Background facility/product photo from mfused.com — washed down so
            the wordmark + headline stay legible on small screens. */}
        <Image
          src={MFUSED_HERO}
          alt=""
          fill
          priority
          unoptimized
          aria-hidden
          className="object-cover opacity-20"
        />
        {/* Cyan dot pattern overlay on top of the photo. */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(circle, #06b6d4 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </BrandHero>

      {/* STORY */}
      <BrandStory
        palette={PALETTE}
        eyebrow="Our Story"
        headline="Built in Seattle. Stocked across Washington."
      >
        <p>
          MFUSED started in 2012 — co-founded by Adam Melero, Yung Tan, and Jeffery Freeman Jr.
          Freeman had been operating in Washington&apos;s medical space since 2010, and the
          MFUSED launch was his bet that purpose-engineered hardware plus high-purity oil would
          beat the convenience-store cart that defined the early I-502 vape market. The bet
          paid out. Marijuana Venture has called MFUSED the largest minority-owned cannabis
          company in Washington.
        </p>
        <p>
          Today they run the operation out of <strong>Seattle&apos;s Georgetown industrial
          district</strong>, processing oil at volume from a network of partner farms and
          shipping into Washington, Arizona, and New York. The Super Fog Jefé all-in-one is
          the flagship — a vape with a digital screen, three heat settings, and a Spark Button
          that walks the line between &quot;disposable&quot; and &quot;serious device.&quot;
          The ION cartridge is their answer to the standard 510: glass tank, stainless internals,
          proprietary mouthpiece.
        </p>
        <p>
          We carry MFUSED at {STORE.name} because the consistency holds up. The carts hit the
          way they should, the disposables don&apos;t die mid-session, and the Super Fog flavor
          tiers (VIBES / TWISTED / FIRE / LOUD) make it easy to point a customer at exactly
          the experience they&apos;re asking for. Ask a budtender if you want a sample of what
          each tier does.
        </p>
      </BrandStory>

      {/* SUB-BRANDS — per-brand because match shape varies brand-to-brand */}
      <section className="bg-stone-50 border-y border-stone-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: PALETTE.dark }}
              >
                The Lineup
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
                Eight ways to find what you&apos;re after
              </h2>
            </div>
            <p className="text-sm text-stone-500 max-w-md">
              Hardware tier, cartridge format, or Super Fog flavor — tap a card to filter the live
              menu below to just that line.
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
                      ? "bg-[#0a1628] border-[#06b6d4] shadow-lg ring-2 ring-[#06b6d4]/40"
                      : disabled
                        ? "bg-stone-50 border-stone-100 opacity-50 cursor-not-allowed"
                        : "bg-white border-stone-200 hover:border-[#06b6d4] hover:shadow-md hover:-translate-y-0.5"
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
                          ? "bg-[#06b6d4] text-[#0a1628]"
                          : "bg-[#06b6d4]/15 text-[#0a1628]"
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
                        ? "text-[#06b6d4]"
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

      {/* APPROACH — "How They Make It" 4-card grid (per-brand; varies brand-to-brand
          enough that extracting it would over-abstract — emojis, gradients, copy
          all hand-tuned). */}
      <section className="bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: PALETTE.dark }}
          >
            How They Make It
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-10 leading-tight max-w-3xl">
            Hardware plus high-purity oil. Both engineered in-house.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {APPROACH_CARDS.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl bg-stone-50 border border-stone-200 overflow-hidden hover:shadow-md transition-all"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-[#cffafe] to-[#a5f3fc] flex items-center justify-center text-6xl">
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

      {/* PRODUCTS — accent classes stay literal at the call site so Tailwind v4 JIT picks them up */}
      <section id="products" className="bg-stone-50 border-y border-stone-200 scroll-mt-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: PALETTE.dark }}
          >
            On Our Shelf
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 mb-2 leading-tight">
            MFUSED at {STORE.name}
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
            accentBg="bg-[#0a1628]"
            accentBorder="border-[#06b6d4]"
            accentHoverBorder="hover:border-[#06b6d4]"
            accentText="text-[#0a1628]"
            accentHoverText="hover:text-[#0e7490]"
            accentGlow="hover:shadow-[#06b6d4]/30"
          />
        </div>
      </section>

      {/* ABOUT — Q&A (FAQPage JSON-LD emitted from same items[] inside shell) */}
      <BrandAboutQA palette={PALETTE} brandName="MFUSED" items={ABOUT_QA} />

      {/* CONNECT — links + merged pickup card */}
      <BrandConnectBlock
        palette={PALETTE}
        brandName="MFUSED"
        links={[
          { label: "Web", href: "https://www.mfused.com/", text: "mfused.com" },
          {
            label: "Super Fog",
            href: "https://www.mfused.com/super-fog",
            text: "mfused.com/super-fog",
          },
          {
            label: "Instagram",
            href: "https://www.instagram.com/mfusedculture/",
            text: "@mfusedculture",
          },
          { label: "HQ", text: "6527 4th Ave S, Seattle, WA 98108" },
        ]}
        pickup={{
          eyebrow: `Pickup at ${STORE.name}`,
          headline: `${brand.activeSkus} MFUSED product${brand.activeSkus !== 1 ? "s" : ""} ready in ${STORE.address.city}`,
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
        label="Order MFUSED →"
        bgClass="bg-[#0a1628]"
        textClass="text-[#06b6d4]"
        hoverClass="hover:bg-[#0e1f33]"
      />
    </div>
  );
}
