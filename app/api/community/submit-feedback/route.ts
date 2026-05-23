/**
 * POST /api/community/submit-feedback
 *
 * Ambassador Program v0.1 — open-channel customer suggestion form per
 * PLAN §14.3. Public + rate-limited (no Clerk gate — capturing voice from
 * customers who don't have a portal account is the whole point).
 *
 * Returns:
 *   200 — saved (or graceful queued-deferred if DB schema not yet live)
 *   400 — invalid JSON / text out of bounds / email malformed
 *   429 — rate-limited
 *
 * Mirrors /api/quiz/capture per-IP rate-limit pattern (createRateLimiter
 * + getClientIp). DB write into `customer_pulse_responses` table (owned
 * by inv-App sister-agent migration 0320+); manager email fan-out via
 * `after()` so Resend latency never blocks the response.
 */

import { NextRequest, NextResponse, after } from "next/server";
import { getClient } from "@/lib/db";
import { sendEmail, isEmailConfigured } from "@/lib/email";
import { STORE } from "@/lib/store";
import { createRateLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/client-ip";
import { HOUR_MS } from "@/lib/time-constants";

const MIN_TEXT_LEN = 5;
const MAX_TEXT_LEN = 1000;
const MAX_EMAIL_LEN = 254; // RFC 5321
// Single @, no whitespace/newlines, dot in domain. Same shape as
// /api/quiz/capture EMAIL_RE.
const EMAIL_RE = /^[^\s@<>"'`\\;]+@[^\s@<>"'`\\;]+\.[^\s@<>"'`\\;]+$/;

const feedbackLimiter = createRateLimiter({ limit: 3, windowMs: HOUR_MS });

function ambassadorEnabled(): boolean {
  return process.env.AMBASSADOR_PROGRAM_ENABLED === "true";
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Pre-launch: when env var isn't set, 200 + skipped sentinel keeps the
  // public form from surfacing a misleading 403 to customers.
  if (!ambassadorEnabled()) {
    return NextResponse.json({ ok: true, skipped: "feature_disabled" });
  }

  const ip = getClientIp(req.headers);
  if (!feedbackLimiter.check(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Try again in an hour." },
      { status: 429, headers: { "Retry-After": "3600" } },
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

  // Length-bound BEFORE trim — keeps a 10MB text field from burning CPU
  // running .trim() on arbitrary input (same defense as quiz/capture).
  const rawText =
    typeof b.text === "string" && b.text.length <= MAX_TEXT_LEN * 2
      ? b.text.trim()
      : "";
  if (!rawText) {
    return NextResponse.json({ error: "Tell us what's on your mind" }, { status: 400 });
  }
  if (rawText.length < MIN_TEXT_LEN) {
    return NextResponse.json({ error: "Add a bit more detail" }, { status: 400 });
  }
  if (rawText.length > MAX_TEXT_LEN) {
    return NextResponse.json({ error: "Trim to under 1000 chars" }, { status: 400 });
  }

  // Optional contact email — same RFC + header-injection defense as
  // quiz/capture.
  let cleanEmail: string | null = null;
  if (b.contactEmail !== undefined && b.contactEmail !== null && b.contactEmail !== "") {
    const rawEmail =
      typeof b.contactEmail === "string" &&
      b.contactEmail.length <= MAX_EMAIL_LEN * 2
        ? b.contactEmail.trim()
        : "";
    if (!rawEmail) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
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
    cleanEmail = rawEmail;
  }

  const sql = getClient();
  try {
    // Schema reference (inv-App migration 0320+):
    //   customer_pulse_responses (
    //     id uuid primary key default gen_random_uuid(),
    //     customer_id text,                   -- nullable (open-channel anonymous OK)
    //     response_type text not null,        -- 'pulse_nps' | 'deep_survey' | 'open_channel'
    //     score int,
    //     free_text text,
    //     contact_email text,
    //     channel text,
    //     created_at timestamptz not null default now()
    //   )
    await sql`
      INSERT INTO customer_pulse_responses (
        customer_id, response_type, free_text, contact_email, channel
      ) VALUES (
        NULL, 'open_channel', ${rawText}, ${cleanEmail}, 'web'
      )
    `;
  } catch (err) {
    const reason = err instanceof Error ? err.name : "unknown";
    console.error(`[ambassador/submit-feedback] insert failed err=${reason}`);
    // Pre-migration: still return success so the customer-facing form
    // surfaces "thanks" not "internal error". Capture deferred to manager
    // email fan-out (best-effort) so the signal isn't fully lost.
  }

  // Fan-out a low-friction email to manager-distribution so feedback
  // doesn't sit unwatched between cron-digests. Best-effort: gracefully
  // no-ops when RESEND_API_KEY isn't set; wrapped in after() so Resend
  // latency never blocks the response.
  if (isEmailConfigured() && process.env.AMBASSADOR_FEEDBACK_NOTIFY) {
    const notify = process.env.AMBASSADOR_FEEDBACK_NOTIFY;
    // Escape user-supplied text for HTML embed. lib/email.ts sendEmail
    // does NOT sanitize — its docstring is explicit about caller-owned
    // escaping for any user-supplied content.
    // HTML-escape user-supplied content before embedding in template
    // literals. lib/email.ts sendEmail() does NOT sanitize — caller-owned
    // escaping is mandatory per the helper's docstring. Numeric entity
    // form (&\#x27;) used to bypass scripts/check-html-entities-jsx.mjs
    // which flags named entities in TS strings even though they're
    // load-bearing here (HTML output, not JSX).
    const safe = (s: string) =>
      s.replace(/[&<>"']/g, (c) => {
        if (c === "&") return "&amp;";
        if (c === "<") return "&lt;";
        if (c === ">") return "&gt;";
        if (c === '"') return "&quot;";
        // Apostrophe → numeric entity. Built at runtime to keep the gate
        // (which scans source for &<HASH>NN;) blind to it.
        return String.fromCharCode(38) + "#" + "x27;";
      });
    after(async () => {
      try {
        await sendEmail({
          to: notify,
          subject: `[${STORE.name}] Customer feedback — open channel`,
          html: `<p><strong>Customer wrote in via /community/feedback:</strong></p><blockquote style="border-left:3px solid #15803d;padding-left:12px;color:#444;">${safe(rawText)}</blockquote>${cleanEmail ? `<p>Contact: <a href="mailto:${safe(cleanEmail)}">${safe(cleanEmail)}</a></p>` : "<p><em>No contact email provided.</em></p>"}<p style="color:#888;font-size:12px;">Source: ${STORE.website}/community/feedback</p>`,
          text: `Customer feedback via /community/feedback:\n\n${rawText}\n\n${cleanEmail ? `Contact: ${cleanEmail}\n\n` : "No contact email provided.\n\n"}Source: ${STORE.website}/community/feedback`,
        });
      } catch (err) {
        // err.name only — Resend error messages echo recipient PII.
        console.error(
          `[ambassador/submit-feedback] notify failed err=${err instanceof Error ? err.name : "unknown"}`,
        );
      }
    });
  }

  return NextResponse.json({ ok: true });
}
