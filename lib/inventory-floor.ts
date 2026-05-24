import "server-only";
import { getClient } from "./db";

/**
 * latestFloorOnHand — read current "on sales floor + actually in stock"
 * count for one or many products from the inv-App's per-store Neon DB.
 *
 * Filters: stock_zone='floor' AND quantity_on_hand > 0.
 *
 * Fallback safety net: if the stock_zone column doesn't exist yet (a
 * Vercel build race during the inv-App migration rollout where Wen and
 * SEA inv-App builds finish at different times), catch SQLSTATE 42703
 * (undefined_column) and fall back to legacy any-zone-latest. Since
 * backfill assigns all existing rows 'floor', the fallback returns
 * semantically-identical results during the transition window.
 *
 * See PLAN_TWO_BUCKET_INVENTORY_2026_05_24.md §10 4th-expert blocker #2.
 *
 * Returns a Map keyed by product_id with the latest floor on-hand count
 * (number). Products not present in the result map have either: no
 * snapshot rows at all, or no floor-zone snapshot with qty > 0.
 *
 * Callers should treat a missing entry as zero floor stock (not "unknown")
 * — the public menu pre-existing semantics already treat unstocked-product
 * = hidden, which is the correct behavior post-floor-filter as well.
 */
export async function latestFloorOnHand(
  productIds: string[],
): Promise<Map<string, number>> {
  if (productIds.length === 0) return new Map();
  const sql = getClient();
  try {
    const rows = await sql`
      SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::float AS qty
      FROM inventory_snapshots
      WHERE product_id = ANY(${productIds}::text[])
        AND stock_zone = 'floor'
        AND quantity_on_hand > 0
      ORDER BY product_id, captured_at DESC
    `;
    return new Map(
      rows.map((r) => [r.product_id as string, Number(r.qty)]),
    );
  } catch (err) {
    if (isUndefinedColumnError(err)) {
      // Column-missing fallback: pre-migration window or sister Vercel
      // build still in flight. Read latest-any-zone with qty>0 — equivalent
      // to floor for the duration of the rollout (backfill made every
      // pre-existing row floor by definition).
      const rows = await sql`
        SELECT DISTINCT ON (product_id) product_id, quantity_on_hand::float AS qty
        FROM inventory_snapshots
        WHERE product_id = ANY(${productIds}::text[])
          AND quantity_on_hand > 0
        ORDER BY product_id, captured_at DESC
      `;
      return new Map(
        rows.map((r) => [r.product_id as string, Number(r.qty)]),
      );
    }
    throw err;
  }
}

/**
 * Detects Postgres SQLSTATE 42703 (undefined_column) errors thrown by
 * `@neondatabase/serverless`. Used to gate the column-missing fallback
 * during the brief two-store deploy window when the `stock_zone` column
 * exists on one Neon DB but not the other.
 *
 * Strict-shape check: must be a non-null object with a `code` property
 * whose value is the literal string "42703". Rejects null, undefined,
 * primitives, plain objects without `code`, and the numeric form 42703
 * (Postgres SQLSTATE is always a 5-char string).
 */
export function isUndefinedColumnError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === "42703"
  );
}
