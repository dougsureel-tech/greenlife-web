// Tests for `lib/online-pricing.ts` — online-floor pricing engine. Every
// product on /menu shows a strikethrough original + a discounted price;
// the BIGGER of (20% online floor, daily-deal %) wins; deals do NOT
// stack on top of the floor.
//
// Why pinned: customer-facing pricing math. The discounted price is the
// REAL cart charge (Path A semantics, Doug greenlit 2026-05-16). A
// regression that returns the rec price as displayPrice would silently
// undercharge or overcharge depending on direction; a regression that
// double-applies the floor on top of a deal would over-discount.
//
// Sister-port — SCC + GLW lib files differ only in comment block (WAC
// 314-55-077 framing on GLW); the export shape + math are identical.
//
// Run with:  pnpm test:all

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  ONLINE_DISCOUNT_PCT,
  findDealForProduct,
  effectivePriceFor,
} from "../online-pricing.ts";

import type { ActiveDeal, MenuProduct } from "../db.ts";

// ── ONLINE_DISCOUNT_PCT constant ────────────────────────────────────────

describe("ONLINE_DISCOUNT_PCT", () => {
  test("is exactly 20 (Doug 2026-05-16 minimum online floor)", () => {
    assert.equal(ONLINE_DISCOUNT_PCT, 20);
  });
});

// ── Fixture builders ────────────────────────────────────────────────────

function makeDeal(overrides: Partial<ActiveDeal> = {}): ActiveDeal {
  return {
    short: "Test Deal",
    appliesTo: "all",
    discountType: "percent",
    discountValue: 25,
    ...overrides,
  } as ActiveDeal;
}

// ── findDealForProduct ──────────────────────────────────────────────────

describe("findDealForProduct — empty deal list", () => {
  test("null deals returns null", () => {
    assert.equal(findDealForProduct({ category: "flower" }, null as unknown as ActiveDeal[]), null);
  });

  test("empty deals returns null", () => {
    assert.equal(findDealForProduct({ category: "flower" }, []), null);
  });
});

describe("findDealForProduct — storewide (appliesTo='all')", () => {
  test("matches any category", () => {
    const deal = makeDeal({ appliesTo: "all" });
    const out = findDealForProduct({ category: "flower" }, [deal]);
    assert.equal(out, deal);
  });

  test("matches even when category is null", () => {
    const deal = makeDeal({ appliesTo: "all" });
    const out = findDealForProduct({ category: null }, [deal]);
    assert.equal(out, deal);
  });
});

describe("findDealForProduct — falsy appliesTo treated as storewide", () => {
  test("undefined appliesTo matches any product (falsy short-circuit)", () => {
    const deal = makeDeal({ appliesTo: undefined as unknown as ActiveDeal["appliesTo"] });
    const out = findDealForProduct({ category: "flower" }, [deal]);
    assert.equal(out, deal);
  });

  test("empty-string appliesTo matches any product", () => {
    const deal = makeDeal({ appliesTo: "" });
    const out = findDealForProduct({ category: "flower" }, [deal]);
    assert.equal(out, deal);
  });
});

describe("findDealForProduct — category-scoped (stem match)", () => {
  test("category-scoped 'flowers' matches product category 'flower' (stem strips s)", () => {
    const deal = makeDeal({ appliesTo: "flowers" });
    const out = findDealForProduct({ category: "flower" }, [deal]);
    assert.equal(out, deal);
  });

  test("category-scoped 'flower' matches product category 'flower' (no s)", () => {
    const deal = makeDeal({ appliesTo: "flower" });
    const out = findDealForProduct({ category: "flower" }, [deal]);
    assert.equal(out, deal);
  });

  test("category-scoped 'edibles' matches product category 'edible'", () => {
    const deal = makeDeal({ appliesTo: "edibles" });
    const out = findDealForProduct({ category: "edible" }, [deal]);
    assert.equal(out, deal);
  });

  test("category mismatch returns null", () => {
    const deal = makeDeal({ appliesTo: "flowers" });
    const out = findDealForProduct({ category: "edible" }, [deal]);
    assert.equal(out, null);
  });

  test("case-insensitive — uppercase product category matches lowercase deal scope", () => {
    const deal = makeDeal({ appliesTo: "flowers" });
    const out = findDealForProduct({ category: "FLOWER" }, [deal]);
    assert.equal(out, deal);
  });
});

describe("findDealForProduct — first-match wins", () => {
  test("returns the first matching deal in array order", () => {
    const dealA = makeDeal({ short: "A", appliesTo: "all" });
    const dealB = makeDeal({ short: "B", appliesTo: "all" });
    const out = findDealForProduct({ category: "flower" }, [dealA, dealB]);
    assert.equal(out, dealA);
  });
});

// ── effectivePriceFor — null price ──────────────────────────────────────

describe("effectivePriceFor — null unitPrice", () => {
  test("null shelf produces all-null discount result", () => {
    const out = effectivePriceFor({ unitPrice: null, category: "flower" }, null);
    assert.deepEqual(out, {
      displayPrice: null,
      originalPrice: null,
      discountPct: 0,
      dealName: null,
    });
  });
});

