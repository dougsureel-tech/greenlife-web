/**
 * "Please" hedge in customer-facing error/validation strings — arc-guard.
 *
 * Pins the v18.605 + v27.305 sweeps that stripped `"Please enter…"` /
 * `"Please complete…"` / etc. hedges from form-validation error strings.
 *
 * Doctrine (brand-voice doc "What we never do" section + v4.565 prior
 * `/apply` form pattern): customer-facing error messages drop the
 * "Please" hedge. Direct instruction reads firmer + matches shop voice.
 *
 *   ✓ "Enter a valid email address."
 *   ✗ "Please enter a valid email address."
 *
 *   ✓ "Try again — usually a connection blip."
 *   ✗ "Please try again."
 *
 * The guard catches the high-confidence action-verb patterns most likely
 * to ship as customer-facing validation/error copy. Intentionally narrow
 * to avoid false-positives on legitimate uses (e.g., WAC compliance copy
 * "Please consume only on private property" — though that's also
 * preferable to drop, the guard doesn't flag general "please consume…"
 * because it could match legal-disclaimer copy where the cadence is OK).
 *
 * Patterns flagged:
 *   "Please enter "    — form-validation prompts (most common hit class)
 *   "Please complete " — form-completion errors
 *   "Please fill "     — form-fill errors
 *   "Please select "   — dropdown / radio errors
 *   "Please choose "   — choice-selection errors
 *   "Please provide "  — generic field-required errors
 *   "Please check "    — review-before-submit nudges
 *   "Please try "      — retry prompts (action-verb hedge)
 *
 * NOT flagged (allowed):
 *   - Comments (// or block-comment)
 *   - app/brands/[slug]/_brands/* — 3rd-party brand-marketing voice
 *   - scripts/, lib/version.ts
 *   - "please consume only…" / "please bring…" / general WAC-compliance
 *     copy — these can be load-bearing in some legal contexts. The
 *     specific 8 verbs above are the high-confidence customer-validation
 *     class.
 *
 * Run via:
 *   node scripts/check-please-hedge.mjs           # strict
 *   node scripts/check-please-hedge.mjs --warn    # warn-only
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const WARN_ONLY = process.argv.includes("--warn");
const SCAN_DIRS = ["app", "components", "lib"];
const EXTENSIONS = new Set([".ts", ".tsx"]);

const EXEMPT_PREFIXES = [
  "app/brands/[slug]/_brands/", // 3rd-party brand voice
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

// Match `"Please <verb> ` inside a JSX/TS string literal.
// The 8 verbs are the high-confidence customer-validation class.
const PATTERN = /["'`]Please\s+(?:enter|complete|fill|select|choose|provide|check|try)\s+/g;

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
          match: m[0].replace(/^["'`]/, "").trim(),
        });
      }
    }
  }
}

if (offenders.length === 0) {
  console.log(
    `✓ check-please-hedge: 0 customer-facing "Please verb" hedges (brand-voice doc "What we never do" + v4.565 + v18.605 + v27.305 sweeps pinned)`,
  );
  process.exit(0);
}

const header = WARN_ONLY ? "⚠️  check-please-hedge (warn)" : "✗ check-please-hedge";
console.error(`\n${header}: ${offenders.length} "Please verb" hedge(s) in customer copy\n`);
console.error(
  'Brand-voice doc + v4.565 + v18.605 sweeps: drop "Please" hedge from customer-facing',
);
console.error("validation/error strings. Direct instruction reads firmer.");
console.error("  ✗ \"Please enter a valid email.\"");
console.error("  ✓ \"Enter a valid email.\"");
console.error("");
for (const o of offenders) {
  console.error(`  ${o.file}:${o.line} — matched "${o.match}"`);
  console.error(`    ${o.snippet}`);
}
console.error(
  "\nFix: drop \"Please \" prefix. See v18.605 form-validation sweep for canonical swaps.",
);
console.error(
  "Exempt if context is legal-WAC compliance copy where the cadence is load-bearing — add to EXEMPT_PREFIXES.\n",
);

process.exit(WARN_ONLY ? 0 : 1);
