import Stripe from "stripe";

export const STRIPE_PRICES = {
  pro_mxn_founder: process.env.STRIPE_PRICE_PRO_MXN_FOUNDER!,
  pro_mxn: process.env.STRIPE_PRICE_PRO_MXN!,
  pro_usd: process.env.STRIPE_PRICE_PRO_USD!,
  lifetime_mxn: process.env.STRIPE_PRICE_LIFETIME_MXN!,
};

// Lazy singleton — evita que Stripe lance error durante el build
// cuando STRIPE_SECRET_KEY no está disponible en tiempo de compilación
let _stripe: Stripe | null = null;

function getInstance(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-04-22.dahlia",
    });
  }
  return _stripe;
}

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop: string | symbol) {
    return getInstance()[prop as keyof Stripe];
  },
});
