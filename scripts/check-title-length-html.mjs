/**
 * Title-length-HTML-rendered arc-guard.
 *
 * Pins T5 + T24 + T25 + T61 fixes against future regression. The bug class:
 *   - Page-level `metadata.title` body uses an HTML-special character
 *     (`&`, `'`, `"`, `<`, `>`) that React serializes as a numeric or
 *     named entity in the rendered <title>. Each entity adds 4-6 chars.
 *   - Layout's `title.template` (e.g. `%s | Green Life Cannabis`)
 *     appends ~22 chars for brand suffix.
 *   - JS string length looks fine (e.g. 47 chars), but HTML-rendered
 *     <title> exceeds Google's ~60-char SERP cap (e.g. 74 chars).
 *   - Result: SERP shows truncated title with mid-word "…", losing the
 *     CTR-bearing tail of the headline.
 *
 * Sites where this bit:
 *   - glw v17.905 (T61) — /treasure-chest 74c (`&amp;`), /our-story 74c
 *     (`&#x27;`), /blog 61c (`&amp;`)
 *   - scc v13.5505 (T61) — /treasure-chest + /blog same class
 *
 * This gate fails the build when:
 *   1. Page sets a STATIC `title: "..."` body (no `${...}` interpolation)
 *   2. AND HTML-rendered length (body + entity inflation + template
 *      suffix from layout) exceeds 60 chars.
 *
 * Skips:
 *   - `title: { absolute: "..." }` — opted out of template, body length
 *     IS the rendered length, but body itself is checked.
 *   - `title: \`template ${expr}\`` — dynamic, can't measure statically.
 *   - `title: someConst` — variable reference, can't trace statically.
 *   - app/layout.tsx — defines the template; legitimately mentions brand.
 *
 * Brand suffix: read from layout's `title.template` if `%s | <BRAND>`
 * shape; otherwise hardcoded fallback.
 *
 * Usage: `pnpm check:title-length-html` (manual; sister of
 * check-duplicate-brand-title + check-og-completeness arc-guards).
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const WARN_ONLY = process.argv.includes("--warn");
const SERP_CAP = 60;  // Google's SERP title cap (HTML-rendered length).

// Read brand name from lib/store.ts. Fallback hardcoded for repo
// independence — script copies cleanly between glw + scc.
let BRAND_NAME = "Green Life Cannabis";
try {
  const storeFile = readFileSync(join(ROOT, "lib/store.ts"), "utf8");
  const m = storeFile.match(/name:\s*["']([^"']+)["']/);
  if (m) BRAND_NAME = m[1];
} catch {
  // GW path — try src/lib/seo.ts SITE_NAME
  try {
    const seoFile = readFileSync(join(ROOT, "src/lib/seo.ts"), "utf8");
    const m = seoFile.match(/SITE_NAME\s*=\s*["']([^"']+)["']/);
    if (m) BRAND_NAME = m[1];
  } catch {}
}

// Layout's title.template shape: typically `%s | ${BRAND}` (22 chars
// brand suffix for "Green Life Cannabis"). Compute suffix length from
// brand name + the literal " | " separator.
const TEMPLATE_SUFFIX = ` | ${BRAND_NAME}`;
const TEMPLATE_SUFFIX_LEN = TEMPLATE_SUFFIX.length;

// HTML-escape a string the way React renders it in <title>:
//   &  → &amp;   (+4)
//   '  → &#x27;  (+5)
//   "  → &quot;  (+5)
//   <  → &lt;    (+3)
//   >  → &gt;    (+3)
function htmlEscapedLength(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/'/g, "&#x27;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").length;
}

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

// Strip line + block comments first.
function stripComments(src) {
  let stripped = src.replace(/\/\*[\s\S]*?\*\//g, (m) => " ".repeat(m.length));
  stripped = stripped.replace(/\/\/[^\n]*/g, (m) => " ".repeat(m.length));
  return stripped;
}

