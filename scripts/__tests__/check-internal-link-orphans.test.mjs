// Pin tests for scripts/check-internal-link-orphans.mjs.
//
// SEO health check — Google de-prioritizes pages with zero inbound
// internal links. With 250 strain pages + 150+ near/learn pages on the
// cannabis-web stacks, easy for some to become unreachable.
//
// Detection contract: pure-fn pieces (pageFileToRoute, buildRouteInventory,
// findOrphans). We pin the route-derivation + link-detection behavior
// against synthetic inputs that wouldn't drift even if the live sitemap
// surface changes.
//
// Run:
//   node --test scripts/__tests__/check-internal-link-orphans.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  pageFileToRoute,
  buildRouteInventory,
  findOrphans,
} from "../check-internal-link-orphans.mjs";

const GATE_PATH = join(process.cwd(), "scripts/check-internal-link-orphans.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("pageFileToRoute — static page", () => {
  assert.equal(
    pageFileToRoute("/repo/app/contact/page.tsx", "/repo/app"),
    "/contact",
  );
});

test("pageFileToRoute — homepage", () => {
  assert.equal(pageFileToRoute("/repo/app/page.tsx", "/repo/app"), "/");
});

test("pageFileToRoute — nested static page", () => {
  assert.equal(
    pageFileToRoute("/repo/app/community/feedback/page.tsx", "/repo/app"),
    "/community/feedback",
  );
});

test("pageFileToRoute — dynamic segment preserved as template", () => {
  assert.equal(
    pageFileToRoute("/repo/app/blog/[slug]/page.tsx", "/repo/app"),
    "/blog/[slug]",
  );
});

test("pageFileToRoute — catch-all segment is erased (Clerk pattern)", () => {
  assert.equal(
    pageFileToRoute("/repo/app/sign-in/[[...sign-in]]/page.tsx", "/repo/app"),
    "/sign-in",
  );
});

test("pageFileToRoute — route group erased from URL", () => {
  assert.equal(
    pageFileToRoute("/repo/app/(public)/about/page.tsx", "/repo/app"),
    "/about",
  );
});

