import { ImageResponse } from "next/og";
import { getBrandBySlug } from "@/lib/db";
import { STORE } from "@/lib/store";

// Per-brand OG image — generated on demand at /brands/<slug>/opengraph-image.
// Fixes the link-unfurl story: when a customer/influencer/press shares a
// brand link on Instagram/iMessage/Twitter, they get a clean branded card
// (brand name + "live at Green Life" + product count) instead of the
// generic site-wide OG. SEO win too — Google indexes the image as the
// page's primary social card.

export const alt = "Brand at Green Life Cannabis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function BrandOG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug).catch(() => null);

  // Fallback for missing brand — still render a nice card so even a 404
  // share looks intentional.
  const brandName = brand?.name ?? "Brands";
  const skuCount = brand?.activeSkus ?? 0;
  const skuLine = brand
    ? `${skuCount} product${skuCount !== 1 ? "s" : ""} in stock`
    : "Browse our brands";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          background: "linear-gradient(135deg, #022c22 0%, #064e3b 60%, #047857 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle radial accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 600,
            height: 600,
            background: "radial-gradient(circle, rgba(74,222,128,0.18) 0%, transparent 70%)",
            transform: "translate(25%, -25%)",
          }}
        />
        {/* Top row — brand mark + tagline */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: "#15803d",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
            }}
          >
            🌿
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontSize: 28, fontWeight: 800 }}>{STORE.name}</span>
            <span style={{ fontSize: 18, color: "#86efac", marginTop: 2 }}>
              Cannabis dispensary · {STORE.address.city}, WA
            </span>
          </div>
        </div>

        {/* Big middle — brand name */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            paddingTop: 30,
            paddingBottom: 30,
          }}
        >
          <span
            style={{
              fontSize: 26,
              color: "#86efac",
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Now stocked
          </span>
          <span
            style={{
              fontSize: 96,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 1,
              color: "white",
            }}
          >
            {brandName}
          </span>
          <span
            style={{
              fontSize: 32,
              color: "#bbf7d0",
              marginTop: 16,
              fontWeight: 500,
            }}
          >
            {skuLine}
          </span>
        </div>

        {/* Bottom row — URL + tagline */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            borderTop: "1px solid rgba(134,239,172,0.25)",
            paddingTop: 20,
          }}
        >
          <span style={{ fontSize: 22, color: "#86efac", fontWeight: 600 }}>
            greenlifecannabis.com/brands/{brand?.slug ?? slug}
          </span>
          <span style={{ fontSize: 18, color: "#4ade80", fontWeight: 600 }}>
            21+ · Cash only · Open daily
          </span>
        </div>
      </div>
    ),
    size,
  );
}
