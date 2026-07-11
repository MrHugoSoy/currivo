"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AuthModal } from "./AuthModal";
import type { User } from "@supabase/supabase-js";

const ADMIN_EMAILS = ["hugoivanrf@gmail.com"];

type ModalTab = "register" | "login";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [modal, setModal] = useState<ModalTab | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

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
    setMobileOpen(false);
  };

  return (
    <>
      <style>{`
        .nav-links { display: flex; gap: 28px; margin: 0 auto; }
        .nav-ctas  { display: flex; gap: 8px; align-items: center; }
        .nav-hamburger { display: none; }
        .nav-root { background: var(--nav-bg); }
        .nav-root.nav-scrolled { background: var(--nav-bg-scrolled); }
        .nav-mobile { background: var(--nav-bg-scrolled); }
        .nav-link { font-size: 13px; color: var(--body); font-weight: 400; text-decoration: none; transition: color .15s; }
        .nav-link:hover { color: var(--ink); }
        .nav-btn-ghost { font-size: 12px; color: var(--body); text-decoration: none; border: 1px solid var(--border2); border-radius: 6px; padding: 7px 14px; background: transparent; font-family: inherit; cursor: pointer; transition: border-color .15s, color .15s; }
        .nav-btn-ghost:hover { border-color: var(--ink); color: var(--ink); }
        .nav-btn-cta { background: var(--green); color: #fff; border-radius: 6px; padding: 8px 18px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; text-decoration: none; border: none; transition: opacity .15s; }
        .nav-btn-cta:hover { opacity: .88; }
        .nav-btn-register { background: var(--ink); color: var(--cream); border: none; border-radius: 6px; padding: 8px 16px; font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer; transition: opacity .15s; }
        .nav-btn-register:hover { opacity: .82; }
        .nav-btn-admin { font-size: 12px; color: var(--green); text-decoration: none; border: 1px solid rgba(45,90,61,.35); border-radius: 6px; padding: 7px 14px; background: var(--green-bg); font-weight: 500; transition: background .15s; }
        .nav-btn-admin:hover { background: var(--green2); color: #fff; border-color: transparent; }
        @media (max-width: 768px) {
          .nav-inner { padding: 0 20px !important; }
          .nav-links { display: none !important; }
          .nav-ctas  { display: none !important; }
          .nav-hamburger { display: flex !important; flex-direction: column; gap: 5px; }
        }
      `}</style>

      <nav className={`nav-root${scrolled ? " nav-scrolled" : ""}`} style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 62, backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)", transition: "background .2s" }}>
        <div className="nav-inner" style={{ padding: "0 64px", height: "100%", display: "flex", alignItems: "center" }}>

          <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, fontStyle: "italic", color: "var(--ink)", textDecoration: "none", letterSpacing: "-0.3px", flexShrink: 0 }}>
            resumi<span style={{ color: "var(--green)" }}>ka</span>
          </a>

          <div className="nav-links">
            <a href="/#como-funciona" className="nav-link">Cómo funciona</a>
            <a href="/crear" className="nav-link">Plantillas</a>
            <a href="/#precios" className="nav-link">Precios</a>
            <a href="/guias" className="nav-link">Guías</a>
            {user && <a href="/carta" className="nav-link">Carta de presentación</a>}
          </div>

          <div className="nav-ctas">
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
                  <span style={{ fontSize: 12, color: "var(--body)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.user_metadata?.username ? `@${user.user_metadata.username}` : user.email}
                  </span>
                </a>
                <a href="/perfil" className="nav-btn-ghost">Mi perfil</a>
                {ADMIN_EMAILS.includes(user.email ?? "") && (
                  <a href="/dashboard" className="nav-btn-admin">Dashboard</a>
                )}
                <button onClick={handleSignOut} className="nav-btn-ghost">Salir</button>
              </>
            ) : (
              <>
                <button onClick={() => setModal("login")} className="nav-btn-ghost">Iniciar sesión</button>
                <button onClick={() => setModal("register")} className="nav-btn-register">Registrarse</button>
              </>
            )}
            <a href="/crear" className="nav-btn-cta">Crear mi CV →</a>
          </div>

          {/* Hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setMobileOpen(o => !o)}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", padding: 8 }}
            aria-label="Menú"
          >
            <span style={{ width: 22, height: 2, background: "var(--ink)", borderRadius: 1, display: "block", transition: "transform .2s", transform: mobileOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
            <span style={{ width: 22, height: 2, background: "var(--ink)", borderRadius: 1, display: "block", transition: "opacity .2s", opacity: mobileOpen ? 0 : 1 }} />
            <span style={{ width: 22, height: 2, background: "var(--ink)", borderRadius: 1, display: "block", transition: "transform .2s", transform: mobileOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="nav-mobile" style={{ position: "fixed", top: 62, left: 0, right: 0, zIndex: 99, backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)", padding: "16px 20px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { href: "/#como-funciona", label: "Cómo funciona" },
            { href: "/crear", label: "Plantillas" },
            { href: "/#precios", label: "Precios" },
            { href: "/guias", label: "Guías" },
            ...(user ? [{ href: "/carta", label: "Carta de presentación" }] : []),
          ].map(({ href, label }) => (
            <a key={label} href={href} onClick={() => setMobileOpen(false)}
              style={{ fontSize: 16, color: "var(--body)", textDecoration: "none", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              {label}
            </a>
          ))}
          <div style={{ height: 8 }} />
          {user ? (
            <>
              <a href="/perfil" onClick={() => setMobileOpen(false)} style={{ fontSize: 14, color: "var(--muted)", textDecoration: "none", padding: "8px 0" }}>Mi perfil</a>
              {ADMIN_EMAILS.includes(user.email ?? "") && (
                <a href="/dashboard" onClick={() => setMobileOpen(false)} style={{ fontSize: 14, color: "var(--green)", textDecoration: "none", padding: "8px 0", fontWeight: 500 }}>Dashboard ↗</a>
              )}
              <button onClick={handleSignOut} style={{ marginTop: 4, background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "12px", fontSize: 14, color: "var(--muted)", fontFamily: "inherit", cursor: "pointer" }}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <button onClick={() => { setModal("login"); setMobileOpen(false); }} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "13px", fontSize: 14, color: "var(--body)", fontFamily: "inherit", cursor: "pointer" }}>Iniciar sesión</button>
              <button onClick={() => { setModal("register"); setMobileOpen(false); }} style={{ marginTop: 4, background: "var(--ink)", color: "var(--cream)", border: "none", borderRadius: 8, padding: "13px", fontSize: 14, fontWeight: 500, fontFamily: "inherit", cursor: "pointer" }}>Registrarse</button>
            </>
          )}
          <a href="/crear" onClick={() => setMobileOpen(false)} style={{ marginTop: 8, background: "var(--green)", color: "#fff", borderRadius: 8, padding: "14px", fontSize: 14, fontWeight: 500, textDecoration: "none", textAlign: "center" }}>
            ✦ Crear mi CV gratis →
          </a>
        </div>
      )}

      {modal && <AuthModal initialTab={modal} onClose={() => setModal(null)} />}
    </>
  );
}
