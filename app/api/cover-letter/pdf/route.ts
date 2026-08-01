import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import CoverLetterPDF from "@/lib/cover-letter/PDF";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { text, nombre, puesto, empresa, mercado } = await req.json() as {
      text: string; nombre: string; puesto: string; empresa?: string; mercado?: string;
    };

    if (!text || !nombre) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = createElement(CoverLetterPDF as any, {
      text, nombre, puesto: puesto ?? "", empresa, mercado: mercado ?? "mx",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);

    const safeName = nombre.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const filename = `carta-${safeName}.pdf`;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Cover letter PDF error:", err);
    return NextResponse.json({ error: "Error generando el PDF" }, { status: 500 });
  }
}
