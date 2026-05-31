import "server-only";
import { getClient, type MenuProduct } from "./db";
import { withFloorFallback } from "./inventory-floor";

// Vendor-aware product preview for the /deals/[id] deep page.
//
// The existing `getCategoryPreviewProducts(deal.appliesTo)` filters by
// CATEGORY (e.g. "flower"). Most deals are category-scoped, but daily-deal
// seeds like "Saturday: 50% off Slab Mechanix" are vendor-scoped — the
// deal's `appliesTo` is still "flower" but the customer expects to see
// Slab Mechanix products specifically, not random flower.
//
// `lib/deal-vendor-match.ts` already maps deal name + description to a
// canonical vendor (e.g. "slab mechanix" token → Agro Couture entry).
// This helper takes that vendor's display name + tokens and returns the
// matching live in-stock SKUs so the deal page can render a real product
// grid filtered to that vendor's brand.
//
// Filter strategy: ILIKE %token% across `products.brand` for any of the
// vendor's tokens. We use `brand` (the human-readable brand string carried
// on each product) rather than `vendor_id` because vendor_id-to-brand
// mapping has historical drift (multiple producer LLCs under one consumer
// brand, brand renames, etc.). Brand-string ILIKE is the same matching
// strategy `getCategoryPreviewProducts` uses for category — symmetric.
//
// Returns up to `limit` MenuProduct rows sorted by `updated_at DESC` so
// the freshest-on-shelf SKUs surface first. Returns [] if no tokens match.
//
// Sister-port: byte-identical to seattle-cannabis-web/lib/vendor-deal-products.ts.

export async function getVendorPreviewProducts(
  brandTokens: readonly string[],
  limit = 6,
): Promise<MenuProduct[]> {
  if (!brandTokens || brandTokens.length === 0) return [];
  const sql = getClient();
  // Build the ILIKE OR-clause as a single pattern array; pass to the SQL
  // template via parameterized array so Neon serverless escapes properly.
  // Each token gets a `%token%` pattern.
  const patterns = brandTokens.map((t) => `%${t}%`);
  // Two-bucket inventory: floor-only — customer-facing deal preview.
  const rows = await withFloorFallback(
    () => sql`
      WITH latest_inv AS (
        SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::numeric AS qty
        FROM inventory_snapshots
        -- SAFE-FLOOR-ONLY: customer-facing deal preview reads on-hand from sales floor only
        WHERE stock_zone = 'floor'
        ORDER BY product_id, captured_at DESC
      ),
      brands_with_recent_sales AS (
        SELECT DISTINCT p.vendor_id
        FROM sale_line_items sli
        INNER JOIN products p ON p.id = sli.product_id
        WHERE sli.sold_at >= NOW() - INTERVAL '365 days'
          AND p.vendor_id IS NOT NULL
      )
      SELECT p.id, p.name, p.brand, p.category, p.strain_type,
        p.thc_pct::float AS thc_pct, p.cbd_pct::float AS cbd_pct,
        p.unit_price::float AS unit_price, p.image_url, p.effects, p.terpenes,
        COALESCE(p.is_doh_compliant, FALSE) AS is_doh_compliant
      FROM products p
      INNER JOIN latest_inv li ON li.product_id = p.id
      INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
      WHERE p.carry_status = 'active'
        AND p.unit_price IS NOT NULL AND p.unit_price > 0
        AND p.image_url IS NOT NULL
        AND p.brand ILIKE ANY(${patterns}::text[])
        AND li.qty > 0
      ORDER BY p.updated_at DESC
      LIMIT ${limit}
    `,
    () => sql`
      WITH latest_inv AS (
        SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::numeric AS qty
        FROM inventory_snapshots
        ORDER BY product_id, captured_at DESC
      ),
      brands_with_recent_sales AS (
        SELECT DISTINCT p.vendor_id
        FROM sale_line_items sli
        INNER JOIN products p ON p.id = sli.product_id
        WHERE sli.sold_at >= NOW() - INTERVAL '365 days'
          AND p.vendor_id IS NOT NULL
      )
      SELECT p.id, p.name, p.brand, p.category, p.strain_type,
        p.thc_pct::float AS thc_pct, p.cbd_pct::float AS cbd_pct,
        p.unit_price::float AS unit_price, p.image_url, p.effects, p.terpenes,
        COALESCE(p.is_doh_compliant, FALSE) AS is_doh_compliant
      FROM products p
      INNER JOIN latest_inv li ON li.product_id = p.id
      INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
      WHERE p.carry_status = 'active'
        AND p.unit_price IS NOT NULL AND p.unit_price > 0
        AND p.image_url IS NOT NULL
        AND p.brand ILIKE ANY(${patterns}::text[])
        AND li.qty > 0
      ORDER BY p.updated_at DESC
      LIMIT ${limit}
    `,
  );
  return (rows as Array<Record<string, unknown>>).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    brand: (r.brand ?? null) as string | null,
    category: (r.category ?? null) as string | null,
    strainType: (r.strain_type ?? null) as string | null,
    thcPct: (r.thc_pct ?? null) as number | null,
    cbdPct: (r.cbd_pct ?? null) as number | null,
    unitPrice: (r.unit_price ?? null) as number | null,
    imageUrl: (r.image_url ?? null) as string | null,
    effects: (r.effects ?? null) as string | null,
    terpenes: (r.terpenes ?? null) as string | null,
    isNew: false,
    isDohCompliant: Boolean(r.is_doh_compliant),
  }));
}
