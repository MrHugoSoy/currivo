"use client";

const steps = [
  {
    n: "01",
    title: "Llena el formulario",
    desc: "Tu experiencia, habilidades y el puesto al que aplicas. Solo lo esencial, sin complicaciones.",
    detail: "Menos de 5 minutos",
  },
  {
    n: "02",
    title: "La IA redacta",
    desc: "Nuestro modelo analiza tu perfil y genera descripciones profesionales adaptadas a tu industria y mercado.",
    detail: "Resultado inmediato",
  },
  {
    n: "03",
    title: "Descarga y envía",
    desc: "Descarga tu CV en PDF listo para reclutadores. También puedes compartirlo con un enlace único.",
    detail: "PDF listo al instante",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" style={{ padding: "96px 0", background: "var(--paper)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 64px" }}>
        <SectionLabel>Cómo funciona</SectionLabel>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "end", marginBottom: 64 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(34px, 3.8vw, 52px)", fontWeight: 600, color: "var(--ink)", letterSpacing: "-1.2px", lineHeight: 1.08 }}>
            De tus datos a<br />
            <em style={{ color: "var(--green)", fontStyle: "italic" }}>tu primera entrevista</em>
          </h2>
          <p style={{ fontSize: 15, color: "var(--body)", lineHeight: 1.75, paddingBottom: 4 }}>
            Sin plantillas vacías. Sin horas frente a la pantalla. Completa el formulario y deja que la inteligencia artificial haga el trabajo pesado por ti.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 52px 1fr 52px 1fr", alignItems: "start" }}>
          {steps.flatMap((s, i) => {
            const card = (
              <div
                key={s.n}
                style={{ background: "var(--cream)", borderRadius: 10, padding: "32px 28px", border: "1px solid var(--border)", position: "relative", overflow: "hidden", transition: "transform .2s, box-shadow .2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 36px rgba(0,0,0,.07)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <span style={{ position: "absolute", top: -6, right: 12, fontFamily: "'Cormorant Garamond', serif", fontSize: 88, fontWeight: 600, color: "rgba(28,26,22,.04)", lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>
                  {s.n}
                </span>

                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--green-bg)", border: "1px solid rgba(45,90,61,.15)", borderRadius: 100, padding: "3px 10px", marginBottom: 22 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green-mid)", display: "inline-block" }} />
                  <span style={{ fontSize: 10, color: "var(--green)", fontWeight: 600, letterSpacing: "0.5px" }}>PASO {s.n}</span>
                </div>

                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, letterSpacing: "-0.3px", color: "var(--ink)", marginBottom: 10, lineHeight: 1.2 }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 13, color: "var(--body)", lineHeight: 1.7 }}>{s.desc}</p>

                <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--green)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.2px" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green-mid)", display: "inline-block" }} />
                  {s.detail}
                </div>
              </div>
            );

            if (i < steps.length - 1) {
              return [
                card,
                <div key={`conn-${i}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 52 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 24, height: 1, background: "var(--border2)" }} />
                    <span style={{ fontSize: 13, color: "var(--hint)", lineHeight: 1 }}>→</span>
                    <div style={{ width: 24, height: 1, background: "var(--border2)" }} />
                  </div>
                </div>,
              ];
            }
            return [card];
          })}
        </div>
      </div>
    </section>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: "var(--hint)", fontWeight: 500, marginBottom: 40, display: "flex", alignItems: "center", gap: 12 }}>
      {children}
      <span style={{ flex: 1, height: 1, background: "var(--border)", display: "block" }} />
    </div>
  );
}
