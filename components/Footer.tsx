"use client";
export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)" }}>
      <style>{`
        .footer-inner { max-width: 1320px; margin: 0 auto; padding: 36px 64px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        @media (max-width: 640px) {
          .footer-inner { padding: 28px 20px; flex-direction: column; align-items: center; text-align: center; gap: 16px; }
        }
      `}</style>
      <div className="footer-inner">
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, fontStyle: "italic", color: "var(--ink)" }}>
          curr<span style={{ color: "var(--green)" }}>ivo</span>
        </span>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="/terminos"   style={{ fontSize: 12, color: "var(--hint)", textDecoration: "none" }}>Términos</a>
          <a href="/privacidad" style={{ fontSize: 12, color: "var(--hint)", textDecoration: "none" }}>Privacidad</a>
          <a href="mailto:hola@currivo.mx" style={{ fontSize: 12, color: "var(--hint)", textDecoration: "none" }}>Contacto</a>
        </div>
        <span style={{ fontSize: 11, color: "var(--hint)" }}>© 2026 currivo · México</span>
      </div>
    </footer>
  );
}
