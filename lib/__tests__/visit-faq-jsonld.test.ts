// Pin tests for the FAQPage JSON-LD builder shipped under
// SEO_AUDIT_AUTONOMOUS_WINS_2026_05_26 Tech-SEO #5 Part A. Used by both
// /visit and /contact to emit FAQ rich-result-eligible structured data.
//
// What's pinned:
//   - FAQPage shape: @context + @type + @id + mainEntity array
//   - Each entry: @type=Question, name, acceptedAnswer={@type=Answer,text}
//   - WSLCB regression: banned-phrase entries dropped (fail-safe)
//   - Empty input: well-formed FAQPage with empty mainEntity
//   - safeJsonLd compatibility (no </script> sequence after serialize)
//   - /visit + /contact source files include the FAQ JSON-LD inject
//
// Run:
//   pnpm exec tsx --test lib/__tests__/visit-faq-jsonld.test.ts

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildVisitFaqJsonLd,
  filterWslcbCompliantFaqs,
  type FaqEntry,
} from "../visit-faq-jsonld.ts";
import { safeJsonLd } from "../json-ld-safe.ts";
import { STORE } from "../store.ts";

const CLEAN_FAQS: readonly FaqEntry[] = [
  { question: "What are your hours?", answer: "8 AM to 9 PM daily." },
  { question: "Do you take cards?", answer: "Cash only. ATM in-lobby." },
];

describe("buildVisitFaqJsonLd — Schema.org FAQPage shape", () => {
  const ld = buildVisitFaqJsonLd("/visit", CLEAN_FAQS);

  test("has @context + @type + @id", () => {
    assert.equal(ld["@context"], "https://schema.org");
    assert.equal(ld["@type"], "FAQPage");
    assert.equal(ld["@id"], `${STORE.website}/visit#faq`);
  });

  test("mainEntity is an array", () => {
    assert.ok(Array.isArray(ld.mainEntity));
  });

  test("mainEntity length matches WSLCB-compliant entries", () => {
    const items = ld.mainEntity as Array<Record<string, unknown>>;
    assert.equal(items.length, CLEAN_FAQS.length);
  });
});

describe("Question + Answer shape per entry", () => {
  const ld = buildVisitFaqJsonLd("/visit", CLEAN_FAQS);
  const items = ld.mainEntity as Array<Record<string, unknown>>;

  test("each entry @type=Question with name", () => {
    for (const item of items) {
      assert.equal(item["@type"], "Question");
      assert.equal(typeof item.name, "string");
      assert.ok((item.name as string).length > 0);
    }
  });

  test("acceptedAnswer is @type=Answer with text", () => {
    for (const item of items) {
      const ans = item.acceptedAnswer as Record<string, unknown>;
      assert.equal(ans["@type"], "Answer");
      assert.equal(typeof ans.text, "string");
      assert.ok((ans.text as string).length > 0);
    }
  });

  test("question + answer text round-trip from input", () => {
    assert.equal(items[0].name, "What are your hours?");
    const ans0 = items[0].acceptedAnswer as Record<string, unknown>;
    assert.equal(ans0.text, "8 AM to 9 PM daily.");
  });
});

describe("WSLCB regression — banned-phrase entries dropped", () => {
  test("question with 'treats' is dropped", () => {
    const out = filterWslcbCompliantFaqs([
      { question: "Does this treat anxiety?", answer: "Bring valid ID." },
      { question: "What are your hours?", answer: "8 AM to 9 PM." },
    ]);
    assert.equal(out.length, 1);
    assert.equal(out[0].question, "What are your hours?");
  });

  test("answer with 'cure' is dropped", () => {
    const out = filterWslcbCompliantFaqs([
      { question: "Why visit?", answer: "Our flower cures insomnia." },
      { question: "What's the address?", answer: STORE.address.full },
    ]);
    assert.equal(out.length, 1);
    assert.equal(out[0].question, "What's the address?");
  });

  test("answer with 'medicine' is dropped", () => {
    const out = filterWslcbCompliantFaqs([
      { question: "Q1", answer: "This is medicine." },
      { question: "Q2", answer: "Open daily." },
    ]);
    assert.equal(out.length, 1);
  });

  test("'helps with sleep' is dropped (combined phrase)", () => {
    const out = filterWslcbCompliantFaqs([
      { question: "Q1", answer: "This helps with sleep." },
    ]);
    assert.equal(out.length, 0);
  });

  test("preference framing (NOT efficacy) is allowed", () => {
    const out = filterWslcbCompliantFaqs([
      { question: "What flower do regulars pick?", answer: "Eighths are the most popular size at the counter." },
    ]);
    assert.equal(out.length, 1);
  });

  test("clean factual hours/parking/ID copy passes through", () => {
    const out = filterWslcbCompliantFaqs(CLEAN_FAQS);
    assert.equal(out.length, CLEAN_FAQS.length);
  });
});

