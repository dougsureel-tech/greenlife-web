// Pure helpers for the /menu/preview/[id] PDP surface. Phase 0 of the
// Product UX Redesign (PLAN_PRODUCT_UX_REDESIGN_2026_05_30.md): a read-only
// preview surface to validate the Curaleaf-hierarchy PDP design in front of
// real customers before committing to the cart + checkout cutover.
//
// Sister-port: `seattle-cannabis-web/lib/pdp-helpers.ts` is byte-identical
// (pure function, no store-specific imports — colors + tenure copy live on
// the PDP page itself which reads STORE for divergence).

import { DAY_MS } from "./time-constants.ts";
import { round2 } from "./money-math.ts";

/** Effect-chip keyword library. Customer-facing PDP renders up to 3
 *  preference-context chips derived from the product `notes` field via
 *  case-insensitive substring match. Keys are the chip labels rendered
 *  in the UI; values are arrays of keyword aliases that match the same
 *  chip. WAC 314-55-155 voice register: PREFERENCE CONTEXT only — never
 *  efficacy claims ("treats X", "heals Y"). The chips read like the
 *  brand-voice rubric in apps/staff/docs/brand-voice.md: observation,
 *  not therapy.
 *
 *  Priority order matters — earlier entries win when multiple match.
 *  Customers see at most 3 chips on the PDP (above-the-fold info
 *  hierarchy slot per the UX brief).
 */
export const EFFECT_CHIP_LIBRARY: Array<{ label: string; keywords: string[] }> = [
  { label: "Relaxing", keywords: ["relax", "chill", "mellow", "calm", "unwind", "nightcap"] },
  { label: "Energizing", keywords: ["energ", "uplift", "uplifting", "wake", "morning"] },
  { label: "Creative", keywords: ["creative", "creativity", "focus-creative", "studio"] },
  { label: "Focus", keywords: ["focus", "focused", "clear-head", "productive"] },
  { label: "Sleep", keywords: ["sleep", "bedtime", "couch-lock", "sedat"] },
  { label: "Social", keywords: ["social", "party", "talkative", "conversation"] },
];

/** Extract up to `max` effect chips from a product's notes + effects
 *  field via case-insensitive substring match against the chip library.
 *
 *  The notes field is the primary surface (budtender free-text); the
 *  comma-separated `effects` field is also scanned. Returns chips in
 *  library order (priority desc); duplicates de-duped. Returns [] for
 *  null/empty input.
 *
 *  Phase 0 is intentionally simple keyword match — no LLM, no terpene
 *  inference, no strain-type derivation. The brief notes "derive from
 *  notes field with simple keyword match." */
export function extractEffectChips(
  notes: string | null | undefined,
  effects: string | null | undefined,
  max = 3,
): string[] {
  const haystack = `${notes ?? ""} ${effects ?? ""}`.toLowerCase();
  if (!haystack.trim()) return [];
  const hits: string[] = [];
  for (const entry of EFFECT_CHIP_LIBRARY) {
    if (hits.length >= max) break;
    if (entry.keywords.some((kw) => haystack.includes(kw.toLowerCase()))) {
      hits.push(entry.label);
    }
  }
  return hits;
}

/** WA cannabis tax multiplier — 37% retail excise + ~8.7% local sales tax.
 *  The PDP "Out the door: $X" preview multiplies the line price by this
 *  divisor per the UX brief (PLAN_PRODUCT_UX_REDESIGN §3 + §5):
 *
 *    "Out the door: $61.24" below price — show 1.458x line price (37% WA
 *     excise + ~8.7% local sales)
 *
 *  NOTE on WA tax-inclusive convention: production POS prices in this
 *  codebase are typically tax-inclusive (`packages/lib-shared/tax.ts`
 *  TAX_DIVISOR splits a posted-price back out). The plan author's UX
 *  brief specifies the multiplier shape explicitly for preview-render
 *  purposes. The PDP is a READ-ONLY preview surface — cart + checkout
 *  remain on the existing iHJ flow per Phase 0 scope. If the convention
 *  question surfaces with Doug post-preview, the math swap is a one-line
 *  change (1.458 → 1.0, or pull from TAX_DIVISOR).
 *
 *  Wenatchee: 1.458 (37% excise + 8.8% sales). Seattle sister-port
 *  computes 1.4755 (10.55% sales). Both stores diverge their multiplier
 *  here; helper signature is identical. */
