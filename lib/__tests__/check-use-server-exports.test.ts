// Pin tests for scripts/check-use-server-exports.mjs.
//
// 46th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: Next 16 / Turbopack invalidates ALL exports in a "use server"
// file when ANY top-level export is non-async. If a single client
// component imports the module by-name, build fails with "module has no
// exports at all" — misleading because the module DOES export the
// requested symbol, but Turbopack rejects the whole module shape.
//
// Live incident: Inventory App v229.005 / v231.005 (2026-05-08) —
// preview-actions.ts had `export const VMI_ADMIN_PREVIEW_COOKIE = ...`
// alongside two async actions. 5+ Wen + Sea deploys failed in a row.
//
// Cross-stack port from VRG + cannagent + inv + GW v2.97.D3.
//
// Allowed: export async function / type/interface/enum / * from /
// { X } from / default async function.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-use-server-exports.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-use-server-exports.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-use-server-exports — inv v229.005-v231.005 + 2026-05-08 incident anchors preserved", () => {
  assert.match(GATE_SRC, /v229\.005/, "inv v229.005 start anchor");
  assert.match(GATE_SRC, /v231\.005/, "inv v231.005 end anchor");
  assert.match(GATE_SRC, /2026-05-08/, "2026-05-08 incident date pinned");
  assert.match(
    GATE_SRC,
    /preview-actions\.ts/,
    "preview-actions.ts incident file pinned",
  );
  assert.match(
    GATE_SRC,
    /VMI_ADMIN_PREVIEW_COOKIE/,
    "VMI_ADMIN_PREVIEW_COOKIE concrete-bug-symbol anchored",
  );
});

test("check-use-server-exports — `5+ Wen + Sea deploys failed in a row` magnitude preserved", () => {
  // Concrete cost — 5+ deploy failures across both stores.
  assert.match(
    GATE_SRC,
    /5\+\s*(?:Wen\s*\+\s*Sea|deploys)/i,
    "5+ deploy failures across Wen + Sea pinned",
  );
});

test("check-use-server-exports — cross-stack port anchors (VRG + cannagent + inv + GW v2.97.D3)", () => {
  for (const stack of ["VRG", "cannagent", "\\binv\\b", "GW\\s+v2\\.97\\.D3"]) {
    assert.match(GATE_SRC, new RegExp(stack), `cross-stack origin ${stack}`);
  }
});

test("check-use-server-exports — Turbopack invalidates-ALL-exports + 'no exports at all' mechanism", () => {
  // The MECHANISM + misleading-error-shape. Pin so devs Googling the
  // error land on this gate's header.
  assert.match(
    GATE_SRC,
    /invalidates\s+ALL\s+exports/i,
    "invalidates-ALL-exports mechanism prose",
  );
  assert.match(
    GATE_SRC,
    /no\s*exports\s*at[\s\S]+?all/i,
    "Turbopack literal 'no exports at all' error string pinned",
  );
  assert.match(
    GATE_SRC,
    /misleading/i,
    "misleading-error-shape rationale documented",
  );
});

test("check-use-server-exports — 6 allowed export shapes pinned", () => {
  // All 6 must be in detection branches. Drift drops one = false-positive.
  for (const shape of [
    "export async function",
    "export (type|interface|enum)",
    "export\\s*\\*\\s*from",
    "export\\s*\\{[^}]*\\}\\s*from",
    "export default async function",
  ]) {
    assert.ok(
      GATE_SRC.includes(shape),
      `allowed shape "${shape}" must be in detection`,
    );
  }
});

test("check-use-server-exports — `use server` directive detection (first-non-comment-line)", () => {
  // Pin the head-strip regex that removes leading whitespace + comments
  // before checking the directive.
  assert.ok(
    GATE_SRC.includes("^(\\s|\\/\\/[^\\n]*\\n|\\/\\*[\\s\\S]*?\\*\\/)*"),
    "head-strip regex (whitespace + line + block comments) pinned",
  );
  assert.ok(
    GATE_SRC.includes('["\']use server["\']\\s*;'),
    "use-server directive regex pinned",
  );
});

test("check-use-server-exports — SCAN scope = app + lib (no components)", () => {
  // Server actions only live in app/ + lib/. components/ runs client.
  assert.ok(
    GATE_SRC.includes('walk(join(cwd, "app"))') &&
      GATE_SRC.includes('walk(join(cwd, "lib"))'),
    "SCAN scope: app + lib only pinned",
  );
});

test("check-use-server-exports — walker skips __tests__ + node_modules + dot-dirs", () => {
  assert.match(
    GATE_SRC,
    /name === "__tests__"/,
    "__tests__ skip pinned",
  );
  assert.match(
    GATE_SRC,
    /name === "node_modules"/,
    "node_modules skip pinned",
  );
  assert.match(GATE_SRC, /name\.startsWith\("\."\)/, "dot-dir skip pinned");
});

test("check-use-server-exports — fix-recipe: move const/sync exports to sibling module", () => {
  assert.match(
    GATE_SRC,
    /sibling\s+module/i,
    "fix recipe: move to sibling module pinned",
  );
});

test("check-use-server-exports — --warn opt-in + strict-by-default", () => {
  assert.match(
    GATE_SRC,
    /warnOnly\s*=\s*process\.argv\.includes\("--warn"\)/,
    "--warn flag binding pinned",
  );
  assert.match(GATE_SRC, /process\.exit\(1\)/, "fail-loud exit 1 pinned");
});
