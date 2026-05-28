import type { Metadata } from "next";
import { STORE } from "./store.ts";
import type { MenuProduct } from "./db.ts";

// ─────────────────────────────────────────────────────────────────────
// Pure schema + metadata builders behind `seo-templates.tsx`.
//
// Why this file exists separately from `seo-templates.tsx`:
//   - Node's `--test --experimental-strip-types` runner refuses to load
//     `.tsx` files at all (it strips TypeScript annotations but does NOT
//     transform JSX). Splitting the pure schema-building logic into this
//     `.ts` file lets the pin tests at `__tests__/seo-templates.test.ts`
//     import + exercise the builders directly without needing a JSX
//     transform in the test environment.
//   - `seo-templates.tsx` keeps the thin React-component wrappers
//     (`ProductJsonLd`, `CategoryJsonLd`) and re-exports everything here
//     so existing call sites continue to import from `@/lib/seo-templates`
//     unchanged.
//
// Compliance posture: same as the parent — WAC 314-55-155 governs
// advertising. Builders emit factual product metadata (price, THC%,
// brand, strain type) only. No efficacy claims. Cannabis is non-returnable
// per WAC 314-55-079 (hasMerchantReturnPolicy = MerchantReturnNotPermitted).
// ─────────────────────────────────────────────────────────────────────

const ORG_ID = `${STORE.website}/#dispensary`;

function productSlug(p: MenuProduct): string {
  return p.id;
}

function productUrl(p: MenuProduct): string {
  // Anchor to /menu#<id> until /menu/[id] detail route ships. Pre-fix
  // returned `/menu/${id}` which 404s today (no such route) — every
  // Product JSON-LD link from any future caller would become a SERP-
  // visible dead URL the moment the schema lands. /menu#<id> works
  // today (the menu page renders, the anchor scrolls to the product
  // card) and stays correct as a redirect target once the detail route
  // ships. Cross-ref Menu Model A Phase 1 + memory pin
  // `feedback_menu_cutover_guardrail_2026_05_16`. When detail route
  // lands, swap back to /menu/${id}.
  return `${STORE.website}/menu#${productSlug(p)}`;
}

// Returns the absolute URL for a product's image, or `null` when no image is
// available. Callers MUST omit the `image` field from their JSON-LD / OG
// payload when this returns null — DO NOT substitute an empty string or a
// broken fallback URL.
//
// Why null-when-missing (and not a synthetic on-domain fallback):
//   - Google's Product structured data treats `image` as recommended, not
//     required. Omitting it costs us the image-rich SERP card for that
//     specific SKU, nothing else.
//   - Emitting a present-but-broken URL is STRICTLY WORSE than omitting:
//     Google's quality signal is "schema CLAIMED an image, the URL 404'd"
//     which compounds against the page's overall trust score.
//   - Prior fallback `${STORE.website}/api/product-image?id=<id>` pointed
//     at a route that has been a known-broken (404) renderer in prod for
//     months. The strain-card cleanup script (`scripts/null-broken-image-
//     urls.mjs`, shipped v42.345) NULLs rows where `image_url` matches
//     that same broken pattern — so the legacy fallback was about to
//     amplify the very problem the cleanup script closes.
//   - OpenGraph share-card crawlers (Facebook, LinkedIn, etc.) already
//     get a sensible default via the layout's per-route
//     `opengraph-image.tsx` (Next 16 file convention) — omitting `images`
//     from a per-product Metadata object falls back to the layout
//     default, not "no image."
//
// If we ever ship a real static fallback (e.g. branded "no photo yet"
// card served from `public/`), point this at it. Until then: null = omit.
export function productImage(p: MenuProduct): string | null {
  if (p.imageUrl) return p.imageUrl.startsWith("http") ? p.imageUrl : `${STORE.website}${p.imageUrl}`;
  return null;
}

// ─── Product schema builder ─────────────────────────────────────────
//
// Emits a Product + Offer schema for a single SKU. Designed for AI
// engines (Claude / Perplexity / ChatGPT) to cite SKU-level facts when
// answering "best CBD tincture in Wenatchee" or "Avitas live resin
// price." All optional fields gracefully omit when source data is null.

