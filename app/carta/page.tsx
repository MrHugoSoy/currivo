"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Market = "mx" | "us" | "ca";

const MARKETS: { id: Market; flag: string; label: string; hint: string }[] = [
  { id: "mx", flag: "🇲🇽", label: "México",  hint: "Carta en español" },
  { id: "us", flag: "🇺🇸", label: "USA",     hint: "Cover letter in English" },
  { id: "ca", flag: "🇨🇦", label: "Canadá",  hint: "Cover letter in English" },
];
const TONES = ["Profesional", "Creativo", "Formal", "Moderno"];

interface ExperienciaEntry { puesto: string; empresa: string; periodo: string; descripcion: string; }
type CVRecord = {
  slug: string; nombre: string; puesto: string;
  form_data: Record<string, unknown> | null;
};

export default function CartaPage() {
  const router = useRouter();

  const [userId, setUserId]         = useState<string | undefined>();
  const [isPro, setIsPro]           = useState<boolean | null>(null);
  const [cvs, setCvs]               = useState<CVRecord[]>([]);
  const [selectedCV, setSelectedCV] = useState("");
  const [importedData, setImportedData] = useState<Record<string, unknown> | null>(null);

  const [mercado, setMercado] = useState<Market>("mx");
  const [nombre,  setNombre]  = useState("");
  const [puesto,  setPuesto]  = useState("");
  const [empresa, setEmpresa] = useState("");
  const [ciudad,  setCiudad]  = useState("");
  const [tono,    setTono]    = useState("Profesional");
  const [vacante, setVacante] = useState("");
  const [showVacante, setShowVacante] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<string | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (!user) { router.replace("/"); return; }
      setUserId(user.id);

      const [{ data: profile }, { data: cvsData }] = await Promise.all([
        supabase.from("profiles").select("is_pro").eq("user_id", user.id).single(),
        supabase.from("cvs")
          .select("slug, nombre, puesto, form_data")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      setIsPro(profile?.is_pro ?? false);
      if (cvsData) setCvs(cvsData as CVRecord[]);
    });
  }, [router]);

  function handleImportCV(slug: string) {
    setSelectedCV(slug);
    if (!slug) { setImportedData(null); return; }
    const cv = cvs.find(c => c.slug === slug);
    if (!cv) return;
    setNombre(cv.nombre || "");
    setPuesto(cv.puesto || "");
    const fd = cv.form_data;
    if (fd) {
      setCiudad((fd.ciudad as string) || "");
      setImportedData(fd);
    }
  }

  async function handleGenerate() {
    if (!nombre || !puesto) {
      setError(isMx ? "Completa tu nombre y el puesto." : "Fill in your name and target position.");
      return;
    }
    setError(null); setLoading(true); setResult(null);
    try {
      const habilidades: string[] = importedData && Array.isArray(importedData.habilidades)
        ? importedData.habilidades as string[]
        : [];
      const experiencias: ExperienciaEntry[] = importedData && Array.isArray(importedData.experiencias)
        ? importedData.experiencias as ExperienciaEntry[]
        : [];

      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, puesto, empresa, ciudad, mercado, tono, vacante, habilidades, experiencias, userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setResult(data.coverLetter);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally { setLoading(false); }
  }

  const isMx = mercado === "mx";

  const fieldBase: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,.05)",
    border: "1px solid rgba(255,255,255,.08)", borderRadius: 6,
    padding: "9px 12px", fontFamily: "inherit", fontSize: 12,
    color: "rgba(248,245,239,.9)", outline: "none",
  };

  // ── Loading state ──
  if (isPro === null) {
    return (
      <>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <Navbar />
        <div style={{ minHeight: "100vh", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid rgba(255,255,255,.1)", borderTopColor: "#7dd4a0", animation: "spin .65s linear infinite" }} />
        </div>
      </>
    );
  }

  // ── Pro gate ──
  if (!isPro) {
    return (
      <>
        <Navbar />
        <main style={{ paddingTop: 62 }}>
          <section style={{ background: "var(--ink)", minHeight: "calc(100vh - 62px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
            <div style={{ maxWidth: 480, textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 20 }}>✉️</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, color: "#f8f5ef", letterSpacing: "-1px", marginBottom: 12 }}>
                Carta de presentación
              </h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.45)", lineHeight: 1.7, marginBottom: 32 }}>
                La carta de presentación con IA es una función Pro.<br />
                Actualiza tu plan para generar cartas personalizadas para cada vacante.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <a href="/#precios" style={{ display: "inline-block", background: "var(--green)", color: "#fff", borderRadius: 8, padding: "12px 28px", fontSize: 13, fontWeight: 500, textDecoration: "none" }}>
                  Ver planes →
                </a>
                <a href="/crear" style={{ display: "inline-block", background: "none", color: "rgba(255,255,255,.4)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, padding: "12px 28px", fontSize: 13, textDecoration: "none" }}>
                  Generar CV gratis
                </a>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  // ── Main page ──
  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 960px) {
          .carta-grid { grid-template-columns: 1fr !important; }
          .carta-result { position: static !important; max-height: none !important; }
        }
        @media (max-width: 600px) {
          .carta-wrap  { padding: 0 16px !important; }
          .carta-sec   { padding: 48px 0 !important; }
          .carta-mkt   { grid-template-columns: 1fr !important; }
          .carta-fields { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <Navbar />
      <main style={{ paddingTop: 62 }}>
        <section className="carta-sec" style={{ background: "var(--ink)", padding: "88px 0", minHeight: "calc(100vh - 62px)" }}>
          <div className="carta-wrap" style={{ maxWidth: 1320, margin: "0 auto", padding: "0 40px" }}>

            {/* Label row */}
            <div style={{ fontSize: 10, letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(255,255,255,.2)", fontWeight: 500, marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
              ✉ Carta de presentación con IA
              <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,.07)", display: "block" }} />
            </div>

            <div className="carta-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>

              {/* ── LEFT — Form ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                {/* Market */}
                <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 10, padding: 20 }}>
                  <div style={{ fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,.28)", fontWeight: 500, marginBottom: 12 }}>Mercado</div>
                  <div className="carta-mkt" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                    {MARKETS.map(m => (
                      <button key={m.id} onClick={() => setMercado(m.id)}
                        style={{ border: `1px solid ${mercado === m.id ? "rgba(74,144,96,.55)" : "rgba(255,255,255,.08)"}`, borderRadius: 10, padding: "12px", background: mercado === m.id ? "rgba(42,82,54,.18)" : "rgba(255,255,255,.02)", cursor: "pointer", textAlign: "left", transition: "all .15s" }}>
                        <div style={{ fontSize: 20, marginBottom: 4 }}>{m.flag}</div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: mercado === m.id ? "#7dd4a0" : "rgba(255,255,255,.8)", fontFamily: "inherit" }}>{m.label}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", fontFamily: "inherit" }}>{m.hint}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Import from CV */}
                {cvs.length > 0 && (
                  <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 10, padding: 20 }}>
                    <div style={{ fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,.28)", fontWeight: 500, marginBottom: 10 }}>Importar desde CV existente</div>
                    <select value={selectedCV} onChange={e => handleImportCV(e.target.value)}
                      style={{ ...fieldBase, cursor: "pointer" }}>
                      <option value="">— Llenar manualmente —</option>
                      {cvs.map(cv => (
                        <option key={cv.slug} value={cv.slug}>{cv.nombre} · {cv.puesto}</option>
                      ))}
                    </select>
                    {selectedCV && (
                      <p style={{ fontSize: 10, color: "#7dd4a0", marginTop: 6 }}>✓ Datos importados — nombre, puesto, ciudad, experiencias y habilidades</p>
                    )}
                  </div>
                )}

                {/* Fields */}
                <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 10, padding: 20 }}>
                  <div style={{ fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,.28)", fontWeight: 500, marginBottom: 14 }}>Datos</div>
                  <div className="carta-fields" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div style={{ marginBottom: 2 }}>
                      <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,.38)", marginBottom: 5 }}>{isMx ? "Nombre completo" : "Full name"}</label>
                      <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder={isMx ? "Tu nombre" : "Your name"} style={fieldBase} />
                    </div>
                    <div style={{ marginBottom: 2 }}>
                      <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,.38)", marginBottom: 5 }}>{isMx ? "Puesto al que aplicas" : "Target position"}</label>
                      <input value={puesto} onChange={e => setPuesto(e.target.value)} placeholder={isMx ? "Ej. Diseñador UX" : "e.g. UX Designer"} style={fieldBase} />
                    </div>
                    <div style={{ marginBottom: 2 }}>
                      <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,.38)", marginBottom: 5 }}>{isMx ? "Empresa (opcional)" : "Company (optional)"}</label>
                      <input value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder={isMx ? "Nombre de la empresa" : "Company name"} style={fieldBase} />
                    </div>
                    <div style={{ marginBottom: 2 }}>
                      <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,.38)", marginBottom: 5 }}>{isMx ? "Ciudad" : "City"}</label>
                      <input value={ciudad} onChange={e => setCiudad(e.target.value)} placeholder={isMx ? "Tu ciudad" : "Your city"} style={fieldBase} />
                    </div>
                  </div>
                </div>

                {/* Tone */}
                <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 10, padding: 20 }}>
                  <div style={{ fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,.28)", fontWeight: 500, marginBottom: 12 }}>{isMx ? "Tono" : "Tone"}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {TONES.map(t => (
                      <button key={t} onClick={() => setTono(t)}
                        style={{ border: "1px solid", borderColor: tono === t ? "rgba(74,144,96,.5)" : "rgba(255,255,255,.08)", borderRadius: 100, padding: "4px 12px", fontSize: 10, fontFamily: "inherit", color: tono === t ? "#7dd4a0" : "rgba(255,255,255,.32)", background: tono === t ? "rgba(42,82,54,.15)" : "none", cursor: "pointer" }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vacante toggle */}
                <div>
                  <button onClick={() => setShowVacante(v => !v)}
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: showVacante ? "rgba(42,82,54,.15)" : "rgba(255,255,255,.02)", border: `1px solid ${showVacante ? "rgba(74,144,96,.35)" : "rgba(255,255,255,.07)"}`, borderRadius: 10, padding: "14px 18px", cursor: "pointer", transition: "all .15s" }}>
                    <span style={{ fontSize: 15 }}>🎯</span>
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: showVacante ? "#7dd4a0" : "rgba(255,255,255,.7)", fontFamily: "inherit" }}>
                        {isMx ? "Adaptar a vacante específica" : "Tailor for a specific job posting"}
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,.28)", fontFamily: "inherit" }}>
                        {isMx ? "Pega la descripción del puesto" : "Paste the job description"}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,.28)" }}>{showVacante ? "▲" : "▼"}</span>
                  </button>
                  {showVacante && (
                    <textarea value={vacante} onChange={e => setVacante(e.target.value)}
                      placeholder={isMx ? "Pega aquí la descripción completa de la vacante..." : "Paste the full job description here..."}
                      rows={5}
                      style={{ ...fieldBase, resize: "none", borderRadius: "0 0 10px 10px", borderTop: "none", marginTop: -1 }} />
                  )}
                </div>

                {error && <p style={{ fontSize: 12, color: "#f87171", margin: 0 }}>{error}</p>}

                <button onClick={handleGenerate} disabled={loading}
                  style={{ width: "100%", background: "var(--green-mid)", color: "#fff", border: "none", borderRadius: 8, padding: 14, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.7 : 1, transition: "background .2s" }}>
                  {loading ? (
                    <>
                      <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", animation: "spin .65s linear infinite", display: "inline-block" }} />
                      {isMx ? "Generando carta..." : "Generating letter..."}
                    </>
                  ) : (
                    <>{isMx ? "✦ Generar carta de presentación" : "✦ Generate cover letter"}</>
                  )}
                </button>
              </div>

              {/* ── RIGHT — Result ── */}
              <div className="carta-result" style={{ position: "sticky", top: 82, maxHeight: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
                {result ? (
                  <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(74,144,96,.25)", borderRadius: 10, padding: 28, flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                      <div style={{ fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,.28)", fontWeight: 500 }}>
                        {isMx ? "Carta generada" : "Generated cover letter"}
                      </div>
                      <button
                        onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2200); }}
                        style={{ fontSize: 11, color: copied ? "#7dd4a0" : "rgba(255,255,255,.45)", background: "none", border: "1px solid", borderColor: copied ? "rgba(74,144,96,.4)" : "rgba(255,255,255,.12)", borderRadius: 5, padding: "4px 12px", cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
                        {copied ? (isMx ? "✓ Copiado" : "✓ Copied") : (isMx ? "Copiar texto" : "Copy text")}
                      </button>
                    </div>
                    <pre style={{ fontFamily: "inherit", fontSize: 13, color: "rgba(248,245,239,.85)", lineHeight: 1.85, whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, flex: 1 }}>
                      {result}
                    </pre>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 14, display: "flex", gap: 10, flexShrink: 0 }}>
                      <button
                        onClick={() => { setResult(null); }}
                        style={{ fontSize: 11, color: "rgba(255,255,255,.3)", background: "none", border: "1px solid rgba(255,255,255,.08)", borderRadius: 5, padding: "5px 14px", cursor: "pointer", fontFamily: "inherit" }}>
                        {isMx ? "← Editar datos" : "← Edit data"}
                      </button>
                      <button
                        onClick={handleGenerate}
                        style={{ fontSize: 11, color: "rgba(255,255,255,.5)", background: "none", border: "1px solid rgba(255,255,255,.1)", borderRadius: 5, padding: "5px 14px", cursor: "pointer", fontFamily: "inherit" }}>
                        {isMx ? "↻ Regenerar" : "↻ Regenerate"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: "rgba(255,255,255,.02)", border: "1px dashed rgba(255,255,255,.08)", borderRadius: 10, minHeight: 360, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                    {loading ? (
                      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid rgba(255,255,255,.1)", borderTopColor: "#7dd4a0", animation: "spin .65s linear infinite" }} />
                    ) : (
                      <>
                        <span style={{ fontSize: 44, opacity: 0.15 }}>✉️</span>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,.18)", textAlign: "center", margin: 0 }}>
                          {isMx ? "Tu carta aparecerá aquí" : "Your cover letter will appear here"}
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
