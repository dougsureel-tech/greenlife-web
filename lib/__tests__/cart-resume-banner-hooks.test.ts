// Source-defense pin for `components/CartResumeBanner.tsx`.
//
// v21.805 refactored CartResumeBanner to call hooks UNCONDITIONALLY
// before the `PUBLIC_ORDER_ROUTE_LIVE` early-return guard, dropping 8
// `eslint-disable-next-line react-hooks/rules-of-hooks` and
// `set-state-in-effect` comments. Pre-fix: hooks called AFTER the early
// return — worked while the flag was a compile-time constant but would
// silently break the moment it became dynamic state/prop.
//
// This pin asserts the eslint-disables stay dropped + the structural
// invariant (all hooks called before the early return).

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BANNER_SRC = readFileSync(
  join(__dirname, "..", "..", "components", "CartResumeBanner.tsx"),
  "utf-8",
);

describe("CartResumeBanner.tsx — Rules-of-Hooks defense (v21.805)", () => {
  test("no `eslint-disable react-hooks/rules-of-hooks` comments remain", () => {
    const matches = BANNER_SRC.match(/eslint-disable.*react-hooks\/rules-of-hooks/g) || [];
    assert.equal(
      matches.length,
      0,
      `Found ${matches.length} react-hooks/rules-of-hooks disables — refactor dropped all of them at v21.805; reintroducing them means hooks are gated below an early return again (silent crash risk when PUBLIC_ORDER_ROUTE_LIVE becomes dynamic)`,
    );
  });

  test("no `eslint-disable react-hooks/set-state-in-effect` comments remain", () => {
    // set-state-in-effect disables were paired with the rules-of-hooks
    // disables in the pre-fix version. They cluster around the same
    // anti-pattern (hooks gated below early return). Pin both.
    const matches = BANNER_SRC.match(/eslint-disable.*react-hooks\/set-state-in-effect/g) || [];
    assert.equal(
      matches.length,
      0,
      `Found ${matches.length} set-state-in-effect disables — refactor dropped them at v21.805`,
    );
  });

  test("PUBLIC_ORDER_ROUTE_LIVE early-return is AFTER the hooks (not before)", () => {
    // Find positions of: first useState/useEffect/usePathname AND the
    // !PUBLIC_ORDER_ROUTE_LIVE return. Assert hooks come FIRST.
    const firstHookMatch = BANNER_SRC.match(/\b(useState|useEffect|usePathname|useSyncExternalStore)\(/);
    const earlyReturnMatch = BANNER_SRC.match(/if\s*\(\s*!\s*PUBLIC_ORDER_ROUTE_LIVE\s*\)\s*return/);
    assert.ok(firstHookMatch, "no React hooks found in CartResumeBanner — file shape changed unexpectedly");
    assert.ok(earlyReturnMatch, "no PUBLIC_ORDER_ROUTE_LIVE early-return found — file shape changed unexpectedly");
    const hookIdx = firstHookMatch.index!;
    const returnIdx = earlyReturnMatch.index!;
    assert.ok(
      hookIdx < returnIdx,
      `First hook call at index ${hookIdx} but early-return at index ${returnIdx} — hooks must be called BEFORE the guard, not after (Rules-of-Hooks)`,
    );
  });

  test("PUBLIC_ORDER_ROUTE_LIVE is still false (component is gated until /order ships)", () => {
    // When /order goes public, this flips to true + the existing /menu
    // CTA in the banner doesn't change. Pin the gate so a future refactor
    // doesn't accidentally enable the banner without /order being live.
    assert.match(
      BANNER_SRC,
      /const PUBLIC_ORDER_ROUTE_LIVE\s*=\s*false/,
      "PUBLIC_ORDER_ROUTE_LIVE must be `false` until /order ships publicly — see feedback_customer_ctas_point_to_menu_only.md",
    );
  });
});
