// Tree-Timelapse — chronological frame-sequence builder for C2 of
// `/CODE/Green Life/PLAN_STRAIN_TREE_INNOVATION_2026_05_21.md`.
//
// The customer's lineage tree renders as a 15-second time-lapse showing
// nodes lighting up in PURCHASE ORDER. This file produces the data
// structure consumed by:
//   - `app/api/tree-growth/export.mp4/route.ts` (server-rendered SMIL
//     animated SVG fallback; MP4 transcoding is intentionally out of
//     scope until we add `@vercel/og` + ffmpeg-wasm as deps in a future
//     ship — currently we ship the SVG which IS the animation and let
//     the client recorder turn it into a real MP4 via MediaRecorder)
//   - `components/TreeTimelapseExporter.tsx` (client-side preview +
//     MediaRecorder capture)
//   - `app/account/tree-growth/page.tsx` (the mount point at
//     `/account/tree-growth` Doug pinned per the plan §10)
//
// WAC posture (WAC 314-55-155):
//   - The animation IS the share asset; we never overlay efficacy text
//     or consumption claims. Customer display-name only, no photos of
//     people, no medical framing. Process + experience vocabulary.
//   - Watermark identifies the source store ("seattlecannabis.co" or
//     "greenlifecannabis.com") + small QR. Render-side decides which.
//
// IP / patent angle (PLAN §8 / §C2):
//   - "Lineage-graph-state-over-receipt-verified-purchase-timeline as
//     time-lapse render" is the claim. Independent of C1 / C7 / C9 /
//     C11 — stands alone OR rolls into the parent provisional bundle.
//
// Strict NEW-file discipline (per the C2 brief): does NOT import from
// `lib/strains.ts` / `lib/db.ts` / `app/strains/[slug]/page.tsx` and
// does NOT mutate `FamilyMiniTree.tsx`. We accept the lineage data as
// a parameter so this file stays decoupled.

/** A single receipt-verified strain purchase event. */
export type PurchaseTimelineEntry = {
  /** Strain slug, e.g. "blue-dream". Matches STRAINS keys in lib/strains.ts. */
  strainSlug: string;
  /** ISO timestamp. UTC strict. */
  purchasedAt: string;
};

/** Render-time tree node lit on a specific frame. */
export type TimelapseNode = {
  /** Strain slug — display name + type resolved render-side. */
  slug: string;
  /** Frame index at which this node FIRST appears (0..frameCount-1). */
  firstFrame: number;
  /**
   * Number of times this strain appears in the timeline (revisits).
   * Render uses this for a pulse-on-revisit visual cue.
   */
  visitCount: number;
};

/** Each frame is a partial render — a subset of nodes active by this point. */
export type TimelapseFrame = {
  /** 0-based frame index. */
  index: number;
  /** Elapsed seconds since frame 0 (for SMIL `begin` attributes). */
  elapsedSec: number;
  /** Cumulative slug set active by this frame (deduplicated). */
  activeSlugs: readonly string[];
  /** Slug appearing for the first time at this frame, if any. */
  newSlug: string | null;
  /** Human-readable date stamp for the chrome label (e.g. "Jan 2025"). */
  dateLabel: string;
};

/** Result returned by `buildTimelapseFrames`. */
export type TimelapseSequence = {
  /** Each frame, in chronological order. */
  frames: readonly TimelapseFrame[];
  /** Per-strain summary (used by the renderer for layout). */
  nodes: readonly TimelapseNode[];
  /** Total render duration in seconds. 15 by default. */
  durationSec: number;
  /** Earliest + latest purchase ISO timestamps. */
  windowStart: string;
  windowEnd: string;
  /** Human-readable year range for the share-card label. */
  yearRange: string;
};

/** Options for building the timelapse sequence. */
export type TimelapseOptions = {
  /** Total render duration. 15 sec is the IG/TikTok story sweet spot. */
  durationSec?: number;
  /** Max distinct strains to surface. Defaults to 24 — beyond that the
   * 9:16 tree gets visually cramped at 1080×1920. Excess purchases of
   * the same slugs still count as revisits; only NEW slugs past the cap
   * are dropped. */
  maxDistinctStrains?: number;
};

