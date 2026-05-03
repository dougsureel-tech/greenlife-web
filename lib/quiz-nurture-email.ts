import "server-only";

// Strain-finder quiz nurture-email templates — Hack #6.
//
// Three branded transactional templates fired from the quiz-capture
// nurture series:
//
//   • D+0  — `sendQuizMatchEmail`         "Your strain match is in"
//   • D+5  — `sendQuizPickupTipsEmail`    "What to expect at pickup"
//   • D+12 — `sendQuizFirstVisitDealEmail` "Your first-visit deal — last days"
//
// **Channel:** mixed transactional/marketing. The recipient explicitly
// opted in via the quiz capture step ("Get your match emailed + a
// first-visit deal" + email entry). CAN-SPAM treats this as marketing
// because the user requested promotional follow-up; we include a
// one-click STOP-to-unsubscribe link with a per-row `unsubscribe_token`
// (256-bit `crypto.randomBytes(32).toString('hex')` generated at capture
// time) so honoring an unsub request is single-click, not an email
// thread.
//
// **Gating:** D+0 dispatch from `app/api/quiz/capture/route.ts` is gated
// by `QUIZ_NURTURE_ENABLED=true` env var. D+5 + D+12 are dispatched by
// the inventoryapp-side `/api/cron/quiz-nurture` cron (gated by the
// `quiz_capture_nurture` feature flag); D+5 + D+12 do NOT use this
// helper — they call the inventoryapp's own Resend setup directly. This
// file exists only for the D+0 send from the public-site repos.
//
// **XSS:** every user-controlled string (firstName, vibe, strainType)
// is escaped via the local `safe()` helper before HTML interpolation.
// Static template strings (greeting, subject, footer copy) do not need
// escaping. Tokens are generated server-side from
// `crypto.randomBytes(32)` so they pass URL-safe-by-construction
// (hex chars only) — no need to escape in `href` attributes.
//
// **Failure mode:** never throws. On send failure we log a single
// `[quiz-nurture-email] send failed: <error>` line WITHOUT the recipient
// address. The capture row is already committed before this fires.

import { sendEmail, isEmailConfigured } from "./email";

// Tiny HTML escape — keep self-contained so the file has no extra deps.
const safe = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]!));

// Wenatchee palette — matches `lib/order-confirmation-email.ts`.
const COLORS = {
  bgPage: "#f5f5f4",
  bgCard: "#ffffff",
  border: "#e7e5e4",
  textBody: "#1c1917",
  textMuted: "#57534e",
  textFaint: "#78716c",
  headerBg: "linear-gradient(135deg,#14532d 0%,#166534 50%,#15803d 100%)",
  headerText: "#86efac",
  accentText: "#15803d",
  accentBg: "#f0fdf4",
  buttonBg: "#15803d",
  buttonText: "#ffffff",
  divider: "#e7e5e4",
} as const;

// Public site origin — used to build the unsubscribe deep link. Falls
// back to the apex production URL when the env var isn't set (preview /
// local dev). Never throws; the link still renders, just hits a
// guaranteed-existing host.
const PUBLIC_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://greenlifecannabis.com";

function unsubscribeUrl(token: string): string {
  // Token is hex (`[0-9a-f]{64}`) so URL-safe by construction — no
  // encodeURIComponent needed. Helper still applies it as defense in
  // depth in case the generator ever changes.
  return `${PUBLIC_ORIGIN}/quiz/unsubscribe?token=${encodeURIComponent(token)}`;
}

// ── Shared layout helpers ───────────────────────────────────────────────

