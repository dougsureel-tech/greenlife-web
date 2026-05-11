import { NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rate-limit";
import { MINUTE_MS } from "@/lib/time-constants";

// CSP violation report receiver. Browsers POST violation reports here
// when the page hits a directive in the `Content-Security-Policy-Report-
// Only` header (T108). Format per W3C CSP3 spec — the body is a JSON
// document with a `csp-report` key containing fields like `blocked-uri`,
// `violated-directive`, `document-uri`, `referrer`, `effective-
// directive`, `original-policy`, etc.
//
// Why log to console.error: Vercel auto-captures stderr from edge/node
// functions into Runtime Logs (Dashboard → Logs filter by function name).
// Doug can `vercel logs` or open the dashboard to grep for `[csp-violation]`
// during the 1-2 week observation window. This is the lightweight
// observation half of Doug-action #2.
//
// Future enhancement: persist violations to Postgres for a /admin/csp-
// violations dashboard with aggregated counts. Out of scope for T109 —
// the goal is just to capture the firehose so Doug can refine the policy
// before flipping to enforce mode.
//
// Anti-spam: cap log payload at 16KB; some browsers / proxies inject
// extension-fired violations that wouldn't help us tighten the real
// policy. 16KB comfortably fits real-shaped CSP reports (the actionable
// fields — document-uri + violated-directive + blocked-uri — are always
// under 200 chars, but `original-policy` can be ~2KB and complete reports
// occasionally run 6-8KB with long source maps). Oversize payloads are
// dropped (logged with size class so Doug can see the cap firing) rather
// than truncated and "repaired" with appended braces — the prior hack
// produced invalid JSON whenever truncation didn't land at the exact
// right nesting depth, so EVERY oversize report was silently dropped.

export const runtime = "edge";

// Don't cache — we want every report. Vercel's default for /api routes
// is no-store, so this is paranoid-explicit.
export const dynamic = "force-dynamic";

type CspReportBody = {
  "csp-report"?: {
    "document-uri"?: string;
    "violated-directive"?: string;
    "effective-directive"?: string;
    "blocked-uri"?: string;
    "source-file"?: string;
    "line-number"?: number;
    "column-number"?: number;
    referrer?: string;
    "original-policy"?: string;
  };
};

const MAX_REPORT_BYTES = 16 * 1024;

// Per-IP rate-limit. 60/min/IP is well above legitimate browser CSP-violation
// volume but tight enough to throttle log-spam DoS via hostile CSP-headered
// iframes. Sister of inv v397.525 + scc v22.605.
const limiter = createRateLimiter({ limit: 60, windowMs: MINUTE_MS });

export async function POST(request: Request): Promise<Response> {
  // Rate-limit BEFORE the body read — body parsing on attacker traffic is
  // the exact cost we're protecting against.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!limiter.check(ip)) {
    return new NextResponse(null, {
      status: 429,
      headers: { "Retry-After": "60" },
    });
  }
  const text = await request.text();
  if (text.length > MAX_REPORT_BYTES) {
    // Don't attempt to repair truncated JSON — the prior implementation
    // appended `}}` after slicing to 4KB which only produced valid JSON
    // when truncation happened to land at the exact right nesting depth.
    // Drop with a size-class log so the firehose-observation window can
    // see if the cap is firing in practice.
    console.error(`[csp-violation] oversized payload dropped, size=${text.length}`);
    return new NextResponse(null, { status: 204 });
  }
  let body: CspReportBody | null = null;
  try {
    body = JSON.parse(text);
  } catch {
    // Malformed body — drop silently. Browsers occasionally POST
    // non-CSP-shaped reports (extensions, prefetch errors). Logging the
    // parse failure would just be noise.
    return new NextResponse(null, { status: 204 });
  }

  const r = body?.["csp-report"];
  if (!r) return new NextResponse(null, { status: 204 });

  // Format-only log — no PII concerns since the fields are URL/directive
  // strings (no body content). Document-URI may carry query params; if
  // patient/customer routes ever flow through CSP-RO, we'd need to scrub.
  // Currently glw + scc are marketing sites with no PII in URLs.
  const summary = {
    doc: r["document-uri"] ?? "?",
    directive: r["violated-directive"] ?? r["effective-directive"] ?? "?",
    blocked: r["blocked-uri"] ?? "?",
    source: r["source-file"] ?? undefined,
    line: r["line-number"] ?? undefined,
  };
  console.error(`[csp-violation] ${JSON.stringify(summary)}`);

  // 204 No Content — browsers don't expect a body for report-uri POSTs.
  return new NextResponse(null, { status: 204 });
}
