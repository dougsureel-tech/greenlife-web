// Tests for NEAR_TOWNS service-area data + getTown helper.
//
// Each NEAR_TOWNS row drives a /near/<slug> landing page (auto-pulled
// into sitemap.ts). Silent drift here can:
//   - Break SEO: missing slug or wrong canonical name
//   - Misroute customers: stale driveMins / highway info on prod
//   - Violate brand voice: generic SEO filler instead of hyperlocal
//     real-resident framing
//
// Sister of scc lib/__tests__/near-towns.test.ts. Structure differs
// across the two stores (Seattle uses transit-based geo, Wenatchee uses
// highway-based geo) so test fields differ.

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { NEAR_TOWNS, getTown } from "../near-towns.ts";

describe("NEAR_TOWNS — structural invariants", () => {
  test("non-empty array", () => {
    assert.ok(NEAR_TOWNS.length > 0, "should have at least one town");
  });

  test("every entry has required fields, no empty strings", () => {
    for (const t of NEAR_TOWNS) {
      assert.ok(t.slug, `${t.name ?? "?"} missing slug`);
      assert.ok(t.name, `${t.slug} missing name`);
      assert.ok(t.county, `${t.slug} missing county`);
      assert.ok(typeof t.driveMins === "number", `${t.slug} driveMins not a number`);
      assert.ok(t.driveMins >= 0, `${t.slug} driveMins negative`);
      assert.ok(t.highway, `${t.slug} missing highway`);
      assert.ok(t.pitch, `${t.slug} missing pitch`);
      assert.ok(t.whyStop, `${t.slug} missing whyStop`);
      assert.ok(Array.isArray(t.notableNeighbors), `${t.slug} notableNeighbors not array`);
    }
  });

  test("slugs are unique", () => {
    const slugs = NEAR_TOWNS.map((t) => t.slug);
    assert.equal(new Set(slugs).size, slugs.length, "duplicate slug");
  });

  test("slugs are URL-safe (lowercase alphanumeric + hyphens)", () => {
    const re = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    for (const t of NEAR_TOWNS) {
      assert.match(t.slug, re, `${t.slug} not URL-safe`);
    }
  });

  test("driveMins is plausible (0-180 range for a service-area shop)", () => {
    for (const t of NEAR_TOWNS) {
      assert.ok(
        t.driveMins >= 0 && t.driveMins <= 180,
        `${t.slug} driveMins=${t.driveMins} outside 0-180 plausible range`,
      );
    }
  });

  test("pitch is a single sentence under 200 chars (SERP-fit)", () => {
    for (const t of NEAR_TOWNS) {
      assert.ok(
        t.pitch.length <= 200,
        `${t.slug} pitch over 200 chars (${t.pitch.length})`,
      );
    }
  });

  test("whyStop is substantive (>=80 chars to avoid SEO-thin-content)", () => {
    for (const t of NEAR_TOWNS) {
      assert.ok(
        t.whyStop.length >= 80,
        `${t.slug} whyStop too short (${t.whyStop.length} chars) — risks SEO thin-content penalty`,
      );
    }
  });
});

describe("NEAR_TOWNS — brand-voice compliance", () => {
  test("no whyStop body contains 'locally owned' framing (Doug 2026-05-02 directive)", () => {
    const re = /\blocally[\s-]owned\b/i;
    for (const t of NEAR_TOWNS) {
      assert.ok(!re.test(t.whyStop), `${t.slug} whyStop has 'locally owned' framing`);
      assert.ok(!re.test(t.pitch), `${t.slug} pitch has 'locally owned' framing`);
    }
  });

  test("no body says 'Senior discount' (Wisdom rename — Doug 2026-05 dignity)", () => {
    const re = /\bSenior\s+discount\b/i;
    for (const t of NEAR_TOWNS) {
      assert.ok(!re.test(t.whyStop), `${t.slug} whyStop uses 'Senior discount' (should be 'Wisdom')`);
      assert.ok(!re.test(t.pitch), `${t.slug} pitch uses 'Senior discount'`);
    }
  });
});

describe("getTown helper", () => {
  test("returns the matching town for a valid slug", () => {
    const first = NEAR_TOWNS[0];
    assert.ok(first);
    const got = getTown(first.slug);
    assert.ok(got);
    assert.equal(got.slug, first.slug);
    assert.equal(got.name, first.name);
  });

  test("returns null for unknown slug", () => {
    assert.equal(getTown("not-a-real-slug-12345"), null);
  });

  test("returns null for empty string", () => {
    assert.equal(getTown(""), null);
  });

  test("case-sensitive (uppercase slug not matched)", () => {
    const first = NEAR_TOWNS[0];
    assert.ok(first);
    assert.equal(
      getTown(first.slug.toUpperCase()),
      null,
      "getTown is case-sensitive by design (URL slugs are lowercase)",
    );
  });
});
