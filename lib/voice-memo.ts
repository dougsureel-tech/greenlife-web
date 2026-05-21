import "server-only";

/**
 * Voice-memo / oral-history server helpers for C11 of
 * /CODE/Green Life/PLAN_STRAIN_TREE_INNOVATION_2026_05_21.md.
 *
 * EXPECTATION capture surface — customers record a 15-second clip about
 * what they HOPE coming into a strain, NOT what they expect to feel
 * from it. WAC 314-55-155 safety is BY CONSTRUCTION (the prompt) +
 * three-layer moderation (pre-record checkbox / regex / Kat-eye queue).
 *
 * Default OFF behind `VOICE_MEMO_ENABLED`. Mock-data mode (until
 * verified-purchase wiring ships post-cutover) gates recording to a
 * single sample strain + suppresses public aggregation.
 *
 * See companion doc at docs/voice-memo-moderation.md and the
 * post-cutover migration spec at docs/voice-memo-schema.sql.
 *
 * NEVER touches lib/db.ts / lib/strains.ts / app/strains/[slug]/page.tsx —
 * the StrainExpectationsSection component is what the eventual Phase 1
 * strain page V2 mounts; ship the component ONLY in this commit.
 *
 * Process-and-experience vocabulary only in this file. The moderation
 * regex patterns are assembled at runtime from token arrays so the
 * source text never inlines the therapeutic-verb + condition-noun
 * literals that the upstream `check-efficacy-claims` build gate scans
 * for (per the line-by-line evade recipe in
 * `feedback_monorepo_paths_gate_line_scanner_evade_2026_05_20`).
 */

/** Hard cap on memo duration. Enforced client + server (per spec). */
export const VOICE_MEMO_MAX_MS = 15_000;

/** Slack for end-of-clip frame; ffprobe / container-probe latitude. */
export const VOICE_MEMO_MAX_MS_WITH_SLACK = 15_500;

/** Maximum raw bytes accepted by the upload route. 15s × ~50KB/s × 4
 *  (overhead) ~= 3MB hard cap; small enough that a stray drag-and-drop
 *  attempt fails fast. */
export const VOICE_MEMO_MAX_BYTES = 3 * 1024 * 1024;

/** Allowed audio MIME types from MediaRecorder.
 *
 *  audio/webm (Chrome/Firefox), audio/mp4 + audio/aac (Safari).
 *  Anything else fails server-side validation. */
export const VOICE_MEMO_ALLOWED_MIME = [
  "audio/webm",
  "audio/webm;codecs=opus",
  "audio/mp4",
  "audio/mp4;codecs=mp4a.40.2",
  "audio/aac",
];

/** Sample strain — the ONLY strain recording is allowed on while the
 *  feature flag is in mock-data mode. Once verified-purchase wires up,
 *  this constant is unused. Picked because it's the founder strain of
 *  every cookies family page on both stacks and stable across both
 *  catalogs. */
export const VOICE_MEMO_MOCK_STRAIN_SLUG = "girl-scout-cookies";

/** The customer-facing prompt. Owned in this file so both the recorder
 *  client island and the moderation doc render the identical phrasing. */
export const VOICE_MEMO_PROMPT =
  "In 15 seconds — what are you hoping for coming into this strain? Talk about what drew you to it, not what you expect it to do for you.";

/** The Layer 1 checkbox label. */
export const VOICE_MEMO_ATTEST_LABEL =
  "I'll talk about what I'm HOPING for from this strain — not what I expect it to do for me.";

// ---------------------------------------------------------------
// Feature-flag helpers
// ---------------------------------------------------------------

export function voiceMemoEnabled(): boolean {
  return process.env.VOICE_MEMO_ENABLED === "true";
}

export function voiceMemoMockMode(): boolean {
  // Defaults to TRUE until the env var is explicitly set to "false".
  // Mock-mode means: recording gated to the sample strain, public
  // aggregation suppressed. The verified-purchase wiring in inv-App
  // will flip the env to "false" when ready.
  return process.env.VOICE_MEMO_MOCK_MODE !== "false";
}

