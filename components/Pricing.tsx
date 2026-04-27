import { SectionLabel } from "./HowItWorks";

const plans = [
  {
    label: "Gratis", amount: "$0", period: "siempre gratis",
    feats: [["✓","1 CV generado"],["✓","2 plantillas básicas"],["✓","Descarga PDF"],["—","Edición ilimitada"],["—","Plantillas premium"],["—","Carta de presentación"]],
    cta: "Comenzar gratis", featured: false,
  },
  {
    label: "Pro — Más popular", amount: "$99", period: "MXN por mes",
    feats: [["✓","CVs ilimitados"],["✓","Todas las plantillas"],["✓","Carta de presentación IA"],["✓","Edición en línea"],["✓","PDF + Word"],["✓","CV adaptado por vacante"]],
    cta: "Suscribirme →", featured: true,
  },
  {
    label: "Lifetime", amount: "$399", period: "pago único · para siempre",
    feats: [["✓","Todo lo de Pro"],["✓","Acceso de por vida"],["✓","Futuras plantillas"],["✓","LinkedIn Optimizer"],["✓","Soporte prioritario"],["✓","Sin renovaciones"]],
    cta: "Comprar ahora", featured: false,
  },
];

export default function Pricing() {
  return (
    <section id="precios" style={{ maxWidth: 1100, margin: "0 auto", padding: "88px 48px" }}>
      <SectionLabel>Precios</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        {plans.map((p) => (
          <div key={p.label} style={{ background: p.featured ? "var(--green)" : "var(--paper)", padding: "36px 30px", borderRight: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: p.featured ? "rgba(255,255,255,0.5)" : "var(--hint)", fontWeight: 500, marginBottom: 10 }}>{p.label}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 600, letterSpacing: "-2px", color: p.featured ? "#fff" : "var(--ink)", lineHeight: 1, margin: "16px 0 4px" }}>{p.amount}</div>
            <div style={{ fontSize: 11, color: p.featured ? "rgba(255,255,255,0.5)" : "var(--hint)" }}>{p.period}</div>
            <hr style={{ border: "none", borderTop: `1px solid ${p.featured ? "rgba(255,255,255,0.15)" : "var(--border)"}`, margin: "22px 0" }} />
            {p.feats.map(([icon, text]) => (
              <div key={text} style={{ fontSize: 12, color: p.featured ? "rgba(255,255,255,0.75)" : "var(--body)", padding: "5px 0", display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ color: icon === "✓" ? (p.featured ? "#a3e4bc" : "var(--green-mid)") : "var(--border2)", fontSize: 11 }}>{icon}</span>
                {text}
              </div>
            ))}
            <button style={{ width: "100%", marginTop: 24, borderRadius: 6, padding: 11, fontSize: 13, fontWeight: p.featured ? 500 : 400, fontFamily: "inherit", cursor: "pointer", background: p.featured ? "#fff" : "none", color: p.featured ? "var(--green)" : "var(--body)", border: p.featured ? "none" : "1px solid var(--border)", transition: "all .2s" }}>
              {p.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
