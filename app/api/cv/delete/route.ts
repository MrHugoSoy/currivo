import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getVerifiedUserId } from "@/lib/authServer";

export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder",
  { auth: { persistSession: false } }
);

export async function DELETE(req: NextRequest) {
  try {
    const verifiedUserId = await getVerifiedUserId(req, supabaseAdmin);
    if (!verifiedUserId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

    const { data: existing } = await supabaseAdmin.from("cvs").select("user_id").eq("id", id).single();
    if (!existing || existing.user_id !== verifiedUserId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { error } = await supabaseAdmin.from("cvs").delete().eq("id", id);
    if (error) {
      console.error("CV delete error:", error);
      return NextResponse.json({ error: "No se pudo eliminar el CV." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("CV delete error:", e);
    return NextResponse.json({ error: "No se pudo eliminar el CV." }, { status: 500 });
  }
}
