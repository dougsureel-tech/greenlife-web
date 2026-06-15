// Product + Offer JSON-LD for /brands/[slug] — Google Merchant-listing
// validity hardening (GSC "Merchant listing structured data issues") +
// WSLCB defense-in-depth on the Product `description`.
//
// WHY this exists (2026-06-15, sister-port of seattle-cannabis-web v34.726):
//   The /brands/[slug] page emitted one Product per in-stock SKU. Google
//   Search Console's Merchant-listings report (raised on the SCC sister)
//   flagged defects on the emitted `offers`. GLW carried TWO of them:
//     1. `availableAtOrFrom` is a legacy GoodRelations property NOT in
//        Google's Offer spec — reported as an unrecognized field. Replaced
//        with the spec-valid `availableDeliveryMethod` = OnSitePickup (we
//        are pickup-only; cannabis can't ship), which truthfully models the
//        in-store-only fulfillment.
//     2. The Product `description` was sourced RAW from the Dutchie
//        `effects` free-text, which can carry WSLCB-banned efficacy
//        language — now scrubbed (see WSLCB note below).
//   (GLW's `offers.url` was already absolute — `${STORE.website}/menu` — so
//   the SCC "relative offers.url" defect did NOT apply here. The helper
//   still resolves an absolute `menuUrl` so the two stores stay identical.)
//
// DELIBERATELY NOT ADDED — `shippingDetails` / `hasMerchantReturnPolicy`:
//   Those are Google *Merchant Center / Shopping* fields. Cannabis is
//   PROHIBITED from Google Shopping + Merchant Center, and we do NOT ship
//   (pickup only, in-store cash). Emitting shipping/return markup would be
//   false (implies we ship) and chases an eligibility lane closed to
//   cannabis. The goal is a VALID, warning-free general Product rich result
//   — not Merchant Center eligibility. Their absence is correct, not a gap.
//
// DELIBERATELY NOT ADDED — `aggregateRating` / `review`:
//   No per-product UGC review intake exists; fabricated review schema is a
//   Google manual-action risk. Omit.
//
// WSLCB (WAC 314-55-155): the Product `description` is sourced from the
//   Dutchie `effects` free-text field, which can carry efficacy language
//   ("relieves", "helps with", etc.). We scrub it through the shared
//   `scrubWslcbClaims` banned-phrase filter (same one the strain Product
//   builder uses) — empty beats non-compliant; a scrubbed-empty description
//   is OMITTED rather than emitted blank.
//
// Sister-mirror: seattle-cannabis-web/lib/brand-product-json-ld.ts — keep in sync.

import { scrubWslcbClaims } from "./strain-product-json-ld.ts";

/** Minimal product shape this builder needs — a structural subset of the
 *  `getBrandProducts` row so the helper stays decoupled from the DB type. */
export interface BrandProductForLd {
  id: number | string;
  name: string;
  category?: string | null;
  image_url?: string | null;
  effects?: string | null;
  unit_price: number | null;
  thc_pct?: number | null;
  cbd_pct?: number | null;
  strain_type?: string | null;
}

export interface BuildBrandProductLdArgs {
  product: BrandProductForLd;
  brandUrl: string;
  displayName: string;
  /** Absolute store origin, e.g. "https://www.greenlifecannabis.com". */
  storeWebsite: string;
  /** Absolute menu URL the offer points at (where the SKU is purchasable). */
  menuUrl: string;
  /** Fallback image when the product has no image_url. */
  fallbackImage: string;
  /** `@id` of the dispensary LocalBusiness node (the seller). */
  dispensaryId: string;
}

/**
 * Build one Merchant-listing-valid Product JSON-LD node for a brand SKU.
 * Pure function. Returns null when the product has no positive price
 * (an offer with no price is the #1 Merchant-listing error — omit instead).
 */
export function buildBrandProductLd(
  args: BuildBrandProductLdArgs,
): Record<string, unknown> | null {
  const { product: p, brandUrl, displayName, menuUrl, fallbackImage, dispensaryId } = args;

  // No price → no valid Offer → omit the whole Product (don't emit an
  // offer-less or price-less Product, which Google flags).
  if (p.unit_price == null || !(p.unit_price > 0)) return null;

  // WSLCB scrub on the Dutchie effects free-text before it becomes a
  // structured-data description. Omit when it scrubs empty.
  const description = scrubWslcbClaims(p.effects);

  const additionalProperty: Array<{ "@type": "PropertyValue"; name: string; value: string }> = [];
  if (p.thc_pct != null) {
    additionalProperty.push({ "@type": "PropertyValue", name: "THC", value: `${p.thc_pct.toFixed(1)}%` });
  }
  if (p.cbd_pct != null && p.cbd_pct > 0) {
    additionalProperty.push({ "@type": "PropertyValue", name: "CBD", value: `${p.cbd_pct.toFixed(1)}%` });
  }
  if (p.strain_type) {
    additionalProperty.push({ "@type": "PropertyValue", name: "Strain Type", value: p.strain_type });
  }

  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${brandUrl}#product-${p.id}`,
    name: p.name,
    brand: { "@type": "Brand", name: displayName },
    image: p.image_url || fallbackImage,
    offers: {
      "@type": "Offer",
      price: p.unit_price.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      // Spec-valid replacement for the legacy `availableAtOrFrom`. We are
      // in-store pickup only (cannabis can't ship) — model that truthfully.
      availableDeliveryMethod: "https://schema.org/OnSitePickup",
      seller: { "@id": dispensaryId },
      // ABSOLUTE menu url (GLW was already absolute; kept absolute here).
      url: menuUrl,
    },
  };

  if (p.category) node.category = p.category;
  if (description) node.description = description;
  if (additionalProperty.length > 0) node.additionalProperty = additionalProperty;

  return node;
}
