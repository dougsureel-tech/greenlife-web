#!/usr/bin/env node
//
// check-sitemap-lastmod-honesty — SEO health check.
//
// Google quietly started penalizing inflated `<lastmod>` dates in
// sitemaps late 2025. If a sitemap stamps `<lastmod>2026-05-24</lastmod>`
// on every crawl but the actual page content hasn't changed since
// 2025-11, that's a soft index-priority penalty — Google catches on,
// stops trusting the signal, and de-prioritizes the whole sitemap.
//
// Honest patterns:
//   - `STATIC_LASTMOD` constant on a static page — bumped MANUALLY
//     when content actually changes. The constant's value is what
//     gets emitted, so Googlebot sees a stable timestamp across
//     crawls until someone edits the file.
//   - `new Date()` on a truly-daily-changing page (/menu live
//     inventory, /deals active-deals feed, /treasure-chest clearance
//     rotation, /near hub that lists daily things).
//   - `new Date(p.updatedAt ?? p.publishedAt)` on data-driven entries
//     where the data carries a real content-change timestamp.
//   - `d.endDate ? new Date(d.endDate) : new Date()` on /deals/[id]
//     — endDate is a stable, real signal for each deal's surface.
//
// Inflated patterns (what this check flags):
//   - `new Date()` on an entry with changeFrequency: "yearly" or
//     "monthly" — by definition the page DOES NOT change daily, so
//     stamping today is dishonest.
//   - `new Date()` on weekly pages where there's no real content-
//     change signal (e.g. brand/vendor pages where the DB row has
//     an `updatedAt` we're ignoring).
//
// This is the cannabis-web sister of Green Wellness Medical's
// v2.71.2 "Sitemap drops fake lastModified from non-article URLs"
// fix. GW shipped it; cannabis-web is unverified — that's why this
// gate exists.
//
// Run:
//   node scripts/check-sitemap-lastmod-honesty.mjs
//   pnpm check:sitemap-lastmod
//
// Exit 0 if all honest, 1 if any inflated.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = process.cwd();
const SITEMAP_PATH = join(REPO_ROOT, "app/sitemap.ts");

// Allowlist: entries where `new Date()` is HONEST because the page
// actually does change daily. URL-suffix match (after STORE.website).
// Keep this list narrow — only "live data is genuinely refreshing
// every hour" surfaces qualify.
const HONEST_DAILY_PATHS = new Set([
  "",          // homepage — daily, live deals + inventory teaser
  "/menu",     // iHeartJane embed, real-time inventory
  "/deals",    // active deals feed
  "/treasure-chest", // clearance lane, inventory turns daily
  "/near",     // hub for daily-active near-town pages
]);

// Entries that genuinely SHOULD be daily — changeFrequency: "daily"
// declared in source AND in the daily allowlist above. Anything else
// that uses `new Date()` is flagged.
const HONEST_FREQUENCIES_FOR_NEW_DATE = new Set(["daily"]);

// Pre-compiled regex for extracting sitemap entries. Matches:
//   { url: `${STORE.website}/foo`, lastModified: <expr>, changeFrequency: "X", priority: N }
// The <expr> capture is non-greedy and may contain ternaries.
const ENTRY_RE = /\{\s*url:\s*(?:`?\$?\{?STORE\.website\}?`?)?\s*(?:\+\s*)?[`"']?([^`"',]+?)[`"']?\s*,\s*lastModified:\s*([^,]+?)\s*,\s*changeFrequency:\s*["']([^"']+)["']/g;

// Simpler entry shape used for clarity in tests:
//   { url: STORE.website, ... }           → "/"
//   { url: `${STORE.website}/foo`, ... }  → "/foo"
//   { url: `${STORE.website}/foo/${slug}`, ...} → "/foo/${slug}" (template)
function extractUrlSuffix(rawUrlExpr) {
  // Strip outer backticks
  let s = rawUrlExpr.trim();
  if (s.startsWith("`") && s.endsWith("`")) s = s.slice(1, -1);
  // Remove ${STORE.website} OR bare STORE.website (homepage shape:
  //   `url: STORE.website,` produces "STORE.website" with no template
  //   wrap; the homepage URL suffix is empty).
  s = s.replace(/\$\{?STORE\.website\}?/g, "");
  s = s.replace(/^STORE\.website$/, "");
  // Remaining leading literal "/" + slug. Template params left as `${...}`.
  return s;
}

export function parseSitemapEntries(src) {
  // We use a line-by-line block scan instead of one mega-regex —
  // sitemap.ts has interpolations, ternaries, and complex shapes
  // that defeat naive regex. We look for `url: ` and then locate
  // the matching `lastModified:` + `changeFrequency:` within the
  // next ~6 lines (the typical entry block size).
  const lines = src.split("\n");
  const entries = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // The url: capture stops at the FIRST `, ` (comma + space), `,$`
    // (comma + EOL), or end-of-line. Critical for single-line entries
    // like `{ url: ..., lastModified: ... }` — without the bare-comma
    // stop, the lazy match overruns into the rest of the line.
    const urlMatch = line.match(/url:\s*(.+?)(?:,\s|,\s*$|,\s*\/\/|$)/);
    if (!urlMatch) continue;
    // Skip commented-out entries
    if (line.trim().startsWith("//")) continue;
    // Skip the type-annotation lines (`url: string;`)
    if (urlMatch[1].includes(": string")) continue;

    // Find lastModified within the next ~6 lines (entry block, AND
    // search the SAME line — single-line entries pack everything onto
    // line i, so j=0 must look at the URL line itself).
    let lastModifiedExpr = null;
    let changeFrequency = null;
    for (let j = 0; j < 8 && i + j < lines.length; j++) {
      const probe = lines[i + j];
      if (lastModifiedExpr === null) {
        const lmMatch = probe.match(/lastModified:\s*(.+?)(?:,\s|,\s*$|,\s*\/\/|$)/);
        if (lmMatch) lastModifiedExpr = lmMatch[1].trim();
      }
      if (changeFrequency === null) {
        const cfMatch = probe.match(/changeFrequency:\s*["']([^"']+)["']/);
        if (cfMatch) changeFrequency = cfMatch[1];
      }
      if (lastModifiedExpr && changeFrequency) break;
    }
    if (!lastModifiedExpr) continue;

    const urlSuffix = extractUrlSuffix(urlMatch[1]);
    entries.push({
      url: urlSuffix,
      lastModified: lastModifiedExpr,
      changeFrequency: changeFrequency ?? "(unspecified)",
      line: i + 1,
    });
  }
  return entries;
}

// Heuristic: is the lastModified expression "fresh-today" (i.e.
// `new Date()` with no args, which stamps now() on every render)?
function isFreshTodayExpr(expr) {
  return /\bnew Date\(\)/.test(expr) && !/\bnew Date\([^)]+\)/.test(expr);
}

// Is the expression a constant identifier (STATIC_LASTMOD, etc.)?
function isConstantIdentifier(expr) {
  return /^[A-Z][A-Z0-9_]*$/.test(expr.trim());
}

// Is the expression a ternary mixing fresh + signal (deals pattern:
// `d.endDate ? new Date(d.endDate) : new Date()`)?
function isTernaryWithRealSignal(expr) {
  return /\?\s*new Date\([^)]+\)\s*:/.test(expr);
}

