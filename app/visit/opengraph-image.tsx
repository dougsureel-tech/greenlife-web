import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";

// /visit gets shared a lot ("here's where to go") — SMS forwards, group
// chats, "let's stop on the way" texts. Per-page OG turns those shares
// into real previews with the actual address and phone right in the card.

export const alt = `Visit ${STORE.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function VisitOG() {
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
            paddingTop: 30,
            paddingBottom: 30,
          }}
        >
          <span
            style={{
              fontSize: 24,
              color: "#86efac",
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            📍 Visit us
          </span>
          <span
            style={{
              fontSize: 64,
              fontWeight: 900,
              letterSpacing: -1,
              lineHeight: 1.05,
              color: "white",
            }}
          >
            {STORE.address.street}
          </span>
          <span style={{ fontSize: 36, color: "#bbf7d0", marginTop: 8, fontWeight: 600 }}>
            {STORE.address.city}, {STORE.address.state} {STORE.address.zip}
          </span>
          <span style={{ fontSize: 28, color: "#4ade80", marginTop: 18, fontWeight: 600 }}>
            {STORE.phone} · Open 8 AM daily, later Fri & Sat
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
            greenlifecannabis.com/visit
          </span>
          <span style={{ fontSize: 18, color: "#4ade80", fontWeight: 600 }}>
            Free parking · ATM on-site · ADA
          </span>
        </div>
      </div>
    ),
    size,
  );
}
