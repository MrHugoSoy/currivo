// Reusable CV preview card (light/paper style)
interface CVPreviewProps {
  compact?: boolean;
}

export default function CVPreview({ compact = false }: CVPreviewProps) {
  const pad = compact ? "20px 18px" : "28px 26px";
  const nameSize = compact ? 18 : 22;

  return (
    <div style={{ background: "var(--paper)", borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06), 0 24px 64px rgba(0,0,0,0.08)" }}>
      {/* Title bar */}
      <div style={{ background: "var(--warm)", padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ fontSize: 10, color: "var(--hint)", marginLeft: 8 }}>currivo_cv.pdf</span>
      </div>

      {/* Body */}
      <div style={{ padding: pad }}>
        {/* Header */}
        <div style={{ marginBottom: 18, paddingBottom: 16, borderBottom: "2px solid var(--ink)" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: nameSize, fontWeight: 600, letterSpacing: "-0.5px", color: "var(--ink)" }}>
            María García López
          </div>
          <div style={{ fontSize: 11, color: "var(--green)", fontWeight: 500, marginTop: 3 }}>Diseñadora Gráfica Senior</div>
          <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
            {["📍 León, Gto.", "✉ maria@correo.com", "☎ +52 477 123 4567"].map(c => (
              <span key={c} style={{ fontSize: 9, color: "var(--hint)" }}>{c}</span>
            ))}
          </div>
        </div>

        <SectionHead>Perfil profesional</SectionHead>
        <p style={{ fontSize: 10, color: "var(--body)", lineHeight: 1.65, marginBottom: 12 }}>
          Diseñadora gráfica con 5 años de experiencia creando identidades de marca y materiales visuales de alto impacto. Especializada en branding editorial y estrategia visual para medios digitales.
        </p>

        <SectionHead>Experiencia laboral</SectionHead>
        <Job title="Diseñadora Gráfica Senior" company="Agencia Creativa MX · 2020 – Presente"
          desc="+30 identidades corporativas. Reducción del 40% en tiempos de entrega con sistemas de componentes en Figma." />
        <Job title="Diseñadora Freelance" company="Independiente · 2018 – 2020"
          desc="15+ clientes en retail, restaurantes y servicios profesionales." />

        <SectionHead>Habilidades</SectionHead>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
          {["Photoshop", "Figma", "Illustrator", "CorelDRAW", "Branding", "Inglés B2"].map(s => (
            <span key={s} style={{ fontSize: 9, padding: "3px 9px", borderRadius: 3, background: "var(--green-bg)", color: "var(--green)", fontWeight: 500 }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Footer bar */}
      <div style={{ padding: "9px 16px", background: "var(--warm)", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 9, color: "var(--hint)", letterSpacing: "0.5px" }}>Generado con IA · currivo.mx</span>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green-mid)" }} />
      </div>
    </div>
  );
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 8, letterSpacing: 2, textTransform: "uppercase", color: "var(--hint)", margin: "14px 0 8px", display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
      {children}
      <span style={{ flex: 1, height: 1, background: "var(--border)", display: "block" }} />
    </div>
  );
}

function Job({ title, company, desc }: { title: string; company: string; desc: string }) {
  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink)" }}>{title}</div>
      <div style={{ fontSize: 9, color: "var(--hint)", margin: "2px 0 4px" }}>{company}</div>
      <div style={{ fontSize: 10, color: "var(--body)", lineHeight: 1.55 }}>{desc}</div>
    </div>
  );
}
