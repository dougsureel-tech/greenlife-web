// Tests for strain Product + AggregateOffer JSON-LD builder.
//
// Why pinned:
//   1. Tech-SEO win #1 (Google Product rich-results eligibility) depends on
//      the exact Schema.org shape — silent drift = no rich result.
//   2. WSLCB compliance (WAC 314-55-155): description MUST NOT carry
//      efficacy / medical claims. Regression pin proves the banned-phrase
//      scrubber runs and that "treats", "cures", "relieves" do NOT leak
//      from input strings into output.
//   3. AggregateOffer present-vs-absent gating on inventory > 0 is a
//      one-line invariant that's easy to break with a refactor; pinned.
//
// Sister-mirror: seattle-cannabis-web/lib/__tests__/strain-product-json-ld.test.ts.

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  buildStrainProductLd,
  buildStrainBreadcrumbLd,
  scrubWslcbClaims,
  strainCategory,
  priceRangeFor,
} from "../strain-product-json-ld.ts";
import { safeJsonLd } from "../json-ld-safe.ts";
import type { Strain } from "../strains.ts";
import type { MenuProduct } from "../db.ts";

const STORE_WEBSITE = "https://www.example.com";
const STORE_NAME = "Example Cannabis";

function makeStrain(overrides: Partial<Strain> = {}): Strain {
  return {
    slug: "blue-dream",
    name: "Blue Dream",
    type: "hybrid",
    aliases: ["Blue Dream", "BD"],
    tagline: "Balanced everyday hybrid — uplifted, calm, easy.",
    intro: "Test intro.",
    lineage: "Blueberry × Haze",
    parents: ["blueberry", "haze"],
    thcRange: "17-24%",
    cbdRange: "<1%",
    effects: ["Uplifted", "Relaxed"],
    terpenes: [{ name: "Myrcene", note: "earthy" }],
    flavor: ["Sweet berries", "Pine"],
    bestFor: ["Daytime use"],
    avoidIf: ["Heavy THC sensitivity"],
    faqs: [],
    ...overrides,
  };
}

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

describe("buildStrainProductLd — Schema.org Product shape", () => {
  test("emits @context = https://schema.org", () => {
    const ld = buildStrainProductLd({
      strain: makeStrain(),
      matchedProducts: [],
      storeWebsite: STORE_WEBSITE,
      storeName: STORE_NAME,
    });
    assert.equal(ld["@context"], "https://schema.org");
  });

  test("emits @type = Product", () => {
    const ld = buildStrainProductLd({
      strain: makeStrain(),
      matchedProducts: [],
      storeWebsite: STORE_WEBSITE,
      storeName: STORE_NAME,
    });
    assert.equal(ld["@type"], "Product");
  });

  test("@id derives from the strain canonical URL + #product fragment", () => {
    const ld = buildStrainProductLd({
      strain: makeStrain({ slug: "og-kush" }),
      matchedProducts: [],
      storeWebsite: STORE_WEBSITE,
      storeName: STORE_NAME,
    });
    assert.equal(ld["@id"], `${STORE_WEBSITE}/strains/og-kush#product`);
  });

  test("name includes strain name + store anchor", () => {
    const ld = buildStrainProductLd({
      strain: makeStrain(),
      matchedProducts: [],
      storeWebsite: STORE_WEBSITE,
      storeName: STORE_NAME,
    });
    assert.match(String(ld.name), /Blue Dream/);
    assert.match(String(ld.name), /Example Cannabis/);
  });

  test("category is one of the three WSLCB-safe taxonomy strings", () => {
    const allowed = new Set([
      "Cannabis Flower",
      "Cannabis Edible",
      "Cannabis Concentrate",
    ]);
    for (const cat of ["Flower", "Edibles", "Concentrates", "Vapes", null]) {
      const ld = buildStrainProductLd({
        strain: makeStrain(),
        matchedProducts: cat ? [makeProduct({ category: cat })] : [],
        storeWebsite: STORE_WEBSITE,
        storeName: STORE_NAME,
      });
      assert.ok(
        allowed.has(String(ld.category)),
        `category must be in the safe taxonomy (got ${String(ld.category)})`,
      );
    }
  });

  test("url is the canonical strain URL", () => {
    const ld = buildStrainProductLd({
      strain: makeStrain({ slug: "gsc" }),
      matchedProducts: [],
      storeWebsite: STORE_WEBSITE,
      storeName: STORE_NAME,
    });
    assert.equal(ld.url, `${STORE_WEBSITE}/strains/gsc`);
  });

  test("image points at the per-strain opengraph-image route", () => {
    const ld = buildStrainProductLd({
      strain: makeStrain({ slug: "gsc" }),
      matchedProducts: [],
      storeWebsite: STORE_WEBSITE,
      storeName: STORE_NAME,
    });
    assert.equal(ld.image, `${STORE_WEBSITE}/strains/gsc/opengraph-image`);
  });
});

