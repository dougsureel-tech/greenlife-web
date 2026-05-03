import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";

// /community is a marketing-and-vision page Doug will hand around to alumni
// and prospective featured partners. Custom OG card matches the energy of
// the in-page hero — green-950 base with emerald + amber accents.

export const alt = `Our Community · ${STORE.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function CommunityOG() {
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
            width: 700,
            height: 700,
            background: "radial-gradient(circle, rgba(74,222,128,0.22) 0%, transparent 70%)",
            transform: "translate(25%, -25%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 500,
            height: 500,
            background: "radial-gradient(circle, rgba(251,191,36,0.14) 0%, transparent 70%)",
            transform: "translate(-25%, 25%)",
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
              Cannabis dispensary · {STORE.address.city}, WA
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
              color: "#fbbf24",
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Our Community
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
            }}
          >
            we&apos;ve worked with.
          </span>
          <span style={{ fontSize: 26, color: "#bbf7d0", marginTop: 20, fontWeight: 500, lineHeight: 1.3 }}>
            Past staff · Featured creators · Local businesses we partner with
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
            greenlifecannabis.com/community
          </span>
          <span style={{ fontSize: 18, color: "#4ade80", fontWeight: 600 }}>
            Word-of-mouth, on purpose
          </span>
        </div>
      </div>
    ),
    size,
  );
}
