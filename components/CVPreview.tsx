"use client";
import { useRef, useState, useEffect } from "react";
import { PREVIEW_TEMPLATES } from "@/lib/templates/index";
import type { TemplateId } from "@/lib/templates/types";

export interface LiveFormData {
  nombre?: string;
  puesto?: string;
  ciudad?: string;
  email?: string;
  telefono?: string;
  photoUrl?: string;
  sinExperiencia?: boolean;
  experiencias?: Array<{ puesto: string; empresa: string; periodo: string; descripcion: string }>;
  languages?: Array<{ language: string; level: string }>;
  redesSociales?: Array<{ tipo: string; url: string }>;
  voluntariado?: string;
  habilidades?: string[];
  educacion?: Array<{ carrera: string; institucion: string; anio: string }>;
  certificaciones?: Array<{ nombre: string; institucion: string; anio: string }>;
}

interface CVPreviewProps {
  market?: "mx" | "us" | "ca";
  photoUrl?: string;
  templateId?: TemplateId;
  formData?: LiveFormData;
}

const MOCK = {
  mx: {
    nombre: "María García López", puesto: "Diseñadora Gráfica Senior",
    ciudad: "León, Gto.", email: "maria@correo.com", extra: "☎ +52 477 123 4567",
    summary: `OBJETIVO PROFESIONAL\nDiseñadora con más de 5 años de experiencia en identidades corporativas y estrategia visual digital, busca empresa innovadora donde aportar expertise en branding.`,
    experience: `EXPERIENCIA LABORAL\n\nDiseñadora Gráfica Senior | Agencia Creativa MX | León, Gto. | 2020 – Presente\n• Desarrollé +30 identidades corporativas con 95% de satisfacción\n• Reduje tiempos de entrega en 40% implementando sistemas en Figma\n\nDiseñadora Freelance | Independiente | León, Gto. | 2018 – 2020\n• Atendí a 15+ clientes en retail, restaurantes y servicios profesionales`,
    skills: `HABILIDADES\nPhotoshop, Figma, Illustrator, CorelDRAW, Branding, UX Design`,
    education: `EDUCACIÓN\n\nLic. en Diseño Gráfico | Universidad de Guanajuato | León, Gto. | 2014 – 2018`,
    languages: `IDIOMAS\nEspañol (Nativo) | Inglés (Avanzado B2)`,
  },
  us: {
    nombre: "María García López", puesto: "Graphic Designer",
    ciudad: "Austin, TX", email: "maria@email.com", extra: "linkedin.com/in/mariagl",
    summary: `PROFESSIONAL SUMMARY\nResults-driven Graphic Designer with 5+ years delivering high-impact brand identities. Proven track record reducing delivery timelines by 40%.`,
    experience: `EXPERIENCE\n\nSenior Graphic Designer | Creative Agency MX | Austin, TX | 2020 – Present\n• Delivered 30+ corporate brand identities achieving 95% client satisfaction\n• Reduced delivery time by 40% implementing Figma component systems\n\nFreelance Designer | Self-employed | Remote | 2018 – 2020\n• Served 15+ clients across retail, restaurants, and professional services`,
    skills: `SKILLS\nAdobe Photoshop, Figma, Illustrator, Brand Strategy, UX Design`,
    education: `EDUCATION\nB.A. Graphic Design | University of Guanajuato | 2018`,
    languages: `LANGUAGES\nEnglish (Native) | Spanish (Fluent)`,
  },
  ca: {
    nombre: "María García López", puesto: "Graphic Designer",
    ciudad: "Toronto, ON", email: "maria@email.com", extra: "linkedin.com/in/mariagl",
    summary: `PROFESSIONAL SUMMARY\nCollaborative Graphic Designer with 5+ years building brand identities. Known for cross-cultural communication and multicultural teamwork.`,
    experience: `PROFESSIONAL EXPERIENCE\n\nSenior Graphic Designer | Creative Agency | Toronto, ON | 2020 – Present\n• Delivered 30+ brand identities achieving 95% client satisfaction rate\n• Reduced delivery time by 40% through Figma design system implementation\n\nFreelance Designer | Self-employed | Remote | 2018 – 2020\n• Served 15+ clients across retail, hospitality, and professional services`,
    skills: `CORE COMPETENCIES\nAdobe Suite, Figma, Brand Strategy, Team Leadership, Cross-cultural Communication, Bilingual`,
    education: `EDUCATION\nB.A. Graphic Design | University of Guanajuato | 2018`,
    languages: `LANGUAGES\nEnglish (Native) | French (Intermediate B1) | Spanish (Native)`,
    volunteer: `VOLUNTEER WORK\n\nDesign Volunteer | Toronto Food Bank | Toronto, ON | 2021 – Present\n• Designed fundraising materials contributing 8 hrs per month`,
  },
} as const;