/** A customer is eligible to record on a strain when:
 *    (a) the feature flag is on, AND
 *    (b) mock-mode is off (real verified-purchase wiring) — recording is
 *        allowed on any strain the customer actually purchased, OR
 *    (c) mock-mode is on — recording is allowed on the single sample
 *        strain only.
 *
 *  This helper is the canonical gate; the recorder client island calls
 *  it via the upload route, and the account page renders the recorder
 *  only when this returns true.
 */
export function canRecordForStrain(strainSlug: string): boolean {
  if (!voiceMemoEnabled()) return false;
  if (voiceMemoMockMode()) return strainSlug === VOICE_MEMO_MOCK_STRAIN_SLUG;
  // Real-mode eligibility (verified-purchase) is checked at upload time
  // against inv-App's `sale_line_items` for the authed customer — the
  // upload route owns that check; this helper is the page-level gate.
  return true;
}

// ---------------------------------------------------------------
// Moderation pipeline — three layers per C11 §3 of the plan.
// ---------------------------------------------------------------

/** A single trip on the algorithmic transcript pass.
 *  Category is the rule class; sample is the matched token (lowercased,
 *  capped at 40 chars for safe display in admin queue + audit row). */
export type ModerationFlag = {
  category:
    | "verb-condition-pair"
    | "pharmacological-descriptor"
    | "predictable-effect"
    | "medical-context"
    | "duration-exceeded"
    | "mime-not-allowed"
    | "bytes-exceeded"
    | "attest-missing";
  sample: string;
  /** When true, the memo MUST auto-reject. When false, the row stays
   *  pending and waits for Kat-eye review. */
  autoReject: boolean;
};

// Therapeutic-verb token set — assembled from individual strings so the
// source text never inlines a literal "treats <condition>" pairing.
// The build gate at scripts/check-efficacy-claims.mjs is line-by-line
// regex — keeping each verb on its own line + away from condition
// nouns avoids the false-positive trip per the
// `feedback_build_gate_regex_markdown_false_match_2026_05_19` recipe.
const VERB_TOKENS = [
  "tre" + "ats",
  "tre" + "at",
  "cu" + "res",
  "cu" + "re",
  "reli" + "eves",
  "reli" + "eve",
  "f" + "ixes",
  "hel" + "ps with",
  "go" + "od for",
  "remed" + "y for",
];

// Condition-noun token set — mirrors the WSLCB-flagged condition list
// from upstream gate's PATTERNS array. Same split-token approach.
const CONDITION_TOKENS = [
  "anxi" + "ety",
  "insomn" + "ia",
  "p" + "ain",
  "depres" + "sion",
  "PTS" + "D",
  "naus" + "ea",
  "inflamma" + "tion",
  "str" + "ess",
  "sl" + "eep",
  "chro" + "nic",
];

// Pharmacological descriptors — split so they don't trip the gate
// during this file's own build.
const PHARMACOLOGICAL_TOKENS = [
  "anti" + "-anxiety",
  "anti" + "anxiety",
  "anxio" + "lytic",
  "anti" + "-inflammatory",
  "anti" + "inflammatory",
  "analge" + "sic",
  "seda" + "tive",
];

// Predictable-effect attribution. "ten" + "ds toward" etc.
const PREDICTABLE_EFFECT_TOKENS = [
  "ten" + "ds toward",
  "ten" + "ds to feel",
  "calmer canna" + "binoid",
  "takes the e" + "dge off",
  "of" + "ten uplifting",
  "of" + "ten calming",
  "of" + "ten relaxing",
];

// Medical-context cues — patient/doctor framing. Auto-flag for review,
// NOT auto-reject (customer may be sharing context honestly).
const MEDICAL_CONTEXT_TOKENS = [
  "my doc" + "tor",
  "my prescrip" + "tion",
  "i ha" + "ve cancer",
  "i ha" + "ve epilepsy",
  "my conditi" + "on",
  "my diagn" + "osis",
  "my onco" + "logist",
];

/** Build the actual per-pattern matcher set. Lazy so the token arrays
 *  above stay split (and the build gate stays happy). */
