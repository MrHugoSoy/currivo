import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://resumika.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`,       lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/crear`,  lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/pago`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/precios`,lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  const { data: cvs } = await supabase
    .from("cvs")
    .select("slug, created_at")
    .order("created_at", { ascending: false })
    .limit(1000);

  const cvRoutes: MetadataRoute.Sitemap = (cvs ?? []).map(cv => ({
    url: `${base}/cv/${cv.slug}`,
    lastModified: new Date(cv.created_at),
    changeFrequency: "never",
    priority: 0.5,
  }));

  return [...staticRoutes, ...cvRoutes];
}
