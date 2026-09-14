import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail, sendProEmail } from "@/lib/emails";
import { welcomeEmailLimiter, getIP, isRateLimited } from "@/lib/ratelimit";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function getBearerToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  const match = header?.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

export async function POST(req: NextRequest) {
  try {
    const { blocked, limit, remaining } = await isRateLimited(welcomeEmailLimiter, getIP(req));
    if (blocked) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta más tarde." },
        { status: 429, headers: { "X-RateLimit-Limit": limit.toString(), "X-RateLimit-Remaining": remaining.toString() } },
      );
    }

    // Never trust a client-supplied email/nombre for who receives the email —
    // always derive the recipient from the caller's verified Supabase session,
    // otherwise this endpoint could be used to spam/phish arbitrary addresses
    // from the app's sending domain.
    const token = getBearerToken(req);
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { data, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !data.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const email = data.user.email;
    const name = (data.user.user_metadata?.username as string | undefined) || email;

    const { type } = await req.json() as { type?: "register" | "pro" };
    if (type !== "register" && type !== "pro") {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    if (type === "register") {
      await sendWelcomeEmail(email, name);
    } else {
      await sendProEmail(email, name);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Error enviando email" }, { status: 500 });
  }
}
