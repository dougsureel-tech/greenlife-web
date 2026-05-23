// Ambassador Program v0.2 Phase F — apply-form pure helpers.
//
// Spec: /CODE/Green Life/PLAN_AMBASSADOR_V0_2_INFLUENCER_REACH_2026_05_23.md §3 Phase F (apply)
// + §3 Phase G (public leaderboard). Schema landed in inv-App migration 0324
// (ambassador_applications table + ambassador_public_* user columns).
//
// CRITICAL: this file is **byte-identical** between greenlife-web and
// seattle-cannabis-web. Maintain in lockstep — sister-port any change to
// both stacks in the same push window. The lib has zero per-stack config
// (no STORE.* references), so it's a pure verbatim port.
//
// Why these helpers live in a shared lib (not inlined in the form / route):
//   1. The K/M shorthand parser, IG-handle normalizer, payout-mode parser,
//      and tier-badge helper are all needed BOTH on the client (form
//      pre-submit validation) AND on the server (API endpoint POST handler).
//      Duplicating them risks drift between client-validated + server-
//      validated rules — a class-of-bug the v0.1 ship caught twice in code
//      review.
//   2. Pure functions = trivially pin-testable. The Phase F surface has
//      24+ pin tests against this file alone.
//   3. The follower-tier math mirrors inv-App's lib/follower-tier.ts but
//      cannabis-web can't `import` directly from inv-App (separate repos,
//      no symlink). Re-implementing in lockstep is the doctrine pin from
//      `feedback_cross_stack_sister_port_pin_test_recipe_2026_05_22.md`.
//
// Compliance: zero medical/efficacy vocabulary anywhere in this file.
// scripts/check-efficacy-claims.mjs will trip on drift.
//
// Pure-fn only. No DB, no env, no time-of-day side effects.

// ── Follower-tier table (mirrored from inv-App lib/follower-tier.ts) ──

export type FollowerTier = "standard" | "silver" | "gold" | "platinum";

export const FOLLOWER_TIER_THRESHOLDS = {
  silver: 10_000,
  gold: 50_000,
  platinum: 100_000,
} as const;

export function tierBadgeEmoji(tier: FollowerTier): string {
  switch (tier) {
    case "standard":
      return "🪙";
    case "silver":
      return "🥈";
    case "gold":
      return "🥇";
    case "platinum":
      return "💎";
  }
}

/**
 * Resolve follower tier from an attested count alone (no verification grace
 * — that lives on the inv-App side post-approval). For the public apply form
 * + leaderboard we surface the BAND the count falls into; verification is
 * handled by the admin queue.
 */
export function resolveFollowerTierFromCount(count: number | null): FollowerTier {
  if (count == null || !Number.isFinite(count) || count < 0) return "standard";
  if (count >= FOLLOWER_TIER_THRESHOLDS.platinum) return "platinum";
  if (count >= FOLLOWER_TIER_THRESHOLDS.gold) return "gold";
  if (count >= FOLLOWER_TIER_THRESHOLDS.silver) return "silver";
  return "standard";
}

// ── K/M shorthand parser ────────────────────────────────────────────────

/**
 * Parse an attested-follower-count string. Accepts:
 *   - plain number: "12345" → 12345
 *   - K shorthand:  "12K" "12k" "12.5K" → 12000 / 12500
 *   - M shorthand:  "1.5M" "1m" → 1500000 / 1000000
 *   - whitespace + commas tolerated: " 12,345 " "12,500" → 12345 / 12500
 *
 * Returns null for unparseable input, negative numbers, or NaN. The
 * upper bound is 1B (1_000_000_000) — anything higher is treated as
 * unparseable to defend against pasted log lines / accidental typos.
 *
 * Boundary semantics:
 *   "0"     → 0      (zero IS parseable — caller decides if zero is valid)
 *   ""      → null
 *   "  "    → null
 *   "abc"   → null
 *   "1.5KK" → null   (chained suffixes rejected)
 *   "1.5XX" → null   (unknown suffix rejected)
 *   "K"     → null   (suffix alone rejected)
 *   ".5K"   → 500    (decimal-leading OK)
 *   "1.5.5K"→ null   (multi-decimal rejected)
 */
