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
      disallow: ["/alumni", "/account"],
    },
    sitemap: `${STORE.website}/sitemap.xml`,
    host: STORE.website,
  };
}
