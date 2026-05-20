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

// Function-resolved env reads instead of module-init constants.
// Sister of inv v401.505 + cannagent v6.4565 + scc v24.105 same-day
// (stale-Fluid-Compute-instance env-var trap). Memory pin:
// `feedback_env_var_precedence_cross_tenant_trap`. Caused the inv
// 2026-05-11 Jensine welcome-email failure cascade — staff-bulk-reissue
// sent from stale FROM for ~30min after env-flip until instances cycled.
function getApiKey(): string | undefined { return process.env.RESEND_API_KEY; }
function getDefaultFrom(): string {
  return process.env.RESEND_FROM || "Green Life Cannabis <hi@greenlifecannabis.com>";
}
// Reply-To override. When set, customer replies to outbound mail land
// here instead of the From address. Pattern: From = `info@…` (brand-
// facing), Reply-To = `buyer@…` (actively monitored mailbox). Without
// the override, replies default to From — which means replies bounce
// silently when the From address isn't actively monitored. See
// memory `project_info_email_unmonitored.md` for the load-bearing case.
function getDefaultReplyTo(): string | null { return process.env.RESEND_REPLY_TO ?? null; }

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
  return !!getApiKey();
}

/**
 * Cross-stack readiness probe — paired with `getEmailFromHost()` on
 * `/api/health`. Sister of cannagent v6.4585 + inv v401.305 + scc v23.905.
 *
 * Returns `true` when RESEND_FROM is set to the bare apex
 * `greenlifecannabis.com` — which routes apex MX → Microsoft 365 inbound
 * (per dig MX greenlifecannabis.com → greenlifecannabis-com.mail.protection.outlook.com).
 * That's a DKIM/SPF/DMARC misalignment risk: Resend signs from its
 * relay infrastructure, but the apex's authoritative MX path points
 * at M365 — receiving Gmail/Apple Mail/Outlook clients may spam-
 * folder or bounce. See memory pin
 * `feedback_resend_apex_vs_send_subdomain_trap` (Jensine welcome-
 * email incident 2026-05-11 — burned 3hr on inv before diag endpoint
 * surfaced root cause).
 *
 * **UPDATED 2026-05-19 evening:** apex `greenlifecannabis.com` is no longer
 * at-risk. The apex SPF now includes `_spf.resend.com` (verified via
 * `dig TXT greenlifecannabis.com` — returns `v=spf1 include:_spf.resend.com
 * include:secureserver.net include:spf.protection.outlook.com -all`). Apex
 * DKIM `resend._domainkey.greenlifecannabis.com` verified in Resend dashboard
 * 15 days ago. DMARC is `aspf=r adkim=r` (relaxed alignment) so apex-direct
 * sending passes SPF + DMARC at receiving clients (Gmail / Apple Mail / Outlook).
 *
 * The send.<apex> trampoline that the original `feedback_resend_apex_vs_send_subdomain_trap`
 * pattern required is no longer needed. Both apex AND send.subdomain are safe;
 * the Jensine-class silent-spam-fold risk is closed by the SPF + DKIM verification.
 *
 * Returns:
 *   - `null` when RESEND_API_KEY isn't set (nothing to validate)
 *   - `true` when RESEND_FROM is unset (default code-fallback) OR uses an
 *     UNVERIFIED domain (could be misconfigured / typo)
 *   - `false` when from-host is the verified apex `greenlifecannabis.com` OR
 *     verified subdomain `send.greenlifecannabis.com` — both are SPF/DKIM-aligned
 *
 * If SPF / Resend-domain-verification state ever changes, update VERIFIED_HOSTS
 * below + this doc block.
 */
const VERIFIED_HOSTS = new Set<string>([
  "greenlifecannabis.com",
  "send.greenlifecannabis.com",
]);

export function isEmailFromAtRisk(): boolean | null {
  if (!getApiKey()) return null;
  const configured = process.env.RESEND_FROM?.trim();
  if (!configured) {
    // RESEND_FROM unset → code-default fallback. Honest "we don't know
    // for sure" signal until env is explicitly set.
    return true;
  }
  const angleMatch = configured.match(/<([^>]+@([^>]+))>/);
  const bareMatch = configured.match(/([^\s]+@([^\s]+))/);
  const host = (angleMatch?.[2] || bareMatch?.[2] || "").trim().toLowerCase();
  if (!host) return null;
  // Unverified host (typo / wrong domain) → at-risk. Both apex + send.apex
  // are verified in Resend dashboard with SPF + DKIM.
  return !VERIFIED_HOSTS.has(host);
}

/**
 * Returns the parsed from-host (domain portion only — PII-safe, no
 * local-part). Paired with `isEmailFromAtRisk()` on `/api/health`.
 */
export function getEmailFromHost(): string | null {
  if (!getApiKey()) return null;
  const configured = process.env.RESEND_FROM?.trim();
  if (!configured) return "greenlifecannabis.com"; // code-default apex
  const angleMatch = configured.match(/<([^>]+@([^>]+))>/);
  const bareMatch = configured.match(/([^\s]+@([^\s]+))/);
  return (angleMatch?.[2] || bareMatch?.[2] || "").trim().toLowerCase() || null;
}

/** Send an email via Resend. Returns `{ ok: true, id }` on success,
 *  `{ ok: false, error, skipped: true }` when RESEND_API_KEY is unset
 *  (graceful no-op for local dev / preview envs without the key), and
 *  `{ ok: false, error }` on a real send failure. Never throws. */
export async function sendEmail(args: SendEmailArgs): Promise<SendEmailResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
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
    const client = new Resend(apiKey);
    const replyTo = args.replyTo ?? getDefaultReplyTo() ?? undefined;
    // Build List-Unsubscribe pair when caller supplies an unsub URL.
    // Mailto fallback uses replyTo when set (preferred — actively monitored)
    // or the from-address when not. Extract bare email from "Name <email>"
    // form. Per RFC 8058 + Gmail bulk-sender Feb 2024.
    const headers: Record<string, string> | undefined = args.unsubscribeUrl
      ? (() => {
          const mailtoSource = replyTo || args.from || getDefaultFrom();
          const angleMatch = mailtoSource.match(/<([^>]+)>/);
          const bareEmail = angleMatch ? angleMatch[1] : mailtoSource;
          return {
            "List-Unsubscribe": `<${args.unsubscribeUrl}>, <mailto:${bareEmail}?subject=Unsubscribe>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          };
        })()
      : undefined;
    const r = await client.emails.send({
      from: args.from ?? getDefaultFrom(),
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
