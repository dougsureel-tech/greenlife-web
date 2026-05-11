/**
 * useSyncExternalStore snapshot-cache arc-guard.
 *
 * Pins memory pin `feedback_use_sync_external_store_caching` against
 * future regression.
 *
 * Bug class (React #185 — "Maximum update depth exceeded"):
 * React's `useSyncExternalStore` compares snapshots using `Object.is`.
 * If `getSnapshot` returns a FRESH array/object reference on each call
 * (e.g. `JSON.parse(localStorage.getItem(KEY))` or `someArray.filter(...)`),
 * `Object.is` always says "different" → React schedules a re-render →
 * calls `getSnapshot` → another fresh reference → infinite loop. The
 * error bubbles ABOVE the root layout so `app/error.tsx` doesn't catch
 * it; `app/global-error.tsx` takes over showing "This page couldn't
 * load — Reload / Back".
 *
 * Real incident: `seattle-cannabis-web/lib/stash.ts` 2026-05-01
 * (commit b16ec1b). Same pattern is risky in any localStorage-backed
 * hook (useCart, useFavorites, useRecentlyViewed, useStash).
 *
 * The fix pattern (canonical on this codebase):
 *
 *   let cachedRaw: string | null | undefined = undefined;
 *   let cachedIds: readonly string[] = Object.freeze([]);
 *   function readIds() {
 *     const raw = localStorage.getItem(KEY);
 *     if (raw === cachedRaw) return cachedIds;  // ← critical
 *     cachedRaw = raw;
 *     cachedIds = raw ? Object.freeze(parse(raw)) : EMPTY;
 *     return cachedIds;
 *   }
 *
 * This guard: any file calling `useSyncExternalStore` must contain a
 * `cached*` module-level variable (the snapshot cache). Files that only
 * declare the hook without the cache fail the gate.
 *
 * False-positive escape: add the marker comment
 *   // @use-sync-external-store-no-cache
 * if the hook is intentional and doesn't need caching (e.g., the
 * snapshot is a primitive number/boolean that React's Object.is handles
 * correctly without reference identity).
 *
 * Run via:
 *   node scripts/check-usesyncexternalstore-cache.mjs           # strict
 *   node scripts/check-usesyncexternalstore-cache.mjs --warn    # warn-only
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const WARN_ONLY = process.argv.includes("--warn");
const SCAN_DIRS = ["app", "components", "lib"];
const EXTENSIONS = new Set([".ts", ".tsx"]);
const ESCAPE_MARKER = "@use-sync-external-store-no-cache";

// global-error.tsx is the React-error-overlay itself; it doesn't subscribe
// to a custom store with reference-identity concerns.
const EXEMPT_FILES = new Set([
  "app/global-error.tsx",
]);

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (name === "node_modules" || name === ".next" || name === "__tests__") continue;
    const full = join(dir, name);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      walk(full, out);
    } else if (EXTENSIONS.has(name.slice(name.lastIndexOf(".")))) {
      out.push(full);
    }
  }
  return out;
}

const offenders = [];
for (const dir of SCAN_DIRS) {
  const root = join(ROOT, dir);
  for (const file of walk(root)) {
    const rel = relative(ROOT, file);
    if (EXEMPT_FILES.has(rel)) continue;
    let src;
    try {
      src = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    // Strip comments first so changelog-style mentions in lib/version.ts
    // don't false-positive. The hook only triggers the bug class when
    // CALLED, never when mentioned in a comment.
    const stripped = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
    if (!stripped.includes("useSyncExternalStore")) continue;
    if (src.includes(ESCAPE_MARKER)) continue;

    // Look for the canonical cache pattern: at least one `cached*`
    // module-level variable. Allow `cachedRaw`, `cachedIds`, `cachedSnapshot`,
    // `cachedItems`, etc. Matches `let cachedX` or `const cachedX`.
    const hasCache = /\b(let|const|var)\s+cached[A-Za-z_]+/m.test(stripped);
    if (!hasCache) {
      offenders.push({ file: rel });
    }
  }
}

if (offenders.length === 0) {
  console.log(`✓ check-usesyncexternalstore-cache: all useSyncExternalStore callers have snapshot caching (memory pin feedback_use_sync_external_store_caching pinned)`);
  process.exit(0);
}

const header = WARN_ONLY ? "⚠️  check-usesyncexternalstore-cache (warn)" : "✗ check-usesyncexternalstore-cache";
console.error(`\n${header}: ${offenders.length} useSyncExternalStore caller(s) missing snapshot cache\n`);
console.error("React's useSyncExternalStore compares snapshots via Object.is. A getSnapshot");
console.error("callback that returns a fresh array/object each call triggers React error #185");
console.error("(infinite re-render loop). The error bubbles above the root layout — app/error.tsx");
console.error("doesn't catch it; app/global-error.tsx takes over showing 'This page couldn't load'.\n");
for (const o of offenders) {
  console.error(`  ${o.file}`);
}
console.error("\nFix: add a module-level `let cachedRaw / cachedIds` variable + identity-check");
console.error("in getSnapshot. See memory pin `feedback_use_sync_external_store_caching`.");
console.error(`If the hook is intentional + doesn't need caching, add marker comment:`);
console.error(`  // ${ESCAPE_MARKER}\n`);

process.exit(WARN_ONLY ? 0 : 1);