// Find every TOP-LEVEL `title:` declaration (skip openGraph/twitter
// sub-block titles where length doesn't matter for SERP). Reuses the
// brace-depth-aware reverse-walk pattern from check-duplicate-brand-title.
function findTitleDeclarations(src) {
  const stripped = stripComments(src);
  const declarations = [];
  const re = /(?:^|[\s,{])title\s*:\s*/g;
  let match;
  while ((match = re.exec(stripped)) !== null) {
    const valStart = match.index + match[0].length;
    // Skip object-literal values: `title: {` (absolute / template / default).
    // We extract the absolute body explicitly below.
    const isObjectForm = stripped[valStart] === "{";
    // Brace-depth reverse-walk: confirm this `title:` is the IMMEDIATE
    // child of an exported `metadata` object (Metadata API), NOT inside
    // an arbitrary array-of-objects (e.g. training step data, FAQ items,
    // breadcrumb chains, navigation links). The enclosing brace's
    // preceding context must match `metadata\s*=\s*` or `metadata\s*:`.
    // Sub-blocks (openGraph/twitter/etc) and unrelated data structures
    // both get rejected.
    let backDepth = 0;
    let bracketDepth = 0;
    let confirmedMetadata = false;
    for (let j = match.index - 1; j >= 0; j--) {
      const c = stripped[j];
      if (c === "]") bracketDepth++;
      else if (c === "[") {
        if (bracketDepth === 0) {
          // We're inside an array literal at this depth — not metadata.
          break;
        }
        bracketDepth--;
      } else if (c === "}") backDepth++;
      else if (c === "{") {
        if (backDepth === 0) {
          // Check what this opening brace belongs to.
          const lineStart = stripped.lastIndexOf("\n", j) + 1;
          const lineToBrace = stripped.slice(lineStart, j);
          // Top-level metadata export shapes:
          //   export const metadata: Metadata = {
          //   export const metadata = {
          //   metadata: {  (rare nested form)
          if (/\bmetadata\s*(?::\s*\w+\s*)?=\s*$/.test(lineToBrace) ||
              /^\s*metadata\s*:\s*$/.test(lineToBrace)) {
            confirmedMetadata = true;
          }
          // Anything else (array element object, sub-block, helper) — reject.
          break;
        }
        backDepth--;
      }
    }
    if (!confirmedMetadata) continue;

    if (isObjectForm) {
      // `title: { absolute: "..." }` or `title: { default: ..., template: ... }`.
      // Extract the absolute body if present. For default+template
      // (layout pattern) skip — that's the SOURCE of the template.
      const objStart = valStart;
      let i = objStart + 1;
      let depth = 1;
      let inString = null;
      while (i < stripped.length && depth > 0) {
        const c = stripped[i];
        if (inString) {
          if (c === inString && stripped[i - 1] !== "\\") inString = null;
          else if (c === "\\") i++;
        } else {
          if (c === '"' || c === "'" || c === "`") inString = c;
          else if (c === "{") depth++;
          else if (c === "}") depth--;
        }
        i++;
      }
      const objBody = stripped.slice(objStart, i);
      // Look for absolute: "..." inside.
      const absMatch = objBody.match(/absolute\s*:\s*["']([^"']+)["']/);
      if (absMatch) {
        const line = src.slice(0, match.index).split("\n").length;
        declarations.push({
          kind: "absolute",
          body: absMatch[1],
          line,
        });
      }
      continue;
    }
    // Plain string or template literal.
    let i = valStart;
    let value = "";
    let kind = null;
    if (stripped[i] === '"' || stripped[i] === "'") {
      // Plain string literal — extract.
      const quote = stripped[i];
      i++;
      let s = "";
      while (i < stripped.length) {
        const c = stripped[i];
        if (c === "\\") {
          s += stripped[i + 1] ?? "";
          i += 2;
          continue;
        }
        if (c === quote) break;
        s += c;
        i++;
      }
      value = s;
      kind = "static";
    } else if (stripped[i] === "`") {
      // Template literal — skip if it has ${...}, otherwise treat as static.
      i++;
      let s = "";
      let hasInterp = false;
      while (i < stripped.length) {
        const c = stripped[i];
        if (c === "\\") {
          s += stripped[i + 1] ?? "";
          i += 2;
          continue;
        }
        if (c === "`") break;
        if (c === "$" && stripped[i + 1] === "{") {
          hasInterp = true;
          // Skip past the ${...}.
          i += 2;
          let depth = 1;
          while (i < stripped.length && depth > 0) {
            if (stripped[i] === "{") depth++;
            else if (stripped[i] === "}") depth--;
            i++;
          }
          continue;
        }
        s += c;
        i++;
      }
      if (hasInterp) continue;  // dynamic, skip
      value = s;
      kind = "static";
    } else {
      // Variable reference / function call / etc. — skip.
      continue;
    }
    if (!value) continue;
    const line = src.slice(0, match.index).split("\n").length;
    declarations.push({ kind, body: value, line });
  }
  return declarations;
}

const EXEMPT = new Set([
  "app/layout.tsx",  // SOURCE of title.template
  "src/app/layout.tsx",
]);

const SCAN_DIRS = ["app", "src/app"]
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
  for (const { kind, body, line } of decls) {
    let renderedLen;
    if (kind === "absolute") {
      // Absolute body IS the rendered title; no template suffix.
      renderedLen = htmlEscapedLength(body);
    } else {
      // Plain string — template suffix appended.
      renderedLen = htmlEscapedLength(body) + TEMPLATE_SUFFIX_LEN;
    }
    if (renderedLen > SERP_CAP) {
      offenders.push({
        file: rel,
        line,
        kind,
        bodyLen: body.length,
        escapedLen: htmlEscapedLength(body),
        suffixLen: kind === "absolute" ? 0 : TEMPLATE_SUFFIX_LEN,
        renderedLen,
        body: body.slice(0, 70),
      });
    }
  }
}

