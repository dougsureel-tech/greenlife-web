// Pin tests for scripts/check-og-image-shape.mjs.
//
// 33rd gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: page metadata declaring string-form `images: ["/opengraph-
// image"]` emits ONLY `<meta property="og:image">` — width/height/alt/
// type siblings (and twitter:image:alt) are OMITTED. Result: share-card
// crawlers (Facebook/LinkedIn/Slack/Discord/iMessage/Twitter/X) can't
// pre-allocate the card image area → small-card or "loading" placeholder.
// Plus a11y: screen readers can't describe the image without alt.
//
// 3-step arc: glw v15.005 + scc v13.2605 T29 (38 pages) + GW v2.95.30
// T30 (buildPageMetadata twitter.images SoT helper) + T31 2026-05-10
// gate-add.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-og-image-shape.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-og-image-shape.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-og-image-shape — T29 + T30 + T31 ship-arc anchors preserved", () => {
  assert.match(GATE_SRC, /T29/, "T29 (glw + scc 38-page sweep) anchor");
  assert.match(GATE_SRC, /T30/, "T30 (GW SoT helper) anchor");
  assert.match(GATE_SRC, /T31/, "T31 (this gate-add) anchor");
});

test("check-og-image-shape — version anchors preserved (v15.005/v13.2605/v2.95.30)", () => {
  for (const v of ["v15.005", "v13.2605", "v2\\.95\\.30"]) {
    assert.match(GATE_SRC, new RegExp(v), `${v} ship version anchor`);
  }
});

test("check-og-image-shape — 38-page sweep magnitude preserved", () => {
  // Concrete scope — pin so future cleanup keeps the WHY.
  assert.match(
    GATE_SRC,
    /38\s+pages?/,
    "38-page sweep magnitude pinned",
  );
});

test("check-og-image-shape — 6 share-card crawler coverage list preserved", () => {
  // Pin all 6 — they're the real-world consumers of OG-image:N siblings.
  for (const crawler of ["Facebook", "LinkedIn", "Slack", "Discord", "iMessage", "Twitter"]) {
    assert.ok(
      GATE_SRC.includes(crawler),
      `share-card crawler ${crawler} must be in coverage list`,
    );
  }
});

test("check-og-image-shape — a11y screen-reader-can't-describe rationale", () => {
  // Cross-doctrine link: a11y, not just SEO/share-cards.
  assert.match(GATE_SRC, /screen\s+readers?/i, "screen-reader concern documented");
  assert.match(GATE_SRC, /accessibility/i, "a11y rationale preserved");
});

test("check-og-image-shape — EXEMPT app/sitemap.ts (URL-strings per sitemap spec)", () => {
  // Sitemap images legitimately use URL-strings (different spec).
  assert.match(
    GATE_SRC,
    /"app\/sitemap\.ts"/,
    "app/sitemap.ts exempt pinned",
  );
});

test("check-og-image-shape — sub-block scope detection (openGraph + twitter only)", () => {
  // Only `images:` arrays inside openGraph or twitter blocks count.
  // Drift could noise unrelated `images:` keys (e.g. icon configs).
  assert.match(
    GATE_SRC,
    /\\b\(openGraph\|twitter\)\\s\*:\\s\*\$/,
    "openGraph|twitter scope-detect regex pinned",
  );
});

test("check-og-image-shape — isStringForm: only literal strings flagged (identifiers trusted)", () => {
  // Bare identifiers (DEFAULT_OG_IMAGE / ogUrl) are TRUSTED — agents
  // prefer SoT consts. Pin the trust-identifier behavior so future
  // tightening doesn't false-positive.
  assert.match(
    GATE_SRC,
    /trusted/i,
    "identifier/object trust prose documented",
  );
  assert.ok(
    GATE_SRC.includes('el.startsWith(\'"\')'),
    "literal-string-only flag check pinned",
  );
});

test("check-og-image-shape — fix-recipe: object-form with all 5 fields", () => {
  // The canonical fix: `{ url, width: 1200, height: 630, alt, type: 'image/png' }`.
  for (const field of ["url", "width:\\s*1200", "height:\\s*630", "alt", "image/png"]) {
    assert.match(
      GATE_SRC,
      new RegExp(field),
      `fix recipe must include ${field}`,
    );
  }
});

test("check-og-image-shape — SoT const recommendation (DEFAULT_OG_IMAGE)", () => {
  // Self-documenting recipe extension — use a const from lib/store.ts.
  assert.match(
    GATE_SRC,
    /DEFAULT_OG_IMAGE/,
    "DEFAULT_OG_IMAGE SoT const recommendation pinned",
  );
});

test("check-og-image-shape — SCAN_DIRS = 4-shape cross-stack set", () => {
  // app + src/app + lib + src/lib — cross-stack portability.
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\["app",\s*"src\/app",\s*"lib",\s*"src\/lib"\]/,
    "SCAN_DIRS cross-stack 4-shape canonical",
  );
});

test("check-og-image-shape — strict by default, --warn opt-in", () => {
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
