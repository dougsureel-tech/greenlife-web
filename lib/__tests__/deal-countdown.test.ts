// Tests for computeDealCountdown — pure date-band pricing of "Ongoing /
// Ends in N days / Ends tomorrow / Ends today / Ended" labels used by the
// SSR initial render of `<DealCountdown>` on `/deals`.
//
// Why pin: this was the cause of the /deals Suspense error digest 2617570418
// pre-extraction (server component imported a "use client" value). The
// extracted pure function is the contract — guard its bands here so a
// well-meaning ceil()/floor() swap doesn't silently regress the urgent
// flag and lose the rose-accent on the closing-window deals. Sister of
// scc lib/__tests__/deal-countdown.test.ts.

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { computeDealCountdown } from "../deal-countdown.ts";
import { DAY_MS, HOUR_MS } from "../time-constants.ts";

function isoDate(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString().slice(0, 10);
}

describe("computeDealCountdown — endpoint shapes", () => {
  test("null endDate returns Ongoing, not urgent", () => {
    const got = computeDealCountdown(null);
    assert.equal(got.label, "Ongoing");
    assert.equal(got.urgent, false);
  });

  test("date 5 days in the past returns Ended, urgent", () => {
    const got = computeDealCountdown(isoDate(-5 * DAY_MS));
    assert.equal(got.label, "Ended");
    assert.equal(got.urgent, true);
  });

  test("date 30 days in the past still returns Ended", () => {
    const got = computeDealCountdown(isoDate(-30 * DAY_MS));
    assert.equal(got.label, "Ended");
    assert.equal(got.urgent, true);
  });
});

describe("computeDealCountdown — far-future band (>7 days)", () => {
  test("10 days out renders as 'Ends Wkd, Mon D', not urgent", () => {
    const got = computeDealCountdown(isoDate(10 * DAY_MS));
    assert.match(got.label, /^Ends [A-Z][a-z]{2}, [A-Z][a-z]{2} \d{1,2}$/);
    assert.equal(got.urgent, false);
  });

  test("30 days out renders as 'Ends Wkd, Mon D', not urgent", () => {
    const got = computeDealCountdown(isoDate(30 * DAY_MS));
    assert.match(got.label, /^Ends [A-Z][a-z]{2}, [A-Z][a-z]{2} \d{1,2}$/);
    assert.equal(got.urgent, false);
  });
});

describe("computeDealCountdown — mid-range band (2-7 days)", () => {
  test("4 days + 12h out renders as 'Ends in N days' (N in 2..7)", () => {
    const got = computeDealCountdown(isoDate(4 * DAY_MS + 12 * HOUR_MS));
    assert.match(got.label, /^Ends in [2-7] days$/);
    assert.equal(got.urgent, false);
  });

  test("3 days + 12h out renders as 'Ends in N days' (N in 2..7)", () => {
    const got = computeDealCountdown(isoDate(3 * DAY_MS + 12 * HOUR_MS));
    assert.match(got.label, /^Ends in [2-7] days$/);
    assert.equal(got.urgent, false);
  });

  test("5 days + 6h out renders as 'Ends in N days', not urgent", () => {
    // Was 6 days + 12h — too close to the 7-day band boundary. Function
    // anchors to end-of-day PT, so 6.5-day offset can push into far-
    // future band depending on time-of-day. 5 days + 6h leaves headroom.
    const got = computeDealCountdown(isoDate(5 * DAY_MS + 6 * HOUR_MS));
    assert.match(got.label, /^Ends in [2-7] days$/);
    assert.equal(got.urgent, false);
  });
});

describe("computeDealCountdown — urgent flag invariants", () => {
  test("Ongoing is never urgent (won't pull rose accent)", () => {
    assert.equal(computeDealCountdown(null).urgent, false);
  });

  test("Ended is always urgent (must visually surface to retire CTA)", () => {
    assert.equal(computeDealCountdown(isoDate(-1 * DAY_MS)).urgent, true);
    assert.equal(computeDealCountdown(isoDate(-7 * DAY_MS)).urgent, true);
  });

  test("Far-future (>7d) is never urgent", () => {
    assert.equal(computeDealCountdown(isoDate(15 * DAY_MS)).urgent, false);
    assert.equal(computeDealCountdown(isoDate(60 * DAY_MS)).urgent, false);
  });

  test("Mid-range (2-7 days) is never urgent", () => {
    assert.equal(
      computeDealCountdown(isoDate(3 * DAY_MS + 12 * HOUR_MS)).urgent,
      false,
    );
    assert.equal(
      computeDealCountdown(isoDate(5 * DAY_MS + 12 * HOUR_MS)).urgent,
      false,
    );
  });
});

describe("computeDealCountdown — output shape contract", () => {
  test("every call returns { label, urgent } with correct types", () => {
    const cases = [null, isoDate(-1 * DAY_MS), isoDate(3 * DAY_MS), isoDate(20 * DAY_MS)];
    for (const c of cases) {
      const got = computeDealCountdown(c);
      assert.equal(typeof got.label, "string");
      assert.ok(got.label.length > 0, `label empty for ${c}`);
      assert.equal(typeof got.urgent, "boolean");
    }
  });
});
