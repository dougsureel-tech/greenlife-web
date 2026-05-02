import type { NextConfig } from "next";

// Baseline security headers — applied to every response. Light-touch set
// that doesn't break Clerk, Jane Boost, Mapbox, or Algolia (all of which
// inject scripts + iframes that we need). CSP is intentionally NOT here;
// adding one means inventorying every third-party origin we use and
// keeping it in sync — separate task.
const SECURITY_HEADERS = [
  // SAMEORIGIN (not DENY) so Clerk's hosted account pages can iframe back
  // into the site if Doug ever uses the hosted-flow option.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Stops the browser from sniffing MIME types — defends against MIME
  // confusion attacks on user-uploaded assets (none today, but cheap).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // `no-referrer-when-downgrade` not `strict-origin-when-cross-origin` —
  // iHeartJane's Boost API (api.iheartjane.com/whoami + /stores/{id})
  // appears to use the Referer for partner allowlisting and silently CORS-
  // rejects requests where Referer was truncated to just the origin. The
  // earlier strict-origin policy broke /menu (MENU_LOG hypothesis #4 → confirmed).
  // no-referrer-when-downgrade still strips Referer when downgrading
  // HTTPS→HTTP (defense against accidental leaking) but preserves full
  // URL on same-protocol cross-origin requests, which is what the Boost
  // API needs.
  { key: "Referrer-Policy", value: "no-referrer-when-downgrade" },
  // Disable browser features the site doesn't use. geolocation=self only
  // because the "find a store" map widget might want it; everything else off.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=()" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  // NOTE: do NOT re-add a `redirects()` block here for /menu or /order.
  // Per Doug, /menu must stay on greenlifecannabis.com with iHeartJane
  // embedded inline (see app/menu/page.tsx + app/menu/JaneMenu.tsx).
  // A redirect bounces customers off-domain and breaks the embed model.
  //
  // If /menu renders blank, the most common cause is iHeartJane rotated
  // the Boost bundle hash and `BOOST_SCRIPT_URL` in JaneMenu.tsx now 404s.
  // Recovery recipe + diagnostic walk in
  // ~/Documents/CODE/INCIDENTS.md → "Blank /menu after iHeartJane rotated
  // the Boost bundle hash" (2026-05-01). DO NOT bounce customers
  // off-domain as a workaround — find the new hash and redeploy.
};

export default nextConfig;
