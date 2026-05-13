#!/usr/bin/env node
/**
 * Rate-limit-bypass empty-string-trap gate.
 *
 * Cross-stack port from inv v402.945 + sister scc/sureel/GW arc-guards
 * shipped same day. 2026-05-13 — v32.605 swept 5 inline `x-forwarded-for`
 * IP-extraction sites where `?? "unknown"` only caught null/undefined,
 * letting whitespace-only headers collapse to `""` and bucket all such
 * requests in the same rate-limit key. Real security concern: per-IP
 * brute-force/enumeration/password-spray defenses structurally depended
 * on the per-IP key being per-IP.
 *
 * Canonical fix: `getClientIp(headers: Headers)` from `@/lib/client-ip`
 * which uses a truthy-guard after trim so empty/whitespace fall through
 * to "unknown" instead of `""`.
 *
 * This gate prevents future regressions:
 *   - Any new `request.headers.get("x-forwarded-for")?...?? "unknown"`
 *     pattern fails the push.
 *
 * What it does NOT flag:
 *   - `?? ""` fallbacks (downstream `if (!ip)` correctly treats both as
 *     missing)
 *   - `getClientIp(...)` call sites (the SoT itself)
 *   - `lib/client-ip.ts` (the SoT file)
 *   - audit-log logging-only `.slice(0, 80)` truncation — opt-out via
 *     inline comment `// arc-guard: xff-nullish-trap:ignore`
 *   - `lib/version.ts` / `lib/changelog*.ts` (always carry prose
 *     describing the bug — file-level allow-list)
 *
 * Anchored via `import.meta.url` per
 * `feedback_arc_guard_cwd_relative_path_trap`.
 *
 * Usage: `node scripts/check-no-xff-nullish-trap.mjs [--warn]`
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(SCRIPT_DIR, "..");
const SCAN_ROOTS = [join(REPO_ROOT, "app"), join(REPO_ROOT, "lib"), join(REPO_ROOT, "components")];
const WARN_ONLY = process.argv.includes("--warn");

// changelog/version + the SoT itself always carry prose describing the
// bug pattern — exempt at the file level.
const FILE_ALLOWLIST = new Set([
  "lib/version.ts",
  "lib/changelog.ts",
  "lib/client-ip.ts",
]);

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const entry of entries) {
    if (entry === "node_modules" || entry === ".next" || entry === "__tests__") continue;
    const full = join(dir, entry);
    let s;
    try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) walk(full, out);
    else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) out.push(full);
  }
  return out;
}

const XFF_TRAP_RE = /x-forwarded-for[\s\S]{0,120}?\?\?\s*["'][^"'\s][^"']*["']/i;
const IGNORE_MARKER = /arc-guard:\s*xff-nullish-trap:ignore/;

const offenders = [];

for (const root of SCAN_ROOTS) {
  for (const file of walk(root)) {
    let src;
    try { src = readFileSync(file, "utf8"); } catch { continue; }
    if (IGNORE_MARKER.test(src)) continue;

    const relPath = relative(REPO_ROOT, file).split(sep).join("/");
    if (FILE_ALLOWLIST.has(relPath)) continue;

    const lines = src.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const slice = lines.slice(i, Math.min(i + 5, lines.length)).join("\n");
      if (XFF_TRAP_RE.test(slice)) {
        if (/x-forwarded-for/i.test(lines[i])) {
          offenders.push({
            file: relPath,
            line: i + 1,
            snippet: lines[i].trim().slice(0, 160),
          });
          const matchInSlice = slice.match(XFF_TRAP_RE);
          if (matchInSlice) {
            const newlinesInMatch = (matchInSlice[0].match(/\n/g) || []).length;
            i += newlinesInMatch;
          }
        }
      }
    }
  }
}

if (offenders.length === 0) {
  console.log(
    `[check-no-xff-nullish-trap] OK — 0 inline 'x-forwarded-for ... ?? "<word>"' sites; all rate-limit IP-extract goes through getClientIp() SoT.`,
  );
  process.exit(0);
}

console.error(`[check-no-xff-nullish-trap] ${WARN_ONLY ? "WARN" : "FAIL"} — ${offenders.length} inline rate-limit-IP-extract site(s) using '?? "<word>"' instead of getClientIp():`);
for (const o of offenders) {
  console.error(`  ${o.file}:${o.line}`);
  console.error(`    ${o.snippet}`);
}
console.error("");
console.error("Fix: replace the inline IP-extraction with:");
console.error("    import { getClientIp } from \"@/lib/client-ip\";");
console.error("    const ip = getClientIp(req.headers);");
console.error("");
console.error("Or opt-out (audit-log truncation, not a rate-limit key) via inline comment:");
console.error("    // arc-guard: xff-nullish-trap:ignore");

process.exit(WARN_ONLY ? 0 : 1);
