import "server-only";
import { cache } from "react";
import { cleanBrandName } from "./clean-brand-name";
import { scoreProduct, rankStrainMatches, type ScoredProduct } from "./strain-match";
import type { Strain, LineageGraph } from "./strains";
import { safeProductImageUrl } from "./banned-logo-url";
import { withFloorFallback } from "./inventory-floor";

export type VendorBrand = {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  logoUrl: string | null;
  imageSource: string | null;
  notes: string | null;
  activeSkus: number;
  brandBio: string | null;
  socialInstagram: string | null;
  socialX: string | null;
  socialFacebook: string | null;
};

export function getClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { neon } = require("@neondatabase/serverless");
  return neon(url) as (
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) => Promise<Record<string, unknown>[]>;
}

export type MenuProduct = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  strainType: string | null;
  thcPct: number | null;
  cbdPct: number | null;
  unitPrice: number | null;
  imageUrl: string | null;
  effects: string | null;
  terpenes: string | null;
  /** True when this SKU first appeared in stock within the last 7 days. */
  isNew: boolean;
  /** Producer/COA-confirmed WA DOH-compliant SKU — passed the extra-testing
   *  tier beyond the WSLCB safety panel. DOH-verified medical patients
   *  see tax-exempt pricing on these; everyone else sees rec pricing.
   *  Backed by `products.is_doh_compliant` (inv-app migration 0262). */
  isDohCompliant: boolean;
};

export async function getMenuProducts(): Promise<MenuProduct[]> {
  const sql = getClient();
  // Bug fix 2026-05-04 (round 3): extends the brand-level sales-history
  // gate from getActiveBrands/getBrandBySlug (v3.205) down to product
  // surfaces. A leaked Wenatchee-era brand (e.g. ABS Buds) had stale
  // qty>0 inventory_snapshots in Seattle's Neon, so its products were
  // showing on /shop and /order even though the brand-page index had
  // already been gated. Same fix here: products without their vendor
  // appearing in `brands_with_recent_sales` (≥1 sale_line_items at THIS
  // store in last 365d) are excluded. Each Neon DB only has THAT store's
  // sales (per CLAUDE.md), so this is the cleanest "actually carried
  // here" signal. Tradeoff: a brand-new vendor before first sale would
  // be hidden — acceptable, onboarding-side friction is far less
  // customer-visible than ghost-product listings.
  //
  // Two-bucket inventory (PLAN_TWO_BUCKET_INVENTORY_2026_05_24.md §3.4):
  // `latest_inv` is the customer-facing on-hand read → floor-only. The
  // `first_seen` aggregate inside the SELECT is treated as A (aggregate):
  // a vault arrival counts as "received" for the "🆕 New" badge timing.
  // Wrapped in withFloorFallback for the brief two-store Vercel-build
  // asymmetry window.
  const rows = await withFloorFallback(
    () => sql`
      WITH latest_inv AS (
        SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::numeric AS qty
        FROM inventory_snapshots
        -- SAFE-FLOOR-ONLY: customer menu reads on-hand from sales floor only
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
      SELECT
        p.id, p.name, p.brand, p.category, p.strain_type,
        p.thc_pct::float AS thc_pct, p.cbd_pct::float AS cbd_pct,
        p.unit_price::float AS unit_price, p.image_url, p.effects, p.terpenes,
        COALESCE(fs.first_seen >= NOW() - INTERVAL '7 days', FALSE) AS is_new,
        COALESCE(p.is_doh_compliant, FALSE) AS is_doh_compliant,
        p.menu_ready_at
      FROM products p
      INNER JOIN latest_inv li ON li.product_id = p.id
      INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
      LEFT JOIN (
        SELECT product_id, MIN(captured_at) AS first_seen
        FROM inventory_snapshots
        -- SAFE-AGGREGATE: "first seen" includes vault arrivals (= received here)
        WHERE quantity_on_hand > 0
          AND stock_zone IN ('vault','floor')
        GROUP BY product_id
      ) fs ON fs.product_id = p.id
      WHERE p.carry_status = 'active'
        AND li.qty > 0
        AND p.unit_price IS NOT NULL
        AND p.unit_price >= 1.99
      ORDER BY p.category NULLS LAST, p.brand NULLS LAST, p.name
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
      SELECT
        p.id, p.name, p.brand, p.category, p.strain_type,
        p.thc_pct::float AS thc_pct, p.cbd_pct::float AS cbd_pct,
        p.unit_price::float AS unit_price, p.image_url, p.effects, p.terpenes,
        COALESCE(fs.first_seen >= NOW() - INTERVAL '7 days', FALSE) AS is_new,
        COALESCE(p.is_doh_compliant, FALSE) AS is_doh_compliant,
        p.menu_ready_at
      FROM products p
      INNER JOIN latest_inv li ON li.product_id = p.id
      INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
      LEFT JOIN (
        SELECT product_id, MIN(captured_at) AS first_seen
        FROM inventory_snapshots
        WHERE quantity_on_hand > 0
        GROUP BY product_id
      ) fs ON fs.product_id = p.id
      WHERE p.carry_status = 'active'
        AND li.qty > 0
        AND p.unit_price IS NOT NULL
        AND p.unit_price >= 1.99
      ORDER BY p.category NULLS LAST, p.brand NULLS LAST, p.name
    `,
  );
  // Phase 3b receive-automation menu-readiness gate (deferred from inv-App
  // v410.285 Phase 3a — board-flagged 2026-05-19, shipped here as an
  // env-flag-gated post-filter). The inv-App migration 0281 backfilled every
  // currently-active product to menu_ready_at = NOW(), so flipping the env
  // var ON today removes ZERO products from the customer menu (the gap is
  // only future receives that fail the readiness check). Doug flips
  // MENU_READY_FILTER_ENABLED=true in Vercel env after eyeballing the
  // /admin/menu-readiness-queue surface — the mid-day product-disappearance
  // risk Doug flagged on the board is gated on his greenlight, not on
  // this ship. Default OFF preserves the current customer-facing behavior
  // exactly; flag-OFF code path is identical to the pre-ship query result.
  const filterMenuReady = process.env.MENU_READY_FILTER_ENABLED === "true";
  const filtered = filterMenuReady
    ? rows.filter((r) => r.menu_ready_at !== null)
    : rows;
  return filtered.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    brand: (r.brand ?? null) as string | null,
    category: (r.category ?? null) as string | null,
    strainType: (r.strain_type ?? null) as string | null,
    thcPct: (r.thc_pct ?? null) as number | null,
    cbdPct: (r.cbd_pct ?? null) as number | null,
    unitPrice: (r.unit_price ?? null) as number | null,
    imageUrl: safeProductImageUrl(r.image_url as string | null | undefined),
    effects: (r.effects ?? null) as string | null,
    terpenes: (r.terpenes ?? null) as string | null,
    isNew: Boolean(r.is_new),
    isDohCompliant: Boolean(r.is_doh_compliant),
  }));
}

