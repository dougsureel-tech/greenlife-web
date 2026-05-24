// Pin tests for scripts/check-email-preheader.mjs.
//
// 19th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: transactional HTML emails that open with `<p>Hi {name},</p>`
// produce uninformative inbox-list previews ("Hi Sarah,"). Mail clients
// (Gmail/Apple Mail/Outlook/Spark/iOS Mail) preview the FIRST visible
// text. Canonical fix: hidden preheader span with `mso-hide: all` —
// the Outlook hide-marker that all Mailchimp/Litmus/email frameworks use.
//
// Cross-stack port from cannagent v6.4285 + glw v18.605 + GW doctrine.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-email-preheader.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-email-preheader.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-email-preheader — cross-stack port anchors preserved", () => {
  // Doctrine traces back to GW + cannagent + glw — drift cleans up
  // would lose the cross-stack provenance.
  assert.match(GATE_SRC, /cannagent\s+v6\.4285/i, "cannagent v6.4285 origin");
  assert.match(GATE_SRC, /glw\s+v18\.605/i, "glw v18.605 origin");
  assert.match(GATE_SRC, /GW\s+doctrine/, "GW doctrine origin");
});

test("check-email-preheader — uninformative-preview failure-mode documented", () => {
  // The WHY — "Hi Sarah," vs context-rich preview. Pin the mechanism so
  // future cleanup doesn't demote to "stylistic".
  assert.match(
    GATE_SRC,
    /Hi\s+Sarah/i,
    "uninformative-preview example pinned",
  );
  assert.match(
    GATE_SRC,
    /inbox\s+list/i,
    "inbox-list preview mechanism documented",
  );
  assert.match(
    GATE_SRC,
    /preheader/i,
    "preheader term used in doctrine",
  );
});

test("check-email-preheader — mail-client coverage list preserved", () => {
  // 5 clients listed — Gmail/Apple Mail/Outlook/Spark/iOS Mail.
  // Pin the coverage breadth so future devs understand it's cross-client.
  for (const client of ["Gmail", "Apple Mail", "Outlook", "Spark", "iOS Mail"]) {
    assert.ok(
      GATE_SRC.includes(client),
      `mail client ${client} must be listed`,
    );
  }
});

test("check-email-preheader — PREHEADER_SIGNATURE = mso-hide:all (Outlook canonical)", () => {
  // The detection regex. `mso-hide: all` is the canonical Mailchimp/
  // Litmus signal — drift to non-mso variant breaks portability.
  assert.match(
    GATE_SRC,
    /PREHEADER_SIGNATURE\s*=\s*\/mso-hide:\\s\*all\//,
    "PREHEADER_SIGNATURE pinned to mso-hide:\\s*all",
  );
});

test("check-email-preheader — FILENAME_PATTERN = -email.ts$ (scopes scan)", () => {
  // Only files ending in `-email.ts` qualify. Drift opens up false-pos
  // on non-email files in lib/.
  assert.match(
    GATE_SRC,
    /FILENAME_PATTERN\s*=\s*\/-email\\\.ts\$\//,
    "-email.ts$ filename filter pinned",
  );
});

test("check-email-preheader — 4 HTML_BUILDER_SIGNATURES pinned (array + buildHtml + DOCTYPE + html-tag)", () => {
  // The structural-builder detector. 4 shapes catch every email-build
  // convention across our stacks. Drift drops one = miss.
  assert.ok(
    GATE_SRC.includes("const\\s+html\\s*=\\s*\\["),
    "cannagent array-init shape pinned",
  );
  assert.ok(
    GATE_SRC.includes("\\bbuildHtml\\s*\\("),
    "buildHtml helper-call shape pinned",
  );
  assert.ok(
    GATE_SRC.includes("<!DOCTYPE\\s+html>"),
    "DOCTYPE shape pinned",
  );
  assert.ok(
    GATE_SRC.includes("<html[\\s>]"),
    "<html-tag shape pinned",
  );
});

test("check-email-preheader — LIB_DIR scoping (lib/ only)", () => {
  // Scope: lib/ only — email builders never live in app/ or components/.
  assert.match(
    GATE_SRC,
    /LIB_DIR\s*=\s*join\(ROOT,\s*["']lib["']\)/,
    "LIB_DIR scope pinned to lib/",
  );
});

test("check-email-preheader — non-HTML-builder files skipped (early-continue)", () => {
  // Files that match `-email.ts$` but DON'T build HTML (helpers,
  // validators, common-sender wrappers) early-continue. Pin so a
  // tightening doesn't false-positive on them.
  assert.match(
    GATE_SRC,
    /if\s*\(!buildsHtml\)\s*continue/,
    "non-HTML-builder early-continue pinned",
  );
});

test("check-email-preheader — fix-guidance shows canonical preheader span", () => {
  // Self-documenting fix — exact span shape with all 5 hide CSS props.
  // Pin so the recipe stays copy-pasteable.
  for (const prop of [
    "display:none",
    "font-size:0",
    "line-height:0",
    "max-height:0",
    "overflow:hidden",
    "mso-hide:all",
  ]) {
    assert.ok(
      GATE_SRC.includes(prop),
      `fix-recipe must include ${prop} CSS prop`,
    );
  }
});

test("check-email-preheader — differentiated exit codes (1-or-warn / 2=lib-unreadable)", () => {
  // Default-strict via WARN_ONLY ? 0 : 1 + exit(2) on unreadable lib/.
  assert.ok(
    GATE_SRC.includes("process.exit(WARN_ONLY ? 0 : 1)"),
    "default-strict (warn-or-1) exit policy pinned",
  );
  assert.ok(GATE_SRC.includes("process.exit(2)"), "exit 2 (lib unreadable) pinned");
});
