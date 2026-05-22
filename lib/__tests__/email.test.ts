// Pin tests for lib/email.ts via fs.readFileSync source-assertion.
//
// Why fs-based instead of module-load: email.ts imports "server-only",
// which throws under node --test --experimental-strip-types. Following
// the established GLW pattern (sister of lib/__tests__/email-templates
// .test.ts file header doctrine): read source as string + regex-assert
// structural invariants. Weaker than runtime-call assertions but
// catches all the drift classes that matter:
//   - VERIFIED_HOSTS allowlist contents (load-bearing — drift here
//     reopens the Jensine-class silent-spam-fold diagnostic gap)
//   - Function signatures (export shapes consumed by /api/health)
//   - PII-safety invariants (no local-part in returned host, log
//     formatting uses err.name not err.message)
//   - Code-default fallback values (RESEND_FROM-unset paths)
//
// Origin doctrine: Jensine welcome-email 2026-05-11 silent-spam-fold
// (burned 3hr on inv before readiness probes surfaced root cause).
//
// Run: pnpm test:all
// Or: node --test --experimental-strip-types --no-warnings lib/__tests__/email.test.ts

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = join(HERE, "..", "email.ts");
const SRC = readFileSync(SOURCE_PATH, "utf-8");

// ── Server-only barrier (intentional) ──────────────────────────────

describe("email.ts — server-only barrier", () => {
  test("imports `server-only` (blocks accidental client-bundle inclusion)", () => {
    // The file MUST stay server-only so a future client component can't
    // import Resend client + the api key by mistake. The barrier is
    // load-bearing — drift = a client-bundle apikey leak.
    assert.match(SRC, /^import "server-only";/m);
  });
});

// ── VERIFIED_HOSTS allowlist — load-bearing invariant ──────────────

