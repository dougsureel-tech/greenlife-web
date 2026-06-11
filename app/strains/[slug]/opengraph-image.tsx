import { ImageResponse } from "next/og";
import { STORE } from "@/lib/store";
import { STRAINS, STRAIN_SLUGS, getStrain } from "@/lib/strains";

// Per-route OG card for /strains/<slug>. Sister of the /strains/[type]
// card — but type-color-coded (indica indigo / sativa orange / hybrid
// emerald) so the card reads at-a-glance which shelf the strain lives
// on. Big strain name, lineage subhead, THC chip, GLC corner mark.
//
// One image per dynamic route, keyed off `params.slug` below. Next serves
// it at the bare /strains/<slug>/opengraph-image URL — the exact URL the
// page's metadata advertises. (Previously this used generateImageMetadata
// returning { id: slug }, which is for emitting MULTIPLE images per route:
// it appended the id as a path segment so the real image lived at
// /opengraph-image/<id> while <head> pointed at the bare URL → every share
// card 404'd. Removed per Next 16 metadata-route convention.)
//
// WAC 314-55-155: text strictly descriptive — name + lineage + type +
// THC range. No "relaxing/energizing/sleeping" or effect language.

export const alt = `${STORE.name} — Strain library`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type TypeTheme = {
  /** Big background gradient. */
  bg: string;
  /** Radial accent overlay. */
  accent: string;
  /** Brand mark gradient. */
  mark: string;
  /** Eyebrow + URL accent. */
  fg: string;
  /** Soft body subhead color. */
  soft: string;
  /** Type-label uppercase color (the small "Sativa" badge text). */
  chip: string;
  /** Bullet separator. */
  sep: string;
  /** Type label display. */
  label: string;
};

const TYPE_THEME: Record<string, TypeTheme> = {
  indica: {
    bg: "linear-gradient(135deg, #3b0764 0%, #581c87 55%, #7e22ce 100%)",
    accent:
      "radial-gradient(circle at 80% 20%, rgba(216,180,254,0.32), transparent 55%), radial-gradient(circle at 12% 92%, rgba(233,213,255,0.16), transparent 50%)",
    mark: "linear-gradient(135deg, #9333ea, #a855f7)",
    fg: "#d8b4fe",
    soft: "#e9d5ff",
    chip: "#fcd34d",
    sep: "#c084fc",
    label: "Indica",
  },
  sativa: {
    bg: "linear-gradient(135deg, #450a0a 0%, #7f1d1d 55%, #b91c1c 100%)",
    accent:
      "radial-gradient(circle at 80% 20%, rgba(252,165,165,0.32), transparent 55%), radial-gradient(circle at 12% 92%, rgba(254,202,202,0.18), transparent 50%)",
    mark: "linear-gradient(135deg, #dc2626, #ef4444)",
    fg: "#fca5a5",
    soft: "#fecaca",
    chip: "#fef08a",
    sep: "#f87171",
    label: "Sativa",
  },
  hybrid: {
    bg: "linear-gradient(135deg, #052e16 0%, #14532d 55%, #166534 100%)",
    accent:
      "radial-gradient(circle at 80% 20%, rgba(134,239,172,0.30), transparent 55%), radial-gradient(circle at 12% 92%, rgba(251,191,36,0.16), transparent 50%)",
    mark: "linear-gradient(135deg, #15803d, #16a34a)",
    fg: "#86efac",
    soft: "#bbf7d0",
    chip: "#fcd34d",
    sep: "#22c55e",
    label: "Hybrid",
  },
  cbd: {
    bg: "linear-gradient(135deg, #422006 0%, #78350f 55%, #b45309 100%)",
    accent:
      "radial-gradient(circle at 80% 20%, rgba(252,211,77,0.30), transparent 55%), radial-gradient(circle at 12% 92%, rgba(254,240,138,0.18), transparent 50%)",
    mark: "linear-gradient(135deg, #b45309, #d97706)",
    fg: "#fcd34d",
    soft: "#fde68a",
    chip: "#fff7ed",
    sep: "#f59e0b",
    label: "CBD",
  },
};

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const strain = getStrain(slug) ?? STRAINS[STRAIN_SLUGS[0]];
  const theme = TYPE_THEME[strain.type] ?? TYPE_THEME.hybrid;

  // Strain name size scales down for longer names so a 22-char name
  // doesn't bleed past the 1040px content max-width.
  const nameLen = strain.name.length;
  const nameFontSize = nameLen <= 12 ? 130 : nameLen <= 18 ? 108 : nameLen <= 24 ? 88 : 72;

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
          {/* Top — GLC brand mark + store name + type label. */}
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
                Strain library
              </span>
            </div>
          </div>

          {/* Middle — strain name + lineage. */}
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
              {theme.label}
              {strain.thcRange ? `  ·  Typical THC ${strain.thcRange}` : ""}
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
              {strain.name}
            </div>
            {strain.lineage && (
              <div
                style={{
                  fontSize: 26,
                  color: theme.soft,
                  fontWeight: 500,
                  lineHeight: 1.3,
                  maxWidth: 1040,
                  // Truncate at ~2 lines worth of an em-dash lineage.
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {strain.lineage}
              </div>
            )}
          </div>

          {/* Bottom — flower-strip + URL. */}
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
              <span>Flower</span>
              <span style={{ color: theme.sep }}>·</span>
              <span>Pre-rolls</span>
              <span style={{ color: theme.sep }}>·</span>
              <span>Vapes</span>
              <span style={{ color: theme.sep }}>·</span>
              <span>Edibles</span>
            </div>
            <div style={{ fontSize: 22, color: theme.fg, fontWeight: 700 }}>
              greenlifecannabis.com/strains/{strain.slug}
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
