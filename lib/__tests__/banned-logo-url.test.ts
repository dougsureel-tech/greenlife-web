// Tests for `lib/banned-logo-url.ts` — vendor-logo SoT guard +
// product-image domain denylist.
//
// Why pinned: this is the single guard preventing aggregator-hosted
// brand logos (Weedmaps / Leafly) and known-broken vendor hosts from
// reaching the page render or JSON-LD emit. Drift means:
//   - SEO penalty (Google reads aggregator URLs as "we don't own this brand")
//   - Broken-image flashes when aggregators rotate their CDN scheme
//   - 405 errors from dead vendor hosts (the420bar.com)
//
// Pin both the boolean predicates AND the safe* unwrappers — a regression
// in either layer silently leaks the bad URL through.
//
// Run with:  pnpm test:all

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  BANNED_LOGO_DOMAINS,
  BANNED_PRODUCT_IMAGE_DOMAINS,
  BROKEN_LOGO_URLS,
  isBannedLogoUrl,
  isBannedProductImageUrl,
  safeLogoUrl,
  safeProductImageUrl,
} from "../banned-logo-url.ts";

// ── Constants ───────────────────────────────────────────────────────────

describe("constants", () => {
  test("BANNED_LOGO_DOMAINS includes weedmaps + leafly + leafly.ca", () => {
    assert.ok(BANNED_LOGO_DOMAINS.includes("weedmaps.com"));
    assert.ok(BANNED_LOGO_DOMAINS.includes("leafly.com"));
    assert.ok(BANNED_LOGO_DOMAINS.includes("leafly.ca"));
  });

  test("BANNED_PRODUCT_IMAGE_DOMAINS includes the420bar.com", () => {
    assert.ok(BANNED_PRODUCT_IMAGE_DOMAINS.includes("the420bar.com"));
  });

  test("BROKEN_LOGO_URLS is a Set", () => {
    assert.ok(BROKEN_LOGO_URLS instanceof Set);
  });
});

// ── isBannedLogoUrl ─────────────────────────────────────────────────────

describe("isBannedLogoUrl — banned aggregator domains", () => {
  test("weedmaps.com apex rejected", () => {
    assert.equal(isBannedLogoUrl("https://weedmaps.com/foo/bar.png"), true);
  });

  test("subdomain.weedmaps.com rejected (endsWith match)", () => {
    assert.equal(isBannedLogoUrl("https://cdn.weedmaps.com/foo.png"), true);
  });

  test("leafly.com apex rejected", () => {
    assert.equal(isBannedLogoUrl("https://leafly.com/x.png"), true);
  });

  test("subdomain.leafly.com rejected", () => {
    assert.equal(isBannedLogoUrl("https://images.leafly.com/x.png"), true);
  });

  test("leafly.ca apex rejected", () => {
    assert.equal(isBannedLogoUrl("https://leafly.ca/x.png"), true);
  });

  test("subdomain.leafly.ca rejected", () => {
    assert.equal(isBannedLogoUrl("https://cdn.leafly.ca/x.png"), true);
  });

  test("LEAFLY.COM uppercase rejected (host lowercased)", () => {
    assert.equal(isBannedLogoUrl("https://LEAFLY.COM/x.png"), true);
  });
});

describe("isBannedLogoUrl — substring-only does NOT match", () => {
  test("notleafly.com NOT rejected (must be apex or .leafly.com)", () => {
    assert.equal(isBannedLogoUrl("https://notleafly.com/x.png"), false);
  });

  test("myweedmapsclone.com NOT rejected", () => {
    assert.equal(isBannedLogoUrl("https://myweedmapsclone.com/x.png"), false);
  });
});

describe("isBannedLogoUrl — BROKEN_LOGO_URLS exact-match", () => {
  test("the420bar 420-logo-alpha exact match rejected", () => {
    assert.equal(
      isBannedLogoUrl("https://the420bar.com/wp-content/uploads/2022/04/420-logo-alpha.png"),
      true,
    );
  });

  test("agrocouture gold logo exact match rejected", () => {
    assert.equal(
      isBannedLogoUrl(
        "https://agrocouture.com/wp-content/uploads/2024/01/Agro-Couture_Logo-gold.png",
      ),
      true,
    );
  });
});

