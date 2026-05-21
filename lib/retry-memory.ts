import "server-only";
import { getClient } from "./db";

// C9 "Re-try this" Memory Surfacing — per plan
// /CODE/Green Life/PLAN_STRAIN_TREE_INNOVATION_2026_05_21.md §C9.
//
// Algorithmic re-engagement: surface a gentle "going back to an old
// favorite?" card on /account when a customer rated a strain ≥4★ but
// hasn't bought it in 90+ days. Caps: 3 active prompts per customer;
// 365-day cooldown per (customer, strain).
//
// Mock-data mode: until verified-purchase + ratings infra ships, this
// helper short-circuits to an empty list. The card component will
// render nothing, the cron will insert nothing. The wire shape is
// pinned now so when the rating capture lands, only the IF block at
// the top flips — no schema or UI churn.
//
// Feature flag `RETRY_MEMORY_ENABLED` MUST be "true" for any surface
// to render. Default OFF preserves current customer-facing behavior
// exactly. Doug-gated flip per the plan's Phase 4.1 launch posture.
//
// Sister-port to seattle-cannabis-web/lib/retry-memory.ts — byte-
// identical query logic. Only the brand-accent class in the card
// component diverges (SCC = sky; GLW = emerald).

/** Single active re-try prompt row, hydrated for UI render. */
export type RetryPrompt = {
  id: string;
  strainSlug: string;
  /** Display-friendly month string ("February") — used in the card copy
   *  *"You loved it back in February"*. Derived from `last_purchased_at`
   *  in store TZ so the customer reads "in February" matching their
   *  shopping memory, not UTC drift. */
  lastPurchasedMonth: string;
  /** ISO date — used by the UI for an `<time>` tag. */
  lastPurchasedAt: string;
  /** 4 or 5 — stored so the surface can rank 5★ above 4★ when there
   *  are more candidates than the 3-card cap. */
  lastRating: 4 | 5;
  /** Sweetener amount applied at POS redemption. 100 per plan default. */
  pointsAwarded: number;
  /** ISO timestamp — 7 days from prompted_at. The card renders a
   *  countdown ("3 days left"). */
  expiresAt: string;
};

/** Max active prompts shown to one customer at once. Per plan §C9. */
const MAX_ACTIVE_PROMPTS_PER_CUSTOMER = 3;

/** Read the feature flag. Default OFF. */
export function isRetryMemoryEnabled(): boolean {
  return process.env.RETRY_MEMORY_ENABLED === "true";
}

/** Read the email-blast sub-flag. Default OFF — even if the surface
 *  is on, email distribution is a separate Doug-greenlight. */
export function isRetryMemoryEmailEnabled(): boolean {
  return process.env.RETRY_MEMORY_EMAIL_ENABLED === "true";
}

/**
 * Mock-mode short-circuit. Returns true when:
 *   1. The verified-purchase + reviews infra hasn't shipped (today), OR
 *   2. Doug explicitly forces mock via `RETRY_MEMORY_MOCK_MODE=true`
 *      for staging dry-runs.
 *
 * Today this is hard-coded to TRUE because there's no customer-side
 * star-rating capture surface yet — `customers.loyalty_points` exists,
 * `sale_line_items` exists, but no `customer_strain_ratings` table.
 * When that ships, the literal flips to false + the query in
 * `findEligibleRetryPairs` activates against real data.
 */
function isMockMode(): boolean {
  // Hard-coded today. Future PR flips this once strain-rating capture
  // exists; the flag-env override is for staging dry-runs.
  if (process.env.RETRY_MEMORY_MOCK_MODE === "false") return false;
  return true;
}

/**
 * Active re-try prompts for one customer. Read by /account dashboard +
 * strain pages (when shown the strain matches an active prompt's
 * `strain_slug`).
 *
 * Returns empty array when:
 *   - Feature flag OFF
 *   - customerId missing
 *   - No matching rows (vast majority of customers today)
 *
 * SQL is defensive: query against `customer_retry_prompts` which exists
 * after inv-App migration 0310. If the table doesn't exist yet (mid-
 * deploy on the store DB), catches the error + returns empty rather
 * than 500ing the dashboard.
 */
export async function getActiveRetryPromptsForCustomer(
  customerId: string,
): Promise<RetryPrompt[]> {
  if (!isRetryMemoryEnabled()) return [];
  if (!customerId) return [];

  try {
    const sql = getClient();
    const rows = await sql`
      SELECT
        id,
        strain_slug,
        last_rating,
        last_purchased_at::text AS last_purchased_at,
        points_awarded,
        expires_at::text AS expires_at
      FROM customer_retry_prompts
      WHERE customer_id = ${customerId}
        AND redeemed_at IS NULL
        AND prompted_at IS NOT NULL
        AND expires_at > NOW()
      ORDER BY last_rating DESC, last_purchased_at DESC
      LIMIT ${MAX_ACTIVE_PROMPTS_PER_CUSTOMER}
    `;
    return rows.map((r) => {
      const purchasedAt = r.last_purchased_at as string;
      const rating = Number(r.last_rating);
      const safeRating = rating === 5 ? 5 : 4;
      return {
        id: r.id as string,
        strainSlug: r.strain_slug as string,
        lastPurchasedMonth: formatPurchaseMonth(purchasedAt),
        lastPurchasedAt: purchasedAt,
        lastRating: safeRating as 4 | 5,
        pointsAwarded: Number(r.points_awarded),
        expiresAt: r.expires_at as string,
      };
    });
  } catch {
    // Migration hasn't rolled yet on this store's DB — fail closed.
    // No customer impact: the dashboard skips the card section.
    return [];
  }
}

/**
 * Look up a single active prompt by (customerId, strainSlug). Used by
 * the strain page to decide whether to render the "an old favorite"
 * banner inline next to the strain hero.
 */
export async function getActiveRetryPromptForStrain(
  customerId: string,
  strainSlug: string,
): Promise<RetryPrompt | null> {
  if (!isRetryMemoryEnabled()) return null;
  if (!customerId || !strainSlug) return null;
  const all = await getActiveRetryPromptsForCustomer(customerId);
  return all.find((p) => p.strainSlug === strainSlug) ?? null;
}

/**
 * Format an ISO timestamp into a month-name string in store TZ. Pacific
 * for both SCC + GLW (mirror site, same coast). Tolerates malformed
 * input by returning empty (caller falls back to generic copy).
 */
function formatPurchaseMonth(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      month: "long",
    });
  } catch {
    return "";
  }
}

/**
 * Mock-mode candidate generator for the cron. In real mode (post-
 * verified-purchase ship) this would JOIN sale_line_items × ratings
 * filtered to ≥4★ + last_purchased_at < NOW() - 90 days + no open
 * cooldown row. Today it returns []. Exposed so the cron route can
 * call it without re-implementing the mock branch.
 */
export async function findEligibleRetryPairs(): Promise<
  Array<{
    customerId: string;
    strainSlug: string;
    lastRating: 4 | 5;
    lastPurchasedAt: string;
  }>
> {
  if (isMockMode()) return [];
  // Reserved branch — once `customer_strain_ratings` exists, the JOIN
  // shape lives here. For today the function is unreachable below the
  // mock-mode short-circuit.
  return [];
}