// Synthetic-repo fixture — gives us full control to assert orphan
// detection without depending on the live source tree.
function buildFixture() {
  const root = join(tmpdir(), `orphan-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(join(root, "app/page-a"), { recursive: true });
  mkdirSync(join(root, "app/page-b"), { recursive: true });
  mkdirSync(join(root, "app/lonely"), { recursive: true });
  mkdirSync(join(root, "app/api/foo"), { recursive: true });

  // page-a links to page-b but nobody links to lonely
  writeFileSync(
    join(root, "app/page.tsx"),
    `export default () => (<Link href="/page-a">A</Link>);`,
  );
  writeFileSync(
    join(root, "app/page-a/page.tsx"),
    `export default () => (<Link href="/page-b">B</Link>);`,
  );
  writeFileSync(
    join(root, "app/page-b/page.tsx"),
    `export default () => null;`,
  );
  writeFileSync(
    join(root, "app/lonely/page.tsx"),
    `export default () => null;`,
  );
  writeFileSync(
    join(root, "app/api/foo/page.tsx"),
    `export default () => null;`,
  );
  return root;
}

test("findOrphans — flags genuinely orphan route", () => {
  const root = buildFixture();
  try {
    const { orphans, allRoutes } = findOrphans(root);
    assert.ok(allRoutes.includes("/lonely"));
    assert.ok(orphans.includes("/lonely"), "lonely page detected as orphan");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("findOrphans — does NOT flag a linked route", () => {
  const root = buildFixture();
  try {
    const { orphans } = findOrphans(root);
    assert.ok(!orphans.includes("/page-a"), "page-a is linked from /");
    assert.ok(!orphans.includes("/page-b"), "page-b is linked from /page-a");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("findOrphans — does NOT flag excluded surfaces (/api, /dev, /account)", () => {
  const root = buildFixture();
  try {
    const { orphans } = findOrphans(root);
    // /api/foo MAY be in allRoutes depending on walk, but must not orphan-flag
    for (const o of orphans) {
      assert.ok(!o.startsWith("/api/"), `/api/* should never be flagged: ${o}`);
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("findOrphans — accepts href={withAttr('/path', ...)} UTM helper", () => {
  // The withAttr() wrapper threads UTM params onto internal hrefs. If
  // the link-graph builder misses these, /menu and /deals (which use
  // it everywhere) look orphaned. This pin guards against regression.
  const root = join(tmpdir(), `withattr-test-${Date.now()}`);
  mkdirSync(join(root, "app/foo"), { recursive: true });
  mkdirSync(join(root, "app/bar"), { recursive: true });
  writeFileSync(
    join(root, "app/page.tsx"),
    `export default () => (<a href={withAttr("/foo", "header", "x")}>F</a>);`,
  );
  writeFileSync(join(root, "app/foo/page.tsx"), `export default () => null;`);
  writeFileSync(join(root, "app/bar/page.tsx"), `export default () => null;`);
  try {
    const { orphans } = findOrphans(root);
    assert.ok(!orphans.includes("/foo"), "/foo linked via withAttr is found");
    assert.ok(orphans.includes("/bar"), "/bar is genuinely orphan");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("findOrphans — accepts { href: '/path' } object-literal nav config", () => {
  // SiteFooter renders from arrays of { href, label } objects. If the
  // builder misses object-literal hrefs, /contact /faq /press /terms-of-use
  // all show false-positive orphan flags.
  const root = join(tmpdir(), `obj-href-test-${Date.now()}`);
  mkdirSync(join(root, "app/contact"), { recursive: true });
  mkdirSync(join(root, "components"), { recursive: true });
  writeFileSync(join(root, "app/page.tsx"), `export default () => <Footer />;`);
  writeFileSync(join(root, "app/contact/page.tsx"), `export default () => null;`);
  writeFileSync(
    join(root, "components/Footer.tsx"),
    `const links = [{ href: "/contact", label: "Contact" }];`,
  );
  try {
    const { orphans } = findOrphans(root);
    assert.ok(!orphans.includes("/contact"), "/contact linked via object-literal href is found");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("buildRouteInventory — expands /strains/[slug] from STRAINS slug entries", () => {
  // Tests that the data-driven dynamic-route expansion works. We
  // build a minimal STRAINS lib + a /strains/[slug] page, and verify
  // the expanded routes contain the slugs.
  const root = join(tmpdir(), `dynamic-test-${Date.now()}`);
  mkdirSync(join(root, "app/strains/[slug]"), { recursive: true });
  mkdirSync(join(root, "lib"), { recursive: true });
  writeFileSync(join(root, "app/strains/[slug]/page.tsx"), `export default () => null;`);
  writeFileSync(
    join(root, "lib/strains.ts"),
    `export const STRAINS = {
  "blue-dream": {
    slug: "blue-dream",
    name: "Blue Dream",
  },
  "og-kush": {
    slug: "og-kush",
    name: "OG Kush",
  },
};`,
  );
  try {
    const { expandedRoutes } = buildRouteInventory(root);
    assert.ok(expandedRoutes.includes("/strains/blue-dream"));
    assert.ok(expandedRoutes.includes("/strains/og-kush"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("source — incident anchor preserved (Google de-prioritization)", () => {
  // The WHY: Google de-prioritizes pages with no inbound links. If
  // someone "cleans up" the comment and the rationale gets lost, the
  // gate may get demoted. Pin the anchor phrase.
  assert.match(
    GATE_SRC,
    /Google de-prioritizes/i,
    "Google de-prioritization rationale preserved",
  );
  assert.match(
    GATE_SRC,
    /250 strain pages/,
    "250-page scale anchor preserved",
  );
});

test("source — 4 link-pattern detectors preserved (href= / href: / withAttr / redirect)", () => {
  // The detection contract: 4 patterns. Drift on any silently breaks
  // false-positive rate. SiteFooter relies on the object-literal one;
  // /menu surface relies on withAttr.
  assert.match(GATE_SRC, /href\\s\*=/, "href= JSX prop detector");
  assert.match(GATE_SRC, /href\\s\*:/, "href: object-literal detector");
  assert.match(GATE_SRC, /withAttr/, "withAttr UTM-helper detector");
  assert.match(GATE_SRC, /redirect.*router\.push|router\.push.*redirect/, "redirect/router.push nav detector");
});
