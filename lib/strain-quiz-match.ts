// Strain-finder quiz deterministic matcher — server-only.
//
// URL contract (the `/find-your-strain/result` page reads these query params):
//   ?vibe=<vibe-token>     — moment-of-day token from the quiz step 1
//   ?form=<form-token>     — format token from quiz step 2 (Flower / Pre-Rolls /
//                            Edibles / Vapes / Concentrates / empty=any)
//                            (legacy `?category=` param is also accepted — the
//                            StrainFinderClient emitted it pre-result-page; the
//                            reader normalizes both → `form`.)
//   ?strain=<strain-slug>  — strain-type preference from quiz step 3
//                            (sativa / indica / hybrid / empty=any)
//
// All tokens are OPTIONAL — empty/missing means "no preference, show the
// general direction." The matcher always returns 3-5 results; if no match
// exceeds the floor, it relaxes constraints in this order:
//   1. type + vibe   → require both
//   2. type only     → require strain.type match
//   3. unconstrained → top-of-corpus fallback (popularity order)
//
// FORMAT TOKEN is captured for the URL contract + downstream `/menu` deep-link
// but does NOT participate in the strain corpus match today — every strain in
// the corpus is available across the form-types where the producer chose to
// stock it, so format is a customer-routing signal (carried to /menu) NOT a
// strain-filtering signal. Future iteration could surface format-availability
// hints in card subtext if we wire live POS inventory in.
//
// VIBE → TERPENE MAPPING DOCTRINE (WSLCB WAC 314-55-155 compliance lane):
//   The vibe token is a CUSTOMER-SELF-REPORTED MOMENT (e.g. "chill", "energize",
//   "sleep", "creative", "social"). The mapping translates those moments into
//   DOMINANT TERPENE FAMILIES that customers historically reach for during
//   those moments — NOT a medical/efficacy claim that the terpene causes the
//   moment. Framing in the result page UI MUST stay in preference-observation
//   voice ("people who reach for this often want ___", "leans heavier",
//   "leans brighter") — never causation ("for relaxation", "for energy").
//
//   Mapping rationale (pinned, not claim-language):
//     chill    — myrcene-forward + linalool (regulars reach for these at
//                wind-down hour); pairs well with indica-leaning strains
//     energize — limonene-forward + pinene (regulars reach for these at
//                daytime + creative-work hour); pairs well with sativa-leaning
//     sleep    — myrcene-dominant + caryophyllene (regulars reach for these
//                bedtime); pairs heavier with indica-leaning
//     creative — limonene + pinene (sister of energize, leans brighter)
//     social   — caryophyllene + limonene (regulars reach for these in
//                social-setting hour); pairs with hybrid lean
//
//   No vibe → no terpene boost; matcher falls back to strain-type only.
//
// Long-term: this mapping should ship as a separate doc decision (Doug review)
// + be informed by actual customer telemetry (vibe-chip rating capture per
// PLAN Phase 1A Ship 1A.3). Today's mapping is a v1 hand-curated baseline.

import "server-only";
import { STRAINS, type Strain, STRAIN_SLUGS } from "./strains";

export type VibeToken = "chill" | "energize" | "sleep" | "creative" | "social" | "";
export type FormToken =
  | "Flower"
  | "Pre-Rolls"
  | "Edibles"
  | "Vapes"
  | "Concentrates"
  | "Tinctures"
  | "";
export type StrainTypeToken = "sativa" | "indica" | "hybrid" | "";

/** Normalized quiz tokens read from the URL — all optional. */
export type QuizTokens = {
  vibe: VibeToken;
  form: FormToken;
  strain: StrainTypeToken;
};

/** Vibe → dominant-terpene family mapping. Pure data, no claim language.
 *  See doctrine note at top of file — these are PREFERENCE OBSERVATIONS,
 *  not efficacy claims. */
const VIBE_TERPENE_MAP: Record<Exclude<VibeToken, "">, readonly string[]> = {
  chill: ["myrcene", "linalool"],
  energize: ["limonene", "pinene"],
  sleep: ["myrcene", "caryophyllene"],
  creative: ["limonene", "pinene"],
  social: ["caryophyllene", "limonene"],
};

/** Strain-type lean per vibe — a softer signal than the terpene match.
 *  Used as a tiebreaker when the customer didn't specify a type explicitly. */
const VIBE_TYPE_LEAN: Record<Exclude<VibeToken, "">, Strain["type"]> = {
  chill: "indica",
  energize: "sativa",
  sleep: "indica",
  creative: "sativa",
  social: "hybrid",
};

/** Score a single strain against the quiz tokens.
 *  Higher = better fit. Returns null when score is below the floor
 *  (= 0 — meaning the strain shares no signal with any quiz answer). */
