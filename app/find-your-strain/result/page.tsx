import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { withAttr } from "@/lib/attribution";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  matchQuizStrains,
  parseQuizTokens,
  type QuizTokens,
  type QuizMatchResult,
} from "@/lib/strain-quiz-match";

// /find-your-strain/result — quiz outcome page. Reads the 3 quiz tokens
// from the URL (?vibe= / ?form= / ?strain=) and renders 3-5 strain cards
// matching the customer's answers.
//
// Why this exists: the quiz used to redirect to /menu?vibe=X&category=Y;
// iHJ Boost (the menu's embed) silently strips those query params, so the
// customer's answers were LOST. This page captures the result BEFORE the
// menu hop so the quiz actually shows something matched to the answers.
//
// WSLCB compliance (WAC 314-55-155):
// - Page copy stays in preference-observation voice ("people who reach for
//   this often want ___", "leans heavier", "leans brighter") — NEVER causation
//   framing ("for relaxation", "for energy").
// - Card content reuses `strain.tagline` which already passed Ship 2.7c
//   build-gate (check-strain-body-claims). No new strain copy authored here.
// - Vibe→terpene mapping doctrine lives in `lib/strain-quiz-match.ts`
//   header — pinned, not claim-language.
//
// SEO: noindex (customer result page, not an evergreen surface). Cards
// link into the corresponding /strains/[slug] pages which ARE the indexed
// surface.

export const dynamic = "force-dynamic"; // search params drive every render

export const metadata: Metadata = {
  title: { absolute: `Your strain matches — ${STORE.name}` },
  description: `Strain matches from your 3-question quiz at ${STORE.name}. Pick a strain, read up, then check the live menu for what's on the shelf right now.`,
  alternates: { canonical: "/find-your-strain/result" },
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
};

const TYPE_LABELS: Record<string, { label: string; chip: string; dot: string }> = {
  indica: { label: "Indica", chip: "bg-purple-50 text-purple-800", dot: "bg-purple-400" },
  sativa: { label: "Sativa", chip: "bg-red-50 text-red-800", dot: "bg-red-400" },
  hybrid: { label: "Hybrid", chip: "bg-green-50 text-green-800", dot: "bg-green-400" },
};

/** Confidence pill label + class per band. Voice rubric: stays
 *  preference-observation ("Strong match"/"Good match"/"General direction")
 *  — never causation. Color discipline: green=strong, emerald=good,
 *  stone=general (neutral). Hide entirely for "general" on a card that's
 *  NOT the top result — the customer doesn't need a pill on every row
 *  saying the same thing. */
const CONFIDENCE_PILL: Record<string, { label: string; chip: string }> = {
  strong: { label: "Strong match", chip: "bg-green-100 text-green-900" },
  good: { label: "Good match", chip: "bg-emerald-50 text-emerald-800" },
  general: { label: "General direction", chip: "bg-stone-100 text-stone-700" },
};

/** Headline copy varies by which tokens the customer answered + how well
 *  we matched. All preference-observation voice, zero causation framing.
 *
 *  Sub-sentence is rendered as ONE complete sentence in every quadrant
 *  (vibe set/empty × form set/empty). Prior shape concatenated a delimited
 *  `summary` segment ("as flower." / "for the chill hour.") onto the end of
 *  a separate title-period sentence, which read as orphan fragments in the
 *  live rendering ("...you might like these. as flower."). Customer journey
 *  audit 2026-05-28 flagged this as confidence-killing — fix is a per-
 *  quadrant grammatical sub string, no leftover delimited concatenation. */
