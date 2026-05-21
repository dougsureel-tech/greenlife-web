// Tests for `lib/learn-hub.ts` — long-form `/learn/<slug>` hub-topic SoT.
//
// Why pinned: each topic is a customer-facing SEO landing page. Drift
// risks:
//   - Duplicate slug → /learn/<slug> renders the WRONG topic
//   - Orphan relatedTopics → "Related guides" section silently drops a
//     card (lib's filter is defense, but SoT should be clean)
//   - WAC 314-55-155 voice drift → exclamation marks or efficacy
//     promises slip into customer copy
//   - Missing required fields → renderer crashes or empty section
//
// Pin shape integrity + voice invariants + helper contracts.
//
// Run with:  pnpm test:all

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  LEARN_HUB_TOPICS,
  getLearnHubTopic,
  getRelatedLearnHubTopics,
  type LearnHubTopic,
} from "../learn-hub.ts";

// ── LEARN_HUB_TOPICS shape ──────────────────────────────────────────────

describe("LEARN_HUB_TOPICS — array shape", () => {
  test("non-empty (at least 5 topics)", () => {
    assert.ok(LEARN_HUB_TOPICS.length >= 5);
  });

  test("every topic has all required fields populated", () => {
    for (const t of LEARN_HUB_TOPICS) {
      assert.ok(t.slug && typeof t.slug === "string", `missing slug: ${JSON.stringify(t)}`);
      assert.ok(t.eyebrow && typeof t.eyebrow === "string", `${t.slug} missing eyebrow`);
      assert.ok(t.title && typeof t.title === "string", `${t.slug} missing title`);
      assert.ok(t.description && typeof t.description === "string", `${t.slug} missing description`);
      assert.ok(t.body && typeof t.body === "string", `${t.slug} missing body`);
      assert.ok(Array.isArray(t.faqs), `${t.slug} faqs not array`);
      assert.ok(Array.isArray(t.relatedTopics), `${t.slug} relatedTopics not array`);
    }
  });
});

// ── Slug uniqueness ─────────────────────────────────────────────────────

describe("LEARN_HUB_TOPICS — slug uniqueness", () => {
  test("no duplicate slugs (route collision prevention)", () => {
    const slugs = LEARN_HUB_TOPICS.map((t) => t.slug);
    const unique = new Set(slugs);
    assert.equal(slugs.length, unique.size, `duplicate slugs found`);
  });

  test("slugs are URL-safe (lowercase, hyphenated, no special chars)", () => {
    for (const t of LEARN_HUB_TOPICS) {
      assert.match(t.slug, /^[a-z0-9-]+$/, `slug "${t.slug}" not URL-safe`);
      assert.ok(!t.slug.startsWith("-"), `slug "${t.slug}" leading dash`);
      assert.ok(!t.slug.endsWith("-"), `slug "${t.slug}" trailing dash`);
    }
  });
});

// ── Related-topic referential integrity ─────────────────────────────────

describe("LEARN_HUB_TOPICS — relatedTopics referential integrity", () => {
  test("every relatedTopics slug resolves to an actual topic (no orphans)", () => {
    const knownSlugs = new Set(LEARN_HUB_TOPICS.map((t) => t.slug));
    for (const t of LEARN_HUB_TOPICS) {
      for (const rel of t.relatedTopics) {
        assert.ok(
          knownSlugs.has(rel),
          `${t.slug} references unknown related slug "${rel}"`,
        );
      }
    }
  });

  test("no topic lists itself as a relatedTopic", () => {
    for (const t of LEARN_HUB_TOPICS) {
      assert.ok(
        !t.relatedTopics.includes(t.slug),
        `${t.slug} lists itself in relatedTopics`,
      );
    }
  });
});

// ── WAC 314-55-155 voice invariants ─────────────────────────────────────

describe("LEARN_HUB_TOPICS — WAC voice invariants", () => {
  test("no exclamation marks in title or description (compliance lane)", () => {
    for (const t of LEARN_HUB_TOPICS) {
      assert.ok(!t.title.includes("!"), `${t.slug} title has exclamation: "${t.title}"`);
      assert.ok(
        !t.description.includes("!"),
        `${t.slug} description has exclamation`,
      );
    }
  });

  test("no exclamation marks in faq questions or answers", () => {
    for (const t of LEARN_HUB_TOPICS) {
      for (const faq of t.faqs) {
        assert.ok(!faq.q.includes("!"), `${t.slug} faq Q has exclamation`);
        assert.ok(!faq.a.includes("!"), `${t.slug} faq A has exclamation`);
      }
    }
  });

  test("uses Unicode apostrophe (U+2019), not ASCII single-quote, in title", () => {
    // Voice rule: typographic apostrophes only. ASCII ' allowed in URLs
    // or technical strings; for prose fields, expect Unicode apostrophe.
    for (const t of LEARN_HUB_TOPICS) {
      // Title may not always have an apostrophe; only assert when it does.
      if (t.title.match(/['']/)) {
        const hasAscii = /'(?=[a-z]|s)/i.test(t.title);
        assert.ok(
          !hasAscii,
          `${t.slug} title uses ASCII apostrophe instead of U+2019: "${t.title}"`,
        );
      }
    }
  });
});

