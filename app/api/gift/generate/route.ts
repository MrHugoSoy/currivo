import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder",
  { auth: { persistSession: false } }
);

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(): string {
  const seg = (n: number) =>
    Array.from({ length: n }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");
  return `RSMK-${seg(4)}-${seg(4)}`;
}

export async function POST(req: NextRequest) {
  const { userId, count = 1 } = await req.json();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from("profiles").select("is_admin").eq("user_id", userId).single();
  if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const n = Math.min(Math.max(1, Number(count)), 50);
  const codes = Array.from({ length: n }, () => ({ code: randomCode() }));
  const { data, error } = await supabaseAdmin.from("gift_codes").insert(codes).select("id, code, created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ codes: data });
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from("profiles").select("is_admin").eq("user_id", userId).single();
  if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from("gift_codes")
    .select("id, code, is_used, used_at, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ codes: data });
}
