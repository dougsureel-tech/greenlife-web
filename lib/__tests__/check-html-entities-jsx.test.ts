// Pin tests for scripts/check-html-entities-jsx.mjs.
//
// 23rd gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: React does NOT decode named entities in JSX text — they
// render LITERALLY. JS string literals don't decode any HTML entities
// either. Memory pin `feedback_changelog_html_entities_convention` v2:
// rule is direct Unicode chars, not HTML entities.
//
// 4-round class history (port from GW v2.97.AD → cannagent):
//   v4.555 numeric entities in JSX text (5 sites)
//   v4.575 named entities in JSX text (13 sites / 11 files)
//   v4.595 numeric entities in JS string literals (3 sites — real bug)
//   v4.615 round 2 of v4.595 + JSX text (4 more sites)
//
// IMPORTANT self-trip defense: this pin file CONTAINS forbidden
// entities (in assertions). Walker MUST skip __tests__ + .test.ts/tsx +
// .spec.ts or gate self-trips. Pinned explicitly.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-html-entities-jsx.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-html-entities-jsx.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-html-entities-jsx — React-doesn't-decode-named-entities mechanism documented", () => {
  // THE load-bearing insight. Without this anchor the gate is
  // "easy-demote" to "style nit".
  assert.match(
    GATE_SRC,
    /React\s+does\s+NOT\s+decode/i,
    "React-doesn't-decode mechanism prose",
  );
  assert.match(
    GATE_SRC,
    /render\s+LITERALLY/i,
    "render-literally failure-mode prose",
  );
});

test("check-html-entities-jsx — memory pin reference preserved", () => {
  assert.match(
    GATE_SRC,
    /feedback_changelog_html_entities_convention/,
    "memory pin reference preserved",
  );
});

test("check-html-entities-jsx — 4-round class history (v4.555 + v4.575 + v4.595 + v4.615) preserved", () => {
  // Concrete sweep magnitudes. Pin all 4 rounds so cleanup keeps recurrence.
  assert.match(GATE_SRC, /v4\.555/, "v4.555 (numeric JSX text) round");
  assert.match(GATE_SRC, /v4\.575/, "v4.575 (named JSX text 13/11) round");
  assert.match(GATE_SRC, /v4\.595/, "v4.595 (numeric JS string 3 sites) round");
  assert.match(GATE_SRC, /v4\.615/, "v4.615 (round 2) round");
});

test("check-html-entities-jsx — XML_REQUIRED allowlist = 5 canonical entities", () => {
  // The 5 XML-required entities that MUST be allowed (literal <>&"' chars).
  for (const name of ["amp", "lt", "gt", "quot", "apos"]) {
    assert.ok(
      GATE_SRC.includes(`"${name}"`),
      `XML_REQUIRED must include "${name}"`,
    );
  }
});

test("check-html-entities-jsx — DEFERRED_QUOTE_FAMILY = 4 curly-quote entities (chip-away)", () => {
  // Curly quotes need JSX-expression wrap refactor. Deferred until
  // round-by-round cleanup catches up. Pin all 4.
  for (const name of ["rsquo", "lsquo", "ldquo", "rdquo"]) {
    assert.ok(
      GATE_SRC.includes(`"${name}"`),
      `DEFERRED_QUOTE_FAMILY must include "${name}"`,
    );
  }
});

test("check-html-entities-jsx — NAMED + NUMERIC entity regex shapes pinned", () => {
  // Drift in either = miss whole class.
  assert.match(
    GATE_SRC,
    /NAMED_ENTITY_RE\s*=\s*\/&\(\[a-zA-Z\]\[a-zA-Z0-9\]\+\);\/g/,
    "NAMED_ENTITY_RE shape pinned",
  );
  assert.match(
    GATE_SRC,
    /NUMERIC_ENTITY_RE\s*=\s*\/&#x\?\[0-9a-fA-F\]\+;\/g/,
    "NUMERIC_ENTITY_RE (decimal + hex) shape pinned",
  );
});

test("check-html-entities-jsx — NUMERIC_IN_TS_ALLOWLIST = 4 email builders (intentional entities)", () => {
  // Email body builders use entities intentionally (Outlook quirks).
  // Pin all 4 so future addition doesn't drop one.
  for (const file of [
    "lib/email.ts",
    "lib/order-confirmation-email.ts",
    "lib/quiz-nurture-email.ts",
    "lib/welcome-email.ts",
  ]) {
    assert.ok(
      GATE_SRC.includes(`"${file}"`),
      `NUMERIC_IN_TS_ALLOWLIST must include ${file}`,
    );
  }
});

test("check-html-entities-jsx — lib/version.ts changelog full-blank treatment", () => {
  // The changelog has historical entity references that ARE intentional.
  // Pin the isChangelog detection + full-blank-out behavior.
  assert.match(
    GATE_SRC,
    /isChangelog/,
    "isChangelog flag pinned",
  );
  assert.match(
    GATE_SRC,
    /rel\s*===\s*"lib\/version\.ts"/,
    "lib/version.ts path-equality check pinned",
  );
});

test("check-html-entities-jsx — walker excludes __tests__/.test/.spec (self-trip defense)", () => {
  // CRITICAL: pin file contains forbidden entities in assertions. Walker
  // MUST exclude test files OR gate self-trips.
  assert.match(GATE_SRC, /entry === "__tests__"/, "__tests__ dir skip pinned");
  assert.match(
    GATE_SRC,
    /!entry\.endsWith\(["']\.test\.ts["']\)/,
    ".test.ts file-suffix skip pinned",
  );
  assert.match(
    GATE_SRC,
    /!entry\.endsWith\(["']\.test\.tsx["']\)/,
    ".test.tsx file-suffix skip pinned",
  );
  assert.match(
    GATE_SRC,
    /!entry\.endsWith\(["']\.spec\.ts["']\)/,
    ".spec.ts file-suffix skip pinned",
  );
});

test("check-html-entities-jsx — fix-guidance lists 3 recipes (Unicode + JSX-expr wrap + JS literal)", () => {
  // Self-documenting fix recipes for each kind of offender.
  assert.match(
    GATE_SRC,
    /direct\s+Unicode/i,
    "direct-Unicode fix recipe pinned",
  );
  assert.match(
    GATE_SRC,
    /wrap\s+in\s+expr/i,
    "JSX-expression wrap fix recipe pinned",
  );
  assert.ok(
    GATE_SRC.includes("we\\'ll") || GATE_SRC.includes("we'll"),
    "JS-literal Unicode example pinned",
  );
});
