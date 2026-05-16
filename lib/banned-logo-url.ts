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
