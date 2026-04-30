"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAILS = ["hugoivanrf@gmail.com"];

interface Props {
  slug: string;
  mercado: string;
  templateId: string;
}

export function CVPageActions({ slug, mercado, templateId }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAdmin(ADMIN_EMAILS.includes(data.session?.user?.email ?? ""));
    });
  }, []);

  async function downloadPDF() {
    setDownloading(true);
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, template: templateId, mercado }),
      });
      if (!res.ok) throw new Error("Error generando PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Error al generar el PDF. Intenta de nuevo.");
    } finally {
      setDownloading(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="no-print"
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        background: "var(--paper)",
        borderRadius: 8,
        boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.04)",
        padding: "12px 20px",
        marginBottom: 24,
        flexWrap: "wrap",
      }}
    >
      <button
        onClick={downloadPDF}
        disabled={downloading}
        style={{
          fontSize: 12, background: "var(--green-mid)", color: "#fff",
          border: "none", borderRadius: 5, padding: "8px 16px",
          cursor: downloading ? "not-allowed" : "pointer",
          fontFamily: "inherit", fontWeight: 500,
          display: "flex", alignItems: "center", gap: 6,
          opacity: downloading ? 0.75 : 1,
        }}
      >
        {downloading ? (
          <>
            <span style={{ width: 11, height: 11, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", animation: "spin .65s linear infinite", display: "inline-block", flexShrink: 0 }} />
            Generando...
          </>
        ) : "⬇ Descargar PDF"}
      </button>

      <button
        onClick={copyLink}
        style={{
          fontSize: 12,
          background: copied ? "var(--green-bg)" : "none",
          color: copied ? "var(--green)" : "var(--muted)",
          border: `1px solid ${copied ? "rgba(42,82,54,.2)" : "var(--border)"}`,
          borderRadius: 5, padding: "7px 14px",
          cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
        }}
      >
        {copied ? "✓ Copiado" : "🔗 Copiar link"}
      </button>

      {isAdmin && (
        <>
          <a
            href="/#generador"
            style={{
              fontSize: 12, color: "var(--muted)",
              border: "1px solid var(--border)", borderRadius: 5,
              padding: "7px 14px", textDecoration: "none",
            }}
          >
            ✏ Editar
          </a>
          <DeleteButton slug={slug} />
        </>
      )}
    </div>
  );
}

function DeleteButton({ slug }: { slug: string }) {
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const { error } = await supabase.from("cvs").delete().eq("slug", slug);
      if (error) throw error;
      window.location.href = "/dashboard";
    } catch (e) {
      console.error(e);
      alert("Error al eliminar el CV.");
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          fontSize: 12, color: "#dc2626",
          border: "1px solid rgba(220,38,38,.2)", borderRadius: 5,
          padding: "7px 14px", cursor: "pointer",
          fontFamily: "inherit", background: "none",
        }}
      >
        🗑 Eliminar
      </button>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "var(--paper)", borderRadius: 10, padding: "28px 32px", maxWidth: 360, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>¿Eliminar este CV?</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 22, lineHeight: 1.5 }}>Esta acción no se puede deshacer.</p>
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
                style={{ fontSize: 13, padding: "8px 16px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: deleting ? 0.7 : 1 }}
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
