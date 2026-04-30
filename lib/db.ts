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

function getClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { neon } = require("@neondatabase/serverless");
  return neon(url) as (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>;
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
    id: string; name: string; brand: string | null; category: string | null;
    strain_type: string | null; thc_pct: number | null; cbd_pct: number | null;
    unit_price: number | null; image_url: string | null; effects: string | null; terpenes: string | null;
  }>;
}
