import "server-only";

// Order-confirmation email sender — branded transactional template fired
// after a customer places an order through `/api/orders`. Wraps the generic
// `sendEmail()` helper from `lib/email.ts` with Green Life Cannabis's green
// palette and store-specific copy.
//
// **Channel:** transactional (legally exempt from email-marketing opt-in
// under CAN-SPAM / WA — receipts for a transaction the recipient initiated).
// We still include a STOP-to-unsubscribe footer line for marketing-channel
// hygiene + parity with our SMS pattern; that footer points at our
// `info@` address rather than wiring a one-click unsub link until the
// `portal_users.email_opt_in` column ships from inventoryapp's migration.
//
// **Gating:** dispatch is gated by `ORDER_CONFIRMATION_EMAIL_ENABLED=true`
// at the call site (env-var pattern, default OFF). Public-site repos have
// no read path into inventoryapp's `feature_flags` Postgres table (no HMAC
// endpoint exists for it), so we use the env var for the same on/off
// effect — Doug toggles in Vercel and re-deploys. See docs/email-infra.md.
//
// **XSS:** every user-controlled string (firstName + each productName) is
// escaped via the local `safe()` helper before interpolation. Numeric
// fields (subtotal, quantity, unit price) are formatted server-side and
// never come from user input directly. Static template literals do not
// need escaping.
//
// **Failure mode:** never throws. On send failure we log a single line
// (no PII) and return — the order itself is already committed and the
// SMS dispatch has already fired (or no-opped).

import { sendEmail, isEmailConfigured } from "./email";
import { STORE } from "./store";

export type OrderConfirmationItem = {
  productName: string;
  quantity: number;
  unitPrice: number;
};

