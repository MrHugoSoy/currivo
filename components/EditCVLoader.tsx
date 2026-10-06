"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Generator from "./Generator";
import { AuthModal } from "./AuthModal";
import { authFetch } from "@/lib/authFetch";
import { supabase } from "@/lib/supabase";

type Denied = "login" | "forbidden" | "missing" | "error";
type State =
  | { kind: "loading" }
  | { kind: "ready"; data: Record<string, unknown> | undefined }
  | { kind: "denied"; reason: Denied };

const MESSAGES: Record<Denied, string> = {
  login: "Inicia sesión para editar este CV.",
  forbidden: "Este CV no es tuyo, así que no puedes editarlo.",
  missing: "No encontramos este CV.",
  error: "No se pudo cargar el CV. Intenta de nuevo.",
};

async function fetchState(slug: string): Promise<State> {
  try {
    const res = await authFetch(`/api/cv/form?slug=${encodeURIComponent(slug)}`);
    if (res.ok) {
      const d = await res.json();
      return { kind: "ready", data: d.formData ?? undefined };
    }
    const reason: Denied = res.status === 401 ? "login" : res.status === 403 ? "forbidden" : res.status === 404 ? "missing" : "error";
    return { kind: "denied", reason };
  } catch {
    return { kind: "denied", reason: "error" };
  }
}

// Loads a CV's form data through an owner-checked API route (the session
// lives in the browser, so the server can't verify ownership by itself),
// then mounts the Generator with it.
export default function EditCVLoader({ slug }: { slug: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [showAuth, setShowAuth] = useState(false);
  const loaded = useRef(false);

  const refresh = useCallback(() => {
    fetchState(slug).then(next => {
      if (next.kind === "ready") loaded.current = true;
      setState(next);
    });
  }, [slug]);

  useEffect(() => {
    refresh();
    // After signing in from this page, try again — but never once the form is
    // showing, or a refocus-triggered SIGNED_IN would reset what's being edited.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" && !loaded.current) refresh();
    });
    return () => subscription.unsubscribe();
  }, [refresh]);

  if (state.kind === "ready") return <Generator initialData={state.data} editSlug={slug} />;

  return (
    <section style={{ background: "var(--surface-dark)", padding: "120px 24px", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 420, color: "rgba(255,255,255,.8)" }}>
        {state.kind === "loading" ? (
          <p style={{ fontSize: 14 }}>Cargando tu CV…</p>
        ) : (
          <>
            <p style={{ fontSize: 16, marginBottom: 20 }}>{MESSAGES[state.reason]}</p>
            {state.reason === "login" && (
              <button onClick={() => setShowAuth(true)} style={{ background: "var(--green)", color: "#fff", border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 14, fontWeight: 500, fontFamily: "inherit", cursor: "pointer" }}>
                Iniciar sesión
              </button>
            )}
            {state.reason === "error" && (
              <button onClick={() => { setState({ kind: "loading" }); refresh(); }} style={{ background: "none", color: "#7dd4a0", border: "1px solid rgba(125,212,160,.4)", borderRadius: 8, padding: "12px 28px", fontSize: 14, fontFamily: "inherit", cursor: "pointer" }}>
                Reintentar
              </button>
            )}
            {(state.reason === "forbidden" || state.reason === "missing") && (
              <a href="/perfil" style={{ color: "#7dd4a0", fontSize: 14 }}>Ir a mis CVs →</a>
            )}
          </>
        )}
      </div>
      {showAuth && <AuthModal initialTab="login" onClose={() => setShowAuth(false)} />}
    </section>
  );
}
