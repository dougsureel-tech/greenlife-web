import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { ATTR_COOKIE, ATTR_TTL_DAYS, validateAttrValue } from "@/lib/attribution";

// Routes where Clerk's middleware runs (so its UI components can hydrate
// session state) — includes the auth pages themselves so <SignIn /> renders.
const isClerkRoute = createRouteMatcher(["/account(.*)", "/sign-in(.*)", "/sign-up(.*)"]);

// Routes that REQUIRE an authenticated session. /sign-in and /sign-up are
// deliberately NOT in this list — they're the pages an unauthed user is
// SENT TO. Including them caused a self-redirect loop: visit /sign-in →
// auth.protect() sends to /sign-in?redirect_url=/sign-in → loop.
const isProtectedRoute = createRouteMatcher(["/account(.*)"]);

// Canonical production host — every visitor should land here. We pin the
// canonical to www.greenlifecannabis.com because:
//   1. iHeartJane Boost's CORS allowlist for embedConfigId 234 (Wenatchee)
//      is registered against the WP origin www.greenlifecannabis.com — bare
//      apex gets CORS-rejected (see reference_iheartjane_cors_origin memory).
//   2. Single-host operation keeps Clerk session cookies on one origin so
//      we don't risk subtle session split between apex and www.
//   3. A per-deployment URL (greenlife-abc123-…vercel.app) gets blocked by
//      Vercel's deployment protection and the iOS-Safari "This page couldn't
//      load" screen surfaces because the auth challenge can't complete
//      cross-origin. We 308 those to www so stale/shared deploy URLs land.
//
// Override at deploy time with NEXT_PUBLIC_CANONICAL_HOST only if the
// canonical hostname ever changes.
const CANONICAL_HOST = process.env.NEXT_PUBLIC_CANONICAL_HOST || "www.greenlifecannabis.com";

// Belt-and-suspenders: even if NEXT_PUBLIC_CANONICAL_HOST is ever
// misconfigured at deploy time (e.g. a stale value from when the deployment
// alias was canonical, or accidentally set to a per-deployment Vercel URL),
// the production customer-facing host MUST always be treated as canonical
// so we never accidentally redirect customers AWAY from
// www.greenlifecannabis.com. Same defense class as the cross-store warp
// canonical-host hardening on the inventoryapp side (v45.205) — env-var
// misconfig should not be able to break the SSO/CORS pinning. Mirrors
// seattle-cannabis-web/proxy.ts.
const ALWAYS_CANONICAL_HOSTS = new Set(["www.greenlifecannabis.com"]);

// Hosts we never want to redirect from: localhost (dev), the canonical
// host itself, and *.localhost subdomains. Apex (greenlifecannabis.com)
// is intentionally NOT in this list — it 308-redirects to www so we have
// one host for cookies + CORS + SEO consolidation.
function isCanonicalOrLocal(host: string): boolean {
  if (!host) return true;
  const h = host.toLowerCase().split(":")[0];
  if (h === CANONICAL_HOST.toLowerCase()) return true;
  if (ALWAYS_CANONICAL_HOSTS.has(h)) return true;
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (h === "127.0.0.1" || h === "[::1]") return true;
  return false;
}

// We *only* invoke Clerk's middleware on auth-relevant routes. Reason:
// `clerkMiddleware()` runs Clerk's server session check on every request it
// wraps, which writes the `__clerk_db_jwt` cookie + sets the
// `x-clerk-auth-reason: dev-browser-missing` header on the response. On
// public pages like /menu, that cookie travels along with the iHeartJane
// Jane Boost embed's credentialed cross-origin XHR (api.iheartjane.com),
// and iHeartJane's CORS check rejects requests carrying unrecognized
// cookies. Scoping Clerk to /account + /sign-in + /sign-up keeps Clerk
// where it belongs (auth flows) and removes the cookie/header noise from
// every other route.
const clerk = clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;
  // auth.protect() defaults to 404 for unauthed users — bad UX. Redirect
  // them to the sign-in page so they can come back to /account after.
  const signInUrl = new URL("/sign-in", req.url);
  signInUrl.searchParams.set("redirect_url", req.url);
  await auth.protect({ unauthenticatedUrl: signInUrl.toString() });
});

