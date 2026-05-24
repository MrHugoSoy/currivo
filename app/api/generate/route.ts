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

function generateSlug(nombre: string): string {
  const words = nombre
    .normalize("NFD").replace(/\p{Mn}/gu, "").toLowerCase()
    .replace(/[^a-z0-9\s]/g, "").trim().split(/\s+/).slice(0, 2);
  const random = Math.random().toString(36).slice(2, 6);
  return `${words.join("-")}-${random}`;
}

interface ExperienciaEntry { puesto: string; empresa: string; periodo: string; descripcion: string; }
interface RedSocial { tipo: string; url: string; }
interface EducacionEntry { carrera: string; institucion: string; anio: string; }

function formatExperiencias(experiencias: ExperienciaEntry[]): string {
  if (!experiencias?.length) return "No especificada";
  return experiencias.map((e, i) =>
    `Experiencia ${i + 1}:\n- Puesto: ${e.puesto || "No especificado"}\n- Empresa: ${e.empresa || "No especificada"}\n- Período: ${e.periodo || "No especificado"}\n- Descripción: ${e.descripcion || "No especificada"}`
  ).join("\n\n");
}

function formatEducacion(educacion: EducacionEntry[]): string {
  if (!educacion?.length) return "No especificada";
  return educacion
    .filter(e => e.carrera || e.institucion)
    .map(e => [e.carrera, e.institucion, e.anio].filter(Boolean).join(" | "))
    .join("\n") || "No especificada";
}

function formatRedes(redes: RedSocial[]): string {
  if (!redes?.length) return "";
  return redes.filter(r => r.url).map(r => `${r.tipo}: ${r.url}`).join(" · ");
}

