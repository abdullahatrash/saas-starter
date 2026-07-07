import type { MetadataRoute } from "next";

const BASE_URL = "https://tattoostry.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/studio/", "/previews/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
