"use client";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Suspense } from "react";

const PLANS = {
  pro: { label: "Pro", amount: "$99 MXN", period: "por mes", desc: "CVs ilimitados, todas las plantillas, carta de presentación IA y más." },
  lifetime: { label: "Lifetime", amount: "$399 MXN", period: "pago único", desc: "Todo lo de Pro para siempre, sin renovaciones." },
};

function PaymentContent() {
  const params = useSearchParams();
  const planKey = (params.get("plan") ?? "pro") as keyof typeof PLANS;
  const plan = PLANS[planKey] ?? PLANS.pro;

  return (
    <main style={{ minHeight: "calc(100vh - 62px)", paddingTop: 62, background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 480, width: "100%", padding: "0 24px" }}>
        <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 16, padding: "48px 40px", textAlign: "center" }}>
          <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--hint)", fontWeight: 500, marginBottom: 12 }}>
            Plan seleccionado
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 600, color: "var(--ink)", letterSpacing: "-1px", marginBottom: 4 }}>
            {plan.label}
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 600, color: "var(--green)", letterSpacing: "-2px", lineHeight: 1, marginBottom: 4 }}>
            {plan.amount}
          </div>
          <div style={{ fontSize: 12, color: "var(--hint)", marginBottom: 20 }}>{plan.period}</div>
          <p style={{ fontSize: 13, color: "var(--body)", lineHeight: 1.7, marginBottom: 36 }}>{plan.desc}</p>

          <div style={{ background: "var(--cream)", border: "1px dashed var(--border2)", borderRadius: 10, padding: "28px 24px", marginBottom: 32 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🚧</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>Pagos próximamente</div>
            <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
              Estamos integrando Stripe para procesar pagos de forma segura. Déjanos tu correo y te avisamos cuando esté listo.
            </p>
          </div>

          <form
            onSubmit={e => { e.preventDefault(); alert("¡Gracias! Te avisaremos cuando los pagos estén disponibles."); }}
            style={{ display: "flex", gap: 8 }}
          >
            <input
              type="email"
              placeholder="tu@correo.com"
              required
              style={{ flex: 1, padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 7, fontSize: 13, fontFamily: "inherit", background: "var(--paper)", color: "var(--ink)", outline: "none" }}
            />
            <button
              type="submit"
              style={{ background: "var(--green)", color: "#fff", border: "none", borderRadius: 7, padding: "10px 18px", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Avisar
            </button>
          </form>

          <a href="/" style={{ display: "block", marginTop: 24, fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>
            ← Volver al inicio
          </a>
        </div>
      </div>
    </main>
  );
}

export default function PagoPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<main style={{ minHeight: "calc(100vh - 62px)", paddingTop: 62 }} />}>
        <PaymentContent />
      </Suspense>
      <Footer />
    </>
  );
}
