/**
 * WAC 314-55-155 strain-body compliance gate — visible-HTML scan of `lib/strains.ts`.
 *
 * Sister of:
 *   - `scripts/check-efficacy-claims.mjs`           — causation-verb gate (broad scan)
 *   - `scripts/check-wac-314-55-155-banned-claims.mjs` — noun-form claim gate (broad scan)
 *   - `lib/strain-product-json-ld.ts` `scrubWslcbClaims` — JSON-LD scrubber (Product schema)
 *
 * Why a SEPARATE strain-body-focused gate:
 *   The `scrubWslcbClaims` regex protects the Product JSON-LD that crawlers
 *   read. The hand-curated `intro` / `faqs[].a` / `bestFor` strings in
 *   `lib/strains.ts` are emitted RAW to the visible HTML body. A future
 *   copy edit (or AI agent ship) adding "helps with sleep" to `bestFor`
 *   would silently ship a WSLCB 314-55-155 violation past the JSON-LD
 *   scrubber. Doug's pinned anti-pattern
 *   `feedback_copy_paste_template_amplifies_compliance_defects_2026_05_26`
 *   shows one template phrase amplifying to 28+ violations.
 *
 *   This gate complements the two broad gates by adding STRAIN-PAGE-SPECIFIC
 *   categories the broad gates miss: wellness-brand markers, effect-on-you
 *   constructions, therapeutic-dosing phrases. It scans ONLY `lib/strains.ts`
 *   (the highest-amplification surface — 250 strains × ~6 prose fields each).
 *
 * Doctrine (per WSLCB Washington Administrative Code 314-55-155):
 *   Cannabis advertising must NOT advertise that a product "treats or
 *   alleviates symptoms of any medical condition." Preference framing
 *   ("people pick this for body-heavy sessions") is allowed; causation
 *   framing ("makes you sleepy") is not. Wellness-brand framing
 *   ("elevate your journey") crosses into lifestyle-medicine territory
 *   and is the exact tone WSLCB enforcement letters cite.
 *
 * Banned-phrase regex bank (this gate, NEW categories):
 *   - Wellness-brand markers — `elevate|elevating|journey|wellness moment|
 *     intentional sesh|mindful|holistic` (lifestyle-medicine tone)
 *   - Effect-on-you constructions — `makes you (high|stoned|sleepy|relaxed|
 *     focused)`, `gets you (high|stoned)`
 *   - Therapeutic-dosing phrases — `mg recommendation|how much to take|
 *     recommended dosage|recommended dose|therapeutic dose|right dose for|
 *     dose for (anxiety|pain|sleep|...)` (NOT bare `dose`/`dosing` — those
 *     are responsible-consumption guidance like "start with a small dose"
 *     which is customer-helpful and NOT a therapeutic dosing claim)
 *
 * NOT in this gate (covered elsewhere):
 *   - Causation verbs (treats/cures/relieves/helps with X) → `check-efficacy-claims.mjs`
 *   - Bare effect adjectives (sedating/calming) → `check-efficacy-claims.mjs`
 *   - Noun-form claims (Pain relief / Stress relief) → `check-wac-314-55-155-banned-claims.mjs`
 *
 * Strain-name exceptions (proper nouns containing watch-list words):
 *   The gate runs the regex bank against text content but suppresses
 *   matches that are part of a known strain proper noun. STRAIN_NAME_EXEMPTIONS
 *   is the allow-list — extend it when a new strain with a watch-list word
 *   in its name is added. Example: a strain literally called "Healing Touch"
 *   would need an entry so the gate doesn't fire on its `name` field.
 *
 * False-positive corpus (the gate must NOT flag these — see pin tests):
 *   - "cure date" (cannabis curing process is legitimate operator vocab)
 *   - "energy-saving" (incidental "energy")
 *   - "Wedding Cake's relaxed family tree" (adjective on noun-phrase, not effect)
 *   - "start with a small dose" (responsible-consumption guidance, not therapeutic dosing)
 *   - "half-dose or less" (consumption-amount guidance, not therapeutic recommendation)
 *
 * Output:
 *   ✓ check-strain-body-claims: 0 banned-phrase hits across <N> strains
 *   ✗ check-strain-body-claims: <N> potential WAC 314-55-155 violation(s) in strain bodies
 *
 * Run:
 *   node scripts/check-strain-body-claims.mjs           # strict (default)
 *   node scripts/check-strain-body-claims.mjs --warn    # warn-only
 */

import { readFileSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const WARN_ONLY = process.argv.includes("--warn");
const STRAINS_PATH = join(ROOT, "lib/strains.ts");

// Strain-name proper nouns that contain a watch-list word. The gate
// suppresses match-hits inside these substrings. Sorted longest-first
// for greedy substring detection.
const STRAIN_NAME_EXEMPTIONS = [
  // None currently — no strain in the corpus has a wellness/effect-on-you/
  // therapeutic-dosing word in its proper name. When a strain like
  // "Mindful Mango" gets added, add its name here so the gate's
  // `mindful` regex doesn't fire on it.
];

// Wellness-brand markers — lifestyle-medicine tone WSLCB enforcement
// letters call out. Word-boundary anchored, case-insensitive.
const WELLNESS_MARKER_PATTERNS = [
  { rx: /\belevate\b/gi, rule: "wellness-brand marker ('elevate')" },
  { rx: /\belevating\b/gi, rule: "wellness-brand marker ('elevating')" },
  { rx: /\bjourney\b/gi, rule: "wellness-brand marker ('journey')" },
  { rx: /\bwellness\s+moment\b/gi, rule: "wellness-brand marker ('wellness moment')" },
  { rx: /\bintentional\s+sesh\b/gi, rule: "wellness-brand marker ('intentional sesh')" },
  { rx: /\bmindful\b/gi, rule: "wellness-brand marker ('mindful')" },
  { rx: /\bholistic\b/gi, rule: "wellness-brand marker ('holistic')" },
];

// Effect-on-you constructions — "makes you sleepy" is a direct causation
// claim per WAC doctrine. "Gets you high" is the same shape.
const EFFECT_ON_YOU_PATTERNS = [
  {
    rx: /\bmakes\s+you\s+(?:high|stoned|sleepy|relaxed|focused)\b/gi,
    rule: "effect-on-you construction ('makes you X')",
  },
  {
    rx: /\bgets\s+you\s+(?:high|stoned)\b/gi,
    rule: "effect-on-you construction ('gets you X')",
  },
];

// Therapeutic-dosing phrases — ONLY the prescription-tone shape, NOT bare
// "dose"/"dosing". Customer-helpful guidance "start with a small dose"
// is responsible-consumption messaging that WSLCB encourages. The
// boundary line is RECOMMENDATION/MEDICAL framing vs CONSUMPTION-AMOUNT
// framing.
const THERAPEUTIC_DOSING_PATTERNS = [
  {
    rx: /\bmg\s+recommendation\b/gi,
    rule: "therapeutic-dosing phrase ('mg recommendation')",
  },
  {
    rx: /\bhow\s+much\s+to\s+take\b/gi,
    rule: "therapeutic-dosing phrase ('how much to take')",
  },
  {
    rx: /\brecommended\s+dosage\b/gi,
    rule: "therapeutic-dosing phrase ('recommended dosage')",
  },
  {
    rx: /\brecommended\s+dose\b/gi,
    rule: "therapeutic-dosing phrase ('recommended dose')",
  },
  {
    rx: /\btherapeutic\s+dose\b/gi,
    rule: "therapeutic-dosing phrase ('therapeutic dose')",
  },
  {
    rx: /\bright\s+dose\s+for\b/gi,
    rule: "therapeutic-dosing phrase ('right dose for X')",
  },
  {
    rx: /\bdose\s+for\s+(?:anxiety|pain|sleep|insomnia|depression|stress|nausea|cancer|ptsd)\b/gi,
    rule: "therapeutic-dosing phrase ('dose for <condition>')",
  },
];

const ALL_PATTERNS = [
  ...WELLNESS_MARKER_PATTERNS,
  ...EFFECT_ON_YOU_PATTERNS,
  ...THERAPEUTIC_DOSING_PATTERNS,
];

function stripComments(src) {
  // Block comments first, then line comments. We DO scan string literals
  // — the bug class is "banned phrase renders to customer".
  let out = src.replace(/\/\*[\s\S]*?\*\//g, "");
  out = out.replace(/\/\/[^\n]*/g, "");
  return out;
}

function isInsideStrainName(line, matchStart, matchEnd) {
  // Check if the match falls inside a known strain proper noun on this
  // line. STRAIN_NAME_EXEMPTIONS is sorted longest-first to handle
  // overlapping name fragments correctly.
  for (const exemption of STRAIN_NAME_EXEMPTIONS) {
    const idx = line.indexOf(exemption);
    if (idx >= 0 && idx <= matchStart && idx + exemption.length >= matchEnd) {
      return true;
    }
  }
  return false;
}

let src;
try {
  src = readFileSync(STRAINS_PATH, "utf8");
} catch (err) {
  console.error(`✗ check-strain-body-claims: cannot read ${STRAINS_PATH}`);
  console.error(`  ${err.message}`);
  process.exit(WARN_ONLY ? 0 : 1);
}

// Count strains for the "across N strains" report line.
const strainMatchCount = (src.match(/^\s{2}"[a-z0-9-]+":\s*\{$/gm) || []).length;

const stripped = stripComments(src);
const lines = stripped.split("\n");
const offenders = [];

for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i];
  for (const { rx, rule } of ALL_PATTERNS) {
    rx.lastIndex = 0;
    let m;
    while ((m = rx.exec(line)) !== null) {
      if (isInsideStrainName(line, m.index, m.index + m[0].length)) continue;
      offenders.push({
        line: i + 1,
        snippet: line.trim().slice(0, 140),
        match: m[0],
        rule,
      });
    }
  }
}

if (offenders.length === 0) {
  console.log(
    `✓ check-strain-body-claims: 0 banned-phrase hits across ${strainMatchCount} strains (WAC 314-55-155 visible-HTML defense for lib/strains.ts)`,
  );
  process.exit(0);
}

const header = WARN_ONLY ? "⚠️  check-strain-body-claims (warn)" : "✗ check-strain-body-claims";
console.error(`\n${header}: ${offenders.length} potential WAC 314-55-155 violation(s) in strain bodies\n`);
console.error("WAC 314-55-155 forbids cannabis advertising that 'treats or alleviates");
console.error("symptoms of any medical condition' — including wellness-brand framing,");
console.error("effect-on-you constructions, and therapeutic-dosing phrases.");
console.error("");
console.error("Compliant alternatives use FACTUAL + PREFERENCE framing:");
console.error("  ✗ 'elevate your journey'        → ✓ 'people pick this for body-heavy sessions'");
console.error("  ✗ 'makes you sleepy'            → ✓ 'customers often reach for it at the end of the day'");
console.error("  ✗ 'recommended dose for sleep'  → ✓ 'start with a small dose, see how it lands'");
console.error("");
for (const o of offenders) {
  console.error(`  lib/strains.ts:${o.line} — [${o.rule}] matched "${o.match}"`);
  console.error(`    ${o.snippet}`);
}
console.error("");
console.error("Fix: rewrite to preference + factual framing. NOT auto-fixable — Doug-eyes review required.");
console.error("Sister gates: scripts/check-efficacy-claims.mjs (verbs) + scripts/check-wac-314-55-155-banned-claims.mjs (noun-phrases).");
console.error("Bypass for false-positives: add the strain name to STRAIN_NAME_EXEMPTIONS in this gate.");
console.error("");

process.exit(WARN_ONLY ? 0 : 1);
