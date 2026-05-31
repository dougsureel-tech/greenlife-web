// Customer Engagement Layer Ship 2 — public-site badge renderers.
//
// Two badges on a single product card:
//   - **Budtender's Pick** — green pill, top-row hierarchy. The shop
//     voice ("we") is the brand-voice doctrine but the pick is a
//     deliberate budtender act — so the social-proof variant says
//     "Picked by N regulars" instead of personalizing the budtender
//     name. (We don't have the budtender name on the public site's
//     product list — it lives on the PWA "Picked for you" card; this
//     surface is the discovery surface.)
//   - **New This Week** — neutral chip below the price.
//
// **WAC 314-55-155 sanity** — "Budtender's Pick" is staff endorsement
// of a product we carry (operational, not efficacy claim). No "best
// for X" or "great for Y" framing. The text "Picked by N regulars" is
// social proof, not a medical/efficacy framing.
//
// **Brand voice** — `docs/brand-voice.md` calls for warm + direct copy.
// "👋 Budtender's Pick" reads relational without exclamation; "✨ New
// this week" reads conversational. No "Try this!" or other CTA framing.
//
// Spec: PLAN_BUDTENDER_PICKS_BADGES_2026_05_30.md § 5.

import type { ProductFlags } from "@/lib/budtender-picks";
import { hasSocialProof, isNewThisWeek } from "@/lib/budtender-picks";

/**
 * Top-row Budtender's Pick badge. Renders nothing when the product has
 * no active recommendation. Stacks ABOVE the strain-tag chip per the
 * badge memo's "Pick wins top-row" hierarchy.
 */
export function BudtenderPickBadge({
  flags,
}: {
  flags: ProductFlags | undefined;
}) {
  if (!flags || !flags.isBudtenderPick) return null;
  const social = hasSocialProof(flags);
  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm"
      title={
        social
          ? `Picked by ${flags.pickCount} regulars this week.`
          : "A budtender picked this for one of our regulars."
      }
    >
      <span aria-hidden="true">👋</span>
      {social ? (
        <>Picked by {flags.pickCount} regulars</>
      ) : (
        <>Budtender&rsquo;s Pick</>
      )}
    </span>
  );
}

/**
 * Smaller "New this week" chip. Renders nothing when the product's
 * newest batch is outside the 7-day window. Per the badge memo, this
 * stacks BELOW the price (the caller controls placement).
 */
export function NewThisWeekBadge({
  flags,
}: {
  flags: ProductFlags | undefined;
}) {
  if (!isNewThisWeek(flags)) return null;
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-stone-100 text-stone-700 border border-stone-200"
      title="Received in the past 7 days."
    >
      <span aria-hidden="true">✨</span>
      New this week
    </span>
  );
}