function buildHybridText(form: LiveFormData, market: "mx" | "us" | "ca"): string {
  const m = MOCK[market];
  const isMx = market === "mx";
  const lines: string[] = [];

  lines.push(form.nombre || m.nombre);
  lines.push(form.puesto  || m.puesto);
  lines.push([
    form.ciudad || m.ciudad,
    form.email  || m.email,
    ...((form.redesSociales ?? []).filter(r => r.url).map(r => r.url).length
      ? (form.redesSociales ?? []).filter(r => r.url).map(r => r.url)
      : [m.extra]),
  ].join(" · "));
  lines.push("");
  lines.push(m.summary);
  lines.push("");

  // Experience
  const userExps = (form.experiencias ?? []).filter(e => e.puesto || e.empresa || e.descripcion);
  if (!form.sinExperiencia) {
    if (userExps.length > 0) {
      lines.push(isMx ? "EXPERIENCIA LABORAL" : market === "us" ? "EXPERIENCE" : "PROFESSIONAL EXPERIENCE");
      lines.push("");
      for (const exp of userExps) {
        const parts = [exp.puesto, exp.empresa, exp.periodo].filter(Boolean);
        if (parts.length) lines.push(parts.join(" | "));
        if (exp.descripcion) {
          const bullets = exp.descripcion
            .split(/(?<=[.!?])\s+|\n+/)
            .map(s => s.replace(/^[•·\-\*]\s*/, "").trim())
            .filter(s => s.length > 4);
          for (const b of bullets.slice(0, 4)) lines.push(`• ${b}`);
        }
        lines.push("");
      }
    } else {
      lines.push(m.experience);
      lines.push("");
    }
  }

  // Volunteer (Canada)
  if (market === "ca") {
    lines.push(form.voluntariado ? `VOLUNTEER WORK\n\n${form.voluntariado}` : MOCK.ca.volunteer);
    lines.push("");
  }

  // Skills
  if (form.habilidades && form.habilidades.length > 0) {
    const header = isMx ? "HABILIDADES" : market === "us" ? "SKILLS" : "CORE COMPETENCIES";
    lines.push(`${header}\n${form.habilidades.join(", ")}`);
  } else {
    lines.push(m.skills);
  }
  lines.push("");

  // Certifications
  const certs = (form.certificaciones ?? []).filter(c => c.nombre?.trim());
  if (certs.length > 0) {
    const certHeader = isMx ? "CERTIFICACIONES" : "CERTIFICATIONS";
    lines.push(certHeader);
    lines.push("");
    for (const c of certs) {
      const parts = [c.nombre, c.institucion, c.anio].filter(Boolean);
      lines.push(parts.join(" | "));
    }
    lines.push("");
  }

  // Education
  const validEdu = (form.educacion ?? []).filter(e => e.carrera || e.institucion);
  if (validEdu.length > 0) {
    lines.push(isMx ? "EDUCACIÓN" : "EDUCATION");
    lines.push("");
    for (const edu of validEdu) {
      lines.push([edu.carrera, edu.institucion, edu.anio].filter(Boolean).join(" | "));
    }
  } else {
    lines.push(m.education);
  }
  lines.push("");

  // Languages
  const validLangs = (form.languages ?? []).filter(l => l.language);
  if (validLangs.length > 0) {
    lines.push(isMx ? "IDIOMAS" : "LANGUAGES");
    lines.push(validLangs.map(l => `${l.language} (${l.level})`).join(" | "));
  } else {
    lines.push(m.languages);
  }

  return lines.join("\n");
}

export default function CVPreview({ market = "mx", photoUrl, templateId = "clasico", formData }: CVPreviewProps) {
  const Preview = PREVIEW_TEMPLATES[templateId] ?? PREVIEW_TEMPLATES.clasico;
  const m = MOCK[market];

  const hasUserData = !!(
    formData?.nombre || formData?.puesto || formData?.ciudad ||
    formData?.email || formData?.experiencias?.some(e => e.puesto || e.empresa || e.descripcion)
  );

  // photoUrl: prop takes precedence, then formData
  const resolvedPhoto = photoUrl ?? formData?.photoUrl ?? undefined;

  const cvData = {
    nombre:   formData?.nombre  || m.nombre,
    puesto:   formData?.puesto  || m.puesto,
    ciudad:   formData?.ciudad  || m.ciudad,
    email:    formData?.email   || m.email,
    mercado:  market,
    photoUrl: resolvedPhoto,
    cv_text:  formData
      ? buildHybridText(formData, market)
      : [m.nombre, m.puesto, m.ciudad, "", m.summary, "", m.experience, "", m.skills, "", m.education, "", m.languages].join("\n"),
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef   = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);
  const [contentHeight, setContentHeight] = useState(880);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      if (w > 0) setScale(w / 680);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;
    const obs = new ResizeObserver(entries => {
      const h = entries[0].contentRect.height;
      if (h > 0) setContentHeight(h);
    });
    obs.observe(contentRef.current);
    return () => obs.disconnect();
  }, []);

  const filename = hasUserData && formData?.nombre
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
      <div ref={containerRef} style={{ overflow: "hidden", height: Math.round(contentHeight * scale) }}>
        <div ref={contentRef} style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 680, pointerEvents: "none" }}>
          <Preview data={cvData} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "8px 14px", background: "var(--warm)", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 8, color: "var(--hint)", letterSpacing: "0.5px" }}>
          currivo.mx · {templateId}
          {hasUserData && <span style={{ marginLeft: 6, color: "var(--green)", fontWeight: 500 }}>● en vivo</span>}
        </span>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green-mid)" }} />
      </div>
    </div>
  );
}