describe("buildVisitFaqJsonLd — empty + edge inputs", () => {
  test("empty input → FAQPage with empty mainEntity", () => {
    const ld = buildVisitFaqJsonLd("/visit", []);
    const items = ld.mainEntity as unknown[];
    assert.equal(items.length, 0);
    assert.equal(ld["@type"], "FAQPage");
  });

  test("all-banned input → FAQPage with empty mainEntity", () => {
    const ld = buildVisitFaqJsonLd("/visit", [
      { question: "Does it cure cancer?", answer: "It heals everything." },
    ]);
    const items = ld.mainEntity as unknown[];
    assert.equal(items.length, 0);
  });

  test("page-path absolutized: relative /contact resolves to STORE.website-anchored @id", () => {
    const ld = buildVisitFaqJsonLd("/contact", CLEAN_FAQS);
    assert.equal(ld["@id"], `${STORE.website}/contact#faq`);
  });

  test("page-path absolutized: bare path (no leading slash) is normalized", () => {
    const ld = buildVisitFaqJsonLd("contact", CLEAN_FAQS);
    assert.equal(ld["@id"], `${STORE.website}/contact#faq`);
  });

  test("absolute URL pagePath is preserved as-is in @id", () => {
    const ld = buildVisitFaqJsonLd(`${STORE.website}/contact`, CLEAN_FAQS);
    assert.equal(ld["@id"], `${STORE.website}/contact#faq`);
  });
});

describe("safeJsonLd integration — output never breaks <script>", () => {
  test("serialized FAQPage has no literal </script>", () => {
    const ld = buildVisitFaqJsonLd("/visit", [
      { question: "Q with </script>?", answer: "A with </script>." },
    ]);
    const out = safeJsonLd(ld);
    assert.ok(
      !out.includes("</script>"),
      `safeJsonLd output should NOT contain </script>: ${out.slice(0, 200)}`,
    );
  });

  test("normal payload round-trips through JSON.parse(safeJsonLd(...))", () => {
    const ld = buildVisitFaqJsonLd("/visit", CLEAN_FAQS);
    const out = safeJsonLd(ld);
    // safeJsonLd escapes `<` so we need to first decode for JSON.parse
    const decoded = out.replace(/\\u003c/g, "<");
    const parsed = JSON.parse(decoded);
    assert.equal(parsed["@type"], "FAQPage");
  });
});

// ---- Source-file regression pins ----
// These pins confirm the new FAQ JSON-LD <script> tags actually ship on
// the rendered pages. Static fs read so the pins survive without a Next
// build context.

describe("Source-file integration pins", () => {
  test("/visit/page.tsx renders the visitFaqSchema script tag", () => {
    const src = readFileSync(
      join(process.cwd(), "app/visit/page.tsx"),
      "utf8",
    );
    assert.ok(
      src.includes("visitFaqSchema"),
      "/visit/page.tsx should define + render visitFaqSchema",
    );
    assert.ok(
      src.includes("buildVisitFaqJsonLd"),
      "/visit/page.tsx should import buildVisitFaqJsonLd",
    );
  });

  test("/contact/page.tsx renders the contactFaqSchema script tag", () => {
    const src = readFileSync(
      join(process.cwd(), "app/contact/page.tsx"),
      "utf8",
    );
    assert.ok(
      src.includes("contactFaqSchema"),
      "/contact/page.tsx should define + render contactFaqSchema",
    );
    assert.ok(
      src.includes("buildVisitFaqJsonLd"),
      "/contact/page.tsx should import buildVisitFaqJsonLd",
    );
  });
});
