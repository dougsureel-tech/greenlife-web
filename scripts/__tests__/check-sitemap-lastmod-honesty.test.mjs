// Pin tests for scripts/check-sitemap-lastmod-honesty.mjs.
//
// SEO health check — Google quietly began penalizing inflated sitemap
// <lastmod> stamps in late 2025. Sister of Green Wellness Medical
// v2.71.2 ("Sitemap drops fake lastModified from non-article URLs").
// Cannabis-web unverified — that's why this gate exists.
//
// Honest-vs-inflated detection contract pinned against synthetic
// sitemap snippets.
//
// Run:
//   node --test scripts/__tests__/check-sitemap-lastmod-honesty.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  parseSitemapEntries,
  auditEntries,
} from "../check-sitemap-lastmod-honesty.mjs";

const GATE_PATH = join(process.cwd(), "scripts/check-sitemap-lastmod-honesty.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("parseSitemapEntries — extracts homepage entry", () => {
  const src = `
    { url: STORE.website, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
  `;
  const entries = parseSitemapEntries(src);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].url, "");
  assert.equal(entries[0].changeFrequency, "daily");
  assert.match(entries[0].lastModified, /new Date\(\)/);
});

test("parseSitemapEntries — extracts STORE.website-prefixed entry", () => {
  const src = `
    { url: \`\${STORE.website}/contact\`, lastModified: STATIC_LASTMOD, changeFrequency: "yearly", priority: 0.5 },
  `;
  const entries = parseSitemapEntries(src);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].url, "/contact");
  assert.equal(entries[0].lastModified, "STATIC_LASTMOD");
  assert.equal(entries[0].changeFrequency, "yearly");
});

test("parseSitemapEntries — extracts multi-line entry block", () => {
  const src = `
    {
      url: \`\${STORE.website}/health-data-policy\`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  `;
  const entries = parseSitemapEntries(src);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].url, "/health-data-policy");
  assert.match(entries[0].lastModified, /new Date\(\)/);
});

test("auditEntries — flags new Date() on yearly page (INFLATED)", () => {
  const entries = [
    { url: "/health-data-policy", lastModified: "new Date()", changeFrequency: "yearly", line: 1 },
  ];
  const { inflated } = auditEntries(entries);
  assert.equal(inflated.length, 1);
  assert.equal(inflated[0].url, "/health-data-policy");
  assert.match(inflated[0].reason, /does not actually change daily/);
});

test("auditEntries — flags new Date() on weekly page (INFLATED)", () => {
  // /careers + brand pages — claim weekly turnover, stamp today.
  const entries = [
    { url: "/careers", lastModified: "new Date()", changeFrequency: "weekly", line: 1 },
  ];
  const { inflated } = auditEntries(entries);
  assert.equal(inflated.length, 1);
});

test("auditEntries — accepts new Date() on /menu (honest daily-allowed)", () => {
  const entries = [
    { url: "/menu", lastModified: "new Date()", changeFrequency: "daily", line: 1 },
  ];
  const { inflated, honest } = auditEntries(entries);
  assert.equal(inflated.length, 0);
  assert.equal(honest.length, 1);
});

test("auditEntries — accepts STATIC_LASTMOD constant (honest)", () => {
  const entries = [
    { url: "/contact", lastModified: "STATIC_LASTMOD", changeFrequency: "yearly", line: 1 },
  ];
  const { inflated } = auditEntries(entries);
  assert.equal(inflated.length, 0);
});

test("auditEntries — accepts new Date(post.updatedAt) real-signal (honest)", () => {
  const entries = [
    {
      url: "/blog/foo",
      lastModified: "new Date(p.updatedAt ?? p.publishedAt)",
      changeFrequency: "monthly",
      line: 1,
    },
  ];
  const { inflated } = auditEntries(entries);
  assert.equal(inflated.length, 0);
});

test("auditEntries — accepts ternary fallback (deal endDate pattern, honest)", () => {
  const entries = [
    {
      url: "/deals/123",
      lastModified: "d.endDate ? new Date(d.endDate) : new Date()",
      changeFrequency: "daily",
      line: 1,
    },
  ];
  const { inflated } = auditEntries(entries);
  assert.equal(inflated.length, 0);
});

test("source — GW v2.71.2 cross-stack anchor preserved", () => {
  // The WHY: GW already shipped this fix on the medical side; cannabis
  // stacks were unverified — that anchor matters for understanding
  // why a separate cannabis-web gate exists. If it gets cleaned up,
  // the rationale is lost.
  assert.match(
    GATE_SRC,
    /v2\.71\.2/,
    "GW v2.71.2 cross-stack anchor preserved",
  );
  assert.match(
    GATE_SRC,
    /Green Wellness/,
    "GW project name preserved as sister-fix anchor",
  );
});

test("source — late-2025 Google penalty incident preserved", () => {
  // The mechanism: Google started penalizing inflated <lastmod> stamps
  // in late 2025. If a future cleanup drops this anchor, future devs
  // may wrongly conclude "the gate is paranoid".
  assert.match(GATE_SRC, /late 2025/i, "late-2025 Google policy anchor preserved");
  assert.match(GATE_SRC, /penaliz/i, "penalty mechanism anchor preserved");
});

test("source — 4 honest patterns documented (STATIC_LASTMOD / daily live / real-signal / endDate-ternary)", () => {
  // The detection contract: 4 honest shapes. Drift on any of these
  // creates false-positive churn.
  assert.match(GATE_SRC, /STATIC_LASTMOD/, "STATIC_LASTMOD constant pattern doc'd");
  assert.match(GATE_SRC, /truly-daily/i, "live-daily pattern doc'd");
  assert.match(GATE_SRC, /updatedAt/, "real-signal data-driven pattern doc'd");
  assert.match(GATE_SRC, /endDate/, "endDate ternary pattern doc'd");
});
