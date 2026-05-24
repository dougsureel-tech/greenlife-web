#!/usr/bin/env node
//
// check-internal-link-orphans — SEO health check.
//
// Google de-prioritizes pages with zero inbound internal links. With
// 250 strain pages + 150+ near/learn pages, it's easy for some routes
// to become unreachable from any other page in the site.
//
// This script:
//   1. Crawls the local Next.js source for all routes:
//      - Walks app/**/page.tsx for static route shapes
//      - Expands dynamic [slug] / [town] / [cohort] etc. segments
//        against the data SoT files (lib/strains.ts, lib/posts.ts,
//        lib/learn-hub.ts, lib/near-towns.ts, lib/strain-families.ts,
//        lib/strain-types.ts, lib/ambassador-briefs.ts).
//   2. Grep the whole source tree for `<Link href="..."` + `href="..."`
//      patterns to build the internal-link graph.
//   3. Flags routes with zero inbound links from any other route.
//
// Exit 0 if zero orphans, exit 1 if any (CI-integration ready).
//
// Run:
//   node scripts/check-internal-link-orphans.mjs
//   pnpm check:orphans
//
// Excluded surfaces (intentionally orphan-OK):
//   - app/api/**            — not pages
//   - app/dev*/**           — internal-only
//   - app/_*/               — convention private
//   - app/sign-in/**,
//     app/sign-up/**        — auth UI, linked via Clerk header
//   - app/**/thanks/        — thank-you confirmations, linked from form
//                              action redirects (not visible in source grep)
//   - app/account/**        — auth-gated account surfaces (linked from
//                              header dropdown which is rendered
//                              conditionally on auth state)
//   - app/order/confirmation/[id] — server-redirected after checkout
//   - app/quiz/unsubscribe  — linked from outbound email only

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const REPO_ROOT = process.cwd();
const APP_DIR = join(REPO_ROOT, "app");

const EXCLUDED_ROUTE_PREFIXES = [
  "/api/",
  "/dev",
  "/devmenu",
  "/_",
  "/sign-in",
  "/sign-up",
  "/account",
  "/order/confirmation",
  "/quiz/unsubscribe",
  "/stash",         // robots:noindex, gated client surface
  "/alumni",        // robots:noindex, gated
];

// Routes that legitimately have no inbound source-grep links (linked
// from external surfaces only — e.g. /thanks pages are post-submit
// redirects from server actions; /menu-preview is staff-only).
const ORPHAN_EXEMPT = new Set([
  "/menu-preview",  // dev/staff-only
  "/rewards/login", // SCC: linked from email magic-link only
  "/rewards/verify",
  "/rewards/redeem",
]);

function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry === "node_modules" || entry === ".next" || entry === ".git") continue;
    const full = join(dir, entry);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

// Convert app/**/page.tsx absolute path → URL route shape.
// Examples:
//   app/page.tsx                              → /
//   app/blog/page.tsx                         → /blog
//   app/blog/[slug]/page.tsx                  → /blog/[slug]
//   app/strains/families/[family]/page.tsx    → /strains/families/[family]
//   app/sign-in/[[...sign-in]]/page.tsx       → /sign-in
//   app/(group)/foo/page.tsx                  → /foo  (route-group erased)
export function pageFileToRoute(file, appDir = APP_DIR) {
  let rel = relative(appDir, file);
  if (!rel.endsWith("page.tsx")) return null;
  rel = rel.replace(/\/?page\.tsx$/, "");
  if (!rel) return "/";
  const segments = rel.split("/").filter(Boolean);
  const kept = [];
  for (const seg of segments) {
    // Route group: (foo) — erased from URL
    if (seg.startsWith("(") && seg.endsWith(")")) continue;
    // Catch-all & optional catch-all: [[...slug]] / [...slug] — erased
    // since they match the parent path (Clerk auth pages do this).
    if (/^\[\[?\.\.\..+?\]\]?$/.test(seg)) continue;
    kept.push(seg);
  }
  return "/" + kept.join("/");
}

// Extract string-literal slug fields from a data file via regex.
// Looks for indented `slug: "…"` or `id: "…"` (briefs use `id:`).
function extractSlugs(filePath, fieldName = "slug") {
  if (!existsSync(filePath)) return [];
  const src = readFileSync(filePath, "utf8");
  const re = new RegExp(`^\\s+${fieldName}:\\s*"([^"]+)"`, "gm");
  const slugs = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    slugs.push(m[1]);
  }
  return slugs;
}

