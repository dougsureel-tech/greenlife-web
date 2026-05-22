// Pin tests for lib/tree-timelapse-mock.ts — mock purchase timeline
// fixture for C2 "Time-lapse Tree Growth" (per PLAN_STRAIN_TREE_INNOVATION).
// Used until verified-purchase ships. Doug demos the strain-tree timelapse
// surface from this fixture today.
//
// Pin invariants:
//   - shape stability (PurchaseTimelineEntry[] readonly)
//   - chronological order (ASC by purchasedAt — renderer assumes it)
//   - ISO-strict date strings (deterministic TZ math)
//   - non-empty + reasonable sample size (≥10 entries for meaningful demo)
//   - revisit-aware (same strain appearing multiple times — load-bearing for
//     "repeat customer" UX signal in the timelapse renderer)

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { mockPurchaseTimeline } from "../tree-timelapse-mock.ts";

describe("mockPurchaseTimeline — returns timeline data", () => {
  test("returns a non-empty array", () => {
    const t = mockPurchaseTimeline();
    assert.ok(Array.isArray(t));
    assert.ok(t.length > 0);
  });
  test("returns at least 10 entries (meaningful demo sample size)", () => {
    const t = mockPurchaseTimeline();
    assert.ok(t.length >= 10, `expected ≥10 entries, got ${t.length}`);
  });
  test("returns at least 15 entries (current state pin — bump when fixture grows)", () => {
    // Current fixture has 20 entries. Floor at 15 to allow shrinking by a
    // few but catch a regression that truncates the timeline severely.
    const t = mockPurchaseTimeline();
    assert.ok(t.length >= 15, `expected ≥15 entries, got ${t.length}`);
  });
  test("idempotent — returns same array on every call (same ref)", () => {
    // The fixture is a module-level const exported via getter.
    // Caller expects ref-stable for memoization.
    assert.equal(mockPurchaseTimeline(), mockPurchaseTimeline());
  });
});

describe("PurchaseTimelineEntry shape", () => {
  test("every entry has strainSlug + purchasedAt", () => {
    for (const e of mockPurchaseTimeline()) {
      assert.equal(typeof e.strainSlug, "string");
      assert.equal(typeof e.purchasedAt, "string");
      assert.ok(e.strainSlug.length > 0);
      assert.ok(e.purchasedAt.length > 0);
    }
  });
  test("strainSlug is URL-safe kebab-case lowercase", () => {
    for (const e of mockPurchaseTimeline()) {
      assert.match(e.strainSlug, /^[a-z][a-z0-9-]*$/, `${e.strainSlug} not URL-safe`);
    }
  });
});

describe("purchasedAt — ISO-strict date format (deterministic TZ math)", () => {
  test("every purchasedAt is parseable as Date (round-trip)", () => {
    for (const e of mockPurchaseTimeline()) {
      const d = new Date(e.purchasedAt);
      assert.ok(!isNaN(d.getTime()), `${e.purchasedAt} unparseable`);
    }
  });
  test("every purchasedAt uses ISO 8601 with Z (UTC) terminator", () => {
    for (const e of mockPurchaseTimeline()) {
      assert.match(e.purchasedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/, `${e.purchasedAt} not strict ISO+Z`);
    }
  });
});

describe("chronological order (ASC by purchasedAt) — renderer assumption", () => {
  test("timeline is sorted ASC by purchasedAt", () => {
    const t = mockPurchaseTimeline();
    for (let i = 1; i < t.length; i++) {
      const prev = new Date(t[i - 1].purchasedAt).getTime();
      const curr = new Date(t[i].purchasedAt).getTime();
      assert.ok(prev < curr, `out of order at index ${i}: ${t[i - 1].purchasedAt} >= ${t[i].purchasedAt}`);
    }
  });
});

describe("revisit-aware (same strain appearing multiple times)", () => {
  // Load-bearing for the timelapse renderer's "repeat customer" signal.
  // If the fixture has NO repeats, the UI can't demo that branch.
  test("at least one strainSlug appears multiple times in the timeline", () => {
    const t = mockPurchaseTimeline();
    const counts = new Map<string, number>();
    for (const e of t) {
      counts.set(e.strainSlug, (counts.get(e.strainSlug) ?? 0) + 1);
    }
    const repeats = Array.from(counts.entries()).filter(([, c]) => c > 1);
    assert.ok(repeats.length >= 1, "no strain appears twice — renderer can't demo repeat-customer UX");
  });
  test("blue-dream is a known revisited strain (pin to ≥3 visits per current fixture)", () => {
    // Specific fixture pin — blue-dream is the "anchor" strain Doug uses
    // for the demo conversation. If someone removes the blue-dream
    // revisits, the demo loses its narrative thread.
    const blueDreamCount = mockPurchaseTimeline().filter((e) => e.strainSlug === "blue-dream").length;
    assert.ok(blueDreamCount >= 3, `blue-dream visits dropped to ${blueDreamCount} (need ≥3 for demo narrative)`);
  });
});

describe("strain-slug diversity — strain-tree visualization needs variety", () => {
  test("at least 10 distinct strains in the fixture (visual richness)", () => {
    const t = mockPurchaseTimeline();
    const distinct = new Set(t.map((e) => e.strainSlug));
    assert.ok(distinct.size >= 10, `only ${distinct.size} distinct strains — visualization will look sparse`);
  });
});
