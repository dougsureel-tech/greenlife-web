import "server-only";

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
  const rows = await sql`
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
      COALESCE(fs.first_seen >= NOW() - INTERVAL '7 days', FALSE) AS is_new
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
  `;
  return rows.map((r) => ({
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
    isNew: Boolean(r.is_new),
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
  const rows = await sql`
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
      COALESCE(fs.first_seen >= NOW() - INTERVAL '7 days', FALSE) AS is_new
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
  `;
  return rows.map((r) => ({
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
    isNew: Boolean(r.is_new),
  }));
}

export async function getFeaturedProducts(limit = 8): Promise<MenuProduct[]> {
  const sql = getClient();
  // Bug fix 2026-05-04 (round 3): extends brands_with_recent_sales gate
  // so the home-page featured carousel doesn't surface leaked-brand SKUs.
  const rows = await sql`
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
      FALSE AS is_new
    FROM products p
    INNER JOIN latest_inv li ON li.product_id = p.id
    INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
    WHERE p.carry_status = 'active'
      AND p.unit_price IS NOT NULL
      AND p.image_url IS NOT NULL
      AND li.qty > 0
    ORDER BY p.updated_at DESC
    LIMIT ${limit}
  `;
  const mapped = rows.map((r) => ({
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
  }));
  if (mapped.length < 4) {
    const fallback = await sql`
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
        FALSE AS is_new
      FROM products p
      INNER JOIN latest_inv li ON li.product_id = p.id
      INNER JOIN brands_with_recent_sales bws ON bws.vendor_id = p.vendor_id
      WHERE p.carry_status = 'active'
        AND p.unit_price IS NOT NULL
        AND li.qty > 0
      ORDER BY p.updated_at DESC
      LIMIT ${limit}
    `;
    return fallback.map((r) => ({
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
  name: string;
  description: string | null;
  discountType: "percent" | "dollars";
  discountValue: number | null;
  appliesTo: string | null;
  endDate: string | null;
  /** Pretty short label, e.g. "20% off flower". */
  short: string;
};

// Active deals — status = 'active', today is within the start/end window,
// AND either always-active (day_of_week IS NULL) or day_of_week matches
// today's Pacific-time DOW (0=Sun..6=Sat). DOW filter runs server-side so
// the WA-day-of-week is consistent regardless of the visitor's clock.
//
// Order: today's day-specific deals FIRST (so the daily-deal mailer headline
// always wins above always-on / loyalty-stacker / senior-10 / etc.), then
// always-on, sorted within each tier by end_date ascending then name. LIMIT
// 20 because pre-existing accumulated always-on deals (industry-20, first-
// online-15, loyalty-stacker, senior-10, vet-mil-10) plus the seed mailer
// (2 always-on + 3 daily) easily exceed any tighter cap.
export async function getActiveDeals(): Promise<ActiveDeal[]> {
  const sql = getClient();
  const rows = await sql`
    SELECT
      id, name, description, discount_type, discount_value::float AS discount_value,
      applies_to, end_date::text AS end_date
    FROM deals
    WHERE status = 'active'
      AND (start_date IS NULL OR start_date <= CURRENT_DATE)
      AND (end_date IS NULL OR end_date >= CURRENT_DATE)
      AND (day_of_week IS NULL OR day_of_week = EXTRACT(DOW FROM (now() AT TIME ZONE 'America/Los_Angeles'))::smallint)
    ORDER BY (day_of_week IS NULL) ASC, end_date NULLS LAST, name
    LIMIT 20
  `;
  return rows.map((r) => {
    const dt = (r.discount_type as string) === "dollars" ? "dollars" : "percent";
    const val = (r.discount_value ?? null) as number | null;
    const applies = (r.applies_to ?? null) as string | null;
    let short: string;
    if (val == null) {
      short = r.name as string;
    } else if (dt === "percent") {
      short = `${val}% off${applies && applies !== "all" ? ` ${applies}` : ""}`;
    } else {
      short = `$${val.toFixed(0)} off${applies && applies !== "all" ? ` ${applies}` : ""}`;
    }
    return {
      id: r.id as string,
      name: r.name as string,
      description: (r.description ?? null) as string | null,
      discountType: dt,
      discountValue: val,
      appliesTo: applies,
      endDate: (r.end_date ?? null) as string | null,
      short,
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
  const rows = await sql`
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
      p.unit_price::float AS unit_price, p.image_url, p.effects, p.terpenes
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
  `;
  return rows.map((r) => ({
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
  }));
}

// Single-deal lookup for the /deals/[id] deep page (SMS-shareable).
// Honors the same active-window filter as getActiveDeals so a stale/expired
// share link 404s instead of showing an old promo.
export async function getDealById(id: string): Promise<ActiveDeal | null> {
  const sql = getClient();
  const rows = await sql`
    SELECT
      id, name, description, discount_type, discount_value::float AS discount_value,
      applies_to, end_date::text AS end_date
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
  let short: string;
  if (val == null) {
    short = r.name as string;
  } else if (dt === "percent") {
    short = `${val}% off${applies && applies !== "all" ? ` ${applies}` : ""}`;
  } else {
    short = `$${val.toFixed(0)} off${applies && applies !== "all" ? ` ${applies}` : ""}`;
  }
  return {
    id: r.id as string,
    name: r.name as string,
    description: (r.description ?? null) as string | null,
    discountType: dt,
    discountValue: val,
    appliesTo: applies,
    endDate: (r.end_date ?? null) as string | null,
    short,
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
  const rows = await sql`
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
  `;
  return rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
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

export async function getBrandBySlug(slug: string): Promise<VendorBrand | null> {
  const sql = getClient();
  // Bug fix 2026-05-04 (round 2): adds same brands_with_recent_sales
  // gate as getActiveBrands. Direct /brands/abs-buds visit returns null →
  // page 404s instead of rendering an empty-products page or worse, a
  // hand-authored brand override component for a brand we don't carry.
  const rows = await sql`
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
  `;
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    id: r.id as string,
    name: r.name as string,
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

export async function getBrandProducts(vendorId: string) {
  const sql = getClient();
  // Bug fix 2026-05-04 (round 3): the brand-level gate at getBrandBySlug
  // already prevents this function from being called for leaked brands
  // (the page 404s before reaching here). But add the same product-level
  // sales guard for defense-in-depth — if a future surface calls this
  // bypassing the brand filter, we still don't render leaked SKUs.
  const rows = await sql`
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
  `;
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
