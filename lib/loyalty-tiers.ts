// Customer-facing loyalty tiers — mirrors the inventoryapp tier model but
// trimmed to the fields the public site renders (label + threshold). The
// tier names are relationship vocabulary, not generic metals: Visitor →
// Regular → Local → Family.
//
// Source of truth lives in `Inventory App/src/lib/loyalty.ts`. Mirror keeps
// the public site self-contained — no cross-package import. If thresholds
// shift in inventoryapp, mirror the change here in the same push.

export type CustomerTier = {
  /** Internal name kept stable for any historical analytics references. */
  name: "bronze" | "silver" | "gold" | "platinum";
  /** Customer-facing label — relationship vocabulary, not generic metals. */
  label: "Visitor" | "Regular" | "Local" | "Family";
  /** Lifetime spend (post-tax dollars) at which this tier unlocks. */
  minSpend: number;
};

export const TIERS: readonly CustomerTier[] = [
  { name: "bronze", label: "Visitor", minSpend: 0 },
  { name: "silver", label: "Regular", minSpend: 500 },
  { name: "gold", label: "Local", minSpend: 2000 },
  { name: "platinum", label: "Family", minSpend: 5000 },
];

export type TierProgress = {
  tier: CustomerTier;
  nextTier: CustomerTier | null;
  /** Dollars from the next tier; null at top tier. */
  toNext: number | null;
  /** 0..100 progress through the current tier band. 100 at top tier. */
  progressPct: number;
};

/**
 * Return the customer's current tier + progress toward the next tier given
 * lifetime post-tax spend (matches the canonical `customers.loyalty_points`
 * earn basis used by the POS).
 */
export function getTierProgress(lifetimeSpent: number): TierProgress {
  const safe = Math.max(0, lifetimeSpent || 0);
  let tier = TIERS[0]!;
  for (const t of TIERS) {
    if (safe >= t.minSpend) tier = t;
  }
  const idx = TIERS.indexOf(tier);
  const nextTier = idx < TIERS.length - 1 ? TIERS[idx + 1]! : null;
  const toNext = nextTier ? Math.max(0, nextTier.minSpend - safe) : null;
  const progressPct =
    nextTier == null
      ? 100
      : Math.min(100, ((safe - tier.minSpend) / (nextTier.minSpend - tier.minSpend)) * 100);
  return { tier, nextTier, toNext, progressPct };
}