function renderBaseHtml(args: {
  storeName: string;
  headline: string;
  bodyHtml: string;
  unsubscribeToken: string;
}): string {
  const safeStoreName = safe(args.storeName);
  const safeHeadline = safe(args.headline);
  const unsubUrl = unsubscribeUrl(args.unsubscribeToken);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${safeHeadline} — ${safeStoreName}</title>
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
          ${safeHeadline}
        </p>
      </td></tr>

      <tr><td style="padding:28px 28px 8px;">${args.bodyHtml}</td></tr>

      <tr><td style="padding:18px 28px 22px;border-top:1px solid ${COLORS.divider};background:${COLORS.bgPage};">
        <p style="margin:0 0 6px;font-size:11px;color:${COLORS.textFaint};line-height:1.6;">
          You're getting this because you opted in via the strain-finder quiz at ${safeStoreName}.
        </p>
        <p style="margin:0;font-size:11px;color:${COLORS.textFaint};line-height:1.6;">
          <a href="${unsubUrl}" style="color:${COLORS.accentText};text-decoration:underline;">Unsubscribe</a>
          &nbsp;·&nbsp; Reply STOP to opt out anytime.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function renderBaseText(args: {
  storeName: string;
  headline: string;
  bodyText: string;
  unsubscribeToken: string;
}): string {
  const unsubUrl = unsubscribeUrl(args.unsubscribeToken);
  return [
    `${args.storeName} — ${args.headline}`,
    "",
    args.bodyText,
    "",
    "—",
    `Opted in via strain-finder quiz at ${args.storeName}.`,
    `Unsubscribe: ${unsubUrl}`,
    "(or reply STOP to opt out)",
  ].join("\n");
}

function vibeLine(vibe: string | null | undefined): string {
  if (!vibe) return "";
  // Map quiz keys to copy-friendly phrases.
  const m: Record<string, string> = {
    chill: "winding down",
    energize: "staying sharp",
    sleep: "easier sleep",
    creative: "creative flow",
    social: "good company",
  };
  return m[vibe] ?? vibe;
}

function strainPhrase(strainType: string | null | undefined): string {
  if (!strainType) return "all three (sativa / indica / hybrid)";
  const m: Record<string, string> = {
    sativa: "sativa (uplifting, daytime)",
    indica: "indica (relaxing, nighttime)",
    hybrid: "hybrid (best of both)",
  };
  return m[strainType] ?? strainType;
}

// ── D+0: "Your strain match is in" ──────────────────────────────────────

export type SendQuizMatchEmailArgs = {
  to: string;
  firstName: string | null;
  vibe: string | null;
  strainType: string | null;
  unsubscribeToken: string;
  storeName: string;
  deepLinkOrder: string;
  mapUrl: string;
};

export async function sendQuizMatchEmail(args: SendQuizMatchEmailArgs): Promise<void> {
  if (!args.to || !args.to.includes("@")) return;
  if (!isEmailConfigured()) return;

  const greeting = args.firstName ? safe(args.firstName) : "there";
  const safeVibe = safe(vibeLine(args.vibe));
  const safeStrain = safe(strainPhrase(args.strainType));
  const safeOrder = safe(args.deepLinkOrder);
  const safeMap = safe(args.mapUrl);

  const vibeBlock = safeVibe
    ? `<p style="margin:0 0 12px;font-size:15px;color:${COLORS.textBody};line-height:1.6;">
         You picked: <strong style="color:${COLORS.accentText};">${safeVibe}</strong> · <strong style="color:${COLORS.accentText};">${safeStrain}</strong>.
       </p>`
    : `<p style="margin:0 0 12px;font-size:15px;color:${COLORS.textBody};line-height:1.6;">
         You picked: <strong style="color:${COLORS.accentText};">${safeStrain}</strong>.
       </p>`;

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${COLORS.textBody};">
      Hey ${greeting} — thanks for taking the quiz. Here's where to start.
    </p>

    ${vibeBlock}

    <div style="background:${COLORS.accentBg};border-radius:10px;padding:16px 18px;margin:8px 0 20px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${COLORS.accentText};">
        Your live menu
      </p>
      <p style="margin:0 0 12px;font-size:14px;color:${COLORS.textBody};line-height:1.5;">
        We pre-filtered to your match. The strains shift as inventory turns over —
        click through to see what's actually on the shelf right now.
      </p>
      <a href="${safeOrder}" style="display:inline-block;background:${COLORS.buttonBg};color:${COLORS.buttonText};font-weight:600;font-size:14px;padding:11px 22px;border-radius:8px;text-decoration:none;letter-spacing:0.02em;">
        See your matches →
      </a>
    </div>

    <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${COLORS.textMuted};">
      First visit?
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:${COLORS.textBody};line-height:1.6;">
      Bring a valid 21+ ID and cash. Pickup only — order online or walk in.
      <a href="${safeMap}" style="color:${COLORS.accentText};text-decoration:underline;">Get directions</a>.
    </p>

    <p style="margin:24px 0 0;font-size:13px;color:${COLORS.textFaint};line-height:1.6;">
      We'll send two more notes: what to expect at pickup, and a first-visit deal that expires.
      That's it — no spam.
    </p>`;

  const bodyText = [
    `Hey ${args.firstName ?? "there"} — thanks for taking the quiz. Here's where to start.`,
    "",
    safeVibe ? `You picked: ${vibeLine(args.vibe)} · ${strainPhrase(args.strainType)}.` : `You picked: ${strainPhrase(args.strainType)}.`,
    "",
    "Your live menu (pre-filtered to your match):",
    args.deepLinkOrder,
    "",
    "First visit? Bring a valid 21+ ID and cash. Pickup only — order online or walk in.",
    `Directions: ${args.mapUrl}`,
    "",
    "We'll send two more notes: what to expect at pickup, and a first-visit deal that expires. That's it — no spam.",
  ].join("\n");

  const subject = `Your strain match is in — ${args.storeName}`;
  const html = renderBaseHtml({
    storeName: args.storeName,
    headline: "Your strain match is in",
    bodyHtml,
    unsubscribeToken: args.unsubscribeToken,
  });
  const text = renderBaseText({
    storeName: args.storeName,
    headline: "Your strain match is in",
    bodyText,
    unsubscribeToken: args.unsubscribeToken,
  });

  const result = await sendEmail({ to: args.to, subject, html, text });
  if (!result.ok && !result.skipped) {
    console.error(`[quiz-nurture-email] D+0 send failed: ${result.error}`);
  }
}

