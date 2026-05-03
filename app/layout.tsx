import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AgeGate } from "@/components/AgeGate";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileStickyCta } from "@/components/MobileStickyCta";
import { CartResumeBanner } from "@/components/CartResumeBanner";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { STORE } from "@/lib/store";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(STORE.website),
  title: {
    default: `${STORE.name} | Cannabis Dispensary in ${STORE.address.city}, WA`,
    template: `%s | ${STORE.name}`,
  },
  description: `${STORE.name} — ${STORE.address.city}'s longest-running cannabis dispensary, founded 2014, same building since opening. The Valley's best cannabis staff. Shop flower, concentrates, edibles, vapes, and more. Open daily. ${STORE.address.full}.`,
  keywords: [
    "cannabis dispensary Wenatchee",
    "marijuana dispensary Wenatchee WA",
    "cannabis store Wenatchee",
    "weed dispensary Wenatchee",
    "Green Life Cannabis",
    "cannabis delivery Wenatchee",
    "recreational cannabis Washington",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: STORE.name,
    title: `${STORE.name} | Cannabis Dispensary in ${STORE.address.city}, WA`,
    description: `Shop premium cannabis at ${STORE.name} — Wenatchee's best cannabis staff, founded 2014. Flower, edibles, concentrates, vapes & more.`,
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Green Life",
  },
  other: {
    rating: "adult",
    "mobile-web-app-capable": "yes",
    // Geo SEO meta — paid display + CRM ad networks (Meta/Google Ads/
    // Klaviyo) anchor location-targeted creative off these. ICBM +
    // geo.position duplicate each other on purpose; different crawlers
    // prefer different conventions.
    "geo.region": "US-WA",
    "geo.placename": `${STORE.address.city}, WA`,
    "geo.position": `${STORE.geo.lat};${STORE.geo.lng}`,
    ICBM: `${STORE.geo.lat}, ${STORE.geo.lng}`,
  },
};

export const viewport = {
  themeColor: "#022c22",
  width: "device-width",
  initialScale: 1,
};

