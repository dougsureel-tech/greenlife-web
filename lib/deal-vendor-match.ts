// Deal → vendor matching for the /deals card art.
//
// Deals in our DB are category-scoped, not vendor-scoped, so we infer the
// vendor from the deal's name + description by matching against keywords
// drawn from each dialed-in vendor's catalog. When a deal matches, we
// upgrade its card art from the generic category bucket to the vendor's
// own bud-photo hero + brand-color gradient + logo card overlay — same
// visual language as the dialed-in /brands/[slug] pages.
//
// Hero + logo URLs come straight from each brand's own CDN per the
// `feedback_vendor_logo_sources.md` rule (never Weedmaps / Leafly
// aggregators). When a vendor's hero is unavailable, the heroUrl is null
// and DealArt falls back to a brand-color gradient with a stylized SVG.

export type DealVendorMatch = {
  /** Slug under /brands/[slug] — the click target for the "Dialed-in vendor" pill. */
  slug: string;
  /** Display name for the brand pill / logo alt. */
  displayName: string;
  /** Brand logo URL (the brand's own CDN). May be null if logo lives on the brand-page only. */
  logoUrl: string | null;
  /** Hero/bud photo URL (the brand's own CDN). May be null — DealArt falls back to gradient art. */
  heroUrl: string | null;
  /** Hero gradient color in hex (no #). Picks the surrounding card glow + the gradient overlay tint. */
  accentHex: string;
  /** Hex for the secondary tint in the gradient. Picked so accentHex → accent2Hex reads as "into the dark". */
  accent2Hex: string;
};

// Each entry: a list of lowercase substring tokens we look for in deal
// name/description. The first matched token wins (order matters within
// VENDORS so more-specific tokens trump generic ones).
type VendorEntry = DealVendorMatch & { tokens: readonly string[] };

