import Link from "next/link";
import type { RetryPrompt } from "@/lib/retry-memory";
import { DAY_MS } from "@/lib/time-constants";
import { menuLink } from "@/lib/menu-routing";

// C9 "Re-try this" Memory Surfacing card.
//
// Render this from a Server Component parent that's already gated by
// `isRetryMemoryEnabled()` AND has hydrated the prompt rows via
// `getActiveRetryPromptsForCustomer()`. The card is a pure presentation
// component — no client-side state, no fetch, no localStorage.
//
// WAC-safety: preference language only. Copy: "Going back to an old
// favorite?" — NO effect claims, NO recall of how the strain made the
// customer feel last time. Plan §C9 risk-section: "Copy is purely
// preference-based — no efficacy, no recommendation-of-effect, no
// medical framing." Reviewing copy edits: read the plan before changing
// any string here.
//
// Sister-port to /CODE/Green Life/seattle-cannabis-web/components/RetryMemoryCard.tsx
// — byte-identical except for the brand-accent class on the wrapper
// (SCC = sky tones; GLW = emerald tones).

type Props = {
  prompt: RetryPrompt;
  /** Optional override — defaults to the card's auto-rendered headline. */
  variant?: "dashboard" | "strain-page";
};

export function RetryMemoryCard({ prompt, variant = "dashboard" }: Props) {
  const daysLeft = computeDaysLeft(prompt.expiresAt);
  // Pretty strain name: turn kebab-case slug → Title Case. Good-enough
  // approximation when the parent doesn't have the full strain object
  // handy. If the parent has it, prefer passing strain.name via a slot
  // (future enhancement; not needed for v1 since the slug-to-title pass
  // covers the common shape — "wedding-cake" → "Wedding Cake").
  const strainTitle = slugToTitle(prompt.strainSlug);

  const headline =
    variant === "strain-page"
      ? "An old favorite — welcome back."
      : "Going back to an old favorite?";

  const body =
    variant === "strain-page"
      ? `You loved this in ${prompt.lastPurchasedMonth || "the past"}. Add it to your next order and ${prompt.pointsAwarded} bonus points are yours.`
      : `${strainTitle} — you loved it ${prompt.lastPurchasedMonth ? `back in ${prompt.lastPurchasedMonth}` : "last time you tried it"}. Add it to your next order and ${prompt.pointsAwarded} bonus points are yours.`;

  return (
    <section
      aria-label="Re-try an old favorite"
      className="rounded-xl border border-stone-200 bg-gradient-to-br from-emerald-50 to-stone-50 p-4 sm:p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wide font-medium text-emerald-700">
            For you
          </p>
          <h3 className="mt-1 text-base sm:text-lg font-semibold text-stone-900">
            {headline}
          </h3>
          <p className="mt-1 text-sm text-stone-700">{body}</p>
          {daysLeft != null && daysLeft > 0 ? (
            <p className="mt-2 text-xs text-stone-500">
              Offer expires in {daysLeft} {daysLeft === 1 ? "day" : "days"}.
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={`/strains/${prompt.strainSlug}`}
          className="inline-flex items-center rounded-md bg-stone-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-stone-800"
        >
          View strain
        </Link>
        <Link
          href={menuLink(`/menu?strain=${encodeURIComponent(prompt.strainSlug)}`)}
          className="inline-flex items-center rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-800 hover:bg-stone-100"
        >
          See it on menu
        </Link>
      </div>
    </section>
  );
}

/**
 * Group renderer for the /account dashboard. Mounts a list of cards
 * with a small section header. Use when you have N>0 active prompts.
 * Renders nothing when given an empty list.
 */
export function RetryMemoryCardList({ prompts }: { prompts: RetryPrompt[] }) {
  if (!prompts || prompts.length === 0) return null;
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
        Favorites worth re-trying
      </h2>
      <div className="space-y-3">
        {prompts.map((p) => (
          <RetryMemoryCard key={p.id} prompt={p} variant="dashboard" />
        ))}
      </div>
    </div>
  );
}

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((part) => (part.length > 0 ? part[0]!.toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function computeDaysLeft(isoExpiresAt: string): number | null {
  try {
    const expires = new Date(isoExpiresAt).getTime();
    if (Number.isNaN(expires)) return null;
    const now = Date.now();
    const ms = expires - now;
    if (ms <= 0) return 0;
    return Math.max(0, Math.ceil(ms / DAY_MS));
  } catch {
    return null;
  }
}
