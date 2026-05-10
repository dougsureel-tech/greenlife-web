/**
 * Description-length-HTML-rendered arc-guard.
 *
 * Pins T6 + T62 fixes against future regression. The bug class:
 *   - Page-level `metadata.description` body uses an HTML-special char
 *     (`&`, `'`, `"`, `<`, `>`) that React serializes as a numeric or
 *     named entity in the rendered <meta description>. Each entity adds
 *     3-6 chars.
 *   - JS string length looks fine (e.g. 158 chars), but HTML-rendered
 *     <meta name="description"> exceeds Google's ~160-char SERP cap.
 *   - Result: SERP shows truncated description with mid-sentence "…".
 *
 * Sister of check-title-length-html arc-guard (T63) — same shape, but
 * for descriptions. No template suffix to worry about (descriptions
 * don't get appended).
 *
 * Sites where this bit:
 *   - GW v2.94.95 (T-something) — telehealth + /learn 158→167c via
 *     apostrophe + ampersand inflation (memory pin
 *     `feedback_html_escape_inflates_meta_description_length`)
 *   - scc v13.5605 (T62) — /blog 170c
 *
 * This gate fails the build when:
 *   1. Page sets a STATIC `description: "..."` body (no `${...}` interp)
 *   2. AND HTML-rendered length exceeds 160 chars.
 *
 * Skips:
 *   - `description: \`template ${expr}\`` — dynamic, can't measure
 *     statically. Same trade-off as title arc-guard.
 *   - `description: someConst` — variable reference.
 *   - app/layout.tsx — root descriptions are intentional, not page-level.
 *
 * Usage: `pnpm check:description-length-html` (manual; sister of
 * check-title-length-html).
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const WARN_ONLY = process.argv.includes("--warn");
const SERP_CAP = 160;  // Google's SERP description cap (HTML-rendered).

// HTML-escape a string the way React renders it in <meta>:
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

function stripComments(src) {
  let stripped = src.replace(/\/\*[\s\S]*?\*\//g, (m) => " ".repeat(m.length));
  stripped = stripped.replace(/\/\/[^\n]*/g, (m) => " ".repeat(m.length));
  return stripped;
}

// Find every TOP-LEVEL `description:` declaration that is the immediate
// child of an exported `metadata` object. Same brace-depth + bracket-
// depth aware reverse-walk pattern as check-title-length-html.
function findDescriptionDeclarations(src) {
  const stripped = stripComments(src);
  const declarations = [];
  const re = /(?:^|[\s,{])description\s*:\s*/g;
  let match;
  while ((match = re.exec(stripped)) !== null) {
    const valStart = match.index + match[0].length;
    // Brace + bracket depth reverse-walk to confirm metadata-export scope.
    let backDepth = 0;
    let bracketDepth = 0;
    let confirmedMetadata = false;
    for (let j = match.index - 1; j >= 0; j--) {
      const c = stripped[j];
      if (c === "]") bracketDepth++;
      else if (c === "[") {
        if (bracketDepth === 0) break;  // inside an array — reject
        bracketDepth--;
      } else if (c === "}") backDepth++;
      else if (c === "{") {
        if (backDepth === 0) {
          const lineStart = stripped.lastIndexOf("\n", j) + 1;
          const lineToBrace = stripped.slice(lineStart, j);
          if (/\bmetadata\s*(?::\s*\w+\s*)?=\s*$/.test(lineToBrace) ||
              /^\s*metadata\s*:\s*$/.test(lineToBrace)) {
            confirmedMetadata = true;
          }
          break;
        }
        backDepth--;
      }
    }
    if (!confirmedMetadata) continue;

    // Extract value: plain string or template-literal-without-interpolation.
    let i = valStart;
    let value = "";
    if (stripped[i] === '"' || stripped[i] === "'") {
      const quote = stripped[i];
      i++;
      while (i < stripped.length) {
        const c = stripped[i];
        if (c === "\\") {
          value += stripped[i + 1] ?? "";
          i += 2;
          continue;
        }
        if (c === quote) break;
        value += c;
        i++;
      }
    } else if (stripped[i] === "`") {
      i++;
      let hasInterp = false;
      while (i < stripped.length) {
        const c = stripped[i];
        if (c === "\\") {
          value += stripped[i + 1] ?? "";
          i += 2;
          continue;
        }
        if (c === "`") break;
        if (c === "$" && stripped[i + 1] === "{") {
          hasInterp = true;
          i += 2;
          let depth = 1;
          while (i < stripped.length && depth > 0) {
            if (stripped[i] === "{") depth++;
            else if (stripped[i] === "}") depth--;
            i++;
          }
          continue;
        }
        value += c;
        i++;
      }
      if (hasInterp) continue;  // dynamic, skip
    } else {
      continue;  // variable reference / call — skip
    }
    if (!value) continue;
    const line = src.slice(0, match.index).split("\n").length;
    declarations.push({ body: value, line });
  }
  return declarations;
}

const EXEMPT = new Set([
  "app/layout.tsx",
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
  const decls = findDescriptionDeclarations(src);
  for (const { body, line } of decls) {
    const renderedLen = htmlEscapedLength(body);
    if (renderedLen > SERP_CAP) {
      offenders.push({
        file: rel,
        line,
        bodyLen: body.length,
        renderedLen,
        body: body.slice(0, 90),
      });
    }
  }
}

if (offenders.length === 0) {
  console.log(`✓ check-description-length-html: 0 over-cap descriptions across ${allFiles.length} files (cap=${SERP_CAP}c HTML-rendered)`);
  process.exit(0);
}

const header = WARN_ONLY ? "⚠️  check-description-length-html (warn)" : "✗ check-description-length-html";
console.error(`\n${header}: ${offenders.length} description(s) exceed Google's ~${SERP_CAP}-char SERP cap when HTML-rendered\n`);
for (const o of offenders) {
  console.error(`  ${o.file}:${o.line}`);
  console.error(`    body (${o.bodyLen}c JS, ${o.renderedLen}c HTML-escaped): "${o.body}${o.body.length === 90 ? "…" : ""}"`);
  console.error(`    cap: ${SERP_CAP}`);
  console.error("");
}
console.error("Why: HTML special chars expand under React's <meta> serialization:");
console.error("  & → &amp; (+4) · ' → &#x27; (+5) · \" → &quot; (+5) · < → &lt; (+3) · > → &gt; (+3)");
console.error("JS source length looks fine, but rendered <meta description> exceeds Google's SERP cap.");
console.error("\nFix shapes:");
console.error("  - Replace `&` with `+` or `and` (no entity inflation)");
console.error("  - Drop redundant phrasing or trim wording");
console.error("  - Use buildPageMetadata helper if available (auto-truncates with iterative shorten)");
console.error("\nHistory of this bug class:");
console.error("  - GW v2.94.95 telehealth + /learn entity inflation");
console.error("  - scc v13.5605 (T62) /blog 170c — sister of T61 title sweep");
console.error("  - this gate added 2026-05-10 (T64) to prevent future regressions");
console.error("  - memory pin: feedback_html_escape_inflates_meta_description_length\n");
process.exit(WARN_ONLY ? 0 : 1);
