// Tests for `lib/time-constants.ts` — ms-time constants SSoT.
//
// Why pinned: composability is the whole point of the SoT
// (change MINUTE_MS once + every higher unit follows). A regression
// where someone hardcodes a wrong value (e.g. WEEK_MS = 6 * DAY_MS by
// typo) would silently miscount in every consumer. The
// `day-ms-coverage.test.ts` fs-sweep ENFORCES no file inlines the
// literal value. This test pins the constants' actual numeric values
// + composition relationships.
//
// Run with:  pnpm test:all

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  SECOND_MS,
  MINUTE_MS,
  HOUR_MS,
  DAY_MS,
  WEEK_MS,
} from "../time-constants.ts";

// ── Absolute values ────────────────────────────────────────────────────

describe("time-constants — absolute values", () => {
  test("SECOND_MS = 1000", () => {
    assert.equal(SECOND_MS, 1000);
  });

  test("MINUTE_MS = 60,000", () => {
    assert.equal(MINUTE_MS, 60_000);
  });

  test("HOUR_MS = 3,600,000", () => {
    assert.equal(HOUR_MS, 3_600_000);
  });

  test("DAY_MS = 86,400,000", () => {
    assert.equal(DAY_MS, 86_400_000);
  });

  test("WEEK_MS = 604,800,000", () => {
    assert.equal(WEEK_MS, 604_800_000);
  });
});

// ── Composition relationships ──────────────────────────────────────────

describe("time-constants — composition (SoT-derivation guarantees)", () => {
  test("MINUTE_MS = 60 * SECOND_MS", () => {
    assert.equal(MINUTE_MS, 60 * SECOND_MS);
  });

  test("HOUR_MS = 60 * MINUTE_MS", () => {
    assert.equal(HOUR_MS, 60 * MINUTE_MS);
  });

  test("HOUR_MS = 3600 * SECOND_MS", () => {
    assert.equal(HOUR_MS, 3600 * SECOND_MS);
  });

  test("DAY_MS = 24 * HOUR_MS", () => {
    assert.equal(DAY_MS, 24 * HOUR_MS);
  });

  test("DAY_MS = 1440 * MINUTE_MS", () => {
    assert.equal(DAY_MS, 1440 * MINUTE_MS);
  });

  test("WEEK_MS = 7 * DAY_MS", () => {
    assert.equal(WEEK_MS, 7 * DAY_MS);
  });

  test("WEEK_MS = 168 * HOUR_MS", () => {
    assert.equal(WEEK_MS, 168 * HOUR_MS);
  });
});

// ── Type shape ─────────────────────────────────────────────────────────

describe("time-constants — type shape", () => {
  test("all are numbers", () => {
    for (const v of [SECOND_MS, MINUTE_MS, HOUR_MS, DAY_MS, WEEK_MS]) {
      assert.equal(typeof v, "number");
    }
  });

  test("all are positive finite integers", () => {
    for (const v of [SECOND_MS, MINUTE_MS, HOUR_MS, DAY_MS, WEEK_MS]) {
      assert.ok(Number.isInteger(v), `expected integer, got ${v}`);
      assert.ok(v > 0, `expected positive, got ${v}`);
      assert.ok(Number.isFinite(v));
    }
  });

  test("monotonic ascending: SECOND < MINUTE < HOUR < DAY < WEEK", () => {
    assert.ok(SECOND_MS < MINUTE_MS);
    assert.ok(MINUTE_MS < HOUR_MS);
    assert.ok(HOUR_MS < DAY_MS);
    assert.ok(DAY_MS < WEEK_MS);
  });
});