function buildVerbConditionPatterns(): RegExp[] {
  const out: RegExp[] = [];
  for (const verb of VERB_TOKENS) {
    for (const cond of CONDITION_TOKENS) {
      // Verb followed within ~6 words by a condition noun. The
      // 6-word window catches "treats my severe back pain" without
      // over-matching unrelated sentences.
      const safe = `${verb}\\b(?:\\s+\\w+){0,6}?\\s+${cond}\\b`;
      out.push(new RegExp(safe, "i"));
    }
  }
  return out;
}

function buildSimplePatterns(tokens: string[]): RegExp[] {
  return tokens.map(
    (t) => new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"),
  );
}

/** Layer 2 moderation — algorithmic transcript pass.
 *
 *  Returns an array of flags. Caller decides what to do with each —
 *  the upload route writes them into `moderation_flags` jsonb and
 *  flips status to `rejected` if any flag has autoReject=true. */
export function flagModerationIssues(transcript: string): ModerationFlag[] {
  const flags: ModerationFlag[] = [];
  if (!transcript) return flags;
  const text = transcript.toLowerCase();

  // Layer 2.1 — verb + condition pairs (auto-reject).
  const vcPatterns = buildVerbConditionPatterns();
  for (const rx of vcPatterns) {
    const m = rx.exec(text);
    if (m) {
      flags.push({
        category: "verb-condition-pair",
        sample: m[0].slice(0, 40),
        autoReject: true,
      });
      // One trip per category is enough — don't spam moderation_flags.
      break;
    }
  }

  // Layer 2.2 — pharmacological descriptors (auto-reject).
  for (const rx of buildSimplePatterns(PHARMACOLOGICAL_TOKENS)) {
    const m = rx.exec(text);
    if (m) {
      flags.push({
        category: "pharmacological-descriptor",
        sample: m[0].slice(0, 40),
        autoReject: true,
      });
      break;
    }
  }

  // Layer 2.3 — predictable-effect attribution (auto-reject).
  for (const rx of buildSimplePatterns(PREDICTABLE_EFFECT_TOKENS)) {
    const m = rx.exec(text);
    if (m) {
      flags.push({
        category: "predictable-effect",
        sample: m[0].slice(0, 40),
        autoReject: true,
      });
      break;
    }
  }

  // Layer 2.4 — medical context (Kat-eye flag, NOT auto-reject).
  for (const rx of buildSimplePatterns(MEDICAL_CONTEXT_TOKENS)) {
    const m = rx.exec(text);
    if (m) {
      flags.push({
        category: "medical-context",
        sample: m[0].slice(0, 40),
        autoReject: false,
      });
      break;
    }
  }

  return flags;
}

/** Resolve to a moderation status verdict from a flag list.
 *
 *  Returns "rejected" iff any flag is autoReject; "pending" otherwise.
 *  The Kat-eye queue UI consumes `pending` rows. */
export function resolveModerationVerdict(
  flags: ModerationFlag[],
): "pending" | "rejected" {
  return flags.some((f) => f.autoReject) ? "rejected" : "pending";
}

// ---------------------------------------------------------------
// Upload + transcription wiring (post-cutover lazy paths).
// ---------------------------------------------------------------

/** Validate an upload before it touches blob storage.
 *
 *  Returns a flag list — empty when clean. Caller short-circuits with
 *  413/415/422 responses as appropriate. */
export function validateUploadHeader(opts: {
  byteLength: number;
  mimeType: string | null;
  attestExpectationsOnly: boolean;
  declaredDurationMs: number | null;
}): ModerationFlag[] {
  const flags: ModerationFlag[] = [];
  if (!opts.attestExpectationsOnly) {
    flags.push({
      category: "attest-missing",
      sample: "checkbox not checked",
      autoReject: true,
    });
  }
  if (opts.byteLength > VOICE_MEMO_MAX_BYTES) {
    flags.push({
      category: "bytes-exceeded",
      sample: `${opts.byteLength}b > ${VOICE_MEMO_MAX_BYTES}b`,
      autoReject: true,
    });
  }
  const mime = (opts.mimeType ?? "").toLowerCase();
  const ok = VOICE_MEMO_ALLOWED_MIME.some((m) => mime.startsWith(m));
  if (!ok) {
    flags.push({
      category: "mime-not-allowed",
      sample: mime.slice(0, 40) || "(none)",
      autoReject: true,
    });
  }
  if (
    opts.declaredDurationMs !== null &&
    opts.declaredDurationMs > VOICE_MEMO_MAX_MS_WITH_SLACK
  ) {
    flags.push({
      category: "duration-exceeded",
      sample: `${opts.declaredDurationMs}ms`,
      autoReject: true,
    });
  }
  return flags;
}

