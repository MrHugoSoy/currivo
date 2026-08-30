import type { SupabaseClient } from "@supabase/supabase-js";

function getBearerToken(req: Request): string | null {
  const header = req.headers.get("authorization");
  const match = header?.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

// Verifies the Supabase access token against Supabase Auth and returns the real user id.
// Never trust a client-supplied userId field for authorization decisions — use this instead.
export async function getVerifiedUserId(req: Request, admin: SupabaseClient): Promise<string | null> {
  const token = getBearerToken(req);
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

export async function requireAdmin(userId: string | null, admin: SupabaseClient): Promise<boolean> {
  if (!userId) return false;
  const { data } = await admin.from("profiles").select("is_admin").eq("user_id", userId).single();
  return !!data?.is_admin;
}