export type OrderConfirmationArgs = {
  to: string;
  firstName: string | null;
  orderId: string;
  items: OrderConfirmationItem[];
  subtotal: number;
  pickupWindowText: string;
  storeName: string;
  storeAddress: string;
  mapUrl: string;
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

const fmtUsd = (n: number): string =>
  `$${(Math.round(n * 100) / 100).toFixed(2)}`;

// Wenatchee palette — matches SiteHeader (green-700/800) + the inventoryapp
// email template (#14532d → #166534 → #15803d header gradient).
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

function buildHtml(args: OrderConfirmationArgs): string {
  const {
    firstName,
    orderId,
    items,
    subtotal,
    pickupWindowText,
    storeName,
    storeAddress,
    mapUrl,
  } = args;

  const greetingName = firstName ? safe(firstName) : "there";
  const safeOrderId = safe(orderId.slice(0, 8));
  const safeStoreName = safe(storeName);
  const safeStoreAddress = safe(storeAddress);
  const safeMapUrl = safe(mapUrl);
  const safePickup = safe(pickupWindowText);

  const itemRows = items
    .map((it) => {
      const name = safe(it.productName);
      const qty = Number.isInteger(it.quantity) ? it.quantity : 1;
      const line = fmtUsd(it.unitPrice * qty);
      return `<tr>
        <td style="padding:10px 0;border-bottom:1px solid ${COLORS.divider};font-size:14px;color:${COLORS.textBody};">
          ${name}
          <span style="color:${COLORS.textFaint};font-size:13px;"> · ${qty}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${COLORS.divider};font-size:14px;color:${COLORS.textBody};text-align:right;font-variant-numeric:tabular-nums;">
          ${line}
        </td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Order received — ${safeStoreName}</title>
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
          We got your order
        </p>
      </td></tr>

      <tr><td style="padding:28px 28px 8px;">
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${COLORS.textBody};">
          Hey ${greetingName} — thanks for ordering with us. Your pickup is locked in.
        </p>

        <div style="background:${COLORS.accentBg};border-radius:10px;padding:16px 18px;margin:8px 0 20px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${COLORS.accentText};">
            Pickup window
          </p>
          <p style="margin:0;font-size:16px;font-weight:600;color:${COLORS.textBody};">
            ${safePickup}
          </p>
        </div>

        <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${COLORS.textMuted};">
          Order #${safeOrderId}
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 16px;">
          ${itemRows}
          <tr>
            <td style="padding:14px 0 0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${COLORS.textMuted};">
              Subtotal
            </td>
            <td style="padding:14px 0 0;font-size:16px;font-weight:700;color:${COLORS.textBody};text-align:right;font-variant-numeric:tabular-nums;">
              ${fmtUsd(subtotal)}
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding:4px 0 0;font-size:12px;color:${COLORS.textFaint};">
              Tax calculated at pickup. Cash only.
            </td>
          </tr>
        </table>

        <div style="border-top:1px solid ${COLORS.divider};padding-top:18px;margin-top:8px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${COLORS.textMuted};">
            Pickup at
          </p>
          <p style="margin:0 0 12px;font-size:14px;color:${COLORS.textBody};line-height:1.5;">
            ${safeStoreAddress}
          </p>
          <a href="${safeMapUrl}" style="display:inline-block;background:${COLORS.buttonBg};color:${COLORS.buttonText};font-weight:600;font-size:14px;padding:11px 22px;border-radius:8px;text-decoration:none;letter-spacing:0.02em;">
            Get directions
          </a>
        </div>

        <p style="margin:24px 0 0;font-size:13px;color:${COLORS.textFaint};line-height:1.6;">
          Bring a valid government-issued ID (21+) and cash. We'll text you when your order is ready.
        </p>
      </td></tr>

      <tr><td style="padding:18px 28px 22px;border-top:1px solid ${COLORS.divider};background:${COLORS.bgPage};">
        <p style="margin:0;font-size:11px;color:${COLORS.textFaint};line-height:1.6;">
          You're getting this because you placed an order at ${safeStoreName}.
          This is a transactional confirmation — to stop future marketing emails,
          reply STOP or email <a href="mailto:info@greenlifecannabis.com" style="color:${COLORS.accentText};text-decoration:underline;">info@greenlifecannabis.com</a>.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function buildText(args: OrderConfirmationArgs): string {
  const { firstName, orderId, items, subtotal, pickupWindowText, storeName, storeAddress, mapUrl } = args;
  const greeting = firstName ?? "there";
  const lines = items
    .map((it) => {
      const qty = Number.isInteger(it.quantity) ? it.quantity : 1;
      return `  - ${it.productName} x${qty}  ${fmtUsd(it.unitPrice * qty)}`;
    })
    .join("\n");
  return [
    `${storeName} — order received`,
    "",
    `Hey ${greeting} — thanks for ordering. Your pickup is locked in.`,
    "",
    `Pickup window: ${pickupWindowText}`,
    `Order #${orderId.slice(0, 8)}`,
    "",
    "Items:",
    lines,
    "",
    `Subtotal: ${fmtUsd(subtotal)}  (tax calculated at pickup; cash only)`,
    "",
    `Pickup at: ${storeAddress}`,
    `Directions: ${mapUrl}`,
    "",
    "Bring a valid government-issued ID (21+) and cash. We'll text you when your order is ready.",
    "",
    "—",
    `Transactional confirmation from ${storeName}. To stop future marketing emails, reply STOP or email info@greenlifecannabis.com.`,
  ].join("\n");
}

/** Send an order-confirmation email. Never throws. No-ops silently when:
 *  - `to` is empty / missing
 *  - `RESEND_API_KEY` is not configured (handled inside sendEmail)
 *  - `ORDER_CONFIRMATION_EMAIL_ENABLED` is not "true" (caller is responsible
 *    for the flag check; this helper performs a defense-in-depth re-check) */
export async function sendOrderConfirmationEmail(
  args: OrderConfirmationArgs,
): Promise<void> {
  if (!args.to || !args.to.includes("@")) {
    // No address on file — silent skip, no PII on this path.
    return;
  }
  if (process.env.ORDER_CONFIRMATION_EMAIL_ENABLED !== "true") {
    // Defense in depth — the caller already gates this, but if a refactor
    // ever drops the gate we still no-op rather than emailing customers
    // before Doug has flipped the env var ON.
    return;
  }
  if (!isEmailConfigured()) {
    // sendEmail() will log its own no-op line; no need to double-log here.
    return;
  }

  const subject = `${args.storeName} — order received (pickup ${args.pickupWindowText})`;
  const html = buildHtml(args);
  const text = buildText(args);

  const result = await sendEmail({ to: args.to, subject, html, text });
  if (!result.ok && !result.skipped) {
    // Log without recipient — the orderId is enough for a backtrace.
    console.error(
      `[order-confirmation-email] send failed for order ${args.orderId.slice(0, 8)}: ${result.error}`,
    );
  }
}

// Re-export STORE to keep callers from importing it twice — purely for
// ergonomics; callers can also import directly from `@/lib/store`.
export { STORE };
