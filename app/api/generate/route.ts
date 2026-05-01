import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function generateSlug(nombre: string): string {
  const words = nombre
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2);
  const random = Math.random().toString(36).slice(2, 6);
  return `${words.join("-")}-${random}`;
}

interface ExperienciaEntry { puesto: string; empresa: string; periodo: string; descripcion: string; }
interface RedSocial { tipo: string; url: string; }
interface EducacionEntry { carrera: string; institucion: string; anio: string; }

function formatExperiencias(experiencias: ExperienciaEntry[], mercado: string): string {
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
  const nombre = data.nombre as string;
  const puesto = data.puesto as string;
  const ciudad = data.ciudad as string;
  const email = data.email as string;
  const tono = data.tono as string;
  const industria = data.industria as string;
  const mercado = data.mercado as string;
  const edad = data.edad as string | undefined;
  const estadoCivil = data.estadoCivil as string | undefined;
  const voluntariado = data.voluntariado as string | undefined;
  const languages = data.languages as string;
  const sinExperiencia = data.sinExperiencia as boolean | undefined;
  const certificaciones = data.certificaciones as string | undefined;
  const experiencias = (data.experiencias as ExperienciaEntry[]) ?? [];
  const redesSociales = (data.redesSociales as RedSocial[]) ?? [];
  const educacion = (data.educacion as EducacionEntry[]) ?? [];
  const eduStr = formatEducacion(educacion);
  const rawHabilidades = data.habilidades;
  const habilidades = Array.isArray(rawHabilidades)
    ? rawHabilidades.join(", ")
    : typeof rawHabilidades === "string" ? rawHabilidades.trim() : "";
  const langList = languages;
  const redesStr = formatRedes(redesSociales);
  const expStr = sinExperiencia
    ? "SIN EXPERIENCIA LABORAL — no inventar trabajos anteriores."
    : formatExperiencias(experiencias, mercado);
  const skillsNote = habilidades
    ? `El usuario ya especificó estas habilidades, inclúyelas todas: ${habilidades}. Puedes complementar con otras relevantes para ${industria}.`
    : `Genera habilidades relevantes para ${industria}.`;

  // Regla de certificaciones compartida
  const certRule_es = certificaciones
    ? `CERTIFICACIONES — El usuario mencionó las siguientes: ${certificaciones}.
- Inclúyelas en el CV con detalles realistas: institución emisora real, formato estándar de la industria y año aproximado si no se especificó.
- NO agregues certificaciones adicionales que el usuario no haya mencionado.
- NO sugiereas otras certificaciones basándote en las habilidades del usuario.`
    : `CERTIFICACIONES — El usuario NO mencionó ninguna certificación.
- NO incluyas sección de certificaciones.
- NO inventes ni sugieras certificaciones aunque el usuario tenga habilidades relacionadas.
- Omite esta sección completamente.`;

  const certRule_en = certificaciones
    ? `CERTIFICATIONS — User mentioned the following: ${certificaciones}.
- Include them with realistic details: real issuing organization, industry-standard format, and approximate year if not specified.
- Do NOT add extra certifications the user did not mention.
- Do NOT suggest other certifications based on the user's skills.`
    : `CERTIFICATIONS — User did NOT mention any certifications.
- Do NOT include a certifications section.
- Do NOT invent or suggest certifications even if the user has related skills.
- Skip this section entirely.`;

  const toneDesc: Record<string, string> = {
    Profesional: "formal y ejecutivo, verbos de acción fuertes",
    Creativo:    "dinámico, con personalidad, que destaque creatividad",
    Formal:      "muy estructurado, conservador, lenguaje corporativo",
    Moderno:     "fresco, contemporáneo, directo al punto",
  };

  // ── MÉXICO ──────────────────────────────────────────────
  if (mercado === "mx") {
    return `Eres un experto redactor de CVs profesionales para el mercado laboral mexicano.

Genera un currículum vitae completo en español (México) con estos datos:
- Nombre: ${nombre}
- Puesto al que aplica: ${puesto}
- Ciudad: ${ciudad || "No especificada"}
- Email: ${email || "No especificado"}
- Edad: ${edad || "No especificada"}
- Estado civil: ${estadoCivil || "No especificado"}
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
- Si no hay datos de educación, escribe SOLO "Información no proporcionada"
- Si no hay experiencia formal, NO inventes empresas ni fechas
- NUNCA generes datos ficticios: nombres de empresas, universidades, fechas, proyectos
- Si un campo está vacío, omite esa sección completa
- Un CV corto y honesto es mejor que uno largo con datos falsos

${certRule_es}

REGLAS PARA CV MEXICANO:
- Incluye sección de DATOS PERSONALES al inicio (nombre, ciudad, email, edad si se dio, estado civil si se dio)
${redesStr ? "- Incluye los perfiles/redes proporcionados en la sección de datos personales o contacto" : ""}
- Incluye OBJETIVO PROFESIONAL (2-3 líneas)
${sinExperiencia
  ? `- El candidato NO tiene experiencia laboral. NO inventes trabajos. Enfócate en EDUCACIÓN, HABILIDADES, PROYECTOS PERSONALES o CURSOS relevantes para ${puesto}.`
  : "- Sección EXPERIENCIA LABORAL con los puestos proporcionados y logros concretos"}
- Sección HABILIDADES: ${skillsNote}
- Sección EDUCACIÓN: usa los datos proporcionados; si no se dio información, escribe "No especificada"
- Máximo 2 páginas de contenido
- Español natural de México
- Usa verbos de acción: lideré, desarrollé, implementé, coordiné, optimicé...
- NO incluyas RFC, CURP ni información bancaria
${languages ? "- Incluye sección IDIOMAS al final del CV con los idiomas y niveles proporcionados" : ""}

Genera SOLO el contenido del CV, sin comentarios adicionales.`;
  }

  // ── USA ──────────────────────────────────────────────────
  if (mercado === "us") {
    return `You are an expert resume writer for the US job market.

Generate a professional, ATS-optimized resume in English with the following information:
- Name: ${nombre}
- Target Position: ${puesto}
- Location: ${ciudad || "Not specified"}
- Email: ${email || "Not specified"}
${redesStr ? `- Profiles/Links: ${redesStr}` : ""}
- Tone: ${tono} — ${toneDesc[tono] || tono}
- Industry: ${industria}

WORK EXPERIENCE:
${expStr}

EDUCATION:
${eduStr}

CRITICAL — NEVER FABRICATE INFORMATION:
- Use ONLY the information provided by the user
- If no education was provided, write ONLY "Education details not provided"
- If no company names were given, do NOT invent them
- NEVER create fake: companies, universities, dates, projects or achievements
- Omit entire sections if no real data was provided
- A short honest resume beats a long fabricated one

${certRule_en}

US RESUME RULES (CRITICAL):
- NO photo, NO age, NO marital status, NO nationality — these are illegal to include
- Maximum 1 page
- Start with a strong PROFESSIONAL SUMMARY (2-3 lines)
${redesStr
  ? "- Include provided profile links in the header section"
  : "- Include LinkedIn placeholder and location (City, State) but NOT full address"}
${sinExperiencia
  ? `- Candidate has NO work experience. Do NOT invent jobs. Focus on EDUCATION, SKILLS, PERSONAL PROJECTS relevant to ${puesto}.`
  : `- EXPERIENCE section: use bullet points with quantified achievements ("Increased sales by 40%", "Managed team of 8")`}
- Use strong action verbs: Led, Developed, Implemented, Optimized, Delivered, Achieved...
- SKILLS section: ${skillsNote}
- EDUCATION section: use the provided data; if not provided, write "Education details not provided"
- Use American English

Generate ONLY the resume content, no additional comments.`;
  }

  // ── CANADÁ ───────────────────────────────────────────────
  return `You are a Canadian resume expert specializing in helping immigrants and international professionals land jobs in Canada.

Generate a professional Canadian resume in English with this information:

Name: ${nombre}
Target Position: ${puesto}
Location: ${ciudad || "Canada"}
Email: ${email || "Not specified"}
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
- If no education details were given, write only "Education details not provided"
- NEVER invent: company names, dates, universities, projects or achievements
- A short honest resume is always better than a fabricated one

${certRule_en}

CANADIAN RESUME RULES — FOLLOW STRICTLY:

NEVER INCLUDE (illegal or inappropriate):
- No photo, no age, no date of birth
- No marital status, no nationality
- No social insurance number
- No full address (city and province only)
- No "References available upon request"

STRUCTURE (in this exact order):

1. HEADER
   - Full name (prominent)
   - City, Province only (not full address)
   - Phone with area code
   - Professional email
   - LinkedIn: linkedin.com/in/[firstname-lastname]
   - Portfolio if relevant to ${industria}

2. PROFESSIONAL SUMMARY (3-4 lines max)
   - Start with years of experience and specialization
   - Include 2-3 quantified achievements
   - Never use first person (no "I" statements)
   - Must include keywords relevant to ${industria}
   - Highlight multicultural background as an asset

3. CORE COMPETENCIES
   - Grid of 9-12 keywords separated by | pipes
   - Must be ATS-friendly single keywords or short phrases
   - ${skillsNote}
   - Include both technical and soft skills

4. PROFESSIONAL EXPERIENCE
${sinExperiencia
  ? `   - Candidate has NO work experience. Do NOT invent jobs. Include ACADEMIC PROJECTS or PERSONAL PROJECTS relevant to ${puesto}. Focus on transferable skills.`
  : `   - Reverse chronological order
   - Format: Job Title | Company Name | City, Province | Month Year – Month Year
   - 3-5 bullet points per position
   - EVERY bullet must start with a strong past-tense action verb
   - EVERY bullet must follow: Context + Action + Result format
   - QUANTIFY everything possible: numbers, %, $, team sizes, timelines
   - Highlight collaboration, leadership and cross-cultural work`}

5. VOLUNTEER WORK (very important in Canada)
   - If volunteer work was provided, use it with 1-2 bullet points showing impact
   - If NOT provided, write ONLY "Open to volunteer opportunities" — do NOT invent organizations

6. EDUCATION
   - Degree | Institution | Year — use provided data only
   - Add: "International credential — equivalent to Canadian Bachelor's Degree" if applicable
   - Add: "Evaluated by WES (World Education Services)" if applicable

7. LANGUAGES
   ${langList ? `Languages to include: ${langList}` : ""}
   - If French is listed, add note about advantage in Quebec/Ottawa/federal government positions
   - Format: Language — Level (e.g. French — Advanced B2)

ATS OPTIMIZATION RULES:
- Use standard section headers (Experience, Education, Skills)
- No tables, no text boxes, no columns
- Dates format: Jan 2020 – Mar 2023
- Mirror exact keywords from ${puesto} job title

CANADIAN SOFT SKILLS TO EMPHASIZE:
- Collaboration and teamwork in multicultural environments
- Adaptability and cultural awareness
- Community involvement
- Clear written and verbal communication

PROVINCE-SPECIFIC NOTES:
${ciudad?.toLowerCase().includes('montreal') || ciudad?.toLowerCase().includes('quebec')
  ? '- Quebec position: Emphasize French language skills prominently.'
  : ciudad?.toLowerCase().includes('ottawa')
  ? '- Ottawa position: Federal government hub — bilingualism (EN/FR) is a major asset.'
  : ciudad?.toLowerCase().includes('vancouver') || ciudad?.toLowerCase().includes('bc')
  ? '- BC/Vancouver position: Tech-forward market. Include GitHub, portfolio links prominently.'
  : ciudad?.toLowerCase().includes('calgary') || ciudad?.toLowerCase().includes('alberta')
  ? '- Alberta position: Energy and tech sector. Highlight technical certifications.'
  : '- General Canada: Highlight adaptability and multicultural communication skills.'}

Generate ONLY the resume content.
No explanations, no comments, no preamble.
Use plain text formatting with clear section headers in ALL CAPS.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, puesto } = body;

    if (!nombre || !puesto) {
      return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
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

    const cv = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map(b => b.text)
      .join("\n");

    const { photoUrl: _photo, editSlug, userId, ...formDataToStore } = body;
    const savedFormData = { ...formDataToStore, languages: langStr || undefined };

    if (editSlug) {
      await supabase.from("cvs").update({
        nombre,
        puesto,
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
      slug,
      nombre,
      puesto,
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