// Extract STRAINS keys — top-level quoted slug entries:
//   "blue-dream": {
function extractStrainSlugs(filePath) {
  if (!existsSync(filePath)) return [];
  const src = readFileSync(filePath, "utf8");
  // First slugs in STRAINS records are also written as `slug:` fields.
  // We extract every UNIQUE `slug: "…"` so we don't depend on
  // top-level-key formatting (indentation, comments) drifting.
  return [...new Set(extractSlugs(filePath, "slug"))];
}

export function buildRouteInventory(repoRoot = REPO_ROOT) {
  const appDir = join(repoRoot, "app");
  const libDir = join(repoRoot, "lib");

  // 1. Static routes from page.tsx files
  const pageFiles = walk(appDir).filter((f) => f.endsWith("page.tsx"));
  const staticRoutes = new Set();
  const dynamicRoutes = []; // { template, paramName }
  for (const file of pageFiles) {
    const route = pageFileToRoute(file, appDir);
    if (route === null) continue;
    if (route.includes("[")) {
      dynamicRoutes.push(route);
    } else {
      staticRoutes.add(route);
    }
  }

  // 2. Expand dynamic routes using data files
  const expanded = new Set();
  const strainSlugs = extractStrainSlugs(join(libDir, "strains.ts"));
  const postSlugs = extractSlugs(join(libDir, "posts.ts"));
  const learnSlugs = extractSlugs(join(libDir, "learn-hub.ts"));
  const nearSlugs = extractSlugs(join(libDir, "near-towns.ts"));
  const familySlugs = extractSlugs(join(libDir, "strain-families.ts"));
  const strainTypeSlugs = extractSlugs(join(libDir, "strain-types.ts"));
  const briefIds = extractSlugs(join(libDir, "ambassador-briefs.ts"), "id");

  // Heroes cohort SEO landings are hardcoded in sitemap.ts but not
  // a data file — mirror that list.
  const heroesCohorts = ["veterans", "military", "first-responders", "healthcare", "teachers"];

  for (const tpl of dynamicRoutes) {
    let slugs = [];
    if (tpl === "/strains/[slug]") slugs = strainSlugs;
    else if (tpl === "/blog/[slug]") slugs = postSlugs;
    else if (tpl === "/learn/[slug]") slugs = learnSlugs;
    else if (tpl === "/near/[town]") slugs = nearSlugs;
    else if (tpl === "/strains/families/[family]") slugs = familySlugs;
    else if (tpl === "/heroes/[cohort]") slugs = heroesCohorts;
    else if (tpl === "/community/ambassador/briefs/[slug]") slugs = briefIds;
    // Skip templates we can't resolve (e.g. /brands/[slug] driven by DB,
    // /deals/[id] driven by DB, /community/ambassadors/[handle] driven
    // by DB, /order/confirmation/[id] server-redirected).
    else continue;

    for (const slug of slugs) {
      // Replace the [param] segment with the literal slug
      expanded.add(tpl.replace(/\[[^\]]+\]/, slug));
    }
  }

  return {
    staticRoutes: [...staticRoutes].sort(),
    dynamicRoutes,
    expandedRoutes: [...expanded].sort(),
    strainTypeSlugs,
  };
}

