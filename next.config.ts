import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
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
