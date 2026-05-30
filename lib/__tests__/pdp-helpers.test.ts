// Tests for `lib/pdp-helpers.ts` — pure helpers powering the
// /menu/preview/[id] PDP surface. Phase 0 of the Product UX Redesign
// (PLAN_PRODUCT_UX_REDESIGN_2026_05_30.md).
//
// Why pinned: the PDP is a customer-facing preview that drives the cart-
// cutover go/no-go decision. A regression that misreports the
// "Out the door: $X" math, mis-extracts effect chips, or silently
// renders empty stars would either confuse Doug's design read OR
// (worse) mislead real customers about post-tax cost.
//
// Stack-portable: glw + scc both ship this test file. Tax-multiplier
// constants diverge (1.458 Wen / 1.4755 Seattle) so the dollar-shape
// invariants are asserted via the helper's *behavior* (multiplier
// pass-through) rather than hardcoded multiplier values where possible.

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  EFFECT_CHIP_LIBRARY,
  WEN_OUT_THE_DOOR_MULTIPLIER,
  extractEffectChips,
  outTheDoorPrice,
  shouldUseImageFallback,
  reviewsAggregate,
  formatReviewAge,
  customerTenureLabel,
} from "../pdp-helpers.ts";

// ── EFFECT_CHIP_LIBRARY shape ───────────────────────────────────────────

describe("EFFECT_CHIP_LIBRARY", () => {
  test("contains the 6 expected chip labels in priority order", () => {
    const labels = EFFECT_CHIP_LIBRARY.map((e) => e.label);
    assert.deepEqual(labels, [
      "Relaxing",
      "Energizing",
      "Creative",
      "Focus",
      "Sleep",
      "Social",
    ]);
  });

  test("every entry has at least one keyword", () => {
    for (const entry of EFFECT_CHIP_LIBRARY) {
      assert.ok(entry.keywords.length > 0, `${entry.label} has no keywords`);
    }
  });

  test("no efficacy-claim labels (WAC 314-55-155 voice register)", () => {
    const banned = ["heal", "cure", "treat", "medicinal", "therapeutic", "stress-relief"];
    const labels = EFFECT_CHIP_LIBRARY.map((e) => e.label.toLowerCase()).join(" ");
    for (const phrase of banned) {
      assert.ok(!labels.includes(phrase), `banned phrase "${phrase}" found in chip labels`);
    }
  });
});

// ── extractEffectChips ──────────────────────────────────────────────────

describe("extractEffectChips", () => {
  test("returns [] for null/undefined/empty input", () => {
    assert.deepEqual(extractEffectChips(null, null), []);
    assert.deepEqual(extractEffectChips(undefined, undefined), []);
    assert.deepEqual(extractEffectChips("", ""), []);
    assert.deepEqual(extractEffectChips("   ", "   "), []);
  });

  test("matches 'relaxing' keyword from notes", () => {
    const chips = extractEffectChips("A relaxing nightcap strain", null);
    assert.deepEqual(chips, ["Relaxing"]);
  });

  test("matches 'energizing' keyword from notes", () => {
    const chips = extractEffectChips("Energizing morning hybrid", null);
    assert.deepEqual(chips, ["Energizing"]);
  });

  test("matches 'creative' keyword from notes", () => {
    const chips = extractEffectChips("Great for creative studio sessions", null);
    assert.deepEqual(chips, ["Creative"]);
  });

  test("matches 'focus' keyword from notes", () => {
    const chips = extractEffectChips("Clear-headed focused buzz", null);
    // both 'focus' AND 'creative' (clear-head matches Focus, focused matches Focus)
    assert.ok(chips.includes("Focus"));
  });

  test("matches 'sleep' keyword from notes", () => {
    const chips = extractEffectChips("Bedtime indica, couch-lock heavy", null);
    assert.ok(chips.includes("Sleep"));
  });

  test("case-insensitive match", () => {
    const chips = extractEffectChips("RELAXING NIGHTCAP", null);
    assert.deepEqual(chips, ["Relaxing"]);
  });

  test("scans both notes and effects fields", () => {
    const chips = extractEffectChips(null, "uplift, social");
    assert.ok(chips.includes("Energizing"));
    assert.ok(chips.includes("Social"));
  });

  test("caps results at max (default 3)", () => {
    const chips = extractEffectChips(
      "relaxing energizing creative focused sleep social",
      null,
    );
    assert.equal(chips.length, 3);
  });

  test("respects custom max", () => {
    const chips = extractEffectChips(
      "relaxing energizing creative focused sleep social",
      null,
      6,
    );
    assert.equal(chips.length, 6);
  });

  test("returns chips in library priority order", () => {
    // Energizing appears later in the library; even when keyword appears
    // first in haystack, Relaxing (earlier library entry) takes priority.
    const chips = extractEffectChips("energizing relaxing", null);
    assert.deepEqual(chips, ["Relaxing", "Energizing"]);
  });
});