const DEFAULT_DURATION_SEC = 15;
const DEFAULT_MAX_DISTINCT = 24;
const MIN_DURATION_SEC = 6;
const MAX_DURATION_SEC = 30;

/**
 * Builds the chronological frame sequence consumed by the renderer.
 *
 * Algorithm:
 *   1. Sort timeline ASC by purchasedAt.
 *   2. Aggregate per-slug visitCount + firstSeenAt.
 *   3. Cap distinct strains to maxDistinctStrains (FIFO — earliest
 *      first-seen wins; revisits of already-tracked slugs are kept).
 *   4. One frame per purchase event (after the cap filter). Each frame
 *      carries the cumulative `activeSlugs` set + the new-slug-this-frame.
 *   5. Frame timing is evenly distributed across durationSec — NOT
 *      proportional to real-world spacing (a 6-month gap shouldn't make
 *      one frame eat half the video).
 *
 * Returns a pure data structure — no DOM, no SVG, no MP4. The renderer
 * (SVG SMIL or client MediaRecorder) consumes this and produces frames.
 *
 * @param timeline - Receipt-verified purchase events. May be unsorted.
 * @param opts - Optional configuration (duration, distinct cap).
 */
export function buildTimelapseFrames(
  timeline: readonly PurchaseTimelineEntry[],
  opts: TimelapseOptions = {},
): TimelapseSequence {
  const durationSec = clamp(
    opts.durationSec ?? DEFAULT_DURATION_SEC,
    MIN_DURATION_SEC,
    MAX_DURATION_SEC,
  );
  const maxDistinct = Math.max(1, opts.maxDistinctStrains ?? DEFAULT_MAX_DISTINCT);

  // Step 1 — sort ASC by purchasedAt. Defensive copy; never mutate input.
  const sorted = [...timeline]
    .filter((e) => isValidTimelineEntry(e))
    .sort((a, b) => a.purchasedAt.localeCompare(b.purchasedAt));

  if (sorted.length === 0) {
    return emptySequence(durationSec);
  }

  // Step 2 — first-seen + visitCount per slug, in encounter order.
  const firstSeenOrder: string[] = [];
  const visitCounts = new Map<string, number>();
  for (const ev of sorted) {
    if (!visitCounts.has(ev.strainSlug)) {
      firstSeenOrder.push(ev.strainSlug);
    }
    visitCounts.set(ev.strainSlug, (visitCounts.get(ev.strainSlug) ?? 0) + 1);
  }

  // Step 3 — cap distinct strains. Allow-set of tracked slugs.
  const trackedSlugs = new Set(firstSeenOrder.slice(0, maxDistinct));
  const filtered = sorted.filter((e) => trackedSlugs.has(e.strainSlug));

  // Step 4 — build frames. One frame per surviving event.
  const frameCount = filtered.length;
  const activeSet = new Set<string>();
  const firstFrameByStrain = new Map<string, number>();
  const frames: TimelapseFrame[] = [];

  for (let i = 0; i < frameCount; i++) {
    const ev = filtered[i];
    const slug = ev.strainSlug;
    const wasNew = !activeSet.has(slug);
    if (wasNew) {
      activeSet.add(slug);
      firstFrameByStrain.set(slug, i);
    }
    // Evenly-spaced timing — see header comment for rationale.
    const elapsedSec = frameCount === 1
      ? 0
      : (i / (frameCount - 1)) * durationSec;
    frames.push({
      index: i,
      elapsedSec: round3(elapsedSec),
      activeSlugs: Array.from(activeSet),
      newSlug: wasNew ? slug : null,
      dateLabel: formatMonthYear(ev.purchasedAt),
    });
  }

  // Step 5 — node summary for the renderer's static layout pass.
  const nodes: TimelapseNode[] = Array.from(trackedSlugs).map((slug) => ({
    slug,
    firstFrame: firstFrameByStrain.get(slug) ?? 0,
    visitCount: visitCounts.get(slug) ?? 0,
  }));

  const windowStart = filtered[0].purchasedAt;
  const windowEnd = filtered[filtered.length - 1].purchasedAt;
  const yearRange = computeYearRange(windowStart, windowEnd);

  return {
    frames,
    nodes,
    durationSec,
    windowStart,
    windowEnd,
    yearRange,
  };
}

