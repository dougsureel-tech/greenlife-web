/**
 * WAC 314-55-155 banned-claim arc-guard (noun-phrase counterpart).
 *
 * Sister to `check-efficacy-claims.mjs` (causation-verb gate). Together
 * they cover:
 *   - Causation verbs   ("tends toward sedating", "relieves pain")    ← efficacy-claims
 *   - Noun phrases      ("Pain relief", "Stress relief", "sleep aid") ← THIS gate
 *
 * Doctrine: per WAC 314-55-155 (cannabis advertising rules), advertising
 * that "treats or alleviates symptoms of any medical condition" is
 * forbidden. The existing efficacy-claims gate catches verb-form
 * therapeutic claims; this gate catches NOUN-FORM therapeutic claims
 * (bare "Pain relief" listed in a `bestFor` array IS a therapeutic claim
 * even without a causation verb).
 *
 * Origin: WAC_314_55_155_AUDIT_2026_05_26.md surfaced ~50 hits across
 * mirror cannabis-web codebases that the verb-form gate missed.
 *
 * Allowlist + corpus are externalized to `wac-banned-claims.allowlist.json`
 * — future corpus expansion doesn't require touching this script.
 *
 * Run:
 *   node scripts/check-wac-314-55-155-banned-claims.mjs           # strict (default)
 *   node scripts/check-wac-314-55-155-banned-claims.mjs --warn    # warn-only
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, relative } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = process.cwd();
const WARN_ONLY = process.argv.includes("--warn");

const ALLOWLIST_PATH = join(__dirname, "wac-banned-claims.allowlist.json");

let config;
try {
  config = JSON.parse(readFileSync(ALLOWLIST_PATH, "utf8"));
} catch (err) {
  console.error(`✗ check-wac-314-55-155-banned-claims: cannot load allowlist at ${ALLOWLIST_PATH}`);
  console.error(`  ${err.message}`);
  process.exit(1);
}

const SCAN_DIRS = config.scanDirs;
const EXTENSIONS = new Set(config.extensions);
const PATTERNS = config.corpus.patterns.map(({ pattern, rule }) => ({
  rx: new RegExp(pattern, "gi"),
  rule,
}));
const ALLOWLIST_FILES = (config.allowlistFiles || []).map((entry) => entry.path);
const EXCLUDE_PATTERNS = (config.excludePatterns || []).map((p) => new RegExp(p));

// Self-allowlist: the gate script + its allowlist contain banned terms
// by necessity (the corpus IS the corpus).
const SELF_FILES = [
  "scripts/check-wac-314-55-155-banned-claims.mjs",
  "scripts/wac-banned-claims.allowlist.json",
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
    } else {
      const ext = name.slice(name.lastIndexOf("."));
      if (EXTENSIONS.has(ext)) out.push(full);
    }
  }
  return out;
}

function stripCommentsAndStrings(src) {
  // We DO want to flag offending strings inside JSX/literals — the bug
  // class is "bare 'Pain relief' renders to customer". So we strip ONLY
  // comments, not string literals.
  let out = src.replace(/\/\*[\s\S]*?\*\//g, "");
  out = out.replace(/\/\/[^\n]*/g, "");
  return out;
}

function isExcluded(relPath) {
  for (const re of EXCLUDE_PATTERNS) {
    re.lastIndex = 0;
    if (re.test(relPath)) return true;
  }
  return false;
}

function isAllowlisted(relPath) {
  for (const entry of ALLOWLIST_FILES) {
    // Entry can be a file path or a directory prefix (trailing slash).
    if (entry.endsWith("/")) {
      if (relPath.startsWith(entry)) return true;
    } else if (relPath === entry) {
      return true;
    }
  }
  return false;
}

function isSelf(relPath) {
  return SELF_FILES.some((s) => relPath === s || relPath.endsWith("/" + s));
}

const offenders = [];
for (const dir of SCAN_DIRS) {
  const root = join(ROOT, dir);
  for (const file of walk(root)) {
    const rel = relative(ROOT, file);
    if (isSelf(rel)) continue;
    if (isExcluded(rel)) continue;
    if (isAllowlisted(rel)) continue;
    let src;
    try {
      src = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const stripped = stripCommentsAndStrings(src);
    const lines = stripped.split("\n");
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      for (const { rx, rule } of PATTERNS) {
        rx.lastIndex = 0;
        let m;
        while ((m = rx.exec(line)) !== null) {
          offenders.push({
            file: rel,
            line: i + 1,
            snippet: line.trim().slice(0, 140),
            match: m[0],
            rule,
          });
        }
      }
    }
  }
}

if (offenders.length === 0) {
  console.log(
    `✓ check-wac-314-55-155-banned-claims: 0 unallowlisted WAC noun-phrase residuals (sister of check-efficacy-claims; ${PATTERNS.length} patterns · ${ALLOWLIST_FILES.length} allowlist entries)`,
  );
  process.exit(0);
}

const header = WARN_ONLY
  ? "⚠️  check-wac-314-55-155-banned-claims (warn)"
  : "✗ check-wac-314-55-155-banned-claims";
console.error(`\n${header}: ${offenders.length} potential WAC 314-55-155 noun-phrase claim(s)\n`);
console.error(
  "WAC 314-55-155 forbids advertising that 'treats or alleviates symptoms of",
);
console.error("any medical condition' — including noun-phrase therapeutic claims like");
console.error("'Pain relief' / 'Stress relief' / 'sleep aid'.");
console.error("");
console.error("Compliant alternatives use PREFERENCE framing:");
console.error("  ✗ 'Pain relief'                 → ✓ 'Heavy body session'");
console.error("  ✗ 'Stress relief'               → ✓ 'After-work decompression'");
console.error("  ✗ 'Body soreness'               → ✓ 'Post-activity body unwind'");
console.error("");
for (const o of offenders) {
  console.error(`  ${o.file}:${o.line} — [${o.rule}] matched "${o.match}"`);
  console.error(`    ${o.snippet}`);
}
console.error(
  `\nSee WAC_314_55_155_AUDIT_2026_05_26.md for the full rewrite proposals.`,
);
console.error(
  `To allowlist a file with legitimate use (defensive disclaimer / test fixture / 3rd-party brand bio):`,
);
console.error(
  `  add { "path": "<rel-path>", "reason": "<why>" } to allowlistFiles in scripts/wac-banned-claims.allowlist.json`,
);
console.error("");

process.exit(WARN_ONLY ? 0 : 1);
