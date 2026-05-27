// Product + AggregateOffer JSON-LD for /strains/[slug] — Tech-SEO win #1
// per SEO_AUDIT_AUTONOMOUS_WINS_2026_05_26.md.
//
// Unlocks Google Product rich-results eligibility for long-tail queries
// like "Blue Dream price Wenatchee" and "GSC in stock <town>". Mirrors
// the brand-detail Product-shape pattern in app/brands/[slug]/page.tsx
// but at strain-not-SKU granularity:
//   - `Product` for the strain itself
//   - `AggregateOffer` summarizing live-inventory SKUs (omitted when 0)
//   - `additionalProperty` for THC% / CBD% from the strain's verified ranges
//   - sibling `BreadcrumbList` so the parent page can emit both
//
// WSLCB compliance (WAC 314-55-155):
//   - The Product `description` MUST NOT carry efficacy / medical claims.
//     Strain copy is curated, but defense-in-depth: every emitted string
//     passes through `scrubWslcbClaims` which strips a known banned-phrase
//     list. Empty fields beat non-compliant fields.
//   - NO aggregateRating (no UGC reviews) until Doug greenlights review
//     intake compliance audit.
//   - NO dosing instructions; NO health benefits.
//
// Sister-mirror: seattle-cannabis-web/lib/strain-product-json-ld.ts.
// Keep in sync.

import type { Strain } from "./strains";
import type { MenuProduct } from "./db";

/** Mapped Schema.org Product `category` values — factual product
 *  taxonomies, not claims. Anything outside this list = OMIT category. */
export type StrainProductCategory =
  | "Cannabis Flower"
  | "Cannabis Edible"
  | "Cannabis Concentrate";

/** Banned-phrase regex list — efficacy / medical / dosing language that
 *  CANNOT appear in WSLCB-regulated cannabis-retail marketing surfaces.
 *  Case-insensitive whole-phrase matches. Defensively wide; we'd rather
 *  strip a legitimate adjacent word than leak a violation. */
const WSLCB_BANNED_PHRASES: readonly RegExp[] = [
  /\btreats?\b/gi,
  /\btreating\b/gi,
  /\bcures?\b/gi,
  /\bcuring\b/gi,
  /\brelieves?\b/gi,
  /\brelieving\b/gi,
  /\brelief\b/gi,
  /\bhealing\b/gi,
  /\bheals?\b/gi,
  /\bmedical\b/gi,
  /\bmedicine\b/gi,
  /\bmedicinal\b/gi,
  /\bremedy\b/gi,
  /\bremedies\b/gi,
  /\bhelps with\b/gi,
  /\bhelp with\b/gi,
  /\balleviates?\b/gi,
  /\balleviating\b/gi,
  /\btherap(?:y|eutic|ies)\b/gi,
  /\bdoctor\b/gi,
  /\bprescri(?:be|ption|bed)\b/gi,
  /\bdose\b/gi,
  /\bdoses\b/gi,
  /\bdosing\b/gi,
  /\bdosage\b/gi,
  /\bfda\b/gi,
];

/** Strip WSLCB-non-compliant words from `input`. Collapses whitespace and
 *  trims so callers don't ship strings like "Bright sativa daytime".
 *  Returns null if scrubbed string is empty / whitespace-only (caller
 *  should OMIT the field rather than emit "" — empty fields are safer
 *  than non-compliant fields). */
export function scrubWslcbClaims(input: string | null | undefined): string | null {
  if (!input) return null;
  let out = input;
  for (const re of WSLCB_BANNED_PHRASES) {
    out = out.replace(re, "");
  }
  // Collapse whitespace + tidy comma/period artifacts left after word removal.
  out = out
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/([(,;])\s+([.,;:)])/g, "$1$2")
    .replace(/\s{2,}/g, " ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\(\s*\)/g, "")
    .replace(/\s+,/g, ",")
    .replace(/,(?=\S)/g, ", ")
    .trim();
  return out.length === 0 ? null : out;
}

/** Map strain.category-style hints to a Schema.org-friendly enum. The
 *  /strains/[slug] page is per-strain (not per-SKU). Derivation order:
 *  1. `strain.type` ∈ {sativa, indica, hybrid} — the strain is
 *     definitionally FLOWER; that's the canonical signal. We do NOT let
 *     matched-product cross-format derivatives (e.g. a "Blue Dream" vape
 *     cart hitting the strain-name match) override the strain's own form.
 *     Pre-fix the live `/strains/blue-dream` page rendered
 *     `"category":"Cannabis Concentrate"` because matchedProducts
 *     happened to be majority-cart/concentrate.
 *  2. Otherwise, tally `matchedProducts` and pick the dominant category.
 *  3. Final fallback: "Cannabis Flower" — the WA-cannabis baseline
 *     category (most strains are flower). */
