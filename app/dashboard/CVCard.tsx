"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteCV } from "./actions";

const FLAG: Record<string, string> = { mx: "🇲🇽", us: "🇺🇸", ca: "🇨🇦" };

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "hoy";
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} días`;
  if (days < 30) return `hace ${Math.floor(days / 7)} semanas`;
  if (days < 365) return `hace ${Math.floor(days / 30)} meses`;
  return `hace ${Math.floor(days / 365)} años`;
}

export interface CVCardData {
  id: string;
  slug: string;
  nombre: string;
  puesto: string;
  mercado: "mx" | "us" | "ca";
  template: string;
  created_at: string;
}

interface CVCardProps {
  cv: CVCardData;
  onDelete: (id: string) => void;
}

export function CVCard({ cv, onDelete }: CVCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/cv/${cv.slug}`;

  function handleCopy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteCV(cv.id);
      onDelete(cv.id);
    } catch {
      alert("Error al eliminar. Intenta de nuevo.");
    } finally {
      setDeleting(false);
      setShowModal(false);
    }
  }

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "var(--paper)",
          border: `1px solid ${hovered ? "rgba(42,82,54,.25)" : "var(--border)"}`,
          borderRadius: 8,
          padding: 20,
          marginBottom: 10,
          boxShadow: hovered ? "0 4px 12px rgba(0,0,0,.06)" : "none",
          transition: "border-color .15s, box-shadow .15s",
        }}
      >
        {/* Card header */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
          <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{FLAG[cv.mercado]}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {cv.nombre}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span>{cv.puesto}</span>
              <span style={{ color: "var(--hint)" }}>·</span>
              <span style={{ color: "var(--hint)" }}>{relativeDate(cv.created_at)}</span>
              {(cv.mercado === "us" || cv.mercado === "ca") && (
                <span style={{ fontSize: 10, color: "var(--hint)", background: "var(--warm)", borderRadius: 3, padding: "1px 6px", border: "1px solid var(--border)" }}>
                  English
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
          <button
            onClick={() => window.open(`/cv/${cv.slug}`, "_blank")}
            style={{ background: "var(--green)", color: "#fff", border: "none", borderRadius: 6, padding: "7px 14px", fontSize: 12, fontWeight: 500, fontFamily: "inherit", cursor: "pointer" }}
          >
            Ver página
          </button>

          <button
            onClick={handleCopy}
            style={{ background: "none", color: "var(--body)", border: "1px solid var(--border)", borderRadius: 6, padding: "7px 14px", fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}
          >
            {copied ? "¡Copiado!" : "🔗 Copiar"}
          </button>

          <button
            onClick={() => router.push(`/crear?edit=${cv.slug}`)}
            style={{ background: "none", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: 6, padding: "7px 14px", fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}
          >
            ✏ Editar
          </button>

          <button
            onClick={() => setShowModal(true)}
            onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
            style={{ background: "none", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 6, padding: "7px 14px", fontSize: 12, fontFamily: "inherit", cursor: "pointer", transition: "all .15s" }}
          >
            🗑 Borrar
          </button>
        </div>
      </div>

      {/* Delete modal */}
      {showModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 12, padding: 32, maxWidth: 400, width: "90%", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗑</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
              ¿Eliminar este CV?
            </h3>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6, lineHeight: 1.6 }}>
              <strong style={{ color: "var(--ink)" }}>{cv.nombre}</strong> — {cv.puesto}
            </p>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24, lineHeight: 1.6 }}>
              Esta acción no se puede deshacer.<br />
              El link público dejará de funcionar.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowModal(false)}
                disabled={deleting}
                style={{ flex: 1, background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "10px", fontSize: 13, fontFamily: "inherit", cursor: "pointer", color: "var(--body)" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ flex: 1, background: "#dc2626", border: "none", borderRadius: 6, padding: "10px", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: deleting ? "not-allowed" : "pointer", color: "#fff", opacity: deleting ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                {deleting && <span style={{ width: 11, height: 11, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", animation: "spin .65s linear infinite", display: "inline-block" }} />}
                {deleting ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
