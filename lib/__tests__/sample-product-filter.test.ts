// Tests for `lib/sample-product-filter.ts` — the employee-only "Sample"
// product guard applied to the customer-facing product fetchers in lib/db.ts.
//
// Why pinned: Kat (SCC reviewer-feedback 1a4546cd) — staff "Sample" testers
// must NEVER reach a customer-facing menu surface ("customers cannot see them
// or know about them"). A regression here leaks employee samples onto the
// native menu / Just-In / stash. Subtractive guard: it can only hide.
//
// Run with:  pnpm test:all

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { isEmployeeSampleProduct } from "../sample-product-filter.ts";

describe("isEmployeeSampleProduct", () => {
  test("hides products with 'Sample' in the name (case-insensitive)", () => {
    assert.equal(isEmployeeSampleProduct("Blue Dream SAMPLE", "Flower"), true);
    assert.equal(isEmployeeSampleProduct("sample pre-roll", "Preroll"), true);
    assert.equal(isEmployeeSampleProduct("Employee Sample Pack", null), true);
  });

  test("hides products marked category 'sample' (case-insensitive)", () => {
    assert.equal(isEmployeeSampleProduct("Gelato 41", "Sample"), true);
    assert.equal(isEmployeeSampleProduct("Gelato 41", "sample"), true);
    assert.equal(isEmployeeSampleProduct(null, "Samples"), true);
  });

  test("keeps real customer products with normal names + categories", () => {
    assert.equal(isEmployeeSampleProduct("Blue Dream", "Flower"), false);
    assert.equal(isEmployeeSampleProduct("Wyld Raspberry Gummies", "Edibles"), false);
    assert.equal(isEmployeeSampleProduct("Live Resin Cart", "Vape"), false);
  });

  test("handles null/undefined name + category without throwing", () => {
    assert.equal(isEmployeeSampleProduct(null, null), false);
    assert.equal(isEmployeeSampleProduct(undefined, undefined), false);
    assert.equal(isEmployeeSampleProduct("", ""), false);
  });
});
