import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildPrompt(data: Record<string, string>): string {
  const { nombre, puesto, ciudad, email, ultimoPuesto, empresa, descripcion, tono, industria, mercado, edad, estadoCivil, voluntariado } = data;

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
  return `Eres un experto redactor de CVs/resumes para el mercado laboral canadiense.

Genera un resume profesional en inglés (Canadian English) con esta información:
- Name: ${nombre}
- Target Position: ${puesto}
- Location: ${ciudad || "Not specified"}
- Email: ${email || "Not specified"}
- Last Position: ${ultimoPuesto || "Not specified"}
- Company: ${empresa || "Not specified"}
- Work Description: ${descripcion}
- Volunteer Experience: ${voluntariado || "Not specified"}
- Tone: ${tono} — ${toneDesc[tono] || tono}
- Industry: ${industria}

CANADIAN RESUME RULES:
- NO photo, NO age, NO marital status — never include these
- 1-2 pages acceptable
- Start with PROFESSIONAL SUMMARY emphasizing collaborative skills
- EXPERIENCE section: bullet points with quantified results AND emphasis on teamwork and communication
- VOLUNTEER WORK section is important — include if provided, generate plausible entry if not
- SKILLS section — include both technical and soft skills (communication, teamwork, adaptability)
- EDUCATION section
- If applicable, note language skills (English/French bilingualism is a strong asset in Canada)
- Use Canadian English spellings (colour, centre, etc.)

Generate ONLY the resume content, no additional comments.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, puesto, descripcion } = body;

    if (!nombre || !puesto || !descripcion) {
      return NextResponse.json({ error: "Faltan campos obligatorios." }, { status: 400 });
    }

    const prompt = buildPrompt(body);

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const cv = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map(b => b.text)
      .join("\n");

    return NextResponse.json({ cv });
  } catch (error) {
    console.error("Error generating CV:", error);
    return NextResponse.json({ error: "Error al generar el CV. Intenta de nuevo." }, { status: 500 });
  }
}
