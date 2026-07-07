"use client";

export default function CTASection() {
  return (
    <section style={{ background: "var(--surface-dark)", padding: "96px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      {/* Ambient glow */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(45,90,61,.35) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(74,148,98,.15)", border: "1px solid rgba(74,148,98,.25)", borderRadius: 100, padding: "5px 14px 5px 9px", marginBottom: 28 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green-mid)", display: "inline-block" }} />
          <span style={{ fontSize: 11, color: "var(--green-mid)", fontWeight: 500, letterSpacing: "0.3px" }}>Empieza hoy, gratis</span>
        </div>

        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(38px, 4.5vw, 58px)", fontWeight: 600, color: "#f8f5ef", letterSpacing: "-1.2px", lineHeight: 1.08, marginBottom: 18 }}>
          Tu próximo trabajo<br />
          <em style={{ fontStyle: "italic", color: "var(--green-mid)" }}>empieza aquí</em>
        </h2>

        <p style={{ fontSize: 16, color: "rgba(255,255,255,.5)", lineHeight: 1.7, marginBottom: 36, maxWidth: 460, margin: "0 auto 36px" }}>
          Únete a miles de profesionales que ya generaron su CV con resumika. Sin tarjeta de crédito, resultado en 3 minutos.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          <a
            href="/crear"
            style={{ background: "var(--green)", color: "#fff", textDecoration: "none", borderRadius: 7, padding: "14px 28px", fontSize: 14, fontWeight: 500, fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 8, transition: "all .15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--green2)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--green)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}
          >
            ✦ Crear mi CV gratis
          </a>
          <a href="/#precios" style={{ color: "rgba(255,255,255,.45)", fontSize: 13, textDecoration: "none", transition: "color .15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,.8)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,.45)"; }}
          >
            Ver planes →
          </a>
        </div>

        <p style={{ marginTop: 22, fontSize: 11, color: "rgba(255,255,255,.2)", letterSpacing: "0.3px" }}>
          Sin tarjeta de crédito · Cancela cuando quieras · Resultado en 3 minutos
        </p>
      </div>
    </section>
  );
}
