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
};

export default nextConfig;
