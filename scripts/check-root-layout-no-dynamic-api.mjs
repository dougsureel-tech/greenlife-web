#!/usr/bin/env node
/**
 * Root-layout dynamic-API gate. Detects calls to `cookies()` or `headers()`
 * (from `next/headers`) inside the ROOT App Router layout — which silently
 * opts EVERY page on the site into dynamic rendering, killing any
 * static-prerender perf win across the entire route tree.
 *
 * The trap (cannagent 2026-05-13 perf-audit near-miss, codified in memory
 * pin `feedback_cookies_in_root_layout_opts_into_dynamic`):
 *
 *   "Hey, let's server-render-gate this admin-only client component so
 *    public visitors don't ship the JS — just check the cookie in root
 *    layout." Sounds like a small perf win (~50–80KB JS for 2% audience).
 *    What actually happens: every page (`/`, `/pricing`, `/features`, all
 *    of it) goes from edge-cached static → per-request function spin-up.
 *    TTFB +200–600ms across the entire site. The cure is worse than the
 *    "fix" by orders of magnitude.
 *
 * Detection: regex-find `cookies()` or `headers()` function calls (not type
 * imports) in the ROOT layout file. Segment layouts (e.g.
 * `app/admin/layout.tsx`) are NOT checked — dynamic rendering for a
 * narrower subtree is often the intent.
 *
 * Opt-out: include `// dynamic-root-layout:intentional` anywhere in the
 * file body. Use this only when the entire site is dynamic-by-design
 * (e.g. fully-authenticated staff app where no page wants
 * static-prerender). Document the reason inline next to the marker.
 *
 * Wired into:
 *   - `pnpm check:root-layout-no-dynamic-api` for local manual run
 *   - `.githooks/pre-push` gate chain
 *
 * Cross-stack: applicable to every App Router stack. Per-repo path probe
 * detects `app/layout.tsx` (root-at-repo-root) vs `src/app/layout.tsx`
 * (src-prefixed) vs `apps/staff/src/app/layout.tsx` (monorepo).
 *
 * Memory pin: `feedback_cookies_in_root_layout_opts_into_dynamic`.
 * Sister-gate fleet: cron-presence (`check-vercel-crons`).
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const cwd = process.cwd();
const warnOnly = process.argv.includes("--warn");

// Probe likely root-layout locations. First match wins.
const ROOT_LAYOUT_CANDIDATES = [
  "app/layout.tsx",
  "src/app/layout.tsx",
  "apps/staff/src/app/layout.tsx",
];

let rootLayoutPath = null;
for (const candidate of ROOT_LAYOUT_CANDIDATES) {
  const full = join(cwd, candidate);
  if (existsSync(full)) {
    rootLayoutPath = full;
    break;
  }
}

if (!rootLayoutPath) {
  console.log(
    `[check-root-layout-no-dynamic-api] OK — no root layout.tsx found at any of: ${ROOT_LAYOUT_CANDIDATES.join(", ")} (probably non-App-Router repo).`,
  );
  process.exit(0);
}

const src = readFileSync(rootLayoutPath, "utf8");

// Opt-out marker check first — if present, skip with informational log.
if (src.includes("dynamic-root-layout:intentional")) {
  console.log(
    `[check-root-layout-no-dynamic-api] OK — ${rootLayoutPath.replace(cwd + "/", "")} carries // dynamic-root-layout:intentional opt-out.`,
  );
  process.exit(0);
}

// Find cookies() or headers() function calls. Both forms:
//   - `cookies()` direct call
//   - `await cookies()` Next 15+ async form
// Require the parens to disambiguate from type imports (`import type { cookies }`).
const COOKIES_RE = /\bcookies\s*\(\s*\)/;
const HEADERS_RE = /\bheaders\s*\(\s*\)/;

const violations = [];
const lines = src.split("\n");
lines.forEach((line, idx) => {
  if (COOKIES_RE.test(line)) {
    violations.push({ line: idx + 1, snippet: line.trim(), api: "cookies()" });
  } else if (HEADERS_RE.test(line)) {
    violations.push({ line: idx + 1, snippet: line.trim(), api: "headers()" });
  }
});

if (violations.length === 0) {
  console.log(
    `[check-root-layout-no-dynamic-api] OK — ${rootLayoutPath.replace(cwd + "/", "")} does not call cookies() or headers().`,
  );
  process.exit(0);
}

const banner = warnOnly
  ? `⚠️  ROOT LAYOUT DYNAMIC API — warn only (deploy continues)`
  : `🚨 ROOT LAYOUT DYNAMIC API — push blocked`;
const log = warnOnly ? console.warn : console.error;

const relPath = rootLayoutPath.replace(cwd + "/", "");
log("");
log("═══════════════════════════════════════════════════════════════════════");
log(banner);
log("═══════════════════════════════════════════════════════════════════════");
log(`  ${violations.length} dynamic-API call(s) in ROOT layout ${relPath}:`);
log("");
for (const v of violations) {
  log(`    ${relPath}:${v.line}  →  ${v.api}`);
  log(`      ${v.snippet}`);
}
log("");
log(`  Why this matters:`);
log(`    Calling cookies() or headers() in the root layout opts EVERY page`);
log(`    on the site into dynamic rendering. Edge-cached static → per-request`);
log(`    function spin-up. TTFB +200–600ms across all routes. Memory pin:`);
log(`    feedback_cookies_in_root_layout_opts_into_dynamic.`);
log("");
log(`  Fix paths:`);
log(`    A. Move the dynamic API to a segment layout (e.g.`);
log(`       app/admin/layout.tsx) where dynamic-rendering for that subtree`);
log(`       is intentional.`);
log(`    B. Use a client-side gate (read document.cookie at runtime,`);
log(`       component renders null when absent — keeps root static).`);
log(`    C. Use lazy-load on user intent (tiny static button → dynamic`);
log(`       import on click — the heavy bundle isn't even downloaded`);
log(`       until the user demonstrates interest).`);
log(`    D. If the entire site is dynamic-by-design (e.g. fully-auth'd`);
log(`       staff app where no page wants static-prerender), add`);
log(`       \`// dynamic-root-layout:intentional\` somewhere in the file`);
log(`       body with a one-line reason next to it.`);
log("═══════════════════════════════════════════════════════════════════════");
log("");

if (!warnOnly) process.exit(1);
