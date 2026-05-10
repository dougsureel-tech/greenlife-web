import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";

// Per-cohort OG share card. Pre-T99 /heroes/[cohort] fell back to the
// homepage opengraph-image for ALL 5 cohorts — every share-card on
// social/SMS/iMessage rendered the generic dispensary brand card instead
// of cohort-specific framing. /heroes/veterans → "We thank veterans"
// branded card · /heroes/teachers → "We thank teachers" · etc. Sister
// of glw v18.605 + scc v13.6305 OG dimension audit T48-T50 close.
//
// Caught 2026-05-10 by /loop tick 99 cross-stack OG-image audit on
// dynamic routes. Matches the existing /heroes (parent) OG style — same
// gradient, same iconography, with cohort label substituted in the H1
// slot.

export const alt = "Heroes Discount · 30% off · Green Life Cannabis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 5 cohorts mirror the slug → label mapping from app/heroes/[cohort]/
// page.tsx COHORTS const. Inlined here to keep the OG file self-
// contained (no `import { COHORTS }` dependency that would couple this
// route to page.tsx structure).
const COHORT_LABELS: Record<string, { label: string; tagline: string }> = {
  veterans: { label: "Veterans", tagline: "Thank you for your service." },
  military: { label: "Active Military", tagline: "On post or off — we've got you." },
  "first-responders": { label: "First Responders", tagline: "You answered the call." },
  healthcare: { label: "Healthcare Workers", tagline: "You took care of us." },
  teachers: { label: "Teachers", tagline: "You showed up every day." },
};

export default async function HeroesCohortOG({ params }: { params: Promise<{ cohort: string }> }) {
  const { cohort } = await params;
  const data = COHORT_LABELS[cohort] ?? { label: "Local Heroes", tagline: "We thank you." };
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
            top: 0,
            right: 0,
            width: 600,
            height: 600,
            background: "radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)",
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
            {data.label} · 30% off
          </span>
          <span
            style={{
              fontSize: 76,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 0.95,
              color: "white",
            }}
          >
            {data.tagline}
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
            greenlifecannabis.com/heroes/{cohort}
          </span>
          <span style={{ fontSize: 18, color: "#fcd34d", fontWeight: 600 }}>
            Show ID at the register
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      // Sister of v8.205 ImageResponse cache pattern — `headers` not
      // `revalidate`. Cohort copy doesn't change often; 24hr edge cache.
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=86400",
      },
    },
  );
}
