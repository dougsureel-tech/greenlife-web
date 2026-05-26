/**
 * WSLCB efficacy-claim arc-guard (WAC 314-55-155).
 *
 * Pins the v17.305 + v17.505 + v17.605 + v26.105 + v26.305 + v26.405 +
 * v18.305 + v27.005 + v41.725 sweeps that stripped predictable-effect-
 * attribution claims from /learn + /faq + /blog (×3 posts) + quiz-nurture-
 * email + lib/strains.ts prose layer.
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
 * BARE-ADJECTIVE LAYER (added v41.725):
 * Bare pharmacological-effect adjectives in prose strings are also flagged
 * even without a causation verb — the adjective alone asserts the effect
 * when it appears in a sentence of 15+ characters. The minContextLength
 * guard prevents false-positives on effects[] tag arrays
 * (["Sleepy","Relaxed","Euphoric"] etc.) which are WAC-OK per short-tag-list
 * doctrine and are always < 15 chars in context.
 *
 * Preference-framing wrappers are explicitly exempted: strings that contain
 * "often described as", "many customers describe", "typically reported as",
 * "people pick", "customers pick", "customers reach for", "customers who"
 * upstream of a bare adjective are NOT flagged — reporting what customers
 * say is allowed; making the claim as the shop is not.
 *
 * Code comments (lines starting // after comment-strip) are exempted by the
 * existing stripComments() pass — bare adjectives inside // lines are never
 * scanned.
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
 *   - bare sedating/calming/tranquilizing in prose strings ≥15 chars context
 *   - bare relaxing/uplifting/energizing/focusing/grounding/euphoric/
 *     stimulating/body-relaxing/mood-lifting in prose strings ≥15 chars context
 *
 * NOT flagged (allowed):
 *   - Comments (// or /* *\/) — guard-aware via stripComments()
 *   - app/brands/[slug]/_brands/* — brand-page descriptions can use their
 *     own brand-marketing language; that's their voice not ours
 *   - scripts/, lib/version.ts (changelog)
 *   - Side-effect contexts ("anxiety, racing heart" in overconsumption
 *     symptoms) — these are honest adverse-effect reporting, not claims
 *     of efficacy. The guard's regex requires causation framing.
 *   - effects[] tag arrays — short context (< 15 chars) keeps them below
 *     the minContextLength floor
 *   - Preference-framing wrappers — "often described as X", "customers
 *     who pick X", "customers reach for X when they want Y" — reporting
 *     customer behavior, not making the shop's claim
 *   - BARE_ADJECTIVE_PATTERNS detection strings inside this file itself —
 *     the scripts/ EXEMPT_PREFIX covers this file
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
  "lib/voice-memo.ts", // detection-token file — split strings ARE the banned patterns; not customer-visible
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
  // "X = traditionally relaxing/energizing/uplifting" copula attribution,
  // common in AI-feed Q&A shorthand. Caught v20.005 on glw llms.txt that
  // sister scc had already been fixed at v17.905 but glw drift persisted.
  {
    rx: /=\s+traditionally\s+(?:relaxing|energizing|uplifting|sedating|calming)/gi,
    rule: "predictable-effect attribution (copula)",
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

/**
 * BARE_ADJECTIVE_PATTERNS — v41.725 layer.
 *
 * Catches standalone pharmacological-effect adjectives in prose strings
 * (>= MIN_BARE_ADJ_CONTEXT chars of surrounding context) that the main
 * PATTERNS causation-verb regexes miss.
 *
 * Exemption logic (applied per-line before testing):
 *   (a) Preference-framing wrapper present on the same line — the line
 *       contains "often described as" / "many customers describe" /
 *       "typically reported as" / "customers who" / "customers reach" /
 *       "people pick" / "customers pick" — those report observed customer
 *       behavior rather than making the shop's claim.
 *   (b) Short-context guard — the trimmed line must be >= MIN_BARE_ADJ_CONTEXT
 *       chars. Effects[] tag array members ("Relaxed", "Euphoric", etc.)
 *       appear in short comma-list contexts and never reach this floor.
 *   (c) Comment-strip (already handled upstream by stripComments()).
 *   (d) This script file itself is in EXEMPT_PREFIXES (scripts/).
 */
