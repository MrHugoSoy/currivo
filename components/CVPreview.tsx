"use client";
import { useRef, useState, useEffect } from "react";
import { PREVIEW_TEMPLATES } from "@/lib/templates/index";
import type { TemplateId } from "@/lib/templates/types";

// Subset of form fields needed to build the live preview
export interface LiveFormData {
  nombre?: string;
  puesto?: string;
  ciudad?: string;
  email?: string;
  sinExperiencia?: boolean;
  experiencias?: Array<{ puesto: string; empresa: string; periodo: string; descripcion: string }>;
  languages?: Array<{ language: string; level: string }>;
  redesSociales?: Array<{ tipo: string; url: string }>;
  voluntariado?: string;
}

interface CVPreviewProps {
  market?: "mx" | "us" | "ca";
  photoUrl?: string;
  templateId?: TemplateId;
  formData?: LiveFormData;
}

// ── Mock data (shown when form is empty) ───────────────────────────────────

const MOCK_MX = `María García López
Diseñadora Gráfica Senior
📍 León, Gto. · ✉ maria@correo.com · ☎ +52 477 123 4567

OBJETIVO PROFESIONAL
Diseñadora con más de 5 años de experiencia en identidades corporativas y estrategia visual digital, busca empresa innovadora donde aportar expertise en branding.

EXPERIENCIA LABORAL

Diseñadora Gráfica Senior | Agencia Creativa MX | León, Gto. | 2020 – Presente
• Desarrollé +30 identidades corporativas con 95% de satisfacción
• Reduje tiempos de entrega en 40% implementando sistemas en Figma
• Lideré 3 campañas de rebranding aumentando ingresos en 25%

Diseñadora Freelance | Independiente | León, Gto. | 2018 – 2020
• Atendí a 15+ clientes en retail, restaurantes y servicios profesionales

HABILIDADES
Photoshop | Figma | Illustrator | CorelDRAW | Branding | UX Design

EDUCACIÓN

Lic. en Diseño Gráfico | Universidad de Guanajuato | León, Gto. | 2014 – 2018

IDIOMAS
Español (Nativo) | Inglés (Avanzado B2)`;

const MOCK_US = `María García López
Graphic Designer
Austin, TX · maria@email.com · linkedin.com/in/mariagl

PROFESSIONAL SUMMARY
Results-driven Graphic Designer with 5+ years delivering high-impact brand identities. Proven track record reducing delivery timelines by 40% through systematic design processes.

EXPERIENCE

Senior Graphic Designer | Creative Agency MX | Austin, TX | 2020 – Present
• Delivered 30+ corporate brand identities achieving 95% client satisfaction
• Reduced delivery time by 40% implementing Figma component systems
• Led 3 rebranding campaigns increasing client revenue by 25%

Freelance Designer | Self-employed | Remote | 2018 – 2020
• Served 15+ clients across retail, restaurants, and professional services

SKILLS
Adobe Photoshop | Figma | Illustrator | Brand Strategy | UX Design

EDUCATION
B.A. Graphic Design | University of Guanajuato | 2018`;

const MOCK_CA = `María García López
Graphic Designer
Toronto, ON · maria@email.com · linkedin.com/in/mariagl

PROFESSIONAL SUMMARY
Collaborative Graphic Designer with 5+ years building brand identities. Known for cross-cultural communication and delivering results in multicultural environments.

PROFESSIONAL EXPERIENCE

Senior Graphic Designer | Creative Agency | Toronto, ON | 2020 – Present
• Delivered 30+ brand identities achieving 95% client satisfaction rate
• Reduced delivery time by 40% through Figma design system implementation
• Mentored 2 junior designers in a collaborative team environment

Freelance Designer | Self-employed | Remote | 2018 – 2020
• Served 15+ clients across retail, hospitality, and professional services

VOLUNTEER WORK

Design Volunteer | Toronto Food Bank | Toronto, ON | 2021 – Present
• Designed fundraising materials contributing 8 hrs per month

CORE COMPETENCIES
Adobe Suite | Figma | Brand Strategy | Team Leadership | Cross-cultural Communication | Bilingual

EDUCATION
B.A. Graphic Design | University of Guanajuato | 2018

LANGUAGES
English — Native | French — Intermediate (B1) | Spanish — Native`;

const MOCK_TEXT: Record<"mx" | "us" | "ca", string> = { mx: MOCK_MX, us: MOCK_US, ca: MOCK_CA };

// ── Live cv_text builder ───────────────────────────────────────────────────