export function scoreStrain(strain: Strain, tokens: QuizTokens): number | null {
  let score = 0;

  // STRAIN-TYPE match — strongest signal when the customer expressed a type
  // preference. +10 if exact match.
  if (tokens.strain && strain.type === tokens.strain) {
    score += 10;
  }

  // VIBE → TERPENE match — score per dominant terpene shared. Uses the
  // `terpenes[].name` field (already WSLCB-compliant per Ship 2.7c build-gate).
  if (tokens.vibe) {
    const wantedTerps = VIBE_TERPENE_MAP[tokens.vibe] ?? [];
    const strainTerps = (strain.terpenes ?? []).map((t) => t.name.toLowerCase());
    for (let i = 0; i < wantedTerps.length; i++) {
      const wanted = wantedTerps[i];
      if (strainTerps.includes(wanted)) {
        // First (dominant) match = +5, second-tier match = +3.
        score += i === 0 ? 5 : 3;
      }
    }
    // Soft vibe → type-lean tiebreaker (+2 if matches, only counts when the
    // customer didn't specify a type — otherwise the explicit +10 above is
    // the load-bearing signal).
    if (!tokens.strain && strain.type === VIBE_TYPE_LEAN[tokens.vibe]) {
      score += 2;
    }
  }

  // De-prioritize legacy strains (soft-cut category — page exists but the
  // strain is deprecated from primary rotation per Tier-1 triage).
  if (strain.legacy) {
    score -= 4;
  }

  return score > 0 ? score : null;
}

/** Match-confidence tier — derived from the raw `scoreStrain` value but
 *  exposed as a coarse band so the UI doesn't fabricate precision the
 *  scoring algorithm doesn't support. Voice rubric: stays observational
 *  ("Strong match"/"Good match"/"General direction") — never causation.
 *
 *  Banding (matches the scoreStrain weights):
 *    - "strong"  — score ≥ 12 (= type-match +10 AND at least one terpene hit)
 *    - "good"    — score ≥ 5  (= one solid signal: type alone, or top terpene)
 *    - "general" — score ≥ 1, OR card was topped-up from corpus popularity
 *                  when fewer than MIN_RESULTS scored above floor. */
export type QuizMatchConfidence = "strong" | "good" | "general";

/** Quiz-result strain card shape — minimal data the result page needs.
 *  Decouples the page render from the full `Strain` shape so the page
 *  contract stays narrow (no FAQ corpus, no body copy, etc.). */
export type QuizMatchCard = {
  slug: string;
  name: string;
  type: Strain["type"];
  tagline: string;
  lineage?: string;
  thcRange?: string;
  dominantTerpene?: string;
  /** Why this strain matched — used to surface a one-line "Why this" pill
   *  beneath each card. Stays in preference-observation voice (no claim
   *  language). */
  matchReason: string;
  /** Coarse confidence band the UI renders as a pill ("Strong match" /
   *  "Good match" / "General direction"). Derived from the raw score; the
   *  raw number is intentionally NOT exposed (avoid implying precision the
   *  algorithm doesn't have). */
  confidence: QuizMatchConfidence;
};

/** Match strategy used to compute the result set. Surfaced to the page so
 *  it can render an honest banner ("we don't have an exact match — here are
 *  3 in the general direction"). */
export type MatchStrategy =
  | "type-and-vibe"
  | "type-only"
  | "vibe-only"
  | "unconstrained";

export type QuizMatchResult = {
  cards: QuizMatchCard[];
  strategy: MatchStrategy;
  /** Number of cards rendered — 3-5 cap. */
  count: number;
};

const MIN_RESULTS = 3;
const MAX_RESULTS = 5;

/** Build the "why this" one-liner per card. Voice-checked:
 *  preference-observation only, no causation claims. */
function buildMatchReason(strain: Strain, tokens: QuizTokens): string {
  const parts: string[] = [];

  if (tokens.strain && strain.type === tokens.strain) {
    parts.push(`${strain.type} pick`);
  }

  if (tokens.vibe) {
    const wantedTerps = VIBE_TERPENE_MAP[tokens.vibe] ?? [];
    const strainTerps = (strain.terpenes ?? []).map((t) => t.name.toLowerCase());
    const shared = wantedTerps.find((w) => strainTerps.includes(w));
    if (shared) {
      const cap = shared.charAt(0).toUpperCase() + shared.slice(1);
      parts.push(`${cap}-forward profile`);
    }
  }

  // Fallback — when no token matched specifically, frame as a corpus pick.
  if (parts.length === 0) {
    return "Regulars reach for this often";
  }

  return parts.join(" · ");
}

/** Derive the coarse confidence band from a raw score. See
 *  `QuizMatchConfidence` docstring for the banding rationale. */
export function confidenceFromScore(score: number | null): QuizMatchConfidence {
  if (score === null) return "general";
  if (score >= 12) return "strong";
  if (score >= 5) return "good";
  return "general";
}

/** Convert a Strain → QuizMatchCard. Pure shape projection. Confidence
 *  defaults to "general" when the caller didn't compute a score (e.g.
 *  top-up rows from the popularity fallback path). */
