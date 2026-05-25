// Tests for the direct-mailer QR landing page at `/welcome`.
//
// Two categories of pinned behavior:
//   1. `lib/welcome-ref.ts` — pure functions that sanitize the inbound
//      `?ref=` URL param + build downstream CTA URLs that carry both
//      `?ref=` (for the in-app surfaces that read the campaign id) AND
//      `?from=mailer:<slug>` (for the existing attribution cookie
//      pipeline). XSS-defense lives here — if `sanitizeRef` ever
//      accepts a non-allowlisted character, the whole reflected-XSS
//      guard goes with it.
//   2. `app/welcome/page.tsx` — fs-source assertions on the rendered
//      page. The page is a Server Component that renders the W1C copy
//      pack §7 — we can't render TSX from a node:test runner, but we
//      CAN assert the source on disk contains the load-bearing copy +
//      structure (noindex metadata, correct hrefs, no efficacy claims,
//      etc.). Pin-test shape mirrors the fleet's other "check that the
//      ship didn't drift" patterns (revalidate-route-shape, etc.).
//
// Run with:  pnpm test:all

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  sanitizeRef,
  refToAttrSlug,
  withRef,
  DEFAULT_MAILER_REF,
} from "../welcome-ref.ts";
import { SOURCE_KINDS } from "../attribution.ts";

const PAGE_SRC = readFileSync(resolve(import.meta.dirname, "../../app/welcome/page.tsx"), "utf8");

// ── DEFAULT_MAILER_REF ─────────────────────────────────────────────────

describe("DEFAULT_MAILER_REF", () => {
  test("matches the canonical Wenatchee 2026-05 drop", () => {
    // If this ever changes, audit dashboards / future analytics queries
    // first — historical attribution rows reference the literal value.
    assert.equal(DEFAULT_MAILER_REF, "mailer-wen-202605");
  });

  test("passes its own sanitizer (self-consistency)", () => {
    assert.equal(sanitizeRef(DEFAULT_MAILER_REF), DEFAULT_MAILER_REF);
  });
});

// ── sanitizeRef — happy paths ──────────────────────────────────────────

describe("sanitizeRef — accepts clean inputs", () => {
  test("the canonical mailer ref passes through", () => {
    assert.equal(sanitizeRef("mailer-wen-202605"), "mailer-wen-202605");
  });

  test("mixed-case is lowercased", () => {
    assert.equal(sanitizeRef("Mailer-Wen-202605"), "mailer-wen-202605");
  });

  test("leading/trailing whitespace is trimmed", () => {
    assert.equal(sanitizeRef("  mailer-wen-202605 "), "mailer-wen-202605");
  });

  test("underscores allowed", () => {
    assert.equal(sanitizeRef("mailer_wen_202605"), "mailer_wen_202605");
  });

  test("digits-only ref allowed (for future campaign-id schemes)", () => {
    assert.equal(sanitizeRef("202605"), "202605");
  });
});

// ── sanitizeRef — XSS/garbage rejection ────────────────────────────────

describe("sanitizeRef — rejects garbage (XSS defense)", () => {
  test("null returns null", () => {
    assert.equal(sanitizeRef(null), null);
  });

  test("undefined returns null", () => {
    assert.equal(sanitizeRef(undefined), null);
  });

  test("empty string returns null", () => {
    assert.equal(sanitizeRef(""), null);
  });

  test("whitespace-only returns null", () => {
    assert.equal(sanitizeRef("   "), null);
  });

  test("script tag rejected", () => {
    assert.equal(sanitizeRef("<script>alert(1)</script>"), null);
  });

  test("HTML-entity-encoded payload rejected", () => {
    assert.equal(sanitizeRef("&lt;img&gt;"), null);
  });

  test("javascript: scheme rejected", () => {
    assert.equal(sanitizeRef("javascript:alert(1)"), null);
  });

  test("spaces in middle rejected (not in the allowlist)", () => {
    assert.equal(sanitizeRef("mailer wen"), null);
  });

  test("oversized (>48 chars) returns null", () => {
    const big = "a".repeat(60);
    assert.equal(sanitizeRef(big), null);
  });

  test("special chars (slash, dot, equals, ampersand) rejected", () => {
    assert.equal(sanitizeRef("mailer/wen"), null);
    assert.equal(sanitizeRef("mailer.wen"), null);
    assert.equal(sanitizeRef("mailer=wen"), null);
    assert.equal(sanitizeRef("a&b"), null);
  });

  test("quotes rejected (cookie injection guard)", () => {
    assert.equal(sanitizeRef("mailer\"wen"), null);
    assert.equal(sanitizeRef("mailer'wen"), null);
  });
});

// ── refToAttrSlug ──────────────────────────────────────────────────────

