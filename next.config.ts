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
