import type { Metadata } from "next";
import { TEMPLATES } from "@/lib/templates/types";
import ClasicoPreview from "@/lib/templates/clasico/Preview";
import ModernoPreview from "@/lib/templates/moderno/Preview";
import MinimalistaPreview from "@/lib/templates/minimalista/Preview";
import OscuroPreview from "@/lib/templates/oscuro/Preview";
import type { CVData, TemplateId } from "@/lib/templates/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Plantillas de CV | resumika",
  description: "Elige entre 4 plantillas de currículum profesional. Clásico, Moderno, Minimalista y Oscuro — todas optimizadas para ATS.",
  alternates: { canonical: "https://resumika.com/plantillas" },
};

const SAMPLE: CVData = {
  nombre: "Carlos Mendoza Ruiz",
  puesto: "Ingeniero de Software Senior",
  ciudad: "Guadalajara, Jal.",
  email: "carlos@correo.com",
  mercado: "mx",
  cv_text: `Carlos Mendoza Ruiz
Ingeniero de Software Senior
Guadalajara, Jal. · carlos@correo.com · +52 33 1234 5678

EXPERIENCIA LABORAL
Ingeniero Senior
TechMX · Guadalajara
2021 — Presente
• Desarrolló microservicios que redujeron latencia en 45%
• Lideró equipo de 5 desarrolladores
• Implementó pipeline de CI/CD reduciendo tiempos de deploy en 60%

Desarrollador Backend
StartupGDL · Guadalajara
2019 — 2021
• Implementó APIs REST para 50,000 usuarios activos
• Diseñó arquitectura de base de datos con PostgreSQL

HABILIDADES
Node.js · Python · AWS · Docker · PostgreSQL · React

EDUCACIÓN
Ing. en Sistemas Computacionales
ITESO
2019

IDIOMAS
Español (Nativo)
Inglés (Avanzado C1)`,
};

const PREVIEW_MAP: Record<TemplateId, React.ComponentType<{ data: CVData }>> = {
  clasico:     ClasicoPreview,
  moderno:     ModernoPreview,
  minimalista: MinimalistaPreview,
  oscuro:      OscuroPreview,
};

const SCALE = 0.42;
const PREVIEW_W = 680;
const PREVIEW_H = 920;

export default function PlantillasPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--cream)", paddingTop: 62 }}>
        <style>{`
          .pl-inner  { max-width: 1200px; margin: 0 auto; padding: 0 64px; }
          .pl-grid   { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; }
          .pl-card:hover .pl-card-border { border-color: rgba(42,82,54,.35) !important; box-shadow: 0 8px 32px rgba(0,0,0,.1); }
          @media (max-width: 900px) { .pl-grid { grid-template-columns: 1fr; } }
          @media (max-width: 640px) { .pl-inner { padding: 0 20px; } }
        `}</style>

        {/* Hero */}
        <div style={{ background: "var(--surface-dark)", padding: "64px 0 52px" }}>
          <div className="pl-inner">
            <p style={{ fontSize: 10, letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(255,255,255,.35)", marginBottom: 14 }}>
              Plantillas
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 4vw, 50px)", fontWeight: 600, color: "#f2ede5", letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 16 }}>
              Elige tu plantilla de CV
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,.5)", lineHeight: 1.7, maxWidth: 500 }}>
              4 diseños optimizados para ATS, adaptados a México, Canadá y EE.UU. Cambia de plantilla en cualquier momento sin perder tu información.
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="pl-inner" style={{ padding: "52px 64px 80px" }}>
          <div className="pl-grid">
            {TEMPLATES.map((t) => {
              const Preview = PREVIEW_MAP[t.id];
              return (
                <div key={t.id} className="pl-card">
                  <div
                    className="pl-card-border"
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      overflow: "hidden",
                      background: "var(--paper)",
                      transition: "border-color .2s, box-shadow .2s",
                    }}
                  >
                    {/* Preview */}
                    <div style={{ position: "relative", height: PREVIEW_H * SCALE, overflow: "hidden", background: t.colores.fondo }}>
                      <div style={{
                        position: "absolute", top: 0, left: 0,
                        transformOrigin: "top left",
                        transform: `scale(${SCALE})`,
                        width: PREVIEW_W,
                        pointerEvents: "none",
                      }}>
                        <Preview data={SAMPLE} />
                      </div>

                      {/* Badge libre/pro */}
                      <div style={{
                        position: "absolute", top: 12, right: 12,
                        fontSize: 10, fontWeight: 700, letterSpacing: "1px",
                        padding: "4px 10px", borderRadius: 100,
                        background: t.libre ? "rgba(42,82,54,.9)" : "rgba(180,140,40,.9)",
                        color: "#fff",
                        textTransform: "uppercase",
                      }}>
                        {t.libre ? "Gratis" : "Pro"}
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: "20px 24px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.3px", margin: 0 }}>
                          {t.nombre}
                        </h2>
                        <div style={{ display: "flex", gap: 5 }}>
                          {Object.values(t.colores).slice(0, 3).map((c, i) => (
                            <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c, border: "1px solid rgba(0,0,0,.08)" }} />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--body)", marginBottom: 18, lineHeight: 1.5 }}>
                        {t.descripcion}
                      </p>
                      <a
                        href="/crear"
                        style={{
                          display: "block", textAlign: "center",
                          background: t.libre ? "var(--green)" : "var(--ink)",
                          color: "#fff", textDecoration: "none",
                          borderRadius: 7, padding: "11px 0",
                          fontSize: 13, fontWeight: 500,
                          transition: "opacity .15s",
                        }}
                      >
                        {t.libre ? "Usar plantilla gratis →" : "Desbloquear con Pro →"}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom note */}
          <div style={{ marginTop: 48, textAlign: "center", padding: "28px 24px", background: "var(--paper)", borderRadius: 10, border: "1px solid var(--border)" }}>
            <p style={{ fontSize: 13, color: "var(--body)", lineHeight: 1.7, marginBottom: 12 }}>
              Todas las plantillas generan un PDF limpio, compatible con sistemas ATS y listo para enviar.
              <br />Puedes cambiar de plantilla después de crear tu CV sin perder ningún dato.
            </p>
            <a href="/crear" style={{ fontSize: 13, fontWeight: 500, color: "var(--green)", textDecoration: "none" }}>
              Crear mi CV ahora →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
