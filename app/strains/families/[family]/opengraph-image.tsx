import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";
import { STRAINS } from "@/lib/strains";
import {
  STRAIN_FAMILIES,
  FAMILY_SLUGS,
  getFamily,
  getStrainsInFamily,
} from "@/lib/strain-families";

// Per-route OG card for /strains/families/<family>. Sister of the
// /strains/[slug] OG generator — type-color-coded by the anchor strain
// (e.g. Kush = OG Kush hybrid → emerald, Northern Lights = indica →
// indigo). Reads as a sibling card system on SERP + social shares.
//
// Pre-bakes all 10 family cards at build time via generateImageMetadata
// so the CDN has every card cached before any wave bump.
//
// WAC 314-55-155: text strictly descriptive — family name + member
// names + founder + tenure footer. No effect/medical language.

export const alt = `${STORE.name} — Strain Family Album`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateImageMetadata() {
  return FAMILY_SLUGS.map((slug) => ({ id: slug }));
}

type TypeTheme = {
  bg: string;
  accent: string;
  mark: string;
  fg: string;
  soft: string;
  chip: string;
  sep: string;
};

const TYPE_THEME: Record<string, TypeTheme> = {
  indica: {
    bg: "linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #4338ca 100%)",
    accent:
      "radial-gradient(circle at 80% 20%, rgba(165,180,252,0.32), transparent 55%), radial-gradient(circle at 12% 92%, rgba(192,132,252,0.16), transparent 50%)",
    mark: "linear-gradient(135deg, #4f46e5, #6366f1)",
    fg: "#a5b4fc",
    soft: "#c7d2fe",
    chip: "#fcd34d",
    sep: "#818cf8",
  },
  sativa: {
    bg: "linear-gradient(135deg, #431407 0%, #7c2d12 55%, #c2410c 100%)",
    accent:
      "radial-gradient(circle at 80% 20%, rgba(253,186,116,0.32), transparent 55%), radial-gradient(circle at 12% 92%, rgba(252,211,77,0.18), transparent 50%)",
    mark: "linear-gradient(135deg, #ea580c, #f97316)",
    fg: "#fdba74",
    soft: "#fed7aa",
    chip: "#fef08a",
    sep: "#fb923c",
  },
  hybrid: {
    bg: "linear-gradient(135deg, #022c22 0%, #064e3b 55%, #065f46 100%)",
    accent:
      "radial-gradient(circle at 80% 20%, rgba(74,222,128,0.30), transparent 55%), radial-gradient(circle at 12% 92%, rgba(251,191,36,0.16), transparent 50%)",
    mark: "linear-gradient(135deg, #15803d, #047857)",
    fg: "#86efac",
    soft: "#bbf7d0",
    chip: "#fcd34d",
    sep: "#10b981",
  },
  landrace: {
    bg: "linear-gradient(135deg, #1c1917 0%, #292524 55%, #44403c 100%)",
    accent:
      "radial-gradient(circle at 80% 20%, rgba(214,211,209,0.18), transparent 55%), radial-gradient(circle at 12% 92%, rgba(168,162,158,0.12), transparent 50%)",
    mark: "linear-gradient(135deg, #57534e, #78716c)",
    fg: "#d6d3d1",
    soft: "#e7e5e4",
    chip: "#fcd34d",
    sep: "#a8a29e",
  },
};

export default async function OG({
  params,
}: {
  params: Promise<{ family: string }>;
}) {
  const { family } = await params;
  const fam = getFamily(family) ?? STRAIN_FAMILIES[0];
  const anchor = fam.anchorSlug ? STRAINS[fam.anchorSlug] : null;
  const themeKey = anchor?.type ?? "landrace";
  const theme = TYPE_THEME[themeKey] ?? TYPE_THEME.hybrid;

  const members = getStrainsInFamily(fam.slug);
  const previewNames = members.slice(0, 5).map((m) => m.name);
  const moreCount = Math.max(0, members.length - previewNames.length);
  const memberLine =
    previewNames.join("  ·  ") +
    (moreCount > 0 ? `  ·  +${moreCount} more` : "");

  const nameLen = fam.name.length;
  const nameFontSize = nameLen <= 16 ? 100 : nameLen <= 22 ? 84 : nameLen <= 28 ? 72 : 60;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 0,
          background: theme.bg,
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
            backgroundImage: theme.accent,
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
          {/* Top — brand mark + store name + family-album label. */}
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 56,
                height: 56,
                background: theme.mark,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 900,
                letterSpacing: -1,
                color: "white",
                boxShadow: "0 8px 32px rgba(0,0,0,0.32)",
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
                  color: theme.fg,
                  marginTop: 2,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                Strain Family Album
              </span>
            </div>
          </div>

          {/* Middle — family name + member preview. */}
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
                color: theme.chip,
              }}
            >
              {members.length} STRAIN{members.length === 1 ? "" : "S"}
              {anchor ? `  ·  FOUNDED BY ${anchor.name.toUpperCase()}` : "  ·  PRE-MODERN SHELF"}
            </div>
            <div
              style={{
                fontSize: nameFontSize,
                fontWeight: 900,
                lineHeight: 1.0,
                letterSpacing: -3,
                color: "white",
              }}
            >
              {fam.name}
            </div>
            {memberLine && (
              <div
                style={{
                  fontSize: 24,
                  color: theme.soft,
                  fontWeight: 500,
                  lineHeight: 1.3,
                  maxWidth: 1040,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {memberLine}
              </div>
            )}
          </div>

          {/* Bottom — tenure strip + URL. */}
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
                color: theme.soft,
                fontWeight: 600,
              }}
            >
              <span>Wenatchee Valley</span>
              <span style={{ color: theme.sep }}>·</span>
              <span>Since 2014</span>
            </div>
            <div style={{ fontSize: 20, color: theme.fg, fontWeight: 700 }}>
              greenlifecannabis.com/strains/families/{fam.slug}
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
