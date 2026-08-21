"use client";
import { SectionLabel } from "./HowItWorks";

type Currency = "MXN" | "USD" | "CAD";

const PRICES: Record<Currency, {
  pro: { amount: string; original: string; period: string; badge: string; founder: string };
  lifetime: { amount: string; period: string };
  free: { period: string; cta: string };
  proCta: string;
  lifetimeCta: string;
}> = {
  MXN: {
    pro:      { amount: "$49",   original: "$99",   period: "MXN por mes",    badge: "Más popular",  founder: "🚀 Precio de lanzamiento" },
    lifetime: { amount: "$399",  period: "pago único · sin renovaciones" },
    free:     { period: "siempre gratis", cta: "Comenzar gratis" },
    proCta: "Suscribirme →", lifetimeCta: "Comprar ahora",
  },
  USD: {
    pro:      { amount: "$2.99", original: "$5.99", period: "USD / month",    badge: "Most popular", founder: "🚀 Launch price" },
    lifetime: { amount: "$22",   period: "one-time · no renewals" },
    free:     { period: "always free", cta: "Start free" },
    proCta: "Subscribe →", lifetimeCta: "Buy now",
  },
  CAD: {
    pro:      { amount: "$3.99", original: "$7.99", period: "CAD / month",    badge: "Most popular", founder: "🚀 Launch price" },
    lifetime: { amount: "$29",   period: "one-time · no renewals" },
    free:     { period: "always free", cta: "Start free" },
    proCta: "Subscribe →", lifetimeCta: "Buy now",
  },
};

export default function Pricing({ currency = "MXN" }: { currency?: Currency }) {
  const p = PRICES[currency];

  const plans = [
    {
      label: "Gratis",
      amount: "$0",
      period: p.free.period,
      feats: [["✓","1 CV generado"],["✓","2 plantillas básicas"],["✓","Descarga PDF"],["—","Edición ilimitada"],["—","Plantillas premium"],["—","Carta de presentación"]],
      cta: p.free.cta,
      featured: false,
      href: "/crear",
    },
    {
      label: "Pro",
      badge: p.pro.badge,
      amount: p.pro.amount,
      originalAmount: p.pro.original,
      founderBadge: p.pro.founder,
      period: p.pro.period,
      feats: [["✓","CV adaptado a cada vacante"],["✓","CVs ilimitados"],["✓","Todas las plantillas"],["✓","Carta de presentación IA"],["✓","Edición en línea"],["✓","Descarga en PDF"],["⏳","Exportar a Word (próximamente)"]],
      cta: p.proCta,
      featured: true,
      href: "/pago?plan=pro_mxn_founder",
    },
    {
      label: "Lifetime",
      amount: p.lifetime.amount,
      period: p.lifetime.period,
      feats: [["✓","Todo lo de Pro"],["✓","Sin vencimiento"],["✓","Futuras plantillas"],["✓","Soporte prioritario"],["✓","Sin renovaciones"],["⏳","LinkedIn Optimizer (próximamente)"]],
      cta: p.lifetimeCta,
      featured: false,
      href: "/pago?plan=lifetime_mxn",
    },
  ];


  return (
    <section id="precios" style={{ padding: "96px 0", background: "var(--cream)" }}>
      <style>{`
        .pricing-inner { max-width: 1320px; margin: 0 auto; padding: 0 64px; }
        .pricing-header { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: end; margin-bottom: 56px; }
        .pricing-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 900px) {
          .pricing-inner { padding: 0 24px; }
          .pricing-header { grid-template-columns: 1fr; gap: 16px; margin-bottom: 36px; }
          .pricing-cards { grid-template-columns: 1fr; max-width: 480px; margin: 0 auto; }
        }
        @media (max-width: 480px) {
          .pricing-inner { padding: 0 16px; }
        }
      `}</style>
      <div className="pricing-inner">
        <SectionLabel>Precios</SectionLabel>
        <div className="pricing-header">
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(34px, 3.8vw, 52px)", fontWeight: 600, color: "var(--ink)", letterSpacing: "-1.2px", lineHeight: 1.08 }}>
            Invierte en<br />
            <em style={{ color: "var(--green)", fontStyle: "italic" }}>tu carrera</em>
          </h2>
          <p style={{ fontSize: 15, color: "var(--body)", lineHeight: 1.75, paddingBottom: 4 }}>
            ¿Encontraste una vacante? Con Pro pegas la descripción y adaptas tu CV con IA a cada una, sin límite. Empieza gratis y escala cuando lo necesites — sin contratos, cancela cuando quieras.
          </p>
        </div>
        <div className="pricing-cards">
          {plans.map(plan => <PlanCard key={plan.label} plan={plan} />)}
        </div>
        {currency !== "MXN" && (
          <p style={{ fontSize: 11, color: "var(--hint)", textAlign: "center", marginTop: 20 }}>
            * Prices shown are approximate. Checkout is processed in MXN (Mexican Peso).
          </p>
        )}
      </div>
    </section>
  );
}

