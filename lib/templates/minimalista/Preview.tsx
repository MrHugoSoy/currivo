import { parseCVText, extractHeader, extractSkills, CVItem } from "../parser";
import type { CVData } from "../types";

const C = {
  primario: "#1a1814",
  texto: "#4a443c",
  muted: "#8a8278",
  hint: "#b0a89e",
  fondo: "#f7f4ee",
  border: "#ddd7c8",
};

export default function MinimalistaPreview({ data }: { data: CVData }) {
  const sections = parseCVText(data.cv_text);
  const hdr = extractHeader(data.cv_text);
  const name = hdr.name || data.nombre;
  const subtitle = hdr.subtitle || data.puesto;
  const contacts = hdr.contacts.length
    ? hdr.contacts
    : [data.ciudad, data.email].filter(Boolean) as string[];
  const skills = extractSkills(sections);
  const main = sections.filter((s) => s.title !== "");

  return (
    <div style={{ width: 680, background: C.fondo, fontFamily: "'DM Sans','Nunito Sans',sans-serif", color: C.texto, fontSize: 12, lineHeight: 1.8, padding: "48px 52px", boxSizing: "border-box" }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 40, fontWeight: 600, color: C.primario, letterSpacing: "0.5px", lineHeight: 1.1 }}>
          {name}
        </div>
        {subtitle && (
          <div style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>{subtitle}</div>
        )}
        {contacts.length > 0 && (
          <div style={{ fontSize: 11, color: C.hint, marginTop: 8 }}>
            {contacts.join("  ·  ")}
          </div>
        )}
        <div style={{ height: 1, background: C.border, marginTop: 20 }} />
      </div>

      {main.map((section, idx) => (
        <div key={idx} style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: "1.5px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              {section.title}
            </div>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>
          {section.items.map((item, i) => (
            <MinItem key={i} item={item} isSkillSection={/skill|habilidad|competenc/i.test(section.title)} skills={skills} />
          ))}
        </div>
      ))}
    </div>
  );
}

function MinItem({ item, isSkillSection, skills }: { item: CVItem; isSkillSection: boolean; skills: string[] }) {
  if (item.type === "job") {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontSize: 13, color: C.primario, fontWeight: 500 }}>{item.title}</div>
          {item.date && <div style={{ fontSize: 10, color: C.hint }}>{item.date}</div>}
        </div>
        {(item.subtitle || item.location) && (
          <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
            {[item.subtitle, item.location].filter(Boolean).join(" · ")}
          </div>
        )}
        {item.bullets && item.bullets.length > 0 && (
          <div style={{ marginTop: 5 }}>
            {item.bullets.map((b, i) => (
              <div key={i} style={{ fontSize: 11, color: C.texto, lineHeight: 1.8, paddingLeft: 14, position: "relative" }}>
                <span style={{ position: "absolute", left: 0, color: C.hint }}>–</span>
                {b}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (item.type === "bullet") {
    return (
      <div style={{ fontSize: 11, color: C.texto, lineHeight: 1.8, paddingLeft: 14, position: "relative", marginBottom: 2 }}>
        <span style={{ position: "absolute", left: 0, color: C.hint }}>–</span>
        {item.content}
      </div>
    );
  }

  const content = item.content ?? "";
  if (isSkillSection || content.includes(" | ") || content.split(",").length > 3) {
    const tags = content.split(/[|,]/).map((t) => t.trim()).filter(Boolean);
    return (
      <div style={{ fontSize: 11, color: C.muted, lineHeight: 2 }}>
        {tags.join("  ·  ")}
      </div>
    );
  }

  return <div style={{ fontSize: 11, color: C.texto, lineHeight: 1.8, marginBottom: 4 }}>{content}</div>;
}