// ── effectivePriceFor — floor only (no deal) ────────────────────────────

describe("effectivePriceFor — 20% online floor (no deal)", () => {
  test("$100 shelf with no deal → $80 display, 20% discount", () => {
    const out = effectivePriceFor({ unitPrice: 100, category: "flower" }, null);
    assert.equal(out.displayPrice, 80);
    assert.equal(out.originalPrice, 100);
    assert.equal(out.discountPct, 20);
    assert.equal(out.dealName, null);
  });

  test("$10 shelf → $8 display", () => {
    const out = effectivePriceFor({ unitPrice: 10, category: "flower" }, null);
    assert.equal(out.displayPrice, 8);
    assert.equal(out.discountPct, 20);
  });

  test("$9.99 shelf → $7.99 (rounded to cents)", () => {
    const out = effectivePriceFor({ unitPrice: 9.99, category: "flower" }, null);
    assert.equal(out.displayPrice, 7.99);
  });
});

// ── effectivePriceFor — deal beats floor ────────────────────────────────

describe("effectivePriceFor — deal % > 20%", () => {
  test("30% deal on $100 → $70 display, 30%, deal-name attached", () => {
    const deal = makeDeal({ short: "30 Off", appliesTo: "all", discountType: "percent", discountValue: 30 });
    const out = effectivePriceFor({ unitPrice: 100, category: "flower" }, deal);
    assert.equal(out.displayPrice, 70);
    assert.equal(out.discountPct, 30);
    assert.equal(out.dealName, "30 Off");
  });

  test("25% deal on $100 → $75 display, 25%", () => {
    const deal = makeDeal({ discountValue: 25 });
    const out = effectivePriceFor({ unitPrice: 100, category: "flower" }, deal);
    assert.equal(out.displayPrice, 75);
    assert.equal(out.discountPct, 25);
  });
});

// ── effectivePriceFor — deal % < 20% → floor wins ───────────────────────

describe("effectivePriceFor — deal smaller than floor → floor wins, no stacking", () => {
  test("10% deal on $100 → 20% floor wins, dealName=null (deal isn't applied)", () => {
    const deal = makeDeal({ short: "10 Off", discountValue: 10 });
    const out = effectivePriceFor({ unitPrice: 100, category: "flower" }, deal);
    assert.equal(out.displayPrice, 80, "20% floor wins, not 10%+20%=30%");
    assert.equal(out.discountPct, 20);
    assert.equal(out.dealName, null, "dealName null when floor wins");
  });

  test("EXACTLY 20% deal — floor wins (>, not >=), dealName=null", () => {
    const deal = makeDeal({ short: "20 Off", discountValue: 20 });
    const out = effectivePriceFor({ unitPrice: 100, category: "flower" }, deal);
    assert.equal(out.discountPct, 20);
    assert.equal(out.dealName, null, "exactly-equal deal does NOT beat floor");
  });
});

// ── effectivePriceFor — dollar-amount deal ──────────────────────────────

describe("effectivePriceFor — dollar-amount deal", () => {
  test("$30 off on $100 (=30%) beats 20% floor → $70 display", () => {
    const deal = makeDeal({
      short: "$30 Off",
      discountType: "dollar" as ActiveDeal["discountType"],
      discountValue: 30,
    });
    const out = effectivePriceFor({ unitPrice: 100, category: "flower" }, deal);
    assert.equal(out.displayPrice, 70);
    assert.equal(out.discountPct, 30);
    assert.equal(out.dealName, "$30 Off");
  });

  test("$10 off on $100 (=10%) loses to 20% floor → $80 display", () => {
    const deal = makeDeal({
      short: "$10 Off",
      discountType: "dollar" as ActiveDeal["discountType"],
      discountValue: 10,
    });
    const out = effectivePriceFor({ unitPrice: 100, category: "flower" }, deal);
    assert.equal(out.displayPrice, 80);
    assert.equal(out.dealName, null);
  });
});

// ── effectivePriceFor — null discountValue ──────────────────────────────

describe("effectivePriceFor — deal with null discountValue", () => {
  test("null discountValue → floor wins, no deal-name", () => {
    const deal = makeDeal({ discountValue: null as unknown as number });
    const out = effectivePriceFor({ unitPrice: 100, category: "flower" }, deal);
    assert.equal(out.displayPrice, 80);
    assert.equal(out.dealName, null);
  });
});

// ── effectivePriceFor — never exceeds original ─────────────────────────

describe("effectivePriceFor — invariants", () => {
  test("displayPrice never exceeds originalPrice", () => {
    for (const p of [10, 25, 50, 99.99, 100, 250]) {
      const out = effectivePriceFor({ unitPrice: p, category: "flower" }, null);
      assert.ok(out.displayPrice !== null && out.displayPrice <= p);
    }
  });

  test("displayPrice always positive when shelf is positive", () => {
    for (const p of [1, 10, 100]) {
      const out = effectivePriceFor({ unitPrice: p, category: "flower" }, null);
      assert.ok(out.displayPrice !== null && out.displayPrice > 0);
    }
  });
});
