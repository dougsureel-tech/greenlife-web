#!/usr/bin/env node
//
// check-server-actions-async — pre-push gate.
//
// Catches the Next 16 Turbopack regression where a "use server" file
// exports a SYNC function (or any non-async non-type value). Vitest
// happily ignores the "use server" directive and runs the test green;
// the production Turbopack build fails with:
//
//   Server Actions must be async functions
//
// — but only at deploy time. By then the deploy is stuck and rollback
// is the only recovery.
//
// glw port: walks app/ (no src/ wrapper).

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const REPO_ROOT = process.cwd();
const SCAN_DIRS = ["app", "components", "lib"].map((d) => join(REPO_ROOT, d));

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
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

function isServerActionsFile(content) {
  const firstReal = content
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith("//") && !l.startsWith("/*") && !l.startsWith("*"));
  if (!firstReal) return false;
  return /^["']use server["'];?$/.test(firstReal);
}

function findExports(content) {
  const lines = content.split("\n");
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trimStart();
    if (trimmed.startsWith("export ")) {
      out.push({ line: i + 1, text: trimmed });
    }
  }
  return out;
}

function isAllowed(text) {
  return (
    text.startsWith("export async function ") ||
    text.startsWith("export type ") ||
    text.startsWith("export interface ") ||
    text.startsWith("export type {") ||
    text.startsWith("export type * from") ||
    text.startsWith("export default async ")
  );
}

let serverFiles = 0;
let violations = 0;
const reports = [];

for (const file of SCAN_DIRS.flatMap(walk)) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (!isServerActionsFile(content)) continue;
  serverFiles++;

  const exportLines = findExports(content);
  for (const { line, text } of exportLines) {
    if (!isAllowed(text)) {
      violations++;
      reports.push({
        file: relative(REPO_ROOT, file),
        line,
        text: text.length > 100 ? `${text.slice(0, 97)}...` : text,
      });
    }
  }
}

if (violations > 0) {
  console.error(
    "[check-server-actions-async] VIOLATIONS — Next 16 Turbopack will reject these:",
  );
  console.error("");
  for (const r of reports) {
    console.error(`  ${r.file}:${r.line}`);
    console.error(`    ${r.text}`);
  }
  console.error("");
  console.error(
    "Every export from a `\"use server\"` file MUST be an async function (or type).",
  );
  console.error(
    'Fix: extract sync helpers to a non-"use server" module, or make the function async.',
  );
  process.exit(1);
}

console.log(
  `[check-server-actions-async] OK — ${serverFiles} "use server" file${serverFiles === 1 ? "" : "s"} scanned, all exports async.`,
);
