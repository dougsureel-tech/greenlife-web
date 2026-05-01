import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Customer-facing menu + ordering live on iHeartJane while we run on
  // Dutchie POS / Springbig loyalty. These redirects fire before render
  // (real HTTP 307) and short-circuit /menu and /order in the file router.
  // When the in-house menu + checkout are ready, delete this `redirects`
  // block — the original /menu and /order pages are still in-tree.
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
