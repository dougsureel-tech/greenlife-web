// Tests for POSTS blog data + helpers (sister of scc lib/__tests__/posts.test.ts).
//
// Glw has 6 posts vs scc's 13 — different stores, different long-form
// content. Same compliance pins apply: WAC 314-55-155 causation framing
// blocked + Doug 2026-05-02 brand-voice rules + structural sanity.

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { POSTS, getPost, getPosts } from "../posts.ts";

describe("POSTS — structural invariants", () => {
  test("has at least one post", () => {
    assert.ok(POSTS.length > 0);
  });

  test("every post has all required fields", () => {
    const validCategories = new Set(["Guide", "Vendor Spotlight", "Education", "Local"]);
    for (const p of POSTS) {
      assert.ok(p.slug, `post missing slug`);
      assert.ok(p.title, `${p.slug} missing title`);
      assert.ok(p.description, `${p.slug} missing description`);
      assert.ok(
        validCategories.has(p.category),
        `${p.slug} invalid category "${p.category}"`,
      );
      assert.ok(p.publishedAt, `${p.slug} missing publishedAt`);
      assert.equal(typeof p.readingMinutes, "number");
      assert.ok(p.readingMinutes > 0);
      assert.ok(p.body, `${p.slug} missing body`);
      assert.ok(p.body.length > 500, `${p.slug} body too short`);
    }
  });

  test("slugs are unique", () => {
    const slugs = POSTS.map((p) => p.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  test("slugs are URL-safe (lowercase + kebab-case)", () => {
    const re = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    for (const p of POSTS) {
      assert.match(p.slug, re, `${p.slug} not URL-safe`);
    }
  });

  test("publishedAt is YYYY-MM-DD format", () => {
    const re = /^\d{4}-\d{2}-\d{2}$/;
    for (const p of POSTS) {
      assert.match(p.publishedAt, re, `${p.slug} publishedAt not YYYY-MM-DD`);
    }
  });

  test("description under 250 chars (SERP fit)", () => {
    for (const p of POSTS) {
      assert.ok(p.description.length <= 250, `${p.slug} description over 250 chars`);
    }
  });
});

describe("POSTS — WSLCB compliance pins", () => {
  test("no body contains causation framing", () => {
    const re = /\btends?\s+toward\s+(?:more\s+)?(?:sedating|sedative|uplifting|energizing|calming|relaxing)/i;
    for (const p of POSTS) {
      assert.ok(!re.test(p.body), `${p.slug} body has causation framing`);
    }
  });

  test("no body uses 'takes the edge off'", () => {
    const re = /\btakes?\s+the\s+edge\s+off/i;
    for (const p of POSTS) {
      assert.ok(!re.test(p.body), `${p.slug} uses 'takes the edge off'`);
    }
  });

  test("no body has 'calmer cannabinoid'", () => {
    const re = /\bcalmer[,\s]+(?:non-intoxicating\s+)?cannabinoid/i;
    for (const p of POSTS) {
      assert.ok(!re.test(p.body), `${p.slug} uses pharmacological comparative`);
    }
  });

  test("no body has 'associated with relaxing/energizing'", () => {
    const re = /\bassociated\s+with\s+(?:relaxing|energizing|uplifting|sedating|calming)/i;
    for (const p of POSTS) {
      assert.ok(!re.test(p.body), `${p.slug} uses associative-effect attribution`);
    }
  });

  test("no body has '= traditionally' copula attribution", () => {
    const re = /=\s+traditionally\s+(?:relaxing|energizing|uplifting|sedating|calming)/i;
    for (const p of POSTS) {
      assert.ok(!re.test(p.body), `${p.slug} uses copula-effect attribution`);
    }
  });

  test("no body has 'Senior discount'", () => {
    const re = /\bSenior\s+discount\b/i;
    for (const p of POSTS) {
      assert.ok(!re.test(p.body), `${p.slug} uses 'Senior discount'`);
    }
  });

  test("no body has 'locally owned' framing", () => {
    const re = /\blocally[\s-]owned\b/i;
    for (const p of POSTS) {
      assert.ok(!re.test(p.body), `${p.slug} uses 'locally owned'`);
    }
  });
});

describe("getPost helper", () => {
  test("returns matching post for valid slug", () => {
    const first = POSTS[0];
    assert.ok(first);
    const got = getPost(first.slug);
    assert.ok(got);
    assert.equal(got.slug, first.slug);
  });

  test("returns undefined for unknown slug", () => {
    assert.equal(getPost("not-a-real-post"), undefined);
  });

  test("returns undefined for empty string", () => {
    assert.equal(getPost(""), undefined);
  });
});

describe("getPosts helper", () => {
  test("returns published posts only", () => {
    const got = getPosts();
    assert.ok(got.length > 0);
    assert.ok(got.length <= POSTS.length);
  });

  test("returns posts sorted by publishedAt descending (newest first)", () => {
    const got = getPosts();
    for (let i = 1; i < got.length; i += 1) {
      assert.ok(
        got[i - 1].publishedAt >= got[i].publishedAt,
        `post ${i - 1} should be newer than post ${i}`,
      );
    }
  });
});