const MIN_BARE_ADJ_CONTEXT = 15;

const PREFERENCE_FRAMING_WRAPPER_RX =
  /often\s+described\s+as|many\s+customers\s+describe|typically\s+reported\s+as|customers\s+who|customers\s+reach|people\s+pick|customers\s+pick/i;

const BARE_ADJECTIVE_PATTERNS = [
  // Tier 1 — High-confidence WAC-exposure adjectives.
  //
  // "sedating/sedative/tranquilizing" and "calming" make direct pharmacological-
  // effect assertions when used standalone in prose. They were the 22 confirmed
  // GLW residuals in the 2026-05-26 expert review. Gate fires when either:
  //   (a) line >= MIN_BARE_ADJ_CONTEXT chars AND
  //   (b) line does NOT contain a preference-framing wrapper AND
  //   (c) line does NOT match an effects-array pattern (see scanning logic).
  //
  // Exemptions (applied in scanning loop, not here):
  //   - `effects: [...]` array lines — short tag arrays like ["Sleepy","Relaxed"]
  //     are WAC-OK per short-tag-list doctrine (previously vetted)
  //   - Terpene note short strings like `{ name: "Myrcene", note: "earthy, musky" }`
  //     are < 40 chars (MIN_BARE_ADJ_CONTEXT catches them out)
  //   - Preference-framing wrapper lines (PREFERENCE_FRAMING_WRAPPER_RX)
  //
  { rx: /\b(sedating|sedative|tranquilizing)\b/gi, rule: "bare pharmacological adjective — sedating class (WAC 314-55-155)" },
  { rx: /\bcalming\b/gi, rule: "bare pharmacological adjective — calming (WAC 314-55-155)" },
  // Tier 2 — Compound-form pharmacological descriptors.
  //
  // "body-relaxing" and "mood-lifting" tie cannabis directly to physiological
  // and psychological effects as compound descriptors. Both were confirmed
  // residuals in the cross-repo review. Gate prevents re-drift post-v41.725 sweep.
  //
  { rx: /\bbody[\s-]relaxing\b/gi, rule: "bare pharmacological compound — body-relaxing (WAC 314-55-155)" },
  { rx: /\bmood[\s-]lifting\b/gi, rule: "bare pharmacological compound — mood-lifting (WAC 314-55-155)" },
  // Tier 3 — Broader effect-pattern adjectives (watch-list tier, not yet gated).
  //
  // relaxing, uplifting, energizing, focusing, grounding, stimulating, euphoric
  // appear in many existing reviewed-and-accepted contexts (e.g. terpene notes
  // like "fresh pine, focusing", effects[] tags like ["Euphoric"], experience-
  // pattern prose like "head-up uplifting effect"). These are structurally
  // WAC-adjacent but context-dependent — a blanket gate would fire on 100+
  // existing accepted uses.
  //
  // Doctrine (v41.725): Tier 3 is documented here as WATCH-LIST. When a new
  // copy agent adds one of these words in a standalone-descriptor context (not
  // behind a preference-framing wrapper, not in an effects[] array, not in a
  // terpene-note short-string), the communications-expert review will catch it
  // in the periodic cross-repo audit. Promote to active gate rules as accepted
  // uses are migrated away — track in the compliant-adjective-map.md follow-up.
  //
  // Tier 3 words: relaxing · uplifting · energizing · focusing · grounding ·
  //               stimulating · euphoric
  //
  // (not yet active — uncomment + run a fix pass before enabling)
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
      // --- Main causation-verb patterns ---
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
      // --- Bare-adjective layer (v41.725) ---
      // Skip short lines (terpene-note short strings like `"earthy, musky"` don't
      // reach MIN_BARE_ADJ_CONTEXT). Skip effects[] tag-array lines (WAC-OK per
      // short-tag-list doctrine). Skip preference-framing wrapper lines.
      if (
        line.trim().length >= MIN_BARE_ADJ_CONTEXT &&
        !/\beffects\s*:\s*\[/.test(line) &&
        !PREFERENCE_FRAMING_WRAPPER_RX.test(line)
      ) {
        for (const { rx, rule } of BARE_ADJECTIVE_PATTERNS) {
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
