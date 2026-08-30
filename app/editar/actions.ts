"use server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getVerifiedUserId } from "@/lib/authServer";

export async function saveCVText(slug: string, cvText: string, accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const client = createClient(url, key, { auth: { persistSession: false } });

  const userId = await getVerifiedUserId(new Request("http://internal", { headers: { authorization: `Bearer ${accessToken}` } }), client);
  if (!userId) throw new Error("No autorizado");

  const { data: existing } = await client.from("cvs").select("user_id").eq("slug", slug).single();
  if (!existing || existing.user_id !== userId) throw new Error("No autorizado");

  const { error } = await client.from("cvs").update({ cv_text: cvText }).eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath(`/cv/${slug}`);
  revalidatePath("/dashboard");
  revalidatePath("/perfil");
}
