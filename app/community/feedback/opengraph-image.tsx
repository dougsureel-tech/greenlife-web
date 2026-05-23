import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";

export const alt = `Suggest Something · ${STORE.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function FeedbackOG() {
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
            bottom: 0,
            left: 0,
            width: 600,
            height: 600,
            background: "radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)",
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
            Open channel
          </span>
          <span
            style={{
              fontSize: 96,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 0.98,
              color: "white",
            }}
          >
            Tell us anything.
          </span>
          <span style={{ fontSize: 26, color: "#bbf7d0", marginTop: 22, fontWeight: 500, lineHeight: 1.3 }}>
            Manager reads everything. Nobody else does.
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
            greenlifecannabis.com/community/feedback
          </span>
          <span style={{ fontSize: 18, color: "#fcd34d", fontWeight: 600 }}>
            Center Road since 2014
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
