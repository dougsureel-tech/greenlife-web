// Build-time manifest of brand-logo files that EXIST on disk in
// `public/brand-logos/<slug>.png`. Consumed by `app/order/OrderMenu.tsx`
// `ProductImage` to gate the brand-logo fallback BEFORE issuing a 404
// fetch + broken-image flash.
//
// Why this exists: pre-this-file, `ProductImage` rendered
// `<Image src="/brand-logos/{slug}.png" onError={...}/>` for any product
// whose `brand` slugified to anything. When the slug didn't have a
// matching PNG on disk (the common case — 11+ brands visible on SCC
// menu-preview hit this), the browser fetched 404, then `onError` flipped
// state → CategoryIcon. The UX glitch: ~50-200ms of broken-image-icon
// before the React re-render. Live impact verified 2026-05-21 via curl
// against `https://www.seattlecannabis.co/brand-logos/*.png` — 11 of 14
// referenced brand-logos returned 404.
//
// Manifest-shape fix: lib exports `BRAND_LOGOS_AVAILABLE: ReadonlySet<string>`
// containing the slugs that DO have files. `tryBrandLogo` becomes
// `tryBrandLogo = brandLogoSlug && BRAND_LOGOS_AVAILABLE.has(brandLogoSlug)`.
// No 404, no broken-image flash, instant CategoryIcon for brands without a
// logo asset on disk.
//
// **MAINTAIN IN LOCKSTEP with `public/brand-logos/*.png`.** When you drop
// a new logo PNG into the public folder, ADD its slug here too. The build-
// gate `scripts/check-brand-logos-manifest.mjs` verifies this stays in
// sync — pre-push fails when files exist on disk that aren't in the set
// (or vice versa).
//
// Slug convention matches `slugifyBrandForLogo()` in `app/order/OrderMenu.tsx`:
//   - lowercase
//   - `&` → `and`
//   - non-alphanumeric runs → single `-`
//   - trim leading/trailing `-`
//
// Sister-mirrored at `seattle-cannabis-web/lib/brand-logos-available.ts` —
// keep the two stacks IDENTICAL (the public/ folders are also identical).

export const BRAND_LOGOS_AVAILABLE: ReadonlySet<string> = new Set([
  "2727",
  "agro-couture-slab-mechanix",
  "agro-couture",
  "airo",
  "aloha-botanics",
  "artizen-cannabis-company",
  "artizen-cga",
  "artizen",
  "avitas",
  "binx-buds",
  "bondi-farms",
  "buddy-boy-farm",
  "ceres-435011",
  "ceres",
  "constellation-cannabis",
  "crystal-clear",
  "dewey",
  "dogtown-pioneers",
  "dope-cooks",
  "evergreen-herbal",
  "fairwinds",
  "falcanna",
  "fifty-fold",
  "flipside",
  "harmony-farms",
  "hellavated",
  "heylo-cannabis",
  "high-tide",
  "honu-inc",
  "journeyman",
  "k-savage",
  "kiva-confections",
  "lifted-cannabis",
  "minglewood-brands",
  "ooowee",
  "pagoda",
  "passion-flower",
  "peak-supply",
  "phat-panda",
  "plaid-jacket",
  "raven-grass",
  "ray-s-lemonade-wa",
  "redbird-cannabis",
  "refine",
  "rochester-farms",
  "seattle-bubble-works",
  "sky-high-gardens",
  "slab-mechanix",
  "super-fog",
  "tarukino",
  "the-goodship",
  "trail-blazin-productions",
  "walden-cannabis",
  "western-cultured",
  "wyld",
]);

/**
 * Returns true when `/brand-logos/<slug>.png` exists on disk in this
 * deployment. Use this gate before rendering an Image src that points
 * at a brand-logo file — avoids the 404-then-React-re-render broken-
 * image flash for brands without an asset.
 */
export function hasBrandLogoAsset(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return BRAND_LOGOS_AVAILABLE.has(slug);
}
