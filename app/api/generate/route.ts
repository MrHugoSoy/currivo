import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { generateLimiter, getIP, isRateLimited } from "@/lib/ratelimit";
import { generateSchema } from "@/lib/validators";

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
    return `You are an expert resume writer specialized in the US job market and ATS optimization.

Generate a professional, ATS-optimized resume in American English with this information:
- Name: ${nombre}
- Target Position: ${puesto}
- Location: ${ciudad || "Not specified"} (City, State only — never full address)
- Email: ${email || "Not specified"}
- Phone: ${telefono || "Not specified"}
${redesStr ? `- LinkedIn/Portfolio: ${redesStr}` : ""}
- Tone: ${tono} — ${toneDesc[tono] || tono}
- Industry: ${industria}

WORK EXPERIENCE:
${expStr}

EDUCATION:
${eduStr}

CRITICAL — NEVER FABRICATE INFORMATION:
- Use ONLY the information the user provided
- If no education was provided, write "Education details not provided"
- NEVER invent: companies, universities, dates, projects or achievements
- A short honest resume beats a long fabricated one
- If no experience provided and sinExperiencia is true, focus on education and skills only
${vacanteRule_en}
${certRule_en}

═══ US RESUME RULES — FOLLOW STRICTLY ═══

WHAT NEVER TO INCLUDE (US anti-discrimination laws):
- NO photo, NO age, NO date of birth
- NO marital status, NO nationality, NO religion
- NO immigration status
- NO "References available upon request"
- NO generic objective statements ("seeking a dynamic company...")

FORMAT RULES (ATS compatibility is critical):
- Maximum 1 page if less than 10 years experience; 2 pages maximum for senior profiles
- Clean single-column layout — NO tables, NO text boxes, NO multiple columns
- NO graphics, NO skill bars, NO icons
- Section headers in ALL CAPS
- Use dash (-) for bullets, never asterisks or symbols
- Plain text only — NO markdown, NO bold (**), NO italics, NO # headers

STRUCTURE (in this exact order):
1. HEADER
   - Full name (prominent)
   - City, State (never full address)
   - Phone | Email${redesStr ? " | LinkedIn" : ""}

2. PROFESSIONAL SUMMARY (2-3 lines maximum)
   - NOT "I am passionate and committed..."
   - YES: synthesis of who they are professionally and what value they bring
   - Example format: "[Profession] with [X]+ years of experience in [specialization]. [Key achievement or value proposition]."

3. ${sinExperiencia ? "SKILLS\n   - Technical and soft skills relevant to " + puesto : "WORK EXPERIENCE\n   - Reverse chronological order (most recent first)\n   - Format: Job Title | Company Name | City, State | Month Year – Month Year\n   - 3-5 bullet points per role\n   - EVERY bullet starts with a strong past-tense action verb\n   - Focus on ACHIEVEMENTS, not tasks\n   - Quantify everything possible: numbers, %, $, team sizes, timeframes\n   - BAD: 'Responsible for managing social media'\n   - GOOD: 'Grew social media engagement by 35% through targeted content strategy, adding 2,400 followers in 6 months'\n   - Use the X-Y-Z Google formula: Accomplished [X] as measured by [Y] by doing [Z]\n   - Use aggressive action verbs: Led, Spearheaded, Executed, Generated, Maximized, Delivered, Optimized, Launched"}

4. SKILLS
   - Divide in categories if many: Technical Skills | Tools | Languages
   - Only real, relevant skills — no inflating with obvious ones
   - ${skillsNote}

5. EDUCATION
   - Degree | Institution | Location | Year
   - No GPA unless exceptional and recent graduate
   - No course list
   - ${eduStr !== "No especificada" ? "Use provided data" : "Write: Education details not provided"}

${certTexto ? `6. CERTIFICATIONS\n   - ${certTexto}\n   - Certifications carry huge weight in US market — make them visible` : ""}

ATS OPTIMIZATION RULES:
- Mirror exact keywords from the job title: ${puesto}
- Use standard section headers (Experience, Education, Skills) — ATS may not recognize creative names
- Avoid headers/footers for contact info — some ATS ignore them
- Each bullet point maximum 1.5 lines — if longer, cut it
${vacanteActiva ? "- This resume is tailored to a specific job posting — use exact keywords from the job description naturally throughout" : ""}

LANGUAGE RULES:
- Entire resume MUST be in professional American English regardless of input language
- Translate any Spanish input naturally — do NOT mention translation was made
- Keep proper nouns as-is (company names, cities, certification names)
- Use US corporate vocabulary: "Spearheaded", "Cross-functional", "Stakeholder", "ROI", "KPIs"

BULLET LENGTH RULE:
- Each bullet must fit in maximum 1.5 lines
- If it needs more, it's a paragraph — cut it

Generate ONLY the resume content. No explanations. No comments. Section headers in ALL CAPS.`;
  }

  // ── CANADÁ ──
  return `You are a Canadian resume expert specializing in helping immigrants and international professionals land jobs in Canada. You know Canadian HR culture, ATS systems, and multicultural workplace values deeply.

Generate a professional Canadian resume in English with this information:

Name: ${nombre}
Target Position: ${puesto}
Location: ${ciudad || "Canada"} (City, Province only)
Email: ${email || "Not specified"}
Phone: ${telefono || "Not specified"}
${redesStr ? `LinkedIn/Portfolio: ${redesStr}` : ""}
Volunteer Work: ${voluntariado || "Not specified"}
Languages: ${langList || "English (Fluent)"}
Tone: ${tono} — ${toneDesc[tono] || tono}
Industry: ${industria}

WORK EXPERIENCE:
${expStr}

EDUCATION:
${eduStr}

CRITICAL — NEVER FABRICATE INFORMATION:
- Use ONLY information provided by the user
- If no education details given, write "Education details not provided"
- NEVER invent: company names, dates, universities, projects or achievements
- A short honest resume always beats a fabricated one
${vacanteRule_en}
${certRule_en}

═══ CANADIAN RESUME RULES — FOLLOW STRICTLY ═══

WHAT NEVER TO INCLUDE (Canadian Human Rights laws):
- NO photo, NO age, NO date of birth
- NO marital status, NO nationality, NO religion
- NO Social Insurance Number (SIN)
- NO full address (City, Province only)
- NO "References available upon request"

FORMAT RULES (ATS compatibility):
- Maximum 1 page if under 10 years experience; 2 pages for senior profiles
- Clean single-column layout — NO tables, NO text boxes, NO multiple columns
- NO graphics, NO skill bars, NO icons, NO percentage bars
- Section headers in ALL CAPS
- Plain text only — NO markdown, NO bold (**), NO italics, NO # headers

STRUCTURE (in this exact order):
1. HEADER
   - Full name (prominent)
   - City, Province (never full address)
   - Phone | Email${redesStr ? " | LinkedIn" : ""}${redesStr?.toLowerCase().includes("github") || redesStr?.toLowerCase().includes("portfolio") ? " | Portfolio" : ""}

2. PROFESSIONAL SUMMARY (3-4 lines maximum)
   - Start with years of experience and specialization
   - Include multicultural background as an asset — this is valued in Canada
   - 1-2 quantified achievements
   - NO first person ("I" statements)
   - Keywords relevant to ${industria} and ${puesto}

3. CORE COMPETENCIES
   - 9-12 keywords separated by | pipes in a single line or two
   - Mix technical and soft skills
   - ATS-friendly single keywords or short phrases
   - ${skillsNote}
   - Canadian soft skills to include: Cross-cultural communication, Adaptability, Community involvement, Team collaboration

4. ${sinExperiencia
  ? `ACADEMIC & PERSONAL PROJECTS\n   - No work experience — focus on relevant projects for ${puesto}\n   - Use same bullet format: Action verb + what you did + result/impact`
  : `PROFESSIONAL EXPERIENCE\n   - Reverse chronological order\n   - Format: Job Title | Company Name | City, Province/Country | Month Year – Month Year\n   - 3-5 bullet points per role\n   - EVERY bullet starts with a strong past-tense action verb\n   - Follow Context + Action + Result format\n   - Quantify: numbers, %, $CAD, team sizes, timelines\n   - Highlight cross-cultural collaboration and adaptability\n   - BAD: "Responsible for managing the design team"\n   - GOOD: "Led cross-functional design team of 4, delivering 12 brand identity projects on time and 15% under budget"\n   - Each bullet maximum 1.5 lines`}

5. VOLUNTEER WORK (very important in Canada — shows community integration)
   ${voluntariado
     ? `- Use provided volunteer info: ${voluntariado}\n   - 1-2 bullet points showing community impact`
     : `- Write ONLY: "Open to volunteer opportunities"\n   - DO NOT invent organizations or activities`}

6. EDUCATION
   - Degree | Institution | Location | Year
   - If international credential, add: "(International credential — equivalent to Canadian Bachelor's Degree)" if applicable
   - If WES evaluated, mention it: "(WES Evaluated — Canadian equivalency: [degree])"
   - ${eduStr !== "No especificada" ? "Use only provided data" : "Write: Education details not provided"}

7. LANGUAGES
   - ${langList || "English (Fluent)"}
   ${langList?.toLowerCase().includes("french")
     ? "- HIGHLIGHT French prominently — major competitive advantage in Quebec, Ottawa, and federal government positions\n   - Format: French — [level] | English — [level]"
     : "- Format: Language — Level (e.g. Spanish — Native | English — Professional)"}

${certTexto ? `8. CERTIFICATIONS\n   - ${certTexto}\n   - Format: Certification Name | Issuing Organization | Year` : ""}

ATS OPTIMIZATION:
- Use standard section headers — ATS may not recognize creative names
- Mirror exact keywords from job title: ${puesto}
- Avoid headers/footers — some ATS ignore them
- Single column only

PROVINCE-SPECIFIC NOTES:
${ciudad?.toLowerCase().includes("montreal") || ciudad?.toLowerCase().includes("quebec")
  ? "QUEBEC: French is essential — emphasize French language skills prominently. Many Quebec employers require French for most positions."
  : ciudad?.toLowerCase().includes("ottawa")
  ? "OTTAWA: Federal government hub — bilingualism (EN/FR) is a major competitive advantage. Highlight any French skills."
  : ciudad?.toLowerCase().includes("vancouver") || ciudad?.toLowerCase().includes("bc")
  ? "BC/VANCOUVER: Tech-forward market — highlight GitHub, portfolio, and digital skills prominently."
  : ciudad?.toLowerCase().includes("calgary") || ciudad?.toLowerCase().includes("alberta")
  ? "ALBERTA: Energy, tech and trades sector — highlight technical certifications and safety training."
  : ciudad?.toLowerCase().includes("toronto") || ciudad?.toLowerCase().includes("ontario")
  ? "TORONTO/ONTARIO: Most competitive market — quantify everything, emphasize multicultural teamwork and adaptability."
  : "CANADA (General): Highlight adaptability, multicultural communication, and community involvement."}

LANGUAGE RULES:
- Entire resume MUST be in professional Canadian English regardless of input language
- Translate any Spanish input naturally — do NOT mention translation was made
- Keep proper nouns as-is (company names, cities, certification names)
${langList?.toLowerCase().includes("french")
  ? "- User speaks French — add a brief French version of the Professional Summary at the very end, labeled 'RÉSUMÉ PROFESSIONNEL' (3-4 lines maximum)"
  : ""}

CULTURAL NOTES FOR CANADIAN MARKET:
- Canadian employers value collaboration over individual achievement
- Multicultural background is an asset — frame it positively
- Community involvement (volunteer work) demonstrates integration
- Avoid overly aggressive US-style language — balance achievement with teamwork

Generate ONLY the resume. No explanations. No comments. Section headers in ALL CAPS.`;
}

export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting ──
    const { blocked, limit, remaining } = await isRateLimited(generateLimiter, getIP(req));
    if (blocked) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Espera un momento e intenta de nuevo." },
        { status: 429, headers: { "X-RateLimit-Limit": limit.toString(), "X-RateLimit-Remaining": remaining.toString() } },
      );
    }

    const rawBody = await req.json();

    // ── Validate & sanitize ──
    const parseResult = generateSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Datos inválidos. Verifica los campos e intenta de nuevo." }, { status: 400 });
    }
    const body = parseResult.data;

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
      ? rawLangs.map(l => `${l.language} (${l.level})`).join(", ")
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

    const { editSlug, userId, vacante: _vacante, ...formDataToStore } = body;
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