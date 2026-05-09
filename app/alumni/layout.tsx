import type { Metadata } from "next";

// `app/alumni/page.tsx` is a Client Component (uses useState/useMemo for
// the secret-prompt + alumni-table render), so it cannot export `metadata`.
// This layout backfills the privacy-noindex declaration so /alumni gets
// the same two-layer defense as /dev + /devmenu (page-level robots meta
// AND robots.txt Disallow). Pre-fix /alumni only had the robots.txt
// Disallow — Google sometimes indexes-despite-disallow on heavily-linked
// pages, and an indexed /alumni would expose the legacy team roster +
// secret-prompt to the SERP. follow:false because nothing on the page
// is intended for crawlers either way.

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AlumniLayout({ children }: { children: React.ReactNode }) {
  return children;
}
