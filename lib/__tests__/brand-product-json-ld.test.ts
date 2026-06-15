import { test } from "node:test";
import assert from "node:assert/strict";
import { buildBrandProductLd, type BrandProductForLd } from "../brand-product-json-ld.ts";

const BASE = {
  brandUrl: "https://www.greenlifecannabis.com/brands/example-brand",
  displayName: "Example Brand",
  storeWebsite: "https://www.greenlifecannabis.com",
  menuUrl: "https://www.greenlifecannabis.com/menu",
  fallbackImage: "https://www.greenlifecannabis.com/brands/example-brand/opengraph-image",
  dispensaryId: "https://www.greenlifecannabis.com/#dispensary",
};

function p(overrides: Partial<BrandProductForLd> = {}): BrandProductForLd {
  return { id: 1, name: "Test Flower", unit_price: 25, ...overrides };
}

test("offers.url is ABSOLUTE", () => {
  const node = buildBrandProductLd({ ...BASE, product: p() })!;
  const offers = node.offers as Record<string, unknown>;
  assert.equal(offers.url, "https://www.greenlifecannabis.com/menu");
  assert.ok(String(offers.url).startsWith("https://"), "offers.url must be absolute");
});

test("does NOT emit the legacy availableAtOrFrom property (the GLW defect we fixed)", () => {
  const node = buildBrandProductLd({ ...BASE, product: p() })!;
  const offers = node.offers as Record<string, unknown>;
  assert.equal("availableAtOrFrom" in offers, false);
  assert.equal(offers.availableDeliveryMethod, "https://schema.org/OnSitePickup");
});

test("required Offer fields present: price, priceCurrency, availability", () => {
  const node = buildBrandProductLd({ ...BASE, product: p({ unit_price: 28 }) })!;
  const offers = node.offers as Record<string, unknown>;
  assert.equal(offers.price, "28.00");
  assert.equal(offers.priceCurrency, "USD");
  assert.equal(offers.availability, "https://schema.org/InStock");
});

test("required Product fields present: name, image, brand", () => {
  const node = buildBrandProductLd({ ...BASE, product: p() })!;
  assert.equal(node["@type"], "Product");
  assert.equal(node.name, "Test Flower");
  assert.equal(node.image, BASE.fallbackImage);
  assert.deepEqual(node.brand, { "@type": "Brand", name: "Example Brand" });
});

test("uses product image_url when present, else fallback", () => {
  const withImg = buildBrandProductLd({ ...BASE, product: p({ image_url: "https://cdn.example/x.jpg" }) })!;
  assert.equal(withImg.image, "https://cdn.example/x.jpg");
  const noImg = buildBrandProductLd({ ...BASE, product: p({ image_url: null }) })!;
  assert.equal(noImg.image, BASE.fallbackImage);
});

test("returns null when price missing or non-positive (no price-less Offer)", () => {
  assert.equal(buildBrandProductLd({ ...BASE, product: p({ unit_price: null }) }), null);
  assert.equal(buildBrandProductLd({ ...BASE, product: p({ unit_price: 0 }) }), null);
  assert.equal(buildBrandProductLd({ ...BASE, product: p({ unit_price: -5 }) }), null);
});

test("WSLCB: scrubs efficacy language out of the description", () => {
  const node = buildBrandProductLd({
    ...BASE,
    product: p({ effects: "Relieves anxiety and helps with sleep" }),
  })!;
  const desc = (node.description as string | undefined) ?? "";
  assert.doesNotMatch(desc, /relieves/i);
  assert.doesNotMatch(desc, /helps with/i);
});

test("WSLCB: description OMITTED when it scrubs empty", () => {
  const node = buildBrandProductLd({ ...BASE, product: p({ effects: "relieves" }) })!;
  assert.equal("description" in node, false);
});

test("clean factual effects survive as description", () => {
  const node = buildBrandProductLd({ ...BASE, product: p({ effects: "Citrus, earthy, uplifting" }) })!;
  assert.equal(node.description, "Citrus, earthy, uplifting");
});

test("additionalProperty carries THC/CBD/strain-type when present", () => {
  const node = buildBrandProductLd({
    ...BASE,
    product: p({ thc_pct: 24.5, cbd_pct: 0.3, strain_type: "Hybrid" }),
  })!;
  const ap = node.additionalProperty as Array<{ name: string; value: string }>;
  assert.deepEqual(ap.map((x) => x.name), ["THC", "CBD", "Strain Type"]);
  assert.equal(ap[0].value, "24.5%");
});

test("CBD omitted when zero/null", () => {
  const node = buildBrandProductLd({ ...BASE, product: p({ thc_pct: 20, cbd_pct: 0 }) })!;
  const ap = node.additionalProperty as Array<{ name: string }>;
  assert.equal(ap.some((x) => x.name === "CBD"), false);
});
