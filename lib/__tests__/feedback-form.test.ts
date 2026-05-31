// Pin tests for Customer Engagement Layer Ship 4 — public-site `/feedback`
// intake (page + form + footer modal trigger).
//
// fs-source assertion pattern (same as `welcome-page.test.ts`,
// `check-pii-console-leak.test.ts`): the components are React/TSX so a
// node:test runner can't hydrate them, but we CAN assert the source on
// disk contains the load-bearing copy + structure invariants. Drift
// risks if any of these fail:
//   - Brand voice ("Send it over." / "Got it — we'll be in touch…")
//     paraphrased to corporate-stock "Submit" / "Thank you for your
//     feedback" — voice tax compounds, so we pin it.
//   - The 6 enum categories drift apart from the backend schema's
//     CHECK constraint (suggestion · complaint · accessibility ·
//     compliance · compliment · other).
//   - The `store` discriminator gets set to the WRONG value ('sea'
//     instead of 'wen' on the greenlife-web page) — sister-port copy/
//     paste class. The Inv-App row would route to the wrong notify
//     channel; queue would be on the wrong store admin surface.
//   - The Cloudflare Turnstile site-key env-var name drifts from
//     `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (the consumer-side public-vars
//     contract).
//   - The robots noindex tag falls off — a feedback form has no SEO
//     value + we don't want it indexed as a search-result landing.
//   - The honeypot field name drifts away from `website` (any rename
//     should be coordinated with the backend if it ever reads honeypot
//     server-side; today the backend trusts Turnstile + rate-limit so
//     this is purely client-side defense, but the field name is the
//     stable contract).
//
// Run with:  pnpm test:all

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const FORM_SRC = readFileSync(
  resolve(import.meta.dirname, "../../components/FeedbackForm.tsx"),
  "utf8",
);
const PAGE_SRC = readFileSync(
  resolve(import.meta.dirname, "../../app/feedback/page.tsx"),
  "utf8",
);
const MODAL_SRC = readFileSync(
  resolve(import.meta.dirname, "../../components/FeedbackModalTrigger.tsx"),
  "utf8",
);
const FOOTER_SRC = readFileSync(
  resolve(import.meta.dirname, "../../components/SiteFooter.tsx"),
  "utf8",
);

// ── 6-category enum parity with backend schema CHECK constraint ────────

describe("FeedbackForm — 6 categories match backend schema CHECK constraint", () => {
  const REQUIRED_CATEGORIES = [
    "suggestion",
    "complaint",
    "accessibility",
    "compliance",
    "compliment",
    "other",
  ] as const;

  for (const cat of REQUIRED_CATEGORIES) {
    test(`category enum contains '${cat}'`, () => {
      assert.match(
        FORM_SRC,
        new RegExp(`value:\\s*"${cat}"`),
        `${cat} must be in FEEDBACK_CATEGORIES (matches backend CHECK constraint)`,
      );
    });
  }
});

// ── Brand voice — load-bearing customer-facing copy ────────────────────

