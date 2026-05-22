// Generic stock-photo placeholders per category — the "fallback above the
// fallback" tier in the product-image chain. Doug 2026-05-21:
// "we can find generic photos we can use as placeholders for now if we
// cant find a cartrige image or something like that."
//
// Fallback chain in `app/order/OrderMenu.tsx#ProductImage`:
//   1. Real product photo (`p.imageUrl`)               — 0% coverage today
//      (Dutchie sync gap — inv-App-side fix)
//   2. Brand-logo PNG (`/brand-logos/<slug>.png`)      — 55 brands covered
//      after the v38.625→v38.725 arc + sister batches; gated by
//      `BRAND_LOGOS_AVAILABLE`.
//   3. Generic category placeholder (THIS FILE)        — NEW tier added
//      2026-05-21 v38.765. 3 categories covered today: flower, preroll,
//      vape (incl. cartridge/disposable/pod variants).
//   4. CategoryIcon SVG line-art + gradient            — universal fallback
//      retained for categories without a placeholder photo OR if the
//      placeholder JPG ever 404s.
//
// **Image sourcing doctrine** — mirrors `feedback_vendor_logo_sources` for
// brand logos, but slightly relaxed since these are GENERIC category
// stand-ins (not brand-specific marks):
//   - Unsplash / Pexels royalty-free with NO attribution required
//   - WSLCB-safe (WAC 314-55-155): NO people consuming, NO children-
//     appealing imagery, NO cartoons/animals/fictional characters, NO
//     efficacy or medical-suggestive framing
//   - Plain product/plant shots only — clean studio or simple-background
//   - Aspect-cover at render time so portrait + landscape both work
//
// **Sister-mirrored** at `seattle-cannabis-web/lib/category-placeholder-photos.ts`
// — keep the two stacks IDENTICAL (the public/category-placeholders/
// folders are also identical).
//
// **MAINTAIN IN LOCKSTEP with `public/category-placeholders/*.jpg`.** When
// you drop a new placeholder JPG into the folder, ADD its slug + the
// category strings it covers HERE too.

type PlaceholderSlug = "flower" | "preroll" | "vape";

// Mapping from DB `category` string (case-sensitive, matching the
// strings used by `lib/product-placeholder.ts` CATEGORY_GRADIENTS) to
// the placeholder JPG slug.
//
// Vape variants (Cartridge/Cartridges/Disposable/Disposables/Pod/Pods)
// all collapse to the same vape placeholder — mirrors the gradient + icon
// system in lib/product-placeholder-icons.tsx.
const CATEGORY_TO_PLACEHOLDER: Record<string, PlaceholderSlug> = {
  Flower: "flower",
  "Pre-Roll": "preroll",
  "Pre-Rolls": "preroll",
  Vape: "vape",
  Vapes: "vape",
  Cartridge: "vape",
  Cartridges: "vape",
  Disposable: "vape",
  Disposables: "vape",
  Pod: "vape",
  Pods: "vape",
};

/**
 * Returns the absolute path to a generic category-placeholder JPG, or
 * `null` if the category doesn't have a placeholder file on disk yet.
 *
 * Callers should render this image with `object-cover` so the source
 * aspect ratio (some are portrait, some landscape) crops cleanly to the
 * card's aspect-square frame.
 *
 * Use this as a fallback tier BELOW the brand-logo check and ABOVE the
 * CategoryIcon SVG fallback. When this returns `null`, fall through to
 * the SVG icon branch.
 */
export function getCategoryPlaceholderPhoto(
  category: string | null | undefined,
): string | null {
  if (!category) return null;
  const slug = CATEGORY_TO_PLACEHOLDER[category];
  return slug ? `/category-placeholders/${slug}.jpg` : null;
}

/**
 * Build-time set of placeholder slugs that have JPGs on disk. Used by
 * any future build-gate that wants to verify file ↔ manifest lockstep.
 */
export const CATEGORY_PLACEHOLDER_SLUGS: ReadonlySet<PlaceholderSlug> = new Set([
  "flower",
  "preroll",
  "vape",
]);
