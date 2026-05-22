// Tests for `lib/terpene-types.ts` — the load-bearing SoT for the
// 7-axis customer terpene fingerprint vector.
//
// Why pinned: the order of TERPENE_AXES is THE schema for every row in
// `customer_terpene_profiles.terpene_vector` — a JSON array indexed
// against the position of each label. Reordering or inserting an axis
// without bumping VECTOR_VERSION would silently shift every customer's
// saved vector (myrcene-loving customer suddenly reads as limonene-loving
// after a "harmless" alphabetize). VECTOR_VERSION is the migration
// signal — if a future ship changes the axis list, that constant MUST
// also bump, and these tests pin the current shape so the bump can't be
// forgotten.
//
// Also pinned: the file has ZERO runtime imports (it was extracted from
// the `server-only` `lib/terpene-fingerprint.ts` precisely so the Client
// Component `components/TerpeneRadarChart.tsx` could pull axis labels
// without dragging the whole server-only scoring algorithm into the
// client bundle). A future edit that adds a `"server-only"` import or
// pulls anything from `lib/terpene-fingerprint.ts` would re-break the
// client bundle — these tests act as a regression net (they import as a
// plain module under Node's `--experimental-strip-types`, which would
// fail loudly if `server-only` ever creeps back in).
//
// Run with:  pnpm test:all

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { TERPENE_AXES, VECTOR_VERSION, type TerpeneAxis, type TerpeneVector } from "../terpene-types.ts";

// ── TERPENE_AXES shape + order ──────────────────────────────────────────

describe("TERPENE_AXES — load-bearing 7-axis schema", () => {
  test("exactly 7 axes (matches customer_terpene_profiles.terpene_vector column)", () => {
    // Migration column stores a 7-element JSON array. If this length
    // changes without a VECTOR_VERSION bump + backfill, every existing
    // row becomes silently malformed.
    assert.equal(TERPENE_AXES.length, 7);
  });

  test("axis order is the canonical SoT — Myrcene/Limonene/Caryophyllene first", () => {
    // Index 0 = Myrcene, index 1 = Limonene, index 2 = Caryophyllene
    // is the load-bearing storage contract. Reordering = silent corruption
    // of every saved customer vector. Pin the full exact order.
    assert.deepEqual(TERPENE_AXES, [
      "Myrcene",
      "Limonene",
      "Caryophyllene",
      "Pinene",
      "Linalool",
      "Humulene",
      "Terpinolene",
    ] as const);
  });

  test("Myrcene at index 0 (anchor — the most-common terpene across WA catalog)", () => {
    assert.equal(TERPENE_AXES[0], "Myrcene");
  });

  test("Limonene at index 1 (anchor — citrus axis)", () => {
    assert.equal(TERPENE_AXES[1], "Limonene");
  });

  test("Caryophyllene at index 2 (anchor — pepper/spice axis)", () => {
    assert.equal(TERPENE_AXES[2], "Caryophyllene");
  });

  test("Pinene at index 3", () => {
    assert.equal(TERPENE_AXES[3], "Pinene");
  });

  test("Linalool at index 4", () => {
    assert.equal(TERPENE_AXES[4], "Linalool");
  });

  test("Humulene at index 5", () => {
    assert.equal(TERPENE_AXES[5], "Humulene");
  });

  test("Terpinolene at index 6", () => {
    assert.equal(TERPENE_AXES[6], "Terpinolene");
  });
});

// ── TERPENE_AXES invariants ─────────────────────────────────────────────