// Fetch a specific set of product IDs — used by the /stash page to hydrate
// localStorage IDs into full product cards. Returns rows in DB order;
// callers can re-sort to match their input order if needed.
export async function getProductsByIds(ids: string[]): Promise<MenuProduct[]> {
  if (ids.length === 0) return [];
  const sql = getClient();
  // Sister bug-fix to getMenuProducts above. /stash hydrates this from
  // localStorage IDs; same `brands_with_recent_sales` gate so a stash
  // item from a leaked Wenatchee-era brand silently disappears from
  // the customer's stash on Seattle (correct — they couldn't have
  // legitimately stashed it; localStorage was carrying a ghost id).
  // Two-bucket: floor-only on-hand for customer hydration. See
  // PLAN_TWO_BUCKET_INVENTORY_2026_05_24.md §3.4.
  const rows = await withFloorFallback(
    () => sql`
      WITH latest_inv AS (
        SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::numeric AS qty
        FROM inventory_snapshots
        -- SAFE-FLOOR-ONLY: /stash hydration only shows what's grab-and-go
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
      SELECT
        p.id, p.name, p.brand, p.category, p.strain_type,
        p.thc_pct::float AS thc_pct, p.cbd_pct::float AS cbd_pct,
        p.unit_price::float AS unit_price, p.image_url, p.effects, p.terpenes,
        COALESCE(fs.first_seen >= NOW() - INTERVAL '7 days', FALSE) AS is_new,
        COALESCE(p.is_doh_compliant, FALSE) AS is_doh_compliant
      FROM products p
      INNER JOIN latest_inv li ON li.product_id = p.id
      INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
      LEFT JOIN (
        SELECT product_id, MIN(captured_at) AS first_seen
        FROM inventory_snapshots
        -- SAFE-AGGREGATE: first-seen window includes vault arrivals
        WHERE quantity_on_hand > 0
          AND stock_zone IN ('vault','floor')
        GROUP BY product_id
      ) fs ON fs.product_id = p.id
      WHERE p.id = ANY(${ids}::text[])
        AND p.carry_status = 'active'
        AND li.qty > 0
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
      SELECT
        p.id, p.name, p.brand, p.category, p.strain_type,
        p.thc_pct::float AS thc_pct, p.cbd_pct::float AS cbd_pct,
        p.unit_price::float AS unit_price, p.image_url, p.effects, p.terpenes,
        COALESCE(fs.first_seen >= NOW() - INTERVAL '7 days', FALSE) AS is_new,
        COALESCE(p.is_doh_compliant, FALSE) AS is_doh_compliant
      FROM products p
      INNER JOIN latest_inv li ON li.product_id = p.id
      INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
      LEFT JOIN (
        SELECT product_id, MIN(captured_at) AS first_seen
        FROM inventory_snapshots
        WHERE quantity_on_hand > 0
        GROUP BY product_id
      ) fs ON fs.product_id = p.id
      WHERE p.id = ANY(${ids}::text[])
        AND p.carry_status = 'active'
        AND li.qty > 0
    `,
  );
  return rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    brand: (r.brand ?? null) as string | null,
    category: (r.category ?? null) as string | null,
    strainType: (r.strain_type ?? null) as string | null,
    thcPct: (r.thc_pct ?? null) as number | null,
    cbdPct: (r.cbd_pct ?? null) as number | null,
    unitPrice: (r.unit_price ?? null) as number | null,
    imageUrl: safeProductImageUrl(r.image_url as string | null | undefined),
    effects: (r.effects ?? null) as string | null,
    terpenes: (r.terpenes ?? null) as string | null,
    isNew: Boolean(r.is_new),
    isDohCompliant: Boolean(r.is_doh_compliant),
  }));
}

export async function getFeaturedProducts(limit = 8): Promise<MenuProduct[]> {
  const sql = getClient();
  // Curated mode (migration 0154 / Doug 2026-05-04): if Kat has flipped
  // ON `is_featured` for any active product at /admin/marketing/featured,
  // those win — sorted by featured_priority DESC, name ASC. Falls back to
  // auto-mode (recent updated_at on brands-with-sales) when zero curated.
  const curated = await sql`
    SELECT p.id, p.name, p.brand, p.category, p.strain_type,
      p.thc_pct::float AS thc_pct, p.cbd_pct::float AS cbd_pct,
      p.unit_price::float AS unit_price, p.image_url, p.effects, p.terpenes,
      FALSE AS is_new,
      COALESCE(p.is_doh_compliant, FALSE) AS is_doh_compliant
    FROM products p
    WHERE p.is_featured = TRUE
      AND p.carry_status = 'active'
      AND p.unit_price IS NOT NULL
    ORDER BY p.featured_priority DESC NULLS LAST, p.name ASC
    LIMIT ${limit}
  `;
  if (curated.length > 0) {
    return curated.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      brand: (r.brand ?? null) as string | null,
      category: (r.category ?? null) as string | null,
      strainType: (r.strain_type ?? null) as string | null,
      thcPct: (r.thc_pct ?? null) as number | null,
      cbdPct: (r.cbd_pct ?? null) as number | null,
      unitPrice: (r.unit_price ?? null) as number | null,
      imageUrl: safeProductImageUrl(r.image_url as string | null | undefined),
      effects: (r.effects ?? null) as string | null,
      terpenes: (r.terpenes ?? null) as string | null,
      isNew: false,
      isDohCompliant: Boolean(r.is_doh_compliant),
    }));
  }
  // Bug fix 2026-05-04 (round 3): extends brands_with_recent_sales gate
  // so the home-page featured carousel doesn't surface leaked-brand SKUs.
  // Two-bucket: floor-only — featured carousel is customer-facing.
  const rows = await withFloorFallback(
    () => sql`
      WITH latest_inv AS (
        SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::numeric AS qty
        FROM inventory_snapshots
        -- SAFE-FLOOR-ONLY: featured carousel surfaces only grab-and-go SKUs
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
        FALSE AS is_new,
        COALESCE(p.is_doh_compliant, FALSE) AS is_doh_compliant
      FROM products p
      INNER JOIN latest_inv li ON li.product_id = p.id
      INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
      WHERE p.carry_status = 'active'
        AND p.unit_price IS NOT NULL
        AND p.image_url IS NOT NULL
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
        FALSE AS is_new,
        COALESCE(p.is_doh_compliant, FALSE) AS is_doh_compliant
      FROM products p
      INNER JOIN latest_inv li ON li.product_id = p.id
      INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
      WHERE p.carry_status = 'active'
        AND p.unit_price IS NOT NULL
        AND p.image_url IS NOT NULL
        AND li.qty > 0
      ORDER BY p.updated_at DESC
      LIMIT ${limit}
    `,
  );
  const mapped = rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    brand: (r.brand ?? null) as string | null,
    category: (r.category ?? null) as string | null,
    strainType: (r.strain_type ?? null) as string | null,
    thcPct: (r.thc_pct ?? null) as number | null,
    cbdPct: (r.cbd_pct ?? null) as number | null,
    unitPrice: (r.unit_price ?? null) as number | null,
    imageUrl: safeProductImageUrl(r.image_url as string | null | undefined),
    effects: (r.effects ?? null) as string | null,
    terpenes: (r.terpenes ?? null) as string | null,
    isNew: false,
    isDohCompliant: Boolean(r.is_doh_compliant),
  }));
  if (mapped.length < 4) {
    // Two-bucket: floor-only — featured fallback also customer-facing.
    const fallback = await withFloorFallback(
      () => sql`
        WITH latest_inv AS (
          SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::numeric AS qty
          FROM inventory_snapshots
          -- SAFE-FLOOR-ONLY: featured fallback also customer-facing
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
          FALSE AS is_new,
          COALESCE(p.is_doh_compliant, FALSE) AS is_doh_compliant
        FROM products p
        INNER JOIN latest_inv li ON li.product_id = p.id
        INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
        WHERE p.carry_status = 'active'
          AND p.unit_price IS NOT NULL
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
          FALSE AS is_new,
          COALESCE(p.is_doh_compliant, FALSE) AS is_doh_compliant
        FROM products p
        INNER JOIN latest_inv li ON li.product_id = p.id
        INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
        WHERE p.carry_status = 'active'
          AND p.unit_price IS NOT NULL
          AND li.qty > 0
        ORDER BY p.updated_at DESC
        LIMIT ${limit}
      `,
    );
    return fallback.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      brand: (r.brand ?? null) as string | null,
      category: (r.category ?? null) as string | null,
      strainType: (r.strain_type ?? null) as string | null,
      thcPct: (r.thc_pct ?? null) as number | null,
      cbdPct: (r.cbd_pct ?? null) as number | null,
      unitPrice: (r.unit_price ?? null) as number | null,
      imageUrl: safeProductImageUrl(r.image_url as string | null | undefined),
      effects: (r.effects ?? null) as string | null,
      terpenes: (r.terpenes ?? null) as string | null,
      isNew: false,
      isDohCompliant: Boolean(r.is_doh_compliant),
    }));
  }
  return mapped;
}

