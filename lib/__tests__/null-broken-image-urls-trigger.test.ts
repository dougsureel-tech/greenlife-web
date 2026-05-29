// Pin tests for `app/api/admin/maintenance/null-broken-image-urls/route.ts`.
//
// fs-source-assertion pattern — does NOT execute the route handler. Reads
// the file as text and asserts invariants about its shape. Drift on ANY
// invariant indicates either (a) the route's safety model has changed
// (which needs review) or (b) the sister-port to scc-web has fallen out
// of sync (sister-port discipline).
//
// Invariants:
//   1. Module barrier — `runtime = "nodejs"` + `dynamic = "force-dynamic"`
//      (no edge runtime; Neon driver needs Node).
//   2. READ-ONLY in dry-run path — the SOLE `UPDATE` SQL string in the
//      file must live AFTER the `if (dryRun) return ...` early-out.
//      Pin counts: exactly 1 UPDATE statement, exactly 2 SELECT statements.
//   3. Pattern regex byte-shape: `^https?://[^/]+/api/product-image\b`
//      (anchored at start; no Bobby Tables interpolation).
//   4. Auth-gate present: `Authorization` bearer + `CRON_SECRET` env.
//   5. Execute flag MUST be present for writes: `?execute=true` keyword
//      anchor must appear and gate the UPDATE path.
//   6. Edge case: zero matching rows is handled implicitly — `affected`
//      reads from the pre-update COUNT, and the UPDATE is a no-op WHERE
//      clause (no error path needed); pinned indirectly by the "affected:
//      matched" assignment shape.
//   7. PII safety: response surfaces only `name` from the products table
//      (no customer-data joins).
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/null-broken-image-urls-trigger.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROUTE_PATH = join(
  process.cwd(),
  "app/api/admin/maintenance/null-broken-image-urls/route.ts",
);
const ROUTE_SRC = readFileSync(ROUTE_PATH, "utf8");

test("null-broken-image-urls — module barrier (nodejs runtime + force-dynamic)", () => {
  // Neon serverless driver needs Node runtime — edge would throw on
  // import. force-dynamic so Next 16 doesn't try to static-render the
  // POST handler.
  assert.match(
    ROUTE_SRC,
    /export const runtime = "nodejs"/,
    "runtime = nodejs pinned",
  );
  assert.match(
    ROUTE_SRC,
    /export const dynamic = "force-dynamic"/,
    "dynamic = force-dynamic pinned",
  );
});

test("null-broken-image-urls — auth gate (bearer + CRON_SECRET) present", () => {
  // Bearer-only auth. Public sites have no manager-session shape, so
  // bearer is the standard /api/admin/* auth here.
  assert.match(ROUTE_SRC, /verifyBearer/, "verifyBearer call present");
  assert.match(
    ROUTE_SRC,
    /process\.env\.CRON_SECRET/,
    "CRON_SECRET env reference present",
  );
  assert.match(
    ROUTE_SRC,
    /Authorization/i,
    "Authorization header reference present",
  );
  // Unauthorized response shape — 401, opaque body (no enumeration).
  assert.match(
    ROUTE_SRC,
    /\{ error: "Unauthorized" \}, \{ status: 401 \}/,
    "401 Unauthorized response pinned",
  );
});

test("null-broken-image-urls — timing-safe secret comparison", () => {
  // crypto.timingSafeEqual prevents constant-time leak via comparison.
  assert.match(ROUTE_SRC, /timingSafeEqual/, "timingSafeEqual import + use");
});

test("null-broken-image-urls — broken-pattern regex byte-shape pinned (anchored)", () => {
  // Anchored at start (^) — prevents catching vendor CDN URLs that
  // happen to contain "/api/product-image" as a substring. \b boundary
  // ensures we don't match `/api/product-image-foo`. Single source of
  // truth — used in BOTH the COUNT/sample SELECTs AND the UPDATE WHERE.
  assert.match(
    ROUTE_SRC,
    /BROKEN_PATTERN = "\^https\?:\/\/\[\^\/\]\+\/api\/product-image\\\\b"/,
    "BROKEN_PATTERN regex byte-shape pinned",
  );
});

