import type { NextConfig } from "next";

// SECURITY HEADERS — TEMPORARILY REMOVED (2026-05-01 22:55 PT).
//
// MENU_LOG hypotheses #4–#6 (Referrer-Policy swap, jane:version meta tag,
// Clerk middleware scoping) didn't unblock Boost on the new Vercel deploy,
// despite identical bootstrap config to the still-working WP origin. The
// remaining cross-origin-affecting diff between WP responses and ours is
// these added security headers: WP sends NONE of them; we send four. The
// strongest suspect is `Permissions-Policy: payment=()` — Boost feature-
// detects the Payment Request API on init, and a blocking policy could
// abort hydration silently. Removing the whole block puts us byte-for-byte
// on WP's profile so we can confirm or rule out the policy class as a
// confound. Add back individually with confirmed-safe values once /menu
// is rendering products.

// Permissions-Policy verbatim from the still-working WordPress origin's
// /menu response (curl --resolve www.{domain}:443:208.109.64.51). Grants
// Private State Token redemption + issuance for Cloudflare's challenge
// endpoints — that's how iHeartJane's Cloudflare WAF verifies a real
// browser without CAPTCHA. Without this header, browsers default to
// "self only" and Cloudflare can't redeem the trust token issued during
// the page load → flags Boost's API requests as bot traffic → CORS
// rejection. This was the lone HTTP-header delta between WP (works) and
// our Vercel deploy (CORS-blocks).
const PERMISSIONS_POLICY =
  'private-state-token-redemption=(self "https://www.google.com" "https://www.gstatic.com" "https://recaptcha.net" "https://challenges.cloudflare.com" "https://hcaptcha.com"), ' +
  'private-state-token-issuance=(self "https://www.google.com" "https://www.gstatic.com" "https://recaptcha.net" "https://challenges.cloudflare.com" "https://hcaptcha.com")';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Permissions-Policy", value: PERMISSIONS_POLICY },
          // X-Content-Type-Options nosniff: prevents browsers from MIME-
          // sniffing a response away from its declared Content-Type. Was
          // NOT in the 2026-05-01 removal — that pass yanked Referrer-Policy,
          // X-Frame-Options, X-XSS-Protection, and Strict-Transport-Security
          // to match the still-working WordPress origin's iHJ-compatible
          // header set. nosniff has zero interaction with iHeartJane Boost
          // (no MIME-sniffing involved), is universally safe, and closes a
          // small XSS-via-mismatched-Content-Type gap. Add other classic
          // security headers back individually after iHJ regression-testing.
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
  // **/menu + /order rule (DO NOT REMOVE):** never add a redirect that
  // bounces /menu or /order to a different domain. /menu hosts the iHeartJane
  // Boost embed inline (app/menu/page.tsx + JaneMenu.tsx); off-domain redirects
  // break the embed model. If /menu renders blank, iHeartJane usually rotated
  // the Boost bundle hash — see ~/Documents/CODE/INCIDENTS.md → "Blank /menu
  // after iHeartJane rotated the Boost bundle hash" (2026-05-01) for the
  // diagnostic walk. NEVER bounce off-domain as a workaround.
  //
  // **Pre-Next.js legacy URL preservation (added 2026-05-07):** Wayback CDX
  // shows greenlifecannabis.com had a WordPress era (~2014–2019, "hello-world"
  // first post 2019-11-27) before this Next.js site replaced it. Some legacy
  // URL paths still get hit by stale Google index entries + old social-media
  // links — these 308s preserve SEO juice + customer-trust for inbound links
  // that survived the platform change. Doug 2026-05-07: "we should also make
  // sure we did that with seattle and wenatchee if needed" (ref: GW pre-cutover
  // redirect map shipped same day). Each entry below redirects to the closest
  // semantic equivalent on the new site. None redirect /menu or /order — those
  // are protected per the rule above.
  async redirects() {
    return [
      // Same-content-different-name swaps.
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/about/mission", destination: "/about", permanent: true },
      { source: "/about/location", destination: "/visit", permanent: true },

      // WordPress nested-blog artifact: posts shipped at /blog/blog/<year>/<month>/<slug>/.
      // Next.js dynamic routes can't easily catch every shape — collapse the
      // whole subtree to /blog (the new article hub) so any orphaned post URL
      // lands on something useful instead of 404'ing.
      { source: "/blog/blog/:path*", destination: "/blog", permanent: true },
      { source: "/blog/category/:slug*", destination: "/blog", permanent: true },
      { source: "/blog/author/:slug*", destination: "/blog", permanent: true },

      // /amazing-cannabis-plant-grows: NO REDIRECT — Doug 2026-05-07: "that
      // was an old blog post, we should still have it up because it ranks
      // high." The post is restored at lib/posts.ts under the same slug
      // (sourced from web.archive.org snapshot 2019-12-14). The URL itself
      // is preserved at the original path via a `rewrites()` rule below
      // (not a redirect — server-side rewrite keeps the URL bar at the
      // legacy path while serving /blog/[slug] template content). That
      // preserves the SEO ranking signal Doug flagged.

      // Author-archive WP-ism — never had real customer value, redirect to /blog.
      { source: "/author/:slug*", destination: "/blog", permanent: true },

      // Legacy e-commerce paths → /menu (Doug 2026-05-07: "drop forget old
      // greenlife urls for seo sake"). Mirror of seattle-cannabis-web's same
      // map — Sea had these from a prior platform-change cleanup, Wen never
      // got the same sweep. /shop /products /flower /concentrates /edibles
      // /pre-rolls /vapes /strains all 404'd on the new site pre-fix; now
      // 308-redirect to /menu (the iHeartJane Boost embed canonical product
      // surface). All inbound — old social-media links, old Google index
      // entries, partner-directory listings — now land on something useful
      // instead of dead-ending.
      { source: "/shop", destination: "/menu", permanent: true },
      { source: "/shop/:path*", destination: "/menu", permanent: true },
      { source: "/products", destination: "/menu", permanent: true },
      { source: "/products/:path*", destination: "/menu", permanent: true },
      { source: "/flower", destination: "/menu", permanent: true },
      { source: "/concentrates", destination: "/menu", permanent: true },
      { source: "/edibles", destination: "/menu", permanent: true },
      { source: "/pre-rolls", destination: "/menu", permanent: true },
      { source: "/prerolls", destination: "/menu", permanent: true },
      { source: "/vapes", destination: "/menu", permanent: true },
      { source: "/cartridges", destination: "/menu", permanent: true },
      { source: "/topicals", destination: "/menu", permanent: true },
      { source: "/tinctures", destination: "/menu", permanent: true },
      { source: "/accessories", destination: "/menu", permanent: true },
      { source: "/strains", destination: "/find-your-strain", permanent: true },
      { source: "/strain/:slug*", destination: "/find-your-strain", permanent: true },

      // Common WordPress / legacy info-page paths → semantic equivalent on new
      // site. Verified 404'd on new site 2026-05-07.
      { source: "/contact-us", destination: "/visit", permanent: true },
      { source: "/contact", destination: "/visit", permanent: true },
      { source: "/location", destination: "/visit", permanent: true },
      { source: "/locations", destination: "/visit", permanent: true },
      { source: "/find-us", destination: "/visit", permanent: true },
      { source: "/hours", destination: "/visit", permanent: true },
      { source: "/our-story", destination: "/about", permanent: true },
      { source: "/team", destination: "/about", permanent: true },
      { source: "/staff", destination: "/about", permanent: true },
      // /privacy and /terms aren't real pages on the new site (cannabis-
      // retail customer rarely needs them — operating disclosures live on
      // /about + the WSLCB-required posters in-store). Redirect to /about
      // so old-indexed URLs land on something rather than 404.
      { source: "/privacy-policy", destination: "/about", permanent: true },
      { source: "/privacy", destination: "/about", permanent: true },
      { source: "/terms-of-service", destination: "/about", permanent: true },
      { source: "/terms-and-conditions", destination: "/about", permanent: true },
      { source: "/terms", destination: "/about", permanent: true },
      { source: "/tos", destination: "/about", permanent: true },

      // WP tag archives — same logic as /author/. Customer never bookmarks a
      // tag page; collapse to /blog so inbound links don't dead-end.
      { source: "/tag/:slug*", destination: "/blog", permanent: true },
      { source: "/category/:slug*", destination: "/blog", permanent: true },
    ];
  },

  // Internal rewrites — URL stays at the source, content served from the
  // destination. Distinct from `redirects()` which sends the browser to a
  // new URL. Used here to preserve the legacy `/amazing-cannabis-plant-grows`
  // URL (high-SEO-ranking per Doug 2026-05-07) while serving the post
  // through the regular /blog/[slug] template.
  async rewrites() {
    return [
      {
        source: "/amazing-cannabis-plant-grows",
        destination: "/blog/amazing-cannabis-plant-grows",
      },
    ];
  },
};

export default nextConfig;
