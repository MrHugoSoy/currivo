import type { GuiaFrontmatter } from "@/lib/guias";
import { CATEGORIES, COUNTRY_FLAGS, COUNTRY_LABELS, formatDate } from "@/lib/guias";

export function ArticleCard({ guia }: { guia: GuiaFrontmatter }) {
  return (
    <a
      href={`/guias/${guia.slug}`}
      className="article-card"
      style={{ display: "block", background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 10, padding: "22px 24px", textDecoration: "none", transition: "border-color .15s, box-shadow .15s" }}
    >
      {/* Badges */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: "var(--green-bg)", color: "var(--green)", border: "1px solid rgba(45,90,61,.18)" }}>
          {CATEGORIES[guia.category] ?? guia.category}
        </span>
        <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 100, background: "var(--warm)", color: "var(--muted)", border: "1px solid var(--border)" }}>
          {COUNTRY_FLAGS[guia.country]} {COUNTRY_LABELS[guia.country]}
        </span>
        {guia.featured && (
          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 100, background: "var(--warm)", color: "var(--muted)", border: "1px solid var(--border)" }}>
            ✦ Destacada
          </span>
        )}
      </div>

      {/* Title */}
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.3px", lineHeight: 1.2, marginBottom: 8 }}>
        {guia.title}
      </h3>

      {/* Description */}
      <p style={{ fontSize: 13, color: "var(--body)", lineHeight: 1.65, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {guia.description}
      </p>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 11, color: "var(--hint)" }}>{formatDate(guia.publishedAt)}</span>
        <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 500 }}>Leer guía →</span>
      </div>
    </a>
  );
}
