// Twilio SMS sender — no-ops gracefully if TWILIO_* env vars are not set.
// Mirrors the helper in the inventory app (src/lib/sms.ts) — same
// `normalizeToE164` boundary normalization (added inventoryapp v50.345)
// so callers don't have to remember to pre-normalize. E.164 inputs
// round-trip unchanged so the legacy `normalizePhone` shape kept as an
// alias still works for any caller that imports it.

// Function-resolved env reads instead of module-init constants.
// Sister of inv v401.545 + v401.505 + scc v24.005 (stale-Fluid-Compute-
// instance env-var trap): Vercel Fluid Compute keeps warm serverless
// instances ~15min, but `const X = process.env.Y` at module load captures
// the value ONCE per instance — admin env rotations don't reach instances
// loaded with the previous value until they cycle. Function-resolution
// reads `process.env` on every call (zero perf cost — process.env is a
// Proxy getter). Memory pin: `feedback_env_var_precedence_cross_tenant_trap`.
function getAccountSid(): string | undefined { return process.env.TWILIO_ACCOUNT_SID; }
function getAuthToken(): string | undefined { return process.env.TWILIO_AUTH_TOKEN; }
function getFromNumber(): string | undefined { return process.env.TWILIO_FROM_NUMBER; }

export function isSmsConfigured() {
  return !!(getAccountSid() && getAuthToken() && getFromNumber());
}

/**
 * Normalize a phone number to E.164 (Twilio's preferred format). Handles
 * the inputs we actually see in this codebase:
 *   - Raw 10-digit US: `5095550100`     → `+15095550100`
 *   - Formatted US:    `(509) 555-0100` → `+15095550100`
 *   - Already E.164:   `+15095550100`   → `+15095550100`
 *   - 11-digit 1XXX:   `15095550100`    → `+15095550100`
 *   - 11+ digit intl:  `447911123456`   → `+447911123456`
 * Empty / under-10-digits returns the original (Twilio reject is the
 * cleaner failure mode than silently producing a malformed E.164).
 */
export function normalizeToE164(input: string): string {
  const trimmed = (input ?? "").trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("+")) {
    const digitsOnly = trimmed.replace(/\D/g, "");
    return digitsOnly.length === 0 ? trimmed : `+${digitsOnly}`;
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length >= 11) return `+${digits}`;
  return trimmed;
}

// Back-compat alias — existing callers (e.g. /api/orders) import
// `normalizePhone`. E.164 round-trips unchanged so the inline call-site
// usage keeps working.
export const normalizePhone = normalizeToE164;

export async function sendSms(
  to: string,
  body: string,
): Promise<{ success: boolean; sid?: string; error?: string }> {
  if (!isSmsConfigured()) {
    return { success: false, error: "SMS not configured" };
  }
  // Normalize at the boundary. Callers don't have to remember to
  // pre-normalize; E.164 inputs round-trip unchanged.
  const normalizedTo = normalizeToE164(to);
  const { default: twilio } = await import("twilio");
  const client = twilio(getAccountSid(), getAuthToken());
  try {
    const msg = await client.messages.create({ body, from: getFromNumber()!, to: normalizedTo });
    return { success: true, sid: msg.sid };
  } catch (e) {
    // PII strip — Twilio errors echo recipient phone in `.message`
    // ("The 'To' number +15095550100 is unsubscribed"). Caller-side
    // truncate-to-40 was an attempted defense but the phone sits at
    // position ~16 so the truncate still leaked it. Strip E.164 and
    // 10+ consecutive-digit patterns at source so callers can log
    // freely. Same hygiene as `lib/email.ts` (sister of inv v305.205).
    const raw = e instanceof Error ? e.message : String(e);
    const stripped = raw
      .replace(/\+\d{10,15}/g, "<phone>")
      .replace(/\b\d{10,15}\b/g, "<phone>")
      .slice(0, 160);
    return { success: false, error: stripped };
  }
}
