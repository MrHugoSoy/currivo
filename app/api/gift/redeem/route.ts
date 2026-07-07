import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder",
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  const { code, userId } = await req.json();
  if (!code || !userId) return NextResponse.json({ error: "Faltan datos." }, { status: 400 });

  const normalised = String(code).trim().toUpperCase();

  const { data: gift, error: fetchErr } = await supabaseAdmin
    .from("gift_codes")
    .select("id, is_used")
    .eq("code", normalised)
    .single();

  if (fetchErr || !gift) return NextResponse.json({ error: "Código no válido." }, { status: 404 });
  if (gift.is_used) return NextResponse.json({ error: "Este código ya fue canjeado." }, { status: 409 });

  const { data: profile } = await supabaseAdmin
    .from("profiles").select("is_pro, pro_plan").eq("user_id", userId).single();

  if (profile?.is_pro && profile.pro_plan !== "gift") {
    return NextResponse.json({ error: "Ya tienes un plan activo." }, { status: 409 });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const [{ error: markErr }, { error: profileErr }] = await Promise.all([
    supabaseAdmin.from("gift_codes").update({ is_used: true, used_by: userId, used_at: new Date().toISOString() }).eq("id", gift.id),
    supabaseAdmin.from("profiles").upsert({
      user_id: userId,
      is_pro: true,
      pro_plan: "gift",
      pro_expires_at: expiresAt.toISOString(),
      pro_activated_at: new Date().toISOString(),
    }, { onConflict: "user_id" }),
  ]);

  if (markErr || profileErr) return NextResponse.json({ error: "Error al canjear el código." }, { status: 500 });

  return NextResponse.json({ ok: true, expires_at: expiresAt.toISOString() });
}
