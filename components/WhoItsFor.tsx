"use client";
import { SectionLabel } from "./HowItWorks";

const PROFILES = [
  { icon: "👨‍💼", title: "Ya tienes experiencia", desc: "Y quieres cambiar de trabajo o dar el siguiente paso en tu carrera." },
  { icon: "🎓", title: "Eres recién egresado", desc: "La IA se enfoca en tu educación, habilidades y proyectos — sin inventar experiencia." },
  { icon: "🌎", title: "Quieres trabajar en otro país", desc: "resumika adapta tu CV a las prácticas de contratación de México, USA o Canadá." },
  { icon: "🇲🇽", title: "Buscas empleo en México", desc: "Formato con foto, datos personales y objetivo profesional, como lo esperan los reclutadores." },
  { icon: "🇺🇸", title: "Buscas empleo en Estados Unidos", desc: "Resume de 1 página, optimizado para ATS, sin foto ni datos personales." },
  { icon: "🇨🇦", title: "Buscas empleo en Canadá", desc: "Voluntariado, bilingüismo y el formato que esperan los reclutadores canadienses." },
];

export default function WhoItsFor() {
  return (
    <section style={{ padding: "88px 0", background: "var(--paper)" }}>
      <style>{`
        .wif-inner { max-width: 1320px; margin: 0 auto; padding: 0 64px; }
        .wif-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 900px) {
          .wif-inner { padding: 0 24px; }
          .wif-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 560px) {
          .wif-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="wif-inner">
        <SectionLabel>¿Para quién es?</SectionLabel>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(30px, 3.5vw, 46px)", fontWeight: 600, color: "var(--ink)", letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 40, maxWidth: 620 }}>
          resumika es para ti <em style={{ color: "var(--green)", fontStyle: "italic" }}>si...</em>
        </h2>
        <div className="wif-grid">
          {PROFILES.map(p => (
            <div key={p.title} style={{ background: "var(--cream)", border: "1px solid var(--border)", borderRadius: 10, padding: "24px 22px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{p.icon}</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 5 }}>{p.title}</p>
                <p style={{ fontSize: 12.5, color: "var(--body)", lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