describe("VERIFIED_HOSTS — SPF/DKIM-aligned host allowlist", () => {
  test("declared as a Set<string> (Set membership semantics)", () => {
    assert.match(SRC, /const VERIFIED_HOSTS\s*=\s*new Set<string>\(\[/);
  });

  test("contains apex `greenlifecannabis.com` (post-2026-05-19 SPF + DKIM verification)", () => {
    // The 2026-05-19 evening update added _spf.resend.com to the apex
    // SPF + verified DKIM on apex. Apex MUST stay in VERIFIED_HOSTS or
    // the readiness probe falsely flags it as at-risk again, reopening
    // the Jensine-class diagnostic gap.
    assert.match(
      SRC,
      /["']greenlifecannabis\.com["']/,
      "VERIFIED_HOSTS MUST contain apex 'greenlifecannabis.com' literal",
    );
  });

  test("contains subdomain `send.greenlifecannabis.com` (original safe-host pattern)", () => {
    assert.match(
      SRC,
      /["']send\.greenlifecannabis\.com["']/,
      "VERIFIED_HOSTS MUST contain 'send.greenlifecannabis.com' literal",
    );
  });

  test("does NOT contain SCC apex (cross-stack leak defense)", () => {
    // A copy-paste from SCC code would put 'seattlecannabis.co' in
    // GLW's allowlist. Pin against that cross-stack leak — each stack's
    // Resend tenant is per-domain-verified.
    assert.doesNotMatch(SRC, /["']seattlecannabis\.co["']/);
  });

  test("does NOT contain known typo variants (.con / .co / .cmo)", () => {
    // Defensive: catch if a future agent accidentally types a TLD typo.
    assert.doesNotMatch(SRC, /["']greenlifecannabis\.con["']/);
    assert.doesNotMatch(SRC, /["']greenlifecannabis\.cmo["']/);
  });
});

// ── Exported function signatures ────────────────────────────────────

describe("email.ts — exported function signatures", () => {
  test("exports isEmailConfigured(): boolean", () => {
    assert.match(SRC, /^export function isEmailConfigured\(\):\s*boolean/m);
  });

  test("exports isEmailFromAtRisk(): boolean | null", () => {
    // Triple-state return (boolean | null) is the documented contract.
    // Drift to plain `boolean` would silently demote the "no api key →
    // null" honest-unknown signal to a false positive/negative.
    assert.match(SRC, /^export function isEmailFromAtRisk\(\):\s*boolean \| null/m);
  });

  test("exports getEmailFromHost(): string | null", () => {
    assert.match(SRC, /^export function getEmailFromHost\(\):\s*string \| null/m);
  });

  test("exports sendEmail(args: SendEmailArgs): Promise<SendEmailResult>", () => {
    assert.match(
      SRC,
      /^export async function sendEmail\(args:\s*SendEmailArgs\):\s*Promise<SendEmailResult>/m,
    );
  });

  test("exports the SendEmailArgs + SendEmailResult types (callers depend on these)", () => {
    assert.match(SRC, /^export type SendEmailArgs\s*=/m);
    assert.match(SRC, /^export type SendEmailResult\s*=/m);
  });
});

// ── Code-default fallback values ────────────────────────────────────

describe("email.ts — code-default fallback values", () => {
  test("getDefaultFrom code-default is `Green Life Cannabis <hi@greenlifecannabis.com>`", () => {
    // Drift here = brand-display-name regression in every email sent
    // when RESEND_FROM env-var is unset (dev / preview environments).
    assert.match(
      SRC,
      /"Green Life Cannabis <hi@greenlifecannabis\.com>"/,
      "code-default From string drifted from canonical brand format",
    );
  });

  test("getEmailFromHost RESEND_FROM-unset path returns `greenlifecannabis.com`", () => {
    // The /api/health probe surfaces this value; if it ever drifted to
    // empty string or 'undefined', operators couldn't tell unconfigured
    // from misconfigured.
    assert.match(
      SRC,
      /return "greenlifecannabis\.com";\s*\/\/\s*code-default apex/,
      "code-default apex return drifted",
    );
  });
});

// ── PII safety — error-handling discipline ─────────────────────────

describe("email.ts — PII-safety invariants", () => {
  test("error catch logs `err.name` NOT `err.message` (Resend echoes recipient in .message)", () => {
    // File comment: "Resend SDK errors echo the recipient address in
    // .message ('domain not verified for foo@example.com')". Logging
    // .message would leak customer email PII into Vercel logs. Pin the
    // err.name pattern in the catch block.
    assert.match(
      SRC,
      /e instanceof Error \? e\.name : "Error"/,
      "catch must extract err.name not err.message",
    );
    assert.match(
      SRC,
      /\[email\] send failed: \$\{errName\}/,
      "error log line must use the err.name-only template",
    );
  });

  test("Resend success-path errResp logs `errResp.name` NOT `errResp.message`", () => {
    // Sister of the catch path — Resend v4 returns { error: ErrorResponse }
    // on rejection (does NOT throw). The error branch must extract .name
    // not .message for the same PII reason.
    assert.match(
      SRC,
      /const errName = errResp\.name \?\? "ResendError"/,
      "Resend success-path error branch must use err.name",
    );
  });

  test("RESEND_API_KEY-unset no-op path logs ONLY `[email] RESEND_API_KEY not configured` (no recipient)", () => {
    // Most common path in dev/preview — runs on EVERY send attempt.
    // Including the recipient address here would log a recipient
    // per send-attempt. Pin the no-recipient log line.
    assert.match(
      SRC,
      /console\.info\("\[email\] RESEND_API_KEY not configured — skipping send"\)/,
    );
  });

  test("getEmailFromHost comment explicitly documents PII-safety invariant", () => {
    // The "domain portion only — PII-safe, no local-part" comment is
    // the load-bearing doctrine. A future agent might "fix" the function
    // to return the full address; the comment is the trip wire that
    // tells them not to.
    // Comment spans 2 lines with "* " continuation, so match must
    // tolerate any chars (including \n + * + spaces) between the anchors:
    //   "PII-safe, no\n * local-part)."
    assert.match(SRC, /PII-safe[\s\S]{1,80}local-part/);
  });
});

// ── List-Unsubscribe (RFC 8058 + Gmail Feb 2024) ───────────────────

describe("email.ts — RFC 8058 unsubscribe header invariants", () => {
  test("declares both List-Unsubscribe AND List-Unsubscribe-Post (one-click requires both per RFC)", () => {
    // Gmail's Feb 2024 bulk-sender requirements: BOTH headers must be
    // present for the one-click button to render. Dropping either = the
    // visible-unsubscribe-button deliverability signal goes away.
    assert.match(SRC, /"List-Unsubscribe":\s*`<\$\{args\.unsubscribeUrl\}>/);
    assert.match(SRC, /"List-Unsubscribe-Post":\s*"List-Unsubscribe=One-Click"/);
  });

  test("List-Unsubscribe also carries a mailto fallback (matches RFC 8058 + Resend best practice)", () => {
    assert.match(SRC, /mailto:\$\{bareEmail\}\?subject=Unsubscribe/);
  });

  test("mailto-fallback prefers `replyTo` over `from` (replies land on monitored mailbox)", () => {
    // File comment: "Mailto fallback uses replyTo when set (preferred —
    // actively monitored) or the from-address when not."
    assert.match(SRC, /const mailtoSource\s*=\s*replyTo \|\| args\.from \|\| getDefaultFrom\(\)/);
  });
});

// ── Doctrine references (anti-rot pins) ────────────────────────────

describe("email.ts — doctrine-reference invariants", () => {
  test("comment preserves Jensine 2026-05-11 incident reference", () => {
    // The Jensine incident IS the WHY for the readiness probes existing.
    // If this comment rots, the next agent might delete the probes
    // thinking they're untested infrastructure.
    assert.match(SRC, /Jensine[\s\S]*2026-05-11/);
  });

  test("comment preserves 2026-05-19 evening apex SPF/DKIM update reference", () => {
    // The 2026-05-19 update is WHY apex is in VERIFIED_HOSTS today. If
    // SPF/DKIM verification state ever reverts, this comment is the
    // anchor for the "go look at Resend dashboard" recovery path.
    assert.match(SRC, /2026-05-19/);
  });

  test("comment references the memory pin for the original at-risk doctrine", () => {
    assert.match(SRC, /feedback_resend_apex_vs_send_subdomain_trap/);
  });
});
