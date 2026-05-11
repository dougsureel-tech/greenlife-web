// Tests for `lib/json-ld-safe.ts` — security primitive that escapes `<`
// to `<` before embedding JSON-LD into `<script type="application/ld+json">`
// via dangerouslySetInnerHTML.
//
// Why pinned: the helper IS the XSS defense. A regression that drops the
// escape on customer-edited / admin-edited / DB-sourced strings inside
// structured data would let `</script><script>payload</script>` break
// out of the script tag and inject HTML. Single line of code; the test
// pin is the only thing keeping the invariant honest if some refactor
// reaches for a "simpler" JSON.stringify here.
//
// Run with:  pnpm test:all

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { safeJsonLd } from "../json-ld-safe.ts";

describe("safeJsonLd — closing-script-tag escape", () => {
  test("escapes literal '</script>' to '\\u003c/script>'", () => {
    const out = safeJsonLd({ description: "</script><img src=x>" });
    assert.ok(!out.includes("</script>"), `output must not contain literal </script>: ${out}`);
    assert.ok(out.includes("\\u003c/script>"), `expected escaped form: ${out}`);
  });

  test("escapes ALL '<' characters, not just script-tag ones", () => {
    const out = safeJsonLd({ note: "1 < 2 < 3 <foo>" });
    // Every literal '<' should be escaped — none should survive raw.
    assert.equal(out.indexOf("<"), -1, `no raw '<' should remain: ${out}`);
    // Should have 3 escape sequences for the 3 input '<' chars.
    const matches = out.match(/\\u003c/g) ?? [];
    assert.equal(matches.length, 3);
  });

  test("preserves valid JSON shape — output round-trips through JSON.parse", () => {
    const input = { name: "Foo", desc: "1 < 2", nested: { tag: "<script>" } };
    const out = safeJsonLd(input);
    // JSON parser decodes < back to '<' so semantic data round-trips.
    const round = JSON.parse(out);
    assert.deepEqual(round, input);
  });

  test("escapes inside nested arrays + objects", () => {
    const out = safeJsonLd({ list: ["a < b", { x: "</script>" }] });
    assert.equal(out.indexOf("<"), -1);
  });

  test("idempotent on already-clean input", () => {
    const out = safeJsonLd({ hello: "world" });
    assert.equal(out, JSON.stringify({ hello: "world" }));
  });

  test("doesn't escape '>' (only '<' is the script-tag-breakout vector)", () => {
    const out = safeJsonLd({ x: "1 > 0" });
    assert.ok(out.includes(">"), "'>' is safe and should not be escaped");
  });

  test("handles undefined/null/empty inputs gracefully", () => {
    assert.equal(safeJsonLd(null), "null");
    assert.equal(safeJsonLd({}), "{}");
    assert.equal(safeJsonLd([]), "[]");
  });

  test("Google + AI parsers see identical data despite the escape", () => {
    // Real-world: schema.org Article with admin-edited title containing '<'.
    const article = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Why X < Y in WA cannabis",
    };
    const out = safeJsonLd(article);
    const parsed = JSON.parse(out);
    assert.equal(parsed.headline, "Why X < Y in WA cannabis");
    assert.equal(parsed["@type"], "Article");
  });
});
