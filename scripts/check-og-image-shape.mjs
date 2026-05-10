/**
 * og:image / twitter.images shape arc-guard.
 *
 * Pins T29 + T30 fixes against future regression. The bug class:
 *   - Page metadata declares `images: ["/opengraph-image"]` (string form)
 *   - Next 16 emits ONLY `<meta property="og:image">` (or `twitter:image`)
 *   - The `og:image:width`, `og:image:height`, `og:image:alt`,
 *     `og:image:type` siblings (and `twitter:image:alt`) are OMITTED
 *   - Result: share-card crawlers (Facebook, LinkedIn, Slack, Discord,
 *     iMessage, Twitter/X) can't pre-allocate the card image area —
 *     small-card or "loading" placeholder rendering
 *   - Plus accessibility: screen readers can't describe the share-card
 *     image without alt
 *
 * Sites where this bit:
 *   - glw v15.005 + scc v13.2605 (T29) — 38 pages with string-form
 *     `images: ["/opengraph-image"]` in openGraph blocks
 *   - GW v2.95.30 (T30) — buildPageMetadata SoT helper had string-form
 *     `images: [ogUrl]` in the twitter block
 *
 * This gate fails the build when ANY `images:` array inside an
 * `openGraph: {}` or `twitter: {}` block contains a bare-string
 * element. Object-form `[{ url, width, height, alt }]` is required.
 *
 * Allowlist:
 *   - app/sitemap.ts — sitemap image entries are URL-strings per the
 *     sitemap spec (different from OG metadata).
 *
 * Usage: `pnpm check:og-image-shape` (manual run; sister of
 * check-og-completeness + check-duplicate-brand-title arc-guards).
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const WARN_ONLY = process.argv.includes("--warn");

const EXEMPT = new Set([
  "app/sitemap.ts",  // sitemap image entries are URL-strings per spec
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
// images declarations. Same trick as check-og-completeness +
// check-duplicate-brand-title.
function stripComments(src) {
  let stripped = src.replace(/\/\*[\s\S]*?\*\//g, (m) => " ".repeat(m.length));
  stripped = stripped.replace(/\/\/[^\n]*/g, (m) => " ".repeat(m.length));
  return stripped;
}

