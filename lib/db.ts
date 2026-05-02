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
  const rows = await sql`
    SELECT
      p.id, p.name, p.brand, p.category, p.strain_type,
      p.thc_pct::float AS thc_pct, p.cbd_pct::float AS cbd_pct,
      p.unit_price::float AS unit_price, p.image_url, p.effects, p.terpenes,
      COALESCE(fs.first_seen >= NOW() - INTERVAL '7 days', FALSE) AS is_new
    FROM products p
    LEFT JOIN (
      SELECT product_id, MIN(captured_at) AS first_seen
      FROM inventory_snapshots
      WHERE quantity_on_hand > 0
      GROUP BY product_id
    ) fs ON fs.product_id = p.id
    WHERE p.carry_status != 'discontinued'
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
  const rows = await sql`
    SELECT
      p.id, p.name, p.brand, p.category, p.strain_type,
      p.thc_pct::float AS thc_pct, p.cbd_pct::float AS cbd_pct,
      p.unit_price::float AS unit_price, p.image_url, p.effects, p.terpenes,
      COALESCE(fs.first_seen >= NOW() - INTERVAL '7 days', FALSE) AS is_new
    FROM products p
    LEFT JOIN (
      SELECT product_id, MIN(captured_at) AS first_seen
      FROM inventory_snapshots
      WHERE quantity_on_hand > 0
      GROUP BY product_id
    ) fs ON fs.product_id = p.id
    WHERE p.id = ANY(${ids}::text[])
      AND p.carry_status != 'discontinued'
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
  const rows = await sql`
    SELECT id, name, brand, category, strain_type,
      thc_pct::float AS thc_pct, cbd_pct::float AS cbd_pct,
      unit_price::float AS unit_price, image_url, effects, terpenes,
      FALSE AS is_new
    FROM products
    WHERE carry_status = 'active' AND unit_price IS NOT NULL AND image_url IS NOT NULL
    ORDER BY updated_at DESC
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
      SELECT id, name, brand, category, strain_type,
        thc_pct::float AS thc_pct, cbd_pct::float AS cbd_pct,
        unit_price::float AS unit_price, image_url, effects, terpenes,
        FALSE AS is_new
      FROM products
      WHERE carry_status = 'active' AND unit_price IS NOT NULL
      ORDER BY updated_at DESC
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
// Sorted by day-of-week first (always-on rises to top) then end-date
// ascending; LIMIT bumped to 8 so the always-on duo + a 3-deal weekday all
// show on the /deals card list without a second-page roll.
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
    ORDER BY day_of_week NULLS FIRST, end_date NULLS LAST, name
    LIMIT 8
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
  const rows = await sql`
    SELECT id, name, brand, category, strain_type,
      thc_pct::float AS thc_pct, cbd_pct::float AS cbd_pct,
      unit_price::float AS unit_price, image_url, effects, terpenes
    FROM products
    WHERE carry_status = 'active'
      AND unit_price IS NOT NULL AND unit_price > 0
      AND image_url IS NOT NULL
      AND category ILIKE ${pat}
    ORDER BY updated_at DESC
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
  const rows = await sql`
    SELECT
      v.id,
      v.name,
      LOWER(REGEXP_REPLACE(v.name, '[^a-zA-Z0-9]+', '-', 'g')) AS slug,
      v.website,
      v.logo_url,
      v.image_source,
      v.notes,
      COUNT(p.id) FILTER (WHERE p.carry_status != 'discontinued')::int AS active_skus
    FROM vendors v
    LEFT JOIN products p ON p.vendor_id = v.id
    GROUP BY v.id
    HAVING COUNT(p.id) FILTER (WHERE p.carry_status != 'discontinued') > 0
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
  }));
}

export async function getBrandBySlug(slug: string): Promise<VendorBrand | null> {
  const sql = getClient();
  const rows = await sql`
    SELECT
      v.id,
      v.name,
      LOWER(REGEXP_REPLACE(v.name, '[^a-zA-Z0-9]+', '-', 'g')) AS slug,
      v.website,
      v.logo_url,
      v.image_source,
      v.notes,
      COUNT(p.id) FILTER (WHERE p.carry_status != 'discontinued')::int AS active_skus
    FROM vendors v
    LEFT JOIN products p ON p.vendor_id = v.id
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
  };
}

export async function getBrandProducts(vendorId: string) {
  const sql = getClient();
  const rows = await sql`
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
    WHERE p.vendor_id = ${vendorId}
      AND p.carry_status != 'discontinued'
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