function buildHeadline(tokens: QuizTokens, result: QuizMatchResult): { eyebrow: string; title: string; sub: string } {
  // Match-strategy framed honestly. The customer should know when we relaxed
  // constraints — comms-expert lane.
  if (result.strategy === "unconstrained" && (tokens.vibe || tokens.strain)) {
    return {
      eyebrow: "Your matches",
      title: "We don't have an exact match — here are a few in the general direction.",
      sub:
        "These are strains regulars reach for when they're after something like what you told us. " +
        "Read up on each, then check the live menu for what's on the shelf right now.",
    };
  }

  // Per-quadrant complete-sentence sub. Renders as ONE sentence regardless of
  // which tokens are set; never produces an orphan ". as flower." construction.
  const formLower = tokens.form ? tokens.form.toLowerCase() : null;
  const vibe = tokens.vibe ?? null;
  const strain = tokens.strain ?? null;

  let sub: string;
  if (strain && vibe && formLower) {
    sub = `For ${strain}-leaning ${formLower} on a ${vibe} day, here are a few we'd reach for — the shop'll know more in person.`;
  } else if (strain && vibe) {
    sub = `For ${strain}-leaning picks on a ${vibe} day, here are a few we'd reach for — the shop'll know more in person.`;
  } else if (strain && formLower) {
    sub = `For ${strain}-leaning ${formLower}, here are a few we'd reach for — the shop'll know more in person.`;
  } else if (vibe && formLower) {
    sub = `For ${formLower} on a ${vibe} day, here are a few we'd reach for — the shop'll know more in person.`;
  } else if (vibe) {
    sub = `For a ${vibe} day, here are a few we'd reach for — the shop'll know more in person.`;
  } else if (formLower) {
    sub = `When you're after ${formLower}, here are a few we'd reach for — the shop'll know more in person.`;
  } else if (strain) {
    sub = `For ${strain}-leaning picks, here are a few we'd reach for — the shop'll know more in person.`;
  } else {
    sub = "These are a starting place — and a few of the strains regulars reach for most often.";
  }

  return {
    eyebrow: "Your matches",
    title: `Based on what you told us, you might like these.`,
    sub,
  };
}

/** Build the "back-to-menu" deep link carrying the same tokens. The menu
 *  embed strips params today, but the link survives in case Boost adds
 *  passthrough later (mirrors the existing mood-shortcut pattern). */
function buildMenuHref(tokens: QuizTokens): string {
  const params = new URLSearchParams();
  if (tokens.vibe) params.set("vibe", tokens.vibe);
  if (tokens.form) params.set("category", tokens.form);
  if (tokens.strain) params.set("strain", tokens.strain);
  const qs = params.toString();
  return withAttr(qs ? `/menu?${qs}` : "/menu", "quiz", "result-menu");
}

