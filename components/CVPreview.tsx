"use client";
import { useRef, useState, useEffect, useMemo } from "react";
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

type MockProfile = {
  mercado: "mx" | "us" | "ca";
  nombre: string; puesto: string; ciudad: string; email: string; extra: string;
  summary: string; experience: string; skills: string; education: string;
  languages: string; volunteer?: string;
};

const MOCK_PROFILES: MockProfile[] = [
  {
    mercado: "mx",
    nombre: "Carlos Mendoza Ruiz", puesto: "Ingeniero de Software Senior",
    ciudad: "Guadalajara, Jal.", email: "carlos@correo.com", extra: "☎ +52 33 1234 5678",
    summary: "OBJETIVO PROFESIONAL\nIngeniero con 6 años de experiencia en desarrollo backend y arquitectura cloud. Busca liderar equipos técnicos en empresa de tecnología innovadora.",
    experience: "EXPERIENCIA LABORAL\n\nIngeniero Senior | TechMX | Guadalajara | 2021 – Presente\n• Desarrollé microservicios que redujeron latencia en 45%\n• Lideré equipo de 5 desarrolladores\n\nDesarrollador Backend | StartupGDL | Guadalajara | 2019 – 2021\n• Implementé APIs REST para 50,000 usuarios activos",
    skills: "HABILIDADES\nNode.js, Python, AWS, Docker, PostgreSQL, React",
    education: "EDUCACIÓN\nIng. en Sistemas Computacionales | ITESO | 2019",
    languages: "IDIOMAS\nEspañol (Nativo) | Inglés (Avanzado C1)",
  },
  {
    mercado: "mx",
    nombre: "Ana Sofía Reyes", puesto: "Gerente de Marketing Digital",
    ciudad: "Ciudad de México", email: "ana@correo.com", extra: "☎ +52 55 9876 5432",
    summary: "OBJETIVO PROFESIONAL\nMarketer digital con 8 años de experiencia en estrategia de contenidos y campañas de performance. Especialista en growth hacking para startups.",
    experience: "EXPERIENCIA LABORAL\n\nGerente de Marketing | AgenciaDMX | CDMX | 2020 – Presente\n• Aumenté ROI de campañas digitales en 120%\n• Gestioné presupuesto de $2M MXN anuales\n\nEspecialista SEO/SEM | E-commerce MX | CDMX | 2018 – 2020\n• Incrementé tráfico orgánico en 300% en 12 meses",
    skills: "HABILIDADES\nGoogle Ads, Meta Ads, SEO, HubSpot, Analytics, Copywriting",
    education: "EDUCACIÓN\nLic. en Comunicación | UNAM | 2017",
    languages: "IDIOMAS\nEspañol (Nativo) | Inglés (Fluido) | Portugués (Básico)",
  },
  {
    mercado: "mx",
    nombre: "Roberto Jiménez Castro", puesto: "Contador Público Certificado",
    ciudad: "Monterrey, N.L.", email: "roberto@correo.com", extra: "☎ +52 81 2345 6789",
    summary: "OBJETIVO PROFESIONAL\nContador con 10 años de experiencia en auditoría fiscal y planeación financiera para empresas medianas y grandes del sector industrial.",
    experience: "EXPERIENCIA LABORAL\n\nContador Senior | Grupo Industrial NL | MTY | 2019 – Presente\n• Reduje carga fiscal de la empresa en 18% mediante planeación estratégica\n• Coordiné auditorías para 3 subsidiarias\n\nAuditor | Deloitte México | MTY | 2016 – 2019\n• Realicé auditorías a empresas con ingresos de hasta $500M MXN",
    skills: "HABILIDADES\nSAP, Excel Avanzado, CFDI, IMSS, Auditoría, Finanzas",
    education: "EDUCACIÓN\nLic. en Contaduría Pública | UANL | 2014 | Cédula Profesional",
    languages: "IDIOMAS\nEspañol (Nativo) | Inglés (Intermedio B1)",
  },
  {
    mercado: "mx",
    nombre: "Valentina Cruz Soto", puesto: "Médico General",
    ciudad: "Puebla, Pue.", email: "valentina@correo.com", extra: "☎ +52 222 345 6789",
    summary: "OBJETIVO PROFESIONAL\nMédico general con 4 años de experiencia en atención primaria y medicina preventiva. Busca posición en institución de salud de alto impacto social.",
    experience: "EXPERIENCIA LABORAL\n\nMédico General | Clínica Ángeles Puebla | Puebla | 2022 – Presente\n• Atiendo 25+ pacientes diarios con 98% de satisfacción\n• Implementé programa de medicina preventiva para 500 pacientes\n\nMédico Residente | IMSS | Puebla | 2020 – 2022\n• Completé residencia con mención honorífica",
    skills: "HABILIDADES\nDiagnóstico Clínico, ACLS, Ultrasonido Básico, Expediente Electrónico, Medicina Preventiva",
    education: "EDUCACIÓN\nMédico Cirujano | BUAP | 2020 | Cédula Profesional",
    languages: "IDIOMAS\nEspañol (Nativo) | Inglés (Intermedio B2)",
  },
  {
    mercado: "mx",
    nombre: "Diego Ramírez Ortega", puesto: "Arquitecto",
    ciudad: "León, Gto.", email: "diego@correo.com", extra: "☎ +52 477 987 6543",
    summary: "OBJETIVO PROFESIONAL\nArquitecto con 5 años de experiencia en diseño residencial y comercial. Especialista en arquitectura sustentable y proyectos LEED.",
    experience: "EXPERIENCIA LABORAL\n\nArquitecto Proyectista | Estudio ARQ León | León | 2021 – Presente\n• Diseñé 15+ proyectos residenciales de lujo\n• Reduje costos de construcción 20% con materiales sustentables\n\nArquitecto Junior | Constructora GTO | León | 2019 – 2021\n• Coordiné obra de edificio comercial de 8 niveles",
    skills: "HABILIDADES\nAutoCAD, Revit, SketchUp, 3ds Max, ArchiCAD, Certificación LEED",
    education: "EDUCACIÓN\nLic. en Arquitectura | Universidad Iberoamericana León | 2019",
    languages: "IDIOMAS\nEspañol (Nativo) | Inglés (Avanzado C1) | Italiano (Básico)",
  },
  {
    mercado: "us",
    nombre: "Miguel Torres", puesto: "Product Manager",
    ciudad: "Austin, TX", email: "miguel@email.com", extra: "linkedin.com/in/migueltorres",
    summary: "PROFESSIONAL SUMMARY\nData-driven Product Manager with 7+ years launching B2B SaaS products. Led cross-functional teams delivering $2M+ ARR growth through agile methodologies.",
    experience: "EXPERIENCE\n\nSenior Product Manager | TechCorp | Austin, TX | 2021 – Present\n• Launched 3 product features increasing MRR by 35%\n• Led team of 8 engineers and 2 designers\n\nProduct Manager | StartupATX | Austin, TX | 2019 – 2021\n• Reduced customer churn by 22% through data analysis",
    skills: "SKILLS\nProduct Strategy, Agile/Scrum, SQL, Mixpanel, Jira, Figma",
    education: "EDUCATION\nB.S. Computer Science | UT Austin | 2018",
    languages: "LANGUAGES\nEnglish (Native) | Spanish (Fluent)",
  },
  {
    mercado: "us",
    nombre: "Daniela Morales", puesto: "UX/UI Designer",
    ciudad: "San Francisco, CA", email: "daniela@email.com", extra: "portfolio.daniela.design",
    summary: "PROFESSIONAL SUMMARY\nCreative UX Designer with 5+ years crafting user-centered digital experiences. Increased conversion rates by 40% through research-driven design at Series B startup.",
    experience: "EXPERIENCE\n\nSenior UX Designer | FinTech SF | San Francisco, CA | 2022 – Present\n• Redesigned onboarding flow increasing activation by 40%\n• Conducted 50+ user interviews informing product roadmap\n\nUI Designer | Agency Creative | Remote | 2020 – 2022\n• Delivered 20+ projects for Fortune 500 clients",
    skills: "SKILLS\nFigma, Prototyping, User Research, Design Systems, Usability Testing",
    education: "EDUCATION\nB.A. Graphic Design | SFSU | 2019",
    languages: "LANGUAGES\nEnglish (Fluent) | Spanish (Native)",
  },
  {
    mercado: "us",
    nombre: "Fernando Castillo", puesto: "Data Scientist",
    ciudad: "New York, NY", email: "fernando@email.com", extra: "github.com/fcastillo",
    summary: "PROFESSIONAL SUMMARY\nData Scientist with 4+ years building ML models for financial services. Delivered predictive models saving $1.2M annually in fraud detection.",
    experience: "EXPERIENCE\n\nData Scientist | JPFinance | New York, NY | 2022 – Present\n• Built fraud detection model with 94% accuracy\n• Reduced false positives by 31% saving $1.2M annually\n\nML Engineer | DataLab NYC | New York, NY | 2021 – 2022\n• Developed NLP pipeline processing 10M+ records daily",
    skills: "SKILLS\nPython, TensorFlow, SQL, Spark, AWS SageMaker, Tableau",
    education: "EDUCATION\nM.S. Data Science | Columbia University | 2021",
    languages: "LANGUAGES\nEnglish (Fluent) | Spanish (Native) | Portuguese (Basic)",
  },
  {
    mercado: "us",
    nombre: "Isabella Rodriguez", puesto: "Registered Nurse",
    ciudad: "Miami, FL", email: "isabella@email.com", extra: "linkedin.com/in/isabellarodriguez",
    summary: "PROFESSIONAL SUMMARY\nBilingual RN with 6 years experience in ICU and emergency care. ACLS/BLS certified. Known for exceptional patient care and cross-cultural communication with Hispanic communities.",
    experience: "EXPERIENCE\n\nICU Registered Nurse | Miami General Hospital | Miami, FL | 2021 – Present\n• Providing critical care for 4-6 patients per shift\n• Reduced medication errors by 15% implementing double-check protocol\n\nER Nurse | Jackson Memorial | Miami, FL | 2019 – 2021\n• Managed high-volume ER with 200+ daily visits",
    skills: "SKILLS\nICU Care, ACLS, BLS, Epic EHR, IV Therapy, Bilingual Patient Care",
    education: "EDUCATION\nB.S. Nursing | Florida International University | 2018",
    languages: "LANGUAGES\nEnglish (Fluent) | Spanish (Native)",
  },
  {
    mercado: "ca",
    nombre: "Laura Hernández", puesto: "Project Manager",
    ciudad: "Toronto, ON", email: "laura@email.com", extra: "linkedin.com/in/laurahernandez",
    summary: "PROFESSIONAL SUMMARY\nPMP-certified Project Manager with 8 years delivering complex IT projects in multicultural environments. Managed $5M+ budgets with 95% on-time delivery rate.",
    experience: "PROFESSIONAL EXPERIENCE\n\nSenior Project Manager | TechToronto | Toronto, ON | 2021 – Present\n• Delivered 12 projects on time and 8% under budget\n• Led cross-cultural team of 15 across 4 time zones\n\nProject Coordinator | ConsultingCA | Toronto, ON | 2019 – 2021\n• Coordinated 3 simultaneous projects worth $2M+",
    skills: "CORE COMPETENCIES\nPMP Certified | Agile | Risk Management | Stakeholder Communication | MS Project | Bilingual",
    education: "EDUCATION\nB.Eng. Industrial Engineering | Universidad Iberoamericana | 2016\n(WES Evaluated — Canadian Equivalency: Bachelor's Degree)",
    languages: "LANGUAGES\nEnglish (Professional) | Spanish (Native) | French (Basic A2)",
    volunteer: "VOLUNTEER WORK\n\nMentor | Newcomers Career Network | Toronto | 2022 – Present\n• Mentored 8 Latin American professionals in Canadian job market",
  },
  {
    mercado: "ca",
    nombre: "Andrés Vargas", puesto: "Civil Engineer",
    ciudad: "Vancouver, BC", email: "andres@email.com", extra: "linkedin.com/in/andresvargas",
    summary: "PROFESSIONAL SUMMARY\nCivil Engineer with 6 years of experience in infrastructure and construction project management. Delivered projects valued at $15M+ across Latin America and Canada.",
    experience: "PROFESSIONAL EXPERIENCE\n\nProject Engineer | BuildBC | Vancouver, BC | 2023 – Present\n• Managing $8M residential development project\n• Coordinating with municipal authorities and contractors\n\nCivil Engineer | Constructora Nacional | Colombia | 2019 – 2022\n• Led infrastructure projects serving 50,000+ residents",
    skills: "CORE COMPETENCIES\nAutoCAD | Project Management | Structural Analysis | Budgeting | Team Leadership | Multicultural Communication",
    education: "EDUCATION\nB.Eng. Civil Engineering | Universidad de los Andes | 2018\n(WES Evaluated — Canadian Equivalency: Bachelor's Degree)",
    languages: "LANGUAGES\nEnglish (Professional) | Spanish (Native) | French (Intermediate B1)",
    volunteer: "VOLUNTEER WORK\n\nVolunteer Builder | Habitat for Humanity | Vancouver | 2023 – Present\n• Contributing technical expertise 10 hrs/month",
  },
  {
    mercado: "ca",
    nombre: "Camila Flores", puesto: "Marketing Manager",
    ciudad: "Montreal, QC", email: "camila@email.com", extra: "linkedin.com/in/camilaflores",
    summary: "PROFESSIONAL SUMMARY\nBilingual Marketing Manager with 7 years experience in digital strategy for consumer brands. Increased brand awareness by 65% through integrated campaigns in English and French markets.",
    experience: "PROFESSIONAL EXPERIENCE\n\nMarketing Manager | BrandMTL | Montreal, QC | 2022 – Present\n• Led bilingual campaigns reaching 500K+ consumers\n• Increased digital engagement by 65% YoY\n\nDigital Strategist | AgenceMTL | Montreal, QC | 2020 – 2022\n• Managed $800K annual media budget across EN/FR markets",
    skills: "CORE COMPETENCIES\nBilingual Marketing (EN/FR) | Digital Strategy | Brand Management | Google Ads | Meta Ads | Analytics",
    education: "EDUCATION\nB.A. Marketing | McGill University | 2019",
    languages: "LANGUAGES\nFrench (Professional) | English (Fluent) | Spanish (Native)",
    volunteer: "VOLUNTEER WORK\n\nCommunity Organizer | Latino MTL Association | Montreal | 2021 – Present\n• Organized 5 networking events connecting 200+ Latin American professionals",
  },
];

