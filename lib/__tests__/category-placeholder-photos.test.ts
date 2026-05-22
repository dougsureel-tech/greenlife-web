// Pin tests for lib/category-placeholder-photos.ts — generic stock-photo
// placeholders per category (the "fallback above the fallback" tier in
// the product-image chain). A regression here breaks the visual menu —
// products with no real photo + no brand-logo fall to the CategoryIcon
// SVG instead of the nicer stock-photo placeholder.
//
// LOCKSTEP invariant: every slug in CATEGORY_PLACEHOLDER_SLUGS MUST
// have a corresponding /public/category-placeholders/<slug>.jpg on disk.
// Drift = broken-image icon in production.

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  getCategoryPlaceholderPhoto,
  CATEGORY_PLACEHOLDER_SLUGS,
} from "../category-placeholder-photos.ts";

describe("getCategoryPlaceholderPhoto — happy-path category → JPG path", () => {
  test("Flower → /category-placeholders/flower.jpg", () => {
    assert.equal(getCategoryPlaceholderPhoto("Flower"), "/category-placeholders/flower.jpg");
  });
  test("Pre-Roll (singular) → /category-placeholders/preroll.jpg", () => {
    assert.equal(getCategoryPlaceholderPhoto("Pre-Roll"), "/category-placeholders/preroll.jpg");
  });
  test("Pre-Rolls (plural) → SAME preroll.jpg", () => {
    assert.equal(getCategoryPlaceholderPhoto("Pre-Rolls"), "/category-placeholders/preroll.jpg");
  });
  test("Concentrate → /category-placeholders/concentrate.jpg", () => {
    assert.equal(getCategoryPlaceholderPhoto("Concentrate"), "/category-placeholders/concentrate.jpg");
  });
  test("Concentrates plural → SAME", () => {
    assert.equal(
      getCategoryPlaceholderPhoto("Concentrates"),
      getCategoryPlaceholderPhoto("Concentrate"),
    );
  });
});

describe("getCategoryPlaceholderPhoto — vape-family aliases collapse to single placeholder", () => {
  // Mirror of lib/product-placeholder.ts CATEGORY_GRADIENTS where ALL vape
  // aliases use the same gradient. Same collapse here. Regression risk:
  // someone adds a new vape alias but only updates one mapping.
  const expected = "/category-placeholders/vape.jpg";
  test("Vape singular", () => {
    assert.equal(getCategoryPlaceholderPhoto("Vape"), expected);
  });
  test("Vapes plural", () => {
    assert.equal(getCategoryPlaceholderPhoto("Vapes"), expected);
  });
  test("Cartridge", () => {
    assert.equal(getCategoryPlaceholderPhoto("Cartridge"), expected);
  });
  test("Cartridges", () => {
    assert.equal(getCategoryPlaceholderPhoto("Cartridges"), expected);
  });
  test("Disposable", () => {
    assert.equal(getCategoryPlaceholderPhoto("Disposable"), expected);
  });
  test("Disposables", () => {
    assert.equal(getCategoryPlaceholderPhoto("Disposables"), expected);
  });
  test("Pod", () => {
    assert.equal(getCategoryPlaceholderPhoto("Pod"), expected);
  });
  test("Pods", () => {
    assert.equal(getCategoryPlaceholderPhoto("Pods"), expected);
  });
});

describe("getCategoryPlaceholderPhoto — singular + plural parity across categories", () => {
  const pairs: Array<[string, string]> = [
    ["Tincture", "Tinctures"],
    ["Topical", "Topicals"],
    ["Beverage", "Beverages"],
    ["Capsule", "Capsules"],
  ];
  for (const [singular, plural] of pairs) {
    test(`${singular} === ${plural}`, () => {
      assert.equal(
        getCategoryPlaceholderPhoto(singular),
        getCategoryPlaceholderPhoto(plural),
      );
      assert.notEqual(getCategoryPlaceholderPhoto(singular), null);
    });
  }
});

