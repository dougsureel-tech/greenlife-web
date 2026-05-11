/**
 * Redirect-shadow gate.
 *
 * Fails when a `redirects()` `source:` path in `next.config.ts` matches an
 * existing `app/<path>/page.tsx`.
 *
 * The bug class (sister of GW v2.88.25): Next.js applies `redirects()`
 * BEFORE routing to pages. So if someone adds a new page at
 * `app/get-started/page.tsx` and a legacy redirect entry
 * `{ source: "/get-started", destination: "/?book=1" }` exists in
 * `next.config.ts`, the page is unreachable in prod — every request gets
 * a 308 to the legacy destination instead of serving the new page.
 *
 * Real incident (GW v2.88.05): a /get-started lead-capture landing was
 * shadowed by an older WordPress sitemap-preservation redirect for ~6 hours
 * before post-deploy verification caught it.
 *
 * Correct path:
 * - When adding a new page at `app/<path>/page.tsx`, verify
 *   `next.config.ts` doesn't have a `{ source: "/<path>", ... }` redirect.
 *   Either remove the legacy redirect (preferred — the new page is usually
 *   a better destination than the old redirect target) or rename the page.
 *
 * Sister of GW `check-redirect-shadow.mjs` — same logic, path adjusted
 * for the no-src-prefix glw layout.
 *
 * Run via:
 *   node scripts/check-redirect-shadow.mjs           # strict
 *   node scripts/check-redirect-shadow.mjs --warn    # warn-only
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const APP_DIR = join(ROOT, "app");
const NEXT_CONFIG = join(ROOT, "next.config.ts");
const WARN_ONLY = process.argv.includes("--warn");

// Source paths we deliberately allow to shadow real pages. Empty by default —
// add only with documented rationale.
const EXEMPT = new Set([]);

function extractRedirectSources(text) {
  // Match `source: "/whatever"` — captures the path.
  const re = /source:\s*["']([^"']+)["']/g;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push(m[1]);
  }
  return out;
}

function pageFileFor(sourcePath) {
  // `/get-started` → `app/get-started/page.tsx`
  // Skip wildcards and path params.
  if (sourcePath.includes("(") || sourcePath.includes("*") || sourcePath.includes(":")) {
    return null;
  }
  const trimmed = sourcePath.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!trimmed) return null;
  return join(APP_DIR, trimmed, "page.tsx");
}

const text = readFileSync(NEXT_CONFIG, "utf8");
const sources = extractRedirectSources(text);
const offenders = [];
for (const source of sources) {
  if (EXEMPT.has(source)) continue;
  const pagePath = pageFileFor(source);
  if (pagePath && existsSync(pagePath)) {
    offenders.push({ source, page: pagePath.replace(ROOT + "/", "") });
  }
}

if (offenders.length === 0) {
  console.log(`✓ check-redirect-shadow: 0 redirects shadow existing pages (${sources.length} sources scanned)`);
  process.exit(0);
}

const header = WARN_ONLY ? "⚠️  check-redirect-shadow (warn)" : "✗ check-redirect-shadow";
console.error(`\n${header}: ${offenders.length} redirect(s) shadow real pages\n`);
console.error("Each `source:` entry below has a real page at the same path — the redirect");
console.error("intercepts requests BEFORE Next.js routes to the page, making it unreachable:\n");
for (const o of offenders) {
  console.error(`  source: "${o.source}"  →  shadows  ${o.page}`);
}
console.error("\nFix: remove the redirect entry from next.config.ts `redirects()`, OR");
console.error("rename the page to a different path. The new page is usually a better");
console.error("destination for legacy traffic anyway.");
console.error("\nExemption (rare): add the source to EXEMPT in this script with documented rationale.\n");

process.exit(WARN_ONLY ? 0 : 1);
