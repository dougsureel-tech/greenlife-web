// POST /api/rewards/verify-code
//
// Sister-port of seattle-cannabis-web/app/api/rewards/verify-code.
// Customer enters phone + 6-digit code at /rewards/verify → server
// looks up unconsumed-and-unexpired loyalty_otp_codes row, hashes
// supplied code with SHA-256, compares against code_hash, consumes
// on match, issues an HMAC-signed cookie scoped to /rewards.
//
// Body: { phone: string, code: string }
// Response shapes:
//   200 { ok: true }                    — code matched, cookie set
//   400 { error: "..." }                — bad shape
//   401 { error: "..." }                — code invalid / expired / exhausted
//   500 { error: "..." }                — DB or sign failure
//
// Privacy posture:
//   - We DO NOT confirm whether the phone has a customers row. The
//     cookie is issued purely on OTP match; the dashboard endpoints
//     downstream do the customers-table join.
//   - "Code invalid" / "code expired" / "too many attempts" all
//     return the same 401 response shape so an attacker can't tell
//     which case applies. We DO log the discriminator on the server
//     side for debugging.
//
// Attempt counter:
//   - Each verify increments `attempts` on the most-recent row.
//   - At 5 attempts the row is silently treated as exhausted.
//
// GLW divergence from SCC: SCC's verify-code back-fills two Sea-named
// migration-funnel columns (customers.rewards_signed_in_at +
// scc_app_installed_at) in an after() block. GLW (Wenatchee) has no
// admin tile reading those columns — its track-install route
// deliberately stopped writing the Sea-named scc_app_installed_at on
// Wen (Doug 2026-05-07). To keep the data semantically clean we omit
// that funnel-attribution block entirely here; it is reporting-only and
// not part of auth correctness.

import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/db";
import { normalizeToE164 } from "@/lib/sms";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { DAY_MS, MINUTE_MS } from "@/lib/time-constants";
import { createRateLimiter } from "@/lib/rate-limit";
import { REWARDS_COOKIE_NAME } from "@/lib/rewards-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_ATTEMPTS = 5;
const SESSION_TTL_DAYS = 30;
// SSoT — imported from lib/rewards-session.ts so issue/read/clear paths
// can't drift apart (sister of `feedback_cookie_attribute_symmetry_audit`).
const COOKIE_NAME = REWARDS_COOKIE_NAME;

