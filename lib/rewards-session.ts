import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

// Read-side helper for the glw_rewards_session cookie issued by
// /api/rewards/verify-code. Used by /rewards/dashboard, /api/rewards/me,
// and any future authenticated-customer-rewards surface.
//
// Sister-port of seattle-cannabis-web/lib/rewards-session.ts — only
// divergence is the cookie name (glw_ prefix) + the session purpose tag
// (glw-rewards-v1) so a cookie minted by one store can't be replayed
// against the other even though both stores read the same DB.
//
// Layout: base64url(JSON payload) + "." + base64url(HMAC-SHA-256 sig).
// JSON shape:
//   { phone: "+15095550100",
//     issuedAt: 1715000000000,
//     expiresAt: 1717592000000,
//     purpose: "glw-rewards-v1" }

export const REWARDS_COOKIE_NAME = "glw_rewards_session";

export type RewardsSession = {
  phone: string;
  issuedAt: number;
  expiresAt: number;
  purpose: string;
};

/**
 * Verify + decode a session cookie. Returns null on any failure mode
 * (missing pieces, bad signature, wrong purpose, expired). Constant-
 * time signature compare prevents timing-based attacks.
 */
export function readRewardsSession(
  cookieValue: string | undefined,
): RewardsSession | null {
  if (!cookieValue) return null;
  const secret = process.env.DASHBOARD_SESSION_SECRET;
  if (!secret) return null;

  const parts = cookieValue.split(".");
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;

  const expected = createHmac("sha256", secret).update(encoded).digest("base64url");
  // Constant-time compare — both must be the same length first.
  if (sig.length !== expected.length) return null;
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  let payload: RewardsSession;
  try {
    payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8")) as RewardsSession;
  } catch {
    return null;
  }

  if (payload.purpose !== "glw-rewards-v1") return null;
  if (typeof payload.phone !== "string" || !payload.phone.startsWith("+")) return null;
  if (typeof payload.expiresAt !== "number" || payload.expiresAt < Date.now()) return null;

  return payload;
}
