// Tests for breadcrumbJsonLd helper — Schema.org BreadcrumbList generator
// used across /about, /apply, /careers, /menu, /faq, /heroes, /near/[town],
// and the rest of the page graph.
//
// Why pinned: the @id pattern (last-crumb URL + "#breadcrumb") + absolute-
// URL itemListElement are load-bearing for entity-graph @id linkage that
// sibling JSON-LD nodes reference. Silent drift in either pattern breaks
// Google + AI-engine entity recognition.

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { breadcrumbJsonLd, HOME_CRUMB, type Crumb } from "../breadcrumb-jsonld.ts";
import { STORE } from "../store.ts";

describe("breadcrumbJsonLd — schema.org BreadcrumbList shape", () => {
  test("emits @context + @type + @id + itemListElement", () => {
    const out = breadcrumbJsonLd([HOME_CRUMB, { name: "About", url: "/about" }]);
    assert.equal(out["@context"], "https://schema.org");
    assert.equal(out["@type"], "BreadcrumbList");
    assert.ok(out["@id"], "should have @id");
    assert.ok(Array.isArray(out.itemListElement), "should have itemListElement array");
  });

  test("@id derives from the LAST crumb's URL + #breadcrumb fragment", () => {
    const out = breadcrumbJsonLd([
      HOME_CRUMB,
      { name: "About", url: "/about" },
    ]);
    assert.equal(out["@id"], `${STORE.website}/about#breadcrumb`);
  });

  test("@id uses absolute URL for the last crumb even if input was relative", () => {
    const out = breadcrumbJsonLd([HOME_CRUMB, { name: "FAQ", url: "/faq" }]);
    assert.ok(
      out["@id"].startsWith(STORE.website),
      `@id should be absolute (got ${out["@id"]})`,
    );
    assert.ok(out["@id"].endsWith("#breadcrumb"));
  });

  test("@id preserves absolute URL when last crumb already absolute", () => {
    const absUrl = "https://example.com/external-page";
    const out = breadcrumbJsonLd([HOME_CRUMB, { name: "External", url: absUrl }]);
    assert.equal(out["@id"], `${absUrl}#breadcrumb`);
  });
});

describe("breadcrumbJsonLd — itemListElement shape", () => {
  test("position is 1-indexed and ascending", () => {
    const out = breadcrumbJsonLd([
      HOME_CRUMB,
      { name: "Heroes", url: "/heroes" },
      { name: "Military", url: "/heroes/military" },
    ]);
    assert.equal(out.itemListElement.length, 3);
    assert.equal(out.itemListElement[0].position, 1);
    assert.equal(out.itemListElement[1].position, 2);
    assert.equal(out.itemListElement[2].position, 3);
  });

  test("each ListItem has @type, position, name, item", () => {
    const out = breadcrumbJsonLd([HOME_CRUMB, { name: "About", url: "/about" }]);
    for (const li of out.itemListElement) {
      assert.equal(li["@type"], "ListItem");
      assert.equal(typeof li.position, "number");
      assert.equal(typeof li.name, "string");
      assert.equal(typeof li.item, "string");
    }
  });

  test("relative URLs are absolutized against STORE.website", () => {
    const out = breadcrumbJsonLd([HOME_CRUMB, { name: "Menu", url: "/menu" }]);
    assert.equal(out.itemListElement[1].item, `${STORE.website}/menu`);
  });

  test("absolute URLs in input are preserved as-is", () => {
    const absUrl = "https://example.com/external";
    const out = breadcrumbJsonLd([HOME_CRUMB, { name: "Ext", url: absUrl }]);
    assert.equal(out.itemListElement[1].item, absUrl);
  });

  test("HOME_CRUMB renders as STORE.website root with trailing slash", () => {
    const out = breadcrumbJsonLd([HOME_CRUMB]);
    assert.equal(out.itemListElement[0].name, STORE.name);
    // HOME_CRUMB.url = "/" → absolutized as STORE.website + "/"
    assert.equal(out.itemListElement[0].item, `${STORE.website}/`);
  });
});

describe("breadcrumbJsonLd — edge cases", () => {
  test("empty crumbs array → empty itemListElement + STORE.website-based @id", () => {
    const out = breadcrumbJsonLd([]);
    assert.equal(out.itemListElement.length, 0);
    // With no crumbs, @id falls back to STORE.website + #breadcrumb
    assert.equal(out["@id"], `${STORE.website}#breadcrumb`);
  });

  test("single-crumb breadcrumb (just home)", () => {
    const out = breadcrumbJsonLd([HOME_CRUMB]);
    assert.equal(out.itemListElement.length, 1);
    assert.equal(out.itemListElement[0].position, 1);
  });

  test("relative URL not starting with `/` is still prefixed with `/` to form absolute", () => {
    const out = breadcrumbJsonLd([HOME_CRUMB, { name: "Sub", url: "about" }]);
    // Per current implementation, missing leading slash is prefixed.
    assert.equal(out.itemListElement[1].item, `${STORE.website}/about`);
  });
});
