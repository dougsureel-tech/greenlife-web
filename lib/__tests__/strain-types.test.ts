// Pin tests for lib/strain-types.ts — /strains/[type] landing pages SoT.
// **WAC 314-55-155 compliance load-bearing**: this file explicitly
// disclaims efficacy/medical/promissory claims. A regression here that
// lets "relaxing", "energizing", "pain relief", "helps you sleep" etc.
// into the copy is a WSLCB violation risk. Pin every forbidden phrase
// across every entry's body/whatToLookFor/subhead/h2/metaDescription.

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  STRAIN_TYPES,
  getStrainType,
  type StrainType,
} from "../strain-types.ts";

const ALL_TEXT = (t: StrainType) =>
  [t.eyebrow, t.metaDescription, t.subhead, t.h2, t.bodyCopy, t.whatToLookFor]
    .filter((x) => typeof x === "string")
    .join(" || ")
    .toLowerCase();

describe("STRAIN_TYPES — registry shape", () => {
  test("has 4 entries (indica + sativa + hybrid + cbd)", () => {
    assert.equal(STRAIN_TYPES.length, 4);
  });
  test("slugs are exact: indica / sativa / hybrid / cbd", () => {
    const slugs = STRAIN_TYPES.map((t) => t.slug).sort();
    assert.deepEqual(slugs, ["cbd", "hybrid", "indica", "sativa"]);
  });
  test("no duplicate slugs", () => {
    const set = new Set(STRAIN_TYPES.map((t) => t.slug));
    assert.equal(set.size, STRAIN_TYPES.length);
  });
  test("every entry has all required fields non-empty string", () => {
    for (const t of STRAIN_TYPES) {
      for (const f of ["slug", "name", "eyebrow", "metaDescription", "subhead", "h2", "bodyCopy", "whatToLookFor"] as const) {
        const v = (t as Record<string, unknown>)[f];
        assert.equal(typeof v, "string", `${t.slug} ${f} not string`);
        assert.ok(typeof v === "string" && v.length > 0, `${t.slug} ${f} empty`);
      }
    }
  });
  test("slugs are URL-safe kebab-case lowercase", () => {
    for (const t of STRAIN_TYPES) {
      assert.match(t.slug, /^[a-z][a-z0-9-]*$/, `${t.slug} not URL-safe`);
    }
  });
});

describe("STRAIN_TYPES — SERP-cap-aware metaDescription", () => {
  test("every metaDescription is reasonable length (~155 chars target, ≤200 hard cap)", () => {
    for (const t of STRAIN_TYPES) {
      assert.ok(t.metaDescription.length >= 80, `${t.slug} meta too short: ${t.metaDescription.length} chars`);
      assert.ok(t.metaDescription.length <= 200, `${t.slug} meta over 200-char cap: ${t.metaDescription.length}`);
    }
  });
  test("metaDescription contains 'Wenatchee' or 'Wenatchee Valley' (local SEO anchor)", () => {
    for (const t of STRAIN_TYPES) {
      assert.match(t.metaDescription, /Wenatchee/i, `${t.slug} meta lacks Wenatchee anchor`);
    }
  });
});

describe("STRAIN_TYPES — WAC 314-55-155 compliance: NO efficacy claims", () => {
  // Per file header: "NO efficacy/medical/promissory claims ('relaxing',
  // 'energizing', 'pain relief', 'helps you sleep')". These phrases in
  // any user-facing copy = WSLCB violation risk.
  const FORBIDDEN = [
    "relaxing",
    "energizing",
    "pain relief",
    "helps you sleep",
    "anti-anxiety",
    "cures",
    "treats",
    "heals",
    "guaranteed",
    "will make you feel",
    "you'll feel",
    "makes you feel",
  ];
  for (const phrase of FORBIDDEN) {
    test(`forbidden phrase "${phrase}" NOT in any strain-type copy`, () => {
      for (const t of STRAIN_TYPES) {
        const txt = ALL_TEXT(t);
        assert.equal(txt.includes(phrase.toLowerCase()), false, `${t.slug} body contains "${phrase}"`);
      }
    });
  }
});

