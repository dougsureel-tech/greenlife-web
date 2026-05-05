// Pure-function loyalty tier math — mirrored from inventoryapp lib/loyalty-redemption.ts.
// No server-only import: these functions run in both Server Components and Client Components.
// Keep in sync with inventoryapp when tier constants change.

export type RedemptionTier = {
  pointCost: number;
  discountFraction: number;
  label: string;
  minOrderSubtotal?: number; // 400pt tier: order must be >= $75
  maxOrderSubtotal?: number; // 300pt tier: order must be < $75 (strict)
};

export const REDEMPTION_TIERS: RedemptionTier[] = [
  { pointCost: 50, discountFraction: 0.05, label: "5% off" },
  { pointCost: 100, discountFraction: 0.10, label: "10% off" },
  { pointCost: 200, discountFraction: 0.20, label: "20% off" },
  { pointCost: 250, discountFraction: 0.25, label: "25% off" },
  { pointCost: 300, discountFraction: 0.30, label: "30% off (under $75)", maxOrderSubtotal: 75 },
  { pointCost: 400, discountFraction: 0.30, label: "30% off ($75+)", minOrderSubtotal: 75 },
];

export function eligibleRedemptionTiers(balance: number, orderSubtotal: number): RedemptionTier[] {
  return REDEMPTION_TIERS.filter((t) => {
    if (balance < t.pointCost) return false;
    if (t.maxOrderSubtotal != null && orderSubtotal >= t.maxOrderSubtotal) return false;
    if (t.minOrderSubtotal != null && orderSubtotal < t.minOrderSubtotal) return false;
    return true;
  });
}

export function bestRedemptionTier(balance: number, orderSubtotal: number): RedemptionTier | null {
  const eligible = eligibleRedemptionTiers(balance, orderSubtotal);
  if (eligible.length === 0) return null;
  return eligible.reduce((best, t) =>
    t.discountFraction > best.discountFraction ||
    (t.discountFraction === best.discountFraction && t.pointCost < best.pointCost)
      ? t
      : best,
  );
}

export function applyRedemptionTier(
  tier: RedemptionTier,
  orderSubtotal: number,
): { discountDollars: number; netSubtotal: number } | null {
  if (tier.maxOrderSubtotal != null && orderSubtotal >= tier.maxOrderSubtotal) return null;
  if (tier.minOrderSubtotal != null && orderSubtotal < tier.minOrderSubtotal) return null;
  const rawDiscount = orderSubtotal * tier.discountFraction;
  const discountDollars = Math.round(rawDiscount * 100) / 100;
  return { discountDollars, netSubtotal: Math.max(0, orderSubtotal - discountDollars) };
}
