import { NextRequest, NextResponse, after } from "next/server";
import crypto from "crypto";
import { getClient } from "@/lib/db";
import { sendQuizMatchEmail } from "@/lib/quiz-nurture-email";
import { STORE } from "@/lib/store";
import { MINUTE_MS } from "@/lib/time-constants";

// Hack #6 — Strain-finder quiz email capture.
//
// POST /api/quiz/capture
// Body: { email, vibe?, strain_type?, category? }
//
// Validates the email shape, dedupes by (LOWER(email), source) within
// the last 7 days, generates a 256-bit unsubscribe token, INSERTs a
// `quiz_captures` row, and fires the D+0 "Your strain match is in"
// email via `after()` so the response is never blocked by Resend
// latency. D+5 + D+12 are dispatched separately by the inventoryapp-
// side `/api/cron/quiz-nurture` cron.
//
// **Gating:** the entire endpoint is no-op'd unless
// `QUIZ_NURTURE_ENABLED=true` is set on the Vercel project. Default
// OFF — Doug flips it after he verifies the Resend domain + checks
// the first few D+0 sends in the logs. The corresponding client-side
// gate is `NEXT_PUBLIC_QUIZ_NURTURE_ENABLED`; the capture card in
// `StrainFinderClient.tsx` doesn't render without it, so this endpoint
// being callable when the public env var is also set is intentional.
//
// **Security checks:**
//   • Email validated by regex + max length + reject newlines/CR
//     (header injection prevention).
//   • Other fields max length 64 chars + null on miss (no SQL
//     interpolation — Drizzle/neon parameterizes the values).
//   • Dedupe lookup is exact-match on `(LOWER(email), source)` within
//     a 7-day window so a button-mash doesn't double-send.
//   • Token = `crypto.randomBytes(32).toString('hex')` — 256 bits,
//     unguessable, URL-safe by construction (hex only).
//   • Errors are logged WITHOUT the recipient address.

