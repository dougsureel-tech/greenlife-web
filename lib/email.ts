import "server-only";

// Resend email sender for the public site — no-ops gracefully if
// RESEND_API_KEY is not set. Mirrors `lib/sms.ts` (Twilio no-op pattern)
// and the inventoryapp helper at `src/lib/email.ts` so the codebases use
// identical primitives.
//
// What this exists for:
// - Hack #6 strain-finder quiz nurture (capture → email follow-up)
// - Future order-confirmation emails on /order/confirmation
// - Future marketing nurture series (loyalty welcome, deal digest)
// - Customer welcome emails post-Clerk-signup
//
// **Customer state architecture:** customer accounts are a hybrid of
// Clerk (auth + email/profile) + a `portal_users` sidecar Postgres row
// (loyalty/SMS/order-history). For email opt-in we use the sidecar
// (`portal_users.email_opt_in` BOOLEAN, default FALSE) — see Phase 2 of
// this ship. Do NOT store opt-in in Clerk metadata; the sidecar already
// owns sms_opt_in + we want a single read for both channels.
//
// **XSS responsibility:** the `html` field is sent verbatim to Resend.
// Callers MUST escape any user-supplied content before interpolating it
// into the template literal — the helper does NOT sanitize. For static
// transactional templates (order receipt, welcome) this is fine. If
// echoing back a user's name / search query, escape with a tiny helper:
//   const safe = (s: string) => s.replace(/[&<>"']/g, c => ({
//     "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;",
//   }[c]!));
//
// **No PII on the no-op path:** if RESEND_API_KEY is missing we log a
// single info line WITHOUT the recipient address. The error string is
// safe to include in logs.

const API_KEY = process.env.RESEND_API_KEY;
const DEFAULT_FROM =
  process.env.RESEND_FROM || "Green Life Cannabis <hi@greenlifecannabis.com>";
// Reply-To override. When set, customer replies to outbound mail land
// here instead of the From address. Pattern: From = `info@…` (brand-
// facing), Reply-To = `buyer@…` (actively monitored mailbox). Without
// the override, replies default to From — which means replies bounce
// silently when the From address isn't actively monitored. See
// memory `project_info_email_unmonitored.md` for the load-bearing case.
const DEFAULT_REPLY_TO = process.env.RESEND_REPLY_TO ?? null;

export type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  /**
   * Per-recipient unsubscribe URL. When set, sendEmail emits two
   * RFC-8058-compliant Resend headers:
   *   - `List-Unsubscribe: <${url}>, <mailto:${REPLY_TO}?subject=Unsubscribe>`
   *   - `List-Unsubscribe-Post: List-Unsubscribe=One-Click`
   * Per Gmail's Feb 2024 bulk-sender requirements, this surfaces a one-click
   * Unsubscribe button at the top of the email in Gmail / Apple Mail / Yahoo —
   * recipient doesn't need to scroll to the body link. Pairs with the body-link
   * footer rendered by the per-template helper (same URL, two surfaces). Major
   * deliverability signal: Gmail rewards senders honoring this RFC even at low
   * volumes. Sister of GW src/lib/email.ts SendEmailOptions.unsubscribeUrl.
   */
  unsubscribeUrl?: string;
};

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string; skipped?: boolean };

/** True when RESEND_API_KEY is set. Use to gate UI copy that promises an
 *  email ("we'll email you a copy") so we don't lie to customers when
 *  the env var is absent in a given environment. */
export function isEmailConfigured(): boolean {
  return !!API_KEY;
}

/** Send an email via Resend. Returns `{ ok: true, id }` on success,
 *  `{ ok: false, error, skipped: true }` when RESEND_API_KEY is unset
 *  (graceful no-op for local dev / preview envs without the key), and
 *  `{ ok: false, error }` on a real send failure. Never throws. */
export async function sendEmail(args: SendEmailArgs): Promise<SendEmailResult> {
  if (!API_KEY) {
    // Single info line, NO recipient address — keeps PII out of logs in
    // the no-op path which is the most common path in dev / preview.
    console.info("[email] RESEND_API_KEY not configured — skipping send");
    return {
      ok: false,
      skipped: true,
      error: "RESEND_API_KEY not configured",
    };
  }

  try {
    const { Resend } = await import("resend");
    const client = new Resend(API_KEY);
    const replyTo = args.replyTo ?? DEFAULT_REPLY_TO ?? undefined;
    // Build List-Unsubscribe pair when caller supplies an unsub URL.
    // Mailto fallback uses replyTo when set (preferred — actively monitored)
    // or the from-address when not. Extract bare email from "Name <email>"
    // form. Per RFC 8058 + Gmail bulk-sender Feb 2024.
    const headers: Record<string, string> | undefined = args.unsubscribeUrl
      ? (() => {
          const mailtoSource = replyTo || args.from || DEFAULT_FROM;
          const angleMatch = mailtoSource.match(/<([^>]+)>/);
          const bareEmail = angleMatch ? angleMatch[1] : mailtoSource;
          return {
            "List-Unsubscribe": `<${args.unsubscribeUrl}>, <mailto:${bareEmail}?subject=Unsubscribe>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          };
        })()
      : undefined;
    const r = await client.emails.send({
      from: args.from ?? DEFAULT_FROM,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
      // Per-call replyTo wins when supplied; otherwise fall through to
      // the env-var default; otherwise undefined (Resend defaults to From).
      replyTo,
      ...(headers ? { headers } : {}),
    });
    // Resend v4 returns a discriminated union: { data, error: null } on
    // success or { data: null, error: ErrorResponse } on failure — does
    // NOT throw. Pre-fix the success-path code skipped the error branch
    // entirely and fell through to "no message id", silently swallowing
    // the diagnostic info on every Resend rejection (unverified domain,
    // rate-limit, invalid recipient, etc.). Sister of inv v305.205 fix
    // (project_resend_silent_failure_2026_05_08.md). Use `error.name`
    // (typed code key) NOT `error.message` (may echo recipient address →
    // PII into Vercel logs).
    const errResp = (r as { error?: { name?: string; message?: string } | null }).error;
    if (errResp) {
      const errName = errResp.name ?? "ResendError";
      console.error(`[email] send rejected: ${errName}`);
      return { ok: false, error: errName };
    }
    // Resend's response shape varies between SDK versions; try common
    // id paths defensively (matches the inventoryapp helper).
    const id =
      (r as { data?: { id?: string }; id?: string }).data?.id ??
      (r as { id?: string }).id ??
      null;
    if (!id) {
      return { ok: false, error: "Resend returned no message id" };
    }
    return { ok: true, id };
  } catch (e) {
    // Format-only — Resend SDK errors echo the recipient address in
    // .message ("domain not verified for foo@example.com" / "rate
    // limited 3000/day for foo@example.com"). Vercel logs aren't
    // sensitive-PII-segregated; logging full error surfaces customer
    // email PII. Return + log err.name (class only — "validation_error",
    // "rate_limit_exceeded", etc.). All callers ({welcome,quiz-nurture,
    // order-confirmation}-email.ts and admin actions) inherit the
    // tightened result.error string. Sister of inv `lib/email.ts` and
    // GW PHI-leak hardening pattern.
    const errName = e instanceof Error ? e.name : "Error";
    console.error(`[email] send failed: ${errName}`);
    return { ok: false, error: errName };
  }
}
