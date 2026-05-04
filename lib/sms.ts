// Twilio SMS sender — no-ops gracefully if TWILIO_* env vars are not set.
// Mirrors the helper in the inventory app (src/lib/sms.ts) — same
// `normalizeToE164` boundary normalization (added inventoryapp v50.345)
// so callers don't have to remember to pre-normalize. E.164 inputs
// round-trip unchanged so the legacy `normalizePhone` shape kept as an
// alias still works for any caller that imports it.

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;

export function isSmsConfigured() {
  return !!(ACCOUNT_SID && AUTH_TOKEN && FROM_NUMBER);
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
  const client = twilio(ACCOUNT_SID, AUTH_TOKEN);
  try {
    const msg = await client.messages.create({ body, from: FROM_NUMBER!, to: normalizedTo });
    return { success: true, sid: msg.sid };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}
