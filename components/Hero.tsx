"use client";
import CVPreview from "./CVPreview";

export default function Hero() {
  return (
    <>
      <style>{`
        .hero-wrap { max-width: 1320px; margin: 0 auto; padding: 120px 64px 80px; display: grid; grid-template-columns: 1.1fr 1fr; gap: 64px; align-items: center; }
        .hero-preview { position: relative; }
        @media (max-width: 900px) {
          .hero-wrap { grid-template-columns: 1fr; padding: 96px 24px 56px; gap: 40px; }
          .hero-preview { display: none; }
        }
        @media (max-width: 480px) {
          .hero-wrap { padding: 84px 16px 48px; }
        }
      `}</style>
      <section className="hero-wrap">
        {/* LEFT */}
        <div className="animate-fade-up">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--green-bg)", color: "var(--green)", border: "1px solid rgba(45,90,61,0.2)", borderRadius: 100, padding: "5px 14px 5px 8px", fontSize: 12, fontWeight: 500, marginBottom: 32 }}>
            <span className="animate-glow" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green-mid)", display: "inline-block" }} />
            Generador de CV con Inteligencia Artificial
          </div>

          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(40px, 5vw, 68px)", fontWeight: 600, lineHeight: 1.06, letterSpacing: "-1.5px", color: "var(--ink)", marginBottom: 22 }}>
            El CV que abre<br />puertas — creado<br />
            <em style={{ fontStyle: "italic", color: "var(--green)" }}>en 3 minutos</em>
          </h1>

          <p style={{ fontSize: 16, lineHeight: 1.72, color: "var(--body)", maxWidth: 430, marginBottom: 36 }}>
            Completa tus datos, elige el tono y nuestra IA genera un currículum profesional adaptado a tu industria, listo para enviar.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="/crear" style={{ background: "var(--green)", color: "#fff", border: "none", borderRadius: 6, padding: "13px 26px", fontSize: 14, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              ✦ Generar mi CV gratis
            </a>
            <a href="/#precios" style={{ background: "none", color: "var(--body)", border: "1px solid var(--border)", borderRadius: 6, padding: "13px 26px", fontSize: 14, fontFamily: "inherit", cursor: "pointer", textDecoration: "none" }}>
              Ver planes
            </a>
          </div>

          <div style={{ marginTop: 40, paddingTop: 32, borderTop: "1px solid var(--border)", display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex" }}>
              {[["MG","#d4e8da","#2d5a3d"],["JR","#dde8f4","#2d4a7a"],["AL","#f0e8d4","#7a4a2d"],["CP","#e8d4e8","#5a2d7a"]].map(([initials, bg, color]) => (
                <div key={initials} style={{ width: 32, height: 32, borderRadius: "50%", background: bg, color, border: "2px solid var(--paper)", marginRight: -8, fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>{initials}</div>
              ))}
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
              <strong style={{ color: "var(--ink)", fontWeight: 600 }}>+4,200 personas</strong> ya generaron<br />su CV con resumika
            </div>
            <div style={{ width: 1, height: 32, background: "var(--border)" }} />
            <Stat n="4.8/5" l="Calificación" />
            <div style={{ width: 1, height: 32, background: "var(--border)" }} />
            <Stat n="3 min" l="Promedio" />
          </div>
        </div>

        {/* RIGHT — CV Preview (hidden on mobile) */}
        <div className="hero-preview animate-fade-up-2">
          <CVPreview />
          <div style={{ position: "absolute", bottom: -14, left: 24, background: "var(--green)", color: "#fff", fontSize: 11, fontWeight: 500, padding: "8px 16px", borderRadius: 100, boxShadow: "0 4px 16px rgba(45,90,61,0.3)", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7dd4a0" }} />
            CV generado en 38 segundos
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, letterSpacing: "-0.5px", color: "var(--ink)", lineHeight: 1 }}>{n}</span>
      <span style={{ fontSize: 11, color: "var(--hint)" }}>{l}</span>
    </div>
  );
}
