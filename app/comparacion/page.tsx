import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "resumika vs. Canva, Kickresume, Zety, Resume.io y Teal | resumika",
  description: "Comparación de precios y funciones entre resumika y otros generadores de CV populares: Canva, Kickresume, Zety, Resume.io y Teal.",
  alternates: { canonical: "https://resumika.com/comparacion" },
};

type Check = true | false | "partial";

const COMPETITORS = ["resumika", "Canva", "Kickresume", "Zety", "Resume.io", "Teal"] as const;

const PRICE_ROW: Record<(typeof COMPETITORS)[number], string> = {
  resumika: "$49 MXN/mes (~$2.99 USD)",
  Canva: "desde $18 USD/mes (~$12 anual)",
  Kickresume: "desde $8 USD/mes (anual)",
  Zety: "desde $5.95 USD/mes (anual)",
  "Resume.io": "desde $6.25 USD/mes (trimestral)",
  Teal: "desde $29 USD/mes (sin plan anual)",
};

const ROWS: { label: string; values: Record<(typeof COMPETITORS)[number], Check> }[] = [
  {
    label: "Plan gratis disponible",
    values: { resumika: true, Canva: true, Kickresume: true, Zety: "partial", "Resume.io": "partial", Teal: true },
  },
  {
    label: "Formato específico por país (México, USA, Canadá)",
    values: { resumika: true, Canva: false, Kickresume: false, Zety: false, "Resume.io": false, Teal: false },
  },
  {
    label: "Adapta el CV a una vacante específica con IA",
    values: { resumika: true, Canva: false, Kickresume: false, Zety: false, "Resume.io": false, Teal: "partial" },
  },
  {
    label: "Genera carta de presentación",
    values: { resumika: true, Canva: false, Kickresume: true, Zety: true, "Resume.io": true, Teal: true },
  },
  {
    label: "Precios en pesos mexicanos",
    values: { resumika: true, Canva: false, Kickresume: false, Zety: false, "Resume.io": false, Teal: false },
  },
];

function CheckCell({ value }: { value: Check }) {
  if (value === true) return <span style={{ color: "var(--green-mid)", fontSize: 15 }}>✓</span>;
  if (value === "partial") return <span style={{ color: "var(--hint)", fontSize: 11 }}>parcial</span>;
  return <span style={{ color: "var(--border2)", fontSize: 13 }}>—</span>;
}

export default function ComparacionPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--cream)", paddingTop: 68 }}>
        <style>{`
          .cmp-inner { max-width: 1000px; margin: 0 auto; padding: 64px 24px 96px; }
          .cmp-table-wrap { overflow-x: auto; }
          .cmp-table { width: 100%; border-collapse: collapse; min-width: 760px; }
          .cmp-table th, .cmp-table td { padding: 12px 14px; text-align: center; border-bottom: 1px solid var(--border); font-size: 12.5px; }
          .cmp-table th:first-child, .cmp-table td:first-child { text-align: left; }
          @media (max-width: 640px) { .cmp-inner { padding: 48px 16px 72px; } }
        `}</style>
        <div className="cmp-inner">
          <p style={{ fontSize: 10, letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--hint)", marginBottom: 16 }}>
            Comparación
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 600, color: "var(--ink)", letterSpacing: "-1px", lineHeight: 1.12, marginBottom: 20, maxWidth: 720 }}>
            resumika frente a otros generadores de CV
          </h1>
          <p style={{ fontSize: 15, color: "var(--body)", lineHeight: 1.8, marginBottom: 12, maxWidth: 680 }}>
            No pretendemos ser la mejor opción para todo el mundo. Canva, Kickresume, Zety, Resume.io y Teal son productos sólidos, cada uno con su propia fortaleza. Esta comparación se enfoca en lo que realmente nos diferencia: el formato específico por país y la adaptación de tu CV a una vacante concreta.
          </p>

          <div className="cmp-table-wrap" style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 10, marginTop: 32 }}>
            <table className="cmp-table">
              <thead>
                <tr>
                  <th style={{ color: "var(--hint)", fontSize: 10, letterSpacing: "0.5px", textTransform: "uppercase" }}>&nbsp;</th>
                  {COMPETITORS.map(c => (
                    <th key={c} style={{ color: c === "resumika" ? "var(--green)" : "var(--ink)", fontWeight: 600, fontSize: 13 }}>{c}</th>
                  ))}
                </tr>
                <tr>
                  <td style={{ fontWeight: 500, color: "var(--ink)" }}>Precio desde</td>
                  {COMPETITORS.map(c => (
                    <td key={c} style={{ color: c === "resumika" ? "var(--green)" : "var(--body)", fontWeight: c === "resumika" ? 600 : 400 }}>{PRICE_ROW[c]}</td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map(row => (
                  <tr key={row.label}>
                    <td style={{ color: "var(--body)" }}>{row.label}</td>
                    {COMPETITORS.map(c => (
                      <td key={c}><CheckCell value={row.values[c]} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: 11, color: "var(--hint)", lineHeight: 1.7, marginTop: 14 }}>
            "Parcial" en plan gratis: el plan gratuito de Zety y Resume.io solo permite descargar en formato TXT (sin diseño); el PDF requiere plan pago. "Parcial" en adaptación por vacante: Teal ofrece un comparador de coincidencia con la vacante, distinto a que la IA reescriba el CV para esa vacante específica.
          </p>

          <div style={{ marginTop: 40, padding: "22px 24px", background: "var(--warm)", border: "1px solid var(--border)", borderRadius: 10 }}>
            <p style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.75, marginBottom: 0 }}>
              Precios de referencia en USD, verificados en agosto de 2026 a partir de las páginas de precios públicas de cada proveedor. Los precios y características cambian con frecuencia — confírmalos directamente en el sitio de cada uno antes de decidir: <a href="https://www.canva.com/resumes/" target="_blank" rel="noreferrer" style={{ color: "var(--green)" }}>Canva</a>, <a href="https://www.kickresume.com/en/pricing/" target="_blank" rel="noreferrer" style={{ color: "var(--green)" }}>Kickresume</a>, <a href="https://zety.com/pricing" target="_blank" rel="noreferrer" style={{ color: "var(--green)" }}>Zety</a>, <a href="https://resume.io/pricing" target="_blank" rel="noreferrer" style={{ color: "var(--green)" }}>Resume.io</a>, <a href="https://www.tealhq.com/pricing" target="_blank" rel="noreferrer" style={{ color: "var(--green)" }}>Teal</a>.
            </p>
          </div>

          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, color: "var(--ink)", marginTop: 48, marginBottom: 14 }}>
            ¿Cuándo tiene más sentido otra herramienta?
          </h2>
          <p style={{ fontSize: 14.5, color: "var(--body)", lineHeight: 1.8, marginBottom: 12 }}>
            Si buscas plantillas muy visuales para un portafolio creativo, Canva tiene más variedad de diseño. Si ya tienes un proceso de búsqueda de empleo activo en varios países y quieres un rastreador de vacantes integrado, Teal cubre ese caso. resumika está pensado específicamente para quien necesita un CV que respete las prácticas de México, Estados Unidos o Canadá, y que se ajuste con IA a cada vacante a la que aplica.
          </p>

          <div style={{ marginTop: 40, textAlign: "center" }}>
            <a href="/crear" style={{ display: "inline-block", background: "var(--green)", color: "#fff", textDecoration: "none", borderRadius: 7, padding: "13px 26px", fontSize: 14, fontWeight: 500 }}>
              ✦ Crear mi CV con IA →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
