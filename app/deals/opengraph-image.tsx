import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";

// Per-route OG card for /deals — same template family as the homepage.
// Headline reads as a "deals are live" hook; right column shows the
// always-on savings ladder customers can stack.

export const alt = `Today's cannabis deals at ${STORE.name} in ${STORE.address.city}, WA`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SAVINGS_PILLS = [
  "15% off online orders",
  "Loyalty rewards",
  "Military discounts",
  "Daily specials",
];

export default function DealsOG() {
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
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle at 80% 20%, rgba(74,222,128,0.32), transparent 55%), radial-gradient(circle at 12% 92%, rgba(251,191,36,0.20), transparent 50%)",
          }}
        />

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
              <span style={{ fontSize: 17, color: "#fcd34d", marginTop: 2, letterSpacing: 1 }}>
                {`Daily Deals · ${STORE.address.city}, WA`}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontSize: 82,
                fontWeight: 900,
                lineHeight: 1.02,
                letterSpacing: -2.5,
                color: "white",
              }}
            >
              Today's Deals
            </div>
            <div style={{ fontSize: 28, color: "#bbf7d0", fontWeight: 500, lineHeight: 1.3 }}>
              {`Live cannabis specials at ${STORE.name}`}
            </div>

            <div
              style={{
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 18px",
                borderRadius: 999,
                background: "rgba(251,191,36,0.18)",
                border: "1px solid rgba(251,191,36,0.45)",
                alignSelf: "flex-start",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 99,
                  background: "#fbbf24",
                  boxShadow: "0 0 16px rgba(251,191,36,0.8)",
                }}
              />
              <span style={{ fontSize: 20, fontWeight: 700, color: "#fcd34d" }}>
                Updated daily · WSLCB-compliant
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 18, color: "#a7f3d0", fontWeight: 600 }}>
              Open daily 8 AM – 9 PM (Fri/Sat til 11) · Cash only · 21+
            </div>
            <div style={{ fontSize: 22, color: "#86efac", fontWeight: 700 }}>
              greenlifecannabis.com/deals
            </div>
          </div>
        </div>

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
              Always on
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
            {SAVINGS_PILLS.map((pill) => (
              <div
                key={pill}
                style={{
                  padding: "12px 22px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(187,247,208,0.28)",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "white",
                  display: "flex",
                }}
              >
                {pill}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