// Crawl all source files (app/, components/, lib/) for internal links.
// Returns a Set of href targets normalized to start with "/".
function buildLinkGraph(repoRoot = REPO_ROOT) {
  const sources = [
    join(repoRoot, "app"),
    join(repoRoot, "components"),
    join(repoRoot, "lib"),
  ].filter((d) => existsSync(d));

  const files = sources.flatMap((d) => walk(d)).filter((f) =>
    /\.(?:tsx?|mdx?)$/.test(f) &&
    !f.includes("__tests__") &&
    !f.endsWith(".d.ts")
  );

  const links = new Set();
  // Three patterns we want to catch:
  //   1. `href="/path"`             — direct JSX prop (Link, <a>, etc.)
  //   2. `href: "/path"`            — object-literal nav-config entries
  //                                   (e.g. SiteFooter renders from arrays
  //                                   of `{ href, label }` objects)
  //   3. `withAttr("/path", ...)`   — UTM-attribution helper that wraps
  //                                   internal hrefs. If we miss these,
  //                                   the whole "/menu" surface looks
  //                                   orphaned even though every CTA hits it.
  //   4. `redirect("/path")` / `router.push("/path")` — programmatic nav
  //
  // We capture only "/..."-prefixed values (skip http(s), mailto, tel,
  // hashes, query-only, etc.).
  const PATTERNS = [
    /href\s*=\s*(?:\{?\s*)?["'`](\/[^"'`?#\s]*)/g,
    /href\s*:\s*["'`](\/[^"'`?#\s]*)/g,
    /\bwithAttr\s*\(\s*["'`](\/[^"'`?#\s]*)/g,
    /\b(?:redirect|router\.push|router\.replace|router\.prefetch)\s*\(\s*["'`](\/[^"'`?#\s]*)/g,
  ];

  for (const file of files) {
    let src;
    try { src = readFileSync(file, "utf8"); } catch { continue; }
    for (const re of PATTERNS) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(src)) !== null) {
        let href = m[1];
        // Normalize: strip trailing slash except for root
        if (href.length > 1 && href.endsWith("/")) href = href.slice(0, -1);
        links.add(href);
      }
    }
  }

  return links;
}

function isExcludedRoute(route) {
  if (route === "/") return true; // Homepage is always reachable
  return EXCLUDED_ROUTE_PREFIXES.some((p) => route === p || route.startsWith(p + "/") || route.startsWith(p));
}

export function findOrphans(repoRoot = REPO_ROOT) {
  const { staticRoutes, expandedRoutes, strainTypeSlugs } = buildRouteInventory(repoRoot);
  const allRoutes = [...new Set([...staticRoutes, ...expandedRoutes])];
  const linkGraph = buildLinkGraph(repoRoot);

  const orphans = [];
  for (const route of allRoutes) {
    if (isExcludedRoute(route)) continue;
    if (ORPHAN_EXEMPT.has(route)) continue;
    // A route is linked if its exact path OR a parent that contains it
    // appears in the link graph. We also accept any prefix-match link
    // (`/strains` → matches /strains/blue-dream as parent link).
    if (linkGraph.has(route)) continue;

    // Per-strain pages: covered by /strains hub-index page which lists
    // every slug. We still flag if /strains itself isn't linked from
    // elsewhere — but if /strains is reachable and the strain slug is
    // a real STRAINS-record entry, the hub page links to it. Treat
    // per-strain pages as reachable IF the /strains directory page is
    // reachable AND a per-strain page exists. (The hub renders Link
    // components at runtime from the STRAINS map, so a source-grep
    // misses them.)
    if (route.startsWith("/strains/") && linkGraph.has("/strains")) {
      // /strains/families/[family] — check parent /strains/families
      if (route.startsWith("/strains/families/") && linkGraph.has("/strains/families")) continue;
      // /strains/[type] (strain type) — listed on /strains hub
      const seg = route.split("/")[2];
      if (strainTypeSlugs.includes(seg)) continue;
      // /strains/[slug] (per-strain) — rendered from STRAINS map on /strains
      continue;
    }

    // Per-blog post: covered by /blog index
    if (route.startsWith("/blog/") && linkGraph.has("/blog")) continue;

    // Per-near-town: covered by /near hub-index
    if (route.startsWith("/near/") && linkGraph.has("/near")) continue;

    // Per-learn-topic: covered by /learn hub
    if (route.startsWith("/learn/") && linkGraph.has("/learn")) continue;

    // Per-heroes-cohort: covered by /heroes hub
    if (route.startsWith("/heroes/") && linkGraph.has("/heroes")) continue;

    // Per-brief: covered by /community/ambassador hub
    if (route.startsWith("/community/ambassador/briefs/") && linkGraph.has("/community/ambassador")) continue;

    orphans.push(route);
  }

  return { allRoutes, linkGraph, orphans };
}

// Only run main logic if invoked directly (not when imported by tests).
const isMain = import.meta.url === `file://${process.argv[1]}` ||
  (process.argv[1] && process.argv[1].endsWith("check-internal-link-orphans.mjs"));

if (isMain) {
  const { allRoutes, linkGraph, orphans } = findOrphans();
  console.log(`check-internal-link-orphans — scanned ${allRoutes.length} routes, ${linkGraph.size} link targets`);
  if (orphans.length === 0) {
    console.log("OK — 0 orphans");
    process.exit(0);
  }
  console.log(`\nOrphan routes: ${orphans.length}`);
  for (const o of orphans) console.log(`  - ${o} (no inbound links)`);
  process.exit(1);
}
