import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Customer-facing menu + ordering live on iHeartJane while we run on
  // Dutchie POS. These redirects fire before render (real HTTP 307) and
  // short-circuit /menu and /order in the file router. The in-tree
  // /menu and /order page files are kept for when in-house menu + checkout
  // are ready — at that point delete this redirects() block.
  async redirects() {
    return [
      {
        source: "/menu",
        destination: "https://www.iheartjane.com/stores/5294/green-life-cannabis",
        permanent: false,
        basePath: false,
      },
      {
        source: "/order",
        destination: "https://www.iheartjane.com/stores/5294/green-life-cannabis",
        permanent: false,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
