import { ImageResponse } from "next/og";
import { getPost } from "@/lib/posts";
import { STORE } from "@/lib/store";

// Per-post OG image. Blog posts get shared by the press/influencer
// audience (someone writes about cannabis education and wants to cite
// our guide). Generic site-wide OG made every share unfurl the same;
// per-post image puts the headline in the card so the link reads as
// content, not as a navigation crumb.

export const alt = "Cannabis guide at Green Life";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CATEGORY_TONE: Record<string, { eyebrow: string; emoji: string }> = {
  Guide: { eyebrow: "Guide", emoji: "📘" },
  "Vendor Spotlight": { eyebrow: "Vendor Spotlight", emoji: "🌿" },
  Education: { eyebrow: "Cannabis 101", emoji: "🎓" },
  Local: { eyebrow: "Local", emoji: "🏔️" },
};

export default async function PostOG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);

  const title = post?.title ?? "Cannabis guides";
  const description = post?.description ?? "Education, vendor spotlights, and local guides.";
  const eyebrowKey = post?.category ?? "Guide";
  const tone = CATEGORY_TONE[eyebrowKey] ?? CATEGORY_TONE.Guide;
  const minsLine = post?.readingMinutes ? `${post.readingMinutes} min read` : "";

  // Headline scales with length so even a 90-char title still fits.
  const titleSize = title.length > 70 ? 64 : title.length > 45 ? 76 : 92;

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
            background: "radial-gradient(circle, rgba(74,222,128,0.18) 0%, transparent 70%)",
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

        {/* Title block */}
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
              color: "#86efac",
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            {tone.emoji} {tone.eyebrow}
            {minsLine && <span style={{ color: "#4ade80", marginLeft: 12 }}>· {minsLine}</span>}
          </span>
          <span
            style={{
              fontSize: titleSize,
              fontWeight: 900,
              letterSpacing: -1.5,
              lineHeight: 1.05,
              color: "white",
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontSize: 24,
              color: "#bbf7d0",
              marginTop: 18,
              fontWeight: 400,
              lineHeight: 1.4,
            }}
          >
            {description.length > 110 ? description.slice(0, 107) + "…" : description}
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
            greenlifecannabis.com/blog/{slug}
          </span>
          <span style={{ fontSize: 18, color: "#4ade80", fontWeight: 600 }}>21+ · Cash only</span>
        </div>
      </div>
    ),
    size,
  );
}
