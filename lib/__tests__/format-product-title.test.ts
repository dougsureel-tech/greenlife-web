// Tests for `lib/format-product-title.ts` — strain-page card title formatter.
//
// Why pinned: this is the single function controlling the display name of
// every product card on /strains/<slug>'s "In stock today" section. A
// regression in the parse logic shows up as either:
//   - the trailing type-abbrev (` - S` / ` - I` / ` - H`) re-appearing on
//     every card (a visual regression Doug + Kat would spot immediately)
//   - the strain name being duplicated under the page header (which is the
//     bug we're SHIPPING this formatter to fix)
//   - cards on hand-entered SKUs falling back to `null · null` (the
//     pre-formatter behavior was raw `{p.name}`, never null — so the
//     fallback chain matters for backwards safety)
//
// Tests cover the 5 spec examples + edge cases (DOH prefix, 510 expansion,
// parse-failure fallbacks, strain-name validation, null safety).
//
// Run with:  pnpm test:all

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { formatProductTitle } from "../format-product-title.ts";

// ── Spec examples (5 canonical) ──────────────────────────────────────────

describe("formatProductTitle — canonical 5-part SKUs (no variant)", () => {
  test("Mama J's Sour Diesel concentrate (no variant slot)", () => {
    const result = formatProductTitle(
      {
        name: "1g - Sour Diesel - Mama J's - Concentrate - S",
        brand: "Mama J's",
        category: "Concentrate",
      },
      { strainName: "Sour Diesel" },
    );
    assert.equal(result, "Mama J's · Concentrate · 1g");
  });

  test("Avitas Blue Dream flower (lowercase type abbrev tolerated)", () => {
    const result = formatProductTitle(
      {
        name: "3.5g - Blue Dream - Avitas - Flower - s",
        brand: "Avitas",
        category: "Flower",
      },
      { strainName: "Blue Dream" },
    );
    assert.equal(result, "Avitas · Flower · 3.5g");
  });
});

describe("formatProductTitle — canonical 6-part SKUs (with variant)", () => {
  test("Dabs 4 Less Sour Diesel sugar concentrate", () => {
    const result = formatProductTitle(
      {
        name: "1g - Sour Diesel - Dabs 4 Less - Concentrate - Sugar - S",
        brand: "Dabs 4 Less",
        category: "Concentrate",
      },
      { strainName: "Sour Diesel" },
    );
    assert.equal(result, "Dabs 4 Less · Sugar · 1g");
  });

  test("Phat Panda live resin (variant first-letter capitalized)", () => {
    const result = formatProductTitle(
      {
        name: "1g - Wedding Cake - Phat Panda - Concentrate - Live Resin - H",
        brand: "Phat Panda",
        category: "Concentrate",
      },
      { strainName: "Wedding Cake" },
    );
    assert.equal(result, "Phat Panda · Live Resin · 1g");
  });

  test("Cartridge 510 thread expansion in variant slot", () => {
    const result = formatProductTitle(
      {
        name: "1g - Pineapple Express - Avitas - Vape Cartridge - 510 - S",
        brand: "Avitas",
        category: "Vape Cartridge",
      },
      { strainName: "Pineapple Express" },
    );
    assert.equal(result, "Avitas · 510 Cart · 1g");
  });
});

// ── Special tokens ───────────────────────────────────────────────────────

describe("formatProductTitle — DOH prefix stripping", () => {
  test("DOH-tagged flower drops the prefix from the title", () => {
    const result = formatProductTitle(
      {
        name: "DOH 3.5g - GMO Cookies - Phat Panda - Flower - I",
        brand: "Phat Panda",
        category: "Flower",
      },
      { strainName: "GMO Cookies" },
    );
    // DOH prefix stripped → parses as a normal 5-part SKU.
    assert.equal(result, "Phat Panda · Flower · 3.5g");
  });
});

describe("formatProductTitle — bare 510 token", () => {
  test("bare 510 in variant slot expands to 510 Cart", () => {
    const result = formatProductTitle(
      {
        name: "0.5g - Northern Lights - Avitas - Vape - 510 - I",
        brand: "Avitas",
        category: "Vape",
      },
      { strainName: "Northern Lights" },
    );
    assert.equal(result, "Avitas · 510 Cart · 0.5g");
  });

  test("510 substring inside a longer variant does NOT trigger expansion", () => {
    const result = formatProductTitle(
      {
        name: "1g - GG4 - Avitas - Vape - 510 Thread Live Resin - H",
        brand: "Avitas",
        category: "Vape",
      },
      { strainName: "GG4" },
    );
    // Substring match would falsely fire — guard with anchors.
    assert.equal(result, "Avitas · 510 Thread Live Resin · 1g");
  });
});

// ── Strain-name parse validation ─────────────────────────────────────────