/**
 * Builds the static node layout for the 9:16 export canvas (1080×1920).
 *
 * Strategy: lay nodes out on a radial/spiral arrangement centered on
 * the canvas. This is share-card optimized — we don't try to recreate
 * the per-strain lineage hierarchy (that lives on `/strains/[slug]`
 * pages); the timelapse shows the BREADTH of the customer's collection
 * filling in over time, NOT family relationships.
 *
 * For tree-of-lineage relationship rendering, the future-state ship
 * pulls in a lineage-graph parameter and routes through a layered
 * Sugiyama layout. Out of scope for C2 v1.
 *
 * @param nodes - Tree-node summaries from `buildTimelapseFrames`.
 * @param canvasWidth - Canvas width in px (1080 for IG vertical).
 * @param canvasHeight - Canvas height in px (1920 for IG vertical).
 */
export function buildTimelapseLayout(
  nodes: readonly TimelapseNode[],
  canvasWidth: number,
  canvasHeight: number,
): readonly TimelapseLayoutNode[] {
  if (nodes.length === 0) return [];

  const cx = canvasWidth / 2;
  // Center the tree vertically with margin for top date-label + bottom
  // watermark — the share-card chrome owns ~18% top + ~12% bottom.
  const usableTop = canvasHeight * 0.22;
  const usableBottom = canvasHeight * 0.86;
  const usableHeight = usableBottom - usableTop;
  const cy = usableTop + usableHeight / 2;

  // Spiral parameters — Fermat's spiral (sunflower-style) packs nodes
  // densely + organically without crossing. r = c * sqrt(i), theta =
  // i * golden_angle.
  const golden = Math.PI * (3 - Math.sqrt(5)); // ~2.39996
  const maxRadius = Math.min(canvasWidth * 0.42, usableHeight * 0.42);
  const c = maxRadius / Math.sqrt(Math.max(nodes.length - 1, 1));

  return nodes.map((n, i) => {
    const r = c * Math.sqrt(i);
    const theta = i * golden;
    return {
      slug: n.slug,
      visitCount: n.visitCount,
      firstFrame: n.firstFrame,
      x: round1(cx + r * Math.cos(theta)),
      y: round1(cy + r * Math.sin(theta)),
    };
  });
}

export type TimelapseLayoutNode = {
  slug: string;
  visitCount: number;
  firstFrame: number;
  x: number;
  y: number;
};

// ─────────────────────────────────────────────────────────────────────
// helpers
// ─────────────────────────────────────────────────────────────────────

function isValidTimelineEntry(e: PurchaseTimelineEntry): boolean {
  if (typeof e?.strainSlug !== "string" || e.strainSlug.length === 0) return false;
  if (typeof e?.purchasedAt !== "string") return false;
  const t = Date.parse(e.purchasedAt);
  return Number.isFinite(t);
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

function formatMonthYear(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function computeYearRange(startIso: string, endIso: string): string {
  const y1 = new Date(startIso).getUTCFullYear();
  const y2 = new Date(endIso).getUTCFullYear();
  if (!Number.isFinite(y1) || !Number.isFinite(y2)) return "all-time";
  if (y1 === y2) return String(y1);
  return `${y1}-${y2}`;
}

function emptySequence(durationSec: number): TimelapseSequence {
  return {
    frames: [],
    nodes: [],
    durationSec,
    windowStart: "",
    windowEnd: "",
    yearRange: "all-time",
  };
}
