#!/usr/bin/env node
//
// check-html-entities-jsx — pre-push gate.
//
// Catches named HTML entities (`&rsquo;`, `&hellip;`, `&middot;`, etc.)
// in JSX text. React does NOT decode named entities in JSX text — they
// render LITERALLY to the user, breaking what the developer typed.
//
// Per memory `feedback_changelog_html_entities_convention` v2: rule is
// direct Unicode characters in TS strings, not HTML entities. The
// convention exists because of this exact non-decoding behavior.
//
// What this gate flags:
//   - Named entities like `&rsquo;` `&hellip;` `&middot;` `&times;`
//     `&bull;` `&sect;` `&rarr;` `&mdash;` etc. in JSX text
//   - Numeric entities `&#x2019;` `&#x21B3;` etc. in JS string
//     literals (passed to setX("..."), label="...", etc.) — these
//     don't decode in JS strings either
//
// What this allows (XML-required + not safely replaceable):
//   - `&amp;` `&lt;` `&gt;` `&quot;` `&apos;` — the 5 XML entities
//     needed to display literal `<>&"'` characters
//   - JSX expressions: `{"don't see your shape?"}` — the wrapper
//     bypasses the lint rule + entities decode in JS string literal
//   - Comments: `// see &rsquo;` — gate skips line and block comments
//
// Class history (ported from GW v2.97.AD → cannagent):
//   v4.555 — numeric entities in JSX text (5 sites)
//   v4.575 — named entities in JSX text (13 sites / 11 files)
//   v4.595 — numeric entities in JS string literals (3 sites — real bug)
//   v4.615 — round 2 of v4.595 + JSX text named entities (4 more sites)
//
// glw port: walks app/, components/, lib/ (no src/ wrapper).

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const REPO_ROOT = process.cwd();

const XML_REQUIRED = new Set(["amp", "lt", "gt", "quot", "apos"]);

// DEFERRED entities — curly quotes / apostrophes. Direct Unicode (', ',
// ", ") triggers `react/no-unescaped-entities` lint when in raw JSX text;
// proper fix is JSX-expression wrap `{"...'..."}`. The wrap is meaningful
// refactor across many sites, so we allowlist for now and chip away in
// follow-up rounds.
const DEFERRED_QUOTE_FAMILY = new Set(["rsquo", "lsquo", "ldquo", "rdquo"]);

const ALLOWED = new Set([...XML_REQUIRED, ...DEFERRED_QUOTE_FAMILY]);

const NAMED_ENTITY_RE = /&([a-zA-Z][a-zA-Z0-9]+);/g;
const NUMERIC_ENTITY_RE = /&#x?[0-9a-fA-F]+;/g;

// Files exempt from ALL entity checks — HTML email bodies, HTML escape helpers.
const EXEMPT_FILES = new Set([]);

// Files exempt from numeric-entity-in-ts check — email body builders
// and HTML entity decode/encode helpers where entities are intentional.
const NUMERIC_IN_TS_ALLOWLIST = new Set([
  "lib/email.ts",
  "lib/order-confirmation-email.ts",
  "lib/quiz-nurture-email.ts",
  "lib/welcome-email.ts",
]);

function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry === "__tests__" || entry === "node_modules" || entry === ".next") continue;
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
      (entry.endsWith(".tsx") || entry.endsWith(".ts")) &&
      !entry.endsWith(".test.ts") &&
      !entry.endsWith(".test.tsx") &&
      !entry.endsWith(".spec.ts")
    ) {
      out.push(full);
    }
  }
  return out;
}

function stripCommentsAndChangelog(src, isChangelog) {
  let s = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  s = s.replace(/\/\/[^\n]*/g, (m) => m.replace(/[^\n]/g, " "));
  if (isChangelog) {
    return s.replace(/[^\n]/g, " ");
  }
  return s;
}

const SCAN_DIRS = ["app", "components", "lib"].map((d) => join(REPO_ROOT, d));
const files = SCAN_DIRS.flatMap(walk);
const offenders = [];

for (const f of files) {
  const rel = relative(REPO_ROOT, f);
  const isChangelog = rel === "lib/version.ts";

  if (EXEMPT_FILES.has(rel)) continue;

  let raw;
  try {
    raw = readFileSync(f, "utf8");
  } catch {
    continue;
  }
  const stripped = stripCommentsAndChangelog(raw, isChangelog);

  const lines = stripped.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    NAMED_ENTITY_RE.lastIndex = 0;
    NUMERIC_ENTITY_RE.lastIndex = 0;

    let m;
    if (!NUMERIC_IN_TS_ALLOWLIST.has(rel)) {
      while ((m = NAMED_ENTITY_RE.exec(line)) !== null) {
        const name = m[1];
        if (ALLOWED.has(name)) continue;
        offenders.push({
          file: rel,
          line: i + 1,
          kind: "named",
          entity: m[0],
          content: line.trim().slice(0, 100),
        });
      }
    }

    if (rel.endsWith(".ts") && !NUMERIC_IN_TS_ALLOWLIST.has(rel)) {
      while ((m = NUMERIC_ENTITY_RE.exec(line)) !== null) {
        offenders.push({
          file: rel,
          line: i + 1,
          kind: "numeric-in-ts",
          entity: m[0],
          content: line.trim().slice(0, 100),
        });
      }
    }
  }
}

if (offenders.length > 0) {
  console.error(
    "[check-html-entities-jsx] VIOLATIONS — non-XML HTML entities found:",
  );
  console.error("");
  for (const o of offenders) {
    const kindLabel = o.kind === "named" ? `named '${o.entity}'` : `numeric in .ts '${o.entity}'`;
    console.error(`  ${o.file}:${o.line}  (${kindLabel})`);
    console.error(`    ${o.content}`);
  }
  console.error("");
  console.error("  Why this is a real bug:");
  console.error("    - React does NOT decode named entities in JSX text — they render LITERALLY.");
  console.error("    - JS string literals don't decode any HTML entities either.");
  console.error("");
  console.error("  Fix:");
  console.error('    - JSX text named entity → direct Unicode: &middot; → ·');
  console.error('    - If lint flags the character in JSX text, wrap in expr: {"·"}');
  console.error('    - JS string literal → direct Unicode: "we&#x2019;ll" → "we\'ll"');
  console.error("");
  process.exit(1);
}

console.log(
  `[check-html-entities-jsx] OK — ${files.length} TS/TSX files scanned, no non-XML named/numeric entities outside comments + changelog.`,
);
