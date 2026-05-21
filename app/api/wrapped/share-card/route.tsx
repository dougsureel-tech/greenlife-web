import { ImageResponse } from "next/og";
import { NextResponse, type NextRequest } from "next/server";

import {
  CURRENT_WRAPPED_YEAR,
  getPreviewRecap,
  getWrappedRecap,
  isWrappedEnabled,
  type WrappedRecap,
} from "@/lib/wrapped";
import { STORE } from "@/lib/store";

// Server-rendered PNG share-card for Year-in-Strains Wrapped.
//
// Shapes:
//   ?shape=portrait → 1080×1920 (IG/TikTok story default)
//   ?shape=square   → 1080×1080
//
// Query params:
//   year=2026               → which year's recap to render
//   preview=1               → use the mock fixture (works whether flag
//                             is ON or OFF — Doug+Kat+Austin smoke-test)
//   customerId=<id>         → reserved for the Phase 4.2 real-data path;
//                             today the share-card only renders mock OR
//                             the signed-in customer's recap (out of
//                             scope here — auth + customerId param
//                             cross-check belongs in the same swap).
//
// Compliance:
//   - NO photos of people. Typography + brand mark only.
//   - WAC 314-55-155: every dynamic string is a celebratory/descriptive
//     stat from the recap, never an effect/medical claim.
//
// Cache-Control: layered per `feedback_imageresponse_cache_pattern` — the
// `Vercel-CDN-Cache-Control` is required because next/og's ImageResponse
// silently strips s-maxage from the standard Cache-Control header.

export const runtime = "edge";

const PORTRAIT = { width: 1080, height: 1920 };
const SQUARE = { width: 1080, height: 1080 };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const previewMode =
    searchParams.get("preview") === "1" || searchParams.get("preview") === "true";
  const enabled = isWrappedEnabled();

  if (!enabled && !previewMode) {
    return NextResponse.json({ error: "wrapped_disabled" }, { status: 404 });
  }

  const shape = searchParams.get("shape") === "square" ? "square" : "portrait";
  const size = shape === "square" ? SQUARE : PORTRAIT;

  const yearParam = Number.parseInt(searchParams.get("year") ?? "", 10);
  const year =
    Number.isFinite(yearParam) && yearParam >= 2020 && yearParam <= 2099
      ? yearParam
      : CURRENT_WRAPPED_YEAR;

  // For the mock-data ship: preview mode (and flag-off) always renders
  // the fixture. Phase 4.2 real-data path will wire signed-in customer's
  // session in here instead of "preview-customer".
  let recap: WrappedRecap | null = null;
  if (previewMode) {
    recap = getPreviewRecap();
  } else {
    // Real path placeholder — same 1-line swap as the page.
    const customerId = searchParams.get("customerId") ?? "preview-customer";
    recap = await getWrappedRecap(customerId, year, { preview: false });
    if (!recap) recap = getPreviewRecap();
  }

  const top3 = recap.topStrains.slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: shape === "square" ? "70px 80px" : "120px 80px",
          background:
            "linear-gradient(160deg, #052e16 0%, #14532d 45%, #166534 100%)",
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
              "radial-gradient(circle at 80% 15%, rgba(110,231,183,0.35), transparent 55%), radial-gradient(circle at 15% 90%, rgba(190,242,100,0.20), transparent 55%)",
          }}
        />

        {/* Top — brand mark + year eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            position: "relative",
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 99,
              background: "#6ee7b7",
              boxShadow: "0 0 36px #6ee7b7",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
            <span style={{ fontSize: 30, fontWeight: 800 }}>{STORE.name}</span>
            <span
              style={{
                fontSize: 18,
                color: "#a7f3d0",
                marginTop: 4,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              Year {year} in Strains
            </span>
          </div>
        </div>

        {/* Middle — name + stat stack */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            position: "relative",
            maxWidth: shape === "square" ? 880 : 940,
          }}
        >
          <div
            style={{
              fontSize: shape === "square" ? 56 : 72,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: "white",
            }}
          >
            {recap.customerName}&rsquo;s year on the shelf.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {top3.length > 0 ? (
              <StatRow
                eyebrow="Top strains"
                value={top3.map((s) => s.name).join(" · ")}
              />
            ) : null}
            {recap.topFamilyName ? (
              <StatRow
                eyebrow="Top family"
                value={
                  recap.topFamilyCoverage
                    ? `${recap.topFamilyName} — ${recap.topFamilyCoverage.explored} of ${recap.topFamilyCoverage.total}`
                    : recap.topFamilyName
                }
              />
            ) : null}
            {recap.dominantTerpene ? (
              <StatRow
                eyebrow="Aroma palette"
                value={`${recap.dominantTerpene.label} · ${recap.dominantTerpene.note}`}
              />
            ) : null}
            <StatRow
              eyebrow="Year in numbers"
              value={`${recap.totalStrainsTried} strains · ${recap.totalPurchases} visits`}
            />
          </div>
        </div>

        {/* Bottom — handle + brand line */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 22,
              fontSize: 22,
              color: "#a7f3d0",
              fontWeight: 600,
            }}
          >
            <span>Receipt-verified</span>
            <span style={{ color: "#34d399" }}>·</span>
            <span>{STORE.address.city}</span>
          </div>
          <div style={{ fontSize: 22, color: "#6ee7b7", fontWeight: 700 }}>
            greenlifecannabis.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        "Cache-Control": "public, max-age=86400",
        "Vercel-CDN-Cache-Control":
          "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}

function StatRow({ eyebrow, value }: { eyebrow: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: "#fde047",
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          fontSize: 34,
          fontWeight: 700,
          color: "white",
          lineHeight: 1.25,
        }}
      >
        {value}
      </div>
    </div>
  );
}