// ── D+5: "What to expect at pickup" ─────────────────────────────────────

export type SendQuizPickupTipsEmailArgs = {
  to: string;
  firstName: string | null;
  unsubscribeToken: string;
  storeName: string;
  mapUrl: string;
  hoursText: string;
};

export async function sendQuizPickupTipsEmail(args: SendQuizPickupTipsEmailArgs): Promise<void> {
  if (!args.to || !args.to.includes("@")) return;
  if (!isEmailConfigured()) return;

  const greeting = args.firstName ? safe(args.firstName) : "there";
  const safeHours = safe(args.hoursText);
  const safeMap = safe(args.mapUrl);
  const safeStore = safe(args.storeName);

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${COLORS.textBody};">
      Hey ${greeting} — quick prep notes for your first stop at ${safeStore}.
    </p>

    <ul style="margin:0 0 18px 0;padding:0 0 0 20px;font-size:14px;color:${COLORS.textBody};line-height:1.7;">
      <li><strong>21+ ID</strong> — government-issued, not expired. We check every visit.</li>
      <li><strong>Cash only</strong> — federal banking rules. There's an ATM on-site if you forget.</li>
      <li><strong>Pickup only</strong> — order online, we text when it's ready, you walk in.</li>
      <li><strong>Hours:</strong> ${safeHours}</li>
    </ul>

    <div style="background:${COLORS.accentBg};border-radius:10px;padding:16px 18px;margin:8px 0 20px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${COLORS.accentText};">
        Where we're at
      </p>
      <a href="${safeMap}" style="display:inline-block;margin-top:6px;background:${COLORS.buttonBg};color:${COLORS.buttonText};font-weight:600;font-size:14px;padding:11px 22px;border-radius:8px;text-decoration:none;letter-spacing:0.02em;">
        Get directions
      </a>
    </div>

    <p style="margin:0 0 0;font-size:13px;color:${COLORS.textFaint};line-height:1.6;">
      Questions? Reply to this email — it goes to a real person on our side.
      One more note coming in a week with your first-visit deal.
    </p>`;

  const bodyText = [
    `Hey ${args.firstName ?? "there"} — quick prep notes for your first stop at ${args.storeName}.`,
    "",
    "  - 21+ ID (government-issued, not expired). We check every visit.",
    "  - Cash only — federal banking rules. ATM on-site.",
    "  - Pickup only — order online, we text when ready, walk in.",
    `  - Hours: ${args.hoursText}`,
    "",
    `Directions: ${args.mapUrl}`,
    "",
    "Questions? Reply to this email — it goes to a real person.",
    "One more note coming in a week with your first-visit deal.",
  ].join("\n");

  const subject = `What to expect at pickup — ${args.storeName}`;
  const html = renderBaseHtml({
    storeName: args.storeName,
    headline: "What to expect at pickup",
    bodyHtml,
    unsubscribeToken: args.unsubscribeToken,
  });
  const text = renderBaseText({
    storeName: args.storeName,
    headline: "What to expect at pickup",
    bodyText,
    unsubscribeToken: args.unsubscribeToken,
  });

  const result = await sendEmail({ to: args.to, subject, html, text });
  if (!result.ok && !result.skipped) {
    console.error(`[quiz-nurture-email] D+5 send failed: ${result.error}`);
  }
}

// ── D+12: "Your first-visit deal — last days" ───────────────────────────

export type SendQuizFirstVisitDealEmailArgs = {
  to: string;
  firstName: string | null;
  unsubscribeToken: string;
  storeName: string;
  dealText: string;
  expiresOn: string;
};

export async function sendQuizFirstVisitDealEmail(
  args: SendQuizFirstVisitDealEmailArgs,
): Promise<void> {
  if (!args.to || !args.to.includes("@")) return;
  if (!isEmailConfigured()) return;

  const greeting = args.firstName ? safe(args.firstName) : "there";
  const safeDeal = safe(args.dealText);
  const safeExpires = safe(args.expiresOn);
  const safeStore = safe(args.storeName);

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${COLORS.textBody};">
      Hey ${greeting} — last note. Your first-visit deal is still good through
      <strong style="color:${COLORS.accentText};">${safeExpires}</strong>.
    </p>

    <div style="background:${COLORS.accentBg};border-radius:10px;padding:18px 22px;margin:0 0 20px;text-align:center;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${COLORS.accentText};">
        First-visit deal
      </p>
      <p style="margin:0;font-size:18px;font-weight:700;color:${COLORS.textBody};line-height:1.3;">
        ${safeDeal}
      </p>
    </div>

    <p style="margin:0 0 16px;font-size:14px;color:${COLORS.textBody};line-height:1.6;">
      Show this email at the counter (or just tell the budtender it's your
      first visit) and they'll apply it. One per customer. Cash + 21+ ID required.
    </p>

    <p style="margin:0 0 0;font-size:13px;color:${COLORS.textFaint};line-height:1.6;">
      That's the last note from this series. We'll only email you again if you
      sign up for the loyalty program at ${safeStore}.
    </p>`;

  const bodyText = [
    `Hey ${args.firstName ?? "there"} — last note. Your first-visit deal is still good through ${args.expiresOn}.`,
    "",
    `First-visit deal: ${args.dealText}`,
    "",
    "Show this email at the counter (or just tell the budtender it's your first visit) and they'll apply it. One per customer. Cash + 21+ ID required.",
    "",
    `That's the last note from this series. We'll only email you again if you sign up for the loyalty program at ${args.storeName}.`,
  ].join("\n");

  const subject = `Your first-visit deal — last days · ${args.storeName}`;
  const html = renderBaseHtml({
    storeName: args.storeName,
    headline: "Your first-visit deal — last days",
    bodyHtml,
    unsubscribeToken: args.unsubscribeToken,
  });
  const text = renderBaseText({
    storeName: args.storeName,
    headline: "Your first-visit deal — last days",
    bodyText,
    unsubscribeToken: args.unsubscribeToken,
  });

  const result = await sendEmail({ to: args.to, subject, html, text });
  if (!result.ok && !result.skipped) {
    console.error(`[quiz-nurture-email] D+12 send failed: ${result.error}`);
  }
}
