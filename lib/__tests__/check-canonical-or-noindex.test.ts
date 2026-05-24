// Pin tests for scripts/check-canonical-or-noindex.mjs.
//
// 13th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: every public app/**/page.tsx MUST own its canonical signal
// (declare canonical OR be noindex'd OR opt-out marker). Inheritance
// from root layout's `canonical: "/"` causes Google to flag every
// child page as duplicate-of-homepage:
//   - "Duplicate, Google chose different canonical" (910 items 2026-05-15)
//   - "Duplicate without user-selected canonical" (2650 items 2026-05-15)
// Either way the page's content gets dedup'd into homepage in the index.
//
// Detection: 3 signals — canonical literal · noindex shape · ignore marker.
// Layout-sibling fallback handles "use client" pages that can't export
// metadata themselves.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-canonical-or-noindex.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-canonical-or-noindex.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-canonical-or-noindex — 2026-05-15 Google-index incident anchors preserved", () => {
  // The WHY: concrete sweep magnitudes from GSC. Future cleanup MUST
  // preserve the incident scale or the gate gets demoted.
  assert.match(GATE_SRC, /2026-05-15/, "2026-05-15 incident date pinned");
  assert.match(GATE_SRC, /910/, "910 'different canonical' items");
  assert.match(GATE_SRC, /2650/, "2650 'no user-selected canonical' items");
});

test("check-canonical-or-noindex — root-layout cascade mechanism documented", () => {
  // The MECHANISM: root layout's `canonical: "/"` cascades. Without
  // this anchor, future devs might wrongly conclude "just add canonical
  // to the layout" — that's the ROOT layout problem, not the fix.
  assert.match(
    GATE_SRC,
    /[Cc]ascade/,
    "cascade mechanism documented",
  );
  assert.match(
    GATE_SRC,
    /root layout/i,
    "root layout cascade attribution",
  );
});

test("check-canonical-or-noindex — 3-signal detection preserved (canonical + noindex + ignore-marker)", () => {
  // The detection contract: 3 ways to satisfy the gate. Drift on any
  // changes the pass criteria.
  assert.match(
    GATE_SRC,
    /CANONICAL_RE/,
    "canonical detection regex named",
  );
  assert.match(
    GATE_SRC,
    /NOINDEX_RE/,
    "noindex detection regex named",
  );
  assert.match(
    GATE_SRC,
    /IGNORE_MARKER_RE/,
    "ignore marker regex named",
  );
});

test("check-canonical-or-noindex — canonical regex matches both shape variants", () => {
  // canonical: "..." literal works for both `canonical: "..."` shape
  // AND `alternates: { canonical: "..." }` shape (since the inner
  // `canonical:` substring matches).
  assert.ok(
    GATE_SRC.includes("\\bcanonical\\s*:\\s*[\"'`]"),
    "canonical regex with quote-flexibility pinned",
  );
});

test("check-canonical-or-noindex — noindex regex matches index:false + noindex:true", () => {
  // Two shapes of "don't index this": `index: false` OR `noindex: true`.
  // Drift to single-shape would miss legitimate noindex pages.
  assert.ok(
    GATE_SRC.includes("index\\s*:\\s*false"),
    "index:false shape pinned",
  );
  assert.ok(
    GATE_SRC.includes("noindex\\s*:\\s*true"),
    "noindex:true shape pinned",
  );
});

test("check-canonical-or-noindex — ignore-marker exact shape `// canonical:ignore-file`", () => {
  // The opt-out marker shape — pin the literal so it stays stable.
  // An opt-out marker that changes breaks every existing escape.
  assert.match(
    GATE_SRC,
    /canonical:ignore-file/,
    "ignore-file marker literal preserved",
  );
});

test("check-canonical-or-noindex — EXCLUDED_PREFIXES = 5 canonical excludes", () => {
  // api/ + admin/ + dev/ + devmenu/ + _* — none are public-indexable.
  // Pin all 5 so a future tightening doesn't false-positive them.
  for (const prefix of ["app/api/", "app/admin/", "app/dev/", "app/devmenu/", "app/_"]) {
    assert.ok(
      GATE_SRC.includes(`"${prefix}"`),
      `EXCLUDED_PREFIXES must include "${prefix}"`,
    );
  }
});

test("check-canonical-or-noindex — sibling-layout.tsx fallback for 'use client' pages", () => {
  // Critical UX-correctness: client-component pages can't export
  // metadata. They pair with a server-side sibling layout.tsx that does.
  // Without this fallback, every client page would false-positive.
  assert.match(
    GATE_SRC,
    /siblingLayout/,
    "sibling-layout fallback named",
  );
  assert.match(
    GATE_SRC,
    /layout\.tsx/,
    "layout.tsx file-name pinned",
  );
});

test("check-canonical-or-noindex — only page.tsx files scanned (not layout/loading/error)", () => {
  // The walker matches `entry === "page.tsx"` only. Drift to layout/
  // loading/etc would noise the report.
  assert.match(
    GATE_SRC,
    /entry === "page\.tsx"/,
    "page.tsx-only walker filter pinned",
  );
});

test("check-canonical-or-noindex — fix-guidance lists 3 options + the why", () => {
  // The error message documents canonical signals 1/2/3 AND the
  // root-layout WHY. Pin so error message doesn't get truncated to
  // "fix the canonical" without explaining how.
  assert.match(
    GATE_SRC,
    /1\.\s.*canonical:/,
    "fix option 1 (declare canonical) documented",
  );
  assert.match(
    GATE_SRC,
    /2\.\s.*noindex/,
    "fix option 2 (noindex) documented",
  );
  assert.match(
    GATE_SRC,
    /3\.\s.*ignore-file/,
    "fix option 3 (ignore marker) documented",
  );
});
