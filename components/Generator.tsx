"use client";
import { useState, useRef, useEffect } from "react";
import CVPreview from "./CVPreview";
import { AuthModal } from "./AuthModal";
import type { TemplateId, CVData } from "@/lib/templates/types";
import { PREVIEW_TEMPLATES } from "@/lib/templates/previews";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAILS = ["hugoivanrf@gmail.com"];
const TONES = ["Profesional", "Creativo", "Formal", "Moderno"];
const INDUSTRIES = ["Diseño", "Tecnología", "Marketing", "Educación", "Salud", "Finanzas", "Construcción", "Manufactura", "Logística", "Ventas", "Recursos Humanos", "Legal", "Gastronomía", "Turismo", "Medios"];
const DISPONIBILIDAD_OPTIONS = ["Inmediata", "15 días", "1 mes", "2 meses", "A convenir"];
const COMMON_LANGUAGES = ["Español","English","Français","Português","Deutsch","Italiano","中文 (Mandarín)","日本語","한국어","العربية","Русский","Nederlands","Polski","Türkçe","हिन्दी","Tagalog","Vietnamese"];
const LEVELS_ES = ["Nativo","Fluido","Avanzado (C1)","Intermedio (B2)","Básico (B1)","Elemental (A2)"];
const LEVELS_EN = ["Native","Fluent","Advanced (C1)","Intermediate (B2)","Basic (B1)","Elementary (A2)"];
const SOCIAL_TYPES = ["LinkedIn","GitHub","Portfolio","Behance","Twitter/X","Dribbble","Otro"];

// Template definitions inline (replaces TemplateSelector import)
const TEMPLATE_DEFS = [
  { id: "clasico" as TemplateId,     nombre: "Clásico",      libre: true },
  { id: "moderno" as TemplateId,     nombre: "Moderno",      libre: true },
  { id: "minimalista" as TemplateId, nombre: "Minimalista",  libre: false },
  { id: "oscuro" as TemplateId,      nombre: "Oscuro",       libre: false },
];

type Market = "mx" | "us" | "ca";
const MARKETS: { id: Market; flag: string; label: string; hint: string }[] = [
  { id: "mx", flag: "🇲🇽", label: "México",  hint: "Con foto, datos personales, objetivo" },
  { id: "us", flag: "🇺🇸", label: "USA",     hint: "Resume 1 pág, logros, ATS-friendly" },
  { id: "ca", flag: "🇨🇦", label: "Canadá",  hint: "2 págs, voluntariado, soft skills" },
];
const DIFF_NOTES: Record<Market, { bg: string; border: string; color: string; icon: string; text: string }> = {
  mx: { bg: "#edf4ef", border: "rgba(42,82,54,.15)", color: "#1a3a22", icon: "📋", text: "<strong>Formato México:</strong> Incluye foto, edad, estado civil y objetivo profesional. La foto es esperada y positiva para los reclutadores mexicanos." },
  us: { bg: "#e8f0fb", border: "rgba(26,74,138,.15)", color: "#0c2a5c", icon: "⚖️", text: "<strong>US Resume:</strong> Sin foto, edad ni estado civil — incluirlos puede ser motivo de rechazo. 1 página, logros con números, optimizado para ATS." },
  ca: { bg: "#fef8ec", border: "rgba(138,74,0,.15)", color: "#5a3000", icon: "🍁", text: "<strong>Canadian Resume:</strong> Sin foto ni datos personales. El voluntariado tiene mucho peso. Bilingüismo inglés/francés es una ventaja enorme." },
};

// Block icons & colors per section
const BLOCK_META: Record<string, { icon: string; color: string }> = {
  personal:        { icon: "👤", color: "rgba(74,144,96,.2)" },
  experiencia:     { icon: "💼", color: "rgba(74,120,200,.15)" },
  redes:           { icon: "🔗", color: "rgba(255,255,255,.06)" },
  idiomas:         { icon: "🌐", color: "rgba(200,150,50,.15)" },
  habilidades:     { icon: "⚡", color: "rgba(74,144,96,.18)" },
  certificaciones: { icon: "🏆", color: "rgba(200,150,50,.12)" },
  educacion:       { icon: "🎓", color: "rgba(74,120,200,.15)" },
  ia:              { icon: "✦",  color: "rgba(255,255,255,.06)" },
};

export interface ExperienciaEntry { puesto: string; empresa: string; periodo: string; descripcion: string; }
export interface RedSocial { tipo: string; url: string; }
export interface EducacionEntry { carrera: string; institucion: string; anio: string; }
export interface CertificacionEntry { nombre: string; institucion: string; anio: string; }
export interface CVFormData {
  nombre: string; puesto: string; ciudad: string; email: string; telefono?: string;
  tono: string; industria: string; mercado: Market;
  edad?: string; estadoCivil?: string; disponibilidad?: string;
  voluntariado?: string; photoUrl?: string;
  certificaciones?: CertificacionEntry[];
  languages?: Array<{ language: string; level: string }>;
  templateId: TemplateId; sinExperiencia?: boolean;
  experiencias: ExperienciaEntry[];
  redesSociales?: RedSocial[];
  habilidades?: string[];
  educacion?: EducacionEntry[];
  vacante?: string;
  idiomaFormulario?: "es" | "en" | "fr";
  idiomaCv?: "en" | "fr";
}
const DEFAULT_FORM: CVFormData = {
  nombre: "", puesto: "", ciudad: "", email: "", telefono: "",
  tono: "Profesional", industria: "Diseño", mercado: "mx", templateId: "clasico",
  languages: [{ language: "Spanish", level: "Nativo" }],
  sinExperiencia: false,
  experiencias: [{ puesto: "", empresa: "", periodo: "", descripcion: "" }],
  redesSociales: [], habilidades: [],
  educacion: [{ carrera: "", institucion: "", anio: "" }],
  certificaciones: [], disponibilidad: "Inmediata", vacante: "",
  idiomaFormulario: "es", idiomaCv: "en",
};

interface GeneratorProps { initialData?: Record<string, unknown>; editSlug?: string; }

