import { getFeaturedGuias } from "@/lib/guias";
import { ArticleCard } from "./ArticleCard";

export async function FeaturedGuias() {
  const guias = getFeaturedGuias(6);
  if (guias.length === 0) return null;

  return (
    <section style={{ background: "var(--cream)", padding: "80px 0" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 64px" }}>
        <style>{`
          @media (max-width: 640px) {
            .featured-guias-inner { padding: 0 20px !important; }
            .featured-guias-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--hint)", marginBottom: 8 }}>
              Recursos
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.8px", lineHeight: 1.1 }}>
              Guías para conseguir<br />
              <em style={{ fontStyle: "italic", color: "var(--green-mid)" }}>el trabajo que buscas</em>
            </h2>
          </div>
          <a href="/guias" style={{ fontSize: 13, color: "var(--green)", textDecoration: "none", fontWeight: 500, border: "1px solid rgba(45,90,61,.25)", borderRadius: 6, padding: "8px 16px", flexShrink: 0 }}>
            Ver todas las guías →
          </a>
        </div>

        <div className="featured-guias-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {guias.map((guia) => (
            <ArticleCard key={guia.slug} guia={guia} />
          ))}
        </div>
      </div>
    </section>
  );
}
