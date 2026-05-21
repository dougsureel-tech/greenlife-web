// Tests for `lib/tree-timelapse.ts` — chronological frame-sequence
// builder for C2 of PLAN_STRAIN_TREE_INNOVATION_2026_05_21.md.
//
// Why pinned:
//   - The animation timing baked into the SVG renderer + future MP4
//     transcoder reads `elapsedSec` off each frame. A regression that
//     produces NaN, negative, or out-of-bounds elapsed values silently
//     corrupts the share asset across every customer.
//   - The cap on `maxDistinctStrains` is the safety valve that prevents
//     a customer with 200+ distinct strains from crashing the 9:16
//     canvas layout. Bug there = unreadable share image at scale.
//   - WAC posture: the function never reads strain METADATA (effects,
//     terpenes, etc) — only the slug + timestamp. A regression that
//     starts pulling effects into the frame data would leak efficacy
//     into the export.
//
// Run with:  pnpm test:all

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  buildTimelapseFrames,
  buildTimelapseLayout,
  type PurchaseTimelineEntry,
} from "../tree-timelapse.ts";

const SAMPLE: readonly PurchaseTimelineEntry[] = [
  { strainSlug: "blue-dream", purchasedAt: "2025-01-12T18:00:00Z" },
  { strainSlug: "wedding-cake", purchasedAt: "2025-02-09T19:00:00Z" },
  { strainSlug: "blue-dream", purchasedAt: "2025-03-22T17:00:00Z" }, // revisit
  { strainSlug: "gelato", purchasedAt: "2025-04-15T20:00:00Z" },
];

