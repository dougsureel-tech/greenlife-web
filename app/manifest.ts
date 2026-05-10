import type { MetadataRoute } from "next";
import { STORE } from "@/lib/store";

// Revalidate every hour at CDN edge — manifest is fully static (only
// changes at deploy boundary). Sister of inv v342.605 cross-repo port.
export const revalidate = 3600;

export default function manifest(): MetadataRoute.Manifest {
  return {
    // Stable `id` — Chrome uses for "already installed" detection across
    // www→apex redirects + identifies the app uniquely across PWA-host
    // changes. Without it, Chrome treats www + apex as 2 separate apps
    // and customers who installed before a future canonical URL change
    // would see "install again" prompts. Sister of GW manifest.ts which
    // already has `id: "/"`. Caught T119 cross-stack manifest probe —
    // glw + scc + sureel were the lone outliers without id.
    id: "/",
    name: STORE.name,
    short_name: "Green Life",
    description: `${STORE.tagline}. ${STORE.address.full}.`,
    start_url: "/",
    scope: "/",
    // `lang` + `dir` per W3C web-app-manifest spec — accessibility signal for
    // screen readers + Lighthouse PWA audit. T164 audit caught the gap on the
    // 4 non-vrg sites (vrg already had these). en-US + ltr match the rest of
    // the metadata locale. Closes board item #25 (lang/dir piece; screenshots
    // still open pending Doug-captured asset work).
    lang: "en-US",
    dir: "ltr",
    display: "standalone",
    orientation: "portrait",
    background_color: "#022c22",
    theme_color: "#022c22",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // PWA app-shortcuts (long-press the home-screen icon).
    //
    // T35 (v15.605) shipped "Order for Pickup" → /order assuming /order was
    // a real cart-able surface. T36 (v15.705) reverted: /order 307s to
    // /menu in production via proxy.ts (verified post-T35), so the shortcut
    // would just take an extra redirect hop. Doug operating-principle:
    // customer CTAs on glw + scc point to /menu ONLY — the iHJ Boost embed
    // handles cart + checkout natively (the "Order for Pickup" verb still
    // lands customers on the right place because Boost provides the order
    // flow inline). /menu shortcut kept too (parallel "browse first"
    // intent, same destination, separate label affordance). Account fix
    // (added missing description) preserved from T35. Sister scc + GW
    // same-revert.
    shortcuts: [
      { name: "Order for Pickup", short_name: "Order", url: "/menu", description: "Place a pickup order" },
      { name: "Browse Menu", short_name: "Menu", url: "/menu", description: "See what's in stock today" },
      { name: "Account", short_name: "Account", url: "/account", description: "Loyalty + order history" },
    ],
  };
}
