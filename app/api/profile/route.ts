import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreatePortalUser, updatePortalUser, updateHeroesAttest } from "@/lib/portal";

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

  const { name, phone, smsOptIn, emailOptIn, noSubstitutePref, heroesSelfAttestType } = body as Record<string, unknown>;

  const cleanName = typeof name === "string" ? name.trim().slice(0, 100) : undefined;
  const cleanPhone = typeof phone === "string" ? phone.replace(/[^\d+()\s-]/g, "").slice(0, 20) : undefined;
  const cleanSmsOptIn = typeof smsOptIn === "boolean" ? smsOptIn : undefined;
  const cleanEmailOptIn = typeof emailOptIn === "boolean" ? emailOptIn : undefined;
  const cleanNoSubstitutePref = typeof noSubstitutePref === "boolean" ? noSubstitutePref : undefined;
  const VALID_HEROES = ["active_military", "veteran", "first_responder", "healthcare", "k12_teacher"];
  const cleanHeroesType: string | null | undefined =
    heroesSelfAttestType === null
      ? null
      : typeof heroesSelfAttestType === "string" && VALID_HEROES.includes(heroesSelfAttestType)
        ? heroesSelfAttestType
        : undefined;

  try {
    const user = await currentUser();
    const portalUser = await getOrCreatePortalUser(
      userId,
      user?.emailAddresses[0]?.emailAddress,
      user?.fullName,
    );
    await updatePortalUser(portalUser.id, { name: cleanName, phone: cleanPhone, smsOptIn: cleanSmsOptIn, emailOptIn: cleanEmailOptIn, noSubstitutePref: cleanNoSubstitutePref });
    if (cleanHeroesType !== undefined) {
      await updateHeroesAttest(portalUser.id, cleanHeroesType);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Profile update failed:", err);
    return NextResponse.json({ error: "Couldn't save your changes. Try again." }, { status: 500 });
  }
}
