// Vendor-logo source-of-truth guard.
//
// Per memory `feedback_vendor_logo_sources`: brand logos must come from
// the brand's own site/CDN — never from aggregators (Weedmaps, Leafly).
// Aggregator URLs signal to Google that we don't own the brand identity,
// and they go dark when the aggregator rotates their image-hosting
// scheme (Weedmaps has done this several times).
//
// This module is the single source of truth for that policy. Previously
// the helper lived inline in `app/sitemap.ts`, so the brand-page
// `<Image src={brand.logoUrl}>` render path bypassed the filter. v13.905
// shipped the sitemap-side defense (caught 1555-industrial-llc weedmaps
// logo via /loop tick 15 brand-page health audit); this lift exposes the
// same guard to the render path + JSON-LD emit. Sister scc same fix.

export const BROKEN_LOGO_URLS = new Set<string>([
  // Evergreen Herbal — 404 / WP upload removed from the420bar.com
  "https://the420bar.com/wp-content/uploads/2022/04/420-logo-alpha.png",
  // Agro Couture — 202 captcha challenge on agrocouture.com (SiteGround)
  "https://agrocouture.com/wp-content/uploads/2024/01/Agro-Couture_Logo-gold.png",
]);

export const BANNED_LOGO_DOMAINS = ["weedmaps.com", "leafly.com", "leafly.ca"];

export function isBannedLogoUrl(url: string): boolean {
  if (BROKEN_LOGO_URLS.has(url)) return true;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return BANNED_LOGO_DOMAINS.some((banned) => host === banned || host.endsWith(`.${banned}`));
  } catch {
    return true;
  }
}

export function safeLogoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return isBannedLogoUrl(url) ? null : url;
}

// ── Product-image domain denylist ─────────────────────────────────────────
//
// Sister concept to BANNED_LOGO_DOMAINS but for the PRODUCT_IMAGE plane.
// Doug 2026-05-20 reported /menu-preview rendered 80% broken cards. Root
// cause: the Dutchie product catalog has `image_url` values pointing at
// `the420bar.com/wp-content/...` (returns HTTP 405 server-wide). Our
// `ProductImage` at `app/order/OrderMenu.tsx:262-389` has the onError
// → gradient-placeholder + brand-logo + category-icon fallback chain,
// but that only fires CLIENT-SIDE on actual image-load failure. For
// SSR'd cards the browser races the image fetch before React's onError
// can swap state — dead URLs still flash the broken-img glyph.
//
// Fix: null out known-bad domains SERVER-SIDE in the DB-read helpers
// (getMenuProducts, getJustInProducts, etc.). Empty imageUrl triggers
// the placeholder branch directly: brand logo (60+ shipped at
// /public/brand-logos/) when available, category icon when not. End-to-
// end: NO broken-img glyph possible from a known-dead host.
//
// Maintenance: add a new domain here when an upstream vendor host
// goes dark. Cheap forever — strip happens on every read.
export const BANNED_PRODUCT_IMAGE_DOMAINS = [
  // the420bar.com returns HTTP 405 server-wide (verified 2026-05-19);
  // catalog has hundreds of products with image_url pointing here.
  "the420bar.com",
];

export function isBannedProductImageUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return BANNED_PRODUCT_IMAGE_DOMAINS.some((banned) => host === banned || host.endsWith(`.${banned}`));
  } catch {
    return true; // malformed URL = treat as banned
  }
}

// Strip dead-host URLs server-side so the SSR'd card renders the
// gradient-placeholder + brand-logo fallback directly, never the
// broken-img glyph. Pass through valid URLs untouched.
export function safeProductImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return isBannedProductImageUrl(url) ? null : url;
}
