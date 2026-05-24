// Pin tests for scripts/check-server-actions-async.mjs.
//
// 41st gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: Next 16 Turbopack requires every export from a `"use server"`
// file to be an `async function` (or type-only export). Sync function /
// non-async value exports fail Turbopack build with:
//   "Server Actions must be async functions"
// vitest happily ignores the directive + runs green; deploy fails.
//
// Allowed export shapes: `export async function`, `export type`,
// `export interface`, `export type {`, `export type * from`,
// `export default async`.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-server-actions-async.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(
  process.cwd(),
  "scripts/check-server-actions-async.mjs",
);
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-server-actions-async — Next 16 Turbopack literal error string preserved", () => {
  // The literal Turbopack error. Pin so future devs Googling it land
  // on this gate's header.
  assert.match(
    GATE_SRC,
    /Server Actions must be async functions/i,
    "Turbopack literal error string pinned",
  );
});

test("check-server-actions-async — vitest-ignores-directive trap doctrine preserved", () => {
  // THE load-bearing insight: vitest happily ignores 'use server' →
  // tests pass green; production deploy fails. Without this anchor
  // the gate is "easy demote" because vitest passes.
  assert.match(
    GATE_SRC,
    /[Vv]itest[\s\S]+?happily\s+ignores/i,
    "vitest-ignores-directive trap documented",
  );
  assert.match(
    GATE_SRC,
    /deploy(?:[\s\S]+?)stuck/i,
    "deploy-stuck consequence documented",
  );
});

test("check-server-actions-async — isServerActionsFile = first-non-comment-line directive check", () => {
  // Critical scope filter: the `use server` directive must be the FIRST
  // non-comment line. Pin the helper + directive regex.
  assert.match(
    GATE_SRC,
    /isServerActionsFile/,
    "isServerActionsFile scope helper",
  );
  assert.ok(
    GATE_SRC.includes('["\']use server["\'];?$'),
    "use-server directive regex pinned",
  );
});

test("check-server-actions-async — 6 allowed export shapes pinned (isAllowed)", () => {
  // The whitelist. Drift drops one = false-positive on legit code.
  // Note: source uses trailing space on most shapes ("export async function ").
  for (const shape of [
    "export async function ",
    "export type ",
    "export interface ",
    "export type {",
    "export type * from",
    "export default async ",
  ]) {
    assert.ok(
      GATE_SRC.includes(shape),
      `allowed shape "${shape}" must be in isAllowed`,
    );
  }
});

test("check-server-actions-async — SCAN_DIRS = app + components + lib", () => {
  // 3-dir canonical scan scope.
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\["app",\s*"components",\s*"lib"\]/,
    "SCAN_DIRS canonical 3-dir set",
  );
});

test("check-server-actions-async — fix-recipe lists 2 paths (extract sync OR make async)", () => {
  // Self-documenting fix.
  assert.match(
    GATE_SRC,
    /extract\s+sync/i,
    "fix path 1: extract sync to non-use-server module",
  );
  assert.match(
    GATE_SRC,
    /make\s+the\s+function\s+async/i,
    "fix path 2: make the function async",
  );
});

test("check-server-actions-async — comment-aware first-real-line detector (// + /* + *)", () => {
  // Pin file-header tolerance: JSDoc + line comments above directive
  // must not confuse scope detection.
  assert.match(GATE_SRC, /startsWith\(["']\/\/["']\)/, "// skip pinned");
  assert.match(GATE_SRC, /startsWith\(["']\/\*["']\)/, "/* skip pinned");
  assert.match(GATE_SRC, /startsWith\(["']\*["']\)/, "* (JSDoc body) skip pinned");
});

test("check-server-actions-async — fail-loud exit 1 (no --warn opt-out — deploy-blocker class)", () => {
  // No --warn mode. This is a hard fail-or-deploy-fail gate.
  assert.match(GATE_SRC, /process\.exit\(1\)/, "fail-loud exit 1");
  assert.ok(
    !GATE_SRC.includes("--warn"),
    "no --warn opt-out (deploy-blocker gate)",
  );
});

test("check-server-actions-async — walker excludes node_modules + .next", () => {
  assert.match(
    GATE_SRC,
    /entry === "node_modules"/,
    "node_modules skip pinned",
  );
  assert.match(
    GATE_SRC,
    /entry === "\.next"/,
    ".next skip pinned",
  );
});

test("check-server-actions-async — .tsx? extension filter", () => {
  // Only TS/TSX files can carry the directive.
  assert.match(
    GATE_SRC,
    /\\\.tsx\?\$/,
    ".tsx? extension regex filter pinned",
  );
});
