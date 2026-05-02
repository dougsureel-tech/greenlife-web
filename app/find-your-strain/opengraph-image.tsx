import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";

// Static OG for /find-your-strain. The quiz is one of the more shareable
// pages — "do this 30-second quiz and it picks your weed" is exactly the
// kind of thing that gets dropped in group chats. Without a per-page OG
// the share looked generic; now it reads as "interactive cannabis tool"
// at a glance.

export const alt = `Find your strain — 3-question quiz at ${STORE.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function StrainFinderOG() {
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
            🎯 30-second quiz
          </span>
          <span
            style={{
              fontSize: 96,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 0.95,
              color: "white",
            }}
          >
            Find your strain.
          </span>
          <span
            style={{
              fontSize: 28,
              color: "#bbf7d0",
              marginTop: 16,
              fontWeight: 500,
              lineHeight: 1.3,
            }}
          >
            Tell us the moment, the form, and the strain type. We&apos;ll filter the live menu down to what
            fits.
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
            greenlifecannabis.com/find-your-strain
          </span>
          <span style={{ fontSize: 18, color: "#4ade80", fontWeight: 600 }}>
            21+ · Cash only · Live menu
          </span>
        </div>
      </div>
    ),
    size,
  );
}
