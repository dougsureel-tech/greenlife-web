/**
 * Loyalty-math drift arc-guard.
 *
 * Pins the v17.405 + v17.505 + v18.205 + v26.205 + v26.305 + v26.905
 * sweeps that fixed loyalty-math drift across /deals + /faq + welcome-
 * email cross-stack.
 *
 * Canonical loyalty math per docs/brand-voice.md (Doug 2026-05-07 spec):
 *   - Earn rate: 0.5pt/$1 if opted-in to SMS or email, 0.25pt/$1 if
 *     neither. NOT 1pt/$1 universal.
 *   - Redemption: SLIDING LADDER, not linear $1/100pt:
 *       50pt  → 5% off
 *       100pt → 10% off
 *       200pt → 20% off
 *       250pt → 25% off
 *       300pt → 30% off (basket under $75)
 *       400pt → 30% off (basket $75+)
 *
 * Marketing copy must state the canonical math, not the linear shortcut.
 *
 * KNOWN DIVERGENCE (intentionally exempt):
 *   - `lib/portal.ts` POINTS_PER_DOLLAR = 100 — implementation computes
 *     `dollarValue: Math.floor(points / 100)`. This is the deployed
 *     math; changing it is Doug-decision (requires POS-register parity).
 *   - `components/LoyaltyCard.tsx` — renders dollarValue from portal.ts;
 *     keeping the display consistent with the underlying implementation
 *     is more important than matching marketing copy until the bigger
 *     fix lands.
 *
 * Patterns flagged (in customer marketing copy only):
 *   - "1 point per $1" / "1 pt per $1" / "1pt per $1"
 *   - "100 points = $1" / "100pt = $1" / "100 pts = $1"
 *   - "$1 off" tied to "100 points/pts"
 *
 * Run via:
 *   node scripts/check-loyalty-math-drift.mjs           # strict
 *   node scripts/check-loyalty-math-drift.mjs --warn    # warn-only
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const WARN_ONLY = process.argv.includes("--warn");
const SCAN_DIRS = ["app", "components", "lib"];
const EXTENSIONS = new Set([".ts", ".tsx"]);

const EXEMPT_PREFIXES = [
  "lib/portal.ts", // deployed dollarValue math — Doug-decision divergence
  "components/LoyaltyCard.tsx", // displays portal.ts dollarValue; consistent with implementation
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

const PATTERNS = [
  // Linear earn rate drift
  { rx: /\b1\s+(?:point|pt)\s+per\s+\$1\b/gi, rule: "linear earn rate (canon: 0.5pt/$1 opted-in)" },
  // Linear redemption drift
  { rx: /\b100\s*(?:points?|pts)\s*=\s*\$1\b/gi, rule: "linear redemption (canon: 100pt→10%)" },
  // Loose redemption hints
  { rx: /\$1\s*off\s+(?:per|every)\s+100\s*(?:points?|pts)\b/gi, rule: "linear redemption" },
];

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
      for (const { rx, rule } of PATTERNS) {
        rx.lastIndex = 0;
        let m;
        while ((m = rx.exec(line)) !== null) {
          offenders.push({
            file: rel,
            line: i + 1,
            snippet: line.trim().slice(0, 120),
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
    `✓ check-loyalty-math-drift: 0 marketing-copy residuals (Doug 2026-05-07 spec pinned across /deals + /faq + welcome-email sweeps; lib/portal.ts + LoyaltyCard.tsx exempt as known implementation divergence)`,
  );
  process.exit(0);
}

const header = WARN_ONLY ? "⚠️  check-loyalty-math-drift (warn)" : "✗ check-loyalty-math-drift";
console.error(`\n${header}: ${offenders.length} loyalty-math drift residual(s)\n`);
console.error("Canonical (docs/brand-voice.md, Doug 2026-05-07 spec):");
console.error("  Earn rate: 0.5pt/$1 (opted-in) or 0.25pt/$1 (neither) — NOT 1pt/$1");
console.error("  Redemption: SLIDING LADDER (50pt→5%, 100pt→10%, ..., 400pt→30%)");
console.error("              NOT linear $1/100pt\n");
for (const o of offenders) {
  console.error(`  ${o.file}:${o.line} — [${o.rule}] matched "${o.match}"`);
  console.error(`    ${o.snippet}`);
}
console.error("\nFix: state the sliding ladder. See v18.205 welcome-email or v17.505 /faq for canonical.");
console.error("Exempt only if this is internal implementation that needs to stay consistent with");
console.error("lib/portal.ts (e.g. tier-progress math) — document in EXEMPT_PREFIXES.\n");

process.exit(WARN_ONLY ? 0 : 1);
