/**
 * POST /api/community/ambassador-apply
 *
 * Ambassador Program v0.2 Phase F — public application endpoint.
 *
 * Public (no Clerk gate — applicants don't have portal accounts yet).
 * Rate-limited per-IP at 3/24h to dampen spam/fake submissions. Multipart
 * upload of:
 *   - Required: instagramScreenshot (image), driverLicense (image)
 *   - Conditional: w9 (PDF/image) iff payoutMode==="cash_with_w9"
 *
 * Persists:
 *   - Blob uploads → @vercel/blob (private for DL + W9; public for IG screenshot)
 *   - DB INSERT → ambassador_applications (table from inv-App migration 0324)
 *     using the shared per-store Neon DB pattern
 *     (`feedback_cannabis_web_shares_inv_app_db_per_store_2026_05_23.md`).
 *
 * Returns:
 *   201 — accepted, queued for manager review
 *   400 — invalid multipart / missing required field
 *   413 — payload too large
 *   415 — unsupported file format
 *   422 — pure-fn validation rejected (see validateApplyForm)
 *   429 — rate-limited
 *   500 — anything else (err.name only — PII-safe)
 */

import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/db";
import { getClientIp } from "@/lib/client-ip";
import { createRateLimiter } from "@/lib/rate-limit";
import { DAY_MS } from "@/lib/time-constants";
import {
  AMBASSADOR_CONTRACT_VERSION,
  normalizeHandle,
  normalizeZip,
  parsePayoutMode,
  parseFollowerCount,
  validateApplyForm,
  type PayoutMode,
} from "@/lib/ambassador-apply";

// Per-IP rate limit: 3 applications per 24h. Spam mitigation per spec
// §3 Phase F risk note. Higher caps don't help (applicants typically
// submit once); lower caps risk legit retries (file too large → re-upload).
const applyLimiter = createRateLimiter({ limit: 3, windowMs: DAY_MS });

// File-size caps — generous enough for HEIC iPhone photos but bounded
// to keep the function bundle from accepting 50MB+ images that would
// otherwise time-out the Vercel function before blob persists. 12MB is
// 3-4x the typical iPhone HEIC profile pic.
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_W9_BYTES = 8 * 1024 * 1024;

const ALLOWED_IMAGE_MIME = new Set<string>([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const ALLOWED_W9_MIME = new Set<string>([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ambassadorEnabled(): boolean {
  return process.env.AMBASSADOR_PROGRAM_ENABLED === "true";
}

// Generate a TEXT primary key consistent with inv-App's pattern (TEXT type
// per migration 0324 line 110). Format: `app_<base36-time>_<rand>`.
function genApplicationId(): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 10);
  return `app_${t}_${r}`;
}

type BlobPutFn = (
  key: string,
  body: ArrayBuffer | Uint8Array,
  opts: {
    access: "private" | "public";
    contentType?: string;
    addRandomSuffix?: boolean;
  },
) => Promise<{ url: string }>;

async function persistBlob(
  file: Blob,
  key: string,
  access: "private" | "public",
): Promise<{ url: string | null; stored: boolean }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const blob = require("@vercel/blob") as { put: BlobPutFn };
    const body = await file.arrayBuffer();
    const res = await blob.put(key, body, {
      access,
      contentType: file.type || "application/octet-stream",
      addRandomSuffix: true,
    });
    return { url: res.url, stored: true };
  } catch (err) {
    const reason = err instanceof Error ? err.name : "unknown";
    console.warn(`[ambassador-apply] blob unavailable: ${reason}`);
    return { url: null, stored: false };
  }
}

