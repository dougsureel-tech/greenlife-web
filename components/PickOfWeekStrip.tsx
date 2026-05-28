// <PickOfWeekStrip slug={...} /> — inline handoff strip on /strains/[slug].
//
// UX expert deep-dive Move #6 (UI_EXPERT_DEEP_STRAIN_PAGE_2026_05_27.md):
// "Pick-of-Week handoff strip on the strain page itself. When the slug being
// viewed IS this week's pick, render `📌 This week's pick — [editorial note]
// — Picked by [budtender]` inline above the context strip. Today the
// editorial context (Kat picked it, why) dies on the click from home to
// detail page."
//
// Sister of the home-rail <StrainPickOfWeek /> (components/StrainPickOfWeek.tsx).
// Uses the EXACT SAME data source (getCurrentStrainPickOfWeek) so both
// surfaces agree by construction. The render contract differs by intent:
//   - Home rail: hero card with H2 + CTAs (acquisition surface).
//   - This strip: inline amber-tinted aside above the context strip
//     (continuity surface — preserves editorial context on home→detail click).
//
// Renders null in 3 cases (forward-looking polish — strip stays dormant
// until Doug flips the flag + authors a pick):
//   (1) PICK_OF_THE_WEEK_ENABLED flag is OFF → reader returns null at DB layer.
//   (2) No current week pick exists for this store → reader returns null.
//   (3) Current week pick's strain_slug !== the slug being viewed.
//
// Voice register (matches home-rail per comms-expert continuity rule):
//   - Eyebrow: "This week's pick" (mirrors home-rail EYEBROW const)
//   - Body: {editorialNote} (already WSLCB-cleaned at admin-form submission
//     time via Ship 2.7c gate — no new compliance surface here)
//   - Byline: "Picked by {budtenderName}" (italic, matches home-rail shape)
//
// Compliance: pure presentation layer. The editorial_note + budtender_name
// strings were already scrubbed when Doug authored the pick via
// /admin/curation/pick-of-week. No new microcopy added here beyond the
// eyebrow + Pick emoji.
//
// A11y: semantic <aside role="note"> + aria-label for screen-reader narrative
// + decorative 📌 emoji marked aria-hidden. React text interpolation auto-
// escapes — never dangerouslySetInnerHTML.
//
// Layout: assumes the consumer provides the outer max-width + horizontal
// padding container. The strip itself is just the amber-tinted pill +
// margin-bottom hook. Mounted today inside `/strains/[slug]/page.tsx`
// hero `<section className="max-w-3xl mx-auto px-4 ...">` between the
// Breadcrumb and the H1.

import { getCurrentStrainPickOfWeek } from "@/lib/db";

// Matches home-rail's EYEBROW const for voice continuity. If Doug ever
// swaps the home-rail eyebrow to the warmer alt "From {budtender} this
// week", swap this in tandem.
const EYEBROW = "This week's pick";

export async function PickOfWeekStrip({ slug }: { slug: string }) {
  const pick = await getCurrentStrainPickOfWeek();
  // Null-render contract (3 conditions, any one trips):
  //   - reader returned null (flag OFF or no current pick) → !pick
  //   - viewer is on a different strain page → slug mismatch
  if (!pick) return null;
  if (pick.strainSlug !== slug) return null;

  return (
    <aside
      role="note"
      aria-label="This week's pick — editorial context from the shop"
      className="mt-3 mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm"
    >
      <div>
        <p className="text-stone-800 leading-relaxed">
          <span
            aria-hidden="true"
            className="mr-1.5"
          >
            📌
          </span>
          <span className="font-semibold text-amber-900">
            {EYEBROW}
          </span>
          <span className="text-stone-500"> — </span>
          <span className="text-stone-700">
            {pick.editorialNote}
          </span>
          <span className="text-stone-500"> — </span>
          <span className="italic text-stone-600">
            Picked by {pick.budtenderName}
          </span>
        </p>
      </div>
    </aside>
  );
}
