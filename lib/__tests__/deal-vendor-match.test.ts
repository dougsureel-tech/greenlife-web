// Tests for `lib/deal-vendor-match.ts` — fuzzy match of deal name +
// description to a dialed-in vendor entry. The match upgrades a deal's
// card art from generic-category bucket to vendor-specific hero +
// brand-color gradient on /deals.
//
// Why pinned: every /deals page render funnels through this. A regression
// that drops a vendor's tokens, or picks the wrong vendor on a multi-match,
// silently downgrades that vendor's brand presence sitewide. Also pins the
// order-matters priority within each vendor's tokens list (more-specific
// first) and across VENDORS (higher-frequency brands first for O(1)
// typical traffic).
//
// Run with:  pnpm test:all

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { matchDealVendor, type DealVendorMatch } from "../deal-vendor-match.ts";

describe("matchDealVendor — null/empty inputs", () => {
  test("null name + null description → null", () => {
    assert.equal(matchDealVendor(null, null), null);
  });

  test("undefined name + undefined description → null", () => {
    assert.equal(matchDealVendor(undefined, undefined), null);
  });

  test("empty strings → null", () => {
    assert.equal(matchDealVendor("", ""), null);
  });

  test("whitespace-only → null", () => {
    assert.equal(matchDealVendor("   ", "  \t\n  "), null);
  });

  test("name with no token match → null", () => {
    assert.equal(matchDealVendor("Random Cannabis Sale", "20% off everything"), null);
  });
});

describe("matchDealVendor — case-insensitive matching", () => {
  test("uppercase token in name matches", () => {
    const m = matchDealVendor("PHAT PANDA SALE", null);
    assert.equal(m?.slug, "grow-op-farms");
  });

  test("mixed-case in description matches", () => {
    const m = matchDealVendor("Sale", "Phat Panda gummies");
    assert.equal(m?.slug, "grow-op-farms");
  });

  test("title-case 'Fairwinds' matches", () => {
    const m = matchDealVendor("Fairwinds Tincture Sale", null);
    assert.equal(m?.slug, "fairwinds-manufacturing");
  });
});

describe("matchDealVendor — vendor priority within tokens list", () => {
  test("'phat panda' matches Phat Panda (specific token)", () => {
    const m = matchDealVendor("phat panda sale", null);
    assert.equal(m?.displayName, "Phat Panda");
  });

  test("token order matters: 'panda' alone still matches Phat Panda", () => {
    const m = matchDealVendor("panda gummies sale", null);
    assert.equal(m?.slug, "grow-op-farms");
  });

  test("'nwcs' matches NWCS via shortest specific token", () => {
    const m = matchDealVendor("NWCS pre-rolls", null);
    assert.equal(m?.displayName, "NWCS");
  });

  test("'ec3' (NWCS sub-brand) routes to parent NWCS slug", () => {
    const m = matchDealVendor("EC3 cartridges sale", null);
    assert.equal(m?.slug, "northwest-cannabis-solutions");
  });
});

describe("matchDealVendor — sub-brand routing (parent vendor wins)", () => {
  test("'doozies' routes to parent Green Revolution", () => {
    const m = matchDealVendor("Doozies edibles sale", null);
    assert.equal(m?.slug, "green-revolution");
    assert.equal(m?.displayName, "Green Revolution");
  });

  test("'wildside' routes to parent Green Revolution", () => {
    const m = matchDealVendor("Wildside cartridges", null);
    assert.equal(m?.slug, "green-revolution");
  });

  test("'clout king' routes to parent Minglewood", () => {
    const m = matchDealVendor("Clout King flower", null);
    assert.equal(m?.displayName, "Minglewood");
  });

  test("'slab mechanix' routes to parent Agro Couture", () => {
    const m = matchDealVendor("Slab Mechanix concentrates", null);
    assert.equal(m?.slug, "agro-couture");
  });

  test("'super fog' routes to parent Mfused", () => {
    const m = matchDealVendor("super fog vapes", null);
    assert.equal(m?.slug, "mfused");
  });
});

describe("matchDealVendor — return shape (no leaking tokens field)", () => {
  test("returned object has slug/displayName/logoUrl/heroUrl/accentHex/accent2Hex", () => {
    const m = matchDealVendor("Phat Panda gummies", null);
    assert.ok(m !== null);
    const keys = Object.keys(m).sort();
    assert.deepEqual(keys, ["accent2Hex", "accentHex", "displayName", "heroUrl", "logoUrl", "slug"]);
  });

  test("does NOT leak the internal 'tokens' field to callers", () => {
    const m = matchDealVendor("Phat Panda", null);
    assert.equal((m as DealVendorMatch & { tokens?: unknown }).tokens, undefined);
  });

  test("vendors without logoUrl return logoUrl: null", () => {
    // Plaid Jacket / Spark Industries: logoUrl is null.
    const m = matchDealVendor("Plaid Jacket sale", null);
    assert.equal(m?.logoUrl, null);
  });

  test("vendors without heroUrl return heroUrl: null", () => {
    // Sungrown: heroUrl is null.
    const m = matchDealVendor("Sungrown deals", null);
    assert.equal(m?.heroUrl, null);
  });
});

describe("matchDealVendor — first-match wins (VENDORS order)", () => {
  test("name AND description both contain different vendor tokens → first vendor in VENDORS array wins", () => {
    // "NWCS" matches Northwest Cannabis Solutions (1st in array);
    // "Phat Panda" matches grow-op-farms (2nd in array).
    // With both present, NWCS should win since it's earlier in the array.
    const m = matchDealVendor("NWCS sale with Phat Panda", null);
    assert.equal(m?.slug, "northwest-cannabis-solutions");
  });

  test("description fallback when name has no match", () => {
    const m = matchDealVendor("Holiday deal", "Bondi flower 20% off");
    assert.equal(m?.slug, "bondi-farms");
  });
});

describe("matchDealVendor — brand-color accent shape", () => {
  test("accentHex + accent2Hex are 6-digit hex without '#'", () => {
    const m = matchDealVendor("Phat Panda", null);
    assert.ok(m !== null);
    assert.match(m.accentHex, /^[0-9a-f]{6}$/i);
    assert.match(m.accent2Hex, /^[0-9a-f]{6}$/i);
  });
});
