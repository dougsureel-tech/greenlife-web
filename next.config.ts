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

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
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