function buildLiveText(form: LiveFormData, market: "mx" | "us" | "ca"): string {
  const isMx = market === "mx";
  const lines: string[] = [];

  // Header
  lines.push(form.nombre || (isMx ? "Tu Nombre Completo" : "Your Full Name"));
  lines.push(form.puesto || (isMx ? "Puesto deseado" : "Desired Position"));

  const contacts: string[] = [];
  if (form.ciudad) contacts.push(isMx ? `📍 ${form.ciudad}` : form.ciudad);
  if (form.email)  contacts.push(isMx ? `✉ ${form.email}` : form.email);
  if (form.redesSociales?.length) {
    contacts.push(...form.redesSociales.filter(r => r.url).map(r => r.url));
  }
  if (contacts.length) lines.push(contacts.join(" · "));

  lines.push("");

  // Experience
  if (!form.sinExperiencia) {
    const validExp = (form.experiencias ?? []).filter(e => e.puesto || e.empresa || e.descripcion);
    if (validExp.length > 0) {
      lines.push(isMx ? "EXPERIENCIA LABORAL" : market === "us" ? "EXPERIENCE" : "PROFESSIONAL EXPERIENCE");
      lines.push("");
      for (const exp of validExp) {
        const parts = [exp.puesto, exp.empresa, exp.periodo].filter(Boolean);
        lines.push(parts.join(" | "));
        if (exp.descripcion) {
          const bullets = exp.descripcion
            .split(/(?<=[.!?])\s+|\n+/)
            .map(s => s.replace(/^[•·\-\*]\s*/, "").trim())
            .filter(s => s.length > 4);
          for (const b of bullets.slice(0, 4)) lines.push(`• ${b}`);
        }
        lines.push("");
      }
    }
  } else {
    lines.push(isMx ? "EDUCACIÓN" : "EDUCATION");
    lines.push(isMx ? "Agrega tu educación y proyectos personales" : "Add your education and personal projects");
    lines.push("");
  }

  // Volunteer (Canada)
  if (market === "ca" && form.voluntariado) {
    lines.push("VOLUNTEER WORK");
    lines.push("");
    lines.push(form.voluntariado);
    lines.push("");
  }

  // Languages
  const validLangs = (form.languages ?? []).filter(l => l.language);
  if (validLangs.length > 0) {
    lines.push(isMx ? "IDIOMAS" : "LANGUAGES");
    lines.push(validLangs.map(l => `${l.language} (${l.level})`).join(" | "));
    lines.push("");
  }

  return lines.join("\n");
}

// ── Component ─────────────────────────────────────────────────────────────

export default function CVPreview({ market = "mx", photoUrl, templateId = "clasico", formData }: CVPreviewProps) {
  const Preview = PREVIEW_TEMPLATES[templateId];

  const hasLiveData = !!(formData?.nombre || formData?.puesto || formData?.ciudad ||
    formData?.experiencias?.some(e => e.puesto || e.empresa || e.descripcion));

  const cvData = hasLiveData && formData
    ? {
        nombre: formData.nombre || (market === "mx" ? "Tu Nombre" : "Your Name"),
        puesto:  formData.puesto  || (market === "mx" ? "Puesto deseado" : "Desired Position"),
        ciudad:  formData.ciudad  || undefined,
        email:   formData.email   || undefined,
        mercado: market,
        cv_text: buildLiveText(formData, market),
      }
    : {
        nombre: "María García López",
        puesto:  market === "mx" ? "Diseñadora Gráfica Senior" : "Graphic Designer",
        ciudad:  market === "mx" ? "León, Gto." : market === "us" ? "Austin, TX" : "Toronto, ON",
        email:   "maria@email.com",
        mercado: market,
        cv_text: MOCK_TEXT[market],
      };

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      if (w > 0) setScale(w / 680);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const filename = hasLiveData && formData?.nombre
    ? `${formData.nombre.toLowerCase().replace(/\s+/g, "_")}_cv.pdf`
    : market === "mx" ? "currivo_cv_mexico.pdf"
    : market === "us" ? "maria_garcia_resume.pdf"
    : "maria_garcia_canada.pdf";

  return (
    <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,.04), 0 12px 32px rgba(0,0,0,.08)" }}>
      {/* Title bar */}
      <div style={{ background: "var(--warm)", padding: "9px 13px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ fontSize: 9, color: "var(--hint)", marginLeft: 7, flex: 1 }}>{filename}</span>
        <span style={{ fontSize: 9, background: "var(--green-bg)", color: "var(--green)", borderRadius: 100, padding: "2px 8px", border: "1px solid rgba(42,82,54,.15)", fontWeight: 500 }}>
          {market === "mx" ? "🇲🇽 México" : market === "us" ? "🇺🇸 US Resume" : "🇨🇦 Canada"}
        </span>
      </div>

      {/* Scaled preview */}
      <div ref={containerRef} style={{ overflow: "hidden", height: Math.round(680 * 0.97 * scale) }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 680, pointerEvents: "none" }}>
          <Preview data={cvData} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "8px 14px", background: "var(--warm)", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 8, color: "var(--hint)", letterSpacing: "0.5px" }}>
          currivo.mx · {templateId}
          {hasLiveData && <span style={{ marginLeft: 6, color: "var(--green)", fontWeight: 500 }}>● en vivo</span>}
        </span>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green-mid)" }} />
      </div>
    </div>
  );
}
