// W3C `/.well-known/change-password` — redirects browsers' password-manager
// suggestions ("Change weak password" in Safari Keychain / Chrome) to the
// actual password-change UI. Per https://w3c.github.io/webappsec-change-password-url/
//
// glw uses Clerk for customer auth; password change lives in Clerk's
// hosted user-profile UI under `/account`. Clerk handles the actual
// password-change form + breach-check + new-password requirements.
//
// Static 303 ("See Other") is the canonical response shape per the spec.

import { redirect } from "next/navigation";

export const dynamic = "force-static";

export function GET() {
  redirect("/account");
}
