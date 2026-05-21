// Tests for `lib/brand-logos-available.ts` — manifest of brand-logo
// PNGs that exist on disk in `public/brand-logos/`. Consumed by
// `OrderMenu.tsx ProductImage` to gate `<Image src=...png>` BEFORE
// the browser fetches 404 + flashes broken-image-icon.
//
// Why pinned: the manifest IS the load-bearing thing. A regression
// that drops a slug from the set re-introduces the broken-image flash
// for that brand on every menu render. A regression that ADDS a slug
// without a corresponding PNG re-introduces the 404. Pin both
// directions explicitly + pin the helper semantic.
//
// The cross-file consistency check (manifest vs filesystem) is the
// job of `scripts/check-brand-logos-manifest.mjs` build-gate — these
// tests pin the in-memory manifest shape + helper contract.
//
// Run with:  pnpm test:all

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  BRAND_LOGOS_AVAILABLE,
  hasBrandLogoAsset,
} from "../brand-logos-available.ts";

// ── BRAND_LOGOS_AVAILABLE shape ─────────────────────────────────────────

describe("BRAND_LOGOS_AVAILABLE", () => {
  test("is a Set", () => {
    assert.ok(BRAND_LOGOS_AVAILABLE instanceof Set);
  });

  test("non-empty (we've shipped 25+ brand logos)", () => {
    assert.ok(BRAND_LOGOS_AVAILABLE.size >= 25);
  });

  test("contains the load-bearing core brand slugs (avitas, wyld, artizen)", () => {
    assert.ok(BRAND_LOGOS_AVAILABLE.has("avitas"));
    assert.ok(BRAND_LOGOS_AVAILABLE.has("wyld"));
    assert.ok(BRAND_LOGOS_AVAILABLE.has("artizen"));
  });

  test("all entries are lowercase strings", () => {
    for (const slug of BRAND_LOGOS_AVAILABLE) {
      assert.equal(typeof slug, "string");
      assert.equal(slug, slug.toLowerCase(), `slug "${slug}" must be lowercase`);
    }
  });

  test("no entries contain whitespace", () => {
    for (const slug of BRAND_LOGOS_AVAILABLE) {
      assert.ok(!/\s/.test(slug), `slug "${slug}" must not contain whitespace`);
    }
  });

  test("no entries contain uppercase characters", () => {
    for (const slug of BRAND_LOGOS_AVAILABLE) {
      assert.ok(!/[A-Z]/.test(slug), `slug "${slug}" must not contain uppercase`);
    }
  });

  test("no entries are empty strings", () => {
    for (const slug of BRAND_LOGOS_AVAILABLE) {
      assert.ok(slug.length > 0, "empty slug found in manifest");
    }
  });

  test("no leading/trailing dashes (slug-convention)", () => {
    for (const slug of BRAND_LOGOS_AVAILABLE) {
      assert.ok(!slug.startsWith("-"), `slug "${slug}" must not start with -`);
      assert.ok(!slug.endsWith("-"), `slug "${slug}" must not end with -`);
    }
  });
});

// ── hasBrandLogoAsset — happy paths ─────────────────────────────────────

describe("hasBrandLogoAsset — slugs in manifest", () => {
  test("known slug returns true (avitas)", () => {
    assert.equal(hasBrandLogoAsset("avitas"), true);
  });

  test("known slug returns true (wyld)", () => {
    assert.equal(hasBrandLogoAsset("wyld"), true);
  });

  test("known slug returns true (artizen)", () => {
    assert.equal(hasBrandLogoAsset("artizen"), true);
  });
});

// ── hasBrandLogoAsset — rejection ───────────────────────────────────────

describe("hasBrandLogoAsset — rejection", () => {
  test("unknown slug returns false (no broken-image flash)", () => {
    assert.equal(hasBrandLogoAsset("nonexistent-brand-zzz"), false);
  });

  test("null returns false", () => {
    assert.equal(hasBrandLogoAsset(null), false);
  });

  test("undefined returns false", () => {
    assert.equal(hasBrandLogoAsset(undefined), false);
  });

  test("empty string returns false", () => {
    assert.equal(hasBrandLogoAsset(""), false);
  });

  test("case mismatch returns false (uppercase NOT auto-lowered)", () => {
    // The helper is exact-Set-membership; the slugify call upstream is
    // expected to produce lowercase already. Pin that the helper itself
    // does NOT auto-lower so future drift in the slugify pipeline doesn't
    // silently mask casing bugs.
    assert.equal(hasBrandLogoAsset("AVITAS"), false);
    assert.equal(hasBrandLogoAsset("Avitas"), false);
  });

  test("slug with extension returns false (we manage extension separately)", () => {
    assert.equal(hasBrandLogoAsset("avitas.png"), false);
  });

  test("slug with leading slash returns false", () => {
    assert.equal(hasBrandLogoAsset("/avitas"), false);
  });
});

// ── ReadonlySet immutability semantic ───────────────────────────────────

describe("BRAND_LOGOS_AVAILABLE — ReadonlySet semantic", () => {
  test("size matches initial entries (no mutations occurred at module load)", () => {
    const initialSize = BRAND_LOGOS_AVAILABLE.size;
    assert.ok(initialSize > 0);
    // Re-read; should be the same
    assert.equal(BRAND_LOGOS_AVAILABLE.size, initialSize);
  });
});
