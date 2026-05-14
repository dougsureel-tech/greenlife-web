#!/usr/bin/env node
/**
 * Bulk-send-fan-out throttle gate.
 *
 * 2026-05-11 — Jensine welcome-email incident shipped 5 fixes:
 *   - v401.205 actions.ts bulkReissueSetupLinksToAllUnset throttle
 *   - v401.205 actions.ts bulkForceReissueSetupLinksToSelected throttle
 *   - v401.265 cron/manager-weekly-digest throttle
 *   - v401.265 cron/press-monitor throttle
 *   - v401.265 cron/review-request throttle
 *   - v401.285 lib/sms.ts sendBatch throttle
 *
 * All shared the SAME bug class: concurrent `Promise.all*` fan-out over
 * a recipient array where each iteration does `await send*(...)`. The
 * fan-out generates new requests faster than the external rate limit,
 * retry-with-backoff retries INTO the same hot window, recipients drop
 * silently.
 *
 * This gate catches the pattern at PR time so a future cron route /
 * bulk endpoint can't reintroduce it.
 *
 * What it flags:
 *   - `Promise.all(<array>.map(<async-with-await-send>))`
 *   - `Promise.allSettled(<array>.map(<async-with-await-send>))`
 * where the map callback body contains `await send*(...)` OR
 * `await resend.emails.send(` OR `await fetch("https://api.resend.com`
 *
 * What it does NOT flag:
 *   - Single send paths (no .map())
 *   - .map() over non-recipient arrays (queries, fetches that aren't sends)
 *   - .map() with explicit throttle inside (await sleep / setTimeout) —
 *     suppressed via comment `// arc-guard: bulk-fanout-throttle:ignore`
 *
 * Anchored via `import.meta.url` per `feedback_arc_guard_cwd_relative_path_trap`.
 *
 * Usage: `node scripts/check-bulk-fanout-throttle.mjs [--warn]`
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(SCRIPT_DIR, "..");
const SCAN_DIRS = ["app", "lib", "components"]
  .map((d) => join(REPO_ROOT, d))
  .filter((p) => { try { return statSync(p).isDirectory(); } catch { return false; } });
const WARN_ONLY = process.argv.includes("--warn");

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

// Pattern: capture `Promise.all(` or `Promise.allSettled(` followed by
// any depth of nested parens until we find a `.map(` then async callback
// body. We use a permissive regex that matches the START token then look
// at the surrounding ~30 lines for the bug signals.
const PROMISE_ALL_RE = /Promise\.(?:all|allSettled)\s*\(\s*(?:[^()]*?)\.map\s*\(\s*(?:async\s*)?\(/g;
const SEND_CALL_RE = /\bawait\s+(?:send[A-Z]\w*|resend\.emails\.send|fetch\s*\(\s*["'`]https:\/\/api\.resend\.com)/;
const THROTTLE_RE = /\b(?:setTimeout|sleep|throttle|SEND_THROTTLE_MS|delay)\b/i;
const IGNORE_MARKER = /arc-guard:\s*bulk-fanout-throttle:ignore/;

const offenders = [];

for (const file of SCAN_DIRS.flatMap((d) => walk(d))) {
  let src;
  try { src = readFileSync(file, "utf8"); } catch { continue; }
  if (IGNORE_MARKER.test(src)) continue;

  PROMISE_ALL_RE.lastIndex = 0;
  let match;
  while ((match = PROMISE_ALL_RE.exec(src)) !== null) {
    // Look at the 800 chars FOLLOWING the match for the send-call signal
    // (callback body usually fits there) AND the throttle signal.
    const window = src.slice(match.index, match.index + 800);
    const hasSend = SEND_CALL_RE.test(window);
    const hasThrottle = THROTTLE_RE.test(window);
    if (hasSend && !hasThrottle) {
      const line = src.slice(0, match.index).split("\n").length;
      const preview = src.slice(match.index, match.index + 100).replace(/\s+/g, " ");
      offenders.push({
        file: relative(REPO_ROOT, file).split(sep).join("/"),
        line,
        preview,
      });
    }
  }
}

if (offenders.length === 0) {
  console.log(`[check-bulk-fanout-throttle] OK — 0 unguarded Promise.all*(recipients.map(send)) patterns`);
  process.exit(0);
}

const header = WARN_ONLY ? "⚠️  check-bulk-fanout-throttle (warn)" : "✗ check-bulk-fanout-throttle";
console.error(`\n${header}: ${offenders.length} unguarded bulk-fan-out site(s)\n`);
console.error("Pattern: Promise.all*(...map(async ... await send*...)) WITHOUT explicit throttle.");
console.error("Bug class: fan-out generates requests faster than external API rate limit; recipients drop silently.");
console.error("Reference: v401.205/.245/.265/.285 — 5 sites fixed after Jensine welcome-email incident.\n");
for (const o of offenders) {
  console.error(`  ${o.file}:${o.line}`);
  console.error(`    ${o.preview}…\n`);
}
console.error("Fix shapes:");
console.error("  - Convert Promise.all*(map) to a serial for-loop with `await sleep(N)` between iterations");
console.error("  - 250ms throttle for Resend (5/sec ceiling), 1100ms for Twilio (1/sec ceiling)");
console.error("  - OR add `// arc-guard: bulk-fanout-throttle:ignore` comment if the map() callback");
console.error("    doesn't actually call an external rate-limited API (e.g. pure DB queries)");

process.exit(WARN_ONLY ? 0 : 1);
