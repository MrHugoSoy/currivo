import type { MetadataRoute } from "next";
import { getAllGuias } from "@/lib/guias";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://resumika.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`,        lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/crear`,   lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/precios`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/carta`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/guias`,   lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
  ];

  const guias = getAllGuias();
  const guiaRoutes: MetadataRoute.Sitemap = guias.map((g) => ({
    url: `${base}/guias/${g.slug}`,
    lastModified: new Date(g.updatedAt ?? g.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  const catSeen = new Set<string>();
  const categoryRoutes: MetadataRoute.Sitemap = guias
    .filter((g) => { if (catSeen.has(g.category)) return false; catSeen.add(g.category); return true; })
    .map((g) => ({
      url: `${base}/guias/categoria/${g.category}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  return [...staticRoutes, ...guiaRoutes, ...categoryRoutes];
}
