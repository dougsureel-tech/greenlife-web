// Pin tests for app/api/revalidate/route.ts.
//
// C6 closure of the two-bucket inventory rollout (inv-App v426.345
// `/api/admin/two-bucket/revalidate-cannabis-web` ships the menu-cache
// drop webhook). This route is the cannabis-web side of that contract:
// it accepts `/menu*` paths + reads the new
// `CANNABIS_WEB_REVALIDATE_SECRET` env var with a fallback to the
// legacy `SISTER_SITE_REVALIDATE_SECRET` for rotation tolerance.
//
// fs-source-assertion pattern — same shape as
// `check-version-constant-matches-changelog.test.ts` etc. Reads the
// route file as text and asserts the shape rather than running the
// handler with mocks (no Next runtime available in node:test).
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/revalidate-route-shape.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROUTE_PATH = join(process.cwd(), "app/api/revalidate/route.ts");
const ROUTE_SRC = readFileSync(ROUTE_PATH, "utf8");

test("revalidate route — /menu* paths accepted in isAllowedPath()", () => {
  // The C6 webhook calls with path=/menu. Must be in the allowlist.
  assert.match(
    ROUTE_SRC,
    /path === "\/menu"/,
    "literal '/menu' equality branch present",
  );
  assert.match(
    ROUTE_SRC,
    /startsWith\("\/menu\/"\)/,
    "'/menu/' prefix branch present",
  );
});

test("revalidate route — /blog* paths still accepted (backwards compat)", () => {
  // The publish-scheduled-posts cron still calls with path=/blog/<slug>.
  // Don't regress the existing surface.
  assert.match(
    ROUTE_SRC,
    /path === "\/blog"/,
    "literal '/blog' equality branch present",
  );
  assert.match(
    ROUTE_SRC,
    /startsWith\("\/blog\/"\)/,
    "'/blog/' prefix branch present",
  );
});

test("revalidate route — path-traversal defense preserved (.. + //)", () => {
  // The allowlist must still reject `/menu/../admin` and `/blog//foo`.
  assert.match(
    ROUTE_SRC,
    /!path\.includes\("\.\.\"\)/,
    "'..' traversal rejection preserved",
  );
  assert.match(
    ROUTE_SRC,
    /!path\.includes\("\/\/"\)/,
    "'//' double-slash rejection preserved",
  );
});

test("revalidate route — reads CANNABIS_WEB_REVALIDATE_SECRET first, falls back to SISTER_SITE_REVALIDATE_SECRET", () => {
  // Rotation tolerance: new name takes precedence, legacy accepted as
  // fallback so a rolling rotation across both Vercel projects doesn't
  // break revalidations mid-deploy.
  assert.match(
    ROUTE_SRC,
    /process\.env\.CANNABIS_WEB_REVALIDATE_SECRET/,
    "new env name (CANNABIS_WEB_REVALIDATE_SECRET) read",
  );
  assert.match(
    ROUTE_SRC,
    /process\.env\.SISTER_SITE_REVALIDATE_SECRET/,
    "legacy env name (SISTER_SITE_REVALIDATE_SECRET) read for fallback",
  );
  // The precedence order: new ?? legacy. Pin the literal coalesce shape
  // so a refactor can't accidentally invert it (legacy ?? new would
  // delay the new-name takeover indefinitely).
  assert.match(
    ROUTE_SRC,
    /CANNABIS_WEB_REVALIDATE_SECRET\s*\?\?[\s\S]{0,40}SISTER_SITE_REVALIDATE_SECRET/,
    "new ?? legacy precedence order preserved",
  );
});

test("revalidate route — accepts BOTH path AND tag in same request", () => {
  // The C6 webhook calls with ?path=/menu&tag=menu. Both must be
  // honored in one call — path → revalidatePath, tag → revalidateTag.
  assert.match(
    ROUTE_SRC,
    /revalidatePath\(path/,
    "revalidatePath(path, ...) call present",
  );
  assert.match(
    ROUTE_SRC,
    /if \(tag\) revalidateTag\(tag/,
    "revalidateTag(tag, ...) call present + gated on tag presence",
  );
});

test("revalidate route — tag-only call (no path) is permitted", () => {
  // Pre-C6 the route required `path` and rejected tag-only. Post-C6
  // tag-only is a valid invalidation shape (e.g. ?tag=menu with no
  // specific page). Pin that the 400 fires only when BOTH are missing.
  assert.match(
    ROUTE_SRC,
    /if \(!path && !tag\)/,
    "400 gate fires only when BOTH path AND tag are missing",
  );
  assert.match(
    ROUTE_SRC,
    /"Missing path or tag"/,
    "error message names BOTH path + tag",
  );
});

test("revalidate route — wrong secret → 401 (timing-safe compare)", () => {
  // The timing-safe compare must still gate. secretMatches() returns
  // false on length mismatch + uses node:crypto timingSafeEqual.
  assert.match(
    ROUTE_SRC,
    /secretMatches\(secret, expected\)/,
    "secretMatches() called with provided + expected",
  );
  assert.match(
    ROUTE_SRC,
    /timingSafeEqual/,
    "node:crypto timingSafeEqual used (no string-equality regression)",
  );
  // The 401-branch shape: unauthorized when secret missing OR mismatch.
  assert.match(
    ROUTE_SRC,
    /if \(!secret \|\| !secretMatches\(secret, expected\)\)/,
    "401 fires on missing secret OR mismatch",
  );
});

test("revalidate route — disallowed path still 400s", () => {
  // Defense: a leaked secret can't be weaponized to revalidate arbitrary
  // routes (e.g. /admin/*, /api/*, /).
  assert.match(
    ROUTE_SRC,
    /if \(path && !isAllowedPath\(path\)\)/,
    "path-allowlist gate fires when path supplied but not allowed",
  );
  assert.match(
    ROUTE_SRC,
    /"Path not allowed"/,
    "error message names allowlist rejection",
  );
});

test("revalidate route — POST + GET both exported (curl-trigger parity)", () => {
  // Operator-curl recipe in file-header relies on GET. Both must exist.
  assert.match(
    ROUTE_SRC,
    /export async function POST\(req: Request\)/,
    "POST exported",
  );
  assert.match(
    ROUTE_SRC,
    /export async function GET\(req: Request\)/,
    "GET exported",
  );
});

test("revalidate route — nodejs runtime + force-dynamic (no edge regression)", () => {
  // Edge runtime would lose node:crypto timingSafeEqual + the file
  // serves dynamic auth so static-isr would be wrong shape.
  assert.match(
    ROUTE_SRC,
    /export const runtime = "nodejs"/,
    "nodejs runtime pinned",
  );
  assert.match(
    ROUTE_SRC,
    /export const dynamic = "force-dynamic"/,
    "force-dynamic pinned",
  );
});

test("revalidate route — C6 + PLAN_AUTONOMOUS_CRONS_2026_05_20.md anchors documented", () => {
  // Pin the cross-stack pointers so future devs can find both callers.
  assert.match(
    ROUTE_SRC,
    /PLAN_AUTONOMOUS_CRONS_2026_05_20\.md/,
    "publish-scheduled-posts PLAN anchor preserved",
  );
  assert.match(
    ROUTE_SRC,
    /two-bucket/i,
    "two-bucket (C6) anchor present",
  );
  assert.match(
    ROUTE_SRC,
    /revalidate-cannabis-web/,
    "inv-App caller route name anchor present",
  );
});
