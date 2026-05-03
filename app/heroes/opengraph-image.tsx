import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";

// /heroes OG card — when shared on social or in support-network group
// chats ("hey, this place gives 20% to nurses"), the preview should
// signal the program clearly with the cohort + percent + ID line.

export const alt = `Heroes Discount · 20% off · ${STORE.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function HeroesOG() {
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
          background: "linear-gradient(135deg, #022c22 0%, #064e3b 50%, #15803d 100%)",
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
            background: "radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)",
            transform: "translate(25%, -25%)",
          }}
        />

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
              {STORE.address.city}, WA
            </span>
          </div>
        </div>

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
              color: "#fcd34d",
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Heroes Discount
          </span>
          <span
            style={{
              fontSize: 88,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 0.95,
              color: "white",
            }}
          >
            We support
          </span>
          <span
            style={{
              fontSize: 88,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 0.95,
              color: "#fcd34d",
              marginTop: 4,
            }}
          >
            local heroes.
          </span>
          <span style={{ fontSize: 26, color: "#bbf7d0", marginTop: 22, fontWeight: 600, lineHeight: 1.3 }}>
            20% off · Active military · Veterans · First responders · Healthcare · Teachers
          </span>
        </div>

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
            greenlifecannabis.com/heroes
          </span>
          <span style={{ fontSize: 18, color: "#fcd34d", fontWeight: 600 }}>
            Show ID at the register
          </span>
        </div>
      </div>
    ),
    size,
  );
}
