#!/usr/bin/env node
//
// check-vercel-project-link — pre-push defense against `.vercel/project.json`
// pointing at the wrong Vercel project.
//
// Cross-stack incident 2026-05-11 19:30 PT: glw's `.vercel/project.json` had
// `projectName: "cannagent"` (wrong projectId). Every `vercel --prod` from
// the greenlife-web directory deployed to the cannagent.ai-serving Vercel
// project, replacing CannAgent's production with greenlife-web code. Took
// ~hours to discover via past-saturation curl-verify; recovered via
// `vercel link --yes --project greenlife-web`.
//
// This gate runs at pre-push time + fails loudly if `.vercel/project.json`
// `projectName` doesn't match `EXPECTED_PROJECT_NAME`. The check costs ~5ms
// + zero false positives (no dual-repo-single-project setups in this stack).
//
// Memory pin: `feedback_vercel_project_misroute_recovery`.
// INCIDENTS.md: 2026-05-11 19:30 PT entry (RESOLVED).
//
// Recovery if this gate fails: `vercel link --yes --project greenlife-web`.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(SCRIPT_DIR, "..");
const PROJECT_FILE = join(REPO_ROOT, ".vercel/project.json");

const EXPECTED_PROJECT_NAME = "greenlife-web";

let raw;
try {
  raw = readFileSync(PROJECT_FILE, "utf8");
} catch {
  // .vercel/ is gitignored — if missing, the developer hasn't linked locally
  // yet. That's fine; the GitHub auto-deploy still works via the project's
  // repo connection on Vercel's side. Don't fail; this gate defends against
  // misroute, not lack-of-link.
  console.log(
    `[check-vercel-project-link] OK — .vercel/project.json missing (local-link not required for git-driven deploys)`,
  );
  process.exit(0);
}

let parsed;
try {
  parsed = JSON.parse(raw);
} catch {
  console.error(`✗ check-vercel-project-link: .vercel/project.json is not valid JSON`);
  console.error(`  File: ${PROJECT_FILE}`);
  console.error(`  Fix: rm -rf .vercel && vercel link --yes --project ${EXPECTED_PROJECT_NAME}`);
  process.exit(1);
}

const actual = parsed.projectName ?? "(missing)";
if (actual !== EXPECTED_PROJECT_NAME) {
  console.error(`✗ check-vercel-project-link: .vercel/project.json points at wrong Vercel project`);
  console.error(``);
  console.error(`  Expected projectName: ${EXPECTED_PROJECT_NAME}`);
  console.error(`  Actual projectName:   ${actual}`);
  console.error(`  Actual projectId:     ${parsed.projectId ?? "(missing)"}`);
  console.error(``);
  console.error(`  This caused the 2026-05-11 cannagent.ai misroute incident:`);
  console.error(`    glw's local link was set to "cannagent" → vercel --prod deployed`);
  console.error(`    greenlife-web code to cannagent.ai serving project.`);
  console.error(``);
  console.error(`  Recovery (30 seconds):`);
  console.error(`    rm -rf .vercel`);
  console.error(`    vercel link --yes --project ${EXPECTED_PROJECT_NAME}`);
  console.error(``);
  console.error(`  Reference: INCIDENTS.md 2026-05-11 19:30 PT, memory pin`);
  console.error(`  feedback_vercel_project_misroute_recovery.`);
  process.exit(1);
}

console.log(`[check-vercel-project-link] OK — projectName=${actual}`);
process.exit(0);
