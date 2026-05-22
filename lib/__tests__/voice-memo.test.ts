// Pin tests for lib/voice-memo.ts via fs.readFileSync source-assertion
// (server-only barrier prevents module-load — same pattern as
// email.test.ts + email-templates.test.ts).
//
// This is C11 of /CODE/Green Life/PLAN_STRAIN_TREE_INNOVATION_2026_05_21.md:
// 15-second customer voice-memos capturing HOPE (not effect-claim) before
// trying a strain. WAC 314-55-155 safety BY CONSTRUCTION via prompt +
// three-layer moderation. Compliance-load-bearing — drift in any of these
// constants or vocabulary opens a real WSLCB risk.
//
// Pin focus:
//   1. Hard-cap constants — duration / size / MIME (drift = compliance
//      exposure on long clips OR overbroad file-type acceptance)
//   2. Customer-facing prompt + Layer-1 attest label (drift = compliance
//      defense weakens; WAC 314-55-155 protection rests on the prompt's
//      "what you hope" vs "what you expect" framing)
//   3. VOICE_MEMO_MOCK_STRAIN_SLUG = "girl-scout-cookies" (the ONLY
//      strain allowed in mock-mode pre-cutover)
//   4. Feature-flag default ("mock-mode" defaults to TRUE — recording
//      only allowed on sample strain until verified-purchase wires in)
//   5. WAC + Layer references stay in header comments (doctrine anti-rot)
//
// Run: pnpm test:all
// Or: node --test --experimental-strip-types --no-warnings lib/__tests__/voice-memo.test.ts

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = join(HERE, "..", "voice-memo.ts");
const SRC = readFileSync(SOURCE_PATH, "utf-8");

// ── Server-only barrier (intentional) ──────────────────────────────

describe("voice-memo.ts — server-only barrier", () => {
  test("imports `server-only` (moderation logic must not leak to client bundle)", () => {
    // Moderation regex + verdict logic shouldn't be inspectable on the
    // client — a determined attacker who could read the regex on the
    // client could craft transcripts that pass Layer 2 + slip into Kat's
    // queue. server-only keeps the algorithm server-side.
    assert.match(SRC, /^import "server-only";/m);
  });
});

// ── Hard-cap constants ──────────────────────────────────────────────

describe("voice-memo.ts — hard-cap constants", () => {
  test("VOICE_MEMO_MAX_MS = 15_000 (hard 15-second duration cap)", () => {
    // Spec: "EXPECTATION capture surface — customers record a 15-second
    // clip about what they HOPE coming into a strain". Drift upward
    // (e.g. 30s) gives customers more rope to say effect claims;
    // downward (e.g. 5s) breaks the "what drew you to it" framing.
    assert.match(SRC, /^export const VOICE_MEMO_MAX_MS\s*=\s*15_000;/m);
  });

  test("VOICE_MEMO_MAX_MS_WITH_SLACK = 15_500 (500ms ffprobe latitude)", () => {
    // Allows for container-frame timing imprecision. Drift would tighten
    // (false-rejects 15.001s clips) or loosen (silent 16s+ clips slip).
    assert.match(SRC, /^export const VOICE_MEMO_MAX_MS_WITH_SLACK\s*=\s*15_500;/m);
  });

  test("VOICE_MEMO_MAX_BYTES = 3 * 1024 * 1024 (3 MiB hard cap)", () => {
    // Drag-and-drop fail-fast — a 30-second WAV would be ~5MB. The cap
    // is intentional file-size defense.
    assert.match(SRC, /^export const VOICE_MEMO_MAX_BYTES\s*=\s*3 \* 1024 \* 1024;/m);
  });
});

// ── Allowed MIME types (MediaRecorder envelope) ─────────────────────

