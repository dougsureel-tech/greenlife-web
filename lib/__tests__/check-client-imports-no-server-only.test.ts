// Pin tests for scripts/check-client-imports-no-server-only.mjs.
//
// 14th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: `"use client"` component imports a module that has
// `import "server-only"`. Next.js refuses to bundle this — build errors
// with `'server-only' cannot be imported from a Client Component module`.
// CRITICAL TRAP: `pnpm typecheck` runs CLEAN — only Vercel build catches.
// Memory pin `feedback_typecheck_doesnt_catch_server_only_client_bundle`
// documents the discovery; recipe = probe `vercel ls --prod` ~30 min
// after push to confirm landing.
//
// Cannagent v6.2305 incident: 4 consecutive Vercel prod deploys errored
// over 40+ min before discovery. Cross-stack port from cannagent v6.2505
// + GW v2.97.D4. GLW has 5+ server-only files (rewards-session + 2
// emails + learn-db + email) — preventive lock.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-client-imports-no-server-only.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(
  process.cwd(),
  "scripts/check-client-imports-no-server-only.mjs",
);
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-client-imports-no-server-only — cannagent v6.2305 incident anchor preserved", () => {
  // The triggering incident — 4 consecutive Vercel prod fails over 40+
  // min before discovery. Pin the magnitude so future cleanup keeps
  // the WHY load-bearing.
  assert.match(GATE_SRC, /cannagent\s+v6\.2305/i, "cannagent v6.2305 incident anchor");
  assert.match(GATE_SRC, /4\s+consecutive/i, "4-consecutive-fails magnitude");
  assert.match(GATE_SRC, /40\+\s*minutes/i, "40+ min discovery delay");
});

test("check-client-imports-no-server-only — typecheck-CLEAN trap doctrine preserved", () => {
  // THE load-bearing insight: pnpm typecheck doesn't catch this. Without
  // this anchor the gate becomes "easy to demote" because the next dev
  // would wrongly assume tsc covers it.
  assert.match(GATE_SRC, /typecheck CLEAN/i, "typecheck-CLEAN trap documented");
  assert.match(GATE_SRC, /Vercel\s+build/, "only-Vercel-catches mechanism");
});

test("check-client-imports-no-server-only — Next.js error message documented", () => {
  // The literal error string Next.js emits — load-bearing for next dev
  // who Googles the error and lands on this gate's header.
  assert.match(
    GATE_SRC,
    /['"]server-only['"]\s+cannot\s+be\s+imported\s+from\s+a\s+Client\s+Component/i,
    "Next.js literal error string pinned",
  );
});

test("check-client-imports-no-server-only — USE_CLIENT_RE matches both quote shapes + comment-line tolerance", () => {
  // `"use client"` AND `'use client'` AND optional preceding comment
  // lines (some files have license headers above the directive).
  assert.ok(
    GATE_SRC.includes('["\']use client["\']'),
    "use-client directive regex tolerates both quotes",
  );
  assert.ok(
    GATE_SRC.includes("\\/\\/[^\\n]*\\n"),
    "use-client regex tolerates leading comment lines",
  );
});

test("check-client-imports-no-server-only — IMPORT_RE targets @/lib path alias", () => {
  // Scope: only `@/lib/...` imports — that's where server-only lives.
  // App-relative or external imports are out of scope.
  assert.ok(
    GATE_SRC.includes("@\\/lib\\/"),
    "@/lib path-alias scoping pinned",
  );
});

test("check-client-imports-no-server-only — SERVER_ONLY_RE pinned (multiline anchor)", () => {
  // Detection of `import "server-only"` line. Multiline /m flag is
  // load-bearing (file may have header lines).
  assert.ok(
    GATE_SRC.includes("server-only"),
    "server-only string pinned",
  );
  assert.match(
    GATE_SRC,
    /SERVER_ONLY_RE\s*=\s*\/.*server-only.*\/m/,
    "SERVER_ONLY_RE with /m flag pinned",
  );
});

test("check-client-imports-no-server-only — 30-line head-only scan for server-only directive", () => {
  // Optimization: server-only directive is in the file header. 30-line
  // window keeps the scan O(client-files × imports) not O(client-files
  // × lib-file-sizes).
  assert.match(
    GATE_SRC,
    /\.slice\(0,\s*30\)/,
    "30-line head-only optimization pinned",
  );
});

test("check-client-imports-no-server-only — resolveAtLib tries 4 canonical extensions", () => {
  // .ts + .tsx + /index.ts + /index.tsx — all valid resolution shapes
  // for `@/lib/foo`. Missing one = false-negative.
  for (const ext of [".ts", ".tsx"]) {
    assert.ok(
      GATE_SRC.includes(`rel + "${ext}"`),
      `direct ${ext} resolution pinned`,
    );
  }
  assert.ok(
    GATE_SRC.includes('"index.ts"') && GATE_SRC.includes('"index.tsx"'),
    "index.ts + index.tsx resolution shapes pinned",
  );
});

test("check-client-imports-no-server-only — SCAN_DIRS = app + components + lib", () => {
  // 3 canonical surfaces for client components.
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\["app",\s*"components",\s*"lib"\]/,
    "SCAN_DIRS canonical 3-dir set",
  );
});

test("check-client-imports-no-server-only — fix-guidance points to zero-deps extraction", () => {
  // The fix recipe: extract shared data to a no-server-only file.
  // Pin so it doesn't get edited away.
  assert.match(
    GATE_SRC,
    /zero-deps\s+file/,
    "fix-recipe: zero-deps extraction pinned",
  );
});

// ─── VRG-port type-only-import classifier hardening (fleet-leading) ────────
// Back-ported from VRG-app v9.7.1085 (2026-05-26). Prevents false-positive
// class where `import { type Foo } from "@/lib/server-only-x"` gets flagged
// despite being safe (types erase at runtime, no bundle drag).

test("check-client-imports-no-server-only — type-only-import classifier function present", () => {
  assert.ok(
    GATE_SRC.includes("isValueBearingImportClause"),
    "type-only-import classifier function present (VRG-port hardening)",
  );
});

test("check-client-imports-no-server-only — 4 import shapes documented in classifier", () => {
  // The fleet-leading hardening — all 4 shapes from the brief:
  //   `import type { Foo }` → SAFE (false)
  //   `import { type Foo }` → SAFE (false)
  //   `import { Foo, type Bar }` → FLAG (true — Foo is value)
  //   `import { Foo }` → FLAG (true — value)
  assert.ok(GATE_SRC.includes("import type { Foo }"), "type-only shape #1 documented");
  assert.ok(GATE_SRC.includes("import { type Foo }"), "type-only shape #2 documented");
  assert.ok(GATE_SRC.includes("import { Foo, type Bar }"), "mixed-shape #3 documented (flags)");
  assert.ok(GATE_SRC.includes("erases at runtime"), "the WHY of type-only-safe documented");
});

test("check-client-imports-no-server-only — opt-out marker comment supported (rare intentional)", () => {
  // Escape hatch for rare intentional cross-boundary imports.
  assert.ok(
    GATE_SRC.includes("server-only-client-bundle:intentional"),
    "opt-out marker name pinned",
  );
  assert.ok(GATE_SRC.includes("OPT_OUT_RE"), "opt-out regex var present");
});

test("check-client-imports-no-server-only — type-only skip count surfaced in OK message", () => {
  // Observability — operator should see how many type-only imports the
  // classifier correctly skipped, so they can sanity-check the gate is
  // distinguishing rather than silently passing everything.
  assert.match(
    GATE_SRC,
    /type-only imports skipped/,
    "type-only skip count in OK message",
  );
});
