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

export async function getOrCreatePortalUser(clerkUserId: string, email?: string | null, name?: string | null): Promise<PortalUser> {
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

export async function updatePortalUser(id: string, data: { name?: string; phone?: string; smsOptIn?: boolean }) {
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

export async function getOrders(portalUserId: string): Promise<OnlineOrder[]> {
  const sql = getClient();
  const orders = await sql`
    SELECT o.id, o.status,
      COALESCE(o.order_total, o.subtotal, 0)::float AS subtotal,
      COALESCE(o.item_count, 0)::int AS item_count,
      o.notes,
      COALESCE(o.placed_at, o.received_at) AS placed_at,
      o.ready_at,
      COALESCE(o.picked_up_at, o.fulfilled_at) AS picked_up_at
    FROM online_orders o
    WHERE o.portal_user_id = ${portalUserId}
    ORDER BY COALESCE(o.placed_at, o.received_at) DESC
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
    placedAt: (o.placed_at as Date).toISOString(),
    readyAt: o.ready_at ? (o.ready_at as Date).toISOString() : null,
    pickedUpAt: o.picked_up_at ? (o.picked_up_at as Date).toISOString() : null,
    items: itemsByOrder.get(o.id as string) ?? [],
  }));
}

export async function placeOrder(
  portalUserId: string,
  items: Array<{ productId?: string; productName: string; brand?: string; category?: string; strainType?: string; unitPrice: number; quantity: number }>,
  notes?: string
): Promise<string> {
  const sql = getClient();
  const orderId = crypto.randomUUID();
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  await sql`
    INSERT INTO online_orders (id, portal_user_id, status, order_total, item_count, items, notes, source)
    VALUES (
      ${orderId},
      ${portalUserId},
      'pending',
      ${subtotal},
      ${itemCount},
      ${JSON.stringify(items)},
      ${notes ?? null},
      'portal'
    )
  `;

  for (const item of items) {
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

  // Update item_count on the order
  await sql`UPDATE online_orders SET item_count = ${itemCount} WHERE id = ${orderId}`;

  return orderId;
}

export async function savePushSubscription(portalUserId: string, sub: { endpoint: string; p256dh: string; auth: string }) {
  const sql = getClient();
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO push_subscriptions (id, portal_user_id, endpoint, p256dh, auth)
    VALUES (${id}, ${portalUserId}, ${sub.endpoint}, ${sub.p256dh}, ${sub.auth})
    ON CONFLICT (endpoint) DO UPDATE SET
      portal_user_id = EXCLUDED.portal_user_id,
      p256dh = EXCLUDED.p256dh,
      auth = EXCLUDED.auth
  `;
}

export async function getPushSubscriptions(portalUserId: string) {
  const sql = getClient();
  const rows = await sql`
    SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE portal_user_id = ${portalUserId}
  `;
  return rows as Array<{ endpoint: string; p256dh: string; auth: string }>;
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
