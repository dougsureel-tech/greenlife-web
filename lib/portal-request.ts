import "server-only";

import { cookies } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs/server";
import { readRewardsSession, REWARDS_COOKIE_NAME } from "./rewards-session";
import { normalizeToE164 } from "./sms";
import {
  getOrCreatePortalUser,
  getOrCreatePortalUserByPhone,
  type PortalUser,
} from "./portal";

// Phase 2/3 Step A — single request-scoped resolver for the customer's
// portal_users row. Collapses the storefront's two logins onto one helper:
//   1. PHONE-FIRST: if a valid phone-OTP rewards-session cookie is present,
//      resolve by E.164 phone via getOrCreatePortalUserByPhone (migration 0505
//      foundation). This is the identity that matches the customer's real
//      identity (Jane + POS customers + SMS rail).
//   2. CLERK-FALLBACK: otherwise fall back to the legacy Clerk account
//      (getOrCreatePortalUser by clerk_user_id) so nothing regresses for
//      already-Clerk-signed-in customers during the grace window.
//
// Consumed by the read-only /account surfaces first (heroes, profile,
// tree-growth, wrapped, oral-history). State-change + money routes
// (/api/orders, welcome-email on /account) migrate later with Doug sign-off.
//
// Priority is phone > Clerk deliberately: a live phone-OTP session is the
// newer, explicit identity the customer just authenticated. No PII is logged
// (WSLCB 🟡 customer surface).

export type PortalUserSource = "phone-session" | "clerk-auth" | "none";

export async function getPortalUserForRequest(): Promise<{
  user: PortalUser | null;
  source: PortalUserSource;
}> {
  // 1. Phone-OTP rewards session (the customer's real identity).
  const cookieStore = await cookies();
  const session = readRewardsSession(cookieStore.get(REWARDS_COOKIE_NAME)?.value);
  if (session?.phone) {
    // session.phone is already E.164 (the session validator requires a leading
    // "+"); normalize defensively so the partial-unique phone index dedupes.
    const user = await getOrCreatePortalUserByPhone(normalizeToE164(session.phone));
    return { user, source: "phone-session" };
  }

  // 2. Legacy Clerk account (grace-window fallback).
  const { userId } = await auth();
  if (userId) {
    const clerkUser = await currentUser();
    const user = await getOrCreatePortalUser(
      userId,
      clerkUser?.emailAddresses[0]?.emailAddress,
      clerkUser?.fullName,
    );
    return { user, source: "clerk-auth" };
  }

  return { user: null, source: "none" };
}