type Plan = { label: string; amount: string; period: string; feats: string[][]; cta: string; featured: boolean; href: string; badge?: string; originalAmount?: string; founderBadge?: string; };

function PlanCard({ plan: p }: { plan: Plan }) {
  return (
    <div
      style={{ background: p.featured ? "var(--green)" : "var(--paper)", borderRadius: 12, padding: p.featured ? "36px 30px 32px" : "32px 30px", border: p.featured ? "none" : "1px solid var(--border)", boxShadow: p.featured ? "0 20px 60px rgba(45,90,61,.28)" : "none", transform: p.featured ? "translateY(-8px)" : "none", transition: "transform .2s, box-shadow .2s", position: "relative" }}
      onMouseEnter={e => { if (!p.featured) { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,.07)"; } }}
      onMouseLeave={e => { if (!p.featured) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; } }}
    >
      {"badge" in p && p.badge && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.18)", borderRadius: 100, padding: "3px 10px", marginBottom: 10 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#a3e4bc", display: "inline-block" }} />
          <span style={{ fontSize: 10, color: "#fff", fontWeight: 600, letterSpacing: "0.5px" }}>{p.badge}</span>
        </div>
      )}

      {"founderBadge" in p && p.founderBadge && (
        <div style={{ display: "block", background: "rgba(255,255,255,.12)", borderRadius: 5, padding: "4px 10px", marginBottom: 10, fontSize: 10, color: "rgba(255,255,255,.9)", fontWeight: 500, width: "fit-content" }}>
          {p.founderBadge}
        </div>
      )}

      <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: p.featured ? "rgba(255,255,255,.5)" : "var(--hint)", fontWeight: 500, marginBottom: 8 }}>
        {p.label}
      </div>

      {/* Price with strikethrough original */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "12px 0 4px" }}>
        {"originalAmount" in p && p.originalAmount && (
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "rgba(255,255,255,.3)", textDecoration: "line-through", letterSpacing: "-1px" }}>
            {p.originalAmount}
          </span>
        )}
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 600, letterSpacing: "-2px", color: p.featured ? "#fff" : "var(--ink)", lineHeight: 1 }}>
          {p.amount}
        </span>
      </div>

      <div style={{ fontSize: 11, color: p.featured ? "rgba(255,255,255,.5)" : "var(--hint)" }}>{p.period}</div>
      <hr style={{ border: "none", borderTop: `1px solid ${p.featured ? "rgba(255,255,255,.15)" : "var(--border)"}`, margin: "22px 0" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {p.feats.map(([icon, text]) => (
          <div key={text} style={{ fontSize: 12, color: p.featured ? "rgba(255,255,255,.8)" : "var(--body)", padding: "5px 0", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ color: icon === "✓" ? (p.featured ? "#a3e4bc" : "var(--green-mid)") : icon === "⏳" ? (p.featured ? "#f0cf8a" : "#d4a050") : "var(--border2)", fontSize: 11, flexShrink: 0 }}>{icon}</span>
            <span style={{ opacity: icon === "—" ? 0.45 : icon === "⏳" ? 0.75 : 1, fontStyle: icon === "⏳" ? "italic" : "normal" }}>{text}</span>
          </div>
        ))}
      </div>
      <a
        href={p.href}
        style={{ display: "block", width: "100%", marginTop: 24, borderRadius: 7, padding: "12px 0", fontSize: 13, fontWeight: p.featured ? 500 : 400, fontFamily: "inherit", cursor: "pointer", textAlign: "center", textDecoration: "none", background: p.featured ? "#fff" : "none", color: p.featured ? "var(--green)" : "var(--body)", border: p.featured ? "none" : "1px solid var(--border)", transition: "all .15s" }}
        onMouseEnter={e => { if (!p.featured) { (e.currentTarget as HTMLAnchorElement).style.background = "var(--green)"; (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--green)"; } }}
        onMouseLeave={e => { if (!p.featured) { (e.currentTarget as HTMLAnchorElement).style.background = "none"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--body)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)"; } }}
      >
        {p.cta}
      </a>
    </div>
  );
}