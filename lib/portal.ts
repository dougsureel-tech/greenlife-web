import "server-only";
import { getClient } from "./db";

export type PortalUser = {
  id: string;
  clerkUserId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  loyaltyPoints: number;
  smsOptIn: boolean;
};

export type OnlineOrder = {
  id: string;
  status: "pending" | "preparing" | "ready" | "picked_up" | "cancelled";
  subtotal: number;
  itemCount: number;
  notes: string | null;
  placedAt: string;
  readyAt: string | null;
  pickedUpAt: string | null;
  pickupTime: string | null;
  items: OrderItem[];
};

export type OrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  brand: string | null;
  category: string | null;
  strainType: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export async function getOrCreatePortalUser(
  clerkUserId: string,
  email?: string | null,
  name?: string | null,
): Promise<PortalUser> {
  const sql = getClient();
  const existing = await sql`
    SELECT id, clerk_user_id, name, email, phone, loyalty_points, sms_opt_in
    FROM portal_users WHERE clerk_user_id = ${clerkUserId} LIMIT 1
  `;
  if (existing[0]) return mapPortalUser(existing[0]);

  const id = crypto.randomUUID();
  const rows = await sql`
    INSERT INTO portal_users (id, clerk_user_id, name, email)
    VALUES (${id}, ${clerkUserId}, ${name ?? null}, ${email ?? null})
    ON CONFLICT (clerk_user_id) DO UPDATE SET
      name = COALESCE(portal_users.name, EXCLUDED.name),
      email = COALESCE(portal_users.email, EXCLUDED.email),
      updated_at = now()
    RETURNING id, clerk_user_id, name, email, phone, loyalty_points, sms_opt_in
  `;
  return mapPortalUser(rows[0]);
}

export async function updatePortalUser(
  id: string,
  data: { name?: string; phone?: string; smsOptIn?: boolean },
) {
  const sql = getClient();
  await sql`
    UPDATE portal_users SET
      name = COALESCE(${data.name ?? null}, name),
      phone = COALESCE(${data.phone ?? null}, phone),
      sms_opt_in = COALESCE(${data.smsOptIn ?? null}, sms_opt_in),
      updated_at = now()
    WHERE id = ${id}
  `;
}

// Single-order fetch for the confirmation page. Requires the requesting
// portalUserId to match so customers can't view each other's orders.
export async function getOrder(
  orderId: string,
  portalUserId: string,
): Promise<(OnlineOrder & { pickupTime: string | null }) | null> {
  const sql = getClient();
  const rows = await sql`
    SELECT o.id, o.status,
      COALESCE(o.order_total, o.subtotal, 0)::float AS subtotal,
      COALESCE(o.item_count, 0)::int AS item_count,
      o.notes,
      COALESCE(o.placed_at, o.received_at, o.created_at) AS placed_at,
      o.ready_at,
      COALESCE(o.picked_up_at, o.fulfilled_at) AS picked_up_at,
      o.pickup_time
    FROM online_orders o
    WHERE o.id = ${orderId} AND o.portal_user_id = ${portalUserId}
    LIMIT 1
  `;
  if (!rows[0]) return null;

  const items = await sql`
    SELECT * FROM online_order_items WHERE order_id = ${orderId}
  `;

  const r = rows[0];
  return {
    id: r.id as string,
    status: (r.status as OnlineOrder["status"]) ?? "pending",
    subtotal: r.subtotal as number,
    itemCount: r.item_count as number,
    notes: r.notes as string | null,
    placedAt: r.placed_at ? (r.placed_at as Date).toISOString() : new Date(0).toISOString(),
    readyAt: r.ready_at ? (r.ready_at as Date).toISOString() : null,
    pickedUpAt: r.picked_up_at ? (r.picked_up_at as Date).toISOString() : null,
    pickupTime: r.pickup_time ? (r.pickup_time as Date).toISOString() : null,
    items: items.map(mapOrderItem),
  };
}