export function strainCategory(
  matchedProducts: ReadonlyArray<Pick<MenuProduct, "category">>,
  strain?: Pick<Strain, "type">,
): StrainProductCategory {
  // Tier 1 — strain.type is the canonical form signal. sativa / indica /
  // hybrid all mean FLOWER on the cannabis-strain taxonomy. (cbd-strains
  // can also be flower; current Strain.type union covers the 3 flower
  // psychotypes — extend here if the type union grows to include
  // edible/concentrate-native taxonomies.)
  if (strain) {
    if (strain.type === "sativa" || strain.type === "indica" || strain.type === "hybrid") {
      return "Cannabis Flower";
    }
  }

  // Tier 2 — tally categories across matched products; pick the dominant.
  const counts: Record<string, number> = {};
  for (const p of matchedProducts) {
    if (!p.category) continue;
    counts[p.category] = (counts[p.category] ?? 0) + 1;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  const lower = top.toLowerCase();
  if (lower.includes("edible")) return "Cannabis Edible";
  if (
    lower.includes("concentrate") ||
    lower.includes("vape") ||
    lower.includes("cartridge") ||
    lower.includes("dab") ||
    lower.includes("wax") ||
    lower.includes("rosin") ||
    lower.includes("hash")
  ) {
    return "Cannabis Concentrate";
  }
  // Tier 3 — Flower / Pre-Rolls / empty / unknown → Flower (WA default).
  return "Cannabis Flower";
}

/** Extract a numeric price-floor + price-ceiling (in dollars) from a set
 *  of MenuProducts. Returns null when no product has a positive price
 *  (caller should OMIT the offers block). */
export function priceRangeFor(
  products: ReadonlyArray<Pick<MenuProduct, "unitPrice">>,
): { lowPrice: number; highPrice: number; offerCount: number } | null {
  const prices = products
    .map((p) => p.unitPrice)
    .filter((p): p is number => p != null && p > 0);
  if (prices.length === 0) return null;
  return {
    lowPrice: Math.min(...prices),
    highPrice: Math.max(...prices),
    offerCount: prices.length,
  };
}

/** Build the strain Product JSON-LD payload. Pure function — caller
 *  serializes via `safeJsonLd` and emits via `<script>`. */
export function buildStrainProductLd(args: {
  strain: Strain;
  matchedProducts: ReadonlyArray<MenuProduct>;
  storeWebsite: string;
  storeName: string;
}): Record<string, unknown> {
  const { strain, matchedProducts, storeWebsite, storeName } = args;
  const strainUrl = `${storeWebsite}/strains/${strain.slug}`;

  // Description: prefer tagline (curated short-form) and scrub. Fall
  // back to flavor list (factual aroma — non-claim) when tagline scrubs
  // empty. Final fallback: omit description rather than emit a generic
  // placeholder.
  const taglineSafe = scrubWslcbClaims(strain.tagline);
  const flavorJoined = strain.flavor.length > 0
    ? `Aroma + flavor: ${strain.flavor.join(", ")}.`
    : null;
  const description = taglineSafe ?? scrubWslcbClaims(flavorJoined);

  // additionalProperty — THC + CBD ranges + strain type. All factual
  // lab-tested / taxonomy data; non-claim. Only emit when present.
  const additionalProperty: Array<{ "@type": "PropertyValue"; name: string; value: string }> = [];
  if (strain.thcRange) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "THC content",
      value: strain.thcRange,
    });
  }
  if (strain.cbdRange) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "CBD content",
      value: strain.cbdRange,
    });
  }
  // Strain type (sativa/indica/hybrid) is taxonomy, not a claim.
  additionalProperty.push({
    "@type": "PropertyValue",
    name: "Strain type",
    value: strain.type.charAt(0).toUpperCase() + strain.type.slice(1),
  });

  // Pick a representative image — the per-strain opengraph-image route
  // exists in app/strains/[slug]/opengraph-image.tsx (factual brand card).
  const image = `${storeWebsite}/strains/${strain.slug}/opengraph-image`;

  // AggregateOffer — ONLY when live inventory exists. Empty / no-stock =
  // OMIT the field (per WSLCB + per the brief).
  const priceRange = priceRangeFor(matchedProducts);
  const offers = priceRange
    ? {
        "@type": "AggregateOffer" as const,
        offerCount: priceRange.offerCount,
        lowPrice: priceRange.lowPrice.toFixed(2),
        highPrice: priceRange.highPrice.toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${storeWebsite}/menu?q=${encodeURIComponent(strain.name)}`,
        seller: { "@id": `${storeWebsite}/#dispensary` },
      }
    : null;

  const product: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${strainUrl}#product`,
    name: `${strain.name} — at ${storeName}`,
    category: strainCategory(matchedProducts, strain),
    image,
    url: strainUrl,
  };

  if (description) {
    product.description = description;
  }
  if (additionalProperty.length > 0) {
    product.additionalProperty = additionalProperty;
  }
  if (offers) {
    product.offers = offers;
  }

  return product;
}

/** Build the sibling BreadcrumbList for the strain detail page. Separate
 *  payload — emitted as a SECOND `<script>` tag per the brief + Google's
 *  guidance for multi-type pages. 3-level (Home → Strains → Strain). */
export function buildStrainBreadcrumbLd(args: {
  strain: Strain;
  storeWebsite: string;
  storeName: string;
}): Record<string, unknown> {
  const { strain, storeWebsite, storeName } = args;
  const strainUrl = `${storeWebsite}/strains/${strain.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${strainUrl}#product-breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: storeName, item: storeWebsite },
      {
        "@type": "ListItem",
        position: 2,
        name: "Strains",
        item: `${storeWebsite}/strains`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: strain.name,
        item: strainUrl,
      },
    ],
  };
}
