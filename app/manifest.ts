import type { MetadataRoute } from "next";
import { STORE } from "@/lib/store";

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
    shortcuts: [
      { name: "Order for Pickup", short_name: "Order", url: "/order", description: "Place a pickup order" },
      { name: "Browse Menu", short_name: "Menu", url: "/menu", description: "See what's in stock today" },
      { name: "Account", short_name: "Account", url: "/account" },
    ],
  };
}
