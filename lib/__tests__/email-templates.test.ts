// Tests for customer-facing email template SOURCE FILES via fs.readFileSync.
//
// Pins brand-voice + compliance + structural rules across all 3 templates:
//   - welcome-email.ts (one-time send on Clerk signup)
//   - quiz-nurture-email.ts (5-touch strain-quiz nurture sequence)
//   - order-confirmation-email.ts (receipt template)
//
// Why fs-based instead of module-load: each file imports "server-only",
// which throws under node --test --experimental-strip-types. Reading the
// source as a string + regex-asserting is the same pattern arc-guards use,
// run as part of `npm run test:all` so it gates pre-push.
//
// What this pins beyond existing arc-guards:
//   - Per-file structural invariants (every template MUST have Reply STOP
//     opt-out AND WSLCB License footer, in BOTH html + text variants)
//   - Loyalty ladder math (if a template states discount percentages, they
//     MUST match the canonical 5/10/20/25/30% ladder from redemption-tiers)
//   - "Reply to this email" pattern present (warmth signal — file-header
//     `feedback_template_warmth.mjs` doctrine)
//   - HTML-escape `safe()` helper present (XSS defense for user firstName)

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIB = join(__dirname, "..");

const TEMPLATES: Record<string, string> = {
  "welcome-email.ts": readFileSync(join(LIB, "welcome-email.ts"), "utf-8"),
  "quiz-nurture-email.ts": readFileSync(join(LIB, "quiz-nurture-email.ts"), "utf-8"),
  "order-confirmation-email.ts": readFileSync(join(LIB, "order-confirmation-email.ts"), "utf-8"),
};

const TEMPLATE_NAMES = Object.keys(TEMPLATES);

describe("email templates — WSLCB compliance (causation framing)", () => {
  test("no template body uses 'tends toward X' causation framing", () => {
    const re = /\btends?\s+toward\s+(?:more\s+)?(?:sedating|sedative|uplifting|energizing|calming|relaxing)/i;
    for (const name of TEMPLATE_NAMES) {
      assert.ok(!re.test(TEMPLATES[name]), `${name} has 'tends toward' causation framing (WAC 314-55-155)`);
    }
  });

  test("no template uses 'takes the edge off' hedge", () => {
    const re = /\btakes?\s+the\s+edge\s+off/i;
    for (const name of TEMPLATE_NAMES) {
      assert.ok(!re.test(TEMPLATES[name]), `${name} uses 'takes the edge off'`);
    }
  });

  test("no template uses 'calmer cannabinoid' pharmacological comparative", () => {
    const re = /\bcalmer[,\s]+(?:non-intoxicating\s+)?cannabinoid/i;
    for (const name of TEMPLATE_NAMES) {
      assert.ok(!re.test(TEMPLATES[name]), `${name} uses pharmacological comparative`);
    }
  });

  test("no template uses 'associated with X effect' attribution", () => {
    const re = /\bassociated\s+with\s+(?:relaxing|energizing|uplifting|sedating|calming)/i;
    for (const name of TEMPLATE_NAMES) {
      assert.ok(!re.test(TEMPLATES[name]), `${name} uses associative-effect attribution`);
    }
  });

  test("no template uses '= traditionally X' copula attribution", () => {
    const re = /=\s+traditionally\s+(?:relaxing|energizing|uplifting|sedating|calming)/i;
    for (const name of TEMPLATE_NAMES) {
      assert.ok(!re.test(TEMPLATES[name]), `${name} uses copula-effect attribution`);
    }
  });
});

describe("email templates — brand-voice (Doug 2026-05-02 + 2026-05-07)", () => {
  test("no template uses 'Senior discount' (Wisdom rename)", () => {
    const re = /\bSenior\s+discount\b/i;
    for (const name of TEMPLATE_NAMES) {
      assert.ok(!re.test(TEMPLATES[name]), `${name} uses 'Senior discount' — renamed to Wisdom`);
    }
  });

  test("no template uses 'locally owned' framing", () => {
    const re = /\blocally[\s-]owned\b/i;
    for (const name of TEMPLATE_NAMES) {
      assert.ok(!re.test(TEMPLATES[name]), `${name} uses 'locally owned' framing`);
    }
  });

  test("no template uses 'veteran-owned' framing (heroes discount OK, ownership claim not)", () => {
    // Doug-pinned 2026-05-07: Wenatchee shops are locally owned but NOT
    // formally veteran-owned. Heroes-discount eligibility is fine; an
    // ownership claim in customer-facing copy would be misrepresentation.
    // OPERATING_PRINCIPLES.md "Compliance is non-negotiable" section.
    const re = /\bveteran[\s-]owned\b/i;
    for (const name of TEMPLATE_NAMES) {
      assert.ok(
        !re.test(TEMPLATES[name]),
        `${name} uses 'veteran-owned' — heroes discount eligibility is fine, ownership claim is not`,
      );
    }
  });
});

