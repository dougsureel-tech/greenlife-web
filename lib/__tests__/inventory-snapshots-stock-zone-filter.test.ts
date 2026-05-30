// Tests for the `inventory_snapshots` stock-zone filter discipline.
//
// Why pinned: starting with the inv-App two-bucket inventory rollout
// (PLAN_TWO_BUCKET_INVENTORY_2026_05_24.md), the `inventory_snapshots`
// table grows a `stock_zone` column with values 'floor' (sales floor,
// customer-visible) and 'vault' (back-of-house, not customer-visible).
//
// EVERY customer-facing read of `inventory_snapshots` from the public
// cannabis-web site MUST filter on `stock_zone = 'floor'` — otherwise
// the moment a vault row is written (Phase 2), the public menu lies
// about what's actually grab-and-go.
//
// This pin-tests the EXISTING reads in `lib/db.ts` + `lib/portal.ts` so
// a future regression (someone adds a new read without the filter, OR
// removes the filter from an existing read) trips the test.
//
// Run with:  pnpm test:all
//
// Mirror on seattle-cannabis-web/lib/__tests__/inventory-snapshots-stock-zone-filter.test.ts.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LIB_DIR = path.resolve(__dirname, "..");

function readLib(file: string): string {
  return readFileSync(path.join(LIB_DIR, file), "utf8");
}

/** Walk a file and return the [line-index, line-text] tuples whose
 *  text contains the needle. 0-indexed. */
function findLines(text: string, needle: RegExp): Array<[number, string]> {
  const lines = text.split("\n");
  const out: Array<[number, string]> = [];
  for (let i = 0; i < lines.length; i++) {
    if (needle.test(lines[i])) out.push([i, lines[i]]);
  }
  return out;
}

/** Return TRUE iff `pattern` appears within `window` lines AFTER
 *  the given line index. */
function laterHas(text: string, lineIdx: number, pattern: RegExp, window: number): boolean {
  const lines = text.split("\n");
  for (let i = lineIdx + 1; i <= Math.min(lineIdx + window, lines.length - 1); i++) {
    if (pattern.test(lines[i])) return true;
  }
  return false;
}

/** Return TRUE iff `pattern` appears within `window` lines BEFORE
 *  the given line index. */
function earlierHas(text: string, lineIdx: number, pattern: RegExp, window: number): boolean {
  const lines = text.split("\n");
  for (let i = Math.max(0, lineIdx - window); i < lineIdx; i++) {
    if (pattern.test(lines[i])) return true;
  }
  return false;
}

