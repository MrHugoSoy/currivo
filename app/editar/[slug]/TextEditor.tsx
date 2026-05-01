"use client";
import { useState, useRef, useTransition } from "react";
import { PREVIEW_TEMPLATES } from "@/lib/templates/previews";
import type { TemplateId, CVData } from "@/lib/templates/types";
import { saveCVText } from "../actions";

interface Props {
  slug: string;
  nombre: string;
  puesto: string;
  initialText: string;
  templateId: string;
  mercado: string;
}

export default function TextEditor({ slug, nombre, puesto, initialText, templateId, mercado }: Props) {
  const [text, setText] = useState(initialText);
  const [previewText, setPreviewText] = useState(initialText);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const Preview = PREVIEW_TEMPLATES[(templateId as TemplateId)] ?? PREVIEW_TEMPLATES.clasico;

  const cvData: CVData = {
    nombre,
    puesto,
    mercado: mercado as CVData["mercado"],
    cv_text: previewText,
  };

  function handleChange(value: string) {
    setText(value);
    if (saveState === "saved") setSaveState("idle");
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setPreviewText(value), 400);
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await saveCVText(slug, text);
        setPreviewText(text);
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    });
  }

  const saveLabel = isPending ? "Guardando..." : saveState === "saved" ? "✓ Guardado" : saveState === "error" ? "Error — reintentar" : "Guardar cambios";

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--cream)", fontFamily: "'DM Sans','Nunito Sans',sans-serif" }}>

      {/* Header */}
      <header style={{
        height: 52, flexShrink: 0,
        background: "var(--paper)", borderBottom: "1px solid var(--border)",
        padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <a
            href={`/cv/${slug}`}
            style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none", flexShrink: 0 }}
          >
            ← Ver CV
          </a>
          <span style={{ color: "var(--border2)", fontSize: 14 }}>/</span>
          <span style={{
            fontSize: 13, fontWeight: 500, color: "var(--ink)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {nombre} — {puesto}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
          <a
            href={`/crear?edit=${slug}`}
            style={{
              fontSize: 12, color: "var(--muted)", textDecoration: "none",
              border: "1px solid var(--border)", borderRadius: 6, padding: "6px 14px",
            }}
          >
            Regenerar con IA →
          </a>
          <button
            onClick={handleSave}
            disabled={isPending}
            style={{
              background: saveState === "saved" ? "var(--green-bg)" : saveState === "error" ? "#fef2f2" : "var(--green)",
              color: saveState === "saved" ? "var(--green)" : saveState === "error" ? "#dc2626" : "#fff",
              border: saveState !== "idle" ? `1px solid ${saveState === "saved" ? "rgba(45,90,61,.2)" : "#fecaca"}` : "none",
              borderRadius: 6, padding: "7px 18px",
              fontSize: 13, fontWeight: 500, fontFamily: "inherit",
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.7 : 1,
              transition: "all .2s",
            }}
          >
            {saveLabel}
          </button>
        </div>
      </header>

      {/* Body: editor + preview */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Left: textarea */}
        <div style={{
          width: "42%", flexShrink: 0,
          display: "flex", flexDirection: "column",
          borderRight: "1px solid var(--border)",
          background: "var(--paper)",
        }}>
          <div style={{
            padding: "8px 16px", borderBottom: "1px solid var(--border)",
            fontSize: 10, letterSpacing: 1.5, fontWeight: 600, textTransform: "uppercase",
            color: "var(--hint)",
          }}>
            Texto del CV
          </div>
          <textarea
            value={text}
            onChange={e => handleChange(e.target.value)}
            spellCheck={false}
            autoCorrect="off"
            style={{
              flex: 1, resize: "none",
              border: "none", outline: "none",
              padding: "16px 18px",
              fontFamily: "'Courier New', 'Consolas', monospace",
              fontSize: 12, lineHeight: 1.75,
              color: "var(--ink)", background: "transparent",
            }}
          />
          <div style={{
            padding: "8px 16px", borderTop: "1px solid var(--border)",
            fontSize: 10, color: "var(--hint)",
          }}>
            {text.split("\n").length} líneas · {text.length} caracteres
          </div>
        </div>

        {/* Right: preview */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px", background: "var(--cream)" }}>
          <div style={{
            fontSize: 10, letterSpacing: 1.5, fontWeight: 600, textTransform: "uppercase",
            color: "var(--hint)", marginBottom: 14,
          }}>
            Previsualización en tiempo real
          </div>
          <div style={{
            boxShadow: "0 2px 4px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.08)",
            borderRadius: 8, overflow: "hidden",
            width: "fit-content", maxWidth: "100%",
          }}>
            <Preview data={cvData} />
          </div>
        </div>
      </div>
    </div>
  );
}
