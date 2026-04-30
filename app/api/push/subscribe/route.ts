import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreatePortalUser, savePushSubscription } from "@/lib/portal";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const sub = await req.json();

  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const portalUser = await getOrCreatePortalUser(
    userId,
    user?.emailAddresses[0]?.emailAddress,
    user?.fullName
  );

  await savePushSubscription(portalUser.id, {
    endpoint: sub.endpoint,
    p256dh: sub.keys.p256dh,
    auth: sub.keys.auth,
  });

  return NextResponse.json({ ok: true });
}
