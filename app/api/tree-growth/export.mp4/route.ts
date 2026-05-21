// Tree-Timelapse server export — C2 of
// /CODE/Green Life/PLAN_STRAIN_TREE_INNOVATION_2026_05_21.md.
//
// Returns an animated SVG (SMIL-based) at the IG/TikTok story aspect
// ratio (9:16, 1080x1920) showing the customer's lineage tree growing
// in chronological purchase order over 15 seconds.
//
// Why SVG instead of a real MP4 here:
//   - `@vercel/og` is NOT in this repo's dependencies today (see
//     package.json — only @clerk + @neondatabase + next + react + resend
//     + twilio + web-push). Adding it for the MP4 path requires a
//     separate Doug-greenlight dep-add ship per OPERATING_PRINCIPLES
//     "Pre-commit review" + cost-aware build cadence.
//   - ffmpeg-wasm is a heavy build add (>10MB) — not worth the budget
//     until the surface ships under real customer load.
//   - The animated SVG IS the share asset for desktop browsers; for
//     IG/TikTok proper MP4, the client island `TreeTimelapseExporter`
//     uses the browser's MediaRecorder API (zero new deps) to capture
//     this same SVG into a real MP4/WebM file the customer can save.
//
// Route name preserved as `export.mp4` so the future-state swap to a
// real MP4 stream is URL-stable (clients bookmark the share URL).
// `Content-Type` is honestly `image/svg+xml` today; flips to `video/mp4`
// when the renderer is upgraded.
//
// Feature flag: TREE_TIMELAPSE_ENABLED. Default OFF — returns 404 when
// unset so the surface stays invisible until Doug flips it in Vercel.
//
// WAC: no effects / efficacy / consumption text; customer handle only;
// store watermark; QR optional.

import { NextRequest, NextResponse } from "next/server";
import {
  buildTimelapseFrames,
  buildTimelapseLayout,
  type PurchaseTimelineEntry,
  type TimelapseSequence,
  type TimelapseLayoutNode,
} from "@/lib/tree-timelapse";
import { mockPurchaseTimeline } from "@/lib/tree-timelapse-mock";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Canvas is 9:16 vertical for IG/TikTok story export.
const CANVAS_W = 1080;
const CANVAS_H = 1920;
// Brand accent — emerald for GLW. Sister-port file in seattle-cannabis-web
// uses indigo via a single-character palette swap.
const ACCENT = "#10b981"; // emerald-500
const ACCENT_DEEP = "#047857"; // emerald-700
const BG_TOP = "#0f172a"; // slate-900
const BG_BOTTOM = "#022c22"; // green-950
const STORE_HOST = "greenlifecannabis.com";
const STORE_NAME = "Green Life Cannabis";

const TYPE_COLORS: Record<"sativa" | "indica" | "hybrid", string> = {
  indica: "#9333ea",
  sativa: "#dc2626",
  hybrid: "#16a34a",
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const displayName = sanitizeDisplayName(url.searchParams.get("name"));
  const preview = url.searchParams.get("preview") === "1";

  // Flag-gate UNLESS preview mode — sister glw v38.365 page-side pattern.
  // Doug eyes the mock SVG render before flipping TREE_TIMELAPSE_ENABLED.
  // Real-data render still requires flag ON (today: mock-data only; when
  // verified-purchase wires through, the flag plus auth path will gate
  // the customer-specific timeline lookup).
  if (process.env.TREE_TIMELAPSE_ENABLED !== "true" && !preview) {
    return NextResponse.json(
      { error: "Tree-growth export not enabled." },
      { status: 404 },
    );
  }

  // Mock-data mode until verified-purchase ships. The mock fixture is
  // deterministic across all visitors during the preview window.
  const timeline: readonly PurchaseTimelineEntry[] = mockPurchaseTimeline();
  const sequence = buildTimelapseFrames(timeline, { durationSec: 15 });
  const layout = buildTimelapseLayout(sequence.nodes, CANVAS_W, CANVAS_H);

  const svg = renderTimelapseSvg({
    sequence,
    layout,
    displayName,
    preview,
  });

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      // Short cache — mock-mode fixture is stable but flipping the env
      // flag off needs to take effect immediately for compliance.
      "Cache-Control": "private, max-age=60, must-revalidate",
      "X-Tree-Timelapse-Mode": "mock-svg-fallback",
      "X-Tree-Timelapse-Frame-Count": String(sequence.frames.length),
      "X-Tree-Timelapse-Duration-Sec": String(sequence.durationSec),
    },
  });
}

// --------------------------------------------------------------------
// renderer — SVG SMIL animation. Server-side string build only.
// --------------------------------------------------------------------

type RenderArgs = {
  sequence: TimelapseSequence;
  layout: readonly TimelapseLayoutNode[];
  displayName: string;
  preview: boolean;
};