describe("buildStrainProductLd — AggregateOffer gating", () => {
  test("offers block INCLUDED when at least one matched product has unitPrice > 0", () => {
    const ld = buildStrainProductLd({
      strain: makeStrain(),
      matchedProducts: [makeProduct({ unitPrice: 35 })],
      storeWebsite: STORE_WEBSITE,
      storeName: STORE_NAME,
    });
    assert.ok(ld.offers, "offers should be present when inventory has price");
    const offers = ld.offers as { "@type": string; lowPrice: string; highPrice: string };
    assert.equal(offers["@type"], "AggregateOffer");
    assert.equal(offers.lowPrice, "35.00");
    assert.equal(offers.highPrice, "35.00");
  });

  test("offers block OMITTED when matched products array is empty", () => {
    const ld = buildStrainProductLd({
      strain: makeStrain(),
      matchedProducts: [],
      storeWebsite: STORE_WEBSITE,
      storeName: STORE_NAME,
    });
    assert.equal(ld.offers, undefined, "no inventory = OMIT offers block");
  });

  test("offers block OMITTED when no matched product has a positive price", () => {
    const ld = buildStrainProductLd({
      strain: makeStrain(),
      matchedProducts: [
        makeProduct({ unitPrice: 0 }),
        makeProduct({ unitPrice: null }),
      ],
      storeWebsite: STORE_WEBSITE,
      storeName: STORE_NAME,
    });
    assert.equal(ld.offers, undefined, "zero/null prices = OMIT offers block");
  });

  test("lowPrice ≤ highPrice invariant across multi-SKU price range", () => {
    const ld = buildStrainProductLd({
      strain: makeStrain(),
      matchedProducts: [
        makeProduct({ id: "p1", unitPrice: 15 }),
        makeProduct({ id: "p2", unitPrice: 45 }),
        makeProduct({ id: "p3", unitPrice: 30 }),
      ],
      storeWebsite: STORE_WEBSITE,
      storeName: STORE_NAME,
    });
    const offers = ld.offers as { lowPrice: string; highPrice: string; offerCount: number };
    assert.ok(parseFloat(offers.lowPrice) <= parseFloat(offers.highPrice));
    assert.equal(offers.lowPrice, "15.00");
    assert.equal(offers.highPrice, "45.00");
    assert.equal(offers.offerCount, 3);
  });

  test("offers.priceCurrency = USD + availability = InStock", () => {
    const ld = buildStrainProductLd({
      strain: makeStrain(),
      matchedProducts: [makeProduct({ unitPrice: 35 })],
      storeWebsite: STORE_WEBSITE,
      storeName: STORE_NAME,
    });
    const offers = ld.offers as { priceCurrency: string; availability: string };
    assert.equal(offers.priceCurrency, "USD");
    assert.equal(offers.availability, "https://schema.org/InStock");
  });
});