// Queue-depth ETA for /order header. Counts pending + in-progress online
// orders to estimate wait time. Bucketed because precision here is fake
// confidence — we don't actually track per-order processing time.
export async function getPickupEta(): Promise<{ depth: number; label: string }> {
  const sql = getClient();
  const rows = await sql`
    SELECT COUNT(*)::int AS n
    FROM online_orders
    WHERE status IN ('pending', 'in_progress')
  `;
  const n = (rows[0]?.n as number) ?? 0;
  let label: string;
  if (n === 0) label = "Usually ready in under 10 min";
  else if (n <= 2) label = "Most orders ready in 10–15 min";
  else if (n <= 5) label = "Currently averaging ~20 min";
  else if (n <= 10) label = "Busy right now — about 25–35 min";
  else label = "Heavy queue — we'll text when ready";
  return { depth: n, label };
}

export type ActiveDeal = {
  id: string;
  /** Raw DB name — keep for SEO/JSON-LD/admin reference (may include day-of-week prefix). */
  name: string;
  /**
   * Customer-facing card title — `name` with the day-of-week prefix stripped
   * (e.g. "Friday: 50% off Dope Cooks" → "50% off Dope Cooks"). Doug 2026-05-29
   * /menu rail tighten: the section header already says "Daily deals", so the
   * day-name prefix in each card body was dead weight + broke on other days
   * of the week. Render this in customer-facing card bodies.
   */
  displayName: string;
  description: string | null;
  discountType: "percent" | "dollars";
  discountValue: number | null;
  appliesTo: string | null;
  endDate: string | null;
  /** Pretty short label, e.g. "20% off flower". */
  short: string;
  /** v4.x — when TRUE, deal renders only for PWA-installed customers. */
  appOnly: boolean;
  /**
   * Card-chip tag. Default = category-derived (Flower / Edibles / Storewide).
   * Qualifier-overrides for customer-restricted deals so the chip doesn't
   * misleadingly read STOREWIDE on a birthday-week or industry-cardholder
   * deal (Doug 2026-05-29). Returns null when no specific tag applies —
   * the rail's existing category fallback renders.
   */
  tag: string | null;
};

// Active deals — status = 'active', today is within the start/end window,
// AND either always-active (day_of_week IS NULL) or day_of_week matches
// today's Pacific-time DOW (0=Sun..6=Sat). DOW filter runs server-side so
// the WA-day-of-week is consistent regardless of the visitor's clock.
//
// Vendor display ads — stage 2 public-site read for the admin curation
// surface in inventoryapp /admin/marketing/vendor-ads (migration 0156).
// Returns active ads for a given placement slot, scoped to this store
// (wenatchee here, seattle on the sister repo). Multiple ads in same slot
// → priority DESC, fallback to most-recent. Date window respected.

export type VendorAd = {
  id: string;
  kind: "vendor" | "house";
  vendorName: string | null;
  imageUrl: string | null;
  headline: string | null;
  body: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  placementSlot: string;
  priority: number | null;
};

export async function getActiveVendorAds(slot: string, limit = 3): Promise<VendorAd[]> {
  const sql = getClient();
  // SELECT excludes any ad whose TODAY's impression count has already
  // reached `daily_impression_cap`. Day boundary computed in store TZ
  // (America/Los_Angeles) so the rollover lines up with Kat's calendar
  // — not browser tz of whoever's hitting the page. The `last_impression_day`
  // !=  today branch always passes the cap check (lazy-reset semantics:
  // first impression of a new day starts the counter at 0 again, even if
  // yesterday's counter was at cap).
  const rows = await sql`
    SELECT
      va.id, va.kind,
      v.name AS vendor_name,
      COALESCE(ass.file_url, va.image_url) AS image_url,
      va.headline, va.body, va.cta_label, va.cta_url,
      va.placement_slot, va.priority
    FROM vendor_ads va
    LEFT JOIN vendors v ON v.id = va.vendor_id
    LEFT JOIN vendor_assets ass ON ass.id = va.source_asset_id
    WHERE va.status = 'active'
      AND va.placement_slot = ${slot}
      AND (va.start_date IS NULL OR va.start_date <= CURRENT_DATE)
      AND (va.end_date IS NULL OR va.end_date >= CURRENT_DATE)
      AND (va.store_scope IS NULL OR va.store_scope = 'wenatchee')
      AND (
        va.daily_impression_cap IS NULL
        OR va.last_impression_day IS DISTINCT FROM (NOW() AT TIME ZONE 'America/Los_Angeles')::date
        OR va.impressions_today < va.daily_impression_cap
      )
    ORDER BY va.priority DESC NULLS LAST, va.created_at DESC
    LIMIT ${limit}
  `;
  const ads = rows.map((r) => ({
    id: r.id as string,
    kind: ((r.kind ?? "vendor") as "vendor" | "house"),
    vendorName: r.vendor_name
      ? (cleanBrandName(r.vendor_name as string) || (r.vendor_name as string))
      : null,
    imageUrl: safeProductImageUrl(r.image_url as string | null | undefined),
    headline: (r.headline ?? null) as string | null,
    body: (r.body ?? null) as string | null,
    ctaLabel: (r.cta_label ?? null) as string | null,
    ctaUrl: (r.cta_url ?? null) as string | null,
    placementSlot: r.placement_slot as string,
    priority: (r.priority ?? null) as number | null,
  }));
  // Best-effort impression count — atomic UPDATE with lazy day-reset.
  // CASE expression checks if today's day matches the row's
  // last_impression_day; increments if same, resets to 1 if different.
  // Failure of this UPDATE shouldn't block rendering — caller still
  // gets the SELECT result and customers see the ads. Cap-check on
  // the next request will catch up.
  if (ads.length > 0) {
    const ids = ads.map((a) => a.id);
    try {
      await sql`
        UPDATE vendor_ads
        SET impressions_today = CASE
              WHEN last_impression_day IS DISTINCT FROM (NOW() AT TIME ZONE 'America/Los_Angeles')::date
                THEN 1
              ELSE impressions_today + 1
            END,
            last_impression_day = (NOW() AT TIME ZONE 'America/Los_Angeles')::date
        WHERE id = ANY(${ids}::text[])
      `;
    } catch {
      // Swallow — render quality > telemetry.
    }
  }
  return ads;
}

// "Just In" — products first stocked within the last 7 days, currently
// in stock, with images. Doug's original phrasing was "featured new
// products"; the curated /admin/marketing/featured surface answers
// "featured", and this answers "new". Distinct from getFeaturedProducts:
//   curated: admin-picked, override
//   just-in: auto-derived from inventory_snapshots first-seen
// Same brands_with_recent_sales gate as getMenuProducts so we don't
// surface leaked-brand SKUs.
export async function getJustInProducts(limit = 12): Promise<MenuProduct[]> {
  const sql = getClient();
  // Two-bucket: latest_inv = floor-only (customer-visible on-hand);
  // first_seen = aggregate (vault arrivals count as "received").
  const rows = await withFloorFallback(
    () => sql`
      WITH latest_inv AS (
        SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::float AS qty
        FROM inventory_snapshots
        -- SAFE-FLOOR-ONLY: "🆕 Just In" customer card requires grab-and-go stock
        WHERE location_id = 'default'
          AND stock_zone = 'floor'
        ORDER BY product_id, captured_at DESC
      ),
      first_seen AS (
        SELECT product_id, MIN(captured_at) AS first_at
        FROM inventory_snapshots
        -- SAFE-AGGREGATE: vault arrivals also start the "new" 7d window
        WHERE quantity_on_hand > 0
          AND stock_zone IN ('vault','floor')
        GROUP BY product_id
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
        TRUE AS is_new,
        COALESCE(p.is_doh_compliant, FALSE) AS is_doh_compliant
      FROM products p
      INNER JOIN first_seen fs ON fs.product_id = p.id
      INNER JOIN latest_inv li ON li.product_id = p.id
      INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
      WHERE p.carry_status = 'active'
        AND p.unit_price IS NOT NULL
        AND p.unit_price > 0
        AND p.image_url IS NOT NULL
        AND li.qty > 0
        AND fs.first_at >= NOW() - INTERVAL '7 days'
      ORDER BY fs.first_at DESC, p.name ASC
      LIMIT ${limit}
    `,
    () => sql`
      WITH latest_inv AS (
        SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::float AS qty
        FROM inventory_snapshots
        WHERE location_id = 'default'
        ORDER BY product_id, captured_at DESC
      ),
      first_seen AS (
        SELECT product_id, MIN(captured_at) AS first_at
        FROM inventory_snapshots
        WHERE quantity_on_hand > 0
        GROUP BY product_id
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
        TRUE AS is_new,
        COALESCE(p.is_doh_compliant, FALSE) AS is_doh_compliant
      FROM products p
      INNER JOIN first_seen fs ON fs.product_id = p.id
      INNER JOIN latest_inv li ON li.product_id = p.id
      INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
      WHERE p.carry_status = 'active'
        AND p.unit_price IS NOT NULL
        AND p.unit_price > 0
        AND p.image_url IS NOT NULL
        AND li.qty > 0
        AND fs.first_at >= NOW() - INTERVAL '7 days'
      ORDER BY fs.first_at DESC, p.name ASC
      LIMIT ${limit}
    `,
  );
  return rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    brand: (r.brand ?? null) as string | null,
    category: (r.category ?? null) as string | null,
    strainType: (r.strain_type ?? null) as string | null,
    thcPct: (r.thc_pct ?? null) as number | null,
    cbdPct: (r.cbd_pct ?? null) as number | null,
    unitPrice: (r.unit_price ?? null) as number | null,
    imageUrl: safeProductImageUrl(r.image_url as string | null | undefined),
    effects: (r.effects ?? null) as string | null,
    terpenes: (r.terpenes ?? null) as string | null,
    isNew: true,
    isDohCompliant: Boolean(r.is_doh_compliant),
  }));
}

