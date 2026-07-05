import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder",
  { auth: { persistSession: false } }
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://resumika.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`,        lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/crear`,   lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/precios`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/carta`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  const { data: cvs } = await supabaseAdmin
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
