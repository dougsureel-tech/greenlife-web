import type { Metadata } from "next";
import { STORE, DEFAULT_OG_IMAGE} from "@/lib/store";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-jsonld";

// BreadcrumbList JSON-LD — sister of v12.505 /careers fix. Pre-fix
// /apply had no BreadcrumbList; Google could not show the breadcrumb
// chip in SERP results. Caught by /loop cross-stack BreadcrumbList
// coverage audit 2026-05-10.
const breadcrumb = breadcrumbJsonLd([
  { name: "Home", url: STORE.website },
  { name: "Apply", url: `${STORE.website}/apply` },
]);

// /apply has its own layout because `app/apply/page.tsx` is a client
// component (`"use client"` for the multi-step form state). Client
// components can't export `metadata`, so without this layout the page
// inherits the root layout's canonical (`/`) — Google then treats
// /apply as a duplicate of the homepage and refuses to index it as a
// separate page. Anyone Googling "Green Life Cannabis apply for job"
// would not find /apply in search results. /careers (sister page) is
// a server component and exports its own metadata; this layout makes
// /apply match the same canonical posture.

export const metadata: Metadata = {
  // Drop ${STORE.name} from body — layout.tsx title.template appends
  // ` | Green Life Cannabis` so saying "Apply to work at Green Life
  // Cannabis" produces "Apply to work at Green Life Cannabis | Green
  // Life Cannabis" (brand twice). Caught 2026-05-10 by /loop tick 25
  // duplicate-brand sweep. Sister GW v2.94.60 + scc same-push.
  title: "Apply for a Job",
  description: `Apply for a position at ${STORE.name} in ${STORE.address.city}, WA. Budtender, lead, inventory and more — open roles + general intake. 21+ required (WAC 314-55-115).`,
  alternates: { canonical: "/apply" },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: `Apply to work at ${STORE.name}`,
    description: `Open roles + general intake at ${STORE.name}, ${STORE.address.city} WA. 21+ required.`,
    url: `${STORE.website}/apply`,
    siteName: STORE.name,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `Apply to work at ${STORE.name}`,
    description: `Open roles + general intake at ${STORE.name}, ${STORE.address.city} WA.`,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {children}
    </>
  );
}
