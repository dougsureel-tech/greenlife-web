#!/usr/bin/env node
/**
 * Cross-store URL leak arc-guard (Wen — `greenlife-web`).
 *
 * Pins memory pin `feedback_cross_store_url_leak_pattern` against
 * re-introduction. Sister of `seattle-cannabis-web/scripts/check-cross-store-url-leak.mjs`.
 *
 * When the Sea public site was forked from Wen's (2026-05-04),
 * the bug went Sea → Wen. The reverse can happen on a Wen-side
 * codemod or copy-paste from a Sea page back into Wen. Guard
 * rule: NO `seattle-cannabis-co.vercel.app` literal in Wen's
 * app/, lib/, components/. Acceptable matches: explicit
 * cross-store nav links (e.g. SiteFooter pointing to the
 * sister-store homepage), CORS allowlists, dual-store
 * enumerations in admin copy. Mark with `// cross-store-url-leak:ignore`
 * or rely on the comment-skip filter.
 *
 * Exits 1 on any hit.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const cwd = process.cwd();
const SCAN_DIRS = [
  join(cwd, "app"),
  join(cwd, "lib"),
  join(cwd, "components"),
];

// Wen code MUST NOT reference Sea's canonical inv URL.
const WRONG_URL = "seattle-cannabis-co.vercel.app";

// Acceptable: customer-facing nav links to the sister store's
// public homepage (`https://www.seattlecannabis.co`, `https://seattlecannabis.co`)
// — those are NOT inv URLs and are intentional cross-store links.
// We only flag the inv-URL form.

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    if (name === "node_modules" || name === ".next" || name === "__tests__" || name.startsWith(".")) continue;
    const p = join(dir, name);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, out);
    else if (st.isFile() && /\.(ts|tsx|jsx|mjs)$/.test(p)) out.push(p);
  }
  return out;
}

const files = SCAN_DIRS.flatMap((d) => walk(d));
const offenders = [];

for (const f of files) {
  const lines = readFileSync(f, "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) continue;
    if (line.includes(WRONG_URL) && !line.includes("eslint-disable") && !line.includes("cross-store-url-leak:ignore")) {
      offenders.push({
        file: f.replace(cwd + "/", ""),
        lineNum: i + 1,
        line: trimmed,
      });
    }
  }
}

if (offenders.length > 0) {
  console.error(`[check-cross-store-url-leak] FAIL — ${offenders.length} hit(s) of "${WRONG_URL}" in Wen code.`);
  console.error(`  Memory pin: feedback_cross_store_url_leak_pattern`);
  console.error(``);
  console.error(`  Wen code MUST NOT reference Sea's inv URL. If you need to`);
  console.error(`  link to Sea's public site, use https://www.seattlecannabis.co`);
  console.error(`  (apex/www), not the inv-vercel form.`);
  console.error(``);
  for (const o of offenders) {
    console.error(`  ${o.file}:${o.lineNum}`);
    console.error(`    ${o.line}`);
  }
  console.error(``);
  console.error(`  Bypass (rare): append // cross-store-url-leak:ignore to the line.`);
  process.exit(1);
}

console.log(`✓ check-cross-store-url-leak: ${files.length} files scanned, 0 "${WRONG_URL}" references in Wen code (memory pin feedback_cross_store_url_leak_pattern pinned)`);
