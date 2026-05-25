// Pin tests for lib/inventory-floor.ts — the C3 commit of the
// two-bucket inventory rollout (Vault + Sales Floor).
//
// Doctrine: every NEW customer-facing read of inventory_snapshots from
// the cannabis-web stack MUST route through `latestFloorOnHand()` so:
//
//   (a) the floor-zone filter is uniform (no per-call drift), and
//   (b) the column-missing fallback (SQLSTATE 42703) keeps both stores
//       up during the brief asymmetric window when one inv-App Vercel
//       build has shipped the migration and the other hasn't.
//
// See PLAN_TWO_BUCKET_INVENTORY_2026_05_24.md §3.4 (read-path) +
// §10 architect requirement (`latestFloorOnHand` + grep gate) +
// §10 4th-expert blocker #2 (column-missing fallback).
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/inventory-floor.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const REPO_ROOT = process.cwd();
const HELPER_PATH = join(REPO_ROOT, "lib/inventory-floor.ts");
const HELPER_SRC = readFileSync(HELPER_PATH, "utf8");

// ─── helper-shape pins (fs-source-assertion — matches repo convention) ──

test("latestFloorOnHand — exported from lib/inventory-floor.ts", () => {
  // fs-source-assertion: repo convention (none of the existing pin tests
  // dynamic-import the source under test because the static `import` chain
  // pulls in server-only / @neondatabase/serverless / etc. that don't
  // resolve cleanly under `node --test --experimental-strip-types`. Pin
  // the exported declaration's literal shape so a future rename surfaces
  // here AND at every grep-gate that scans for the symbol name.
  assert.match(
    HELPER_SRC,
    /export\s+async\s+function\s+latestFloorOnHand\s*\(/,
    "latestFloorOnHand must be exported as an async function",
  );
});

test("isUndefinedColumnError — exported from lib/inventory-floor.ts", () => {
  assert.match(
    HELPER_SRC,
    /export\s+function\s+isUndefinedColumnError\s*\(/,
    "isUndefinedColumnError must be exported as a function (used by the helper "
      + "internally and any caller that wants to disambiguate its own catch)",
  );
});

// ─── primary-query pins (read via fs.readFileSync) ────────────────────

test("primary query filters stock_zone = 'floor' AND quantity_on_hand > 0", () => {
  // Two-bucket model demands EXACTLY these two clauses on the primary
  // path. Drift in either direction (drop the qty>0 → menu shows
  // exhausted floor SKUs; drop the zone → vault leaks to public menu)
  // is a customer-facing data-correctness bug.
  assert.match(
    HELPER_SRC,
    /stock_zone\s*=\s*'floor'/,
    "primary query must filter stock_zone = 'floor' literally",
  );
  assert.match(
    HELPER_SRC,
    /quantity_on_hand\s*>\s*0/,
    "primary query must require quantity_on_hand > 0 (no-zero-rows pin)",
  );
});

test("primary query uses DISTINCT ON + ORDER BY captured_at DESC", () => {
  // Latest-snapshot semantics — the inventory_snapshots table is
  // append-only with "latest wins" semantics. DISTINCT ON (product_id)
  // paired with ORDER BY product_id, captured_at DESC is the canonical
  // shape used 13+ times across lib/db.ts.
  assert.match(
    HELPER_SRC,
    /DISTINCT ON \(product_id\)/,
    "must use DISTINCT ON (product_id) for latest-per-product semantics",
  );
  assert.match(
    HELPER_SRC,
    /ORDER BY product_id,\s*captured_at DESC/,
    "must ORDER BY product_id, captured_at DESC (DISTINCT ON requires this)",
  );
});

test("primary query parameterizes product IDs (no string interpolation)", () => {
  // Defense-in-depth: even though productIds is server-internal, the
  // canonical neon-template-tag binding shape MUST be used so a future
  // refactor that accepts customer-supplied IDs can't introduce SQLi.
  assert.match(
    HELPER_SRC,
    /product_id\s*=\s*ANY\(\$\{productIds\}::text\[\]\)/,
    "productIds must bind as a Postgres text[] via the neon template tag",
  );
});

// ─── fallback-query pins ─────────────────────────────────────────────

test("fallback query OMITS the stock_zone filter", () => {
  // The whole point of the fallback: when the column doesn't exist yet,
  // we cannot reference it. The fallback query body must NOT include any
  // `stock_zone` reference.
  const fallbackBlock = HELPER_SRC.split("isUndefinedColumnError(err)")[1] ?? "";
  assert.ok(
    fallbackBlock.length > 100,
    "fallback block must exist after the isUndefinedColumnError(err) guard",
  );
  // The fallback's inner SQL block ends at the closing `}` of the if.
  // Slice to that to scope the assertion correctly.
  const fallbackSql = fallbackBlock.split("throw err")[0] ?? fallbackBlock;
  assert.ok(
    !/stock_zone/i.test(fallbackSql),
    "fallback SQL must not reference stock_zone (the whole point of the fallback)",
  );
});

test("fallback query STILL filters quantity_on_hand > 0 (no zero-stock leak)", () => {
  // Even without zone awareness, the qty>0 guard is preserved so the
  // public menu doesn't suddenly show 0-stock items during the fallback
  // window. Pre-two-bucket behavior had qty>0 on the menu queries too.
  const fallbackBlock = HELPER_SRC.split("isUndefinedColumnError(err)")[1] ?? "";
  const fallbackSql = fallbackBlock.split("throw err")[0] ?? fallbackBlock;
  assert.match(
    fallbackSql,
    /quantity_on_hand\s*>\s*0/,
    "fallback must preserve the qty>0 guard (consistency with primary)",
  );
});

test("fallback only triggers for SQLSTATE 42703 (re-throws all other errors)", () => {
  // Critical: we MUST re-throw non-42703 errors so genuine outages /
  // bugs surface instead of silently returning stale-shape data.
  assert.match(
    HELPER_SRC,
    /throw err/,
    "non-42703 errors must re-throw (visibility for real outages)",
  );
});

// ─── isUndefinedColumnError type-guard pins (behavior-by-source-shape) ──
//
// Repo convention is fs-source-assertion (see header note). The exact
// source shape of isUndefinedColumnError IS the behavioral contract:
// each pin asserts a discriminator-clause is present so a partial
// refactor that drops one clause (e.g. removes the null-guard) surfaces.

test("isUndefinedColumnError — guards typeof === 'object'", () => {
  assert.match(
    HELPER_SRC,
    /typeof\s+err\s*===?\s*["']object["']/,
    "must check typeof err === 'object' (rejects strings + numbers)",
  );
});

test("isUndefinedColumnError — guards err !== null", () => {
  // typeof null === 'object' in JS — without this guard, isUndefined-
  // ColumnError(null) would proceed to access (null as {}).code and throw.
  assert.match(
    HELPER_SRC,
    /err\s*!==?\s*null/,
    "must explicitly reject null (typeof null === 'object' trap)",
  );
});

test("isUndefinedColumnError — guards 'code' in err", () => {
  // `'code' in err` is the safe property-existence check. Without it,
  // `(err as {code:unknown}).code === "42703"` would short-circuit false
  // for objects without a code prop, but the explicit guard documents
  // intent + plays well with TS narrowing.
  assert.match(
    HELPER_SRC,
    /["']code["']\s+in\s+err/,
    "must use 'code' in err (property-existence guard)",
  );
});

test("isUndefinedColumnError — compares code to STRING '42703' (not number)", () => {
  // Postgres SQLSTATE is canonically a 5-character string. node-postgres,
  // postgres-js, and @neondatabase/serverless all return the string form.
  // Comparing to numeric 42703 would silently fail to match.
  assert.match(
    HELPER_SRC,
    /===?\s*["']42703["']/,
    "must compare code to the literal string '42703' (SQLSTATE format)",
  );
});

// ─── empty-input fast-path pin ────────────────────────────────────────

test("latestFloorOnHand — empty productIds returns empty Map (no DB call)", () => {
  // Source-shape pin: the guard MUST be the first executable line of the
  // function body. Without it, `ANY('{}'::text[])` round-trips to Neon
  // for zero useful work AND getClient() runs (which throws if
  // DATABASE_URL is unset).
  assert.match(
    HELPER_SRC,
    /if\s*\(\s*productIds\.length\s*===?\s*0\s*\)\s*return\s+new\s+Map\s*\(\s*\)/,
    "first line of latestFloorOnHand must be `if (productIds.length === 0) return new Map()`",
  );
  // And the guard must precede getClient() — pin the textual ordering.
  const guardIdx = HELPER_SRC.indexOf("productIds.length === 0");
  const getClientIdx = HELPER_SRC.indexOf("const sql = getClient()");
  assert.ok(
    guardIdx > 0 && getClientIdx > 0 && guardIdx < getClientIdx,
    "empty-array guard must precede getClient() call",
  );
});

// ─── server-only import pin (Next.js bundle-safety) ──────────────────

test("inventory-floor.ts imports 'server-only' (prevents client-bundle leak)", () => {
  // The helper reaches into the per-store Neon DB via DATABASE_URL —
  // categorically a server-only concern. Without this import, a stray
  // `import { latestFloorOnHand } from '@/lib/inventory-floor'` in a
  // Client Component would silently fail at runtime in the browser.
  // The 'server-only' import is a compile-time poison pill.
  assert.match(
    HELPER_SRC,
    /import\s+["']server-only["']/,
    "must import 'server-only' (matches the convention in lib/db.ts)",
  );
});

// ─── grep gate (CI invariant) ────────────────────────────────────────

test(
  "no NEW raw 'FROM inventory_snapshots' added to app/api/**/*.ts after C3",
  () => {
    // The architect-pass requirement (PLAN §10) was: "Required: shared
    // `latestFloorOnHand(productId)` helper + grep gate." This is the
    // grep gate. Per the C3 spec, lib/db.ts's existing reads are
    // grandfathered for Phase 1A — the C4 wave migrates them. But NEW
    // reads under app/api/**/*.ts should go through the helper.
    //
    // We pin the snapshot of current app/api raw `FROM inventory_snapshots`
    // matches to 0. If a future commit adds one, this test fails and the
    // author either migrates it through `latestFloorOnHand` or updates
    // this allowlist with a justified comment.
    const apiDir = join(REPO_ROOT, "app/api");
    const offenders = walkFiles(apiDir, [".ts", ".tsx"]).filter((p) => {
      const src = readFileSync(p, "utf8");
      return /\bFROM\s+inventory_snapshots\b/i.test(src);
    });
    assert.deepEqual(
      offenders.map((p) => relative(REPO_ROOT, p)).sort(),
      [],
      "no app/api file may raw-read inventory_snapshots — use latestFloorOnHand instead",
    );
  },
);

test("lib/inventory-floor.ts is the only NEW canonical floor-read site", () => {
  // Sibling assertion: among all lib/ files, only the helper itself + a
  // small allowlist of GRANDFATHERED legacy readers may reference
  // `FROM inventory_snapshots`. The C4 wave migrates the allowlist
  // entries through `latestFloorOnHand`; until then we pin the snapshot
  // so a NEW raw read added in a NEW file (or a 9th raw read in lib/db.ts)
  // surfaces as a failing test, forcing the author to either migrate it
  // through the helper or add to the allowlist with a justified comment.
  const GRANDFATHERED = new Set([
    "lib/db.ts", // C4 migrated 2026-05-24 v41.625 — all reads now floor-filtered via withFloorFallback, kept on list because raw `FROM inventory_snapshots` text still appears (now inside the helper wrapper)
    "lib/portal.ts", // C4 migrated 2026-05-24 v41.625 — checkAvailability now floor-filtered
    "lib/inventory-floor.ts", // the helper itself (this file IS the canonical reader)
    "lib/version.ts", // changelog prose references the table by name (e.g. "raw FROM inventory_snapshots reads"); not a query site
  ]);
  const libDir = join(REPO_ROOT, "lib");
  const offenders = walkFiles(libDir, [".ts", ".tsx"]).filter((p) => {
    const rel = relative(REPO_ROOT, p);
    if (GRANDFATHERED.has(rel)) return false;
    if (rel.startsWith("lib/__tests__/")) return false; // tests reference the table name
    const src = readFileSync(p, "utf8");
    return /\bFROM\s+inventory_snapshots\b/i.test(src);
  });
  assert.deepEqual(
    offenders.map((p) => relative(REPO_ROOT, p)).sort(),
    [],
    "non-allowlisted lib files must not raw-read inventory_snapshots — "
      + "use latestFloorOnHand or update the GRANDFATHERED allowlist with a comment",
  );
});

// ─── doctrine-anchor pin ─────────────────────────────────────────────

test("PLAN_TWO_BUCKET_INVENTORY_2026_05_24.md anchored in helper docstring", () => {
  // The plan file is the source-of-truth for the column-missing fallback
  // rationale. A future cleanup that strips the docstring would lose
  // the cross-stack context. Pin the anchor.
  assert.match(
    HELPER_SRC,
    /PLAN_TWO_BUCKET_INVENTORY_2026_05_24\.md/,
    "helper must cite the plan file anchor for the fallback rationale",
  );
});

// ─── walker helper ───────────────────────────────────────────────────

function walkFiles(root: string, exts: string[]): string[] {
  const out: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(root);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (name === "node_modules" || name === ".next" || name.startsWith(".")) {
      continue;
    }
    const full = join(root, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      out.push(...walkFiles(full, exts));
    } else if (exts.some((e) => name.endsWith(e))) {
      out.push(full);
    }
  }
  return out;
}