if (offenders.length === 0) {
  console.log(`✓ check-title-length-html: 0 over-cap titles across ${allFiles.length} files (brand="${BRAND_NAME}", suffix=" | ${BRAND_NAME}", cap=${SERP_CAP}c)`);
  process.exit(0);
}

const header = WARN_ONLY ? "⚠️  check-title-length-html (warn)" : "✗ check-title-length-html";
console.error(`\n${header}: ${offenders.length} title(s) exceed Google's ~${SERP_CAP}-char SERP cap when HTML-rendered\n`);
for (const o of offenders) {
  console.error(`  ${o.file}:${o.line}`);
  console.error(`    kind: ${o.kind}`);
  console.error(`    body (${o.bodyLen}c JS, ${o.escapedLen}c HTML-escaped): "${o.body}${o.body.length === 70 ? "…" : ""}"`);
  if (o.suffixLen > 0) {
    console.error(`    + template suffix: "${TEMPLATE_SUFFIX}" (${o.suffixLen}c)`);
  }
  console.error(`    rendered: ${o.renderedLen}c (cap ${SERP_CAP})`);
  console.error("");
}
console.error("Why: HTML special chars expand under React's <title> serialization:");
console.error("  & → &amp; (+4) · ' → &#x27; (+5) · \" → &quot; (+5) · < → &lt; (+3) · > → &gt; (+3)");
console.error("JS source length looks fine, but rendered <title> exceeds Google's SERP cap.");
console.error("\nFix shapes:");
console.error("  - Replace `&` with `+` or `and` (no entity inflation)");
console.error("  - Drop apostrophes (or use Unicode `’` if rendering in UTF-8 — measure post-render)");
console.error(`  - Switch to title.absolute when full control needed: \`title: { absolute: "Body | ${BRAND_NAME}" }\``);
console.error(`  - Shorten the title body so escaped+suffix ≤ ${SERP_CAP}`);
console.error("\nHistory of this bug class:");
console.error("  - GW v2.93.90 telehealth template (T5)");
console.error("  - GW v2.94.60 /about + /get-started (T24)");
console.error("  - glw v14.705 + scc v13.2305 /apply layout (T25)");
console.error("  - glw v17.905 + scc v13.5505 /treasure-chest + /our-story + /blog (T61)");
console.error("  - this gate added 2026-05-10 (T63) to prevent future regressions");
console.error("  - memory pin: feedback_html_escape_inflates_meta_description_length\n");
process.exit(WARN_ONLY ? 0 : 1);
