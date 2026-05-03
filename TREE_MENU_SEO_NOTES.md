# Tree-menu SEO notes — for the parallel design agent

Captured 2026-05-03 by `claude-ai-search-seo-phase2` while shipping greenlife-web v3.42 / seattle-cannabis-web v3.34 (Phase-2 SEO: AI search engines).

The "in-dev tree menu" Doug mentioned is the native, server-rendered menu structure currently living in `app/order/` (`OrderMenu.tsx` with the 12-bucket category tree, strain-type tabs, price-tier + THC-range pills, On-Sale chips). When/if it cuts over to replace `/menu` (currently the iHeartJane Boost embed), it becomes the highest-leverage AI-citation surface in the entire site — every product becomes a Product schema entity AI engines can quote by name and price.

This file is the SEO contract for that surface. The design agent shouldn't reinvent any of this; import from `@/lib/seo-templates` and `@/lib/breadcrumb-jsonld` and the schema is correct by construction.

## What schema each level needs

### Tree-menu root (e.g. `/order`, eventual `/menu` cutover)

```tsx
import { CategoryJsonLd } from "@/lib/seo-templates";
import { breadcrumbJsonLd, HOME_CRUMB } from "@/lib/breadcrumb-jsonld";

const breadcrumb = breadcrumbJsonLd([HOME_CRUMB, { name: "Menu", url: "/order" }]);

// One Menu/ItemList schema wrapping the tree
const menuSchema = {
  "@context": "https://schema.org",
  "@type": "Menu",
  name: `Live Cannabis Menu — ${STORE.name}`,
  hasMenuSection: CATEGORIES.map((c) => ({
    "@type": "MenuSection",
    name: c,
    url: `${STORE.website}/order#${c.toLowerCase().replace(/\s+/g, "-")}`,
    numberOfItems: groupedProducts[c]?.length ?? 0,
  })),
};
```

Place stable anchor IDs on category sections (`<section id="flower">`) so AI engines can deep-link to a category and humans can share filtered URLs.

### Category section (each `<section>` inside the tree)

Wrap each category section in a `CategoryJsonLd` from `@/lib/seo-templates`:

```tsx
<CategoryJsonLd
  category="Flower"
  products={flowerProducts}
  url="/order#flower"
/>
```

This emits a `CollectionPage` + `ItemList` schema with each product as a `ListItem`. AI engines treat this as "all the flower SKUs `${STORE.name}` carries" rather than a marketing splash.

### Each product card

Wrap each product card with `<ProductJsonLd product={p} />`:

```tsx
import { ProductJsonLd } from "@/lib/seo-templates";

{products.map((p) => (
  <article key={p.id}>
    <ProductJsonLd product={p} />
    <YourCardDesign product={p} />
  </article>
))}
```

This emits a Product + Offer schema for the SKU. **Critical for AI citation** — without it, AI engines see a generic card `<div>` and can't quote the price or THC%.

### Product detail page (when the design agent ships `/menu/[id]` or `/order/[id]`)

Use `productMetadata()` for `generateMetadata`, and `<ProductJsonLd>` in the page body. Add a breadcrumb:

```tsx
import { ProductJsonLd, productMetadata } from "@/lib/seo-templates";
import { breadcrumbJsonLd, HOME_CRUMB } from "@/lib/breadcrumb-jsonld";

export async function generateMetadata({ params }) {
  const product = await getProductById((await params).id);
  return productMetadata(product);
}

