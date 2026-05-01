import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AgeGate } from "@/components/AgeGate";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
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
  description:
    `${STORE.name} is ${STORE.address.city}'s premier cannabis dispensary. Shop flower, concentrates, edibles, vapes, and more. Open daily. ${STORE.address.full}.`,
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
    description: `Shop premium cannabis products at ${STORE.name} in ${STORE.address.city}, WA. Flower, edibles, concentrates, vapes & more.`,
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
    "rating": "adult",
    "mobile-web-app-capable": "yes",
  },
};

export const viewport = {
  themeColor: "#022c22",
  width: "device-width",
  initialScale: 1,
};

const NEARBY_CITIES = [
  "Wenatchee", "East Wenatchee", "Cashmere", "Leavenworth", "Chelan",
  "Quincy", "Waterville", "Entiat", "Malaga", "Monitor", "Sunnyslope",
];

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Store"],
  "@id": `${STORE.website}/#dispensary`,
  name: STORE.name,
  legalName: STORE.name,
  alternateName: ["Green Life", "Green Life Wenatchee"],
  description: `Licensed cannabis dispensary in ${STORE.address.city}, WA. Premium flower, pre-rolls, vapes, concentrates, edibles, tinctures and topicals from Washington-state producers. Cash only, 21+ with valid ID.`,
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
  areaServed: NEARBY_CITIES.map((name) => ({ "@type": "City", name, containedInPlace: { "@type": "State", name: "Washington" } })),
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
    "Cannabis flower", "Pre-rolls", "Cannabis concentrates", "Cannabis vapes",
    "Cannabis edibles", "Tinctures", "Topicals", "Terpenes", "Cannabinoids",
    "Indica", "Sativa", "Hybrid", "Washington State cannabis law",
  ],
  amenityFeature: STORE.amenities.map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
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
  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} h-full`}>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
          />
        </head>
        <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
          <AgeGate />
          <AnnouncementBar />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <ServiceWorkerRegister />
        </body>
      </html>
    </ClerkProvider>
  );
}
