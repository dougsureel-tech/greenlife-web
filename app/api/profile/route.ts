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

  const { name, phone, smsOptIn, emailOptIn, frequencyPref, noSubstitutePref, heroesSelfAttestType } = body as Record<string, unknown>;

  // Length-bound BEFORE the .trim() and .replace() regex — without this,
  // a 10MB name/phone payload would burn CPU on the trim/regex before
  // the .slice would cap downstream use. 200/64 are comfortable above
  // the natural human-name (~80) and formatted-phone (~20) sizes.
  const cleanName =
    typeof name === "string" && name.length <= 200 ? name.trim().slice(0, 100) : undefined;
  const cleanPhone =
    typeof phone === "string" && phone.length <= 64
      ? phone.replace(/[^\d+()\s-]/g, "").slice(0, 20)
      : undefined;
  const cleanSmsOptIn = typeof smsOptIn === "boolean" ? smsOptIn : undefined;
  const cleanEmailOptIn = typeof emailOptIn === "boolean" ? emailOptIn : undefined;
  const VALID_FREQ = ["low", "standard", "high"] as const;
  const cleanFrequencyPref: "low" | "standard" | "high" | undefined =
    typeof frequencyPref === "string" && (VALID_FREQ as readonly string[]).includes(frequencyPref)
      ? (frequencyPref as "low" | "standard" | "high")
      : undefined;
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
    await updatePortalUser(portalUser.id, { name: cleanName, phone: cleanPhone, smsOptIn: cleanSmsOptIn, emailOptIn: cleanEmailOptIn, frequencyPref: cleanFrequencyPref, noSubstitutePref: cleanNoSubstitutePref });
    if (cleanHeroesType !== undefined) {
      await updateHeroesAttest(portalUser.id, cleanHeroesType);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    // Format-only — DB errors echo the inbound payload (cleanName, phone,
    // SMS/email opt-in, heroes-discount type). Customer PII the dispensary
    // shouldn't be logging in plaintext.
    const reason = err instanceof Error ? err.name : "unknown";
    console.error(`[profile] update failed: ${reason}`);
    return NextResponse.json({ error: "Couldn't save your changes. Try again." }, { status: 500 });
  }
}
