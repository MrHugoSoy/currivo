import type { Metadata } from "next";
import { getAllGuias, CATEGORIES } from "@/lib/guias";
import { ArticleCard } from "@/components/guias/ArticleCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Guías de CV | resumika",
  description: "Guías prácticas para crear tu CV para México, Canadá y EE.UU. Aprende el formato correcto, qué incluir y cómo pasar los filtros ATS.",
  alternates: { canonical: "https://resumika.com/guias" },
};

type Props = { searchParams: Promise<{ categoria?: string }> };

export default async function GuiasPage({ searchParams }: Props) {
  const { categoria } = await searchParams;
  const all = getAllGuias();
  const guias = categoria ? all.filter((g) => g.category === categoria) : all;
  const totalCategories = [...new Set(all.map((g) => g.category))];

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--cream)", paddingTop: 62 }}>
        <style>{`
          .guias-inner { max-width: 1320px; margin: 0 auto; padding: 0 64px; }
          .guias-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
          @media (max-width: 960px) { .guias-grid { grid-template-columns: repeat(2, 1fr); } }
          @media (max-width: 640px) {
            .guias-inner { padding: 0 20px; }
            .guias-grid { grid-template-columns: 1fr; }
          }
        `}</style>

        {/* Hero */}
        <div style={{ background: "var(--surface-dark)", padding: "64px 0 56px" }}>
          <div className="guias-inner">
            <p style={{ fontSize: 10, letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(255,255,255,.35)", marginBottom: 14 }}>
              Recursos gratuitos
            </p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(34px, 4vw, 52px)", fontWeight: 600, color: "#f2ede5", letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 16 }}>
              Guías para crear tu CV
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,.55)", lineHeight: 1.7, maxWidth: 540 }}>
              Todo lo que necesitas saber para presentarte correctamente en el mercado laboral de México, Canadá y EE.UU.
            </p>
          </div>
        </div>

        <div className="guias-inner" style={{ padding: "40px 64px 80px" }}>

          {/* Category filters */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
            <a
              href="/guias"
              style={{ fontSize: 12, fontWeight: !categoria ? 600 : 400, padding: "6px 14px", borderRadius: 100, textDecoration: "none", background: !categoria ? "var(--green)" : "var(--paper)", color: !categoria ? "#fff" : "var(--body)", border: `1px solid ${!categoria ? "var(--green)" : "var(--border)"}`, transition: "all .15s" }}
            >
              Todas ({all.length})
            </a>
            {totalCategories.map((cat) => {
              const count = all.filter((g) => g.category === cat).length;
              const active = categoria === cat;
              return (
                <a
                  key={cat}
                  href={`/guias?categoria=${cat}`}
                  style={{ fontSize: 12, fontWeight: active ? 600 : 400, padding: "6px 14px", borderRadius: 100, textDecoration: "none", background: active ? "var(--green)" : "var(--paper)", color: active ? "#fff" : "var(--body)", border: `1px solid ${active ? "var(--green)" : "var(--border)"}`, transition: "all .15s" }}
                >
                  {CATEGORIES[cat] ?? cat} ({count})
                </a>
              );
            })}
          </div>

          {/* Grid */}
          {guias.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--muted)", textAlign: "center", padding: "60px 0" }}>
              No hay guías en esta categoría todavía.
            </p>
          ) : (
            <div className="guias-grid">
              {guias.map((guia) => (
                <ArticleCard key={guia.slug} guia={guia} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
