#!/usr/bin/env node
/**
 * Email preheader-span arc-guard.
 *
 * Cross-stack port from cannagent v6.4285 + glw v18.605 + GW doctrine.
 * Pins the preheader-span pattern across `lib/*-email.ts` HTML email
 * builders against regression.
 *
 * Bug class: transactional HTML emails start with `<p>Hi {name},</p>`
 * directly under the body wrapper. Mail clients (Gmail / Apple Mail /
 * Outlook / Spark / iOS Mail) preview the first visible text in the
 * inbox list — uninformative "Hi Sarah," instead of a context-rich
 * one-line summary.
 *
 * Canonical fix: hidden preheader span using the indexed-but-not-rendered
 * CSS pattern with `mso-hide: all` (the Outlook-specific hide marker
 * that's the canonical signal Mailchimp / Litmus / all email-template
 * frameworks use).
 *
 * Scc adaptation: detects HTML builders via either:
 *   - `const html = [` (cannagent array-init shape)
 *   - `buildHtml(` call OR explicit `<!DOCTYPE` / `<html` in the file
 *
 * Allowlist: files that aren't HTML email builders (the helper,
 * validator, etc.) are skipped via FILENAME_PATTERN + structural check.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const LIB_DIR = join(ROOT, "lib");
const WARN_ONLY = process.argv.includes("--warn");

const FILENAME_PATTERN = /-email\.ts$/;

const PREHEADER_SIGNATURE = /mso-hide:\s*all/;

// HTML builder shapes — match any of:
//   (a) `const html = [`  (cannagent array-init)
//   (b) `buildHtml(`  (scc helper-call wrap)
//   (c) `<!DOCTYPE html>` / `<html` in template literal (any direct HTML)
const HTML_BUILDER_SIGNATURES = [
  /const\s+html\s*=\s*\[/,
  /\bbuildHtml\s*\(/,
  /<!DOCTYPE\s+html>/i,
  /<html[\s>]/,
];

const candidateFiles = [];
let entries;
try {
  entries = readdirSync(LIB_DIR);
} catch (err) {
  console.error(`[check-email-preheader] FAIL: cannot read ${LIB_DIR}`);
  console.error(`  ${err.message}`);
  process.exit(2);
}
for (const name of entries) {
  if (!FILENAME_PATTERN.test(name)) continue;
  const full = join(LIB_DIR, name);
  let stat;
  try { stat = statSync(full); } catch { continue; }
  if (!stat.isFile()) continue;
  candidateFiles.push(full);
}

const offenders = [];
const passed = [];
for (const file of candidateFiles) {
  const rel = relative(ROOT, file);
  let src;
  try { src = readFileSync(file, "utf8"); } catch { continue; }

  // Skip files that don't build HTML.
  const buildsHtml = HTML_BUILDER_SIGNATURES.some((sig) => sig.test(src));
  if (!buildsHtml) continue;

  if (!PREHEADER_SIGNATURE.test(src)) {
    offenders.push(rel);
  } else {
    passed.push(rel);
  }
}

if (offenders.length === 0) {
  console.log(
    `✓ check-email-preheader: ${passed.length} HTML email builder(s) all carry the preheader span (mso-hide: all signature)`,
  );
  process.exit(0);
}

const header = WARN_ONLY ? "⚠️  check-email-preheader (warn)" : "✗ check-email-preheader";
console.error(`\n${header}: ${offenders.length} HTML email builder(s) missing the hidden preheader span\n`);
for (const o of offenders) {
  console.error(`  ${o}`);
}
console.error("\nDoctrine: transactional emails must open with a hidden preheader span containing");
console.error("context-rich preview copy. Mail-client inbox lists show the preheader as the");
console.error("preview line — without it, the preview is uninformative ('Hi Sarah,').\n");
console.error("Fix shape:");
console.error('  <div style="display:none;font-size:0;line-height:0;max-height:0;overflow:hidden;mso-hide:all;">');
console.error('    {preheader copy — 40-100 chars summarizing the email}');
console.error('  </div>\n');

process.exit(WARN_ONLY ? 0 : 1);
