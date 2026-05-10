"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ExitoContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (sessionId) {
      // Small delay to let webhook process
      setTimeout(() => setStatus("success"), 1500);
    } else {
      setStatus("error");
    }
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid var(--border)", borderTopColor: "var(--green)", animation: "spin .65s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ fontSize: 14, color: "var(--muted)" }}>Activando tu cuenta Pro...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--green-bg)", border: "2px solid rgba(45,90,61,.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", fontSize: 32 }}>
          ✓
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 600, color: "var(--ink)", letterSpacing: "-1px", marginBottom: 12 }}>
          ¡Bienvenido a Pro!
        </h1>
        <p style={{ fontSize: 14, color: "var(--body)", lineHeight: 1.75, marginBottom: 6 }}>
          Tu cuenta ha sido activada exitosamente.
        </p>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.75, marginBottom: 36 }}>
          Ya tienes acceso a todas las plantillas, carta de presentación con IA y CVs ilimitados.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/crear" style={{ background: "var(--green)", color: "#fff", textDecoration: "none", borderRadius: 8, padding: "12px 28px", fontSize: 14, fontWeight: 500 }}>
            ✦ Crear mi CV Pro →
          </a>
          <a href="/perfil" style={{ background: "none", color: "var(--green)", textDecoration: "none", borderRadius: 8, padding: "12px 28px", fontSize: 14, fontWeight: 500, border: "1px solid rgba(45,90,61,.25)" }}>
            Ver mi perfil
          </a>
        </div>
        <p style={{ fontSize: 11, color: "var(--hint)", marginTop: 28 }}>
          Recibirás un correo de confirmación en breve.
        </p>
      </div>
    </div>
  );
}

export default function PagoExitoPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--cream)" }} />}>
      <ExitoContent />
    </Suspense>
  );
}
