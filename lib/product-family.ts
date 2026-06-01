// Product-family grouping — Path A (string-parse MVP).
//
// Built for the iHJ → BRAPP-native /menu cutover. Consolidates multi-size
// SKUs (e.g. Cookies 1g/3.5g/7g/14g/28g) into ONE menu card with an
// inline "Select weight" picker. Mirrors the iHJ Boost UX shown in
// Doug's 2026-06-01 SCC screenshot (`A-Bud (1G, 3.5G)` with a
// `Select weight` CTA).
//
// Plan reference: /CODE/Green Life/PLAN_MENU_PRE_IHJ_CUTOVER.md WS2.
//
// Strategy: render-time string-parse — no schema changes. Extract leading
// size token(s) from `products.name`, group by `(brand_lower,
// stripped_name_lower)`. Path B (add `product_family_id` + `size_grams`
// columns) is gated on Kat reporting 3+ wrong-grouping incidents.
//
// Pure module — no DB, no React, no IO. Tested at lib/__tests__/product-family.test.ts.

import type { MenuProduct } from "./db.ts";

/**
 * Parsed size info extracted from a product name string. The MVP strips
 * leading size tokens; the residue becomes the family-key.
 */
export type ParsedSize = {
  /** Total grams of cannabis material. NULL for non-gram items (mg edibles, drinks). */
  sizeGrams: number | null;
  /** Display label shown in size pills + accordion rows. */
  sizeLabel: string | null;
  /** The name with leading size token(s) removed + trimmed. */
  stripped: string;
  /** Numeric key for ascending-size sort. mg-equivalent — flower 28g=28000, edibles 100mg=100. */
  sortKey: number;
};

/**
 * Pattern table — ordered most-specific first. The first matching pattern
 * wins. Each pattern returns the parsed size shape (sans `stripped`,
 * which the caller computes from the match length).
 */
const SIZE_PATTERNS: Array<{
  re: RegExp;
  build: (m: RegExpMatchArray) => Omit<ParsedSize, "stripped">;
}> = [
  // Preroll packs: "2pk - .5g - ", "10pk - 1g - ", "5pk - 1g - "
  // Total grams = pack_count × each_size; sort by total mg.
  {
    re: /^(\d+)\s*pk\s*-\s*(\.\d+|\d+(?:\.\d+)?)\s*g\s*-\s*/i,
    build: (m) => {
      const pack = parseInt(m[1], 10);
      const eachRaw = m[2];
      const each = parseFloat(eachRaw.startsWith(".") ? "0" + eachRaw : eachRaw);
      const total = pack * each;
      return {
        sizeGrams: total,
        sizeLabel: `${pack}pk-${eachRaw}g`,
        sortKey: total * 1000,
      };
    },
  },
  // Single grams: "28g - ", "3.5g - ", "1g - ", ".5g - "
  {
    re: /^(\.\d+|\d+(?:\.\d+)?)\s*g\s*-\s*/i,
    build: (m) => {
      const raw = m[1];
      const g = parseFloat(raw.startsWith(".") ? "0" + raw : raw);
      return {
        sizeGrams: g,
        sizeLabel: `${raw}g`,
        sortKey: g * 1000,
      };
    },
  },
  // Milligrams: "100mg - ", "50mg - " (edibles / drinks)
  {
    re: /^(\d+)\s*mg\s*-\s*/i,
    build: (m) => {
      const mg = parseInt(m[1], 10);
      return {
        sizeGrams: null,
        sizeLabel: `${mg}mg`,
        sortKey: mg,
      };
    },
  },
];

/**
 * Extract leading size token(s) from a product name.
 *
 * Returns `{ sizeGrams, sizeLabel, stripped, sortKey }`. If no recognized
 * token leads the name, returns the full trimmed name as `stripped` with
 * null size fields + sortKey=0 (single-member family).
 */
export function extractSize(name: string): ParsedSize {
  const trimmed = name.trim();
  for (const { re, build } of SIZE_PATTERNS) {
    const m = trimmed.match(re);
    if (m) {
      const partial = build(m);
      return {
        ...partial,
        stripped: trimmed.slice(m[0].length).trim(),
      };
    }
  }
  return {
    sizeGrams: null,
    sizeLabel: null,
    stripped: trimmed,
    sortKey: 0,
  };
}

