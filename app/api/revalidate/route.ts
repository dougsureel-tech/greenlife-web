import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";

// Timing-safe secret comparison. Sister of inv-App's `verifyBearer`
// in packages/lib-shared/cron-bearer.ts. Length-mismatch short-circuit
// is fine — length isn't a secret; without it timingSafeEqual throws
// on unequal buffer lengths.
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

// Sister-site revalidation endpoint — paired with TWO inv-App callers:
//
//   1. `/api/cron/publish-scheduled-posts` (Wave 1 Job #1 of
//      PLAN_AUTONOMOUS_CRONS_2026_05_20.md). When an inv-App
//      content_piece flips status='scheduled' → 'published', the cron
//      POSTs here with ?secret=&path=/blog/<slug>&tag=blog-index so
//      Next.js ISR re-renders the /blog/<slug> page + /blog index right
//      away instead of waiting for natural TTL expiry.
//
//   2. `/api/admin/two-bucket/revalidate-cannabis-web` (C6 of the
//      two-bucket inventory rollout, inv-App v426.345). After Doug
//      flips the `two_bucket_inventory` feature flag, this caller fans
//      out POSTs here with ?secret=&path=/menu&tag=menu so the
//      customer-facing menu drops its ISR cache and the new
//      `WHERE stock_zone='floor'` filter becomes visible immediately
//      instead of waiting for the ~5min Vercel-edge TTL.
//
// Auth: TWO accepted env names for rotation tolerance:
//   - `CANNABIS_WEB_REVALIDATE_SECRET` (preferred, takes precedence)
//   - `SISTER_SITE_REVALIDATE_SECRET` (legacy, fallback during rotation)
// Once Doug sets the new name on both Vercel projects, the old name can
// be removed in a follow-up. Both inv-App callers read the new name.
// Mismatch returns 401 — no error detail, no enumeration.
//
// Caller contract:
//   POST /api/revalidate?secret=...&path=/blog/<slug>&tag=blog-index
//   POST /api/revalidate?secret=...&path=/menu&tag=menu
//   POST /api/revalidate?secret=...&tag=menu              (tag-only OK)
//   → 200 {ok: true, revalidated: {path, tag}} on success
//   → 401 {error: "Unauthorized"} on secret mismatch / env unset
//   → 400 {error: "Missing path or tag"} when BOTH absent
//   → 400 {error: "Path not allowed"} when path is outside allowlist
//   → 500 {error: "..."} on revalidate throw
//
// Safe-paths: only paths beginning with "/blog/" or "/menu/" — or equal
// to "/blog" or "/menu" — are honored. Anything else returns 400 —
// prevents a leaked secret from being weaponized into a force-
// revalidate of arbitrary surfaces (e.g. the customer PWA shell or a
// deals page where stale-while-revalidate is a deliberate UX choice).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAllowedPath(path: string): boolean {
  if (path === "/blog" || path === "/menu") return true;
  if (
    (path.startsWith("/blog/") || path.startsWith("/menu/")) &&
    !path.includes("..") &&
    !path.includes("//")
  ) {
    return true;
  }
  return false;
}

async function handle(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  const path = url.searchParams.get("path");
  const tag = url.searchParams.get("tag");

  // Rotation-tolerant secret lookup: new name takes precedence, legacy
  // name accepted as fallback so a rolling rotation across both Vercel
  // projects doesn't break revalidations mid-deploy.
  const expected =
    process.env.CANNABIS_WEB_REVALIDATE_SECRET ??
    process.env.SISTER_SITE_REVALIDATE_SECRET;
  if (!expected || expected.length === 0) {
    // Env not provisioned — refuse rather than allow-all. Returns 401 to
    // match secret-mismatch shape so a probe can't distinguish "not
    // configured" from "wrong secret" via response body.
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!secret || !secretMatches(secret, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Accept tag-only calls (no path) for tag-bucket invalidation. Path-
  // only, tag-only, or BOTH are all valid; only-neither is a 400.
  if (!path && !tag) {
    return NextResponse.json({ error: "Missing path or tag" }, { status: 400 });
  }
  if (path && !isAllowedPath(path)) {
    return NextResponse.json({ error: "Path not allowed" }, { status: 400 });
  }

  try {
    if (path) {
      // Next.js 16: revalidatePath's `type` arg is optional but explicit
      // is clearer. 'page' invalidates the exact path; 'layout' would
      // also invalidate nested routes underneath.
      revalidatePath(path, 'page');
    }
    // Next.js 16: revalidateTag REQUIRES a second 'profile' arg
    // ('default' | 'minutes' | 'hours' | 'days' | CacheLifeConfig).
    // 'default' = standard cache lifetime (~15min revalidate window
    // per Next defaults). Tag-based invalidation triggers immediate
    // refetch on next request regardless of the profile here.
    if (tag) revalidateTag(tag, 'default');
    return NextResponse.json({
      ok: true,
      revalidated: { path: path ?? null, tag: tag ?? null },
    });
  } catch (err) {
    // Don't echo err.message — Next.js cache errors can include internal
    // paths. err.name is enough for triage.
    const errName = err instanceof Error ? err.name : "unknown";
    return NextResponse.json(
      { ok: false, error: `revalidate-failed: ${errName}` },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  return handle(req);
}

// GET path mirrors POST for the same auth + work — supports curl-based
// manual re-trigger by an operator without needing a POST tool.
export async function GET(req: Request) {
  return handle(req);
}
