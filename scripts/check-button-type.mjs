/**
 * Default-button-type arc-guard.
 *
 * Pins T69 button-type sweep against future regression. The bug class:
 *   - `<button>` without explicit `type=` attribute defaults to
 *     `type="submit"` per HTML5 spec.
 *   - INSIDE a `<form>`, pressing Enter while focused on any input fires
 *     the FIRST button without explicit type (or with type=submit).
 *   - If that button has an `onClick` handler that does something
 *     unrelated to form submission (delete, remove, back, navigate),
 *     the customer accidentally triggers it.
 *   - Real risk for HIPAA-aware patient surfaces (GW change-password,
 *     my-appointments, admin patient-edit) where accidental click
 *     could leak/delete data.
 *
 * Sites where this bit:
 *   - glw v18.305 + scc v13.6005 + GW v2.97.A0 (T69) — 313 buttons
 *     swept across 101 files (Python regex auto-insert).
 *
 * This gate fails the build when:
 *   1. A `<button>` element has an `onClick=` handler
 *   2. AND no explicit `type=` attribute
 *
 * The combination is a strong signal the button is JS-handled and not
 * the form's primary submit. Bare `<button>Text</button>` (no onClick,
 * no type) is allowed — typically that's an intentional submit.
 *
 * Usage: `pnpm check:button-type` (manual; sister of check-title-length-html
 * + check-description-length-html WCAG arc-guards).
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const WARN_ONLY = process.argv.includes("--warn");

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (entry === "node_modules" || entry === ".next" || entry === ".git" || entry === "scripts") continue;
      out.push(...walk(p));
    } else if (s.isFile() && p.endsWith(".tsx")) {
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

const SCAN_DIRS = ["app", "src/app", "components", "src/components"]
  .map((d) => join(ROOT, d))
  .filter((p) => {
    try { return statSync(p).isDirectory(); } catch { return false; }
  });

const offenders = [];
const allFiles = SCAN_DIRS.flatMap(walk);
for (const file of allFiles) {
  const rel = relative(ROOT, file);
  const src = readFileSync(file, "utf8");
  const stripped = stripComments(src);
  // Match every `<button ATTRS>` open tag (not `</button>`).
  const re = /<button\b([^>]*?)>/gs;
  let match;
  while ((match = re.exec(stripped)) !== null) {
    const attrs = match[1];
    if (/\btype\s*=/.test(attrs)) continue;  // explicit type — fine
    if (!/\bonClick\s*=/.test(attrs)) continue;  // no onClick — likely intentional submit
    const line = src.slice(0, match.index).split("\n").length;
    offenders.push({
      file: rel,
      line,
      preview: match[0].replace(/\s+/g, " ").trim().slice(0, 100),
    });
  }
}

if (offenders.length === 0) {
  console.log(`✓ check-button-type: 0 onClick buttons missing explicit type= across ${allFiles.length} files`);
  process.exit(0);
}

const header = WARN_ONLY ? "⚠️  check-button-type (warn)" : "✗ check-button-type";
console.error(`\n${header}: ${offenders.length} \`<button onClick={...}>\` element(s) missing explicit \`type=\` attribute\n`);
for (const o of offenders.slice(0, 30)) {
  console.error(`  ${o.file}:${o.line}`);
  console.error(`    ${o.preview}${o.preview.length === 100 ? "…" : ""}`);
}
if (offenders.length > 30) {
  console.error(`  …and ${offenders.length - 30} more.`);
}
console.error("\nWhy: <button> without explicit type defaults to type=\"submit\" per HTML5 spec.");
console.error("Inside a form, Enter key fires first untyped button — could trigger unrelated onClick");
console.error("(delete, remove, back). Real accidental-submit risk for HIPAA-aware patient surfaces.");
console.error("\nFix: add `type=\"button\"` to the button tag.");
console.error("\nHistory of this bug class:");
console.error("  - glw v18.305 + scc v13.6005 + GW v2.97.A0 (T69) — 313 buttons / 101 files");
console.error("  - this gate added 2026-05-10 (T70) to prevent future regressions\n");
process.exit(WARN_ONLY ? 0 : 1);