// Treasure-chest = staff-curated clearance lane. Doug 2026-05-07: "build in
// something for treasure chest (our old slow selling items) have there be a
// tag to make items 'treasure chest' so its easier to display those sale
// items." Source-of-truth tag is products.display_priority='clearance', set
// from /admin/treasure-chest. We mirror the brand-level "actually carried
// here" gate from getMenuProducts so a leaked/stale row from the other store
// can't slip through.
export async function getTreasureChestProducts(limit = 60): Promise<MenuProduct[]> {
  const sql = getClient();
  // Two-bucket: floor-only — treasure chest = customer-facing clearance.
  const rows = await withFloorFallback(
    () => sql`
      WITH latest_inv AS (
        SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::float AS qty
        FROM inventory_snapshots
        -- SAFE-FLOOR-ONLY: treasure-chest clearance only shows what customer can grab
        WHERE location_id = 'default'
          AND stock_zone = 'floor'
        ORDER BY product_id, captured_at DESC
      ),
      brands_with_recent_sales AS (
        SELECT DISTINCT p.vendor_id
        FROM sale_line_items sli
        INNER JOIN products p ON p.id = sli.product_id
        WHERE sli.sold_at >= NOW() - INTERVAL '365 days'
          AND p.vendor_id IS NOT NULL
      )
      SELECT
        p.id, p.name, p.brand, p.category, p.strain_type,
        p.thc_pct::float AS thc_pct, p.cbd_pct::float AS cbd_pct,
        p.unit_price::float AS unit_price, p.image_url, p.effects, p.terpenes,
        COALESCE(p.is_doh_compliant, FALSE) AS is_doh_compliant
      FROM products p
      INNER JOIN latest_inv li ON li.product_id = p.id
      INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
      WHERE p.carry_status = 'active'
        AND p.display_priority = 'clearance'
        AND li.qty > 0
        AND p.unit_price IS NOT NULL
        AND p.unit_price >= 1.99
      ORDER BY p.unit_price ASC NULLS LAST, p.name ASC
      LIMIT ${limit}
    `,
    () => sql`
      WITH latest_inv AS (
        SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::float AS qty
        FROM inventory_snapshots
        WHERE location_id = 'default'
        ORDER BY product_id, captured_at DESC
      ),
      brands_with_recent_sales AS (
        SELECT DISTINCT p.vendor_id
        FROM sale_line_items sli
        INNER JOIN products p ON p.id = sli.product_id
        WHERE sli.sold_at >= NOW() - INTERVAL '365 days'
          AND p.vendor_id IS NOT NULL
      )
      SELECT
        p.id, p.name, p.brand, p.category, p.strain_type,
        p.thc_pct::float AS thc_pct, p.cbd_pct::float AS cbd_pct,
        p.unit_price::float AS unit_price, p.image_url, p.effects, p.terpenes,
        COALESCE(p.is_doh_compliant, FALSE) AS is_doh_compliant
      FROM products p
      INNER JOIN latest_inv li ON li.product_id = p.id
      INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
      WHERE p.carry_status = 'active'
        AND p.display_priority = 'clearance'
        AND li.qty > 0
        AND p.unit_price IS NOT NULL
        AND p.unit_price >= 1.99
      ORDER BY p.unit_price ASC NULLS LAST, p.name ASC
      LIMIT ${limit}
    `,
  );
  return rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    brand: (r.brand ?? null) as string | null,
    category: (r.category ?? null) as string | null,
    strainType: (r.strain_type ?? null) as string | null,
    thcPct: (r.thc_pct ?? null) as number | null,
    cbdPct: (r.cbd_pct ?? null) as number | null,
    unitPrice: (r.unit_price ?? null) as number | null,
    imageUrl: safeProductImageUrl(r.image_url as string | null | undefined),
    effects: (r.effects ?? null) as string | null,
    terpenes: (r.terpenes ?? null) as string | null,
    isNew: false,
    isDohCompliant: Boolean(r.is_doh_compliant),
  }));
}

