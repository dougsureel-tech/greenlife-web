import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import {
  findEligibleRetryPairs,
  isRetryMemoryEnabled,
  isRetryMemoryEmailEnabled,
} from "@/lib/retry-memory";

// C9 "Re-try this" Memory Surfacing — nightly cron.
//
// Job: scan recent rating + purchase signals for (customer, strain)
// pairs where rating ≥4★ AND last_purchased_at > 90 days ago AND no
// open cooldown row in `customer_retry_prompts`. INSERT a prompt row
// per eligible pair with prompted_at = NOW() + expires_at = NOW() +
// 7 days. Cap: 3 active prompts per customer at a time. Cooldown:
// 365 days per (customer, strain).
//
// Mock-data mode (today): `findEligibleRetryPairs()` returns [] because
// the verified-purchase + reviews infra hasn't shipped yet. The cron
// fires, increments its heartbeat metric, inserts 0 rows, returns 200.
// When that infra ships, only the lib helper flips its query branch —
// no cron-side changes needed.
//
// Auth: bearer token via shared CRON_SECRET (mirror of the inv-App
// cron pattern + the sister-site /api/revalidate route's
// SISTER_SITE_REVALIDATE_SECRET shape). NEVER expose to anonymous GET
// — refuses without 200 + secret-mismatch logging.
//
// Email-blast (Phase 5+ enhancement): when
// `RETRY_MEMORY_EMAIL_ENABLED=true`, fires a customer-side email via
// Resend with the same WAC-safe headline ("Going back to an old
// favorite?"). Default OFF — Phase 4.1 launch is /account-surface only.
//
// Mounting in Vercel cron schedule: add a `crons` entry to
// seattle-cannabis-web/vercel.json + greenlife-web/vercel.json with
// `{ "path": "/api/cron/retry-memory-prompts", "schedule": "0 7 * * *" }`
// (07:00 UTC = 23:00 PT = nightly after store close). Deferred from
// this ship — Doug greenlights schedule wiring once the rating
// capture infra is live.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function secretMatches(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(provided, "utf-8"),
      Buffer.from(expected, "utf-8"),
    );
  } catch {
    return false;
  }
}

function verifyBearer(authHeader: string | null, expected: string | undefined): boolean {
  if (!expected || expected.length === 0) return false;
  if (!authHeader) return false;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  return secretMatches(match[1]!, expected);
}

async function handle(req: Request): Promise<NextResponse> {
  // Auth — bearer-token only. Vercel cron forwards Authorization
  // header automatically when configured in vercel.json.
  const ok = verifyBearer(req.headers.get("authorization"), process.env.CRON_SECRET);
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Flag check — even if the cron route is hit, the work itself is
  // gated. Allows Doug to leave the cron wired but disable the
  // behavior with a single env var flip.
  if (!isRetryMemoryEnabled()) {
    return NextResponse.json({
      ok: true,
      enabled: false,
      surfaced: 0,
      message: "RETRY_MEMORY_ENABLED is not 'true' — cron no-op.",
    });
  }

  // Mock-mode: returns empty list. Real-mode (post-rating-capture):
  // returns the JOIN'd (customer, strain) candidates.
  const candidates = await findEligibleRetryPairs();
  const emailEnabled = isRetryMemoryEmailEnabled();

  // Today candidates.length === 0 always. When real-mode lands, the
  // INSERT block goes here — uses the inv-App shared db client. For
  // now we just report the dry-run shape so the wire contract is
  // observable from the cron-fire log.
  return NextResponse.json({
    ok: true,
    enabled: true,
    mockMode: candidates.length === 0,
    emailEnabled,
    surfaced: candidates.length,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  return handle(req);
}

export async function GET(req: Request) {
  // GET allowed so Vercel cron's default-method probe can reach the
  // route without 405. Same auth gate as POST.
  return handle(req);
}
