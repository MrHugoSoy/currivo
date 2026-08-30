"use server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getVerifiedUserId, requireAdmin } from "@/lib/authServer";

export async function deleteCV(id: string, accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const client = createClient(url, key, { auth: { persistSession: false } });

  const userId = await getVerifiedUserId(new Request("http://internal", { headers: { authorization: `Bearer ${accessToken}` } }), client);
  if (!(await requireAdmin(userId, client))) throw new Error("No autorizado");

  const { error } = await client.from("cvs").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/perfil");
}
