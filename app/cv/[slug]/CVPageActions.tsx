"use client";
import { useState } from "react";

interface Props {
  slug: string;
  mercado: string;
  templateId: string;
}

export function CVPageActions({ slug, mercado, templateId }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleEdit() {
    window.location.href = `/editar/${slug}`;
  }

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

      <button
        onClick={handleEdit}
        style={{
          fontSize: 12, color: "var(--muted)",
          border: "1px solid var(--border)", borderRadius: 5,
          padding: "7px 14px", cursor: "pointer",
          fontFamily: "inherit", background: "none",
        }}
      >
        ✏ Editar
      </button>
    </div>
  );
}
