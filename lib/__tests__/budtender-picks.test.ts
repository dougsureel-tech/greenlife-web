// Pin tests for the budtender-picks consumer lib (Ship 2 of the
// Customer Engagement Layer). The lib file lives at:
//   greenlife-web/lib/budtender-picks.ts
//
// Why pinned:
//   1. The fetch URL allow-list defense (brapp.greenlifecannabis.com)
//      mirrors `lib/closure-status.ts inventoryappBase()` — drift here
//      would let env corruption point the badge fetch at a wrong host.
//   2. The 5-min ISR window (`next: { revalidate: 300 }`) matches inv-
//      App's Cache-Control s-maxage=300. Drift means stale-data tier
//      contracts diverge.
//   3. Graceful-degrade contract — ANY failure returns an empty Map so
//      the public-site product card grid renders without badges. The
//      lib MUST NOT throw.
//   4. `isNewThisWeek` and `hasSocialProof` are pure helpers driving
//      visible badge variants; the social-proof threshold (≥3) is set
//      in the badge memo § 5 and re-pinned here.
//
// DELETION TRIGGER: delete this file when the badge surface is retired.
//
// Run: node --test --experimental-strip-types --no-warnings lib/__tests__/budtender-picks.test.ts

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { hasSocialProof, isNewThisWeek, type ProductFlags } from "../budtender-picks.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const LIB_PATH = join(HERE, "..", "budtender-picks.ts");
const LIB_SRC = readFileSync(LIB_PATH, "utf-8");

describe("budtender-picks — host allow-list defense", () => {
  test("hardcoded default URL = https://brapp.greenlifecannabis.com", () => {
    // Sister of `inventoryappBase()` in `lib/closure-status.ts` — env
    // var drift to a wrong subdomain must not silently route the badge
    // fetch elsewhere.
    assert.match(LIB_SRC, /DEFAULT_INV_APP_URL\s*=\s*"https:\/\/brapp\.greenlifecannabis\.com"/);
  });

  test("rejects env values whose hostname is not brapp.greenlifecannabis.com", () => {
    assert.match(LIB_SRC, /u\.hostname\s*!==\s*"brapp\.greenlifecannabis\.com"/);
  });

  test("requires https:// prefix on env-supplied URL", () => {
    assert.match(LIB_SRC, /env\.startsWith\("https:\/\/"\)/);
  });
});

describe("budtender-picks — fetch contract", () => {
  test("fetches /api/public/product-flags path", () => {
    assert.match(LIB_SRC, /\/api\/public\/product-flags/);
  });

  test("uses next.revalidate = 300 (5-min ISR matches inv-App s-maxage)", () => {
    assert.match(LIB_SRC, /next:\s*\{\s*revalidate:\s*300\s*\}/);
  });

  test("5s AbortSignal timeout (matches closure-status sister)", () => {
    assert.match(LIB_SRC, /setTimeout\([^,]+,\s*5000\)/);
  });

  test("clears the abort timer in finally", () => {
    assert.match(LIB_SRC, /clearTimeout\(timer\)/);
  });
});

describe("budtender-picks — graceful degrade", () => {
  test("any thrown error resolves to empty Map (no rethrow)", () => {
    assert.match(LIB_SRC, /catch\s*\{\s*return\s+new\s+Map\(\)/);
  });

  test("non-ok response resolves to empty Map", () => {
    assert.match(LIB_SRC, /if\s*\(!res\.ok\)\s*return\s+new\s+Map\(\)/);
  });

  test("malformed body (missing products) resolves to empty Map", () => {
    assert.match(LIB_SRC, /!body\.products[^)]*\)\s*\{\s*return\s+new\s+Map\(\)/);
  });
});

describe("budtender-picks — isNewThisWeek pure helper", () => {
  const NOW = new Date("2026-05-30T12:00:00Z");

  test("returns false on undefined flags", () => {
    assert.equal(isNewThisWeek(undefined, NOW), false);
  });

  test("returns false on null newSince", () => {
    const f: ProductFlags = { isBudtenderPick: false, pickCount: 0, newSince: null };
    assert.equal(isNewThisWeek(f, NOW), false);
  });

  test("returns true at exactly the window boundary (7d ago)", () => {
    const sevenDaysAgo = new Date(NOW.getTime() - 7 * 24 * 60 * 60 * 1000);
    const f: ProductFlags = {
      isBudtenderPick: false,
      pickCount: 0,
      newSince: sevenDaysAgo.toISOString(),
    };
    assert.equal(isNewThisWeek(f, NOW), true);
  });

  test("returns false outside the window (>7d ago)", () => {
    const eightDaysAgo = new Date(NOW.getTime() - 8 * 24 * 60 * 60 * 1000);
    const f: ProductFlags = {
      isBudtenderPick: false,
      pickCount: 0,
      newSince: eightDaysAgo.toISOString(),
    };
    assert.equal(isNewThisWeek(f, NOW), false);
  });

  test("returns true for a recent date (1d ago)", () => {
    const oneDayAgo = new Date(NOW.getTime() - 24 * 60 * 60 * 1000);
    const f: ProductFlags = {
      isBudtenderPick: false,
      pickCount: 0,
      newSince: oneDayAgo.toISOString(),
    };
    assert.equal(isNewThisWeek(f, NOW), true);
  });

  test("returns false on malformed ISO string (defensive)", () => {
    const f: ProductFlags = {
      isBudtenderPick: false,
      pickCount: 0,
      newSince: "not-a-date",
    };
    assert.equal(isNewThisWeek(f, NOW), false);
  });
});

describe("budtender-picks — hasSocialProof threshold (≥3 per badge memo § 5)", () => {
  test("returns false on undefined flags", () => {
    assert.equal(hasSocialProof(undefined), false);
  });

  test("returns false when isBudtenderPick = false", () => {
    const f: ProductFlags = { isBudtenderPick: false, pickCount: 5, newSince: null };
    assert.equal(hasSocialProof(f), false);
  });

  test("returns false at pickCount = 2 (below threshold)", () => {
    const f: ProductFlags = { isBudtenderPick: true, pickCount: 2, newSince: null };
    assert.equal(hasSocialProof(f), false);
  });

  test("returns true at pickCount = 3 (threshold met)", () => {
    const f: ProductFlags = { isBudtenderPick: true, pickCount: 3, newSince: null };
    assert.equal(hasSocialProof(f), true);
  });

  test("returns true at pickCount = 10 (above threshold)", () => {
    const f: ProductFlags = { isBudtenderPick: true, pickCount: 10, newSince: null };
    assert.equal(hasSocialProof(f), true);
  });
});
