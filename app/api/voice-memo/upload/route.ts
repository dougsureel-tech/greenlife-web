/**
 * POST /api/voice-memo/upload
 *
 * Customer-authed upload route for C11 voice-memo recordings. Owns:
 *   - Clerk authN + portal-user resolution
 *   - feature-flag + mock-mode gate
 *   - per-customer rate limit
 *   - multipart audio validation (size + mime + duration cap)
 *   - blob persistence (private @vercel/blob) — lazy-loaded
 *   - row insert (queued for inv-App migration to land)
 *   - kicks off transcription via /api/voice-memo/transcribe
 *
 * Returns:
 *   201 — accepted, queued for moderation
 *   401 — not signed in
 *   403 — feature off / not eligible (mock-mode wrong strain)
 *   413 — payload too large
 *   415 — unsupported audio mime
 *   422 — attestation missing OR algorithmic moderation auto-rejected
 *         (we DON'T tell the client WHICH category tripped — Layer 2
 *         anti-gaming per the moderation doc)
 *   429 — rate-limited
 *   500 — anything else
 */

import { NextRequest, NextResponse } from "next/server";
import { getPortalUserForRequest } from "@/lib/portal-request";
import {
  voiceMemoEnabled,
  canRecordForStrain,
  validateUploadHeader,
  persistVoiceMemo,
  VOICE_MEMO_MAX_BYTES,
} from "@/lib/voice-memo";
import { createRateLimiter } from "@/lib/rate-limit";
import { MINUTE_MS } from "@/lib/time-constants";

// Per-customer rate limit — 3 uploads per 10 minutes. Higher than
// "1 per memo" since failed recordings + retries are normal; lower than
// public unauthenticated routes because the customer ID gate already
// bounds abuse. Per the memory pin
// `feedback_audit_pass2_knockout_arc_2026_05_19`: per-userId beats
// per-IP on shared-NAT cellular networks.
const uploadLimiter = createRateLimiter({ limit: 3, windowMs: 10 * MINUTE_MS });

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // -----------------------------------------------------------------
  // 1. Auth — Phase 2/3 Step A3 dial-in: phone-OTP session first, Clerk
  // fallback. Closes the view-but-can't-record gap (the /account/oral-history
  // PAGE resolves by phone, so this companion WRITE must too).
  // -----------------------------------------------------------------
  const { user: portalUser } = await getPortalUserForRequest();
  if (!portalUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // -----------------------------------------------------------------
  // 2. Feature flag
  // -----------------------------------------------------------------
  if (!voiceMemoEnabled()) {
    return NextResponse.json(
      { error: "Voice memo feature is not enabled." },
      { status: 403 },
    );
  }

  // -----------------------------------------------------------------
  // 3. Rate limit (per-userId)
  // -----------------------------------------------------------------
  if (!uploadLimiter.check(portalUser.id)) {
    return NextResponse.json(
      { error: "Too many uploads. Try again in a few minutes." },
      { status: 429 },
    );
  }

  // -----------------------------------------------------------------
  // 4. Multipart parse
  // -----------------------------------------------------------------
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart body" }, { status: 400 });
  }

  const strainSlugRaw = form.get("strainSlug");
  const durationRaw = form.get("durationMs");
  const attestRaw = form.get("attestExpectationsOnly");
  const audio = form.get("audio");

  const strainSlug =
    typeof strainSlugRaw === "string" && strainSlugRaw.length > 0 && strainSlugRaw.length <= 80
      ? strainSlugRaw.toLowerCase().replace(/[^a-z0-9-]/g, "")
      : null;
  const durationMs =
    typeof durationRaw === "string" && /^\d{1,6}$/.test(durationRaw)
      ? parseInt(durationRaw, 10)
      : null;
  const attestExpectationsOnly = attestRaw === "true";

  if (!strainSlug) {
    return NextResponse.json({ error: "Missing strainSlug" }, { status: 400 });
  }
  if (!audio || !(audio instanceof Blob)) {
    return NextResponse.json({ error: "Missing audio" }, { status: 400 });
  }

  // -----------------------------------------------------------------
  // 5. Eligibility (feature flag + mock-mode + strain match)
  // -----------------------------------------------------------------
  if (!canRecordForStrain(strainSlug)) {
    return NextResponse.json(
      { error: "Not eligible to record on this strain yet." },
      { status: 403 },
    );
  }

  // -----------------------------------------------------------------
  // 6. Header validation (size + mime + duration + attest)
  // -----------------------------------------------------------------
  // Size — early reject before reading bytes into memory.
  if (audio.size > VOICE_MEMO_MAX_BYTES) {
    return NextResponse.json(
      { error: "Audio file too large" },
      { status: 413 },
    );
  }
  const headerFlags = validateUploadHeader({
    byteLength: audio.size,
    mimeType: audio.type,
    attestExpectationsOnly,
    declaredDurationMs: durationMs,
  });
  if (headerFlags.length > 0) {
    // Determine the most informative HTTP code.
    if (headerFlags.some((f) => f.category === "attest-missing")) {
      return NextResponse.json({ error: "Attestation required" }, { status: 422 });
    }
    if (headerFlags.some((f) => f.category === "mime-not-allowed")) {
      return NextResponse.json({ error: "Unsupported audio format" }, { status: 415 });
    }
    if (headerFlags.some((f) => f.category === "bytes-exceeded")) {
      return NextResponse.json({ error: "Audio file too large" }, { status: 413 });
    }
    if (headerFlags.some((f) => f.category === "duration-exceeded")) {
      return NextResponse.json({ error: "Recording exceeds 15-second cap" }, { status: 422 });
    }
    return NextResponse.json({ error: "Invalid upload" }, { status: 422 });
  }

  // -----------------------------------------------------------------
  // 7. Portal user already resolved at step 1 (phone-first) — used below
  // for customer_id linkage on the memo row.
  // -----------------------------------------------------------------

  // -----------------------------------------------------------------
  // 8. Persist audio (lazy blob — handles dep-not-installed)
  // -----------------------------------------------------------------
  let body: ArrayBuffer;
  try {
    body = await audio.arrayBuffer();
  } catch {
    return NextResponse.json({ error: "Couldn't read audio body" }, { status: 400 });
  }
  const persisted = await persistVoiceMemo({
    customerId: portalUser.id,
    strainSlug,
    mimeType: audio.type || "audio/webm",
    body,
  });

  // -----------------------------------------------------------------
  // 9. Best-effort transcription kick (post-cutover — currently stubs).
  // -----------------------------------------------------------------
  // Until the inv-App migration lands, we don't INSERT a row directly
  // from the web repo. Once the table lands, this is where the row
  // insert happens and where /api/voice-memo/transcribe is fanned out.
  //
  // For now, return a stable 201 + queued sentinel so the client island
  // can render its "queued for review" empty state. Format-only log
  // (no PII — only userId + strainSlug + ms).
  console.log(
    `[voice-memo] queued ${
      "queued" in persisted ? "(blob-deferred)" : "(blob-stored)"
    } strain=${strainSlug} dur=${durationMs ?? "?"}ms`,
  );

  return NextResponse.json(
    {
      ok: true,
      status: "queued",
      blobStored: !("queued" in persisted),
    },
    { status: 201 },
  );
}
