import type { SupabaseClient } from "@supabase/supabase-js";

interface ProProfile {
  is_pro: boolean | null;
  pro_plan: string | null;
  pro_expires_at: string | null;
}

export async function checkActivePro(supabaseAdmin: SupabaseClient, userId: string): Promise<{ isActivePro: boolean; profile: ProProfile | null }> {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("is_pro, pro_plan, pro_expires_at")
    .eq("user_id", userId)
    .single();

  const isExpiredGift = !!profile?.is_pro && profile.pro_plan === "gift" &&
    !!profile.pro_expires_at && new Date(profile.pro_expires_at) <= new Date();

  if (isExpiredGift) {
    await supabaseAdmin.from("profiles").update({ is_pro: false }).eq("user_id", userId);
  }

  return { isActivePro: !!profile?.is_pro && !isExpiredGift, profile };
}
