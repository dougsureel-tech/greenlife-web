import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreatePortalUser, updateHeroesAttest } from "@/lib/portal";

const VALID_TYPES = ["active_military", "veteran", "first_responder", "healthcare", "k12_teacher"] as const;

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

  const { type } = body as Record<string, unknown>;
  const cleanType =
    type === null
      ? null
      : typeof type === "string" && (VALID_TYPES as readonly string[]).includes(type)
        ? type
        : undefined;

  if (cleanType === undefined) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  try {
    const user = await currentUser();
    const portalUser = await getOrCreatePortalUser(
      userId,
      user?.emailAddresses[0]?.emailAddress,
      user?.fullName,
    );
    await updateHeroesAttest(portalUser.id, cleanType);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[heroes] update failed:", err);
    return NextResponse.json({ error: "Couldn't save. Try again." }, { status: 500 });
  }
}
