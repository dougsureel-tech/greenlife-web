#!/usr/bin/env node
//
// check-metadata-exclusive — pre-push gate.
//
// Next.js App Router rule: a page / layout module can export ONE of
//   - `export const metadata: Metadata = {...}`         (static)
//   - `export async function generateMetadata(...)`     (dynamic)
//
// — but NOT BOTH. Both causes a build error:
//
//   Error: You are exporting both metadata and generateMetadata from
//   "<route>". Use one or the other.
//
// Vitest passes; tsc passes; the failure only surfaces when Next's
// build pass loads the module. By then the deploy is stuck.
//
// Cross-stack port from VRG v9.6.91 (originating incident: VRG v9.6.27,
// ~30 min recovery) + cannagent + GW v2.97.C6 + sureel.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const REPO_ROOT = process.cwd();
const APP_DIR = join(REPO_ROOT, "app");

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
    else if (entry === "page.tsx" || entry === "layout.tsx") {
      out.push(full);
    }
  }
  return out;
}

const METADATA_RE = /^\s*export\s+(?:const|let|var)\s+metadata\s*[:=]/m;
const GENERATE_RE = /^\s*export\s+(?:async\s+)?function\s+generateMetadata\s*[(<]/m;
const METADATA_NAMED_EXPORT_RE = /^\s*export\s+\{[^}]*\bmetadata\b[^}]*\}/m;
const GENERATE_NAMED_EXPORT_RE = /^\s*export\s+\{[^}]*\bgenerateMetadata\b[^}]*\}/m;

const violations = [];
const files = walk(APP_DIR);

for (const file of files) {
  const src = readFileSync(file, "utf8");
  const hasMetadata = METADATA_RE.test(src) || METADATA_NAMED_EXPORT_RE.test(src);
  const hasGenerate = GENERATE_RE.test(src) || GENERATE_NAMED_EXPORT_RE.test(src);
  if (hasMetadata && hasGenerate) {
    violations.push(relative(REPO_ROOT, file));
  }
}

if (violations.length > 0) {
  console.error(
    "[check-metadata-exclusive] VIOLATIONS — files exporting BOTH metadata + generateMetadata:",
  );
  for (const v of violations) {
    console.error(`  ${v}`);
  }
  console.error("");
  console.error("  Next.js App Router requires ONE or the OTHER, not both. Build will fail.");
  process.exit(1);
}

console.log(
  `[check-metadata-exclusive] OK — ${files.length} page/layout files scanned, no metadata/generateMetadata collisions.`,
);
