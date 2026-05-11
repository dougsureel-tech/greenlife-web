import "server-only";
import { getClient } from "./db";
import { sendPushToClerkUser } from "./push-db";
import { round2 } from "./money-math.ts";

// "Order is ready" web push — fired server-side from /account/orders +
// /order/confirmation page renders. The OrderStatusRefresh component on
// those pages polls every 45s; when staff flips an order to "ready", the
// next poll triggers a re-render which calls `notifyReadyOrders`. The
// 90-second `ready_at > NOW() - INTERVAL '90 seconds'` window means a push
// fires once shortly after the flip; subsequent renders skip it. Browser
// `tag: order-ready-{id}` collapses any duplicate fires within a session.
//
// Stateless dedupe — no extra `notified_at` column / migration required.
const READY_WINDOW_SECONDS = 90;

export type PortalUser = {
  id: string;
  clerkUserId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  loyaltyPoints: number;
  smsOptIn: boolean;
  emailOptIn: boolean;
  /** 'low' = ≤2/mo · 'standard' = ≤4/mo (default) · 'high' = ≤8/mo. See
   * inventoryapp lib/marketing-touches.ts FREQUENCY_CAPS + migration 0213. */
  frequencyPref: "low" | "standard" | "high";
  noSubstitutePref: boolean;
  heroesSelfAttestType: string | null;
};

export type OrderSubstitution = {
  originalName: string;
  subName: string;
  originalPrice?: number;
  subPrice?: number;
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
  substitutions: OrderSubstitution[];
};

// Inventoryapp's POS writes `in_progress` and `fulfilled` to online_orders.status
// (per src/app/api/pos/online-orders/[id]/route.ts), but customers see this app's
// vocabulary: `preparing` and `picked_up`. Without a mapping the UI's
// STATUS_LABEL[order.status] returns undefined and the customer's order-history
// row + confirmation timeline render blank for those two states.
function normalizeOrderStatus(raw: unknown): OnlineOrder["status"] {
  switch (raw) {
    case "in_progress":
      return "preparing";
    case "fulfilled":
      return "picked_up";
    case "pending":
    case "preparing":
    case "ready":
    case "picked_up":
    case "cancelled":
      return raw;
    default:
      return "pending";
  }
}

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
  const { user } = await getOrCreatePortalUserWithCreated(clerkUserId, email, name);
  return user;
}

/** Same as `getOrCreatePortalUser` but reports whether THIS call was the
 *  one that inserted the row. Use this when you need a once-per-account
 *  side effect (welcome email, signup analytics) — fire only when
 *  `created` is `true`. The flag derives from whether the initial SELECT
 *  found nothing AND the subsequent INSERT path took the new-row branch
 *  (Postgres `xmax = 0` on the RETURNING row distinguishes a fresh
 *  INSERT from an `ON CONFLICT DO UPDATE` outcome — handles the rare
 *  race where two parallel auth callbacks both miss the SELECT). */
export async function getOrCreatePortalUserWithCreated(
  clerkUserId: string,
  email?: string | null,
  name?: string | null,
): Promise<{ user: PortalUser; created: boolean }> {
  const sql = getClient();
  const existing = await sql`
    SELECT pu.id, pu.clerk_user_id, pu.name, pu.email, pu.phone, pu.loyalty_points, pu.sms_opt_in, pu.email_opt_in, pu.frequency_pref, pu.no_substitute_pref,
           c.heroes_self_attest_type
    FROM portal_users pu
    LEFT JOIN LATERAL (
      SELECT heroes_self_attest_type FROM customers
      WHERE LOWER(email) = LOWER(pu.email) AND pu.email IS NOT NULL
      ORDER BY last_visit_at DESC NULLS LAST LIMIT 1
    ) c ON TRUE
    WHERE pu.clerk_user_id = ${clerkUserId}
    LIMIT 1
  `;
  if (existing[0]) return { user: mapPortalUser(existing[0]), created: false };

  const id = crypto.randomUUID();
  const rows = await sql`
    INSERT INTO portal_users (id, clerk_user_id, name, email)
    VALUES (${id}, ${clerkUserId}, ${name ?? null}, ${email ?? null})
    ON CONFLICT (clerk_user_id) DO UPDATE SET
      name = COALESCE(portal_users.name, EXCLUDED.name),
      email = COALESCE(portal_users.email, EXCLUDED.email),
      updated_at = now()
    RETURNING id, clerk_user_id, name, email, phone, loyalty_points, sms_opt_in, email_opt_in, frequency_pref, no_substitute_pref,
              NULL AS heroes_self_attest_type,
              (xmax = 0) AS inserted
  `;
  const row = rows[0];
  // `inserted` is true only when the row was actually INSERTed (not when
  // ON CONFLICT DO UPDATE fired). Combined with the empty-SELECT guard
  // above this gives us a tight "first time we've ever seen this clerk
  // user" signal even under racing parallel session callbacks.
  const created = row.inserted === true;
  return { user: mapPortalUser(row), created };
}

