"use client";
import { useState } from "react";
import CVPreview from "./CVPreview";

const TONES = ["Profesional", "Creativo", "Formal", "Moderno"];
const INDUSTRIES = ["Diseño", "Tecnología", "Marketing", "Educación", "Salud", "Finanzas"];

const MARKETS = [
  {
    id: "mx",
    flag: "🇲🇽",
    label: "México",
    hint: "Con foto, datos personales, objetivo",
  },
  {
    id: "us",
    flag: "🇺🇸",
    label: "USA",
    hint: "Resume 1 pág, logros con números, ATS",
  },
  {
    id: "ca",
    flag: "🇨🇦",
    label: "Canadá",
    hint: "2 págs, voluntariado, soft skills",
  },
];

export interface FormData {
  nombre: string;
  puesto: string;
  ciudad: string;
  email: string;
  ultimoPuesto: string;
  empresa: string;
  descripcion: string;
  tono: string;
  industria: string;
  mercado: string;
}

export default function Generator() {
  const [form, setForm] = useState<FormData>({
    nombre: "", puesto: "", ciudad: "", email: "",
    ultimoPuesto: "", empresa: "", descripcion: "",
    tono: "Profesional", industria: "Diseño", mercado: "mx",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const selectedMarket = MARKETS.find(m => m.id === form.mercado)!;

  return (
    <section id="generador" style={{ background: "var(--ink)", padding: "88px 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px" }}>

        {/* Section label */}
        <div style={{ fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", fontWeight: 500, marginBottom: 48, display: "flex", alignItems: "center", gap: 12 }}>
          Generador
          <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)", display: "block" }} />
        </div>

        {/* MARKET SELECTOR */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 14 }}>
            ¿Para qué mercado es tu CV?
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {MARKETS.map(m => (
              <button
                key={m.id}
                onClick={() => setForm(f => ({ ...f, mercado: m.id }))}
                style={{
                  border: `1px solid ${form.mercado === m.id ? "rgba(74,148,98,0.6)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 8,
                  padding: "14px 16px",
                  background: form.mercado === m.id ? "rgba(45,90,61,0.2)" : "rgba(255,255,255,0.03)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all .15s",
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>{m.flag}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: form.mercado === m.id ? "#7dd4a0" : "rgba(255,255,255,0.7)", fontFamily: "inherit", marginBottom: 3 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "inherit", lineHeight: 1.4 }}>
                  {m.hint}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>

          {/* FORM */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FormBlock title="Datos personales">
              <FieldRow>
                <Field label="Nombre completo" placeholder="María García López" value={form.nombre} onChange={set("nombre")} />
                <Field label={form.mercado === "mx" ? "Puesto deseado" : "Job Title"} placeholder={form.mercado === "mx" ? "Diseñadora Gráfica" : "Graphic Designer"} value={form.puesto} onChange={set("puesto")} />
              </FieldRow>
              <FieldRow>
                <Field label="Ciudad" placeholder={form.mercado === "mx" ? "León, Gto." : form.mercado === "us" ? "Austin, TX" : "Toronto, ON"} value={form.ciudad} onChange={set("ciudad")} />
                <Field label="Email" placeholder="maria@correo.com" value={form.email} onChange={set("email")} />
              </FieldRow>

              {/* Campos extra para México */}
              {form.mercado === "mx" && (
                <FieldRow>
                  <Field label="Edad (opcional)" placeholder="28 años" value={(form as any).edad ?? ""} onChange={e => setForm(f => ({ ...f, edad: e.target.value }))} />
                  <Field label="Estado civil (opcional)" placeholder="Soltero/a" value={(form as any).estadoCivil ?? ""} onChange={e => setForm(f => ({ ...f, estadoCivil: e.target.value }))} />
                </FieldRow>
              )}
            </FormBlock>

            <FormBlock title="Experiencia">
              <FieldRow>
                <Field label="Último puesto" placeholder={form.mercado === "mx" ? "Diseñadora Junior" : "Junior Designer"} value={form.ultimoPuesto} onChange={set("ultimoPuesto")} />
                <Field label="Empresa" placeholder="Agencia Creativa" value={form.empresa} onChange={set("empresa")} />
              </FieldRow>
              <Field
                label={form.mercado === "us" ? "Describe your achievements (with numbers if possible)" : "¿Qué hacías? Describe brevemente"}
                placeholder={
                  form.mercado === "mx"
                    ? "Ej. Diseñé identidades de marca, materiales para redes sociales..."
                    : form.mercado === "us"
                    ? "e.g. Led rebranding for 5 clients, increased engagement by 35%..."
                    : "Ej. Diseñé materiales para clientes, lideré equipo de 3 personas..."
                }
                value={form.descripcion}
                onChange={set("descripcion")}
                textarea
              />

              {/* Voluntariado para Canadá */}
              {form.mercado === "ca" && (
                <Field
                  label="Voluntariado (importante en Canadá)"
                  placeholder="Ej. Voluntario en banco de alimentos, diseñé materiales para ONG..."
                  value={(form as any).voluntariado ?? ""}
                  onChange={e => setForm(f => ({ ...f, voluntariado: e.target.value }))}
                  textarea
                />
              )}
            </FormBlock>

            <FormBlock title="Preferencias de IA">
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", display: "block", marginBottom: 8 }}>Tono</label>
                <PillGroup options={TONES} selected={form.tono} onSelect={v => setForm(f => ({ ...f, tono: v }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", display: "block", marginBottom: 8 }}>Industria</label>
                <PillGroup options={INDUSTRIES} selected={form.industria} onSelect={v => setForm(f => ({ ...f, industria: v }))} />
              </div>

              {error && <p style={{ fontSize: 12, color: "#f87171", marginTop: 12 }}>{error}</p>}

              <button
                onClick={handleGenerate}
                disabled={loading}
                style={{ width: "100%", marginTop: 18, background: loading ? "var(--green2)" : "var(--green-mid)", color: "#fff", border: "none", borderRadius: 6, padding: 14, fontSize: 14, fontWeight: 500, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background .2s" }}
              >
                {loading
                  ? <><Spinner /> Generando tu CV...</>
                  : <>✦ Generar CV para {selectedMarket.flag} {selectedMarket.label}</>}
              </button>
              <p style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 10, letterSpacing: "0.5px" }}>
                El primero es gratis · Sin tarjeta · Sin registro
              </p>
            </FormBlock>
          </div>

          {/* PREVIEW */}
          <div style={{ position: "relative" }}>
            {result ? (
              <GeneratedResult text={result} mercado={form.mercado} />
            ) : (
              <>
                <CVPreview />
                {loading && (
                  <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: "rgba(28,26,22,0.88)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
                    <Spinner large />
                    <p style={{ fontSize: 13, color: "rgba(248,245,239,0.4)" }}>
                      Generando CV para {selectedMarket.flag} {selectedMarket.label}...
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Sub-components ──

function FormBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 24 }}>
      <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 20, fontWeight: 500 }}>{title}</div>
      {children}
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{children}</div>;
}

function Field({ label, placeholder, value, onChange, textarea }: {
  label: string; placeholder: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  textarea?: boolean;
}) {
  const base: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6, padding: "9px 13px", fontFamily: "inherit", fontSize: 13,
    color: "rgba(248,245,239,0.9)", outline: "none",
  };
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>{label}</label>
      {textarea
        ? <textarea placeholder={placeholder} value={value} onChange={onChange} rows={3} style={{ ...base, resize: "none" }} />
        : <input type="text" placeholder={placeholder} value={value} onChange={onChange} style={base} />}
    </div>
  );
}

function PillGroup({ options, selected, onSelect }: { options: string[]; selected: string; onSelect: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map(o => (
        <button key={o} onClick={() => onSelect(o)}
          style={{ border: "1px solid", borderColor: selected === o ? "rgba(74,148,98,0.5)" : "rgba(255,255,255,0.08)", borderRadius: 100, padding: "5px 14px", fontSize: 11, fontFamily: "inherit", color: selected === o ? "#7dd4a0" : "rgba(255,255,255,0.35)", background: selected === o ? "rgba(45,90,61,0.15)" : "none", cursor: "pointer", transition: "all .15s" }}>
          {o}
        </button>
      ))}
    </div>
  );
}

function Spinner({ large }: { large?: boolean }) {
  const size = large ? 28 : 14;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", borderTopColor: "var(--green-mid)", animation: "spin .65s linear infinite", flexShrink: 0 }} />
  );
}

function GeneratedResult({ text, mercado }: { text: string; mercado: string }) {
  const market = MARKETS.find(m => m.id === mercado)!;
  return (
    <div style={{ background: "var(--paper)", borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "0 20px 56px rgba(0,0,0,0.5)" }}>
      <div style={{ background: "var(--warm)", padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 500 }}>
          ✦ CV listo para {market.flag} {market.label}
        </span>
        <button
          onClick={() => navigator.clipboard.writeText(text)}
          style={{ background: "none", border: "1px solid var(--border)", borderRadius: 4, padding: "4px 10px", fontSize: 10, color: "var(--muted)", fontFamily: "inherit", cursor: "pointer" }}
        >
          Copiar texto
        </button>
      </div>
      <div style={{ padding: "24px", maxHeight: 520, overflowY: "auto" }}>
        <pre style={{ fontFamily: "inherit", fontSize: 12, color: "var(--body)", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{text}</pre>
      </div>
      <div style={{ padding: "12px 16px", background: "var(--warm)", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
        <button style={{ flex: 1, background: "var(--green)", color: "#fff", border: "none", borderRadius: 6, padding: "10px", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer" }}>
          ⬇ Descargar PDF
        </button>
        <button style={{ flex: 1, background: "none", color: "var(--body)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px", fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>
          Editar datos
        </button>
      </div>
    </div>
  );
}
