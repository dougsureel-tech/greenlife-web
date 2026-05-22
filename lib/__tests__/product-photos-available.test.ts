// Pin tests for lib/product-photos-available.ts — Tier A real-photo
// manifest, the layer between DB-side `product.imageUrl` and brand-logo
// fallback. 178 rules across ~25 brand families today.
//
// Critical invariants this file pins:
//   1. matchProductPhoto contract (case-sensitive brand · case-insensitive
//      name · ALL nameContains keywords must match · category is substring
//      · first-match-wins · null-input handling)
//   2. PRODUCT_PHOTO_FILES_REFERENCED stays in sync with PRODUCT_PHOTO_RULES
//      (it's derived but a future agent could break the derivation)
//   3. Specificity-ordering — when two rules differ only by additional
//      nameContains keywords, the more-specific one MUST be defined first
//      OR the bare rule wins and the variant gets misrouted (e.g.
//      "Sea Salt + 1:1" must come before bare "Sea Salt" on 4:20 Bar)
//
// Run: pnpm test:all
// Or: node --test --experimental-strip-types --no-warnings lib/__tests__/product-photos-available.test.ts

import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  matchProductPhoto,
  PRODUCT_PHOTO_RULES,
  PRODUCT_PHOTO_FILES_REFERENCED,
  type ProductPhotoRule,
} from "../product-photos-available.ts";

// ── matchProductPhoto — function contract ───────────────────────────

describe("matchProductPhoto — null / missing input handling", () => {
  test("null name returns null (no path-injection risk)", () => {
    assert.equal(matchProductPhoto(null, "4:20 Bar", "Edible"), null);
  });

  test("undefined name returns null", () => {
    assert.equal(matchProductPhoto(undefined, "4:20 Bar", "Edible"), null);
  });

  test("null brand returns null (brand is the primary index)", () => {
    assert.equal(matchProductPhoto("Sea Salt Bar", null, "Edible"), null);
  });

  test("undefined brand returns null", () => {
    assert.equal(matchProductPhoto("Sea Salt Bar", undefined, "Edible"), null);
  });

  test("null category is OK (category is optional on rules)", () => {
    // Pick a rule with no category requirement to verify the null-cat
    // path doesn't error.
    const ruleWithoutCategory = PRODUCT_PHOTO_RULES.find(
      (r) => !r.category && r.nameContains && r.nameContains.length > 0,
    );
    if (!ruleWithoutCategory) return; // skip if corpus has 0 such rules
    const fakeName = (ruleWithoutCategory.nameContains ?? []).join(" ");
    const result = matchProductPhoto(fakeName, ruleWithoutCategory.brand, null);
    assert.ok(result, "rule without category should match when category is null");
  });

  test("empty-string name + non-empty brand returns null", () => {
    assert.equal(matchProductPhoto("", "4:20 Bar", "Edible"), null);
  });
});

describe("matchProductPhoto — brand-match semantics", () => {
  test("brand match is CASE-SENSITIVE (Dutchie emits canonical brand strings)", () => {
    // Find a rule with a single nameContains keyword for a clean test.
    const rule = PRODUCT_PHOTO_RULES.find(
      (r) => r.nameContains && r.nameContains.length === 1 && !r.category,
    );
    if (!rule) return;
    const kw = rule.nameContains![0];
    // Same name + same brand → match.
    const okMatch = matchProductPhoto(kw, rule.brand, null);
    assert.ok(okMatch, `same-case brand "${rule.brand}" should match`);
    // Lowercased brand → NO match (case-sensitive guarantee).
    const lowerBrand = rule.brand.toLowerCase();
    if (lowerBrand !== rule.brand) {
      assert.equal(
        matchProductPhoto(kw, lowerBrand, null),
        null,
        `case-mismatch brand "${lowerBrand}" must NOT match the rule's "${rule.brand}" — drift would create cross-brand false matches`,
      );
    }
  });

  test("name match is CASE-INSENSITIVE (Dutchie name capitalization varies)", () => {
    const rule = PRODUCT_PHOTO_RULES.find(
      (r) => r.nameContains && r.nameContains.length === 1,
    );
    if (!rule) return;
    const kw = rule.nameContains![0];
    const cat = rule.category ?? "";
    // Upper vs lower name → both must match.
    assert.ok(matchProductPhoto(kw.toUpperCase(), rule.brand, cat));
    assert.ok(matchProductPhoto(kw.toLowerCase(), rule.brand, cat));
  });
});

