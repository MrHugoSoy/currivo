import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_PRICES } from "@/lib/stripe";
import { checkoutLimiter, getIP, isRateLimited } from "@/lib/ratelimit";
import { getVerifiedUserId } from "@/lib/authServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type PlanKey = "pro_mxn_founder" | "pro_mxn" | "pro_usd" | "lifetime_mxn";

export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting ──
    const { blocked, limit, remaining } = await isRateLimited(checkoutLimiter, getIP(req));
    if (blocked) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Espera un momento e intenta de nuevo." },
        { status: 429, headers: { "X-RateLimit-Limit": limit.toString(), "X-RateLimit-Remaining": remaining.toString() } },
      );
    }

    const { plan, email } = await req.json() as {
      plan: PlanKey;
      email: string;
    };

    if (!plan || !email) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    // Never trust a client-supplied userId for granting Pro — derive it from
    // the caller's verified session, if any (guest checkout is still allowed;
    // the webhook falls back to matching by email in that case).
    const userId = await getVerifiedUserId(req, supabaseAdmin);

    const priceId = STRIPE_PRICES[plan];
    if (!priceId) {
      return NextResponse.json({ error: "Plan no válido" }, { status: 400 });
    }

    const isLifetime = plan === "lifetime_mxn";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://currivo.vercel.app";

    // Build Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: isLifetime ? "payment" : "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/pago/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pago?plan=${plan}`,
      metadata: {
        userId: userId ?? "",
        plan,
        email,
      },
      // Allow promo codes
      allow_promotion_codes: true,
      // Subscription data
      ...(isLifetime ? {} : {
        subscription_data: {
          metadata: { userId: userId ?? "", plan, email },
        },
      }),
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Error creando sesión de pago" }, { status: 500 });
  }
}