export async function getOrders(portalUserId: string): Promise<OnlineOrder[]> {
  const sql = getClient();
  const orders = await sql`
    SELECT o.id, o.status,
      COALESCE(o.order_total, o.subtotal, 0)::float AS subtotal,
      COALESCE(o.item_count, 0)::int AS item_count,
      o.notes,
      COALESCE(o.placed_at, o.received_at, o.created_at) AS placed_at,
      o.ready_at,
      COALESCE(o.picked_up_at, o.fulfilled_at) AS picked_up_at,
      o.pickup_time
    FROM online_orders o
    WHERE o.portal_user_id = ${portalUserId}
    ORDER BY COALESCE(o.placed_at, o.received_at, o.created_at) DESC NULLS LAST
    LIMIT 50
  `;
  if (!orders.length) return [];

  const orderIds = orders.map((o) => o.id as string);
  const items = await sql`
    SELECT i.*, i.order_id
    FROM online_order_items i
    WHERE i.order_id = ANY(${orderIds}::text[])
  `;

  const itemsByOrder = new Map<string, OrderItem[]>();
  for (const item of items) {
    const orderId = item.order_id as string;
    if (!itemsByOrder.has(orderId)) itemsByOrder.set(orderId, []);
    itemsByOrder.get(orderId)!.push(mapOrderItem(item));
  }

  return orders.map((o) => ({
    id: o.id as string,
    status: (o.status as OnlineOrder["status"]) ?? "pending",
    subtotal: o.subtotal as number,
    itemCount: o.item_count as number,
    notes: o.notes as string | null,
    placedAt: o.placed_at ? (o.placed_at as Date).toISOString() : new Date(0).toISOString(),
    readyAt: o.ready_at ? (o.ready_at as Date).toISOString() : null,
    pickedUpAt: o.picked_up_at ? (o.picked_up_at as Date).toISOString() : null,
    pickupTime: o.pickup_time ? (o.pickup_time as Date).toISOString() : null,
    items: itemsByOrder.get(o.id as string) ?? [],
  }));
}

export type AvailabilityIssue = {
  productId: string;
  productName: string;
  requested: number;
  onHand: number;
  reason: "out_of_stock" | "insufficient" | "discontinued" | "unknown";
};

// Validate cart items against current inventory before placement. Returns
// an empty array when everything's available. Items without productId are
// skipped — they're text-only menu lines that staff will resolve at pickup.
export async function checkAvailability(
  items: Array<{ productId?: string; productName: string; quantity: number }>,
): Promise<AvailabilityIssue[]> {
  const sql = getClient();
  const ids = items.map((i) => i.productId).filter((id): id is string => !!id);
  if (ids.length === 0) return [];

  const rows = await sql`
    SELECT p.id, p.name, p.carry_status,
      COALESCE(snap.qty, 0)::float AS on_hand
    FROM products p
    LEFT JOIN LATERAL (
      SELECT quantity_on_hand::numeric AS qty FROM inventory_snapshots
      WHERE product_id = p.id
      ORDER BY captured_at DESC LIMIT 1
    ) snap ON TRUE
    WHERE p.id = ANY(${ids}::text[])
  `;

  const byId = new Map(rows.map((r) => [r.id as string, r]));
  const issues: AvailabilityIssue[] = [];
  for (const item of items) {
    if (!item.productId) continue;
    const row = byId.get(item.productId);
    if (!row) {
      issues.push({
        productId: item.productId,
        productName: item.productName,
        requested: item.quantity,
        onHand: 0,
        reason: "unknown",
      });
      continue;
    }
    if ((row.carry_status as string) === "discontinued") {
      issues.push({
        productId: item.productId,
        productName: item.productName,
        requested: item.quantity,
        onHand: 0,
        reason: "discontinued",
      });
      continue;
    }
    const onHand = row.on_hand as number;
    if (onHand <= 0) {
      issues.push({
        productId: item.productId,
        productName: row.name as string,
        requested: item.quantity,
        onHand: 0,
        reason: "out_of_stock",
      });
    } else if (onHand < item.quantity) {
      issues.push({
        productId: item.productId,
        productName: row.name as string,
        requested: item.quantity,
        onHand,
        reason: "insufficient",
      });
    }
  }
  return issues;
}

