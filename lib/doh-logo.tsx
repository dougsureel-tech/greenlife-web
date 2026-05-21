// WA DOH product-compliance logo helper per WAC 246-70-040.
//
// Three official categories shipped at /public/doh-logos/:
//   - high-thc.jpg → DOH-flagged + product type matches /capsule|tablet|tincture|patch|suppositor/
//     per WAC's 5-specific-types rule (10-50mg active THC per serving)
//   - high-cbd.jpg → DOH-flagged + CBD-dominant + non-smokeable (excludes flower + pre-rolls per WAC)
//   - general-use.jpg → everything else (the catch-all per DOH framework — applies to
//     DOH-flagged products that don't meet High THC/High CBD criteria AND to all
//     recreational products)
//
// Files fetched from official WA DOH page 2026-05-20:
//   https://doh.wa.gov/you-and-your-family/cannabis/medical-cannabis/product-compliance
//
// Originally inlined in app/order/OrderMenu.tsx (v29.185 + glw v37.825).
// Extracted to this shared lib so the same discrimination renders consistently
// across /menu-preview + /menu + /order + /brands/[slug] + /deals + homepage —
// every surface that renders a product card with a price.
//
// **Why every product card needs it:** WAC 314-55-155 requires the WA-DOH
// General Use mark on cannabis advertising. Product cards displaying SKUs
// + prices ARE advertising. Skipping the logo on /brands or /deals while
// showing it on /menu would be an inconsistent compliance posture.

import Image from "next/image";

type DohProductFields = {
  isDohCompliant?: boolean | null;
  thcPct?: number | null;
  cbdPct?: number | null;
  category?: string | null;
};

type DohLogoSpec = {
  src: string;
  label: string;
  description: string;
};

export function pickDohLogo(p: DohProductFields): DohLogoSpec {
  const cat = (p.category ?? "").toLowerCase();
  const thc = p.thcPct ?? 0;
  const cbd = p.cbdPct ?? 0;
  const isDoh = p.isDohCompliant === true || /^DOH\s+/i.test(p.category ?? "");
  // High THC: 5 specific product types only per WAC 246-70-040
  const isHighThcEligibleCategory = /capsule|tablet|tincture|patch|suppositor/.test(cat);
  if (isDoh && isHighThcEligibleCategory) {
    return {
      src: "/doh-logos/high-thc.jpg",
      label: "WA DOH High THC compliant",
      description: "Medical product with 10-50mg active THC per serving (WAC 246-70).",
    };
  }
  // High CBD: CBD-dominant + non-smokeable
  const isSmokeable = /flower|pre[-_\s]?roll/.test(cat);
  if (isDoh && cbd > thc && !isSmokeable) {
    return {
      src: "/doh-logos/high-cbd.jpg",
      label: "WA DOH High CBD compliant",
      description: "Medical CBD-dominant product (WAC 246-70).",
    };
  }
  // General Use: DOH framework's catch-all
  return {
    src: "/doh-logos/general-use.jpg",
    label: "WA DOH General Use",
    description: "Any cannabis product allowed by the WSLCB (WAC 246-70).",
  };
}

/**
 * Small inline DOH compliance logo for product cards. Default 5×5
 * (h-5 w-5) which fits next to a $X.XX price. Pass `size="sm"` for
 * a 4×4 variant when card real-estate is tight (brand-page grid).
 *
 * `unoptimized` because these are tiny external-source JPGs and we don't
 * want Vercel image-CDN charges on every product render — the assets are
 * already optimized at the source.
 */
export function DohLogo({
  product,
  size = "md",
  className = "",
}: {
  product: DohProductFields;
  size?: "sm" | "md";
  className?: string;
}) {
  const spec = pickDohLogo(product);
  const dim = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <Image
      src={spec.src}
      alt={spec.label}
      title={`${spec.label} — ${spec.description}`}
      width={32}
      height={32}
      className={`${dim} object-contain opacity-80 ${className}`}
      unoptimized
    />
  );
}
