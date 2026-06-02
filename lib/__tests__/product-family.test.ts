// Pin tests — product-family parser + grouping.
//
// Coverage: extractSize patterns (gram / pack-gram / mg / no-size) on
// real-prod SCC name strings; familyKey grouping invariants;
// groupByFamily aggregation (sizes label, min/max price, median THC,
// DOH-any, isMultiSize flag, member sort).

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  extractSize,
  familyKey,
  groupByFamily,
  type FamilyGroup,
} from "../product-family.ts";
import type { MenuProduct } from "../db.ts";

// Synthetic MenuProduct factory — only the fields product-family cares about
// have meaningful defaults; everything else stays at the type minimum so a
// future MenuProduct schema change can't false-positive these pins.
function mp(overrides: Partial<MenuProduct> & { id: string; name: string }): MenuProduct {
  return {
    brand: null,
    category: null,
    strainType: null,
    thcPct: null,
    cbdPct: null,
    unitPrice: null,
    imageUrl: null,
    effects: null,
    terpenes: null,
    isNew: false,
    isDohCompliant: false,
    ...overrides,
  };
}

describe("extractSize — gram patterns", () => {
  it("parses single grams: '28g - Cookies - Ballin Cannabis - Flower - H'", () => {
    const r = extractSize("28g - Cookies - Ballin Cannabis - Flower - H");
    assert.equal(r.sizeGrams, 28);
    assert.equal(r.sizeLabel, "28g");
    assert.equal(r.stripped, "Cookies - Ballin Cannabis - Flower - H");
    assert.equal(r.sortKey, 28000);
  });

  it("parses fractional grams: '3.5g - Gelato Cake - Agro Couture - Flower - H'", () => {
    const r = extractSize("3.5g - Gelato Cake - Agro Couture - Flower - H");
    assert.equal(r.sizeGrams, 3.5);
    assert.equal(r.sizeLabel, "3.5g");
    assert.equal(r.stripped, "Gelato Cake - Agro Couture - Flower - H");
    assert.equal(r.sortKey, 3500);
  });

  it("parses leading-dot grams: '.5g - Live Resin - Crystal Clear - Cart - I'", () => {
    const r = extractSize(".5g - Live Resin - Crystal Clear - Cart - I");
    assert.equal(r.sizeGrams, 0.5);
    assert.equal(r.sizeLabel, ".5g");
    assert.equal(r.stripped, "Live Resin - Crystal Clear - Cart - I");
    assert.equal(r.sortKey, 500);
  });

  it("parses 1g cartridge: '1g - Melon Bar - MicroBar - DOH Cartridge - Disposable - S'", () => {
    const r = extractSize("1g - Melon Bar - MicroBar - DOH Cartridge - Disposable - S");
    assert.equal(r.sizeGrams, 1);
    assert.equal(r.sizeLabel, "1g");
    assert.equal(r.stripped, "Melon Bar - MicroBar - DOH Cartridge - Disposable - S");
  });

  it("trims whitespace around size token", () => {
    const r = extractSize("  28g  -  Cookies - Ballin Cannabis - Flower - H  ");
    assert.equal(r.sizeGrams, 28);
    assert.equal(r.stripped, "Cookies - Ballin Cannabis - Flower - H");
  });
});

describe("extractSize — pack patterns", () => {
  it("parses '2pk - .5g' preroll pack: real SCC Bondi pattern", () => {
    const r = extractSize(
      "2pk - .5g - Cherry Dosidos - Bondi - Preroll - Pack - DOH Compliant - I",
    );
    assert.equal(r.sizeGrams, 1); // 2 × 0.5 = 1g total
    assert.equal(r.sizeLabel, "2pk-.5g");
    assert.equal(
      r.stripped,
      "Cherry Dosidos - Bondi - Preroll - Pack - DOH Compliant - I",
    );
    assert.equal(r.sortKey, 1000);
  });

  it("parses '10pk - .5g' preroll pack", () => {
    const r = extractSize(
      "10pk - .5g - Super Silver Lemon Haze - Bondi - Preroll - Pack - DOH Compliant - S",
    );
    assert.equal(r.sizeGrams, 5); // 10 × 0.5
    assert.equal(r.sizeLabel, "10pk-.5g");
  });

  it("parses '5pk - 1g' preroll pack", () => {
    const r = extractSize(
      "5pk - 1g - Wedding Cake - Ooowee - Preroll - DOH Compliant - H",
    );
    assert.equal(r.sizeGrams, 5);
    assert.equal(r.sizeLabel, "5pk-1g");
  });
});

