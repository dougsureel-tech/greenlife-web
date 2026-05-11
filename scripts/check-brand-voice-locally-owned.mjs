/**
 * Brand-voice "locally owned" residual arc-guard.
 *
 * Pins the v25.305 + v25.505 + v17.105 + v17.805 + v17.905 + v18.005 +
 * v26.805 + v26.905 cross-store sweeps that stripped "locally owned" /
 * "independently owned" / "Wenatchee's favorite shop" / "Locally Owned"
 * framings against future regression.
 *
 * Doug 2026-05-02 directive: NO "locally owned" framing in customer-facing
 * copy because ownership change is coming — "locally owned" could become
 * inaccurate when ownership changes + journalists / AI engines indexing the
 * site would quote stale framing. Tenure-as-credential ("12+ years on
 * Center Road", "since 2010", "same crew since opening") is the doctrine.
 *
 * The session that built this guard caught the bug class in:
 *   - app/page.tsx (scc home — defended by stale code comment)
 *   - app/opengraph-image.tsx (social-share card)
 *   - app/llms.txt + llms-full.txt (AI-engine feeds — biggest reach)
 *   - app/order/OrderMenu.tsx (high-conversion surface)
 *   - app/press/page.tsx (Owner row + body)
 *   - components/Reviews.tsx (fabricated testimonial)
 *   - components/SiteFooter.tsx (sister-store cross-link)
 *   - lib/welcome-email.ts ("favorite shop" superlative — same bug-class
 *     family)
 *
 * Bug-class survives in pieces between sweeps because each new copy ship
 * can re-introduce it. Defensive code comments justifying exemptions ARE
 * the trap — the v17.805 catch was hidden by a comment saying "Locally
 * owned framing stays here per the SCC positioning."
 *
 * Patterns flagged:
 *   - "locally owned" / "Locally Owned" / "Locally-Owned"
 *   - "independently owned" / "Independently Owned"
 *   - "family owned" / "Family-Owned" — for the dispensary itself (NOT
 *     for brand pages describing 3rd-party brand ownership which is OK)
 *   - "Wenatchee's favorite shop" / "Seattle's favorite shop" / similar
 *     possessive-superlative-shop framing
 *
 * NOT flagged (allowed):
 *   - Code comments (// or block) — defensive comments + guard comments
 *     fine
 *   - app/brands/[slug]/_brands/* — brand pages describing their OWN
 *     ownership are legitimate (Agro Couture IS family-owned)
 *   - scripts/ — this guard + its commit messages
 *   - changelog/ + lib/version.ts — historical changelog entries
 *
 * Run via:
 *   node scripts/check-brand-voice-locally-owned.mjs           # strict
 *   node scripts/check-brand-voice-locally-owned.mjs --warn    # warn-only
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const WARN_ONLY = process.argv.includes("--warn");
const SCAN_DIRS = ["app", "components", "lib"];
const EXTENSIONS = new Set([".ts", ".tsx"]);

// Allowlist by path prefix (relative to ROOT).
const EXEMPT_PREFIXES = [
  "app/brands/[slug]/_brands/", // 3rd-party brand pages legitimately describe their own ownership
  "scripts/",
  "lib/version.ts", // changelog entries describe the rule retrospectively
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

// Remove both line + block comments so guard-aware comments don't trip.
function stripComments(src) {
  let out = src.replace(/\/\*[\s\S]*?\*\//g, "");
  out = out.replace(/\/\/[^\n]*/g, "");
  return out;
}

// Patterns that indicate brand-voice ownership-claim residuals.
const PATTERNS = [
  /\blocally[\s-]owned\b/gi,
  /\bindependently[\s-]owned\b/gi,
  // family-owned only flagged for the dispensary itself — brand pages exempt above
  /\bfamily[\s-]owned\b/gi,
  // possessive-superlative-shop framing
  /\bWenatchee['']s\s+favorite\s+shop\b/gi,
  /\bSeattle['']s\s+favorite\s+shop\b/gi,
  /\bRainier\s+Valley['']s\s+favorite\s+shop\b/gi,
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
      for (const re of PATTERNS) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(line)) !== null) {
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
}

if (offenders.length === 0) {
  console.log(
    `✓ check-brand-voice-locally-owned: 0 ownership-claim residuals (Doug 2026-05-02 directive pinned across v25.305 + v25.505 + v17.X05 + v26.X05 sweeps)`,
  );
  process.exit(0);
}

const header = WARN_ONLY
  ? "⚠️  check-brand-voice-locally-owned (warn)"
  : "✗ check-brand-voice-locally-owned";
console.error(`\n${header}: ${offenders.length} ownership-claim residual(s) found\n`);
console.error(
  "Doug 2026-05-02 directive: NO 'locally owned' framing in customer-facing copy",
);
console.error("(ownership change coming — could become inaccurate). Tenure-as-credential is the");
console.error("doctrine: 'since 2010' / 'same crew' / 'X years on Center Road'.\n");
for (const o of offenders) {
  console.error(`  ${o.file}:${o.line} — matched "${o.match}"`);
  console.error(`    ${o.snippet}`);
}
console.error(
  "\nFix: swap to tenure-framing. See v17.805 / v25.505 / v17.105 changelog for canonical swaps.",
);
console.error("Exempt if this is brand-page copy about a 3rd-party producer that IS family-owned");
console.error("(e.g. Agro Couture) — add file to EXEMPT_PREFIXES with documented rationale.\n");

process.exit(WARN_ONLY ? 0 : 1);
