import { ClerkProvider } from "@clerk/nextjs";

// Scoped Clerk provider — see app/account/layout.tsx and app/layout.tsx
// for the rationale (keeps Clerk SDK off /menu and other public pages).
export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
