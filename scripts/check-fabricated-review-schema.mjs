/**
 * Fabricated Review / AggregateRating schema arc-guard.
 *
 * Pins the v19.705 (glw) + v13.7405 (scc) strip against future regression.
 * Memory pin: `feedback_fabricated_review_schema_google_policy`.
 *
 * Background: pre-strip, `components/Reviews.tsx` rendered a hardcoded
 * 6-entry REVIEWS array as schema.org `@type: Review` + `AggregateRating`
 * JSON-LD. That violates Google's "self-serving reviews" policy (Search
 * Central guidance on review snippets) — and FTC scrutiny on attributed
 * quotes (names + cities + dates that aren't verifiably real).
 *
 * Caught 2026-05-10 by /loop SEO/AI relevance pivot. Removed: `reviewsLd`
 * const + `<script type="application/ld+json">` tag. Visual testimonial
 * UI kept intact (still social proof; not schema-emitted).
 *
 * Reinstate plan: once the GBP-pull integration ships (Google approval
 * pending Case 0-8857000041037 — see
 * `apps/staff/src/app/api/integrations/gbp/pull-gbp-reviews/route.ts`),
 * we can emit Review/AggregateRating schema from REAL reviews. Until
 * then, this guard ENFORCES the no-fabricated-schema rule.
 *
 * Patterns flagged:
 *   - "@type": "Review"
 *   - "@type": "AggregateRating"
 *   - "@type": "Rating"
 *
 * NOT flagged:
 *   - Comments (// or block-comment syntax)
 *   - `__tests__/` paths
 *   - Files containing /* legitimate-real-reviews-source-of-truth *\/ marker
 *     (when the GBP-pull integration ships and emits real reviews, the
 *     emitting helper opts out via that marker)
 *
 * Run via:
 *   node scripts/check-fabricated-review-schema.mjs           # strict
 *   node scripts/check-fabricated-review-schema.mjs --warn    # warn-only
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const WARN_ONLY = process.argv.includes("--warn");
const SCAN_DIRS = ["app", "components", "lib"];
const EXTENSIONS = new Set([".ts", ".tsx"]);

// Marker comment that opts a file out of this guard (used by the real-
// review GBP-pull integration when it ships).
const OPT_OUT_MARKER = "@review-schema-real-reviews-source";

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
  /"@type"\s*:\s*"Review"/g,
  /"@type"\s*:\s*"AggregateRating"/g,
  /"@type"\s*:\s*"Rating"/g,
];

const offenders = [];
for (const dir of SCAN_DIRS) {
  const root = join(ROOT, dir);
  for (const file of walk(root)) {
    const rel = relative(ROOT, file);
    let src;
    try {
      src = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    if (src.includes(OPT_OUT_MARKER)) continue;
    const stripped = stripComments(src);
    for (const re of PATTERNS) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(stripped)) !== null) {
        const line = stripped.slice(0, m.index).split("\n").length;
        offenders.push({ file: rel, line, pattern: m[0] });
        break;
      }
    }
  }
}

if (offenders.length === 0) {
  console.log(`✓ check-fabricated-review-schema: 0 Review/AggregateRating/Rating schema emissions (memory pin feedback_fabricated_review_schema_google_policy pinned)`);
  process.exit(0);
}

const header = WARN_ONLY ? "⚠️  check-fabricated-review-schema (warn)" : "✗ check-fabricated-review-schema";
console.error(`\n${header}: ${offenders.length} Review/AggregateRating schema emission(s) found\n`);
console.error("Emitting Review or AggregateRating JSON-LD from hardcoded fake reviews");
console.error("violates Google's 'self-serving reviews' policy and risks a structured-data");
console.error("manual action + FTC scrutiny on attributed quotes.\n");
for (const o of offenders) {
  console.error(`  ${o.file}:${o.line}  ${o.pattern}`);
}
console.error("\nFix: remove the schema emission OR wait for the GBP-pull integration");
console.error("(Google approval pending Case 0-8857000041037) and source from REAL reviews.");
console.error("If you've shipped that integration, add the marker comment");
console.error(`'${OPT_OUT_MARKER}' to your file to opt out of this guard.\n`);

process.exit(WARN_ONLY ? 0 : 1);
