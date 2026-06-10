// Customer-facing redemption tier list — mirror of inventoryapp's
// src/lib/loyalty-redemption.ts:REDEMPTION_TIERS.
//
// Source-of-truth lives in the Inventory App repo; the public site
// duplicates the constant data because (a) cross-repo imports aren't
// configured and (b) tier changes warrant a coordinated deploy of
// both projects anyway. If the inventoryapp tier list changes, this
// file MUST be updated in lockstep.
//
// Why mirror instead of fetch from an API endpoint:
//   - Tier list is small + stable
//   - No network round-trip on every page render
//   - Drift risk is low because Doug spec'd the cliff explicitly:
//     50/100/200/250/300-under-$75/400-over-$75 per
//     PLAN_LOYALTY_REDEMPTION_TIERS.md — won't change without a
//     deliberate decision that touches both repos.
//
// Sister-port of seattle-cannabis-web/lib/redemption-tiers.ts (byte-
// identical — tiers are shared across both stores in the inventoryapp
// SSoT). Last sync: 2026-05-07 (matches inventoryapp v168.X).

export type RedemptionTier = {
  pointCost: number;
  discountPct: number;
  label: string;
  /** Strict less-than cap; null = no cap. Customer at register: order
   *  subtotal must be < cap to redeem this tier. */
  maxOrderSubtotal: number | null;
  /** Floor; null = no floor. Customer at register: order subtotal must
   *  be ≥ floor to redeem this tier. */
  minOrderSubtotal: number | null;
};

export const REDEMPTION_TIERS: readonly RedemptionTier[] = [
  { pointCost: 50, discountPct: 0.05, label: "5% off", maxOrderSubtotal: null, minOrderSubtotal: null },
  { pointCost: 100, discountPct: 0.1, label: "10% off", maxOrderSubtotal: null, minOrderSubtotal: null },
  { pointCost: 200, discountPct: 0.2, label: "20% off", maxOrderSubtotal: null, minOrderSubtotal: null },
  { pointCost: 250, discountPct: 0.25, label: "25% off", maxOrderSubtotal: null, minOrderSubtotal: null },
  { pointCost: 300, discountPct: 0.3, label: "30% off (under $75)", maxOrderSubtotal: 75, minOrderSubtotal: null },
  { pointCost: 400, discountPct: 0.3, label: "30% off ($75+)", maxOrderSubtotal: null, minOrderSubtotal: 75 },
] as const;
