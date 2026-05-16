// Static SVG family-tree visualization for a strain.
//
// Three-tier layout: parents above (tier 1), this strain center (tier 2,
// emphasized), descendants below (tier 3). Sibling strains render as a
// chip row beneath the SVG (not as nodes in the tree).
//
// Design choices:
//   - Server-renderable: zero JS shipped to client, every node is
//     `<text>` + `<a xlink:href>` so Googlebot indexes the lineage links
//     as crawlable anchor text. D3 / react-flow would inject DOM that
//     isn't crawlable + would tank LCP on this SEO-critical surface.
//   - Static layout: nodes positioned by index, lines drawn with simple
//     polylines. No physics, no force-direction.
//   - viewBox responsive: SVG scales to viewport via `preserveAspectRatio`.
//   - Type color coding:
//       indica  → indigo (deep, "evening")
//       sativa  → orange (warm, "morning")
//       hybrid  → emerald (balanced, default)
//   - Center node is 1.4× the size of parent/descendant nodes.
//   - Connector lines: parent → center solid; center → descendant solid;
//     all stroke 1.5, color follows the destination node's type.
//
// Doug 2026-05-15: "kinda like a family tree" — this is the MVP.
// Phase 2 (`/strains/family-tree`) will be an interactive react-flow
// graph of all 250 strains. This page-level tree shows the immediate
// generation up + down + sibling chips, which is what most users want
// when they're researching a single strain.

import Link from "next/link";
import type { Strain } from "@/lib/strains";

interface LineageNode {
  slug: string | null;
  name: string;
  type?: Strain["type"];
}

interface LineageGraph {
  parents: LineageNode[];
  center: { slug: string; name: string; type: Strain["type"] };
  descendants: LineageNode[];
  siblings: LineageNode[];
}

interface StrainLineageTreeProps {
  graph: LineageGraph;
}

const TYPE_COLORS: Record<NonNullable<LineageNode["type"]>, { fill: string; stroke: string; text: string }> = {
  indica: { fill: "#3730a3", stroke: "#4338ca", text: "#fff" },
  sativa: { fill: "#c2410c", stroke: "#ea580c", text: "#fff" },
  hybrid: { fill: "#047857", stroke: "#059669", text: "#fff" },
};
const UNKNOWN_COLOR = { fill: "#57534e", stroke: "#78716c", text: "#fff" };

const NODE_W = 130;
const NODE_H = 36;
const CENTER_W = 180;
const CENTER_H = 48;
const VIEWBOX_W = 720;
const TIER_Y_PARENT = 32;
const TIER_Y_CENTER = 152;
const TIER_Y_CHILD = 272;

