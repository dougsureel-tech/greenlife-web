#!/usr/bin/env node
/**
 * "use server" non-async-export gate.
 *
 * Cross-stack port from VRG + cannagent + inv + GW v2.97.D3. Next 16 /
 * Turbopack invalidates ALL exports in a "use server" file when ANY
 * top-level export is non-async. If a single client component imports
 * the module by-name, the build fails with "module has no exports at
 * all" — the failure shape is misleading because the module DOES export
 * the requested symbol, but Turbopack rejects the whole module's export
 * shape.
 *
 * Live incident: Inventory App v229.005 / v231.005 (2026-05-08) —
 * preview-actions.ts had `export const VMI_ADMIN_PREVIEW_COOKIE = "..."`
 * alongside two async actions. 5+ Wen + Sea deploys failed in a row.
 *
 * Allowed: `export async function`, `export type/interface/enum`,
 * `export * from "..."`, `export { X } from "..."`, `export default async`.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const cwd = process.cwd();
const warnOnly = process.argv.includes("--warn");

function walk(dir, hits = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return hits; }
  for (const name of entries) {
    const p = join(dir, name);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) {
      if (name === "node_modules" || name.startsWith(".") || name === "__tests__") continue;
      walk(p, hits);
    } else if (st.isFile() && (p.endsWith(".ts") || p.endsWith(".tsx"))) {
      hits.push(p);
    }
  }
  return hits;
}

const files = [...walk(join(cwd, "app")), ...walk(join(cwd, "lib"))];
const offenders = [];

for (const f of files) {
  let body;
  try { body = readFileSync(f, "utf-8"); } catch { continue; }
  const head = body.replace(/^(\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*/, "");
  if (!/^["']use server["']\s*;/.test(head)) continue;

  const lines = body.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/^export\s/.test(line)) continue;
    if (/^export async function\s/.test(line)) continue;
    if (/^export (type|interface|enum)\s/.test(line)) continue;
    if (/^export\s*\*\s*from\s/.test(line)) continue;
    if (/^export\s*\{[^}]*\}\s*from\s/.test(line)) continue;
    if (/^export default async function\s/.test(line)) continue;

    offenders.push({
      file: f.replace(cwd + "/", ""),
      line: i + 1,
      text: line.trim().slice(0, 120),
    });
  }
}

if (offenders.length === 0) {
  console.log(`[check-use-server-exports] OK — ${files.length} files scanned, no non-async-function exports in "use server" modules.`);
  process.exit(0);
}

const banner = "═".repeat(71);
console.error("");
console.error(banner);
console.error(`${warnOnly ? "⚠️" : "🚨"}  "use server" non-async export — ${warnOnly ? "warning" : "build blocked"}`);
console.error(banner);
console.error(`Found ${offenders.length} offender${offenders.length === 1 ? "" : "s"}:`);
for (const o of offenders) {
  console.error(`  ${o.file}:${o.line}`);
  console.error(`    ${o.text}`);
}
console.error("\nWhy: Next 16 / Turbopack invalidates ALL exports in a 'use server' file when");
console.error("ANY top-level export is non-async. Move const/sync exports to a sibling module.");
console.error("Inv live incident: v229.005-v231.005 preview-actions.ts — 5+ deploys failed.");
console.error(banner + "\n");

if (warnOnly) process.exit(0);
process.exit(1);
