// Pin tests for scripts/check-redirect-shadow.mjs.
//
// 38th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: Next.js applies `redirects()` BEFORE routing to pages.
// If a `source: "/get-started"` entry in next.config.ts exists AND
// `app/get-started/page.tsx` exists, the page is UNREACHABLE in prod
// — every request gets 308 to the legacy destination.
//
// Real incident GW v2.88.05: /get-started lead-capture landing was
// shadowed by an older WordPress sitemap-preservation redirect for
// ~6 hours before post-deploy verification caught it.
//
// Sister of GW `check-redirect-shadow.mjs` (no-src-prefix layout adapted).
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-redirect-shadow.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-redirect-shadow.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-redirect-shadow — GW v2.88.05 + v2.88.25 incident anchors preserved", () => {
  // 2 GW ship anchors — incident + sister gate.
  assert.match(GATE_SRC, /v2\.88\.05/, "GW v2.88.05 (incident) anchor");
  assert.match(GATE_SRC, /v2\.88\.25/, "GW v2.88.25 (sister gate) anchor");
});

test("check-redirect-shadow — 6-hour silent-shadow incident detail preserved", () => {
  // Concrete recovery cost — silent shadow not caught for 6 hours.
  assert.match(GATE_SRC, /6\s+hours/i, "6-hour incident-recovery anchor");
  assert.match(
    GATE_SRC,
    /WordPress\s+sitemap-preservation/i,
    "incident root-cause documented",
  );
});

test("check-redirect-shadow — `redirects() runs BEFORE routing` mechanism documented", () => {
  // THE Next.js-quirk mechanism. Pin so it doesn't get demoted to
  // "just verify pages render".
  assert.match(
    GATE_SRC,
    /BEFORE\s+routing/i,
    "redirects-run-BEFORE-routing mechanism prose",
  );
  assert.match(
    GATE_SRC,
    /UNREACHABLE/i,
    "UNREACHABLE failure-mode prose",
  );
  assert.match(GATE_SRC, /308/, "308 redirect status code anchor");
});

test("check-redirect-shadow — extractRedirectSources regex shape pinned (source:\"...\")", () => {
  // The detection regex. Drift = miss.
  assert.ok(
    GATE_SRC.includes("source:\\s*[\"']([^\"']+)[\"']"),
    "source: regex quote-flex shape pinned",
  );
});

test("check-redirect-shadow — pageFileFor: builds app/<path>/page.tsx target", () => {
  // The page-target resolver. Pin the shape so cross-stack ports
  // catch the right files.
  assert.match(
    GATE_SRC,
    /APP_DIR,\s*trimmed,\s*["']page\.tsx["']/,
    "page.tsx target builder pinned",
  );
});

test("check-redirect-shadow — wildcard/path-param skip (no shadow on dynamic redirects)", () => {
  // `(`, `*`, `:` in source path = wildcard/param — skip. These
  // legitimately match different shapes than a real page.tsx.
  assert.match(
    GATE_SRC,
    /sourcePath\.includes\(["']\(["']\)/,
    "( wildcard skip pinned",
  );
  assert.match(
    GATE_SRC,
    /sourcePath\.includes\(["']\*["']\)/,
    "* wildcard skip pinned",
  );
  assert.match(
    GATE_SRC,
    /sourcePath\.includes\(["']:["']\)/,
    ": path-param skip pinned",
  );
});

test("check-redirect-shadow — NEXT_CONFIG = next.config.ts (NOT .js)", () => {
  // Pin .ts variant — drift to .js silently breaks scan.
  assert.match(
    GATE_SRC,
    /NEXT_CONFIG\s*=\s*join\(ROOT,\s*["']next\.config\.ts["']\)/,
    "NEXT_CONFIG pinned to .ts",
  );
});

test("check-redirect-shadow — EXEMPT escape hatch (empty by default)", () => {
  // The opt-out mechanism — pin so it stays available, plus the
  // empty-by-default intent.
  assert.match(
    GATE_SRC,
    /EXEMPT\s*=\s*new Set\(\[\]\)/,
    "EXEMPT empty by default pinned",
  );
  assert.match(
    GATE_SRC,
    /documented\s+rationale/i,
    "documented-rationale requirement pinned",
  );
});

test("check-redirect-shadow — fix-guidance: remove redirect OR rename page", () => {
  // Self-documenting fix recipe with both shapes.
  assert.match(
    GATE_SRC,
    /remove\s+the\s+redirect/i,
    "fix shape 1: remove redirect",
  );
  assert.match(
    GATE_SRC,
    /rename\s+the\s+page/i,
    "fix shape 2: rename page",
  );
});

test("check-redirect-shadow — strict by default, --warn opt-in", () => {
  assert.match(
    GATE_SRC,
    /WARN_ONLY\s*=\s*process\.argv\.includes\("--warn"\)/,
    "--warn flag binding pinned",
  );
  assert.match(
    GATE_SRC,
    /process\.exit\(WARN_ONLY \? 0 : 1\)/,
    "default-strict exit policy pinned",
  );
});