function buildPrompt(data: Record<string, unknown>): string {
  const nombre       = data.nombre as string;
  const puesto       = data.puesto as string;
  const ciudad       = data.ciudad as string;
  const email        = data.email as string;
  const telefono     = (data.telefono as string | undefined) || "";
  const tono         = data.tono as string;
  const industria    = data.industria as string;
  const mercado      = data.mercado as string;
  const edad         = data.edad as string | undefined;
  const estadoCivil  = data.estadoCivil as string | undefined;
  const disponibilidad = (data.disponibilidad as string | undefined) || "Inmediata";
  const voluntariado = data.voluntariado as string | undefined;
  const languages    = data.languages as string;
  const sinExperiencia = data.sinExperiencia as boolean | undefined;
  const vacante      = data.vacante as string | undefined;

  const experiencias  = (data.experiencias as ExperienciaEntry[]) ?? [];
  const redesSociales = (data.redesSociales as RedSocial[]) ?? [];
  const educacion     = (data.educacion as EducacionEntry[]) ?? [];

  const eduStr    = formatEducacion(educacion);
  const redesStr  = formatRedes(redesSociales);
  const langList  = languages;

  const rawHabilidades = data.habilidades;
  const habilidades = Array.isArray(rawHabilidades)
    ? rawHabilidades.join(", ")
    : typeof rawHabilidades === "string" ? rawHabilidades.trim() : "";

  const expStr = sinExperiencia
    ? "SIN EXPERIENCIA LABORAL — no inventar trabajos anteriores."
    : formatExperiencias(experiencias);

  const skillsNote = habilidades
    ? `El usuario especificó estas habilidades, inclúyelas todas: ${habilidades}. Puedes complementar con otras relevantes para ${industria}.`
    : `Genera habilidades relevantes para ${industria}.`;

  // ── Reglas de certificaciones ──
  const certificaciones = data.certificaciones as Array<{ nombre: string; institucion: string; anio: string }> | string | undefined;

  // Formatear certificaciones (puede venir como array o string legacy)
  const certTexto = Array.isArray(certificaciones) && certificaciones.length > 0
    ? certificaciones
        .filter(c => c.nombre?.trim())
        .map(c => `${c.nombre}${c.institucion ? ` (${c.institucion}` : ""}${c.anio ? `, ${c.anio})` : c.institucion ? ")" : ""}`)
        .join(", ")
    : typeof certificaciones === "string" ? certificaciones.trim() : "";

  // Regla de certificaciones
  const certRule_es = certTexto
    ? `CERTIFICACIONES — El usuario mencionó: ${certTexto}.
- Inclúyelas con los datos exactos proporcionados: nombre, institución emisora y año.
- NO agregues otras que el usuario no haya mencionado.
- NO sugiereas basándote en las habilidades.`
    : `CERTIFICACIONES — El usuario NO mencionó ninguna.
- NO incluyas sección de certificaciones.
- NO inventes ni sugieras ninguna aunque el usuario tenga habilidades relacionadas.
- Omite esta sección completamente.`;

  const certRule_en = certTexto
    ? `CERTIFICATIONS — User mentioned: ${certTexto}.
- Include them with the exact data provided: name, issuing organization and year.
- Do NOT add others the user did not mention.
- Do NOT suggest based on skills.`
    : `CERTIFICATIONS — User did NOT mention any.
- Do NOT include a certifications section.
- Do NOT invent or suggest any even if user has related skills.
- Skip this section entirely.`;

  // ── Adaptador por vacante ──
  const vacanteActiva = vacante?.trim() && vacante.length > 50;

  const vacanteRule_es = vacanteActiva
    ? `\nADAPTACIÓN A VACANTE ESPECÍFICA — MUY IMPORTANTE:
El usuario quiere aplicar a esta vacante. Analiza la descripción y:
1. Extrae las palabras clave exactas (skills, herramientas, competencias requeridas)
2. Úsalas naturalmente en el CV sin forzarlas
3. Adapta el OBJETIVO PROFESIONAL para alinearlo con esta vacante
4. Prioriza los logros y experiencias más relevantes para este puesto
5. NO inventes experiencias que no existen

DESCRIPCIÓN DE LA VACANTE:
${vacante}`
    : "";

  const vacanteRule_en = vacanteActiva
    ? `\nJOB-SPECIFIC TAILORING — VERY IMPORTANT:
Analyze this job posting and:
1. Extract exact keywords (skills, tools, competencies)
2. Use them naturally throughout the CV
3. Adapt the PROFESSIONAL SUMMARY to align with this specific role
4. Prioritize the most relevant achievements for this position
5. Do NOT invent experiences that don't exist

JOB DESCRIPTION:
${vacante}`
    : "";

  const toneDesc: Record<string, string> = {
    Profesional: "formal y ejecutivo, verbos de acción fuertes",
    Creativo:    "dinámico, con personalidad, que destaque creatividad",
    Formal:      "muy estructurado, conservador, lenguaje corporativo",
    Moderno:     "fresco, contemporáneo, directo al punto",
  };

  const formatRule = `
FORMATO — MUY IMPORTANTE:
- Solo texto plano. NUNCA markdown.
- Prohibido: **negritas**, *cursivas*, # encabezados con hash
- Títulos de sección en MAYÚSCULAS
- Usa guion (-) o barra (|) para estructura, nunca asteriscos (*)`;

  const formatRuleEn = `
FORMATTING — CRITICAL:
- Plain text ONLY. Never use markdown syntax.
- Forbidden: **bold**, *italic*, _underline_, # hash headers
- Section headers in ALL CAPS
- Use dash (-) or pipe (|) for structure. Never asterisks (*).`;

  // ── MÉXICO ──
  if (mercado === "mx") {
    return `Eres un experto redactor de CVs profesionales para el mercado laboral mexicano.

Genera un currículum vitae completo en español (México) con estos datos:
- Nombre: ${nombre}
- Puesto al que aplica: ${puesto}
- Ciudad: ${ciudad || "No especificada"}
- Email: ${email || "No especificado"}
- Teléfono: ${telefono || "No especificado"}
- Edad: ${edad || "No especificada"}
- Estado civil: ${estadoCivil || "No especificado"}
- Disponibilidad: ${disponibilidad}
${redesStr ? `- Perfiles/Redes: ${redesStr}` : ""}
- Tono: ${tono} — ${toneDesc[tono] || tono}
- Industria: ${industria}
${languages ? `- Idiomas: ${languages}` : ""}

EXPERIENCIA LABORAL:
${expStr}

EDUCACIÓN:
${eduStr}

REGLA MÁS IMPORTANTE — NO INVENTAR NADA:
- USA SOLO la información que el usuario proporcionó
- Si no hay datos de educación, escribe SOLO "No especificada"
- Si no hay experiencia formal, NO inventes empresas ni fechas
- NUNCA generes datos ficticios: empresas, universidades, fechas, proyectos
- Un CV corto y honesto es mejor que uno largo con datos falsos
${vacanteRule_es}

${certRule_es}

REGLAS PARA CV MEXICANO:
- Incluye sección DATOS PERSONALES al inicio: nombre, ciudad, email, teléfono${edad ? ", edad" : ""}${estadoCivil ? ", estado civil" : ""}, disponibilidad: ${disponibilidad}
${redesStr ? "- Incluye los perfiles/redes en la sección de contacto" : ""}
- Incluye OBJETIVO PROFESIONAL (2-3 líneas)
${sinExperiencia
  ? `- El candidato NO tiene experiencia. NO inventes trabajos. Enfócate en EDUCACIÓN, HABILIDADES y PROYECTOS PERSONALES para ${puesto}.`
  : "- Sección EXPERIENCIA LABORAL con logros concretos"}
- Sección HABILIDADES: ${skillsNote}
- Sección EDUCACIÓN: usa solo los datos proporcionados
- Máximo 2 páginas
- Español natural de México
- Verbos de acción: lideré, desarrollé, implementé, coordiné, optimicé...
- NO incluyas RFC, CURP ni información bancaria
${languages ? "- Sección IDIOMAS al final con los idiomas y niveles proporcionados" : ""}
${formatRule}

Genera SOLO el contenido del CV, sin comentarios adicionales.`;
  }

  // ── USA ──
  if (mercado === "us") {
    return `You are an expert resume writer for the US job market.

Generate a professional, ATS-optimized resume in English:
- Name: ${nombre}
- Target Position: ${puesto}
- Location: ${ciudad || "Not specified"}
- Email: ${email || "Not specified"}
- Phone: ${telefono || "Not specified"}
${redesStr ? `- Profiles/Links: ${redesStr}` : ""}
- Tone: ${tono} — ${toneDesc[tono] || tono}
- Industry: ${industria}

WORK EXPERIENCE:
${expStr}

EDUCATION:
${eduStr}

CRITICAL — NEVER FABRICATE INFORMATION:
- Use ONLY the information provided by the user
- If no education provided, write "Education details not provided"
- NEVER create fake: companies, universities, dates, projects or achievements
- A short honest resume beats a long fabricated one
${vacanteRule_en}

${certRule_en}

US RESUME RULES:
- NO photo, NO age, NO marital status — illegal to include
- Maximum 1 page
- PROFESSIONAL SUMMARY (2-3 lines) at the top
${redesStr ? "- Include provided profile links in the header" : "- Include City, State — NOT full address"}
- Phone: ${telefono || "provided by candidate"}
${sinExperiencia
  ? `- No work experience. Focus on EDUCATION, SKILLS, PERSONAL PROJECTS for ${puesto}.`
  : `- EXPERIENCE: bullet points with quantified achievements ("Increased X by 40%", "Managed team of 8")`}
- Action verbs: Led, Developed, Implemented, Optimized, Delivered, Achieved...
- SKILLS: ${skillsNote}
- EDUCATION: use provided data only; if none write "Education details not provided"
- Use American English
${formatRuleEn}

Generate ONLY the resume content, no additional comments.`;
  }

  // ── CANADÁ ──
  return `You are a Canadian resume expert specializing in helping immigrants land jobs in Canada.

Generate a professional Canadian resume in English:

Name: ${nombre}
Target Position: ${puesto}
Location: ${ciudad || "Canada"}
Email: ${email || "Not specified"}
Phone: ${telefono || "Not specified"}
${redesStr ? `Profiles/Links: ${redesStr}` : ""}
Volunteer Work: ${voluntariado || "Not specified"}
Languages: ${langList || "English (Fluent)"}
Tone: ${tono} — ${toneDesc[tono] || tono}
Industry: ${industria}

WORK EXPERIENCE:
${expStr}

EDUCATION:
${eduStr}

CRITICAL — NEVER FABRICATE INFORMATION:
- Use ONLY the information provided by the user
- If no education, write "Education details not provided"
- NEVER invent: company names, dates, universities, projects or achievements
- A short honest resume is always better than a fabricated one
${vacanteRule_en}

${certRule_en}

CANADIAN RESUME RULES — FOLLOW STRICTLY:

NEVER INCLUDE: photo, age, date of birth, marital status, nationality, SIN, full address, "References available upon request"

STRUCTURE:
1. HEADER — Name, City/Province, Phone (${telefono || "provided"}), Email${redesStr ? ", profiles" : ""}
2. PROFESSIONAL SUMMARY (3-4 lines) — experience years, achievements, multicultural value, keywords for ${industria}
3. CORE COMPETENCIES — 9-12 keywords | pipe-separated — ${skillsNote}
4. PROFESSIONAL EXPERIENCE
${sinExperiencia
  ? `   - No work experience. Include ACADEMIC/PERSONAL PROJECTS for ${puesto}.`
  : `   - Format: Title | Company | City, Province | Month Year – Month Year
   - 3-5 bullets: Context + Action + Result format
   - Quantify: numbers, %, $, team sizes
   - Highlight multicultural collaboration`}
5. VOLUNTEER WORK — ${voluntariado ? "use provided info with 1-2 impact bullets" : 'write ONLY "Open to volunteer opportunities" — do NOT invent organizations'}
6. EDUCATION — provided data only + "International credential — equivalent to Canadian Bachelor's Degree" if applicable
7. LANGUAGES — ${langList || "English (Fluent)"}${langList?.toLowerCase().includes("french") ? "\n   — Highlight French bilingualism prominently (major asset in Quebec/Ottawa)" : ""}

ATS RULES:
- Standard headers (Experience, Education, Skills)
- No tables, columns or text boxes
- Dates: Jan 2020 – Mar 2023
- Mirror keywords from ${puesto}

PROVINCE NOTES:
${ciudad?.toLowerCase().includes("montreal") || ciudad?.toLowerCase().includes("quebec")
  ? "Quebec: Emphasize French prominently — many employers require it."
  : ciudad?.toLowerCase().includes("ottawa")
  ? "Ottawa: Federal hub — bilingualism (EN/FR) is a major asset."
  : ciudad?.toLowerCase().includes("vancouver") || ciudad?.toLowerCase().includes("bc")
  ? "BC/Vancouver: Tech-forward — include GitHub, portfolio links prominently."
  : ciudad?.toLowerCase().includes("calgary") || ciudad?.toLowerCase().includes("alberta")
  ? "Alberta: Energy/tech sector — highlight technical certifications."
  : "General Canada: Highlight adaptability and multicultural communication."}
${formatRuleEn}

Generate ONLY the resume. No explanations. Section headers in ALL CAPS.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, puesto } = body;

    if (!nombre || !puesto) {
      return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
    }

    // ── Límite de 1 CV gratis para usuarios no Pro ──
    if (body.userId && !body.editSlug) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("is_pro")
        .eq("user_id", body.userId)
        .single();

      if (!profile?.is_pro) {
        const { count } = await supabaseAdmin
          .from("cvs")
          .select("id", { count: "exact", head: true })
          .eq("user_id", body.userId);

        if ((count ?? 0) >= 1) {
          return NextResponse.json({ error: "LIMIT_REACHED" }, { status: 403 });
        }
      }
    }

    const rawLangs = body.languages;
    const langStr: string = Array.isArray(rawLangs) && rawLangs.length > 0
      ? (rawLangs as Array<{ language: string; level: string }>).map(l => `${l.language} (${l.level})`).join(", ")
      : "";

    const prompt = buildPrompt({ ...body, languages: langStr });

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: body.mercado === "ca" ? 2000 : 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const cv = stripMarkdown(
      message.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map(b => b.text)
        .join("\n")
    );

    const { photoUrl: _photo, editSlug, userId, vacante: _vacante, ...formDataToStore } = body;
    const savedFormData = {
      ...formDataToStore,
      languages: langStr || undefined,
      vacante: body.vacante || undefined,
    };

    if (editSlug) {
      await supabase.from("cvs").update({
        nombre, puesto,
        ciudad: body.ciudad || null,
        email: body.email || null,
        mercado: body.mercado,
        template: body.templateId || "clasico",
        cv_text: cv,
        form_data: savedFormData,
      }).eq("slug", editSlug);
      return NextResponse.json({ cv, slug: editSlug });
    }

    const slug = generateSlug(nombre);
    await supabase.from("cvs").insert({
      slug, nombre, puesto,
      ciudad: body.ciudad || null,
      email: body.email || null,
      mercado: body.mercado,
      template: body.templateId || "clasico",
      cv_text: cv,
      form_data: savedFormData,
      ...(userId ? { user_id: userId } : {}),
    });

    return NextResponse.json({ cv, slug });
  } catch (error) {
    console.error("Error generating CV:", error);
    return NextResponse.json({ error: "Error al generar el CV. Intenta de nuevo." }, { status: 500 });
  }
}