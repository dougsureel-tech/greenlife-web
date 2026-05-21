// Tests for `lib/medical-pricing.ts` — WA DOH-verified-patient tax-exempt
// pricing. Strips cannabis excise (37%) + local sales tax from shelf
// prices for SKU/customer combinations that qualify under
// RCW 82.08.9998 + RCW 69.50.535(6)(a).
//
// Why pinned: this is the price the customer pays. A regression that
// (a) returns the rec price unchanged, (b) double-strips the excise,
// or (c) flips a null-input to a 0 price would either over-charge the
// medical customer or under-charge the store on tax-reportable revenue.
//
// SCC + GLW diverge in DEFAULT_SALES_TAX_RATE (10.55% Seattle vs 8.8%
// Wenatchee), so the divisor differs by stack. Tests assert
// stack-portable INVARIANTS via the exported `CANNABIS_TAX_SAVINGS_PCT`
// rather than hardcoded prices — same test file runs on both stacks.
//
// Run with:  pnpm test:all

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  CANNABIS_TAX_SAVINGS_PCT,
  medicalNoTaxPrice,
} from "../medical-pricing.ts";

// ── Exported constant shape ─────────────────────────────────────────────

describe("CANNABIS_TAX_SAVINGS_PCT", () => {
  test("is a number", () => {
    assert.equal(typeof CANNABIS_TAX_SAVINGS_PCT, "number");
    assert.ok(Number.isFinite(CANNABIS_TAX_SAVINGS_PCT));
  });

  test("is in the expected 30-35% range (37% excise + 8-11% local stripped)", () => {
    // SCC Seattle: 37% + 10.55% → divisor 1.4755 → savings ~32.2%
    // GLW Wenatchee: 37% + 8.8% → divisor 1.458 → savings ~31.4%
    // Both fall in [30, 35].
    assert.ok(CANNABIS_TAX_SAVINGS_PCT >= 30, `expected >=30, got ${CANNABIS_TAX_SAVINGS_PCT}`);
    assert.ok(CANNABIS_TAX_SAVINGS_PCT <= 35, `expected <=35, got ${CANNABIS_TAX_SAVINGS_PCT}`);
  });

  test("rounded to 1 decimal place", () => {
    // (val * 10) should be very close to an integer
    const x10 = CANNABIS_TAX_SAVINGS_PCT * 10;
    const rounded = Math.round(x10);
    assert.ok(Math.abs(x10 - rounded) < 0.0001, `not rounded to 1 decimal: ${CANNABIS_TAX_SAVINGS_PCT}`);
  });
});

// ── medicalNoTaxPrice — null handling ───────────────────────────────────

describe("medicalNoTaxPrice — null/zero handling", () => {
  test("null returns null (preserve tri-state for missing prices)", () => {
    assert.equal(medicalNoTaxPrice(null), null);
  });

  test("0 returns 0 (free SKUs stay free)", () => {
    assert.equal(medicalNoTaxPrice(0), 0);
  });
});

// ── medicalNoTaxPrice — sanity bounds ───────────────────────────────────

describe("medicalNoTaxPrice — sanity bounds", () => {
  test("$10 shelf → strictly less than $10 (always strips some tax)", () => {
    const out = medicalNoTaxPrice(10);
    assert.ok(out !== null);
    assert.ok(out < 10, `expected <10, got ${out}`);
  });

  test("$10 shelf → strictly more than $5 (shouldn't strip >50%)", () => {
    const out = medicalNoTaxPrice(10);
    assert.ok(out !== null);
    assert.ok(out > 5, `expected >5, got ${out}`);
  });

  test("$100 shelf → between $65-$75 (33% savings ± both stacks)", () => {
    const out = medicalNoTaxPrice(100);
    assert.ok(out !== null);
    assert.ok(out >= 65 && out <= 75, `expected $65-75, got ${out}`);
  });

  test("positive shelf always returns positive medical (never zero or negative)", () => {
    for (const p of [1, 5, 25, 50, 100, 250, 999]) {
      const out = medicalNoTaxPrice(p);
      assert.ok(out !== null && out > 0, `medical for $${p} was ${out}`);
    }
  });

  test("monotonic — higher shelf produces higher medical", () => {
    const a = medicalNoTaxPrice(10);
    const b = medicalNoTaxPrice(50);
    const c = medicalNoTaxPrice(100);
    assert.ok(a !== null && b !== null && c !== null);
    assert.ok(a < b);
    assert.ok(b < c);
  });
});

// ── medicalNoTaxPrice — rounding ────────────────────────────────────────

describe("medicalNoTaxPrice — cents-precision rounding", () => {
  test("output rounded to 2 decimal places", () => {
    for (const p of [9.99, 12.34, 100, 250]) {
      const out = medicalNoTaxPrice(p);
      assert.ok(out !== null);
      // out * 100 should be close to an integer (within FP noise)
      const x100 = out * 100;
      const rounded = Math.round(x100);
      assert.ok(Math.abs(x100 - rounded) < 0.0001, `not 2dp: ${out} (=${x100})`);
    }
  });
});

// ── round-trip via CANNABIS_TAX_SAVINGS_PCT ─────────────────────────────

describe("medicalNoTaxPrice — savings-pct round trip", () => {
  test("savings_pct of $100 shelf ≈ exported CANNABIS_TAX_SAVINGS_PCT", () => {
    const out = medicalNoTaxPrice(100);
    assert.ok(out !== null);
    const actualSavings = ((100 - out) / 100) * 100;
    // Allow 0.5pp tolerance for rounding
    assert.ok(
      Math.abs(actualSavings - CANNABIS_TAX_SAVINGS_PCT) < 0.5,
      `expected ${CANNABIS_TAX_SAVINGS_PCT}%, got ${actualSavings.toFixed(2)}%`,
    );
  });
});