const SOURCE = "greenlife";
// RFC 5321 max for email is 254 chars; we cap at 254 to stay in spec
// without being miserly about it.
const MAX_EMAIL_LEN = 254;
// Strict-but-pragmatic email regex — single @, one or more dots in the
// domain, no whitespace/newlines/control characters anywhere. Rejects
// header-injection payloads (CRLF + extra `To:`) by construction.
const EMAIL_RE = /^[^\s@<>"'`\\;]+@[^\s@<>"'`\\;]+\.[^\s@<>"'`\\;]+$/;

// Cap quiz-answer lengths — they all come from a fixed-list radio set
// in StrainFinderClient.tsx so a normal client never exceeds ~16 chars,
// but the route is callable directly so we cap at 64 to bound storage
// + DB index size on the dedupe path.
const MAX_FIELD_LEN = 64;

// Per-IP rate limit on quiz captures. Each call inserts + fires Resend
// (per-email billing). 7-day dedupe per (email, source) prevents
// repeat-to-same-inbox, but different emails from one IP can still loop.
// 5/min/IP is generous; blocks scripted abuse. Sister to scc same wave.
const captureRateMap = new Map<string, { count: number; resetAt: number }>();
function checkCaptureRate(ip: string): boolean {
  const now = Date.now();
  const entry = captureRateMap.get(ip);
  if (!entry || entry.resetAt < now) {
    captureRateMap.set(ip, { count: 1, resetAt: now + MINUTE_MS });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  // Defense in depth — the public-site capture card hides itself when
  // NEXT_PUBLIC_QUIZ_NURTURE_ENABLED isn't "true", but a direct curl
  // against this route should also no-op when the server-side env var
  // is unset. Returns 200 so an experimental client doesn't surface a
  // misleading 403 to the customer.
  if (process.env.QUIZ_NURTURE_ENABLED !== "true") {
    return NextResponse.json({ ok: true, skipped: "feature_disabled" });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!checkCaptureRate(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  // Length-bound BEFORE the .trim() — without this, a 10MB email payload
  // would burn CPU running .trim() over arbitrary input before the
  // length check below would reject it. 2× MAX_EMAIL_LEN (= 508) is
  // comfortable above the 254 RFC limit with whitespace room.
  const rawEmail =
    typeof b.email === "string" && b.email.length <= MAX_EMAIL_LEN * 2
      ? b.email.trim()
      : "";
  // First-line defenses. Reject CRLF (header injection), oversized
  // payloads, and obviously-malformed addresses BEFORE any DB hit.
  if (!rawEmail) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }
  if (rawEmail.length > MAX_EMAIL_LEN) {
    return NextResponse.json({ error: "Email too long" }, { status: 400 });
  }
  if (/[\r\n]/.test(rawEmail)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!EMAIL_RE.test(rawEmail)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Optional quiz-answer fields — clip + null on miss. These flow to
  // the D+0 email body so we cap length to keep template payloads
  // bounded.
  const sanitize = (v: unknown): string | null => {
    if (typeof v !== "string") return null;
    // Length check BEFORE trim — without this, a 10MB field would burn
    // CPU on .trim() before the slice could cap it. 2× MAX_FIELD_LEN
    // is comfortable above the 64-char cap with whitespace room.
    if (v.length > MAX_FIELD_LEN * 2) return null;
    const t = v.trim().slice(0, MAX_FIELD_LEN);
    return t.length > 0 ? t : null;
  };
  const vibe = sanitize(b.vibe);
  const strainType = sanitize(b.strain_type);
  const category = sanitize(b.category);

  const sql = getClient();
  const lowerEmail = rawEmail.toLowerCase();

  try {
    // Dedupe — same email + same store source within the last 7 days
    // counts as already-captured. Returns 200 with a `dedupe: true`
    // flag so the client UI can show "we already have you on the list"
    // instead of "Send it" → "Sent!" with no actual nurture going out
    // (the D+0 email won't re-fire either).
    const dupRows = await sql`
      SELECT id FROM quiz_captures
      WHERE LOWER(email) = ${lowerEmail}
        AND source = ${SOURCE}
        AND captured_at > NOW() - INTERVAL '7 days'
      LIMIT 1
    `;
    if (dupRows.length > 0) {
      return NextResponse.json({ ok: true, dedupe: true });
    }

    // Generate the unsubscribe token AFTER the dedupe check so we
    // don't burn entropy on a row we won't insert. 32 bytes = 256 bits
    // of entropy, hex-encoded → 64 chars.
    const unsubscribedToken = crypto.randomBytes(32).toString("hex");
    const id = crypto.randomUUID();

    await sql`
      INSERT INTO quiz_captures (
        id, email, vibe, strain_type, category, source, unsubscribed_token
      ) VALUES (
        ${id}, ${rawEmail}, ${vibe}, ${strainType}, ${category}, ${SOURCE}, ${unsubscribedToken}
      )
    `;

    // D+0 email — fire AFTER the response so Resend latency never
    // blocks the customer. Helper internally re-checks
    // RESEND_API_KEY + email validity; never throws.
    const params = new URLSearchParams();
    if (vibe) params.set("vibe", vibe);
    if (category) params.set("category", category);
    if (strainType) params.set("strain", strainType);
    const deepLinkOrder = params.toString()
      ? `${STORE.website}/order?${params}`
      : `${STORE.website}/order`;

    after(async () => {
      try {
        await sendQuizMatchEmail({
          to: rawEmail,
          firstName: null, // we didn't ask for name on this surface
          vibe,
          strainType,
          unsubscribeToken: unsubscribedToken,
          storeName: STORE.name,
          deepLinkOrder,
          mapUrl: STORE.googleMapsUrl,
        });
      } catch (err) {
        // err.name only — Resend errors echo recipient email + sender
        // domain in err.message ("Invalid email address: ...") so the
        // "log without the recipient" promise needs a class-only
        // formatter, not err.message. Sister of inv v314.605 quiz-nurture
        // + glw orders/profile/push pattern.
        console.error(`[quiz/capture] D+0 dispatch failed err=${err instanceof Error ? err.name : "unknown"}`);
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // err.name only — Drizzle wraps Postgres errors and the message
    // can echo the conflicting row data (`duplicate key violates ...
    // (email)=(alice@example.com)`). Class-only is the safe formatter.
    console.error(`[quiz/capture] insert failed err=${err instanceof Error ? err.name : "unknown"}`);
    return NextResponse.json({ error: "Couldn't save your email. Try again." }, { status: 500 });
  }
}
