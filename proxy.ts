import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/account(.*)"]);

// Canonical production host — every visitor should land here. Anyone hitting
// a per-deployment URL (like greenlife-abc123-dougsureel-3370s-projects.
// vercel.app) gets blocked by Vercel's deployment protection and sees the
// iOS-Safari "This page couldn't load" screen because the auth challenge
// can't complete cross-origin. We catch those at the edge and 308 redirect
// to the canonical alias so a stale link or shared deploy URL always
// resolves to a working page.
//
// Override at deploy time with NEXT_PUBLIC_CANONICAL_HOST if a custom
// domain ever lands (e.g. "www.greenlifecannabis.com").
const CANONICAL_HOST = process.env.NEXT_PUBLIC_CANONICAL_HOST || "greenlife-web-lac.vercel.app";

// Hosts we never want to redirect from: localhost (dev), the canonical
// host itself, and *.localhost subdomains.
function isCanonicalOrLocal(host: string): boolean {
  if (!host) return true;
  const h = host.toLowerCase().split(":")[0];
  if (h === CANONICAL_HOST.toLowerCase()) return true;
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (h === "127.0.0.1" || h === "[::1]") return true;
  // Any custom domain we want to allow alongside the alias goes here
  // (none yet). Custom-domain visitors stay on their domain.
  if (h === "www.greenlifecannabis.com" || h === "greenlifecannabis.com") return true;
  return false;
}

export default clerkMiddleware(async (auth, req) => {
  const url = new URL(req.url);
  if (!isCanonicalOrLocal(url.hostname)) {
    const target = new URL(req.url);
    target.hostname = CANONICAL_HOST;
    target.protocol = "https:";
    target.port = "";
    return NextResponse.redirect(target.toString(), 308);
  }
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
