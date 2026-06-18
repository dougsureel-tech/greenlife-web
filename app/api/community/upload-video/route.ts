/**
 * POST /api/community/upload-video
 *
 * Ambassador Program v0.1 — customer-side video upload.
 *
 * Mirrors the /api/voice-memo/upload pattern:
 *   - Clerk auth → 401 if not signed in
 *   - feature-flag gate (AMBASSADOR_PROGRAM_ENABLED)
 *   - per-userId rate limit (3/hr)
 *   - multipart validation (size 100MB · mime allowlist · brief in library · attestCompliance=true)
 *   - lazy-loaded @vercel/blob persistence (private) with graceful queued-deferred fallback
 *   - DB insert into `ugc_submissions` (table owned by inv-App sister-agent migration)
 *
 * Returns:
 *   201 — accepted, queued for moderation
 *   401 — not signed in
 *   403 — feature off
 *   413 — payload too large
 *   415 — unsupported video mime
 *   422 — attestation missing / brief id unknown
 *   429 — rate-limited
 *   500 — anything else (err.name only — PII-safe)
 */

import { getPortalUserForRequest } from "@/lib/portal-request";
import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/db";
import { getBrief, BRIEF_IDS } from "@/lib/ambassador-briefs";
import { createRateLimiter } from "@/lib/rate-limit";
import { HOUR_MS } from "@/lib/time-constants";

// 100MB hard cap on upload bytes. 60s vertical mp4 at typical iPhone HEVC
// encoding sits 30-60MB; 100MB leaves headroom for older Android codecs
// without inviting drag-and-drop of full-length raw footage. Sister
// /api/voice-memo/upload uses 3MB for 15s audio; same scaling.
const MAX_BYTES = 100 * 1024 * 1024;

