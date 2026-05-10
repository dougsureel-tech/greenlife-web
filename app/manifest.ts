import type { MetadataRoute } from "next";
import { STORE } from "@/lib/store";

// Revalidate every hour at CDN edge — manifest is fully static (only
// changes at deploy boundary). Sister of inv v342.605 cross-repo port.
export const revalidate = 3600;

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: STORE.name,
    short_name: "Green Life",
    description: `${STORE.tagline}. ${STORE.address.full}.`,
    start_url: "/",
    scope: "/",
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
    // PWA app-shortcuts (long-press the home-screen icon on Android/iOS).
    // Pre-v15.505 "Order for Pickup" pointed at /menu — but /menu is the
    // iHeartJane Boost embed (browse-only, no cart). Customers tapping
    // the shortcut landed on the wrong surface. /order is the real cart-
    // able ordering page (OrderMenu.tsx) — sister of T33 SearchAction
    // urlTemplate fix (same /menu vs /order confusion). /menu shortcut
    // kept for users who explicitly want to "browse first". Caught
    // 2026-05-10 by /loop tick 35 manifest audit. Sister scc same-fix.
    shortcuts: [
      { name: "Order for Pickup", short_name: "Order", url: "/order", description: "Place a pickup order" },
      { name: "Browse Menu", short_name: "Menu", url: "/menu", description: "See what's in stock today" },
      { name: "Account", short_name: "Account", url: "/account", description: "Loyalty + order history" },
    ],
  };
}
