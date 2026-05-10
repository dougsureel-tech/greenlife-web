/**
 * Per-route OG image dead-code arc-guard.
 *
 * Pins T48 + T49 fixes against future regression. The bug class:
 *   - Co-located `opengraph-image.tsx` file at `app/<route>/opengraph-image.tsx`
 *     emits a 1200×630 ImageResponse — Next 16's per-route convention
 *     auto-injects `<meta og:image content="/<route>/opengraph-image">`
 *     UNLESS the sibling page sets `metadata.openGraph.images` explicitly.
 *   - Sibling `page.tsx` sets `openGraph: { ..., images: [DEFAULT_OG_IMAGE] }`
 *     (or `{ url: brand.logoUrl }`, or `["/opengraph-image"]`) which
 *     OVERRIDES the convention.
 *   - Result: per-route file is DEAD CODE — every share-card on
 *     Twitter/Facebook/LinkedIn/iMessage renders the wrong image.
 *
 * Sites where this bit:
 *   - glw v17.005 + scc v13.4705 (T48) — /blog/[slug] dead-code
 *   - glw v17.105 + scc v13.4805 (T49) — /menu /deals/[id] /brands/[slug]
 *
 * This gate fails the build when a directory containing `opengraph-image.tsx`
 * has a sibling page.tsx (or layout.tsx) whose `openGraph.images` field
 * contains a known-bad pattern:
 *   - `DEFAULT_OG_IMAGE` literal ref (T29-era SoT consolidation pattern)
 *   - `brand.logoUrl` (or any `<obj>.logoUrl`) ref
 *   - String literal `"/opengraph-image"` (root homepage card path)
 *
 * The PROPER pattern (and the only one this guard accepts) is either:
 *   A. Don't set `openGraph.images` at all — let convention auto-inject.
 *   B. Set with explicit per-route URL: `\`/<route>/opengraph-image\``.
 *
 * Allowlist:
 *   - app/layout.tsx — root-level OG image at /opengraph-image is correct
 *     here (it's the homepage / fallback default).
 *
 * Usage: `pnpm check:per-route-og-image` (manual run; sister of
 * check-og-completeness + check-duplicate-brand-title + check-og-image-shape
 * arc-guards).
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, relative, dirname } from "path";

const ROOT = process.cwd();
const WARN_ONLY = process.argv.includes("--warn");

// Find every directory that contains an `opengraph-image.tsx` file.
function findOgImageDirs(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (entry === "node_modules" || entry === ".next" || entry === ".git" || entry === "scripts") continue;
      findOgImageDirs(p, results);
    } else if (s.isFile() && entry === "opengraph-image.tsx") {
      results.push(dirname(p));
    }
  }
  return results;
}

// Strip line + block comments.
function stripComments(src) {
  let stripped = src.replace(/\/\*[\s\S]*?\*\//g, (m) => " ".repeat(m.length));
  stripped = stripped.replace(/\/\/[^\n]*/g, (m) => " ".repeat(m.length));
  return stripped;
}

