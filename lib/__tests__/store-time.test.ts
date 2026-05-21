// Tests for `lib/store-time.ts` — storeToday() returns "YYYY-MM-DD" in
// store-local time (America/Los_Angeles per STORE_TZ).
//
// Why pinned: the doctrine WHY in the lib comment describes a real bug
// shape — bare `new Date().toISOString().slice(0,10)` returns UTC date,
// which drifts to "tomorrow" for ~7-8h every evening Pacific. The
// `pacific-date-coverage.test.ts` fs-sweep ENFORCES no file reintroduces
// that pattern. This test pins the canonical replacement's behavior
// directly so a regression in storeToday's IANA-tz wiring is caught.
//
// Run with:  pnpm test:all

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { storeToday } from "../store-time.ts";

// ── Return shape ────────────────────────────────────────────────────────

describe("storeToday — return shape", () => {
  test("returns a string", () => {
    assert.equal(typeof storeToday(), "string");
  });

  test("matches YYYY-MM-DD format", () => {
    assert.match(storeToday(), /^\d{4}-\d{2}-\d{2}$/);
  });

  test("year is 4 digits in expected range (2026-2030)", () => {
    const out = storeToday();
    const year = parseInt(out.slice(0, 4), 10);
    assert.ok(year >= 2026 && year <= 2030, `year ${year} out of range`);
  });

  test("month is 01-12", () => {
    const out = storeToday();
    const month = parseInt(out.slice(5, 7), 10);
    assert.ok(month >= 1 && month <= 12, `month ${month} out of range`);
  });

  test("day is 01-31", () => {
    const out = storeToday();
    const day = parseInt(out.slice(8, 10), 10);
    assert.ok(day >= 1 && day <= 31, `day ${day} out of range`);
  });
});

// ── Pacific timezone correctness — the load-bearing bug ────────────────

describe("storeToday — Pacific time correctness (UTC-evening trap)", () => {
  test("at 2026-05-13T07:00:00Z (midnight Pacific PDT) → 2026-05-13", () => {
    // 07:00 UTC = 00:00 PDT (UTC-7). Pacific calendar date is May 13.
    const dt = new Date("2026-05-13T07:00:00Z");
    assert.equal(storeToday(dt), "2026-05-13");
  });

  test("at 2026-05-13T06:00:00Z (11pm Pacific PDT — STILL May 12 Pacific) → 2026-05-12", () => {
    // 06:00 UTC May 13 = 23:00 PDT May 12. Pacific calendar date is May 12.
    // This is the bug shape: bare ISO would return "2026-05-13" (UTC date)
    // even though Pacific wall clock says May 12.
    const dt = new Date("2026-05-13T06:00:00Z");
    assert.equal(storeToday(dt), "2026-05-12");
  });

  test("at 2026-05-13T07:30:00Z (00:30 Pacific PDT) → 2026-05-13 (newly-tomorrow Pacific)", () => {
    const dt = new Date("2026-05-13T07:30:00Z");
    assert.equal(storeToday(dt), "2026-05-13");
  });

  test("at 2026-01-15T07:00:00Z (winter PST UTC-8 → 23:00 Jan 14 Pacific) → 2026-01-14", () => {
    // Winter is PST (UTC-8), so UTC 07:00 = PST 23:00 prior day.
    const dt = new Date("2026-01-15T07:00:00Z");
    assert.equal(storeToday(dt), "2026-01-14");
  });

  test("at 2026-01-15T08:00:00Z (winter PST, midnight Pacific) → 2026-01-15", () => {
    const dt = new Date("2026-01-15T08:00:00Z");
    assert.equal(storeToday(dt), "2026-01-15");
  });
});

// ── DST transitions ─────────────────────────────────────────────────────

describe("storeToday — DST transitions handled by IANA tz data", () => {
  test("just before spring-forward 2026-03-08T09:59:00Z (01:59 PST) → 2026-03-08", () => {
    const dt = new Date("2026-03-08T09:59:00Z");
    assert.equal(storeToday(dt), "2026-03-08");
  });

  test("just after spring-forward 2026-03-08T10:01:00Z (03:01 PDT) → 2026-03-08", () => {
    const dt = new Date("2026-03-08T10:01:00Z");
    assert.equal(storeToday(dt), "2026-03-08");
  });

  test("just before fall-back 2026-11-01T08:59:00Z (01:59 PDT) → 2026-11-01", () => {
    const dt = new Date("2026-11-01T08:59:00Z");
    assert.equal(storeToday(dt), "2026-11-01");
  });
});

// ── Defaults ────────────────────────────────────────────────────────────

describe("storeToday — default argument", () => {
  test("called with no arg uses current Date", () => {
    const out = storeToday();
    // Just verify it returns a valid YYYY-MM-DD; can't pin a specific
    // value since "now" moves. The format check above covers shape.
    assert.match(out, /^\d{4}-\d{2}-\d{2}$/);
  });
});
