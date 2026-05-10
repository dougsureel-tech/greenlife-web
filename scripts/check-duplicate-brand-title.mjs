/**
 * Duplicate-brand-title arc-guard.
 *
 * Pins T24 + T25 fixes against future regression. The bug class:
 *   - Layout sets `title.template = '%s | Green Life Cannabis'`
 *   - Page-level `metadata.title` body bakes in the brand:
 *     `title: 'Apply to work at Green Life Cannabis'`
 *   - Renderer concatenates → `Apply to work at Green Life Cannabis | Green Life Cannabis`
 *   - Result: brand appears TWICE in the rendered <title>
 *
 * Sites where this bit:
 *   - GW v2.93.90 telehealth template (T5)
 *   - GW v2.94.60 /about + /get-started (T24)
 *   - glw v14.705 + scc v13.2305 /apply layout (T25)
 *
 * This gate fails the build when ANY page-level metadata.title body
 * contains the brand name, since the layout template will append it.
 * Skips files that use `title: { absolute: ... }` (intentional bypass).
 *
 * Brand strings are project-specific (glw = "Green Life Cannabis"; scc
 * would use "Seattle Cannabis Co"). Read from `lib/store.ts` STORE.name
 * to avoid hardcoding here.
 *
 * Allowlist:
 *   - app/layout.tsx — the SOURCE of the template; legitimately mentions brand
 *   - lib/* — backend/API/email helpers (not title-template-aware)
 *
 * Usage: `pnpm check:duplicate-brand-title` (manual run; sister of
 * check-og-completeness + check-site-url-defense arc-guards).
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const WARN_ONLY = process.argv.includes("--warn");

// Read brand name from lib/store.ts. Fallback hardcoded for repo
// independence — script copies cleanly between glw + scc.
let BRAND_NAME = "Green Life Cannabis";
try {
  const storeFile = readFileSync(join(ROOT, "lib/store.ts"), "utf8");
  const m = storeFile.match(/name:\s*["']([^"']+)["']/);
  if (m) BRAND_NAME = m[1];
} catch {
  // fallback to hardcoded BRAND_NAME above
}

const EXEMPT = new Set([
  "app/layout.tsx",  // The SOURCE of title.template, legitimately mentions brand
]);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (entry === "node_modules" || entry === ".next" || entry === ".git" || entry === "scripts") continue;
      out.push(...walk(p));
    } else if (s.isFile() && (p.endsWith(".ts") || p.endsWith(".tsx"))) {
      out.push(p);
    }
  }
  return out;
}

// Strip line + block comments first so we don't false-match commented-out
// title declarations. Same trick as check-og-completeness.
function stripComments(src) {
  let stripped = src.replace(/\/\*[\s\S]*?\*\//g, (m) => " ".repeat(m.length));
  stripped = stripped.replace(/\/\/[^\n]*/g, (m) => " ".repeat(m.length));
  return stripped;
}

