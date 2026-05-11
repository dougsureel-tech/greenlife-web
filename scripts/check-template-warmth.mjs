/**
 * Template-warmth softener arc-guard.
 *
 * Pins the v19.205 + v27.805 sweeps that stripped template-warmth softeners
 * from customer-facing copy.
 *
 * Doctrine: brand-voice doc + recurring communications-expert findings.
 * Phrases like "give us a call" / "drop us a line" / "reach out to us"
 * are corporate-template warmth — they signal that copy was written by
 * a marketing team trying to sound friendly. Real shop voice is direct:
 *   ✓ "Call us." / "Email us."
 *   ✗ "Give us a call." / "Drop us a line."
 *
 * The hedge-warmth pattern keeps recurring because it's how a copywriter
 * with no shop experience translates "we're approachable" into prose. The
 * guard catches the 4 highest-confidence variants.
 *
 * Patterns flagged:
 *   "give us a call"   — soften of "call us"
 *   "give us a ring"   — soften of "call us"
 *   "drop us a line"   — soften of "email us"
 *   "reach out to us"  — corporate-meeting-speak version of "contact us"
 *
 * NOT flagged (allowed):
 *   - Comments
 *   - app/brands/[slug]/_brands/* — 3rd-party brand voice can vary
 *   - scripts/, lib/version.ts
 *
 * Run via:
 *   node scripts/check-template-warmth.mjs           # strict
 *   node scripts/check-template-warmth.mjs --warn    # warn-only
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const WARN_ONLY = process.argv.includes("--warn");
const SCAN_DIRS = ["app", "components", "lib"];
const EXTENSIONS = new Set([".ts", ".tsx"]);

const EXEMPT_PREFIXES = [
  "app/brands/[slug]/_brands/",
  "scripts/",
  "lib/version.ts",
];

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (name === "node_modules" || name === ".next" || name === "__tests__") continue;
    const full = join(dir, name);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      walk(full, out);
    } else if (EXTENSIONS.has(name.slice(name.lastIndexOf(".")))) {
      out.push(full);
    }
  }
  return out;
}

function stripComments(src) {
  let out = src.replace(/\/\*[\s\S]*?\*\//g, "");
  out = out.replace(/\/\/[^\n]*/g, "");
  return out;
}

const PATTERN = /\b(?:give us a (?:call|ring)|drop us a line|reach out to us)\b/gi;

const offenders = [];
for (const dir of SCAN_DIRS) {
  const root = join(ROOT, dir);
  for (const file of walk(root)) {
    const rel = relative(ROOT, file);
    if (EXEMPT_PREFIXES.some((p) => rel.startsWith(p))) continue;
    let src;
    try {
      src = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const stripped = stripComments(src);
    const lines = stripped.split("\n");
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      PATTERN.lastIndex = 0;
      let m;
      while ((m = PATTERN.exec(line)) !== null) {
        offenders.push({
          file: rel,
          line: i + 1,
          snippet: line.trim().slice(0, 120),
          match: m[0],
        });
      }
    }
  }
}

if (offenders.length === 0) {
  console.log(
    `✓ check-template-warmth: 0 corporate-template warmth softeners (brand-voice direct-voice rule pinned across v19.205 + v27.805 sweeps)`,
  );
  process.exit(0);
}

const header = WARN_ONLY ? "⚠️  check-template-warmth (warn)" : "✗ check-template-warmth";
console.error(`\n${header}: ${offenders.length} template-warmth softener(s)\n`);
console.error('Brand-voice rule: real shop voice is direct, not "give us a call" / "drop us a line".');
console.error('  ✗ "Give us a call."          → ✓ "Call us."');
console.error('  ✗ "Drop us a line."          → ✓ "Email us."');
console.error('  ✗ "Reach out to us."         → ✓ "Contact us." / "Email us."');
console.error("");
for (const o of offenders) {
  console.error(`  ${o.file}:${o.line} — matched "${o.match}"`);
  console.error(`    ${o.snippet}`);
}
console.error("\nFix: drop the softener. See v19.205 sweep for canonical swaps.\n");

process.exit(WARN_ONLY ? 0 : 1);
