import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreatePortalUser, updatePortalUser } from "@/lib/portal";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, phone, smsOptIn } = body as Record<string, unknown>;

  const cleanName = typeof name === "string" ? name.trim().slice(0, 100) : undefined;
  const cleanPhone = typeof phone === "string" ? phone.replace(/[^\d+()\s-]/g, "").slice(0, 20) : undefined;
  const cleanSmsOptIn = typeof smsOptIn === "boolean" ? smsOptIn : undefined;

  try {
    const user = await currentUser();
    const portalUser = await getOrCreatePortalUser(
      userId,
      user?.emailAddresses[0]?.emailAddress,
      user?.fullName,
    );
    await updatePortalUser(portalUser.id, { name: cleanName, phone: cleanPhone, smsOptIn: cleanSmsOptIn });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Profile update failed:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
