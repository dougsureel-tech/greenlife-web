import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";

export const alt = `${STORE.name} — Cannabis Dispensary in ${STORE.address.city}, WA`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
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
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          // Same depth treatment as the homepage hero — green top-right +
          // warm amber bottom-left for "evergreen + sunset" PNW vibe.
          backgroundImage:
            "radial-gradient(circle at 80% 20%, rgba(74,222,128,0.30), transparent 60%), radial-gradient(circle at 15% 90%, rgba(251,191,36,0.15), transparent 55%)",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 99,
            background: "#4ade80",
            boxShadow: "0 0 24px #4ade80",
          }}
        />
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#86efac",
          }}
        >
          {STORE.address.city}, {STORE.address.state}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
        <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 1.05, letterSpacing: -2 }}>{STORE.name}</div>
        <div style={{ fontSize: 36, color: "#bbf7d0", fontWeight: 500, maxWidth: 900 }}>{STORE.tagline}</div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", gap: 28, fontSize: 22, color: "#a7f3d0", fontWeight: 600 }}>
          <span>Open daily</span>
          <span style={{ color: "#10b981" }}>·</span>
          <span>Cash only</span>
          <span style={{ color: "#10b981" }}>·</span>
          <span>21+</span>
          <span style={{ color: "#10b981" }}>·</span>
          <span>ATM on site</span>
        </div>
        <div style={{ fontSize: 20, color: "#86efac", fontWeight: 500 }}>greenlifecannabis.com</div>
      </div>
    </div>,
    { ...size },
  );
}