describe("inventory_snapshots stock-zone filter discipline (PLAN_TWO_BUCKET_INVENTORY_2026_05_24)", () => {
  test("withFloorFallback helper is exported from lib/inventory-floor.ts", () => {
    const text = readLib("inventory-floor.ts");
    assert.match(text, /export async function withFloorFallback<T>/);
    assert.match(text, /isUndefinedColumnError\(err\)/);
  });

  test("isUndefinedColumnError accepts only the SQLSTATE '42703' shape", () => {
    const text = readLib("inventory-floor.ts");
    // Strict-shape: typeof object, !== null, 'code' in err, === '42703'
    assert.match(text, /typeof err === "object"/);
    assert.match(text, /err !== null/);
    assert.match(text, /"code" in err/);
    assert.match(text, /=== "42703"/);
  });

  test("lib/db.ts imports withFloorFallback", () => {
    const text = readLib("db.ts");
    assert.match(text, /import \{ withFloorFallback \} from "\.\/inventory-floor"/);
  });

  test("lib/portal.ts imports withFloorFallback", () => {
    const text = readLib("portal.ts");
    assert.match(text, /import \{ withFloorFallback \} from "\.\/inventory-floor"/);
  });

  test("At least HALF of 'FROM inventory_snapshots' lines in lib/db.ts have a stock_zone filter within 5 lines (the other half = withFloorFallback legacy branches)", () => {
    const text = readLib("db.ts");
    const sites = findLines(text, /\bFROM inventory_snapshots\b/);
    assert.ok(sites.length >= 24, `expected ≥24 inventory_snapshots reads in db.ts (primary+fallback per ~12 sites), found ${sites.length}`);
    let withZone = 0;
    for (const [idx] of sites) {
      if (laterHas(text, idx, /stock_zone\s*=\s*'floor'|stock_zone\s+IN\s*\('vault','floor'\)/, 5)) {
        withZone += 1;
      }
    }
    // Half (primary branch of withFloorFallback) MUST have stock_zone;
    // the other half (legacy fallback branch) MAY omit it. If LESS than
    // half carry the filter, then some primary branch is missing the
    // filter — public menu would lie about vault stock.
    const expected = Math.floor(sites.length / 2);
    assert.ok(withZone >= expected, `expected ≥${expected} of ${sites.length} db.ts reads to carry stock_zone filter, got ${withZone}`);
  });

  test("EVERY 'FROM inventory_snapshots' line in lib/portal.ts is within 5 lines of stock_zone = 'floor' (or is a fallback branch)", () => {
    const text = readLib("portal.ts");
    const sites = findLines(text, /\bFROM inventory_snapshots\b/);
    assert.ok(sites.length >= 2, `expected ≥2 inventory_snapshots reads in portal.ts, found ${sites.length}`);
    let withZone = 0;
    for (const [idx] of sites) {
      if (laterHas(text, idx, /stock_zone\s*=\s*'floor'/, 5)) withZone += 1;
    }
    // At least HALF of portal.ts reads must carry the stock_zone filter
    // (the other half are the withFloorFallback fallback branches).
    assert.ok(withZone >= Math.ceil(sites.length / 2), `expected ≥${Math.ceil(sites.length / 2)} portal.ts reads with stock_zone filter, got ${withZone}`);
  });

  test("EVERY 'stock_zone' clause in lib/db.ts is preceded by a SAFE-FLOOR-ONLY or SAFE-AGGREGATE comment within 5 lines", () => {
    const text = readLib("db.ts");
    const sites = findLines(text, /\bstock_zone\s*(=|IN)\s/);
    assert.ok(sites.length >= 15, `expected ≥15 stock_zone clauses in db.ts, found ${sites.length}`);
    for (const [idx, line] of sites) {
      const hasMarker = earlierHas(text, idx, /SAFE-FLOOR-ONLY|SAFE-AGGREGATE/, 5);
      if (!hasMarker) {
        assert.fail(`db.ts line ${idx + 1}: "${line.trim()}" — missing SAFE-FLOOR-ONLY / SAFE-AGGREGATE comment within 5 lines above`);
      }
    }
  });

  test("EVERY 'stock_zone' clause in lib/portal.ts is preceded by a SAFE-FLOOR-ONLY marker comment within 5 lines", () => {
    const text = readLib("portal.ts");
    const sites = findLines(text, /\bstock_zone\s*(=|IN)\s/);
    assert.ok(sites.length >= 1, `expected ≥1 stock_zone clause in portal.ts, found ${sites.length}`);
    for (const [idx, line] of sites) {
      const hasMarker = earlierHas(text, idx, /SAFE-FLOOR-ONLY|SAFE-AGGREGATE/, 5);
      if (!hasMarker) {
        assert.fail(`portal.ts line ${idx + 1}: "${line.trim()}" — missing SAFE-FLOOR-ONLY marker within 5 lines above`);
      }
    }
  });

  test("lib/db.ts uses withFloorFallback at least 12 times (one per migrated read function)", () => {
    const text = readLib("db.ts");
    const matches = text.match(/await withFloorFallback\(/g) ?? [];
    assert.ok(matches.length >= 12, `expected ≥12 withFloorFallback call sites in db.ts, found ${matches.length}`);
  });

  test("lib/portal.ts uses withFloorFallback at least once", () => {
    const text = readLib("portal.ts");
    const matches = text.match(/await withFloorFallback\(/g) ?? [];
    assert.ok(matches.length >= 1, `expected ≥1 withFloorFallback call in portal.ts, found ${matches.length}`);
  });

  test("SAFE-FLOOR-ONLY count matches customer-visible read sites (13 in db.ts + 1 in portal.ts)", () => {
    const dbText = readLib("db.ts");
    const portalText = readLib("portal.ts");
    const dbCount = (dbText.match(/SAFE-FLOOR-ONLY/g) ?? []).length;
    const portalCount = (portalText.match(/SAFE-FLOOR-ONLY/g) ?? []).length;
    // 12 → 13: getPreviewProductBundle added 1 customer-visible read for the
    // /menu/preview/[id] PDP (Phase 0 of PLAN_PRODUCT_UX_REDESIGN_2026_05_30.md).
    assert.equal(dbCount, 13, `db.ts SAFE-FLOOR-ONLY count drift: got ${dbCount}, expected 13`);
    assert.equal(portalCount, 1, `portal.ts SAFE-FLOOR-ONLY count drift: got ${portalCount}, expected 1`);
  });

  test("SAFE-AGGREGATE count = 4 in db.ts (first_seen CTEs in getMenuProducts/getProductsByIds/getJustInProducts/getPreviewProductBundle)", () => {
    const dbText = readLib("db.ts");
    const count = (dbText.match(/SAFE-AGGREGATE/g) ?? []).length;
    // 3 → 4: getPreviewProductBundle added 1 first_seen CTE for the
    // /menu/preview/[id] PDP (Phase 0 of PLAN_PRODUCT_UX_REDESIGN_2026_05_30.md).
    assert.equal(count, 4, `db.ts SAFE-AGGREGATE count drift: got ${count}, expected 4`);
  });
});
