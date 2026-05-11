// Tests for `lib/clean-brand-name.ts` — strips trailing legal-entity
// suffixes ("LLC", "Inc.", "Corp", etc.) from canonical vendor names so
// customer-facing brand strings on the Top Brands carousel, /brands/[slug]
// header, and brand-deal callouts read like brands, not LLC filings.
//
// Why pinned: the canonical vendors.name comes from WSLCB licensee
// records and is the right value for compliance — but a regression in
// the strip pattern shows customers "Bondi Farms Inc." or "Phat Panda LLC"
// across the homepage carousel. Conservative-by-design behavior (no
// stripping mid-string, no touching " - <text>" patterns) is load-bearing
// for legit brand names like "Coffee Co" — pin the exact boundary.
//
// Run with:  pnpm test:all

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { cleanBrandName } from "../clean-brand-name.ts";

describe("cleanBrandName — falsy + edge inputs", () => {
  test("null returns empty string", () => {
    assert.equal(cleanBrandName(null), "");
  });
  test("undefined returns empty string", () => {
    assert.equal(cleanBrandName(undefined), "");
  });
  test("empty string returns empty string", () => {
    assert.equal(cleanBrandName(""), "");
  });
  test("whitespace-only returns empty string", () => {
    assert.equal(cleanBrandName("   \t \n"), "");
  });
  test("trims surrounding whitespace on otherwise-clean input", () => {
    assert.equal(cleanBrandName("  Avitas  "), "Avitas");
  });
});

describe("cleanBrandName — LLC variants", () => {
  test("strips trailing ', LLC'", () => {
    assert.equal(cleanBrandName("Alpha Crux, LLC"), "Alpha Crux");
  });
  test("strips trailing ' LLC' without comma", () => {
    assert.equal(cleanBrandName("Northwest Cannabis Solutions LLC"), "Northwest Cannabis Solutions");
  });
  test("strips trailing lowercase 'llc'", () => {
    assert.equal(cleanBrandName("Alpha Crux, llc"), "Alpha Crux");
  });
  test("strips dotted 'L.L.C.'", () => {
    assert.equal(cleanBrandName("Foo Bar, L.L.C."), "Foo Bar");
  });
});

describe("cleanBrandName — Inc / Corp / Ltd variants", () => {
  test("strips trailing ' Inc'", () => {
    assert.equal(cleanBrandName("Bondi Farms Inc"), "Bondi Farms");
  });
  test("strips trailing ' Inc.'", () => {
    assert.equal(cleanBrandName("Bondi Farms Inc."), "Bondi Farms");
  });
  test("strips trailing ' Incorporated'", () => {
    assert.equal(cleanBrandName("Bondi Farms Incorporated"), "Bondi Farms");
  });
  test("strips trailing ' Corp'", () => {
    assert.equal(cleanBrandName("Acme Corp"), "Acme");
  });
  test("strips trailing ' Corporation'", () => {
    assert.equal(cleanBrandName("Acme Corporation"), "Acme");
  });
  test("strips trailing ' Ltd'", () => {
    assert.equal(cleanBrandName("Foo Ltd"), "Foo");
  });
  test("strips trailing ' Limited'", () => {
    assert.equal(cleanBrandName("Foo Limited"), "Foo");
  });
  test("strips trailing ' PLLC'", () => {
    assert.equal(cleanBrandName("Foo PLLC"), "Foo");
  });
});

describe("cleanBrandName — conservative-by-design (mid-string NOT stripped)", () => {
  test("preserves mid-string LLC: 'Joe's LLC Cannabis' keeps LLC", () => {
    assert.equal(cleanBrandName("Joe's LLC Cannabis"), "Joe's LLC Cannabis");
  });
  test("preserves numeric prefix: '1555 Industrial Labs' stays intact", () => {
    assert.equal(cleanBrandName("1555 Industrial Labs"), "1555 Industrial Labs");
  });
  test("preserves dash-separator pattern: 'Foo Bar - Description' stays intact", () => {
    assert.equal(cleanBrandName("Foo Bar - Description"), "Foo Bar - Description");
  });
});

describe("cleanBrandName — Co requires comma (legit 'Co' brand-names guarded)", () => {
  test("strips ', Co'", () => {
    assert.equal(cleanBrandName("Foo Bar, Co"), "Foo Bar");
  });
  test("strips ', Co.'", () => {
    assert.equal(cleanBrandName("Foo Bar, Co."), "Foo Bar");
  });
  test("does NOT strip bare ' Co' — 'Coffee Co' is a real brand name", () => {
    assert.equal(cleanBrandName("Coffee Co"), "Coffee Co");
  });
  test("does NOT strip bare ' Co' — 'Trading Co' is a real brand name", () => {
    assert.equal(cleanBrandName("Trading Co"), "Trading Co");
  });
});

describe("cleanBrandName — multi-strip (compound suffixes)", () => {
  test("strips both: 'Foo Inc, LLC' → 'Foo'", () => {
    assert.equal(cleanBrandName("Foo Inc, LLC"), "Foo");
  });
  test("strips trailing comma artifact: 'Foo, LLC,' → 'Foo'", () => {
    assert.equal(cleanBrandName("Foo, LLC,"), "Foo");
  });
});

describe("cleanBrandName — idempotency", () => {
  test("applying twice produces same result (already-cleaned input)", () => {
    const once = cleanBrandName("Bondi Farms Inc.");
    const twice = cleanBrandName(once);
    assert.equal(once, "Bondi Farms");
    assert.equal(twice, "Bondi Farms");
  });
});