// Find every `images: [...]` array inside an openGraph or twitter block.
// Heuristic: walk back from each `images:` match looking at brace depth;
// if we hit `openGraph: {` or `twitter: {` BEFORE returning to depth 0,
// this images decl is inside a relevant sub-block.
function findOgImagesDeclarations(src) {
  const stripped = stripComments(src);
  const declarations = [];
  const re = /(?:^|[\s,{])images\s*:\s*\[/g;
  let match;
  while ((match = re.exec(stripped)) !== null) {
    const arrStart = match.index + match[0].length;
    // Walk back from the match looking for the enclosing block opener.
    // If it's `openGraph: {` or `twitter: {`, the decl is in scope.
    let backDepth = 0;
    let inScope = false;
    for (let j = match.index - 1; j >= 0; j--) {
      const c = stripped[j];
      if (c === "}") backDepth++;
      else if (c === "{") {
        if (backDepth === 0) {
          const lineStart = stripped.lastIndexOf("\n", j) + 1;
          const lineToBrace = stripped.slice(lineStart, j);
          if (/\b(openGraph|twitter)\s*:\s*$/.test(lineToBrace)) {
            inScope = true;
          }
          break;
        }
        backDepth--;
      }
    }
    if (!inScope) continue;
    // Read the array contents until the matching `]` at depth 0.
    let i = arrStart;
    let depth = 0;
    let inString = null;
    while (i < stripped.length) {
      const c = stripped[i];
      if (inString) {
        if (c === inString && stripped[i - 1] !== "\\") inString = null;
        else if (c === "\\") i++;
      } else {
        if (c === '"' || c === "'" || c === "`") inString = c;
        else if (c === "{" || c === "(" || c === "[") depth++;
        else if (c === "}" || c === ")") {
          if (depth === 0) break;
          depth--;
        } else if (c === "]") {
          if (depth === 0) break;
          depth--;
        }
      }
      i++;
    }
    const value = stripped.slice(arrStart, i).trim();
    const line = src.slice(0, match.index).split("\n").length;
    declarations.push({ value, line });
  }
  return declarations;
}

// An array is "string-form" if it contains a bare string element at
// the top level (not inside an object). Object-form looks like
// `{ url: "...", width, height, alt }` — those are fine.
//
// Heuristic: if the trimmed array body starts with a quote, OR if it
// contains a top-level entry that starts with a quote (split by `,` at
// depth 0), it's string-form.
function isStringForm(arrayBody) {
  if (!arrayBody) return false;
  const trimmed = arrayBody.trim();
  if (trimmed.length === 0) return false;
  // Split top-level by comma. If any element starts with a quote OR is a
  // bare identifier (e.g. `OG_IMAGE_URL`, `ogUrl`) — string-form.
  const elements = [];
  let depth = 0;
  let inString = null;
  let last = 0;
  for (let i = 0; i < trimmed.length; i++) {
    const c = trimmed[i];
    if (inString) {
      if (c === inString && trimmed[i - 1] !== "\\") inString = null;
      else if (c === "\\") i++;
    } else {
      if (c === '"' || c === "'" || c === "`") inString = c;
      else if (c === "{" || c === "(" || c === "[") depth++;
      else if (c === "}" || c === ")" || c === "]") depth--;
      else if (c === "," && depth === 0) {
        elements.push(trimmed.slice(last, i).trim());
        last = i + 1;
      }
    }
  }
  if (last < trimmed.length) elements.push(trimmed.slice(last).trim());
  // An element is string-form ONLY if it's a literal string (`"..."`,
  // `'...'`) or a template literal (`` `...` ``). Bare identifiers are
  // trusted — agents already prefer the SoT const `DEFAULT_OG_IMAGE`
  // shape, and identifier-typed-as-URL is rare + was caught at T30 by
  // direct grep. Object literals `{...}` and spreads `...VAR` are good.
  for (const el of elements) {
    if (el.length === 0) continue;
    if (el.startsWith('"') || el.startsWith("'") || el.startsWith("`")) {
      return true;  // literal string — the bug we're guarding against
    }
    // Object literal, spread, identifier, fn call — all trusted.
  }
  return false;
}

const SCAN_DIRS = ["app", "src/app", "lib", "src/lib"]
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
  const decls = findOgImagesDeclarations(src);
  for (const { value, line } of decls) {
    if (isStringForm(value)) {
      offenders.push({ file: rel, line, value: value.slice(0, 100) });
    }
  }
}

if (offenders.length === 0) {
  console.log(`✓ check-og-image-shape: 0 offenders across ${allFiles.length} files`);
  process.exit(0);
}

const header = WARN_ONLY ? "⚠️  check-og-image-shape (warn)" : "✗ check-og-image-shape";
console.error(`\n${header}: ${offenders.length} \`images:\` array(s) inside openGraph/twitter blocks have string-form elements — emits og:image/twitter:image WITHOUT og:image:width/height/alt or twitter:image:alt\n`);
for (const o of offenders) {
  console.error(`  ${o.file}:${o.line}`);
  console.error(`    images: [${o.value}]`);
}
console.error("\nWhy: string-form `images: [\"/opengraph-image\"]` emits ONLY <meta property=\"og:image\">.");
console.error("The width/height/alt/type siblings are OMITTED, breaking share-card pre-allocation");
console.error("(Facebook/LinkedIn/Slack/Discord/iMessage/Twitter) and accessibility (screen readers).");
console.error("\nFix: object-form `images: [{ url, width: 1200, height: 630, alt: \"...\", type: \"image/png\" }]`");
console.error("Or use a SoT const like `DEFAULT_OG_IMAGE` exported from lib/store.ts.");
console.error("\nHistory of this bug class:");
console.error("  - glw v15.005 + scc v13.2605 (T29) — 38 page-level openGraph blocks");
console.error("  - GW v2.95.30 (T30) — buildPageMetadata SoT helper twitter.images");
console.error("  - this gate added 2026-05-10 (T31) to prevent future regressions\n");
process.exit(WARN_ONLY ? 0 : 1);