export default async function QuizResultPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Next 16 RSC: searchParams is a Promise — must await.
  const sp = await searchParams;
  const tokens = parseQuizTokens(sp);
  const result = matchQuizStrains(tokens);
  const headline = buildHeadline(tokens, result);
  const menuHref = buildMenuHref(tokens);

  return (
    <div className="min-h-screen bg-stone-50">
      <Breadcrumb
        items={[
          { label: "Find Your Strain", href: "/find-your-strain" },
          { label: "Your matches" },
        ]}
      />

      {/* Hero — softer gradient than the quiz hero (you're past the form now). */}
      <section className="relative overflow-hidden border-b border-stone-200 bg-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(187, 247, 208, 0.55), transparent), radial-gradient(circle at 100% 100%, rgba(167, 243, 208, 0.35), transparent 50%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-[11px] font-bold uppercase tracking-[0.18em] text-green-700">
            <span aria-hidden>✓</span>
            {headline.eyebrow}
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
            {headline.title}
          </h1>
          <p className="mt-3 text-stone-600 text-base sm:text-lg max-w-2xl leading-relaxed">
            {headline.sub}
          </p>

          {/* Picks-so-far echo strip — shows the customer what we read from
              their URL so they can verify the match is on what they said.
              All chips are static (no editing on the result page; "Re-run"
              link below takes them back to the quiz). */}
          {(tokens.vibe || tokens.form || tokens.strain) && (
            <div className="mt-5 flex flex-wrap items-center gap-2" aria-label="Your quiz answers">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                You told us
              </span>
              {tokens.vibe && (
                <span className="inline-flex items-center rounded-full bg-white border border-stone-200 px-2.5 py-1 text-[11px] font-bold text-stone-700 capitalize">
                  {tokens.vibe} hour
                </span>
              )}
              {tokens.form && (
                <span className="inline-flex items-center rounded-full bg-white border border-stone-200 px-2.5 py-1 text-[11px] font-bold text-stone-700">
                  {tokens.form}
                </span>
              )}
              {tokens.strain && (
                <span className="inline-flex items-center rounded-full bg-white border border-stone-200 px-2.5 py-1 text-[11px] font-bold text-stone-700 capitalize">
                  {tokens.strain}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Strain cards — reuses the `/strains` hub card shape (NOT a new SSoT
          component; the StrainCard primitive refactor is a separate ship per
          UX expert #1 recommendation). Card hierarchy: name → tagline →
          chip row (type + dominant terpene + match-reason). */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
          aria-label={`${result.count} strain matches`}
        >
          {result.cards.map((card, i) => {
            const typeBadge =
              TYPE_LABELS[card.type] ?? { label: card.type, chip: "bg-stone-100 text-stone-700", dot: "bg-stone-400" };
            // Confidence pill rendering policy: show on every card with
            // strong/good confidence. For "general" confidence, show only
            // on the top card (i === 0) — pinning a pill to every general-
            // direction row would just be visual noise repeating the
            // strategy banner above.
            const confidencePill = CONFIDENCE_PILL[card.confidence];
            const showConfidence = confidencePill && (card.confidence !== "general" || i === 0);
            return (
              <li key={card.slug}>
                <Link
                  href={`/strains/${card.slug}`}
                  className="group block h-full rounded-xl bg-white border border-stone-200 hover:border-green-500 hover:shadow-sm transition-all px-4 py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base sm:text-lg font-bold tracking-tight text-stone-900 group-hover:text-green-900 transition-colors">
                      {card.name}
                    </h2>
                    {showConfidence && (
                      <span
                        className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${confidencePill.chip}`}
                        aria-label={`Match quality: ${confidencePill.label}`}
                      >
                        {confidencePill.label}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-stone-600 leading-snug">
                    {card.tagline}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${typeBadge.chip}`}
                    >
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${typeBadge.dot}`} aria-hidden />
                      {typeBadge.label}
                    </span>
                    {card.dominantTerpene && (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-emerald-50 text-emerald-700">
                        {card.dominantTerpene}
                      </span>
                    )}
                    {card.thcRange && (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-stone-100 text-stone-700">
                        Typical THC {card.thcRange}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-[11px] text-stone-500 italic">
                    {card.matchReason}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Re-run + browse band — every result page must have an exit. */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-10">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500 mb-2">
            Not what you expected?
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 mb-3 leading-snug">
            Re-run the quiz, or jump straight to the menu.
          </h2>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/find-your-strain"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-green-700 text-white text-sm font-bold hover:bg-green-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
            >
              ← Re-run the quiz
            </Link>
            <Link
              href={menuHref}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-stone-200 text-sm font-bold text-stone-800 hover:border-green-300 hover:text-green-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              Browse the live menu →
            </Link>
          </div>
          {/* When the match strategy is unconstrained (fuzzy fallback), surface a phone
              backup so the customer has a third option besides re-run/browse. */}
          {result.strategy === "unconstrained" && (
            <p className="mt-4 text-xs text-stone-500">
              Or call us at{" "}
              <a
                href={`tel:${STORE.phoneTel}`}
                className="font-semibold text-green-800 underline decoration-stone-300 hover:decoration-green-700"
              >
                {STORE.phone}
              </a>{" "}
              and a budtender can talk through what you're after.
            </p>
          )}
        </div>
      </section>

      {/* Trust strip — same voice as the quiz page. */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
        <div className="rounded-2xl bg-stone-100 border border-stone-200 p-5 text-center">
          <p className="text-sm text-stone-700 leading-relaxed">
            These are a starting place. The crew at {STORE.name} — best cannabis staff in the Wenatchee Valley — will read the label with you and dial it the rest of the way at the counter.
          </p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-16 text-center">
        <p className="text-xs text-stone-400">
          Not legal advice. 21+. {STORE.name}, {STORE.address.city} WA.
        </p>
      </section>
    </div>
  );
}
