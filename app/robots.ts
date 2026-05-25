import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/perfil", "/api", "/dashboard"],
    },
    sitemap: "https://resumika.com/sitemap.xml",
  };
}
