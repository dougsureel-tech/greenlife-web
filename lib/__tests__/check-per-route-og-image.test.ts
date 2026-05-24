// Pin tests for scripts/check-per-route-og-image.mjs.
//
// 34th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: co-located `opengraph-image.tsx` at app/<route>/ uses
// Next 16's per-route CONVENTION to auto-inject the OG meta tag
// UNLESS the sibling page.tsx sets `metadata.openGraph.images`
// explicitly. When that explicit override points elsewhere
// (DEFAULT_OG_IMAGE / brand.logoUrl / "/opengraph-image"), the
// per-route file becomes DEAD CODE — every share-card on Twitter/
// Facebook/LinkedIn/iMessage renders the WRONG image.
//
// 3-step arc: T48 (glw v17.005 + scc v13.4705) + T49 (glw v17.105 +
// scc v13.4805) + T50 2026-05-10 gate-add.
//
// Known bad patterns: DEFAULT_OG_IMAGE · <obj>.logoUrl · "/opengraph-image".
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-per-route-og-image.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-per-route-og-image.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-per-route-og-image — T48 + T49 + T50 ship-arc anchors preserved", () => {
  assert.match(GATE_SRC, /T48/, "T48 (/blog/[slug] dead-code) anchor");
  assert.match(GATE_SRC, /T49/, "T49 (/menu + deals + brands) anchor");
  assert.match(GATE_SRC, /T50/, "T50 (this gate-add) anchor");
});

test("check-per-route-og-image — version anchors (v17.005/v17.105/v13.4705/v13.4805)", () => {
  for (const v of ["v17.005", "v17.105", "v13.4705", "v13.4805"]) {
    assert.ok(GATE_SRC.includes(v), `${v} ship anchor`);
  }
});

test("check-per-route-og-image — DEAD CODE + wrong-image rationale preserved", () => {
  // The two load-bearing phrases.
  assert.match(GATE_SRC, /DEAD\s+CODE/i, "DEAD CODE doctrine label");
  assert.match(GATE_SRC, /WRONG\s+image/i, "wrong-image failure-mode prose");
});

test("check-per-route-og-image — share-card surface coverage list (Twitter/FB/LinkedIn/iMessage)", () => {
  // 4 share-card consumers — pin to keep cross-surface anchor.
  for (const surface of ["Twitter", "Facebook", "LinkedIn", "iMessage"]) {
    assert.ok(
      GATE_SRC.includes(surface),
      `share-card surface ${surface} must be in coverage list`,
    );
  }
});

test("check-per-route-og-image — 3 known-bad patterns pinned (DEFAULT_OG_IMAGE + .logoUrl + /opengraph-image)", () => {
  // The deadCodePattern() detection contract. Drift drops one = miss.
  assert.match(
    GATE_SRC,
    /DEFAULT_OG_IMAGE/,
    "DEFAULT_OG_IMAGE T29-era SoT-const ref pattern",
  );
  assert.match(
    GATE_SRC,
    /\\w\+\\\.logoUrl/,
    "<x>.logoUrl T49-era brand-logo override pattern",
  );
  assert.match(
    GATE_SRC,
    /\\\/opengraph-image/,
    "/opengraph-image root path string-literal pattern",
  );
});

test("check-per-route-og-image — findOgImageDirs walks for opengraph-image.tsx files", () => {
  // The discovery mechanism: find directories with `opengraph-image.tsx`.
  // Pin the file-name target.
  assert.match(
    GATE_SRC,
    /opengraph-image\.tsx/,
    "opengraph-image.tsx target file-name pinned",
  );
});

test("check-per-route-og-image — root opengraph-image.tsx skipped (legit fallback)", () => {
  // Root app/opengraph-image.tsx is the HOMEPAGE / fallback default —
  // it's correct for it to be the default. Pin the skip rule.
  assert.match(
    GATE_SRC,
    /relDir === "app"\s*\|\|\s*relDir === "src\/app"/,
    "root-app skip rule pinned (legit fallback)",
  );
});

test("check-per-route-og-image — sibling-detection scans page.tsx + layout.tsx", () => {
  // Both shapes — sometimes pages set metadata via layout instead.
  assert.match(
    GATE_SRC,
    /candidates\s*=\s*\["page\.tsx",\s*"layout\.tsx"\]/,
    "candidates = page.tsx + layout.tsx pinned",
  );
});

test("check-per-route-og-image — openGraph scope-detect (not twitter/etc)", () => {
  // Only `images:` arrays in openGraph blocks count. Twitter blocks
  // are a different concern (covered by check-og-image-shape).
  assert.match(
    GATE_SRC,
    /\\bopenGraph\\s\*:\\s\*\$/,
    "openGraph scope-detect regex pinned",
  );
});

test("check-per-route-og-image — fix-recipe lists 2 shapes (drop + explicit per-route URL)", () => {
  // Self-documenting fix.
  assert.match(
    GATE_SRC,
    /Drop\s+`?images:/i,
    "fix shape 1: drop images entirely",
  );
  assert.match(
    GATE_SRC,
    /<route>\/opengraph-image/,
    "fix shape 2: explicit per-route URL",
  );
});

test("check-per-route-og-image — strict by default, --warn opt-in", () => {
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
