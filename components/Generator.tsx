"use client";
import { useState, useRef, useEffect } from "react";
import CVPreview from "./CVPreview";
import TemplateSelector from "./TemplateSelector";
import type { TemplateId } from "@/lib/templates/types";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAILS = ["hugoivanrf@gmail.com"];

const TONES = ["Profesional", "Creativo", "Formal", "Moderno"];
const INDUSTRIES = ["Diseño", "Tecnología", "Marketing", "Educación", "Salud", "Finanzas", "Construcción", "Manufactura", "Logística", "Ventas", "Recursos Humanos", "Legal", "Gastronomía", "Turismo", "Medios"];

const COMMON_LANGUAGES = [
  "Español", "English", "Français", "Português", "Deutsch", "Italiano",
  "中文 (Mandarín)", "日本語", "한국어", "العربية", "Русский", "Nederlands",
  "Polski", "Türkçe", "हिन्दी", "Tagalog", "Vietnamese",
];

const LEVELS_ES = ["Nativo", "Fluido", "Avanzado (C1)", "Intermedio (B2)", "Básico (B1)", "Elemental (A2)"];
const LEVELS_EN = ["Native", "Fluent", "Advanced (C1)", "Intermediate (B2)", "Basic (B1)", "Elementary (A2)"];

const FORM_LABELS = {
  blocks: {
    personalData: { mx: "Datos personales",  us: "Personal Data / Datos personales",  ca: "Personal Data / Datos personales / Données personnelles" },
    experience:   { mx: "Experiencia",        us: "Experience / Experiencia",           ca: "Experience / Experiencia / Expérience" },
    languages:    { mx: "Idiomas",            us: "Languages / Idiomas",               ca: "Languages / Idiomas / Langues" },
  },
  fields: {
    nombre:       { mx: "Nombre completo",    us: "Full Name / Nombre",                ca: "Full Name / Nombre / Nom complet" },
    puesto:       { mx: "Puesto deseado",     us: "Job Title / Puesto",                ca: "Job Title / Puesto / Titre du poste" },
    ciudad:       { mx: "Ciudad",             us: "City / Ciudad",                     ca: "City / Ciudad / Ville" },
    ultimoPuesto: { mx: "Último puesto",      us: "Last Position / Último puesto",     ca: "Last Position / Último puesto / Dernier poste" },
    empresa:      { mx: "Empresa",            us: "Company / Empresa",                 ca: "Company / Empresa / Entreprise" },
    descripcion:  { mx: "¿Qué hacías? Descríbelo brevemente", us: "Achievements (with numbers) / Logros (con números)", ca: "Work Description / Descripción / Description du travail" },
    voluntariado: { mx: "", us: "", ca: "Volunteer Work / Voluntariado / Bénévolat (important in Canada)" },
  },
};

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

export interface ExperienciaEntry {
  puesto: string;
  empresa: string;
  periodo: string;
  descripcion: string;
}

export interface RedSocial {
  tipo: string;
  url: string;
}

export interface EducacionEntry {
  carrera: string;
  institucion: string;
  anio: string;
}

export interface FormData {
  nombre: string; puesto: string; ciudad: string; email: string;
  tono: string; industria: string; mercado: Market;
  edad?: string; estadoCivil?: string; voluntariado?: string; photoUrl?: string;
  languages?: Array<{ language: string; level: string }>;
  templateId: TemplateId;
  sinExperiencia?: boolean;
  experiencias: ExperienciaEntry[];
  redesSociales?: RedSocial[];
  habilidades?: string[];
  educacion?: EducacionEntry[];
}

const DEFAULT_FORM: FormData = {
  nombre: "", puesto: "", ciudad: "", email: "",
  tono: "Profesional", industria: "Diseño", mercado: "mx", templateId: "clasico",
  languages: [{ language: "Spanish", level: "Nativo" }],
  sinExperiencia: false,
  experiencias: [{ puesto: "", empresa: "", periodo: "", descripcion: "" }],
  redesSociales: [],
  habilidades: [],
  educacion: [{ carrera: "", institucion: "", anio: "" }],
};

interface GeneratorProps {
  initialData?: Record<string, unknown>;
  editSlug?: string;
}

