import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";
import { STRAIN_TYPES, getStrainType } from "@/lib/strain-types";

// Per-route OG card for /strains/<type>. Sister of the /near/[town]
// per-route card — green-950 hero band identity, GLC corner mark,
// drive-time tile swapped for a strain-category subhead (botanical
// lineage from STRAIN_TYPES SSoT).
//
// Static-bake friendly: generateImageMetadata enumerates the 4 slugs
// (indica / sativa / hybrid / cbd) so Next pre-renders each card at
// build time. dynamicParams=false on /strains/[type] keeps unknown
// slugs from reaching this generator.
//
// WAC 314-55-155: card text is descriptive only — botanical name +
// shelf-category framing. NO effect/medical/promotional claims (no
// "relaxing", "energizing", "helps you sleep"). Pulls subhead directly
// from the SSoT — same lane as the on-page body copy.

export const alt = `${STORE.name} — Strain category`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({ params }: { params: Promise<{ type: string }> }) {
  const { type: slug } = await params;
  const t = getStrainType(slug) ?? STRAIN_TYPES[0];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 0,
          background:
            "linear-gradient(135deg, #022c22 0%, #064e3b 55%, #065f46 100%)",
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
              "radial-gradient(circle at 80% 20%, rgba(74,222,128,0.30), transparent 55%), radial-gradient(circle at 12% 92%, rgba(251,191,36,0.16), transparent 50%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "70px 80px 60px 80px",
            width: "100%",
          }}
        >
          {/* Top-left brand mark + store name. */}
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 56,
                height: 56,
                background: "linear-gradient(135deg, #15803d, #047857)",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 900,
                letterSpacing: -1,
                color: "white",
                boxShadow: "0 8px 32px rgba(74,222,128,0.32)",
              }}
            >
              GLC
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                lineHeight: 1.1,
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 800 }}>{STORE.name}</span>
              <span
                style={{
                  fontSize: 15,
                  color: "#86efac",
                  marginTop: 2,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                {t.eyebrow}
              </span>
            </div>
          </div>

          {/* Middle — big strain-type headline + botanical subhead. */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              maxWidth: 1040,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#fcd34d",
              }}
            >
              Strain category
            </div>
            <div
              style={{
                fontSize: 140,
                fontWeight: 900,
                lineHeight: 1.0,
                letterSpacing: -4,
                color: "white",
              }}
            >
              {t.name}
            </div>
            <div
              style={{
                fontSize: 28,
                color: "#bbf7d0",
                fontWeight: 500,
                lineHeight: 1.3,
              }}
            >
              {t.subhead}
            </div>
          </div>

          {/* Bottom — format strip + URL slug. */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 18,
                fontSize: 18,
                color: "#a7f3d0",
                fontWeight: 600,
              }}
            >
              <span>Flower</span>
              <span style={{ color: "#10b981" }}>·</span>
              <span>Pre-rolls</span>
              <span style={{ color: "#10b981" }}>·</span>
              <span>Vapes</span>
              <span style={{ color: "#10b981" }}>·</span>
              <span>Edibles</span>
            </div>
            <div style={{ fontSize: 22, color: "#86efac", fontWeight: 700 }}>
              greenlifecannabis.com/strains/{t.slug}
            </div>
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
