/**
 * Arc-guard: external SEND calls (Resend/Twilio/web-push) in server actions
 * + route handlers must be either awaited or wrapped in `after()` from
 * next/server — NEVER raw fire-and-forget on Vercel serverless.
 *
 * Cross-stack port from inv v401.745. Pre-existing inv incident: Jensine
 * (2026-05-11) got NOTHING from the `Reissue setup link` button because
 * `sendWelcomeEmail(...).catch(...)` fire-and-forget returned ok:true
 * before Vercel Fluid Compute could actually deliver the call. The runtime
 * tore down before the unawaited Promise resolved → silent skip + no
 * /admin/errors entry. Sister-bug the same day on /admin/reviewer-feedback
 * SMS notify path (v400.945).
 *
 * Doctrine (post-fix):
 *
 *   ✗ FORBIDDEN: bare `sendEmail(...).catch(err => ...)` standalone
 *                in a "use server" file or `app/api/**` route handler.
 *
 *   ✓ ALLOWED:   `await sendEmail(...);`                       — synchronous
 *   ✓ ALLOWED:   `await sendEmail(...).catch(...);`            — awaited recover
 *   ✓ ALLOWED:   `after(async () => { try { await sendEmail(...); } catch ... });`
 *                — Next.js 16 `after()` keeps the runtime alive past response
 *
 *   ✓ ALLOWED:   inside a `Promise.all([...catch(() => fallback))]` block
 *                — that's parallel-fetch with fallback, not fire-and-forget
 *
 * Scan scope: `src/app/` ONLY. Library helpers (`src/lib/`) are legit
 * fire-and-forget surfaces — they're consumed by both server actions
 * (which can wrap in after()) AND standalone Node scripts (which can't
 * use after()). The shipping doctrine: lib defines a real-await surface;
 * CALLERS in `app/` decide between await vs after-wrap.
 *
 * Ships strict (baseline 0). Cannagent has 0 current offenders at port
 * time — pure preventive. Locks the class against future regression
 * (e.g. a future drip-cron / lead-followup ship that fire-and-forgets a
 * Resend call inside a server action).
 *
 * Anchored via `import.meta.url` per memory pin
 * `feedback_arc_guard_cwd_relative_path_trap`.
 *
 * Usage: `node scripts/check-after-wrap-external-send.mjs [--warn]`
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, relative } from "path";
import { fileURLToPath } from "url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(SCRIPT_DIR, "..");
const WARN_ONLY = process.argv.includes("--warn");
const SCAN_DIRS = ["app"];
const EXTENSIONS = new Set([".ts", ".tsx"]);

const EXEMPT_PREFIXES = [
  // Tests use raw fire-and-forget to verify the lib's own .catch behavior.
  "app/__tests__/",
];

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (name === "node_modules" || name === ".next" || name === "__tests__")
      continue;
    const full = join(dir, name);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      walk(full, out);
    } else if (EXTENSIONS.has(name.slice(name.lastIndexOf(".")))) {
      out.push(full);
    }
  }
  return out;
}

function stripComments(src) {
  let out = src.replace(/\/\*[\s\S]*?\*\//g, "");
  out = out.replace(/\/\/[^\n]*/g, "");
  return out;
}

// Standalone send-call followed immediately by .catch. The leading
// whitespace anchor + the fact that the line does NOT start with
// `await ` / `return ` / `void ` / `const ` / `let ` / `=` is what
// distinguishes fire-and-forget from valid patterns.
const FIRE_AND_FORGET = /^(\s+)(send[A-Z]\w*|notify[A-Z]\w*|email[A-Z]\w*|sms[A-Z]\w*|push[A-Z]\w*|sendSms|sendPush)\s*\([^)]*\)\.catch\s*\(/;

// If the SAME or PRIOR line within the same statement block contains
// `after(` or `Promise.all(` or `await `, the .catch call is wrapped
// in something legitimate. We use a 3-line look-back window.
function isWrapped(lines, idx) {
  for (let j = Math.max(0, idx - 3); j <= idx; j += 1) {
    if (/\bawait\s+/.test(lines[j])) return true;
    if (/\bafter\s*\(/.test(lines[j])) return true;
    if (/Promise\.all\s*\(/.test(lines[j])) return true;
    if (/\bvoid\s+/.test(lines[j])) return true; // explicit fire-and-forget acknowledgment
  }
  return false;
}

const offenders = [];
for (const dir of SCAN_DIRS) {
  const root = join(REPO_ROOT, dir);
  for (const file of walk(root)) {
    const rel = relative(REPO_ROOT, file);
    if (EXEMPT_PREFIXES.some((p) => rel.startsWith(p))) continue;
    let src;
    try {
      src = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const stripped = stripComments(src);
    const lines = stripped.split("\n");
    for (let i = 0; i < lines.length; i += 1) {
      const m = FIRE_AND_FORGET.exec(lines[i]);
      if (!m) continue;
      if (isWrapped(lines, i)) continue;
      offenders.push({
        file: rel,
        line: i + 1,
        snippet: lines[i].trim().slice(0, 140),
        callee: m[2],
      });
    }
  }
}

if (offenders.length === 0) {
  console.log(
    `✓ check-after-wrap-external-send: 0 raw fire-and-forget sends (every Resend/Twilio/push call is either awaited or wrapped in next/server after())`,
  );
  process.exit(0);
}

const header = WARN_ONLY
  ? "⚠️  check-after-wrap-external-send (warn)"
  : "✗ check-after-wrap-external-send";
console.error(
  `\n${header}: ${offenders.length} raw fire-and-forget send(s) in server-side code\n`,
);
console.error(
  "Vercel serverless / Fluid Compute can tear down before an unawaited Promise resolves.",
);
console.error(
  "Sender silently drops + no /admin/errors entry → admin presses button, recipient gets nothing.",
);
console.error(
  "  ✗ sendEmail(...).catch(err => ...)                          — fire-and-forget, can drop",
);
console.error(
  "  ✓ await sendEmail(...);                                     — blocks the response",
);
console.error(
  "  ✓ after(async () => { try { await sendEmail(...); } ... }) — Next.js 16 after()",
);
console.error("");
for (const o of offenders) {
  console.error(`  ${o.file}:${o.line}`);
  console.error(`    callee: ${o.callee}()`);
  console.error(`    > ${o.snippet}`);
  console.error("");
}

process.exit(WARN_ONLY ? 0 : 1);