export default function Generator({ initialData, editSlug }: GeneratorProps = {}) {
  const [form, setForm] = useState<FormData>(() => {
    if (!initialData) return DEFAULT_FORM;
    const merged = { ...DEFAULT_FORM, ...initialData };
    // Parse languages string back to array if needed
    if (typeof merged.languages === "string") {
      merged.languages = (merged.languages as string)
        ? (merged.languages as string).split(", ").map((entry: string) => {
            const match = entry.match(/^(.+?)\s*\((.+)\)$/);
            return match
              ? { language: match[1].trim(), level: match[2].trim() }
              : { language: entry.trim(), level: "Nativo" };
          })
        : DEFAULT_FORM.languages;
    }
    return merged as FormData;
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email ?? "";
      setIsAdmin(ADMIN_EMAILS.includes(email));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const email = session?.user?.email ?? "";
      setIsAdmin(ADMIN_EMAILS.includes(email));
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
          ? draft.languages.split(", ").map((entry: string) => {
              const match = entry.match(/^(.+?)\s*\((.+)\)$/);
              return match
                ? { language: match[1].trim(), level: match[2].trim() }
                : { language: entry.trim(), level: "Fluido" };
            })
          : [{ language: "Spanish", level: "Nativo" }];
      }
      setForm(f => ({ ...f, ...draft }));
    } catch { /* ignore malformed draft */ }
  }, []);

  const set = (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const selectMarket = (m: Market) => {
    setForm(f => ({ ...f, mercado: m }));
    setResult(null);
    setSlug(null);
  };

  const handleGenerate = async () => {
    if (!form.nombre || !form.puesto) {
      setError("Por favor completa nombre y puesto deseado.");
      return;
    }
    if (!form.sinExperiencia && form.experiencias.every(e => !e.descripcion.trim())) {
      setError("Describe al menos una experiencia, o marca que no tienes experiencia.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, editSlug: editSlug ?? undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error generando CV");
      setResult(data.cv);
      setSlug(data.slug ?? null);
      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const selectedMarket = MARKETS.find(m => m.id === form.mercado)!;
  const note = DIFF_NOTES[form.mercado];

  return (
    <section id="generador" style={{ background: "var(--ink)", padding: "88px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>

        {/* Label */}
        <div style={{ fontSize: 10, letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(255,255,255,.2)", fontWeight: 500, marginBottom: 40, display: "flex", alignItems: "center", gap: 12 }}>
          Generador
          <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,.07)", display: "block" }} />
        </div>

        {/* Market selector */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,.28)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>¿Para qué mercado?</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {MARKETS.map(m => (
              <button key={m.id} onClick={() => selectMarket(m.id)}
                style={{ border: `1px solid ${form.mercado === m.id ? "rgba(74,144,96,.55)" : "rgba(255,255,255,.08)"}`, borderRadius: 8, padding: "14px 16px", background: form.mercado === m.id ? "rgba(42,82,54,.18)" : "rgba(255,255,255,.03)", cursor: "pointer", textAlign: "left", transition: "all .15s" }}>
                <div style={{ fontSize: 20, marginBottom: 5 }}>{m.flag}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: form.mercado === m.id ? "#7dd4a0" : "rgba(255,255,255,.7)", fontFamily: "inherit", marginBottom: 2 }}>{m.label}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.28)", fontFamily: "inherit", lineHeight: 1.4 }}>{m.hint}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>

          {/* FORM */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FormBlock title={FORM_LABELS.blocks.personalData[form.mercado]}>
              <FieldRow>
                <Field label={FORM_LABELS.fields.nombre[form.mercado]} placeholder="María García López" value={form.nombre} onChange={set("nombre")} />
                <Field label={FORM_LABELS.fields.puesto[form.mercado]} placeholder={form.mercado === "us" ? "Graphic Designer" : "Diseñadora Gráfica"} value={form.puesto} onChange={set("puesto")} />
              </FieldRow>
              <FieldRow>
                <Field label={FORM_LABELS.fields.ciudad[form.mercado]} placeholder={form.mercado === "mx" ? "León, Gto." : form.mercado === "us" ? "Austin, TX" : "Toronto, ON"} value={form.ciudad} onChange={set("ciudad")} />
                <Field label="Email" placeholder="maria@correo.com" value={form.email} onChange={set("email")} />
              </FieldRow>
              {form.mercado === "mx" && (
                <>
                  <FieldRow>
                    <Field label="Edad (opcional)" placeholder="28 años" value={form.edad ?? ""} onChange={set("edad")} />
                    <Field label="Estado civil (opcional)" placeholder="Soltero/a" value={form.estadoCivil ?? ""} onChange={set("estadoCivil")} />
                  </FieldRow>
                  <PhotoUpload value={form.photoUrl} onChange={url => setForm(f => ({ ...f, photoUrl: url }))} />
                </>
              )}
            </FormBlock>

            <FormBlock title={FORM_LABELS.blocks.experience[form.mercado]}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.sinExperiencia ?? false}
                  onChange={e => setForm(f => ({ ...f, sinExperiencia: e.target.checked }))}
                  style={{ accentColor: "var(--green-mid)", width: 14, height: 14 }}
                />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>
                  {form.mercado === "us" ? "I have no work experience" : "No tengo experiencia laboral"}
                </span>
              </label>
              {!form.sinExperiencia && (
                <ExperienceSelector
                  experiencias={form.experiencias}
                  onChange={exp => setForm(f => ({ ...f, experiencias: exp }))}
                  market={form.mercado}
                />
              )}
              {form.sinExperiencia && (
                <p style={{ fontSize: 11, color: "rgba(255,255,255,.3)", lineHeight: 1.6, marginBottom: 4 }}>
                  {form.mercado === "us"
                    ? "The AI will focus on your education, skills, and personal projects — no invented work history."
                    : "La IA se enfocará en educación, habilidades y proyectos — sin inventar experiencia laboral."}
                </p>
              )}
              {form.mercado === "ca" && (
                <div style={{ marginTop: 12 }}>
                  <Field label={FORM_LABELS.fields.voluntariado.ca} placeholder="Ej. Voluntario en banco de alimentos, diseñé materiales..." value={form.voluntariado ?? ""} onChange={e => setForm(f => ({ ...f, voluntariado: e.target.value }))} textarea />
                </div>
              )}
            </FormBlock>

            <FormBlock title={
              form.mercado === "mx" ? "Redes y perfiles" :
              form.mercado === "us" ? "Links & Profiles" :
              "Links & Profiles / Réseaux et profils"
            }>
              <SocialLinksSelector
                links={form.redesSociales ?? []}
                onChange={links => setForm(f => ({ ...f, redesSociales: links }))}
                market={form.mercado}
              />
            </FormBlock>

            <FormBlock title={FORM_LABELS.blocks.languages[form.mercado]}>
              <LanguageSelector
                languages={form.languages ?? []}
                onChange={langs => setForm(f => ({ ...f, languages: langs }))}
                market={form.mercado}
              />
            </FormBlock>

            <FormBlock title={
              form.mercado === "mx" ? "Habilidades (opcional)" :
              form.mercado === "us" ? "Skills (optional)" :
              "Skills / Core Competencies (optional)"
            }>
              <SkillsSelector
                skills={form.habilidades ?? []}
                onChange={s => setForm(f => ({ ...f, habilidades: s }))}
                market={form.mercado}
              />
            </FormBlock>

            <FormBlock title={
              form.mercado === "mx" ? "Educación" :
              form.mercado === "us" ? "Education" :
              "Education / Educación"
            }>
              <EducacionSelector
                educacion={form.educacion ?? [{ carrera: "", institucion: "", anio: "" }]}
                onChange={edu => setForm(f => ({ ...f, educacion: edu }))}
                market={form.mercado}
              />
            </FormBlock>

            <FormBlock title="Preferencias de IA">
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 10, color: "rgba(255,255,255,.28)", display: "block", marginBottom: 8 }}>Tono</label>
                <PillGroup
                  options={[...TONES, "Otro"]}
                  selected={TONES.includes(form.tono) ? form.tono : "Otro"}
                  onSelect={v => setForm(f => ({ ...f, tono: v === "Otro" ? "" : v }))}
                />
                {!TONES.includes(form.tono) && (
                  <input
                    type="text" autoFocus
                    placeholder="Ej. Emprendedor, Técnico, Académico..."
                    value={form.tono}
                    onChange={e => setForm(f => ({ ...f, tono: e.target.value }))}
                    style={{ marginTop: 8, width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(74,144,96,.35)", borderRadius: 5, padding: "8px 11px", fontFamily: "inherit", fontSize: 12, color: "rgba(248,245,239,.9)", outline: "none" }}
                  />
                )}
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 10, color: "rgba(255,255,255,.28)", display: "block", marginBottom: 8 }}>Industria</label>
                <PillGroup
                  options={[...INDUSTRIES, "Otra"]}
                  selected={INDUSTRIES.includes(form.industria) ? form.industria : "Otra"}
                  onSelect={v => setForm(f => ({ ...f, industria: v === "Otra" ? "" : v }))}
                />
                {!INDUSTRIES.includes(form.industria) && (
                  <input
                    type="text" autoFocus
                    placeholder="Ej. Agricultura, Minería, Deportes..."
                    value={form.industria}
                    onChange={e => setForm(f => ({ ...f, industria: e.target.value }))}
                    style={{ marginTop: 8, width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(74,144,96,.35)", borderRadius: 5, padding: "8px 11px", fontFamily: "inherit", fontSize: 12, color: "rgba(248,245,239,.9)", outline: "none" }}
                  />
                )}
              </div>
              <TemplateSelector
                selected={form.templateId}
                onSelect={v => setForm(f => ({ ...f, templateId: v }))}
                userIsPro={isAdmin}
              />
              {error && <p style={{ fontSize: 12, color: "#f87171", marginTop: 12 }}>{error}</p>}
              <button onClick={handleGenerate} disabled={loading}
                style={{ width: "100%", marginTop: 18, background: "var(--green-mid)", color: "#fff", border: "none", borderRadius: 6, padding: 13, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.7 : 1 }}>
                {loading ? <><Spinner />Generando...</> : editSlug ? <>✦ Actualizar mi CV</> : <>✦ Generar CV para {selectedMarket.flag} {selectedMarket.label}</>}
              </button>
              {!isAdmin && <p style={{ textAlign: "center", fontSize: 9, color: "rgba(255,255,255,.18)", marginTop: 8, letterSpacing: "0.5px" }}>El primero es gratis · Sin tarjeta · Sin registro</p>}
            </FormBlock>
          </div>

          {/* PREVIEW */}
          <div ref={previewRef} style={{ position: "relative" }}>
            {result ? (
              <>
                <GeneratedResult text={result} market={form.mercado} slug={slug} templateId={form.templateId} />
                {slug && <ShareCard slug={slug} />}
              </>
            ) : (
              <>
                <CVPreview market={form.mercado} photoUrl={form.photoUrl} templateId={form.templateId} formData={form} />
                {loading && (
                  <div style={{ position: "absolute", inset: 0, borderRadius: 8, background: "rgba(28,26,22,.88)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
                    <Spinner large />
                    <p style={{ fontSize: 13, color: "rgba(248,245,239,.4)" }}>Generando CV para {selectedMarket.flag} {selectedMarket.label}...</p>
                  </div>
                )}
              </>
            )}
            {/* Diff note */}
            <div style={{ marginTop: 12, background: note.bg, border: `1px solid ${note.border}`, color: note.color, borderRadius: 6, padding: "8px 12px", fontSize: 11, display: "flex", gap: 7, alignItems: "flex-start", lineHeight: 1.5 }}>
              <span style={{ fontSize: 13, flexShrink: 0 }}>{note.icon}</span>
              <span dangerouslySetInnerHTML={{ __html: note.text }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Sub-components ──

function FormBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 8, padding: 22 }}>
      <div style={{ fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,.22)", marginBottom: 18, fontWeight: 500 }}>{title}</div>
      {children}
    </div>
  );
}
function FieldRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{children}</div>;
}
function Field({ label, placeholder, value, onChange, textarea }: { label: string; placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; textarea?: boolean }) {
  const base: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 5, padding: "8px 11px", fontFamily: "inherit", fontSize: 12, color: "rgba(248,245,239,.9)", outline: "none" };
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "block", fontSize: 10, color: "rgba(255,255,255,.28)", marginBottom: 5 }}>{label}</label>
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
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("La foto no puede superar 2MB.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "block", fontSize: 10, color: "rgba(255,255,255,.28)", marginBottom: 5 }}>Foto (opcional)</label>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {value ? (
          <>
            <img src={value} alt="Vista previa" style={{ width: 40, height: 40, borderRadius: 5, objectFit: "cover", border: "1px solid rgba(255,255,255,.12)" }} />
            <button type="button" onClick={() => { onChange(undefined); if (inputRef.current) inputRef.current.value = ""; }}
              style={{ fontSize: 10, color: "#f87171", background: "none", border: "1px solid rgba(248,113,113,.3)", borderRadius: 4, padding: "3px 8px", cursor: "pointer", fontFamily: "inherit" }}>
              Quitar
            </button>
          </>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()}
            style={{ fontSize: 11, color: "rgba(255,255,255,.6)", background: "rgba(255,255,255,.05)", border: "1px dashed rgba(255,255,255,.15)", borderRadius: 5, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit" }}>
            + Subir foto
          </button>
        )}
        <span style={{ fontSize: 9, color: "rgba(255,255,255,.2)" }}>JPG · PNG · WEBP · Máx. 2MB</span>
      </div>
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleFile} style={{ display: "none" }} />
    </div>
  );
}
function SkillsSelector({ skills, onChange, market }: {
  skills: string[];
  onChange: (s: string[]) => void;
  market: Market;
}) {
  const [input, setInput] = useState("");
  const isMx = market === "mx";

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) onChange([...skills, trimmed]);
    setInput("");
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
    if (e.key === "Backspace" && !input && skills.length) onChange(skills.slice(0, -1));
  };

  const placeholder = isMx
    ? "Ej. Photoshop, Figma..."
    : market === "us" ? "e.g. Figma, Leadership..."
    : "e.g. Figma, Bilingual...";

  const hint = isMx
    ? "Presiona Enter o coma para agregar. La IA también agregará las relevantes para tu industria."
    : market === "us"
    ? "Press Enter or comma to add. The AI will also suggest relevant skills."
    : "Appuyez sur Entrée / Press Enter to add. The AI will complement based on your industry.";

  const addLabel = isMx ? "+ Agregar" : "+ Add";

  return (
    <div>
      <p style={{ fontSize: 10, color: "rgba(255,255,255,.28)", marginBottom: 10, lineHeight: 1.5 }}>{hint}</p>
      {skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {skills.map((s, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(42,82,54,.2)", border: "1px solid rgba(74,144,96,.3)", borderRadius: 100, padding: "3px 10px 3px 12px", fontSize: 11, color: "#7dd4a0" }}>
              {s}
              <button type="button" onClick={() => onChange(skills.filter((_, j) => j !== i))}
                style={{ fontSize: 13, color: "rgba(125,212,160,.5)", background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          style={{ flex: 1, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 5, padding: "8px 11px", fontFamily: "inherit", fontSize: 12, color: "rgba(248,245,239,.9)", outline: "none" }}
        />
        <button type="button" onClick={add} disabled={!input.trim()}
          style={{ fontSize: 11, color: "rgba(255,255,255,.5)", background: "none", border: "1px solid rgba(255,255,255,.12)", borderRadius: 5, padding: "6px 12px", cursor: input.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", opacity: input.trim() ? 1 : 0.4 }}>
          {addLabel}
        </button>
      </div>
    </div>
  );
}

const SOCIAL_TYPES = ["LinkedIn", "GitHub", "Portfolio", "Behance", "Twitter/X", "Dribbble", "Otro"];

function ExperienceSelector({ experiencias, onChange, market }: {
  experiencias: ExperienciaEntry[];
  onChange: (exp: ExperienciaEntry[]) => void;
  market: Market;
}) {
  const isMx = market === "mx";
  const base: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 5, padding: "8px 11px", fontFamily: "inherit", fontSize: 12, color: "rgba(248,245,239,.9)", outline: "none" };
  const update = (i: number, field: keyof ExperienciaEntry, val: string) =>
    onChange(experiencias.map((e, j) => j === i ? { ...e, [field]: val } : e));
  const remove = (i: number) => onChange(experiencias.filter((_, j) => j !== i));
  const add = () => onChange([...experiencias, { puesto: "", empresa: "", periodo: "", descripcion: "" }]);

  return (
    <div>
      {experiencias.map((exp, i) => (
        <div key={i} style={{ marginBottom: 16, padding: 14, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,.22)" }}>
              {isMx ? `Experiencia ${i + 1}` : `Experience ${i + 1}`}
            </span>
            {experiencias.length > 1 && (
              <button type="button" onClick={() => remove(i)}
                style={{ fontSize: 13, color: "rgba(255,255,255,.25)", background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>×</button>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "rgba(255,255,255,.28)", marginBottom: 5 }}>
                {isMx ? "Puesto" : market === "us" ? "Job Title" : "Position"}
              </label>
              <input type="text" value={exp.puesto} onChange={e => update(i, "puesto", e.target.value)}
                placeholder={isMx ? "Diseñadora Gráfica" : "Graphic Designer"} style={base} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "rgba(255,255,255,.28)", marginBottom: 5 }}>
                {isMx ? "Empresa" : "Company"}
              </label>
              <input type="text" value={exp.empresa} onChange={e => update(i, "empresa", e.target.value)}
                placeholder="Agencia Creativa" style={base} />
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", fontSize: 10, color: "rgba(255,255,255,.28)", marginBottom: 5 }}>
              {isMx ? "Período" : "Period"}
            </label>
            <input type="text" value={exp.periodo} onChange={e => update(i, "periodo", e.target.value)}
              placeholder={isMx ? "Ej. Ene 2020 – Presente" : "e.g. Jan 2020 – Present"} style={base} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, color: "rgba(255,255,255,.28)", marginBottom: 5 }}>
              {market === "mx" ? "¿Qué hacías? Descríbelo brevemente" : market === "us" ? "Achievements (with numbers)" : "Work description"}
            </label>
            <textarea value={exp.descripcion} onChange={e => update(i, "descripcion", e.target.value)} rows={3}
              placeholder={market === "mx" ? "Ej. Diseñé identidades de marca, reduje tiempos en 30%..." : market === "us" ? "e.g. Led rebranding for 5 clients, increased engagement by 35%..." : "Ej. Diseñé materiales, lideré equipo de 3 personas..."}
              style={{ ...base, resize: "none" }} />
          </div>
        </div>
      ))}
      <button type="button" onClick={add}
        style={{ fontSize: 10, color: "rgba(255,255,255,.4)", background: "none", border: "1px dashed rgba(255,255,255,.12)", borderRadius: 5, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit" }}>
        + {isMx ? "Agregar otra experiencia" : "Add another experience"}
      </button>
    </div>
  );
}

function EducacionSelector({ educacion, onChange, market }: {
  educacion: EducacionEntry[];
  onChange: (edu: EducacionEntry[]) => void;
  market: Market;
}) {
  const isMx = market === "mx";
  const base: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 5, padding: "8px 11px", fontFamily: "inherit", fontSize: 12, color: "rgba(248,245,239,.9)", outline: "none" };
  const update = (i: number, field: keyof EducacionEntry, val: string) =>
    onChange(educacion.map((e, j) => j === i ? { ...e, [field]: val } : e));
  const remove = (i: number) => onChange(educacion.filter((_, j) => j !== i));
  const add = () => onChange([...educacion, { carrera: "", institucion: "", anio: "" }]);

  return (
    <div>
      {educacion.map((edu, i) => (
        <div key={i} style={{ marginBottom: 14, padding: 14, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,.22)" }}>
              {isMx ? `Estudio ${i + 1}` : `Degree ${i + 1}`}
            </span>
            {educacion.length > 1 && (
              <button type="button" onClick={() => remove(i)}
                style={{ fontSize: 13, color: "rgba(255,255,255,.25)", background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>×</button>
            )}
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", fontSize: 10, color: "rgba(255,255,255,.28)", marginBottom: 5 }}>
              {isMx ? "Carrera / Título" : market === "us" ? "Degree / Field of Study" : "Degree / Titre"}
            </label>
            <input type="text" value={edu.carrera} onChange={e => update(i, "carrera", e.target.value)}
              placeholder={isMx ? "Ej. Lic. en Diseño Gráfico" : "e.g. B.A. Graphic Design"} style={base} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "rgba(255,255,255,.28)", marginBottom: 5 }}>
                {isMx ? "Institución" : "Institution"}
              </label>
              <input type="text" value={edu.institucion} onChange={e => update(i, "institucion", e.target.value)}
                placeholder={isMx ? "Ej. Universidad de Guanajuato" : "e.g. University of Toronto"} style={base} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 10, color: "rgba(255,255,255,.28)", marginBottom: 5 }}>
                {isMx ? "Año" : "Year"}
              </label>
              <input type="text" value={edu.anio} onChange={e => update(i, "anio", e.target.value)}
                placeholder={isMx ? "2020" : "2020"} style={{ ...base, width: 80 }} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={add}
        style={{ fontSize: 10, color: "rgba(255,255,255,.4)", background: "none", border: "1px dashed rgba(255,255,255,.12)", borderRadius: 5, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit" }}>
        + {isMx ? "Agregar otro estudio" : "Add another degree"}
      </button>
    </div>
  );
}

function SocialLinksSelector({ links, onChange, market }: {
  links: RedSocial[];
  onChange: (links: RedSocial[]) => void;
  market: Market;
}) {
  const base: React.CSSProperties = { background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 5, padding: "8px 11px", fontFamily: "inherit", fontSize: 12, color: "rgba(248,245,239,.9)", outline: "none", width: "100%" };
  const update = (i: number, field: keyof RedSocial, val: string) =>
    onChange(links.map((l, j) => j === i ? { ...l, [field]: val } : l));
  const remove = (i: number) => onChange(links.filter((_, j) => j !== i));
  const add = () => onChange([...links, { tipo: "LinkedIn", url: "" }]);

  const emptyText = market === "mx"
    ? "Agrega tu LinkedIn, portafolio u otras redes para incluirlos en el CV."
    : market === "us"
    ? "Add your LinkedIn, portfolio or other profiles to include them in your resume."
    : "Ajoutez LinkedIn, portfolio ou autres profils / Add your LinkedIn, portfolio or other profiles.";

  const addLabel = market === "mx" ? "+ Agregar link" : market === "us" ? "+ Add link" : "+ Ajouter / Add link";

  const placeholder = market === "mx"
    ? "https://linkedin.com/in/tu-perfil"
    : "https://linkedin.com/in/your-profile";

  return (
    <div>
      {links.length === 0 && (
        <p style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginBottom: 10, lineHeight: 1.5 }}>
          {emptyText}
        </p>
      )}
      {links.map((link, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
          <select value={link.tipo} onChange={e => update(i, "tipo", e.target.value)}
            style={{ ...base, width: "auto", cursor: "pointer" }}>
            {SOCIAL_TYPES.map(t => <option key={t} value={t} style={{ background: "#1c1a16" }}>{t}</option>)}
          </select>
          <input type="text" value={link.url} onChange={e => update(i, "url", e.target.value)}
            placeholder={placeholder} style={base} />
          <button type="button" onClick={() => remove(i)}
            style={{ fontSize: 16, color: "rgba(255,255,255,.3)", background: "none", border: "none", cursor: "pointer", padding: "0 4px", lineHeight: 1 }}>×</button>
        </div>
      ))}
      <button type="button" onClick={add}
        style={{ fontSize: 10, color: "rgba(255,255,255,.4)", background: "none", border: "1px dashed rgba(255,255,255,.12)", borderRadius: 5, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit" }}>
        {addLabel}
      </button>
    </div>
  );
}

function LanguageSelector({ languages, onChange, market }: {
  languages: Array<{ language: string; level: string }>;
  onChange: (langs: Array<{ language: string; level: string }>) => void;
  market: Market;
}) {
  const isMx = market === "mx";
  const levels = isMx ? LEVELS_ES : LEVELS_EN;
  const inputBase: React.CSSProperties = { background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 5, padding: "8px 11px", fontFamily: "inherit", fontSize: 12, color: "rgba(248,245,239,.9)", outline: "none", width: "100%" };
  return (
    <div>
      {languages.map((l, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
          <div>
            <input
              list={`lang-list-${i}`}
              placeholder={isMx ? "Ej. Inglés" : "e.g. French"}
              value={l.language}
              onChange={e => onChange(languages.map((x, j) => j === i ? { ...x, language: e.target.value } : x))}
              style={inputBase}
            />
            <datalist id={`lang-list-${i}`}>
              {COMMON_LANGUAGES.map(lang => <option key={lang} value={lang} />)}
            </datalist>
          </div>
          <select value={l.level}
            onChange={e => onChange(languages.map((x, j) => j === i ? { ...x, level: e.target.value } : x))}
            style={{ ...inputBase, cursor: "pointer" }}>
            {levels.map(lv => <option key={lv} value={lv} style={{ background: "#1c1a16" }}>{lv}</option>)}
          </select>
          <button type="button" onClick={() => onChange(languages.filter((_, j) => j !== i))}
            style={{ fontSize: 16, color: "rgba(255,255,255,.3)", background: "none", border: "none", cursor: "pointer", padding: "0 4px", lineHeight: 1 }}>×</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...languages, { language: "", level: levels[0] }])}
        style={{ fontSize: 10, color: "rgba(255,255,255,.4)", background: "none", border: "1px dashed rgba(255,255,255,.12)", borderRadius: 5, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit" }}>
        + {isMx ? "Agregar idioma" : "Add language"}
      </button>
    </div>
  );
}
function ShareCard({ slug }: { slug: string }) {
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/cv/${slug}`;
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ marginTop: 10, background: "rgba(42,82,54,.12)", border: "1px solid rgba(74,144,96,.28)", borderRadius: 8, padding: "16px 18px" }}>
      <p style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginBottom: 8, letterSpacing: "0.5px", textTransform: "uppercase" }}>Comparte este link con reclutadores</p>
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#7dd4a0", marginBottom: 12, wordBreak: "break-all" }}>{url}</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={copy}
          style={{ fontSize: 11, background: copied ? "rgba(74,148,98,.3)" : "rgba(255,255,255,.07)", color: copied ? "#7dd4a0" : "rgba(255,255,255,.6)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 5, padding: "7px 14px", cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
          {copied ? "✓ Copiado" : "Copiar link"}
        </button>
        <a href={url} target="_blank" rel="noreferrer"
          style={{ fontSize: 11, color: "#7dd4a0", border: "1px solid rgba(74,144,96,.35)", borderRadius: 5, padding: "7px 14px", textDecoration: "none", background: "rgba(42,82,54,.15)" }}>
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
function GeneratedResult({ text, market, slug, templateId }: { text: string; market: Market; slug: string | null; templateId: TemplateId }) {
  const m = MARKETS.find(x => x.id === market)!;
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!slug) return;
    setPdfLoading(true);
    setPdfError(null);
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, template: templateId }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Error");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setPdfError(e instanceof Error ? e.message : "Error generando PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div style={{ background: "var(--paper)", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "0 20px 56px rgba(0,0,0,.5)" }}>
      <div style={{ background: "var(--warm)", padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 500 }}>✦ CV listo para {m.flag} {m.label}</span>
        <button onClick={() => navigator.clipboard.writeText(text)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 4, padding: "4px 10px", fontSize: 10, color: "var(--muted)", fontFamily: "inherit", cursor: "pointer" }}>Copiar</button>
      </div>
      <div style={{ padding: 24, maxHeight: 480, overflowY: "auto" }}>
        <pre style={{ fontFamily: "inherit", fontSize: 12, color: "var(--body)", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{text}</pre>
      </div>
      {pdfError && (
        <p style={{ fontSize: 11, color: "#b91c1c", background: "#fef2f2", margin: "0 16px", padding: "6px 10px", borderRadius: 5, border: "1px solid #fecaca" }}>{pdfError}</p>
      )}
      <div style={{ padding: "12px 16px", background: "var(--warm)", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
        <button
          onClick={handleDownload}
          disabled={pdfLoading || !slug}
          style={{ flex: 1, background: "var(--green)", color: "#fff", border: "none", borderRadius: 6, padding: 10, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: pdfLoading || !slug ? "not-allowed" : "pointer", opacity: pdfLoading || !slug ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
        >
          {pdfLoading ? <><Spinner />Generando PDF...</> : "⬇ Descargar PDF"}
        </button>
        <button style={{ flex: 1, background: "none", color: "var(--body)", border: "1px solid var(--border)", borderRadius: 6, padding: 10, fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>Editar datos</button>
      </div>
    </div>
  );
}
