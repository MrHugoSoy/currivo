"use client";
import { SectionLabel } from "./HowItWorks";

const plans = [
  {
    label: "Gratis",
    amount: "$0",
    period: "siempre gratis",
    feats: [["✓","1 CV generado"],["✓","2 plantillas básicas"],["✓","Descarga PDF"],["—","Edición ilimitada"],["—","Plantillas premium"],["—","Carta de presentación"]],
    cta: "Comenzar gratis",
    featured: false,
    href: "/crear",
  },
  {
    label: "Pro",
    badge: "Más popular",
    amount: "$99",
    period: "MXN por mes",
    feats: [["✓","CVs ilimitados"],["✓","Todas las plantillas"],["✓","Carta de presentación IA"],["✓","Edición en línea"],["✓","PDF + Word"],["✓","CV adaptado por vacante"]],
    cta: "Suscribirme →",
    featured: true,
    href: "/pago?plan=pro",
  },
  {
    label: "Lifetime",
    amount: "$399",
    period: "pago único · para siempre",
    feats: [["✓","Todo lo de Pro"],["✓","Acceso de por vida"],["✓","Futuras plantillas"],["✓","LinkedIn Optimizer"],["✓","Soporte prioritario"],["✓","Sin renovaciones"]],
    cta: "Comprar ahora",
    featured: false,
    href: "/pago?plan=lifetime",
  },
];

export default function Pricing() {
  return (
    <section id="precios" style={{ padding: "96px 0", background: "var(--cream)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px" }}>
        <SectionLabel>Precios</SectionLabel>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "end", marginBottom: 56 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(34px, 3.8vw, 52px)", fontWeight: 600, color: "var(--ink)", letterSpacing: "-1.2px", lineHeight: 1.08 }}>
            Invierte en<br />
            <em style={{ color: "var(--green)", fontStyle: "italic" }}>tu carrera</em>
          </h2>
          <p style={{ fontSize: 15, color: "var(--body)", lineHeight: 1.75, paddingBottom: 4 }}>
            Empieza gratis y escala cuando lo necesites. Sin contratos ni sorpresas — cancela cuando quieras.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {plans.map(p => <PlanCard key={p.label} plan={p} />)}
        </div>
      </div>
    </section>
  );
}

function PlanCard({ plan: p }: { plan: typeof plans[0] }) {
  return (
    <div
      style={{
        background: p.featured ? "var(--green)" : "var(--paper)",
        borderRadius: 12,
        padding: p.featured ? "36px 30px 32px" : "32px 30px",
        border: p.featured ? "none" : "1px solid var(--border)",
        boxShadow: p.featured ? "0 20px 60px rgba(45,90,61,.28)" : "none",
        transform: p.featured ? "translateY(-8px)" : "none",
        transition: "transform .2s, box-shadow .2s",
        position: "relative",
      }}
      onMouseEnter={e => { if (!p.featured) { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,.07)"; } }}
      onMouseLeave={e => { if (!p.featured) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; } }}
    >
      {"badge" in p && p.badge && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.18)", borderRadius: 100, padding: "3px 10px", marginBottom: 14 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#a3e4bc", display: "inline-block" }} />
          <span style={{ fontSize: 10, color: "#fff", fontWeight: 600, letterSpacing: "0.5px" }}>{p.badge}</span>
        </div>
      )}

      <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: p.featured ? "rgba(255,255,255,.5)" : "var(--hint)", fontWeight: 500, marginBottom: 8 }}>
        {p.label}
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 600, letterSpacing: "-2px", color: p.featured ? "#fff" : "var(--ink)", lineHeight: 1, margin: "12px 0 4px" }}>
        {p.amount}
      </div>
      <div style={{ fontSize: 11, color: p.featured ? "rgba(255,255,255,.5)" : "var(--hint)" }}>{p.period}</div>

      <hr style={{ border: "none", borderTop: `1px solid ${p.featured ? "rgba(255,255,255,.15)" : "var(--border)"}`, margin: "22px 0" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {p.feats.map(([icon, text]) => (
          <div key={text} style={{ fontSize: 12, color: p.featured ? "rgba(255,255,255,.8)" : "var(--body)", padding: "5px 0", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ color: icon === "✓" ? (p.featured ? "#a3e4bc" : "var(--green-mid)") : "var(--border2)", fontSize: 11, flexShrink: 0 }}>{icon}</span>
            <span style={{ opacity: icon === "—" ? 0.45 : 1 }}>{text}</span>
          </div>
        ))}
      </div>

      <a
        href={p.href}
        style={{
          display: "block", width: "100%", marginTop: 24, borderRadius: 7, padding: "12px 0", fontSize: 13,
          fontWeight: p.featured ? 500 : 400, fontFamily: "inherit", cursor: "pointer", textAlign: "center", textDecoration: "none",
          background: p.featured ? "#fff" : "none",
          color: p.featured ? "var(--green)" : "var(--body)",
          border: p.featured ? "none" : "1px solid var(--border)",
          transition: "all .15s",
        }}
        onMouseEnter={e => { if (!p.featured) { (e.currentTarget as HTMLAnchorElement).style.background = "var(--green)"; (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--green)"; } }}
        onMouseLeave={e => { if (!p.featured) { (e.currentTarget as HTMLAnchorElement).style.background = "none"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--body)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)"; } }}
      >
        {p.cta}
      </a>
    </div>
  );
}
