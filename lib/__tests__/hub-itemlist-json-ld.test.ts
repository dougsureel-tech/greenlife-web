// Tests for hub-itemlist-json-ld helpers — emits Schema.org ItemList +
// BreadcrumbList JSON-LD across /heroes, /learn, /blog hub pages.
//
// Why pinned:
//   1. WSLCB compliance — silent drift in the banned-phrase filter could
//      let "treats anxiety" / "cures pain" land in customer-facing
//      structured data (WAC 314-55-155 advertising rule).
//   2. SERP carousel eligibility — Google requires position-1-indexed +
//      integer positions + absolute item URLs. A regression to
//      `position: "1"` (string) or relative URLs silently drops the
//      carousel render.
//   3. JSON-LD safety — `safeJsonLd` is the script-injection escape;
//      these tests confirm the helper's output round-trips through it
//      without corruption.

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  buildHubItemListJsonLd,
  buildHubBreadcrumbJsonLd,
  hasBannedPhrase,
  type HubItem,
} from "../hub-itemlist-json-ld.ts";
import { safeJsonLd } from "../json-ld-safe.ts";

const ORIGIN = "https://www.greenlifecannabis.com";

const SAMPLE_ITEMS: HubItem[] = [
  { url: "/heroes/military", name: "Active Military" },
  { url: "/heroes/veterans", name: "Veterans" },
  { url: "/heroes/healthcare", name: "Healthcare Workers" },
];

describe("buildHubItemListJsonLd — shape", () => {
  test("emits @context, @type ItemList, @id, name, itemListElement", () => {
    const out = buildHubItemListJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/heroes",
      hubName: "Heroes Discount Programs",
      items: SAMPLE_ITEMS,
    });
    assert.equal(out["@context"], "https://schema.org");
    assert.equal(out["@type"], "ItemList");
    assert.equal(out["@id"], `${ORIGIN}/heroes#itemlist`);
    assert.equal(out.name, "Heroes Discount Programs");
    assert.ok(Array.isArray(out.itemListElement));
    assert.equal(out.itemListElement.length, 3);
  });

  test("numberOfItems matches itemListElement length", () => {
    const out = buildHubItemListJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/heroes",
      hubName: "Heroes",
      items: SAMPLE_ITEMS,
    });
    assert.equal(out.numberOfItems, out.itemListElement.length);
  });

  test("itemListOrder is ascending (carousel-friendly default)", () => {
    const out = buildHubItemListJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/heroes",
      hubName: "Heroes",
      items: SAMPLE_ITEMS,
    });
    assert.equal(out.itemListOrder, "https://schema.org/ItemListOrderAscending");
  });
});

describe("buildHubItemListJsonLd — itemListElement shape", () => {
  test("position is 1-indexed", () => {
    const out = buildHubItemListJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/heroes",
      hubName: "Heroes",
      items: SAMPLE_ITEMS,
    });
    assert.equal(out.itemListElement[0].position, 1);
  });

  test("position is sequential", () => {
    const out = buildHubItemListJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/heroes",
      hubName: "Heroes",
      items: SAMPLE_ITEMS,
    });
    assert.equal(out.itemListElement[0].position, 1);
    assert.equal(out.itemListElement[1].position, 2);
    assert.equal(out.itemListElement[2].position, 3);
  });

  test("position is integer (not string) — Schema.org Number contract", () => {
    const out = buildHubItemListJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/heroes",
      hubName: "Heroes",
      items: SAMPLE_ITEMS,
    });
    for (const li of out.itemListElement) {
      assert.equal(typeof li.position, "number");
      assert.ok(Number.isInteger(li.position));
    }
  });

  test("each ListItem has @type ListItem + url", () => {
    const out = buildHubItemListJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/heroes",
      hubName: "Heroes",
      items: SAMPLE_ITEMS,
    });
    for (const li of out.itemListElement) {
      assert.equal(li["@type"], "ListItem");
      assert.equal(typeof li.url, "string");
    }
  });
});

