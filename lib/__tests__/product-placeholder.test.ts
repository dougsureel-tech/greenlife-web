// Pin tests for lib/product-placeholder.ts — placeholder gradient + icon
// for product cards lacking `image_url`. Stack-branded (GLW emerald
// default; SCC sister uses indigo). A regression here breaks the menu /
// brand / strain page visual chrome — patients see flat-stone
// placeholders instead of GLW's green tint.

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  getProductPlaceholderGradient,
  getProductPlaceholderIcon,
  PRODUCT_CATEGORY_ICONS,
} from "../product-placeholder.ts";

describe("getProductPlaceholderGradient — strain-priority for Flower / Pre-Rolls", () => {
  test("Flower + Sativa → red-orange-amber strain gradient (NOT category)", () => {
    const g = getProductPlaceholderGradient("Flower", "Sativa");
    assert.equal(g, "bg-gradient-to-br from-red-100 via-orange-50 to-amber-100");
  });
  test("Flower + Indica → purple-indigo-blue strain gradient", () => {
    const g = getProductPlaceholderGradient("Flower", "Indica");
    assert.equal(g, "bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100");
  });
  test("Flower + Hybrid → emerald-green-lime (GLW brand-tinted)", () => {
    const g = getProductPlaceholderGradient("Flower", "Hybrid");
    assert.equal(g, "bg-gradient-to-br from-emerald-100 via-green-50 to-lime-100");
  });
  test("Flower + CBD → sky-blue-cyan strain gradient", () => {
    const g = getProductPlaceholderGradient("Flower", "CBD");
    assert.equal(g, "bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100");
  });
  test("Pre-Rolls + Sativa → strain gradient (Pre-Rolls also strain-priority)", () => {
    const g = getProductPlaceholderGradient("Pre-Rolls", "Sativa");
    assert.equal(g, "bg-gradient-to-br from-red-100 via-orange-50 to-amber-100");
  });
  test("Pre-Roll (singular) + Indica → strain gradient (startsWith handles both)", () => {
    const g = getProductPlaceholderGradient("Pre-Roll", "Indica");
    assert.equal(g, "bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100");
  });
  test("Flower + UNKNOWN strain → falls through to DEFAULT (NOT category — there's no Flower category gradient)", () => {
    const g = getProductPlaceholderGradient("Flower", "AlienStrain");
    // Flower has no entry in CATEGORY_GRADIENTS, so falls to DEFAULT
    assert.equal(g, "bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50");
  });
  test("Flower + null strain → DEFAULT", () => {
    const g = getProductPlaceholderGradient("Flower", null);
    assert.equal(g, "bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50");
  });
});

describe("getProductPlaceholderGradient — category fallback for non-flower", () => {
  test("Edibles → amber-orange-yellow", () => {
    const g = getProductPlaceholderGradient("Edibles", null);
    assert.equal(g, "bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100");
  });
  test("Edible (singular) → same gradient as Edibles", () => {
    assert.equal(
      getProductPlaceholderGradient("Edible", null),
      getProductPlaceholderGradient("Edibles", null),
    );
  });
  test("Vapes / Cartridge / Cartridges / Disposable / Disposables / Pod / Pods → SAME violet-purple-indigo (single vape gradient)", () => {
    const expected = "bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100";
    for (const cat of ["Vapes", "Cartridge", "Cartridges", "Disposable", "Disposables", "Pod", "Pods"]) {
      assert.equal(getProductPlaceholderGradient(cat, null), expected, `${cat} should be vape-purple`);
    }
  });
  test("Concentrates / Concentrate → emerald-amber-orange (warm dab tint)", () => {
    assert.equal(
      getProductPlaceholderGradient("Concentrates", null),
      "bg-gradient-to-br from-emerald-50 via-amber-50 to-orange-100",
    );
    assert.equal(
      getProductPlaceholderGradient("Concentrate", null),
      "bg-gradient-to-br from-emerald-50 via-amber-50 to-orange-100",
    );
  });
  test("Beverages → cyan-sky-blue", () => {
    assert.equal(
      getProductPlaceholderGradient("Beverages", null),
      "bg-gradient-to-br from-cyan-100 via-sky-50 to-blue-100",
    );
  });
  test("Tinctures → teal-cyan-sky", () => {
    assert.equal(
      getProductPlaceholderGradient("Tinctures", null),
      "bg-gradient-to-br from-teal-100 via-cyan-50 to-sky-100",
    );
  });
  test("Topicals → rose-pink-fuchsia", () => {
    assert.equal(
      getProductPlaceholderGradient("Topicals", null),
      "bg-gradient-to-br from-rose-100 via-pink-50 to-fuchsia-100",
    );
  });
  test("Capsules / Capsule / Accessories / Accessory → emerald-green-lime (GLW brand-tinted)", () => {
    const expected = "bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50";
    for (const cat of ["Capsules", "Capsule", "Accessories", "Accessory"]) {
      assert.equal(getProductPlaceholderGradient(cat, null), expected, `${cat} should be GLW emerald`);
    }
  });
});

