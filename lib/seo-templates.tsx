import type { Metadata } from "next";
import { STORE } from "@/lib/store";
import type { MenuProduct } from "@/lib/db";

// ─────────────────────────────────────────────────────────────────────
// Drop-in SEO + schema templates for the parallel design agent.
//
// Each export is self-contained — pass in a product or category and get
// back a <script> tag (JSON-LD) or a Next Metadata object. Don't
// re-implement schema in product / category / tree-menu design files;
// import from here. Single source of truth keeps the SEO contract
// consistent across the design agent's redesign and any future tree-
// menu cutover.
//
// Usage on a product detail page:
//
//   import { ProductJsonLd, productMetadata } from "@/lib/seo-templates";
//
//   export async function generateMetadata({ params }) {
//     const product = await getProductById((await params).id);
//     return productMetadata(product);
//   }
//
//   export default async function ProductPage({ params }) {
//     const product = await getProductById((await params).id);
//     return (
//       <>
//         <ProductJsonLd product={product} />
//         <YourDesign product={product} />
//       </>
//     );
//   }
//
// Compliance posture: WAC 314-55-077 forbids medical claims. WAC
// 314-55-155 governs advertising. This file emits factual product
// metadata (price, THC%, brand, strain type) — not efficacy claims.
// hasMerchantReturnPolicy is "no returns" because cannabis cannot be
// returned per WAC 314-55-079. Don't add reviews / ratings unless
// real data exists; fake aggregateRating triggers Google manual action.
// ─────────────────────────────────────────────────────────────────────

const ORG_ID = `${STORE.website}/#dispensary`;

function productSlug(p: MenuProduct): string {
  return p.id;
}

function productUrl(p: MenuProduct): string {
  // Convention: when the design agent ships a product detail route,
  // both /menu/[id] and /order/[id] should resolve to the canonical
  // detail page. Pass through @id so AI engines see one entity even
  // if multiple URLs render it.
  return `${STORE.website}/menu/${productSlug(p)}`;
}

function productImage(p: MenuProduct): string {
  if (p.imageUrl) return p.imageUrl.startsWith("http") ? p.imageUrl : `${STORE.website}${p.imageUrl}`;
  // Fallback to the auto-generated card if image is null. /api/product-image
  // is the existing on-domain renderer.
  return `${STORE.website}/api/product-image?id=${encodeURIComponent(p.id)}`;
}

// ─── Product JSON-LD ─────────────────────────────────────────────────
//
// Emits a Product + Offer schema for a single SKU. Designed for AI
// engines (Claude / Perplexity / ChatGPT) to cite SKU-level facts when
// answering "best CBD tincture in Wenatchee" or "Avitas live resin
// price." All optional fields gracefully omit when source data is null.

type ProductJsonLdProps = { product: MenuProduct };

export function ProductJsonLd({ product: p }: ProductJsonLdProps) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": productUrl(p),
    name: p.name,
    sku: p.id,
    url: productUrl(p),
    image: productImage(p),
    category: p.category ?? "Cannabis",
  };

  if (p.brand) {
    schema.brand = { "@type": "Brand", name: p.brand };
  }

  // Description — factual, no efficacy claims. Strain type + THC/CBD
  // numeric facts. Skip terpenes/effects unless we have them, since
  // dropping a generic line ("relaxing, body-heavy") would be a soft
  // medical claim under WAC 314-55-077.
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
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

  return {
    title,
    description,
    alternates: { canonical: `/menu/${productSlug(product)}` },
    openGraph: {
      title,
      description,
      url: productUrl(product),
      type: "website",
      images: [{ url: productImage(product), alt: product.name }],
    },
  };
}

// ─── Category JSON-LD ────────────────────────────────────────────────
//
// CollectionPage + ItemList schema for a category landing
// (/menu#flower, /order?category=Flower, or whatever URL the tree menu
// settles on). Lets AI engines understand the page is "all the flower
// SKUs ${STORE.name} carries" rather than a marketing splash.

type CategoryJsonLdProps = {
  category: string;
  products: MenuProduct[];
  url: string; // canonical URL of the category landing
};

export function CategoryJsonLd({ category, products, url }: CategoryJsonLdProps) {
  const absoluteUrl = url.startsWith("http") ? url : `${STORE.website}${url}`;
  const schema = {
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
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          "@id": productUrl(p),
          name: p.name,
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
      })),
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
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
