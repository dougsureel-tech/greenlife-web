/**
 * CSP Report-Only header presence arc-guard.
 *
 * Pins the T108 v20.005 fix (`Content-Security-Policy-Report-Only` header
 * added to next.config.ts) AND the T109 v20.105 fix (`report-uri /api/csp-
 * report` directive + endpoint route) against regression.
 *
 * Pre-T108 glw + scc were the lone CSP outliers across the 6-site stack
 * (GW + cannagent + sureel + vrg either had CSP or were CSP-less without
 * an observation strategy). T108 added permissive CSP-RO to start
 * observing what would break under enforce mode; T109 added the report-uri
 * + /api/csp-report endpoint so violations get logged centrally to Vercel
 * Runtime Logs instead of per-user DevTools Console.
 *
 * This gate fails the build when `next.config.ts` is missing EITHER:
 *  - the `CSP_REPORT_ONLY` const (T108), OR
 *  - the `Content-Security-Policy-Report-Only` header registration (T108), OR
 *  - the `report-uri /api/csp-report` directive (T109), OR
 *  - the `app/api/csp-report/route.ts` endpoint file (T109)
 *
 * Same heuristic-presence pattern as `check-medical-clinic-ld-completeness.mjs`
 * (T84) and `check-breadcrumb-ld-id.mjs` (T103) on GW. Cross-stack pattern:
 * ship-the-fix → ship-the-arc-guard.
 *
 * Usage: `node scripts/check-csp-report-only.mjs`
 * Wire into pre-push hook + a future pnpm script if glw adopts a
 * check-all umbrella (currently glw doesn't have one — gates run via
 * direct script invocation).
 */

import { readFileSync, statSync } from "fs";
import { join } from "path";

const CONFIG_FILE = join(process.cwd(), "next.config.ts");
const ENDPOINT_FILE = join(process.cwd(), "app/api/csp-report/route.ts");

let configSrc;
try {
  configSrc = readFileSync(CONFIG_FILE, "utf8");
} catch (err) {
  console.error(`[check-csp-report-only] FAIL: cannot read ${CONFIG_FILE}`);
  console.error(`  ${err.message}`);
  process.exit(2);
}

const checks = [
  {
    name: "CSP_REPORT_ONLY const declared",
    re: /const\s+CSP_REPORT_ONLY\s*=/,
  },
  {
    name: "Content-Security-Policy-Report-Only header registered",
    re: /["']Content-Security-Policy-Report-Only["']\s*,/,
  },
  {
    name: "report-uri /api/csp-report directive present",
    re: /report-uri\s+\/api\/csp-report/,
  },
];

const failures = [];
for (const c of checks) {
  if (!c.re.test(configSrc)) failures.push(c.name);
}

// Endpoint file existence
let endpointOk = false;
try {
  statSync(ENDPOINT_FILE);
  endpointOk = true;
} catch {
  failures.push("app/api/csp-report/route.ts endpoint file missing");
}

if (failures.length > 0) {
  console.error(
    `[check-csp-report-only] FAIL — CSP observation infrastructure incomplete:`,
  );
  for (const f of failures) console.error(`  - ${f}`);
  console.error(
    `  See T108 v20.005 + T109 v20.105 changelog for context. CSP-RO observability is part of Doug-action #2 enforce-mode prep.`,
  );
  process.exit(1);
}

console.log(
  `✓ check-csp-report-only: CSP_REPORT_ONLY const + header + report-uri directive + endpoint route all present (T108 v20.005 + T109 v20.105 pinned)`,
);
