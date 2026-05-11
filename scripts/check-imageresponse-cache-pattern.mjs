/**
 * ImageResponse cache-control pattern arc-guard.
 *
 * Cross-stack port from cannagent v6.0605 + GW + sureel + VRG. Bug class:
 * edge-runtime `ImageResponse` from next/og silently strips `s-maxage`
 * and `stale-while-revalidate` directives from the wire when passed via
 * the `headers` option. Every share-preview fetch re-renders via Satori
 * uncached.
 *
 * Cannagent's 2026-05-10 incident: every probed cannagent OG endpoint
 * served `cache-control: public, max-age=0` until v6.0605 fix wave.
 *
 * Scc adaptation: walks `app/` (no src/ wrapper). 5+ OG image routes.
 *
 * Layered-cache escape hatch: file using `Vercel-CDN-Cache-Control` or
 * `CDN-Cache-Control` carrying s-maxage is OK — those headers are NOT
 * stripped (sister sureel v0.X — feedback_imageresponse_cache_pattern).
 *
 * False-positive opt-out: `// imageresponse-cache:ignore` in file.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const REPO_ROOT = process.cwd();
const SCAN_DIRS = ["app", "components", "lib"];

function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry === "node_modules" || entry === ".next") continue;
    const full = join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) out.push(...walk(full));
    else if (/\.(tsx?|jsx?)$/.test(entry)) out.push(full);
  }
  return out;
}

const files = SCAN_DIRS.flatMap((d) => walk(join(REPO_ROOT, d)));

const violations = [];
for (const file of files) {
  const content = readFileSync(file, "utf8");
  if (content.includes("imageresponse-cache:ignore")) continue;
  if (!/from\s+["']next\/og["']/.test(content)) continue;
  if (!/new\s+ImageResponse\s*\(/.test(content)) continue;

  const hasLayeredCdnCache =
    /["']?(?:Vercel-)?CDN-Cache-Control["']?\s*:\s*["'][^"']*s-maxage/i.test(content);

  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*\/\//.test(line)) continue;
    if (/["']cache-control["']\s*:.*max-age=0/i.test(line)) {
      if (hasLayeredCdnCache) continue;
      violations.push({
        file: relative(REPO_ROOT, file),
        line: i + 1,
        snippet: line.trim(),
      });
    }
  }
}

if (violations.length > 0) {
  console.error(
    "[check-imageresponse-cache-pattern] ✗ ImageResponse route(s) using max-age=0 cache-control WITHOUT layered CDN-Cache-Control:",
  );
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}`);
    console.error(`    ${v.snippet}`);
  }
  console.error("");
  console.error("Bug class: edge-runtime ImageResponse silently strips s-maxage from wire.");
  console.error("Fix: `headers: { \"cache-control\": \"public, max-age=3600, s-maxage=3600\" }`");
  console.error("Opt-out: `// imageresponse-cache:ignore` in file.");
  process.exit(1);
}

console.log(
  `[check-imageresponse-cache-pattern] OK — ${files.length} files scanned, no max-age=0 cache-control offenders in ImageResponse routes.`,
);