describe("refToAttrSlug — translates ref to attribution slug", () => {
  test("strips leading mailer- prefix", () => {
    assert.equal(refToAttrSlug("mailer-wen-202605"), "wen-202605");
  });

  test("leaves non-prefixed refs alone", () => {
    assert.equal(refToAttrSlug("wen-202605"), "wen-202605");
  });

  test("only strips ONE leading prefix (not recursive)", () => {
    assert.equal(refToAttrSlug("mailer-mailer-wen"), "mailer-wen");
  });
});

// ── withRef ────────────────────────────────────────────────────────────

describe("withRef — appends ?ref= to internal hrefs", () => {
  test("adds ?ref= when no query exists", () => {
    assert.equal(withRef("/menu", "mailer-wen-202605"), "/menu?ref=mailer-wen-202605");
  });

  test("uses & separator when href already has a query", () => {
    const out = withRef("/menu?from=mailer%3Awen-202605", "mailer-wen-202605");
    assert.equal(out, "/menu?from=mailer%3Awen-202605&ref=mailer-wen-202605");
  });

  test("URL-encodes the ref value (safety belt)", () => {
    // The sanitizer already restricts chars, but encodeURIComponent is
    // applied defensively — make sure that contract holds.
    const out = withRef("/menu", "wen_202605");
    assert.ok(out.includes("ref=wen_202605"), `expected encoded ref in output: ${out}`);
  });

  test("no-op on absolute URLs (https)", () => {
    const out = withRef("https://maps.google.com/?q=foo", "mailer-wen-202605");
    assert.equal(out, "https://maps.google.com/?q=foo");
  });

  test("no-op on tel: links", () => {
    assert.equal(withRef("tel:+15096639980", "mailer-wen-202605"), "tel:+15096639980");
  });

  test("no-op on mailto: links", () => {
    assert.equal(
      withRef("mailto:hi@greenlifecannabis.com", "mailer-wen-202605"),
      "mailto:hi@greenlifecannabis.com",
    );
  });

  test("returns href unchanged when ref is null", () => {
    assert.equal(withRef("/menu", null), "/menu");
  });

  test("returns empty when href is empty", () => {
    assert.equal(withRef("", "mailer-wen-202605"), "");
  });

  test("does not double-stamp when href already has ?ref=", () => {
    const out = withRef("/menu?ref=existing", "mailer-wen-202605");
    assert.equal(out, "/menu?ref=existing");
  });
});

// ── SOURCE_KINDS includes "mailer" ──────────────────────────────────────

describe("attribution.SOURCE_KINDS — mailer kind registered", () => {
  test("'mailer' is in SOURCE_KINDS", () => {
    // The welcome page emits `?from=mailer:<slug>` on its CTAs; if this
    // kind is ever removed from the allowlist, the proxy middleware
    // will silently DROP the cookie write (validateAttrValue returns
    // null on unknown kinds) → attribution stops working without any
    // error. This pin catches that drift.
    assert.ok(
      (SOURCE_KINDS as readonly string[]).includes("mailer"),
      "SOURCE_KINDS must include 'mailer' for /welcome attribution to work",
    );
  });
});

// ── Page fs-source assertions ──────────────────────────────────────────