describe("buildHubItemListJsonLd — URL canonicalization", () => {
  test("relative url is absolutized against siteOrigin", () => {
    const out = buildHubItemListJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/heroes",
      hubName: "Heroes",
      items: [{ url: "/heroes/military", name: "Military" }],
    });
    assert.equal(out.itemListElement[0].url, `${ORIGIN}/heroes/military`);
  });

  test("absolute url is preserved as-is", () => {
    const abs = "https://example.com/external";
    const out = buildHubItemListJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/heroes",
      hubName: "Heroes",
      items: [{ url: abs, name: "External" }],
    });
    assert.equal(out.itemListElement[0].url, abs);
  });

  test("relative url without leading slash is still absolutized correctly", () => {
    const out = buildHubItemListJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/heroes",
      hubName: "Heroes",
      items: [{ url: "heroes/military", name: "Military" }],
    });
    assert.equal(out.itemListElement[0].url, `${ORIGIN}/heroes/military`);
  });

  test("every emitted url is absolute (no leaked relatives)", () => {
    const out = buildHubItemListJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/heroes",
      hubName: "Heroes",
      items: SAMPLE_ITEMS,
    });
    for (const li of out.itemListElement) {
      assert.ok(
        li.url.startsWith("http"),
        `item url should be absolute (got ${li.url})`,
      );
    }
  });
});

describe("buildHubItemListJsonLd — WSLCB compliance (WAC 314-55-155)", () => {
  test("name containing 'treats anxiety' is OMITTED", () => {
    const out = buildHubItemListJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/learn",
      hubName: "Learn",
      items: [{ url: "/learn/treats-anxiety", name: "How CBD treats anxiety" }],
    });
    assert.equal(out.itemListElement[0].name, undefined);
    // url still rendered — the link itself is fine, only the name is non-compliant
    assert.equal(out.itemListElement[0].url, `${ORIGIN}/learn/treats-anxiety`);
  });

  test("name containing 'cures' is OMITTED", () => {
    const out = buildHubItemListJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/learn",
      hubName: "Learn",
      items: [{ url: "/learn/x", name: "Cannabis cures insomnia" }],
    });
    assert.equal(out.itemListElement[0].name, undefined);
  });

  test("name containing 'relieves' is OMITTED", () => {
    const out = buildHubItemListJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/learn",
      hubName: "Learn",
      items: [{ url: "/learn/x", name: "What relieves chronic pain" }],
    });
    assert.equal(out.itemListElement[0].name, undefined);
  });

  test("description with banned phrase is OMITTED while name is preserved", () => {
    const out = buildHubItemListJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/learn",
      hubName: "Learn",
      items: [
        {
          url: "/learn/terpenes",
          name: "Terpenes basics",
          description: "Why limonene cures depression",
        },
      ],
    });
    assert.equal(out.itemListElement[0].name, "Terpenes basics");
    assert.equal(out.itemListElement[0].description, undefined);
  });

  test("compliant name is preserved verbatim (Heroes / Veterans / Active Military)", () => {
    const out = buildHubItemListJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/heroes",
      hubName: "Heroes",
      items: SAMPLE_ITEMS,
    });
    assert.equal(out.itemListElement[0].name, "Active Military");
    assert.equal(out.itemListElement[1].name, "Veterans");
    assert.equal(out.itemListElement[2].name, "Healthcare Workers");
  });

  test("hasBannedPhrase exposes the filter for callers", () => {
    assert.equal(hasBannedPhrase("Veterans"), false);
    assert.equal(hasBannedPhrase("Heroes Discount"), false);
    assert.equal(hasBannedPhrase("treats anxiety"), true);
    assert.equal(hasBannedPhrase("TREATS ANXIETY"), true); // case-insensitive
    assert.equal(hasBannedPhrase("Cannabis cures cancer"), true);
    assert.equal(hasBannedPhrase(undefined), false);
    assert.equal(hasBannedPhrase(""), false);
  });
});

