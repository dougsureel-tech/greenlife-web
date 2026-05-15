// Regression test — no file may reintroduce the UTC-date pattern that the
// `storeToday()` arc (glw v32.805 / scc v25.005 / inv v403.165 / GW v2.97.K2
// same-day cross-stack port) eliminated. Vercel functions run UTC; bare
// `new Date().toISOString().slice(0, 10)` returns UTC-date which drifts to
// "tomorrow" for ~7-8h every evening Pacific.
//
// SSoT: `lib/store-time.ts` exports `storeToday(now?)` using
// `Intl.DateTimeFormat("en-CA", { timeZone: STORE_TZ })`. Use it everywhere
// that matters for store-calendar logic (AI-index Last-updated stamps,
// publish-gating, "show once per day" gates, "days until X" countdowns).
//
// Sister-port of inv `apps/staff/src/lib/__tests__/pacific-date-coverage.test.ts`
// per `feedback_arc_guard_cross_stack_sister_port_doctrine`. This stack only
// has `storeToday` SSoT (no `storeDow` yet); narrow port covers just the
// storeToday guard half. If `storeDow` ships later, add the second guard.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, "..", "..");

const ALLOWLIST_FILES = [
  "lib/store-time.ts",
  "lib/__tests__/pacific-date-coverage.test.ts",
  "lib/version.ts",
];

const EXCLUDE_DIRS = new Set(["node_modules", ".next", ".vercel", ".git", "scripts"]);

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
  return !ALLOWLIST_FILES.includes(rel);
}

describe("pacific-date-coverage — storeToday() SSoT guard", () => {
  const files = walk(REPO_ROOT);

  test("at least 100 source files walked (sanity)", () => {
    assert.ok(
      files.length > 100,
      `Only walked ${files.length} files — walk pattern likely broken.`,
    );
  });

  test("zero `new Date().toISOString().slice(0, 10)` callers (storeToday SSoT)", () => {
    const offenders: string[] = [];
    const pat = /new Date\(\)\.toISOString\(\)\.slice\(0,\s*10\)/;
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
      const hit = lines.some((line) => {
        if (!pat.test(line)) return false;
        const trimmed = line.trimStart();
        if (trimmed.startsWith("//") || trimmed.startsWith("*")) return false;
        const slashIdx = line.indexOf("//");
        const patIdx = line.search(pat);
        if (slashIdx >= 0 && patIdx > slashIdx) return false;
        return true;
      });
      if (hit) offenders.push(rel);
    }
    assert.equal(
      offenders.length,
      0,
      `Found ${offenders.length} file(s) using bare \`new Date().toISOString().slice(0, 10)\`.\n` +
        `This returns UTC-date which drifts to "tomorrow" for ~7-8h every evening Pacific.\n` +
        `Replace with: \`import { storeToday } from "@/lib/store-time"\` and call \`storeToday()\`.\n` +
        `Files:\n  ${offenders.join("\n  ")}`,
    );
  });
});