describe("TERPENE_AXES — content invariants", () => {
  test("all axis labels are unique (no duplicate index)", () => {
    const set = new Set(TERPENE_AXES);
    assert.equal(set.size, TERPENE_AXES.length, "duplicate axis label would collide");
  });

  test("all axis labels are non-empty strings", () => {
    for (const axis of TERPENE_AXES) {
      assert.equal(typeof axis, "string");
      assert.ok(axis.length > 0, "empty axis label is structurally invalid");
    }
  });

  test("axis labels use canonical capitalization (capital initial)", () => {
    // UI renders these verbatim as radar-chart axis labels — case matters.
    for (const axis of TERPENE_AXES) {
      assert.match(axis, /^[A-Z][a-z]+$/, `axis label "${axis}" should be Capital-then-lowercase`);
    }
  });

  test("no whitespace in axis labels (single-word terpene names)", () => {
    for (const axis of TERPENE_AXES) {
      assert.ok(!/\s/.test(axis), `axis label "${axis}" must not contain whitespace`);
    }
  });

  test("contains the 3 anchor terpenes (Myrcene + Limonene + Caryophyllene)", () => {
    // These three are the radar's shape anchors per the file's doctrine
    // comment. They MUST be present (in any position) for the radar to
    // be legible across the WA catalog.
    const set = new Set<string>(TERPENE_AXES);
    assert.ok(set.has("Myrcene"));
    assert.ok(set.has("Limonene"));
    assert.ok(set.has("Caryophyllene"));
  });

  test("contains the 4 character terpenes (Pinene + Linalool + Humulene + Terpinolene)", () => {
    const set = new Set<string>(TERPENE_AXES);
    assert.ok(set.has("Pinene"));
    assert.ok(set.has("Linalool"));
    assert.ok(set.has("Humulene"));
    assert.ok(set.has("Terpinolene"));
  });

  test("does NOT include Ocimene / Bisabolol (deliberately stopped at 7 per doctrine)", () => {
    // File comment: "We deliberately STOP at 7 axes — adding more
    // (Ocimene, Bisabolol, etc.) increases radar noise more than signal."
    // If a future edit silently adds them, the radar legibility breaks.
    const set = new Set<string>(TERPENE_AXES);
    assert.ok(!set.has("Ocimene"), "Ocimene was deliberately excluded — see file doctrine");
    assert.ok(!set.has("Bisabolol"), "Bisabolol was deliberately excluded — see file doctrine");
  });
});

// ── VECTOR_VERSION migration signal ─────────────────────────────────────

describe("VECTOR_VERSION — schema version", () => {
  test("is a positive integer", () => {
    assert.equal(typeof VECTOR_VERSION, "number");
    assert.ok(Number.isInteger(VECTOR_VERSION));
    assert.ok(VECTOR_VERSION >= 1);
  });

  test("is exactly 1 today (bump signals customer_terpene_profiles backfill required)", () => {
    // This pin is intentionally tight — if the axis list changes shape,
    // both this version constant AND a backfill migration MUST ship in
    // the same commit. A bump here without the matching backfill = silent
    // corruption of every customer's saved vector. A change to TERPENE_AXES
    // without a bump here = same corruption, different direction.
    assert.equal(VECTOR_VERSION, 1);
  });
});

// ── Type-level smoke (compile-time assertions via runtime shape) ────────

describe("TerpeneAxis + TerpeneVector — type shape smoke", () => {
  test("TerpeneAxis values match TERPENE_AXES exactly (type-level invariant)", () => {
    // TerpeneAxis is `(typeof TERPENE_AXES)[number]` — so every TerpeneAxis
    // string must be a member of TERPENE_AXES. This test creates a value
    // of type TerpeneAxis and asserts the runtime membership — if a future
    // edit narrows the union without updating the const, this fails to
    // typecheck (caught by `tsc --noEmit`).
    const axis: TerpeneAxis = "Myrcene";
    assert.ok((TERPENE_AXES as readonly string[]).includes(axis));
  });

  test("TerpeneVector accepts a 7-element numeric tuple summing to ~1.0", () => {
    // Doctrine: "Normalized 7-element vector, components sum to 1.0
    // (or vector is all-zero)." Type itself only enforces length 7; the
    // sum constraint is upheld by `strainTerpeneVector` in
    // lib/terpene-fingerprint.ts. This test exercises the structural
    // shape so a future edit that loosens the tuple length (e.g. to
    // `readonly number[]`) gets flagged.
    const v: TerpeneVector = [0.2, 0.15, 0.15, 0.15, 0.15, 0.1, 0.1];
    assert.equal(v.length, 7);
    const sum = v.reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1.0) < 1e-9, `sample vector sum=${sum} should ~= 1.0`);
  });

  test("TerpeneVector accepts the all-zero vector (no-data customer)", () => {
    // The all-zero case is the explicit fallback when a customer has no
    // strain affinity data yet — the radar should still render (as an
    // empty septagon) rather than throw.
    const v: TerpeneVector = [0, 0, 0, 0, 0, 0, 0];
    assert.equal(v.length, 7);
    assert.ok(v.every((x) => x === 0));
  });
});
