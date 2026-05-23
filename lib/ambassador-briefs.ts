import { STORE } from "./store.ts";

/**
 * Ambassador Program — content brief library.
 *
 * Per PLAN_AMBASSADOR_PROGRAM.md §3 + §10 default ("ship 5 highest-leverage
 * briefs day 1"). The 5 we ship: Strain Cheers / Budtender Shoutout /
 * What's in My Bag / Outfit + Vibe / Walking Out Happy.
 *
 * Each brief is a self-contained customer-facing prompt + per-brief
 * compliance tips. The compliance tips lift the §4 WAC 314-55-155 +
 * privacy guardrails to the surface where the customer makes the
 * recording decision — by the time the video lands in the manager queue
 * the customer has self-screened against the rule that applies.
 *
 * CRITICAL: this file is **byte-identical** between greenlife-web and
 * seattle-cannabis-web. Maintain in lockstep — sister-port any change
 * to both stacks in the same push window. STORE.name substitutes
 * per-stack via the template-literal in `prompt` so the customer sees
 * the correct shop name regardless of which site they landed on.
 *
 * Compliance vocabulary is intentionally narrow:
 *   - "outside the store" is repeated in every brief (no in-store filming)
 *   - "no consumption on camera" / "no smoking, dabbing, or vaping" verbatim
 *   - "21+ only" / "first names only" — privacy posture
 * No medical, efficacy, or condition vocabulary appears anywhere here —
 * scripts/check-efficacy-claims.mjs will trip on anything that does.
 *
 * NOT exported: helpers to render the briefs as HTML / cards / etc. —
 * the customer-facing page owns presentation; this file owns the
 * data + tests own the invariants.
 */

export type Brief = {
  /** Stable id used as a foreign key on `ugc_submissions.brief_id`. */
  id: string;
  /** Short customer-facing title (≤60 chars; pin-tested). */
  title: string;
  /** The actual prompt the customer reads + records against. */
  prompt: string;
  /** Target length in seconds (10–90; pin-tested). */
  targetSeconds: number;
  /** Per-brief compliance tips shown alongside the prompt. */
  complianceTips: string[];
};

/** Shared compliance tips that apply to every brief. Kept as a separate
 *  const so per-brief lists can prepend brief-specific guidance without
 *  drifting from the base set. */
const SHARED_COMPLIANCE_TIPS: readonly string[] = [
  "Record OUTSIDE the store — no in-store filming.",
  "No smoking, dabbing, or vaping on camera. Packaging and flower in hand are fine.",
  "Everyone in the frame must be 21+.",
  "First names only — no last names, no addresses.",
  "No medical talk — share what you like about it, not what it does for you.",
];

export const BRIEF_LIBRARY: readonly Brief[] = [
  {
    id: "strain-cheers",
    title: "Strain Cheers",
    prompt: "Hold up your favorite strain. Tell us in 10 words why.",
    targetSeconds: 15,
    complianceTips: [
      "Show the package label clearly — easier for us to verify the strain.",
      ...SHARED_COMPLIANCE_TIPS,
    ],
  },
  {
    id: "budtender-shoutout",
    title: "Budtender Shoutout",
    prompt: `Name a ${STORE.name} budtender + one thing they did that mattered.`,
    targetSeconds: 30,
    complianceTips: [
      "First name only for the budtender — no last names, no shift specifics.",
      ...SHARED_COMPLIANCE_TIPS,
    ],
  },
  {
    id: "whats-in-bag",
    title: "What's in My Bag",
    prompt: "Walk us through what you bought today (no consumption shown).",
    targetSeconds: 45,
    complianceTips: [
      "Bag and product on camera is fine — opening, loading, or using a product is not.",
      ...SHARED_COMPLIANCE_TIPS,
    ],
  },
  {
    id: "outfit-vibe",
    title: "Outfit + Vibe",
    prompt: "Show your fit. What's the energy you're going for tonight?",
    targetSeconds: 20,
    complianceTips: [
      "Keep it about the look and the plan — not about how a product will make you feel.",
      ...SHARED_COMPLIANCE_TIPS,
    ],
  },
  {
    id: "walking-out-happy",
    title: "Walking Out Happy",
    prompt: `30 seconds outside ${STORE.name} right after a great visit.`,
    targetSeconds: 30,
    complianceTips: [
      "Storefront in the background is fine — point the camera at yourself, not into the shop.",
      ...SHARED_COMPLIANCE_TIPS,
    ],
  },
] as const;

/** Lookup helper — returns the brief with matching id, or undefined.
 *  Callers (upload route validation, page renderer) should treat
 *  undefined as "unknown brief id" and reject. */
export function getBrief(id: string): Brief | undefined {
  return BRIEF_LIBRARY.find((b) => b.id === id);
}

/** Allowlist of brief ids — used by the upload-video route to reject
 *  inserts referencing a brief that doesn't exist (foreign key defense
 *  before the row hits Postgres). */
export const BRIEF_IDS: readonly string[] = BRIEF_LIBRARY.map((b) => b.id);