// ── outTheDoorPrice ─────────────────────────────────────────────────────

describe("outTheDoorPrice", () => {
  test("null in → null out", () => {
    assert.equal(outTheDoorPrice(null, 1.458), null);
    assert.equal(outTheDoorPrice(undefined, 1.458), null);
  });

  test("$0 in → $0 out", () => {
    assert.equal(outTheDoorPrice(0, 1.458), 0);
  });

  test("$42 × 1.458 = $61.24 (Wen example from UX brief)", () => {
    assert.equal(outTheDoorPrice(42, 1.458), 61.24);
  });

  test("$10 × 1.458 = $14.58", () => {
    assert.equal(outTheDoorPrice(10, 1.458), 14.58);
  });

  test("rounds to nearest cent", () => {
    // 17.99 × 1.458 = 26.229… → 26.23
    assert.equal(outTheDoorPrice(17.99, 1.458), 26.23);
  });

  test("NaN / Infinity → null", () => {
    assert.equal(outTheDoorPrice(NaN, 1.458), null);
    assert.equal(outTheDoorPrice(Infinity, 1.458), null);
  });

  test("multiplier pass-through (SCC 1.4755 produces different number)", () => {
    const wen = outTheDoorPrice(42, 1.458);
    const sea = outTheDoorPrice(42, 1.4755);
    assert.notEqual(wen, sea);
    assert.equal(sea, 61.97);
  });
});

// ── WEN_OUT_THE_DOOR_MULTIPLIER (glw-specific) ──────────────────────────

describe("WEN_OUT_THE_DOOR_MULTIPLIER", () => {
  test("equals 1.458 (37% excise + 8.8% Wenatchee sales)", () => {
    assert.equal(WEN_OUT_THE_DOOR_MULTIPLIER, 1.458);
  });
});

// ── shouldUseImageFallback ──────────────────────────────────────────────

describe("shouldUseImageFallback", () => {
  test("true for null/undefined/empty/whitespace", () => {
    assert.equal(shouldUseImageFallback(null), true);
    assert.equal(shouldUseImageFallback(undefined), true);
    assert.equal(shouldUseImageFallback(""), true);
    assert.equal(shouldUseImageFallback("   "), true);
  });

  test("false for real URL", () => {
    assert.equal(
      shouldUseImageFallback("https://cdn.example.com/product.jpg"),
      false,
    );
  });

  test("false for relative path", () => {
    assert.equal(shouldUseImageFallback("/products/abc.png"), false);
  });
});

// ── reviewsAggregate ────────────────────────────────────────────────────