describe("app/welcome/page.tsx — load-bearing copy + structure", () => {
  test("declares robots:noindex (mailer URL, not for organic SEO)", () => {
    // Must keep this URL out of search results — it competes with /
    // for brand-anchor queries otherwise.
    assert.ok(
      /robots:\s*\{\s*index:\s*false/.test(PAGE_SRC),
      "page must export metadata.robots.index = false",
    );
    assert.ok(
      /follow:\s*false/.test(PAGE_SRC),
      "page must export metadata.robots.follow = false",
    );
  });

  test("declares canonical = /welcome", () => {
    assert.ok(
      /canonical:\s*["']\/welcome["']/.test(PAGE_SRC),
      "page must declare alternates.canonical = '/welcome'",
    );
  });

  test("hero headline matches W1C §7 copy", () => {
    assert.ok(
      PAGE_SRC.includes("The best cannabis staff in the Wenatchee Valley"),
      "hero headline must match W1C §7 copy verbatim",
    );
  });

  test("subhead names Center Road + 21+ + cash-only", () => {
    assert.ok(PAGE_SRC.includes("Center Road since 2014"), "subhead must name tenure on Center Road");
    assert.ok(PAGE_SRC.includes("21+ with valid ID"), "subhead must declare 21+ ID requirement");
    assert.ok(/cash only/i.test(PAGE_SRC), "subhead must declare cash-only payment");
  });

  test("body paragraph 1 names the mailer + decade tenure", () => {
    assert.ok(
      PAGE_SRC.includes("If you got our card in the mail"),
      "body para 1 must call out the mailer arrival",
    );
    assert.ok(PAGE_SRC.includes("over a decade"), "body para 1 must name decade-plus tenure");
  });

  test("body paragraph 2 names 30% first-visit + tier ladder", () => {
    assert.ok(PAGE_SRC.includes("30% off"), "body para 2 must declare 30% first-visit offer");
    assert.ok(
      PAGE_SRC.includes("Regular") && PAGE_SRC.includes("Local") && PAGE_SRC.includes("Family"),
      "tier ladder must list Regular/Local/Family per brand voice",
    );
    assert.ok(
      /no\s+card\s+to\s+carry/i.test(PAGE_SRC),
      "body para 2 must name 'no card to carry'",
    );
  });

  test("primary CTA links to /menu (per customer-CTAs-point-to-menu rule)", () => {
    // The hard rule per feedback_customer_ctas_point_to_menu_only — every
    // shopping intent CTA points to /menu, not iHeartJane direct.
    assert.ok(
      /withAttr\(\s*["']\/menu["']/.test(PAGE_SRC),
      "primary CTA must call withAttr('/menu', ...)",
    );
    assert.ok(
      PAGE_SRC.includes("See the menu"),
      "primary CTA label must be 'See the menu' per W1C §7",
    );
  });

  test("secondary CTA links to /visit", () => {
    assert.ok(
      /withAttr\(\s*["']\/visit["']/.test(PAGE_SRC),
      "secondary CTA must call withAttr('/visit', ...)",
    );
  });

  test("CTAs forward both ?ref= AND ?from= via withRef + withAttr", () => {
    assert.ok(
      /withRef\(withAttr\(["']\/menu["']/.test(PAGE_SRC),
      "primary CTA must stack withAttr inside withRef so both params reach downstream",
    );
    assert.ok(
      /withRef\(withAttr\(["']\/visit["']/.test(PAGE_SRC),
      "secondary CTA must stack withAttr inside withRef",
    );
  });

  test("CTAs hit the ≥48px tap-target spec (mobile-first)", () => {
    // Tailwind `min-h-[48px]` AND py-3.5 (= 14px+14px+content > 48px),
    // belt-and-suspenders. If both ever disappear, the mobile-tap
    // target spec is broken.
    assert.ok(
      /min-h-\[48px\]/.test(PAGE_SRC),
      "CTAs must declare min-h-[48px] for mobile tap-target spec",
    );
  });

  test("trust strip names 21+ · cash only · ATM · open 7 days", () => {
    assert.ok(
      PAGE_SRC.includes("21+ with valid ID · Cash only · ATM on site · Open 7 days"),
      "trust strip must match W1C §7 copy verbatim",
    );
  });

  test("footer micro-note nudges to mention the postcard", () => {
    assert.ok(
      PAGE_SRC.includes("Got the postcard?"),
      "footer micro-note must include 'Got the postcard?'",
    );
  });

  test("WSLCB compliance: no efficacy claims / medical advice / veteran-owned framing", () => {
    // WAC 314-55-155 — informational, not advertising.
    const lower = PAGE_SRC.toLowerCase();
    const bannedTerms = [
      "cures",
      "cure ",
      "treats",
      "heals",
      "medical advice",
      "veteran-owned",
      "veteran owned",
      "prescription",
    ];
    for (const term of bannedTerms) {
      assert.ok(
        !lower.includes(term),
        `welcome page must not include banned term '${term}' (WAC 314-55-155 / brand voice)`,
      );
    }
  });

  test("uses searchParams (await form, Next 16+ contract)", () => {
    // Next 16 made searchParams a Promise on Server Components. If a
    // future edit drops the await, runtime breaks (Promise rendered as
    // [object Promise]). Pin the async + await shape.
    assert.ok(
      /async function WelcomePage/.test(PAGE_SRC),
      "WelcomePage must be an async server component",
    );
    assert.ok(
      /await\s+searchParams/.test(PAGE_SRC),
      "WelcomePage must await searchParams (Next 16+ contract)",
    );
  });

  test("falls back to DEFAULT_MAILER_REF when ref param is absent/invalid", () => {
    // Direct visits (typed URL from the postcard without scanning the
    // QR) should still attribute correctly. If the fallback ever
    // disappears, those direct visits would lose attribution.
    assert.ok(
      /sanitizeRef\(rawRef\)\s*\?\?\s*DEFAULT_MAILER_REF/.test(PAGE_SRC),
      "page must fall back to DEFAULT_MAILER_REF on missing/invalid ref",
    );
  });

  test("emits LocalBusiness/Store JSON-LD", () => {
    // Rare-but-real case: someone shares the URL. We want any
    // structured-data-aware client to surface hours/address/phone.
    assert.ok(PAGE_SRC.includes("\"@type\": \"Store\""), "page must emit Store schema");
    assert.ok(PAGE_SRC.includes("safeJsonLd"), "page must wrap JSON-LD via safeJsonLd helper");
  });

  test("does NOT import from inv-App / brapp paths (scope-respect)", () => {
    // The mission constraint: welcome page is greenlife-web only. No
    // cross-repo imports — that's a different scope. If a future edit
    // accidentally pulls from `../inventoryapp/` etc., this catches it.
    assert.ok(
      !/inventoryapp|brapp/i.test(PAGE_SRC),
      "welcome page must not reference cross-repo paths",
    );
  });
});