describe("isBannedLogoUrl — malformed input", () => {
  test("non-URL string rejected (URL ctor throws → true)", () => {
    assert.equal(isBannedLogoUrl("not a url"), true);
  });

  test("empty string rejected", () => {
    assert.equal(isBannedLogoUrl(""), true);
  });

  test("relative path rejected", () => {
    assert.equal(isBannedLogoUrl("/relative/path.png"), true);
  });
});

describe("isBannedLogoUrl — happy paths (brand-owned hosts)", () => {
  test("avitas.com passes", () => {
    assert.equal(isBannedLogoUrl("https://avitas.com/logo.png"), false);
  });

  test("phatpanda.com passes", () => {
    assert.equal(isBannedLogoUrl("https://phatpanda.com/logo.png"), false);
  });
});

// ── safeLogoUrl ─────────────────────────────────────────────────────────

describe("safeLogoUrl — null/undefined passthrough", () => {
  test("null returns null", () => {
    assert.equal(safeLogoUrl(null), null);
  });
  test("undefined returns null", () => {
    assert.equal(safeLogoUrl(undefined), null);
  });
  test("empty string returns null", () => {
    assert.equal(safeLogoUrl(""), null);
  });
});

describe("safeLogoUrl — banned → null, valid → passthrough", () => {
  test("weedmaps URL → null", () => {
    assert.equal(safeLogoUrl("https://weedmaps.com/foo.png"), null);
  });

  test("brand-owned URL passes through unchanged", () => {
    assert.equal(safeLogoUrl("https://avitas.com/logo.png"), "https://avitas.com/logo.png");
  });

  test("BROKEN_LOGO_URLS entry → null", () => {
    assert.equal(
      safeLogoUrl("https://the420bar.com/wp-content/uploads/2022/04/420-logo-alpha.png"),
      null,
    );
  });
});

// ── isBannedProductImageUrl ─────────────────────────────────────────────

describe("isBannedProductImageUrl — banned hosts", () => {
  test("the420bar.com apex rejected", () => {
    assert.equal(
      isBannedProductImageUrl("https://the420bar.com/wp-content/uploads/x.jpg"),
      true,
    );
  });

  test("subdomain.the420bar.com rejected (endsWith match)", () => {
    assert.equal(isBannedProductImageUrl("https://cdn.the420bar.com/x.jpg"), true);
  });
});

describe("isBannedProductImageUrl — malformed input", () => {
  test("non-URL rejected", () => {
    assert.equal(isBannedProductImageUrl("not a url"), true);
  });

  test("empty string rejected", () => {
    assert.equal(isBannedProductImageUrl(""), true);
  });
});

describe("isBannedProductImageUrl — happy paths", () => {
  test("dutchie CDN passes", () => {
    assert.equal(
      isBannedProductImageUrl("https://images.dutchie.com/products/avitas.jpg"),
      false,
    );
  });

  test("seattlecannabis.co self-hosted passes", () => {
    assert.equal(
      isBannedProductImageUrl("https://seattlecannabis.co/products/x.jpg"),
      false,
    );
  });
});

// ── safeProductImageUrl ─────────────────────────────────────────────────

describe("safeProductImageUrl", () => {
  test("null returns null", () => {
    assert.equal(safeProductImageUrl(null), null);
  });
  test("undefined returns null", () => {
    assert.equal(safeProductImageUrl(undefined), null);
  });
  test("empty string returns null", () => {
    assert.equal(safeProductImageUrl(""), null);
  });
  test("banned host returns null", () => {
    assert.equal(safeProductImageUrl("https://the420bar.com/x.jpg"), null);
  });
  test("valid CDN URL passes through unchanged", () => {
    assert.equal(
      safeProductImageUrl("https://images.dutchie.com/x.jpg"),
      "https://images.dutchie.com/x.jpg",
    );
  });
});