function toCard(
  strain: Strain,
  tokens: QuizTokens,
  confidence: QuizMatchConfidence = "general",
): QuizMatchCard {
  return {
    slug: strain.slug,
    name: strain.name,
    type: strain.type,
    tagline: strain.tagline,
    lineage: strain.lineage,
    thcRange: strain.thcRange,
    dominantTerpene: strain.terpenes?.[0]?.name,
    matchReason: buildMatchReason(strain, tokens),
    confidence,
  };
}

/** Normalize a raw query-string param into a typed token. Whitespace + casing
 *  tolerant; unknown values collapse to "" (= "no preference"). */
export function parseVibe(raw: string | string[] | undefined): VibeToken {
  if (!raw || Array.isArray(raw)) return "";
  const v = raw.trim().toLowerCase();
  if (v === "chill" || v === "energize" || v === "sleep" || v === "creative" || v === "social") {
    return v;
  }
  return "";
}

export function parseStrainType(raw: string | string[] | undefined): StrainTypeToken {
  if (!raw || Array.isArray(raw)) return "";
  const v = raw.trim().toLowerCase();
  if (v === "sativa" || v === "indica" || v === "hybrid") {
    return v;
  }
  return "";
}

export function parseForm(raw: string | string[] | undefined): FormToken {
  if (!raw || Array.isArray(raw)) return "";
  // Tolerate `Flower` / `flower` / `FLOWER` — canonical is title-case as the
  // quiz emits. Pre-Rolls keeps the hyphen.
  const v = raw.trim();
  const lower = v.toLowerCase();
  if (lower === "flower") return "Flower";
  if (lower === "pre-rolls" || lower === "prerolls" || lower === "pre-roll") return "Pre-Rolls";
  if (lower === "edibles" || lower === "edible") return "Edibles";
  if (lower === "vapes" || lower === "vape") return "Vapes";
  if (lower === "concentrates" || lower === "concentrate") return "Concentrates";
  if (lower === "tinctures" || lower === "tincture") return "Tinctures";
  return "";
}

/** Read all three tokens from a Next.js searchParams-shaped object. */
export function parseQuizTokens(searchParams: Record<string, string | string[] | undefined>): QuizTokens {
  return {
    vibe: parseVibe(searchParams.vibe),
    // Accept both `form` (new contract) AND `category` (legacy contract emitted
    // pre-result-page) — the result-page URL the new submit handler emits is
    // `?form=` but a customer landing from an old shared link with `?category=`
    // still gets a valid render.
    form: parseForm(searchParams.form ?? searchParams.category),
    strain: parseStrainType(searchParams.strain),
  };
}

/** Match strains against the quiz tokens. Returns 3-5 cards + the strategy
 *  used. Server-only (consumes STRAINS corpus directly). */
export function matchQuizStrains(tokens: QuizTokens): QuizMatchResult {
  // Score every strain in corpus order (popularity).
  const scored: Array<{ strain: Strain; score: number }> = [];
  for (const slug of STRAIN_SLUGS) {
    const strain = STRAINS[slug];
    if (!strain) continue;
    const score = scoreStrain(strain, tokens);
    if (score !== null) scored.push({ strain, score });
  }

  // Sort by score desc, then by corpus order (= popularity) for ties.
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return STRAIN_SLUGS.indexOf(a.strain.slug) - STRAIN_SLUGS.indexOf(b.strain.slug);
  });

  let strategy: MatchStrategy;
  if (tokens.strain && tokens.vibe) {
    strategy = "type-and-vibe";
  } else if (tokens.strain) {
    strategy = "type-only";
  } else if (tokens.vibe) {
    strategy = "vibe-only";
  } else {
    strategy = "unconstrained";
  }

  // Top picks above floor — cap at MAX_RESULTS. The floor is "any positive
  // signal" (score > 0 — already enforced by scoreStrain returning null).
  // Confidence band is computed per-card from the raw score so the UI can
  // render a coarse "Strong / Good / General direction" pill without
  // exposing the underlying number.
  let cards = scored
    .slice(0, MAX_RESULTS)
    .map((s) => toCard(s.strain, tokens, confidenceFromScore(s.score)));

  // If we got fewer than MIN_RESULTS, top up from corpus order (popularity).
  // Top-up rows default to "general" confidence (they didn't score above
  // the floor — they're popularity fallbacks, not actual matches).
  if (cards.length < MIN_RESULTS) {
    const have = new Set(cards.map((c) => c.slug));
    for (const slug of STRAIN_SLUGS) {
      if (cards.length >= MIN_RESULTS) break;
      if (have.has(slug)) continue;
      const s = STRAINS[slug];
      if (!s || s.legacy) continue;
      cards.push(toCard(s, tokens, "general"));
      have.add(slug);
    }
    // If we had to top up at all, downgrade the strategy disclosure — the
    // customer should see the "general direction" framing, not an
    // exact-match claim.
    if (strategy !== "unconstrained") strategy = "unconstrained";
  }

  return {
    cards,
    strategy,
    count: cards.length,
  };
}