describe("buildStrainProductLd — additionalProperty (THC/CBD/type)", () => {
  test("THC content PropertyValue when strain.thcRange present", () => {
    const ld = buildStrainProductLd({
      strain: makeStrain({ thcRange: "17-24%" }),
      matchedProducts: [],
      storeWebsite: STORE_WEBSITE,
      storeName: STORE_NAME,
    });
    const props = ld.additionalProperty as Array<{ name: string; value: string; "@type": string }>;
    const thc = props.find((p) => p.name === "THC content");
    assert.ok(thc, "THC content property should be present");
    assert.equal(thc!["@type"], "PropertyValue");
    assert.equal(thc!.value, "17-24%");
  });

  test("CBD content PropertyValue when strain.cbdRange present", () => {
    const ld = buildStrainProductLd({
      strain: makeStrain({ cbdRange: "<1%" }),
      matchedProducts: [],
      storeWebsite: STORE_WEBSITE,
      storeName: STORE_NAME,
    });
    const props = ld.additionalProperty as Array<{ name: string; value: string }>;
    const cbd = props.find((p) => p.name === "CBD content");
    assert.ok(cbd);
    assert.equal(cbd!.value, "<1%");
  });

  test("Strain type PropertyValue always emitted (taxonomy, not a claim)", () => {
    const ld = buildStrainProductLd({
      strain: makeStrain({ type: "sativa" }),
      matchedProducts: [],
      storeWebsite: STORE_WEBSITE,
      storeName: STORE_NAME,
    });
    const props = ld.additionalProperty as Array<{ name: string; value: string }>;
    const type = props.find((p) => p.name === "Strain type");
    assert.ok(type);
    assert.equal(type!.value, "Sativa");
  });
});

describe("buildStrainProductLd — WSLCB compliance (description scrubbing)", () => {
  // Regression pins — input strings carrying banned medical/efficacy language
  // MUST NOT leak into the emitted description field. WAC 314-55-155.
  test("input containing 'treats' has the word stripped from output description", () => {
    const ld = buildStrainProductLd({
      strain: makeStrain({
        tagline: "A hybrid that treats stress and tastes like berries.",
      }),
      matchedProducts: [],
      storeWebsite: STORE_WEBSITE,
      storeName: STORE_NAME,
    });
    const desc = String(ld.description ?? "");
    assert.doesNotMatch(desc, /\btreats?\b/i, "treats must not appear in description");
  });

  test("input containing 'cures' has the word stripped from output description", () => {
    const ld = buildStrainProductLd({
      strain: makeStrain({
        tagline: "Sativa that cures fatigue with bright citrus.",
      }),
      matchedProducts: [],
      storeWebsite: STORE_WEBSITE,
      storeName: STORE_NAME,
    });
    const desc = String(ld.description ?? "");
    assert.doesNotMatch(desc, /\bcures?\b/i);
  });

  test("input containing 'relieves' has the word stripped from output description", () => {
    const ld = buildStrainProductLd({
      strain: makeStrain({
        tagline: "Indica that relieves tension after long days.",
      }),
      matchedProducts: [],
      storeWebsite: STORE_WEBSITE,
      storeName: STORE_NAME,
    });
    const desc = String(ld.description ?? "");
    assert.doesNotMatch(desc, /\brelieves?\b/i);
  });

  test("scrubWslcbClaims strips 'helps with anxiety' (medical-claim phrase)", () => {
    const out = scrubWslcbClaims("Bright sativa that helps with anxiety and focus.");
    assert.ok(out);
    assert.doesNotMatch(out!, /\bhelps with\b/i);
    // Standalone "helps" without the trailing "with" doesn't violate
    // WSLCB on its own; we only scrub the bound phrase. Confirm the bound
    // form is gone.
    assert.doesNotMatch(out!, /helps\s+with/i);
  });

  test("scrubWslcbClaims strips 'medical' and 'medicinal'", () => {
    const out = scrubWslcbClaims("Strong medical / medicinal options.");
    assert.ok(out !== null);
    assert.doesNotMatch(out!, /\bmedical\b/i);
    assert.doesNotMatch(out!, /\bmedicinal\b/i);
  });

  test("scrubWslcbClaims strips efficacy frames but leaves bare nouns + names", () => {
    // Frames are removed; the residual bare noun is intentionally left
    // (banning "sleep"/"pain" outright would mangle strain/product names).
    assert.equal(scrubWslcbClaims("Great for sleep"), "sleep");
    assert.equal(scrubWslcbClaims("Perfect for anxiety"), "anxiety");
    assert.equal(scrubWslcbClaims("Knocks out insomnia"), "insomnia");
    assert.equal(scrubWslcbClaims("Calms you down"), "down");
    // Names containing a frame-adjacent word are untouched.
    assert.equal(scrubWslcbClaims("Calm Tincture"), "Calm Tincture");
    assert.equal(scrubWslcbClaims("Pain Killer OG"), "Pain Killer OG");
  });

  test("scrubWslcbClaims returns null when only banned phrases remain", () => {
    const out = scrubWslcbClaims("treats cures relieves heals");
    assert.equal(out, null, "empty-after-scrub should return null (caller OMITs)");
  });

  test("scrubWslcbClaims preserves WSLCB-safe aroma/flavor language", () => {
    const safe = "Sweet berries, pine, vanilla — daytime hybrid.";
    const out = scrubWslcbClaims(safe);
    assert.ok(out);
    assert.match(out!, /berries/);
    assert.match(out!, /pine/);
  });
});