describe("buildTimelapseFrames", () => {
  test("sorts ASC by purchasedAt even when input is unordered", () => {
    const unsorted: PurchaseTimelineEntry[] = [
      { strainSlug: "z", purchasedAt: "2025-05-01T00:00:00Z" },
      { strainSlug: "a", purchasedAt: "2025-01-01T00:00:00Z" },
      { strainSlug: "m", purchasedAt: "2025-03-01T00:00:00Z" },
    ];
    const seq = buildTimelapseFrames(unsorted);
    assert.equal(seq.frames.length, 3);
    assert.equal(seq.frames[0].newSlug, "a");
    assert.equal(seq.frames[1].newSlug, "m");
    assert.equal(seq.frames[2].newSlug, "z");
  });

  test("produces one frame per purchase event", () => {
    const seq = buildTimelapseFrames(SAMPLE);
    assert.equal(seq.frames.length, SAMPLE.length);
  });

  test("marks newSlug only on first occurrence; revisit frames have newSlug=null", () => {
    const seq = buildTimelapseFrames(SAMPLE);
    assert.equal(seq.frames[0].newSlug, "blue-dream");
    assert.equal(seq.frames[1].newSlug, "wedding-cake");
    assert.equal(seq.frames[2].newSlug, null); // revisit
    assert.equal(seq.frames[3].newSlug, "gelato");
  });

  test("cumulative activeSlugs grows monotonically", () => {
    const seq = buildTimelapseFrames(SAMPLE);
    for (let i = 1; i < seq.frames.length; i++) {
      assert.ok(
        seq.frames[i].activeSlugs.length >= seq.frames[i - 1].activeSlugs.length,
        `frame ${i} active count regressed`,
      );
    }
    assert.equal(seq.frames[seq.frames.length - 1].activeSlugs.length, 3);
  });

  test("elapsedSec evenly distributed across durationSec (last frame == durationSec)", () => {
    const seq = buildTimelapseFrames(SAMPLE, { durationSec: 15 });
    assert.equal(seq.frames[0].elapsedSec, 0);
    assert.equal(seq.frames[seq.frames.length - 1].elapsedSec, 15);
    // Strict-monotonic increase along the way.
    for (let i = 1; i < seq.frames.length; i++) {
      assert.ok(seq.frames[i].elapsedSec > seq.frames[i - 1].elapsedSec);
    }
  });

  test("nodes carry visitCount + firstFrame", () => {
    const seq = buildTimelapseFrames(SAMPLE);
    const blueDream = seq.nodes.find((n) => n.slug === "blue-dream");
    assert.ok(blueDream);
    assert.equal(blueDream!.visitCount, 2);
    assert.equal(blueDream!.firstFrame, 0);
    const gelato = seq.nodes.find((n) => n.slug === "gelato");
    assert.ok(gelato);
    assert.equal(gelato!.visitCount, 1);
  });

  test("clamps durationSec to [6, 30]", () => {
    const seq1 = buildTimelapseFrames(SAMPLE, { durationSec: 1 });
    assert.equal(seq1.durationSec, 6);
    const seq2 = buildTimelapseFrames(SAMPLE, { durationSec: 999 });
    assert.equal(seq2.durationSec, 30);
  });

  test("maxDistinctStrains drops new slugs past the cap but keeps revisits of tracked slugs", () => {
    const timeline: PurchaseTimelineEntry[] = [
      { strainSlug: "a", purchasedAt: "2025-01-01T00:00:00Z" },
      { strainSlug: "b", purchasedAt: "2025-02-01T00:00:00Z" },
      { strainSlug: "c", purchasedAt: "2025-03-01T00:00:00Z" }, // dropped (cap=2)
      { strainSlug: "a", purchasedAt: "2025-04-01T00:00:00Z" }, // kept (revisit)
    ];
    const seq = buildTimelapseFrames(timeline, { maxDistinctStrains: 2 });
    assert.equal(seq.nodes.length, 2);
    assert.equal(seq.nodes.map((n) => n.slug).sort().join(","), "a,b");
    // Frames: a, b, a (c dropped)
    assert.equal(seq.frames.length, 3);
  });

  test("empty timeline produces empty sequence without throwing", () => {
    const seq = buildTimelapseFrames([]);
    assert.equal(seq.frames.length, 0);
    assert.equal(seq.nodes.length, 0);
    assert.equal(seq.yearRange, "all-time");
  });

  test("year range single-year format is bare year, multi-year is YYYY-YYYY", () => {
    const single: PurchaseTimelineEntry[] = [
      { strainSlug: "x", purchasedAt: "2025-01-01T00:00:00Z" },
      { strainSlug: "y", purchasedAt: "2025-12-01T00:00:00Z" },
    ];
    assert.equal(buildTimelapseFrames(single).yearRange, "2025");
    const multi: PurchaseTimelineEntry[] = [
      { strainSlug: "x", purchasedAt: "2024-01-01T00:00:00Z" },
      { strainSlug: "y", purchasedAt: "2026-01-01T00:00:00Z" },
    ];
    assert.equal(buildTimelapseFrames(multi).yearRange, "2024-2026");
  });

  test("invalid entries are filtered without crashing the pipeline", () => {
    const dirty = [
      { strainSlug: "good", purchasedAt: "2025-01-01T00:00:00Z" },
      { strainSlug: "", purchasedAt: "2025-02-01T00:00:00Z" },
      { strainSlug: "bad-date", purchasedAt: "not-a-date" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { strainSlug: null as any, purchasedAt: "2025-03-01T00:00:00Z" },
    ];
    const seq = buildTimelapseFrames(
      dirty as readonly PurchaseTimelineEntry[],
    );
    assert.equal(seq.frames.length, 1);
    assert.equal(seq.nodes[0].slug, "good");
  });

  test("frame.dateLabel uses 'Mon YYYY' UTC format", () => {
    const seq = buildTimelapseFrames(SAMPLE);
    assert.equal(seq.frames[0].dateLabel, "Jan 2025");
    assert.equal(seq.frames[3].dateLabel, "Apr 2025");
  });

  test("never mutates the input array", () => {
    const input: PurchaseTimelineEntry[] = [
      { strainSlug: "z", purchasedAt: "2025-05-01T00:00:00Z" },
      { strainSlug: "a", purchasedAt: "2025-01-01T00:00:00Z" },
    ];
    const before = JSON.stringify(input);
    buildTimelapseFrames(input);
    assert.equal(JSON.stringify(input), before);
  });
});

describe("buildTimelapseLayout", () => {
  test("returns one layout node per input node", () => {
    const seq = buildTimelapseFrames(SAMPLE);
    const layout = buildTimelapseLayout(seq.nodes, 1080, 1920);
    assert.equal(layout.length, seq.nodes.length);
  });

  test("all nodes fall within canvas bounds with margin", () => {
    const seq = buildTimelapseFrames(SAMPLE);
    const layout = buildTimelapseLayout(seq.nodes, 1080, 1920);
    for (const n of layout) {
      assert.ok(n.x >= 0 && n.x <= 1080, `node ${n.slug} x=${n.x} OOB`);
      assert.ok(n.y >= 0 && n.y <= 1920, `node ${n.slug} y=${n.y} OOB`);
    }
  });

  test("empty input produces empty layout", () => {
    assert.deepEqual(buildTimelapseLayout([], 1080, 1920), []);
  });

  test("layout preserves the same slug + visitCount + firstFrame from the source node", () => {
    const seq = buildTimelapseFrames(SAMPLE);
    const layout = buildTimelapseLayout(seq.nodes, 1080, 1920);
    for (let i = 0; i < seq.nodes.length; i++) {
      assert.equal(layout[i].slug, seq.nodes[i].slug);
      assert.equal(layout[i].visitCount, seq.nodes[i].visitCount);
      assert.equal(layout[i].firstFrame, seq.nodes[i].firstFrame);
    }
  });
});