export function parseFollowerCount(input: string | null | undefined): number | null {
  if (input == null) return null;
  if (typeof input !== "string") return null;
  const trimmed = input.trim().replace(/,/g, "");
  if (!trimmed) return null;

  // Must match: optional digits, optional decimal, optional single K/M suffix.
  const match = /^(\d+(?:\.\d+)?|\.\d+)([kKmM])?$/.exec(trimmed);
  if (!match) return null;

  const [, numStr, suffix] = match;
  const num = Number.parseFloat(numStr);
  if (!Number.isFinite(num) || num < 0) return null;

  let multiplier = 1;
  if (suffix === "k" || suffix === "K") multiplier = 1_000;
  else if (suffix === "m" || suffix === "M") multiplier = 1_000_000;

  const result = num * multiplier;
  if (!Number.isFinite(result) || result < 0 || result > 1_000_000_000) return null;
  return Math.round(result);
}

// ── Handle normalization (IG / TikTok / YouTube) ────────────────────────

/**
 * Normalize a social-media handle: strip leading @, strip leading https://
 * URL prefixes for the main platforms, trim whitespace, lowercase. Returns
 * null for empty/whitespace-only/invalid input.
 *
 * Examples:
 *   "@sarah"               → "sarah"
 *   "Sarah"                → "sarah"
 *   "https://instagram.com/sarah" → "sarah"
 *   "https://www.tiktok.com/@sarah" → "sarah"
 *   "youtube.com/c/sarah"  → "sarah"
 *   "  @sarah  "           → "sarah"
 *   ""                     → null
 *   "   "                  → null
 *
 * Handle rules: 1-30 chars, alphanumeric + underscore + period only (the
 * superset of IG/TikTok/YouTube channel-name chars). Drift outside that
 * range returns null so the form surfaces "looks like a typo" before POST.
 */
