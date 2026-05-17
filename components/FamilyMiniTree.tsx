// Compact SVG mini-tree for family-album tiles + per-family hero spotlight.
//
// Dialed-down fork of `StrainLineageTree.tsx` (DO NOT mutate the
// original — the original is load-bearing for per-strain /strains/[slug]
// pages and is sized for full-page hero). This component renders the
// same color-coded lineage idea at thumbnail/spotlight/hero scale.
//
// Three size variants:
//   - thumb     (320×140) — used by FamilyAlbumGrid tiles. NOT interactive
//                          (the tile itself is wrapped in <Link>).
//   - spotlight (480×220) — defined-but-currently-unused. Kept for backward
//                          compat in case a future surface wants the
//                          intermediate size.
//   - hero      (560×280) — used by /strains/families/[family] page in the
//                          "Founder strain" spread (v37.265 / v28.605
//                          redesign per Doug 2026-05-17 "split it down
//                          the middle, make the graph clickable + a
//                          little bigger"). Interactive: every node with
//                          a `slug` is wrapped in `<a href="/strains/{slug}">`.
//
// Differences from the parent StrainLineageTree:
//   - Smaller viewBoxes (320/480/560 vs 720 in the original).
//   - Caps at 3 descendants for thumb, 5 for spotlight + hero.
//   - 0 sibling chips (the chip row was the largest part of the original
//     and doesn't make sense at small size).
//   - HTML5 `<a href>` for clickable nodes (NOT deprecated `xlink:href`).
//     Safe here because the diagram lives in its OWN card and is NOT nested
//     inside a `<Link>` wrapper. Thumb size stays non-interactive because
//     it lives INSIDE a Link-wrapped tile (would create nested-link a11y
//     warnings).
//
// Used by:
//   - `components/FamilyAlbumGrid.tsx` (per-tile thumbnail, size="thumb")
//   - `app/strains/families/[family]/page.tsx` (hero spotlight, size="hero",
//     interactive)
//
// Per Doug doctrine: server-renderable SVG (zero JS), `text` + `rect` +
// `path` + `a` + `g` elements only. Static layout, no physics, no D3.

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
  /** Up to 3 descendants for thumb, 5 for spotlight/hero. */
  descendants?: readonly MiniNode[];
  /** Size variant. Defaults to "thumb" for backward compat. */
  size?: "thumb" | "spotlight" | "hero";
  /** When true, nodes with `slug` are wrapped in `<a href="/strains/{slug}">`.
   *  Only safe when this SVG is NOT nested inside a `<Link>` parent.
   *  Defaults to false (thumb usage in tiles). */
  interactive?: boolean;
  /** Optional accessible label. */
  ariaLabel?: string;
  /** Brand accent for focus rings + tier eyebrows ("emerald" | "indigo").
   *  Defaults to "emerald" for greenlife-web; SCC passes "indigo". */
  accent?: "emerald" | "indigo";
}

const TYPE_COLORS: Record<
  NonNullable<MiniNode["type"]>,
  { fill: string; stroke: string; text: string }
> = {
  // Industry-standard type color system per v37.125 (Leafly/Weedmaps).
  indica: { fill: "#7e22ce", stroke: "#9333ea", text: "#fff" }, // purple
  sativa: { fill: "#b91c1c", stroke: "#dc2626", text: "#fff" }, // red
  hybrid: { fill: "#15803d", stroke: "#16a34a", text: "#fff" }, // green
};
const UNKNOWN_COLOR = { fill: "#57534e", stroke: "#78716c", text: "#fff" };

// Accent palette for focus rings + tier eyebrows. Brand-color swap only;
// the type colors above stay shared across stacks (they represent strain
// biology, not brand identity).
const ACCENT_STROKE: Record<NonNullable<FamilyMiniTreeProps["accent"]>, string> = {
  emerald: "#10b981",
  indigo: "#6366f1",
};

