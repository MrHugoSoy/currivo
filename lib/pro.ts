export function isEffectivelyPro(profile: { is_pro?: boolean; pro_plan?: string | null; pro_expires_at?: string | null } | null | undefined): boolean {
  if (!profile?.is_pro) return false;
  if (profile.pro_plan === "gift" && profile.pro_expires_at && new Date(profile.pro_expires_at) <= new Date()) return false;
  return true;
}
