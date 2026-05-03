import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";

// /our-story is the human-first counterpart to /about — built by everyone
// who's worked here, alumni roster, the warm-tone version. OG card leans
// into that with a quote-style headline and a softer green palette.

export const alt = `Our Story · ${STORE.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OurStoryOG() {
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
          background: "linear-gradient(135deg, #14532d 0%, #166534 55%, #15803d 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 600,
            height: 600,
            background: "radial-gradient(circle, rgba(187,247,208,0.18) 0%, transparent 70%)",
            transform: "translate(25%, -25%)",
          }}
        />

        {/* Top: brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: "#22c55e",
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
            <span style={{ fontSize: 18, color: "#bbf7d0", marginTop: 2 }}>
              {STORE.address.city}, WA · Since 2014
            </span>
          </div>
        </div>

        {/* Middle: pull-quote framing */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            paddingTop: 20,
            paddingBottom: 20,
          }}
        >
          <span
            style={{
              fontSize: 22,
              color: "#bbf7d0",
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Our Story
          </span>
          <span
            style={{
              fontSize: 70,
              fontWeight: 900,
              letterSpacing: -1.5,
              lineHeight: 1.05,
              color: "white",
            }}
          >
            Built by everyone
          </span>
          <span
            style={{
              fontSize: 70,
              fontWeight: 900,
              letterSpacing: -1.5,
              lineHeight: 1.05,
              color: "#86efac",
              fontStyle: "italic",
            }}
          >
            who&apos;s worked here.
          </span>
          <span style={{ fontSize: 28, color: "#bbf7d0", marginTop: 20, fontWeight: 500, lineHeight: 1.3 }}>
            12+ years on Center Road. Same crew. Same standards.
          </span>
        </div>

        {/* Bottom */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            borderTop: "1px solid rgba(187,247,208,0.25)",
            paddingTop: 20,
          }}
        >
          <span style={{ fontSize: 22, color: "#bbf7d0", fontWeight: 600 }}>
            greenlifecannabis.com/our-story
          </span>
          <span style={{ fontSize: 18, color: "#86efac", fontWeight: 600 }}>
            Doug · Kat · Charity · Wes · Shailey · Jess
          </span>
        </div>
      </div>
    ),
    size,
  );
}
