// Tests for `lib/client-ip.ts` — getClientIp() SSoT for the 5 inline
// duplicates lifted in the same arc.
//
// Why pinned: the doctrine WHY (in the lib comment) describes a
// real bucket-collision bug — `?? "unknown"` only catches null/undefined,
// so whitespace-only `x-forwarded-for` returned empty string, which
// in turn collided every rate-limit bucket onto the single "" key.
// A regression that re-introduces `??` (instead of truthy check) would
// silently re-enable the same bug class. Pin both null/undefined AND
// empty/whitespace branches explicitly — the difference between them
// is exactly the bug.
//
// Run with:  pnpm test:all

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { getClientIp } from "../client-ip.ts";

function h(record: Record<string, string>): Headers {
  return new Headers(record);
}

// ── x-forwarded-for happy path ──────────────────────────────────────────

describe("getClientIp — x-forwarded-for", () => {
  test("single IP returns the IP", () => {
    assert.equal(getClientIp(h({ "x-forwarded-for": "203.0.113.5" })), "203.0.113.5");
  });

  test("multiple comma-separated IPs returns first only", () => {
    assert.equal(
      getClientIp(h({ "x-forwarded-for": "203.0.113.5, 10.0.0.1, 172.16.0.1" })),
      "203.0.113.5",
    );
  });

  test("IPv6 single IP returns the IP", () => {
    assert.equal(
      getClientIp(h({ "x-forwarded-for": "2001:db8::1" })),
      "2001:db8::1",
    );
  });

  test("trims whitespace around the first IP", () => {
    assert.equal(getClientIp(h({ "x-forwarded-for": "  203.0.113.5  " })), "203.0.113.5");
  });

  test("trims whitespace inside comma-separated", () => {
    assert.equal(
      getClientIp(h({ "x-forwarded-for": " 203.0.113.5 , 10.0.0.1 " })),
      "203.0.113.5",
    );
  });
});

// ── x-forwarded-for empty / whitespace (the load-bearing bug) ──────────

describe("getClientIp — x-forwarded-for empty/whitespace → fallback (not '')", () => {
  test("empty x-forwarded-for falls through to x-real-ip", () => {
    assert.equal(
      getClientIp(h({ "x-forwarded-for": "", "x-real-ip": "203.0.113.5" })),
      "203.0.113.5",
    );
  });

  test("whitespace-only x-forwarded-for falls through (truthy-check, not ??)", () => {
    assert.equal(
      getClientIp(h({ "x-forwarded-for": "   ", "x-real-ip": "10.0.0.1" })),
      "10.0.0.1",
    );
  });

  test("comma-only x-forwarded-for falls through", () => {
    assert.equal(
      getClientIp(h({ "x-forwarded-for": ",", "x-real-ip": "10.0.0.1" })),
      "10.0.0.1",
    );
  });

  test("whitespace + commas falls through", () => {
    assert.equal(
      getClientIp(h({ "x-forwarded-for": ", , ", "x-real-ip": "10.0.0.1" })),
      "10.0.0.1",
    );
  });
});

// ── x-real-ip fallback ──────────────────────────────────────────────────

describe("getClientIp — x-real-ip fallback (no x-forwarded-for)", () => {
  test("x-real-ip returned when x-forwarded-for absent", () => {
    assert.equal(getClientIp(h({ "x-real-ip": "203.0.113.5" })), "203.0.113.5");
  });

  test("x-real-ip is trimmed", () => {
    assert.equal(getClientIp(h({ "x-real-ip": "  203.0.113.5  " })), "203.0.113.5");
  });

  test("empty x-real-ip falls through to 'unknown'", () => {
    assert.equal(getClientIp(h({ "x-real-ip": "" })), "unknown");
  });

  test("whitespace-only x-real-ip falls through to 'unknown'", () => {
    assert.equal(getClientIp(h({ "x-real-ip": "   " })), "unknown");
  });
});

// ── 'unknown' fallback ──────────────────────────────────────────────────

describe("getClientIp — 'unknown' fallback when no headers", () => {
  test("empty headers returns 'unknown'", () => {
    assert.equal(getClientIp(h({})), "unknown");
  });

  test("unrelated headers only returns 'unknown'", () => {
    assert.equal(
      getClientIp(h({ "user-agent": "Mozilla/5.0", "content-type": "application/json" })),
      "unknown",
    );
  });
});

// ── precedence ─────────────────────────────────────────────────────────

describe("getClientIp — precedence", () => {
  test("x-forwarded-for wins over x-real-ip when both present", () => {
    assert.equal(
      getClientIp(h({
        "x-forwarded-for": "203.0.113.5",
        "x-real-ip": "10.0.0.1",
      })),
      "203.0.113.5",
    );
  });
});
