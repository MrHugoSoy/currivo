import { NextRequest, NextResponse } from "next/server";
import { getVerifiedUserId, requireAdmin } from "@/lib/authServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizeFormData } from "@/lib/formData";

export const dynamic = "force-dynamic";

// The raw form_data holds things the public CV page never shows (the job
// posting the person is applying to, the original photo...), so it's only
// returned to the CV's owner (or an admin).
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Falta slug" }, { status: 400 });

  const userId = await getVerifiedUserId(req, supabaseAdmin);
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data } = await supabaseAdmin
    .from("cvs")
    .select("user_id, form_data")
    .eq("slug", slug)
    .single();
  if (!data) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  if (data.user_id !== userId && !(await requireAdmin(userId, supabaseAdmin))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  return NextResponse.json({ formData: data.form_data ? normalizeFormData(data.form_data) : null });
}
