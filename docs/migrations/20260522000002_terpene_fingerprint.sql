-- Migration 20260522000002 — customer_terpene_profiles table.
--
-- C7 Terpene Fingerprint (PLAN_STRAIN_TREE_INNOVATION_2026_05_21 §C7,
-- Rank 2 of the innovation slate, STRONGEST patent-defensibility piece).
--
-- One row per customer holding their normalized 7-element terpene
-- preference vector (TerpeneVector in lib/terpene-fingerprint.ts). The
-- vector is recomputed by a nightly cron from the receipt-verified
-- purchase corpus + strain-reviews data once Phase 1 lands. Until that
-- foundation ships, the customer-facing /account/terpene-profile page
-- runs in mock-data mode (buildMockFingerprint()) and this table stays
-- empty.
--
-- This file lives in the customer-site repo (NOT the inv-App auto-
-- applied migrations directory) because Doug runs it manually against
-- the shared Neon DB after Phase 1 ships. Phase 1 will likely promote
-- this DDL into the inv-App sequence-numbered migrations folder as
-- 0308_terpene_fingerprint.sql for normal CI application (sister copy
-- of this file already staged in that path for symmetry).
--
-- PATENT-TRACK posture (docs/terpene-fingerprint.md): the terpene_vector
-- column is the persisted artifact of the "per-customer multi-axis
-- terpene-affinity vector" claim element. version_int gives us a clean
-- forward-migration path when TERPENE_AXES changes shape — bump
-- VECTOR_VERSION in lib and the recompute cron upserts the new shape
-- against the partial index below.
--
-- Idempotent — guards everything with IF NOT EXISTS so re-running is
-- safe.

CREATE TABLE IF NOT EXISTS customer_terpene_profiles (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  -- 7-element JSONB array, normalized so components sum to ~1.0.
  -- Axis order matches TERPENE_AXES in lib/terpene-fingerprint.ts:
  --   [Myrcene, Limonene, Caryophyllene, Pinene, Linalool, Humulene, Terpinolene]
  -- Stored as JSONB for forward-compat (adding an 8th axis = bump
  -- version_int + recompute, no schema migration needed).
  terpene_vector JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- VECTOR_VERSION literal from lib/terpene-fingerprint.ts at compute
  -- time. The recompute cron sweeps stale-version rows via the
  -- partial index below.
  version_int INTEGER NOT NULL DEFAULT 1,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Phase-2 mood: the cron will populate `sample_size` so the UI can
  -- show "based on 14 rated strains" honesty signal. Nullable until
  -- review/purchase infra lands.
  sample_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One terpene profile per customer — UNIQUE prevents the recompute cron
-- from inserting duplicate rows on retry. Upsert pattern:
--   INSERT ... ON CONFLICT (customer_id) DO UPDATE SET ...
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'customer_terpene_profiles_customer_unique'
  ) THEN
    ALTER TABLE customer_terpene_profiles
      ADD CONSTRAINT customer_terpene_profiles_customer_unique
      UNIQUE (customer_id);
  END IF;
END $$;

-- Read path: by customer_id (UNIQUE serves this).
-- Sweep path: partial index for the recompute cron — it scans rows whose
-- version is behind the current VECTOR_VERSION OR whose computed_at is
-- older than 7 days. We index version + computed_at to make that scan
-- O(log n).
CREATE INDEX IF NOT EXISTS customer_terpene_profiles_stale_idx
  ON customer_terpene_profiles (version_int, computed_at);
