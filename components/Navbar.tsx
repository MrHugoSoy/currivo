"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AuthModal } from "./AuthModal";
import type { User } from "@supabase/supabase-js";

type ModalTab = "register" | "login";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [modal, setModal] = useState<ModalTab | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
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
          {[["Cómo funciona", "como-funciona"], ["Plantillas", "plantillas"], ["Precios", "precios"]].map(([label, id]) => (
            <a key={id} href={`/#${id}`}
              style={{ background: "none", border: "none", fontSize: 13, color: "var(--muted)", cursor: "pointer", fontFamily: "inherit", fontWeight: 400, textDecoration: "none" }}>
              {label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {user ? (
            <>
              <a href="/perfil" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="avatar" style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(45,90,61,.2)" }} />
                ) : (
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--green-bg)", border: "1px solid rgba(45,90,61,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "var(--green)" }}>
                    {user.email?.[0].toUpperCase()}
                  </div>
                )}
                <span style={{ fontSize: 12, color: "var(--body)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.user_metadata?.username ? `@${user.user_metadata.username}` : user.email}
                </span>
              </a>
              <a href="/perfil" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "7px 14px" }}>
                Mi perfil
              </a>
              <button onClick={handleSignOut}
                style={{ background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "7px 14px", fontSize: 12, color: "var(--muted)", fontFamily: "inherit", cursor: "pointer" }}>
                Salir
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setModal("login")}
                style={{ background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 16px", fontSize: 13, color: "var(--muted)", fontFamily: "inherit", cursor: "pointer" }}>
                Iniciar sesión
              </button>
              <button onClick={() => setModal("register")}
                style={{ background: "var(--ink)", color: "var(--cream)", border: "none", borderRadius: 6, padding: "8px 16px", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer" }}>
                Registrarse
              </button>
            </>
          )}
          <a
            href="/crear"
            style={{ background: "var(--green)", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", textDecoration: "none" }}
          >
            Crear mi CV →
          </a>
        </div>
      </nav>

      {modal && <AuthModal initialTab={modal} onClose={() => setModal(null)} />}
    </>
  );
}
