// Product-title formatter for the "In stock today" card on /strains/[slug].
//
// Problem this solves: the raw `products.name` field from Dutchie / brapp
// follows the SKU naming convention `<weight> - <strain> - <brand> -
// <category> [- <variant>] - <type-abbrev>` (5 or 6 dash-separated parts,
// trailing single-letter strain-type abbrev S/I/H). Rendering that string
// verbatim on the strain page is redundant + ugly:
//   - the strain name is already in the page header (`<h1>{strain.name}</h1>`)
//   - the category is already rendered below the card title
//   - the trailing type-abbrev is noise to a shopper
//
// Doug 2026-05-28 greenlight: new title shape is `<Brand> · <Variant> ·
// <Weight>` for 6-part SKUs, `<Brand> · <Category> · <Weight>` for 5-part
// SKUs (no variant slot). Falls back gracefully when the SKU doesn't parse
// (manually-entered products, non-standard upstream feeds).
//
// Sister file in seattle-cannabis-web/lib/format-product-title.ts —
// byte-identical (pure function, no store-specific imports).

export type FormatProductTitleInput = {
  name: string | null | undefined;
  brand: string | null | undefined;
  category: string | null | undefined;
};

export type FormatProductTitleOptions = {
  /** Optional strain name from the page context; used as a parse-validation
   *  signal — when the 2nd SKU part matches the strain name (case-insensitive
   *  substring either way), we treat the parse as confidently valid. The
   *  formatter still returns a useful string when this is absent. */
  strainName?: string | null | undefined;
};

// Trailing strain-type abbreviation: ` - S`, ` - I`, ` - H` (with optional
// trailing whitespace). Case-insensitive — both `s` and `S` show up in the
// Dutchie catalog. The space-dash-space prefix keeps us from chopping the
// middle of a real word that happens to end in a capital letter.
const TYPE_ABBREV_TAIL = /\s+-\s+[SIHsih]\s*$/;

// `DOH ` prefix on product names belongs to the regulatory framing
// (rendered as a separate badge elsewhere). Strip from the title so the
// brand reads cleanly.
const DOH_PREFIX = /^DOH\s+/;

// `510` is a cartridge thread standard — when it appears as the variant
// slot ("- 510 -" or trailing "- 510"), expand to "510 Cart" so shoppers
// who don't recognize the number get the context.
const FIVE_TEN_BARE = /^510$/;

function normalizeBareToken(token: string): string {
  if (FIVE_TEN_BARE.test(token)) return "510 Cart";
  return token;
}

function joinNonEmpty(parts: Array<string | null | undefined>, sep = " · "): string {
  return parts.filter((p): p is string => typeof p === "string" && p.length > 0).join(sep);
}

/**
 * Formats a raw product name for display on the strain-page "In stock today"
 * card. Designed to be pure + safe (no exceptions, always returns a string).
 *
 * Examples:
 *   formatProductTitle({
 *     name: "1g - Sour Diesel - Mama J's - Concentrate - S",
 *     brand: "Mama J's",
 *     category: "Concentrate",
 *   }) === "Mama J's · Concentrate · 1g"
 *
 *   formatProductTitle({
 *     name: "1g - Sour Diesel - Dabs 4 Less - Concentrate - Sugar - S",
 *     brand: "Dabs 4 Less",
 *     category: "Concentrate",
 *   }) === "Dabs 4 Less · Sugar · 1g"
 *
 *   formatProductTitle({
 *     name: "Manually entered name",
 *     brand: "Some Brand",
 *     category: "Edible",
 *   }) === "Some Brand · Edible"   // parse fails → fallback chain
 */
export function formatProductTitle(
  input: FormatProductTitleInput,
  options: FormatProductTitleOptions = {},
): string {
  const rawName = (input.name ?? "").trim();
  const brand = (input.brand ?? "").trim() || null;
  const category = (input.category ?? "").trim() || null;
  const strainName = (options.strainName ?? "").trim() || null;

  // Defensive: empty name → fallback to brand/category.
  if (!rawName) {
    return joinNonEmpty([brand, category]) || "";
  }

  // Strip DOH prefix + trailing type-abbrev tail before parsing.
  const stripped = rawName.replace(DOH_PREFIX, "").replace(TYPE_ABBREV_TAIL, "").trim();

  // Split on " - " (the canonical SKU separator). Trim each part defensively.
  const parts = stripped.split(/\s+-\s+/).map((p) => p.trim()).filter((p) => p.length > 0);

  // 5-part shape: [weight, strain, brand, category, (variant|type)]
  //   after type-tail strip → 4 parts: [weight, strain, brand, category]
  // 6-part shape: [weight, strain, brand, category, variant, type]
  //   after type-tail strip → 5 parts: [weight, strain, brand, category, variant]

  if (parts.length === 5 || parts.length === 4) {
    const [weight, parsedStrain, parsedBrand, parsedCategory, maybeVariant] = parts;

    // Parse-validity check: if a strainName is provided, the parsed strain
    // slot should plausibly match. We accept either direction of substring
    // since strain corpus names and SKU slugs don't always line up exactly
    // ("Sour Diesel" vs "Sour D" vs "SOUR DIESEL").
    let parseValid = true;
    if (strainName && parsedStrain) {
      const a = parsedStrain.toLowerCase();
      const b = strainName.toLowerCase();
      if (!a.includes(b) && !b.includes(a)) {
        parseValid = false;
      }
    }

    if (parseValid && weight && parsedBrand) {
      // Prefer the parsed brand/category slots over the DB columns when the
      // SKU parses cleanly — keeps the title consistent even when the DB
      // columns are NULL (which happens for some manually-entered rows).
      const brandOut = parsedBrand || brand || "";
      if (parts.length === 5 && maybeVariant) {
        // 6-part SKU with variant slot.
        const variantOut = normalizeBareToken(maybeVariant);
        return joinNonEmpty([brandOut, variantOut, weight]);
      }
      // 5-part SKU — no variant; use parsed category for the middle slot.
      const categoryOut = parsedCategory || category || "";
      return joinNonEmpty([brandOut, categoryOut, weight]);
    }
  }

  // Parse failed (non-canonical name, manually entered, missing slots).
  // Try to extract a weight token from the head of the string as a partial
  // recovery — many vendor names lead with weight even when the rest of the
  // SKU shape doesn't conform.
  const weightHead = parts[0] && /^\d+(\.\d+)?\s*(g|mg|ml|oz)$/i.test(parts[0]) ? parts[0] : null;
  if (brand && weightHead) {
    return joinNonEmpty([brand, weightHead]);
  }
  if (brand && category) {
    return joinNonEmpty([brand, category]);
  }
  return brand ?? category ?? rawName;
}
