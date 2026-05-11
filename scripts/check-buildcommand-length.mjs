#!/usr/bin/env node
/**
 * Vercel `vercel.json` `buildCommand` length gate.
 *
 * Cross-stack port from VRG + cannagent + inv. Vercel rejects
 * `buildCommand` strings >256 chars with "buildCommand should NOT be
 * longer than 256 characters". Error appears ONLY in deployment
 * metadata `readyStateReason` — never in build logs, dashboard, or
 * `vercel inspect`. A buildCommand silently growing past 256 starts
 * silently rejecting deploys.
 *
 * Inv 2026-05-03 incident: chained 5 build-gates inline blew the
 * budget; 30+ commits sat stuck before manual deployment-metadata
 * inspection found it.
 *
 * Scc today: no vercel.json — early exit OK. Gate is preventive for
 * the moment a vercel.json buildCommand inline-chain lands.
 *
 * Thresholds:
 *   HARD: 256 chars (deploy silently rejected)
 *   WARN: 230 chars (~90% — 26-char headroom)
 */

import { readFileSync } from "fs";
import { join } from "path";

const cwd = process.cwd();
const warnOnly = process.argv.includes("--warn");
const VERCEL_JSON = join(cwd, "vercel.json");

const HARD_LIMIT = 256;
const WARN_THRESHOLD = 230;

let config;
try {
  config = JSON.parse(readFileSync(VERCEL_JSON, "utf8"));
} catch (err) {
  console.warn(
    `[check-buildcommand-length] Could not read/parse vercel.json — skipping check (${err instanceof Error ? err.message : "unknown"}).`,
  );
  process.exit(0);
}

const cmd = config?.buildCommand;
if (typeof cmd !== "string") {
  console.log("[check-buildcommand-length] OK — no buildCommand declared (uses package.json build script).");
  process.exit(0);
}

const len = cmd.length;

if (len < WARN_THRESHOLD) {
  console.log(
    `[check-buildcommand-length] OK — buildCommand is ${len} chars (limit: ${HARD_LIMIT}).`,
  );
  process.exit(0);
}

const failing = len > HARD_LIMIT;
const banner = failing
  ? "🚨 VERCEL BUILDCOMMAND OVER 256 — push blocked (deploy WILL silently reject)"
  : "⚠️  VERCEL BUILDCOMMAND APPROACHING 256-char limit — push blocked";

console.error("");
console.error("═══════════════════════════════════════════════════════════════════════");
console.error(banner);
console.error("═══════════════════════════════════════════════════════════════════════");
console.error(`  vercel.json buildCommand: ${len} characters`);
console.error(`  Hard limit: ${HARD_LIMIT} (Vercel schema)`);
console.error(`  Warn threshold: ${WARN_THRESHOLD}`);
console.error("");
console.error("Fix: move the inline chain to a wrapper script (e.g. scripts/build-gates.mjs)");
console.error("     then set `buildCommand: \"node scripts/build-gates.mjs && next build\"`.");
console.error("");
console.error("Memory: feedback_vercel_buildcommand_silently_rejects_long_strings");

process.exit(warnOnly ? 0 : failing ? 1 : 1);
