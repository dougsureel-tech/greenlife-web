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

Set on each Vercel project (greenlife-web preview + production). Without `RESEND_API_KEY`, `sendEmail()` returns the no-op result and never throws — safe to call from any Server Action / route handler.

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

## See also

- `lib/email.ts` — the helper itself (read it; it's ~100 lines)
- `lib/sms.ts` — Twilio sibling with the same no-op pattern
- `Inventory App/src/lib/email.ts` — richer templates (LIQ-1295 tax export, monthly cash export, staff welcome) — port the `base()` wrapper here when the first transactional template lands
