import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";

// /alumni OG card — gated page, mostly shared via Doug handing the URL to
// past staff. The card still exists so when alumni share it back among
// themselves ("look I'm in"), the preview reads as legit + warm rather
// than as a generic page miss.

export const alt = `Alumni · ${STORE.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function AlumniOG() {
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
          background: "linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)",
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
            background: "radial-gradient(circle, rgba(187,247,208,0.20) 0%, transparent 70%)",
            transform: "translate(25%, -25%)",
          }}
        />

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
              letterSpacing: 3,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Alumni
          </span>
          <span
            style={{
              fontSize: 76,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 1.0,
              color: "white",
            }}
          >
            Welcome back.
          </span>
          <span style={{ fontSize: 28, color: "#bbf7d0", marginTop: 22, fontWeight: 500, lineHeight: 1.3 }}>
            Past staff: claim your spot on the wall.
          </span>
        </div>

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
            greenlifecannabis.com/alumni
          </span>
          <span style={{ fontSize: 18, color: "#86efac", fontWeight: 600 }}>
            Sign in to set up your profile
          </span>
        </div>
      </div>
    ),
    size,
  );
}
