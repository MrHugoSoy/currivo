import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getGuiasByCategory, getAllCategoryValues, CATEGORIES } from "@/lib/guias";
import { ArticleCard } from "@/components/guias/ArticleCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Props = { params: Promise<{ categoria: string }> };

export async function generateStaticParams() {
  return getAllCategoryValues().map((categoria) => ({ categoria }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const label = CATEGORIES[categoria];
  if (!label) return {};
  return {
    title: `${label} — Guías de CV | resumika`,
    description: `Guías prácticas sobre ${label.toLowerCase()} para crear tu CV profesional y conseguir trabajo.`,
    alternates: { canonical: `https://resumika.com/guias/categoria/${categoria}` },
  };
}

export default async function CategoriaPage({ params }: Props) {
  const { categoria } = await params;
  const label = CATEGORIES[categoria];
  if (!label) notFound();

  const guias = getGuiasByCategory(categoria);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--cream)", paddingTop: 62 }}>
        <style>{`
          .cat-inner { max-width: 1320px; margin: 0 auto; padding: 0 64px; }
          .cat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
          @media (max-width: 960px) { .cat-grid { grid-template-columns: repeat(2, 1fr); } }
          @media (max-width: 640px) {
            .cat-inner { padding: 0 20px; }
            .cat-grid { grid-template-columns: 1fr; }
          }
        `}</style>

        {/* Breadcrumbs */}
        <div style={{ background: "var(--paper)", borderBottom: "1px solid var(--border)" }}>
          <div style={{ maxWidth: 1320, margin: "0 auto", padding: "12px 64px", display: "flex", gap: 6, alignItems: "center" }}>
            <a href="/" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>Inicio</a>
            <span style={{ fontSize: 10, color: "var(--hint)" }}>›</span>
            <a href="/guias" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>Guías</a>
            <span style={{ fontSize: 10, color: "var(--hint)" }}>›</span>
            <span style={{ fontSize: 12, color: "var(--hint)" }}>{label}</span>
          </div>
        </div>

        {/* Hero */}
        <div style={{ background: "var(--surface-dark)", padding: "52px 0 44px" }}>
          <div className="cat-inner">
            <p style={{ fontSize: 10, letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(255,255,255,.35)", marginBottom: 12 }}>
              Categoría
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 600, color: "#f2ede5", letterSpacing: "-0.8px", lineHeight: 1.1 }}>
              {label}
            </h1>
          </div>
        </div>

        {/* Grid */}
        <div className="cat-inner" style={{ padding: "40px 64px 80px" }}>
          {guias.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--muted)", textAlign: "center", padding: "60px 0" }}>
              No hay guías en esta categoría todavía.
            </p>
          ) : (
            <div className="cat-grid">
              {guias.map((guia) => (
                <ArticleCard key={guia.slug} guia={guia} />
              ))}
            </div>
          )}

          <div style={{ marginTop: 40, textAlign: "center" }}>
            <a href="/guias" style={{ fontSize: 13, color: "var(--green)", textDecoration: "none", fontWeight: 500 }}>
              ← Ver todas las guías
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