// Headline towns in the Wenatchee Valley footprint live in `STORE.nearbyTowns`
// so the homepage hero pill cluster + town card grid pull from the same
// source as the JSON-LD areaServed graph below. The longer list here adds
// the smaller communities + neighborhoods we also serve so search engines
// see the full geographic reach without the homepage rendering a marketing
// wall of pills.
const NEARBY_CITIES = [
  ...STORE.nearbyTowns.map((t) => t.name),
  "Quincy",
  "Waterville",
  "Malaga",
  "Monitor",
  "Sunnyslope",
];

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Store"],
  "@id": `${STORE.website}/#dispensary`,
  name: STORE.name,
  legalName: STORE.name,
  alternateName: ["Green Life", "Green Life Wenatchee"],
  description: `Licensed cannabis dispensary in ${STORE.address.city}, WA — founded 2014, same building since opening, the Valley's best cannabis staff. Premium flower, pre-rolls, vapes, concentrates, edibles, tinctures and topicals from Washington-state producers. Cash only, 21+ with valid ID.`,
  slogan: STORE.tagline,
  url: STORE.website,
  telephone: STORE.phoneTel,
  email: STORE.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: STORE.address.street,
    addressLocality: STORE.address.city,
    addressRegion: STORE.address.state,
    postalCode: STORE.address.zip,
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: STORE.geo.lat,
    longitude: STORE.geo.lng,
  },
  areaServed: [
    // City-level served-area entries — what we already had, drives "{city}
    // dispensary" intent.
    ...NEARBY_CITIES.map((name) => ({
      "@type": "City",
      name,
      containedInPlace: { "@type": "State", name: "Washington" },
    })),
    // ZIP-code-level served-area entries (Hack #8 — Local SEO).
    // Drives "cannabis 98801" / "weed near 98826" intent — zip-code
    // queries are 2-3× higher purchase intent than city queries because
    // they typically come from people checking what's actually near them
    // RIGHT NOW. Schema.org PostalCodeSpecification under areaServed is
    // the canonical way to advertise the radius without lying about
    // delivery (we're pickup-only — these are the ZIPs we DRAW from,
    // not where we ship to). Snohomish-county-cities and Quincy excluded
    // since those are 2hr+ drives. Wenatchee Valley + immediate I-90
    // / US-2 corridor only.
    ...[
      { zip: "98801", area: "Wenatchee + Sunnyslope" },
      { zip: "98802", area: "East Wenatchee" },
      { zip: "98815", area: "Cashmere" },
      { zip: "98826", area: "Leavenworth" },
      { zip: "98816", area: "Chelan + Lake Chelan" },
      { zip: "98822", area: "Entiat" },
      { zip: "98823", area: "Quincy + Ephrata corridor" },
      { zip: "98847", area: "Peshastin" },
    ].map(({ zip, area }) => ({
      "@type": "PostalAddress",
      postalCode: zip,
      addressRegion: "WA",
      addressCountry: "US",
      description: area,
    })),
  ],
  openingHoursSpecification: STORE.hours.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: `https://schema.org/${h.day}`,
    opens: h.open,
    closes: h.close,
  })),
  priceRange: "$$",
  currenciesAccepted: "USD",
  paymentAccepted: "Cash",
  hasMap: STORE.googleMapsUrl,
  identifier: {
    "@type": "PropertyValue",
    propertyID: "WSLCB License",
    value: STORE.wslcbLicense,
  },
  knowsAbout: [
    "Cannabis flower",
    "Pre-rolls",
    "Cannabis concentrates",
    "Cannabis vapes",
    "Cannabis edibles",
    "Tinctures",
    "Topicals",
    "Terpenes",
    "Cannabinoids",
    "Indica",
    "Sativa",
    "Hybrid",
    "Washington State cannabis law",
  ],
  amenityFeature: STORE.amenities.map((name) => ({
    "@type": "LocationFeatureSpecification",
    name,
    value: true,
  })),
  publicAccess: true,
  smokingAllowed: false,
  isAccessibleForFree: true,
  hasMenu: `${STORE.website}/menu`,
  potentialAction: {
    "@type": "OrderAction",
    target: `${STORE.website}/order`,
    deliveryMethod: "http://purl.org/goodrelations/v1#DeliveryModePickUp",
  },
  sameAs: [STORE.social.instagram, STORE.social.facebook].filter(Boolean),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // ClerkProvider deliberately NOT here — it preloads `clerk.accounts.dev`
  // (or the satellite Clerk URL) on every page including /menu, which
  // injects scripts and cookies that interfere with the iHeartJane Boost
  // embed's cross-origin XHR. Provider is now scoped to /account, /sign-in,
  // /sign-up via per-route layout.tsx files. SiteHeader's previous
  // `useAuth()` was removed (always shows "Sign in" link — Clerk redirects
  // signed-in visitors to /account on the /sign-in page). Server-side
  // helpers from `@clerk/nextjs/server` (auth, currentUser) work without
  // ClerkProvider so /account pages still authenticate correctly.
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <head>
        {/* Resource hints — DNS + TLS prewarm for vendor-image CDNs we hit
            on home, /brands, /menu, /order. Browsers open the TCP + TLS
            connection in parallel with HTML parse instead of sequentially
            after first reference. Real Core Web Vitals win on mobile
            (~100–200ms per origin on cold connections). Clerk hosts NOT
            preconnected here — ClerkProvider is scoped to /sign-in,
            /sign-up, /account via per-route layouts (see comment below).
            crossOrigin="anonymous" because images are fetched without
            credentials; required for the connection to be reused. */}
        <link rel="preconnect" href="https://images.squarespace-cdn.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://static.wixstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        {/* Skip-to-main — keyboard + screen-reader users tab here first
            so they can bypass the header/announcement nav. Visually hidden
            until focused, then becomes a fixed pill at the top-left. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-green-700 focus:text-white focus:font-bold focus:text-sm focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <AgeGate />
        <AnnouncementBar />
        <SiteHeader />
        <CartResumeBanner />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <MobileStickyCta />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