export function normalizeHandle(input: string | null | undefined): string | null {
  if (input == null) return null;
  if (typeof input !== "string") return null;
  let s = input.trim();
  if (!s) return null;

  // Strip URL prefixes for the 3 supported platforms (case-insensitive).
  s = s.replace(/^https?:\/\//i, "");
  s = s.replace(/^www\./i, "");
  s = s.replace(/^(?:instagram\.com|tiktok\.com|youtube\.com)\/?(?:c\/|channel\/|@)?/i, "");

  // Strip trailing slash + querystring.
  s = s.replace(/[/?#].*$/, "");

  // Strip leading @ if any.
  s = s.replace(/^@+/, "");

  // Trim again after the strip chain.
  s = s.trim();
  if (!s) return null;

  // Lowercase for normalization.
  s = s.toLowerCase();

  // Length bounds + char allowlist.
  if (s.length < 1 || s.length > 30) return null;
  if (!/^[a-z0-9._]+$/.test(s)) return null;

  return s;
}

/**
 * Build the verify-link URL for a given platform + handle. Returns null if
 * the handle is empty / invalid. The form renders a clickable link to this
 * URL after blur so the applicant can confirm their handle resolves.
 */
export function verifyHandleUrl(
  platform: "instagram" | "tiktok" | "youtube",
  handle: string | null,
): string | null {
  if (!handle) return null;
  const norm = normalizeHandle(handle);
  if (!norm) return null;
  switch (platform) {
    case "instagram":
      return `https://www.instagram.com/${norm}`;
    case "tiktok":
      return `https://www.tiktok.com/@${norm}`;
    case "youtube":
      return `https://www.youtube.com/@${norm}`;
  }
}

// ── Payout-mode parsing ────────────────────────────────────────────────

export type PayoutMode = "store_credit" | "cash_with_w9";

/**
 * Validate a payout-mode value from the form / API. Defaults to
 * "store_credit" — the SAFER path per Doug doctrine.
 */
export function parsePayoutMode(input: unknown): PayoutMode {
  if (input === "cash_with_w9") return "cash_with_w9";
  // Any other value (null, undefined, unknown string) collapses to safe default.
  return "store_credit";
}

// ── Email / phone shape ────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@<>"'`\\;]+@[^\s@<>"'`\\;]+\.[^\s@<>"'`\\;]+$/;

export function isValidEmail(input: string | null | undefined): boolean {
  if (input == null) return false;
  if (typeof input !== "string") return false;
  const trimmed = input.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  return EMAIL_RE.test(trimmed);
}

/**
 * Validate phone shape — digits + optional formatting chars, 10-15 digits
 * after stripping non-numeric. Accepts US-style "(509) 663-9980" or E.164
 * "+15096639980".
 */
export function isValidPhone(input: string | null | undefined): boolean {
  if (input == null) return false;
  if (typeof input !== "string") return false;
  const digits = input.replace(/[^\d]/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Validate ZIP shape — 5 digits or 5+4. Returns the normalized form ("12345"
 * or "12345-6789") or null. Leading/trailing whitespace tolerated.
 */
export function normalizeZip(input: string | null | undefined): string | null {
  if (input == null) return null;
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!/^\d{5}(?:-\d{4})?$/.test(trimmed)) return null;
  return trimmed;
}

// ── Last-initial helper (privacy mask for /community/ambassadors) ──────

/**
 * Render an ambassador name as "FirstName L." for the public leaderboard.
 * Strips/trims surrounding whitespace; handles single-name (no last-name)
 * gracefully (returns first name as-is).
 *
 *   "Sarah Kim"        → "Sarah K."
 *   "Sarah"            → "Sarah"
 *   "Sarah  Kim"       → "Sarah K."  (multi-space safe)
 *   "  Sarah Kim  "    → "Sarah K."
 *   ""                 → ""
 *   "Sarah-Jane Kim"   → "Sarah-Jane K."  (hyphenated first name preserved)
 */
export function firstNameLastInitial(fullName: string | null | undefined): string {
  if (fullName == null) return "";
  if (typeof fullName !== "string") return "";
  const trimmed = fullName.trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0];
  const last = parts[parts.length - 1];
  const lastInitial = last.charAt(0).toUpperCase();
  return `${parts[0]} ${lastInitial}.`;
}

// ── Application contract version pin ───────────────────────────────────

/**
 * Current contract version pinned at app/build time. When `/CODE/Green
 * Life/legal/ambassador-icr-2026.md` ships a revision, bump this string.
 * The apply endpoint stores this constant in `ambassador_applications.
 * contract_version` so each row is anchored to the exact version the
 * applicant accepted.
 */
export const AMBASSADOR_CONTRACT_VERSION = "2026.1";

// ── Cap (Phase D mirror) ───────────────────────────────────────────────

/** $1,800/yr soft-cap on aggregate reward credit per ambassador. Sets the
 *  ceiling under the IRS $2,000 1099-NEC threshold while leaving 10%
 *  headroom for manager-override edge cases. Surfaced on the apply page +
 *  the public leaderboard footer copy. */
export const AMBASSADOR_YTD_CAP_CENTS = 180_000;

// ── Compliance attestation gate ────────────────────────────────────────

/**
 * Pure-fn validator for the apply-form pre-submit + the server-side POST
 * handler. Returns null on success; a short customer-readable error string
 * on failure (the form surfaces this verbatim). Caller is responsible for
 * blob-upload + DB persistence — this is shape-only validation.
 *
 * Required fields:
 *   - firstName (1-80 chars)
 *   - email (RFC-5321 + EMAIL_RE)
 *   - phone (10-15 digits after strip)
 *   - zip (5 or 5+4)
 *   - igHandle (normalized via normalizeHandle)
 *   - igFollowers (parsed via parseFollowerCount; ≥0)
 *   - ageAttested (boolean true)
 *   - contractAccepted (boolean true)
 *
 * Conditionally required:
 *   - lastName: required iff payoutMode === "cash_with_w9" (W-9 needs full
 *     legal name)
 */
export type ApplyFormShape = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  zip: string | null;
  igHandle: string | null;
  igFollowers: string | null;
  payoutMode: PayoutMode;
  ageAttested: boolean;
  contractAccepted: boolean;
};

export function validateApplyForm(form: ApplyFormShape): string | null {
  if (!form.firstName || form.firstName.trim().length === 0) return "First name required";
  if (form.firstName.trim().length > 80) return "First name too long";
  if (form.payoutMode === "cash_with_w9") {
    if (!form.lastName || form.lastName.trim().length === 0) {
      return "Last name required for cash payout (W-9)";
    }
    if (form.lastName.trim().length > 80) return "Last name too long";
  }
  if (!isValidEmail(form.email)) return "Valid email required";
  if (!isValidPhone(form.phone)) return "Valid phone required";
  if (!normalizeZip(form.zip)) return "Valid 5-digit ZIP required";
  if (!normalizeHandle(form.igHandle)) return "Valid Instagram handle required";
  if (parseFollowerCount(form.igFollowers) == null) {
    return "Follower count required (try 12K, 1.5M, or 12500)";
  }
  if (!form.ageAttested) return "Must attest you are 21 or older";
  if (!form.contractAccepted) return "Must accept the Ambassador agreement";
  return null;
}
