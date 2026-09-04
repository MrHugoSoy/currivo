import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail, sendProEmail } from "@/lib/emails";
import { welcomeEmailLimiter, getIP, isRateLimited } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { blocked, limit, remaining } = await isRateLimited(welcomeEmailLimiter, getIP(req));
    if (blocked) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta más tarde." },
        { status: 429, headers: { "X-RateLimit-Limit": limit.toString(), "X-RateLimit-Remaining": remaining.toString() } },
      );
    }

    const { email, nombre, type } = await req.json() as {
      email: string;
      nombre?: string;
      type: "register" | "pro";
    };

    if (!email || !type) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const name = nombre || email;

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
