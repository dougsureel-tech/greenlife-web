// Pin tests for scripts/check-vercel-project-link.mjs.
//
// 48th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine (HIGH-STAKES — wrong-project-deploy class):
// `.vercel/project.json` `projectName` MUST match this repo's expected
// project. Drift = `vercel --prod` deploys this repo's code to ANOTHER
// project, replacing that project's production.
//
// 2026-05-11 19:30 PT incident: glw's `.vercel/project.json` pointed at
// `cannagent` (wrong projectId). Every `vercel --prod` from
// greenlife-web/ deployed greenlife-web code to cannagent.ai's serving
// Vercel project. Took ~hours to discover via past-saturation
// curl-verify. Recovered via `vercel link --yes --project greenlife-web`.
//
// Memory pin: `feedback_vercel_project_misroute_recovery`.
// INCIDENTS.md: 2026-05-11 19:30 PT entry.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-vercel-project-link.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(
  process.cwd(),
  "scripts/check-vercel-project-link.mjs",
);
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-vercel-project-link — EXPECTED_PROJECT_NAME = greenlife-web", () => {
  // THE load-bearing constant. Drift to wrong name = wrong-project
  // deploys go un-caught.
  assert.match(
    GATE_SRC,
    /EXPECTED_PROJECT_NAME\s*=\s*["']greenlife-web["']/,
    "EXPECTED_PROJECT_NAME pinned to greenlife-web",
  );
});

test("check-vercel-project-link — PROJECT_FILE = .vercel/project.json", () => {
  // The target file path. Vercel-CLI-managed.
  assert.match(
    GATE_SRC,
    /["']\.vercel\/project\.json["']/,
    "PROJECT_FILE = .vercel/project.json pinned",
  );
});

test("check-vercel-project-link — 2026-05-11 19:30 PT incident anchor preserved", () => {
  assert.match(
    GATE_SRC,
    /2026-05-11/,
    "2026-05-11 incident date anchor",
  );
  assert.match(GATE_SRC, /19:30\s*PT/i, "19:30 PT incident timestamp");
});

test("check-vercel-project-link — cannagent.ai misroute concrete mechanism documented", () => {
  // The MECHANISM: glw code deployed to cannagent.ai's project.
  assert.match(
    GATE_SRC,
    /cannagent\.ai/,
    "cannagent.ai concrete misroute target",
  );
  assert.match(
    GATE_SRC,
    /greenlife-web\s+code\s+to\s+cannagent\.ai/i,
    "explicit misroute direction pinned",
  );
});

test("check-vercel-project-link — memory pin reference preserved", () => {
  assert.match(
    GATE_SRC,
    /feedback_vercel_project_misroute_recovery/,
    "memory pin reference preserved",
  );
});

test("check-vercel-project-link — INCIDENTS.md reference preserved", () => {
  assert.match(GATE_SRC, /INCIDENTS\.md/, "INCIDENTS.md reference preserved");
});

test("check-vercel-project-link — graceful missing-file behavior (don't fail on no local-link)", () => {
  // .vercel/ is gitignored. Missing = developer hasn't linked locally.
  // That's fine — GitHub auto-deploy works via Vercel-side repo
  // connection. Pin so future tightening doesn't break per-dev setups.
  assert.match(
    GATE_SRC,
    /local-link\s+not\s+required/i,
    "missing-file OK behavior rationale",
  );
  assert.match(
    GATE_SRC,
    /git-driven\s+deploys/i,
    "git-driven-deploy mechanism explanation",
  );
});

test("check-vercel-project-link — anchored via import.meta.url (arc-guard memory pin)", () => {
  // Cross-stack-cwd-trap compliance.
  assert.ok(
    GATE_SRC.includes("import.meta.url") &&
      GATE_SRC.includes("fileURLToPath"),
    "REPO_ROOT must anchor via import.meta.url + fileURLToPath",
  );
});

test("check-vercel-project-link — recovery recipe: `vercel link --yes --project greenlife-web`", () => {
  // Self-documenting 30-second recovery recipe.
  assert.match(
    GATE_SRC,
    /vercel\s+link\s+--yes\s+--project\s+greenlife-web/,
    "recovery recipe pinned exact",
  );
  assert.match(
    GATE_SRC,
    /rm\s+-rf\s+\.vercel/,
    "recovery preflight (rm -rf .vercel) pinned",
  );
});

test("check-vercel-project-link — fail-loud exit 1 + JSON-parse defense", () => {
  // Both failure paths: wrong project (exit 1) + invalid JSON (exit 1).
  assert.match(GATE_SRC, /process\.exit\(1\)/, "fail-loud exit 1 pinned");
  assert.match(
    GATE_SRC,
    /not\s+valid\s+JSON/i,
    "JSON-parse defense pinned",
  );
});