// Is the expression a real-signal Date construction
// (e.g. `new Date(p.updatedAt ?? p.publishedAt)`)?
function isRealSignalDate(expr) {
  // `new Date(SOMETHING)` where SOMETHING isn't empty
  return /\bnew Date\(\s*[^\s)][^)]*\)/.test(expr) && !isFreshTodayExpr(expr);
}

export function auditEntries(entries) {
  const inflated = [];
  const honest = [];
  for (const e of entries) {
    const { url, lastModified, changeFrequency, line } = e;
    let verdict = "honest";
    let reason = "";

    if (isFreshTodayExpr(lastModified)) {
      // `new Date()` — only honest for genuinely-daily surfaces
      const isDailyAllowed = HONEST_DAILY_PATHS.has(url);
      const isDailyFreq = HONEST_FREQUENCIES_FOR_NEW_DATE.has(changeFrequency);
      if (!isDailyAllowed && !isDailyFreq) {
        verdict = "inflated";
        reason = `new Date() on changeFrequency=${changeFrequency} (page does not actually change daily)`;
      } else if (!isDailyAllowed && isDailyFreq) {
        // changeFrequency=daily but path isn't on the allowlist — could
        // be an honest dynamic page (e.g. /near hub) or an oversight.
        // Surface as a milder concern but don't fail the gate.
        reason = `new Date() on changeFrequency=daily (verify ${url} actually changes daily)`;
      }
    } else if (isTernaryWithRealSignal(lastModified)) {
      // `endDate ? new Date(endDate) : new Date()` — honest enough,
      // even the fallback is OK for deal-style "no end date = ongoing".
    } else if (isRealSignalDate(lastModified)) {
      // `new Date(p.updatedAt ?? p.publishedAt)` — honest
    } else if (isConstantIdentifier(lastModified)) {
      // `STATIC_LASTMOD` — honest by construction
    }

    if (verdict === "inflated") {
      inflated.push({ url, lastModified, changeFrequency, line, reason });
    } else {
      honest.push({ url, lastModified, changeFrequency, line, reason });
    }
  }
  return { inflated, honest };
}

export function runAudit(repoRoot = REPO_ROOT) {
  const sitemapPath = join(repoRoot, "app/sitemap.ts");
  if (!existsSync(sitemapPath)) {
    throw new Error(`Sitemap not found at ${sitemapPath}`);
  }
  const src = readFileSync(sitemapPath, "utf8");
  const entries = parseSitemapEntries(src);
  return auditEntries(entries);
}

const isMain = import.meta.url === `file://${process.argv[1]}` ||
  (process.argv[1] && process.argv[1].endsWith("check-sitemap-lastmod-honesty.mjs"));

if (isMain) {
  const { inflated, honest } = runAudit();
  console.log(`check-sitemap-lastmod-honesty — scanned ${inflated.length + honest.length} sitemap entries`);
  if (inflated.length === 0) {
    console.log("OK — 0 inflated lastmod entries");
    process.exit(0);
  }
  console.log(`\nInflated lastmod: ${inflated.length}`);
  for (const e of inflated) {
    console.log(`  - ${e.url || "/"} (line ${e.line}) — ${e.reason}`);
  }
  process.exit(1);
}
