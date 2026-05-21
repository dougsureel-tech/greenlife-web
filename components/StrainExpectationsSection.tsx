/**
 * StrainExpectationsSection — C11 aggregated display.
 *
 * Renders the "What customers expect coming into this strain" surface.
 * Server component — does the gated DB lookup and returns null when
 * the flag is OFF or mock-mode is on (no public aggregation in either
 * case per the brief).
 *
 * IMPORTANT — this component is what the eventual Phase 1 strain page V2
 * mounts. The strain page mount itself is post-cutover work; THIS
 * component ships ONLY in the C11 commit. We do NOT touch
 * `app/strains/[slug]/page.tsx` directly per the brief.
 *
 * Anonymous-by-construction — never displays customer id, blob key,
 * moderation flags. Only the approved transcript snippet + an
 * "approved in <Month YYYY>" relative timestamp.
 */

import {
  getAggregatedExpectations,
  voiceMemoEnabled,
  voiceMemoMockMode,
  type AggregatedExpectation,
} from "@/lib/voice-memo";

type AccentColor = "indigo" | "emerald";

export type StrainExpectationsSectionProps = {
  strainSlug: string;
  strainName: string;
  accent?: AccentColor;
  /** Maximum number of memo snippets to render. Defaults to 6, which is
   *  enough to feel populated without dominating the strain page. */
  limit?: number;
};

const ACCENT_TEXT: Record<AccentColor, string> = {
  indigo: "text-indigo-700",
  emerald: "text-emerald-700",
};

const ACCENT_BORDER: Record<AccentColor, string> = {
  indigo: "border-indigo-100",
  emerald: "border-emerald-100",
};

function approvedMonthLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "recently";
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export async function StrainExpectationsSection(
  props: StrainExpectationsSectionProps,
) {
  const { strainSlug, strainName, accent = "indigo", limit = 6 } = props;

  // Gate 1: feature flag. Default OFF.
  if (!voiceMemoEnabled()) return null;

  // Gate 2: mock-mode. Until verified-purchase ships, no public aggregation.
  // Recording still works on the sample strain (per the brief) but the
  // aggregated surface stays dark.
  if (voiceMemoMockMode()) return null;

  let memos: AggregatedExpectation[] = [];
  try {
    memos = await getAggregatedExpectations(strainSlug, limit);
  } catch {
    // Component-scoped failure should never break the strain page when
    // it eventually mounts this. Empty array → empty-state below.
    memos = [];
  }

  if (memos.length === 0) {
    // Empty state when flag is on + mock-mode is off but no approved
    // memos exist yet. Render a tasteful placeholder so the section
    // doesn't visually pop in and out.
    return (
      <section
        aria-labelledby={`expectations-${strainSlug}`}
        className={`rounded-2xl border bg-white p-5 shadow-sm ${ACCENT_BORDER[accent]}`}
      >
        <h2
          id={`expectations-${strainSlug}`}
          className={`text-base font-semibold ${ACCENT_TEXT[accent]}`}
        >
          What customers expect coming into {strainName}
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          No memos yet. Customers who pick up {strainName} for the first time
          can record what drew them to it — those clips show up here after
          review.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby={`expectations-${strainSlug}`}
      className={`rounded-2xl border bg-white p-5 shadow-sm ${ACCENT_BORDER[accent]}`}
    >
      <h2
        id={`expectations-${strainSlug}`}
        className={`text-base font-semibold ${ACCENT_TEXT[accent]}`}
      >
        What customers expect coming into {strainName}
      </h2>
      <p className="mt-1 text-xs uppercase tracking-wider text-stone-500">
        Customer voice memos, transcribed and reviewed — anonymous by design
      </p>

      <ul className="mt-4 space-y-3">
        {memos.map((m, idx) => (
          <li
            key={idx}
            className="rounded-lg border border-stone-100 bg-stone-50/60 px-4 py-3"
          >
            <p className="text-sm text-stone-800">&ldquo;{m.snippet}&rdquo;</p>
            <p className="mt-1 text-xs text-stone-500">
              Approved in {approvedMonthLabel(m.approvedAt)}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs text-stone-500">
        These memos describe what customers hoped for coming in — not what
        they expect to feel from it. WAC 314-55-155.
      </p>
    </section>
  );
}
