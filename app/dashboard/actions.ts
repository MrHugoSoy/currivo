"use server";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function deleteCV(id: string) {
  const { error } = await supabase.from("cvs").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}