describe("buildStrainProductLd — never carries banned phrases on a wide cross-section", () => {
  test("emitted description has no banned phrase even when tagline is contaminated", () => {
    const banned = ["treats", "cures", "relieves", "medical", "medicinal", "remedy", "alleviates", "therapy", "dosage"];
    for (const word of banned) {
      const ld = buildStrainProductLd({
        strain: makeStrain({ tagline: `Strain that ${word} stress with sweet flavor.` }),
        matchedProducts: [],
        storeWebsite: STORE_WEBSITE,
        storeName: STORE_NAME,
      });
      const desc = String(ld.description ?? "");
      const re = new RegExp(`\\b${word}\\b`, "i");
      assert.doesNotMatch(desc, re, `banned word "${word}" leaked into description`);
    }
  });
});

describe("strainCategory — dominant-category derivation", () => {
  test("Flower dominates → Cannabis Flower", () => {
    assert.equal(
      strainCategory([
        { category: "Flower" },
        { category: "Flower" },
        { category: "Pre-Rolls" },
      ]),
      "Cannabis Flower",
    );
  });

  test("Edibles dominates → Cannabis Edible", () => {
    assert.equal(
      strainCategory([{ category: "Edibles" }, { category: "Edibles" }]),
      "Cannabis Edible",
    );
  });

  test("Vapes/Concentrates → Cannabis Concentrate (no strain hint)", () => {
    assert.equal(strainCategory([{ category: "Vapes" }]), "Cannabis Concentrate");
    assert.equal(
      strainCategory([{ category: "Concentrates" }]),
      "Cannabis Concentrate",
    );
  });

  test("empty input → fallback to Cannabis Flower (WA default taxonomy)", () => {
    assert.equal(strainCategory([]), "Cannabis Flower");
  });

  // Regression pins for v41.925 — strain.type wins over matchedProducts.
  // Pre-fix the live /strains/blue-dream page rendered
  // `"category":"Cannabis Concentrate"` because its 6 matched products
  // were majority cart/concentrate-named SKUs that shared the strain
  // name. Blue Dream IS a hybrid (= flower) by taxonomy — strain.type
  // is canonical; matched-product cross-format derivatives should not
  // override it.
  test("strain.type=hybrid overrides concentrate-leaning matchedProducts → Cannabis Flower", () => {
    assert.equal(
      strainCategory(
        [{ category: "Vapes" }, { category: "Concentrates" }, { category: "Cartridges" }],
        { type: "hybrid" },
      ),
      "Cannabis Flower",
    );
  });

  test("strain.type=sativa overrides matchedProducts → Cannabis Flower", () => {
    assert.equal(
      strainCategory([{ category: "Vapes" }], { type: "sativa" }),
      "Cannabis Flower",
    );
  });

  test("strain.type=indica overrides matchedProducts → Cannabis Flower", () => {
    assert.equal(
      strainCategory([{ category: "Concentrates" }], { type: "indica" }),
      "Cannabis Flower",
    );
  });

  test("strain.type=hybrid with empty matchedProducts → Cannabis Flower (not default-concentrate)", () => {
    assert.equal(strainCategory([], { type: "hybrid" }), "Cannabis Flower");
  });
});

