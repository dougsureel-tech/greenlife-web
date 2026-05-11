/**
 * Open-redirect gate. Locks regression baseline at 0 unguarded
 * `searchParams.get("returnTo"|"redirect"|"callback"|...)` reads that flow
 * into `router.push()` / `router.replace()` / `redirect()` without a
 * leading-slash guard.
 *
 * Sister port of inv `apps/staff/scripts/check-no-unsafe-redirect.mjs`
 * (inv v397.485). Same memory pin: `feedback_open_redirect_safe_redirect_path`.
 *
 * Why this matters (inv incident reference):
 *   Pre-fix v396.645 (staff /login) + v397.445 (customer-PWA /account/login)
 *   both ran `const x = searchParams.get("..."); ... router.push(x);` —
 *   attacker phishing link with `?returnTo=https://evil.com` performed
 *   off-origin navigation after a legitimate auth. Next.js router.push
 *   accepts external URLs.
 *
 * Current state on cannabis web (verified 2026-05-11 grep):
 *   - 0 offenders. The bug pattern doesn't exist here. Sign-in / sign-up
 *     use Clerk components that don't expose returnTo via searchParams.
 *   - This arc-guard is PREVENTIVE: locks the class at 0 so if a future
 *     agent ships a /rewards/login style flow with raw searchParams.get,
 *     pre-push catches it.
 *
 * Canonical fix when offenders surface:
 *   Wrap reads in a guard that requires `/` prefix, blocks `//`, `/\`,
 *   `://` anywhere, and caps at 512 chars (sister of inv `lib/safe-redirect.ts`).
 *
 * Modes:
 *   - default → strict: lists offenders, exits 1.
 *   - `--warn` → loose: prints to stderr, exits 0.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const cwd = process.cwd();
const warnOnly = process.argv.includes("--warn");

// Anchor: 0 unguarded redirect-param reads as of this arc-guard's land.
const KNOWN_OFFENDERS_BASELINE = 0;

// Cannabis web has no `src/` — files live at app/, lib/, components/.
const SCAN_DIRS = ["app", "lib", "components"].map((d) => join(cwd, d));

// Redirect-style param names. Conservative list — only names that are
// commonly used for post-action redirects, NOT for date filters or
// generic query keys.
const REDIRECT_PARAM_RE =
  /searchParams\.get\(\s*"(returnTo|return_to|redirect|redirect_to|callback|callback_url|continue|continueTo|next_url)"\s*\)/g;

const SKIP_PATH_PATTERNS = [
  /__tests__\//,
  /node_modules\//,
];

function walkDir(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const p = join(dir, name);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (name === "node_modules" || name === ".next") continue;
      out.push(...walkDir(p));
    } else if (/\.(tsx?|mjs|js)$/.test(name)) {
      out.push(p);
    }
  }
  return out;
}

const offenders = [];
for (const scanDir of SCAN_DIRS) {
  for (const f of walkDir(scanDir)) {
    const rel = f.replace(`${cwd}/`, "");
    if (SKIP_PATH_PATTERNS.some((re) => re.test(rel))) continue;

    let src;
    try {
      src = readFileSync(f, "utf8");
    } catch {
      continue;
    }

    // Skip comments — fix-docs may quote the bad pattern verbatim.
    const noComments = src
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|\n)\s*\/\/[^\n]*/g, "$1");

    REDIRECT_PARAM_RE.lastIndex = 0;
    let m;
    const lines = noComments.split("\n");
    while ((m = REDIRECT_PARAM_RE.exec(noComments)) !== null) {
      // Find which line + check ±20 lines for safeRedirectPath wrapper.
      const offset = m.index;
      let lineIdx = 0;
      let chars = 0;
      for (let i = 0; i < lines.length; i++) {
        if (chars + lines[i].length + 1 > offset) {
          lineIdx = i;
          break;
        }
        chars += lines[i].length + 1;
      }
      const start = Math.max(0, lineIdx - 2);
      const end = Math.min(lines.length, lineIdx + 20);
      const window = lines.slice(start, end).join("\n");
      if (window.includes("safeRedirectPath(")) continue;
      offenders.push({ file: rel, paramName: m[1], line: lineIdx + 1 });
    }
  }
}

if (offenders.length <= KNOWN_OFFENDERS_BASELINE) {
  console.log(
    `✓ check-no-unsafe-redirect: ${offenders.length} unguarded redirect-param read(s) (baseline: ${KNOWN_OFFENDERS_BASELINE}, sister of inv v397.485).`,
  );
  process.exit(0);
}

const msg = [
  `✗ check-no-unsafe-redirect: ${offenders.length} unguarded redirect-param read(s) (baseline: ${KNOWN_OFFENDERS_BASELINE}).`,
  `These reads from \`searchParams.get(...)\` flow into router.push / router.replace / redirect`,
  `without going through a safe-redirect guard — open-redirect risk (sister of inv v396.645 + v397.445).`,
  ``,
  `Offenders:`,
  ...offenders.map((o) => `  • ${o.file}:${o.line} — searchParams.get("${o.paramName}")`),
  ``,
  `Fix path:`,
  `  1. Add a \`lib/safe-redirect.ts\` helper that validates: starts with /, no //, no /\\, no ://, <=512 chars`,
  `  2. import { safeRedirectPath } from "@/lib/safe-redirect";`,
  `  3. const target = safeRedirectPath(searchParams.get("returnTo"), "/<fallback>");`,
  `  4. router.push(target);`,
  ``,
  `If this is a legitimate non-redirect read of a like-named param, rename the param.`,
].join("\n");

if (warnOnly) {
  console.error(msg);
  process.exit(0);
}
console.error(msg);
process.exit(1);
