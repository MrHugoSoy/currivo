import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getVerifiedUserId, requireAdmin } from "@/lib/authServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

type SubAlert = {
  email: string;
  name: string | null;
  subscriptions: { id: string; plan: string | null; created: string }[];
};

export async function GET(req: NextRequest) {
  const userId = await getVerifiedUserId(req, supabaseAdmin);
  if (!(await requireAdmin(userId, supabaseAdmin))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const byEmail = new Map<string, SubAlert>();

    for await (const sub of stripe.subscriptions.list({ status: "active", limit: 100, expand: ["data.customer"] })) {
      const customer = sub.customer as Stripe.Customer | Stripe.DeletedCustomer;
      if (!customer || customer.deleted || !customer.email) continue;

      const email = customer.email.toLowerCase();
      const entry = byEmail.get(email) ?? { email, name: customer.name ?? null, subscriptions: [] };
      entry.subscriptions.push({
        id: sub.id,
        plan: (sub.metadata?.plan as string | undefined) ?? null,
        created: new Date(sub.created * 1000).toISOString(),
      });
      byEmail.set(email, entry);
    }

    const alerts = Array.from(byEmail.values())
      .filter(e => e.subscriptions.length > 1)
      .sort((a, b) => b.subscriptions.length - a.subscriptions.length);

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Subscription alerts error:", error);
    return NextResponse.json({ error: "No se pudieron cargar las alertas." }, { status: 500 });
  }
}
