#!/usr/bin/env node
// check-version-constant-matches-changelog.mjs
//
// Pin the BUILD_VERSION constant in sync with the latest entry in the
// changelog comment block at top of lib/version.ts. Lived 2026-05-21
// post-cutover when v29.805 ("brand-logo manifest gate") shipped a NEW
// changelog comment at top but FORGOT to update `export const
// BUILD_VERSION` — leaving the prod footer + /api/health.version stuck
// at v29.785 even though sha was v29.805's. Required v29.815 catch-up.
//
// SAME class as Sureel v0.2.6/7/8 silent ships → v0.2.9 catch-up. The
// existing pre-push hook checks that lib/version.ts WAS touched on a
// .ts/.tsx push, but doesn't validate that the two version values in
// the file actually stay aligned.
//
// Rule:
//   1. Find the LATEST `// X.Y[.Z] — description` entry in the top
//      comment block of lib/version.ts (first matching line is latest;
//      changelog is prepend-style top-of-file).
//   2. Find `export const BUILD_VERSION = "X.Y[.Z]";`.
//   3. Block push if they don't match.
//
// Bypass: `git push --no-verify` for the rare legitimate cases (changelog
// catch-up commits where you want the constant to stay one step behind
// because you're literally documenting the gap).

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const VERSION_FILE = resolve(process.cwd(), "lib/version.ts");

if (!existsSync(VERSION_FILE)) {
  // Not a cannabis-stack repo — silently exit (gate is per-repo).
  process.exit(0);
}

const src = readFileSync(VERSION_FILE, "utf8");

// Find latest changelog entry. Format: `// X.Y[.Z] — description` (em-dash).
// Older entries may use `-` instead — match both. Anchored to start-of-line
// so we don't accidentally match URL fragments or in-prose mentions.
const COMMENT_VERSION_REGEX = /^\/\/\s+(\d+\.\d+(?:\.\d+)?)\s+[—-]/m;
const commentMatch = src.match(COMMENT_VERSION_REGEX);

// Find `export const BUILD_VERSION = "X.Y[.Z]";` — anchored to start of
// line so we don't match literal backtick-quoted text inside changelog
// comments (e.g. `the literal \`export const BUILD_VERSION = "29.785"\``
// is exactly the kind of false-match the v29.815 catch-up entry contains).
const CONSTANT_REGEX = /^export\s+const\s+BUILD_VERSION\s*=\s*"([^"]+)"/m;
const constantMatch = src.match(CONSTANT_REGEX);

if (!commentMatch) {
  // No changelog entry found — file may have been re-organized. Don't
  // block; surface a warning so the next person notices the structural
  // drift but doesn't get stuck.
  console.error("⚠ check-version-constant-matches-changelog: no `// X.Y — ...` entry found at top of lib/version.ts. Format may have drifted; skipping check.");
  process.exit(0);
}

if (!constantMatch) {
  console.error("✗ check-version-constant-matches-changelog: no `export const BUILD_VERSION = \"X.Y\"` found in lib/version.ts.");
  process.exit(1);
}

const latestComment = commentMatch[1];
const constantValue = constantMatch[1];

if (latestComment !== constantValue) {
  console.error("");
  console.error("✗ check-version-constant-matches-changelog: BUILD_VERSION drift detected.");
  console.error(`    Latest changelog entry comment: v${latestComment}`);
  console.error(`    Current BUILD_VERSION constant: v${constantValue}`);
  console.error("");
  console.error("    Bump the constant to match the latest changelog entry:");
  console.error(`      export const BUILD_VERSION = "${latestComment}";`);
  console.error("");
  console.error("    The two MUST stay aligned — the prod footer + /api/health.version reads BUILD_VERSION,");
  console.error("    while Doug's grep-the-changelog reads the comment block. Drift = silent ship class");
  console.error("    (sister cannabis-stack v29.815 catch-up + Sureel v0.2.9 catch-up).");
  console.error("");
  console.error("    Bypass with --no-verify ONLY for changelog catch-up commits that intentionally");
  console.error("    document a gap (rare; explain in commit message).");
  console.error("");
  process.exit(1);
}

console.log(`✓ BUILD_VERSION (${constantValue}) matches latest changelog entry (${latestComment})`);
process.exit(0);