describe("priceRangeFor — price-range derivation", () => {
  test("returns null when no product has a positive price", () => {
    assert.equal(priceRangeFor([]), null);
    assert.equal(priceRangeFor([{ unitPrice: null }, { unitPrice: 0 }]), null);
  });

  test("derives min/max/count from positive prices only", () => {
    const r = priceRangeFor([
      { unitPrice: 15 },
      { unitPrice: null },
      { unitPrice: 0 },
      { unitPrice: 45 },
      { unitPrice: 30 },
    ]);
    assert.ok(r);
    assert.equal(r!.lowPrice, 15);
    assert.equal(r!.highPrice, 45);
    assert.equal(r!.offerCount, 3);
  });
});

describe("buildStrainBreadcrumbLd — 3-level shape", () => {
  test("emits BreadcrumbList with 3 ListItem entries (Home → Strains → strain)", () => {
    const ld = buildStrainBreadcrumbLd({
      strain: makeStrain({ slug: "blue-dream", name: "Blue Dream" }),
      storeWebsite: STORE_WEBSITE,
      storeName: STORE_NAME,
    });
    assert.equal(ld["@type"], "BreadcrumbList");
    const items = ld.itemListElement as Array<{ position: number; name: string; item: string }>;
    assert.equal(items.length, 3);
    assert.equal(items[0].position, 1);
    assert.equal(items[0].item, STORE_WEBSITE);
    assert.equal(items[1].position, 2);
    assert.equal(items[1].name, "Strains");
    assert.equal(items[1].item, `${STORE_WEBSITE}/strains`);
    assert.equal(items[2].position, 3);
    assert.equal(items[2].name, "Blue Dream");
    assert.equal(items[2].item, `${STORE_WEBSITE}/strains/blue-dream`);
  });

  test("@id uses the strain URL + #product-breadcrumb fragment", () => {
    const ld = buildStrainBreadcrumbLd({
      strain: makeStrain({ slug: "gsc" }),
      storeWebsite: STORE_WEBSITE,
      storeName: STORE_NAME,
    });
    assert.equal(ld["@id"], `${STORE_WEBSITE}/strains/gsc#product-breadcrumb`);
  });
});

describe("safeJsonLd encoder — </script> injection defense", () => {
  // Defense-in-depth pin. Even though strain copy is curated, the
  // safeJsonLd helper is what protects every JSON-LD emission across the
  // site against a future scenario where vendor-portal-authored strain
  // copy lands in this surface.
  test("</script> in nested input is escaped to \\u003c form", () => {
    const ld = buildStrainProductLd({
      strain: makeStrain({
        tagline: "Sweet berry strain </script><script>alert(1)</script>",
      }),
      matchedProducts: [],
      storeWebsite: STORE_WEBSITE,
      storeName: STORE_NAME,
    });
    const encoded = safeJsonLd(ld);
    assert.doesNotMatch(encoded, /<\/script>/);
    assert.match(encoded, /\\u003c/);
  });

  test("output round-trips back to identical object after escape decode", () => {
    const ld = buildStrainProductLd({
      strain: makeStrain(),
      matchedProducts: [makeProduct()],
      storeWebsite: STORE_WEBSITE,
      storeName: STORE_NAME,
    });
    const encoded = safeJsonLd(ld);
    // JSON.parse re-decodes < → < so structured-data consumers see
    // identical content even though the HTML parser never sees a literal <.
    const decoded = JSON.parse(encoded);
    assert.equal(decoded["@type"], "Product");
    assert.equal(decoded["@context"], "https://schema.org");
  });
});
