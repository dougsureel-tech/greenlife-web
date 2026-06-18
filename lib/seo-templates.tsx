import type { MenuProduct } from "@/lib/db";
import {
  buildProductSchema,
  buildCategorySchema,
  type CategoryJsonLdProps,
} from "@/lib/seo-templates-builders";
import { safeJsonLd } from "@/lib/json-ld-safe";

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
// Compliance posture: WAC 314-55-155 governs advertising — including the
// prohibition on medical/health/efficacy claims and false-or-misleading
// statements. This file emits factual product metadata (price, THC%,
// brand, strain type) — not efficacy claims. hasMerchantReturnPolicy is
// "no returns" because cannabis cannot be returned per WAC 314-55-079.
// Don't add reviews / ratings unless real data exists; fake aggregateRating
// triggers Google manual action.
//
// Schema-building logic lives in `seo-templates-builders.ts` (a `.ts`
// peer file) so the node:test runner can load it without a JSX transform
// — see pin tests at `__tests__/seo-templates.test.ts`.
// ─────────────────────────────────────────────────────────────────────

// Re-export the pure helpers + metadata builders so existing call sites
// (`import { productMetadata, categoryMetadata } from "@/lib/seo-templates"`)
// continue to work without changing their import path.
export {
  productImage,
  productMetadata,
  categoryMetadata,
  buildProductSchema,
  buildCategorySchema,
} from "@/lib/seo-templates-builders";
export type { CategoryJsonLdProps } from "@/lib/seo-templates-builders";

// ─── Product JSON-LD ─────────────────────────────────────────────────

type ProductJsonLdProps = { product: MenuProduct };

export function ProductJsonLd({ product: p }: ProductJsonLdProps) {
  const schema = buildProductSchema(p);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

// ─── Category JSON-LD ────────────────────────────────────────────────

export function CategoryJsonLd(props: CategoryJsonLdProps) {
  const schema = buildCategorySchema(props);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}
