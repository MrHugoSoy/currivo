import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

// Use service role key for webhook — can bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function activatePro(email: string, userId: string, plan: string, customerId: string, subscriptionId?: string, expiresAt?: Date) {
  // Update by userId if available, fallback to email
  const update = {
    is_pro: true,
    pro_plan: plan,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId ?? null,
    pro_expires_at: expiresAt ? expiresAt.toISOString() : null,
    pro_activated_at: new Date().toISOString(),
  };

  if (userId) {
    await supabaseAdmin.from("profiles").upsert({ user_id: userId, ...update });
  } else if (email) {
    await supabaseAdmin.from("profiles").upsert({ email, ...update });
  }
}

async function deactivatePro(customerId: string) {
  await supabaseAdmin
    .from("profiles")
    .update({ is_pro: false, pro_expires_at: new Date().toISOString() })
    .eq("stripe_customer_id", customerId);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {

      // ── Pago único completado (lifetime) ──
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "payment" && session.payment_status === "paid") {
          const { userId, email, plan } = session.metadata ?? {};
          await activatePro(
            email ?? session.customer_email ?? "",
            userId ?? "",
            plan ?? "lifetime_mxn",
            session.customer as string,
            undefined,
            undefined // lifetime = no expiry
          );
        }
        break;
      }

      // ── Suscripción activada ──
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        if (sub.status === "active" || sub.status === "trialing") {
          const { userId, email, plan } = sub.metadata ?? {};
          const periodEnd = sub.items.data[0]?.current_period_end ?? 0;
          const expiresAt = new Date(periodEnd * 1000);
          await activatePro(
            email ?? "",
            userId ?? "",
            plan ?? "pro_mxn",
            sub.customer as string,
            sub.id,
            expiresAt
          );
        }
        break;
      }

      // ── Suscripción cancelada o fallida ──
      case "customer.subscription.deleted":
      case "invoice.payment_failed": {
        const obj = event.data.object as { customer: string };
        await deactivatePro(obj.customer as string);
        break;
      }

      // ── Renovación exitosa ──
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subRef = invoice.parent?.subscription_details?.subscription;
        const subId = typeof subRef === "string" ? subRef : subRef?.id;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          if (sub.status === "active") {
            const { userId, email, plan } = sub.metadata ?? {};
            const periodEnd = sub.items.data[0]?.current_period_end ?? 0;
            const expiresAt = new Date(periodEnd * 1000);
            await activatePro(
              email ?? "",
              userId ?? "",
              plan ?? "pro_mxn",
              sub.customer as string,
              sub.id,
              expiresAt
            );
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
