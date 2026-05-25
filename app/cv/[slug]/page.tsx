import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { CVPageActions } from "./CVPageActions";
import { PREVIEW_TEMPLATES } from "@/lib/templates/index";
import type { TemplateId, CVData } from "@/lib/templates/types";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await supabase
    .from("cvs")
    .select("nombre, puesto, ciudad")
    .eq("slug", slug)
    .single();
  if (!data) return { title: "CV no encontrado · resumika.com" };
  const title = `${data.nombre} — ${data.puesto} | resumika`;
  const description = `CV profesional de ${data.nombre}, ${data.puesto}${data.ciudad ? ` en ${data.ciudad}` : ""}. Creado con resumika.com.`;
  return {
    title,
    description,
    openGraph: {
      title: `${data.nombre} — ${data.puesto}`,
      description,
      url: `https://resumika.com/cv/${slug}`,
      siteName: "resumika",
      locale: data.ciudad ? "es_MX" : "es_MX",
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${data.nombre} — ${data.puesto}`,
      description,
    },
  };
}

export default async function CVPage({ params }: PageProps) {
  const { slug } = await params;
  const { data, error } = await supabase
    .from("cvs")
    .select("nombre, puesto, ciudad, email, mercado, cv_text, template, form_data, created_at")
    .eq("slug", slug)
    .single();

  if (!data || error) notFound();

  const templateId = ((data.template as string) || "clasico") as TemplateId;
  const Preview = PREVIEW_TEMPLATES[templateId] ?? PREVIEW_TEMPLATES.clasico;

  // Extract photoUrl from form_data if available (for Mexico CVs)
  const formData = data.form_data as Record<string, unknown> | null;
  const photoUrl = (formData?.photoUrl as string | undefined) ?? undefined;

  const cvData: CVData = {
    nombre:   data.nombre,
    puesto:   data.puesto,
    ciudad:   data.ciudad  ?? undefined,
    email:    data.email   ?? undefined,
    mercado:  data.mercado,
    cv_text:  data.cv_text,
    photoUrl,
  };

  const date = new Date(data.created_at).toLocaleDateString("es-MX", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: ${data.mercado === "mx" ? "A4" : "Letter"}; margin: 0; }
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}} />

      {/* Nav */}
      <header className="no-print" style={{ background: "var(--paper)", borderBottom: "1px solid var(--border)", padding: "0 64px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <a href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, fontStyle: "italic", color: "var(--ink)", letterSpacing: "-0.5px", textDecoration: "none" }}>
          resumi<span style={{ color: "var(--green)" }}>ka</span>
        </a>
        <a href="/" style={{ fontSize: 12, color: "var(--green)", fontWeight: 500, textDecoration: "none", border: "1px solid rgba(45,90,61,.25)", borderRadius: 5, padding: "6px 14px", background: "var(--green-bg)" }}>
          ✦ Crear mi CV
        </a>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 72px" }}>
        <CVPageActions slug={slug} mercado={data.mercado} templateId={templateId} />
        <div style={{ borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.08)" }}>
          <Preview data={cvData} />
        </div>
        <p className="no-print" style={{ textAlign: "center", fontSize: 11, color: "var(--hint)", marginTop: 20 }}>
          Generado el {date}
        </p>
      </div>

      {/* Footer */}
      <div className="no-print" style={{ textAlign: "center", padding: "0 0 36px", fontSize: 11, color: "var(--hint)" }}>
        Creado con{" "}
        <a href="/" style={{ color: "var(--green2)", textDecoration: "none", fontWeight: 500 }}>
          resumika.com
        </a>
      </div>
    </div>
  );
}
