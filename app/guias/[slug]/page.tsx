import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import {
  getGuia, getAllSlugs, getRelatedGuias, extractTOC, slugifyHeading,
  CATEGORIES, COUNTRY_FLAGS, COUNTRY_LABELS, formatDate,
} from "@/lib/guias";
import { ArticleCard } from "@/components/guias/ArticleCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guia = getGuia(slug);
  if (!guia) return {};
  const title = `${guia.title} | resumika`;
  return {
    title,
    description: guia.description,
    keywords: guia.keywords,
    alternates: { canonical: `https://resumika.com/guias/${slug}` },
    openGraph: {
      title,
      description: guia.description,
      url: `https://resumika.com/guias/${slug}`,
      siteName: "resumika",
      locale: guia.country === "mexico" ? "es_MX" : "es_MX",
      type: "article",
      publishedTime: guia.publishedAt,
      modifiedTime: guia.updatedAt ?? guia.publishedAt,
    },
  };
}

// Custom MDX components — keep Resumika's visual style
const mdxComponents = {
  h2: ({ children }: { children?: React.ReactNode }) => {
    const text = String(children ?? "");
    const id = slugifyHeading(text);
    return (
      <h2 id={id} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(22px, 2.5vw, 28px)", fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.4px", lineHeight: 1.2, margin: "40px 0 14px", scrollMarginTop: 80 }}>
        {children}
      </h2>
    );
  },
  h3: ({ children }: { children?: React.ReactNode }) => {
    const text = String(children ?? "");
    const id = slugifyHeading(text);
    return (
      <h3 id={id} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(18px, 2vw, 22px)", fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.2px", margin: "28px 0 10px", scrollMarginTop: 80 }}>
        {children}
      </h3>
    );
  },
  p: ({ children }: { children?: React.ReactNode }) => (
    <p style={{ fontSize: 15.5, color: "var(--body)", lineHeight: 1.85, margin: "0 0 16px" }}>{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul style={{ paddingLeft: 22, margin: "0 0 16px", color: "var(--body)" }}>{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol style={{ paddingLeft: 22, margin: "0 0 16px", color: "var(--body)" }}>{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li style={{ fontSize: 15.5, lineHeight: 1.8, marginBottom: 6 }}>{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong style={{ color: "var(--ink)", fontWeight: 600 }}>{children}</strong>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a href={href} style={{ color: "var(--green)", textDecoration: "underline", textDecorationColor: "rgba(45,90,61,.3)" }}>{children}</a>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote style={{ borderLeft: "3px solid var(--green-mid)", paddingLeft: 18, margin: "20px 0", color: "var(--muted)", fontStyle: "italic" }}>{children}</blockquote>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code style={{ background: "var(--warm)", border: "1px solid var(--border)", borderRadius: 4, padding: "1px 6px", fontSize: 13.5, fontFamily: "monospace", color: "var(--ink)" }}>{children}</code>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre style={{ background: "var(--surface-dark)", borderRadius: 8, padding: "16px 20px", overflowX: "auto", margin: "20px 0" }}>{children}</pre>
  ),
  hr: () => <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "32px 0" }} />,
};

const COUNTRY_CTA: Record<string, string> = {
  mexico: "México",
  canada: "Canadá",
  usa:    "EE.UU.",
};

export default async function GuiaPage({ params }: Props) {
  const { slug } = await params;
  const guia = getGuia(slug);
  if (!guia) notFound();

  const toc = extractTOC(guia.content);
  const related = getRelatedGuias(slug, guia.category, guia.country);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `https://resumika.com/guias/${slug}#article`,
        headline: guia.title,
        description: guia.description,
        datePublished: guia.publishedAt,
        dateModified: guia.updatedAt ?? guia.publishedAt,
        author: { "@type": "Organization", name: "resumika", url: "https://resumika.com" },
        publisher: { "@type": "Organization", name: "resumika", url: "https://resumika.com" },
        url: `https://resumika.com/guias/${slug}`,
        inLanguage: "es-MX",
        keywords: guia.keywords.join(", "),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: "https://resumika.com" },
          { "@type": "ListItem", position: 2, name: "Guías", item: "https://resumika.com/guias" },
          { "@type": "ListItem", position: 3, name: CATEGORIES[guia.category] ?? guia.category, item: `https://resumika.com/guias/categoria/${guia.category}` },
          { "@type": "ListItem", position: 4, name: guia.title, item: `https://resumika.com/guias/${slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--cream)", paddingTop: 62 }}>
        <style>{`
          .guia-layout { max-width: 1100px; margin: 0 auto; padding: 0 64px; display: grid; grid-template-columns: 1fr 260px; gap: 48px; align-items: start; }
          .guia-sidebar { position: sticky; top: 86px; }
          @media (max-width: 900px) {
            .guia-layout { grid-template-columns: 1fr; gap: 0; }
            .guia-sidebar { position: static; margin-top: 40px; }
          }
          @media (max-width: 640px) {
            .guia-layout { padding: 0 20px; }
          }
        `}</style>

        {/* Breadcrumbs */}
        <div style={{ background: "var(--paper)", borderBottom: "1px solid var(--border)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 64px", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {[
              { label: "Inicio", href: "/" },
              { label: "Guías", href: "/guias" },
              { label: CATEGORIES[guia.category] ?? guia.category, href: `/guias/categoria/${guia.category}` },
            ].map((crumb, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <a href={crumb.href} style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>{crumb.label}</a>
                <span style={{ fontSize: 10, color: "var(--hint)" }}>›</span>
              </span>
            ))}
            <span style={{ fontSize: 12, color: "var(--hint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 300 }}>{guia.title}</span>
          </div>
        </div>

        {/* Article header */}
        <div style={{ background: "var(--paper)", borderBottom: "1px solid var(--border)", padding: "40px 0 36px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 64px" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              <a href={`/guias/categoria/${guia.category}`} style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: "var(--green-bg)", color: "var(--green)", border: "1px solid rgba(45,90,61,.18)", textDecoration: "none" }}>
                {CATEGORIES[guia.category] ?? guia.category}
              </a>
              <span style={{ fontSize: 10, fontWeight: 500, padding: "3px 10px", borderRadius: 100, background: "var(--warm)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                {COUNTRY_FLAGS[guia.country]} {COUNTRY_LABELS[guia.country]}
              </span>
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.8px", lineHeight: 1.1, marginBottom: 14, maxWidth: 720 }}>
              {guia.title}
            </h1>
            <p style={{ fontSize: 15, color: "var(--body)", lineHeight: 1.65, maxWidth: 640, marginBottom: 16 }}>
              {guia.description}
            </p>
            <div style={{ display: "flex", gap: 16, fontSize: 11, color: "var(--hint)", flexWrap: "wrap" }}>
              <span>Publicado el {formatDate(guia.publishedAt)}</span>
              {guia.updatedAt && guia.updatedAt !== guia.publishedAt && (
                <span>· Actualizado el {formatDate(guia.updatedAt)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Content + Sidebar */}
        <div style={{ padding: "48px 0 80px" }}>
          <div className="guia-layout">

            {/* Main content */}
            <article>
              <MDXRemote
                source={guia.content}
                options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
                components={mdxComponents}
              />

              {/* Bottom CTA */}
              <div style={{ marginTop: 48, background: "var(--surface-dark)", borderRadius: 12, padding: "32px 28px", textAlign: "center" }}>
                <p style={{ fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,.35)", marginBottom: 10 }}>Siguiente paso</p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 600, color: "#f2ede5", marginBottom: 10, letterSpacing: "-0.3px" }}>
                  Crea tu CV para {COUNTRY_CTA[guia.country]} con IA
                </p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginBottom: 22 }}>
                  En 3 minutos tienes un currículum listo para aplicar.
                </p>
                <a href="/crear" style={{ display: "inline-block", background: "var(--green-mid)", color: "#fff", textDecoration: "none", borderRadius: 7, padding: "12px 24px", fontSize: 13, fontWeight: 500 }}>
                  ✦ Crear mi CV gratis →
                </a>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="guia-sidebar">
              {/* TOC */}
              {toc.length > 0 && (
                <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 20px", marginBottom: 16 }}>
                  <p style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "var(--hint)", marginBottom: 12, fontWeight: 600 }}>
                    En este artículo
                  </p>
                  <nav>
                    {toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        style={{ display: "block", fontSize: 12.5, color: "var(--body)", textDecoration: "none", lineHeight: 1.5, padding: "4px 0", paddingLeft: item.level === 3 ? 12 : 0, borderLeft: item.level === 3 ? "2px solid var(--border)" : "none", marginBottom: 2 }}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Sidebar CTA */}
              <div style={{ background: "var(--green-bg)", border: "1px solid rgba(45,90,61,.2)", borderRadius: 10, padding: "18px 20px" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--green)", marginBottom: 6 }}>
                  ¿Listo para crear tu CV?
                </p>
                <p style={{ fontSize: 12, color: "var(--body)", lineHeight: 1.6, marginBottom: 14 }}>
                  Genera tu currículum para {COUNTRY_CTA[guia.country]} con IA en menos de 3 minutos.
                </p>
                <a href="/crear" style={{ display: "block", textAlign: "center", background: "var(--green)", color: "#fff", textDecoration: "none", borderRadius: 6, padding: "10px 0", fontSize: 12, fontWeight: 500 }}>
                  Crear mi CV gratis →
                </a>
              </div>
            </aside>
          </div>

          {/* Related articles */}
          {related.length > 0 && (
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 64px 0" }}>
              <style>{`@media (max-width: 640px) { .related-grid { grid-template-columns: 1fr !important; } .related-padding { padding: 40px 20px 0 !important; } }`}</style>
              <div className="related-padding" style={{ padding: "40px 0 0" }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.4px", marginBottom: 20 }}>
                  Guías relacionadas
                </h2>
                <div className="related-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                  {related.map((r) => (
                    <ArticleCard key={r.slug} guia={r} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
