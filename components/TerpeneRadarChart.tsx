// TerpeneRadarChart — C7 of PLAN_STRAIN_TREE_INNOVATION_2026_05_21.md.
//
// Pure SVG 7-axis radar (spider) chart. NO external chart library —
// keeps the client bundle thin (Recharts pulls ~80KB) and lets us
// keep the rendering deterministic for SEO + accessibility.
//
// Two vectors are overlaid:
//   - The "average" baseline (faint grey polygon) — what a typical
//     Pacific NW hybrid customer's palette looks like.
//   - The customer's personal fingerprint (indigo polygon with stroke).
//
// PATENT-TRACK posture: this is the VISUAL surface only. The scoring
// math (lib/terpene-fingerprint.ts) and the graph traversal
// (lib/cousin-finder.ts) live server-side. Vectors arrive here as
// pre-computed normalized arrays — no scoring constants enter the
// client bundle.
//
// WAC 314-55-155: only flavor + aroma vocabulary. The labels render
// terpene names verbatim ("Myrcene", "Limonene", etc.) — no effect
// claims. Tooltips describe scent character ("earthy, mango-like")
// not "calming" or "sedating". Same posture as lib/strains.ts.
//
// Pure component — no state, no effects, no client-side data fetch.
// Marked "use client" only because SVG with hover states needs
// hydration for the tooltips on the axis labels. The chart itself
// renders correctly with JS disabled (graceful degradation).

"use client";

import { TERPENE_AXES, type TerpeneVector } from "@/lib/terpene-fingerprint";

type Props = {
  /** The customer's personal terpene preference vector. */
  customerVector: TerpeneVector;
  /** Reference vector to overlay underneath (typically the population average). */
  averageVector?: TerpeneVector;
  /** Diameter of the chart in pixels. SVG scales with the parent. */
  size?: number;
  /** Optional aria-label for the chart container. */
  ariaLabel?: string;
};

/** Short scent-character notes for each axis — flavor vocab only. */
const AXIS_NOTES: Record<(typeof TERPENE_AXES)[number], string> = {
  Myrcene: "earthy, mango-like, ripe-fruit warmth",
  Limonene: "citrus zest, bright and lifting",
  Caryophyllene: "peppery, warm woody, spicy back-end",
  Pinene: "fresh pine, sharp and clean",
  Linalool: "floral lavender, soft and cool",
  Humulene: "earthy hop-like, dry and herbal",
  Terpinolene: "fresh herbs, smoky-piney, light",
};

export function TerpeneRadarChart({
  customerVector,
  averageVector,
  size = 320,
  ariaLabel = "Your terpene fingerprint",
}: Props): React.ReactElement {
  const cx = size / 2;
  const cy = size / 2;
  // Leave room around the perimeter for axis labels.
  const radius = (size / 2) * 0.7;

  // Normalize: each axis component is in [0, 1] (sum = 1), so the maximum
  // possible single-axis value is 1.0 — we render that as the outer ring.
  // BUT in practice axes saturate around ~0.55 (cap from
  // lib/terpene-fingerprint.ts AXIS_CAP), so a "full" radar looks half-full
  // visually. Rescale by multiplying by 1.6 so the visual register stays
  // engaging. Cap final ratio at 1.0 for safety.
  const VISUAL_SCALE = 1.6;
  const scale = (v: number) => Math.min(v * VISUAL_SCALE, 1.0);

  // Compute axis endpoints. Axis 0 (Myrcene) points UP (-90°);
  // subsequent axes step clockwise around the circle.
  const axisCount = TERPENE_AXES.length;
  const angle = (i: number) => (Math.PI * 2 * i) / axisCount - Math.PI / 2;

  const customerPoints = customerVector
    .map((v, i) => {
      const r = radius * scale(v);
      return `${cx + r * Math.cos(angle(i))},${cy + r * Math.sin(angle(i))}`;
    })
    .join(" ");

  const averagePoints = averageVector
    ? averageVector
        .map((v, i) => {
          const r = radius * scale(v);
          return `${cx + r * Math.cos(angle(i))},${cy + r * Math.sin(angle(i))}`;
        })
        .join(" ")
    : null;

  // Ring grid — 4 concentric polygons at 25%, 50%, 75%, 100% to give
  // the eye a scale reference.
  const ringFractions = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label={ariaLabel}
      className="block"
    >
      <title>{ariaLabel}</title>

      {/* Background rings */}
      {ringFractions.map((f) => {
        const points = TERPENE_AXES.map((_, i) => {
          const r = radius * f;
          return `${cx + r * Math.cos(angle(i))},${cy + r * Math.sin(angle(i))}`;
        }).join(" ");
        return (
          <polygon
            key={`ring-${f}`}
            points={points}
            fill="none"
            stroke="rgb(231, 229, 228)"
            strokeWidth="1"
          />
        );
      })}

      {/* Axis spokes */}
      {TERPENE_AXES.map((_, i) => (
        <line
          key={`spoke-${i}`}
          x1={cx}
          y1={cy}
          x2={cx + radius * Math.cos(angle(i))}
          y2={cy + radius * Math.sin(angle(i))}
          stroke="rgb(231, 229, 228)"
          strokeWidth="1"
        />
      ))}

      {/* Average overlay (faint) */}
      {averagePoints && (
        <polygon
          points={averagePoints}
          fill="rgba(120, 113, 108, 0.12)"
          stroke="rgba(120, 113, 108, 0.45)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      )}

      {/* Customer polygon */}
      <polygon
        points={customerPoints}
        fill="rgba(79, 70, 229, 0.18)"
        stroke="rgb(79, 70, 229)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Customer vertex dots */}
      {customerVector.map((v, i) => {
        const r = radius * scale(v);
        return (
          <circle
            key={`dot-${i}`}
            cx={cx + r * Math.cos(angle(i))}
            cy={cy + r * Math.sin(angle(i))}
            r="3"
            fill="rgb(79, 70, 229)"
          />
        );
      })}

      {/* Axis labels — placed just outside the outermost ring. */}
      {TERPENE_AXES.map((axis, i) => {
        const labelR = radius * 1.18;
        const x = cx + labelR * Math.cos(angle(i));
        const y = cy + labelR * Math.sin(angle(i));
        return (
          <text
            key={`label-${i}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[11px] font-semibold fill-stone-700"
          >
            <title>{`${axis} — ${AXIS_NOTES[axis]}`}</title>
            {axis}
          </text>
        );
      })}
    </svg>
  );
}