export const WEN_OUT_THE_DOOR_MULTIPLIER = 1.458;

/** Multiply a posted price by the out-the-door multiplier. Rounds to the
 *  nearest cent. Null in → null out. Negative input is preserved
 *  (caller error to feed negative prices — but we don't blow up). */
export function outTheDoorPrice(
  posted: number | null | undefined,
  multiplier: number,
): number | null {
  if (posted == null || !Number.isFinite(posted)) return null;
  return round2(posted * multiplier);
}

/** Decide whether to render the brand-fallback "ProductImage" specimen
 *  card OR the real vendor image. Returns true when the imageUrl is
 *  null/empty/whitespace. The PDP hero gallery uses this to switch
 *  between the typographic-specimen branch and the real-image branch.
 *
 *  Aligned with OrderMenu.tsx:337 ProductImage fallback logic. */
export function shouldUseImageFallback(imageUrl: string | null | undefined): boolean {
  if (!imageUrl) return true;
  if (typeof imageUrl !== "string") return true;
  return imageUrl.trim().length === 0;
}

/** Reviews aggregate math. Given a list of {rating: 1-5}, compute the
 *  customer-facing average score (rounded to 1 decimal) + count.
 *
 *  Returns { avgScore: null, count: 0 } for empty input — caller checks
 *  count to decide whether to render the reviews section at all (the UX
 *  brief mandates HIDING the section header when count = 0; empty stars
 *  read as broken). */
export function reviewsAggregate(
  reviews: Array<{ rating: number }>,
): { avgScore: number | null; count: number } {
  if (!reviews || reviews.length === 0) return { avgScore: null, count: 0 };
  const valid = reviews.filter((r) => Number.isFinite(r.rating) && r.rating >= 1 && r.rating <= 5);
  if (valid.length === 0) return { avgScore: null, count: 0 };
  const sum = valid.reduce((acc, r) => acc + r.rating, 0);
  const avg = sum / valid.length;
  return { avgScore: Math.round(avg * 10) / 10, count: valid.length };
}

/** Format a reviewed-N-weeks-ago label. Inputs: review timestamp (ISO
 *  string or Date), reference "now" (default Date.now()).
 *
 *  Returns: "today" / "yesterday" / "N days ago" (1-13) / "N weeks ago"
 *  (2-8) / "N months ago" (2-12) / "over a year ago".
 *
 *  Pure function — pass the `now` parameter to test deterministically. */
export function formatReviewAge(
  createdAt: string | Date,
  now: number = Date.now(),
): string {
  const t =
    createdAt instanceof Date
      ? createdAt.getTime()
      : new Date(createdAt).getTime();
  if (!Number.isFinite(t)) return "recently";
  const ageMs = now - t;
  if (ageMs < 0) return "just now";
  const ageDays = Math.floor(ageMs / DAY_MS);
  if (ageDays === 0) return "today";
  if (ageDays === 1) return "yesterday";
  if (ageDays < 14) return `${ageDays} days ago`;
  const ageWeeks = Math.floor(ageDays / 7);
  if (ageWeeks < 9) return `${ageWeeks} weeks ago`;
  const ageMonths = Math.floor(ageDays / 30);
  if (ageMonths < 13) return `${ageMonths} months ago`;
  return "over a year ago";
}

/** Derive a "Since YYYY" tenure label from a customer's enrollment
 *  timestamp. Returns "Customer since YYYY" or "Anonymous" if missing. */
export function customerTenureLabel(createdAt: string | Date | null | undefined): string {
  if (!createdAt) return "Anonymous";
  const t =
    createdAt instanceof Date
      ? createdAt
      : new Date(createdAt);
  const year = t.getFullYear();
  if (!Number.isFinite(year) || year < 2000 || year > 9999) return "Anonymous";
  return `Customer since ${year}`;
}
