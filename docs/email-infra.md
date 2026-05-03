# Email infrastructure (Resend)

How the public site sends transactional + marketing email.

## Overview

`lib/email.ts` is the single send-surface. It wraps the [Resend](https://resend.com) Node SDK with:

- A simple `sendEmail({ to, subject, html, text?, from?, replyTo? })` signature
- Graceful no-op when `RESEND_API_KEY` is unset (dev / preview environments) — returns `{ ok: false, skipped: true, error: "RESEND_API_KEY not configured" }` and logs a single info line **without** the recipient address
- Defensive id extraction across Resend SDK response-shape variations
- `isEmailConfigured()` helper for UI gating ("we'll email you a copy" copy should hide when sends will no-op)

## Required env vars

| Var | Required for sends? | Default |
|---|---|---|
| `RESEND_API_KEY` | **Yes** | (unset → no-op) |
| `RESEND_FROM` | No | `Green Life Cannabis <hi@greenlifecannabis.com>` |
| `ORDER_CONFIRMATION_EMAIL_ENABLED` | Per-feature gate | `"false"` (off until set to `"true"`) |
| `WELCOME_EMAIL_ENABLED` | Per-feature gate | `"false"` (off until set to `"true"`) |
| `QUIZ_NURTURE_ENABLED` | Per-feature gate (Hack #6) | `"false"` — gates the public-site D+0 capture API |
| `NEXT_PUBLIC_QUIZ_NURTURE_ENABLED` | Per-feature gate (Hack #6, client-visible) | `"false"` — gates the capture-card render in `StrainFinderClient.tsx` |
| `NEXT_PUBLIC_SITE_ORIGIN` | No | `https://greenlifecannabis.com` — used when building unsubscribe URLs in nurture emails |

Set on each Vercel project (greenlife-web preview + production). Without `RESEND_API_KEY`, `sendEmail()` returns the no-op result and never throws — safe to call from any Server Action / route handler.

**Why an env var instead of a feature flag?** The inventoryapp `feature_flags` Postgres table is owned by a different Neon DB; this public-site repo has no cross-DB read path (and adding one would mean a new HMAC-signed `/api/feature-flags/[key]` endpoint on inventoryapp + caching here — disproportionate for an on/off switch we'll flip once). The env-var approach mirrors the same flip-once-and-redeploy pattern Doug already uses for `RESEND_API_KEY` itself, with no new infra.

## Verified-domain prerequisite (Doug-action)

Resend will only deliver from a verified domain. Before the first real send:

1. Sign in to [resend.com/domains](https://resend.com/domains).
2. Add `greenlifecannabis.com` (and `seattlecannabis.co` for the SCC project).
3. Add the SPF + DKIM + DMARC DNS records Resend shows to GoDaddy (see memory `reference_godaddy_api`).
4. Wait for verification (~5 min).
5. **Paste the API key into Vercel** (`Settings → Environment Variables → RESEND_API_KEY`, all envs).
6. Redeploy.

Until step 5 is done, every `sendEmail()` call hits the no-op path. That's fine — UI promises gated by `isEmailConfigured()` won't lie to customers.

## Calling pattern (Server Action)

```ts
"use server";

import { sendEmail, isEmailConfigured } from "@/lib/email";

export async function notifyOrderReceived(orderId: string, to: string) {
  if (!isEmailConfigured()) return { ok: false, skipped: true };

  const result = await sendEmail({
    to,
    subject: "We got your order",
    html: `<p>Order <strong>${orderId}</strong> received. We'll text when it's ready.</p>`,
  });

  if (!result.ok) {
    console.error("[notifyOrderReceived] send failed:", result.error);
    // Don't throw — email is a nice-to-have, never block the order
    return result;
  }
  return result;
}
```

## XSS responsibility

`html` is sent **verbatim** to Resend. The helper does **not** sanitize. Callers must escape any user-supplied content before interpolation. For static transactional templates (order receipt, welcome email, deal digest) this is a non-issue. When echoing user input back (name, search query, freeform notes), use a tiny escape helper:

```ts
const safe = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]!));
```

For richer templates, mirror the inventoryapp pattern in `Inventory App/src/lib/email.ts` — it has a shared `base()` template wrapper + branded `btn()` button helper that you can copy here when the first real template lands.

## Customer email opt-in (Phase 2 — pending)

Customer state is a hybrid:

- **Clerk** — auth, email address, profile name (managed via Clerk dashboard)
- **`portal_users`** sidecar Postgres row — loyalty points, sms_opt_in, order history (created lazily by `getOrCreatePortalUser()` in `lib/portal.ts`)

For email opt-in we'll add a `portal_users.email_opt_in BOOLEAN DEFAULT FALSE` column (parity with `sms_opt_in`). The schema is owned by the inventoryapp Drizzle migrations folder (`Inventory App/src/db/migrations/`), so the migration ships from there — not this repo. Until that lands, marketing-channel sends should explicitly verify each recipient's consent at the call site.

## Why Resend (not Mailgun / SendGrid / SES)

- One-line SDK, no auth dance
- Good free tier (3K/mo) covers the order-confirmation + nurture volume we expect through Q2 2026
- Same SDK + helper shape as the inventoryapp (`src/lib/email.ts`) — one mental model across all three Green Life repos
- Domain verification flow is straightforward (GoDaddy DNS records pasted directly)

## Wired send sites

| Send site | File | Gating |
|---|---|---|
| Order confirmation (pickup details + items) | `lib/order-confirmation-email.ts` → `sendOrderConfirmationEmail()`, fired from `app/api/orders/route.ts` after order INSERT commits, dispatched via `after()` | `ORDER_CONFIRMATION_EMAIL_ENABLED=true` AND `portal_users.email IS NOT NULL` AND `RESEND_API_KEY` set |
| Welcome (first-visit essentials) | `lib/welcome-email.ts` → `sendWelcomeEmail()`, fired from `app/account/page.tsx` (post-signup landing) inside `after()` only when `getOrCreatePortalUserWithCreated()` returns `created: true` | `WELCOME_EMAIL_ENABLED=true` AND `portal_users.email IS NOT NULL` AND `RESEND_API_KEY` set |
| Quiz capture D+0 (Hack #6 — "Your strain match is in") | `lib/quiz-nurture-email.ts` → `sendQuizMatchEmail()`, fired from `app/api/quiz/capture/route.ts` after the `quiz_captures` INSERT commits, dispatched via `after()` | `QUIZ_NURTURE_ENABLED=true` AND email passes regex validation AND `RESEND_API_KEY` set |
| Quiz nurture D+5 + D+12 (Hack #6 — "What to expect" + "Last days") | inventoryapp `src/app/api/cron/quiz-nurture/route.ts` (NOT this repo — the table lives in inventoryapp's Neon DB, the cron runs there, the Resend setup there sends per-store branded emails) | inventoryapp feature flag `quiz_capture_nurture` ON at `/admin/control-panel` |

**Order confirmation specifics:**

- Branded HTML + plain-text body — green header gradient mirrors the inventoryapp template + the SiteHeader `green-700` accent. Renders pickup window, order ID (8-char prefix), itemized list, subtotal, store address with "Get directions" button.
- Customer email is sourced from `portal_users.email` (created lazily by `getOrCreatePortalUser()` in `lib/portal.ts` from Clerk's `emailAddresses[0]?.emailAddress`).
- `firstName` is derived from `portal_users.name` (first whitespace-split token); falls back to "there" when null.
- `subtotal` is recomputed from the request items (matches the cart, not the server-recomputed `placeOrder` total) so the email matches what the customer just saw on the cart page. The authoritative price for billing purposes lives in `online_orders.order_total`; this is a receipt confirmation, not a billing document.
- Send happens inside `after()` — order response is sent to the browser BEFORE the email dispatches. Resend latency or failure can never block order placement.
- On send failure we log a single line `[order-confirmation-email] send failed for order <8-char-id>: <error>` (no recipient, no body content). The order is committed and the SMS already fired; the email is best-effort.
- Transactional under CAN-SPAM (receipt for a transaction the recipient initiated). The footer still includes a STOP / `info@greenlifecannabis.com` opt-out line for marketing-channel hygiene + parity with our SMS pattern. When the inventoryapp `portal_users.email_opt_in` migration ships we'll wire one-click unsub here.
- **No audit-log write.** The `customer_campaign_touches` table lives in inventoryapp's Neon DB; there is no clean cross-DB write path from this repo. This matches the existing pickup SMS dispatch in the same file, which also doesn't audit-log here.

**Welcome email specifics:**

- Branded HTML + plain-text body — same green header gradient as the order-confirmation template. Renders a warm greeting, a "First-visit essentials" callout (cash-only / 21+ ID / hours), a Browse-the-menu CTA button, and the store address with a Get-directions link. STOP / `info@greenlifecannabis.com` opt-out footer for marketing-channel hygiene.
- **Hook location:** `app/account/page.tsx`. Post-signup landing — Clerk's `SignUp` component uses `fallbackRedirectUrl="/account"` (the same page is also hit on every subsequent sign-in). Idempotency lives in `lib/portal.ts → getOrCreatePortalUserWithCreated()`, a sibling of the long-standing `getOrCreatePortalUser()` that returns `{ user, created }`. The `created` flag is `true` only when the SELECT returned no row AND the INSERT path took the new-row branch (`xmax = 0` on the RETURNING row, which distinguishes a fresh INSERT from an `ON CONFLICT DO UPDATE` outcome — handles the rare race where two parallel auth callbacks both miss the SELECT). Welcome dispatch is wrapped in `if (created && env-on && portalUser.email)` and runs inside `after()` so signup paint is never blocked by Resend latency.
- **Why not a Clerk webhook?** A `user.created` Svix webhook would require new infra (signature verification, env vars Doug doesn't have set, an exposed `/api/webhooks/clerk` route). The sidecar-INSERT signal is also strictly more accurate for our purposes — we want "first time we have a usable customer record" not "first time Clerk minted an auth identity" (those are not the same in flows that bounce off `/account` to `/menu` or `/order/confirmation`).
- `firstName` is derived from `portal_users.name` (first whitespace-split token); falls back to "there" when null.
- `hoursText` is `hoursSummary()` from `lib/store.ts` — uniform-day shorthand or "common · later Fri & Sat" form. `deepLinkOrder` is `${STORE.website}/menu` (absolute URL — emails are clicked from inboxes that don't know our origin).
- On send failure we log a single line `[welcome-email] send failed: <error>` (no recipient, no body content). The signup is committed and the customer is already inside `/account`; the email is best-effort.
- Transactional under CAN-SPAM ("transactional / relationship" — sent in response to the user's own signup action). The footer still includes a STOP / `info@` opt-out for marketing-channel hygiene; one-click unsub will land alongside the inventoryapp `portal_users.email_opt_in` migration.
- **No audit-log write.** Same cross-DB constraint as the order-confirmation send.

**Quiz capture nurture series (Hack #6) specifics:**

- Three-stage drip on rows captured by `app/api/quiz/capture/route.ts`: D+0 (this repo, fires immediately on capture via `after()`) → D+5 + D+12 (inventoryapp cron). Each stage carries the same per-row 256-bit `unsubscribed_token` (generated at capture time via `crypto.randomBytes(32).toString("hex")`), so a single one-click `/quiz/unsubscribe?token=…` page silences all three.
- **Capture API security checks:** strict email regex (`^[^\s@<>"'\`\\;]+@[^\s@<>"'\`\\;]+\.[^\s@<>"'\`\\;]+$` — rejects header injection by construction), max-length 254 chars, explicit reject on `[\r\n]`, `(LOWER(email), source)` 7-day dedupe BEFORE INSERT (a button-mash returns `{ ok: true, dedupe: true }` and the D+0 doesn't re-fire). Other quiz fields are sliced to 64 chars + null on miss; SQL is parameterized via the neon template-tag, never concatenated.
- **Source column:** `'greenlife'` for this repo, `'seattle'` for the SCC repo. The inventoryapp cron uses `source` to pick the right FROM-address + branded palette per row.
- **Public-site D+0 sender:** `lib/quiz-nurture-email.ts` (Wenatchee green palette mirrors `lib/order-confirmation-email.ts`). Footer carries the unsubscribe deep link + STOP-reply note. `firstName` is null at this stage — quiz UI doesn't ask for name.
- **Inventoryapp D+5 + D+12 sender:** `Inventory App/src/app/api/cron/quiz-nurture/route.ts`. Self-contained branded HTML (Wenatchee or Seattle per row) and uses the same `unsubscribe_token` so cancellation via either stage works against the same row.
- **Idempotency:** the cron candidate query filters on `nurture_d{5,12}_sent_at IS NULL AND unsubscribed_at IS NULL`, and the stamp UPDATE only happens AFTER a successful Resend response. A transient Resend error retries on the next cron tick. The capture-API D+0 is idempotent at the table level — the dedupe gate above blocks INSERT, and the helper itself silently no-ops on missing `to`/`RESEND_API_KEY`.
- **Unsubscribe page:** `app/quiz/unsubscribe/page.tsx`. Validates token shape (`/^[0-9a-f]{64}$/`), runs a single `UPDATE … SET unsubscribed_at = NOW() WHERE unsubscribed_token = ? AND unsubscribed_at IS NULL`. UI renders the SAME confirmation in found/not-found/already-unsubscribed cases — no token-validity leak. No per-IP rate limiting because the 256-bit token space makes brute-forcing infeasible.
- **No audit-log write from public-site capture.** Same cross-DB constraint as the order-confirmation + welcome sends.

## See also

- `lib/email.ts` — the helper itself (read it; it's ~100 lines)
- `lib/order-confirmation-email.ts` — first wired send site; mirror its shape for future transactional emails
- `lib/welcome-email.ts` — second wired send site; same template skeleton as order-confirmation but for the post-signup essentials
- `lib/quiz-nurture-email.ts` — Hack #6 D+0 helper (`sendQuizMatchEmail`, `sendQuizPickupTipsEmail`, `sendQuizFirstVisitDealEmail`); D+0 fires from this repo, D+5/D+12 from the inventoryapp cron
- `app/api/quiz/capture/route.ts` — POST endpoint for the quiz capture step; INSERTs `quiz_captures` + fires D+0
- `app/quiz/unsubscribe/page.tsx` — one-click unsub page; flips `unsubscribed_at` for the matching token
- `Inventory App/src/app/api/cron/quiz-nurture/route.ts` — D+5 + D+12 nurture cron (the only place those sends originate)
- `lib/sms.ts` — Twilio sibling with the same no-op pattern
- `Inventory App/src/lib/email.ts` — richer templates (LIQ-1295 tax export, monthly cash export, staff welcome) — port the `base()` wrapper here when the first transactional template lands
