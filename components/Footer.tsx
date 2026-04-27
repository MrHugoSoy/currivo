export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, fontStyle: "italic", color: "var(--ink)" }}>
          curr<span style={{ color: "var(--green)" }}>ivo</span>
        </span>
        <div style={{ display: "flex", gap: 24 }}>
          {["Términos", "Privacidad", "Contacto"].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: "var(--hint)", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
        <span style={{ fontSize: 11, color: "var(--hint)" }}>© 2026 currivo · México</span>
      </div>
    </footer>
  );
}
