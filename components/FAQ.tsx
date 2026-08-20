"use client";
import { useState } from "react";
import { SectionLabel } from "./HowItWorks";
import { FAQS } from "@/lib/faqData";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" style={{ padding: "88px 0", background: "var(--paper)" }}>
      <style>{`
        .faq-inner { max-width: 1320px; margin: 0 auto; padding: 0 64px; }
        .faq-header { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: end; margin-bottom: 48px; }
        @media (max-width: 900px) {
          .faq-inner { padding: 0 24px; }
          .faq-header { grid-template-columns: 1fr; gap: 16px; margin-bottom: 32px; }
        }
        @media (max-width: 480px) {
          .faq-inner { padding: 0 16px; }
        }
      `}</style>
      <div className="faq-inner">
        <SectionLabel>Preguntas frecuentes</SectionLabel>
        <div className="faq-header">
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(30px, 3.5vw, 46px)", fontWeight: 600, color: "var(--ink)", letterSpacing: "-1px", lineHeight: 1.1 }}>
            Antes de <em style={{ color: "var(--green)", fontStyle: "italic" }}>empezar</em>
          </h2>
          <p style={{ fontSize: 15, color: "var(--body)", lineHeight: 1.75, paddingBottom: 4 }}>
            Lo que más nos preguntan antes de crear su primer CV con resumika.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                style={{
                  border: `1px solid ${isOpen ? "rgba(29,78,216,.35)" : "var(--border)"}`,
                  borderRadius: 10,
                  background: "var(--cream)",
                  overflow: "hidden",
                  boxShadow: isOpen ? "0 8px 24px rgba(29,78,216,.08)" : "0 1px 2px rgba(20,30,60,.04)",
                  transition: "border-color .15s, box-shadow .15s",
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, background: "none", border: "none", cursor: "pointer", padding: "18px 22px", textAlign: "left", fontFamily: "inherit" }}
                >
                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{f.q}</span>
                  <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: "50%", background: isOpen ? "var(--green)" : "var(--warm)", color: isOpen ? "#fff" : "var(--hint)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", transform: isOpen ? "rotate(45deg)" : "none", transition: "transform .15s, background .15s, color .15s" }}>+</span>
                </button>
                {isOpen && (
                  <p style={{ fontSize: 13, color: "var(--body)", lineHeight: 1.7, padding: "0 22px 20px", maxWidth: 720 }}>{f.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