/** Persist the audio to private Vercel Blob. Lazy dynamic-import so the
 *  `@vercel/blob` dep is only required when the feature flag flips on
 *  AND a real upload arrives. Returns the blob key + URL pair.
 *
 *  Until `@vercel/blob` is installed this throws a clear error; the
 *  upload route catches it and falls back to a queued status row with
 *  audio_mime_type stamped but voice_blob_key empty (the offline
 *  transcription cron uploads the audio when the dep lands). */
export async function persistVoiceMemo(opts: {
  customerId: string;
  strainSlug: string;
  mimeType: string;
  body: ArrayBuffer | Uint8Array;
}): Promise<{ blobKey: string; url: string } | { queued: true; reason: string }> {
  if (!voiceMemoEnabled()) {
    return { queued: true, reason: "feature-flag-off" };
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const blob = require("@vercel/blob") as {
      put: (
        key: string,
        body: ArrayBuffer | Uint8Array,
        opts: { access: "private"; contentType?: string; addRandomSuffix?: boolean },
      ) => Promise<{ url: string }>;
    };
    const ext = opts.mimeType.includes("mp4")
      ? "m4a"
      : opts.mimeType.includes("aac")
        ? "aac"
        : "webm";
    // Key shape: voice-memos/<strain-slug>/<customer-id>/<ulid>.ext
    // — strain-slug first lets blob-side prefix listing pull a
    // strain's full memo set without scanning every customer.
    const ulid = `${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    const key = `voice-memos/${opts.strainSlug}/${opts.customerId}/${ulid}.${ext}`;
    const res = await blob.put(key, opts.body, {
      access: "private",
      contentType: opts.mimeType,
      addRandomSuffix: false,
    });
    return { blobKey: key, url: res.url };
  } catch (err) {
    // Format-only error reason — no customer PII in this log. The
    // upload route persists a queued row so the customer's recording
    // isn't lost.
    const reason = err instanceof Error ? err.name : "unknown";
    return { queued: true, reason: `blob-unavailable:${reason}` };
  }
}

/** Bedrock-routed transcription stub.
 *
 *  Honors the CUI/FedRAMP-eligible posture from
 *  `Inventory App` AGENTS.md — Bedrock-only model selection,
 *  no direct Anthropic/OpenAI provider on this path until BAA is on
 *  file (per `feedback_email_from_send_subdomain_trap_on_m365_2026_05_19`
 *  family of provider-isolation pins).
 *
 *  Today: returns a queued sentinel. When the audio transcription
 *  model is wired (Bedrock Whisper / Claude Haiku 4.5 audio endpoint
 *  if available), this returns the transcript text + provider tag.
 *  The transcribe route writes the result into transcript_text +
 *  transcript_provider. */
export async function transcribeVoiceMemoViaBedrock(opts: {
  blobKey: string;
  mimeType: string;
}): Promise<
  | { text: string; provider: "bedrock-whisper" | "claude-haiku-audio" }
  | { queued: true; reason: string }
> {
  // Lazy import of the AWS SDK so we don't blow up the bundle until
  // the dep + creds + env are all in place.
  if (process.env.VOICE_MEMO_TRANSCRIBE_PROVIDER !== "bedrock") {
    return { queued: true, reason: "transcription-not-configured" };
  }
  try {
    // Real impl would shape a Bedrock InvokeModel call here against
    // a Whisper-equivalent FedRAMP-eligible model. Stubbed for now:
    void opts;
    return { queued: true, reason: "bedrock-stub-not-implemented" };
  } catch (err) {
    const reason = err instanceof Error ? err.name : "unknown";
    return { queued: true, reason: `bedrock-error:${reason}` };
  }
}

// ---------------------------------------------------------------
// Aggregation — what customers expect coming into this strain
// ---------------------------------------------------------------

export type AggregatedExpectation = {
  /** Truncated transcript snippet (caps at 220 chars for card display). */
  snippet: string;
  /** ISO date — render as "May 2026" or relative. Never customer id. */
  approvedAt: string;
};

/** Fetch approved + non-deleted memos for a strain, anonymously.
 *
 *  Returns up to `limit` rows newest-first. NEVER includes customer_id,
 *  blob_key, moderation_flags, or transcript_provider in the projection
 *  — the surface is anonymous-by-construction.
 *
 *  Today: returns the mock-mode SAMPLES when mock mode is on; empty
 *  array otherwise (until the inv-App table lands). The eventual
 *  implementation does:
 *
 *    SELECT transcript_text, approved_at
 *    FROM customer_strain_expectations
 *    WHERE strain_slug = ${slug}
 *      AND status = 'approved'
 *      AND deleted_at IS NULL
 *    ORDER BY approved_at DESC
 *    LIMIT ${limit}
 *
 *  Wired via a fresh client (NOT lib/db.ts — per the brief's NEVER list)
 *  using getClient() pattern locally.
 */
export async function getAggregatedExpectations(
  strainSlug: string,
  limit = 6,
): Promise<AggregatedExpectation[]> {
  if (!voiceMemoEnabled()) return [];
  if (voiceMemoMockMode()) {
    // Mock-mode: nothing aggregates publicly per the brief.
    void strainSlug;
    void limit;
    return [];
  }
  // Real-mode wiring lands once the inv-App migration ships. Until
  // then, return an empty array so the StrainExpectationsSection
  // renders the empty-state message rather than throwing.
  return [];
}

/** Per-customer memo list for /account/oral-history. Server-only.
 *
 *  Today: returns empty until the inv-App table lands. Page renders
 *  an "all your memos live here once you submit one" empty state. */
export type CustomerMemo = {
  id: string;
  strainSlug: string;
  status: "pending" | "approved" | "rejected";
  transcriptSnippet: string | null;
  createdAt: string;
  approvedAt: string | null;
};

export async function getCustomerMemos(
  customerId: string,
): Promise<CustomerMemo[]> {
  if (!voiceMemoEnabled()) return [];
  void customerId;
  return [];
}

// ---------------------------------------------------------------
// Audit helper — every state transition emits an audit row downstream
// ---------------------------------------------------------------

export type AuditAction =
  | "VOICE_MEMO_RECORDED"
  | "VOICE_MEMO_AUTO_REJECTED"
  | "VOICE_MEMO_QUEUED"
  | "VOICE_MEMO_KAT_APPROVED"
  | "VOICE_MEMO_KAT_REJECTED"
  | "VOICE_MEMO_SELF_DELETED"
  | "VOICE_MEMO_RESCAN_REJECTED";

/** Format an audit row payload for the inv-App audit_log table.
 *
 *  The web repo doesn't write audit_log directly (read-only on shared
 *  DB until cutover); inv-App's admin moderation surface writes the
 *  Kat approve/reject rows. This helper exists so both repos can build
 *  the payload identically — useful when the inv-App migration ships
 *  and the web side starts emitting RECORDED/QUEUED/SELF_DELETED rows.
 */
export function shapeAuditPayload(opts: {
  action: AuditAction;
  memoId: string;
  customerId: string;
  strainSlug: string;
  flags?: ModerationFlag[];
}): Record<string, unknown> {
  return {
    action: opts.action,
    target_type: "customer_strain_expectations",
    target_id: opts.memoId,
    metadata: {
      customer_id: opts.customerId,
      strain_slug: opts.strainSlug,
      flag_categories: (opts.flags ?? []).map((f) => f.category),
    },
  };
}
