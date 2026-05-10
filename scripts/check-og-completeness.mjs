/**
 * openGraph completeness arc-guard.
 *
 * Pins the T19/T20/T21 shallow-overwrite-class fixes against regression.
 * Next 16 metadata cascade SHALLOWLY overwrites `openGraph: { ... }` —
 * when a child page sets the openGraph block, its block REPLACES the
 * parent's entirely. Any field not explicitly re-emitted in the child
 * silently disappears from rendered HTML.
 *
 * Three sweeps confirmed this dropping in production over T19-T21:
 *   - og:type silently dropped on 13 pages → fixed v14.005 (glw)
 *   - og:site_name silently dropped on 17 pages → fixed v14.105 (glw)
 *   - og:url silently dropped on 4 pages → fixed v14.205 (glw)
 *
 * (Also og:locale earlier in v11.305.)
 *
 * This gate fails the build when ANY page-level `openGraph: { ... }`
 * block is missing one of the required fields. Required fields:
 *
 *   - type      (website | article | etc — pages render different OG types)
 *   - locale    (en_US — single-locale site)
 *   - siteName  (STORE.name — branded share-card footer)
 *   - title     (page-specific or layout-default-cascading)
 *   - description (page-specific or layout-default-cascading)
 *   - url       (canonical-equivalent — the page's actual URL)
 *   - images    (per-route OG image override)
 *
 * The check is HEURISTIC, not AST-perfect — looks for `key:` substrings
 * inside each `openGraph: { ... }` block via brace-depth tracking. False
 * negatives possible if a key is computed via spread (e.g. `...obj`) but
 * those should be rare on static metadata + we'd rather have an
 * occasionally-noisy check than no defense.
 *
 * Usage: `node scripts/check-og-completeness.mjs` (manual run).
 * Add to pre-push hook by appending to the build-gates chain.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const WARN_ONLY = process.argv.includes("--warn");

const REQUIRED_FIELDS = ["type", "locale", "siteName", "title", "description", "url", "images"];

// Skip the layout file — it's the SOURCE of the cascade defaults and
// thus has all fields. We're checking that every CHILD that shadows
// openGraph re-emits the full set.
const EXEMPT = new Set([
  "app/layout.tsx",
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

// Find every `openGraph: {` block in the source (ignoring those inside
// `// ...` line comments + `/* ... */` block comments). Returns the
// content of each block (between matched braces) along with the line.
function findOpenGraphBlocks(src) {
  const blocks = [];
  // Strip line + block comments so the regex doesn't false-match
  // commented-out code.
  let stripped = src.replace(/\/\*[\s\S]*?\*\//g, (m) => " ".repeat(m.length));
  stripped = stripped.replace(/\/\/[^\n]*/g, (m) => " ".repeat(m.length));
  const re = /openGraph\s*:\s*\{/g;
  let match;
  while ((match = re.exec(stripped)) !== null) {
    const start = match.index + match[0].length;
    let depth = 1;
    let i = start;
    while (i < stripped.length && depth > 0) {
      if (stripped[i] === "{") depth++;
      else if (stripped[i] === "}") depth--;
      i++;
    }
    const content = src.slice(start, i - 1);
    const line = src.slice(0, match.index).split("\n").length;
    blocks.push({ content, line });
  }
  return blocks;
}

function missingFields(blockContent) {
  return REQUIRED_FIELDS.filter((f) => {
    // Match `field:` (explicit) OR `field,` / `field }` (object-property
    // shorthand — `{ title }` desugars to `{ title: title }` and still
    // emits the field at runtime). Both forms are valid JS metadata, so
    // both should pass the gate.
    const re = new RegExp(`(^|[\\s,{])${f}(\\s*[:,}]|\\s+as\\s)`);
    return !re.test(blockContent);
  });
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
  const blocks = findOpenGraphBlocks(src);
  for (const { content, line } of blocks) {
    const missing = missingFields(content);
    if (missing.length > 0) {
      offenders.push({ file: rel, line, missing });
    }
  }
}

if (offenders.length === 0) {
  console.log(`✓ check-og-completeness: 0 offenders across ${allFiles.length} files`);
  process.exit(0);
}

const header = WARN_ONLY ? "⚠️  check-og-completeness (warn)" : "✗ check-og-completeness";
console.error(`\n${header}: ${offenders.length} openGraph block(s) missing required fields\n`);
for (const o of offenders) {
  console.error(`  ${o.file}:${o.line}  missing: ${o.missing.join(", ")}`);
}
console.error("\nWhy: Next 16 metadata cascade SHALLOWLY overwrites openGraph — every child");
console.error("page-level openGraph block must re-emit ALL required fields, otherwise they");
console.error("silently disappear from rendered <meta property=\"og:*\"> tags. Required:");
console.error(`  ${REQUIRED_FIELDS.join(", ")}`);
console.error("\nHistory of this bug class:");
console.error("  - og:locale silent-drop → swept v11.305 (glw)");
console.error("  - og:type silent-drop → swept v14.005 (T19)");
console.error("  - og:site_name silent-drop → swept v14.105 (T20)");
console.error("  - og:url silent-drop → swept v14.205 (T21)");
console.error("  - this gate added v14.305 (T22) to prevent future regressions");
console.error("\nSee `scripts/check-site-url-defense.mjs` for the sister arc-guard pattern.\n");
process.exit(WARN_ONLY ? 0 : 1);
