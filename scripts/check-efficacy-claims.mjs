/**
 * WSLCB efficacy-claim arc-guard (WAC 314-55-155).
 *
 * Pins the v17.305 + v17.505 + v17.605 + v26.105 + v26.305 + v26.405 +
 * v18.305 + v27.005 sweeps that stripped predictable-effect-attribution
 * claims from /learn + /faq + /blog (×3 posts) + quiz-nurture-email.
 *
 * Doctrine: per WAC 314-55-155, tying a cannabis compound or category to
 * a predictable therapeutic effect is forbidden. Preference framing
 * ("people pick this for body-heavy sessions") is allowed; causation
 * framing ("myrcene tends toward sedating") is not.
 *
 * This guard flags the high-confidence causation-verb + compound pairs
 * that recur across customer-facing surfaces. It is INTENTIONALLY
 * conservative — only flags the strongest patterns to avoid false-
 * positive noise. A separate communications-expert review picks up
 * subtler hedge cases.
 *
 * Patterns flagged:
 *   - "tends toward sedating" / "tends to feel sedating" / "tends to feel uplifting"
 *   - "often uplifting" / "often sedating" / "often calming" (predictable-effect)
 *   - "calmer cannabinoid" (CBD pharmacological comparative)
 *   - "takes the edge off" (symptom-management hedge)
 *   - "good for sleep" / "good for anxiety" / "good for pain" (condition framing)
 *   - "helps with anxiety" / "helps with sleep" / "helps with pain"
 *   - "relieves pain" / "relieves anxiety"
 *   - "treats anxiety" / "cures X" (when "X" is a condition word)
 *   - "anti-anxiety" / "anxiolytic" / "anti-inflammatory" / "analgesic"
 *   - "Senior discount" (vs canonical "Wisdom discount")
 *
 * NOT flagged (allowed):
 *   - Comments (// or /* *\/) — guard-aware
 *   - app/brands/[slug]/_brands/* — brand-page descriptions can use their
 *     own brand-marketing language; that's their voice not ours
 *   - scripts/, lib/version.ts (changelog)
 *   - Side-effect contexts ("anxiety, racing heart" in overconsumption
 *     symptoms) — these are honest adverse-effect reporting, not claims
 *     of efficacy. The guard's regex requires causation framing.
 *
 * Run via:
 *   node scripts/check-efficacy-claims.mjs           # strict
 *   node scripts/check-efficacy-claims.mjs --warn    # warn-only
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const WARN_ONLY = process.argv.includes("--warn");
const SCAN_DIRS = ["app", "components", "lib"];
const EXTENSIONS = new Set([".ts", ".tsx"]);

const EXEMPT_PREFIXES = [
  "app/brands/[slug]/_brands/", // 3rd-party brand pages use their own marketing voice
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

// Patterns + the rule they enforce.
const PATTERNS = [
  // Causation verbs tied to predictable effects
  {
    rx: /\btends?\s+(?:toward|to\s+feel)\s+(?:sedating|sedative|uplifting|calming|relaxing)\b/gi,
    rule: "predictable-effect causation",
  },
  {
    rx: /\btends?\s+toward\s+(?:more\s+)?(?:sedating|sedative|uplifting|energizing|calming|relaxing)/gi,
    rule: "predictable-effect causation (with 'more' qualifier)",
  },
  {
    rx: /\boften\s+(?:sedating|uplifting|calming|relaxing)\b/gi,
    rule: "predictable-effect attribution",
  },
  // "associated with relaxing/energizing/uplifting effects" — common in
  // AI-feed style "indica is associated with X effects" sentences. Caught
  // v19.905 in llms-full.txt that earlier regex missed.
  {
    rx: /\bassociated\s+with\s+(?:relaxing|energizing|uplifting|sedating|calming)/gi,
    rule: "predictable-effect attribution (associative)",
  },
  // Pharmacological / therapeutic verbs
  { rx: /\btakes?\s+the\s+edge\s+off\b/gi, rule: "symptom-management hedge" },
  { rx: /\bcalmer\s+cannabinoid\b/gi, rule: "pharmacological comparative" },
  { rx: /\bcalms?\s+the\s+THC\s+effect\b/gi, rule: "predictable-effect attribution" },
  // Therapeutic-verb + condition-noun pairings
  {
    rx: /\bhelps?\s+with\s+(?:anxiety|insomnia|sleep|pain|depression|PTSD|nausea)\b/gi,
    rule: "therapeutic claim",
  },
  {
    rx: /\bgood\s+for\s+(?:anxiety|insomnia|sleep|pain|depression|PTSD|nausea|stress)\b/gi,
    rule: "therapeutic claim",
  },
  {
    rx: /\brelieves?\s+(?:anxiety|insomnia|pain|stress|nausea|inflammation|chronic)/gi,
    rule: "therapeutic claim",
  },
  {
    rx: /\btreats?\s+(?:anxiety|insomnia|pain|depression|PTSD|nausea|inflammation)/gi,
    rule: "therapeutic claim",
  },
  // Pharmacological / clinical descriptors
  { rx: /\banti[\s-]?anxiety\b/gi, rule: "pharmacological descriptor" },
  { rx: /\banxiolytic\b/gi, rule: "pharmacological descriptor" },
  { rx: /\banti[\s-]?inflammatory\b/gi, rule: "pharmacological descriptor" },
  { rx: /\banalgesic\b/gi, rule: "pharmacological descriptor" },
  // Senior-vs-Wisdom doctrine
  { rx: /\bSenior\s+discount\b/g, rule: "Senior→Wisdom rename (Doug 2026-05 dignity)" },
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
    `✓ check-efficacy-claims: 0 WSLCB therapeutic-claim residuals (WAC 314-55-155 doctrine pinned across /learn + /faq + /blog + quiz-nurture sweeps)`,
  );
  process.exit(0);
}

const header = WARN_ONLY ? "⚠️  check-efficacy-claims (warn)" : "✗ check-efficacy-claims";
console.error(`\n${header}: ${offenders.length} potential WSLCB efficacy-claim residual(s)\n`);
console.error(
  "WAC 314-55-155 forbids tying a cannabis compound or category to a predictable",
);
console.error("therapeutic effect. Preference framing is allowed:");
console.error("  ✓ 'people pick this for body-heavy sessions'");
console.error("  ✗ 'myrcene tends toward sedating'");
console.error("");
for (const o of offenders) {
  console.error(`  ${o.file}:${o.line} — [${o.rule}] matched "${o.match}"`);
  console.error(`    ${o.snippet}`);
}
console.error(
  "\nFix: reframe to preference verbs. See v17.305 (learn) + v17.505 (faq) + v17.605 (blog) for canonical swaps.",
);
console.error(
  "Exempt if context is honest adverse-effect reporting (e.g., 'anxiety' in symptom list for over-consumption)",
);
console.error("— add file or specific line pattern to EXEMPT logic in this script.\n");

process.exit(WARN_ONLY ? 0 : 1);
