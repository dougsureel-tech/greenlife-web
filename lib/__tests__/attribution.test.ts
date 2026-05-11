// Tests for `lib/attribution.ts` — marketing-attribution breadcrumb
// stamping + validation. The cookie path is what eventually joins to
// completed transactions on the POS side; the public-site half lays
// the wire.
//
// Why pinned: every outbound CTA on every site funnels through `withAttr`.
// A regression that breaks the slug-sanitization (cookie injection),
// drops a SOURCE_KIND, or accepts an unrecognized kind in validation
// would persist garbage data into the attribution stream — silently
// blowing up downstream marketing-attribution reports without warning.
//
// Run with:  pnpm test:all

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  ATTR_COOKIE,
  ATTR_TTL_DAYS,
  SOURCE_KINDS,
  makeAttrValue,
  withAttr,
  validateAttrValue,
} from "../attribution.ts";

// ── Constants ───────────────────────────────────────────────────────────

describe("attribution constants", () => {
  test("ATTR_COOKIE is the stable cookie name", () => {
    assert.equal(ATTR_COOKIE, "gl_attr_source");
  });

  test("ATTR_TTL_DAYS is 30", () => {
    assert.equal(ATTR_TTL_DAYS, 30);
  });

  test("SOURCE_KINDS includes the load-bearing kinds", () => {
    for (const kind of ["deal", "brand", "home", "blog", "sms", "email", "push", "menu", "order"]) {
      assert.ok(SOURCE_KINDS.includes(kind as typeof SOURCE_KINDS[number]), `${kind} should be in SOURCE_KINDS`);
    }
  });
});

// ── makeAttrValue ───────────────────────────────────────────────────────

describe("makeAttrValue — happy paths", () => {
  test("clean slug emits 'kind:slug'", () => {
    assert.equal(makeAttrValue("deal", "blue-dream-tuesday"), "deal:blue-dream-tuesday");
  });

  test("uppercase slug is lowercased", () => {
    assert.equal(makeAttrValue("brand", "AVITAS"), "brand:avitas");
  });

  test("trims surrounding whitespace", () => {
    assert.equal(makeAttrValue("home", "   hero   "), "home:hero");
  });
});

describe("makeAttrValue — sanitization", () => {
  test("spaces collapse to single dash", () => {
    assert.equal(makeAttrValue("home", "feature card"), "home:feature-card");
  });

  test("special chars become dashes", () => {
    assert.equal(makeAttrValue("blog", "what's up?!"), "blog:what-s-up");
  });

  test("leading/trailing dashes stripped", () => {
    assert.equal(makeAttrValue("blog", "---hello---"), "blog:hello");
  });

  test("slug truncated to 64 chars", () => {
    const longSlug = "a".repeat(120);
    const out = makeAttrValue("blog", longSlug);
    assert.ok(out !== null);
    // Total: "blog:" (5) + slug (up to 64)
    const slugPart = out.slice("blog:".length);
    assert.ok(slugPart.length <= 64);
  });

  test("preserves underscores + colons (intentionally allowed)", () => {
    assert.equal(makeAttrValue("sms", "campaign_123"), "sms:campaign_123");
    assert.equal(makeAttrValue("sms", "camp:welcome"), "sms:camp:welcome");
  });
});

describe("makeAttrValue — rejection", () => {
  test("returns null on unknown kind", () => {
    assert.equal(makeAttrValue("fake" as never, "anything"), null);
  });

  test("returns null when sanitized slug is empty", () => {
    assert.equal(makeAttrValue("home", "!!!"), null);
    assert.equal(makeAttrValue("home", "---"), null);
    assert.equal(makeAttrValue("home", "   "), null);
  });
});

// ── withAttr ────────────────────────────────────────────────────────────

describe("withAttr — happy paths", () => {
  test("stamps relative href without existing query", () => {
    const out = withAttr("/menu", "header", "menu-link");
    assert.equal(out, "/menu?from=header%3Amenu-link");
  });

  test("appends to existing query with '&'", () => {
    const out = withAttr("/deals?cat=flower", "deals-card", "blue-dream");
    assert.equal(out, "/deals?cat=flower&from=deals-card%3Ablue-dream");
  });

  test("URL-encodes the colon in the value", () => {
    const out = withAttr("/menu", "header", "shop");
    assert.ok(out.includes("from=header%3Ashop"));
  });
});

describe("withAttr — passthrough cases", () => {
  test("absolute http URL passes through", () => {
    const out = withAttr("http://example.com/foo", "footer", "external");
    assert.equal(out, "http://example.com/foo");
  });

  test("absolute https URL passes through", () => {
    const out = withAttr("https://example.com/foo", "footer", "external");
    assert.equal(out, "https://example.com/foo");
  });

  test("mailto: passes through (no stamping)", () => {
    const out = withAttr("mailto:doug@x.co", "footer", "email");
    assert.equal(out, "mailto:doug@x.co");
  });

  test("tel: passes through", () => {
    const out = withAttr("tel:+15095550100", "footer", "call");
    assert.equal(out, "tel:+15095550100");
  });

  test("empty href returns empty", () => {
    assert.equal(withAttr("", "header", "x"), "");
  });

  test("returns original when slug sanitizes to empty (no double '?' artifact)", () => {
    const out = withAttr("/menu", "header", "!!!");
    assert.equal(out, "/menu");
  });
});

describe("withAttr — politeness (no double-stamping)", () => {
  test("already-stamped href is not re-stamped", () => {
    const out = withAttr("/menu?from=header%3Aexisting", "deals-card", "new-tag");
    assert.equal(out, "/menu?from=header%3Aexisting");
  });

  test("from= appearing after another query param still skips", () => {
    const out = withAttr("/menu?cat=x&from=header%3Ay", "deals-card", "new");
    assert.equal(out, "/menu?cat=x&from=header%3Ay");
  });
});

// ── validateAttrValue ───────────────────────────────────────────────────

describe("validateAttrValue — happy paths", () => {
  test("clean 'kind:slug' passes", () => {
    assert.equal(validateAttrValue("deal:blue-dream"), "deal:blue-dream");
  });

  test("URL-encoded value decoded + validated", () => {
    assert.equal(validateAttrValue("deal%3Ablue-dream"), "deal:blue-dream");
  });

  test("underscores + colons in slug pass", () => {
    assert.equal(validateAttrValue("sms:camp_123"), "sms:camp_123");
    assert.equal(validateAttrValue("sms:camp:1"), "sms:camp:1");
  });
});

describe("validateAttrValue — rejection (never persist garbage)", () => {
  test("null returns null", () => {
    assert.equal(validateAttrValue(null), null);
  });

  test("undefined returns null", () => {
    assert.equal(validateAttrValue(undefined), null);
  });

  test("empty string returns null", () => {
    assert.equal(validateAttrValue(""), null);
  });

  test("oversized (>96 chars) returns null", () => {
    const big = "deal:" + "a".repeat(95);
    assert.equal(validateAttrValue(big), null);
  });

  test("unknown kind returns null", () => {
    assert.equal(validateAttrValue("fake:something"), null);
  });

  test("missing colon → null", () => {
    assert.equal(validateAttrValue("dealblue-dream"), null);
  });

  test("uppercase in slug → null (must be lowercased before validation)", () => {
    assert.equal(validateAttrValue("deal:BLUE-dream"), null);
  });

  test("special chars in slug → null", () => {
    assert.equal(validateAttrValue("deal:blue dream!"), null);
  });

  test("kind-only with no slug → null", () => {
    assert.equal(validateAttrValue("deal:"), null);
  });
});
