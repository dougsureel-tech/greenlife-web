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
//
// 2026-05-10 — Appended `camera=(), microphone=(), geolocation=(),
// interest-cohort=()` to lock down browser APIs we never use (sister of
// cannagent + GW + sureel + vrg same-set). These directives DO NOT
// interact with private-state-token-* — orthogonal browser-API surfaces.
// camera/mic/geo are no-third-party-permission (we never request them on
// the marketing site) so locking down protects against any future
// vendor JS that might silently try to access them. interest-cohort
// opts out of FLoC tracking. Caught 2026-05-10 by /loop cross-stack
// Permissions-Policy presence sweep — glw + scc were the lone outliers
// using only the WP-mirror policy without the hardened camera/mic/geo
// lockdown the other 4 sites carry.
// CSP Report-Only — closes Doug-action #2 from the round-3 close pin.
// Report-Only means the browser LOGS violations to DevTools console but
// does NOT block requests — this gives us a 1-2 week observation window
// to see what legitimate traffic would be affected before we flip to
// enforce mode (Content-Security-Policy header with same value).
//
// Why permissive starting policy: glw embeds iHeartJane Boost which loads
// scripts + fetches data from multiple iHJ subdomains (api.iheartjane.com,
// search.iheartjane.com, boost-assets.iheartjane.com, www.iheartjane.com).
// Boost also injects inline <script>/<style> hydration code → 'unsafe-
// inline' on script-src + style-src is required for Boost to render.
// Vendor brand logos come from many CDNs (squarespace-cdn, weedmaps,
// brand-owned WP uploads) → img-src https: catches all. Vercel Analytics
// + GA4 + Web Vitals reporting need https://*.vercel-scripts.com +
// https://*.vercel-insights.com + GA endpoints → script-src + connect-src
// allow those. Cloudflare/recaptcha trust-token endpoints (already in
// Permissions-Policy private-state-token-* allowlist) need to be in
// connect-src too.
//
// frame-src ONLY allows iHeartJane subdomains (no other iframes used on
// glw). object-src 'none' blocks Flash/PDF embed (no use case). base-uri
// 'self' prevents <base> tag injection. form-action 'self' prevents form
// hijacking. frame-ancestors 'self' allows our own embed (matches
// X-Frame-Options: SAMEORIGIN already set above).
//
// No report-uri yet — browsers log to DevTools console. Future tick:
// add /api/csp-report endpoint to capture violations into Postgres for
// centralized analysis. For now: Doug observes via Chrome DevTools
// Network/Console tab on key pages (/, /menu, /deals, /brands/<slug>,
// /heroes/*) before flipping to enforce.
//
// SAFETY: Report-Only header CANNOT break the page. Worst case the
// console gets noisy. iHJ Boost rendering, payment flows (none on glw
// — cash-only), forms — all unaffected by Report-Only.
const CSP_REPORT_ONLY =
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' " +
    "https://*.vercel-scripts.com https://*.iheartjane.com " +
    "https://www.googletagmanager.com https://www.google-analytics.com " +
    "https://challenges.cloudflare.com https://www.google.com https://www.gstatic.com https://recaptcha.net https://hcaptcha.com; " +
  "style-src 'self' 'unsafe-inline' https://*.iheartjane.com; " +
  "img-src 'self' data: blob: https:; " +
  "font-src 'self' data: https:; " +
  "connect-src 'self' https://*.vercel-insights.com https://*.vercel-scripts.com " +
    "https://*.iheartjane.com https://api.iheartjane.com https://search.iheartjane.com " +
    "https://www.google-analytics.com https://*.google-analytics.com " +
    "https://challenges.cloudflare.com https://www.google.com https://www.gstatic.com " +
    "https://recaptcha.net https://hcaptcha.com; " +
  "frame-src 'self' https://*.iheartjane.com https://www.google.com https://challenges.cloudflare.com https://hcaptcha.com; " +
  "media-src 'self' blob:; " +
  "worker-src 'self' blob:; " +
  "object-src 'none'; " +
  "base-uri 'self'; " +
  "form-action 'self'; " +
  "frame-ancestors 'self'; " +
  // T109 — report-uri directs browsers to POST violation reports to
  // /api/csp-report (NEW edge route). Without this, violations only
  // logged to per-user DevTools Console which Doug can't aggregate.
  // With it, Vercel Runtime Logs capture every violation across all
  // visitors — one place to grep for `[csp-violation]` during the
  // observation window. report-uri is deprecated by report-to (newer
  // Reporting API) but report-uri has wider browser support; Chrome +
  // Edge use both, Safari + Firefox only honor report-uri. Sticking
  // with report-uri until the observation window closes; future tick
  // can add Reporting-Endpoints + report-to for richer Chromium reports.
  "report-uri /api/csp-report";

