"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Tab = "register" | "login";

interface AuthModalProps {
  initialTab?: Tab;
  onClose: () => void;
}

export function AuthModal({ initialTab = "register", onClose }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const switchTab = (t: Tab) => { setTab(t); setError(null); setSuccess(false); };

  const handleUsernameInput = (v: string) =>
    setUsername(v.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 20));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (tab === "register" && username && username.length < 3) {
      setError("El nombre de perfil debe tener al menos 3 caracteres.");
      return;
    }
    setLoading(true);
    try {
      if (tab === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: username.trim() || undefined } },
        });
        if (error) throw error;
        fetch("/api/email/welcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, nombre: username.trim() || undefined, type: "register" }),
        }).then(() => {}, () => {});
        setSuccess(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado";
      setError(msg === "Invalid login credentials" ? "Correo o contraseña incorrectos." : msg);
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
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(28,26,22,.58)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 12, padding: "36px 32px", width: "100%", maxWidth: 390, position: "relative", boxShadow: "0 24px 64px rgba(0,0,0,.14)" }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 16, background: "none", border: "none", fontSize: 22, color: "var(--hint)", cursor: "pointer", lineHeight: 1 }}>×</button>

        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 600, fontStyle: "italic", color: "var(--ink)", marginBottom: 22, letterSpacing: "-0.3px" }}>
          resumi<span style={{ color: "var(--green)" }}>ka</span>
        </div>

        {/* Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, marginBottom: 24, background: "var(--warm)", borderRadius: 7, padding: 4 }}>
          {(["register", "login"] as Tab[]).map(t => (
            <button key={t} onClick={() => switchTab(t)}
              style={{ borderRadius: 5, padding: "7px 0", border: "none", fontFamily: "inherit", fontSize: 12, cursor: "pointer", transition: "all .15s", fontWeight: tab === t ? 500 : 400, background: tab === t ? "var(--paper)" : "none", color: tab === t ? "var(--ink)" : "var(--muted)", boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,.07)" : "none" }}>
              {t === "register" ? "Registrarse" : "Iniciar sesión"}
            </button>
          ))}
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>✉️</div>
            <p style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)", marginBottom: 8 }}>Revisa tu correo</p>
            <p style={{ fontSize: 13, color: "var(--body)", lineHeight: 1.65 }}>
              Enviamos un link de confirmación a <strong>{email}</strong>. Haz clic en él para activar tu cuenta.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Username — solo en registro */}
            {tab === "register" && (
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 5, fontWeight: 500 }}>
                  Nombre de perfil <span style={{ color: "var(--hint)", fontWeight: 400 }}>(opcional)</span>
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--hint)", pointerEvents: "none" }}>@</span>
                  <input type="text" placeholder="tunombre" value={username}
                    onChange={e => handleUsernameInput(e.target.value)}
                    style={{ ...input, paddingLeft: 26 }} />
                </div>
                <p style={{ fontSize: 11, color: "var(--hint)", marginTop: 4 }}>Letras, números, _ y · · 3–20 caracteres</p>
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 5, fontWeight: 500 }}>Correo electrónico</label>
              <input type="email" required placeholder="tu@correo.com" value={email}
                onChange={e => setEmail(e.target.value)} style={input} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 5, fontWeight: 500 }}>Contraseña</label>
              <input type="password" required placeholder={tab === "register" ? "Mínimo 6 caracteres" : "Tu contraseña"}
                value={password} onChange={e => setPassword(e.target.value)} style={input} minLength={6} />
            </div>

            {error && (
              <p style={{ fontSize: 12, color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 5, padding: "8px 12px", margin: 0 }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              style={{ background: "var(--green)", color: "#fff", border: "none", borderRadius: 6, padding: "12px 0", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4 }}>
              {loading ? "..." : tab === "register" ? "Crear cuenta gratis" : "Entrar"}
            </button>

            {tab === "login" && (
              <p style={{ textAlign: "center", fontSize: 12, color: "var(--hint)", margin: 0 }}>
                ¿No tienes cuenta?{" "}
                <button type="button" onClick={() => switchTab("register")}
                  style={{ background: "none", border: "none", color: "var(--green)", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 500, padding: 0 }}>
                  Regístrate gratis
                </button>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