describe("voice-memo.ts — VOICE_MEMO_ALLOWED_MIME", () => {
  test("includes audio/webm (Chrome + Firefox MediaRecorder default)", () => {
    assert.match(SRC, /"audio\/webm"/);
  });

  test("includes audio/webm;codecs=opus (explicit-codec variant some browsers emit)", () => {
    assert.match(SRC, /"audio\/webm;codecs=opus"/);
  });

  test("includes audio/mp4 (Safari MediaRecorder default)", () => {
    assert.match(SRC, /"audio\/mp4"/);
  });

  test("includes audio/mp4;codecs=mp4a.40.2 (Safari with explicit AAC profile)", () => {
    assert.match(SRC, /"audio\/mp4;codecs=mp4a\.40\.2"/);
  });

  test("includes audio/aac (raw AAC fallback)", () => {
    assert.match(SRC, /"audio\/aac"/);
  });

  test("does NOT include audio/wav (uncompressed = oversized = bypasses byte cap intent)", () => {
    // Defensive: if WAV creeps in, a 15-sec clip would routinely
    // exceed VOICE_MEMO_MAX_BYTES and either fail-loud (annoying)
    // or push the byte cap up (drifts the defense).
    assert.doesNotMatch(SRC, /VOICE_MEMO_ALLOWED_MIME[\s\S]{0,200}"audio\/wav"/);
  });

  test("does NOT include video/* (defense against video-upload attempt)", () => {
    // A video MIME accepted would let an attacker upload arbitrary
    // visual content masquerading as a voice memo.
    assert.doesNotMatch(SRC, /VOICE_MEMO_ALLOWED_MIME[\s\S]{0,500}"video\//);
  });

  test("does NOT include wildcard or audio/* (allowlist must be explicit)", () => {
    assert.doesNotMatch(SRC, /VOICE_MEMO_ALLOWED_MIME[\s\S]{0,200}"\*\/\*"/);
    assert.doesNotMatch(SRC, /VOICE_MEMO_ALLOWED_MIME[\s\S]{0,200}"audio\/\*"/);
  });
});

// ── Compliance-load-bearing literals ────────────────────────────────

describe("voice-memo.ts — WAC 314-55-155 compliance literals", () => {
  test("VOICE_MEMO_PROMPT contains 'hoping for' framing (load-bearing — NOT 'what you expect')", () => {
    // The prompt's "hoping for" vs "expecting from" distinction IS
    // the WAC 314-55-155 defense by construction. A customer talking
    // about HOPE is not making an efficacy claim. A customer talking
    // about EFFECT is. Drift in the prompt = WSLCB exposure.
    assert.match(
      SRC,
      /VOICE_MEMO_PROMPT[\s\S]{0,200}hoping for/,
      "prompt must include 'hoping for' framing per WAC defense-by-construction",
    );
  });

  test("VOICE_MEMO_PROMPT contains 'what drew you to it' (process-vocabulary anchor)", () => {
    assert.match(SRC, /what drew you to it/);
  });

  test("VOICE_MEMO_PROMPT contains 'not what you expect it to do' (explicit negation of effect-claim)", () => {
    assert.match(SRC, /not what you expect it to do/);
  });

  test("VOICE_MEMO_PROMPT references '15 seconds' (duration framing visible to customer)", () => {
    assert.match(SRC, /In 15 seconds/);
  });

  test("VOICE_MEMO_ATTEST_LABEL contains 'HOPING' (Layer-1 checkbox repeats the safe framing)", () => {
    // The pre-record checkbox MUST repeat the HOPE framing — a customer
    // checks the box affirming they'll talk about hope, not effect. This
    // is the Layer-1 of the 3-layer moderation defense.
    assert.match(
      SRC,
      /VOICE_MEMO_ATTEST_LABEL[\s\S]{0,200}HOPING/,
      "attest label must include 'HOPING' framing — Layer-1 defense",
    );
  });

  test("VOICE_MEMO_ATTEST_LABEL contains 'not what I expect it to do' (explicit-negation)", () => {
    assert.match(SRC, /not what I expect it to do/);
  });
});

// ── Mock-mode default + sample strain ──────────────────────────────

describe("voice-memo.ts — feature-flag + mock-mode defaults", () => {
  test("VOICE_MEMO_MOCK_STRAIN_SLUG = 'girl-scout-cookies'", () => {
    // The single allowed sample strain during the mock-mode pre-cutover
    // window. Picked because GSC is the founder strain of the cookies
    // family + stable across both stacks. Drift would either allow
    // recording on a strain that ISN'T cross-stack stable (data state
    // inconsistencies) OR break the cookies-family lineage anchor.
    assert.match(SRC, /VOICE_MEMO_MOCK_STRAIN_SLUG\s*=\s*"girl-scout-cookies"/);
  });

  test("voiceMemoEnabled() reads VOICE_MEMO_ENABLED === 'true' (off-by-default)", () => {
    // The feature ships DISABLED. Drift to default-on would mean a
    // ship lands recording capability without explicit Doug-flip.
    assert.match(SRC, /process\.env\.VOICE_MEMO_ENABLED === "true"/);
  });

  test("voiceMemoMockMode() defaults to TRUE (only flips off via explicit 'false')", () => {
    // Code: `process.env.VOICE_MEMO_MOCK_MODE !== "false"`. Drift to
    // `=== "true"` would invert the default — recording would be
    // ALLOWED on every strain immediately if the env-var is unset.
    // Pin the !== "false" shape.
    assert.match(SRC, /process\.env\.VOICE_MEMO_MOCK_MODE !== "false"/);
  });

  test("canRecordForStrain gates by both flag AND mock-mode (chained guard)", () => {
    // The function must check voiceMemoEnabled FIRST (early return) then
    // mock-mode + sample-strain. Drift to a single guard would silently
    // open recording on any strain when only one half is configured.
    assert.match(SRC, /export function canRecordForStrain[\s\S]{0,400}voiceMemoEnabled\(\)/);
    assert.match(SRC, /export function canRecordForStrain[\s\S]{0,400}voiceMemoMockMode\(\)/);
    assert.match(SRC, /export function canRecordForStrain[\s\S]{0,400}VOICE_MEMO_MOCK_STRAIN_SLUG/);
  });
});

// ── Doctrine references (anti-rot pins) ────────────────────────────

describe("voice-memo.ts — doctrine-reference anti-rot pins", () => {
  test("header comment references WAC 314-55-155 (compliance frame)", () => {
    // The WAC reference is WHY this file exists with the constraints it
    // has. If it rots, a future agent might "improve" the prompt to
    // sound friendlier — and accidentally weaken the compliance defense.
    assert.match(SRC, /WAC 314-55-155/);
  });

  test("header references the three-layer moderation pattern", () => {
    // 3-layer defense: pre-record checkbox / regex / Kat-eye queue.
    assert.match(SRC, /three-layer moderation/i);
  });

  test("header names the moderation doc + schema doc paths", () => {
    // These doc refs are the human-facing companion to the code.
    // If renamed, the references must update too. Pin the literals.
    assert.match(SRC, /docs\/voice-memo-moderation\.md/);
    assert.match(SRC, /docs\/voice-memo-schema\.sql/);
  });

  test("header references C11 of the strain-tree innovation plan", () => {
    assert.match(SRC, /C11/);
    assert.match(SRC, /PLAN_STRAIN_TREE_INNOVATION_2026_05_21\.md/);
  });

  test("comment explicitly forbids touching lib/db.ts / lib/strains.ts / app/strains/[slug]/page.tsx", () => {
    // Per the C7+C11 patent-track posture: voice-memo + cousin-finder
    // are NEW-files-only ships. Touching lib/strains.ts or app/strains
    // surfaces would put novel-claim logic INTO files that already exist
    // — which could weaken the patent application's "novel combination"
    // claim. Pin the in-source NEVER-touches assertion.
    assert.match(SRC, /NEVER touches.*lib\/db\.ts/);
    assert.match(SRC, /lib\/strains\.ts/);
    assert.match(SRC, /app\/strains/);
  });
});

// ── Moderation pure-function exports (file-level invariants) ──────

describe("voice-memo.ts — moderation function exports", () => {
  test("exports flagModerationIssues(transcript: string): ModerationFlag[]", () => {
    assert.match(
      SRC,
      /^export function flagModerationIssues\(transcript:\s*string\):\s*ModerationFlag\[\]/m,
    );
  });

  test("exports resolveModerationVerdict for Layer-3 routing decisions", () => {
    assert.match(SRC, /^export function resolveModerationVerdict/m);
  });

  test("exports validateUploadHeader for the upload-route entry gate", () => {
    assert.match(SRC, /^export function validateUploadHeader/m);
  });

  test("exports canRecordForStrain for the page-level + upload-time eligibility gate", () => {
    assert.match(SRC, /^export function canRecordForStrain/m);
  });

  test("exports ModerationFlag type (callers depend on the shape)", () => {
    assert.match(SRC, /^export type ModerationFlag\s*=/m);
  });
});
