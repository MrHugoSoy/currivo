import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

// Price IDs — crear estos en el dashboard de Stripe
// Stripe Dashboard → Products → Add product
export const STRIPE_PRICES = {
  // Plan fundador $49 MXN/mes
  pro_mxn_founder: process.env.STRIPE_PRICE_PRO_MXN_FOUNDER!,
  // Plan normal $99 MXN/mes  
  pro_mxn: process.env.STRIPE_PRICE_PRO_MXN!,
  // USA/Canadá $4.99 USD/mes
  pro_usd: process.env.STRIPE_PRICE_PRO_USD!,
  // Lifetime $399 MXN pago único
  lifetime_mxn: process.env.STRIPE_PRICE_LIFETIME_MXN!,
};
