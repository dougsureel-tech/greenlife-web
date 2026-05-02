// Marketing-attribution breadcrumb helpers.
//
// Public-site half of the attribution stack. The proxy middleware captures
// `?from=<source>:<slug>` from any incoming URL and writes it to the
// `gl_attr_source` cookie. Pages that emit outbound CTAs append the
// breadcrumb to their links so we can later trace which surface drove a
// visit / order.
//
// The POS-side join (matching the cookie to a completed transaction)
// lands in inventoryapp once that lane is unlocked. Until then we are
// laying the wire so attribution data starts accruing as customers visit.
//
// Last-touch only for now. First-touch can join later via a second cookie
// (`gl_attr_first`) without breaking this contract.

export const ATTR_COOKIE = "gl_attr_source";
export const ATTR_TTL_DAYS = 30;

// Whitelisted source kinds. Anything not on this list is rejected by the
// proxy to keep cookie values predictable + safe to render in admin
// dashboards. Add new kinds here when a new outbound surface starts
// emitting them.
export const SOURCE_KINDS = [
  "deal", // /deals — slug = deal id
  "brand", // /brands/[slug] — slug = vendor slug
  "home", // homepage — slug = "hero" | "featured" | "trust"
  "quiz", // /find-your-strain — slug = effect name
  "blog", // /blog/[slug] — slug = post slug
  "stash", // /stash → /menu — slug = "rehydrate"
  "deals-card", // a single deal card click — slug = deal id (kept distinct from "deal" so we can split inbound /deals visits from card-tap-throughs)
  "footer", // footer CTA strip — slug = "order" | "browse"
  "header", // SiteHeader nav — slug = link label
  "sticky", // mobile sticky CTA — slug = button label
  "social", // outbound back from a social-media share — slug = platform
  "sms", // SMS campaign deep-link — slug = campaign id
  "push", // push-notification deep-link — slug = campaign id
  "email", // email deep-link — slug = template id
] as const;

export type SourceKind = (typeof SOURCE_KINDS)[number];

const SOURCE_KIND_SET = new Set<string>(SOURCE_KINDS);

/**
 * Build the URL-friendly value that lives in `?from=` and ultimately the
 * cookie. Returns null on invalid input so callers can skip emission
 * cleanly. Slug is restricted to ascii alphanumerics + dash + underscore +
 * colon so the cookie value is safe to render in admin without escaping.
 */
export function makeAttrValue(kind: SourceKind, slug: string): string | null {
  if (!SOURCE_KIND_SET.has(kind)) return null;
  const cleaned = slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_:-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  if (!cleaned) return null;
  return `${kind}:${cleaned}`;
}

/**
 * Append `?from=<value>` to a relative href without clobbering an
 * existing query string. No-ops on absolute URLs (we only stamp links
 * within our own domain — outbound goes to third parties that won't
 * preserve the param anyway, and the cookie carries the breadcrumb on
 * the customer's next return).
 */
export function withAttr(href: string, kind: SourceKind, slug: string): string {
  if (!href || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return href;
  }
  const value = makeAttrValue(kind, slug);
  if (!value) return href;
  const sep = href.includes("?") ? "&" : "?";
  // Don't double-stamp if the link is already attributed (e.g., a card
  // already wrapped its child with ?from=). Last-stamp wins by URL
  // convention but also wastes a query slot — be polite.
  if (/[?&]from=/.test(href)) return href;
  return `${href}${sep}from=${encodeURIComponent(value)}`;
}

/**
 * Validate a `?from=` value coming off an incoming request before we
 * write it to the cookie. Returns null on anything we don't recognize so
 * we never persist garbage from a copy/paste.
 */
export function validateAttrValue(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const decoded = decodeURIComponent(raw);
  if (decoded.length > 96) return null;
  const m = decoded.match(/^([a-z-]+):([a-z0-9_:-]{1,64})$/);
  if (!m) return null;
  const kind = m[1] as SourceKind;
  if (!SOURCE_KIND_SET.has(kind)) return null;
  return decoded;
}
