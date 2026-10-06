import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Guest checkouts store the Pro plan on a profile keyed only by email
// (user_id is null). When that person later signs in, link the profile to
// their account. Only done for a *confirmed* email, otherwise anyone could
// sign up with a stranger's address and take over their paid plan.
export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  const user = data.user;
  if (error || !user?.email) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!user.email_confirmed_at) return NextResponse.json({ claimed: false });

  // Compared in JS, not with ilike: "_" and "%" in an email would act as
  // wildcards and could match someone else's address.
  const email = user.email.toLowerCase();
  const { data: orphans } = await supabaseAdmin
    .from("profiles")
    .select("id, email")
    .is("user_id", null)
    .not("email", "is", null);

  const matches = (orphans ?? []).filter(p => p.email?.toLowerCase() === email);
  let claimed = 0;
  for (const p of matches) {
    const { error: updErr } = await supabaseAdmin
      .from("profiles")
      .update({ user_id: user.id })
      .eq("id", p.id)
      .is("user_id", null);
    if (!updErr) claimed++;
  }

  return NextResponse.json({ claimed: claimed > 0 });
}
