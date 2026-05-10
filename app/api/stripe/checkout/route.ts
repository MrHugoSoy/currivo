import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_PRICES } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type PlanKey = "pro_mxn_founder" | "pro_mxn" | "pro_usd" | "lifetime_mxn";

export async function POST(req: NextRequest) {
  try {
    const { plan, email, userId } = await req.json() as {
      plan: PlanKey;
      email: string;
      userId?: string;
    };

    if (!plan || !email) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

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
