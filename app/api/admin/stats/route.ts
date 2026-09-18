import { NextRequest, NextResponse } from "next/server";
import { getVerifiedUserId, requireAdmin } from "@/lib/authServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const userId = await getVerifiedUserId(req, supabaseAdmin);
  if (!(await requireAdmin(userId, supabaseAdmin))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: cvsData, error } = await supabaseAdmin
    .from("cvs")
    .select("id, slug, nombre, puesto, mercado, template, created_at, user_id")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const uniqueUsers = new Set(cvsData.map(c => c.user_id)).size;
  const byTemplate: Record<string, number> = {};
  const byMarket: Record<string, number> = {};
  for (const cv of cvsData) {
    const t = cv.template ?? "unknown";
    const m = cv.mercado ?? "unknown";
    byTemplate[t] = (byTemplate[t] ?? 0) + 1;
    byMarket[m] = (byMarket[m] ?? 0) + 1;
  }

  const [
    { count: proCount },
    { count: giftCount },
    { count: giftTotal },
    { count: giftUsed },
  ] = await Promise.all([
    supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).eq("is_pro", true).neq("pro_plan", "gift"),
    supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).eq("is_pro", true).eq("pro_plan", "gift"),
    supabaseAdmin.from("gift_codes").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("gift_codes").select("*", { count: "exact", head: true }).eq("is_used", true),
  ]);

  return NextResponse.json({
    cvs: cvsData,
    stats: {
      totalCvs: cvsData.length,
      uniqueUsers,
      proUsers: proCount ?? 0,
      giftUsers: giftCount ?? 0,
      byTemplate,
      byMarket,
      giftTotal: giftTotal ?? 0,
      giftUsed: giftUsed ?? 0,
    },
  });
}
