import { z } from "zod";

const MAX_SHORT  = 100;
const MAX_MEDIUM = 300;
const MAX_LONG   = 1000;
const MAX_VACANTE = 3000;

function sanitize(str: string): string {
  return str
    .replace(/[<>]/g, "")
    .replace(/\{\{.*?\}\}/g, "")
    .replace(/ignore previous instructions/gi, "")
    .replace(/system prompt/gi, "")
    .replace(/you are now/gi, "")
    .trim();
}

export const generateSchema = z.object({
  nombre:        z.string().min(2).max(MAX_SHORT).transform(sanitize),
  puesto:        z.string().min(2).max(MAX_SHORT).transform(sanitize),
  ciudad:        z.string().max(MAX_SHORT).optional().transform(v => v ? sanitize(v) : v),
  email:         z.string().email().max(MAX_SHORT).optional().or(z.literal("")),
  telefono:      z.string().max(30).optional().transform(v => v ? sanitize(v) : v),
  tono:          z.string().max(50).optional(),
  industria:     z.string().max(50).optional(),
  mercado:       z.enum(["mx", "us", "ca"]),
  edad:          z.string().max(20).optional(),
  estadoCivil:   z.string().max(30).optional(),
  disponibilidad: z.string().max(30).optional(),
  voluntariado:  z.string().max(MAX_LONG).optional().transform(v => v ? sanitize(v) : v),
  vacante:       z.string().max(MAX_VACANTE).optional().transform(v => v ? sanitize(v) : v),
  certificaciones: z.array(z.object({
    nombre:      z.string().max(MAX_SHORT).transform(sanitize),
    institucion: z.string().max(MAX_SHORT).optional().transform(v => v ? sanitize(v) : v),
    anio:        z.string().max(10).optional(),
  })).optional(),
  experiencias: z.array(z.object({
    puesto:      z.string().max(MAX_SHORT).transform(sanitize),
    empresa:     z.string().max(MAX_SHORT).transform(sanitize),
    periodo:     z.string().max(50).optional(),
    descripcion: z.string().max(MAX_LONG).transform(sanitize),
  })).max(10).optional(),
  educacion: z.array(z.object({
    carrera:     z.string().max(MAX_MEDIUM).transform(sanitize),
    institucion: z.string().max(MAX_MEDIUM).transform(sanitize),
    anio:        z.string().max(10).optional(),
  })).max(5).optional(),
  habilidades:   z.array(z.string().max(50).transform(sanitize)).max(30).optional(),
  redesSociales: z.array(z.object({
    tipo: z.string().max(30),
    url:  z.string().url().max(200).or(z.literal("")),
  })).max(10).optional(),
  languages: z.array(z.object({
    language: z.string().max(50),
    level:    z.string().max(30),
  })).max(10).optional(),
  templateId:      z.string().max(30).optional(),
  sinExperiencia:  z.boolean().optional(),
  anosExperiencia: z.string().max(10).optional(),
  editSlug:        z.string().max(50).optional(),
  userId:          z.string().uuid().optional(),
});

export type GenerateInput = z.infer<typeof generateSchema>;
