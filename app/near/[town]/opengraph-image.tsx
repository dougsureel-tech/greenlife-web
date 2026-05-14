import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";
import { NEAR_TOWNS, getTown } from "@/lib/near-towns";

// Per-route OG card for /near/<town>. Sister-shape with the root
// homepage OG (green-950 base + radial green-amber wash + GLC corner
// mark + URL footer) — the only thing that swaps per page is the big
// headline (town name + ", WA"), the drive-time + route subtitle, and
// the bottom-right URL slug.
//
// Static-bake friendly: parent route's `generateStaticParams` + the
// route-level `dynamicParams=false` constrain inputs to the NEAR_TOWNS
// slug set, so Next pre-renders every card at build time. No runtime
// DB calls. The per-route file's exported `alt` is a constant — the
// per-town alt is set in page.tsx via the explicit `images: [{ url,
// width, height, alt }]` shape (so `check-og-completeness.mjs` is
// satisfied AND `check-per-route-og-image.mjs` stays clean).
//
// Visual language: matches the /near hero band redesign (glw v33.805 —
// green-950 hero with eyebrow + h1 + drive-time tile) so the share
// card carries the same identity as the page it previews.
//
// WAC 314-55-155: card text is descriptive only — drive-time + route +
// town name. No effect/medical/promotional claims.

export const alt = `${STORE.name} — Dispensary near you`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({ params }: { params: Promise<{ town: string }> }) {
  const { town: slug } = await params;
  const town = getTown(slug);
  // dynamicParams=false on the route guarantees a valid slug, but fall
  // back to the first town to keep the type non-nullable for the renderer.
  const t = town ?? NEAR_TOWNS[0];

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
        {/* Same radial mesh as the homepage card — green glow top-right,
            amber wash bottom-left. Carries depth identity across the
            whole OG family. */}
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
                Near you · {t.county}
              </span>
            </div>
          </div>

          {/* Middle — big page-specific headline + drive-time subtitle. */}
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
              Dispensary near
            </div>
            <div
              style={{
                fontSize: t.name.length > 14 ? 108 : 124,
                fontWeight: 900,
                lineHeight: 1.0,
                letterSpacing: -3,
                color: "white",
              }}
            >
              {t.name}, WA
            </div>
            <div
              style={{
                fontSize: 30,
                color: "#bbf7d0",
                fontWeight: 500,
                lineHeight: 1.3,
              }}
            >
              {t.driveMins} min via {t.highway}
            </div>
          </div>

          {/* Bottom row — short fact strip on the left + URL slug on the right. */}
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
              <span>Open daily</span>
              <span style={{ color: "#10b981" }}>·</span>
              <span>Cash only · ATM on site</span>
              <span style={{ color: "#10b981" }}>·</span>
              <span>21+</span>
            </div>
            <div
              style={{
                fontSize: 22,
                color: "#86efac",
                fontWeight: 700,
              }}
            >
              greenlifecannabis.com/near/{t.slug}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        // Layered cache headers per the v34.725 perf-bundle fix — Next 16
        // silently strips s-maxage from custom Cache-Control on metadata
        // image routes, so pair `Cache-Control` (browser respects) with
        // `Vercel-CDN-Cache-Control` (Vercel CDN respects, untouched by
        // the metadata-image pipeline). Town data is static SSoT so 1-day
        // browser + 1-day edge with 1-week SWR is safe.
        "Cache-Control": "public, max-age=86400",
        "Vercel-CDN-Cache-Control":
          "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
