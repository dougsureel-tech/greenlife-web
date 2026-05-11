/**
 * Customer-CTA `/order`-href arc-guard.
 *
 * Pins the v15.905 + v16.705 + v22.505 retraction sweeps against future
 * regression. Doug's standing rule (memory pin
 * `feedback_glw_scc_customer_cta_menu_only`): customer CTAs on the
 * cannabis sites MUST point at `/menu`, never `/order`.
 *
 * Why: proxy.ts 307-redirects `/order` and `/order/*` to `/menu`. Every
 * customer-facing `/order` link eats a redirect hop AND drops query
 * params at the proxy boundary (iHJ Boost doesn't honor `?vibe=…`
 * deep-links, so the params are lost forever after the redirect).
 *
 * The sweep has caught hits in:
 *   - components/CartResumeBanner.tsx (cart resume CTA)
 *   - app/api/quiz/capture/route.ts (quiz-match email deep-link)
 *   - app/brands/[slug]/page.tsx (schema.org Offer URL)
 *   - app/llms.txt/route.ts (AI-crawler citation page list)
 *   - app/page.tsx HowTo JSON-LD + FAQ answer prose
 *   - components/SiteFooter.tsx ("Order for Pickup" footer link)
 *   - app/find-your-strain/StrainFinderClient.tsx (buildOrderUrl)
 *
 * Bug-class survives in pieces between sweeps because each new customer
 * copy ship can re-introduce it. This guard ENFORCES the rule.
 *
 * Patterns flagged:
 *   - href="/order"        (JSX literal)
 *   - href={`/order` ...}  (template literal beginning with /order)
 *   - "${STORE.website}/order"  (full canonical URL ending in /order)
 *   - "/order?…"           (URL with query string)
 *
 * NOT flagged (allowed):
 *   - app/order/* itself (the source-side page directory; it renders the
 *     redirect target before proxy.ts catches it in middleware)
 *   - app/dev/* (dev-only surfaces, robots-disallow'd)
 *   - HIDE_ON-style arrays in client banners (defensive, won't render if
 *     the user is somehow on /order)
 *   - proxy.ts itself (declares the redirect)
 *   - app/order/confirmation/* (real route, not /order itself)
 *   - canonical: "/order" in app/order/page.tsx (the page declaring its
 *     own canonical — dead code post-proxy, but declaring self-canonical
 *     isn't a customer-CTA link)
 *   - Comments (// or block-comment syntax)
 *
 * Run via:
 *   node scripts/check-customer-cta-order-href.mjs           # strict
 *   node scripts/check-customer-cta-order-href.mjs --warn    # warn-only
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const WARN_ONLY = process.argv.includes("--warn");
const SCAN_DIRS = ["app", "components", "lib"];
const EXTENSIONS = new Set([".ts", ".tsx"]);

// Allowlist by path prefix (relative to ROOT).
const EXEMPT_PREFIXES = [
  "app/order/",
  "app/dev/",
  "proxy.ts",
  "scripts/", // this guard itself + its comment mentions /order
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

// Patterns that indicate a customer-facing /order link target.
// We require the URL to END at /order or /order?... (not /order/<id> which
// is the confirmation route).
const PATTERNS = [
  // href="/order" or href="/order?..."
  /href\s*=\s*["']\/order(\?[^"']*)?["']/g,
  // href={`/order`} or href={`/order?${...}`}
  /href\s*=\s*\{\s*`\/order(\?[^`]*)?`\s*\}/g,
  // ${...}/order or ${...}/order?... (full-URL template)
  /\$\{[^}]+\}\/order(\?[^"`'\s]*)?["`']/g,
  // redirect("/order") / router.push("/order") / router.replace("/order")
  // Server actions + client-side imperative navigation patterns.
  /\b(redirect|push|replace)\s*\(\s*["']\/order(\?[^"']*)?["']/g,
];

// Lines containing these markers are skipped (defensive arrays, not links).
const SKIP_LINE_MARKERS = ["HIDE_ON", "canonical:"];

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
      if (SKIP_LINE_MARKERS.some((m) => line.includes(m))) continue;
      for (const re of PATTERNS) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(line)) !== null) {
          offenders.push({ file: rel, line: i + 1, snippet: line.trim().slice(0, 120) });
        }
      }
    }
  }
}

if (offenders.length === 0) {
  console.log(`✓ check-customer-cta-order-href: 0 customer-facing /order CTAs (memory pin feedback_glw_scc_customer_cta_menu_only pinned)`);
  process.exit(0);
}

const header = WARN_ONLY ? "⚠️  check-customer-cta-order-href (warn)" : "✗ check-customer-cta-order-href";
console.error(`\n${header}: ${offenders.length} customer-facing /order CTA(s) found\n`);
console.error("Customer CTAs must point at /menu, not /order (proxy.ts 307s /order to /menu;");
console.error("query params are dropped at the redirect). Memory pin:");
console.error("feedback_glw_scc_customer_cta_menu_only.\n");
for (const o of offenders) {
  console.error(`  ${o.file}:${o.line}`);
  console.error(`    ${o.snippet}`);
}
console.error("\nFix: change `/order` to `/menu` (or `/menu?${params}` if deep-linking).");
console.error("Exempt if this is genuinely not a customer CTA: add file to EXEMPT_PREFIXES");
console.error("in this script with documented rationale.\n");

process.exit(WARN_ONLY ? 0 : 1);
