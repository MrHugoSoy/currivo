import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getVerifiedUserId, requireAdmin } from "@/lib/authServer";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder",
  { auth: { persistSession: false } }
);

export async function GET(req: NextRequest) {
  const userId = await getVerifiedUserId(req, supabaseAdmin);
  if (!(await requireAdmin(userId, supabaseAdmin))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("id, user_id, nombre, puesto, mercado, stars, text, approved, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reviews: data });
}

export async function POST(req: NextRequest) {
  const userId = await getVerifiedUserId(req, supabaseAdmin);
  if (!(await requireAdmin(userId, supabaseAdmin))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, action } = await req.json();
  if (!id || !["approve", "reject"].includes(action)) return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });

  if (action === "approve") {
    const { error } = await supabaseAdmin.from("reviews").update({ approved: true }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabaseAdmin.from("reviews").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