export function StrainLineageTree({ graph }: StrainLineageTreeProps) {
  const { parents, center, descendants, siblings } = graph;

  // Layout parent nodes — distribute evenly along x
  const parentPositions = parents.map((_, i) => {
    if (parents.length === 1) return VIEWBOX_W / 2;
    const slotW = VIEWBOX_W / parents.length;
    return slotW * i + slotW / 2;
  });

  // Layout descendant nodes — distribute, max 5 per row for readability
  const maxPerRow = 5;
  const descRows = Math.ceil(descendants.length / maxPerRow) || 1;
  const descendantPositions = descendants.map((_, i) => {
    const row = Math.floor(i / maxPerRow);
    const colInRow = i % maxPerRow;
    const itemsInThisRow = Math.min(maxPerRow, descendants.length - row * maxPerRow);
    const slotW = VIEWBOX_W / itemsInThisRow;
    const x = slotW * colInRow + slotW / 2;
    const y = TIER_Y_CHILD + row * (NODE_H + 16);
    return { x, y };
  });

  const totalHeight = descRows > 0 ? TIER_Y_CHILD + descRows * (NODE_H + 16) + 16 : TIER_Y_CHILD + NODE_H + 16;
  const viewBox = `0 0 ${VIEWBOX_W} ${totalHeight}`;

  return (
    <div className="my-8">
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        className="w-full max-w-3xl mx-auto"
        role="img"
        aria-label={`${center.name} lineage diagram`}
      >
        {/* Connector lines: parents → center */}
        {parents.map((p, i) => (
          <line
            key={`p-line-${i}`}
            x1={parentPositions[i]}
            y1={TIER_Y_PARENT + NODE_H / 2}
            x2={VIEWBOX_W / 2}
            y2={TIER_Y_CENTER - CENTER_H / 2}
            stroke={p.type ? TYPE_COLORS[p.type].stroke : UNKNOWN_COLOR.stroke}
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
        ))}

        {/* Connector lines: center → descendants */}
        {descendants.map((d, i) => (
          <line
            key={`d-line-${i}`}
            x1={VIEWBOX_W / 2}
            y1={TIER_Y_CENTER + CENTER_H / 2}
            x2={descendantPositions[i].x}
            y2={descendantPositions[i].y - NODE_H / 2}
            stroke={d.type ? TYPE_COLORS[d.type].stroke : UNKNOWN_COLOR.stroke}
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
        ))}

        {/* Parent nodes */}
        {parents.map((p, i) => (
          <Node
            key={`p-${i}`}
            node={p}
            x={parentPositions[i] - NODE_W / 2}
            y={TIER_Y_PARENT - NODE_H / 2}
            w={NODE_W}
            h={NODE_H}
            fontSize={12}
          />
        ))}

        {/* Center node (emphasized) */}
        <Node
          node={center}
          x={VIEWBOX_W / 2 - CENTER_W / 2}
          y={TIER_Y_CENTER - CENTER_H / 2}
          w={CENTER_W}
          h={CENTER_H}
          fontSize={15}
          isCenter
        />

        {/* Descendant nodes */}
        {descendants.map((d, i) => (
          <Node
            key={`d-${i}`}
            node={d}
            x={descendantPositions[i].x - NODE_W / 2}
            y={descendantPositions[i].y - NODE_H / 2}
            w={NODE_W}
            h={NODE_H}
            fontSize={12}
          />
        ))}

        {/* Tier labels (left-anchored, subtle) */}
        <text x="8" y={TIER_Y_PARENT + 4} fontSize="9" fill="#78716c" fontFamily="ui-sans-serif, system-ui">
          Parents
        </text>
        {descendants.length > 0 && (
          <text x="8" y={TIER_Y_CHILD + 4} fontSize="9" fill="#78716c" fontFamily="ui-sans-serif, system-ui">
            Children
          </text>
        )}
      </svg>

      {/* Sibling chip row — below the SVG, not part of the tree */}
      {siblings.length > 0 && (
        <div className="max-w-3xl mx-auto mt-4 px-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-500 mb-2">
            Sister strains (share a parent)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {siblings.map((s) => (
              <Link
                key={s.slug ?? s.name}
                href={s.slug ? `/strains/${s.slug}` : "#"}
                className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white px-2.5 py-1 text-[11px] font-medium text-stone-700 hover:border-stone-500 hover:bg-stone-50 transition-colors"
              >
                {s.name}
                {s.type && (
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: TYPE_COLORS[s.type].fill }}
                    aria-hidden
                  />
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Node({
  node,
  x,
  y,
  w,
  h,
  fontSize,
  isCenter = false,
}: {
  node: LineageNode;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
  isCenter?: boolean;
}) {
  const colors = node.type ? TYPE_COLORS[node.type] : UNKNOWN_COLOR;
  const rx = isCenter ? 8 : 6;
  const strokeWidth = isCenter ? 2 : 1;
  const cx = x + w / 2;
  const cy = y + h / 2;

  const content = (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        ry={rx}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={strokeWidth}
      />
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={colors.text}
        fontSize={fontSize}
        fontWeight={isCenter ? 600 : 500}
        fontFamily="ui-sans-serif, system-ui"
      >
        {node.name}
      </text>
    </g>
  );

  if (node.slug) {
    return (
      <a href={`/strains/${node.slug}`} aria-label={`Open ${node.name} strain page`}>
        {content}
      </a>
    );
  }
  return content;
}
