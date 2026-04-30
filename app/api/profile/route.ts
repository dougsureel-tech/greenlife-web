import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreatePortalUser, updatePortalUser } from "@/lib/portal";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();
  const { name, phone, smsOptIn } = await req.json();

  const portalUser = await getOrCreatePortalUser(userId, user?.emailAddresses[0]?.emailAddress, user?.fullName);
  await updatePortalUser(portalUser.id, { name, phone, smsOptIn });

  return NextResponse.json({ ok: true });
}
