export interface CVSection {
  title: string;
  items: CVItem[];
}

export interface CVItem {
  type: "paragraph" | "bullet" | "job" | "education" | "skills";
  title?: string;
  subtitle?: string;
  date?: string;
  location?: string;
  content?: string;
  bullets?: string[];
}

function isAllCaps(line: string): boolean {
  const letters = line.replace(/[^a-zA-ZÀ-ÿ]/g, "");
  // Require at least 4 letters to exclude short abbreviations like MBA, GTO, CV
  if (letters.length < 4) return false;
  return letters === letters.toUpperCase();
}

function isBullet(line: string): boolean {
  return /^[•·▸►\-\*]\s/.test(line) || /^\d+[.)]\s/.test(line);
}

function cleanBullet(line: string): string {
  return line.replace(/^[•·▸►\-\*]\s*/, "").replace(/^\d+[.)]\s*/, "").trim();
}

// Matches date ranges with optional month name prefix:
// "2020 – 2023", "2020 — 2023", "Jan 2020 – Mar 2023", "Enero 2020 – Marzo 2023"
const DATE_RE =
  /(?:[A-Za-záéíóúüñÁÉÍÓÚÜÑ]{3,}\.?\s+)?\b\d{4}\s*[–—\-]\s*(?:(?:[A-Za-záéíóúüñÁÉÍÓÚÜÑ]{3,}\.?\s+)?\d{4}|Present|Presente|Actual|Actualmente|Current)\b/i;

// Matches a standalone 4-digit year (e.g. education graduation year)
const YEAR_RE = /^\d{4}$/;

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

  const isEduSection = () =>
    current !== null && /educ/i.test(current.title);

  for (const raw of text.split("\n")) {
    const line = raw.trim();

    if (!line) {
      pushJob();
      continue;
    }

    // Section header: all-caps letters, length >= 4 letters
    if (isAllCaps(line) && !isBullet(line)) {
      pushJob();
      current = { title: line, items: [] };
      sections.push(current);
      continue;
    }

    if (!current) {
      current = { title: "", items: [] };
      sections.push(current);
    }

    // Pipe-separated lines: job, education, or skills
    if (line.includes(" | ")) {
      const parts = line.split(" | ").map((p) => p.trim()).filter(Boolean);

      if (parts.length >= 2) {
        // Education section: parse as education entry regardless of content
        if (isEduSection()) {
          pushJob();
          let date: string | undefined;
          let subtitle: string | undefined;
          for (const part of parts.slice(1)) {
            if (!date && (DATE_RE.test(part) || YEAR_RE.test(part.trim()))) {
              date = part.trim();
            } else if (!subtitle) {
              subtitle = part;
            }
          }
          current.items.push({
            type: "education",
            title: parts[0],
            subtitle,
            date,
          });
          continue;
        }

        // Detect whether this is a job line or a skills line:
        // Job lines have a date range; skills lines are all short items with no date
        const hasDateRange = parts.some((p) => DATE_RE.test(p));
        const allShort = parts.every((p) => p.length < 35);

        if (!hasDateRange && allShort) {
          // Skills / competencies line
          pushJob();
          current.items.push({ type: "skills", content: line });
          continue;
        }

        // Job line
        pushJob();
        let date: string | undefined;
        let location: string | undefined;
        for (const part of parts.slice(2)) {
          if (!date && DATE_RE.test(part)) date = part;
          else if (!location) location = part;
        }
        // Fallback: check last part for date range
        if (!date && DATE_RE.test(parts[parts.length - 1])) {
          date = parts[parts.length - 1];
          if (parts.length >= 4) location = parts[2];
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

  const result = sections.filter((s) => s.title || s.items.length > 0);

  // Fallback: if no titled sections were found, return a single plain-text section
  if (result.every((s) => !s.title)) {
    const items = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => ({ type: "paragraph" as const, content: l }));
    return [{ title: "", items }];
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[parseCVText]", JSON.stringify(result, null, 2));
  }

  return result;
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
    if (isAllCaps(line) && !isBullet(line) && line.length > 2) break;
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
      result.contacts.push(
        ...line.split("·").map((c) => c.trim()).filter(Boolean)
      );
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
    .filter((i) => i.type === "paragraph" || i.type === "skills")
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
    .filter((i) => i.type === "paragraph" || i.type === "skills")
    .map((i) => i.content ?? "")
    .flatMap((s) => s.split(/[|,]/).map((l) => l.trim()))
    .filter(Boolean);
}

function hashNum(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++)
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function skillLevel(skill: string): number {
  return 72 + (hashNum(skill) % 27);
}