// Order: today's day-specific deals FIRST (so the daily-deal mailer headline
// always wins above the always-on tier), then always-on, sorted within each
// tier by end_date ascending then name. LIMIT 20 because the active-deal
// roster (heroes-30, first-visit-30, birthday-20, online-15/20, industry-20,
// + rotating daily-deal mailer) easily fits but the cap protects future
// growth.
// Strip day-of-week prefix (e.g. "Friday: ", "Monday: ") from a deal name
// so customer-facing surfaces don't repeat the day-name that the section
// header ("Daily deals") already implies. Doug 2026-05-29 /menu rail
// tighten: pre-fix every card body started with "Friday:" even on Saturday.
function stripDayPrefix(name: string): string {
  return name.replace(/^(?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day:\s*/i, "").trim();
}

// Hero-string builder for /deals cards. Doug 2026-05-08: the Friday Dope
// Cooks deal was rendering "50% off edibles" in the giant hero text (built
// from applies_to=edibles) instead of "50% off Dope Cooks" — the deal's
// `name` field already had the brand. The fix: when the deal name already
// reads as marketing copy (contains the discount % or $), use it directly
// (with day-of-week prefix stripped). Falls back to the legacy applies_to
// shape only when the name doesn't carry the discount itself.
function buildDealShort(
  name: string,
  val: number | null,
  dt: "percent" | "dollars",
  applies: string | null,
): string {
  if (val == null) return name;
  const cleaned = stripDayPrefix(name);
  if (/\d+\s*%\s*off\b/i.test(cleaned) || /\$\d+\b/i.test(cleaned)) return cleaned;
  const suffix = applies && applies !== "all" ? ` ${applies}` : "";
  return dt === "percent" ? `${val}% off${suffix}` : `$${val.toFixed(0)} off${suffix}`;
}

// Tag inference for the card-chip badge. Defaults to a category bucket
// derived from `applies_to`. Qualifier-restricted deals (birthday-week,
// industry cardholder, heroes, first-visit, online-only) get a more
// specific tag so the chip doesn't misleadingly read STOREWIDE on a deal
// that only applies to a sub-audience. Doug 2026-05-29 — the chip color
// is driven by this string downstream (rail picks the palette by tag).
//
// Order matters: qualifier-overrides win over the category fallback so
// "Birthday Bud — Flower 20%" tags as BIRTHDAY not FLOWER.
function deriveDealTag(name: string, applies: string | null): string | null {
  const haystack = stripDayPrefix(name).toLowerCase();
  // Qualifier overrides — customer-restricted deals.
  if (/\bbirthday\b/.test(haystack)) return "BIRTHDAY";
  if (/\b(industry|ccb\b|cardholder|budtender)\b/.test(haystack)) return "INDUSTRY";
  if (/\b(heroes?|veteran|first[\s-]?responder|military)\b/.test(haystack)) return "HEROES";
  if (/\bfirst[\s-]?(time|visit)\b/.test(haystack)) return "FIRST VISIT";
  if (/\b(loyalty|rewards?|members?)\b/.test(haystack) && !/\bonline\b/.test(haystack))
    return "LOYALTY";
  if (/\b(online|app[\s-]?only|in[\s-]?app|pwa)\b/.test(haystack)) return "ONLINE";
  // Category fallback — from applies_to. NULL/all → STOREWIDE.
  const cat = (applies ?? "").toLowerCase().trim();
  if (cat === "" || cat === "all") return "STOREWIDE";
  if (cat === "pre-rolls" || cat === "prerolls") return "PRE-ROLLS";
  return cat.toUpperCase();
}

export async function getActiveDeals(opts?: { includeAppOnly?: boolean }): Promise<ActiveDeal[]> {
  const sql = getClient();
  // App-only filter — caller passes includeAppOnly=true for PWA-installed
  // customers (cookie set on /api/track-install standalone-launch).
  // COALESCE handles pre-migration databases where the column hasn't been
  // added yet (= every deal app_only=false). Doug 2026-05-07.
  const includeAppOnly = opts?.includeAppOnly === true;
  const rows = await sql`
    SELECT
      id, name, description, discount_type, discount_value::float AS discount_value,
      applies_to, end_date::text AS end_date,
      COALESCE(app_only, FALSE) AS app_only
    FROM deals
    WHERE status = 'active'
      AND (start_date IS NULL OR start_date <= CURRENT_DATE)
      AND (end_date IS NULL OR end_date >= CURRENT_DATE)
      AND (day_of_week IS NULL OR day_of_week = EXTRACT(DOW FROM (now() AT TIME ZONE 'America/Los_Angeles'))::smallint)
      AND (${includeAppOnly} = TRUE OR COALESCE(app_only, FALSE) = FALSE)
    ORDER BY (day_of_week IS NULL) ASC, end_date NULLS LAST, name
    LIMIT 20
  `;
  return rows.map((r) => {
    const dt = (r.discount_type as string) === "dollars" ? "dollars" : "percent";
    const val = (r.discount_value ?? null) as number | null;
    const applies = (r.applies_to ?? null) as string | null;
    const rawName = r.name as string;
    const short = buildDealShort(rawName, val, dt, applies);
    return {
      id: r.id as string,
      name: rawName,
      displayName: stripDayPrefix(rawName),
      description: (r.description ?? null) as string | null,
      discountType: dt,
      discountValue: val,
      appliesTo: applies,
      endDate: (r.end_date ?? null) as string | null,
      short,
      appOnly: Boolean(r.app_only),
      tag: deriveDealTag(rawName, applies),
    };
  });
}

// Small product preview for the /deals/[id] deep page — show 6 in-stock
// products that match the deal's appliesTo category so the customer sees
// what's actually on sale before clicking through to /menu or /order.
//
// Match is case-insensitive ILIKE on the raw category column. Categories
// in the DB look like "Flower", "DOH Flower", "Pre-Roll", etc.; the deal's
// appliesTo is the bucket label ("flower", "pre-rolls"). ILIKE %label%
// catches the spelling variants without us re-implementing normalization
// here.
export async function getCategoryPreviewProducts(
  category: string,
  limit = 6,
): Promise<MenuProduct[]> {
  const sql = getClient();
  // Strip trailing "s" so "Edibles" → "Edible" matches both forms.
  const stem = category.replace(/s$/i, "");
  const pat = `%${stem}%`;
  // Bug fix 2026-05-04 (round 3): extends brands_with_recent_sales gate
  // so home-page category previews don't surface leaked-brand SKUs.
  // Two-bucket: floor-only — category preview is on homepage.
  const rows = await withFloorFallback(
    () => sql`
      WITH latest_inv AS (
        SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::numeric AS qty
        FROM inventory_snapshots
        -- SAFE-FLOOR-ONLY: home-page category preview is customer-facing
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
        AND p.category ILIKE ${pat}
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
        AND p.category ILIKE ${pat}
        AND li.qty > 0
      ORDER BY p.updated_at DESC
      LIMIT ${limit}
    `,
  );
  return rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    brand: (r.brand ?? null) as string | null,
    category: (r.category ?? null) as string | null,
    strainType: (r.strain_type ?? null) as string | null,
    thcPct: (r.thc_pct ?? null) as number | null,
    cbdPct: (r.cbd_pct ?? null) as number | null,
    unitPrice: (r.unit_price ?? null) as number | null,
    imageUrl: safeProductImageUrl(r.image_url as string | null | undefined),
    effects: (r.effects ?? null) as string | null,
    terpenes: (r.terpenes ?? null) as string | null,
    isNew: false,
    isDohCompliant: Boolean(r.is_doh_compliant),
  }));
}

// Single-deal lookup for the /deals/[id] deep page (SMS-shareable).
// Honors the same active-window filter as getActiveDeals so a stale/expired
// share link 404s instead of showing an old promo. Now also returns the
// `app_only` flag so the page can gate visibility — pre-fix the deep page
// hardcoded `appOnly: false`, meaning a customer could share an app-only
// deal URL and a non-installed recipient could view it directly,
// completely bypassing the install incentive that's the whole point of
// app-only deals (Doug 2026-05-07: "special deals through the app").
// Sister fix: seattle-cannabis-web v5.605.
export async function getDealById(id: string): Promise<ActiveDeal | null> {
  const sql = getClient();
  const rows = await sql`
    SELECT
      id, name, description, discount_type, discount_value::float AS discount_value,
      applies_to, end_date::text AS end_date,
      COALESCE(app_only, FALSE) AS app_only
    FROM deals
    WHERE id = ${id}
      AND status = 'active'
      AND (start_date IS NULL OR start_date <= CURRENT_DATE)
      AND (end_date IS NULL OR end_date >= CURRENT_DATE)
      AND (day_of_week IS NULL OR day_of_week = EXTRACT(DOW FROM (now() AT TIME ZONE 'America/Los_Angeles'))::smallint)
    LIMIT 1
  `;
  const r = rows[0];
  if (!r) return null;
  const dt = (r.discount_type as string) === "dollars" ? "dollars" : "percent";
  const val = (r.discount_value ?? null) as number | null;
  const applies = (r.applies_to ?? null) as string | null;
  const rawName = r.name as string;
  const short = buildDealShort(rawName, val, dt, applies);
  return {
    id: r.id as string,
    name: rawName,
    displayName: stripDayPrefix(rawName),
    description: (r.description ?? null) as string | null,
    discountType: dt,
    discountValue: val,
    appliesTo: applies,
    endDate: (r.end_date ?? null) as string | null,
    short,
    appOnly: Boolean(r.app_only),
    tag: deriveDealTag(rawName, applies),
  };
}