export function buildProductSchema(p: MenuProduct): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": productUrl(p),
    name: p.name,
    sku: p.id,
    url: productUrl(p),
    category: p.category ?? "Cannabis",
  };

  // image: omit when null per `productImage()` contract. Google treats
  // Product.image as recommended-not-required; a broken URL would compound
  // against the page's trust score.
  const image = productImage(p);
  if (image) schema.image = image;

  if (p.brand) {
    schema.brand = { "@type": "Brand", name: p.brand };
  }

  // Description — factual, no efficacy claims. Strain type + THC/CBD
  // numeric facts. Skip terpenes/effects unless we have them, since
  // dropping a generic line ("relaxing, body-heavy") would be a soft
  // medical claim under WAC 314-55-155 (the advertising rule prohibiting
  // medical/health/efficacy statements).
  const descParts: string[] = [];
  if (p.brand) descParts.push(p.brand);
  if (p.category) descParts.push(p.category);
  if (p.strainType) descParts.push(p.strainType);
  if (p.thcPct != null) descParts.push(`${p.thcPct}% THC`);
  if (p.cbdPct != null && p.cbdPct > 0) descParts.push(`${p.cbdPct}% CBD`);
  if (descParts.length) schema.description = descParts.join(" · ");

  if (p.unitPrice != null) {
    schema.offers = {
      "@type": "Offer",
      price: p.unitPrice.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      url: productUrl(p),
      seller: { "@id": ORG_ID },
      // Cash only — declared explicitly so AI engines don't claim "credit
      // accepted" by inference.
      acceptedPaymentMethod: "http://purl.org/goodrelations/v1#Cash",
      // Pickup-only — cannabis cannot be shipped or delivered from a
      // licensed retailer per WAC 314-55-079.
      availableDeliveryMethod: "http://purl.org/goodrelations/v1#DeliveryModePickUp",
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        // Cannabis is non-returnable per WSLCB rules. Schema-spec value
        // for "no returns accepted."
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
      },
    };
  }

  // Cannabinoid-content as additionalProperty so AI engines can extract
  // structured "what's the THC%" data without parsing the description.
  const additionalProperties: Array<Record<string, unknown>> = [];
  if (p.thcPct != null) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: "THC",
      value: p.thcPct,
      unitText: "%",
    });
  }
  if (p.cbdPct != null) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: "CBD",
      value: p.cbdPct,
      unitText: "%",
    });
  }
  if (p.strainType) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: "Strain Type",
      value: p.strainType,
    });
  }
  if (p.terpenes) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: "Terpenes",
      value: p.terpenes,
    });
  }
  if (additionalProperties.length) schema.additionalProperty = additionalProperties;

  return schema;
}

// ─── Product Metadata helper ─────────────────────────────────────────
//
// Returns a Next.js Metadata object — title, description, canonical,
// OpenGraph image — sized for the product detail page. Pass through to
// `export async function generateMetadata`.

export function productMetadata(product: MenuProduct): Metadata {
  const titleParts = [product.name];
  if (product.brand) titleParts.push(product.brand);
  const title = `${titleParts.join(" — ")} | ${STORE.name}`;

  const descParts: string[] = [];
  if (product.brand && product.category) {
    descParts.push(`${product.brand} ${product.category}`);
  } else if (product.category) {
    descParts.push(product.category);
  }
  if (product.thcPct != null) descParts.push(`${product.thcPct}% THC`);
  if (product.unitPrice != null) descParts.push(`$${product.unitPrice.toFixed(2)}`);
  descParts.push(`available for pickup at ${STORE.name} in ${STORE.address.city}, WA`);
  const description = descParts.join(" · ") + ". Cash only, 21+ with valid ID.";

  // openGraph.images: omit when null. Next 16's per-route opengraph-image.tsx
  // file convention provides the layout-level fallback share-card; emitting a
  // broken URL would override that with a 404.
  const image = productImage(product);

  return {
    title,
    description,
    alternates: { canonical: `/menu/${productSlug(product)}` },
    openGraph: {
      title,
      description,
      url: productUrl(product),
      type: "website",
      ...(image ? { images: [{ url: image, alt: product.name }] } : {}),
    },
  };
}

// ─── Category schema builder ────────────────────────────────────────
//
// CollectionPage + ItemList schema for a category landing
// (/menu#flower, /order?category=Flower, or whatever URL the tree menu
// settles on). Lets AI engines understand the page is "all the flower
// SKUs ${STORE.name} carries" rather than a marketing splash.

export type CategoryJsonLdProps = {
  category: string;
  products: MenuProduct[];
  url: string; // canonical URL of the category landing
};

export function buildCategorySchema({ category, products, url }: CategoryJsonLdProps): Record<string, unknown> {
  const absoluteUrl = url.startsWith("http") ? url : `${STORE.website}${url}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": absoluteUrl,
    url: absoluteUrl,
    name: `${category} — ${STORE.name}`,
    description: `${category} from ${STORE.name} in ${STORE.address.city}, WA. Live inventory, cash-only pickup, 21+.`,
    isPartOf: { "@id": `${STORE.website}/#website` },
    about: { "@id": ORG_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => {
        const image = productImage(p);
        return {
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Product",
            "@id": productUrl(p),
            name: p.name,
            // image: omit when null per `productImage()` contract (see helper
            // comment for rationale).
            ...(image ? { image } : {}),
            ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
            ...(p.unitPrice != null
              ? {
                  offers: {
                    "@type": "Offer",
                    price: p.unitPrice.toFixed(2),
                    priceCurrency: "USD",
                    availability: "https://schema.org/InStock",
                  },
                }
              : {}),
          },
        };
      }),
    },
  };
}

// ─── Category Metadata helper ────────────────────────────────────────

export function categoryMetadata(category: string, productCount: number): Metadata {
  const title = `${category} — Live Menu`;
  const description = `${productCount} ${category.toLowerCase()} SKUs in stock at ${STORE.name} in ${STORE.address.city}, WA. Curated Washington-state producers, real-time prices, cash-only pickup, 21+.`;
  return {
    title,
    description,
    alternates: { canonical: `/menu#${category.toLowerCase().replace(/\s+/g, "-")}` },
    openGraph: {
      title: `${category} | ${STORE.name}`,
      description,
      url: `${STORE.website}/menu#${category.toLowerCase().replace(/\s+/g, "-")}`,
      type: "website",
    },
  };
}
