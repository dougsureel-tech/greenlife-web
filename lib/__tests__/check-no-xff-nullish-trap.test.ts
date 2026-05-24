// Pin tests for scripts/check-no-xff-nullish-trap.mjs.
//
// 31st gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine (HIGH-STAKES — rate-limit-bypass via empty-string-trap):
// `?? "unknown"` only catches null/undefined — whitespace-only headers
// collapse to "" and bucket ALL such requests under the SAME rate-limit
// key. Per-IP brute-force / enumeration / password-spray defenses
// STRUCTURALLY depend on the per-IP key being per-IP. Inv 2026-05-13
// v32.605 sweep: 5 inline `x-forwarded-for` extraction sites.
//
// Canonical fix: `getClientIp(headers)` from `@/lib/client-ip` —
// truthy-guard AFTER trim so empty/whitespace fall through to
// "unknown" instead of "".
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-no-xff-nullish-trap.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(
  process.cwd(),
  "scripts/check-no-xff-nullish-trap.mjs",
);
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-no-xff-nullish-trap — inv v402.945 + v32.605 + 2026-05-13 sweep anchors", () => {
  // Ship anchors for the cross-stack sweep day.
  assert.match(GATE_SRC, /v402\.945/, "inv v402.945 ship anchor");
  assert.match(GATE_SRC, /v32\.605/, "v32.605 sweep ship anchor");
  assert.match(GATE_SRC, /2026-05-13/, "2026-05-13 sweep date anchor");
});

test("check-no-xff-nullish-trap — empty-string-collapse + same-bucket mechanism", () => {
  // The MECHANISM: empty-string → same rate-limit key bucket for all
  // affected requests. Pin so the security stakes stay anchored.
  assert.match(
    GATE_SRC,
    /whitespace-only/i,
    "whitespace-only header collapse documented",
  );
  assert.match(
    GATE_SRC,
    /same\s+rate-limit\s+key/i,
    "same-bucket mechanism prose",
  );
});

test("check-no-xff-nullish-trap — security defenses depend on per-IP key (brute/enumerate/spray)", () => {
  // The 3 attack vectors that depend on this. Pin so the "real security
  // concern" anchor stays.
  for (const vector of ["brute-force", "enumeration", "password-spray"]) {
    assert.ok(
      GATE_SRC.includes(vector),
      `attack-vector ${vector} must be in doctrine prose`,
    );
  }
});

test("check-no-xff-nullish-trap — getClientIp() + @/lib/client-ip SoT anchored", () => {
  // The canonical helper + import path. Drift breaks the fix recipe link.
  assert.match(GATE_SRC, /getClientIp/, "getClientIp() helper name");
  assert.match(
    GATE_SRC,
    /@\/lib\/client-ip/,
    "@/lib/client-ip SoT import path",
  );
});

test("check-no-xff-nullish-trap — XFF_TRAP_RE: x-forwarded-for + ?? '<word>'", () => {
  // The detection regex shape. 120-char window between header read +
  // ?? fallback covers multi-line extracts. Drift = miss.
  assert.ok(
    GATE_SRC.includes("x-forwarded-for"),
    "x-forwarded-for header substring pinned",
  );
  assert.ok(
    GATE_SRC.includes("\\?\\?\\s*[\"']"),
    "?? '<word>' nullish-coalescing pattern pinned",
  );
  assert.match(
    GATE_SRC,
    /\{0,120\}/,
    "120-char window between header + ?? pinned",
  );
});

test("check-no-xff-nullish-trap — IGNORE_MARKER = `arc-guard: xff-nullish-trap:ignore`", () => {
  // Per-file escape — pin literal so it stays stable.
  assert.match(
    GATE_SRC,
    /arc-guard:\s*xff-nullish-trap:ignore/,
    "IGNORE_MARKER literal pinned",
  );
});

test("check-no-xff-nullish-trap — FILE_ALLOWLIST = 3 entries (version + changelog + client-ip SoT)", () => {
  // The 3 files that always carry prose describing the bug (or ARE the
  // SoT). Pin all 3 so future scope tightening doesn't drop one.
  for (const f of ["lib/version.ts", "lib/changelog.ts", "lib/client-ip.ts"]) {
    assert.ok(
      GATE_SRC.includes(`"${f}"`),
      `FILE_ALLOWLIST must include "${f}"`,
    );
  }
});

test("check-no-xff-nullish-trap — anchored via import.meta.url (arc-guard memory pin)", () => {
  // Cross-stack-cwd-trap memory pin compliance.
  assert.ok(
    GATE_SRC.includes("import.meta.url") &&
      GATE_SRC.includes("fileURLToPath"),
    "REPO_ROOT must anchor via import.meta.url + fileURLToPath",
  );
});

test("check-no-xff-nullish-trap — SCAN_ROOTS = app + lib + components", () => {
  // 3 canonical surfaces for rate-limit handlers.
  for (const dir of ['"app"', '"lib"', '"components"']) {
    assert.ok(
      GATE_SRC.includes(dir),
      `SCAN_ROOTS must include ${dir}`,
    );
  }
});

test("check-no-xff-nullish-trap — fix-guidance lists 2 recipes (canonical + opt-out)", () => {
  // Self-documenting fix.
  assert.ok(
    GATE_SRC.includes("import { getClientIp }") &&
      GATE_SRC.includes("@/lib/client-ip"),
    "fix recipe 1: import getClientIp() pinned",
  );
  assert.match(
    GATE_SRC,
    /audit-log\s+truncation/i,
    "fix recipe 2: opt-out for audit-log truncation pinned",
  );
});

test("check-no-xff-nullish-trap — strict by default, --warn opt-in", () => {
  assert.match(
    GATE_SRC,
    /WARN_ONLY\s*=\s*process\.argv\.includes\("--warn"\)/,
    "--warn flag binding pinned",
  );
  assert.match(
    GATE_SRC,
    /process\.exit\(WARN_ONLY \? 0 : 1\)/,
    "default-strict exit policy pinned",
  );
});
