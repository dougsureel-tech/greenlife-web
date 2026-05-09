import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse, after } from "next/server";
import { getOrCreatePortalUser, placeOrder, checkAvailability } from "@/lib/portal";
import { validatePickupTime, pickupTimeToISO, STORE, STORE_TZ } from "@/lib/store";
import { sendSms, isSmsConfigured, normalizePhone } from "@/lib/sms";
import { sendOrderConfirmationEmail } from "@/lib/order-confirmation-email";
import { MINUTE_MS } from "@/lib/time-constants";

// Per-user rate limit on order placement. Clerk auth gates the surface
// but each call triggers INSERT + SMS confirm + email confirm + audit.
// 5 orders per minute per user catches loop-induced fires without
// blocking legitimate quick-iterate cart workflows. Sister to scc same
// route (this wave) + inv /api/customer/orders (5/min/IP existing).
const orderRateMap = new Map<string, { count: number; resetAt: number }>();
function checkOrderRate(userId: string): boolean {
  const now = Date.now();
  const entry = orderRateMap.get(userId);
  if (!entry || entry.resetAt < now) {
    orderRateMap.set(userId, { count: 1, resetAt: now + MINUTE_MS });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!checkOrderRate(userId)) {
    return NextResponse.json(
      { error: "Too many orders. Wait a minute and try again." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { items, notes, pickupTime, loyaltyTierPointCost } = body as {
    items?: unknown;
    notes?: unknown;
    pickupTime?: unknown;
    loyaltyTierPointCost?: unknown;
  };
  const VALID_TIER_COSTS = [50, 100, 200, 250, 300, 400];
  const resolvedLoyaltyTier: number | null =
    typeof loyaltyTierPointCost === "number" && VALID_TIER_COSTS.includes(loyaltyTierPointCost)
      ? loyaltyTierPointCost
      : null;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "No items" }, { status: 400 });
  }
  if (items.length > 50) {
    return NextResponse.json({ error: "Too many items" }, { status: 400 });
  }

  for (const item of items) {
    const i = item as Record<string, unknown>;
    if (
      typeof item !== "object" ||
      item === null ||
      typeof i.productName !== "string" ||
      typeof i.unitPrice !== "number" ||
      (i.unitPrice as number) <= 0 ||
      typeof i.quantity !== "number" ||
      (i.quantity as number) < 1 ||
      (i.quantity as number) > 100 ||
      !Number.isInteger(i.quantity)
    ) {
      return NextResponse.json({ error: "Invalid item" }, { status: 400 });
    }
    // Bound string-field lengths so a malicious cart payload can't bloat
    // the per-row INSERT (online_order_items mirrors these fields). Type
    // checks above keep typeof === "string"; in-place slice clips values
    // longer than the natural cap. Cannabis product names are typically
    // <100 chars; brand <40; category <16; strain-type one of 3 words.
    if ((i.productName as string).length > 256) i.productName = (i.productName as string).slice(0, 256);
    if (typeof i.brand === "string" && (i.brand as string).length > 128) i.brand = (i.brand as string).slice(0, 128);
    if (typeof i.category === "string" && (i.category as string).length > 64) i.category = (i.category as string).slice(0, 64);
    if (typeof i.strainType === "string" && (i.strainType as string).length > 32) i.strainType = (i.strainType as string).slice(0, 32);
    if (typeof i.productId === "string" && (i.productId as string).length > 64) i.productId = (i.productId as string).slice(0, 64);
  }

  if (typeof pickupTime !== "string") {
    return NextResponse.json({ error: "Pickup time required" }, { status: 400 });
  }
  const pickupErr = validatePickupTime(pickupTime);
  if (pickupErr) return NextResponse.json({ error: pickupErr }, { status: 400 });

  const notesStr = typeof notes === "string" ? notes.slice(0, 500) : undefined;
  const pickupISO = pickupTimeToISO(pickupTime);

  try {
    const issues = await checkAvailability(items as Parameters<typeof checkAvailability>[0]);
    if (issues.length > 0) {
      return NextResponse.json(
        {
          error: "Some items aren't available — please update your cart.",
          issues,
        },
        { status: 409 },
      );
    }

    const user = await currentUser();
    const portalUser = await getOrCreatePortalUser(
      userId,
      user?.emailAddresses[0]?.emailAddress,
      user?.fullName,
    );
    const orderId = await placeOrder(
      portalUser.id,
      items as Parameters<typeof placeOrder>[1],
      notesStr,
      pickupISO,
      resolvedLoyaltyTier,
    );

    // Confirmation SMS — fires after response is sent so the customer never
    // waits on Twilio. No-ops if SMS isn't configured, the user has no phone,
    // or the user explicitly turned off SMS in their profile (TCPA — even
    // transactional messages must respect the opt-out flag for cannabis
    // partners under heightened scrutiny).
    const pickupLabel = new Date(pickupISO).toLocaleTimeString("en-US", {
      timeZone: STORE_TZ,
      hour: "numeric",
      minute: "2-digit",
    });
    if (portalUser.phone && portalUser.smsOptIn && isSmsConfigured()) {
      after(async () => {
        await sendSms(
          normalizePhone(portalUser.phone!),
          `${STORE.name}: order received! Ready for pickup at ${pickupLabel}. Bring ID + cash. Reply STOP to opt out.`,
        );
      });
    }

    // Order-confirmation email — fires AFTER the response so Resend latency
    // never blocks the customer. Gated by env var (default OFF) until Doug
    // verifies the Resend domain + flips the flag in Vercel — see
    // docs/email-infra.md. The helper additionally re-checks the env var +
    // RESEND_API_KEY + email presence (defense in depth) so this branch is
    // safe to leave unguarded once enabled. Mirrors the SMS dispatch shape
    // immediately above; we do NOT write to `customer_campaign_touches`
    // because that table lives in inventoryapp's DB and there's no clean
    // cross-DB write path from this repo (matches the existing SMS
    // pattern, which also doesn't audit-log here).
    if (
      process.env.ORDER_CONFIRMATION_EMAIL_ENABLED === "true" &&
      portalUser.email
    ) {
      const emailItems = (items as Array<Record<string, unknown>>).map((i) => ({
        productName: String(i.productName ?? ""),
        quantity: Number(i.quantity ?? 1),
        unitPrice: Number(i.unitPrice ?? 0),
      }));
      const subtotal = emailItems.reduce(
        (sum, i) => sum + i.unitPrice * i.quantity,
        0,
      );
      const firstName = portalUser.name?.trim().split(/\s+/)[0] ?? null;
      const customerEmail = portalUser.email;
      after(async () => {
        await sendOrderConfirmationEmail({
          to: customerEmail,
          firstName,
          orderId,
          items: emailItems,
          subtotal,
          pickupWindowText: pickupLabel,
          storeName: STORE.name,
          storeAddress: STORE.address.full,
          mapUrl: STORE.googleMapsUrl,
          notes: notesStr ?? null,
        });
      });
    }

    return NextResponse.json({ orderId });
  } catch (err) {
    // Format-only — order-placement errors echo the full inbound payload:
    // customer name, phone, email, items[], notes, store routing data.
    // The richest customer-PII surface in the public site. Sister of
    // v7.425 push/heroes/profile pattern.
    const reason = err instanceof Error ? err.name : "unknown";
    console.error(`[orders] placement failed: ${reason}`);
    return NextResponse.json({ error: "Couldn't place your order. Try again." }, { status: 500 });
  }
}