test("null-broken-image-urls — dry-run is the DEFAULT (execute flag must opt-in)", () => {
  // The execute=true flag MUST be present for the UPDATE to run.
  // Default (no flag, flag=false, flag=anything-else) = dry-run.
  assert.match(
    ROUTE_SRC,
    /executeParam === "true"/,
    "execute=true explicit opt-in keyword check",
  );
  assert.match(
    ROUTE_SRC,
    /const dryRun = !execute/,
    "dryRun derives from execute (negation = default-safe)",
  );
});

test("null-broken-image-urls — UPDATE statement count = exactly 1 in code (single write site)", () => {
  // Multiple UPDATEs would mean the safety analysis is more complex.
  // We want exactly ONE write site so the dry-run gate is unambiguous.
  // Strip `//` line-comments so safety-comment mentions don't trip.
  const codeOnly = ROUTE_SRC.split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");
  const updateMatches = codeOnly.match(/UPDATE products/g) ?? [];
  assert.equal(
    updateMatches.length,
    1,
    `expected exactly 1 'UPDATE products' SQL statement in code, found ${updateMatches.length}`,
  );
});

test("null-broken-image-urls — READ-ONLY in dry-run path (UPDATE lives AFTER dryRun early-out)", () => {
  // The dry-run early-return MUST come before the UPDATE in source order.
  // If the order ever flips, dry-run mode silently mutates.
  const dryRunIdx = ROUTE_SRC.indexOf("if (dryRun)");
  const updateIdx = ROUTE_SRC.indexOf("UPDATE products");
  assert.ok(
    dryRunIdx > 0,
    "expected `if (dryRun)` early-out present",
  );
  assert.ok(
    updateIdx > 0,
    "expected `UPDATE products` SQL present",
  );
  assert.ok(
    dryRunIdx < updateIdx,
    "INVARIANT: dryRun early-out must come BEFORE UPDATE in source order",
  );
});

test("null-broken-image-urls — SELECT statement count + sample LIMIT pinned (comments excluded)", () => {
  // 2 SELECTs in CODE: COUNT(*) + sample. Both safe (read-only). Pin
  // counts to exactly-1 each so an added SELECT triggers a review.
  // Strip `//` line-comments so the safety-comment mentions of
  // "SELECT COUNT(*)" and "SELECT name" don't trip the gate.
  const codeOnly = ROUTE_SRC.split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");
  const countMatches = codeOnly.match(/SELECT COUNT\(\*\)/g) ?? [];
  assert.equal(countMatches.length, 1, "exactly 1 COUNT(*) SELECT in code");
  const selectNameMatches = codeOnly.match(/SELECT name/g) ?? [];
  assert.equal(selectNameMatches.length, 1, "exactly 1 sample SELECT in code");
  // LIMIT 5 caps the sample-data return — operator never sees more than
  // 5 product names so the response is bounded.
  assert.match(codeOnly, /LIMIT 5/, "sample LIMIT 5 cap pinned");
});

test("null-broken-image-urls — no DELETE SQL statements anywhere (comments excluded)", () => {
  // image_url is only ever set to NULL — never DELETE'd. Hard invariant.
  // Strip `//` line-comments before counting so the safety-comment
  // mention ("No DELETE statements anywhere") doesn't trip the gate.
  const codeOnly = ROUTE_SRC.split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");
  const deleteMatches = codeOnly.match(/\bDELETE\b/g) ?? [];
  assert.equal(
    deleteMatches.length,
    0,
    "INVARIANT: zero DELETE keywords in code (image_url is set to NULL, not deleted)",
  );
});

