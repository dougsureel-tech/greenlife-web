import { ClerkProvider } from "@clerk/nextjs";

// ClerkProvider scoped to /account/* only. Was at the root layout, but
// that preloaded the Clerk SDK on every public page (including /menu)
// where it interferes with the iHeartJane Boost embed's cross-origin XHR.
// Server-side helpers (auth, currentUser) work without the provider, so
// account pages still authenticate fine — this provider only exists for
// the client-side bits like SignOutButton.
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
