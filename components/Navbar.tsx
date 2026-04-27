"use client";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 62, display: "flex", alignItems: "center", padding: "0 48px",
        background: scrolled ? "rgba(248,245,239,0.95)" : "rgba(248,245,239,0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border)",
        transition: "background .2s",
      }}
    >
      {/* Logo */}
      <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, fontStyle: "italic", color: "var(--ink)", textDecoration: "none", letterSpacing: "-0.3px" }}>
        curr<span style={{ color: "var(--green)" }}>ivo</span>
      </a>

      {/* Links */}
      <div style={{ margin: "0 auto", display: "flex", gap: 32 }}>
        {["Cómo funciona", "Plantillas", "Precios"].map((l) => (
          <button key={l} onClick={() => scrollTo(l === "Cómo funciona" ? "como-funciona" : l === "Plantillas" ? "plantillas" : "precios")}
            style={{ background: "none", border: "none", fontSize: 13, color: "var(--muted)", cursor: "pointer", fontFamily: "inherit", fontWeight: 400 }}>
            {l}
          </button>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: "flex", gap: 10 }}>
        <button style={{ background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 16px", fontSize: 13, color: "var(--muted)", fontFamily: "inherit", cursor: "pointer" }}>
          Iniciar sesión
        </button>
        <button
          onClick={() => scrollTo("generador")}
          style={{ background: "var(--green)", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer" }}
        >
          Crear mi CV →
        </button>
      </div>
    </nav>
  );
}
