// Welcome-page (?ref=) sanitization + CTA-builder helpers.
//
// The direct-mailer QR landing page at `/welcome?ref=mailer-wen-202605`
// uses `?ref=<campaign-id>` as the attribution carrier (per the cadence
// pin `feedback_loyalty_marketing_cadence_slow_drip_customer_led_2026_05_24`
// "Direct-mailer integration" section).
//
// Why a dedicated module instead of folding into lib/attribution.ts:
//   1. The existing attribution system uses `?from=<kind>:<slug>` (the
//      proxy middleware validates + writes a cookie). The mailer URL
//      Doug wants is `?ref=<campaign>` — different shape, set by the
//      USPS-printed QR code that's already out the door. We translate
//      the inbound `?ref=` into the cookie-friendly `?from=mailer:<slug>`
//      on the server side and forward both downstream so:
//        - The existing cookie pipeline gets a clean SOURCE_KINDS-valid
//          entry (`mailer:wen-202605`) without changing the mailer's
//          QR shape.
//        - Downstream CTAs carry `?ref=` too, so any in-app surface
//          that wants to surface "you came from the mailer" can read
//          the original campaign id without parsing the cookie.
//   2. Keeping the welcome-page logic in a thin pure module makes it
//      pin-testable — the page renders a React tree, but the URL
//      shape contract is pure string-in/string-out.
//
// Security contract:
//   - `sanitizeRef()` rejects anything that isn't ascii alphanumerics +
//     dash + underscore, capped at 48 chars. This prevents reflected-XSS
//     via the ref param (page renders it nowhere user-visible, but
//     defensive sanitization keeps it that way even if a future edit
//     surfaces it in copy).
//   - Empty / null / oversized / illegal-char input returns null so
//     callers can branch cleanly (don't write cookie, don't forward).

const REF_MAX_LEN = 48;
const REF_PATTERN = /^[a-z0-9_-]+$/;

/**
 * Validate + normalize an incoming `?ref=` value.
 *
 * Returns the normalized (lowercased, trimmed) ref string or null if
 * the input is missing / oversized / contains illegal characters.
 *
 * @example
 *   sanitizeRef("mailer-wen-202605") // "mailer-wen-202605"
 *   sanitizeRef("Mailer-Wen-202605") // "mailer-wen-202605"
 *   sanitizeRef("<script>")          // null
 *   sanitizeRef(null)                // null
 *   sanitizeRef("")                  // null
 *   sanitizeRef("a".repeat(60))      // null
 */
export function sanitizeRef(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;
  if (trimmed.length > REF_MAX_LEN) return null;
  if (!REF_PATTERN.test(trimmed)) return null;
  return trimmed;
}

/**
 * Extract the campaign slug from a sanitized `?ref=` value, dropping a
 * leading "mailer-" prefix so the cookie value (`mailer:<slug>`) doesn't
 * double-stamp the "mailer" namespace.
 *
 * Returns the slug suitable for `?from=mailer:<slug>` cookie pipeline.
 *
 * @example
 *   refToAttrSlug("mailer-wen-202605") // "wen-202605"
 *   refToAttrSlug("wen-202605")        // "wen-202605"
 */
export function refToAttrSlug(ref: string): string {
  // Strip a leading "mailer-" if present; the cookie kind is already
  // "mailer", so "mailer:mailer-wen-202605" would be redundant.
  return ref.replace(/^mailer-/, "");
}

/**
 * Append `?ref=<value>` to a relative href without clobbering an
 * existing query string. No-ops on absolute URLs (third-party
 * destinations won't preserve the param anyway — the cookie carries
 * the breadcrumb on return visits via the existing attribution stack).
 *
 * Mirrors `lib/attribution.ts#withAttr` shape so the welcome page can
 * stack both on the same outbound link.
 */
export function withRef(href: string, ref: string | null): string {
  if (!href || !ref) return href;
  if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return href;
  }
  // Don't double-stamp if the link already carries ?ref=
  if (/[?&]ref=/.test(href)) return href;
  const sep = href.includes("?") ? "&" : "?";
  return `${href}${sep}ref=${encodeURIComponent(ref)}`;
}

/**
 * Default ref value for the current Wenatchee direct-mail drop.
 *
 * Kept here as a constant so dashboards / future analytics queries
 * have one place to grep for the campaign id. When the next drop ships
 * (e.g. 2026-09 follow-up), add the new id; do not mutate the existing
 * one — historical attribution rows reference the literal value.
 */
export const DEFAULT_MAILER_REF = "mailer-wen-202605";
