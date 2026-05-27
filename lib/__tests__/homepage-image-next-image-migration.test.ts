// Pin tests for the homepage <img> → next/image migration scope under
// SEO_AUDIT_AUTONOMOUS_WINS_2026_05_26 Tech-SEO #5 Part B.
//
// **Audit decision** (logged here so a future session doesn't re-litigate):
//
// The audit calls for "raw <img> → next/image migration on homepage
// product tiles." Investigation shows:
//   1. The homepage ALREADY imports `Image from "next/image"`.
//   2. Remaining raw <img> tags are inside the product-tile fallback
//      chain (`matchProductPhoto` → `getCategoryPlaceholderPhoto`) and
//      each is annotated with an explicit
//      `// eslint-disable-next-line @next/next/no-img-element` —
//      meaning a prior session deliberately kept them as <img>.
//   3. The 17 sibling eslint-disable sites across `app/` follow the same
//      pattern. A homepage-only migration would create cross-file
//      inconsistency without a corresponding LCP win (these tiles are
//      below-the-fold inside virtualized scroll regions).
//
// **Pin:** the next/image import EXISTS on the homepage (so the future
// migration path is open). Raw <img> count is bounded — a new raw <img>
// added WITHOUT an explicit eslint-disable comment trips this pin. That
// stops accidental regressions while leaving the audit-class sweep for
// a separate codebase-wide pass.
//
// Run:
//   pnpm exec tsx --test lib/__tests__/homepage-image-next-image-migration.test.ts

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const HOMEPAGE_PATH = join(process.cwd(), "app/page.tsx");

describe("Homepage image migration — next/image import discipline", () => {
  const src = readFileSync(HOMEPAGE_PATH, "utf8");

  test("homepage imports `Image from \"next/image\"`", () => {
    assert.ok(
      /from\s+["']next\/image["']/.test(src),
      "app/page.tsx must import from `next/image` so future <img> sites can migrate inline",
    );
  });
});

describe("Homepage image migration — raw <img> discipline", () => {
  const src = readFileSync(HOMEPAGE_PATH, "utf8");

  test("every raw <img tag is paired with an eslint-disable comment", () => {
    // Walk line-by-line. For each `<img ` opener, the previous line MUST
    // contain `eslint-disable-next-line @next/next/no-img-element`. A new
    // <img tag added without that disabler indicates an accidental
    // regression (someone added a raw <img> without intending the
    // documented fallback-chain shape).
    const lines = src.split("\n");
    const offenders: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (/<img\s/.test(lines[i])) {
        const window = lines.slice(Math.max(0, i - 3), i).join("\n");
        if (!/eslint-disable-next-line\s+@next\/next\/no-img-element/.test(window)) {
          offenders.push(i + 1); // 1-indexed for error message
        }
      }
    }
    assert.deepEqual(
      offenders,
      [],
      `raw <img> tags without eslint-disable on lines: ${offenders.join(", ")}`,
    );
  });

  test("raw <img> count is bounded (regression guard)", () => {
    // The known-intentional count today is 4 (product-tile fallback chain).
    // A future Part-B sweep should land all four behind <Image> AND drop
    // this assertion to 0. Until then, this pin catches an increase.
    const matches = src.match(/<img\s/g) ?? [];
    assert.ok(
      matches.length <= 4,
      `homepage raw <img> count should be ≤ 4 (was ${matches.length}). If a Part-B sweep is shipping, drop this bound.`,
    );
  });
});
