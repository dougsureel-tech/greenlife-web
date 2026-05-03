import "server-only";

// Welcome email sender — branded transactional template fired the first
// time a Clerk-authenticated customer's `portal_users` sidecar row is
// inserted (i.e. once per account, ever). Mirrors the shape of
// `lib/order-confirmation-email.ts`: same `sendEmail()` primitive, same
// HTML escape, same env-var gate, same per-store palette.
//
// **Channel:** transactional (CAN-SPAM "transactional / relationship"
// category — sent in response to the user's own signup action). Footer
// still includes a STOP / `info@` opt-out line for marketing-channel
// hygiene + parity with the order-confirmation template; one-click unsub
// will land alongside the inventoryapp `portal_users.email_opt_in`
// column migration.
//
// **Gating:** dispatch is gated by `WELCOME_EMAIL_ENABLED=true` at the
// call site (env-var pattern, default OFF). Same rationale as
// `ORDER_CONFIRMATION_EMAIL_ENABLED` — public-site repos have no read
// path into inventoryapp's `feature_flags` Postgres table, so the env
// var is the lightweight on/off switch Doug toggles in Vercel and
// re-deploys. See docs/email-infra.md.
//
// **Idempotency:** the caller must guarantee this fires at most once per
// portal-user row creation. Today that contract lives in
// `lib/portal.ts → getOrCreatePortalUser()` which returns a `created`
// flag derived from whether the SELECT-then-INSERT-on-conflict path hit
// an empty SELECT (true first-time signup) or an existing row (returning
// session). The Clerk webhook path is intentionally NOT used — it would
// fire on every `user.created` event regardless of whether our sidecar
// row was the new piece of state, and would require Svix signature infra
// we don't have set up.
//
// **XSS:** every user-controlled string (firstName) and every dynamic
// store string (storeName, storeAddress, mapUrl, hoursText,
// deepLinkOrder) is escaped via the local `safe()` helper before
// interpolation. Static template literals do not need escaping.
//
// **Failure mode:** never throws. On send failure we log a single line
// (no PII / no email address) and return — signup is already committed
// and the customer is already in `/account`.

import { sendEmail, isEmailConfigured } from "./email";
import { STORE } from "./store";

export type WelcomeEmailArgs = {
  to: string;
  firstName: string | null;
  storeName: string;
  storeAddress: string;
  mapUrl: string;
  hoursText: string;
  deepLinkOrder: string;
};

// Tiny HTML escape — keep self-contained so the file has no extra deps.
const safe = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]!));

// Wenatchee palette — matches the order-confirmation template + the
// SiteHeader green-700/800 + the inventoryapp email gradient.
const COLORS = {
  bgPage: "#f5f5f4", // stone-100
  bgCard: "#ffffff",
  border: "#e7e5e4", // stone-200
  textBody: "#1c1917", // stone-900
  textMuted: "#57534e", // stone-600
  textFaint: "#78716c", // stone-500
  headerBg: "linear-gradient(135deg,#14532d 0%,#166534 50%,#15803d 100%)",
  headerText: "#86efac", // green-300
  accentText: "#15803d", // green-700
  accentBg: "#f0fdf4", // green-50
  buttonBg: "#15803d", // green-700
  buttonText: "#ffffff",
  divider: "#e7e5e4",
} as const;