const VENDORS: readonly VendorEntry[] = [
  {
    slug: "northwest-cannabis-solutions",
    displayName: "NWCS",
    tokens: ["nwcs", "northwest cannabis solutions", "ec3", "ez vape", "crystal clear"] as const,
    logoUrl: "https://www.nwcs425.com/assets/images/logo.svg",
    heroUrl: "https://www.nwcs425.com/files/image/5cb6061020a71/display/nwcs-callout-wide.jpg",
    accentHex: "1f3a2b",
    accent2Hex: "0e1f17",
  },
  {
    slug: "grow-op-farms",
    displayName: "Phat Panda",
    tokens: ["phat panda", "grow-op", "grow op farms", "panda"] as const,
    logoUrl: "https://phatpanda.com/wp-content/uploads/2022/03/PP_Logo_Pink.png",
    heroUrl: "https://phatpanda.com/wp-content/uploads/2022/03/Phat-Panda-Hero.jpg",
    accentHex: "1a1a1a",
    accent2Hex: "2a0f1a",
  },
  {
    slug: "sungrown",
    displayName: "Sungrown",
    tokens: ["leafwerx", "solr bear", "sungrown", "sun grown", "full spec", "ric flair drip"] as const,
    logoUrl:
      "https://images.squarespace-cdn.com/content/v1/6324f08f683d85480842c6e5/2ca3c3ac-91ce-4b24-8519-52f8b6f87d59/Sungrown+Logo+Inverted+RGB+1687px%40300ppi.png",
    heroUrl: null,
    accentHex: "c47a1f",
    accent2Hex: "5e3a0e",
  },
  {
    slug: "spark-industries",
    displayName: "Plaid Jacket",
    tokens: ["plaid jacket", "spark industries", "flip side"] as const,
    logoUrl: null,
    heroUrl: null,
    accentHex: "1e3a4d",
    accent2Hex: "162a38",
  },
  {
    slug: "2727",
    displayName: "2727",
    tokens: ["2727"] as const,
    logoUrl: "https://2727life.com/wp-content/uploads/2024/08/Logo-01-147x147.png",
    heroUrl: "https://2727life.com/wp-content/uploads/2024/08/flower-8-1024x648.png",
    accentHex: "7a3b2e",
    accent2Hex: "5a2820",
  },
  {
    slug: "fairwinds-manufacturing",
    displayName: "Fairwinds",
    tokens: ["fairwinds", "fair winds"] as const,
    logoUrl: null,
    // Fairwinds re-sourced 2026-05-09 — they redesigned site 2024-06.
    // Sister of brand-page fix (glw v12.105 + scc v12.805).
    heroUrl:
      "https://fairwindscannabis.com/wp-content/uploads/2024/06/FW_FECO_1-1_500-e1738271256901.jpg",
    accentHex: "0e7c8a",
    accent2Hex: "0a4f5a",
  },
  {
    slug: "redbird-cannabis",
    displayName: "Redbird",
    tokens: ["redbird", "red bird"] as const,
    logoUrl: null,
    heroUrl:
      "https://images.squarespace-cdn.com/content/v1/6511d95f3eb1ba362c729a4c/1695677008965-QQJ62AWX6BZVWMYG9VXX/Tropicana-Garlic-6.jpg",
    accentHex: "8b1f1f",
    accent2Hex: "521010",
  },
  {
    slug: "agro-couture",
    displayName: "Agro Couture",
    tokens: ["agro couture", "slab mechanix"] as const,
    logoUrl: null,
    heroUrl: "https://agrocouture.com/wp-content/uploads/2024/03/tacoma-grown.jpg",
    accentHex: "1f4a2a",
    accent2Hex: "0f2a17",
  },
  {
    slug: "dewey-cannabis-co",
    displayName: "Dewey",
    tokens: ["dewey"] as const,
    logoUrl: null,
    heroUrl:
      "https://images.squarespace-cdn.com/content/v1/66033d9365686e323e42be53/1711488404624-VJQCHSAIH33IURTG2OZ2/Screenshot+2024-03-26+at+2.41.23%E2%80%AFPM.jpg",
    accentHex: "2c5d3a",
    accent2Hex: "163020",
  },
  {
    slug: "fifty-fold",
    displayName: "Fifty Fold",
    tokens: ["fifty fold", "fifty-fold", "50 fold"] as const,
    logoUrl: null,
    heroUrl: null,
    accentHex: "44321a",
    accent2Hex: "1f1810",
  },
  {
    slug: "minglewood-brands",
    displayName: "Minglewood",
    tokens: ["minglewood", "clout king"] as const,
    logoUrl: "https://static.wixstatic.com/media/faeb55_64037de49aca4d4394f7c7eece094e15~mv2.png",
    heroUrl: null,
    accentHex: "1f1a3a",
    accent2Hex: "0f0a20",
  },
  {
    slug: "green-revolution",
    displayName: "Green Revolution",
    tokens: ["green revolution", "doozies", "wildside"] as const,
    logoUrl: null,
    heroUrl:
      "https://greenrevolution.com/wp-content/uploads/2023/12/doozies-newsletter.jpg",
    accentHex: "1a5d3a",
    accent2Hex: "0a3020",
  },
  {
    slug: "seattle-bubble-works",
    displayName: "Seattle Bubble Works",
    tokens: ["seattle bubble", "bubble works", "sbw"] as const,
    logoUrl: null,
    heroUrl: null,
    accentHex: "1f4a6e",
    accent2Hex: "0f2540",
  },
  {
    slug: "mfused",
    displayName: "Mfused",
    tokens: ["mfused", "m-fused", "super fog"] as const,
    // MFUSED re-sourced 2026-05-09 — Squarespace CDN account migrated.
    // Sister of brand-page fix (glw v12.105 + scc v12.805).
    logoUrl:
      "https://images.squarespace-cdn.com/content/v1/65982e5124b1b60fe9b2d332/024d7af8-d7c9-4063-9864-b4466977e9ee/mfused-web-logo.png",
    heroUrl:
      "https://images.squarespace-cdn.com/content/v1/65982e5124b1b60fe9b2d332/c5446a33-288e-4a56-a2d2-5cf2534b64cf/hero-bg.png",
    accentHex: "0a2540",
    accent2Hex: "061830",
  },
  {
    slug: "bondi-farms",
    displayName: "Bondi Farms",
    tokens: ["bondi"] as const,
    logoUrl: null,
    heroUrl: null,
    accentHex: "1f5a8a",
    accent2Hex: "0e2e4a",
  },
  {
    slug: "oowee",
    displayName: "OOWEE",
    tokens: ["oowee", "ooowee"] as const,
    logoUrl: null,
    heroUrl: null,
    accentHex: "5a2a8a",
    accent2Hex: "2e144a",
  },
  // Daily-deal seed brands without dialed-in pages yet — match for
  // logo-only display so a Saturday Smokiez deal still shows the brand.
  {
    slug: "smokiez",
    displayName: "Smokiez",
    tokens: ["smokiez"] as const,
    logoUrl: null,
    heroUrl: null,
    accentHex: "8a1f4a",
    accent2Hex: "4a0e26",
  },
  {
    slug: "tahoma-flavors",
    displayName: "Tahoma Flavors",
    tokens: ["tahoma flavors", "tahoma"] as const,
    logoUrl: null,
    heroUrl: null,
    accentHex: "5a3a1f",
    accent2Hex: "2e1d10",
  },
] as const;

/**
 * Match a deal name + description against known vendors.
 *
 * Returns the first matching VENDORS entry (specific tokens listed first
 * within each entry; entries themselves ordered by frequency on our shelves
 * so common matches resolve in O(1) for typical traffic).
 */
export function matchDealVendor(
  name: string | null | undefined,
  description?: string | null,
): DealVendorMatch | null {
  const haystack = `${name ?? ""} ${description ?? ""}`.toLowerCase();
  if (!haystack.trim()) return null;
  for (const v of VENDORS) {
    for (const token of v.tokens) {
      if (haystack.includes(token)) {
        return {
          slug: v.slug,
          displayName: v.displayName,
          logoUrl: v.logoUrl,
          heroUrl: v.heroUrl,
          accentHex: v.accentHex,
          accent2Hex: v.accent2Hex,
        };
      }
    }
  }
  return null;
}
