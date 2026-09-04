"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RestablecerContrasenaPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const input: React.CSSProperties = {
    width: "100%", background: "var(--cream)", border: "1px solid var(--border2)",
    borderRadius: 6, padding: "10px 12px", fontFamily: "inherit", fontSize: 13,
    color: "var(--ink)", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", flexDirection: "column" }}>
      <header style={{ background: "var(--paper)", borderBottom: "1px solid var(--border)", padding: "0 48px", height: 56, display: "flex", alignItems: "center" }}>
        <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 600, fontStyle: "italic", color: "var(--ink)", textDecoration: "none", letterSpacing: "-0.3px" }}>
          resumi<span style={{ color: "var(--green)" }}>ka</span>
        </a>
      </header>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 12, padding: "36px 32px", width: "100%", maxWidth: 390, boxShadow: "0 24px 64px rgba(0,0,0,.08)" }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "var(--ink)", marginBottom: 22 }}>
            Restablecer contraseña
          </h1>

          {!ready ? (
            <p style={{ fontSize: 13, color: "var(--body)", lineHeight: 1.65 }}>
              Verificando el link de recuperación... Si llegaste aquí directamente (sin hacer clic en el correo), este link no será válido.
            </p>
          ) : success ? (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>✅</div>
              <p style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)", marginBottom: 8 }}>Contraseña actualizada</p>
              <p style={{ fontSize: 13, color: "var(--body)", lineHeight: 1.65 }}>Te llevaremos a tu panel en un momento...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 5, fontWeight: 500 }}>Nueva contraseña</label>
                <input type="password" required placeholder="Mínimo 6 caracteres" value={password}
                  onChange={e => setPassword(e.target.value)} style={input} minLength={6} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 5, fontWeight: 500 }}>Confirmar contraseña</label>
                <input type="password" required placeholder="Repite tu contraseña" value={confirm}
                  onChange={e => setConfirm(e.target.value)} style={input} minLength={6} />
              </div>

              {error && (
                <p style={{ fontSize: 12, color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 5, padding: "8px 12px", margin: 0 }}>
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading}
                style={{ background: "var(--green)", color: "#fff", border: "none", borderRadius: 6, padding: "12px 0", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4 }}>
                {loading ? "..." : "Guardar contraseña"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