export async function getActiveBrands(): Promise<VendorBrand[]> {
  const sql = getClient();
  // Bug fix 2026-05-04 (round 2): v3.187 added qty>0 guard, but Doug
  // showed a screenshot of "ABS Buds" (Wenatchee-era brand) rendering
  // on Seattle. Root cause was leaked inventory_snapshots from a seed
  // migration. Adding `brands_with_recent_sales` CTE — each Neon DB
  // only has THAT store's sales, so a sale_line_item row = customer
  // paid for it at this register (per CLAUDE.md). Brand only renders
  // if it has ≥1 sale in last 365d. Mirrored on seattle-cannabis-web.
  // Tradeoff: brand-new vendor before first sale is hidden — acceptable.
  //
  // Two-bucket: floor-only — `active_skus` counts only customer-visible
  // stock so /brands/[slug] doesn't claim "12 products" when 11 are vault.
  const rows = await withFloorFallback(
    () => sql`
      WITH latest_inv AS (
        SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::numeric AS qty
        FROM inventory_snapshots
        -- SAFE-FLOOR-ONLY: brand-page SKU count must match customer-visible stock
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
      SELECT
        v.id,
        v.name,
        LOWER(REGEXP_REPLACE(v.name, '[^a-zA-Z0-9]+', '-', 'g')) AS slug,
        v.website,
        v.logo_url,
        v.image_source,
        v.notes,
        v.brand_bio,
        v.social_instagram,
        v.social_x,
        v.social_facebook,
        COUNT(p.id) FILTER (
          WHERE p.carry_status = 'active'
            AND p.unit_price IS NOT NULL
            AND p.unit_price > 0
            AND COALESCE(li.qty, 0) > 0
        )::int AS active_skus
      FROM vendors v
      INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = v.id
      LEFT JOIN products p ON p.vendor_id = v.id
      LEFT JOIN latest_inv li ON li.product_id = p.id
      GROUP BY v.id
      HAVING COUNT(p.id) FILTER (
        WHERE p.carry_status = 'active'
          AND p.unit_price IS NOT NULL
          AND p.unit_price > 0
          AND COALESCE(li.qty, 0) > 0
      ) > 0
      ORDER BY v.name
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
      SELECT
        v.id,
        v.name,
        LOWER(REGEXP_REPLACE(v.name, '[^a-zA-Z0-9]+', '-', 'g')) AS slug,
        v.website,
        v.logo_url,
        v.image_source,
        v.notes,
        v.brand_bio,
        v.social_instagram,
        v.social_x,
        v.social_facebook,
        COUNT(p.id) FILTER (
          WHERE p.carry_status = 'active'
            AND p.unit_price IS NOT NULL
            AND p.unit_price > 0
            AND COALESCE(li.qty, 0) > 0
        )::int AS active_skus
      FROM vendors v
      INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = v.id
      LEFT JOIN products p ON p.vendor_id = v.id
      LEFT JOIN latest_inv li ON li.product_id = p.id
      GROUP BY v.id
      HAVING COUNT(p.id) FILTER (
        WHERE p.carry_status = 'active'
          AND p.unit_price IS NOT NULL
          AND p.unit_price > 0
          AND COALESCE(li.qty, 0) > 0
      ) > 0
      ORDER BY v.name
    `,
  );
  return rows.map((r) => ({
    id: r.id as string,
    name: cleanBrandName(r.name as string) || (r.name as string),
    slug: r.slug as string,
    website: r.website as string | null,
    logoUrl: r.logo_url as string | null,
    imageSource: r.image_source as string | null,
    notes: r.notes as string | null,
    activeSkus: r.active_skus as number,
    brandBio: (r.brand_bio as string | null) ?? null,
    socialInstagram: (r.social_instagram as string | null) ?? null,
    socialX: (r.social_x as string | null) ?? null,
    socialFacebook: (r.social_facebook as string | null) ?? null,
  }));
}

/**
 * Top brands ranked by recent sales-line-item COUNT.
 *
 * Doug 2026-05-17: "top brands should be based on sales." Pre-fix the
 * homepage carousel used getActiveBrands() which ORDER BY v.name —
 * alphabetical. "Top Brands" claiming to be Washington's finest then
 * surfacing whoever started with A is misleading. This function:
 *
 *   - Counts sale_line_items per vendor in the past `days` window
 *     (default 90 — recency-weighted; brands selling NOW float, dormant
 *     brands sink)
 *   - INNER JOIN-gates to that count so brand-new vendors with 0 sales
 *     don't show on the carousel (same active-skus + image_url gate
 *     pattern as getActiveBrands so the consumer-side .filter(logoUrl)
 *     doesn't get a wall of logo-less tiles)
 *   - ORDER BY sales DESC, name ASC for deterministic tiebreaks
 *
 * `getActiveBrands()` (alphabetical) is intentionally kept for the
 * `/brands` index page where alphabetical browsing is the expected UX.
 */
export async function getTopBrandsBySales(
  limit = 30,
  days = 90,
): Promise<(VendorBrand & { recentSalesCount: number })[]> {
  const sql = getClient();
  // Two-bucket: floor-only — homepage carousel must match customer-visible stock.
  const rows = await withFloorFallback(
    () => sql`
      WITH latest_inv AS (
        SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::numeric AS qty
        FROM inventory_snapshots
        -- SAFE-FLOOR-ONLY: homepage top-brands ranks only by customer-visible stock
        WHERE stock_zone = 'floor'
        ORDER BY product_id, captured_at DESC
      ),
      brand_sales_window AS (
        SELECT p.vendor_id, COUNT(*)::int AS sales_count
        FROM sale_line_items sli
        INNER JOIN products p ON p.id = sli.product_id
        WHERE sli.sold_at >= NOW() - (INTERVAL '1 day' * ${days})
          AND p.vendor_id IS NOT NULL
        GROUP BY p.vendor_id
      )
      SELECT
        v.id,
        v.name,
        LOWER(REGEXP_REPLACE(v.name, '[^a-zA-Z0-9]+', '-', 'g')) AS slug,
        v.website,
        v.logo_url,
        v.image_source,
        v.notes,
        v.brand_bio,
        v.social_instagram,
        v.social_x,
        v.social_facebook,
        bsw.sales_count AS recent_sales_count,
        COUNT(p.id) FILTER (
          WHERE p.carry_status = 'active'
            AND p.unit_price IS NOT NULL
            AND p.unit_price > 0
            AND COALESCE(li.qty, 0) > 0
        )::int AS active_skus
      FROM vendors v
      INNER JOIN brand_sales_window bsw ON bsw.vendor_id = v.id
      LEFT JOIN products p ON p.vendor_id = v.id
      LEFT JOIN latest_inv li ON li.product_id = p.id
      GROUP BY v.id, bsw.sales_count
      HAVING COUNT(p.id) FILTER (
        WHERE p.carry_status = 'active'
          AND p.unit_price IS NOT NULL
          AND p.unit_price > 0
          AND COALESCE(li.qty, 0) > 0
      ) > 0
      ORDER BY bsw.sales_count DESC, v.name ASC
      LIMIT ${limit}
    `,
    () => sql`
      WITH latest_inv AS (
        SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::numeric AS qty
        FROM inventory_snapshots
        ORDER BY product_id, captured_at DESC
      ),
      brand_sales_window AS (
        SELECT p.vendor_id, COUNT(*)::int AS sales_count
        FROM sale_line_items sli
        INNER JOIN products p ON p.id = sli.product_id
        WHERE sli.sold_at >= NOW() - (INTERVAL '1 day' * ${days})
          AND p.vendor_id IS NOT NULL
        GROUP BY p.vendor_id
      )
      SELECT
        v.id,
        v.name,
        LOWER(REGEXP_REPLACE(v.name, '[^a-zA-Z0-9]+', '-', 'g')) AS slug,
        v.website,
        v.logo_url,
        v.image_source,
        v.notes,
        v.brand_bio,
        v.social_instagram,
        v.social_x,
        v.social_facebook,
        bsw.sales_count AS recent_sales_count,
        COUNT(p.id) FILTER (
          WHERE p.carry_status = 'active'
            AND p.unit_price IS NOT NULL
            AND p.unit_price > 0
            AND COALESCE(li.qty, 0) > 0
        )::int AS active_skus
      FROM vendors v
      INNER JOIN brand_sales_window bsw ON bsw.vendor_id = v.id
      LEFT JOIN products p ON p.vendor_id = v.id
      LEFT JOIN latest_inv li ON li.product_id = p.id
      GROUP BY v.id, bsw.sales_count
      HAVING COUNT(p.id) FILTER (
        WHERE p.carry_status = 'active'
          AND p.unit_price IS NOT NULL
          AND p.unit_price > 0
          AND COALESCE(li.qty, 0) > 0
      ) > 0
      ORDER BY bsw.sales_count DESC, v.name ASC
      LIMIT ${limit}
    `,
  );
  return rows.map((r) => ({
    id: r.id as string,
    name: cleanBrandName(r.name as string) || (r.name as string),
    slug: r.slug as string,
    website: r.website as string | null,
    logoUrl: r.logo_url as string | null,
    imageSource: r.image_source as string | null,
    notes: r.notes as string | null,
    activeSkus: r.active_skus as number,
    brandBio: (r.brand_bio as string | null) ?? null,
    socialInstagram: (r.social_instagram as string | null) ?? null,
    socialX: (r.social_x as string | null) ?? null,
    socialFacebook: (r.social_facebook as string | null) ?? null,
    recentSalesCount: r.recent_sales_count as number,
  }));
}

