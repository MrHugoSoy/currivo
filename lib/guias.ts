import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface GuiaFrontmatter {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  country: "mexico" | "canada" | "usa";
  ogImage?: string;
  keywords: string[];
  featured?: boolean;
}

export interface Guia extends GuiaFrontmatter {
  content: string;
}

export const CATEGORIES: Record<string, string> = {
  "formato-cv":      "Formato de CV",
  "por-ciudad":      "Por Ciudad",
  "via-migratoria":  "Vía Migratoria",
  "mercado-laboral": "Mercado Laboral",
  "entrevistas":     "Entrevistas",
};

export const COUNTRY_LABELS: Record<string, string> = {
  mexico: "México",
  canada: "Canadá",
  usa:    "EE.UU.",
};

export const COUNTRY_FLAGS: Record<string, string> = {
  mexico: "🇲🇽",
  canada: "🇨🇦",
  usa:    "🇺🇸",
};

const CONTENT_DIR = path.join(process.cwd(), "content", "guias");

function readFrontmatter(file: string): GuiaFrontmatter {
  const source = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
  const { data } = matter(source);
  return data as GuiaFrontmatter;
}

export function getAllGuias(): GuiaFrontmatter[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));
  return files
    .map(readFrontmatter)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getGuia(slug: string): Guia | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const source = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(source);
  return { ...(data as GuiaFrontmatter), content };
}

export function getGuiasByCategory(category: string): GuiaFrontmatter[] {
  return getAllGuias().filter((g) => g.category === category);
}

export function getFeaturedGuias(limit = 4): GuiaFrontmatter[] {
  return getAllGuias().filter((g) => g.featured).slice(0, limit);
}

export function getRelatedGuias(slug: string, category: string, country: string, limit = 3): GuiaFrontmatter[] {
  const all = getAllGuias().filter((g) => g.slug !== slug);
  const sameCategory = all.filter((g) => g.category === category);
  const sameCountry = all.filter((g) => g.country === country && g.category !== category);
  return [...sameCategory, ...sameCountry].slice(0, limit);
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getAllCategoryValues(): string[] {
  return [...new Set(getAllGuias().map((g) => g.category))];
}

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function extractTOC(content: string): TOCItem[] {
  const items: TOCItem[] = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    items.push({ id: slugifyHeading(text), text, level });
  }
  return items;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
