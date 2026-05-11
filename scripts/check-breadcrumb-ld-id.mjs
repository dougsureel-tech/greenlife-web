/**
 * BreadcrumbList JSON-LD @id arc-guard.
 *
 * Pins the entity-graph @id-linking pattern (sister of GW T101 v2.97.O0).
 * `lib/breadcrumb-jsonld.ts` emits `@id: ${SITE_URL}${last.url}#breadcrumb`
 * derived from the LAST crumb's URL so sibling JSON-LD nodes (Article,
 * SpecialAnnouncement, CollectionPage, LocalBusiness/Store) can reference
 * the breadcrumb via @id without duplicating the path.
 *
 * Pre-T91 every BreadcrumbList on glw was a dangling node. A regression
 * that drops the @id silently breaks the entity graph on every page.
 *
 * This gate fails the build when `breadcrumbJsonLd()` returns an object
 * literal that doesn't include the literal key `"@id"`.
 *
 * Sister of GW `check-breadcrumb-ld-id.mjs` — same heuristic brace-depth
 * body extraction + key-presence check.
 *
 * Usage: `node scripts/check-breadcrumb-ld-id.mjs`
 * Wired into `pnpm check:breadcrumb-ld-id` + `.githooks/pre-push` build-gates.
 */

import { readFileSync } from "fs";
import { join } from "path";

const SEO_FILE = join(process.cwd(), "lib/breadcrumb-jsonld.ts");
const FN_NAME = "breadcrumbJsonLd";

let src;
try {
  src = readFileSync(SEO_FILE, "utf8");
} catch (err) {
  console.error(`[check-breadcrumb-ld-id] FAIL: cannot read ${SEO_FILE}`);
  console.error(`  ${err.message}`);
  process.exit(2);
}

// Locate the function body via brace-depth tracking from `return {`.
const fnStartRe = new RegExp(`export function ${FN_NAME}[\\s\\S]*?return\\s*\\{`);
const fnStartMatch = src.match(fnStartRe);
if (!fnStartMatch) {
  console.error(
    `[check-breadcrumb-ld-id] FAIL: could not locate \`export function ${FN_NAME}(...)\` + \`return {\` in ${SEO_FILE}. Was the function renamed or removed?`,
  );
  process.exit(1);
}

const bodyStart = fnStartMatch.index + fnStartMatch[0].length;
let depth = 1;
let body = "";
for (let i = bodyStart; i < src.length; i += 1) {
  const ch = src[i];
  if (ch === "{") depth += 1;
  else if (ch === "}") {
    depth -= 1;
    if (depth === 0) {
      body = src.slice(bodyStart, i);
      break;
    }
  }
}

// Heuristic: look for `"@id":` substring inside the function body.
const hasAtId = /(["'])@id\1\s*:/m.test(body);

if (!hasAtId) {
  console.error(
    `[check-breadcrumb-ld-id] FAIL: ${FN_NAME}() is missing the \`@id\` field.`,
  );
  console.error(
    `  Pre-T91 every BreadcrumbList on glw was a dangling node — sibling JSON-LD`,
  );
  console.error(
    `  nodes couldn't reference the breadcrumb via @id. The SoT helper MUST emit`,
  );
  console.error(
    `  \`@id: \\\`\${STORE.website}\${last.url}#breadcrumb\\\`\` (or equivalent).`,
  );
  process.exit(1);
}

console.log(
  `✓ check-breadcrumb-ld-id: ${FN_NAME}() emits @id`,
);