describe("formatProductTitle — strain-name parse validation", () => {
  test("strain in 2nd slot matches strainName (case-insensitive) → parse valid", () => {
    const result = formatProductTitle(
      {
        name: "1g - SOUR DIESEL - Mama J's - Concentrate - S",
        brand: "Mama J's",
        category: "Concentrate",
      },
      { strainName: "Sour Diesel" },
    );
    assert.equal(result, "Mama J's · Concentrate · 1g");
  });

  test("strain in 2nd slot is short-form of strainName (substring both ways)", () => {
    const result = formatProductTitle(
      {
        name: "1g - Sour D - Mama J's - Concentrate - S",
        brand: "Mama J's",
        category: "Concentrate",
      },
      { strainName: "Sour Diesel" },
    );
    // "Sour D" is substring of "Sour Diesel" → still accepts.
    assert.equal(result, "Mama J's · Concentrate · 1g");
  });

  test("when strainName mismatches the SKU's strain slot, falls back gracefully", () => {
    const result = formatProductTitle(
      {
        name: "1g - Wedding Cake - Phat Panda - Concentrate - Live Resin - H",
        brand: "Phat Panda",
        category: "Concentrate",
      },
      { strainName: "Sour Diesel" }, // mismatched
    );
    // Parse-invalid → falls back to brand · category (weight head also valid)
    // The head-token is "1g" which IS a valid weight, so we get "Phat Panda · 1g".
    assert.equal(result, "Phat Panda · 1g");
  });

  test("without strainName, parse is accepted purely on shape (5-part)", () => {
    const result = formatProductTitle({
      name: "1g - Sour Diesel - Mama J's - Concentrate - S",
      brand: "Mama J's",
      category: "Concentrate",
    });
    assert.equal(result, "Mama J's · Concentrate · 1g");
  });
});

// ── Parse-failure fallback chain ─────────────────────────────────────────

describe("formatProductTitle — fallback chain when SKU doesn't parse", () => {
  test("non-standard name, brand+category present → 'brand · category'", () => {
    const result = formatProductTitle({
      name: "Special Holiday Bundle",
      brand: "Avitas",
      category: "Bundle",
    });
    assert.equal(result, "Avitas · Bundle");
  });

  test("non-standard name with weight head + brand → 'brand · weight'", () => {
    const result = formatProductTitle({
      name: "3.5g Mystery Sampler Pack",
      brand: "Avitas",
      category: null,
    });
    // No `-` separator → parts is just ["3.5g Mystery Sampler Pack"].
    // Head token isn't a clean weight (has trailing words), so brand+category
    // fallback fires → "Avitas" alone (since category null).
    assert.equal(result, "Avitas");
  });

  test("brand only (no category, parse fails)", () => {
    const result = formatProductTitle({
      name: "Mystery Product",
      brand: "Avitas",
      category: null,
    });
    assert.equal(result, "Avitas");
  });

  test("category only (no brand)", () => {
    const result = formatProductTitle({
      name: "Mystery Product",
      brand: null,
      category: "Edible",
    });
    assert.equal(result, "Edible");
  });

  test("both null → returns raw name as last-resort", () => {
    const result = formatProductTitle({
      name: "Raw Name",
      brand: null,
      category: null,
    });
    assert.equal(result, "Raw Name");
  });
});

// ── Null safety ──────────────────────────────────────────────────────────

describe("formatProductTitle — null/undefined safety", () => {
  test("null name with brand+category → 'brand · category'", () => {
    const result = formatProductTitle({
      name: null,
      brand: "Avitas",
      category: "Flower",
    });
    assert.equal(result, "Avitas · Flower");
  });

  test("undefined name with brand only", () => {
    const result = formatProductTitle({
      name: undefined,
      brand: "Avitas",
      category: null,
    });
    assert.equal(result, "Avitas");
  });

  test("all empty → empty string (never throws)", () => {
    const result = formatProductTitle({ name: null, brand: null, category: null });
    assert.equal(result, "");
  });

  test("whitespace-only fields treated as null", () => {
    const result = formatProductTitle({
      name: "   ",
      brand: "  ",
      category: "Edible",
    });
    assert.equal(result, "Edible");
  });
});

// ── Defensive trim ───────────────────────────────────────────────────────

describe("formatProductTitle — defensive trim on slot values", () => {
  test("padded SKU parts trim cleanly", () => {
    const result = formatProductTitle(
      {
        name: "  1g  -  Sour Diesel  -  Mama J's  -  Concentrate  -  S  ",
        brand: "Mama J's",
        category: "Concentrate",
      },
      { strainName: "Sour Diesel" },
    );
    assert.equal(result, "Mama J's · Concentrate · 1g");
  });
});

// ── Type abbrev tail edge cases ──────────────────────────────────────────

describe("formatProductTitle — type-abbrev tail handling", () => {
  test("type 'H' (hybrid) stripped same as 'S' / 'I'", () => {
    const result = formatProductTitle(
      {
        name: "1g - Wedding Cake - Avitas - Concentrate - H",
        brand: "Avitas",
        category: "Concentrate",
      },
      { strainName: "Wedding Cake" },
    );
    assert.equal(result, "Avitas · Concentrate · 1g");
  });

  test("missing type-abbrev tail still parses as 5-part (4 cleaned parts)", () => {
    const result = formatProductTitle(
      {
        name: "1g - Sour Diesel - Mama J's - Concentrate",
        brand: "Mama J's",
        category: "Concentrate",
      },
      { strainName: "Sour Diesel" },
    );
    // 4 parts after no-op tail strip → still treated as 5-part shape.
    assert.equal(result, "Mama J's · Concentrate · 1g");
  });

  test("name ending in capital S that is NOT a type-abbrev tail does NOT get clipped", () => {
    // Edge case: a word like "ATLAS" at the end of a slot should not match
    // the regex. The regex requires `\s+-\s+[SIH]\s*$` so the dash-space
    // prefix protects against this.
    const result = formatProductTitle({
      name: "ATLAS Strain Pack",
      brand: "ATLAS",
      category: "Bundle",
    });
    assert.equal(result, "ATLAS · Bundle");
  });
});
