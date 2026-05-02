import { ImageResponse } from "next/og";
import { getDealById } from "@/lib/db";
import { STORE } from "@/lib/store";

// Per-deal OG image. Deal links get shared a LOT (SMS forwards, IG stories,
// Reddit r/WAdispensaries threads). Without this every share unfurled with
// the same site-wide OG; now the recipient sees the actual deal — "20% off
// Flower · ends Sat" — at glance. Higher click-through than a generic card,
// every time.

export const alt = "Deal at Green Life Cannabis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function fmtEndDate(iso: string | null): string {
  if (!iso) return "Ongoing — no end date";
  const d = new Date(`${iso}T12:00:00`);
  return `Ends ${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`;
}

export default async function DealOG({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deal = await getDealById(id).catch(() => null);

  const headline = deal?.short ?? "Deals";
  const sub = deal?.name ?? "Browse current deals";
  const endLine = deal ? fmtEndDate(deal.endDate) : "";

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
            background: "radial-gradient(circle, rgba(74,222,128,0.22) 0%, transparent 70%)",
            transform: "translate(25%, -25%)",
          }}
        />
        {/* Top — store identity */}
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

        {/* Big — the deal headline */}
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
              color: "#bef264",
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            🔥 Deal
          </span>
          <span
            style={{
              fontSize: 110,
              fontWeight: 900,
              letterSpacing: -3,
              lineHeight: 0.95,
              color: "white",
            }}
          >
            {headline}
          </span>
          {sub !== headline && (
            <span
              style={{
                fontSize: 30,
                color: "#bbf7d0",
                marginTop: 18,
                fontWeight: 500,
              }}
            >
              {sub}
            </span>
          )}
        </div>

        {/* Bottom — end date + URL */}
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
            greenlifecannabis.com/deals
          </span>
          <span style={{ fontSize: 22, color: deal?.endDate ? "#fde047" : "#86efac", fontWeight: 700 }}>
            {endLine || "21+ · Cash only"}
          </span>
        </div>
      </div>
    ),
    size,
  );
}