describe("STRAIN_TYPES — voice anchors (Wenatchee Valley lane)", () => {
  // Per file header voice anchors. Pin the load-bearing positioning lines
  // so a copy refresh doesn't accidentally strip them.
  test("body mentions 'GS Center Road' OR '2014' tenure framing somewhere across the set", () => {
    const all = STRAIN_TYPES.map(ALL_TEXT).join(" || ");
    assert.ok(/gs center road|2014/.test(all), "tenure framing missing across all strain-type pages");
  });
  test("at least one entry mentions 'Wenatchee Valley' positioning", () => {
    const wv = STRAIN_TYPES.filter((t) => /wenatchee valley/i.test(ALL_TEXT(t)));
    assert.ok(wv.length >= 1, "no entry mentions 'Wenatchee Valley'");
  });
  test("no exclamation marks (operator-grit tone per voice anchor)", () => {
    for (const t of STRAIN_TYPES) {
      assert.equal(t.bodyCopy.includes("!"), false, `${t.slug} bodyCopy has !`);
      assert.equal(t.whatToLookFor.includes("!"), false, `${t.slug} whatToLookFor has !`);
      assert.equal(t.metaDescription.includes("!"), false, `${t.slug} metaDescription has !`);
    }
  });
  test("uses U+2019 right-single-quote apostrophe (’) NOT ASCII (') in body copy", () => {
    // Per voice-anchor doctrine. Apostrophes in long-form prose should be
    // typographically correct. Allowlist: technical strings + URLs are fine.
    for (const t of STRAIN_TYPES) {
      // Count ASCII apostrophes in body — should be 0 (everything goes ’).
      const ascii = (t.bodyCopy.match(/'/g) || []).length;
      assert.equal(ascii, 0, `${t.slug} bodyCopy has ${ascii} ASCII apostrophe(s) — should use U+2019 ’`);
    }
  });
});

describe("STRAIN_TYPES — CTA discipline (only /menu, never iHJ direct)", () => {
  test("no entry references iheartjane or ihj.com URLs (CTA discipline)", () => {
    for (const t of STRAIN_TYPES) {
      const txt = ALL_TEXT(t);
      assert.equal(txt.includes("iheartjane"), false, `${t.slug} mentions iheartjane`);
      assert.equal(txt.includes("ihj.com"), false, `${t.slug} mentions ihj.com`);
    }
  });
});

describe("getStrainType — slug lookup", () => {
  test("'indica' → Indica entry", () => {
    const r = getStrainType("indica");
    assert.ok(r);
    assert.equal(r!.slug, "indica");
    assert.equal(r!.name, "Indica");
  });
  test("'sativa' → Sativa entry", () => {
    assert.equal(getStrainType("sativa")!.name, "Sativa");
  });
  test("'hybrid' → Hybrid entry", () => {
    assert.equal(getStrainType("hybrid")!.name, "Hybrid");
  });
  test("'cbd' → CBD entry", () => {
    assert.equal(getStrainType("cbd")!.name, "CBD");
  });
  test("unknown slug → undefined", () => {
    assert.equal(getStrainType("not-a-strain"), undefined);
  });
  test("empty string → undefined", () => {
    assert.equal(getStrainType(""), undefined);
  });
  test("case-sensitive ('Indica' uppercase → undefined — slugs are lowercase)", () => {
    // Slugs are lowercase per the URL convention; case-sensitive lookup
    // catches a regression where someone adds case-insensitivity that
    // would mask DB-side slug-corruption.
    assert.equal(getStrainType("Indica"), undefined);
  });
});

describe("STRAIN_TYPES — body length sanity (not stub, not novel)", () => {
  test("every bodyCopy is substantial (≥500 chars — SEO depth)", () => {
    for (const t of STRAIN_TYPES) {
      assert.ok(t.bodyCopy.length >= 500, `${t.slug} bodyCopy too short: ${t.bodyCopy.length} chars`);
    }
  });
  test("every bodyCopy is reasonable max (≤8000 chars — readability)", () => {
    for (const t of STRAIN_TYPES) {
      assert.ok(t.bodyCopy.length <= 8000, `${t.slug} bodyCopy too long: ${t.bodyCopy.length} chars`);
    }
  });
  test("every whatToLookFor section is present + substantive (≥200 chars)", () => {
    for (const t of STRAIN_TYPES) {
      assert.ok(t.whatToLookFor.length >= 200, `${t.slug} whatToLookFor too short`);
    }
  });
});