export function FamilyMiniTree({
  center,
  parents = [],
  descendants = [],
  size = "thumb",
  interactive = false,
  ariaLabel,
  accent = "emerald",
}: FamilyMiniTreeProps) {
  const isHero = size === "hero";
  const isSpotlight = size === "spotlight" || isHero;

  // Geometry tiers — three columns growing thumb → spotlight → hero.
  const VBW = isHero ? 560 : isSpotlight ? 480 : 320;
  const VBH = isHero ? 280 : isSpotlight ? 220 : 140;
  const NODE_W = isHero ? 126 : isSpotlight ? 110 : 78;
  const NODE_H = isHero ? 30 : isSpotlight ? 26 : 22;
  const CENTER_W = isHero ? 180 : isSpotlight ? 150 : 100;
  const CENTER_H = isHero ? 38 : isSpotlight ? 32 : 26;
  const TIER_Y_PARENT = isHero ? 36 : isSpotlight ? 22 : 14;
  const TIER_Y_CENTER = isHero ? 130 : isSpotlight ? 100 : 64;
  const TIER_Y_CHILD = isHero ? 234 : isSpotlight ? 180 : 116;
  const FONT_PARENT = isHero ? 12 : isSpotlight ? 11 : 9;
  const FONT_CENTER = isHero ? 15 : isSpotlight ? 13 : 11;
  const FONT_CHILD = isHero ? 12 : isSpotlight ? 11 : 9;

  // Cap children at 3 for thumb, 5 for spotlight + hero.
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
  const accentStroke = ACCENT_STROKE[accent];

  // Tier-label eyebrow text — only rendered at hero size, where the extra
  // vertical air supports it without crowding.
  const showTierLabels = isHero;
  const tierLabelColor = "#a8a29e"; // stone-400, neutral cross-stack
  const tierLabelFont = 9;

  return (
    <svg
      viewBox={`0 0 ${VBW} ${VBH}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={ariaLabel ?? `${center.name} family lineage`}
      className="w-full h-auto"
    >
      {/* Drop-shadow filter for hovered/focused nodes. Defined once, applied
          per-node via CSS class swap on `<a>` wrapper. */}
      {isHero && (
        <defs>
          <filter id="familyMiniTreeShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.18" />
          </filter>
        </defs>
      )}

      {/* Tier labels (hero only) */}
      {showTierLabels && par.length > 0 && (
        <text
          x={VBW / 2}
          y={TIER_Y_PARENT - NODE_H / 2 - 8}
          textAnchor="middle"
          fill={tierLabelColor}
          fontSize={tierLabelFont}
          fontWeight={700}
          letterSpacing="0.18em"
          fontFamily="ui-sans-serif, system-ui"
        >
          PARENTS
        </text>
      )}
      {showTierLabels && (
        <text
          x={VBW / 2}
          y={TIER_Y_CENTER - CENTER_H / 2 - 8}
          textAnchor="middle"
          fill={tierLabelColor}
          fontSize={tierLabelFont}
          fontWeight={700}
          letterSpacing="0.18em"
          fontFamily="ui-sans-serif, system-ui"
        >
          FOUNDER
        </text>
      )}
      {showTierLabels && desc.length > 0 && (
        <text
          x={VBW / 2}
          y={TIER_Y_CHILD - NODE_H / 2 - 8}
          textAnchor="middle"
          fill={tierLabelColor}
          fontSize={tierLabelFont}
          fontWeight={700}
          letterSpacing="0.18em"
          fontFamily="ui-sans-serif, system-ui"
        >
          CHILDREN ({desc.length})
        </text>
      )}

      {/* Connectors: parents → center (bezier at hero, straight elsewhere) */}
      {par.map((p, i) => {
        const x1 = parentPositions[i];
        const y1 = TIER_Y_PARENT + NODE_H / 2;
        const x2 = VBW / 2;
        const y2 = TIER_Y_CENTER - CENTER_H / 2;
        const stroke = p.type ? TYPE_COLORS[p.type].stroke : UNKNOWN_COLOR.stroke;
        if (isHero) {
          const midY = (y1 + y2) / 2;
          return (
            <path
              key={`p-line-${i}`}
              d={`M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`}
              fill="none"
              stroke={stroke}
              strokeWidth="1.5"
              strokeOpacity="0.5"
            />
          );
        }
        return (
          <line
            key={`p-line-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={stroke}
            strokeWidth="1.2"
            strokeOpacity="0.45"
          />
        );
      })}

      {/* Connectors: center → descendants (bezier at hero, straight elsewhere) */}
      {desc.map((d, i) => {
        const x1 = VBW / 2;
        const y1 = TIER_Y_CENTER + CENTER_H / 2;
        const x2 = descendantPositions[i];
        const y2 = TIER_Y_CHILD - NODE_H / 2;
        const stroke = d.type ? TYPE_COLORS[d.type].stroke : UNKNOWN_COLOR.stroke;
        if (isHero) {
          const midY = (y1 + y2) / 2;
          return (
            <path
              key={`d-line-${i}`}
              d={`M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`}
              fill="none"
              stroke={stroke}
              strokeWidth="1.5"
              strokeOpacity="0.45"
            />
          );
        }
        return (
          <line
            key={`d-line-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={stroke}
            strokeWidth="1.2"
            strokeOpacity="0.4"
          />
        );
      })}

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
          interactive={interactive}
          accentStroke={accentStroke}
          isHero={isHero}
        />
      ))}

      {/* Center (founder) node — clickable when interactive, links back to
          the same canonical strain page as the founder card. */}
      <MiniNodeRect
        node={{
          name: center.name,
          slug: center.slug ?? null,
          type: center.type,
        }}
        x={VBW / 2 - CENTER_W / 2}
        y={TIER_Y_CENTER - CENTER_H / 2}
        w={CENTER_W}
        h={CENTER_H}
        fontSize={FONT_CENTER}
        rx={isHero ? 8 : 6}
        fontWeight={700}
        truncateTo={isHero ? 22 : isSpotlight ? 20 : 14}
        interactive={interactive}
        accentStroke={accentStroke}
        isHero={isHero}
        isCenter
      />

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
          interactive={interactive}
          accentStroke={accentStroke}
          isHero={isHero}
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
  rx = 4,
  fontWeight = 500,
  truncateTo,
  interactive,
  accentStroke,
  isHero,
  isCenter,
}: {
  node: MiniNode;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
  rx?: number;
  fontWeight?: number;
  truncateTo?: number;
  interactive: boolean;
  accentStroke: string;
  isHero: boolean;
  isCenter?: boolean;
}) {
  const colors = node.type ? TYPE_COLORS[node.type] : UNKNOWN_COLOR;
  const cx = x + w / 2;
  const cy = y + h / 2;
  // Max chars in a node — scales with width-to-font ratio when no explicit
  // truncateTo provided.
  const maxChars = truncateTo ?? Math.max(6, Math.floor((w - 8) / (fontSize * 0.55)));
  const label = truncate(node.name, maxChars);
  const isClickable = interactive && !!node.slug;

  // Landrace / null-slug parents stay visually present but slightly muted
  // when interactive nodes are rendering — telegraphs "you can tap the
  // saturated ones."
  const inactiveOpacity = interactive && !node.slug ? 0.7 : 1;

  const inner = (
    <>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        ry={rx}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={isCenter ? 1.5 : 1}
        opacity={inactiveOpacity}
        className={
          isClickable && isHero
            ? "transition-opacity group-hover:opacity-90 group-focus-visible:opacity-100"
            : undefined
        }
      />
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={colors.text}
        fontSize={fontSize}
        fontWeight={fontWeight}
        fontFamily="ui-sans-serif, system-ui"
        opacity={inactiveOpacity}
      >
        {label}
      </text>
    </>
  );

  if (isClickable) {
    return (
      <a
        href={`/strains/${node.slug}`}
        aria-label={`Open ${node.name} strain page`}
        className="group cursor-pointer outline-none"
        style={{ outline: "none" }}
      >
        {/* Focus ring rect — hidden by default, shown via CSS on focus-visible.
            Wider than the node so the ring sits cleanly around it. */}
        <rect
          x={x - 3}
          y={y - 3}
          width={w + 6}
          height={h + 6}
          rx={rx + 2}
          ry={rx + 2}
          fill="none"
          stroke={accentStroke}
          strokeWidth="2"
          className="opacity-0 group-focus-visible:opacity-100 group-hover:opacity-40 transition-opacity"
          pointerEvents="none"
        />
        {inner}
      </a>
    );
  }
  return <g>{inner}</g>;
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, Math.max(1, max - 1)) + "…";
}