/**
 * Family key for grouping. Products with the same key are merged into one
 * menu card with a size picker. Key = JSON([brand_lower, stripped_name_lower]).
 *
 * Brand-null products fall under a `__NO_BRAND__` sentinel so they still
 * group by stripped-name alone (legacy data tolerance).
 *
 * Path B promotion will replace this with `p.product_family_id`.
 */
export function familyKey(p: MenuProduct): string {
  const parsed = extractSize(p.name);
  return JSON.stringify([
    (p.brand ?? "__NO_BRAND__").toLowerCase().trim(),
    parsed.stripped.toLowerCase(),
  ]);
}

/**
 * Member of a family — the source MenuProduct + its parsed size info.
 * The size info is precomputed so the card render doesn't re-parse.
 */
export type FamilyMember = MenuProduct & {
  _parsedSize: ParsedSize;
};

export type FamilyGroup = {
  /** The JSON-stringified key — stable, hash-safe, React-key-safe. */
  familyKey: string;
  /** Members sorted ascending by size (sortKey). */
  members: FamilyMember[];
  /** Stripped name (size token removed) — what shows as the card title. */
  displayName: string;
  /** Brand from the first member (members are guaranteed same brand by familyKey). */
  brand: string | null;
  /** Inline size label rendered on the card. "(1g, 3.5g, 28g)" for multi; "1g" for single. */
  sizesLabel: string;
  /** Cheapest member's unit price (used for "from $X" display). */
  minPrice: number | null;
  /** Most expensive member's unit price (used for price-range display). */
  maxPrice: number | null;
  /** Median THC% across members (rounded to nearest 0.5). Family-card display. */
  thcDisplay: number | null;
  /** True if ANY member is DOH-compliant. Card shows DOH chip when true. */
  dohAny: boolean;
  /** True when 2+ members → render size picker CTA. False → "Add to bag" direct. */
  isMultiSize: boolean;
};

/**
 * Group a flat product list into families. Order of returned families
 * matches first-member-occurrence in the input — caller can keep their
 * own sort (by category, by deal status, etc.) outside this grouping.
 *
 * For an empty input returns `[]`. Single-member families are valid and
 * render unchanged shape (regression-proof).
 */
export function groupByFamily(products: MenuProduct[]): FamilyGroup[] {
  const buckets = new Map<string, FamilyGroup>();

  for (const p of products) {
    const parsed = extractSize(p.name);
    const key = familyKey(p);
    const member: FamilyMember = { ...p, _parsedSize: parsed };
    const existing = buckets.get(key);

    if (existing) {
      existing.members.push(member);
    } else {
      buckets.set(key, {
        familyKey: key,
        members: [member],
        displayName: parsed.stripped || p.name,
        brand: p.brand,
        sizesLabel: "",
        minPrice: p.unitPrice,
        maxPrice: p.unitPrice,
        thcDisplay: p.thcPct,
        dohAny: p.isDohCompliant,
        isMultiSize: false,
      });
    }
  }

  // Finalize derived fields per group.
  for (const g of buckets.values()) {
    g.members.sort((a, b) => a._parsedSize.sortKey - b._parsedSize.sortKey);
    g.isMultiSize = g.members.length >= 2;
    g.sizesLabel = g.isMultiSize
      ? `(${g.members.map((m) => m._parsedSize.sizeLabel ?? "—").join(", ")})`
      : g.members[0]?._parsedSize.sizeLabel ?? "";

    const prices = g.members
      .map((m) => m.unitPrice)
      .filter((x): x is number => x != null);
    g.minPrice = prices.length ? Math.min(...prices) : null;
    g.maxPrice = prices.length ? Math.max(...prices) : null;

    const thcs = g.members
      .map((m) => m.thcPct)
      .filter((x): x is number => x != null);
    if (thcs.length > 0) {
      const sorted = [...thcs].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      g.thcDisplay = Math.round(median * 2) / 2;
    } else {
      g.thcDisplay = null;
    }

    g.dohAny = g.members.some((m) => m.isDohCompliant);
  }

  return [...buckets.values()];
}
