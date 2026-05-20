// safeRedirectPath — guard against open-redirect via attacker-controlled
// `?redirect_url=` / `?from=` / `?returnTo=` params that flow into Clerk's
// post-sign-in redirect, router.push() or redirect().
//
// Ported verbatim 2026-05-19 from brapp v411.545
// (`apps/staff/src/lib/safe-redirect.ts`). Sister of brapp v396.645 staff
// /login guard, v397.445 customer-PWA /account/login guard, and the inline
// guards previously duplicated at `app/sign-in/[[...sign-in]]/page.tsx` +
// `app/sign-up/[[...sign-up]]/page.tsx` on this stack (now imported from
// here). Lifted to a shared lib so every redirect-param surface across the
// public site imports the canonical guard rather than reinventing it —
// post-login link-follow pattern: a logged-out customer who clicks a deep
// link to `/account/orders` should land back on `/account/orders` after
// signing in, but ONLY if the path is same-origin.
//
// Attack the guard blocks:
//   `https://www.greenlifecannabis.com/sign-in?redirect_url=https://attacker.com/phish`
// — pre-fix Clerk performed a full-page navigation off-origin after
// successful sign-in (classic open-redirect / OAuth-style trust-handoff
// abuse). Same shape on /sign-up + on any redirect target in /account/*.
//
// Require the path to:
//   - start with `/` (relative to current origin)
//   - NOT start with `//` (protocol-relative URLs like `//attacker.com/x`)
//   - NOT start with `/\` (Windows path-trick variants)
//   - NOT contain `://` anywhere (defense-in-depth against URL embed)
//
// Defaults to `/` for any invalid input + caps length at 512 chars (DoS belt).
export function safeRedirectPath(raw: string | null | undefined, fallback: string = "/"): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//")) return fallback;
  if (raw.startsWith("/\\")) return fallback;
  if (raw.includes("://")) return fallback;
  return raw.slice(0, 512);
}