describe("reviewsAggregate", () => {
  test("0 reviews → avgScore null + count 0", () => {
    const agg = reviewsAggregate([]);
    assert.equal(agg.avgScore, null);
    assert.equal(agg.count, 0);
  });

  test("1 review at 5 → avg 5 + count 1", () => {
    const agg = reviewsAggregate([{ rating: 5 }]);
    assert.equal(agg.avgScore, 5);
    assert.equal(agg.count, 1);
  });

  test("3 reviews [5,4,3] → avg 4 + count 3", () => {
    const agg = reviewsAggregate([{ rating: 5 }, { rating: 4 }, { rating: 3 }]);
    assert.equal(agg.avgScore, 4);
    assert.equal(agg.count, 3);
  });

  test("rounds to 1 decimal place", () => {
    // [5, 4, 4] → 13/3 = 4.333… → 4.3
    const agg = reviewsAggregate([{ rating: 5 }, { rating: 4 }, { rating: 4 }]);
    assert.equal(agg.avgScore, 4.3);
  });

  test("filters invalid ratings (NaN, out of 1-5)", () => {
    const agg = reviewsAggregate([
      { rating: 5 },
      { rating: 6 }, // out of range
      { rating: 0 }, // out of range
      { rating: NaN },
      { rating: 4 },
    ]);
    assert.equal(agg.count, 2); // only 5 + 4 counted
    assert.equal(agg.avgScore, 4.5);
  });

  test("all invalid ratings → empty aggregate", () => {
    const agg = reviewsAggregate([{ rating: NaN }, { rating: 0 }]);
    assert.equal(agg.count, 0);
    assert.equal(agg.avgScore, null);
  });
});

// ── formatReviewAge ─────────────────────────────────────────────────────

describe("formatReviewAge", () => {
  // Anchor "now" at a fixed timestamp for deterministic tests.
  const NOW = new Date("2026-05-30T12:00:00Z").getTime();

  test("today", () => {
    assert.equal(formatReviewAge(new Date(NOW - 60 * 1000), NOW), "today");
  });

  test("yesterday", () => {
    assert.equal(
      formatReviewAge(new Date(NOW - 25 * 60 * 60 * 1000), NOW),
      "yesterday",
    );
  });

  test("N days ago (1-13)", () => {
    assert.equal(
      formatReviewAge(new Date(NOW - 5 * 24 * 60 * 60 * 1000), NOW),
      "5 days ago",
    );
  });

  test("N weeks ago (2-8)", () => {
    assert.equal(
      formatReviewAge(new Date(NOW - 21 * 24 * 60 * 60 * 1000), NOW),
      "3 weeks ago",
    );
  });

  test("N months ago", () => {
    assert.equal(
      formatReviewAge(new Date(NOW - 90 * 24 * 60 * 60 * 1000), NOW),
      "3 months ago",
    );
  });

  test("over a year ago", () => {
    assert.equal(
      formatReviewAge(new Date(NOW - 400 * 24 * 60 * 60 * 1000), NOW),
      "over a year ago",
    );
  });

  test("future timestamp → 'just now' (graceful)", () => {
    assert.equal(
      formatReviewAge(new Date(NOW + 60 * 1000), NOW),
      "just now",
    );
  });

  test("invalid date string → 'recently' (graceful)", () => {
    assert.equal(formatReviewAge("not a date", NOW), "recently");
  });

  test("accepts ISO string and Date object", () => {
    const iso = new Date(NOW - 25 * 60 * 60 * 1000).toISOString();
    assert.equal(formatReviewAge(iso, NOW), "yesterday");
  });
});

// ── customerTenureLabel ─────────────────────────────────────────────────

describe("customerTenureLabel", () => {
  test("null/undefined → 'Anonymous'", () => {
    assert.equal(customerTenureLabel(null), "Anonymous");
    assert.equal(customerTenureLabel(undefined), "Anonymous");
  });

  test("returns 'Customer since YYYY' for valid date", () => {
    assert.equal(
      customerTenureLabel(new Date("2024-03-15T00:00:00Z")),
      "Customer since 2024",
    );
  });

  test("accepts ISO string", () => {
    assert.equal(
      customerTenureLabel("2023-08-01T00:00:00Z"),
      "Customer since 2023",
    );
  });

  test("invalid date → 'Anonymous' (graceful)", () => {
    assert.equal(customerTenureLabel("garbage"), "Anonymous");
  });
});