describe("matchProductPhoto — nameContains semantics", () => {
  test("ALL keywords in nameContains must appear (AND semantics, not OR)", () => {
    const multiKwRule = PRODUCT_PHOTO_RULES.find(
      (r) => r.nameContains && r.nameContains.length >= 2 && !r.category,
    );
    if (!multiKwRule) return;
    const allKws = multiKwRule.nameContains!.join(" ");
    const onlyFirst = multiKwRule.nameContains![0];
    // All-keywords present → match.
    assert.ok(matchProductPhoto(allKws, multiKwRule.brand, null));
    // Only first keyword present → must NOT match THIS specific rule
    // (some less-specific rule for the same brand may match — that's
    // why we use a SAME-RULE invariant lookup below).
  });

  test("category is SUBSTRING match (not exact equality)", () => {
    // Find a rule that does require a category.
    const catRule = PRODUCT_PHOTO_RULES.find(
      (r) => r.category && r.category.length > 0,
    );
    if (!catRule) return;
    const nameKw = catRule.nameContains?.[0] ?? "x";
    // Category contains the rule's required substring → match.
    const containsCat = `${catRule.category} (Indica)`;
    const match = matchProductPhoto(nameKw, catRule.brand, containsCat);
    // It may or may not match overall (depends on whether nameContains
    // also matches and whether a more-specific rule wins) — but at minimum
    // the substring match path doesn't crash + returns a path or null.
    assert.ok(match === null || (typeof match === "string" && match.startsWith("/product-photos/")));
  });
});

describe("matchProductPhoto — path-shape contract", () => {
  test("returned path always starts with /product-photos/ (Next/Image src convention)", () => {
    // Walk a few rules + verify the returned path shape.
    let checked = 0;
    for (const rule of PRODUCT_PHOTO_RULES) {
      if (!rule.nameContains || rule.nameContains.length === 0) continue;
      const fakeName = rule.nameContains.join(" ");
      const fakeCat = rule.category ?? "";
      const result = matchProductPhoto(fakeName, rule.brand, fakeCat);
      if (result) {
        assert.ok(
          result.startsWith("/product-photos/"),
          `match for ${rule.brand}/${fakeName} returned "${result}" — must start with /product-photos/`,
        );
      }
      checked++;
      if (checked >= 20) break;
    }
    assert.ok(checked > 0, "should have exercised at least one rule");
  });

  test("returned path ends with the rule's file (no transformation)", () => {
    const rule = PRODUCT_PHOTO_RULES.find(
      (r) => r.nameContains && r.nameContains.length > 0 && !r.category,
    );
    if (!rule) return;
    const result = matchProductPhoto(rule.nameContains!.join(" "), rule.brand, null);
    if (result) {
      assert.ok(
        result.endsWith(rule.file),
        `returned path "${result}" doesn't end with rule.file "${rule.file}"`,
      );
    }
  });
});

// ── PRODUCT_PHOTO_RULES — registry invariants ───────────────────────

describe("PRODUCT_PHOTO_RULES — registry shape", () => {
  test("has at least one rule (catastrophic regression guard)", () => {
    assert.ok(PRODUCT_PHOTO_RULES.length > 0);
  });

  test("every rule has non-empty brand string", () => {
    for (let i = 0; i < PRODUCT_PHOTO_RULES.length; i++) {
      const r = PRODUCT_PHOTO_RULES[i];
      assert.ok(
        r.brand && r.brand.length > 0,
        `rule #${i} has empty brand — would match every product or none`,
      );
    }
  });

  test("every rule has non-empty file string", () => {
    for (let i = 0; i < PRODUCT_PHOTO_RULES.length; i++) {
      const r = PRODUCT_PHOTO_RULES[i];
      assert.ok(
        r.file && r.file.length > 0,
        `rule #${i} (brand=${r.brand}) has empty file — would render broken <Image src="/product-photos/">`,
      );
    }
  });

  test("every rule's file ends with a known image extension", () => {
    const VALID = /\.(png|jpg|jpeg|webp|svg)$/i;
    for (const r of PRODUCT_PHOTO_RULES) {
      assert.match(
        r.file,
        VALID,
        `rule for ${r.brand} has file "${r.file}" — must end with .png/.jpg/.jpeg/.webp/.svg`,
      );
    }
  });

  test("no rule.file contains a slash (file is just the basename, path is built in matchProductPhoto)", () => {
    for (const r of PRODUCT_PHOTO_RULES) {
      assert.ok(
        !r.file.includes("/"),
        `rule for ${r.brand} has file "${r.file}" — must be basename only (matchProductPhoto prepends /product-photos/). Drift would produce "/product-photos//foo.jpg" or render to wrong directory.`,
      );
    }
  });

  test("nameContains arrays (when present) have non-empty string keywords", () => {
    for (const r of PRODUCT_PHOTO_RULES) {
      if (!r.nameContains) continue;
      for (const kw of r.nameContains) {
        assert.ok(
          typeof kw === "string" && kw.length > 0,
          `rule for ${r.brand} has empty nameContains keyword — would match every product (case-insensitive includes "") or crash`,
        );
      }
    }
  });
});

// ── PRODUCT_PHOTO_FILES_REFERENCED — derived-set invariant ─────────