export default async function ProductPage({ params }) {
  const product = await getProductById((await params).id);
  const breadcrumb = breadcrumbJsonLd([
    HOME_CRUMB,
    { name: "Menu", url: "/order" },
    { name: product.category ?? "Cannabis", url: `/order#${(product.category ?? "").toLowerCase().replace(/\s+/g, "-")}` },
    { name: product.name, url: `/menu/${product.id}` },
  ]);

  return (
    <>
      <ProductJsonLd product={product} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <YourDesign product={product} />
    </>
  );
}
```

## AI-search lead paragraph rule

Every redesigned page (homepage, /menu/, /order/, product detail, category landing) should open with a factual prose lead paragraph that directly answers what an AI prompt about that page would ask. **First visible sentence** (not just metadata) should answer it.

Examples:
- **Homepage:** "Green Life Cannabis is a cannabis dispensary in Wenatchee, WA, founded 2014. Open daily 8 AM, later Fri & Sat. Located at 3012 Center Road. Cash only, 21+."
- **Tree-menu root:** "Live cannabis menu at Green Life Cannabis — flower, pre-rolls, vapes, concentrates, edibles, tinctures, and topicals from 100+ Washington-state producers. Real-time prices, pickup-only, cash at the counter."
- **Category landing:** "Flower at Green Life Cannabis — N SKUs in stock from Washington-state producers. Filter by strain type, THC%, or price."
- **Product detail:** "{Brand} {Product Name} — {Category}, {strain type}, {thc}% THC, ${price}. Available for pickup at Green Life Cannabis in Wenatchee, WA."

The tightening rule: the AI prompt the user is asking should be answerable from the FIRST paragraph alone. Elaboration follows.

## Hard rules

1. **No fake reviews.** Don't emit `aggregateRating` unless we have real review data backing it. Fake ratings trigger Google manual action and break trust with AI engines.
2. **No medical claims.** WAC 314-55-077 forbids efficacy claims. `effects` and `terpenes` from the DB are okay as factual data points, NOT as "this strain helps with insomnia" copy.
3. **Cash-only declared.** `acceptedPaymentMethod: "Cash"` belongs in every Offer. AI engines will inadvertently claim "credit accepted" if not declared.
4. **No-returns declared.** `hasMerchantReturnPolicy: "MerchantReturnNotPermitted"` per WSLCB. Don't omit.
5. **Pickup-only.** Cannabis cannot be shipped or delivered from a licensed retailer per WAC 314-55-079. `availableDeliveryMethod: "DeliveryModePickUp"` always.

## Where the schema lives

| Concern | File | Export |
|---|---|---|
| Product schema for one SKU | `lib/seo-templates.tsx` | `ProductJsonLd` |
| Product page metadata | `lib/seo-templates.tsx` | `productMetadata()` |
| Category schema | `lib/seo-templates.tsx` | `CategoryJsonLd` |
| Category page metadata | `lib/seo-templates.tsx` | `categoryMetadata()` |
| Breadcrumb schema | `lib/breadcrumb-jsonld.ts` | `breadcrumbJsonLd()`, `HOME_CRUMB` |
| Site-wide LocalBusiness/Organization | `app/layout.tsx` | already wired |
| Long-form AI reference | `app/llms-full.txt/route.ts` | already shipping |
| Short AI index | `app/llms.txt/route.ts` | already shipping |

## Companion files in seattle-cannabis-web

Same files, identical APIs, different STORE constant per repo. Keep both in sync — when we add a new schema export to one, mirror to the other in the same push.

## Testing the schema

Use Google's Rich Results Test on a deployed URL: https://search.google.com/test/rich-results — paste a product URL and verify the Product / Offer / BreadcrumbList all parse.

For AI engines specifically, curl `/llms.txt` and `/llms-full.txt` and verify the markdown reads cleanly. ChatGPT browse + Claude search will follow these when answering questions about the brand.

## Open questions for Doug (NOT shipped this pass)

1. Do we have real review data to power `aggregateRating` per product? (POS has a Google Review Reminder system — but per-SKU ratings probably don't exist yet.)
2. Does the design agent's product detail route land at `/menu/[id]` or `/order/[id]`? `productUrl()` currently assumes `/menu/[id]` for the canonical — easy to flip.
3. Does the tree-menu cutover replace `/menu` (Boost) or live alongside it? The brief says `/menu` stays Boost (per `feedback_keep_menu_route`); confirm before designing the cutover URL strategy.
