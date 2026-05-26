import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Página no encontrada | resumika",
  description: "La página que buscas no existe.",
};

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--cream)" }}>
      <Navbar />
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(80px, 15vw, 160px)",
            fontWeight: 600,
            color: "var(--green)",
            letterSpacing: "-4px",
            lineHeight: 1,
          }}>
            404
          </div>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 600,
            color: "var(--ink)",
            marginTop: 8,
            marginBottom: 0,
          }}>
            Esta página no existe
          </p>
          <p style={{
            fontSize: 15,
            color: "var(--body)",
            lineHeight: 1.6,
            marginTop: 12,
            maxWidth: 380,
            textAlign: "center",
          }}>
            El link que buscas ya no está disponible o nunca existió.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 32, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/"
              style={{
                background: "var(--green)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "12px 24px",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              ← Ir al inicio
            </a>
            <a
              href="/crear"
              style={{
                background: "none",
                color: "var(--green)",
                border: "1px solid rgba(45,90,61,.25)",
                borderRadius: 8,
                padding: "12px 24px",
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              Crear mi CV →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
