// Tests for `lib/loyalty-redemption.ts` — pure-function math used by
// `components/LoyaltyCard.tsx` + `app/order/OrderMenu.tsx`.
//
// Why pinned: mirror of the scc v13.9705 ship — this lib is a mirror of
// inventoryapp's source-of-truth tier model. A regression in the cliff
// at $75 (300-pt tier strict-less-than vs 400-pt tier inclusive) would
// silently mis-quote in-store redemption math on the public site the
// next time the LoyaltyCard reads from this module. Defense-in-depth
// against drift between this mirror and the inv source-of-truth.
//
// Run with:  node --test --experimental-strip-types lib/__tests__/loyalty-redemption.test.ts
// (or `pnpm test:all` once wired into package.json)

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  REDEMPTION_TIERS,
  eligibleRedemptionTiers,
  bestRedemptionTier,
  applyRedemptionTier,
} from "../loyalty-redemption.ts";

// ── REDEMPTION_TIERS constant ───────────────────────────────────────────

describe("REDEMPTION_TIERS", () => {
  test("has exactly 6 tiers (matches PLAN_LOYALTY_REDEMPTION_TIERS.md cliff)", () => {
    assert.equal(REDEMPTION_TIERS.length, 6);
  });

  test("point costs match Doug's spec: 50/100/200/250/300/400", () => {
    assert.deepEqual(
      REDEMPTION_TIERS.map((t) => t.pointCost),
      [50, 100, 200, 250, 300, 400],
    );
  });

  test("300-pt tier has maxOrderSubtotal=75 (under-$75 only)", () => {
    const t = REDEMPTION_TIERS.find((x) => x.pointCost === 300)!;
    assert.equal(t.maxOrderSubtotal, 75);
    assert.equal(t.minOrderSubtotal, undefined);
  });

  test("400-pt tier has minOrderSubtotal=75 ($75+ only)", () => {
    const t = REDEMPTION_TIERS.find((x) => x.pointCost === 400)!;
    assert.equal(t.minOrderSubtotal, 75);
    assert.equal(t.maxOrderSubtotal, undefined);
  });

  test("300 + 400 both 30% off — Doug's intentional cliff at $75", () => {
    const t300 = REDEMPTION_TIERS.find((x) => x.pointCost === 300)!;
    const t400 = REDEMPTION_TIERS.find((x) => x.pointCost === 400)!;
    assert.equal(t300.discountPct, 0.3);
    assert.equal(t400.discountPct, 0.3);
  });
});

// ── eligibleRedemptionTiers ─────────────────────────────────────────────

describe("eligibleRedemptionTiers", () => {
  test("0 balance, 0 subtotal → no tiers", () => {
    assert.equal(eligibleRedemptionTiers(0, 0).length, 0);
  });

  test("49 balance, any subtotal → no tiers (under 50-pt floor)", () => {
    assert.equal(eligibleRedemptionTiers(49, 50).length, 0);
    assert.equal(eligibleRedemptionTiers(49, 200).length, 0);
  });

  test("50 balance, $50 order → exactly the 5% tier", () => {
    const tiers = eligibleRedemptionTiers(50, 50);
    assert.equal(tiers.length, 1);
    assert.equal(tiers[0]!.pointCost, 50);
  });

  test("250 balance, $50 order → 5/10/20/25 tiers (300+400 cliff-gated)", () => {
    const tiers = eligibleRedemptionTiers(250, 50);
    assert.deepEqual(tiers.map((t) => t.pointCost), [50, 100, 200, 250]);
  });

  test("300 balance, $50 order → 5/10/20/25/30-under-75 (400 still cliff-gated)", () => {
    const tiers = eligibleRedemptionTiers(300, 50);
    assert.deepEqual(tiers.map((t) => t.pointCost), [50, 100, 200, 250, 300]);
  });

  test("400 balance, $75 order → 5/10/20/25/30-over-75 (300 EXCLUDED at exact boundary)", () => {
    // 300-pt tier has maxOrderSubtotal=75 STRICT — at $75 exactly, NOT eligible.
    // 400-pt tier has minOrderSubtotal=75 INCLUSIVE — at $75 exactly, eligible.
    const tiers = eligibleRedemptionTiers(400, 75);
    assert.deepEqual(tiers.map((t) => t.pointCost), [50, 100, 200, 250, 400]);
  });

  test("400 balance, $74.99 → 300 eligible, 400 excluded", () => {
    const tiers = eligibleRedemptionTiers(400, 74.99);
    assert.ok(tiers.some((t) => t.pointCost === 300));
    assert.ok(!tiers.some((t) => t.pointCost === 400));
  });

  test("400 balance, $75.01 → 400 eligible, 300 excluded", () => {
    const tiers = eligibleRedemptionTiers(400, 75.01);
    assert.ok(!tiers.some((t) => t.pointCost === 300));
    assert.ok(tiers.some((t) => t.pointCost === 400));
  });
});

