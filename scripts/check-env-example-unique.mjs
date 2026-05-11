#!/usr/bin/env node
//
// check-env-example-unique — pre-push gate.
//
// Cross-stack port from cannagent v3.159 + VRG v9.6.94 + GW v2.97.D1 + sureel.
// Catches duplicate column-0 env-var declarations in .env.example.
// Duplicate blocks carry silent drift risk.

import { readFileSync } from "node:fs";
import { join, relative } from "node:path";

const REPO_ROOT = process.cwd();
const ENV_EXAMPLE = join(REPO_ROOT, ".env.example");

let src;
try {
  src = readFileSync(ENV_EXAMPLE, "utf8");
} catch {
  console.error(`[check-env-example-unique] FAIL — could not read ${relative(REPO_ROOT, ENV_EXAMPLE)}`);
  process.exit(1);
}

const ENV_LINE_RE = /^([A-Z][A-Z0-9_]*)=/gm;
const seen = new Map();
let match;
let totalDeclarations = 0;

while ((match = ENV_LINE_RE.exec(src)) !== null) {
  totalDeclarations++;
  const name = match[1];
  const lineNumber = src.slice(0, match.index).split("\n").length;
  if (!seen.has(name)) seen.set(name, [lineNumber]);
  else seen.get(name).push(lineNumber);
}

const duplicates = [];
for (const [name, lines] of seen) {
  if (lines.length > 1) duplicates.push({ name, lines });
}

if (duplicates.length > 0) {
  console.error("[check-env-example-unique] VIOLATIONS — duplicate env-var declarations in .env.example:");
  for (const dup of duplicates) {
    console.error(`  ${dup.name} appears at lines ${dup.lines.join(", ")}`);
  }
  process.exit(1);
}

console.log(
  `[check-env-example-unique] OK — ${totalDeclarations} env-var declarations scanned, all names unique.`,
);
