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
          // small XSS-via-mismatched-Content-Type gap.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // X-Frame-Options SAMEORIGIN restored 2026-05-08 per Doug's
          // "Add other classic security headers back individually after
          // iHJ regression-testing" directive in the original removal note.
          // Why safe: iHJ Boost loads iHJ origins INSIDE our /menu iframe
          // (we iframe THEM), not the reverse. X-Frame-Options on our
          // origin governs who can iframe US — no plausible interaction
          // with Boost's nested iframes pointing at api.iheartjane.com.
          // Verified pre-add: `curl /menu | grep iframe` returns empty
          // (Boost iframes injected dynamically + point at iHJ, not back
          // at greenlifecannabis.com). Closes the standing clickjacking
          // gap on the customer surface (the apply form / account /
          // order CTAs are real action targets that benefit from
          // frame-busting). If /menu regresses post-deploy, single-line
          // revert: drop this header back out.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
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

      // Booking-style legacy URLs — sister of scc's same map. Mirror parity
      // closure: pre-fix `/book` + `/book-now` 404'd on Wen even though they
      // were already 308'd on Sea. Old-site nav-bar / partner-directory
      // listings on either store can use either URL pattern. /order itself
      // 307s → /menu via proxy.ts until native cart goes live; this preserves
      // the future-correct landing point regardless.
      { source: "/book", destination: "/order", permanent: true },
      { source: "/book-now", destination: "/order", permanent: true },

      // Common e-commerce-platform legacy URL patterns that 404'd pre-fix.
      // /cart + /buy are universal Shopify/WooCommerce legacy aliases;
      // /pickup matches the customer-intent URL that some loyalty/POS
      // platforms emit; /preroll is the singular sister of the already-
      // mapped /prerolls. All redirect to /menu (the canonical product
      // surface, iHeartJane Boost embed). Catches stale Google index +
      // partner-directory + bookmark URLs from prior platforms. Sister
      // scc same wave.
      { source: "/cart", destination: "/menu", permanent: true },
      { source: "/buy", destination: "/menu", permanent: true },
      { source: "/pickup", destination: "/menu", permanent: true },
      { source: "/preroll", destination: "/menu", permanent: true },

      // Common WordPress / legacy info-page paths → semantic equivalent on new
      // site. /contact + /our-story have real pages on the new site (linked from
      // sitemap.ts + faq + about + structured-data canonical) — DO NOT redirect
      // those, only redirect the legacy aliases that point AT them.
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/location", destination: "/visit", permanent: true },
      { source: "/locations", destination: "/visit", permanent: true },
      { source: "/find-us", destination: "/visit", permanent: true },
      { source: "/hours", destination: "/visit", permanent: true },
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

      // ── SEO recovery: WordPress structural URLs (Doug 2026-05-08)
      // Wayback CDX confirmed these legacy URLs were crawled in 2024-2026
      // (Wenatchee had a longer WP era + a Chelan-dispensary landing page).
      // Each → semantic equivalent on the new site so inbound links survive.
      { source: "/blog/vendor-spotlight-template", destination: "/blog/how-we-pick-our-producers", permanent: true },
      { source: "/faqs", destination: "/faq", permanent: true },
      { source: "/feed", destination: "/blog", permanent: true },
      { source: "/hello-world", destination: "/blog", permanent: true },
      { source: "/my-account", destination: "/account", permanent: true },
      { source: "/my-account/:path*", destination: "/account", permanent: true },
      { source: "/gallery", destination: "/about", permanent: true },
      { source: "/chelan-dispensary", destination: "/menu", permanent: true },

      // ── Legacy iHJ / WP product URLs (Doug 2026-05-08)
      // /menu/products/<id>/<slug>/ was the iHJ product detail URL pattern.
      // Hundreds of these were indexed; collapse all to /menu (the live
      // Boost embed) — Google follows the redirect and customers land on
      // the live menu where they can search the same product.
      { source: "/menu/products/:path*", destination: "/menu", permanent: true },

      // ── Legacy WP sitemaps (Doug 2026-05-08)
      // Yoast SEO + WP defaults emit multiple sitemap variants. Next.js
      // emits a single /sitemap.xml; collapse old variants there.
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/sitemap.rss", destination: "/sitemap.xml", permanent: true },
      { source: "/sitemap", destination: "/sitemap.xml", permanent: true },
      { source: "/post-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/page-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/category-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/author-sitemap.xml", destination: "/sitemap.xml", permanent: true },
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
