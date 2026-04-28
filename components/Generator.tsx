"use client";
import { useState, useRef } from "react";
import CVPreview from "./CVPreview";

const TONES = ["Profesional", "Creativo", "Formal", "Moderno"];
const INDUSTRIES = ["Diseño", "Tecnología", "Marketing", "Educación", "Salud", "Finanzas"];

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

export interface FormData {
  nombre: string; puesto: string; ciudad: string; email: string;
  ultimoPuesto: string; empresa: string; descripcion: string;
  tono: string; industria: string; mercado: Market;
  edad?: string; estadoCivil?: string; voluntariado?: string; photoUrl?: string;
  languages?: Array<{ language: string; level: string }>;
}

export default function Generator() {
  const [form, setForm] = useState<FormData>({
    nombre: "", puesto: "", ciudad: "", email: "",
    ultimoPuesto: "", empresa: "", descripcion: "",
    tono: "Profesional", industria: "Diseño", mercado: "mx",
    languages: [{ language: "Spanish", level: "Nativo" }],
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const selectMarket = (m: Market) => {
    setForm(f => ({ ...f, mercado: m }));
    setResult(null);
    setSlug(null);
  };

  const handleGenerate = async () => {
    if (!form.nombre || !form.puesto || !form.descripcion) {
      setError("Por favor completa nombre, puesto y descripción.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error generando CV");
      setResult(data.cv);
      setSlug(data.slug ?? null);
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
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px" }}>

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
              <FieldRow>
                <Field label={FORM_LABELS.fields.ultimoPuesto[form.mercado]} placeholder={form.mercado === "us" ? "Junior Designer" : "Diseñadora Junior"} value={form.ultimoPuesto} onChange={set("ultimoPuesto")} />
                <Field label={FORM_LABELS.fields.empresa[form.mercado]} placeholder="Agencia Creativa" value={form.empresa} onChange={set("empresa")} />
              </FieldRow>
              <Field label={FORM_LABELS.fields.descripcion[form.mercado]}
                placeholder={form.mercado === "mx" ? "Ej. Diseñé identidades de marca, materiales para redes..." : form.mercado === "us" ? "e.g. Led rebranding for 5 clients, increased engagement by 35%..." : "Ej. Diseñé materiales, lideré equipo de 3 personas..."}
                value={form.descripcion} onChange={set("descripcion")} textarea />
              {form.mercado === "ca" && (
                <Field label={FORM_LABELS.fields.voluntariado.ca} placeholder="Ej. Voluntario en banco de alimentos, diseñé materiales..." value={form.voluntariado ?? ""} onChange={set("voluntariado")} textarea />
              )}
            </FormBlock>

            <FormBlock title={FORM_LABELS.blocks.languages[form.mercado]}>
              <LanguageSelector
                languages={form.languages ?? []}
                onChange={langs => setForm(f => ({ ...f, languages: langs }))}
                market={form.mercado}
              />
            </FormBlock>

            <FormBlock title="Preferencias de IA">
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 10, color: "rgba(255,255,255,.28)", display: "block", marginBottom: 8 }}>Tono</label>
                <PillGroup options={TONES} selected={form.tono} onSelect={v => setForm(f => ({ ...f, tono: v }))} />
              </div>
              <div>
                <label style={{ fontSize: 10, color: "rgba(255,255,255,.28)", display: "block", marginBottom: 8 }}>Industria</label>
                <PillGroup options={INDUSTRIES} selected={form.industria} onSelect={v => setForm(f => ({ ...f, industria: v }))} />
              </div>
              {error && <p style={{ fontSize: 12, color: "#f87171", marginTop: 12 }}>{error}</p>}
              <button onClick={handleGenerate} disabled={loading}
                style={{ width: "100%", marginTop: 18, background: "var(--green-mid)", color: "#fff", border: "none", borderRadius: 6, padding: 13, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.7 : 1 }}>
                {loading ? <><Spinner />Generando...</> : <>✦ Generar CV para {selectedMarket.flag} {selectedMarket.label}</>}
              </button>
              <p style={{ textAlign: "center", fontSize: 9, color: "rgba(255,255,255,.18)", marginTop: 8, letterSpacing: "0.5px" }}>El primero es gratis · Sin tarjeta · Sin registro</p>
            </FormBlock>
          </div>

          {/* PREVIEW */}
          <div style={{ position: "relative" }}>
            {result ? (
              <>
                <GeneratedResult text={result} market={form.mercado} />
                {slug && <ShareCard slug={slug} />}
              </>
            ) : (
              <>
                <CVPreview market={form.mercado} photoUrl={form.photoUrl} />
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
          <input type="text" placeholder={isMx ? "Ej. Inglés" : "e.g. French"} value={l.language}
            onChange={e => onChange(languages.map((x, j) => j === i ? { ...x, language: e.target.value } : x))}
            style={inputBase} />
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
  const url = `https://currivo.mx/cv/${slug}`;
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
function GeneratedResult({ text, market }: { text: string; market: Market }) {
  const m = MARKETS.find(x => x.id === market)!;
  return (
    <div style={{ background: "var(--paper)", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "0 20px 56px rgba(0,0,0,.5)" }}>
      <div style={{ background: "var(--warm)", padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 500 }}>✦ CV listo para {m.flag} {m.label}</span>
        <button onClick={() => navigator.clipboard.writeText(text)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 4, padding: "4px 10px", fontSize: 10, color: "var(--muted)", fontFamily: "inherit", cursor: "pointer" }}>Copiar</button>
      </div>
      <div style={{ padding: 24, maxHeight: 480, overflowY: "auto" }}>
        <pre style={{ fontFamily: "inherit", fontSize: 12, color: "var(--body)", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{text}</pre>
      </div>
      <div style={{ padding: "12px 16px", background: "var(--warm)", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
        <button style={{ flex: 1, background: "var(--green)", color: "#fff", border: "none", borderRadius: 6, padding: 10, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer" }}>⬇ Descargar PDF</button>
        <button style={{ flex: 1, background: "none", color: "var(--body)", border: "1px solid var(--border)", borderRadius: 6, padding: 10, fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>Editar datos</button>
      </div>
    </div>
  );
}