describe("getCategoryPlaceholderPhoto — fallback (null) for un-mapped + degenerate inputs", () => {
  test("null → null (caller falls through to CategoryIcon SVG)", () => {
    assert.equal(getCategoryPlaceholderPhoto(null), null);
  });
  test("undefined → null", () => {
    assert.equal(getCategoryPlaceholderPhoto(undefined), null);
  });
  test("empty string → null", () => {
    assert.equal(getCategoryPlaceholderPhoto(""), null);
  });
  test("unknown category → null", () => {
    assert.equal(getCategoryPlaceholderPhoto("UnknownCategory"), null);
  });
  test("case-mismatch (lowercase 'flower') → null (mapping IS case-sensitive — matches DB convention)", () => {
    // The Dutchie-synced DB stores Title-Case category strings. Lowercase
    // 'flower' is NOT mapped on purpose — a regression that adds case-
    // insensitive matching here could silently mask DB-side category-
    // string corruption.
    assert.equal(getCategoryPlaceholderPhoto("flower"), null);
  });
  test("trailing-whitespace ('Flower ') → null (no trim)", () => {
    // Same reasoning — input shape comes from controlled DB strings.
    // Pinning current-behavior catches an over-eager normalization regression.
    assert.equal(getCategoryPlaceholderPhoto("Flower "), null);
  });
});

describe("getCategoryPlaceholderPhoto — path shape invariants", () => {
  test("path always starts with '/category-placeholders/'", () => {
    const cats = ["Flower", "Pre-Roll", "Vape", "Concentrate", "Tincture", "Topical", "Beverage", "Capsule"];
    for (const c of cats) {
      const p = getCategoryPlaceholderPhoto(c);
      assert.ok(p?.startsWith("/category-placeholders/"), `${c} path malformed: ${p}`);
    }
  });
  test("path always ends with '.jpg' (Next/Image expects file extension)", () => {
    for (const c of ["Flower", "Vape", "Beverage"]) {
      const p = getCategoryPlaceholderPhoto(c);
      assert.ok(p?.endsWith(".jpg"), `${c} not jpg: ${p}`);
    }
  });
});

describe("CATEGORY_PLACEHOLDER_SLUGS — manifest of slugs that must have JPGs on disk", () => {
  test("has exactly 8 entries (current state pin — bump when a new placeholder ships)", () => {
    assert.equal(CATEGORY_PLACEHOLDER_SLUGS.size, 8);
  });
  test("includes all 8 expected slugs", () => {
    const expected = ["flower", "preroll", "vape", "concentrate", "tincture", "topical", "beverage", "capsule"];
    for (const slug of expected) {
      assert.ok(CATEGORY_PLACEHOLDER_SLUGS.has(slug as never), `missing ${slug}`);
    }
  });
  test("is a ReadonlySet (immutable manifest)", () => {
    assert.ok(CATEGORY_PLACEHOLDER_SLUGS instanceof Set);
  });
  test("LOCKSTEP invariant: every value returned by getCategoryPlaceholderPhoto matches a slug in CATEGORY_PLACEHOLDER_SLUGS", () => {
    // For every category in the runtime mapping, the slug embedded in the
    // returned path MUST be in CATEGORY_PLACEHOLDER_SLUGS. Catches drift
    // where the mapping points to a slug not in the manifest (→ 404 in
    // prod even if pin passes).
    const cats = ["Flower", "Pre-Roll", "Vape", "Concentrate", "Tincture", "Topical", "Beverage", "Capsule"];
    for (const c of cats) {
      const p = getCategoryPlaceholderPhoto(c);
      assert.ok(p, `${c} missing path`);
      const slug = p!.replace("/category-placeholders/", "").replace(".jpg", "");
      assert.ok(CATEGORY_PLACEHOLDER_SLUGS.has(slug as never), `${c} → slug ${slug} not in manifest`);
    }
  });
});