// ── Body + FAQ content discipline ───────────────────────────────────────

describe("LEARN_HUB_TOPICS — body + faqs content", () => {
  test("every topic has at least 3 FAQs (FAQPage JSON-LD floor)", () => {
    for (const t of LEARN_HUB_TOPICS) {
      assert.ok(t.faqs.length >= 3, `${t.slug} has only ${t.faqs.length} faqs`);
    }
  });

  test("every faq has non-empty q and a", () => {
    for (const t of LEARN_HUB_TOPICS) {
      for (const faq of t.faqs) {
        assert.ok(faq.q && faq.q.length > 5, `${t.slug} empty faq.q`);
        assert.ok(faq.a && faq.a.length > 10, `${t.slug} empty faq.a`);
      }
    }
  });

  test("body has at least one markdown H2 section (## ...)", () => {
    for (const t of LEARN_HUB_TOPICS) {
      assert.match(t.body, /^## /m, `${t.slug} body missing H2 section`);
    }
  });

  test("body is substantive (>500 chars — SEO landing page floor)", () => {
    for (const t of LEARN_HUB_TOPICS) {
      assert.ok(
        t.body.length > 500,
        `${t.slug} body only ${t.body.length} chars`,
      );
    }
  });
});

// ── SERP description length ─────────────────────────────────────────────

describe("LEARN_HUB_TOPICS — SERP description length", () => {
  test("description fits in 100-200 char range (SERP truncation guard)", () => {
    for (const t of LEARN_HUB_TOPICS) {
      assert.ok(
        t.description.length >= 100 && t.description.length <= 200,
        `${t.slug} description ${t.description.length} chars (want 100-200)`,
      );
    }
  });
});

// ── getLearnHubTopic helper ─────────────────────────────────────────────

describe("getLearnHubTopic — slug lookup", () => {
  test("returns the topic for a known slug", () => {
    const first = LEARN_HUB_TOPICS[0]!;
    const out = getLearnHubTopic(first.slug);
    assert.equal(out, first);
  });

  test("returns undefined for unknown slug", () => {
    assert.equal(getLearnHubTopic("nonexistent-zzz-topic"), undefined);
  });

  test("returns undefined for empty string", () => {
    assert.equal(getLearnHubTopic(""), undefined);
  });

  test("case-sensitive — uppercase slug returns undefined", () => {
    const first = LEARN_HUB_TOPICS[0]!;
    assert.equal(getLearnHubTopic(first.slug.toUpperCase()), undefined);
  });
});

// ── getRelatedLearnHubTopics helper ─────────────────────────────────────

describe("getRelatedLearnHubTopics", () => {
  test("returns resolved topic rows in order", () => {
    const topic = LEARN_HUB_TOPICS.find((t) => t.relatedTopics.length > 0);
    assert.ok(topic, "no topic with relatedTopics found for test");
    const out = getRelatedLearnHubTopics(topic);
    assert.ok(out.length > 0);
    assert.equal(out[0]!.slug, topic.relatedTopics[0]);
  });

  test("caps at 3 cards (designed visual layout)", () => {
    // Synthesize a topic with 10 related slugs (all valid)
    const realSlugs = LEARN_HUB_TOPICS.slice(0, Math.min(10, LEARN_HUB_TOPICS.length)).map((t) => t.slug);
    const synth: LearnHubTopic = {
      slug: "_test_",
      eyebrow: "x",
      title: "x",
      description: "x",
      body: "x",
      faqs: [],
      relatedTopics: realSlugs,
    };
    const out = getRelatedLearnHubTopics(synth);
    assert.ok(out.length <= 3, `expected <=3, got ${out.length}`);
  });

  test("silently filters unknown slugs (no crash on SoT typo)", () => {
    const synth: LearnHubTopic = {
      slug: "_test_",
      eyebrow: "x",
      title: "x",
      description: "x",
      body: "x",
      faqs: [],
      relatedTopics: ["nonexistent-1", "nonexistent-2", LEARN_HUB_TOPICS[0]!.slug],
    };
    const out = getRelatedLearnHubTopics(synth);
    assert.equal(out.length, 1);
    assert.equal(out[0]!.slug, LEARN_HUB_TOPICS[0]!.slug);
  });

  test("empty relatedTopics returns empty array", () => {
    const synth: LearnHubTopic = {
      slug: "_test_",
      eyebrow: "x",
      title: "x",
      description: "x",
      body: "x",
      faqs: [],
      relatedTopics: [],
    };
    const out = getRelatedLearnHubTopics(synth);
    assert.deepEqual(out, []);
  });
});
