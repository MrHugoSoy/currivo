"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const PLANS = {
  pro: {
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
      "Descarga en PDF y Word",
      "CV adaptado por vacante",
      "Soporte prioritario",
    ],
    color: "#4a9060",
  },
  lifetime: {
    label: "Lifetime",
    badge: "Mejor valor",
    price: 399,
    period: " pago único",
    tagline: "Una vez, para siempre — sin renovaciones jamás",
    features: [
      "Todo lo de Pro incluido",
      "Acceso de por vida sin cargo adicional",
      "Futuras plantillas y funciones",
      "LinkedIn Optimizer",
      "Soporte VIP prioritario",
    ],
    color: "#2a5236",
  },
};

type PlanKey = keyof typeof PLANS;

function CheckoutContent() {
  const params = useSearchParams();
  const planKey = (params.get("plan") ?? "pro") as PlanKey;
  const plan = PLANS[planKey] ?? PLANS.pro;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setDone(true);
  }

  if (done) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--green-bg)", border: "1px solid rgba(45,90,61,.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 28 }}>
            ✓
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, color: "var(--ink)", letterSpacing: "-1px", marginBottom: 12 }}>
            ¡Solicitud recibida!
          </h2>
          <p style={{ fontSize: 14, color: "var(--body)", lineHeight: 1.75, marginBottom: 8 }}>
            Registramos tu interés en el plan <strong>{plan.label}</strong>.
          </p>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.75, marginBottom: 32 }}>
            Te contactaremos a <strong>{email}</strong> en menos de 24 h para completar tu suscripción y darte acceso inmediato.
          </p>
          <a href="/" style={{ display: "inline-block", background: "var(--green)", color: "#fff", textDecoration: "none", borderRadius: 8, padding: "12px 32px", fontSize: 14, fontWeight: 500 }}>
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Top bar */}
      <header style={{ background: "var(--paper)", borderBottom: "1px solid var(--border)", height: 56, display: "flex", alignItems: "center", padding: "0 64px", justifyContent: "space-between", flexShrink: 0 }}>
        <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, fontStyle: "italic", color: "var(--ink)", textDecoration: "none", letterSpacing: "-0.3px" }}>
          curr<span style={{ color: "var(--green)" }}>ivo</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
          <span style={{ color: "var(--green)", fontSize: 14 }}>🔒</span>
          Pago seguro con SSL
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>

        {/* Left — Plan summary */}
        <div style={{ width: "42%", flexShrink: 0, background: "var(--ink)", padding: "56px 64px", display: "flex", flexDirection: "column" }}>

          <div style={{ fontSize: 9, letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(255,255,255,.25)", fontWeight: 500, marginBottom: 28 }}>
            Resumen del plan
          </div>

          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(74,148,96,.2)", border: "1px solid rgba(74,148,96,.35)", borderRadius: 100, padding: "3px 12px", marginBottom: 20, width: "fit-content" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#7dd4a0", display: "inline-block" }} />
            <span style={{ fontSize: 10, color: "#7dd4a0", fontWeight: 600, letterSpacing: "0.5px" }}>{plan.badge}</span>
          </div>

          {/* Plan name */}
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 600, color: "#fff", letterSpacing: "-1px", lineHeight: 1, marginBottom: 6 }}>
            currivo {plan.label}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.45)", marginBottom: 32, lineHeight: 1.5 }}>
            {plan.tagline}
          </div>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 32 }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 56, fontWeight: 600, color: "#7dd4a0", letterSpacing: "-2px", lineHeight: 1 }}>
              ${plan.price}
            </span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,.35)" }}>MXN{plan.period}</span>
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,.08)", marginBottom: 28 }} />

          {/* Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: "auto" }}>
            {plan.features.map(f => (
              <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "#7dd4a0", fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,.7)", lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>

          {/* Trust */}
          <div style={{ marginTop: 48, display: "flex", gap: 20, flexWrap: "wrap" }}>
            {["🔒 SSL seguro", "🇲🇽 Precios en MXN", "↩ Cancela cuando quieras"].map(t => (
              <span key={t} style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Right — Checkout form */}
        <div style={{ flex: 1, background: "var(--cream)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "56px 64px", overflowY: "auto" }}>
          <div style={{ width: "100%", maxWidth: 440 }}>

            <div style={{ fontSize: 9, letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--hint)", fontWeight: 500, marginBottom: 28 }}>
              Completa tu suscripción
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Name */}
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 6, fontWeight: 500 }}>
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Tu nombre"
                  style={{ width: "100%", padding: "11px 14px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, fontFamily: "inherit", background: "var(--paper)", color: "var(--ink)", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 6, fontWeight: 500 }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="tu@correo.com"
                  style={{ width: "100%", padding: "11px 14px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, fontFamily: "inherit", background: "var(--paper)", color: "var(--ink)", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* Card placeholder — ready for Stripe Elements */}
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 6, fontWeight: 500 }}>
                  Datos de tarjeta
                </label>
                <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", background: "var(--paper)" }}>
                  <div style={{ padding: "11px 14px", borderBottom: "1px solid var(--border)", fontSize: 13, color: "var(--hint)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>💳</span>
                    <span>Número de tarjeta</span>
                    <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                      {["VISA", "MC"].map(b => (
                        <span key={b} style={{ fontSize: 9, fontWeight: 700, color: "var(--hint)", border: "1px solid var(--border)", borderRadius: 3, padding: "1px 5px" }}>{b}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex" }}>
                    <div style={{ flex: 1, padding: "11px 14px", borderRight: "1px solid var(--border)", fontSize: 13, color: "var(--hint)" }}>MM / AA</div>
                    <div style={{ width: 80, padding: "11px 14px", fontSize: 13, color: "var(--hint)" }}>CVV</div>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: "var(--hint)", marginTop: 8, lineHeight: 1.5 }}>
                  Integración con Stripe en configuración. Al enviar, un asesor te contactará para completar el pago de forma segura.
                </p>
              </div>

              {/* Order summary */}
              <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "var(--body)" }}>currivo {plan.label}</span>
                  <span style={{ fontSize: 13, color: "var(--body)" }}>${plan.price} MXN</span>
                </div>
                {planKey === "pro" && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>Renovación automática</span>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>mensual</span>
                  </div>
                )}
                <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>Total hoy</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "var(--green)", letterSpacing: "-0.5px" }}>
                    ${plan.price} MXN
                  </span>
                </div>
              </div>

              {/* CTA */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? "rgba(42,82,54,.6)" : "var(--green)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "14px",
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "background .2s",
                }}
              >
                {loading ? (
                  <>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", animation: "spin .65s linear infinite", display: "inline-block" }} />
                    Procesando...
                  </>
                ) : (
                  <>Reservar mi lugar en {plan.label} →</>
                )}
              </button>

              <p style={{ fontSize: 11, color: "var(--hint)", textAlign: "center", lineHeight: 1.6 }}>
                🔒 Tus datos están protegidos con cifrado SSL.{" "}
                {planKey === "pro" ? "Cancela en cualquier momento sin penalización." : "Pago único, sin renovaciones."}
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
