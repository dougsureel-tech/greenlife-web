import { NextRequest, NextResponse } from "next/server";
import { updateHeroesAttest } from "@/lib/portal";
import { getPortalUserForRequest } from "@/lib/portal-request";

const VALID_TYPES = ["active_military", "veteran", "first_responder", "healthcare", "k12_teacher"] as const;

export async function POST(req: NextRequest) {
  // Phase 2/3 Step A — resolve via phone-OTP session first, Clerk fallback.
  // Mirrors /account/heroes (page) so a phone-logged-in customer can both VIEW
  // and SUBMIT the heroes form (previously the page resolved by phone but this
  // write still required Clerk → load-but-can't-submit). Writes to the user's
  // OWN portal row only (portalUser.id).
  const { user: portalUser } = await getPortalUserForRequest();
  if (!portalUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    await updateHeroesAttest(portalUser.id, cleanType);
    return NextResponse.json({ ok: true });
  } catch (err) {
    // Format-only — Clerk SDK errors echo the user object (email, fullName,
    // emailAddresses[]) and the heroes-discount type (military / first-
    // responder / educator) — customer PII the dispensary shouldn't be
    // logging in plaintext to non-isolated infrastructure.
    const reason = err instanceof Error ? err.name : "unknown";
    console.error(`[heroes] update failed: ${reason}`);
    return NextResponse.json({ error: "Couldn't save. Try again." }, { status: 500 });
  }
}
