// Compact SVG mini-tree for family-album tiles + per-family hero spotlight.
//
// Dialed-down fork of `StrainLineageTree.tsx` (DO NOT mutate the
// original — the original is load-bearing for per-strain /strains/[slug]
// pages and is sized for full-page hero). This component renders the
// same color-coded lineage idea at thumbnail/spotlight scale.
//
// Differences from the original:
//   - Smaller viewBox (320×140 vs 720×400)
//   - Caps at 3 descendants for thumbnail clarity (vs 5/row in the original)
//   - 0 sibling chips (the chip row was the largest part of the original
//     and doesn't make sense at thumbnail size)
//   - Tier labels removed (visual noise at small size)
//   - Smaller font (10px vs 12-15px in original)
//   - No xlink:href anchors — the tile itself wraps in <Link>, so internal
//     anchors would create nested-link a11y warnings
//
// Used by:
//   - `components/FamilyAlbumGrid.tsx` (per-tile thumbnail)
//   - `app/strains/families/[family]/page.tsx` (hero spotlight, larger size variant)
//
// Per Doug doctrine: server-renderable SVG (zero JS), `text` + `rect`
// elements only. Static layout, no physics, no D3.

import type { Strain } from "@/lib/strains";

interface MiniNode {
  slug: string | null;
  name: string;
  type?: Strain["type"];
}

interface FamilyMiniTreeProps {
  /** The anchor strain at center. */
  center: { name: string; type?: Strain["type"]; slug?: string };
  /** Up to 2 parents (or "(landrace)" if pure-line). */
  parents?: readonly MiniNode[];
  /** Up to 3 descendants — most prominent crosses from this anchor. */
  descendants?: readonly MiniNode[];
  /** Size variant — "thumb" (320×140, for tiles) or "spotlight" (480×220, for hero). */
  size?: "thumb" | "spotlight";
  /** Optional accessible label. */
  ariaLabel?: string;
}

const TYPE_COLORS: Record<
  NonNullable<MiniNode["type"]>,
  { fill: string; stroke: string; text: string }
> = {
  indica: { fill: "#7e22ce", stroke: "#9333ea", text: "#fff" },
  sativa: { fill: "#b91c1c", stroke: "#dc2626", text: "#fff" },
  hybrid: { fill: "#15803d", stroke: "#16a34a", text: "#fff" },
};
const UNKNOWN_COLOR = { fill: "#57534e", stroke: "#78716c", text: "#fff" };

export function FamilyMiniTree({
  center,
  parents = [],
  descendants = [],
  size = "thumb",
  ariaLabel,
}: FamilyMiniTreeProps) {
  const isSpotlight = size === "spotlight";
  const VBW = isSpotlight ? 480 : 320;
  const VBH = isSpotlight ? 220 : 140;
  const NODE_W = isSpotlight ? 110 : 78;
  const NODE_H = isSpotlight ? 26 : 22;
  const CENTER_W = isSpotlight ? 150 : 100;
  const CENTER_H = isSpotlight ? 32 : 26;
  const TIER_Y_PARENT = isSpotlight ? 22 : 14;
  const TIER_Y_CENTER = isSpotlight ? 100 : 64;
  const TIER_Y_CHILD = isSpotlight ? 180 : 116;
  const FONT_PARENT = isSpotlight ? 11 : 9;
  const FONT_CENTER = isSpotlight ? 13 : 11;
  const FONT_CHILD = isSpotlight ? 11 : 9;

  // Cap children at 3 for thumb, 5 for spotlight
  const cap = isSpotlight ? 5 : 3;
  const desc = descendants.slice(0, cap);
  const par = parents.slice(0, 2);

  const parentPositions = par.map((_, i) => {
    if (par.length === 1) return VBW / 2;
    const slotW = VBW / par.length;
    return slotW * i + slotW / 2;
  });

  const descendantPositions = desc.map((_, i) => {
    if (desc.length === 1) return VBW / 2;
    const slotW = VBW / desc.length;
    return slotW * i + slotW / 2;
  });

  const centerColors = center.type ? TYPE_COLORS[center.type] : UNKNOWN_COLOR;

  return (
    <svg
      viewBox={`0 0 ${VBW} ${VBH}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={ariaLabel ?? `${center.name} family lineage`}
      className="w-full h-auto"
    >
      {/* Connectors: parents → center */}
      {par.map((p, i) => (
        <line
          key={`p-line-${i}`}
          x1={parentPositions[i]}
          y1={TIER_Y_PARENT + NODE_H / 2}
          x2={VBW / 2}
          y2={TIER_Y_CENTER - CENTER_H / 2}
          stroke={p.type ? TYPE_COLORS[p.type].stroke : UNKNOWN_COLOR.stroke}
          strokeWidth="1.2"
          strokeOpacity="0.45"
        />
      ))}

      {/* Connectors: center → descendants */}
      {desc.map((d, i) => (
        <line
          key={`d-line-${i}`}
          x1={VBW / 2}
          y1={TIER_Y_CENTER + CENTER_H / 2}
          x2={descendantPositions[i]}
          y2={TIER_Y_CHILD - NODE_H / 2}
          stroke={d.type ? TYPE_COLORS[d.type].stroke : UNKNOWN_COLOR.stroke}
          strokeWidth="1.2"
          strokeOpacity="0.4"
        />
      ))}

      {/* Parent nodes */}
      {par.map((p, i) => (
        <MiniNodeRect
          key={`p-${i}`}
          node={p}
          x={parentPositions[i] - NODE_W / 2}
          y={TIER_Y_PARENT - NODE_H / 2}
          w={NODE_W}
          h={NODE_H}
          fontSize={FONT_PARENT}
        />
      ))}

      {/* Center node */}
      <rect
        x={VBW / 2 - CENTER_W / 2}
        y={TIER_Y_CENTER - CENTER_H / 2}
        width={CENTER_W}
        height={CENTER_H}
        rx={6}
        ry={6}
        fill={centerColors.fill}
        stroke={centerColors.stroke}
        strokeWidth={1.5}
      />
      <text
        x={VBW / 2}
        y={TIER_Y_CENTER + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={centerColors.text}
        fontSize={FONT_CENTER}
        fontWeight={700}
        fontFamily="ui-sans-serif, system-ui"
      >
        {truncate(center.name, isSpotlight ? 20 : 14)}
      </text>

      {/* Descendant nodes */}
      {desc.map((d, i) => (
        <MiniNodeRect
          key={`d-${i}`}
          node={d}
          x={descendantPositions[i] - NODE_W / 2}
          y={TIER_Y_CHILD - NODE_H / 2}
          w={NODE_W}
          h={NODE_H}
          fontSize={FONT_CHILD}
        />
      ))}
    </svg>
  );
}

function MiniNodeRect({
  node,
  x,
  y,
  w,
  h,
  fontSize,
}: {
  node: MiniNode;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
}) {
  const colors = node.type ? TYPE_COLORS[node.type] : UNKNOWN_COLOR;
  const cx = x + w / 2;
  const cy = y + h / 2;
  // Max chars in a node — scales with width-to-font ratio.
  const maxChars = Math.max(6, Math.floor((w - 8) / (fontSize * 0.55)));
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={4}
        ry={4}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={1}
      />
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={colors.text}
        fontSize={fontSize}
        fontWeight={500}
        fontFamily="ui-sans-serif, system-ui"
      >
        {truncate(node.name, maxChars)}
      </text>
    </g>
  );
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, Math.max(1, max - 1)) + "…";
}
