export interface CVSection {
  title: string;
  items: CVItem[];
}

export interface CVItem {
  type: "paragraph" | "bullet" | "job" | "education";
  title?: string;
  subtitle?: string;
  date?: string;
  location?: string;
  content?: string;
  bullets?: string[];
}

function isAllCaps(line: string): boolean {
  const letters = line.replace(/[^a-zA-ZÀ-ÿ]/g, "");
  return letters.length >= 2 && letters === letters.toUpperCase();
}

function isBullet(line: string): boolean {
  return /^[•·▸►\-\*]\s/.test(line) || /^\d+[.)]\s/.test(line);
}

function cleanBullet(line: string): string {
  return line.replace(/^[•·▸►\-\*]\s*/, "").replace(/^\d+[.)]\s*/, "").trim();
}

function isJobLine(line: string): boolean {
  return line.includes(" | ") && line.split(" | ").length >= 2 && !isBullet(line);
}

const DATE_RE =
  /\b(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?\d{4}\s*[–\-]\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?(?:\d{4}|Present|Presente|Actual|Current)\b/i;

function extractDate(s: string): string | undefined {
  const m = s.match(DATE_RE);
  return m ? m[0] : undefined;
}

export function parseCVText(text: string): CVSection[] {
  if (!text || typeof text !== "string") return [];

  const sections: CVSection[] = [];
  let current: CVSection | null = null;
  let lastJob: CVItem | null = null;

  function pushJob() {
    if (lastJob && current) {
      current.items.push({ ...lastJob, bullets: [...(lastJob.bullets ?? [])] });
      lastJob = null;
    }
  }

  for (const raw of text.split("\n")) {
    const line = raw.trim();

    if (!line) {
      pushJob();
      continue;
    }

    if (isAllCaps(line) && !isJobLine(line)) {
      pushJob();
      current = { title: line, items: [] };
      sections.push(current);
      continue;
    }

    if (!current) {
      current = { title: "", items: [] };
      sections.push(current);
    }

    if (isJobLine(line)) {
      pushJob();
      const parts = line.split(" | ").map((p) => p.trim());
      let location: string | undefined;
      let date: string | undefined;
      for (const part of parts.slice(2)) {
        if (DATE_RE.test(part)) date = part;
        else if (!location) location = part;
      }
      lastJob = {
        type: "job",
        title: parts[0],
        subtitle: parts[1],
        location,
        date,
        bullets: [],
      };
      continue;
    }

    if (isBullet(line)) {
      const content = cleanBullet(line);
      if (lastJob) {
        (lastJob.bullets ??= []).push(content);
      } else {
        current.items.push({ type: "bullet", content });
      }
      continue;
    }

    pushJob();
    current.items.push({ type: "paragraph", content: line });
  }

  pushJob();
  return sections.filter((s) => s.title || s.items.length > 0);
}

export function extractHeader(cvText: string): {
  name: string;
  subtitle: string;
  contacts: string[];
} {
  const result = { name: "", subtitle: "", contacts: [] as string[] };
  for (const raw of cvText.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (isAllCaps(line) && !isJobLine(line) && line.length > 2) break;
    if (!result.name) {
      result.name = line;
    } else if (
      !result.subtitle &&
      !line.includes("@") &&
      !line.includes("·") &&
      !line.includes("📍") &&
      !line.includes("☎") &&
      !line.includes("✉")
    ) {
      result.subtitle = line;
    } else {
      result.contacts.push(...line.split("·").map((c) => c.trim()).filter(Boolean));
    }
  }
  return result;
}

export function extractSkills(sections: CVSection[]): string[] {
  const skillSection = sections.find((s) =>
    /skill|habilidad|competenc|core/i.test(s.title)
  );
  if (!skillSection) return [];
  const raw = skillSection.items
    .filter((i) => i.type === "paragraph")
    .map((i) => i.content ?? "")
    .join(" | ");
  return raw
    .split(/[|,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function extractLanguages(sections: CVSection[]): string[] {
  const langSection = sections.find((s) =>
    /language|idioma|langue/i.test(s.title)
  );
  if (!langSection) return [];
  return langSection.items
    .filter((i) => i.type === "paragraph")
    .map((i) => i.content ?? "")
    .flatMap((s) => s.split(/[|,]/).map((l) => l.trim()))
    .filter(Boolean);
}

function hashNum(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function skillLevel(skill: string): number {
  return 72 + (hashNum(skill) % 27);
}
