/**
 * Inline-form-action tuple-discard arc-guard.
 *
 * Sister of GW, cannagent v6.0365, inv v397.085. Pins memory pin
 * `feedback_inline_form_action_discards_tuple` against regression.
 *
 * Bug class:
 *
 *   <form action={async (fd: FormData) => { await someServerAction(fd); }}>
 *
 * The inner `await someAction(fd)` returns `{ok: false, error: '...'}`
 * on validation failure / DB write rejection, but the inline closure
 * swallows it. User clicks Submit → action rejects → UI shows nothing
 * changed and no error message.
 *
 * On glw/scc the most common patterns are RBAC role changes + cookie
 * issue/revoke (e.g. setup-link reissue, vendor-access submit). A
 * silent rejection on those is a real UX dead-end + a real audit-trail
 * gap on /admin surfaces.
 *
 * glw/scc historically clean — pattern not used. Pure defense ship.
 *
 * Allowed shape: wrap the action in a client component that captures
 * the result + surfaces the error inline.
 *
 * Exits 1 on any hit. Bypass: append `// eslint-disable-line` if the
 * inner call is verified void-return.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const SCAN_DIRS = ["app", "components"];
const PATTERN = /<form\s+action=\{\s*async\s*\(/;

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    if (name === "node_modules" || name === "__tests__" || name.startsWith(".")) continue;
    const p = join(dir, name);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, out);
    else if (st.isFile() && (p.endsWith(".tsx") || p.endsWith(".jsx"))) out.push(p);
  }
  return out;
}

const files = SCAN_DIRS.flatMap((d) => walk(join(process.cwd(), d)));
const hits = [];

for (const f of files) {
  const lines = readFileSync(f, "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) continue;
    if (PATTERN.test(line) && !line.includes("eslint-disable")) {
      hits.push({ file: f.replace(process.cwd() + "/", ""), lineNum: i + 1, line: trimmed });
    }
  }
}

if (hits.length > 0) {
  console.error(`✗ check-inline-form-action-tuple-discard: ${hits.length} inline-form-action site(s) found.`);
  console.error(`  Memory pin: feedback_inline_form_action_discards_tuple`);
  console.error(``);
  console.error(`  Bug class: <form action={async (fd) => { await someAction(fd); }}>`);
  console.error(`  swallows {ok:false, error:'...'} returns. Wrap in a client`);
  console.error(`  component that captures the result.`);
  console.error(``);
  for (const h of hits) {
    console.error(`  ${h.file}:${h.lineNum}`);
    console.error(`    ${h.line}`);
  }
  console.error(``);
  console.error(`  Bypass: append // eslint-disable-line to the form-action line.`);
  process.exit(1);
}

console.log(`✓ check-inline-form-action-tuple-discard: ${files.length} files scanned, 0 inline-form-action sites`);