function renderTimelapseSvg(args: RenderArgs): string {
  const { sequence, layout, displayName, preview } = args;
  const { durationSec, frames, yearRange } = sequence;
  const frameCount = frames.length;
  const perFrameSec = frameCount > 0 ? durationSec / Math.max(frameCount, 1) : durationSec;

  const nodeElements = layout
    .map((node, idx) => renderNode(node, idx, perFrameSec))
    .join("\n");

  const titleStamp = preview
    ? `Preview · ${yearRange}`
    : `My strain journey · ${yearRange}`;
  const escapedTitle = escapeXml(titleStamp);
  const escapedName = escapeXml(displayName);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}" width="${CANVAS_W}" height="${CANVAS_H}" role="img" aria-label="${escapedTitle}">
  <title>${escapedTitle}</title>
  <desc>Time-lapse of strains tried at ${escapeXml(STORE_NAME)} over ${escapeXml(yearRange)}.</desc>
  <defs>
    <linearGradient id="treeBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BG_TOP}" />
      <stop offset="100%" stop-color="${BG_BOTTOM}" />
    </linearGradient>
    <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.85" />
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0" />
    </radialGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
      <feOffset dx="0" dy="2" result="off" />
      <feComponentTransfer><feFuncA type="linear" slope="0.35" /></feComponentTransfer>
      <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  </defs>
  <rect x="0" y="0" width="${CANVAS_W}" height="${CANVAS_H}" fill="url(#treeBg)" />

  <text x="${CANVAS_W / 2}" y="180" text-anchor="middle" fill="#6ee7b7" font-family="ui-sans-serif, system-ui, -apple-system" font-size="34" font-weight="700" letter-spacing="0.22em">
    ${escapeXml(STORE_NAME.toUpperCase())}
  </text>
  <text x="${CANVAS_W / 2}" y="252" text-anchor="middle" fill="#ffffff" font-family="ui-sans-serif, system-ui, -apple-system" font-size="64" font-weight="800">
    ${escapedTitle}
  </text>
  ${
    escapedName
      ? `<text x="${CANVAS_W / 2}" y="312" text-anchor="middle" fill="#a7f3d0" font-family="ui-sans-serif, system-ui, -apple-system" font-size="36" font-weight="500">
        ${escapedName}
      </text>`
      : ""
  }

  ${renderFrameCounter(frames, durationSec)}

  <g filter="url(#softShadow)">
${nodeElements}
  </g>

  <text x="${CANVAS_W / 2}" y="${CANVAS_H - 90}" text-anchor="middle" fill="#6ee7b7" font-family="ui-sans-serif, system-ui, -apple-system" font-size="28" font-weight="500" letter-spacing="0.18em">
    ${escapeXml(STORE_HOST.toUpperCase())}
  </text>
  <text x="${CANVAS_W / 2}" y="${CANVAS_H - 50}" text-anchor="middle" fill="#34d399" font-family="ui-sans-serif, system-ui, -apple-system" font-size="20" font-weight="400" letter-spacing="0.12em">
    21+ ONLY · WA STATE
  </text>
</svg>`;
}

function renderNode(
  node: TimelapseLayoutNode,
  idx: number,
  perFrameSec: number,
): string {
  const beginSec = round3(node.firstFrame * perFrameSec);
  const fillColor = pickNodeFill(node.slug);
  const r = 26 + Math.min(node.visitCount - 1, 4) * 6;
  const label = humanizeSlug(node.slug);
  return `    <g opacity="0">
      <animate attributeName="opacity" from="0" to="1" begin="${beginSec}s" dur="0.45s" fill="freeze" />
      <circle cx="${node.x}" cy="${node.y}" r="${r + 18}" fill="url(#nodeGlow)" opacity="0.55" />
      <circle cx="${node.x}" cy="${node.y}" r="${r}" fill="${fillColor}" stroke="${ACCENT_DEEP}" stroke-width="2" />
      <text x="${node.x}" y="${node.y + r + 26}" text-anchor="middle" fill="#d1fae5" font-family="ui-sans-serif, system-ui, -apple-system" font-size="20" font-weight="600">
        ${escapeXml(truncate(label, 16))}
      </text>
      ${
        node.visitCount > 1
          ? `<animate attributeName="r" from="${r}" to="${r + 4}" begin="${round3(beginSec + 0.45)}s" dur="0.6s" repeatCount="${Math.min(node.visitCount - 1, 3)}" />`
          : ""
      }
    </g>
    <!-- node[${idx}] slug=${escapeXml(node.slug)} visits=${node.visitCount} -->`;
}

function renderFrameCounter(
  frames: TimelapseSequence["frames"],
  durationSec: number,
): string {
  if (frames.length === 0) return "";
  const lineY = CANVAS_H - 200;
  const perFrameSec = durationSec / Math.max(frames.length, 1);
  return frames
    .map((f, i) => {
      const begin = round3(f.elapsedSec);
      const fadeDur = Math.min(0.35, perFrameSec * 0.4);
      const holdDur = Math.max(0.1, perFrameSec - fadeDur * 2);
      const isLast = i === frames.length - 1;
      const fadeOutAt = isLast ? durationSec : round3(begin + fadeDur + holdDur);
      return `  <text x="${CANVAS_W / 2}" y="${lineY}" text-anchor="middle" fill="#fef3c7" font-family="ui-sans-serif, system-ui, -apple-system" font-size="44" font-weight="600" opacity="0">
    <animate attributeName="opacity" from="0" to="0.95" begin="${begin}s" dur="${round3(fadeDur)}s" fill="freeze" />
    ${isLast ? "" : `<animate attributeName="opacity" from="0.95" to="0" begin="${fadeOutAt}s" dur="${round3(fadeDur)}s" fill="freeze" />`}
    ${escapeXml(f.dateLabel)}
  </text>`;
    })
    .join("\n");
}

function pickNodeFill(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  const bucket = h % 3;
  if (bucket === 0) return TYPE_COLORS.hybrid;
  if (bucket === 1) return TYPE_COLORS.sativa;
  return TYPE_COLORS.indica;
}

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .map((p) => (p.length > 0 ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, Math.max(1, max - 1)) + "…";
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function sanitizeDisplayName(raw: string | null): string {
  if (!raw) return "";
  let out = "";
  for (let i = 0; i < raw.length && out.length < 80; i++) {
    const c = raw.charCodeAt(i);
    if (c >= 32 && c !== 127) out += raw.charAt(i);
  }
  return out.trim().slice(0, 40);
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
