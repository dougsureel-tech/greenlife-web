/**
 * `aria-current` on active-route links — accessibility arc-guard.
 *
 * Cross-stack port from cannagent v6.4205. Doctrine: when a Nav/Link
 * computes "is this the current page" via `usePathname()` for visual
 * treatment, it must ALSO pass `aria-current="page"` so screen-reader
 * + voice-control users get the same signal.
 *
 * Heuristic: in any `.tsx` file that imports `usePathname` from
 * `next/navigation` and renders `<Link `, require at least one
 * `aria-current=` attribute somewhere in the file.
 *
 * NOT flagged:
 *   - Files that don't import `usePathname`
 *   - Files with no `<Link ` tags
 *   - Files opting out with `// aria-current:ignore-file` in first 600 chars
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = process.cwd();
const WARN_ONLY = process.argv.includes("--warn");
const SCAN_DIRS = ["app", "components"];
const EXTENSIONS = new Set([".tsx"]);

const EXEMPT_PREFIXES = ["scripts/", "lib/version.ts"];

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
    if (stat.isDirectory()) walk(full, out);
    else if (EXTENSIONS.has(name.slice(name.lastIndexOf(".")))) out.push(full);
  }
  return out;
}

function stripComments(src) {
  let out = src.replace(/\/\*[\s\S]*?\*\//g, "");
  out = out.replace(/\/\/[^\n]*/g, "");
  return out;
}

const USE_PATHNAME_RE = /\busePathname\b/;
const IGNORE_FILE_RE = /\/\/\s*aria-current:ignore-file\b/;

const offenders = [];
for (const dir of SCAN_DIRS) {
  const root = join(ROOT, dir);
  for (const file of walk(root)) {
    const rel = relative(ROOT, file);
    if (EXEMPT_PREFIXES.some((p) => rel.startsWith(p))) continue;
    let src;
    try {
      src = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    if (IGNORE_FILE_RE.test(src.slice(0, 600))) continue;
    const stripped = stripComments(src);
    if (!USE_PATHNAME_RE.test(stripped)) continue;
    const linkOpens = stripped.match(/<Link\s/g) || [];
    if (linkOpens.length === 0) continue;
    const hasAriaCurrent = /\baria-current\s*=/.test(stripped);
    if (!hasAriaCurrent) {
      offenders.push({ file: rel, linkCount: linkOpens.length });
    }
  }
}

if (offenders.length === 0) {
  console.log(
    `✓ check-aria-current: 0 active-route components missing aria-current (a11y signal for screen-reader + voice-control users)`,
  );
  process.exit(0);
}

const header = WARN_ONLY ? "⚠️  check-aria-current (warn)" : "✗ check-aria-current";
console.error(
  `\n${header}: ${offenders.length} file(s) compute active-route state via usePathname but have no aria-current signal\n`,
);
console.error('Doctrine: when a Nav/Link computes "is this the current page" for visual');
console.error('treatment, it must ALSO pass aria-current="page" so screen-reader users');
console.error("get the same signal. Sighted-only treatment is an a11y miss.\n");
for (const o of offenders) {
  console.error(`  ${o.file} (${o.linkCount} <Link> tag(s))`);
}
console.error("\nFix: add `aria-current={pathname === href ? \"page\" : undefined}` to active-state Links.");
console.error("Opt-out: add `// aria-current:ignore-file` to the file.");
process.exit(WARN_ONLY ? 0 : 1);
