import { NextResponse } from "next/server";

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
// Anti-spam: cap log payload at 4KB; some browsers / proxies inject
// extension-fired violations that wouldn't help us tighten the real
// policy. Worst case: the cap silently truncates a legitimate violation;
// the directive name + blocked-uri are always under 200 chars so the
// truncation never hides the actionable data.

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

export async function POST(request: Request): Promise<Response> {
  let body: CspReportBody | null = null;
  try {
    const text = await request.text();
    if (text.length > 4096) {
      // Cap at 4KB. Truncated payload still has the actionable fields
      // (browsers put document-uri + violated-directive + blocked-uri at
      // the top of the JSON, well under 4KB).
      body = JSON.parse(text.slice(0, 4096) + "}}");
    } else {
      body = JSON.parse(text);
    }
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
