import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { createClient } from "@supabase/supabase-js";
import { PDF_TEMPLATES } from "@/lib/templates/index";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder",
  { auth: { persistSession: false } }
);
export const dynamic = "force-dynamic";
import type { TemplateId, CVData } from "@/lib/templates/types";

export async function POST(req: NextRequest) {
  try {
    const { slug, template, photoUrl: photoUrlFromClient } = await req.json() as { slug: string; template: TemplateId; photoUrl?: string };
    if (!slug || !template) {
      return NextResponse.json({ error: "slug y template son requeridos" }, { status: 400 });
    }

    const { data: row, error } = await supabaseAdmin
      .from("cvs")
      .select("nombre, puesto, ciudad, email, mercado, cv_text, form_data")
      .eq("slug", slug)
      .single();

    if (error || !row) {
      return NextResponse.json({ error: "CV no encontrado" }, { status: 404 });
    }

    // Extract photoUrl from form_data (stored as JSON)
    const formData = row.form_data as Record<string, unknown> | null;
    const photoUrl = photoUrlFromClient ?? (formData?.photoUrl as string | undefined) ?? undefined;

    const cvData: CVData = {
      nombre:   row.nombre,
      puesto:   row.puesto,
      ciudad:   row.ciudad   ?? undefined,
      email:    row.email    ?? undefined,
      mercado:  row.mercado,
      cv_text:  row.cv_text,
      photoUrl,
    };

    const PDFComponent = PDF_TEMPLATES[template];
    if (!PDFComponent) {
      return NextResponse.json({ error: "Plantilla no válida" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = createElement(PDFComponent as any, { data: cvData });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${slug}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: "Error generando el PDF" }, { status: 500 });
  }
}
