// Regression test — no file may inline a millisecond duration literal
// that the SSoT in `lib/time-constants.ts` already names. Banned patterns:
//   - `86_400_000` / `86400_000` / `86400000`           → use `DAY_MS`
//   - `(1000 * 60 * 60 * 24)` / `(24 * 60 * 60 * 1000)` → use `DAY_MS`
//   - `(1000 * 60 * 60)`     / `(60 * 60 * 1000)`       → use `HOUR_MS`
//   - `(1000 * 60)`          / `(60 * 1000)`            → use `MINUTE_MS`
//   - `60_000`                                          → use `MINUTE_MS`
//   - `3_600_000` / `3600_000` / `3600000`              → use `HOUR_MS`
//
// SSoT: `lib/time-constants.ts` exports SECOND_MS / MINUTE_MS / HOUR_MS /
// DAY_MS / WEEK_MS. Use those everywhere.
//
// Sister-port of inv `apps/staff/src/lib/__tests__/day-ms-coverage.test.ts`
// per memory pin `feedback_arc_guard_cross_stack_sister_port_doctrine` — when
// arc-guard catches a real drift on stack A, sister-port to peer stacks
// that have the equivalent SSoT but no defender, same-day. inv's round2-
// coverage caught a real drift today (v404.725 / glw v36.025 / scc v27.325
// trilogy); this is the same doctrine applied to the next inv arc-guard
// with a peer-stack SSoT match.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, "..", "..");

// Files exempt from the guard. These are intentional:
const ALLOWLIST_FILES = [
  // The SSoT itself — defines the constants from raw arithmetic.
  "lib/time-constants.ts",
  // This file — references literal patterns in offender-message text.
  "lib/__tests__/day-ms-coverage.test.ts",
  // Historical changelog entries reference the bug class + arc story.
  "lib/version.ts",
];

const ALLOWLIST_PATTERNS: { match: RegExp; reason: string }[] = [
  { match: /__tests__\//, reason: "test file — literal values for clarity" },
];

const EXCLUDE_DIRS = new Set(["node_modules", ".next", ".vercel", ".git", "scripts", ".claude"]);

function walk(dir: string): string[] {
  const out: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (EXCLUDE_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    let s;
    try {
      s = statSync(full);
    } catch {
      continue;
    }
    if (s.isDirectory()) {
      out.push(...walk(full));
    } else if (s.isFile() && (entry.endsWith(".ts") || entry.endsWith(".tsx"))) {
      out.push(full);
    }
  }
  return out;
}

function shouldCheck(rel: string): boolean {
  if (ALLOWLIST_FILES.includes(rel)) return false;
  for (const { match } of ALLOWLIST_PATTERNS) {
    if (match.test(rel)) return false;
  }
  return true;
}

function findOffenders(
  files: string[],
  pat: RegExp,
): { rel: string; line: string }[] {
  const offenders: { rel: string; line: string }[] = [];
  for (const f of files) {
    const rel = relative(REPO_ROOT, f);
    if (!shouldCheck(rel)) continue;
    let content;
    try {
      content = readFileSync(f, "utf8");
    } catch {
      continue;
    }
    const lines = content.split("\n");
    for (const line of lines) {
      if (!pat.test(line)) continue;
      const trimmed = line.trimStart();
      if (trimmed.startsWith("//") || trimmed.startsWith("*")) continue;
      const slashIdx = line.indexOf("//");
      const patIdx = line.search(pat);
      if (slashIdx >= 0 && patIdx > slashIdx) continue;
      offenders.push({ rel, line: line.trim() });
      break;
    }
  }
  return offenders;
}

describe("day-ms-coverage — ms-duration SSoT guard", () => {
  const files = walk(REPO_ROOT);

  test("at least 100 source files walked (sanity)", () => {
    assert.ok(
      files.length > 100,
      `Only walked ${files.length} files — walk pattern likely broken.`,
    );
  });

  test("zero inline `86_400_000` / `86400_000` / `86400000` literals (use DAY_MS)", () => {
    const pat = /\b86_?400_?000\b/;
    const offenders = findOffenders(files, pat);
    assert.equal(
      offenders.length,
      0,
      `Found ${offenders.length} file(s) inlining a DAY_MS literal.\n` +
        `Replace with: \`import { DAY_MS } from "@/lib/time-constants"\`.\n` +
        `Files:\n  ${offenders.map((o) => `${o.rel}: ${o.line}`).join("\n  ")}`,
    );
  });

  test("zero inline `(1000 * 60 * 60 * 24)` or `(24 * 60 * 60 * 1000)` (use DAY_MS)", () => {
    const pat = /\b1000\s*\*\s*60\s*\*\s*60\s*\*\s*24\b|\b24\s*\*\s*60\s*\*\s*60\s*\*\s*1000\b/;
    const offenders = findOffenders(files, pat);
    assert.equal(
      offenders.length,
      0,
      `Found ${offenders.length} file(s) inlining a (1000 * 60 * 60 * 24) literal.\n` +
        `Replace with: \`import { DAY_MS } from "@/lib/time-constants"\`.\n` +
        `Files:\n  ${offenders.map((o) => `${o.rel}: ${o.line}`).join("\n  ")}`,
    );
  });

  test("zero inline `24 * 3600_000` / `24 * 3600000` (use DAY_MS)", () => {
    const pat = /\b24\s*\*\s*3_?600_?000\b/;
    const offenders = findOffenders(files, pat);
    assert.equal(
      offenders.length,
      0,
      `Found ${offenders.length} file(s) inlining a 24 * 3600_000 literal.\n` +
        `Replace with: \`import { DAY_MS } from "@/lib/time-constants"\`.\n` +
        `Files:\n  ${offenders.map((o) => `${o.rel}: ${o.line}`).join("\n  ")}`,
    );
  });
});