function buildHybridText(form: LiveFormData, market: "mx" | "us" | "ca", mock: MockProfile): string {
  const isMx = market === "mx";
  const lines: string[] = [];

  lines.push(form.nombre || mock.nombre);
  lines.push(form.puesto  || mock.puesto);
  lines.push([
    form.ciudad || mock.ciudad,
    form.email  || mock.email,
    ...((form.redesSociales ?? []).filter(r => r.url).map(r => r.url).length
      ? (form.redesSociales ?? []).filter(r => r.url).map(r => r.url)
      : [mock.extra]),
  ].join(" · "));
  lines.push("");
  lines.push(mock.summary);
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
      lines.push(mock.experience);
      lines.push("");
    }
  }

  // Volunteer (Canada)
  if (market === "ca") {
    lines.push(form.voluntariado
      ? `VOLUNTEER WORK\n\n${form.voluntariado}`
      : (mock.volunteer ?? "VOLUNTEER WORK\n\nOpen to volunteer opportunities"));
    lines.push("");
  }

  // Skills
  if (form.habilidades && form.habilidades.length > 0) {
    const header = isMx ? "HABILIDADES" : market === "us" ? "SKILLS" : "CORE COMPETENCIES";
    lines.push(`${header}\n${form.habilidades.join(", ")}`);
  } else {
    lines.push(mock.skills);
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
    lines.push(mock.education);
  }
  lines.push("");

  // Languages
  const validLangs = (form.languages ?? []).filter(l => l.language);
  if (validLangs.length > 0) {
    lines.push(isMx ? "IDIOMAS" : "LANGUAGES");
    lines.push(validLangs.map(l => `${l.language} (${l.level})`).join(" | "));
  } else {
    lines.push(mock.languages);
  }

  return lines.join("\n");
}

