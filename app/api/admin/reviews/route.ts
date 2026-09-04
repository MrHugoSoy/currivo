import { NextRequest, NextResponse } from "next/server";
import { getVerifiedUserId, requireAdmin } from "@/lib/authServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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
