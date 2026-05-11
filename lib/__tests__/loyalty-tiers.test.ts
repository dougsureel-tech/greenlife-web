// Tests for `lib/loyalty-tiers.ts` — pure progress math on Visitor →
// Regular → Local → Family tier placement + progress-pct.
//
// Why pinned: mirror of scc v13.9705 ship. The lib exists on glw as a
// mirror-from-inv-SoT pattern; pin coverage defends against drift in
// the threshold math (0/500/2000/5000) if the inv source-of-truth
// shifts and the mirror update gets missed.
//
// Run with:  node --test --experimental-strip-types lib/__tests__/loyalty-tiers.test.ts

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { TIERS, getTierProgress } from "../loyalty-tiers.ts";

// ── TIERS constant ──────────────────────────────────────────────────────

describe("TIERS", () => {
  test("has the 4 customer-vocabulary tiers in order", () => {
    assert.deepEqual(
      TIERS.map((t) => t.label),
      ["Visitor", "Regular", "Local", "Family"],
    );
  });

  test("minSpend thresholds: 0/500/2000/5000", () => {
    assert.deepEqual(
      TIERS.map((t) => t.minSpend),
      [0, 500, 2000, 5000],
    );
  });

  test("internal names preserve historical-analytics shape (bronze/silver/gold/platinum)", () => {
    assert.deepEqual(
      TIERS.map((t) => t.name),
      ["bronze", "silver", "gold", "platinum"],
    );
  });
});

// ── getTierProgress — basic placement ───────────────────────────────────

describe("getTierProgress — tier placement", () => {
  test("$0 lifetime → Visitor", () => {
    const p = getTierProgress(0);
    assert.equal(p.tier.label, "Visitor");
    assert.equal(p.nextTier?.label, "Regular");
  });

  test("$499 lifetime → Visitor (just below the $500 cliff)", () => {
    const p = getTierProgress(499);
    assert.equal(p.tier.label, "Visitor");
  });

  test("$500 lifetime → Regular (exact threshold inclusive)", () => {
    const p = getTierProgress(500);
    assert.equal(p.tier.label, "Regular");
    assert.equal(p.nextTier?.label, "Local");
  });

  test("$1999 lifetime → Regular", () => {
    const p = getTierProgress(1999);
    assert.equal(p.tier.label, "Regular");
  });

  test("$2000 lifetime → Local (exact threshold inclusive)", () => {
    const p = getTierProgress(2000);
    assert.equal(p.tier.label, "Local");
    assert.equal(p.nextTier?.label, "Family");
  });

  test("$5000 lifetime → Family (top tier)", () => {
    const p = getTierProgress(5000);
    assert.equal(p.tier.label, "Family");
    assert.equal(p.nextTier, null);
  });

  test("$50,000 lifetime → Family (no overflow tier)", () => {
    const p = getTierProgress(50000);
    assert.equal(p.tier.label, "Family");
    assert.equal(p.nextTier, null);
  });
});

// ── getTierProgress — toNext + progressPct ──────────────────────────────

describe("getTierProgress — toNext + progressPct", () => {
  test("$0 lifetime → toNext=500, progressPct=0", () => {
    const p = getTierProgress(0);
    assert.equal(p.toNext, 500);
    assert.equal(p.progressPct, 0);
  });

  test("$250 lifetime → toNext=250, progressPct=50 (halfway through Visitor band)", () => {
    const p = getTierProgress(250);
    assert.equal(p.toNext, 250);
    assert.equal(p.progressPct, 50);
  });

  test("$1250 lifetime → toNext=750 (halfway through $500-$2000 Regular band)", () => {
    const p = getTierProgress(1250);
    assert.equal(p.toNext, 750);
    assert.equal(p.progressPct, 50);
  });

  test("$5000 lifetime → toNext=null, progressPct=100 (top tier saturates)", () => {
    const p = getTierProgress(5000);
    assert.equal(p.toNext, null);
    assert.equal(p.progressPct, 100);
  });

  test("$10,000 lifetime (way past top) → progressPct=100 (no overflow)", () => {
    const p = getTierProgress(10000);
    assert.equal(p.progressPct, 100);
  });
});

// ── getTierProgress — defensive inputs ──────────────────────────────────

describe("getTierProgress — defensive inputs", () => {
  test("negative lifetime → clamps to Visitor", () => {
    const p = getTierProgress(-100);
    assert.equal(p.tier.label, "Visitor");
    assert.equal(p.progressPct, 0);
  });

  test("NaN lifetime → clamps to Visitor (|| 0 fallback)", () => {
    const p = getTierProgress(NaN);
    assert.equal(p.tier.label, "Visitor");
  });

  test("0 lifetime → toNext=500 (not the same as null)", () => {
    const p = getTierProgress(0);
    assert.equal(p.toNext, 500);
    assert.notEqual(p.toNext, null);
  });
});