describe("extractSize — mg / no-size patterns", () => {
  it("parses '100mg' edibles: '100mg - Mango - Canna Cantina - DOH Drink - H'", () => {
    const r = extractSize("100mg - Mango - Canna Cantina - DOH Drink - H");
    assert.equal(r.sizeGrams, null); // mg products have no gram equivalent
    assert.equal(r.sizeLabel, "100mg");
    assert.equal(r.stripped, "Mango - Canna Cantina - DOH Drink - H");
    assert.equal(r.sortKey, 100);
  });

  it("returns no-size shape when name has no recognized token", () => {
    const r = extractSize("Gelato Cake");
    assert.equal(r.sizeGrams, null);
    assert.equal(r.sizeLabel, null);
    assert.equal(r.stripped, "Gelato Cake");
    assert.equal(r.sortKey, 0);
  });

  it("handles empty string defensively", () => {
    const r = extractSize("");
    assert.equal(r.sizeGrams, null);
    assert.equal(r.sizeLabel, null);
    assert.equal(r.stripped, "");
  });
});

describe("familyKey — grouping invariants", () => {
  it("groups same brand + stripped-name across sizes", () => {
    const a = mp({
      id: "a",
      name: "1g - Cookies - Ballin Cannabis - Flower - H",
      brand: "Ballin Cannabis",
    });
    const b = mp({
      id: "b",
      name: "3.5g - Cookies - Ballin Cannabis - Flower - H",
      brand: "Ballin Cannabis",
    });
    const c = mp({
      id: "c",
      name: "28g - Cookies - Ballin Cannabis - Flower - H",
      brand: "Ballin Cannabis",
    });
    assert.equal(familyKey(a), familyKey(b));
    assert.equal(familyKey(b), familyKey(c));
  });

  it("groups 2pk and 10pk pre-rolls of same strain + brand", () => {
    const small = mp({
      id: "small",
      name: "2pk - .5g - Cherry Dosidos - Bondi - Preroll - Pack - DOH Compliant - I",
      brand: "Bondi Farms",
    });
    const big = mp({
      id: "big",
      name: "10pk - .5g - Cherry Dosidos - Bondi - Preroll - Pack - DOH Compliant - I",
      brand: "Bondi Farms",
    });
    assert.equal(familyKey(small), familyKey(big));
  });

  it("SEPARATES products with same name but different brand", () => {
    const cookiesA = mp({
      id: "a",
      name: "1g - Cookies - Vendor A - Flower - H",
      brand: "Vendor A",
    });
    const cookiesB = mp({
      id: "b",
      name: "1g - Cookies - Vendor B - Flower - H",
      brand: "Vendor B",
    });
    // Different brand → different family even if stripped name same.
    assert.notEqual(familyKey(cookiesA), familyKey(cookiesB));
  });

  it("SEPARATES different strains of same brand", () => {
    const cookies = mp({
      id: "ck",
      name: "1g - Cookies - Brand - Flower - H",
      brand: "Brand",
    });
    const haze = mp({
      id: "hz",
      name: "1g - Haze - Brand - Flower - S",
      brand: "Brand",
    });
    assert.notEqual(familyKey(cookies), familyKey(haze));
  });

  it("handles null brand via __NO_BRAND__ sentinel", () => {
    const nullBrandA = mp({
      id: "a",
      name: "1g - Mystery - Flower - H",
      brand: null,
    });
    const nullBrandB = mp({
      id: "b",
      name: "3.5g - Mystery - Flower - H",
      brand: null,
    });
    assert.equal(familyKey(nullBrandA), familyKey(nullBrandB));
  });

  it("case-insensitive brand + name match", () => {
    const upper = mp({
      id: "u",
      name: "1g - COOKIES - BRAND - Flower - H",
      brand: "BRAND",
    });
    const lower = mp({
      id: "l",
      name: "3.5g - cookies - brand - Flower - H",
      brand: "brand",
    });
    assert.equal(familyKey(upper), familyKey(lower));
  });
});

