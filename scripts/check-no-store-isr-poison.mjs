/**
 * ISR-poisoning `cache: "no-store"` arc-guard.
 *
 * Pins the v20.405 + v20.605 + v18.805 fix arc against regression.
 *
 * Bug class: Server Components calling `fetch(..., { cache: "no-store" })`
 * silently opt the ENTIRE page out of ISR — even if the page exports
 * `revalidate = 60`. Caught 3 times already on glw (homepage + /visit +
 * /menu) — each one a "is my page caching at the edge?" investigation
 * that took ~30 min to track to a single offending internal fetch.
 *
 * Sister bug-class is `prewarmDutchieMenu()` in /menu which used no-store
 * for fire-and-forget Jane CDN warming — same poison-the-tree pattern.
 *
 * This guard flags every `cache: "no-store"` usage in code under `app/`
 * and `lib/` (excluding comments). One allowed exception: the closure-
 * status helper at `lib/closure-status.ts` which DEFAULTS to no-store
 * but accepts a `revalidate` option that callers MUST pass on any
 * page they want to participate in ISR.
 *
 * If new code legitimately needs no-store (e.g. /api routes that are
 * already dynamic), add the file to EXEMPT. Document the rationale.
 *
 * Memory pin: `feedback_isr_killed_by_no_store_fetch`.
 *
 * Run via:
 *   node scripts/check-no-store-isr-poison.mjs           # strict
 *   node scripts/check-no-store-isr-poison.mjs --warn    # warn-only
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const WARN_ONLY = process.argv.includes("--warn");
const SCAN_DIRS = ["app", "lib"];
const EXTENSIONS = new Set([".ts", ".tsx"]);
const EXEMPT_FILES = new Set([
  "lib/closure-status.ts", // intentional default-to-no-store; callers opt into revalidate
]);

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

// Strip line comments + block comments to avoid flagging discussion text.
function stripComments(src) {
  // Block comments first (greedy across lines).
  let out = src.replace(/\/\*[\s\S]*?\*\//g, "");
  // Then line comments.
  out = out.replace(/\/\/[^\n]*/g, "");
  return out;
}

const offenders = [];
for (const dir of SCAN_DIRS) {
  const root = join(ROOT, dir);
  for (const file of walk(root)) {
    const rel = relative(ROOT, file);
    if (EXEMPT_FILES.has(rel)) continue;
    let src;
    try {
      src = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const stripped = stripComments(src);
    // Match the literal pattern with single or double quotes.
    const re = /cache\s*:\s*["']no-store["']/g;
    let m;
    while ((m = re.exec(stripped)) !== null) {
      // Compute line number by counting newlines in the ORIGINAL source
      // up to a heuristic match — stripped offsets diverge from raw so
      // walk the original to find the closest occurrence after the
      // stripped offset to anchor it.
      const rawMatch = src.indexOf("cache");
      // Cheap-but-correct: report file-level, since exact line in raw
      // requires re-scanning each match in raw. Operator can grep the
      // file once it's flagged.
      offenders.push({ file: rel });
      break; // one report per file is enough — operator can grep
    }
  }
}

if (offenders.length === 0) {
  console.log(`✓ check-no-store-isr-poison: 0 unguarded \`cache: "no-store"\` usages`);
  process.exit(0);
}

const header = WARN_ONLY ? "⚠️  check-no-store-isr-poison (warn)" : "✗ check-no-store-isr-poison";
console.error(`\n${header}: ${offenders.length} file(s) use \`cache: "no-store"\` outside the exempt allowlist\n`);
console.error("Server Components calling fetch with cache: \"no-store\" silently opt the");
console.error("entire page out of ISR (revalidate is overridden). This bug class has bit");
console.error("glw 3 times (homepage + /visit + /menu). Each was ~30 min to track.\n");
for (const o of offenders) {
  console.error(`  ${o.file}`);
}
console.error("\nFix: pass { next: { revalidate: N } } instead. If no-store is genuinely");
console.error("required (e.g. an /api route already dynamic), add the file to EXEMPT_FILES");
console.error("in this script with documented rationale.\n");
console.error("Memory pin: feedback_isr_killed_by_no_store_fetch.\n");

process.exit(WARN_ONLY ? 0 : 1);