describe("buildHubItemListJsonLd — optional fields", () => {
  test("image URL is passed through when present", () => {
    const out = buildHubItemListJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/blog",
      hubName: "Blog",
      items: [
        {
          url: "/blog/post-a",
          name: "Post A",
          image: `${ORIGIN}/blog/post-a/opengraph-image`,
        },
      ],
    });
    assert.equal(
      out.itemListElement[0].image,
      `${ORIGIN}/blog/post-a/opengraph-image`,
    );
  });

  test("image is omitted when not supplied", () => {
    const out = buildHubItemListJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/heroes",
      hubName: "Heroes",
      items: [{ url: "/heroes/x", name: "X" }],
    });
    assert.equal("image" in out.itemListElement[0], false);
  });

  test("description is passed through when compliant", () => {
    const out = buildHubItemListJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/blog",
      hubName: "Blog",
      items: [
        {
          url: "/blog/post-a",
          name: "Post A",
          description: "Everything you need to know about Washington cannabis tax.",
        },
      ],
    });
    assert.equal(
      out.itemListElement[0].description,
      "Everything you need to know about Washington cannabis tax.",
    );
  });
});

describe("buildHubItemListJsonLd — edge cases", () => {
  test("empty items array → empty itemListElement (NOT null/missing)", () => {
    const out = buildHubItemListJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/heroes",
      hubName: "Heroes",
      items: [],
    });
    assert.ok(Array.isArray(out.itemListElement));
    assert.equal(out.itemListElement.length, 0);
    assert.equal(out.numberOfItems, 0);
  });

  test("safeJsonLd integration — </script> in name is escaped, not raw", () => {
    const out = buildHubItemListJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/heroes",
      hubName: "Heroes",
      items: [{ url: "/heroes/x", name: "Innocent</script><script>alert(1)</script>" }],
    });
    const serialized = safeJsonLd(out);
    // Raw `</script>` must NEVER appear in the serialized output.
    assert.equal(serialized.includes("</script>"), false);
    // The escape representation MUST appear instead.
    assert.ok(serialized.includes("\\u003c/script"));
  });

  test("@id is stable per hubPath", () => {
    const a = buildHubItemListJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/heroes",
      hubName: "Heroes",
      items: [],
    });
    const b = buildHubItemListJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/learn",
      hubName: "Learn",
      items: [],
    });
    assert.notEqual(a["@id"], b["@id"]);
    assert.equal(a["@id"], `${ORIGIN}/heroes#itemlist`);
    assert.equal(b["@id"], `${ORIGIN}/learn#itemlist`);
  });
});

describe("buildHubBreadcrumbJsonLd — shape", () => {
  test("emits @context + @type BreadcrumbList + @id + 2-level itemListElement", () => {
    const out = buildHubBreadcrumbJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/heroes",
      hubName: "Heroes",
    });
    assert.equal(out["@context"], "https://schema.org");
    assert.equal(out["@type"], "BreadcrumbList");
    assert.equal(out["@id"], `${ORIGIN}/heroes#breadcrumb`);
    assert.equal(out.itemListElement.length, 2);
  });

  test("Home is position 1, hub is position 2 (ordered)", () => {
    const out = buildHubBreadcrumbJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/heroes",
      hubName: "Heroes",
    });
    assert.equal(out.itemListElement[0].position, 1);
    assert.equal(out.itemListElement[0].name, "Home");
    assert.equal(out.itemListElement[0].item, ORIGIN);
    assert.equal(out.itemListElement[1].position, 2);
    assert.equal(out.itemListElement[1].name, "Heroes");
    assert.equal(out.itemListElement[1].item, `${ORIGIN}/heroes`);
  });

  test("both crumb URLs are absolute against siteOrigin", () => {
    const out = buildHubBreadcrumbJsonLd({
      siteOrigin: ORIGIN,
      hubPath: "/blog",
      hubName: "Blog",
    });
    for (const li of out.itemListElement) {
      assert.ok(
        typeof li.item === "string" && li.item.startsWith("http"),
        `crumb item should be absolute (got ${li.item})`,
      );
    }
  });
});
