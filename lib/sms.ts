// Twilio SMS sender — no-ops gracefully if TWILIO_* env vars are not set.
// Mirrors the helper in the inventory app (src/lib/sms.ts) so the two
// codebases use identical primitives.

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;

export function isSmsConfigured() {
  return !!(ACCOUNT_SID && AUTH_TOKEN && FROM_NUMBER);
}

export async function sendSms(to: string, body: string): Promise<{ success: boolean; sid?: string; error?: string }> {
  if (!isSmsConfigured()) {
    return { success: false, error: "SMS not configured" };
  }
  const { default: twilio } = await import("twilio");
  const client = twilio(ACCOUNT_SID, AUTH_TOKEN);
  try {
    const msg = await client.messages.create({ body, from: FROM_NUMBER!, to });
    return { success: true, sid: msg.sid };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export function normalizePhone(raw: string): string {
  if (raw.startsWith("+")) return raw;
  return `+1${raw.replace(/\D/g, "")}`;
}