export default function Generator({ initialData, editSlug }: GeneratorProps = {}) {
  const [form, setForm] = useState<CVFormData>(() => {
    if (!initialData) return DEFAULT_FORM;
    const merged = { ...DEFAULT_FORM, ...initialData };
    if (typeof merged.languages === "string") {
      merged.languages = merged.languages
        ? (merged.languages as string).split(", ").map((e: string) => {
            const m = e.match(/^(.+?)\s*\((.+)\)$/);
            return m ? { language: m[1].trim(), level: m[2].trim() } : { language: e.trim(), level: "Nativo" };
          })
        : DEFAULT_FORM.languages;
    }
    if (!Array.isArray(merged.experiencias) || !merged.experiencias.length) merged.experiencias = DEFAULT_FORM.experiencias;
    if (!Array.isArray(merged.educacion) || !merged.educacion.length) merged.educacion = DEFAULT_FORM.educacion;
    if (!Array.isArray(merged.redesSociales)) merged.redesSociales = [];
    if (!Array.isArray(merged.habilidades)) merged.habilidades = [];
    return merged as CVFormData;
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [showAuth, setShowAuth] = useState<"register" | "login" | null>(null);
  const [showVacante, setShowVacante] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setIsAdmin(ADMIN_EMAILS.includes(user?.email ?? ""));
      setUserId(user?.id);
      setAuthLoaded(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAdmin(ADMIN_EMAILS.includes(session?.user?.email ?? ""));
      setUserId(session?.user?.id);
      setAuthLoaded(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("currivo_edit_draft");
    if (!raw) return;
    localStorage.removeItem("currivo_edit_draft");
    try {
      const draft = JSON.parse(raw);
      if (typeof draft.languages === "string") {
        draft.languages = draft.languages
          ? draft.languages.split(", ").map((e: string) => {
              const m = e.match(/^(.+?)\s*\((.+)\)$/);
              return m ? { language: m[1].trim(), level: m[2].trim() } : { language: e.trim(), level: "Fluido" };
            })
          : [{ language: "Spanish", level: "Nativo" }];
      }
      if (!Array.isArray(draft.experiencias) || !draft.experiencias.length) draft.experiencias = DEFAULT_FORM.experiencias;
      if (!Array.isArray(draft.educacion) || !draft.educacion.length) draft.educacion = DEFAULT_FORM.educacion;
      setForm(f => ({ ...f, ...draft }));
    } catch { /* ignore */ }
  }, []);

  const set = (k: keyof CVFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const selectMarket = (m: Market) => { setForm(f => ({ ...f, mercado: m })); setResult(null); setSlug(null); };

  const handleGenerate = async () => {
    if (authLoaded && !userId) { setShowAuth("register"); return; }
    if (!form.nombre || !form.puesto) { setError("Por favor completa nombre y puesto deseado."); return; }
    if (!form.sinExperiencia && form.experiencias.every(e => !e.descripcion.trim())) {
      setError("Describe al menos una experiencia, o marca que no tienes experiencia."); return;
    }
    setError(null); setLimitReached(false); setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, editSlug: editSlug ?? undefined, userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "LIMIT_REACHED") { setLimitReached(true); return; }
        throw new Error(data.error || "Error generando CV");
      }
      setResult(data.cv); setSlug(data.slug ?? null);
      setTimeout(() => previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally { setLoading(false); }
  };

  const selectedMarket = MARKETS.find(m => m.id === form.mercado)!;
  const note = DIFF_NOTES[form.mercado];
  const isMx = form.mercado === "mx";
  const isUs = form.mercado === "us";
  const vacanteActiva = (form.vacante ?? "").length > 50;

  const fieldBase: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,.05)",
    border: "1px solid rgba(255,255,255,.08)", borderRadius: 6,
    padding: "9px 12px", fontFamily: "inherit", fontSize: 12,
    color: "rgba(248,245,239,.9)", outline: "none",
  };

  const TOTAL_STEPS = 8;
  const steps = [
    isMx ? "Datos personales" : isUs ? "Personal Data" : "Personal Data / Données",
    isMx ? "Experiencia" : isUs ? "Experience" : "Experience / Expérience",
    isMx ? "Redes y perfiles" : isUs ? "Links & Profiles" : "Links & Profiles",
    isMx ? "Idiomas" : isUs ? "Languages" : "Languages / Langues",
    isMx ? "Habilidades" : isUs ? "Skills" : "Skills",
    isMx ? "Certificaciones" : "Certifications",
    isMx ? "Educación" : isUs ? "Education" : "Education",
    isMx ? "Preferencias de IA" : "AI Preferences",
  ];

  return (
    <>
      <style>{`
        @media (max-width: 960px) {
          .gen-grid { grid-template-columns: 1fr !important; }
          .gen-preview-col { display: none !important; }
          .gen-market { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .gen-wrap { padding: 0 16px !important; }
          .gen-section { padding: 48px 0 !important; }
          .field-row { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <section id="generador" className="gen-section" style={{ background: "var(--ink)", padding: "88px 0" }}>
        <div className="gen-wrap" style={{ maxWidth: 1320, margin: "0 auto", padding: "0 40px" }}>

          {/* Label */}
          <div style={{ fontSize: 10, letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(255,255,255,.2)", fontWeight: 500, marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
            {editSlug ? "Editar CV" : "Generador"}
            <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,.07)", display: "block" }} />
            {editSlug && <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)", letterSpacing: 0 }}>Editando · tus datos están precargados</span>}
          </div>

          {/* ── MARKET SELECTOR — mejorado ── */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,.28)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>¿Para qué mercado?</p>
            <div className="gen-market" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {MARKETS.map(m => (
                <button key={m.id} onClick={() => selectMarket(m.id)}
                  style={{
                    border: `1px solid ${form.mercado === m.id ? "rgba(74,144,96,.55)" : "rgba(255,255,255,.08)"}`,
                    borderRadius: 10, padding: "16px", background: form.mercado === m.id ? "rgba(42,82,54,.18)" : "rgba(255,255,255,.02)",
                    cursor: "pointer", textAlign: "left", transition: "all .15s", position: "relative",
                  }}>
                  {form.mercado === m.id && (
                    <span style={{ position: "absolute", top: 10, right: 10, fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 3, background: "rgba(74,144,96,.2)", color: "#7dd4a0", border: "1px solid rgba(74,144,96,.3)", letterSpacing: ".5px" }}>
                      Activo
                    </span>
                  )}
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{m.flag}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: form.mercado === m.id ? "#7dd4a0" : "rgba(255,255,255,.8)", fontFamily: "inherit", marginBottom: 3 }}>{m.label}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", fontFamily: "inherit", lineHeight: 1.4 }}>{m.hint}</div>
                </button>
              ))}
            </div>
          </div>

          {/* ── ADAPTADOR POR VACANTE — más visual ── */}
          <div style={{ marginBottom: 24 }}>
            <button onClick={() => setShowVacante(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%",
                background: showVacante ? "rgba(42,82,54,.18)" : "rgba(255,255,255,.02)",
                border: `1px solid ${showVacante ? "rgba(74,144,96,.45)" : "rgba(255,255,255,.08)"}`,
                borderRadius: 10, padding: "14px 18px", cursor: "pointer", fontFamily: "inherit", transition: "all .2s",
              }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(74,144,96,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🎯</div>
              <div style={{ textAlign: "left", flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: showVacante ? "#7dd4a0" : "rgba(255,255,255,.75)" }}>
                  {isMx ? "Adaptar a una vacante específica" : "Tailor to a specific job posting"}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 2 }}>
                  {isMx ? "Pega la descripción y la IA optimiza tu CV con las keywords exactas" : "Paste the job description and AI optimizes your CV with exact keywords"}
                </div>
              </div>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,.25)", transform: showVacante ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }}>▼</span>
            </button>
            {showVacante && (
              <div style={{ marginTop: 8, background: "rgba(255,255,255,.02)", border: "1px solid rgba(74,144,96,.18)", borderRadius: 10, padding: 16 }}>
                <label style={{ display: "block", fontSize: 10, color: "rgba(255,255,255,.35)", marginBottom: 8, letterSpacing: "0.5px" }}>
                  {isMx ? "Descripción de la vacante (pega el texto completo)" : "Job Description (paste the full text)"}
                </label>
                <textarea value={form.vacante ?? ""} onChange={e => setForm(f => ({ ...f, vacante: e.target.value }))} rows={6}
                  placeholder={isMx ? "Pega aquí la descripción completa del puesto..." : "Paste the full job description here..."}
                  style={{ ...fieldBase, resize: "vertical", lineHeight: 1.6 }} />
                {vacanteActiva && (
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7dd4a0", flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: "#7dd4a0" }}>
                      {isMx ? "✓ Vacante detectada — la IA optimizará tu CV para este puesto" : "✓ Job posting detected — AI will tailor your CV for this specific role"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── FORM + PREVIEW GRID ── */}
          <div className="gen-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>

            {/* FORM COL */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

              {/* 1. DATOS PERSONALES */}
              <FB step={1} total={TOTAL_STEPS} title={steps[0]} icon={BLOCK_META.personal.icon} iconBg={BLOCK_META.personal.color}>
                {form.mercado !== "mx" && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,.38)", marginBottom: 4 }}>
                      ¿En qué idioma vas a llenar el formulario?
                    </label>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,.25)", marginBottom: 8, marginTop: 0 }}>
                      El CV se generará en inglés sin importar tu elección
                    </p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {(["es", "en", ...(form.mercado === "ca" ? ["fr"] : [])] as Array<"es" | "en" | "fr">).map(lang => {
                        const labels: Record<string, string> = { es: "🇲🇽 Español", en: "🇺🇸 English", fr: "🇫🇷 Français" };
                        const active = (form.idiomaFormulario ?? "es") === lang;
                        return (
                          <button key={lang} type="button" onClick={() => setForm(f => ({ ...f, idiomaFormulario: lang }))}
                            style={{
                              padding: "6px 14px", borderRadius: 6, fontFamily: "inherit", fontSize: 12, cursor: "pointer", transition: "all .15s",
                              border: `1px solid ${active ? "rgba(74,144,96,.55)" : "rgba(255,255,255,.12)"}`,
                              background: active ? "rgba(42,82,54,.25)" : "rgba(255,255,255,.03)",
                              color: active ? "#7dd4a0" : "rgba(255,255,255,.55)",
                            }}>
                            {labels[lang]}
                          </button>
                        );
                      })}
                    </div>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginTop: 6, marginBottom: 0, display: "flex", gap: 5, alignItems: "center" }}>
                      {(form.idiomaFormulario ?? "es") === "fr"
                        ? "✓ Remplissez en français — le CV sera généré en anglais professionnel"
                        : (form.idiomaFormulario ?? "es") === "en"
                        ? "✓ Fill in English — the CV will be generated in professional English"
                        : "✓ Llenarás en español — el CV se generará en inglés profesional automáticamente"}
                    </p>
                  </div>
                )}
                <FR>
                  <F label={isMx ? "Nombre completo" : isUs ? "Full Name" : "Full Name / Nom complet"} placeholder="María García López" value={form.nombre} onChange={set("nombre")} />
                  <F label={isMx ? "Puesto deseado" : isUs ? "Job Title" : "Job Title / Titre"} placeholder={isUs ? "Graphic Designer" : "Diseñadora Gráfica"} value={form.puesto} onChange={set("puesto")} />
                </FR>
                <FR>
                  <F label={isMx ? "Ciudad" : isUs ? "City, State" : "City, Province"} placeholder={isMx ? "León, Gto." : isUs ? "Austin, TX" : "Toronto, ON"} value={form.ciudad} onChange={set("ciudad")} />
                  <F label="Email" placeholder="maria@correo.com" value={form.email} onChange={set("email")} />
                </FR>
                <FR>
                  <F label={isMx ? "Teléfono" : isUs ? "Phone" : "Phone / Téléphone"} placeholder={isMx ? "+52 477 123 4567" : isUs ? "+1 (555) 123-4567" : "+1 (416) 123-4567"} value={form.telefono ?? ""} onChange={set("telefono")} />
                  {isMx ? <F label="Edad (opcional)" placeholder="28 años" value={form.edad ?? ""} onChange={set("edad")} /> : <div />}
                </FR>
                {form.mercado === "ca" && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,.38)", marginBottom: 8 }}>
                      ¿En qué idioma quieres tu CV?
                    </label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {(["en", "fr"] as const).map(lang => {
                        const labels = { en: "🇨🇦 English", fr: "🇫🇷 Français" };
                        const hints  = { en: "Para la mayoría de provincias — Ontario, BC, Alberta", fr: "Para Quebec y posiciones del gobierno federal" };
                        const active = (form.idiomaCv ?? "en") === lang;
                        return (
                          <button key={lang} type="button" onClick={() => setForm(f => ({ ...f, idiomaCv: lang }))}
                            style={{
                              padding: "6px 14px", borderRadius: 6, fontFamily: "inherit", fontSize: 12, cursor: "pointer", transition: "all .15s",
                              border: `1px solid ${active ? "rgba(74,144,96,.55)" : "rgba(255,255,255,.12)"}`,
                              background: active ? "rgba(42,82,54,.25)" : "rgba(255,255,255,.03)",
                              color: active ? "#7dd4a0" : "rgba(255,255,255,.55)",
                            }}>
                            <div>{labels[lang]}</div>
                            <div style={{ fontSize: 9, color: active ? "rgba(125,212,160,.7)" : "rgba(255,255,255,.25)", marginTop: 2 }}>{hints[lang]}</div>
                          </button>
                        );
                      })}
                    </div>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 8, marginBottom: 0 }}>
                      {(form.idiomaCv ?? "en") === "fr"
                        ? "✓ Ton CV sera rédigé en français professionnel canadien"
                        : "✓ Tu CV se generará en inglés profesional canadiense"}
                    </p>
                  </div>
                )}
                {isMx && (
                  <>
                    <FR>
                      <F label="Estado civil (opcional)" placeholder="Soltero/a" value={form.estadoCivil ?? ""} onChange={set("estadoCivil")} />
                      <div style={{ marginBottom: 10 }}>
                        <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,.38)", marginBottom: 5 }}>Disponibilidad</label>
                        <select value={form.disponibilidad ?? "Inmediata"} onChange={e => setForm(f => ({ ...f, disponibilidad: e.target.value }))} style={{ ...fieldBase, cursor: "pointer" }}>
                          {DISPONIBILIDAD_OPTIONS.map(d => <option key={d} value={d} style={{ background: "#1c1a16" }}>{d}</option>)}
                        </select>
                      </div>
                    </FR>
                    <PhotoUpload value={form.photoUrl} onChange={url => setForm(f => ({ ...f, photoUrl: url }))} />
                  </>
                )}
              </FB>

              {/* 2. EXPERIENCIA */}
              <FB step={2} total={TOTAL_STEPS} title={steps[1]} icon={BLOCK_META.experiencia.icon} iconBg={BLOCK_META.experiencia.color}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.sinExperiencia ?? false} onChange={e => setForm(f => ({ ...f, sinExperiencia: e.target.checked }))} style={{ accentColor: "var(--green-mid)", width: 14, height: 14 }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.45)" }}>{isUs ? "I have no work experience" : "No tengo experiencia laboral"}</span>
                </label>
                {!form.sinExperiencia && <ExperienceSelector experiencias={form.experiencias} onChange={exp => setForm(f => ({ ...f, experiencias: exp }))} market={form.mercado} />}
                {form.sinExperiencia && <p style={{ fontSize: 11, color: "rgba(255,255,255,.3)", lineHeight: 1.6 }}>{isUs ? "The AI will focus on education, skills, and personal projects." : "La IA se enfocará en educación, habilidades y proyectos — sin inventar experiencia."}</p>}
                {form.mercado === "ca" && (
                  <div style={{ marginTop: 12 }}>
                    <F label="Volunteer Work / Voluntariado (important in Canada)" placeholder="Ej. Voluntario en banco de alimentos..." value={form.voluntariado ?? ""} onChange={e => setForm(f => ({ ...f, voluntariado: e.target.value }))} textarea />
                  </div>
                )}
              </FB>

              {/* 3. REDES */}
              <FB step={3} total={TOTAL_STEPS} title={steps[2]} icon={BLOCK_META.redes.icon} iconBg={BLOCK_META.redes.color}>
                <SocialLinksSelector links={form.redesSociales ?? []} onChange={links => setForm(f => ({ ...f, redesSociales: links }))} market={form.mercado} />
              </FB>

              {/* 4. IDIOMAS */}
              <FB step={4} total={TOTAL_STEPS} title={steps[3]} icon={BLOCK_META.idiomas.icon} iconBg={BLOCK_META.idiomas.color}>
                <LanguageSelector languages={form.languages ?? []} onChange={langs => setForm(f => ({ ...f, languages: langs }))} market={form.mercado} />
              </FB>

              {/* 5. HABILIDADES */}
              <FB step={5} total={TOTAL_STEPS} title={steps[4]} icon={BLOCK_META.habilidades.icon} iconBg={BLOCK_META.habilidades.color}>
                <SkillsSelector skills={form.habilidades ?? []} onChange={s => setForm(f => ({ ...f, habilidades: s }))} market={form.mercado} />
              </FB>

              {/* 6. CERTIFICACIONES */}
              <FB step={6} total={TOTAL_STEPS} title={steps[5]} icon={BLOCK_META.certificaciones.icon} iconBg={BLOCK_META.certificaciones.color}>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,.28)", marginBottom: 12, lineHeight: 1.6 }}>
                  {isMx ? "Solo agrega certificaciones que realmente tienes. Si no tienes, deja en blanco." : "Only add certifications you actually have. Leave blank if none."}
                </p>
                <CertificacionesSelector certificaciones={form.certificaciones ?? []} onChange={c => setForm(f => ({ ...f, certificaciones: c }))} market={form.mercado} />
              </FB>

              {/* 7. EDUCACIÓN */}
              <FB step={7} total={TOTAL_STEPS} title={steps[6]} icon={BLOCK_META.educacion.icon} iconBg={BLOCK_META.educacion.color}>
                <EducacionSelector educacion={form.educacion ?? [{ carrera: "", institucion: "", anio: "" }]} onChange={edu => setForm(f => ({ ...f, educacion: edu }))} market={form.mercado} />
              </FB>

              {/* 8. PREFERENCIAS IA */}
              <FB step={8} total={TOTAL_STEPS} title={steps[7]} icon={BLOCK_META.ia.icon} iconBg={BLOCK_META.ia.color}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: "rgba(255,255,255,.38)", display: "block", marginBottom: 8 }}>{isMx ? "Tono" : "Tone"}</label>
                  <PillGroup options={[...TONES, isMx ? "Otro" : "Other"]} selected={TONES.includes(form.tono) ? form.tono : (isMx ? "Otro" : "Other")} onSelect={v => setForm(f => ({ ...f, tono: (v === "Otro" || v === "Other") ? "" : v }))} />
                  {!TONES.includes(form.tono) && (
                    <input type="text" autoFocus placeholder={isMx ? "Ej. Emprendedor..." : "e.g. Entrepreneurial..."} value={form.tono} onChange={e => setForm(f => ({ ...f, tono: e.target.value }))}
                      style={{ marginTop: 8, ...fieldBase, border: "1px solid rgba(74,144,96,.35)" }} />
                  )}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, color: "rgba(255,255,255,.38)", display: "block", marginBottom: 8 }}>{isMx ? "Industria" : "Industry"}</label>
                  <PillGroup options={[...INDUSTRIES, isMx ? "Otra" : "Other"]} selected={INDUSTRIES.includes(form.industria) ? form.industria : (isMx ? "Otra" : "Other")} onSelect={v => setForm(f => ({ ...f, industria: (v === "Otra" || v === "Other") ? "" : v }))} />
                  {!INDUSTRIES.includes(form.industria) && (
                    <input type="text" autoFocus placeholder={isMx ? "Ej. Agricultura..." : "e.g. Agriculture..."} value={form.industria} onChange={e => setForm(f => ({ ...f, industria: e.target.value }))}
                      style={{ marginTop: 8, ...fieldBase, border: "1px solid rgba(74,144,96,.35)" }} />
                  )}
                </div>

                {/* ── TEMPLATE SELECTOR MEJORADO ── */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 11, color: "rgba(255,255,255,.38)", display: "block", marginBottom: 10 }}>{isMx ? "Plantilla" : "Template"}</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {TEMPLATE_DEFS.map(t => {
                      const isSelected = form.templateId === t.id;
                      const isPro = !t.libre && !isAdmin;
                      return (
                        <button key={t.id} type="button"
                          onClick={() => { if (!isPro) setForm(f => ({ ...f, templateId: t.id })); }}
                          style={{ border: `1px solid ${isSelected ? "rgba(74,144,96,.5)" : "rgba(255,255,255,.08)"}`, borderRadius: 8, overflow: "hidden", cursor: isPro ? "default" : "pointer", background: "none", padding: 0, position: "relative", textAlign: "left", transition: "border-color .15s", opacity: isPro ? 0.6 : 1 }}>
                          {isSelected && (
                            <div style={{ position: "absolute", top: 7, right: 7, width: 16, height: 16, borderRadius: "50%", background: "var(--green-mid)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", zIndex: 2 }}>✓</div>
                          )}
                          {/* Preview thumbnail */}
                          <div style={{ height: 72, padding: "10px 10px 6px", background: t.id === "oscuro" ? "#0f0e0c" : t.id === "moderno" ? "#f8f5ef" : "#f8f5ef", display: "flex", gap: t.id === "moderno" ? 5 : 0 }}>
                            {t.id === "moderno" ? (
                              <>
                                <div style={{ width: "32%", background: "#2a5236", borderRadius: 2, padding: 5 }}>
                                  <div style={{ height: 3, background: "rgba(255,255,255,.5)", borderRadius: 1, marginBottom: 3 }} />
                                  <div style={{ height: 3, background: "rgba(255,255,255,.3)", borderRadius: 1, width: "70%" }} />
                                </div>
                                <div style={{ flex: 1, padding: "3px 0" }}>
                                  <div style={{ height: 5, background: "#1a1814", borderRadius: 1, width: "60%", marginBottom: 4 }} />
                                  <div style={{ height: 3, background: "#ddd", borderRadius: 1, marginBottom: 3 }} />
                                  <div style={{ height: 3, background: "#ddd", borderRadius: 1, width: "80%" }} />
                                </div>
                              </>
                            ) : (
                              <div style={{ flex: 1 }}>
                                <div style={{ height: t.id === "oscuro" ? 5 : 6, background: t.id === "oscuro" ? "rgba(255,255,255,.85)" : "#1a1814", borderRadius: 1, width: "50%", marginBottom: t.id === "minimalista" ? 7 : 5 }} />
                                {t.id !== "minimalista" && <div style={{ height: 3, background: t.id === "oscuro" ? "#4a9060" : "#2a5236", borderRadius: 1, width: "30%", marginBottom: 5 }} />}
                                {t.id !== "minimalista" && <div style={{ height: 1, background: t.id === "oscuro" ? "rgba(255,255,255,.15)" : "#ddd", marginBottom: 6 }} />}
                                <div style={{ height: 3, background: t.id === "oscuro" ? "rgba(255,255,255,.2)" : "#ddd", borderRadius: 1, width: "85%", marginBottom: 3 }} />
                                <div style={{ height: 3, background: t.id === "oscuro" ? "rgba(255,255,255,.2)" : "#ddd", borderRadius: 1, width: "65%" }} />
                              </div>
                            )}
                          </div>
                          <div style={{ padding: "7px 10px", borderTop: `1px solid ${t.id === "oscuro" ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)"}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: t.id === "oscuro" ? "#161512" : "#f0ece4" }}>
                            <span style={{ fontSize: 11, color: isSelected ? "#7dd4a0" : t.id === "oscuro" ? "rgba(255,255,255,.6)" : "#4a443c" }}>{t.nombre}</span>
                            <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 3,
                              background: t.libre ? "rgba(74,144,96,.15)" : "rgba(200,150,50,.12)",
                              color: t.libre ? "#7dd4a0" : "#d4a050",
                              border: `1px solid ${t.libre ? "rgba(74,144,96,.2)" : "rgba(200,150,50,.2)"}`,
                            }}>
                              {t.libre ? "Gratis" : "Pro"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {error && <p style={{ fontSize: 12, color: "#f87171", marginBottom: 8 }}>{error}</p>}
                {limitReached && (
                  <div style={{ background: "rgba(74,144,96,.1)", border: "1px solid rgba(74,144,96,.3)", borderRadius: 8, padding: "14px 16px", marginBottom: 10 }}>
                    <p style={{ fontSize: 13, color: "rgba(248,245,239,.9)", marginBottom: 10, lineHeight: 1.5 }}>
                      Ya usaste tu CV gratis. Actualiza a Pro para generar CVs ilimitados.
                    </p>
                    <a href="/#precios" style={{ display: "inline-block", background: "var(--green-mid)", color: "#fff", borderRadius: 6, padding: "8px 18px", fontSize: 12, fontWeight: 500, textDecoration: "none" }}>
                      Ver planes →
                    </a>
                  </div>
                )}
                <button onClick={handleGenerate} disabled={loading || limitReached}
                  style={{ width: "100%", background: "var(--green-mid)", color: "#fff", border: "none", borderRadius: 8, padding: 14, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: (loading || limitReached) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: (loading || limitReached) ? 0.4 : 1, transition: "background .2s" }}>
                  {loading ? <><Spinner />Generando...</>
                    : editSlug ? <>✦ Actualizar mi CV</>
                    : vacanteActiva ? <>🎯 Generar CV optimizado para la vacante</>
                    : <>✦ Generar CV para {selectedMarket.flag} {selectedMarket.label}</>}
                </button>
                {!isAdmin && <p style={{ textAlign: "center", fontSize: 9, color: "rgba(255,255,255,.18)", marginTop: 8, letterSpacing: "0.5px" }}>El primero es gratis · Sin tarjeta · Sin registro</p>}
              </FB>
            </div>

            {/* ── PREVIEW COL — STICKY ── */}
            <div className="gen-preview-col" ref={previewRef} style={{ position: "sticky", top: 72, maxHeight: "calc(100vh - 90px)", overflowY: "auto" }}>
              {result ? (
                <>
                  <GeneratedResult text={result} market={form.mercado} slug={slug} templateId={form.templateId} nombre={form.nombre} puesto={form.puesto} ciudad={form.ciudad} email={form.email} photoUrl={form.photoUrl} userId={userId} />
                  {!userId && slug && (
                    <div style={{ margin: "10px 0", padding: "20px 24px", background: "linear-gradient(135deg, var(--green-bg), #fff)", border: "1px solid rgba(45,90,61,.2)", borderRadius: 8 }}>
                      <div style={{ fontSize: 28, marginBottom: 10 }}>📄</div>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: "var(--ink)", margin: 0 }}>
                        Guarda tu CV antes de perderlo
                      </p>
                      <p style={{ fontSize: 13, color: "var(--body)", lineHeight: 1.6, marginTop: 6, marginBottom: 0 }}>
                        Regístrate gratis para editarlo, compartirlo con reclutadores y acceder desde cualquier dispositivo.
                      </p>
                      <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                        <button
                          onClick={() => setShowAuth("register")}
                          style={{ background: "var(--green)", color: "#fff", border: "none", borderRadius: 7, padding: "11px 22px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
                        >
                          Crear cuenta gratis →
                        </button>
                        <button
                          onClick={() => setShowAuth("login")}
                          style={{ background: "none", color: "var(--body)", border: "1px solid var(--border)", borderRadius: 7, padding: "11px 22px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
                        >
                          Ya tengo cuenta
                        </button>
                      </div>
                      <p style={{ fontSize: 11, color: "var(--hint)", textAlign: "center", marginTop: 12, marginBottom: 0 }}>
                        ✓ Gratis para siempre · ✓ Sin tarjeta · ✓ Listo en 30 segundos
                      </p>
                    </div>
                  )}
                  {slug && <ShareCard slug={slug} market={form.mercado} />}
                </>
              ) : (
                <>
                  <CVPreview market={form.mercado} photoUrl={form.photoUrl} templateId={form.templateId} formData={form} />
                  {loading && (
                    <div style={{ position: "absolute", inset: 0, borderRadius: 8, background: "rgba(28,26,22,.88)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
                      <Spinner large />
                      <p style={{ fontSize: 13, color: "rgba(248,245,239,.4)", textAlign: "center", padding: "0 24px" }}>
                        {vacanteActiva ? (isMx ? "Optimizando tu CV para la vacante..." : "Tailoring your CV for the job posting...") : `Generando CV para ${selectedMarket.flag} ${selectedMarket.label}...`}
                      </p>
                    </div>
                  )}
                </>
              )}
              <div style={{ marginTop: 10, background: note.bg, border: `1px solid ${note.border}`, color: note.color, borderRadius: 6, padding: "8px 12px", fontSize: 11, display: "flex", gap: 7, alignItems: "flex-start", lineHeight: 1.5 }}>
                <span style={{ fontSize: 13, flexShrink: 0 }}>{note.icon}</span>
                <span dangerouslySetInnerHTML={{ __html: note.text }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {showAuth && <AuthModal initialTab={showAuth} onClose={() => setShowAuth(null)} />}
    </>
  );
}

// ─── Form Block con icono y paso numerado ───
function FB({ title, children, step, total, icon, iconBg }: {
  title: string; children: React.ReactNode;
  step: number; total: number; icon: string; iconBg: string;
}) {
  return (
    <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 10, padding: 22, transition: "border-color .2s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,.28)", fontWeight: 500, flex: 1 }}>{title}</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,.18)", fontVariantNumeric: "tabular-nums" }}>{step}/{total}</div>
      </div>
      {children}
    </div>
  );
}
function FR({ children }: { children: React.ReactNode }) {
  return <div className="field-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{children}</div>;
}
function F({ label, placeholder, value, onChange, textarea }: {
  label: string; placeholder: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; textarea?: boolean;
}) {
  const base: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 6, padding: "9px 12px", fontFamily: "inherit", fontSize: 12, color: "rgba(248,245,239,.9)", outline: "none" };
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,.38)", marginBottom: 5 }}>{label}</label>
      {textarea ? <textarea placeholder={placeholder} value={value} onChange={onChange} rows={3} style={{ ...base, resize: "none" }} /> : <input type="text" placeholder={placeholder} value={value} onChange={onChange} style={base} />}
    </div>
  );
}
function PillGroup({ options, selected, onSelect }: { options: string[]; selected: string; onSelect: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
      {options.map(o => (
        <button key={o} onClick={() => onSelect(o)}
          style={{ border: "1px solid", borderColor: selected === o ? "rgba(74,144,96,.5)" : "rgba(255,255,255,.08)", borderRadius: 100, padding: "4px 12px", fontSize: 10, fontFamily: "inherit", color: selected === o ? "#7dd4a0" : "rgba(255,255,255,.32)", background: selected === o ? "rgba(42,82,54,.15)" : "none", cursor: "pointer" }}>
          {o}
        </button>
      ))}
    </div>
  );
}
function PhotoUpload({ value, onChange }: { value?: string; onChange: (url: string | undefined) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("La foto no puede superar 2MB."); e.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,.38)", marginBottom: 5 }}>Foto (opcional)</label>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {value ? (
          <>
            <img src={value} alt="Vista previa" style={{ width: 48, height: 48, borderRadius: 6, objectFit: "cover", border: "1px solid rgba(255,255,255,.12)" }} />
            <button type="button" onClick={() => { onChange(undefined); if (inputRef.current) inputRef.current.value = ""; }}
              style={{ fontSize: 10, color: "#f87171", background: "none", border: "1px solid rgba(248,113,113,.3)", borderRadius: 4, padding: "3px 8px", cursor: "pointer", fontFamily: "inherit" }}>Quitar</button>
          </>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()}
            style={{ fontSize: 11, color: "rgba(255,255,255,.6)", background: "rgba(255,255,255,.04)", border: "1px dashed rgba(255,255,255,.15)", borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontFamily: "inherit" }}>+ Subir foto</button>
        )}
        <span style={{ fontSize: 9, color: "rgba(255,255,255,.2)" }}>JPG · PNG · WEBP · Máx. 2MB</span>
      </div>
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleFile} style={{ display: "none" }} />
    </div>
  );
}
function SkillsSelector({ skills, onChange, market }: { skills: string[]; onChange: (s: string[]) => void; market: Market }) {
  const [input, setInput] = useState("");
  const isMx = market === "mx";
  const add = () => { const t = input.trim(); if (t && !skills.includes(t)) onChange([...skills, t]); setInput(""); };
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
    if (e.key === "Backspace" && !input && skills.length) onChange(skills.slice(0, -1));
  };
  return (
    <div>
      <p style={{ fontSize: 10, color: "rgba(255,255,255,.28)", marginBottom: 10, lineHeight: 1.5 }}>{isMx ? "Presiona Enter o coma para agregar." : "Press Enter or comma to add."}</p>
      {skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {skills.map((s, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(42,82,54,.2)", border: "1px solid rgba(74,144,96,.3)", borderRadius: 100, padding: "3px 10px 3px 12px", fontSize: 11, color: "#7dd4a0" }}>
              {s}
              <button type="button" onClick={() => onChange(skills.filter((_, j) => j !== i))} style={{ fontSize: 13, color: "rgba(125,212,160,.5)", background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
          placeholder={isMx ? "Ej. Photoshop, Figma..." : market === "us" ? "e.g. Figma, Leadership..." : "e.g. Figma, Bilingual..."}
          style={{ flex: 1, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 6, padding: "9px 12px", fontFamily: "inherit", fontSize: 12, color: "rgba(248,245,239,.9)", outline: "none" }} />
        <button type="button" onClick={add} disabled={!input.trim()}
          style={{ fontSize: 11, color: "rgba(255,255,255,.5)", background: "none", border: "1px solid rgba(255,255,255,.12)", borderRadius: 6, padding: "6px 12px", cursor: input.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", opacity: input.trim() ? 1 : 0.4 }}>
          {isMx ? "+ Agregar" : "+ Add"}
        </button>
      </div>
    </div>
  );
}
function ExperienceSelector({ experiencias, onChange, market }: { experiencias: ExperienciaEntry[]; onChange: (exp: ExperienciaEntry[]) => void; market: Market }) {
  const isMx = market === "mx";
  const base: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 6, padding: "9px 12px", fontFamily: "inherit", fontSize: 12, color: "rgba(248,245,239,.9)", outline: "none" };
  const update = (i: number, field: keyof ExperienciaEntry, val: string) => onChange(experiencias.map((e, j) => j === i ? { ...e, [field]: val } : e));
  return (
    <div>
      {experiencias.map((exp, i) => (
        <div key={i} style={{ marginBottom: 14, padding: 14, background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 7 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,.22)" }}>{isMx ? `Experiencia ${i + 1}` : `Experience ${i + 1}`}</span>
            {experiencias.length > 1 && <button type="button" onClick={() => onChange(experiencias.filter((_, j) => j !== i))} style={{ fontSize: 13, color: "rgba(255,255,255,.25)", background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>×</button>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 5 }}>{isMx ? "Puesto" : market === "us" ? "Job Title" : "Position"}</label>
              <input type="text" value={exp.puesto} onChange={e => update(i, "puesto", e.target.value)} placeholder={isMx ? "Diseñadora Gráfica" : "Graphic Designer"} style={base} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 5 }}>{isMx ? "Empresa" : "Company"}</label>
              <input type="text" value={exp.empresa} onChange={e => update(i, "empresa", e.target.value)} placeholder="Agencia Creativa" style={base} />
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 5 }}>{isMx ? "Período" : "Period"}</label>
            <input type="text" value={exp.periodo} onChange={e => update(i, "periodo", e.target.value)} placeholder={isMx ? "Eje. Ene 2020 – Presente" : "e.g. Jan 2020 – Present"} style={base} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 5 }}>{market === "mx" ? "¿Qué hacías?" : market === "us" ? "Achievements (with numbers)" : "Work description"}</label>
            <textarea value={exp.descripcion} onChange={e => update(i, "descripcion", e.target.value)} rows={3}
              placeholder={market === "mx" ? "Ej. Diseñé identidades de marca, reduje tiempos en 30%..." : market === "us" ? "e.g. Led rebranding for 5 clients, increased engagement by 35%..." : "Ej. Diseñé materiales, lideré equipo de 3 personas..."}
              style={{ ...base, resize: "none" }} />
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...experiencias, { puesto: "", empresa: "", periodo: "", descripcion: "" }])}
        style={{ fontSize: 10, color: "rgba(255,255,255,.4)", background: "none", border: "1px dashed rgba(255,255,255,.1)", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit" }}>
        + {isMx ? "Agregar otra experiencia" : "Add another experience"}
      </button>
    </div>
  );
}
function EducacionSelector({ educacion, onChange, market }: { educacion: EducacionEntry[]; onChange: (edu: EducacionEntry[]) => void; market: Market }) {
  const isMx = market === "mx";
  const base: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 6, padding: "9px 12px", fontFamily: "inherit", fontSize: 12, color: "rgba(248,245,239,.9)", outline: "none" };
  const update = (i: number, field: keyof EducacionEntry, val: string) => onChange(educacion.map((e, j) => j === i ? { ...e, [field]: val } : e));
  return (
    <div>
      {educacion.map((edu, i) => (
        <div key={i} style={{ marginBottom: 12, padding: 14, background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 7 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,.22)" }}>{isMx ? `Estudio ${i + 1}` : `Degree ${i + 1}`}</span>
            {educacion.length > 1 && <button type="button" onClick={() => onChange(educacion.filter((_, j) => j !== i))} style={{ fontSize: 13, color: "rgba(255,255,255,.25)", background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>×</button>}
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 5 }}>{isMx ? "Carrera / Título" : market === "us" ? "Degree / Field of Study" : "Degree / Titre"}</label>
            <input type="text" value={edu.carrera} onChange={e => update(i, "carrera", e.target.value)} placeholder={isMx ? "Ej. Lic. en Diseño Gráfico" : "e.g. B.A. Graphic Design"} style={base} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 5 }}>{isMx ? "Institución" : "Institution"}</label>
              <input type="text" value={edu.institucion} onChange={e => update(i, "institucion", e.target.value)} placeholder={isMx ? "Ej. Universidad de Guanajuato" : "e.g. University of Toronto"} style={base} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 5 }}>{isMx ? "Año" : "Year"}</label>
              <input type="text" value={edu.anio} onChange={e => update(i, "anio", e.target.value)} placeholder="2020" style={{ ...base, width: 80 }} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...educacion, { carrera: "", institucion: "", anio: "" }])}
        style={{ fontSize: 10, color: "rgba(255,255,255,.4)", background: "none", border: "1px dashed rgba(255,255,255,.1)", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit" }}>
        + {isMx ? "Agregar otro estudio" : "Add another degree"}
      </button>
    </div>
  );
}
function SocialLinksSelector({ links, onChange, market }: { links: RedSocial[]; onChange: (links: RedSocial[]) => void; market: Market }) {
  const base: React.CSSProperties = { background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 6, padding: "9px 12px", fontFamily: "inherit", fontSize: 12, color: "rgba(248,245,239,.9)", outline: "none", width: "100%" };
  const isMx = market === "mx";
  const update = (i: number, field: keyof RedSocial, val: string) => onChange(links.map((l, j) => j === i ? { ...l, [field]: val } : l));
  return (
    <div>
      {links.length === 0 && <p style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginBottom: 10, lineHeight: 1.5 }}>{isMx ? "Agrega tu LinkedIn, portafolio u otras redes." : "Add your LinkedIn, portfolio or other profiles."}</p>}
      {links.map((link, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
          <select value={link.tipo} onChange={e => update(i, "tipo", e.target.value)} style={{ ...base, width: "auto", cursor: "pointer" }}>
            {SOCIAL_TYPES.map(t => <option key={t} value={t} style={{ background: "#1c1a16" }}>{t}</option>)}
          </select>
          <input type="text" value={link.url} onChange={e => update(i, "url", e.target.value)} placeholder={isMx ? "https://linkedin.com/in/tu-perfil" : "https://linkedin.com/in/your-profile"} style={base} />
          <button type="button" onClick={() => onChange(links.filter((_, j) => j !== i))} style={{ fontSize: 16, color: "rgba(255,255,255,.3)", background: "none", border: "none", cursor: "pointer", padding: "0 4px", lineHeight: 1 }}>×</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...links, { tipo: "LinkedIn", url: "" }])}
        style={{ fontSize: 10, color: "rgba(255,255,255,.4)", background: "none", border: "1px dashed rgba(255,255,255,.1)", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit" }}>
        {isMx ? "+ Agregar link" : market === "us" ? "+ Add link" : "+ Ajouter / Add link"}
      </button>
    </div>
  );
}
function LanguageSelector({ languages, onChange, market }: { languages: Array<{ language: string; level: string }>; onChange: (langs: Array<{ language: string; level: string }>) => void; market: Market }) {
  const isMx = market === "mx";
  const levels = isMx ? LEVELS_ES : LEVELS_EN;
  const base: React.CSSProperties = { background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 6, padding: "9px 12px", fontFamily: "inherit", fontSize: 12, color: "rgba(248,245,239,.9)", outline: "none", width: "100%" };
  return (
    <div>
      {languages.map((l, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
          <div>
            <input list={`lang-list-${i}`} placeholder={isMx ? "Ej. Inglés" : "e.g. French"} value={l.language}
              onChange={e => onChange(languages.map((x, j) => j === i ? { ...x, language: e.target.value } : x))} style={base} />
            <datalist id={`lang-list-${i}`}>{COMMON_LANGUAGES.map(lang => <option key={lang} value={lang} />)}</datalist>
          </div>
          <select value={l.level} onChange={e => onChange(languages.map((x, j) => j === i ? { ...x, level: e.target.value } : x))} style={{ ...base, cursor: "pointer" }}>
            {levels.map(lv => <option key={lv} value={lv} style={{ background: "#1c1a16" }}>{lv}</option>)}
          </select>
          <button type="button" onClick={() => onChange(languages.filter((_, j) => j !== i))} style={{ fontSize: 16, color: "rgba(255,255,255,.3)", background: "none", border: "none", cursor: "pointer", padding: "0 4px", lineHeight: 1 }}>×</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...languages, { language: "", level: levels[0] }])}
        style={{ fontSize: 10, color: "rgba(255,255,255,.4)", background: "none", border: "1px dashed rgba(255,255,255,.1)", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit" }}>
        + {isMx ? "Agregar idioma" : "Add language"}
      </button>
    </div>
  );
}
function CertificacionesSelector({ certificaciones, onChange, market }: { certificaciones: CertificacionEntry[]; onChange: (c: CertificacionEntry[]) => void; market: Market }) {
  const isMx = market === "mx";
  const base: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 6, padding: "9px 12px", fontFamily: "inherit", fontSize: 12, color: "rgba(248,245,239,.9)", outline: "none" };
  const update = (i: number, field: keyof CertificacionEntry, val: string) => onChange(certificaciones.map((c, j) => j === i ? { ...c, [field]: val } : c));
  return (
    <div>
      {certificaciones.length === 0 && <p style={{ fontSize: 11, color: "rgba(255,255,255,.2)", marginBottom: 10 }}>{isMx ? "Aún no has agregado certificaciones." : "No certifications added yet."}</p>}
      {certificaciones.map((cert, i) => (
        <div key={i} style={{ marginBottom: 12, padding: 14, background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 7 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,.22)" }}>{isMx ? `Certificación ${i + 1}` : `Certification ${i + 1}`}</span>
            <button type="button" onClick={() => onChange(certificaciones.filter((_, j) => j !== i))} style={{ fontSize: 13, color: "rgba(255,255,255,.25)", background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>×</button>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 5 }}>{isMx ? "Nombre de la certificación" : "Certification name"}</label>
            <input type="text" value={cert.nombre} onChange={e => update(i, "nombre", e.target.value)} placeholder={isMx ? "Ej. IRATA Nivel 1, PMP..." : "e.g. PMP, AWS Solutions Architect..."} style={base} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 5 }}>{isMx ? "Institución emisora" : "Issuing organization"}</label>
              <input type="text" value={cert.institucion} onChange={e => update(i, "institucion", e.target.value)} placeholder={isMx ? "Ej. IRATA International, PMI..." : "e.g. PMI, AWS, Google..."} style={base} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,.35)", marginBottom: 5 }}>{isMx ? "Año" : "Year"}</label>
              <input type="text" value={cert.anio} onChange={e => update(i, "anio", e.target.value)} placeholder="2023" style={{ ...base, width: 80 }} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...certificaciones, { nombre: "", institucion: "", anio: "" }])}
        style={{ fontSize: 10, color: "rgba(255,255,255,.4)", background: "none", border: "1px dashed rgba(255,255,255,.1)", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit" }}>
        + {isMx ? "Agregar certificación" : "Add certification"}
      </button>
    </div>
  );
}
function ShareCard({ slug, market }: { slug: string; market: Market }) {
  const url = `https://resumika.com/cv/${slug}`;
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  function shareWhatsApp() {
    const text = market === "us" || market === "ca"
      ? `Check out my professional resume: ${url}`
      : `Mira mi CV profesional: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }
  return (
    <div style={{ marginTop: 10, background: "rgba(42,82,54,.12)", border: "1px solid rgba(74,144,96,.28)", borderRadius: 8, padding: "16px 18px" }}>
      <p style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginBottom: 8, letterSpacing: "0.5px", textTransform: "uppercase" }}>Comparte este link con reclutadores</p>
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#7dd4a0", marginBottom: 12, wordBreak: "break-all" }}>{url}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={copy} style={{ fontSize: 11, background: copied ? "rgba(74,148,98,.3)" : "rgba(255,255,255,.07)", color: copied ? "#7dd4a0" : "rgba(255,255,255,.6)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 5, padding: "7px 14px", cursor: "pointer", fontFamily: "inherit" }}>
          {copied ? "✓ Copiado" : "Copiar link"}
        </button>
        <button onClick={shareWhatsApp} style={{ fontSize: 11, background: "#25D366", color: "#fff", border: "none", borderRadius: 5, padding: "7px 14px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </button>
        <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#7dd4a0", border: "1px solid rgba(74,144,96,.35)", borderRadius: 5, padding: "7px 14px", textDecoration: "none", background: "rgba(42,82,54,.15)" }}>
          Abrir página →
        </a>
      </div>
    </div>
  );
}
function Spinner({ large }: { large?: boolean }) {
  const s = large ? 28 : 13;
  return <div style={{ width: s, height: s, borderRadius: "50%", border: "2px solid rgba(255,255,255,.15)", borderTopColor: "var(--green-mid)", animation: "spin .65s linear infinite", flexShrink: 0 }} />;
}
function GeneratedResult({ text, market, slug, templateId, nombre, puesto, ciudad, email, photoUrl, userId }: {
  text: string; market: Market; slug: string | null; templateId: TemplateId;
  nombre: string; puesto: string; ciudad?: string; email?: string; photoUrl?: string; userId?: string;
}) {
  const m = MARKETS.find(x => x.id === market)!;
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const Preview = PREVIEW_TEMPLATES[templateId] ?? PREVIEW_TEMPLATES.clasico;
  const cvData: CVData = { nombre, puesto, ciudad, email, mercado: market, cv_text: editedText, photoUrl };
  const hasEdits = editedText !== text;

  const handleSave = async () => {
    if (!slug) return;
    if (!userId) { alert("Necesitas una cuenta para guardar cambios."); return; }
    setSaving(true);
    try {
      const { supabase: sb } = await import("@/lib/supabase");
      await sb.from("cvs").update({ cv_text: editedText }).eq("slug", slug);
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      alert("Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedText(text);
    setIsEditing(false);
  };

  const handleDownload = async () => {
    if (!slug) return;
    setPdfLoading(true); setPdfError(null);
    try {
      const res = await fetch("/api/pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, template: templateId }) });
      if (!res.ok) throw new Error((await res.json()).error || "Error");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${slug}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) { setPdfError(e instanceof Error ? e.message : "Error"); } finally { setPdfLoading(false); }
  };

  return (
    <div style={{ background: "var(--paper)", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "0 20px 56px rgba(0,0,0,.5)" }}>

      {/* ── Toolbar ── */}
      <div style={{ background: "var(--warm)", padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        {isEditing ? (
          <>
            <span style={{ fontSize: 11, color: "var(--body)", fontWeight: 500 }}>✏ Editando CV</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={handleSave} disabled={saving}
                style={{ background: "var(--green)", color: "#fff", border: "none", borderRadius: 4, padding: "4px 12px", fontSize: 10, fontFamily: "inherit", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Guardando..." : "✓ Guardar cambios"}
              </button>
              <button onClick={handleCancel}
                style={{ background: "none", border: "1px solid var(--border)", borderRadius: 4, padding: "4px 10px", fontSize: 10, color: "var(--muted)", fontFamily: "inherit", cursor: "pointer" }}>
                ✕ Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 500 }}>✦ CV listo para {m.flag} {m.label}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setIsEditing(true)}
                style={{ background: "none", border: "1px solid var(--border)", borderRadius: 4, padding: "4px 10px", fontSize: 10, color: "var(--muted)", fontFamily: "inherit", cursor: "pointer" }}>
                ✏ Editar texto
              </button>
              <button onClick={() => navigator.clipboard.writeText(editedText)}
                style={{ background: "none", border: "1px solid var(--border)", borderRadius: 4, padding: "4px 10px", fontSize: 10, color: "var(--muted)", fontFamily: "inherit", cursor: "pointer" }}>
                Copiar texto
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Body — template preview or textarea ── */}
      {isEditing ? (
        <div style={{ padding: 16 }}>
          <textarea
            value={editedText}
            onChange={e => setEditedText(e.target.value)}
            style={{
              width: "100%", minHeight: 480, resize: "vertical",
              background: "var(--paper)", border: "1px solid var(--border)",
              borderRadius: 6, padding: 16, fontFamily: "inherit",
              fontSize: 12, color: "var(--body)", lineHeight: 1.7, outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      ) : (
        <div style={{ overflow: "hidden" }}>
          <Preview data={cvData} />
        </div>
      )}

      {/* ── Saved / edits indicator ── */}
      {(saved || (hasEdits && !isEditing)) && (
        <div style={{ padding: "6px 16px", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: "var(--green)" }}>
            {saved ? "✓ Cambios guardados" : "● Tienes cambios guardados"}
          </span>
        </div>
      )}

      {pdfError && <p style={{ fontSize: 11, color: "#b91c1c", background: "#fef2f2", margin: "0 16px", padding: "6px 10px", borderRadius: 5, border: "1px solid #fecaca" }}>{pdfError}</p>}

      {/* ── Actions ── */}
      <div style={{ padding: "12px 16px", background: "var(--warm)", borderTop: "1px solid var(--border)", display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={handleDownload} disabled={pdfLoading || !slug}
          style={{ flex: 1, minWidth: 140, background: "var(--green)", color: "#fff", border: "none", borderRadius: 6, padding: 10, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: pdfLoading || !slug ? "not-allowed" : "pointer", opacity: pdfLoading || !slug ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          {pdfLoading ? <><Spinner />Generando PDF...</> : "⬇ Descargar PDF"}
        </button>
        <button onClick={() => { if (slug) window.location.href = `/crear?edit=${slug}`; }}
          style={{ flex: 1, minWidth: 120, background: "none", color: "var(--body)", border: "1px solid var(--border)", borderRadius: 6, padding: 10, fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>
          ← Editar formulario
        </button>
      </div>
    </div>
  );
}
