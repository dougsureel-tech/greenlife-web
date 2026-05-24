// Pin tests for scripts/check-cross-store-url-leak.mjs.
//
// 6th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: Wen code MUST NOT reference Sea's inv-Vercel URL. The bug
// went Sea → Wen on the 2026-05-04 fork; reverse could happen on a
// Wen-side codemod or copy-paste from a Sea page. Memory pin
// `feedback_cross_store_url_leak_pattern` documents the recovery recipe.
//
// IMPORTANT: this test file CONTAINS the forbidden URL as a string —
// the gate's own walker excludes __tests__/ so the gate never scans
// this file. Pin the __tests__ exclusion explicitly because if it
// drifts, this very test trips the gate it's supposed to lock.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-cross-store-url-leak.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-cross-store-url-leak.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-cross-store-url-leak — memory pin reference preserved", () => {
  // The gate header + the failure message both cite
  // `feedback_cross_store_url_leak_pattern` — losing the ref makes the
  // "what is this defending?" lookup harder for future operators.
  assert.match(
    GATE_SRC,
    /feedback_cross_store_url_leak_pattern/,
    "memory pin ref must persist (gate doctrine anchor)",
  );
});

test("check-cross-store-url-leak — forbidden URL is the inv-Vercel form (NOT apex)", () => {
  // The gate flags `seattle-cannabis-co.vercel.app` (inv-Vercel URL).
  // It does NOT flag `seattlecannabis.co` (apex) or
  // `www.seattlecannabis.co` — those are LEGIT cross-store nav links
  // to the sister-store public site. Pin so a future "tighten to
  // catch apex too" change requires explicit doctrine update.
  assert.ok(
    GATE_SRC.includes("seattle-cannabis-co.vercel.app"),
    "WRONG_URL must be the inv-Vercel form (not apex)",
  );
  assert.ok(
    !/WRONG_URL\s*=\s*["']seattlecannabis\.co["']/.test(GATE_SRC),
    "WRONG_URL must NOT be the apex form (apex is legit nav)",
  );
});

test("check-cross-store-url-leak — scan dirs are app + lib + components only", () => {
  // SCAN_DIRS = [app, lib, components] — customer-facing surfaces.
  // Drift to include scripts/ would self-trip on this very gate's
  // failure message (which contains the WRONG_URL string).
  assert.match(GATE_SRC, /join\(cwd,\s*["']app["']\)/, "scans app/");
  assert.match(GATE_SRC, /join\(cwd,\s*["']lib["']\)/, "scans lib/");
  assert.match(GATE_SRC, /join\(cwd,\s*["']components["']\)/, "scans components/");
});

test("check-cross-store-url-leak — walk EXCLUDES __tests__ (critical self-trip defense)", () => {
  // This test file contains the forbidden URL substring (in the
  // assertion above pinning WRONG_URL). Without __tests__/ exclusion,
  // the gate scans this file → trips → fails CI on every push. Pin
  // the exclusion so a future walker refactor can't accidentally drop it.
  assert.match(
    GATE_SRC,
    /name === "__tests__"/,
    "walk must skip __tests__/ (pin tests contain the forbidden URL)",
  );
});

test("check-cross-store-url-leak — walk EXCLUDES node_modules + .next + dotfiles", () => {
  assert.match(GATE_SRC, /name === "node_modules"/);
  assert.match(GATE_SRC, /name === "\.next"/);
  assert.match(
    GATE_SRC,
    /name\.startsWith\(["']\.["']\)/,
    "dotfile exclusion pinned",
  );
});

test("check-cross-store-url-leak — extension filter is ts/tsx/jsx/mjs", () => {
  // Source-language scope. Drift to scan .md/.json/.yml would
  // false-positive on changelog entries (lib/version.ts excluded above
  // but other docs aren't).
  assert.match(
    GATE_SRC,
    /\/\\\.\(ts\|tsx\|jsx\|mjs\)\$\//,
    "extension filter regex pinned",
  );
});

test("check-cross-store-url-leak — comment-line skip + inline-ignore escape hatches", () => {
  // 2 documented escape hatches: (1) full-line comment (// or *)
  // is skipped at the line level; (2) inline marker
  // `cross-store-url-leak:ignore` lets a line opt out. Pin both.
  assert.ok(
    GATE_SRC.includes('trimmed.startsWith("//")') &&
      GATE_SRC.includes('trimmed.startsWith("*")'),
    "comment-line skip pinned",
  );
  assert.ok(
    GATE_SRC.includes("cross-store-url-leak:ignore"),
    "inline-ignore escape hatch pinned",
  );
});

test("check-cross-store-url-leak — fail-loud on hit (exit 1, no --warn mode)", () => {
  // Cross-store leaks are silent UX bugs in production — they don't
  // get noticed until a customer reports landing on the wrong store.
  // Gate ships strict, no --warn opt-in.
  assert.match(GATE_SRC, /process\.exit\(1\)/, "exit 1 on hit pinned");
  assert.ok(
    !/--warn/.test(GATE_SRC),
    "no --warn flag (strict-only)",
  );
});
