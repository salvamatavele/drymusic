import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stream.7spes.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/login", "/watch/"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
