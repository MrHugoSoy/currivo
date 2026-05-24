"use client";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const PLANS = {
  pro_mxn_founder: {
    label: "Pro — Precio Fundador",
    badge: "🚀 Oferta de lanzamiento",
    price: 49,
    originalPrice: 99,
    period: "/mes",
    tagline: "Precio especial solo durante el lanzamiento",
    features: [
      "CVs ilimitados para México, USA y Canadá",
      "Todas las plantillas (incluidas premium)",
      "Carta de presentación con IA",
      "Edición en línea sin límites",
      "Descarga en PDF",
      "CV adaptado por vacante",
      "Soporte prioritario",
    ],
    color: "#4a9060",
    isFounder: true,
  },
  pro_mxn: {
    label: "Pro",
    badge: "Más popular",
    price: 99,
    period: "/mes",
    tagline: "Para profesionistas que quieren destacar",
    features: [
      "CVs ilimitados para México, USA y Canadá",
      "Todas las plantillas (incluidas premium)",
      "Carta de presentación con IA",
      "Edición en línea sin límites",
      "Descarga en PDF",
      "CV adaptado por vacante",
      "Soporte prioritario",
    ],
    color: "#4a9060",
    isFounder: false,
  },
  pro_usd: {
    label: "Pro",
    badge: "USA & Canada",
    price: 4.99,
    period: "/month",
    tagline: "For professionals in USA and Canada",
    features: [
      "Unlimited CVs for Mexico, USA and Canada",
      "All templates (including premium)",
      "AI Cover Letter",
      "Unlimited online editing",
      "PDF Download",
      "Job-specific CV optimizer",
      "Priority support",
    ],
    color: "#4a9060",
    isFounder: false,
  },
  lifetime_mxn: {
    label: "Lifetime",
    badge: "Mejor valor",
    price: 399,
    period: " pago único",
    tagline: "Una vez, para siempre — sin renovaciones jamás",
    features: [
      "Todo lo de Pro incluido",
      "Acceso de por vida sin cargo adicional",
      "Futuras plantillas y funciones",
      "Carta de presentación con IA",
      "Soporte VIP prioritario",
    ],
    color: "#2a5236",
    isFounder: false,
  },
};

type PlanKey = keyof typeof PLANS;
const currency = (plan: PlanKey) => plan === "pro_usd" ? "USD" : "MXN";

