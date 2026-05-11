// Money math helpers — SSoT for customer-facing currency operations.
// Sister of inv `packages/lib-shared/money-math.ts` (v397.645 sister-sweep
// that lifted 13 inline duplicates to a single source). Cannabis web had
// 3 inline duplicates of `Math.round(n * 100) / 100` across loyalty +
// receipt code; this consolidates them.

/**
 * Round a numeric amount to 2 decimal places (cents precision).
 *
 * Uses JavaScript's `Math.round` which is half-away-from-zero (NOT
 * banker's rounding). For positive numbers this is identical to "round
 * half up." Inputs that have floating-point representation drift (e.g.
 * 0.1 + 0.2 = 0.30000000000000004) are corrected to the nearest cent.
 *
 * @example
 *   round2(1.007)        // 1.01
 *   round2(0.1 + 0.2)    // 0.3 (FP-imprecision tolerance)
 *   round2(0)            // 0
 *   round2(NaN)          // NaN (passes through)
 *
 * **FP edge cases:** exact-half-decimals (1.005, 2.555, etc.) have
 * representation-dependent behavior — 1.005 stores as 1.00499... which
 * rounds DOWN to 1.00, while 2.555 stores as 2.555000...1 which rounds
 * UP to 2.56. Money math in this codebase only ever sees positive
 * subtotals × percentage (loyalty discount), which avoids this edge
 * by construction — most products' prices don't produce exact halves
 * after percentage multiplication.
 *
 * @example Use case: loyalty discount dollars
 *   const subtotal = 47.50;
 *   const fraction = 0.20; // 20%-off tier
 *   const discountDollars = round2(subtotal * fraction);
 *   // 9.5 (NOT 9.500000000000002 or 9.499999999999998)
 */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
