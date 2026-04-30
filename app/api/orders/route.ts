import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreatePortalUser, placeOrder } from "@/lib/portal";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { items, notes } = body as { items?: unknown; notes?: unknown };

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "No items" }, { status: 400 });
  }
  if (items.length > 50) {
    return NextResponse.json({ error: "Too many items" }, { status: 400 });
  }

  for (const item of items) {
    const i = item as Record<string, unknown>;
    if (
      typeof item !== "object" || item === null ||
      typeof i.productName !== "string" ||
      typeof i.unitPrice !== "number" || (i.unitPrice as number) <= 0 ||
      typeof i.quantity !== "number" || (i.quantity as number) < 1 || !Number.isInteger(i.quantity)
    ) {
      return NextResponse.json({ error: "Invalid item" }, { status: 400 });
    }
  }

  const notesStr = typeof notes === "string" ? notes.slice(0, 500) : undefined;

  try {
    const user = await currentUser();
    const portalUser = await getOrCreatePortalUser(
      userId,
      user?.emailAddresses[0]?.emailAddress,
      user?.fullName
    );
    const orderId = await placeOrder(portalUser.id, items as Parameters<typeof placeOrder>[1], notesStr);
    return NextResponse.json({ orderId });
  } catch (err) {
    console.error("Order placement failed:", err);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
