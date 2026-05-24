// Pin tests for scripts/check-imageresponse-cache-pattern.mjs.
//
// 24th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: edge-runtime ImageResponse (from next/og) silently strips
// `s-maxage` and `stale-while-revalidate` from the wire when passed via
// the `headers` option. Every share-preview fetch re-renders via Satori
// uncached → wasted CPU + slow OG previews. Cannagent 2026-05-10
// incident: every probed OG endpoint served `cache-control: public,
// max-age=0` until v6.0605 fix wave.
//
// Layered-cache escape: `Vercel-CDN-Cache-Control` or `CDN-Cache-Control`
// carrying s-maxage is NOT stripped — those are sister-sureel-pattern.
//
// Cross-stack port from cannagent v6.0605 + GW + sureel + VRG.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-imageresponse-cache-pattern.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(
  process.cwd(),
  "scripts/check-imageresponse-cache-pattern.mjs",
);
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-imageresponse-cache-pattern — cannagent v6.0605 incident anchor preserved", () => {
  // Triggering ship + magnitude.
  assert.match(GATE_SRC, /cannagent\s+v6\.0605/, "cannagent v6.0605 ship anchor");
  assert.match(GATE_SRC, /2026-05-10/, "incident date pinned");
  assert.match(
    GATE_SRC,
    /every\s+probed\s+(?:cannagent\s+)?OG\s+endpoint/i,
    "every-endpoint sweep scope",
  );
});

test("check-imageresponse-cache-pattern — silent-strip mechanism documented", () => {
  // The WHY — ImageResponse strips s-maxage silently. Pin so it doesn't
  // get demoted to "stylistic".
  assert.match(
    GATE_SRC,
    /silently\s+strips?/i,
    "silently-strips failure-mode prose",
  );
  assert.match(GATE_SRC, /s-maxage/, "s-maxage stripped directive named");
  assert.match(
    GATE_SRC,
    /stale-while-revalidate/,
    "stale-while-revalidate stripped directive named",
  );
});

test("check-imageresponse-cache-pattern — cross-stack origin (4 stacks)", () => {
  // 4-stack provenance.
  for (const stack of ["cannagent", "GW", "sureel", "VRG"]) {
    assert.ok(
      GATE_SRC.includes(stack),
      `cross-stack origin ${stack} preserved`,
    );
  }
});

test("check-imageresponse-cache-pattern — detection contract (next/og + new ImageResponse)", () => {
  // 2-condition detection: file imports from next/og AND constructs
  // new ImageResponse. Either alone false-positives.
  assert.match(
    GATE_SRC,
    /from\\s\+\["']next\\\/og\["']/,
    "next/og import detection pinned",
  );
  assert.match(
    GATE_SRC,
    /new\\s\+ImageResponse\\s\*\\\(/,
    "new ImageResponse(...) construction detection pinned",
  );
});

test("check-imageresponse-cache-pattern — layered-CDN-cache escape (Vercel-CDN-Cache-Control + CDN-Cache-Control)", () => {
  // The legit-cache pattern. Drift = false-positive on already-fixed sites.
  assert.match(
    GATE_SRC,
    /Vercel-/i,
    "Vercel-CDN-Cache-Control variant pinned",
  );
  assert.match(
    GATE_SRC,
    /CDN-Cache-Control/i,
    "CDN-Cache-Control variant pinned",
  );
  assert.ok(
    GATE_SRC.includes("hasLayeredCdnCache"),
    "hasLayeredCdnCache flag pinned",
  );
});

test("check-imageresponse-cache-pattern — max-age=0 offender pattern (the actual flag)", () => {
  // The literal indicator of an unfixed site.
  assert.ok(
    GATE_SRC.includes("max-age=0"),
    "max-age=0 indicator pinned",
  );
});

test("check-imageresponse-cache-pattern — opt-out marker `// imageresponse-cache:ignore`", () => {
  // Per-file escape hatch — pin literal so it stays stable.
  assert.match(
    GATE_SRC,
    /imageresponse-cache:ignore/,
    "opt-out marker literal pinned",
  );
});

test("check-imageresponse-cache-pattern — SCAN_DIRS = app + components + lib", () => {
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\["app",\s*"components",\s*"lib"\]/,
    "SCAN_DIRS canonical 3-dir set",
  );
});

test("check-imageresponse-cache-pattern — fix-guidance recommends headers: cache-control with s-maxage", () => {
  // Self-documenting fix recipe.
  assert.match(
    GATE_SRC,
    /s-maxage=\d+/,
    "fix recipe with s-maxage=N pinned",
  );
  assert.match(
    GATE_SRC,
    /cache-control/i,
    "cache-control header recipe pinned",
  );
});

test("check-imageresponse-cache-pattern — comment-line skip (single-line // matched)", () => {
  // Line starting with `//` skipped — avoids false-pos on commented-out
  // example header bodies in docstrings.
  assert.match(
    GATE_SRC,
    /\/\^\\s\*\\\/\\\/\//,
    "single-line comment skip regex pinned",
  );
});
