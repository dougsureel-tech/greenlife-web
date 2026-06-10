// POST /api/rewards/sign-out
//
// Sister-port of seattle-cannabis-web/app/api/rewards/sign-out.
// Clears the glw_rewards_session cookie. The cookie is path-scoped to
// /rewards so this only kills rewards-side auth — Clerk-side /account
// auth is untouched (they're separate identity systems by design).

import { NextResponse } from "next/server";
import { REWARDS_COOKIE_NAME } from "@/lib/rewards-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Defensive: if NEXT_PUBLIC_SITE_URL is ever set to a *.vercel.app URL
// (drift class), fall through to canonical so the post-sign-out redirect
// never lands customers on a non-brand hostname. Sister of welcome-email
// + safe-redirect canonical patterns.
function siteOrigin(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  const FALLBACK = "https://www.greenlifecannabis.com";
  // Allow-list defense (sister of inv v337.005 + welcome-email sweep).
  // Hostname must MATCH canonical OR fall back. Deny-list-only lets
  // typo'd subdomains on the right TLD through, and the post-sign-out
  // redirect is customer-facing — landing on a 404 after sign-out is a
  // worse experience than the canonical-redirect.
  if (!env || env.includes(".vercel.app")) return FALLBACK;
  try {
    if (new URL(env).hostname !== "www.greenlifecannabis.com") return FALLBACK;
  } catch (err) {
    console.warn(
      `[rewards/sign-out] NEXT_PUBLIC_SITE_URL parse failed, using canonical fallback err=${err instanceof Error ? err.name : "unknown"}`,
    );
    return FALLBACK;
  }
  return env;
}

export async function POST() {
  const res = NextResponse.redirect(new URL("/rewards/login", siteOrigin()));
  res.cookies.set(REWARDS_COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/rewards",
    maxAge: 0,
  });
  return res;
}
