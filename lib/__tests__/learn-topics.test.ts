// Locks LEARN_TOPICS as the WSLCB-compliant /learn page canon.
//
// The arc-guard `scripts/check-efficacy-claims.mjs` scans lib/ for
// therapeutic-claim regex matches — that catches most variants but is
// regex-based + can miss edge phrasings (caught in this session at
// v17.305 + v17.505 + v17.605 + v19.905 sweeps).
//
// This test is the SECOND defense layer: it asserts specific compliance
// rules at the data level so a future edit that the regex misses still
// fails the test suite. Locks:
//   - Topic IDs stable (persisted in customer_learning_progress per file
//     header comment — silent rename is a data-loss bug)
//   - 7 topics expected
//   - No bodies contain causation framing tied to predictable effects
//   - No bodies contain condition-name + therapeutic-verb pairings
//   - First-visit topic doesn't model condition-targeted Q&A
//   - Edibles dosing topic uses mechanical mg framing (compliance-safe)

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { LEARN_TOPICS } from "../learn-topics.ts";

describe("LEARN_TOPICS — structural invariants", () => {
  test("exactly 7 topics", () => {
    assert.equal(LEARN_TOPICS.length, 7);
  });

  test("topic IDs are stable + non-empty", () => {
    const expectedIds = [
      "indica-sativa-hybrid",
      "edibles-dosing",
      "thc-percent-cannabinoids",
      "terpenes-101",
      "first-visit",
      "cash-only",
      "wa-law-basics",
    ];
    assert.deepEqual(
      LEARN_TOPICS.map((t) => t.id),
      expectedIds,
      "Topic IDs are persisted in customer_learning_progress — silent rename = data loss bug",
    );
  });

  test("every topic has required fields", () => {
    for (const t of LEARN_TOPICS) {
      assert.ok(t.id, `topic missing id`);
      assert.ok(t.icon, `${t.id} missing icon`);
      assert.ok(t.title, `${t.id} missing title`);
      assert.ok(t.body, `${t.id} missing body`);
      assert.ok(t.body.length > 50, `${t.id} body suspiciously short`);
    }
  });

  test("topic IDs are unique", () => {
    const ids = LEARN_TOPICS.map((t) => t.id);
    assert.equal(new Set(ids).size, ids.length, "duplicate topic id");
  });
});

describe("LEARN_TOPICS — WAC 314-55-155 compliance pins", () => {
  test("no topic body contains causation framing 'tends toward sedating/uplifting/calming/relaxing'", () => {
    const re = /\btends?\s+toward\s+(?:sedating|uplifting|calming|relaxing)/i;
    for (const t of LEARN_TOPICS) {
      assert.ok(!re.test(t.body), `${t.id} body has causation framing`);
    }
  });

  test("no topic body says 'CBD calmer cannabinoid'", () => {
    const re = /\bcalmer[,\s]+(?:non-intoxicating\s+)?cannabinoid/i;
    for (const t of LEARN_TOPICS) {
      assert.ok(!re.test(t.body), `${t.id} body uses pharmacological comparative for CBD`);
    }
  });

  test("no topic body says CBD 'takes the edge off'", () => {
    const re = /\btakes?\s+the\s+edge\s+off/i;
    for (const t of LEARN_TOPICS) {
      assert.ok(!re.test(t.body), `${t.id} body uses symptom-management hedge`);
    }
  });

  test("first-visit topic doesn't model 'what's good for X' condition-targeted Q&A", () => {
    const firstVisit = LEARN_TOPICS.find((t) => t.id === "first-visit");
    assert.ok(firstVisit);
    assert.ok(
      !/what['']?s\s+good\s+for\s+sleep/i.test(firstVisit.body),
      "first-visit body should not teach customers to ask 'what's good for sleep' (condition-targeted)",
    );
  });

  test("terpene-effect attributions use preference framing, not causation", () => {
    const terps = LEARN_TOPICS.find((t) => t.id === "terpenes-101");
    assert.ok(terps);
    // Should NOT have direct causation like "myrcene tends toward sedating"
    assert.ok(
      !/myrcene\s+tends?\s+toward\s+sedating/i.test(terps.body),
      "terpenes-101 should use preference framing for myrcene",
    );
    // Should NOT have "limonene toward uplift" causation
    assert.ok(
      !/limonene\s+toward\s+uplift/i.test(terps.body),
      "terpenes-101 should use preference framing for limonene",
    );
  });
});

describe("LEARN_TOPICS — content shape sanity", () => {
  test("edibles-dosing body includes mg threshold (mechanical dosing, compliance-safe)", () => {
    const edibles = LEARN_TOPICS.find((t) => t.id === "edibles-dosing");
    assert.ok(edibles);
    assert.match(
      edibles.body,
      /\b(2\.5|5)\s*[–-]\s*\d+\s*mg/i,
      "edibles-dosing should specify a start-low mg threshold",
    );
  });

  test("wa-law-basics body includes statutory purchase limits", () => {
    const wa = LEARN_TOPICS.find((t) => t.id === "wa-law-basics");
    assert.ok(wa);
    assert.match(wa.body, /1\s*oz/i, "wa-law-basics should state 1oz flower limit");
    assert.match(wa.body, /21\+/i, "wa-law-basics should state 21+ rule");
  });

  test("cash-only body explains federal-illegality reason", () => {
    const cash = LEARN_TOPICS.find((t) => t.id === "cash-only");
    assert.ok(cash);
    assert.match(
      cash.body,
      /federall?y\s+illegal/i,
      "cash-only should explain federal-illegality as the reason",
    );
  });
});