describe("groupByFamily — aggregation + render shape", () => {
  it("returns empty array for empty input", () => {
    const r = groupByFamily([]);
    assert.deepEqual(r, []);
  });

  it("returns single-member family with isMultiSize=false", () => {
    const r = groupByFamily([
      mp({
        id: "alone",
        name: "1g - SoloStrain - Brand - Cart - I",
        brand: "Brand",
        unitPrice: 30,
        thcPct: 25,
      }),
    ]);
    assert.equal(r.length, 1);
    assert.equal(r[0].isMultiSize, false);
    assert.equal(r[0].sizesLabel, "1g");
    assert.equal(r[0].minPrice, 30);
    assert.equal(r[0].maxPrice, 30);
    assert.equal(r[0].thcDisplay, 25);
  });

  it("groups Cookies 1g/3.5g/28g into one family, sorted asc by grams", () => {
    const r = groupByFamily([
      mp({
        id: "big",
        name: "28g - Cookies - Brand - Flower - H",
        brand: "Brand",
        unitPrice: 200,
        thcPct: 26,
      }),
      mp({
        id: "small",
        name: "1g - Cookies - Brand - Flower - H",
        brand: "Brand",
        unitPrice: 12,
        thcPct: 25,
      }),
      mp({
        id: "med",
        name: "3.5g - Cookies - Brand - Flower - H",
        brand: "Brand",
        unitPrice: 40,
        thcPct: 27,
      }),
    ]);
    assert.equal(r.length, 1);
    const g = r[0];
    assert.equal(g.isMultiSize, true);
    // Members sorted ascending by grams: 1g, 3.5g, 28g
    assert.deepEqual(
      g.members.map((m) => m.id),
      ["small", "med", "big"],
    );
    assert.equal(g.sizesLabel, "(1g, 3.5g, 28g)");
    assert.equal(g.minPrice, 12);
    assert.equal(g.maxPrice, 200);
    // Median of [25, 26, 27] = 26 → rounded to 26.0
    assert.equal(g.thcDisplay, 26);
    assert.equal(g.displayName, "Cookies - Brand - Flower - H");
    assert.equal(g.brand, "Brand");
  });

  it("dohAny=true if any member is DOH-compliant", () => {
    const r = groupByFamily([
      mp({
        id: "a",
        name: "1g - Strain - Brand - Cart - I",
        brand: "Brand",
        isDohCompliant: false,
      }),
      mp({
        id: "b",
        name: "3.5g - Strain - Brand - Cart - I",
        brand: "Brand",
        isDohCompliant: true,
      }),
    ]);
    assert.equal(r.length, 1);
    assert.equal(r[0].dohAny, true);
  });

  it("dohAny=false when no member is DOH-compliant", () => {
    const r = groupByFamily([
      mp({
        id: "a",
        name: "1g - Strain - Brand - Cart - I",
        brand: "Brand",
        isDohCompliant: false,
      }),
      mp({
        id: "b",
        name: "3.5g - Strain - Brand - Cart - I",
        brand: "Brand",
        isDohCompliant: false,
      }),
    ]);
    assert.equal(r[0].dohAny, false);
  });

  it("median THC rounds to nearest 0.5 (24.7 → 24.5)", () => {
    const r = groupByFamily([
      mp({
        id: "a",
        name: "1g - Strain - Brand - Cart - I",
        brand: "Brand",
        thcPct: 24.7,
      }),
    ]);
    assert.equal(r[0].thcDisplay, 24.5);
  });

  it("median THC rounds half-up (24.75 → 25.0)", () => {
    const r = groupByFamily([
      mp({
        id: "a",
        name: "1g - Strain - Brand - Cart - I",
        brand: "Brand",
        thcPct: 24.75,
      }),
    ]);
    assert.equal(r[0].thcDisplay, 25);
  });

  it("thcDisplay=null when no member has THC reported", () => {
    const r = groupByFamily([
      mp({
        id: "a",
        name: "1g - Strain - Brand - Cart - I",
        brand: "Brand",
        thcPct: null,
      }),
      mp({
        id: "b",
        name: "3.5g - Strain - Brand - Cart - I",
        brand: "Brand",
        thcPct: null,
      }),
    ]);
    assert.equal(r[0].thcDisplay, null);
  });

  it("min/max price excludes null-priced members", () => {
    const r = groupByFamily([
      mp({
        id: "a",
        name: "1g - Strain - Brand - Cart - I",
        brand: "Brand",
        unitPrice: null,
      }),
      mp({
        id: "b",
        name: "3.5g - Strain - Brand - Cart - I",
        brand: "Brand",
        unitPrice: 40,
      }),
      mp({
        id: "c",
        name: "28g - Strain - Brand - Cart - I",
        brand: "Brand",
        unitPrice: 200,
      }),
    ]);
    assert.equal(r[0].minPrice, 40);
    assert.equal(r[0].maxPrice, 200);
  });

  it("min/max price null when ALL members have null price", () => {
    const r = groupByFamily([
      mp({
        id: "a",
        name: "1g - Strain - Brand - Cart - I",
        brand: "Brand",
        unitPrice: null,
      }),
      mp({
        id: "b",
        name: "3.5g - Strain - Brand - Cart - I",
        brand: "Brand",
        unitPrice: null,
      }),
    ]);
    assert.equal(r[0].minPrice, null);
    assert.equal(r[0].maxPrice, null);
  });

  it("preserves cross-family separation in mixed batch", () => {
    const r = groupByFamily([
      mp({
        id: "cookies-1g",
        name: "1g - Cookies - Brand - Flower - H",
        brand: "Brand",
      }),
      mp({
        id: "haze-1g",
        name: "1g - Haze - Brand - Flower - S",
        brand: "Brand",
      }),
      mp({
        id: "cookies-28g",
        name: "28g - Cookies - Brand - Flower - H",
        brand: "Brand",
      }),
    ]);
    assert.equal(r.length, 2);
    const families = new Map<string, FamilyGroup>(r.map((g) => [g.displayName, g]));
    const cookies = families.get("Cookies - Brand - Flower - H");
    assert.ok(cookies);
    assert.equal(cookies.members.length, 2);
    const haze = families.get("Haze - Brand - Flower - S");
    assert.ok(haze);
    assert.equal(haze.members.length, 1);
  });

  it("realistic mixed SCC sample produces expected family count", () => {
    // 5 products → 3 families:
    //  - Cherry Dosidos Bondi Preroll (2pk + 10pk variants) = family 1
    //  - Grape Pie Crystal Clear Live Resin Cart = family 2 (single)
    //  - Cookies Ballin (1g + 28g) = family 3
    const r = groupByFamily([
      mp({
        id: "cd-2pk",
        name: "2pk - .5g - Cherry Dosidos - Bondi - Preroll - Pack - DOH Compliant - I",
        brand: "Bondi Farms",
      }),
      mp({
        id: "cd-10pk",
        name: "10pk - .5g - Cherry Dosidos - Bondi - Preroll - Pack - DOH Compliant - I",
        brand: "Bondi Farms",
      }),
      mp({
        id: "gp",
        name: "1g - Grape Pie - Crystal Clear - Live Resin - DOH Cartridge - Disposable - I",
        brand: "Crystal Clear",
      }),
      mp({
        id: "ck-1g",
        name: "1g - Cookies - Ballin Cannabis - Flower - H",
        brand: "Ballin Cannabis",
      }),
      mp({
        id: "ck-28g",
        name: "28g - Cookies - Ballin Cannabis - Flower - H",
        brand: "Ballin Cannabis",
      }),
    ]);
    assert.equal(r.length, 3);
    const multiSize = r.filter((g) => g.isMultiSize);
    const singleSize = r.filter((g) => !g.isMultiSize);
    assert.equal(multiSize.length, 2);
    assert.equal(singleSize.length, 1);
    assert.equal(singleSize[0].displayName.startsWith("Grape Pie"), true);
  });
});
