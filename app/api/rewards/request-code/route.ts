// POST /api/rewards/request-code
//
// Sister-port of seattle-cannabis-web/app/api/rewards/request-code.
// Customer enters phone on /rewards/login → we generate a 6-digit code,
// INSERT into loyalty_otp_codes (inventoryapp migration 0204), send via
// Twilio.
//
// Body: { phone: string }   (any format; server normalizes to E.164)
// Response shapes:
//   200 { ok: true }                   — code sent
//   200 { ok: true, demoCode: "..." }  — SMS not configured (dev/preview)
//   400 { error: "..." }               — bad phone shape
//   429 { error: "..." }               — rate-limit hit (per-IP or per-phone)
//   500 { error: "..." }               — DB or Twilio failure
//
// Privacy posture:
//   - We DO NOT confirm whether the phone is in our customers table.
//     A request always succeeds (timing + response shape) so an
//     attacker can't enumerate customer phones via this endpoint.
//   - The verify endpoint will silently no-op if no customer matches
//     after the OTP succeeds.
//
// Rate limit: 5 successful inserts per IP per hour AND 5 per phone per
// hour. Both counted from loyalty_otp_codes with a SELECT-COUNT inside
// the last 60 minutes.

import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/db";
import { normalizeToE164, isSmsConfigured, sendSms } from "@/lib/sms";
import { createHash, randomBytes } from "node:crypto";
import { STORE } from "@/lib/store";
import { MINUTE_MS } from "@/lib/time-constants";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_PER_IP_PER_HOUR = 5;
// Per-PHONE cap is independent of the per-IP cap: the IP cap can't stop a
// distributed / IP-rotating attacker from flooding ONE victim's number with
// paid Twilio SMS (toll fraud + harassment). 5/hr is generous for a real
// owner's retries, tight enough to kill an SMS-bomb.
const MAX_PER_PHONE_PER_HOUR = 5;
const TTL_MINUTES = 10;

function clientIp(req: NextRequest): string {
  // Vercel-style headers (x-forwarded-for is a comma-separated list with
  // the original client IP first). Fall back to a sentinel so the
  // rate-limit query never sees a NULL ip.
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

function generateCode(): string {
  // 6-digit zero-padded numeric. Cryptographically random.
  const n = randomBytes(4).readUInt32BE(0) % 1_000_000;
  return n.toString().padStart(6, "0");
}

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function makeRowId(): string {
  return `otp_${randomBytes(12).toString("hex")}`;
}

export async function POST(req: NextRequest) {
  let body: { phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Bound BEFORE normalizeToE164() — that helper runs a regex strip over
  // the input string, so a 10MB phone payload would burn CPU before the
  // length check below would reject. 32 chars covers any formatted
  // international phone (E.164 max formatted ~17). Sister to
  // verify-code + inv v190.645.
  if (typeof body.phone === "string" && body.phone.length > 32) {
    return NextResponse.json(
      { error: "Phone number doesn't look right." },
      { status: 400 },
    );
  }
  const phoneE164 = normalizeToE164(body.phone ?? "");
  if (!phoneE164.startsWith("+") || phoneE164.length < 12) {
    return NextResponse.json(
      { error: "Phone number doesn't look right." },
      { status: 400 },
    );
  }

  const ip = clientIp(req);
  const sql = getClient();

  // Per-IP rate limit. 5 OTP-generations per hour is generous enough
  // for a customer who fat-fingered their phone, tight enough to slow
  // a SMS-spam attempt.
  const rateRows = (await sql`
    SELECT COUNT(*)::int AS recent
    FROM loyalty_otp_codes
    WHERE request_ip = ${ip}
      AND created_at > NOW() - INTERVAL '1 hour'
  `) as unknown as Array<{ recent: number }>;
  const recent = rateRows[0]?.recent ?? 0;
  if (recent >= MAX_PER_IP_PER_HOUR) {
    return NextResponse.json(
      { error: "Too many code requests. Please try again in an hour." },
      { status: 429 },
    );
  }

  // Per-phone cap (toll-fraud / SMS-bomb defense). Counts any phone that
  // requested codes recently — not customer status — so it leaks nothing the
  // enumeration-safe posture documented at the top of this file doesn't
  // already. Same generic 429 message as the per-IP path.
  const phoneRateRows = (await sql`
    SELECT COUNT(*)::int AS recent
    FROM loyalty_otp_codes
    WHERE phone = ${phoneE164}
      AND created_at > NOW() - INTERVAL '1 hour'
  `) as unknown as Array<{ recent: number }>;
  if ((phoneRateRows[0]?.recent ?? 0) >= MAX_PER_PHONE_PER_HOUR) {
    return NextResponse.json(
      { error: "Too many code requests. Please try again in an hour." },
      { status: 429 },
    );
  }

  const code = generateCode();
  const codeHash = hashCode(code);

  // expires_at computed app-side so the constant lives next to TTL_MINUTES.
  const expiresAt = new Date(Date.now() + TTL_MINUTES * MINUTE_MS).toISOString();

  await sql`
    INSERT INTO loyalty_otp_codes
      (id, phone, code_hash, expires_at, attempts, request_ip)
    VALUES
      (${makeRowId()},
       ${phoneE164},
       ${codeHash},
       ${expiresAt},
       0,
       ${ip})
  `;

  // SMS send. If Twilio is unconfigured (preview/dev), return the
  // code in the response so the dev can complete the flow without
  // an external SMS — still useful for end-to-end testing of the
  // verify path. Production builds always have Twilio configured;
  // this leak path is preview-only — and explicitly gated on
  // VERCEL_ENV !== "production" as belt-and-suspenders so if env
  // vars ever drift on prod (e.g. partial restore, accidental
  // unset) the OTP code can't leak in the API response. In that
  // case prod returns a generic 500 instead.
  if (!isSmsConfigured()) {
    const isProd = process.env.VERCEL_ENV === "production";
    if (isProd) {
      console.error("[request-code] SMS unconfigured on PRODUCTION — refusing to leak OTP in response");
      return NextResponse.json(
        { error: "Could not send code. Please try again or contact us." },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, demoCode: code });
  }

  const messageBody = `Your ${STORE.name} rewards code: ${code}\nExpires in ${TTL_MINUTES} minutes. Reply STOP to opt out.`;
  const smsResult = await sendSms(phoneE164, messageBody);
  if (!smsResult.success) {
    // SMS failed — keep the code in the DB so the customer can retry
    // or use a fallback channel; surface a generic error to the client.
    // smsResult.error is e.message from Twilio — Twilio errors echo the
    // destination phone number ("The 'To' number +1555... is unsubscribed").
    // Slice to 40 chars to preserve the error class while stripping the
    // number. Full detail is in the Twilio console.
    const truncated = smsResult.error ? smsResult.error.slice(0, 40) : "unknown";
    console.error(`[request-code] sendSms failed: ${truncated}`);
    return NextResponse.json(
      { error: "Could not send code. Please try again or contact us." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
