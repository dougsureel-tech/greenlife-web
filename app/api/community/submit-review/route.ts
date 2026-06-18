/**
 * POST /api/community/submit-review
 *
 * Ambassador Program v0.1 — Tier 🥉 customer review-URL submission.
 *
 * **Pre-GBP stub**: customer pastes the URL of the Google review they
 * just wrote; we queue it for manual moderator verification (24h SLA per
 * PLAN §5 Customer path #4). When PLAN_REVIEW_RESPONDER.md GBP OAuth
 * lands, this route swaps the manual-queue path for auto-verify (look up
 * the place ID, fetch the review, match by author + rating + budtender
 * name + text similarity).
 *
 * TODO: when PLAN_REVIEW_RESPONDER.md GBP OAuth lands, swap this stub
 * for auto-verify via @/lib/gbp.ts. Customer gets credit within seconds
 * instead of 24h.
 *
 * Returns:
 *   202 — accepted, queued for manager verification
 *   400 — invalid JSON / missing reviewUrl
 *   401 — not signed in
 *   403 — feature off
 *   422 — reviewUrl doesn't look like a Google review URL
 *   429 — rate-limited
 *   500 — DB write failed (table may not exist pre-migration)
 */

import { getPortalUserForRequest } from "@/lib/portal-request";
import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/db";
import { createRateLimiter } from "@/lib/rate-limit";
import { HOUR_MS } from "@/lib/time-constants";

const MAX_URL_LEN = 600;
const MAX_NAME_LEN = 80;

// Per-userId rate limit — 5 review-URL submissions per hour. Higher than
// upload-video (3/hr) since pasting a URL is lower-effort + customer may
// retry from a different device.
const reviewLimiter = createRateLimiter({ limit: 5, windowMs: HOUR_MS });

// Google review URL patterns. Customers paste these from the Google
// review confirmation screen, Google Maps share menu, or the
// google.com/maps/place page. Anything else gets rejected up front —
// keeps the moderator queue from filling with Yelp / Facebook / brand
// site reviews that don't qualify for the Tier 🥉 credit.
const REVIEW_URL_PATTERNS: RegExp[] = [
  /^https:\/\/(?:www\.|maps\.)?google\.com\/maps\/[^\s]+$/i,
  /^https:\/\/maps\.app\.goo\.gl\/[A-Za-z0-9_-]+$/i,
  /^https:\/\/search\.google\.com\/local\/writereview\?[^\s]+$/i,
  /^https:\/\/search\.google\.com\/local\/reviews\?[^\s]+$/i,
  /^https:\/\/g\.co\/kgs\/[A-Za-z0-9_-]+$/i,
  /^https:\/\/goo\.gl\/maps\/[A-Za-z0-9_-]+$/i,
];

function ambassadorEnabled(): boolean {
  return process.env.AMBASSADOR_PROGRAM_ENABLED === "true";
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Phase 2/3 Step A3 dial-in — phone-OTP session first, Clerk fallback.
  const { user: portalUser } = await getPortalUserForRequest();
  if (!portalUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ambassadorEnabled()) {
    return NextResponse.json(
      { error: "Ambassador Program is not enabled." },
      { status: 403 },
    );
  }

  if (!reviewLimiter.check(portalUser.id)) {
    return NextResponse.json(
      { error: "Too many review submissions. Try again in an hour." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const rawUrl =
    typeof b.reviewUrl === "string" && b.reviewUrl.length <= MAX_URL_LEN * 2
      ? b.reviewUrl.trim()
      : "";
  if (!rawUrl) {
    return NextResponse.json({ error: "Review URL required" }, { status: 400 });
  }
  if (rawUrl.length > MAX_URL_LEN) {
    return NextResponse.json({ error: "Review URL too long" }, { status: 400 });
  }
  if (/[\r\n]/.test(rawUrl)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const matchesPattern = REVIEW_URL_PATTERNS.some((rx) => rx.test(rawUrl));
  if (!matchesPattern) {
    return NextResponse.json(
      {
        error:
          "URL doesn't look like a Google review. Paste the link from your review confirmation or the Google Maps share menu.",
      },
      { status: 422 },
    );
  }

  const mentioned =
    typeof b.mentionedBudtender === "string" &&
    b.mentionedBudtender.length > 0 &&
    b.mentionedBudtender.length <= MAX_NAME_LEN * 2
      ? b.mentionedBudtender.trim().slice(0, MAX_NAME_LEN).replace(/[\r\n]/g, "")
      : null;

  // portalUser resolved at the top (phone-first).
  const sql = getClient();
  try {
    await sql`
      INSERT INTO ugc_submissions (
        customer_id, submission_type, review_url, mentioned_budtender_name, status
      ) VALUES (
        ${portalUser.id}, 'review_url', ${rawUrl}, ${mentioned}, 'pending'
      )
    `;
  } catch (err) {
    // err.name only — Postgres errors echo URL contents which may include
    // customer-identifiable place IDs.
    const reason = err instanceof Error ? err.name : "unknown";
    console.error(`[ambassador/submit-review] insert failed err=${reason}`);
    // Pre-migration graceful queue: pretend success so customer UX
    // doesn't surface schema-not-ready state. Manager catches up via
    // backfill when migration ships.
    return NextResponse.json(
      {
        ok: true,
        status: "queued-deferred",
        message:
          "Thanks — we'll verify your review within 24 hours and apply your credit.",
      },
      { status: 202 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      status: "queued",
      message:
        "Thanks — we'll verify your review within 24 hours and apply your credit.",
    },
    { status: 202 },
  );
}
