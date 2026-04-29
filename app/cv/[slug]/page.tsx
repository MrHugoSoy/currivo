import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { CVPageActions } from "./CVPageActions";

type PageProps = { params: Promise<{ slug: string }> };

const FLAG: Record<string, string> = { mx: "🇲🇽", us: "🇺🇸", ca: "🇨🇦" };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await supabase
    .from("cvs")
    .select("nombre, puesto, ciudad")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "CV no encontrado · currivo.mx" };

  const title = `${data.nombre} — ${data.puesto} · currivo.mx`;
  const description = `CV profesional de ${data.nombre}${data.ciudad ? `, ${data.ciudad}` : ""}. Puesto: ${data.puesto}. Creado con currivo.mx.`;

  return {
    title,
    description,
    openGraph: { title, description, siteName: "currivo.mx" },
  };
}

export default async function CVPage({ params }: PageProps) {
  const { slug } = await params;
  const { data, error } = await supabase
    .from("cvs")
    .select("nombre, puesto, ciudad, mercado, cv_text, created_at")
    .eq("slug", slug)
    .single();

  if (!data || error) notFound();

  const flag = FLAG[data.mercado] ?? "";
  const date = new Date(data.created_at).toLocaleDateString("es-MX", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          .cv-topbar, .cv-hero-actions, .cv-footer, nav, button, header { display: none !important; }
          .cv-hero { background: #fff !important; color: #1c1a16 !important; padding: 16px 0 !important; }
          .cv-hero h1 { color: #1c1a16 !important; }
          .cv-hero-sub { color: #4a453e !important; }
          .cv-card { box-shadow: none !important; border: none !important; }
          .cv-content { padding: 40px; }
          body { background: white !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ minHeight: "100vh", background: "var(--cream)" }}>

        {/* Top bar */}
        <header className="cv-topbar" style={{ background: "var(--paper)", borderBottom: "1px solid var(--border)", padding: "0 32px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.5px", textDecoration: "none" }}>
            currivo
          </a>
          <a href="/" style={{ fontSize: 12, color: "var(--green)", fontWeight: 500, textDecoration: "none", border: "1px solid rgba(45,90,61,.25)", borderRadius: 5, padding: "6px 14px", background: "var(--green-bg)" }}>
            ✦ Crear mi CV
          </a>
        </header>

        {/* Hero */}
        <div className="cv-hero" style={{ background: "var(--ink)", padding: "44px 32px 36px", textAlign: "center" }}>
          <div style={{ fontSize: 9, letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(255,255,255,.25)", marginBottom: 18 }}>
            Currículum Vitae
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 600, color: "#f8f5ef", letterSpacing: "-1px", marginBottom: 8, lineHeight: 1.1 }}>
            {data.nombre}
          </h1>
          <div className="cv-hero-sub" style={{ fontSize: 14, color: "rgba(248,245,239,.45)", marginBottom: 16 }}>
            {data.puesto}
          </div>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            {data.ciudad && (
              <span style={{ fontSize: 11, background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.55)", borderRadius: 4, padding: "3px 10px", border: "1px solid rgba(255,255,255,.09)" }}>
                📍 {data.ciudad}
              </span>
            )}
            <span style={{ fontSize: 11, background: "rgba(74,148,98,.12)", color: "#7dd4a0", borderRadius: 4, padding: "3px 10px", border: "1px solid rgba(74,148,98,.22)" }}>
              {flag} {data.mercado.toUpperCase()}
            </span>
          </div>

          <div className="cv-hero-actions">
            <CVPageActions slug={slug} mercado={data.mercado} />
          </div>
        </div>

        {/* CV card */}
        <div className="cv-content" style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 72px" }}>
          <div className="cv-card" style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 8, padding: "48px 52px", boxShadow: "0 4px 24px rgba(0,0,0,.06)" }}>
            <pre style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 13, color: "var(--body)", lineHeight: 1.85, whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
              {data.cv_text}
            </pre>
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: "var(--hint)", marginTop: 20 }}>
            Generado el {date}
          </p>
        </div>

        {/* Footer badge */}
        <div className="cv-footer" style={{ textAlign: "center", padding: "0 0 36px", fontSize: 11, color: "var(--hint)" }}>
          Creado con{" "}
          <a href="/" style={{ color: "var(--green2)", textDecoration: "none", fontWeight: 500 }}>
            currivo.mx
          </a>
        </div>
      </div>
    </>
  );
}