// Wrapped with React.cache() so generateMetadata + the page component
// share the same result within a single request. Pre-fix /loop tick 10
// JSON-LD audit found ~17 custom-override brand pages emitting only the
// 3 root-layout JSON-LD blocks. React.cache fixed 18/20 brands; 2 stuck
// (avitas + dewey-cannabis-co) — these regenerate fresh at build time
// with `null` (transient DB miss / NOW()-INTERVAL drift) and the cached
// noindex result sticks across ISR cycles. Tick 11 fix: query-time
// retry-once-on-null inside the inner async fn (BEFORE the React.cache
// wrap, so retries happen per-call rather than per-request — and the
// result of whichever attempt succeeds is cached). Single retry adds at
// most one round-trip when the first call returns null; for true-not-
// found brands (rare — sitemap excludes them) it doubles latency, but
// all brand-page requests are static-rendered + ISR-cached so the
// performance hit is one-time-per-revalidate, not per-customer-visit.
// Sister scc same-fix.
async function _getBrandBySlugInner(slug: string): Promise<VendorBrand | null> {
  const sql = getClient();
  // Bug fix 2026-05-04 (round 2): adds same brands_with_recent_sales
  // gate as getActiveBrands. Direct /brands/abs-buds visit returns null →
  // page 404s instead of rendering an empty-products page or worse, a
  // hand-authored brand override component for a brand we don't carry.
  // Two-bucket: floor-only — brand-page active_skus count is customer-facing.
  const rows = await withFloorFallback(
    () => sql`
      WITH latest_inv AS (
        SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::numeric AS qty
        FROM inventory_snapshots
        -- SAFE-FLOOR-ONLY: brand detail page must match customer-visible stock
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
      SELECT
        v.id,
        v.name,
        LOWER(REGEXP_REPLACE(v.name, '[^a-zA-Z0-9]+', '-', 'g')) AS slug,
        v.website,
        v.logo_url,
        v.image_source,
        v.notes,
        v.brand_bio,
        v.social_instagram,
        v.social_x,
        v.social_facebook,
        COUNT(p.id) FILTER (
          WHERE p.carry_status = 'active'
            AND p.unit_price IS NOT NULL
            AND p.unit_price > 0
            AND COALESCE(li.qty, 0) > 0
        )::int AS active_skus
      FROM vendors v
      INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = v.id
      LEFT JOIN products p ON p.vendor_id = v.id
      LEFT JOIN latest_inv li ON li.product_id = p.id
      GROUP BY v.id
      HAVING LOWER(REGEXP_REPLACE(v.name, '[^a-zA-Z0-9]+', '-', 'g')) = ${slug}
      LIMIT 1
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
      SELECT
        v.id,
        v.name,
        LOWER(REGEXP_REPLACE(v.name, '[^a-zA-Z0-9]+', '-', 'g')) AS slug,
        v.website,
        v.logo_url,
        v.image_source,
        v.notes,
        v.brand_bio,
        v.social_instagram,
        v.social_x,
        v.social_facebook,
        COUNT(p.id) FILTER (
          WHERE p.carry_status = 'active'
            AND p.unit_price IS NOT NULL
            AND p.unit_price > 0
            AND COALESCE(li.qty, 0) > 0
        )::int AS active_skus
      FROM vendors v
      INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = v.id
      LEFT JOIN products p ON p.vendor_id = v.id
      LEFT JOIN latest_inv li ON li.product_id = p.id
      GROUP BY v.id
      HAVING LOWER(REGEXP_REPLACE(v.name, '[^a-zA-Z0-9]+', '-', 'g')) = ${slug}
      LIMIT 1
    `,
  );
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    id: r.id as string,
    name: cleanBrandName(r.name as string) || (r.name as string),
    slug: r.slug as string,
    website: r.website as string | null,
    logoUrl: r.logo_url as string | null,
    imageSource: r.image_source as string | null,
    notes: r.notes as string | null,
    activeSkus: r.active_skus as number,
    brandBio: (r.brand_bio as string | null) ?? null,
    socialInstagram: (r.social_instagram as string | null) ?? null,
    socialX: (r.social_x as string | null) ?? null,
    socialFacebook: (r.social_facebook as string | null) ?? null,
  };
}

export const getBrandBySlug = cache(async (slug: string): Promise<VendorBrand | null> => {
  const first = await _getBrandBySlugInner(slug);
  if (first !== null) return first;
  // Retry once on null. Some build-time renders see transient null from
  // getBrandBySlug (NOW()-INTERVAL drift, Neon cold start, connection-pool
  // timing) — a single retry resolves these cleanly. If the brand truly
  // doesn't exist we'll return null on the second pass too. See
  // _getBrandBySlugInner comment above for full incident context.
  return _getBrandBySlugInner(slug);
});

export async function getBrandProducts(vendorId: string) {
  const sql = getClient();
  // Bug fix 2026-05-04 (round 3): the brand-level gate at getBrandBySlug
  // already prevents this function from being called for leaked brands
  // (the page 404s before reaching here). But add the same product-level
  // sales guard for defense-in-depth — if a future surface calls this
  // bypassing the brand filter, we still don't render leaked SKUs.
  // Two-bucket: floor-only — /brands/[slug] product list is customer-facing.
  const rows = await withFloorFallback(
    () => sql`
      WITH latest_inv AS (
        SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::numeric AS qty
        FROM inventory_snapshots
        -- SAFE-FLOOR-ONLY: brand product listing only shows customer-visible SKUs
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
      SELECT
        p.id,
        p.name,
        p.brand,
        p.category,
        p.strain_type,
        p.thc_pct::float   AS thc_pct,
        p.cbd_pct::float   AS cbd_pct,
        p.unit_price::float AS unit_price,
        p.image_url,
        p.effects,
        p.terpenes
      FROM products p
      INNER JOIN latest_inv li ON li.product_id = p.id
      INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
      WHERE p.vendor_id = ${vendorId}
        AND p.carry_status = 'active'
        AND p.unit_price IS NOT NULL
        AND p.unit_price > 0
        AND li.qty > 0
      ORDER BY p.category NULLS LAST, p.brand NULLS LAST, p.name
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
      SELECT
        p.id,
        p.name,
        p.brand,
        p.category,
        p.strain_type,
        p.thc_pct::float   AS thc_pct,
        p.cbd_pct::float   AS cbd_pct,
        p.unit_price::float AS unit_price,
        p.image_url,
        p.effects,
        p.terpenes
      FROM products p
      INNER JOIN latest_inv li ON li.product_id = p.id
      INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
      WHERE p.vendor_id = ${vendorId}
        AND p.carry_status = 'active'
        AND p.unit_price IS NOT NULL
        AND p.unit_price > 0
        AND li.qty > 0
      ORDER BY p.category NULLS LAST, p.brand NULLS LAST, p.name
    `,
  );
  return rows as Array<{
    id: string;
    name: string;
    brand: string | null;
    category: string | null;
    strain_type: string | null;
    thc_pct: number | null;
    cbd_pct: number | null;
    unit_price: number | null;
    image_url: string | null;
    effects: string | null;
    terpenes: string | null;
  }>;
}

