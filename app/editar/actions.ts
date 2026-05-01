"use server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function saveCVText(slug: string, cvText: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const client = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await client.from("cvs").update({ cv_text: cvText }).eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath(`/cv/${slug}`);
  revalidatePath("/dashboard");
  revalidatePath("/perfil");
}
