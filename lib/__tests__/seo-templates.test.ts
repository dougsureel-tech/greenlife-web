// Pin tests for `lib/seo-templates.tsx` — Product/Category JSON-LD + the
// productMetadata helper.
//
// Why pinned (sister-bug closed 2026-05-28):
//   1. `productImage()` previously fell back to `${STORE.website}/api/
//      product-image?id=<id>` when `p.imageUrl` was null. That route
//      returns 404 in prod (has for months); the strain-card cleanup
//      script (v42.345) NULLs MORE `image_url` rows on operator run, so
//      the broken fallback was about to amplify. Fix: helper now returns
//      `null` when no image is available; callers MUST omit the `image`
//      field from JSON-LD + `images` from openGraph. These tests pin the
//      omit-when-null contract on all 3 call sites.
//   2. Google's Product structured data treats `image` as recommended-
//      not-required. Present-but-broken is STRICTLY WORSE than omitted —
//      it compounds against the page's quality signal. The "no synthetic
//      fallback URL" invariant is one line that's easy to break with a
//      well-meaning refactor; pinned.
//   3. Per-route opengraph-image.tsx convention (Next 16) provides the
//      layout-level OG fallback for social-share crawlers. Pinning the
//      openGraph.images omit-on-null behavior keeps that fallback path
//      working instead of getting overridden with a 404.
//
// Sister-mirror: seattle-cannabis-web/lib/__tests__/seo-templates.test.ts.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/seo-templates.test.ts
//
// Note: we import the pure schema-builders (`buildProductSchema`,
// `buildCategorySchema`, `productImage`) instead of the React components,
// so the test doesn't depend on a JSX transform (node --test --strip-types
// only strips type annotations; it does NOT transform JSX in .tsx files).

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  buildProductSchema,
  buildCategorySchema,
  productImage,
  productMetadata,
} from "../seo-templates-builders.ts";
import type { MenuProduct } from "../db.ts";

function makeProduct(overrides: Partial<MenuProduct> = {}): MenuProduct {
  return {
    id: "p1",
    name: "Blue Dream 3.5g",
    brand: "Acme",
    category: "Flower",
    strainType: "hybrid",
    thcPct: 22,
    cbdPct: 0,
    unitPrice: 35,
    imageUrl: "/img/p1.jpg",
    effects: null,
    terpenes: null,
    isNew: false,
    isDohCompliant: false,
    ...overrides,
  };
}

describe("productImage — omit-when-null contract (load-bearing helper)", () => {
  test("relative imageUrl is absolutized against STORE.website", () => {
    const url = productImage(makeProduct({ imageUrl: "/img/p1.jpg" }));
    assert.ok(url, "expected non-null url");
    assert.ok(url!.startsWith("http"), `expected absolute URL, got: ${url}`);
    assert.ok(url!.endsWith("/img/p1.jpg"));
  });

  test("absolute imageUrl is passed through unchanged", () => {
    const absolute = "https://cdn.example.com/x/abc.jpg";
    assert.equal(productImage(makeProduct({ imageUrl: absolute })), absolute);
  });

  test("null imageUrl returns null (NOT empty string, NOT the broken /api/product-image URL)", () => {
    const result = productImage(makeProduct({ imageUrl: null }));
    assert.equal(result, null);
  });
});

describe("buildProductSchema — image field omit-when-null contract", () => {
  test("emits image field as absolute URL when source has imageUrl", () => {
    const schema = buildProductSchema(makeProduct({ imageUrl: "/img/p1.jpg" }));
    assert.equal(typeof schema.image, "string");
    assert.ok(
      String(schema.image).startsWith("http"),
      `image should be absolute, got: ${String(schema.image)}`,
    );
    assert.ok(String(schema.image).endsWith("/img/p1.jpg"));
  });

  test("passes through already-absolute imageUrl untouched", () => {
    const absolute = "https://cdn.example.com/x/abc.jpg";
    const schema = buildProductSchema(makeProduct({ imageUrl: absolute }));
    assert.equal(schema.image, absolute);
  });

  test("OMITS image field entirely when imageUrl is null (not empty string, not null literal, not broken URL)", () => {
    const schema = buildProductSchema(makeProduct({ imageUrl: null }));
    assert.ok(
      !("image" in schema),
      `expected schema.image to be omitted, but key was present with value: ${JSON.stringify(schema.image)}`,
    );
  });

  test("serialized output does NOT contain the legacy broken /api/product-image fallback when imageUrl is null", () => {
    const schema = buildProductSchema(makeProduct({ imageUrl: null }));
    const serialized = JSON.stringify(schema);
    assert.ok(
      !serialized.includes("/api/product-image"),
      `expected no /api/product-image fallback, got: ${serialized}`,
    );
  });

  test("regression — other required Product fields still emit when imageUrl is null", () => {
    const schema = buildProductSchema(makeProduct({ imageUrl: null }));
    assert.equal(schema["@type"], "Product");
    assert.equal(schema.name, "Blue Dream 3.5g");
    assert.equal(schema.sku, "p1");
    assert.ok(schema.url);
    assert.ok(schema.category);
    assert.ok(schema.offers, "offers should still emit when unitPrice is present");
    assert.ok(
      Array.isArray(schema.additionalProperty) &&
        (schema.additionalProperty as unknown[]).length > 0,
      "additionalProperty (THC/CBD/strainType) should still emit",
    );
  });
});