describe("FeedbackForm — brand voice anchors", () => {
  test("submit button reads 'Send it over.' (not 'Submit')", () => {
    assert.match(FORM_SRC, /Send it over\./);
    assert.doesNotMatch(FORM_SRC, />\s*Submit\s*</);
  });

  test("success card uses 'Got it' confirmation (not 'Thank you')", () => {
    assert.match(FORM_SRC, /Got it\./);
    assert.match(FORM_SRC, /[Ww]e(?:['’]|&apos;|&#39;)ll be in touch if it needs a reply/);
  });

  test("no exclamation marks on submit / success copy (brand voice)", () => {
    // Hunt for any `!` followed by `<` or `"` inside JSX-text contexts.
    // We allow `!` inside code (like `!turnstileToken`), so just check
    // the specific quoted copy strings don't carry one.
    const sloganMatches = FORM_SRC.match(/"[^"]*Send it over[^"]*"/g) ?? [];
    for (const m of sloganMatches) {
      assert.doesNotMatch(m, /!/, `submit copy must not carry !: ${m}`);
    }
  });

  test("no 'Oops' / 'Sorry' in error copy (brand voice)", () => {
    assert.doesNotMatch(FORM_SRC, /\bOops\b/i);
    // 'Sorry' is allowed in justified apologies per brand voice — but
    // we don't ship any here, so pin the absence.
    assert.doesNotMatch(FORM_SRC, /\bSorry\b/);
  });

  test("placeholder copy uses lowercase friendly tone", () => {
    assert.match(FORM_SRC, /Tell us what you're thinking…/);
  });
});

// ── Page-level copy + SEO posture ──────────────────────────────────────

describe("FeedbackPage — headline + SEO", () => {
  test("headline matches the memo § 4 line", () => {
    assert.match(PAGE_SRC, /Tell us how we(?:['’]|&apos;|&#39;)re doing\./);
  });

  test("subhead carries the 'we read every one' anchor", () => {
    assert.match(PAGE_SRC, /We read every one/);
  });

  test("footer note explains compliance/ADA routing", () => {
    assert.match(PAGE_SRC, /Compliance and accessibility submissions get an immediate response/);
  });

  test("noindex,nofollow set (no SEO value, write-surface)", () => {
    assert.match(PAGE_SRC, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/);
  });

  test("page pins store='wen' (NOT 'sea' — sister-port miss class)", () => {
    assert.match(PAGE_SRC, /store="wen"/);
    assert.doesNotMatch(PAGE_SRC, /store="sea"/);
  });

  test("page pins inv-App base to brapp.greenlifecannabis.com (NOT the SCC base)", () => {
    assert.match(PAGE_SRC, /brapp\.greenlifecannabis\.com/);
    assert.doesNotMatch(PAGE_SRC, /brapp\.seattlecannabis\.co/);
  });
});

// ── Cloudflare Turnstile env-var contract ──────────────────────────────

describe("FeedbackForm — Turnstile env-var contract", () => {
  test("reads NEXT_PUBLIC_TURNSTILE_SITE_KEY (matches Vercel-var name)", () => {
    assert.match(FORM_SRC, /NEXT_PUBLIC_TURNSTILE_SITE_KEY/);
  });

  test("renders amber fail-closed placeholder when site key missing", () => {
    assert.match(
      FORM_SRC,
      /Spam protection pending setup — submissions disabled until configured/,
    );
  });

  test("loads turnstile script from the canonical Cloudflare URL", () => {
    assert.match(
      FORM_SRC,
      /https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js/,
    );
  });
});

// ── Honeypot field — name stability + a11y posture ─────────────────────

describe("FeedbackForm — honeypot field", () => {
  test("honeypot named 'website' (stable name)", () => {
    assert.match(FORM_SRC, /name="website"/);
  });

  test("honeypot wrapped in aria-hidden + tabindex=-1", () => {
    // The wrapper div has aria-hidden="true"; input has tabIndex={-1}.
    assert.match(FORM_SRC, /aria-hidden="true"/);
    assert.match(FORM_SRC, /tabIndex=\{-1\}/);
  });
});

// ── Body length contract (matches backend validateBody) ────────────────

describe("FeedbackForm — body 20..2000 char gate", () => {
  test("BODY_MIN = 20 (matches packages/lib customer-feedback)", () => {
    assert.match(FORM_SRC, /BODY_MIN\s*=\s*20\b/);
  });
  test("BODY_MAX = 2000 (matches packages/lib customer-feedback)", () => {
    assert.match(FORM_SRC, /BODY_MAX\s*=\s*2000\b/);
  });
});

// ── Accessibility posture ──────────────────────────────────────────────

describe("FeedbackForm + page + modal — accessibility", () => {
  test("required textarea carries aria-required", () => {
    assert.match(FORM_SRC, /aria-required="true"/);
  });

  test("error region carries role='alert' + aria-live", () => {
    assert.match(FORM_SRC, /role="alert"/);
    assert.match(FORM_SRC, /aria-live="polite"/);
  });

  test("modal carries role='dialog' + aria-modal", () => {
    assert.match(MODAL_SRC, /role="dialog"/);
    assert.match(MODAL_SRC, /aria-modal="true"/);
  });

  test("modal carries aria-labelledby pointing at the title", () => {
    assert.match(MODAL_SRC, /aria-labelledby="feedback-modal-title"/);
    assert.match(MODAL_SRC, /id="feedback-modal-title"/);
  });

  test("min-h-44 set on tap-target controls (Apple HIG 44pt)", () => {
    assert.match(FORM_SRC, /min-h-\[44px\]/);
  });
});

// ── Footer wiring — trigger lives in the secondary-links row ──────────

describe("SiteFooter — feedback modal trigger wiring", () => {
  test("imports FeedbackModalTrigger", () => {
    assert.match(FOOTER_SRC, /FeedbackModalTrigger/);
  });

  test("passes store='wen' to the trigger (NOT 'sea')", () => {
    // Locate the FeedbackModalTrigger JSX block + check its store prop.
    const trigBlock = FOOTER_SRC.match(/<FeedbackModalTrigger[\s\S]*?\/>/);
    assert.ok(trigBlock, "FeedbackModalTrigger JSX missing from footer");
    assert.match(trigBlock[0], /store="wen"/);
    assert.doesNotMatch(trigBlock[0], /store="sea"/);
  });

  test("trigger label uses brand-voice phrase", () => {
    assert.match(FOOTER_SRC, /Tell us how we're doing/);
  });

  test("inv-App base is the wen brapp host (NOT the SCC host)", () => {
    assert.match(FOOTER_SRC, /brapp\.greenlifecannabis\.com/);
    assert.doesNotMatch(FOOTER_SRC, /brapp\.seattlecannabis\.co/);
  });
});

// ── Backend contract — POST shape ──────────────────────────────────────

describe("FeedbackForm — POST body shape matches backend route", () => {
  test("POSTs to /api/public/customer-feedback (NOT a different path)", () => {
    assert.match(FORM_SRC, /\/api\/public\/customer-feedback/);
  });

  test("body carries the 7 contract fields", () => {
    for (const field of [
      "category",
      "body:",
      "contactName",
      "contactEmail",
      "contactPhone",
      "store",
      "pagePath",
      "turnstileToken",
    ]) {
      assert.match(
        FORM_SRC,
        new RegExp(field),
        `POST body must carry ${field}`,
      );
    }
  });
});
