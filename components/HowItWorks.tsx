const steps = [
  { n: "01", icon: "📝", title: "Llena el formulario", desc: "Tu experiencia, habilidades y el puesto al que aplicas. Solo lo esencial, sin complicaciones." },
  { n: "02", icon: "✦", title: "La IA redacta", desc: "Nuestro modelo analiza tu perfil y genera descripciones profesionales adaptadas a tu industria." },
  { n: "03", icon: "⬇", title: "Descarga y envía", desc: "Elige tu plantilla favorita y descarga en PDF. Listo para reclutadores en segundos." },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" style={{ maxWidth: 1100, margin: "0 auto", padding: "88px 48px" }}>
      <SectionLabel>Cómo funciona</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        {steps.map((s) => (
          <div key={s.n} style={{ background: "var(--paper)", padding: "40px 32px", transition: "background .2s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--cream)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--paper)")}>
            <div style={{ fontSize: 11, color: "var(--hint)", marginBottom: 20, letterSpacing: "0.5px" }}>{s.n}</div>
            <div style={{ width: 36, height: 36, borderRadius: 6, background: "var(--green-bg)", border: "1px solid rgba(45,90,61,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, fontSize: 16 }}>
              {s.icon}
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, letterSpacing: "-0.3px", color: "var(--ink)", marginBottom: 10 }}>{s.title}</h3>
            <p style={{ fontSize: 13, color: "var(--body)", lineHeight: 1.65 }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: "var(--hint)", fontWeight: 500, marginBottom: 48, display: "flex", alignItems: "center", gap: 12 }}>
      {children}
      <span style={{ flex: 1, height: 1, background: "var(--border)", display: "block" }} />
    </div>
  );
}