export default async function middleware(req: NextRequest) {
  const url = new URL(req.url);

  // /brands index → /menu (308 permanent). The brands index was deleted
  // 2026-05-04 (Doug + Kat call) but the page-level `permanentRedirect()`
  // approach in `app/brands/page.tsx` didn't produce a true HTTP 308 even
  // with `dynamic = "force-dynamic"` (Next 16 quirk — response body came
  // back as homepage HTML at HTTP 200). Middleware-level intercept runs
  // BEFORE rendering and emits a real 308. Per-brand pages /brands/[slug]
  // are kept (graduated boutique pages) — only the bare /brands index
  // redirects. `next-router-prefetch` + RSC variants of the request also
  // get the 308; Vercel's internal probe paths don't matter (this matcher
  // only catches the literal `/brands` path).
  if (url.pathname === "/brands" || url.pathname === "/brands/") {
    const target = new URL("/menu", req.url);
    return NextResponse.redirect(target.toString(), 308);
  }

  // Site-wide canonical-host enforcement. Anything that isn't the canonical
  // host or a local-dev host gets 308-redirected to CANONICAL_HOST. This
  // covers:
  //   - apex (greenlifecannabis.com) → www. Saves one DNS-redirect hop on
  //     first visit, keeps Clerk session cookies on a single origin, and
  //     keeps /menu reachable (iHeartJane's CORS allowlist binds www).
  //   - per-deployment Vercel URLs (greenlife-abc123-…vercel.app) → www.
  //     Otherwise visitors hit deployment protection and the iOS-Safari
  //     "This page couldn't load" screen because auth can't complete.
  // 308 is permanent + preserves request method (matters for any future
  // POSTs like contact forms).
  //
  // /api/health* is exempt: external monitors and the post-deploy LKG
  // verification curl (per OPERATING_PRINCIPLES) need to hit any host
  // alias and get a clean 200 with `sha` + `version`. A 308 response
  // body has no JSON to parse, and following the redirect would mask
  // host-specific liveness signal (e.g. confirming the apex Vercel
  // alias is responding from the right deployment, or smoke-testing
  // a per-deploy URL during a rolling release). Covers both /api/health
  // (full DB + content check) and /api/health/ping (cheap second-bucket
  // liveness) since both serve the same monitoring use cases. Mirror
  // on seattle-cannabis-web/proxy.ts.
  if (!isCanonicalOrLocal(url.hostname) && !url.pathname.startsWith("/api/health")) {
    const target = new URL(req.url);
    target.hostname = CANONICAL_HOST;
    target.protocol = "https:";
    target.port = "";
    return NextResponse.redirect(target.toString(), 308);
  }
  if (isClerkRoute(req)) {
    // Defer to Clerk only on auth-relevant paths.
    return (clerk as unknown as (req: NextRequest) => Promise<Response> | Response)(req);
  }

  // Marketing attribution capture — last-touch wins. Whenever a request
  // carries `?from=<source>:<slug>` matching the SOURCE_KINDS allowlist,
  // we write it to the gl_attr_source cookie (30-day TTL). Subsequent
  // visits + the eventual order flow can read this back to know what
  // surface drove the customer in. Validation lives in lib/attribution.ts
  // so the cookie value is always a known shape — protects the admin
  // attribution dashboard from rendering injected text.
  const fromParam = url.searchParams.get("from");
  if (fromParam) {
    const validated = validateAttrValue(fromParam);
    if (validated) {
      const res = NextResponse.next();
      res.cookies.set(ATTR_COOKIE, validated, {
        maxAge: 60 * 60 * 24 * ATTR_TTL_DAYS,
        path: "/",
        sameSite: "lax",
        httpOnly: false,
        secure: url.protocol === "https:",
      });
      return res;
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