describe("getProductPlaceholderGradient — DEFAULT fallback (GLW emerald, NOT stone-neutral)", () => {
  const DEFAULT = "bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50";
  test("null category → DEFAULT", () => {
    assert.equal(getProductPlaceholderGradient(null, null), DEFAULT);
  });
  test("undefined category → DEFAULT", () => {
    assert.equal(getProductPlaceholderGradient(undefined, undefined), DEFAULT);
  });
  test("unknown category → DEFAULT", () => {
    assert.equal(getProductPlaceholderGradient("UnknownCategory", null), DEFAULT);
  });
  test("empty-string category → DEFAULT", () => {
    assert.equal(getProductPlaceholderGradient("", null), DEFAULT);
  });
});

describe("PRODUCT_CATEGORY_ICONS — emoji mapping", () => {
  test("Flower → 🌿 (signature green leaf)", () => {
    assert.equal(PRODUCT_CATEGORY_ICONS.Flower, "🌿");
  });
  test("Pre-Rolls + Pre-Roll → SAME 🫙 icon (plural + singular)", () => {
    assert.equal(PRODUCT_CATEGORY_ICONS["Pre-Rolls"], "🫙");
    assert.equal(PRODUCT_CATEGORY_ICONS["Pre-Roll"], "🫙");
  });
  test("All vape categories → 💨 (consistent across plural/singular variants)", () => {
    for (const cat of ["Vapes", "Cartridge", "Cartridges", "Disposable", "Disposables", "Pod", "Pods"]) {
      assert.equal(PRODUCT_CATEGORY_ICONS[cat], "💨", `${cat} should be 💨`);
    }
  });
  test("Concentrates → 💎 (gemstone for dab/wax)", () => {
    assert.equal(PRODUCT_CATEGORY_ICONS.Concentrates, "💎");
    assert.equal(PRODUCT_CATEGORY_ICONS.Concentrate, "💎");
  });
  test("Edibles → 🍬", () => {
    assert.equal(PRODUCT_CATEGORY_ICONS.Edibles, "🍬");
  });
  test("Beverages → 🥤", () => {
    assert.equal(PRODUCT_CATEGORY_ICONS.Beverages, "🥤");
  });
  test("Capsules → 💊", () => {
    assert.equal(PRODUCT_CATEGORY_ICONS.Capsules, "💊");
  });
  test("Tinctures → 💧 (water drop, NOT chemistry bottle)", () => {
    assert.equal(PRODUCT_CATEGORY_ICONS.Tinctures, "💧");
  });
  test("Topicals → 🧴 (lotion bottle)", () => {
    assert.equal(PRODUCT_CATEGORY_ICONS.Topicals, "🧴");
  });
  test("Accessories → 🛍️", () => {
    assert.equal(PRODUCT_CATEGORY_ICONS.Accessories, "🛍️");
  });
});

describe("getProductPlaceholderIcon — known category lookup + fallback", () => {
  test("known category → mapped emoji", () => {
    assert.equal(getProductPlaceholderIcon("Flower"), "🌿");
    assert.equal(getProductPlaceholderIcon("Edibles"), "🍬");
  });
  test("unknown category → 🌱 fallback (sprout — GLW theme)", () => {
    assert.equal(getProductPlaceholderIcon("UnknownCategory"), "🌱");
  });
  test("null → 🌱 fallback", () => {
    assert.equal(getProductPlaceholderIcon(null), "🌱");
  });
  test("undefined → 🌱 fallback", () => {
    assert.equal(getProductPlaceholderIcon(undefined), "🌱");
  });
  test("empty-string → 🌱 fallback (PRODUCT_CATEGORY_ICONS[''] is undefined)", () => {
    assert.equal(getProductPlaceholderIcon(""), "🌱");
  });
});
