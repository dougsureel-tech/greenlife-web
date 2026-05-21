-- Voice memo / oral history — pre-purchase EXPECTATION capture per C11
-- of /CODE/Green Life/PLAN_STRAIN_TREE_INNOVATION_2026_05_21.md.
--
-- Schema doc — the real inv-App migration lands at the next available
-- slot after 0309 (C2 sibling claimed 0309; coordination note on
-- /CODE/Green Life/AGENT_BOARD.md). When verified-purchase wiring
-- ships post-cutover, copy this file into
-- `Inventory App/packages/db/migrations/<NNNN>_voice_memo.sql` with
-- the next sequential prefix and apply.
--
-- The brief's spec timestamp `2026052200000<NN>` doesn't match inv-App's
-- 4-digit sequential convention; keeping schema-as-doc here AND in the
-- glw sister-port so the contract is grep-able from both web repos
-- without colliding with parallel sessions that own 0308 + 0309.
--
-- Three customer-facing repos (scc + glw + inv-App admin) all read the
-- same `customer_strain_expectations` table once it lands. Web repos
-- only INSERT (customer recording) + SELECT (own memos + aggregated).
-- inv-App owns admin moderation surfaces.

-- ---------------------------------------------------------------
-- Table: customer_strain_expectations
-- ---------------------------------------------------------------
-- One row per voice memo submission. Customer can submit multiple
-- memos per strain (e.g. first-time purchase + follow-up curiosity).
-- Audit row in `audit_log` per insert / approve / reject / delete.

CREATE TABLE IF NOT EXISTS customer_strain_expectations (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id           UUID         NOT NULL,
  strain_slug           TEXT         NOT NULL,
  voice_blob_key        TEXT         NOT NULL,
  transcript_text       TEXT,
  transcript_provider   TEXT         NOT NULL DEFAULT 'queued',
  -- status enum mirrors C11 spec:
  --   pending   = transcript clean per regex, awaiting Kat-eye review
  --   approved  = Kat approved, eligible for public aggregation
  --   rejected  = either auto-rejected by regex OR Kat rejected OR self-deleted
  status                TEXT         NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  -- jsonb of which moderation categories flagged + reviewer notes
  moderation_flags      JSONB        NOT NULL DEFAULT '{}'::jsonb,
  -- recorded duration in milliseconds; ffprobe (or server-side
  -- container probe) hard-caps at 15500 (15s + slack for end-of-clip
  -- frame). Anything above this fails server-side validation.
  duration_ms           INTEGER,
  -- audio MIME type as reported by the browser MediaRecorder
  -- (audio/webm;codecs=opus most common; audio/mp4 on Safari).
  audio_mime_type       TEXT,
  -- Customer attestation: they checked the "I'll talk about what I'm
  -- HOPING for, not what I expect it to do for me" checkbox at record
  -- time. The upload route rejects when this is not literally TRUE.
  attest_expectations_only BOOLEAN  NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
  approved_at           TIMESTAMPTZ,
  rejected_at           TIMESTAMPTZ,
  -- nullable so existing approved memos can be soft-deleted without
  -- losing their approval timestamp
  deleted_at            TIMESTAMPTZ,
  -- Optional FK once portal_users table is canonical in inv-App. Web
  -- repos query via portal_users.id → customer_id mapping.
  CONSTRAINT customer_strain_expectations_blob_key_unique
    UNIQUE (voice_blob_key)
);

-- Per-customer + strain lookup (for "your memos for this strain")
CREATE INDEX IF NOT EXISTS idx_cse_customer_strain
  ON customer_strain_expectations (customer_id, strain_slug, created_at DESC);

-- Aggregation lookup (public surface — "what customers expect coming
-- into this strain"). Filters by strain_slug + status='approved' +
-- deleted_at IS NULL.
CREATE INDEX IF NOT EXISTS idx_cse_aggregation
  ON customer_strain_expectations (strain_slug, status, deleted_at)
  WHERE status = 'approved' AND deleted_at IS NULL;

-- Kat-eye queue (pending review).
CREATE INDEX IF NOT EXISTS idx_cse_pending_queue
  ON customer_strain_expectations (created_at)
  WHERE status = 'pending' AND deleted_at IS NULL;

-- Nightly re-scan cron walks approved rows; index supports the date
-- range scan it uses.
CREATE INDEX IF NOT EXISTS idx_cse_approved_scan
  ON customer_strain_expectations (approved_at)
  WHERE status = 'approved' AND deleted_at IS NULL;

-- ---------------------------------------------------------------
-- Comments
-- ---------------------------------------------------------------
COMMENT ON TABLE customer_strain_expectations IS
  'C11 voice-memo oral history — WAC-safe pre-purchase expectation capture, three-layer moderation (checkbox + regex + Kat-eye), anonymous aggregation surface on strain pages.';
COMMENT ON COLUMN customer_strain_expectations.attest_expectations_only IS
  'Layer 1 of WAC moderation — customer checkbox at record time. Server-side double-check at upload.';
COMMENT ON COLUMN customer_strain_expectations.moderation_flags IS
  'jsonb — categories that tripped the algorithmic regex pass (Layer 2) + Kat-reviewer notes (Layer 3) + self-delete markers.';
COMMENT ON COLUMN customer_strain_expectations.transcript_provider IS
  'queued | bedrock-whisper | claude-haiku-audio | manual — the source of transcript_text. Empty audio submissions stay queued until the offline transcription cron picks them up.';
