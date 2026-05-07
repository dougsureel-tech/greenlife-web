import Link from "next/link";
import Image from "next/image";
import type { DealVendorMatch } from "@/lib/deal-vendor-match";

// Per-category palette for the bud-art gradient when no vendor matches.
// Same color families the homepage hero uses, so /deals reads as part of
// the same surface. accentHex / accent2Hex are kept in sync with the
// vendor-match module so the gradient code path is uniform.
type CategoryArt = {
  emoji: string;
  accentHex: string;
  accent2Hex: string;
  /** Visible chip text in the category corner. */
  label: string;
};

const CATEGORY_ART: Record<string, CategoryArt> = {
  flower: { emoji: "🌿", accentHex: "1f3a2b", accent2Hex: "0a1810", label: "Flower" },
  edibles: { emoji: "🍬", accentHex: "8a1f4a", accent2Hex: "3a0e1f", label: "Edibles" },
  vapes: { emoji: "💨", accentHex: "1f3a6e", accent2Hex: "0e1d3a", label: "Vapes" },
  concentrates: { emoji: "💎", accentHex: "4a1f6e", accent2Hex: "200e3a", label: "Concentrates" },
  "pre-rolls": { emoji: "🫙", accentHex: "6e4a1f", accent2Hex: "3a200e", label: "Pre-Rolls" },
  prerolls: { emoji: "🫙", accentHex: "6e4a1f", accent2Hex: "3a200e", label: "Pre-Rolls" },
  tinctures: { emoji: "💧", accentHex: "0e6e6a", accent2Hex: "063838", label: "Tinctures" },
  topicals: { emoji: "🧴", accentHex: "3a6e1f", accent2Hex: "1d3a0e", label: "Topicals" },
  beverages: { emoji: "🥤", accentHex: "8a4a1f", accent2Hex: "3a200e", label: "Beverages" },
  all: { emoji: "🎟️", accentHex: "1f3a2b", accent2Hex: "0a1810", label: "Storewide" },
};

function categoryArtFor(appliesTo: string | null | undefined): CategoryArt {
  const key = (appliesTo ?? "all").toLowerCase().trim();
  return CATEGORY_ART[key] ?? CATEGORY_ART.all;
}

type DealArtProps = {
  vendor: DealVendorMatch | null;
  appliesTo: string | null;
  /** "20% off flower" — rendered as the giant percent-off readout. */
  short: string;
  /** Brand-page link prefix — `/brands` for both stores. */
  brandHref?: string;
  /** Default green-700 for Wenatchee, indigo-700 for Seattle. */
  paletteAccent?: "green" | "indigo";
};

/**
 * Wide hero strip for each /deals card. Layered:
 *   1. Background image (vendor bud-photo OR category gradient base)
 *   2. Dark gradient overlay so foreground stays legible
 *   3. Brand-color radial glow for visual punch
 *   4. Foreground: vendor logo card (left) + giant short label (right) + corner badges
 *
 * Renders gracefully without next/image when the vendor's hero CDN is
 * unavailable — the gradient + dotted noise carry the design alone.
 */
export function DealArt({
  vendor,
  appliesTo,
  short,
  brandHref = "/brands",
  paletteAccent = "green",
}: DealArtProps) {
  const cat = categoryArtFor(appliesTo);
  const accent = vendor?.accentHex ?? cat.accentHex;
  const accent2 = vendor?.accent2Hex ?? cat.accent2Hex;
  const heroUrl = vendor?.heroUrl ?? null;

  // Glow color for the giant short readout — keeps it tied to the
  // store's primary palette (green for Wenatchee, indigo for Seattle)
  // rather than the vendor's accent, so the percent-off readout stays
  // consistent across cards and feels like a Green Life voice.
  const ctaGlow = paletteAccent === "indigo" ? "#818cf8" : "#4ade80";

  return (
    <div
      className="relative h-44 sm:h-52 overflow-hidden rounded-t-2xl"
      style={{
        background: `linear-gradient(135deg, #${accent} 0%, #${accent2} 100%)`,
      }}
    >
      {/* Layer 1 — vendor bud photo, when we have one. Crops/cover-fit so
          flower beauty shots fill the strip; opacity=40 keeps fg readable.
          unoptimized=true because next/image's optimizer can choke on
          some brand CDNs (auth headers, region locks); the wide
          remotePatterns:** in next.config.ts already permits the host. */}
      {heroUrl && (
        <Image
          src={heroUrl}
          alt=""
          fill
          unoptimized
          aria-hidden
          className="object-cover opacity-40 mix-blend-luminosity"
          sizes="(min-width: 768px) 768px, 100vw"
        />
      )}

      {/* Layer 2 — diagonal darken so the right-side readout has contrast
          even when the underlying photo is pale. Stronger on the right
          where the giant short text sits. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.20) 35%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Layer 3 — brand-color radial glow + dotted noise for texture
          (mirrors the homepage hero). */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div
        aria-hidden
        className="absolute -top-1/2 -right-1/4 w-[400px] h-[400px] pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${ctaGlow}33, transparent 65%)`,
        }}
      />

      {/* Layer 4a — top-left badges. Vendor pill takes priority; falls
          back to category label when no vendor matched. */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-3 pointer-events-none">
        {vendor ? (
          <Link
            href={`${brandHref}/${vendor.slug}`}
            className="pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/25 transition-colors"
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: ctaGlow, boxShadow: `0 0 6px ${ctaGlow}` }}
              aria-hidden
            />
            Dialed-in vendor
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white text-[10px] font-bold uppercase tracking-widest">
            <span aria-hidden className="text-sm leading-none">
              {cat.emoji}
            </span>
            {cat.label}
          </span>
        )}
      </div>

      {/* Layer 4b — main content row: logo card (left) or giant emoji,
          giant short readout (right). */}
      <div className="absolute inset-0 flex items-end gap-4 p-4 sm:p-5">
        {vendor?.logoUrl ? (
          <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white shadow-2xl flex items-center justify-center p-3 relative">
            <Image
              src={vendor.logoUrl}
              alt={`${vendor.displayName} logo`}
              fill
              unoptimized
              className="object-contain p-3"
              sizes="96px"
            />
          </div>
        ) : vendor ? (
          // Vendor matched but no logo URL — show wordmark in a card so the
          // geometry stays consistent with the logo case.
          <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/95 shadow-2xl flex items-center justify-center px-2 text-center">
            <span
              className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider leading-tight"
              style={{ color: `#${vendor.accentHex}` }}
            >
              {vendor.displayName}
            </span>
          </div>
        ) : (
          <div
            aria-hidden
            className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-5xl sm:text-6xl"
          >
            {cat.emoji}
          </div>
        )}

        <div className="flex-1 min-w-0 text-right">
          <div
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-none tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
            style={{ fontFeatureSettings: '"tnum"' }}
          >
            {short}
          </div>
          {vendor && (
            <div className="text-white/70 text-[11px] sm:text-xs font-semibold uppercase tracking-widest mt-1.5">
              {vendor.displayName}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