// ─── Strain↔menu integration ──────────────────────────────────────────────
//
// Returns ranked + scored products matching a given strain by name / lineage
// / terpene / type. Backs the "In stock today" section on /strains/<slug>.
//
// Spec: STRAIN_MENU_INTEGRATION_SPEC_2026_05_17.md §3.2. Doug greenlight
// 2026-05-17 — Path B (local Postgres) won over Path A (Algolia direct).
//
// Same DB invariants as getMenuProducts (carry_status='active' + latest_inv
// qty>0 + brands_with_recent_sales 365d window) — keeps the ghost-inventory
// filter that closed the cross-store leakage bug.
export const getStrainMatchedProducts = cache(async (
  strain: Strain,
  opts: {
    graph: LineageGraph | null;
    strainsBySlug: Record<string, Strain>;
    deals?: ActiveDeal[];
    limit: number;
  },
): Promise<ScoredProduct[]> => {
  // CBD-type strains aren't in products.strain_type enum (which is just
  // sativa/indica/hybrid). Doug spec §7 decision: SKIP CBD strains entirely
  // for now — the match would be confusing across topicals/tinctures/edibles
  // and the section would be misleading. Hide via empty result.
  if (strain.type !== "indica" && strain.type !== "sativa" && strain.type !== "hybrid") {
    return [];
  }

  const sql = getClient();

  // Build ILIKE search stems. Word-boundary enforcement happens in JS
  // scoreProduct via nameContains() — the SQL is a permissive pre-filter
  // (cast wide, JS scoring narrows).
  const nameStem = `%${strain.name}%`;
  const parentStems = (opts.graph?.parents ?? [])
    .map((p) => p.name)
    .filter((n) => n && n.length >= 3)
    .map((n) => `%${n}%`);
  const childStems = (opts.graph?.descendants ?? [])
    .map((c) => c.name)
    .filter((n) => n && n.length >= 3)
    .map((n) => `%${n}%`);
  const myTerpenes = (strain.terpenes ?? [])
    .map((t) => t.name)
    .filter((n) => n && n.length >= 3);

  // Two-bucket: floor-only — /strains/[slug] "In stock today" surface.
  const rows = await withFloorFallback(
    () => sql`
      WITH latest_inv AS (
        SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::numeric AS qty
        FROM inventory_snapshots
        -- SAFE-FLOOR-ONLY: "In stock today" must be grab-and-go
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
      SELECT
        p.id, p.name, p.brand, p.category, p.strain_type,
        p.thc_pct::float AS thc_pct, p.cbd_pct::float AS cbd_pct,
        p.unit_price::float AS unit_price, p.image_url, p.effects, p.terpenes,
        FALSE AS is_new,
        COALESCE(p.is_doh_compliant, FALSE) AS is_doh_compliant
      FROM products p
      INNER JOIN latest_inv li ON li.product_id = p.id
      INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
      WHERE p.carry_status = 'active'
        AND p.unit_price IS NOT NULL AND p.unit_price > 0
        AND li.qty > 0
        AND p.image_url IS NOT NULL
        AND (
          p.name ILIKE ${nameStem}
          OR EXISTS (SELECT 1 FROM unnest(${parentStems}::text[]) ps WHERE p.name ILIKE ps)
          OR EXISTS (SELECT 1 FROM unnest(${childStems}::text[]) cs WHERE p.name ILIKE cs)
          OR (
            p.strain_type = ${strain.type}
            AND p.terpenes IS NOT NULL
            AND EXISTS (SELECT 1 FROM unnest(${myTerpenes}::text[]) t WHERE p.terpenes ILIKE '%' || t || '%')
          )
        )
      LIMIT 80
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
      SELECT
        p.id, p.name, p.brand, p.category, p.strain_type,
        p.thc_pct::float AS thc_pct, p.cbd_pct::float AS cbd_pct,
        p.unit_price::float AS unit_price, p.image_url, p.effects, p.terpenes,
        FALSE AS is_new,
        COALESCE(p.is_doh_compliant, FALSE) AS is_doh_compliant
      FROM products p
      INNER JOIN latest_inv li ON li.product_id = p.id
      INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
      WHERE p.carry_status = 'active'
        AND p.unit_price IS NOT NULL AND p.unit_price > 0
        AND li.qty > 0
        AND p.image_url IS NOT NULL
        AND (
          p.name ILIKE ${nameStem}
          OR EXISTS (SELECT 1 FROM unnest(${parentStems}::text[]) ps WHERE p.name ILIKE ps)
          OR EXISTS (SELECT 1 FROM unnest(${childStems}::text[]) cs WHERE p.name ILIKE cs)
          OR (
            p.strain_type = ${strain.type}
            AND p.terpenes IS NOT NULL
            AND EXISTS (SELECT 1 FROM unnest(${myTerpenes}::text[]) t WHERE p.terpenes ILIKE '%' || t || '%')
          )
        )
      LIMIT 80
    `,
  );

  const candidates: MenuProduct[] = (rows as Array<{
    id: string; name: string; brand: string | null; category: string | null;
    strain_type: string | null; thc_pct: number | null; cbd_pct: number | null;
    unit_price: number | null; image_url: string | null; effects: string | null;
    terpenes: string | null; is_new: boolean; is_doh_compliant: boolean;
  }>).map((r) => ({
    id: r.id, name: r.name, brand: r.brand, category: r.category,
    strainType: r.strain_type, thcPct: r.thc_pct, cbdPct: r.cbd_pct,
    unitPrice: r.unit_price, imageUrl: r.image_url, effects: r.effects,
    terpenes: r.terpenes, isNew: r.is_new, isDohCompliant: r.is_doh_compliant,
  }));

  const scored: ScoredProduct[] = [];
  for (const product of candidates) {
    const s = scoreProduct(product, strain, opts.graph, opts.strainsBySlug);
    if (s) scored.push(s);
  }

  return rankStrainMatches(scored, { limit: opts.limit });
});

// ─── Pick of the Week (Ship 0.2 of Strain Tree autonomous arc) ────────
// Operator-curated row from inv-App's /admin/curation/pick-of-week. Public
// hero rail reads the latest week_of for THIS store. Flag-gated on the
// reader side via PICK_OF_THE_WEEK_ENABLED — when OFF, the page-level
// component returns null and the section unmounts entirely.

export type StrainPickOfWeek = {
  strainName: string;
  strainSlug: string;
  editorialNote: string;
  budtenderName: string;
  weekOf: string; // YYYY-MM-DD
};

export const getCurrentStrainPickOfWeek = cache(async (): Promise<StrainPickOfWeek | null> => {
  // Flag-gate read at this layer too — saves a Neon round-trip on the
  // 99% case where the flag is OFF in production.
  if ((process.env.PICK_OF_THE_WEEK_ENABLED ?? "").toLowerCase() !== "true") {
    return null;
  }

  const sql = getClient();
  try {
    // Greenlife-web is the Wenatchee public site → store_id='wen'.
    // Take the newest pick whose week_of is <= today.
    const rows = await sql`
      SELECT
        s.name AS strain_name,
        s.slug AS strain_slug,
        p.editorial_note AS editorial_note,
        p.budtender_name AS budtender_name,
        p.week_of::text AS week_of
      FROM strain_picks_of_the_week p
      INNER JOIN strains s ON s.id = p.strain_id
      WHERE p.store_id = 'wen'
        AND p.week_of <= CURRENT_DATE
      ORDER BY p.week_of DESC
      LIMIT 1
    `;
    if (!rows || rows.length === 0) return null;
    const r = rows[0] as {
      strain_name: string;
      strain_slug: string;
      editorial_note: string;
      budtender_name: string;
      week_of: string;
    };
    return {
      strainName: r.strain_name,
      strainSlug: r.strain_slug,
      editorialNote: r.editorial_note,
      budtenderName: r.budtender_name,
      weekOf: r.week_of,
    };
  } catch (err) {
    // Defensive: a missing table (early in the inv-App migration window)
    // or a transient Neon hiccup should NEVER take down the home page.
    // PII guard: err.name only (Drizzle echoes bound params in err.message).
    // eslint-disable-next-line no-console
    console.error(
      `[strain-pick-of-week] read failed err=${err instanceof Error ? err.name : "unknown"}`,
    );
    return null;
  }
});
