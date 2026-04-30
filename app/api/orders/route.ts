import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreatePortalUser, placeOrder } from "@/lib/portal";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const { items, notes } = await req.json();

  if (!items?.length) return NextResponse.json({ error: "No items" }, { status: 400 });

  const portalUser = await getOrCreatePortalUser(
    userId,
    user?.emailAddresses[0]?.emailAddress,
    user?.fullName
  );

  const orderId = await placeOrder(portalUser.id, items, notes);

  return NextResponse.json({ orderId });
}