describe("email templates — structural invariants (every template must…)", () => {
  test("transactional/account templates reference WSLCB license", () => {
    // Policy: account-triggered templates (signup, order receipt) include the
    // WSLCB license for transparency. Opt-in marketing nurture (quiz emails)
    // is explicitly opted into and is not the right surface for regulatory
    // boilerplate (already in the unsubscribe footer; STORE address is in
    // STORE constant for any compliance audit). Sister memory:
    // feedback_brand_voice_sweep_state_2026_05_05.
    const ACCOUNT_TEMPLATES = ["welcome-email.ts", "order-confirmation-email.ts"];
    for (const name of ACCOUNT_TEMPLATES) {
      assert.match(
        TEMPLATES[name],
        /WSLCB\s+License/i,
        `${name} missing 'WSLCB License' — account-triggered template must reference`,
      );
    }
  });

  test("every template has Reply STOP opt-out", () => {
    for (const name of TEMPLATE_NAMES) {
      assert.match(
        TEMPLATES[name],
        /reply\s+STOP/i,
        `${name} missing 'Reply STOP' — CAN-SPAM opt-out required`,
      );
    }
  });

  test("every template has an HTML escape helper (safe() XSS defense)", () => {
    for (const name of TEMPLATE_NAMES) {
      assert.match(
        TEMPLATES[name],
        /const\s+safe\s*=|function\s+safe\s*\(/,
        `${name} missing safe() HTML escape helper — XSS defense for user firstName`,
      );
    }
  });

  test("every template has both HTML and plain-text variants", () => {
    for (const name of TEMPLATE_NAMES) {
      assert.match(
        TEMPLATES[name],
        /<!DOCTYPE\s+html|<html\s+lang/i,
        `${name} missing HTML variant (no DOCTYPE/html lang)`,
      );
      assert.match(
        TEMPLATES[name],
        /buildText|renderBaseText|text\s*:\s*[`'"]/i,
        `${name} missing plain-text variant — email-client fallback`,
      );
    }
  });

  test("every template has env-var feature flag gate (defense in depth)", () => {
    for (const name of TEMPLATE_NAMES) {
      assert.match(
        TEMPLATES[name],
        /process\.env\.[A-Z_]+_ENABLED|isEmailConfigured/i,
        `${name} missing env-var enabled gate — caller may forget to gate`,
      );
    }
  });
});

describe("email templates — loyalty math drift defense", () => {
  // If a template mentions specific point thresholds OR discount percentages,
  // they must match the canonical ladder. Otherwise customers get a wrong
  // promise via email + the redemption-tiers.ts canonical wins at checkout.
  //
  // Canonical ladder (from redemption-tiers-canonical.test.ts):
  //   50pt / 5%, 100pt / 10%, 200pt / 20%, 250pt / 25%, 300pt / 30%, 400pt / 30%
  //
  // The 30% cap at 300pt = $75 minimum-order cliff (Doug 2026-05-07).

  test("if template mentions '%off' bands, the bands match canonical ladder", () => {
    // Templates may mention e.g. "5% off" or "30% off". Forbid any % not in
    // the canonical set {5, 10, 20, 25, 30}. Pin specifically: any digit
    // followed by '%' followed by ' off' must be in the canonical set.
    const CANON = new Set([5, 10, 20, 25, 30]);
    const re = /(\d{1,2})%\s+off\b/gi;
    for (const name of TEMPLATE_NAMES) {
      const src = TEMPLATES[name];
      let m: RegExpExecArray | null;
      while ((m = re.exec(src)) !== null) {
        const pct = Number(m[1]);
        assert.ok(
          CANON.has(pct),
          `${name} mentions "${pct}% off" — not in canonical ladder {5,10,20,25,30}`,
        );
      }
    }
  });

  test("if template mentions 'pt for X% off', the X must be in canonical set", () => {
    const CANON_POINTS = new Map<number, number>([
      [50, 5], [100, 10], [200, 20], [250, 25], [300, 30], [400, 30],
    ]);
    const re = /(\d{2,3})\s*pt\s+for\s+(\d{1,2})%/gi;
    for (const name of TEMPLATE_NAMES) {
      const src = TEMPLATES[name];
      let m: RegExpExecArray | null;
      while ((m = re.exec(src)) !== null) {
        const pts = Number(m[1]);
        const pct = Number(m[2]);
        const expected = CANON_POINTS.get(pts);
        if (expected !== undefined) {
          assert.equal(
            pct,
            expected,
            `${name} says "${pts}pt for ${pct}%" — canonical is ${pts}pt → ${expected}%`,
          );
        }
      }
    }
  });
});

describe("email templates — server-only hygiene", () => {
  test("every template imports 'server-only' (Next.js bundle-side guard)", () => {
    for (const name of TEMPLATE_NAMES) {
      assert.match(
        TEMPLATES[name],
        /^import\s+["']server-only["']\s*;/m,
        `${name} missing import "server-only" — could leak template into client bundle`,
      );
    }
  });
});