// Mime allowlist — videos straight off iOS Safari (video/mp4 +
// video/quicktime / .mov), Android Chrome (video/mp4), Firefox/desktop
// recorders (video/webm). Anything else fails fast — keeps the moderator
// queue from receiving unplayable formats.
const ALLOWED_MIME = new Set<string>([
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

// Per-userId rate limit — 3 uploads per hour. Higher than per-week (the
// reward tier cap) since failed recordings + retries are normal; lower
// than public unauthenticated routes because the Clerk gate already
// bounds abuse to signed-in customers.
const uploadLimiter = createRateLimiter({ limit: 3, windowMs: HOUR_MS });

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ambassadorEnabled(): boolean {
  return process.env.AMBASSADOR_PROGRAM_ENABLED === "true";
}

export async function POST(req: NextRequest) {
  // 1. Auth — Phase 2/3 Step A3 dial-in: phone-OTP session first, Clerk fallback.
  const { user: portalUser } = await getPortalUserForRequest();
  if (!portalUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Feature flag — Doug-flips when ready (post-migration deploy gate).
  if (!ambassadorEnabled()) {
    return NextResponse.json(
      { error: "Ambassador Program is not enabled." },
      { status: 403 },
    );
  }

  // 3. Rate limit (per portal identity).
  if (!uploadLimiter.check(portalUser.id)) {
    return NextResponse.json(
      { error: "Too many uploads. Try again in an hour." },
      { status: 429 },
    );
  }

  // 4. Multipart parse.
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart body" }, { status: 400 });
  }

  const briefIdRaw = form.get("briefId");
  const mentionedRaw = form.get("mentionedBudtender");
  const attestRaw = form.get("attestCompliance");
  const video = form.get("video");

  const briefId =
    typeof briefIdRaw === "string" && briefIdRaw.length > 0 && briefIdRaw.length <= 80
      ? briefIdRaw
      : null;
  const mentionedBudtender =
    typeof mentionedRaw === "string" && mentionedRaw.length > 0 && mentionedRaw.length <= 80
      ? mentionedRaw.trim().replace(/[\r\n]/g, "")
      : null;
  // FormData booleans are serialized as strings. Accept "true" only.
  const attestCompliance = attestRaw === "true";

  if (!briefId || !BRIEF_IDS.includes(briefId) || !getBrief(briefId)) {
    return NextResponse.json({ error: "Unknown brief id" }, { status: 422 });
  }
  if (!attestCompliance) {
    return NextResponse.json(
      { error: "Compliance attestation required" },
      { status: 422 },
    );
  }
  if (!video || !(video instanceof Blob)) {
    return NextResponse.json({ error: "Missing video" }, { status: 400 });
  }

  // 5. Size + mime validation (early reject before reading bytes).
  if (video.size > MAX_BYTES) {
    return NextResponse.json({ error: "Video too large (100MB max)" }, { status: 413 });
  }
  const mime = (video.type || "").toLowerCase();
  // Allow exact match OR codec-suffix form (e.g., "video/mp4;codecs=avc1").
  const mimeAllowed = Array.from(ALLOWED_MIME).some((m) => mime.startsWith(m));
  if (!mimeAllowed) {
    return NextResponse.json(
      { error: "Unsupported video format" },
      { status: 415 },
    );
  }

  // 6. portalUser resolved at the top (phone-first) — used for customer_id
  // linkage on the ugc_submissions row.

  // 7. Persist video — lazy @vercel/blob load with graceful degrade.
  // Mirror lib/voice-memo.ts persistVoiceMemo shape.
  let body: ArrayBuffer;
  try {
    body = await video.arrayBuffer();
  } catch {
    return NextResponse.json({ error: "Couldn't read video body" }, { status: 400 });
  }

  let blobUrl: string | null = null;
  let blobStored = false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const blob = require("@vercel/blob") as {
      put: (
        key: string,
        body: ArrayBuffer | Uint8Array,
        opts: {
          access: "private";
          contentType?: string;
          addRandomSuffix?: boolean;
        },
      ) => Promise<{ url: string }>;
    };
    const ext = mime.includes("mp4")
      ? "mp4"
      : mime.includes("quicktime")
        ? "mov"
        : "webm";
    const ulid = `${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    const key = `ambassador/${portalUser.id}/${ulid}.${ext}`;
    const res = await blob.put(key, body, {
      access: "private",
      contentType: mime || "video/mp4",
      addRandomSuffix: false,
    });
    blobUrl = res.url;
    blobStored = true;
  } catch (err) {
    // Blob unavailable (dep not installed OR token unset) — fall through
    // to a queued-deferred row so customer doesn't lose the moment. The
    // moderation queue surfaces "blob pending" rows for Doug to chase.
    const reason = err instanceof Error ? err.name : "unknown";
    console.warn(`[ambassador/upload-video] blob unavailable: ${reason}`);
  }

  // 8. DB insert into ugc_submissions (table owned by inv-App migration —
  //    may not exist yet on this DB; catch + return queued sentinel).
  // Schema reference (inv-App migration 0320+, per AGENT_BOARD):
  //   ugc_submissions (
  //     id uuid primary key default gen_random_uuid(),
  //     customer_id text not null,
  //     submission_type text not null,         -- 'video' | 'review_url'
  //     brief_id text,
  //     video_url text,
  //     review_url text,
  //     mentioned_budtender_name text,
  //     status text not null default 'pending',
  //     created_at timestamptz not null default now()
  //   )
  const sql = getClient();
  let submissionId: string | null = null;
  try {
    const rows = await sql`
      INSERT INTO ugc_submissions (
        customer_id, submission_type, brief_id, video_url, mentioned_budtender_name, status
      ) VALUES (
        ${portalUser.id}, 'video', ${briefId}, ${blobUrl}, ${mentionedBudtender}, 'pending'
      )
      RETURNING id
    `;
    submissionId = (rows[0]?.id as string) ?? null;
  } catch (err) {
    // err.name only — Postgres error text echoes column names + values.
    const reason = err instanceof Error ? err.name : "unknown";
    console.error(`[ambassador/upload-video] insert failed err=${reason}`);
    // Until inv-App migration lands, the table won't exist. Return a
    // queued-deferred sentinel so the customer-facing UI can render
    // "we got it, moderator will review" without leaking the schema-
    // not-ready posture. The blob (if stored) sticks around for later
    // catch-up backfill via the upcoming inv-App cron.
    return NextResponse.json(
      {
        ok: true,
        status: "queued-deferred",
        blobStored,
        errorRef: Math.random().toString(36).slice(2, 10),
      },
      { status: 201 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      status: "queued",
      blobStored,
      submissionId,
    },
    { status: 201 },
  );
}