describe("buildCategorySchema — ItemList per-item image omit-when-null", () => {
  test("item.image emits when source product has imageUrl", () => {
    const schema = buildCategorySchema({
      category: "Flower",
      products: [makeProduct({ imageUrl: "/img/p1.jpg" })],
      url: "/menu#flower",
    });
    const itemList = schema.mainEntity as Record<string, unknown>;
    const items = itemList.itemListElement as Array<Record<string, unknown>>;
    const firstItem = items[0].item as Record<string, unknown>;
    assert.ok("image" in firstItem, "item should include image when source has imageUrl");
    assert.ok(String(firstItem.image).endsWith("/img/p1.jpg"));
  });

  test("item.image OMITS when source product has null imageUrl", () => {
    const schema = buildCategorySchema({
      category: "Flower",
      products: [makeProduct({ imageUrl: null })],
      url: "/menu#flower",
    });
    const itemList = schema.mainEntity as Record<string, unknown>;
    const items = itemList.itemListElement as Array<Record<string, unknown>>;
    const firstItem = items[0].item as Record<string, unknown>;
    assert.ok(
      !("image" in firstItem),
      `expected item.image to be omitted, but key was present: ${JSON.stringify(firstItem.image)}`,
    );
  });

  test("serialized CategoryJsonLd never contains the legacy broken /api/product-image fallback", () => {
    const schema = buildCategorySchema({
      category: "Flower",
      products: [
        makeProduct({ id: "a", imageUrl: null }),
        makeProduct({ id: "b", imageUrl: "/img/b.jpg" }),
        makeProduct({ id: "c", imageUrl: null }),
      ],
      url: "/menu#flower",
    });
    const serialized = JSON.stringify(schema);
    assert.ok(
      !serialized.includes("/api/product-image"),
      `expected no /api/product-image fallback in output, got: ${serialized}`,
    );
  });

  test("mixed batch — per-item gating: some keep image, others omit", () => {
    const schema = buildCategorySchema({
      category: "Flower",
      products: [
        makeProduct({ id: "a", imageUrl: "/img/a.jpg" }),
        makeProduct({ id: "b", imageUrl: null }),
        makeProduct({ id: "c", imageUrl: "/img/c.jpg" }),
      ],
      url: "/menu#flower",
    });
    const itemList = schema.mainEntity as Record<string, unknown>;
    const items = itemList.itemListElement as Array<Record<string, unknown>>;
    const a = items[0].item as Record<string, unknown>;
    const b = items[1].item as Record<string, unknown>;
    const c = items[2].item as Record<string, unknown>;
    assert.ok("image" in a, "first item with imageUrl should keep image");
    assert.ok(!("image" in b), "middle item with null imageUrl should omit image");
    assert.ok("image" in c, "third item with imageUrl should keep image");
  });
});

describe("productMetadata — openGraph.images omit-when-null contract", () => {
  test("openGraph.images is set when imageUrl is present", () => {
    const md = productMetadata(makeProduct({ imageUrl: "/img/p1.jpg" }));
    const og = md.openGraph as Record<string, unknown>;
    assert.ok(Array.isArray(og.images), "openGraph.images should be an array when image is present");
    const images = og.images as Array<Record<string, unknown>>;
    assert.equal(images.length, 1);
    assert.ok(String(images[0].url).endsWith("/img/p1.jpg"));
    assert.equal(images[0].alt, "Blue Dream 3.5g");
  });

  test("openGraph.images is OMITTED when imageUrl is null (so Next 16 layout opengraph-image fallback applies)", () => {
    const md = productMetadata(makeProduct({ imageUrl: null }));
    const og = md.openGraph as Record<string, unknown>;
    assert.ok(
      !("images" in og),
      `expected openGraph.images to be omitted, but key was present with value: ${JSON.stringify(og.images)}`,
    );
  });

  test("openGraph still emits other fields (title, description, url, type) when imageUrl is null — omit scopes to images only", () => {
    const md = productMetadata(makeProduct({ imageUrl: null }));
    const og = md.openGraph as Record<string, unknown>;
    assert.ok(og.title);
    assert.ok(og.description);
    assert.ok(og.url);
    assert.equal(og.type, "website");
  });

  test("productMetadata never serializes the legacy /api/product-image fallback URL when imageUrl is null", () => {
    const md = productMetadata(makeProduct({ imageUrl: null }));
    const serialized = JSON.stringify(md);
    assert.ok(
      !serialized.includes("/api/product-image"),
      `expected no /api/product-image fallback in metadata, got: ${serialized}`,
    );
  });
});