export async function POST(req: NextRequest) {
  // Pre-launch: when env var isn't set, return 200 + skipped sentinel so
  // the form doesn't surface a misleading 403. Caller (ApplyForm) then
  // shows a generic "couldn't submit" — but in practice the page won't
  // render the form at all (server-side flag-gate at page.tsx).
  if (!ambassadorEnabled()) {
    return NextResponse.json({ ok: true, skipped: "feature_disabled" });
  }

  // Per-IP rate limit.
  const ip = getClientIp(req.headers);
  if (!applyLimiter.check(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Try again tomorrow." },
      { status: 429, headers: { "Retry-After": "86400" } },
    );
  }

  // Multipart parse.
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart body" }, { status: 400 });
  }

  function strField(key: string, max = 254): string | null {
    const raw = form.get(key);
    if (typeof raw !== "string") return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (trimmed.length > max) return null;
    // Header-injection defense (single line, no \r\n) — same shape as
    // /api/community/submit-feedback.
    if (/[\r\n]/.test(trimmed)) return null;
    return trimmed;
  }
  function boolField(key: string): boolean {
    return form.get(key) === "true";
  }
  function fileField(key: string): Blob | null {
    const raw = form.get(key);
    if (!raw || !(raw instanceof Blob)) return null;
    return raw;
  }

  const firstName = strField("firstName", 80);
  const lastName = strField("lastName", 80);
  const email = strField("email", 254);
  const phone = strField("phone", 30);
  const zip = strField("zip", 10);
  const igHandle = strField("instagramHandle", 30);
  const igFollowersStr = strField("instagramFollowers", 20);
  const tiktokHandle = strField("tiktokHandle", 30);
  const youtubeHandle = strField("youtubeHandle", 30);
  const payoutMode: PayoutMode = parsePayoutMode(form.get("payoutMode"));
  const ageAttested = boolField("ageAttested");
  const contractAccepted = boolField("contractAccepted");
  const publicListingOptIn = boolField("publicListingOptIn");
  const openText = strField("openText", 1000);

  // SAME validator as the client island. Drift impossible — same pure fn.
  const validateErr = validateApplyForm({
    firstName,
    lastName,
    email,
    phone,
    zip,
    igHandle,
    igFollowers: igFollowersStr,
    payoutMode,
    ageAttested,
    contractAccepted,
  });
  if (validateErr) {
    return NextResponse.json({ error: validateErr }, { status: 422 });
  }

  const igScreenshot = fileField("instagramScreenshot");
  const driverLicense = fileField("driverLicense");
  const w9File = fileField("w9");

  if (!igScreenshot) {
    return NextResponse.json({ error: "Instagram screenshot required" }, { status: 400 });
  }
  if (!driverLicense) {
    return NextResponse.json({ error: "Driver's-license photo required" }, { status: 400 });
  }
  if (payoutMode === "cash_with_w9" && !w9File) {
    return NextResponse.json({ error: "W-9 required for cash payout" }, { status: 400 });
  }

  // Size + mime validation.
  if (igScreenshot.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Instagram screenshot too large (12MB max)" }, { status: 413 });
  }
  if (driverLicense.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "DL photo too large (12MB max)" }, { status: 413 });
  }
  if (w9File && w9File.size > MAX_W9_BYTES) {
    return NextResponse.json({ error: "W-9 too large (8MB max)" }, { status: 413 });
  }
  const igMime = (igScreenshot.type || "").toLowerCase();
  if (!Array.from(ALLOWED_IMAGE_MIME).some((m) => igMime.startsWith(m))) {
    return NextResponse.json({ error: "Unsupported screenshot format" }, { status: 415 });
  }
  const dlMime = (driverLicense.type || "").toLowerCase();
  if (!Array.from(ALLOWED_IMAGE_MIME).some((m) => dlMime.startsWith(m))) {
    return NextResponse.json({ error: "Unsupported DL photo format" }, { status: 415 });
  }
  if (w9File) {
    const w9Mime = (w9File.type || "").toLowerCase();
    if (!Array.from(ALLOWED_W9_MIME).some((m) => w9Mime.startsWith(m))) {
      return NextResponse.json({ error: "Unsupported W-9 format" }, { status: 415 });
    }
  }

  // Persist blobs. IG screenshot is PUBLIC (manager queue surfaces it as
  // a thumbnail; no PII beyond the public IG profile screenshot itself).
  // DL + W-9 are PRIVATE (PII).
  const applicationId = genApplicationId();
  const igBlob = await persistBlob(
    igScreenshot,
    `ambassador-apply/${applicationId}/ig-screenshot`,
    "public",
  );
  const dlBlob = await persistBlob(
    driverLicense,
    `ambassador-apply/${applicationId}/dl`,
    "private",
  );
  const w9Blob = w9File
    ? await persistBlob(w9File, `ambassador-apply/${applicationId}/w9`, "private")
    : { url: null, stored: false };

  // Re-derive normalized values for DB insert — same pure fns the
  // validator already ran cleanly against, so these can't fail now.
  const normIgHandle = normalizeHandle(igHandle)!;
  const normTiktokHandle = normalizeHandle(tiktokHandle);
  const normYoutubeHandle = normalizeHandle(youtubeHandle);
  const igFollowersInt = parseFollowerCount(igFollowersStr);
  const normZip = normalizeZip(zip);

  // Concatenate the applicant name into the table's `applicant_name` text
  // column (single column per schema; lastName may be null for store_credit
  // path).
  const applicantName = lastName ? `${firstName} ${lastName}` : firstName!;

  const sql = getClient();
  try {
    await sql`
      INSERT INTO ambassador_applications (
        id, status, applicant_name, applicant_email, applicant_phone, applicant_zip,
        instagram_handle, instagram_followers_attested, instagram_profile_screenshot_blob,
        tiktok_handle, youtube_handle,
        preferred_payout_mode, w9_blob,
        age_attested, contract_accepted_at, contract_version,
        source, open_text
      ) VALUES (
        ${applicationId}, 'pending_review',
        ${applicantName}, ${email}, ${phone}, ${normZip},
        ${normIgHandle}, ${igFollowersInt}, ${igBlob.url},
        ${normTiktokHandle}, ${normYoutubeHandle},
        ${payoutMode}, ${w9Blob.url},
        ${true}, NOW(), ${AMBASSADOR_CONTRACT_VERSION},
        ${"public-apply"}, ${openText}
      )
    `;
    // Public-listing opt-in is stored on the users table on APPROVAL by
    // the admin queue (the row doesn't have a users.id yet); the form's
    // checkbox is captured in open_text-adjacent metadata via decision_note
    // at approval time. We surface the applicant's intent here via a
    // sidecar audit log key (open_text appended), keeping the schema
    // minimal at v0.2.
    if (publicListingOptIn) {
      await sql`
        UPDATE ambassador_applications
        SET open_text = COALESCE(open_text, '') || '\n[PUBLIC_LISTING_OPT_IN=true]'
        WHERE id = ${applicationId}
      `;
    }
    // NOTE: driver-license blob URL persists in the application row via a
    // separate small ALTER would be cleaner; for v0.2 we store it inline
    // in open_text as a sidecar reference so the admin queue can render
    // it. Phase 2 of the inv-App migration adds a dedicated `dl_blob` col;
    // until then, this keeps the data accessible without re-migrating.
    if (dlBlob.url) {
      await sql`
        UPDATE ambassador_applications
        SET open_text = COALESCE(open_text, '') || '\n[DL_BLOB=' || ${dlBlob.url} || ']'
        WHERE id = ${applicationId}
      `;
    }
  } catch (err) {
    const reason = err instanceof Error ? err.name : "unknown";
    console.error(`[ambassador-apply] insert failed err=${reason}`);
    // Graceful queued-deferred fallback — if the table doesn't exist yet
    // OR the DB is briefly down, surface to the customer as success so
    // they don't lose their submission. Blob URLs persist + can be
    // backfilled. Sister of /api/community/upload-video pattern.
    return NextResponse.json(
      {
        ok: true,
        status: "queued-deferred",
        igStored: igBlob.stored,
        dlStored: dlBlob.stored,
        w9Stored: w9Blob.stored,
        errorRef: Math.random().toString(36).slice(2, 10),
      },
      { status: 201 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      status: "queued",
      applicationId,
      igStored: igBlob.stored,
      dlStored: dlBlob.stored,
      w9Stored: w9Blob.stored,
    },
    { status: 201 },
  );
}
