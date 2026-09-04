import { NextRequest, NextResponse } from "next/server";
import { getVerifiedUserId, requireAdmin } from "@/lib/authServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(): string {
  const seg = (n: number) =>
    Array.from({ length: n }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");
  return `RSMK-${seg(4)}-${seg(4)}`;
}

export async function POST(req: NextRequest) {
  const userId = await getVerifiedUserId(req, supabaseAdmin);
  if (!(await requireAdmin(userId, supabaseAdmin))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { count = 1, months = 1 } = await req.json();

  const validMonths = [1, 3, 6].includes(Number(months)) ? Number(months) : 1;
  const n = Math.min(Math.max(1, Number(count)), 50);
  const codes = Array.from({ length: n }, () => ({ code: randomCode(), months: validMonths }));
  const { data, error } = await supabaseAdmin.from("gift_codes").insert(codes).select("id, code, months, created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ codes: data });
}

export async function GET(req: NextRequest) {
  const userId = await getVerifiedUserId(req, supabaseAdmin);
  if (!(await requireAdmin(userId, supabaseAdmin))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from("gift_codes")
    .select("id, code, months, is_used, used_at, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ codes: data });
}
