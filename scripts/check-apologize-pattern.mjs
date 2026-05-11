/**
 * "Never apologize for things that aren't our fault" arc-guard.
 *
 * Pins v18.105 (/terms-of-use never-apologize) + v18.705 (MenuFallback
 * iHJ-failure never-apologize) sweeps.
 *
 * Doctrine: brand-voice doc "What we never do" section. Customer-facing
 * apologies for things that aren't our fault dilute the legal posture
 * (apology = concession of fault) AND signal that the copy was written
 * by a marketing team trying to seem warm rather than by an actual
 * shop owner.
 *
 *   ✗ "We apologize for the inconvenience."
 *   ✗ "Sorry for any frustration when stock or price differs."
 *   ✗ "We're sorry, our menu is taking a moment to load."
 *
 *   ✓ "The price at the register controls the transaction." (direct)
 *   ✓ "Menu's slow today — here's how to order while it loads." (lead with action)
 *
 * Recurrence: caught 2 times this session (v18.105 terms-of-use disclaimer
 * apology + v18.705 MenuFallback iHJ-failure apology). Pattern recurs
 * because it's how a copywriter without shop experience translates "we
 * care" into prose.
 *
 * Patterns flagged:
 *   "we apologize"        — corporate-template apology
 *   "We're sorry,"        — apologetic lead
 *   "sorry for the"       — "sorry for the inconvenience" template
 *   "sorry about that"    — informal version of same
 *
 * NOT flagged (allowed):
 *   - Comments
 *   - app/brands/[slug]/_brands/* — 3rd-party brand voice
 *   - scripts/, lib/version.ts
 *
 * Run via:
 *   node scripts/check-apologize-pattern.mjs           # strict
 *   node scripts/check-apologize-pattern.mjs --warn    # warn-only
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

const PATTERN = /\b(?:we apologize|We['']re sorry,|sorry for the|sorry about that)\b/gi;

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
    `✓ check-apologize-pattern: 0 corporate apology hedges (brand-voice doc "never apologize for things that aren't our fault" pinned across v18.105 + v18.705 sweeps)`,
  );
  process.exit(0);
}

const header = WARN_ONLY ? "⚠️  check-apologize-pattern (warn)" : "✗ check-apologize-pattern";
console.error(`\n${header}: ${offenders.length} apology hedge(s) in customer copy\n`);
console.error('Brand-voice doc "What we never do": never apologize for things that aren\'t our fault.');
console.error('Apology concedes fault on something often explicitly framed as not-warranted.');
console.error("  ✗ \"We apologize for the inconvenience.\" → ✓ direct factual statement");
console.error("  ✗ \"We're sorry, the menu is loading.\" → ✓ \"Menu's slow today — here's how to order\"");
console.error("");
for (const o of offenders) {
  console.error(`  ${o.file}:${o.line} — matched "${o.match}"`);
  console.error(`    ${o.snippet}`);
}
console.error("\nFix: drop the apology, lead with the action or fact. See v18.105 + v18.705 swaps.\n");

process.exit(WARN_ONLY ? 0 : 1);