// Find every `images: [...]` array inside an `openGraph: {}` block in this
// file. Same brace-depth tracking pattern as check-og-image-shape.
function findOgImagesArrays(src) {
  const stripped = stripComments(src);
  const arrays = [];
  const re = /(?:^|[\s,{])images\s*:\s*\[/g;
  let match;
  while ((match = re.exec(stripped)) !== null) {
    const arrStart = match.index + match[0].length;
    // Confirm we're inside an openGraph: {} block (not twitter or other).
    let backDepth = 0;
    let inOpenGraph = false;
    for (let j = match.index - 1; j >= 0; j--) {
      const c = stripped[j];
      if (c === "}") backDepth++;
      else if (c === "{") {
        if (backDepth === 0) {
          const lineStart = stripped.lastIndexOf("\n", j) + 1;
          const lineToBrace = stripped.slice(lineStart, j);
          if (/\bopenGraph\s*:\s*$/.test(lineToBrace)) {
            inOpenGraph = true;
          }
          break;
        }
        backDepth--;
      }
    }
    if (!inOpenGraph) continue;
    // Read array body until matching `]` at depth 0.
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
    const value = stripped.slice(arrStart, i);
    const line = src.slice(0, match.index).split("\n").length;
    arrays.push({ value, line });
  }
  return arrays;
}

// Known dead-code patterns that should NOT appear in `images:` arrays
// inside directories with co-located `opengraph-image.tsx`.
function deadCodePattern(arrayBody) {
  // T29-era SoT const ref.
  if (/\bDEFAULT_OG_IMAGE\b/.test(arrayBody)) return "DEFAULT_OG_IMAGE";
  // T49-era brand-logo override ref.
  if (/\b\w+\.logoUrl\b/.test(arrayBody)) return "<x>.logoUrl";
  // Root homepage path string literal.
  if (/["'`]\/opengraph-image["'`]/.test(arrayBody)) return '"/opengraph-image"';
  return null;
}

const SCAN_DIRS = ["app", "src/app"]
  .map((d) => join(ROOT, d))
  .filter((p) => {
    try { return statSync(p).isDirectory(); } catch { return false; }
  });

const offenders = [];
for (const scanDir of SCAN_DIRS) {
  const ogDirs = findOgImageDirs(scanDir);
  for (const ogDir of ogDirs) {
    const relDir = relative(ROOT, ogDir);
    // Skip the root-level opengraph-image.tsx (it's the fallback default,
    // legitimately sits at app/opengraph-image.tsx).
    if (relDir === "app" || relDir === "src/app") continue;
    // Look at the sibling page.tsx (and layout.tsx if no page).
    const candidates = ["page.tsx", "layout.tsx"];
    for (const candidate of candidates) {
      const sibling = join(ogDir, candidate);
      if (!existsSync(sibling)) continue;
      const src = readFileSync(sibling, "utf8");
      const arrays = findOgImagesArrays(src);
      for (const { value, line } of arrays) {
        const pattern = deadCodePattern(value);
        if (pattern) {
          offenders.push({
            file: relative(ROOT, sibling),
            line,
            ogDir: relDir,
            pattern,
            preview: value.replace(/\s+/g, " ").trim().slice(0, 100),
          });
        }
      }
    }
  }
}

if (offenders.length === 0) {
  console.log(`✓ check-per-route-og-image: 0 dead-code overrides across all directories with opengraph-image.tsx`);
  process.exit(0);
}

const header = WARN_ONLY ? "⚠️  check-per-route-og-image (warn)" : "✗ check-per-route-og-image";
console.error(`\n${header}: ${offenders.length} dead-code override(s) — `);
console.error(`page.tsx in a directory with co-located opengraph-image.tsx is overriding`);
console.error(`Next 16's per-route convention with a known-bad images: [] pattern\n`);
for (const o of offenders) {
  console.error(`  ${o.file}:${o.line}`);
  console.error(`    in: ${o.ogDir}/`);
  console.error(`    pattern: ${o.pattern}`);
  console.error(`    images: [${o.preview}]`);
  console.error("");
}
console.error("Why: the per-route opengraph-image.tsx file becomes DEAD CODE when the sibling");
console.error("page.tsx sets metadata.openGraph.images explicitly with a URL pointing elsewhere.");
console.error("Every share-card on Twitter/Facebook/LinkedIn/iMessage renders the WRONG image.");
console.error("\nFix shapes:");
console.error("  - Drop `images:` entirely → Next auto-injects per-route via convention");
console.error("  - Set explicit per-route URL: `images: [{ url: \"/<route>/opengraph-image\", width: 1200, height: 630, alt: \"...\" }]`");
console.error("\nHistory of this bug class:");
console.error("  - glw v17.005 + scc v13.4705 (T48) — /blog/[slug] dead-code");
console.error("  - glw v17.105 + scc v13.4805 (T49) — /menu /deals/[id] /brands/[slug] dead-code");
console.error("  - this gate added 2026-05-10 (T50) to prevent future regressions\n");
process.exit(WARN_ONLY ? 0 : 1);