function CheckoutContent() {
  const params = useSearchParams();
  const planKey = (params.get("plan") ?? "pro_mxn_founder") as PlanKey;
  const plan = PLANS[planKey] ?? PLANS.pro_mxn_founder;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        setEmail(user.email ?? "");
        setUserId(user.id);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError("Por favor ingresa tu correo electrónico."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, email, userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear sesión de pago");
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  }

  const curr = currency(planKey);
  const isEn = planKey === "pro_usd";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .pago-body { flex-direction: column !important; }
          .pago-left { width: 100% !important; padding: 32px 24px !important; }
          .pago-right { padding: 32px 24px !important; }
        }
      `}</style>

      {/* Top bar */}
      <header style={{ background: "var(--paper)", borderBottom: "1px solid var(--border)", height: 56, display: "flex", alignItems: "center", padding: "0 32px", justifyContent: "space-between", flexShrink: 0 }}>
        <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, fontStyle: "italic", color: "var(--ink)", textDecoration: "none", letterSpacing: "-0.3px" }}>
          resumi<span style={{ color: "var(--green)" }}>ka</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
          <span style={{ color: "var(--green)", fontSize: 14 }}>🔒</span>
          Pago seguro con Stripe
        </div>
      </header>

      {/* Body */}
      <div className="pago-body" style={{ flex: 1, display: "flex", minHeight: 0 }}>

        {/* Left — Plan summary */}
        <div className="pago-left" style={{ width: "42%", flexShrink: 0, background: "var(--ink)", padding: "56px 64px", display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 9, letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(255,255,255,.25)", fontWeight: 500, marginBottom: 28 }}>
            Resumen del plan
          </div>

          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(74,148,96,.2)", border: "1px solid rgba(74,148,96,.35)", borderRadius: 100, padding: "3px 12px", marginBottom: 20, width: "fit-content" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#7dd4a0", display: "inline-block" }} />
            <span style={{ fontSize: 10, color: "#7dd4a0", fontWeight: 600, letterSpacing: "0.5px" }}>{plan.badge}</span>
          </div>

          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 600, color: "#fff", letterSpacing: "-1px", lineHeight: 1, marginBottom: 6 }}>
            resumika {plan.label}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.45)", marginBottom: 28, lineHeight: 1.5 }}>
            {plan.tagline}
          </div>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
            {"originalPrice" in plan && plan.originalPrice && (
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "rgba(255,255,255,.25)", textDecoration: "line-through", letterSpacing: "-1px" }}>
                ${plan.originalPrice}
              </span>
            )}
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 56, fontWeight: 600, color: "#7dd4a0", letterSpacing: "-2px", lineHeight: 1 }}>
              ${plan.price}
            </span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>{curr}{plan.period}</span>
          </div>

          {"isFounder" in plan && plan.isFounder && (
            <div style={{ fontSize: 11, color: "#7dd4a0", background: "rgba(74,148,96,.12)", border: "1px solid rgba(74,148,96,.25)", borderRadius: 5, padding: "5px 10px", marginBottom: 24, display: "inline-block" }}>
              ⏳ Precio de fundador — disponible por tiempo limitado
            </div>
          )}

          <div style={{ height: 1, background: "rgba(255,255,255,.08)", marginBottom: 24 }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: "auto" }}>
            {plan.features.map(f => (
              <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "#7dd4a0", fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,.7)", lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48, display: "flex", gap: 20, flexWrap: "wrap" }}>
            {["🔒 SSL seguro", "💳 Stripe", isEn ? "↩ Cancel anytime" : "↩ Cancela cuando quieras"].map(t => (
              <span key={t} style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Right — Checkout */}
        <div className="pago-right" style={{ flex: 1, background: "var(--cream)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "56px 64px", overflowY: "auto" }}>
          <div style={{ width: "100%", maxWidth: 440 }}>
            <div style={{ fontSize: 9, letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--hint)", fontWeight: 500, marginBottom: 28 }}>
              {isEn ? "Complete your subscription" : "Completa tu suscripción"}
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 6, fontWeight: 500 }}>
                  {isEn ? "Email address" : "Correo electrónico"}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder={isEn ? "your@email.com" : "tu@correo.com"}
                  style={{ width: "100%", padding: "11px 14px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, fontFamily: "inherit", background: "var(--paper)", color: "var(--ink)", outline: "none", boxSizing: "border-box" }}
                />
                <p style={{ fontSize: 11, color: "var(--hint)", marginTop: 5 }}>
                  {isEn ? "You'll be redirected to Stripe to enter your card details securely." : "Serás redirigido a Stripe para ingresar tus datos de tarjeta de forma segura."}
                </p>
              </div>

              {/* Order summary */}
              <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: planKey !== "lifetime_mxn" ? 8 : 0 }}>
                  <span style={{ fontSize: 13, color: "var(--body)" }}>resumika {plan.label}</span>
                  <span style={{ fontSize: 13, color: "var(--body)" }}>${plan.price} {curr}</span>
                </div>
                {planKey !== "lifetime_mxn" && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>{isEn ? "Auto-renewal" : "Renovación automática"}</span>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>{isEn ? "monthly" : "mensual"}</span>
                  </div>
                )}
                <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{isEn ? "Total today" : "Total hoy"}</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "var(--green)", letterSpacing: "-0.5px" }}>
                    ${plan.price} {curr}
                  </span>
                </div>
              </div>

              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#b91c1c" }}>
                  {error}
                </div>
              )}

              {/* CTA */}
              <button type="submit" disabled={loading}
                style={{ background: loading ? "rgba(42,82,54,.6)" : "var(--green)", color: "#fff", border: "none", borderRadius: 8, padding: "14px", fontSize: 14, fontWeight: 500, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background .2s" }}>
                {loading ? (
                  <>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", animation: "spin .65s linear infinite", display: "inline-block" }} />
                    {isEn ? "Redirecting to Stripe..." : "Redirigiendo a Stripe..."}
                  </>
                ) : (
                  <>{isEn ? `Subscribe to ${plan.label} →` : `Suscribirme a ${plan.label} →`}</>
                )}
              </button>

              {/* Stripe badge */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: "var(--hint)" }}>Pago procesado por</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#635bff" }}>stripe</span>
                <span style={{ fontSize: 11, color: "var(--hint)" }}>— cifrado SSL</span>
              </div>

              <p style={{ fontSize: 11, color: "var(--hint)", textAlign: "center", lineHeight: 1.6 }}>
                {planKey === "lifetime_mxn"
                  ? "Pago único, sin renovaciones. Acceso de por vida garantizado."
                  : isEn ? "Cancel anytime, no questions asked." : "Cancela en cualquier momento sin penalización."}
              </p>
            </form>

            <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--border)", display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/#precios" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>← Ver todos los planes</a>
              <a href="/crear" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>Probar gratis primero</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PagoPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid var(--border)", borderTopColor: "var(--green)", animation: "spin .65s linear infinite" }} />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