// Find every `title: ... ,` (non-shorthand, non-`{ absolute }`) in the file
// that is at the TOP LEVEL of a Metadata object — not inside openGraph or
// twitter sub-blocks (where brand-in-title is intentional + harmless).
//
// Heuristic: scan back from each `title:` match looking for the nearest
// unclosed `openGraph: {` / `twitter: {` opening line. If found within
// the same brace level, it's a sub-block title — skip. Otherwise it's
// top-level metadata.title — check for brand.
function findTitleDeclarations(src) {
  const stripped = stripComments(src);
  const declarations = [];
  // Match `title:` followed by a value. Capture the value up to the
  // closing `,` or `}` (whichever comes first at the right depth).
  const re = /(?:^|[\s,{])title\s*:\s*/g;
  let match;
  while ((match = re.exec(stripped)) !== null) {
    const valStart = match.index + match[0].length;
    // Skip object-literal values: `title: {` (used for absolute / template).
    if (stripped[valStart] === "{") continue;
    // Skip if inside openGraph or twitter sub-block. Walk back from the
    // match looking at brace depth; if we hit `openGraph:` or `twitter:`
    // BEFORE returning to depth 0, this title is in a sub-block.
    let backDepth = 0;
    let inSubBlock = false;
    for (let j = match.index - 1; j >= 0; j--) {
      const c = stripped[j];
      if (c === "}") backDepth++;
      else if (c === "{") {
        if (backDepth === 0) {
          // Found the enclosing opening brace. Check what field it belongs to.
          const lineStart = stripped.lastIndexOf("\n", j) + 1;
          const lineToBrace = stripped.slice(lineStart, j);
          if (/\b(openGraph|twitter|verification|other|appleWebApp|icons|alternates|robots)\s*:\s*$/.test(lineToBrace)) {
            inSubBlock = true;
          }
          break;
        }
        backDepth--;
      }
    }
    if (inSubBlock) continue;
    // Read the value until newline-then-newfield or closing-brace at depth 0
    let i = valStart;
    let depth = 0;
    let inString = null;  // " ' or `
    while (i < stripped.length) {
      const c = stripped[i];
      if (inString) {
        if (c === inString && stripped[i - 1] !== "\\") inString = null;
        else if (c === "\\") i++;  // skip next
      } else {
        if (c === '"' || c === "'" || c === "`") inString = c;
        else if (c === "{" || c === "(" || c === "[") depth++;
        else if (c === "}" || c === ")" || c === "]") {
          if (depth === 0) break;
          depth--;
        }
        else if (c === "," && depth === 0) break;
        else if (c === "\n" && depth === 0 && !inString) {
          // Look for a newline that ends the declaration (next non-blank line is a closing brace OR a new field)
          break;
        }
      }
      i++;
    }
    const value = stripped.slice(valStart, i).trim();
    const line = src.slice(0, match.index).split("\n").length;
    declarations.push({ value, line });
  }
  return declarations;
}

const SCAN_DIRS = ["app"]
  .map((d) => join(ROOT, d))
  .filter((p) => {
    try { return statSync(p).isDirectory(); } catch { return false; }
  });

const offenders = [];
const allFiles = SCAN_DIRS.flatMap(walk);
for (const file of allFiles) {
  const rel = relative(ROOT, file);
  if (EXEMPT.has(rel)) continue;
  const src = readFileSync(file, "utf8");
  const decls = findTitleDeclarations(src);
  for (const { value, line } of decls) {
    // Check the title value contains the brand name. Match either the
    // literal brand name OR `${STORE.name}` template substitution (which
    // resolves to the brand at runtime).
    if (value.includes(BRAND_NAME) || /\$\{\s*STORE\.name\s*\}/.test(value)) {
      offenders.push({ file: rel, line, value: value.slice(0, 100) });
    }
  }
}

if (offenders.length === 0) {
  console.log(`✓ check-duplicate-brand-title: 0 offenders across ${allFiles.length} files (brand=${BRAND_NAME})`);
  process.exit(0);
}

const header = WARN_ONLY ? "⚠️  check-duplicate-brand-title (warn)" : "✗ check-duplicate-brand-title";
console.error(`\n${header}: ${offenders.length} title(s) bake "${BRAND_NAME}" into the body — title.template will append it again, producing a duplicate-brand SERP title\n`);
for (const o of offenders) {
  console.error(`  ${o.file}:${o.line}`);
  console.error(`    title: ${o.value}`);
}
console.error("\nWhy: app/layout.tsx sets `title.template = '%s | <BRAND>'`. Page-level");
console.error("`title: 'X <BRAND>'` body produces `<title>X <BRAND> | <BRAND></title>` — brand twice.");
console.error("\nFix shapes:");
console.error("  - Drop brand from title body: `title: 'About Us'` → renders 'About Us | <BRAND>'");
console.error("  - Use title.absolute when the body needs the brand: `title: { absolute: 'X | <BRAND>' }`");
console.error("\nHistory of this bug class:");
console.error("  - GW telehealth template (T5, v2.93.90)");
console.error("  - GW /about + /get-started (T24, v2.94.60)");
console.error("  - glw + scc /apply layout (T25, v14.705 + v13.2305)");
console.error("  - this gate added v14.905 (T27) to prevent future regressions\n");
process.exit(WARN_ONLY ? 0 : 1);