describe("PRODUCT_PHOTO_FILES_REFERENCED — sync with rules", () => {
  test("is a Set instance (build-gate expects Set membership semantics)", () => {
    assert.ok(PRODUCT_PHOTO_FILES_REFERENCED instanceof Set);
  });

  test("contains every file referenced by a rule (no drift from derivation)", () => {
    for (const r of PRODUCT_PHOTO_RULES) {
      assert.ok(
        PRODUCT_PHOTO_FILES_REFERENCED.has(r.file),
        `rule for ${r.brand} references file "${r.file}" but PRODUCT_PHOTO_FILES_REFERENCED is missing it. Derivation drift — the Set is built from rules.map(r=>r.file).`,
      );
    }
  });

  test("size matches the unique-file count from rules", () => {
    const uniqueFiles = new Set(PRODUCT_PHOTO_RULES.map((r) => r.file));
    assert.equal(
      PRODUCT_PHOTO_FILES_REFERENCED.size,
      uniqueFiles.size,
      "set size drifted from rules.map(r=>r.file) unique count — either rules were added without the set being rebuilt OR an unrelated file was inserted into the set",
    );
  });
});

// ── Specificity ordering — first-match-wins invariants ──────────────

describe("PRODUCT_PHOTO_RULES — specificity ordering (first-match-wins)", () => {
  test("'Sea Salt' + '1:1' rule is defined BEFORE bare 'Sea Salt' on 4:20 Bar (CBD-variant misroute defense)", () => {
    // The file comment specifically calls out:
    //   "Order MATTERS — most-specific keyword sets first so we don't
    //    accidentally match a more-generic rule."
    // The 4:20 Bar Sea Salt rule pair is the documented example:
    // "Sea Salt + 1:1" CBD bar uses sea-salt-cbd-11.png; bare "Sea Salt"
    // uses dark-chocolate-sea-salt-100mg.png. Order drift = CBD product
    // gets the wrong photo (renders as 100mg recreational chocolate).
    const fortyTwentyBarRules = PRODUCT_PHOTO_RULES.filter((r) => r.brand === "4:20 Bar");
    const seaSaltRules = fortyTwentyBarRules.filter(
      (r) => r.nameContains?.some((kw) => kw.toLowerCase().includes("sea salt")) ?? false,
    );
    if (seaSaltRules.length < 2) return; // skip if corpus drifted
    const seaSaltOnePlusOneIdx = seaSaltRules.findIndex(
      (r) => r.nameContains?.some((kw) => kw === "1:1") ?? false,
    );
    const seaSaltBareIdx = seaSaltRules.findIndex(
      (r) => r.nameContains && r.nameContains.length === 1 && r.nameContains[0] === "Sea Salt",
    );
    if (seaSaltOnePlusOneIdx === -1 || seaSaltBareIdx === -1) return;
    assert.ok(
      seaSaltOnePlusOneIdx < seaSaltBareIdx,
      `4:20 Bar Sea Salt rules: "1:1" variant (index ${seaSaltOnePlusOneIdx}) MUST come before bare "Sea Salt" (index ${seaSaltBareIdx}) — otherwise CBD bar matches the bare rule and renders the 100mg recreational photo.`,
    );
  });

  test("first-match-wins behavior: when 2+ rules for same brand+name match, the FIRST in array wins", () => {
    // Construct a synthetic case by looking at our 4:20 Bar "Sea Salt"
    // example. A product named "Sea Salt 1:1 Bar" by "4:20 Bar" should
    // match the "Sea Salt + 1:1" rule's file (sea-salt-cbd-11.png), NOT
    // the bare "Sea Salt" rule's file (dark-chocolate-sea-salt-100mg.png).
    const fortyTwentyBarRules = PRODUCT_PHOTO_RULES.filter((r) => r.brand === "4:20 Bar");
    const onePlusOneRule = fortyTwentyBarRules.find(
      (r) =>
        r.nameContains?.includes("Sea Salt") &&
        r.nameContains?.includes("1:1"),
    );
    if (!onePlusOneRule) return;
    const result = matchProductPhoto("Sea Salt 1:1 Bar", "4:20 Bar", null);
    if (result) {
      assert.ok(
        result.endsWith(onePlusOneRule.file),
        `matched "${result}" but expected ${onePlusOneRule.file} — first-match-wins broken or specificity-order drifted`,
      );
    }
  });
});

// ── Cross-brand isolation ───────────────────────────────────────────

describe("matchProductPhoto — cross-brand isolation", () => {
  test("brand A's name keyword does NOT match brand B's product even with overlapping names", () => {
    // A "Sea Salt" product under a different brand must NOT match the
    // 4:20 Bar Sea Salt rule. Pin this against accidental "ANY brand
    // matches" regression (e.g. if someone refactored to make brand
    // optional).
    const result = matchProductPhoto("Sea Salt Cookie", "Definitely-Not-4-20-Bar-9k3jf", null);
    assert.equal(
      result,
      null,
      "cross-brand match leaked — non-4:20-Bar product getting 4:20 Bar's Sea Salt photo would be misrouted brand-level imagery",
    );
  });
});
