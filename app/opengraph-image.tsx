import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";

// Homepage OG card — what shows in iMessage / Slack / Twitter / Facebook /
// LinkedIn previews when greenlifecannabis.com gets pasted. Built to match
// the homepage hero v2 energy that just shipped (commit 6fcaf1e):
// dark green-950 base, radial green-400 glow upper-right, warm amber wash
// bottom-left for the "evergreen + sunset" PNW vibe, big bold headline,
// and the right-side "Serves the Wenatchee Valley" pill cluster reusing
// the same town list as the homepage hero (STORE.nearbyTowns).
//
// Self-contained on purpose — no DB, no JSON-LD imports, no Clerk. Runs
// statically at build time + on-demand for new edges, must stay fast.

export const alt = `${STORE.name} — Wenatchee's Premier Cannabis Dispensary`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Top 4 towns from STORE.nearbyTowns (skipping "Wenatchee" itself since
// the headline already says it) for the right-side service-area cluster.
const VALLEY_PILLS = ["Cashmere", "Leavenworth", "East Wenatchee", "Lake Chelan"];

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 0,
          background: "linear-gradient(135deg, #022c22 0%, #064e3b 55%, #065f46 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Same depth treatment as the homepage hero — radial green glow
            top-right, warm amber wash bottom-left. Without these the card
            reads as a flat gradient and loses all the energy of the live
            page it's meant to preview. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle at 80% 20%, rgba(74,222,128,0.32), transparent 55%), radial-gradient(circle at 12% 92%, rgba(251,191,36,0.16), transparent 50%)",
          }}
        />

        {/* Left column — brand mark, headline, address + status pill, URL. */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "70px 70px 60px 80px",
            width: 760,
            flexShrink: 0,
          }}
        >
          {/* GLC corner logo — boxed leaf glyph + wordmark. */}
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 64,
                height: 64,
                background: "linear-gradient(135deg, #15803d, #047857)",
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: -1,
                color: "white",
                boxShadow: "0 8px 32px rgba(74,222,128,0.35)",
              }}
            >
              GLC
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <span style={{ fontSize: 26, fontWeight: 800 }}>{STORE.name}</span>
              <span style={{ fontSize: 17, color: "#86efac", marginTop: 2, letterSpacing: 1 }}>
                {`WSLCB · LIC ${STORE.wslcbLicense} · 21+`}
              </span>
            </div>
          </div>

          {/* Headline + subtitle block. */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontSize: 78,
                fontWeight: 900,
                lineHeight: 1.02,
                letterSpacing: -2.5,
                color: "white",
              }}
            >
              Wenatchee's Premier Cannabis
            </div>
            <div style={{ fontSize: 26, color: "#bbf7d0", fontWeight: 500, lineHeight: 1.3 }}>
              {`${STORE.address.street} · ${STORE.address.city}, ${STORE.address.state}`}
            </div>

            {/* Live status pill — pulse dot + hours range. Hardcoded
                copy ("Open daily · 8 AM – 11 PM") since OG runs at build
                time and we don't want the card flickering open/closed. */}
            <div
              style={{
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 18px",
                borderRadius: 999,
                background: "rgba(16,185,129,0.18)",
                border: "1px solid rgba(74,222,128,0.45)",
                alignSelf: "flex-start",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 99,
                  background: "#4ade80",
                  boxShadow: "0 0 16px #4ade80",
                }}
              />
              <span style={{ fontSize: 20, fontWeight: 700, color: "#bbf7d0" }}>
                Open daily · 8 AM – 11 PM
              </span>
            </div>
          </div>

          {/* Footer URL + amenity strip. */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                display: "flex",
                gap: 18,
                fontSize: 18,
                color: "#a7f3d0",
                fontWeight: 600,
              }}
            >
              <span>Cash only</span>
              <span style={{ color: "#10b981" }}>·</span>
              <span>ATM on site</span>
              <span style={{ color: "#10b981" }}>·</span>
              <span>Free parking</span>
            </div>
            <div style={{ fontSize: 22, color: "#86efac", fontWeight: 700 }}>
              greenlifecannabis.com
            </div>
          </div>
        </div>

        {/* Right column — "Serves the Wenatchee Valley" pill cluster. */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "70px 70px 60px 30px",
            flex: 1,
            borderLeft: "1px solid rgba(74,222,128,0.18)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 22,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 99,
                background: "#fbbf24",
                boxShadow: "0 0 12px rgba(251,191,36,0.7)",
              }}
            />
            <span
              style={{
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#fcd34d",
              }}
            >
              Serves the Valley
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            {VALLEY_PILLS.map((town) => (
              <div
                key={town}
                style={{
                  padding: "12px 22px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(187,247,208,0.28)",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "white",
                  display: "flex",
                }}
              >
                {town}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
