import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";

// /press OG card — when journalists/bloggers/podcasters share the press
// kit URL on Slack/Twitter/LinkedIn, the preview card should look like a
// professional press kit, not a marketing slab. Clean, fact-first.

export const alt = `Press kit · ${STORE.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function PressOG() {
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
          background: "#022c22",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle dot pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 80% 20%, rgba(74,222,128,0.10) 0%, transparent 50%)",
          }}
        />

        {/* Top: brand block + press tag */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
              padding: "8px 16px",
              border: "1.5px solid #4ade80",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 700,
              color: "#4ade80",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Press · Media Kit
          </div>
        </div>

        {/* Middle: title + dek */}
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
              fontSize: 84,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 1.0,
              color: "white",
            }}
          >
            Press resources for
          </span>
          <span
            style={{
              fontSize: 84,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 1.0,
              color: "#86efac",
              marginTop: 4,
            }}
          >
            Green Life Cannabis.
          </span>
          <span style={{ fontSize: 26, color: "#bbf7d0", marginTop: 22, fontWeight: 500, lineHeight: 1.3 }}>
            Logo · photos · fact sheet · founder quote · contact
          </span>
        </div>

        {/* Bottom: facts strip */}
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
            greenlifecannabis.com/press
          </span>
          <span style={{ fontSize: 18, color: "#4ade80", fontWeight: 600 }}>
            Founded 2014 · WSLCB License {STORE.wslcbLicense}
          </span>
        </div>
      </div>
    ),
    size,
  );
}