export async function placeOrder(
  portalUserId: string,
  items: Array<{
    productId?: string;
    productName: string;
    brand?: string;
    category?: string;
    strainType?: string;
    unitPrice: number;
    quantity: number;
  }>,
  notes?: string,
  pickupTimeISO?: string,
): Promise<string> {
  const sql = getClient();
  const orderId = crypto.randomUUID();

  // Re-fetch authoritative unit_price for every item with a productId,
  // because the cart's `unitPrice` is client-supplied and a tampered
  // request could place a $200 order at $0.01. Items without a productId
  // are text-only menu lines (rare; staff resolve at pickup) — those keep
  // the supplied price.
  const productIds = items.map((i) => i.productId).filter((id): id is string => !!id);
  const priceById = new Map<string, number>();
  if (productIds.length > 0) {
    const rows = await sql`
      SELECT id, unit_price::float AS unit_price
      FROM products
      WHERE id = ANY(${productIds}::text[])
    `;
    for (const r of rows) {
      const price = r.unit_price as number | null;
      if (price != null) priceById.set(r.id as string, price);
    }
  }
  const pricedItems = items.map((i) => {
    if (i.productId && priceById.has(i.productId)) {
      return { ...i, unitPrice: priceById.get(i.productId)! };
    }
    return i;
  });

  const subtotal = pricedItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const itemCount = pricedItems.reduce((sum, i) => sum + i.quantity, 0);

  // Pull portal user info so the staff queue shows the customer's name + how
  // to reach them, instead of "Unknown customer".
  const userRows = await sql`
    SELECT name, email, phone FROM portal_users WHERE id = ${portalUserId} LIMIT 1
  `;
  const u = userRows[0] ?? {};
  const customerName = (u.name as string | null) ?? null;
  const customerEmail = (u.email as string | null) ?? null;
  const customerPhone = (u.phone as string | null) ?? null;

  await sql`
    INSERT INTO online_orders (
      id, portal_user_id, status, order_total, item_count, items, notes, source,
      pickup_time, customer_name, customer_email, customer_phone
    )
    VALUES (
      ${orderId},
      ${portalUserId},
      'pending',
      ${subtotal},
      ${itemCount},
      ${JSON.stringify(pricedItems)},
      ${notes ?? null},
      'portal',
      ${pickupTimeISO ?? null},
      ${customerName},
      ${customerEmail},
      ${customerPhone}
    )
  `;

  for (const item of pricedItems) {
    const itemId = crypto.randomUUID();
    await sql`
      INSERT INTO online_order_items (id, order_id, product_id, product_name, brand, category, strain_type, unit_price, quantity, line_total)
      VALUES (
        ${itemId}, ${orderId},
        ${item.productId ?? null}, ${item.productName},
        ${item.brand ?? null}, ${item.category ?? null}, ${item.strainType ?? null},
        ${item.unitPrice}, ${item.quantity}, ${item.unitPrice * item.quantity}
      )
    `;
  }

  return orderId;
}

function mapPortalUser(r: Record<string, unknown>): PortalUser {
  return {
    id: r.id as string,
    clerkUserId: r.clerk_user_id as string,
    name: r.name as string | null,
    email: r.email as string | null,
    phone: r.phone as string | null,
    loyaltyPoints: (r.loyalty_points as number) ?? 0,
    smsOptIn: (r.sms_opt_in as boolean) ?? false,
  };
}

function mapOrderItem(r: Record<string, unknown>): OrderItem {
  return {
    id: r.id as string,
    productId: r.product_id as string | null,
    productName: r.product_name as string,
    brand: r.brand as string | null,
    category: r.category as string | null,
    strainType: r.strain_type as string | null,
    unitPrice: parseFloat(r.unit_price as string),
    quantity: r.quantity as number,
    lineTotal: parseFloat(r.line_total as string),
  };
}