function buildHtml(args: WelcomeEmailArgs): string {
  const { firstName, storeName, storeAddress, mapUrl, hoursText, deepLinkOrder } = args;

  const greetingName = firstName ? safe(firstName) : "there";
  const safeStoreName = safe(storeName);
  const safeStoreAddress = safe(storeAddress);
  const safeMapUrl = safe(mapUrl);
  const safeHours = safe(hoursText);
  const safeDeepLink = safe(deepLinkOrder);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Welcome to ${safeStoreName}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.bgPage};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${COLORS.textBody};">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bgPage};padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${COLORS.bgCard};border:1px solid ${COLORS.border};border-radius:14px;overflow:hidden;">
      <tr><td style="background:${COLORS.headerBg};padding:24px 28px;">
        <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.headerText};font-weight:700;">
          ${safeStoreName}
        </p>
        <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:#ffffff;line-height:1.3;">
          Welcome to the shop
        </p>
      </td></tr>

      <tr><td style="padding:28px 28px 8px;">
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${COLORS.textBody};">
          Hey ${greetingName} — thanks for joining us. Your account is set up
          and you can place a pickup order any time.
        </p>

        <div style="background:${COLORS.accentBg};border-radius:10px;padding:16px 18px;margin:8px 0 20px;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${COLORS.accentText};">
            First-visit essentials
          </p>
          <p style="margin:0 0 6px;font-size:14px;color:${COLORS.textBody};line-height:1.55;">
            <strong>Cash only.</strong> Federal banking rules — there's an ATM in the lobby.
          </p>
          <p style="margin:0 0 6px;font-size:14px;color:${COLORS.textBody};line-height:1.55;">
            <strong>Bring ID, 21+.</strong> Government-issued. Every visit, every time — WSLCB rules.
          </p>
          <p style="margin:0;font-size:14px;color:${COLORS.textBody};line-height:1.55;">
            <strong>Hours:</strong> ${safeHours}
          </p>
        </div>

        <a href="${safeDeepLink}" style="display:inline-block;background:${COLORS.buttonBg};color:${COLORS.buttonText};font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;letter-spacing:0.02em;">
          Browse the menu
        </a>

        <div style="border-top:1px solid ${COLORS.divider};padding-top:18px;margin-top:24px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${COLORS.textMuted};">
            Find us
          </p>
          <p style="margin:0 0 12px;font-size:14px;color:${COLORS.textBody};line-height:1.5;">
            ${safeStoreAddress}
          </p>
          <a href="${safeMapUrl}" style="display:inline-block;color:${COLORS.accentText};font-weight:600;font-size:14px;text-decoration:underline;">
            Get directions →
          </a>
        </div>

        <p style="margin:24px 0 0;font-size:13px;color:${COLORS.textFaint};line-height:1.6;">
          Questions? Just reply to this email — it goes straight to the team.
        </p>
      </td></tr>

      <tr><td style="padding:18px 28px 22px;border-top:1px solid ${COLORS.divider};background:${COLORS.bgPage};">
        <p style="margin:0;font-size:11px;color:${COLORS.textFaint};line-height:1.6;">
          You're getting this because you just created an account at ${safeStoreName}.
          To stop future marketing emails, reply STOP or email
          <a href="mailto:info@greenlifecannabis.com" style="color:${COLORS.accentText};text-decoration:underline;">info@greenlifecannabis.com</a>.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function buildText(args: WelcomeEmailArgs): string {
  const { firstName, storeName, storeAddress, mapUrl, hoursText, deepLinkOrder } = args;
  const greeting = firstName ?? "there";
  return [
    `${storeName} — welcome to the shop`,
    "",
    `Hey ${greeting} — thanks for joining us. Your account is set up and you can place a pickup order any time.`,
    "",
    "First-visit essentials:",
    "  - Cash only. Federal banking rules — there's an ATM in the lobby.",
    "  - Bring ID, 21+. Government-issued, every visit, every time — WSLCB rules.",
    `  - Hours: ${hoursText}`,
    "",
    `Browse the menu: ${deepLinkOrder}`,
    "",
    `Find us: ${storeAddress}`,
    `Directions: ${mapUrl}`,
    "",
    "Questions? Reply to this email — it goes straight to the team.",
    "",
    "—",
    `Welcome email from ${storeName}. To stop future marketing emails, reply STOP or email info@greenlifecannabis.com.`,
  ].join("\n");
}

/** Send a welcome email. Never throws. No-ops silently when:
 *  - `to` is empty / missing / lacks an `@`
 *  - `RESEND_API_KEY` is not configured (handled inside sendEmail)
 *  - `WELCOME_EMAIL_ENABLED` is not "true" (caller is responsible for the
 *    flag check; this helper performs a defense-in-depth re-check)
 *
 *  The CALLER also owns the once-per-portal-user contract — fire only when
 *  `getOrCreatePortalUser()` reports `created: true`. This helper has no
 *  way to verify that on its own. */
export async function sendWelcomeEmail(args: WelcomeEmailArgs): Promise<void> {
  if (!args.to || !args.to.includes("@")) {
    // No address on file — silent skip, no PII on this path.
    return;
  }
  if (process.env.WELCOME_EMAIL_ENABLED !== "true") {
    // Defense in depth — the caller already gates this, but if a refactor
    // ever drops the gate we still no-op rather than emailing customers
    // before Doug has flipped the env var ON.
    return;
  }
  if (!isEmailConfigured()) {
    // sendEmail() will log its own no-op line; no need to double-log here.
    return;
  }

  const subject = `Welcome to ${args.storeName}`;
  const html = buildHtml(args);
  const text = buildText(args);

  const result = await sendEmail({ to: args.to, subject, html, text });
  if (!result.ok && !result.skipped) {
    // Log without recipient — there's no orderId / portalUserId hook here
    // since we'd rather log nothing identifiable than a Clerk userId.
    console.error(`[welcome-email] send failed: ${result.error}`);
  }
}

// Re-export STORE to keep callers from importing it twice — purely for
// ergonomics; callers can also import directly from `@/lib/store`.
export { STORE };
