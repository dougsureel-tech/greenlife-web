import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse, after } from "next/server";
import { getOrCreatePortalUser, placeOrder, checkAvailability } from "@/lib/portal";
import { validatePickupTime, pickupTimeToISO, STORE } from "@/lib/store";
import { sendSms, isSmsConfigured, normalizePhone } from "@/lib/sms";
import { sendOrderConfirmationEmail } from "@/lib/order-confirmation-email";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { items, notes, pickupTime } = body as { items?: unknown; notes?: unknown; pickupTime?: unknown };

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
    );

    // Confirmation SMS — fires after response is sent so the customer never
    // waits on Twilio. No-ops if SMS isn't configured, the user has no phone,
    // or the user explicitly turned off SMS in their profile (TCPA — even
    // transactional messages must respect the opt-out flag for cannabis
    // partners under heightened scrutiny).
    const pickupLabel = new Date(pickupISO).toLocaleTimeString("en-US", {
      timeZone: "America/Los_Angeles",
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
        });
      });
    }

    return NextResponse.json({ orderId });
  } catch (err) {
    console.error("Order placement failed:", err);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
