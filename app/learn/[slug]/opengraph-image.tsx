import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";
import { LEARN_HUB_TOPICS, getLearnHubTopic } from "@/lib/learn-hub";

// Per-route OG card for /learn/<slug>. Sister of /near/[town] +
// /strains/[type] — same green-950 hero band identity, GLC corner mark,
// page-specific topic title + eyebrow kicker pulled from LEARN_HUB_TOPICS.
//
// Static-bake friendly: generateImageMetadata enumerates each topic slug
// so Next pre-renders cards at build time. dynamicParams=false on
// /learn/[slug] keeps unknown slugs from reaching this generator.
//
// WAC 314-55-155: card text is educational/descriptive only. Title and
// eyebrow come straight from the SSoT — same copy that survived the
// long-form body's compliance lane (no effect/medical/promissory claims).

export const alt = `${STORE.name} — Cannabis 101 long-form guide`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = getLearnHubTopic(slug) ?? LEARN_HUB_TOPICS[0];

  // The topic title is up to ~70 chars; ramp the type size by length so
  // the longest titles still fit inside the 1040-wide content area.
  const titleSize =
    topic.title.length > 56 ? 64 : topic.title.length > 40 ? 76 : 92;

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
                Cannabis 101 · Long-form guide
              </span>
            </div>
          </div>

          {/* Middle — eyebrow kicker + big topic title. */}
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
              {topic.eyebrow}
            </div>
            <div
              style={{
                fontSize: titleSize,
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: -2.5,
                color: "white",
              }}
            >
              {topic.title}
            </div>
          </div>

          {/* Bottom — context strip + URL slug. */}
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
              <span>Read at the counter</span>
              <span style={{ color: "#10b981" }}>·</span>
              <span>Wenatchee Valley</span>
              <span style={{ color: "#10b981" }}>·</span>
              <span>21+</span>
            </div>
            <div style={{ fontSize: 22, color: "#86efac", fontWeight: 700 }}>
              greenlifecannabis.com/learn/{topic.slug}
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
