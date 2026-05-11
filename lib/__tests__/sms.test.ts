// Tests for `lib/sms.ts` — `normalizeToE164` boundary normalization that
// every SMS send funnels through.
//
// Why pinned: v3.330 ship caught the regression where sendSms passed raw
// `to` straight to Twilio without normalization; the prior `normalizePhone`
// only handled `+`-prefix and naive 10-digit, dropped formatted US and
// 11-digit `1XXX`. Real customer impact = silent SMS rejection at the
// Twilio boundary. Pin the input shapes the codebase actually sees so a
// future refactor can't drop coverage of an input class.
//
// Run with:  pnpm test:all

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { normalizeToE164, normalizePhone } from "../sms.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SMS_SRC = readFileSync(join(__dirname, "..", "sms.ts"), "utf-8");

describe("normalizeToE164 — input shapes the codebase sees", () => {
  test("raw 10-digit US → +1 prefix", () => {
    assert.equal(normalizeToE164("5095550100"), "+15095550100");
  });

  test("formatted US '(509) 555-0100' → +15095550100", () => {
    assert.equal(normalizeToE164("(509) 555-0100"), "+15095550100");
  });

  test("dashed US '509-555-0100' → +15095550100", () => {
    assert.equal(normalizeToE164("509-555-0100"), "+15095550100");
  });

  test("dotted US '509.555.0100' → +15095550100", () => {
    assert.equal(normalizeToE164("509.555.0100"), "+15095550100");
  });

  test("already-E.164 '+15095550100' → passes through unchanged", () => {
    assert.equal(normalizeToE164("+15095550100"), "+15095550100");
  });

  test("11-digit '1XXX' shape → +1 prefix", () => {
    assert.equal(normalizeToE164("15095550100"), "+15095550100");
  });

  test("international 11+ digits → + prefix", () => {
    assert.equal(normalizeToE164("447911123456"), "+447911123456");
  });

  test("E.164 with separators stays valid: '+1 (509) 555-0100' → +15095550100", () => {
    assert.equal(normalizeToE164("+1 (509) 555-0100"), "+15095550100");
  });
});

describe("normalizeToE164 — failure modes (Twilio reject preferred over silent malformed)", () => {
  test("empty string → empty string (Twilio rejects cleanly)", () => {
    assert.equal(normalizeToE164(""), "");
  });

  test("whitespace-only → empty string", () => {
    assert.equal(normalizeToE164("   "), "");
  });

  test("under-10-digit US → unchanged (Twilio rejects)", () => {
    assert.equal(normalizeToE164("5550100"), "5550100");
  });

  test("garbage input → unchanged", () => {
    assert.equal(normalizeToE164("hello"), "hello");
  });

  test("bare '+' with no digits → '+' (Twilio rejects)", () => {
    assert.equal(normalizeToE164("+"), "+");
  });
});

describe("normalizeToE164 — idempotency (round-trip safe)", () => {
  test("running twice produces identical output", () => {
    const once = normalizeToE164("(509) 555-0100");
    const twice = normalizeToE164(once);
    assert.equal(once, "+15095550100");
    assert.equal(twice, once);
  });

  test("E.164 round-trips: same input/output ratio across all formats", () => {
    const cases = ["+15095550100", "5095550100", "(509) 555-0100", "15095550100"];
    const normalized = cases.map(normalizeToE164);
    // All should converge to the same E.164.
    assert.equal(new Set(normalized).size, 1);
    assert.equal(normalized[0], "+15095550100");
  });
});

describe("normalizePhone alias — back-compat for legacy call sites", () => {
  test("normalizePhone is exactly normalizeToE164", () => {
    assert.equal(normalizePhone, normalizeToE164);
  });

  test("normalizePhone produces same output as normalizeToE164", () => {
    assert.equal(normalizePhone("5095550100"), normalizeToE164("5095550100"));
  });
});

describe("sendSms — PII strip in catch block (sister scc + lib/email.ts hygiene)", () => {
  test("catch block strips E.164 patterns from error", () => {
    assert.match(
      SMS_SRC,
      /\.replace\(\/\\\+\\d\{10,15\}\/g,\s*["']<phone>["']\)/,
      "lib/sms.ts catch block must strip +\\d{10,15} from error message",
    );
  });

  test("catch block also strips bare 10-15 digit runs", () => {
    assert.match(
      SMS_SRC,
      /\.replace\(\/\\b\\d\{10,15\}\\b\/g,\s*["']<phone>["']\)/,
      "lib/sms.ts catch block must also strip \\b\\d{10,15}\\b (non-E.164 raw digits)",
    );
  });

  test("catch block truncates to bounded length (defense in depth)", () => {
    assert.match(
      SMS_SRC,
      /\.slice\(0,\s*1[0-9]{2}\)/,
      "lib/sms.ts catch block must bound length via .slice(0, 100-199)",
    );
  });

  test("catch block does NOT return raw e.message directly", () => {
    assert.ok(
      !/error:\s*e\.message\s*\}/.test(SMS_SRC),
      "lib/sms.ts must NOT return raw e.message — PII leak (Twilio echoes phone)",
    );
    assert.ok(
      !/error:\s*e\s+instanceof\s+Error\s*\?\s*e\.message\s*:\s*String\(e\)\s*\}/.test(SMS_SRC),
      "lib/sms.ts must NOT return raw e.message ternary — pre-fix pattern",
    );
  });
});
