"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

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
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hovered, setHovered] = useState(false);

  const url = `https://currivo.mx/cv/${cv.slug}`;

  function copyLink() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const { error } = await supabase.from("cvs").delete().eq("id", cv.id);
      if (error) throw error;
      onDelete(cv.id);
    } catch (e) {
      console.error(e);
      alert("Error al eliminar el CV. Intenta de nuevo.");
      setDeleting(false);
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
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <a
            href={`/cv/${cv.slug}`}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 11, padding: "5px 11px", border: "1px solid rgba(42,82,54,.25)", borderRadius: 5, textDecoration: "none", color: "var(--green)", fontWeight: 500, background: "var(--green-bg)" }}
          >
            Ver página
          </a>

          <button
            onClick={copyLink}
            style={{ fontSize: 11, padding: "5px 11px", border: `1px solid ${copied ? "rgba(42,82,54,.2)" : "var(--border)"}`, borderRadius: 5, cursor: "pointer", fontFamily: "inherit", color: copied ? "var(--green)" : "var(--muted)", background: copied ? "var(--green-bg)" : "none", transition: "all .15s" }}
          >
            {copied ? "¡Copiado!" : "Copiar"}
          </button>

          <a
            href="/#generador"
            style={{ fontSize: 11, padding: "5px 11px", border: "1px solid var(--border)", borderRadius: 5, textDecoration: "none", color: "var(--muted)", background: "none" }}
          >
            ✏ Editar
          </a>

          <button
            onClick={() => setShowModal(true)}
            style={{ fontSize: 11, padding: "5px 11px", border: "1px solid rgba(220,38,38,.2)", borderRadius: 5, cursor: "pointer", fontFamily: "inherit", color: "#dc2626", background: "none" }}
          >
            🗑 Borrar
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{ background: "var(--paper)", borderRadius: 10, padding: "28px 32px", maxWidth: 360, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>¿Eliminar este CV?</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6, lineHeight: 1.5 }}>
              <strong style={{ color: "var(--ink)" }}>{cv.nombre}</strong> — {cv.puesto}
            </p>
            <p style={{ fontSize: 12, color: "var(--hint)", marginBottom: 22 }}>Esta acción no se puede deshacer.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowModal(false)}
                disabled={deleting}
                style={{ fontSize: 13, padding: "8px 16px", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", background: "none", color: "var(--muted)" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ fontSize: 13, padding: "8px 16px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: deleting ? 0.7 : 1, display: "flex", alignItems: "center", gap: 6 }}
              >
                {deleting && <span style={{ width: 11, height: 11, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", animation: "spin .65s linear infinite", display: "inline-block" }} />}
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
