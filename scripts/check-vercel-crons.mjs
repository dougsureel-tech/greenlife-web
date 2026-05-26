#!/usr/bin/env node
/**
 * Vercel-cron route presence gate. Detects two divergence classes
 * between `vercel.json` `crons[]` and the on-disk `app/api/cron/<name>/route.ts`:
 *
 *   (A) MISSING route — vercel.json declares a path but no route file
 *       exists. Vercel accepts the schedule + fires the cron against
 *       a 404 forever, silently.
 *
 *   (B) DORMANT route — file exists but no vercel.json entry maps to
 *       it. Vercel never fires; the work silently doesn't happen.
 *       Worst class of bug (cannagent v6.3065 auto-drip dormant for
 *       months).
 *
 * Ported 2026-05-26 from `/CODE/Green Wellness/scripts/check-vercel-crons.mjs`
 * (sister-port of inv-App + cannagent + VRG). Differences:
 *   - GLW uses `app/` (not `src/app/`) for the App Router tree.
 *   - No dispatcher-registry parse (GLW is a single-cron stack).
 *
 * Opt-out for intentionally-dormant routes: include
 * `// dormant-cron:ignore` anywhere in the route file body.
 *
 * Modes:
 *   - default → strict: lists divergences, exits 1.
 *   - `--warn` → loose: prints to stderr, exits 0.
 *
 * Wired into:
 *   - `pnpm check:vercel-crons` for local manual run
 *   - `.githooks/pre-push` gate chain
 *
 * Cross-stack memory pin: `feedback_dispatcher_entry_stage_with_route_file_2026_05_21`.
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const cwd = process.cwd();
const warnOnly = process.argv.includes("--warn");

const VERCEL_JSON = join(cwd, "vercel.json");

let config;
try {
  const raw = readFileSync(VERCEL_JSON, "utf8");
  config = JSON.parse(raw);
} catch (err) {
  console.warn(
    `[check-vercel-crons] Could not read/parse vercel.json — skipping check (${err instanceof Error ? err.message : "unknown"}).`,
  );
  process.exit(0);
}

const crons = Array.isArray(config?.crons) ? config.crons : [];
if (crons.length === 0) {
  console.log(`[check-vercel-crons] OK — no crons declared.`);
  process.exit(0);
}

const ROUTE_EXTENSIONS = ["ts", "tsx", "js", "mjs"];

function resolveRoute(cronPath) {
  const clean = cronPath.replace(/^\/+/, "").replace(/\/+$/, "");
  const baseAppDir = join(cwd, "app", clean);
  for (const ext of ROUTE_EXTENSIONS) {
    if (existsSync(join(baseAppDir, `route.${ext}`))) {
      return { ok: true, file: `app/${clean}/route.${ext}` };
    }
  }
  return { ok: false };
}

// (A) Missing routes.
const missing = [];
for (const c of crons) {
  if (typeof c?.path !== "string") continue;
  const result = resolveRoute(c.path);
  if (!result.ok) {
    missing.push({ path: c.path, schedule: c.schedule ?? "(no schedule)" });
  }
}

// (B) Dormant routes.
const dormant = [];
try {
  const CRON_DIR = join(cwd, "app/api/cron");
  const vercelBasePaths = new Set(
    crons
      .map((c) => (typeof c?.path === "string" ? c.path.split("?")[0] : null))
      .filter((p) => p !== null),
  );
  for (const entry of readdirSync(CRON_DIR)) {
    const routeFile = join(CRON_DIR, entry, "route.ts");
    try {
      if (!statSync(routeFile).isFile()) continue;
    } catch {
      continue;
    }
    const expectedPath = `/api/cron/${entry}`;
    if (vercelBasePaths.has(expectedPath)) continue;
    const src = readFileSync(routeFile, "utf8");
    if (src.includes("dormant-cron:ignore")) continue;
    dormant.push(expectedPath);
  }
} catch {
  // CRON_DIR missing — skip silently.
}

if (missing.length === 0 && dormant.length === 0) {
  console.log(
    `[check-vercel-crons] OK — all ${crons.length} cron paths resolve to a route file (no dormant-cron orphans).`,
  );
  process.exit(0);
}

const banner = warnOnly
  ? `⚠️  VERCEL CRON MISMATCH — warn only (deploy continues)`
  : `🚨 VERCEL CRON MISMATCH — push blocked`;
const log = warnOnly ? console.warn : console.error;

log("");
log("═══════════════════════════════════════════════════════════════════════");
log(banner);
log("═══════════════════════════════════════════════════════════════════════");

if (missing.length > 0) {
  log(`  ${missing.length} of ${crons.length} cron path(s) have no route file:`);
  log("");
  for (const m of missing) {
    log(`    - ${m.path}  (schedule: ${m.schedule})`);
    log(`      expected: app${m.path}/route.{ts,tsx,js,mjs}`);
  }
  log("");
  log(`  Fix: create the route file at the path above, OR remove the`);
  log(`  cron from vercel.json if it's not ready yet.`);
}

if (dormant.length > 0) {
  if (missing.length > 0) log("");
  log(`  ${dormant.length} dormant-cron route file(s) — code exists but NOT wired into vercel.json:`);
  log("");
  for (const p of dormant) {
    log(`    - ${p}  (app${p}/route.ts exists; no vercel.json entry)`);
  }
  log("");
  log(`  Fix: add a \`crons\` entry to vercel.json (with schedule), OR delete`);
  log(`  the route file, OR add \`// dormant-cron:ignore\` if intentionally`);
  log(`  pre-launch.`);
}

log("═══════════════════════════════════════════════════════════════════════");
log("");

if (!warnOnly) process.exit(1);
