import type { MetadataRoute } from "next";
import { STORE } from "@/lib/store";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /alumni is a gated soft-knock route for past staff. No SEO value
      // and we don't want it surfacing in search results — past staff get
      // the URL from Doug, not from Google. /account is user-specific.
      // /api, /dev, /devmenu are internal noise — keep them out of the
      // crawl budget so Google focuses on the brand-anchor pages.
      disallow: ["/alumni", "/account", "/api/", "/dev", "/devmenu", "/sign-in", "/sign-up"],
    },
    sitemap: `${STORE.website}/sitemap.xml`,
    host: STORE.website,
  };
}
