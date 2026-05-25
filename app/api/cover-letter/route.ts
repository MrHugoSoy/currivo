import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export const dynamic = "force-dynamic";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*\n]+)\*\*/g, "$1")
    .replace(/__([^_\n]+)__/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[ \t]+$/gm, "")
    .trim();
}

interface ExperienciaEntry { puesto: string; empresa: string; periodo: string; descripcion: string; }

function formatExp(experiencias: ExperienciaEntry[]): string {
  if (!experiencias?.length) return "Sin experiencia especificada";
  const filtered = experiencias.filter(e => e.puesto || e.empresa || e.descripcion);
  if (!filtered.length) return "Sin experiencia especificada";
  return filtered.map(e =>
    `${e.puesto || "Puesto"}${e.empresa ? ` en ${e.empresa}` : ""}${e.periodo ? ` (${e.periodo})` : ""}${e.descripcion ? `: ${e.descripcion}` : ""}`
  ).join("\n");
}

function buildPrompt(data: Record<string, unknown>): string {
  const nombre      = data.nombre as string;
  const puesto      = data.puesto as string;
  const empresa     = (data.empresa as string) || "";
  const ciudad      = (data.ciudad as string) || "";
  const mercado     = data.mercado as string;
  const tono        = (data.tono as string) || "Profesional";
  const vacante     = (data.vacante as string) || "";
  const habilidades = Array.isArray(data.habilidades)
    ? (data.habilidades as string[]).join(", ")
    : typeof data.habilidades === "string" ? data.habilidades : "";
  const experiencias = (data.experiencias as ExperienciaEntry[]) ?? [];
  const expStr = formatExp(experiencias);
  const vacanteActiva = vacante.trim().length > 30;

  const toneEs: Record<string, string> = {
    Profesional: "formal y ejecutivo",
    Creativo:    "dinámico y con personalidad",
    Formal:      "muy estructurado y corporativo",
    Moderno:     "fresco y directo al punto",
  };
  const toneEn: Record<string, string> = {
    Profesional: "formal and executive",
    Creativo:    "dynamic and creative",
    Formal:      "highly structured and corporate",
    Moderno:     "fresh and direct",
  };

  if (mercado === "mx") {
    return `Eres un experto redactor de cartas de presentación para el mercado laboral mexicano.

Genera una carta de presentación profesional en español (México) para:
- Nombre: ${nombre}
- Puesto al que aplica: ${puesto}
${empresa ? `- Empresa: ${empresa}` : ""}
- Ciudad: ${ciudad || "México"}
- Tono: ${tono} — ${toneEs[tono] ?? tono}
- Experiencia relevante:
${expStr}
${habilidades ? `- Habilidades clave: ${habilidades}` : ""}
${vacanteActiva ? `\nADAPTA la carta específicamente para esta vacante:\n${vacante}` : ""}

REGLAS ESTRICTAS:
- 3 párrafos + cierre
- Párrafo 1: presentación, puesto${empresa ? ` y empresa (${empresa})` : ""} a la que aplica
- Párrafo 2: por qué eres el candidato ideal (usa experiencia y habilidades reales, sin inventar nada)
- Párrafo 3: motivación y fit con${empresa ? ` ${empresa}` : " la empresa"}
- Cierre: disponible para entrevista, despedida cordial con nombre completo
- NO inventar información que el usuario no proporcionó
- Español natural de México, tono ${toneEs[tono] ?? tono}
- Solo texto plano, sin markdown ni asteriscos ni encabezados con #
- Empezar directamente con el saludo (sin "Ciudad, fecha" ni membrete)`;
  }

  const isUs = mercado === "us";
  const lang = isUs ? "American English" : "Canadian English";

  return `You are an expert cover letter writer for the ${isUs ? "US" : "Canadian"} job market.

Generate a professional cover letter in ${lang} for:
- Name: ${nombre}
- Target Position: ${puesto}
${empresa ? `- Company: ${empresa}` : ""}
- Location: ${ciudad || (isUs ? "United States" : "Canada")}
- Tone: ${tono} — ${toneEn[tono] ?? tono}
- Relevant Experience:
${expStr}
${habilidades ? `- Key Skills: ${habilidades}` : ""}
${vacanteActiva ? `\nTAILOR the letter specifically for this job posting:\n${vacante}` : ""}

STRICT RULES:
- 3 paragraphs + closing
- Paragraph 1: who you are, target role${empresa ? ` and company (${empresa})` : ""}
- Paragraph 2: why you're the ideal candidate (real experience and skills only, never fabricate)
- Paragraph 3: motivation and culture fit with${empresa ? ` ${empresa}` : " the company"}
- Closing: available for interview, professional sign-off with full name
- Do NOT invent information the user did not provide
- ${lang}, tone: ${toneEn[tono] ?? tono}
- Plain text only. No markdown, no asterisks, no # headers
- Start directly with the greeting. No formal letterhead or date line

LANGUAGE DETECTION:
- The user may have filled the form in Spanish
- Regardless of input language, write entirely in professional ${lang}
- Translate job titles, descriptions, skills — keep proper nouns (company names, cities) as-is
- Do NOT mention that a translation was made`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    const nombre  = body.nombre as string;
    const puesto  = body.puesto as string;
    const userId  = body.userId as string | undefined;

    if (!nombre || !puesto) {
      return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
    }

    // ── Verificar Pro ──
    if (!userId) {
      return NextResponse.json({ error: "PRO_REQUIRED" }, { status: 403 });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_pro")
      .eq("user_id", userId)
      .single();

    if (!profile?.is_pro) {
      return NextResponse.json({ error: "PRO_REQUIRED" }, { status: 403 });
    }

    const prompt = buildPrompt(body);

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const coverLetter = stripMarkdown(
      message.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map(b => b.text)
        .join("\n")
    );

    // Save to DB (best-effort)
    await supabase.from("cover_letters").insert({
      user_id: userId,
      nombre,
      puesto,
      empresa: body.empresa || null,
      mercado: body.mercado || "mx",
      cover_letter_text: coverLetter,
    }).then(() => {}, () => {});

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error("Cover letter error:", error);
    return NextResponse.json({ error: "Error al generar la carta. Intenta de nuevo." }, { status: 500 });
  }
}
