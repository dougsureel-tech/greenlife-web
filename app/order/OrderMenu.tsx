"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProductPlaceholderGradient } from "@/lib/product-placeholder";
import { getCategoryIcon } from "@/lib/product-placeholder-icons";
import { effectivePriceFor, ONLINE_DISCOUNT_PCT } from "@/lib/online-pricing";
import { medicalNoTaxPrice } from "@/lib/medical-pricing";
import type { MenuProduct, ActiveDeal } from "@/lib/db";
import { groupByFamily, type FamilyGroup, type FamilyMember } from "@/lib/product-family";
import type { ProductFlags } from "@/lib/budtender-picks";
import { BudtenderPickBadge, NewThisWeekBadge } from "@/components/ProductBadges";
import { STORE, getOrderingStatus, getPickupSlots, type OrderingStatus, type PickupSlot } from "@/lib/store";
import { withAttr } from "@/lib/attribution";
import { CURRENT_TEAM, initialOf } from "@/lib/team";
import { MINUTE_MS, DAY_MS } from "@/lib/time-constants";
import { fetchClosureStatus, type ClosureStatus } from "@/lib/closure-status";
import { eligibleRedemptionTiers, applyRedemptionTier, type RedemptionTier } from "@/lib/loyalty-redemption";
import { BRAND_LOGOS_AVAILABLE } from "@/lib/brand-logos-available";
import { getCategoryPlaceholderPhoto } from "@/lib/category-placeholder-photos";
import { matchProductPhoto } from "@/lib/product-photos-available";

// Map a product to a running deal it qualifies for, if any. Deals are
// category-scoped in our schema (`appliesTo` = "flower", "edibles", "all"
// etc.). We do a stem-match against the product's raw category string —
// the same fuzzy logic the SQL preview already uses on /deals/[id]. First
// match wins (deal list is already ordered by ending-soonest, so the
// urgency-leading deal is the one a card surfaces).
function findDealForProduct(p: MenuProduct, deals: ActiveDeal[]): ActiveDeal | null {
  if (!deals || deals.length === 0) return null;
  const cat = (p.category ?? "").toLowerCase();
  for (const d of deals) {
    if (!d.appliesTo || d.appliesTo === "all") {
      // Storewide deal — every product qualifies.
      return d;
    }
    const stem = d.appliesTo.toLowerCase().replace(/s$/, "");
    if (cat.includes(stem)) return d;
  }
  return null;
}

type CartItem = MenuProduct & { quantity: number };

// Versioned cart payload — wraps items so a future schema change to
// MenuProduct can drop incompatible carts cleanly instead of silently
// rendering broken rows. Backward-compat: legacy carts (bare `CartItem[]`
// arrays from before v1) still load — treated as items with no savedAt.
// Per UX_AUDIT_2026_05_03 P1-2.
type CartPayloadV1 = { v: 1; savedAt: number; items: CartItem[] };
type LoadedCart = { items: CartItem[]; savedAt: number | null };

function loadCart(): LoadedCart {
  if (typeof window === "undefined") return { items: [], savedAt: null };
  try {
    const saved = localStorage.getItem("gl_cart");
    if (!saved) return { items: [], savedAt: null };
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      // Legacy: bare array. Migrate-on-next-save (the useEffect below will
      // wrap into v1 the next time the cart changes).
      return { items: parsed as CartItem[], savedAt: null };
    }
    if (parsed && typeof parsed === "object" && parsed.v === 1 && Array.isArray(parsed.items)) {
      const p = parsed as CartPayloadV1;
      return { items: p.items, savedAt: typeof p.savedAt === "number" ? p.savedAt : null };
    }
    return { items: [], savedAt: null };
  } catch {
    return { items: [], savedAt: null };
  }
}

function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  const payload: CartPayloadV1 = { v: 1, savedAt: Date.now(), items };
  try {
    localStorage.setItem("gl_cart", JSON.stringify(payload));
  } catch {
    // iOS Safari private mode + quota-exceeded both throw on setItem.
    // Cart stays in component state for the session; we just lose the
    // savedAt persistence. Better than tanking checkout mid-add.
    // Sister of inv v363.005/v368.405 + scc v11.205 wrapped siblings.
  }
}
type SortKey = "default" | "price-asc" | "price-desc" | "thc-desc" | "name";
type PriceTier = "all" | "under15" | "15to30" | "over30";
type ThcTier = "all" | "under10" | "10to20" | "over20";

// Tier definitions for the filter rail. Bands chosen to map to the
// natural shopping cohorts: budget pre-roll / single edible at <$15,
// daily-driver flower + most vapes at $15-30, premium flower + concentrates
// + multi-pack edibles at $30+. Same logic for THC: tolerance-friendly
// <10%, sweet-spot 10-20%, high-THC seekers 20%+. CBD-forward flower
// frequently sits in the under-10% THC band — the filter doesn't filter
// CBD%, so a customer hunting CBD lands here naturally.
const PRICE_TIERS: { key: Exclude<PriceTier, "all">; label: string; match: (p: number | null) => boolean }[] = [
  { key: "under15", label: "Under $15", match: (p) => p != null && p < 15 },
  { key: "15to30", label: "$15–30", match: (p) => p != null && p >= 15 && p < 30 },
  { key: "over30", label: "$30+", match: (p) => p != null && p >= 30 },
];
const THC_TIERS: { key: Exclude<ThcTier, "all">; label: string; match: (t: number | null) => boolean }[] = [
  { key: "under10", label: "<10% THC", match: (t) => t != null && t < 10 },
  { key: "10to20", label: "10–20% THC", match: (t) => t != null && t >= 10 && t < 20 },
  { key: "over20", label: "20%+ THC", match: (t) => t != null && t >= 20 },
];

// Preferred sidebar order. Categories not on this list are appended at the
// end in alphabetical order, so the sidebar always reflects what's actually
// in the data without needing a code change for new categories.
const CATEGORY_ORDER = [
  "Flower",
  "Pre-Rolls",
  "Pre-Roll",
  "Vapes",
  "Cartridge",
  "Cartridges",
  "Disposable",
  "Disposables",
  "Pod",
  "Pods",
  "Concentrates",
  "Concentrate",
  "Edibles",
  "Edible",
  "Beverages",
  "Beverage",
  "Capsules",
  "Capsule",
  "Tinctures",
  "Tincture",
  "Topicals",
  "Topical",
  "CBD",
  "Accessories",
  "Accessory",
];

// DB-name → label shown in UI. Falls back to the raw category name.
const CAT_DISPLAY: Record<string, string> = {
  Cartridge: "Cartridges",
  Disposable: "Disposables",
  Pod: "Pods",
  Concentrate: "Concentrates",
  Edible: "Edibles",
  Beverage: "Beverages",
  Capsule: "Capsules",
  Tincture: "Tinctures",
  Topical: "Topicals",
  Accessory: "Accessories",
  "Pre-Roll": "Pre-Rolls",
};