// ── bestRedemptionTier ──────────────────────────────────────────────────

describe("bestRedemptionTier", () => {
  test("returns null when no tiers eligible", () => {
    assert.equal(bestRedemptionTier(49, 100), null);
  });

  test("picks the higher discount-pct when both eligible", () => {
    // 200-pt 20% beats 50-pt 5% on a $50 order
    const best = bestRedemptionTier(200, 50);
    assert.equal(best?.pointCost, 200);
    assert.equal(best?.discountPct, 0.2);
  });

  test("at 300+400 cliff: prefers the cheaper 300 tier at $74.99 (same 30%)", () => {
    // Both can hit 30% but 300 is the cheaper cost — customer should
    // never overpay points when discount is equal.
    const best = bestRedemptionTier(400, 74.99);
    assert.equal(best?.pointCost, 300);
  });

  test("at exact $75: must pick 400 (300 ineligible)", () => {
    const best = bestRedemptionTier(400, 75);
    assert.equal(best?.pointCost, 400);
  });

  test("250 balance, $50 order → picks 25% off (250-pt), not 20%", () => {
    const best = bestRedemptionTier(250, 50);
    assert.equal(best?.pointCost, 250);
    assert.equal(best?.discountPct, 0.25);
  });
});

// ── applyRedemptionTier ─────────────────────────────────────────────────

describe("applyRedemptionTier", () => {
  test("5% off $20 → $1 discount, $19 net", () => {
    const tier = REDEMPTION_TIERS[0]!; // 50-pt 5%
    const res = applyRedemptionTier(tier, 20);
    assert.equal(res?.discountDollars, 1);
    assert.equal(res?.netSubtotal, 19);
  });

  test("10% off $33.33 → $3.33 discount (penny-round half-up)", () => {
    const tier = REDEMPTION_TIERS[1]!; // 100-pt 10%
    const res = applyRedemptionTier(tier, 33.33);
    // 33.33 * 0.10 = 3.333 → rounds to 3.33
    assert.equal(res?.discountDollars, 3.33);
    assert.equal(res?.netSubtotal, 30);
  });

  test("rounds 0.005 half-up to 0.01 (banker's rounding NOT used)", () => {
    // 0.05 * 0.10 = 0.005 — JS Math.round on 0.005 is platform-dependent
    // (Math.round(0.005) returns 0 on Node — JS doesn't do banker's). We
    // multiply by 100 first → 0.5 → Math.round(0.5) = 1 → / 100 = 0.01.
    // Penny-precision matters for register reconciliation.
    const tier = REDEMPTION_TIERS[1]!; // 10%
    const res = applyRedemptionTier(tier, 0.05);
    assert.equal(res?.discountDollars, 0.01);
    assert.equal(res?.netSubtotal, 0.04);
  });

  test("netSubtotal never goes negative (Math.max floor)", () => {
    const tier = REDEMPTION_TIERS[5]!; // 30% off $75+
    const res = applyRedemptionTier(tier, 100);
    assert.ok((res?.netSubtotal ?? -1) >= 0);
  });

  test("returns null when order subtotal violates max cap", () => {
    const tier300 = REDEMPTION_TIERS[4]!; // 300-pt 30% under-$75
    // $75 exact → maxOrderSubtotal=75 strict less-than → NOT eligible
    assert.equal(applyRedemptionTier(tier300, 75), null);
    assert.equal(applyRedemptionTier(tier300, 80), null);
  });

  test("returns null when order subtotal under min floor", () => {
    const tier400 = REDEMPTION_TIERS[5]!; // 400-pt 30% $75+
    assert.equal(applyRedemptionTier(tier400, 74.99), null);
    assert.equal(applyRedemptionTier(tier400, 50), null);
  });

  test("applies at exact floor inclusive", () => {
    const tier400 = REDEMPTION_TIERS[5]!;
    const res = applyRedemptionTier(tier400, 75);
    assert.equal(res?.discountDollars, 22.5);
    assert.equal(res?.netSubtotal, 52.5);
  });

  test("does NOT apply at exact cap (strict less-than)", () => {
    const tier300 = REDEMPTION_TIERS[4]!;
    // tier max=75 → 75 should be EXCLUDED per maxOrderSubtotal semantics
    assert.equal(applyRedemptionTier(tier300, 75), null);
  });
});
