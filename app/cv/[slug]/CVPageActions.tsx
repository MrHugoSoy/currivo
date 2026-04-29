"use client";
import { useState } from "react";

interface Props {
  slug: string;
  mercado: string;
}

export function CVPageActions({ slug, mercado }: Props) {
  const [downloading, setDownloading] = useState(false);

  async function downloadPDF() {
    setDownloading(true);
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, template: "clasico", mercado }),
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

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 22 }}>
      <button
        onClick={downloadPDF}
        disabled={downloading}
        style={{
          fontSize: 12,
          background: downloading ? "rgba(74,144,96,.6)" : "var(--green-mid)",
          color: "#fff",
          border: "none",
          borderRadius: 5,
          padding: "9px 20px",
          cursor: downloading ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 6,
          opacity: downloading ? 0.8 : 1,
        }}
      >
        {downloading ? (
          <>
            <span style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", animation: "spin .65s linear infinite", display: "inline-block" }} />
            Generando PDF...
          </>
        ) : (
          "⬇ Descargar PDF"
        )}
      </button>
    </div>
  );
}
