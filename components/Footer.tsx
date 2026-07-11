export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", background: "var(--paper)" }}>
      <style>{`
        .footer-inner { max-width: 1320px; margin: 0 auto; padding: 36px 64px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .footer-link { font-size: 12px; color: var(--muted); text-decoration: none; transition: color .15s; }
        .footer-link:hover { color: var(--ink); }
        @media (max-width: 640px) {
          .footer-inner { padding: 28px 20px; flex-direction: column; align-items: center; text-align: center; gap: 16px; }
        }
      `}</style>
      <div className="footer-inner">
        <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, fontStyle: "italic", color: "var(--ink)", textDecoration: "none" }}>
          resumi<span style={{ color: "var(--green)" }}>ka</span>
        </a>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="/guias"      className="footer-link">Guías</a>
          <a href="/terminos"   className="footer-link">Términos</a>
          <a href="/privacidad" className="footer-link">Privacidad</a>
          <a href="mailto:hola@resumika.com" className="footer-link">Contacto</a>
        </div>
        <span style={{ fontSize: 11, color: "var(--hint)" }}>© 2026 resumika · México</span>
      </div>
    </footer>
  );
}
