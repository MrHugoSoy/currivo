"use client";
import { useState } from "react";
import { SectionLabel } from "./HowItWorks";
import { FAQS } from "@/lib/faqData";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" style={{ padding: "88px 0", background: "var(--cream)" }}>
      <style>{`
        .faq-inner { max-width: 900px; margin: 0 auto; padding: 0 64px; }
        @media (max-width: 900px) { .faq-inner { padding: 0 24px; } }
      `}</style>
      <div className="faq-inner">
        <SectionLabel>Preguntas frecuentes</SectionLabel>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(30px, 3.5vw, 46px)", fontWeight: 600, color: "var(--ink)", letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 36 }}>
          Antes de <em style={{ color: "var(--green)", fontStyle: "italic" }}>empezar</em>
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} style={{ border: "1px solid var(--border)", borderRadius: 10, background: "var(--paper)", overflow: "hidden" }}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, background: "none", border: "none", cursor: "pointer", padding: "18px 22px", textAlign: "left", fontFamily: "inherit" }}
                >
                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{f.q}</span>
                  <span style={{ fontSize: 14, color: "var(--hint)", flexShrink: 0, transform: isOpen ? "rotate(45deg)" : "none", transition: "transform .15s" }}>+</span>
                </button>
                {isOpen && (
                  <p style={{ fontSize: 13, color: "var(--body)", lineHeight: 1.7, padding: "0 22px 20px" }}>{f.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
