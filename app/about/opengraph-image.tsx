import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";

// /about is a top trust-decision destination — first-time customers reading
// "is this place legit?" land here from search + linked-from social posts.
// Per-page OG card leans into the Wenatchee best-staff positioning Doug
// locked 2026-05-02 instead of generic "premium dispensary" framing.

export const alt = `About ${STORE.name} — Wenatchee's best cannabis staff since 2014`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function AboutOG() {
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
          background: "linear-gradient(135deg, #022c22 0%, #064e3b 55%, #15803d 100%)",
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
            width: 700,
            height: 700,
            background: "radial-gradient(circle, rgba(74,222,128,0.22) 0%, transparent 70%)",
            transform: "translate(-25%, -25%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 500,
            height: 500,
            background: "radial-gradient(circle, rgba(251,191,36,0.10) 0%, transparent 70%)",
            transform: "translate(25%, 25%)",
          }}
        />

        {/* Top: brand identity */}
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

        {/* Middle: the headline */}
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
            About Green Life
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
            The Valley&apos;s
          </span>
          <span
            style={{
              fontSize: 76,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 1.0,
              color: "#86efac",
            }}
          >
            best cannabis staff.
          </span>
          <span style={{ fontSize: 28, color: "#bbf7d0", marginTop: 18, fontWeight: 600, lineHeight: 1.3 }}>
            Founded 2014 · Same building since opening · Curated catalog
          </span>
        </div>

        {/* Bottom: URL + credentials */}
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
            greenlifecannabis.com/about
          </span>
          <span style={{ fontSize: 18, color: "#4ade80", fontWeight: 600 }}>
            12+ years · Center Road · WSLCB {STORE.wslcbLicense}
          </span>
        </div>
      </div>
    ),
    size,
  );
}
