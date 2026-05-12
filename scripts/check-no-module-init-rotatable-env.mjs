#!/usr/bin/env node
/**
 * Module-init env-var-rotatable-key freeze gate.
 *
 * Cross-stack port from inv v401.705. Bug class: `const X =
 * process.env.Y` at module scope, where Y is a value an admin might
 * ROTATE via `vercel env rm + add` (API keys, FROM addresses, auth
 * tokens). The const is computed once at module load and frozen for
 * the Vercel Fluid Compute instance lifetime (~15-30 min). When admin
 * rotates Y, stale FC instances keep using OLD value until cycled.
 *
 * Fix pattern: replace `const X = process.env.Y` with `function getX()
 * { return process.env.Y }`. Zero perf cost.
 *
 * 2026-05-11 Jensine welcome-email arc shipped fixes of this class
 * on inv (v401.505/.545/.565/.685) + cannagent (v6.4625). This gate
 * locks the baseline post-fix.
 *
 * Memory pin: `project_session_2026_05_11_evening_jensine_arc_closed`
 * (in inv-memory-tree; cross-stack lesson).
 *
 * Anchored via `import.meta.url` per cross-stack-cwd-relative-path-trap doctrine.
 *
 * Usage: `node scripts/check-no-module-init-rotatable-env.mjs [--warn]`
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(SCRIPT_DIR, "..");
// scc + glw have no src/ — app/ and lib/ live at root. Scan both.
const SCAN_DIRS = ["app", "lib", "components"]
  .map((d) => join(REPO_ROOT, d))
  .filter((p) => {
    try { return statSync(p).isDirectory(); } catch { return false; }
  });
const WARN_ONLY = process.argv.includes("--warn");

const ROTATABLE_ENV_VARS = new Set([
  // Email (Resend)
  "RESEND_API_KEY",
  "RESEND_FROM",
  "RESEND_REPLY_TO",
  // SMS (Twilio) — scc /rewards OTP flow
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_FROM_NUMBER",
  // Auth (rotation candidates)
  "DASHBOARD_SESSION_SECRET",
  "PUSH_SEND_TOKEN",
  // Web Push VAPID
  "VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "VAPID_EMAIL",
  // Quiz nurture (separate Resend key OR same — Doug-config)
  "QUIZ_NURTURE_API_KEY",
  // Cloudflare Turnstile (scc OTP defense)
  "TURNSTILE_SECRET_KEY",
]);

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const entry of entries) {
    if (entry === "node_modules" || entry === ".next" || entry === "__tests__") continue;
    const full = join(dir, entry);
    let s;
    try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) walk(full, out);
    else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) out.push(full);
  }
  return out;
}

const MODULE_INIT_ENV_RE = /^(?:export\s+)?const\s+\w+\s*=\s*(?:[^;]*\|\|\s*)?process\.env\.([A-Z_]+)/gm;
const IGNORE_MARKER = /\/\/\s*arc-guard:\s*module-init-env-ok/;

const offenders = [];

const allFiles = SCAN_DIRS.flatMap((d) => walk(d));
for (const file of allFiles) {
  let src;
  try { src = readFileSync(file, "utf8"); } catch { continue; }

  MODULE_INIT_ENV_RE.lastIndex = 0;
  let match;
  while ((match = MODULE_INIT_ENV_RE.exec(src)) !== null) {
    const envName = match[1];
    if (!ROTATABLE_ENV_VARS.has(envName)) continue;
    const upto = src.slice(0, match.index);
    const lineNumber = upto.split("\n").length;
    const prevLines = upto.split("\n").slice(-5).join("\n");
    if (IGNORE_MARKER.test(prevLines)) continue;
    offenders.push({
      file: relative(REPO_ROOT, file).split(sep).join("/"),
      line: lineNumber,
      envName,
      snippet: match[0].trim().slice(0, 80),
    });
  }
}

if (offenders.length === 0) {
  console.log(
    `[check-no-module-init-rotatable-env] OK — 0 module-init reads of rotatable env-vars (${ROTATABLE_ENV_VARS.size} guarded names)`,
  );
  process.exit(0);
}

const header = WARN_ONLY ? "⚠️  check-no-module-init-rotatable-env (warn)" : "✗ check-no-module-init-rotatable-env";
console.error(`\n${header}: ${offenders.length} module-init read(s) of rotatable env-vars\n`);
console.error("Bug class: `const X = process.env.Y` at module scope freezes Y's value");
console.error("for the Fluid Compute instance lifetime (~15-30 min). When admin rotates Y");
console.error("via Vercel CLI, stale FC instances keep using the OLD value until cycled.\n");
console.error("Reference: 2026-05-11 cross-stack Jensine welcome-email arc.\n");
for (const o of offenders) {
  console.error(`  ${o.file}:${o.line}`);
  console.error(`    ${o.snippet}…`);
  console.error(`    env: ${o.envName}`);
  console.error("");
}
console.error("Fix shapes:");
console.error("  Replace:  const X = process.env.Y || \"fallback\"");
console.error("  With:     function getX() { return process.env.Y || \"fallback\" }");
console.error("  Update callers from `X` to `getX()`. Zero perf cost.\n");
console.error("Escape: add `// arc-guard: module-init-env-ok` comment ON THE LINE BEFORE");
console.error("the const declaration for cases where freeze-at-init is intentional.");

process.exit(WARN_ONLY ? 0 : 1);
