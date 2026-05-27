// <StrainPickOfWeek /> — public hero rail on greenlifecannabis.com home.
//
// Ship 0.2 of the Strain Tree autonomous arc (sister to scc-web).
// Plan: /CODE/Green Life/PLAN_STRAIN_TREE_AUTONOMOUS_ARC_2026_05_27.md §2.
// Spec: comms-expert 2026-05-27 — see the brief at the top of the
// inv-App `/admin/curation/pick-of-week/page.tsx` for the full copy
// design notes.
//
// Reads from the inv-App's shared Neon DB via `getCurrentStrainPickOfWeek()`.
// Flag-gated `PICK_OF_THE_WEEK_ENABLED` default OFF — reader returns null
// when flag is off OR no pick is published. Component unmounts entirely
// in that case (no placeholder, no "no pick this week" copy — comms-expert
// spec explicitly: return null).
//
// Copy choices (comms-expert 2026-05-27 spec, load-bearing — do not
// reword without re-reviewing the brief at the top of inv-App admin form):
//   - Eyebrow (small, uppercase tracking-wide): "This week's pick"
//     · Alternate option for Doug's morning review (warmer): "From {budtender} this week"
//   - Headline (large): {strain_name}
//   - Byline (italic, small): Picked by {budtender_first_name}
//   - Body (paragraph): {editorial_note} — escaped HTML (React text
//     interpolation is auto-escaped; we never dangerouslySetInnerHTML)
//   - Two CTAs: filled primary "See it on the menu" → /menu?strain={slug}
//     + plain secondary text-link "Read about {strain_name}" → /strains/{slug}
//   - Empty state: return null — NO placeholder, NO "no pick this week"
//     text. The rail vanishes entirely.

import Link from "next/link";
import { getCurrentStrainPickOfWeek } from "@/lib/db";
import { withAttr } from "@/lib/attribution";

// TODO (Doug morning review): if "This week's pick" reads cold, swap to
// the warmer alt eyebrow "From {budtender} this week" — comms-expert
// flagged both as acceptable; this is a one-line copy choice.
const EYEBROW = "This week's pick";

export async function StrainPickOfWeek() {
  const pick = await getCurrentStrainPickOfWeek();
  if (!pick) return null;

  return (
    <section
      className="bg-stone-50 border-b border-stone-100"
      aria-labelledby="pick-of-week-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="rounded-2xl border border-stone-200 bg-white px-6 py-7 sm:px-8 sm:py-9 shadow-sm">
          <div className="text-xs uppercase tracking-[0.18em] text-stone-500">
            {EYEBROW}
          </div>
          <h2
            id="pick-of-week-heading"
            className="mt-1 text-3xl sm:text-4xl font-semibold text-stone-900"
          >
            {pick.strainName}
          </h2>
          <p className="mt-1 text-sm italic text-stone-500">
            Picked by {pick.budtenderName}
          </p>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-stone-700">
            {pick.editorialNote}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href={withAttr(
                `/menu?strain=${encodeURIComponent(pick.strainSlug)}`,
                "home",
                "pick-of-week-menu",
              )}
              className="inline-flex items-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              See it on the menu
            </Link>
            <Link
              href={withAttr(
                `/strains/${encodeURIComponent(pick.strainSlug)}`,
                "home",
                "pick-of-week-read",
              )}
              className="text-sm font-medium text-emerald-700 hover:text-emerald-900 underline-offset-2 hover:underline"
            >
              Read about {pick.strainName}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