export async function updateHeroesAttest(id: string, type: string | null) {
  const sql = getClient();
  const VALID = ["active_military", "veteran", "first_responder", "healthcare", "k12_teacher"];
  const safeType = type === null || VALID.includes(type) ? type : null;
  await sql`
    UPDATE customers SET
      heroes_self_attest_type = ${safeType}
    WHERE LOWER(email) = (SELECT LOWER(email) FROM portal_users WHERE id = ${id})
  `;
}

export async function updatePortalUser(
  id: string,
  data: { name?: string; phone?: string; smsOptIn?: boolean; emailOptIn?: boolean; frequencyPref?: "low" | "standard" | "high"; noSubstitutePref?: boolean },
) {
  const sql = getClient();
  await sql`
    UPDATE portal_users SET
      name = COALESCE(${data.name ?? null}, name),
      phone = COALESCE(${data.phone ?? null}, phone),
      sms_opt_in = COALESCE(${data.smsOptIn ?? null}, sms_opt_in),
      email_opt_in = COALESCE(${data.emailOptIn ?? null}, email_opt_in),
      frequency_pref = COALESCE(${data.frequencyPref ?? null}, frequency_pref),
      no_substitute_pref = COALESCE(${data.noSubstitutePref ?? null}, no_substitute_pref),
      updated_at = now()
    WHERE id = ${id}
  `;
  // Mirror no_substitute_pref onto the linked customers row so the POS
  // substitute route (which reads customers.no_substitute_pref) honors the
  // preference set from the customer-account profile page. Affects 0 rows
  // for online-only customers with no in-store record — safe to no-op.
  if (data.noSubstitutePref !== undefined) {
    await sql`
      UPDATE customers SET
        no_substitute_pref = ${data.noSubstitutePref}
      WHERE LOWER(email) = (SELECT LOWER(email) FROM portal_users WHERE id = ${id})
    `;
  }
}

// Defensive parser for the JSONB substitutions column. Filters out malformed
// rows so a bad value can't break the order page render.
function parseSubstitutions(raw: unknown): OrderSubstitution[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (s): s is { originalName: string; subName: string; originalPrice?: number; subPrice?: number } =>
        typeof s === "object" &&
        s !== null &&
        typeof (s as Record<string, unknown>).originalName === "string" &&
        typeof (s as Record<string, unknown>).subName === "string",
    )
    .map((s) => ({
      originalName: s.originalName,
      subName: s.subName,
      originalPrice: typeof s.originalPrice === "number" ? s.originalPrice : undefined,
      subPrice: typeof s.subPrice === "number" ? s.subPrice : undefined,
    }));
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
      o.pickup_time,
      o.substitutions
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
    status: normalizeOrderStatus(r.status),
    subtotal: r.subtotal as number,
    itemCount: r.item_count as number,
    notes: r.notes as string | null,
    placedAt: r.placed_at ? (r.placed_at as Date).toISOString() : new Date(0).toISOString(),
    readyAt: r.ready_at ? (r.ready_at as Date).toISOString() : null,
    pickedUpAt: r.picked_up_at ? (r.picked_up_at as Date).toISOString() : null,
    pickupTime: r.pickup_time ? (r.pickup_time as Date).toISOString() : null,
    items: items.map(mapOrderItem),
    substitutions: parseSubstitutions(r.substitutions),
  };
}

// Loyalty points live on `customers.loyalty_points` in the staff-side
// inventoryapp tables (POS-driven — every transaction increments). The portal
// surface bridges via email match: portal_users.email → customers.email →
// customers.loyalty_points. Returns null if the customer hasn't transacted in
// store yet (no matching customers row), so the UI can show a "join the
// loyalty program — earn 1 pt per $1 in store" prompt instead of "0 pts".
//
// 100 points = $1 redeemable — IMPLEMENTATION-LEVEL math used to compute
// `dollarValue` for the LoyaltyCard display. Doug 2026-05-07 brand-voice
// doc canonicalizes a SLIDING LADDER for marketing copy (50pt→5%, 100pt→10%,
// ..., 30% off at 300-400pt). This is intentional divergence: marketing
// copy uses the ladder, deployed dollarValue math uses linear $1/100pt
// pending Doug-decision on POS-register parity. `scripts/check-loyalty-math-
// drift.mjs` exempts this file + components/LoyaltyCard.tsx as the known
// divergence; all other customer-facing copy must use the ladder.
const POINTS_PER_DOLLAR = 100;

