import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/guias"],
      disallow: ["/perfil", "/dashboard", "/api", "/editar", "/pago"],
    },
    sitemap: "https://resumika.com/sitemap.xml",
  };
}