export default function CVPreview({ market = "mx", photoUrl, templateId = "clasico", formData }: CVPreviewProps) {
  const Preview = PREVIEW_TEMPLATES[templateId] ?? PREVIEW_TEMPLATES.clasico;

  const mock = useMemo(() => {
    const pool = MOCK_PROFILES.filter(p => p.mercado === market);
    const source = pool.length > 0 ? pool : MOCK_PROFILES;
    return source[Math.floor(Math.random() * source.length)];
  }, [market]);

  const hasUserData = !!(
    formData?.nombre || formData?.puesto || formData?.ciudad ||
    formData?.email || formData?.experiencias?.some(e => e.puesto || e.empresa || e.descripcion)
  );

  const resolvedPhoto = photoUrl ?? formData?.photoUrl ?? undefined;

  const cvData = {
    nombre:   formData?.nombre  || mock.nombre,
    puesto:   formData?.puesto  || mock.puesto,
    ciudad:   formData?.ciudad  || mock.ciudad,
    email:    formData?.email   || mock.email,
    mercado:  market,
    photoUrl: resolvedPhoto,
    cv_text:  formData
      ? buildHybridText(formData, market, mock)
      : [mock.nombre, mock.puesto, mock.ciudad, "", mock.summary, "", mock.experience, "", mock.skills, "", mock.education, "", mock.languages].join("\n"),
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
    : `${mock.nombre.split(" ")[0].toLowerCase()}_${mock.nombre.split(" ").slice(-1)[0].toLowerCase()}_cv.pdf`;

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
          resumika.com · {templateId}
          {hasUserData && <span style={{ marginLeft: 6, color: "var(--green)", fontWeight: 500 }}>● en vivo</span>}
        </span>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green-mid)" }} />
      </div>
    </div>
  );
}