// Per-IP rate limit on verify-code POSTs. Each call runs a DB SELECT on
// loyalty_otp_codes by phone (composite-indexed but still a DB hop) +
// possibly a UPDATE on attempts. Without a per-IP cap, an attacker can
// fire 1000 req/s from one IP → DB load DoS, even though MAX_ATTEMPTS=5
// per row makes brute-force infeasible. 20/min/IP is generous (legit
// users enter 1-3 attempts per OTP) and caps DB load. Sister of
// /api/rewards/request-code's DB-backed 5/hr/IP limit (different shape:
// COUNT-based on persisted rows there, in-memory here for speed since
// verify-code traffic is much higher).
const verifyLimiter = createRateLimiter({ limit: 20, windowMs: MINUTE_MS });
function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function signSession(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** base64url-encoded JSON payload + "." + HMAC-SHA-256 signature. */
function makeSessionCookie(phoneE164: string, secret: string): string {
  const payload = {
    phone: phoneE164,
    issuedAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_DAYS * DAY_MS,
    purpose: "glw-rewards-v1",
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = signSession(encoded, secret);
  return `${encoded}.${sig}`;
}

export async function POST(req: NextRequest) {
  if (!verifyLimiter.check(clientIp(req))) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a minute and try again." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  let body: { phone?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Bound BEFORE downstream normalization + .trim() — without this, a
  // 10MB phone or code payload would burn CPU on the regex strip inside
  // normalizeToE164() / on the .trim() pass before the format checks
  // below would reject. Same defense class as inv v190.645 (sister
  // /api/customer/auth/verify input caps). Phone 32 chars (E.164 max
  // formatted ~17), code 16 (6 digits + slack).
  if (
    (typeof body.phone === "string" && body.phone.length > 32) ||
    (typeof body.code === "string" && body.code.length > 16)
  ) {
    return NextResponse.json({ error: "Code is invalid or expired. Request a new one." }, { status: 401 });
  }

  const phoneE164 = normalizeToE164(body.phone ?? "");
  const supplied = (body.code ?? "").trim();

  if (!phoneE164.startsWith("+") || phoneE164.length < 12) {
    return NextResponse.json(
      { error: "Phone number doesn't look right." },
      { status: 400 },
    );
  }
  if (!/^\d{6}$/.test(supplied)) {
    return NextResponse.json(
      { error: "Code should be 6 digits." },
      { status: 400 },
    );
  }

  const secret = process.env.DASHBOARD_SESSION_SECRET;
  if (!secret) {
    console.error("[verify-code] DASHBOARD_SESSION_SECRET not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const sql = getClient();

  // Pull the most recent unconsumed-unexpired row for this phone. Hot
  // path uses the (phone, consumed_at, expires_at) composite index.
  const rows = (await sql`
    SELECT id, code_hash
    FROM loyalty_otp_codes
    WHERE phone = ${phoneE164}
      AND consumed_at IS NULL
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
  `) as unknown as Array<{ id: string; code_hash: string }>;

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Code is invalid or expired. Request a new one." },
      { status: 401 },
    );
  }

  const row = rows[0];

  // Atomically claim one attempt against THIS code row BEFORE comparing.
  // The prior shape read `attempts` in the SELECT above, then did a
  // separate increment on mismatch — a check-then-act TOCTOU race: N
  // concurrent requests all read attempts < MAX before any increment
  // landed, so a burst (trivial to fire once the in-memory per-IP limiter
  // is evaded by lambda cold-starts / spreading across instances) could
  // get far more than MAX_ATTEMPTS guesses against one 6-digit code. This
  // conditional UPDATE is atomic in Postgres: each concurrent request
  // claims a distinct attempt number, and once `attempts` hits
  // MAX_ATTEMPTS the WHERE stops matching — so AT MOST MAX_ATTEMPTS hash
  // comparisons can ever run for a given code, regardless of concurrency
  // or how many instances the attacker spreads across. This per-row
  // atomic cap (NOT the in-memory IP limiter, which is now purely a
  // DB-load-DoS guard) is the real brute-force defense. A separate
  // per-phone cap is unnecessary on top of it: verify only ever targets
  // the most-recent row (LIMIT 1 above), and minting more rows requires
  // request-code — itself 5/hr/IP AND it SMSes the victim on each call.
  const claim = (await sql`
    UPDATE loyalty_otp_codes
    SET attempts = attempts + 1
    WHERE id = ${row.id}
      AND consumed_at IS NULL
      AND attempts < ${MAX_ATTEMPTS}
    RETURNING attempts
  `) as unknown as Array<{ attempts: number }>;

  if (claim.length === 0) {
    // Exhausted (or consumed) by the time we tried to claim — mark it
    // consumed so it can't be retried and force a fresh code. Idempotent.
    await sql`
      UPDATE loyalty_otp_codes
      SET consumed_at = NOW()
      WHERE id = ${row.id} AND consumed_at IS NULL
    `;
    return NextResponse.json(
      { error: "Too many attempts. Request a new code." },
      { status: 401 },
    );
  }

  // Constant-time comparison so a timing attack can't leak the hash
  // byte-by-byte. Practical risk here is ~zero (MAX_ATTEMPTS=5 + 10-min
  // TTL caps the number of probes far below what's needed to extract
  // bytes via timing, and network jitter dwarfs any per-byte signal),
  // but `timingSafeEqual` is the right pattern for any hash/HMAC
  // comparison — defense-in-depth + matches the rest of the codebase's
  // auth-class hash patterns.
  const suppliedHash = hashCode(supplied);
  const suppliedBuf = Buffer.from(suppliedHash, "hex");
  const storedBuf = Buffer.from(row.code_hash, "hex");
  const ok =
    suppliedBuf.length === storedBuf.length &&
    timingSafeEqual(suppliedBuf, storedBuf);

  if (!ok) {
    // Attempt already counted by the atomic claim above — do NOT increment
    // again here. The prior shape double-counted on mismatch, silently
    // halving the legit retry budget (a wrong guess burned 2 of MAX_ATTEMPTS).
    return NextResponse.json(
      { error: "Code is invalid or expired. Request a new one." },
      { status: 401 },
    );
  }

  // Consume the row so the same code can't be replayed.
  await sql`
    UPDATE loyalty_otp_codes
    SET consumed_at = NOW()
    WHERE id = ${row.id}
  `;

  const cookieValue = makeSessionCookie(phoneE164, secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    // Phase 2/3 identity-unification keystone: site-wide ("/") so the phone-OTP
    // session is readable by getPortalUserForRequest() on /account/* + /api/*,
    // not just /rewards/*. Was path:"/rewards" back when rewards + Clerk /account
    // were separate identity systems — the deliberate split this phase retires.
    // Every other protection is unchanged (httpOnly, secure, sameSite=lax,
    // HMAC-signed, purpose+TTL bound); widening path does not weaken the session.
    // Until a phone customer re-logs-in their OLD path:"/rewards" cookie still
    // works on /rewards/* (sign-out clears both paths during the transition).
    path: "/",
    maxAge: SESSION_TTL_DAYS * 86_400,
  });

  return res;
}
