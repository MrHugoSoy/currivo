import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";

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

function buildPrompt(data: Record<string, string>): string {
  const { nombre, puesto, ciudad, email, ultimoPuesto, empresa, descripcion, tono, industria, mercado, edad, estadoCivil, voluntariado, languages } = data;
  const langList = languages;

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
- Último puesto: ${ultimoPuesto || "No especificado"}
- Empresa: ${empresa || "No especificada"}
- Actividades: ${descripcion}
- Tono: ${tono} — ${toneDesc[tono] || tono}
- Industria: ${industria}
${languages ? `- Idiomas: ${languages}` : ""}

REGLAS PARA CV MEXICANO:
- Incluye sección de DATOS PERSONALES al inicio (nombre, ciudad, email, edad si se dio, estado civil si se dio)
- Incluye OBJETIVO PROFESIONAL (2-3 líneas)
- Sección EXPERIENCIA LABORAL con logros concretos
- Sección HABILIDADES relevantes para ${industria}
- Sección EDUCACIÓN (genera algo plausible si no se proporcionó)
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
- Last Position: ${ultimoPuesto || "Not specified"}
- Company: ${empresa || "Not specified"}
- Work Description: ${descripcion}
- Tone: ${tono} — ${toneDesc[tono] || tono}
- Industry: ${industria}

US RESUME RULES (CRITICAL):
- NO photo, NO age, NO marital status, NO nationality — these are illegal to include
- Maximum 1 page
- Start with a strong PROFESSIONAL SUMMARY (2-3 lines)
- EXPERIENCE section: use bullet points with quantified achievements ("Increased sales by 40%", "Managed team of 8")
- Use strong action verbs: Led, Developed, Implemented, Optimized, Delivered, Achieved...
- SKILLS section with ATS-friendly keywords for ${industria}
- EDUCATION section
- Include LinkedIn and location (City, State) but NOT full address
- Use American English

Generate ONLY the resume content, no additional comments.`;
  }

  // ── CANADÁ ───────────────────────────────────────────────
  return `You are a Canadian resume expert specializing in helping immigrants and international professionals land jobs in Canada. You know exactly what Canadian recruiters and ATS systems look for.

Generate a professional Canadian resume in English with this information:

Name: ${nombre}
Target Position: ${puesto}
Location: ${ciudad || "Canada"}
Email: ${email || "Not specified"}
Last Position: ${ultimoPuesto || "Not specified"}
Company: ${empresa || "Not specified"}
Work Description: ${descripcion}
Volunteer Work: ${voluntariado || "Not specified"}
Languages: ${langList || "English (Fluent)"}
Tone: ${tono} — ${toneDesc[tono] || tono}
Industry: ${industria}

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
   - Relevant to ${industria} and ${puesto}
   - Include both technical and soft skills
   Example format:
   Brand Strategy | Team Leadership | Project Management
   Client Relations | Adobe Suite | Budget Planning
   Cross-cultural Communication | Bilingual | Agile

4. PROFESSIONAL EXPERIENCE
   - Reverse chronological order
   - Format: Job Title | Company Name | City, Province | Month Year – Month Year
   - 3-5 bullet points per position
   - EVERY bullet must start with a strong past-tense action verb
   - EVERY bullet must follow: Context + Action + Result format
   - QUANTIFY everything possible: numbers, %, $, team sizes, timelines
   - Bad example: "Managed social media accounts"
   - Good example: "Grew Instagram following from 2K to 18K in 8 months, increasing engagement rate by 340% and driving 25% more website traffic"
   - Highlight collaboration, leadership and cross-cultural work

5. VOLUNTEER WORK (very important in Canada)
   - Shows community integration — critical for immigrants
   - Format: Role | Organization | City | Dates
   - 1-2 bullet points with impact
   - If volunteer work was provided use it, otherwise generate a plausible entry relevant to ${industria} and ${ciudad}

6. EDUCATION
   - Degree | Institution | Year
   - Add: "International credential — equivalent to Canadian Bachelor's Degree"
   - Add: "Evaluated by WES (World Education Services)" if applicable
   - Include relevant coursework or honors if space allows

7. LANGUAGES
   - List all provided languages with levels
   ${langList ? `Languages to include: ${langList}` : ""}
   - If French is listed, add note about advantage in Quebec/Ottawa/federal government positions
   - Format: Language — Level (e.g. French — Advanced B2)

8. CERTIFICATIONS (if relevant)
   - Only include if directly relevant to ${puesto}

ATS OPTIMIZATION RULES:
- Use standard section headers (Experience, Education, Skills)
- No tables, no text boxes, no columns
- Dates format: Jan 2020 – Mar 2023
- Spell out abbreviations at first use
- Mirror exact keywords from ${puesto} job title

CANADIAN SOFT SKILLS TO EMPHASIZE:
- Collaboration and teamwork in multicultural environments
- Adaptability and cultural awareness
- Community involvement
- Clear written and verbal communication
- Initiative and problem-solving

PROVINCE-SPECIFIC NOTES:
${ciudad?.toLowerCase().includes('montreal') || ciudad?.toLowerCase().includes('quebec')
  ? '- Quebec position: Emphasize French language skills prominently. Many Quebec employers require French. Consider noting willingness to work in French.'
  : ciudad?.toLowerCase().includes('ottawa')
  ? '- Ottawa position: Federal government hub — bilingualism (EN/FR) is a major asset. Emphasize any government or public sector experience.'
  : ciudad?.toLowerCase().includes('vancouver') || ciudad?.toLowerCase().includes('bc')
  ? '- BC/Vancouver position: Tech-forward market. Include GitHub, portfolio links, and any tech certifications prominently.'
  : ciudad?.toLowerCase().includes('calgary') || ciudad?.toLowerCase().includes('alberta')
  ? '- Alberta position: Energy and tech sector. Highlight any oil & gas, engineering or technical certifications.'
  : '- General Canada: Highlight adaptability and multicultural communication skills.'}

Generate ONLY the resume content.
No explanations, no comments, no preamble.
Use plain text formatting with clear section headers in ALL CAPS.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, puesto, descripcion } = body;

    if (!nombre || !puesto || !descripcion) {
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

    const slug = generateSlug(nombre);
    const { photoUrl: _photo, ...formDataToStore } = body;

    await supabase.from("cvs").insert({
      slug,
      nombre,
      puesto,
      ciudad: body.ciudad || null,
      email: body.email || null,
      mercado: body.mercado,
      cv_text: cv,
      form_data: { ...formDataToStore, languages: langStr || undefined },
    });

    return NextResponse.json({ cv, slug });
  } catch (error) {
    console.error("Error generating CV:", error);
    return NextResponse.json({ error: "Error al generar el CV. Intenta de nuevo." }, { status: 500 });
  }
}