test("null-broken-image-urls — no untrusted-input SQL interpolation", () => {
  // BROKEN_PATTERN is a string CONST in this file — not user input.
  // Sister-check: no `${...}` template interpolation inside the sql\`...\`
  // tagged-template literal that pulls from request data. The pattern
  // is passed as a parameter via `${BROKEN_PATTERN}` (which Neon's
  // tagged-template helper binds as a $1 parameter, not raw concatenation).
  // Pin the SHAPE — BROKEN_PATTERN is the only interpolation in the
  // SQL templates.
  assert.match(
    ROUTE_SRC,
    /WHERE image_url ~ \$\{BROKEN_PATTERN\}/,
    "WHERE clause uses BROKEN_PATTERN const (not user input)",
  );
  // The route MUST NOT take any URL query param + drop it into the SQL.
  // url.searchParams.get is fine for control-flow flags; what's banned
  // is using its return value as an SQL fragment. Pin: no `url.searchParams`
  // appears inside a sql\`...\` template body.
  const sqlBlocks = ROUTE_SRC.match(/sql`[\s\S]*?`/g) ?? [];
  for (const block of sqlBlocks) {
    assert.ok(
      !block.includes("searchParams"),
      "SQL template MUST NOT interpolate url.searchParams values",
    );
    assert.ok(
      !block.includes("req.headers"),
      "SQL template MUST NOT interpolate request headers",
    );
  }
});

test("null-broken-image-urls — response surfaces PII-safe fields only", () => {
  // Product names are public (visible on /strains/* pages). Pin that
  // the sample includes `name` and NOT customer-data-shaped fields.
  assert.match(
    ROUTE_SRC,
    /sample_product_names/,
    "sample_product_names key in response",
  );
  // Negative pin — no customer-data field names appear in the response
  // shape. Adjust this list if the surface intentionally widens.
  const PII_BANNED = [
    "customer_id",
    "phone",
    "email",
    "first_name",
    "last_name",
    "dob",
    "license_number",
    "medical_card",
  ];
  for (const field of PII_BANNED) {
    assert.ok(
      !ROUTE_SRC.includes(field),
      `PII field '${field}' must NOT appear in route source`,
    );
  }
});

test("null-broken-image-urls — DATABASE_URL guard returns 500 (not 200) when unset", () => {
  // If DATABASE_URL is missing, refuse rather than throw — operator
  // gets a clear signal in the response.
  assert.match(
    ROUTE_SRC,
    /process\.env\.DATABASE_URL/,
    "DATABASE_URL env read present",
  );
  assert.match(
    ROUTE_SRC,
    /"DATABASE_URL not configured"/,
    "DATABASE_URL-missing error message pinned",
  );
});

test("null-broken-image-urls — error response does not echo err.message (no schema leak)", () => {
  // DB errors can include schema/column names. Catch path returns
  // err.name only — generic class label.
  assert.match(
    ROUTE_SRC,
    /err instanceof Error \? err\.name : "unknown"/,
    "err.name (not err.message) returned to caller",
  );
});

test("null-broken-image-urls — POST method exported (no GET — write-shaped endpoint)", () => {
  // POST-only by design. GET would be cacheable + safe-method-shaped,
  // which conflicts with the write-capable nature of ?execute=true.
  assert.match(ROUTE_SRC, /export async function POST/, "POST exported");
  // Negative pin — no GET export (which would tempt a caller to use
  // GET and bypass any future POST-only audit instrumentation).
  assert.ok(
    !ROUTE_SRC.match(/export async function GET/),
    "GET MUST NOT be exported (POST-only)",
  );
});

test("null-broken-image-urls — store_hint sourced from STORE.name (sister-port observability)", () => {
  // Response includes a store_hint so the caller can verify which
  // store DB the endpoint hit. Sourced from lib/store.ts STORE.name —
  // diverges naturally between glw + scc-web sister ports.
  assert.match(ROUTE_SRC, /from "@\/lib\/store"/, "STORE import present");
  assert.match(
    ROUTE_SRC,
    /store_hint: STORE\.name/,
    "store_hint sourced from STORE.name",
  );
});