export type LoyaltySnapshot = {
  points: number;
  dollarValue: number;
  visitCount: number;
  lastVisitAt: string | null;
  tieredFlagOn: boolean;
  /** Lifetime post-tax spend, in dollars. Powers the tier label + progress on
   *  the customer-facing /account loyalty card. */
  lifetimeSpent: number;
};

export async function getLoyaltyForPortalUser(portalUserId: string): Promise<LoyaltySnapshot | null> {
  const sql = getClient();
  const rows = await sql`
    SELECT
      c.loyalty_points::int AS points,
      COALESCE(c.last_visit_at, c.created_at) AS last_visit_at,
      (
        SELECT COUNT(*)::int
        FROM transactions t
        WHERE t.customer_id = c.id AND t.status = 'completed'
      ) AS visit_count,
      (
        SELECT COALESCE(SUM(t.total::numeric), 0)::float
        FROM transactions t
        WHERE t.customer_id = c.id AND t.status = 'completed'
      ) AS lifetime_spent,
      COALESCE((SELECT enabled FROM feature_flags WHERE key = 'loyalty_tiered_redemption'), false) AS tiered_flag_on
    FROM portal_users pu
    JOIN customers c ON LOWER(c.email) = LOWER(pu.email)
    WHERE pu.id = ${portalUserId}
      AND pu.email IS NOT NULL
      AND c.email IS NOT NULL
    ORDER BY c.last_visit_at DESC NULLS LAST
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  const r = rows[0] as {
    points: number;
    last_visit_at: Date | null;
    visit_count: number;
    lifetime_spent: number;
    tiered_flag_on: boolean;
  };
  const points = r.points ?? 0;
  return {
    points,
    dollarValue: Math.floor(points / POINTS_PER_DOLLAR),
    visitCount: r.visit_count ?? 0,
    lastVisitAt: r.last_visit_at ? r.last_visit_at.toISOString() : null,
    tieredFlagOn: r.tiered_flag_on ?? false,
    lifetimeSpent: r.lifetime_spent ?? 0,
  };
}

export async function getLoyaltyByClerkId(clerkUserId: string): Promise<LoyaltySnapshot | null> {
  const sql = getClient();
  const rows = await sql`
    SELECT
      c.loyalty_points::int AS points,
      COALESCE(c.last_visit_at, c.created_at) AS last_visit_at,
      (
        SELECT COUNT(*)::int
        FROM transactions t
        WHERE t.customer_id = c.id AND t.status = 'completed'
      ) AS visit_count,
      (
        SELECT COALESCE(SUM(t.total::numeric), 0)::float
        FROM transactions t
        WHERE t.customer_id = c.id AND t.status = 'completed'
      ) AS lifetime_spent,
      COALESCE((SELECT enabled FROM feature_flags WHERE key = 'loyalty_tiered_redemption'), false) AS tiered_flag_on
    FROM portal_users pu
    JOIN customers c ON LOWER(c.email) = LOWER(pu.email)
    WHERE pu.clerk_user_id = ${clerkUserId}
      AND pu.email IS NOT NULL
      AND c.email IS NOT NULL
    ORDER BY c.last_visit_at DESC NULLS LAST
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  const r = rows[0] as {
    points: number;
    last_visit_at: Date | null;
    visit_count: number;
    lifetime_spent: number;
    tiered_flag_on: boolean;
  };
  const points = r.points ?? 0;
  return {
    points,
    dollarValue: Math.floor(points / POINTS_PER_DOLLAR),
    visitCount: r.visit_count ?? 0,
    lastVisitAt: r.last_visit_at ? r.last_visit_at.toISOString() : null,
    tieredFlagOn: r.tiered_flag_on ?? false,
    lifetimeSpent: r.lifetime_spent ?? 0,
  };
}