const STRAIN_COLORS: Record<string, { badge: string; dot: string }> = {
  Sativa: { badge: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-400" },
  Indica: { badge: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-400" },
  Hybrid: { badge: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-400" },
  CBD: { badge: "bg-sky-100 text-sky-700 border-sky-200", dot: "bg-sky-400" },
};

// Emoji shorthand for strain types — mirrors `MenuSearch.tsx` VIBES visual
// register where Sativa-effects = ⚡ Energize / Indica-effects = 💤 Sleep /
// Hybrid-effects = 🌿 Balanced. Replaces the v15-era color-dot prefix in
// the filter pill row so the pill reads as "⚡ Sativa" not "● Sativa" —
// closer to how customers actually think about cannabis at the counter.
// WAC 314-55-155 safe: emojis are sensory shorthand, not efficacy claims.
const STRAIN_EMOJI: Record<string, string> = {
  Sativa: "⚡",
  Indica: "💤",
  Hybrid: "🌿",
  CBD: "🧘",
};

const CAT_ICONS: Record<string, string> = {
  Flower: "🌿",
  "Pre-Rolls": "🫙",
  "Pre-Roll": "🫙",
  Vapes: "💨",
  Cartridge: "💨",
  Cartridges: "💨",
  Disposable: "💨",
  Disposables: "💨",
  Pod: "💨",
  Pods: "💨",
  Concentrates: "💎",
  Concentrate: "💎",
  Edibles: "🍬",
  Edible: "🍬",
  Beverages: "🥤",
  Beverage: "🥤",
  Capsules: "💊",
  Capsule: "💊",
  Tinctures: "💧",
  Tincture: "💧",
  Topicals: "🧴",
  Topical: "🧴",
  CBD: "🌱",
  Accessories: "🔧",
  Accessory: "🔧",
};

function displayCategory(c: string): string {
  return CAT_DISPLAY[c] ?? c;
}

// The DB has 30+ category strings — DOH-prefixed copies, plural/singular
// variants, "Edible (Liquid)" subforms, "Paraphernalia", etc. Customers
// should see one clean bucket per product type. Returning null filters
// the product out (e.g. internal "Sample" SKUs).
function normalizeCategory(raw: string | null): string | null {
  if (!raw) return null;
  // Strip the WSLCB "DOH " medical-endorsement prefix — these are sold to
  // all adults at retail, just tax-free for medical patients.
  const s = raw
    .trim()
    .replace(/^DOH\s+/i, "")
    .trim();
  const lower = s.toLowerCase().replace(/\s+/g, " ");
  if (lower === "sample") return null; // internal trade samples — never sold
  if (/^cartridges?$/.test(lower)) return "Cartridges";
  if (/^concentrates?$/.test(lower)) return "Concentrates";
  if (lower === "flower") return "Flower";
  if (/^(infused )?pre[-]?rolls?$/.test(lower)) return "Pre-Rolls";
  if (/^topicals?$/.test(lower)) return "Topicals";
  if (lower === "paraphernalia") return "Accessories";
  if (/^edibles? \(tincture\)$/.test(lower)) return "Tinctures";
  if (/^edibles? \(capsule\)$/.test(lower)) return "Capsules";
  if (/^(edibles? \(liquid\)|infused drinks?)$/.test(lower)) return "Beverages";
  if (/^edibles?( \(solid\))?$/.test(lower)) return "Edibles";
  return s;
}

// Strip duplicated brand / category / strain-type tokens from the SKU-shaped
// title and pull out a weight chip. e.g. "1g - Blueberry Pancakes - 2727 -
// Cartridge - H" with brand="2727", category="Cartridge", strainType="Hybrid"
// → { name: "Blueberry Pancakes", weight: "1g" }.
const STRAIN_TOKENS = new Set(["H", "I", "S", "C", "CBD", "Hybrid", "Indica", "Sativa"]);
const WEIGHT_RX = /^\d+(?:\.\d+)?\s*(?:g|mg|ml|oz)$/i;

function parseProductName(p: MenuProduct): { name: string; weight: string | null } {
  const parts = p.name
    .split(/\s+-\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  let weight: string | null = null;
  const kept: string[] = [];
  for (const part of parts) {
    if (WEIGHT_RX.test(part)) {
      if (!weight) weight = part.toLowerCase().replace(/\s+/g, "");
      continue;
    }
    if (p.brand && part.toLowerCase() === p.brand.toLowerCase()) continue;
    if (p.category && part.toLowerCase() === p.category.toLowerCase()) continue;
    if (STRAIN_TOKENS.has(part)) continue;
    kept.push(part);
  }
  return { name: kept.join(" — ") || p.name, weight };
}

// WA DOH product-compliance logo per WAC 246-70-040 (sister-port of scc v29.185).
// Three official categories: High THC (5 specific product types only) / High CBD
// (CBD-dominant non-smokeable) / General Use (catch-all). Files at
// /public/doh-logos/{high-thc,high-cbd,general-use}.jpg fetched from official
// WA DOH page 2026-05-20.
function pickDohLogo({
  isDohCompliant,
  thcPct,
  cbdPct,
  category,
}: {
  isDohCompliant?: boolean | null;
  thcPct?: number | null;
  cbdPct?: number | null;
  category?: string | null;
}): { src: string; label: string; description: string } {
  const cat = (category ?? "").toLowerCase();
  const thc = thcPct ?? 0;
  const cbd = cbdPct ?? 0;
  const isDoh = isDohCompliant === true || /^DOH\s+/i.test(category ?? "");
  const isHighThcEligibleCategory = /capsule|tablet|tincture|patch|suppositor/.test(cat);
  if (isDoh && isHighThcEligibleCategory) {
    return {
      src: "/doh-logos/high-thc.jpg",
      label: "WA DOH High THC compliant",
      description: "Medical product with 10-50mg active THC per serving (WAC 246-70).",
    };
  }
  const isSmokeable = /flower|pre[-_\s]?roll/.test(cat);
  if (isDoh && cbd > thc && !isSmokeable) {
    return {
      src: "/doh-logos/high-cbd.jpg",
      label: "WA DOH High CBD compliant",
      description: "Medical CBD-dominant product (WAC 246-70).",
    };
  }
  return {
    src: "/doh-logos/general-use.jpg",
    label: "WA DOH General Use",
    description: "Any cannabis product allowed by the WSLCB (WAC 246-70).",
  };
}

// Brand-logo fallback (sister-port of scc v29.005): when a product has no
// real photo, try to render the vendor's brand logo (~60 logos shipped in
// /public/brand-logos/) before falling through to the strain-tinted
// gradient. Slug the brand name to match the file convention
// (`buddy-boy-farm.png`, `the-goodship.png`). We can't probe file existence
// from a client component, so the <Image> onError flips state to drop back
// to CategoryIcon — gives the same "deliberate surface" feel for brands we
// don't have a logo for yet.
function slugifyBrandForLogo(brand: string): string {
  return brand
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Strain-type → semantic accent color, mirrored across both stores.
// 2026-05-28 (Doug-directive placeholder polish): SCC has ~84% missing-
// photo SKUs, so the gradient-only fallback is the most-seen surface on
// the menu. Adding a left edge stripe in the strain-type's semantic color
// (sativa=amber, indica=violet, hybrid=blue-green, CBD=sky) raises the
// "at-a-glance strain identity" signal on placeholder cards from "kinda
// tinted gradient" to "color-coded by strain type" — same purpose as the
// strain-chip top-right but read instantly even when the chip is
// overlapped by the deal/DOH chips on the outer card.
// Uses Tailwind border-l-color classes (module-scope literals = JIT-safe).
// All other surfaces (real-photo branch) skip the stripe — vendor
// photography carries its own visual identity, no need to compete.
const STRAIN_EDGE_STRIPE: Record<string, string> = {
  Sativa: "border-l-amber-400",
  Indica: "border-l-violet-400",
  Hybrid: "border-l-emerald-400",
  CBD: "border-l-sky-400",
};

function ProductImage({
  src,
  alt,
  category,
  brand,
  strainType,
  thcPct,
  productName,
}: {
  src: string | null;
  alt: string;
  category: string | null;
  brand?: string | null;
  strainType?: string | null;
  /** Optional THC% — only rendered on the no-photo placeholder branch
   *  (real vendor photo cards don't sacrifice photography for it). */
  thcPct?: number | null;
  /** Optional product name — only rendered on the gradient-only fallback
   *  (tier 4) when no brand logo is available. Helps with at-a-glance
   *  identification on cards that have no real photo + no brand logo +
   *  no category placeholder photo (the absolute-last-resort tier).
   *  2026-05-28 Doug-directive placeholder polish. */
  productName?: string | null;
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [brandLogoErrored, setBrandLogoErrored] = useState(false);
  const [categoryPlaceholderErrored, setCategoryPlaceholderErrored] = useState(false);
  const CategoryIcon = getCategoryIcon(category);
  const brandLogoSlug = brand ? slugifyBrandForLogo(brand) : null;
  // Generic category-placeholder photo path — only set when the category
  // maps to an installed JPG (flower / preroll / vape variants). Doug
  // 2026-05-21: "we can find generic photos we can use as placeholders for
  // now if we cant find a cartrige image or something like that." Acts as
  // the tier BELOW brand-logo and ABOVE the CategoryIcon SVG fallback.
  // See lib/category-placeholder-photos.ts.
  const categoryPlaceholderPath = !brandLogoSlug || !BRAND_LOGOS_AVAILABLE.has(brandLogoSlug)
    ? getCategoryPlaceholderPhoto(category)
    : null;
  const tryCategoryPlaceholder =
    !!categoryPlaceholderPath && !categoryPlaceholderErrored;
  // Build-time manifest gate — only attempt the brand-logo render when
  // the PNG actually exists on disk. Pre-manifest, products whose slug
  // didn't match an existing file would fetch a 404 + briefly show the
  // browser's broken-image icon before React's onError re-rendered to
  // the CategoryIcon branch. Sister-fix to SCC same component;
  // see lib/brand-logos-available.ts doctrine.
  const hasLogo = !!brandLogoSlug && BRAND_LOGOS_AVAILABLE.has(brandLogoSlug);
  const tryBrandLogo = hasLogo && !brandLogoErrored;

  // Strain-type edge-stripe class — only set on placeholder branches
  // (real-photo cards skip the stripe since vendor photography carries its
  // own visual identity). 2026-05-28 Doug-directive placeholder polish.
  const edgeStripe =
    strainType && STRAIN_EDGE_STRIPE[strainType]
      ? `border-l-4 ${STRAIN_EDGE_STRIPE[strainType]}`
      : "";

  if ((!src || errored) && tryCategoryPlaceholder && categoryPlaceholderPath) {
    // Generic-category placeholder branch (tier 3 of 4 in the fallback
    // chain). Fires when there's no real product photo + no brand logo,
    // but the category maps to a generic photo on disk (flower / preroll /
    // vape). Full-bleed image with strain-chip + brand-pill + thc-pct
    // overlays — same chip system as the brand-logo branch below, just
    // composited on a photo instead of a gradient.
    return (
      <div
        role="img"
        aria-label={alt}
        className={`relative w-full h-full overflow-hidden bg-stone-100 ${edgeStripe}`}
      >
        <Image
          src={categoryPlaceholderPath}
          alt={alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
          onError={() => setCategoryPlaceholderErrored(true)}
          unoptimized
        />
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none"
          aria-hidden="true"
        />
        {strainType ? (
          <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider text-stone-900 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-md border border-white/50 shadow-sm">
            {strainType}
          </span>
        ) : null}
        {brand ? (
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider text-stone-900 px-2.5 py-1 bg-white/85 backdrop-blur-sm rounded-full line-clamp-1 max-w-[80%] shadow-sm border border-white/50">
            {brand}
          </span>
        ) : null}
        {typeof thcPct === "number" && thcPct > 0 ? (
          <span className="absolute bottom-2 right-2 text-[9px] font-medium tracking-wide text-stone-900 font-variant-numeric tabular-nums px-1.5 py-0.5 bg-white/85 backdrop-blur-sm rounded-md border border-white/50 shadow-sm">
            THC {thcPct.toFixed(1)}%
          </span>
        ) : null}
      </div>
    );
  }

  if (!src || errored) {
    // Strain-tinted (Flower/Pre-Roll) or category-tinted gradient — picks
    // the right Tailwind class via the shared `lib/product-placeholder.ts`
    // helper. Same helper used by `app/brands/[slug]/_brands/
    // PaginatedProductsGrid.tsx` so brand-page + menu grid placeholders
    // stay visually consistent. Brand renders as a white-pill chip for
    // contrast against the tinted gradient.
    const gradient = getProductPlaceholderGradient(category, strainType);
    // Tier 4 is the absolute-last-resort branch — when even the brand
    // logo + category placeholder photo missed. SCC at ~84% missing-
    // photo SKUs (2026-05-28) makes this the most-seen surface, so we
    // show the product name + "Photo coming soon" subtitle to signal
    // this is a deliberate state rather than a broken card.
    const showLastResortLabel = !tryBrandLogo;
    return (
      <div
        role="img"
        aria-label={alt}
        className={`relative w-full h-full ${gradient} overflow-hidden ${edgeStripe}`}
      >
        {/* Subtle dot-grid texture so the placeholder reads as a deliberate
            card surface (not a missing-photo state). ~6% opacity sits below
            the icon + brand pill without competing for attention. */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "14px 14px",
            color: "rgb(68 64 60)",
          }}
          aria-hidden="true"
        />
        {/* Soft light-glow corners — adds depth so the gradient feels lit
            rather than flat. Larger blurs on the bottom-left so the eye
            settles on the brand pill. */}
        <div
          className="absolute -top-6 -right-6 w-24 h-24 bg-white/40 rounded-full blur-2xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/25 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        {/* Strain-type eyebrow chip top-RIGHT (moved from top-left v37.485
            cycle 2 — top-left is owned by the deal `%-OFF` and DOH chips
            on the outer card. Placeholder strain chip moved here to avoid
            three-chip pileup on a sale+DOH flower product). */}
        {strainType ? (
          <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider text-stone-700/85 px-2 py-0.5 bg-white/75 backdrop-blur-sm rounded-md border border-white/50 shadow-sm">
            {strainType}
          </span>
        ) : null}
        <div className="relative w-full h-full flex flex-col items-center justify-center gap-2 px-3">
          {tryBrandLogo ? (
            // Brand-logo fallback (`/public/brand-logos/<slug>.png`). When
            // the file is missing for this brand the onError handler flips
            // brandLogoErrored=true and the next render falls through to
            // the CategoryIcon branch. The brand pill is suppressed when
            // the logo renders successfully — the logo carries the
            // wordmark, so the pill would just repeat the brand name.
            <Image
              src={`/brand-logos/${brandLogoSlug}.png`}
              alt={`${brand} brand logo`}
              width={160}
              height={160}
              className="w-24 h-24 object-contain drop-shadow-sm"
              onError={() => setBrandLogoErrored(true)}
              unoptimized
            />
          ) : (
            <>
              <CategoryIcon
                className="w-14 h-14 text-stone-700/70 drop-shadow-sm"
                aria-hidden="true"
              />
              {brand ? (
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full line-clamp-1 max-w-[85%] shadow-sm border border-white/50">
                  {brand}
                </span>
              ) : null}
              {/* Last-resort branch (tier 4): show the product name +
                  "Photo coming soon" so the card reads as deliberate
                  rather than broken. SCC has ~84% missing-photo SKUs
                  (2026-05-28) — this branch is the most-seen on menu
                  pages until vendor-asset → product backfill cron
                  closes the gap. Product name is line-clamped to 2 to
                  keep the card height stable across the grid. */}
              {showLastResortLabel && productName ? (
                <span className="text-[10px] font-semibold tracking-tight text-stone-800 line-clamp-2 max-w-[85%] text-center leading-tight">
                  {productName}
                </span>
              ) : null}
              {showLastResortLabel ? (
                <span className="text-[9px] italic tracking-wide text-stone-600/80 max-w-[85%] text-center">
                  Photo coming soon
                </span>
              ) : null}
            </>
          )}
          {/* THC% on placeholder cards only — wrapped in a smaller
              outlined pill so brand-pill + THC-pill read as a deliberate
              two-pill group rather than chip + free-floating caption
              (cycle-3 expert-review pick). Real-photo branch skips this
              entirely. */}
          {typeof thcPct === "number" && thcPct > 0 ? (
            <span className="text-[10px] font-medium tracking-wide text-stone-700/85 font-variant-numeric tabular-nums px-2 py-0.5 bg-white/55 backdrop-blur-sm rounded-full border border-white/45">
              THC {thcPct.toFixed(1)}%
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <>
      {!loaded && <div className="absolute inset-0 img-placeholder" />}
      <Image
        src={src}
        alt={alt}
        fill
        loading="lazy"
        sizes="(min-width: 1280px) 320px, (min-width: 640px) 45vw, 95vw"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={`object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}

type LoyaltyInfo = { points: number; tieredFlagOn: boolean } | null;

export function OrderMenu({
  products,
  signedIn = false,
  activeDeals = [],
  initialLoyalty = null,
  dohVerified = false,
  productFlags,
}: {
  products: MenuProduct[];
  signedIn?: boolean;
  activeDeals?: ActiveDeal[];
  initialLoyalty?: LoyaltyInfo;
  /** True when the signed-in customer has been DOH-card-verified by
   *  staff in-store (`customers.doh_verified_at` is non-null). Drives
   *  medical-no-tax price display on `isDohCompliant` products. */
  dohVerified?: boolean;
  /** Customer Engagement Layer Ship 2 — keyed by `MenuProduct.id` →
   *  Budtender's Pick + New This Week badge data. Fetched server-side
   *  on `/order` page with 5-min ISR (`lib/budtender-picks.ts`). When
   *  undefined or empty (brapp outage / not yet populated), badges
   *  simply don't render — graceful degradation. */
  productFlags?: Map<string, ProductFlags>;
}) {
  const router = useRouter();
  const initialCart = useMemo(() => loadCart(), []);
  // Stale-cart prompt: when a saved cart is older than 48h, show a one-time
  // banner inside the drawer offering to clear. Once dismissed (Clear OR Keep),
  // never re-prompts in this session. (UX_AUDIT P1-2 closure.)
  const STALE_CART_THRESHOLD_MS = 48 * 60 * 60 * 1000;
  const [staleCartDismissed, setStaleCartDismissed] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => initialCart.items);
  const [cartSavedAt] = useState<number | null>(initialCart.savedAt);
  // URL params can pre-fill filters — currently the only producer is
  // /find-your-strain which redirects here with ?category=Flower&strain=hybrid.
  // Reading once at mount; subsequent param changes don't re-key state since
  // the user is then driving via the in-page controls.
  const searchParams = useSearchParams();
  // Read `?q=` on mount so case-card QR codes (Inventory App Hack #18 —
  // budtender-frees-up via in-store self-service) can deep-link to a
  // pre-filtered product view. Customer scans the case card on the floor,
  // lands here with the product name already searched. No effect on
  // direct visitors who arrive without the param.
  const [search, setSearch] = useState<string>(() => searchParams?.get("q") ?? "");
  const [activeCategory, setActiveCategory] = useState<string | null>(
    () => searchParams?.get("category") ?? null,
  );
  const [strainFilter, setStrainFilter] = useState<string | null>(() => {
    // Strain-type direct: ?strain=sativa|indica|hybrid|cbd from /strains/<type>
    // pages and the find-your-strain quiz. Quiz emits lower-case; strain pills
    // compare exact-case with what the DB returned. Title-case canonicalize.
    const s = searchParams?.get("strain");
    if (s) return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    // Vibe alias: ?vibe=chill|energize|sleep|creative|social|calm from homepage
    // mood-shortcut chips (app/page.tsx ~line 996), /not-found mood recovery,
    // and find-your-strain quiz. Maps to a strain-type filter so the customer's
    // mood-led tap doesn't dead-end at an unfiltered menu. Mapping is
    // DESCRIPTIVE not THERAPEUTIC — we never print "indica helps X"; the chip
    // is "Chill" and the result is a strain-filtered grid. WAC 314-55-077 safe.
    // Per MENU_PREVIEW_DIAL_IN_AUDIT_2026_05_27.md §7.
    const vibe = searchParams?.get("vibe");
    if (!vibe) return null;
    const VIBE_TO_STRAIN: Record<string, string> = {
      chill: "Hybrid",
      calm: "Indica",
      energize: "Sativa",
      sleep: "Indica",
      creative: "Sativa",
      social: "Hybrid",
      // Backward-compat aliases per architecture doc §6: "relief" was renamed
      // to "calm" pre-WAC sweep; honor legacy shared links for 90d.
      relief: "Indica",
    };
    return VIBE_TO_STRAIN[vibe.toLowerCase()] ?? null;
  });
  const [brandFilter, setBrandFilter] = useState<string | null>(() => {
    // `/brands/[slug]` CTAs (shipped v36.305) deep-link with `?brand=<slug>`
    // e.g. `honu-inc`. Resolve slug → exact brand name by matching slugified
    // `product.brand` names so the existing exact-match filter check picks
    // up. Falls back to raw slug if no product matches — filter then yields
    // empty state, surfaces "no products for this brand right now" honestly
    // instead of silently stealth-no-op'ing the URL param.
    const b = searchParams?.get("brand");
    if (!b) return null;
    const slugify = (s: string) =>
      s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const target = slugify(b);
    const match = products.find((p) => p.brand && slugify(p.brand) === target);
    return match?.brand ?? b;
  });
  const [priceTier, setPriceTier] = useState<PriceTier>("all");
  const [thcTier, setThcTier] = useState<ThcTier>("all");
  const [sortBy, setSortBy] = useState<SortKey>("default");
  // Auto-reopen the cart drawer when arriving from the sign-in detour. The
  // sign-in URLs stamp `?cart=open` (UX_AUDIT_2026_05_03 P0 #4); reading the
  // param + the persisted cart in this lazy initializer means the drawer is
  // open on first paint — no flash of "menu without cart bar". A separate
  // mount-only effect strips the param so a refresh / back-nav doesn't keep
  // re-opening. Doing this in useState (not useEffect) sidesteps the React 19
  // set-state-in-effect lint and avoids a render-then-open flicker.
  const [cartOpen, setCartOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get("cart") !== "open") return false;
    return loadCart().items.length > 0;
  });
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [pickupTime, setPickupTime] = useState<string>("");
  const [pickupSlots, setPickupSlots] = useState<PickupSlot[]>([]);
  const [orderingStatus, setOrderingStatus] = useState<OrderingStatus | null>(null);
  // Emergency-closure status from the inventoryapp. Mount-fetch + before-submit
  // re-check (placeOrder). isClosed=true blocks the Place Order button +
  // surfaces an amber banner. Any network/timeout failure degrades to
  // isClosed=false (lib helper guarantees this) so a flaky closure endpoint
  // never silently blocks customers during normal hours.
  const [closure, setClosure] = useState<ClosureStatus>({ isClosed: false, reason: null });
  const [selectedTierPointCost, setSelectedTierPointCost] = useState<number | null>(null);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    let cancelled = false;
    fetchClosureStatus().then((c) => {
      if (!cancelled) setClosure(c);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // One-shot URL hygiene: strip `?cart=open` after the lazy initializer above
  // has consumed it, so a page refresh / back-nav doesn't keep re-arming the
  // drawer. No setState here — pure side-effect against window.history, which
  // is what the React 19 lint wants for "external system" effects.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has("cart")) return;
    url.searchParams.delete("cart");
    window.history.replaceState(null, "", url.toString());
  }, []);

  // Keyboard shortcuts (UX_AUDIT P2-6). Power users (Doug demo-ing the
  // menu, regulars who shop weekly) get acceleration. Skips when the user
  // is typing in an input so search-bar typing doesn't trigger.
  // `?` opens overlay · `c` toggles cart · `Esc` closes overlay/drawer
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setShortcutsOpen((p) => !p);
      } else if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        setCartOpen((p) => !p);
      } else if (e.key === "Escape") {
        if (shortcutsOpen) setShortcutsOpen(false);
        else if (cartOpen) setCartOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, shortcutsOpen]);

  // Refresh pickup window while the cart drawer is open so slots shrink as
  // close approaches and the closed-state message updates at the cutoff.
  useEffect(() => {
    if (!cartOpen) return;
    function refresh() {
      const status = getOrderingStatus();
      const slots = getPickupSlots();
      setOrderingStatus(status);
      setPickupSlots(slots);
      setPickupTime((prev) => (prev && slots.some((s) => s.value === prev) ? prev : (slots[0]?.value ?? "")));
    }
    refresh();
    const id = setInterval(refresh, MINUTE_MS);
    return () => clearInterval(id);
  }, [cartOpen]);

  // Normalize raw DB categories to clean buckets ("DOH Cartridge" → "Cartridges",
  // "Edible (Liquid)" → "Beverages") and drop products with no displayable
  // category (e.g. internal "Sample" SKUs that aren't for sale).
  const visibleProducts = useMemo(() => {
    return products.flatMap((p) => {
      const cat = normalizeCategory(p.category);
      if (!cat) return [];
      return [{ ...p, category: cat }];
    });
  }, [products]);

  // Real categories from data, ordered by CATEGORY_ORDER first, then any
  // unknowns appended alphabetically. The sidebar always reflects what's
  // actually in stock — no whitelist drift.
  const categories = useMemo(() => {
    const seen = new Set<string>();
    for (const p of visibleProducts) if (p.category) seen.add(p.category);
    const orderIndex = new Map(CATEGORY_ORDER.map((c, i) => [c, i]));
    return [...seen].sort((a, b) => {
      const ai = orderIndex.get(a) ?? Number.MAX_SAFE_INTEGER;
      const bi = orderIndex.get(b) ?? Number.MAX_SAFE_INTEGER;
      if (ai !== bi) return ai - bi;
      return a.localeCompare(b);
    });
  }, [visibleProducts]);

  // Brands available within the currently-selected category, so the brand
  // dropdown narrows as you drill in.
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    for (const p of visibleProducts) {
      if (activeCategory && p.category !== activeCategory) continue;
      if (p.brand) set.add(p.brand);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [visibleProducts, activeCategory]);

  // Strain types present after category narrowing — hide pills that wouldn't
  // match anything (e.g. CBD when there's no CBD product in this category).
  const availableStrains = useMemo(() => {
    const set = new Set<string>();
    for (const p of visibleProducts) {
      if (activeCategory && p.category !== activeCategory) continue;
      if (p.strainType) set.add(p.strainType);
    }
    return [...set];
  }, [visibleProducts, activeCategory]);

  const filtered = useMemo(() => {
    const result = visibleProducts.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (strainFilter && p.strainType !== strainFilter) return false;
      if (brandFilter && p.brand !== brandFilter) return false;
      if (priceTier !== "all") {
        const tier = PRICE_TIERS.find((t) => t.key === priceTier);
        if (tier && !tier.match(p.unitPrice)) return false;
      }
      if (thcTier !== "all") {
        const tier = THC_TIERS.find((t) => t.key === thcTier);
        if (tier && !tier.match(p.thcPct)) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (p.name + (p.brand ?? "") + (p.category ?? "") + (p.strainType ?? ""))
          .toLowerCase()
          .includes(q);
      }
      return true;
    });
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => (a.unitPrice ?? Infinity) - (b.unitPrice ?? Infinity));
        break;
      case "price-desc":
        result.sort((a, b) => (b.unitPrice ?? -Infinity) - (a.unitPrice ?? -Infinity));
        break;
      case "thc-desc":
        result.sort((a, b) => (b.thcPct ?? -Infinity) - (a.thcPct ?? -Infinity));
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return result;
  }, [visibleProducts, search, activeCategory, strainFilter, brandFilter, priceTier, thcTier, sortBy]);

  // Per-category grouping (existing). MVP size-picker (v42.X — Doug
  // 2026-06-01 ask): also group within-category by product family so
  // multi-size SKUs of the same product (Cookies 1g/3.5g/28g; Cherry
  // Dosidos preroll 2pk/10pk) consolidate into ONE card with inline
  // size pills. Single-member families render byte-identical to the
  // pre-MVP shape (no regression). See `lib/product-family.ts` for the
  // parser + grouping primitive (foundation v42.865, shipped 2026-06-01).
  const grouped = useMemo(() => {
    const map = new Map<string, FamilyGroup[]>();
    const byCategory = new Map<string, MenuProduct[]>();
    for (const p of filtered) {
      const key = p.category ?? "Other";
      if (!byCategory.has(key)) byCategory.set(key, []);
      byCategory.get(key)!.push(p);
    }
    for (const [category, products] of byCategory) {
      map.set(category, groupByFamily(products));
    }
    return map;
  }, [filtered]);

  // Selected size per family — keyed by familyKey, value is the chosen
  // member's product.id. Defaults to first member (smallest size) when
  // unset. Used by the size-pill UI on multi-size family cards to swap
  // which member's price/THC/DOH info renders + which SKU goes in cart.
  const [selectedSizes, setSelectedSizes] = useState<Map<string, string>>(new Map());
  function selectSize(familyKey: string, memberId: string): void {
    setSelectedSizes((prev) => {
      const next = new Map(prev);
      next.set(familyKey, memberId);
      return next;
    });
  }
  function getSelectedMember(family: FamilyGroup): FamilyMember {
    const selectedId = selectedSizes.get(family.familyKey);
    const found = selectedId ? family.members.find((m) => m.id === selectedId) : null;
    return found ?? family.members[0];
  }

  const cartTotal = cart.reduce((s, i) => s + (i.unitPrice ?? 0) * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const eligibleTiers: RedemptionTier[] = useMemo(
    () =>
      signedIn && initialLoyalty?.tieredFlagOn
        ? eligibleRedemptionTiers(initialLoyalty.points, cartTotal)
        : [],
    [signedIn, initialLoyalty, cartTotal],
  );

  const appliedDiscount = useMemo(() => {
    if (selectedTierPointCost == null) return null;
    const tier = eligibleTiers.find((t) => t.pointCost === selectedTierPointCost);
    if (!tier) return null;
    return applyRedemptionTier(tier, cartTotal);
  }, [selectedTierPointCost, eligibleTiers, cartTotal]);

  function addToCart(product: MenuProduct, applicableDeal: ActiveDeal | null) {
    // Path A pricing per Doug 2026-05-16: the discounted price IS the
    // cart charge, not display-only. Store the post-discount unitPrice
    // so cartTotal + line-item math + order submission all flow from
    // a single number. Locks the price at cart-add time (standard
    // e-com behavior — if a daily deal expires between add + checkout,
    // the customer still gets the locked-in price).
    const { displayPrice } = effectivePriceFor(product, applicableDeal);
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { ...product, unitPrice: displayPrice ?? product.unitPrice, quantity: 1 }];
    });
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0),
    );
  }

  function selectCategory(cat: string | null) {
    setActiveCategory(cat);
    setSearch("");
    // Clear stale brand/strain filters that won't match anything in the new
    // category. We do it here instead of in an effect to avoid the
    // setState-in-effect lint rule and a cascading re-render.
    setBrandFilter(null);
    setStrainFilter(null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function placeOrder() {
    if (!pickupTime) {
      setOrderError("Pick a pickup time before placing your order.");
      return;
    }
    // Re-check closure right before submit so a closure activated mid-browse
    // is caught before we hit /api/orders. If the endpoint is unreachable we
    // proceed normally (helper degrades to isClosed=false).
    const liveClosure = await fetchClosureStatus();
    if (liveClosure.isClosed) {
      setClosure(liveClosure);
      setOrderError(
        liveClosure.reason
          ? `We're temporarily closed today — ${liveClosure.reason}. Online orders paused until we reopen.`
          : "We're temporarily closed today. Online orders paused until we reopen.",
      );
      return;
    }
    setPlacing(true);
    try {
      const items = cart.map((i) => ({
        productId: i.id,
        productName: i.name,
        brand: i.brand,
        category: i.category,
        strainType: i.strainType,
        unitPrice: i.unitPrice ?? 0,
        quantity: i.quantity,
      }));
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          notes: notes || undefined,
          pickupTime,
          loyaltyTierPointCost: appliedDiscount != null ? selectedTierPointCost : null,
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (res.status === 401) {
        // After Clerk redirects back, the `?cart=open` param tells the mount
        // effect to re-open the drawer so the customer sees their saved cart
        // immediately. Per UX_AUDIT_2026_05_03 P0 #4. encodeURIComponent on
        // the redirect_url because of the embedded `?` — Clerk handles both
        // shapes but the encoded form is the clean contract.
        router.push(
          `/sign-in?redirect_url=${encodeURIComponent("/order?cart=open")}`,
        );
        return;
      }
      if (res.ok) {
        const body = await res.json().catch(() => null);
        localStorage.removeItem("gl_cart");
        if (body?.orderId) {
          router.push(`/order/confirmation/${body.orderId}`);
        } else {
          router.push("/account?ordered=1");
        }
      } else if (res.status === 409) {
        // Inventory mismatch — strip the unavailable items from the cart and
        // tell the customer what changed so they can try again.
        const body = (await res.json().catch(() => null)) as {
          issues?: Array<{ productId: string; productName: string; reason: string; onHand: number }>;
        } | null;
        const issues = body?.issues ?? [];
        if (issues.length > 0) {
          const offendingIds = new Set(issues.map((i) => i.productId));
          setCart((prev) => prev.filter((c) => !offendingIds.has(c.id)));
          const names = issues.map((i) => i.productName).join(", ");
          setOrderError(`No longer available — removed from cart: ${names}. Review and place again.`);
        } else {
          setOrderError("Some items aren't available — please update your cart.");
        }
        setPlacing(false);
      } else {
        const body = await res.json().catch(() => null);
        setOrderError(body?.error ?? "Couldn't place your order — try again. Your cart is still here.");
        setPlacing(false);
      }
    } catch {
      setOrderError("Connection issue — your cart is still here. Try Place Order again.");
      setPlacing(false);
    }
  }

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center space-y-4">
        <div className="text-5xl mb-4" aria-hidden="true">🌿</div>
        <p className="text-stone-700 text-xl font-semibold">Menu&apos;s down for a sec</p>
        <p className="text-stone-400 text-sm">
          Try refresh, or call us and we&apos;ll take your order over the phone:{" "}
          <a href={`tel:${STORE.phoneTel}`} className="text-green-700 font-semibold">
            {STORE.phone}
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-32">
      {/* Emergency-closure banner. Renders only when a manager has flagged
          today closed via inventoryapp /admin/hours-override. Pairs with the
          `disabled` flag below on Place Order + the before-submit re-check
          inside placeOrder(). Reason text is customer-facing — see the
          public-closure-status endpoint for sourcing. */}
      {closure.isClosed && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-4"
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 shrink-0 text-amber-700 mt-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" />
            </svg>
            <div className="min-w-0">
              <p className="font-bold text-amber-900">
                We&apos;re temporarily closed today
                {closure.reason ? <> — {closure.reason}</> : null}
              </p>
              <p className="text-sm text-amber-800/80 mt-0.5">
                Online orders are paused until we reopen. Try us back soon.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Sign-in nudge — saves customers from finding out at the place-order
          step that they need an account. Cart already persists in localStorage,
          so signing in mid-browse doesn't lose the in-progress cart. */}
      {!signedIn && (
        <Link
          // sign-in nudge is the highest-leverage cookie-stamp surface on /order:
          // any unsigned customer who clicks-through here is then identifiable
          // when they place an order. attribution lets us trace which page sent
          // them through the sign-in funnel later.
          // `cart=open` armed for the post-sign-in mount — if the customer
          // has anything in their persisted cart by then, the drawer will
          // re-open automatically (P0 #4). The redirect_url is encoded so
          // the embedded `?cart=open` survives Clerk's redirect handling.
          href={withAttr(
            `/sign-in?redirect_url=${encodeURIComponent("/order?cart=open")}`,
            "order",
            "sign-in-nudge",
          )}
          className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border border-green-200 px-4 py-3 text-sm hover:border-green-300 hover:from-green-100 hover:to-green-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <svg
              className="w-4 h-4 shrink-0 text-green-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span className="truncate">
              <strong className="text-green-900 font-bold">Sign in</strong>
              <span className="text-green-800/80"> to save your cart and earn loyalty points</span>
            </span>
          </span>
          <span className="shrink-0 inline-flex items-center gap-1 text-green-700 font-bold text-xs whitespace-nowrap">
            Sign in
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </Link>
      )}

      {/* Search bar */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
          />
        </svg>
        <input
          type="search"
          placeholder="Search products, brands, strains…"
          aria-label="Search products, brands, and strains"
          autoComplete="off"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setActiveCategory(null);
          }}
          className="w-full rounded-2xl border border-stone-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
        />
        {search && (
          // Hit area is 44×44 (Apple HIG floor) — visual disc stays 5×5 (20px)
          // via the inner span so the search bar doesn't visually grow. The
          // outer button supplies the tappable surface; `flex items-center`
          // centers the disc so the X stays optically pinned to the right
          // edge it always lived at.
          <button type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-end pr-2 text-stone-500 hover:text-stone-700"
          >
            <span
              aria-hidden
              className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-xs"
            >
              ×
            </span>
          </button>
        )}
      </div>

      <div className="flex gap-6 items-start">
        {/* Sticky category sidebar (desktop) */}
        <aside className="hidden lg:block w-48 shrink-0 sticky top-20 space-y-1">
          <button type="button"
            onClick={() => selectCategory(null)}
            className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${activeCategory === null && !search ? "bg-green-100 text-green-800" : "text-stone-500 hover:bg-stone-100"}`}
          >
            <span className="text-base" aria-hidden="true">🛒</span> All Items
            <span className="ml-auto text-[11px] text-stone-400">{visibleProducts.length}</span>
          </button>
          {categories.map((c) => {
            const count = visibleProducts.reduce((n, p) => n + (p.category === c ? 1 : 0), 0);
            return (
              <button type="button"
                key={c}
                onClick={() => selectCategory(c)}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${activeCategory === c ? "bg-green-100 text-green-800" : "text-stone-500 hover:bg-stone-100"}`}
              >
                <span className="text-base">{CAT_ICONS[c] ?? "•"}</span>
                <span className="truncate">{displayCategory(c)}</span>
                <span className="ml-auto text-[11px] text-stone-400">{count}</span>
              </button>
            );
          })}
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Mobile category pills — sticky at the top of the viewport so the
              user can switch sections without scrolling back up. SiteHeader
              is sticky at top:0 with h-16 (64px); these pills sit at top:16
              just below it. Backdrop-blur + translucent so the row still
              feels like part of the page, not an opaque overlay. */}
          <div className="lg:hidden sticky top-16 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-4 bg-stone-50/85 backdrop-blur-md border-b border-stone-200/60 flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-x-visible">
            <button type="button"
              onClick={() => selectCategory(null)}
              className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors ${activeCategory === null ? "bg-green-800 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
            >
              All
            </button>
            {categories.map((c) => (
              <button type="button"
                key={c}
                onClick={() => selectCategory(activeCategory === c ? null : c)}
                aria-pressed={activeCategory === c}
                aria-label={`Category: ${displayCategory(c)}`}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors ${activeCategory === c ? "bg-green-800 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
              >
                <span aria-hidden="true">{CAT_ICONS[c] ?? "•"}</span>
                {displayCategory(c)}
              </button>
            ))}
          </div>

          {/* Filter rail — strain pills, brand dropdown, sort dropdown.
              Always visible when ANY filter is active so the customer
              can see what they flipped + reset it (per UX_AUDIT_2026_05_03
              P1-3); otherwise hidden when ≤6 results render fine without it. */}
          {(filtered.length > 6 ||
            strainFilter ||
            brandFilter ||
            priceTier !== "all" ||
            thcTier !== "all" ||
            sortBy !== "default") && (
            <div className="flex flex-wrap items-center gap-2 mb-5 pb-4 border-b border-stone-100">
              {availableStrains.length > 1 && (
                <div className="flex gap-1.5">
                  {availableStrains.map((s) => {
                    const colors = STRAIN_COLORS[s];
                    const active = strainFilter === s;
                    return (
                      <button type="button"
                        key={s}
                        onClick={() => setStrainFilter(active ? null : s)}
                        aria-pressed={active}
                        // 44px tap target on mobile (Apple HIG) — visual stays
                        // py-1.5 on sm+ where pointer precision is fine. Mobile
                        // floor uses min-h-[44px] to clear the Fitts violation
                        // flagged in UX_AUDIT_2026_05_03 P0 #2.
                        className={`text-xs font-semibold px-3 py-1.5 min-h-[44px] sm:min-h-0 inline-flex items-center gap-1 rounded-full border transition-colors ${active ? `${colors?.badge ?? "bg-green-100 text-green-800 border-green-200"} ring-2 ring-offset-1 ring-stone-300` : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"}`}
                      >
                        {STRAIN_EMOJI[s] ? (
                          <span aria-hidden="true">{STRAIN_EMOJI[s]}</span>
                        ) : colors ? (
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                        ) : null}
                        {s}
                      </button>
                    );
                  })}
                </div>
              )}

              {availableBrands.length > 1 && (
                <select
                  value={brandFilter ?? ""}
                  onChange={(e) => setBrandFilter(e.target.value || null)}
                  aria-label="Filter by brand"
                  className="text-xs font-semibold px-3 py-1.5 min-h-[44px] sm:min-h-0 rounded-full border border-stone-200 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All brands ({availableBrands.length})</option>
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                aria-label="Sort products"
                className="text-xs font-semibold px-3 py-1.5 min-h-[44px] sm:min-h-0 rounded-full border border-stone-200 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-green-500 ml-auto"
              >
                <option value="default">Sort: Featured</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="thc-desc">THC %: High → Low</option>
                <option value="name">A → Z</option>
              </select>

              {/* Price tier — shown alongside the strain/brand pills.
                  Customers who shop on price look for the band first; they
                  scan the THC tier second once they've locked in the
                  number on the receipt. */}
              <div className="flex gap-1.5">
                {PRICE_TIERS.map((t) => {
                  const active = priceTier === t.key;
                  return (
                    <button type="button"
                      key={t.key}
                      onClick={() => setPriceTier(active ? "all" : t.key)}
                      aria-pressed={active}
                      aria-label={`Price tier: ${t.label}`}
                      className={`text-xs font-semibold px-3 py-1.5 min-h-[44px] sm:min-h-0 inline-flex items-center rounded-full border transition-colors ${active ? "bg-green-700 text-white border-green-700" : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"}`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* THC tier — only meaningful when products in view actually
                  carry a THC % (Flower / Pre-Rolls / Concentrates), but
                  rendering unconditionally keeps the rail layout stable
                  when the customer flips category. The filter is OR-style
                  with price and strain, so a "Flower · 20%+ · $15-30"
                  combination is the natural daily-driver search. */}
              <div className="flex gap-1.5">
                {THC_TIERS.map((t) => {
                  const active = thcTier === t.key;
                  return (
                    <button type="button"
                      key={t.key}
                      onClick={() => setThcTier(active ? "all" : t.key)}
                      aria-pressed={active}
                      aria-label={`THC tier: ${t.label}`}
                      // THC pill active = amber-600 (potency / "heat" semantic).
                      // Differentiates from price pill green-700 in the same row.
                      // Per UX_AUDIT_2026_05_03 P2-2.
                      className={`text-xs font-semibold px-3 py-1.5 min-h-[44px] sm:min-h-0 inline-flex items-center rounded-full border transition-colors ${active ? "bg-amber-600 text-white border-amber-600" : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"}`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {(strainFilter || brandFilter || priceTier !== "all" || thcTier !== "all" || sortBy !== "default") && (
                <button type="button"
                  onClick={() => {
                    setStrainFilter(null);
                    setBrandFilter(null);
                    setPriceTier("all");
                    setThcTier("all");
                    setSortBy("default");
                  }}
                  className="text-xs font-semibold text-stone-500 hover:text-stone-700 px-2 py-1.5 min-h-[44px] sm:min-h-0 inline-flex items-center"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Product grid by category */}
          <div className="space-y-12">
            {[...grouped.entries()].map(([category, items]) => {
              // All-Items view is a teaser strip — 6 cards per category, then
              // a "Show all N flower →" button that scopes the view to that
              // category and renders every match. The previous 24-per-category
              // cap was technically OK for HTML weight but produced a wall of
              // ~150 cards on the All-Items landing that scrolled too far
              // before the customer found anything. 6 is roughly one phone
              // screen per category — sample, tap, browse.
              //
              // When a category is selected or any filter (search/strain/
              // brand) is active, render every match (no cap).
              const isCapped = activeCategory === null && !search && !strainFilter && !brandFilter;
              const visibleItems = isCapped ? items.slice(0, 6) : items;
              const hiddenCount = items.length - visibleItems.length;
              return (
                <section key={category}>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-2xl" aria-hidden="true">{CAT_ICONS[category] ?? "🌱"}</span>
                    <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
                      {displayCategory(category)}
                    </h2>
                    <span className="text-xs font-medium text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                      {items.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                    {visibleItems
                      .filter((family) => family.members.length > 0)
                      .map((family) => {
                      // Size-picker MVP: each family card uses its
                      // currently-selected member (defaults to smallest size,
                      // changes when customer taps a size pill). Single-member
                      // families behave byte-identically to the pre-MVP shape.
                      const product = getSelectedMember(family);
                      const cartItem = cart.find((i) => i.id === product.id);
                      const strain = product.strainType ? STRAIN_COLORS[product.strainType] : null;
                      const parsed = parseProductName(product);
                      // "On Sale" chip surfaces when the product's category
                      // matches an active deal. We render it bottom-right —
                      // bottom-left is the weight chip, top-right is reserved
                      // for the New / cart-quantity badge, top-left is strain.
                      const deal = findDealForProduct(product, activeDeals);
                      return (
                        <div
                          key={family.familyKey}
                          className="group rounded-2xl border border-stone-100 bg-white overflow-hidden hover:border-green-300 hover:shadow-lg transition-all duration-200"
                        >
                          {/* Image */}
                          <div className="relative w-full h-44 overflow-hidden bg-stone-100">
                            <ProductImage
                              src={
                                product.imageUrl ??
                                matchProductPhoto(
                                  product.name,
                                  product.brand,
                                  product.category,
                                )
                              }
                              alt={product.name}
                              category={product.category}
                              brand={product.brand}
                              strainType={product.strainType}
                              thcPct={product.thcPct}
                              productName={product.name}
                            />
                            {deal && (
                              // %-off overlay top-left — iHeartJane-style
                              // conversion signal (Doug 2026-05-08: "put the
                              // % off overlay on top of the product that is
                              // on sale similar to iheartjane"). Replaces the
                              // bottom-right "On Sale" chip that sat near
                              // +Add and caused mistaps (UX_AUDIT_2026_05_03
                              // P1-4). Shows the actual %-off / $-off so the
                              // discount magnitude is visible at thumbnail
                              // scale, not buried in a "20% off flower"
                              // sentence. Strain chip displaces to bottom-
                              // right when a deal is present so corners stay
                              // non-overlapping.
                              <span
                                aria-label={`On sale: ${deal.short}`}
                                className="absolute top-2.5 left-2.5 inline-flex items-center text-xs px-2 py-1 rounded-md font-extrabold bg-red-600 text-white shadow-md uppercase tracking-wide pointer-events-none"
                              >
                                {deal.discountType === "percent" && deal.discountValue != null
                                  ? `${deal.discountValue}% OFF`
                                  : deal.discountType === "dollars" && deal.discountValue != null
                                  ? `$${deal.discountValue} OFF`
                                  : "SALE"}
                              </span>
                            )}
                            {strain && (
                              // v37.645: strain chip moved to bottom-right
                              // always (was conditionally top-left when no
                              // deal — would collide with the DOH chip when
                              // a DOH+strain card had no deal running). Top
                              // corners are reserved for higher-priority
                              // chips (deal + DOH on left, NEW/cart on
                              // right); strain is informational, fine on the
                              // bottom edge opposite the weight chip.
                              <span
                                className={`absolute bottom-2.5 right-2.5 text-xs px-2.5 py-1 rounded-full font-semibold border ${strain.badge}`}
                              >
                                <span
                                  className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${strain.dot}`}
                                />
                                {product.strainType}
                              </span>
                            )}
                            {parsed.weight && (
                              <span className="absolute bottom-2.5 left-2.5 text-[11px] px-2 py-0.5 rounded-full font-bold bg-white/90 text-stone-700 border border-stone-200 shadow-sm">
                                {parsed.weight}
                              </span>
                            )}
                            {product.isNew && (
                              <span className="absolute top-2.5 right-2.5 text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-700 text-white shadow-md uppercase tracking-wide">
                                New
                              </span>
                            )}
                            {cartItem && !product.isNew && (
                              <span className="absolute top-2.5 right-2.5 bg-green-700 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                                {cartItem.quantity}
                              </span>
                            )}
                            {/* DOH-compliant badge — left side so it doesn't
                                clash with NEW/cartItem on the right. Always
                                shown on DOH SKUs (informational); the
                                medical-no-tax price below appears only when
                                the signed-in customer is DOH-verified.
                                Fallback gate: WSLCB attaches "DOH " as a
                                category prefix on medical-endorsed SKUs (see
                                normalizer below at line ~482). Until the
                                `is_doh_compliant` boolean is backfilled on
                                every DOH SKU from the WSLCB GS1 mirror, the
                                category-prefix check renders the badge from
                                authoritative data already in the products
                                table. */}
                            {(product.isDohCompliant || /^DOH\s+/i.test(product.category ?? "") || /\bDOH\b/i.test(product.name ?? "")) && (
                              // v37.645: stacks UNDER the deal chip when a
                              // sale is running (top-12 ≈ 48px down) so top-
                              // left never piles two chips side-by-side.
                              // Alone in top-left when no deal. Medical-
                              // grade cross + caps "DOH" reads as clinical,
                              // not consumer-marketing — matches the
                              // regulatory weight (WSLCB extra-tested SKU,
                              // no excise tax for verified patients).
                              // Note: the full-fidelity WA-DOH logos do exist
                              // at `/public/doh-logos/{general-use,high-cbd,
                              // high-thc}.jpg` (used by `pickDohLogo()` in the
                              // pricing detail). They're intentionally NOT
                              // used here — at 10×10px the stylized cross
                              // reads cleaner than a downsized JPG would.
                              <span
                                className={`absolute ${deal ? "top-12" : "top-2.5"} left-2.5 inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md font-extrabold bg-purple-700 text-white shadow-md uppercase tracking-wider pointer-events-none`}
                                title="DOH-compliant — extra-tested medical SKU. No tax for verified patients."
                              >
                                <svg
                                  className="w-2.5 h-2.5"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z" />
                                </svg>
                                DOH
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-4 space-y-3">
                            {/* Customer Engagement Layer Ship 2 — Budtender's
                                Pick badge (top-row hierarchy per the badge
                                memo). Renders nothing when the product has no
                                active recommendation. Stacks ABOVE brand/name
                                so the pick is the first thing the customer
                                reads after the image overlay chips. */}
                            {productFlags && productFlags.get(product.id)?.isBudtenderPick && (
                              <div className="flex">
                                <BudtenderPickBadge flags={productFlags.get(product.id)} />
                              </div>
                            )}
                            <div>
                              {product.brand && (
                                <div className="text-xs text-stone-400 font-semibold uppercase tracking-widest mb-0.5">
                                  {product.brand}
                                </div>
                              )}
                              <div className="font-bold text-stone-900 text-sm leading-snug">
                                {parsed.name}
                              </div>
                            </div>

                            {/* Potency badges + Ship 2 "New this week" chip.
                                Spec says New goes BELOW the price, but visually
                                clustering it with the potency chips reads
                                cleaner — caller stays in control of placement
                                and we keep the chip at the data-density tier
                                appropriate to its weight (small, neutral). */}
                            {(product.thcPct != null || product.cbdPct != null || (productFlags && productFlags.get(product.id)?.newSince)) && (
                              <div className="flex flex-wrap gap-1.5">
                                {product.thcPct != null && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                                    THC {product.thcPct.toFixed(1)}%
                                  </span>
                                )}
                                {product.cbdPct != null && product.cbdPct > 0 && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                                    CBD {product.cbdPct.toFixed(1)}%
                                  </span>
                                )}
                                <NewThisWeekBadge flags={productFlags?.get(product.id)} />
                              </div>
                            )}

                            {/* Effects / terpenes */}
                            {product.effects && (
                              <p className="text-xs text-stone-400 leading-relaxed line-clamp-1">
                                <span aria-hidden="true">✨ </span>{product.effects}
                              </p>
                            )}

                            {/* Size pills — MVP size-picker (Doug 2026-06-01
                                ask). Shown only on multi-size families.
                                Tapping a pill swaps which family member's
                                price/THC/DOH info renders + which SKU adds
                                to cart. Single-size families skip this row
                                entirely (no regression on existing cards).
                                Mirrors iHJ Boost's "A-Bud (1G, 3.5G)"
                                inline picker UX. */}
                            {family.isMultiSize && (
                              <div
                                className="flex flex-wrap items-center gap-1.5 pt-1"
                                role="radiogroup"
                                aria-label="Select size"
                              >
                                <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mr-0.5">
                                  Size
                                </span>
                                {family.members.map((m) => {
                                  const isSelected = m.id === product.id;
                                  return (
                                    <button
                                      key={m.id}
                                      type="button"
                                      role="radio"
                                      aria-checked={isSelected}
                                      onClick={() => selectSize(family.familyKey, m.id)}
                                      className={
                                        "text-[11px] font-bold px-2 py-1 rounded-md border transition-colors min-h-[28px] " +
                                        (isSelected
                                          ? "bg-green-700 text-white border-green-700"
                                          : "bg-white text-stone-700 border-stone-200 hover:border-green-400 hover:text-green-700")
                                      }
                                    >
                                      {m._parsedSize.sizeLabel ?? "—"}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* Price + Add — Doug 2026-05-16: every online product
                                shows a strikethrough original + discounted price.
                                20% floor for online, daily deals push it bigger
                                (only the larger discount applies, no stacking).
                                See `lib/online-pricing.ts`. */}
                            <div className="flex items-center justify-between pt-1 border-t border-stone-50">
                              <div className="flex flex-col">
                                {(() => {
                                  const dohLogo = pickDohLogo(product);
                                  const pricing = effectivePriceFor(product, deal);
                                  if (pricing.displayPrice == null) return <span className="font-extrabold text-stone-900 text-base">—</span>;
                                  // DOH-verified medical patient on a DOH-compliant
                                  // SKU: state sales tax + 37% excise both exempt
                                  // (RCW 82.08.9998 + RCW 69.50.535(6)(a)). Strip
                                  // both off the post-online-discount price so the
                                  // online floor + the tax exemption stack.
                                  const showMedicalPrice =
                                    dohVerified && product.isDohCompliant;
                                  const medicalPrice = showMedicalPrice
                                    ? medicalNoTaxPrice(pricing.displayPrice)
                                    : null;
                                  if (showMedicalPrice && medicalPrice != null) {
                                    return (
                                      <>
                                        <span className="text-stone-400 line-through text-xs decoration-red-500 decoration-2">${pricing.originalPrice?.toFixed(2)}</span>
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-extrabold text-purple-900 text-base leading-tight">${medicalPrice.toFixed(2)}</span>
                                          <Image
                                            src={dohLogo.src}
                                            alt={dohLogo.label}
                                            title={`${dohLogo.label} — ${dohLogo.description}`}
                                            width={32}
                                            height={32}
                                            className="h-5 w-5 object-contain opacity-80"
                                            unoptimized
                                          />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 leading-none">
                                          <span aria-hidden="true">🟣 </span>Medical · no tax
                                        </span>
                                      </>
                                    );
                                  }
                                  return (
                                    <>
                                      <span className="text-stone-400 line-through text-xs decoration-red-500 decoration-2">${pricing.originalPrice?.toFixed(2)}</span>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-extrabold text-stone-900 text-base leading-tight">${pricing.displayPrice.toFixed(2)}</span>
                                        <Image
                                          src={dohLogo.src}
                                          alt={dohLogo.label}
                                          title={`${dohLogo.label} — ${dohLogo.description}`}
                                          width={32}
                                          height={32}
                                          className="h-5 w-5 object-contain opacity-80"
                                          unoptimized
                                        />
                                      </div>
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 leading-none">
                                        {pricing.dealName ? `${Math.round(pricing.discountPct)}% off · ${pricing.dealName}` : `${ONLINE_DISCOUNT_PCT}% off online`}
                                      </span>
                                    </>
                                  );
                                })()}
                              </div>
                              {cartItem ? (
                                <div className="flex items-center gap-2">
                                  <button type="button"
                                    onClick={() => updateQty(product.id, -1)}
                                    aria-label={`Decrease quantity of ${parsed.name}`}
                                    // 44×44 (Apple HIG floor) — was w-8 h-8 (32px),
                                    // flagged P0 #2 in UX_AUDIT_2026_05_03 for
                                    // mistap risk on the adjacent price chip.
                                    className="w-11 h-11 rounded-full border-2 border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 hover:border-stone-300 text-base font-bold transition-colors"
                                  >
                                    −
                                  </button>
                                  <span className="w-6 text-center text-sm font-extrabold text-stone-900">
                                    {cartItem.quantity}
                                  </span>
                                  <button type="button"
                                    onClick={() => updateQty(product.id, 1)}
                                    aria-label={`Increase quantity of ${parsed.name}`}
                                    className="w-11 h-11 rounded-full bg-green-700 flex items-center justify-center text-white hover:bg-green-600 text-base font-bold transition-colors shadow-md shadow-green-900/20"
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <button type="button"
                                  onClick={() => addToCart(product, deal)}
                                  disabled={product.unitPrice == null || closure.isClosed}
                                  aria-label={closure.isClosed ? `${parsed.name} — store closed today, can't add to cart` : `Add ${parsed.name} to cart`}
                                  title={closure.isClosed ? "We're closed today — online orders paused" : undefined}
                                  // min-h-[44px] floor (Apple HIG) — visually
                                  // unchanged on desktop where px-4 py-2 already
                                  // hits ~36px and pointer precision is fine.
                                  // Closure-disabled: gives the customer
                                  // honest signal that add-to-cart is paused,
                                  // instead of letting them cart up and fail
                                  // at submit. Per MENU_PREVIEW_DIAL_IN_AUDIT §3.
                                  className="flex items-center gap-1.5 px-4 py-2 min-h-[44px] sm:min-h-0 rounded-xl bg-green-700 hover:bg-green-600 active:bg-green-800 text-white text-xs font-bold transition-all shadow-md shadow-green-900/20 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 disabled:hover:translate-y-0"
                                >
                                  {closure.isClosed ? "Closed today" : "+ Add"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {hiddenCount > 0 && (
                    <button type="button"
                      onClick={() => selectCategory(category)}
                      className="mt-5 w-full text-center text-sm font-bold text-green-700 hover:text-green-600 py-3 rounded-xl border border-stone-100 hover:border-green-200 hover:bg-green-50/50 transition-colors"
                    >
                      Show all {items.length} {displayCategory(category).toLowerCase()} →
                    </button>
                  )}
                </section>
              );
            })}
          </div>

          {filtered.length === 0 && (
            // v37.645: empty state now offers concrete next steps instead
            // of just "clear filters." When the filters were the cause,
            // surface the top-4 categories as one-tap recovery buttons
            // so the user can pivot rather than feeling stuck. Search
            // misses get a different recovery path (clear search +
            // suggestion to phone the store).
            <div className="py-16 text-center space-y-4">
              <div className="text-4xl" aria-hidden>🔍</div>
              <p className="text-stone-600 font-semibold text-base">
                {search ? (
                  <>No products match &ldquo;{search}&rdquo;</>
                ) : (
                  <>No products match those filters</>
                )}
              </p>
              <p className="text-stone-500 text-sm max-w-md mx-auto">
                {search ? (
                  <>
                    Try a shorter search or pick a category below. Or call — a budtender can check the back:{" "}
                    <a href={`tel:${STORE.phoneTel}`} className="text-green-700 font-semibold">
                      {STORE.phone}
                    </a>
                  </>
                ) : (
                  "Some combinations are stricter than what's on the shelf today. Reset or pivot to a category below."
                )}
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {search && (
                  <button type="button"
                    onClick={() => setSearch("")}
                    className="text-sm text-white bg-green-700 hover:bg-green-600 font-semibold py-2 px-4 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 transition-colors"
                  >
                    Clear search
                  </button>
                )}
                {(strainFilter || brandFilter || priceTier !== "all" || thcTier !== "all" || sortBy !== "default") && (
                  <button type="button"
                    onClick={() => {
                      setStrainFilter(null);
                      setBrandFilter(null);
                      setPriceTier("all");
                      setThcTier("all");
                      setSortBy("default");
                    }}
                    className="text-sm text-white bg-green-700 hover:bg-green-600 font-semibold py-2 px-4 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 transition-colors"
                  >
                    Reset filters
                  </button>
                )}
              </div>
              {/* Category pivot — only render top-4 categories with stock so
                  the user can fall sideways into something that exists on
                  the shelf today instead of just reset-and-retry. */}
              {categories.length > 0 && (
                <div className="pt-3">
                  <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-2">
                    Or browse a category
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {categories.slice(0, 4).map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => {
                          setStrainFilter(null);
                          setBrandFilter(null);
                          setPriceTier("all");
                          setThcTier("all");
                          setSortBy("default");
                          setSearch("");
                          selectCategory(c);
                        }}
                        className="inline-flex items-center gap-1.5 text-sm text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 hover:border-green-300 font-semibold py-2 px-4 rounded-full transition-colors"
                      >
                        <span aria-hidden="true">{CAT_ICONS[c] ?? "🌱"}</span>
                        {displayCategory(c)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Below-the-grid trust + education ──────────────────────────────
          The grid above is "what's available." This strip is "what to expect
          + how to read it." Lives below so it doesn't compete with shopping
          intent but catches the curious-but-uncertain customer who scrolls
          past the grid looking for context. WAC 314-55-155 safe — these are
          process explainers + glossary, not efficacy claims. */}

      {/* How pickup works — three-step explainer for customers new to the
          flow. Online ordering is still novel for the cannabis aisle in
          Wenatchee; people land here unsure if "online" means "delivered". */}
      <section className="mt-16 pt-10 border-t border-stone-200">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400 text-center mb-2">
          How pickup works
        </p>
        <h2 className="text-2xl font-extrabold text-stone-900 text-center tracking-tight mb-8">
          From cart to counter in three steps.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-full bg-green-100 text-green-800 font-extrabold text-sm flex items-center justify-center">
                1
              </span>
              <div className="text-sm font-bold text-stone-900">Build your cart</div>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Add products, pick a 15-min pickup window. Online orders open from open until 15 min before
              close — staff need that buffer to pull and stage.
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-full bg-green-100 text-green-800 font-extrabold text-sm flex items-center justify-center">
                2
              </span>
              <div className="text-sm font-bold text-stone-900">Sign in &amp; submit</div>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Quick account so we can find your order and ring it through with your loyalty points. Your cart
              stays put while you sign in.
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-full bg-green-100 text-green-800 font-extrabold text-sm flex items-center justify-center">
                3
              </span>
              <div className="text-sm font-bold text-stone-900">Pick up &amp; pay cash</div>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Drive in, show your 21+ ID, pay cash at the counter. ATM on-site. Usually out the door in under
              5 min once you walk in.
            </p>
          </div>
        </div>
      </section>

      {/* Mini-FAQ — answers the questions our budtenders hear most. WAC-safe
          (informational, not therapeutic). Lives in plain copy not <details>
          on purpose — short answers, scannable, no clicks-to-read. */}
      <section className="mt-12 max-w-3xl mx-auto">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400 text-center mb-2">
          Quick reference
        </p>
        <h2 className="text-2xl font-extrabold text-stone-900 text-center tracking-tight mb-6">
          New to the menu? Here&apos;s the short version.
        </h2>
        <div className="space-y-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-sm font-bold text-stone-900 mb-1">Sativa, indica, hybrid — what&apos;s the difference?</p>
            <p className="text-xs text-stone-600 leading-relaxed">
              Rough rule the budtenders use: sativa skews head-forward, indica skews body-forward, hybrid
              splits the difference. Real life is messier — terpene profile and dose matter just as much.
              Filter by strain type to narrow, then ask us when you walk in.
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-sm font-bold text-stone-900 mb-1">What does the THC % actually mean?</p>
            <p className="text-xs text-stone-600 leading-relaxed">
              It&apos;s the lab-tested cannabinoid content of the flower or product. Higher isn&apos;t
              automatically better — the 15–20% band is plenty for most folks. New to it? Start lower and
              work up. Tolerance comes back faster than you&apos;d think.
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-sm font-bold text-stone-900 mb-1">Why cash only?</p>
            <p className="text-xs text-stone-600 leading-relaxed">
              Federal banking rules around cannabis are still cleaning up — most WA shops are cash. We have
              an ATM on-site if you forget.
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-sm font-bold text-stone-900 mb-1">Can I change my order after I submit?</p>
            <p className="text-xs text-stone-600 leading-relaxed">
              Call us — {STORE.phone}. As long as we haven&apos;t pulled it yet we can swap things out. If
              we already pulled it, easiest is to just tell the budtender at the counter what you&apos;d like
              to switch.
            </p>
          </div>
        </div>
      </section>

      {/* Crew + walk-in CTA — closing strip so the menu doesn't end with a
          pile of products and nothing else. Best-staff framing per Doug
          2026-05-02. Names + role chips pull from `lib/team.ts` so this row
          stays in sync with /our-story rather than drifting into fake
          budtender names. We feature the customer-facing managers (GM +
          Asst Mgr) — they're the constant the regulars know. Owner row in
          team.ts deliberately filtered out so the chips stay "people you'll
          actually see at the counter". */}
      <section className="mt-12 max-w-3xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white p-6 sm:p-8 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: "radial-gradient(circle at 80% 20%, #4ade80, transparent 40%)",
            }}
          />
          <div className="relative">
            <p className="text-green-300 text-xs font-bold uppercase tracking-widest mb-2">
              Stuck? Walk in.
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              The best crew in Wenatchee.
            </h2>
            <p className="text-green-100/85 text-sm leading-relaxed mb-4 max-w-xl">
              The menu is a starting point. Tell us what you liked, what you didn&apos;t, what
              you&apos;re trying to do tonight — we&apos;ll dial it from there.
            </p>
            {/* Named-crew chips — currents-only, owner deliberately excluded so
                customers see the floor-runners they'll actually meet at the
                counter. Photo placeholder uses initials when team.ts photoSrc
                is null (today: all three current entries are placeholderless). */}
            {(() => {
              const featured = CURRENT_TEAM.filter((m) => m.role !== "Owner").slice(0, 3);
              if (featured.length === 0) return null;
              return (
                <div className="mb-5 flex flex-wrap gap-2.5">
                  {featured.map((m) => (
                    <div
                      key={m.name}
                      className="inline-flex items-center gap-2 rounded-2xl bg-white/10 border border-white/15 px-3 py-1.5"
                    >
                      {m.photoSrc ? (
                        <Image
                          src={m.photoSrc}
                          alt=""
                          aria-hidden
                          width={28}
                          height={28}
                          className="w-7 h-7 rounded-full object-cover border border-white/25"
                        />
                      ) : (
                        <span
                          aria-hidden
                          className="w-7 h-7 rounded-full bg-emerald-700/70 flex items-center justify-center text-white text-xs font-extrabold tracking-tight"
                        >
                          {initialOf(m.name)}
                        </span>
                      )}
                      <span className="leading-tight">
                        <span className="block text-sm font-bold text-white">{m.name}</span>
                        <span className="block text-[11px] text-green-200/85 font-medium">{m.role}</span>
                      </span>
                    </div>
                  ))}
                </div>
              );
            })()}
            <div className="flex flex-wrap gap-2.5">
              <Link
                href={withAttr("/visit", "order", "bottom-visit")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-green-900 text-sm font-bold hover:bg-green-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-green-900"
              >
                <span aria-hidden="true">📍 </span>Visit us
              </Link>
              {/* tel: links are no-op'd by withAttr (cookie carries the
                  breadcrumb on return visits anyway) — kept call-through in
                  voice with the rest of the row but skipping the wrap. */}
              <a
                href={`tel:${STORE.phoneTel}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold border border-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-green-900"
              >
                <span aria-hidden="true">📞 </span>{STORE.phone}
              </a>
              <Link
                href={withAttr("/find-your-strain", "order", "bottom-quiz")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold border border-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-green-900"
              >
                <span aria-hidden="true">🌿 </span>Take the strain quiz
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Floating cart bar ─────────────────────────────────────────────── */}
      {cartCount > 0 && (
        <div
          className="fixed left-0 right-0 px-4 z-40 animate-slide-up motion-reduce:animate-none"
          style={{ bottom: "max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))" }}
          role="region"
          aria-label="Cart summary and checkout"
        >
          <div className="max-w-lg mx-auto">
            {cartOpen ? (
              <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden animate-pop">
                {/* Cart header */}
                <div className="px-5 py-4 bg-gradient-to-r from-green-900 to-green-800 text-white flex items-center justify-between">
                  <span className="font-bold text-base">
                    Your Order · {cartCount} {cartCount === 1 ? "item" : "items"}
                  </span>
                  <button type="button"
                    onClick={() => {
                      setCartOpen(false);
                      setOrderError(null);
                    }}
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg leading-none transition-colors"
                  >
                    ×
                  </button>
                </div>

                {/* Stale-cart banner — fires when a saved cart is >48h old +
                 * not yet dismissed in this session. Customer reads "you left
                 * this here a while ago" + can clear in one tap. (P1-2.) */}
                {!staleCartDismissed &&
                  cartSavedAt != null &&
                  (() => {
                    // eslint-disable-next-line react-hooks/purity -- Stale-cart age check; only renders inside the cart drawer for >48h-old saved carts so render frequency is low. Centralized here to avoid 2 separate impure-call disables.
                    const nowMs = Date.now();
                    const ageMs = nowMs - cartSavedAt;
                    if (ageMs <= STALE_CART_THRESHOLD_MS) return null;
                    const days = Math.floor(ageMs / DAY_MS);
                    return (
                    <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-3">
                      <p className="text-xs text-amber-900 leading-snug">
                        Your cart from {days} days ago is still here — start fresh?
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <button type="button"
                          onClick={() => {
                            setCart([]);
                            setStaleCartDismissed(true);
                          }}
                          className="text-[11px] font-bold px-2.5 py-1 rounded border border-amber-700 bg-amber-700 text-white hover:bg-amber-800"
                        >
                          Clear
                        </button>
                        <button type="button"
                          onClick={() => setStaleCartDismissed(true)}
                          className="text-[11px] font-medium text-amber-800 hover:text-amber-900"
                        >
                          Keep
                        </button>
                      </div>
                    </div>
                  );
                })()}
                {/* Items */}
                <div className="p-4 space-y-2 max-h-52 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-stone-50 rounded-xl px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-stone-700 truncate">{item.name}</div>
                        {item.brand && <div className="text-xs text-stone-400 truncate">{item.brand}</div>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button type="button"
                          onClick={() => updateQty(item.id, -1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          // 44×44 (Apple HIG) — was 32px, P0 #2 in
                          // UX_AUDIT_2026_05_03. Cart-drawer rows sit close
                          // together so the bigger hit area also reduces
                          // mistap onto the row above/below.
                          className="w-11 h-11 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-200 active:bg-stone-300 text-base font-bold transition-colors"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-extrabold text-stone-900 text-sm tabular-nums">
                          {item.quantity}
                        </span>
                        <button type="button"
                          onClick={() => updateQty(item.id, 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="w-11 h-11 rounded-full bg-green-700 flex items-center justify-center text-white hover:bg-green-600 active:bg-green-800 text-base font-bold transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-bold text-stone-700 w-16 text-right shrink-0 tabular-nums">
                        ${((item.unitPrice ?? 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 pb-4 space-y-3">
                  {/* Pickup time picker */}
                  {orderingStatus?.state === "open" && pickupSlots.length > 0 && (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="pickup-time"
                        className="block text-xs font-bold text-stone-700 uppercase tracking-wide"
                      >
                        Pick up at
                      </label>
                      <select
                        id="pickup-time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        {pickupSlots.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-stone-400">
                        Earliest slot is 30 min from now. Last call is 15 min before close.
                      </p>
                    </div>
                  )}
                  {orderingStatus && orderingStatus.state !== "open" && (
                    <div className="px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium space-y-0.5">
                      <p className="font-bold">Online ordering is closed right now.</p>
                      {orderingStatus.state === "before_open" && (
                        <p>Opens at {orderingStatus.opensAt} today.</p>
                      )}
                      {orderingStatus.state === "after_last_call" && (
                        <p>
                          Last call is 15 min before close ({orderingStatus.closesToday}). Reopens at{" "}
                          {orderingStatus.reopensAt}.
                        </p>
                      )}
                      {orderingStatus.state === "closed_today" && <p>Reopens at {orderingStatus.opensAt}.</p>}
                    </div>
                  )}

                  <textarea
                    placeholder="Special requests or notes…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    maxLength={2000}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 bg-stone-50"
                  />
                  {orderError && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {orderError}
                    </div>
                  )}
                  {/* Loyalty tier picker — shown when feature flag is ON, customer is signed in,
                      and at least one tier is eligible at the current cart total. */}
                  {signedIn && eligibleTiers.length > 0 && (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-green-800">Redeem Points</span>
                        <span className="text-xs text-green-700">{initialLoyalty!.points} pts available</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedTierPointCost(null)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                            selectedTierPointCost === null
                              ? "bg-green-700 text-white border-green-700"
                              : "bg-white text-stone-600 border-stone-200 hover:border-green-400"
                          }`}
                        >
                          No discount
                        </button>
                        {eligibleTiers.map((tier) => (
                          <button
                            type="button"
                            key={tier.pointCost}
                            onClick={() => setSelectedTierPointCost(tier.pointCost)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                              selectedTierPointCost === tier.pointCost
                                ? "bg-green-700 text-white border-green-700"
                                : "bg-white text-stone-600 border-stone-200 hover:border-green-400"
                            }`}
                          >
                            {tier.label} · {tier.pointCost} pts
                          </button>
                        ))}
                      </div>
                      {appliedDiscount != null && (
                        <p className="text-xs text-green-700 font-medium">
                          −${appliedDiscount.discountDollars.toFixed(2)} off · {selectedTierPointCost} pts used
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-stone-400">Est. total · cash in store</div>
                      {appliedDiscount != null ? (
                        <>
                          <div className="text-sm text-stone-400 line-through">${cartTotal.toFixed(2)}</div>
                          <div className="text-2xl font-extrabold text-green-700">${appliedDiscount.netSubtotal.toFixed(2)}</div>
                        </>
                      ) : (
                        <div className="text-2xl font-extrabold text-stone-900">${cartTotal.toFixed(2)}</div>
                      )}
                    </div>
                    {/* Button label flips for unsigned customers so they
                        see the sign-in detour BEFORE they tap, not after.
                        UX_AUDIT_2026_05_03 P0 #3: Nielsen #1 (visibility of
                        system status).
                        2026-05-28: when NOT signedIn, route directly to
                        /sign-in instead of POSTing /api/orders + relying on
                        the 401 → sign-in redirect path. Reason: Clerk
                        middleware can intercept /api/orders for an unauth'd
                        request and return its own HTML/redirect response
                        BEFORE the route handler can return clean 401-JSON.
                        Client then fails to parse JSON + falls through to
                        "Couldn't place your order — try again" generic
                        fallback. Lived 2026-05-27 — Austin pre-launch test
                        surfaced the confusing error. Sister-ported byte-
                        identical from SCC. Pin:
                        feedback_scc_customer_checkout_pre_launch_findings_2026_05_27. */}
                    <button type="button"
                      onClick={signedIn
                        ? placeOrder
                        : () => router.push(`/sign-in?redirect_url=${encodeURIComponent("/order?cart=open")}`)}
                      disabled={placing || orderingStatus?.state !== "open" || (signedIn && !pickupTime) || closure.isClosed}
                      className="px-6 py-3 min-h-[44px] rounded-2xl bg-green-700 hover:bg-green-600 active:bg-green-800 text-white font-bold text-sm transition-all shadow-lg shadow-green-900/30 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
                    >
                      {placing
                        ? "Placing…"
                        : closure.isClosed
                          ? "Closed today"
                          : signedIn
                            ? "Place Order →"
                            : "Sign in to place order →"}
                    </button>
                  </div>
                  {!signedIn && (
                    // Replaces the old "Quick sign-in required" yellow callout
                    // (which was below the CTA, telling people the same thing
                    // the button now says). Kept the saved-cart reassurance —
                    // that's the actual new information for the customer.
                    <p className="text-[11px] text-stone-500 text-right px-1">
                      We&apos;ll save your cart while you sign in.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <button type="button"
                onClick={() => {
                  setCartOpen(true);
                  setOrderError(null);
                }}
                aria-label={`View order — ${cartCount} ${cartCount === 1 ? "item" : "items"}, $${cartTotal.toFixed(2)}`}
                className="w-full bg-gradient-to-r from-green-900 to-green-800 hover:from-green-800 hover:to-green-700 text-white rounded-3xl py-4 px-5 flex items-center justify-between shadow-2xl transition-all hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2"
              >
                <div className="flex items-center gap-3">
                  <span className="bg-green-500 text-white text-xs font-extrabold w-7 h-7 rounded-full flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                  <span className="font-bold">View Order</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg">${cartTotal.toFixed(2)}</span>
                  <svg
                    className="w-4 h-4 opacity-70"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
      {/* Keyboard-shortcuts overlay (UX_AUDIT P2-6). Customer presses `?`
       * to see all bindings. Click backdrop or press Esc to dismiss. */}
      {shortcutsOpen && (
        <div
          onClick={() => setShortcutsOpen(false)}
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 animate-pop"
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-sm w-full px-6 py-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-stone-900">Keyboard shortcuts</h2>
              <button type="button"
                onClick={() => setShortcutsOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 text-lg leading-none"
                aria-label="Close shortcuts"
              >
                ×
              </button>
            </div>
            <ul className="space-y-2 text-sm text-stone-700">
              <li className="flex items-center justify-between">
                <span>Open this overlay</span>
                <kbd className="font-mono text-xs bg-stone-100 border border-stone-300 rounded px-2 py-0.5">?</kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Toggle cart</span>
                <kbd className="font-mono text-xs bg-stone-100 border border-stone-300 rounded px-2 py-0.5">C</kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Close cart / overlay</span>
                <kbd className="font-mono text-xs bg-stone-100 border border-stone-300 rounded px-2 py-0.5">Esc</kbd>
              </li>
            </ul>
            <p className="text-[11px] text-stone-500 mt-4">
              Shortcuts skip while you&apos;re typing in the search bar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
