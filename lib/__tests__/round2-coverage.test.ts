// Regression test — no inline `Math.round(X * 100) / 100` currency-rounding
// outside the SSoT (`lib/money-math.ts`).
//
// Sister-port of inv `apps/staff/src/lib/__tests__/round2-coverage.test.ts`.
// glw shipped v30.505 `lib/money-math.ts` consolidating 3 inline duplicates
// (loyalty-redemption / order-confirmation-email / portal). This guard pins
// the consolidation so a future PR can't silently re-introduce inline
// `Math.round(n * 100) / 100` and bypass the documented boundary caveats
// in `lib/money-math.ts`'s `round2()` (0.005 / 0.015 / 1.235 with
// engine-dependent halves).
//
// Closes inv 2026-05-14 finding: round2-coverage drift snuck in via
// vendor-returns ship because pre-push hook only runs typecheck (not unit
// tests). Cross-stack defense-in-depth port.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, "..", "..");

// Files exempt from the inline-Math.round(X*100)/100 check:
//   - lib/money-math.ts itself — DEFINES the round2 helper
const ALLOWLIST: string[] = [
  "lib/money-math.ts",
];

const PATTERN = /Math\.round\([^)]*\*\s*100\)\s*\/\s*100/g;

function walk(dir: string): string[] {
  const out: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry === "node_modules" || entry === ".next" || entry === "__tests__" || entry === ".git" || entry === "scripts") continue;
    const full = join(dir, entry);
    let s;
    try {
      s = statSync(full);
    } catch {
      continue;
    }
    if (s.isDirectory()) {
      out.push(...walk(full));
    } else if (
      s.isFile() &&
      (entry.endsWith(".ts") || entry.endsWith(".tsx")) &&
      !entry.endsWith(".test.ts") &&
      !entry.endsWith(".test.tsx") &&
      entry !== "version.ts"
    ) {
      out.push(full);
    }
  }
  return out;
}

describe("round2-coverage — no inline Math.round(X * 100) / 100 outside lib/money-math", () => {
  const files = walk(REPO_ROOT);

  test("at least 100 source files scanned (sanity)", () => {
    assert.ok(files.length > 100, `Only ${files.length} files walked — pattern broken?`);
  });

  test("zero inline 2-decimal round patterns outside allowlist", () => {
    const offenders: string[] = [];
    for (const f of files) {
      const rel = relative(REPO_ROOT, f);
      if (ALLOWLIST.includes(rel)) continue;
      let content;
      try {
        content = readFileSync(f, "utf8");
      } catch {
        continue;
      }
      const noComments = content
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|\n)\s*\/\/[^\n]*/g, "$1");
      PATTERN.lastIndex = 0;
      if (PATTERN.test(noComments)) {
        offenders.push(rel);
      }
    }
    assert.equal(
      offenders.length,
      0,
      `Found ${offenders.length} file(s) with inline Math.round(X * 100) / 100.\n` +
        `Replace with \`round2(X)\` from \`@/lib/money-math\` (or \`./money-math\` if in lib/).\n` +
        `The lib documents the boundary-case caveat that inline copies always re-discover.\n` +
        `Files:\n  ${offenders.join("\n  ")}\n\n` +
        `If the inline impl is intentional (e.g. seed data), add the file\n` +
        `path to ALLOWLIST in this test with a comment explaining why.`,
    );
  });
});