// Fire web push for any orders that just flipped to "ready" within the
// last READY_WINDOW_SECONDS for this portal user. Idempotency is handled by
// the browser's notification `tag` collapsing duplicate fires; the time-
// window keeps server-side sends bounded to one short burst per flip.
//
// Designed to be called from page-render side-effects (via after()) on
// /account/orders + /order/confirmation. Cheap when no qualifying order
// exists (single SELECT, no row → no work). Safe to call on every render.
export async function notifyReadyOrders(portalUserId: string): Promise<{ sent: number }> {
  const sql = getClient();
  const rows = await sql`
    SELECT o.id, pu.clerk_user_id, COALESCE(o.item_count, 0)::int AS item_count
    FROM online_orders o
    JOIN portal_users pu ON pu.id = o.portal_user_id
    WHERE o.portal_user_id = ${portalUserId}
      AND o.status = 'ready'
      AND o.ready_at IS NOT NULL
      AND o.ready_at > NOW() - (${READY_WINDOW_SECONDS} || ' seconds')::interval
  `;
  if (rows.length === 0) return { sent: 0 };
  let total = 0;
  for (const r of rows as unknown as { id: string; clerk_user_id: string; item_count: number }[]) {
    if (!r.clerk_user_id) continue;
    const itemNote = r.item_count > 0 ? `${r.item_count} item${r.item_count === 1 ? "" : "s"} ready` : "Ready for pickup";
    const { sent } = await sendPushToClerkUser(r.clerk_user_id, {
      title: "Your order is ready 🛍️",
      body: `${itemNote}. Bring ID and cash — see you soon.`,
      url: `/order/confirmation/${r.id}`,
      tag: `order-ready-${r.id}`,
    });
    total += sent;
  }
  return { sent: total };
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
      o.pickup_time,
      o.substitutions
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
    status: normalizeOrderStatus(o.status),
    subtotal: o.subtotal as number,
    itemCount: o.item_count as number,
    notes: o.notes as string | null,
    placedAt: o.placed_at ? (o.placed_at as Date).toISOString() : new Date(0).toISOString(),
    readyAt: o.ready_at ? (o.ready_at as Date).toISOString() : null,
    pickedUpAt: o.picked_up_at ? (o.picked_up_at as Date).toISOString() : null,
    pickupTime: o.pickup_time ? (o.pickup_time as Date).toISOString() : null,
    items: itemsByOrder.get(o.id as string) ?? [],
    substitutions: parseSubstitutions(o.substitutions),
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
  loyaltyTierPointCost?: number | null,
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

  // Loyalty tier redemption — only when flag is ON and a valid tier was requested.
  let loyaltyDiscountDollars = 0;
  let resolvedTierPointCost: number | null = null;

  if (loyaltyTierPointCost != null && customerEmail) {
    const VALID_COSTS = [50, 100, 200, 250, 300, 400];
    if (VALID_COSTS.includes(loyaltyTierPointCost)) {
      const flagRows = await sql`
        SELECT enabled FROM feature_flags WHERE key = 'loyalty_tiered_redemption' LIMIT 1
      `;
      const flagOn = (flagRows[0]?.enabled as boolean) ?? false;

      if (flagOn) {
        // Validate cliff/floor against subtotal
        const MAX_SUB: Record<number, number> = { 300: 75 };
        const MIN_SUB: Record<number, number> = { 400: 75 };
        const maxSub = MAX_SUB[loyaltyTierPointCost];
        const minSub = MIN_SUB[loyaltyTierPointCost];
        const subtotalOk =
          (maxSub == null || subtotal < maxSub) &&
          (minSub == null || subtotal >= minSub);

        if (subtotalOk) {
          const DISCOUNT_FRACTION: Record<number, number> = {
            50: 0.05, 100: 0.10, 200: 0.20, 250: 0.25, 300: 0.30, 400: 0.30,
          };
          const fraction = DISCOUNT_FRACTION[loyaltyTierPointCost] ?? 0;

          // Deduct points atomically — UPDATE only succeeds if customer has enough.
          const deductRows = await sql`
            UPDATE customers
            SET loyalty_points = loyalty_points - ${loyaltyTierPointCost}
            WHERE LOWER(email) = LOWER(${customerEmail})
              AND loyalty_points >= ${loyaltyTierPointCost}
            RETURNING id
          `;

          if (deductRows.length > 0) {
            loyaltyDiscountDollars = round2(subtotal * fraction);
            resolvedTierPointCost = loyaltyTierPointCost;
          }
        }
      }
    }
  }

  const orderTotal = Math.max(0, subtotal - loyaltyDiscountDollars);

  await sql`
    INSERT INTO online_orders (
      id, portal_user_id, status, order_total, item_count, items, notes, source,
      pickup_time, customer_name, customer_email, customer_phone,
      loyalty_redemption, loyalty_tier_point_cost
    )
    VALUES (
      ${orderId},
      ${portalUserId},
      'pending',
      ${orderTotal},
      ${itemCount},
      ${JSON.stringify(pricedItems)},
      ${notes ?? null},
      'portal',
      ${pickupTimeISO ?? null},
      ${customerName},
      ${customerEmail},
      ${customerPhone},
      ${resolvedTierPointCost != null ? loyaltyDiscountDollars : null},
      ${resolvedTierPointCost}
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
    emailOptIn: (r.email_opt_in as boolean) ?? false,
    frequencyPref: ((r.frequency_pref as string) ?? "standard") as PortalUser["frequencyPref"],
    noSubstitutePref: (r.no_substitute_pref as boolean) ?? false,
    heroesSelfAttestType: (r.heroes_self_attest_type as string | null) ?? null,
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
