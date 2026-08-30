import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getVerifiedUserId } from "@/lib/authServer";

export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder",
  { auth: { persistSession: false } }
);

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Falta slug" }, { status: 400 });

  const userId = await getVerifiedUserId(req, supabaseAdmin);
  if (!userId) return NextResponse.json({ isOwner: false });

  const { data } = await supabaseAdmin.from("cvs").select("user_id").eq("slug", slug).single();
  return NextResponse.json({ isOwner: !!data && data.user_id === userId });
}
