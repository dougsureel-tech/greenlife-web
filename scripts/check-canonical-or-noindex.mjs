#!/usr/bin/env node
//
// check-canonical-or-noindex — pre-push gate.
//
// Every public app/**/page.tsx must declare ONE of:
//   - `alternates: { canonical: "..." }` in its own metadata
//   - `robots: { index: false }` (or `robots: { noindex: ... }`)
//   - opt-out marker `// canonical:ignore-file` on a comment line near top
//
// Root layout's `alternates.canonical: "/"` cascades to every page that
// doesn't override — Google reads that as "this is the homepage" and
// flags every child page either as "Duplicate, Google chose different
// canonical than user" (910 items 2026-05-15) or, when the cascade
// doesn't reach for some reason, "Duplicate without user-selected
// canonical" (2650 items 2026-05-15). Either way the page's content
// gets dedup'd into homepage in Google's index.
//
// Fix shape: every public page.tsx MUST own its canonical signal —
// either by declaring its own canonical (the SEO answer) or by being
// explicitly noindex'd (the privacy answer for auth/account pages).
// Inheritance from root layout is structurally wrong for everything
// EXCEPT app/page.tsx itself.
//
// Allowlist exclusions:
//   - app/api/** (not pages)
//   - app/admin/** (auth-gated, never indexed)
//   - app/(*)/ admin route groups
//   - app/dev/**, app/devmenu/**, app/_*/  internal-only routes
//   - Files with `// canonical:ignore-file` marker (e.g. redirect-only
//     pages like /brands → /menu, where the page never returns content)

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const REPO_ROOT = process.cwd();
const APP_DIR = join(REPO_ROOT, "app");

const EXCLUDED_PREFIXES = [
  "app/api/",
  "app/admin/",
  "app/dev/",
  "app/devmenu/",
  "app/_",
];

function isExcluded(rel) {
  return EXCLUDED_PREFIXES.some((p) => rel.startsWith(p));
}

function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry === "node_modules" || entry === ".next") continue;
    const full = join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) out.push(...walk(full));
    else if (entry === "page.tsx") {
      out.push(full);
    }
  }
  return out;
}

// canonical declarations — match both `canonical: "..."` and
// `alternates: { canonical:` shapes
const CANONICAL_RE = /\bcanonical\s*:\s*["'`]/;
// noindex declarations — match `robots: { index: false }`,
// `robots: { noindex: true }`, and `robots: { index: false, follow: ...`
const NOINDEX_RE = /\brobots\s*:\s*\{[^}]*\b(?:index\s*:\s*false|noindex\s*:\s*true)/;
const IGNORE_MARKER_RE = /\/\/\s*canonical:ignore-file(?!\S)/;

const violations = [];
const files = walk(APP_DIR);

for (const file of files) {
  const rel = relative(REPO_ROOT, file);
  if (isExcluded(rel)) continue;

  const src = readFileSync(file, "utf8");
  if (IGNORE_MARKER_RE.test(src)) continue;

  // Check the page file itself
  if (CANONICAL_RE.test(src) || NOINDEX_RE.test(src)) continue;

  // Check a sibling layout.tsx in the same directory — this is the
  // "use client" workaround: client pages can't export metadata so
  // they pair with a server-side sibling layout.tsx that does.
  const dir = file.replace(/\/page\.tsx$/, "");
  const siblingLayout = join(dir, "layout.tsx");
  try {
    const layoutSrc = readFileSync(siblingLayout, "utf8");
    if (CANONICAL_RE.test(layoutSrc) || NOINDEX_RE.test(layoutSrc)) continue;
  } catch {
    // no sibling layout — keep looking
  }

  violations.push(rel);
}

if (violations.length > 0) {
  console.error(
    "[check-canonical-or-noindex] VIOLATIONS — page.tsx files without own canonical OR noindex:",
  );
  for (const v of violations) {
    console.error(`  ${v}`);
  }
  console.error("");
  console.error("  Fix: add ONE of:");
  console.error('    1. `alternates: { canonical: "/<route>" }` in this file or sibling layout.tsx');
  console.error('    2. `robots: { index: false, follow: false }` if page should be noindex');
  console.error('    3. `// canonical:ignore-file` comment marker (redirect-only pages)');
  console.error("");
  console.error('  Why: root layout\'s `canonical: "/"` cascades to every page that doesn\'t');
  console.error('  override, so Google flags every child page as duplicate-of-homepage.');
  process.exit(1);
}

console.log(
  `[check-canonical-or-noindex] OK — ${files.length} public page.tsx files scanned, every one carries its own canonical or noindex signal.`,
);