const PERMISSIONS_POLICY =
  'private-state-token-redemption=(self "https://www.google.com" "https://www.gstatic.com" "https://recaptcha.net" "https://challenges.cloudflare.com" "https://hcaptcha.com"), ' +
  'private-state-token-issuance=(self "https://www.google.com" "https://www.gstatic.com" "https://recaptcha.net" "https://challenges.cloudflare.com" "https://hcaptcha.com"), ' +
  // Defense-in-depth: lock down browser APIs the marketing site has zero
  // legitimate use for, blocking any future vendor JS / third-party widget
  // from silently invoking them. payment=() prevents Payment Request API
  // (cash-only site never invokes); usb / serial / bluetooth / midi block
  // hardware-access APIs no marketing site needs; xr-spatial-tracking
  // blocks WebXR; magnetometer / accelerometer / gyroscope block device-
  // orientation APIs (no AR / fitness use). All set to empty allowlist =
  // disabled for self + all iframes. Note: iHeartJane Boost iframe needs
  // private-state-token-* (already allowlisted above) and nothing else
  // from this directive set — verified pre-add by scanning the Boost JS
  // bundle exports + memory `feedback_iheartjane_jane_boost.md`. Caught
  // 2026-05-10 by /loop tick 52 cross-stack Permissions-Policy hardening
  // audit.
  'payment=(), usb=(), serial=(), bluetooth=(), midi=(), xr-spatial-tracking=(), magnetometer=(), accelerometer=(), gyroscope=(), ' +
  'camera=(), microphone=(), geolocation=(), interest-cohort=()';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // Suppress `X-Powered-By: Next.js` response header. Pre-fix glw + scc
  // were the lone outliers across the 6-site stack — GW + cannagent +
  // sureel + vrg all already suppress this header. Leaking framework
  // identity helps attackers target known Next.js CVEs at our specific
  // version (Vercel emits the framework name but NOT the version, so
  // the leak is "we use Next" not "we use Next 16.2.4"; still worth
  // closing as cheap defense-in-depth). Caught 2026-05-10 by /loop tick
  // 46 cross-stack X-Powered-By audit. Sister scc same-fix.
  poweredByHeader: false,
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
          // Referrer-Policy strict-origin-when-cross-origin — the lone
          // remaining 2026-05-01-removed header. Restored 2026-05-09 per
          // the same Doug directive that brought back X-Frame-Options.
          // Why safe vs iHJ Boost: Referrer-Policy controls what WE tell
          // external sites about where the user came from on outbound
          // requests — has zero interaction with iHJ's inbound trust-
          // token redemption (which is Permissions-Policy-gated; that
          // header is already in place per the WP-mirror block above).
          // Default browser behavior without this header sends full
          // URL+query string to external image hosts / analytics — a
          // privacy leak on customer-facing /loyalty?token=… surfaces
          // and any session-token-bearing query params. strict-origin-
          // when-cross-origin sends origin-only on cross-origin (path
          // + query stripped) + nothing on https-to-http downgrade.
          // Already in place on inv (next.config.ts SECURITY_HEADERS) +
          // GW + cannagent — closes the cross-site drift caught by
          // /loop saturation grind 2026-05-09 security-header audit.
          // Sister scc same fix.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Strict-Transport-Security: 2 years + includeSubDomains + preload.
          // Pre-fix Vercel served only the `max-age=63072000` default (no
          // includeSubDomains, no preload directive). GW + cannagent + sureel
          // + vrg all already serve the full directive set; glw + scc were
          // the only stack outliers. Adding the directive header doesn't
          // automatically register us on the hstspreload.org preload list —
          // that's a separate Doug-action submission. The directive in
          // isolation just CLAIMS the site is preload-ready, which costs
          // nothing if we don't submit. Caught 2026-05-10 by /loop tick 26
          // cross-stack HSTS audit. Sister scc same-push.
          //
          // Doug-action queue: when ready, submit greenlifecannabis.com
          // (apex + www) at https://hstspreload.org/ to lock browsers into
          // HTTPS-only enforcement. **Hard-to-reverse** (≥6mo to delist) —
          // confirm the apex serves clean HSTS for ≥1 month first.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Cross-Origin-Opener-Policy `same-origin` — isolates this site's
          // browsing context from cross-origin windows opened via
          // window.open(). Protects against Spectre/Meltdown side-channel
          // attacks on shared memory + against cross-origin window.opener
          // manipulation. Pre-fix glw + scc were the LONE outliers across
          // the 6-site stack — cannagent + GW + sureel + vrg all served
          // `cross-origin-opener-policy: same-origin`. (GW v2.95.10
          // changelog claimed glw + scc had it; verified absent via curl
          // 2026-05-10 — the GW note was wrong about glw + scc.) Safe vs
          // iHeartJane Boost: Boost uses iframes (not popups), and COOP
          // only affects window.open() popup browsing contexts. CORP
          // intentionally NOT set: marketing OG images need to be
          // embeddable on Twitter/Facebook/Slack share-card crawlers,
          // which would break under same-origin CORP. Caught 2026-05-10
          // by /loop tick 44 cross-stack COOP audit. Sister scc same-fix.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          // T108 — CSP Report-Only kicks off Doug-action #2 from round-3
          // close. See `CSP_REPORT_ONLY` const at top of file for full
          // rationale + safety context. Report-Only CANNOT block requests;
          // browsers log violations to DevTools Console only. Observation
          // window: ~1-2 weeks. Flip to enforce mode by changing the key
          // from `Content-Security-Policy-Report-Only` to
          // `Content-Security-Policy` (and only then will violations actually
          // block). Sister scc same-add.
          { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
        ],
      },
      // Edge-cache pin for crawler-facing files. Next 16 file conventions
      // (sitemap.ts, robots.ts, manifest.ts, icon.tsx, apple-icon.tsx,
      // opengraph-image.tsx) and static `public/*.txt` files all serve
      // `cache-control: public, max-age=0, must-revalidate` regardless of
      // the in-file `export const revalidate` declaration. Every Googlebot
      // / Bingbot / GPTBot / ClaudeBot crawl + every favicon fetch was
      // hitting Vercel function instead of CDN edge. Cross-stack port
      // from cannagent v4.685 + v4.705 + v4.725 (see memory
      // `project_cross_stack_cache_port_pending_2026_05_10`). None of
      // these paths interact with /menu or iHeartJane Boost — safe.
      {
        source: "/sitemap.xml",
        headers: [{ key: "Cache-Control", value: "public, max-age=1800, s-maxage=1800" }],
      },
      {
        source: "/robots.txt",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" }],
      },
      {
        source: "/llms.txt",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" }],
      },
      {
        source: "/icon",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400" }],
      },
      {
        // Path is `/apple-icon.png` (with `.png` suffix), not `/apple-icon`.
        // Next 16 file convention `app/apple-icon.png/route.tsx` registers
        // the route at the literal path matching the directory name —
        // including the `.png` suffix. Layout's `<link rel="apple-touch-
        // icon" href="/apple-icon.png">` matches; the prior cache rule
        // (`source: "/apple-icon"`) MISSED the actual path, so every iOS
        // Safari Add-to-Home-Screen fetch + every iOS prefetch of the
        // 180×180 PNG hit the Vercel function uncached. Verified pre-fix
        // via curl: `/apple-icon` → 404 with cached header (ironic),
        // `/apple-icon.png` → 200 with `cache-control: max-age=0,
        // must-revalidate` (Vercel default). Now: 24hr edge cache on the
        // actual path. Sister scc same-fix. Caught 2026-05-10 by /loop
        // tick 47 cross-stack /apple-icon.png cache audit.
        source: "/apple-icon.png",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400" }],
      },
      {
        source: "/icon-192.png",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400" }],
      },
      {
        source: "/icon-512.png",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400" }],
      },
      {
        source: "/favicon.ico",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400" }],
      },
      {
        source: "/opengraph-image",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" }],
      },
      {
        source: "/:path*/opengraph-image",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" }],
      },
      {
        source: "/manifest.webmanifest",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" }],
      },
      // X-Robots-Tag noindex on /api/* responses. Defense-in-depth on top
      // of robots.txt's `Disallow: /api/`. Reason: robots.txt blocks
      // crawlers from FETCHING /api URLs, but if an API URL gets shared
      // externally (Slack/Twitter unfurls, email links, accidental copy-
      // paste in a tweet), Google may still INDEX the URL without crawling
      // it — the SERP entry shows the bare URL with "No description
      // available because of robots.txt." That's the worst-of-both-worlds:
      // SERP exposure of an internal endpoint name + zero description for
      // a customer who clicks on it. The X-Robots-Tag header at response
      // level says "even if you DID get here, don't index this." Not
      // present on any of the 6 sites in the stack — caught 2026-05-10 by
      // /loop tick 38 cross-stack header audit. Pure additive: no behavior
      // change, no customer-facing effect, just a SERP-hygiene defense.
      // Sister scc + GW + cannagent + sureel + vrg pending.
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
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
      // /pricing — dispensaries publish prices ON the menu (per-product live).
      // No standalone pricing page. Inbound /pricing typists (e.g. competitor
      // research, agency directories, partner-directory typos) land on /menu
      // where the actual prices live. Caught by 2026-05-10 cross-stack 404 audit.
      { source: "/pricing", destination: "/menu", permanent: true },

      // Booking-style legacy URLs — sister of scc's same map. Mirror parity
      // closure: pre-fix `/book` + `/book-now` 404'd on Wen even though they
      // were already 308'd on Sea. Old-site nav-bar / partner-directory
      // listings on either store can use either URL pattern. Destination
      // flattened from `/order` → `/menu` direct (v8.025): /order itself
      // 307s → /menu via proxy.ts during the iHJ-Boost era, so chaining
      // /book → /order → /menu was a 3-hop redirect (extra Google crawl
      // cycle + customer latency). When the native /order eventually
      // replaces iHJ, this map gets updated as a wave alongside the
      // proxy.ts /order rewrite removal.
      { source: "/book", destination: "/menu", permanent: true },
      { source: "/book-now", destination: "/menu", permanent: true },

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

      // Legacy loyalty/rewards bookmarks → /account (Clerk sign-in lands
      // there; signed-in customers see their loyalty balance + tier).
      // Pre-fix /loyalty 404'd; legacy bookmarks from the SpringBig era
      // (pre-2026 cutover) and any external partner directory or app-store
      // listing that references "/loyalty" hit a dead URL. Caught by /loop
      // saturation grind 2026-05-09 customer-flow smoke test. /rewards
      // also 404 on glw (no rewards portal on Wenatchee — that's scc-only
      // per project_legal_entities) so route the same place.
      { source: "/loyalty", destination: "/account", permanent: true },
      { source: "/rewards", destination: "/account", permanent: true },

      // Auth-URL alias normalization. Clerk uses `/sign-in` + `/sign-up`
      // (hyphenated). The unhyphenated forms (`/signin`, `/signup`) +
      // `/login` are the most common legacy variants from WordPress, app
      // stores, partner directories. Pre-fix all four 404'd. Caught by
      // /loop saturation grind 2026-05-09 wide-path probe.
      { source: "/login", destination: "/sign-in", permanent: true },
      { source: "/signin", destination: "/sign-in", permanent: true },
      { source: "/signup", destination: "/sign-up", permanent: true },

      // Generic legacy aliases: /home is the WordPress front-page slug
      // (no-op on Next App Router where `/` IS the homepage); /sale is a
      // common e-commerce deals page alias.
      { source: "/home", destination: "/", permanent: true },
      { source: "/sale", destination: "/deals", permanent: true },

      // Round-2 legacy alias sweep (caught by /loop saturation grind
      // 2026-05-09 wide-path probe). Each row maps a frequently-bookmarked
      // alias from prior platforms (WordPress / Dutchie / iHJ public pages
      // / app-store listings / partner directories) to its canonical
      // surface on the new site.
      // Product/menu aliases:
      { source: "/jobs", destination: "/careers", permanent: true },
      { source: "/catalog", destination: "/menu", permanent: true },
      { source: "/checkout", destination: "/menu", permanent: true },
      { source: "/search", destination: "/menu", permanent: true },
      // Form-submission redirect targets (sites using Gravity Forms /
      // Contact Form 7 / Mailchimp landing-pages often default to /thanks):
      { source: "/thanks", destination: "/", permanent: true },
      { source: "/thank-you", destination: "/", permanent: true },
      { source: "/thankyou", destination: "/", permanent: true },
      // Help / support / news → semantic equivalent:
      { source: "/help", destination: "/contact", permanent: true },
      { source: "/support", destination: "/contact", permanent: true },
      { source: "/news", destination: "/blog", permanent: true },
      { source: "/story", destination: "/about", permanent: true },
      // Visit-page aliases (map/directions/hours all live on /visit):
      { source: "/map", destination: "/visit", permanent: true },
      { source: "/directions", destination: "/visit", permanent: true },
      { source: "/hours", destination: "/visit", permanent: true },
      // Age-gate aliases — gate is a modal on every page, not a separate
      // page. These were sometimes deep-linked by parent-site checkers:
      { source: "/age-verify", destination: "/", permanent: true },
      { source: "/21", destination: "/", permanent: true },
      { source: "/verify", destination: "/", permanent: true },
      // Email/SMS preferences live in the Clerk-managed account:
      { source: "/preferences", destination: "/account", permanent: true },
      { source: "/optout", destination: "/account", permanent: true },
      { source: "/opt-out", destination: "/account", permanent: true },
      { source: "/unsubscribe", destination: "/account", permanent: true },

      // Round-3 legacy alias sweep (caught by /loop saturation grind
      // 2026-05-09 wide-path probe round 3). Sister scc v10.605.
      // WordPress password-reset URL → Clerk's /sign-in (handles reset flow):
      { source: "/lost-password", destination: "/sign-in", permanent: true },
      // Cannabis customer-acquisition landing pages — first-visit deal
      // lives in the loyalty/menu flow, not on a dedicated landing page:
      { source: "/first-time", destination: "/menu", permanent: true },
      { source: "/new-customer", destination: "/menu", permanent: true },
      { source: "/first-visit", destination: "/menu", permanent: true },
      // Heroes + senior discount aliases → /deals (heroes-20 + senior-10
      // deals live there per existing deal IDs):
      { source: "/military", destination: "/deals", permanent: true },
      { source: "/veterans", destination: "/deals", permanent: true },
      { source: "/senior", destination: "/deals", permanent: true },
      // Universal e-commerce deal-page aliases:
      { source: "/promo", destination: "/deals", permanent: true },
      { source: "/promos", destination: "/deals", permanent: true },
      { source: "/offers", destination: "/deals", permanent: true },
      { source: "/coupons", destination: "/deals", permanent: true },
      { source: "/coupon", destination: "/deals", permanent: true },
      // Strain-finder semantic aliases:
      { source: "/strain-finder", destination: "/find-your-strain", permanent: true },
      { source: "/quiz", destination: "/find-your-strain", permanent: true },
      // Legacy iHJ Boost / Dutchie order-flow aliases — /menu IS the
      // canonical product surface (Boost embed):
      { source: "/book-online", destination: "/menu", permanent: true },
      { source: "/reserve", destination: "/menu", permanent: true },
      { source: "/pre-order", destination: "/menu", permanent: true },
      { source: "/preorder", destination: "/menu", permanent: true },
      { source: "/pickup-order", destination: "/menu", permanent: true },
      // Visit-page alias (location-map is what some directory listings use):
      { source: "/location-map", destination: "/visit", permanent: true },
      // Education aliases:
      { source: "/education", destination: "/learn", permanent: true },
      // Privacy-policy aliases (cookie-policy is GDPR/CCPA convention,
      // privacy-statement is enterprise-style). Both target /health-data-policy
      // — the WA Consumer Health Data Act-required privacy doc IS the public
      // privacy policy for cannabis retail (we don't collect non-health data
      // beyond the WSLCB-required ID-scan retention). Pre-fix these chained
      // through /privacy → /about which (per the audit below) is now wrong
      // because real legal pages exist at /health-data-policy + /terms-of-use.
      { source: "/cookie-policy", destination: "/health-data-policy", permanent: true },
      { source: "/privacy-statement", destination: "/health-data-policy", permanent: true },

      // Round-4 legacy alias sweep (caught by /loop saturation grind
      // 2026-05-09 wide-path probe round 4). Sister scc v10.805.
      // Generic-cannabis SEO-term aliases — partner directories + Google
      // search results use these:
      { source: "/weed", destination: "/", permanent: true },
      { source: "/marijuana", destination: "/", permanent: true },
      { source: "/cannabis", destination: "/", permanent: true },
      { source: "/dispensary", destination: "/", permanent: true },
      // PWA install flow happens via the customer account surface:
      { source: "/app", destination: "/account", permanent: true },
      { source: "/download", destination: "/account", permanent: true },
      { source: "/install", destination: "/account", permanent: true },
      // Deal-page aliases (continuation of round 2 + 3):
      { source: "/happy-hour", destination: "/deals", permanent: true },
      { source: "/daily-deal", destination: "/deals", permanent: true },
      { source: "/daily-deals", destination: "/deals", permanent: true },
      { source: "/early-bird", destination: "/deals", permanent: true },
      // Loyalty-program aliases (glw uses /account):
      { source: "/points", destination: "/account", permanent: true },
      { source: "/rewards-program", destination: "/account", permanent: true },
      { source: "/member", destination: "/account", permanent: true },
      { source: "/membership", destination: "/account", permanent: true },
      // Form-submission post-redirect aliases (sister of /thanks family):
      { source: "/success", destination: "/", permanent: true },
      { source: "/confirmed", destination: "/", permanent: true },
      { source: "/confirmation", destination: "/", permanent: true },
      // Legacy `.html`-extension URLs from WordPress / static-site predecessors:
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/home.html", destination: "/", permanent: true },
      { source: "/menu.html", destination: "/menu", permanent: true },

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
      // /privacy + /terms short-form aliases. Pre-fix all 6 redirected to
      // /about — that comment was true at the time (no real legal pages
      // existed) but is now WRONG because real pages live at:
      //   /health-data-policy  (WA Consumer Health Data Act privacy notice)
      //   /terms-of-use        (Terms of Use)
      // A customer searching "Green Life Cannabis privacy policy" landing on
      // /about (which doesn't have privacy info) was a soft-bug (technically
      // 200 but the destination didn't match user intent — and it leaked
      // canonical equity from the legal pages into /about). Re-target each
      // alias at the real destination. Caught 2026-05-10 by /loop cross-
      // stack canonical-trailing-slash sweep when /privacy + /terms titles
      // both came back as "About — …" instead of "Privacy / Terms — …".
      // Sister scc same-push.
      { source: "/privacy-policy", destination: "/health-data-policy", permanent: true },
      { source: "/privacy", destination: "/health-data-policy", permanent: true },
      { source: "/terms-of-service", destination: "/terms-of-use", permanent: true },
      { source: "/terms-and-conditions", destination: "/terms-of-use", permanent: true },
      { source: "/terms", destination: "/terms-of-use", permanent: true },
      { source: "/tos", destination: "/terms-of-use", permanent: true },

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
